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
    // Fields for voting/scoring can be added here later
});
const Word = mongoose.model('Word', wordSchema);


// 3. Load Configuration and Initialize App
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI; // Set in Render environment variables

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
.then(async () => { // **NOTE THE 'async' HERE**
    console.log('MongoDB connection successful.');
    
    // =======================================================
    // **DATABASE SEEDING LOGIC (Using Final Corrected Path)**
    // =======================================================
    
    // Check if the collection is already populated
    const count = await Word.countDocuments();
    if (count === 0) {
        console.log('Word collection is empty. Starting database seed...');
        
        try {
            // Read the file content using the corrected path
            const wordListContent = fs.readFileSync(wordsFilePath, 'utf8');
            
            // Split by newline and clean up empty lines/whitespace
            const wordsArray = wordListContent
                .split(/\r?\n/) 
                .filter(w => w.trim() !== '');
            
            // Prepare documents for insertion
            const wordDocuments = wordsArray.map(word => ({ word: word.trim().toLowerCase() }));
            
            // Insert into MongoDB
            await Word.insertMany(wordDocuments, { ordered: false });
            console.log(`Successfully inserted ${wordDocuments.length} words.`);
            
        } catch (fileError) {
            // This error log is crucial if the path is wrong or the file is corrupted
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
    // Frontend files (index.html, etc.) are still assumed to be in the root directory (../)
    const staticPath = path.join(__dirname, '..'); 
    app.use(express.static(staticPath));
    
    // Serve index.html for the base URL
    app.get('/', (req, res) => {
        res.sendFile(path.join(staticPath, 'index.html'));
    });


    // 7. Define API Routes (Game Logic)
    
    // Route to validate if a word exists in the dictionary
    app.post('/api/validate-word', async (req, res) => {
        const { word } = req.body;
        
        const cleanedWord = word ? word.trim().toLowerCase() : '';

        if (!cleanedWord) {
             return res.json({ isValid: false, message: 'No word provided.' });
        }
        
        const wordExists = await Word.findOne({ word: cleanedWord });

        if (wordExists) {
            res.json({ isValid: true, message: `Word '${word}' is valid.` });
        } else {
            res.json({ isValid: false, message: `Word '${word}' is not found.` });
        }
    });

    // Placeholder route for voting/scoring
    app.post('/api/vote', async (req, res) => {
        try {
            res.status(200).json({ message: 'Vote recorded successfully.' });
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
