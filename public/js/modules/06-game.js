/**
 * ============================================================================
 * GOOD WORD / BAD WORD - GAME MODULE
 * ============================================================================
 * 
 * This module contains the core game logic:
 * - Game: Main controller (init, vote, nextWord)
 * - StreakManager: Streak tracking and notifications
 * - LocalPeerManager: WebRTC local multiplayer
 * - RoomManager: Online room multiplayer
 * - SeededShuffle: Deterministic shuffling for daily challenges
 * 
 * Dependencies: All previous modules
 * Loaded: Last (starts the game)
 * ============================================================================
 */

(function() {
'use strict';

// ============================================================================
// SEEDED SHUFFLE - Deterministic Randomization
// ============================================================================
const SeededShuffle = {
    seed: 0,
    
    setSeed(seed) {
        this.seed = seed;
    },
    
    random() {
        this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
        return this.seed / 0x7fffffff;
    },
    
    shuffle(array) {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(this.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }
};


// ============================================================================
// STREAK MANAGER - Streak Tracking & Notifications
// ============================================================================
const StreakManager = {
    container: null,
    timeout: null,
    
    init() {
        if (!document.getElementById('streak-notifications')) {
            this.container = document.createElement('div');
            this.container.id = 'streak-notifications';
            this.container.className = 'fixed top-20 right-4 z-50 flex flex-col gap-2';
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById('streak-notifications');
        }
    },
    
    showNotification(text, type = 'info') {
        if (!this.container) this.init();
        
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            info: 'bg-indigo-500',
            warning: 'bg-yellow-500'
        };
        
        const notification = document.createElement('div');
        notification.className = `${colors[type] || colors.info} text-white px-4 py-2 rounded-lg shadow-lg transform translate-x-full opacity-0 transition-all duration-300`;
        notification.innerHTML = text;
        
        this.container.appendChild(notification);
        
        requestAnimationFrame(() => {
            notification.classList.remove('translate-x-full', 'opacity-0');
        });
        
        setTimeout(() => {
            notification.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },
    
    handleSuccess() {
        State.runtime.streak++;
        UIManager.updateStreak(State.runtime.streak);
        
        const milestones = [5, 10, 25, 50, 100];
        if (milestones.includes(State.runtime.streak)) {
            this.celebrate(State.runtime.streak);
        }
        
        if (State.runtime.streak > State.data.longestStreak) {
            State.data.longestStreak = State.runtime.streak;
            State.save('longestStreak', State.data.longestStreak);
        }
    },
    
    celebrate(streak) {
        const messages = {
            5: '🔥 5 streak!',
            10: '🔥🔥 10 streak!',
            25: '🔥🔥🔥 25 streak! Amazing!',
            50: '🌟 50 STREAK! Incredible!',
            100: '⭐ 100 STREAK! LEGENDARY!'
        };
        
        this.showNotification(messages[streak] || `${streak} streak!`, 'success');
        
        if (window.SoundManager) SoundManager.playStreak();
        if (streak >= 25 && window.UIManager) UIManager.triggerConfetti();
    },
    
    reset() {
        if (State.runtime.streak > 0) {
            const oldStreak = State.runtime.streak;
            State.runtime.streak = 0;
            UIManager.updateStreak(0);
            if (oldStreak >= 5) {
                this.showNotification(`Streak ended at ${oldStreak}`, 'warning');
            }
        }
    },
    
    extend(ms) {
        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout(() => this.reset(), ms);
    }
};


// ============================================================================
// LOCAL PEER MANAGER - WebRTC Local Multiplayer
// ============================================================================
const LocalPeerManager = {
    channel: null,
    peers: new Map(),
    enabled: false,
    
    init() {
        if (!('BroadcastChannel' in window)) return;
        
        this.channel = new BroadcastChannel('good-word-local');
        this.channel.onmessage = (e) => this.handleMessage(e.data);
        
        this.broadcast({
            type: 'join',
            userId: State.data.userId,
            username: State.data.username || 'Anonymous'
        });
        
        this.enabled = true;
        
        window.addEventListener('beforeunload', () => {
            this.broadcast({ type: 'leave', userId: State.data.userId });
        });
    },
    
    broadcast(data) {
        if (this.channel) this.channel.postMessage(data);
    },
    
    handleMessage(data) {
        if (data.userId === State.data.userId) return;
        
        switch (data.type) {
            case 'join':
                this.peers.set(data.userId, { username: data.username, lastSeen: Date.now() });
                UIManager.showPostVoteMessage(`${data.username} joined nearby!`);
                this.broadcast({
                    type: 'hello',
                    userId: State.data.userId,
                    username: State.data.username || 'Anonymous'
                });
                break;
            case 'hello':
                this.peers.set(data.userId, { username: data.username, lastSeen: Date.now() });
                break;
            case 'leave':
                this.peers.delete(data.userId);
                break;
            case 'vote':
                const peer = this.peers.get(data.userId);
                const emoji = data.vote === 'good' ? '👍' : '👎';
                UIManager.showPostVoteMessage(`${peer?.username || 'Someone'} voted ${emoji}`);
                break;
        }
    },
    
    broadcastVote(word, vote) {
        this.broadcast({ type: 'vote', userId: State.data.userId, word, vote });
    },
    
    getPeerCount() { return this.peers.size; }
};


// ============================================================================
// ROOM MANAGER - Online Multiplayer
// ============================================================================
const RoomManager = {
    ws: null,
    roomCode: null,
    players: [],
    isHost: false,
    
    init() {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('room');
        if (code) this.join(code);
    },
    
    async create() {
        this.roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.isHost = true;
        await this.connect();
        return this.roomCode;
    },
    
    async join(code) {
        this.roomCode = code.toUpperCase();
        this.isHost = false;
        await this.connect();
    },
    
    async connect() {
        return new Promise((resolve, reject) => {
            try {
                const wsUrl = `wss://${window.location.host}/ws`;
                this.ws = new WebSocket(wsUrl);
                this.ws.onopen = () => {
                    this.ws.send(JSON.stringify({
                        type: this.isHost ? 'create' : 'join',
                        room: this.roomCode,
                        userId: State.data.userId,
                        username: State.data.username || 'Anonymous'
                    }));
                    resolve();
                };
                this.ws.onmessage = (e) => this.handleMessage(JSON.parse(e.data));
                this.ws.onclose = () => this.handleDisconnect();
                this.ws.onerror = reject;
            } catch (e) { reject(e); }
        });
    },
    
    handleMessage(data) {
        switch (data.type) {
            case 'playerJoined':
                this.players.push(data.player);
                UIManager.showPostVoteMessage(`${data.player.username} joined!`);
                break;
            case 'playerLeft':
                this.players = this.players.filter(p => p.userId !== data.userId);
                break;
            case 'vote':
                const name = this.players.find(p => p.userId === data.userId)?.username || 'Someone';
                UIManager.showPostVoteMessage(`${name} voted ${data.vote === 'good' ? '👍' : '👎'}`);
                break;
        }
    },
    
    handleDisconnect() {
        this.ws = null;
        this.roomCode = null;
        UIManager.showPostVoteMessage('Disconnected from room');
    },
    
    broadcastVote(word, vote) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'vote', room: this.roomCode, userId: State.data.userId, word, vote }));
        }
    },
    
    leave() {
        this.ws?.close();
        this.roomCode = null;
        this.players = [];
    }
};


// ============================================================================
// GAME - Main Controller
// ============================================================================
const Game = {
    async init() {
        console.log('%c[Game] Initializing...', 'color: #f59e0b');
        
        if (typeof loadDOM === 'function') window.DOM = loadDOM();
        
        State.init();
        Accessibility.apply();
        StreakManager.init();
        TipManager?.init();
        InputHandler.init();
        TiltManager?.init();
        SoundManager.init();
        ThemeManager.init();
        WeatherManager?.init();
        LocalPeerManager.init();
        RoomManager.init();
        
        this.setupButtons();
        UIManager.updateProfileDisplay();
        
        await this.loadWords();
        
        UIManager.updateStats();
        UIManager.updateOfflineIndicator();
        this.nextWord();
        
        if (Math.random() < 0.1) {
            setTimeout(() => MosquitoManager?.spawn(), 30000);
        }
        
        console.log('%c[Game] Ready!', 'color: #22c55e; font-weight: bold');
    },
    
    setupButtons() {
        document.getElementById('goodButton')?.addEventListener('click', () => this.vote('good'));
        document.getElementById('badButton')?.addEventListener('click', () => this.vote('bad'));
        document.getElementById('notWordButton')?.addEventListener('click', () => this.vote('notWord'));
        document.getElementById('dailyBanner')?.addEventListener('click', () => this.activateDailyMode());
    },
    
    async loadWords() {
        try {
            UIManager.showMessage('Loading words...');
            const data = await API.fetchWords(State.data.settings.kidsMode);
            
            State.runtime.fullWordList = data.words || [];
            State.runtime.allWords = Utils.shuffle([...State.runtime.fullWordList]);
            
            const seen = State.data.seenHistory || [];
            if (seen.length > 0 && State.runtime.allWords.length > 100) {
                State.runtime.allWords = State.runtime.allWords.filter(w => !seen.includes(w._id));
            }
            
            State.runtime.currentWordIndex = 0;
            console.log(`[Game] Loaded ${State.runtime.allWords.length} words`);
        } catch (e) {
            console.error('[Game] Failed to load words:', e);
            UIManager.showMessage('Failed to load. Retrying...', true);
            setTimeout(() => this.loadWords(), 3000);
        }
    },
    
    async refreshData(showMessage = true) {
        try {
            const data = await API.fetchWords(State.data.settings.kidsMode);
            State.runtime.fullWordList = data.words || [];
            UIManager.updateStats();
            if (showMessage) UIManager.showPostVoteMessage('Data refreshed!');
        } catch (e) { console.warn('[Game] Refresh failed'); }
    },
    
    showCurrentWord() {
        const words = State.runtime.allWords;
        
        if (State.runtime.currentWordIndex >= words.length) {
            State.runtime.allWords = Utils.shuffle([...State.runtime.fullWordList]);
            State.runtime.currentWordIndex = 0;
            UIManager.showPostVoteMessage('Starting fresh word list!');
        }
        
        const word = words[State.runtime.currentWordIndex];
        if (word) UIManager.showWord(word);
    },
    
    nextWord() {
        State.runtime.currentWordIndex++;
        this.showCurrentWord();
    },
    
    async vote(type) {
        const now = Date.now();
        if (now - State.runtime.lastVoteTime < 200) return;
        
        State.runtime.mashCount = (now - State.runtime.lastVoteTime < CONFIG.VOTE.STREAK_WINDOW) 
            ? State.runtime.mashCount + 1 : 1;
        
        if (State.runtime.mashCount > CONFIG.VOTE.MASH_LIMIT) {
            this.handleCooldown();
            return;
        }
        
        State.runtime.lastVoteTime = now;
        
        const word = State.runtime.allWords[State.runtime.currentWordIndex];
        if (!word) return;
        
        UIManager.disableButtons(true);
        
        type === 'notWord' ? Haptics.heavy() : Haptics.medium();
        type === 'good' ? SoundManager.playGood() : type === 'bad' ? SoundManager.playBad() : null;
        
        const unlocked = ThemeManager.checkUnlock(word.text);
        if (unlocked) SoundManager.playUnlock();
        
        const special = CONFIG.SPECIAL[word.text.toUpperCase()];
        if (special) {
            this.handleSpecialWord(special, word.text);
            return;
        }
        
        try {
            if (navigator.onLine && !State.data.settings.offlineMode) {
                await API.submitVote(word._id, type);
                word[`${type}Votes`] = (word[`${type}Votes`] || 0) + 1;
            } else {
                OfflineManager.queueVote({ wordId: word._id, vote: type });
            }
            
            State.incrementVote();
            StreakManager.handleSuccess();
            LocalPeerManager.broadcastVote(word.text, type);
            RoomManager.broadcastVote(word.text, type);
            UIManager.addToHistory(word.text, type);
            TipManager?.onVote();
        } catch (e) {
            console.warn('[Game] Vote failed:', e);
            StreakManager.reset();
        }
        
        this.nextWord();
    },
    
    handleSpecialWord(config, word) {
        State.unlockBadge(word.toLowerCase());
        StreakManager.extend(config.fade + config.dur);
        
        const wd = document.getElementById('wordDisplay');
        if (wd) {
            wd.style.transition = `opacity ${config.fade}ms`;
            wd.style.opacity = '0';
            
            setTimeout(() => {
                wd.textContent = config.msg;
                wd.style.opacity = '1';
                wd.style.fontSize = '1.5rem';
                wd.style.color = '#6b7280';
                
                setTimeout(() => {
                    State.runtime.currentWordIndex++;
                    UIManager.disableButtons(false);
                    this.nextWord();
                }, config.dur);
            }, config.fade);
        }
    },
    
    handleCooldown() {
        if (State.runtime.isCoolingDown) return;
        
        State.runtime.isCoolingDown = true;
        State.runtime.mashLevel = Math.min(State.runtime.mashLevel + 1, 2);
        
        const duration = CONFIG.VOTE.COOLDOWN_TIERS[State.runtime.mashLevel] || 5;
        
        UIManager.showMessage(`Slow down! Wait ${duration}s...`, true);
        UIManager.disableButtons(true);
        Haptics.heavy();
        StreakManager.reset();
        
        State.runtime.cooldownTimer = setTimeout(() => {
            State.runtime.isCoolingDown = false;
            State.runtime.mashCount = 0;
            UIManager.disableButtons(false);
            this.showCurrentWord();
        }, duration * 1000);
    },
    
    activateDailyMode() {
        if (State.runtime.isDailyMode) return;
        
        State.runtime.isDailyMode = true;
        
        const today = new Date().toISOString().split('T')[0];
        const seed = today.split('-').reduce((a, b) => a + parseInt(b), 0);
        SeededShuffle.setSeed(seed);
        
        State.runtime.allWords = SeededShuffle.shuffle([...State.runtime.fullWordList]);
        State.runtime.currentWordIndex = 0;
        
        UIManager.showPostVoteMessage('🌟 Daily Challenge activated!');
        
        const banner = document.getElementById('dailyBanner');
        if (banner) {
            banner.classList.add('bg-yellow-400');
            banner.innerHTML = '🌟 DAILY MODE ACTIVE';
        }
        
        this.showCurrentWord();
    },
    
    cleanStyles(el) {
        if (!el) return;
        el.classList.remove('animate-fly-left', 'animate-fly-right', 'word-fade-quick', 'word-fade-llama', 'override-theme-color', 'color-fade');
        el.style.transform = '';
        el.style.opacity = '';
    },
    
    setRandomFavicon() {
        const emojis = ['🎮', '📝', '✨', '🎯', '💬', '🔤'];
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 32;
        const ctx = canvas.getContext('2d');
        ctx.font = '28px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emojis[Math.floor(Math.random() * emojis.length)], 16, 18);
        
        let link = document.querySelector("link[rel~='icon']");
        if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
        link.href = canvas.toDataURL();
    },
    
    async openArcade() {
        UIManager.showPostVoteMessage('Loading arcade...');
        if (!window.MiniGames) await window.loadMinigames?.();
        window.MiniGames ? MiniGames.showArcade() : UIManager.showPostVoteMessage('Arcade unavailable');
    }
};


// ============================================================================
// HELPER MANAGERS
// ============================================================================
const ContactManager = {
    show() {
        ModalManager.alert('📬 Contact', 'Found a bug? Email support@goodwordbadword.com', 'Got it!');
    }
};

const PinPad = {
    show(callback) {
        const modal = document.createElement('div');
        modal.id = 'pinPadModal';
        modal.className = 'fixed inset-0 z-[10000] flex items-center justify-center bg-black/70';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl p-6 max-w-xs w-full mx-4">
                <h3 class="text-xl font-bold text-center mb-4">Enter PIN</h3>
                <input type="password" id="pinInput" maxlength="4" class="w-full text-center text-3xl tracking-widest p-3 border-2 rounded-xl mb-4" placeholder="••••">
                <div class="grid grid-cols-3 gap-2 mb-4">
                    ${[1,2,3,4,5,6,7,8,9,'⌫',0,'✓'].map(n => `<button class="pin-btn p-4 text-2xl font-bold rounded-xl ${n === '✓' ? 'bg-green-500 text-white' : n === '⌫' ? 'bg-red-100 text-red-600' : 'bg-gray-100'}" data-value="${n}">${n}</button>`).join('')}
                </div>
                <button onclick="document.getElementById('pinPadModal').remove()" class="w-full py-2 text-gray-500">Cancel</button>
            </div>
        `;
        document.body.appendChild(modal);
        
        const input = document.getElementById('pinInput');
        modal.querySelectorAll('.pin-btn').forEach(btn => {
            btn.onclick = () => {
                const val = btn.dataset.value;
                if (val === '⌫') input.value = input.value.slice(0, -1);
                else if (val === '✓' && input.value.length === 4) { modal.remove(); callback(input.value); }
                else if (input.value.length < 4) input.value += val;
            };
        });
        input.focus();
    }
};


// ============================================================================
// ANIMATION STYLES
// ============================================================================
(function() {
    if (document.getElementById('game-animation-styles')) return;
    const style = document.createElement('style');
    style.id = 'game-animation-styles';
    style.innerHTML = `
        @keyframes fly-left { 0% { transform: translateX(0) rotate(0); opacity: 1; } 100% { transform: translateX(-150%) rotate(-20deg); opacity: 0; } }
        @keyframes fly-right { 0% { transform: translateX(0) rotate(0); opacity: 1; } 100% { transform: translateX(150%) rotate(20deg); opacity: 0; } }
        @keyframes fadeOut { 0% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(1.5); } }
        .animate-fly-left { animation: fly-left 0.3s ease-out forwards; }
        .animate-fly-right { animation: fly-right 0.3s ease-out forwards; }
        .word-fade-quick { animation: fadeOut 0.3s ease-out forwards; }
        .word-fade-llama { animation: fadeOut 8s ease-out forwards; }
        .active-press { transform: scale(0.95); }
        .golden-word { animation: golden-pulse 1.5s ease-in-out infinite; }
        @keyframes golden-pulse { 0%, 100% { text-shadow: 0 0 20px rgba(251, 191, 36, 0.5); } 50% { text-shadow: 0 0 40px rgba(251, 191, 36, 0.9); } }
    `;
    document.head.appendChild(style);
})();


// ============================================================================
// EXPORTS
// ============================================================================
window.SeededShuffle = SeededShuffle;
window.StreakManager = StreakManager;
window.LocalPeerManager = LocalPeerManager;
window.RoomManager = RoomManager;
window.Game = Game;
window.ContactManager = ContactManager;
window.PinPad = PinPad;

// Auto-start
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Game.init());
} else {
    setTimeout(() => Game.init(), 50);
}

console.log('%c[Game] Loaded', 'color: #f59e0b');

})();
