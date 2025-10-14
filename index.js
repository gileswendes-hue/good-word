// --- Dependencies ---
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const app = express();
// Use the recommended port structure for external deployment environments
const PORT = process.env.PORT || 10000;
const MONGO_URI = process.env.MONGODB_URI;

// =========================================================================
// CRITICAL FIX: PATHING FOR DEPLOYMENT ENVIRONMENTS (Using process.cwd())
const PROJECT_ROOT = process.cwd(); 
const PUBLIC_PATH = path.join(PROJECT_ROOT, 'public'); 
const INDEX_HTML_PATH = path.join(PUBLIC_PATH, 'index.html');

// Assuming british-words.txt is located in the 'server' directory next to index.js
const WORDS_FILE_PATH = path.join(PROJECT_ROOT, 'server', 'british-words.txt');
// =========================================================================

// --- Middleware ---
app.use(express.json()); // for parsing application/json

// Use the robust path to serve static files from the 'public' directory
app.use(express.static(PUBLIC_PATH)); 

// --- MongoDB/Mongoose Setup ---

// Define the schema for a Word
const wordSchema = new mongoose.Schema({
    word: { type: String, required: true, unique: true, index: true },
    goodVotes: { type: Number, default: 0 },
    badVotes: { type: Number, default: 0 },
});

// Virtual property for 'id' to expose '_id' as 'id' in JSON responses
wordSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

// Ensure virtuals are included in toJSON output
wordSchema.set('toJSON', { virtuals: true });
wordSchema.set('toObject', { virtuals: true });

const Word = mongoose.model('Word', wordSchema);

// Flag to track database connection status
let isDbConnected = false;

/**
 * Initializes the MongoDB connection and seeds the database if empty.
 */
async function connectDB() {
    console.log("Attempting initial connection to MongoDB...");

    if (!MONGO_URI) {
        console.error("==========================================================================================");
        console.error("!! CRITICAL WARNING: MONGODB_URI environment variable is NOT set. Database features will fail. !!");
        console.error("==========================================================================================");
        isDbConnected = false;
        // DO NOT exit/return here. Allow the server to start to serve the frontend.
    } else {
        try {
            await mongoose.connect(MONGO_URI);
            console.log("MongoDB connection successful.");
            isDbConnected = true;
            await seedDatabase();
        } catch (error) {
            console.error("WARNING: Failed to connect to MongoDB. Database features will be unavailable.");
            console.error("Connection Error Details:", error.message); 
            isDbConnected = false;
        }
    }
}

/**
 * Seeds the database with words from british-words.txt if the collection is empty.
 */
async function seedDatabase() {
    if (!isDbConnected) return; // Skip seeding if not connected
    
    try {
        const count = await Word.countDocuments();
        if (count === 0) {
            console.log("Database is empty. Seeding initial words...");
            
            const filePath = WORDS_FILE_PATH; 
            
            // Check if file exists before trying to read
            if (!fs.existsSync(filePath)) {
                console.error(`ERROR: Word list file 'british-words.txt' not found at expected path: ${filePath}. Seeding aborted.`);
                return;
            }

            const data = fs.readFileSync(filePath, 'utf8');
            const words = data.split('\n')
                             .map(w => w.trim().toUpperCase())
                             .filter(w => w.length > 0)
                             .map(word => ({
                                 word: word,
                                 goodVotes: 0,
                                 badVotes: 0
                             }));
            
            // Use insertMany to efficiently add all words
            await Word.insertMany(words, { ordered: false, rawResult: true });
            console.log(`Initial words seeded successfully. Total words: ${words.length}.`);
        } else {
            console.log(`Database already contains ${count} words. Seeding skipped.`);
        }
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error("ERROR: Word list file 'british-words.txt' not found. Check file path and structure.");
        } else if (error.code === 11000) {
             console.warn("Initial words seeded successfully (with duplicate warnings).");
        } else {
            console.error("Error during database seeding:", error.message);
        }
    }
}

// --- API Route Utility ---

/**
 * Middleware to check database connection status before handling a route.
 */
function dbCheck(req, res, next) {
    if (!isDbConnected) {
        console.warn(`[DB_CHECK] API call to ${req.path} failed: Database is not connected.`);
        return res.status(503).json({ 
            success: false, 
            message: "Service Unavailable: Database offline. Cannot complete request." 
        });
    }
    next();
}


// --- API Routes ---

/**
 * [GET] /api/health - Retrieves the server and database health status.
 */
app.get('/api/health', (req, res) => {
    const httpStatus = isDbConnected ? 200 : 503;

    res.status(httpStatus).json({
        status: httpStatus === 200 ? 'UP' : 'DEGRADED',
        database: {
            status: isDbConnected ? 'OK' : 'DOWN',
            message: isDbConnected ? 'MongoDB connection successful.' : 'MongoDB connection failed or is not configured.'
        },
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});


/**
 * [GET] /api/get-word - Retrieves a random word to be classified.
 */
app.get('/api/get-word', dbCheck, async (req, res) => {
    try {
        // Use $sample to efficiently get a random document
        const randomWords = await Word.aggregate([
            { $sample: { size: 1 } }
        ]);

        if (randomWords.length > 0) {
            const wordData = randomWords[0];
            
            // Ensure ID is present and returned
            const responseWord = {
                id: wordData._id.toString(), // Convert ObjectId to string for frontend
                word: wordData.word
            };

            res.json(responseWord);
        } else {
            // Handle case where $sample returns nothing (DB is empty after connection/seeding failure)
            console.warn("Database is connected but collection is empty.");
            res.status(200).json({ 
                word: "EMPTY DB", 
                id: "000000000000000000000000", // Placeholder ID
                message: "No words found. Database may need seeding."
            });
        }
    } catch (error) {
        console.error("Error fetching random word:", error);
        res.status(500).json({ message: "Internal server error while fetching word." });
    }
});

/**
 * [POST] /api/vote - Submits a vote for a word.
 */
app.post('/api/vote', dbCheck, async (req, res) => {
    const { wordId, classification } = req.body; 

    // Validate input 
    if (!wordId || typeof wordId !== 'string' || wordId.trim().length === 0 || (classification !== 'good' && classification !== 'bad')) {
        console.error(`Validation failed for vote: wordId=${wordId}, classification=${classification}`);
        return res.status(400).json({ success: false, message: "Invalid wordId or classification provided. Word ID is required." });
    }

    const updateField = classification === 'good' ? 'goodVotes' : 'badVotes';

    try {
        const result = await Word.findByIdAndUpdate(
            wordId,
            { $inc: { [updateField]: 1 } },
            { new: true } // Return the updated document
        );

        if (result) {
            res.json({ success: true, message: "Vote recorded." });
        } else {
            res.status(404).json({ success: false, message: "Word not found." });
        }
    } catch (error) {
        console.error("Error updating vote:", error);
        if (error.name === 'CastError' && error.path === '_id') {
             return res.status(400).json({ success: false, message: "Invalid word ID format." });
        }
        res.status(500).json({ success: false, message: "Internal server error while recording vote." });
    }
});

/**
 * [GET] /api/top-words - Retrieves the top 5 good and top 5 bad words.
 */
app.get('/api/top-words', dbCheck, async (req, res) => {
    try {
        const mostlyGood = await Word.find({})
            .sort({ goodVotes: -1, badVotes: 1 }) 
            .limit(5)
            .select('word goodVotes badVotes');

        const mostlyBad = await Word.find({})
            .sort({ badVotes: -1, goodVotes: 1 }) 
            .limit(5)
            .select('word goodVotes badVotes');

        // Convert Mongoose documents to plain objects to trigger virtuals (like 'id')
        res.json({
            mostlyGood: mostlyGood.map(w => w.toObject()),
            mostlyBad: mostlyBad.map(w => w.toObject()),
        });
    } catch (error) {
        console.error("Error fetching top words:", error);
        res.status(500).json({ message: "Internal server error while fetching top words." });
    }
});


// Handles all non-API requests by returning the main HTML file.
app.get('*', (req, res) => {
    res.sendFile(INDEX_HTML_PATH);
});

// --- Server Startup ---

// 1. Connect to the database
connectDB().finally(() => {
    // 2. Start the Express server regardless of DB connection status
    app.listen(PORT, () => {
        const dbStatus = isDbConnected ? "CONNECTED" : "DISCONNECTED (API calls will fail)"
        console.log(`Server is listening on port ${PORT} (Backend Version: v1.8.1 FIX: DB Status Check & Empty DB Return, DB status: ${dbStatus})`);
    });
});
