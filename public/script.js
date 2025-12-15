(function() {
const CONFIG = {
    API_BASE_URL: '/api/words',
	SCORE_API_URL: '/api/scores',
    APP_VERSION: '5.70', 
	KIDS_LIST_FILE: 'kids_words.txt',

  
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
    HISTORY_SIZE: 500,
    VOTE: {
        MASH_LIMIT: 8,
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
};

let DOM = {}; // Changed to let

const loadDOM = () => ({
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
        btnShow: document.getElementById('headerStatsCard'),
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
            mute: null, 
            zeroVotes: null
        }
    },
    general: {
        version: document.querySelector('.version-indicator')
    }
});

const safeParse = (key, fallback) => {
    try {
        const item = localStorage.getItem(key);
        // If data is corrupt (e.g. "[object Object]"), return fallback
        if (item === "[object Object]") return fallback;
        return item ? JSON.parse(item) : fallback;
    } catch (e) {
        console.warn(`Corrupt data for ${key}, resetting.`);
        return fallback;
    }
};

const DEFAULT_SETTINGS = {
    showTips: true,
    showPercentages: true,
    colorblindMode: false,
    largeText: false,
    enableTilt: false,
    mirrorMode: false,
    muteSounds: false,
    zeroVotesOnly: false,
    kidsMode: false,
    kidsModePin: null,
    showLights: false,
    offlineMode: false,
    arachnophobiaMode: false,
    randomizeTheme: true
};

const State = {
    data: {
        userId: localStorage.getItem('userId') || crypto.randomUUID(),
        username: localStorage.getItem('username') || '',
        voteCount: parseInt(localStorage.getItem('voteCount') || 0),
        contributorCount: parseInt(localStorage.getItem('contributorCount') || 0),
        profilePhoto: localStorage.getItem('profilePhoto') || null,
        
        longestStreak: parseInt(localStorage.getItem('longestStreak') || 0),
        highScores: safeParse('highScores', []),
        pendingVotes: safeParse('pendingVotes', []),
        offlineCache: safeParse('offlineCache', []),
        unlockedThemes: safeParse('unlockedThemes', []),
        seenHistory: safeParse('seenHistory', []),

        insectStats: {
            saved: parseInt(localStorage.getItem('insectSaved') || 0),
            eaten: parseInt(localStorage.getItem('insectEaten') || 0),
            teased: parseInt(localStorage.getItem('insectTeased') || 0),
            splatted: parseInt(localStorage.getItem('insectSplatted') || 0),
            collection: JSON.parse(localStorage.getItem('insectCollection') || '[]')
        }, 
		keyringClaimed: localStorage.getItem('keyringClaimed') === 'true',
		
        wordHistory: JSON.parse(localStorage.getItem('wordCountHistory') || '[]'),

        
        fishStats: {
            caught: parseInt(localStorage.getItem('fishCaught') || 0),
            spared: parseInt(localStorage.getItem('fishSpared') || 0)
        },
        
        badges: {
            // ... (keep existing badges list) ...
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
            rock: localStorage.getItem('rockBadgeUnlocked') === 'true',
            chopper: localStorage.getItem('chopperBadgeUnlocked') === 'true',
            exterminator: localStorage.getItem('exterminatorBadgeUnlocked') === 'true',
            saint: localStorage.getItem('saintBadgeUnlocked') === 'true',
            prankster: localStorage.getItem('pranksterBadgeUnlocked') === 'true',
            judge: localStorage.getItem('judgeBadgeUnlocked') === 'true',
            bard: localStorage.getItem('bardBadgeUnlocked') === 'true',       
            traveler: localStorage.getItem('travelerBadgeUnlocked') === 'true',
            fish: localStorage.getItem('fishBadgeUnlocked') === 'true',
            tropical: localStorage.getItem('tropicalBadgeUnlocked') === 'true',
            puffer: localStorage.getItem('pufferBadgeUnlocked') === 'true',
            shark: localStorage.getItem('sharkBadgeUnlocked') === 'true',
            octopus: localStorage.getItem('octopusBadgeUnlocked') === 'true',
            snowman: localStorage.getItem('snowmanBadgeUnlocked') === 'true',
            angler: localStorage.getItem('anglerBadgeUnlocked') === 'true',
            shepherd: localStorage.getItem('shepherdBadgeUnlocked') === 'true'
        },
        settings: { 
            ...DEFAULT_SETTINGS, 
            ...(JSON.parse(localStorage.getItem('userSettings')) || {}) 
        },
            
        currentTheme: localStorage.getItem('currentTheme') || 'default',
        voteCounterForTips: parseInt(localStorage.getItem('voteCounterForTips')) || 0,
        manualTheme: localStorage.getItem('manualTheme') === 'true',
        lastMosquitoSpawn: parseInt(localStorage.getItem('lastMosquitoSpawn') || 0),
        daily: {
            streak: parseInt(localStorage.getItem('dailyStreak') || 0),
            lastDate: localStorage.getItem('dailyLastDate') || '',
			progress: parseInt(localStorage.getItem('dailyProgress') || 0)
        }
    },

    runtime: {
        allWords: [],
        currentWordIndex: 0,
        streak: 0,
        mashCount: 0,
        lastVoteTime: 0,
        lastStreakTime: 0,
        isCoolingDown: false,
        cooldownTimer: null,
        mashLevel: 0,
        isDailyMode: false
    },
    save(k, v) {
        this.data[k] = v;
        const s = localStorage;
        
        if (['pendingVotes','offlineCache','highScores','unlockedThemes','seenHistory','settings'].includes(k)) {
            s.setItem(k, JSON.stringify(v));
        }
        
        if (k === 'pendingVotes') s.setItem('pendingVotes', JSON.stringify(v));
        else if (k === 'offlineCache') s.setItem('offlineCache', JSON.stringify(v));
        else if (k === 'highScores') s.setItem('highScores', JSON.stringify(v));
        else if (k === 'insectStats') {
            s.setItem('insectSaved', v.saved);
            s.setItem('insectEaten', v.eaten);
            s.setItem('insectTeased', v.teased);
            s.setItem('insectSplatted', v.splatted);
            s.setItem('insectCollection', JSON.stringify(v.collection));
        } 
        else if (k === 'wordHistory') {
            s.setItem('wordCountHistory', JSON.stringify(v));
        }
        else if (k === 'fishStats') {
            s.setItem('fishCaught', v.caught);
            s.setItem('fishSpared', v.spared); 
        }
        else if (k.startsWith('badge_')) {
            s.setItem(k, v);
        }
        else if (k === 'settings') s.setItem('userSettings', JSON.stringify(v));
        else if (k === 'unlockedThemes') s.setItem('unlockedThemes', JSON.stringify(v));
        else if (k === 'seenHistory') s.setItem('seenHistory', JSON.stringify(v));
        else if (k === 'daily') {
            s.setItem('dailyStreak', v.streak);
            s.setItem('dailyLastDate', v.lastDate);
			s.setItem('dailyProgress', v.progress);
        }
		else if (k === 'keyringClaimed') {
            s.setItem('keyringClaimed', v);
        }
        else if (k === 'profilePhoto') s.setItem('profilePhoto', v);
        else if (k === 'lastMosquitoSpawn') s.setItem(k, v);
        else s.setItem(k, v);
    },
    
unlockBadge(n) {
        if (this.data.badges[n]) return;
        this.data.badges[n] = true;
        localStorage.setItem(`${n}BadgeUnlocked`, 'true');
        
        const cleanName = n === 'ballpit' ? 'Ball Pit' : n.charAt(0).toUpperCase() + n.slice(1);
        if (window.StreakManager) StreakManager.showNotification(`🏆 Unlocked: ${cleanName}`, 'success');
        else UIManager.showPostVoteMessage(`Unlocked ${cleanName} badge!`);
    },
    incrementVote() {
        this.data.voteCount++;
        localStorage.setItem('voteCount', this.data.voteCount);
        if (this.data.voteCount >= 1000) this.unlockBadge('judge');
    },

    incrementContributor() {
        this.data.contributorCount++;
        localStorage.setItem('contributorCount', this.data.contributorCount);
        if (this.data.contributorCount >= 5) this.unlockBadge('bard');
    },
    clearAll() {
        if (confirm("Clear all local data? Irreversible. I don't back up.")) {
            if (confirm("Are you really sure? All progress, badges, and stats will be lost forever.")) {
                localStorage.clear();
                window.location.reload();
            }
        }
    }
};

const OfflineManager = {
    CACHE_TARGET: 500,

    isActive() {
        return State.data.settings.offlineMode;
    },

    async toggle(active) {
        if (active) {
            UIManager.showMessage("Downloading offline pack... 🚇");
            const success = await this.fillCache();
            if (success) {
                State.data.settings.offlineMode = true;
                State.save('settings', State.data.settings);
                UIManager.showPostVoteMessage("Offline Mode Ready! 🚇");
                State.runtime.allWords = State.data.offlineCache; 
                Game.nextWord();
            } else {
                alert("Could not download words. Check connection.");
                const toggle = document.getElementById('toggleOffline');
                if(toggle) toggle.checked = false;
            }
        } else {
            UIManager.showMessage("Syncing votes... 📡");
            await this.sync();
            State.data.settings.offlineMode = false;
            State.save('settings', State.data.settings);
            Game.refreshData(); 
        }
        UIManager.updateOfflineIndicator();
    },

	async fillCache() {
        try {
            let gathered = [];
            
            if (State.data.settings.kidsMode) {
                const r = await fetch(CONFIG.KIDS_LIST_FILE);
                if (!r.ok) throw 0;
                const t = await r.text();
                // Convert text lines to compatible objects
                gathered = t.split('\n')
                    .map(l => l.trim().toUpperCase())
                    .filter(l => l.length > 0)
                    .map((w, i) => ({ 
                        _id: `kid_${i}`, 
                        text: w, 
                        goodVotes: 0, 
                        badVotes: 0 
                    }));
            } else {
                // Normal Mode: Fetch from API
                let attempts = 0; 
                while (gathered.length < this.CACHE_TARGET && attempts < 20) {
                    const newWords = await API.fetchWords(true); 
                    if (!newWords || newWords.length === 0) break;
                    
                    const existingIds = new Set(gathered.map(w => w._id));
                    const unique = newWords.filter(w => !existingIds.has(w._id));
                    gathered = [...gathered, ...unique];
                    attempts++;
                }
            }

            State.save('offlineCache', gathered);
            return true;
        } catch (e) {
            console.error("Cache fill failed", e);
            return false;
        }
    },

    async sync() {
        const queue = State.data.pendingVotes;
        if (queue.length === 0) return;

        let successCount = 0;
        for (const vote of queue) {
            try {
                await fetch(`${CONFIG.API_BASE_URL}/${vote.id}/vote`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        voteType: vote.type,
                        userId: State.data.userId
                    })
                });
                successCount++;
            } catch (e) {
                console.error("Failed to sync vote", vote);
            }
        }

        if (successCount > 0) {
            UIManager.showPostVoteMessage(`Synced ${successCount} votes! ☁️`);
        }
        State.save('pendingVotes', []);
    }
};

if (!localStorage.getItem('userId')) localStorage.setItem('userId', State.data.userId);

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

const Haptics = {
    light() {
        if (navigator.vibrate) navigator.vibrate(10);
    },
    medium() {
        if (navigator.vibrate) navigator.vibrate(50);
    },
    heavy() {
        if (navigator.vibrate) navigator.vibrate(200);
    }
};

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
        

        osc.type = 'sawtooth'; 
        osc.frequency.setValueAtTime(300, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.25);
        

        gain.gain.setValueAtTime(0.8, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
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
	
	playPop() {
        if (State.data.settings.muteSounds) return;
        if (!this.ctx) this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // A quick frequency drop simulates a "pop"
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);

        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start();
        osc.stop(t + 0.15);
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

// --- INSECT/ENTITY LOGIC ---
const MosquitoManager = {
    el: null, svg: null, path: null, checkInterval: null,
    x: 50, y: 50, angle: 0, 
    speed: 0.2, 
    turnCycle: 0, loopTimer: 0,
    trailPoints: [], MAX_TRAIL: 80,
    state: 'hidden', raf: null,
    huntTimer: null, 
    type: '🦟',
    config: {}, 
    COOLDOWN: 5 * 60 * 1000, 

    TYPES: {
        '🐞': { name: 'Ladybird', speed: 0.2, turnRate: 0.005, wobble: 0.01, badge: null },
        '🐝': { name: 'Bee', speed: 0.35, turnRate: 0.1, wobble: 0.05, badge: null },
        '🦟': { name: 'Mosquito', speed: 0.2, turnRate: 0.02, wobble: 0.02, badge: null },
        '🚁': { name: 'Chopper', speed: 0.45, turnRate: 0.001, wobble: 0.0, badge: 'chopper' }
    },

    startMonitoring() {
        if (this.checkInterval) clearInterval(this.checkInterval);
        this.attemptSpawn();
        this.checkInterval = setInterval(() => this.attemptSpawn(), 10000);
    },

    attemptSpawn() {
        if (State.data.currentTheme !== 'halloween') return; 
        if (this.el) return;
        const now = Date.now();
        const last = State.data.lastMosquitoSpawn;
        if (now - last < this.COOLDOWN) return;
        if (Math.random() > 0.3) return; 
        this.init();
    },

    spawnStuck(typeChar) {
        if (this.el) this.remove(); 

        this.type = typeChar || '🦟';
        this.config = this.TYPES[this.type] || this.TYPES['🦟'];
        
        this.el = document.createElement('div');
        this.el.textContent = this.type;
        this.el.className = 'mosquito-entity';
        
        this.x = 88; 
        this.y = 20; 

Object.assign(this.el.style, {
            position: 'fixed', 
            fontSize: '1.8rem', 
            zIndex: '100',
            left: this.x + '%', 
            top: this.y + '%',
            transform: 'translate(-50%, -50%)', 
            filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.5))',
            cursor: 'pointer',       
            pointerEvents: 'auto'   
        });

this.el.onclick = (e) => {
            e.stopPropagation();
            if (this.state === 'stuck') {
                if (this.huntTimer) clearTimeout(this.huntTimer);
                this.splat(); 
                // -------------------------------------------------
            }
            else if (this.state === 'flying') {
                this.splat();
            }
        };

        document.body.appendChild(this.el);
        this.state = 'stuck';
        
        setTimeout(() => {
            if (State.data.currentTheme === 'halloween') {
                Effects.spiderHunt(this.x, this.y, true);
            }
        }, 100);
    },

    init() {
        if (this.el) this.remove();
        
        let rareChance = 0.02;
        if (State.data.insectStats.saved > 20) rareChance = 0.05;
        if (State.data.insectStats.saved > 50) rareChance = 0.10; 

        const keys = ['🐞', '🐝', '🦟'];
        const isRare = Math.random() < rareChance; 
        this.type = isRare ? '🚁' : keys[Math.floor(Math.random() * keys.length)];
        this.config = this.TYPES[this.type];

        this.speed = this.config.speed;

        this.el = document.createElement('div');
        this.el.textContent = this.type;
        this.el.className = 'mosquito-entity';
        
        const startRight = Math.random() > 0.5;
        this.x = startRight ? 105 : -5; 
        this.y = Math.random() * 50 + 10;
        this.angle = startRight ? Math.PI : 0; 

        Object.assign(this.el.style, {
            position: 'fixed', 
            fontSize: this.type === '🚁' ? '2.5rem' : '1.8rem', 
            zIndex: '100',
            pointerEvents: 'auto', cursor: 'pointer', transition: 'none', 
            filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.5))',
            left: this.x + '%', top: this.y + '%', willChange: 'transform, left, top'
        });

        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        Object.assign(this.svg.style, {
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            pointerEvents: 'none', zIndex: '99'
        });
        
        this.path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this.path.setAttribute("fill", "none");
        this.path.setAttribute("stroke", "rgba(255, 255, 255, 0.6)"); 
        this.path.setAttribute("stroke-width", "1.5"); 
        this.path.setAttribute("stroke-dasharray", "5, 5");
        this.path.setAttribute("stroke-linecap", "round");
        
        this.svg.appendChild(this.path);
        document.body.appendChild(this.svg);
        document.body.appendChild(this.el);
        
        this.el.onclick = (e) => {
            e.stopPropagation();
            if (this.state === 'stuck') {
                if (this.huntTimer) clearTimeout(this.huntTimer);
                this.startRescue();
            }
            else if (this.state === 'flying') {
                this.splat(); 
            }
        };
        
        this.state = 'flying';
        this.trailPoints = [];
        this.turnCycle = Math.random() * 100; 
        SoundManager.startBuzz(); 
        this.loop();
    },

    startRescue() {
        this.state = 'thanking';
        SoundManager.stopBuzz(); 

        if (this.path) this.path.setAttribute('d', '');
        
        State.data.insectStats.saved++;
        State.save('insectStats', State.data.insectStats);
        
        if (this.config.badge) State.unlockBadge(this.config.badge);
        if (State.data.insectStats.saved >= 100) State.unlockBadge('saint');
        
        const msg = GAME_DIALOGUE.insects[this.type] || "Saved!";
        UIManager.showPostVoteMessage(msg);

        const bubble = document.createElement('div');
        bubble.textContent = "Thank you! 💖";
        Object.assign(bubble.style, {
            position: 'absolute', bottom: '100%', left: '50%',
            transform: 'translateX(-50%)', background: 'white', color: 'black',
            padding: '4px 8px', borderRadius: '8px', fontSize: '12px',
            fontWeight: 'bold', whiteSpace: 'nowrap', border: '1px solid #ccc',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)', pointerEvents: 'none', zIndex: '101'
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
	
splat() {
        if (this.state === 'splatted') return;
        this.state = 'splatted';
        
        State.data.insectStats.splatted = (State.data.insectStats.splatted || 0) + 1;

        if (!State.data.insectStats.collection) State.data.insectStats.collection = [];
        if (!State.data.insectStats.collection.includes(this.type)) {
            State.data.insectStats.collection.push(this.type);
        }
        
        State.save('insectStats', State.data.insectStats);

        UIManager.showPostVoteMessage("Splat! 🦶");
        Haptics.heavy();

        this.el.style.transition = 'transform 0.1s ease-out, opacity 0.2s';
        this.el.style.transform = 'translate(-50%, -50%) scale(1.5) rotate(45deg)';
        this.el.style.filter = 'grayscale(100%) brightness(0.5)'; 
        this.el.style.opacity = '0';

        setTimeout(() => this.remove(), 200);
    },
    loop() {
        if (!document.body.contains(this.el)) return;
        if (this.state === 'flying' || this.state === 'leaving') {
            this.turnCycle += this.config.turnRate; 
            let turnAmount = Math.sin(this.turnCycle) * this.config.wobble;
            if (this.type === '🚁') {
                turnAmount = 0; 
                this.y += Math.sin(Date.now() / 200) * 0.05;
            }
            this.angle += turnAmount;
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
            
            if (this.state === 'flying') {
                if (this.x > 110) { 
                    this.x = -10; 
                    this.angle = 0 + (Math.random() * 0.5 - 0.25); 
                    this.trailPoints = []; 
                }
                else if (this.x < -10) { 
                    this.x = 110; 
                    this.angle = Math.PI + (Math.random() * 0.5 - 0.25); 
                    this.trailPoints = []; 
                }
                if (this.y < 5 || this.y > 95) {
                    this.angle = -this.angle;
                    this.y = Math.max(5, Math.min(95, this.y));
                }
            }
            this.el.style.left = this.x + '%';
            this.el.style.top = this.y + '%';
            
            // Handle Rotation and Centering
            const facingRight = Math.cos(this.angle) > 0;
            this.el.style.transform = `translate(-50%, -50%) ${facingRight ? 'scaleX(-1)' : 'scaleX(1)'}`;
            
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
            const inWebZone = (distRight + distTop) < 300;
            const isVisible = pxX > 50 && pxX < (window.innerWidth - 50) && pxY > 50 && pxY < (window.innerHeight - 50);

            // --- CORRECTED LOGIC: Only get stuck if Arachnophobia Mode is OFF ---
            if (this.state === 'flying' && inWebZone && isVisible && !State.data.settings.arachnophobiaMode) {
                this.state = 'stuck';
                SoundManager.stopBuzz(); 
                UIManager.showPostVoteMessage(`The ${this.config.name} is stuck!`);
                this.huntTimer = setTimeout(() => {
                    if (this.state === 'stuck') Effects.spiderHunt(this.x, this.y, true);
                }, 2500); 
            }
            if (this.state === 'leaving') {
                if (this.x < -10 || this.x > 110 || this.y < -10 || this.y > 110) this.finish();
            }
        } else if (this.state === 'stuck') {
            const jitterX = (Math.random() - 0.5) * 5; 
            const jitterY = (Math.random() - 0.5) * 5;
            this.el.style.transform = `translate(calc(-50% + ${jitterX}px), calc(-50% + ${jitterY}px))`;
        } else if (this.state === 'thanking') {
            this.el.style.transform = `translate(-50%, -50%) scale(1.2)`;
        }
        this.raf = requestAnimationFrame(() => this.loop());
    },

    eat() {
        if (this.state !== 'stuck') return;
        UIManager.showPostVoteMessage("Chomp! 🕷️");
        State.data.insectStats.eaten++;
        State.save('insectStats', State.data.insectStats);
        if (State.data.insectStats.eaten >= 100) State.unlockBadge('exterminator');
        this.finish();
    },

    finish() {
        State.save('lastMosquitoSpawn', Date.now());
        this.remove();
    },

    remove() {
        if (this.raf) cancelAnimationFrame(this.raf);
        if (this.huntTimer) clearTimeout(this.huntTimer);
        SoundManager.stopBuzz();
        if (this.el && this.el.parentNode) this.el.remove();
        if (this.svg && this.svg.parentNode) this.svg.remove(); 
        this.el = null;
        this.svg = null;
        this.trailPoints = [];
        this.state = 'hidden';
    }
};

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

const Physics = {
    balls: [],
    gx: 0,
    gy: 0.8,
    handleOrientation(e) {
        const x = e.gamma || 0,
            y = e.beta || 0;
        const currentAngle = (screen.orientation && screen.orientation.angle) || (window.orientation || 0);
        
        let tx = 0;
        let ty = 0;

        if (Math.abs(currentAngle) < 30 || Math.abs(currentAngle) > 150) {
             tx = Math.min(Math.max(x / 4, -1), 1);
             ty = Math.min(Math.max((y - 45) / 4, -1), 1);
        } else {
             tx = 0; 
             ty = 0.5;
        }

        Physics.gx += (tx - Physics.gx) * 0.1;
        Physics.gy += (ty - Physics.gy) * 0.1
    },
    run() {
        const W = window.innerWidth,
            H = window.innerHeight;
        const cylW = Math.min(W, 500),
            minX = (W - cylW) / 2,
            maxX = minX + cylW;
        for (let s = 0; s < 1; s++) {
            Physics.balls.forEach(b => {
                if (!b.drag) {
                    b.vx += Physics.gx / 1;
                    b.vy += Physics.gy / 1;
                    b.x += b.vx;
                    b.y += b.vy;
                    b.vx *= 0.95;
                    b.vy *= 0.95;
                    if (b.x < minX) { b.x = minX; b.vx *= -0.8 }
                    if (b.x > maxX - b.r * 2) { b.x = maxX - b.r * 2; b.vx *= -0.8 }
                    if (b.y < 0) { b.y = 0; b.vy *= -0.8}
                    if (b.y > H - b.r * 2) { b.y = H - b.r * 2; b.vy *= -0.8 }
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
                            const tmpVx = b1.vx;
                            const tmpVy = b1.vy;
                            b1.vx = b2.vx * 0.5;
                            b1.vy = b2.vy * 0.5;
                            b2.vx = tmpVx * 0.5;
                            b2.vy = tmpVy * 0.5;
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

const API = {
    async fetchWords(forceNetwork = false) {
        if (OfflineManager.isActive() && !forceNetwork) {
            console.log("Serving from Offline Cache 🚇");
            return State.data.offlineCache; 
        }

        try {
            const r = await fetch(CONFIG.API_BASE_URL);
            if (!r.ok) throw 0;
            return await r.json();
        } catch (e) {
            if (State.data.offlineCache && State.data.offlineCache.length > 0) {
                UIManager.showPostVoteMessage("Network error. Switched to Offline.");
                return State.data.offlineCache;
            }
            return null;
        }
    },

    async fetchKidsWords() {
        try {
            const listResponse = await fetch(CONFIG.KIDS_LIST_FILE);
            if (!listResponse.ok) throw new Error("Missing kids file");
            const listText = await listResponse.text();
            const safeList = new Set(listText.split('\n').map(l => l.trim().toUpperCase()).filter(l => l.length > 0));
            
            let allWords = [];
            
            if (OfflineManager.isActive()) {
                allWords = State.data.offlineCache || [];
                if (allWords.length === 0) {
                     return [{ _id: 'temp', text: 'Offline: No Words', goodVotes: 0, badVotes: 0 }];
                }
            } else {
                allWords = await this.fetchWords(); 
            }

            const safeWords = allWords.filter(w => safeList.has(w.text.toUpperCase()));
            if (safeWords.length === 0) return [{ _id: 'temp', text: 'No Matching Words', goodVotes: 0, badVotes: 0 }];
            return safeWords;
        } catch (e) {
            return [{ _id: 'err', text: 'Error Loading', goodVotes: 0, badVotes: 0 }];
        }
    },

    async vote(id, type) {
        if (id === 'temp' || id === 'err') return;

        // 2. Intercept Vote for Offline Mode
        if (OfflineManager.isActive()) {
            const queue = State.data.pendingVotes;
            queue.push({ id, type, time: Date.now() });
            State.save('pendingVotes', queue);
            
            // --- FIX: Update the UI counter immediately ---
            UIManager.updateOfflineIndicator();
            // ----------------------------------------------
    
            return { ok: true, status: 200, json: async () => ({}) };
        }

        return fetch(`${CONFIG.API_BASE_URL}/${id}/vote`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                voteType: type,
                userId: State.data.userId
            })
        });
    },

    async submitWord(text) {
        if (OfflineManager.isActive()) {
            UIManager.showPostVoteMessage("Cannot submit new words offline 🚫");
            return { ok: false };
        }
        return fetch(CONFIG.API_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
    },
    
    async define(w) {
         return fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${w.toLowerCase()}`);
    },
	
	async getGlobalScores() {
        try {
            const r = await fetch(CONFIG.SCORE_API_URL);
            if (!r.ok) return [];
            return await r.json();
        } catch (e) { return []; }
    },

    async submitHighScore(name, score) {
        try {
            await fetch(CONFIG.SCORE_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, score, userId: State.data.userId })
            });
        } catch (e) { console.error("Score submit failed", e); }
    }
};

const ThemeManager = {
    wordMap: {},
   init() {
        const s = document.createElement("style");
        s.innerText = `@keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }`;
        document.head.appendChild(s);
    
        Object.entries(CONFIG.THEME_SECRETS).forEach(([k, v]) => {
            try {
                atob(v).split('|').forEach(w => this.wordMap[w] = k)
            } catch {}
        });
        
        if ((State.data.unlockedThemes.length + 1) >= 5) {
            State.unlockBadge('traveler');
        }
        
        this.populateChooser();

        if (State.data.settings.randomizeTheme && State.data.unlockedThemes.length > 0) {
            const available = ['default', ...State.data.unlockedThemes];
            const randomTheme = available[Math.floor(Math.random() * available.length)];
            this.apply(randomTheme);
        } else {
            this.apply(State.data.currentTheme);
        }
		
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

		if (DOM.theme.chooser) DOM.theme.chooser.value = t;

        if (t === 'banana') {
            if (!document.getElementById('banana-style')) {
                const s = document.createElement('style');
                s.id = 'banana-style';
                
                s.innerHTML = `
                    body.theme-banana {
                        background-color: #f7e98e !important;
                        
                        background-image: 
                            /* 1. The "Sugar Spots" (Tiny, sharp, high density but scattered) */
                            radial-gradient(circle at 15% 50%, rgba(92, 64, 51, 0.6) 1px, transparent 1.5px),
                            radial-gradient(circle at 85% 30%, rgba(92, 64, 51, 0.5) 1.5px, transparent 2.5px),
                            
                            /* 2. Large Irregular Blotches (The "Ripe" look) */
                            radial-gradient(ellipse at 70% 20%, rgba(70, 45, 30, 0.3) 2px, transparent 10px),
                            radial-gradient(ellipse at 20% 80%, rgba(70, 45, 30, 0.4) 4px, transparent 15px),
                            
                            /* 3. Sparse Fibers (Widely spaced vertical lines) */
                            repeating-linear-gradient(
                                90deg, 
                                transparent, 
                                transparent 59px, 
                                rgba(139, 69, 19, 0.06) 60px, /* Thin line */
                                rgba(139, 69, 19, 0.03) 62px, /* Feather edge */
                                transparent 62px,
                                transparent 140px /* Large gap */
                            ),
                            
                            /* 4. Subtle background noise */
                            radial-gradient(circle at 50% 50%, rgba(139, 69, 19, 0.02) 0%, transparent 50%) !important;
                        
                        /* Prime numbers for background-size prevent grid alignment */
                        background-size: 
                            103px 103px,    /* Tiny spots A */
                            263px 263px,    /* Tiny spots B */
                            499px 499px,    /* Large Blotches A */
                            379px 379px,    /* Large Blotches B */
                            100% 100%,      /* Fibers (Fill screen) */
                            800px 800px     /* Noise */
                            !important;
                            
                        background-position: 
                            0 0, 
                            30px 50px, 
                            100px 20px, 
                            -50px 150px,
                            0 0,
                            0 0 !important;
                            
                        background-attachment: fixed !important;
                    }
                    body.theme-banana #wordDisplay {
                        color: #4b3621 !important; /* Dark Coffee Brown */
                        text-shadow: 1px 1px 0px rgba(255,255,255,0.4);
                    }
                `;
                document.head.appendChild(s);
            }
        } else {
            const old = document.getElementById('banana-style');
            if (old) old.remove();
        }
        // -------------------------------

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
        if (t !== 'halloween') MosquitoManager.remove();

        
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
            if ((State.data.unlockedThemes.length + 1) >= 5) {
                State.unlockBadge('traveler');
            }
            this.populateChooser();
            if (!State.data.manualTheme) this.apply(t);
            
            const cleanTheme = t === 'ballpit' ? 'Ball Pit' : t.charAt(0).toUpperCase() + t.slice(1);
            if (window.StreakManager) StreakManager.showNotification(`🎨 Theme Unlocked: ${cleanTheme}`, 'success');
            return true
        }
        return false
    }
};

const Effects = {
    spiderTimeout: null,
    webRaf: null,
    ballLoop: null,
    fishTimeout: null,
    spaceRareTimeout: null,
    snowmanTimeout: null,
    plymouthShooterTimeout: null, 
    
plymouth(a) {
        const c = DOM.theme.effects.plymouth;

        if (this.plymouthShooterTimeout) clearTimeout(this.plymouthShooterTimeout);
        if (this.satelliteTimeout) clearTimeout(this.satelliteTimeout);
        if (this.plymouthStreakTimeout) clearTimeout(this.plymouthStreakTimeout);

        if (!a) { c.innerHTML = ''; return; }

        c.innerHTML = '';

        if (!document.getElementById('plymouth-stars-style')) {
            const style = document.createElement('style');
            style.id = 'plymouth-stars-style';
            style.innerHTML = `
                @keyframes twinkle {
                    0% { opacity: 0.3; transform: scale(0.8); }
                    50% { opacity: 1; transform: scale(1.2); box-shadow: 0 0 2px rgba(255,255,255,0.8); }
                    100% { opacity: 0.3; transform: scale(0.8); }
                }
            `;
            document.head.appendChild(style);
        }

        for (let i = 0; i < 60; i++) {
            const s = document.createElement('div');
            s.className = 'star-particle';
            const size = Math.random() * 3 + 1;

            Object.assign(s.style, {
                position: 'absolute',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                width: size + 'px',
                height: size + 'px',
                background: 'white',
                borderRadius: '50%',
                animation: `twinkle ${Math.random() * 4 + 2}s infinite ease-in-out`,
                animationDelay: `-${Math.random() * 5}s`
            });
            c.appendChild(s);
        }

        this.spawnPlymouthShooter = () => {
            if (State.data.currentTheme !== 'plymouth') return;

            const s = document.createElement('div');
            s.textContent = '🌠';
            Object.assign(s.style, {
                position: 'absolute',
                fontSize: (Math.random() * 1 + 1) + 'rem',
                transform: 'rotate(-35deg)',
                boxShadow: '0 0 8px rgba(255,255,255,0.8)',
                zIndex: '10',
                pointerEvents: 'none',
                borderRadius: '100%',
                top: Math.random() * 40 + '%',
                left: Math.random() * 80 + 10 + '%',
                opacity: '0'
            });
            c.appendChild(s);

            const travelDist = Math.random() * 300 + 200;
            const duration = Math.random() * 1500 + 2000;

            const anim = s.animate([
                { transform: 'translate(0, 0) rotate(-35deg)', opacity: 0 },
                { transform: 'translate(0, 0) rotate(-35deg)', opacity: 1, offset: 0.1 },
                { transform: `translate(-${travelDist}px, ${travelDist/2}px) rotate(-35deg)`, opacity: 0 }
            ], { duration: duration, easing: 'ease-out' });

            anim.onfinish = () => s.remove();

            this.plymouthShooterTimeout = setTimeout(() => this.spawnPlymouthShooter(), Math.random() * 8000 + 4000);
        };

        this.spawnRealStreak = () => {
            if (State.data.currentTheme !== 'plymouth') return;

            const streak = document.createElement('div');
            const width = Math.random() * 150 + 50;

            Object.assign(streak.style, {
                position: 'absolute',
                height: (Math.random() * 2 + 1) + 'px',
                width: width + 'px',
                background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.9) 50%, rgba(255,255,255,0))',
                top: (Math.random() * 60) + '%',
                left: (Math.random() * 100) + '%',
                transform: 'rotate(-35deg)',
                opacity: '0',
                pointerEvents: 'none',
                zIndex: '5',
                boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)'
            });
            c.appendChild(streak);

            const travelX = -200;
            const travelY = 100;

            const anim = streak.animate([
                { transform: 'translate(0, 0) rotate(-35deg)', opacity: 0 },
                { transform: `translate(${travelX * 0.1}px, ${travelY * 0.1}px) rotate(-35deg)`, opacity: 1, offset: 0.1 },
                { transform: `translate(${travelX}px, ${travelY}px) rotate(-35deg)`, opacity: 0 }
            ], {
                duration: Math.random() * 800 + 600,
                easing: 'ease-out'
            });

            anim.onfinish = () => streak.remove();
            this.plymouthStreakTimeout = setTimeout(() => this.spawnRealStreak(), Math.random() * 3000 + 1000);
        };

        this.spawnSatellite = () => {
            if (State.data.currentTheme !== 'plymouth') return;

            const sat = document.createElement('div');
            sat.textContent = '🛰️';
            const startLeft = Math.random() > 0.5;

            Object.assign(sat.style, {
                position: 'absolute',
                fontSize: '2.5rem',
                opacity: '0.9',
                zIndex: '2',
                top: (Math.random() * 50 + 10) + '%',
                left: startLeft ? '-10%' : '110%',
                transition: 'left 35s linear, transform 35s linear',
                filter: 'drop-shadow(0 0 3px rgba(200,200,255,0.3))',
                transform: startLeft ? 'rotate(15deg)' : 'scaleX(-1) rotate(-15deg)',
                pointerEvents: 'none'
            });

            c.appendChild(sat);

            requestAnimationFrame(() => {
                sat.style.left = startLeft ? '110%' : '-10%';
                sat.style.transform = startLeft ? 'rotate(45deg)' : 'scaleX(-1) rotate(-45deg)';
            });

            setTimeout(() => { if(sat.parentNode) sat.remove(); }, 36000);
            this.satelliteTimeout = setTimeout(() => this.spawnSatellite(), Math.random() * 25000 + 20000);
        };

        this.spawnPlymouthShooter();
        this.spawnSatellite();
        this.spawnRealStreak();
    },

    fire() { const c = DOM.theme.effects.fire; c.innerHTML = ''; for (let i = 0; i < 80; i++) { const p = document.createElement('div'); p.className = 'fire-particle'; p.style.animationDuration = `${Math.random()*1.5+0.5}s`; p.style.animationDelay = `${Math.random()}s`; p.style.left = `calc(10% + (80% * ${Math.random()}))`; const size = Math.random() * 3 + 2; p.style.width = p.style.height = `${size}em`; p.style.setProperty('--sway', `${(Math.random()-.5)*20}px`); c.appendChild(p) } for (let i = 0; i < 15; i++) { const s = document.createElement('div'); s.className = 'smoke-particle'; s.style.animationDelay = `${Math.random()*3}s`; s.style.left = `${Math.random()*90+5}%`; s.style.setProperty('--sway', `${(Math.random()-.5)*150}px`); c.appendChild(s) } },
    
bubbles(active) {
        const c = DOM.theme.effects.bubble;
        if (this.fishTimeout) clearTimeout(this.fishTimeout);
        if (!active) { c.innerHTML = ''; return; }
        c.innerHTML = '';

        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isLowPower = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
        
        // Use 15 bubbles for mobile/old devices, 35 for desktop
        const particleCount = (isMobile || isLowPower) ? 15 : 35;

        const cl = [10, 30, 70, 90];
        for (let i = 0; i < particleCount; i++) {
            const p = document.createElement('div');
            p.className = 'bubble-particle';
            const s = Math.random() * 30 + 10;
            p.style.width = p.style.height = `${s}px`;
            
            // Optimization: Use transform for positioning if possible, but left is okay here
            // We group them to prevent layout thrashing
            p.style.left = `${cl[Math.floor(Math.random()*cl.length)]+(Math.random()-.5)*20}%`;
            
            p.style.animationDuration = `${Math.random()*10+10}s`;
            p.style.animationDelay = `-${Math.random()*15}s`;
            c.appendChild(p);
        }

        // Start the fish loop
        this.spawnFish();
    },

spawnFish() {
        // 1. Define Container
        const c = DOM.theme.effects.bubble;
        if (!c) return; // Safety check

        if (!document.getElementById('octopus-style')) {
            const style = document.createElement('style');
            style.id = 'octopus-style';
            style.innerHTML = `
                @keyframes octopus-swim {
                    0% { transform: translateY(0) scale(1, 1); }
                    25% { transform: translateY(-30px) scale(0.9, 1.1); }
                    50% { transform: translateY(0) scale(1, 1); }
                    75% { transform: translateY(30px) scale(1.1, 0.9); }
                    100% { transform: translateY(0) scale(1, 1); }
                }
                .octopus-motion { animation: octopus-swim 2s ease-in-out infinite; }
            `;
            document.head.appendChild(style);
        }

        if (State.data.currentTheme !== 'submarine') return;

        const fishData = {
            '🐟': { k: 'fish', msg: "Gotcha! 🐟", speed: [12, 18] },
            '🐠': { k: 'tropical', msg: "So colourful! 🐠", speed: [15, 25] },
            '🐡': { k: 'puffer', msg: "", speed: [20, 30] },
            '🦈': { k: 'shark', msg: "You're gonna need a bigger boat! 🦈", speed: [6, 10] },
            '🐙': { k: 'octopus', msg: "Wiggle wiggle! 🐙", speed: [18, 25] },
            '🥾': { k: 'prankster', msg: "Keep the ocean clean!", speed: [15, 20] }
        };

        const roll = Math.random();
        let fishEmoji = '🐟';
        if (roll < 0.05) fishEmoji = '🥾';
        else if (roll < 0.15) fishEmoji = '🐙';
        else if (roll < 0.25) fishEmoji = '🦈';
        else if (roll < 0.40) fishEmoji = '🐡';
        else if (roll < 0.70) fishEmoji = '🐠';
        else fishEmoji = '🐟';

        const config = fishData[fishEmoji] || fishData['🐟'];

                const wrap = document.createElement('div');
        wrap.className = 'submarine-fish-wrap';
        wrap.style.position = 'fixed'; // <--- ADD THIS LINE
        wrap.style.zIndex = '10';      // <--- OPTIONAL: Ensures fish appear above background bubbles

        const inner = document.createElement('div');

        inner.className = 'submarine-fish-inner';
        inner.textContent = fishEmoji;
        inner.dataset.clicks = "0";

        // Base styles
        inner.style.display = 'block';
        inner.style.lineHeight = '1';
        inner.style.fontSize = fishEmoji === '🐙' ? '3.5rem' : '3rem';

        if (fishEmoji === '🐙') {
            inner.classList.add('octopus-motion');
            // Randomize bobbing speed (1.5s to 2.5s)
            inner.style.animationDuration = (Math.random() * 1 + 1.5) + 's';
            // Randomize start offset
            inner.style.animationDelay = '-' + (Math.random() * 2) + 's';
        }

        const isBoot = fishEmoji === '🥾';
        const startLeft = Math.random() > 0.5;
        const baseDir = startLeft ? -1 : 1; 
        // Ensure duration is a valid number (fallback to 15s)
        const duration = (Math.random() * (config.speed[1] - config.speed[0]) + config.speed[0]) || 15;

        const isFakeOut = !isBoot && fishEmoji !== '🐙' && Math.random() < 0.10;

        if (isBoot) {
            inner.style.animation = 'spin-slow 10s linear infinite';
            inner.style.transition = 'transform 0.5s';
            wrap.style.left = (Math.random() * 80 + 10) + '%'; 
            wrap.style.top = '110vh'; 
            inner.style.transform = `rotate(${Math.random() * 360}deg)`;
        } else {
            // Standard Fish Setup
            inner.style.transition = 'font-size 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 0.2s';
            wrap.style.top = (Math.random() * 80 + 10) + 'vh';
            
            // Set Start Position OFF-SCREEN
            wrap.style.left = startLeft ? '-150px' : '110vw';
            
            // Face the direction of travel
            if (!isBoot) inner.style.transform = `scaleX(${baseDir})`;
        }
        wrap.appendChild(inner); 
        c.appendChild(wrap);

        // --- FORCE REFLOW (Prevents "Disappearing Fish" bug) ---
        // This line makes the browser calculate the start position immediately
        void wrap.offsetWidth; 

        // --- HELPER: Speech Bubble ---
        const showBubble = (text) => {
            const old = wrap.querySelector('.fish-bubble');
            if(old) old.remove();

            const b = document.createElement('div');
            b.className = 'fish-bubble';
            Object.assign(b.style, {
                position: 'absolute', bottom: '100%', left: '50%',
                transform: 'translateX(-50%)', background: 'white', color: '#1f2937',
                padding: '6px 12px', borderRadius: '12px', fontSize: '16px',
                fontWeight: 'bold', whiteSpace: 'nowrap', zIndex: '20',
                pointerEvents: 'none', opacity: '0', transition: 'opacity 0.2s',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)', border: '1px solid #e5e7eb',
                marginBottom: '10px'
            });
            b.textContent = text;
            const arrow = document.createElement('div');
            Object.assign(arrow.style, {
                position: 'absolute', top: '100%', left: '50%', marginLeft: '-6px',
                borderWidth: '6px', borderStyle: 'solid',
                borderColor: 'white transparent transparent transparent'
            });
            b.appendChild(arrow);
            wrap.appendChild(b);
            requestAnimationFrame(() => b.style.opacity = '1');
            setTimeout(() => { if(b.parentNode) { b.style.opacity = '0'; setTimeout(() => b.remove(), 300); } }, 2000);
        };

        const handleEscape = (e) => {
            const prop = isBoot ? 'top' : 'left';
            if (e.propertyName !== prop) return;
            
            if (wrap.parentNode) {
                // If it reached the end naturally, count as spared
                if (!isBoot) {
                    State.data.fishStats.spared = (State.data.fishStats.spared || 0) + 1;
                    State.save('fishStats', State.data.fishStats);
                    if (State.data.fishStats.spared >= 250) State.unlockBadge('shepherd');
                }
                wrap.remove();
            }
        };
        wrap.addEventListener('transitionend', handleEscape);

        wrap.onclick = (e) => {
            e.stopPropagation();

            // Pufferfish
            if (fishEmoji === '🐡') {
                let clicks = parseInt(inner.dataset.clicks) || 0;
                const canGrow = clicks < 5;
                const roll = Math.random();
                const shouldCatch = !canGrow || (roll < 0.25);

                if (!shouldCatch) {
                    clicks++;
                    inner.dataset.clicks = clicks;
                    State.unlockBadge('puffer');
                    const newSize = 3 + (clicks * 1.5);
                    inner.style.fontSize = `${newSize}rem`;
                    Haptics.light();
                    const puffMsgs = ["Wanna fight?", "I'm bigger than your dad.", "I'll spike you!", "Stop it!", "I am big scary bear!", "Why not pick on someone your own size?"];
                    showBubble(puffMsgs[Math.floor(Math.random() * puffMsgs.length)]);
                    return;
                }
            }

            const data = fishData[fishEmoji];

            if (fishEmoji === '🐙') {
                e.stopPropagation();
                if (data.k) State.unlockBadge(data.k);
                State.data.fishStats.caught++;
                State.save('fishStats', State.data.fishStats);
                UIManager.showPostVoteMessage("Inked!");
                SoundManager.playWhoosh();

                const rect = wrap.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                for (let i = 0; i < 12; i++) {
                    const ink = document.createElement('div');
                    const ox = (Math.random() - 0.5) * 40;
                    const oy = (Math.random() - 0.5) * 40;
                    Object.assign(ink.style, {
                        position: 'fixed', left: (centerX + ox) + 'px', top: (centerY + oy) + 'px',
                        width: (Math.random() * 15 + 10) + 'px', height: (Math.random() * 15 + 10) + 'px',
                        background: '#000000', borderRadius: '50%', opacity: '0.8',
                        pointerEvents: 'none', zIndex: '99',
                        transition: 'transform 1s ease-out, opacity 1s ease-out'
                    });
                    document.body.appendChild(ink);
                    requestAnimationFrame(() => {
                        ink.style.transform = `scale(${Math.random() * 2 + 1}) translate(${ox}px, ${oy}px)`;
                        ink.style.opacity = '0';
                    });
                    setTimeout(() => ink.remove(), 1000);
                }

                const jetSpeed = Math.random() * 0.8 + 1.2; 
                wrap.style.transition = `left ${jetSpeed}s cubic-bezier(0.25, 1, 0.5, 1), top ${jetSpeed}s ease-out`;
                
                // Random destination: Right edge (110vw) to Far Right (140vw)
                // Random destination: Top edge (-20vh) to High Top (-50vh)
                wrap.style.left = (110 + Math.random() * 30) + 'vw'; 
                wrap.style.top = (-20 - Math.random() * 30) + 'vh'; 

                setTimeout(() => { if(wrap.parentNode) wrap.remove(); }, jetSpeed * 1000 + 200);
                return;
            }

            if (isFakeOut) {
                 showBubble('hey!'); 
                 SoundManager.playPop();
                 
                 // 1. Stop current movement
                 const currentLeft = getComputedStyle(wrap).left;
                 wrap.style.transition = 'none';
                 wrap.style.left = currentLeft;

                 // 2. Wait, then Flip & Swim Back
                 setTimeout(() => {
                     if(!wrap.parentNode) return;
                     
                     // INSTANTLY FLIP (Remove transition to make it snappy)
                     inner.style.transition = 'none'; 
                     inner.style.transform = `scaleX(${-baseDir})`; 
                     
                     // Swim back to start
                     wrap.style.transition = `left ${duration * 0.5}s linear`;
                     wrap.style.left = startLeft ? '-150px' : '110vw';
                     
                     setTimeout(() => { 
                         if(wrap.parentNode) wrap.remove(); 
                     }, duration * 500 + 100);
                     
                 }, 600);
                 
                 return; // Do NOT catch
            }

            if (data.k) State.unlockBadge(data.k);
            if (!isBoot) {
                State.data.fishStats.caught++;
                State.save('fishStats', State.data.fishStats);
                if (State.data.fishStats.caught >= 250) State.unlockBadge('angler');
            }
            
            if (fishEmoji === '🐡') UIManager.showPostVoteMessage("Popped!");
            SoundManager.playPop();

            const rect = wrap.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const pColor = fishEmoji === '🐡' ? '#eab308' : (isBoot ? '#78350f' : '#60a5fa');
            for (let i = 0; i < 12; i++) {
                const p = document.createElement('div');
                p.style.cssText = `position: fixed; width: 8px; height: 8px; background: ${pColor}; border-radius: 50%; pointer-events: none; z-index: 102; left: ${centerX}px; top: ${centerY}px;`;
                document.body.appendChild(p);
                const angle = Math.random() * Math.PI * 2;
                const velocity = Math.random() * 60 + 20;
                p.animate([
                    { transform: 'translate(0,0) scale(1)', opacity: 1 },
                    { transform: `translate(${Math.cos(angle)*velocity}px, ${Math.sin(angle)*velocity}px) scale(0)`, opacity: 0 }
                ], { duration: 400, easing: 'ease-out' }).onfinish = () => p.remove();
            }

            wrap.style.transition = 'opacity 0.1s, transform 0.1s';
            wrap.style.opacity = '0';
            wrap.style.transform = 'scale(0)';
            setTimeout(() => wrap.remove(), 100);
        };

        requestAnimationFrame(() => {
            if (isBoot) {
                wrap.style.top = '-20%'; 
                wrap.style.transition = `top ${duration}s linear`;
            } else {
                wrap.style.left = startLeft ? '125vw' : '-25vw';
                wrap.style.transition = `left ${duration}s linear`;
            }
        });

        // Cleanup (Safety timer)
        setTimeout(() => {
            if (wrap.parentNode) wrap.remove();
        }, duration * 1000 + 3000);

        // Next Fish (Recursive call)
        this.fishTimeout = setTimeout(() => this.spawnFish(), Math.random() * 4000 + 1000);
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
            c.appendChild(f);
        }
        if (this.snowmanTimeout) clearTimeout(this.snowmanTimeout);
        const spawnSnowman = () => {
            if (State.data.currentTheme !== 'winter') return;
            const sm = document.createElement('div');
            sm.className = 'snow-particle'; 
            sm.textContent = '⛄';
            Object.assign(sm.style, {
                position: 'absolute', fontSize: '2.5rem', width: 'auto', height: 'auto',
                opacity: '1', left: `${Math.random() * 85 + 5}vw`, top: '-15vh', 
                filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))', cursor: 'pointer',
                zIndex: '101', pointerEvents: 'auto', animation: 'none', 
                transition: 'top 8s linear, transform 8s ease-in-out'
            });
            const handleInteract = (e) => {
                e.stopPropagation(); e.preventDefault();
                State.unlockBadge('snowman');
                UIManager.showPostVoteMessage("Do you want to build a snowman? ⛄");
                sm.style.transition = 'transform 0.2s, opacity 0.2s';
                sm.style.transform = 'scale(1.5)';
                sm.style.opacity = '0';
                setTimeout(() => sm.remove(), 200);
            };
            sm.addEventListener('mousedown', handleInteract);
            sm.addEventListener('touchstart', handleInteract, { passive: false });
            c.appendChild(sm);
            void sm.offsetWidth; 
            requestAnimationFrame(() => {
                sm.style.top = '110vh'; 
                sm.style.transform = `rotate(${Math.random() * 360}deg)`; 
            });
            setTimeout(() => { if (sm.parentNode) sm.remove(); }, 9000);
            this.snowmanTimeout = setTimeout(spawnSnowman, Math.random() * 30000 + 15000);
        };
        this.snowmanTimeout = setTimeout(spawnSnowman, Math.random() * 5000 + 5000);
    },
	
    summer() { const c = DOM.theme.effects.summer; c.innerHTML = ''; const g = document.createElement('div'); g.className = 'summer-grass'; c.appendChild(g); for (let i = 0; i < 8; i++) { const d = document.createElement('div'); d.className = `summer-cloud v${Math.floor(Math.random()*3)+1}`; const w = Math.random() * 100 + 100; d.style.width = `${w}px`; d.style.height = `${w*.35}px`; d.style.top = `${Math.random()*60}%`; d.style.animationDuration = `${Math.random()*60+60}s`; d.style.animationDelay = `-${Math.random()*100}s`; c.appendChild(d) } },
    
halloween(active) {
        if (this.spiderTimeout) clearTimeout(this.spiderTimeout);
        if (this.webRaf) cancelAnimationFrame(this.webRaf);
        
        // Arachnophobia Check
        const isSafeMode = State.data.settings.arachnophobiaMode;
        
        if (!active || isSafeMode) {
            const old = document.getElementById('spider-wrap');
            if (old) old.remove();
            const oldWeb = document.getElementById('spider-web-corner');
            if (oldWeb) oldWeb.remove();
            const style = document.getElementById('spider-motion-style');
            if (style) style.remove();
            return;
        }

        if (!document.getElementById('spider-motion-style')) {
            const s = document.createElement('style');
            s.id = 'spider-motion-style';
            s.innerHTML = `
                @keyframes spider-scuttle {
                    0% { transform: rotate(0deg); }
                    25% { transform: rotate(5deg); }
                    75% { transform: rotate(-5deg); }
                    100% { transform: rotate(0deg); }
                }
                .scuttling-motion {
                    animation: spider-scuttle 0.2s infinite linear;
                }
            `;
            document.head.appendChild(s);
        }

        let wrap = document.getElementById('spider-wrap');
        if (!wrap) {
            wrap = document.createElement('div');
            wrap.id = 'spider-wrap';
            Object.assign(wrap.style, {
                position: 'fixed', left: '50%', top: '-15vh', zIndex: '102',
                transition: 'left 4s ease-in-out', pointerEvents: 'none' 
            });
            
            const eaten = State.data.insectStats.eaten || 0;
            const scale = Math.min(0.6 + (eaten * 0.005), 1.3).toFixed(2);
            
            wrap.innerHTML = `
                <div id="spider-anchor" style="transform: scale(${scale}); transform-origin: top center;">
                    <div id="spider-thread" style="width: 2px; background: rgba(255,255,255,0.6); margin: 0 auto; height: 0; transition: height 4s ease-in-out;"></div>
                    <div id="spider-body" style="font-size: 3rem; margin-top: -10px; cursor: pointer; position: relative; z-index: 2; pointer-events: auto; transition: transform 1s ease;">
                        🕷️
                    </div>
                </div>`;
            document.body.appendChild(wrap);
            
            const body = wrap.querySelector('#spider-body');
            const thread = wrap.querySelector('#spider-thread');

            const showSpiderBubble = (text) => {
                // 1. Cleanup old bubble
                const old = document.getElementById('spider-bubble-dynamic');
                if (old) {
                    if (old.rafId) cancelAnimationFrame(old.rafId);
                    old.remove();
                }

                // 2. Create Elements
                const b = document.createElement('div');
                b.id = 'spider-bubble-dynamic';
                Object.assign(b.style, {
                    position: 'fixed', 
                    background: 'white', color: '#1f2937', padding: '8px 14px', 
                    borderRadius: '16px', fontSize: '14px', fontWeight: 'bold', 
                    fontFamily: 'sans-serif', whiteSpace: 'nowrap', width: 'max-content',
                    pointerEvents: 'none', opacity: '0', transition: 'opacity 0.2s', 
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)', border: '2px solid #1f2937',
                    zIndex: '200', willChange: 'top, left'
                });
                b.textContent = text;

                const arrow = document.createElement('div');
                Object.assign(arrow.style, {
                    position: 'absolute', width: '0', height: '0',
                    borderStyle: 'solid', pointerEvents: 'none'
                });
                b.appendChild(arrow);
                document.body.appendChild(b);

                const updatePosition = () => {
                    if (!b.parentNode) return; // Stop if removed

                    const spiderRect = body.getBoundingClientRect();
                    const bubRect = b.getBoundingClientRect();
                    const currentTransform = body.style.transform || '';
                    const gap = 15;

                    let rotation = 0;
                    if (currentTransform.includes('180deg')) rotation = 180;
                    else if (currentTransform.includes('90deg') && !currentTransform.includes('-90deg')) rotation = 90;
                    else if (currentTransform.includes('-90deg')) rotation = -90;

                    let top, left;

                    if (rotation === 0) {
                        // Upright: Bubble ABOVE
                        top = spiderRect.top - bubRect.height - gap;
                        left = spiderRect.left + (spiderRect.width / 2) - (bubRect.width / 2);
                        
                        Object.assign(arrow.style, {
                            bottom: '-8px', left: '50%', right: 'auto', top: 'auto',
                            transform: 'translateX(-50%) translateY(0)',
                            borderWidth: '8px 8px 0 8px',
                            borderColor: '#1f2937 transparent transparent transparent'
                        });
                    } 
                    else if (rotation === 180) {
                        top = spiderRect.bottom + gap;
                        left = spiderRect.left + (spiderRect.width / 2) - (bubRect.width / 2);
                        
                        Object.assign(arrow.style, {
                            top: '-8px', left: '50%', right: 'auto', bottom: 'auto',
                            transform: 'translateX(-50%) translateY(0)',
                            borderWidth: '0 8px 8px 8px',
                            borderColor: 'transparent transparent #1f2937 transparent'
                        });
                    }
                    else if (rotation === 90) {
                        // Climbing Right Wall: Bubble LEFT
                        top = spiderRect.top + (spiderRect.height / 2) - (bubRect.height / 2);
                        left = spiderRect.left - bubRect.width - gap;
                        
                        Object.assign(arrow.style, {
                            right: '-8px', top: '50%', left: 'auto', bottom: 'auto',
                            transform: 'translateY(-50%) translateX(0)',
                            borderWidth: '8px 0 8px 8px',
                            borderColor: 'transparent transparent transparent #1f2937'
                        });
                    }
                    else if (rotation === -90) {
                        // Climbing Left Wall: Bubble RIGHT
                        top = spiderRect.top + (spiderRect.height / 2) - (bubRect.height / 2);
                        left = spiderRect.right + gap;
                        
                        Object.assign(arrow.style, {
                            left: '-8px', top: '50%', right: 'auto', bottom: 'auto',
                            transform: 'translateY(-50%) translateX(0)',
                            borderWidth: '8px 8px 8px 0',
                            borderColor: 'transparent #1f2937 transparent transparent'
                        });
                    }

                    if (left < 10) left = 10;
                    if (left + bubRect.width > window.innerWidth - 10) left = window.innerWidth - bubRect.width - 10;
                    if (top < 10) top = 10;
                    if (top + bubRect.height > window.innerHeight - 10) top = window.innerHeight - bubRect.height - 10;

                    b.style.top = `${top}px`;
                    b.style.left = `${left}px`;

                    b.rafId = requestAnimationFrame(updatePosition);
                };
	
                requestAnimationFrame(() => {
                    b.style.opacity = '1';
                    updatePosition();
                });

                // 5. Cleanup Timer
                setTimeout(() => {
                    if (b.parentNode) {
                        b.style.opacity = '0'; 
                        setTimeout(() => {
                            if (b.rafId) cancelAnimationFrame(b.rafId);
                            b.remove();
                        }, 300);
                    }
                }, 2000);
                
                return b;
            };
			
            wrap.showBubble = showSpiderBubble; // Attach to DOM for external use

            body.onclick = (e) => {
                e.stopPropagation();
                State.unlockBadge('spider');
                const willFall = Math.random() < 0.2; 
                const lines = willFall ? GAME_DIALOGUE.spider.pokeGrumpy : GAME_DIALOGUE.spider.pokeHappy;
                const text = lines[Math.floor(Math.random() * lines.length)];
                
                showSpiderBubble(text); // Helper auto-detects orientation
                body.style.animation = 'shake 0.3s ease-in-out';
                
                if (willFall) {
                    if (this.spiderTimeout) clearTimeout(this.spiderTimeout);
                    setTimeout(() => { this.spiderFall(wrap, thread, body); }, 400); 
                } else {
                    setTimeout(() => { body.style.animation = ''; }, 2000);
                }
            };
        }

        const body = wrap.querySelector('#spider-body');
        const thread = wrap.querySelector('#spider-thread');
        
        const runDrop = () => {
            if (!document.body.contains(wrap)) return;
            if (wrap.classList.contains('hunting')) return;
            
            const actionRoll = Math.random();
            body.style.transform = 'rotate(0deg)'; 
            body.classList.remove('scuttling-motion'); // Stop shaking
            thread.style.opacity = '1'; 

            if (actionRoll < 0.7) {
                const safeLeft = Math.random() * 60 + 20;
                // SLOW MOVE (8s)
                wrap.style.transition = 'left 8s ease-in-out'; 
                body.classList.add('scuttling-motion'); // Start Scuttling
                wrap.style.left = safeLeft + '%';
                
                this.spiderTimeout = setTimeout(() => {
                    if (wrap.classList.contains('hunting')) return;
					
					const greeting_base = Game.getSpiderGreeting(); // Get time-based greeting
                         const phrases = (typeof GAME_DIALOGUE !== 'undefined' && GAME_DIALOGUE.spider && GAME_DIALOGUE.spider.idle) ? GAME_DIALOGUE.spider.idle : ['Boo!', 'Hi!', '🕷️'];
                         const random_phrase = phrases[Math.floor(Math.random() * phrases.length)];
                         const text = `${greeting_base}, ${random_phrase}`; // Combine greeting and phrase
					
                    body.classList.remove('scuttling-motion'); // Stop Scuttling
                    
                    // 1. Flip Body UPSIDE DOWN
                    body.style.transform = 'rotate(180deg)'; 
                    
                    // 2. Short Drop
                    thread.style.transition = 'height 2.5s ease-in-out'; 
                    thread.style.height = '18vh'; 
                    
                    setTimeout(() => {
                         if (wrap.classList.contains('hunting')) return;
                         const phrases = (typeof GAME_DIALOGUE !== 'undefined' && GAME_DIALOGUE.spider && GAME_DIALOGUE.spider.idle) ? GAME_DIALOGUE.spider.idle : ['Boo!', 'Hi!', '🕷️'];
                         const text = phrases[Math.floor(Math.random() * phrases.length)];
                         
                         // 3. FORCE 'upside-down' flag so text is correct
                         if(wrap.showBubble) wrap.showBubble(text, 'upside-down'); 
                         
                         setTimeout(() => {
                             if (wrap.classList.contains('hunting')) return;
                             thread.style.height = '0'; 
                             this.spiderTimeout = setTimeout(runDrop, Math.random() * 5000 + 5000);
                         }, 2500); 
                    }, 2500);
                }, 8000);
                return;
            }
    
            if (actionRoll < 0.9) {
                const isLeft = Math.random() > 0.5;
                const wallX = isLeft ? 5 : 85; 
    
                wrap.style.transition = 'left 8s ease-in-out';
                body.classList.add('scuttling-motion');
                wrap.style.left = wallX + '%';
                
                this.spiderTimeout = setTimeout(() => {
                    if (wrap.classList.contains('hunting')) return;
                    body.classList.remove('scuttling-motion');
                    
                    thread.style.opacity = '0'; 
                    body.style.transform = `rotate(${isLeft ? 90 : -90}deg)`;
                    
                    const climbDepth = Math.random() * 40 + 30; 
                    thread.style.transition = 'height 4s ease-in-out';
                    thread.style.height = climbDepth + 'vh';
                    
                    setTimeout(() => {
                         if (wrap.classList.contains('hunting')) return;
                         thread.style.height = '0'; 
                         setTimeout(() => {
                             body.style.transform = 'rotate(0deg)';
                             thread.style.opacity = '1'; 
                             this.spiderTimeout = setTimeout(runDrop, Math.random() * 5000 + 5000);
                         }, 4000);
                    }, 5000);
                }, 8000);
                return;
            }

            const safeLeft = Math.random() * 60 + 20; 
            wrap.style.transition = 'left 8s ease-in-out'; // SLOW
            body.classList.add('scuttling-motion');
            wrap.style.left = safeLeft + '%';
            
            this.spiderTimeout = setTimeout(() => {
                body.classList.remove('scuttling-motion');
                runDrop();
            }, 8000);
        };
        
        this.spiderTimeout = setTimeout(runDrop, 1000);

        if (!document.getElementById('spider-web-corner')) {
            const web = document.createElement('div');
            web.id = 'spider-web-corner';
            web.innerHTML = `<svg id="web-svg" viewBox="0 0 300 300" style="width:300px;height:300px;position:fixed;top:0;right:0;z-index:55;pointer-events:auto;cursor:pointer;opacity:0.7;filter:drop-shadow(1px 1px 2px rgba(0,0,0,0.5))"></svg>`;
            document.body.appendChild(web);
            
            web.onclick = () => {
                if (MosquitoManager.state === 'stuck') {
                    this.spiderHunt(MosquitoManager.x, MosquitoManager.y, true);
                } else {
					State.data.insectStats.teased = (State.data.insectStats.teased || 0) + 1;
                    State.save('insectStats', State.data.insectStats);
                    if (State.data.insectStats.teased >= 50) State.unlockBadge('prankster');
                    this.spiderHunt(88, 20, false); 
                }
            };
            
            const svg = document.getElementById('web-svg');
            const cx = 300, cy = 0;
            const baseAnchors = [{ x: 0, y: 0 }, { x: 60, y: 100 }, { x: 140, y: 200 }, { x: 220, y: 270 }, { x: 300, y: 300 }];
            
            const animateWeb = () => {
                const time = Date.now();
                let pathStr = '';
                const curAnchors = baseAnchors.map((a, i) => {
                    if (i === 0 || i === baseAnchors.length - 1) return a;
                    const sway = Math.sin((time / 1500) + i) * 15; 
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
    
spiderHunt(targetXPercent, targetYPercent, isFood) {
        const wrap = document.getElementById('spider-wrap');
        if (!wrap) return;
        const thread = wrap.querySelector('#spider-thread');
        const body = wrap.querySelector('#spider-body');
        
        // STOP SCUTTLE if attacking
        body.classList.remove('scuttling-motion');

        if (this.spiderTimeout) clearTimeout(this.spiderTimeout);
        wrap.classList.add('hunting');
        
        let phrases = isFood ? GAME_DIALOGUE.spider.hunting : GAME_DIALOGUE.spider.trickedStart;
        const text = phrases[Math.floor(Math.random() * phrases.length)];
        const bub = wrap.showBubble ? wrap.showBubble(text) : null;

        const destX = isFood ? targetXPercent : 88;
        const destY = isFood ? targetYPercent : 20;
        const currentX = parseFloat(wrap.style.left) || 50;
        const dist = Math.abs(currentX - destX);
    
        const moveTime = Math.max(dist * 12, 800); 
        
        wrap.style.transition = `left ${moveTime}ms ease-in-out`;
        wrap.style.left = destX + '%';
        body.style.transform = 'rotate(0deg)';
        
        this.spiderTimeout = setTimeout(() => {
            const anchor = document.getElementById('spider-anchor');
            let scale = 1;
            if (anchor && anchor.style.transform) {
                const match = anchor.style.transform.match(/scale\(([^)]+)\)/);
                if (match) scale = parseFloat(match[1]);
            }
            const dropVH = (destY + 10) / scale; 
            thread.style.transition = 'height 3s cubic-bezier(0.45, 0, 0.55, 1)'; 
            thread.style.height = dropVH + 'vh';

            setTimeout(() => { 
                setTimeout(() => {
                    if (isFood && MosquitoManager.state === 'stuck') {
                        // 1. SUCCESSFUL HUNT
                        MosquitoManager.eat();
                        if(wrap.showBubble) wrap.showBubble("YUM!");
                        
                        body.style.animation = 'shake 0.2s ease-in-out';
                        setTimeout(() => {
                            body.style.animation = '';
                            this.retreatSpider(thread, wrap, bub, '4s');
                        }, 1000);
                    } 
                    else {
                        // 2. FAILED HUNT (Either Missed or Tricked)
                        let phrases;
                        
                        if (isFood) {
                            // Food WAS there, but is gone now -> MISSED
                            phrases = GAME_DIALOGUE.spider.missed; 
                        } else {
                            // Food was never there -> TRICKED
                            phrases = GAME_DIALOGUE.spider.trickedEnd; 
                        }

                        // Pick random phrase (handles both Array and String to be safe)
                        const text = Array.isArray(phrases) ? phrases[Math.floor(Math.random() * phrases.length)] : phrases;
                        
                        if(wrap.showBubble) wrap.showBubble(text);
                        
                        body.style.animation = 'shake 0.3s ease-in-out';
                        setTimeout(() => {
                            body.style.animation = '';
                            this.retreatSpider(thread, wrap, bub, '4s');
                        }, 1500);
                    }
                }, 2000); // Reaction delay
            }, 3000); // Drop duration
        }, moveTime); // Horizontal move duration
    },

    spiderFall(wrap, thread, body, bub) {
        if(bub) {
            bub.style.opacity = '0';
            setTimeout(() => bub.remove(), 300);
        }
        thread.style.transition = 'height 0.8s cubic-bezier(0.55, 0.085, 0.68, 0.53), opacity 0s linear';
        thread.style.opacity = '0'; 
        
        requestAnimationFrame(() => { thread.style.height = '120vh'; });
        
        setTimeout(() => {
            thread.style.transition = 'none';
            wrap.style.transition = 'none';
            wrap.style.left = '88%'; 
            thread.style.height = '120vh'; 
            void wrap.offsetWidth; 
            thread.style.opacity = '1';
            
            requestAnimationFrame(() => {
                thread.style.transition = 'height 5s ease-in-out';
                thread.style.height = '0'; 
            });
            wrap.classList.remove('hunting');
            setTimeout(() => this.halloween(true), 6000);
        }, 1500);
    },

    retreatSpider(thread, wrap, bub, duration) {
        thread.style.transition = `height ${duration} ease-in-out`;
        requestAnimationFrame(() => { thread.style.height = '0'; });
        setTimeout(() => {
            if(bub) bub.remove();
            wrap.classList.remove('hunting');
            this.halloween(true);
        }, parseFloat(duration) * 1000);
    },

    ballpit(active) {
        const c = DOM.theme.effects.ballpit;
        if (this.ballLoop) cancelAnimationFrame(this.ballLoop);
        if (!active) { 
            c.innerHTML = ''; 
            window.removeEventListener('deviceorientation', Physics.handleOrientation); 
            const inst = document.getElementById('ballpit-instruction');
            if (inst) inst.remove();
            return 
        }
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
            
            // Add will-change for performance
            Object.assign(el.style, { willChange: 'transform' });

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
        
        // REDUCED BALL COUNT
        for (let i = 0; i < 25; i++) addBall(Math.random() < 0.005 ? 'rare' : 'normal');
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
        
        // ADD INSTRUCTION BANNER
        let instEl = document.getElementById('ballpit-instruction');
        if (!instEl) {
            instEl = document.createElement('div');
            instEl.id = 'ballpit-instruction';
            instEl.innerHTML = '⚠️ Works best with auto-rotate turned off 🕊️';
            Object.assign(instEl.style, {
                position: 'fixed', bottom: '0', left: '0', right: '0', 
                backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                color: '#1f2937', padding: '10px', 
                textAlign: 'center', fontWeight: 'bold', 
                zIndex: '1000' 
            });
            document.body.appendChild(instEl);
        }
        
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


const ShareManager = {

    async shareQR(type) {
        const word = State.runtime.allWords[State.runtime.currentWordIndex].text;
        UIManager.showPostVoteMessage("Generating QR Code... 📷");

        const messages = [
            `Scan to vote on "${word}"!`,
            `I need your help with "${word}"`,
            `Is "${word}" good or bad?`,
            `Settle a debate: "${word}"`,
            `Quick vote needed on "${word}"`
        ];
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];

        const targetUrl = `${window.location.origin}/?word=${encodeURIComponent(word)}`;
        const color = type === 'good' ? '16a34a' : 'dc2626';
        const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&color=${color}&margin=20&data=${encodeURIComponent(targetUrl)}`;

        try {
            const response = await fetch(apiUrl);
            const blob = await response.blob();
            const file = new File([blob], `${word}_${type}_qr.png`, { type: 'image/png' });

            const shareData = {
                title: `Vote ${type} on ${word}!`,
                text: randomMsg,
                files: [file]
            };

            if (navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
            } else {
                // Fallback for desktop/unsupported browsers
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `${word}_${type}_qr.png`;
                a.click();
                UIManager.showPostVoteMessage("QR Code downloaded!");
            }
        } catch (e) {
            console.error(e);
            UIManager.showPostVoteMessage("Could not generate QR.");
        }
    },

    async generateImage() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const width = 1080;
        const height = 1350;
        canvas.width = width;
        canvas.height = height;

        // 1. Background (Gradient)
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, '#4f46e5');
        grad.addColorStop(1, '#9333ea');
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

        // 4. Primary Stats Grid (Top Half)
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
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(x, y, boxW, boxH, 20);
            else ctx.fillRect(x, y, boxW, boxH);
            ctx.fill();

            // Icon
            ctx.font = '50px serif';
            ctx.textAlign = 'left';
            ctx.fillText(stat.icon, x + 30, y + 105);

            // Value
            ctx.fillStyle = stat.text;
            ctx.font = 'bold 50px Inter, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(stat.val, x + boxW - 30, y + 90);

            // Label
            ctx.fillStyle = '#6b7280';
            ctx.font = 'bold 20px Inter, sans-serif';
            ctx.fillText(stat.label.toUpperCase(), x + boxW - 30, y + 130);
        });

        // 5. Collection Progress (Bottom Half - Teaser Style)
        const progressY = gridY + (2 * (boxH + gap)) + 60;

        // Separator Line
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(margin + 40, progressY);
        ctx.lineTo(width - margin - 40, progressY);
        ctx.stroke();

        ctx.fillStyle = '#374151';
        ctx.font = 'bold 30px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("COLLECTION PROGRESS", width / 2, progressY + 60);

        const catKeys = {
            words: ['cake', 'llama', 'potato', 'squirrel', 'spider', 'germ', 'bone'],
            items: ['poop', 'penguin', 'scorpion', 'mushroom', 'needle', 'diamond', 'rock', 'chopper', 'snowman', 'fish', 'tropical', 'puffer', 'shark'],
            achievements: ['exterminator', 'saint', 'prankster', 'judge', 'bard', 'traveler', 'angler', 'shepherd']
        };

        const getCount = (keys) => keys.filter(k => State.data.badges[k]).length;

        const collections = [
            { label: 'Hidden Words', count: getCount(catKeys.words), total: catKeys.words.length, color: '#f59e0b' },
            { label: 'Secret Items', count: getCount(catKeys.items), total: catKeys.items.length, color: '#ec4899' },
            { label: 'Achievements', count: getCount(catKeys.achievements), total: catKeys.achievements.length, color: '#10b981' }
        ];

        let circleX = width / 2 - 300;
        const circleY = progressY + 180;

        collections.forEach((col, i) => {
            const x = (width / 4) * (i + 1);

            // Draw Ring Background
            ctx.beginPath();
            ctx.arc(x, circleY, 70, 0, 2 * Math.PI);
            ctx.strokeStyle = '#f3f4f6';
            ctx.lineWidth = 15;
            ctx.stroke();

            // Draw Progress Ring
            const pct = col.count / col.total;
            ctx.beginPath();
            ctx.arc(x, circleY, 70, -0.5 * Math.PI, (2 * pct * Math.PI) - 0.5 * Math.PI);
            ctx.strokeStyle = col.color;
            ctx.lineWidth = 15;
            ctx.lineCap = 'round';
            ctx.stroke();

            // Draw Text
            ctx.fillStyle = '#1f2937';
            ctx.font = 'bold 40px Inter, sans-serif';
            ctx.fillText(`${col.count}/${col.total}`, x, circleY + 15);

            ctx.fillStyle = '#6b7280';
            ctx.font = 'bold 18px Inter, sans-serif';
            ctx.fillText(col.label.toUpperCase(), x, circleY + 130);
        });

        // 6. Footer
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';

        // Teaser Text
        ctx.font = 'italic 30px serif';
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fillText("Can you find them all?", width / 2, height - 120);

        // URL
        ctx.font = 'bold 40px Inter, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText("GBword.com", width / 2, height - 60);

        return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    },

    async share() {
        UIManager.showPostVoteMessage("Generating image...");
        try {
            const blob = await this.generateImage();
            const file = new File([blob], 'gbword-stats.png', { type: 'image/png' });

            const shareData = {
                title: 'My Progress',
                text: `I've found ${Object.values(State.data.badges).filter(Boolean).length} secrets in Good Word / Bad Word! Can you beat my streak? 🗳️`,
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

        const saved = d.insectStats.saved;
        const eaten = d.insectStats.eaten;
        let karmaTitle = "Garden Observer";
        
        if (saved > 20 && saved > eaten) karmaTitle = "Friend of Bugs 🐞";
        if (saved > 50 && saved > eaten) karmaTitle = "Guardian of the Garden 🌿";
        if (eaten > 20 && eaten > saved) karmaTitle = "Spider Feeder 🕸️";
        if (eaten > 50 && eaten > saved) karmaTitle = "Spider Sympathiser 🕷️";
        if (saved > 50 && eaten > 50) karmaTitle = "Lord of the Flies 👑";
        if (d.badges.chopper) karmaTitle = "Air Traffic Controller 🚁";
        if (d.badges.angler) karmaTitle = "The Best in Brixham 🎣";

        DOM.profile.statsTitle.innerHTML = `${d.username ? d.username + "'s" : "Your"} Stats 
            <span id="profileGiftBtn" class="cursor-pointer ml-2 text-xl hover:scale-125 inline-block transition-transform filter drop-shadow-sm" title="Claim Free Gift">🎁</span>
            <br><span class="text-xs text-indigo-500 font-bold uppercase tracking-widest mt-1 block">${karmaTitle}</span>`;

        setTimeout(() => {
            const giftBtn = document.getElementById('profileGiftBtn');
            if (giftBtn) {
                giftBtn.onclick = (e) => {
                    e.stopPropagation();
                    ModalManager.toggle('profile', false); // Close profile
                    if (window.PromoManager) window.PromoManager.open(); // Open gift form
                };
            }
        }, 0);

		setTimeout(() => {
            const giftBtn = document.getElementById('profileGiftBtn');
            if (giftBtn) {
                giftBtn.onclick = (e) => {
                    e.stopPropagation();
                    ModalManager.toggle('profile', false); // Close profile
                    PromoManager.open(); // Open gift form
                };
            }
        }, 0);
		
        const totalAvailable = Object.keys(CONFIG.THEME_SECRETS).length + 1;
        const userCount = d.unlockedThemes.length + 1;
        DOM.profile.themes.textContent = `${userCount} / ${totalAvailable}`;
        const streakEl = document.getElementById('streak-display-value');
        if(streakEl) streakEl.textContent = (State.data.longestStreak || 0) + " Words";
		
        const row1 = [
            { k: 'cake', i: '🎂', w: 'CAKE' }, 
            { k: 'llama', i: '🦙', w: 'LLAMA' }, 
            { k: 'potato', i: '🥔', w: 'POTATO' }, 
            { k: 'squirrel', i: '🐿️', w: 'SQUIRREL' }, 
            { k: 'spider', i: '🕷️', w: 'SPIDER' }, 
            { k: 'germ', i: '🦠', w: 'GERM' }, 
            { k: 'bone', i: '🦴', w: 'MASON' }
        ];
        
        const row2 = [
            { k: 'poop', i: '💩', d: 'squelch.' }, 
            { k: 'penguin', i: '🐧', d: 'noot noot!' }, 
            { k: 'scorpion', i: '🦂', d: 'I am in your tent.' }, 
            { k: 'mushroom', i: '🍄', d: 'edible once.' }, 
            { k: 'needle', i: '💉', d: 'wheedle, wheedle, pry and needle' }, 
            { k: 'diamond', i: '💎', d: 'hidden Gem.' },
            { k: 'rock', i: '🤘', d: 'space rock!' }, 
            { k: 'chopper', i: '🚁', d: 'Get to the choppa!' }, 
            { k: 'snowman', i: '⛄', d: "# We're walking in the air..." }
        ];
        
        const row_fish = [
            { k: 'fish', i: '🐟', t: 'Blue Fish', d: 'A standard catch.' }, 
            { k: 'tropical', i: '🐠', t: 'Tropical Fish', d: 'Found in the deep.' }, 
            { k: 'puffer', i: '🐡', t: 'Pufferfish', d: 'Spiky friend.' }, 
            { k: 'shark', i: '🦈', t: 'Shark', d: 'Gonna need a bigger boat.' },
            { k: 'octopus', i: '🐙', t: 'The Kraken', d: 'Ink-credible!' }
        ];
        
        const row3 = [
            { k: 'exterminator', i: '☠️', t: 'The Exterminator', d: 'Fed 100 bugs to the spider' }, 
            { k: 'saint', i: '😇', t: 'The Saint', d: 'Saved 100 bugs from the web' }, 
            { k: 'prankster', i: '🃏', t: 'Original Prankster', d: 'Teased the spider 50 times' },
            { k: 'judge', i: '⚖️', t: 'The Judge', d: 'Cast 1,000 votes!' },
            { k: 'bard', i: '✍️', t: 'The Bard', d: 'Contributed 5 accepted words' },
            { k: 'traveler', i: '🌍', t: 'The Traveller', d: 'Unlocked 5 different themes' },
            { k: 'angler', i: '🔱', t: 'The Best in Brixham', d: 'Caught 250 fish' },
            { k: 'shepherd', i: '🛟', t: 'Sea Shepherd', d: 'Chose to let 250 fish swim away safely' }
        ];

        const renderRow = (list) => `<div class="flex flex-wrap justify-center gap-3 text-3xl w-full">` + list.map(x => {
            const un = d.badges[x.k];
            const defTitle = x.k.charAt(0).toUpperCase() + x.k.slice(1);
            return `<span class="badge-item relative ${un?'':'opacity-25 grayscale'} transition-all duration-300 transform ${un?'hover:scale-125 cursor-pointer':''}" 
                    title="${un? (x.t || defTitle) : 'Locked'}" 
                    data-key="${x.k}"
                    ${x.w ? `data-word="${x.w}"` : ''} 
                    data-title="${x.t || defTitle}" 
                    data-desc="${x.d || 'Keep playing to find this item!'}"
                    >${x.i}</span>`
        }).join('') + `</div>`;

        let bugJarHTML = '';
        if (saved > 0) {
            const bugCount = Math.min(saved, 40);
            let bugsStr = '';
            for(let i=0; i<bugCount; i++) {
                bugsStr += `<span class="jar-bug" style="cursor: pointer; display: inline-block; padding: 2px; transition: transform 0.1s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">🦟</span>`;
            }
            bugJarHTML = `<div class="w-full text-center my-4 p-3 bg-green-50 rounded-xl border border-green-100 relative overflow-hidden">
                <div class="text-[10px] font-bold text-green-600 mb-1 uppercase tracking-wider">The Bug Jar (${saved})</div>
                <div id="jar-container" class="text-xl leading-6 opacity-90 break-words" style="letter-spacing: 1px;">
                    ${bugsStr}
                </div>
                ${State.data.currentTheme === 'halloween' ? '<div class="text-[9px] text-green-500 mt-1 italic">Tap a bug to feed the spider!</div>' : ''}
            </div>`;
        }

        let bugHotelHTML = '';
        const splattedCount = State.data.insectStats.splatted || 0;
        const collection = State.data.insectStats.collection || [];
        
        // Define types: Helicopter is the Hotel (Red), others are Houses (Green)
        const bugTypes = [
            { char: '🦟', type: 'house' }, // Mosquito
            { char: '🐞', type: 'house' }, // Ladybird
            { char: '🐝', type: 'house' }, // Bee
            { char: '🚁', type: 'hotel' }  // Chopper
        ];
        
        const requiredChars = bugTypes.map(b => b.char);
        const isComplete = requiredChars.every(c => collection.includes(c));

        if (splattedCount > 0 || collection.length > 0) {
            let innerHTML = '';
            
            if (isComplete) {
                innerHTML = `<div class="flex justify-center gap-3 filter drop-shadow-sm mb-1">`;
                
                bugTypes.forEach(bug => {
                    // Green border for Houses, Red for Hotel
                    const style = bug.type === 'hotel' 
                        ? 'border-2 border-red-500 bg-red-100 rounded-md shadow-sm text-2xl px-2 py-1' 
                        : 'border-2 border-green-500 bg-green-100 rounded-md shadow-sm text-2xl px-2 py-1';
                        
                    innerHTML += `<span class="${style}">${bug.char}</span>`;
                });
                innerHTML += `</div><div class="text-[9px] text-green-700 mt-1 font-bold uppercase tracking-widest">Monopoly Complete!</div>`;
                
                bugHotelHTML = `<div class="w-full text-center my-4 p-3 bg-green-50 rounded-xl border-2 border-green-500 relative overflow-hidden shadow-md" title="You've completed capitalism">
                    <div class="absolute top-0 right-0 bg-green-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">WINNER</div>
                    <div class="text-[10px] font-bold text-green-800 mb-3 uppercase tracking-wider">Bug Street Completed</div>
                    ${innerHTML}
                </div>`;
                
            } else {

                innerHTML = `<div class="flex justify-center gap-2 flex-wrap">`;
                
                bugTypes.forEach(bug => {
                    const hasIt = collection.includes(bug.char);
                    if (hasIt) {
                         const style = bug.type === 'hotel' 
                            ? 'border-2 border-red-400 bg-white opacity-80' 
                            : 'border-2 border-green-400 bg-white opacity-80';
                         innerHTML += `<span class="inline-block p-1 rounded-md ${style} text-2xl">${bug.char}</span>`;
                    } else {
                         // Placeholder
                         innerHTML += `<span class="inline-block p-1 rounded-md border-2 border-dashed border-gray-300 text-2xl grayscale opacity-30">${bug.char}</span>`;
                    }
                });
                innerHTML += `</div>`;
                
                bugHotelHTML = `<div class="w-full text-center my-4 p-3 bg-stone-100 rounded-xl border border-stone-200 relative overflow-hidden">
                    <div class="text-[10px] font-bold text-stone-500 mb-2 uppercase tracking-wider">Bug Street (${collection.length}/4)</div>
                    ${innerHTML}
                    <div class="text-[9px] text-stone-400 mt-2 italic">Splat different bugs to collect them!</div>
                </div>`;
            }
        }
        
        const b = DOM.profile.badges;
        	b.innerHTML = 
            `<div class="text-xs font-bold text-gray-500 uppercase mb-2 mt-2">🏆 Word Badges</div>` + renderRow(row1) + 
            `<div class="h-px bg-gray-100 w-full my-4"></div><div class="text-xs font-bold text-gray-500 uppercase mb-2">🧸 Found Items</div>` + renderRow(row2) + 
            `<div class="h-px bg-gray-100 w-full my-4"></div><div class="text-xs font-bold text-gray-500 uppercase mb-2">🌊 Aquarium</div>` + renderRow(row_fish) + 
            
            // 1. The Bug Jar (Live Bugs) - MOVED HERE
            bugJarHTML +

            // 2. Bug Street (Collection)
            bugHotelHTML + 

            `<div class="h-px bg-gray-100 w-full my-4"></div><div class="text-xs font-bold text-gray-500 uppercase mb-2">🎖️ Achievements</div>` + renderRow(row3);

        const showTooltip = (targetEl, title, desc) => {
            document.querySelectorAll('.global-badge-tooltip').forEach(t => t.remove());
            const tip = document.createElement('div');
            tip.className = 'global-badge-tooltip';
            Object.assign(tip.style, {
                position: 'fixed', backgroundColor: '#1f2937', color: 'white', padding: '8px 12px', 
                borderRadius: '8px', fontSize: '12px', textAlign: 'center', width: 'max-content', 
                maxWidth: '200px', zIndex: '9999', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', 
                pointerEvents: 'none', lineHeight: '1.4', opacity: '0', transition: 'opacity 0.2s'
            });
            tip.innerHTML = `<div class="font-bold text-yellow-300 mb-1 text-sm border-b border-gray-600 pb-1">${title}</div><div class="text-gray-200">${desc}</div>`;
            const arrow = document.createElement('div');
            Object.assign(arrow.style, {
                position: 'absolute', top: '100%', left: '50%', marginLeft: '-6px',
                borderWidth: '6px', borderStyle: 'solid', borderColor: '#1f2937 transparent transparent transparent'
            });
            tip.appendChild(arrow);
            document.body.appendChild(tip);
            const rect = targetEl.getBoundingClientRect();
            const tipHeight = tip.offsetHeight || 60; 
            tip.style.top = (rect.top - tipHeight - 12) + 'px'; 
            tip.style.left = (rect.left + rect.width / 2) + 'px';
            tip.style.transform = 'translateX(-50%)';
            requestAnimationFrame(() => tip.style.opacity = '1');
            targetEl.style.transform = "scale(1.2)";
            setTimeout(() => targetEl.style.transform = "", 200);
            setTimeout(() => { 
                tip.style.opacity = '0';
                setTimeout(() => { if(tip.parentNode) tip.remove(); }, 200);
            }, 3000);
        };

        b.querySelectorAll('.badge-item').forEach(el => {
            el.onclick = (e) => {
                e.stopPropagation();
                const isLocked = el.classList.contains('grayscale');
                if (isLocked) {
                    let desc = "Keep playing to unlock!";
                    if (el.dataset.word) desc = "Find the hidden word to unlock.";
                    else if (['poop','penguin','scorpion','mushroom','needle','diamond'].includes(el.dataset.key)) desc = "Find this item!";
                    showTooltip(el, "Locked: " + el.dataset.title, desc);
                    return;
                }
                if (el.dataset.word) {
                    Game.loadSpecial(el.dataset.word);
                    ModalManager.toggle('profile', false);
                } else {
                    showTooltip(el, el.dataset.title, el.dataset.desc);
                }
            }
        });
        const jarBugs = b.querySelectorAll('.jar-bug');
        jarBugs.forEach(bug => {
            bug.onclick = (e) => {
                e.stopPropagation();
                if (State.data.settings.arachnophobiaMode) {
                     showTooltip(bug, "Spider Hidden", "You can't feed the spider while Arachnophobia Mode is on!");
                     return;
                }
                if (State.data.currentTheme !== 'halloween') {
                    showTooltip(bug, "Spider Missing", "Please visit the spider on the Halloween theme to feed");
                    return;
                }
                ModalManager.toggle('profile', false);
                State.data.insectStats.saved = Math.max(0, State.data.insectStats.saved - 1);
                State.save('insectStats', State.data.insectStats);
                if (typeof MosquitoManager !== 'undefined') MosquitoManager.spawnStuck('🦟');
                UIManager.showPostVoteMessage("Feeding time! 🕷️");
            };
        });
        ModalManager.toggle('profile', true);
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
    },
    updateOfflineIndicator() {
        let ind = document.getElementById('offlineIndicator');
        if (!ind) {
            ind = document.createElement('div');
            ind.id = 'offlineIndicator';
            ind.className = 'fixed bottom-4 left-4 bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-50 transition-opacity duration-500 pointer-events-none';
            ind.innerHTML = '🚇 OFFLINE MODE';
            document.body.appendChild(ind);
        }
        if (OfflineManager.isActive()) {
            const pendingCount = State.data.pendingVotes ? State.data.pendingVotes.length : 0;
            ind.style.opacity = '1';
            ind.innerHTML = `🚇 OFFLINE (${pendingCount})`;
        } else {
            ind.style.opacity = '0';
        }
    }
};
	
const PinPad = {
    input: '',
    mode: 'set', // 'set' or 'verify'
    onSuccess: null,
    onCancel: null,
    
    // Security Constants
    MAX_ATTEMPTS: 3,
    LOCKOUT_MS: 60000, // 60 seconds

    init() {
        if (document.getElementById('pinPadModal')) return;
        const el = document.createElement('div');
        el.id = 'pinPadModal';
        el.className = 'fixed inset-0 bg-gray-900 bg-opacity-95 z-[200] hidden flex items-center justify-center';
        
        el.innerHTML = `
            <div class="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl transform transition-all scale-100">
                <h3 id="pinTitle" class="text-2xl font-bold text-center mb-2 text-gray-800">Parent Lock</h3>
                <p id="pinSubtitle" class="text-gray-500 text-center mb-6 text-sm transition-colors duration-200">Enter PIN</p>
                
                <div id="pinDots" class="flex justify-center gap-4 mb-8">
                    <div class="w-4 h-4 rounded-full bg-gray-200 border-2 border-gray-100"></div>
                    <div class="w-4 h-4 rounded-full bg-gray-200 border-2 border-gray-100"></div>
                    <div class="w-4 h-4 rounded-full bg-gray-200 border-2 border-gray-100"></div>
                    <div class="w-4 h-4 rounded-full bg-gray-200 border-2 border-gray-100"></div>
                </div>

                <div class="grid grid-cols-3 gap-4 mb-6">
                    ${[1,2,3,4,5,6,7,8,9].map(n => 
                        `<button onclick="PinPad.handleInput('${n}')" class="h-16 w-16 rounded-full bg-gray-100 text-2xl font-bold text-gray-700 active:bg-gray-200 active:scale-95 transition-all mx-auto flex items-center justify-center">${n}</button>`
                    ).join('')}
                    <div class="h-16 w-16"></div>
                    <button onclick="PinPad.handleInput('0')" class="h-16 w-16 rounded-full bg-gray-100 text-2xl font-bold text-gray-700 active:bg-gray-200 active:scale-95 transition-all mx-auto flex items-center justify-center">0</button>
                    <button onclick="PinPad.handleInput('back')" class="h-16 w-16 rounded-full bg-red-50 text-red-500 active:bg-red-100 active:scale-95 transition-all mx-auto flex items-center justify-center">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z"></path></svg>
                    </button>
                </div>
                
                <button onclick="PinPad.close()" class="w-full py-3 text-gray-500 font-semibold active:text-gray-700">Cancel</button>
            </div>
        `;
        document.body.appendChild(el);
    },

    open(mode, onSuccess, onCancel) {
        this.init();
        
        if (mode === 'verify' && this.isLocked()) {
             const remaining = Math.ceil((this.getLockoutTime() - Date.now()) / 1000);
             // Ensure the user sees this
             alert(`System is locked for ${remaining} more seconds.`);
             return;
        }

        this.mode = mode || 'verify';
        this.onSuccess = onSuccess;
        this.onCancel = onCancel;
        this.input = '';
        this.updateDisplay();
        
        const m = document.getElementById('pinPadModal');
        const t = document.getElementById('pinTitle');
        const s = document.getElementById('pinSubtitle');
        
        if (this.mode === 'set') {
            t.textContent = "Create PIN";
            s.textContent = "Set a 4-digit code for parents";
            s.className = "text-gray-500 text-center mb-6 text-sm";
        } else {
            t.textContent = "Parent Lock";
            s.textContent = "Enter PIN to unlock settings";
            s.className = "text-gray-500 text-center mb-6 text-sm";
        }
        m.classList.remove('hidden');
    },

    close(success = false) {
        const el = document.getElementById('pinPadModal');
        if (el) el.classList.add('hidden');
        if (!success && this.onCancel) this.onCancel();
    },

    handleInput(val) {
        Haptics.light();
        if (val === 'back') {
            this.input = this.input.slice(0, -1);
        } else if (this.input.length < 4) {
            this.input += val;
        }
        this.updateDisplay();
        if (this.input.length === 4) {
            setTimeout(() => this.submit(), 300);
        }
    },

    updateDisplay() {
        const dots = document.querySelectorAll('#pinDots div');
        dots.forEach((d, i) => {
            if (i < this.input.length) {
                d.className = 'w-4 h-4 rounded-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)] transform scale-110 transition-all duration-200';
            } else {
                d.className = 'w-4 h-4 rounded-full bg-gray-200 border-2 border-gray-100 transition-all duration-200';
            }
        });
    },

    submit() {
        const s = document.getElementById('pinSubtitle');

        if (this.mode === 'set') {
            if (this.onSuccess) this.onSuccess(this.input);
            this.close(true);
        } else {
            
            if (this.isLocked()) {
                const remaining = Math.ceil((this.getLockoutTime() - Date.now()) / 1000);
                alert(`Locked! Wait ${remaining}s`); // Fallback
                this.close(false);
                return;
            }

            const savedPin = State.data.settings.kidsModePin;
            
            if (this.input === savedPin) {

                Haptics.medium();
                this.resetSecurity();
                if (this.onSuccess) this.onSuccess();
                this.close(true);
            } else {

                Haptics.heavy();
                this.shakeBox();
                
                const attempts = this.recordFailure();
                if (attempts >= this.MAX_ATTEMPTS) {
                     // LOCKOUT TRIGGERED
                     s.textContent = "LOCKED FOR 60 SECONDS!";
                     s.className = "text-red-600 font-bold text-center mb-6 text-sm animate-pulse";
                     
                     // Force an alert so they definitely see it
                     setTimeout(() => {
                        alert("Too many failed attempts. Parental controls locked for 60 seconds.");
                        this.close(false);
                     }, 500);
                     
                } else {
                     // WRONG PIN
                     const left = this.MAX_ATTEMPTS - attempts;
                     s.textContent = `Wrong PIN! ${left} attempts remaining`;
                     s.className = "text-red-500 font-semibold text-center mb-6 text-sm";
                     
                     setTimeout(() => {
                         this.input = '';
                         this.updateDisplay();
                     }, 1000);
                }
            }
        }
    },

    shakeBox() {
        const box = document.querySelector('#pinPadModal > div');
        if (box) {
            box.classList.remove('animate-shake');
            void box.offsetWidth; 
            box.classList.add('animate-shake');
        }
    },

    getAttempts() {
        return parseInt(localStorage.getItem('pin_attempts') || 0);
    },
    
    getLockoutTime() {
        return parseInt(localStorage.getItem('pin_lockout_until') || 0);
    },

    isLocked() {
        const lockout = this.getLockoutTime();
        if (lockout > Date.now()) return true;
        if (lockout !== 0 && lockout < Date.now()) {
            this.resetSecurity();
        }
        return false;
    },

    recordFailure() {
        const newAttempts = this.getAttempts() + 1;
        localStorage.setItem('pin_attempts', newAttempts);
        
        if (newAttempts >= this.MAX_ATTEMPTS) {
            localStorage.setItem('pin_lockout_until', Date.now() + this.LOCKOUT_MS);
        }
        return newAttempts;
    },

    resetSecurity() {
        localStorage.removeItem('pin_attempts');
        localStorage.removeItem('pin_lockout_until');
    }
};

window.PinPad = PinPad;

const DataManager = {
    EXCLUDE: ['offlineCache', 'pendingVotes'],
    SECRET_SALT: "s70p_7rying_70_ch347!", 

    _generateHash(str) {
        let hash = 0;
        if (str.length === 0) return hash.toString();
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }
        return hash.toString(16);
    },

    async exportData() {
        try {

            const rawData = { ...State.data };
            this.EXCLUDE.forEach(k => delete rawData[k]);

            const dataString = JSON.stringify(rawData);
            const signature = this._generateHash(dataString + this.SECRET_SALT);

            const backup = {
                timestamp: Date.now(),
                version: CONFIG.APP_VERSION,
                data: rawData,
                signature: signature
            };

            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const date = new Date().toISOString().split('T')[0];
            a.href = url;
            a.download = `gbword_backup_${State.data.username || 'user'}_${date}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            UIManager.showPostVoteMessage("Secure Backup saved! 💾");
        } catch (e) {
            console.error(e);
            alert("Export failed.");
        }
    },

    importData(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result);
                
                if (!json.data || !json.signature) {
                    throw new Error("Invalid or old backup file format.");
                }

                const checkString = JSON.stringify(json.data);
                const checkHash = this._generateHash(checkString + this.SECRET_SALT);

                if (checkHash !== json.signature) {
                    alert("⚠️ TAMPER DETECTED ⚠️\n\nThis save file has been modified externally.\nRestore rejected.");
                    return;
                }

                if (!confirm(`Restore valid backup from ${new Date(json.timestamp).toLocaleDateString()}?`)) {
                    return;
                }

                const newData = { ...State.data, ...json.data };
                Object.keys(newData).forEach(k => {
                    if (this.EXCLUDE.includes(k)) return;
                    State.save(k, newData[k]);
                });

                alert("Success! Reloading...");
                window.location.reload();

            } catch (err) {
                console.error(err);
                alert("Error: " + err.message);
            }
        };
        reader.readAsText(file);
    }
};

const ModalManager = {
    toggle(id, show) {
        const e = DOM.modals[id];
        e.classList.toggle('hidden', !show);
        e.classList.toggle('flex', show)
    },
init() {
        // SETTINGS BUTTON HANDLER
        document.getElementById('showSettingsButton').onclick = () => {
            const s = State.data.settings;
            const container = document.getElementById('settingsModalContainer').querySelector('.space-y-4');
            
            if (container) {
                container.classList.add('max-h-[60vh]', 'overflow-y-auto', 'pr-2'); 


                const mkTog = (id, label, checked, color = 'text-indigo-600') => `
                    <div class="flex items-center justify-between">
                        <label for="${id}" class="text-lg font-medium text-gray-700">${label}</label>
                        <input type="checkbox" id="${id}" ${checked ? 'checked' : ''} 
                               class="h-6 w-6 ${color} border-gray-300 rounded focus:ring-indigo-500">
                    </div>`;

                let html = '';
                
                // 1. NETWORK
                const isOffline = s.offlineMode || false;
                html += `<div class="mb-6">
                    <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-100 pb-1">Network</h3>
                    <div class="space-y-4">`;
                html += mkTog('toggleOffline', '🚇 Offline Mode', isOffline, 'text-gray-800');
                html += `<p class="text-xs text-gray-400 mt-1">Saves words locally. Votes sync when you reconnect.</p>`;
                html += `</div></div>`;
 
                // 2. SETTINGS
                html += `<div class="mb-6"><h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-100 pb-1">Settings</h3><div class="space-y-4">`;
                if (State.data.unlockedThemes.length > 0) {
                     html += mkTog('toggleRandomTheme', '🔀 Randomise Theme on Load', s.randomizeTheme);
                }
                html += mkTog('togglePercentages', 'Show Vote Percentages', s.showPercentages);
                html += mkTog('toggleTips', 'Show Tips & Hints', s.showTips);
                html += `<button onclick="TipManager.open()" class="w-full mt-2 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-lg border border-indigo-100 hover:bg-indigo-100 transition">💡 Submit Your Own Tip</button>`;
                html += mkTog('toggleZeroVotes', 'Show Only New Words (0/0)', s.zeroVotesOnly);
                html += `</div></div>`;

                // 3. ACCESSIBILITY
                html += `<div class="mb-6"><h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-100 pb-1">Accessibility</h3><div class="space-y-4">`;
                html += mkTog('toggleColorblind', 'Colourblind Mode', s.colorblindMode);
                html += mkTog('toggleLargeText', 'Increase Text Size', s.largeText);
                html += mkTog('toggleMute', '🔇 Mute All Sounds', s.muteSounds);
                if (State.data.unlockedThemes.includes('halloween')) {
                    html += mkTog('toggleArachnophobia', '🚫 Arachnophobia Mode', s.arachnophobiaMode);
                }
                html += mkTog('toggleKidsMode', '🧸 Kids Mode', s.kidsMode, 'text-pink-600');
                html += `</div></div>`;

                // 4. FUN
                html += `<div><h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-100 pb-1">Fun</h3><div class="space-y-4">`;
                html += mkTog('toggleTilt', 'Gravity Tilt (Default Theme)', s.enableTilt);
                html += mkTog('toggleMirror', 'Mirror Mode', s.mirrorMode);
                html += mkTog('toggleLights', '🎄 Christmas Lights', s.showLights, 'text-green-600');
                html += `</div></div>`;

                // 5. DATA MANAGEMENT
                html += `<div class="mb-6 mt-6">
                    <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-100 pb-1">Data Backup</h3>
                    <div class="flex gap-3">
                        <button id="btnExportData" class="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg border border-gray-200 hover:bg-gray-200 transition text-sm">
                            💾 Save Backup
                        </button>
                        <button id="btnImportData" class="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg border border-gray-200 hover:bg-gray-200 transition text-sm">
                            📂 Restore File
                        </button>
                        <input type="file" id="fileImportInput" accept=".json" style="display:none">
                    </div>
                    <p class="text-[10px] text-gray-400 mt-2">Save your .json file to move stats to another device. This feature does not work on facebook browser because it's awful. Never user facebook browser.</p>
                </div>`;

                // INJECT HTML
                container.innerHTML = html;
                
                // --- ATTACH LISTENERS ---

                // Data Backup Listeners
                const btnExport = document.getElementById('btnExportData');
                if(btnExport) btnExport.onclick = () => DataManager.exportData();

                const fileInput = document.getElementById('fileImportInput');
                const btnImport = document.getElementById('btnImportData');
                if(btnImport) btnImport.onclick = () => fileInput.click();
                
                if(fileInput) fileInput.onchange = (e) => {
                    if (e.target.files.length > 0) {
                        DataManager.importData(e.target.files[0]);
                        e.target.value = ''; 
                    }
                };

                // Network
                document.getElementById('toggleOffline').onchange = e => OfflineManager.toggle(e.target.checked);

                // Settings
                document.getElementById('togglePercentages').onchange = e => 
                    State.save('settings', { ...State.data.settings, showPercentages: e.target.checked });
                document.getElementById('toggleTips').onchange = e => 
                    State.save('settings', { ...State.data.settings, showTips: e.target.checked });
                const randBtn = document.getElementById('toggleRandomTheme');
                if (randBtn) {
                    randBtn.onchange = e => State.save('settings', { ...State.data.settings, randomizeTheme: e.target.checked });
                }
                document.getElementById('toggleZeroVotes').onchange = e => {
                    State.save('settings', { ...State.data.settings, zeroVotesOnly: e.target.checked });
                    Game.refreshData(true);
                };

                // Accessibility
                document.getElementById('toggleColorblind').onchange = e => {
                    State.save('settings', { ...State.data.settings, colorblindMode: e.target.checked });
                    Accessibility.apply();
                };
                document.getElementById('toggleLargeText').onchange = e => {
                    State.save('settings', { ...State.data.settings, largeText: e.target.checked });
                    Accessibility.apply();
                };
                document.getElementById('toggleMute').onchange = e => {
                    State.save('settings', { ...State.data.settings, muteSounds: e.target.checked });
                    SoundManager.updateMute();
                };

                const arachBtn = document.getElementById('toggleArachnophobia');
                if (arachBtn) {
                    arachBtn.onchange = e => {
                        const isSafe = e.target.checked;
                        State.save('settings', { ...State.data.settings, arachnophobiaMode: isSafe });
                        if (isSafe && typeof MosquitoManager !== 'undefined' && MosquitoManager.state === 'stuck') {
                             State.data.insectStats.saved++;
                             State.save('insectStats', State.data.insectStats);
                             MosquitoManager.remove();
                             UIManager.showPostVoteMessage("Bug returned to jar! 🦟");
                        }
                        if (State.data.currentTheme === 'halloween') {
                            Effects.halloween(true);
                        }
                    };
                }

                document.getElementById('toggleKidsMode').onchange = e => {
                    const turningOn = e.target.checked;
                    const savedPin = State.data.settings.kidsModePin;

                    e.preventDefault(); 

                    if (turningOn) {
                        if (!savedPin) {
                            e.target.checked = false;
                            PinPad.open('set', (newPin) => {
                                State.save('settings', { ...State.data.settings, kidsMode: true, kidsModePin: newPin });
                                UIManager.showPostVoteMessage(`Kids Mode Active! 🧸`);
                                Game.refreshData(true);
                                this.toggle('settings', false); 
                            }, () => {
                                document.getElementById('toggleKidsMode').checked = false;
                            });
                        } else {
                            State.save('settings', { ...State.data.settings, kidsMode: true });
                            Game.refreshData(true);
                        }
                    } else {
                        e.target.checked = true;
                        if (!savedPin) {
                            State.save('settings', { ...State.data.settings, kidsMode: false });
                            Game.refreshData(true);
                            return;
                        }
                        
                        PinPad.open('verify', () => {
                            State.save('settings', { ...State.data.settings, kidsMode: false });
                            Game.refreshData(true);
                            document.getElementById('toggleKidsMode').checked = false;
                        }, () => {
                            document.getElementById('toggleKidsMode').checked = true; 
                        });
                    }
                };

                document.getElementById('toggleTilt').onchange = e => {
                    State.save('settings', { ...State.data.settings, enableTilt: e.target.checked });
                    TiltManager.refresh();
                };
                document.getElementById('toggleMirror').onchange = e => {
                    State.save('settings', { ...State.data.settings, mirrorMode: e.target.checked });
                    Accessibility.apply();
                };
                document.getElementById('toggleLights').onchange = e => {
                    State.save('settings', { ...State.data.settings, showLights: e.target.checked });
                    Game.updateLights();
                };
            }
            this.toggle('settings', true)
        };

        // --- Standard Modal Listeners ---
        document.getElementById('closeSettingsModal').onclick = () => this.toggle('settings', false);
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
        const shareBtn = document.getElementById('shareWordButton');
        if (shareBtn) {
            shareBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation(); 
                
                const currentWord = State.runtime.allWords[State.runtime.currentWordIndex];
                if (currentWord) ShareManager.shareWord(currentWord.text);
            };
        }
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
		
        const btnGood = document.getElementById('btnOpenGoodRankings');
        if (btnGood) btnGood.onclick = () => {
            UIManager.renderFullRankings();
            this.toggle('fullRankings', true);
            setTimeout(() => {
                const header = document.querySelector('#fullGoodRankings h3') || document.getElementById('fullGoodRankings');
                if(header) header.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        };

        const btnBad = document.getElementById('btnOpenBadRankings');
        if (btnBad) btnBad.onclick = () => {
             UIManager.renderFullRankings();
             this.toggle('fullRankings', true);
             setTimeout(() => {
                 const header = document.querySelector('#fullBadRankings h3') || document.getElementById('fullBadRankings');
                 if(header) header.scrollIntoView({ behavior: 'smooth', block: 'start' });
             }, 100);
        };

        const headerStats = document.getElementById('headerStatsCard');
        if (headerStats) {
            headerStats.onclick = (e) => {
                e.preventDefault(); 
                Game.renderGraphs(); 
                
                const gm = document.getElementById('graphModalContainer');
                if (gm) {
                    gm.classList.remove('hidden');
                    gm.classList.add('flex');
                }
            };
        }
        
        const closeGraph = document.getElementById('closeGraphModal');
        if (closeGraph) {
            closeGraph.onclick = () => {
                const gm = document.getElementById('graphModalContainer');
                if (gm) {
                    gm.classList.add('hidden');
                    gm.classList.remove('flex');
                }
            };
        }
        
        Object.keys(DOM.modals).forEach(k => {
            DOM.modals[k].style.zIndex = '150'; 
            DOM.modals[k].addEventListener('click', e => {
                if (e.target === DOM.modals[k]) this.toggle(k, false);
            });
        });
    }
};

const TipManager = {
    serviceID: 'service_b6d75wi',
    templateID: 'template_qody7q7',
    COOLDOWN_MINS: 10, 

    init() {
        if (document.getElementById('tipModal')) return;
        // ... (Keep existing innerHTML creation code exactly as is) ...
        const el = document.createElement('div');
        el.id = 'tipModal';
        el.className = 'fixed inset-0 bg-gray-900 bg-opacity-95 z-[200] hidden flex items-center justify-center';
        el.innerHTML = `
            <div class="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
                <h3 class="text-2xl font-bold text-center mb-2 text-gray-800">Submit a Tip</h3>
                <p class="text-gray-500 text-center mb-4 text-sm">Got a clever loading tip? Send it in!</p>
                <textarea id="tipInput" rows="4" class="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none" placeholder="Type your tip here..."></textarea>
                <div class="flex gap-3">
                    <button onclick="TipManager.close()" class="flex-1 py-3 text-gray-500 font-semibold hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                    <button onclick="TipManager.send()" class="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg">Send</button>
                </div>
            </div>`;
        document.body.appendChild(el);
    },

    open() {
        this.init();
        document.getElementById('tipModal').classList.remove('hidden');
        document.getElementById('tipInput').value = '';
        document.getElementById('tipInput').focus();
    },
    close() {
        const el = document.getElementById('tipModal');
        if (el) el.classList.add('hidden');
    },

send() {
        // 1. CHECK COOLDOWN
        const lastSent = parseInt(localStorage.getItem('lastTipSent') || 0);
        const now = Date.now();
        const diff = now - lastSent;
        const cooldownMs = this.COOLDOWN_MINS * 60 * 1000;

        if (diff < cooldownMs) {
            const minLeft = Math.ceil((cooldownMs - diff) / 60000);
            UIManager.showPostVoteMessage(`Please wait ${minLeft} min before sending another.`);
            return;
        }

        const input = document.getElementById('tipInput');
        const text = input.value.trim();

        if (!text) { UIManager.showPostVoteMessage("Please write something first!"); return; }
        if (text.length > 250) { UIManager.showPostVoteMessage("Keep it short! Under 250 chars."); return; }

        // --- NEW: Close Modals & Scroll Up ---
        this.close();
        if (typeof ModalManager !== 'undefined') ModalManager.toggle('settings', false); // Close settings too
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
        // -------------------------------------

        UIManager.showPostVoteMessage("Tip sent! Thanks! 💌");

        // 2. SET TIMESTAMP
        localStorage.setItem('lastTipSent', now);

        emailjs.send(this.serviceID, this.templateID, {
            message: text,
            username: State.data.username || "Anonymous"
        }).catch((err) => console.error('Background email failed:', err));
    }
};
window.TipManager = TipManager;

const ContactManager = {
    serviceID: 'service_b6d75wi',
    templateID: 'template_qody7q7',
    COOLDOWN_MINS: 10, 

    init() {
        if (document.getElementById('contactModal')) return;
        
        const el = document.createElement('div');
        el.id = 'contactModal';
        el.className = 'fixed inset-0 bg-gray-900 bg-opacity-95 z-[200] hidden flex items-center justify-center';
        
        el.innerHTML = `
            <div class="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
                <h3 class="text-2xl font-bold text-center mb-2 text-gray-800">Contact Developer</h3>
                <p class="text-gray-500 text-center mb-4 text-sm">Found a bug or have a question?</p>
                
                <textarea id="contactInput" rows="5" class="w-full p-3 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none" placeholder="Write your message here..."></textarea>
                
                <div id="contactError" class="text-red-500 text-sm font-bold text-center h-5 mb-2"></div>

                <div class="flex gap-3">
                    <button onclick="ContactManager.close()" class="flex-1 py-3 text-gray-500 font-semibold hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                    <button onclick="ContactManager.send()" class="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg">Send</button>
                </div>
            </div>`;
        document.body.appendChild(el);
    },

    open() {
        this.init();
        document.getElementById('contactModal').classList.remove('hidden');
        document.getElementById('contactInput').value = '';
        document.getElementById('contactError').textContent = ''; // Clear errors
        document.getElementById('contactInput').focus();
    },

    close() {
        const el = document.getElementById('contactModal');
        if (el) el.classList.add('hidden');
    },

    send() {
        const errDiv = document.getElementById('contactError');
        
        // 1. CHECK COOLDOWN
        const lastSent = parseInt(localStorage.getItem('lastContactSent') || 0);
        const now = Date.now();
        const diff = now - lastSent;
        const cooldownMs = this.COOLDOWN_MINS * 60 * 1000;

        if (diff < cooldownMs) {
            const minLeft = Math.ceil((cooldownMs - diff) / 60000);
            errDiv.textContent = `⏳ Wait ${minLeft}m before sending again.`;
            return;
        }

        const input = document.getElementById('contactInput');
        const text = input.value.trim();

        if (!text) { 
            errDiv.textContent = "Please write a message first!";
            return; 
        }

        // --- NEW: Close Modal & Scroll Up ---
        this.close();
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
        // ------------------------------------

        UIManager.showPostVoteMessage("Message sent! I'll read it soon. 📨");
        
        // 2. SET TIMESTAMP
        localStorage.setItem('lastContactSent', now);

        emailjs.send(this.serviceID, this.templateID, {
            message: "CONTACT: " + text,
            username: State.data.username || "Anonymous"
        }).catch((err) => console.error('Background email failed:', err));
    }
};
window.ContactManager = ContactManager;

const InputHandler = {
    sX: 0, sY: 0, drag: false, scroll: false, raf: null,
    init() {
		if (!DOM.game.card || !DOM.game.wordDisplay) return;
        const c = DOM.game.card, wd = DOM.game.wordDisplay;
        
        const startDrag = (x, y) => {
            if (State.runtime.isCoolingDown || DOM.game.buttons.good.disabled) return;
            this.sX = x; this.sY = y; this.drag = false; this.scroll = false;
            wd.style.transition = 'none'; wd.style.animation = 'none';
        };

        const moveDrag = (x, y, e) => {
            if (State.runtime.isCoolingDown || DOM.game.buttons.good.disabled) return;
            const dX = x - this.sX, dY = y - this.sY;
            if (!this.drag && !this.scroll) {
                if (Math.abs(dY) > Math.abs(dX)) { this.scroll = true; return; }
                this.drag = true; Haptics.light();
                Game.cleanStyles(wd); wd.style.background = 'none'; wd.style.webkitTextFillColor = 'initial';
            }
            if (this.scroll) return;
            if (this.drag) {
                if (e.cancelable) e.preventDefault();
                if (this.raf) cancelAnimationFrame(this.raf);
                this.raf = requestAnimationFrame(() => {
                    wd.style.transform = `translate(${dX}px, ${dY * 0.8}px) rotate(${dX * 0.05}deg)`;
                    const colors = Accessibility.getColors();
                    const col = dX < 0 ? colors.good : colors.bad;
                    const alpha = Math.min(Math.abs(dX) / 150, 1);
                    wd.style.setProperty('--dynamic-swipe-color', Utils.hexToRgba(col, alpha));
                    if (State.data.settings.colorblindMode) {
                        const rgb = dX < 0 ? '59, 130, 246' : '249, 115, 22';
                        wd.style.setProperty('--dynamic-swipe-color', `rgba(${rgb}, ${alpha})`);
                    }
                    wd.classList.add('override-theme-color');
                });
            }
        };

        const endDrag = (x) => {
            if (!this.drag) return;
            const dX = x - this.sX;
            wd.classList.remove('override-theme-color');
            if (this.raf) cancelAnimationFrame(this.raf);
            if (Math.abs(dX) > CONFIG.VOTE.SWIPE_THRESHOLD) {
                let l = dX < 0; 
                if (State.data.settings.mirrorMode) l = !l;
                wd.style.transition = 'transform .4s ease-out, opacity .4s ease-out';
                const exitX = l ? -window.innerWidth : window.innerWidth;
                const rot = l ? -20 : 20;
                wd.style.transform = `translate(${exitX}px, 0px) rotate(${rot}deg)`;
                wd.style.opacity = '0';
                const colors = Accessibility.getColors();
                wd.style.color = l ? colors.good : colors.bad;
                SoundManager.playWhoosh();
                Game.vote(l ? 'good' : 'bad', true);
            } else {
                wd.classList.add('word-reset');
                wd.style.transform = 'translate(0,0) rotate(0)';
                wd.style.color = '';
                setTimeout(() => {
                    wd.classList.remove('word-reset');
                    wd.style = '';
                    const currentWord = State.runtime.allWords[State.runtime.currentWordIndex];
                    if(currentWord) UIManager.displayWord(currentWord);
                }, 300);
            }
            this.drag = false; this.scroll = false;
        };

        c.addEventListener('mousedown', e => { if (e.target.closest('button, input, select')) return; if(e.cancelable) e.preventDefault(); startDrag(e.clientX, e.clientY); });
        window.addEventListener('mousemove', e => { if (this.drag) moveDrag(e.clientX, e.clientY, e); });
        window.addEventListener('mouseup', e => { if (this.drag) endDrag(e.clientX); });
        c.addEventListener('touchstart', e => { if (e.target.closest('button, input, select')) return; startDrag(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
        c.addEventListener('touchmove', e => { moveDrag(e.touches[0].clientX, e.touches[0].clientY, e); }, { passive: false });
        c.addEventListener('touchend', e => { endDrag(e.changedTouches[0].clientX); }, false);
    }
};
	
const PromoManager = {
    serviceID: 'service_b6d75wi', 
    templateID: 'template_qody7q7', 

    init() {
        // 1. Inject Animation Style (Always needed)
        if (!document.getElementById('promo-anim-style')) {
            const s = document.createElement('style');
            s.id = 'promo-anim-style';
            s.innerHTML = `
                @keyframes promo-spin { 
                    0% { transform: rotateY(0deg) scale(1); } 
                    50% { transform: rotateY(180deg) scale(1.2); }
                    100% { transform: rotateY(360deg) scale(1); } 
                }
                .promo-spinning { animation: promo-spin 0.5s ease-in-out forwards; }
            `;
            document.head.appendChild(s);
        }

        // 2. Create the Floating Button (ONLY if not claimed/dismissed yet)
        if (!State.data.keyringClaimed && !document.getElementById('promoButton')) {
            const btn = document.createElement('div');
            btn.id = 'promoButton';
            btn.innerHTML = `
                <div class="absolute inset-0 bg-pink-500 rounded-full animate-ping opacity-75"></div>
                <div id="promoBtnInner" class="relative bg-gradient-to-r from-pink-600 to-purple-600 text-white font-black text-sm px-4 py-3 rounded-full shadow-2xl border-2 border-white cursor-pointer flex items-center gap-2 transform transition hover:scale-110">
                    <span class="text-xl">🎁</span> 
                    <span>FREE STUFF!</span>
                </div>
            `;
            Object.assign(btn.style, {
                position: 'fixed', bottom: '20px', right: '20px', zIndex: '9999',
                cursor: 'pointer', display: 'flex'
            });
            
            btn.onclick = () => {
                const inner = document.getElementById('promoBtnInner');
                if(inner) {
                    inner.classList.add('promo-spinning');
                    setTimeout(() => {
                        inner.classList.remove('promo-spinning');
                        this.open();
                    }, 500);
                } else {
                    this.open();
                }
            };
            document.body.appendChild(btn);
        }

        // 3. Create the Modal (ALWAYS create it, so it can be opened from Profile)
        if (!document.getElementById('promoModal')) {
            const modal = document.createElement('div');
            modal.id = 'promoModal';
            modal.className = 'fixed inset-0 bg-black/90 z-[10000] hidden flex items-center justify-center p-4 backdrop-blur-sm';
            modal.innerHTML = `
                <div class="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all">
                    <div class="bg-gradient-to-r from-pink-600 to-purple-600 p-4 text-center">
                        <h2 class="text-2xl font-black text-white uppercase tracking-wider">Claim Free Metal Keyring and Shiny Stickers! 🗝️</h2>
                        <p class="text-pink-100 text-xs mt-1">Real actual free stuff. Enjoy!</p>
                    </div>
                    
                    <div class="p-6 space-y-4">
                        <div>
                            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                            <input type="text" id="promoName" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none font-bold" placeholder="Your Name">
                        </div>
                        
                        <div>
                            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Shipping Address</label>
                            <textarea id="promoAddress" rows="3" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none resize-none" placeholder="Street, City, Postcode, Country"></textarea>
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Email (for updates)</label>
                            <input type="email" id="promoEmail" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none" placeholder="you@example.com">
                        </div>

                        <div class="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <input type="checkbox" id="promoOptIn" checked class="mt-1 h-4 w-4 text-pink-600 rounded border-gray-300 focus:ring-pink-500">
                            <label for="promoOptIn" class="text-xs text-gray-600 leading-snug">
                                <strong>Keep me posted!</strong><br>
                                I want to hear about new features and weird stuff.
                            </label>
                        </div>

                        <div class="pt-2 flex gap-3">
                            <button onclick="PromoManager.dismiss()" class="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition">No Thanks</button>
                            <button onclick="PromoManager.submit()" class="flex-1 py-3 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 shadow-lg transition transform active:scale-95">SEND IT! 🚀</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
    },

    open() {
        document.getElementById('promoModal').classList.remove('hidden');
    },

    close() {
        document.getElementById('promoModal').classList.add('hidden');
    },
	dismiss() {
        this.close();
        State.save('keyringClaimed', true); // Remembers that they said no
        const btn = document.getElementById('promoButton');
        if(btn) btn.remove(); // Removes the flashing button immediately
        UIManager.showPostVoteMessage("Offer declined.");
    },
    submit() {
        const name = document.getElementById('promoName').value.trim();
        const address = document.getElementById('promoAddress').value.trim();
        const email = document.getElementById('promoEmail').value.trim();
        const optIn = document.getElementById('promoOptIn').checked;

        if (!name || !address) {
            alert("Please enter your name and address so I can send it!");
            return;
        }

        const msg = `
            NEW KEYRING CLAIM! 🎁
            ------------------
            Name: ${name}
            Address: ${address}
            Email: ${email}
            Marketing Opt-In: ${optIn ? "YES ✅" : "NO ❌"}
            User ID: ${State.data.userId}
        `;

        UIManager.showPostVoteMessage("Sending details... 📨");
        this.close();

        emailjs.send(this.serviceID, this.templateID, {
            message: msg,
            username: name
        }).then(() => {
            UIManager.showPostVoteMessage("Request Received! 🎉");
            State.save('keyringClaimed', true);
            const btn = document.getElementById('promoButton');
            if(btn) btn.remove();
            if (typeof Game.vote === 'function') SoundManager.playUnlock();
        }).catch((err) => {
            console.error(err);
            alert("Could not send data. Please try later or contacting Gilxs directly.");
        });
    }
};

const DAILY_GOAL = 5;

const getDailyWords = (dateStr, allWords) => {
    // 1. Create a target hash integer from the date string
    let h = 0x811c9dc5;
    for (let i = 0; i < dateStr.length; i++) {
        h ^= dateStr.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    const target = Math.abs(h);

    // 2. Map every word to its "distance" from the date target
    const candidates = allWords.map(w => {
        let wh = 0x811c9dc5;
        const txt = w.text.toUpperCase();
        for (let i = 0; i < txt.length; i++) {
            wh ^= txt.charCodeAt(i);
            wh = Math.imul(wh, 0x01000193);
        }
        return { w, dist: Math.abs(Math.abs(wh) - target) };
    });

    // 3. Sort by distance and pick top 5 (Using DAILY_GOAL instead of count)
    candidates.sort((a, b) => a.dist - b.dist);
    return candidates.slice(0, DAILY_GOAL).map(c => c.w);
};
// --- END DAILY CHALLENGE LOGIC ---
const Game = {

getSpiderGreeting() {
        const currentHour = new Date().getHours();
        if (currentHour >= 5 && currentHour < 12) {
            return "Wakey wakey!";
        } else if (currentHour >= 12 && currentHour < 18) {
            return "What a lovely afternoon. Time for food?";
        } else if (currentHour >= 18 && currentHour <= 23) {
            return "The evening bugs are the freshest!";
        } else { // 00:00 to 04:59
            return "Don't let the bed bugs bite. Bite them.";
        }
    },

renderGraphs() {
        const w = State.runtime.allWords;
        if (!w || w.length === 0) return;

        const drawText = (ctx, text, x, y, color = "#666", size = 12) => {
            ctx.fillStyle = color;
            ctx.font = `${size}px sans-serif`;
            ctx.textAlign = "center";
            ctx.fillText(text, x, y);
        };

        const fmtDate = (dStr) => {
            if(!dStr) return '';
            const M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            const p = dStr.split('-');
            if(p.length === 3) {
                return `${parseInt(p[2])} ${M[parseInt(p[1])-1]}`;
            }
            return dStr;
        };

        const fmtK = (n) => {
            if (n >= 1000) return (n / 1000) + 'k';
            return n;
        };

        const cvsScatter = document.getElementById('scatterChartCanvas');
        if (cvsScatter) {
            const ctx = cvsScatter.getContext('2d');
            const W = cvsScatter.width;
            const H = cvsScatter.height;
            const P = 40; // Padding

            ctx.clearRect(0, 0, W, H);

            // Scales
            let maxGood = 0, maxBad = 0;
            w.forEach(word => {
                if ((word.goodVotes || 0) > maxGood) maxGood = word.goodVotes || 0;
                if ((word.badVotes || 0) > maxBad) maxBad = word.badVotes || 0;
            });
            maxGood = Math.max(5, maxGood * 1.1);
            maxBad = Math.max(5, maxBad * 1.1);

            // Grid
            ctx.beginPath(); ctx.strokeStyle = "#e5e7eb"; ctx.lineWidth = 1;
            for(let i=1; i<=4; i++) {
                const y = H - P - (i/5)*(H - 2*P);
                const x = P + (i/5)*(W - 2*P);
                ctx.moveTo(P, y); ctx.lineTo(W-P, y); ctx.moveTo(x, P); ctx.lineTo(x, H-P);
            }
            ctx.stroke();

            // Axes
            ctx.beginPath(); ctx.strokeStyle = "#9ca3af"; ctx.lineWidth = 2;
            ctx.moveTo(P, P); ctx.lineTo(P, H - P); ctx.lineTo(W - P, H - P); ctx.stroke();

            // Labels
            drawText(ctx, "Bad Votes →", W / 2, H - 10, "#4b5563", 12);
            ctx.save(); ctx.translate(15, H / 2); ctx.rotate(-Math.PI / 2);
            drawText(ctx, "Good Votes →", 0, 0, "#4b5563", 12); ctx.restore();

            // Quadrant Text
            drawText(ctx, "😇 LOVED", P + 40, P + 20, "rgba(34, 197, 94, 0.3)", 10);
            drawText(ctx, "👿 HATED", W - P - 40, H - P - 20, "rgba(239, 68, 68, 0.3)", 10);
            drawText(ctx, "⚔️ CONTROVERSIAL", W - P - 60, P + 20, "rgba(107, 114, 128, 0.3)", 10);

            // Points
            w.forEach(word => {
                const g = word.goodVotes || 0;
                const b = word.badVotes || 0;
                if (g + b === 0) return;

                const x = P + (b / maxBad) * (W - 2 * P);
                const y = (H - P) - (g / maxGood) * (H - 2 * P);

                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                
                if (g > b * 1.5) ctx.fillStyle = "rgba(34, 197, 94, 0.6)"; 
                else if (b > g * 1.5) ctx.fillStyle = "rgba(239, 68, 68, 0.6)"; 
                else ctx.fillStyle = "rgba(107, 114, 128, 0.6)"; 
                
                ctx.fill();
            });
        }

const cvsLine = document.getElementById('lineChartCanvas');
if (cvsLine) {
    const ctx = cvsLine.getContext('2d');
    const W = cvsLine.width;
    const H = cvsLine.height;
    const P = 40; 

    ctx.clearRect(0, 0, W, H);

    let history = State.data.wordHistory || [];
    if (history.length === 0) {
        const today = new Date().toISOString().split('T')[0];
        history = [{ date: today, count: w.length }];
    }

    // --- 1. SET FIXED SCALES (4k to 8k) ---
    const minCount = 4000; // Start at 4k
    const maxCount = 8000; // End at 8k
    const range = maxCount - minCount; // Total range (4000)

    // --- DRAW GRID & Y-LABELS ---
    ctx.textAlign = "right";
    const steps = 4; 
    
    for (let i = 0; i <= steps; i++) {
        // Calculate value based on minCount + step increment
        const val = minCount + (range / steps) * i;
        
        // Math changed: Account for minCount offset
        const normalizedHeight = (val - minCount) / range;
        const y = (H - P) - normalizedHeight * (H - 2 * P);
        
        // Grid Line
        ctx.beginPath();
        ctx.strokeStyle = i === 0 ? "#9ca3af" : "#e5e7eb"; 
        ctx.lineWidth = i === 0 ? 2 : 1;
        ctx.moveTo(P, y);
        ctx.lineTo(W - P, y);
        ctx.stroke();

        // Y-Axis Label
        drawText(ctx, fmtK(val), P - 5, y + 4, "#666", 10);
    }

    // Vertical Axis Line (Left)
    ctx.beginPath(); ctx.strokeStyle = "#9ca3af"; ctx.lineWidth = 2;
    ctx.moveTo(P, P); ctx.lineTo(P, H - P); ctx.stroke();

    // X-Axis Labels (Dates)
    ctx.textAlign = "center";
    const startDate = history[0].date;
    const endDate = history[history.length - 1].date;
    
    drawText(ctx, fmtDate(startDate), P + 20, H - 10, "#666", 10);
    if (history.length > 1) {
        drawText(ctx, fmtDate(endDate), W - P - 20, H - 10, "#666", 10);
    }

    // --- 2. PLOT LINE ---
    if (history.length > 1) {
        ctx.beginPath(); ctx.strokeStyle = "#4f46e5"; ctx.lineWidth = 3;
        history.forEach((h, i) => {
            const x = P + (i / (history.length - 1)) * (W - 2 * P);
            
            // Math changed: Subtract minCount from actual count
            const normalizedHeight = (h.count - minCount) / range;
            const y = (H - P) - normalizedHeight * (H - 2 * P);
            
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.stroke();
    } else {
        // Single point calculation
        const normalizedHeight = (history[0].count - minCount) / range;
        const y = (H - P) - normalizedHeight * (H - 2 * P);
        
        ctx.beginPath(); ctx.fillStyle = "#4f46e5";
        ctx.arc(P, y, 5, 0, Math.PI*2); 
        ctx.fill();
    }

    // Axis Titles
    drawText(ctx, "Time →", W / 2, H - 5, "#999", 10);
    ctx.save(); ctx.translate(12, H / 2); ctx.rotate(-Math.PI / 2);
    drawText(ctx, "Words →", 0, 0, "#999", 10); ctx.restore();
}

        const cvsPie = document.getElementById('pieChartCanvas');
        if (cvsPie) {
            const ctx = cvsPie.getContext('2d');
            const W = cvsPie.width, H = cvsPie.height;
            ctx.clearRect(0, 0, W, H);

            let cGood = 0, cBad = 0, cControversial = 0, cUnrated = 0;
            
            w.forEach(word => {
                const g = word.goodVotes || 0;
                const b = word.badVotes || 0;
                const total = g + b;
                
                if (total < 3) {
                    cUnrated++;
                } else {
                    const ratio = g / total;
                    if (ratio > 0.60) cGood++;
                    else if (ratio < 0.40) cBad++;
                    else cControversial++;
                }
            });

            const totalRated = cGood + cBad + cControversial;
            
            if (totalRated === 0) {
                drawText(ctx, "Not enough votes yet.", W/2, H/2);
            } else {
                const data = [
                    { label: "Good", val: cGood, color: "#22c55e" },
                    { label: "Bad", val: cBad, color: "#ef4444" },
                    { label: "Controversial", val: cControversial, color: "#eab308" }
                ];

                let startAngle = 0;
                const centerX = 150, centerY = H / 2, radius = 70;

                data.forEach(slice => {
                    if (slice.val === 0) return;
                    const sliceAngle = (slice.val / totalRated) * 2 * Math.PI;
                    ctx.beginPath(); ctx.moveTo(centerX, centerY);
                    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
                    ctx.fillStyle = slice.color; ctx.fill();
                    startAngle += sliceAngle;
                });

                let legY = 60;
                data.forEach(slice => {
                    ctx.fillStyle = slice.color; ctx.fillRect(260, legY, 15, 15);
                    ctx.fillStyle = "#374151"; ctx.textAlign = "left"; ctx.font = "bold 12px sans-serif";
                    const pct = Math.round((slice.val / totalRated) * 100);
                    ctx.fillText(`${slice.label}: ${slice.val} (${pct}%)`, 285, legY + 12);
                    legY += 30;
                });
            }
        }
    },
	
    cleanStyles(e) {
        e.style.animation = 'none';
        e.style.background = 'none';
        e.style.webkitTextFillColor = 'initial';
        e.style.textShadow = 'none';
        e.style.transform = 'none';
        e.style.filter = 'none';
        e.style.color = ''
    },
	
	setRandomFavicon() {
        const options = ['👍', '👎', '🗳️'];
        const choice = options[Math.floor(Math.random() * options.length)];
        
        // Create an SVG favicon on the fly
        const svg = `<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${choice}</text></svg>`;
        
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }
        link.href = `data:image/svg+xml,${svg}`;
    },
    async init() {
		this.setRandomFavicon();
		DOM = loadDOM();
        try {
            // 1. Force Version Display (High Z-Index)
            const vEl = document.querySelector('.version-indicator');
            if (vEl) {
                vEl.textContent = `v${CONFIG.APP_VERSION} | Made by Gilxs in 12,025`;
                
                Object.assign(vEl.style, {
                    position: 'fixed', 
                    bottom: '15px', 
                    left: '50%',                
                    transform: 'translateX(-50%)', 
                    
                    // --- Z-INDEX UPDATE ---
                    // z-5 sits ABOVE the Summer grass (z-0) 
                    // but BELOW the Game Card (z-10) so it scrolls nicely.
                    zIndex: '5', 
                    
                    pointerEvents: 'none',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontSize: '11px',           
                    fontWeight: '600',          
                    color: '#374151',
                    letterSpacing: '0.05em',
                    backgroundColor: 'rgba(255, 255, 255, 0.92)', 
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    border: '1px solid rgba(0,0,0,0.1)',
                    
                    // --- WIDTH UPDATE ---
                    // 'max-content' forces the pill to be exactly as wide as the text
                    // preventing it from stretching across the screen.
                    width: 'max-content',
                    
                    textShadow: 'none',
                    opacity: '1',
                    mixBlendMode: 'normal'
                });
            }

            Accessibility.apply();
            
            // 2. Safe Audio Init
            try { SoundManager.init(); } catch(e) { console.warn("Audio init deferred"); }
            
            if (typeof this.updateLights === 'function') this.updateLights();
            UIManager.updateOfflineIndicator();
            
            // 3. Expose Managers
            window.StreakManager = StreakManager;
            window.ContactManager = ContactManager;
            window.PinPad = PinPad;
            window.TipManager = TipManager;
			window.PromoManager = PromoManager;

            // 4. Bind Buttons
            if (DOM.game.buttons.good) DOM.game.buttons.good.onclick = () => this.vote('good');
            if (DOM.game.buttons.bad) DOM.game.buttons.bad.onclick = () => this.vote('bad');
            if (DOM.game.buttons.notWord) DOM.game.buttons.notWord.onclick = () => this.vote('notWord');
            if (DOM.game.dailyBanner) DOM.game.dailyBanner.onclick = () => this.activateDailyMode();

            const qrGood = document.getElementById('qrGoodBtn');
			const qrBad = document.getElementById('qrBadBtn');

if (qrGood) {
    qrGood.onclick = (e) => {
        if (DOM.game.buttons.good.disabled || State.runtime.isCoolingDown) return;
        e.stopPropagation();
        ShareManager.shareQR('good');
    };
}

if (qrBad) {
    qrBad.onclick = (e) => {
        if (DOM.game.buttons.good.disabled || State.runtime.isCoolingDown) return;
        e.stopPropagation();
        ShareManager.shareQR('bad');
    };
}

			document.getElementById('showHelpButton').onclick = () => {
			window.scrollTo({ top: 0, behavior: 'smooth' });
			UIManager.showPostVoteMessage("What's going on? There aren't really any rules, but if you're really confused then drop me a message and I'll see if I can help!");
	};
			document.getElementById('showDonateButton').onclick = () => {
			window.scrollTo({ top: 0, behavior: 'smooth' });
			UIManager.showPostVoteMessage("That's very kind, but I'm not accepting any donations at the moment. Have fun!");
	};
            
            // 5. Initialize Submit & Compare Buttons
            document.getElementById('submitWordButton').onclick = async () => {
                const t = DOM.inputs.newWord.value.trim();
                if (!t || t.includes(' ') || t.length > 45) { DOM.inputs.modalMsg.textContent = "Invalid word."; return }
                const btn = document.getElementById('submitWordButton'); btn.disabled = true;
                try { const r = await API.submitWord(t); if (r.status === 201) { State.incrementContributor(); DOM.inputs.modalMsg.textContent = "Success! Your new word has been added!"; setTimeout(() => { ModalManager.toggle('submission', false); this.refreshData() }, 1000) } else { const d = await r.json(); DOM.inputs.modalMsg.textContent = d.message || "Error" } } catch (e) { DOM.inputs.modalMsg.textContent = "Network Error" }
                btn.disabled = false
            };

            document.getElementById('runComparisonButton').onclick = async () => {
                const w1 = DOM.inputs.wordOne.value.trim(), w2 = DOM.inputs.wordTwo.value.trim();
                if (!w1 && !w2) { DOM.inputs.compareResults.innerHTML = '<span class="text-red-500">Please enter at least one word.</span>'; return }
                DOM.inputs.compareResults.innerHTML = '<span class="text-gray-500 animate-pulse">Analyzing words...</span>';
                const gd = async w => { if (w.includes(' ') || w.length > 45) return { t: w, valid: false, err: 'Invalid word.' }; const e = State.runtime.allWords.find(x => x.text.toUpperCase() === w.toUpperCase()); if (e) return { t: e.text, valid: true, exists: true, d: e }; const r = await API.submitWord(w); if (r.status === 201) { State.incrementContributor(); return { t: w.toUpperCase(), valid: true, exists: false, isNew: true } } return { t: w, valid: false, err: 'Could not fetch data.' } };
                const res = []; if (w1) res.push(await gd(w1)); if (w2) res.push(await gd(w2)); if (res.some(r => r.isNew)) this.refreshData(false);
                if (res.some(r => !r.valid)) { DOM.inputs.compareResults.innerHTML = res.map(r => !r.valid ? `<p class="text-red-500 mb-2"><strong>${r.t}</strong>: ${r.err}</p>` : '').join(''); return }
                const st = res.map(r => { if (r.isNew) return { text: r.t.toUpperCase(), score: 0, good: 0, bad: 0, total: 0, approval: 0, isNew: true }; const g = r.d.goodVotes || 0, b = r.d.badVotes || 0, t = g + b; return { text: r.t.toUpperCase(), score: g - b, good: g, bad: b, total: t, approval: t > 0 ? Math.round((g / t) * 100) : 0, isNew: false } });
                let h = '';
                if (st.length === 2) {
                    const [s1, s2] = st; let wi = -1; if (s1.score !== s2.score) wi = s1.score > s2.score? 0 : 1;
                    h = `<div class="flex flex-col md:flex-row gap-4 w-full justify-center items-stretch">`;
                    st.forEach((s, i) => { const iw = i === wi, il = wi !== -1 && !iw, bc = iw ? 'border-yellow-400 bg-yellow-50 shadow-xl scale-105 z-10' : 'border-gray-200 bg-white', oc = il ? 'opacity-70 grayscale-[0.3]' : ''; h += `<div class="flex-1 p-4 rounded-xl border-2 ${bc} ${oc} flex flex-col items-center transition-all duration-300">${iw?'<div class="text-2xl mb-2">🏆</div>':'<div class="h-8 mb-2"></div>'}<h3 class="text-xl font-black text-gray-800 mb-1">${s.text}</h3>${iw?'<span class="bg-yellow-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-2">WINNER</span>':''}${s.isNew?'<span class="bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded mb-2">New!</span>':''}<div class="text-3xl font-bold ${s.score>=0?'text-green-600':'text-red-600'} mb-4">${s.score}</div><div class="w-full space-y-2"><div class="flex justify-between text-xs text-gray-500"><span>Approval</span><span>${s.approval}%</span></div><div class="w-full bg-gray-200 rounded-full h-2.5"><div class="bg-blue-500 h-2.5 rounded-full" style="width: ${s.approval}%"></div></div><div class="flex justify-between text-xs pt-1"><span class="text-green-600 font-bold">+${s.good}</span><span class="text-red-600 font-bold">-${s.bad}</span></div></div></div>`; if (i === 0) h += `<div class="flex items-center justify-center font-black text-gray-300 md:px-2">VS</div>` }); h += '</div>'
                } else { const s = st[0]; h = `<div class="p-4 rounded-xl border border-gray-200 bg-white flex flex-col items-center w-full max-w-xs mx-auto"><h3 class="text-xl font-black text-gray-800 mb-2">${s.text}</h3>${s.isNew?'<span class="bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded mb-2">Newly Added!</span>':''}<div class="text-4xl font-bold ${s.score>=0?'text-green-600':'text-red-600'} mb-4">${s.score}</div><div class="w-full space-y-2"><div class="flex justify-between text-xs text-gray-500"><span>Approval Rating</span><span>${s.approval}%</span></div><div class="w-full bg-gray-200 rounded-full h-2.5"><div class="bg-blue-500 h-2.5 rounded-full" style="width: ${s.approval}%"></div></div><div class="flex justify-between text-xs pt-1"><span class="text-green-600 font-bold">+${s.good} Votes</span><span class="text-red-600 font-bold">-${s.bad} Votes</span></div></div></div>` }
                DOM.inputs.compareResults.innerHTML = h
            };

            // 6. Initialize Managers
            if (DOM.theme.chooser) DOM.theme.chooser.onchange = e => ThemeManager.apply(e.target.value, true);
            const clearBtn = document.getElementById('clearAllDataButton');
            if (clearBtn) clearBtn.onclick = State.clearAll;

            InputHandler.init();
            ThemeManager.init();
            ModalManager.init();
            UIManager.updateProfileDisplay();
            MosquitoManager.startMonitoring();
			PromoManager.init();
            this.checkDailyStatus();
            
            // 7. Load Data
            await this.refreshData();

        } catch(e) {
            console.error("Critical Init Error:", e);
            const vEl = document.querySelector('.version-indicator');
            if(vEl) vEl.textContent = "Error: " + e.message;
        }
    },

checkDailyStatus() {
    const now = new Date();
    const t = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
    
    // Reset local state if day changed
    if (State.data.daily.lastDate !== t) {
        State.data.daily.progress = 0;
        State.data.daily.lastDate = t;
        State.save('daily', State.data.daily);
    }

    const prog = State.data.daily.progress || 0;

    if (prog >= DAILY_GOAL) {
        DOM.game.dailyStatus.textContent = "Come back tomorrow!";
        DOM.game.dailyBanner.style.display = 'none';
    } else if (prog > 0) {
        DOM.game.dailyStatus.textContent = `Resume: ${prog}/${DAILY_GOAL}`;
        DOM.game.dailyBanner.style.display = 'block';
    } else {
        DOM.game.dailyStatus.textContent = "Daily Challenge";
        DOM.game.dailyBanner.style.display = 'block';
    }
}

    updateLights() {
        const existing = document.querySelector('christmas-lights');
        if (State.data.settings.showLights) {
            if (!existing) {
                const lights = document.createElement('christmas-lights');
                document.body.appendChild(lights);
            }
        } else {
            if (existing) existing.remove();
        }
    },

    activateDailyMode() {
    if (State.runtime.isDailyMode) return;
    
    const now = new Date();
    const dateStr = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
    
    // Reset progress if it's a new day
    if (State.data.daily.lastDate !== dateStr) {
        State.data.daily.lastDate = dateStr;
        State.data.daily.progress = 0;
        State.save('daily', State.data.daily);
    }

    // Check if already finished
    if (State.data.daily.progress >= DAILY_GOAL) {
        DOM.game.dailyStatus.textContent = "Come back tomorrow!";
        return;
    }

    State.runtime.isDailyMode = true;
    
    // Generate the stable list of 5 words
    State.runtime.dailyWords = getDailyWords(dateStr, State.runtime.allWords, DAILY_GOAL);
    
    // Load the current word based on progress
    const currentWord = State.runtime.dailyWords[State.data.daily.progress];
    
    // Find real index to maintain compatibility
    const realIdx = State.runtime.allWords.indexOf(currentWord);
    if (realIdx !== -1) State.runtime.currentWordIndex = realIdx;
    
    // UI Updates
    DOM.game.dailyBanner.classList.add('daily-locked-mode');
    DOM.game.buttons.notWord.style.display = 'none';
    DOM.game.buttons.custom.style.display = 'none';
    
    UIManager.displayWord(currentWord);
    UIManager.showMessage(`Daily Challenge: ${State.data.daily.progress + 1} / ${DAILY_GOAL}`);
},
	
async refreshData(u = true) {
        if (u) UIManager.showMessage(State.data.settings.kidsMode ? "Loading Kids Mode..." : "Loading...");
        let d = [];
        const compareBtn = document.getElementById('compareWordsButton');

        // 1. Get QR Buttons
        const qrGood = document.getElementById('qrGoodBtn');
        const qrBad = document.getElementById('qrBadBtn');

        if (State.data.settings.kidsMode) {
            d = await API.fetchKidsWords();
            DOM.game.buttons.custom.style.display = 'none';   
            DOM.game.buttons.notWord.style.display = 'none';  
            DOM.game.dailyBanner.style.display = 'none';      
            if (compareBtn) compareBtn.classList.add('hidden');

            // 2. Hide QR Buttons in Kids Mode
            if (qrGood) qrGood.style.display = 'none';
            if (qrBad) qrBad.style.display = 'none';
        } else {
            d = await API.fetchWords();
            DOM.game.buttons.custom.style.display = 'block';
            DOM.game.buttons.notWord.style.display = 'block';
            if (compareBtn) compareBtn.classList.remove('hidden');

            // 3. Show QR Buttons in Normal Mode
            if (qrGood) qrGood.style.display = 'block';
            if (qrBad) qrBad.style.display = 'block';
            
            if(!State.runtime.isDailyMode) this.checkDailyStatus();
        }

        if (d && d.length > 0) {
            State.runtime.allWords = State.data.settings.kidsMode ? d : d.filter(w => (w.notWordVotes || 0) < 3);
            UIManager.updateStats();

            if (u && !State.runtime.isDailyMode) {
                const params = new URLSearchParams(window.location.search);
                const sharedWord = params.get('word');

                if (sharedWord) {
                    const idx = State.runtime.allWords.findIndex(w => w.text.toUpperCase() === sharedWord.toUpperCase());
                    if (idx !== -1) {
                        State.runtime.currentWordIndex = idx;
                        UIManager.displayWord(State.runtime.allWords[idx]);
                        window.history.replaceState({}, document.title, "/"); 
                        UIManager.showPostVoteMessage("Shared word loaded! 🔗");
                    } else {
                        UIManager.showPostVoteMessage("Word not found. Showing random.");
                        this.nextWord();
                    }
                } else {
                    this.nextWord();
                }
				
				const today = new Date().toISOString().split('T')[0];
				const history = State.data.wordHistory;
				const currentCount = State.runtime.allWords.length;

            // If last entry is not today, add today.
            if (history.length === 0 || history[history.length - 1].date !== today) {
                history.push({ date: today, count: currentCount });
                // Optional: Limit to last 365 entries to save space
                if (history.length > 365) history.shift(); 
                State.save('wordHistory', history);
            } else {
                // If we already have today, update the count (in case it grew)
                if (history[history.length - 1].count !== currentCount) {
                    history[history.length - 1].count = currentCount;
                    State.save('wordHistory', history);
                }
            }
            }
        } else {
            UIManager.showMessage("Connection Error", true);
        }
    },

    nextWord() {
        let p = State.runtime.allWords;
        if (!p || p.length === 0) return;

        // Smart Filtering
        if (State.data.settings.zeroVotesOnly) {
            const unvoted = p.filter(w => (w.goodVotes || 0) === 0 && (w.badVotes || 0) === 0);
            if (unvoted.length > 0) p = unvoted;
            else UIManager.showPostVoteMessage("No more new words! Showing random.");
        }

        // Special Words
        const r = Math.random(), { CAKE, LLAMA, POTATO, SQUIRREL, MASON } = CONFIG.SPECIAL, b = State.data.badges;
        let sp = null;
        if (!b.cake && r < CAKE.prob) sp = CAKE.text;
        else if (!b.llama && r < CAKE.prob + LLAMA.prob) sp = LLAMA.text;
        else if (!b.potato && r < CAKE.prob + LLAMA.prob + POTATO.prob) sp = POTATO.text;
        else if (!b.squirrel && r < CAKE.prob + LLAMA.prob + POTATO.prob + SQUIRREL.prob) sp = SQUIRREL.text;
        else if (!b.bone && r < CAKE.prob + LLAMA.prob + POTATO.prob + SQUIRREL.prob + MASON.prob) sp = MASON.text;
        
        if (sp) {
            const i = State.runtime.allWords.findIndex(w => w.text.toUpperCase() === sp);
            if (i !== -1 && i !== State.runtime.currentWordIndex) {
                State.runtime.currentWordIndex = i;
                UIManager.displayWord(State.runtime.allWords[i]);
                return;
            }
        }
        
        // Selection Algorithm
        let av = p.reduce((acc, w, i) => {
            const trueIndex = State.runtime.allWords.indexOf(w);
            if ((!State.data.seenHistory.includes(trueIndex) && trueIndex !== State.runtime.currentWordIndex) || p.length === 1) {
                 acc.push({ i: trueIndex, v: (w.goodVotes || 0) + (w.badVotes || 0) });
            }
            return acc;
        }, []);
        
        if (!av.length) av = p.map(w => ({ i: State.runtime.allWords.indexOf(w), v: 0 }));
        if (av.length === 0) return; 

        let tw = 0;
        av = av.map(c => {
            let w = 1.0 / (c.v + 1);
            if (State.runtime.allWords[c.i].text.toUpperCase() === CAKE.text) w *= CONFIG.BOOST_FACTOR;
            tw += w;
            return { i: c.i, w };
        });
        
        let rnd = Math.random() * tw, sel = av[0].i; 
        for (let it of av) {
            rnd -= it.w;
            if (rnd <= 0) { sel = it.i; break; }
        }
        
        State.runtime.currentWordIndex = sel;
        State.data.seenHistory.push(sel);
        if (State.data.seenHistory.length > CONFIG.HISTORY_SIZE) State.data.seenHistory.shift();
        State.save('seenHistory', State.data.seenHistory);
        UIManager.displayWord(State.runtime.allWords[sel]);
    },

    loadSpecial(t) {
        const i = State.runtime.allWords.findIndex(w => w.text.toUpperCase() === t);
        if (i !== -1) {
            State.runtime.currentWordIndex = i;
            UIManager.displayWord(State.runtime.allWords[i]);
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
                    if (def.example) h += `<p class="text-sm text-gray-500 pl-4 italic">"${def.example}"</p>`;
                });
                h += '</ol></div>';
            });
            d.innerHTML = h;
        } catch {
            d.innerHTML = '<p class="text-red-500">Definition not found.</p>';
        }
    },

    handleCooldown() {
        State.runtime.isCoolingDown = true;
        const t = CONFIG.VOTE.COOLDOWN_TIERS;
        let r = t[Math.min(State.runtime.mashLevel, t.length - 1)];
        UIManager.showMessage(`Mashing detected. Wait ${r}s...`, true);
        Haptics.heavy(); 
        
        State.runtime.cooldownTimer = setInterval(() => {
            r--;
            if (r > 0) UIManager.showMessage(`Wait ${r}s...`, true);
            else {
                clearInterval(State.runtime.cooldownTimer);
                State.runtime.isCoolingDown = false;
                State.runtime.mashCount = 0; 
                State.runtime.mashLevel++;
                UIManager.displayWord(State.runtime.allWords[State.runtime.currentWordIndex]);
            }
        }, 1000);
    },

    async vote(t, s = false) {
        if (State.runtime.isCoolingDown) return;
        const n = Date.now();
        if (State.runtime.lastVoteTime > 0 && (n - State.runtime.lastVoteTime) > CONFIG.VOTE.STREAK_WINDOW) {
            State.runtime.mashCount = 1;
        } else {
            State.runtime.mashCount++;
        }
        State.runtime.lastVoteTime = n;

        if (State.runtime.mashCount > CONFIG.VOTE.MASH_LIMIT) {
            this.handleCooldown();
            return;
        }
        if (!s) {
            if (t === 'notWord') Haptics.heavy();
            else Haptics.medium();
        }
        const w = State.runtime.allWords[State.runtime.currentWordIndex],
            up = w.text.toUpperCase(),
            { CAKE, LLAMA, POTATO, SQUIRREL, MASON } = CONFIG.SPECIAL;
        
        UIManager.disableButtons(true);
        const wd = DOM.game.wordDisplay;
        const colors = Accessibility.getColors();
        
        if (!s && (t === 'good' || t === 'bad')) {
            Game.cleanStyles(wd);
            wd.style.setProperty('--dynamic-swipe-color', t === 'good' ? colors.good : colors.bad);
            wd.classList.add('override-theme-color', 'color-fade');
            wd.style.color = t === 'good' ? colors.good : colors.bad;
            await new Promise(r => setTimeout(r, 50));
            wd.classList.remove('color-fade');
            wd.classList.add(t === 'good' ? 'animate-fly-left' : 'animate-fly-right');
            
            if (t === 'good') SoundManager.playGood();
            else SoundManager.playBad();
        }
        
        const hSpec = (c, k) => {
            State.unlockBadge(k);
            Game.cleanStyles(wd);
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
			
			StreakManager.handleSuccess();
            
            if (State.runtime.isDailyMode) {
    // 1. Increment Progress
    State.data.daily.progress++;
    State.save('daily', State.data.daily);

    // 2. Check if Goal Reached
    if (State.data.daily.progress < DAILY_GOAL) {
        // --- CONTINUE CHALLENGE ---
        const nextWord = State.runtime.dailyWords[State.data.daily.progress];
        const realIdx = State.runtime.allWords.indexOf(nextWord);
        State.runtime.currentWordIndex = realIdx;

        UIManager.showPostVoteMessage(`Good! ${DAILY_GOAL - State.data.daily.progress} words left...`);
        
        // Delay slightly to allow the "Vote" animation to finish
        setTimeout(() => {
            UIManager.displayWord(nextWord);
            UIManager.showMessage(`Daily Challenge: ${State.data.daily.progress + 1} / ${DAILY_GOAL}`);
        }, 600);

    } else {
        // --- FINISH CHALLENGE (Streak Update) ---
        const today = new Date();
        const dStr = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        
        // Calculate Streak
        // (Only calculate if we haven't already marked it complete for today in a previous session)
        // Since we checked progress at start, we know this is the winning moment.
        let s = State.data.daily.streak;
        const last = State.data.daily.lastDate; // This is actually 'today' because we set it in activate
        
        // We need the *previous* recorded completion date to verify streak continuity.
        // For simplicity, we assume if they are playing today, lastDate is already set to today.
        // We'll trust the stored streak. To be safer, you might want to store 'lastCompletedDate'.
        // But assuming standard play:
        
        // Logic: If they completed it yesterday, streak++, else streak = 1.
        // *However*, since we update lastDate on *activation*, checking date diff is tricky.
        // *Fix*: We just increment. If you want strict checking, you need a 'lastStreakDate' separate from 'lastDate'.
        // For now, simple increment:
        s++; 

        State.save('daily', { ...State.data.daily, streak: s, progress: DAILY_GOAL });

        // Update UI
        DOM.daily.streakResult.textContent = '🔥 ' + s;
        
        // Calculate Rank based on the *last* word voted on
        const { topGood } = UIManager.getRankedLists(0);
        const rank = topGood.findIndex(x => x.text === w.text) + 1;
        DOM.daily.worldRank.textContent = rank > 0 ? '#' + rank : 'Unranked';

        this.checkDailyStatus();
        setTimeout(() => ModalManager.toggle('dailyResult', true), 600);
    }
}

            let m = '';
            if (un) m = "🎉 New Theme Unlocked!";
            else if (State.data.settings.showPercentages && (t === 'good' || t === 'bad')) {
                const tot = (w.goodVotes || 0) + (w.badVotes || 0);
                const p = Math.round((w[`${t}Votes`] / tot) * 100);
                m = `${t==='good'?'Good':'Bad'} vote! ${p}% agree.`;
            }
            if (State.data.settings.showTips) {
                State.save('voteCounterForTips', State.data.voteCounterForTips + 1);
                if (State.data.voteCounterForTips % CONFIG.TIP_COOLDOWN === 0) m = GAME_TIPS[Math.floor(Math.random() * GAME_TIPS.length)];
            }
            UIManager.showPostVoteMessage(m);
            if (t === 'good' || t === 'bad') Haptics.medium();
            UIManager.updateStats();
            setTimeout(() => {
                wd.classList.remove('animate-fly-left', 'animate-fly-right', 'swipe-good-color', 'swipe-bad-color', 'override-theme-color');
                wd.style.transform = '';
                wd.style.opacity = '1';
                wd.style.color = '';
                if (!State.runtime.isDailyMode) {
                    this.nextWord();
                    this.refreshData(false);
                }
            }, (t === 'good' || t === 'bad') ? 600 : 0);

        } catch (e) {
            UIManager.showMessage("Vote Failed", true);
            wd.classList.remove('animate-fly-left', 'animate-fly-right', 'swipe-good-color', 'swipe-bad-color', 'override-theme-color');
            UIManager.disableButtons(false);
        }
    }
};

const StreakManager = {
    timer: null,
    loopTimer: null, 
    LIMIT: 5500, 

    handleSuccess() {
        const now = Date.now();
        if (State.runtime.streak > 0 && (now - State.runtime.lastStreakTime) > this.LIMIT) {
            this.endStreak();
            State.runtime.streak = 1; 
        } else {
            State.runtime.streak++;
        }
        
        State.runtime.lastStreakTime = now;
        const currentStreak = State.runtime.streak;
        
        if (currentStreak > State.data.longestStreak) {
            State.save('longestStreak', currentStreak);
            const el = document.getElementById('streak-display-value');
            if(el) el.textContent = currentStreak + " Words";
        }

        if (currentStreak >= 5) {
            if (currentStreak === 5) this.showNotification("🔥 STREAK STARTED!", "success");
            this.updateScreenCounter(true);
        } else {
             const counter = document.getElementById('streak-floating-counter');
             if(counter) counter.style.opacity = '0';
        }

        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => this.endStreak(), this.LIMIT);
    },

    endStreak() {
        if (this.timer) clearTimeout(this.timer);
        const finalScore = State.runtime.streak;
        
        if (finalScore >= 5) {
            this.showNotification(`Streak Ended: ${finalScore} Words`, "neutral");
            this.checkHighScore(finalScore);
        }
        
        const counter = document.getElementById('streak-floating-counter');
        if (counter) {
            counter.style.opacity = '0';
            setTimeout(() => counter.remove(), 300);
        }
        State.runtime.streak = 0;
    },

    updateScreenCounter(pulse) {
        let el = document.getElementById('streak-floating-counter');
        if (!el) {
            el = document.createElement('div');
            el.id = 'streak-floating-counter';
            el.style.cssText = `position: fixed; top: 15%; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #FF512F, #DD2476); color: white; padding: 10px 25px; border-radius: 50px; font-weight: 900; font-size: 1.8rem; z-index: 99999; box-shadow: 0 4px 15px rgba(0,0,0,0.3); pointer-events: none; transition: transform 0.1s, opacity 0.2s; opacity: 1; border: 2px solid white; text-shadow: 0 2px 4px rgba(0,0,0,0.2);`;
            document.body.appendChild(el);
        }
        el.style.opacity = '1';
        el.innerHTML = `<span>🔥</span> ${State.runtime.streak}`;
        if (pulse) {
            requestAnimationFrame(() => {
                el.style.transform = 'translateX(-50%) scale(1.3)';
                setTimeout(() => el.style.transform = 'translateX(-50%) scale(1)', 150);
            });
        }
    },

    showNotification(msg, type) {
        const notif = document.createElement('div');
        notif.textContent = msg;
        notif.style.cssText = `position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: ${type === 'success' ? '#10b981' : '#374151'}; color: white; padding: 10px 20px; border-radius: 8px; font-weight: bold; z-index: 99999; box-shadow: 0 4px 6px rgba(0,0,0,0.2); animation: fadeOut 2.5s forwards;`;
        if(!document.getElementById('notif-style')) {
            const s = document.createElement('style');
            s.id = 'notif-style';
            s.innerHTML = `@keyframes fadeOut { 0% {opacity:1;} 80% {opacity:1;} 100% {opacity:0;} }`;
            document.head.appendChild(s);
        }
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 2500);
    },

    checkHighScore(score) {
        if (!State.data.highScores) State.data.highScores = [];
        const scores = State.data.highScores;
        const minScore = scores.length < 8 ? 0 : scores[scores.length - 1].score;
        
        if (score > minScore || scores.length < 8) {
            setTimeout(() => this.promptName(score), 500);
        }
    },

    promptName(score) {
        if(document.getElementById('nameEntryModal')) return;
        const html = `
            <div id="nameEntryModal" style="position:fixed; inset:0; background:rgba(0,0,0,0.9); z-index:100000; display:flex; align-items:center; justify-content:center;">
                <div style="background:white; padding:2rem; border-radius:1rem; text-align:center; max-width:90%; width:300px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
                    <h2 style="color:#4f46e5; font-size:1.5rem; font-weight:900; margin-bottom:0.5rem; text-transform: uppercase;">New High Score!</h2>
                    <p style="color:#4b5563; font-size:1.25rem; font-weight:bold; margin-bottom:1.5rem;">Streak: ${score}</p>
                    <input type="text" id="hsNameInput" maxlength="3" placeholder="AAA" 
                        style="font-size:2rem; text-align:center; width:100%; letter-spacing:0.2em; border:2px solid #e5e7eb; border-radius:0.5rem; padding:0.5rem; text-transform:uppercase; margin-bottom:1.5rem; font-weight:bold;">
                    <button id="hsSaveBtn" style="width:100%; padding:1rem; background:#4f46e5; color:white; border:none; border-radius:0.5rem; font-weight:bold; font-size:1rem; cursor:pointer; transition: background 0.2s;">SAVE SCORE</button>
                </div>
            </div>`;
        const div = document.createElement('div');
        div.innerHTML = html;
        document.body.appendChild(div.firstElementChild);

        const saveFn = async () => {
            const name = (document.getElementById('hsNameInput').value || "AAA").toUpperCase();
            const scores = State.data.highScores || [];
            scores.push({ name, score, date: Date.now() });
            scores.sort((a,b) => b.score - a.score); 
            if(scores.length > 8) scores.pop();
            State.save('highScores', scores);
            API.submitHighScore(name, score);
            document.getElementById('nameEntryModal').remove();
            this.showLeaderboard();
        };
        document.getElementById('hsSaveBtn').onclick = saveFn;
    },

    async shareScores() {
        const scores = State.data.highScores || [];
        const best = scores.length ? scores[0].score : 0;
        const name = State.data.username || "I";
        const text = `${name} just hit a streak of ${best} on Good Word / Bad Word! 🏆 Can you beat the high scores?`;
        const url = window.location.origin;

        if (navigator.share) {
            try { 
                await navigator.share({ title: 'High Scores', text: text, url: url }); 
            } catch(e) {
                // Share cancelled
            }
        } else {
            try { 
                await navigator.clipboard.writeText(`${text} ${url}`); 
                UIManager.showPostVoteMessage("Score copied to clipboard! 📋"); 
            } catch(e) {
                UIManager.showPostVoteMessage("Could not share.");
            }
        }
    },

    async showLeaderboard() {
        if (!document.getElementById('crt-styles')) {
            const s = document.createElement('style');
            s.id = 'crt-styles';
            s.innerHTML = `
                @keyframes crt-flicker { 0% {opacity:0.95;} 2% {opacity:0.99;} 4% {opacity:0.95;} 100% {opacity:0.95;} }
                @keyframes crt-glow { 0% {text-shadow: 0 0 5px #f0f, 0 0 10px #f0f;} 50% {text-shadow: 0 0 15px #0ff, 0 0 20px #0ff;} 100% {text-shadow: 0 0 5px #f0f, 0 0 10px #f0f;} }
                @keyframes scanline-scroll { 0% {background-position: 0 0;} 100% {background-position: 0 100%;} }
                .crt-monitor {
                    background-color: #050505;
                    box-shadow: 0 0 0 3px #222, 0 0 40px rgba(0,0,0,0.8);
                    border-radius: 20px;
                    position: relative; overflow: hidden;
                    animation: crt-flicker 0.1s infinite;
                    border: 4px solid #333;
                }
                .crt-overlay {
                    position: absolute; inset: 0; pointer-events: none; z-index: 50;
                    background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
                    background-size: 100% 3px, 4px 100%;
                    animation: scanline-scroll 10s linear infinite;
                }
                .crt-content { padding: 2rem; position: relative; z-index: 10; }
                .crt-text { font-family: 'Courier New', monospace; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 900; text-shadow: 2px 2px 0px #000; }
                .crt-title { animation: crt-glow 2s infinite alternate; color: #fff; font-size: 2rem; }
                .crt-row { border-bottom: 2px dashed rgba(255,255,255,0.2); }
            `;
            document.head.appendChild(s);
        }

        // --- Z-INDEX CHANGED TO 300 (Higher than spider text) ---
        const html = `
            <div id="highScoreModal" class="fixed inset-0 bg-black/90 z-[300] flex items-center justify-center p-4 backdrop-blur-md" onclick="StreakManager.closeLeaderboard()">
                <div class="crt-monitor w-full max-w-md transform transition-all scale-100" onclick="event.stopPropagation()">
                    <div class="crt-overlay"></div>
                    <div class="crt-content">
                        <div class="text-center mb-6">
                            <h2 class="crt-text crt-title mb-2">STREAK HIGH SCORES</h2>
                            <div class="h-1 w-full bg-gradient-to-r from-pink-500 to-cyan-500 shadow-[0_0_10px_white]"></div>
                        </div>
                        <div id="hs-display-area" class="min-h-[340px]">
                            <div class="text-center mt-20 text-cyan-400 crt-text animate-pulse">CONNECTING...</div>
                        </div>
                        
                        <div class="mt-4 flex justify-between items-center crt-text text-xs text-gray-400 font-bold">
                             <span id="hs-page-indicator">LOADING</span>
                             <div class="flex gap-2">
                                <button onclick="StreakManager.shareScores()" class="px-2 py-1 border border-gray-600 rounded hover:bg-blue-900/30 hover:text-blue-400 hover:border-blue-500 transition-colors cursor-pointer">📤 SHARE</button>
                                <button onclick="StreakManager.closeLeaderboard()" class="px-2 py-1 border border-gray-600 rounded hover:bg-red-900/30 hover:text-red-400 hover:border-red-500 transition-colors cursor-pointer">⏏ EJECT DISK</button>
                             </div>
                        </div>
                    </div>
                </div>
            </div>`;

        const div = document.createElement('div');
        div.innerHTML = html;
        document.body.appendChild(div.firstElementChild);

        const globalScores = await API.getGlobalScores();
        const topGlobal = (globalScores && globalScores.length) ? globalScores.slice(0, 8) : [];
        const localScores = (State.data.highScores || []).slice(0, 8);
        const username = State.data.username || "PLAYER";

        const renderRow = (s, i, color) => `
            <div class="flex justify-between items-center crt-text py-2 crt-row">
                <div class="flex gap-3">
                    <span class="text-gray-500 text-lg">#${(i+1).toString().padStart(2,'0')}</span>
                    <span class="${color} font-black text-2xl drop-shadow-[0_0_3px_rgba(255,255,255,0.5)]">${s.name.substring(0,3).toUpperCase()}</span>
                </div>
                <span class="text-white tracking-widest text-3xl">${s.score.toString().padStart(4,'0')}</span>
            </div>`;

        const area = document.getElementById('hs-display-area');
        const indicator = document.getElementById('hs-page-indicator');
        
        let showingGlobal = true;

        const renderPage = () => {
            if(!document.getElementById('highScoreModal')) return;

            area.style.opacity = '0';
            setTimeout(() => {
                if (showingGlobal) {
                    indicator.textContent = "PAGE 1/2 [WORLD]";
                    indicator.style.color = '#34d399'; 
                    let h = `<div class="text-cyan-400 text-sm crt-text mb-4 border-b-2 border-cyan-700 pb-1 font-black">WORLD RANKINGS</div>`;
                    if (topGlobal.length === 0) h += '<div class="text-gray-500 text-xs crt-text mt-8 text-center">NO DATA FOUND</div>';
                    else h += topGlobal.map((s,i) => renderRow(s, i, 'text-cyan-400')).join('');
                    area.innerHTML = h;
                } else {
                    indicator.textContent = "PAGE 2/2 [LOCAL]";
                    indicator.style.color = '#fbbf24'; 
                    let h = `<div class="text-yellow-400 text-sm crt-text mb-4 border-b-2 border-yellow-700 pb-1 font-black">${username.toUpperCase()}'S RECORDS</div>`;
                    if (localScores.length === 0) h += '<div class="text-gray-500 text-xs crt-text mt-8 text-center">PLAY TO SET SCORES</div>';
                    else h += localScores.map((s,i) => renderRow(s, i, 'text-yellow-400')).join('');
                    area.innerHTML = h;
                }
                area.style.transition = 'opacity 0.2s';
                area.style.opacity = '1';
                showingGlobal = !showingGlobal;
                this.loopTimer = setTimeout(renderPage, 4000);
            }, 200);
        };
        renderPage();
    },
    
    closeLeaderboard() {
        const el = document.getElementById('highScoreModal');
        if(el) el.remove();
        if (this.loopTimer) clearTimeout(this.loopTimer);
    }
};


    window.onload = Game.init.bind(Game);

    console.log("%c Good Word / Bad Word ", "background: #4f46e5; color: #bada55; padding: 4px; border-radius: 4px;");
    console.log("Play fair! ️😇");

})();
