const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); 
require('dotenv').config(); // Load environment variables from .env file (if running locally)

// --- 1. CONFIGURATION ---

const app = express();
const PORT = process.env.PORT || 3000;
// MANDATORY: Ensure MONGO_URI is set as an environment variable in your hosting service (e.g., Render)
const MONGO_URI = process.env.MONGO_URI; 

// Middleware
app.use(cors()); 
app.use(express.json()); 

// IMPORTANT: Serve static files (like index.html) from the 'public' directory
// Since index.js is in the root, path.join(__dirname, 'public') correctly points to the public folder.
app.use(express.static(path.join(__dirname, 'public'))); 

// --- 2. DATABASE CONNECTION ---

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected successfully.'))
    .catch(err => {
        console.error('FATAL MongoDB connection error:', err);
        // If MongoDB connection fails, the server will not start correctly.
        // It's essential to check if MONGO_URI is correctly set in the deployment service.
    });

// --- 3. MONGOOSE SCHEMA AND MODEL ---

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

// --- 5. START SERVER ---

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
