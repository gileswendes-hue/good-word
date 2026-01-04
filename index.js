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

let kidsWords = [];
const loadKidsWords = () => {
    try {
        let p = path.join(__dirname, 'public', 'kids_words.txt');
        if (!fs.existsSync(p)) p = path.join(__dirname, 'kids_words.txt');
        if (fs.existsSync(p)) {
            const data = fs.readFileSync(p, 'utf8');
            kidsWords = data.split('\n').map(w => w.trim().toUpperCase()).filter(w => w.length > 0);
            console.log(`✅ Loaded ${kidsWords.length} kids words.`);
        } else {
            kidsWords = ["APPLE", "BANANA", "CAT", "DOG"];
        }
    } catch (e) { console.error(e); kidsWords = ["APPLE", "BANANA"]; }
};
loadKidsWords();

const rooms = {};
const MODE_MINS = { 'coop': 2, 'versus': 4, 'vip': 3, 'hipster': 3, 'speed': 2, 'survival': 2, 'traitor': 3, 'kids': 2 };

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function removePlayerFromAllRooms(socketId) {
    for (const code in rooms) {
        const room = rooms[code];
        if (!room || !room.players) continue;
        const idx = room.players.findIndex(p => p.id === socketId);
        if (idx !== -1) {
            const wasHost = (room.host === socketId);
            room.players.splice(idx, 1);
            if (room.currentVotes && room.currentVotes[socketId]) delete room.currentVotes[socketId];
            if (room.players.length === 0) {
                if (room.wordTimer) clearTimeout(room.wordTimer);
                delete rooms[code];
            } else {
                if (wasHost) room.host = room.players[0].id;
                if (room.state === 'drinking') checkDrinkingCompletion(code);
                if (room.state === 'playing') {
                    const activePlayers = room.players.filter(p => !p.isSpectator && (room.mode !== 'survival' || p.lives > 0));
                    if (activePlayers && activePlayers.length > 0 && Object.keys(room.currentVotes).length >= activePlayers.length) finishWord(code);
                }
                checkInsufficientPlayers(code);
                emitUpdate(code);
            }
        }
    }
}

io.on('connection', (socket) => {
    // Get list of public games
    socket.on('getPublicGames', () => {
        const publicGames = [];
        for (const code in rooms) {
            const room = rooms[code];
            if (room && room.isPublic && room.state === 'lobby' && room.players.length < room.maxPlayers) {
                publicGames.push({
                    roomCode: code,
                    mode: room.mode,
                    players: room.players.length,
                    maxPlayers: room.maxPlayers
                });
            }
        }
        socket.emit('publicGamesList', publicGames);
    });

    socket.on('joinRoom', ({ roomCode, username, theme, isPublic, maxPlayers }) => {
        const code = roomCode.toUpperCase();
        removePlayerFromAllRooms(socket.id); 
        
        // Check if room exists and is full
        if (rooms[code] && rooms[code].isPublic && rooms[code].players.length >= rooms[code].maxPlayers) {
            socket.emit('roomFull', { message: 'This room is full' });
            return;
        }
        
        socket.join(code);
        if (!rooms[code]) {
            rooms[code] = {
                host: socket.id, players: [], state: 'lobby', mode: 'coop', 
                theme: theme || 'default', drinkingMode: false, wordIndex: 0, maxWords: 10, 
                words: [], currentVotes: {}, currentVoteTimes: {}, accusationVotes: {}, 
                readyConfirms: new Set(), scores: { red: 0, blue: 0, coop: 0 }, 
                vipId: null, traitorId: null, wordStartTime: 0, wordTimer: null,
                isPublic: isPublic || false,
                maxPlayers: maxPlayers || 8
            };
        }
        const room = rooms[code];
        const isSpectator = (room.state === 'playing' || room.state === 'drinking');
        const existing = room.players.find(p => p.id === socket.id);
        if (existing) { existing.name = username || 'Player'; existing.isSpectator = isSpectator; } 
        else { room.players.push({ id: socket.id, name: username || 'Player', team: 'neutral', score: 0, lives: 3, isSpectator: isSpectator }); }
        emitUpdate(code);
        if (isSpectator && room.words[room.wordIndex]) {
            socket.emit('gameStarted', { totalWords: room.maxWords, mode: room.mode });
            if (room.state === 'drinking') socket.emit('drinkPenalty', { drinkers: [], msg: "Waiting..." });
            else socket.emit('nextWord', { word: room.words[room.wordIndex], wordCurrent: room.wordIndex + 1, wordTotal: room.maxWords });
        }
    });

    socket.on('leaveRoom', ({ roomCode }, callback) => {
        const code = roomCode ? roomCode.toUpperCase() : '';
        socket.leave(code);
        removePlayerFromAllRooms(socket.id);
        if (typeof callback === 'function') callback();
    });

    socket.on('disconnect', () => { removePlayerFromAllRooms(socket.id); });

    socket.on('refreshLobby', ({ roomCode }) => {
        const room = rooms[roomCode];
        if (!room || room.host !== socket.id) return;
        room.players = room.players.filter(p => io.sockets.sockets.get(p.id)?.connected);
        emitUpdate(roomCode);
    });

    // --- FIX: Theme Sync & Drinking Fix ---
    socket.on('updateSettings', ({ roomCode, mode, rounds, drinking, theme }) => {
        const room = rooms[roomCode];
        if (!room || room.host !== socket.id) return;
        if(mode) room.mode = mode;
        if(rounds) room.maxWords = parseInt(rounds);
        if (typeof drinking !== 'undefined') room.drinkingMode = drinking;
        if (theme) room.theme = theme; // <--- SAVE THEME
        if (room.mode === 'kids') room.drinkingMode = false;
        emitUpdate(roomCode);
    });

    socket.on('kickPlayer', ({ roomCode, targetId }) => {
        const room = rooms[roomCode];
        if (!room || room.host !== socket.id || targetId === room.host) return;
        const targetSocket = io.sockets.sockets.get(targetId);
        if (targetSocket) { targetSocket.emit('kicked'); targetSocket.disconnect(); }
        removePlayerFromAllRooms(targetId);
    });

    socket.on('startGame', async ({ roomCode }) => {
        const room = rooms[roomCode];
        if (!room || room.host !== socket.id) return;
        if (room.wordTimer) clearTimeout(room.wordTimer);
        room.state = 'playing'; room.wordIndex = 0; room.currentVotes = {}; room.currentVoteTimes = {}; 
        room.readyConfirms = new Set(); room.vipId = null; room.traitorId = null;
        room.players.forEach(p => { p.lives = 3; p.score = 0; p.isSpectator = false; });

        if (room.mode === 'versus') {
            const shuffled = shuffle([...room.players]);
            shuffled.forEach((p, i) => { const op = room.players.find(rp => rp.id === p.id); if(op) op.team = (i % 2 === 0) ? 'red' : 'blue'; });
        } else if (room.mode === 'traitor') {
            const potential = room.players.filter(p => !p.isSpectator);
            if (potential.length > 0) {
                room.traitorId = potential[Math.floor(Math.random() * potential.length)].id;
                io.to(room.traitorId).emit('roleAlert', 'You are the TRAITOR! Try to make the room fail.');
            }
        } else if (room.mode === 'vip') {
            room.vipId = room.players[Math.floor(Math.random() * room.players.length)].id;
        }
        emitUpdate(roomCode);
        try {
            if (room.mode === 'kids') {
                const shuffled = shuffle([...kidsWords]);
                let selection = [];
                while(selection.length < room.maxWords && shuffled.length > 0) selection = selection.concat(shuffled);
                room.words = selection.slice(0, room.maxWords).map(t => ({ text: t }));
            } else {
                room.words = await Word.aggregate([{ $sample: { size: room.maxWords } }]);
            }
            io.to(roomCode).emit('gameStarted', { totalWords: room.maxWords, mode: room.mode, vipId: room.vipId, words: room.words });
            room.wordTimer = setTimeout(() => sendNextWord(roomCode), 4000);
        } catch (e) { console.error(e); }
    });

    socket.on('submitVote', ({ roomCode, vote }) => {
        const room = rooms[roomCode];
        if (!room || room.state !== 'playing') return;
        const player = room.players.find(p => p.id === socket.id);
        if (!player || player.isSpectator) return;
        if (room.mode === 'survival' && player.lives <= 0) return;
        room.currentVotes[socket.id] = vote;
        room.currentVoteTimes[socket.id] = Date.now();
        io.to(roomCode).emit('playerVoted', { playerId: socket.id });
        const activePlayers = room.players.filter(p => !p.isSpectator && (room.mode !== 'survival' || p.lives > 0));
        if (Object.keys(room.currentVotes).length >= activePlayers.length) finishWord(roomCode);
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
    if (activePlayers.every(p => room.readyConfirms.has(p.id))) {
        room.state = 'playing'; io.to(roomCode).emit('drinkingComplete'); sendNextWord(roomCode);
    }
}

function checkInsufficientPlayers(roomCode) {
    const room = rooms[roomCode];
    if (!room || room.state === 'lobby') return;
    const activeCount = room.players.filter(p => !p.isSpectator).length;
    const min = MODE_MINS[room.mode] || 2;
    if (activeCount < min) processGameEnd(roomCode, "Not enough players!");
    if (room.mode === 'versus') {
        if (!room.players.some(p => p.team === 'red' && !p.isSpectator) || !room.players.some(p => p.team === 'blue' && !p.isSpectator)) processGameEnd(roomCode, "Team empty!");
    }
}

function emitUpdate(code) {
    if (!rooms[code]) return;
    io.to(code).emit('roomUpdate', {
        players: rooms[code].players, host: rooms[code].host, mode: rooms[code].mode,
        maxWords: rooms[code].maxWords, drinkingMode: rooms[code].drinkingMode, 
        theme: rooms[code].theme, state: rooms[code].state,
        isPublic: rooms[code].isPublic || false,
        maxPlayers: rooms[code].maxPlayers || 8
    });
}

function sendNextWord(roomCode) {
    const room = rooms[roomCode];
    if (!room) return;
    // Survival: end if NO players alive (everyone dead) - but not if just 1 left
    if (room.mode === 'survival') {
        const alivePlayers = room.players.filter(p => !p.isSpectator && p.lives > 0);
        if (alivePlayers.length === 0 && room.players.filter(p => !p.isSpectator).length > 0) { 
            processGameEnd(roomCode, "Everyone died!"); 
            return; 
        }
    }
    if (room.wordIndex >= room.words.length) { processGameEnd(roomCode); return; }
    
    room.currentVotes = {}; room.currentVoteTimes = {}; room.wordStartTime = Date.now();
    io.to(roomCode).emit('nextWord', { word: room.words[room.wordIndex], wordCurrent: room.wordIndex + 1, wordTotal: room.maxWords });
}

function processGameEnd(roomCode, reason) {
    const room = rooms[roomCode];
    if (!room) return;
    room.state = 'lobby';
    let msg = reason || "Game Over!";
    if (room.mode === 'traitor') {
        const sync = room.maxWords > 0 ? ((room.scores.coop || 0) / room.maxWords) * 100 : 0;
        msg = (sync === 100) ? "TEAM WINS! Perfect Sync!" : "TRAITOR WINS! The sync was broken.";
    }
    io.to(roomCode).emit('gameOver', { scores: room.scores, rankings: [...room.players].sort((a,b)=>b.score-a.score), mode: room.mode, msg, specialRoleId: room.traitorId || room.vipId });
    emitUpdate(roomCode);
}

function finishWord(roomCode) {
    const room = rooms[roomCode];
    if (!room) return;
    const votes = room.currentVotes;
    const voteValues = Object.values(votes);
    const getMaj = (list) => { 
        const g = list.filter(x=>x==='good').length, b = list.filter(x=>x==='bad').length;
        return g > b ? 'good' : (b > g ? 'bad' : 'draw');
    };
    let resultData = {};

    if (room.mode === 'versus') {
        const redM = room.players.filter(p=>p.team==='red' && !p.isSpectator);
        const blueM = room.players.filter(p=>p.team==='blue' && !p.isSpectator);
        const redV = redM.map(p=>votes[p.id]||'none'), blueV = blueM.map(p=>votes[p.id]||'none');
        const calcSync = (v) => !v.length ? 0 : Math.round((Math.max(v.filter(x=>x==='good').length, v.filter(x=>x==='bad').length)/v.length)*100);
        const rSync = calcSync(redV), bSync = calcSync(blueV);
        let ext = "";
        
        if (rSync > bSync) room.scores.red++;
        else if (bSync > rSync) room.scores.blue++;
        else {
            const getAvg = (ms) => { let t=0, c=0; ms.forEach(p=>{ if(room.currentVoteTimes[p.id]) { t+=(room.currentVoteTimes[p.id]-room.wordStartTime); c++; } }); return c?t/c:999999; };
            const rT = getAvg(redM), bT = getAvg(blueM);
            if(rT < bT) { room.scores.red++; ext="(Red Faster!)"; } else if(bT < rT) { room.scores.blue++; ext="(Blue Faster!)"; }
        }
        const rMaj = getMaj(redV), bMaj = getMaj(blueV);
        room.players.forEach(p => { 
            const v = votes[p.id]; 
            if ((p.team==='red' && v===rMaj) || (p.team==='blue' && v===bMaj)) p.score++; 
        });
        resultData = { redSync: rSync, blueSync: bSync, msg: ext ? `Tie Break! ${ext}` : null };
    } else {
        const maj = getMaj(voteValues);
        
        if (room.mode === 'traitor') {
            const sync = Math.round((Math.max(voteValues.filter(x=>x==='good').length, voteValues.filter(x=>x==='bad').length)/voteValues.length)*100);
            if(sync === 100) room.players.forEach(p => { if(p.id !== room.traitorId && !p.isSpectator) p.score+=2; });
            else { const t = room.players.find(p=>p.id===room.traitorId); if(t) t.score+=3; }
            resultData = { msg: sync===100 ? "100% Sync! Traitor Failed." : `Sync Broken (${sync}%)! Traitor Wins.` };
        } else if (room.mode === 'survival') {
            // --- FIX: Proper Hearts & -5 Penalty Logic ---
            if (maj !== 'draw') {
                room.players.forEach(p => {
                    if (p.lives > 0 && !p.isSpectator) {
                        const v = votes[p.id];
                        if (v && v !== maj) {
                            p.lives--; // Lose a heart
                            if (p.lives === 0) p.score -= 5; // DIE: -5 Points Penalty
                        } else if (v === maj) {
                            p.score++; // Survive: +1 Point
                        }
                    }
                });
            }
            resultData = { msg: `Majority: ${maj.toUpperCase()}` };
            // ---------------------------------------------
        } else {
            // Standard / Co-op / Hipster logic
            const sync = Math.round((Math.max(voteValues.filter(x=>x==='good').length, voteValues.filter(x=>x==='bad').length)/voteValues.length)*100);
            if(sync >= 100) room.scores.coop++;
            room.players.forEach(p=>{ if(votes[p.id]===maj && !p.isSpectator) p.score++; });
            resultData = { sync, score: room.scores.coop };
        }
    }

    let drinkers = [], drinkMsg = "Penalty Round";
    if (room.drinkingMode && room.mode !== 'kids') { 
        if (Math.random() < 0.1) {
            const r = Math.random();
            if (r < 0.7) {
                let slowId=null, slowT=0;
                for(const [pid, t] of Object.entries(room.currentVoteTimes)) { const d=t-room.wordStartTime; if(d>slowT) { slowT=d; slowId=pid; } }
                if(slowId && slowT>3000) { const p=room.players.find(x=>x.id===slowId); drinkers.push({id:slowId, name:p?p.name:'?', reason:'Too Slow!', icon:'🐌'}); }
                const maj = getMaj(voteValues);
                if(maj!=='draw') room.players.forEach(p=>{ if(!p.isSpectator && votes[p.id] && votes[p.id]!==maj && !drinkers.find(d=>d.id===p.id)) drinkers.push({id:p.id, name:p.name, reason:'Minority!', icon:'🤡'}); });
            } else if (r < 0.85) {
                drinkMsg = "SOCIAL! EVERYONE DRINKS!"; room.players.forEach(p=>{ if(!p.isSpectator) drinkers.push({id:p.id, name:p.name, reason:'Social!', icon:'🍻'}); });
            } else {
                drinkMsg = "NOMINATE!"; 
                let fastId=null, fastT=Infinity;
                for(const [pid, t] of Object.entries(room.currentVoteTimes)) { const d=t-room.wordStartTime; if(d<fastT) { fastT=d; fastId=pid; } }
                if(fastId) { const p=room.players.find(x=>x.id===fastId); drinkers.push({id:fastId, name:p?p.name:'?', reason:'NOMINATE SOMEONE!', icon:'🫵'}); }
            }
        }
    }

    const currentWord = room.words[room.wordIndex];
    
    io.to(roomCode).emit('roundResult', { mode: room.mode, data: resultData, word: currentWord.text, players: room.players, votes });
    room.wordIndex++;
    if(room.wordIndex >= room.maxWords) { processGameEnd(roomCode); return; }

    if(drinkers.length>0) { room.state='drinking'; room.readyConfirms=new Set(); io.to(roomCode).emit('drinkPenalty', { drinkers, msg: drinkMsg }); }
    else { room.wordTimer = setTimeout(() => sendNextWord(roomCode), 3000); }
}

app.get('/kids_words.txt', (req, res) => { const p = path.join(__dirname, 'kids_words.txt'); if (fs.existsSync(p)) res.sendFile(p); else res.status(404).send(""); });
app.get('/api/words/all', async (req, res) => { try { res.json(await Word.find().sort({ createdAt: -1 })); } catch (e) { res.json([]); } });
app.get('/api/words', async (req, res) => { try { res.json(await Word.aggregate([{ $sample: { size: 1 } }])); } catch (e) { res.json({message:"Error"}); } });
app.put('/api/words/:id/vote', async (req, res) => { try { await Word.findByIdAndUpdate(req.params.id, { $inc: { [req.body.voteType + 'Votes']: 1 } }); res.json({message:"OK"}); } catch (e) { res.status(500).json({}); } });
app.post('/api/words', async (req, res) => { try { const n = new Word({ text: req.body.text }); await n.save(); res.status(201).json(n); } catch (e) { res.status(500).json({}); } });
app.get('/api/leaderboard', async (req, res) => { try { res.json(await Leaderboard.find().sort({voteCount:-1}).limit(10)); } catch(e){res.json([])} });
app.post('/api/leaderboard', async (req, res) => { try { await Leaderboard.findOneAndUpdate({userId:req.body.userId}, req.body, {upsert:true}); res.json({message:"OK"}); } catch(e){res.status(500).send()} });
app.get('/api/scores', async (req, res) => { try { res.json(await Score.find().sort({score:-1}).limit(10)); } catch(e){res.json([])} });
app.post('/api/scores', async (req, res) => { try { const s = new Score(req.body); await s.save(); res.json(s); } catch(e){res.json({})} });
server.listen(PORT, () => console.log(`Server on ${PORT}`));
