/**
 * Good Word / Bad Word Classification Game
 * Frontend JavaScript Logic (public/script.js)
 *
 * FIXES:
 * 1. Corrected vote payload key from 'voteType' to 'classification' (to match server).
 * 2. Ensured word ID is consistently checked as 'id' (from server's virtual property).
 * 3. Updated fetchAndRenderTopWords to handle the new server response structure (object with two lists).
 */

// Set up BASE URL for API calls. Use relative path /api
const BASE_URL = '/api'; 

// Stores the current word object { id, word } (using 'id' to match the server's virtual property)
let currentWordData = null; 

// --- DOM Element References ---
const elements = {
    currentWordSpan: document.getElementById('wordDisplay'), // Matches HTML ID
    voteGoodButton: document.getElementById('goodWordBtn'), // Matches HTML ID
    voteBadButton: document.getElementById('badWordBtn'), // Matches HTML ID
    mostlyGoodList: document.getElementById('mostlyGoodList'),
    mostlyBadList: document.getElementById('mostlyBadList'),
    messageDisplay: document.getElementById('messageDisplay'),
    wordBox: document.querySelector('.word-box'), 
};

// --- Utility Functions ---

/**
 * Utility function for retrying API fetch operations (using exponential backoff).
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
                     throw new Error('Backend DB Health Check Failed (503/Offline status)');
                }
                // Check if the response is JSON for a more readable message
                try {
                    const errorJson = JSON.parse(errorText);
                    errorText = errorJson.message || errorText;
                } catch (e) {
                    // Not JSON, use raw text
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
 * Fetches the next word to classify.
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

        } else if (data && data.word === "EMPTY DB") {
            elements.currentWordSpan.textContent = "DATABASE EMPTY";
            elements.voteGoodButton.disabled = true;
            elements.voteBadButton.disabled = true;
        } else {
            // UNEXPECTED RESPONSE
            elements.currentWordSpan.textContent = "API Error: Invalid Word Data";
            displayMessage("API responded but data format was incorrect. Check backend schema.", true);
        }

    } catch (error) {
        console.error("Failed to fetch next word from API:", error);
        
        const errorMessage = error.message.includes('Backend DB Health Check Failed') 
            ? "SERVER ERROR: Database Health Check Failed. See Server Logs."
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
    // Check for word ID which is 'id' from the server response
    const wordId = currentWordData?.id; 
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
            // CRITICAL FIX: The server expects 'classification', not 'voteType'
            body: JSON.stringify({ wordId, classification: voteType }) 
        });

        // Simple success message
        displayMessage(`Voted ${voteType.toUpperCase()} on "${currentWordData.word}"!`, false);
        
        // Trigger style change
        elements.wordBox.classList.remove('neutral-border');
        elements.wordBox.classList.add(voteType === 'good' ? 'good-border' : 'bad-border');
        
        // Fetch new data after a slight delay for better user experience
        setTimeout(() => {
            fetchNextWord();
            fetchAndRenderTopWords();
        }, 300); // Small delay

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
 * Fetches and updates the top rated words.
 */
async function fetchAndRenderTopWords() {
    try {
        const response = await retryFetch(`${BASE_URL}/top-words`);
        // FIX: The server now returns an object { mostlyGood: [], mostlyBad: [] }
        const topWords = await response.json(); 

        if (topWords && Array.isArray(topWords.mostlyGood) && Array.isArray(topWords.mostlyBad)) {
            // Combine and render the two lists separately
            renderTopWords(topWords.mostlyGood, topWords.mostlyBad);
        } else {
             // If array not returned, fall to error list state
             throw new Error("Top words API returned unexpected data structure.");
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
 * @param {Array} goodList - Array of mostly good word objects.
 * @param {Array} badList - Array of mostly bad word objects.
 */
function renderTopWords(goodList, badList) {
    // Helper function to create list items
    const createListItem = (w, isGoodList) => {
        // The server provides 'percentage' if the list is mostly good. We need to calculate the inverse for mostly bad.
        const percentage = isGoodList ? w.percentage : (100 - w.percentage);
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
    
    // Set up recurring update for the top lists (every 30 seconds, less frequent than 5s is better for API load)
    setInterval(fetchAndRenderTopWords, 30000); 
}


// Start the entire process
window.onload = startApp;
