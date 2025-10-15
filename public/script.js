/**
 * Good Word / Bad Word Classification Game
 * Frontend JavaScript Logic (public/script.js)
 *
 * FIXES:
 * 1. Removed all local fallback logic.
 * 2. Implemented aggressive, delayed retries within fetchNextWord() for API/DB failure (503/Offline).
 * 3. Enhanced error messaging to clearly indicate DB connection issues while retrying.
 */

// Set up BASE URL for API calls. Use relative path /api
const BASE_URL = '/api'; 

// Stores the current word object { id, word }
let currentWordData = null; 

// --- DOM Element References ---
const elements = {
    currentWordSpan: document.getElementById('wordDisplay'), 
    voteGoodButton: document.getElementById('goodWordBtn'), 
    voteBadButton: document.getElementById('badWordBtn'), 
    mostlyGoodList: document.getElementById('mostlyGoodList'),
    mostlyBadList: document.getElementById('mostlyBadList'),
    messageDisplay: document.getElementById('messageDisplay'),
    wordBox: document.querySelector('.word-box'), 
};

// --- Utility Functions ---

/**
 * Displays a temporary message in the UI (e.g., error/success).
 * @param {string} msg 
 * @param {boolean} isError 
 */
function displayMessage(msg, isError = false) {
    if (elements.messageDisplay) {
        elements.messageDisplay.textContent = msg;
        elements.messageDisplay.classList.remove('hidden', 'text-green-600', 'text-red-600', 'text-yellow-600');
        
        let colorClass = isError ? 'text-red-600' : 'text-green-600';
        if (msg.includes('Retrying')) {
            colorClass = 'text-yellow-600'; // Special class for retries/warnings
        }

        elements.messageDisplay.classList.add(colorClass);
        elements.messageDisplay.classList.remove('hidden');

        // Hide the message after a delay, unless it's a persistent error
        if (!msg.includes('Retrying')) {
            setTimeout(() => {
                elements.messageDisplay.classList.add('hidden');
            }, 3000);
        }
    }
}

/**
 * Utility function for retrying API fetch operations (using exponential backoff).
 * This function handles retries internally and throws only fatal errors.
 * @param {string} url - The API endpoint URL.
 * @param {Object} options - Fetch options (method, headers, body, etc.).
 * @param {number} maxRetries - Maximum number of retries.
 */
async function retryFetch(url, options = {}, maxRetries = 3) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                let errorText = await response.text();
                // Check for server-side 503 error message
                if (response.status === 503 || errorText.includes('Database offline')) {
                     // Throw specific error to be caught by the continuous fetch logic
                     throw new Error('API_DB_OFFLINE'); 
                }
                // Handle other HTTP errors
                try {
                    const errorJson = JSON.parse(errorText);
                    errorText = errorJson.message || errorText;
                } catch (e) { /* ignore JSON parse error */ }
                throw new Error(`HTTP error! Status: ${response.status} - ${errorText.substring(0, 100)}...`);
            }
            return response;
        } catch (error) {
            if (error.message === 'API_DB_OFFLINE') {
                throw error; // Let the caller handle the continuous retry for DB issues
            }
            
            if (attempt === maxRetries - 1) {
                console.error(`API call to ${url} failed after ${maxRetries} attempts.`, error);
                throw error; // Re-throw the error after final attempt
            }
            const delay = Math.pow(2, attempt) * 500 + Math.random() * 500;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}


// --- Core API Functions ---

/**
 * Fetches the next word to classify with continuous retries on DB failure.
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

        // Server returns { id, word }
        if (data && data.word && data.id) {
            currentWordData = data;
            elements.currentWordSpan.textContent = currentWordData.word.toUpperCase();

            elements.voteGoodButton.disabled = false;
            elements.voteBadButton.disabled = false;
            displayMessage("Database Connection Successful.", false);

        } else if (data && data.word === "EMPTY DB") {
            elements.currentWordSpan.textContent = "DATABASE EMPTY";
            elements.voteGoodButton.disabled = true;
            elements.voteBadButton.disabled = true;
        } else {
            throw new Error("Invalid Word Data");
        }

    } catch (error) {
        
        // --- CONTINUOUS RETRY LOGIC FOR DB OFFLINE ---
        if (error.message === 'API_DB_OFFLINE' || error.message.includes('Service Unavailable')) {
            elements.currentWordSpan.textContent = "DB OFFLINE";
            const delay = 5000; // Wait 5 seconds before retrying
            
            displayMessage(`API/DB Connection Lost. Retrying in ${delay / 1000}s...`, false);
            console.error("Database connection failed. Retrying in 5 seconds.", error);
            
            // Re-call self after delay
            setTimeout(fetchNextWord, delay); 
            return;
        }

        // --- FATAL ERROR ---
        console.error("Fatal error fetching next word:", error);
        elements.currentWordSpan.textContent = "API FATAL ERROR";
        displayMessage(`FATAL ERROR: ${error.message}`, true);
    }
}

/**
 * Handles the voting action (Good or Bad) by calling the backend API.
 * @param {string} voteType - 'good' or 'bad'.
 */
async function handleVote(voteType) {
    const wordId = currentWordData?.id; 
    if (!wordId) {
        displayMessage("Error: No word loaded to vote on.", true);
        // Attempt to fetch the next word immediately if no word is loaded
        fetchNextWord(); 
        return;
    }
    
    // Immediately disable buttons
    elements.voteGoodButton.disabled = true;
    elements.voteBadButton.disabled = true;

    try {
        await retryFetch(`${BASE_URL}/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // CRITICAL: The server expects 'classification'
            body: JSON.stringify({ wordId, classification: voteType }) 
        });

        displayMessage(`Voted ${voteType.toUpperCase()} on "${currentWordData.word}"!`, false);
        
        // Trigger style change
        elements.wordBox.classList.remove('neutral-border');
        elements.wordBox.classList.add(voteType === 'good' ? 'good-border' : 'bad-border');
        
        // Fetch new data
        setTimeout(() => {
            fetchNextWord();
            fetchAndRenderTopWords();
        }, 300); 

    } catch (e) {
        if (e.message === 'API_DB_OFFLINE') {
            displayMessage("Vote Failed: DB Offline. Attempting reconnect...", true);
            // Trigger the continuous retry loop via fetchNextWord
            fetchNextWord();
            fetchAndRenderTopWords(); // Attempt to update lists too
            return;
        }
        
        // General vote failure (non-DB offline)
        console.error("API Vote call failed: ", e);
        displayMessage(`Vote Failed: ${e.message}`, true);
        
        // Re-enable buttons so the user can try again on the same word
        elements.voteGoodButton.disabled = false;
        elements.voteBadButton.disabled = false;
    }
}


/**
 * Fetches and updates the top rated words.
 */
async function fetchAndRenderTopWords() {
    try {
        const response = await retryFetch(`${BASE_URL}/top-words`);
        const topWords = await response.json(); 

        if (topWords && Array.isArray(topWords.mostlyGood) && Array.isArray(topWords.mostlyBad)) {
            renderTopWords(topWords.mostlyGood, topWords.mostlyBad);
        } else {
             throw new Error("Top words API returned unexpected data structure.");
        }
    } catch (error) {
        if (error.message === 'API_DB_OFFLINE') {
            // Don't clutter the console, the main word fetch is handling the retry loop.
            return; 
        }

        console.error("Failed to fetch top words from API:", error);
        // Clear lists and show error message
        elements.mostlyGoodList.innerHTML = '<li class="text-center text-red-500 text-sm">List failed to load.</li>';
        elements.mostlyBadList.innerHTML = '<li class="text-center text-red-500 text-sm">List failed to load.</li>';
    }
}

/**
 * Renders the top words into the two lists.
 */
function renderTopWords(goodList, badList) {
    // Helper function to create list items
    const createListItem = (w, isGoodList) => {
        // The server provides 'percentage' (of good votes). We need to calculate the inverse for mostly bad.
        const percentage = w.percentage; // Server calculates the percentage of good votes
        const displayPercentage = isGoodList ? percentage : 100 - percentage;
        
        const colorClass = isGoodList ? 'text-green-600' : 'text-red-600';

        return `
            <li class="flex justify-between items-center px-2 py-1 rounded-lg transition duration-150">
                <span class="font-medium uppercase tracking-wider">${w.word}</span>
                <span class="text-sm font-bold ${colorClass}">${displayPercentage}%</span>
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
    fetchNextWord(); // Initial load, starts the continuous retry loop if DB is down
    fetchAndRenderTopWords(); // Initial list load
    
    // Set up recurring update for the top lists
    setInterval(fetchAndRenderTopWords, 30000); 
}


// Start the entire process
window.onload = startApp;
