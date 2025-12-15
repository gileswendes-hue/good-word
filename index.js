const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// --- CRITICAL FIX 1: MIDDLEWARE AND BODY PARSING ---
// 1. Enable JSON body parsing for API requests (Fixes req.body being undefined)
app.use(express.json());

// 2. Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));


// --- CRITICAL FIX 2: MONGODB CONNECTION AND MODEL DEFINITION ---

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


// --- GENERIC FALLBACK (Must be last) ---

// Fallback for serving the main HTML file (for all non-API routes)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// --- SERVER START ---
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
