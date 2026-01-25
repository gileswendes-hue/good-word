/**
 * ============================================================================
 * GOOD WORD / BAD WORD - API MODULE  
 * ============================================================================
 * 
 * This module handles all backend communication:
 * - API: Core fetch wrapper with error handling
 * - OfflineManager: Service worker registration and offline vote queue
 * - Vote submission and word fetching
 * - Score submissions for minigames
 * 
 * Dependencies: 01-core.js (CONFIG, State)
 * Loaded: Immediately after core
 * ============================================================================
 */

(function() {
'use strict';

// ============================================================================
// OFFLINE MANAGER - Service Worker & Offline Queue
// ============================================================================
/**
 * Manages offline functionality:
 * - Registers and communicates with service worker
 * - Queues votes when offline for later sync
 * - Handles background sync when connection restored
 */
const OfflineManager = {
    isOnline: navigator.onLine,
    sw: null,
    
    /**
     * Initialize offline support
     */
    async init() {
        // Track online/offline status
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
        
        // Register service worker if supported
        if ('serviceWorker' in navigator) {
            try {
                this.sw = await navigator.serviceWorker.register('/sw.js');
                console.log('[Offline] Service worker registered');
            } catch (err) {
                console.warn('[Offline] Service worker registration failed:', err);
            }
        }
    },
    
    handleOnline() {
        this.isOnline = true;
        console.log('[Offline] Back online');
        
        if (window.UIManager) {
            UIManager.showPostVoteMessage("Back online! 🌐");
        }
        
        // Sync pending votes
        this.syncPendingVotes();
    },
    
    handleOffline() {
        this.isOnline = false;
        console.log('[Offline] Gone offline');
        
        if (window.UIManager) {
            UIManager.showPostVoteMessage("You're offline 📴");
        }
    },
    
    /**
     * Queue a vote for later sync
     */
    queueVote(voteData) {
        const pending = State.data.pendingVotes || [];
        pending.push({
            ...voteData,
            timestamp: Date.now()
        });
        State.save('pendingVotes', pending);
        console.log(`[Offline] Vote queued. ${pending.length} pending.`);
    },
    
    /**
     * Attempt to sync all pending votes
     */
    async syncPendingVotes() {
        const pending = State.data.pendingVotes || [];
        if (pending.length === 0) return;
        
        console.log(`[Offline] Syncing ${pending.length} pending votes...`);
        
        const successful = [];
        const failed = [];
        
        for (const vote of pending) {
            try {
                await API.submitVote(vote.word, vote.vote, vote.userId);
                successful.push(vote);
            } catch (err) {
                failed.push(vote);
            }
        }
        
        // Keep only failed votes in queue
        State.save('pendingVotes', failed);
        
        if (successful.length > 0) {
            console.log(`[Offline] Synced ${successful.length} votes`);
            if (window.UIManager) {
                UIManager.showPostVoteMessage(`Synced ${successful.length} votes! ✓`);
            }
        }
        
        if (failed.length > 0) {
            console.warn(`[Offline] ${failed.length} votes failed to sync`);
        }
    },
    
    /**
     * Cache words for offline play
     */
    cacheWords(words) {
        State.save('offlineCache', words.slice(0, 500));
        console.log(`[Offline] Cached ${Math.min(words.length, 500)} words`);
    },
    
    /**
     * Get cached words for offline play
     */
    getCachedWords() {
        return State.data.offlineCache || [];
    }
};


// ============================================================================
// API - Backend Communication Layer
// ============================================================================
/**
 * Handles all HTTP requests to the backend API.
 * Includes retry logic, error handling, and offline fallback.
 */
const API = {
    /**
     * Base fetch wrapper with error handling
     */
    async request(endpoint, options = {}) {
        const url = endpoint.startsWith('http') ? endpoint : CONFIG.API_BASE_URL + endpoint;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
            ...options
        };
        
        try {
            const response = await fetch(url, defaultOptions);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (err) {
            console.error(`[API] Request failed: ${endpoint}`, err);
            throw err;
        }
    },
    
    /**
     * Fetch words list from server
     * @param {boolean} kidsMode - Whether to fetch kids-safe words
     * @returns {Promise<Array>} Array of word objects
     */
    async fetchWords(kidsMode = false) {
        try {
            const endpoint = kidsMode ? '/kids' : '';
            const data = await this.request(endpoint);
            
            // Cache for offline use
            if (data.words && data.words.length > 0) {
                OfflineManager.cacheWords(data.words);
            }
            
            return data;
        } catch (err) {
            console.warn('[API] Falling back to offline cache');
            const cached = OfflineManager.getCachedWords();
            
            if (cached.length > 0) {
                return { words: cached, fromCache: true };
            }
            
            throw err;
        }
    },
    
    /**
     * Submit a vote for a word
     * @param {string} word - The word being voted on
     * @param {string} vote - 'good', 'bad', or 'not_word'
     * @param {string} userId - User's unique ID
     * @returns {Promise<Object>} Updated word stats
     */
    async submitVote(word, vote, userId = null) {
        // If offline, queue the vote
        if (!navigator.onLine || State.data.settings.offlineMode) {
            OfflineManager.queueVote({ word, vote, userId: userId || State.data.userId });
            return { queued: true };
        }
        
        try {
            const response = await this.request('/vote', {
                method: 'POST',
                body: JSON.stringify({
                    word: word,
                    vote: vote,
                    userId: userId || State.data.userId
                })
            });
            
            return response;
        } catch (err) {
            // Queue vote on failure
            OfflineManager.queueVote({ word, vote, userId: userId || State.data.userId });
            throw err;
        }
    },
    
    /**
     * Submit a new word suggestion
     * @param {string} word - The suggested word
     * @param {string} userId - User's unique ID
     * @returns {Promise<Object>} Submission result
     */
    async submitWord(word, userId = null) {
        return await this.request('/submit', {
            method: 'POST',
            body: JSON.stringify({
                word: word.toUpperCase().trim(),
                userId: userId || State.data.userId
            })
        });
    },
    
    /**
     * Fetch word statistics/rankings
     * @param {string} word - Word to look up
     * @returns {Promise<Object>} Word stats
     */
    async getWordStats(word) {
        return await this.request(`/stats/${encodeURIComponent(word)}`);
    },
    
    /**
     * Fetch leaderboard data
     * @param {string} type - 'good' or 'bad'
     * @param {number} limit - Number of results
     * @returns {Promise<Array>} Leaderboard entries
     */
    async getLeaderboard(type = 'good', limit = 10) {
        return await this.request(`/leaderboard?type=${type}&limit=${limit}`);
    },
    
    /**
     * Submit minigame score
     * @param {string} game - Game identifier
     * @param {number} score - Score achieved
     * @param {string} username - Player name
     * @returns {Promise<Object>} Submission result
     */
    async submitScore(game, score, username) {
        const url = CONFIG.SCORE_API_URL;
        
        // If offline, queue the score
        if (!navigator.onLine) {
            const pending = State.data.pendingMiniGameScores || [];
            pending.push({ game, score, username, timestamp: Date.now() });
            State.save('pendingMiniGameScores', pending);
            return { queued: true };
        }
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    game: game,
                    score: score,
                    username: username || State.data.username || 'Anonymous',
                    userId: State.data.userId
                })
            });
            
            return await response.json();
        } catch (err) {
            console.error('[API] Score submission failed:', err);
            throw err;
        }
    },
    
    /**
     * Fetch global scores for a minigame
     * @param {string} game - Game identifier
     * @param {number} limit - Number of results
     * @returns {Promise<Array>} Score entries
     */
    async getScores(game, limit = 10) {
        const url = `${CONFIG.SCORE_API_URL}?game=${game}&limit=${limit}`;
        
        try {
            const response = await fetch(url);
            return await response.json();
        } catch (err) {
            console.error('[API] Failed to fetch scores:', err);
            return [];
        }
    },
    
    /**
     * Fetch definition from dictionary API
     * @param {string} word - Word to define
     * @returns {Promise<Object>} Definition data
     */
    async getDefinition(word) {
        const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                return { error: 'No definition found' };
            }
            return await response.json();
        } catch (err) {
            console.error('[API] Definition fetch failed:', err);
            return { error: 'Failed to fetch definition' };
        }
    },
    
    /**
     * Compare two words
     * @param {string} word1 - First word
     * @param {string} word2 - Second word
     * @returns {Promise<Object>} Comparison data
     */
    async compareWords(word1, word2) {
        return await this.request(`/compare?word1=${encodeURIComponent(word1)}&word2=${encodeURIComponent(word2)}`);
    },
    
    /**
     * Search for a word's ranking
     * @param {string} word - Word to search
     * @returns {Promise<Object>} Ranking data
     */
    async searchRank(word) {
        return await this.request(`/rank/${encodeURIComponent(word)}`);
    },
    
    /**
     * Fetch daily challenge data
     * @returns {Promise<Object>} Daily challenge info
     */
    async getDailyChallenge() {
        return await this.request('/daily');
    },
    
    /**
     * Submit daily challenge completion
     * @param {Object} data - Challenge completion data
     * @returns {Promise<Object>} Result
     */
    async submitDailyChallenge(data) {
        return await this.request('/daily/submit', {
            method: 'POST',
            body: JSON.stringify({
                ...data,
                userId: State.data.userId
            })
        });
    }
};


// ============================================================================
// EXPORTS
// ============================================================================
window.OfflineManager = OfflineManager;
window.API = API;

// Initialize offline manager
OfflineManager.init();

console.log('%c[API] Loaded', 'color: #f59e0b');

})();
