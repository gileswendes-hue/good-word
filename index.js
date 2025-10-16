// --- Dependencies ---
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // If using a local .env file

// --- Configuration ---
const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
// Enable CORS for all origins, allowing the front-end to communicate from any domain
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
// Serve static files (including index.html) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));


// --- Database Connection ---
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('MongoDB connected successfully.');
        seedInitialWords(); // Seed words after successful connection
    })
    .catch(err => {
        console.error('MongoDB connection error:', err.message);
        // Exit process if DB connection fails as the app is unusable without it
        process.exit(1); 
    });


// --- Mongoose Schema & Model ---
const wordSchema = new mongoose.Schema({
    text: { type: String, required: true, unique: true },
    goodVotes: { type: Number, default: 0 },
    badVotes: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    voters: { type: [String], default: [] }, // Stores unique user IDs who have voted
    timestamp: { type: Date, default: Date.now }
});

const Word = mongoose.model('Word', wordSchema);


// --- Initial Data Seeding ---
async function seedInitialWords() {
    try {
        const count = await Word.countDocuments();
        if (count === 0) {
            console.log('Database is empty. Seeding initial words...');

            const filePath = path.join(__dirname, 'initial_words.txt');
            const fileContent = fs.readFileSync(filePath, 'utf8');
            
            // Split by newline, filter out empty lines, and map to Word objects
            const initialWords = fileContent.split('\n')
                .map(line => line.trim())
                .filter(text => text.length > 0)
                .map(text => ({ text: text, goodVotes: 0, badVotes: 0, isActive: true }));

            if (initialWords.length > 0) {
                await Word.insertMany(initialWords, { ordered: false });
                console.log(`Successfully seeded ${initialWords.length} initial words.`);
            } else {
                 console.log('initial_words.txt is empty or contains no valid words. Skipping seeding.');
            }
        } else {
            console.log(`Database already contains ${count} words. Skipping seeding.`);
        }
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error('Error: initial_words.txt not found. Cannot seed data.');
        } else {
            console.error('Error during initial data seeding:', error.message);
        }
    }
}


// --- API Routes ---

/**
 * GET /api/words
 * Returns all active words with their vote counts and stats.
 */
app.get('/api/words', async (req, res) => {
    try {
        const words = await Word.find({ isActive: true }).select('text goodVotes badVotes _id');
        res.json(words);
    } catch (err) {
        console.error("GET /api/words error:", err);
        res.status(500).json({ message: "Failed to fetch words." });
    }
});

/**
 * PUT /api/words/:wordId/vote
 * Registers a vote (good or bad) for a specific word, ensuring the user has not voted yet.
 * Body: { voteType: 'good' | 'bad', userId: 'UUID' }
 */
app.put('/api/words/:wordId/vote', async (req, res) => {
    const { wordId } = req.params;
    const { voteType, userId } = req.body;

    if (!['good', 'bad'].includes(voteType) || !userId) {
        return res.status(400).json({ message: "Invalid voteType or missing userId." });
    }

    try {
        const word = await Word.findById(wordId);
        if (!word) {
            return res.status(404).json({ message: "Word not found." });
        }

        // Check if the user has already voted
        if (word.voters.includes(userId)) {
            return res.status(403).json({ message: "User has already voted on this word." });
        }

        // Update vote count and add user ID to voters array
        const updateField = voteType === 'good' ? 'goodVotes' : 'badVotes';
        
        await Word.updateOne(
            { _id: wordId },
            { 
                $inc: { [updateField]: 1 },
                $push: { voters: userId }
            }
        );

        res.json({ message: `Vote counted for ${voteType}.` });

    } catch (err) {
        console.error(`PUT /api/words/${wordId}/vote error:`, err);
        // Use 400 for bad request if it's a validation error, 500 for server error
        res.status(500).json({ message: "Failed to register vote." });
    }
});

/**
 * POST /api/words
 * Allows users to submit a new custom word.
 * Body: { text: 'new_word' }
 */
app.post('/api/words', async (req, res) => {
    const { text } = req.body;
    if (!text || text.trim().length === 0) {
        return res.status(400).json({ message: "Word text cannot be empty." });
    }

    const newWordText = text.trim().toLowerCase();
    
    try {
        const newWord = new Word({ 
            text: newWordText,
            goodVotes: 0,
            badVotes: 0,
            isActive: true
        });

        await newWord.save();
        res.status(201).json({ 
            message: "Word submitted successfully and added to the pool!",
            word: newWord
        });
    } catch (err) {
        // 11000 is the MongoDB error code for duplicate key (unique index)
        if (err.code === 11000) {
            return res.status(409).json({ message: `The word "${newWordText}" already exists.` });
        }
        console.error("POST /api/words error:", err);
        res.status(500).json({ message: "Failed to submit word." });
    }
});


// --- Server Start ---
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
