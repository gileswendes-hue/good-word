const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); 
require('dotenv').config(); // Load environment variables from .env file (if running locally)

// --- 1. CONFIGURATION ---

const app = express();
const PORT = process.env.PORT || 3000;
// CRITICAL FIX: Changed from MONGO_URI to MONGODB_URI to match common environment variable naming conventions
// MANDATORY: Ensure MONGODB_URI is set as an environment variable in your hosting service (e.g., Render)
const MONGO_URI = process.env.MONGODB_URI; 

// Middleware
app.use(cors()); 
app.use(express.json()); 

// IMPORTANT: Serve static files (like index.html) from the 'public' directory
// Since index.js is in the root, path.join(__dirname, 'public') correctly points to the public folder.
app.use(express.static(path.join(__dirname, 'public'))); 

// --- 2. DATABASE CONNECTION ---

// CRITICAL CHECK: Ensure MONGO_URI is defined before attempting connection
if (!MONGO_URI) {
    console.error('FATAL ERROR: MONGODB_URI environment variable is not defined.');
    console.error('Please ensure the MONGODB_URI is set in your hosting service or .env file.');
    // We will not start the server if the database is required but unavailable
} else {
    mongoose.connect(MONGO_URI)
        .then(() => console.log('MongoDB connected successfully.'))
        .catch(err => {
            console.error('FATAL MongoDB connection error:', err);
            // If MongoDB connection fails, the server will not start correctly.
            // It's essential to check if MONGODB_URI is correctly set and accessible.
        });
}

// --- 3. MONGOOSE SCHEMA AND MODEL ---

// inside your backend code (e.g., server.js or models.js)

const scoreSchema = new mongoose.Schema({
    name: { type: String, required: true, maxlength: 3 }, // 3 letter initials
    score: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    userId: String // Optional: to prevent one person spamming
});

const Score = mongoose.model('Score', scoreSchema);

// Defines the structure of a 'word' document in MongoDB
const wordSchema = new mongoose.Schema({
    text: { type: String, required: true, unique: true, trim: true, lowercase: true },
    goodVotes: { type: Number, default: 0 },
    badVotes: { type: Number, default: 0 },
    notWordVotes: { type: Number, default: 0 }, 
    voters: [{ type: String }] 
}, { timestamps: true });

const Word = mongoose.model('Word', wordSchema);

// --- 4. API ROUTES ---

const router = express.Router();

/**
 * GET /api/words
 * Fetches all words from the database.
 */
router.get('/', async (req, res) => {
    // Only attempt database interaction if the connection was successful
    if (!MONGO_URI || mongoose.connection.readyState !== 1) {
        return res.status(503).json({ message: 'Database connection currently unavailable.' });
    }
    
    try {
        const words = await Word.find({});
        res.status(200).json(words);
    } catch (error) {
        console.error('Error fetching words:', error);
        res.status(500).json({ message: 'Failed to retrieve words.' });
    }
});

/**
 * POST /api/words
 * Adds a new word to the database.
 */
router.post('/', async (req, res) => {
    if (!MONGO_URI || mongoose.connection.readyState !== 1) {
        return res.status(503).json({ message: 'Database connection currently unavailable.' });
    }

    const { text } = req.body;

    if (!text || text.length < 2) {
        return res.status(400).json({ message: 'Word must be at least 2 characters long.' });
    }

    try {
        const newWord = new Word({ text });
        await newWord.save();
        res.status(201).json(newWord);
    } catch (error) {
        if (error.code === 11000) { // MongoDB duplicate key error
            return res.status(409).json({ message: 'This word has already been submitted.' });
        }
        console.error('Error submitting word:', error);
        res.status(500).json({ message: 'Failed to submit word.' });
    }
});

/**
 * PUT /api/words/:id/vote
 * Registers a vote (good, bad, or notWord) for a specific word.
 */
router.put('/:id/vote', async (req, res) => {
    if (!MONGO_URI || mongoose.connection.readyState !== 1) {
        return res.status(503).json({ message: 'Database connection currently unavailable.' });
    }

    const { id } = req.params;
    const { voteType, userId } = req.body;

    if (!['good', 'bad', 'notWord'].includes(voteType)) {
        return res.status(400).json({ message: 'Invalid vote type.' });
    }
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required for voting.' });
    }

    try {
        const word = await Word.findById(id);

        if (!word) {
            return res.status(404).json({ message: 'Word not found.' });
        }

        // Check for double voting
        if (word.voters.includes(userId)) {
            return res.status(403).json({ message: "You've already voted on this word." }); 
        }

        // Prepare the update object
        let update = { $push: { voters: userId } }; // Record the vote for this user

        // Increment the correct counter based on voteType
        if (voteType === 'good') {
            update.$inc = { goodVotes: 1 };
        } else if (voteType === 'bad') {
            update.$inc = { badVotes: 1 };
        } else if (voteType === 'notWord') {
            update.$inc = { notWordVotes: 1 }; 
        }

        const updatedWord = await Word.findByIdAndUpdate(id, update, { new: true });

        // Check if the word is now invalid (>= 3 'notWord' votes)
        if (updatedWord.notWordVotes >= 3) {
            console.log(`Word "${updatedWord.text}" has been flagged as "Not a word!" and will be filtered by the frontend.`);
        }

        res.status(200).json(updatedWord);

    } catch (error) {
        console.error('Error submitting vote:', error);
        res.status(500).json({ message: 'Failed to process vote.' });
    }
});

// Attach the router to the main app
app.use('/api/words', router);

// The root path (/) now serves the frontend application from the 'public' directory
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Submit a new High Score
app.post('/api/scores', async (req, res) => {
    try {
        const { name, score, userId } = req.body;

        // Basic validation
        if (!name || !score) {
            return res.status(400).json({ message: 'Name and score required' });
        }

        const cleanName = name.trim().slice(0, 3).toUpperCase();

        const newScore = new Score({
            name: cleanName,
            score: parseInt(score),
            userId
        });

        await newScore.save();
        res.status(201).json(newScore);
    } catch (err) {
        console.error("Error saving score:", err);
        res.status(500).json({ message: 'Server Error' });
    }
});

app.get('/api/leaderboard', async (req, res) => {
    try {
        // Fetch top 10 users sorted by voteCount descending
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

// 2. POST /api/leaderboard (For client-side submission of user votes)
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

app.get('/api/scores', async (req, res) => {
    try {
        const topScores = await Score.find()
            .sort({ score: -1 })
            .limit(8)
            .select('name score -_id'); 

        res.json(topScores);
    } catch (err) {
        console.error("Error fetching scores:", err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// --- 5. START SERVER ---
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

