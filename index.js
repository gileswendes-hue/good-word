// --- Dependencies ---
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;
const MONGO_URI = process.env.MONGODB_URI;

// --- Middleware ---
app.use(express.json()); // for parsing application/json
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

/**
 * Initializes the MongoDB connection and seeds the database if empty.
 */
async function connectDB() {
    console.log("Attempting initial connection to MongoDB...");

    if (!MONGO_URI) {
        console.error("CRITICAL ERROR: MONGODB_URI environment variable is not set.");
        throw new Error("Missing MONGODB_URI. Cannot connect to database.");
    }

    try {
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB connection successful.");
        await seedDatabase();
    } catch (error) {
        console.error("Fatal Error: Failed to connect to MongoDB and start server. Check your MONGO_URI, or network access.");
        // Log the full error, excluding the URI for security
        console.error("Connection Error Details:", error.message);
        // Exiting the process after a critical failure
        process.exit(1); 
    }
}

/**
 * Seeds the database with words from british-words.txt if the collection is empty.
 */
async function seedDatabase() {
    try {
        const count = await Word.countDocuments();
        if (count === 0) {
            console.log("Database is empty. Seeding initial words...");
            const filePath = path.join(__dirname, 'british-words.txt');
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
            console.error("ERROR: Word list file 'british-words.txt' not found at expected path:", path.join(__dirname, 'british-words.txt'));
        } else if (error.code === 11000) {
             // 11000 is the MongoDB duplicate key error (safe to ignore after initial seed)
             console.warn("Initial words seeded successfully (with duplicate warnings).");
        } else {
            console.error("Error during database seeding:", error.message);
        }
    }
}

// --- API Routes ---

/**
 * [GET] /api/get-word - Retrieves a random word to be classified.
 */
app.get('/api/get-word', async (req, res) => {
    try {
        // Use $sample to efficiently get a random document
        const randomWords = await Word.aggregate([
            { $sample: { size: 1 } }
        ]);

        if (randomWords.length > 0) {
            const wordData = randomWords[0];

            // CRITICAL FIX: Explicitly ensure the ID is included in the response object
            // Mongoose's .aggregate() results often don't have the virtual 'id' or the raw '_id' accessible by default.
            // We ensure that we send the '_id' field back to the client.
            const responseWord = {
                id: wordData._id, // Send the ID field
                word: wordData.word
            };

            res.json(responseWord);
        } else {
            res.status(404).json({ message: "No words found in the database." });
        }
    } catch (error) {
        console.error("Error fetching random word:", error);
        res.status(500).json({ message: "Internal server error while fetching word." });
    }
});

/**
 * [POST] /api/vote - Submits a vote for a word.
 */
app.post('/api/vote', async (req, res) => {
    const { wordId, classification } = req.body;

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
        // Log the attempted wordId for easier debugging
        console.error("Failed to update wordId:", wordId, "with classification:", classification);
        res.status(500).json({ success: false, message: "Internal server error while recording vote." });
    }
});

/**
 * [GET] /api/top-words - Retrieves the top 5 good and top 5 bad words.
 */
app.get('/api/top-words', async (req, res) => {
    try {
        // Fetch top 5 words by net good votes (Good - Bad)
        // Sort by total good votes (Good)
        const mostlyGood = await Word.find({})
            .sort({ goodVotes: -1, badVotes: 1 }) // Primary sort: Good votes descending, Secondary sort: Bad votes ascending
            .limit(5)
            // Use .select() to ensure only necessary fields are sent, including the virtual 'id'
            .select('word goodVotes badVotes');

        // Fetch top 5 words by net bad votes (Bad - Good)
        // Sort by total bad votes (Bad)
        const mostlyBad = await Word.find({})
            .sort({ badVotes: -1, goodVotes: 1 }) // Primary sort: Bad votes descending, Secondary sort: Good votes ascending
            .limit(5)
            .select('word goodVotes badVotes');

        res.json({
            mostlyGood: mostlyGood.map(w => w.toObject()),
            mostlyBad: mostlyBad.map(w => w.toObject()),
        });
    } catch (error) {
        console.error("Error fetching top words:", error);
        res.status(500).json({ message: "Internal server error while fetching top words." });
    }
});

// --- Server Startup ---

// 1. Connect to the database
connectDB().then(() => {
    // 2. Start the Express server only after DB connection is successful
    app.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT} (Backend Version: v1.7.3 CRITICAL FIX: Word ID missing in /get-word)`);
    });
}).catch(() => {
    console.error("Server startup failed due to critical database error. Process stopped.");
});
