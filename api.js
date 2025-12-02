import { CONFIG } from './config.js';
import { State } from './state.js';

export const API = {
    /**
     * Get all words from the backend
     */
    async fetchWords() {
        try {
            const r = await fetch(CONFIG.API_BASE_URL);
            if (!r.ok) throw new Error('Network response was not ok');
            return await r.json();
        } catch (e) {
            console.error("Failed to fetch words:", e);
            return null;
        }
    },

    /**
     * Cast a vote on a specific word
     * @param {string} id - The MongoDB ID of the word
     * @param {string} type - 'good', 'bad', or 'notWord'
     */
    async vote(id, type) {
        return fetch(`${CONFIG.API_BASE_URL}/${id}/vote`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                voteType: type,
                userId: State.data.userId
            })
        });
    },

    /**
     * Submit a new custom word
     * @param {string} text - The word to submit
     */
    async submitWord(text) {
        return fetch(CONFIG.API_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
    },

    /**
     * Fetch definition from external Free Dictionary API
     * @param {string} w - The word to define
     */
    async define(w) {
        return fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${w.toLowerCase()}`);
    }
};