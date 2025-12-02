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
    // Returns true if newly unlocked
    unlockBadge(n) {
        if (this.data.badges[n]) return false;
        this.data.badges[n] = true;
        localStorage.setItem(`${n}BadgeUnlocked`, 'true');
        return true; 
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
        if (confirm("Clear all local data? Irreversible.")) {
            if (confirm("Are you really sure?")) {
                localStorage.clear();
                window.location.reload()
            }
        }
    }
};

// Initialize User ID
if (!localStorage.getItem('userId')) localStorage.setItem('userId', State.data.userId);