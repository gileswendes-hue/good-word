/**
 * ============================================================================
 * GOOD WORD / BAD WORD - CORE MODULE
 * ============================================================================
 * Version: 6.6.10
 * 
 * This module contains the foundational code required by all other modules:
 * - CONFIG: Global configuration and constants
 * - ContentFilter: Profanity detection system
 * - DOM: Cached DOM element references
 * - State: Application state management and localStorage persistence
 * - DataManager: Import/export backup functionality
 * - OfflineManager: Service worker and offline vote queue
 * - Accessibility: Screen reader and accessibility helpers
 * - Utils: Common utility functions
 * - Haptics: Vibration feedback for mobile
 * - API: Backend communication layer
 * 
 * Dependencies: None (this is the base module)
 * Loaded: Immediately on page load
 * ============================================================================
 */

(function() {
'use strict';

// ============================================================================
// CONFIG - Global Constants and Settings
// ============================================================================
/**
 * Central configuration object containing all magic numbers, API endpoints,
 * theme secrets (base64 encoded trigger words), and game parameters.
 */
const CONFIG = {
    API_BASE_URL: '/api/words',
    SCORE_API_URL: '/api/scores',
    APP_VERSION: '6.6.10',
    KIDS_LIST_FILE: 'kids_words.txt',
    
    // Easter egg words with their appearance probability and effects
    SPECIAL: {
        CAKE: { text: 'CAKE', prob: 0.005, fade: 300, msg: "The cake is a lie!", dur: 3000 },
        LLAMA: { text: 'LLAMA', prob: 0.005, fade: 8000, msg: "what llama?", dur: 3000 },
        POTATO: { text: 'POTATO', prob: 0.005, fade: 300, msg: "Spudulica!", dur: 3000 },
        SQUIRREL: { text: 'SQUIRREL', prob: 0.005, fade: 300, msg: "🌰", dur: 3000 },
        MASON: { text: 'MASON', prob: 0.005, fade: 300, msg: "🦴", dur: 3000 }
    },
    
    // Contribution and gameplay thresholds
    CONTRIBUTION_THRESHOLD: 5,
    BOOST_FACTOR: 2,
    TIP_COOLDOWN: 4,
    HISTORY_SIZE: 500,
    
    // Vote anti-cheat settings
    VOTE: {
        MASH_LIMIT: 12,           // Max rapid votes before cooldown
        COOLDOWN_TIERS: [5, 10, 20],  // Escalating cooldown seconds
        STREAK_WINDOW: 1400,      // ms window for streak detection
        SWIPE_THRESHOLD: 100      // px for swipe gesture detection
    },
    
    // Theme unlock trigger words (base64 encoded for obfuscation)
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

// Multiplayer peer colors
const P2P_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#eab308', '#8b5cf6', '#ec4899'];


// ============================================================================
// CONTENT FILTER - Profanity Detection
// ============================================================================
/**
 * Detects offensive slurs using pattern matching with common letter substitutions.
 * Terms are base64 encoded to avoid triggering content scanners.
 * Handles l33tspeak variations (@ for a, 3 for e, etc.)
 */
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
        try { return atob(this._encoded).split('|'); }
        catch(e) { return []; }
    }
};
ContentFilter.init();


// ============================================================================
// DOM - Cached Element References
// ============================================================================
/**
 * Lazy-loaded DOM element cache. Called once after DOMContentLoaded.
 * Organized by functional area (header, game, modals, etc.)
 */
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
// UTILITY FUNCTIONS
// ============================================================================
/**
 * Safe JSON parser with fallback for corrupted localStorage data
 */
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

/**
 * Default user settings - merged with saved settings on load
 */
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


// ============================================================================
// STATE - Application State Management
// ============================================================================
/**
 * Central state store with localStorage persistence.
 * - data: Persisted state (votes, badges, settings, etc.)
 * - runtime: Session-only state (current word, streak, etc.)
 */
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
    
    // Session-only runtime state (not persisted)
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
    
    init() {},
    
    /**
     * Save a specific key to localStorage with appropriate serialization
     */
    save(k, v) {
        this.data[k] = v;
        const s = localStorage;
        
        // Handle complex objects that need JSON serialization
        if (['pendingVotes','offlineCache','highScores','wordWarScores','defDashScores','wordJumpScores','pendingMiniGameScores','unlockedThemes','seenHistory','settings'].includes(k)) {
            s.setItem(k, JSON.stringify(v));
        }
        
        // Type-specific persistence logic
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
        else if (k === 'wordHistory') s.setItem('wordCountHistory', JSON.stringify(v));
        else if (k === 'fishStats') {
            s.setItem('fishCaught', v.caught);
            s.setItem('fishSpared', v.spared);
        }
        else if (k.startsWith('badge_')) s.setItem(k, v);
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
    
    /**
     * Unlock a badge and show notification
     */
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
// DATA MANAGER - Import/Export Backups
// ============================================================================
/**
 * Handles data backup and restoration with integrity verification.
 * Uses a simple hash to detect tampering with backup files.
 */
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
                    alert("Invalid backup file format.");
                    return;
                }
                const expectedHash = this.generateHash(parsed.data);
                if (parsed.hash !== expectedHash) {
                    alert("⚠️ Backup file may have been tampered with.");
                    return;
                }
                // Restore data
                Object.keys(parsed.data).forEach(key => {
                    State.save(key, parsed.data[key]);
                });
                alert("Data restored successfully! Reloading...");
                window.location.reload();
            } catch (err) {
                alert("Failed to parse backup file: " + err.message);
            }
        };
        reader.readAsText(file);
    }
};


// ============================================================================
// UTILS - Common Utility Functions
// ============================================================================
/**
 * General purpose utility functions used throughout the app
 */
const Utils = {
    /**
     * Debounce function calls to limit execution rate
     */
    debounce(fn, wait) {
        let t;
        return (...args) => {
            clearTimeout(t);
            t = setTimeout(() => fn(...args), wait);
        };
    },
    
    /**
     * Format large numbers with K/M suffixes
     */
    formatNumber(n) {
        if (n >= 1000000) return (n/1000000).toFixed(1) + 'M';
        if (n >= 1000) return Math.round(n/1000) + 'k';
        return n;
    },
    
    /**
     * Get ordinal suffix for a number (1st, 2nd, 3rd, etc.)
     */
    getOrdinal(n) {
        const s = ['th', 'st', 'nd', 'rd'];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    },
    
    /**
     * Shuffle an array using Fisher-Yates algorithm
     */
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
};


// ============================================================================
// HAPTICS - Mobile Vibration Feedback
// ============================================================================
/**
 * Provides haptic feedback on supported devices
 */
const Haptics = {
    light() {
        if (navigator.vibrate) navigator.vibrate(10);
    },
    medium() {
        if (navigator.vibrate) navigator.vibrate(25);
    },
    heavy() {
        if (navigator.vibrate) navigator.vibrate(50);
    },
    pattern(pattern) {
        if (navigator.vibrate) navigator.vibrate(pattern);
    }
};


// ============================================================================
// ACCESSIBILITY - Screen Reader Support
// ============================================================================
/**
 * Accessibility helpers for screen readers and assistive technology
 */
const Accessibility = {
    announce(message, priority = 'polite') {
        let announcer = document.getElementById('sr-announcer');
        if (!announcer) {
            announcer = document.createElement('div');
            announcer.id = 'sr-announcer';
            announcer.setAttribute('aria-live', priority);
            announcer.setAttribute('aria-atomic', 'true');
            announcer.className = 'sr-only';
            announcer.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0;';
            document.body.appendChild(announcer);
        }
        announcer.textContent = '';
        setTimeout(() => { announcer.textContent = message; }, 100);
    }
};


// ============================================================================
// EXPORTS - Make available globally
// ============================================================================
window.CONFIG = CONFIG;
window.P2P_COLORS = P2P_COLORS;
window.ContentFilter = ContentFilter;
window.DOM = DOM;
window.loadDOM = loadDOM;
window.safeParse = safeParse;
window.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
window.State = State;
window.DataManager = DataManager;
window.Utils = Utils;
window.Haptics = Haptics;
window.Accessibility = Accessibility;

console.log('%c[Core] Loaded', 'color: #22c55e');

})();
