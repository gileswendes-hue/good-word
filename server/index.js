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
    // You can add fields for voting/scoring later here
});
const Word = mongoose.model('Word', wordSchema);


// 3. Load Configuration and Initialize App
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Path to the word list file (assumes index.js and british-words.txt are in the same directory)
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
    // **DATABASE SEEDING LOGIC**
    // This runs ONCE on the first deploy to fill the database.
    // =======================================================
    
    // Check if the collection is already populated
    const count = await Word.countDocuments();
    if (count === 0) {
        console.log('Word collection is empty. Starting database seed...');
        
        try {
            // Read the file content
            const wordListContent = fs.readFileSync(words
