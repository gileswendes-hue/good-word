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

const scoreSchema = new mongoose.Schema({
    name: { type: String, required: true },
    score: { type: Number, required: true },
    userId: { type: String, required: true }
});
const Score = mongoose.model('Score', scoreSchema);

const leaderboardSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    username: { type: String },
    voteCount: { type: Number, default: 0 }
});
const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

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
                scores: { red: 0, blue: 0, coop: 0 }
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
                team: 'neutral' 
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

        // Randomize Teams
        if (room.mode === 'versus') {
            const shuffled = shuffle([...room.players]);
            shuffled.forEach((p, i) => {
                const originalP = room.players.find(rp => rp.id === p.id);
                if (originalP) originalP.team = (i % 2 === 0) ? 'red' : 'blue';
            });
            emitUpdate(roomCode);
        }

        try {
            const randomWords = await Word.aggregate([{ $sample: { size: room.maxRounds } }]);
            room.words = randomWords;

            // Notify Start (Clients play countdown)
            io.to(roomCode).emit('gameStarted', { 
                totalRounds: room.maxRounds,
                mode: room.mode
            });
            
            // WAIT 5 SECONDS for countdown before sending first word
            setTimeout(() => sendNextWord(roomCode), 5000);
        } catch (e) { console.error(e); }
    });

    socket.on('submitVote', ({ roomCode, vote }) => {
        const room = rooms[roomCode];
        if (!room || room.state !== 'playing') return;

        room.currentVotes[socket.id] = vote;
        io.to(roomCode).emit('playerVoted', { playerId: socket.id });

        if (Object.keys(room.currentVotes).length >= room.players.length) {
            finishRound(roomCode);
        }
    });

    socket.on('disconnect', () => {
        for (const code in rooms) {
            const room = rooms[code];
            const idx = room.players.findIndex(p => p.id === socket.id);
            if (idx !== -1) {
                room.players.splice(idx, 1);
                if (room.players.length === 0) delete rooms[code];
                else {
                    if (room.host === socket.id) room.host = room.players[0].id;
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
        state: rooms[code].state
    });
}

function sendNextWord(roomCode) {
    const room = rooms[roomCode];
    if (!room) return;

    if (room.round >= room.words.length) {
        io.to(roomCode).emit('gameOver', { scores: room.scores, mode: room.mode });
        return;
    }

    const word = room.words[room.round];
    room.currentVotes = {};
    
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
    let resultData = {};

    if (room.mode === 'versus') {
        const calcSync = (team) => {
            const members = room.players.filter(p => p.team === team);
            if (members.length === 0) return 0;
            const v = members.map(p => votes[p.id]);
            const g = v.filter(x => x === 'good').length;
            const b = v.filter(x => x === 'bad').length;
            return Math.round((Math.max(g, b) / members.length) * 100);
        };
        const redSync = calcSync('red');
        const blueSync = calcSync('blue');
        
        if (redSync > blueSync) room.scores.red++;
        else if (blueSync > redSync) room.scores.blue++;
        
        resultData = { redSync, blueSync, redScore: room.scores.red, blueScore: room.scores.blue };
    } else {
        const all = Object.values(votes);
        const g = all.filter(x => x === 'good').length;
        const b = all.filter(x => x === 'bad').length;
        const sync = Math.round((Math.max(g, b) / all.length) * 100);
        
        if (sync >= 100) room.scores.coop += 1;
        resultData = { sync, score: room.scores.coop };
    }

    io.to(roomCode).emit('roundResult', {
        mode: room.mode,
        data: resultData,
        word: currentWord.text
    });

    room.round++;
    // FASTER PACING: 1 Second Result Display
    setTimeout(() => sendNextWord(roomCode), 1000);
}

// API Routes
app.get('/api/words/all', async (req, res) => {
    try { res.json(await Word.find().sort({ createdAt: -1 })); } catch (e) { res.json([]); }
});
app.get('/api/words', async (req, res) => {
    try { res.json(await Word.aggregate([{ $sample: { size: 1 } }])); } catch (e) { res.json({message:"Error"}); }
});
app.put('/api/words/:id/vote', async (req, res) => {
    try { await Word.findByIdAndUpdate(req.params.id, { $inc: { [req.body.voteType + 'Votes']: 1 } }); res.json({message:"OK"}); } catch (e) { res.status(500).json({}); }
});
app.post('/api/words', async (req, res) => {
    try { const n = new Word({ text: req.body.text }); await n.save(); res.status(201).json(n); } catch (e) { res.status(500).json({}); }
});
app.get('/api/leaderboard', async (req, res) => { try { res.json(await Leaderboard.find().sort({voteCount:-1}).limit(10)); } catch(e){res.json([])} });
app.post('/api/leaderboard', async (req, res) => { try { await Leaderboard.findOneAndUpdate({userId:req.body.userId}, req.body, {upsert:true}); res.json({message:"OK"}); } catch(e){res.status(500).send()} });
app.get('/api/scores', async (req, res) => { try { res.json(await Score.find().sort({score:-1}).limit(10)); } catch(e){res.json([])} });
app.post('/api/scores', async (req, res) => { try { const s = new Score(req.body); await s.save(); res.json(s); } catch(e){res.json({})} });

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server on ${PORT}`));
