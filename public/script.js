/**
 * Word Classifier Game Frontend Logic
 * Manages UI interaction, API communication, and state.
 */

// Define the base URL for API calls.
// In a deployment environment, this usually needs to be the domain of the running server.
// Since the frontend and backend are served from the same Express server in this setup, 
// using the root path ('/') should usually work, but using the full domain is safer.
// For robust, single-server deployments, we will explicitly use the current domain.
const BASE_URL = window.location.origin;

// DOM Elements
const wordDisplay = document.getElementById('wordDisplay');
const wordIdInput = document.getElementById('wordIdInput');
const loadingIndicator = document.getElementById('loadingIndicator');
const gameContainer = document.getElementById('gameContainer');
const goodWordsList = document.getElementById('goodWordsList');
const badWordsList = document.getElementById('badWordsList');
const goodButton = document.getElementById('goodButton');
const badButton = document.getElementById('badButton');

// Global state
let currentWordId = null; 
let isVoting = false; // Prevents double voting

/**
 * Utility function to make API requests.
 * @param {string} endpoint - The API endpoint (e.g., '/api/get-word').
 * @param {object} options - Fetch options (method, headers, body, etc.).
 * @returns {Promise<object>} The JSON response body.
 */
async function apiCall(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    console.log(`[API] Making call to: ${url}`);
    
    // Simple retry mechanism for intermittent network failures
    const MAX_RETRIES = 3;
    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            const response = await fetch(url, options);
            
            // Check for non-2xx response (HTTP error)
            if (!response.ok) {
                // Read the error message from the server if available
                const errorBody = await response.json().catch(() => ({ message: 'No detailed error message from server.' }));
                throw new Error(`HTTP Error ${response.status}: ${errorBody.error || errorBody.message || 'Unknown server error'}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`[API] Attempt ${i + 1} failed for ${endpoint}:`, error.message);
            if (i === MAX_RETRIES - 1) {
                // Throw the error after the final attempt
                throw new Error(`Failed to fetch data after ${MAX_RETRIES} attempts. Check server status and console for details. Error: ${error.message}`);
            }
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); 
        }
    }
}


/**
 * Fetches a new word from the backend and updates the UI.
 */
async function fetchNewWord() {
    isVoting = false;
    loadingIndicator.style.display = 'block';
    wordDisplay.textContent = 'LOADING...';
    goodButton.disabled = true;
    badButton.disabled = true;

    try {
        const data = await apiCall('/api/get-word');
        
        if (data.word === "DB EMPTY") {
            wordDisplay.textContent = "DATABASE EMPTY";
            console.warn("Server reported the word database is empty.");
        } else {
            currentWordId = data.wordId;
            wordDisplay.textContent = data.word;
        }

    } catch (error) {
        // Display generic error message on screen
        wordDisplay.textContent = 'API ERROR';
        console.error("Critical error during word fetch:", error);

        // Optionally, display more details in a message box instead of alert()
        showMessageBox(
            'Connection Failed', 
            `Could not load the next word. Please check the server status in the deployment logs. Error: ${error.message}`,
            'error'
        );
        
    } finally {
        loadingIndicator.style.display = 'none';
        goodButton.disabled = false;
        badButton.disabled = false;
        isVoting = false;
    }
}

/**
 * Handles the voting process.
 * @param {string} voteType - 'good' or 'bad'.
 */
async function handleVote(voteType) {
    if (isVoting || !currentWordId) return;
    isVoting = true;

    goodButton.disabled = true;
    badButton.disabled = true;

    try {
        await apiCall('/api/vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wordId: currentWordId, voteType: voteType })
        });

        // Optional: Show a quick feedback message
        console.log(`Successfully voted '${voteType}' for word ID: ${currentWordId}`);

        // After voting, update the community ratings and fetch the next word
        await Promise.all([updateCommunityRatings(), fetchNewWord()]);

    } catch (error) {
        console.error("Error submitting vote:", error);
        showMessageBox(
            'Vote Failed', 
            `Could not submit your vote. Please try again. Error: ${error.message}`,
            'warning'
        );
        isVoting = false;
        goodButton.disabled = false;
        badButton.disabled = false;
    }
}

/**
 * Fetches and updates the community ratings display.
 */
async function updateCommunityRatings() {
    goodWordsList.innerHTML = '<li>Loading...</li>';
    badWordsList.innerHTML = '<li>Loading...</li>';
    
    try {
        const data = await apiCall('/api/top-words');

        // Render Mostly Good words
        if (data.mostlyGood && data.mostlyGood.length > 0) {
            goodWordsList.innerHTML = data.mostlyGood
                .map(word => `<li><span class="font-semibold">${word.word}</span> (${(word.goodRatio * 100).toFixed(0)}% Good)</li>`)
                .join('');
        } else {
            goodWordsList.innerHTML = '<li>No words rated enough yet.</li>';
        }

        // Render Mostly Bad words
        if (data.mostlyBad && data.mostlyBad.length > 0) {
            badWordsList.innerHTML = data.mostlyBad
                .map(word => `<li><span class="font-semibold">${word.word}</span> (${(word.badRatio * 100).toFixed(0)}% Bad)</li>`)
                .join('');
        } else {
            badWordsList.innerHTML = '<li>No words rated enough yet.</li>';
        }

    } catch (error) {
        console.error("Error fetching community ratings:", error);
        goodWordsList.innerHTML = '<li>Failed to load rankings.</li>';
        badWordsList.innerHTML = '<li>Failed to load rankings.</li>';
    }
}

/**
 * Custom function to display messages to the user without using alert()
 * A simple implementation is used here, but in a full app, this would be a UI modal.
 * @param {string} title 
 * @param {string} message 
 * @param {string} type 
 */
function showMessageBox(title, message, type = 'info') {
    // In a production app, you would create a modal div here.
    // For this environment, we rely on console logging and a temporary on-screen message.
    console.error(`[MESSAGE BOX - ${type.toUpperCase()}] ${title}: ${message}`);
    
    // Temporarily display on the word display area
    wordDisplay.textContent = `${title}: ${message.substring(0, 50)}...`;
    
    // Restore display after a delay (or wait for the next word fetch)
    setTimeout(() => {
        if (!isVoting) {
             wordDisplay.textContent = 'API ERROR'; // Keep error status until next fetch
        }
    }, 5000); 
}


// --- Event Listeners and Initialization ---

// Attach event listeners to buttons
goodButton.addEventListener('click', () => handleVote('good'));
badButton.addEventListener('click', () => handleVote('bad'));

// Run on page load
window.onload = () => {
    // Start the process: load the first word and the initial ratings
    Promise.all([fetchNewWord(), updateCommunityRatings()]);
    
    // Optional: Log version info
    apiCall('/api/version')
        .then(data => console.log(`Backend Version: ${data.version}`))
        .catch(() => console.log('Could not fetch backend version.'));
};
