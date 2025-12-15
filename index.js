require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- EXISTING MODELS (Restored) ---

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

// --- NEW LEADERBOARD MODEL (Added) ---

const leaderboardSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    username: { type: String, required: true, default: 'Anonymous' },
    voteCount: { type: Number, required: true, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
});

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);


// --- API ROUTES ---

// 1. Get all words (Restored functionality)
app.get('/api/words', async (req, res) => {
    try {
        let words;
        // If query param ?all=true is passed, return everything (for offline cache)
        if (req.query.all === 'true') {
             words = await Word.find({});
        } else {
             // Default: Filter out words marked as "not a word" heavily
             words = await Word.find({ notWordVotes: { $lt: 3 } });
        }
        res.json(words);
    } catch (err) {
        console.error("Error fetching words:", err);
        res.status(500).json({ message: err.message });
    }
});

// 2. Submit a new word
app.post('/api/words', async (req, res) => {
    const { text } = req.body;
    
    if (!text || text.includes(' ') || text.length > 45) {
        return res.status(400).json({ message: 'Invalid word format' });
    }

    const badWords = ['FUCK', 'SHIT', 'CUNT', 'NIGGER', 'FAGGOT', 'RETARD', 'ASSHOLE', 'BASTARD', 'BITCH', 'WHORE', 'SLUT', 'DICK', 'PUSSY', 'COCK', 'WANKER'];
    if (badWords.some(bw => text.toUpperCase().includes(bw))) {
        return res.status(400).json({ message: 'Profanity not allowed.' });
    }

    try {
        const existing = await Word.findOne({ text: { $regex: new RegExp(`^${text}$`, 'i') } });
        if (existing) {
            return res.status(400).json({ message: 'Word already exists.' });
        }

        const newWord = new Word({ text: text.toUpperCase() });
        await newWord.save();
        res.status(201).json(newWord);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 3. Vote on a word
app.put('/api/words/:id/vote', async (req, res) => {
    const { voteType } = req.body; 
    
    try {
        const word = await Word.findById(req.params.id);
        if (!word) return res.status(404).json({ message: 'Word not found' });

        if (voteType === 'good') word.goodVotes++;
        else if (voteType === 'bad') word.badVotes++;
        else if (voteType === 'notWord') word.notWordVotes++;

        await word.save();
        res.json(word);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 4. Get High Scores (Streaks)
app.get('/api/scores', async (req, res) => {
    try {
        const scores = await Score.find().sort({ score: -1 }).limit(10);
        res.json(scores);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 5. Submit High Score
app.post('/api/scores', async (req, res) => {
    const { name, score, userId } = req.body;
    try {
        const newScore = new Score({ name, score, userId });
        await newScore.save();
        
        const count = await Score.countDocuments();
        if (count > 50) {
            const deleteIds = await Score.find().sort({ score: -1 }).skip(50).select('_id');
            await Score.deleteMany({ _id: { $in: deleteIds } });
        }
        
        res.status(201).json(newScore);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// --- NEW LEADERBOARD ROUTES ---

// 6. GET Global Leaderboard
app.get('/api/leaderboard', async (req, res) => {
    try {
        const topUsers = await Leaderboard.find({})
            .select('userId username voteCount')
            .sort({ voteCount: -1 })
            .limit(10);
        res.json(topUsers);
    } catch (e) {
        console.error("Error fetching leaderboard:", e);
        res.status(500).json([]);
    }
});

// 7. POST User Stats (Update Vote Count)
app.post('/api/leaderboard', async (req, res) => {
    const { userId, username, voteCount } = req.body;

    if (!userId || typeof voteCount !== 'number') {
        return res.status(400).send({ message: "Missing userId or invalid voteCount." });
    }

    try {
        await Leaderboard.findOneAndUpdate(
            { userId: userId },
            { 
                username: username,
                voteCount: voteCount,
                lastUpdated: new Date()
            },
            { upsert: true, new: true } 
        );
        res.status(200).send({ message: "Leaderboard stats updated." });
    } catch (e) {
        console.error("Error updating leaderboard stats:", e);
        res.status(500).send({ message: "Server error updating stats." });
    }
});


// Serve Frontend (Catch-all)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
