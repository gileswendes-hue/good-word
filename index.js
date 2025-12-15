const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. CRITICAL MIDDLEWARE FIX: Enable JSON body parsing (Fixes req.body being undefined)
app.use(express.json());

// 2. Serve static files from the public directory (assuming your game assets are here)
app.use(express.static(path.join(__dirname, 'public')));


// --- MONGODB CONNECTION AND MODEL DEFINITION ---

// Assuming MongoDB connection setup is here:
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/goodwordbadword');

// Define the Leaderboard Schema and Model (Required before routes use it)
const leaderboardSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    username: { type: String, required: true, default: 'Anonymous' },
    voteCount: { type: Number, required: true, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
});

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);


// --- API ROUTES (Leaderboard Logic) ---

// POST /api/leaderboard (Submitting/Updating Votes)
app.post('/api/leaderboard', async (req, res) => {
    const { userId, username, voteCount } = req.body;

    if (!userId || typeof voteCount !== 'number') {
        return res.status(400).send({ message: "Missing userId or invalid voteCount." });
    }

    try {
        // Find by userId and update their record (upsert: true creates if not found)
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

// GET /api/leaderboard (Fetching the Top 10 list)
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


// --- PLACEHOLDER ROUTES (Restore these if they were in your original file) ---

// Example: GET /api/words
app.get('/api/words', (req, res) => {
    // This should contain logic to fetch your word list from the database
    // For now, we return a minimal mock list to keep the game running if the database fails
    // In a real application, replace this with MongoDB/Mongoose logic.
    const mockWordList = [
        { _id: '1', text: 'TEST', goodVotes: 50, badVotes: 50 },
        { _id: '2', text: 'MOIST', goodVotes: 100, badVotes: 10 },
        { _id: '3', text: 'CAKE', goodVotes: 0, badVotes: 0 },
    ];
    res.json(mockWordList); 
});

// Example: PUT /api/words/:id/vote
app.put('/api/words/:id/vote', (req, res) => {
    // This should contain logic to update word votes in the database
    res.status(200).send({ message: 'Vote recorded' }); 
});


// --- GENERIC FALLBACK (Must be last) ---

// Fallback for serving the main HTML file (for all non-API routes)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// --- SERVER START ---
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
