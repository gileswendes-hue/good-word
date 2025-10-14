// --- Dependencies ---
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const app = express();
// Use the recommended port structure for external deployment environments
const PORT = process.env.PORT || 10000;
const MONGO_URI = process.env.MONGODB_URI;

// --- Middleware ---
app.use(express.json()); // for parsing application/json

// CRITICAL FIX: The path.join needs to correctly handle the structure where
// index.js is in 'server' and static files are in 'public'.
// We are serving static files from the directory one level up, in 'public'.
app.use(express.static(path.join(__dirname, '../public'))); // Serve static files from the 'public' directory

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
        console.error("WARNING: MONGODB_URI environment variable is not set. Database features will be unavailable.");
        isDbConnected = false;
        return; // Do not throw, allow server to start
    }

    try {
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB connection successful.");
        isDbConnected = true;
        await seedDatabase();
    } catch (error) {
        console.error("WARNING: Failed to connect to MongoDB. Database features will be unavailable.");
        // Log the full error for debugging, excluding the URI for security
        console.error("Connection Error Details:", error.message);
        isDbConnected = false;
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
            
            // CRITICAL FIX: british-words.txt is in the 'server' directory, so we reference it directly from __dirname.
            const filePath = path.join(__dirname, 'british-words.txt');
            
            // Check if file exists before trying to read
            if (!fs.existsSync(filePath)) {
                console.error("ERROR: Word list file 'british-words.txt' not found at expected path. Check server directory.");
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
            
            // Insert only new documents, ignoring duplicates (though words are unique here)
            await Word.insertMany(words, { ordered: false, rawResult: true });
            console.log(`Initial words seeded successfully. Total words: ${words.length}.`);
        } else {
            console.log(`Database already contains ${count} words. Seeding skipped.`);
        }
    } catch (error) {
        // Handle potential EBUSY or file reading errors
        if (error.code === 'ENOENT') {
            console.error("ERROR: Word list file 'british-words.txt' not found.");
        } else if (error.code === 11000) {
             // 11000 is the MongoDB duplicate key error (safe to ignore after initial seed)
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
            message: "Service Unavailable: Database connection failed. Please check MONGODB_URI." 
        });
    }
    next();
}


// --- API Routes ---

/**
 * [GET] /api/health - Retrieves the server and database health status. (NEW)
 * Responds with 200 (UP) or 503 (DEGRADED/DOWN).
 */
app.get('/api/health', (req, res) => {
    // Determine the status based on the connection flag
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

            // Ensure the response structure is always consistent and uses 'id'
            const responseWord = {
                id: wordData._id.toString(), // Convert ObjectId to string for 'id' field
                word: wordData.word
            };

            res.json(responseWord);
        } else {
            // This is unlikely if seeding worked, but good to handle
            res.status(404).json({ message: "No words found in the database. Try re-seeding." });
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

    // We rely on the client sending wordId which maps to the MongoDB _id string.
    if (!wordId || (classification !== 'good' && classification !== 'bad')) {
        return res.status(400).json({ success: false, message: "Invalid wordId or classification provided." });
    }

    const updateField = classification === 'good' ? 'goodVotes' : 'badVotes';

    try {
        const result = await Word.findByIdAndUpdate(
            wordId,
            { $inc: { [updateField]: 1 } },
            { new: true }
        );

        if (result) {
            res.json({ success: true, message: "Vote recorded." });
        } else {
            res.status(404).json({ success: false, message: "Word not found." });
        }
    } catch (error) {
        console.error("Error updating vote:", error);
        res.status(500).json({ success: false, message: "Internal server error while recording vote." });
    }
});

/**
 * [GET] /api/top-words - Retrieves the top 5 good and top 5 bad words.
 */
app.get('/api/top-words', dbCheck, async (req, res) => {
    try {
        // Fetch top 5 words by total good votes
        const mostlyGood = await Word.find({})
            .sort({ goodVotes: -1, badVotes: 1 }) // Primary sort: Good votes descending, Secondary sort: Bad votes ascending
            .limit(5)
            // Use .select() to ensure only necessary fields are sent, including the virtual 'id'
            .select('word goodVotes badVotes');

        // Fetch top 5 words by total bad votes
        const mostlyBad = await Word.find({})
            .sort({ badVotes: -1, goodVotes: 1 }) // Primary sort: Bad votes descending, Secondary sort: Good votes ascending
            .limit(5)
            .select('word goodVotes badVotes');

        res.json({
            // Use .map(w => w.toObject()) to explicitly trigger virtuals and convert Mongoose documents
            mostlyGood: mostlyGood.map(w => w.toObject()),
            mostlyBad: mostlyBad.map(w => w.toObject()),
        });
    } catch (error) {
        console.error("Error fetching top words:", error);
        res.status(500).json({ message: "Internal server error while fetching top words." });
    }
});


// CRITICAL FIX: Handle the root route (and all other routes not caught by API)
// This must come AFTER all specific API routes.
app.get('*', (req, res) => {
    // __dirname points to the 'server' folder. We need to go up one level to the root
    // and then down into 'public' to find index.html.
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// --- Server Startup ---

// 1. Connect to the database (which now handles failure gracefully)
connectDB().finally(() => {
    // 2. Start the Express server regardless of DB connection status
    app.listen(PORT, () => {
        const dbStatus = isDbConnected ? "CONNECTED" : "DISCONNECTED (API calls will fail)"
        console.log(`Server is listening on port ${PORT} (Backend Version: v1.7.8 FIX: Added /api/health route, DB status: ${dbStatus})`);
    });
});
