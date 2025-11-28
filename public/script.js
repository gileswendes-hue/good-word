const CONFIG = {
    API_BASE_URL: '/api/words',
    APP_VERSION: '5.9.9', // Fixed Syntax & Merged Features

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

// --- MOSQUITO LOGIC ---
const MosquitoManager = {
    el: null, svg: null, path: null, checkInterval: null,
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
            this.speed = 0.6; 
        }, 2000);
    },

    loop() {
        if (!document.body.contains(this.el)) return;
        if (this.state === 'flying' || this.state === 'leaving') {
            this.turnCycle += 0.05;
            let turnSpeed = Math.cos(this.turnCycle) * 0.03;
            if (this.state === 'flying') {
                if (this.loopTimer > 0) {
                    turnSpeed = 0.25; 
                    this.loopTimer--;
                } else if (Math.random() < 0.005) {
                    this.loopTimer = 60;
                }
            }
            this.angle += turnSpeed;
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
            if (this.state === 'flying') {
                if (this.x > 110) { this.x = -10; this.trailPoints = []; }
                else if (this.x < -10) { this.x = 110; this.trailPoints = []; }
            }
            if (this.y < 5 || this.y > 95) {
                this.angle = -this.angle; 
                this.y = Math.max(5, Math.min(95, this.y));
            }
            this.el.style.left = this.x + '%';
            this.el.style.top = this.y + '%';
            const facingRight = Math.cos(this.angle) > 0;
            this.el.style.transform = facingRight ? 'scaleX(-1)' : 'scaleX(1)';
            const pxX = (this.x / 100) * window.innerWidth;
            const pxY = (this.y / 100) * window.innerHeight;
            if (pxX > 0 && pxX < window.innerWidth) this.trailPoints.push({x: pxX, y: pxY});
            if (this.trailPoints.length > this.MAX_TRAIL) this.trailPoints.shift();
            if (this.trailPoints.length > 1) {
                const d = `M ${this.trailPoints.map(p => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L ')}`;
                this.path.setAttribute('d', d);
            }
            const distRight = window.innerWidth - pxX;
            const distTop = pxY;
            if (this.state === 'flying' && (distRight + distTop) < 280) {
                this.state = 'stuck';
                SoundManager.stopBuzz(); 
                UIManager.showPostVoteMessage("It's stuck in the web!");
            }
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
        const x = e.gamma || 0; 
        const y = e.beta || 0;
        const moveX = Math.min(Math.max(x, -25), 25);
        const moveY = Math.min(Math.max(y - 45, -25), 25);
        DOM.game.wordFrame.style.transition = 'transform 0.1s ease-out';
        DOM.game.wordFrame.style.transform = `translate3d(${moveX * 1.5}px, ${moveY * 1.5}px, 0)`;
    },
    start() {
        if (this.active) return;
        if (State.data.settings.enableTilt && State.data.currentTheme === 'default') {
            this.active = true;
            window.addEventListener('deviceorientation', this.handle, true);
        }
    },
    stop() {
        if (!this.active) return;
        this.active = false;
        window.removeEventListener('deviceorientation', this.handle, true);
        DOM.game.wordFrame.style.transform = ''; 
    },
    refresh() {
        this.stop();
        this.start();
    }
};

// --- PHYSICS ENGINE (BALL PIT) ---
const Physics = {
    balls: [],
    gx: 0,
    gy: 0.8,
    handleOrientation(e) {
        const x = e.gamma || 0,
            y = e.beta || 0;
        const tx = Math.min(Math.max(x / 4, -1), 1);
        const ty = Math.min(Math.max(y / 4, -1), 1);
        Physics.gx += (tx - Physics.gx) * 0.1;
        Physics.gy += (ty - Physics.gy) * 0.1
    },
    run() {
        const W = window.innerWidth,
            H = window.innerHeight;
        const cylW = Math.min(W, 500),
            minX = (W - cylW) / 2,
            maxX = minX + cylW;
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
                    const b1 = Physics.balls[i],
                        b2 = Physics.balls[j];
                    const dx = (b2.x + b2.r) - (b1.x + b1.r),
                        dy = (b2.y + b2.r) - (b1.y + b1.r);
                    const dist = Math.sqrt(dx * dx + dy * dy),
                        minDist = b1.r + b2.r + 0.5;
                    if (dist < minDist && dist > 0) {
                        const angle = Math.atan2(dy, dx),
                            tx = (Math.cos(angle) * (minDist - dist)) / 2,
                            ty = (Math.sin(angle) * (minDist - dist)) / 2;
                        b1.x -= tx;
                        b1.y -= ty;
                        b2.x += tx;
                        b2.y += ty;
                        if (!b1.drag && !b2.drag) {
                            const nx = dx / dist,
                                ny = dy / dist;
                            const p = 2 * (b1.vx * nx + b1.vy * ny - b2.vx * nx - b2.vy * ny) / 2;
                            b1.vx -= p * nx * 0.15;
                            b1.vy -= p * ny * 0.15;
                            b2.vx += p * nx * 0.15;
                            b2.vy += p * ny * 0.15
                        }
                    }
                }
            }
        }
        Physics.balls.forEach(b => {
            b.el.style.transform = `translate(${b.x}px,${b.y}px)`;
            if (b.bubble) {
                b.bubble.style.transform = `translate(${b.x+b.r}px,${b.y-20}px) translate(-50%,-100%)`
            }
        });
        Effects.ballLoop = requestAnimationFrame(Physics.run)
    }
};

// --- API LAYER ---
const API = {
    async fetchWords() {
        try {
            const r = await fetch(CONFIG.API_BASE_URL);
            if (!r.ok) throw 0;
            return await r.json()
        } catch (e) {
            return null
        }
    },
    async vote(id, type) {
        return fetch(`${CONFIG.API_BASE_URL}/${id}/vote`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                voteType: type,
                userId: State.data.userId
            })
        })
    },
    async submitWord(text) {
        return fetch(CONFIG.API_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        })
    },
    async define(w) {
        return fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${w.toLowerCase()}`)
    }
};

// --- THEME MANAGER ---
const ThemeManager = {
    wordMap: {},
    init() {
        Object.entries(CONFIG.THEME_SECRETS).forEach(([k, v]) => {
            try {
                atob(v).split('|').forEach(w => this.wordMap[w] = k)
            } catch {}
        });
        this.populateChooser();
        this.apply(State.data.currentTheme)
    },
    populateChooser() {
        const u = State.data.unlockedThemes,
            a = [...new Set(u)].sort(),
            c = DOM.theme.chooser;
        c.innerHTML = '<option value="default">Default</option>';
        a.forEach(t => {
            const o = document.createElement('option');
            o.value = t;
            o.textContent = t === 'ballpit' ? 'Ball Pit' : t.charAt(0).toUpperCase() + t.slice(1);
            c.appendChild(o)
        });
        c.value = State.data.currentTheme
    },
    apply(t, m = false) {
        if (m) State.save('manualTheme', true);
        document.body.className = document.body.className.split(' ').filter(c => !c.startsWith('theme-')).join(' ');
        document.body.classList.add(`theme-${t}`);
        State.save('currentTheme', t);
        
        const e = DOM.theme.effects;
        e.snow.classList.toggle('hidden', t !== 'winter');
        e.bubble.classList.toggle('hidden', t !== 'submarine');
        e.fire.classList.toggle('hidden', t !== 'fire');
        e.summer.classList.toggle('hidden', t !== 'summer');
        e.plymouth.classList.toggle('hidden', t !== 'plymouth');
        e.ballpit.classList.toggle('hidden', t !== 'ballpit');
        e.space.classList.toggle('hidden', t !== 'space');
        
        if (t === 'winter') Effects.snow();
        else e.snow.innerHTML = '';
        
        if (t === 'submarine') Effects.bubbles(true);
        else Effects.bubbles(false); 
        
        if (t === 'fire') Effects.fire();
        else e.fire.innerHTML = '';
        if (t === 'summer') Effects.summer();
        else e.summer.innerHTML = '';
        if (t === 'plymouth') Effects.plymouth(true);
        else {
            e.plymouth.innerHTML = '';
            Effects.plymouth(false)
        }
        if (t === 'ballpit') Effects.ballpit(true);
        else Effects.ballpit(false);
        if (t === 'space') Effects.space(true);
        else Effects.space(false);
        Effects.halloween(t === 'halloween');
        
        const cards = document.querySelectorAll('.card, .ranking-card'),
            isR = t === 'rainbow';
        [DOM.game.card, ...cards].forEach(el => {
            if (!el) return;
            if (isR) {
                el.classList.add('thin-rainbow-frame');
                el.classList.remove('card')
            } else {
                el.classList.remove('thin-rainbow-frame');
                el.classList.add('card')
            }
        });
        const d = document.getElementById('card-snow-drift');
        if (d) d.style.display = t !== 'winter' ? 'none' : 'block';
        if (State.runtime.allWords.length > 0) UIManager.displayWord(State.runtime.allWords[State.runtime.currentWordIndex]);
        Accessibility.apply();
        TiltManager.refresh();
    },
    checkUnlock(w) {
        const t = this.wordMap[w];
        if (t && !State.data.unlockedThemes.includes(t)) {
            State.data.unlockedThemes.push(t);
            State.save('unlockedThemes', State.data.unlockedThemes);
            this.populateChooser();
            if (!State.data.manualTheme) this.apply(t);
            return true
        }
        return false
    }
};

// --- VISUAL EFFECTS ---
const Effects = {
    spiderTimeout: null,
    webRaf: null,
    ballLoop: null,
    fishTimeout: null,
    spaceRareTimeout: null,
    
    plymouth(a) {
        const c = DOM.theme.effects.plymouth;
        if (!a) { c.innerHTML = ''; return }
        c.innerHTML = '';
        for (let i = 0; i < 100; i++) {
            const s = document.createElement('div');
            s.className = 'star-particle';
            const z = Math.random() * 2 + 1;
            s.style.width = s.style.height = `${z}px`;
            s.style.left = `${Math.random()*100}vw`;
            s.style.top = `${Math.random()*60}vh`;
            s.style.animationDuration = `${Math.random()*3+1}s`;
            s.style.animationDelay = `${Math.random()*2}s`;
            c.appendChild(s)
        }
    },
    fire() {
        const c = DOM.theme.effects.fire;
        c.innerHTML = '';
        for (let i = 0; i < 80; i++) {
            const p = document.createElement('div');
            p.className = 'fire-particle';
            p.style.animationDuration = `${Math.random()*1.5+0.5}s`;
            p.style.animationDelay = `${Math.random()}s`;
            p.style.left = `calc(10% + (80% * ${Math.random()}))`;
            const size = Math.random() * 3 + 2;
            p.style.width = p.style.height = `${size}em`;
            p.style.setProperty('--sway', `${(Math.random()-.5)*20}px`);
            c.appendChild(p)
        }
        for (let i = 0; i < 15; i++) {
            const s = document.createElement('div');
            s.className = 'smoke-particle';
            s.style.animationDelay = `${Math.random()*3}s`;
            s.style.left = `${Math.random()*90+5}%`;
            s.style.setProperty('--sway', `${(Math.random()-.5)*150}px`);
            c.appendChild(s)
        }
    },
    bubbles(active) {
        const c = DOM.theme.effects.bubble;
        if (this.fishTimeout) clearTimeout(this.fishTimeout);
        if (!active) { c.innerHTML = ''; return; }
        c.innerHTML = '';
        const cl = [10, 30, 70, 90];
        for (let i = 0; i < 40; i++) {
            const p = document.createElement('div');
            p.className = 'bubble-particle';
            const s = Math.random() * 30 + 10;
            p.style.width = p.style.height = `${s}px`;
            p.style.left = `${cl[Math.floor(Math.random()*cl.length)]+(Math.random()-.5)*20}%`;
            p.style.animationDuration = `${Math.random()*10+10}s`;
            p.style.animationDelay = `-${Math.random()*15}s`;
            c.appendChild(p);
        }
        const spawnFish = () => {
            if (!DOM.theme.effects.bubble.checkVisibility()) return;
            const fishTypes = ['🐟', '🐠', '🐡', '🦈'];
            const fishEmoji = fishTypes[Math.floor(Math.random() * fishTypes.length)];
            const wrap = document.createElement('div');
            wrap.className = 'submarine-fish-wrap';
            const inner = document.createElement('div');
            inner.className = 'submarine-fish-inner';
            inner.textContent = fishEmoji;
            wrap.appendChild(inner);
            const startLeft = Math.random() > 0.5; 
            const duration = Math.random() * 15 + 10;
            if (startLeft) inner.style.transform = "scaleX(-1)"; 
            wrap.style.transition = `left ${duration}s linear`;
            wrap.style.top = Math.random() * 80 + 10 + 'vh'; 
            wrap.style.left = startLeft ? '-100px' : '110vw';
            wrap.onclick = (e) => {
                e.stopPropagation();
                UIManager.showPostVoteMessage("Blub blub! 🫧");
                wrap.style.opacity = '0';
                setTimeout(() => wrap.remove(), 200);
            };
            c.appendChild(wrap);
            requestAnimationFrame(() => { wrap.style.left = startLeft ? '110vw' : '-100px'; });
            setTimeout(() => { if(wrap.parentNode) wrap.remove(); }, duration * 1000);
            this.fishTimeout = setTimeout(spawnFish, Math.random() * 7000 + 3000);
        };
        spawnFish();
    },
    snow() {
        const c = DOM.theme.effects.snow;
        c.innerHTML = '';
        for (let i = 0; i < 60; i++) {
            const f = document.createElement('div');
            f.className = 'snow-particle';
            const s = Math.random() * 12 + 5;
            f.style.width = f.style.height = `${s}px`;
            f.style.opacity = Math.random() * .6 + .3;
            if (s < 4) f.style.filter = `blur(${Math.random()*2}px)`;
            f.style.left = `${Math.random()*100}vw`;
            f.style.setProperty('--sway', `${(Math.random()-.5)*100}px`);
            f.style.animationDuration = `${Math.random()*15+8}s`;
            f.style.animationDelay = `-${Math.random()*15}s`;
            c.appendChild(f)
        }
    },
    summer() {
        const c = DOM.theme.effects.summer;
        c.innerHTML = '';
        const g = document.createElement('div');
        g.className = 'summer-grass';
        c.appendChild(g);
        for (let i = 0; i < 8; i++) {
            const d = document.createElement('div');
            d.className = `summer-cloud v${Math.floor(Math.random()*3)+1}`;
            const w = Math.random() * 100 + 100;
            d.style.width = `${w}px`;
            d.style.height = `${w*.35}px`;
            d.style.top = `${Math.random()*60}%`;
            d.style.animationDuration = `${Math.random()*60+60}s`;
            d.style.animationDelay = `-${Math.random()*100}s`;
            c.appendChild(d)
        }
    },
    halloween(active) {
        if (this.spiderTimeout) clearTimeout(this.spiderTimeout);
        if (this.webRaf) cancelAnimationFrame(this.webRaf);
        if (!active) {
            const old = document.getElementById('spider-wrap');
            if (old) old.remove();
            const oldWeb = document.getElementById('spider-web-corner');
            if (oldWeb) oldWeb.remove();
            return
        }
        if (!document.getElementById('spider-wrap')) {
            const wrap = document.createElement('div');
            wrap.id = 'spider-wrap';
            wrap.style.left = (Math.random() * 80 + 10) + '%';
            const scale = (Math.random() * .6 + .6).toFixed(2);
            wrap.innerHTML = `<div id="spider-anchor" style="transform: scale(${scale})"><div id="spider-thread"></div><div id="spider-body">🕷️<div id="spider-bubble"></div></div></div>`;
            document.body.appendChild(wrap);
            const thread = wrap.querySelector('#spider-thread'),
                body = wrap.querySelector('#spider-body'),
                bub = wrap.querySelector('#spider-bubble');
            const runDrop = () => {
                const phrases = ['ouch!', 'hey frend!', "I wouldn't hurt a fly!", "I'm more scared of you...", "I'm a web dev!", "just hanging", "fangs a lot!"];
                const txt = phrases[Math.floor(Math.random() * phrases.length)];
                bub.innerText = txt;
                const dist = Math.random() * 40 + 20;
                void thread.offsetWidth;
                thread.style.height = (dist + 20) + 'vh';
                body.onclick = () => {
                    State.unlockBadge('spider');
                    bub.style.opacity = '1';
                    setTimeout(() => bub.style.opacity = '0', 2000)
                };
                this.spiderTimeout = setTimeout(() => {
                    thread.style.height = '0';
                    setTimeout(() => {
                        if (wrap.parentNode) wrap.style.left = (Math.random() * 80 + 10) + '%';
                        this.spiderTimeout = setTimeout(runDrop, Math.random() * 15000 + 10000)
                    }, 20000)
                }, 20000 + (Math.random() * 3000 + 5000))
            };
            setTimeout(runDrop, Math.random() * 5000 + 2000)
        }
        if (!document.getElementById('spider-web-corner')) {
            const web = document.createElement('div');
            web.id = 'spider-web-corner';
            web.innerHTML = `<svg id="web-svg" viewBox="0 0 300 300" style="width:300px;height:300px;position:fixed;top:0;right:0;z-index:55;pointer-events:none;opacity:0.7;filter:drop-shadow(1px 1px 2px rgba(0,0,0,0.5))"></svg>`;
            document.body.appendChild(web);
            const svg = document.getElementById('web-svg');
            const cx = 300, cy = 0;
            const baseAnchors = [{ x: 0, y: 0 }, { x: 60, y: 100 }, { x: 140, y: 200 }, { x: 220, y: 270 }, { x: 300, y: 300 }];
            const animateWeb = () => {
                const time = Date.now();
                let pathStr = '';
                const curAnchors = baseAnchors.map((a, i) => {
                    if (i === 0 || i === baseAnchors.length - 1) return a;
                    const sway = Math.sin((time / 2000) + i) * 5;
                    return { x: a.x + sway, y: a.y + sway }
                });
                curAnchors.forEach(p => {
                    pathStr += `<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="rgba(255,255,255,0.4)" stroke-width="2.5"/>`
                });
                const levels = 7;
                for (let i = 1; i <= levels; i++) {
                    const t = i / levels;
                    let d = '';
                    for (let j = 0; j < curAnchors.length; j++) {
                        const ax = cx + (curAnchors[j].x - cx) * t,
                            ay = cy + (curAnchors[j].y - cy) * t;
                        if (j === 0) d += `M ${ax} ${ay}`;
                        else {
                            const px = cx + (curAnchors[j - 1].x - cx) * t,
                                py = cy + (curAnchors[j - 1].y - cy) * t;
                            const midX = (px + ax) / 2,
                                midY = (py + ay) / 2,
                                sag = 15 * t * (1 - t * 0.5),
                                dx = midX - cx,
                                dy = midY - cy,
                                len = Math.sqrt(dx * dx + dy * dy),
                                nx = dx / len,
                                ny = dy / len,
                                qx = midX - nx * sag,
                                qy = midY - ny * sag;
                            d += ` Q ${qx} ${qy} ${ax} ${ay}`
                        }
                    }
                    pathStr += `<path d="${d}" stroke="rgba(255,255,255,0.3)" stroke-width="2.5" fill="none"/>`
                }
                svg.innerHTML = pathStr;
                this.webRaf = requestAnimationFrame(animateWeb)
            };
            animateWeb()
        }
    },
    ballpit(active) {
        const c = DOM.theme.effects.ballpit;
        if (this.ballLoop) cancelAnimationFrame(this.ballLoop);
        if (!active) { c.innerHTML = ''; window.removeEventListener('deviceorientation', Physics.handleOrientation); return }
        window.addEventListener('deviceorientation', Physics.handleOrientation);
        c.innerHTML = '';
        Physics.balls = [];
        const colors = ['#ef4444', '#3b82f6', '#eab308', '#22c55e', '#a855f7'];
        const rareItems = ['💩', '🐧', '🦂', '🍄', '💉', '💎'];
        const rareMap = { '💩': 'poop', '🐧': 'penguin', '🦂': 'scorpion', '🍄': 'mushroom', '💉': 'needle', '💎': 'diamond' };
        const r = 30;
        const W = window.innerWidth, H = window.innerHeight;
        const cylW = Math.min(W, 500);
        const minX = (W - cylW) / 2, maxX = minX + cylW - r * 2;
        const showThought = (ballObj, cont) => {
            const b = document.createElement('div');
            b.className = 'thought-bubble';
            b.innerHTML = cont || "Because we're grown-ups now, and it's our turn to decide what that means.";
            b.innerHTML += '<div class="dot-1"></div><div class="dot-2"></div>';
            document.body.appendChild(b);
            ballObj.bubble = b;
            requestAnimationFrame(() => b.style.opacity = '1');
            setTimeout(() => {
                b.style.opacity = '0';
                setTimeout(() => { b.remove(); ballObj.bubble = null }, 300)
            }, 4000)
        };
        const addBall = (type) => {
            const el = document.createElement('div');
            el.className = 'ball-particle';
            el.style.width = el.style.height = `${r*2}px`;
            let content = '';
            if (type === 'germ') {
                content = '🦠';
                el.title = "Click me!";
                el.classList.add('interactable-ball');
                el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
            } else if (type === 'rare') {
                content = rareItems[Math.floor(Math.random() * rareItems.length)];
                el.classList.add('interactable-ball');
                el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
            } else {
                el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
            }
            if (content) el.innerHTML = `<span class="ball-content">${content}</span>`;
            c.appendChild(el);
            const b = { el, x: minX + Math.random() * (maxX - minX), y: Math.random() * (H / 2), vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10, r, drag: false, lastX: 0, lastY: 0, bubble: null, type, content };
            Physics.balls.push(b);
            let sx = 0, sy = 0;
            el.onmousedown = el.ontouchstart = (e) => {
                b.drag = true;
                b.vx = b.vy = 0;
                const p = e.touches ? e.touches[0] : e;
                b.lastX = p.clientX;
                b.lastY = p.clientY;
                sx = p.clientX;
                sy = p.clientY;
                e.preventDefault()
            };
            el.onmouseup = el.ontouchend = (e) => {
                b.drag = false;
                const p = e.changedTouches ? e.changedTouches[0] : e;
                if ((type === 'germ' || type === 'rare') && Math.abs(p.clientX - sx) < 50 && Math.abs(p.clientY - sy) < 50) {
                    if (type === 'germ') State.unlockBadge('germ');
                    if (type === 'rare' && rareMap[content]) State.unlockBadge(rareMap[content]);
                    showThought(b, type === 'rare' ? `<span style="font-size:2em">${content}</span>` : null)
                }
            }
        };
        for (let i = 0; i < 80; i++) addBall(Math.random() < 0.005 ? 'rare' : 'normal');
        for (let i = 0; i < 5; i++) addBall('germ');
        window.onmouseup = window.ontouchend = () => { Physics.balls.forEach(b => b.drag = false) };
        window.onmousemove = window.ontouchmove = (e) => {
            const p = e.touches ? e.touches[0] : e;
            Physics.balls.forEach(b => {
                if (b.drag) {
                    b.vx = (p.clientX - b.lastX) * 0.5;
                    b.vy = (p.clientY - b.lastY) * 0.5;
                    b.x = p.clientX - b.r;
                    b.y = p.clientY - b.r;
                    b.lastX = p.clientX;
                    b.lastY = p.clientY
                }
            })
        };
        Physics.run()
    },
    space(active) {
        const c = DOM.theme.effects.space;
        if (this.spaceRareTimeout) clearTimeout(this.spaceRareTimeout);
        if (!active) { c.innerHTML = ''; return; }
        c.innerHTML = '';
        for (let i = 0; i < 150; i++) {
            const s = document.createElement('div');
            s.className = 'space-star';
            const size = Math.random() * 2 + 1;
            s.style.width = s.style.height = `${size}px`;
            s.style.left = `${Math.random() * 100}vw`;
            s.style.top = `${Math.random() * 100}vh`;
            s.style.opacity = Math.random() * 0.8 + 0.2;
            s.style.animationDelay = `${Math.random() * 3}s`;
            c.appendChild(s);
        }
        const createPlanet = (size, x, y, colors, hasRing) => {
            const wrap = document.createElement('div');
            wrap.className = 'space-planet-wrap';
            wrap.style.width = wrap.style.height = `${size}px`;
            wrap.style.left = x;
            wrap.style.top = y;
            wrap.style.animationDuration = `${Math.random() * 10 + 15}s`;
            const p = document.createElement('div');
            p.className = 'space-planet';
            p.style.background = `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`;
            wrap.appendChild(p);
            if (hasRing) {
                const r = document.createElement('div');
                r.className = 'space-ring';
                wrap.appendChild(r);
            }
            c.appendChild(wrap);
        };
        createPlanet(120, '10%', '15%', ['#ff6b6b', '#7209b7'], true);
        createPlanet(80, '85%', '60%', ['#4cc9f0', '#4361ee'], false);
        createPlanet(40, '20%', '80%', ['#fee440', '#f15bb5'], false);
        createPlanet(200, '-5%', '60%', ['#1b1b1b', '#3a3a3a'], true);
        const spawnRock = () => {
            if (!DOM.theme.effects.space.checkVisibility()) return; 
            const wrap = document.createElement('div');
            wrap.className = 'space-rock-wrap';
            const inner = document.createElement('div');
            inner.textContent = '🤘';
            inner.className = 'space-rock-inner';
            wrap.appendChild(inner);
            const startLeft = Math.random() > 0.5;
            const duration = Math.random() * 10 + 10; 
            wrap.style.transition = `left ${duration}s linear, top ${duration}s ease-in-out`;
            wrap.style.top = Math.random() * 80 + 10 + 'vh'; 
            wrap.style.left = startLeft ? '-150px' : '110vw'; 
            wrap.onclick = (e) => {
                e.stopPropagation(); e.preventDefault();
                State.unlockBadge('rock');
                UIManager.showPostVoteMessage("SPACE ROCK! 🤘");
                wrap.style.display = 'none'; 
            };
            c.appendChild(wrap);
            requestAnimationFrame(() => {
                wrap.style.left = startLeft ? '110vw' : '-150px';
                wrap.style.top = Math.random() * 80 + 10 + 'vh'; 
            });
            setTimeout(() => { if(wrap.parentNode) wrap.remove(); }, duration * 1000);
            this.spaceRareTimeout = setTimeout(spawnRock, Math.random() * 12000 + 8000);
        };
        this.spaceRareTimeout = setTimeout(spawnRock, 3000);
    }
};

// --- MODAL MANAGER (FIXED) ---
const ModalManager = {
    toggle(id, show) {
        const e = DOM.modals[id];
        e.classList.toggle('hidden', !show);
        e.classList.toggle('flex', show)
    },
    init() {
        document.getElementById('showSettingsButton').onclick = () => {
            // Update UI
            DOM.inputs.settings.tips.checked = State.data.settings.showTips;
            DOM.inputs.settings.percentages.checked = State.data.settings.showPercentages;
            DOM.inputs.settings.colorblind.checked = State.data.settings.colorblindMode;
            DOM.inputs.settings.largeText.checked = State.data.settings.largeText;
            if (DOM.inputs.settings.tilt) DOM.inputs.settings.tilt.checked = State.data.settings.enableTilt;
            if (DOM.inputs.settings.mirror) DOM.inputs.settings.mirror.checked = State.data.settings.mirrorMode;

            // Inject Mute
            if (!document.getElementById('toggleMute')) {
                const container = DOM.inputs.settings.mirror ? (DOM.inputs.settings.mirror.closest('.space-y-4') || DOM.inputs.settings.mirror.parentElement.parentElement) : document.getElementById('settingsModalContainer').querySelector('.space-y-4');
                if (container) {
                    const div = document.createElement('div');
                    div.className = "flex items-center justify-between";
                    div.innerHTML = `<label for="toggleMute" class="text-lg font-medium text-gray-700">Mute All Sounds</label><input type="checkbox" id="toggleMute" class="h-6 w-6 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">`;
                    container.appendChild(div);
                    DOM.inputs.settings.mute = document.getElementById('toggleMute');
                }
            }
            if (DOM.inputs.settings.mute) {
                DOM.inputs.settings.mute.checked = State.data.settings.muteSounds;
                DOM.inputs.settings.mute.onchange = e => {
                    State.save('settings', { ...State.data.settings, muteSounds: e.target.checked });
                    SoundManager.updateMute();
                };
            }

            // Inject Zero Votes
            if (!document.getElementById('toggleZeroVotes')) {
                const container = DOM.inputs.settings.mirror ? (DOM.inputs.settings.mirror.closest('.space-y-4') || DOM.inputs.settings.mirror.parentElement.parentElement) : document.getElementById('settingsModalContainer').querySelector('.space-y-4');
                if (container) {
                    const div = document.createElement('div');
                    div.className = "flex items-center justify-between";
                    div.innerHTML = `<label for="toggleZeroVotes" class="text-lg font-medium text-gray-700">Only 0/0 Words</label><input type="checkbox" id="toggleZeroVotes" class="h-6 w-6 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">`;
                    container.appendChild(div);
                    DOM.inputs.settings.zeroVotes = document.getElementById('toggleZeroVotes');
                }
            }
            if (DOM.inputs.settings.zeroVotes) {
                DOM.inputs.settings.zeroVotes.checked = State.data.settings.zeroVotesOnly;
                DOM.inputs.settings.zeroVotes.onchange = e => {
                    State.save('settings', { ...State.data.settings, zeroVotesOnly: e.target.checked });
                    Game.refreshData(true);
                };
            }

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
		if (DOM.inputs.settings.tilt) {
            DOM.inputs.settings.tilt.onchange = e => {
                const v = e.target.checked;
                State.save('settings', { ...State.data.settings, enableTilt: v });
                TiltManager.refresh();
            };
        }

        if (DOM.inputs.settings.mirror) {
            DOM.inputs.settings.mirror.onchange = e => {
                const v = e.target.checked;
                State.save('settings', { ...State.data.settings, mirrorMode: v });
                Accessibility.apply();
            };
        }
        if (DOM.inputs.settings.tilt) {
            DOM.inputs.settings.tilt.onchange = e => {
                State.save('settings', { ...State.data.settings, enableTilt: e.target.checked });
                TiltManager.refresh(); 
            };
        }
        if (DOM.inputs.settings.mirror) {
            DOM.inputs.settings.mirror.onchange = e => {
                State.save('settings', { ...State.data.settings, mirrorMode: e.target.checked });
                Accessibility.apply();
            };
        }

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
        MosquitoManager.startMonitoring();
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
        const now = new Date();
        const t = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
        if (t === State.data.daily.lastDate) return;
        State.runtime.isDailyMode = true;
        DOM.game.dailyBanner.classList.add('daily-locked-mode');
        DOM.game.buttons.notWord.style.display = 'none';
        DOM.game.buttons.custom.style.display = 'none';
        UIManager.showMessage('Loading Daily Word...');
        const sortedWords = [...State.runtime.allWords].sort((a, b) => a.text.localeCompare(b.text));
        let seed = 0;
        for (let i = 0; i < t.length; i++) {
            seed = ((seed << 5) - seed) + t.charCodeAt(i);
            seed |= 0;
        }
        seed = Math.abs(seed);
        const winningWordRef = sortedWords[seed % sortedWords.length];
        if (winningWordRef) {
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
