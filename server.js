// server.js
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// 1. Connect to MongoDB (The source of your REAL data)
// Make sure you set the MONGODB_URI environment variable in Render
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB:', err));

// 2. Define the Word Schema (Must match your existing database data)
const wordSchema = new mongoose.Schema({
    text: String,
    goodVotes: { type: Number, default: 0 },
    badVotes: { type: Number, default: 0 },
    notWordVotes: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});
const Word = mongoose.model('Word', wordSchema);

// 3. Middleware to handle JSON and Static Files
app.use(express.json());
app.use(express.static(__dirname)); // Serves index.html, css/, js/

// ---------------------------------------------------------
// API ROUTES (This is what script.js was calling!)
// ---------------------------------------------------------

// GET all words
app.get('/api/words', async (req, res) => {
    try {
        const words = await Word.find();
        res.json(words);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// VOTE on a word
app.put('/api/words/:id/vote', async (req, res) => {
    try {
        const { voteType } = req.body;
        const field = voteType === 'good' ? 'goodVotes' : 
                      voteType === 'bad' ? 'badVotes' : 'notWordVotes';
        
        await Word.findByIdAndUpdate(req.params.id, { $inc: { [field]: 1 } });
        res.json({ message: 'Vote counted' });
    } catch (err) {
        res.status(500).json({ message: 'Error voting' });
    }
});

// SUBMIT a new word
app.post('/api/words', async (req, res) => {
    try {
        const text = req.body.text.trim();
        const existing = await Word.findOne({ text: { $regex: new RegExp(`^${text}$`, 'i') } });
        
        if (existing) {
            return res.status(200).json(existing);
        }
        
        const newWord = new Word({ text });
        await newWord.save();
        res.status(201).json(newWord);
    } catch (err) {
        res.status(500).json({ message: 'Error submitting word' });
    }
});

// ---------------------------------------------------------
// SERVE THE GAME
// ---------------------------------------------------------
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
