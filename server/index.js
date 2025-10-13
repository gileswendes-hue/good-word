const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// --- Environment Variables and Configuration ---
const dbName = process.env.MONGO_DB_NAME || 'goodWordGame';
const wordCollectionName = 'words';

// Use environment variable for MongoDB URI
const uri = process.env.MONGO_URI; 

if (!uri) {
    console.error("FATAL ERROR: MONGO_URI is not set. The application cannot connect to the database.");
    process.exit(1);
}

// Create a MongoClient with a Stable API version
const client = new new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let db; // Global variable to hold the database connection

// --- Seeding Logic ---

/**
 * Seeds the word list into the database if the collection is empty.
 * Reads words from british-words.txt.
 * @param {object} collection The MongoDB collection object.
 */
async function seedWords(collection) {
    try {
        const count = await collection.countDocuments();

        if (count === 0) {
            console.log('Database is empty. Starting word seeding...');
            
            // Assuming british-words.txt is in the server directory
            const filePath = path.join(__dirname, 'british-words.txt');
            const fileContent = fs.readFileSync(filePath, 'utf8');
            
            // Filter out empty lines and trim whitespace, then map to documents
            const words = fileContent
                .split('\n')
                .map(line => line.trim())
                .filter(word => word.length > 0)
                .map(word => ({
                    word: word.toUpperCase(), // Store words in uppercase for consistency
                    goodVotes: 0,
                    badVotes: 0,
                    totalVotes: 0,
                }));

            if (words.length > 0) {
                const result = await collection.insertMany(words);
                console.log(`Successfully seeded ${result.insertedCount} words.`);
            } else {
                console.log('Word list file was empty or contained no valid words.');
            }
        } else {
            console.log(`Database already contains ${count} words. Seeding skipped.`);
        }
    } catch (error) {
        console.error('Error during word seeding:', error);
    }
}

// --- Database Connection and Initialization ---

async function connectAndInitialize() {
    try {
        await client.connect();
        db = client.db(dbName);
        console.log("Successfully connected to MongoDB!");

        const wordCollection = db.collection(wordCollectionName);
        await seedWords(wordCollection); // Check and seed words on startup

        // Start Express server after successful DB connection and seeding
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });

    } catch (error) {
        console.error("Failed to connect to MongoDB or initialize:", error);
        // Exit the process if connection fails
        process.exit(1);
    }
}

// Call the async initialization function
connectAndInitialize();

// --- API Routes ---

/**
 * Route to fetch a single word, prioritizing unvoted words.
 */
app.get('/api/get-word', async (req, res) => {
    try {
        const collection = db.collection(wordCollectionName);

        // Aggregation Pipeline to prioritize unvoted or least-voted words
        const pipeline = [
            // 1. Prioritize words with 0 total votes
            { $match: { totalVotes: 0 } }, 
            { $sample: { size: 1 } },
        ];

        let wordResult = await collection.aggregate(pipeline).toArray();

        // 2. If no unvoted words, fall back to words with the lowest total votes
        if (wordResult.length === 0) {
            console.log("No unvoted words left, fetching least-voted word.");
            const fallbackPipeline = [
                // Sort by ascending total votes
                { $sort: { totalVotes: 1 } }, 
                // Limit to the top 10 least voted words (to keep $sample efficient)
                { $limit: 10 }, 
                // Then pick one randomly
                { $sample: { size: 1 } }, 
            ];
            wordResult = await collection.aggregate(fallbackPipeline).toArray();
        }

        if (wordResult.length > 0) {
            res.json(wordResult[0]);
        } else {
            // If the collection is entirely empty or exhausted
            res.status(404).send({ message: "No words available." });
        }

    } catch (error) {
        console.error("Error in /api/get-word:", error);
        res.status(500).send({ message: "Internal server error." });
    }
});


/**
 * Route to record a vote and return an engagement message.
 */
app.post('/api/vote', async (req, res) => {
    const { wordId, voteType } = req.body;

    if (!wordId || !voteType) {
        return res.status(400).send({ message: "Missing wordId or voteType." });
    }

    try {
        const collection = db.collection(wordCollectionName);
        const objectId = new ObjectId(wordId);

        let engagementMessage = null;
        
        // 1. Get the current state of the word before updating
        const currentWord = await collection.findOne({ _id: objectId });
        
        // Safety check
        if (!currentWord) {
            return res.status(404).send({ message: "Word not found." });
        }
        
        // 2. Determine the engagement message (Highest priority check first)
        // Check for first vote ever on this word
        if (currentWord.totalVotes === 0) {
            engagementMessage = "Awesome! You were the first to vote on this word. Keep it going!";
        } 
        // Check for first good vote on this word
        else if (voteType === 'good' && currentWord.goodVotes === 0) {
            engagementMessage = "First vote in for GOOD! You've started the positive trend!";
        } 
        // Check for first bad vote on this word
        else if (voteType === 'bad' && currentWord.badVotes === 0) {
            engagementMessage = "First vote in for BAD! That word has some explaining to do.";
        }

        // 3. Prepare the database update
        const incrementField = voteType === 'good' ? 'goodVotes' : 'badVotes';
        
        const updateResult = await collection.updateOne(
            { _id: objectId },
            { 
                $inc: { 
                    [incrementField]: 1, 
                    totalVotes: 1 
                } 
            }
        );

        if (updateResult.modifiedCount === 1) {
            res.status(200).json({ success: true, engagementMessage });
        } else {
            res.status(500).send({ message: "Failed to update vote count." });
        }

    } catch (error) {
        console.error("Error in /api/vote:", error);
        res.status(500).send({ message: "Internal server error." });
    }
});


/**
 * Route to fetch the top 10 most "good" and top 10 most "bad" words.
 */
app.get('/api/top-words', async (req, res) => {
    try {
        const collection = db.collection(wordCollectionName);

        // Aggregation to calculate ratios and filter only voted words
        const pipeline = [
            { $match: { totalVotes: { $gt: 0 } } }, // Only show words with at least one vote
            {
                $addFields: {
                    // Calculate ratio of good votes to total votes
                    goodRatio: { $divide: ["$goodVotes", "$totalVotes"] },
                    // Calculate ratio of bad votes to total votes
                    badRatio: { $divide: ["$badVotes", "$totalVotes"] }
                }
            }
        ];

        const allVotedWords = await collection.aggregate(pipeline).toArray();

        // --- Mostly Good (Highest Good Ratio, tie-break by total volume) ---
        const mostlyGood = allVotedWords
            .sort((a, b) => {
                if (b.goodRatio !== a.goodRatio) {
                    return b.goodRatio - a.goodRatio; // Sort by Ratio descending
                }
                return b.totalVotes - a.totalVotes; // Tie-break by Total Votes descending
            })
            .slice(0, 10) // Take top 10

        // --- Mostly Bad (Highest Bad Ratio, tie-break by total volume) ---
        const mostlyBad = allVotedWords
            .sort((a, b) => {
                if (b.badRatio !== a.badRatio) {
                    return b.badRatio - a.badRatio; // Sort by Ratio descending
                }
                return b.totalVotes - a.totalVotes; // Tie-break by Total Votes descending
            })
            .slice(0, 10); // Take top 10
        
        res.json({ mostlyGood, mostlyBad });

    } catch (error) {
        console.error("Error in /api/top-words:", error);
        res.status(500).send({ message: "Internal server error." });
    }
});
