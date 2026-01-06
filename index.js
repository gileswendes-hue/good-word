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

const leaderboardSchema = new mongoose.Schema({ 
    userId: { type: String, unique: true }, 
    username: String, 
    voteCount: { type: Number, default: 0 }, 
    dailyStreak: { type: Number, default: 0 },
    bestDailyStreak: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now } 
});
const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

// Global statistics schema for tracking history across all users
const globalStatsSchema = new mongoose.Schema({
    date: { type: String, required: true, unique: true }, // YYYY-MM-DD
    totalVotes: { type: Number, default: 0 },
    totalWords: { type: Number, default: 0 },
    goodVotes: { type: Number, default: 0 },
    badVotes: { type: Number, default: 0 }
});
const GlobalStats = mongoose.model('GlobalStats', globalStatsSchema);

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
const MODE_MINS = { 'coop': 2, 'versus': 4, 'vip': 3, 'hipster': 3, 'speed': 2, 'survival': 2, 'traitor': 3, 'kids': 2, 'okstoopid': 2 };
const MODE_MAXS = { 'okstoopid': 2 };

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
                theme: theme || 'default', drinkingMode: false, extremeDrinkingMode: false, wordIndex: 0, maxWords: 10, 
                words: [], currentVotes: {}, currentVoteTimes: {}, accusationVotes: {}, 
                readyConfirms: new Set(), scores: { red: 0, blue: 0, coop: 0 }, 
                vipId: null, traitorId: null, wordStartTime: 0, wordTimer: null,
                isPublic: isPublic || false,
                maxPlayers: maxPlayers || 8,
                lastActivity: Date.now()
            };
        } else {
            // Update lastActivity for existing room
            rooms[code].lastActivity = Date.now();
            // If rejoining, preserve public status (don't let it become private)
            // Only update isPublic if explicitly set to true (making it public)
            if (isPublic === true) {
                rooms[code].isPublic = true;
            }
            if (maxPlayers && maxPlayers > rooms[code].maxPlayers) {
                rooms[code].maxPlayers = maxPlayers;
            }
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
    
    // Keep public room alive / reannounce
    socket.on('keepAlive', ({ roomCode }) => {
        const code = roomCode?.toUpperCase();
        if (rooms[code]) {
            rooms[code].lastActivity = Date.now();
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
    socket.on('updateSettings', ({ roomCode, mode, rounds, drinking, extremeDrinking, theme }) => {
        const room = rooms[roomCode];
        if (!room || room.host !== socket.id) return;
        if(mode) room.mode = mode;
        if(rounds) room.maxWords = parseInt(rounds);
        if (typeof drinking !== 'undefined') room.drinkingMode = drinking;
        if (typeof extremeDrinking !== 'undefined') room.extremeDrinkingMode = extremeDrinking;
        if (theme) room.theme = theme; // <--- SAVE THEME
        if (room.mode === 'kids') {
            room.drinkingMode = false;
            room.extremeDrinkingMode = false;
        }
        if (!room.drinkingMode) room.extremeDrinkingMode = false; // Reset extreme if drinking off
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
        
        // Validate player count for game mode
        const minPlayers = MODE_MINS[room.mode] || 2;
        const maxPlayers = MODE_MAXS[room.mode] || null;
        const activePlayers = room.players.filter(p => !p.isSpectator);
        
        if (activePlayers.length < minPlayers) {
            socket.emit('startError', { message: `${room.mode} requires at least ${minPlayers} players` });
            return;
        }
        if (maxPlayers && activePlayers.length > maxPlayers) {
            socket.emit('startError', { message: `${room.mode} requires exactly ${maxPlayers} players` });
            return;
        }
        
        if (room.wordTimer) clearTimeout(room.wordTimer);
        room.state = 'playing'; room.wordIndex = 0; room.currentVotes = {}; room.currentVoteTimes = {}; 
        room.readyConfirms = new Set(); room.vipId = null; room.traitorId = null;
        room.players.forEach(p => { p.lives = 3; p.score = 0; p.isSpectator = false; });

        if (room.mode === 'versus') {
            const shuffled = shuffle([...room.players]);
            shuffled.forEach((p, i) => { const op = room.players.find(rp => rp.id === p.id); if(op) op.team = (i % 2 === 0) ? 'red' : 'blue'; });
            // Notify each player of their team
            room.players.forEach(p => {
                io.to(p.id).emit('teamAssigned', { team: p.team });
            });
        } else if (room.mode === 'traitor') {
            const potential = room.players.filter(p => !p.isSpectator);
            if (potential.length > 0) {
                room.traitorId = potential[Math.floor(Math.random() * potential.length)].id;
                io.to(room.traitorId).emit('roleAlert', 'You are the TRAITOR! Try to make the room fail.');
            }
        } else if (room.mode === 'vip') {
            const potential = room.players.filter(p => !p.isSpectator);
            if (potential.length > 0) {
                room.vipId = potential[Math.floor(Math.random() * potential.length)].id;
                const vipPlayer = room.players.find(p => p.id === room.vipId);
                // Notify all players who the VIP is
                io.to(roomCode).emit('vipAssigned', { 
                    vipId: room.vipId, 
                    vipName: vipPlayer ? vipPlayer.name : 'Unknown' 
                });
            }
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
        extremeDrinkingMode: rooms[code].extremeDrinkingMode,
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
    let okStoopidResult = null;
    
    if (room.mode === 'traitor') {
        const sync = room.maxWords > 0 ? ((room.scores.coop || 0) / room.maxWords) * 100 : 0;
        msg = (sync === 100) ? "TEAM WINS! Perfect Sync!" : "TRAITOR WINS! The sync was broken.";
    } else if (room.mode === 'okstoopid' && room.okStoopidData) {
        const data = room.okStoopidData;
        const matchRate = data.totalRounds > 0 ? (data.matches / data.totalRounds) : 0;
        const avgTimeDiff = data.matches > 0 ? (data.totalTimeDiff / data.matches) : 10000;
        
        // 80% vote matching, 20% speed bonus
        // Speed bonus: max 20% if avg time diff < 500ms, scales down to 0% at 5000ms
        const speedBonus = Math.max(0, Math.min(20, 20 - (avgTimeDiff / 250)));
        
        // Weight by number of rounds - more rounds = more reliable
        // Bonus multiplier: 1.0 at 5 rounds, up to 1.2 at 25+ rounds
        const roundBonus = Math.min(1.2, 0.8 + (data.totalRounds * 0.02));
        
        const baseCompatibility = (matchRate * 80) + speedBonus;
        const finalCompatibility = Math.min(100, Math.round(baseCompatibility * roundBonus));
        
        okStoopidResult = {
            compatibility: finalCompatibility,
            matches: data.matches,
            totalRounds: data.totalRounds,
            matchRate: Math.round(matchRate * 100)
        };
        msg = `💕 ${finalCompatibility}% Compatible!`;
        
        // Clear the tracking data
        room.okStoopidData = null;
    }
    
    io.to(roomCode).emit('gameOver', { 
        scores: room.scores, 
        rankings: [...room.players].sort((a,b)=>b.score-a.score), 
        mode: room.mode, 
        msg, 
        specialRoleId: room.traitorId || room.vipId,
        okStoopidResult
    });
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
            // --- SURVIVAL MODE LOGIC ---
            const alivePlayers = room.players.filter(p => !p.isSpectator && p.lives > 0);
            const currentWord = room.words[room.wordIndex];
            
            let targetMaj = maj; // Default: use room majority
            let useGlobal = false;
            
            // With 2 or fewer alive players, compare against global voting
            if (alivePlayers.length <= 2 && currentWord) {
                const globalGood = currentWord.goodVotes || 0;
                const globalBad = currentWord.badVotes || 0;
                if (globalGood > globalBad) {
                    targetMaj = 'good';
                    useGlobal = true;
                } else if (globalBad > globalGood) {
                    targetMaj = 'bad';
                    useGlobal = true;
                }
                // If global is tied, fall back to room majority
            }
            
            if (targetMaj !== 'draw') {
                room.players.forEach(p => {
                    if (p.lives > 0 && !p.isSpectator) {
                        const v = votes[p.id];
                        if (v && v !== targetMaj) {
                            p.lives--; // Lose a heart
                            if (p.lives === 0) p.score -= 5; // DIE: -5 Points Penalty
                        } else if (v === targetMaj) {
                            p.score++; // Survive: +1 Point
                        }
                    }
                });
            }
            resultData = { 
                msg: useGlobal 
                    ? `Global Majority: ${targetMaj.toUpperCase()}` 
                    : `Majority: ${targetMaj.toUpperCase()}` 
            };
            // -----------------------------------------
        } else if (room.mode === 'vip' && room.vipId) {
            // VIP mode: everyone tries to match the VIP's vote
            // Both VIP and matchers get points to discourage VIP voting weirdly
            const vipVote = votes[room.vipId];
            if (vipVote) {
                room.players.forEach(p => {
                    if (!p.isSpectator) {
                        if (votes[p.id] === vipVote) {
                            // VIP and anyone who matches gets a point
                            p.score++;
                        }
                    }
                });
                const vipPlayer = room.players.find(p => p.id === room.vipId);
                resultData = { msg: `${vipPlayer?.name || 'VIP'} voted ${vipVote.toUpperCase()}!` };
            } else {
                resultData = { msg: `The VIP didn't vote!` };
            }
        } else if (room.mode === 'hipster') {
            // Hipster mode: score by being in the MINORITY
            // Use global votes if insufficient players (<=2), otherwise room minority
            const goodCount = voteValues.filter(x => x === 'good').length;
            const badCount = voteValues.filter(x => x === 'bad').length;
            
            let targetMinority = 'draw';
            let useGlobal = false;
            
            // Determine minority
            if (goodCount !== badCount) {
                targetMinority = goodCount < badCount ? 'good' : 'bad';
            } else if (voteValues.length <= 2) {
                // Use global data for tie-breaker or small groups
                const word = room.words[room.wordIndex - 1];
                if (word) {
                    const globalGood = word.goodVotes || 0;
                    const globalBad = word.badVotes || 0;
                    if (globalGood !== globalBad) {
                        // Global minority is opposite of global majority
                        targetMinority = globalGood < globalBad ? 'good' : 'bad';
                        useGlobal = true;
                    }
                }
            }
            
            if (targetMinority !== 'draw') {
                room.players.forEach(p => {
                    if (!p.isSpectator && votes[p.id] === targetMinority) {
                        p.score++; // Hipsters in minority get points
                    }
                });
            }
            resultData = { 
                msg: targetMinority !== 'draw' 
                    ? (useGlobal ? `Global Minority: ${targetMinority.toUpperCase()}` : `Minority: ${targetMinority.toUpperCase()}`)
                    : `It's a tie! No points.`
            };
        } else if (room.mode === 'okstoopid') {
            // OK Stoopid: Couples mode - 2 players try to match
            // Track matches per round for final compatibility calculation
            const playerIds = room.players.filter(p => !p.isSpectator).map(p => p.id);
            if (playerIds.length === 2) {
                const vote1 = votes[playerIds[0]];
                const vote2 = votes[playerIds[1]];
                const time1 = room.currentVoteTimes[playerIds[0]] || 999999;
                const time2 = room.currentVoteTimes[playerIds[1]] || 999999;
                
                // Initialize tracking if needed
                if (!room.okStoopidData) {
                    room.okStoopidData = { matches: 0, totalRounds: 0, totalTimeDiff: 0 };
                }
                room.okStoopidData.totalRounds++;
                
                const matched = (vote1 && vote2 && vote1 === vote2);
                if (matched) {
                    room.okStoopidData.matches++;
                    // Track time difference for speed bonus
                    const timeDiff = Math.abs(time1 - time2);
                    room.okStoopidData.totalTimeDiff += timeDiff;
                    
                    // Both players get points for matching
                    room.players.forEach(p => {
                        if (!p.isSpectator) p.score++;
                    });
                    resultData = { msg: `💕 Match! You both voted ${vote1.toUpperCase()}!` };
                } else {
                    resultData = { msg: `💔 No match!` };
                }
            } else {
                resultData = { msg: `Need exactly 2 players!` };
            }
        } else {
            // Standard / Co-op logic
            const sync = Math.round((Math.max(voteValues.filter(x=>x==='good').length, voteValues.filter(x=>x==='bad').length)/voteValues.length)*100);
            if(sync >= 100) room.scores.coop++;
            room.players.forEach(p=>{ if(votes[p.id]===maj && !p.isSpectator) p.score++; });
            resultData = { sync, score: room.scores.coop };
        }
    }

    let drinkers = [], drinkMsg = "Penalty Round";
    if (room.drinkingMode && room.mode !== 'kids') { 
        // Extreme mode has much higher penalty chance (30% vs 10%)
        const penaltyChance = room.extremeDrinkingMode ? 0.3 : 0.1;
        if (Math.random() < penaltyChance) {
            const r = Math.random();
            if (r < 0.7) {
                let slowId=null, slowT=0;
                for(const [pid, t] of Object.entries(room.currentVoteTimes)) { const d=t-room.wordStartTime; if(d>slowT) { slowT=d; slowId=pid; } }
                // Extreme mode has tighter time limit (2s vs 3s)
                const slowThreshold = room.extremeDrinkingMode ? 2000 : 3000;
                if(slowId && slowT>slowThreshold) { const p=room.players.find(x=>x.id===slowId); drinkers.push({id:slowId, name:p?p.name:'?', reason:'Too Slow!', icon:'🐌'}); }
                const maj = getMaj(voteValues);
                if(maj!=='draw') room.players.forEach(p=>{ if(!p.isSpectator && votes[p.id] && votes[p.id]!==maj && !drinkers.find(d=>d.id===p.id)) drinkers.push({id:p.id, name:p.name, reason:'Minority!', icon:'🤡'}); });
                // Extreme mode: first voter also drinks sometimes
                if (room.extremeDrinkingMode && Math.random() < 0.3) {
                    let fastId=null, fastT=Infinity;
                    for(const [pid, t] of Object.entries(room.currentVoteTimes)) { const d=t-room.wordStartTime; if(d<fastT) { fastT=d; fastId=pid; } }
                    if(fastId && !drinkers.find(d=>d.id===fastId)) { const p=room.players.find(x=>x.id===fastId); drinkers.push({id:fastId, name:p?p.name:'?', reason:'Too Eager!', icon:'🏃'}); }
                }
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

// Updated vote endpoint to also track global stats
app.put('/api/words/:id/vote', async (req, res) => { 
    try { 
        await Word.findByIdAndUpdate(req.params.id, { $inc: { [req.body.voteType + 'Votes']: 1 } }); 
        
        // Update global stats for today
        const today = new Date().toISOString().split('T')[0];
        const voteField = req.body.voteType === 'good' ? 'goodVotes' : 'badVotes';
        await GlobalStats.findOneAndUpdate(
            { date: today },
            { 
                $inc: { totalVotes: 1, [voteField]: 1 },
                $setOnInsert: { date: today }
            },
            { upsert: true }
        );
        
        res.json({message:"OK"}); 
    } catch (e) { res.status(500).json({}); } 
});

app.post('/api/words', async (req, res) => { try { const n = new Word({ text: req.body.text }); await n.save(); res.status(201).json(n); } catch (e) { res.status(500).json({}); } });
app.get('/api/leaderboard', async (req, res) => { try { res.json(await Leaderboard.find().sort({voteCount:-1}).limit(100)); } catch(e){res.json([])} });
app.get('/api/leaderboard/streaks', async (req, res) => { try { res.json(await Leaderboard.find({dailyStreak:{$gt:0}}).sort({dailyStreak:-1}).limit(10)); } catch(e){res.json([])} });
app.post('/api/leaderboard', async (req, res) => { 
    try { 
        const update = {
            userId: req.body.userId,
            username: req.body.username,
            voteCount: req.body.voteCount,
            lastUpdated: new Date()
        };
        if (req.body.dailyStreak !== undefined) update.dailyStreak = req.body.dailyStreak;
        if (req.body.bestDailyStreak !== undefined) update.bestDailyStreak = req.body.bestDailyStreak;
        await Leaderboard.findOneAndUpdate({userId:req.body.userId}, update, {upsert:true}); 
        res.json({message:"OK"}); 
    } catch(e){res.status(500).send()} 
});
app.get('/api/scores', async (req, res) => { try { res.json(await Score.find().sort({score:-1}).limit(10)); } catch(e){res.json([])} });
app.post('/api/scores', async (req, res) => { try { const s = new Score(req.body); await s.save(); res.json(s); } catch(e){res.json({})} });

// Global stats endpoints - stored for all users to see historical data
app.get('/api/stats/history', async (req, res) => { 
    try { 
        const stats = await GlobalStats.find().sort({ date: -1 }).limit(365);
        res.json(stats.reverse()); // Return in chronological order
    } catch(e) { res.json([]); } 
});

app.post('/api/stats/snapshot', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const { totalWords, totalVotes, goodVotes, badVotes } = req.body;
        
        await GlobalStats.findOneAndUpdate(
            { date: today },
            { 
                $set: { totalWords },
                $max: { totalVotes, goodVotes, badVotes } // Only update if higher
            },
            { upsert: true }
        );
        res.json({ message: "OK" });
    } catch(e) { res.status(500).json({}); }
});

server.listen(PORT, () => console.log(`Server on ${PORT}`));
