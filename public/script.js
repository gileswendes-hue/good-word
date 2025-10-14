// =======================================================
// script.js (Located in the root directory)
// =======================================================

// --- Configuration ---
const API_BASE_URL = '/api'; 
const APP_VERSION = '1.5.5'; // Bumping version for max speed optimization
const API_TIMEOUT_MS = 1000; // CRITICAL: 1 second timeout for any single API request
const MAX_RETRIES = 1; // CRITICAL: Only one attempt allowed for fastest possible response/fail

let currentWordData = null; // Stores the current word and its ID/meta-data
let isVoting = false; // Flag to prevent double votes during animation/fetch

// --- DOM Elements ---
const appContainer = document.getElementById('appContainer');
let wordCard = document.getElementById('wordCard'); // 'let' because we replace it
const currentWordSpan = document.getElementById('currentWord');
const goodWordBtn = document.getElementById('goodWordBtn');
const badWordBtn = document.getElementById('badWordBtn');
const mostlyGoodList = document.getElementById('mostlyGoodList');
const mostlyBadList = document.getElementById('mostlyBadList');
const leftArrow = document.querySelector('.left-arrow');
const rightArrow = document.querySelector('.right-arrow');
const engagementMessageBox = document.getElementById('engagementMessageBox'); 
const appVersionDisplay = document.getElementById('appVersionDisplay');

// --- Helper Functions ---

/**
 * Utility function that returns a Promise that rejects after a given delay.
 * Used to implement an explicit timeout for fetch requests.
 * @param {number} ms - Timeout delay in milliseconds.
 */
function requestTimeout(ms) {
    return new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out")), ms)
    );
}

/**
 * Utility function to make API requests with retry and timeout logic.
 *
 * NOTE: With MAX_RETRIES set to 1, this function will succeed or fail 
 * within the API_TIMEOUT_MS (1 second).
 *
 * @param {string} endpoint - The API endpoint relative to API_BASE_URL (e.g., '/get-word').
 * @param {object} options - Fetch options.
 * @returns {Promise<object>} The JSON response body.
 */
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`[API] Making call to: ${url}`);
    
    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            // Use Promise.race to enforce the 1-second timeout
            const response = await Promise.race([
                fetch(url, options),
                requestTimeout(API_TIMEOUT_MS) 
            ]);
            
            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({ message: 'No detailed error message from server.' }));
                throw new Error(`HTTP Error ${response.status}: ${errorBody.error || errorBody.message || 'Unknown server error'}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`[API] Attempt ${i + 1} failed for ${endpoint}:`, error.message);
            
            if (i === MAX_RETRIES - 1) {
                // Throw final error if max attempts reached (which is 1 attempt now)
                throw new Error(`Failed to fetch data after ${MAX_RETRIES} attempt(s). Error: ${error.message}`);
            }
            // Wait only if MAX_RETRIES was > 1
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); 
        }
    }
}


/**
 * Displays an engagement message briefly.
 * @param {string} message The message text to display.
 */
function displayEngagementMessage(message) {
    if (message) {
        engagementMessageBox.textContent = message;
        engagementMessageBox.classList.add('visible');

        // Hide the message after 4 seconds
        setTimeout(() => {
            engagementMessageBox.classList.remove('visible');
            // Clear text after transition to prevent flicker
            setTimeout(() => {
                engagementMessageBox.textContent = '';
            }, 500); // Matches CSS transition time
        }, 4000);
    }
}

// --- Rewritten fetch functions using the new apiCall ---

/**
 * Fetches a random word using the robust apiCall.
 */
async function fetchRandomWord() {
    try {
        const data = await apiCall('/get-word');
        return data;
    } catch (error) {
        // Handle critical failure during fetch
        console.error("Critical Error: Failed to fetch random word:", error.message);
        // Display generic error on card
        if (wordCard.querySelector('#currentWord')) {
             wordCard.querySelector('#currentWord').textContent = "API ERROR :(";
        }
        return null;
    }
}

/**
 * Fetches top words using the robust apiCall.
 */
async function fetchTopWords() {
    try {
        return await apiCall('/top-words');
    } catch (error) {
        console.error("Error fetching top words:", error.message);
        return { mostlyGood: [], mostlyBad: [] };
    }
}

/**
 * Submits a vote using the robust apiCall.
 */
async function submitVote(wordId, voteType) { 
    try {
        return await apiCall('/vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wordId, voteType }),
        });
    } catch (error) {
        console.error("Error submitting vote:", error.message);
        return null;
    }
}


/**
 * Updates the card with new word data and initiates an instant update.
 * Now performs a destructive replacement to eliminate all lingering CSS state.
 * @param {object} wordData - The data for the next word.
 */
function updateWordCard(wordData) {
    return new Promise(resolve => {
        if (!wordData || !wordData.word || wordData.word === "DB EMPTY") {
            // Handle DB EMPTY or No More Words/Critical Error State
            const displayMessage = wordData && wordData.word === "DB EMPTY" ? "DATABASE EMPTY" : "NO MORE WORDS!";
            
            // Check if wordCard is already a string or null before attempting to remove/replace
            if (wordCard && typeof wordCard.remove === 'function') {
                wordCard.remove();
            }

            // Create a clean "error" card or placeholder
            const placeholderCard = document.createElement('div');
            placeholderCard.id = 'wordCard';
            placeholderCard.className = 'word-card neutral-border';
            placeholderCard.style.cssText = 'opacity: 1;';
            
            const placeholderSpan = document.createElement('span');
            placeholderSpan.id = 'currentWord';
            placeholderSpan.textContent = displayMessage;
            placeholderCard.appendChild(placeholderSpan);
            
            // Re-insert placeholder
            const parent = document.getElementById('appContainer').querySelector('.word-card-wrapper');
            if (parent) {
                 parent.insertBefore(placeholderCard, document.querySelector('.top-words-lists'));
            }

            // Update global references
            wordCard = placeholderCard;
            currentWordData = null; // Clear data since we can't vote on this state
            resolve();
            return;
        }

        // --- CRITICAL FIX: Replace the entire word card element ---
        
        // 1. Store the parent node before removal
        const parent = wordCard.parentNode;
        
        // 2. Create a brand new, clean card element
        const newCard = document.createElement('div');
        newCard.id = 'wordCard';
        newCard.className = 'word-card';
        newCard.style.cssText = 'opacity: 1;'; // Start visible and clean
        
        // 3. Create the word span element inside the new card
        const newWordSpan = document.createElement('span');
        newWordSpan.id = 'currentWord';
        newCard.appendChild(newWordSpan);
        
        // 4. Update global reference to the new element
        if (wordCard && typeof wordCard.remove === 'function') {
            wordCard.remove();
        }
        wordCard = newCard;
        currentWordData = wordData;
        
        // 5. Insert the new card back into the DOM
        // Note: Ensure the insertion point is correct relative to your HTML structure
        const referenceElement = document.querySelector('.top-words-lists');
        if (parent && referenceElement) {
             parent.insertBefore(newCard, referenceElement.parentNode); 
        } else if (parent) {
             parent.appendChild(newCard); // Fallback if reference element not found
        }
        
        // 6. Update the content
        newWordSpan.textContent = wordData.word;
        // ---------------------------------------------------------
        
        // 7. Determine border color based on existing votes (using 0 votes fallback if data is missing)
        const goodVotes = wordData.goodVotes || 0;
        const badVotes = wordData.badVotes || 0;
        const totalVotes = goodVotes + badVotes;

        if (totalVotes === 0) {
            wordCard.classList.add('neutral-border');
        } else {
            const goodPercentage = (goodVotes / totalVotes) * 100;
            if (goodPercentage > 60) {
                wordCard.classList.add('good-border');
            } else if (goodPercentage < 40) {
                wordCard.classList.add('bad-border');
            } else {
                wordCard.classList.add('neutral-border');
            }
        }
        
        // Resolve immediately as the content is now visible
        resolve(); 
    });
}

function renderTopWords(topWords) {
    mostlyGoodList.innerHTML = '';
    mostlyBadList.innerHTML = '';

    const renderList = (list, targetElement, type) => {
        if (!list || list.length === 0) {
            targetElement.innerHTML = '<li>No words rated enough yet.</li>';
            return;
        }

        list.forEach(word => {
            const li = document.createElement('li');
            const total = word.goodVotes + word.badVotes;
            // Calculate percentage based on list type
            const percentage = total > 0
                ? Math.round(((type === 'good' ? word.goodVotes : word.badVotes) / total) * 100)
                : 0;

            li.innerHTML = `${word.word} <span class="percentage">(${percentage}% ${type.toUpperCase()})</span>`;
            targetElement.appendChild(li);
        });
    }

    renderList(topWords.mostlyGood, mostlyGoodList, 'good');
    renderList(topWords.mostlyBad, mostlyBadList, 'bad');
}

/**
 * Fetches the next word, updates the card, and updates the leaderboards.
 * Uses instant card swapping. Now performs leaderboard fetch concurrently.
 */
async function loadCardAndLeaderboard() {
    isVoting = true; // Lock input while fetching the next word
    
    // Set loading text on the current card before the fetch starts
    const currentWordElement = wordCard.querySelector('#currentWord');
    if (currentWordElement) {
        currentWordElement.textContent = 'Loading...';
    }
    
    // 1. Start both promises concurrently for speed.
    const wordPromise = fetchRandomWord();
    const leaderboardPromise = fetchTopWords(); 

    // 2. Wait only for the critical word to load. This resolves or fails in max 1 second.
    const word = await wordPromise; 
    
    // 3. Update the card instantly using the destructive replacement method
    await updateWordCard(word);
    
    // 4. UNLOCK INPUT IMMEDIATELY after the word card is visible
    if (currentWordData && currentWordData.word) {
        isVoting = false; 
    }

    // 5. Wait for and render top words (This is now background work)
    const topWords = await leaderboardPromise;
    renderTopWords(topWords);
}

/**
 * Primary function to handle voting via button or arrow.
 * @param {string} voteType 'good' or 'bad'
 */
async function handleVote(voteType) {
    if (!currentWordData || isVoting) return; // Prevent double vote
    isVoting = true; // Lock input immediately upon vote

    const wordId = currentWordData.wordId; // Use wordId from the currentWordData object
    
    // 1. Submit the vote (runs concurrently with the loading state)
    const responseData = await submitVote(wordId, voteType); 

    if (responseData && responseData.engagementMessage) {
        displayEngagementMessage(responseData.engagementMessage);
    }

    // 2. Load the next card immediately
    await loadCardAndLeaderboard(); 
}

/**
 * Sets the version number on a dedicated display element.
 */
function setAppVersion() {
    if (appVersionDisplay) {
        appVersionDisplay.textContent = `v${APP_VERSION}`;
    }
}

// --- Event Listeners ---

// Button Clicks (Handles goodWordBtn, badWordBtn)
goodWordBtn.addEventListener('click', () => handleVote('good'));
badWordBtn.addEventListener('click', () => handleVote('bad'));

// Arrow Clicks (Handles leftArrow, rightArrow)
leftArrow.addEventListener('click', () => handleVote('good'));
rightArrow.addEventListener('click', () => handleVote('bad'));


// Keyboard Input
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && !isVoting) {
        e.preventDefault();
        handleVote('good');
    } else if (e.key === 'ArrowRight' && !isVoting) {
        e.preventDefault();
        handleVote('bad');
    }
});

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    setAppVersion();
    loadCardAndLeaderboard();
});
