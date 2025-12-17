require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const fs = require('fs');
const { Server } = require("socket.io");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGODB_URI;

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

if (!MONGO_URI) {
    console.error('FATAL ERROR: MONGODB_URI is not defined.');
} else {
    mongoose.connect(MONGO_URI)
        .then(() => console.log('MongoDB connected successfully.'))
        .catch(err => console.error('FATAL MongoDB connection error:', err));
}

const wordSchema = new mongoose.Schema({
    text: { type: String, required: true, unique: true, trim: true, lowercase: true },
    goodVotes: { type: Number, default: 0 },
    badVotes: { type: Number, default: 0 },
    notWordVotes: { type: Number, default: 0 },
    voters: [{ type: String }]
}, { timestamps: true });
const Word = mongoose.model('Word', wordSchema);

const scoreSchema = new mongoose.Schema({
    name: { type: String, required: true, maxlength: 3 },
    score: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    userId: String
});
const Score = mongoose.model('Score', scoreSchema);

const leaderboardSchema = new mongoose.Schema({ userId: { type: String, unique: true }, username: String, voteCount: { type: Number, default: 0 }, lastUpdated: { type: Date, default: Date.now } });
const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

// --- KIDS MODE LOADER ---
let kidsWords = [];
const loadKidsWords = () => {
    try {
        const p = path.join(__dirname, 'kids_words.txt');
        if (fs.existsSync(p)) {
            const data = fs.readFileSync(p, 'utf8');
            kidsWords = data.split('\n').map(w => w.trim().toUpperCase()).filter(w => w.length > 0);
            console.log(`Loaded ${kidsWords.length} kids words.`);
        } else {
            console.warn("kids_words.txt not found. Kids mode may be empty.");
            kidsWords = []; 
        }
    } catch (e) {
        console.error("Error loading kids words:", e);
        kidsWords = [];
    }
};
loadKidsWords();

// --- ROOM MANAGER ---
const rooms = {};
const MODE_MINS = { 'coop': 2, 'versus': 4, 'vip': 3, 'hipster': 3, 'speed': 2, 'survival': 3, 'saboteur': 3, 'kids': 2 };

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
                wordIndex: 0,
                maxWords: 10,
                words: [],
                currentVotes: {},
                currentVoteTimes: {},
                accusationVotes: {}, 
                scores: { red: 0, blue: 0, coop: 0 },
                vipId: null,
                saboteurId: null,
                wordStartTime: 0
            };
        }

        const room = rooms[code];
        const isSpectator = (room.state === 'playing' || room.state === 'accusation');

        const existing = room.players.find(p => p.id === socket.id);
        if (existing) {
            existing.name = username || 'Player';
            existing.isSpectator = isSpectator; 
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
        
        if (isSpectator && room.words[room.wordIndex] && room.state === 'playing') {
            socket.emit('gameStarted', { totalWords: room.maxWords, mode: room.mode });
            socket.emit('nextWord', { 
                word: room.words[room.wordIndex], 
                wordCurrent: room.wordIndex + 1, 
                wordTotal: room.maxWords 
            });
        }
    });

    socket.on('leaveRoom', ({ roomCode }) => {
        const room = rooms[roomCode];
        if (!room) return;
        const idx = room.players.findIndex(p => p.id === socket.id);
        if (idx !== -1) {
            const wasHost = (room.host === socket.id);
            room.players.splice(idx, 1);
            socket.leave(roomCode);
            if (room.players.length === 0) delete rooms[roomCode];
            else {
                if (wasHost) room.host = room.players[0].id;
                checkInsufficientPlayers(roomCode);
                emitUpdate(roomCode);
            }
        }
    });

    socket.on('updateSettings', ({ roomCode, mode, rounds }) => {
        const room = rooms[roomCode];
        if (!room || room.host !== socket.id) return;
        if(mode) room.mode = mode;
        if(rounds) room.maxWords = parseInt(rounds);
        emitUpdate(roomCode);
    });
    
    socket.on('kickPlayer', ({ roomCode, targetId }) => {
        const room = rooms[roomCode];
        if (!room || room.host !== socket.id) return;
        if (targetId === room.host) return;

        const targetSocket = io.sockets.sockets.get(targetId);
        if (targetSocket) {
            targetSocket.emit('kicked');
            targetSocket.disconnect();
        }
        const idx = room.players.findIndex(p => p.id === targetId);
        if(idx !== -1) {
            room.players.splice(idx, 1);
            checkInsufficientPlayers(roomCode);
        }
        emitUpdate(roomCode);
    });

    socket.on('startGame', async ({ roomCode }) => {
        const room = rooms[roomCode];
        if (!room || room.host !== socket.id) return;

        room.state = 'playing';
        room.wordIndex = 0;
        room.currentVotes = {};
        room.currentVoteTimes = {};
        room.accusationVotes = {};
        room.vipId = null;
        room.saboteurId = null;

        room.players.forEach(p => {
            p.lives = 3;
            p.isSpectator = false;
        });

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
            if (room.mode === 'kids') {
                const shuffled = shuffle([...kidsWords]);
                let selection = [];
                while(selection.length < room.maxWords && shuffled.length > 0) {
                    selection = selection.concat(shuffled);
                }
                room.words = selection.slice(0, room.maxWords).map(t => ({ text: t }));
            } else {
                const randomWords = await Word.aggregate([{ $sample: { size: room.maxWords } }]);
                room.words = randomWords;
            }

            io.to(roomCode).emit('gameStarted', { 
                totalWords: room.maxWords, 
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
        if (!player || player.isSpectator) return;
        if (room.mode === 'survival' && player.lives <= 0) return;

        room.currentVotes[socket.id] = vote;
        room.currentVoteTimes[socket.id] = Date.now();
        io.to(roomCode).emit('playerVoted', { playerId: socket.id });

        const activePlayers = room.players.filter(p => !p.isSpectator && (room.mode !== 'survival' || p.lives > 0));
        if (Object.keys(room.currentVotes).length >= activePlayers.length) {
            finishWord(roomCode);
        }
    });

    socket.on('submitAccusation', ({ roomCode, targetId }) => {
        const room = rooms[roomCode];
        if (!room || room.state !== 'accusation') return;
        
        room.accusationVotes[socket.id] = targetId;
        const activeCount = room.players.filter(p => !p.isSpectator).length;
        if (Object.keys(room.accusationVotes).length >= activeCount) {
            processGameEnd(roomCode);
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
                    checkInsufficientPlayers(code);
                    emitUpdate(code);
                }
            }
        }
    });
});

function checkInsufficientPlayers(roomCode) {
    const room = rooms[roomCode];
    if (!room || room.state === 'lobby') return;

    const activeCount = room.players.filter(p => !p.isSpectator).length;
    const minNeeded = MODE_MINS[room.mode] || 2;
    let abort = false;
    let reason = "";

    if (activeCount < minNeeded) { abort = true; reason = "Not enough players remaining!"; }
    if (room.mode === 'versus') {
        const redC = room.players.filter(p => p.team === 'red' && !p.isSpectator).length;
        const blueC = room.players.filter(p => p.team === 'blue' && !p.isSpectator).length;
        if (redC === 0 || blueC === 0) { abort = true; reason = "One team is empty!"; }
    }

    if (abort) processGameEnd(roomCode, reason);
}

function emitUpdate(code) {
    if (!rooms[code]) return;
    io.to(code).emit('roomUpdate', {
        players: rooms[code].players,
        host: rooms[code].host,
        mode: rooms[code].mode,
        maxWords: rooms[code].maxWords,
        state: rooms[code].state
    });
}

function sendNextWord(roomCode) {
    const room = rooms[roomCode];
    if (!room) return;

    if (room.mode === 'survival') {
        const alive = room.players.filter(p => !p.isSpectator && p.lives > 0);
        if (alive.length <= 1 && room.players.length > 1) {
            processGameEnd(roomCode);
            return;
        }
    }

    if (room.wordIndex >= room.words.length) {
        if (room.mode === 'saboteur' || room.mode === 'vip') {
            room.state = 'accusation';
            io.to(roomCode).emit('startAccusation', { mode: room.mode, players: room.players });
        } else {
            processGameEnd(roomCode);
        }
        return;
    }

    const word = room.words[room.wordIndex];
    room.currentVotes = {};
    room.currentVoteTimes = {};
    room.wordStartTime = Date.now();
    
    io.to(roomCode).emit('nextWord', { 
        word: word, 
        wordCurrent: room.wordIndex + 1, 
        wordTotal: room.maxWords 
    });
}

function processGameEnd(roomCode, abortReason = null) {
    const room = rooms[roomCode];
    if (!room) return;

    if (room.state === 'accusation' && !abortReason) {
        const targetRole = room.mode === 'saboteur' ? room.saboteurId : room.vipId;
        for (const [voterId, accusedId] of Object.entries(room.accusationVotes)) {
            if (voterId === targetRole) continue; 
            if (accusedId === targetRole) {
                const p = room.players.find(p => p.id === voterId);
                if (p) p.score += 5; 
            }
        }
    }

    const rankings = [...room.players].sort((a,b) => b.score - a.score);
    io.to(roomCode).emit('gameOver', { 
        scores: room.scores, 
        mode: room.mode, 
        rankings,
        specialRoleId: room.vipId || room.saboteurId,
        msg: abortReason ? `GAME ENDED: ${abortReason}` : null
    });

    room.state = 'lobby';
    room.accusationVotes = {};
    emitUpdate(roomCode);
}

function finishWord(roomCode) {
    const room = rooms[roomCode];
    if (!room) return;
    const currentWord = room.words[room.wordIndex];
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
            const getAvg = (members) => {
                let total = 0; let count = 0;
                members.forEach(p => { if(room.currentVoteTimes[p.id]) { total += (room.currentVoteTimes[p.id] - room.wordStartTime); count++; } });
                return count ? total/count : 999999;
            };
            const rTime = getAvg(redM);
            const bTime = getAvg(blueM);
            if (rTime < bTime) { room.scores.red++; msgExt = "(Red Faster!)"; } 
            else if (bTime < rTime) { room.scores.blue++; msgExt = "(Blue Faster!)"; }
        }

        const rMaj = getMajority(redV);
        const bMaj = getMajority(blueV);
        room.players.forEach(p => {
            const v = votes[p.id];
            if(p.team === 'red' && v === rMaj) p.score++;
            if(p.team === 'blue' && v === bMaj) p.score++;
        });
        resultData = { redSync: rSync, blueSync: bSync, msg: msgExt ? `Tie Break! ${msgExt}` : null };

    } else {
        const allVotes = Object.values(votes);
        const maj = getMajority(allVotes);
        
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
        votes: votes 
    });

    room.wordIndex++;
    setTimeout(() => sendNextWord(roomCode), 3000);
}

app.get('/kids_words.txt', (req, res) => {
    const p = path.join(__dirname, 'kids_words.txt');
    if (fs.existsSync(p)) res.sendFile(p);
    else res.status(404).send(""); 
});

app.get('/api/words/all', async (req, res) => { try { res.json(await Word.find().sort({ createdAt: -1 })); } catch (e) { res.json([]); } });
app.get('/api/words', async (req, res) => { try { res.json(await Word.aggregate([{ $sample: { size: 1 } }])); } catch (e) { res.json({message:"Error"}); } });
app.put('/api/words/:id/vote', async (req, res) => { try { await Word.findByIdAndUpdate(req.params.id, { $inc: { [req.body.voteType + 'Votes']: 1 } }); res.json({message:"OK"}); } catch (e) { res.status(500).json({}); } });
app.post('/api/words', async (req, res) => { try { const n = new Word({ text: req.body.text }); await n.save(); res.status(201).json(n); } catch (e) { res.status(500).json({}); } });
app.get('/api/leaderboard', async (req, res) => { try { res.json(await Leaderboard.find().sort({voteCount:-1}).limit(10)); } catch(e){res.json([])} });
app.post('/api/leaderboard', async (req, res) => { try { await Leaderboard.findOneAndUpdate({userId:req.body.userId}, req.body, {upsert:true}); res.json({message:"OK"}); } catch(e){res.status(500).send()} });
app.get('/api/scores', async (req, res) => { try { res.json(await Score.find().sort({score:-1}).limit(10)); } catch(e){res.json([])} });
app.post('/api/scores', async (req, res) => { try { const s = new Score(req.body); await s.save(); res.json(s); } catch(e){res.json({})} });

server.listen(PORT, () => console.log(`Server on ${PORT}`));
