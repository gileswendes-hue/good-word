(function() {
const CONFIG = {
    API_BASE_URL: '/api/words',
    SCORE_API_URL: '/api/scores',
    APP_VERSION: '6.6.9',
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
const ContentFilter = {
    // Only truly offensive slurs - racial, transphobic, homophobic
    _encoded: 'bmlnZ2VyfG5pZ2dhfGZhZ2dvdHxkeWtlfHRyYW5ueXxjaGlua3xnb29rfHNwaWN8a2lrZXx3ZXRiYWNrfGJlYW5lcnxjb29ufHJhZ2hlYWR8dG93ZWxoZWFkfGNhbWVsam9ja2V5fHBha2l8d29wfGphcHxob25reXxuZWdyb3xoYWxmYnJlZWR8c2hlbWFsZXxoZXNoZXxwZWRvfHBhZWRvfHBlZG9waGlsZXxuYXppfG5hemlzfGhpdGxlcg==',
    _patterns: null,
    init() {
        try {
            const decoded = atob(this._encoded);
            const terms = decoded.split('|');
            this._patterns = terms.map(term => {
                // Build pattern character by character to avoid corruption
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
                // Match whole word only, with optional plural
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
        // Test the whole word as-is (already normalized by caller or just test directly)
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
    isActive() {
        return State.data.settings.offlineMode;
    },
    async fillCache() {
        try {
            UIManager.showMessage("Downloading words... 📥");
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
            UIManager.showMessage(`Cached ${data.length} words! 📴`);
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
        UIManager.updateOfflineIndicator();
    },
    async sync() {
        const queue = State.data.voteQueue || [];
        if (queue.length === 0) {
            UIManager.showMessage("No votes to sync ✓");
            return;
        }
        UIManager.showMessage(`Syncing ${queue.length} votes... 📡`);
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
        UIManager.showMessage(`Synced ${synced} votes! ✓`);
    },
    async toggle(active) {
        if (active) {
            const success = await this.fillCache();
            if (success) {
                State.data.settings.offlineMode = true;
                State.save('settings', State.data.settings);
                State.runtime.allWords = State.data.offlineCache
                    .filter(w => (w.notWordVotes || 0) < 20);
                State.runtime.fullWordList = State.runtime.allWords; // Same reference
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
            await this.sync();
            State.data.settings.offlineMode = false;
            State.save('settings', State.data.settings);
            UIManager.updateOfflineIndicator();
            await Game.refreshData();
        }
    }
};
// Sync pending mini-game scores when coming back online
window.addEventListener('online', () => {
    console.log('Back online - syncing pending mini-game scores...');
    setTimeout(() => API.syncPendingMiniGameScores(), 1000);
});
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
        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000);
        if (!State.data.spiderEatLog) State.data.spiderEatLog = [];
        State.data.spiderEatLog.push(now);
        State.data.spiderEatLog = State.data.spiderEatLog.filter(t => t > oneHourAgo);
        State.save('spiderEatLog', State.data.spiderEatLog);
        if (State.data.spiderEatLog.length >= 5) {
            // Spider is full for 1 hour after eating 5 bugs
            State.data.spiderFullUntil = Date.now() + (60 * 60 * 1000);
            State.save('spiderFullUntil', State.data.spiderFullUntil);
            setTimeout(() => UIManager.showPostVoteMessage("The spider is stuffed! 🕷️💤"), 1500);
        }
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
        const substeps = len > 50 ? 4 : 6;
        for (let s = 0; s < substeps; s++) {
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
            Physics.buildGrid();
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
            let dbWords = [];
            if (OfflineManager.isActive()) {
                dbWords = State.data.offlineCache || [];
                if (dbWords.length === 0) {
                    return [{ _id: 'offline_placeholder', text: 'Go online to cache words first', goodVotes: 0, badVotes: 0, isPlaceholder: true }];
                }
            } else {
                dbWords = await this.getAllWords() || [];
            }
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
            if (safeList.length > 0) {
                const combinedList = safeList
                    .map(text => dbWords.find(w => w.text.toUpperCase() === text))
                    .filter(w => w && w._id);
                if (combinedList.length > 0) {
                    return combinedList;
                }
            }
            if (OfflineManager.isActive() && dbWords.length > 0) {
                console.warn("Kids word list unavailable offline - using full cache");
                return dbWords;
            }
            const msg = OfflineManager.isActive()
                ? 'Kids Mode needs online first'
                : 'No Kids Words in DB';
            console.warn("No kids words found:", msg);
            return [{ _id: 'offline_placeholder', text: msg, goodVotes: 0, badVotes: 0, isPlaceholder: true }];
        } catch (e) {
            console.error("Kids mode load error:", e);
            return [{ _id: 'err', text: 'Error Loading', goodVotes: 0, badVotes: 0, isPlaceholder: true }];
        }
    },
    async vote(id, type) {
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
    async getCommunityDefinition(wordId) {
        try {
            const r = await fetch(`${CONFIG.API_BASE_URL}/${wordId}/definition`);
            if (!r.ok) return null;
            return await r.json();
        } catch (e) { return null; }
    },
    async setCommunityDefinition(wordId, definition, author) {
        try {
            const r = await fetch(`${CONFIG.API_BASE_URL}/${wordId}/definition`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ definition, author })
            });
            if (!r.ok) return null;
            return await r.json();
        } catch (e) { return null; }
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
    },
    async submitMiniGameScore(game, name, score) {
        const scoreData = { game, name, score, userId: State.data.userId, timestamp: Date.now() };
        try {
            const response = await fetch('/api/minigame-scores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(scoreData)
            });
            if (!response.ok) {
                throw new Error('Server returned ' + response.status);
            }
            // Successfully uploaded - also check for any pending scores to sync
            this.syncPendingMiniGameScores();
        } catch (e) {
            console.warn("Mini-game score submit failed, saving for later sync:", e);
            // Save to pending queue for later upload
            const pending = State.data.pendingMiniGameScores || [];
            // Avoid duplicates (same game, name, score within 1 minute)
            const isDuplicate = pending.some(p => 
                p.game === game && p.name === name && p.score === score && 
                Math.abs(p.timestamp - scoreData.timestamp) < 60000
            );
            if (!isDuplicate) {
                pending.push(scoreData);
                State.save('pendingMiniGameScores', pending);
            }
        }
    },
    async syncPendingMiniGameScores() {
        const pending = State.data.pendingMiniGameScores || [];
        if (pending.length === 0) return;
        
        const stillPending = [];
        for (const scoreData of pending) {
            try {
                const response = await fetch('/api/minigame-scores', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(scoreData)
                });
                if (!response.ok) {
                    stillPending.push(scoreData);
                } else {
                    console.log(`Synced pending score: ${scoreData.game} - ${scoreData.score}`);
                }
            } catch (e) {
                stillPending.push(scoreData);
            }
        }
        
        State.save('pendingMiniGameScores', stillPending);
        
        if (stillPending.length < pending.length) {
            const synced = pending.length - stillPending.length;
            console.log(`Synced ${synced} pending mini-game score(s) to world records`);
        }
    },
    async getMiniGameScores(game) {
        try {
            const r = await fetch(`/api/minigame-scores/${game}`);
            if (!r.ok) return [];
            return await r.json();
        } catch (e) { return []; }
    },
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
        this.updateChooserButton(currentThemeToApply);
    },
    updateChooserButton(theme) {
        const name = theme === 'ballpit' ? 'Ball Pit' : theme.charAt(0).toUpperCase() + theme.slice(1);
        if (DOM.theme.chooserBtn) {
            DOM.theme.chooserBtn.innerHTML = `${name} ▼`;
        }
    },
    populateChooser() {
        const current = State.data.currentTheme || 'default';
        this.updateChooserButton(current);
    },
    showGallery() {
        const existing = document.getElementById('theme-gallery-popup');
        if (existing) { existing.remove(); return; }
        const themeInfo = {
            default: { icon: '🎨', name: 'Default', color: 'bg-gray-100' },
            rainbow: { icon: '🌈', name: 'Rainbow', color: 'bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400' },
            dark: { icon: '🌙', name: 'Dark', color: 'bg-gray-800', dark: true },
            banana: { icon: '🍌', name: 'Banana', color: 'bg-yellow-300' },
            winter: { icon: '❄️', name: 'Winter', color: 'bg-blue-100' },
            summer: { icon: '☀️', name: 'Summer', color: 'bg-orange-300' },
            halloween: { icon: '🎃', name: 'Halloween', color: 'bg-orange-600' },
            submarine: { icon: '🐠', name: 'Submarine', color: 'bg-cyan-600' },
            fire: { icon: '🔥', name: 'Fire', color: 'bg-red-500' },
            plymouth: { icon: '⚓', name: 'Plymouth', color: 'bg-blue-800', dark: true },
            ballpit: { icon: '🎾', name: 'Ballpit', color: 'bg-pink-400' },
            space: { icon: '🚀', name: 'Space', color: 'bg-indigo-900', dark: true },
            woodland: { icon: '🌲', name: 'Woodland', color: 'bg-green-700', dark: true },
            flight: { icon: '✈️', name: 'Flight', color: 'bg-sky-400' },
            ocean: { icon: '🌊', name: 'Ocean', color: 'bg-blue-500' }
        };
        const unlockedThemes = ['default', ...State.data.unlockedThemes];
        const allThemeKeys = Object.keys(themeInfo);
        const currentTheme = State.runtime.currentTheme || 'default';
        const popup = document.createElement('div');
        popup.id = 'theme-gallery-popup';
        popup.className = 'fixed inset-0 z-[9999] flex items-end justify-center';
        popup.innerHTML = `
            <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" onclick="document.getElementById('theme-gallery-popup').remove()"></div>
            <div class="relative bg-white rounded-t-3xl shadow-2xl p-4 pb-8 w-full max-w-md animate-slide-up">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-black text-gray-800">🎨 Themes <span class="text-sm font-normal text-gray-400">(${unlockedThemes.length}/${allThemeKeys.length})</span></h3>
                    <button onclick="document.getElementById('theme-gallery-popup').remove()" class="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                </div>
                <div class="grid grid-cols-3 gap-3" id="theme-grid"></div>
                <p class="text-xs text-gray-400 mt-4 text-center">Vote on secret words to unlock themes!</p>
            </div>
        `;
        document.body.appendChild(popup);
        const grid = document.getElementById('theme-grid');
        allThemeKeys.forEach(key => {
            const info = themeInfo[key];
            const unlocked = unlockedThemes.includes(key);
            const isActive = currentTheme === key;
            const tile = document.createElement('div');
            if (unlocked) {
                tile.className = `theme-tile p-3 rounded-xl ${info.color} ${isActive ? 'ring-3 ring-indigo-500 ring-offset-2' : ''} hover:scale-105 transition-all cursor-pointer flex flex-col items-center justify-center aspect-square shadow-md`;
                tile.innerHTML = `
                    <span class="text-3xl mb-1">${info.icon}</span>
                    <span class="text-xs font-bold ${info.dark ? 'text-white' : 'text-gray-700'}">${info.name}</span>
                `;
                tile.onclick = () => {
                    ThemeManager.apply(key, true);
                    ThemeManager.populateChooser(); // Update button text
                    document.querySelectorAll('.theme-tile').forEach(t => t.classList.remove('ring-3', 'ring-indigo-500', 'ring-offset-2'));
                    tile.classList.add('ring-3', 'ring-indigo-500', 'ring-offset-2');
                    setTimeout(() => document.getElementById('theme-gallery-popup')?.remove(), 300);
                };
            } else {
                tile.className = 'p-3 rounded-xl bg-gray-200 flex flex-col items-center justify-center aspect-square opacity-60';
                tile.innerHTML = `
                    <span class="text-2xl mb-1">🔒</span>
                    <span class="text-xs font-bold text-gray-400">???</span>
                `;
            }
            grid.appendChild(tile);
        });
        if (!document.getElementById('gallery-animation-style')) {
            const style = document.createElement('style');
            style.id = 'gallery-animation-style';
            style.textContent = `
                @keyframes slide-up {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
            `;
            document.head.appendChild(style);
        }
    },
    apply(t, m = false) {
        State.runtime.currentTheme = t;
        if (m !== 'temp') {
            State.save('currentTheme', t);
            if (m === true) State.save('manualTheme', true);
        }
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
        if (t === 'ocean') {
            if (!document.getElementById('ocean-theme-style')) {
                const s = document.createElement('style');
                s.id = 'ocean-theme-style';
                s.innerHTML = `
                    body.theme-ocean {
                        background: transparent !important;
                    }
                    body.theme-ocean .card,
                    body.theme-ocean .bg-white {
                        background: rgba(255, 255, 255, 0.75) !important;
                        backdrop-filter: blur(8px);
                        -webkit-backdrop-filter: blur(8px);
                    }
                    body.theme-ocean #wordDisplay {
                        color: #1a4a6e !important;
                        text-shadow: 1px 1px 0px rgba(255,255,255,0.5);
                    }
                    body.theme-ocean .bg-indigo-600,
                    body.theme-ocean .bg-indigo-500 {
                        background: linear-gradient(135deg, #2a6a9a, #1a5080) !important;
                    }
                    body.theme-ocean .text-indigo-600 {
                        color: #1a5080 !important;
                    }
                `;
                document.head.appendChild(s);
            }
        } else {
            const old = document.getElementById('ocean-theme-style');
            if (old) old.remove();
        }
        if (t === 'flight') {
            if (!document.getElementById('flight-theme-style')) {
                const s = document.createElement('style');
                s.id = 'flight-theme-style';
                s.innerHTML = `
                    body.theme-flight {
                        background: transparent !important;
                    }
                    body.theme-flight .card,
                    body.theme-flight .bg-white {
                        background: rgba(255, 255, 255, 0.7) !important;
                        backdrop-filter: blur(8px);
                        -webkit-backdrop-filter: blur(8px);
                    }
                    body.theme-flight #wordDisplay {
                        color: #1a3a5c !important;
                        text-shadow: 1px 1px 0px rgba(255,255,255,0.5);
                    }
                    body.theme-flight .bg-indigo-600,
                    body.theme-flight .bg-indigo-500 {
                        background: linear-gradient(135deg, #4a90c2, #2a6090) !important;
                    }
                    body.theme-flight .text-indigo-600 {
                        color: #2a6090 !important;
                    }
                `;
                document.head.appendChild(s);
            }
        } else {
            const old = document.getElementById('flight-theme-style');
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
        if (e.flight) e.flight.classList.toggle('hidden', t !== 'flight');
        if (e.ocean) e.ocean.classList.toggle('hidden', t !== 'ocean');
        if (t === 'winter') {
            Effects.snow();
            SnowmanBuilder.init();
            SnowmanBuilder.render();
        } else {
            e.snow.innerHTML = '';
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
        if (t === 'flight') Effects.flight(true);
        else Effects.flight(false);
        if (t === 'ocean') Effects.ocean(true);
        else Effects.ocean(false);
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
    MILESTONE: 50000, // 50k increments for adults
    KIDS_MILESTONE: 5000, // 5k increments for kids (1/10th)
    getMilestone() {
        return State.data.settings.kidsMode ? this.KIDS_MILESTONE : this.MILESTONE;
    },
    update(totalVotes) {
        const bar = DOM.header.communityGoalBar;
        const text = DOM.header.communityGoalText;
        if (!bar || !text) return;
        const milestone = this.getMilestone();
        const currentMilestone = Math.floor(totalVotes / milestone) * milestone + milestone;
        const prevMilestone = currentMilestone - milestone;
        const progress = ((totalVotes - prevMilestone) / milestone) * 100;
        const remaining = currentMilestone - totalVotes;
        bar.style.width = Math.min(progress, 100) + '%';
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
const SnowmanBuilder = {
    TOTAL_PARTS: 100, // 100 snowmen collected = 1 complete snowman
    container: null,
    init() {
        const logoArea = document.getElementById('logoArea');
        if (!logoArea || this.container) return;
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
        if (count > 100) {
            const dogProg = Math.min((count - 100) / 50, 1);
            html += '<div style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;margin-left:-5px;">';
            html += '<div style="position:relative;width:44px;height:42px;">';
            if (dogProg > 0) {
                const w = Math.round(30 * Math.min(dogProg / 0.3, 1));
                const h = Math.round(18 * Math.min(dogProg / 0.3, 1));
                html += `<div style="position:absolute;bottom:6px;left:50%;transform:translateX(-50%);width:${w}px;height:${h}px;background:radial-gradient(ellipse at 30% 30%, #fff, #d0d0d0);border-radius:50%;box-shadow:inset -2px -2px 4px rgba(0,0,0,0.1);z-index:1;"></div>`;
            }
            if (dogProg > 0.3) {
                const s = Math.round(15 * Math.min((dogProg - 0.3) / 0.25, 1));
                const hasFace = dogProg > 0.75;
                const hasEars = dogProg > 0.75;
                html += `<div style="position:absolute;bottom:12px;right:0px;width:${s}px;height:${s}px;background:radial-gradient(circle at 30% 30%, #fff, #d0d0d0);border-radius:50%;z-index:2;box-shadow:inset -1px -1px 3px rgba(0,0,0,0.1);">
                    ${hasFace ? `<div style="position:absolute;top:28%;left:20%;width:2px;height:2px;background:#1a1a1a;border-radius:50%;"></div><div style="position:absolute;top:28%;right:25%;width:2px;height:2px;background:#1a1a1a;border-radius:50%;"></div><div style="position:absolute;top:52%;left:50%;transform:translateX(-50%);width:3px;height:2px;background:#222;border-radius:50%;"></div>` : ''}
                    ${hasEars ? `<div style="position:absolute;top:-5px;left:0px;width:5px;height:7px;background:linear-gradient(180deg, #bbb, #ddd);border-radius:50% 50% 40% 40%;border:1px solid rgba(0,0,0,0.2);"></div><div style="position:absolute;top:-5px;right:0px;width:5px;height:7px;background:linear-gradient(180deg, #bbb, #ddd);border-radius:50% 50% 40% 40%;border:1px solid rgba(0,0,0,0.2);"></div>` : ''}
                </div>`;
            }
            if (dogProg > 0.55) {
                const lh = Math.round(8 * Math.min((dogProg - 0.55) / 0.2, 1));
                html += `<div style="position:absolute;bottom:0;right:10px;width:2px;height:${lh}px;background:#2a2a2a;border-radius:1px;"></div>`;
                html += `<div style="position:absolute;bottom:0;right:16px;width:2px;height:${lh}px;background:#2a2a2a;border-radius:1px;"></div>`;
                html += `<div style="position:absolute;bottom:0;left:10px;width:2px;height:${lh}px;background:#2a2a2a;border-radius:1px;"></div>`;
                html += `<div style="position:absolute;bottom:0;left:16px;width:2px;height:${lh}px;background:#2a2a2a;border-radius:1px;"></div>`;
            }
            if (dogProg > 0.8) html += `<div style="position:absolute;bottom:12px;left:2px;width:6px;height:8px;background:linear-gradient(to top, #d0d0d0, #e8e8e8);border-radius:40% 40% 50% 50%;transform:rotate(-20deg);box-shadow:inset -1px -1px 2px rgba(0,0,0,0.1);"></div>`;
            html += '</div></div>';
        }
        html += '<div style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;">';
        const bottomProgress = Math.min(progress / 0.33, 1);
        const middleProgress = progress > 0.33 ? Math.min((progress - 0.33) / 0.33, 1) : 0;
        const topProgress = progress > 0.66 ? Math.min((progress - 0.66) / 0.24, 1) : 0;
        const accessoryProgress = progress > 0.90 ? (progress - 0.90) / 0.10 : 0;
        if (accessoryProgress > 0.8) html += `<div style="font-size:16px;margin-bottom:-10px;">🎩</div>`;
        if (topProgress > 0) {
            const size = Math.round(26 * topProgress);
            const hasEyes = accessoryProgress > 0.2, hasNose = accessoryProgress > 0.5;
            html += `<div style="width:${size}px;height:${size}px;background:radial-gradient(circle at 30% 30%, #fff, #e8e8e8);border-radius:50%;box-shadow:inset -2px -2px 4px rgba(0,0,0,0.1);position:relative;margin-bottom:-4px;">
                ${hasEyes ? `<div style="position:absolute;top:32%;left:22%;width:3px;height:3px;background:#1a1a1a;border-radius:50%;"></div><div style="position:absolute;top:32%;right:22%;width:3px;height:3px;background:#1a1a1a;border-radius:50%;"></div>` : ''}
                ${hasNose ? `<div style="position:absolute;top:48%;left:50%;transform:translateX(-50%);border-left:3px solid transparent;border-right:3px solid transparent;border-top:10px solid #ff6b35;"></div>` : ''}
            </div>`;
        }
        if (middleProgress > 0) {
            const size = Math.round(36 * middleProgress);
            const hasArms = accessoryProgress > 0.4;
            const hasButtons = accessoryProgress > 0.3;
            html += `<div style="width:${size}px;height:${size}px;background:radial-gradient(circle at 30% 30%, #fff, #e8e8e8);border-radius:50%;box-shadow:inset -2px -2px 4px rgba(0,0,0,0.1);position:relative;margin-bottom:-5px;">
                ${hasButtons ? `<div style="position:absolute;top:25%;left:50%;transform:translateX(-50%);width:4px;height:4px;background:#1a1a1a;border-radius:50%;"></div><div style="position:absolute;top:50%;left:50%;transform:translateX(-50%);width:4px;height:4px;background:#1a1a1a;border-radius:50%;"></div><div style="position:absolute;top:75%;left:50%;transform:translateX(-50%);width:4px;height:4px;background:#1a1a1a;border-radius:50%;"></div>` : ''}
                ${hasArms ? `<div style="position:absolute;left:-16px;top:35%;width:18px;height:3px;background:linear-gradient(90deg, #3e2723, #5d4037);border-radius:2px;transform:rotate(-25deg);box-shadow:0 1px 1px rgba(0,0,0,0.2);"></div><div style="position:absolute;right:-16px;top:35%;width:18px;height:3px;background:linear-gradient(90deg, #5d4037, #3e2723);border-radius:2px;transform:rotate(25deg);box-shadow:0 1px 1px rgba(0,0,0,0.2);"></div>` : ''}
            </div>`;
        }
        if (bottomProgress > 0) {
            const size = Math.round(46 * bottomProgress);
            html += `<div style="width:${size}px;height:${size}px;background:radial-gradient(circle at 30% 30%, #fff, #e8e8e8);border-radius:50%;box-shadow:inset -3px -3px 5px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.15);"></div>`;
        }
        html += '</div>';
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
        c.classList.remove('hidden');
        c.style.display = 'block';
        Object.assign(c.style, {
            position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '50'
        });
        if (c.children.length > 0) return; // Prevent double spawn
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
        inner.style.display = 'block';
        inner.style.lineHeight = '1';
        inner.style.fontSize = fishEmoji === '🐙' ? '3.5rem' : '3rem';
        if (fishEmoji === '🐙') {
            inner.classList.add('octopus-motion');
            inner.style.animationDuration = (Math.random() * 1 + 1.5) + 's';
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
                 const currentLeft = getComputedStyle(wrap).left;
                 wrap.style.transition = 'none';
                 wrap.style.left = currentLeft;
                 setTimeout(() => {
                     if(!wrap.parentNode) return;
                     inner.style.transition = 'none';
                     inner.style.transform = `scaleX(${-baseDir})`;
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
        if (this.batTimeout) clearTimeout(this.batTimeout);
        const isSafeMode = State.data.settings.arachnophobiaMode;
        if (!active || isSafeMode) {
            const old = document.getElementById('spider-wrap');
            if (old) old.remove();
            const oldWeb = document.getElementById('spider-web-corner');
            if (oldWeb) oldWeb.remove();
            const style = document.getElementById('spider-motion-style');
            if (style) style.remove();
            const oldBat = document.getElementById('halloween-bat');
            if (oldBat) oldBat.remove();
            return;
        }
        const spawnBat = () => {
            if (!active) return;
            const oldBat = document.getElementById('halloween-bat');
            if (oldBat) oldBat.remove();
            const bat = document.createElement('div');
            bat.id = 'halloween-bat';
            const side = Math.floor(Math.random() * 4);
            let startX, startY, endX, endY;
            switch(side) {
                case 0: // top
                    startX = 20 + Math.random() * 60;
                    startY = -10;
                    endX = 30 + Math.random() * 40;
                    endY = 110;
                    break;
                case 1: // right
                    startX = 110;
                    startY = 20 + Math.random() * 60;
                    endX = -10;
                    endY = 30 + Math.random() * 40;
                    break;
                case 2: // bottom
                    startX = 20 + Math.random() * 60;
                    startY = 110;
                    endX = 30 + Math.random() * 40;
                    endY = -10;
                    break;
                default: // left
                    startX = -10;
                    startY = 20 + Math.random() * 60;
                    endX = 110;
                    endY = 30 + Math.random() * 40;
            }
            const duration = 4 + Math.random() * 3;
            bat.innerHTML = `
                <div class="bat-body" style="font-size: 5rem; filter: drop-shadow(0 0 15px rgba(0,0,0,0.6));">
                    <span class="bat-wing-left" style="display: inline-block; transform-origin: right center;">🦇</span>
                </div>
            `;
            bat.style.cssText = `
                position: fixed;
                left: ${startX}%;
                top: ${startY}%;
                z-index: 101;
                pointer-events: none;
                animation: bat-fly-${Date.now()} ${duration}s ease-in-out forwards;
            `;
            const styleEl = document.createElement('style');
            styleEl.textContent = `
                @keyframes bat-fly-${Date.now()} {
                    0% {
                        left: ${startX}%;
                        top: ${startY}%;
                        transform: scale(0.3);
                    }
                    50% {
                        transform: scale(1.5);
                    }
                    100% {
                        left: ${endX}%;
                        top: ${endY}%;
                        transform: scale(0.5);
                    }
                }
                @keyframes bat-flap {
                    0%, 100% { transform: scaleX(1) scaleY(1); }
                    50% { transform: scaleX(0.6) scaleY(0.8); }
                }
                .bat-body {
                    animation: bat-flap 0.15s ease-in-out infinite;
                }
            `;
            document.head.appendChild(styleEl);
            document.body.appendChild(bat);
            setTimeout(() => {
                bat.remove();
                styleEl.remove();
            }, duration * 1000);
            this.batTimeout = setTimeout(spawnBat, 8000 + Math.random() * 12000);
        };
        this.batTimeout = setTimeout(spawnBat, 3000 + Math.random() * 5000);
        if (!document.getElementById('spider-motion-style')) {
            const s = document.createElement('style');
            s.id = 'spider-motion-style';
            s.innerHTML = `
                @keyframes spider-idle-wiggle {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(2deg); }
                }
                @keyframes spider-moving {
                    0%, 100% { transform: rotate(-1deg); }
                    50% { transform: rotate(1deg); }
                }
                @keyframes spider-pause-wiggle {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(3deg); }
                }
                .scuttling-motion {
                    animation: spider-moving 0.8s infinite ease-in-out;
                }
                .spider-paused {
                    animation: spider-pause-wiggle 1s ease-in-out;
                }
                .hunting-scuttle {
                    animation: spider-moving 0.5s infinite ease-in-out;
                }
                .spider-idle {
                    animation: spider-idle-wiggle 3s infinite ease-in-out;
                }
                .spider-fat {
                    filter: drop-shadow(0 10px 5px rgba(0,0,0,0.4)); transition: transform 1s cubic-bezier(0.5, 0, 0.5, 1);
                }
            `;
            document.head.appendChild(s);
        }
        const spiderScuttle = {
            active: false,
            targetX: 50,
            currentX: 50,
            start(wrap, body, targetPercent, onComplete) {
                this.active = true;
                this.targetX = targetPercent;
                this.currentX = parseFloat(wrap.style.left) || 50;
                body.classList.add('scuttling-motion');
                wrap.style.transition = 'left 2s ease-in-out';
                wrap.style.left = targetPercent + '%';
                setTimeout(() => {
                    this.currentX = targetPercent;
                    this.stop(body, onComplete);
                }, 2000);
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
            const now = Date.now();
            const oneHourAgo = now - (60 * 60 * 1000);
            if (!State.data.spiderEatLog) State.data.spiderEatLog = [];
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
            let scale = Math.min(0.7 + (eaten * 0.05), 2.0);
            const isFull = Date.now() < (State.data.spiderFullUntil || 0);
            if (isFull) {
                scale = scale * 1.6; // Max fatness (60% bigger)
                currentBody.classList.add('spider-fat');
            } else {
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
                if (scuttle) {
                    scuttle.start(wrap, body, safeLeft, () => {
                        if (wrap.classList.contains('hunting')) return;
                        body.style.transform = 'rotate(180deg)';
                        body.classList.add('spider-idle');
                        thread.style.transition = 'height 2.5s ease-in-out';
                        thread.style.height = '18vh';
                        setTimeout(() => {
                             if (wrap.classList.contains('hunting')) return;
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
            thread.style.transition = 'height 1s ease-out';
            thread.style.height = '20vh';
            setTimeout(() => {
                if(wrap.showBubble) wrap.showBubble(text);
                if(body) body.style.animation = 'shake 1s ease-in-out';
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
                const recentBugs = State.data.spiderEatLog ? State.data.spiderEatLog.length : 0;
                scale = scale * (1 + (recentBugs * 0.20));
                body.classList.remove('spider-fat');
            }
            anchor.style.transform = `scale(${scale.toFixed(2)})`;
        }
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
        const currentX = parseFloat(wrap.style.left) || 50;
        wrap.style.transition = 'left 1s ease-in-out';
        wrap.style.left = destX + '%';
        setTimeout(() => {
            body.classList.remove('hunting-scuttle');
            const anchor = document.getElementById('spider-anchor');
            let scale = 1;
            if (anchor && anchor.style.transform) {
                const match = anchor.style.transform.match(/scale\(([^)]+)\)/);
                if (match) scale = parseFloat(match[1]);
            }
            // Spider wrap is at top: -15vh, so thread must drop (15 + destY) vh to reach destY vh
            // The spider body has margin-top: -10px, so add ~1vh to compensate
            const dropVH = 15 + destY + 1;
            thread.style.transition = 'none';
            thread.style.height = '0';
            void thread.offsetWidth; // Force reflow
            thread.style.transition = 'height 2s cubic-bezier(0.45, 0, 0.55, 1)';
            thread.style.height = dropVH + 'vh';
            setTimeout(() => {
                    if (isFood && MosquitoManager.state === 'stuck') {
                        MosquitoManager.eat();
                        if(wrap.showBubble) wrap.showBubble("YUM!");
                        const anchor = wrap.querySelector('#spider-anchor');
                        if (anchor) {
                            const now = Date.now();
                            const oneHourAgo = now - (60 * 60 * 1000);
                            const recentBugs = (State.data.spiderEatLog || []).filter(t => t > oneHourAgo).length;
                            const maxBugs = 5;
                            const cappedBugs = Math.min(recentBugs, maxBugs);
                            UIManager.showPostVoteMessage(`🕷️ ${recentBugs} bug${recentBugs !== 1 ? 's' : ''} in belly!`);
                            const baseFontSize = 3; // rem
                            const newFontSize = baseFontSize + (cappedBugs * 0.6); // 3rem -> 6rem over 5 bugs
                            const bulgeFontSize = newFontSize * 1.2;
                            body.style.transition = 'font-size 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
                            body.style.fontSize = bulgeFontSize.toFixed(2) + 'rem';
                            setTimeout(() => {
                                if (body) {
                                    body.style.fontSize = newFontSize.toFixed(2) + 'rem';
                                }
                            }, 300);
                            if (cappedBugs >= maxBugs) {
                                body.classList.add('spider-fat');
                            }
                        }
                        if (body) body.style.animation = 'shake 0.2s ease-in-out';
                        setTimeout(() => {
                            if (body) body.style.animation = '';
                        }, 500);
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
                        const angryPhrases = GAME_DIALOGUE.spider.trickedEnd;
                        const angryText = angryPhrases[Math.floor(Math.random() * angryPhrases.length)];
                        if(wrap.showBubble) wrap.showBubble(angryText);
                        body.style.animation = 'shake 0.3s ease-in-out';
                        setTimeout(() => {
                            body.style.animation = '';
                            this.retreatSpider(thread, wrap, bub, '4s');
                        }, 1500);
                    }
                }, 2000); // Wait for drop animation
            }, 1000); // Wait for horizontal movement
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
        c.style.cssText = `
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 0;
            overflow: hidden;
            background: ${bgGradient};
        `;
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
        c.appendChild(createTree(true, 130, 3));
        c.appendChild(createTree(true, 90, 2));
        c.appendChild(createTree(true, 60, 1));
        c.appendChild(createTree(false, 110, 3));
        c.appendChild(createTree(false, 75, 2));
        c.appendChild(createTree(false, 50, 1));
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
        const lightOverlay = document.createElement('div');
        lightOverlay.style.cssText = `
            position: absolute;
            inset: 0;
            pointer-events: none;
            z-index: 5;
        `;
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
            const emptySpots = hidingSpots.filter(s => !s.creature);
            if (emptySpots.length === 0) {
                this.woodlandCreatureTimeout = setTimeout(spawnCreature, 5000);
                return;
            }
            const spot = emptySpots[Math.floor(Math.random() * emptySpots.length)];
            const creature = creatures[Math.floor(Math.random() * creatures.length)];
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
            setTimeout(() => {
                if (critterEl.parentNode) {
                    critterEl.remove();
                    spot.creature = null;
                }
            }, 6000);
            const nextDelay = timeOfDay === 'night' ? 15000 : 8000;
            this.woodlandCreatureTimeout = setTimeout(spawnCreature, Math.random() * nextDelay + 5000);
        };
        this.woodlandCreatureTimeout = setTimeout(spawnCreature, 3000);
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
    },
    flightTimeout: null,
    flightObjects: [],

flight(active) {
        let c = DOM.theme.effects.flight;
        if (!c) {
            c = document.createElement('div');
            c.id = 'flight-effect';
            c.className = 'fixed inset-0 pointer-events-none overflow-hidden z-0';
            document.body.appendChild(c);
            DOM.theme.effects.flight = c;
        }

        // --- CLEANUP ---
        if (this.flightTimeout) clearTimeout(this.flightTimeout);
        if (this.bankInterval) clearInterval(this.bankInterval);
        if (this.objectSpawnInterval) clearInterval(this.objectSpawnInterval);
        if (this.groundSpawnInterval) clearInterval(this.groundSpawnInterval);
        if (this.wiperInterval) clearInterval(this.wiperInterval);
        this.flightObjects.forEach(obj => obj.remove());
        this.flightObjects = [];

        // Stop Audio
        if (this.engineAudio) {
            this.engineAudio.pause();
            this.engineAudio = null;
        }

        if (!active) { c.innerHTML = ''; c.style.background = ''; return; }

        // --- AUDIO ---
        if (!State.data.settings.muteSounds) {
             try {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                const lfo = audioCtx.createOscillator();
                const lfoGain = audioCtx.createGain();
                
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(55, audioCtx.currentTime); 
                lfo.type = 'sine';
                lfo.frequency.setValueAtTime(8, audioCtx.currentTime);
                lfoGain.gain.setValueAtTime(15, audioCtx.currentTime);
                lfo.connect(lfoGain);
                lfoGain.connect(oscillator.frequency);
                gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                oscillator.start();
                lfo.start();
                this.engineAudio = { pause: () => { oscillator.stop(); lfo.stop(); audioCtx.close(); } };
             } catch(e) {}
        }

        c.innerHTML = '';

        // =========================================
        // LAYER 1: WORLD 
        // =========================================
        const worldContainer = document.createElement('div');
        worldContainer.style.cssText = `
            position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
            transform-origin: center center; will-change: transform;
            z-index: 0;
        `;

        // SKY
        const sky = document.createElement('div');
        sky.style.cssText = `position: absolute; inset: 0; background: linear-gradient(to bottom, #0d47a1 0%, #42a5f5 50%, #e3f2fd 100%);`;
        worldContainer.appendChild(sky);

        // SUN
        const sun = document.createElement('div');
        sun.style.cssText = `
            position: absolute; top: 20%; left: 70%; width: 80px; height: 80px;
            background: #fff; border-radius: 50%;
            box-shadow: 0 0 60px rgba(255,255,255,0.9);
        `;
        worldContainer.appendChild(sun);

        // DISTANT CLOUDS
        const distantSky = document.createElement('div');
        distantSky.style.cssText = `position: absolute; top: 0; left: 0; width: 100%; height: 50%; overflow: hidden;`;
        for(let i=0; i<6; i++) {
            const cloud = document.createElement('div');
            cloud.innerText = Math.random() > 0.5 ? '☁️' : '🌥️';
            cloud.style.cssText = `
                position: absolute; top: ${38 + Math.random() * 8}%; left: ${Math.random() * 100}%;
                font-size: ${20 + Math.random() * 30}px; opacity: 0.6;
                filter: blur(1px); transition: left 1s linear;
            `;
            cloud.dataset.speed = 0.01 + Math.random() * 0.02;
            cloud.dataset.pos = parseFloat(cloud.style.left);
            distantSky.appendChild(cloud);
        }
        worldContainer.appendChild(distantSky);

        // --- MOUNTAINS ---
        const createMountainLayer = (svg, top, height, z, opacity) => {
            const cont = document.createElement('div');
            cont.style.cssText = `position: absolute; top: ${top}%; left: 0; width: 100%; height: ${height}%; z-index: ${z}; opacity: ${opacity}; pointer-events: none;`;
            const p1 = document.createElement('div');
            p1.style.cssText = `position: absolute; top: 0; left: 0; width: 100%; height: 100%; will-change: transform;`;
            p1.innerHTML = svg;
            const p2 = document.createElement('div');
            p2.style.cssText = `position: absolute; top: 0; left: 100%; width: 100%; height: 100%; will-change: transform;`;
            p2.innerHTML = svg;
            cont.appendChild(p1);
            cont.appendChild(p2);
            return { cont, p1, p2 };
        };

        const svgBack = `
        <svg viewBox="0 0 1200 100" preserveAspectRatio="none" style="width:100%; height:100%;">
            <path d="M0,100 L0,70 L200,45 L400,80 L600,40 L800,75 L1000,45 L1200,70 L1200,100 Z" fill="#546e7a"/>
            <path d="M200,45 L257,55 L240,52 L220,58 L200,53 L180,58 L160,52 L120,55 Z" fill="white" opacity="0.9"/>
            <path d="M600,40 L685,55 L660,50 L640,58 L620,52 L600,58 L580,50 L525,55 Z" fill="white" opacity="0.9"/>
            <path d="M1000,45 L1080,55 L1060,50 L1040,58 L1020,52 L1000,58 L980,50 L933,55 Z" fill="white" opacity="0.9"/>
        </svg>`;
        const mtnBack = createMountainLayer(svgBack, 40, 20, 1, 1.0);
        worldContainer.appendChild(mtnBack.cont);

        const svgFront = `
        <svg viewBox="0 0 1200 100" preserveAspectRatio="none" style="width:100%; height:100%;">
            <path d="M0,100 L0,85 L300,55 L500,90 L800,60 L1100,90 L1200,80 L1200,100 Z" fill="#5d4037"/>
            <path d="M300,55 L357,65 L340,62 L320,68 L300,63 L280,68 L260,62 L200,65 Z" fill="white" opacity="0.8"/>
            <path d="M800,60 L900,70 L880,66 L850,74 L820,68 L790,74 L750,66 L700,70 Z" fill="white" opacity="0.8"/>
        </svg>`;
        const mtnFront = createMountainLayer(svgFront, 50, 15, 2, 1.0);
        worldContainer.appendChild(mtnFront.cont);

        // GROUND (With visible movement grid)
        const ground = document.createElement('div');
        ground.style.cssText = `
            position: absolute; top: 56%; left: -50%; width: 200%; height: 100%;
            background: #2e7d32;
            perspective: 500px; z-index: 3; overflow: hidden;
        `;
        const grid = document.createElement('div');
        // High contrast grid for visibility
        grid.style.cssText = `
            position: absolute; inset: -100%;
            background-image: 
                repeating-linear-gradient(90deg, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.4) 2px, transparent 2px, transparent 100px),
                repeating-linear-gradient(0deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 50px);
            background-size: 200px 200px;
            transform: rotateX(80deg);
        `;
        ground.appendChild(grid);
        
        // GROUND OBJECT CONTAINER
        const groundObjContainer = document.createElement('div');
        groundObjContainer.style.cssText = `position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; perspective: 500px; transform-style: preserve-3d;`;
        ground.appendChild(groundObjContainer);
        
        worldContainer.appendChild(ground);
        c.appendChild(worldContainer);

        // EXTERNAL RAIN
        const externalRainContainer = document.createElement('div');
        externalRainContainer.style.cssText = `position: absolute; inset: 0; pointer-events: none; z-index: 5; overflow: hidden;`;
        c.appendChild(externalRainContainer);

        // OBJECTS
        const objectContainer = document.createElement('div');
        objectContainer.style.cssText = `position: absolute; inset: 0; pointer-events: none; z-index: 6; overflow: hidden;`;
        c.appendChild(objectContainer);

        // =========================================
        // PROPELLER (Z-Index 15 - BEHIND DASHBOARD)
        // =========================================
        const prop = document.createElement('div');
        prop.style.cssText = `
            position: absolute; bottom: 32%; left: 50%; transform: translate(-50%, 50%);
            width: 70vh; height: 70vh; 
            animation: flight-prop-spin 0.15s linear infinite;
            z-index: 15; /* Behind cockpit (20) */
        `;
        prop.innerHTML = `
            <svg viewBox="0 0 200 200" style="width: 100%; height: 100%; overflow: visible;">
                <circle cx="100" cy="100" r="90" fill="url(#propBlur)" opacity="0.2"/>
                <defs><radialGradient id="propBlur"><stop offset="0%" stop-color="transparent"/><stop offset="100%" stop-color="white"/></radialGradient></defs>
                <path d="M96,100 L92,30 Q100,10 108,30 L104,100 Z" fill="#222" stroke="black" stroke-width="3" stroke-linejoin="round" />
                <path d="M92,30 Q100,10 108,30 L107,38 L93,38 Z" fill="#ffeb3b" stroke="black" stroke-width="2" stroke-linejoin="round" />
                <path d="M96,100 L92,170 Q100,190 108,170 L104,100 Z" fill="#222" stroke="black" stroke-width="3" stroke-linejoin="round" />
                <path d="M92,170 Q100,190 108,170 L107,162 L93,162 Z" fill="#ffeb3b" stroke="black" stroke-width="2" stroke-linejoin="round" />
            </svg>
        `;
        c.appendChild(prop);

        // COCKPIT (Z: 20)
        const cockpit = document.createElement('div');
        cockpit.style.cssText = `position: absolute; inset: 0; pointer-events: none; z-index: 20;`;

        const dash = document.createElement('div');
        dash.style.cssText = `position: absolute; bottom: 0; left: 0; width: 100%; height: 40%;`;
        dash.innerHTML = `
            <svg viewBox="0 0 1000 400" preserveAspectRatio="none" style="width: 100%; height: 100%;">
                <defs><linearGradient id="dashMetal" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#37474f"/><stop offset="100%" stop-color="#263238"/></linearGradient></defs>
                <path d="M0,400 L0,100 C100,90 350,90 400,60 C450,40 550,40 600,60 C650,90 900,90 1000,100 L1000,400 Z" fill="url(#dashMetal)" stroke="#102027" stroke-width="4"/>
            </svg>
        `;
        cockpit.appendChild(dash);
        
        // --- INSTRUMENTS: SPREAD LAYOUT ---
        const gauges = document.createElement('div');
        gauges.style.cssText = `
            position: absolute; bottom: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 22;
        `;
        
        const createGauge = (label, color, type) => {
            const g = document.createElement('div');
            g.style.cssText = `width: 90px; height: 90px; border-radius: 50%; background: #111; border: 4px solid #546e7a; position: absolute; box-shadow: inset 0 0 10px #000; overflow: hidden;`;
            if (type === 'horizon') {
                g.innerHTML = `
                    <div id="gauge-horizon-ball" style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: linear-gradient(180deg, #29b6f6 50%, #5d4037 50%); transform: rotate(0deg);"></div>
                    <div style="position: absolute; top: 50%; left: 20%; right: 20%; height: 2px; background: yellow; transform: translateY(-50%); box-shadow: 0 1px 2px #000;"></div>
                    <div style="position: absolute; top: 50%; left: 50%; width: 4px; height: 4px; background: red; border-radius: 50%; transform: translate(-50%, -50%);"></div>
                `;
            } else {
                g.innerHTML = `<div style="position: absolute; bottom: 15px; width: 100%; text-align: center; color: #b0bec5; font-size: 9px; font-weight: bold;">${label}</div>`;
                const needle = document.createElement('div');
                needle.style.cssText = `position: absolute; top: 50%; left: 50%; width: 45%; height: 2px; background: ${color}; transform-origin: 0 50%; transform: rotate(-135deg); transition: transform 0.5s cubic-bezier(0.4, 2.0, 0.4, 1.0); box-shadow: 0 0 4px ${color};`;
                g.appendChild(needle);
                g.needle = needle;
            }
            g.appendChild(document.createElement('div')).style.cssText = `position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%); pointer-events: none;`;
            return g;
        };

const compass = document.createElement('div');
        compass.style.cssText = `position: absolute; bottom: 230px; left: 50%; transform: translateX(-50%); width: 70px; height: 35px; background: #111; border: 3px solid #546e7a; border-radius: 5px; box-shadow: inset 0 0 8px #000; overflow: hidden; z-index: 24;`;
        compass.innerHTML = `
            <div id="compass-tape" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); white-space: nowrap; font-size: 10px; font-weight: bold; color: #b0bec5; font-family: monospace;">
                <span style="color: #ff5722;">N</span>&nbsp;&nbsp;030&nbsp;&nbsp;060&nbsp;&nbsp;<span style="color: #fff;">E</span>&nbsp;&nbsp;120&nbsp;&nbsp;150&nbsp;&nbsp;<span style="color: #ff5722;">S</span>&nbsp;&nbsp;210&nbsp;&nbsp;240&nbsp;&nbsp;<span style="color: #fff;">W</span>&nbsp;&nbsp;300&nbsp;&nbsp;330&nbsp;&nbsp;<span style="color: #ff5722;">N</span>
            </div>
            <div style="position: absolute; top: 0; left: 50%; width: 2px; height: 100%; background: #ffea00; transform: translateX(-50%); box-shadow: 0 0 4px #ffea00;"></div>
            <div style="position: absolute; bottom: 2px; width: 100%; text-align: center; color: #78909c; font-size: 7px;">HDG</div>
        `;
        compass.tape = compass.querySelector('#compass-tape');
        gauges.appendChild(compass);

        // 1. HORIZON (Top Center)
        const att = createGauge("ATT", "", "horizon");
        att.style.bottom = "130px"; 
        att.style.left = "50%";
        att.style.transform = "translateX(-50%)";
        gauges.appendChild(att);

        // 2. SPD (Bottom Left)
        const spd = createGauge("SPD", "#ffea00", "std");
        spd.style.bottom = "20px";
        spd.style.left = "20px";
        gauges.appendChild(spd);

        // 3. ALT (Bottom Right)
        const alt = createGauge("ALT", "#ff1744", "std");
        alt.style.bottom = "20px";
        alt.style.right = "20px";
        gauges.appendChild(alt);

        // 4. LOGO (Bottom Center)
        const logo = document.createElement('div');
        logo.style.cssText = `position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); width: 120px; height: 80px; z-index: 21;`;
        logo.innerHTML = `
            <svg viewBox="0 0 120 80" style="width: 100%; height: 100%; overflow: visible;">
                <defs><linearGradient id="metalFrame" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#78909c"/><stop offset="50%" stop-color="#eceff1"/><stop offset="100%" stop-color="#78909c"/></linearGradient></defs>
                <rect x="4" y="4" width="112" height="72" rx="4" fill="#263238" opacity="0.6" />
                <image href="crying.PNG" x="15" y="15" width="90" height="50" preserveAspectRatio="xMidYMid contain" opacity="0.9"/>
                <rect x="4" y="4" width="112" height="72" rx="4" fill="none" stroke="url(#metalFrame)" stroke-width="5" />
                <g fill="#cfd8dc" stroke="#455a64" stroke-width="1"><circle cx="8" cy="8" r="2.5" /><circle cx="112" cy="8" r="2.5" /><circle cx="8" cy="72" r="2.5" /><circle cx="112" cy="72" r="2.5" /></g>
                <g stroke="#455a64" stroke-width="1"><path d="M6.5,8 L9.5,8 M8,6.5 L8,9.5" /><path d="M110.5,8 L113.5,8 M112,6.5 L112,9.5" /><path d="M6.5,72 L9.5,72 M8,70.5 L8,73.5" /><path d="M110.5,72 L113.5,72 M112,70.5 L112,73.5" /></g>
            </svg>
        `;
        gauges.appendChild(logo);

        // INDICATORS (Above gauges)
        const lightBox = document.createElement('div');
        lightBox.style.cssText = `position: absolute; bottom: 120px; left: 65px; transform: translateX(-50%); width: 20px; height: 20px; border-radius: 50%; background: #222; border: 2px solid #555; box-shadow: 0 0 2px #000; transition: all 0.3s; z-index: 23;`;
        gauges.appendChild(lightBox); // Attached to gauges so it's aligned with SPD

        const connLight = document.createElement('div');
        connLight.style.cssText = `position: absolute; bottom: 120px; right: 65px; transform: translateX(50%); width: 20px; height: 20px; border-radius: 50%; background: #222; border: 2px solid #555; box-shadow: 0 0 2px #000; transition: all 0.3s; z-index: 23;`;
        gauges.appendChild(connLight); // Attached to gauges aligned with ALT

        cockpit.appendChild(gauges);
        c.appendChild(cockpit);

        // WINDSCREEN RAIN (Z: 95) - On glass
        const windscreenRain = document.createElement('div');
        windscreenRain.style.cssText = `position: absolute; inset: 0; pointer-events: none; z-index: 17; overflow: hidden; display: block;`;
        c.appendChild(windscreenRain);

        // WIPER (Z: 16 - Behind Windscreen Rain, In front of Prop)
        const wiper = document.createElement('div');
        wiper.style.cssText = `
            position: absolute; bottom: 40%; left: 50%; width: 0; height: 45vh;
            transform-origin: bottom center; transform: rotate(-50deg);
            z-index: 16; display: block; pointer-events: none;
        `;
        wiper.innerHTML = `<div style="position: absolute; bottom: 0; left: -6px; width: 12px; height: 100%; background: #111; border-radius: 6px; box-shadow: 2px 0 4px rgba(0,0,0,0.5); display: flex; justify-content: center; padding-top: 4px; padding-bottom: 4px;"><div style="width: 2px; height: 100%; background: #666; opacity: 0.8;"></div></div><div style="position: absolute; bottom: -6px; left: -9px; width: 18px; height: 18px; background: #222; border-radius: 50%; border: 2px solid #000; box-shadow: 0 2px 4px rgba(0,0,0,0.8);"></div>`;
        c.appendChild(wiper);

        // --- ANIMATIONS ---
        if(!document.getElementById('flight-anims')) {
            const s = document.createElement('style');
            s.id = 'flight-anims';
            s.innerHTML = `
                @keyframes flight-prop-spin { from { transform: translate(-50%, 50%) rotate(0deg); } to { transform: translate(-50%, 50%) rotate(360deg); } }
                @keyframes flight-wiper-move { 0%, 100% { transform: rotate(-50deg); } 50% { transform: rotate(50deg); } }
                @keyframes flight-streak-fall { 0% { transform: translateY(-100px); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(120vh); opacity: 0; } }
                @keyframes flight-drop-appear { 0% { opacity: 0; transform: scale(0.5); } 100% { opacity: 1; transform: scale(1); } }
                @keyframes flight-drop-streak-right { 0% { opacity: 1; transform: scaleX(1) translateX(0); } 100% { opacity: 0; transform: scaleX(4) translateX(30px); } }
                @keyframes flight-drop-streak-left { 0% { opacity: 1; transform: scaleX(1) translateX(0); } 100% { opacity: 0; transform: scaleX(4) translateX(-30px); } }
                @keyframes fly-approach { 0% { transform: translate(-50%, -50%) scale(0.01); opacity: 0; } 10% { opacity: 1; } 100% { transform: translate(var(--dx), var(--dy)) scale(6); opacity: 1; } }
                /* GROUND SCALING */
                @keyframes ground-obj-pass { 
                    0% { transform: translate(-50%, 0) scale(0.1); opacity: 0; bottom: 100%; } 
                    10% { opacity: 1; } 
                    100% { transform: translate(-50%, 0) scale(8); opacity: 1; bottom: -50px; } 
                }
            `;
            document.head.appendChild(s);
        }

        const horizonBall = document.getElementById('gauge-horizon-ball');
        let flightTime = 0;
        let headingOffset = 0;
        let altitude = 1000;
        let groundY = 0;

        // --- LOGIC LOOP ---
        const logicLoop = () => {
            if(!document.body.contains(c)) return;
            flightTime += 0.005;
            
            // 1. ENGINE POWER
            const block = Math.floor(flightTime / 9.0);
            const targetPower = 0.7 + (Math.sin(block * 123.4) * 0.15); 
            let enginePower = parseFloat(prop.dataset.pwr || 0.7);
            enginePower += (targetPower - enginePower) * 0.01;
            prop.dataset.pwr = enginePower;
            prop.style.animationDuration = `${0.4 - (enginePower * 0.25)}s`;

            // 2. BANK & PITCH (Larger Amplitude)
            const bankCycle = flightTime * 0.15;
            let bank = 0;
            const cyclePos = bankCycle % 1;
            if (cyclePos < 0.2) bank = 0;
            else if (cyclePos < 0.4) bank = -Math.sin(((cyclePos - 0.2) / 0.2) * Math.PI) * 12;
            else if (cyclePos < 0.6) bank = 0;
            else if (cyclePos < 0.8) bank = Math.sin(((cyclePos - 0.6) / 0.2) * Math.PI) * 12;
            
            // Pitch Oscillation (Stronger)
            const pitch = Math.sin(flightTime * 0.5) * 5.0; // +/- 5% translate
            
            // Altitude changes with pitch
            altitude += pitch;
            if (altitude < 0) altitude = 0;
            if (altitude > 2000) altitude = 2000;

            // 3. WORLD TRANSFORMS
            worldContainer.style.transform = `rotate(${-bank}deg) translateY(${pitch}%)`;
            
            // GROUND SPEED (Depends on pitch)
            // Pitch > 0 (Up) -> Slow down. Pitch < 0 (Down) -> Speed up.
            let groundSpeed = 15 - (pitch * 2); 
            groundY += groundSpeed;
            grid.style.backgroundPositionY = `${groundY}px`;

            if (Math.abs(bank) > 0.5) headingOffset += bank * 0.5;
            const farScroll = (headingOffset * -0.5) % 2000; 
            mtnBack.p1.style.transform = `translateX(${farScroll}px)`;
            mtnBack.p2.style.transform = `translateX(${farScroll + 2000}px)`; 
            const nearScroll = (headingOffset * -1) % 2000;
            mtnFront.p1.style.transform = `translateX(${nearScroll}px)`;
            mtnFront.p2.style.transform = `translateX(${nearScroll + 2000}px)`;

            Array.from(distantSky.children).forEach(cloud => {
                let pos = parseFloat(cloud.dataset.pos);
                pos += parseFloat(cloud.dataset.speed);
                if(pos > 110) pos = -10;
                cloud.dataset.pos = pos;
                cloud.style.left = pos + '%';
            });

if (compass.tape) {
                const bearing = ((headingOffset * 0.5) % 360 + 360) % 360;
                const tapeOffset = (bearing / 360) * 280; // Map 360deg to pixel width of tape
                compass.tape.style.transform = `translate(calc(-50% - ${tapeOffset}px), -50%)`;
            }

            // 4. GAUGES
            if (horizonBall) horizonBall.style.transform = `rotate(${-bank}deg) translateY(${pitch * 2}px)`; 
            
            // SPEED PHYSICS + JITTER
            let spdAngle = -135 + (enginePower * 220); 
            spdAngle -= (pitch * 10); // Pitch UP (pos) -> Reduce Angle (Slow). Pitch DOWN -> Increase Angle (Fast)
            spdAngle += (Math.random() * 4 - 2); 
            
            if (spd.needle) {
                spd.needle.style.transition = 'none'; 
                spd.needle.style.transform = `rotate(${spdAngle}deg)`;
            }
            
            const altAngle = -135 + (altitude / 2000 * 270);
            if (alt.needle) alt.needle.style.transform = `rotate(${altAngle}deg)`;

            requestAnimationFrame(logicLoop);
        };
        logicLoop();

        // SPAWNERS
        const spawnObject = () => {
            if(!document.body.contains(c)) return;
            const el = document.createElement('div');
            const isCloud = Math.random() > 0.4;
            const skyEmojis = ['🦅', '🦆', '✈️', '🛸', '🎈'];
            const destX = (Math.random() - 0.5) * 200 + "vw";
            const destY = (Math.random() - 0.2) * 100 + "vh";
            if(isCloud) {
                el.style.cssText = `position: absolute; top: 50%; left: 50%; width: 60px; height: 40px; background: #fff; border-radius: 50px; filter: blur(4px); box-shadow: 15px -8px 0 5px #fff, -15px 5px 0 5px #fff; --dx: ${destX}; --dy: ${destY}; animation: fly-approach 6s linear forwards;`;
            } else {
                el.innerHTML = skyEmojis[Math.floor(Math.random() * skyEmojis.length)];
                el.style.cssText = `position: absolute; top: 50%; left: 50%; font-size: 10px; text-shadow: 0 0 2px rgba(255,255,255,0.5); --dx: ${destX}; --dy: ${destY}; animation: fly-approach 6s linear forwards;`;
            }
            objectContainer.appendChild(el);
            setTimeout(() => el.remove(), 6000);
        };
        this.objectSpawnInterval = setInterval(spawnObject, 3000);

        const spawnGroundObject = () => {
            if(!document.body.contains(c)) return;
            const el = document.createElement('div');
            const types = ['🌲', '🌲', '🪨', '🌳'];
            const type = types[Math.floor(Math.random() * types.length)];
            const leftPos = Math.random() * 100;
            el.innerHTML = type;
            el.style.cssText = `position: absolute; left: ${leftPos}%; font-size: 20px; transform-origin: center bottom; animation: ground-obj-pass 2s ease-in forwards;`;
            groundObjContainer.appendChild(el);
            setTimeout(() => el.remove(), 2000);
        };
        this.groundSpawnInterval = setInterval(spawnGroundObject, 300);

        // WIPER
        let wiperAngle = -50;
        let wiperDir = 1;
        this.wiperInterval = setInterval(() => {
            if (!document.body.contains(c)) return;
            const isRaining = (typeof window.WeatherManager !== 'undefined' && 
                              (window.WeatherManager.isRaining || window.WeatherManager.isSnowing));

            lightBox.style.background = isRaining ? '#00e676' : '#222';
            lightBox.style.boxShadow = isRaining ? '0 0 8px #00e676' : '0 0 2px #000';
            const isOnline = navigator.onLine && !State.data.settings.offlineMode;
            connLight.style.background = isOnline ? '#22c55e' : '#ef4444';
            connLight.style.boxShadow = isOnline ? '0 0 5px #22c55e' : '0 0 5px #ef4444';

            if (isRaining) {
                wiperAngle += wiperDir * 4;
                if (wiperAngle >= 50) wiperDir = -1;
                if (wiperAngle <= -50) wiperDir = 1;
                wiper.style.transform = `rotate(${wiperAngle}deg)`;
                
                if (Math.random() > 0.5) {
                    const streak = document.createElement('div');
                    streak.style.cssText = `position: absolute; left: ${Math.random() * 100}%; top: -40px; width: 2px; height: ${50 + Math.random() * 30}px; background: linear-gradient(180deg, transparent, rgba(200,220,255,0.8), rgba(150,180,220,0.4)); animation: flight-streak-fall 0.5s linear forwards;`;
                    externalRainContainer.appendChild(streak);
                    setTimeout(() => streak.remove(), 500);
                    if (windscreenRain.children.length < 50) {
                        const drop = document.createElement('div');
                        drop.className = 'rain-drop-glass';
                        const size = 5 + Math.random() * 6;
                        const x = 5 + Math.random() * 90;
                        const y = 5 + Math.random() * 45;
                        drop.style.cssText = `position: absolute; left: ${x}%; top: ${y}%; width: ${size}px; height: ${size * 1.1}px; background: radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.9), rgba(180,210,255,0.6), rgba(100,150,220,0.3)); border-radius: 50%; opacity: 0; box-shadow: 0 0 2px rgba(255,255,255,0.7); animation: flight-drop-appear 0.15s ease-out forwards;`;
                        drop.dataset.x = x;
                        windscreenRain.appendChild(drop);
                    }
                }
                const drops = windscreenRain.querySelectorAll('.rain-drop-glass:not(.clearing)');
                drops.forEach(drop => {
                    const dropX = parseFloat(drop.dataset.x);
                    const dropAngle = (dropX - 50) * 1.4;
                    if (Math.abs(wiperAngle - dropAngle) < 5) {
                        drop.classList.add('clearing');
                        drop.style.animation = wiperDir > 0 ? 'flight-drop-streak-right 0.3s ease-out forwards' : 'flight-drop-streak-left 0.3s ease-out forwards';
                        setTimeout(() => drop.remove(), 300);
                    }
                });

                if (distantSky.children.length < 25 && Math.random() > 0.7) {
                    const cloud = document.createElement('div');
                    cloud.innerText = '☁️';
                    cloud.style.cssText = `position: absolute; top: ${30 + Math.random() * 15}%; left: -10%; font-size: ${40 + Math.random() * 40}px; opacity: 0.9; filter: blur(2px) grayscale(90%) brightness(60%); transition: left 1s linear; color: #333;`;
                    cloud.dataset.speed = 0.05 + Math.random() * 0.05;
                    cloud.dataset.pos = -10;
                    distantSky.appendChild(cloud);
                }
            } else {
                if (Math.abs(wiperAngle - -50) > 2) {
                    wiperAngle -= 2;
                    wiper.style.transform = `rotate(${wiperAngle}deg)`;
                }
            }
        }, 60);
    },

    // --- VARIABLES RESTORED FOR OCEAN ---
    oceanTimeout: null,
    oceanObjects: [],

    getMoonPhase() {
        const date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        const day = date.getDate();
        if (month < 3) { year--; month += 12; }
        month++;
        const c = 365.25 * year;
        const e = 30.6 * month;
        let jd = c + e + day - 694039.09;
        jd /= 29.5305882;
        const b = Math.floor(jd);
        jd -= b;
        const phase = Math.round(jd * 8);
        return phase >= 8 ? 0 : phase;
    },

    ocean(active) {
        let c = DOM.theme.effects.ocean;
        if (!c) {
            c = document.createElement('div');
            c.id = 'ocean-effect';
            c.className = 'fixed inset-0 pointer-events-none overflow-hidden z-0';
            document.body.appendChild(c);
            DOM.theme.effects.ocean = c;
        }
        if (this.oceanTimeout) clearTimeout(this.oceanTimeout);
        this.oceanObjects.forEach(obj => obj.remove());
        this.oceanObjects = [];
        if (!active) { c.innerHTML = ''; c.style.background = ''; return; }
        c.innerHTML = '';
        const hour = new Date().getHours();
        const minutes = new Date().getMinutes();
        const timeDecimal = hour + minutes / 60;
        const isNight = hour >= 20 || hour < 6;
        const isEvening = (hour >= 17 && hour < 20) || (hour >= 6 && hour < 8);
        const moonPhase = this.getMoonPhase();
        let bodyX, bodyY;
        if (isNight) {
            const nightProgress = hour >= 20 ? (hour - 20 + minutes/60) / 10 : (hour + 4 + minutes/60) / 10;
            bodyX = 15 + nightProgress * 70;
            bodyY = 15 + Math.sin(nightProgress * Math.PI) * -10;
        } else {
            if (timeDecimal < 6) {
                bodyX = 10; bodyY = 38;
            } else if (timeDecimal > 18) {
                bodyX = 90; bodyY = 38;
            } else {
                bodyX = 10 + ((timeDecimal - 6) / 12) * 80;
                const noon = 12;
                const distFromNoon = Math.abs(timeDecimal - noon);
                bodyY = 10 + (distFromNoon / 6) * 28;
            }
        }
        let skyGradient;
        if (isNight) {
            skyGradient = 'linear-gradient(180deg, #0a0a1a 0%, #1a1a3a 20%, #2a3a5a 40%, #1a3050 48%, #0f2840 55%, #0a1828 75%, #051018 100%)';
        } else if (isEvening) {
            skyGradient = 'linear-gradient(180deg, #1a2a4a 0%, #c44536 15%, #f7b267 35%, #87CEEB 45%, #2a5a8a 50%, #1a4a7a 65%, #0f3050 85%, #0a2030 100%)';
        } else {
            skyGradient = 'linear-gradient(180deg, #4a90c2 0%, #87CEEB 20%, #a8d4ea 40%, #87CEEB 47%, #2a6a9a 50%, #1a5080 60%, #0f3a60 80%, #0a2840 100%)';
        }
        c.style.background = skyGradient;
        if (isNight) {
            const moon = document.createElement('div');
            moon.style.cssText = `
                position: absolute;
                top: ${bodyY}%;
                left: ${bodyX}%;
                transform: translate(-50%, -50%);
                width: 45px;
                height: 45px;
                border-radius: 50%;
                box-shadow: 0 0 30px rgba(255,255,240,0.5), 0 0 60px rgba(255,255,240,0.3);
                z-index: 2;
                overflow: hidden;
            `;
            let moonGradient;
            if (moonPhase === 0) {
                moonGradient = 'radial-gradient(circle at 50% 50%, #3a3a3a 0%, #2a2a2a 100%)';
            } else if (moonPhase === 4) {
                moonGradient = 'radial-gradient(circle at 35% 35%, #fffef0 0%, #f0f0e0 50%, #d8d8c8 100%)';
            } else if (moonPhase < 4) {
                const litPercent = moonPhase * 25;
                moonGradient = `linear-gradient(90deg, #2a2a2a 0%, #2a2a2a ${50 - litPercent}%, #d8d8c8 ${50 - litPercent + 10}%, #fffef0 100%)`;
            } else {
                const litPercent = (8 - moonPhase) * 25;
                moonGradient = `linear-gradient(90deg, #fffef0 0%, #d8d8c8 ${litPercent - 10}%, #2a2a2a ${litPercent}%, #2a2a2a 100%)`;
            }
            moon.style.background = moonGradient;
            c.appendChild(moon);
            const reflectionContainer = document.createElement('div');
            reflectionContainer.className = 'ocean-reflection-container';
            reflectionContainer.style.cssText = `
                position: absolute;
                top: 49%;
                left: ${bodyX}%;
                transform: translateX(-50%);
                width: 100px;
                height: 50%;
                z-index: 9;
                overflow: visible;
            `;
            for (let r = 0; r < 18; r++) {
                const segment = document.createElement('div');
                const yOffset = r * 5.5;
                const baseWidth = 4 + r * 3;
                const width = baseWidth + Math.random() * (r * 2);
                const xOffset = (Math.random() - 0.5) * (10 + r * 3);
                segment.style.cssText = `
                    position: absolute;
                    top: ${yOffset}%;
                    left: 50%;
                    transform: translateX(calc(-50% + ${xOffset}px));
                    width: ${width}px;
                    height: ${2 + Math.random() * 2}%;
                    background: rgba(255,255,250,${0.9 - r * 0.04});
                    border-radius: 50%;
                    animation: reflection-segment ${0.6 + Math.random() * 0.6}s ease-in-out infinite;
                    animation-delay: ${Math.random() * 0.5}s;
                `;
                reflectionContainer.appendChild(segment);
            }
            c.appendChild(reflectionContainer);
            for (let i = 0; i < 50; i++) {
                const star = document.createElement('div');
                star.style.cssText = `
                    position: absolute;
                    top: ${Math.random() * 45}%;
                    left: ${Math.random() * 100}%;
                    width: ${1 + Math.random() * 2}px;
                    height: ${1 + Math.random() * 2}px;
                    background: white;
                    border-radius: 50%;
                    opacity: ${0.3 + Math.random() * 0.7};
                    animation: star-twinkle ${2 + Math.random() * 3}s ease-in-out infinite;
                    animation-delay: ${Math.random() * 2}s;
                `;
                c.appendChild(star);
            }
        } else {
            const sun = document.createElement('div');
            const sunColor = isEvening ? '#ff6b35' : '#FFD700';
            sun.style.cssText = `
                position: absolute;
                top: ${bodyY}%;
                left: ${bodyX}%;
                transform: translate(-50%, -50%);
                width: 50px;
                height: 50px;
                background: radial-gradient(circle, #fff8e0 0%, ${sunColor} 50%, ${isEvening ? '#c44536' : '#FFA500'} 100%);
                border-radius: 50%;
                box-shadow: 0 0 60px ${sunColor}, 0 0 100px ${sunColor}80;
                z-index: 2;
            `;
            c.appendChild(sun);
            const reflectionContainer = document.createElement('div');
            reflectionContainer.className = 'ocean-reflection-container';
            reflectionContainer.style.cssText = `
                position: absolute;
                top: 49%;
                left: ${bodyX}%;
                transform: translateX(-50%);
                width: 120px;
                height: 50%;
                z-index: 9;
                overflow: visible;
            `;
            const golden = isEvening ? [255, 150, 50] : [255, 215, 0];
            for (let r = 0; r < 20; r++) {
                const segment = document.createElement('div');
                const yOffset = r * 5;
                const baseWidth = 5 + r * 4;
                const width = baseWidth + Math.random() * (r * 2.5);
                const xOffset = (Math.random() - 0.5) * (12 + r * 4);
                segment.style.cssText = `
                    position: absolute;
                    top: ${yOffset}%;
                    left: 50%;
                    transform: translateX(calc(-50% + ${xOffset}px));
                    width: ${width}px;
                    height: ${2 + Math.random() * 2}%;
                    background: rgba(${golden[0]},${golden[1]},${golden[2]},${0.95 - r * 0.04});
                    border-radius: 50%;
                    animation: reflection-segment ${0.5 + Math.random() * 0.5}s ease-in-out infinite;
                    animation-delay: ${Math.random() * 0.4}s;
                `;
                reflectionContainer.appendChild(segment);
            }
            c.appendChild(reflectionContainer);
        }
        const waveColors = isNight 
            ? ['#0a1e3a', '#0c2444', '#0e2a4e', '#102f55']
            : ['#1a5a8a', '#2a6a9a', '#3a7aaa', '#4a8aba'];
        for (let i = 0; i < 4; i++) {
            const waveWrapper = document.createElement('div');
            waveWrapper.style.cssText = `
                position: absolute;
                top: ${46 + i * 8}%;
                left: 0;
                right: 0;
                height: ${58 - i * 10}%;
                z-index: ${4 + i};
                overflow: hidden;
            `;
            const waveContainer = document.createElement('div');
            const waveAmplitude = 2 + i * 6;
            waveContainer.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 200%;
                height: 100%;
                animation: wave-seamless-${i} ${20 - i * 3}s linear infinite;
            `;
            const baseY = 25;
            waveContainer.innerHTML = `
                <svg viewBox="0 0 2000 200" preserveAspectRatio="none" style="width: 100%; height: 100%;">
                    <defs>
                        <linearGradient id="waveGrad${i}" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:${waveColors[i]};stop-opacity:0.98"/>
                            <stop offset="100%" style="stop-color:${isNight ? '#050d18' : '#0a2840'};stop-opacity:1"/>
                        </linearGradient>
                    </defs>
                    <path d="M0,${baseY} 
                        C50,${baseY - waveAmplitude} 100,${baseY + waveAmplitude} 150,${baseY}
                        C200,${baseY - waveAmplitude * 0.8} 250,${baseY + waveAmplitude} 300,${baseY}
                        C350,${baseY - waveAmplitude * 1.1} 400,${baseY + waveAmplitude * 0.9} 450,${baseY}
                        C500,${baseY - waveAmplitude} 550,${baseY + waveAmplitude * 1.1} 600,${baseY}
                        C650,${baseY - waveAmplitude * 0.9} 700,${baseY + waveAmplitude} 750,${baseY}
                        C800,${baseY - waveAmplitude * 1.1} 850,${baseY + waveAmplitude * 0.8} 900,${baseY}
                        C950,${baseY - waveAmplitude} 1000,${baseY + waveAmplitude} 1050,${baseY}
                        C1100,${baseY - waveAmplitude * 0.8} 1150,${baseY + waveAmplitude} 1200,${baseY}
                        C1250,${baseY - waveAmplitude * 1.1} 1300,${baseY + waveAmplitude * 0.9} 1350,${baseY}
                        C1400,${baseY - waveAmplitude} 1450,${baseY + waveAmplitude * 1.1} 1500,${baseY}
                        C1550,${baseY - waveAmplitude * 0.9} 1600,${baseY + waveAmplitude} 1650,${baseY}
                        C1700,${baseY - waveAmplitude * 1.1} 1750,${baseY + waveAmplitude * 0.8} 1800,${baseY}
                        C1850,${baseY - waveAmplitude} 1900,${baseY + waveAmplitude} 1950,${baseY}
                        L2000,${baseY} L2000,200 L0,200 Z" 
                        fill="url(#waveGrad${i})"/>
                </svg>
            `;
            waveWrapper.appendChild(waveContainer);
            c.appendChild(waveWrapper);
        }
        for (let f = 0; f < 10; f++) {
            const foam = document.createElement('div');
            foam.style.cssText = `
                position: absolute;
                top: ${72 + Math.random() * 22}%;
                left: ${Math.random() * 100}%;
                width: ${20 + Math.random() * 60}px;
                height: ${3 + Math.random() * 4}px;
                background: rgba(255,255,255,${0.25 + Math.random() * 0.35});
                border-radius: 50%;
                filter: blur(1px);
                animation: foam-drift ${6 + Math.random() * 8}s linear infinite;
                animation-delay: ${Math.random() * 4}s;
                z-index: 18;
            `;
            c.appendChild(foam);
        }
        const oldStyle = document.getElementById('ocean-style');
        if (oldStyle) oldStyle.remove();
        const style = document.createElement('style');
        style.id = 'ocean-style';
        style.textContent = `
            @keyframes wave-seamless-0 {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
            }
            @keyframes wave-seamless-1 {
                0% { transform: translateX(-50%); }
                100% { transform: translateX(0); }
            }
            @keyframes wave-seamless-2 {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
            }
            @keyframes wave-seamless-3 {
                0% { transform: translateX(-50%); }
                100% { transform: translateX(0); }
            }
            @keyframes foam-drift {
                0% { transform: translateX(0) scale(1); opacity: 0.5; }
                50% { transform: translateX(-30px) scale(1.2); opacity: 0.8; }
                100% { transform: translateX(-60px) scale(0.8); opacity: 0; }
            }
            @keyframes reflection-shimmer {
                0%, 100% { 
                    opacity: 1; 
                    transform: translateX(-50%) scaleX(1) scaleY(1);
                }
                25% { 
                    opacity: 0.6; 
                    transform: translateX(-50%) scaleX(2) scaleY(0.95);
                }
                50% { 
                    opacity: 0.9; 
                    transform: translateX(-50%) scaleX(0.5) scaleY(1.02);
                }
                75% { 
                    opacity: 0.7; 
                    transform: translateX(-50%) scaleX(1.5) scaleY(0.98);
                }
            }
            @keyframes reflection-segment {
                0%, 100% { 
                    opacity: 0.3;
                    transform: translateX(calc(-50% + var(--x-off, 0px))) scaleX(0.8);
                }
                50% { 
                    opacity: 1;
                    transform: translateX(calc(-50% + var(--x-off, 0px))) scaleX(1.5);
                }
            }
            .ocean-reflection {
                animation: reflection-shimmer 2.5s ease-in-out infinite;
            }
            @keyframes star-twinkle {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 1; }
            }
            @keyframes boat-bob {
                0%, 100% { transform: translateY(0) rotate(-1deg); }
                25% { transform: translateY(-4px) rotate(1.5deg); }
                50% { transform: translateY(-2px) rotate(-0.5deg); }
                75% { transform: translateY(-6px) rotate(2deg); }
            }
            @keyframes boat-bob-large {
                0%, 100% { transform: translateY(0) rotate(-3deg); }
                25% { transform: translateY(-10px) rotate(4deg); }
                50% { transform: translateY(-5px) rotate(-2deg); }
                75% { transform: translateY(-15px) rotate(5deg); }
            }
            @keyframes boat-drift {
                from { left: -100px; }
                to { left: calc(100% + 100px); }
            }
            @keyframes boat-drift-reverse {
                from { left: calc(100% + 100px); }
                to { left: -100px; }
            }
            @keyframes seagull-fly {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
        `;
        document.head.appendChild(style);
        const boats = ['⛵', '🚤', '🛥️', '🚢', '⛴️', '🛶'];
        const spawnBoat = () => {
            if (!c.isConnected) return;
            const boat = document.createElement('div');
            const boatEmoji = boats[Math.floor(Math.random() * boats.length)];
            const goingRight = Math.random() > 0.5;
            const depthRoll = Math.random();
            let yPos, size, duration, zIndex, bobAnimation;
            if (depthRoll < 0.35) {
                yPos = 47 + Math.random() * 2;
                size = 8 + Math.random() * 5;
                duration = 90 + Math.random() * 50;
                zIndex = 8;
                bobAnimation = 'boat-bob 5s ease-in-out infinite';
            } else if (depthRoll < 0.7) {
                yPos = 54 + Math.random() * 10;
                size = 20 + Math.random() * 18;
                duration = 55 + Math.random() * 35;
                zIndex = 12;
                bobAnimation = 'boat-bob 3.5s ease-in-out infinite';
            } else {
                yPos = 70 + Math.random() * 18;
                size = 55 + Math.random() * 40;
                duration = 20 + Math.random() * 15;
                zIndex = 25;
                bobAnimation = 'boat-bob-large 2s ease-in-out infinite';
            }
            boat.textContent = boatEmoji;
            boat.style.cssText = `
                position: absolute;
                top: ${yPos}%;
                font-size: ${size}px;
                z-index: ${zIndex};
                opacity: ${size < 15 ? 0.6 : 1};
                animation: 
                    ${goingRight ? 'boat-drift' : 'boat-drift-reverse'} ${duration}s linear forwards,
                    ${bobAnimation};
                filter: drop-shadow(2px 3px ${Math.floor(size/10) + 2}px rgba(0,0,0,0.4));
                ${goingRight ? 'transform: scaleX(-1);' : ''}
            `;
            c.appendChild(boat);
            this.oceanObjects.push(boat);
            setTimeout(() => boat.remove(), duration * 1000);
            this.oceanTimeout = setTimeout(spawnBoat, 2500 + Math.random() * 5000);
        };
        const spawnSeagull = () => {
            if (!c.isConnected || isNight) return;
            const bird = document.createElement('div');
            bird.textContent = '🕊️';
            const yPos = 15 + Math.random() * 50; // More vertical range
            const duration = 8 + Math.random() * 8;
            const goingRight = Math.random() > 0.5;
            const size = 28 + Math.random() * 32; // Much larger: 28-60px
            bird.style.cssText = `
                position: absolute;
                top: ${yPos}%;
                left: ${goingRight ? '-80px' : 'calc(100% + 80px)'};
                font-size: ${size}px;
                z-index: 150;
                animation: 
                    ${goingRight ? 'boat-drift' : 'boat-drift-reverse'} ${duration}s linear forwards,
                    seagull-fly 0.4s ease-in-out infinite;
                filter: drop-shadow(3px 5px 8px rgba(0,0,0,0.4));
                ${goingRight ? 'transform: scaleX(-1);' : ''}
            `;
            c.appendChild(bird);
            this.oceanObjects.push(bird);
            setTimeout(() => bird.remove(), duration * 1000);
            setTimeout(spawnSeagull, 5000 + Math.random() * 8000);
        };
        this.oceanTimeout = setTimeout(spawnBoat, 1000);
        if (!isNight) setTimeout(spawnSeagull, 3000);
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
            const width = 400;
            const height = 580;
            canvas.width = width;
            canvas.height = height;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);
            ctx.textAlign = 'center';
            ctx.font = '900 36px Inter, system-ui, sans-serif';
            ctx.fillStyle = type === 'good' ? '#16a34a' : '#dc2626';
            ctx.fillText(type === 'good' ? "GOOD WORD!" : "BAD WORD!", width / 2, 50);
            ctx.drawImage(qrImg, 0, 60, 400, 400);
            ctx.font = 'bold 16px sans-serif';
            ctx.fillStyle = '#9ca3af'; // Light grey
            ctx.fillText('Word:', width / 2, 485);
            ctx.fillStyle = '#1f2937'; // Dark Grey
            ctx.font = '900 40px Inter, system-ui, sans-serif';
            const textWidth = ctx.measureText(word).width;
            if (textWidth > 360) {
                const scale = 360 / textWidth;
                ctx.font = `900 ${Math.floor(40 * scale)}px Inter, system-ui, sans-serif`;
            }
            ctx.fillText(word, width / 2, 530);
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
        const grd = ctx.createLinearGradient(0, 0, 0, height);
        grd.addColorStop(0, "#fce7f3"); // light pink
        grd.addColorStop(1, "#fbcfe8"); // slightly darker pink
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = "#db2777"; // pink-600
        ctx.lineWidth = 8;
        ctx.strokeRect(10, 10, width-20, height-20);
        ctx.strokeStyle = "#fdf2f8"; // white inner line
        ctx.lineWidth = 4;
        ctx.strokeRect(18, 18, width-36, height-36);
        ctx.fillStyle = "#be185d"; // pink-700
        ctx.font = "900 24px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("OFFICIAL COMPATIBILITY REPORT", width/2, 60);
        ctx.fillStyle = "#1f2937"; // dark gray
        ctx.font = "bold 32px system-ui, sans-serif";
        ctx.fillText(`${p1}  💕  ${p2}`, width/2, 120);
        ctx.fillStyle = "#db2777"; // pink-600
        ctx.font = "900 140px system-ui, sans-serif";
        ctx.fillText(`${score}%`, width/2, 260);
        ctx.fillStyle = "#6b7280"; // gray-500
        ctx.font = "bold 22px system-ui, sans-serif";
        ctx.fillText(`Matched ${matches || 0} of ${totalRounds || 0} words`, width/2, 310);
        ctx.fillStyle = "#9d174d";
        ctx.font = "bold 18px system-ui, sans-serif";
        ctx.fillText("Certified by OK Stoopid (GBword.com)", width/2, 400);
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
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const width = 600;
        const height = 400;
        canvas.width = width;
        canvas.height = height;
        
        // Background gradient
        const grd = ctx.createLinearGradient(0, 0, 0, height);
        grd.addColorStop(0, "#4f46e5"); // indigo
        grd.addColorStop(1, "#7c3aed"); // purple
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, width, height);
        
        // Border
        ctx.strokeStyle = "#818cf8";
        ctx.lineWidth = 6;
        ctx.strokeRect(10, 10, width - 20, height - 20);
        
        // Get user data
        const d = State.data;
        const username = d.username || "Player";
        const votes = d.voteCount || 0;
        const contributions = d.contributorCount || 0;
        const streak = Math.max(parseInt(d.longestStreak) || 0, parseInt(d.daily?.bestStreak) || 0);
        const themes = (d.unlockedThemes?.length || 0) + 1;
        const badges = Object.values(d.badges || {}).filter(b => b).length;
        
        // Title
        ctx.fillStyle = "#ffffff";
        ctx.font = "900 28px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("GOOD WORD / BAD WORD", width / 2, 50);
        
        // Username
        ctx.font = "bold 24px system-ui, sans-serif";
        ctx.fillStyle = "#fbbf24";
        ctx.fillText(`${username}'s Stats`, width / 2, 90);
        
        // Stats
        ctx.font = "bold 20px system-ui, sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "left";
        const startX = 80;
        const startY = 140;
        const lineHeight = 45;
        
        const stats = [
            { icon: "⚖️", label: "Total Votes", value: votes.toLocaleString() },
            { icon: "🔥", label: "Best Streak", value: streak.toString() },
            { icon: "✍️", label: "Words Added", value: contributions.toString() },
            { icon: "🎨", label: "Themes Unlocked", value: themes.toString() },
            { icon: "🏆", label: "Badges Earned", value: badges.toString() }
        ];
        
        stats.forEach((stat, i) => {
            const y = startY + (i * lineHeight);
            ctx.font = "28px system-ui";
            ctx.fillText(stat.icon, startX, y);
            ctx.font = "bold 18px system-ui, sans-serif";
            ctx.fillStyle = "#c7d2fe";
            ctx.fillText(stat.label + ":", startX + 45, y);
            ctx.fillStyle = "#ffffff";
            ctx.font = "900 22px system-ui, sans-serif";
            ctx.fillText(stat.value, startX + 220, y);
        });
        
        // Footer
        ctx.textAlign = "center";
        ctx.font = "16px system-ui, sans-serif";
        ctx.fillStyle = "#a5b4fc";
        ctx.fillText("GBword.com", width / 2, height - 25);
        
        return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    },
    async share() {
        UIManager.showPostVoteMessage("Generating image... 📸");
        try {
            const blob = await this.generateImage();
            if (!blob) {
                UIManager.showPostVoteMessage("Could not generate image.");
                return;
            }
            
            const file = new File([blob], 'my_gbword_stats.png', { type: 'image/png' });
            const username = State.data.username || "I";
            const votes = State.data.voteCount || 0;
            
            const shareData = {
                title: 'My Good Word / Bad Word Stats',
                text: `${username} has cast ${votes.toLocaleString()} votes on Good Word / Bad Word! 🎮 Play at GBword.com`,
                files: [file]
            };
            
            if (navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
                UIManager.showPostVoteMessage("Shared! 🎉");
            } else if (navigator.share) {
                // Try sharing without file
                await navigator.share({
                    title: 'My Good Word / Bad Word Stats',
                    text: `${username} has cast ${votes.toLocaleString()} votes on Good Word / Bad Word! 🎮 Play at GBword.com`,
                    url: window.location.origin
                });
                UIManager.showPostVoteMessage("Shared! 🎉");
            } else {
                // Fallback: download the image
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'my_gbword_stats.png';
                a.click();
                UIManager.showPostVoteMessage("Stats image downloaded! 📥");
            }
        } catch (e) {
            console.error(e);
            if (e.name !== 'AbortError') {
                UIManager.showPostVoteMessage("Could not share stats.");
            }
        }
    }
};
const MiniGames = {
    // ==================== SHARED SCORING HELPER ====================
    scoreHelper: {
        // Prompt user for initials and save score
        promptAndSave(gameId, score, options = {}) {
            const {
                title = 'HIGH SCORE!',
                subtitle = '',
                bgGradient = 'from-indigo-600 to-purple-700',
                borderColor = 'border-yellow-400',
                inputBorderColor = 'border-purple-300',
                buttonTextColor = 'text-purple-900',
                localStorageKey = null,
                stateKey = null,
                cabinetIndex = 0,
                onComplete = null
            } = options;
            
            const html = `
                <div id="mgScoreEntry" class="fixed inset-0 bg-black/90 z-[10002] flex items-start justify-center p-4 pt-8 sm:items-center sm:pt-4 overflow-y-auto">
                    <div class="bg-gradient-to-br ${bgGradient} p-6 sm:p-8 rounded-2xl text-center max-w-sm w-full shadow-2xl border-4 ${borderColor} mb-4">
                        <div class="text-4xl mb-2">🏆</div>
                        <h2 class="text-2xl font-black text-white mb-1">${title}</h2>
                        <p class="text-white/80 mb-2">${subtitle}</p>
                        <p class="text-4xl font-black text-yellow-400 mb-4">${score}</p>
                        <p class="text-white/70 text-sm mb-2">Enter your initials:</p>
                        <input type="text" id="mgNameInput" maxlength="3" placeholder="AAA"
                            class="text-3xl text-center w-full tracking-widest border-4 ${inputBorderColor} rounded-xl p-3 uppercase font-black mb-4 bg-white/90">
                        <button id="mgSaveScore" class="w-full py-3 bg-yellow-400 hover:bg-yellow-300 ${buttonTextColor} font-black text-lg rounded-xl transition">
                            SAVE SCORE
                        </button>
                    </div>
                </div>`;
            
            document.body.insertAdjacentHTML('beforeend', html);
            
            const input = document.getElementById('mgNameInput');
            const defaultInitials = (State.data.username || 'AAA').substring(0, 3).toUpperCase();
            input.value = defaultInitials;
            input.focus();
            input.select();
            
            // Only allow letters
            input.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase();
            });
            
            const saveScore = () => {
                const name = (input.value || 'AAA').toUpperCase().padEnd(3, 'A').substring(0, 3);
                
                // Save to local storage
                if (localStorageKey) {
                    localStorage.setItem(localStorageKey, score);
                }
                
                // Save to State
                if (stateKey) {
                    const scores = State.data[stateKey] || [];
                    scores.push({ name, score, date: new Date().toISOString() });
                    scores.sort((a, b) => b.score - a.score);
                    State.save(stateKey, scores.slice(0, 10));
                }
                
                // Submit to global leaderboard
                API.submitMiniGameScore(gameId, name, score);
                
                // Remove entry modal
                document.getElementById('mgScoreEntry').remove();
                
                // Callback or return to arcade
                if (onComplete) {
                    onComplete();
                } else {
                    // Return to arcade on appropriate cabinet
                    setTimeout(() => {
                        if (typeof StreakManager !== 'undefined' && StreakManager.showLeaderboard) {
                            StreakManager.showLeaderboard(cabinetIndex);
                        }
                    }, 100);
                }
            };
            
            document.getElementById('mgSaveScore').onclick = saveScore;
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') saveScore();
            });
        },
        
        // Check if score qualifies for high score entry
        qualifiesForHighScore(score, stateKey, minScore = 1) {
            if (score < minScore) return false;
            const scores = State.data[stateKey] || [];
            if (scores.length < 10) return true;
            const lowestScore = scores[scores.length - 1].score;
            return score > lowestScore;
        },
        
        // Get best score from state
        getBestScore(stateKey) {
            const scores = State.data[stateKey] || [];
            return scores.length > 0 ? scores[0].score : 0;
        }
    },
    
    // ==================== WORD WAR (Higher or Lower) ====================
    wordWar: {
        active: false,
        streak: 0,
        bestStreak: 0,
        wordA: null,
        wordB: null,
        
        start() {
            this.active = true;
            this.streak = 0;
            this.bestStreak = MiniGames.scoreHelper.getBestScore('wordWarScores');
            this.showRound();
        },
        
        getRandomWord() {
            const words = State.runtime.allWords.filter(w => (w.goodVotes + w.badVotes) >= 5);
            if (words.length < 10) return State.runtime.allWords[Math.floor(Math.random() * State.runtime.allWords.length)];
            return words[Math.floor(Math.random() * words.length)];
        },
        
        getScore(word) {
            return (word.goodVotes || 0) - (word.badVotes || 0);
        },
        
        getApproval(word) {
            const total = (word.goodVotes || 0) + (word.badVotes || 0);
            if (total === 0) return 50;
            return Math.round(((word.goodVotes || 0) / total) * 100);
        },
        
        showRound() {
            // Get two different words
            this.wordA = this.getRandomWord();
            do {
                this.wordB = this.getRandomWord();
            } while (this.wordB._id === this.wordA._id);
            
            const scoreA = this.getScore(this.wordA);
            const approvalA = this.getApproval(this.wordA);
            const approvalB = this.getApproval(this.wordB);
            
            const html = `
                <div id="wordWarModal" class="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 z-[10000] flex items-center justify-center p-4">
                    <div class="w-full max-w-2xl">
                        <div class="text-center mb-6">
                            <h2 class="text-3xl font-black text-white mb-2">⚔️ WORD WAR ⚔️</h2>
                            <p class="text-purple-200">Which word has a HIGHER approval rating?</p>
                            <div class="flex justify-center gap-6 mt-3">
                                <div class="text-yellow-400 font-bold">🔥 Streak: ${this.streak}</div>
                                <div class="text-purple-300 font-bold">👑 Best: ${this.bestStreak}</div>
                            </div>
                        </div>
                        
                        <div class="flex flex-col md:flex-row gap-4 items-stretch">
                            <!-- Word A (Score Revealed) -->
                            <div class="flex-1 bg-white/10 backdrop-blur rounded-2xl p-6 text-center border-2 border-white/20">
                                <div class="text-sm text-purple-300 mb-2 font-bold">REVEALED</div>
                                <h3 class="text-2xl md:text-3xl font-black text-white mb-4">${this.wordA.text.toUpperCase()}</h3>
                                <div class="text-5xl font-black ${scoreA >= 0 ? 'text-green-400' : 'text-red-400'} mb-2">${approvalA}%</div>
                                <div class="text-purple-300 text-sm">Approval Rating</div>
                            </div>
                            
                            <div class="flex items-center justify-center text-4xl font-black text-white/50">VS</div>
                            
                            <!-- Word B (Score Hidden) -->
                            <div class="flex-1 bg-white/10 backdrop-blur rounded-2xl p-6 text-center border-2 border-yellow-400/50">
                                <div class="text-sm text-yellow-400 mb-2 font-bold">MYSTERY</div>
                                <h3 class="text-2xl md:text-3xl font-black text-white mb-4">${this.wordB.text.toUpperCase()}</h3>
                                <div class="text-5xl font-black text-yellow-400 mb-2">?%</div>
                                <div class="text-purple-300 text-sm">Guess if Higher or Lower!</div>
                            </div>
                        </div>
                        
                        <div class="flex gap-4 mt-6 justify-center">
                            <button id="wwHigher" class="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-black text-xl rounded-xl transition transform hover:scale-105 shadow-lg">
                                📈 HIGHER
                            </button>
                            <button id="wwLower" class="px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-black text-xl rounded-xl transition transform hover:scale-105 shadow-lg">
                                📉 LOWER
                            </button>
                        </div>
                        
                        <button id="wwClose" class="mt-6 w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition">
                            ✕ Exit Game
                        </button>
                    </div>
                </div>`;
            
            // Remove existing modal if any
            const existing = document.getElementById('wordWarModal');
            if (existing) existing.remove();
            
            document.body.insertAdjacentHTML('beforeend', html);
            
            document.getElementById('wwHigher').onclick = () => this.guess('higher');
            document.getElementById('wwLower').onclick = () => this.guess('lower');
            document.getElementById('wwClose').onclick = () => this.close();
        },
        
        guess(choice) {
            const approvalA = this.getApproval(this.wordA);
            const approvalB = this.getApproval(this.wordB);
            
            const isHigher = approvalB > approvalA;
            const isEqual = approvalB === approvalA;
            const correct = isEqual || (choice === 'higher' && isHigher) || (choice === 'lower' && !isHigher);
            
            if (correct) {
                this.streak++;
                if (this.streak > this.bestStreak) {
                    this.bestStreak = this.streak;
                    localStorage.setItem('wordWarBest', this.bestStreak);
                }
                this.showResult(true, approvalB);
            } else {
                this.showResult(false, approvalB);
            }
        },
        
        showResult(correct, actualScore) {
            const modal = document.getElementById('wordWarModal');
            if (!modal) return;
            
            const resultHtml = `
                <div class="fixed inset-0 bg-black/80 z-[10001] flex items-center justify-center p-4" id="wwResult">
                    <div class="bg-white rounded-2xl p-8 text-center max-w-md w-full transform animate-bounce-in">
                        <div class="text-6xl mb-4">${correct ? '🎉' : '💥'}</div>
                        <h3 class="text-2xl font-black ${correct ? 'text-green-600' : 'text-red-600'} mb-2">
                            ${correct ? 'CORRECT!' : 'WRONG!'}
                        </h3>
                        <p class="text-gray-600 mb-4">
                            <strong>${this.wordB.text.toUpperCase()}</strong> has <strong>${actualScore}%</strong> approval
                        </p>
                        ${correct ? `
                            <p class="text-indigo-600 font-bold mb-4">🔥 Streak: ${this.streak}</p>
                            <button id="wwNext" class="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition">
                                Next Round →
                            </button>
                        ` : `
                            <p class="text-gray-600 mb-4">Final Streak: <strong class="text-indigo-600">${this.streak}</strong></p>
                            <div class="flex gap-3 justify-center">
                                <button id="wwRestart" class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition">
                                    🔄 Play Again
                                </button>
                                <button id="wwExit" class="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition">
                                    Exit
                                </button>
                            </div>
                        `}
                    </div>
                </div>`;
            
            document.body.insertAdjacentHTML('beforeend', resultHtml);
            
            if (correct) {
                document.getElementById('wwNext').onclick = () => {
                    document.getElementById('wwResult').remove();
                    this.showRound();
                };
            } else {
                // Check if this qualifies for high score (min 3 streak)
                if (MiniGames.scoreHelper.qualifiesForHighScore(this.streak, 'wordWarScores', 3)) {
                    const existingResult = document.getElementById('wwResult');
                    if (existingResult) existingResult.remove();
                    
                    MiniGames.scoreHelper.promptAndSave('wordwar', this.streak, {
                        title: 'HIGH SCORE!',
                        subtitle: 'Word War Streak',
                        bgGradient: 'from-indigo-600 to-purple-700',
                        borderColor: 'border-yellow-400',
                        inputBorderColor: 'border-purple-300',
                        buttonTextColor: 'text-purple-900',
                        stateKey: 'wordWarScores',
                        cabinetIndex: 1, // Word War cabinet
                        onComplete: () => this.close()
                    });
                }
                
                const restartBtn = document.getElementById('wwRestart');
                const exitBtn = document.getElementById('wwExit');
                if (restartBtn) {
                    restartBtn.onclick = () => {
                        document.getElementById('wwResult').remove();
                        this.streak = 0;
                        this.showRound();
                    };
                }
                if (exitBtn) {
                    exitBtn.onclick = () => this.close();
                }
            }
        },
        
        close() {
            this.active = false;
            const modal = document.getElementById('wordWarModal');
            const result = document.getElementById('wwResult');
            const entry = document.getElementById('mgScoreEntry');
            if (modal) modal.remove();
            if (result) result.remove();
            if (entry) entry.remove();
            
            // Return to Word War cabinet
            setTimeout(() => {
                if (typeof StreakManager !== 'undefined' && StreakManager.showLeaderboard) {
                    StreakManager.showLeaderboard(1);
                }
            }, 100);
        }
    },
    
    // ==================== DEFINITION DASH (Trivia) ====================
    definitionDash: {
        active: false,
        score: 0,
        round: 0,
        maxRounds: 10,
        timer: null,
        timeLeft: 10,
        correctWord: null,
        options: [],
        
        start() {
            this.active = true;
            this.score = 0;
            this.round = 0;
            this.showIntro();
        },
        
        showIntro() {
            const html = `
                <div id="defDashModal" class="fixed inset-0 bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 z-[10000] flex items-center justify-center p-4">
                    <div class="text-center max-w-md">
                        <div class="text-6xl mb-4">📚</div>
                        <h2 class="text-3xl font-black text-white mb-4">DEFINITION DASH</h2>
                        <p class="text-teal-200 mb-6">Read the definition, guess the word!<br>You have <strong>10 seconds</strong> per round.</p>
                        <div class="bg-white/10 rounded-xl p-4 mb-6">
                            <p class="text-white font-bold">${this.maxRounds} Rounds</p>
                            <p class="text-teal-300 text-sm">Score points for correct answers</p>
                        </div>
                        <button id="ddStart" class="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xl rounded-xl transition transform hover:scale-105 shadow-lg">
                            🚀 START GAME
                        </button>
                        <button id="ddClose" class="mt-4 block w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition">
                            ✕ Cancel
                        </button>
                    </div>
                </div>`;
            
            document.body.insertAdjacentHTML('beforeend', html);
            document.getElementById('ddStart').onclick = () => this.nextRound();
            document.getElementById('ddClose').onclick = () => this.close();
        },
        
        async nextRound() {
            this.round++;
            if (this.round > this.maxRounds) {
                this.showFinalScore();
                return;
            }
            
            // Find a word with a definition
            const modal = document.getElementById('defDashModal');
            if (modal) {
                modal.innerHTML = `
                    <div class="text-center">
                        <div class="text-4xl animate-spin mb-4">📚</div>
                        <p class="text-white font-bold">Finding a word with definition...</p>
                    </div>`;
            }
            
            let definition = null;
            let attempts = 0;
            const maxAttempts = 25;
            
            while (!definition && attempts < maxAttempts) {
                attempts++;
                const randomWord = State.runtime.allWords[Math.floor(Math.random() * State.runtime.allWords.length)];
                
                // First try the dictionary API
                try {
                    const r = await API.define(randomWord.text);
                    if (r.ok) {
                        const j = await r.json();
                        if (j[0] && j[0].meanings && j[0].meanings[0] && j[0].meanings[0].definitions[0]) {
                            this.correctWord = randomWord;
                            definition = j[0].meanings[0].definitions[0].definition;
                        }
                    }
                } catch (e) {
                    // Dictionary API failed, try community definition
                }
                
                // If no dictionary definition, try community definition
                if (!definition && randomWord._id) {
                    try {
                        const communityDef = await API.getCommunityDefinition(randomWord._id);
                        if (communityDef && communityDef.definition) {
                            this.correctWord = randomWord;
                            definition = communityDef.definition;
                        }
                    } catch (e) {
                        // No community definition either, try next word
                    }
                }
            }
            
            if (!definition) {
                UIManager.showPostVoteMessage("Could not find definitions. Try again!");
                this.close();
                return;
            }
            
            // Get 3 random wrong answers
            this.options = [this.correctWord];
            while (this.options.length < 4) {
                const randWord = State.runtime.allWords[Math.floor(Math.random() * State.runtime.allWords.length)];
                if (!this.options.find(o => o._id === randWord._id)) {
                    this.options.push(randWord);
                }
            }
            
            // Shuffle options
            for (let i = this.options.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.options[i], this.options[j]] = [this.options[j], this.options[i]];
            }
            
            this.showQuestion(definition);
        },
        
        showQuestion(definition) {
            this.timeLeft = 10;
            
            const html = `
                <div id="defDashModal" class="fixed inset-0 bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 z-[10000] flex items-center justify-center p-4">
                    <div class="w-full max-w-lg">
                        <div class="flex justify-between items-center mb-4">
                            <div class="text-white font-bold">Round ${this.round}/${this.maxRounds}</div>
                            <div class="text-yellow-400 font-bold">Score: ${this.score}</div>
                        </div>
                        
                        <!-- Timer Bar -->
                        <div class="w-full bg-white/20 rounded-full h-3 mb-6 overflow-hidden">
                            <div id="ddTimerBar" class="bg-emerald-400 h-full rounded-full transition-all duration-1000" style="width: 100%"></div>
                        </div>
                        
                        <div class="bg-white/10 backdrop-blur rounded-2xl p-6 mb-6">
                            <div class="text-sm text-teal-300 mb-2 font-bold">📖 DEFINITION:</div>
                            <p class="text-white text-lg leading-relaxed">${definition}</p>
                        </div>
                        
                        <div class="text-center text-teal-300 mb-4 font-bold">Which word matches this definition?</div>
                        
                        <div class="grid grid-cols-2 gap-3">
                            ${this.options.map((opt, i) => `
                                <button class="dd-option px-4 py-4 bg-white/10 hover:bg-white/20 border-2 border-white/30 hover:border-emerald-400 text-white font-bold text-lg rounded-xl transition transform hover:scale-102" data-index="${i}">
                                    ${opt.text.toUpperCase()}
                                </button>
                            `).join('')}
                        </div>
                        
                        <div class="mt-4 text-center">
                            <span id="ddTimeDisplay" class="text-2xl font-black text-yellow-400">10.0s</span>
                        </div>
                    </div>
                </div>`;
            
            const existing = document.getElementById('defDashModal');
            if (existing) existing.remove();
            
            document.body.insertAdjacentHTML('beforeend', html);
            
            // Bind option clicks
            document.querySelectorAll('.dd-option').forEach(btn => {
                btn.onclick = () => {
                    const index = parseInt(btn.dataset.index);
                    this.checkAnswer(index);
                };
            });
            
            // Start timer
            this.startTimer();
        },
        
        startTimer() {
            if (this.timer) clearInterval(this.timer);
            this.timeLeft = 100; // 10 seconds in 0.1s increments (100 = 10.0s)
            
            this.timer = setInterval(() => {
                this.timeLeft--;
                
                const display = document.getElementById('ddTimeDisplay');
                const bar = document.getElementById('ddTimerBar');
                
                const displaySeconds = (this.timeLeft / 10).toFixed(1);
                if (display) display.textContent = displaySeconds + 's';
                if (bar) bar.style.width = (this.timeLeft) + '%';
                
                if (this.timeLeft <= 30) { // 3 seconds
                    if (display) display.classList.add('text-red-400');
                    if (bar) bar.classList.replace('bg-emerald-400', 'bg-red-400');
                }
                
                if (this.timeLeft <= 0) {
                    clearInterval(this.timer);
                    this.checkAnswer(-1); // Time's up
                }
            }, 100); // Run every 0.1 seconds
        },
        
        checkAnswer(selectedIndex) {
            if (this.timer) clearInterval(this.timer);
            
            const correct = selectedIndex >= 0 && this.options[selectedIndex]._id === this.correctWord._id;
            const correctIndex = this.options.findIndex(o => o._id === this.correctWord._id);
            
            // Score based on 0.1 second increments - gives whole number score
            const pointsEarned = correct ? Math.max(10, this.timeLeft) : 0;
            if (correct) {
                this.score += pointsEarned;
            }
            
            // Highlight answers
            document.querySelectorAll('.dd-option').forEach((btn, i) => {
                btn.disabled = true;
                if (i === correctIndex) {
                    btn.classList.remove('bg-white/10', 'border-white/30');
                    btn.classList.add('bg-green-500', 'border-green-400');
                } else if (i === selectedIndex) {
                    btn.classList.remove('bg-white/10', 'border-white/30');
                    btn.classList.add('bg-red-500', 'border-red-400');
                }
            });
            
            // Show result message
            const modal = document.getElementById('defDashModal');
            if (modal) {
                const resultDiv = document.createElement('div');
                resultDiv.className = 'mt-4 text-center';
                resultDiv.innerHTML = correct 
                    ? `<div class="text-green-400 font-black text-xl">✓ Correct! +${pointsEarned} points</div>`
                    : `<div class="text-red-400 font-black text-xl">${selectedIndex === -1 ? '⏰ Time\'s Up!' : '✗ Wrong!'}</div>`;
                modal.querySelector('.max-w-lg').appendChild(resultDiv);
            }
            
            // Next round after delay
            setTimeout(() => this.nextRound(), 2000);
        },
        
        showFinalScore() {
            const bestScore = MiniGames.scoreHelper.getBestScore('defDashScores');
            const isNewBest = this.score > bestScore;
            const qualifiesForHighScore = MiniGames.scoreHelper.qualifiesForHighScore(this.score, 'defDashScores', 50);
            
            const html = `
                <div id="defDashModal" class="fixed inset-0 bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 z-[10000] flex items-center justify-center p-4">
                    <div class="text-center max-w-md bg-white/10 backdrop-blur rounded-2xl p-8">
                        <div class="text-6xl mb-4">${isNewBest ? '🏆' : '📚'}</div>
                        <h2 class="text-3xl font-black text-white mb-2">GAME OVER!</h2>
                        ${isNewBest ? '<div class="text-yellow-400 font-bold mb-4">🎉 NEW HIGH SCORE! 🎉</div>' : ''}
                        <div class="text-5xl font-black text-emerald-400 mb-4">${this.score}</div>
                        <p class="text-teal-200 mb-6">points scored</p>
                        <div class="text-teal-300 mb-6">Best Score: ${Math.max(this.score, bestScore)}</div>
                        <div class="flex gap-3 justify-center">
                            <button id="ddRestart" class="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition">
                                🔄 Play Again
                            </button>
                            <button id="ddExit" class="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl transition">
                                Exit
                            </button>
                        </div>
                    </div>
                </div>`;
            
            const existing = document.getElementById('defDashModal');
            if (existing) existing.remove();
            
            document.body.insertAdjacentHTML('beforeend', html);
            
            // Check for high score entry
            if (qualifiesForHighScore) {
                setTimeout(() => {
                    const gameModal = document.getElementById('defDashModal');
                    if (gameModal) gameModal.remove();
                    
                    MiniGames.scoreHelper.promptAndSave('defdash', this.score, {
                        title: 'HIGH SCORE!',
                        subtitle: 'Definition Dash',
                        bgGradient: 'from-emerald-600 to-teal-700',
                        borderColor: 'border-yellow-400',
                        inputBorderColor: 'border-teal-300',
                        buttonTextColor: 'text-teal-900',
                        stateKey: 'defDashScores',
                        cabinetIndex: 2, // Definition Dash cabinet
                        onComplete: () => this.close()
                    });
                }, 500);
            }
            
            document.getElementById('ddRestart').onclick = () => {
                this.score = 0;
                this.round = 0;
                this.nextRound();
            };
            document.getElementById('ddExit').onclick = () => this.close();
        },
        
        close() {
            this.active = false;
            if (this.timer) clearInterval(this.timer);
            const modal = document.getElementById('defDashModal');
            const entry = document.getElementById('mgScoreEntry');
            if (modal) modal.remove();
            if (entry) entry.remove();
            
            // Return to Definition Dash cabinet
            setTimeout(() => {
                if (typeof StreakManager !== 'undefined' && StreakManager.showLeaderboard) {
                    StreakManager.showLeaderboard(2);
                }
            }, 100);
        }
    },
    
    // Show mini-games menu
    showMenu() {
        const wwScores = State.data.wordWarScores || [];
        const ddScores = State.data.defDashScores || [];
        const wwBest = wwScores.length > 0 ? wwScores[0].score : 0;
        const ddBest = ddScores.length > 0 ? ddScores[0].score : 0;
        
        const html = `
            <div id="miniGamesMenu" class="fixed inset-0 bg-black/90 z-[10000] flex items-center justify-center p-4 backdrop-blur">
                <div class="w-full max-w-md">
                    <h2 class="text-3xl font-black text-white text-center mb-6">🎮 MINI GAMES</h2>
                    
                    <div class="space-y-4">
                        <button id="startWordWar" class="w-full p-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-2xl text-left transition transform hover:scale-102 shadow-lg">
                            <div class="flex items-center gap-4">
                                <span class="text-4xl">⚔️</span>
                                <div>
                                    <h3 class="text-xl font-black text-white">Word War</h3>
                                    <p class="text-purple-200 text-sm">Higher or Lower? Guess which word has better approval!</p>
                                    <p class="text-yellow-400 text-xs mt-1 font-bold">Best Streak: ${wwBest}</p>
                                </div>
                            </div>
                        </button>
                        
                        <button id="startDefDash" class="w-full p-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-2xl text-left transition transform hover:scale-102 shadow-lg">
                            <div class="flex items-center gap-4">
                                <span class="text-4xl">📚</span>
                                <div>
                                    <h3 class="text-xl font-black text-white">Definition Dash</h3>
                                    <p class="text-teal-200 text-sm">Read the definition, guess the word! 10 seconds per round.</p>
                                    <p class="text-yellow-400 text-xs mt-1 font-bold">High Score: ${ddBest}</p>
                                </div>
                            </div>
                        </button>
                        
                        <button id="viewArcadeScores" class="w-full p-4 bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-500 hover:to-orange-500 rounded-2xl text-center transition transform hover:scale-102 shadow-lg">
                            <span class="text-2xl">🏆</span>
                            <span class="text-white font-black ml-2">VIEW HIGH SCORES</span>
                        </button>
                    </div>
                    
                    <button id="closeMiniGames" class="mt-6 w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition">
                        ✕ Close
                    </button>
                </div>
            </div>`;
        
        document.body.insertAdjacentHTML('beforeend', html);
        
        document.getElementById('startWordWar').onclick = () => {
            document.getElementById('miniGamesMenu').remove();
            this.wordWar.start();
        };
        document.getElementById('startDefDash').onclick = () => {
            document.getElementById('miniGamesMenu').remove();
            this.definitionDash.start();
        };
        document.getElementById('viewArcadeScores').onclick = () => {
            document.getElementById('miniGamesMenu').remove();
            StreakManager.showLeaderboard();
        };
        document.getElementById('closeMiniGames').onclick = () => {
            document.getElementById('miniGamesMenu').remove();
        };
    },
    
    // ==================== WORD JUMP (Endless Runner) ====================
    wordJump: {
        active: false,
        score: 0,
        bestScore: 0,
        gameLoop: null,
        canvas: null,
        ctx: null,
        player: null,
        obstacles: [],
        collectibles: [],
        wordData: [],
        groundY: 0,
        gravity: 0.6,
        jumpForce: -12,
        gameSpeed: 5,
        frameCount: 0,
        isGameOver: false,
        pendingRestart: false,
        
        start() {
            this.active = true;
            this.isGameOver = false;
            this.pendingRestart = false;
            this.score = 0;
            this.bestScore = MiniGames.scoreHelper.getBestScore('wordJumpScores');
            this.gameSpeed = 5;
            this.frameCount = 0;
            this.obstacles = [];
            this.collectibles = [];
            this.prepareWordData();
            this.showGame();
        },
        
        prepareWordData() {
            // Get words and separate into real words and "not words"
            const source = State.runtime.allWords || [];
            this.wordData = [];
            
            // Get real words (words with 0 or 1 notWordVotes)
            const realWords = source.filter(w => (w.notWordVotes || 0) <= 1);
            // Get fake words (words with more than 1 notWordVotes) - these are collectible!
            const fakeWords = source.filter(w => (w.notWordVotes || 0) > 1);
            
            // Store for obstacle generation
            this.realWords = realWords.length > 0 ? realWords : [{ text: 'WORD' }, { text: 'JUMP' }, { text: 'GAME' }];
            this.fakeWords = fakeWords.length > 0 ? fakeWords : [];
        },
        
        showGame() {
            const html = `
                <div id="wordJumpModal" class="fixed inset-0 bg-gradient-to-b from-sky-400 via-sky-300 to-green-400 z-[10000] flex flex-col items-center justify-center p-4">
                    <div class="text-center mb-4">
                        <div class="flex justify-center gap-8 text-white font-bold text-lg">
                            <div>Score: <span id="wjScore">0</span></div>
                            <div>Best: <span id="wjBest">${this.bestScore}</span></div>
                        </div>
                    </div>
                    <canvas id="wordJumpCanvas" class="rounded-xl shadow-2xl border-4 border-white/50" style="max-width: 100%; touch-action: none;"></canvas>
                    <div class="mt-4 text-white/80 text-sm font-bold">TAP BELOW or SPACE to jump! Collect <span class="text-yellow-300">NOT A WORDs</span> for +5 points!</div>
                    <button id="wjClose" class="mt-4 px-6 py-2 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl transition">
                        ✕ Exit Game
                    </button>
                </div>`;
            
            document.body.insertAdjacentHTML('beforeend', html);
            
            this.canvas = document.getElementById('wordJumpCanvas');
            this.ctx = this.canvas.getContext('2d');
            
            // Set canvas size
            const maxW = Math.min(800, window.innerWidth - 32);
            const maxH = Math.min(300, window.innerHeight - 200);
            this.canvas.width = maxW;
            this.canvas.height = maxH;
            this.groundY = this.canvas.height - 40;
            
            // Initialize player
            this.player = {
                x: 80,
                y: this.groundY,
                width: 40,
                height: 50,
                vy: 0,
                isJumping: false,
                color: '#4f46e5'
            };
            
            // Event listeners
            this.jumpHandler = (e) => {
                if (e) e.preventDefault();
                
                if (this.isGameOver) {
                    // Restart game on tap after game over
                    this.restartGame();
                    return;
                }
                
                if (!this.player.isJumping && this.active) {
                    this.player.vy = this.jumpForce;
                    this.player.isJumping = true;
                }
            };
            
            this.canvas.onclick = this.jumpHandler;
            this.canvas.ontouchstart = this.jumpHandler;
            
            // Add touch support for bottom half of the screen (excluding buttons)
            const modal = document.getElementById('wordJumpModal');
            this.bottomHalfTouchHandler = (e) => {
                // Ignore if touching a button or interactive element
                if (e.target.closest('button')) return;
                
                // Only trigger if touch is in the bottom half of the screen
                const touch = e.touches ? e.touches[0] : e;
                const screenHeight = window.innerHeight;
                const canvasRect = this.canvas.getBoundingClientRect();
                
                // Check if touch is below the canvas top and not on the exit button area
                // Exit button is at the bottom, so exclude the bottom 80px
                if (touch.clientY > canvasRect.top && touch.clientY < (screenHeight - 80)) {
                    e.preventDefault();
                    this.jumpHandler(e);
                }
            };
            modal.addEventListener('touchstart', this.bottomHalfTouchHandler, { passive: false });
            
            this.keyHandler = (e) => {
                if (e.code === 'Space' || e.code === 'ArrowUp') {
                    e.preventDefault();
                    this.jumpHandler();
                }
            };
            window.addEventListener('keydown', this.keyHandler);
            
            document.getElementById('wjClose').onclick = () => this.close();
            
            // Start game loop
            this.gameLoop = requestAnimationFrame(() => this.update());
        },
        
        update() {
            if (!this.active || this.isGameOver) return;
            
            this.frameCount++;
            
            // Increase speed over time
            if (this.frameCount % 500 === 0) {
                this.gameSpeed = Math.min(15, this.gameSpeed + 0.5);
            }
            
            // Spawn obstacles (real words - must jump over)
            const spawnRate = Math.max(40, Math.floor(100 - this.gameSpeed * 3));
            if (this.frameCount % spawnRate === 0) {
                const wordObj = this.realWords[Math.floor(Math.random() * this.realWords.length)];
                let word = (wordObj.text || 'WORD').toUpperCase();
                
                // Limit word length to 8 characters max for jumpability
                if (word.length > 8) {
                    word = word.substring(0, 8);
                }
                
                this.obstacles.push({
                    x: this.canvas.width,
                    y: this.groundY,
                    width: this.ctx.measureText(word).width + 20 || word.length * 14,
                    height: 35,
                    text: word,
                    color: '#ef4444',
                    wordLength: word.length
                });
            }
            
            // Spawn collectibles (fake words - collect for bonus!)
            if (this.fakeWords.length > 0 && this.frameCount % (spawnRate * 3) === 0 && Math.random() > 0.5) {
                const wordObj = this.fakeWords[Math.floor(Math.random() * this.fakeWords.length)];
                let word = (wordObj.text || 'FAKE').toUpperCase();
                
                // Limit collectible word length too
                if (word.length > 10) {
                    word = word.substring(0, 10);
                }
                
                // Spawn in the air so player must jump to collect
                this.collectibles.push({
                    x: this.canvas.width,
                    y: this.groundY - 80 - Math.random() * 40,
                    width: word.length * 12 + 16,
                    height: 28,
                    text: word,
                    collected: false
                });
            }
            
            // Update player physics with extended jump for long words
            // Check if there's a long word approaching
            let extendJump = false;
            for (const obs of this.obstacles) {
                const distanceToObs = obs.x - this.player.x;
                // If a long word is approaching and player is jumping, reduce gravity
                if (obs.wordLength >= 6 && distanceToObs > 0 && distanceToObs < 200 && this.player.isJumping && this.player.vy < 0) {
                    extendJump = true;
                    break;
                }
            }
            
            // Apply reduced gravity for extended jumps over long words
            const currentGravity = extendJump ? this.gravity * 0.6 : this.gravity;
            this.player.vy += currentGravity;
            this.player.y += this.player.vy;
            
            if (this.player.y >= this.groundY) {
                this.player.y = this.groundY;
                this.player.vy = 0;
                this.player.isJumping = false;
            }
            
            // Update obstacles
            for (let i = this.obstacles.length - 1; i >= 0; i--) {
                this.obstacles[i].x -= this.gameSpeed;
                
                // Remove off-screen obstacles and score
                if (this.obstacles[i].x + this.obstacles[i].width < 0) {
                    this.obstacles.splice(i, 1);
                    this.score++;
                    document.getElementById('wjScore').textContent = this.score;
                    continue;
                }
                
                // Collision detection with obstacles
                if (this.checkCollision(this.player, this.obstacles[i])) {
                    this.gameOver();
                    return;
                }
            }
            
            // Update collectibles
            for (let i = this.collectibles.length - 1; i >= 0; i--) {
                this.collectibles[i].x -= this.gameSpeed;
                
                // Remove off-screen collectibles
                if (this.collectibles[i].x + this.collectibles[i].width < 0) {
                    this.collectibles.splice(i, 1);
                    continue;
                }
                
                // Check if player collects it
                if (!this.collectibles[i].collected && this.checkCollision(this.player, this.collectibles[i])) {
                    this.collectibles[i].collected = true;
                    this.score += 5; // Bonus points!
                    document.getElementById('wjScore').textContent = this.score;
                    // Show +5 animation
                    this.showBonusText(this.collectibles[i].x, this.collectibles[i].y);
                    this.collectibles.splice(i, 1);
                }
            }
            
            // Draw
            this.draw();
            
            this.gameLoop = requestAnimationFrame(() => this.update());
        },
        
        bonusTexts: [],
        
        showBonusText(x, y) {
            this.bonusTexts.push({ x, y, alpha: 1, vy: -2 });
        },
        
        checkCollision(player, obstacle) {
            const px = player.x;
            const py = player.y - player.height;
            const pw = player.width;
            const ph = player.height;
            
            const ox = obstacle.x;
            const oy = obstacle.y - obstacle.height;
            const ow = obstacle.width;
            const oh = obstacle.height;
            
            return px < ox + ow && px + pw > ox && py < oy + oh && py + ph > oy;
        },
        
        draw() {
            const ctx = this.ctx;
            const w = this.canvas.width;
            const h = this.canvas.height;
            
            // Clear and draw background
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(0, 0, w, h);
            
            // Draw clouds
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            for (let i = 0; i < 5; i++) {
                const cx = ((this.frameCount * 0.5 + i * 180) % (w + 100)) - 50;
                const cy = 30 + i * 20;
                ctx.beginPath();
                ctx.arc(cx, cy, 25, 0, Math.PI * 2);
                ctx.arc(cx + 25, cy - 10, 20, 0, Math.PI * 2);
                ctx.arc(cx + 50, cy, 25, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Draw ground
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(0, this.groundY, w, h - this.groundY);
            ctx.fillStyle = '#166534';
            ctx.fillRect(0, this.groundY, w, 4);
            
            // Draw player (simple character)
            const p = this.player;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y - p.height, p.width, p.height);
            
            // Player face
            ctx.fillStyle = '#fff';
            ctx.fillRect(p.x + 25, p.y - p.height + 12, 8, 8); // Eye
            ctx.fillStyle = '#000';
            ctx.fillRect(p.x + 27, p.y - p.height + 14, 4, 4); // Pupil
            ctx.fillStyle = '#fff';
            ctx.fillRect(p.x + 10, p.y - p.height + 30, 20, 4); // Mouth
            
            // Draw obstacles (real words - just text, no box)
            ctx.font = 'bold 24px sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'bottom';
            this.obstacles.forEach(obs => {
                // Draw shadow
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.fillText(obs.text, obs.x + 2, obs.y + 2);
                // Draw text
                ctx.fillStyle = obs.color;
                ctx.fillText(obs.text, obs.x, obs.y);
            });
            
            // Draw collectibles (fake words - golden, in the air)
            this.collectibles.forEach(col => {
                // Glowing golden background
                ctx.fillStyle = 'rgba(251, 191, 36, 0.3)';
                ctx.fillRect(col.x - 4, col.y - col.height - 4, col.width + 8, col.height + 8);
                
                ctx.fillStyle = '#fbbf24';
                ctx.fillRect(col.x, col.y - col.height, col.width, col.height);
                
                // Sparkle effect
                ctx.fillStyle = 'rgba(255,255,255,0.8)';
                const sparkleX = col.x + (this.frameCount % 20) * (col.width / 20);
                ctx.fillRect(sparkleX, col.y - col.height + 2, 4, 4);
                
                // Text
                ctx.fillStyle = '#78350f';
                ctx.font = 'bold 14px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(col.text, col.x + col.width / 2, col.y - col.height / 2);
            });
            
            // Draw bonus texts
            ctx.font = 'bold 20px sans-serif';
            ctx.textAlign = 'center';
            for (let i = this.bonusTexts.length - 1; i >= 0; i--) {
                const bt = this.bonusTexts[i];
                bt.y += bt.vy;
                bt.alpha -= 0.02;
                
                if (bt.alpha <= 0) {
                    this.bonusTexts.splice(i, 1);
                    continue;
                }
                
                ctx.fillStyle = `rgba(251, 191, 36, ${bt.alpha})`;
                ctx.fillText('+5', bt.x, bt.y);
            }
        },
        
        gameOver() {
            this.active = false;
            this.isGameOver = true;
            cancelAnimationFrame(this.gameLoop);
            
            // Check if this qualifies for high score (any score > 0)
            const qualifies = MiniGames.scoreHelper.qualifiesForHighScore(this.score, 'wordJumpScores', 1);
            
            if (qualifies && this.score > 0) {
                // Close game modal and show shared initials prompt
                const gameModal = document.getElementById('wordJumpModal');
                if (gameModal) gameModal.remove();
                if (this.keyHandler) window.removeEventListener('keydown', this.keyHandler);
                
                MiniGames.scoreHelper.promptAndSave('wordjump', this.score, {
                    title: 'HIGH SCORE!',
                    subtitle: 'Word Jump',
                    bgGradient: 'from-sky-500 to-blue-600',
                    borderColor: 'border-yellow-400',
                    inputBorderColor: 'border-sky-300',
                    buttonTextColor: 'text-sky-900',
                    localStorageKey: 'wordJumpBest',
                    stateKey: 'wordJumpScores',
                    cabinetIndex: 3 // Word Jump cabinet
                });
            } else {
                // Just show game over screen
                this.showGameOverScreen(false);
            }
        },
        
        showGameOverScreen(wasNewBest) {
            const ctx = this.ctx;
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 36px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 40);
            
            ctx.font = 'bold 24px sans-serif';
            ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
            
            if (wasNewBest) {
                ctx.fillStyle = '#fbbf24';
                ctx.font = 'bold 20px sans-serif';
                ctx.fillText('🏆 NEW BEST! 🏆', this.canvas.width / 2, this.canvas.height / 2 + 35);
            }
            
            ctx.fillStyle = '#fff';
            ctx.font = '18px sans-serif';
            ctx.fillText('Tap to play again', this.canvas.width / 2, this.canvas.height / 2 + 70);
            
            // Update best display
            const bestEl = document.getElementById('wjBest');
            if (bestEl) bestEl.textContent = this.bestScore;
        },
        
        restartGame() {
            if (this.pendingRestart) return;
            this.pendingRestart = true;
            
            // Reset state
            this.active = true;
            this.isGameOver = false;
            this.score = 0;
            this.gameSpeed = 5;
            this.frameCount = 0;
            this.obstacles = [];
            this.collectibles = [];
            this.bonusTexts = [];
            
            // Reset player
            this.player.y = this.groundY;
            this.player.vy = 0;
            this.player.isJumping = false;
            
            // Update score display
            document.getElementById('wjScore').textContent = '0';
            
            this.pendingRestart = false;
            
            // Restart game loop
            this.gameLoop = requestAnimationFrame(() => this.update());
        },
        
        close() {
            this.active = false;
            this.isGameOver = false;
            if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
            if (this.keyHandler) window.removeEventListener('keydown', this.keyHandler);
            const modal = document.getElementById('wordJumpModal');
            if (modal) {
                if (this.bottomHalfTouchHandler) {
                    modal.removeEventListener('touchstart', this.bottomHalfTouchHandler);
                }
                modal.remove();
            }
            
            // Return to arcade on Word Jump cabinet (index 3)
            setTimeout(() => {
                if (typeof StreakManager !== 'undefined' && StreakManager.showLeaderboard) {
                    StreakManager.showLeaderboard(3);
                }
            }, 100);
        }
    }
};
const UIManager = {
    msgTimeout: null,
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
        if (DOM.header && DOM.header.streak) {
            DOM.header.streak.textContent = n;
            if (n > 0 && n % 10 === 0) {
                DOM.header.streak.classList.add('animate-bounce');
                setTimeout(() => DOM.header.streak.classList.remove('animate-bounce'), 1000);
            }
        }
    },
    addToHistory(word, vote) {
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
    showMessage(t, err = false) {
        const wd = DOM.game.wordDisplay;
        wd.textContent = t;
        wd.className = `font-bold text-center min-h-[72px] ${err?'text-red-500':'text-gray-500'}`;
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
        const w = State.runtime.fullWordList.length > 0 ? State.runtime.fullWordList : State.runtime.allWords;
        if (!w.length) return;
        DOM.header.streak.textContent = State.data.daily.streak || 0;
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
        const realRecord = Math.max(parseInt(d.longestStreak) || 0, parseInt(d.daily.bestStreak) || 0);
        d.longestStreak = realRecord;
        d.daily.bestStreak = realRecord;
        State.save('longestStreak', realRecord);
        if (DOM.profile.streak) {
            DOM.profile.streak.textContent = d.daily.streak || 0;
            DOM.profile.streak.style.cursor = 'pointer';
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
        const streakEl = document.getElementById('streak-display-value');
        if (streakEl) streakEl.textContent = realRecord + " Words";
        const bestEl = document.getElementById('bestDailyStreak');
        if (bestEl) bestEl.textContent = realRecord;
        if (DOM.profile.totalVotes) {
            DOM.profile.totalVotes.textContent = d.voteCount.toLocaleString();
            DOM.profile.totalVotes.style.cursor = 'pointer';
            DOM.profile.totalVotes.onclick = () => {
                ModalManager.toggle('profile', false);
                const statsBtn = document.getElementById('headerStatsCard');
                if (statsBtn) statsBtn.click();
            };
        }
        if (DOM.profile.contributions) DOM.profile.contributions.textContent = d.contributorCount.toLocaleString();
        const goldenEl = document.getElementById('goldenWordsFound');
        if (goldenEl) goldenEl.textContent = d.daily.goldenWordsFound || 0;
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
        if (DOM.profile.themes) {
            DOM.profile.themes.textContent = `${userCount} / ${totalAvailable}`;
            DOM.profile.themes.style.cursor = 'pointer';
            DOM.profile.themes.onclick = () => {
                ModalManager.toggle('profile', false);
                ThemeManager.showGallery();
            };
        }
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
        if (ContentFilter.isOffensive(w.text)) {
            console.warn('Skipping filtered word');
            State.runtime.currentWordIndex++;
            Game.nextWord();
            return;
        }
        const wd = DOM.game.wordDisplay,
            txt = w.text.toUpperCase();
        wd.textContent = txt;
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
            // Remove any existing golden style and re-add at end to ensure it loads last
            const existingStyle = document.getElementById('golden-style');
            if (existingStyle) existingStyle.remove();
            
            const s = document.createElement('style');
            s.id = 'golden-style';
            // Use extremely high specificity selectors
            s.textContent = `
                @keyframes golden-glow {
                    0%, 100% { text-shadow: 0 0 10px #fbbf24, 0 0 20px #f59e0b, 0 0 5px #fde68a; }
                    50% { text-shadow: 0 0 20px #fbbf24, 0 0 40px #f59e0b, 0 0 60px #d97706; }
                }
                html body #wordDisplay.golden-word,
                html body.theme-submarine #wordDisplay.golden-word,
                html body.theme-banana #wordDisplay.golden-word,
                html body.theme-woodland #wordDisplay.golden-word,
                html body.theme-ocean #wordDisplay.golden-word,
                html body.theme-flight #wordDisplay.golden-word,
                html body.theme-halloween #wordDisplay.golden-word,
                html body.theme-fire #wordDisplay.golden-word,
                html body.theme-rainbow #wordDisplay.golden-word,
                html body.theme-winter #wordDisplay.golden-word,
                html body.theme-summer #wordDisplay.golden-word,
                html body.theme-dark #wordDisplay.golden-word,
                html body.theme-plymouth #wordDisplay.golden-word,
                html body.theme-space #wordDisplay.golden-word,
                html body.theme-ballpit #wordDisplay.golden-word,
                html body.theme-default #wordDisplay.golden-word {
                    color: #f59e0b !important;
                    text-shadow: 0 0 10px #fbbf24, 0 0 20px #f59e0b !important;
                    animation: golden-glow 1.5s ease-in-out infinite !important;
                    background: none !important;
                    background-clip: unset !important;
                    -webkit-background-clip: unset !important;
                    -webkit-text-fill-color: #f59e0b !important;
                }
            `;
            // Append to end of body to ensure it loads after all other styles
            document.body.appendChild(s);
            
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
        const source = State.runtime.fullWordList.length > 0 ? State.runtime.fullWordList : State.runtime.allWords;
        const r = source.map(w => ({
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
            ind.className = 'fixed top-[75px] right-6 text-xs font-bold px-3 py-2 rounded-full shadow-lg z-50 transition-all duration-300 border-2 select-none cursor-pointer hover:scale-105 active:scale-95';
            ind.onclick = () => {
                const isCurrentlyOffline = OfflineManager.isActive();
                OfflineManager.toggle(!isCurrentlyOffline);
            };
            document.body.appendChild(ind);
        }
        if (OfflineManager.isActive()) {
            ind.style.opacity = '1';
            ind.style.pointerEvents = 'auto';
            ind.style.backgroundColor = '#fef2f2';
            ind.style.borderColor = '#ef4444';
            ind.style.color = '#991b1b';
            const queueCount = State.data.voteQueue?.length || 0;
            const queueText = queueCount > 0 ? ` (${queueCount})` : '';
            ind.innerHTML = `<span style="color:#ef4444">●</span> OFFLINE${queueText}`;
            ind.title = 'Click to go online and sync votes';
        } else {
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
            ind.className = 'fixed bottom-4 right-4 bg-orange-100 text-orange-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg z-50 transition-opacity duration-500 pointer-events-none border-2 border-orange-500 flex items-center gap-2';
            ind.innerHTML = '<span class="text-lg">⚔️</span> CONTROVERSIAL';
            document.body.appendChild(ind);
        }
        ind.style.opacity = active ? '1' : '0';
    },
   showCountdown(seconds, callback, isTraitor = false, team = null, vipInfo = null) {
        const old = document.getElementById('game-countdown');
        if (old) old.remove();
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
        if (data.mode === 'okstoopid') {
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
            setTimeout(() => {
                if(ShareManager && ShareManager.shareCompatibility) {
                    const p1 = data.rankings[0]?.name || "P1";
                    const p2 = data.rankings[1]?.name || "P2";
                    const shareBtn = document.getElementById('share-result-btn');
                    if(shareBtn) shareBtn.onclick = () => ShareManager.shareCompatibility(p1, p2, percent, matches, totalRounds);
                }
            }, 100);
        }
        else if (data.mode === 'traitor') {
            const rankings = data.rankings || [];
            const traitor = rankings.find(p => p.id === data.specialRoleId);
            const traitorName = traitor ? traitor.name : "Unknown";
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
        else {
            header = `<h2 class="text-3xl font-black text-center mb-4 text-indigo-700">GAME OVER</h2>`;
            if (data.msg) body += `<p class="text-center text-gray-500 font-bold mb-6 bg-gray-100 p-2 rounded-lg">${data.msg}</p>`;
        }
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
                const isOffline = s.offlineMode || false;
                html += `<div class="mb-6">
                    <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-100 pb-1">Network</h3>
                    <div class="space-y-4">`;
                html += mkTog('toggleOffline', '🚇 Offline Mode', isOffline, 'text-gray-800');
                html += `<p class="text-xs text-gray-400 mt-1">Saves words locally. Votes sync when you reconnect.</p>`;
                html += `</div></div>`;
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
                html += `<div class="mb-6"><h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-100 pb-1">Accessibility</h3><div class="space-y-4">`;
                html += mkTog('toggleColorblind', 'Colourblind Mode', s.colorblindMode);
                html += mkTog('toggleLargeText', 'Increase Text Size', s.largeText);
                html += mkTog('toggleMute', 'Mute All Sounds', s.muteSounds);
                if (State.data.unlockedThemes.includes('halloween')) {
                    html += mkTog('toggleArachnophobia', '🚫 Arachnophobia Mode', s.arachnophobiaMode);
                }
                html += mkTog('toggleKidsMode', '🧸 Kids Mode', s.kidsMode, 'text-pink-600');
                html += `</div></div>`;
                html += `<div><h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-100 pb-1">Fun</h3><div class="space-y-4">`;
                html += mkTog('toggleTilt', 'Gravity Tilt (Default Theme)', s.enableTilt);
                html += mkTog('toggleMirror', 'Mirror Mode', s.mirrorMode);
                html += mkTog('toggleLights', '🎄 Christmas Lights', s.showLights, 'text-green-600');
                html += mkTog('toggleWeather', '🌧️ Real-time Weather', s.enableWeather, 'text-blue-500');
                html += `<p class="text-xs text-gray-400 mt-1 mb-2">Requires location. ...only happens if it's raining (or snowing)!</p>`;
                html += `</div></div>`;
                html += `<div><h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-100 pb-1">Interface</h3><div class="space-y-4">`;
                html += mkTog('toggleHideMultiplayer', 'Hide Multiplayer Button', s.hideMultiplayer);
                html += mkTog('toggleHideCards', '🎨 Hide Cards (Theme Mode)', s.hideCards);
                html += `<p class="text-xs text-gray-400 mt-1 mb-2">Hides the game cards to just enjoy the theme background.</p>`;
                html += mkTog('toggleHideProfile', '👤 Hide Profile Card', s.hideProfile);
                html += mkTog('toggleHideVotesBar', '📊 Hide Votes Bar', s.hideVotesBar);
                html += mkTog('toggleHideTopWords', '📝 Hide Top Good/Bad Words', s.hideTopWords);
                html += `</div></div>`;
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
                container.innerHTML = html;
                document.getElementById('toggleOffline').onchange = e => OfflineManager.toggle(e.target.checked);
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
                    const floatEl = document.getElementById('streak-floating-counter');
                    if (floatEl) floatEl.remove();
                };
                document.getElementById('toggleColorblind').onchange = e => {
                    State.save('settings', { ...State.data.settings, colorblindMode: e.target.checked });
                    Accessibility.apply();
                };
                document.getElementById('toggleLargeText').onchange = e => {
                    State.save('settings', { ...State.data.settings, largeText: e.target.checked });
                    Accessibility.apply();
                };
                const hideMultiplayerToggle = document.getElementById('toggleHideMultiplayer');
                if (hideMultiplayerToggle) {
                    hideMultiplayerToggle.onchange = e => {
                        State.save('settings', { ...State.data.settings, hideMultiplayer: e.target.checked });
                        const roomBtn = document.getElementById('roomBtn');
                        if (roomBtn) {
                            const shouldHide = e.target.checked || State.data.settings.kidsMode;
                            roomBtn.style.display = shouldHide ? 'none' : '';
                        }
                    };
                }
                const hideCardsToggle = document.getElementById('toggleHideCards');
                if (hideCardsToggle) {
                    hideCardsToggle.onchange = e => {
                        State.save('settings', { ...State.data.settings, hideCards: e.target.checked });
                        Game.applyHideCards(e.target.checked);
                    };
                }
                const hideProfileToggle = document.getElementById('toggleHideProfile');
                if (hideProfileToggle) {
                    hideProfileToggle.onchange = e => {
                        State.save('settings', { ...State.data.settings, hideProfile: e.target.checked });
                        Game.applyUIVisibility();
                    };
                }
                const hideVotesBarToggle = document.getElementById('toggleHideVotesBar');
                if (hideVotesBarToggle) {
                    hideVotesBarToggle.onchange = e => {
                        State.save('settings', { ...State.data.settings, hideVotesBar: e.target.checked });
                        Game.applyUIVisibility();
                    };
                }
                const hideTopWordsToggle = document.getElementById('toggleHideTopWords');
                if (hideTopWordsToggle) {
                    hideTopWordsToggle.onchange = e => {
                        State.save('settings', { ...State.data.settings, hideTopWords: e.target.checked });
                        Game.applyUIVisibility();
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
                    const roomBtn = document.getElementById('roomBtn');
                    e.preventDefault();
                    const updateMultiplayerVisibility = (kidsOn) => {
                        if (roomBtn) {
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
const TipManager = {
    serviceID: 'service_b6d75wi',
    templateID: 'template_qody7q7',
    COOLDOWN_MINS: 10, // <--- CONFIG: Minutes between messages
    init() {
        if (document.getElementById('tipModal')) return;
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
        this.close();
        if (typeof ModalManager !== 'undefined') ModalManager.toggle('settings', false); // Close settings too
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
        --
        UIManager.showPostVoteMessage("Tip sent! Thanks! 💌");
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
        this.close();
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
        -
        UIManager.showPostVoteMessage("Message sent! I'll read it soon. 📨");
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
const DiscoveryManager = {
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
        const pos = target.pos || 'bottom';
        const arrow = document.createElement('div'); // Create arrow manually for control
        if (pos === 'left') {
            tip.style.right = '110%'; // Push to left
            tip.style.top = '50%';
            tip.style.transform = 'translateY(-50%)';
            tip.classList.add('arrow-right');
            Object.assign(tip.style, { right: 'calc(100% + 10px)', top: '50%', transform: 'translateY(-50%)' });
        }
        else if (pos === 'right') {
            tip.style.left = '110%'; // Push to right
            tip.style.top = '50%';
            tip.style.transform = 'translateY(-50%)';
        }
        else {
            tip.style.top = '115%';
            tip.style.left = '50%';
            tip.style.transform = 'translateX(-50%)';
        }
        const styleId = 'discovery-arrow-' + pos;
        if (!document.getElementById(styleId)) {
            const s = document.createElement('style');
            s.id = styleId;
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
    },
    setupSignaling() {
        if (!this.socket) return;
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
        this.socket.on('localRoomCreated', ({ roomCode, words, rounds }) => {
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
        this.socket.on('localRoomJoined', async ({ roomCode, hostId, hostName }) => {
            this.roomCode = roomCode;
            this.hostId = hostId;
            this.isHost = false;
            UIManager.showPostVoteMessage(`Connecting to ${hostName}... 🔗`);
        });
        this.socket.on('localPeerJoined', async ({ peerId, peerName }) => {
            if (!this.isHost) return;
            await this.connectToPeer(peerId, peerName);
        });
        this.socket.on('rtcOffer', async ({ from, offer, roomCode }) => {
            if (this.isHost) return;
            try {
                await this.handleOffer(from, offer);
            } catch (e) {
                console.error('[LocalPeer] Error handling offer:', e);
                UIManager.showPostVoteMessage("Connection failed ❌");
            }
        });
        this.socket.on('rtcAnswer', async ({ from, answer }) => {
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
        this.socket.on('localRoomError', ({ message }) => {
            console.error('[LocalPeer] Error:', message);
            UIManager.showPostVoteMessage(message);
            this.closeLocalUI();
        });
        this.socket.on('localHostDisconnected', () => {
            UIManager.showPostVoteMessage("Host disconnected 😢");
            this.cleanup();
            this.closeLocalUI();
        });
        this.socket.on('localPeerDisconnected', ({ peerId }) => {
            const peer = this.peers.get(peerId);
            if (peer) {
                this.players = this.players.filter(p => p.id !== peerId);
                if (peer.connection) peer.connection.close();
                this.peers.delete(peerId);
                this.updateLobbyUI();
            }
        });
        this.socket.on('localWordsRefreshed', ({ words }) => {
            this.words = words;
            UIManager.showPostVoteMessage(`Got ${words.length} new words! 📝`);
            this.showLocalLobby();
        });
    },
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
    async connectToPeer(peerId, peerName) {
        const connection = new RTCPeerConnection({ iceServers: this.iceServers });
        const dataChannel = connection.createDataChannel('gameData', { ordered: true });
        this.peers.set(peerId, {
            connection,
            dataChannel,
            name: peerName,
            ready: false
        });
        this.players.push({ id: peerId, name: peerName, vote: null, connected: false });
        this.updateLobbyUI();
        dataChannel.onopen = () => {
            const peer = this.peers.get(peerId);
            if (peer) peer.ready = true;
            const player = this.players.find(p => p.id === peerId);
            if (player) player.connected = true;
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
                this.socket.emit('rtcIceCandidate', { targetId: peerId, candidate: e.candidate });
            }
        };
        connection.onconnectionstatechange = () => {
        };
        try {
            const offer = await connection.createOffer();
            await connection.setLocalDescription(offer);
            this.socket.emit('rtcOffer', { targetId: peerId, offer: offer, roomCode: this.roomCode });
        } catch (e) {
            console.error('[LocalPeer] Error creating offer:', e);
        }
    },
    async handleOffer(hostId, offer) {
        try {
            this.hostConnection = new RTCPeerConnection({ iceServers: this.iceServers });
            this.hostConnection.ondatachannel = (e) => {
                this.hostDataChannel = e.channel;
                this.hostDataChannel.onopen = () => {
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
                    this.socket.emit('rtcIceCandidate', { targetId: hostId, candidate: e.candidate });
                }
            };
            this.hostConnection.onconnectionstatechange = () => {
            };
            await this.hostConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await this.hostConnection.createAnswer();
            await this.hostConnection.setLocalDescription(answer);
            this.socket.emit('rtcAnswer', { targetId: hostId, answer: answer });
        } catch (e) {
            console.error('[LocalPeer] Error in handleOffer:', e);
            UIManager.showPostVoteMessage("Connection error ❌");
        }
    },
    sendToPeer(peerId, data) {
        const peer = this.peers.get(peerId);
        if (peer?.dataChannel?.readyState === 'open') {
            peer.dataChannel.send(JSON.stringify(data));
        }
    },
    broadcast(data) {
        const msg = JSON.stringify(data);
        this.peers.forEach((peer) => {
            if (peer.dataChannel?.readyState === 'open') {
                peer.dataChannel.send(msg);
            }
        });
    },
    sendToHost(data) {
        if (this.hostDataChannel?.readyState === 'open') {
            this.hostDataChannel.send(JSON.stringify(data));
        }
    },
    handlePeerMessage(peerId, data) {
        if (data.type === 'vote') {
            this.votes[peerId] = data.vote;
            const player = this.players.find(p => p.id === peerId);
            if (player) player.vote = data.vote;
            this.broadcast({ type: 'playerVoted', playerId: peerId });
            this.checkAllVoted();
        }
    },
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
    startGame() {
        if (!this.isHost) return;
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
        if (this.words.length > this.rounds) {
            this.words = this.words.slice(0, this.rounds);
        }
        this.players.forEach(p => {
            p.vote = null;
            p.score = 0;
            p.lives = 3; // For survival mode
        });
        this.closeLocalUI();
        this.broadcast({
            type: 'gameStart',
            words: this.words,
            mode: this.gameMode
        });
        this.showWord();
    },
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
    submitVote(vote) {
        if (this.isHost) {
            const hostPlayer = this.players.find(p => p.id === 'host');
            if (hostPlayer) hostPlayer.vote = vote;
            this.votes['host'] = vote;
            this.checkAllVoted();
        } else {
            this.sendToHost({ type: 'vote', vote });
        }
        UIManager.disableButtons(true);
        document.body.classList.add(vote === 'good' ? 'vote-good-mode' : 'vote-bad-mode');
        SoundManager.playGood();
    },
    checkAllVoted() {
        if (!this.isHost) return;
        const connectedPlayers = this.players.filter(p => p.connected || p.id === 'host');
        const allVoted = connectedPlayers.every(p => this.votes[p.id] != null);
        if (allVoted) {
            this.processRound();
        }
    },
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
    showLocalLobby() {
        this.closeLocalUI();
        const code = this.roomCode;
        const isHost = this.isHost;
        const playerCount = this.players.length;
        const connectedCount = this.players.filter(p => p.connected || p.id === 'host').length;
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
        this.broadcast({ type: 'modeChange', mode: mode, rounds: this.rounds || 10 });
        this.showLocalLobby(); // Re-render
    },
    setRounds(rounds) {
        if (!this.isHost) return;
        this.rounds = parseInt(rounds);
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
            this.showLocalLobby();
        }
    },
    showWord() {
        this.closeLocalUI();
        const word = this.words[this.currentWordIndex];
        if (!word) return;
        State.runtime.isMultiplayer = true; // Prevent normal voting
        UIManager.displayWord(word);
        UIManager.disableButtons(false);
        DOM.game.buttons.good.onclick = () => this.submitVote('good');
        DOM.game.buttons.bad.onclick = () => this.submitVote('bad');
        UIManager.showPostVoteMessage(`Word ${this.currentWordIndex + 1}/${this.words.length}`);
    },
    showRoundResult(data) {
        const msg = `${data.sync}% sync! ${data.majority === 'tie' ? "It's a tie!" : data.majority.toUpperCase() + ' wins'}`;
        UIManager.showPostVoteMessage(msg);
    },
    showGameEnd(data) {
        State.runtime.isMultiplayer = false;
        UIManager.showPostVoteMessage(data.message || 'Game Over!');
        DOM.game.buttons.good.onclick = () => Game.vote('good');
        DOM.game.buttons.bad.onclick = () => Game.vote('bad');
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
    currentMode: 'coop',
    currentWordCount: 10,
    drinkingMode: false,
    extremeDrinkingMode: false,
    players: [],
    amITraitor: false,
    myTeam: null,
    vipId: null,
    vipName: null,
    amIVip: false,
    isPublic: false,
    maxPlayers: 8,
    publicGames: [],
    originalTheme: 'default',
    hostTheme: null,
    listenersAttached: false,
    modeConfig: {
        'coop': { 
            label: '🤝 Co-op Sync', 
            desc: 'Vote together! Match with the Global Majority.', 
            min: 2,
            rules: `<b>🤝 Co-op Sync Rules</b><br><br>
                <b>Goal:</b> Work together as a team to match the global majority vote.<br><br>
                <b>How to Play:</b><br>
                • Each round, a word appears for all players<br>
                • Everyone votes Good 👍 or Bad 👎<br>
                • Your team score increases when you match the global majority<br><br>
                <b>Scoring:</b><br>
                • Higher sync percentage = Better team performance<br>
                • Try to achieve 100% sync with your group!<br><br>
                <b>Tip:</b> Think about what most people would vote, not just your opinion!`
        },
        'okstoopid': { 
            label: '💘 OK Stoopid', 
            desc: 'Couples Mode. Match each other quickly for the highest score!', 
            min: 2, 
            max: 2,
            rules: `<b>💘 OK Stoopid Rules</b><br><br>
                <b>Goal:</b> Match your partner's votes as quickly as possible!<br><br>
                <b>How to Play:</b><br>
                • Only 2 players allowed - perfect for couples or best friends<br>
                • Each round, both players vote Good 👍 or Bad 👎<br>
                • Try to think like your partner!<br><br>
                <b>Scoring:</b><br>
                • Match = Points based on how fast you both voted<br>
                • Mismatch = No points<br>
                • Fastest matches score the most!<br><br>
                <b>Tip:</b> The better you know each other, the higher you'll score!`
        },
        'versus': { 
            label: '⚔️ Team Versus', 
            desc: 'Red vs Blue. Best Team wins.', 
            min: 2,
            rules: `<b>⚔️ Team Versus Rules</b><br><br>
                <b>Goal:</b> Beat the opposing team by matching the global majority more often.<br><br>
                <b>How to Play:</b><br>
                • Players are split into Red and Blue teams<br>
                • Each round, everyone votes Good 👍 or Bad 👎<br>
                • The team with more players matching the majority wins the round<br><br>
                <b>Scoring:</b><br>
                • Round win = 1 point for your team<br>
                • Most points at the end wins!<br><br>
                <b>Tip:</b> Coordinate with your teammates for strategic voting!`
        },
        'vip': { 
            label: '⭐ The VIP', 
            desc: 'One player is the VIP. Everyone tries to match their vote!', 
            min: 3,
            rules: `<b>⭐ The VIP Rules</b><br><br>
                <b>Goal:</b> If you're the VIP, vote your heart. Everyone else - match the VIP!<br><br>
                <b>How to Play:</b><br>
                • One random player becomes the VIP (⭐) each game<br>
                • The VIP votes however they want<br>
                • All other players try to predict and match the VIP's vote<br><br>
                <b>Scoring:</b><br>
                • Match the VIP = Points<br>
                • Miss the VIP's vote = No points<br>
                • VIP scores based on how many people they fooled!<br><br>
                <b>Tip:</b> Study the VIP's personality - are they a "Good" or "Bad" person?`
        },
        'hipster': { 
            label: '🕶️ Hipster Mode', 
            desc: 'Be unique! Score by voting with the minority.', 
            min: 3,
            rules: `<b>🕶️ Hipster Mode Rules</b><br><br>
                <b>Goal:</b> Be different! Vote against the crowd to score points.<br><br>
                <b>How to Play:</b><br>
                • Each round, everyone votes Good 👍 or Bad 👎<br>
                • The minority vote wins!<br>
                • If everyone votes the same... nobody scores<br><br>
                <b>Scoring:</b><br>
                • Minority voter = Points<br>
                • Majority voter = No points<br>
                • Ties = Everyone scores half points<br><br>
                <b>Tip:</b> Think about what everyone ELSE will vote, then vote the opposite!`
        },
        'controversial': { 
            label: '🔥 Controversial King', 
            desc: 'Pick the most divisive word! Closest to 50/50 wins.', 
            min: 2,
            rules: `<b>🔥 Controversial King Rules</b><br><br>
                <b>Goal:</b> Find the most controversial word - the one closest to a 50/50 split!<br><br>
                <b>How to Play:</b><br>
                • Each round shows 3 words with their global vote stats hidden<br>
                • Pick the word you think is most controversial (closest to 50% good / 50% bad)<br>
                • The server reveals which word was actually closest to 50/50<br><br>
                <b>Scoring:</b><br>
                • Picking the most controversial word = 3 points<br>
                • Second most controversial = 1 point<br>
                • Least controversial = 0 points<br><br>
                <b>Tip:</b> Words that could go either way tend to be the most divisive!`
        },
        'speed': { 
            label: '⏱️ Speed Demon', 
            desc: 'Vote fast! Speed and accuracy wins.', 
            min: 2,
            rules: `<b>⏱️ Speed Demon Rules</b><br><br>
                <b>Goal:</b> Be fast AND correct! Match the majority as quickly as possible.<br><br>
                <b>How to Play:</b><br>
                • Each round, vote Good 👍 or Bad 👎<br>
                • The faster you vote, the more potential points<br>
                • But only if you match the majority!<br><br>
                <b>Scoring:</b><br>
                • Fast + Correct = Maximum points<br>
                • Slow + Correct = Fewer points<br>
                • Wrong = Zero points (no matter how fast)<br><br>
                <b>Tip:</b> Trust your gut - overthinking costs precious seconds!`
        },
        'survival': { 
            label: '💣 Sudden Death', 
            desc: 'Three Lives. Vote with majority, or die.', 
            min: 2,
            rules: `<b>💣 Sudden Death Rules</b><br><br>
                <b>Goal:</b> Survive! Don't run out of lives.<br><br>
                <b>How to Play:</b><br>
                • Everyone starts with 3 lives ❤️❤️❤️<br>
                • Each round, vote Good 👍 or Bad 👎<br>
                • Vote with the majority = Safe<br>
                • Vote with the minority = Lose 1 life 💔<br><br>
                <b>Elimination:</b><br>
                • Lose all 3 lives = Eliminated! 💀<br>
                • Last player standing wins!<br>
                • Eliminated players become spectators<br><br>
                <b>Tip:</b> Play it safe early - the field narrows as players get eliminated!`
        },
        'traitor': { 
            label: '🕵️ The Traitor', 
            desc: 'One Traitor tries to ruin everything!', 
            min: 3,
            rules: `<b>🕵️ The Traitor Rules</b><br><br>
                <b>Goal:</b> Traitor tries to sabotage. Everyone else tries to sync.<br><br>
                <b>How to Play:</b><br>
                • One random player is secretly the Traitor 🕵️<br>
                • Loyal players try to match the majority<br>
                • The Traitor tries to vote with minorities to lower the team's sync<br><br>
                <b>Winning:</b><br>
                • Loyalists win if sync stays above 60%<br>
                • Traitor wins if they drag sync below 40%<br>
                • The Traitor's identity is revealed at the end!<br><br>
                <b>Tip:</b> Traitors - be subtle! Too obvious and you'll be suspected.`
        },
        'kids': { 
            label: '👶 Kids Mode', 
            desc: 'Simple words. Family friendly!', 
            min: 2,
            rules: `<b>👶 Kids Mode Rules</b><br><br>
                <b>Goal:</b> Fun for the whole family! Vote together on kid-friendly words.<br><br>
                <b>How to Play:</b><br>
                • Only simple, family-friendly words appear<br>
                • Everyone votes Good 👍 or Bad 👎<br>
                • No complicated or adult content<br><br>
                <b>Scoring:</b><br>
                • Match the group = Points<br>
                • Everyone has fun - that's the real win!<br><br>
                <b>Perfect for:</b> Young children, family game nights, classroom activities`
        }
    },
    // Show rules modal for a game mode
    showModeRules(modeKey) {
        const mode = this.modeConfig[modeKey];
        if (!mode || !mode.rules) return;
        
        const existingModal = document.getElementById('modeRulesModal');
        if (existingModal) existingModal.remove();
        
        const modal = document.createElement('div');
        modal.id = 'modeRulesModal';
        modal.className = 'fixed inset-0 bg-black/70 z-[10000] flex items-center justify-center p-4 backdrop-blur-sm';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-pop max-h-[80vh] overflow-y-auto">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-xl font-black text-gray-800">${mode.label}</h3>
                    <button onclick="document.getElementById('modeRulesModal').remove()" class="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                </div>
                <div class="text-sm text-gray-600 leading-relaxed">
                    ${mode.rules}
                </div>
                <button onclick="document.getElementById('modeRulesModal').remove()" class="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition">
                    Got it!
                </button>
            </div>
        `;
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
        document.body.appendChild(modal);
    },
    init() {
        window.RoomManager = this;
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
        btn.className = 'fixed top-4 left-6 bg-white text-indigo-700 px-4 py-3 rounded-full shadow-lg z-50 font-bold cursor-pointer hover:bg-indigo-700 transition-transform active:scale-95 flex items-center gap-2';
        btn.style.cssText = 'width: 68px; height: 68px; padding: 0;';
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
    const banner = document.querySelector('.mp-banner-text');
    if(banner) banner.remove();
    const ui = document.getElementById('mp-mode-ui');
    if(ui) ui.remove();
    this.renderLobby();
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
        this.socket.on('publicGamesList', (games) => {
            this.publicGames = games || [];
            this.renderPublicGames();
        });
        this.socket.on('roomFull', ({ message }) => {
            alert(message || 'This room is full!');
        });
        this.socket.on('roleAlert', (msg) => {
             this.amITraitor = true;
        });
        this.socket.on('teamAssigned', ({ team }) => {
            this.myTeam = team;
        });
        this.socket.on('vipAssigned', ({ vipId, vipName }) => {
            this.vipId = vipId;
            this.vipName = vipName;
            this.amIVip = (vipId === this.playerId);
        });
        this.socket.on('gameStarted', (data) => {
            this.closeLobby();
            this.active = true;
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
        this.socket.on('startError', ({ message }) => {
            alert(message || 'Cannot start game');
        });
        this.socket.on('roomUpdate', (data) => {
            if (data.theme && !this.isHost) {
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
            State.runtime.allWords = [data.word];
            State.runtime.currentWordIndex = 0;
            const wd = DOM.game.wordDisplay;
            wd.className = ''; // Remove 'fly-left' animations from previous round
            wd.style.transform = 'none';
            wd.style.opacity = '1';
            wd.style.filter = 'none';
            wd.style.color = '';
            UIManager.displayWord(data.word);
            const me = this.players.find(p => p.id === this.playerId);
            const isDead = this.currentMode === 'survival' && me && me.lives <= 0;
            const isSpectator = me && me.isSpectator;
            if (isDead || isSpectator) {
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
                if (this.currentMode === 'survival') {
                    if (me && typeof me.lives === 'number') {
                        if (me.lives > 0) {
                            label += ` ${'❤️'.repeat(me.lives)}`;
                        } else {
                            label = `💀 YOU DIED - Spectating (${data.wordCurrent}/${data.wordTotal})`;
                        }
                    }
                }
                if (isSpectator && !isDead) {
                    label = `👁️ Spectating (${data.wordCurrent}/${data.wordTotal})`;
                }
                banner.textContent = label;
            }
        });
        // Controversial King - shows 3 words to pick from
        this.socket.on('controversialRound', (data) => {
            const { words, roundNum, totalRounds } = data;
            // Hide regular game UI
            UIManager.disableButtons(true);
            DOM.game.buttons.good.style.display = 'none';
            DOM.game.buttons.bad.style.display = 'none';
            DOM.game.wordDisplay.style.display = 'none';
            
            // Remove existing controversial UI if present
            const existing = document.getElementById('controversialPickUI');
            if (existing) existing.remove();
            
            // Create word selection UI
            const ui = document.createElement('div');
            ui.id = 'controversialPickUI';
            ui.className = 'fixed inset-0 bg-black/80 z-[9998] flex flex-col items-center justify-center p-4';
            ui.innerHTML = `
                <div class="text-center mb-6">
                    <div class="text-4xl mb-2">🔥</div>
                    <h2 class="text-2xl font-black text-white">CONTROVERSIAL KING</h2>
                    <p class="text-white/70 mt-1">Round ${roundNum}/${totalRounds} - Pick the MOST controversial word!</p>
                    <p class="text-yellow-400 text-sm mt-1">Closest to 50/50 split wins!</p>
                </div>
                <div class="grid grid-cols-1 gap-4 w-full max-w-md">
                    ${words.map((w, i) => `
                        <button class="controversial-word-btn p-6 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 rounded-2xl text-white font-black text-2xl shadow-lg transition transform hover:scale-105 active:scale-95" data-word-id="${w._id}" data-index="${i}">
                            ${w.text.toUpperCase()}
                        </button>
                    `).join('')}
                </div>
                <p class="text-white/50 text-sm mt-6">⏳ Pick quickly for bonus points!</p>
            `;
            document.body.appendChild(ui);
            
            // Add click handlers
            ui.querySelectorAll('.controversial-word-btn').forEach(btn => {
                btn.onclick = () => {
                    const wordId = btn.dataset.wordId;
                    const idx = parseInt(btn.dataset.index);
                    
                    // Visual feedback - highlight selected
                    ui.querySelectorAll('.controversial-word-btn').forEach(b => {
                        b.disabled = true;
                        b.style.opacity = b === btn ? '1' : '0.4';
                    });
                    btn.innerHTML += ' ✓';
                    
                    // Send selection to server
                    this.socket.emit('controversialPick', { 
                        roomCode: this.roomCode, 
                        wordId,
                        wordIndex: idx
                    });
                };
            });
            
            // Update banner
            const banner = document.querySelector('.mp-banner-text');
            if (banner) {
                banner.textContent = `🔥 Controversial King (${roundNum}/${totalRounds})`;
            }
        });
        
        // Controversial King - round result
        this.socket.on('controversialResult', (data) => {
            const { words, winnerIndex, scores } = data;
            const ui = document.getElementById('controversialPickUI');
            if (!ui) return;
            
            // Calculate controversy scores (closeness to 50%)
            const getControversyScore = (w) => {
                const g = w.goodVotes || 0;
                const b = w.badVotes || 0;
                const total = g + b;
                if (total === 0) return 0;
                const ratio = g / total;
                // Return how close to 0.5 (lower = more controversial)
                return Math.abs(0.5 - ratio);
            };
            
            // Update UI to show results
            const btns = ui.querySelectorAll('.controversial-word-btn');
            btns.forEach((btn, i) => {
                const w = words[i];
                const g = w.goodVotes || 0;
                const b = w.badVotes || 0;
                const total = g + b;
                const pct = total > 0 ? Math.round((g / total) * 100) : 50;
                const deviation = Math.abs(50 - pct);
                
                btn.innerHTML = `
                    <div class="text-xl">${w.text.toUpperCase()}</div>
                    <div class="text-sm mt-2 font-normal">
                        ${pct}% Good / ${100-pct}% Bad
                        <br><span class="${i === winnerIndex ? 'text-yellow-300' : 'text-white/50'}">${deviation}% from 50/50</span>
                    </div>
                    ${i === winnerIndex ? '<div class="mt-2 text-yellow-400">👑 MOST CONTROVERSIAL!</div>' : ''}
                `;
                
                btn.className = i === winnerIndex 
                    ? 'p-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl text-white shadow-lg border-4 border-yellow-300'
                    : 'p-4 bg-gray-700 rounded-2xl text-white/60 shadow-lg';
            });
            
            // Show player scores
            if (scores && scores.length > 0) {
                const scoresHtml = scores.map(s => 
                    `<div class="flex justify-between items-center py-1">
                        <span class="${s.correct ? 'text-yellow-400' : 'text-white/60'}">${s.name}</span>
                        <span class="font-bold ${s.correct ? 'text-green-400' : 'text-red-400'}">${s.correct ? '+3' : '+0'}</span>
                    </div>`
                ).join('');
                
                const scoresDiv = document.createElement('div');
                scoresDiv.className = 'mt-4 bg-black/50 rounded-xl p-4 w-full max-w-md';
                scoresDiv.innerHTML = `
                    <div class="text-white/70 text-sm font-bold mb-2">ROUND RESULTS</div>
                    ${scoresHtml}
                `;
                ui.querySelector('.grid').after(scoresDiv);
            }
            
            // Auto-remove after delay
            setTimeout(() => {
                if (ui && ui.parentNode) {
                    ui.remove();
                    // Restore regular game UI for next round or game over
                    DOM.game.buttons.good.style.display = '';
                    DOM.game.buttons.bad.style.display = '';
                    DOM.game.wordDisplay.style.display = '';
                }
            }, 3500);
        });
        this.socket.on('playerVoted', () => { Haptics.light(); });
this.socket.on('roundResult', (data) => {
    if (data.players) this.players = data.players;
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
            // Clean up Controversial King UI if present
            const controversialUI = document.getElementById('controversialPickUI');
            if (controversialUI) controversialUI.remove();
            DOM.game.buttons.good.style.display = '';
            DOM.game.buttons.bad.style.display = '';
            DOM.game.wordDisplay.style.display = '';
            
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
        const existingModal = document.getElementById('lobbyModal');
        let scrollPlayers = 0;
        let scrollSettings = 0;
        if (existingModal) {
            const scrolls = existingModal.querySelectorAll('.custom-scrollbar');
            if (scrolls[0]) scrollPlayers = scrolls[0].scrollTop;
            if (scrolls[1]) scrollSettings = scrolls[1].scrollTop;
            existingModal.remove();
        }
        const activeMode = this.currentMode;
        const activeWordCount = this.currentWordCount;
        const activeDrinking = this.drinkingMode;
        const safeCode = this.roomCode || '...';
        const roomIsPublic = this.isPublic;
        const roomMaxPlayers = this.maxPlayers || 8;
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
        const reannounceBtn = (roomIsPublic && this.isHost)
            ? `<button onclick="RoomManager.reannounce()" class="ml-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full transition">📢 Reannounce</button>`
            : '';
        const privacyBadge = roomIsPublic
            ? `<div class="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full mt-1"><span>🌍</span> Public (${playersList.length}/${roomMaxPlayers})${reannounceBtn}</div>`
            : `<div class="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full mt-1"><span>🔒</span> Private</div>`;
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
            // Add info button for selected mode
            const infoBtn = isSelected 
                ? `<button onclick="event.stopPropagation(); window.RoomManager.showModeRules('${key}')" class="ml-2 w-6 h-6 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full text-xs font-bold flex items-center justify-center transition" title="View Rules">ℹ️</button>`
                : '';
            modesHtml += `
                <div ${clickAttr} class="flex flex-col p-3 rounded-xl transition-all duration-200 ${styleClass} min-h-[80px]">
                    <div class="flex justify-between items-center mb-1">
                        <span class="font-bold text-sm ${isSelected ? 'text-indigo-700' : 'text-gray-700'}">${conf.label}</span>
                        <div class="flex items-center">
                            ${infoBtn}
                            ${isSelected ? '<span class="ml-1">✅</span>' : ''}
                        </div>
                    </div>
                    <span class="text-xs text-gray-500 leading-tight">${conf.desc}</span>
                </div>`;
        });
        const sliderDisabled = !this.isHost ? 'disabled' : '';
        const sliderOpacity = !this.isHost ? 'opacity-70' : '';
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
    async startP2PHost() {
        const nameInput = document.getElementById('menuUsernameInput');
        if (nameInput?.value?.trim()) {
            State.data.username = nameInput.value.trim();
            State.save('username', State.data.username);
        }
        LocalPeerManager.init(this.socket);
        const menu = document.getElementById('mpMenu');
        if (menu) menu.remove();
        UIManager.showMessage('Creating local room... 📡');
        await LocalPeerManager.createRoom(10);
    },
    async joinP2P() {
        const codeInput = document.getElementById('menuRoomCodeInput');
        const roomCode = codeInput?.value?.trim().toUpperCase();
        if (!roomCode || roomCode.length < 3) {
            UIManager.showPostVoteMessage('Enter a room code! 📝');
            if (codeInput) codeInput.focus();
            return;
        }
        const nameInput = document.getElementById('menuUsernameInput');
        if (nameInput?.value?.trim()) {
            State.data.username = nameInput.value.trim();
            State.save('username', State.data.username);
        }
        LocalPeerManager.init(this.socket);
        const menu = document.getElementById('mpMenu');
        if (menu) menu.remove();
        UIManager.showMessage('Joining local room... 🔗');
        await LocalPeerManager.joinRoom(roomCode);
    },
    openMenu() {
        const existing = document.getElementById('mpMenu');
        if (existing) existing.remove();
        const currentName = State.data.username || '';
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
                <div class="bg-white p-6 rounded-2xl shadow-2xl flex-1 animate-pop relative border-t-4 border-green-500 text-center" style="animation-delay: 0.1s">
            
            <a href="https://www.facebook.com/groups/2647677235633381" target="_blank" rel="noopener noreferrer" class="absolute top-3 right-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition text-sm font-bold">
                <img src="fblogo.png" alt="FB" class="w-5 h-5">
                <span class="hidden sm:inline">Group</span>
            </a>

            <h2 class="text-2xl font-black text-gray-800 mb-4 flex items-center justify-center gap-2">
                <span>🌍</span> PUBLIC GAMES
            </h2>

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
            const vEl = document.querySelector('.version-indicator');
            if (vEl) {
                vEl.textContent = `v${CONFIG.APP_VERSION} | Made by Gilxs since 12,025`;
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
            if (DOM.theme.chooser) {
                const chooser = DOM.theme.chooser;
                const currentTheme = State.data.currentTheme || 'default';
                const themeName = currentTheme === 'ballpit' ? 'Ball Pit' : currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1);
                const btn = document.createElement('button');
                btn.id = 'themeChooserBtn';
                btn.className = chooser.className;
                btn.innerHTML = `${themeName} ▼`;
                btn.style.cssText = chooser.style.cssText + 'cursor: pointer;';
                btn.onclick = (e) => {
                    e.preventDefault();
                    ThemeManager.showGallery();
                };
                chooser.style.display = 'none';
                chooser.parentNode.insertBefore(btn, chooser.nextSibling);
                DOM.theme.chooserBtn = btn;
            }
            State.init();
            RoomManager.init();
            
            // Create Mini Games button
            const miniGamesBtn = document.createElement('button');
            miniGamesBtn.id = 'miniGamesBtn';
            miniGamesBtn.className = 'fixed top-4 right-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg z-50 font-bold cursor-pointer hover:from-purple-500 hover:to-pink-500 transition-all active:scale-95 flex items-center justify-center';
            miniGamesBtn.style.cssText = 'width: 52px; height: 52px; padding: 0;';
            miniGamesBtn.innerHTML = `<span style="font-size: 24px;">🎮</span>`;
            miniGamesBtn.title = 'Mini Games';
            miniGamesBtn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); MiniGames.showMenu(); };
            document.body.appendChild(miniGamesBtn);
            
            if (State.data.settings.hideMultiplayer || State.data.settings.kidsMode) {
                const roomBtn = document.getElementById('roomBtn');
                if (roomBtn) roomBtn.style.display = 'none';
            }
            if (State.data.settings.kidsMode) {
                miniGamesBtn.style.display = 'none';
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
            if (State.data.settings.hideCards) {
                this.applyHideCards(true);
            }
            this.applyUIVisibility();
            await this.refreshData();
            
            // Sync any pending mini-game scores that failed to upload
            API.syncPendingMiniGameScores();
            
            DiscoveryManager.init();
            setTimeout(() => {
                if (DOM.screens && DOM.screens.loading) {
                    DOM.screens.loading.classList.add('opacity-0', 'pointer-events-none');
                    setTimeout(() => DOM.screens.loading?.remove(), 500);
                }
                
                // URL Hash Routing for direct mini-game links
                this.handleURLRoute();
                window.addEventListener('hashchange', () => this.handleURLRoute());
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
        if (State.runtime.allWords.length <= State.runtime.currentWordIndex) {
            try {
                const res = await fetch(`${CONFIG.API_BASE_URL}?t=${Date.now()}`); // Fetches 1 random word
                const data = await res.json();
                if (data && data.length > 0) State.runtime.allWords.push(data[0]);
                else State.runtime.allWords.push({ text: 'RETRY', _id: null });
            } catch(e) { State.runtime.allWords.push({ text: 'OFFLINE', _id: null }); }
        }
        if (!State.runtime.isMultiplayer) {
            const sourceList = State.runtime.fullWordList.length > 0 ? State.runtime.fullWordList : State.runtime.allWords;
            if (State.data.settings.zeroVotesOnly) {
                const unvoted = sourceList.filter(w => (w.goodVotes || 0) === 0 && (w.badVotes || 0) === 0);
                if (unvoted.length > 0) State.runtime.allWords = unvoted;
                else UIManager.showPostVoteMessage("No more new words! Showing random.");
            } else if (State.data.settings.controversialOnly) {
                const contro = sourceList.filter(w => {
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
        const n = Date.now();
        if (State.runtime.lastVoteTime > 0 && (n - State.runtime.lastVoteTime) < 250) {
            return;
        }
        if (State.runtime.isMultiplayer && typeof RoomManager !== 'undefined' && RoomManager.active) {
             RoomManager.submitVote(t);
             UIManager.disableButtons(true);
             DOM.game.wordDisplay.style.opacity = '0.5';
             return;
        }
        State.runtime.sameVoteMessage = null; // Reset
        if (t === 'good' || t === 'bad') {
            if (State.runtime.lastVoteType === t) {
                State.runtime.sameVoteStreak++;
            } else {
                State.runtime.sameVoteStreak = 1;
            }
            State.runtime.lastVoteType = t;
            if (State.runtime.sameVoteStreak === 6) {
                State.runtime.sameVoteMessage = t === 'good' ? "Every word is GOOD today? 🤔" : "Having a BAD day? 😤";
            } else if (State.runtime.sameVoteStreak >= 15) {
                State.runtime.sameVoteStreak = 0;
                const msg = t === 'good' ? "Too positive! Take a break." : "Too negative! Take a break.";
                UIManager.showMessage(msg, true);
                Haptics.heavy();
                this.handleCooldown();
                return;
            }
        }
        if (!State.runtime.voteTimestamps) State.runtime.voteTimestamps = [];
        State.runtime.voteTimestamps.push(n);
        State.runtime.voteTimestamps = State.runtime.voteTimestamps.filter(t => n - t < 11000);
        if (State.runtime.voteTimestamps.length >= 10) {
            State.runtime.voteTimestamps = [];
            UIManager.showMessage("Slow down! Read the words.", true);
            Haptics.heavy();
            this.handleCooldown();
            return;
        }
        State.runtime.lastVoteTime = n;
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
            if (OfflineManager.isActive()) {
                OfflineManager.queueVote(w._id, t);
                State.incrementVote();
                StreakManager.handleSuccess();
            } else {
                const res = await API.vote(w._id, t);
                if (res.status !== 403 && !res.ok) throw 0;
                w[`${t}Votes`] = (w[`${t}Votes`] || 0) + 1;
                const fullWord = State.runtime.fullWordList.find(fw => fw._id === w._id);
                if (fullWord && fullWord !== w) fullWord[`${t}Votes`] = w[`${t}Votes`];
                State.incrementVote();
                await API.submitUserVotes(State.data.userId, State.data.username, State.data.voteCount);
                StreakManager.handleSuccess();
            }
            if (State.runtime.isDailyMode) {
                const tod = new Date(), dStr = tod.toISOString().split('T')[0];
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
                        UIManager.showPostVoteMessage(`#${State.runtime.dailyVotesCount} - Keep looking! 🔍`);
                        setTimeout(() => { State.runtime.currentWordIndex++; this.nextWord(); }, 600);
                        return;
                    }
                }
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
                if (!State.runtime.nextTipAt) State.runtime.nextTipAt = Math.floor(Math.random() * 11) + 5; // 5-15
                if (State.data.voteCounterForTips >= State.runtime.nextTipAt) {
                    if (typeof GAME_TIPS !== 'undefined') {
                        m = GAME_TIPS[Math.floor(Math.random() * GAME_TIPS.length)];
                    }
                    State.save('voteCounterForTips', 0);
                    State.runtime.nextTipAt = Math.floor(Math.random() * 11) + 5; // Reset to new random 5-15
                }
            }
            const finalMessage = State.runtime.sameVoteMessage || m;
            UIManager.showPostVoteMessage(finalMessage);
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
        
        let hasDictionaryDef = false;
        
        try {
            // First try the external dictionary API
            const r = await API.define(w.text);
            if (r.ok) {
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
                hasDictionaryDef = true;
            }
        } catch {
            // Dictionary API failed, will try community definition
        }
        
        // If no dictionary definition found, try community definition
        if (!hasDictionaryDef) {
            const communityDef = await API.getCommunityDefinition(w._id);
            
            if (communityDef && communityDef.definition) {
                // Show community definition
                d.innerHTML = `
                    <div class="mb-4">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded">COMMUNITY DEFINITION</span>
                        </div>
                        <p class="text-gray-800 text-lg">${communityDef.definition}</p>
                        <p class="text-sm text-gray-500 mt-2">— Added by ${communityDef.author || 'Anonymous'}${communityDef.updatedAt ? ` on ${new Date(communityDef.updatedAt).toLocaleDateString()}` : ''}</p>
                    </div>
                    <div class="border-t pt-4 mt-4">
                        <button id="editCommunityDef" class="text-sm text-indigo-600 hover:text-indigo-800 font-medium">✏️ Suggest a better definition</button>
                    </div>
                `;
                document.getElementById('editCommunityDef').onclick = () => this.showAddDefinitionForm(w);
            } else {
                // No definition at all - show form to add one
                d.innerHTML = `
                    <div class="text-center py-4">
                        <p class="text-gray-500 mb-4">No dictionary definition found for this word.</p>
                        <p class="text-sm text-gray-400 mb-6">Be the first to add a community definition!</p>
                        <button id="addCommunityDef" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition">
                            ✨ Add Definition
                        </button>
                    </div>
                `;
                document.getElementById('addCommunityDef').onclick = () => this.showAddDefinitionForm(w);
            }
        }
    },
    
    showAddDefinitionForm(word) {
        const d = document.getElementById('definitionResults');
        const username = State.data.username || 'Anonymous';
        
        d.innerHTML = `
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Your definition for "${word.text.toUpperCase()}"</label>
                    <textarea id="communityDefInput" 
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                        rows="4"
                        maxlength="512"
                        placeholder="Enter a clear, helpful definition..."></textarea>
                    <p class="text-xs text-gray-400 mt-1"><span id="defCharCount">0</span>/512 characters</p>
                </div>
                <div class="flex gap-3">
                    <button id="submitCommunityDef" class="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition">
                        Submit Definition
                    </button>
                    <button id="cancelCommunityDef" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg transition">
                        Cancel
                    </button>
                </div>
                <p class="text-xs text-gray-500 text-center">Submitting as: ${username}</p>
            </div>
        `;
        
        const textarea = document.getElementById('communityDefInput');
        const charCount = document.getElementById('defCharCount');
        
        textarea.addEventListener('input', () => {
            charCount.textContent = textarea.value.length;
        });
        
        document.getElementById('submitCommunityDef').onclick = async () => {
            const definition = textarea.value.trim();
            if (!definition) {
                UIManager.showPostVoteMessage('Please enter a definition');
                return;
            }
            if (definition.length > 512) {
                UIManager.showPostVoteMessage('Definition is too long (max 512 characters)');
                return;
            }
            
            d.innerHTML = '<p class="text-center text-gray-500 animate-pulse">Saving definition...</p>';
            
            const result = await API.setCommunityDefinition(word._id, definition, username);
            if (result) {
                UIManager.showPostVoteMessage('✨ Definition added! Thank you!');
                this.showDefinition(); // Refresh to show the new definition
            } else {
                UIManager.showPostVoteMessage('Failed to save definition. Try again.');
                this.showAddDefinitionForm(word); // Show form again
            }
        };
        
        document.getElementById('cancelCommunityDef').onclick = () => {
            this.showDefinition(); // Go back to definition view
        };
        
        textarea.focus();
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
        const isKids = State.data.settings.kidsMode;
        DOM.game.buttons.custom.style.display = isKids ? 'none' : 'block';
        DOM.game.buttons.notWord.style.display = isKids ? 'none' : 'block';
        this.checkDailyStatus();
        ['compareWordsButton','qrGoodBtn','qrBadBtn'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.style.display = isKids ? 'none' : 'block';
        });
        let d = [];
        if (isKids) {
            d = await API.fetchKidsWords();
        } else {
            d = await API.getAllWords();
        }
        if (d && d.length > 0) {
            if (OfflineManager.isActive()) {
                d = State.data.offlineCache || d;
                for (let i = d.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [d[i], d[j]] = [d[j], d[i]];
                }
            } else {
                for (let i = d.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [d[i], d[j]] = [d[j], d[i]];
                }
            }
            State.runtime.allWords = d;
            State.runtime.fullWordList = d; // Store full list for stats
            if (!isKids) {
                 State.runtime.allWords = d.filter(w => (w.notWordVotes || 0) < 20);
                 State.runtime.fullWordList = State.runtime.allWords; // Update full list too
            }
        } else {
            State.runtime.allWords = [{ text: 'OFFLINE', _id: 'err' }];
            State.runtime.fullWordList = [];
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
                State.runtime.currentWordIndex = 0;
                UIManager.displayWord(State.runtime.allWords[0]);
            }
            const today = new Date().toISOString().split('T')[0];
            let history = State.data.wordHistory;
            const currentCount = State.runtime.fullWordList.length > 0 ? State.runtime.fullWordList.length : State.runtime.allWords.length;
            if (history.length > 1) {
                const cleaned = [history[0]];
                for (let i = 1; i < history.length; i++) {
                    const prev = cleaned[cleaned.length - 1];
                    const curr = history[i];
                    if (curr.count >= prev.count * 0.8) {
                        cleaned.push(curr);
                    }
                }
                if (cleaned.length !== history.length) {
                    history = cleaned;
                    State.data.wordHistory = history;
                    State.save('wordHistory', history);
                }
            }
            if (history.length === 0 || history[history.length - 1].date !== today) {
                const lastCount = history.length > 0 ? history[history.length - 1].count : 0;
                if (currentCount >= lastCount) {
                    history.push({ date: today, count: currentCount });
                    if (history.length > 365) history.shift();
                    State.save('wordHistory', history);
                }
            } else {
                const todayEntry = history[history.length - 1];
                if (currentCount > todayEntry.count) {
                    todayEntry.count = currentCount;
                    State.save('wordHistory', history);
                }
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
    applyUIVisibility() {
        const s = State.data.settings;
        // Profile card (userStatsBar in header)
        const profileSection = DOM.header.userStatsBar;
        if (profileSection) {
            profileSection.style.display = s.hideProfile ? 'none' : '';
        }
        // Votes bar (good/bad vote counts and bar)
        const votesContainer = document.querySelector('.flex.items-center.gap-1.text-xs');
        const voteBarContainer = document.getElementById('headerBarGood')?.parentElement?.parentElement;
        if (votesContainer) votesContainer.style.display = s.hideVotesBar ? 'none' : '';
        if (voteBarContainer) voteBarContainer.style.display = s.hideVotesBar ? 'none' : '';
        // Top good/bad words section
        const rankingsSection = document.getElementById('rankingsSection');
        if (rankingsSection) {
            rankingsSection.style.display = s.hideTopWords ? 'none' : '';
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
        await API.submitUserVotes(
            d.userId,
            d.username,
            d.voteCount,
            d.daily.streak,
            d.daily.bestStreak
        );
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
        let seed = 0;
        for (let i = 0; i < t.length; i++) {
            seed = ((seed << 5) - seed) + t.charCodeAt(i);
            seed |= 0;
        }
        seed = Math.abs(seed);
        const isGolden = (seed % 2) === 0;
        State.runtime.dailyChallengeType = isGolden ? 'golden' : 'single';
        if (isGolden) {
            UIManager.showMessage('🌟 Find Golden Word!');
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
                const shuffled = [...words];
                for (let i = shuffled.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                }
                const goldenPosition = 10 + Math.floor(Math.random() * 16);
                const goldenWordIdx = shuffled.findIndex(w =>
                    w._id === State.runtime.goldenWord._id ||
                    w.text === State.runtime.goldenWord.text
                );
                if (goldenWordIdx !== -1) {
                    shuffled.splice(goldenWordIdx, 1);
                }
                shuffled.splice(goldenPosition, 0, State.runtime.goldenWord);
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
        if (State.data.settings.kidsMode || t === l) {
             DOM.game.dailyBanner.style.display = 'none';
        } else {
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
        html += '<h3 id="dailyStreaksHeader" class="text-lg font-bold text-gray-800 mb-3 mt-6 pt-2 border-t border-gray-100">🔥 Top Daily Streaks</h3>';
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
        let globalHistory = [];
        try {
            globalHistory = await API.fetchGlobalStatsHistory();
        } catch (e) {
            console.warn("Could not fetch global stats history:", e);
        }
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
            let voteHistory = globalHistory.filter(h => h.totalVotes > 0);
            if (voteHistory.length === 0) {
                const today = new Date().toISOString().split('T')[0];
                voteHistory = [{ date: today, totalVotes: totalVotes }];
            }
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
            let history = globalHistory.filter(h => h.totalWords > 0);
            if (history.length === 0) {
                history = State.data.wordHistory || [];
            }
            if (history.length === 0) {
                const today = new Date().toISOString().split('T')[0];
                history = [{ date: today, totalWords: w.length, count: w.length }];
            }
            history = history.map(h => ({ ...h, count: h.totalWords || h.count || 0 }));
            if (history.length > 1) {
                const cleaned = [history[0]];
                for (let i = 1; i < history.length; i++) {
                    const prev = cleaned[cleaned.length - 1];
                    const curr = history[i];
                    if (curr.count >= prev.count * 0.8) {
                        cleaned.push(curr);
                    }
                }
                history = cleaned;
            }
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
    },
    
    // URL Hash Routing for direct mini-game links
    // Supported hashes: #wordwar, #defdash, #arcade, #leaderboard
    handleURLRoute() {
        const hash = window.location.hash.toLowerCase().replace('#', '');
        if (!hash) return;
        
        // Clear the hash after processing to allow re-triggering
        const clearHash = () => {
            history.replaceState(null, null, window.location.pathname + window.location.search);
        };
        
        switch(hash) {
            case 'wordwar':
            case 'word-war':
            case 'war':
                clearHash();
                setTimeout(() => {
                    if (typeof MiniGames !== 'undefined' && MiniGames.wordWar) {
                        MiniGames.wordWar.start();
                    }
                }, 100);
                break;
                
            case 'defdash':
            case 'def-dash':
            case 'definitiondash':
            case 'definition-dash':
            case 'def':
                clearHash();
                setTimeout(() => {
                    if (typeof MiniGames !== 'undefined' && MiniGames.definitionDash) {
                        MiniGames.definitionDash.start();
                    }
                }, 100);
                break;
                
            case 'arcade':
            case 'leaderboard':
            case 'highscores':
            case 'scores':
                clearHash();
                setTimeout(() => {
                    if (typeof MiniGames !== 'undefined' && MiniGames.showLeaderboard) {
                        MiniGames.showLeaderboard();
                    }
                }, 100);
                break;
                
            case 'minigames':
            case 'mini-games':
            case 'games':
                clearHash();
                setTimeout(() => {
                    if (typeof MiniGames !== 'undefined' && MiniGames.showMenu) {
                        MiniGames.showMenu();
                    }
                }, 100);
                break;
                
            case 'wordjump':
            case 'word-jump':
            case 'jump':
                clearHash();
                setTimeout(() => {
                    if (typeof MiniGames !== 'undefined' && MiniGames.wordJump) {
                        MiniGames.wordJump.start();
                    }
                }, 100);
                break;
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
async showLeaderboard(startCabinetIndex = 0) {
        const self = this;
        const username = (typeof State !== 'undefined' && State.data.username) ? State.data.username : "PLAYER";
        const initialCabinetIndex = startCabinetIndex;

        // 1. Fetch all data concurrently (Fail-safe)
        let globalStreak = [], globalWar = [], globalDef = [], globalJump = [];
        try {
            [globalStreak, globalWar, globalDef, globalJump] = await Promise.all([
                API.getGlobalScores().catch(() => []),
                API.getMiniGameScores('wordwar').catch(() => []),
                API.getMiniGameScores('defdash').catch(() => []),
                API.getMiniGameScores('wordjump').catch(() => [])
            ]);
        } catch (e) { console.error("Score fetch error", e); }

        // 2. Inject HIGH-FIDELITY Arcade CSS
        if (!document.getElementById('arcade-styles-v6')) {
            const s = document.createElement('style');
            s.id = 'arcade-styles-v6';
            s.innerHTML = `
                @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&family=Black+Ops+One&display=swap');
                
                :root {
                    --cab-w: 420px; 
                    --cab-h: 780px;
                    --cab-gap: 50px;
                }
                @media (min-width: 768px) {
                    :root { --cab-w: 520px; --cab-h: 880px; }
                }

                /* === SCENE === */
                .arcade-modal {
                    position: fixed; inset: 0; z-index: 9999;
                    background: linear-gradient(180deg, #0d0d1a 0%, #000 100%);
                    display: flex; flex-direction: column; overflow: hidden;
                    perspective: 1200px;
                }
                .arcade-floor {
                    position: absolute; bottom: 0; left: -50%; right: -50%; height: 35vh;
                    background: 
                        linear-gradient(0deg, rgba(0,0,0,0.9), transparent 70%),
                        repeating-linear-gradient(90deg, rgba(80,60,120,0.15) 0px, transparent 1px, transparent 80px),
                        repeating-linear-gradient(0deg, rgba(80,60,120,0.1) 0px, transparent 1px, transparent 50px);
                    transform: rotateX(75deg);
                    transform-origin: center bottom;
                    pointer-events: none; z-index: 0;
                }
                .arcade-ceiling-glow {
                    position: absolute; top: -50px; left: 20%; right: 20%; height: 150px;
                    background: radial-gradient(ellipse at center, rgba(147,51,234,0.15) 0%, transparent 70%);
                    pointer-events: none; z-index: 0;
                }
                .arcade-header-overlay {
                    position: absolute; top: 0; left: 0; right: 0; height: 80px;
                    background: linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%);
                    z-index: 100; pointer-events: none;
                }

                /* === SLIDING ROW === */
                .cabinet-viewport {
                    flex: 1; display: flex; align-items: center;
                    width: 100%; z-index: 10;
                    touch-action: pan-x;
                }
                .cabinet-row {
                    display: flex; 
                    gap: var(--cab-gap);
                    transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
                    will-change: transform;
                    align-items: flex-end;
                    height: var(--cab-h);
                }

                /* === CABINET SHELL === */
                .arcade-cabinet {
                    width: var(--cab-w); 
                    height: var(--cab-h);
                    flex-shrink: 0;
                    position: relative;
                    border-radius: 12px 12px 6px 6px;
                    transition: transform 0.5s ease, opacity 0.5s ease, filter 0.5s ease;
                    display: flex; flex-direction: column;
                    transform-style: preserve-3d;
                }
                /* 3D Side panels */
                .arcade-cabinet::before {
                    content: ''; position: absolute; 
                    top: 0; bottom: 0; left: -8px; width: 8px;
                    background: linear-gradient(90deg, rgba(0,0,0,0.6), rgba(0,0,0,0.2));
                    transform: rotateY(-90deg);
                    transform-origin: right;
                    border-radius: 12px 0 0 6px;
                }
                .arcade-cabinet::after {
                    content: ''; position: absolute;
                    top: 0; bottom: 0; right: -8px; width: 8px;
                    background: linear-gradient(90deg, rgba(0,0,0,0.2), rgba(0,0,0,0.6));
                    transform: rotateY(90deg);
                    transform-origin: left;
                    border-radius: 0 12px 6px 0;
                }
                .cabinet-shadow {
                    position: absolute; inset: 0;
                    border-radius: 12px 12px 6px 6px;
                    box-shadow: 
                        inset 4px 0 12px rgba(255,255,255,0.08),
                        inset -4px 0 12px rgba(0,0,0,0.5),
                        0 40px 80px rgba(0,0,0,0.9),
                        0 10px 30px rgba(0,0,0,0.6);
                    pointer-events: none; z-index: 100;
                }
                .arcade-cabinet.active {
                    transform: scale(1.05) translateZ(40px);
                    z-index: 50; filter: brightness(1.1); opacity: 1;
                }
                .arcade-cabinet.inactive {
                    transform: scale(0.88) translateZ(-30px);
                    z-index: 1; filter: brightness(0.45) saturate(0.5); opacity: 0.7;
                    cursor: pointer;
                }

                /* === CABINET THEMES === */
                .theme-wood {
                    background: linear-gradient(180deg, #6d4c41 0%, #5d4037 30%, #4e342e 60%, #3e2723 100%);
                    background-image: 
                        repeating-linear-gradient(90deg, rgba(0,0,0,0.08) 0px, transparent 2px, transparent 25px),
                        repeating-linear-gradient(0deg, rgba(255,255,255,0.015) 0px, transparent 1px, transparent 6px);
                }
                .theme-wood .artwork-frame { 
                    background: linear-gradient(135deg, #8d6e63 0%, #5d4037 50%, #3e2723 100%);
                    border: 6px solid #a1887f;
                    box-shadow: inset 0 0 30px rgba(0,0,0,0.7), 0 4px 20px rgba(0,0,0,0.5);
                }
                .theme-wood .artwork-inner {
                    background: 
                        radial-gradient(ellipse at 30% 20%, rgba(255,200,100,0.4) 0%, transparent 50%),
                        radial-gradient(ellipse at 70% 80%, rgba(255,100,50,0.3) 0%, transparent 50%),
                        linear-gradient(180deg, #ff8a65 0%, #d84315 50%, #bf360c 100%);
                }
                .theme-wood .artwork-title { color: #fff3e0; text-shadow: 3px 3px 0 #bf360c, 0 0 30px rgba(255,138,101,0.8); }
                .theme-wood .artwork-sub { color: #ffccbc; }
                .theme-wood .artwork-decor { color: rgba(255,200,150,0.6); }
                
                .theme-camo {
                    background: linear-gradient(180deg, #455a3c 0%, #3d4a2d 30%, #2d3a1f 60%, #1a2410 100%);
                    background-image: 
                        radial-gradient(ellipse at 20% 30%, rgba(74,92,56,0.5) 0%, transparent 50%),
                        radial-gradient(ellipse at 80% 60%, rgba(26,33,21,0.6) 0%, transparent 40%),
                        radial-gradient(ellipse at 50% 80%, rgba(45,58,31,0.4) 0%, transparent 45%);
                }
                .theme-camo .artwork-frame { 
                    background: linear-gradient(135deg, #4a3728 0%, #2d1f16 50%, #1a110d 100%);
                    border: 6px solid #5d4037;
                    box-shadow: inset 0 0 30px rgba(0,0,0,0.7), 0 4px 20px rgba(0,0,0,0.5);
                }
                .theme-camo .artwork-inner {
                    background: 
                        radial-gradient(ellipse at 50% 30%, rgba(255,50,50,0.5) 0%, transparent 60%),
                        radial-gradient(ellipse at 20% 70%, rgba(0,0,0,0.5) 0%, transparent 50%),
                        linear-gradient(180deg, #8b0000 0%, #4a0000 40%, #1a0000 100%);
                }
                .theme-camo .artwork-title { color: #fafafa; font-family: 'Black Ops One', sans-serif; text-shadow: 4px 4px 0 #000, 0 0 40px rgba(255,0,0,0.6); letter-spacing: 4px; }
                .theme-camo .artwork-sub { color: #ef9a9a; }
                .theme-camo .artwork-decor { color: rgba(255,100,100,0.5); }

                .theme-cyber {
                    background: linear-gradient(180deg, #0f0f0f 0%, #0a0a0a 50%, #050505 100%);
                    border: 2px solid rgba(0,255,136,0.5);
                    box-shadow: 0 0 40px rgba(0,255,136,0.2), inset 0 0 40px rgba(0,255,136,0.03);
                }
                .theme-cyber .cabinet-shadow {
                    box-shadow: 
                        inset 4px 0 12px rgba(0,255,136,0.1),
                        inset -4px 0 12px rgba(0,0,0,0.5),
                        0 40px 80px rgba(0,0,0,0.9),
                        0 0 60px rgba(0,255,136,0.15);
                }
                .theme-cyber .artwork-frame { 
                    background: linear-gradient(135deg, #001a0d 0%, #000d06 50%, #000502 100%);
                    border: 4px solid #00ff88;
                    box-shadow: inset 0 0 40px rgba(0,255,136,0.3), 0 0 30px rgba(0,255,136,0.4);
                }
                .theme-cyber .artwork-inner {
                    background: 
                        radial-gradient(ellipse at 50% 50%, rgba(0,255,136,0.2) 0%, transparent 70%),
                        repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(0,255,136,0.05) 3px, rgba(0,255,136,0.05) 6px),
                        linear-gradient(180deg, #001a0d 0%, #000d06 100%);
                }
                .theme-cyber .artwork-title { color: #00ff88; text-shadow: 0 0 10px #00ff88, 0 0 30px #00ff88, 0 0 60px #00aa55; }
                .theme-cyber .artwork-sub { color: #4ade80; }
                .theme-cyber .artwork-decor { color: rgba(0,255,136,0.4); }

                /* Sky Theme for Word Jump */
                .theme-sky {
                    background: linear-gradient(180deg, #38bdf8 0%, #0ea5e9 30%, #0284c7 60%, #0369a1 100%);
                    border: 2px solid rgba(255,255,255,0.3);
                    box-shadow: 0 0 40px rgba(56,189,248,0.2), inset 0 0 40px rgba(255,255,255,0.05);
                }
                .theme-sky .cabinet-shadow {
                    box-shadow: 
                        inset 4px 0 12px rgba(255,255,255,0.15),
                        inset -4px 0 12px rgba(0,0,0,0.3),
                        0 40px 80px rgba(0,0,0,0.9),
                        0 0 60px rgba(56,189,248,0.15);
                }
                .theme-sky .artwork-frame { 
                    background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%);
                    border: 4px solid #7dd3fc;
                    box-shadow: inset 0 0 40px rgba(255,255,255,0.2), 0 0 30px rgba(56,189,248,0.4);
                }
                .theme-sky .artwork-inner {
                    background: 
                        radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.4) 0%, transparent 50%),
                        radial-gradient(ellipse at 70% 80%, rgba(34,197,94,0.3) 0%, transparent 50%),
                        linear-gradient(180deg, #7dd3fc 0%, #38bdf8 50%, #0ea5e9 100%);
                }
                .theme-sky .artwork-title { color: #fff; text-shadow: 2px 2px 0 #0369a1, 0 0 30px rgba(255,255,255,0.8); }
                .theme-sky .artwork-sub { color: #e0f2fe; }
                .theme-sky .artwork-decor { color: rgba(255,255,255,0.5); }
                .theme-sky .crt-content { color: #38bdf8; text-shadow: 0 0 8px rgba(56,189,248,0.6); }
                .theme-sky .score-row.highlight { background: rgba(56,189,248,0.15); }

                /* === ARTWORK MARQUEE (Backlit Sign) === */
                .artwork-frame {
                    height: 130px; margin: 12px 15px 8px 15px; border-radius: 8px;
                    position: relative; overflow: hidden;
                }
                .artwork-inner {
                    position: absolute; inset: 6px;
                    border-radius: 4px;
                    display: flex; flex-direction: column; 
                    align-items: center; justify-content: center;
                    overflow: hidden;
                }
                .artwork-scanlines {
                    position: absolute; inset: 0;
                    background: repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px);
                    pointer-events: none; z-index: 3;
                }
                .artwork-glow {
                    position: absolute; inset: 0;
                    background: radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.15) 0%, transparent 60%);
                    pointer-events: none; z-index: 4;
                }
                .artwork-title { 
                    font-size: 28px; font-weight: 900; z-index: 5; 
                    text-transform: uppercase; letter-spacing: 2px;
                    animation: artwork-pulse 3s ease-in-out infinite;
                }
                .artwork-sub { 
                    font-size: 10px; z-index: 5; margin-top: 6px; 
                    font-weight: 700; letter-spacing: 4px; text-transform: uppercase;
                }
                .artwork-decor {
                    position: absolute; z-index: 2;
                    font-size: 60px; opacity: 0.3;
                    pointer-events: none;
                }
                .artwork-decor.left { left: 10px; top: 50%; transform: translateY(-50%); }
                .artwork-decor.right { right: 10px; top: 50%; transform: translateY(-50%); }
                
                /* Backlight glow effect */
                .artwork-backlight {
                    position: absolute; top: -50%; left: -50%; right: -50%; bottom: -50%;
                    background: radial-gradient(ellipse at center, currentColor 0%, transparent 70%);
                    opacity: 0.15;
                    animation: backlight-pulse 4s ease-in-out infinite alternate;
                    pointer-events: none;
                }

                /* === CRT MONITOR === */
                .crt-housing {
                    flex: 1; margin: 0 15px 10px 15px;
                    background: linear-gradient(180deg, #2a2a2a 0%, #1c1c1c 50%, #121212 100%);
                    border-radius: 10px 10px 16px 16px;
                    padding: 10px;
                    box-shadow: 
                        inset 0 2px 6px rgba(255,255,255,0.08), 
                        inset 0 -4px 10px rgba(0,0,0,0.6),
                        0 8px 20px rgba(0,0,0,0.5);
                    position: relative;
                }
                /* Theme-specific CRT housing */
                .theme-wood .crt-housing {
                    background: linear-gradient(180deg, #5d4037 0%, #4e342e 30%, #3e2723 60%, #2e1f1a 100%);
                    box-shadow: 
                        inset 0 2px 6px rgba(255,200,150,0.1), 
                        inset 0 -4px 10px rgba(0,0,0,0.6),
                        0 8px 20px rgba(0,0,0,0.5);
                }
                .theme-camo .crt-housing {
                    background: linear-gradient(180deg, #4a5240 0%, #3d4435 30%, #2e3328 60%, #1f2218 100%);
                    box-shadow: 
                        inset 0 2px 6px rgba(129,199,132,0.08), 
                        inset 0 -4px 10px rgba(0,0,0,0.6),
                        0 8px 20px rgba(0,0,0,0.5);
                }
                .theme-cyber .crt-housing {
                    background: linear-gradient(180deg, #0a1a10 0%, #061208 30%, #030a05 60%, #010503 100%);
                    border: 1px solid rgba(0,255,136,0.2);
                    box-shadow: 
                        inset 0 2px 6px rgba(0,255,136,0.05), 
                        inset 0 -4px 10px rgba(0,0,0,0.6),
                        0 8px 20px rgba(0,0,0,0.5),
                        0 0 20px rgba(0,255,136,0.1);
                }
                .theme-sky .crt-housing {
                    background: linear-gradient(180deg, #1e4a6e 0%, #153a58 30%, #0c2a42 60%, #061a2c 100%);
                    box-shadow: 
                        inset 0 2px 6px rgba(125,211,252,0.1), 
                        inset 0 -4px 10px rgba(0,0,0,0.6),
                        0 8px 20px rgba(0,0,0,0.5);
                }
                .crt-bezel {
                    position: absolute; inset: 6px;
                    background: linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 50%, #050505 100%);
                    border-radius: 8px 8px 14px 14px;
                    box-shadow: inset 0 0 25px rgba(0,0,0,0.95);
                }
                /* Theme-specific bezels */
                .theme-wood .crt-bezel {
                    background: linear-gradient(180deg, #3e2723 0%, #2e1f1a 50%, #1a1210 100%);
                    border: 2px solid #5d4037;
                    border-top-color: #6d4c41;
                }
                .theme-camo .crt-bezel {
                    background: linear-gradient(180deg, #2e3328 0%, #1f2218 50%, #12150e 100%);
                    border: 2px solid #4a5240;
                    border-top-color: #5a6250;
                }
                .theme-cyber .crt-bezel {
                    background: linear-gradient(180deg, #030a05 0%, #020503 50%, #010302 100%);
                    border: 1px solid rgba(0,255,136,0.3);
                    box-shadow: inset 0 0 25px rgba(0,0,0,0.95), inset 0 0 10px rgba(0,255,136,0.1);
                }
                .theme-sky .crt-bezel {
                    background: linear-gradient(180deg, #0c2a42 0%, #061a2c 50%, #030d16 100%);
                    border: 2px solid #1e4a6e;
                    border-top-color: #2e5a7e;
                }
                .crt-screen {
                    position: absolute; inset: 12px;
                    background: radial-gradient(ellipse at 50% 50%, #0a0f18 0%, #030508 100%);
                    border-radius: 45% 45% 42% 42% / 10% 10% 8% 8%;
                    overflow: hidden;
                    box-shadow: 
                        inset 0 0 100px rgba(0,0,0,0.95),
                        0 0 3px rgba(100,150,255,0.4);
                }
                
                /* CRT Glass Effect */
                .crt-glass {
                    position: absolute; inset: 0; pointer-events: none; z-index: 20;
                    border-radius: 45% 45% 42% 42% / 10% 10% 8% 8%;
                    background: 
                        linear-gradient(165deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.04) 20%, transparent 40%),
                        linear-gradient(195deg, transparent 60%, rgba(255,255,255,0.02) 80%, rgba(255,255,255,0.06) 100%);
                    box-shadow: 
                        inset 2px 2px 4px rgba(255,255,255,0.1),
                        inset -2px -2px 4px rgba(0,0,0,0.4);
                }
                .crt-glare {
                    position: absolute; top: 5%; left: 8%; width: 35%; height: 25%; 
                    pointer-events: none; z-index: 21;
                    background: radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 70%);
                    border-radius: 50%;
                    transform: rotate(-15deg);
                }
                
                .scanlines {
                    position: absolute; inset: 0; pointer-events: none; z-index: 15;
                    background: repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px);
                    border-radius: 45% 45% 42% 42% / 10% 10% 8% 8%;
                }
                .screen-flicker {
                    position: absolute; inset: 0; pointer-events: none; z-index: 14;
                    background: transparent;
                    border-radius: 45% 45% 42% 42% / 10% 10% 8% 8%;
                    animation: flicker 0.15s infinite;
                    opacity: 0.03;
                }
                
                .crt-content {
                    position: relative; z-index: 10;
                    height: 100%; padding: 15px 10px; 
                    overflow: hidden;
                    font-family: 'VT323', monospace; font-size: 1.3rem;
                    display: flex; flex-direction: column;
                }
                .crt-content::-webkit-scrollbar { display: none; }

                /* === SCORES === */
                .score-header {
                    text-align: center; padding-bottom: 6px; margin-bottom: 4px;
                    border-bottom: 2px solid rgba(255,255,255,0.2);
                    font-size: 0.95rem; letter-spacing: 2px; opacity: 0.9;
                    flex-shrink: 0;
                }
                .score-list {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;
                    gap: 2px;
                    overflow: hidden;
                }
                .score-row { 
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 6px 4px; 
                    border-bottom: 1px solid rgba(255,255,255,0.08);
                    flex-shrink: 0;
                }
                .score-row:last-child { border-bottom: none; }
                .score-row.highlight { 
                    background: rgba(255,255,0,0.1); 
                    animation: pulse-row 1.5s ease-in-out infinite alternate;
                }
                .rank { width: 35px; opacity: 0.5; font-size: 1.1rem; }
                .name { flex: 1; letter-spacing: 2px; font-weight: bold; font-size: 1.1rem; }
                .score { font-weight: bold; font-size: 1.2rem; letter-spacing: 1px; }
                .no-scores {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    opacity: 0.6;
                    font-size: 1.1rem;
                    line-height: 1.6;
                }

                /* Theme-specific CRT colors */
                .theme-wood .crt-content { color: #ffa726; text-shadow: 0 0 8px rgba(255,167,38,0.5); }
                .theme-wood .score-row.highlight { background: rgba(255,167,38,0.15); }
                .theme-camo .crt-content { color: #81c784; text-shadow: 0 0 8px rgba(129,199,132,0.5); }
                .theme-camo .score-row.highlight { background: rgba(129,199,132,0.15); }
                .theme-cyber .crt-content { color: #00ff88; text-shadow: 0 0 8px rgba(0,255,136,0.6); }
                .theme-cyber .score-row.highlight { background: rgba(0,255,136,0.15); }

                /* === CONTROL PANEL === */
                .control-panel {
                    height: 110px; margin: 0 15px 15px 15px;
                    background: linear-gradient(180deg, #252525 0%, #1a1a1a 40%, #0f0f0f 100%);
                    border-radius: 6px 6px 8px 8px;
                    position: relative;
                    box-shadow: 
                        inset 0 2px 4px rgba(255,255,255,0.05), 
                        inset 0 -3px 6px rgba(0,0,0,0.6),
                        0 6px 15px rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    overflow: hidden;
                }
                .control-panel::before {
                    content: '';
                    position: absolute; top: 0; left: 0; right: 0; height: 2px;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
                }
                
                /* Metal panel texture */
                .panel-surface {
                    position: absolute; inset: 0;
                    background-image: 
                        repeating-linear-gradient(90deg, transparent 0px, transparent 4px, rgba(255,255,255,0.01) 4px, rgba(255,255,255,0.01) 8px);
                    border-radius: 6px 6px 8px 8px;
                    pointer-events: none;
                }
                
                /* Joystick */
                .joystick-area {
                    width: 90px; height: 90px;
                    margin-left: 20px;
                    position: relative;
                    display: flex; align-items: center; justify-content: center;
                }
                .joystick-base {
                    width: 70px; height: 70px;
                    background: radial-gradient(circle at 30% 30%, #3a3a3a, #1a1a1a);
                    border-radius: 50%;
                    box-shadow: 
                        inset 0 4px 8px rgba(0,0,0,0.8),
                        0 2px 4px rgba(0,0,0,0.5);
                    display: flex; align-items: center; justify-content: center;
                }
                .joystick-ring {
                    width: 55px; height: 55px;
                    background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%);
                    border-radius: 50%;
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.6);
                    display: flex; align-items: center; justify-content: center;
                }
                .joystick-stick {
                    width: 20px; height: 50px;
                    background: linear-gradient(90deg, #2a2a2a 0%, #4a4a4a 30%, #3a3a3a 70%, #1a1a1a 100%);
                    border-radius: 4px 4px 6px 6px;
                    position: relative;
                    transform: translateY(-10px) rotateX(0deg) rotateZ(0deg);
                    transform-origin: center bottom;
                    transition: transform 0.15s ease-out;
                    box-shadow: 
                        0 4px 8px rgba(0,0,0,0.5),
                        inset 0 0 2px rgba(255,255,255,0.1);
                }
                .joystick-stick.tilt-left {
                    transform: translateY(-10px) rotateZ(-15deg);
                }
                .joystick-stick.tilt-right {
                    transform: translateY(-10px) rotateZ(15deg);
                }
                .joystick-ball {
                    position: absolute;
                    top: -18px; left: 50%;
                    transform: translateX(-50%);
                    width: 32px; height: 32px;
                    border-radius: 50%;
                    background: radial-gradient(circle at 35% 35%, #ff4444, #aa0000 50%, #660000);
                    box-shadow: 
                        0 4px 8px rgba(0,0,0,0.6),
                        inset 0 -4px 8px rgba(0,0,0,0.4),
                        inset 0 4px 8px rgba(255,255,255,0.2);
                }
                
                /* Button cluster */
                .button-cluster {
                    flex: 1;
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                    align-items: center;
                    padding: 0 15px;
                }
                .arcade-btn {
                    width: 52px; height: 52px; border-radius: 50%; border: none;
                    position: relative;
                    cursor: pointer; 
                    display: grid; place-items: center;
                    transition: transform 0.08s, box-shadow 0.08s;
                    font-family: 'Press Start 2P', monospace;
                }
                .arcade-btn::before {
                    content: '';
                    position: absolute;
                    inset: 3px;
                    border-radius: 50%;
                    background: inherit;
                    box-shadow: inset 0 3px 5px rgba(255,255,255,0.3), inset 0 -3px 5px rgba(0,0,0,0.4);
                }
                .arcade-btn::after {
                    content: '';
                    position: absolute;
                    top: 6px; left: 15%;
                    width: 50%; height: 30%;
                    background: linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%);
                    border-radius: 50%;
                }
                .arcade-btn:active { 
                    transform: translateY(3px); 
                    box-shadow: 0 2px 0 rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.4) !important;
                }
                .btn-toggle { 
                    background: linear-gradient(180deg, #4a90ff 0%, #2563eb 50%, #1d4ed8 100%);
                    box-shadow: 
                        0 5px 0 #1e40af, 
                        0 8px 15px rgba(0,0,0,0.5),
                        0 0 15px rgba(59,130,246,0.3);
                    font-size: 20px;
                    color: #fff;
                    font-family: system-ui, -apple-system, sans-serif;
                    z-index: 1;
                    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
                }
                .btn-share { 
                    background: linear-gradient(180deg, #fbbf24 0%, #d97706 50%, #b45309 100%);
                    box-shadow: 
                        0 5px 0 #92400e, 
                        0 8px 15px rgba(0,0,0,0.5),
                        0 0 15px rgba(234,179,8,0.3);
                    font-size: 18px;
                }
                .btn-share.hidden { display: none; }
                
                /* Insert Coin Section - Now Clickable */
                .coin-section {
                    width: 70px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-right: 15px;
                    cursor: pointer;
                    transition: transform 0.1s;
                    position: relative;
                }
                .coin-section:hover {
                    transform: scale(1.05);
                }
                .coin-section:active {
                    transform: scale(0.95);
                }
                .coin-slot {
                    width: 40px; height: 8px;
                    background: linear-gradient(180deg, #0a0a0a, #1a1a1a, #0a0a0a);
                    border-radius: 4px;
                    box-shadow: 
                        inset 0 2px 4px rgba(0,0,0,0.9),
                        0 1px 0 rgba(255,255,255,0.05);
                    margin-bottom: 8px;
                    position: relative;
                    overflow: visible;
                    z-index: 5;
                }
                
                /* Gold Coin Animation */
                .coin-anim {
                    position: absolute;
                    width: 28px; height: 28px;
                    border-radius: 50%;
                    background: radial-gradient(circle at 35% 35%, #ffd700, #daa520 40%, #b8860b 70%, #8b6914);
                    border: 2px solid #ffd700;
                    box-shadow: 
                        inset 0 -2px 4px rgba(0,0,0,0.3),
                        0 2px 8px rgba(255,215,0,0.6),
                        0 0 15px rgba(255,215,0,0.4);
                    top: -60px; left: 50%;
                    transform: translateX(-50%);
                    z-index: 10;
                    animation: coinDrop 0.6s ease-in forwards;
                }
                .coin-anim::before {
                    content: '£';
                    position: absolute;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    font-weight: bold;
                    color: #8b6914;
                    text-shadow: 0 1px 0 rgba(255,255,255,0.3);
                }
                .coin-anim::after {
                    content: '';
                    position: absolute;
                    top: 3px; left: 3px;
                    width: 8px; height: 8px;
                    background: radial-gradient(circle, rgba(255,255,255,0.8), transparent);
                    border-radius: 50%;
                }
                
                /* Fake Coin / Bottle Cap Animation */
                .fake-coin-anim {
                    position: absolute;
                    width: 26px; height: 26px;
                    border-radius: 50%;
                    background: 
                        radial-gradient(circle at 30% 30%, #888, #555 50%, #333),
                        repeating-conic-gradient(from 0deg, #666 0deg 15deg, #444 15deg 30deg);
                    border: 2px solid #777;
                    box-shadow: 
                        inset 0 -2px 4px rgba(0,0,0,0.5),
                        0 2px 6px rgba(0,0,0,0.4);
                    top: -60px; left: 50%;
                    transform: translateX(-50%) rotate(0deg);
                    z-index: 10;
                    animation: fakeCoinDrop 0.8s ease-in forwards;
                }
                .fake-coin-anim::before {
                    content: '';
                    position: absolute;
                    inset: 4px;
                    border-radius: 50%;
                    background: 
                        linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%),
                        radial-gradient(circle at 60% 60%, #444, #222);
                    border: 1px dashed #555;
                }
                /* Crumpled texture lines */
                .fake-coin-anim::after {
                    content: '';
                    position: absolute;
                    inset: 2px;
                    border-radius: 50%;
                    background: 
                        linear-gradient(45deg, transparent 45%, rgba(0,0,0,0.2) 50%, transparent 55%),
                        linear-gradient(-45deg, transparent 45%, rgba(255,255,255,0.1) 50%, transparent 55%),
                        linear-gradient(90deg, transparent 45%, rgba(0,0,0,0.15) 50%, transparent 55%);
                }
                
                @keyframes coinDrop {
                    0% {
                        top: -60px;
                        opacity: 1;
                        transform: translateX(-50%) rotateY(0deg) scale(1);
                    }
                    50% {
                        opacity: 1;
                        transform: translateX(-50%) rotateY(180deg) scale(1);
                    }
                    85% {
                        top: -10px;
                        opacity: 1;
                        transform: translateX(-50%) rotateY(360deg) scale(0.8);
                    }
                    100% {
                        top: 0px;
                        opacity: 0;
                        transform: translateX(-50%) rotateY(540deg) scale(0.3);
                    }
                }
                
                @keyframes fakeCoinDrop {
                    0% {
                        top: -60px;
                        opacity: 1;
                        transform: translateX(-50%) rotate(0deg) scale(1);
                    }
                    30% {
                        transform: translateX(-50%) rotate(-20deg) scale(1);
                    }
                    50% {
                        top: -30px;
                        transform: translateX(-50%) rotate(15deg) scale(0.95);
                    }
                    70% {
                        transform: translateX(-50%) rotate(-10deg) scale(0.9);
                    }
                    85% {
                        top: -10px;
                        opacity: 1;
                        transform: translateX(-50%) rotate(5deg) scale(0.7);
                    }
                    100% {
                        top: 0px;
                        opacity: 0;
                        transform: translateX(-50%) rotate(0deg) scale(0.3);
                    }
                }
                .coin-light {
                    width: 50px; height: 20px;
                    background: linear-gradient(180deg, #1a1a1a, #0f0f0f);
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: inset 0 1px 3px rgba(0,0,0,0.8);
                    overflow: hidden;
                    position: relative;
                }
                .coin-light-inner {
                    font-family: 'Press Start 2P', monospace;
                    font-size: 5px;
                    color: #ff6600;
                    text-shadow: 0 0 8px #ff6600, 0 0 15px #ff3300;
                    animation: coin-blink 1s ease-in-out infinite;
                    letter-spacing: -0.5px;
                }
                .coin-light::before {
                    content: '';
                    position: absolute; inset: 2px;
                    background: radial-gradient(ellipse at center, rgba(255,100,0,0.15) 0%, transparent 70%);
                    animation: coin-glow 1s ease-in-out infinite;
                }
                
                /* Speaker grille */
                .speaker-grille {
                    position: absolute;
                    bottom: 8px; left: 50%;
                    transform: translateX(-50%);
                    width: 60px; height: 15px;
                    display: flex; gap: 3px;
                    opacity: 0.4;
                }
                .speaker-hole {
                    flex: 1;
                    background: repeating-linear-gradient(0deg, #0a0a0a 0px, #0a0a0a 2px, #1a1a1a 2px, #1a1a1a 4px);
                    border-radius: 2px;
                }

                .close-btn {
                    position: absolute; top: 20px; right: 20px; z-index: 200;
                    width: 44px; height: 44px; 
                    background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
                    border: 2px solid rgba(255,255,255,0.2); border-radius: 50%; 
                    color: #fff; font-size: 18px;
                    cursor: pointer; display: grid; place-items: center;
                    transition: all 0.2s;
                }
                .close-btn:hover { background: rgba(239,68,68,0.6); border-color: rgba(239,68,68,0.8); }

                /* === ANIMATIONS === */
                @keyframes artwork-pulse { 
                    0%, 100% { filter: brightness(1); transform: scale(1); } 
                    50% { filter: brightness(1.15); transform: scale(1.02); } 
                }
                @keyframes backlight-pulse {
                    0% { opacity: 0.1; }
                    100% { opacity: 0.2; }
                }
                @keyframes pulse-row { 
                    0% { background: rgba(255,255,255,0.05); } 
                    100% { background: rgba(255,255,255,0.15); } 
                }
                @keyframes flicker {
                    0%, 100% { background: transparent; }
                    50% { background: rgba(255,255,255,0.02); }
                }
                @keyframes coin-blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                }
                @keyframes coin-glow {
                    0%, 100% { opacity: 0.8; }
                    50% { opacity: 0.4; }
                }
            `;
            document.head.appendChild(s);
        }

        // 3. Define Cabinet Data
        const cabinets = [
            {
                id: 'streak',
                theme: 'theme-wood',
                title: 'Word Streak',
                subtitle: 'ENDURANCE RUN',
                icon: '🔥',
                gameHash: '', // No direct game for streak
                dataGlobal: globalStreak || [],
                dataLocal: (State.data.highScores || []),
                shareMsg: (s) => `🔥 I hit a ${s}-word streak in Word Streak! Can you beat me?`
            },
            {
                id: 'war',
                theme: 'theme-camo',
                title: 'WORD WAR!',
                subtitle: 'BATTLEFIELD',
                icon: '⚔️',
                gameHash: '#WordWar',
                dataGlobal: globalWar || [],
                dataLocal: (State.data.wordWarScores || []),
                shareMsg: (s) => `⚔️ I won ${s} battles in WORD WAR! #WordWar`
            },
            {
                id: 'def',
                theme: 'theme-cyber',
                title: 'definition dash',
                subtitle: 'DATA UPLINK',
                icon: '🧠',
                gameHash: '#DefDash',
                dataGlobal: globalDef || [],
                dataLocal: (State.data.defDashScores || []),
                shareMsg: (s) => `🧠 I scored ${s} points in definition dash! #DefDash`
            },
            {
                id: 'jump',
                theme: 'theme-sky',
                title: 'Word Jump',
                subtitle: 'ENDLESS RUNNER',
                icon: '🦘',
                gameHash: '#WordJump',
                dataGlobal: globalJump || [],
                dataLocal: (State.data.wordJumpScores || []),
                shareMsg: (s) => `🦘 I jumped over ${s} words in Word Jump! #WordJump`
            }
        ];

        // 4. Construct DOM
        const modal = document.createElement('div');
        modal.id = 'highScoreModal';
        modal.className = 'arcade-modal';
        
        // Render List Function - Limited to fit CRT screen
        const generateListHTML = (data) => {
            if (!data || data.length === 0) {
                return '<div class="no-scores">NO DATA RECORDED<br>PLAY NOW!</div>';
            }
            
            // Limit to top 8 scores to fit the CRT screen without scrolling
            const rows = data.slice(0, 8).map((entry, i) => {
                const isMe = (entry.name === username);
                return `
                    <div class="score-row ${isMe ? 'highlight' : ''}">
                        <span class="rank">${i+1}.</span>
                        <span class="name">${(entry.name || 'UNKNOWN').substring(0, 10).toUpperCase()}</span>
                        <span class="score">${entry.score}</span>
                    </div>
                `;
            }).join('');
            
            return `<div class="score-list">${rows}</div>`;
        };

        const cabinetHTML = cabinets.map((cab, idx) => `
            <div class="arcade-cabinet ${cab.theme} inactive" id="cab-${idx}" data-idx="${idx}">
                <div class="cabinet-shadow"></div>
                
                <!-- Artwork/Marquee Area -->
                <div class="artwork-frame">
                    <div class="artwork-inner">
                        <div class="artwork-backlight"></div>
                        <div class="artwork-scanlines"></div>
                        <span class="artwork-decor left">${cab.icon}</span>
                        <span class="artwork-decor right">${cab.icon}</span>
                        <div class="artwork-title">${cab.title}</div>
                        <div class="artwork-sub">${cab.subtitle}</div>
                        <div class="artwork-glow"></div>
                    </div>
                </div>
                
                <!-- CRT Monitor -->
                <div class="crt-housing">
                    <div class="crt-bezel"></div>
                    <div class="crt-screen">
                        <div class="screen-flicker"></div>
                        <div class="scanlines"></div>
                        <div class="crt-content" id="list-${idx}"></div>
                        <div class="crt-glass"></div>
                        <div class="crt-glare"></div>
                    </div>
                </div>
                
                <!-- Control Panel with Joystick & Buttons -->
                <div class="control-panel">
                    <div class="panel-surface"></div>
                    
                    <!-- Joystick -->
                    <div class="joystick-area">
                        <div class="joystick-base">
                            <div class="joystick-ring">
                                <div class="joystick-stick">
                                    <div class="joystick-ball"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Button Cluster -->
                    <div class="button-cluster">
                        <button class="arcade-btn btn-toggle" data-idx="${idx}">🏠</button>
                        <button class="arcade-btn btn-share hidden" data-idx="${idx}">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="position:relative;z-index:5;color:#fff;">
                                <circle cx="18" cy="5" r="3"></circle>
                                <circle cx="6" cy="12" r="3"></circle>
                                <circle cx="18" cy="19" r="3"></circle>
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Insert Coin - Launches Game -->
                    <div class="coin-section" data-game="${cab.id}" data-idx="${idx}">
                        <div class="coin-slot"></div>
                        <div class="coin-light">
                            <div class="coin-light-inner">INSERT COIN</div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        modal.innerHTML = `
            <div class="arcade-floor"></div>
            <div class="arcade-ceiling-glow"></div>
            <div class="arcade-header-overlay"></div>
            <button class="close-btn" id="closeArcade">✕</button>
            
            <div class="cabinet-viewport">
                <div class="cabinet-row" id="cabinetRow">
                    ${cabinetHTML}
                </div>
            </div>
            
            <div style="position:absolute; bottom:20px; width:100%; text-align:center; color:rgba(255,255,255,0.35); font-family:'VT323', monospace; font-size:14px; letter-spacing:2px; pointer-events:none;">
                SWIPE TO BROWSE • 1P/2P FOR SCORES • INSERT COIN TO PLAY
            </div>
        `;
        
        document.body.appendChild(modal);

        // 5. Logic & Animation
        let currentIndex = initialCabinetIndex;
        let viewModes = [0, 0, 0, 0]; // 0=Global (1P), 1=Local (2P)
        const row = document.getElementById('cabinetRow');
        const cabs = document.querySelectorAll('.arcade-cabinet');

        const refreshCabinetContent = (idx) => {
            const cab = cabinets[idx];
            const mode = viewModes[idx]; // 0=Global, 1=Local
            const data = mode === 0 ? cab.dataGlobal : cab.dataLocal;
            const title = mode === 0 ? "🌐 WORLD RECORDS" : "🏠 YOUR BEST";
            
            const container = document.getElementById(`list-${idx}`);
            container.innerHTML = `
                <div class="score-header">${title}</div>
                ${generateListHTML(data)}
            `;
            
            // Toggle Button Text: 🌍 when share visible (local mode), 🏠 when alone (global mode)
            const btnToggle = modal.querySelector(`.btn-toggle[data-idx="${idx}"]`);
            const btnShare = modal.querySelector(`.btn-share[data-idx="${idx}"]`);
            
            if(btnShare) {
                if (mode === 1) {
                    btnShare.classList.remove('hidden');
                    // Local mode with share button visible: show globe emoji
                    if(btnToggle) btnToggle.textContent = '🌍';
                } else {
                    btnShare.classList.add('hidden');
                    // Global mode, share hidden: show home emoji
                    if(btnToggle) btnToggle.textContent = '🏠';
                }
            }
        };

        cabinets.forEach((_, i) => refreshCabinetContent(i));

        // Joystick Animation Helper
        const animateJoysticks = (direction) => {
            const sticks = modal.querySelectorAll('.joystick-stick');
            sticks.forEach(stick => {
                stick.classList.remove('tilt-left', 'tilt-right');
                if (direction === 'left') stick.classList.add('tilt-left');
                else if (direction === 'right') stick.classList.add('tilt-right');
            });
            // Reset after animation
            if (direction) {
                setTimeout(() => {
                    sticks.forEach(stick => stick.classList.remove('tilt-left', 'tilt-right'));
                }, 300);
            }
        };

        // Centering Logic
        const updatePosition = (direction = null) => {
            const sampleCab = cabs[0];
            const cabWidth = sampleCab.offsetWidth;
            const gapStr = getComputedStyle(document.documentElement).getPropertyValue('--cab-gap').trim();
            const gap = parseInt(gapStr) || 50;
            
            const screenCenter = window.innerWidth / 2;
            const itemCenter = (currentIndex * (cabWidth + gap)) + (cabWidth / 2);
            row.style.transform = `translateX(${screenCenter - itemCenter}px)`;

            // Animate joystick based on direction
            if (direction) animateJoysticks(direction);

            cabs.forEach((el, i) => {
                if (i === currentIndex) {
                    el.classList.add('active');
                    el.classList.remove('inactive');
                } else {
                    el.classList.add('inactive');
                    el.classList.remove('active');
                }
            });
        };

        setTimeout(updatePosition, 10);
        window.addEventListener('resize', () => updatePosition());

        // 6. Interaction Handlers
        modal.querySelectorAll('.btn-toggle').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const idx = parseInt(e.target.dataset.idx || e.target.closest('.btn-toggle').dataset.idx);
                viewModes[idx] = viewModes[idx] === 0 ? 1 : 0;
                refreshCabinetContent(idx);
            };
        });

        // --- COIN INSERT LOGIC (Launch Games) ---
        modal.querySelectorAll('.coin-section').forEach(coinBtn => {
            coinBtn.onclick = (e) => {
                e.stopPropagation();
                const gameId = coinBtn.dataset.game;
                const idx = parseInt(coinBtn.dataset.idx);
                
                // Only allow launching from active cabinet
                if (currentIndex !== idx) {
                    currentIndex = idx;
                    updatePosition();
                    return;
                }
                
                const crtContent = document.getElementById(`list-${idx}`);
                const coinSlot = coinBtn.querySelector('.coin-slot');
                
                // Create and animate the coin
                const createCoinAnimation = (isFake) => {
                    // Remove any existing coin animations
                    const existing = coinSlot.querySelector('.coin-anim, .fake-coin-anim');
                    if (existing) existing.remove();
                    
                    const coin = document.createElement('div');
                    coin.className = isFake ? 'fake-coin-anim' : 'coin-anim';
                    coinSlot.appendChild(coin);
                    
                    // Remove after animation completes
                    setTimeout(() => coin.remove(), isFake ? 800 : 600);
                };
                
                // Word Streak = Fake coin!
                if (gameId === 'streak') {
                    createCoinAnimation(true); // Fake bottle cap animation
                    
                    setTimeout(() => {
                        crtContent.innerHTML = `
                            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; text-align:center;">
                                <div style="font-size: 2rem; color: #ff4444; text-shadow: 0 0 20px #ff0000; animation: fakeCoinFlash 0.3s ease-in-out 3;">FAKE COIN!</div>
                                <div style="font-size: 1rem; margin-top: 15px; opacity: 0.6;">Nice try...</div>
                            </div>
                        `;
                    }, 400);
                    
                    // Add flash animation if not exists
                    if (!document.getElementById('fake-coin-anim')) {
                        const style = document.createElement('style');
                        style.id = 'fake-coin-anim';
                        style.textContent = `
                            @keyframes fakeCoinFlash {
                                0%, 100% { opacity: 1; transform: scale(1); }
                                50% { opacity: 0.5; transform: scale(1.1); }
                            }
                        `;
                        document.head.appendChild(style);
                    }
                    // Return to scores after delay
                    setTimeout(() => refreshCabinetContent(idx), 2500);
                    return;
                }
                
                // Word War, Def Dash, or Word Jump - Real coin animation
                createCoinAnimation(false); // Gold coin animation
                
                setTimeout(() => {
                    crtContent.innerHTML = `
                        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; text-align:center;">
                            <div style="font-size: 2rem; animation: loadingPulse 0.8s ease-in-out infinite;">LOADING...</div>
                            <div style="margin-top: 20px; font-size: 3rem; animation: loadingPulse 0.8s ease-in-out infinite 0.2s;">${cabinets[idx].icon}</div>
                        </div>
                    `;
                }, 300);
                
                // Add loading animation if not exists
                if (!document.getElementById('loading-anim')) {
                    const style = document.createElement('style');
                    style.id = 'loading-anim';
                    style.textContent = `
                        @keyframes loadingPulse {
                            0%, 100% { opacity: 1; }
                            50% { opacity: 0.3; }
                        }
                    `;
                    document.head.appendChild(style);
                }
                
                // Close and launch after delay
                setTimeout(() => {
                    close();
                    
                    setTimeout(() => {
                        if (gameId === 'war' && typeof MiniGames !== 'undefined' && MiniGames.wordWar) {
                            MiniGames.wordWar.start();
                        } else if (gameId === 'def' && typeof MiniGames !== 'undefined' && MiniGames.definitionDash) {
                            MiniGames.definitionDash.start();
                        } else if (gameId === 'jump' && typeof MiniGames !== 'undefined' && MiniGames.wordJump) {
                            MiniGames.wordJump.start();
                        }
                    }, 100);
                }, 1200);
            };
        });

        // --- SHARE LOGIC ---
        modal.querySelectorAll('.btn-share').forEach(btn => {
            btn.onclick = async (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.dataset.idx);
                const cab = cabinets[idx];
                
                // Get user's personal best (top local score)
                const bestScore = (cab.dataLocal && cab.dataLocal.length > 0) ? cab.dataLocal[0].score : 0;
                
                // Build direct game link with hash
                const baseUrl = 'https://good-word.onrender.com/';
                const gameUrl = cab.gameHash ? baseUrl + cab.gameHash : baseUrl;
                
                const shareText = cab.shareMsg(bestScore);
                const shareData = {
                    title: cab.title,
                    text: shareText,
                    url: gameUrl
                };

                if (navigator.share) {
                    try { await navigator.share(shareData); } 
                    catch (err) { console.log('Share skipped'); }
                } else {
                    // Fallback
                    try {
                        await navigator.clipboard.writeText(`${shareText} ${gameUrl}`);
                        alert('Score copied to clipboard!');
                    } catch (err) {
                        alert('Could not copy score: ' + shareText);
                    }
                }
            };
        });

        // Close & Cleanup
        const close = () => {
            modal.remove();
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('keydown', keyHandler);
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchend', handleEnd);
        };
        document.getElementById('closeArcade').onclick = close;

        // Swipe & Touch Logic
        let startX = 0;
        let isDragging = false;
        let startTranslateX = 0;

        const getTranslateX = () => {
            const style = window.getComputedStyle(row);
            const matrix = new WebKitCSSMatrix(style.transform);
            return matrix.m41;
        };

        const handleStart = (e) => {
            if (e.target.closest('.arcade-btn') || e.target.closest('.close-btn') || e.target.closest('.coin-section')) return;
            isDragging = true;
            startX = e.touches ? e.touches[0].clientX : e.clientX;
            row.style.transition = 'none';
            startTranslateX = getTranslateX();
        };

        const handleMove = (e) => {
            if (!isDragging) return;
            e.preventDefault(); 
            const currentX = e.touches ? e.touches[0].clientX : e.clientX;
            const diff = currentX - startX;
            row.style.transform = `translateX(${startTranslateX + diff}px)`;
            
            // Animate joysticks during drag
            if (diff < -20) animateJoysticks('right');
            else if (diff > 20) animateJoysticks('left');
        };

        const handleEnd = (e) => {
            if (!isDragging) return;
            isDragging = false;
            row.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
            
            const currentX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
            const diff = currentX - startX;

            let direction = null;
            if (Math.abs(diff) > 50) {
                if (diff < 0 && currentIndex < cabinets.length - 1) {
                    currentIndex++;
                    direction = 'right';
                }
                else if (diff > 0 && currentIndex > 0) {
                    currentIndex--;
                    direction = 'left';
                }
            }
            updatePosition(direction);
        };

        const viewport = modal.querySelector('.cabinet-viewport');
        viewport.addEventListener('mousedown', handleStart);
        viewport.addEventListener('touchstart', handleStart, {passive: false});
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('touchmove', handleMove, {passive: false});
        window.addEventListener('mouseup', handleEnd);
        window.addEventListener('touchend', handleEnd);

        cabs.forEach((cab, i) => {
            cab.addEventListener('click', (e) => {
                if(e.target.closest('.arcade-btn') || e.target.closest('.coin-section')) return;
                if(currentIndex !== i) {
                    const direction = i > currentIndex ? 'right' : 'left';
                    currentIndex = i;
                    updatePosition(direction);
                }
            });
        });

        const keyHandler = (e) => {
            if (e.key === 'ArrowLeft' && currentIndex > 0) { currentIndex--; updatePosition('left'); }
            if (e.key === 'ArrowRight' && currentIndex < cabinets.length - 1) { currentIndex++; updatePosition('right'); }
            if (e.key === 'Escape') close();
        };
        window.addEventListener('keydown', keyHandler);
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
    window.MiniGames = MiniGames;
    window.StreakManager = StreakManager;
    console.log("%c Good Word / Bad Word ", "background: #4f46e5; color: #bada55; padding: 4px; border-radius: 4px;");
    console.log("Play fair! ️😇");
})();
