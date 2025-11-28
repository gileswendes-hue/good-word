const CONFIG = {
    API_BASE_URL: '/api/words',
    APP_VERSION: '5.9.4',

    // Special words with custom effects and probabilities
    SPECIAL: {
        CAKE: { text: 'CAKE', prob: 0.005, fade: 300, msg: "The cake is a lie!", dur: 3000 },
        LLAMA: { text: 'LLAMA', prob: 0.005, fade: 8000, msg: "what llama?", dur: 3000 },
        POTATO: { text: 'POTATO', prob: 0.005, fade: 300, msg: "Spudulica!", dur: 3000 },
        SQUIRREL: { text: 'SQUIRREL', prob: 0.005, fade: 300, msg: "🌰", dur: 3000 },
        MASON: { text: 'MASON', prob: 0.005, fade: 300, msg: "🦴", dur: 3000 }
    },
    CONTRIBUTION_THRESHOLD: 5,
    BOOST_FACTOR: 2,
    TIP_COOLDOWN: 4,
    HISTORY_SIZE: 300,
    VOTE: {
        MASH_LIMIT: 5,
        COOLDOWN_TIERS: [15, 30],
        STREAK_WINDOW: 1500,
        SWIPE_THRESHOLD: 100
    },

    THEME_SECRETS: {
        rainbow: 'UkFJTkJPV3xHQVl8U1BBUktMRXxDT0xPVVJ8UFJJREV8VU5JQ09STnxQUk9VRHxRVUVFUnxHTElUVEVSfExFU0JJQU58VElOU0VM',
        dark: 'TUlETklHSFR8QkxBQ0t8U0hBREV8R09USHxTSEFET1d8TklOSkF8REFSS3xOSUdIVHxTVEVBTFRI',
        banana: 'QkFOQU5BfEJBTkFOQVN8UExBTlRBSU58WUVMTE9XfFNQTElUfE1vbktFWXxIQU1NT0NL',
        winter: 'U05PV01BTnxTTk9XfElDRXxXSU5URVJ8RlJPWkVOfENISUxMfENPTER8RkxBS0V8QkxJWlpBUkR8SUNJQ0xFfFNMRUlHSHxTTk9XQkFMTHxTQ0FSRnxKQUNLRVR8U0xFREdFfE5PVkVNQkVSfERFQ0VNQkVSfEpBTlVBUll8SklOR0xF',
        summer: 'U1VNTUVSfEhPVHxCRUFDSHxIT0xJREFZfFNVTnxWQUNBVElPTnxTV0lNfFNBTkR8UE9PTHxKVUxZfEFVR1VTVHxKVU5F',
        halloween: 'SEFMTE9XRUVOfEdIT1NUfFBVTVBLSU58U1BJREVSfFNXRUVUU3xDT1NUVU1FfFNQT09LWXxPQ1RPQkVSfFdJVENIfFZBTVBJUkV8Wk9NQklFfEJBVHxNT05TVEVS',
        submarine: 'U1VCTUFSSU5FfFdBVEVSfFdBVkVTfFBMWU1PVVRIfEJSSVhIQU18UElSQVRFfFNFQXxBUVVBVElDfEFRVUF8REVFUHxPQ1RPUFVTfFJVTXxTSElQ',
        fire: 'RklSRXxCVVJOfEhPVHxIRUxMfElORkVSTk98RkxBTUV8Q09BTFN8Q1JBQ0tMRXxUT0FTVHxIRUFU',
        plymouth: 'UExZTU9VVEh8REVWT058SkFOTkVSU3xHSU4=',
        ballpit: 'QkFMTHxQSVR8UExBWXxKVU1QfEJPVU5DRXxDT0xPUnxCQUxMUElUfEJBTExSfENPTE9VUg==',
        space: 'U1BBQ0V8R0FMQVhZfFBMQU5FVHxTVEFSfE9SQklU'
    },
    TIPS: [
        "Tip: On mobile, try dragging the word left for good and right for bad.",
        "Tip: Try comparing words!",
        "Tip: Tap the word for a definition.",
        "Tip: Check the theme chooser.",
        "Tip: Turn off messages in Settings.",
        "Tip: Don't go mistaking your house burning down for the dawn.",
        "Tip: Go outside for a stomp?",
        "Tip: Nobody else has a clue either.",
        "Tip: Have you found the ball pit yet?",
        "Tip: I've got a floor, so what?",
        "Tip: Wear sunscreen.",
        "Tip: How thick is wall?",
        "Tip: Try saying hello to the spider?",
        "Tip: Ask them out for a coffee.",
        "Tip: Can you smell burning toast?",
        "Tip: Some of those who work forces, are the same who burn crosses.",
        "Tip: Time is an illusion. Lunchtime doubly so.",
        "Tip: It is better to keep your mouth closed and let people think you are a fool than to open it and remove all doubt.",
        "Tip: It's the things that are given, not won, are the things that you earned",
        "Tip: I'm so glad that you exist.",
        "Tip: Play with friends! Not this, something classic like Tetris or chess.",
        "Tip: Move into the country, eat a lot of peaches 🍑",
        "Tip: I wish there was a way to know you're in the good old days, before you've actually left them.",
        "Tip: London in summertime is great.",
        "Tip: You don't need a million dollars to do nothin', man!",
        "Tip: You can see the sea, it's over there between the land and the sky",
        "Tip: Cake or death?",
        "Tip: GOOD BOY, MASON! 🦴",
        "Tip: Knock, knock, Neo. 🐇",
        "Tip: ❤️💎"
    ]
};

// --- RESTORED DEPENDENCIES (These were missing) ---

const Effects = {
    ballLoop: null
};

const API = {
    async fetchWords() {
        try {
            const res = await fetch(CONFIG.API_BASE_URL);
            return res.ok ? await res.json() : [];
        } catch (e) { console.error(e); return null; }
    },
    async vote(id, type) {
        return fetch(`${CONFIG.API_BASE_URL}/${id}/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type })
        });
    },
    async submitWord(text) {
        return fetch(CONFIG.API_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
    },
    async define(text) {
        return fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${text}`);
    }
};

const ThemeManager = {
    secrets: {},
    init() {
        // Decode secrets
        this.secrets = {};
        Object.keys(CONFIG.THEME_SECRETS).forEach(k => {
            try {
                this.secrets[k] = atob(CONFIG.THEME_SECRETS[k]).split('|');
            } catch(e) { this.secrets[k] = []; }
        });
        
        // Populate chooser
        const sel = DOM.theme.chooser;
        if (sel) {
            sel.innerHTML = '<option value="default">Default Theme</option>';
            State.data.unlockedThemes.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t;
                opt.textContent = t.charAt(0).toUpperCase() + t.slice(1);
                sel.appendChild(opt);
            });
            sel.value = State.data.currentTheme;
        }
        this.apply(State.data.currentTheme);
    },
    checkUnlock(word) {
        const t = State.data.unlockedThemes;
        for (const [theme, words] of Object.entries(this.secrets)) {
            if (!t.includes(theme) && words.includes(word)) {
                t.push(theme);
                State.save('unlockedThemes', t);
                this.init(); // Refresh dropdown
                return true; // Unlocked something
            }
        }
        return false;
    },
    apply(themeName, manual = false) {
        if (manual) {
            State.save('currentTheme', themeName);
            State.save('manualTheme', themeName !== 'default');
        }
        
        document.body.className = ''; // Reset body classes
        document.body.classList.toggle('mode-colorblind', State.data.settings.colorblindMode);
        document.body.classList.toggle('mode-large-text', State.data.settings.largeText);

        // Hide all special effects
        Object.values(DOM.theme.effects).forEach(el => {
            if(el) el.style.display = 'none';
        });

        if (themeName === 'default') return;

        // Apply Theme Specifics
        document.body.classList.add(`theme-${themeName}`);
        
        // Show specific effect layer if it exists
        if (DOM.theme.effects[themeName]) {
            DOM.theme.effects[themeName].style.display = 'block';
        }
        
        // Start/Stop Ballpit Physics
        if (themeName === 'ballpit') {
            if (!Effects.ballLoop) Physics.run();
        } else {
            if (Effects.ballLoop) cancelAnimationFrame(Effects.ballLoop);
            Effects.ballLoop = null;
        }
    }
};

// --- DOM ELEMENT REFERENCES ---
const DOM = {
    header: {
        logoArea: document.getElementById('logoArea'),
        userStatsBar: document.getElementById('userStatsBar'),
        streak: document.getElementById('headerStreak'),
        userVotes: document.getElementById('headerUserVotes'),
        globalVotes: document.getElementById('headerGlobalVotes'),
        totalWords: document.getElementById('headerTotalWords'),
        good: document.getElementById('headerGood'),
        bad: document.getElementById('headerBad'),
        barGood: document.getElementById('headerBarGood'),
        barBad: document.getElementById('headerBarBad'),
        profileLabel: document.getElementById('headerProfileLabel'),
        profileEmoji: document.getElementById('headerProfileEmoji'),
        profileImage: document.getElementById('headerProfileImage')
    },
    game: {
        card: document.getElementById('gameCard'),
        wordFrame: document.getElementById('wordFrame'),
        wordDisplay: document.getElementById('wordDisplay'),
        dailyBanner: document.getElementById('dailyBanner'),
        dailyStatus: document.getElementById('dailyStatusText'),
        buttons: {
            good: document.getElementById('goodButton'),
            bad: document.getElementById('badButton'),
            notWord: document.getElementById('notWordButton'),
            custom: document.getElementById('customWordButton')
        },
        message: document.getElementById('postVoteMessage')
    },
    rankings: {
        good: document.getElementById('goodRankings'),
        bad: document.getElementById('badRankings'),
        fullGood: document.getElementById('fullGoodRankings'),
        fullBad: document.getElementById('fullBadRankings'),
        btnShow: document.getElementById('showTop100Button'),
        listsContainer: document.getElementById('rankingListsContainer'),
        searchContainer: document.getElementById('rankSearchContainer'),
        searchResult: document.getElementById('rankSearchResult'),
        clearSearch: document.getElementById('clearRankSearch'),
        searchInput: document.getElementById('rankSearchInput'),
        searchBtn: document.getElementById('rankSearchBtn')
    },
    theme: {
        chooser: document.getElementById('themeChooser'),
        effects: {
            snow: document.getElementById('snow-effect'),
            bubble: document.getElementById('bubble-effect'),
            fire: document.getElementById('fire-effect'),
            summer: document.getElementById('summer-effect'),
            plymouth: document.getElementById('plymouth-effect'),
            ballpit: document.getElementById('ballpit-effect'),
            space: document.getElementById('space-effect')
        }
    },
    modals: {
        submission: document.getElementById('submissionModal'),
        fullRankings: document.getElementById('fullRankingsModalContainer'),
        definition: document.getElementById('definitionModalContainer'),
        compare: document.getElementById('compareModalContainer'),
        settings: document.getElementById('settingsModalContainer'),
        profile: document.getElementById('profileModal'),
        dailyResult: document.getElementById('dailyResultModal')
    },
    profile: {
        streak: document.getElementById('profileStreak'),
        totalVotes: document.getElementById('profileTotalVotes'),
        contributions: document.getElementById('profileContributions'),
        themes: document.getElementById('profileThemes'),
        badges: document.getElementById('badgeContainer'),
        statsTitle: document.getElementById('profileStatsTitle'),
        saveMsg: document.getElementById('profileSaveMsg'),
        modalEmoji: document.getElementById('modalProfileEmoji'),
        modalImage: document.getElementById('modalProfileImage'),
        photoInput: document.getElementById('photoInput')
    },
    daily: {
        peopleCount: document.getElementById('dailyPeopleCount'),
        worldRank: document.getElementById('dailyWorldRank'),
        streakResult: document.getElementById('dailyStreakResult'),
        closeBtn: document.getElementById('closeDailyResult')
    },
    inputs: {
        newWord: document.getElementById('newWordInput'),
        wordOne: document.getElementById('wordOneInput'),
        wordTwo: document.getElementById('wordTwoInput'),
        modalMsg: document.getElementById('modalMessage'),
        compareResults: document.getElementById('compareResults'),
        username: document.getElementById('usernameInput'),
        settings: {
            tips: document.getElementById('toggleTips'),
            percentages: document.getElementById('togglePercentages'),
            colorblind: document.getElementById('toggleColorblind'),
            largeText: document.getElementById('toggleLargeText'),
            tilt: document.getElementById('toggleTilt'),
            mirror: document.getElementById('toggleMirror'),
            mute: document.getElementById('toggleMute'),
            zeroVotes: document.getElementById('toggleZeroVotes')
        }
    },
    general: {
        version: document.querySelector('.version-indicator')
    }
};

// --- STATE MANAGEMENT ---
const State = {
    data: {
        userId: localStorage.getItem('userId') || crypto.randomUUID(),
        username: localStorage.getItem('username') || '',
        voteCount: parseInt(localStorage.getItem('voteCount') || 0),
        contributorCount: parseInt(localStorage.getItem('contributorCount') || 0),
        profilePhoto: localStorage.getItem('profilePhoto') || null,
        badges: {
            cake: localStorage.getItem('cakeBadgeUnlocked') === 'true',
            llama: localStorage.getItem('llamaBadgeUnlocked') === 'true',
            potato: localStorage.getItem('potatoBadgeUnlocked') === 'true',
            squirrel: localStorage.getItem('squirrelBadgeUnlocked') === 'true',
            spider: localStorage.getItem('spiderBadgeUnlocked') === 'true',
            germ: localStorage.getItem('germBadgeUnlocked') === 'true',
            bone: localStorage.getItem('boneBadgeUnlocked') === 'true',
            poop: localStorage.getItem('poopBadgeUnlocked') === 'true',
            penguin: localStorage.getItem('penguinBadgeUnlocked') === 'true',
            scorpion: localStorage.getItem('scorpionBadgeUnlocked') === 'true',
            mushroom: localStorage.getItem('mushroomBadgeUnlocked') === 'true',
            needle: localStorage.getItem('needleBadgeUnlocked') === 'true',
            diamond: localStorage.getItem('diamondBadgeUnlocked') === 'true',
            rock: localStorage.getItem('rockBadgeUnlocked') === 'true'
        },
        settings: JSON.parse(localStorage.getItem('userSettings')) || {
            showTips: true,
            showPercentages: true,
            colorblindMode: false,
            largeText: false,
            enableTilt: false,
            mirrorMode: false,
            muteSounds: false,
            zeroVotesOnly: false
        },
        currentTheme: localStorage.getItem('currentTheme') || 'default',
        unlockedThemes: JSON.parse(localStorage.getItem('unlockedThemes')) || [],
        voteCounterForTips: parseInt(localStorage.getItem('voteCounterForTips')) || 0,
        manualTheme: localStorage.getItem('manualTheme') === 'true',
        seenHistory: JSON.parse(localStorage.getItem('seenHistory')) || [],
        lastMosquitoSpawn: parseInt(localStorage.getItem('lastMosquitoSpawn') || 0),
        daily: {
            streak: parseInt(localStorage.getItem('dailyStreak') || 0),
            lastDate: localStorage.getItem('dailyLastDate') || ''
        }
    },
    runtime: {
        allWords: [],
        currentWordIndex: 0,
        streak: 0,
        lastVoteTime: 0,
        isCoolingDown: false,
        cooldownTimer: null,
        mashLevel: 0,
        isDailyMode: false
    },
    save(k, v) {
        this.data[k] = v;
        const s = localStorage;
        if (k === 'settings') s.setItem('userSettings', JSON.stringify(v));
        else if (k === 'unlockedThemes') s.setItem('unlockedThemes', JSON.stringify(v));
        else if (k === 'seenHistory') s.setItem('seenHistory', JSON.stringify(v));
        else if (k === 'daily') {
            s.setItem('dailyStreak', v.streak);
            s.setItem('dailyLastDate', v.lastDate);
        } else if (k === 'profilePhoto') {
            s.setItem('profilePhoto', v);
        } else if (k === 'lastMosquitoSpawn') {
            s.setItem(k, v);
        } else if (k.startsWith('badge_')) s.setItem(k, v);
        else s.setItem(k, v)
    },
    unlockBadge(n) {
        if (this.data.badges[n]) return;
        this.data.badges[n] = true;
        localStorage.setItem(`${n}BadgeUnlocked`, 'true');
        UIManager.showPostVoteMessage(`Unlocked ${n} badge!`)
    },
    incrementVote() {
        this.data.voteCount++;
        localStorage.setItem('voteCount', this.data.voteCount)
    },
    incrementContributor() {
        this.data.contributorCount++;
        localStorage.setItem('contributorCount', this.data.contributorCount)
    },
    clearAll() {
        if (confirm("Clear all local data? Irreversible. I don't back up.")) {
            if (confirm("Are you really sure? All progress, badges, and stats will be lost forever.")) {
                localStorage.clear();
                window.location.reload()
            }
        }
    }
};

// Initialize User ID if missing
if (!localStorage.getItem('userId')) localStorage.setItem('userId', State.data.userId);

// --- ACCESSIBILITY HELPER ---
const Accessibility = {
    apply() {
        const s = State.data.settings,
            b = document.body;
        b.classList.toggle('mode-colorblind', s.colorblindMode);
        b.classList.toggle('mode-large-text', s.largeText);
        
        b.style.transform = s.mirrorMode ? 'scaleX(-1)' : '';
        b.style.overflowX = 'hidden'; 

        if (State.runtime.allWords.length > 0) {
            const currentWord = State.runtime.allWords[State.runtime.currentWordIndex];
            if(currentWord) UIManager.fitText(currentWord.text);
        }
    },
    getColors() {
        const cb = State.data.settings.colorblindMode;
        return {
            good: cb ? '#3b82f6' : '#10b981',
            bad: cb ? '#f97316' : '#ef4444'
        }
    }
};

// --- UTILITIES ---
const Utils = {
    hexToRgba(hex, alpha) {
        let r = 0, g = 0, b = 0;
        if (hex.length === 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16)
        } else if (hex.length === 7) {
            r = parseInt(hex.substring(1, 3), 16);
            g = parseInt(hex.substring(3, 5), 16);
            b = parseInt(hex.substring(5, 7), 16)
        }
        return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }
};

// --- PHYSICS ENGINE (BALL PIT) ---
const Physics = {
    balls: [],
    gx: 0, gy: 0.8,
    handleOrientation(e) {
        const x = e.gamma || 0, y = e.beta || 0;
        const tx = Math.min(Math.max(x / 4, -1), 1);
        const ty = Math.min(Math.max(y / 4, -1), 1);
        Physics.gx += (tx - Physics.gx) * 0.1;
        Physics.gy += (ty - Physics.gy) * 0.1
    },
    run() {
        const W = window.innerWidth, H = window.innerHeight;
        const cylW = Math.min(W, 500), minX = (W - cylW) / 2, maxX = minX + cylW;
        
        for (let s = 0; s < 8; s++) {
            Physics.balls.forEach(b => {
                if (!b.drag) {
                    b.vx += Physics.gx / 8;
                    b.vy += Physics.gy / 8;
                    b.x += b.vx;
                    b.y += b.vy;
                    b.vx *= 0.92;
                    b.vy *= 0.92;
                    if (b.x < minX) { b.x = minX; b.vx *= -0.2 }
                    if (b.x > maxX - b.r * 2) { b.x = maxX - b.r * 2; b.vx *= -0.2 }
                    if (b.y < 0) { b.y = 0; b.vy *= -0.2 }
                    if (b.y > H - b.r * 2) { b.y = H - b.r * 2; b.vy *= -0.2 }
                }
            });
            for (let i = 0; i < Physics.balls.length; i++) {
                for (let j = i + 1; j < Physics.balls.length; j++) {
                    const b1 = Physics.balls[i], b2 = Physics.balls[j];
                    const dx = (b2.x + b2.r) - (b1.x + b1.r), dy = (b2.y + b2.r) - (b1.y + b1.r);
                    const dist = Math.sqrt(dx * dx + dy * dy), minDist = b1.r + b2.r + 0.5;
                    if (dist < minDist && dist > 0) {
                        const angle = Math.atan2(dy, dx), tx = (Math.cos(angle) * (minDist - dist)) / 2, ty = (Math.sin(angle) * (minDist - dist)) / 2;
                        b1.x -= tx; b1.y -= ty; b2.x += tx; b2.y += ty;
                        if (!b1.drag && !b2.drag) {
                            const nx = dx / dist, ny = dy / dist;
                            const p = 2 * (b1.vx * nx + b1.vy * ny - b2.vx * nx - b2.vy * ny) / 2;
                            b1.vx -= p * nx * 0.15; b1.vy -= p * ny * 0.15;
                            b2.vx += p * nx * 0.15; b2.vy += p * ny * 0.15
                        }
                    }
                }
            }
        }
        
        Physics.balls.forEach(b => {
            b.el.style.transform = `translate(${b.x}px,${b.y}px)`;
            if (b.bubble) b.bubble.style.transform = `translate(${b.x+b.r}px,${b.y-20}px) translate(-50%,-100%)`
        });
        Effects.ballLoop = requestAnimationFrame(Physics.run)
    }
};

// --- AUDIO SYNTHESIS ---
const SoundManager = {
    ctx: null,
    masterGain: null,
    mosquitoOsc: null,
    mosquitoGain: null,

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.connect(this.ctx.destination);
            this.updateMute();
        }
    },

    updateMute() {
        if (this.masterGain) {
            const isMuted = State.data.settings.muteSounds;
            this.masterGain.gain.setValueAtTime(isMuted ? 0 : 0.3, this.ctx.currentTime);
            if (isMuted) this.stopBuzz(); 
        }
    },

    playTone(freq, type, duration, vol = 1) {
        if (!this.ctx) this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },

    playGood() {
        this.playTone(880, 'sine', 0.6, 0.4);
        setTimeout(() => this.playTone(1760, 'sine', 0.4, 0.2), 50);
    },

    playBad() {
        if (!this.ctx) this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.15);
        
        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
    },

    playWhoosh() {
        if (!this.ctx) this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine'; 
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 0.3);
        
        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 0.1);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    },

    playUnlock() {
        if (!this.ctx) this.init();
        const now = this.ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.1, now + 0.5 + (i * 0.1));
            gain.gain.linearRampToValueAtTime(0, now + 3);
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start();
            osc.stop(now + 3.5);
        });
    },

    // --- MOSQUITO AUDIO ---
    startBuzz() {
        if (State.data.settings.muteSounds) return; 
        if (!this.ctx) this.init();
        if (this.mosquitoOsc) this.stopBuzz();
        
        this.mosquitoOsc = this.ctx.createOscillator();
        this.mosquitoOsc.type = 'sawtooth';
        this.mosquitoOsc.frequency.value = 600; 
        
        this.mosquitoGain = this.ctx.createGain();
        this.mosquitoGain.gain.setValueAtTime(0.015, this.ctx.currentTime); 
        
        this.mosquitoOsc.connect(this.mosquitoGain);
        this.mosquitoGain.connect(this.masterGain);
        this.mosquitoOsc.start();
        this.rampBuzzPitch();
    },
    rampBuzzPitch() {
        if (!this.mosquitoOsc) return;
        const nextTime = this.ctx.currentTime + (Math.random() * 0.2 + 0.1);
        const nextPitch = 550 + Math.random() * 200;
        this.mosquitoOsc.frequency.linearRampToValueAtTime(nextPitch, nextTime);
        setTimeout(() => this.rampBuzzPitch(), 150);
    },
    setStuckMode(isStuck) {
        if (!this.mosquitoOsc) return;
        const pitch = isStuck ? 900 : 600;
        this.mosquitoOsc.frequency.setValueAtTime(pitch, this.ctx.currentTime);
        this.mosquitoGain.gain.linearRampToValueAtTime(isStuck ? 0.05 : 0.02, this.ctx.currentTime + 0.1);
    },
    stopBuzz() {
        if (this.mosquitoOsc) {
            try { this.mosquitoOsc.stop(); } catch(e){}
            this.mosquitoOsc.disconnect();
            this.mosquitoOsc = null;
        }
    }
};

// --- MOSQUITO LOGIC (UPDATED PHYSICS) ---
const MosquitoManager = {
    el: null, svg: null, path: null, checkInterval: null,
    
    // Physics
    x: 50, y: 50, angle: 0, speed: 0.35, 
    turnCycle: 0, loopTimer: 0,
    
    trailPoints: [], MAX_TRAIL: 50,

    state: 'hidden', raf: null,
    COOLDOWN: 5 * 60 * 1000, 

    startMonitoring() {
        if (this.checkInterval) clearInterval(this.checkInterval);
        this.attemptSpawn();
        this.checkInterval = setInterval(() => this.attemptSpawn(), 10000);
    },

    stopMonitoring() {
        if (this.checkInterval) clearInterval(this.checkInterval);
        this.remove();
    },

    attemptSpawn() {
        if (this.el) return;
        const now = Date.now();
        const last = State.data.lastMosquitoSpawn;
        if (now - last < this.COOLDOWN) return;
        if (Math.random() > 0.3) return; 
        this.init();
    },

    init() {
        if (this.el) this.remove();
        
        this.el = document.createElement('div');
        this.el.innerHTML = '🦟';
        this.el.className = 'mosquito-entity';
        
        const startRight = Math.random() > 0.5;
        this.x = startRight ? 105 : -5; 
        this.y = Math.random() * 50 + 10;
        this.angle = startRight ? Math.PI : 0; 

        Object.assign(this.el.style, {
            position: 'fixed', fontSize: '3rem', zIndex: '100',
            pointerEvents: 'auto', cursor: 'pointer', transition: 'none', 
            filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.5))',
            left: this.x + '%', top: this.y + '%', willChange: 'transform, left, top'
        });

        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        Object.assign(this.svg.style, {
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            pointerEvents: 'none', zIndex: '99'
        });
        
        this.path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this.path.setAttribute("fill", "none");
        this.path.setAttribute("stroke", "rgba(0,0,0,0.2)"); 
        this.path.setAttribute("stroke-width", "2");
        this.path.setAttribute("stroke-dasharray", "5, 5");
        this.path.setAttribute("stroke-linecap", "round");
        
        this.svg.appendChild(this.path);
        document.body.appendChild(this.svg);
        document.body.appendChild(this.el);
        
        this.el.onclick = (e) => {
            e.stopPropagation();
            if (this.state === 'stuck') this.startRescue();
            else if (this.state === 'flying') UIManager.showPostVoteMessage("Too fast! Wait for the web!");
        };
        
        this.state = 'flying';
        this.trailPoints = [];
        this.loopTimer = 0;
        SoundManager.startBuzz();
        this.loop();
    },

    startRescue() {
        this.state = 'thanking';
        SoundManager.stopBuzz(); 
        
        this.path.setAttribute('d', '');
        this.trailPoints = [];

        const bubble = document.createElement('div');
        bubble.textContent = "Thank you! 💖";
        Object.assign(bubble.style, {
            position: 'absolute', bottom: '100%', left: '50%',
            transform: 'translateX(-50%)', background: 'white', color: 'black',
            padding: '8px 12px', borderRadius: '12px', fontSize: '14px',
            fontWeight: 'bold', whiteSpace: 'nowrap', border: '2px solid #ccc',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)', pointerEvents: 'none', zIndex: '101'
        });
        this.el.appendChild(bubble);

        setTimeout(() => {
            if (bubble) bubble.remove();
            this.state = 'leaving';
            SoundManager.startBuzz();
            this.angle = Math.random() * Math.PI * 2;
            this.speed = 0.6; // Leave fast
        }, 2000);
    },

    loop() {
        if (!document.body.contains(this.el)) return;

        if (this.state === 'flying' || this.state === 'leaving') {
            
            // --- NEW STEERING LOGIC ---
            this.turnCycle += 0.05;
            
            // 1. Base: Wavy Line (Sine wave steering)
            let turnSpeed = Math.cos(this.turnCycle) * 0.03;

            // 2. Loop-the-loop Override
            if (this.state === 'flying') {
                if (this.loopTimer > 0) {
                    turnSpeed = 0.25; // Constant hard turn = Circle
                    this.loopTimer--;
                } else if (Math.random() < 0.005) {
                    this.loopTimer = 60; // Trigger loop for ~1 sec
                }
            }

            // 3. Apply Steering
            this.angle += turnSpeed;
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;

            // --- SCREEN BOUNDARIES ---
            if (this.state === 'flying') {
                // Wrap X (Pac-Man style)
                if (this.x > 110) { this.x = -10; this.trailPoints = []; }
                else if (this.x < -10) { this.x = 110; this.trailPoints = []; }
            }
            
            // Bounce Y
            if (this.y < 5 || this.y > 95) {
                this.angle = -this.angle; 
                this.y = Math.max(5, Math.min(95, this.y));
            }

            // --- RENDER ---
            this.el.style.left = this.x + '%';
            this.el.style.top = this.y + '%';
            
            // Face Left or Right (No spinning)
            const facingRight = Math.cos(this.angle) > 0;
            this.el.style.transform = facingRight ? 'scaleX(-1)' : 'scaleX(1)';

            // --- TRAIL ---
            const pxX = (this.x / 100) * window.innerWidth;
            const pxY = (this.y / 100) * window.innerHeight;
            
            if (pxX > 0 && pxX < window.innerWidth) this.trailPoints.push({x: pxX, y: pxY});
            
            if (this.trailPoints.length > this.MAX_TRAIL) this.trailPoints.shift();

            if (this.trailPoints.length > 1) {
                const d = `M ${this.trailPoints.map(p => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L ')}`;
                this.path.setAttribute('d', d);
            }

            // --- WEB TRAP (Pixel-Perfect Triangle) ---
            // Web is ~300px in Top-Right. 
            const distRight = window.innerWidth - pxX;
            const distTop = pxY;
            if (this.state === 'flying' && (distRight + distTop) < 280) {
                this.state = 'stuck';
                SoundManager.stopBuzz(); 
                UIManager.showPostVoteMessage("It's stuck in the web!");
            }

            // Exit Check
            if (this.state === 'leaving') {
                if (this.x < -10 || this.x > 110 || this.y < -10 || this.y > 110) {
                    this.finish();
                }
            }

        } else if (this.state === 'stuck') {
            const jitterX = (Math.random() - 0.5) * 3;
            const jitterY = (Math.random() - 0.5) * 3;
            this.el.style.transform = `translate(${jitterX}px, ${jitterY}px)`;
        } else if (this.state === 'thanking') {
            this.el.style.transform = `scale(1.2)`;
        }

        this.raf = requestAnimationFrame(() => this.loop());
    },

    eat() {
        if (this.state !== 'stuck') return;
        UIManager.showPostVoteMessage("Chomp! 🕷️");
        this.finish();
    },

    finish() {
        State.save('lastMosquitoSpawn', Date.now());
        this.remove();
    },

    remove() {
        if (this.raf) cancelAnimationFrame(this.raf);
        SoundManager.stopBuzz();
        if (this.el && this.el.parentNode) this.el.remove();
        if (this.svg && this.svg.parentNode) this.svg.remove(); 
        this.el = null;
        this.svg = null;
        this.trailPoints = [];
        this.state = 'hidden';
    }
};

// --- GRAVITY TILT EFFECT ---
const TiltManager = {
    active: false,
    
    handle(e) {
        if (!TiltManager.active) return;

        // Gamma: Left/Right tilt (-90 to 90)
        // Beta: Front/Back tilt (-180 to 180)
        const x = e.gamma || 0; 
        const y = e.beta || 0;

        // Calibration: Assume phone is held at 45 degree angle
        const moveX = Math.min(Math.max(x, -25), 25);
        const moveY = Math.min(Math.max(y - 45, -25), 25);

        // Apply to wordFrame (the container) to avoid conflict with swipe logic
        DOM.game.wordFrame.style.transition = 'transform 0.1s ease-out';
        DOM.game.wordFrame.style.transform = `translate3d(${moveX * 1.5}px, ${moveY * 1.5}px, 0)`;
    },

    start() {
        if (this.active) return;
        // Only run if Setting is ON and Theme is DEFAULT
        if (State.data.settings.enableTilt && State.data.currentTheme === 'default') {
            this.active = true;
            window.addEventListener('deviceorientation', this.handle, true);
        }
    },

    stop() {
        if (!this.active) return;
        this.active = false;
        window.removeEventListener('deviceorientation', this.handle, true);
        DOM.game.wordFrame.style.transform = ''; // Reset position
    },
    
    refresh() {
        this.stop();
        this.start();
    }
};

// --- MODAL MANAGER ---
const ModalManager = {
    toggle(id, show) {
        const e = DOM.modals[id];
        e.classList.toggle('hidden', !show);
        e.classList.toggle('flex', show)
    },
    init() {
        document.getElementById('showSettingsButton').onclick = () => {
            DOM.inputs.settings.tips.checked = State.data.settings.showTips;
            DOM.inputs.settings.percentages.checked = State.data.settings.showPercentages;
            DOM.inputs.settings.colorblind.checked = State.data.settings.colorblindMode;
            DOM.inputs.settings.largeText.checked = State.data.settings.largeText;
			DOM.inputs.settings.tilt.checked = State.data.settings.enableTilt;
			DOM.inputs.settings.tilt.onchange = e => {
                const v = e.target.checked;
                State.save('settings', { ...State.data.settings, enableTilt: v });
                TiltManager.refresh(); 
            };
            
            DOM.inputs.settings.mirror.checked = State.data.settings.mirrorMode;
            DOM.inputs.settings.mirror.onchange = e => {
                const v = e.target.checked;
                State.save('settings', { ...State.data.settings, mirrorMode: v });
                Accessibility.apply();
            };

            // Mute Toggle Logic
            if (!document.getElementById('toggleMute')) {
                const container = DOM.inputs.settings.mirror.closest('.space-y-4') || DOM.inputs.settings.mirror.parentElement.parentElement;
                const div = document.createElement('div');
                div.className = "flex items-center justify-between";
                div.innerHTML = `<label for="toggleMute" class="text-lg font-medium text-gray-700">Mute All Sounds</label><input type="checkbox" id="toggleMute" class="h-6 w-6 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">`;
                container.appendChild(div);
                DOM.inputs.settings.mute = document.getElementById('toggleMute');
            }
            
            DOM.inputs.settings.mute.checked = State.data.settings.muteSounds;
            DOM.inputs.settings.mute.onchange = e => {
                const v = e.target.checked;
                State.save('settings', { ...State.data.settings, muteSounds: v });
                SoundManager.updateMute();
            };

            // Zero Votes Logic
            if (!document.getElementById('toggleZeroVotes')) {
                const container = DOM.inputs.settings.mirror.closest('.space-y-4') || DOM.inputs.settings.mirror.parentElement.parentElement;
                const div = document.createElement('div');
                div.className = "flex items-center justify-between";
                div.innerHTML = `<label for="toggleZeroVotes" class="text-lg font-medium text-gray-700">Only 0/0 Words</label><input type="checkbox" id="toggleZeroVotes" class="h-6 w-6 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">`;
                container.appendChild(div);
                DOM.inputs.settings.zeroVotes = document.getElementById('toggleZeroVotes');
            }

            DOM.inputs.settings.zeroVotes.checked = State.data.settings.zeroVotesOnly;
            DOM.inputs.settings.zeroVotes.onchange = e => {
                const v = e.target.checked;
                State.save('settings', { ...State.data.settings, zeroVotesOnly: v });
                Game.refreshData(true); // Force reload list
            };

            this.toggle('settings', true)
        };
        document.getElementById('closeSettingsModal').onclick = () => this.toggle('settings', false);
        DOM.inputs.settings.tips.onchange = e => State.save('settings', { ...State.data.settings, showTips: e.target.checked });
        DOM.inputs.settings.percentages.onchange = e => State.save('settings', { ...State.data.settings, showPercentages: e.target.checked });
        DOM.inputs.settings.colorblind.onchange = e => {
            const v = e.target.checked;
            State.save('settings', { ...State.data.settings, colorblindMode: v });
            Accessibility.apply()
        };
        DOM.inputs.settings.largeText.onchange = e => {
            const v = e.target.checked;
            State.save('settings', { ...State.data.settings, largeText: v });
            Accessibility.apply()
        };
        DOM.game.buttons.custom.onclick = () => {
            DOM.inputs.newWord.value = '';
            DOM.inputs.modalMsg.textContent = '';
            this.toggle('submission', true)
        };
        document.getElementById('cancelSubmitButton').onclick = () => this.toggle('submission', false);
        DOM.rankings.btnShow.onclick = () => {
            UIManager.renderFullRankings();
            this.toggle('fullRankings', true)
        };
        document.getElementById('closeFullRankingsModal').onclick = () => this.toggle('fullRankings', false);
        document.getElementById('compareWordsButton').onclick = () => {
            DOM.inputs.wordOne.value = '';
            DOM.inputs.wordTwo.value = '';
            DOM.inputs.compareResults.innerHTML = 'Type words above to see who wins!';
            this.toggle('compare', true)
        };
        document.getElementById('closeCompareModal').onclick = () => this.toggle('compare', false);
        DOM.game.wordDisplay.onclick = () => Game.showDefinition();
        document.getElementById('closeDefinitionModal').onclick = () => this.toggle('definition', false);
        DOM.rankings.searchBtn.onclick = () => UIManager.handleRankSearch();
        DOM.rankings.clearSearch.onclick = () => {
            DOM.rankings.searchInput.value = '';
            DOM.rankings.searchContainer.classList.add('hidden');
            DOM.rankings.listsContainer.classList.remove('hidden')
        };
        DOM.header.userStatsBar.onclick = () => UIManager.openProfile();
        document.getElementById('closeProfileModal').onclick = () => this.toggle('profile', false);
        document.getElementById('saveUsernameBtn').onclick = async () => {
            const n = DOM.inputs.username.value.trim(),
                m = DOM.profile.saveMsg;
            if (!n || n.includes(' ') || n.length > 45) {
                m.textContent = "Invalid name (no spaces).";
                m.className = "text-xs text-red-500 mt-1 font-bold";
                return
            }
            State.save('username', n);
            UIManager.updateProfileDisplay();
            m.textContent = "Saved!";
            m.className = "text-xs text-green-500 mt-1 font-bold";
            const e = State.runtime.allWords.some(w => w.text.toUpperCase() === n.toUpperCase());
            if (!e) {
                m.textContent = "Saved & submitted as new word!";
                try {
                    await API.submitWord(n);
                    State.incrementContributor()
                } catch {
                    console.error("Failed to auto-submit")
                }
            }
            setTimeout(() => m.textContent = '', 2000)
        };
        document.getElementById('shareProfileButton').onclick = () => ShareManager.share();
        DOM.daily.closeBtn.onclick = () => {
            this.toggle('dailyResult', false);
            Game.disableDailyMode()
        };
        // Handle Photo Upload
        DOM.profile.photoInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (file.size > 2 * 1024 * 1024) {
                alert("File too large. Please choose an image under 2MB.");
                return;
            }

            const reader = new FileReader();
            reader.onload = (readerEvent) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_SIZE = 150; 
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                    State.save('profilePhoto', dataUrl);
                    UIManager.updateProfileDisplay();
                    
                    DOM.profile.saveMsg.textContent = "Photo Updated!";
                    DOM.profile.saveMsg.className = "text-xs text-green-500 mt-1 font-bold";
                    setTimeout(() => DOM.profile.saveMsg.textContent = '', 2000);
                };
                img.src = readerEvent.target.result;
            };
            reader.readAsDataURL(file);
        };
        Object.keys(DOM.modals).forEach(k => {
            DOM.modals[k].addEventListener('click', e => {
                if (e.target === DOM.modals[k]) this.toggle(k, false)
            })
        })
    }
};

// --- SHARE MANAGER ---
const ShareManager = {
    async generateImage() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const width = 1080; // Standard social square/portrait width
        const height = 1350;
        canvas.width = width;
        canvas.height = height;

        // 1. Background (Gradient)
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, '#6366f1'); // Indigo-500
        grad.addColorStop(1, '#a855f7'); // Purple-500
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // 2. White Card Container
        const margin = 60;
        const cardY = 150;
        const cardH = height - 280; 
        ctx.fillStyle = '#ffffff';
        if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(margin, cardY, width - (margin * 2), cardH, 40);
            ctx.fill();
        } else {
            ctx.fillRect(margin, cardY, width - (margin * 2), cardH);
        }

        // 3. Header Text
        const name = State.data.username || "Player";
        ctx.fillStyle = '#1f2937'; 
        ctx.font = 'bold 60px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${name.toUpperCase()}'S STATS`, width / 2, cardY + 100);

        ctx.fillStyle = '#6b7280'; 
        ctx.font = '30px Inter, sans-serif';
        ctx.fillText("GOOD WORD / BAD WORD", width / 2, cardY + 150);

        // 4. Stats Grid
        const stats = [
            { label: 'Day Streak', val: State.data.daily.streak, icon: '🔥', color: '#fff7ed', text: '#ea580c' },
            { label: 'Total Votes', val: State.data.voteCount.toLocaleString(), icon: '🗳️', color: '#eff6ff', text: '#2563eb' },
            { label: 'Words Added', val: State.data.contributorCount.toLocaleString(), icon: '✍️', color: '#f0fdf4', text: '#16a34a' },
            { label: 'Themes', val: DOM.profile.themes.textContent, icon: '🎨', color: '#faf5ff', text: '#9333ea' }
        ];

        let gridY = cardY + 220;
        const boxW = 400;
        const boxH = 180;
        const gap = 40;
        const startX = (width - (boxW * 2 + gap)) / 2;

        stats.forEach((stat, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const x = startX + (col * (boxW + gap));
            const y = gridY + (row * (boxH + gap));

            ctx.fillStyle = stat.color;
            ctx.fillRect(x, y, boxW, boxH);
            ctx.strokeStyle = stat.text + '40'; 
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, boxW, boxH);

            ctx.font = '60px serif';
            ctx.textAlign = 'center';
            ctx.fillText(stat.icon, x + boxW / 2, y + 70);

            ctx.fillStyle = stat.text;
            ctx.font = 'bold 50px Inter, sans-serif';
            ctx.fillText(stat.val, x + boxW / 2, y + 130);

            ctx.fillStyle = '#6b7280';
            ctx.font = 'bold 20px Inter, sans-serif';
            ctx.fillText(stat.label.toUpperCase(), x + boxW / 2, y + 160);
        });

        // 5. Badges Section
        const badgeY = gridY + (2 * (boxH + gap)) + 60;
        ctx.fillStyle = '#374151';
        ctx.font = 'bold 30px Inter, sans-serif';
        ctx.fillText("BADGES UNLOCKED", width / 2, badgeY);

        const allBadges = [
            { k: 'cake', i: '🎂' }, { k: 'llama', i: '🦙' }, { k: 'potato', i: '🥔' },
            { k: 'squirrel', i: '🐿️' }, { k: 'spider', i: '🕷️' }, { k: 'germ', i: '🦠' },
            { k: 'bone', i: '🦴' }, { k: 'poop', i: '💩' }, { k: 'penguin', i: '🐧' },
            { k: 'scorpion', i: '🦂' }, { k: 'mushroom', i: '🍄' }, { k: 'needle', i: '💉' },
            { k: 'diamond', i: '💎' }, { k: 'rock', i: '🤘' }
        ];

        let bx = (width - (7 * 80)) / 2 + 40; 
        let by = badgeY + 80;

        allBadges.forEach((b, i) => {
            const unlocked = State.data.badges[b.k];
            ctx.font = '60px serif';
            ctx.textAlign = 'center';
            
            if (unlocked) {
                ctx.globalAlpha = 1.0;
                ctx.filter = 'none';
            } else {
                ctx.globalAlpha = 0.2;
                ctx.filter = 'grayscale(100%)';
            }
            
            if (i === 7) { bx = (width - (7 * 80)) / 2 + 40; by += 100; }
            
            ctx.fillText(b.i, bx, by);
            bx += 80;
        });

        ctx.globalAlpha = 1.0;
        ctx.filter = 'none';

        // 6. Footer
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 50px Inter, sans-serif'; 
        ctx.fillText("GBword.com", width / 2, height - 90);
        
        ctx.font = '30px Inter, sans-serif';
        ctx.fillText("Play Daily & Create Words", width / 2, height - 40);

        return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    },

    async share() {
        UIManager.showPostVoteMessage("Generating image...");
        try {
            const blob = await this.generateImage();
            const file = new File([blob], 'my-gbword-stats.png', { type: 'image/png' });
            
            const shareData = {
                title: 'My Stats',
                text: 'Check out my Good Word / Bad Word stats! 🗳️\n\nPlay now at http://good-word.onrender.com/',
                url: 'http://good-word.onrender.com/',
                files: [file]
            };

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share(shareData);
            } else {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'gbword-stats.png';
                a.click();
                
                try {
                    await navigator.clipboard.writeText('http://good-word.onrender.com/');
                    UIManager.showPostVoteMessage("Image saved & Link copied!");
                } catch {
                    UIManager.showPostVoteMessage("Image downloaded!");
                }
            }
        } catch (e) {
            console.error(e);
            UIManager.showPostVoteMessage("Could not share image.");
        }
    }
};

const UIManager = {
    msgTimeout: null,
    showMessage(t, err = false) {
        const wd = DOM.game.wordDisplay;
        wd.textContent = t;
        wd.className = `text-4xl font-bold text-center min-h-[72px] ${err?'text-red-500':'text-gray-500'}`;
        wd.style.fontSize = '2.0rem';
        wd.style.cursor = 'default';
        DOM.game.wordFrame.style.padding = '0';
        this.disableButtons(true)
    },
    disableButtons(d) {
        Object.values(DOM.game.buttons).forEach(b => {
            if (!b.id.includes('custom')) b.disabled = d
        })
    },
    showPostVoteMessage(m) {
        const el = DOM.game.message;
        if (this.msgTimeout) clearTimeout(this.msgTimeout);
        el.classList.remove('opacity-100');
        el.classList.add('opacity-0');
        setTimeout(() => {
            el.innerHTML = m;
            el.classList.remove('opacity-0');
            el.classList.add('opacity-100');
            this.msgTimeout = setTimeout(() => {
                el.classList.remove('opacity-100');
                el.classList.add('opacity-0')
            }, 5000)
        }, 150)
    },
    updateStats() {
        const w = State.runtime.allWords;
        if (!w.length) return;
        
        DOM.header.streak.textContent = State.data.daily.streak;
        DOM.header.userVotes.textContent = State.data.voteCount.toLocaleString();
        
        const totalGood = w.reduce((a, b) => a + (b.goodVotes || 0), 0);
        const totalBad = w.reduce((a, b) => a + (b.badVotes || 0), 0);
        const globalTotal = totalGood + totalBad;

        DOM.header.globalVotes.textContent = globalTotal.toLocaleString();
        DOM.header.totalWords.textContent = w.length.toLocaleString();
        DOM.header.good.textContent = totalGood.toLocaleString();
        DOM.header.bad.textContent = totalBad.toLocaleString();

        // --- GRAPH LOGIC ---
        if (globalTotal > 0) {
            const goodPct = (totalGood / globalTotal) * 100;
            const badPct = 100 - goodPct; 

            DOM.header.barGood.style.width = `${goodPct}%`;
            DOM.header.barBad.style.width = `${badPct}%`;
        } else {
            DOM.header.barGood.style.width = '50%';
            DOM.header.barBad.style.width = '50%';
        }
        this.renderMiniRankings();
    },
    updateProfileDisplay() {
        const n = State.data.username;
        const p = State.data.profilePhoto; 
        
        DOM.header.profileLabel.textContent = n ? `${n}'s Profile` : 'My Profile';
        DOM.profile.statsTitle.textContent = n ? `${n}'s Stats` : 'Your Stats';
        if (n) DOM.inputs.username.value = n;

        if (p) {
            DOM.header.profileEmoji.classList.add('hidden');
            DOM.header.profileImage.src = p;
            DOM.header.profileImage.classList.remove('hidden');
        } else {
            DOM.header.profileEmoji.classList.remove('hidden');
            DOM.header.profileImage.classList.add('hidden');
        }

        if (p) {
            DOM.profile.modalEmoji.classList.add('hidden');
            DOM.profile.modalImage.src = p;
            DOM.profile.modalImage.classList.remove('hidden');
        } else {
            DOM.profile.modalEmoji.classList.remove('hidden');
            DOM.profile.modalImage.classList.add('hidden');
        }
    },
    openProfile() {
        this.updateProfileDisplay();
        const d = State.data;
        DOM.profile.streak.textContent = d.daily.streak;
        DOM.profile.totalVotes.textContent = d.voteCount.toLocaleString();
        DOM.profile.contributions.textContent = d.contributorCount.toLocaleString();
        const totalAvailable = Object.keys(CONFIG.THEME_SECRETS).length + 1;
        const userCount = d.unlockedThemes.length + 1;
        
        DOM.profile.themes.textContent = `${userCount} / ${totalAvailable}`;
        const b = DOM.profile.badges;
        const row1 = [{ k: 'cake', i: '🎂', w: 'CAKE' }, { k: 'llama', i: '🦙', w: 'LLAMA' }, { k: 'potato', i: '🥔', w: 'POTATO' }, { k: 'squirrel', i: '🐿️', w: 'SQUIRREL' }, { k: 'spider', i: '🕷️', w: 'SPIDER' }, { k: 'germ', i: '🦠', w: 'GERM' }, { k: 'bone', i: '🦴', w: 'MASON' }];
        const row2 = [{ k: 'poop', i: '💩' }, { k: 'penguin', i: '🐧' }, { k: 'scorpion', i: '🦂' }, { k: 'mushroom', i: '🍄' }, { k: 'needle', i: '💉' }, { k: 'diamond', i: '💎' },{ k: 'rock', i: '🤘' }];
        const renderRow = (list) => `<div class="flex flex-wrap justify-center gap-3 text-3xl w-full">` + list.map(x => {
            const un = d.badges[x.k];
            return `<span class="${un?'':'opacity-25 grayscale'} transition-all duration-300 transform ${un?'hover:scale-125 cursor-pointer badge-item':''}" title="${un?'Unlocked':'Locked'}" ${x.w?`data-word="${x.w}"`:''}>${x.i}</span>`
        }).join('') + `</div>`;
        b.innerHTML = `<div class="text-xs font-bold text-gray-500 uppercase mb-2 mt-2">🏆 Word Badges</div>` + renderRow(row1) + `<div class="h-px bg-gray-100 w-full my-4"></div><div class="text-xs font-bold text-gray-500 uppercase mb-2">🧸 Found Items</div>` + renderRow(row2);
        b.querySelectorAll('.badge-item').forEach(el => {
            el.onclick = () => {
                if (el.dataset.word) {
                    Game.loadSpecial(el.dataset.word);
                    ModalManager.toggle('profile', false)
                }
            }
        });
        ModalManager.toggle('profile', true)
    },
    displayWord(w) {
        if (!w) {
            this.showMessage("No words available!");
            return
        }
        const wd = DOM.game.wordDisplay,
            txt = w.text.toUpperCase();
        wd.textContent = txt;
        wd.className = 'font-extrabold text-gray-900 text-center min-h-[72px]';
        wd.style = '';
        wd.style.opacity = '1';
        const t = State.data.currentTheme;
        if (['dark', 'halloween', 'submarine', 'fire', 'plymouth'].includes(t)) wd.style.color = '#f3f4f6';
        if (t === 'halloween') {
            wd.style.color = '#FF8C00';
            wd.style.textShadow = '2px 2px 0px #1a0000, 0 0 8px rgba(255,140,0,1), 0 0 15px rgba(255,69,0,0.6)'
        }
        if (t === 'submarine') {
            wd.style.color = '#b0e0e6';
            wd.style.textShadow = '0 0 10px rgba(176,224,230,0.7), 0 0 5px rgba(255,255,255,0.3)';
            wd.style.animation = 'bobbing-word 2.5s ease-in-out infinite'
        }
        if (t === 'fire') {
            wd.style.color = '#ffaa00';
            wd.style.textShadow = '2px 2px 0px #300, 0 0 8px #ff5000, 0 0 20px #ff0000'
        }
        if (t === 'banana') {
            wd.style.color = '#ffd200';
            wd.style.animation = 'bounce-word .5s ease-out infinite alternate'
        }
        if (t === 'winter') {
            wd.style.color = '#01579b';
            wd.classList.remove('animate-snow-text');
            void wd.offsetWidth;
            wd.classList.add('animate-snow-text')
        }
        if (t === 'summer') {
            wd.style.color = '#fffde7';
            wd.style.textShadow = '0 0 5px #fff9c4, 0 0 20px #ffeb3b, 0 0 40px #ff9800, 0 0 70px #ff5722';
            wd.style.animation = 'sun-pulse 4s ease-in-out infinite alternate'
        } else {
            if (!['banana', 'rainbow', 'submarine'].includes(t)) wd.style.animation = 'none'
        }
        if (t === 'rainbow') {
            wd.style.background = 'linear-gradient(45deg, #f00, #ff7f00, #ff0, #0f0, #0ff, #00f, #9400d3)';
            wd.style.webkitBackgroundClip = 'text';
            wd.style.webkitTextFillColor = 'transparent';
            wd.style.color = 'transparent';
            wd.style.animation = 'rainbow-text 5s ease infinite'
        }
        const drift = document.getElementById('card-snow-drift');
        if (t === 'winter') {
            drift.classList.remove('animate-snow-drift');
            void drift.offsetWidth;
            drift.classList.add('animate-snow-drift')
        } else {
            drift.style.height = '0';
        }
        this.fitText(txt);
        if (!State.runtime.isCoolingDown) this.disableButtons(false);
        wd.style.cursor = 'grab'
    },
    fitText(t) {
        const isLarge = State.data.settings.largeText;
        const baseSize = isLarge ? 140 : 96; 
        const minSize = isLarge ? 32 : 24;

        const wd = DOM.game.wordDisplay;
        const cW = DOM.game.card.clientWidth - parseFloat(getComputedStyle(DOM.game.card).paddingLeft) * 2;

        wd.style.fontSize = `${baseSize}px`;
        wd.style.whiteSpace = 'nowrap';

        if (wd.scrollWidth > cW) {
            const s = cW / wd.scrollWidth;
            wd.style.fontSize = Math.max(minSize, Math.floor(baseSize * s)) + 'px';
        }
        wd.style.whiteSpace = 'normal';
    },
    renderRankingsImpl(c, l, type, isF) {
        c.innerHTML = '';
        if (!l.length) {
            c.innerHTML = `<p class="text-gray-500">No data yet.</p>`;
            return
        }
        l.forEach((w, i) => {
            const d = document.createElement('div');
            d.className = `flex justify-between items-center py-1 ${isF?'full-ranking-item text-sm':'rank-item'}`;
            const bg = type === 'good' ? 'bg-green-500' : 'bg-red-500',
                val = type === 'good' ? w.score : Math.abs(w.score);
            d.innerHTML = `<div class="flex items-center ${isF?'space-x-3':'space-x-2'}"><span class="font-bold ${isF?'text-base w-8':'text-lg w-5'} text-center text-gray-500 flex-shrink-0">${w.rank||(i+1)}.</span><span class="font-medium text-gray-800">${w.text.toUpperCase()}</span></div><div class="flex items-center space-x-3"><span class="text-xs text-white ${bg} px-2 rounded-full font-bold">${val}</span><span class="text-sm text-gray-600">(${w.good} / ${w.bad})</span></div>`;
            c.appendChild(d)
        })
    },
    getRankedLists(lim) {
        const r = State.runtime.allWords.map(w => ({
            text: w.text,
            good: w.goodVotes || 0,
            bad: w.badVotes || 0,
            score: (w.goodVotes || 0) - (w.badVotes || 0)
        }));
        const tg = [...r].sort((a, b) => (b.score - a.score) || ((b.good + b.bad) - (a.good + a.bad)));
        const tb = [...r].sort((a, b) => (a.score - b.score) || ((b.good + b.bad) - (a.good + a.bad)));
        if (lim === 0) return { topGood: tg, topBad: tb };
        return { topGood: tg.slice(0, lim), topBad: tb.slice(0, lim) }
    },
    renderMiniRankings() {
        const { topGood, topBad } = this.getRankedLists(5);
        this.renderRankingsImpl(DOM.rankings.good, topGood, 'good', false);
        this.renderRankingsImpl(DOM.rankings.bad, topBad, 'bad', false)
    },
    renderFullRankings() {
        const { topGood, topBad } = this.getRankedLists(100);
        this.renderRankingsImpl(DOM.rankings.fullGood, topGood, 'good', true);
        this.renderRankingsImpl(DOM.rankings.fullBad, topBad, 'bad', true)
    },
    handleRankSearch() {
        const q = DOM.rankings.searchInput.value.trim().toUpperCase();
        if (!q) return;
        const { topGood, topBad } = this.getRankedLists(0);
        const gI = topGood.findIndex(w => w.text.toUpperCase() === q);
        const bI = topBad.findIndex(w => w.text.toUpperCase() === q);
        DOM.rankings.listsContainer.classList.add('hidden');
        DOM.rankings.searchContainer.classList.remove('hidden');
        const c = DOM.rankings.searchResult;
        if (gI === -1) {
            c.innerHTML = `<p class="text-xl text-gray-700 font-bold">Word not found: ${q}</p>`;
            return
        }
        const w = topGood[gI];
        c.innerHTML = `<div class="p-4 bg-white rounded-xl shadow-sm border border-gray-200 inline-block w-full max-w-sm"><h3 class="text-2xl font-black text-gray-800 mb-4">${w.text.toUpperCase()}</h3><div class="flex justify-around mb-4"><div class="text-center"><div class="text-sm text-gray-500">Good Rank</div><div class="text-3xl font-bold text-green-600">#${gI+1}</div></div><div class="text-center"><div class="text-sm text-gray-500">Bad Rank</div><div class="text-3xl font-bold text-red-600">#${bI+1}</div></div></div><div class="border-t pt-4 flex justify-between text-sm"><span class="font-bold text-green-600">+${w.good} Good</span><span class="font-bold text-red-600">-${w.bad} Bad</span></div></div>`
    }
};

// --- MAIN GAME LOGIC ---
const Game = {
    cleanStyles(e) {
        e.style.animation = 'none';
        e.style.background = 'none';
        e.style.webkitTextFillColor = 'initial';
        e.style.textShadow = 'none';
        e.style.transform = 'none';
        e.style.filter = 'none';
        e.style.color = ''
    },
    async init() {
        Accessibility.apply();
        DOM.general.version.textContent = `v${CONFIG.APP_VERSION} | Made by Gilxs in 12,025`;
        DOM.game.buttons.good.onclick = () => this.vote('good');
        DOM.game.buttons.bad.onclick = () => this.vote('bad');
        DOM.game.buttons.notWord.onclick = () => this.vote('notWord');
        DOM.game.dailyBanner.onclick = () => this.activateDailyMode();
        document.getElementById('submitWordButton').onclick = async () => {
            const t = DOM.inputs.newWord.value.trim();
            if (!t || t.includes(' ') || t.length > 45) {
                DOM.inputs.modalMsg.textContent = "Invalid word.";
                return
            }
            const btn = document.getElementById('submitWordButton');
            btn.disabled = true;
            try {
                const r = await API.submitWord(t);
                if (r.status === 201) {
                    State.incrementContributor();
                    DOM.inputs.modalMsg.textContent = "Success! Your new word has been added!";
                    setTimeout(() => {
                        ModalManager.toggle('submission', false);
                        this.refreshData()
                    }, 1000)
                } else {
                    const d = await r.json();
                    DOM.inputs.modalMsg.textContent = d.message || "Error"
                }
            } catch (e) {
                DOM.inputs.modalMsg.textContent = "Network Error"
            }
            btn.disabled = false
        };
        document.getElementById('runComparisonButton').onclick = async () => {
            const w1 = DOM.inputs.wordOne.value.trim(),
                w2 = DOM.inputs.wordTwo.value.trim();
            if (!w1 && !w2) {
                DOM.inputs.compareResults.innerHTML = '<span class="text-red-500">Please enter at least one word.</span>';
                return
            }
            DOM.inputs.compareResults.innerHTML = '<span class="text-gray-500 animate-pulse">Analyzing words...</span>';
            const gd = async w => {
                if (w.includes(' ') || w.length > 45) return { t: w, valid: false, err: 'Invalid word.' };
                const e = State.runtime.allWords.find(x => x.text.toUpperCase() === w.toUpperCase());
                if (e) return { t: e.text, valid: true, exists: true, d: e };
                const r = await API.submitWord(w);
                if (r.status === 201) {
                    State.incrementContributor();
                    return { t: w.toUpperCase(), valid: true, exists: false, isNew: true }
                }
                return { t: w, valid: false, err: 'Could not fetch data.' }
            };
            const res = [];
            if (w1) res.push(await gd(w1));
            if (w2) res.push(await gd(w2));
            if (res.some(r => r.isNew)) this.refreshData(false);
            if (res.some(r => !r.valid)) {
                DOM.inputs.compareResults.innerHTML = res.map(r => !r.valid ? `<p class="text-red-500 mb-2"><strong>${r.t}</strong>: ${r.err}</p>` : '').join('');
                return
            }
            const st = res.map(r => {
                if (r.isNew) return { text: r.t.toUpperCase(), score: 0, good: 0, bad: 0, total: 0, approval: 0, isNew: true };
                const g = r.d.goodVotes || 0,
                    b = r.d.badVotes || 0,
                    t = g + b;
                return {
                    text: r.t.toUpperCase(),
                    score: g - b,
                    good: g,
                    bad: b,
                    total: t,
                    approval: t > 0 ? Math.round((g / t) * 100) : 0,
                    isNew: false
                }
            });
            let h = '';
            if (st.length === 2) {
                const [s1, s2] = st;
                let wi = -1;
                if (s1.score !== s2.score) wi = s1.score > s2.score? 0 : 1;
                h = `<div class="flex flex-col md:flex-row gap-4 w-full justify-center items-stretch">`;
                st.forEach((s, i) => {
                    const iw = i === wi,
                        il = wi !== -1 && !iw,
                        bc = iw ? 'border-yellow-400 bg-yellow-50 shadow-xl scale-105 z-10' : 'border-gray-200 bg-white',
                        oc = il ? 'opacity-70 grayscale-[0.3]' : '';
                    h += `<div class="flex-1 p-4 rounded-xl border-2 ${bc} ${oc} flex flex-col items-center transition-all duration-300">${iw?'<div class="text-2xl mb-2">🏆</div>':'<div class="h-8 mb-2"></div>'}<h3 class="text-xl font-black text-gray-800 mb-1">${s.text}</h3>${iw?'<span class="bg-yellow-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-2">WINNER</span>':''}${s.isNew?'<span class="bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded mb-2">New!</span>':''}<div class="text-3xl font-bold ${s.score>=0?'text-green-600':'text-red-600'} mb-4">${s.score}</div><div class="w-full space-y-2"><div class="flex justify-between text-xs text-gray-500"><span>Approval</span><span>${s.approval}%</span></div><div class="w-full bg-gray-200 rounded-full h-2.5"><div class="bg-blue-500 h-2.5 rounded-full" style="width: ${s.approval}%"></div></div><div class="flex justify-between text-xs pt-1"><span class="text-green-600 font-bold">+${s.good}</span><span class="text-red-600 font-bold">-${s.bad}</span></div></div></div>`;
                    if (i === 0) h += `<div class="flex items-center justify-center font-black text-gray-300 md:px-2">VS</div>`
                });
                h += '</div>'
            } else {
                const s = st[0];
                h = `<div class="p-4 rounded-xl border border-gray-200 bg-white flex flex-col items-center w-full max-w-xs mx-auto"><h3 class="text-xl font-black text-gray-800 mb-2">${s.text}</h3>${s.isNew?'<span class="bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded mb-2">Newly Added!</span>':''}<div class="text-4xl font-bold ${s.score>=0?'text-green-600':'text-red-600'} mb-4">${s.score}</div><div class="w-full space-y-2"><div class="flex justify-between text-xs text-gray-500"><span>Approval Rating</span><span>${s.approval}%</span></div><div class="w-full bg-gray-200 rounded-full h-2.5"><div class="bg-blue-500 h-2.5 rounded-full" style="width: ${s.approval}%"></div></div><div class="flex justify-between text-xs pt-1"><span class="text-green-600 font-bold">+${s.good} Votes</span><span class="text-red-600 font-bold">-${s.bad} Votes</span></div></div></div>`
            }
            DOM.inputs.compareResults.innerHTML = h
        };
        DOM.theme.chooser.onchange = e => ThemeManager.apply(e.target.value, true);
        document.getElementById('clearAllDataButton').onclick = State.clearAll;
        InputHandler.init();
        ThemeManager.init();
        ModalManager.init();
		UIManager.updateProfileDisplay();
        this.checkDailyStatus();
        await this.refreshData()
    },
    checkDailyStatus() {
        const t = new Date().toISOString().split('T')[0];
        const l = State.data.daily.lastDate;
        if (t === l) {
            DOM.game.dailyStatus.textContent = "Come back tomorrow!";
            DOM.game.dailyBanner.style.display = 'none'
        } else {
            DOM.game.dailyStatus.textContent = "Vote Now!";
            DOM.game.dailyBanner.style.display = 'block'
        }
    },
    activateDailyMode() {
        if (State.runtime.isDailyMode) return;
        
        // FIX 1: Use Local Time instead of UTC (toISOString)
        // This ensures the word changes when the user's actual day changes
        const now = new Date();
        const t = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
        
        // Check if we already played today
        if (t === State.data.daily.lastDate) return;

        State.runtime.isDailyMode = true;
        DOM.game.dailyBanner.classList.add('daily-locked-mode');
        
        // Hide standard buttons
        DOM.game.buttons.notWord.style.display = 'none';
        DOM.game.buttons.custom.style.display = 'none';
        
        UIManager.showMessage('Loading Daily Word...');

        // --- NEW SELECTION ALGORITHM (Seeded Index) ---
        // 1. Create a sorted copy of the words. This ensures that even if the API 
        // returns words in a different order, every user gets the same daily word.
        const sortedWords = [...State.runtime.allWords].sort((a, b) => 
            a.text.localeCompare(b.text)
        );

        // 2. Turn the Date String into a numeric seed
        let seed = 0;
        for (let i = 0; i < t.length; i++) {
            seed = ((seed << 5) - seed) + t.charCodeAt(i);
            seed |= 0; // Convert to 32bit integer
        }
        seed = Math.abs(seed);

        // 3. Pick the word using the Modulo operator (%)
        // This guarantees a uniform distribution through the list over time
        const winningWordRef = sortedWords[seed % sortedWords.length];

        if (winningWordRef) {
            // Find the index of the winner in the ORIGINAL State list
            // (We need the original index for the game logic to work)
            const idx = State.runtime.allWords.findIndex(w => w.text === winningWordRef.text);
            
            if (idx !== -1) {
                State.runtime.currentWordIndex = idx;
                UIManager.displayWord(State.runtime.allWords[idx]);
            } else {
                UIManager.showMessage("Error finding word");
            }
        } else {
            UIManager.showMessage("No Daily Word Found");
        }
    },
    disableDailyMode() {
        State.runtime.isDailyMode = false;
        DOM.game.dailyBanner.classList.remove('daily-locked-mode');
        DOM.game.buttons.notWord.style.display = 'block';
        DOM.game.buttons.custom.style.display = 'block';
        this.nextWord()
    },
    async refreshData(u = true) {
        if (u) UIManager.showMessage("Loading...");
        const d = await API.fetchWords();
        if (d) {
            let words = d.filter(w => (w.notWordVotes || 0) < 3);
            
            // Filter for "Zero Votes Only"
            if (State.data.settings.zeroVotesOnly) {
                words = words.filter(w => (w.goodVotes || 0) === 0 && (w.badVotes || 0) === 0);
            }
            
            State.runtime.allWords = words;
            UIManager.updateStats();
            if (u && !State.runtime.isDailyMode) this.nextWord()
        } else UIManager.showMessage("Connection Error", true)
    },
    nextWord() {
        const p = State.runtime.allWords;
        if (!p.length) return;
        const r = Math.random(),
            { CAKE, LLAMA, POTATO, SQUIRREL, MASON } = CONFIG.SPECIAL,
            b = State.data.badges;
        let sp = null;
        if (!b.cake && r < CAKE.prob) sp = CAKE.text;
        else if (!b.llama && r < CAKE.prob + LLAMA.prob) sp = LLAMA.text;
        else if (!b.potato && r < CAKE.prob + LLAMA.prob + POTATO.prob) sp = POTATO.text;
        else if (!b.squirrel && r < CAKE.prob + LLAMA.prob + POTATO.prob + SQUIRREL.prob) sp = SQUIRREL.text;
        else if (!b.bone && r < CAKE.prob + LLAMA.prob + POTATO.prob + SQUIRREL.prob + MASON.prob) sp = MASON.text;
        
        if (sp) {
            const i = p.findIndex(w => w.text.toUpperCase() === sp);
            if (i !== -1 && i !== State.runtime.currentWordIndex) {
                State.runtime.currentWordIndex = i;
                UIManager.displayWord(p[i]);
                return
            }
        }
        let av = p.reduce((acc, w, i) => {
            if (!State.data.seenHistory.includes(i) && i !== State.runtime.currentWordIndex) acc.push({ i, v: (w.goodVotes || 0) + (w.badVotes || 0) });
            return acc
        }, []);
        if (!av.length) av = p.map((w, i) => ({ i, v: (w.goodVotes || 0) + (w.badVotes || 0) })).filter(x => x.i !== State.runtime.currentWordIndex);
        let tw = 0;
        av = av.map(c => {
            let w = 1.0 / (c.v + 1);
            if (p[c.i].text.toUpperCase() === CAKE.text) w *= CONFIG.BOOST_FACTOR;
            tw += w;
            return { i: c.i, w }
        });
        let rnd = Math.random() * tw,
            sel = av[av.length - 1].i;
        for (let it of av) {
            rnd -= it.w;
            if (rnd <= 0) {
                sel = it.i;
                break
            }
        }
        State.runtime.currentWordIndex = sel;
        State.data.seenHistory.push(sel);
        if (State.data.seenHistory.length > CONFIG.HISTORY_SIZE) State.data.seenHistory.shift();
        State.save('seenHistory', State.data.seenHistory);
        UIManager.displayWord(p[sel])
    },
    loadSpecial(t) {
        const i = State.runtime.allWords.findIndex(w => w.text.toUpperCase() === t);
        if (i !== -1) {
            State.runtime.currentWordIndex = i;
            UIManager.displayWord(State.runtime.allWords[i])
        }
    },
    async showDefinition() {
        const w = State.runtime.allWords[State.runtime.currentWordIndex];
        if (!w) return;
        ModalManager.toggle('definition', true);
        document.getElementById('definitionWord').textContent = w.text.toUpperCase();
        const d = document.getElementById('definitionResults');
        d.innerHTML = 'Loading...';
        try {
            const r = await API.define(w.text);
            if (!r.ok) throw 0;
            const j = await r.json();
            let h = '';
            j[0].meanings.forEach(m => {
                h += `<div class="mb-4"><h4 class="text-lg font-bold italic text-indigo-600">${m.partOfSpeech}</h4><ol class="list-decimal list-inside pl-4 mt-2 space-y-1">`;
                m.definitions.forEach(def => {
                    h += `<li>${def.definition}</li>`;
                    if (def.example) h += `<p class="text-sm text-gray-500 pl-4 italic">"${def.example}"</p>`
                });
                h += '</ol></div>'
            });
            d.innerHTML = h
        } catch {
            d.innerHTML = '<p class="text-red-500">Definition not found.</p>'
        }
    },
    handleCooldown() {
        State.runtime.isCoolingDown = true;
        const t = CONFIG.VOTE.COOLDOWN_TIERS;
        let r = t[Math.min(State.runtime.mashLevel, t.length - 1)];
        UIManager.showMessage(`Mashing detected. Wait ${r}s...`, true);
        State.runtime.cooldownTimer = setInterval(() => {
            r--;
            if (r > 0) UIManager.showMessage(`Wait ${r}s...`, true);
            else {
                clearInterval(State.runtime.cooldownTimer);
                State.runtime.isCoolingDown = false;
                State.runtime.streak = 0;
                State.runtime.mashLevel++;
                UIManager.displayWord(State.runtime.allWords[State.runtime.currentWordIndex])
            }
        }, 1000)
    },
    async vote(t, s = false) {
        if (State.runtime.isCoolingDown) return;
        const n = Date.now();
        if (State.runtime.lastVoteTime > 0 && (n - State.runtime.lastVoteTime) > CONFIG.VOTE.STREAK_WINDOW) State.runtime.streak = 1;
        else State.runtime.streak++;
        State.runtime.lastVoteTime = n;
        if (State.runtime.streak > CONFIG.VOTE.MASH_LIMIT) {
            this.handleCooldown();
            return
        }
        const w = State.runtime.allWords[State.runtime.currentWordIndex],
            up = w.text.toUpperCase(),
            { CAKE, LLAMA, POTATO, SQUIRREL, MASON } = CONFIG.SPECIAL;
        UIManager.disableButtons(true);
        const wd = DOM.game.wordDisplay;
        const colors = Accessibility.getColors();
        
        // Handle visual feedback
        if (!s && (t === 'good' || t === 'bad')) {
            this.cleanStyles(wd);
            wd.style.setProperty('--dynamic-swipe-color', t === 'good' ? colors.good : colors.bad);
            wd.classList.add('override-theme-color', 'color-fade');
            wd.style.color = t === 'good' ? colors.good : colors.bad;
            await new Promise(r => setTimeout(r, 50));
            wd.classList.remove('color-fade');
            wd.classList.add(t === 'good' ? 'animate-fly-left' : 'animate-fly-right');
            
            if (t === 'good') SoundManager.playGood();
            else SoundManager.playBad();
        }
        
        // Helper for Special Effects
        const hSpec = (c, k) => {
            State.unlockBadge(k);
            this.cleanStyles(wd);
            wd.className = 'font-extrabold text-gray-900 text-center min-h-[72px]';
            wd.classList.add(c.text === 'LLAMA' ? 'word-fade-llama' : 'word-fade-quick');
            setTimeout(() => {
                wd.className = '';
                wd.style.opacity = '1';
                wd.style.transform = 'none';
                UIManager.showMessage(c.msg, false);
                setTimeout(() => {
                    this.nextWord();
                    this.refreshData(false)
                }, c.dur)
            }, c.fade)
        };
        
        if (up === CAKE.text) { hSpec(CAKE, 'cake'); return }
        if (up === LLAMA.text) { hSpec(LLAMA, 'llama'); return }
        if (up === POTATO.text) { hSpec(POTATO, 'potato'); return }
        if (up === SQUIRREL.text) { hSpec(SQUIRREL, 'squirrel'); return }
        if (up === MASON.text) { hSpec(MASON, 'bone'); return }
        
        try {
            const un = ThemeManager.checkUnlock(up);
            if (un) SoundManager.playUnlock();

            const res = await API.vote(w._id, t);
            if (res.status !== 403 && !res.ok) throw 0;
            w[`${t}Votes`] = (w[`${t}Votes`] || 0) + 1;
            State.incrementVote();
            
            if (State.runtime.isDailyMode) {
                const tod = new Date(),
                    dStr = tod.toISOString().split('T')[0];
                const last = State.data.daily.lastDate;
                let s = State.data.daily.streak;
                if (last) {
                    const yd = new Date();
                    yd.setDate(yd.getDate() - 1);
                    if (last === yd.toISOString().split('T')[0]) s++;
                    else s = 1
                } else s = 1;
                State.save('daily', { streak: s, lastDate: dStr });
                DOM.daily.streakResult.textContent = '🔥 ' + s;
                const { topGood } = UIManager.getRankedLists(0);
                const rank = topGood.findIndex(x => x.text === w.text) + 1;
                DOM.daily.worldRank.textContent = rank > 0 ? '#' + rank : 'Unranked';
                this.checkDailyStatus();
                setTimeout(() => ModalManager.toggle('dailyResult', true), 600)
            }
            let m = '';
            if (un) m = "🎉 New Theme Unlocked!";
            else if (State.data.settings.showPercentages && (t === 'good' || t === 'bad')) {
                const tot = (w.goodVotes || 0) + (w.badVotes || 0),
                    p = Math.round((w[`${t}Votes`] / tot) * 100);
                m = `${t==='good'?'Good':'Bad'} vote! ${p}% agree.`
            }
            if (State.data.settings.showTips) {
                State.save('voteCounterForTips', State.data.voteCounterForTips + 1);
                if (State.data.voteCounterForTips % CONFIG.TIP_COOLDOWN === 0) m = CONFIG.TIPS[Math.floor(Math.random() * CONFIG.TIPS.length)]
            }
            UIManager.showPostVoteMessage(m);
            UIManager.updateStats();
            setTimeout(() => {
                wd.classList.remove('animate-fly-left', 'animate-fly-right', 'swipe-good-color', 'swipe-bad-color', 'override-theme-color');
                wd.style.transform = '';
                wd.style.opacity = '1';
                wd.style.color = '';
                if (!State.runtime.isDailyMode) {
                    this.nextWord();
                    this.refreshData(false)
                }
            }, (t === 'good' || t === 'bad') ? 600 : 0)
        } catch (e) {
            UIManager.showMessage("Vote Failed", true);
            wd.classList.remove('animate-fly-left', 'animate-fly-right', 'swipe-good-color', 'swipe-bad-color', 'override-theme-color');
            UIManager.disableButtons(false)
        }
    }
};

// --- TOUCH INPUT HANDLER ---
const InputHandler = {
    sX: 0,
    sY: 0,
    drag: false,
    scroll: false,
    raf: null,
    init() {
        const c = DOM.game.card,
            wd = DOM.game.wordDisplay;
        c.addEventListener('touchstart', e => {
            if (State.runtime.isCoolingDown || DOM.game.buttons.good.disabled) return;
            if (e.target.closest('button, input, select')) return;
            this.sX = e.touches[0].clientX;
            this.sY = e.touches[0].clientY;
            this.drag = false;
            this.scroll = false;
            wd.style.transition = 'none';
            wd.style.animation = 'none'
        }, { passive: false });
        c.addEventListener('touchmove', e => {
            if (State.runtime.isCoolingDown || DOM.game.buttons.good.disabled) return;
            const x = e.touches[0].clientX,
                y = e.touches[0].clientY,
                dX = x - this.sX,
                dY = y - this.sY;
            if (!this.drag && !this.scroll) {
                if (Math.abs(dY) > Math.abs(dX)) {
                    this.scroll = true;
                    return
                }
                this.drag = true;
                Game.cleanStyles(wd);
                wd.style.background = 'none';
                wd.style.webkitTextFillColor = 'initial'
            }
            if (this.scroll) return;
            if (this.drag) {
                e.preventDefault();
                if (this.raf) cancelAnimationFrame(this.raf);
                this.raf = requestAnimationFrame(() => {
                    wd.style.transform = `translate(${dX}px, ${dY*.8}px) rotate(${dX*.05}deg)`;
                    const colors = Accessibility.getColors();
                    const col = dX < 0 ? colors.good : colors.bad;
                    const alpha = Math.min(Math.abs(dX) / 150, 1);
                    wd.style.setProperty('--dynamic-swipe-color', Utils.hexToRgba(col, alpha));
                    if (State.data.settings.colorblindMode) {
                        const rgb = dX < 0 ? '59, 130, 246' : '249, 115, 22';
                        wd.style.setProperty('--dynamic-swipe-color', `rgba(${rgb}, ${alpha})`)
                    }
                    wd.classList.add('override-theme-color')
                })
            }
        }, { passive: false });
        c.addEventListener('touchend', e => {
            if (!this.drag) return;
            const dX = e.changedTouches[0].clientX - this.sX;
            wd.classList.remove('override-theme-color');
            if (this.raf) cancelAnimationFrame(this.raf);
            
            if (Math.abs(dX) > CONFIG.VOTE.SWIPE_THRESHOLD) {
                let l = dX < 0;
                
                // INVERT if Mirror Mode is on so controls match visual buttons
                if (State.data.settings.mirrorMode) l = !l; 

                wd.style.transition = 'transform .4s ease-out, opacity .4s ease-out';
                // We also flip the exit animation direction so it looks natural
                const exitX = l ? -window.innerWidth : window.innerWidth;
                
                // If mirrored, we visually flip the rotation too
                const rot = l ? -20 : 20; 
                
                wd.style.transform = `translate(${exitX}px, 0px) rotate(${rot}deg)`;
                wd.style.opacity = '0';
                
                const colors = Accessibility.getColors();
                wd.style.color = l ? colors.good : colors.bad;
                
                SoundManager.playWhoosh();
                Game.vote(l ? 'good' : 'bad', true)
            } else {
                // ... existing reset logic ...
                wd.classList.add('word-reset');
                wd.style.transform = 'translate(0,0) rotate(0)';
                wd.style.color = '';
                setTimeout(() => {
                    wd.classList.remove('word-reset');
                    UIManager.displayWord(State.runtime.allWords[State.runtime.currentWordIndex])
                }, 300)
            }
            this.drag = false;
            this.scroll = false
        }, false)
    }
};

// --- INITIALIZATION ---
window.onload = Game.init.bind(Game);
