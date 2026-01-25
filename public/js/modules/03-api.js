/**
 * ============================================================================
 * GOOD WORD / BAD WORD - API MODULE (03-api.js)
 * ============================================================================
 * 
 * Contains:
 * - API: All backend communication methods
 *   - Word fetching (getAllWords, fetchKidsWords)
 *   - Voting (vote)
 *   - Word submission (submitWord)
 *   - Definitions (define, getCommunityDefinition, setCommunityDefinition)
 *   - Leaderboards (getGlobalScores, submitHighScore, fetchLeaderboard)
 *   - Mini-game scores (submitMiniGameScore, getMiniGameScores)
 *   - Stats (submitUserVotes, fetchGlobalStatsHistory, submitGlobalSnapshot)
 * 
 * Dependencies: 01-core.js
 * ============================================================================
 */

(function() {
'use strict';

// ============================================================================
// API - Backend Communication
// ============================================================================
const API = {
    async getAllWords() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);
            const r = await fetch(CONFIG.API_FETCH_URL, { signal: controller.signal });
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
                    if (window.UIManager) UIManager.showPostVoteMessage("Connection lost. Switched to Offline. 🚇");
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
            if (window.UIManager) UIManager.updateOfflineIndicator();
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
            if (window.UIManager) UIManager.showPostVoteMessage("Cannot submit new words offline 🚫");
            return { ok: false };
        }
        if (ContentFilter.isOffensive(text)) {
            if (window.UIManager) UIManager.showPostVoteMessage("This word is not allowed 🚫");
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
            this.syncPendingMiniGameScores();
        } catch (e) {
            console.warn("Mini-game score submit failed, saving for later sync:", e);
            const pending = State.data.pendingMiniGameScores || [];
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

// ============================================================================
// EXPORTS
// ============================================================================
window.API = API;

console.log('%c[API] Module loaded', 'color: #f59e0b; font-weight: bold');

})();
