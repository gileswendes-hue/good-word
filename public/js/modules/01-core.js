/**
 * ============================================================================
 * GOOD WORD / BAD WORD - CORE MODULE (01-core.js)
 * ============================================================================
 * 
 * Foundation module containing:
 * - CONFIG: All constants and settings
 * - ContentFilter: Profanity detection
 * - DOM: Element references (loadDOM function)
 * - State: Application state and localStorage
 * - DataManager: Import/export functionality
 * - OfflineManager: Offline mode handling
 * - Accessibility: Colorblind mode, large text
 * - Utils: Helper functions
 * - Haptics: Vibration feedback
 * 
 * This module must load FIRST - all other modules depend on it.
 * ============================================================================
 */

(function() {
'use strict';

// ============================================================================
// CONFIG - Global Constants
// ============================================================================
const CONFIG = {
    API_BASE_URL: '/api/words',           // Base for voting
    API_FETCH_URL: '/api/words/all',      // For fetching all words
    SCORE_API_URL: '/api/scores',
    APP_VERSION: '6.6.10',
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
        MASH_LIMIT: 12,           
        COOLDOWN_TIERS: [5, 10, 20],  
        STREAK_WINDOW: 1400,      
        SWIPE_THRESHOLD: 100
    },
    THEME_SECRETS: {
        rainbow: 'UkFJTkJPV3xHQVl8U1BBUktMRXxDT0xPVVJ8UFJJREV8VU5JQ09STnxQUk9VRHxRVUVFUnxHTElUVEVSfExFU0JJQU58VElOU0VM',
        dark: 'TUlETklHSFR8QkxBQ0t8U0hBREV8R09USHxTSEFET1d8TklOSkF8REFSS3xOSUdIVHxTVEVBTFRI',
        banana: 'QkFOQU5BfEJBTkFOQVN8UExBTlRBSU58WUVMTE9XfFNQTElUfE1vbktFWXxIQU1NT0NL',
        winter: 'U05PV01BTnxTTk9XfElDRXxXSU5URVJ8RlJPWkVOfENISUxMfENPTER8RkxBS0V8QkxJWlpBUkR8SUNJQ0xFfFNMRUlHSHxTTk9XQkFMTHxTQ0FSRnxKQUNLRVR8U0xFREdFfE5PVkVNQkVSfERFQ0VNQkVSfEpBTlVBUll8SklOR0xF',
        summer: 'U1VNTUVSfEJFQUNIfEhPTElEQVl8U1VOfFZBQ0FUSU9OfFNXSU18U0FORHxQT09MfEpVTFl8QVVHVVNUW0pVTkU=',
        halloween: 'SEFMTE9XRUVOfEdIT1NUfFBVTVBLSU58U1BJREVSfFNXRUVUU3xDT1NUVU1FfFNQT09LWXxPQ1RPQkVSfFdJVENIfFZBTVBJUkV8Wk9NQklFfEJBVHxNT05TVEVS',
        submarine: 'U1VCTUFSSU5FfFdBVEVSfEJSSVhIQU18UElSQVRFfEFRVUFUSUN8QVFVQXxERUVQfE9DVE9QVVN8UlVNfFBFUklTQ09QRQ==',
        fire: 'RklSRXxCVVJOfEhFTEx8SU5GRVJOT3xGTEFNRXxDT0FMU3xDUkFDS0xFfFRPQVNUfEhFQVR8QkxBWkU=',
        plymouth: 'UExZTU9VVEh8REVWT058SkFOTkVSU3xHSU4=',
        ballpit: 'QkFMTHxQSVR8UExBWXxKVU1QfEJPVU5DRXxCQUxMUElUfEJBTExS',
        space: 'U1BBQ0V8R0FMQVhZfFBMQU5FVHxTVEFSfE9SQklU',
        woodland: 'V09PRExBTkR8Rk9SRVNUfFRSRUVTfEZPWEVTfEJBREdFUnxERUVSfFJBQkJJVHxBQ09STnxNVVNIUk9PTXxGRVJOfFVOREVSR1JPV1RIfENBTk9QWXxUSElDS0VUfEdMQURF',
        flight: 'RkxJR0hUfEFJUlBMQU5FfFBJTE9UfEFJUlBPUlR8Qk9FSU5HfEpFVHxGTFl8Q09DS1BJVHxBSVJCVVM=',
        ocean: 'T0NFQU58U0VBU0lERXxCT0FUfFNBSUx8TkFWWXxZQUNIVHxGSVNIfFdIQUxFfERPTFBISU58SE9SSVpPTg=='
    },
};

const P2P_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#eab308', '#8b5cf6', '#ec4899'];

// ============================================================================
// CONTENT FILTER - Profanity Detection
// ============================================================================
const ContentFilter = {
    _encoded: 'bmlnZ2VyfG5pZ2dhfGZhZ2dvdHxkeWtlfHRyYW5ueXxjaGlua3xnb29rfHNwaWN8a2lrZXx3ZXRiYWNrfGJlYW5lcnxjb29ufHJhZ2hlYWR8dG93ZWxoZWFkfGNhbWVsam9ja2V5fHBha2l8d29wfGphcHxob25reXxuZWdyb3xoYWxmYnJlZWR8c2hlbWFsZXxoZXNoZXxwZWRvfHBhZWRvfHBlZG9waGlsZXxuYXppfG5hemlzfGhpdGxlcg==',
    _patterns: null,
    
    init() {
        try {
            const decoded = atob(this._encoded);
            const terms = decoded.split('|');
            this._patterns = terms.map(term => {
                let escaped = '';
                for (const c of term) {
                    switch(c) {
                        case 'a': escaped += '[a@4]'; break;
                        case 'e': escaped += '[e3]'; break;
                        case 'i': escaped += '[i1!]'; break;
                        case 'o': escaped += '[o0]'; break;
                        case 's': escaped += '[s$5]'; break;
                        case 'g': escaped += '[gq9]'; break;
                        default: escaped += c;
                    }
                }
                return new RegExp(`^${escaped}[s$5]?$`, 'i');
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
    
    getOffensiveTerms() {
        try {
            return atob(this._encoded).split('|');
        } catch(e) {
            return [];
        }
    }
};

ContentFilter.init();

// ============================================================================
// DOM - Element References
// ============================================================================
let DOM = {};

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
        historyList: document.getElementById('history-list')
    },
    screens: {
        loading: document.getElementById('loading-screen'),
        start: document.getElementById('start-screen'),
        game: document.getElementById('game-screen')
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
        chooserBtn: null,
        effects: {
            snow: document.getElementById('snow-effect'),
            bubble: document.getElementById('bubble-effect'),
            fire: document.getElementById('fire-effect'),
            summer: document.getElementById('summer-effect'),
            plymouth: document.getElementById('plymouth-effect'),
            ballpit: document.getElementById('ballpit-effect'),
            space: document.getElementById('space-effect'),
            woodland: document.getElementById('woodland-effect'),
            flight: document.getElementById('flight-effect'),
            ocean: document.getElementById('ocean-effect')
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

// ============================================================================
// STATE - Application State Management
// ============================================================================
const safeParse = (key, fallback) => {
    try {
        const item = localStorage.getItem(key);
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
        wordWarScores: safeParse('wordWarScores', []),
        defDashScores: safeParse('defDashScores', []),
        wordJumpScores: safeParse('wordJumpScores', []),
        pendingMiniGameScores: safeParse('pendingMiniGameScores', []),
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
        fullWordList: [],
        history: [],
        currentWordIndex: 0,
        streak: 0,
        mashCount: 0,
        lastVoteTime: 0,
        lastStreakTime: 0,
        isCoolingDown: false,
        cooldownTimer: null,
        mashLevel: 0,
        isDailyMode: false,
        lastVoteType: null,
        sameVoteStreak: 0,
        buttonPresses: [],
    },
    
    init() {
        // Initialization hook for modules
    },
    
    save(k, v) {
        this.data[k] = v;
        const s = localStorage;
        if (['pendingVotes','offlineCache','highScores','wordWarScores','defDashScores','wordJumpScores','pendingMiniGameScores','unlockedThemes','seenHistory','settings'].includes(k)) {
            s.setItem(k, JSON.stringify(v));
        }
        if (k === 'pendingVotes') s.setItem('pendingVotes', JSON.stringify(v));
        else if (k === 'offlineCache') s.setItem('offlineCache', JSON.stringify(v));
        else if (k === 'highScores') s.setItem('highScores', JSON.stringify(v));
        else if (k === 'wordWarScores') s.setItem('wordWarScores', JSON.stringify(v));
        else if (k === 'defDashScores') s.setItem('defDashScores', JSON.stringify(v));
        else if (k === 'wordJumpScores') s.setItem('wordJumpScores', JSON.stringify(v));
        else if (k === 'pendingMiniGameScores') s.setItem('pendingMiniGameScores', JSON.stringify(v));
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
        else if (window.UIManager) UIManager.showPostVoteMessage(`Unlocked ${cleanName} badge!`);
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

// ============================================================================
// DATA MANAGER - Import/Export
// ============================================================================
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
        if (window.UIManager) UIManager.showPostVoteMessage("Backup saved! 💾");
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

// ============================================================================
// OFFLINE MANAGER
// ============================================================================
const OfflineManager = {
    isActive() {
        return State.data.settings.offlineMode;
    },
    
    async fillCache() {
        try {
            if (window.UIManager) UIManager.showMessage("Downloading words... 📥");
            const res = await fetch('/api/words/all');
            if (!res.ok) throw new Error('Network error');
            const data = await res.json();
            if (!data || data.length === 0) {
                throw new Error('No words received');
            }
            State.data.offlineCache = data.map(w => ({
                _id: w._id,
                text: w.text,
                goodVotes: w.goodVotes || 0,
                badVotes: w.badVotes || 0,
                notWordVotes: w.notWordVotes || 0
            }));
            State.save('offlineCache', State.data.offlineCache);
            if (!State.data.voteQueue) {
                State.data.voteQueue = [];
                State.save('voteQueue', []);
            }
            if (window.UIManager) UIManager.showMessage(`Cached ${data.length} words! 📴`);
            return true;
        } catch (e) {
            console.warn("Offline download failed", e);
            return State.data.offlineCache && State.data.offlineCache.length > 0;
        }
    },
    
    queueVote(wordId, voteType) {
        if (!State.data.voteQueue) State.data.voteQueue = [];
        State.data.voteQueue.push({
            id: wordId,
            type: voteType,
            timestamp: Date.now()
        });
        State.save('voteQueue', State.data.voteQueue);
        const word = State.data.offlineCache?.find(w => w._id === wordId);
        if (word) {
            if (voteType === 'good') word.goodVotes = (word.goodVotes || 0) + 1;
            else if (voteType === 'bad') word.badVotes = (word.badVotes || 0) + 1;
            State.save('offlineCache', State.data.offlineCache);
        }
        if (window.UIManager) UIManager.updateOfflineIndicator();
    },
    
    async sync() {
        const queue = State.data.voteQueue || [];
        if (queue.length === 0) {
            if (window.UIManager) UIManager.showMessage("No votes to sync ✓");
            return;
        }
        if (window.UIManager) UIManager.showMessage(`Syncing ${queue.length} votes... 📡`);
        let synced = 0;
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
        if (window.UIManager) UIManager.showMessage(`Synced ${synced} votes! ✓`);
    },
    
    async toggle(active) {
        if (active) {
            const success = await this.fillCache();
            if (success) {
                State.data.settings.offlineMode = true;
                State.save('settings', State.data.settings);
                State.runtime.allWords = State.data.offlineCache
                    .filter(w => (w.notWordVotes || 0) < 20);
                State.runtime.fullWordList = State.runtime.allWords;
                for (let i = State.runtime.allWords.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [State.runtime.allWords[i], State.runtime.allWords[j]] = [State.runtime.allWords[j], State.runtime.allWords[i]];
                }
                State.runtime.currentWordIndex = 0;
                if (window.UIManager) {
                    UIManager.updateStats();
                    UIManager.updateOfflineIndicator();
                    UIManager.showPostVoteMessage(`Offline: ${State.runtime.allWords.length} words ready! 📴`);
                }
                if (window.Game) Game.nextWord();
            } else {
                alert("Could not download words. Check connection.");
            }
        } else {
            await this.sync();
            State.data.settings.offlineMode = false;
            State.save('settings', State.data.settings);
            if (window.UIManager) UIManager.updateOfflineIndicator();
            if (window.Game) await Game.refreshData();
        }
    }
};

// Sync pending mini-game scores when coming back online
window.addEventListener('online', () => {
    console.log('Back online - syncing pending mini-game scores...');
    setTimeout(() => {
        if (window.API) API.syncPendingMiniGameScores();
    }, 1000);
});

if (!localStorage.getItem('userId')) localStorage.setItem('userId', State.data.userId);

// ============================================================================
// ACCESSIBILITY
// ============================================================================
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
            if (currentWord && window.UIManager) UIManager.fitText(currentWord.text);
        }
    },
    
    getColors() {
        const cb = State.data.settings.colorblindMode;
        return {
            good: cb ? '#3b82f6' : '#10b981',
            bad: cb ? '#f97316' : '#ef4444'
        };
    }
};

// ============================================================================
// UTILS
// ============================================================================
const Utils = {
    hexToRgba(hex, alpha) {
        let r = 0, g = 0, b = 0;
        if (hex.length === 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length === 7) {
            r = parseInt(hex.substring(1, 3), 16);
            g = parseInt(hex.substring(3, 5), 16);
            b = parseInt(hex.substring(5, 7), 16);
        }
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },
    
    shuffle(array) {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    },
    
    debounce(fn, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn.apply(this, args), delay);
        };
    },
    
    formatNumber(n) {
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
        return n.toString();
    }
};

// ============================================================================
// HAPTICS
// ============================================================================
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

// ============================================================================
// EXPORTS
// ============================================================================
window.CONFIG = CONFIG;
window.P2P_COLORS = P2P_COLORS;
window.ContentFilter = ContentFilter;
window.DOM = DOM;
window.loadDOM = loadDOM;
window.State = State;
window.DataManager = DataManager;
window.OfflineManager = OfflineManager;
window.Accessibility = Accessibility;
window.Utils = Utils;
window.Haptics = Haptics;
window.DEFAULT_SETTINGS = DEFAULT_SETTINGS;

console.log('%c[Core] Module loaded', 'color: #3b82f6; font-weight: bold');

})();
