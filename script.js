// =======================================================
// script.js (Located in the root directory)
// =======================================================

// --- Configuration ---
const API_BASE_URL = '/api'; 
// Removed DRAG_THRESHOLD as dragging is no longer supported
// Removed ANIMATION_DURATION: We are moving to an instant card swap to prevent sticking/double-click issues.
let currentWordData = null; // Stores the current word and its ID/meta-data
let isVoting = false; // Flag to prevent double votes during animation/fetch

// --- DOM Elements ---
const wordCard = document.getElementById('wordCard');
const currentWordSpan = document.getElementById('currentWord');
const goodWordBtn = document.getElementById('goodWordBtn');
const badWordBtn = document.getElementById('badWordBtn');
const mostlyGoodList = document.getElementById('mostlyGoodList');
const mostlyBadList = document.getElementById('mostlyBadList');
const leftArrow = document.querySelector('.left-arrow');
const rightArrow = document.querySelector('.right-arrow');
const engagementMessageBox = document.getElementById('engagementMessageBox'); 

// --- Helper Functions ---

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

async function fetchRandomWord() {
    try {
        const response = await fetch(`${API_BASE_URL}/get-word`); 
        
        if (response.status === 404) {
            currentWordSpan.textContent = "NO MORE WORDS!";
            wordCard.style.opacity = 0;
            return null;
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data; 
    } catch (error) {
        console.error("Error fetching random word:", error);
        currentWordSpan.textContent = "Error loading word :(";
        wordCard.style.opacity = 1; 
        return null;
    }
}

async function fetchTopWords() {
    try {
        const response = await fetch(`${API_BASE_URL}/top-words`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data; 
    } catch (error) {
        console.error("Error fetching top words:", error);
        return { mostlyGood: [], mostlyBad: [] };
    }
}

async function submitVote(wordId, voteType) { 
    try {
        const response = await fetch(`${API_BASE_URL}/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wordId, voteType }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error submitting vote:", error);
        return null;
    }
}

/**
 * Updates the card with new word data and initiates an instant update.
 * @param {object} wordData - The data for the next word.
 */
function updateWordCard(wordData) {
    // Return an immediate resolve since we are no longer waiting for a visual transition
    return new Promise(resolve => {
        if (!wordData || !wordData.word) {
            currentWordSpan.textContent = "NO MORE WORDS!";
            wordCard.className = 'word-card';
            wordCard.style.opacity = 0;
            resolve();
            return;
        }

        currentWordData = wordData;
        currentWordSpan.textContent = wordData.word;
        
        // 1. Instantly reset ALL styles to ensure the card is centered and visible.
        wordCard.style.cssText = 'opacity: 1;';
        wordCard.className = 'word-card';

        // 2. Determine border color based on existing votes
        const totalVotes = wordData.goodVotes + wordData.badVotes;
        if (totalVotes === 0) {
            wordCard.classList.add('neutral-border');
        } else {
            const goodPercentage = (wordData.goodVotes / totalVotes) * 100;
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

    topWords.mostlyGood.forEach(word => {
        const li = document.createElement('li');
        const total = word.goodVotes + word.badVotes;
        const percentage = total > 0 
            ? Math.round((word.goodVotes / total) * 100) 
            : 0; 

        li.innerHTML = `${word.word} <span class="percentage">(${percentage}% GOOD)</span>`;
        mostlyGoodList.appendChild(li);
    });

    topWords.mostlyBad.forEach(word => {
        const li = document.createElement('li');
        const total = word.goodVotes + word.badVotes;
        const percentage = total > 0 
            ? Math.round((word.badVotes / total) * 100) 
            : 0; 

        li.innerHTML = `${word.word} <span class="percentage">(${percentage}% BAD)</span>`;
        mostlyBadList.appendChild(li);
    });
}

/**
 * Fetches the next word, updates the card, and updates the leaderboards.
 * Uses instant card swapping.
 */
async function loadCardAndLeaderboard() {
    isVoting = true; // Lock input while fetching the next word
    currentWordSpan.textContent = 'Loading...';
    
    // 1. Fetch the new word data
    const word = await fetchRandomWord();
    
    // 2. Update the card instantly
    await updateWordCard(word);
    
    // 3. UNLOCK INPUT IMMEDIATELY AFTER CONTENT UPDATE
    isVoting = false; 
    
    // 4. Fetch and render top words in the background
    const topWords = await fetchTopWords();
    renderTopWords(topWords);
}

/**
 * Primary function to handle voting via button or arrow.
 * @param {string} voteType 'good' or 'bad'
 */
async function handleVote(voteType) {
    if (!currentWordData || isVoting) return; // Prevent double vote
    isVoting = true; // Lock input immediately upon vote

    const wordId = currentWordData.word;
    
    // 1. Submit the vote (runs concurrently with the loading state)
    const responseData = await submitVote(wordId, voteType); 

    if (responseData && responseData.engagementMessage) {
        displayEngagementMessage(responseData.engagementMessage);
    }

    // 2. Clear the card content and reset styles immediately to show 'Loading...' briefly
    // This provides an immediate visual feedback and clears any stuck CSS state.
    wordCard.style.cssText = ''; 
    wordCard.className = 'word-card';
    currentWordSpan.textContent = ''; 

    // 3. Load the next card immediately (no setTimeout required)
    await loadCardAndLeaderboard(); 
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

// REMOVED: All drag and touch event handlers (handleDragStart, handleDragMove, handleDragEnd, and all corresponding listeners).
// The logic is now solely focused on click/key input.

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', loadCardAndLeaderboard);
