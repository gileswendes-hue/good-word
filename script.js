// =======================================================
// script.js (Located in the root directory)
// =======================================================

// --- Configuration ---
const API_BASE_URL = '/api'; 
const DRAG_THRESHOLD = 100; // Pixels to drag to register a vote
let currentWordData = null; // Stores the current word and its ID/meta-data

// --- DOM Elements ---
const wordCard = document.getElementById('wordCard');
const currentWordSpan = document.getElementById('currentWord');
const goodWordBtn = document.getElementById('goodWordBtn');
const badWordBtn = document.getElementById('badWordBtn');
const mostlyGoodList = document.getElementById('mostlyGoodList');
const mostlyBadList = document.getElementById('mostlyBadList');
const leftArrow = document.querySelector('.left-arrow');
const rightArrow = document.querySelector('.right-arrow');
// NEW: Element for displaying engagement messages
const engagementMessageBox = document.getElementById('engagementMessageBox'); 

// --- Dragging Variables ---
let isDragging = false;
let startX;
let currentX;

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
             // This is how the backend signals that the word list is exhausted
            currentWordSpan.textContent = "NO MORE WORDS!";
            wordCard.style.opacity = 0; // Hide card for better effect
            return null;
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // The backend returns the full word document, including totalVotes, goodVotes, badVotes
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
        // The response must contain { mostlyGood: [], mostlyBad: [] }
        return data; 
    } catch (error) {
        console.error("Error fetching top words:", error);
        return { mostlyGood: [], mostlyBad: [] };
    }
}

/**
 * Submits a vote and returns the response data, which now includes engagementMessage.
 * @param {string} wordId 
 * @param {string} voteType 'good' or 'bad'
 * @returns {object|null} The response data or null on failure.
 */
async function submitVote(wordId, voteType) { 
    try {
        const response = await fetch(`${API_BASE_URL}/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
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

function updateWordCard(wordData) {
    wordCard.style.opacity = 1; 

    if (!wordData || !wordData.word) {
        currentWordSpan.textContent = "NO MORE WORDS!"; 
        wordCard.className = 'word-card'; // Reset styles
        wordCard.style.opacity = 0; 
        return;
    }

    currentWordData = wordData;
    currentWordSpan.textContent = wordData.word;
    wordCard.style.transform = 'translateX(0)'; // Reset position

    // Determine border color based on existing votes
    const totalVotes = wordData.goodVotes + wordData.badVotes;
    wordCard.className = 'word-card'; // Reset existing classes

    if (totalVotes === 0) {
        wordCard.classList.add('neutral-border'); // No votes yet
    } else {
        const goodPercentage = (wordData.goodVotes / totalVotes) * 100;
        if (goodPercentage > 60) { // Mostly good
            wordCard.classList.add('good-border');
        } else if (goodPercentage < 40) { // Mostly bad
            wordCard.classList.add('bad-border');
        } else { // Neutral/split
            wordCard.classList.add('neutral-border');
        }
    }
}

function renderTopWords(topWords) {
    mostlyGoodList.innerHTML = '';
    mostlyBadList.innerHTML = '';

    topWords.mostlyGood.forEach(word => {
        const li = document.createElement('li');
        const total = word.goodVotes + word.badVotes;
        
        // FIX: Handles division by zero (NaN)
        const percentage = total > 0 
            ? Math.round((word.goodVotes / total) * 100) 
            : 0; 

        li.innerHTML = `${word.word} <span class="percentage">(${percentage}% GOOD)</span>`;
        mostlyGoodList.appendChild(li);
    });

    topWords.mostlyBad.forEach(word => {
        const li = document.createElement('li');
        const total = word.goodVotes + word.badVotes;
        
        // FIX: Handles division by zero (NaN)
        const percentage = total > 0 
            ? Math.round((word.badVotes / total) * 100) 
            : 0; 

        li.innerHTML = `${word.word} <span class="percentage">(${percentage}% BAD)</span>`;
        mostlyBadList.appendChild(li);
    });
}

async function loadGameData() {
    currentWordSpan.textContent = 'Loading...'; // Show loading state
    const word = await fetchRandomWord();
    updateWordCard(word);
    
    // Fetch and render top words
    const topWords = await fetchTopWords();
    renderTopWords(topWords);
}

async function handleVote(voteType) {
    if (!currentWordData) return;

    // Animate card out
    wordCard.style.transition = 'transform 0.3s ease-out';
    wordCard.style.transform = `translateX(${voteType === 'good' ? '-150%' : '150%'})`;

    const responseData = await submitVote(currentWordData.word, voteType); 

    // --- NEW ENGAGEMENT LOGIC ---
    if (responseData && responseData.engagementMessage) {
        displayEngagementMessage(responseData.engagementMessage);
    }
    // ----------------------------

    // Wait for animation, then load next word
    setTimeout(async () => {
        wordCard.style.transition = 'none'; // Reset transition for instant repositioning
        wordCard.style.transform = 'translateX(0)'; // Reset position for next word

        await loadGameData(); // Load next word and refresh top words
    }, 300); // Match CSS transition duration
}

// --- Event Listeners ---

// Button Clicks
goodWordBtn.addEventListener('click', () => handleVote('good'));
badWordBtn.addEventListener('click', () => handleVote('bad'));
leftArrow.addEventListener('click', () => handleVote('good'));
rightArrow.addEventListener('click', () => handleVote('bad'));


// Keyboard Input
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        e.preventDefault(); // Prevent page scrolling
        handleVote('good');
    } else if (e.key === 'ArrowRight') {
        e.preventDefault(); // Prevent page scrolling
        handleVote('bad');
    }
});

// Drag and Drop (Mouse and Touch support for drag events)

// Combined start event handler
function handleDragStart(e) {
    // Check if touch event or mouse event
    const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
    if (e.type.startsWith('mouse') && e.button !== 0) return; // Only left click for mouse

    isDragging = true;
    startX = clientX;
    wordCard.classList.add('dragged');
    wordCard.style.transition = 'none'; // Disable transition during drag
}

// Combined move event handler
function handleDragMove(e) {
    if (!isDragging) return;
    
    const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
    currentX = clientX;
    const deltaX = currentX - startX;
    wordCard.style.transform = `translateX(${deltaX}px)`;

    // Update background color based on drag direction
    const bodyStyle = document.body.style;
    const goodColor = getComputedStyle(document.documentElement).getPropertyValue('--good-color').trim();
    const badColor = getComputedStyle(document.documentElement).getPropertyValue('--bad-color').trim();

    if (deltaX < -DRAG_THRESHOLD / 2) { // Dragging left (Good)
        bodyStyle.background = `linear-gradient(to right, ${goodColor} 0%, #fff 50%, #fff 100%)`;
    } else if (deltaX > DRAG_THRESHOLD / 2) { // Dragging right (Bad)
        bodyStyle.background = `linear-gradient(to left, ${badColor} 0%, #fff 50%, #fff 100%)`;
    } else { // Neutral/Reset
        bodyStyle.background = 'linear-gradient(to right, #e0ffe0 0%, #fff 50%, #ffe0e0 100%)';
    }
    e.preventDefault(); // Prevent scrolling on touch devices during drag
}

// Combined end event handler
async function handleDragEnd(e) {
    if (!isDragging) return;
    isDragging = false;
    wordCard.classList.remove('dragged');

    const deltaX = currentX - startX;
    document.body.style.background = 'linear-gradient(to right, #e0ffe0 0%, #fff 50%, #ffe0e0 100%)'; // Reset background

    if (deltaX < -DRAG_THRESHOLD) { // Dragged left (Good Word)
        await handleVote('good');
    } else if (deltaX > DRAG_THRESHOLD) { // Dragged right (Bad Word)
        await handleVote('bad');
    } else { // Not enough drag, snap back
        wordCard.style.transition = 'transform 0.2s ease-out';
        wordCard.style.transform = 'translateX(0)';
    }
}

wordCard.addEventListener('mousedown', handleDragStart);
document.addEventListener('mousemove', handleDragMove); // Use document for continuous drag
document.addEventListener('mouseup', handleDragEnd); 

// Touch Events
wordCard.addEventListener('touchstart', handleDragStart);
document.addEventListener('touchmove', handleDragMove);
document.addEventListener('touchend', handleDragEnd);


// Handle mouseleave if dragging ends outside the card (e.g., dragged off screen)
wordCard.addEventListener('mouseleave', (e) => {
    if (isDragging) {
        // Treat as if mouseup occurred without a decisive drag
        handleDragEnd();
    }
});

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', loadGameData);
