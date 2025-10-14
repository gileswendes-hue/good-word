// =======================================================
// script.js (Located in the root directory)
// =======================================================

// --- Configuration ---
const API_BASE_URL = '/api'; 
const APP_VERSION = '1.5.9'; // Bumping version for critical DOM element lookup fix
const API_TIMEOUT_MS = 1000; 
const MAX_RETRIES = 1; 
const LOADING_DELAY_MS = 150; 

let currentWordData = null; // Stores the current word and its ID/meta-data
let isVoting = false; // Flag to prevent double votes during animation/fetch

// --- DOM Elements (Declared, but assignment moved to DOMContentLoaded) ---
let wordCard; 
let goodWordBtn;
let badWordBtn;
let mostlyGoodList;
let mostlyBadList;
let leftArrow;
let rightArrow;
let engagementMessageBox; 
let appVersionDisplay;


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
 * NOTE: Requires engagementMessageBox to be initialized.
 * @param {string} message The message text to display.
 */
function displayEngagementMessage(message) {
    if (!engagementMessageBox) return; // Null check for safety
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

async function fetchRandomWord() {
    try {
        const data = await apiCall('/get-word');
        return data;
    } catch (error) {
        console.error("Critical Error: Failed to fetch random word:", error.message);
        if (wordCard && wordCard.querySelector('#currentWord')) {
             wordCard.querySelector('#currentWord').textContent = "API ERROR :(";
        }
        return null;
    }
}

async function fetchTopWords() {
    try {
        const data = await apiCall('/top-words');
        console.log("[DEBUG] API /top-words returned:", data); 
        return data;
    } catch (error) {
        console.error("Error fetching top words:", error.message);
        return { mostlyGood: [], mostlyBad: [] };
    }
}

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
 * @param {object} wordData - The data for the next word.
 */
function updateWordCard(wordData) {
    return new Promise(resolve => {
        if (!wordCard) {
            console.error("Error: wordCard element is missing. Cannot update UI.");
            resolve();
            return;
        }

        if (!wordData || !wordData.word || wordData.word === "DB EMPTY") {
            const displayMessage = wordData && wordData.word === "DB EMPTY" ? "DATABASE EMPTY" : "NO MORE WORDS!";
            
            // Perform full replacement to clear state
            const parent = wordCard.parentNode;
            if (wordCard && typeof wordCard.remove === 'function') {
                wordCard.remove();
            }

            const placeholderCard = document.createElement('div');
            placeholderCard.id = 'wordCard';
            placeholderCard.className = 'word-card neutral-border';
            placeholderCard.style.cssText = 'opacity: 1;';
            
            const placeholderSpan = document.createElement('span');
            placeholderSpan.id = 'currentWord';
            placeholderSpan.textContent = displayMessage;
            placeholderCard.appendChild(placeholderSpan);
            
            // Re-insert placeholder
            if (parent) {
                 parent.insertBefore(placeholderCard, document.querySelector('.top-words-lists'));
            }

            wordCard = placeholderCard;
            currentWordData = null; 
            resolve();
            return;
        }

        // --- Replace the entire word card element for clean state ---
        
        const parent = wordCard.parentNode;
        
        const newCard = document.createElement('div');
        newCard.id = 'wordCard';
        newCard.className = 'word-card';
        newCard.style.cssText = 'opacity: 1;'; 
        
        const newWordSpan = document.createElement('span');
        newWordSpan.id = 'currentWord';
        newWordSpan.textContent = wordData.word; // Set content here
        newCard.appendChild(newWordSpan);
        
        if (wordCard && typeof wordCard.remove === 'function') {
            wordCard.remove();
        }
        wordCard = newCard;
        currentWordData = wordData;
        
        // Insert the new card back into the DOM
        const referenceElement = document.querySelector('.top-words-lists');
        if (parent && referenceElement) {
             parent.insertBefore(newCard, referenceElement.parentNode); 
        } else if (parent) {
             parent.appendChild(newCard); 
        }
        
        // Determine border color based on existing votes 
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
        
        resolve(); 
    });
}

function renderTopWords(topWords) {
    console.log("[DEBUG] Starting renderTopWords with data:", topWords); 
    
    // CRITICAL: Ensure list elements exist before trying to manipulate them
    if (!mostlyGoodList || !mostlyBadList) {
        console.error("Error: Top word list containers (mostlyGoodList or mostlyBadList) are not initialized.");
        return; 
    }
    
    mostlyGoodList.innerHTML = '';
    mostlyBadList.innerHTML = '';

    const renderList = (list, targetElement, type) => {
        if (!list || list.length === 0) {
            targetElement.innerHTML = '<li>No words rated enough yet.</li>';
            console.log(`[DEBUG] List ${type} is empty or null.`); 
            return;
        }
        
        console.log(`[DEBUG] Rendering ${list.length} words for ${type} list.`); 

        list.forEach(word => {
            const li = document.createElement('li');
            const total = (word.goodVotes || 0) + (word.badVotes || 0);
            
            const percentage = total > 0
                ? Math.round(((type === 'good' ? (word.goodVotes || 0) : (word.badVotes || 0)) / total) * 100)
                : 0;

            li.innerHTML = `${word.word} <span class="percentage">(${percentage}% ${type.toUpperCase()})</span>`;
            targetElement.appendChild(li);
        });
    }

    renderList(topWords.mostlyGood, mostlyGoodList, 'good');
    renderList(topWords.mostlyBad, mostlyBadList, 'bad');
    
    console.log("[DEBUG] renderTopWords finished."); 
}

/**
 * Fetches the next word, updates the card, and updates the leaderboards.
 */
async function loadCardAndLeaderboard() {
    console.log("[DEBUG] Starting loadCardAndLeaderboard."); 
    isVoting = true; 
    
    let loadingTimeout = null;

    const currentWordElement = wordCard ? wordCard.querySelector('#currentWord') : null;
    if (currentWordElement) {
        loadingTimeout = setTimeout(() => {
            currentWordElement.textContent = 'Loading...';
            console.log("[DEBUG] Displaying 'Loading...' indicator."); 
        }, LOADING_DELAY_MS);
    }
    
    // 1. Start both promises concurrently for speed.
    const wordPromise = fetchRandomWord();
    const leaderboardPromise = fetchTopWords(); 

    // 2. Wait only for the critical word to load.
    const word = await wordPromise; 
    
    // 3. Clear the timeout 
    if (loadingTimeout) {
        clearTimeout(loadingTimeout);
    }

    // 4. Update the card instantly 
    await updateWordCard(word);
    
    // 5. UNLOCK INPUT IMMEDIATELY after the word card is visible
    if (currentWordData && currentWordData.word) {
        isVoting = false; 
    }

    // 6. Wait for and render top words (This is now background work)
    const topWords = await leaderboardPromise;
    console.log("[DEBUG] Leaderboard data received. Calling renderTopWords."); 
    renderTopWords(topWords);
}

/**
 * Primary function to handle voting via button or arrow.
 * @param {string} voteType 'good' or 'bad'
 */
async function handleVote(voteType) {
    if (!currentWordData || isVoting) return; 
    isVoting = true; 

    const wordId = currentWordData.wordId; 
    
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

/**
 * Initializes all DOM references and event listeners after the DOM is fully loaded.
 * This is the fix for the "goodWordBtn is null" error.
 */
function initializeApp() {
    // --- ASSIGN GLOBAL DOM ELEMENTS HERE ---
    wordCard = document.getElementById('wordCard');
    goodWordBtn = document.getElementById('goodWordBtn');
    badWordBtn = document.getElementById('badWordBtn');
    mostlyGoodList = document.getElementById('mostlyGoodList');
    mostlyBadList = document.getElementById('mostlyBadList');
    leftArrow = document.querySelector('.left-arrow');
    rightArrow = document.querySelector('.right-arrow');
    engagementMessageBox = document.getElementById('engagementMessageBox');
    appVersionDisplay = document.getElementById('appVersionDisplay');

    // --- SETUP EVENT LISTENERS (NOW THAT ELEMENTS ARE GUARANTEED TO EXIST) ---
    if (goodWordBtn) goodWordBtn.addEventListener('click', () => handleVote('good'));
    if (badWordBtn) badWordBtn.addEventListener('click', () => handleVote('bad'));
    if (leftArrow) leftArrow.addEventListener('click', () => handleVote('good'));
    if (rightArrow) rightArrow.addEventListener('click', () => handleVote('bad'));

    // Keyboard Input listener remains global
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' && !isVoting) {
            e.preventDefault();
            handleVote('good');
        } else if (e.key === 'ArrowRight' && !isVoting) {
            e.preventDefault();
            handleVote('bad');
        }
    });

    // --- START APPLICATION ---
    setAppVersion();
    loadCardAndLeaderboard();
}

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', initializeApp);
