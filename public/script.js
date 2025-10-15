/**
 * Good Word/Bad Word Game - Client-Side Logic
 * Version 3.8 - Implementing dynamic engagement messages and micro-interactions.
 * * This script handles fetching words, displaying them, capturing user votes,
 * triggering animations, and updating the community ratings list in real-time
 * via the Express/MongoDB API endpoints.
 */

// --- Constants and DOM Elements ---
const API_URL = '/api';

const wordCard = document.getElementById('wordCard');
const currentWordSpan = document.getElementById('currentWord');
const wordIdInput = document.getElementById('word-id');
const voteGoodButton = document.getElementById('vote-good');
const voteBadButton = document.getElementById('vote-bad');
const mostlyGoodList = document.getElementById('mostly-good-list');
const mostlyBadList = document.getElementById('mostly-bad-list');
const engagementMessageBox = document.getElementById('engagementMessageBox');

let currentWordData = null; // Stores data for the currently displayed word

// --- Utility Functions ---

/**
 * Handles error messages gracefully without using alert().
 * @param {string} message - The error message to display.
 */
function handleError(message) {
    console.error('API Error:', message);
    currentWordSpan.textContent = `Error: ${message}. Try refreshing.`;
    wordCard.className = 'word-card bad-border';
    voteGoodButton.disabled = true;
    voteBadButton.disabled = true;
}

/**
 * Fetches data from a given API endpoint.
 * @param {string} endpoint - The API path (e.g., '/get-word').
 * @param {string} method - The HTTP method (e.g., 'GET', 'POST').
 * @param {object} [body=null] - The request body for POST/PUT requests.
 * @returns {Promise<object>} The JSON response data.
 */
async function apiFetch(endpoint, method = 'GET', body = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    try {
        const response = await fetch(API_URL + endpoint, options);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        handleError(error.message);
        throw error; // Re-throw to stop further execution if API fails
    }
}

/**
 * Dynamically adjusts the font size of the word to fit the card.
 * NOTE: The primary dynamic sizing is handled by CSS (font-size: min(10vw, 3rem);)
 * This function handles initial text content sizing in case of unusual overflow.
 */
function adjustWordFontSize() {
    const containerWidth = wordCard.offsetWidth - 120; // Card width minus padding
    let fontSize = parseFloat(window.getComputedStyle(currentWordSpan).fontSize);

    // Iteratively reduce font size if the text overflows its container
    while (currentWordSpan.scrollWidth > containerWidth && fontSize > 16) {
        fontSize -= 1;
        currentWordSpan.style.fontSize = `${fontSize}px`;
    }
}

// --- Word Handling ---

/**
 * Displays the new word on the card.
 * @param {object} word - The word object from the API.
 */
function displayWord(word) {
    currentWordData = word;
    currentWordSpan.textContent = word.word.toUpperCase();
    wordIdInput.value = word._id;
    
    // Set neutral border initially
    wordCard.className = 'word-card neutral-border'; 
    
    // Ensure font size is adjusted for the new word
    // Remove inline size if it was previously set, relying on CSS min() for responsiveness
    currentWordSpan.style.fontSize = ''; 
    adjustWordFontSize(); 
}

/**
 * Fetches a new word from the server.
 */
async function fetchNewWord() {
    try {
        currentWordSpan.textContent = 'LOADING...';
        voteGoodButton.disabled = true;
        voteBadButton.disabled = true;
        
        const data = await apiFetch('/get-word');
        displayWord(data.word);
        
        // Restore button state
        voteGoodButton.disabled = false;
        voteBadButton.disabled = false;

    } catch (error) {
        // Error handled in apiFetch
    }
}

// --- Engagement Messaging System ---

/**
 * Determines the appropriate engagement message based on vote statistics.
 * @param {string} voteType - 'good' or 'bad'.
 * @param {number} totalVotesBefore - Total votes before the current one.
 * @param {number} goodVotesBefore - Good votes before the current one.
 * @param {number} badVotesBefore - Bad votes before the current one.
 * @returns {{message: string, isGood: boolean, isBad: boolean}} - The message and associated theme.
 */
function getEngagementMessage(voteType, totalVotesBefore, goodVotesBefore, badVotesBefore) {
    const isGoodVote = voteType === 'good';
    const isBadVote = voteType === 'bad';
    
    // Calculate new vote counts
    const goodVotesAfter = goodVotesBefore + (isGoodVote ? 1 : 0);
    const badVotesAfter = badVotesBefore + (isBadVote ? 1 : 0);
    const totalVotesAfter = totalVotesBefore + 1;
    
    const voteDifference = Math.abs(goodVotesAfter - badVotesAfter);
    const isFirstVote = totalVotesBefore === 0;
    
    // --- Message Logic ---

    // 1. First Vote / Fresh Word
    if (isFirstVote) {
        if (isGoodVote) return { message: "First to call it good! Setting the tone.", isGood: true, isBad: false };
        if (isBadVote) return { message: "First vote is critical! Bold choice.", isGood: false, isBad: true };
    }
    
    // 2. Unanimous Vote (Solo) / Only Vote
    if (totalVotesBefore > 0) {
        // If it was previously all Bad, and this is the first Good vote
        if (isGoodVote && badVotesBefore > 0 && goodVotesBefore === 0) {
            return { message: `First "Good" vote! Breaking the mold of ${badVotesBefore} Bads.`, isGood: true, isBad: false };
        }
        // If it was previously all Good, and this is the first Bad vote
        if (isBadVote && goodVotesBefore > 0 && badVotesBefore === 0) {
            return { message: `First "Bad" vote! Challenging ${goodVotesBefore} Goods.`, isGood: false, isBad: true };
        }
    }
    
    // 3. Close Call (Contested Word)
    if (totalVotesAfter >= 5 && voteDifference <= 2) {
        return { message: `It's a tight race! ${currentWordData.word} is highly contested.`, isGood: false, isBad: false };
    }
    
    // 4. Milestone / Encouragement
    if (totalVotesAfter % 10 === 0) {
        return { message: `Great job! That's vote #${totalVotesAfter} for this word.`, isGood: false, isBad: false };
    }
    
    if (isGoodVote) {
        const encouragement = [
            "Nice call! That's a good one.",
            "A vote for the bright side!",
            "You've chosen wisely.",
            "Keeping the good vibes flowing!",
        ];
        return { message: encouragement[Math.floor(Math.random() * encouragement.length)], isGood: true, isBad: false };
    } 
    
    if (isBadVote) {
        const warnings = [
            "Fair assessment. Every vote counts!",
            "Oof. That's a tough word.",
            "Taking a stand. We need that!",
            "Acknowledging the dark side.",
        ];
        return { message: warnings[Math.floor(Math.random() * warnings.length)], isGood: false, isBad: true };
    }

    // Default Fallback
    return { message: "Thanks for voting!", isGood: false, isBad: false };
}

/**
 * Displays the dynamic engagement message above the card.
 * @param {string} voteType - 'good' or 'bad'.
 */
function showEngagementMessage(voteType) {
    const { goodVotes, badVotes } = currentWordData;
    
    // Get the message details
    const { message, isGood, isBad } = getEngagementMessage(
        voteType, 
        goodVotes + badVotes, 
        goodVotes, 
        badVotes
    );

    // Apply styles based on message theme
    engagementMessageBox.textContent = message;
    
    // Reset classes first
    engagementMessageBox.className = 'bg-blue-100 text-blue-800 text-sm font-semibold rounded-lg shadow-xl border border-blue-200';
    
    if (isGood) {
        // Use Tailwind classes matching the good theme
        engagementMessageBox.classList.add('bg-green-100', 'text-green-800', 'border-green-200');
    } else if (isBad) {
        // Use Tailwind classes matching the bad theme
        engagementMessageBox.classList.add('bg-red-100', 'text-red-800', 'border-red-200');
    } else {
        // Neutral theme (e.g., encouragement, stats)
        engagementMessageBox.classList.add('bg-gray-100', 'text-gray-800', 'border-gray-200');
    }
    
    // Show the message
    engagementMessageBox.classList.add('visible');

    // Hide the message after a short delay
    setTimeout(() => {
        engagementMessageBox.classList.remove('visible');
    }, 2500); 
}

// --- Voting Logic ---

/**
 * Handles the voting process.
 * @param {string} voteType - 'good' or 'bad'.
 */
async function handleVote(voteType) {
    const wordId = wordIdInput.value;
    if (!wordId) return;

    // 1. Show engagement message BEFORE the visual change/slide out.
    showEngagementMessage(voteType);
    
    // 2. Animate the card slide out
    const slideOutClass = voteType === 'good' ? 'slide-out-good' : 'slide-out-bad';
    wordCard.classList.add(slideOutClass);
    
    // 3. Update the word card border color based on vote
    wordCard.classList.add(voteType === 'good' ? 'good-border' : 'bad-border');
    
    // Temporarily disable buttons
    voteGoodButton.disabled = true;
    voteBadButton.disabled = true;

    // 4. Send vote to the server
    await apiFetch('/vote', 'POST', { id: wordId, type: voteType });
    
    // 5. Wait for animation to finish, then fetch a new word
    setTimeout(async () => {
        // Remove animation class for the next word
        wordCard.classList.remove(slideOutClass, 'good-border', 'bad-border');
        wordCard.classList.add('neutral-border'); // Reset to neutral
        await fetchNewWord();
        await fetchTopWords(); // Also refresh the lists
    }, 400); // Matches the transition duration (0.4s)
}

// --- Top Words List ---

/**
 * Renders a list of words into the given container.
 * @param {HTMLElement} container - The UL element to render into.
 * @param {Array<object>} words - The list of word objects.
 * @param {boolean} isGoodList - True if rendering the "Mostly Good" list.
 */
function renderWordList(container, words, isGoodList) {
    container.innerHTML = ''; // Clear existing list
    
    if (words.length === 0) {
        container.innerHTML = '<li class="text-center italic text-sm text-gray-400">No data yet.</li>';
        return;
    }

    words.forEach(word => {
        const li = document.createElement('li');
        
        const good = word.goodVotes;
        const bad = word.badVotes;
        const total = good + bad;
        
        // Calculate the score/percentage for display
        const percentage = Math.round((isGoodList ? good : bad) / total * 100);
        const scoreClass = isGoodList ? 'text-green-600' : 'text-red-600';
        
        li.className = 'flex justify-between items-center text-sm p-2 bg-white rounded-md shadow-sm border border-gray-100';
        li.innerHTML = `
            <span class="font-medium text-gray-800">${word.word.toUpperCase()}</span>
            <span class="font-bold ${scoreClass}">${percentage}%</span>
        `;
        container.appendChild(li);
    });
}

/**
 * Fetches the top-rated words from the server and updates the lists.
 */
async function fetchTopWords() {
    try {
        mostlyGoodList.innerHTML = '<li class="text-center italic text-sm">Loading...</li>';
        mostlyBadList.innerHTML = '<li class="text-center italic text-sm">Loading...</li>';
        
        const data = await apiFetch('/top-words');
        
        renderWordList(mostlyGoodList, data.mostlyGood, true);
        renderWordList(mostlyBadList, data.mostlyBad, false);

    } catch (error) {
        // Error handled in apiFetch
    }
}

// --- Initialization and Event Listeners ---

function init() {
    // 1. Initial Data Load
    fetchNewWord();
    fetchTopWords();

    // 2. Attach Event Listeners
    voteGoodButton.addEventListener('click', () => handleVote('good'));
    voteBadButton.addEventListener('click', () => handleVote('bad'));

    // Optional: Add keyboard controls for quick voting
    document.addEventListener('keydown', (e) => {
        if (!voteGoodButton.disabled) {
            if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'g') {
                e.preventDefault();
                voteGoodButton.click();
            } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'b') {
                e.preventDefault();
                voteBadButton.click();
            }
        }
    });
}

// Start the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);
