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

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- MODELS ---
const wordSchema = new mongoose.Schema({
    text: { type: String, required: true, unique: true },
    goodVotes: { type: Number, default: 0 },
    badVotes: { type: Number, default: 0 },
    notWordVotes: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});
const Word = mongoose.model('Word', wordSchema);

const scoreSchema = new mongoose.Schema({
    name: { type: String, required: true },
    score: { type: Number, required: true },
    userId: { type: String, required: true },
    date: { type: Date, default: Date.now }
});
const Score = mongoose.model('Score', scoreSchema);

const leaderboardSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    username: { type: String },
    voteCount: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
});
const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

// ------------------------------------------
// --- MULTIPLAYER ROOM MANAGER ---
// ------------------------------------------

const rooms = {};

io.on('connection', (socket) => {
    
    // 1. Join Room
    socket.on('joinRoom', ({ roomCode, username }) => {
        const code = roomCode.toUpperCase();
        socket.join(code);

        if (!rooms[code]) {
            rooms[code] = {
                host: socket.id,
                players: [],
                state: 'lobby',
                mode: 'coop', // 'coop' or 'versus'
                round: 0,
                maxRounds: 10,
                words: [],
                currentVotes: {},
                scores: { red: 0, blue: 0, coop: 0 }
            };
        }

        const room = rooms[code];
        // Check if player exists, if not add them
        if (!room.players.find(p => p.id === socket.id)) {
            // Auto-assign team (Alternating)
            const team = (room.players.length % 2 === 0) ? 'red' : 'blue';
            room.players.push({ 
                id: socket.id, 
                name: username || 'Player', 
                team: team 
            });
        }
        
        emitUpdate(code);
    });

    // 2. Switch Team
    socket.on('switchTeam', ({ roomCode, team }) => {
        const room = rooms[roomCode];
        if (!room) return;
        const p = room.players.find(p => p.id === socket.id);
        if (p) {
            p.team = team;
            emitUpdate(roomCode);
        }
    });

    // 3. Set Mode
    socket.on('setMode', ({ roomCode, mode }) => {
        const room = rooms[roomCode];
        if (!room || room.host !== socket.id) return;
        room.mode = mode;
        emitUpdate(roomCode);
    });

    // 4. Start Game
    socket.on('startGame', async ({ roomCode, rounds }) => {
        const room = rooms[roomCode];
        if (!room || room.host !== socket.id) return;

        room.state = 'playing';
        room.maxRounds = rounds || 10;
        room.round = 0;
        room.currentVotes = {};
        room.scores = { red: 0, blue: 0, coop: 0 };

        try {
            // Get random words
            const randomWords = await Word.aggregate([{ $sample: { size: room.maxRounds } }]);
            room.words = randomWords;

            io.to(roomCode).emit('gameStarted', { 
                totalRounds: room.maxRounds,
                mode: room.mode
            });
            
            setTimeout(() => sendNextWord(roomCode), 1000);
        } catch (e) {
            console.error("Error fetching words:", e);
        }
    });

    // 5. Submit Vote
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

    // --- SCORING LOGIC ---
    if (room.mode === 'versus') {
        // Calculate Red Sync & Blue Sync
        const calcSync = (teamName) => {
            const teamMembers = room.players.filter(p => p.team === teamName);
            if (teamMembers.length === 0) return 0;
            const teamVotes = teamMembers.map(p => votes[p.id]);
            
            // Count Good vs Bad
            const g = teamVotes.filter(v => v === 'good').length;
            const b = teamVotes.filter(v => v === 'bad').length;
            const majority = Math.max(g, b);
            
            return Math.round((majority / teamMembers.length) * 100);
        };

        const redSync = calcSync('red');
        const blueSync = calcSync('blue');
        
        if (redSync > blueSync) room.scores.red++;
        else if (blueSync > redSync) room.scores.blue++;
        
        resultData = { redSync, blueSync, redScore: room.scores.red, blueScore: room.scores.blue };

    } else {
        // CO-OP MODE
        const allVotes = Object.values(votes);
        const g = allVotes.filter(v => v === 'good').length;
        const b = allVotes.filter(v => v === 'bad').length;
        const majorityCount = Math.max(g, b);
        const sync = Math.round((majorityCount / allVotes.length) * 100);
        
        if (sync >= 100) room.scores.coop += 1;
        
        resultData = { sync, score: room.scores.coop };
    }

    io.to(roomCode).emit('roundResult', {
        mode: room.mode,
        data: resultData,
        word: currentWord.text,
        votes: votes
    });

    room.round++;
    setTimeout(() => sendNextWord(roomCode), 4000); // 4s to see results
}

// ------------------------------------------
// --- API ROUTES ---
// ------------------------------------------

app.get('/api/words/all', async (req, res) => {
    try {
        // Removed .limit(1000) so it fetches everything
        const allWords = await Word.find().sort({ createdAt: -1 }); 
        res.json(allWords);
    } catch (e) {
        res.status(500).json([]);
    }
});

// 2. Get Random Word
app.get('/api/words', async (req, res) => {
    try {
        const w = await Word.aggregate([{ $sample: { size: 1 } }]);
        res.json(w);
    } catch (e) { res.status(500).json({ message: "Error" }); }
});

// 3. Vote
app.put('/api/words/:id/vote', async (req, res) => {
    try {
        const u = {}; u[req.body.voteType + 'Votes'] = 1;
        await Word.findByIdAndUpdate(req.params.id, { $inc: u });
        res.json({ message: "OK" });
    } catch (e) { res.status(500).json({ message: "Error" }); }
});

// 4. Submit
app.post('/api/words', async (req, res) => {
    try {
        const n = new Word({ text: req.body.text }); await n.save(); res.status(201).json(n);
    } catch (e) { res.status(500).json({ message: "Error" }); }
});

// 5. Leaderboard
app.get('/api/leaderboard', async (req, res) => {
    try { res.json(await Leaderboard.find().sort({voteCount:-1}).limit(10)); } catch(e) { res.json([]); }
});
app.post('/api/leaderboard', async (req, res) => {
    try { await Leaderboard.findOneAndUpdate({userId:req.body.userId}, req.body, {upsert:true}); res.json({message:"OK"}); } catch(e) { res.status(500).send(); }
});

// 6. Scores
app.get('/api/scores', async (req, res) => {
    try { res.json(await Score.find().sort({score:-1}).limit(10)); } catch(e) { res.json([]); }
});
app.post('/api/scores', async (req, res) => {
    try { const s = new Score(req.body); await s.save(); res.json(s); } catch(e) { res.json({}); }
});

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server on ${PORT}`));

