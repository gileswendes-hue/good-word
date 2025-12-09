(function() {
const CONFIG = {
    API_BASE_URL: '/api/words',
	SCORE_API_URL: '/api/scores',
    APP_VERSION: '5.61.2', 
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
            custom: document.getElementById('customWordButton'),
            shareGood: document.getElementById('shareQrGood'),
            shareBad: document.getElementById('shareQrBad'),
            viewAllGood: document.getElementById('viewAllGoodBtn'),
            viewAllBad: document.getElementById('viewAllBadBtn')
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
        if (item === "[object Object]") return fallback;
        return item ? JSON.parse(item) : fallback;
    } catch (e) {
        console.warn(`Corrupt data for ${key}, resetting.`);
        return fallback;
    }
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
            teased: parseInt(localStorage.getItem('insectTeased') || 0)
        },
        
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
        settings: JSON.parse(localStorage.getItem('userSettings')) || {
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
			arachnophobiaMode: false
        },
        currentTheme: localStorage.getItem('currentTheme') || 'default',
        voteCounterForTips: parseInt(localStorage.getItem('voteCounterForTips')) || 0,
        manualTheme: localStorage.getItem('manualTheme') === 'true',
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
        }
        else if (k === 'profilePhoto') s.setItem('profilePhoto', v);
        else if (k === 'lastMosquitoSpawn') s.setItem(k, v);
        else s.setItem(k, v);
    },
    
    unlockBadge(n) {
        if (this.data.badges[n]) return;
        this.data.badges[n] = true;
        localStorage.setItem(`${n}BadgeUnlocked`, 'true');
        
        // --- BADGE METADATA ---
        const meta = {
            // Words
            cake: { i: '🎂', t: 'Hidden Word' },
            llama: { i: '🦙', t: 'Hidden Word' },
            potato: { i: '🥔', t: 'Hidden Word' },
            squirrel: { i: '🐿️', t: 'Hidden Word' },
            spider: { i: '🕷️', t: 'Hidden Word' },
            germ: { i: '🦠', t: 'Hidden Word' },
            bone: { i: '🦴', t: 'Hidden Word' },
            // Items
            poop: { i: '💩', t: 'Secret Item' },
            penguin: { i: '🐧', t: 'Secret Item' },
            scorpion: { i: '🦂', t: 'Secret Item' },
            mushroom: { i: '🍄', t: 'Secret Item' },
            needle: { i: '💉', t: 'Secret Item' },
            diamond: { i: '💎', t: 'Secret Item' },
            rock: { i: '🤘', t: 'Secret Item' },
            chopper: { i: '🚁', t: 'Secret Item' },
            snowman: { i: '⛄', t: 'Secret Item' },
            // Fish
            fish: { i: '🐟', t: 'New Catch' },
            tropical: { i: '🐠', t: 'New Catch' },
            puffer: { i: '🐡', t: 'New Catch' },
            shark: { i: '🦈', t: 'New Catch' },
            octopus: { i: '🐙', t: 'New Catch' },
            // Achievements
            exterminator: { i: '☠️', t: 'Achievement' },
            saint: { i: '😇', t: 'Achievement' },
            prankster: { i: '🃏', t: 'Achievement' },
            judge: { i: '⚖️', t: 'Achievement' },
            bard: { i: '✍️', t: 'Achievement' },
            traveler: { i: '🌍', t: 'Achievement' },
            angler: { i: '🔱', t: 'Achievement' },
            shepherd: { i: '🛟', t: 'Achievement' }
        };

        const info = meta[n] || { i: '🏅', t: 'Unlocked' };
        const label = n.charAt(0).toUpperCase() + n.slice(1);
        
        // Trigger Popup
        UIManager.showUnlockPopup(info.t, info.i, label);
        
        // Play Sound
        if(typeof SoundManager !== 'undefined') SoundManager.playUnlock();

        // Bottom message fallback
        UIManager.showPostVoteMessage(`Unlocked ${label} badge!`);
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

// --- OFFLINE MANAGER (Fixed Kids Mode Sync) ---
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
                
                // FIX: Don't dump raw cache. Reload data to apply Kids Mode filters.
                Game.refreshData(true); 
                
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
            Game.refreshData(true); 
        }
        UIManager.updateOfflineIndicator();
    },

    async fillCache() {
        try {
            let gathered = [];
            let attempts = 0; 
            while (gathered.length < this.CACHE_TARGET && attempts < 20) {
                const newWords = await API.fetchWords(true); 
                if (!newWords || newWords.length === 0) break;
                
                const existingIds = new Set(gathered.map(w => w._id));
                const unique = newWords.filter(w => !existingIds.has(w._id));
                gathered = [...gathered, ...unique];
                attempts++;
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

    // Updated: Accepts isFodder flag to change click behavior
    spawnStuck(typeChar, isFodder = false) {
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
            if (isFodder) {
                this.splat(); // If from jar, splat it (prevents infinite save loop)
            } else {
                this.startRescue(); // If natural catch, save it
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
                this.splat(); // Splat flying bugs on tap
            }
        };
        
        this.state = 'flying';
        this.trailPoints = [];
        this.turnCycle = Math.random() * 100; 
        SoundManager.startBuzz(); 
        this.loop();
    },

    // --- NEW: Splat Function ---
    splat() {
        this.state = 'splatted';
        if (this.raf) cancelAnimationFrame(this.raf);
        SoundManager.stopBuzz();
        SoundManager.playPop(); 
        
        this.el.textContent = '💥'; 
        this.el.style.transition = 'transform 0.1s ease-out, opacity 0.5s ease-in 0.5s';
        this.el.style.transform = 'translate(-50%, -50%) scale(1.5)';
        
        UIManager.showPostVoteMessage("Splat!");
        
        // Remove after 1 second
        setTimeout(() => this.remove(), 1000);
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

            // Only get stuck if Arachnophobia Mode is OFF
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

const StatsManager = {
    charts: {}, 
    open: function() {
        if (!DOM.modals.globalStats) {
            console.warn("Global Stats Modal HTML not found.");
            return;
        }
        UIManager.toggle('globalStatsModal', true);
        this.renderStats();
    },
    close: function() {
        UIManager.toggle('globalStatsModal', false);
    },
    renderStats: function() {
        // Safety checks for data
        const good = (State.data.global && State.data.global.good) || 0;
        const bad = (State.data.global && State.data.global.bad) || 0;
        const total = good + bad;
        
        // Calculate totals from rankings if available
        let totalWords = 0;
        if (State.data.rankings && State.data.rankings.good && State.data.rankings.bad) {
            totalWords = State.data.rankings.good.length + State.data.rankings.bad.length;
        }

        // Update Text
        if(document.getElementById('statTotalWords')) document.getElementById('statTotalWords').innerText = totalWords.toLocaleString();
        if(document.getElementById('statTotalVotes')) document.getElementById('statTotalVotes').innerText = total.toLocaleString();
        if(document.getElementById('statGoodPercent')) document.getElementById('statGoodPercent').innerText = total > 0 ? Math.round((good / total) * 100) + '%' : '0%';
        if(document.getElementById('statTotalVoters')) document.getElementById('statTotalVoters').innerText = Math.round(total / 15).toLocaleString(); 

        // Draw Charts
        this.drawPieChart(good, bad);
        this.drawActivityChart();
        this.drawHistoryChart();
    },
    drawPieChart: function(good, bad) {
        if (typeof Chart === 'undefined') return;
        const ctx = document.getElementById('votePieChart');
        if (!ctx) return;
        
        if (this.charts.pie) this.charts.pie.destroy();
        this.charts.pie = new Chart(ctx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Good', 'Bad'],
                datasets: [{
                    data: [good, bad],
                    backgroundColor: ['#22c55e', '#ef4444'],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
        });
    },
    drawActivityChart: function() {
        if (typeof Chart === 'undefined') return;
        const ctx = document.getElementById('activityBarChart');
        if (!ctx) return;
        
        if (this.charts.bar) this.charts.bar.destroy();
        
        const data = [10, 5, 2, 1, 0, 2, 15, 45, 80, 120, 150, 180, 200, 210, 190, 180, 160, 140, 120, 100, 80, 60, 40, 20];
        this.charts.bar = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: Array.from({length: 24}, (_, i) => `${i}:00`),
                datasets: [{ label: 'Votes/Hr', data: data, backgroundColor: '#6366f1', borderRadius: 4 }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { display: false } }, x: { grid: { display: false } } } }
        });
    },
    drawHistoryChart: function() {
        if (typeof Chart === 'undefined') return;
        const ctx = document.getElementById('historyLineChart');
        if (!ctx) return;
        
        if (this.charts.line) this.charts.line.destroy();
        
        const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const data = [1200, 1350, 1280, 1500, 1900, 2200, 2100];
        this.charts.line = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Daily Votes', data: data, borderColor: '#8b5cf6', backgroundColor: 'rgba(139, 92, 246, 0.1)', fill: true, tension: 0.4
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: false, grid: { color: '#f3f4f6' } }, x: { grid: { display: false } } } }
        });
    }
};

// --- API LAYER ---
const API = {
    // Modified to accept a 'forceNetwork' flag
    async fetchWords(forceNetwork = false) {
        // 1. If Offline Mode is Active AND we aren't forcing a download
        if (OfflineManager.isActive() && !forceNetwork) {
            console.log("Serving from Offline Cache 🚇");
            return State.data.offlineCache; 
        }

        try {
            const r = await fetch(CONFIG.API_BASE_URL);
            if (!r.ok) throw 0;
            return await r.json();
        } catch (e) {
            // Fallback: If network fails but we have cache, use it
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
            
            const allWords = await this.fetchWords(); 
            
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
            
            // Return a fake "OK" response so the game continues
            return { ok: true, status: 200, json: async () => ({}) };
        }

        // Standard Online Vote
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
        const options = ['default', ...State.data.unlockedThemes];
        const randomTheme = options[Math.floor(Math.random() * options.length)];
        this.apply(randomTheme);
        this.populateChooser();
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

        const r1 = Math.floor(Math.random() * 500); const r2 = Math.floor(Math.random() * 500);
        const r3 = Math.floor(Math.random() * 500); const r4 = Math.floor(Math.random() * 500);
        const r5 = Math.floor(Math.random() * 500); const r6 = Math.floor(Math.random() * 500);
        const r7 = Math.floor(Math.random() * 500); const r8 = Math.floor(Math.random() * 500);
        const r9 = Math.floor(Math.random() * 500); const r10 = Math.floor(Math.random() * 500);

        const B_IMG = `
            /* 1. Sharp dark pinpricks (High contrast) */
            radial-gradient(circle at 15% 50%, rgba(60, 40, 20, 0.8) 1px, transparent 1.5px),
            
            /* 2. Soft wide bruises (Low opacity, large) */
            radial-gradient(ellipse 30px 20px at 40% 80%, rgba(139, 69, 19, 0.15) 0%, transparent 50px),
            
            /* 3. Long thin scuff marks (Rotated feel via ellipse) */
            radial-gradient(ellipse 3px 12px at 70% 20%, rgba(90, 50, 30, 0.4) 0%, transparent 6px),
            
            /* 4. Medium cluster spots */
            radial-gradient(circle at 85% 30%, rgba(80, 50, 25, 0.5) 1.5px, transparent 3px),
            
            /* 5. Tiny scattered noise (Faint) */
            radial-gradient(circle at 50% 50%, rgba(100, 70, 40, 0.3) 1px, transparent 2px),
            
            /* 6. Large dark "over-ripe" spots */
            radial-gradient(ellipse at 20% 10%, rgba(70, 30, 10, 0.25) 4px, transparent 20px),

            /* 7. Fibers (Vertical lines) */
            repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(139, 69, 19, 0.05) 60px, transparent 61px, transparent 140px),
            
            /* 8. General surface noise */
            radial-gradient(circle at 50% 50%, rgba(139, 69, 19, 0.03) 0%, transparent 60%),
            
            /* 9. Base Yellow Color */
            linear-gradient(#f7e98e, #f7e98e)
        `;

        const B_SIZE = `
            137px 137px, 
            419px 419px, 
            263px 263px, 
            313px 313px, 
            191px 191px, 
            503px 503px, 
            100% 100%, 
            800px 800px, 
            100% 100%
        `;
        
        const B_POS = `
            ${r1}px ${r2}px, 
            ${r3}px ${r4}px, 
            ${r5}px ${r6}px, 
            ${r7}px ${r8}px, 
            ${r9}px ${r10}px, 
            ${r2}px ${r9}px, 
            0 0, 
            0 0, 
            0 0
        `;

        if (t === 'banana') {
            UIManager.bananaConfig = { img: B_IMG, size: B_SIZE, pos: B_POS };

            if (!document.getElementById('banana-style')) {
                const s = document.createElement('style');
                s.id = 'banana-style';
                document.head.appendChild(s);
            }
            document.getElementById('banana-style').innerHTML = `
                body.theme-banana {
                    background-color: #f7e98e !important;
                    background-image: ${B_IMG} !important;
                    background-size: ${B_SIZE} !important;
                    background-position: ${B_POS} !important;
                    background-attachment: fixed !important;
                }
            `;
        } else {
            UIManager.bananaConfig = null;
            const old = document.getElementById('banana-style');
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
        
        if (t === 'winter') Effects.snow(); else e.snow.innerHTML = '';
        if (t === 'submarine') Effects.bubbles(true); else Effects.bubbles(false); 
        if (t === 'fire') Effects.fire(); else e.fire.innerHTML = '';
        if (t === 'summer') Effects.summer(); else e.summer.innerHTML = '';
        if (t === 'plymouth') Effects.plymouth(true); else { e.plymouth.innerHTML = ''; Effects.plymouth(false) }
        if (t === 'ballpit') Effects.ballpit(true); else Effects.ballpit(false);
        if (t === 'space') Effects.space(true); else Effects.space(false);
        Effects.halloween(t === 'halloween');
        if (t !== 'halloween') MosquitoManager.remove();
        
        const cards = document.querySelectorAll('.card, .ranking-card'), isR = t === 'rainbow';
        [DOM.game.card, ...cards].forEach(el => {
            if (!el) return;
            if (isR) { el.classList.add('thin-rainbow-frame'); el.classList.remove('card') } 
            else { el.classList.remove('thin-rainbow-frame'); el.classList.add('card') }
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
            if ((State.data.unlockedThemes.length + 1) >= 5) State.unlockBadge('traveler');
            this.populateChooser();
            if (!State.data.manualTheme) this.apply(t);
            return t; 
        }
        return null; 
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

        // --- PERFORMANCE OPTIMIZATION ---
        // Detect mobile or low-thread devices to reduce particle count
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isLowPower = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
        
        // Use 15 bubbles for mobile/old devices, 35 for desktop
        const particleCount = (isMobile || isLowPower) ? 15 : 35;

        // Background Bubbles
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

        if (State.data.currentTheme !== 'submarine') return;

        const fishData = {
            '🐟': { k: 'fish', msg: "Gotcha! 🐟", speed: [12, 18] },
            '🐠': { k: 'tropical', msg: "So colourful! 🐠", speed: [15, 25] },
            '🐡': { k: 'puffer', msg: "", speed: [20, 30] },
            '🦈': { k: 'shark', msg: "You're gonna need a bigger boat! 🦈", speed: [6, 10] },
            '🐙': { k: 'octopus', msg: "Wiggle wiggle! 🐙", speed: [18, 25] },
            '🥾': { k: 'prankster', msg: "Keep the ocean clean!", speed: [15, 20] }
        };

        // Weighted Random Selection
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

        // --- OCTOPUS MOVEMENT VARIATION ---
        if (fishEmoji === '🐙') {
            inner.classList.add('octopus-motion');
            // Randomize bobbing speed (1.5s to 2.5s)
            inner.style.animationDuration = (Math.random() * 1 + 1.5) + 's';
            // Randomize start offset
            inner.style.animationDelay = '-' + (Math.random() * 2) + 's';
        }

        // Config & Direction
        const isBoot = fishEmoji === '🥾';
        const startLeft = Math.random() > 0.5;
        const baseDir = startLeft ? -1 : 1; 
        // Ensure duration is a valid number (fallback to 15s)
        const duration = (Math.random() * (config.speed[1] - config.speed[0]) + config.speed[0]) || 15;

        // Fake Out Logic (10%)
        const isFakeOut = !isBoot && fishEmoji !== '🐙' && Math.random() < 0.10;

        // --- SETUP INITIAL STATE ---
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

        // --- ESCAPE HANDLER ---
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

        // --- CLICK HANDLER ---
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
            
            // OCTOPUS INK LOGIC
            if (fishEmoji === '🐙') {
                e.stopPropagation();
                if (data.k) State.unlockBadge(data.k);
                State.data.fishStats.caught++;
                State.save('fishStats', State.data.fishStats);
                UIManager.showPostVoteMessage("Inked!");
                SoundManager.playWhoosh();

                // Ink Cloud
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

                // JET TO RANDOM TOP-RIGHT POSITION
                const jetSpeed = Math.random() * 0.8 + 1.2; 
                wrap.style.transition = `left ${jetSpeed}s cubic-bezier(0.25, 1, 0.5, 1), top ${jetSpeed}s ease-out`;
                
                // Random destination: Right edge (110vw) to Far Right (140vw)
                // Random destination: Top edge (-20vh) to High Top (-50vh)
                wrap.style.left = (110 + Math.random() * 30) + 'vw'; 
                wrap.style.top = (-20 - Math.random() * 30) + 'vh'; 

                setTimeout(() => { if(wrap.parentNode) wrap.remove(); }, jetSpeed * 1000 + 200);
                return;
            }

            // --- FAKE OUT TAP (SWIM BACK LOGIC) ---
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

            // --- STANDARD CATCH LOGIC ---
            if (data.k) State.unlockBadge(data.k);
            if (!isBoot) {
                State.data.fishStats.caught++;
                State.save('fishStats', State.data.fishStats);
                if (State.data.fishStats.caught >= 250) State.unlockBadge('angler');
            }
            
            if (fishEmoji === '🐡') UIManager.showPostVoteMessage("Popped!");
            SoundManager.playPop();

            // Particles
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

        // --- TRIGGER MOVEMENT (ANIMATION START) ---
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

        // 1. INJECT SCUTTLE ANIMATION
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

// --- SMART BUBBLE HELPER (FINAL FIX) ---
            const showSpiderBubble = (text, forcedOrientation = null) => {
                const old = body.querySelector('.spider-dynamic-bubble');
                if (old) old.remove();

                const b = document.createElement('div');
                b.className = 'spider-dynamic-bubble';
                Object.assign(b.style, {
                    position: 'absolute', 
                    background: 'white', color: '#1f2937', padding: '6px 12px', 
                    borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', 
                    fontFamily: 'sans-serif', whiteSpace: 'nowrap', width: 'max-content',
                    pointerEvents: 'none', opacity: '0', transition: 'opacity 0.2s', 
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)', border: '1px solid #e5e7eb',
                    marginBottom: '8px', zIndex: '10'
                });
                
                // CREATE INNER TEXT SPAN FOR SEPARATE ROTATION
                const textSpan = document.createElement('span');
                textSpan.textContent = text;
                b.appendChild(textSpan);

                // Little Arrow
                const arrow = document.createElement('div');
                Object.assign(arrow.style, {
                    position: 'absolute', width: '0', height: '0',
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent'
                });
                b.appendChild(arrow);
                body.appendChild(b);

                // --- ORIENTATION & EDGE LOGIC ---
                const currentLeft = parseFloat(wrap.style.left) || 50;
                const isUpsideDown = forcedOrientation === 'upside-down' || (body.style.transform && body.style.transform.includes('180deg'));

                // 1. Vertical Position & Arrow Flip
                if (isUpsideDown) {
                    // Spider is upside down. Position bubble below the head (relative top)
                    b.style.top = '115%'; 
                    b.style.bottom = 'auto';
                    b.style.transform = 'translateX(-50%)'; // Center bubble container
                    
                    // COUNTER-ROTATION: Rotate the text content itself 180 degrees
                    textSpan.style.transform = 'rotate(180deg)'; 
                    textSpan.style.display = 'inline-block';

                    // Arrow points UP
                    arrow.style.bottom = '100%';
                    arrow.style.borderBottom = '6px solid white';
                    arrow.style.top = 'auto';
                } else {
                    // Spider is upright (Normal)
                    b.style.bottom = '100%'; 
                    b.style.top = 'auto';
                    b.style.transform = 'translateX(-50%)';
                    textSpan.style.transform = 'none'; // Ensure text is normal
                    
                    // Arrow points DOWN
                    arrow.style.top = '100%';
                    arrow.style.borderTop = '6px solid white';
                    arrow.style.bottom = 'auto';
                }

                // 2. Horizontal Alignment (Edge Detection)
                if (currentLeft < 20) {
                    b.style.left = '0';
                    b.style.transform = 'none'; 
                    arrow.style.left = '20px'; 
                } else if (currentLeft > 80) {
                    b.style.right = '0';
                    b.style.left = 'auto';
                    b.style.transform = 'none';
                    arrow.style.right = '20px';
                } else {
                    // Centered (Transform handled above)
                    arrow.style.left = '50%';
                    arrow.style.marginLeft = '-6px';
                }
                
                requestAnimationFrame(() => b.style.opacity = '1');
                setTimeout(() => {
                    if (b.parentNode && !wrap.classList.contains('hunting')) {
                        b.style.opacity = '0'; setTimeout(() => b.remove(), 300);
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
            
            // --- ACTION 1: POKE HEAD OUT (Upside Down) ---
            if (actionRoll < 0.7) {
                const safeLeft = Math.random() * 60 + 20;
                // SLOW MOVE (8s)
                wrap.style.transition = 'left 8s ease-in-out'; 
                body.classList.add('scuttling-motion'); // Start Scuttling
                wrap.style.left = safeLeft + '%';
                
                this.spiderTimeout = setTimeout(() => {
                    if (wrap.classList.contains('hunting')) return;
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
                }, 8000); // Wait for move (8s)
                return;
            }
            
            // --- ACTION 2: WALL CLIMB (Scuttling) ---
            if (actionRoll < 0.9) {
                const isLeft = Math.random() > 0.5;
                const wallX = isLeft ? 5 : 85; 
                
                // SLOW MOVE (8s)
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
            
            // --- ACTION 3: JUST MOVE (Scuttling) ---
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
        
        // WEB LOGIC (Unchanged, just ensuring it's here)
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
        
        // Slow down hunt slightly (was *8, now *12)
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
                        MosquitoManager.eat();
                        if(wrap.showBubble) wrap.showBubble("YUM!");
                        
                        body.style.animation = 'shake 0.2s ease-in-out';
                        setTimeout(() => {
                            body.style.animation = '';
                            this.retreatSpider(thread, wrap, bub, '4s');
                        }, 1000);
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
                }, 2000); 
            }, 3000); 
        }, moveTime);
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

// --- SHARE MANAGER ---
const ShareManager = {
    // 1. New Share Word Function
    async shareWord(wordText) {
        const url = `${window.location.origin}/?word=${encodeURIComponent(wordText)}`;
        const shareData = {
            title: 'Good Word / Bad Word',
            text: `What do you think of "${wordText}"? Vote now!`,
            url: url
        };

        try {
            if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(url);
                UIManager.showPostVoteMessage("Link copied to clipboard! 🔗");
            }
        } catch (err) {
            console.error('Share failed', err);
        }
    },

    // 2. Existing Image Generation
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

        // Define Categories
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
    toggle: function(id, show) {
        const el = document.getElementById(id + (id.endsWith('Modal') ? '' : 'Modal'));
        if (!el && document.getElementById(id)) {
            document.getElementById(id).classList.toggle('hidden', !show);
            document.getElementById(id).classList.toggle('flex', show);
            return;
        }
        if (el) {
            el.classList.toggle('hidden', !show);
            el.classList.toggle('flex', show);
        }
    },

    updateWordDisplay: function(word, isKidMode = false) {
        const display = document.getElementById('wordDisplay');
        if (!display) return;
        
        display.style.opacity = '0';
        
        setTimeout(() => {
            display.innerText = word;
            if (isKidMode) {
                display.classList.add('font-comic', 'text-blue-500');
            } else {
                display.classList.remove('font-comic', 'text-blue-500');
            }
            display.style.opacity = '1';
        }, 150);
    },

    updateTheme: function(theme) {
        document.body.className = `flex flex-col items-center justify-center min-h-screen p-4 pb-16 theme-${theme}`;
        
        ['snow-effect', 'bubble-effect', 'fire-effect', 'summer-effect', 'plymouth-effect', 'ballpit-effect', 'space-effect'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.classList.add('hidden');
        });

        if (theme === 'winter') document.getElementById('snow-effect')?.classList.remove('hidden');
        if (theme === 'underwater') document.getElementById('bubble-effect')?.classList.remove('hidden');
        if (theme === 'fire') document.getElementById('fire-effect')?.classList.remove('hidden');
        if (theme === 'summer') document.getElementById('summer-effect')?.classList.remove('hidden');
        if (theme === 'plymouth') document.getElementById('plymouth-effect')?.classList.remove('hidden');
        if (theme === 'ballpit') document.getElementById('ballpit-effect')?.classList.remove('hidden');
        if (theme === 'space') document.getElementById('space-effect')?.classList.remove('hidden');
    },

    triggerConfetti: function() {
        if (window.confetti) confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    },
    triggerSnow: function() {
        const el = document.getElementById('card-snow-drift');
        if (el) { el.style.opacity = '1'; setTimeout(() => el.style.opacity = '0', 2000); }
    },
    triggerFire: function() {
        document.body.classList.add('shake-animation');
        setTimeout(() => document.body.classList.remove('shake-animation'), 500);
    },
    triggerHearts: function() {
        if (window.confetti) confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 }, shapes: ['heart'], colors: ['#ef4444', '#ec4899'] });
    },
    triggerGlitch: function() {
        const display = document.getElementById('wordDisplay');
        if(display) { display.classList.add('glitch-text'); setTimeout(() => display.classList.remove('glitch-text'), 600); }
    },
    showPostVoteMessage: function(msg) {
        const el = document.getElementById('postVoteMessage');
        if (!el) return;
        el.innerText = msg;
        el.style.opacity = '1';
        if (this.msgTimeout) clearTimeout(this.msgTimeout);
        this.msgTimeout = setTimeout(() => { el.style.opacity = '0'; }, 2000);
    },

    showFullRankings: function(targetSection = 'good') {
        if (!State.data.rankings || !State.data.rankings.good) {
            console.warn("Rankings data not loaded yet.");
            return;
        }
        this.populateFullRankings('good', State.data.rankings.good);
        this.populateFullRankings('bad', State.data.rankings.bad);
        this.toggle('fullRankingsModal', true);
        
        setTimeout(() => {
            const scrollContainer = document.querySelector('#fullRankingsModalContainer .overflow-y-auto');
            if (targetSection === 'bad') {
                const badList = document.getElementById('fullBadRankings');
                if (badList?.parentElement) badList.parentElement.scrollIntoView({ behavior: 'smooth' });
            } else {
                if (scrollContainer) scrollContainer.scrollTop = 0;
            }
        }, 50); 
    },

    populateFullRankings: function(type, list) {
        const container = document.getElementById(type === 'good' ? 'fullGoodRankings' : 'fullBadRankings');
        if (!container) return;
        container.innerHTML = '';
        if (!list || list.length === 0) {
            container.innerHTML = '<p class="text-gray-400 text-sm">No data available.</p>';
            return;
        }

        list.slice(0, 100).forEach((item, index) => {
            const row = document.createElement('div');
            row.className = 'flex justify-between items-center p-2 hover:bg-white/50 rounded transition border-b border-gray-100 last:border-0';
            
            let rankColor = 'text-gray-500';
            if (index === 0) rankColor = 'text-yellow-500 font-bold';
            if (index === 1) rankColor = 'text-gray-400 font-bold';
            if (index === 2) rankColor = 'text-amber-700 font-bold';

            row.innerHTML = `
                <div class="flex items-center gap-3">
                    <span class="${rankColor} w-6 text-right text-sm">#${index + 1}</span>
                    <span class="font-bold text-gray-800">${item.word}</span>
                </div>
                <div class="text-xs font-mono text-gray-500">
                    ${item.score > 0 ? '+' : ''}${item.score}
                </div>`;
            container.appendChild(row);
        });
    }
};

const VoteShareManager = {
    messages: {
        good: [
            "I think '{word}' is a GOOD word. Do you agree?",
            "Team '{word}'! Scan this to vote GOOD.",
            "Surely '{word}' is a top-tier word? I think so.",
            "Definition of a good word: '{word}'. Agree?"
        ],
        bad: [
            "I think '{word}' is a BAD word. Help me banish it.",
            "Does anyone actually like the word '{word}'? 🤢",
            "Tragedy of the day: '{word}'. Scan to vote BAD.",
            "I can't believe '{word}' is a word. Disagree?"
        ]
    },
    async shareCurrent(voteType) {
        const wordObj = State.runtime.allWords[State.runtime.currentWordIndex];
        if (!wordObj) {
            UIManager.showPostVoteMessage("Wait for the word to load!");
            return;
        }
        
        const word = wordObj.text.toUpperCase(); 
        const color = voteType === 'good' ? '10b981' : 'ef4444'; 
        
        const gameUrl = `https://good-word.onrender.com/?word=${encodeURIComponent(word)}`;
        const qrApiUrl = `https://quickchart.io/qr?text=${encodeURIComponent(gameUrl)}&dark=${color}&margin=4&size=400&centerImageUrl=https://good-word.onrender.com/logo.png&centerImageSizeRatio=0.3`;

        const msgList = this.messages[voteType];
        const rawMsg = msgList[Math.floor(Math.random() * msgList.length)].replace(/{word}/g, word);
        const fullShareText = `${rawMsg} ${gameUrl}`;

        UIManager.showPostVoteMessage("Generating image... 📡");
        
        try {
            const response = await fetch(qrApiUrl);
            const blob = await response.blob();
            const file = new File([blob], `vote_${word}.png`, { type: "image/png" });

            try { await navigator.clipboard.writeText(fullShareText); } catch (clipErr) { console.warn("Clipboard failed", clipErr); }

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                UIManager.showPostVoteMessage("Image ready! Text copied 📋");
                await navigator.share({ title: `Vote on ${word}`, text: fullShareText, files: [file] });
            } else {
                window.open(qrApiUrl, '_blank');
                UIManager.showPostVoteMessage("Text copied! Image opened 📄");
            }
        } catch (err) {
            console.error("Share failed:", err);
            if (err.name !== 'AbortError') {
                 window.open(qrApiUrl, '_blank');
                 UIManager.showPostVoteMessage("Opened in new tab 📄");
            }
        }
    }
};

const StatsManager = {
    charts: {}, 
    open: function() {
        if (!DOM.modals.globalStats) {
            console.warn("Global Stats Modal HTML not found.");
            return;
        }
        UIManager.toggle('globalStatsModal', true);
        this.renderStats();
    },
    close: function() {
        UIManager.toggle('globalStatsModal', false);
    },
    renderStats: function() {
        const good = (State.data.global && State.data.global.good) || 0;
        const bad = (State.data.global && State.data.global.bad) || 0;
        const total = good + bad;
        
        let totalWords = 0;
        if (State.data.rankings && State.data.rankings.good && State.data.rankings.bad) {
            totalWords = State.data.rankings.good.length + State.data.rankings.bad.length;
        }

        if(document.getElementById('statTotalWords')) document.getElementById('statTotalWords').innerText = totalWords.toLocaleString();
        if(document.getElementById('statTotalVotes')) document.getElementById('statTotalVotes').innerText = total.toLocaleString();
        if(document.getElementById('statGoodPercent')) document.getElementById('statGoodPercent').innerText = total > 0 ? Math.round((good / total) * 100) + '%' : '0%';
        if(document.getElementById('statTotalVoters')) document.getElementById('statTotalVoters').innerText = Math.round(total / 15).toLocaleString(); 

        this.drawPieChart(good, bad);
        this.drawActivityChart();
        this.drawHistoryChart();
    },
    drawPieChart: function(good, bad) {
        if (typeof Chart === 'undefined') return;
        const ctx = document.getElementById('votePieChart');
        if (!ctx) return;
        if (this.charts.pie) this.charts.pie.destroy();
        this.charts.pie = new Chart(ctx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Good', 'Bad'],
                datasets: [{ data: [good, bad], backgroundColor: ['#22c55e', '#ef4444'], borderWidth: 0, hoverOffset: 4 }]
            },
            options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
        });
    },
    drawActivityChart: function() {
        if (typeof Chart === 'undefined') return;
        const ctx = document.getElementById('activityBarChart');
        if (!ctx) return;
        if (this.charts.bar) this.charts.bar.destroy();
        const data = [10, 5, 2, 1, 0, 2, 15, 45, 80, 120, 150, 180, 200, 210, 190, 180, 160, 140, 120, 100, 80, 60, 40, 20];
        this.charts.bar = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: { labels: Array.from({length: 24}, (_, i) => `${i}:00`), datasets: [{ label: 'Votes/Hr', data: data, backgroundColor: '#6366f1', borderRadius: 4 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { display: false } }, x: { grid: { display: false } } } }
        });
    },
    drawHistoryChart: function() {
        if (typeof Chart === 'undefined') return;
        const ctx = document.getElementById('historyLineChart');
        if (!ctx) return;
        if (this.charts.line) this.charts.line.destroy();
        const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const data = [1200, 1350, 1280, 1500, 1900, 2200, 2100];
        this.charts.line = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: { labels: labels, datasets: [{ label: 'Daily Votes', data: data, borderColor: '#8b5cf6', backgroundColor: 'rgba(139, 92, 246, 0.1)', fill: true, tension: 0.4 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: false, grid: { color: '#f3f4f6' } }, x: { grid: { display: false } } } }
        });
    }
};

const API = {
    fetchGlobalStats: async () => {
        try {
            const res = await fetch(`${CONFIG.API_BASE_URL}/stats`);
            if (!res.ok) throw new Error('API Error');
            const data = await res.json();
            State.data.global = data.global;
            State.data.rankings = data.rankings;
            State.data.totalWords = data.totalWords || 0;
            return data;
        } catch (e) {
            console.warn("Offline mode or API error", e);
            State.data.rankings = { good: [], bad: [] };
            return null;
        }
    },
    fetchWords: async () => {
        try {
            const res = await fetch(`${CONFIG.API_BASE_URL}/random?count=50`);
            if (!res.ok) throw new Error('Words API Error');
            const words = await res.json();
            return words;
        } catch (e) {
            console.error(e);
            return [{ text: "OFFLINE", id: "error" }];
        }
    },
    vote: async (wordId, voteType) => {
        try {
            await fetch(`${CONFIG.API_BASE_URL}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wordId, voteType, userId: State.user.id })
            });
        } catch (e) { console.error("Vote sync error", e); }
    },
    submitWord: async (word) => {
        const res = await fetch(`${CONFIG.API_BASE_URL}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ word, userId: State.user.id })
        });
        return res.json();
    }
};

const Game = {
    init: async function() {
        DOM = loadDOM();
        
        // Restore Settings
        if (State.user.settings.mirror) document.body.classList.add('mirror-mode');
        if (State.user.settings.tilt) document.body.classList.add('tilt-mode');
        
        Accessibility.apply();
        UIManager.updateTheme(State.data.currentTheme);

        // Load Data
        await API.fetchGlobalStats();
        this.updateHeaderStats();
        
        // Check for Deep Link (?word=ENVY)
        const urlParams = new URLSearchParams(window.location.search);
        const deepLinkWord = urlParams.get('word');

        if (deepLinkWord) {
             State.runtime.allWords = [{ text: deepLinkWord, id: 'shared-' + Date.now() }];
             API.fetchWords().then(words => {
                 State.runtime.allWords = [...State.runtime.allWords, ...words];
             });
        } else {
             State.runtime.allWords = await API.fetchWords();
        }

        this.renderWord();

        // --- EVENT LISTENERS ---
        
        // Main Game Buttons
        if(DOM.game.buttons.good) DOM.game.buttons.good.onclick = () => this.vote('good');
        if(DOM.game.buttons.bad) DOM.game.buttons.bad.onclick = () => this.vote('bad');
        if(DOM.game.buttons.notWord) DOM.game.buttons.notWord.onclick = () => this.vote('not_word');

        // Share Buttons
        if (DOM.game.buttons.shareGood) {
            DOM.game.buttons.shareGood.addEventListener('click', (e) => {
                e.stopPropagation();
                VoteShareManager.shareCurrent('good'); 
            });
        }
        if (DOM.game.buttons.shareBad) {
            DOM.game.buttons.shareBad.addEventListener('click', (e) => {
                e.stopPropagation();
                VoteShareManager.shareCurrent('bad');
            });
        }

        // View Rankings Buttons
        if (DOM.game.buttons.viewAllGood) {
            DOM.game.buttons.viewAllGood.onclick = () => UIManager.showFullRankings('good');
        }
        if (DOM.game.buttons.viewAllBad) {
            DOM.game.buttons.viewAllBad.onclick = () => UIManager.showFullRankings('bad');
        }

        // Global Stats (Chart.js)
        if (DOM.header.statsCard) {
            DOM.header.statsCard.onclick = () => StatsManager.open();
            DOM.header.statsCard.style.cursor = 'pointer'; 
        }
        const closeStatsBtn = document.getElementById('closeGlobalStatsModal');
        if (closeStatsBtn) closeStatsBtn.onclick = () => StatsManager.close();

        // Modals
        const closeRankBtn = document.getElementById('closeFullRankingsModal');
        if(closeRankBtn) closeRankBtn.onclick = () => UIManager.toggle('fullRankingsModal', false);

        document.getElementById('showSettingsButton').onclick = () => UIManager.toggle('settings', true);
        document.getElementById('closeSettingsModal').onclick = () => UIManager.toggle('settings', false);

        document.getElementById('headerUserStats').onclick = () => UIManager.toggle('profile', true);
        document.getElementById('closeProfileModal').onclick = () => UIManager.toggle('profile', false);
    },

    vote: async function(type) {
        if (State.runtime.isProcessing || State.runtime.isCoolingDown) return;
        
        State.runtime.isProcessing = true;
        const wordObj = State.runtime.allWords[State.runtime.currentWordIndex];
        
        // Optimistic UI Update
        if (type === 'good') {
            State.data.global.good++;
            State.user.votes[wordObj.id] = 'good';
            DOM.header.user.votes.innerText = parseInt(DOM.header.user.votes.innerText) + 1;
            this.handleStreak(true);
        } else if (type === 'bad') {
            State.data.global.bad++;
            State.user.votes[wordObj.id] = 'bad';
            DOM.header.user.votes.innerText = parseInt(DOM.header.user.votes.innerText) + 1;
            this.handleStreak(true);
        } else {
             this.handleStreak(false);
        }

        this.updateHeaderStats();
        API.vote(wordObj.id, type);
        
        this.nextWord();
        State.runtime.isProcessing = false;
    },

    nextWord: function() {
        State.runtime.currentWordIndex++;
        if (State.runtime.currentWordIndex >= State.runtime.allWords.length) {
            API.fetchWords().then(more => {
                State.runtime.allWords = [...State.runtime.allWords, ...more];
                this.renderWord();
            });
        } else {
            this.renderWord();
        }
    },

    renderWord: function() {
        const wordObj = State.runtime.allWords[State.runtime.currentWordIndex];
        if(!wordObj) return;
        UIManager.updateWordDisplay(wordObj.text, State.runtime.isKidMode);
    },

    handleStreak: function(correct) {
        if (correct) {
            State.runtime.streak++;
            if (State.runtime.streak > State.user.stats.streak) State.user.stats.streak = State.runtime.streak;
        } else {
            State.runtime.streak = 0;
        }
        DOM.header.user.streak.innerText = State.runtime.streak;
        DOM.profile.stats.streak.innerText = State.user.stats.streak;
        localStorage.setItem('userStats', JSON.stringify(State.user.stats));
    },

    updateHeaderStats: function() {
        DOM.header.counts.good.innerText = Utils.formatNumber(State.data.global.good);
        DOM.header.counts.bad.innerText = Utils.formatNumber(State.data.global.bad);
        DOM.header.counts.total.innerText = Utils.formatNumber(State.data.global.good + State.data.global.bad);
        DOM.header.counts.words.innerText = State.data.totalWords;

        const total = State.data.global.good + State.data.global.bad;
        const goodP = total === 0 ? 50 : (State.data.global.good / total) * 100;
        
        DOM.header.bars.good.style.width = `${goodP}%`;
        DOM.header.bars.bad.style.width = `${100 - goodP}%`;
    }
};

// Start Game
window.onload = Game.init.bind(Game);

})();
