require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http'); // Import HTTP
const { Server } = require("socket.io"); // Import Socket.io

const app = express();
const server = http.createServer(app); // Wrap Express
const io = new Server(server, { cors: { origin: "*" } }); // Init Socket

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- 1. WORD MODEL ---
const wordSchema = new mongoose.Schema({
    text: { type: String, required: true, unique: true },
    goodVotes: { type: Number, default: 0 },
    badVotes: { type: Number, default: 0 },
    notWordVotes: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});
const Word = mongoose.model('Word', wordSchema);

// --- 2. SCORE MODEL ---
const scoreSchema = new mongoose.Schema({
    name: { type: String, required: true },
    score: { type: Number, required: true },
    userId: { type: String, required: true },
    date: { type: Date, default: Date.now }
});
const Score = mongoose.model('Score', scoreSchema);

// --- 3. LEADERBOARD MODEL ---
const leaderboardSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    username: { type: String },
    voteCount: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
});
const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

// ------------------------------------------
// --- REAL-TIME ROOM MANAGER (Socket.io) ---
// ------------------------------------------

const rooms = {}; // Store active rooms in memory

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // 1. Join/Create Room
    socket.on('joinRoom', ({ roomCode, username }) => {
        const code = roomCode.toUpperCase();
        socket.join(code);

        if (!rooms[code]) {
            rooms[code] = {
                host: socket.id,
                players: [],
                state: 'lobby', // lobby, playing, results
                round: 0,
                maxRounds: 10,
                words: [],
                currentVotes: {},
                scores: {}
            };
        }

        const room = rooms[code];
        // Add player if not exists
        if (!room.players.find(p => p.id === socket.id)) {
            room.players.push({ id: socket.id, name: username || 'Anonymous', score: 0 });
            room.scores[socket.id] = 0;
        }

        // Notify room of update
        io.to(code).emit('roomUpdate', {
            players: room.players,
            host: room.host,
            state: room.state
        });
    });

    // 2. Start Game
    socket.on('startGame', async ({ roomCode, rounds }) => {
        const room = rooms[roomCode];
        if (!room || room.host !== socket.id) return;

        room.state = 'playing';
        room.maxRounds = rounds || 10;
        room.round = 0;
        room.currentVotes = {};

        // Fetch Random Words from MongoDB
        try {
            const randomWords = await Word.aggregate([{ $sample: { size: room.maxRounds } }]);
            room.words = randomWords;

            io.to(roomCode).emit('gameStarted', { totalRounds: room.maxRounds });
            
            // Send first word after small delay
            setTimeout(() => sendNextWord(roomCode), 1000);
        } catch (e) {
            console.error("Error fetching words for room:", e);
        }
    });

    // 3. Submit Vote
    socket.on('submitVote', ({ roomCode, vote }) => {
        const room = rooms[roomCode];
        if (!room || room.state !== 'playing') return;

        // Record vote
        room.currentVotes[socket.id] = vote;
        
        // Notify everyone WHO voted (but not WHAT they voted yet)
        io.to(roomCode).emit('playerVoted', { playerId: socket.id });

        // Check if all players have voted
        if (Object.keys(room.currentVotes).length >= room.players.length) {
            finishRound(roomCode);
        }
    });

    // 4. Disconnect
    socket.on('disconnect', () => {
        // Remove player from all rooms they are in
        for (const code in rooms) {
            const room = rooms[code];
            const index = room.players.findIndex(p => p.id === socket.id);
            
            if (index !== -1) {
                room.players.splice(index, 1);
                
                // If room empty, delete
                if (room.players.length === 0) {
                    delete rooms[code];
                } else {
                    // If host left, assign new host
                    if (room.host === socket.id) {
                        room.host = room.players[0].id;
                    }
                    io.to(code).emit('roomUpdate', {
                        players: room.players,
                        host: room.host,
                        state: room.state
                    });
                }
            }
        }
    });
});

// Helper: Send Next Word
function sendNextWord(roomCode) {
    const room = rooms[roomCode];
    if (!room) return;

    if (room.round >= room.words.length) {
        endGame(roomCode);
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

// Helper: Finish Round (Calculate & Reveal)
function finishRound(roomCode) {
    const room = rooms[roomCode];
    if (!room) return;

    const currentWord = room.words[room.round];
    
    // Calculate global majority stats for this word from DB
    // (In a real app, you might query DB fresh here, but we use the fetched snapshot)
    const g = currentWord.goodVotes || 0;
    const b = currentWord.badVotes || 0;
    const majorityVote = g >= b ? 'good' : 'bad'; // Simple majority logic

    // Calculate Scores (Accuracy)
    // You get points if you voted with the GLOBAL majority (or room majority? Let's do Global as per prompt)
    const roundResults = [];
    
    room.players.forEach(p => {
        const pVote = room.currentVotes[p.id];
        const isCorrect = (pVote === majorityVote);
        if (isCorrect) room.scores[p.id]++;
        
        roundResults.push({ 
            id: p.id, 
            vote: pVote, 
            isCorrect: isCorrect, 
            score: room.scores[p.id] 
        });
    });

    io.to(roomCode).emit('roundResult', {
        results: roundResults,
        majority: majorityVote,
        word: currentWord.text
    });

    room.round++;
    
    // Wait 3 seconds then next word
    setTimeout(() => sendNextWord(roomCode), 3000);
}

// Helper: End Game
function endGame(roomCode) {
    const room = rooms[roomCode];
    if (!room) return;
    
    room.state = 'results';
    io.to(roomCode).emit('gameOver', { scores: room.scores });
}

// ------------------------------------------

// --- API ROUTES (Keep your existing routes below) ---
// (Paste your existing GET/POST /api/words, /api/scores routes here...)
// ...

// GET Random Words
app.get('/api/words', async (req, res) => {
    try {
        const count = await Word.countDocuments();
        const random = Math.floor(Math.random() * count);
        const words = await Word.aggregate([{ $sample: { size: 1 } }]);
        res.json(words);
    } catch (e) {
        res.status(500).json({ message: "Error fetching word" });
    }
});

// Vote Route
app.put('/api/words/:id/vote', async (req, res) => {
    const { id } = req.params;
    const { voteType } = req.body;
    
    if (!['good', 'bad', 'notWord'].includes(voteType)) {
        return res.status(400).json({ message: "Invalid vote type" });
    }

    try {
        const update = {};
        if (voteType === 'good') update.goodVotes = 1;
        if (voteType === 'bad') update.badVotes = 1;
        if (voteType === 'notWord') update.notWordVotes = 1;

        await Word.findByIdAndUpdate(id, { $inc: update });
        res.json({ message: "Vote recorded" });
    } catch (e) {
        res.status(500).json({ message: "Error voting" });
    }
});

// Submit Word Route
app.post('/api/words', async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Text required" });
    
    try {
        const exists = await Word.findOne({ text: new RegExp(`^${text}$`, 'i') });
        if (exists) return res.status(409).json({ message: "Word already exists" });

        const newWord = new Word({ text });
        await newWord.save();
        res.status(201).json(newWord);
    } catch (e) {
        res.status(500).json({ message: "Error submitting word" });
    }
});

// Leaderboard Routes
app.get('/api/leaderboard', async (req, res) => {
    try {
        const topUsers = await Leaderboard.find({})
            .select('userId username voteCount')
            .sort({ voteCount: -1 })
            .limit(10);
        res.json(topUsers);
    } catch (e) {
        res.status(500).json([]);
    }
});

app.post('/api/leaderboard', async (req, res) => {
    const { userId, username, voteCount } = req.body;
    if (!userId || typeof voteCount !== 'number') {
        return res.status(400).send({ message: "Missing data." });
    }
    try {
        await Leaderboard.findOneAndUpdate(
            { userId: userId },
            { username, voteCount, lastUpdated: new Date() },
            { upsert: true, new: true } 
        );
        res.status(200).send({ message: "Updated." });
    } catch (e) {
        res.status(500).send({ message: "Error." });
    }
});

// Serve High Scores (GET/POST) - Existing...
app.get('/api/scores', async (req, res) => {
    try {
        const s = await Score.find().sort({ score: -1 }).limit(10);
        res.json(s);
    } catch(e) { res.status(500).json([]) }
});
app.post('/api/scores', async (req, res) => {
    try {
        const { name, score, userId } = req.body;
        const s = new Score({ name, score, userId });
        await s.save();
        res.json(s);
    } catch(e) { res.status(500).json({}) }
});

// --- CHANGE APP.LISTEN TO SERVER.LISTEN ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
