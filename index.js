require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const fs = require('fs');
const { Server } = require("socket.io");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGODB_URI;

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

if (!MONGO_URI) {
    console.error('FATAL ERROR: MONGODB_URI is not defined.');
} else {
    mongoose.connect(MONGO_URI)
        .then(() => console.log('MongoDB connected successfully.'))
        .catch(err => console.error('FATAL MongoDB connection error:', err));
}

const wordSchema = new mongoose.Schema({
    text: { type: String, required: true, unique: true, trim: true, lowercase: true },
    goodVotes: { type: Number, default: 0 },
    badVotes: { type: Number, default: 0 },
    notWordVotes: { type: Number, default: 0 },
    voters: [{ type: String }]
}, { timestamps: true });
const Word = mongoose.model('Word', wordSchema);

const scoreSchema = new mongoose.Schema({
    name: { type: String, required: true, maxlength: 3 },
    score: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    userId: String
});
const Score = mongoose.model('Score', scoreSchema);

const leaderboardSchema = new mongoose.Schema({ userId: { type: String, unique: true }, username: String, voteCount: { type: Number, default: 0 }, lastUpdated: { type: Date, default: Date.now } });
const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

// --- KIDS MODE LOADER ---
let kidsWords = [];
const loadKidsWords = () => {
    try {
        // 1. Try finding it in the 'public' folder first
        let p = path.join(__dirname, 'public', 'kids_words.txt');
        
        // 2. If not there, try the root folder
        if (!fs.existsSync(p)) {
            p = path.join(__dirname, 'kids_words.txt');
        }

        if (fs.existsSync(p)) {
            const data = fs.readFileSync(p, 'utf8');
            kidsWords = data.split('\n')
                .map(w => w.trim().toUpperCase())
                .filter(w => w.length > 0);
            console.log(`✅ Loaded ${kidsWords.length} kids words from: ${p}`);
        } else {
            console.warn("⚠️ kids_words.txt not found. Using fallback.");
            kidsWords = ["APPLE", "BANANA", "CAT", "DOG", "ELEPHANT", "FISH", "GRAPE", "HAT", "IGLOO", "JELLY"];
        }
    } catch (e) {
        console.error("❌ Error loading kids words:", e);
        kidsWords = ["APPLE", "BANANA", "CAT", "DOG"];
    }
};
loadKidsWords();

// --- ROOM MANAGER ---
const rooms = {};
const MODE_MINS = { 'coop': 2, 'versus': 4, 'vip': 3, 'hipster': 3, 'speed': 2, 'survival': 3, 'traitor': 3, 'kids': 2 };

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// --- CENTRALIZED PLAYER REMOVAL ---
function removePlayerFromAllRooms(socketId) {
    for (const code in rooms) {
        const room = rooms[code];
        
        // --- ADD THIS SAFETY CHECK ---
        if (!room || !room.players) continue; 
        // -----------------------------

        const idx = room.players.findIndex(p => p.id === socketId);
        
        if (idx !== -1) {
            const wasHost = (room.host === socketId);
            room.players.splice(idx, 1);
            
            // Clean up their vote
            if (room.currentVotes && room.currentVotes[socketId]) {
                delete room.currentVotes[socketId];
            }

            if (room.players.length === 0) {
                if (room.wordTimer) clearTimeout(room.wordTimer);
                delete rooms[code];
            } else {
                if (wasHost) room.host = room.players[0].id;
                
                if (room.state === 'drinking') checkDrinkingCompletion(code);
                
                if (room.state === 'playing') {
                    const activePlayers = room.players.filter(p => !p.isSpectator && (room.mode !== 'survival' || p.lives > 0));
                    // Check activePlayers exists to prevent crash
                    if (activePlayers && activePlayers.length > 0 && Object.keys(room.currentVotes).length >= activePlayers.length) {
                        finishWord(code);
                    }
                }
                
                checkInsufficientPlayers(code);
                emitUpdate(code);
            }
        }
    }
}

io.on('connection', (socket) => {
    
    socket.on('joinRoom', ({ roomCode, username, theme }) => {
        const code = roomCode.toUpperCase();
        removePlayerFromAllRooms(socket.id); 
        socket.join(code);

        if (!rooms[code]) {
            rooms[code] = {
                host: socket.id,
                players: [],
                state: 'lobby',
                mode: 'coop', 
                theme: theme || 'default',
                drinkingMode: false,
                wordIndex: 0,
                maxWords: 10,
                words: [],
                currentVotes: {},
                currentVoteTimes: {},
                accusationVotes: {}, 
                readyConfirms: new Set(),
                scores: { red: 0, blue: 0, coop: 0 },
                vipId: null,
                traitorId: null,
                wordStartTime: 0,
                wordTimer: null 
            };
        }

        const room = rooms[code];
        // If the game is already in progress, join as spectator
        const isSpectator = (room.state === 'playing' || room.state === 'accusation' || room.state === 'drinking');

        const existing = room.players.find(p => p.id === socket.id);
        if (existing) {
            existing.name = username || 'Player';
            existing.isSpectator = isSpectator; 
        } else {
            room.players.push({ 
                id: socket.id, 
                name: username || 'Player', 
                team: 'neutral',
                score: 0,
                lives: 3,
                isSpectator: isSpectator
            });
        }
        
        emitUpdate(code);
        
        // If late join, sync game state immediately
        if (isSpectator && room.words[room.wordIndex]) {
            socket.emit('gameStarted', { totalWords: room.maxWords, mode: room.mode });
            if (room.state === 'drinking') {
                socket.emit('drinkPenalty', { drinkers: [], msg: "Waiting for next word..." });
            } else {
                socket.emit('nextWord', { 
                    word: room.words[room.wordIndex], 
                    wordCurrent: room.wordIndex + 1, 
                    wordTotal: room.maxWords 
                });
            }
        }
    });

    socket.on('leaveRoom', ({ roomCode }, callback) => {
        const code = roomCode ? roomCode.toUpperCase() : '';
        socket.leave(code);
        removePlayerFromAllRooms(socket.id);
        if (typeof callback === 'function') callback();
    });

    socket.on('disconnect', () => {
        removePlayerFromAllRooms(socket.id);
    });

    socket.on('refreshLobby', ({ roomCode }) => {
        const room = rooms[roomCode];
        if (!room || room.host !== socket.id) return;
        // Purge ghosts
        const initialCount = room.players.length;
        room.players = room.players.filter(p => {
            const s = io.sockets.sockets.get(p.id);
            return s && s.connected;
        });
        if (room.players.length !== initialCount) emitUpdate(roomCode);
    });

    // FIX: This handler matches Frontend's new emitUpdate()
    socket.on('updateSettings', ({ roomCode, mode, rounds, drinking }) => {
        const room = rooms[roomCode];
        if (!room || room.host !== socket.id) return;
        
        if(mode) room.mode = mode;
        if(rounds) room.maxWords = parseInt(rounds);
        if (typeof drinking !== 'undefined') room.drinkingMode = drinking;
        
        // Force disable drinking for modes that don't support it
        if (room.mode === 'traitor' || room.mode === 'kids') room.drinkingMode = false;

        emitUpdate(roomCode);
    });
    
    socket.on('kickPlayer', ({ roomCode, targetId }) => {
        const room = rooms[roomCode];
        if (!room || room.host !== socket.id) return;
        if (targetId === room.host) return;

        const targetSocket = io.sockets.sockets.get(targetId);
        if (targetSocket) {
            targetSocket.emit('kicked');
            targetSocket.disconnect();
        }
        removePlayerFromAllRooms(targetId);
    });

    socket.on('startGame', async ({ roomCode }) => {
        const room = rooms[roomCode];
        if (!room || room.host !== socket.id) return;

        if (room.wordTimer) clearTimeout(room.wordTimer);

        room.state = 'playing';
        room.wordIndex = 0;
        room.currentVotes = {};
        room.currentVoteTimes = {};
        room.accusationVotes = {};
        room.readyConfirms = new Set();
        room.vipId = null;
        room.traitorId = null; // Reset Traitor

        // Reset Player States
        room.players.forEach(p => {
            p.lives = 3;
            p.score = 0;
            p.isSpectator = false;
        });

        // --- MODE SETUP ---
        if (room.mode === 'versus') {
            const shuffled = shuffle([...room.players]);
            shuffled.forEach((p, i) => {
                const op = room.players.find(rp => rp.id === p.id);
                if(op) op.team = (i % 2 === 0) ? 'red' : 'blue';
            });
        }
        else if (room.mode === 'traitor') {
            // 1. Pick Random Traitor
            const potentialTraitors = room.players.filter(p => !p.isSpectator);
            if (potentialTraitors.length > 0) {
                const r = potentialTraitors[Math.floor(Math.random() * potentialTraitors.length)];
                room.traitorId = r.id;
                
                // 2. Notify ONLY the Traitor (Must happen before gameStarted)
                io.to(room.traitorId).emit('roleAlert', 'You are the TRAITOR! Try to make the room fail.');
            }
        }
        else if (room.mode === 'vip') {
            const r = room.players[Math.floor(Math.random() * room.players.length)];
            room.vipId = r.id;
        }

        emitUpdate(roomCode);

        // --- GET WORDS ---
        try {
            if (room.mode === 'kids') {
                const shuffled = shuffle([...kidsWords]); // Assuming kidsWords is defined globally
                let selection = [];
                while(selection.length < room.maxWords && shuffled.length > 0) selection = selection.concat(shuffled);
                room.words = selection.slice(0, room.maxWords).map(t => ({ text: t }));
            } else {
                // Ensure we get random words from DB
                const randomWords = await Word.aggregate([{ $sample: { size: room.maxWords } }]);
                room.words = randomWords;
            }

            // 3. Start Game (Frontend will now show Countdown + Traitor Message)
            io.to(roomCode).emit('gameStarted', { 
                totalWords: room.maxWords, 
                mode: room.mode,
                vipId: room.vipId,
                words: room.words
            });
            
            // Start first word after countdown (4s buffer)
            room.wordTimer = setTimeout(() => sendNextWord(roomCode), 4000);

        } catch (e) { console.error(e); }
    });

    socket.on('submitVote', ({ roomCode, vote }) => {
        const room = rooms[roomCode];
        if (!room || room.state !== 'playing') return;

        const player = room.players.find(p => p.id === socket.id);
        if (!player || player.isSpectator) return;
        
        // Strict check for dead players in survival
        if (room.mode === 'survival' && player.lives <= 0) return;

        room.currentVotes[socket.id] = vote;
        room.currentVoteTimes[socket.id] = Date.now();
        io.to(roomCode).emit('playerVoted', { playerId: socket.id });

        const activePlayers = room.players.filter(p => !p.isSpectator && (room.mode !== 'survival' || p.lives > 0));
        if (Object.keys(room.currentVotes).length >= activePlayers.length) {
            finishWord(roomCode);
        }
    });

    socket.on('submitAccusation', ({ roomCode, targetId }) => {
        const room = rooms[roomCode];
        if (!room || room.state !== 'accusation') return;
        room.accusationVotes[socket.id] = targetId;
        const activeCount = room.players.filter(p => !p.isSpectator).length;
        if (Object.keys(room.accusationVotes).length >= activeCount) {
            processGameEnd(roomCode);
        }
    });

    socket.on('confirmReady', ({ roomCode }) => {
        const room = rooms[roomCode];
        if (!room || room.state !== 'drinking') return;
        
        room.readyConfirms.add(socket.id);
        checkDrinkingCompletion(roomCode);
    });
});

function checkDrinkingCompletion(roomCode) {
    const room = rooms[roomCode];
    if (!room || room.state !== 'drinking') return;

    const activePlayers = room.players.filter(p => !p.isSpectator && (room.mode !== 'survival' || p.lives > 0));
    const allReady = activePlayers.every(p => room.readyConfirms.has(p.id));

    if (allReady) {
        room.state = 'playing';
        io.to(roomCode).emit('drinkingComplete');
        sendNextWord(roomCode);
    }
}

function checkInsufficientPlayers(roomCode) {
    const room = rooms[roomCode];
    if (!room || room.state === 'lobby') return;

    const activeCount = room.players.filter(p => !p.isSpectator).length;
    const minNeeded = MODE_MINS[room.mode] || 2;
    let abort = false;
    let reason = "";

    if (activeCount < minNeeded) { abort = true; reason = "Not enough players remaining!"; }
    if (room.mode === 'versus') {
        const redC = room.players.filter(p => p.team === 'red' && !p.isSpectator).length;
        const blueC = room.players.filter(p => p.team === 'blue' && !p.isSpectator).length;
        if (redC === 0 || blueC === 0) { abort = true; reason = "One team is empty!"; }
    }

    if (abort) processGameEnd(roomCode, reason);
}

function emitUpdate(code) {
    if (!rooms[code]) return;
    io.to(code).emit('roomUpdate', {
        players: rooms[code].players,
        host: rooms[code].host,
        mode: rooms[code].mode,
        maxWords: rooms[code].maxWords,
        drinkingMode: rooms[code].drinkingMode, 
        theme: rooms[code].theme, // SEND THEME
        state: rooms[code].state
    });
}

function sendNextWord(roomCode) {
    const room = rooms[roomCode];
    if (!room) return;

    if (room.mode === 'survival') {
        const alive = room.players.filter(p => !p.isSpectator && p.lives > 0);
        if (alive.length <= 1 && room.players.length > 1) {
            processGameEnd(roomCode);
            return;
        }
    }

    // FIX: Removed 'accusation' logic. Always end game if words run out.
    if (room.wordIndex >= room.words.length) {
        processGameEnd(roomCode);
        return;
    }

    const word = room.words[room.wordIndex];
    room.currentVotes = {};
    room.currentVoteTimes = {};
    room.wordStartTime = Date.now();
    
    io.to(roomCode).emit('nextWord', { 
        word: word, 
        wordCurrent: room.wordIndex + 1, 
        wordTotal: room.maxWords 
    });
}

function processGameEnd(roomCode) {
    const room = rooms[roomCode];
    if (!room) return;

    room.state = 'lobby'; // Reset state so they can play again
    
    // Sort rankings
    const rankings = [...room.players].sort((a, b) => b.score - a.score);
    
    let msg = "Game Over!";
    
    // --- TRAITOR END GAME LOGIC ---
    if (room.mode === 'traitor') {
        // Calculate Group Sync %
        // (Assuming you track a 'coop' score or similar in finishWord)
        const totalPossible = room.maxWords; 
        const groupScore = room.scores.coop || 0; 
        const syncPercent = totalPossible > 0 ? (groupScore / totalPossible) * 100 : 0;

        // Win Condition: If Sync is 100%, Team Wins. If less, Traitor Wins.
        if (syncPercent === 100) {
            msg = "TEAM WINS! Perfect Sync!";
        } else {
            msg = "TRAITOR WINS! The sync was broken.";
        }
    }
    // ------------------------------

    io.to(roomCode).emit('gameOver', {
        scores: room.scores,
        rankings: rankings,
        mode: room.mode,
        msg: msg,
        specialRoleId: room.traitorId || room.vipId // CRITICAL: Send Traitor ID for the reveal!
    });

    emitUpdate(roomCode);
}

function finishWord(roomCode) {
    const room = rooms[roomCode];
    if (!room) return;

    const voteValues = Object.values(room.currentVotes);
    const counts = {};
    voteValues.forEach(v => counts[v] = (counts[v] || 0) + 1);

    const currentWord = room.words[room.wordIndex];
    const votes = room.currentVotes; 
    
    const getMajority = (voteList) => {
        const g = voteList.filter(x => x === 'good').length;
        const b = voteList.filter(x => x === 'bad').length;
        if (g > b) return 'good';
        if (b > g) return 'bad';
        return 'draw';
    };

    let resultData = {};

    if (room.mode === 'versus') {
        const redM = room.players.filter(p => p.team === 'red' && !p.isSpectator);
        const blueM = room.players.filter(p => p.team === 'blue' && !p.isSpectator);
        const redV = redM.map(p => votes[p.id] || 'none');
        const blueV = blueM.map(p => votes[p.id] || 'none');
        
        const calcSync = (v) => {
            if(!v.length) return 0;
            const g = v.filter(x => x === 'good').length;
            const b = v.filter(x => x === 'bad').length;
            return Math.round((Math.max(g, b) / v.length) * 100);
        };
        const rSync = calcSync(redV);
        const bSync = calcSync(blueV);
        
        let msgExt = "";
        if (rSync > bSync) room.scores.red++;
        else if (bSync > rSync) room.scores.blue++;
        else {
            const getAvg = (members) => {
                let total = 0; let count = 0;
                members.forEach(p => { if(room.currentVoteTimes[p.id]) { total += (room.currentVoteTimes[p.id] - room.wordStartTime); count++; } });
                return count ? total/count : 999999;
            };
            const rTime = getAvg(redM);
            const bTime = getAvg(blueM);
            if (rTime < bTime) { room.scores.red++; msgExt = "(Red Faster!)"; } 
            else if (bTime < rTime) { room.scores.blue++; msgExt = "(Blue Faster!)"; }
        }

        const rMaj = getMajority(redV);
        const bMaj = getMajority(blueV);
        room.players.forEach(p => {
            const v = votes[p.id];
            if(p.team === 'red' && v === rMaj) p.score++;
            if(p.team === 'blue' && v === bMaj) p.score++;
        });
        resultData = { redSync: rSync, blueSync: bSync, msg: msgExt ? `Tie Break! ${msgExt}` : null };

    } else {
        const allVotes = Object.values(votes);
        const maj = getMajority(allVotes);
        
        if(room.mode === 'traitor') { 
             const g = allVotes.filter(x => x === 'good').length;
             const b = allVotes.filter(x => x === 'bad').length;
             const sync = Math.round((Math.max(g, b) / allVotes.length) * 100);
             if (sync === 100) room.players.forEach(p => { if (p.id !== room.traitorId && !p.isSpectator) p.score += 2; });
             else { const s = room.players.find(p=>p.id===room.traitorId); if(s) s.score+=3; }
             resultData = { msg: sync===100 ? "100% Sync! Traitor Failed." : `Sync Broken (${sync}%)! Traitor Wins.` };
        } else if (room.mode === 'survival') {
             if (maj !== 'draw') {
                room.players.forEach(p => {
                    if (p.lives > 0 && !p.isSpectator) {
                        const v = votes[p.id];
                        if (v && v !== maj) p.lives--;
                        else if (v === maj) p.score++;
                    }
                });
             }
             resultData = { msg: `Majority: ${maj.toUpperCase()}` };
        } else {
             const g = allVotes.filter(x => x === 'good').length;
             const b = allVotes.filter(x => x === 'bad').length;
             const sync = Math.round((Math.max(g, b) / allVotes.length) * 100);
             if (sync >= 100) room.scores.coop += 1;
             room.players.forEach(p => { if (votes[p.id] === maj && !p.isSpectator) p.score++; });
             resultData = { sync, score: room.scores.coop };
        }
    }

    let drinkers = [];
    let drinkMsg = "Penalty Round";

    if (room.drinkingMode && room.mode !== 'traitor' && room.mode !== 'kids') {
        if (Math.random() < 0.1) { 
            const rand = Math.random();
            if (rand < 0.7) {
                let slowestId = null;
                let slowestTime = 0;
                for (const [pid, timestamp] of Object.entries(room.currentVoteTimes)) {
                    const dur = timestamp - room.wordStartTime;
                    if (dur > slowestTime) { slowestTime = dur; slowestId = pid; }
                }
                if (slowestId && slowestTime > 3000) {
                     const p = room.players.find(pl => pl.id === slowestId);
                     drinkers.push({ id: slowestId, name: p ? p.name : 'Unknown', reason: 'Too Slow!', icon: '🐌' });
                }

                const allVotes = Object.values(votes);
                const maj = getMajority(allVotes);
                if (maj !== 'draw') {
                    room.players.forEach(p => {
                        if (p.isSpectator) return;
                        const v = votes[p.id];
                        if (v && v !== maj) {
                            if (!drinkers.find(d => d.id === p.id)) {
                                drinkers.push({ id: p.id, name: p.name, reason: 'Minority Vote!', icon: '🤡' });
                            }
                        }
                    });
                }
            } else if (rand < 0.85) {
                drinkMsg = "SOCIAL! EVERYONE DRINKS!";
                room.players.forEach(p => {
                    if (!p.isSpectator) drinkers.push({ id: p.id, name: p.name, reason: 'Social!', icon: '🍻' });
                });
            } else {
                drinkMsg = "DEMOCRACY MANIFEST!";
                let fastestId = null;
                let fastestTime = Infinity;
                for (const [pid, timestamp] of Object.entries(room.currentVoteTimes)) {
                    const dur = timestamp - room.wordStartTime;
                    if (dur < fastestTime) { fastestTime = dur; fastestId = pid; }
                }
                if (fastestId) {
                     const p = room.players.find(pl => pl.id === fastestId);
                     drinkers.push({ id: fastestId, name: p ? p.name : 'Unknown', reason: 'NOMINATE SOMEONE!', icon: '🫵' });
                }
            }
        }
    }

    io.to(roomCode).emit('roundResult', {
        mode: room.mode,
        data: resultData,
        word: currentWord.text,
        players: room.players,
        votes: votes 
    });

    room.wordIndex++;

    // FIX: End game immediately if words run out. ADD RETURN.
    if (room.wordIndex >= room.maxWords) {
        processGameEnd(roomCode);
        return; // <--- THIS IS CRITICAL
    }

    // FIX: Only schedule ONE timer
    if (drinkers.length > 0) {
        room.state = 'drinking';
        room.readyConfirms = new Set();
        io.to(roomCode).emit('drinkPenalty', { drinkers, msg: drinkMsg });
    } else {
        room.wordTimer = setTimeout(() => sendNextWord(roomCode), 3000);
    }
}

app.get('/kids_words.txt', (req, res) => {
    const p = path.join(__dirname, 'kids_words.txt');
    if (fs.existsSync(p)) res.sendFile(p);
    else res.status(404).send(""); 
});

app.get('/api/words/all', async (req, res) => { try { res.json(await Word.find().sort({ createdAt: -1 })); } catch (e) { res.json([]); } });
app.get('/api/words', async (req, res) => { try { res.json(await Word.aggregate([{ $sample: { size: 1 } }])); } catch (e) { res.json({message:"Error"}); } });
app.put('/api/words/:id/vote', async (req, res) => { try { await Word.findByIdAndUpdate(req.params.id, { $inc: { [req.body.voteType + 'Votes']: 1 } }); res.json({message:"OK"}); } catch (e) { res.status(500).json({}); } });
app.post('/api/words', async (req, res) => { try { const n = new Word({ text: req.body.text }); await n.save(); res.status(201).json(n); } catch (e) { res.status(500).json({}); } });
app.get('/api/leaderboard', async (req, res) => { try { res.json(await Leaderboard.find().sort({voteCount:-1}).limit(10)); } catch(e){res.json([])} });
app.post('/api/leaderboard', async (req, res) => { try { await Leaderboard.findOneAndUpdate({userId:req.body.userId}, req.body, {upsert:true}); res.json({message:"OK"}); } catch(e){res.status(500).send()} });
app.get('/api/scores', async (req, res) => { try { res.json(await Score.find().sort({score:-1}).limit(10)); } catch(e){res.json([])} });
app.post('/api/scores', async (req, res) => { try { const s = new Score(req.body); await s.save(); res.json(s); } catch(e){res.json({})} });

server.listen(PORT, () => console.log(`Server on ${PORT}`));
