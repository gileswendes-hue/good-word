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
                badVotes: 0 
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

    // **REQUIRED ROUTE:** API to get one random word (Matches frontend fetchRandomWord call)
    app.get('/api/get-word', async (req, res) => {
        try {
            // Query MongoDB to find one random word that has been voted on the fewest times (or zero)
            // $sample is used for quick random selection
            const randomWord = await Word.aggregate([
                { $sample: { size: 1 } } 
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
            // Placeholder: Fetch words with votes > 0 and sort by vote ratio.
            
            // 1. Get words with good votes > bad votes
            const mostlyGood = await Word.find({ goodVotes: { $gt: 0 }, badVotes: { $gte: 0 } })
                // Sort by ratio of goodVotes / (goodVotes + badVotes) descending (best first)
                // Note: Complex sorting is better done in app memory or with aggregation, 
                // but for simplicity, we sort by raw good votes here.
                .sort({ goodVotes: -1, badVotes: 1 }) 
                .limit(5);

            // 2. Get words with bad votes > good votes
            const mostlyBad = await Word.find({ badVotes: { $gt: 0 }, goodVotes: { $gte: 0 } })
                // Sort by ratio of badVotes / (goodVotes + badVotes) descending (worst first)
                .sort({ badVotes: -1, goodVotes: 1 })
                .limit(5);

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
                { $inc: { [updateField]: 1 } }
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
