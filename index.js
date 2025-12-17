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
                currentVoteTimes: {}, // New: Track speed
                scores: { red: 0, blue: 0, coop: 0 },
                vipId: null,
                saboteurId: null,
                wordStartTime: 0
            };
        }

        const room = rooms[code];
        
        // OPTION 5: LATE JOIN / SPECTATOR
        // If game is playing, new players are spectators
        const isSpectator = (room.state === 'playing');

        const existing = room.players.find(p => p.id === socket.id);
        if (existing) {
            existing.name = username || 'Player';
            existing.isSpectator = isSpectator; // Update status
        } else {
            room.players.push({ 
                id: socket.id, 
                name: username || 'Player', 
                team: 'neutral',
                score: 0,
                lives: 3,
                isSpectator: isSpectator
            });
        }
        
        emitUpdate(code);
        
        // If joining late, send them the current word immediately so they can watch
        if (isSpectator && room.words[room.round]) {
            socket.emit('gameStarted', { totalRounds: room.maxRounds, mode: room.mode });
            socket.emit('nextWord', { 
                word: room.words[room.round], 
                roundCurrent: room.round + 1, 
                roundTotal: room.maxRounds 
            });
        }
    });

    socket.on('updateSettings', ({ roomCode, mode, rounds }) => {
        const room = rooms[roomCode];
        if (!room || room.host !== socket.id) return;
        if(mode) room.mode = mode;
        if(rounds) room.maxRounds = parseInt(rounds);
        emitUpdate(roomCode);
    });
    
    // OPTION 4: KICK PLAYER
    socket.on('kickPlayer', ({ roomCode, targetId }) => {
        const room = rooms[roomCode];
        if (!room || room.host !== socket.id) return; // Only host
        if (targetId === room.host) return; // Can't kick self

        // Find socket to disconnect
        const targetSocket = io.sockets.sockets.get(targetId);
        if (targetSocket) {
            targetSocket.emit('kicked');
            targetSocket.disconnect(); // Force disconnect
        }
        
        // Remove from list
        const idx = room.players.findIndex(p => p.id === targetId);
        if(idx !== -1) room.players.splice(idx, 1);
        
        emitUpdate(roomCode);
    });

    socket.on('startGame', async ({ roomCode }) => {
        const room = rooms[roomCode];
        if (!room || room.host !== socket.id) return;

        room.state = 'playing';
        room.round = 0;
        room.currentVotes = {};
        room.currentVoteTimes = {};
        room.scores = { red: 0, blue: 0, coop: 0 };
        room.vipId = null;
        room.saboteurId = null;

        // Reset All Players (Clear Spectator Status)
        room.players.forEach(p => {
            p.lives = 3;
            p.isSpectator = false; // Everyone in lobby plays
            p.score = 0; // Optional: Reset scores per game?
        });

        // Setup Teams/Roles
        if (room.mode === 'versus') {
            const shuffled = shuffle([...room.players]);
            shuffled.forEach((p, i) => {
                const op = room.players.find(rp => rp.id === p.id);
                if(op) op.team = (i % 2 === 0) ? 'red' : 'blue';
            });
        }
        else if (room.mode === 'vip') {
            const r = room.players[Math.floor(Math.random() * room.players.length)];
            room.vipId = r.id;
        }
        else if (room.mode === 'saboteur') {
            const r = room.players[Math.floor(Math.random() * room.players.length)];
            room.saboteurId = r.id;
            io.to(room.saboteurId).emit('roleAlert', 'You are the SABOTEUR! Try to make the room fail.');
        }

        emitUpdate(roomCode);

        try {
            const randomWords = await Word.aggregate([{ $sample: { size: room.maxRounds } }]);
            room.words = randomWords;

            io.to(roomCode).emit('gameStarted', { 
                totalRounds: room.maxRounds, 
                mode: room.mode,
                vipId: room.vipId
            });
            
            setTimeout(() => sendNextWord(roomCode), 6000);
        } catch (e) { console.error(e); }
    });

    socket.on('submitVote', ({ roomCode, vote }) => {
        const room = rooms[roomCode];
        if (!room || room.state !== 'playing') return;

        const player = room.players.find(p => p.id === socket.id);
        // Spectators & Dead players can't vote
        if (!player || player.isSpectator) return;
        if (room.mode === 'survival' && player.lives <= 0) return;

        room.currentVotes[socket.id] = vote;
        room.currentVoteTimes[socket.id] = Date.now(); // Record Time
        
        io.to(roomCode).emit('playerVoted', { playerId: socket.id });

        const activePlayers = room.players.filter(p => !p.isSpectator && (room.mode !== 'survival' || p.lives > 0));

        if (Object.keys(room.currentVotes).length >= activePlayers.length) {
            finishRound(roomCode);
        }
    });

    socket.on('disconnect', () => {
        for (const code in rooms) {
            const room = rooms[code];
            const idx = room.players.findIndex(p => p.id === socket.id);
            if (idx !== -1) {
                const wasHost = (room.host === socket.id);
                room.players.splice(idx, 1); 

                if (room.players.length === 0) {
                    delete rooms[code];
                } else {
                    if (wasHost) room.host = room.players[0].id;
                    emitUpdate(code);
                }
            }
        }
    });
});

function emitUpdate(code) {
    if (!rooms[code]) return;
    io.to(code).emit('roomUpdate', {
        players: rooms[code].players,
        host: rooms[code].host,
        mode: rooms[code].mode,
        maxRounds: rooms[code].maxRounds,
        state: rooms[code].state
    });
}

function sendNextWord(roomCode) {
    const room = rooms[roomCode];
    if (!room) return;

    if (room.mode === 'survival') {
        const alive = room.players.filter(p => !p.isSpectator && p.lives > 0);
        if (alive.length <= 1 && room.players.length > 1) {
            io.to(roomCode).emit('gameOver', { 
                scores: room.scores, 
                mode: room.mode, 
                rankings: room.players.sort((a,b)=>b.score - a.score),
                specialRoleId: room.vipId || room.saboteurId // OPTION 1: Reveal
            });
            return;
        }
    }

    if (room.round >= room.words.length) {
        const rankings = [...room.players].sort((a,b) => b.score - a.score);
        io.to(roomCode).emit('gameOver', { 
            scores: room.scores, 
            mode: room.mode, 
            rankings,
            specialRoleId: room.vipId || room.saboteurId // OPTION 1: Reveal
        });
        return;
    }

    const word = room.words[room.round];
    room.currentVotes = {};
    room.currentVoteTimes = {};
    room.wordStartTime = Date.now();
    
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
    
    const getMajority = (voteList) => {
        const g = voteList.filter(x => x === 'good').length;
        const b = voteList.filter(x => x === 'bad').length;
        if (g > b) return 'good';
        if (b > g) return 'bad';
        return 'draw';
    };

    let resultData = {};

    if (room.mode === 'versus') {
        const redM = room.players.filter(p => p.team === 'red' && !p.isSpectator);
        const blueM = room.players.filter(p => p.team === 'blue' && !p.isSpectator);
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
        
        let msgExt = "";

        if (rSync > bSync) room.scores.red++;
        else if (bSync > rSync) room.scores.blue++;
        else {
            // OPTION 8: SPEED TIE BREAKER
            // Calculate average time
            const getAvg = (members) => {
                let total = 0;
                let count = 0;
                members.forEach(p => {
                    if(room.currentVoteTimes[p.id]) {
                        total += (room.currentVoteTimes[p.id] - room.wordStartTime);
                        count++;
                    }
                });
                return count ? total/count : 999999;
            };

            const rTime = getAvg(redM);
            const bTime = getAvg(blueM);

            if (rTime < bTime) {
                room.scores.red++;
                msgExt = "(Red Faster!)";
            } else if (bTime < rTime) {
                room.scores.blue++;
                msgExt = "(Blue Faster!)";
            }
        }

        // Individual Scores
        const rMaj = getMajority(redV);
        const bMaj = getMajority(blueV);
        room.players.forEach(p => {
            const v = votes[p.id];
            if(p.team === 'red' && v === rMaj) p.score++;
            if(p.team === 'blue' && v === bMaj) p.score++;
        });
        resultData = { redSync: rSync, blueSync: bSync, msg: msgExt ? `Tie Break! ${msgExt}` : null };

    } else {
        // ... (Other modes logic matches previous turn, but simplified here for brevity)
        const allVotes = Object.values(votes);
        const maj = getMajority(allVotes);
        
        // --- LOGIC FOR SCORING (Same as before) ---
        if(room.mode === 'saboteur') {
             const g = allVotes.filter(x => x === 'good').length;
             const b = allVotes.filter(x => x === 'bad').length;
             const sync = Math.round((Math.max(g, b) / allVotes.length) * 100);
             if (sync === 100) room.players.forEach(p => { if (p.id !== room.saboteurId && !p.isSpectator) p.score += 2; });
             else { const s = room.players.find(p=>p.id===room.saboteurId); if(s) s.score+=3; }
             resultData = { msg: sync===100 ? "100% Sync! Saboteur Failed." : `Sync Broken (${sync}%)! Saboteur Wins.` };
        } else if (room.mode === 'survival') {
             if (maj !== 'draw') {
                room.players.forEach(p => {
                    if (p.lives > 0 && !p.isSpectator) {
                        const v = votes[p.id];
                        if (v && v !== maj) p.lives--;
                        else if (v === maj) p.score++;
                    }
                });
             }
             resultData = { msg: `Majority: ${maj.toUpperCase()}` };
        } else {
             // CO-OP
             const g = allVotes.filter(x => x === 'good').length;
             const b = allVotes.filter(x => x === 'bad').length;
             const sync = Math.round((Math.max(g, b) / allVotes.length) * 100);
             if (sync >= 100) room.scores.coop += 1;
             room.players.forEach(p => { if (votes[p.id] === maj && !p.isSpectator) p.score++; });
             resultData = { sync, score: room.scores.coop };
        }
    }

    io.to(roomCode).emit('roundResult', {
        mode: room.mode,
        data: resultData,
        word: currentWord.text,
        players: room.players,
        votes: votes // OPTION 2: Send votes for reveal
    });

    room.round++;
    // SLOWER PACING: 3 Seconds to see the visual reveal
    setTimeout(() => sendNextWord(roomCode), 3000);
}

app.get('/api/words/all', async (req, res) => { try { res.json(await Word.find().sort({ createdAt: -1 })); } catch (e) { res.json([]); } });
app.get('/api/words', async (req, res) => { try { res.json(await Word.aggregate([{ $sample: { size: 1 } }])); } catch (e) { res.json({message:"Error"}); } });
// ... rest matches previous ...
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server on ${PORT}`));
