const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors'); 
const fs = require('fs'); 

const app = express();
const port = process.env.PORT || 10000;

// Version for tracking
// Updated version to reflect the attempt to fix the seeding path
const BACKEND_VERSION = 'v1.8.2 (CRITICAL FIX: Static asset path fix)'; 

// --- CRITICAL CONFIGURATION: MONGO DB URI ---
// WARNING: The credentials below are hardcoded for immediate deployment testing,
// but for security, you MUST use the process.env.MONGODB_URI environment variable
// for production.
const hardcodedUri = "mongodb+srv://database_user_4:justatestpassword@ac-cchetfb.jsepbhh.mongodb.net/good-word-game?retryWrites=true&w=majority&appName=ac-cchetfb&authSource=admin";

// Use the environment variable if available (RECOMMENDED), otherwise fallback to the hardcoded URI.
const uri = process.env.MONGODB_URI || hardcodedUri;

// Minimum number of total votes required for a word to appear in the "Community Ratings" list.
const MIN_VOTES_THRESHOLD = 1;

// --- Middleware Setup ---
app.use(express.json()); 
app.use(cors()); 

// CRITICAL PATH 1: Define the public folder path. 
// Use an absolute path from the project root (where index.js is).
// Since index.js is in the root, __dirname is the root directory.
// We are using 'public' as a relative path to the root.
const publicPath = path.join(__dirname, 'public');
console.log(`[${BACKEND_VERSION}] Serving static files from path: ${publicPath}`); 
// Tell Express to serve all static assets (CSS, JS, images) from the public folder
app.use(express.static(publicPath));

// --- Database Connection Setup ---

// 1. Connect to MongoDB
console.log(`[${BACKEND_VERSION}] Using URI (first 40 chars): ${uri.substring(0, 40)}...`);
console.log("Attempting initial connection to MongoDB...");

// Connect using the URI (hardcoded or environment variable)
mongoose.connect(uri)
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
        // 4. Handle persistent connection failure
        console.error("Fatal Error: Failed to connect to MongoDB and start server. Check your URI, network access, or user permissions.", err.message);
        console.error("Mongoose Error Details:", err.name);
        // Exit process to ensure deployment platform recognizes the failure
        process.exit(1);
    });

// --- Mongoose Schema and Model ---

const wordSchema = new mongoose.Schema({
    word: { type: String, required: true, unique: true },
    goodVotes: { type: Number, default: 0 },
    badVotes: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

// The model 'Word' will use the collection 'words' in the connected DB ('good-word-game')
const Word = mongoose.model('Word', wordSchema);


// --- Initial Data Seeding ---

// This list is now the fallback if british-words.txt is not found.
const fallbackWords = [
    "harmony", "disaster", "joy", "gloom", "truth", "lie", "success", 
    "failure", "kindness", "cruelty", "wisdom", "stupid", "brave", "coward",
    "freedom", "prison", "peace", "war", "beautiful", "ugly"
];

/**
 * Seeds the database with a predefined list of words if the collection is empty.
 * Attempts to load words from 'british-words.txt' first.
 */
async function initializeWords() {
    try {
        const count = await Word.countDocuments();
        if (count === 0) {
            let wordsToSeed = [];
            
            // CRITICAL PATH 2: Path to the word list file
            // Since index.js is in the root, and server is a sibling directory.
            const filePath = path.join(__dirname, 'server', 'british-words.txt');
            
            console.log(`[Seeding] Attempting to read word list from: ${filePath}`);

            if (fs.existsSync(filePath)) {
                try {
                    // Read the file synchronously to ensure words are loaded before proceeding
                    const fileContent = fs.readFileSync(filePath, 'utf8');
                    
                    // Split the content by newline, filter out empty lines, trim whitespace, and convert to lowercase
                    wordsToSeed = fileContent
                        .split(/\r?\n/)
                        .map(word => word.trim().toLowerCase())
                        .filter(word => word.length > 0);
                    
                    console.log(`[Seeding] Success! Loaded ${wordsToSeed.length} words from british-words.txt.`);

                } catch (fileError) {
                    // This catches errors like permission denied or malformed file content
                    console.error(`[Seeding] ERROR reading file at ${filePath}:`, fileError.message);
                    console.warn("[Seeding] Falling back to hardcoded list.");
                    wordsToSeed = fallbackWords;
                }
            } else {
                console.warn(`[Seeding] WARNING: File not found at path: ${filePath}`);
                console.warn("[Seeding] Falling back to hardcoded list.");
                wordsToSeed = fallbackWords;
            }


            if (wordsToSeed.length > 0 && wordsToSeed[0] !== "NO WORDS") { // Ensure fallback didn't return an error message
                console.log(`[Seeding] Database is empty. Seeding ${wordsToSeed.length} words...`);
                // Use a Set to ensure uniqueness and then map to Mongoose objects
                const uniqueWordObjects = [...new Set(wordsToSeed)].map(word => ({ word: word }));
                
                try {
                    // Mongoose insertMany will handle large arrays efficiently
                    await Word.insertMany(uniqueWordObjects, { ordered: false }); 
                    console.log(`[Seeding] Initial ${uniqueWordObjects.length} unique words seeded successfully.`);
                } catch (insertError) {
                     // Warn instead of exiting if insertion fails (e.g., due to concurrent runs or duplicates)
                     console.warn("[Seeding] Failed to insert all words, possibly due to concurrent initialization or duplicates. Proceeding.", insertError.message);
                }
            } else {
                 console.log("[Seeding] No words found in file or fallback list to seed the database.");
            }
        } else {
            console.log(`[Seeding] Database already contains ${count} words. Skipping seeding.`);
        }
    } catch (error) {
        // This is where the permission error occurred. If it fails here, it should exit in the main catch block.
        console.error("Critical error during initial word count (Permission Check):", error.message);
        throw error; // Re-throw to be caught by the main connection catch
    }
}


// --- API Endpoints ---

// 1. GET backend version
app.get('/api/version', (req, res) => {
    res.json({ version: BACKEND_VERSION });
});

// 2. GET a new random word
app.get('/api/get-word', async (req, res) => {
    try {
        const count = await Word.countDocuments();
        if (count === 0) {
            // Updated behavior for empty database
            return res.status(200).json({ 
                word: "DB EMPTY", 
                wordId: null, 
                message: "Database is empty. Check server logs for seeding errors." 
            });
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
            res.status(404).json({ error: "Could not find a random word." });
        }

    } catch (error) {
        console.error("Error fetching word:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 3. POST a vote for a word
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

// 4. GET top rated words for community display
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


// CRITICAL FIX: Explicitly serve index.html for the root path (/) and any other path
// that isn't handled by the API. 
app.get('*', (req, res) => {
    // Check if the request is for an API route
    if (req.url.startsWith('/api')) {
        // If it's an API route and we reached here, it means the API route was not found.
        return res.status(404).send('API endpoint not found.');
    }
    
    // Serve the index.html file from the public directory
    // We are now using the correct path construction based on index.js being in the root.
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
