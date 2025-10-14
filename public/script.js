// =======================================================
// script.js (Located in the root directory)
// =======================================================

// --- Configuration ---
const API_BASE_URL = '/api'; 
const APP_VERSION = '1.5.10'; // Bumping version for robust wordCard/list lookup
const API_TIMEOUT_MS = 1000; 
const MAX_RETRIES = 1; 
const LOADING_DELAY_MS = 150; 

let currentWordData = null; // Stores the current word and its ID/meta-data
let isVoting = false; // Flag to prevent double votes during animation/fetch

// --- Global DOM Variables (Assigned in initializeApp) ---
// We keep them global but initialize them inside the function
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
                // Throw final error if max attempts reached
                throw new Error(`Failed to fetch data after ${MAX_RETRIES} attempt(s). Error: ${error.message}`);
            }
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); 
        }
    }
}


/**
 * Displays an engagement message briefly.
 * @param {string} message The message text to display.
 */
function displayEngagementMessage(message) {
    if (!engagementMessageBox) return; 
    if (message) {
        engagementMessageBox.textContent = message;
        engagementMessageBox.classList.add('visible');

        // Hide the message after 4 seconds
        setTimeout(() => {
            engagementMessageBox.classList.remove('visible');
            setTimeout(() => {
                engagementMessageBox.textContent = '';
            }, 500); // Matches CSS transition time
        }, 4000);
    }
}

// --- Fetch functions ---

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
        // We still need to return a structure for renderTopWords to work
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
 * Now ensures the global `wordCard` variable is updated after replacement.
 * @param {object} wordData - The data for the next word.
 */
function updateWordCard(wordData) {
    return new Promise(resolve => {
        // Find the most current wordCard in the DOM if our global reference is null
        if (!wordCard) {
             wordCard = document.getElementById('wordCard');
        }

        if (!wordCard) {
            console.error("FATAL ERROR: wordCard element could not be found for update. Skipping UI update.");
            resolve();
            return;
        }

        const parent = wordCard.parentNode;

        // --- Handle 'DB EMPTY' or error state ---
        if (!wordData || !wordData.word || wordData.word === "DB EMPTY") {
            const displayMessage = wordData && wordData.word === "DB EMPTY" ? "DATABASE EMPTY" : "NO MORE WORDS!";
            
            // 1. Remove the old card
            if (wordCard && typeof wordCard.remove === 'function') {
                wordCard.remove();
            }

            // 2. Create and configure the new placeholder card
            const placeholderCard = document.createElement('div');
            placeholderCard.id = 'wordCard';
            placeholderCard.className = 'word-card neutral-border';
            placeholderCard.style.cssText = 'opacity: 1;';
            
            const placeholderSpan = document.createElement('span');
            placeholderSpan.id = 'currentWord';
            placeholderSpan.textContent = displayMessage;
            placeholderCard.appendChild(placeholderSpan);
            
            // 3. Re-insert placeholder
            const wrapper = document.querySelector('.word-card-wrapper') || parent;
            if (wrapper) {
                 wrapper.appendChild(placeholderCard);
            }

            // 4. CRITICAL: Update global reference
            wordCard = placeholderCard; 
            currentWordData = null; 
            resolve();
            return;
        }

        // --- Handle normal word update ---
        
        // 1. Create a brand new, clean card element
        const newCard = document.createElement('div');
        newCard.id = 'wordCard';
        newCard.className = 'word-card';
        newCard.style.cssText = 'opacity: 1;'; 
        
        const newWordSpan = document.createElement('span');
        newWordSpan.id = 'currentWord';
        newWordSpan.textContent = wordData.word; 
        newCard.appendChild(newWordSpan);
        
        // 2. Replace the old card with the new one
        if (wordCard.parentNode) {
            wordCard.parentNode.replaceChild(newCard, wordCard);
        } else {
            // Fallback insertion if somehow the old card was detached
             const wrapper = document.querySelector('.word-card-wrapper') || parent;
            if (wrapper) {
                 wrapper.appendChild(newCard);
            }
        }

        // 3. CRITICAL: Update global references
        wordCard = newCard;
        currentWordData = wordData;
        
        // 4. Determine border color 
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
    
    // CRITICAL: Re-check list elements if not already initialized
    if (!mostlyGoodList) mostlyGoodList = document.getElementById('mostlyGoodList');
    if (!mostlyBadList) mostlyBadList = document.getElementById('mostlyBadList');

    if (!mostlyGoodList || !mostlyBadList) {
        console.error("Error: Top word list containers (mostlyGoodList or mostlyBadList) are not initialized or missing from HTML.");
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

    // Call renderList with the specific arrays from the API response structure
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

    // Check for the element before trying to set the loading message
    const currentWordElement = document.getElementById('currentWord');

    if (currentWordElement) {
        loadingTimeout = setTimeout(() => {
            currentWordElement.textContent = 'Loading...';
            console.log("[DEBUG] Displaying 'Loading...' indicator."); 
        }, LOADING_DELAY_MS);
    }
    
    // 1. Start both promises concurrently
    const wordPromise = fetchRandomWord();
    const leaderboardPromise = fetchTopWords(); 

    // 2. Wait for the word
    const word = await wordPromise; 
    
    // 3. Clear the timeout 
    if (loadingTimeout) {
        clearTimeout(loadingTimeout);
    }

    // 4. Update the card
    await updateWordCard(word);
    
    // 5. UNLOCK INPUT after the word card is visible
    if (currentWordData && currentWordData.word) {
        isVoting = false; 
    }

    // 6. Wait for and render top words
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
    
    // 1. Submit the vote
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

    // --- SETUP EVENT LISTENERS ---
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
    // Start the whole process, which handles the initial word card render
    loadCardAndLeaderboard(); 
}

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', initializeApp);
