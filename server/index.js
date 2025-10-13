// 1. Import Dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // If your frontend is on a different port/domain
const path = require('path');
// dotenv is not needed on Render if you set environment variables in the dashboard

// 2. Load Configuration and Initialize App
const app = express();
// Render automatically sets a PORT environment variable
const PORT = process.env.PORT || 5000; 
// Get the MongoDB URI from Render's environment variables
const MONGO_URI = process.env.MONGO_URI; 

// Use __dirname to get the directory of the currently executing script
const wordsFilePath = path.join(__dirname, 'british-words.txt');

// --- Configuration Checks ---
if (!MONGO_URI) {
    console.error("FATAL ERROR: MONGO_URI environment variable is not set.");
    process.exit(1);
}

// 3. Connect to MongoDB (CRUCIAL FIX FOR EARLY EXIT)
// Use a Promise-based connection and only start the server upon success
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // Add other Mongoose options as needed
})
.then(() => {
    console.log('MongoDB connection successful.');

    // 4. Configure Middleware
    app.use(cors()); // Allow cross-origin requests
    app.use(express.json()); // For parsing application/json (API body)
    app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

    // --- Serve Static Files (The Web Application) ---
    // Since your frontend is in the root, we set the static path to the parent directory
    // This allows the server to find index.html, style.css, and script.js
    const staticPath = path.join(__dirname, '..'); // '..' goes up one level from 'server'
    app.use(express.static(staticPath));
    
    // Serve index.html for all other GET requests (for single-page app routing, if applicable)
    app.get('/', (req, res) => {
        res.sendFile(path.join(staticPath, 'index.html'));
    });


    // 5. Define API Routes (Game Logic)
    // Example: A route to check if a word is valid
    app.post('/api/validate-word', (req, res) => {
        const { word } = req.body;
        
        // --- Your Game Logic Here ---
        // 1. Check if word exists in the 'british-words.txt' list.
        // 2. Check if word exists in your MongoDB 'dictionary' collection.
        // 3. Return { isValid: true } or { isValid: false }
        
        res.json({ message: `Received word: ${word}` });
    });

    // Example: A route to save player score
    app.post('/api/scores', async (req, res) => {
        // Example: Save score to a 'Score' model in MongoDB
        try {
            // const newScore = new Score(req.body);
            // await newScore.save();
            res.status(201).json({ message: 'Score saved successfully.' });
        } catch (error) {
            console.error('Error saving score:', error);
            res.status(500).json({ error: 'Failed to save score.' });
        }
    });


    // 6. Start the Express Server
    app.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`);
        // Render will look for this console log to confirm the app is running!
    });
})
.catch(err => {
    // THIS CATCH BLOCK IS ESSENTIAL FOR DEBUGGING YOUR CRASH
    console.error('FATAL DB CONNECTION ERROR: The server is crashing immediately!');
    console.error('Error details:', err.message); 
    // This line tells Render to stop the process, 
    // but the error message should now appear in the logs.
    process.exit(1); 

});
