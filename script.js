// --- Configuration ---
const API_BASE_URL = 'http://localhost:3000/api'; // *** IMPORTANT: CHANGE THIS TO YOUR ACTUAL BACKEND URL ***
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

// --- Dragging Variables ---
let isDragging = false;
let startX;
let currentX;

// --- Helper Functions ---
async function fetchRandomWord() {
    try {
        const response = await fetch(`${API_BASE_URL}/random-word`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data; // Should contain { id: '...', word: '...', goodVotes: N, badVotes: M }
    } catch (error) {
        console.error("Error fetching random word:", error);
        currentWordSpan.textContent = "Error loading word :(";
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
        return data; // Should contain { mostlyGood: [], mostlyBad: [] }
    } catch (error) {
        console.error("Error fetching top words:", error);
        return { mostlyGood: [], mostlyBad: [] };
    }
}

async function submitVote(wordId, voteType) { // 'good' or 'bad'
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
    if (!wordData) {
        currentWordSpan.textContent = "No more words!"; // Or some error message
        wordCard.className = 'word-card'; // Reset styles
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
        const percentage = word.goodVotes / (word.goodVotes + word.badVotes) * 100;
        li.innerHTML = `${word.word} <span class="percentage">(${Math.round(percentage)}% GOOD)</span>`;
        mostlyGoodList.appendChild(li);
    });

    topWords.mostlyBad.forEach(word => {
        const li = document.createElement('li');
        const percentage = word.badVotes / (word.goodVotes + word.badVotes) * 100;
        li.innerHTML = `${word.word} <span class="percentage">(${Math.round(percentage)}% BAD)</span>`;
        mostlyBadList.appendChild(li);
    });
}

async function loadGameData() {
    const word = await fetchRandomWord();
    updateWordCard(word);
    const topWords = await fetchTopWords();
    renderTopWords(topWords);
}

async function handleVote(voteType) {
    if (!currentWordData) return;

    // Animate card out
    wordCard.style.transition = 'transform 0.3s ease-out';
    wordCard.style.transform = `translateX(${voteType === 'good' ? '-150%' : '150%'})`;

    await submitVote(currentWordData.id, voteType); // Send vote to backend

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

// Drag and Drop
wordCard.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return; // Only left click
    isDragging = true;
    startX = e.clientX;
    wordCard.classList.add('dragged');
    wordCard.style.transition = 'none'; // Disable transition during drag
});

wordCard.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    currentX = e.clientX;
    const deltaX = currentX - startX;
    wordCard.style.transform = `translateX(${deltaX}px)`;

    // Optional: Visually hint the background based on drag direction
    if (deltaX < -DRAG_THRESHOLD / 2) {
        document.body.style.background = `linear-gradient(to right, ${getComputedStyle(document.documentElement).getPropertyValue('--good-color')} 0%, #fff 50%, #ffe0e0 100%)`;
    } else if (deltaX > DRAG_THRESHOLD / 2) {
        document.body.style.background = `linear-gradient(to right, #e0ffe0 0%, #fff 50%, ${getComputedStyle(document.documentElement).getPropertyValue('--bad-color')} 100%)`;
    } else {
        document.body.style.background = `linear-gradient(to right, #e0ffe0 0%, #fff 50%, #ffe0e0 100%)`;
    }
});

wordCard.addEventListener('mouseup', async (e) => {
    if (!isDragging) return;
    isDragging = false;
    wordCard.classList.remove('dragged');

    const deltaX = currentX - startX;
    document.body.style.background = `linear-gradient(to right, #e0ffe0 0%, #fff 50%, #ffe0e0 100%)`; // Reset background

    if (deltaX < -DRAG_THRESHOLD) { // Dragged left (Good Word)
        await handleVote('good');
    } else if (deltaX > DRAG_THRESHOLD) { // Dragged right (Bad Word)
        await handleVote('bad');
    } else { // Not enough drag, snap back
        wordCard.style.transition = 'transform 0.2s ease-out';
        wordCard.style.transform = 'translateX(0)';
    }
});

// Handle mouseleave if dragging ends outside the card (e.g., dragged off screen)
wordCard.addEventListener('mouseleave', (e) => {
    if (isDragging) {
        // Treat as if mouseup occurred without a decisive drag
        isDragging = false;
        wordCard.classList.remove('dragged');
        wordCard.style.transition = 'transform 0.2s ease-out';
        wordCard.style.transform = 'translateX(0)';
        document.body.style.background = `linear-gradient(to right, #e0ffe0 0%, #fff 50%, #ffe0e0 100%)`; // Reset background
    }
});

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', loadGameData);