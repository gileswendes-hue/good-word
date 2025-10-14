// =======================================================
// script.js (Located in the root directory)
// =======================================================

// --- Configuration ---
const API_BASE_URL = '/api'; 
// Removed DRAG_THRESHOLD as dragging is no longer supported
const ANIMATION_DURATION = 500; // Match CSS transition time in ms (400) + safety buffer (100)
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
 * Updates the card with new word data and initiates a fade-in effect.
 * Now returns a Promise that resolves when the fade-in is complete.
 * @param {object} wordData - The data for the next word.
 */
function updateWordCard(wordData) {
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
        
        // 1. Ensure the card is fully reset (no slide-out classes)
        wordCard.className = 'word-card';
        // The card visual reset now happens in handleVote's timeout using style.cssText
        
        // This is important: Set opacity to 0 *without* transition, then use a timeout to transition to 1
        wordCard.style.transition = 'none'; 
        wordCard.style.opacity = 0;

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

        // 3. Fade in the new word card
        setTimeout(() => {
            // Re-enable CSS transitions 
            wordCard.style.transition = ''; 
            wordCard.style.opacity = 1;
            resolve(); // Resolve promise after visual change is applied
        }, 50); // Small delay to force transition
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
 * Precisely waits for the card to visually settle before unlocking the UI.
 */
async function loadCardAndLeaderboard() {
    isVoting = true; // Lock input while fetching the next word
    currentWordSpan.textContent = 'Loading...';
    
    // 1. Fetch the new word data
    const word = await fetchRandomWord();
    
    // 2. Update and wait for the card to visually fade in (resolves after 50ms)
    await updateWordCard(word);
    
    // 3. UNLOCK INPUT ONLY AFTER VISUAL COMPLETION
    isVoting = false; 
    
    // 4. Fetch and render top words in the background (no need to block input)
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

    // 1. Determine and store the class for removal later
    const slideClass = voteType === 'good' ? 'slide-out-good' : 'slide-out-bad';
    
    // 2. Immediately trigger the CSS slide-out animation
    wordCard.classList.add(slideClass);

    // 3. Submit the vote (runs concurrently with the animation)
    const responseData = await submitVote(wordId, voteType); 

    if (responseData && responseData.engagementMessage) {
        displayEngagementMessage(responseData.engagementMessage);
    }

    // 4. Wait for the animation to finish
    setTimeout(async () => {
        // CRITICAL FIX: Use cssText to force reset ALL inline styles and remove the class.
        // This is a stronger way to force the card back to its neutral (centered) position
        // and eliminate any lingering transform/transition overrides from the previous vote.
        wordCard.style.cssText = ''; // Clears all inline styles (transform, transition)
        wordCard.classList.remove(slideClass);

        // Load the next card, which will reset the state and unlock 'isVoting' after fade-in
        await loadCardAndLeaderboard(); 
    }, ANIMATION_DURATION); 
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
