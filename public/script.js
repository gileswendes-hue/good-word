/**
 * ====================================================================
 * Client-Side JavaScript for "Good Word/Bad Word" App
 * ====================================================================
 *
 * This script handles all client-server interaction, UI updates, and
 * error management for the voting application.
 */

// --- Constants and DOM Element References ---
const API_URL = '/api';
const RETRY_LIMIT = 3;
const APP_VERSION = 'v1.0.0-client'; // Client version identifier

// Get DOM elements
const currentWordEl = document.getElementById('currentWord');
const wordIdInput = document.getElementById('word-id');
const voteGoodBtn = document.getElementById('vote-good');
const voteBadBtn = document.getElementById('vote-bad');
const engagementMsgBox = document.getElementById('engagementMessageBox');
const mostlyGoodList = document.getElementById('mostly-good-list');
const mostlyBadList = document.getElementById('mostly-bad-list');
const wordCard = document.getElementById('wordCard');
const versionDisplay = document.getElementById('version-display');

// --- Utility Functions ---

/**
 * Implements a fetch wrapper with exponential backoff and retry logic.
 * @param {string} url - The API endpoint URL.
 * @param {object} options - Fetch request options (method, headers, body, etc.).
 * @param {number} attempt - Current retry attempt number (default 1).
 */
async function retryFetch(url, options = {}, attempt = 1) {
    const delay = Math.pow(2, attempt) * 100 + Math.random() * 100; // Exponential delay + jitter
    
    try {
        const response = await fetch(url, options);

        if (response.status === 503) {
             // 503 Service Unavailable often means the database is down (per index.js logic)
             throw new Error("Service Unavailable: Database offline. Cannot complete request.");
        }
        
        if (!response.ok) {
            // Throw an error for non-503 HTTP error status codes (e.g., 400, 500)
            const errorBody = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorBody.message || 'Server error.'}`);
        }

        return response.json();

    } catch (error) {
        console.error(`Attempt ${attempt} failed for ${url}:`, error.message);
        
        if (attempt < RETRY_LIMIT) {
            console.log(`Retrying in ${delay.toFixed(0)}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return retryFetch(url, options, attempt + 1);
        } else {
            console.error(`Fetch failed after ${RETRY_LIMIT} attempts.`);
            throw error; // Propagate the error after final attempt failure
        }
    }
}

/**
 * Displays a temporary message in the engagement box.
 * @param {string} message - The message text.
 * @param {string} type - 'success', 'error', or 'info' (for styling).
 */
function displayMessage(message, type = 'info') {
    engagementMsgBox.textContent = message;
    engagementMsgBox.classList.remove('bg-blue-100', 'text-blue-800', 'bg-green-100', 'text-green-800', 'bg-red-100', 'text-red-800');
    
    switch (type) {
        case 'success':
            engagementMsgBox.classList.add('bg-green-100', 'text-green-800');
            break;
        case 'error':
            engagementMsgBox.classList.add('bg-red-100', 'text-red-800');
            break;
        case 'info':
        default:
            engagementMsgBox.classList.add('bg-blue-100', 'text-blue-800');
            break;
    }
    engagementMsgBox.style.display = 'block';
    
    // Auto-hide the message after a delay
    setTimeout(() => {
        engagementMsgBox.style.display = 'none';
    }, 3000);
}

/**
 * Disables/Enables the voting buttons.
 * @param {boolean} disabled - True to disable, false to enable.
 */
function setVotingDisabled(disabled) {
    voteGoodBtn.disabled = disabled;
    voteBadBtn.disabled = disabled;
    // Add visual feedback for disabled state
    if (disabled) {
        voteGoodBtn.classList.add('opacity-50', 'cursor-not-allowed');
        voteBadBtn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        voteGoodBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        voteBadBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
}


// --- API Call and UI Update Functions ---

/**
 * Fetches a new random word from the server and updates the UI.
 */
async function fetchWord() {
    setVotingDisabled(true);
    currentWordEl.textContent = 'Fetching new word...';
    wordIdInput.value = '';

    // Reset card animation classes
    wordCard.classList.remove('good-vote', 'bad-vote', 'neutral-border');
    wordCard.classList.add('neutral-border');

    try {
        const data = await retryFetch(`${API_URL}/get-word`);

        // Check for the expected response structure
        if (data && data.word && data.id) {
            currentWordEl.textContent = data.word;
            wordIdInput.value = data.id;
            setVotingDisabled(false);
        } else {
            throw new Error("Invalid response format from server.");
        }

    } catch (error) {
        const message = error.message.includes('Database offline') 
            ? "Database connection failed. Please check server logs." 
            : `Could not load word: ${error.message}`;
            
        currentWordEl.textContent = 'FAILED TO LOAD';
        displayMessage(message, 'error');
        console.error("Fetch Word Error:", error);
    }
}

/**
 * Fetches the top 5 good and bad words and updates the rankings section.
 */
async function fetchTopWords() {
    try {
        const data = await retryFetch(`${API_URL}/top-words`);

        if (data && data.mostlyGood && data.mostlyBad) {
            updateRankingList(mostlyGoodList, data.mostlyGood, 'good');
            updateRankingList(mostlyBadList, data.mostlyBad, 'bad');
        } else {
            throw new Error("Invalid response format for top words.");
        }
    } catch (error) {
        const message = error.message.includes('Database offline') 
            ? "Cannot load rankings (DB offline)." 
            : "Failed to load community ratings.";
            
        displayMessage(message, 'error');
        console.error("Fetch Top Words Error:", error);
        // Clear lists and show error message
        mostlyGoodList.innerHTML = `<li class="text-center italic text-red-500 text-sm">${message}</li>`;
        mostlyBadList.innerHTML = `<li class="text-center italic text-red-500 text-sm">${message}</li>`;
    }
}

/**
 * Helper function to populate a ranking list element.
 * @param {HTMLElement} listEl - The ul element to update.
 * @param {Array<Object>} words - Array of word objects {word, goodVotes, badVotes}.
 * @param {string} type - 'good' or 'bad' for styling.
 */
function updateRankingList(listEl, words, type) {
    if (words.length === 0) {
        listEl.innerHTML = '<li class="text-center italic text-sm text-gray-400">No votes recorded yet.</li>';
        return;
    }

    listEl.innerHTML = ''; // Clear previous entries

    words.forEach((word, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'flex justify-between items-center p-2 rounded-lg transition duration-150 ease-in-out hover:bg-gray-100';
        
        const voteCount = type === 'good' ? word.goodVotes : word.badVotes;
        const colorClass = type === 'good' ? 'text-green-600' : 'text-red-600';
        const rankIcon = ['🥇', '🥈', '🥉'][index] || '';

        listItem.innerHTML = `
            <span class="font-bold text-gray-700">${rankIcon} ${word.word}</span>
            <span class="font-mono text-sm ${colorClass} bg-white px-2 py-1 rounded-full shadow-sm">
                ${voteCount} Votes
            </span>
        `;
        listEl.appendChild(listItem);
    });
}


/**
 * Submits a vote to the server.
 * @param {string} classification - 'good' or 'bad'.
 */
async function submitVote(classification) {
    const wordId = wordIdInput.value;
    const currentWord = currentWordEl.textContent;

    if (!wordId || currentWord === 'FAILED TO LOAD') {
        displayMessage("Please wait for a word to load before voting.", 'info');
        return;
    }

    setVotingDisabled(true);

    // 1. UI Feedback: Animate the card based on the vote
    const voteClass = classification === 'good' ? 'good-vote' : 'bad-vote';
    wordCard.classList.remove('neutral-border');
    wordCard.classList.add(voteClass);

    try {
        const response = await retryFetch(`${API_URL}/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wordId, classification })
        });

        if (response.success) {
            displayMessage(`Voted "${classification.toUpperCase()}" for "${currentWord}". Great job!`, 'success');
        } else {
            // Should be caught by retryFetch, but handle explicit failure messages
            displayMessage(`Vote failed: ${response.message || 'Unknown error'}`, 'error');
        }

    } catch (error) {
        console.error("Submit Vote Error:", error);
        displayMessage(`Failed to record vote: ${error.message}`, 'error');

    } finally {
        // 2. Fetch the next word and update the rankings
        await Promise.all([
            fetchWord(),
            fetchTopWords()
        ]);
        
        // 3. Clean up the animation class after the new word has loaded
        setTimeout(() => {
            wordCard.classList.remove('good-vote', 'bad-vote');
            wordCard.classList.add('neutral-border');
        }, 300); // Give a slight delay after new word load
    }
}

// --- Event Listeners and Initialization ---

// Attach event handlers to the buttons
voteGoodBtn.addEventListener('click', () => submitVote('good'));
voteBadBtn.addEventListener('click', () => submitVote('bad'));


// Initial Setup on Load
document.addEventListener('DOMContentLoaded', () => {
    // 1. Display client version
    if (versionDisplay) {
        versionDisplay.textContent = APP_VERSION;
    }
    
    // 2. Clear initial messages
    engagementMsgBox.style.display = 'none';

    // 3. Start the application flow
    fetchWord();
    fetchTopWords();

    // 4. Set interval to refresh rankings every 15 seconds
    setInterval(fetchTopWords, 15000);
});

// Expose functions for debugging
window.fetchWord = fetchWord;
window.fetchTopWords = fetchTopWords;
