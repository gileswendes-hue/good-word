// =======================================================
// script.js (Located in the root directory)
// =======================================================

// --- Configuration ---
const API_BASE_URL = '/api'; 
const DRAG_THRESHOLD = 100; // Pixels to drag to register a vote
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

// --- Dragging Variables ---
let isDragging = false;
let startX = 0;
let currentX = 0;

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
        
        // 1. Ensure the card is fully reset (no drag, no slide-out classes)
        wordCard.className = 'word-card';
        wordCard.style.transform = 'translateX(0)'; 
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
            // Re-enable CSS transitions for drag/vote
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
 * Now precisely waits for the card to visually settle before unlocking the UI.
 */
async function loadCardAndLeaderboard() {
    isVoting = true; // Lock input while fetching the next word
    currentWordSpan.textContent = 'Loading...';
    
    // 1. Fetch the new word data
    const word = await fetchRandomWord();
    
    // 2. Update and wait for the card to visually fade in (resolves after 50ms)
    await updateWordCard(word);
    
    // 3. *** CRITICAL FIX: UNLOCK INPUT ONLY AFTER VISUAL COMPLETION ***
    isVoting = false; 
    
    // 4. Fetch and render top words in the background (no need to block input)
    const topWords = await fetchTopWords();
    renderTopWords(topWords);
}

/**
 * Primary function to handle voting via button, arrow, or drag.
 * @param {string} voteType 'good' or 'bad'
 */
async function handleVote(voteType) {
    if (!currentWordData || isVoting) return; // Prevent double vote
    isVoting = true; // Lock input immediately upon vote

    const wordId = currentWordData.word;

    // 1. Immediately trigger the CSS slide-out animation
    const slideClass = voteType === 'good' ? 'slide-out-good' : 'slide-out-bad';
    wordCard.classList.add(slideClass);

    // 2. Submit the vote (runs concurrently with the animation)
    // The response is awaited here to ensure we get the engagement message before the next word loads.
    const responseData = await submitVote(wordId, voteType); 

    if (responseData && responseData.engagementMessage) {
        displayEngagementMessage(responseData.engagementMessage);
    }

    // 3. Wait for the animation to finish, then load the next word
    setTimeout(async () => {
        // Load the next card, which will reset the state and unlock 'isVoting' after fade-in
        await loadCardAndLeaderboard(); 
    }, ANIMATION_DURATION); 
}

// --- Event Listeners ---

// Button Clicks
goodWordBtn.addEventListener('click', () => handleVote('good'));
badWordBtn.addEventListener('click', () => handleVote('bad'));
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

// Drag and Drop (Mouse and Touch support for drag events)

function handleDragStart(e) {
    if (isVoting) return;
    const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
    if (e.type.startsWith('mouse') && e.button !== 0) return;

    isDragging = true;
    startX = clientX;
    wordCard.classList.add('dragged');
    // Ensure no CSS transition interferes with dragging
    wordCard.style.transition = 'none'; 
}

function handleDragMove(e) {
    if (!isDragging || isVoting) return;
    
    const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
    currentX = clientX;
    const deltaX = currentX - startX;
    
    // Only apply manual transform during drag, but maintain existing classes
    wordCard.style.transform = `translateX(${deltaX}px)`; 

    // Visual feedback for the background
    const bodyStyle = document.body.style;
    const goodColor = getComputedStyle(document.documentElement).getPropertyValue('--good-color').trim();
    const badColor = getComputedStyle(document.documentElement).getPropertyValue('--bad-color').trim();

    if (deltaX < -DRAG_THRESHOLD / 2) { 
        bodyStyle.background = `linear-gradient(to right, ${goodColor} 0%, #fff 50%, #fff 100%)`;
    } else if (deltaX > DRAG_THRESHOLD / 2) { 
        bodyStyle.background = `linear-gradient(to left, ${badColor} 0%, #fff 50%, #fff 100%)`;
    } else { 
        bodyStyle.background = 'linear-gradient(to right, #e0ffe0 0%, #fff 50%, #ffe0e0 100%)';
    }
    e.preventDefault();
}

/**
 * Handle end of drag interaction.
 * Crucial change: Calls handleVote to use the consistent animation logic.
 */
async function handleDragEnd() {
    if (!isDragging || isVoting) return;
    isDragging = false;
    wordCard.classList.remove('dragged');

    const deltaX = currentX - startX;
    
    // IMPORTANT: Re-enable default CSS transition
    wordCard.style.transition = ''; 

    document.body.style.background = 'linear-gradient(to right, #e0ffe0 0%, #fff 50%, #ffe0e0 100%)';

    if (deltaX < -DRAG_THRESHOLD) { // Dragged left (Good Word)
        // Use the main vote handler for consistent animation
        await handleVote('good'); 
    } else if (deltaX > DRAG_THRESHOLD) { // Dragged right (Bad Word)
        // Use the main vote handler for consistent animation
        await handleVote('bad');
    } else { // Not enough drag, snap back immediately
        // Only apply snap back if we are NOT voting (i.e., drag didn't pass threshold)
        wordCard.style.transition = 'transform 0.2s ease-out';
        wordCard.style.transform = 'translateX(0)';
    }
    
    // Reset start/current positions
    startX = 0;
    currentX = 0;
}

// Attach event listeners
wordCard.addEventListener('mousedown', handleDragStart);
document.addEventListener('mousemove', handleDragMove);
document.addEventListener('mouseup', handleDragEnd);

// Touch Events
wordCard.addEventListener('touchstart', handleDragStart);
document.addEventListener('touchmove', handleDragMove);
document.addEventListener('touchend', handleDragEnd);

// Handle mouseleave if dragging ends outside the card 
wordCard.addEventListener('mouseleave', () => {
    if (isDragging) {
        handleDragEnd();
    }
});

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', loadCardAndLeaderboard);
