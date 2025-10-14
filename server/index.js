// Basic Node.js/Express server setup for handling word voting and ratings.
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');

const app = express();
const port = 3000; // Standard port for the server

// --- Configuration and Initialization ---
app.use(express.json());

// MongoDB connection string (Replace with your actual connection string)
// NOTE: In a real environment, this should come from environment variables.
const uri = "mongodb+srv://user:password@cluster.mongodb.net/word_classifier?retryWrites=true&w=majority";
const client = new MongoClient(uri);

// List of words to draw from (in a real app, this would be a separate MongoDB collection)
const INITIAL_WORDS = [
    "innovation", "failure", "success", "challenge", "opportunity",
    "risk", "growth", "stagnation", "teamwork", "solo", "kindness",
    "greed", "empathy", "conflict", "joy", "sadness", "freedom",
    "oppression", "peace", "war", "truth", "lie", "future", "past"
];
let wordsCollection;

async function run() {
    try {
        await client.connect();
        const database = client.db('word_db');
        wordsCollection = database.collection('words');
        console.log("Successfully connected to MongoDB.");

        // Ensure all initial words exist in the database with zero votes
        await initializeWords();

        app.listen(port, () => {
            console.log(`Server listening at http://localhost:${port}`);
        });

    } catch (err) {
        console.error("Failed to connect to MongoDB or start server:", err);
        // Do not exit process, allowing the frontend to load static files even if DB is down.
    }
}

// Function to ensure initial words are in the DB
async function initializeWords() {
    for (const word of INITIAL_WORDS) {
        // Upsert: find and update, or insert if not found
        await wordsCollection.updateOne(
            { word: word },
            { 
                $setOnInsert: { 
                    word: word, 
                    goodVotes: 0, 
                    badVotes: 0, 
                    totalVotes: 0 
                } 
            },
            { upsert: true }
        );
    }
    console.log("Word list initialized.");
}

// --- API Routes ---

/**
 * Route to fetch a random word for classification.
 */
app.get('/api/get-word', async (req, res) => {
    try {
        // Use MongoDB's aggregation pipeline to get a random word
        const randomWord = await wordsCollection.aggregate([
            { $sample: { size: 1 } },
            { $project: { _id: 0, word: 1, wordId: '$_id' } }
        ]).toArray();

        if (randomWord.length === 0) {
            return res.status(404).json({ error: "No words available." });
        }

        res.json(randomWord[0]);
    } catch (error) {
        console.error("Error fetching random word:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

/**
 * Route to submit a vote for a word.
 */
app.post('/api/vote', async (req, res) => {
    const { wordId, voteType } = req.body;

    if (!wordId || (voteType !== 'good' && voteType !== 'bad')) {
        return res.status(400).json({ error: "Invalid wordId or voteType." });
    }

    try {
        const updateField = (voteType === 'good') ? 'goodVotes' : 'badVotes';
        const result = await wordsCollection.updateOne(
            { _id: new ObjectId(wordId) },
            { $inc: { [updateField]: 1, totalVotes: 1 } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Word not found." });
        }

        res.json({ success: true, engagementMessage: "Vote recorded successfully!" });

    } catch (error) {
        console.error("Error submitting vote:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

/**
 * Route to fetch the top rated words (Community Ratings).
 */
app.get('/api/top-words', async (req, res) => {
    try {
        // --- CRITICAL CHANGE: Set minimum votes to 1 ---
        const MIN_VOTES = 1; 

        const pipeline = [
            {
                // Match words with at least the minimum number of votes
                $match: { totalVotes: { $gte: MIN_VOTES } }
            },
            {
                // Calculate ratios
                $addFields: {
                    goodRatio: { $divide: ["$goodVotes", "$totalVotes"] },
                    badRatio: { $divide: ["$badVotes", "$totalVotes"] }
                }
            },
            {
                // Project only necessary fields
                $project: {
                    _id: 0,
                    word: 1,
                    goodVotes: 1,
                    badVotes: 1,
                    totalVotes: 1,
                    goodRatio: 1,
                    badRatio: 1
                }
            }
        ];

        const allRatedWords = await wordsCollection.aggregate(pipeline).toArray();

        // Separate words into mostly good and mostly bad lists
        const mostlyGood = allRatedWords
            .filter(w => w.goodRatio > 0.5)
            .sort((a, b) => b.goodRatio - a.goodRatio)
            .slice(0, 10); // Take top 10

        const mostlyBad = allRatedWords
            .filter(w => w.badRatio > 0.5)
            .sort((a, b) => b.badRatio - a.badRatio)
            .slice(0, 10); // Take top 10

        res.json({ mostlyGood, mostlyBad });

    } catch (error) {
        console.error("Error fetching top words:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

// --- Static File Serving (Frontend) ---
// Serve static files from the project root directory (one level up from /server)
app.use(express.static(path.join(__dirname, '..')));

// Start the server and connect to DB
run();
