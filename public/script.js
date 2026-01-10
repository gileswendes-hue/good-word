(function() {
const CONFIG = {
    API_BASE_URL: '/api/words',
	SCORE_API_URL: '/api/scores',
    APP_VERSION: '6.2.21', 
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
        MASH_LIMIT: 5,
        COOLDOWN_TIERS: [10, 20, 30],
        STREAK_WINDOW: 2000,
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
        space: 'U1BBQ0V8R0FMQVhZfFBMQU5FVHxTVEFSfE9SQklU',
        woodland: 'V09PRExBTkR8Rk9SRVNUfFRSRUVTfEZPWEVTfEJBREdFUnxERUVSfFJBQkJJVHxBQ09STnxNVVNIUk9PTXxGRVJOfFVOREVSR1JPV1RIfENBTk9QWXxUSElDS0VUfEdMQURF'
    },
};

// P2P Channel colors for visual identification
const P2P_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#eab308', '#8b5cf6', '#ec4899'];

const ContentFilter = {
    // Base64 encoded to avoid raw slurs in source code
    // Includes racial slurs, homophobic/transphobic terms, and severe profanity
    _encoded: 'bmlnZ2VyfG5pZ2dhfGZhZ2dvdHxmYWd8ZHlrZXx0cmFubnl8cmV0YXJkfHNwYXN0aWN8Y2hpbmt8Z29va3xzcGljfGtpa2V8d2V0YmFja3xiZWFuZXJ8Y29vbnxyYWdoZWFkfHRvd2VsaGVhZHxjYW1lbGpvY2tleXxwYWtpfHdvcHxqYXB8Y3JhY2tlcnxob25reXxncmluZ298bmVncm98Y29sb3JlZHxuZWdyZXNzfG11bGF0dG98aGFsZmJyZWVkfHF1ZWVyfHF1ZWVyc3xob21vfGhvbW9zfGxlc2JvfHNoZW1hbGV8aGVzaGV8dHJhbnN2ZXN0aXRlfGhlcm1hcGhyb2RpdGV8c29kb21pdGV8YnVnZ2VyfG5vbmNlfHBlZG98cGFlZG98cGVkb3BoaWxlfHBlcnZlcnR8cmFwaXN0fG1vbGVzdGVyfG5henl8bmF6aXN8aGl0bGVyfGhvbG9jYXVzdHxqaWhhZHxqaWhhZGl8dGVycm9yaXN0',
    _patterns: null,
    
    init() {
        try {
            const decoded = atob(this._encoded);
            const terms = decoded.split('|');
            // Create pattern that matches whole words and common evasions
            this._patterns = terms.map(term => {
                // Match the term with common character substitutions
                const escaped = term
                    .replace(/a/g, '[a@4]')
                    .replace(/e/g, '[e3]')
                    .replace(/i/g, '[i1!]')
                    .replace(/o/g, '[o0]')
                    .replace(/s/g, '[s$5]')
                    .replace(/g/g, '[gq9]');
                return new RegExp(`\\b${escaped}s?\\b`, 'i');
            });
        } catch(e) {
            console.warn('ContentFilter init failed');
            this._patterns = [];
        }
    },
    
    isOffensive(text) {
        if (!this._patterns) this.init();
        if (!text || typeof text !== 'string') return false;
        const normalized = text.toLowerCase().replace(/[_\-\.]/g, '');
        return this._patterns.some(pattern => pattern.test(normalized));
    },
    
    // For server-side, export the raw check
    getOffensiveTerms() {
        try {
            return atob(this._encoded).split('|');
        } catch(e) {
            return [];
        }
    }
};

// Initialize filter
ContentFilter.init();

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
        communityGoalBar: document.getElementById('communityGoalBar'),
        communityGoalText: document.getElementById('communityGoalText'),
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
        message: document.getElementById('postVoteMessage'),
        historyList: document.getElementById('history-list') // <--- RESTORED (Fixes Multiplayer Crash)
    },
    // --- RESTORED (Fixes Loading Crash) ---
    screens: {
        loading: document.getElementById('loading-screen'),
        start: document.getElementById('start-screen'),
        game: document.getElementById('game-screen')
    },
    // --------------------------------------
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
            space: document.getElementById('space-effect'),
            woodland: document.getElementById('woodland-effect')
        }
    },
    modals: {
        submission: document.getElementById('submissionModal'),
        fullRankings: document.getElementById('fullRankingsModalContainer'),
        definition: document.getElementById('definitionModalContainer'),
        compare: document.getElementById('compareModalContainer'),
        settings: document.getElementById('settingsModalContainer'),
        profile: document.getElementById('profileModal'),
        dailyResult: document.getElementById('dailyResultModal'),
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
            hideMultiplayer: document.getElementById('toggleHideMultiplayer'),
            mute: null, 
            zeroVotes: null
        }
    },
    general: {
        version: document.querySelector('.version-indicator'),
		voteLeaderboardTable: document.getElementById('voteLeaderboardTable'),
        voteChartCanvas: document.getElementById('voteChartCanvas')
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
	enableWeather: false,
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
    randomizeTheme: true,
	noStreaksMode: false,
	controversialOnly: false,
    hideMultiplayer: false,
    extremeDrinkingMode: false,
    hideCards: false
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
		discovered: safeParse('discoveredFeatures', []),
		
		spiderEatLog: safeParse('spiderEatLog', []), 
        spiderFullUntil: parseInt(localStorage.getItem('spiderFullUntil') || 0),
		
        snowmanCollected: parseInt(localStorage.getItem('snowmanCollected') || 0),

        insectStats: {
            saved: parseInt(localStorage.getItem('insectSaved') || 0),
            eaten: parseInt(localStorage.getItem('insectEaten') || 0),
            teased: parseInt(localStorage.getItem('insectTeased') || 0),
            splatted: parseInt(localStorage.getItem('insectSplatted') || 0),
            collection: JSON.parse(localStorage.getItem('insectCollection') || '[]')
		},

        wordHistory: JSON.parse(localStorage.getItem('wordCountHistory') || '[]'),       
        fishStats: {
            caught: parseInt(localStorage.getItem('fishCaught') || 0),
            spared: parseInt(localStorage.getItem('fishSpared') || 0)
        },
        
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
            bestStreak: parseInt(localStorage.getItem('dailyBestStreak') || 0),
            lastDate: localStorage.getItem('dailyLastDate') || '',
            goldenWordsFound: parseInt(localStorage.getItem('goldenWordsFound') || 0)
        }
    },

    runtime: {
		currentTheme: 'default',
		offlineChannel: 1,
        allWords: [],
        history: [],
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

    init() {
        console.log("State Initialized");
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
		else if (k === 'discovered') s.setItem('discoveredFeatures', JSON.stringify(v));
        else if (k === 'snowmanCollected') s.setItem('snowmanCollected', v);
        else if (k === 'daily') {
            s.setItem('dailyStreak', v.streak);
            s.setItem('dailyLastDate', v.lastDate);
            if (v.bestStreak !== undefined) s.setItem('dailyBestStreak', v.bestStreak);
            if (v.goldenWordsFound !== undefined) s.setItem('goldenWordsFound', v.goldenWordsFound);
        }
        else if (k === 'profilePhoto') s.setItem('profilePhoto', v);
        else if (k === 'lastMosquitoSpawn') s.setItem(k, v);
		
		else if (k === 'spiderEatLog') s.setItem('spiderEatLog', JSON.stringify(v));
        else if (k === 'spiderFullUntil') s.setItem('spiderFullUntil', v);
		
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
        if (confirm("⚠️ Are you sure you want to clear all data?\n\nMake sure you have exported a backup first if you want to save your progress!")) {
            if (confirm("Final Warning: This will wipe all stats, badges, and history. Continue?")) {
                localStorage.clear();
                window.location.reload();
            }
        }
    }
};

const DataManager = {
    SALT: "ch34T3r5_N3v3r_wIn",

    generateHash(data) {
        const str = JSON.stringify(data) + this.SALT;
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    },

    exportData() {
        const data = JSON.parse(JSON.stringify(State.data));
        
        const payload = {
            data: data,
            hash: this.generateHash(data),
            timestamp: Date.now(),
            version: CONFIG.APP_VERSION
        };

        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gbword_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        UIManager.showPostVoteMessage("Backup saved! 💾");
    },

    importData(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parsed = JSON.parse(e.target.result);

                if (!parsed.hash || !parsed.data) {
                    alert("Error: Invalid backup file format.");
                    return;
                }

                const calculatedHash = this.generateHash(parsed.data);
                if (calculatedHash !== parsed.hash) {
                    alert("⚠️ Tamper Protection: This backup file has been modified and cannot be loaded.");
                    return;
                }

                if (confirm(`Restore data from ${new Date(parsed.timestamp).toLocaleDateString()}? Current progress will be overwritten.`)) {
                    
                    Object.keys(parsed.data).forEach(key => {
                        State.save(key, parsed.data[key]);
                    });

                    if (parsed.data.badges) {
                        Object.entries(parsed.data.badges).forEach(([badgeName, isUnlocked]) => {
                            if (isUnlocked) {
                                localStorage.setItem(`${badgeName}BadgeUnlocked`, 'true');
                            } else {
                                localStorage.removeItem(`${badgeName}BadgeUnlocked`);
                            }
                        });
                    }

                    alert("Data restored successfully! Reloading...");
                    window.location.reload();
                }

            } catch (err) {
                console.error(err);
                alert("Failed to parse backup file.");
            }
        };
        reader.readAsText(file);
    }
};

const OfflineManager = {
    // Check if we are in offline mode
    isActive() {
        return State.data.settings.offlineMode;
    },

    // Download ALL words to play offline (500+)
    async fillCache() {
        try {
            UIManager.showMessage("Downloading words... 📥");
            const res = await fetch('/api/words/all');
            if (!res.ok) throw new Error('Network error');
            const data = await res.json();
            
            if (!data || data.length === 0) {
                throw new Error('No words received');
            }
            
            // Store with vote counts preserved
            State.data.offlineCache = data.map(w => ({
                _id: w._id,
                text: w.text,
                goodVotes: w.goodVotes || 0,
                badVotes: w.badVotes || 0,
                notWordVotes: w.notWordVotes || 0
            }));
            State.save('offlineCache', State.data.offlineCache);
            
            // Initialize vote queue if not exists
            if (!State.data.voteQueue) {
                State.data.voteQueue = [];
                State.save('voteQueue', []);
            }
            
            UIManager.showMessage(`Cached ${data.length} words! 📴`);
            return true;
        } catch (e) {
            console.warn("Offline download failed", e);
            // Fallback to existing cache if available
            return State.data.offlineCache && State.data.offlineCache.length > 0;
        }
    },
    
    // Queue a vote for later sync
    queueVote(wordId, voteType) {
        if (!State.data.voteQueue) State.data.voteQueue = [];
        
        // Add to queue
        State.data.voteQueue.push({
            id: wordId,
            type: voteType,
            timestamp: Date.now()
        });
        State.save('voteQueue', State.data.voteQueue);
        
        // Update local cache counts (for persistence)
        const cacheWord = State.data.offlineCache?.find(w => w._id === wordId);
        if (cacheWord) {
            if (voteType === 'good') cacheWord.goodVotes = (cacheWord.goodVotes || 0) + 1;
            else if (voteType === 'bad') cacheWord.badVotes = (cacheWord.badVotes || 0) + 1;
            State.save('offlineCache', State.data.offlineCache);
        }
        
        // Also update runtime words (for display)
        const runtimeWord = State.runtime.allWords?.find(w => w._id === wordId);
        if (runtimeWord) {
            if (voteType === 'good') runtimeWord.goodVotes = (runtimeWord.goodVotes || 0) + 1;
            else if (voteType === 'bad') runtimeWord.badVotes = (runtimeWord.badVotes || 0) + 1;
        }
        
        // Update the offline indicator to show queue count
        UIManager.updateOfflineIndicator();
    },

    // Sync queued votes when back online
    async sync() {
        const queue = State.data.voteQueue || [];
        if (queue.length === 0) {
            UIManager.showMessage("No votes to sync ✓");
            return;
        }

        UIManager.showMessage(`Syncing ${queue.length} votes... 📡`);
        let synced = 0;
        
        // Process votes
        for (let i = queue.length - 1; i >= 0; i--) {
            try {
                const vote = queue[i];
                await fetch(`${CONFIG.API_BASE_URL}/${vote.id}/vote`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ voteType: vote.type })
                });
                queue.splice(i, 1);
                synced++;
            } catch (e) {
                console.warn("Sync failed for vote", i);
            }
        }
        
        State.data.voteQueue = queue;
        State.save('voteQueue', queue);
        UIManager.showMessage(`Synced ${synced} votes! ✓`);
    },

    // Toggle Offline Mode (single-player)
    async toggle(active) {
        if (active) {
            // ACTIVATING OFFLINE MODE
            const success = await this.fillCache();
            
            if (success) {
                State.data.settings.offlineMode = true;
                State.save('settings', State.data.settings);
                
                // Load cached words into game (make a copy to avoid mutating cache)
                // Filter out words marked as "not a word" (same as online mode)
                State.runtime.allWords = State.data.offlineCache
                    .filter(w => (w.notWordVotes || 0) < 3)
                    .map(w => ({...w}));
                
                // Shuffle them
                for (let i = State.runtime.allWords.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [State.runtime.allWords[i], State.runtime.allWords[j]] = [State.runtime.allWords[j], State.runtime.allWords[i]];
                }
                State.runtime.currentWordIndex = 0;
                
                UIManager.updateStats();
                UIManager.updateOfflineIndicator();
                UIManager.showPostVoteMessage(`Offline: ${State.runtime.allWords.length} words ready! 📴`);
                Game.nextWord();
            } else {
                alert("Could not download words. Check connection.");
            }
        } else {
            // DEACTIVATING OFFLINE MODE - sync and fetch fresh data
            await this.sync();
            State.data.settings.offlineMode = false;
            State.save('settings', State.data.settings);
            
            UIManager.updateOfflineIndicator();
            
            // Refresh with fresh online data
            await Game.refreshData();
        }
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


// ============================================
// P2P OFFLINE MULTIPLAYER - WebRTC Based
// ============================================
// Host downloads words, distributes to peers via WebRTC data channel
// Real-time sync of word index, no server needed after connection


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
    COOLDOWN: 1 * 60 * 1000, 

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
        if (State.runtime.currentTheme !== 'halloween') return; 
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

            }
            else if (this.state === 'flying') {
                this.splat();
            }
        };

	document.body.appendChild(this.el);
        this.state = 'stuck';
        
        setTimeout(() => {
            if (State.runtime.currentTheme === 'halloween') {
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

        // --- FAT SPIDER LOGIC ---
        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000);
        if (!State.data.spiderEatLog) State.data.spiderEatLog = [];
        
        // 1. Log this bug
        State.data.spiderEatLog.push(now);
        
        // 2. Keep only bugs from last hour (they "digest" after 1 hour)
        State.data.spiderEatLog = State.data.spiderEatLog.filter(t => t > oneHourAgo);
        State.save('spiderEatLog', State.data.spiderEatLog);

        // 3. Check for Fullness (5 bugs in last hour = max size)
        if (State.data.spiderEatLog.length >= 5) {
            setTimeout(() => UIManager.showPostVoteMessage("The spider is stuffed! 🕷️💤"), 1500);
        }
        
        // Visual update now happens in spiderHunt after eating (puff animation)

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
        if (State.data.settings.enableTilt && State.runtime.currentTheme === 'default') {
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
    gy: 0.7,
    grid: {},
    gridSize: 70,
    frameSkip: 0,
    handleOrientation(e) {
        const x = e.gamma || 0,
            y = e.beta || 0;
        const tx = Math.min(Math.max(x / 6, -0.6), 0.6);
        const ty = Math.min(Math.max(y / 6, -0.6), 0.6);
        Physics.gx += (tx - Physics.gx) * 0.05;
        Physics.gy += (ty - Physics.gy) * 0.05
    },
    getGridKey(x, y) {
        return `${Math.floor(x / this.gridSize)},${Math.floor(y / this.gridSize)}`;
    },
    buildGrid() {
        this.grid = {};
        for (let i = 0; i < this.balls.length; i++) {
            const b = this.balls[i];
            const key = this.getGridKey(b.x + b.r, b.y + b.r);
            if (!this.grid[key]) this.grid[key] = [];
            this.grid[key].push(i);
        }
    },
    getNeighbors(b) {
        const cx = Math.floor((b.x + b.r) / this.gridSize);
        const cy = Math.floor((b.y + b.r) / this.gridSize);
        const neighbors = [];
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const key = `${cx + dx},${cy + dy}`;
                if (this.grid[key]) neighbors.push(...this.grid[key]);
            }
        }
        return neighbors;
    },
    run() {
        const W = window.innerWidth,
            H = window.innerHeight;
        const cylW = Math.min(W, 500),
            minX = (W - cylW) / 2,
            maxX = minX + cylW;
        const balls = Physics.balls;
        const len = balls.length;
        
        // Reduce physics substeps on slower frames (adaptive quality)
        const substeps = len > 50 ? 4 : 6;
        
        for (let s = 0; s < substeps; s++) {
            // Update positions
            for (let i = 0; i < len; i++) {
                const b = balls[i];
                if (!b.drag) {
                    b.vx += Physics.gx / substeps;
                    b.vy += Physics.gy / substeps;
                    b.x += b.vx;
                    b.y += b.vy;
                    b.vx *= 0.88;
                    b.vy *= 0.88;
                    if (Math.abs(b.vx) < 0.08) b.vx = 0;
                    if (Math.abs(b.vy) < 0.08) b.vy = 0;
                    if (b.x < minX) { b.x = minX; b.vx *= -0.15 }
                    if (b.x > maxX - b.r * 2) { b.x = maxX - b.r * 2; b.vx *= -0.15 }
                    if (b.y < 0) { b.y = 0; b.vy *= -0.15 }
                    if (b.y > H - b.r * 2) { b.y = H - b.r * 2; b.vy *= -0.15 }
                }
            }
            
            // Build spatial grid for collision detection
            Physics.buildGrid();
            
            // Collision detection using spatial partitioning
            const checked = new Set();
            for (let i = 0; i < len; i++) {
                const b1 = balls[i];
                const neighbors = Physics.getNeighbors(b1);
                for (const j of neighbors) {
                    if (j <= i) continue;
                    const pairKey = i < j ? `${i},${j}` : `${j},${i}`;
                    if (checked.has(pairKey)) continue;
                    checked.add(pairKey);
                    
                    const b2 = balls[j];
                    const dx = (b2.x + b2.r) - (b1.x + b1.r),
                        dy = (b2.y + b2.r) - (b1.y + b1.r);
                    const distSq = dx * dx + dy * dy,
                        minDist = b1.r + b2.r + 0.5;
                    if (distSq < minDist * minDist && distSq > 0) {
                        const dist = Math.sqrt(distSq);
                        const overlap = (minDist - dist) / 2;
                        const nx = dx / dist, ny = dy / dist;
                        b1.x -= nx * overlap;
                        b1.y -= ny * overlap;
                        b2.x += nx * overlap;
                        b2.y += ny * overlap;
                        if (!b1.drag && !b2.drag) {
                            const p = 2 * (b1.vx * nx + b1.vy * ny - b2.vx * nx - b2.vy * ny) / 2;
                            b1.vx -= p * nx * 0.12;
                            b1.vy -= p * ny * 0.12;
                            b2.vx += p * nx * 0.12;
                            b2.vy += p * ny * 0.12
                        }
                    }
                }
            }
        }
        
        // Batch DOM updates with rounded positions for less jitter
        for (let i = 0; i < len; i++) {
            const b = balls[i];
            b.el.style.transform = `translate3d(${Math.round(b.x)}px,${Math.round(b.y)}px,0)`;
            if (b.bubble) {
                b.bubble.style.transform = `translate3d(${b.x+b.r}px,${b.y-20}px,0) translate(-50%,-100%)`
            }
        }
        Effects.ballLoop = requestAnimationFrame(Physics.run)
    }
};

const API = {

async getAllWords() {
        try {
            const res = await fetch('/api/words/all');
            return await res.json();
        } catch (e) {
            console.error("Dictionary load failed", e);
            return [];
        }
    },

    async fetchWords(forceNetwork = false) {
        if (OfflineManager.isActive() && !forceNetwork) {
            console.log("Serving from Offline Cache 🚇");
            return State.data.offlineCache; 
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); 
            
            const r = await fetch(CONFIG.API_BASE_URL, { signal: controller.signal });
            clearTimeout(timeoutId);
            
            if (!r.ok) {
                throw new Error(`Server Status ${r.status}`);
            }
            return await r.json();

        } catch (e) {
            const isConnectionError = e.name === 'AbortError' || 
                                    e.message === 'Failed to fetch' || 
                                    e.message.toLowerCase().includes('network');

            if (isConnectionError) {
                if (State.data.offlineCache && State.data.offlineCache.length > 0) {
                    UIManager.showPostVoteMessage("Connection lost. Switched to Offline. 🚇");
                    return State.data.offlineCache;
                }
                return null;
            }

            console.warn("API Error (Still Online):", e);
            return null; 
        }
    },

async fetchKidsWords() {
        try {
            // Get words source - use offline cache if in offline mode, otherwise fetch from DB
            let dbWords = [];
            if (OfflineManager.isActive()) {
                // Use offline cache for kids mode
                dbWords = State.data.offlineCache || [];
                
                // If no cache available, can't do kids mode offline
                if (dbWords.length === 0) {
                    return [{ _id: 'offline_placeholder', text: 'Go online to cache words first', goodVotes: 0, badVotes: 0, isPlaceholder: true }];
                }
            } else {
                dbWords = await this.getAllWords() || [];
            }
            
            // Try to get the kids word list file
            let safeList = [];
            try {
                const listResponse = await fetch(CONFIG.KIDS_LIST_FILE);
                if (listResponse.ok) {
                    const listText = await listResponse.text();
                    safeList = listText.split('\n')
                        .map(l => l.trim().toUpperCase())
                        .filter(l => l.length > 0);
                }
            } catch (e) {
                console.warn("Could not fetch kids word list:", e);
            }
            
            // If we have a kids word list, filter to only those words
            if (safeList.length > 0) {
                const combinedList = safeList
                    .map(text => dbWords.find(w => w.text.toUpperCase() === text))
                    .filter(w => w && w._id);
                
                if (combinedList.length > 0) {
                    return combinedList;
                }
            }
            
            // Fallback: If offline with cache but no kids list file, 
            // just use the cached words (better than nothing)
            if (OfflineManager.isActive() && dbWords.length > 0) {
                console.warn("Kids word list unavailable offline - using full cache");
                return dbWords;
            }
            
            // No words found at all
            const msg = OfflineManager.isActive() 
                ? 'Kids Mode needs online first' 
                : 'No Kids Words in DB';
            console.warn("No kids words found:", msg);
            return [{ _id: 'offline_placeholder', text: msg, goodVotes: 0, badVotes: 0, isPlaceholder: true }];

        } catch (e) {
            console.error("Kids mode load error:", e);
            // Fallback object to prevent crash
            return [{ _id: 'err', text: 'Error Loading', goodVotes: 0, badVotes: 0, isPlaceholder: true }];
        }
    },

    async vote(id, type) {
        // Skip voting for placeholder entries (temp, err, offline_placeholder, or fake kid_ IDs)
        if (!id || id === 'temp' || id === 'err' || id === 'offline_placeholder' || id.startsWith('kid_')) {
            console.warn("Skipping vote for placeholder ID:", id);
            return { ok: false, status: 400 };
        }

        if (OfflineManager.isActive()) {
            const queue = State.data.pendingVotes;
            queue.push({ id, type, time: Date.now() });
            State.save('pendingVotes', queue);
            
            UIManager.updateOfflineIndicator();

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
        // Check for offensive content
        if (ContentFilter.isOffensive(text)) {
            UIManager.showPostVoteMessage("This word is not allowed 🚫");
            return { ok: false, status: 403 };
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
    }, // <--- FIXED: Added closing brace and comma here

    async submitUserVotes(userId, username, voteCount, dailyStreak = null, bestDailyStreak = null) {
        try {
            const body = { userId, username, voteCount };
            if (dailyStreak !== null) body.dailyStreak = dailyStreak;
            if (bestDailyStreak !== null) body.bestDailyStreak = bestDailyStreak;
            await fetch('/api/leaderboard', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
        } catch (e) { 
            console.warn("Failed to submit user stats:", e); 
        }
    },
    
    async fetchLeaderboard() {
        try {
            const r = await fetch('/api/leaderboard');
            if (!r.ok) return [];
            return await r.json(); 
        } catch (e) { 
            console.error("Failed to fetch leaderboard:", e);
            return []; 
        }
    },
    
    async fetchGlobalStatsHistory() {
        try {
            const r = await fetch('/api/stats/history');
            if (!r.ok) return [];
            return await r.json();
        } catch (e) {
            console.error("Failed to fetch global stats history:", e);
            return [];
        }
    },

    async submitGlobalSnapshot(totalWords, totalVotes, goodVotes, badVotes) {
        try {
            await fetch('/api/stats/snapshot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ totalWords, totalVotes, goodVotes, badVotes })
            });
        } catch (e) {
            console.warn("Failed to submit global snapshot:", e);
        }
    }
};

const ThemeManager = {
    wordMap: {},
    init() {
        const s = document.createElement("style");
        s.innerText = `@keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }`;
        
		s.innerHTML += `
            body.listening-mode { border: 4px solid #ef4444 !important; }
            body.listening-mode::after {
                content: '🎙️ LISTENING...'; position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
                background: #ef4444; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; z-index: 9999;
                animation: pulse 1s infinite;
            }
        `;
		
		s.innerHTML += `
            body.vote-good-mode { background: #22c55e !important; overflow: hidden; }
            body.vote-good-mode * { visibility: hidden; }
            body.vote-good-mode::after {
                content: '👍'; visibility: visible; position: fixed; top: 50%; left: 50%; 
                transform: translate(-50%, -50%); font-size: 150px;
            }

            body.vote-bad-mode { background: #ef4444 !important; overflow: hidden; }
            body.vote-bad-mode * { visibility: hidden; }
            body.vote-bad-mode::after {
                content: '👎'; visibility: visible; position: fixed; top: 50%; left: 50%; 
                transform: translate(-50%, -50%); font-size: 150px;
            }
        `;
		
		document.head.appendChild(s);
		
		const rs = document.createElement("style");
rs.innerHTML = `
.rain-drop {
        position: absolute;
        background: rgba(59, 130, 246, 0.9); /* <--- CHANGED HERE */
        width: 2px;
        height: 15px;
        bottom: 100%;
        animation: rain-fall linear infinite;
        pointer-events: none;
        z-index: 50;
    }
    @keyframes rain-fall {
        0% { transform: translateY(0); }
        100% { transform: translateY(110vh); }
    }
`;

	document.head.appendChild(rs);
    
        Object.entries(CONFIG.THEME_SECRETS).forEach(([k, v]) => {
            try {
                atob(v).split('|').forEach(w => this.wordMap[w] = k)
            } catch {}
        });
        
        if ((State.data.unlockedThemes.length + 1) >= 5) {
            State.unlockBadge('traveler');
        }
        
        this.populateChooser();

        let currentThemeToApply = State.data.currentTheme;

        if (State.data.settings.randomizeTheme && State.data.unlockedThemes.length > 0) {
            const available = ['default', ...State.data.unlockedThemes];
            currentThemeToApply = available[Math.floor(Math.random() * available.length)];
            this.apply(currentThemeToApply);
        } else {
            this.apply(State.data.currentTheme);
        }
        
        DOM.theme.chooser.value = currentThemeToApply;
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
		State.runtime.currentTheme = t;
        if (m !== 'temp') {
            State.save('currentTheme', t);
            if (m === true) State.save('manualTheme', true);
        }

        // Apply classes carefully to preserve layout
        document.body.className = document.body.className.split(' ').filter(c => !c.startsWith('theme-')).join(' ');
        document.body.classList.add(`theme-${t}`);
        
        if (t === 'banana') {
            if (!document.getElementById('banana-style')) {
                const s = document.createElement('style');
                s.id = 'banana-style';
                
                s.innerHTML = `
                    body.theme-banana {
                        background: linear-gradient(160deg, #ffe135 0%, #ffec4d 30%, #fff59d 50%, #ffeb3b 70%, #fdd835 100%) !important;
                        background-attachment: fixed !important;
                        position: relative;
                    }
                    body.theme-banana::before {
                        content: '';
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background-image: 
                            /* Large bruise spots */
                            radial-gradient(ellipse 120px 50px at 8% 15%, rgba(101, 67, 33, 0.35) 0%, rgba(101, 67, 33, 0.15) 40%, transparent 70%),
                            radial-gradient(ellipse 90px 40px at 85% 25%, rgba(92, 64, 51, 0.3) 0%, rgba(92, 64, 51, 0.1) 50%, transparent 75%),
                            radial-gradient(ellipse 140px 55px at 20% 75%, rgba(110, 70, 30, 0.32) 0%, rgba(110, 70, 30, 0.12) 45%, transparent 70%),
                            radial-gradient(ellipse 100px 45px at 75% 80%, rgba(95, 60, 40, 0.28) 0%, rgba(95, 60, 40, 0.1) 50%, transparent 75%),
                            radial-gradient(ellipse 80px 35px at 50% 45%, rgba(100, 65, 35, 0.25) 0%, rgba(100, 65, 35, 0.08) 55%, transparent 80%),
                            radial-gradient(ellipse 110px 48px at 35% 30%, rgba(105, 68, 38, 0.22) 0%, transparent 65%),
                            radial-gradient(ellipse 70px 30px at 65% 55%, rgba(98, 62, 42, 0.2) 0%, transparent 70%),
                            /* Medium spots */
                            radial-gradient(circle 25px at 12% 40%, rgba(80, 50, 30, 0.4) 0%, transparent 100%),
                            radial-gradient(circle 18px at 78% 12%, rgba(85, 55, 35, 0.35) 0%, transparent 100%),
                            radial-gradient(circle 22px at 42% 88%, rgba(90, 58, 32, 0.38) 0%, transparent 100%),
                            radial-gradient(circle 20px at 92% 60%, rgba(82, 52, 28, 0.32) 0%, transparent 100%),
                            radial-gradient(circle 15px at 28% 52%, rgba(88, 56, 34, 0.3) 0%, transparent 100%),
                            /* Small freckles */
                            radial-gradient(circle 8px at 15% 65%, rgba(70, 45, 25, 0.5) 0%, transparent 100%),
                            radial-gradient(circle 6px at 55% 22%, rgba(75, 48, 28, 0.45) 0%, transparent 100%),
                            radial-gradient(circle 10px at 82% 42%, rgba(72, 46, 26, 0.42) 0%, transparent 100%),
                            radial-gradient(circle 7px at 38% 68%, rgba(78, 50, 30, 0.48) 0%, transparent 100%),
                            radial-gradient(circle 5px at 68% 78%, rgba(74, 47, 27, 0.4) 0%, transparent 100%),
                            radial-gradient(circle 9px at 25% 18%, rgba(76, 49, 29, 0.38) 0%, transparent 100%);
                        background-size: 100% 100%;
                        pointer-events: none;
                        z-index: 0;
                    }
                    body.theme-banana .card,
                    body.theme-banana .bg-white {
                        background: rgba(255, 250, 220, 0.92) !important;
                        border-color: rgba(180, 130, 50, 0.25) !important;
                    }
                    body.theme-banana #wordDisplay {
                        color: #4a3520 !important;
                        text-shadow: 
                            2px 2px 4px rgba(139, 90, 43, 0.15),
                            -1px -1px 2px rgba(255, 255, 255, 0.3),
                            0 0 8px rgba(101, 67, 33, 0.1);
                        background: linear-gradient(180deg, rgba(101, 67, 33, 0.08) 0%, transparent 50%, rgba(101, 67, 33, 0.05) 100%);
                        background-clip: text;
                        -webkit-background-clip: text;
                    }
                    body.theme-banana .bg-indigo-600,
                    body.theme-banana .bg-indigo-500 {
                        background: linear-gradient(135deg, #e6a800, #f5c400) !important;
                    }
                    body.theme-banana .text-indigo-600 {
                        color: #b8860b !important;
                    }
                `;
                document.head.appendChild(s);
            }
        } else {
            const old = document.getElementById('banana-style');
            if (old) old.remove();
        }

        // Woodland theme styles
        if (t === 'woodland') {
            if (!document.getElementById('woodland-theme-style')) {
                const s = document.createElement('style');
                s.id = 'woodland-theme-style';
                s.innerHTML = `
                    body.theme-woodland {
                        background: transparent !important;
                    }
                    body.theme-woodland .card,
                    body.theme-woodland .bg-white {
                        background: rgba(255, 253, 245, 0.92) !important;
                        border-color: #8b7355 !important;
                    }
                    body.theme-woodland #wordDisplay {
                        color: #3d2914 !important;
                        text-shadow: 1px 1px 0px rgba(255,255,255,0.5);
                    }
                    body.theme-woodland .bg-indigo-600,
                    body.theme-woodland .bg-indigo-500 {
                        background-color: #5d7a4a !important;
                    }
                    body.theme-woodland .bg-indigo-600:hover,
                    body.theme-woodland .bg-indigo-500:hover {
                        background-color: #4a6339 !important;
                    }
                    body.theme-woodland .text-indigo-600,
                    body.theme-woodland .text-indigo-700 {
                        color: #5d7a4a !important;
                    }
                    body.theme-woodland .bg-indigo-100,
                    body.theme-woodland .bg-indigo-50 {
                        background-color: rgba(93, 122, 74, 0.15) !important;
                    }
                    body.theme-woodland .border-indigo-100,
                    body.theme-woodland .border-indigo-200 {
                        border-color: rgba(93, 122, 74, 0.3) !important;
                    }
                    body.theme-woodland .text-green-600 {
                        color: #4a7c3f !important;
                    }
                    body.theme-woodland .text-red-600 {
                        color: #8b4513 !important;
                    }
                    body.theme-woodland header {
                        position: relative;
                        z-index: 20;
                    }
                `;
                document.head.appendChild(s);
            }
        } else {
            const old = document.getElementById('woodland-theme-style');
            if (old) old.remove();
        }

        const e = DOM.theme.effects;
        e.snow.classList.toggle('hidden', t !== 'winter');
        e.bubble.classList.toggle('hidden', t !== 'submarine');
        e.fire.classList.toggle('hidden', t !== 'fire');
        e.summer.classList.toggle('hidden', t !== 'summer');
        e.plymouth.classList.toggle('hidden', t !== 'plymouth');
        e.ballpit.classList.toggle('hidden', t !== 'ballpit');
        e.space.classList.toggle('hidden', t !== 'space');
        e.woodland.classList.toggle('hidden', t !== 'woodland');
        
        if (t === 'winter') {
            Effects.snow();
            SnowmanBuilder.init();
            SnowmanBuilder.render();
        } else {
            e.snow.innerHTML = '';
            // Hide snowman builder when not winter
            const sb = document.getElementById('snowman-builder');
            if (sb) sb.style.opacity = '0';
        }
        
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
        if (t === 'woodland') Effects.woodland(true);
        else Effects.woodland(false);
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
		if (typeof WeatherManager !== 'undefined') WeatherManager.updateVisuals();
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

const WeatherManager = {
    ALLOWED_THEMES: ['default', 'ballpit', 'banana', 'dark', 'fire', 'halloween', 'plymouth', 'rainbow', 'summer', 'woodland'],
    
    RAIN_CODES: [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99],
    SNOW_CODES: [71, 73, 75, 77, 85, 86],
    
    isRaining: false,
    isSnowing: false,
    hasChecked: false,

    init() {
        if (State.data.settings.enableWeather) this.checkWeather();
    },

    toggle(active) {
        State.data.settings.enableWeather = active;
        State.save('settings', State.data.settings);
        if (active) {
            this.checkWeather();
        } else {
            this.isRaining = false;
            this.isSnowing = false;
            this.updateVisuals();
        }
    },

    checkWeather() {
        if (!navigator.geolocation) return;
        UIManager.showPostVoteMessage("Checking local weather... ☁️");
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const lat = pos.coords.latitude;
                    const lon = pos.coords.longitude;
                    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
                    const response = await fetch(url);
                    const data = await response.json();
                    const code = data.current_weather.weathercode;
                    
                    this.isRaining = this.RAIN_CODES.includes(code);
                    this.isSnowing = this.SNOW_CODES.includes(code);
                    this.hasChecked = true;
                    
                    if (this.isSnowing) UIManager.showPostVoteMessage("It's snowing! ❄️");
                    else if (this.isRaining) UIManager.showPostVoteMessage("It's raining! 🌧️");
                    else UIManager.showPostVoteMessage("Weather is clear. ☀️");
                    
                    this.updateVisuals();
                } catch (e) { console.error("Weather fetch failed", e); }
            },
            (err) => {
                UIManager.showPostVoteMessage("Location denied 🚫");
                const toggle = document.getElementById('toggleWeather');
                if (toggle) toggle.checked = false;
                State.data.settings.enableWeather = false;
                State.save('settings', State.data.settings);
            }
        );
    },

    updateVisuals() {
        const t = State.runtime.currentTheme;
        Effects.rain(false);
        
        // FIX: Explicitly unhide snow container on Winter theme
        if (t === 'winter') {
            const s = document.getElementById('snow-effect');
            if (s) s.style.display = ''; 
            return;
        }

        Effects.weatherSnow(false); 

        const isAllowedTheme = this.ALLOWED_THEMES.includes(t);
        const enabled = State.data.settings.enableWeather;

        if (enabled && isAllowedTheme) {
            if (this.isSnowing) {
                Effects.weatherSnow(true);
            } else if (this.isRaining) {
                Effects.rain(true);
            }
        }
    }
};

const CommunityGoal = {
    MILESTONE: 50000, // 50k increments
    
    update(totalVotes) {
        const bar = DOM.header.communityGoalBar;
        const text = DOM.header.communityGoalText;
        if (!bar || !text) return;
        
        const currentMilestone = Math.floor(totalVotes / this.MILESTONE) * this.MILESTONE + this.MILESTONE;
        const prevMilestone = currentMilestone - this.MILESTONE;
        const progress = ((totalVotes - prevMilestone) / this.MILESTONE) * 100;
        const remaining = currentMilestone - totalVotes;
        
        bar.style.width = Math.min(progress, 100) + '%';
        
        // Format numbers
        const fmt = n => n >= 1000000 ? (n/1000000).toFixed(1) + 'M' : n >= 1000 ? Math.round(n/1000) + 'k' : n;
        
        if (progress >= 95) {
            text.textContent = `🏆 Almost there! ${fmt(remaining)} to ${fmt(currentMilestone)}!`;
            bar.style.animation = 'pulse 1s infinite';
        } else {
            text.textContent = `🏆 Community Goal: ${fmt(currentMilestone)} votes`;
            bar.style.animation = '';
        }
    }
};

// SnowmanBuilder - Builds a snowman in the header as user collects snowmen
const SnowmanBuilder = {
    TOTAL_PARTS: 100, // 100 snowmen collected = 1 complete snowman
    container: null,
    
    init() {
        // Create container next to logo
        const logoArea = document.getElementById('logoArea');
        if (!logoArea || this.container) return;
        
        // Add style to shift logo when snowman/dog visible
        if (!document.getElementById('snowman-logo-style')) {
            const style = document.createElement('style');
            style.id = 'snowman-logo-style';
            style.textContent = `
                #logoArea.has-snowman #logoText { transform: translateX(-20px); transition: transform 0.3s ease; }
                #logoArea.has-snowdog #logoText { transform: translateX(-45px); transition: transform 0.3s ease; }
            `;
            document.head.appendChild(style);
        }
        
        this.container = document.createElement('div');
        this.container.id = 'snowman-builder';
        this.container.style.cssText = `
            position: absolute;
            right: 4px;
            top: 50%;
            transform: translateY(-50%);
            height: 100%;
            width: 60px;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            align-items: center;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.5s ease, width 0.3s ease;
        `;
        logoArea.appendChild(this.container);
        
        this.render();
    },
    
    collect() {
        const count = State.data.snowmanCollected + 1;
        State.save('snowmanCollected', count);
        this.render();
        
        if (count === this.TOTAL_PARTS) {
            UIManager.showPostVoteMessage("⛄ Snowman complete! Keep going...");
        } else if (count === 101) {
            UIManager.showPostVoteMessage("🐕 A snow dawg appears!");
        } else if (count === 150) {
            UIManager.showPostVoteMessage("🐕 Snow Dawg complete! Good boi!");
        } else if (count <= this.TOTAL_PARTS && count % 25 === 0) {
            UIManager.showPostVoteMessage(`⛄ Snowman ${count}% built!`);
        }
    },
    
    render() {
        if (!this.container) this.init();
        if (!this.container) return;
        
        const count = State.data.snowmanCollected || 0;
        const progress = Math.min(count / this.TOTAL_PARTS, 1);
        const logoArea = document.getElementById('logoArea');
        
        if (count === 0) {
            this.container.style.opacity = '0';
            if (logoArea) logoArea.classList.remove('has-snowman', 'has-snowdog');
            return;
        }
        
        this.container.style.opacity = '1';
        
        // Update logo shift class
        if (logoArea) {
            logoArea.classList.remove('has-snowman', 'has-snowdog');
            if (count > 100) {
                logoArea.classList.add('has-snowdog');
            } else if (count > 0) {
                logoArea.classList.add('has-snowman');
            }
        }
        
        this.container.style.width = count > 100 ? '115px' : '65px';
        this.container.style.flexDirection = count > 100 ? 'row' : 'column';
        this.container.style.alignItems = 'flex-end';
        this.container.style.gap = '6px';
        
        let html = '';
        
        // Snow dog (after 100, builds up to 150)
        if (count > 100) {
            const dogProg = Math.min((count - 100) / 50, 1);
            html += '<div style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;margin-left:-5px;">';
            html += '<div style="position:relative;width:44px;height:42px;">';
            
            // Dog body (bigger, lowered to connect with legs)
            if (dogProg > 0) {
                const w = Math.round(30 * Math.min(dogProg / 0.3, 1));
                const h = Math.round(18 * Math.min(dogProg / 0.3, 1));
                html += `<div style="position:absolute;bottom:6px;left:50%;transform:translateX(-50%);width:${w}px;height:${h}px;background:radial-gradient(ellipse at 30% 30%, #fff, #d0d0d0);border-radius:50%;box-shadow:inset -2px -2px 4px rgba(0,0,0,0.1);z-index:1;"></div>`;
            }
            
            // Dog head (moved up and to right side of body)
            if (dogProg > 0.3) {
                const s = Math.round(15 * Math.min((dogProg - 0.3) / 0.25, 1));
                const hasFace = dogProg > 0.75;
                const hasEars = dogProg > 0.75;
                html += `<div style="position:absolute;bottom:12px;right:0px;width:${s}px;height:${s}px;background:radial-gradient(circle at 30% 30%, #fff, #d0d0d0);border-radius:50%;z-index:2;box-shadow:inset -1px -1px 3px rgba(0,0,0,0.1);">
                    ${hasFace ? `<div style="position:absolute;top:28%;left:20%;width:2px;height:2px;background:#1a1a1a;border-radius:50%;"></div><div style="position:absolute;top:28%;right:25%;width:2px;height:2px;background:#1a1a1a;border-radius:50%;"></div><div style="position:absolute;top:52%;left:50%;transform:translateX(-50%);width:3px;height:2px;background:#222;border-radius:50%;"></div>` : ''}
                    ${hasEars ? `<div style="position:absolute;top:-5px;left:0px;width:5px;height:7px;background:linear-gradient(180deg, #bbb, #ddd);border-radius:50% 50% 40% 40%;border:1px solid rgba(0,0,0,0.2);"></div><div style="position:absolute;top:-5px;right:0px;width:5px;height:7px;background:linear-gradient(180deg, #bbb, #ddd);border-radius:50% 50% 40% 40%;border:1px solid rgba(0,0,0,0.2);"></div>` : ''}
                </div>`;
            }
            
            // Dog legs (black stick legs - positioned under body)
            if (dogProg > 0.55) {
                const lh = Math.round(8 * Math.min((dogProg - 0.55) / 0.2, 1));
                // Front legs (under right side of body)
                html += `<div style="position:absolute;bottom:0;right:10px;width:2px;height:${lh}px;background:#2a2a2a;border-radius:1px;"></div>`;
                html += `<div style="position:absolute;bottom:0;right:16px;width:2px;height:${lh}px;background:#2a2a2a;border-radius:1px;"></div>`;
                // Back legs (under left side of body)
                html += `<div style="position:absolute;bottom:0;left:10px;width:2px;height:${lh}px;background:#2a2a2a;border-radius:1px;"></div>`;
                html += `<div style="position:absolute;bottom:0;left:16px;width:2px;height:${lh}px;background:#2a2a2a;border-radius:1px;"></div>`;
            }
            
            // Tail (on left side, curved up from body)
            if (dogProg > 0.8) html += `<div style="position:absolute;bottom:12px;left:2px;width:6px;height:8px;background:linear-gradient(to top, #d0d0d0, #e8e8e8);border-radius:40% 40% 50% 50%;transform:rotate(-20deg);box-shadow:inset -1px -1px 2px rgba(0,0,0,0.1);"></div>`;
            
            html += '</div></div>';
        }
        
        // Snowman (bigger sizes)
        html += '<div style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;">';
        
        const bottomProgress = Math.min(progress / 0.33, 1);
        const middleProgress = progress > 0.33 ? Math.min((progress - 0.33) / 0.33, 1) : 0;
        const topProgress = progress > 0.66 ? Math.min((progress - 0.66) / 0.24, 1) : 0;
        const accessoryProgress = progress > 0.90 ? (progress - 0.90) / 0.10 : 0;
        
        if (accessoryProgress > 0.8) html += `<div style="font-size:16px;margin-bottom:-10px;">🎩</div>`;
        
        // Head (bigger: 26px max)
        if (topProgress > 0) {
            const size = Math.round(26 * topProgress);
            const hasEyes = accessoryProgress > 0.2, hasNose = accessoryProgress > 0.5;
            html += `<div style="width:${size}px;height:${size}px;background:radial-gradient(circle at 30% 30%, #fff, #e8e8e8);border-radius:50%;box-shadow:inset -2px -2px 4px rgba(0,0,0,0.1);position:relative;margin-bottom:-4px;">
                ${hasEyes ? `<div style="position:absolute;top:32%;left:22%;width:3px;height:3px;background:#1a1a1a;border-radius:50%;"></div><div style="position:absolute;top:32%;right:22%;width:3px;height:3px;background:#1a1a1a;border-radius:50%;"></div>` : ''}
                ${hasNose ? `<div style="position:absolute;top:48%;left:50%;transform:translateX(-50%);border-left:3px solid transparent;border-right:3px solid transparent;border-top:10px solid #ff6b35;"></div>` : ''}
            </div>`;
        }
        
        // Body with arms (bigger: 36px max)
        if (middleProgress > 0) {
            const size = Math.round(36 * middleProgress);
            const hasArms = accessoryProgress > 0.4;
            const hasButtons = accessoryProgress > 0.3;
            html += `<div style="width:${size}px;height:${size}px;background:radial-gradient(circle at 30% 30%, #fff, #e8e8e8);border-radius:50%;box-shadow:inset -2px -2px 4px rgba(0,0,0,0.1);position:relative;margin-bottom:-5px;">
                ${hasButtons ? `<div style="position:absolute;top:25%;left:50%;transform:translateX(-50%);width:4px;height:4px;background:#1a1a1a;border-radius:50%;"></div><div style="position:absolute;top:50%;left:50%;transform:translateX(-50%);width:4px;height:4px;background:#1a1a1a;border-radius:50%;"></div><div style="position:absolute;top:75%;left:50%;transform:translateX(-50%);width:4px;height:4px;background:#1a1a1a;border-radius:50%;"></div>` : ''}
                ${hasArms ? `<div style="position:absolute;left:-16px;top:35%;width:18px;height:3px;background:linear-gradient(90deg, #3e2723, #5d4037);border-radius:2px;transform:rotate(-25deg);box-shadow:0 1px 1px rgba(0,0,0,0.2);"></div><div style="position:absolute;right:-16px;top:35%;width:18px;height:3px;background:linear-gradient(90deg, #5d4037, #3e2723);border-radius:2px;transform:rotate(25deg);box-shadow:0 1px 1px rgba(0,0,0,0.2);"></div>` : ''}
            </div>`;
        }
        
        // Base (bigger: 46px max)
        if (bottomProgress > 0) {
            const size = Math.round(46 * bottomProgress);
            html += `<div style="width:${size}px;height:${size}px;background:radial-gradient(circle at 30% 30%, #fff, #e8e8e8);border-radius:50%;box-shadow:inset -3px -3px 5px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.15);"></div>`;
        }
        
        html += '</div>';
        
        // Counter: show X/100 up to 100, then X/100 for 101+
        let counterText;
        if (count <= 100) {
            counterText = `${count}/${this.TOTAL_PARTS}`;
        } else {
            counterText = `${count}/100`;
        }
        html += `<div style="position:absolute;bottom:-2px;right:2px;font-size:8px;color:#555;font-weight:bold;">${counterText}</div>`;
        
        this.container.innerHTML = html;
    },
    
    reset() {
        State.save('snowmanCollected', 0);
        this.render();
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
    
rain(active) {
        const c = document.getElementById('rain-effect');
        if (!c) return;
        if (!active) {
            c.innerHTML = '';
            c.classList.add('hidden');
            c.style.display = 'none'; // Force hide immediately
            return;
        }
        c.style.display = ''; // Restore visibility
        c.classList.remove('hidden');
        if (c.children.length > 0) return;
        const count = 80;
        for (let i = 0; i < count; i++) {
            const drop = document.createElement('div');
            drop.className = 'rain-drop';
            drop.style.left = Math.random() * 100 + 'vw';
            drop.style.animationDuration = (Math.random() * 0.5 + 0.8) + 's';
            drop.style.animationDelay = (Math.random() * 2) + 's';
            drop.style.opacity = Math.random() * 0.5 + 0.3;
            c.appendChild(drop);
        }
    },	
	
weatherSnow(active) {
        const c = document.getElementById('snow-effect');
        if (!c) return;
        
        if (!active) {
            if (State.runtime.currentTheme !== 'winter') {
                c.innerHTML = '';
                c.classList.add('hidden');
                c.style.display = 'none';
            }
            return;
        }

        // Force overlay styles (just like rain)
        c.classList.remove('hidden');
        c.style.display = 'block';
        Object.assign(c.style, {
            position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '50'
        });

        if (c.children.length > 0) return; // Prevent double spawn

        // Create snow particles (simplified from standard snow effect)
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
    },
	
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
            if (State.runtime.currentTheme !== 'plymouth') return;

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
            if (State.runtime.currentTheme !== 'plymouth') return;

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
            if (State.runtime.currentTheme !== 'plymouth') return;

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

        this.spawnFish();
    },

spawnFish() {
        const c = DOM.theme.effects.bubble;
        if (!c) return; // Safety check

        // --- OCTOPUS ANIMATION STYLE ---
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

        if (State.runtime.currentTheme !== 'submarine') return;

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
        wrap.style.position = 'fixed'; 
        wrap.style.zIndex = '10';      

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
        const duration = (Math.random() * (config.speed[1] - config.speed[0]) + config.speed[0]) || 15;
        const isFakeOut = !isBoot && fishEmoji !== '🐙' && Math.random() < 0.10;

        if (isBoot) {
            inner.style.animation = 'spin-slow 10s linear infinite';
            inner.style.transition = 'transform 0.5s';
            wrap.style.left = (Math.random() * 80 + 10) + '%'; 
            wrap.style.top = '110vh'; 
            inner.style.transform = `rotate(${Math.random() * 360}deg)`;
        } else {
            inner.style.transition = 'font-size 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 0.2s';
            wrap.style.top = (Math.random() * 80 + 10) + 'vh';
            wrap.style.left = startLeft ? '-150px' : '110vw';
            
            if (!isBoot) inner.style.transform = `scaleX(${baseDir})`;
        }
        wrap.appendChild(inner); 
        c.appendChild(wrap);

        void wrap.offsetWidth; 

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
                 
                 return;
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

        setTimeout(() => {
            if (wrap.parentNode) wrap.remove();
        }, duration * 1000 + 3000);

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
            if (State.runtime.currentTheme !== 'winter') return;
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
                SnowmanBuilder.collect(); // Add to snowman building progress
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
                @keyframes spider-idle-wiggle {
                    0%, 100% { transform: rotate(0deg) scaleX(1); }
                    15% { transform: rotate(2deg); }
                    30% { transform: rotate(-2deg); }
                    45% { transform: rotate(1deg); }
                    60% { transform: rotate(-1deg); }
                    75% { transform: rotate(1deg); }
                    90% { transform: rotate(-1deg); }
                }
                @keyframes spider-leg-twitch {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(3deg); }
                    75% { transform: rotate(-3deg); }
                }
                @keyframes spider-pause-wiggle {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(5deg); }
                }
				.scuttling-motion {
				animation: spider-leg-twitch 1.2s infinite ease-in-out;
				}
                .spider-paused {
                    animation: spider-pause-wiggle 0.8s ease-in-out;
                }
                .hunting-scuttle {
                    animation: spider-leg-twitch 0.6s infinite ease-in-out;
                }
				.spider-idle {
				animation: spider-idle-wiggle 4s infinite ease-in-out;
				}
				.spider-fat {
					filter: drop-shadow(0 10px 5px rgba(0,0,0,0.4)); transition: transform 1s cubic-bezier(0.5, 0, 0.5, 1); 
				}
            `;
            document.head.appendChild(s);
        }

        // Spider scuttle movement system - jerky, realistic movement
        const spiderScuttle = {
            active: false,
            targetX: 50,
            currentX: 50,
            
            start(wrap, body, targetPercent, onComplete) {
                this.active = true;
                this.targetX = targetPercent;
                this.currentX = parseFloat(wrap.style.left) || 50;
                
                const totalDist = Math.abs(this.targetX - this.currentX);
                const direction = this.targetX > this.currentX ? 1 : -1;
                
                body.classList.add('scuttling-motion');
                
                const moveStep = () => {
                    if (!this.active) {
                        this.stop(body, onComplete);
                        return;
                    }
                    
                    const remaining = Math.abs(this.targetX - this.currentX);
                    if (remaining < 0.5) {
                        this.stop(body, onComplete);
                        return;
                    }
                    
                    // Decide: move or pause?
                    const roll = Math.random();
                    
                    if (roll < 0.15) {
                        // PAUSE - stop briefly (15% chance, was 35%)
                        body.classList.remove('scuttling-motion');
                        body.classList.add('spider-paused');
                        
                        const pauseTime = 300 + Math.random() * 400; // 300-700ms pause
                        setTimeout(() => {
                            if (!this.active) return;
                            body.classList.remove('spider-paused');
                            body.classList.add('scuttling-motion');
                            setTimeout(moveStep, 100);
                        }, pauseTime);
					} else {
                        // MOVE - Smooth, steady steps
                        const burstSteps = 4 + Math.floor(Math.random() * 4);
                        const stepSize = 0.4 + Math.random() * 0.3;
                        let burstCount = 0;
                        
                        const doBurstStep = () => {
                            if (!this.active || burstCount >= burstSteps) {
                                setTimeout(moveStep, 100 + Math.random() * 150);
                                return;
                            }
                            
                            const rem = Math.abs(this.targetX - this.currentX);
                            if (rem < 0.5) {
                                this.stop(body, onComplete);
                                return;
                            }
                            
                            const actualStep = Math.min(rem, stepSize);
                            this.currentX += actualStep * direction;
                            wrap.style.left = this.currentX + '%';
                            burstCount++;
                            
                            // Smoother timing
                            setTimeout(doBurstStep, 80 + Math.random() * 60); 
                        };
                        
                        doBurstStep();
                    }
                };
                
                // Start after initial delay
                setTimeout(moveStep, 200);
            },
            
            stop(body, onComplete) {
                this.active = false;
                body.classList.remove('scuttling-motion', 'spider-paused');
                if (onComplete) onComplete();
            },
            
            cancel(body) {
                this.active = false;
                body.classList.remove('scuttling-motion', 'spider-paused');
            }
        };

        let wrap = document.getElementById('spider-wrap');
        if (!wrap) {
            wrap = document.createElement('div');
            wrap.id = 'spider-wrap';
            wrap.spiderScuttle = spiderScuttle; // Attach for external access
            Object.assign(wrap.style, {
                position: 'fixed', left: '50%', top: '-15vh', zIndex: '102',
                pointerEvents: 'none' 
            });
            
            // Spider size based on bugs eaten in last hour (not lifetime)
            const now = Date.now();
            const oneHourAgo = now - (60 * 60 * 1000);
            if (!State.data.spiderEatLog) State.data.spiderEatLog = [];
            // Filter to bugs eaten in last hour
            const recentBugs = State.data.spiderEatLog.filter(t => t > oneHourAgo).length;
            const maxBugs = 5;
            const cappedEaten = Math.min(recentBugs, maxBugs);
            const fontSize = (3 + (cappedEaten * 0.6)).toFixed(2); // 3rem -> 6rem over 5 bugs
            
            wrap.innerHTML = `
                <div id="spider-anchor" style="transform-origin: top center;">
                    <div id="spider-thread" style="width: 2px; background: rgba(255,255,255,0.6); margin: 0 auto; height: 0; transition: height 4s ease-in-out;"></div>
                    <div id="spider-body" style="font-size: ${fontSize}rem; margin-top: -10px; cursor: pointer; position: relative; z-index: 2; pointer-events: auto; transition: font-size 0.3s ease;">
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

                const b = document.createElement('div');
                b.id = 'spider-bubble-dynamic';
                Object.assign(b.style, {
                    position: 'fixed', 
                    background: 'white', color: '#1f2937', padding: '8px 14px', 
                    borderRadius: '16px', fontSize: '14px', fontWeight: 'bold', 
                    fontFamily: 'sans-serif', whiteSpace: 'nowrap', width: 'max-content',
                    pointerEvents: 'none', opacity: '0', transition: 'opacity 0.2s', 
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)', border: '2px solid #1f2937',
                    zIndex: '110',      
                    willChange: 'top, left'
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
                        // Upside Down: Bubble BELOW
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
			
            wrap.showBubble = showSpiderBubble;

            body.onclick = (e) => {
                e.stopPropagation();
                State.unlockBadge('spider');
                const willFall = Math.random() < 0.2; 
                const lines = willFall ? GAME_DIALOGUE.spider.pokeGrumpy : GAME_DIALOGUE.spider.pokeHappy;
                const text = lines[Math.floor(Math.random() * lines.length)];
                
                showSpiderBubble(text);
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
        const scuttle = wrap.spiderScuttle;
        
const anchor = wrap.querySelector('#spider-anchor');
        const currentBody = wrap.querySelector('#spider-body'); // Ensure we have the body

        if (anchor && currentBody) {
            const eaten = State.data.insectStats.eaten || 0;
            // Base size with growth per bug eaten lifetime
            let scale = Math.min(0.7 + (eaten * 0.05), 2.0); 

            const isFull = Date.now() < (State.data.spiderFullUntil || 0);
            
            if (isFull) {
                scale = scale * 1.6; // Max fatness (60% bigger)
                currentBody.classList.add('spider-fat');
            } else {
                // Incremental growth: 20% bigger per bug in recent stomach
                const recentBugs = State.data.spiderEatLog ? State.data.spiderEatLog.length : 0;
                scale = scale * (1 + (recentBugs * 0.20)); 
                currentBody.classList.remove('spider-fat');
            }
            anchor.style.transform = `scale(${scale.toFixed(2)})`;
        }
		
        const runDrop = () => {
            if (!document.body.contains(wrap)) return;
            if (wrap.classList.contains('hunting')) return;
            if (scuttle) scuttle.cancel(body);
            
            const actionRoll = Math.random();
            body.style.transform = 'rotate(0deg)'; 
            body.classList.remove('scuttling-motion', 'spider-paused', 'spider-idle');
            thread.style.opacity = '1'; 
            
            if (actionRoll < 0.7) {
                const safeLeft = Math.random() * 60 + 20;
                
                // Use new scuttle system for realistic movement
                if (scuttle) {
                    scuttle.start(wrap, body, safeLeft, () => {
                        if (wrap.classList.contains('hunting')) return;
                        body.style.transform = 'rotate(180deg)'; 
                        body.classList.add('spider-idle');
                        thread.style.transition = 'height 2.5s ease-in-out'; 
                        thread.style.height = '18vh'; 
                        
                        setTimeout(() => {
                             if (wrap.classList.contains('hunting')) return;
                             // Use time-based idle phrase
                             let text = 'Boo!';
                             if (typeof GAME_DIALOGUE !== 'undefined' && GAME_DIALOGUE.spider) {
                                 if (typeof GAME_DIALOGUE.spider.getIdlePhrase === 'function') {
                                     text = GAME_DIALOGUE.spider.getIdlePhrase();
                                 } else if (GAME_DIALOGUE.spider.idle) {
                                     const phrases = Array.isArray(GAME_DIALOGUE.spider.idle) ? GAME_DIALOGUE.spider.idle : ['Boo!', 'Hi!', '🕷️'];
                                     text = phrases[Math.floor(Math.random() * phrases.length)];
                                 }
                             }
                             
                             if(wrap.showBubble) wrap.showBubble(text, 'upside-down'); 
                             
                             setTimeout(() => {
                                 if (wrap.classList.contains('hunting')) return;
                                 body.classList.remove('spider-idle');
                                 thread.style.height = '0'; 
                                 this.spiderTimeout = setTimeout(runDrop, Math.random() * 5000 + 5000);
                             }, 2500); 
                        }, 2500);
                    });
                }
                return;
            }
			
            if (actionRoll < 0.9) {
                const isLeft = Math.random() > 0.5;
                const wallX = isLeft ? 5 : 85; 
                
                // Use new scuttle system
                if (scuttle) {
                    scuttle.start(wrap, body, wallX, () => {
                        if (wrap.classList.contains('hunting')) return;
                        
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
                    });
                }
                return;
            }
            
            const safeLeft = Math.random() * 60 + 20; 
            if (scuttle) {
                scuttle.start(wrap, body, safeLeft, () => {
                    runDrop();
                });
            }
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
		
if (Date.now() < (State.data.spiderFullUntil || 0)) {
            const body = wrap.querySelector('#spider-body');
            const thread = wrap.querySelector('#spider-thread');
            const lines = GAME_DIALOGUE.spider.full || ["I'm stuffed."];
            const text = lines[Math.floor(Math.random() * lines.length)];
            
            // 1. Drop down slightly so he is visible
            thread.style.transition = 'height 1s ease-out';
            thread.style.height = '20vh'; 

            setTimeout(() => {
                // 2. Complain & Shake
                if(wrap.showBubble) wrap.showBubble(text);
                if(body) body.style.animation = 'shake 1s ease-in-out';

                // 3. Retreat after 1.5s
                setTimeout(() => {
                    if(body) body.style.animation = '';
                    thread.style.height = '0';
                }, 1500);
            }, 1000); // Wait for drop
            
            return; // Stop here, don't hunt normally
        }
		
        const thread = wrap.querySelector('#spider-thread');
        const body = wrap.querySelector('#spider-body');
        const scuttle = wrap.spiderScuttle;
		
		const anchor = wrap.querySelector('#spider-anchor');
        if (anchor && body) {
            const eaten = State.data.insectStats.eaten || 0;
            let scale = Math.min(0.7 + (eaten * 0.05), 2.0); // Base size

            const isFull = Date.now() < (State.data.spiderFullUntil || 0);
            
            if (isFull) {
                scale = scale * 1.6; // Max fatness (60% bigger)
                body.classList.add('spider-fat');
            } else {
                // Incremental growth: 20% bigger per bug currently in stomach
                const recentBugs = State.data.spiderEatLog ? State.data.spiderEatLog.length : 0;
                scale = scale * (1 + (recentBugs * 0.20)); 
                body.classList.remove('spider-fat');
            }
            anchor.style.transform = `scale(${scale.toFixed(2)})`;
        }
        
        // Cancel any existing scuttle
        if (scuttle) scuttle.cancel(body);
        body.classList.remove('scuttling-motion', 'spider-paused', 'spider-idle');
        body.classList.add('hunting-scuttle');

        if (this.spiderTimeout) clearTimeout(this.spiderTimeout);
        wrap.classList.add('hunting');
        
        let phrases = isFood ? GAME_DIALOGUE.spider.hunting : GAME_DIALOGUE.spider.trickedStart;
        const text = phrases[Math.floor(Math.random() * phrases.length)];
        const bub = wrap.showBubble ? wrap.showBubble(text) : null;

        const destX = isFood ? targetXPercent : 88;
        const destY = isFood ? targetYPercent : 20;
        
        // Hunt scuttle - urgent but still spider-like
        const huntScuttle = {
            active: true,
            move(onComplete) {
                const currentX = parseFloat(wrap.style.left) || 50;
                const direction = destX > currentX ? 1 : -1;
                let posX = currentX;
                
                const doMove = () => {
                    if (!this.active) return;
                    
                    const remaining = Math.abs(destX - posX);
                    if (remaining < 0.5) {
                        body.classList.remove('hunting-scuttle', 'spider-paused');
                        onComplete();
                        return;
                    }
                    
                    const roll = Math.random();
                    
                    if (roll < 0.25) {
                        // Brief pause to look around (25% chance)
                        body.classList.remove('hunting-scuttle');
                        body.classList.add('spider-paused');
                        const pauseTime = 200 + Math.random() * 400;
                        setTimeout(() => {
                            if (!this.active) return;
                            body.classList.remove('spider-paused');
                            body.classList.add('hunting-scuttle');
                            setTimeout(doMove, 100);
                        }, pauseTime);
                    } else {
                        // Burst of movement
                        const burstSteps = 3 + Math.floor(Math.random() * 3); // 3-5 steps
                        const stepSize = 1 + Math.random() * 0.8; // 1-1.8% per step
                        let burstCount = 0;
                        
                        const doBurst = () => {
                            if (!this.active || burstCount >= burstSteps) {
                                setTimeout(doMove, 150 + Math.random() * 200);
                                return;
                            }
                            
                            const rem = Math.abs(destX - posX);
                            if (rem < 0.5) {
                                body.classList.remove('hunting-scuttle', 'spider-paused');
                                onComplete();
                                return;
                            }
                            
                            posX += Math.min(rem, stepSize) * direction;
                            wrap.style.left = posX + '%';
                            burstCount++;
                            
                            setTimeout(doBurst, 60 + Math.random() * 40);
                        };
                        
                        doBurst();
                    }
                };
                
                setTimeout(doMove, 200);
            }
        };
        
        huntScuttle.move(() => {
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
                        // Scenario 1: Caught the bug
                        MosquitoManager.eat();
                        if(wrap.showBubble) wrap.showBubble("YUM!");
                        
                        // --- PUFF UP ANIMATION (like pufferfish) ---
                        const anchor = wrap.querySelector('#spider-anchor');
                        
                        if (anchor) {
                            // Size based on bugs eaten in last hour
                            const now = Date.now();
                            const oneHourAgo = now - (60 * 60 * 1000);
                            const recentBugs = (State.data.spiderEatLog || []).filter(t => t > oneHourAgo).length;
                            const maxBugs = 5;
                            const cappedBugs = Math.min(recentBugs, maxBugs);
                            
                            // Show visible feedback
                            UIManager.showPostVoteMessage(`🕷️ ${recentBugs} bug${recentBugs !== 1 ? 's' : ''} in belly!`);
                            
                            // Change the actual font-size for visible growth
                            // 5 stages: 0 bugs = 3rem, 5 bugs = 6rem (max)
                            const baseFontSize = 3; // rem
                            const newFontSize = baseFontSize + (cappedBugs * 0.6); // 3rem -> 6rem over 5 bugs
                            const bulgeFontSize = newFontSize * 1.2;
                            
                            body.style.transition = 'font-size 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
                            body.style.fontSize = bulgeFontSize.toFixed(2) + 'rem';
                            
                            // Then settle to actual new size
                            setTimeout(() => {
                                if (body) {
                                    body.style.fontSize = newFontSize.toFixed(2) + 'rem';
                                }
                            }, 300);
                            
                            // Add fat class if at max
                            if (cappedBugs >= maxBugs) {
                                body.classList.add('spider-fat');
                            }
                        }
                        // --- END PUFF UP ---
                        
                        if (body) body.style.animation = 'shake 0.2s ease-in-out';
                        
                        // Stay visible briefly
                        setTimeout(() => {
                            if (body) body.style.animation = '';
                        }, 500);
                        
                        // Then retreat after 5 seconds
                        setTimeout(() => {
                            this.retreatSpider(thread, wrap, bub, '2s');
                        }, 5000);
                    } 
                    else if (isFood) {
                        const missedPhrases = GAME_DIALOGUE.spider.missed || ["Too slow!", "My lunch!"];
                        const missedText = missedPhrases[Math.floor(Math.random() * missedPhrases.length)];
                        if(wrap.showBubble) wrap.showBubble(missedText);
                        
                        body.style.animation = 'shake 0.5s ease-in-out';
                        setTimeout(() => {
                            body.style.animation = '';
                            this.retreatSpider(thread, wrap, bub, '2s');
                        }, 1500);
                    }
                    else {
                        // Scenario 3: Tricked (Empty Web clicked)
                        const angryPhrases = GAME_DIALOGUE.spider.trickedEnd;
                        const angryText = angryPhrases[Math.floor(Math.random() * angryPhrases.length)];
                        if(wrap.showBubble) wrap.showBubble(angryText);
                        
                        body.style.animation = 'shake 0.3s ease-in-out';
                        setTimeout(() => {
                            body.style.animation = '';
                            this.retreatSpider(thread, wrap, bub, '4s');
                        }, 1500);
                    }
                }, 2000); 
            }, 3000); 
        });
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
            el.style.cssText = `width:${r*2}px;height:${r*2}px;will-change:transform;`;
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
            el.onpointerdown = (e) => {
                b.drag = true;
                b.vx = b.vy = 0;
                b.lastX = e.clientX;
                b.lastY = e.clientY;
                sx = e.clientX;
                sy = e.clientY;
                e.preventDefault();
                el.setPointerCapture(e.pointerId);
            };
            el.onpointerup = (e) => {
                b.drag = false;
                if ((type === 'germ' || type === 'rare') && Math.abs(e.clientX - sx) < 50 && Math.abs(e.clientY - sy) < 50) {
                    if (type === 'germ') State.unlockBadge('germ');
                    if (type === 'rare' && rareMap[content]) State.unlockBadge(rareMap[content]);
                    showThought(b, type === 'rare' ? `<span style="font-size:2em">${content}</span>` : null)
                }
            };
            el.onpointermove = (e) => {
                if (b.drag) {
                    b.vx = (e.clientX - b.lastX) * 0.5;
                    b.vy = (e.clientY - b.lastY) * 0.5;
                    b.x = e.clientX - b.r;
                    b.y = e.clientY - b.r;
                    b.lastX = e.clientX;
                    b.lastY = e.clientY;
                }
            };
        };
        // Reduced ball count for better performance (50 instead of 80)
        for (let i = 0; i < 50; i++) addBall(Math.random() < 0.008 ? 'rare' : 'normal');
        for (let i = 0; i < 4; i++) addBall('germ');
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
    },

    woodlandTimeout: null,
    woodlandCreatureTimeout: null,
    
    woodland(active) {
        const c = DOM.theme.effects.woodland;
        if (this.woodlandTimeout) clearTimeout(this.woodlandTimeout);
        if (this.woodlandCreatureTimeout) clearTimeout(this.woodlandCreatureTimeout);
        
        if (!active) { 
            c.innerHTML = ''; 
            return; 
        }
        
        c.innerHTML = '';
        
        // Determine time of day (4 modes: dawn, day, dusk, night)
        const hour = new Date().getHours();
        let timeOfDay, lightColor, lightOpacity, bgGradient;
        
        if (hour >= 5 && hour < 8) {
            timeOfDay = 'dawn';
            lightColor = 'rgba(255, 200, 150, 0.3)';
            lightOpacity = 0.4;
            bgGradient = 'linear-gradient(180deg, #ffd89b 0%, #b8d4a8 30%, #5a7247 100%)';
        } else if (hour >= 8 && hour < 17) {
            timeOfDay = 'day';
            lightColor = 'rgba(255, 255, 200, 0.25)';
            lightOpacity = 0.5;
            bgGradient = 'linear-gradient(180deg, #87ceeb 0%, #98d4a5 30%, #4a6741 100%)';
        } else if (hour >= 17 && hour < 20) {
            timeOfDay = 'dusk';
            lightColor = 'rgba(255, 150, 100, 0.35)';
            lightOpacity = 0.3;
            bgGradient = 'linear-gradient(180deg, #ff7e5f 0%, #feb47b 30%, #4a5240 100%)';
        } else {
            timeOfDay = 'night';
            lightColor = 'rgba(100, 120, 180, 0.2)';
            lightOpacity = 0.15;
            bgGradient = 'linear-gradient(180deg, #1a1a2e 0%, #16213e 30%, #1f3a28 100%)';
        }
        
        // Set container style
        c.style.cssText = `
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 0;
            overflow: hidden;
            background: ${bgGradient};
        `;
        
        // Create forest floor
        const floor = document.createElement('div');
        floor.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 25%;
            background: linear-gradient(180deg, transparent 0%, #3d2914 30%, #2a1f0f 100%);
        `;
        c.appendChild(floor);
        
        // Add fallen leaves on floor
        for (let i = 0; i < 20; i++) {
            const leaf = document.createElement('div');
            const leafEmojis = ['🍂', '🍁', '🍃'];
            leaf.textContent = leafEmojis[Math.floor(Math.random() * leafEmojis.length)];
            leaf.style.cssText = `
                position: absolute;
                bottom: ${Math.random() * 15}%;
                left: ${Math.random() * 100}%;
                font-size: ${Math.random() * 12 + 10}px;
                opacity: ${Math.random() * 0.4 + 0.3};
                transform: rotate(${Math.random() * 360}deg);
            `;
            c.appendChild(leaf);
        }
        
        // Create trees (realistic organic shapes on sides)
        const createTree = (left, size, zIndex) => {
            const tree = document.createElement('div');
            const xOffset = Math.random() * 10 - 5;
            tree.style.cssText = `
                position: absolute;
                bottom: 12%;
                ${left ? 'left' : 'right'}: ${xOffset}%;
                width: ${size * 1.5}px;
                height: ${size * 3}px;
                z-index: ${zIndex};
            `;
            
            // Trunk with bark texture
            const trunk = document.createElement('div');
            const trunkW = size * 0.18;
            trunk.style.cssText = `
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: ${trunkW}px;
                height: ${size * 1.2}px;
                background: linear-gradient(90deg, 
                    #1a1208 0%, 
                    #3d2914 20%, 
                    #5a4025 40%, 
                    #3d2914 60%, 
                    #2a1f0f 80%, 
                    #1a1208 100%);
                border-radius: 3px 3px 8px 8px;
                box-shadow: inset -3px 0 8px rgba(0,0,0,0.4), inset 3px 0 8px rgba(0,0,0,0.2);
            `;
            
            // Add bark lines
            for (let b = 0; b < 6; b++) {
                const line = document.createElement('div');
                line.style.cssText = `
                    position: absolute;
                    left: ${20 + Math.random() * 60}%;
                    top: ${b * 16 + Math.random() * 5}%;
                    width: 2px;
                    height: ${8 + Math.random() * 12}px;
                    background: rgba(0,0,0,0.3);
                    border-radius: 1px;
                `;
                trunk.appendChild(line);
            }
            tree.appendChild(trunk);
            
            // Create organic foliage clusters
            const foliageColors = timeOfDay === 'night' 
                ? ['#0d1f0d', '#152515', '#1a2f1a', '#0f1a0f']
                : ['#1e4d1e', '#2d5a2d', '#3a6b3a', '#275227', '#1f4a1f'];
            
            const clusters = 8 + Math.floor(Math.random() * 5);
            for (let i = 0; i < clusters; i++) {
                const cluster = document.createElement('div');
                const clusterSize = size * (0.4 + Math.random() * 0.35);
                const angle = (i / clusters) * Math.PI * 2;
                const radius = size * (0.3 + Math.random() * 0.25);
                const cx = Math.cos(angle) * radius;
                const cy = Math.sin(angle) * radius * 0.6;
                const baseY = size * 1.4;
                
                cluster.style.cssText = `
                    position: absolute;
                    bottom: ${baseY + cy}px;
                    left: calc(50% + ${cx}px);
                    transform: translateX(-50%);
                    width: ${clusterSize}px;
                    height: ${clusterSize * 0.85}px;
                    background: radial-gradient(ellipse at 30% 30%, 
                        ${foliageColors[Math.floor(Math.random() * foliageColors.length)]} 0%, 
                        ${foliageColors[Math.floor(Math.random() * foliageColors.length)]} 70%, 
                        transparent 100%);
                    border-radius: 50% 50% 45% 55% / 60% 55% 45% 40%;
                    filter: blur(0.5px);
                `;
                tree.appendChild(cluster);
            }
            
            // Add a central dense cluster
            const centerCluster = document.createElement('div');
            centerCluster.style.cssText = `
                position: absolute;
                bottom: ${size * 1.5}px;
                left: 50%;
                transform: translateX(-50%);
                width: ${size * 0.7}px;
                height: ${size * 0.6}px;
                background: radial-gradient(ellipse at 40% 35%, 
                    ${foliageColors[1]} 0%, 
                    ${foliageColors[0]} 60%, 
                    transparent 100%);
                border-radius: 50%;
            `;
            tree.appendChild(centerCluster);
            
            // Top cluster
            const topCluster = document.createElement('div');
            topCluster.style.cssText = `
                position: absolute;
                bottom: ${size * 2}px;
                left: 50%;
                transform: translateX(-50%);
                width: ${size * 0.5}px;
                height: ${size * 0.45}px;
                background: radial-gradient(ellipse at 35% 30%, 
                    ${foliageColors[2]} 0%, 
                    ${foliageColors[0]} 70%, 
                    transparent 100%);
                border-radius: 45% 55% 50% 50% / 60% 60% 40% 40%;
            `;
            tree.appendChild(topCluster);
            
            return tree;
        };
        
        // Add trees on both sides (more trees, varied sizes)
        c.appendChild(createTree(true, 130, 3));
        c.appendChild(createTree(true, 90, 2));
        c.appendChild(createTree(true, 60, 1));
        c.appendChild(createTree(false, 110, 3));
        c.appendChild(createTree(false, 75, 2));
        c.appendChild(createTree(false, 50, 1));
        
        // Create hiding spots (bushes, logs, rocks)
        const hidingSpots = [];
        const spotTypes = [
            { emoji: '🪨', name: 'rock', width: 60, height: 40 },
            { emoji: '🪵', name: 'log', width: 80, height: 35 },
            { emoji: '🌳', name: 'bush', width: 50, height: 50 }
        ];
        
        for (let i = 0; i < 5; i++) {
            const spotType = spotTypes[Math.floor(Math.random() * spotTypes.length)];
            const spot = document.createElement('div');
            const leftPos = 15 + (i * 17) + (Math.random() * 10 - 5);
            spot.className = 'woodland-hiding-spot';
            spot.style.cssText = `
                position: absolute;
                bottom: ${12 + Math.random() * 8}%;
                left: ${leftPos}%;
                font-size: ${spotType.width * 0.6}px;
                z-index: 10;
                cursor: default;
                filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.4));
                transition: transform 0.2s;
            `;
            spot.textContent = spotType.emoji;
            c.appendChild(spot);
            hidingSpots.push({ el: spot, left: leftPos, creature: null });
        }
        
        // Create light rays through trees
        const lightOverlay = document.createElement('div');
        lightOverlay.style.cssText = `
            position: absolute;
            inset: 0;
            pointer-events: none;
            z-index: 5;
        `;
        
        // Add light beams
        for (let i = 0; i < 6; i++) {
            const beam = document.createElement('div');
            const leftPos = 10 + i * 15 + Math.random() * 10;
            beam.style.cssText = `
                position: absolute;
                top: 0;
                left: ${leftPos}%;
                width: ${20 + Math.random() * 30}px;
                height: 100%;
                background: linear-gradient(180deg, ${lightColor} 0%, transparent 70%);
                opacity: ${lightOpacity};
                transform: skewX(${(Math.random() - 0.5) * 20}deg);
                animation: woodlandLightSway ${8 + Math.random() * 4}s ease-in-out infinite alternate;
            `;
            lightOverlay.appendChild(beam);
        }
        c.appendChild(lightOverlay);
        
        // Add CSS animation for light sway
        if (!document.getElementById('woodland-styles')) {
            const style = document.createElement('style');
            style.id = 'woodland-styles';
            style.textContent = `
                @keyframes woodlandLightSway {
                    0% { transform: skewX(-5deg) translateX(-10px); opacity: ${lightOpacity}; }
                    100% { transform: skewX(5deg) translateX(10px); opacity: ${lightOpacity * 0.7}; }
                }
                @keyframes creaturePeek {
                    0%, 100% { transform: translateY(100%) scale(0.8); opacity: 0; }
                    10%, 90% { transform: translateY(0) scale(1); opacity: 1; }
                }
                @keyframes creatureEyes {
                    0%, 90%, 100% { opacity: 0; }
                    30%, 70% { opacity: 1; }
                }
                .woodland-creature {
                    animation: creaturePeek 6s ease-in-out forwards;
                }
                .woodland-hiding-spot:hover {
                    transform: scale(1.05);
                }
            `;
            document.head.appendChild(style);
        }
        
        // Woodland creatures that peek out from hiding spots
        const creatures = ['🐿️', '🦊', '🐺', '🦉', '🦔', '🐁'];
        const creatureMessages = {
            '🐿️': 'A curious squirrel watches you!',
            '🦊': 'A sly fox peeks out!',
            '🐺': 'A wolf observes from afar...',
            '🦉': 'Hoo! An owl spots you!',
            '🦔': 'A hedgehog snuffles about!',
            '🐁': 'A tiny mouse scurries by!'
        };
        
        const spawnCreature = () => {
            if (State.runtime.currentTheme !== 'woodland') return;
            
            // Find an empty hiding spot
            const emptySpots = hidingSpots.filter(s => !s.creature);
            if (emptySpots.length === 0) {
                this.woodlandCreatureTimeout = setTimeout(spawnCreature, 5000);
                return;
            }
            
            const spot = emptySpots[Math.floor(Math.random() * emptySpots.length)];
            const creature = creatures[Math.floor(Math.random() * creatures.length)];
            
            // Night mode: only owls and wolves are active
            const nightCreatures = ['🦉', '🐺'];
            const activeCreature = timeOfDay === 'night' 
                ? nightCreatures[Math.floor(Math.random() * nightCreatures.length)]
                : creature;
            
            const critterEl = document.createElement('div');
            critterEl.className = 'woodland-creature';
            critterEl.textContent = activeCreature;
            critterEl.style.cssText = `
                position: absolute;
                bottom: ${parseInt(spot.el.style.bottom) + 3}%;
                left: ${spot.left + 2}%;
                font-size: 28px;
                z-index: 9;
                pointer-events: auto;
                cursor: pointer;
                filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.4));
            `;
            
            // Night mode: add glowing eyes effect for some creatures
            if (timeOfDay === 'night' && (activeCreature === '🦉' || activeCreature === '🐺')) {
                const eyes = document.createElement('div');
                eyes.style.cssText = `
                    position: absolute;
                    top: 25%;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 20px;
                    height: 8px;
                    display: flex;
                    justify-content: space-between;
                    animation: creatureEyes 6s ease-in-out forwards;
                `;
                eyes.innerHTML = `
                    <div style="width:6px;height:6px;background:rgba(255,255,100,0.9);border-radius:50%;box-shadow:0 0 8px rgba(255,255,100,0.8);"></div>
                    <div style="width:6px;height:6px;background:rgba(255,255,100,0.9);border-radius:50%;box-shadow:0 0 8px rgba(255,255,100,0.8);"></div>
                `;
                critterEl.appendChild(eyes);
            }
            
            spot.creature = critterEl;
            c.appendChild(critterEl);
            
            // Click to interact
            critterEl.onclick = (e) => {
                e.stopPropagation();
                UIManager.showPostVoteMessage(creatureMessages[activeCreature] || 'A woodland creature!');
                critterEl.style.animation = 'none';
                critterEl.style.transform = 'scale(1.3)';
                critterEl.style.opacity = '0';
                setTimeout(() => {
                    critterEl.remove();
                    spot.creature = null;
                }, 300);
            };
            
            // Auto-hide after animation
            setTimeout(() => {
                if (critterEl.parentNode) {
                    critterEl.remove();
                    spot.creature = null;
                }
            }, 6000);
            
            // Schedule next creature
            const nextDelay = timeOfDay === 'night' ? 15000 : 8000;
            this.woodlandCreatureTimeout = setTimeout(spawnCreature, Math.random() * nextDelay + 5000);
        };
        
        // Start creature spawning after a short delay
        this.woodlandCreatureTimeout = setTimeout(spawnCreature, 3000);
        
        // Add floating particles (dust motes in light, fireflies at night)
        for (let i = 0; i < (timeOfDay === 'night' ? 15 : 8); i++) {
            const particle = document.createElement('div');
            const isFirefly = timeOfDay === 'night' || timeOfDay === 'dusk';
            particle.style.cssText = `
                position: absolute;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 70}%;
                width: ${isFirefly ? 4 : 2}px;
                height: ${isFirefly ? 4 : 2}px;
                background: ${isFirefly ? 'rgba(200, 255, 100, 0.9)' : 'rgba(255, 255, 200, 0.6)'};
                border-radius: 50%;
                ${isFirefly ? 'box-shadow: 0 0 6px rgba(200, 255, 100, 0.8);' : ''}
                animation: float${i} ${10 + Math.random() * 10}s ease-in-out infinite;
                z-index: 6;
            `;
            
            // Add keyframes for this particle
            const style = document.createElement('style');
            style.textContent = `
                @keyframes float${i} {
                    0%, 100% { 
                        transform: translate(0, 0) scale(1); 
                        opacity: ${isFirefly ? 0.3 : 0.5}; 
                    }
                    25% { 
                        transform: translate(${Math.random() * 40 - 20}px, ${Math.random() * 30 - 15}px) scale(${isFirefly ? 1.2 : 1}); 
                        opacity: ${isFirefly ? 1 : 0.7}; 
                    }
                    50% { 
                        transform: translate(${Math.random() * 40 - 20}px, ${Math.random() * 30 - 15}px) scale(1); 
                        opacity: ${isFirefly ? 0.2 : 0.4}; 
                    }
                    75% { 
                        transform: translate(${Math.random() * 40 - 20}px, ${Math.random() * 30 - 15}px) scale(${isFirefly ? 1.3 : 1}); 
                        opacity: ${isFirefly ? 0.9 : 0.6}; 
                    }
                }
            `;
            document.head.appendChild(style);
            c.appendChild(particle);
        }
        
        // Add some mushrooms at the base
        for (let i = 0; i < 4; i++) {
            const mushroom = document.createElement('div');
            mushroom.textContent = '🍄';
            mushroom.style.cssText = `
                position: absolute;
                bottom: ${10 + Math.random() * 5}%;
                left: ${10 + Math.random() * 80}%;
                font-size: ${12 + Math.random() * 8}px;
                opacity: 0.8;
                z-index: 3;
                filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.3));
            `;
            c.appendChild(mushroom);
        }
    }
};

const ShareManager = {
    async shareQR(type) {
        const word = State.runtime.allWords[State.runtime.currentWordIndex].text.toUpperCase();
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
        const colorHex = type === 'good' ? '16a34a' : 'dc2626'; 
        const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&color=${colorHex}&margin=20&data=${encodeURIComponent(targetUrl)}`;

        try {
            const response = await fetch(apiUrl);
            const qrBlob = await response.blob();
            const qrImg = await createImageBitmap(qrBlob);

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Increased height slightly to fit new labels
            const width = 400;
            const height = 580; 
            canvas.width = width;
            canvas.height = height;

            // Background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);

            // 1. Header: "GOOD WORD!" or "BAD WORD!"
            ctx.textAlign = 'center';
            ctx.font = '900 36px Inter, system-ui, sans-serif'; 
            ctx.fillStyle = type === 'good' ? '#16a34a' : '#dc2626';
            ctx.fillText(type === 'good' ? "GOOD WORD!" : "BAD WORD!", width / 2, 50);

            // 2. QR Code
            ctx.drawImage(qrImg, 0, 60, 400, 400); 

            // 3. Label: "Word:"
            ctx.font = 'bold 16px sans-serif';
            ctx.fillStyle = '#9ca3af'; // Light grey
            ctx.fillText('Word:', width / 2, 485);

            // 4. The Word (Extra Bold)
            ctx.fillStyle = '#1f2937'; // Dark Grey
            
            // Scale logic for long words
            ctx.font = '900 40px Inter, system-ui, sans-serif'; 
            const textWidth = ctx.measureText(word).width;
            if (textWidth > 360) {
                const scale = 360 / textWidth;
                ctx.font = `900 ${Math.floor(40 * scale)}px Inter, system-ui, sans-serif`;
            }
            ctx.fillText(word, width / 2, 530);

            // 5. Footer
            ctx.font = '12px sans-serif';
            ctx.fillStyle = '#d1d5db';
            ctx.fillText('GBword.com', width / 2, 560);

            const finalBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            const file = new File([finalBlob], `${word}_${type}_qr.png`, { type: 'image/png' });

            const shareData = {
                title: `Vote ${type} on ${word}!`,
                text: randomMsg,
                files: [file]
            };

            if (navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
            } else {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(finalBlob);
                a.download = `${word}_${type}_qr.png`;
                a.click();
                UIManager.showPostVoteMessage("QR Code downloaded!");
            }
        } catch (e) {
            console.error(e);
            UIManager.showPostVoteMessage("Could not generate QR.");
        }
    },
	
	async shareCompatibility(p1, p2, score, matches, totalRounds) {
        UIManager.showPostVoteMessage("Printing coupon... 💘");
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const width = 600;
        const height = 450;
        canvas.width = width;
        canvas.height = height;

        // 1. Pink Gradient Background
        const grd = ctx.createLinearGradient(0, 0, 0, height);
        grd.addColorStop(0, "#fce7f3"); // light pink
        grd.addColorStop(1, "#fbcfe8"); // slightly darker pink
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, width, height);

        // 2. Decorative Border
        ctx.strokeStyle = "#db2777"; // pink-600
        ctx.lineWidth = 8;
        ctx.strokeRect(10, 10, width-20, height-20);
        
        ctx.strokeStyle = "#fdf2f8"; // white inner line
        ctx.lineWidth = 4;
        ctx.strokeRect(18, 18, width-36, height-36);

        // 3. Title
        ctx.fillStyle = "#be185d"; // pink-700
        ctx.font = "900 24px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("OFFICIAL COMPATIBILITY REPORT", width/2, 60);

        // 4. Names
        ctx.fillStyle = "#1f2937"; // dark gray
        ctx.font = "bold 32px system-ui, sans-serif";
        ctx.fillText(`${p1}  💕  ${p2}`, width/2, 120);

        // 5. The Score
        ctx.fillStyle = "#db2777"; // pink-600
        ctx.font = "900 140px system-ui, sans-serif";
        ctx.fillText(`${score}%`, width/2, 260);
        
        // 6. Match Details
        ctx.fillStyle = "#6b7280"; // gray-500
        ctx.font = "bold 22px system-ui, sans-serif";
        ctx.fillText(`Matched ${matches || 0} of ${totalRounds || 0} words`, width/2, 310);
        
        // 7. Footer
        ctx.fillStyle = "#9d174d";
        ctx.font = "bold 18px system-ui, sans-serif";
        ctx.fillText("Certified by OK Stoopid (GBword.com)", width/2, 400);

        // 8. Share Logic
        try {
            const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
            const file = new File([blob], 'compatibility_test.png', { type: 'image/png' });
            
            const shareData = {
                title: 'Compatibility Result',
                text: `We are ${score}% compatible! Matched ${matches}/${totalRounds} words 💘 Test your relationship on GBword.com`,
                files: [file]
            };

            if (navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
            } else {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'ok_stoopid_result.png';
                a.click();
                UIManager.showPostVoteMessage("Coupon downloaded! 📸");
            }
        } catch (e) {
            console.error(e);
            UIManager.showPostVoteMessage("Could not share image.");
        }
    },

    async generateImage() { 
        // ... (keep existing generateImage logic) ...
        // If you need the full code for generateImage again, let me know, 
        // otherwise just keep the previous version here.
        const canvas = document.createElement('canvas');
        // ... rest of generateImage ...
        return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    },

    async share() {
        // ... (keep existing share logic) ...
        UIManager.showPostVoteMessage("Generating image...");
        try {
            const blob = await this.generateImage();
            // ... rest of share ...
        } catch (e) {
            console.error(e);
            UIManager.showPostVoteMessage("Could not share image.");
        }
    }
};

const UIManager = {
    msgTimeout: null,

    // --- ADD THESE MISSING FUNCTIONS ---
    showSplash(text, type = 'neutral') {
        const el = document.createElement('div');
        el.className = `fixed inset-0 z-[100] flex items-center justify-center pointer-events-none animate-fade-out`;
        el.innerHTML = `<div class="text-6xl font-black drop-shadow-xl transform scale-150 ${type === 'good' ? 'text-green-500' : type === 'bad' ? 'text-red-500' : 'text-white'}">${text}</div>`;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1000);
    },

    triggerConfetti() {
        if (typeof confetti !== 'undefined') {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#4f46e5', '#10b981', '#f59e0b'] });
        }
    },

    updateStreak(n) {
        // Updates the header streak (since streakCount was removed from DOM.game)
        if (DOM.header && DOM.header.streak) {
            DOM.header.streak.textContent = n;
            if (n > 0 && n % 10 === 0) {
                DOM.header.streak.classList.add('animate-bounce');
                setTimeout(() => DOM.header.streak.classList.remove('animate-bounce'), 1000);
            }
        }
    },
    
    addToHistory(word, vote) {
        // Safely tries to find the history list (it might be missing in your HTML)
        const list = document.getElementById('history-list');
        if (!list) return;
        
        const item = document.createElement('div');
        item.className = `flex justify-between items-center p-3 mb-2 rounded-lg bg-white border-l-4 shadow-sm animate-slide-in ${vote === 'good' ? 'border-green-500' : 'border-red-500'}`;
        item.innerHTML = `
            <span class="font-bold text-gray-700">${word}</span>
            <span class="text-xl">${vote === 'good' ? '👍' : '👎'}</span>
        `;
        list.insertBefore(item, list.firstChild);
        if (list.children.length > 50) list.lastChild.remove();
    },
    // -----------------------------------

    showMessage(t, err = false) {
        const wd = DOM.game.wordDisplay;
        wd.textContent = t;
        wd.className = `font-bold text-center min-h-[72px] ${err?'text-red-500':'text-gray-500'}`;
        // Smaller font for longer messages
        wd.style.fontSize = t.length > 20 ? '1.25rem' : '2.0rem';
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
        
        // FIX: Always show daily streak in header, ignoring noStreaksMode (which is only for in-game counters)
        DOM.header.streak.textContent = State.data.daily.streak || 0;

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
        
        // Update community goal bar
        CommunityGoal.update(globalTotal);
        
        this.renderMiniRankings();
    },

showRoleReveal(title, subtitle, type = 'neutral') {
        const colors = { evil: 'bg-red-600', good: 'bg-green-600', neutral: 'bg-indigo-600' };
        const bg = colors[type] || colors.neutral;
        
        const el = document.createElement('div');
        el.className = 'fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 px-4';
        el.innerHTML = `
            <div class="w-full max-w-sm p-6 bg-white rounded-2xl shadow-2xl text-center animate-pop">
                <div class="text-6xl mb-4">🤫</div>
                <h2 class="text-3xl font-black text-gray-800 mb-2">${title}</h2>
                <p class="text-gray-600 font-bold mb-6">${subtitle}</p>
                <button id="closeRoleBtn" class="w-full py-3 ${bg} text-white font-bold rounded-xl shadow-lg">UNDERSTOOD</button>
            </div>
        `;
        document.body.appendChild(el);
        document.getElementById('closeRoleBtn').onclick = () => el.remove();
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

        // --- 1. DATA SYNC ---
        const realRecord = Math.max(parseInt(d.longestStreak) || 0, parseInt(d.daily.bestStreak) || 0);
        d.longestStreak = realRecord;
        d.daily.bestStreak = realRecord;
        State.save('longestStreak', realRecord);

        // --- 2. LEFT BOX: DAILY STREAK (Click -> Scroll to Daily Leaderboard) ---
        if (DOM.profile.streak) {
            DOM.profile.streak.textContent = d.daily.streak || 0;
            DOM.profile.streak.style.cursor = 'pointer';
            DOM.profile.streak.style.textDecoration = 'underline';
            DOM.profile.streak.title = "View Daily Leaderboard";
            
            DOM.profile.streak.onclick = () => {
                ModalManager.toggle('profile', false);
                const statsBtn = document.getElementById('headerStatsCard');
                if (statsBtn) {
                    statsBtn.click();
                    setTimeout(() => {
                        const target = document.getElementById('dailyStreaksHeader');
                        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 600);
                }
            };
        }

        // --- 3. RIGHT BOX: HIGH SCORE ---
        const streakEl = document.getElementById('streak-display-value');
        if (streakEl) streakEl.textContent = realRecord + " Words";
        const bestEl = document.getElementById('bestDailyStreak');
        if (bestEl) bestEl.textContent = realRecord;

        // --- 4. CENTER: TOTAL VOTES (Click -> Top of Leaderboard) ---
        if (DOM.profile.totalVotes) {
            DOM.profile.totalVotes.textContent = d.voteCount.toLocaleString();
            DOM.profile.totalVotes.style.cursor = 'pointer';
            DOM.profile.totalVotes.style.textDecoration = 'underline';
            DOM.profile.totalVotes.onclick = () => {
                ModalManager.toggle('profile', false);
                const statsBtn = document.getElementById('headerStatsCard');
                if (statsBtn) statsBtn.click();
            };
        }

        if (DOM.profile.contributions) DOM.profile.contributions.textContent = d.contributorCount.toLocaleString();
        const goldenEl = document.getElementById('goldenWordsFound');
        if (goldenEl) goldenEl.textContent = d.daily.goldenWordsFound || 0;

        // --- 5. BADGE LOGIC ---
        if (d.insectStats.saved >= 100 && !d.badges.saint) State.unlockBadge('saint');
        if (d.insectStats.eaten >= 100 && !d.badges.exterminator) State.unlockBadge('exterminator');
        if (d.insectStats.teased >= 50 && !d.badges.prankster) State.unlockBadge('prankster');
        if (d.voteCount >= 1000 && !d.badges.judge) State.unlockBadge('judge');
        if (d.contributorCount >= 5 && !d.badges.bard) State.unlockBadge('bard');
        if ((d.unlockedThemes.length + 1) >= 5 && !d.badges.traveler) State.unlockBadge('traveler');
        if (d.fishStats.caught >= 250 && !d.badges.angler) State.unlockBadge('angler');
        if (d.fishStats.spared >= 250 && !d.badges.shepherd) State.unlockBadge('shepherd');

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

        if (DOM.profile.statsTitle) {
            DOM.profile.statsTitle.innerHTML = `${d.username ? d.username + "'s" : "Your"} Stats<br><span class="text-xs text-indigo-500 font-bold uppercase tracking-widest mt-1 block">${karmaTitle}</span>`;
        }

        const totalAvailable = Object.keys(CONFIG.THEME_SECRETS).length + 1;
        const userCount = d.unlockedThemes.length + 1;
        if (DOM.profile.themes) DOM.profile.themes.textContent = `${userCount} / ${totalAvailable}`;

        // --- 6. BUILD BADGE GRID (With your specific descriptions) ---
        const row1 = [
            { k: 'cake', i: '🎂', w: 'CAKE' }, { k: 'llama', i: '🦙', w: 'LLAMA' }, 
            { k: 'potato', i: '🥔', w: 'POTATO' }, { k: 'squirrel', i: '🐿️', w: 'SQUIRREL' }, 
            { k: 'spider', i: '🕷️', w: 'SPIDER' }, { k: 'germ', i: '🦠', w: 'GERM' }, 
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
            { k: 'exterminator', i: '☠️', t: 'The Exterminator', d: 'Fed 100 bugs', val: d.insectStats.eaten, gold: 1000 }, 
            { k: 'saint', i: '😇', t: 'The Saint', d: 'Saved 100 bugs', val: d.insectStats.saved, gold: 1000 }, 
            { k: 'prankster', i: '🃏', t: 'Original Prankster', d: 'Teased spider 50 times', val: d.insectStats.teased, gold: 500 },
            { k: 'judge', i: '⚖️', t: 'The Judge', d: 'Cast 1,000 votes', val: d.voteCount, gold: 10000 },
            { k: 'bard', i: '✍️', t: 'The Bard', d: '5 accepted words', val: d.contributorCount, gold: 50 },
            { k: 'traveler', i: '🌍', t: 'The Traveller', d: 'Unlocked 5 themes', val: userCount, gold: 10 },
            { k: 'angler', i: '🔱', t: 'The Best in Brixham', d: 'Caught 250 fish', val: d.fishStats.caught, gold: 2500 },
            { k: 'shepherd', i: '🛟', t: 'Sea Shepherd', d: 'Spared 250 fish', val: d.fishStats.spared, gold: 2500 }
        ];

        const renderRow = (list) => `<div class="flex flex-wrap justify-center gap-3 text-3xl w-full">` + list.map(x => {
            const un = d.badges[x.k];
            let defTitle = x.k.charAt(0).toUpperCase() + x.k.slice(1);
            let classes = `badge-item relative transition-all duration-300 transform `;
            let style = '';
            
            const isGold = x.gold && x.val >= x.gold;
            if (isGold) {
                defTitle = `✨ GOLD ${x.t || defTitle} ✨`;
                classes += `hover:scale-125 cursor-pointer animate-pulse-slow`;
                style = `text-shadow: 0 0 10px #fbbf24, 0 0 20px #d97706; filter: drop-shadow(0 0 2px rgba(0,0,0,0.5));`;
            } else if (un) {
                classes += `hover:scale-125 cursor-pointer`;
            } else {
                classes += `opacity-25 grayscale`;
            }

            return `<span class="${classes}" 
                    style="${style}"
                    title="${un ? (x.t || defTitle) : 'Locked'}" 
                    data-key="${x.k}"
                    ${x.w ? `data-word="${x.w}"` : ''} 
                    data-title="${un ? (isGold ? '✨ GOLD STATUS ✨' : (x.t || defTitle)) : 'Locked'}" 
                    data-desc="${un ? (isGold ? `Legendary! You reached ${x.gold}+ (${x.val})` : (x.d || 'Unlocked!')) : 'Keep playing to find this item!'}"
                    >${x.i}</span>`
        }).join('') + `</div>`;

        let bugJarHTML = '';
        if (saved > 0) {
             const bugCount = Math.min(saved, 40);
             let bugsStr = '';
             for(let i=0; i<bugCount; i++) bugsStr += `<span class="jar-bug" style="cursor: pointer; display: inline-block; padding: 2px;">🦟</span>`;
             bugJarHTML = `<div class="w-full text-center my-4 p-3 bg-green-50 rounded-xl border border-green-100"><div class="text-[10px] font-bold text-green-600 mb-1">THE BUG JAR (${saved})</div><div id="jar-container" class="text-xl">${bugsStr}</div></div>`;
        }
        
        let bugHotelHTML = '';
        const splattedCount = State.data.insectStats.splatted || 0;
        const collection = State.data.insectStats.collection || [];
        const bugTypes = [{ char: '🦟', type: 'house' }, { char: '🐞', type: 'house' }, { char: '🐝', type: 'house' }, { char: '🚁', type: 'hotel' }];
        const requiredChars = bugTypes.map(b => b.char);
        const isComplete = requiredChars.every(c => collection.includes(c));

        if (splattedCount > 0 || collection.length > 0) {
            let innerHTML = '';
            if (isComplete) {
                innerHTML = `<div class="flex justify-center gap-3 filter drop-shadow-sm mb-1">`;
                bugTypes.forEach(bug => {
                    const style = bug.type === 'hotel' ? 'border-2 border-red-500 bg-red-100 rounded-md shadow-sm text-2xl px-2 py-1' : 'border-2 border-green-500 bg-green-100 rounded-md shadow-sm text-2xl px-2 py-1';
                    innerHTML += `<span class="${style}">${bug.char}</span>`;
                });
                innerHTML += `</div><div class="text-[9px] text-green-700 mt-1 font-bold uppercase tracking-widest">You've won capitalism!</div>`;
                bugHotelHTML = `<div class="w-full text-center my-4 p-3 bg-green-50 rounded-xl border-2 border-green-500 relative overflow-hidden shadow-md"><div class="absolute top-0 right-0 bg-green-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">WINNER</div><div class="text-[10px] font-bold text-green-800 mb-3 uppercase tracking-wider">Bug Street Completed</div>${innerHTML}</div>`;
            } else {
                innerHTML = `<div class="flex justify-center gap-2 flex-wrap">`;
                bugTypes.forEach(bug => {
                    const hasIt = collection.includes(bug.char);
                    innerHTML += hasIt ? `<span class="inline-block p-1 rounded-md ${bug.type==='hotel'?'border-2 border-red-400 bg-white':'border-2 border-green-400 bg-white'} text-2xl">${bug.char}</span>` : `<span class="inline-block p-1 rounded-md border-2 border-dashed border-gray-300 text-2xl grayscale opacity-30">${bug.char}</span>`;
                });
                innerHTML += `</div>`;
                bugHotelHTML = `<div class="w-full text-center my-4 p-3 bg-stone-100 rounded-xl border border-stone-200 relative overflow-hidden"><div class="text-[10px] font-bold text-stone-500 mb-2 uppercase tracking-wider">Bug Street (${collection.length}/4)</div>${innerHTML}</div>`;
            }
        }

        const b = DOM.profile.badges;
        if (b) {
            b.innerHTML = 
                `<div class="text-xs font-bold text-gray-500 uppercase mb-2 mt-2">🏆 Word Badges</div>` + renderRow(row1) + 
                `<div class="h-px bg-gray-100 w-full my-4"></div><div class="text-xs font-bold text-gray-500 uppercase mb-2">🧸 Found Items</div>` + renderRow(row2) + 
                `<div class="h-px bg-gray-100 w-full my-4"></div><div class="text-xs font-bold text-gray-500 uppercase mb-2">🌊 Aquarium</div>` + renderRow(row_fish) + 
                bugJarHTML + bugHotelHTML + 
                `<div class="h-px bg-gray-100 w-full my-4"></div><div class="text-xs font-bold text-gray-500 uppercase mb-2">🎖️ Achievements</div>` + renderRow(row3);

            // --- 7. TOOLTIPS & SPIDER LOGIC (RESTORED) ---
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
                document.body.appendChild(tip);
                const rect = targetEl.getBoundingClientRect();
                tip.style.top = (rect.top - 60) + 'px'; 
                tip.style.left = (rect.left + rect.width / 2) + 'px';
                tip.style.transform = 'translateX(-50%)';
                requestAnimationFrame(() => tip.style.opacity = '1');
                targetEl.style.transform = "scale(1.2)";
                setTimeout(() => targetEl.style.transform = "", 200);
                setTimeout(() => { tip.style.opacity = '0'; setTimeout(() => tip.remove(), 200); }, 3000);
            };
            
            b.querySelectorAll('.badge-item').forEach(el => {
                el.onclick = (e) => {
                    e.stopPropagation();
                    if (el.dataset.word && !el.classList.contains('grayscale')) {
                        Game.loadSpecial(el.dataset.word); 
                        ModalManager.toggle('profile', false);
                    } else {
                        showTooltip(el, el.dataset.title, el.dataset.desc);
                    }
                }
            });

            // SPIDER FEEDING LOGIC
            b.querySelectorAll('.jar-bug').forEach(bug => {
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
        }

        ModalManager.toggle('profile', true);
    },
	
displayWord(w) {
        if (!w) {
            this.showMessage("No words available!");
            return
        }
        
        // Skip offensive words - move to next word
        if (ContentFilter.isOffensive(w.text)) {
            console.warn('Skipping filtered word');
            State.runtime.currentWordIndex++;
            Game.nextWord();
            return;
        }
        
        const wd = DOM.game.wordDisplay,
            txt = w.text.toUpperCase();
        wd.textContent = txt;
        
        // --- NEW: Floating Controversial Badge Logic ---
        const g = w.goodVotes || 0;
        const b = w.badVotes || 0;
        const total = g + b;
        let isContro = false;

        if (total >= 3) {
            const ratio = g / total;
            if (ratio >= 0.40 && ratio <= 0.60) {
                isContro = true;
            }
        }
        this.updateControversialIndicator(isContro);
        // -----------------------------------------------
        
        // Check if golden word in daily challenge
        const isGolden = State.runtime.isDailyMode && 
                        State.runtime.dailyChallengeType === 'golden' && 
                        State.runtime.goldenWord && 
                        (w._id === State.runtime.goldenWord._id || 
                         String(w._id) === String(State.runtime.goldenWord._id) ||
                         w.text === State.runtime.goldenWord.text);
        
        wd.className = 'font-extrabold text-gray-900 text-center min-h-[72px]';
        wd.classList.remove('golden-word');
        wd.style.cssText = '';
        wd.style.opacity = '1';
        
        if (isGolden) {
            // Golden word styling - ALWAYS golden, regardless of theme
            if (!document.getElementById('golden-style')) {
                const s = document.createElement('style');
                s.id = 'golden-style';
                s.textContent = `
                    @keyframes golden-glow {
                        0%, 100% { text-shadow: 0 0 10px #fbbf24, 0 0 20px #f59e0b, 0 0 5px #fde68a; }
                        50% { text-shadow: 0 0 20px #fbbf24, 0 0 40px #f59e0b, 0 0 60px #d97706; }
                    }
                    .golden-word {
                        color: #f59e0b !important;
                        text-shadow: 0 0 10px #fbbf24, 0 0 20px #f59e0b !important;
                        animation: golden-glow 1.5s ease-in-out infinite !important;
                    }
                `;
                document.head.appendChild(s);
            }
            wd.classList.add('golden-word');
            this.fitText(txt);
            if (!State.runtime.isCoolingDown) this.disableButtons(false);
            wd.style.cursor = 'grab';
            return;
        }
        
        const t = State.runtime.currentTheme;
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
            ind.className = 'fixed bottom-4 left-4 text-xs font-bold px-4 py-3 rounded-full shadow-lg z-50 transition-all duration-300 border-2 select-none cursor-pointer hover:scale-105 active:scale-95';
            ind.onclick = () => {
                // Toggle offline mode
                const isCurrentlyOffline = OfflineManager.isActive();
                OfflineManager.toggle(!isCurrentlyOffline);
            };
            document.body.appendChild(ind);
        }

        if (OfflineManager.isActive()) {
            // OFFLINE = RED
            ind.style.opacity = '1';
            ind.style.pointerEvents = 'auto';
            ind.style.backgroundColor = '#fef2f2';
            ind.style.borderColor = '#ef4444';
            ind.style.color = '#991b1b';
            const queueCount = State.data.voteQueue?.length || 0;
            const queueText = queueCount > 0 ? ` (${queueCount} queued)` : '';
            ind.innerHTML = `<span style="color:#ef4444">●</span> OFFLINE${queueText}`;
            ind.title = 'Click to go online and sync votes';
        } else {
            // ONLINE = GREEN
            ind.style.opacity = '1';
            ind.style.pointerEvents = 'auto';
            ind.style.backgroundColor = '#dcfce7';
            ind.style.borderColor = '#22c55e';
            ind.style.color = '#166534';
            ind.innerHTML = `<span style="color:#22c55e">●</span> ONLINE`;
            ind.title = 'Click to enable offline mode';
        }
    },
		updateControversialIndicator(active) {
        let ind = document.getElementById('controversialIndicator');
        if (!ind) {
            ind = document.createElement('div');
            ind.id = 'controversialIndicator';
            // Floating Pill Style (Bottom Right)
            ind.className = 'fixed bottom-4 right-4 bg-orange-100 text-orange-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg z-50 transition-opacity duration-500 pointer-events-none border-2 border-orange-500 flex items-center gap-2';
            ind.innerHTML = '<span class="text-lg">⚔️</span> CONTROVERSIAL';
            document.body.appendChild(ind);
        }
        ind.style.opacity = active ? '1' : '0';
    },

   showCountdown(seconds, callback, isTraitor = false, team = null, vipInfo = null) {
        const old = document.getElementById('game-countdown');
        if (old) old.remove();

        // 1. Dynamic Background & Text
        let bgClass = 'bg-indigo-900';
        let roleText = '<div class="text-indigo-300 text-xl font-bold mt-4 tracking-widest opacity-50">GET READY</div>';
        
        if (isTraitor) {
            bgClass = 'bg-red-900';
            roleText = '<div class="text-red-400 text-3xl font-black animate-pulse mt-4 tracking-widest border-2 border-red-500 px-4 py-1 rounded">YOU ARE THE TRAITOR</div>';
        } else if (team === 'red') {
            bgClass = 'bg-red-800';
            roleText = '<div class="text-red-300 text-3xl font-black animate-pulse mt-4 tracking-widest border-2 border-red-400 px-4 py-2 rounded">🔴 TEAM RED</div>';
        } else if (team === 'blue') {
            bgClass = 'bg-blue-800';
            roleText = '<div class="text-blue-300 text-3xl font-black animate-pulse mt-4 tracking-widest border-2 border-blue-400 px-4 py-2 rounded">🔵 TEAM BLUE</div>';
        } else if (vipInfo) {
            bgClass = vipInfo.isMe ? 'bg-yellow-700' : 'bg-yellow-800';
            if (vipInfo.isMe) {
                roleText = '<div class="text-yellow-200 text-3xl font-black animate-pulse mt-4 tracking-widest border-2 border-yellow-400 px-4 py-2 rounded">⭐ YOU ARE THE VIP</div>';
            } else {
                roleText = `<div class="text-yellow-200 text-2xl font-black mt-4 tracking-widest border-2 border-yellow-400 px-4 py-2 rounded">⭐ The VIP is: ${vipInfo.name}</div>`;
            }
        }

        const el = document.createElement('div');
        el.id = 'game-countdown';
        el.className = `fixed inset-0 ${bgClass} z-[99999] flex flex-col items-center justify-center transition-colors duration-500`;
        
        // 2. HTML Structure
        el.innerHTML = `
            <div id="cd-text" class="text-white font-black text-9xl animate-ping opacity-90">${seconds}</div>
            ${roleText}
        `;
        document.body.appendChild(el);

        let count = seconds;
        const tick = () => {
            count--;
            if (count > 0) {
                const text = document.getElementById('cd-text');
                if(text) text.innerText = count;
                if (typeof Haptics !== 'undefined') Haptics.medium();
            } else {
                clearInterval(timer);
                const text = document.getElementById('cd-text');
                if(text) {
                    text.innerText = "GO!";
                    text.classList.remove('animate-ping');
                    text.classList.add('animate-bounce');
                }
                if (typeof Haptics !== 'undefined') Haptics.heavy();
                
                setTimeout(() => {
                    el.remove();
                    if (callback) callback();
                }, 800);
            }
        };
        const timer = setInterval(tick, 1000);
    },

    showDrinkingModal(data) {
        const modalId = 'drinkingModal';
        const old = document.getElementById(modalId);
        if(old) old.remove();

        const drinkersHtml = data.drinkers.map(d => 
            `<div class="font-bold text-lg text-yellow-900 border-b border-yellow-200 last:border-0 py-1">
                ${d.icon || '🍺'} ${d.name} <span class="text-sm font-normal text-yellow-700">- ${d.reason}</span>
            </div>`
        ).join('');

        const html = `
        <div id="${modalId}" class="fixed inset-0 bg-yellow-900/95 z-[10000] flex items-center justify-center p-4 animate-fade-in font-sans">
            <div class="bg-yellow-50 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center border-4 border-yellow-400 transform scale-100">
                <div class="text-6xl mb-4 animate-bounce">🍻</div>
                <h2 class="text-3xl font-black text-yellow-900 mb-2">DRINK PENALTY!</h2>
                <div class="text-yellow-800 font-bold mb-6 text-lg bg-yellow-200 inline-block px-3 py-1 rounded-lg">${data.msg || "Penalty Round"}</div>
                
                <div class="bg-white rounded-xl p-4 mb-6 border-2 border-yellow-200 shadow-inner max-h-[30vh] overflow-y-auto">
                    ${drinkersHtml || '<div class="text-gray-400 italic">Everyone is safe... for now.</div>'}
                </div>

                <button id="drink-ready-btn" onclick="RoomManager.confirmReady()" class="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl text-xl shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2">
                    <span>👍</span> WE ARE READY
                </button>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', html);
    },

    closeDrinkingModal() {
        const el = document.getElementById('drinkingModal');
        if (el) {
            el.classList.add('opacity-0');
            setTimeout(() => el.remove(), 300);
        }
    },

    showGameOverModal(data) {
        const modalId = 'gameOverModal';
        const old = document.getElementById(modalId);
        if(old) old.remove();

let restartAction = "window.location.reload()";

if (OfflineManager.isActive() || document.body.classList.contains('listening-mode')) {
    restartAction = "document.getElementById('gameOverModal').remove(); Game.resetGame(); Game.nextWord();";
} 
else if (window.RoomManager && window.RoomManager.roomCode) {
    restartAction = "RoomManager.rejoin()";
}

        let header = '';
        let body = '';
        
        // --- 1. OK STOOPID (Couples Mode) ---
        if (data.mode === 'okstoopid') {
            // Use server-calculated compatibility
            const okData = data.okStoopidResult || {};
            const percent = okData.compatibility || 0;
            const matches = okData.matches || 0;
            const totalRounds = okData.totalRounds || RoomManager.currentWordCount || 10;
            
            let verdict = "AWKWARD...";
            if (percent > 40) verdict = "JUST FRIENDS?";
            if (percent > 60) verdict = "DATING MATERIAL";
            if (percent > 80) verdict = "SOULMATES! 💘";
            if (percent === 100) verdict = "GET A ROOM! 💍";

            header = `<h2 class="text-3xl font-black text-center mb-1 text-pink-600">COMPATIBILITY REPORT</h2>`;
            body = `
                <div class="text-center mb-6">
                    <div class="text-6xl font-black text-indigo-900 mb-2">${percent}%</div>
                    <div class="inline-block bg-pink-100 text-pink-700 px-4 py-1 rounded-full font-bold text-sm border border-pink-200">${verdict}</div>
                    <div class="text-sm text-gray-500 mt-3">Matched ${matches} of ${totalRounds} words</div>
                </div>
            `;
            
            // Generate Compatibility Image (Optional Share Feature)
            setTimeout(() => {
                if(ShareManager && ShareManager.shareCompatibility) {
                    const p1 = data.rankings[0]?.name || "P1";
                    const p2 = data.rankings[1]?.name || "P2";
                    const shareBtn = document.getElementById('share-result-btn');
                    if(shareBtn) shareBtn.onclick = () => ShareManager.shareCompatibility(p1, p2, percent, matches, totalRounds);
                }
            }, 100);
        }
        
        // --- 2. TRAITOR MODE ---
        else if (data.mode === 'traitor') {
            // FIX: Added safety checks to prevent crashes if data is missing
            const rankings = data.rankings || [];
            const traitor = rankings.find(p => p.id === data.specialRoleId);
            const traitorName = traitor ? traitor.name : "Unknown";
            
            // Check message content safely
            const isTraitorWin = data.msg && data.msg.includes("Traitor Wins");

            header = `<h2 class="text-3xl font-black text-center mb-2 ${isTraitorWin ? 'text-red-600' : 'text-green-600'}">
                ${isTraitorWin ? 'TRAITOR WINS!' : 'TEAM WINS!'}
            </h2>`;
            
            body = `
                <div class="bg-gray-800 text-white p-4 rounded-xl text-center mb-6">
                    <div class="text-xs uppercase tracking-widest text-gray-400 mb-1">THE TRAITOR WAS</div>
                    <div class="text-2xl font-black text-red-400">${traitorName}</div>
                </div>
            `;
        }

        // --- 3. TEAM VERSUS ---
        else if (data.mode === 'versus') {
            const redScore = data.scores.red || 0;
            const blueScore = data.scores.blue || 0;
            let winner = redScore > blueScore ? "🔴 RED TEAM WINS!" : (blueScore > redScore ? "🔵 BLUE TEAM WINS!" : "🤝 IT'S A TIE!");
            
            header = `<h2 class="text-3xl font-black text-center mb-4 text-gray-800">${winner}</h2>`;
            body = `
                <div class="flex justify-center gap-4 mb-6 w-full">
                    <div class="flex-1 bg-red-50 border-2 border-red-100 p-3 rounded-xl text-center">
                        <div class="text-red-500 font-bold text-xs">RED TEAM</div>
                        <div class="text-3xl font-black text-red-700">${redScore}</div>
                    </div>
                    <div class="flex-1 bg-blue-50 border-2 border-blue-100 p-3 rounded-xl text-center">
                        <div class="text-blue-500 font-bold text-xs">BLUE TEAM</div>
                        <div class="text-3xl font-black text-blue-700">${blueScore}</div>
                    </div>
                </div>`;
        }
        
        // --- 4. STANDARD / SURVIVAL ---
        else {
            header = `<h2 class="text-3xl font-black text-center mb-4 text-indigo-700">GAME OVER</h2>`;
            if (data.msg) body += `<p class="text-center text-gray-500 font-bold mb-6 bg-gray-100 p-2 rounded-lg">${data.msg}</p>`;
        }

        // --- LEADERBOARD (Shared) ---
        let listHtml = '';
        if (data.rankings) {
            data.rankings.forEach((p, i) => {
                const isMe = p.id === RoomManager.playerId;
                const isTraitor = p.id === data.specialRoleId;
                
                let badge = '';
                if (data.mode === 'survival' && (p.lives <= 0)) badge = '💀';
                if (data.mode === 'traitor' && isTraitor) badge = '🕵️';

                listHtml += `
                <div class="flex justify-between items-center p-2 border-b border-gray-100 last:border-0 ${isMe ? 'bg-indigo-50 rounded' : ''}">
                    <div class="flex items-center gap-2">
                        <span class="font-bold text-gray-300 w-6 text-sm">#${i+1}</span>
                        <span class="font-bold ${isMe ? 'text-indigo-600' : 'text-gray-600'} text-sm truncate max-w-[120px]">
                            ${p.name || 'Guest'} ${isMe ? '(You)' : ''}
                        </span>
                        <span>${badge}</span>
                    </div>
                    <span class="font-mono font-bold text-gray-800 text-sm">${p.score} pts</span>
                </div>`;
            });
        }

        const html = `
        <div id="${modalId}" class="fixed inset-0 bg-black/80 z-[10000] flex items-center justify-center p-4 animate-fade-in font-sans">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 transform scale-100 relative overflow-hidden">
                <button onclick="window.location.href = window.location.pathname" class="absolute top-3 right-4 text-gray-400 hover:text-gray-600 font-bold text-2xl z-10">&times;</button>
                
                ${header}
                
                ${body}

                <div class="bg-white border border-gray-200 rounded-xl mb-6 max-h-[30vh] overflow-y-auto custom-scrollbar">
                    ${listHtml}
                </div>

                <div class="flex flex-col gap-3">
                    ${data.mode === 'okstoopid' ? `<button id="share-result-btn" class="w-full py-3 bg-pink-100 hover:bg-pink-200 text-pink-600 font-bold rounded-xl transition">📸 Share Coupon</button>` : ''}
                    
<button onclick="${restartAction}" class="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xl shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2">
    <span>🔄</span> PLAY AGAIN
</button>
                </div>
            </div>
        </div>`;

        document.body.insertAdjacentHTML('beforeend', html);
    },

showKickConfirm(targetId, name) {
        const el = document.createElement('div');
        el.id = 'kickConfirmModal';
        el.className = 'fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 p-4 animate-fade-in font-sans';
        el.innerHTML = `
            <div class="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl animate-pop">
                <h3 class="text-2xl font-black text-gray-800 mb-2">KICK PLAYER?</h3>
                <p class="text-gray-500 font-bold mb-6">Are you sure you want to remove <span class="text-red-500">${name}</span>?</p>
                <div class="flex gap-3">
                    <button onclick="document.getElementById('kickConfirmModal').remove()" class="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition">CANCEL</button>
                    <button onclick="RoomManager.emitKick('${targetId}'); document.getElementById('kickConfirmModal').remove()" class="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 shadow-lg transition">KICK ✕</button>
                </div>
            </div>
        `;
        document.body.appendChild(el);
    },

    showKickedModal() {
        // Remove existing UI
        document.getElementById('lobbyModal')?.remove();
        document.getElementById('mpMenu')?.remove();
        const banner = document.querySelector('.mp-banner-text');
        if(banner) banner.remove();

        const el = document.createElement('div');
        el.className = 'fixed inset-0 z-[20000] flex items-center justify-center bg-red-900/95 p-4 animate-fade-in font-sans';
        el.innerHTML = `
            <div class="bg-white rounded-2xl p-8 w-full max-w-sm text-center shadow-2xl animate-pop border-4 border-red-500">
                <div class="text-6xl mb-4">🥾</div>
                <h2 class="text-3xl font-black text-gray-800 mb-2">KICKED!</h2>
                <p class="text-gray-500 font-bold mb-6">The host has removed you from the room.</p>
                <button onclick="window.location.href = window.location.pathname" class="w-full py-4 bg-gray-800 text-white font-bold rounded-xl text-xl shadow-lg hover:bg-gray-900 transition transform active:scale-95">
                    RETURN TO MENU
                </button>
            </div>
        `;
        document.body.appendChild(el);
    },

showProfile() {
        const modalId = 'profileModal';
        document.getElementById(modalId)?.remove();

        const streak = State.data.daily?.streak || 0;
        const total = State.data.voteCount || 0;
        const name = State.data.username || "Guest";
        
        const html = `
        <div id="${modalId}" class="fixed inset-0 bg-black/80 z-[10000] flex items-center justify-center p-4 animate-fade-in font-sans">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 transform scale-100 relative overflow-hidden text-center">
                <button onclick="document.getElementById('${modalId}').remove()" class="absolute top-3 right-4 text-gray-400 text-2xl">&times;</button>
                <h2 class="text-3xl font-black text-gray-800 mb-6">PROFILE</h2>
                
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="bg-orange-50 p-4 rounded-xl border border-orange-100">
                        <div class="text-3xl mb-1">🔥</div>
                        <div class="font-black text-2xl text-orange-600">${streak}</div>
                        <div class="text-xs font-bold text-orange-400">DAY STREAK</div>
                    </div>
                    <div class="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <div class="text-3xl mb-1">🗳️</div>
                        <div class="font-black text-2xl text-blue-600">${total}</div>
                        <div class="text-xs font-bold text-blue-400">TOTAL VOTES</div>
                    </div>
                </div>
                
                <div class="bg-gray-50 p-3 rounded-lg text-sm text-gray-500 font-bold mb-4">
                    Playing as: <span class="text-indigo-600">${name}</span>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', html);
    },

expandQR(src) {
        const el = document.createElement('div');
        el.className = 'fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 p-4 animate-fade-in cursor-pointer';
        el.onclick = () => el.remove();
        el.innerHTML = `
            <div class="relative flex flex-col items-center">
                <img src="${src}" class="max-w-full max-h-[70vh] rounded-2xl shadow-2xl border-4 border-white transform scale-100 animate-pop">
                <div class="mt-8 text-white font-black text-2xl tracking-widest animate-pulse">TAP TO CLOSE</div>
            </div>
        `;
        document.body.appendChild(el);
    }

};

const PinPad = {
    input: '',
    mode: 'set', // 'set' or 'verify'
    onSuccess: null,
    onCancel: null,
    
    // Security Constants
    MAX_ATTEMPTS: 3,
    LOCKOUT_MS: 60000,

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
                     s.textContent = "LOCKED FOR 60 SECONDS!";
                     s.className = "text-red-600 font-bold text-center mb-6 text-sm animate-pulse";
                     
                     // Force an alert so they definitely see it
                     setTimeout(() => {
                        alert("Too many failed attempts. Parental controls locked for 60 seconds.");
                        this.close(false);
                     }, 500);
                     
                } else {
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

    // --- SECURITY HELPERS ---
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

const ModalManager = {
    toggle(id, show) {
        const e = DOM.modals[id];
        e.classList.toggle('hidden', !show);
        e.classList.toggle('flex', show)
    },
init() {
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
				
				html += mkTog('toggleNoStreaks', '🧘 No Streaks, please!', s.noStreaksMode);
                html += `<p class="text-xs text-gray-400 mt-1 mb-2">Hides timers and streak counters for a relaxed game.</p>`;
				
				if (State.data.unlockedThemes.length > 0) {
                     html += mkTog('toggleRandomTheme', '🔀 Randomise Theme on Load', s.randomizeTheme);
                }
                html += mkTog('togglePercentages', 'Show Vote Percentages', s.showPercentages);
                html += mkTog('toggleTips', 'Show Tips & Hints', s.showTips);
                html += `<button onclick="TipManager.open()" class="w-full mt-2 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-lg border border-indigo-100 hover:bg-indigo-100 transition">💡 Submit Your Own Tip</button>`;
                html += mkTog('toggleZeroVotes', 'Show Only New Words (0/0)', s.zeroVotesOnly);
				html += mkTog('toggleControversial', 'Show Only Controversial Words', s.controversialOnly, 'text-orange-600');
                html += `</div></div>`;

                // 3. ACCESSIBILITY
                html += `<div class="mb-6"><h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-100 pb-1">Accessibility</h3><div class="space-y-4">`;
                html += mkTog('toggleColorblind', 'Colourblind Mode', s.colorblindMode);
                html += mkTog('toggleLargeText', 'Increase Text Size', s.largeText);
                html += mkTog('toggleMute', 'Mute All Sounds', s.muteSounds);
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
				html += mkTog('toggleWeather', '🌧️ Real-time Weather', s.enableWeather, 'text-blue-500');
				html += `<p class="text-xs text-gray-400 mt-1 mb-2">Requires location. ...only happens if it's raining (or snowing)!</p>`;
				
                html += `</div></div>`;

                // 5. INTERFACE
                html += `<div><h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-100 pb-1">Interface</h3><div class="space-y-4">`;
                html += mkTog('toggleHideMultiplayer', 'Hide Multiplayer Button', s.hideMultiplayer);
                html += mkTog('toggleHideCards', '🎨 Hide Cards (Theme Mode)', s.hideCards);
                html += `<p class="text-xs text-gray-400 mt-1 mb-2">Hides the game cards to just enjoy the theme background.</p>`;
                html += `</div></div>`;

                // Hide Data Management in Kids Mode to prevent children from deleting progress
                if (!s.kidsMode) {
				html += `<div class="mt-8 pt-4 border-t-2 border-gray-100">
                    <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Data Management</h3>
                    <p class="text-xs text-gray-500 mb-4">Please clear local data or back up your game statistics and achievements here.</p>
                    
                    <div class="grid grid-cols-2 gap-3 mb-3">
                        <button id="exportSaveBtn" class="py-2 bg-blue-50 text-blue-600 font-bold rounded-lg border border-blue-100 hover:bg-blue-100 transition flex items-center justify-center gap-2">
                            💾 Back Up!
                        </button>
                        <button id="importSaveBtn" class="py-2 bg-blue-50 text-blue-600 font-bold rounded-lg border border-blue-100 hover:bg-blue-100 transition flex items-center justify-center gap-2">
                            📂 Back Down!
                        </button>
                    </div>
                    <input type="file" id="importFileInput" accept=".json" class="hidden">

                    <button id="clearAllDataButton" class="w-full py-2 bg-red-50 text-red-600 font-bold rounded-lg border border-red-100 hover:bg-red-100 transition flex items-center justify-center gap-2">
                        🗑️ Clear All Data
                    </button>
                </div>`;
                }

                // INJECT HTML
                container.innerHTML = html;
                
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
                    const isChecked = e.target.checked;
                    // If turning ON, turn OFF controversial
                    const newSettings = { ...State.data.settings, zeroVotesOnly: isChecked };
                    if (isChecked) {
                        newSettings.controversialOnly = false;
                        const cBtn = document.getElementById('toggleControversial');
                        if(cBtn) cBtn.checked = false;
                    }
                    State.save('settings', newSettings);
                    Game.refreshData(true);
					
                };

                document.getElementById('toggleControversial').onchange = e => {
                    const isChecked = e.target.checked;
                    // If turning ON, turn OFF zero votes
                    const newSettings = { ...State.data.settings, controversialOnly: isChecked };
                    if (isChecked) {
                        newSettings.zeroVotesOnly = false;
                        const zBtn = document.getElementById('toggleZeroVotes');
                        if(zBtn) zBtn.checked = false;
                    }
                    State.save('settings', newSettings);
                    Game.refreshData(true);
                };
				
				document.getElementById('toggleNoStreaks').onchange = e => {
                    State.save('settings', { ...State.data.settings, noStreaksMode: e.target.checked });
                    UIManager.updateStats();
                    
                    // Remove floating counter if it exists
                    const floatEl = document.getElementById('streak-floating-counter');
                    if (floatEl) floatEl.remove();
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
				
				// Hide Multiplayer toggle
                const hideMultiplayerToggle = document.getElementById('toggleHideMultiplayer');
                if (hideMultiplayerToggle) {
                    hideMultiplayerToggle.onchange = e => {
                        State.save('settings', { ...State.data.settings, hideMultiplayer: e.target.checked });
                        const roomBtn = document.getElementById('roomBtn');
                        // Only show button if BOTH hideMultiplayer is off AND kidsMode is off
                        if (roomBtn) {
                            const shouldHide = e.target.checked || State.data.settings.kidsMode;
                            roomBtn.style.display = shouldHide ? 'none' : '';
                        }
                    };
                }
                
                // Hide Cards toggle (Theme Mode)
                const hideCardsToggle = document.getElementById('toggleHideCards');
                if (hideCardsToggle) {
                    hideCardsToggle.onchange = e => {
                        State.save('settings', { ...State.data.settings, hideCards: e.target.checked });
                        Game.applyHideCards(e.target.checked);
                    };
                }
				
				document.getElementById('toggleMute').onchange = e => {
                    State.save('settings', { ...State.data.settings, muteSounds: e.target.checked });
                    SoundManager.updateMute();
                };

				const arachBtn = document.getElementById('toggleArachnophobia');
                if (arachBtn) {
                    arachBtn.onchange = e => {
                        const isSafe = e.target.checked;
                        State.save('settings', { ...State.data.settings, arachnophobiaMode: isSafe });
                        
                        // --- FIX: Refund bug if web disappears ---
                        if (isSafe && typeof MosquitoManager !== 'undefined' && MosquitoManager.state === 'stuck') {
                             State.data.insectStats.saved++;
                             State.save('insectStats', State.data.insectStats);
                             MosquitoManager.remove();
                             UIManager.showPostVoteMessage("Bug returned to jar! 🦟");
                        }
                        // -----------------------------------------

                        if (State.data.currentTheme === 'halloween') {
                            Effects.halloween(true);
                        }
                    };
                }

                document.getElementById('toggleKidsMode').onchange = e => {
                    const turningOn = e.target.checked;
                    const savedPin = State.data.settings.kidsModePin;
                    const roomBtn = document.getElementById('roomBtn');

                    e.preventDefault(); 

                    const updateMultiplayerVisibility = (kidsOn) => {
                        if (roomBtn) {
                            // Hide if kids mode OR manual hide setting
                            roomBtn.style.display = (kidsOn || State.data.settings.hideMultiplayer) ? 'none' : '';
                        }
                    };

                    if (turningOn) {
                        if (!savedPin) {
                            e.target.checked = false;
                            PinPad.open('set', (newPin) => {
                                State.save('settings', { ...State.data.settings, kidsMode: true, kidsModePin: newPin });
                                UIManager.showPostVoteMessage(`Kids Mode Active! 🧸`);
                                updateMultiplayerVisibility(true);
                                Game.refreshData(true);
                                this.toggle('settings', false); 
                            }, () => {
                                
                                document.getElementById('toggleKidsMode').checked = false;
                            });
                        } else {
                            State.save('settings', { ...State.data.settings, kidsMode: true });
                            updateMultiplayerVisibility(true);
                            Game.refreshData(true);
							ModalManager.toggle('settings', false);
                        }
                    } else {
                        e.target.checked = true;
                        if (!savedPin) {
                            State.save('settings', { ...State.data.settings, kidsMode: false });
                            updateMultiplayerVisibility(false);
                            Game.refreshData(true);
                            return;
                        }
                        
                        PinPad.open('verify', () => {
                            State.save('settings', { ...State.data.settings, kidsMode: false });
                            updateMultiplayerVisibility(false);
                            Game.refreshData(true);
                            document.getElementById('toggleKidsMode').checked = false;
							ModalManager.toggle('settings', false);
                        }, () => {
                            document.getElementById('toggleKidsMode').checked = true; 
                        });
                    }
                };

                document.getElementById('toggleTilt').onchange = e => {
                    State.save('settings', { ...State.data.settings, enableTilt: e.target.checked });
                    TiltManager.refresh();
					if (window.WeatherManager) window.WeatherManager.updateVisuals();
                };
                document.getElementById('toggleMirror').onchange = e => {
                    State.save('settings', { ...State.data.settings, mirrorMode: e.target.checked });
                    Accessibility.apply();
                };
                document.getElementById('toggleLights').onchange = e => {
                    State.save('settings', { ...State.data.settings, showLights: e.target.checked });
                    Game.updateLights();
                };
				const wToggle = document.getElementById('toggleWeather');
				if (wToggle) {
					wToggle.onchange = e => WeatherManager.toggle(e.target.checked);
				}


                // --- Data Management listeners (only exist when not in Kids Mode) ---
                const exportBtn = document.getElementById('exportSaveBtn');
                const importInput = document.getElementById('importFileInput');
                const importBtn = document.getElementById('importSaveBtn');
                const clearBtn = document.getElementById('clearAllDataButton');
                
                if (exportBtn) exportBtn.onclick = () => DataManager.exportData();
                
                if (importBtn && importInput) {
                    importBtn.onclick = () => importInput.click();
                    importInput.onchange = (e) => {
                        if (e.target.files.length > 0) {
                            DataManager.importData(e.target.files[0]);
                        }
                        e.target.value = ''; 
                    };
                }
                if (clearBtn) clearBtn.onclick = State.clearAll;
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
				Game.renderLeaderboardTable();
                
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

// --- TIP SUBMISSION MANAGER ---
const TipManager = {
    serviceID: 'service_b6d75wi',
    templateID: 'template_qody7q7',
    COOLDOWN_MINS: 10, // <--- CONFIG: Minutes between messages

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
        // Use items-start with padding-top to position modal higher, avoiding keyboard overlap
        el.className = 'fixed inset-0 bg-gray-900 bg-opacity-95 z-[200] hidden flex items-start justify-center pt-16 overflow-y-auto';
        
        el.innerHTML = `
            <div class="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl mb-8">
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

// --- INPUT HANDLER (Swipe & Drag) ---
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

const DiscoveryManager = {
    // Updated targets: Left of Good, Right of Bad
    targets: [
        { id: 'voteGood', selector: '#goodButton', msg: 'Vote Good', pos: 'left' },
        { id: 'voteBad', selector: '#badButton', msg: 'Vote Bad', pos: 'right' },
        { id: 'stats', selector: '#userStatsBar', msg: 'View Progress', pos: 'bottom' },
        { id: 'rankings', selector: '#headerStatsCard', msg: 'See Graphs', pos: 'bottom' }
    ],
    
    timer: null,

    init() {
        if (!document.getElementById('discovery-styles')) {
            const s = document.createElement('style');
            s.id = 'discovery-styles';
            s.innerHTML = `
                @keyframes radar-pulse {
                    0% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.6); }
                    70% { box-shadow: 0 0 0 12px rgba(79, 70, 229, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
                }
                .discovery-halo {
                    position: relative;
                    z-index: 40;
                    animation: radar-pulse 2s infinite;
                    border-radius: 12px;
                    transition: all 0.3s;
                }
                .discovery-tooltip {
                    position: absolute;
                    background: #4f46e5;
                    color: white;
                    font-size: 11px;
                    font-weight: 800;
                    padding: 6px 10px;
                    border-radius: 6px;
                    white-space: nowrap;
                    pointer-events: none;
                    opacity: 0;
                    animation: fade-in 0.5s forwards;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.2);
                    z-index: 50;
                }
                .discovery-tooltip::after {
                    content: '';
                    position: absolute;
                    border-width: 5px;
                    border-style: solid;
                }
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `;
            document.head.appendChild(s);
        }
        setTimeout(() => this.check(), 3000);
    },

    check() {
		if (State.runtime.isMultiplayer) return;
        const nextTarget = this.targets.find(t => !State.data.discovered.includes(t.id));
        if (nextTarget) {
            // Trigger if new user (no discoveries) or random chance
            if (State.data.discovered.length === 0 || Math.random() > 0.5) {
                this.highlight(nextTarget);
            }
        }
    },
	
	clear() {
        document.querySelectorAll('.discovery-halo').forEach(el => el.classList.remove('discovery-halo'));
        document.querySelectorAll('.discovery-tooltip').forEach(el => el.remove());
    },

    highlight(target) {
        const el = document.querySelector(target.selector);
        if (!el || el.offsetParent === null) return; 

        const rect = el.getBoundingClientRect();
        if (rect.top < 0 || rect.bottom > window.innerHeight) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        el.classList.add('discovery-halo');

        const tip = document.createElement('div');
        tip.className = 'discovery-tooltip';
        tip.textContent = target.msg;
        
        // --- NEW: Handle Position Logic (Left/Right/Bottom) ---
        const pos = target.pos || 'bottom';
        const arrow = document.createElement('div'); // Create arrow manually for control
        
        if (pos === 'left') {
            tip.style.right = '110%'; // Push to left
            tip.style.top = '50%';
            tip.style.transform = 'translateY(-50%)';
            // Arrow pointing Right (from left side)
            tip.classList.add('arrow-right'); 
            Object.assign(tip.style, { right: 'calc(100% + 10px)', top: '50%', transform: 'translateY(-50%)' });
        } 
        else if (pos === 'right') {
            tip.style.left = '110%'; // Push to right
            tip.style.top = '50%';
            tip.style.transform = 'translateY(-50%)';
            // Arrow pointing Left (from right side)
        }
        else {
            // Default Bottom
            tip.style.top = '115%'; 
            tip.style.left = '50%';
            tip.style.transform = 'translateX(-50%)';
        }

        // Handle Arrow CSS injection based on position
        const styleId = 'discovery-arrow-' + pos;
        if (!document.getElementById(styleId)) {
            const s = document.createElement('style');
            s.id = styleId;
            // CSS Arrow Logic
            if (pos === 'left') {
                s.innerHTML = `.discovery-tooltip.pos-left::after { top: 50%; left: 100%; margin-top: -5px; border-color: transparent transparent transparent #4f46e5; }`;
            } else if (pos === 'right') {
                s.innerHTML = `.discovery-tooltip.pos-right::after { top: 50%; right: 100%; margin-top: -5px; border-color: transparent #4f46e5 transparent transparent; }`;
            } else {
                s.innerHTML = `.discovery-tooltip.pos-bottom::after { bottom: 100%; left: 50%; margin-left: -5px; border-color: transparent transparent #4f46e5 transparent; }`;
            }
            document.head.appendChild(s);
        }
        tip.classList.add('pos-' + pos);
        
        const originalPos = getComputedStyle(el).position;
        if (originalPos === 'static') el.style.position = 'relative';
        
        el.appendChild(tip);

        const onDiscover = (e) => {
            el.classList.remove('discovery-halo');
            if (tip) tip.remove();
            
            if (!State.data.discovered.includes(target.id)) {
                State.data.discovered.push(target.id);
                State.save('discovered', State.data.discovered);
            }
            el.removeEventListener('click', onDiscover);
            setTimeout(() => this.check(), 60000); 
        };

        el.addEventListener('click', onDiscover);
    }
};

const SeededShuffle = {
    create(seedStr) {
        // Ensure seed is a string and has content
        const str = String(seedStr || Date.now());
        let h = 0x811c9dc5;
        for (let i = 0; i < str.length; i++) {
            h ^= str.charCodeAt(i);
            h = Math.imul(h, 0x01000193);
        }
        let state = h >>> 0;
        return () => {
            state = (Math.imul(state, 1664525) + 1013904223) | 0;
            return (state >>> 0) / 4294967296;
        };
    },
    shuffle(array, seed) {
        if (!array || array.length <= 1) return array;
        const rng = this.create(seed);
        let m = array.length, t, i;
        while (m) {
            i = Math.floor(rng() * m--);
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }
        return array;
    }
};

// ============ WebRTC Local Multiplayer Manager ============
const LocalPeerManager = {
    socket: null,
    isHost: false,
    roomCode: '',
    peers: new Map(), // peerId -> { connection, dataChannel, name }
    hostConnection: null,
    hostDataChannel: null,
    words: [],
    currentWordIndex: 0,
    players: [], // { id, name, vote, connected }
    gameState: 'lobby', // lobby, playing, results
    votes: {},
    gameMode: 'coop',
    rounds: 10,
    
    // ICE servers for WebRTC
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ],
    
    initialized: false,
    hostId: null,
    
    init(socket) {
        if (this.initialized && this.socket === socket) return;
        this.socket = socket;
        this.setupSignaling();
        this.initialized = true;
        console.log('[LocalPeer] Initialized');
    },
    
    setupSignaling() {
        if (!this.socket) return;
        
        // Remove old listeners first to prevent duplicates
        this.socket.off('localRoomCreated');
        this.socket.off('localRoomJoined');
        this.socket.off('localPeerJoined');
        this.socket.off('rtcOffer');
        this.socket.off('rtcAnswer');
        this.socket.off('rtcIceCandidate');
        this.socket.off('localRoomError');
        this.socket.off('localHostDisconnected');
        this.socket.off('localPeerDisconnected');
        this.socket.off('localWordsRefreshed');
        
        // Host: room created
        this.socket.on('localRoomCreated', ({ roomCode, words, rounds }) => {
            console.log('[LocalPeer] Room created:', roomCode);
            this.roomCode = roomCode;
            this.words = words;
            this.rounds = rounds;
            this.isHost = true;
            this.gameState = 'lobby';
            this.gameMode = 'coop';
            this.players = [{ id: 'host', name: State.data.username || 'Host', vote: null, connected: true }];
            this.showLocalLobby();
            UIManager.showPostVoteMessage(`Room: ${roomCode} 📡`);
        });
        
        // Peer: joined room, wait for host's offer
        this.socket.on('localRoomJoined', async ({ roomCode, hostId, hostName }) => {
            console.log('[LocalPeer] Joined room:', roomCode, 'Host:', hostId);
            this.roomCode = roomCode;
            this.hostId = hostId;
            this.isHost = false;
            UIManager.showPostVoteMessage(`Connecting to ${hostName}... 🔗`);
            // Now wait for rtcOffer from host
        });
        
        // Host: new peer wants to connect - create offer
        this.socket.on('localPeerJoined', async ({ peerId, peerName }) => {
            console.log('[LocalPeer] Peer joined:', peerName, peerId);
            if (!this.isHost) return;
            await this.connectToPeer(peerId, peerName);
        });
        
        // Peer receives offer from host
        this.socket.on('rtcOffer', async ({ from, offer, roomCode }) => {
            console.log('[LocalPeer] Received offer from:', from);
            if (this.isHost) return;
            try {
                await this.handleOffer(from, offer);
            } catch (e) {
                console.error('[LocalPeer] Error handling offer:', e);
                UIManager.showPostVoteMessage("Connection failed ❌");
            }
        });
        
        // Host receives answer from peer
        this.socket.on('rtcAnswer', async ({ from, answer }) => {
            console.log('[LocalPeer] Received answer from:', from);
            if (!this.isHost) return;
            const peer = this.peers.get(from);
            if (peer && peer.connection) {
                try {
                    await peer.connection.setRemoteDescription(new RTCSessionDescription(answer));
                } catch (e) {
                    console.error('[LocalPeer] Error setting remote description:', e);
                }
            }
        });
        
        // ICE candidate exchange
        this.socket.on('rtcIceCandidate', async ({ from, candidate }) => {
            if (!candidate) return;
            try {
                if (this.isHost) {
                    const peer = this.peers.get(from);
                    if (peer?.connection) {
                        await peer.connection.addIceCandidate(new RTCIceCandidate(candidate));
                    }
                } else if (this.hostConnection) {
                    await this.hostConnection.addIceCandidate(new RTCIceCandidate(candidate));
                }
            } catch (e) {
                console.error('[LocalPeer] ICE candidate error:', e);
            }
        });
        
        // Error handling
        this.socket.on('localRoomError', ({ message }) => {
            console.error('[LocalPeer] Error:', message);
            UIManager.showPostVoteMessage(message);
            this.closeLocalUI();
        });
        
        // Host disconnected
        this.socket.on('localHostDisconnected', () => {
            UIManager.showPostVoteMessage("Host disconnected 😢");
            this.cleanup();
            this.closeLocalUI();
        });
        
        // Peer disconnected
        this.socket.on('localPeerDisconnected', ({ peerId }) => {
            const peer = this.peers.get(peerId);
            if (peer) {
                this.players = this.players.filter(p => p.id !== peerId);
                if (peer.connection) peer.connection.close();
                this.peers.delete(peerId);
                this.updateLobbyUI();
            }
        });
        
        // Host: words refreshed
        this.socket.on('localWordsRefreshed', ({ words }) => {
            console.log('[LocalPeer] Words refreshed:', words.length);
            this.words = words;
            UIManager.showPostVoteMessage(`Got ${words.length} new words! 📝`);
            this.showLocalLobby();
        });
    },
    
    // Host: create a local room
    async createRoom(rounds = 10) {
        if (!this.socket) {
            this.socket = RoomManager.socket; // Reuse existing socket
        }
        if (!this.socket?.connected) {
            UIManager.showPostVoteMessage("Need brief connection to create room");
            return;
        }
        
        this.socket.emit('createLocalRoom', { 
            username: State.data.username || 'Host',
            rounds: rounds
        });
    },
    
    // Peer: join a local room
    async joinRoom(roomCode) {
        if (!this.socket) {
            this.socket = RoomManager.socket;
        }
        if (!this.socket?.connected) {
            UIManager.showPostVoteMessage("Need brief connection to join");
            return;
        }
        
        this.socket.emit('joinLocalRoom', {
            roomCode: roomCode.toUpperCase(),
            username: State.data.username || 'Player'
        });
    },
    
    // Host: create connection to a new peer
    async connectToPeer(peerId, peerName) {
        console.log('[LocalPeer] Host connecting to peer:', peerName, peerId);
        
        const connection = new RTCPeerConnection({ iceServers: this.iceServers });
        const dataChannel = connection.createDataChannel('gameData', { ordered: true });
        
        this.peers.set(peerId, { 
            connection, 
            dataChannel, 
            name: peerName,
            ready: false
        });
        
        // Add player to list
        this.players.push({ id: peerId, name: peerName, vote: null, connected: false });
        this.updateLobbyUI();
        
        dataChannel.onopen = () => {
            console.log('[LocalPeer] Data channel open to', peerName);
            const peer = this.peers.get(peerId);
            if (peer) peer.ready = true;
            
            // Update player as connected
            const player = this.players.find(p => p.id === peerId);
            if (player) player.connected = true;
            
            // Send current state to new peer
            this.sendToPeer(peerId, {
                type: 'init',
                words: this.words,
                players: this.players.map(p => ({ id: p.id, name: p.name, connected: p.connected })),
                gameState: this.gameState,
                currentWordIndex: this.currentWordIndex,
                gameMode: this.gameMode || 'coop',
                rounds: this.rounds || 10
            });
            
            this.updateLobbyUI();
            UIManager.showPostVoteMessage(`${peerName} connected! 🎉`);
        };
        
        dataChannel.onmessage = (e) => this.handlePeerMessage(peerId, JSON.parse(e.data));
        dataChannel.onclose = () => this.handlePeerDisconnect(peerId);
        
        connection.onicecandidate = (e) => {
            if (e.candidate) {
                console.log('[LocalPeer] Sending ICE candidate to peer');
                this.socket.emit('rtcIceCandidate', { targetId: peerId, candidate: e.candidate });
            }
        };
        
        connection.onconnectionstatechange = () => {
            console.log('[LocalPeer] Connection state:', connection.connectionState);
        };
        
        // Create and send offer
        try {
            const offer = await connection.createOffer();
            await connection.setLocalDescription(offer);
            console.log('[LocalPeer] Sending offer to peer via server');
            this.socket.emit('rtcOffer', { targetId: peerId, offer: offer, roomCode: this.roomCode });
        } catch (e) {
            console.error('[LocalPeer] Error creating offer:', e);
        }
    },
    
    // Peer: handle offer from host
    async handleOffer(hostId, offer) {
        console.log('[LocalPeer] Peer handling offer from host:', hostId);
        
        try {
            this.hostConnection = new RTCPeerConnection({ iceServers: this.iceServers });
            
            this.hostConnection.ondatachannel = (e) => {
                console.log('[LocalPeer] Data channel received from host');
                this.hostDataChannel = e.channel;
                
                this.hostDataChannel.onopen = () => {
                    console.log('[LocalPeer] Data channel to host is open!');
                    UIManager.showPostVoteMessage("Connected! 🎉");
                };
                
                this.hostDataChannel.onmessage = (e) => this.handleHostMessage(JSON.parse(e.data));
                this.hostDataChannel.onclose = () => {
                    UIManager.showPostVoteMessage("Disconnected from host");
                    this.cleanup();
                };
            };
            
            this.hostConnection.onicecandidate = (e) => {
                if (e.candidate) {
                    console.log('[LocalPeer] Sending ICE candidate to host');
                    this.socket.emit('rtcIceCandidate', { targetId: hostId, candidate: e.candidate });
                }
            };
            
            this.hostConnection.onconnectionstatechange = () => {
                console.log('[LocalPeer] Connection state:', this.hostConnection.connectionState);
            };
            
            console.log('[LocalPeer] Setting remote description (offer)');
            await this.hostConnection.setRemoteDescription(new RTCSessionDescription(offer));
            
            console.log('[LocalPeer] Creating answer');
            const answer = await this.hostConnection.createAnswer();
            
            console.log('[LocalPeer] Setting local description (answer)');
            await this.hostConnection.setLocalDescription(answer);
            
            console.log('[LocalPeer] Sending answer to host via server');
            this.socket.emit('rtcAnswer', { targetId: hostId, answer: answer });
        } catch (e) {
            console.error('[LocalPeer] Error in handleOffer:', e);
            UIManager.showPostVoteMessage("Connection error ❌");
        }
    },
    
    // Host: send message to specific peer
    sendToPeer(peerId, data) {
        const peer = this.peers.get(peerId);
        if (peer?.dataChannel?.readyState === 'open') {
            peer.dataChannel.send(JSON.stringify(data));
        }
    },
    
    // Host: broadcast to all peers
    broadcast(data) {
        const msg = JSON.stringify(data);
        this.peers.forEach((peer) => {
            if (peer.dataChannel?.readyState === 'open') {
                peer.dataChannel.send(msg);
            }
        });
    },
    
    // Peer: send to host
    sendToHost(data) {
        if (this.hostDataChannel?.readyState === 'open') {
            this.hostDataChannel.send(JSON.stringify(data));
        }
    },
    
    // Host: handle message from peer
    handlePeerMessage(peerId, data) {
        if (data.type === 'vote') {
            this.votes[peerId] = data.vote;
            const player = this.players.find(p => p.id === peerId);
            if (player) player.vote = data.vote;
            
            // Broadcast that player voted
            this.broadcast({ type: 'playerVoted', playerId: peerId });
            
            // Check if all voted
            this.checkAllVoted();
        }
    },
    
    // Peer: handle message from host
    handleHostMessage(data) {
        switch (data.type) {
            case 'init':
                this.words = data.words;
                this.players = data.players;
                this.gameState = data.gameState;
                this.currentWordIndex = data.currentWordIndex;
                this.gameMode = data.gameMode || 'coop';
                this.rounds = data.rounds || 10;
                if (this.gameState === 'lobby') {
                    this.showLocalLobby();
                } else {
                    this.showWord();
                }
                break;
            
            case 'modeChange':
                this.gameMode = data.mode;
                this.rounds = data.rounds;
                this.showLocalLobby(); // Re-render lobby
                break;
                
            case 'gameStart':
                this.words = data.words;
                this.gameMode = data.mode || 'coop';
                this.gameState = 'playing';
                this.currentWordIndex = 0;
                this.closeLocalUI();
                this.showWord();
                break;
                
            case 'nextWord':
                this.currentWordIndex = data.wordIndex;
                this.showWord();
                break;
                
            case 'playerVoted':
                // Show that a player voted (visual feedback)
                UIManager.showPostVoteMessage("Vote received! 📩");
                break;
                
            case 'roundResult':
                this.showRoundResult(data);
                break;
                
            case 'gameEnd':
                this.showGameEnd(data);
                break;
                
            case 'playerJoined':
                this.players = data.players;
                this.updateLobbyUI();
                break;
                
            case 'playerLeft':
                this.players = data.players;
                this.updateLobbyUI();
                break;
        }
    },
    
    handlePeerDisconnect(peerId) {
        const peer = this.peers.get(peerId);
        if (peer) {
            this.players = this.players.filter(p => p.id !== peerId);
            this.peers.delete(peerId);
            this.broadcast({ type: 'playerLeft', players: this.players });
            this.updateLobbyUI();
        }
    },
    
    // Host: start the game
    startGame() {
        if (!this.isHost) return;
        
        // Check minimum players
        const modeConfig = {
            'coop': 2, 'versus': 4, 'vip': 3, 'hipster': 3, 'survival': 2
        };
        const minPlayers = modeConfig[this.gameMode] || 2;
        const connectedCount = this.players.filter(p => p.connected || p.id === 'host').length;
        
        if (connectedCount < minPlayers) {
            UIManager.showPostVoteMessage(`Need ${minPlayers}+ players for ${this.gameMode}`);
            return;
        }
        
        this.gameState = 'playing';
        this.currentWordIndex = 0;
        this.votes = {};
        
        // Limit words to selected rounds
        if (this.words.length > this.rounds) {
            this.words = this.words.slice(0, this.rounds);
        }
        
        // Reset player votes and scores
        this.players.forEach(p => {
            p.vote = null;
            p.score = 0;
            p.lives = 3; // For survival mode
        });
        
        // Close lobby UI
        this.closeLocalUI();
        
        // Broadcast game start with mode
        this.broadcast({
            type: 'gameStart',
            words: this.words,
            mode: this.gameMode
        });
        
        this.showWord();
    },
    
    // Host: advance to next word
    nextWord() {
        if (!this.isHost) return;
        
        this.currentWordIndex++;
        this.votes = {};
        this.players.forEach(p => p.vote = null);
        
        if (this.currentWordIndex >= this.words.length) {
            this.endGame();
            return;
        }
        
        this.broadcast({
            type: 'nextWord',
            wordIndex: this.currentWordIndex
        });
        
        this.showWord();
    },
    
    // Submit vote (both host and peer)
    submitVote(vote) {
        if (this.isHost) {
            // Host votes locally
            const hostPlayer = this.players.find(p => p.id === 'host');
            if (hostPlayer) hostPlayer.vote = vote;
            this.votes['host'] = vote;
            this.checkAllVoted();
        } else {
            // Peer sends to host
            this.sendToHost({ type: 'vote', vote });
        }
        
        // Visual feedback
        UIManager.disableButtons(true);
        document.body.classList.add(vote === 'good' ? 'vote-good-mode' : 'vote-bad-mode');
        SoundManager.playGood();
    },
    
    // Host: check if all players voted
    checkAllVoted() {
        if (!this.isHost) return;
        
        const connectedPlayers = this.players.filter(p => p.connected || p.id === 'host');
        const allVoted = connectedPlayers.every(p => this.votes[p.id] != null);
        
        if (allVoted) {
            this.processRound();
        }
    },
    
    // Host: process round results
    processRound() {
        const votes = this.votes;
        const voteValues = Object.values(votes);
        const goodCount = voteValues.filter(v => v === 'good').length;
        const badCount = voteValues.filter(v => v === 'bad').length;
        const majority = goodCount > badCount ? 'good' : (badCount > goodCount ? 'bad' : 'tie');
        const sync = Math.round((Math.max(goodCount, badCount) / voteValues.length) * 100);
        
        const result = {
            type: 'roundResult',
            word: this.words[this.currentWordIndex]?.text,
            votes: votes,
            majority,
            sync,
            goodCount,
            badCount
        };
        
        this.broadcast(result);
        this.showRoundResult(result);
        
        // Auto advance after delay
        setTimeout(() => {
            document.body.classList.remove('vote-good-mode', 'vote-bad-mode');
            UIManager.disableButtons(false);
            this.nextWord();
        }, 3000);
    },
    
    endGame() {
        this.gameState = 'lobby';
        this.broadcast({ type: 'gameEnd', message: 'Game Over!' });
        this.showGameEnd({ message: 'Game Over!' });
    },
    
    // UI Methods
    showLocalLobby() {
        this.closeLocalUI();
        
        const code = this.roomCode;
        const isHost = this.isHost;
        const playerCount = this.players.length;
        const connectedCount = this.players.filter(p => p.connected || p.id === 'host').length;
        
        // Mode config (same as RoomManager)
        const modeConfig = {
            'coop': { label: '🤝 Co-op', desc: 'Match the majority together!', min: 2 },
            'versus': { label: '⚔️ Versus', desc: 'Red vs Blue teams', min: 4 },
            'vip': { label: '⭐ VIP', desc: 'Match the VIP\'s vote!', min: 3 },
            'hipster': { label: '🕶️ Hipster', desc: 'Vote with the minority', min: 3 },
            'survival': { label: '💀 Survival', desc: '3 lives - match or die!', min: 2 }
        };
        
        const currentMode = this.gameMode || 'coop';
        const currentRounds = this.rounds || 10;
        const modeInfo = modeConfig[currentMode];
        const hasEnoughPlayers = connectedCount >= (modeInfo?.min || 2);
        
        // Generate mode buttons (host only can click)
        const modesHtml = Object.entries(modeConfig).map(([key, conf]) => {
            const isSelected = currentMode === key;
            const canSelect = isHost;
            return `
                <button ${canSelect ? `onclick="LocalPeerManager.setMode('${key}')"` : ''} 
                    class="p-2 rounded-lg text-left transition ${isSelected 
                        ? 'bg-green-100 border-2 border-green-500' 
                        : canSelect ? 'bg-gray-50 border border-gray-200 hover:bg-gray-100' : 'bg-gray-50 border border-gray-200 opacity-60'
                    }">
                    <div class="font-bold text-sm ${isSelected ? 'text-green-700' : 'text-gray-700'}">${conf.label}</div>
                    <div class="text-xs text-gray-500">${conf.desc}</div>
                </button>
            `;
        }).join('');
        
        // Generate player list
        const playersHtml = this.players.map(p => {
            const isConnected = p.connected || p.id === 'host';
            const isHostPlayer = p.id === 'host';
            return `
                <div class="flex items-center justify-between bg-white rounded-lg px-3 py-2 shadow-sm border ${isConnected ? 'border-green-200' : 'border-yellow-200'}">
                    <div class="flex items-center gap-2">
                        <span class="${isConnected ? 'text-green-500' : 'text-yellow-500'} text-lg">${isConnected ? '●' : '○'}</span>
                        <span class="font-medium">${p.name}</span>
                    </div>
                    ${isHostPlayer ? '<span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">HOST</span>' : ''}
                </div>
            `;
        }).join('');
        
        const html = `
        <div id="localLobby" class="fixed inset-0 bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
            <div class="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6">
                <!-- Header -->
                <div class="text-center mb-4">
                    <span class="text-xs font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">📡 LOCAL MODE</span>
                    <h2 class="text-2xl font-black text-gray-800 mt-2">Room: <span class="text-green-600 font-mono">${code}</span></h2>
                    <p class="text-sm text-gray-500">Share this code with nearby players</p>
                </div>
                
                <!-- Players -->
                <div class="bg-gray-50 rounded-xl p-4 mb-4">
                    <h3 class="font-bold text-gray-700 mb-2 flex items-center justify-between">
                        <span>Players</span>
                        <span class="text-sm font-normal text-gray-500">${connectedCount}/${playerCount} connected</span>
                    </h3>
                    <div id="localPlayerList" class="space-y-2 max-h-32 overflow-y-auto">
                        ${playersHtml}
                    </div>
                </div>
                
                <!-- Game Mode (Host controls) -->
                <div class="mb-4">
                    <h3 class="font-bold text-gray-700 mb-2">${isHost ? 'Select Mode' : 'Game Mode'}</h3>
                    <div class="grid grid-cols-2 gap-2" id="localModeGrid">
                        ${modesHtml}
                    </div>
                </div>
                
                <!-- Rounds Slider (Host only) -->
                ${isHost ? `
                <div class="mb-4">
                    <div class="flex items-center justify-between mb-2">
                        <span class="font-bold text-gray-700">Rounds</span>
                        <span id="localRoundsDisplay" class="text-green-600 font-bold">${currentRounds}</span>
                    </div>
                    <input type="range" min="5" max="30" value="${currentRounds}" 
                        oninput="LocalPeerManager.setRounds(this.value); document.getElementById('localRoundsDisplay').textContent = this.value"
                        class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600">
                </div>
                ` : `
                <div class="mb-4 text-center text-gray-500">
                    <span class="font-bold">${currentRounds} Rounds</span> · <span>${modeInfo?.label || 'Co-op'}</span>
                </div>
                `}
                
                <!-- Action Buttons -->
                <div class="space-y-2">
                    ${isHost ? `
                        <button onclick="LocalPeerManager.startGame()" 
                            class="w-full py-4 rounded-xl font-black text-lg transition transform active:scale-95 ${
                                hasEnoughPlayers 
                                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg' 
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }" ${hasEnoughPlayers ? '' : 'disabled'}>
                            ${hasEnoughPlayers ? '🎮 START GAME' : `Need ${modeInfo?.min || 2}+ players`}
                        </button>
                        <button onclick="LocalPeerManager.refreshWords()" class="w-full py-2 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition">
                            🔄 Refresh Words (${this.words.length})
                        </button>
                    ` : `
                        <div class="w-full py-4 bg-gray-100 rounded-xl text-center text-gray-500 font-bold">
                            ⏳ Waiting for host to start...
                        </div>
                    `}
                    <button onclick="LocalPeerManager.leaveRoom()" class="w-full py-2 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition">
                        Leave Room
                    </button>
                </div>
            </div>
        </div>`;
        
        document.body.insertAdjacentHTML('beforeend', html);
    },
    
    setMode(mode) {
        if (!this.isHost) return;
        this.gameMode = mode;
        // Broadcast to peers
        this.broadcast({ type: 'modeChange', mode: mode, rounds: this.rounds || 10 });
        this.showLocalLobby(); // Re-render
    },
    
    setRounds(rounds) {
        if (!this.isHost) return;
        this.rounds = parseInt(rounds);
        // Broadcast to peers
        this.broadcast({ type: 'modeChange', mode: this.gameMode || 'coop', rounds: this.rounds });
    },
    
    async refreshWords() {
        if (!this.isHost || !this.socket?.connected) return;
        UIManager.showMessage('Fetching new words... 📥');
        this.socket.emit('refreshLocalWords', { roomCode: this.roomCode, rounds: this.rounds || 10 });
    },
    
    updateLobbyUI() {
        const lobby = document.getElementById('localLobby');
        if (lobby) {
            // Re-render the whole lobby to update player list and button states
            this.showLocalLobby();
        }
    },
    
    showWord() {
        this.closeLocalUI();
        
        const word = this.words[this.currentWordIndex];
        if (!word) return;
        
        // Use existing game UI
        State.runtime.isMultiplayer = true; // Prevent normal voting
        UIManager.displayWord(word);
        UIManager.disableButtons(false);
        
        // Override vote buttons for local mode
        DOM.game.buttons.good.onclick = () => this.submitVote('good');
        DOM.game.buttons.bad.onclick = () => this.submitVote('bad');
        
        // Show word counter
        UIManager.showPostVoteMessage(`Word ${this.currentWordIndex + 1}/${this.words.length}`);
    },
    
    showRoundResult(data) {
        const msg = `${data.sync}% sync! ${data.majority === 'tie' ? "It's a tie!" : data.majority.toUpperCase() + ' wins'}`;
        UIManager.showPostVoteMessage(msg);
    },
    
    showGameEnd(data) {
        State.runtime.isMultiplayer = false;
        UIManager.showPostVoteMessage(data.message || 'Game Over!');
        
        // Restore normal vote handlers
        DOM.game.buttons.good.onclick = () => Game.vote('good');
        DOM.game.buttons.bad.onclick = () => Game.vote('bad');
        
        // Return to lobby after delay
        setTimeout(() => this.showLocalLobby(), 2000);
    },
    
    closeLocalUI() {
        const lobby = document.getElementById('localLobby');
        if (lobby) lobby.remove();
    },
    
    leaveRoom() {
        if (this.socket?.connected) {
            this.socket.emit('leaveLocalRoom', { roomCode: this.roomCode });
        }
        this.cleanup();
        this.closeLocalUI();
    },
    
    cleanup() {
        // Close all peer connections
        this.peers.forEach(peer => {
            if (peer.connection) peer.connection.close();
        });
        this.peers.clear();
        
        if (this.hostConnection) {
            this.hostConnection.close();
            this.hostConnection = null;
        }
        
        this.hostDataChannel = null;
        this.isHost = false;
        this.roomCode = '';
        this.words = [];
        this.players = [];
        this.votes = {};
        this.gameState = 'lobby';
        State.runtime.isMultiplayer = false;
        
        // Restore normal vote handlers
        if (DOM.game?.buttons) {
            DOM.game.buttons.good.onclick = () => Game.vote('good');
            DOM.game.buttons.bad.onclick = () => Game.vote('bad');
        }
    }
};

const RoomManager = {
    socket: null,
    active: false,
    roomCode: '',
    playerId: null,
    isHost: false,
    
    // STATE
    currentMode: 'coop',
    currentWordCount: 10,
    drinkingMode: false,
    extremeDrinkingMode: false,
    players: [],
    
    // ROLE STATE
    amITraitor: false,
    myTeam: null,
    vipId: null,
    vipName: null,
    amIVip: false,
    
    // PUBLIC GAMES
    isPublic: false,
    maxPlayers: 8,
    publicGames: [],
    
    // THEME SYNC STATE
    originalTheme: 'default',
    hostTheme: null,
    
    listenersAttached: false,
    
    modeConfig: {
        'coop': { label: '🤝 Co-op Sync', desc: 'Vote together! Match with the Global Majority.', min: 2 }, 
        'okstoopid': { label: '💘 OK Stoopid', desc: 'Couples Mode. Match each other quickly for the highest score!', min: 2, max: 2 },
        'versus': { label: '⚔️ Team Versus', desc: 'Red vs Blue. Best Team wins.', min: 2 }, 
        'vip': { label: '⭐ The VIP', desc: 'One player is the VIP. Everyone tries to match their vote!', min: 3 },
        'hipster': { label: '🕶️ Hipster Mode', desc: 'Be unique! Score by voting with the minority.', min: 3 },
        'speed': { label: '⏱️ Speed Demon', desc: 'Vote fast! Speed and accuracy wins.', min: 2 },
        'survival': { label: '💣 Sudden Death', desc: 'Three Lives. Vote with majority, or die.', min: 2 },
        'traitor': { label: '🕵️ The Traitor', desc: 'One Traitor tries to ruin everything!', min: 3 },
        'kids': { label: '👶 Kids Mode', desc: 'Simple words. Family friendly!', min: 2 }
    },

    init() {
        window.RoomManager = this;
        
        // Add required CSS for circular text
        if (!document.getElementById('mp-circular-css')) {
            const style = document.createElement('style');
            style.id = 'mp-circular-css';
            style.textContent = `
                @keyframes mp-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .mp-circular-text {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    animation: mp-spin 12s linear infinite;
                }
                .mp-circular-text span {
                    position: absolute;
                    left: 50%;
                    font-size: 7px;
                    font-weight: bold;
                    color: #6366f1;
                    transform-origin: 0 33px;
                }
            `;
            document.head.appendChild(style);
        }
        
        let btn = document.getElementById('roomBtn');
        if (btn) btn.remove(); 
        btn = document.createElement('button');
        btn.id = 'roomBtn';
        btn.className = 'fixed top-3 left-3 z-[60] bg-white rounded-full shadow-lg hover:bg-gray-50 transition border-2 border-indigo-100';
        btn.style.cssText = 'width: 68px; height: 68px; padding: 0;';
        
        // Generate circular text using individual rotated characters
        const text = 'MULTIPLAYER · ';
        let chars = '';
        for (let i = 0; i < text.length; i++) {
            const rotation = (i * 360 / text.length);
            chars += `<span style="transform: rotate(${rotation}deg)">${text[i]}</span>`;
        }
        
        btn.innerHTML = `
            <div style="position: relative; width: 100%; height: 100%;">
                <div class="mp-circular-text">${chars}</div>
                <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 26px;">📡</span>
            </div>`;
        btn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); this.openMenu(); };
        document.body.appendChild(btn);

        if (!window.io) {
            const sc = document.createElement('script');
            sc.src = "/socket.io/socket.io.js";
            sc.onload = () => this.connect();
            document.head.appendChild(sc);
        } else {
            this.connect();
        }

        const params = new URLSearchParams(window.location.search);
        const urlRoom = params.get('room');
        if (urlRoom) {
            setTimeout(() => { this.attemptJoinOrCreate(urlRoom.trim().toUpperCase()); }, 500);
        }
    },

    getUsername() {
        if (DOM.inputs && DOM.inputs.username && DOM.inputs.username.value) return DOM.inputs.username.value.trim();
        if (State.data.username && State.data.username !== 'Unknown') return State.data.username;
        const lsName = localStorage.getItem('username');
        if (lsName) return lsName;
        return `Guest_${Math.floor(Math.random()*1000)}`;
    },

    rejoin() {
    document.getElementById('gameOverModal')?.remove();
    this.active = false;
    State.runtime.isMultiplayer = true; // Keep MP flag true
    
    // Reset UI
    const banner = document.querySelector('.mp-banner-text');
    if(banner) banner.remove();
    const ui = document.getElementById('mp-mode-ui');
    if(ui) ui.remove();
    
    // Re-render lobby and ensure socket is clean
    this.renderLobby();
    
    // Emit join event again to ensure server knows we are back in lobby state
    this.socket.emit('joinRoom', { 
        roomCode: this.roomCode, 
        username: this.getUsername(),
        theme: State.data.currentTheme 
    });
},

    connect() {
        if (typeof io === 'undefined') return;
        if (!this.socket) this.socket = io({ transports: ['websocket'], upgrade: false });
        
        if (this.socket.connected) this.playerId = this.socket.id;
        if (this.listenersAttached) return;
        this.listenersAttached = true;

        this.socket.on('connect', () => { this.playerId = this.socket.id; });
        
        // PUBLIC GAMES LIST
        this.socket.on('publicGamesList', (games) => {
            this.publicGames = games || [];
            this.renderPublicGames();
        });
        
        // Room full error
        this.socket.on('roomFull', ({ message }) => {
            alert(message || 'This room is full!');
        });

        this.socket.on('roleAlert', (msg) => {
             this.amITraitor = true; 
        });
        
        // Team assignment notification for versus mode
        this.socket.on('teamAssigned', ({ team }) => {
            this.myTeam = team;
        });
        
        // VIP assignment notification - everyone knows who the VIP is
        this.socket.on('vipAssigned', ({ vipId, vipName }) => {
            this.vipId = vipId;
            this.vipName = vipName;
            this.amIVip = (vipId === this.playerId);
        });

        this.socket.on('gameStarted', (data) => {
            console.log("GAME START SIGNAL RECEIVED"); 
            this.closeLobby();
            this.active = true;
            
            // Build VIP info if applicable
            const vipInfo = this.vipId ? {
                isMe: this.amIVip,
                name: this.vipName
            } : null;
            
            UIManager.showCountdown(3, () => {
                if (Game && Game.startMultiplayer) {
                    Game.startMultiplayer(data);
                }
            }, this.amITraitor, this.myTeam, vipInfo); 
            this.amITraitor = false;
            this.myTeam = null;
            this.vipId = null;
            this.vipName = null;
            this.amIVip = false;
        });
        
        // Not enough players to start
        this.socket.on('startError', ({ message }) => {
            alert(message || 'Cannot start game');
        });

        this.socket.on('roomUpdate', (data) => {
            // --- FIX: THEME SYNC LOGIC ---
            if (data.theme && !this.isHost) {
                // Only guests sync to the host
                if (data.theme !== this.hostTheme) {
                    if (!this.hostTheme) {
                        this.originalTheme = State.data.currentTheme || 'default';
                    }
                    this.hostTheme = data.theme;
                    ThemeManager.apply(this.hostTheme, 'temp');
                    document.documentElement.setAttribute('data-theme', this.hostTheme);
                }
            }

            this.roomCode = this.roomCode || data.roomCode;
            this.currentMode = data.mode || 'coop';
            this.currentWordCount = parseInt(data.maxWords || 10);
            this.drinkingMode = data.drinkingMode || false;
            this.extremeDrinkingMode = data.extremeDrinkingMode || false;
            this.players = data.players || [];
            this.isPublic = data.isPublic || false;
            this.maxPlayers = data.maxPlayers || 8;
            
            this.isHost = (data.host === this.playerId);
            if(this.players.length > 0 && this.players[0].id === this.playerId) this.isHost = true;

            document.getElementById('mpMenu')?.remove();

            if (!this.active) this.renderLobby();
        });

this.socket.on('nextWord', (data) => {
            // FIX: Reset data for the new round
            State.runtime.allWords = [data.word];
            State.runtime.currentWordIndex = 0;
            
            // FIX: Hard reset the UI to ensure the new word is visible and clickable
            const wd = DOM.game.wordDisplay;
            wd.className = ''; // Remove 'fly-left' animations from previous round
            wd.style.transform = 'none';
            wd.style.opacity = '1';
            wd.style.filter = 'none';
            wd.style.color = ''; 
            
            UIManager.displayWord(data.word);
            
            // Check if player is dead (survival) or spectator
            const me = this.players.find(p => p.id === this.playerId);
            const isDead = this.currentMode === 'survival' && me && me.lives <= 0;
            const isSpectator = me && me.isSpectator;
            
            if (isDead || isSpectator) {
                // Disable voting buttons for dead/spectating players
                UIManager.disableButtons(true);
                DOM.game.buttons.good.style.opacity = '0.5';
                DOM.game.buttons.bad.style.opacity = '0.5';
            } else {
                UIManager.disableButtons(false); // Re-enable buttons for the new round
                DOM.game.buttons.good.style.opacity = '1';
                DOM.game.buttons.bad.style.opacity = '1';
            }
            
            const banner = document.querySelector('.mp-banner-text');
            if (banner) {
                let label = `${RoomManager.modeConfig[this.currentMode]?.label} (${data.wordCurrent}/${data.wordTotal})`;
                
                // --- ADDED: Lives Indicator for Survival Mode ---
                if (this.currentMode === 'survival') {
                    if (me && typeof me.lives === 'number') {
                        if (me.lives > 0) {
                            label += ` ${'❤️'.repeat(me.lives)}`;
                        } else {
                            label = `💀 YOU DIED - Spectating (${data.wordCurrent}/${data.wordTotal})`;
                        }
                    }
                }
                
                // Spectator indicator
                if (isSpectator && !isDead) {
                    label = `👁️ Spectating (${data.wordCurrent}/${data.wordTotal})`;
                }
                // ------------------------------------------------
                
                banner.textContent = label;
            }
        });

        this.socket.on('playerVoted', () => { Haptics.light(); });

this.socket.on('roundResult', (data) => {
    // FIX: Update local player state immediately to show heart loss
    if (data.players) this.players = data.players;
    
    // Refresh the banner immediately
    const banner = document.querySelector('.mp-banner-text');
    if (banner && this.currentMode === 'survival') {
        const me = this.players.find(p => p.id === this.playerId);
        if (me && typeof me.lives === 'number') {
            const wordInfo = banner.textContent.split('❤️')[0].trim(); // Keep existing word count
            banner.textContent = `${wordInfo} ${'❤️'.repeat(Math.max(0, me.lives))}`;
        }
    }

    let msg = data.data.msg || "Round Complete";
    if (data.data.sync) msg = `${data.data.sync}% Sync!`;
    UIManager.showPostVoteMessage(msg);
});

        this.socket.on('drinkPenalty', (data) => {
            UIManager.showDrinkingModal(data);
            if (typeof Haptics !== 'undefined') Haptics.heavy();
        });

        this.socket.on('drinkingComplete', () => {
            UIManager.closeDrinkingModal();
        });

        this.socket.on('gameOver', (data) => {
            this.cleanupMultiplayer(); 
            const banner = document.querySelector('.mp-banner-text');
            if(banner) banner.remove();
            const ui = document.getElementById('mp-mode-ui');
            if(ui) ui.remove();

            this.active = false;
            State.runtime.isMultiplayer = false;
            UIManager.showGameOverModal(data);
        });

        this.socket.on('kicked', () => {
            this.cleanupMultiplayer();
            this.active = false;
            State.runtime.isMultiplayer = false;
            UIManager.showKickedModal();
            this.socket.disconnect(); 
        });
    },

cleanupMultiplayer() {
        if (this.originalTheme) {
            ThemeManager.apply(this.originalTheme); 
            this.hostTheme = null;
        }
    },

    emitUpdate() {
        const payload = { 
            roomCode: this.roomCode, 
            mode: this.currentMode, 
            rounds: this.currentWordCount, 
            drinking: this.drinkingMode,
            extremeDrinking: this.extremeDrinkingMode,
            theme: State.data.currentTheme 
        };
        this.socket.emit('updateSettings', payload);
    },
    
    reannounce() {
        if (!this.isPublic || !this.isHost) return;
        this.socket.emit('keepAlive', { roomCode: this.roomCode });
        UIManager.showPostVoteMessage('📢 Room reannounced!');
    },

    updateMode(newMode) {
        if (!this.isHost) return;
        this.currentMode = newMode;
        this.renderLobby();
        this.emitUpdate();
    },

    updateWordCount(count) {
        if (!this.isHost) return;
        this.currentWordCount = parseInt(count);
        this.emitUpdate();
    },

    toggleDrinking(isChecked) {
        if (!this.isHost) return;
        this.drinkingMode = isChecked;
        // Reset extreme mode if drinking is turned off
        if (!isChecked) {
            this.extremeDrinkingMode = false;
        }
        this.renderLobby();
        this.emitUpdate();
    },

    toggleExtremeDrinking(isChecked) {
        if (!this.isHost) return;
        this.extremeDrinkingMode = isChecked;
        this.renderLobby();
        this.emitUpdate();
    },

    kickPlayer(targetId) {
        if (!this.isHost) return;
        const p = this.players.find(x => x.id === targetId);
        const name = p ? (p.name || 'Guest') : 'Player';
        UIManager.showKickConfirm(targetId, name);
    },
    
    emitKick(targetId) {
        this.socket.emit('kickPlayer', { roomCode: this.roomCode, targetId });
    },

startGame() {
        const count = this.players.length;
        
        if (this.currentMode === 'okstoopid' && count !== 2) return StreakManager.showNotification("⚠️ OK Stoopid requires exactly 2 players!", "neutral");
        if (this.currentMode === 'traitor' && count < 3) return StreakManager.showNotification("⚠️ Traitor Mode requires 3+ players!", "neutral");
        if (this.currentMode === 'coop' && count < 3) return StreakManager.showNotification("⚠️ Co-op requires 3+ players!", "neutral");
        if (this.currentMode === 'versus' && count < 4) return StreakManager.showNotification("⚠️ Team Versus requires 4+ players!", "neutral");

        this.socket.emit('startGame', { roomCode: this.roomCode });
    },
    submitVote(voteType) {
        this.socket.emit('submitVote', { roomCode: this.roomCode, vote: voteType });
    },

    confirmReady() {
        this.socket.emit('confirmReady', { roomCode: this.roomCode });
        const btn = document.getElementById('drink-ready-btn');
        if(btn) {
            btn.innerHTML = "⏳ WAITING FOR OTHERS...";
            btn.className = "w-full py-4 bg-gray-400 text-white font-bold rounded-xl text-xl cursor-not-allowed";
            btn.disabled = true;
        }
    },

renderLobby() {
        // 1. Save scroll positions of the two lists before removing
        const existingModal = document.getElementById('lobbyModal');
        let scrollPlayers = 0;
        let scrollSettings = 0;
        
        if (existingModal) {
            const scrolls = existingModal.querySelectorAll('.custom-scrollbar');
            if (scrolls[0]) scrollPlayers = scrolls[0].scrollTop;
            if (scrolls[1]) scrollSettings = scrolls[1].scrollTop;
            existingModal.remove();
        }

        // 2. Setup Variables
        const activeMode = this.currentMode;
        const activeWordCount = this.currentWordCount;
        const activeDrinking = this.drinkingMode;
        const safeCode = this.roomCode || '...';
        const roomIsPublic = this.isPublic;
        const roomMaxPlayers = this.maxPlayers || 8;
        
        // Check minimum and maximum players for current mode
        const modeSettings = this.modeConfig[activeMode] || {};
        const minPlayers = modeSettings.min || 2;
        const maxPlayers = modeSettings.max || null; // null means no max
        const playersList = this.players || [];
        const hasEnoughPlayers = playersList.length >= minPlayers && (!maxPlayers || playersList.length <= maxPlayers);
        const playerCountIssue = playersList.length < minPlayers 
            ? `Need ${minPlayers} players` 
            : (maxPlayers && playersList.length > maxPlayers ? `Max ${maxPlayers} players` : null);
        
        if (this.roomCode) {
            const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?room=${this.roomCode}`;
            window.history.replaceState({path: newUrl}, '', newUrl);
        }

        const joinUrl = `${window.location.origin}?room=${safeCode}`;
        const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(joinUrl)}`;
        
        // Public/Private badge with reannounce button for host
        const reannounceBtn = (roomIsPublic && this.isHost) 
            ? `<button onclick="RoomManager.reannounce()" class="ml-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full transition">📢 Reannounce</button>`
            : '';
        const privacyBadge = roomIsPublic 
            ? `<div class="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full mt-1"><span>🌍</span> Public (${playersList.length}/${roomMaxPlayers})${reannounceBtn}</div>`
            : `<div class="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full mt-1"><span>🔒</span> Private</div>`;

        // 3. Generate HTML
        const playersHtml = playersList.map(p => {
            let displayName = p.name || 'Guest';
            const isMe = p.id === this.playerId;
            const kickBtn = (this.isHost && !isMe) 
                ? `<button onclick="RoomManager.kickPlayer('${p.id}')" class="text-red-400 hover:text-red-600 font-bold px-3 py-1 ml-2 rounded hover:bg-red-50" title="Kick Player">✕</button>` 
                : '';

            return `<div class="flex items-center space-x-3 bg-white border border-gray-100 p-3 rounded-lg mb-2 shadow-sm">
                <div class="w-3 h-3 rounded-full ${p.ready !== false ? 'bg-green-500' : 'bg-gray-300'}"></div>
                <span class="font-bold text-gray-700 truncate flex-1">${displayName}</span>
                ${isMe ? '<span class="text-xs text-gray-400">(You)</span>' : ''}
                ${(p.id === this.players[0]?.id) ? '<span class="text-xs bg-indigo-100 text-indigo-700 px-2 rounded-full">HOST</span>' : kickBtn}
            </div>`;
        }).join('');

        let modesHtml = '';
        Object.entries(this.modeConfig).forEach(([key, conf]) => {
            const isSelected = (activeMode === key);
            if (!this.isHost && !isSelected) return; 

            const clickAttr = this.isHost ? `onclick="window.RoomManager.updateMode('${key}')"` : '';
            let styleClass = isSelected 
                ? 'bg-indigo-100 border-[3px] border-indigo-500 shadow-inner' 
                : 'bg-white border border-gray-200 hover:bg-gray-50 cursor-pointer';

            modesHtml += `
                <div ${clickAttr} class="flex flex-col p-3 rounded-xl transition-all duration-200 ${styleClass} min-h-[80px]">
                    <div class="flex justify-between items-center mb-1">
                        <span class="font-bold text-sm ${isSelected ? 'text-indigo-700' : 'text-gray-700'}">${conf.label}</span>
                        ${isSelected ? '✅' : ''}
                    </div>
                    <span class="text-xs text-gray-500 leading-tight">${conf.desc}</span>
                </div>`;
        });

        const sliderDisabled = !this.isHost ? 'disabled' : '';
        const sliderOpacity = !this.isHost ? 'opacity-70' : '';

        // Hide drinking mode for kids mode
        let drinkingHtml = '';
        if (activeMode !== 'kids') {
            const extremeMode = this.extremeDrinkingMode || false;
            if (this.isHost) {
                drinkingHtml = `
                    <div class="flex items-center justify-between bg-yellow-50 p-3 rounded-xl border border-yellow-200 mt-2">
                        <label class="text-sm font-bold text-yellow-800 flex items-center gap-2"><span>🍺</span> Drinking Mode</label>
                        <input type="checkbox" onchange="window.RoomManager.toggleDrinking(this.checked)" ${activeDrinking ? 'checked' : ''} class="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500 cursor-pointer">
                    </div>
                    ${activeDrinking ? `
                    <div class="flex items-center justify-between bg-red-50 p-3 rounded-xl border border-red-300 mt-2 animate-fade-in">
                        <label class="text-sm font-bold text-red-800 flex items-center gap-2"><span>🔥</span> Extreme Mode <span class="text-xs font-normal">(More penalties)</span></label>
                        <input type="checkbox" onchange="window.RoomManager.toggleExtremeDrinking(this.checked)" ${extremeMode ? 'checked' : ''} class="w-5 h-5 text-red-600 rounded focus:ring-red-500 cursor-pointer">
                    </div>
                    ` : ''}
                `;
            } else if (activeDrinking) {
                drinkingHtml = `
                    <div class="flex items-center justify-center gap-2 bg-yellow-100 p-2 rounded-xl border border-yellow-300 mt-2 text-yellow-800 font-bold text-sm">
                        <span>🍺</span> DRINKING MODE ACTIVE ${extremeMode ? '<span class="text-red-600 ml-2">🔥 EXTREME</span>' : ''}
                    </div>
                `;
            }
        }

        const html = `
        <div id="lobbyModal" class="fixed inset-0 bg-gray-900 z-[9999] flex flex-col md:flex-row font-sans h-full">
            <div class="w-full md:w-1/3 bg-white p-4 md:p-6 flex flex-col border-b md:border-b-0 md:border-r border-gray-200 z-10 shadow-md md:shadow-none shrink-0 h-[40%] md:h-full overflow-hidden">
			
<div class="flex justify-between md:flex-col md:items-center mb-4 md:mb-6 shrink-0 w-full">
                    <div class="text-left md:text-center w-full">
                        <div class="text-xs text-gray-400 font-bold">ROOM CODE</div>
                        <div class="text-4xl md:text-6xl font-black text-indigo-600 font-mono tracking-widest leading-none">${safeCode}</div>
                        ${privacyBadge}
                    </div>
                    
                    <div class="md:mt-6 w-auto md:w-full flex justify-end md:justify-center">
                        <img src="${qrSrc}" onclick="UIManager.expandQR('${qrSrc}')" class="rounded-lg w-20 h-20 md:w-32 md:h-32 border shadow-inner cursor-pointer hover:opacity-80 transition bg-white block">
                    </div>
                </div>
                
                <div class="text-xs font-bold text-gray-400 uppercase mb-2 shrink-0">Players</div>
                
                <div class="flex-1 overflow-y-auto custom-scrollbar p-1 border rounded-lg md:border-0 min-h-0 bg-gray-50 md:bg-white">
                    ${playersHtml}
                </div>
                
                <div class="shrink-0 mt-2 md:mt-4 pt-2 border-t md:border-0 border-gray-100">
                    <button onclick="window.location.href = window.location.pathname" class="w-full py-2 md:py-3 text-red-500 font-bold bg-red-50 hover:bg-red-100 rounded-xl transition text-sm">Leave Room</button>
                </div>
            </div>
            
            <div class="w-full md:w-2/3 bg-gray-50 p-4 md:p-6 flex flex-col relative h-[60%] md:h-full overflow-hidden">
                <h2 class="text-xl md:text-2xl font-black text-gray-800 mb-2 md:mb-4 shrink-0">Game Settings</h2>
                
                <div class="flex-1 overflow-y-auto custom-scrollbar min-h-0 pb-20">
                    <div class="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-200 mb-3 md:mb-6 ${sliderOpacity}">
                        <div class="flex justify-between items-center mb-2">
                            <label class="font-bold text-sm md:text-base text-gray-700">Words per Round</label>
                            <span id="lobbyWordCountDisplay" class="font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg text-sm">${activeWordCount} Words</span>
                        </div>
                        <input type="range" min="5" max="50" step="5" value="${activeWordCount}" ${sliderDisabled}
                            oninput="document.getElementById('lobbyWordCountDisplay').innerText = this.value + ' Words'; window.RoomManager.updateWordCount(this.value)"
                            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600">
                        ${drinkingHtml}
                    </div>

                    <div class="font-bold text-gray-700 mb-2 text-sm md:text-base">${this.isHost ? 'Select Mode' : 'Current Mode'}</div>
                    
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                        ${modesHtml}
                    </div>
                </div>

                <div class="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-white border-t flex items-center justify-between shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-20 shrink-0">
                    <div class="text-xs md:text-sm text-gray-500 hidden sm:block">
                        ${this.isHost 
                            ? (hasEnoughPlayers ? 'You are the Host.' : (playerCountIssue + ` (have ${playersList.length})`)) 
                            : 'Waiting for Host...'}
                    </div>
                    ${this.isHost ? 
                        (hasEnoughPlayers 
                            ? `<button onclick="window.RoomManager.startGame()" class="w-full sm:w-auto px-6 py-3 md:px-8 md:py-4 bg-green-500 hover:bg-green-600 text-white text-lg md:text-xl font-black rounded-xl shadow-lg transform transition active:scale-95 flex items-center justify-center gap-2"><span>START GAME</span> 🚀</button>`
                            : `<div class="w-full sm:w-auto px-6 py-3 md:px-8 md:py-4 bg-gray-300 text-gray-500 text-lg md:text-xl font-bold rounded-xl border border-gray-300 flex items-center justify-center gap-2 cursor-not-allowed"><span>${maxPlayers ? 'EXACTLY ' + maxPlayers + ' PLAYERS' : 'NEED ' + minPlayers + ' PLAYERS'}</span> 👥</div>`)
                        : `<div class="w-full sm:w-auto px-6 py-3 md:px-8 md:py-4 bg-gray-100 text-gray-400 text-lg md:text-xl font-bold rounded-xl border border-gray-200 flex items-center justify-center gap-2 cursor-not-allowed"><span>WAITING...</span> ⏳</div>`
                    }
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', html);

        // 4. Restore Scroll Positions
        if (scrollPlayers > 0 || scrollSettings > 0) {
            const newModal = document.getElementById('lobbyModal');
            if (newModal) {
                const newScrolls = newModal.querySelectorAll('.custom-scrollbar');
                if (newScrolls[0]) newScrolls[0].scrollTop = scrollPlayers;
                if (newScrolls[1]) newScrolls[1].scrollTop = scrollSettings;
            }
        }
    },

generateRandomCode() {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed I, O, 0, 1 to avoid confusion
        let result = "";
        for (let i = 0; i < 5; i++) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        const input = document.getElementById('menuRoomCodeInput');
        if (input) {
            input.value = result;
            input.focus();
        }
    },

    // P2P Local Multiplayer - Host
    async startP2PHost() {
        // Save username if entered
        const nameInput = document.getElementById('menuUsernameInput');
        if (nameInput?.value?.trim()) {
            State.data.username = nameInput.value.trim();
            State.save('username', State.data.username);
        }
        
        // Initialize LocalPeerManager with socket
        LocalPeerManager.init(this.socket);
        
        // Close menu
        const menu = document.getElementById('mpMenu');
        if (menu) menu.remove();
        
        // Start hosting
        UIManager.showMessage('Creating local room... 📡');
        await LocalPeerManager.createRoom(10);
    },

    // P2P Local Multiplayer - Join
    async joinP2P() {
        const codeInput = document.getElementById('menuRoomCodeInput');
        const roomCode = codeInput?.value?.trim().toUpperCase();
        
        if (!roomCode || roomCode.length < 3) {
            UIManager.showPostVoteMessage('Enter a room code! 📝');
            if (codeInput) codeInput.focus();
            return;
        }
        
        // Save username if entered
        const nameInput = document.getElementById('menuUsernameInput');
        if (nameInput?.value?.trim()) {
            State.data.username = nameInput.value.trim();
            State.save('username', State.data.username);
        }
        
        // Initialize LocalPeerManager with socket
        LocalPeerManager.init(this.socket);
        
        // Close menu
        const menu = document.getElementById('mpMenu');
        if (menu) menu.remove();
        
        // Join room
        UIManager.showMessage('Joining local room... 🔗');
        await LocalPeerManager.joinRoom(roomCode);
    },

    openMenu() {
        const existing = document.getElementById('mpMenu');
        if (existing) existing.remove();
        const currentName = State.data.username || '';
        
        // Request public games list from server
        if (this.socket && this.socket.connected) {
            this.socket.emit('getPublicGames');
        }
        
const html = `
        <div id="mpMenu" class="fixed inset-0 bg-black/80 z-[9999] flex items-start justify-center pt-8 md:items-center md:pt-0 backdrop-blur-sm p-4 overflow-y-auto">
            <div class="flex flex-col md:flex-row gap-4 w-full max-w-4xl">
                
                <div class="bg-white p-6 rounded-2xl shadow-2xl text-center flex-1 animate-pop relative border-t-4 border-indigo-500">
                    <button onclick="document.getElementById('mpMenu').remove()" class="absolute top-3 right-4 text-gray-400 text-xl hover:text-gray-600">&times;</button>
                    <h2 class="text-2xl font-black mb-4 text-gray-800">MULTIPLAYER MODE</h2>
                    
                    <div class="flex flex-col gap-3">
                        <div>
                            <label class="text-xs font-bold text-gray-400 uppercase text-left block mb-1">Your Name</label>
                            <input type="text" id="menuUsernameInput" placeholder="NAME" value="${currentName}" maxlength="16" class="w-full p-3 border-2 border-gray-200 rounded-xl font-bold text-center focus:border-indigo-500 outline-none">
                        </div>
                        
                        <div class="mb-2">
                            <label class="text-xs font-bold text-gray-400 uppercase text-left block mb-1">Room Code</label>
                            <div class="flex gap-2 items-stretch">
                                <input type="text" id="menuRoomCodeInput" placeholder="ENTER CODE" class="flex-1 p-3 border-2 border-gray-300 rounded-xl font-mono text-center text-xl uppercase focus:border-indigo-500 outline-none min-w-0" maxlength="10">
                                <button onclick="RoomManager.generateRandomCode()" class="bg-gray-100 hover:bg-indigo-100 text-indigo-600 font-bold px-3 md:px-4 rounded-xl border-2 border-gray-200 hover:border-indigo-200 transition-colors flex items-center justify-center gap-2 whitespace-nowrap text-xs md:text-sm">
                                    <span>🎲</span> 
                                    <span>Random <span class="hidden sm:inline">Code</span></span>
                                </button>
                            </div>
                        </div>
                        
                        <div class="bg-gray-50 p-3 rounded-xl border border-gray-200">
                            <div class="flex items-center justify-between mb-2">
                                <label class="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <span id="privacyIcon">🔒</span>
                                    <span id="privacyLabel">Private Game</span>
                                </label>
                                <button id="privacyToggle" onclick="RoomManager.togglePrivacy()" class="relative w-14 h-7 bg-gray-300 rounded-full transition-colors duration-200">
                                    <div id="privacyKnob" class="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"></div>
                                </button>
                            </div>
                            
                            <div id="maxPlayersSection" class="hidden mt-3 pt-3 border-t border-gray-200">
                                <div class="flex items-center justify-between">
                                    <label class="text-sm font-bold text-gray-600">Max Players</label>
                                    <div class="flex items-center gap-2">
                                        <button onclick="RoomManager.adjustMaxPlayers(-1)" class="w-8 h-8 bg-gray-200 rounded-lg font-bold hover:bg-gray-300 transition">-</button>
                                        <span id="maxPlayersDisplay" class="w-8 text-center font-bold text-indigo-600">8</span>
                                        <button onclick="RoomManager.adjustMaxPlayers(1)" class="w-8 h-8 bg-gray-200 rounded-lg font-bold hover:bg-gray-300 transition">+</button>
                                    </div>
                                </div>
                                <p class="text-xs text-gray-400 mt-1">Public games are visible to everyone</p>
                            </div>
                        </div>
                        
                        <button onclick="RoomManager.submitEntry()" class="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg mt-2 transition transform active:scale-95 w-full">JOIN / CREATE ONLINE</button>
                        
                        <div class="mt-4 pt-4 border-t border-gray-200">
                            <div class="p-3 bg-green-50 border border-green-200 rounded-xl">
                                <h3 class="font-bold text-green-900 text-sm mb-2 text-left flex items-center gap-2">📡 LOCAL MODE <span class="text-xs font-normal text-green-600">(No WiFi needed!)</span></h3>
                                <div class="flex gap-2">
                                    <button onclick="RoomManager.startP2PHost()" class="flex-1 py-2 bg-green-600 text-white font-bold rounded-xl shadow active:scale-95 transition flex items-center justify-center gap-1 text-sm">
                                        <span>👑</span> Host
                                    </button>
                                    <button onclick="RoomManager.joinP2P()" class="flex-1 py-2 bg-white text-green-600 border-2 border-green-200 font-bold rounded-xl active:scale-95 transition flex items-center justify-center gap-1 text-sm">
                                        <span>🎮</span> Join
                                    </button>
                                </div>
                                <p class="text-xs text-green-500 mt-2 text-left">For festivals & poor signal. Brief connection to start, then works offline!</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white p-6 rounded-2xl shadow-2xl flex-1 animate-pop relative border-t-4 border-green-500" style="animation-delay: 0.1s">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-2xl font-black text-gray-800 flex items-center gap-2">
                            <span>🌍</span> PUBLIC GAMES
                        </h2>
                        <a href="https://www.facebook.com/groups/2647677235633381" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition text-sm font-bold">
                            <img src="fblogo.png" alt="FB" class="w-5 h-5">
                            <span class="hidden sm:inline">Group</span>
                        </a>
                    </div>
                    
                    <div id="publicGamesList" class="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                        <div class="text-center py-8 text-gray-400">
                            <div class="text-3xl mb-2">📡</div>
                            <p class="text-sm">Searching for games...</p>
                        </div>
                    </div>
                    
                    <button onclick="RoomManager.refreshPublicGames()" class="w-full mt-4 py-2 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2">
                        <span>🔄</span> Refresh List
                    </button>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', html);
        setTimeout(() => document.getElementById('menuRoomCodeInput')?.focus(), 100);
        
        // Render any cached public games
        this.renderPublicGames();
    },
    
    togglePrivacy() {
        this.isPublic = !this.isPublic;
        const toggle = document.getElementById('privacyToggle');
        const knob = document.getElementById('privacyKnob');
        const icon = document.getElementById('privacyIcon');
        const label = document.getElementById('privacyLabel');
        const maxSection = document.getElementById('maxPlayersSection');
        
        if (this.isPublic) {
            toggle.classList.remove('bg-gray-300');
            toggle.classList.add('bg-indigo-500');
            knob.style.transform = 'translateX(28px)';
            icon.textContent = '🌍';
            label.textContent = 'Public Game';
            maxSection.classList.remove('hidden');
        } else {
            toggle.classList.remove('bg-indigo-500');
            toggle.classList.add('bg-gray-300');
            knob.style.transform = 'translateX(0)';
            icon.textContent = '🔒';
            label.textContent = 'Private Game';
            maxSection.classList.add('hidden');
        }
    },
    
    adjustMaxPlayers(delta) {
        this.maxPlayers = Math.min(20, Math.max(2, this.maxPlayers + delta));
        const display = document.getElementById('maxPlayersDisplay');
        if (display) display.textContent = this.maxPlayers;
    },
    
    refreshPublicGames() {
        if (this.socket && this.socket.connected) {
            this.socket.emit('getPublicGames');
            const list = document.getElementById('publicGamesList');
            if (list) {
                list.innerHTML = `
                    <div class="text-center py-8 text-gray-400">
                        <div class="text-3xl mb-2 animate-pulse">📡</div>
                        <p class="text-sm">Searching for games...</p>
                    </div>`;
            }
        }
    },
    
    renderPublicGames() {
        const list = document.getElementById('publicGamesList');
        if (!list) return;
        
        if (!this.publicGames || this.publicGames.length === 0) {
            list.innerHTML = `
                <div class="text-center py-8 text-gray-400">
                    <div class="text-3xl mb-2">😴</div>
                    <p class="text-sm font-medium">No public games available</p>
                    <p class="text-xs mt-1">Create one and others can join!</p>
                </div>`;
            return;
        }
        
        list.innerHTML = this.publicGames.map(game => {
            const isFull = game.players >= game.maxPlayers;
            const spotsLeft = game.maxPlayers - game.players;
            const modeLabel = this.modeConfig[game.mode]?.label || game.mode;
            
            return `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 ${isFull ? 'opacity-50' : 'hover:bg-gray-100'} transition">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                            <span class="font-mono font-bold text-indigo-600">${game.roomCode}</span>
                            <span class="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">${modeLabel}</span>
                        </div>
                        <div class="text-xs text-gray-500 mt-1 flex items-center gap-2">
                            <span>👥 ${game.players}/${game.maxPlayers}</span>
                            ${!isFull ? `<span class="text-green-600">${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left</span>` : '<span class="text-red-500">Full</span>'}
                        </div>
                    </div>
                    <button 
                        onclick="RoomManager.joinPublicGame('${game.roomCode}')"
                        ${isFull ? 'disabled' : ''}
                        class="px-4 py-2 ${isFull ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'} font-bold rounded-lg transition text-sm">
                        ${isFull ? 'FULL' : 'JOIN'}
                    </button>
                </div>`;
        }).join('');
    },
    
    joinPublicGame(roomCode) {
        const nameInput = document.getElementById('menuUsernameInput');
        const nameToUse = nameInput ? nameInput.value.trim() : '';
        if (nameToUse) {
            State.save('username', nameToUse);
            if(DOM.inputs.username) DOM.inputs.username.value = nameToUse;
        }
        this.attemptJoinOrCreate(roomCode, nameToUse);
    },

    submitEntry() {
        const codeInput = document.getElementById('menuRoomCodeInput');
        const nameInput = document.getElementById('menuUsernameInput');
        if (!codeInput) return;
        const code = codeInput.value.trim().toUpperCase();
        const nameToUse = nameInput ? nameInput.value.trim() : '';
        if (nameToUse) {
            State.save('username', nameToUse); 
            if(DOM.inputs.username) DOM.inputs.username.value = nameToUse;
        }
        if (code.length > 0) this.attemptJoinOrCreate(code, nameToUse);
    },

    attemptJoinOrCreate(code, nameOverride = null) {
        this.roomCode = code;
        this.socket.emit('joinRoom', { 
            roomCode: code, 
            username: nameOverride || this.getUsername(),
            theme: State.data.currentTheme,
            isPublic: this.isPublic,
            maxPlayers: this.maxPlayers
        });
    },

    closeLobby() { document.getElementById('lobbyModal')?.remove(); document.getElementById('mpMenu')?.remove(); }
};

const Game = {
    async init() {
        this.setRandomFavicon();
        DOM = loadDOM();
        try {
            // Logo click-to-refresh is handled in HTML
            
            const vEl = document.querySelector('.version-indicator');
            if (vEl) {
                vEl.textContent = `v${CONFIG.APP_VERSION} | Made by Gilxs in 12,025`;
                Object.assign(vEl.style, {
                    position: 'fixed', bottom: '15px', left: '50%', transform: 'translateX(-50%)', 
                    zIndex: '5', pointerEvents: 'none', fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontSize: '11px', fontWeight: '600', color: '#374151', letterSpacing: '0.05em',
                    backgroundColor: 'rgba(255, 255, 255, 0.92)', padding: '6px 14px',
                    borderRadius: '9999px', border: '1px solid rgba(0,0,0,0.1)', width: 'max-content',
                    textShadow: 'none', opacity: '1', mixBlendMode: 'normal'
                });
            }

            Accessibility.apply();
            try { SoundManager.init(); } catch(e) { console.warn("Audio init deferred"); }
            if (typeof this.updateLights === 'function') this.updateLights();
            UIManager.updateOfflineIndicator();
            
            window.StreakManager = StreakManager;
            window.ContactManager = ContactManager;
            window.PinPad = PinPad;
            window.TipManager = TipManager;
            window.RoomManager = RoomManager;
            window.UIManager = UIManager;

            if (DOM.game.buttons.good) DOM.game.buttons.good.onclick = () => this.vote('good');
            if (DOM.game.buttons.bad) DOM.game.buttons.bad.onclick = () => this.vote('bad');
            if (DOM.game.buttons.notWord) DOM.game.buttons.notWord.onclick = () => this.vote('notWord');
            if (DOM.game.dailyBanner) DOM.game.dailyBanner.onclick = () => this.activateDailyMode();

            document.addEventListener('keydown', (e) => {
                if (e.target.matches('input, textarea')) return;
                if (DOM.game.buttons.good.disabled) return;
                const openModals = DOM.modals && Object.values(DOM.modals).some(m => m && !m.classList.contains('hidden'));
                if (openModals) return;
                if (document.getElementById('tipModal') && !document.getElementById('tipModal').classList.contains('hidden')) return;
                if (document.getElementById('contactModal') && !document.getElementById('contactModal').classList.contains('hidden')) return;
                if (document.getElementById('pinPadModal') && !document.getElementById('pinPadModal').classList.contains('hidden')) return;
                if (document.getElementById('mpMenu')) return;
                if (document.getElementById('lobbyModal')) return;

                switch(e.code) {
                    case 'ArrowLeft': 
                        this.vote('good'); 
                        DOM.game.buttons.good.classList.add('active-press');
                        setTimeout(() => DOM.game.buttons.good.classList.remove('active-press'), 150);
                        break;
                    case 'ArrowRight': 
                        this.vote('bad'); 
                        DOM.game.buttons.bad.classList.add('active-press');
                        setTimeout(() => DOM.game.buttons.bad.classList.remove('active-press'), 150);
                        break;
                }
            });

            const qrGood = document.getElementById('qrGoodBtn');
            const qrBad = document.getElementById('qrBadBtn');
            if (qrGood) qrGood.onclick = (e) => { if (!DOM.game.buttons.good.disabled && !State.runtime.isCoolingDown) { e.stopPropagation(); ShareManager.shareQR('good'); }};
            if (qrBad) qrBad.onclick = (e) => { if (!DOM.game.buttons.good.disabled && !State.runtime.isCoolingDown) { e.stopPropagation(); ShareManager.shareQR('bad'); }};

            document.getElementById('showHelpButton').onclick = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); UIManager.showPostVoteMessage("What's going on? There aren't really any rules, but if you're really confused then drop me a message and I'll see if I can help!"); };
            document.getElementById('showDonateButton').onclick = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); UIManager.showPostVoteMessage("That's very kind, but I'm not accepting any donations at the moment. Have fun!"); };
            
            document.getElementById('submitWordButton').onclick = async () => {
                const t = DOM.inputs.newWord.value.trim();
                if (!t || t.includes(' ') || t.length > 45) { DOM.inputs.modalMsg.textContent = "Invalid word."; return }
                const btn = document.getElementById('submitWordButton'); btn.disabled = true;
                try { const r = await API.submitWord(t); if (r.status === 201) { State.incrementContributor(); DOM.inputs.modalMsg.textContent = "Success! Your new word has been added!"; setTimeout(() => { ModalManager.toggle('submission', false); this.refreshData() }, 1000) } else { const d = await r.json(); DOM.inputs.modalMsg.textContent = d.message || "Word already exists in dictionary!" } } catch (e) { DOM.inputs.modalMsg.textContent = "Network Error" }
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

            if (DOM.theme.chooser) DOM.theme.chooser.onchange = e => ThemeManager.apply(e.target.value, true);

            State.init();
            RoomManager.init();
            
            // Apply hide multiplayer setting on load (also hide in Kids Mode for child safety)
            if (State.data.settings.hideMultiplayer || State.data.settings.kidsMode) {
                const roomBtn = document.getElementById('roomBtn');
                if (roomBtn) roomBtn.style.display = 'none';
            }
            
            DOM.inputs.username.value = State.data.username === 'Unknown' ? '' : State.data.username;
            DOM.inputs.username.addEventListener('change', (e) => State.save('username', e.target.value.trim() || 'Guest'));
            
            UIManager.updateStreak(State.data.streak);
            State.runtime.history.forEach(h => UIManager.addToHistory(h.word, h.vote));
            
            InputHandler.init();
            ThemeManager.init();
			WeatherManager.init();
            ModalManager.init();
            UIManager.updateProfileDisplay();
            MosquitoManager.startMonitoring();
            this.checkDailyStatus();
            
            // Apply hide cards setting on load
            if (State.data.settings.hideCards) {
                this.applyHideCards(true);
            }
            
            await this.refreshData();
            DiscoveryManager.init();

            setTimeout(() => {
                if (DOM.screens && DOM.screens.loading) {
                    DOM.screens.loading.classList.add('opacity-0', 'pointer-events-none');
                    setTimeout(() => DOM.screens.loading?.remove(), 500);
                }
                this.nextWord();
            }, 1500);

            setInterval(() => this.checkCooldown(), 100);

        } catch(e) {
            console.error("Critical Init Error:", e);
            const vEl = document.querySelector('.version-indicator');
            if(vEl) vEl.textContent = "Error: " + e.message;
        }
    },

    async nextWord() {
        if (State.runtime.isMultiplayer) return;
        
        // --- RANDOM FETCH LOGIC RESTORED ---
        if (State.runtime.allWords.length <= State.runtime.currentWordIndex) {
            try {
                const res = await fetch(`${CONFIG.API_BASE_URL}?t=${Date.now()}`); // Fetches 1 random word
                const data = await res.json();
                if (data && data.length > 0) State.runtime.allWords.push(data[0]);
                else State.runtime.allWords.push({ text: 'RETRY', _id: null });
            } catch(e) { State.runtime.allWords.push({ text: 'OFFLINE', _id: null }); }
        }
        
        // Smart Filtering
        if (!State.runtime.isMultiplayer) {
            if (State.data.settings.zeroVotesOnly) {
                const unvoted = State.runtime.allWords.filter(w => (w.goodVotes || 0) === 0 && (w.badVotes || 0) === 0);
                if (unvoted.length > 0) State.runtime.allWords = unvoted;
                else UIManager.showPostVoteMessage("No more new words! Showing random.");
            } else if (State.data.settings.controversialOnly) {
                const contro = State.runtime.allWords.filter(w => {
                    const g = w.goodVotes || 0, b = w.badVotes || 0, t = g + b;
                    return t >= 3 && (g/t >= 0.4 && g/t <= 0.6);
                });
                if (contro.length > 0) State.runtime.allWords = contro;
                else UIManager.showPostVoteMessage("No controversial words found! Showing random.");
            }
        }

        const w = State.runtime.allWords[State.runtime.currentWordIndex];
        UIManager.displayWord(w);
    },

async vote(t, s = false) {
        if (State.runtime.isCoolingDown) return;
        
        // Minimum delay between votes (300ms)
        const n = Date.now();
        if (State.runtime.lastVoteTime > 0 && (n - State.runtime.lastVoteTime) < 300) {
            return; // Too fast, ignore
        }
        
        // Multiplayer mode - send to room
        if (State.runtime.isMultiplayer && typeof RoomManager !== 'undefined' && RoomManager.active) {
             RoomManager.submitVote(t);
             UIManager.disableButtons(true); 
             DOM.game.wordDisplay.style.opacity = '0.5'; 
             return; 
        }
        
        // Track mashing - if voting faster than STREAK_WINDOW, increment count
        if (State.runtime.lastVoteTime > 0 && (n - State.runtime.lastVoteTime) < CONFIG.VOTE.STREAK_WINDOW) {
            State.runtime.mashCount++;
        } else {
            State.runtime.mashCount = 1;
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
            if (window.StreakManager) window.StreakManager.extend(c.fade + c.dur);
            State.unlockBadge(k);
            // Track in seen history
            if (w._id && w._id !== 'temp' && w._id !== 'err') {
                const seen = State.data.seenHistory || [];
                if (!seen.includes(w._id)) {
                    seen.push(w._id);
                    while (seen.length > CONFIG.HISTORY_SIZE) seen.shift();
                    State.save('seenHistory', seen);
                }
            }
            UIManager.disableButtons(true);
            Game.cleanStyles(wd);
            wd.className = 'font-extrabold text-gray-900 text-center min-h-[72px]';
            wd.classList.add(c.text === 'LLAMA' ? 'word-fade-llama' : 'word-fade-quick');
            setTimeout(() => {
                Game.cleanStyles(wd);
                wd.style.opacity = '1';
                wd.style.transform = 'none';
                wd.textContent = c.msg;
                wd.style.fontSize = '1.25rem';
                wd.style.color = '#6b7280';
                wd.className = 'font-bold text-center min-h-[72px]';
                setTimeout(() => {
                    State.runtime.currentWordIndex++;
                    UIManager.disableButtons(false);
                    this.nextWord();
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

            // OFFLINE MODE: Queue vote for later sync
            if (OfflineManager.isActive()) {
                OfflineManager.queueVote(w._id, t);
                w[`${t}Votes`] = (w[`${t}Votes`] || 0) + 1;
                State.incrementVote();
                StreakManager.handleSuccess();
            } else {
                // ONLINE MODE: Submit immediately
                const res = await API.vote(w._id, t);
                if (res.status !== 403 && !res.ok) throw 0;
                w[`${t}Votes`] = (w[`${t}Votes`] || 0) + 1;
                State.incrementVote();
                await API.submitUserVotes(State.data.userId, State.data.username, State.data.voteCount);
                
                StreakManager.handleSuccess();
            }
            
            if (State.runtime.isDailyMode) {
                const tod = new Date(), dStr = tod.toISOString().split('T')[0];
                
                // Golden word challenge
                if (State.runtime.dailyChallengeType === 'golden') {
                    State.runtime.dailyVotesCount = (State.runtime.dailyVotesCount || 0) + 1;
                    const isGolden = (State.runtime.goldenWord && w._id === State.runtime.goldenWord._id) || 
                                    (Math.random() < 0.1 && State.runtime.dailyVotesCount >= 3);
                    
                    if (isGolden && !State.runtime.goldenWordFound) {
                        State.runtime.goldenWordFound = true;
                        UIManager.showPostVoteMessage("🌟 GOLDEN WORD! 🌟");
                        
                        const last = State.data.daily.lastDate;
                        let s = State.data.daily.streak;
                        if (last) {
                            const yd = new Date(); yd.setDate(yd.getDate() - 1);
                            s = last === yd.toISOString().split('T')[0] ? s + 1 : 1;
                        } else s = 1;
                        const best = Math.max(s, State.data.daily.bestStreak || 0);
                        const golden = (State.data.daily.goldenWordsFound || 0) + 1;
                        State.save('daily', { streak: s, lastDate: dStr, bestStreak: best, goldenWordsFound: golden });
                        DOM.daily.streakResult.textContent = '🔥 ' + s + ' 🌟';
                        
                        setTimeout(() => this.finishDailyChallenge(), 1500);
                        return;
                    } else {
                        UIManager.showPostVoteMessage(`Vote ${State.runtime.dailyVotesCount} - Keep looking! 🔍`);
                        setTimeout(() => { State.runtime.currentWordIndex++; this.nextWord(); }, 600);
                        return;
                    }
                }
                
                // Single word challenge
                const last = State.data.daily.lastDate;
                let s = State.data.daily.streak;
                if (last) {
                    const yd = new Date(); yd.setDate(yd.getDate() - 1);
                    s = last === yd.toISOString().split('T')[0] ? s + 1 : 1;
                } else s = 1;
                const best = Math.max(s, State.data.daily.bestStreak || 0);
                State.save('daily', { streak: s, lastDate: dStr, bestStreak: best });
                DOM.daily.streakResult.textContent = '🔥 ' + s;
                
                this.finishDailyChallenge();
                return;
            }

            let m = '';
            if (un) m = "🎉 New Theme Unlocked!";
            else if (State.data.settings.showPercentages && (t === 'good' || t === 'bad')) {
                const tot = (w.goodVotes || 0) + (w.badVotes || 0);
                const p = Math.round((w[`${t}Votes`] / tot) * 100);
                
                if (State.runtime.isDrinkingMode && p < 50) {
                    m = `🍺 DRINK! (You are in the minority: ${p}%)`;
                } else {
                    m = `${t==='good'?'Good':'Bad'} vote! ${p}% agree.`;
                }
            }

            if (State.data.settings.showTips && !State.runtime.isMultiplayer) { 
                State.save('voteCounterForTips', State.data.voteCounterForTips + 1);
                // Random tip interval: show tip when counter reaches nextTipAt
                if (!State.runtime.nextTipAt) State.runtime.nextTipAt = Math.floor(Math.random() * 11) + 5; // 5-15
                if (State.data.voteCounterForTips >= State.runtime.nextTipAt) {
                    if (typeof GAME_TIPS !== 'undefined') {
                        m = GAME_TIPS[Math.floor(Math.random() * GAME_TIPS.length)];
                    }
                    State.save('voteCounterForTips', 0);
                    State.runtime.nextTipAt = Math.floor(Math.random() * 11) + 5; // Reset to new random 5-15
                }
            }
            UIManager.showPostVoteMessage(m);
            if (t === 'good' || t === 'bad') Haptics.medium();
            UIManager.updateStats();
            
            UIManager.addToHistory(w.text, t);
            State.runtime.history.unshift({ word: w.text, vote: t });
            if(State.runtime.history.length > 50) State.runtime.history.pop();

            setTimeout(() => {
                wd.classList.remove('animate-fly-left', 'animate-fly-right', 'swipe-good-color', 'swipe-bad-color', 'override-theme-color');
                wd.style.transform = '';
                wd.style.opacity = '1';
                wd.style.color = '';
                if (!State.runtime.isDailyMode) {
                    State.runtime.currentWordIndex++;
                    this.nextWord();
                    // this.refreshData(false);  <-- REMOVE THIS LINE
                }
            }, (t === 'good' || t === 'bad') ? 600 : 0);

        } catch (e) {
            UIManager.showMessage("Vote Failed", true);
            wd.classList.remove('animate-fly-left', 'animate-fly-right', 'swipe-good-color', 'swipe-bad-color', 'override-theme-color');
            UIManager.disableButtons(false);
        }
    },

    checkCooldown() {
        const now = Date.now();
        if (State.runtime.mashCount > CONFIG.VOTE.MASH_LIMIT) {
            State.runtime.cooldownUntil = now + 5000;
            State.runtime.mashCount = 0;
            UIManager.showSplash("COOLDOWN!", 'bad');
        }
        if (now > State.runtime.lastVoteTime + 1000) State.runtime.mashCount = Math.max(0, State.runtime.mashCount - 1);
    },

    startMultiplayer(data) {
        State.runtime.isMultiplayer = true;
        const banner = document.createElement('div');
        // Fixed positioning
        banner.className = 'mp-banner-text fixed top-48 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-6 py-2 rounded-full text-center font-black text-indigo-100 text-sm uppercase tracking-widest z-50 animate-fade-in pointer-events-none shadow-lg whitespace-nowrap';
        document.body.appendChild(banner);

        const ui = document.createElement('div');
        ui.id = 'mp-mode-ui';
        ui.className = 'fixed top-4 right-4 z-50 flex gap-2 items-center';
        ui.innerHTML = `
            <div class="bg-indigo-600 text-white px-3 py-1 rounded-full font-bold text-xs shadow-lg animate-pulse">LIVE</div>
            <button onclick="window.location.href = window.location.pathname" class="bg-red-500 text-white px-3 py-1 rounded-full font-bold text-xs shadow-lg hover:bg-red-600 transition cursor-pointer pointer-events-auto">EXIT</button>
        `;
        document.body.appendChild(ui);
        
        this.resetGame();
        
        if (data.words && data.words.length > 0) {
            State.runtime.allWords = data.words;
            this.nextWord(); 
        } else {
            State.runtime.allWords = []; 
            UIManager.showMessage("Get Ready...");
        }
    },

    resetGame() {
        State.runtime.currentWordIndex = 0;
        DOM.game.historyList.innerHTML = '';
        UIManager.updateStreak(0);
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

    loadSpecial(t) {
        const i = State.runtime.allWords.findIndex(w => w.text.toUpperCase() === t);
        if (i !== -1) {
            State.runtime.currentWordIndex = i;
            UIManager.displayWord(State.runtime.allWords[i]);
        }
    },

 async refreshData(u = true) {
        if (State.runtime.isMultiplayer) return;
    
        if (u) UIManager.showMessage(State.data.settings.kidsMode ? "Loading Kids Mode..." : "Loading...");
        
        // Toggle buttons visibility
        const isKids = State.data.settings.kidsMode;
        DOM.game.buttons.custom.style.display = isKids ? 'none' : 'block';
        DOM.game.buttons.notWord.style.display = isKids ? 'none' : 'block';
        
        // --- FIX: REMOVED THE LINE THAT FORCED THE BANNER TO SHOW ---
        // DOM.game.dailyBanner.style.display = isKids ? 'none' : 'block'; <--- DELETED
        
        // --- ADDED: CHECK STATUS INSTEAD ---
        this.checkDailyStatus();
        // -----------------------------------

        ['compareWordsButton','qrGoodBtn','qrBadBtn'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.style.display = isKids ? 'none' : 'block';
        });

        let d = [];
        if (isKids) {
            d = await API.fetchKidsWords();
        } else {
            // FIX: Fetch ALL words (restores Global Stats)
            d = await API.getAllWords(); 
        }

		if (d && d.length > 0) {
            // Offline single-player uses cached words
            if (OfflineManager.isActive()) {
                // Use the cached words from fillCache()
                d = State.data.offlineCache || d;
                // Shuffle randomly
                for (let i = d.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [d[i], d[j]] = [d[j], d[i]];
                }
            } else {
                // Normal random shuffle for online single player
                for (let i = d.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [d[i], d[j]] = [d[j], d[i]];
                }
            }
            
            State.runtime.allWords = d;
            
            // Filter logic
            if (!isKids) {
                 State.runtime.allWords = d.filter(w => (w.notWordVotes || 0) < 3);
            }
        } else {
            State.runtime.allWords = [{ text: 'OFFLINE', _id: 'err' }];
        }

        UIManager.updateStats(); // Now shows correct numbers

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
                    State.runtime.currentWordIndex = 0;
                    UIManager.displayWord(State.runtime.allWords[0]);
                }
            } else {
                // Show first word of the shuffled list
                State.runtime.currentWordIndex = 0;
                UIManager.displayWord(State.runtime.allWords[0]); 
            }
            
            const today = new Date().toISOString().split('T')[0];
            const history = State.data.wordHistory;
            const currentCount = State.runtime.allWords.length;

            if (history.length === 0 || history[history.length - 1].date !== today) {
                history.push({ date: today, count: currentCount });
                if (history.length > 365) history.shift(); 
                State.save('wordHistory', history);
            }
        }
    },

    applyHideCards(hide) {
        const gameCard = DOM.game.card;
        const header = document.querySelector('header');
        const themesPanel = document.querySelector('.mt-6.p-4.bg-white\\/70'); // Themes panel
        const rankingsSection = document.getElementById('rankingsSection'); // Top good/bad words
        
        if (hide) {
            if (gameCard) gameCard.style.opacity = '0';
            if (gameCard) gameCard.style.pointerEvents = 'none';
            if (header) header.style.opacity = '0.3';
            if (themesPanel) themesPanel.style.opacity = '0.3';
            if (rankingsSection) rankingsSection.style.opacity = '0.3';
        } else {
            if (gameCard) gameCard.style.opacity = '1';
            if (gameCard) gameCard.style.pointerEvents = '';
            if (header) header.style.opacity = '1';
            if (themesPanel) themesPanel.style.opacity = '1';
            if (rankingsSection) rankingsSection.style.opacity = '1';
        }
    },

    disableDailyMode() {
        State.runtime.isDailyMode = false;
        DOM.game.dailyBanner.classList.remove('daily-locked-mode');
        DOM.game.buttons.notWord.style.visibility = 'visible';
        DOM.game.buttons.custom.style.visibility = 'visible';
        this.nextWord()
    },

    async finishDailyChallenge() {
        const d = State.data;
        const totalVotesEl = document.getElementById('dailyTotalVotes');
        if (totalVotesEl) totalVotesEl.textContent = d.voteCount.toLocaleString();
        
        // Submit streak to server
        await API.submitUserVotes(
            d.userId, 
            d.username, 
            d.voteCount, 
            d.daily.streak, 
            d.daily.bestStreak
        );
        
        // Update total votes and golden count in modal
        const dailyVotesEl = document.getElementById('dailyTotalVotes');
        if (dailyVotesEl) dailyVotesEl.textContent = d.voteCount.toLocaleString();
        const goldenCountEl = document.getElementById('dailyGoldenCount');
        if (goldenCountEl) goldenCountEl.textContent = '🌟 ' + (d.daily.goldenWordsFound || 0);
        
        const leaderboard = await API.fetchLeaderboard();
        const userRankIndex = leaderboard.findIndex(u => u.userId === d.userId);
        const totalUsers = leaderboard.length;
        
        if (userRankIndex >= 0) {
            const rank = userRankIndex + 1;
            DOM.daily.worldRank.textContent = '#' + rank;
            const ctx = document.getElementById('dailyRankContext');
            if (ctx) {
                if (rank === 1) ctx.textContent = '👑 Top voter!';
                else if (rank <= 3) ctx.textContent = '🏆 Top 3!';
                else ctx.textContent = `of ${totalUsers.toLocaleString()} voters`;
            }
        } else {
            DOM.daily.worldRank.textContent = 'New!';
            const ctx = document.getElementById('dailyRankContext');
            if (ctx) ctx.textContent = 'Keep voting to climb!';
        }
        
        State.runtime.isDailyMode = false;
        State.runtime.dailyChallengeType = null;
        State.runtime.goldenWord = null;
        DOM.game.dailyBanner.classList.remove('daily-locked-mode');
        DOM.game.buttons.notWord.style.visibility = '';
        DOM.game.buttons.custom.style.visibility = '';
        
        this.checkDailyStatus();
        setTimeout(() => ModalManager.toggle('dailyResult', true), 600);
        this.refreshData(true);
    },

    activateDailyMode() {
        if (State.runtime.isDailyMode) return;
        const t = new Date().toISOString().split('T')[0];
        
        if (t === State.data.daily.lastDate) return;
        State.runtime.isDailyMode = true;
        DOM.game.dailyBanner.classList.add('daily-locked-mode');
        DOM.game.buttons.notWord.style.visibility = 'hidden';
        DOM.game.buttons.custom.style.visibility = 'hidden';
        
        // Calculate date seed
        let seed = 0;
        for (let i = 0; i < t.length; i++) {
            seed = ((seed << 5) - seed) + t.charCodeAt(i);
            seed |= 0;
        }
        seed = Math.abs(seed);
        
        // 50% golden, 50% single
        const isGolden = (seed % 2) === 0;
        State.runtime.dailyChallengeType = isGolden ? 'golden' : 'single';
        
        if (isGolden) {
            UIManager.showMessage('🌟 Find the Golden Word!');
            State.runtime.goldenWordFound = false;
            State.runtime.dailyVotesCount = 0;
        } else {
            UIManager.showMessage('Loading Daily Word...');
        }
        
        API.getAllWords().then(words => {
            const sortedWords = words.sort((a, b) => a.text.localeCompare(b.text));
            
            if (isGolden) {
                const goldenIdx = (seed * 7) % sortedWords.length;
                State.runtime.goldenWord = sortedWords[goldenIdx];
                const shuffled = [...words].sort(() => Math.random() - 0.5);
                State.runtime.allWords = shuffled;
                State.runtime.currentWordIndex = 0;
                UIManager.displayWord(shuffled[0]);
                if (DOM.game.dailyStatus) DOM.game.dailyStatus.textContent = "Find 🌟";
            } else {
                const winningWordRef = sortedWords[seed % sortedWords.length];
                if (winningWordRef) {
                    State.runtime.allWords = [winningWordRef];
                    State.runtime.currentWordIndex = 0;
                    UIManager.displayWord(winningWordRef);
                } else {
                    UIManager.showMessage("No Daily Word Found");
                }
            }
        });
    },

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

checkDailyStatus() {
        const t = new Date().toISOString().split('T')[0];
        const l = State.data.daily.lastDate;

        // If Kids Mode OR Challenge Done Today -> HIDE COMPLETELY
        if (State.data.settings.kidsMode || t === l) {
             DOM.game.dailyBanner.style.display = 'none';
        } else {
             // Else -> SHOW
             DOM.game.dailyStatus.textContent = "Vote Now!";
             DOM.game.dailyBanner.style.display = 'block';
             DOM.game.dailyBanner.style.opacity = '1';
             DOM.game.dailyBanner.style.pointerEvents = 'auto';
             DOM.game.dailyBanner.style.filter = 'none';
        }
    },

    setRandomFavicon() {
        const options = ['👍', '👎', '🗳️'];
        const choice = options[Math.floor(Math.random() * options.length)];
        const svg = `<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${choice}</text></svg>`;
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }
        link.href = `data:image/svg+xml,${svg}`;
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

async renderLeaderboardTable() {
        const lbContainer = DOM.general.voteLeaderboardTable;
        if (!lbContainer) return;
        lbContainer.innerHTML = '<div class="text-center text-gray-500 p-4">Loading...</div>';
        const allUsers = await API.fetchLeaderboard();
        
        // GLOBAL LIST
        const topUsers = allUsers.slice(0, 5);
        let html = '<h3 class="text-lg font-bold text-gray-800 mb-3 mt-4">Top Voters (Global)</h3>';
        
        if (topUsers.length === 0) {
            html += '<div class="text-center text-gray-500 text-sm">Unavailable</div>';
        } else {
            topUsers.forEach((user, i) => {
                const isYou = State.data.userId && user.userId === State.data.userId;
                const rowClass = isYou ? 'bg-indigo-100 border-2 border-indigo-400 font-bold text-indigo-700' : 'bg-white border border-gray-200 text-gray-800';
                html += `<div class="flex justify-between items-center py-2 px-3 rounded ${rowClass} text-sm mb-1"><span class="w-6 text-center">#${i + 1}</span><span class="truncate flex-1">${user.username || 'Anonymous'}</span><span class="text-right">${(user.voteCount || 0).toLocaleString()}</span></div>`;
            });
        }

        // --- CHANGE: ADDED ID HERE ---
        html += '<h3 id="dailyStreaksHeader" class="text-lg font-bold text-gray-800 mb-3 mt-6 pt-2 border-t border-gray-100">🔥 Top Daily Streaks</h3>';
        // -----------------------------

        // STREAK LIST
        const streakUsers = allUsers.filter(u => u.dailyStreak > 0).sort((a, b) => b.dailyStreak - a.dailyStreak).slice(0, 5);
        if (streakUsers.length > 0) {
            streakUsers.forEach((user, i) => {
                const isYou = State.data.userId && user.userId === State.data.userId;
                const rowClass = isYou ? 'bg-orange-100 border-2 border-orange-400 font-bold text-orange-700' : 'bg-white border border-gray-200 text-gray-800';
                html += `<div class="flex justify-between items-center py-2 px-3 rounded ${rowClass} text-sm mb-1"><span class="w-6 text-center">#${i + 1}</span><span class="truncate flex-1">${user.username || 'Anonymous'}</span><span class="text-right">🔥 ${user.dailyStreak}</span></div>`;
            });
        } else {
            html += `<div class="text-center text-gray-400 text-xs my-2">No streaks yet!</div>`;
        }
        
        lbContainer.innerHTML = html;
    },

    async renderGraphs() {
        const w = State.runtime.allWords;
        if (!w || w.length === 0) return;
        const drawText = (ctx, text, x, y, color = "#666", size = 12) => {
            ctx.fillStyle = color;
            ctx.font = `${size}px sans-serif`;
            ctx.textAlign = "center";
            ctx.fillText(text, x, y);
        };

        // Fetch global stats history for both charts
        let globalHistory = [];
        try {
            globalHistory = await API.fetchGlobalStatsHistory();
        } catch (e) {
            console.warn("Could not fetch global stats history:", e);
        }

        // Also submit current snapshot to server
        const totalGood = w.reduce((a, b) => a + (b.goodVotes || 0), 0);
        const totalBad = w.reduce((a, b) => a + (b.badVotes || 0), 0);
        const totalVotes = totalGood + totalBad;
        API.submitGlobalSnapshot(w.length, totalVotes, totalGood, totalBad);

        const cvsScatter = document.getElementById('scatterChartCanvas');
        if (cvsScatter) {
            const ctx = cvsScatter.getContext('2d');
            const W = cvsScatter.width;
            const H = cvsScatter.height;
            const P = 40; 
            ctx.clearRect(0, 0, W, H);
            let maxGood = 0, maxBad = 0;
            w.forEach(word => {
                if ((word.goodVotes || 0) > maxGood) maxGood = word.goodVotes || 0;
                if ((word.badVotes || 0) > maxBad) maxBad = word.badVotes || 0;
            });
            maxGood = Math.max(5, maxGood * 1.1);
            maxBad = Math.max(5, maxBad * 1.1);
            ctx.beginPath();
            ctx.strokeStyle = "#e5e7eb";
            ctx.lineWidth = 1;
            for(let i=1; i<=4; i++) {
                const y = H - P - (i/5)*(H - 2*P);
                const x = P + (i/5)*(W - 2*P);
                ctx.moveTo(P, y); ctx.lineTo(W-P, y); 
                ctx.moveTo(x, P); ctx.lineTo(x, H-P); 
            }
            ctx.stroke();
            ctx.beginPath();
            ctx.strokeStyle = "#9ca3af";
            ctx.lineWidth = 2;
            ctx.moveTo(P, P); ctx.lineTo(P, H - P); 
            ctx.lineTo(W - P, H - P); 
            ctx.stroke();
            drawText(ctx, "Bad Votes →", W / 2, H - 10, "#4b5563", 12);
            ctx.save();
            ctx.translate(15, H / 2);
            ctx.rotate(-Math.PI / 2);
            drawText(ctx, "Good Votes →", 0, 0, "#4b5563", 12);
            ctx.restore();
            drawText(ctx, "😇 LOVED", P + 40, P + 20, "rgba(34, 197, 94, 0.3)", 10);
            drawText(ctx, "👿 HATED", W - P - 40, H - P - 20, "rgba(239, 68, 68, 0.3)", 10);
            drawText(ctx, "⚔️ CONTROVERSIAL", W - P - 60, P + 20, "rgba(107, 114, 128, 0.3)", 10);
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
        
        // VOTE HISTORY CHART - Total votes over time (from global stats)
        const cvsVoteHistory = document.getElementById('voteHistoryCanvas');
        if (cvsVoteHistory) {
            const ctx = cvsVoteHistory.getContext('2d');
            const W = cvsVoteHistory.width;
            const H = cvsVoteHistory.height;
            const P = 50; 
            const GRAPH_H = H - 2 * P;
            const Y_PLOT_MAX = P;      
            const Y_PLOT_MIN = H - P;  
            ctx.clearRect(0, 0, W, H);
            
            // Use global history or fall back to computed value
            let voteHistory = globalHistory.filter(h => h.totalVotes > 0);
            if (voteHistory.length === 0) {
                const today = new Date().toISOString().split('T')[0];
                voteHistory = [{ date: today, totalVotes: totalVotes }];
            }
            
            // Format and display tracking start date
            const formatTrackingDate = (dateStr) => {
                const date = new Date(dateStr + 'T00:00:00');
                const now = new Date();
                const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const month = monthNames[date.getMonth()];
                const day = date.getDate();
                const year = date.getFullYear();
                if (diffDays === 0) return '(Tracking started today)';
                if (diffDays === 1) return '(Tracking since yesterday)';
                if (diffDays < 7) return `(Tracking for ${diffDays} days)`;
                if (diffDays < 30) return `(Since ${month} ${day})`;
                return `(Since ${month} ${day}, ${year})`;
            };
            
            const startDate = voteHistory[0]?.date;
            const voteTrackingEl = document.getElementById('voteTrackingStart');
            if (voteTrackingEl && startDate) {
                voteTrackingEl.textContent = formatTrackingDate(startDate);
            }
            
            const maxVotes = Math.max(...voteHistory.map(h => h.totalVotes || 0), 1000);
            const Y_MIN_VALUE = 0;
            const Y_MAX_VALUE = Math.ceil(maxVotes / 10000) * 10000 || 100000;
            const VALUE_RANGE = Y_MAX_VALUE - Y_MIN_VALUE;
            
            // Axes
            ctx.beginPath();
            ctx.strokeStyle = "#ccc";
            ctx.lineWidth = 1;
            ctx.moveTo(P, Y_PLOT_MAX); ctx.lineTo(P, Y_PLOT_MIN); ctx.lineTo(W - P, Y_PLOT_MIN);
            ctx.stroke();
            
            const getYVotes = (count) => {
                if (count <= Y_MIN_VALUE) return Y_PLOT_MIN; 
                const plotRatio = count / VALUE_RANGE;
                return Y_PLOT_MIN - plotRatio * GRAPH_H;
            };
            
            // Y-axis labels
            ctx.textAlign = "right";
            for (let i = 0; i <= 4; i++) {
                const val = Math.round(Y_MAX_VALUE * i / 4);
                const y = getYVotes(val);
                ctx.strokeStyle = "#e5e7eb";
                ctx.beginPath();
                ctx.moveTo(P, y); ctx.lineTo(W - P, y);
                ctx.stroke();
                drawText(ctx, val.toLocaleString(), P - 5, y + 5, "#666", 9);
            }
            
            // Draw line
            if (voteHistory.length > 0) {
                const xDivisor = voteHistory.length > 1 ? voteHistory.length - 1 : 1;
                ctx.beginPath();
                ctx.strokeStyle = "#10b981"; // Green for votes
                ctx.lineWidth = 3;
                voteHistory.forEach((h, i) => {
                    const x = P + (i / xDivisor) * (W - 2 * P);
                    const y = getYVotes(h.totalVotes || 0);
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                });
                ctx.stroke();
                
                // Draw points
                voteHistory.forEach((h, i) => {
                    const x = P + (i / xDivisor) * (W - 2 * P);
                    const y = getYVotes(h.totalVotes || 0);
                    ctx.beginPath();
                    ctx.fillStyle = "#10b981";
                    ctx.arc(x, y, 4, 0, Math.PI * 2);
                    ctx.fill();
                    if (i === voteHistory.length - 1) {
                         ctx.beginPath();
                         ctx.strokeStyle = "#ffffff";
                         ctx.lineWidth = 2;
                         ctx.arc(x, y, 6, 0, Math.PI * 2);
                         ctx.stroke();
                    }
                });
            }
            
            // X-axis date labels (start and end)
            if (voteHistory.length > 0) {
                const formatShortDate = (dateStr) => {
                    const d = new Date(dateStr + 'T00:00:00');
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    return `${monthNames[d.getMonth()]} ${d.getDate()}`;
                };
                ctx.textAlign = "left";
                drawText(ctx, formatShortDate(voteHistory[0].date), P, H - P + 15, "#999", 9);
                if (voteHistory.length > 1) {
                    ctx.textAlign = "right";
                    drawText(ctx, formatShortDate(voteHistory[voteHistory.length - 1].date), W - P, H - P + 15, "#999", 9);
                }
            }
            
            ctx.textAlign = "center";
            drawText(ctx, "Time →", W / 2, H - 5, "#999", 10);
            ctx.save();
            ctx.translate(12, H / 2);
            ctx.rotate(-Math.PI / 2);
            drawText(ctx, "Total Votes →", 0, 0, "#999", 10);
            ctx.restore();
        }

        // DICTIONARY LINE CHART - Uses global history for all users
        const cvsLine = document.getElementById('lineChartCanvas');
        if (cvsLine) {
            const ctx = cvsLine.getContext('2d');
            const W = cvsLine.width;
            const H = cvsLine.height;
            const P = 40; 
            const GRAPH_H = H - 2 * P;
            const Y_PLOT_MAX = P;      
            const Y_PLOT_MIN = H - P;  
            ctx.clearRect(0, 0, W, H);
            
            // Use global history if available, otherwise fall back to local
            let history = globalHistory.filter(h => h.totalWords > 0);
            if (history.length === 0) {
                history = State.data.wordHistory || [];
            }
            if (history.length === 0) {
                const today = new Date().toISOString().split('T')[0];
                history = [{ date: today, totalWords: w.length, count: w.length }];
            }
            // Normalize to have count property
            history = history.map(h => ({ ...h, count: h.totalWords || h.count || 0 }));
            
            // Display tracking start date for dictionary chart
            const formatTrackingDate = (dateStr) => {
                const date = new Date(dateStr + 'T00:00:00');
                const now = new Date();
                const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const month = monthNames[date.getMonth()];
                const day = date.getDate();
                const year = date.getFullYear();
                if (diffDays === 0) return '(Tracking started today)';
                if (diffDays === 1) return '(Tracking since yesterday)';
                if (diffDays < 7) return `(Tracking for ${diffDays} days)`;
                if (diffDays < 30) return `(Since ${month} ${day})`;
                return `(Since ${month} ${day}, ${year})`;
            };
            
            const dictStartDate = history[0]?.date;
            const dictTrackingEl = document.getElementById('dictTrackingStart');
            if (dictTrackingEl && dictStartDate) {
                dictTrackingEl.textContent = formatTrackingDate(dictStartDate);
            }
            
            const currentMaxData = Math.max(...history.map(h => h.count), w.length);
            const Y_MIN_VALUE = 3000;
            const SOFT_MAX = 6000;
            let Y_MAX_VALUE = SOFT_MAX;
            if (currentMaxData > SOFT_MAX) {
                const magnitude = Math.pow(10, Math.floor(Math.log10(currentMaxData || 10)));
                let step = magnitude >= 1000 ? 1000 : 500;
                Y_MAX_VALUE = Math.ceil(currentMaxData / step) * step;
            }
            const VALUE_RANGE = Y_MAX_VALUE - Y_MIN_VALUE;
            ctx.beginPath();
            ctx.strokeStyle = "#ccc";
            ctx.lineWidth = 1;
            ctx.moveTo(P, Y_PLOT_MAX); ctx.lineTo(P, Y_PLOT_MIN); ctx.lineTo(W - P, Y_PLOT_MIN);
            ctx.stroke();
            const getY = (count) => {
                if (count <= Y_MIN_VALUE) return Y_PLOT_MIN; 
                const valueAboveMin = count - Y_MIN_VALUE;
                const plotRatio = valueAboveMin / VALUE_RANGE;
                return Y_PLOT_MIN - plotRatio * GRAPH_H;
            };
            ctx.textAlign = "right";
            drawText(ctx, Y_MAX_VALUE.toLocaleString(), P - 5, P + 5, "#666", 10);
            const markers = [Y_MIN_VALUE, SOFT_MAX];
            if (Y_MAX_VALUE !== SOFT_MAX) {
                const step = Y_MAX_VALUE / 4; 
                for (let i = 1; i <= 3; i++) markers.push(Math.round(i * step / 100) * 100);
            }
            [...new Set(markers)].sort((a,b)=>a-b).forEach(mark => {
                if (mark >= Y_MIN_VALUE && mark <= Y_MAX_VALUE) {
                    const y = getY(mark);
                    ctx.strokeStyle = "#e5e7eb";
                    ctx.beginPath();
                    ctx.moveTo(P, y); ctx.lineTo(W - P, y);
                    ctx.stroke();
                    drawText(ctx, mark.toLocaleString(), P - 5, y + 5, "#666", 10);
                }
            });
            drawText(ctx, Y_MIN_VALUE.toLocaleString(), P - 5, Y_PLOT_MIN + 5, "#666", 10); 
            if (history.length > 0) {
                const xDivisor = history.length > 1 ? history.length - 1 : 1;
                ctx.beginPath();
                ctx.strokeStyle = "#4f46e5";
                ctx.lineWidth = 3;
                history.forEach((h, i) => {
                    const x = P + (i / xDivisor) * (W - 2 * P);
                    const y = getY(h.count);
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                });
                ctx.stroke();
                history.forEach((h, i) => {
                    const x = P + (i / xDivisor) * (W - 2 * P);
                    const y = getY(h.count);
                    ctx.beginPath();
                    ctx.fillStyle = "#4f46e5";
                    ctx.arc(x, y, 4, 0, Math.PI * 2);
                    ctx.fill();
                    if (i === history.length - 1) {
                         ctx.beginPath();
                         ctx.strokeStyle = "#ffffff";
                         ctx.lineWidth = 2;
                         ctx.arc(x, y, 6, 0, Math.PI * 2);
                         ctx.stroke();
                    }
                });
            }
            
            // X-axis date labels (start and end)
            if (history.length > 0 && history[0].date) {
                const formatShortDate = (dateStr) => {
                    const d = new Date(dateStr + 'T00:00:00');
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    return `${monthNames[d.getMonth()]} ${d.getDate()}`;
                };
                ctx.textAlign = "left";
                drawText(ctx, formatShortDate(history[0].date), P, H - P + 15, "#999", 9);
                if (history.length > 1 && history[history.length - 1].date) {
                    ctx.textAlign = "right";
                    drawText(ctx, formatShortDate(history[history.length - 1].date), W - P, H - P + 15, "#999", 9);
                }
            }
            
            ctx.textAlign = "center";
            drawText(ctx, "Time →", W / 2, H - 5, "#999", 10);
            ctx.save();
            ctx.translate(12, H / 2);
            ctx.rotate(-Math.PI / 2);
            drawText(ctx, "Total Words →", 0, 0, "#999", 10);
            ctx.restore();
        }
        const cvsPie = document.getElementById('pieChartCanvas');
        if (cvsPie) {
            const ctx = cvsPie.getContext('2d');
            const W = cvsPie.width;
            const H = cvsPie.height;
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
                const centerX = 150;
                const centerY = H / 2;
                const radius = 70;
                data.forEach(slice => {
                    if (slice.val === 0) return;
                    const sliceAngle = (slice.val / totalRated) * 2 * Math.PI;
                    ctx.beginPath();
                    ctx.moveTo(centerX, centerY);
                    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
                    ctx.fillStyle = slice.color;
                    ctx.fill();
                    startAngle += sliceAngle;
                });
                let legY = 60;
                data.forEach(slice => {
                    ctx.fillStyle = slice.color;
                    ctx.fillRect(260, legY, 15, 15);
                    ctx.fillStyle = "#374151";
                    ctx.textAlign = "left";
                    ctx.font = "bold 12px sans-serif";
                    const pct = Math.round((slice.val / totalRated) * 100);
                    ctx.fillText(`${slice.label}: ${slice.val} (${pct}%)`, 285, legY + 12);
                    legY += 30;
                });
            }
        }
    }
};
	
const StreakManager = {
    timer: null,
    loopTimer: null, 
    LIMIT: 6500, 
	
    extend(ms) {
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => this.endStreak(), this.LIMIT + ms);
    },

    handleSuccess() {
        if (State.data.settings.noStreaksMode) return; 

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
		const current = State.runtime.streak;
        if (current > (parseInt(State.data.longestStreak) || 0)) {
            State.data.longestStreak = current;
            State.save('longestStreak', current);
        }
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
            } catch(e) { }
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

        const html = `
            <div id="highScoreModal" class="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4 backdrop-blur-md" onclick="StreakManager.closeLeaderboard()">
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
            <div class="flex justify-between items-center crt-text text-sm py-2 crt-row">
                <div class="flex gap-3 items-center">
                    <span class="text-gray-500">#${(i+1).toString().padStart(2,'0')}</span>
                    <span class="${color} font-black text-lg drop-shadow-[0_0_3px_rgba(255,255,255,0.5)]">${s.name.substring(0,3).toUpperCase()}</span>
                </div>
                <span class="text-white tracking-widest text-xl font-bold">${s.score.toString().padStart(4,'0')}</span>
            </div>`;

        const area = document.getElementById('hs-display-area');
        const indicator = document.getElementById('hs-page-indicator');
        
        let showingGlobal = true;
        let touchStartX = 0;
        let touchEndX = 0;

        const renderPage = () => {
            if(!document.getElementById('highScoreModal')) return;

            area.style.opacity = '0';
            setTimeout(() => {
                if (showingGlobal) {
                    indicator.textContent = "PAGE 1/2 [WORLD]";
                    indicator.style.color = '#34d399'; 
                    let h = `<div class="text-cyan-400 text-sm crt-text mb-4 border-b-2 border-cyan-700 pb-1 font-black">GLOBAL RANKINGS</div>`;
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
            }, 200);
        };
        
        const switchPage = () => {
            showingGlobal = !showingGlobal;
            renderPage();
            // Reset auto-switch timer
            if (this.loopTimer) clearTimeout(this.loopTimer);
            this.loopTimer = setTimeout(autoSwitch, 5000);
        };
        
        const autoSwitch = () => {
            if(!document.getElementById('highScoreModal')) return;
            showingGlobal = !showingGlobal;
            renderPage();
            this.loopTimer = setTimeout(autoSwitch, 5000);
        };
        
        // Swipe support
        area.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        area.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) { // Minimum swipe distance
                switchPage();
            }
        }, { passive: true });
        
        // Click to switch page
        area.style.cursor = 'pointer';
        area.onclick = switchPage;
        
        renderPage();
        this.loopTimer = setTimeout(autoSwitch, 5000);
    },
    
    closeLeaderboard() {
        const el = document.getElementById('highScoreModal');
        if(el) el.remove();
        if (this.loopTimer) clearTimeout(this.loopTimer);
    }
};

    window.onload = Game.init.bind(Game);
    window.RoomManager = RoomManager;
    window.UIManager = UIManager;
	window.WeatherManager = WeatherManager;
	window.LocalPeerManager = LocalPeerManager;

    console.log("%c Good Word / Bad Word ", "background: #4f46e5; color: #bada55; padding: 4px; border-radius: 4px;");
    console.log("Play fair! ️😇");

	
})();
