const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Essential for connecting front-end (index.html) to the backend API

// --- Configuration & Initialization ---
const app = express();
const PORT = process.env.PORT || 3000;

// IMPORTANT: The MongoDB URI must be set as an environment variable in your Render service settings.
// We are now strictly relying on process.env.MONGODB_URI.
const MONGODB_URI = process.env.MONGODB_URI; 

// Middleware
app.use(cors());
app.use(express.json()); // To parse JSON bodies from the front-end

// --- MongoDB Connection and Schema ---

// 1. Define the Mongoose Schema
const wordSchema = new mongoose.Schema({
    text: { type: String, required: true, unique: true, lowercase: true, trim: true },
    goodVotes: { type: Number, default: 0 },
    badVotes: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    // Store user IDs who have voted to prevent repeat voting
    voters: { type: [String], default: [] }, 
    timestamp: { type: Date, default: Date.now }
});

const Word = mongoose.model('Word', wordSchema);

// 2. Connect to MongoDB and Seed Initial Data
if (!MONGODB_URI) {
    console.error('FATAL ERROR: MONGODB_URI environment variable is not set.');
    // Exit process if connection string is missing in a production environment
    // process.exit(1); 
}

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('MongoDB connected successfully.');
        seedInitialWords();
        // Start the server only after a successful database connection
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

/**
 * Seeds the database with a default list of words if the collection is empty.
 * You can customize this list with your own words.
 */
async function seedInitialWords() {
    try {
        const count = await Word.countDocuments();
        if (count === 0) {
            console.log('Word collection is empty. Seeding initial data...');
            
            // --- CUSTOMIZE YOUR INITIAL WORD LIST HERE ---
            const initialWords = [
                { text: "fluffy", goodVotes: 50, badVotes: 10 },
                { text: "serene", goodVotes: 35, badVotes: 2 },
                { text: "cacophony", goodVotes: 5, badVotes: 25 },
                { text: "smirk", goodVotes: 10, badVotes: 15 },
                { text: "crisp", goodVotes: 20, badVotes: 5 },
                { text: "sludge", goodVotes: 2, badVotes: 40 },
                { text: "giggle", goodVotes: 45, badVotes: 1 },
                { text: "moist", goodVotes: 15, badVotes: 30 }
            ];
            // --- END CUSTOM WORD LIST ---

            await Word.insertMany(initialWords);
            console.log('Initial words seeded successfully.');
        } else {
            console.log(`Word collection already contains ${count} words.`);
        }
    } catch (error) {
        console.error("Error during initial seeding:", error);
    }
}

// --- API ROUTES ---

// 1. GET /api/words - Fetch all words for game state and rankings
app.get('/api/words', async (req, res) => {
    try {
        // Fetch all words, sort by timestamp (optional)
        const words = await Word.find().sort({ timestamp: 1 });
        // The front-end expects an array of objects
        res.json(words); 
    } catch (err) {
        console.error("Error fetching words:", err);
        res.status(500).json({ message: 'Failed to fetch words' });
    }
});

// 2. POST /api/words - Submit a new custom word
app.post('/api/words', async (req, res) => {
    const { text } = req.body;

    if (!text || text.length < 2 || text.includes(' ')) {
        return res.status(400).json({ message: 'Word must be 2+ characters and contain no spaces.' });
    }

    try {
        const newWord = new Word({ text: text.toLowerCase() });
        await newWord.save();
        res.status(201).json(newWord);
    } catch (err) {
        // Handle duplicate key error (word already exists)
        if (err.code === 11000) {
            return res.status(409).json({ message: `The word "${text}" is already submitted.` });
        }
        console.error("Error submitting word:", err);
        res.status(500).json({ message: 'Failed to submit word.' });
    }
});

// 3. PUT /api/words/:wordId/vote - Register a vote
app.put('/api/words/:wordId/vote', async (req, res) => {
    const { wordId } = req.params;
    const { voteType, userId } = req.body;

    if (!['good', 'bad'].includes(voteType) || !userId) {
        return res.status(400).json({ message: 'Invalid vote data.' });
    }

    try {
        const word = await Word.findById(wordId);

        if (!word) {
            return res.status(404).json({ message: 'Word not found.' });
        }

        // Check if the user has already voted on this word
        if (word.voters.includes(userId)) {
            // Note: The front-end is designed to move on immediately after a vote, 
            // but this prevents database corruption from fast-clicking/reloading.
            return res.status(403).json({ message: 'User already voted on this word.' });
        }

        const updateField = voteType === 'good' ? 'goodVotes' : 'badVotes';
        
        // Use $inc for atomic increment and $push to add userId to the voters array
        const result = await Word.findByIdAndUpdate(wordId, {
            $inc: { [updateField]: 1 },
            $push: { voters: userId }
        }, { new: true }); // 'new: true' returns the updated document

        res.json({ message: 'Vote registered successfully', word: result });

    } catch (err) {
        console.error("Error processing vote:", err);
        res.status(500).json({ message: 'Failed to register vote.' });
    }
});
