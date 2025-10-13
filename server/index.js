// =======================================================
// index.js (Backend Server - Located in the /server directory)
// =======================================================

// 1. Import Dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { Schema } = mongoose;

// 2. Define the Mongoose Word Model
// This schema will create a 'words' collection in your MongoDB
const wordSchema = new Schema({
    word: { type: String, required: true, unique: true },
    goodVotes: { type: Number, default: 0 }, // Added fields for voting
    badVotes: { type: Number, default: 0 },  // Added fields for voting
    totalVotes: { type: Number, default: 0 }, // Track total votes for easier sorting
});
const Word = mongoose.model('Word', wordSchema);


// 3. Load Configuration and Initialize App
const app = express();
// PORT 5000 is standard for Express, but Render provides its own PORT via environment variables
const PORT = process.env.PORT || 5000; 
const MONGO_URI = process.env.MONGO_URI; 

// **FINAL CORRECTED PATHING:** Assumes index.js and british-words.txt are in the same directory (/server)
const wordsFilePath = path.join(__dirname, 'british-words.txt'); 


// --- Configuration Checks ---
if (!MONGO_URI) {
    console.error("FATAL ERROR: MONGO_URI environment variable is not set.");
    process.exit(1);
}


// 4. Connect to MongoDB and Start Server
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
})
.then(async () => {
    console.log('MongoDB connection successful.');
    
    // =======================================================
    // **DATABASE SEEDING LOGIC**
    // =======================================================
    
    const count = await Word.countDocuments();
    if (count === 0) {
        console.log('Word collection is empty. Starting database seed...');
        
        try {
            // Read the file content synchronously (memory issue addressed via package.json flag)
            const wordListContent = fs.readFileSync(wordsFilePath, 'utf8');
            
            // Split by newline and clean up empty lines/whitespace
            const wordsArray = wordListContent
                .split(/\r?\n/) 
                .filter(w => w.trim() !== '');
            
            // Prepare documents for insertion
            const wordDocuments = wordsArray.map(word => ({ 
                word: word.trim().toLowerCase(), 
                goodVotes: 0, 
                badVotes: 0,
                totalVotes: 0 // Initialize new field
            }));
            
            // Insert into MongoDB
            await Word.insertMany(wordDocuments, { ordered: false });
            console.log(`Successfully inserted ${wordDocuments.length} words.`);
            
        } catch (fileError) {
            console.error(`FATAL FILE ERROR: Failed to read or process ${path.basename(wordsFilePath)}.`);
            console.error('File Read/Seed Error details:', fileError.message); 
        }
    } else {
        console.log(`Word collection already contains ${count} words. Skipping seed.`);
    }


    // 5. Configure Middleware
    app.use(cors()); 
    app.use(express.json()); 
    app.use(express.urlencoded({ extended: true })); 

    
    // 6. Serve Static Files (The Web Application)
    // Frontend files (index.html, script.js, etc.) are assumed to be in the parent directory (../)
    const staticPath = path.join(__dirname, '..'); 
    app.use(express.static(staticPath));
    
    // Serve index.html for the base URL
    app.get('/', (req, res) => {
        res.sendFile(path.join(staticPath, 'index.html'));
    });


    // 7. Define API Routes (Game Logic)

    // **IMPROVED ROUTE:** API to get one random word, prioritizing unvoted words
    app.get('/api/get-word', async (req, res) => {
        try {
            // Find a random word that has the MINIMUM number of votes.
            const randomWord = await Word.aggregate([
                // 1. Sort by totalVotes ascending (0 votes first)
                { $sort: { totalVotes: 1 } },
                // 2. Group by totalVotes and sample 1 word from the smallest group
                { 
                    $group: { 
                        _id: "$totalVotes", 
                        words: { $push: "$$ROOT" } 
                    } 
                },
                // 3. Sort groups by the number of votes (the smallest vote count first)
                { $sort: { _id: 1 } },
                // 4. Sample 1 word from the first group (the words with the lowest vote count)
                { $limit: 1 },
                { $unwind: "$words" },
                { $replaceRoot: { newRoot: "$words" } },
                { $sample: { size: 1 } } // Final random selection from the lowest-voted group
            ]);

            if (randomWord && randomWord.length > 0) {
                // Return the full word document, including vote counts
                res.json(randomWord[0]);
            } else {
                // Signals 404 to the frontend, which displays "NO MORE WORDS!"
                res.status(404).json({ message: "No words found in database." });
            }
        } catch (error) {
            console.error('Error fetching random word:', error);
            res.status(500).json({ error: 'Failed to fetch word.' });
        }
    });

    // **REQUIRED ROUTE:** API to get the top/bottom words (Matches frontend fetchTopWords call)
    app.get('/api/top-words', async (req, res) => {
        try {
            // --- UPDATED AGGREGATION FOR CORRECT SORTING ---
            
            // 1. Get mostly good words (Score = Ratio + (Volume/1000) for tie-breaking)
            const mostlyGood = await Word.aggregate([
                // Must have at least one vote to be considered 'top'
                { $match: { totalVotes: { $gt: 0 } } },
                // Calculate the score: Ratio (0 to 1) + TotalVotes (small bonus for confidence)
                { $addFields: { 
                    goodRatio: { $divide: ["$goodVotes", "$totalVotes"] },
                } },
                // Sort by the raw ratio first (desc), then totalVotes (desc)
                { $sort: { goodRatio: -1, totalVotes: -1 } }, 
                { $limit: 5 }
            ]);

            // 2. Get mostly bad words (Score = Ratio + (Volume/1000) for tie-breaking)
            const mostlyBad = await Word.aggregate([
                // Must have at least one vote to be considered 'top'
                { $match: { totalVotes: { $gt: 0 } } },
                // Calculate the score: Bad Ratio (0 to 1) + TotalVotes (small bonus for confidence)
                 { $addFields: { 
                    badRatio: { $divide: ["$badVotes", "$totalVotes"] },
                } },
                // Sort by the raw bad ratio first (desc), then totalVotes (desc)
                { $sort: { badRatio: -1, totalVotes: -1 } },
                { $limit: 5 }
            ]);

            res.json({ mostlyGood, mostlyBad });

        } catch (error) {
            console.error('Error fetching top words data:', error);
            res.status(500).json({ error: 'Failed to fetch top words.' });
        }
    });

    // Route to handle voting
    app.post('/api/vote', async (req, res) => {
        const { wordId, voteType } = req.body;
        
        try {
            const updateField = voteType === 'good' ? 'goodVotes' : 'badVotes';
            
            // Find the word by its string (which is used as the ID in the frontend mock)
            const result = await Word.updateOne(
                { word: wordId.toLowerCase() },
                { 
                    $inc: { 
                        [updateField]: 1,
                        totalVotes: 1 // Increment totalVotes with every vote
                    } 
                }
            );

            if (result.matchedCount === 0) {
                 return res.status(404).json({ message: 'Word not found for voting.' });
            }

            res.status(200).json({ message: `Vote recorded successfully for ${wordId}.` });
        } catch (error) {
            console.error('Error processing vote:', error);
            res.status(500).json({ error: 'Failed to record vote.' });
        }
    });


    // 8. Start the Express Server
    app.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`);
    });
})
.catch(err => {
    // Essential final catch for DB connection errors
    console.error('FATAL DB CONNECTION ERROR: The server is crashing immediately!');
    console.error('Error details:', err.message); 
    process.exit(1); 
});
