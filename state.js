import { UIManager } from './managers/ui.js';

export const State = {
    data: {
        userId: localStorage.getItem('userId') || crypto.randomUUID(),
        username: localStorage.getItem('username') || '',
        voteCount: parseInt(localStorage.getItem('voteCount') || 0),
        contributorCount: parseInt(localStorage.getItem('contributorCount') || 0),
        profilePhoto: localStorage.getItem('profilePhoto') || null,
        badges: {
            cake: localStorage.getItem('cakeBadgeUnlocked') === 'true',
            llama: localStorage.getItem('llamaBadgeUnlocked') === 'true',
            // ... map rest of badges
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
        // ... logic for saving to local storage from your original script
        if (k === 'settings') s.setItem('userSettings', JSON.stringify(v));
        // ... etc
    },
    unlockBadge(n) {
        if (this.data.badges[n]) return;
        this.data.badges[n] = true;
        localStorage.setItem(`${n}BadgeUnlocked`, 'true');
        UIManager.showPostVoteMessage(`Unlocked ${n} badge!`);
    },
    incrementVote() {
        this.data.voteCount++;
        localStorage.setItem('voteCount', this.data.voteCount);
    },
    incrementContributor() {
        this.data.contributorCount++;
        localStorage.setItem('contributorCount', this.data.contributorCount);
    },
    clearAll() {
        if (confirm("Clear all local data? Irreversible. I don't back up.")) {
            if (confirm("Are you really sure?")) {
                localStorage.clear();
                window.location.reload();
            }
        }
    }
};

// Initialize User ID
if (!localStorage.getItem('userId')) localStorage.setItem('userId', State.data.userId);