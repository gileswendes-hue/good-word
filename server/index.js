const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors'); // Retained but not used, for simplicity

const app = express();
const port = process.env.PORT || 10000;

// Version for tracking
const BACKEND_VERSION = 'v1.6.5';

// --- CRITICAL CONFIGURATION: MONGO DB URI ---
// 
// IMPORTANT: You MUST replace the placeholder string below with your actual MongoDB Atlas 
// connection string. 
// 
// If you are encountering 'querySrv ENOTFOUND' errors during deployment, try using the 
// non-SRV connection string format (starting with 'mongodb://...') directly 
// from your MongoDB Atlas cluster.
// 
// Placeholder URI structure for testing:
const uri = process.env.MONGODB_URI || "mongodb+srv://database_user_4:justatestpassword@good-word-game.jsepbhh.mongodb.net/?retryWrites=true&w=majority&appName=good-word-game";

// Minimum number of total votes required for a word to appear in the "Community Ratings" list.
const MIN_VOTES_THRESHOLD = 1; // Set to 1, matching the frontend expectation.

// --- Middleware Setup ---
// Use built-in Express middleware for JSON parsing (replaces body-parser.json())
app.use(express.json()); 
app.use(cors()); // Keeping cors for cross-origin requests

// Set up static serving for the frontend index.html
// Assuming index.html is in the same directory as this index.js file
const staticPath = path.join(__dirname);
app.use(express.static(staticPath));

// --- Database Connection Setup (Refactored) ---

// 1. Connect to MongoDB
console.log("Attempting initial connection to MongoDB...");

// Added explicit options, which can sometimes resolve deployment-specific connection issues
mongoose.connect(uri, { 
        useNewUrlParser: true, 
        useUnifiedTopology: true 
    })
    .then(() => {
        console.log("MongoDB connection successful.");
        // 2. Initialize words only after a successful connection
        return initializeWords();
    })
    .then(() => {
        // 3. Start server only after DB is connected and seeded
        app.listen(port, () => {
            console.log(`Server is listening on port ${port} (Backend Version: ${BACKEND_VERSION})`);
        });
    })
    .catch(err => {
        // 4. Handle persistent connection failure, logging a fatal error
        // The error log showed: "bad auth : Authentication failed."
        console.error("Fatal Error: Failed to connect to MongoDB and start server. Check your MONGODB_URI environment variable and IP access list.", err.message);
        // Exiting the application on critical failure
        process.exit(1);
    });

// --- Mongoose Schema and Model ---

const wordSchema = new mongoose.Schema({
    word: { type: String, required: true, unique: true },
    goodVotes: { type: Number, default: 0 },
    badVotes: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const Word = mongoose.model('Word', wordSchema);


// --- Initial Data Seeding ---

const initialWords = [
    "harmony", "disaster", "joy", "gloom", "truth", "lie", "success", 
    "failure", "kindness", "cruelty", "wisdom", "stupid", "brave", "coward",
    "freedom", "prison", "peace", "war", "beautiful", "ugly"
];

/**
 * Seeds the database with a predefined list of words if the collection is empty.
 */
async function initializeWords() {
    try {
        const count = await Word.countDocuments();
        if (count === 0) {
            console.log("Database is empty. Seeding initial words...");
            const wordObjects = initialWords.map(w => ({ word: w }));
            // Use try/catch here to ensure seeding errors don't crash the server start
            try {
                await Word.insertMany(wordObjects);
                console.log("Initial words seeded successfully.");
            } catch (insertError) {
                 // Log a warning if insertion fails (e.g., if another instance is seeding concurrently)
                console.warn("Seeding failed, possibly due to concurrent initialization. Proceeding.", insertError.message);
            }
        }
    } catch (error) {
        // Log a fatal error if counting documents fails, but proceed to start server 
        console.error("Critical error during initial word count:", error);
    }
}


// --- API Endpoints ---

// 1. Root route to serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
});

// 2. GET backend version
app.get('/api/version', (req, res) => {
    res.json({ version: BACKEND_VERSION });
});

// 3. GET a new random word
app.get('/api/get-word', async (req, res) => {
    try {
        const count = await Word.countDocuments();
        if (count === 0) {
            return res.status(200).json({ word: "NO WORDS", wordId: null });
        }
        
        // Get a random document
        const randomWords = await Word.aggregate([
            { $sample: { size: 1 } }
        ]);

        if (randomWords.length > 0) {
            const wordDoc = randomWords[0];
            res.json({
                word: wordDoc.word.toUpperCase(),
                wordId: wordDoc._id 
            });
        } else {
             // Fallback in case $sample returns nothing (should not happen if count > 0)
            res.status(404).json({ error: "Could not find a random word." });
        }

    } catch (error) {
        console.error("Error fetching word:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 4. POST a vote for a word
app.post('/api/vote', async (req, res) => {
    const { wordId, voteType } = req.body;

    if (!wordId || (voteType !== 'good' && voteType !== 'bad')) {
        return res.status(400).json({ error: "Invalid wordId or voteType" });
    }

    try {
        let updateQuery = {};
        if (voteType === 'good') {
            updateQuery = { $inc: { goodVotes: 1 } };
        } else {
            updateQuery = { $inc: { badVotes: 1 } };
        }

        const result = await Word.findByIdAndUpdate(wordId, updateQuery, { new: true });
        
        let engagementMessage = "";
        if (result && (result.goodVotes + result.badVotes) === 1) {
            engagementMessage = `Thanks! You cast the first vote for "${result.word}".`;
        }

        res.json({ success: true, engagementMessage });
    } catch (error) {
        console.error("Error submitting vote:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 5. GET top rated words for community display
app.get('/api/top-words', async (req, res) => {
    try {
        // Find words that have met the minimum vote threshold
        const ratedWords = await Word.find({ 
            $expr: { $gte: [{ $add: ["$goodVotes", "$badVotes"] }, MIN_VOTES_THRESHOLD] }
        });

        // Calculate ratios and sort/filter the words
        const wordsWithRatio = ratedWords.map(wordDoc => {
            const totalVotes = wordDoc.goodVotes + wordDoc.badVotes;
            return {
                word: wordDoc.word.toUpperCase(),
                totalVotes: totalVotes,
                goodRatio: totalVotes > 0 ? wordDoc.goodVotes / totalVotes : 0,
                badRatio: totalVotes > 0 ? wordDoc.badVotes / totalVotes : 0,
            };
        });

        // Filter and sort for Mostly Good (highest good ratio)
        const mostlyGood = wordsWithRatio
            .filter(w => w.goodRatio >= 0.5) // Only include words rated 50% or more as good
            .sort((a, b) => b.goodRatio - a.goodRatio)
            .slice(0, 10); // Take top 10

        // Filter and sort for Mostly Bad (highest bad ratio)
        const mostlyBad = wordsWithRatio
            .filter(w => w.badRatio >= 0.5) // Only include words rated 50% or more as bad
            .sort((a, b) => b.badRatio - a.badRatio)
            .slice(0, 10); // Take top 10

        res.json({
            mostlyGood,
            mostlyBad
        });

    } catch (error) {
        console.error("Error fetching top words:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
