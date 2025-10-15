/**
 * Good Word / Bad Word Classification Game
 * Frontend JavaScript Logic (public/script.js)
 * Reverted to a stable, functional version (v3.7.4 equivalent logic)
 */

// Set up BASE URL for API calls. Use relative path /api
const BASE_URL = '/api'; 

let currentWordData = null; // Stores the current word object { word, _id }

// --- DOM Element References (Updated to match public/index.html IDs) ---
const elements = {
    currentWordSpan: document.getElementById('wordDisplay'), // Matches HTML ID
    voteGoodButton: document.getElementById('goodWordBtn'), // Matches HTML ID
    voteBadButton: document.getElementById('badWordBtn'), // Matches HTML ID
    mostlyGoodList: document.getElementById('mostlyGoodList'),
    mostlyBadList: document.getElementById('mostlyBadList'),
    messageDisplay: document.getElementById('messageDisplay'),
    // Note: We don't have a direct 'wordCard' ID in the current HTML, but we'll use the parent 'word-box' style for simple feedback
    wordBox: document.querySelector('.word-box'), 
};

// --- Utility Functions ---

/**
 * Utility function for retrying API fetch operations (using exponential backoff).
 * This ensures the app is resilient against temporary connection drops to the Render API.
 * @param {string} url - The API endpoint URL.
 * @param {Object} options - Fetch options (method, headers, body, etc.).
 * @param {number} maxRetries - Maximum number of retries.
 */
async function retryFetch(url, options = {}, maxRetries = 3) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                // Throw an error if the HTTP status is not 2xx
                let errorText = await response.text();
                if (response.status === 503 || errorText.includes('Database offline')) {
                     throw new Error('Backend DB Health Check Failed (503/Offline status)');
                }
                throw new Error(`HTTP error! Status: ${response.status} - ${errorText.substring(0, 100)}...`);
            }
            return response;
        } catch (error) {
            if (attempt === maxRetries - 1) {
                console.error(`API call to ${url} failed after ${maxRetries} attempts.`, error);
                throw error; // Re-throw the error after final attempt
            }
            const delay = Math.pow(2, attempt) * 500 + Math.random() * 500;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

/**
 * Displays a temporary message in the UI (e.g., error/success).
 * @param {string} msg 
 * @param {boolean} isError 
 */
function displayMessage(msg, isError = false) {
    if (elements.messageDisplay) {
        elements.messageDisplay.textContent = msg;
        elements.messageDisplay.classList.remove('hidden', 'text-green-600', 'text-red-600');
        elements.messageDisplay.classList.add(isError ? 'text-red-600' : 'text-green-600');
        
        // Show the message
        elements.messageDisplay.classList.remove('hidden');

        // Hide the message after a delay
        setTimeout(() => {
            elements.messageDisplay.classList.add('hidden');
        }, 3000);
    }
}


// --- Core API Functions ---

/**
 * Fetches the next word that the current user has NOT yet voted on from the Express API.
 */
async function fetchNextWord() {
    elements.currentWordSpan.textContent = "LOADING...";
    elements.wordBox.classList.remove('good-border', 'bad-border');
    elements.wordBox.classList.add('neutral-border');
    
    // Disable buttons while loading
    elements.voteGoodButton.disabled = true;
    elements.voteBadButton.disabled = true;

    try {
        const response = await retryFetch(`${BASE_URL}/get-word`);
        const data = await response.json();

        // Check if the word returned has the _id property (matching MongoDB backend)
        if (data && data.word && data._id) {
            currentWordData = data;
            elements.currentWordSpan.textContent = currentWordData.word.toUpperCase();

            elements.voteGoodButton.disabled = false;
            elements.voteBadButton.disabled = false;

        } else if (data && data.message === "No words available to classify.") {
            elements.currentWordSpan.textContent = "ALL WORDS VOTED ON!";
            elements.voteGoodButton.disabled = true;
            elements.voteBadButton.disabled = true;
        } else {
            // UNEXPECTED RESPONSE (likely the previous 'INVALID RESPONSE')
             elements.currentWordSpan.textContent = "API Error: Invalid Word Data";
             displayMessage("API responded but data format was incorrect. Check backend schema.", true);
        }

    } catch (error) {
        console.error("Failed to fetch next word from API:", error);
        
        const errorMessage = error.message.includes('Backend DB Health Check Failed') 
            ? "SERVER ERROR: Database Health Check Failed. See Render Logs."
            : "API Connection Error: Service Unavailable.";

        elements.currentWordSpan.textContent = "API ERROR";
        displayMessage(errorMessage, true);
    }
}

/**
 * Handles the voting action (Good or Bad) by calling the backend API.
 * @param {string} voteType - 'good' or 'bad'.
 */
async function handleVote(voteType) {
    // Check for word ID using MongoDB's standard _id
    const wordId = currentWordData?._id;
    if (!wordId) {
        displayMessage("Error: No word loaded to vote on.", true);
        return;
    }
    
    // Immediately disable buttons
    elements.voteGoodButton.disabled = true;
    elements.voteBadButton.disabled = true;

    try {
        await retryFetch(`${BASE_URL}/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ wordId, voteType })
        });

        // Simple success message
        displayMessage(`Voted ${voteType.toUpperCase()} on "${currentWordData.word}"!`, false);
        
        // Trigger style change and load the next word
        elements.wordBox.classList.remove('neutral-border');
        elements.wordBox.classList.add(voteType === 'good' ? 'good-border' : 'bad-border');
        
        // Fetch new data
        fetchNextWord();
        fetchAndRenderTopWords();

    } catch (e) {
        console.error("API Vote call failed: ", e);
        
        const errorMessage = e.message.includes('Backend DB Health Check Failed') 
            ? "Vote Failed: Database Health Check Failure."
            : "Vote Failed. Check API connection.";

        displayMessage(errorMessage, true);
        
        // Re-enable buttons so the user can try again on the same word
        elements.voteGoodButton.disabled = false;
        elements.voteBadButton.disabled = false;
    }
}


/**
 * Fetches and updates the top rated words every 5 seconds using API calls.
 */
async function fetchAndRenderTopWords() {
    try {
        const response = await retryFetch(`${BASE_URL}/top-words`);
        const topWords = await response.json();

        // Check for the expected array structure
        if (Array.isArray(topWords)) {
            // Sort by total votes to find the most popular words
            topWords.sort((a, b) => (b.goodVotes + b.badVotes) - (a.goodVotes + b.badVotes));

            // Calculate percentages for rendering
            const processedWords = topWords.map(word => {
                const total = word.goodVotes + word.badVotes;
                const goodPct = total > 0 ? (word.goodVotes / total) * 100 : 50;
                return {
                    word: word.word,
                    goodVotes: word.goodVotes,
                    badVotes: word.badVotes,
                    goodPct: Math.round(goodPct),
                    isGood: goodPct >= 50,
                    isBad: goodPct < 50
                };
            });

            renderTopWords(processedWords);
        } else {
             // If array not returned, fall to error list state
             throw new Error("Top words API returned non-array data.");
        }


    } catch (error) {
        console.error("Failed to fetch top words from API:", error);
        // Clear lists and show error message
        elements.mostlyGoodList.innerHTML = '<li class="text-center text-red-500 text-sm">API Error loading list.</li>';
        elements.mostlyBadList.innerHTML = '<li class="text-center text-red-500 text-sm">API Error loading list.</li>';
    }
}

/**
 * Renders the top words into the two lists.
 * @param {Array} topWords - Array of top word objects.
 */
function renderTopWords(topWords) {
    const goodList = topWords.filter(w => w.isGood).sort((a, b) => b.goodPct - a.goodPct).slice(0, 5); // Top 5
    const badList = topWords.filter(w => w.isBad).sort((a, b) => a.goodPct - b.goodPct).slice(0, 5); // Top 5

    // Helper function to create list items
    const createListItem = (w, isGoodList) => {
        const percentage = isGoodList ? w.goodPct : 100 - w.goodPct;
        const colorClass = isGoodList ? 'text-green-600' : 'text-red-600';
        return `
            <li class="flex justify-between items-center px-2 py-1 rounded-lg transition duration-150">
                <span class="font-medium uppercase tracking-wider">${w.word}</span>
                <span class="text-sm font-bold ${colorClass}">${percentage}%</span>
            </li>
        `;
    };

    // Render Good List
    elements.mostlyGoodList.innerHTML = goodList.length > 0
        ? goodList.map(w => createListItem(w, true)).join('')
        : '<li class="text-center italic text-sm text-gray-500">No words currently trending good.</li>';

    // Render Bad List
    elements.mostlyBadList.innerHTML = badList.length > 0
        ? badList.map(w => createListItem(w, false)).join('')
        : '<li class="text-center italic text-sm text-gray-500">No words currently trending bad.</li>';
}

// --- Event Listeners and Startup ---

function setupEventListeners() {
    if (elements.voteGoodButton) {
        elements.voteGoodButton.addEventListener('click', () => handleVote('good'));
    }
    if (elements.voteBadButton) {
        elements.voteBadButton.addEventListener('click', () => handleVote('bad'));
    }
}

/**
 * Starts the application: fetches first word and sets up recurring updates.
 */
function startApp() {
    setupEventListeners();
    fetchNextWord(); // Initial load of the first word
    fetchAndRenderTopWords(); // Initial load of the top list
    
    // Set up recurring update for the top lists (every 5 seconds)
    setInterval(fetchAndRenderTopWords, 5000); 
}


// Start the entire process
window.onload = startApp;
