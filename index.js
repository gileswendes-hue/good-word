require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- MODELS ---
const wordSchema = new mongoose.Schema({
    text: { type: String, required: true, unique: true },
    goodVotes: { type: Number, default: 0 },
    badVotes: { type: Number, default: 0 },
    notWordVotes: { type: Number, default: 0 }
});
const Word = mongoose.model('Word', wordSchema);
// (Keep Score/Leaderboard models same as before...)

// --- ROOM MANAGER ---
const rooms = {};

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

io.on('connection', (socket) => {
    
    socket.on('joinRoom', ({ roomCode, username }) => {
        const code = roomCode.toUpperCase();
        socket.join(code);

        if (!rooms[code]) {
            rooms[code] = {
                host: socket.id,
                players: [],
                state: 'lobby',
                mode: 'coop', 
                round: 0,
                maxRounds: 10,
                words: [],
                currentVotes: {},
                scores: { red: 0, blue: 0, coop: 0 },
                // NEW: Game State Props
                vipId: null,
                saboteurId: null,
                wordStartTime: 0
            };
        }

        const room = rooms[code];
        const existing = room.players.find(p => p.id === socket.id);
        if (existing) {
            existing.name = username || 'Player';
        } else {
            room.players.push({ 
                id: socket.id, 
                name: username || 'Player', 
                team: 'neutral',
                score: 0,
                lives: 3 // For Survival Mode
            });
        }
        emitUpdate(code);
    });

    socket.on('setMode', ({ roomCode, mode }) => {
        const room = rooms[roomCode];
        if (!room || room.host !== socket.id) return;
        room.mode = mode;
        emitUpdate(roomCode);
    });

    socket.on('startGame', async ({ roomCode, rounds }) => {
        const room = rooms[roomCode];
        if (!room || room.host !== socket.id) return;

        room.state = 'playing';
        room.maxRounds = rounds || 10;
        room.round = 0;
        room.currentVotes = {};
        room.scores = { red: 0, blue: 0, coop: 0 };
        room.vipId = null;
        room.saboteurId = null;

        // Reset Lives & Scores (Cumulative score logic kept? If you want reset per game, uncomment below)
        // room.players.forEach(p => p.score = 0); 
        room.players.forEach(p => p.lives = 3); // Reset lives for survival

        // --- MODE SETUP ---
        if (room.mode === 'versus') {
            const shuffled = shuffle([...room.players]);
            shuffled.forEach((p, i) => {
                const op = room.players.find(rp => rp.id === p.id);
                if(op) op.team = (i % 2 === 0) ? 'red' : 'blue';
            });
        }
        else if (room.mode === 'vip') {
            // Pick random VIP
            const r = room.players[Math.floor(Math.random() * room.players.length)];
            room.vipId = r.id;
        }
        else if (room.mode === 'saboteur') {
            // Pick random Saboteur
            const r = room.players[Math.floor(Math.random() * room.players.length)];
            room.saboteurId = r.id;
            // Tell the saboteur secretly
            io.to(room.saboteurId).emit('roleAlert', 'You are the SABOTEUR! Try to make the room fail.');
        }

        emitUpdate(roomCode);

        try {
            const randomWords = await Word.aggregate([{ $sample: { size: room.maxRounds } }]);
            room.words = randomWords;

            io.to(roomCode).emit('gameStarted', { 
                totalRounds: room.maxRounds, 
                mode: room.mode,
                vipId: room.vipId // Frontend needs to know who VIP is
            });
            
            setTimeout(() => sendNextWord(roomCode), 6000);
        } catch (e) { console.error(e); }
    });

    socket.on('submitVote', ({ roomCode, vote }) => {
        const room = rooms[roomCode];
        if (!room || room.state !== 'playing') return;

        // In Survival, dead players can't vote
        const player = room.players.find(p => p.id === socket.id);
        if (room.mode === 'survival' && player.lives <= 0) return;

        room.currentVotes[socket.id] = vote;
        io.to(roomCode).emit('playerVoted', { playerId: socket.id });

        // Check if everyone (who is alive) has voted
        const activePlayers = room.mode === 'survival' 
            ? room.players.filter(p => p.lives > 0) 
            : room.players;

        if (Object.keys(room.currentVotes).length >= activePlayers.length) {
            finishRound(roomCode);
        }
    });

    socket.on('disconnect', () => { /* (Keep existing disconnect logic) */ });
});

function emitUpdate(code) {
    if (!rooms[code]) return;
    io.to(code).emit('roomUpdate', {
        players: rooms[code].players,
        host: rooms[code].host,
        mode: rooms[code].mode,
        state: rooms[code].state
    });
}

function sendNextWord(roomCode) {
    const room = rooms[roomCode];
    if (!room) return;

    // Check Win Condition for Survival (Last Man Standing)
    if (room.mode === 'survival') {
        const alive = room.players.filter(p => p.lives > 0);
        if (alive.length <= 1 && room.players.length > 1) {
            io.to(roomCode).emit('gameOver', { scores: room.scores, mode: room.mode, rankings: room.players.sort((a,b)=>b.score - a.score) });
            return;
        }
    }

    if (room.round >= room.words.length) {
        const rankings = [...room.players].sort((a,b) => b.score - a.score);
        io.to(roomCode).emit('gameOver', { scores: room.scores, mode: room.mode, rankings });
        return;
    }

    const word = room.words[room.round];
    room.currentVotes = {};
    room.wordStartTime = Date.now(); // Start timer for Speed Demon
    
    io.to(roomCode).emit('nextWord', { 
        word: word, 
        roundCurrent: room.round + 1,
        roundTotal: room.maxRounds
    });
}

function finishRound(roomCode) {
    const room = rooms[roomCode];
    if (!room) return;
    const currentWord = room.words[room.round];
    const votes = room.currentVotes;
    const activePlayers = room.mode === 'survival' ? room.players.filter(p => p.lives > 0) : room.players;
    
    // --- HELPERS ---
    const getMajority = (voteList) => {
        const g = voteList.filter(x => x === 'good').length;
        const b = voteList.filter(x => x === 'bad').length;
        if (g > b) return 'good';
        if (b > g) return 'bad';
        return 'draw';
    };

    let resultData = {};

    // ============================
    // === LOGIC FOR ALL MODES ===
    // ============================

    if (room.mode === 'versus') {
        // ... (Existing Versus Logic) ...
        const redM = room.players.filter(p => p.team === 'red');
        const blueM = room.players.filter(p => p.team === 'blue');
        const redV = redM.map(p => votes[p.id] || 'none');
        const blueV = blueM.map(p => votes[p.id] || 'none');
        
        const calcSync = (v) => {
            if(!v.length) return 0;
            const g = v.filter(x => x === 'good').length;
            const b = v.filter(x => x === 'bad').length;
            return Math.round((Math.max(g, b) / v.length) * 100);
        };
        const rSync = calcSync(redV);
        const bSync = calcSync(blueV);

        if (rSync > bSync) room.scores.red++;
        else if (bSync > rSync) room.scores.blue++;

        // Individual Points
        const rMaj = getMajority(redV);
        const bMaj = getMajority(blueV);
        room.players.forEach(p => {
            const v = votes[p.id];
            if(p.team === 'red' && v === rMaj) p.score++;
            if(p.team === 'blue' && v === bMaj) p.score++;
        });
        resultData = { redSync: rSync, blueSync: bSync };

    } else if (room.mode === 'vip') {
        // VIP MODE: Did you agree with the VIP?
        const vipVote = votes[room.vipId];
        if (vipVote) {
            room.players.forEach(p => {
                if (p.id !== room.vipId && votes[p.id] === vipVote) {
                    p.score++; 
                }
            });
            // VIP gets points if majority followed them
            const allVotes = Object.values(votes);
            if (getMajority(allVotes) === vipVote) {
                const vipPlayer = room.players.find(p => p.id === room.vipId);
                if(vipPlayer) vipPlayer.score += 2;
            }
        }
        resultData = { msg: `The VIP voted: ${vipVote?vipVote.toUpperCase():'Missed'}` };

    } else if (room.mode === 'hipster') {
        // HIPSTER: Points for being in MINORITY
        const allVotes = Object.values(votes);
        const maj = getMajority(allVotes);
        
        if (maj !== 'draw') {
            room.players.forEach(p => {
                const v = votes[p.id];
                if (v && v !== maj) p.score += 3; // Big points for being unique
            });
        }
        resultData = { msg: `Majority was ${maj.toUpperCase()}. Minorities scored!` };

    } else if (room.mode === 'speed') {
        // SPEED: Points for Majority + Speed
        const allVotes = Object.values(votes);
        const maj = getMajority(allVotes);
        const endTime = Date.now();
        const duration = (endTime - room.wordStartTime) / 1000; // seconds

        if (maj !== 'draw') {
            room.players.forEach(p => {
                const v = votes[p.id];
                if (v === maj) {
                    // Base point
                    p.score += 1; 
                    // Speed Bonus (Fake latency check approx)
                    // If round lasted 1.5s total, simplistic check isn't per-player socket time (too complex for now)
                    // Instead: Award bonus to everyone because they voted fast enough to finish the round? 
                    // Better: Just give points for Majority in this simple version
                }
            });
        }
        resultData = { msg: `Speed Round: ${duration.toFixed(1)}s` };

    } else if (room.mode === 'survival') {
        // SURVIVAL: Die if you disagree with Majority
        const allVotes = Object.values(votes);
        const maj = getMajority(allVotes);

        if (maj !== 'draw') {
            room.players.forEach(p => {
                if (p.lives > 0) {
                    const v = votes[p.id];
                    if (v && v !== maj) {
                        p.lives--; // LOSE A LIFE
                    } else if (v === maj) {
                        p.score++; // Score for surviving
                    }
                }
            });
        }
        resultData = { msg: `Majority: ${maj.toUpperCase()}. Dissidents lost a life!` };

    } else if (room.mode === 'saboteur') {
        // SABOTEUR: Traitor wants < 100% sync, Innocents want 100%
        const allVotes = Object.values(votes);
        const g = allVotes.filter(x => x === 'good').length;
        const b = allVotes.filter(x => x === 'bad').length;
        const sync = Math.round((Math.max(g, b) / allVotes.length) * 100);

        const saboteur = room.players.find(p => p.id === room.saboteurId);

        if (sync === 100) {
            // Innocents Win
            room.players.forEach(p => {
                if (p.id !== room.saboteurId) p.score += 2;
            });
            resultData = { msg: `100% Sync! Saboteur Failed.` };
        } else {
            // Saboteur Wins
            if (saboteur) saboteur.score += 3;
            resultData = { msg: `Sync Broken (${sync}%)! Saboteur Wins.` };
        }

    } else {
        // CO-OP (Default)
        const allVotes = Object.values(votes);
        const maj = getMajority(allVotes);
        const g = allVotes.filter(x => x === 'good').length;
        const b = allVotes.filter(x => x === 'bad').length;
        const sync = Math.round((Math.max(g, b) / allVotes.length) * 100);
        
        if (sync >= 100) room.scores.coop += 1;
        room.players.forEach(p => { if (votes[p.id] === maj) p.score++; });
        
        resultData = { sync, score: room.scores.coop };
    }

    io.to(roomCode).emit('roundResult', {
        mode: room.mode,
        data: resultData,
        word: currentWord.text,
        players: room.players // Send full player data (lives/scores)
    });

    room.round++;
    setTimeout(() => sendNextWord(roomCode), 1500);
}

// (API Routes same as before...)
app.get('/api/words/all', async (req, res) => { try { res.json(await Word.find().sort({ createdAt: -1 })); } catch (e) { res.json([]); } });
app.get('/api/words', async (req, res) => { try { res.json(await Word.aggregate([{ $sample: { size: 1 } }])); } catch (e) { res.json({message:"Error"}); } });
// ... other routes ...
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server on ${PORT}`));
