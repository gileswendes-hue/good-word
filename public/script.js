// --- Configuration ---
const API_URL_BASE = '/api';
const WORD_CARD_TRANSITION_DURATION = 400; // ms, must match CSS transition duration

// --- DOM Elements ---
const currentWordEl = document.getElementById('currentWord');
const wordIdInput = document.getElementById('word-id');
const wordCardEl = document.getElementById('wordCard');
const voteGoodBtn = document.getElementById('vote-good');
const voteBadBtn = document.getElementById('vote-bad');
const engagementMessageBox = document.getElementById('engagementMessageBox');
const mostlyGoodListEl = document.getElementById('mostly-good-list');
const mostlyBadListEl = document.getElementById('mostly-bad-list');
const versionDisplayEl = document.getElementById('version-display'); // For displaying version/status

// Array of critical elements to check
const criticalElements = [
    { element: currentWordEl, name: 'currentWord (Word Display)' },
    { element: wordIdInput, name: 'word-id (Hidden Input)' },
    { element: wordCardEl, name: 'wordCard (Card Container)' },
    { element: voteGoodBtn, name: 'vote-good (Good Button)' },
    { element: voteBadBtn, name: 'vote-bad (Bad Button)' },
    { element: engagementMessageBox, name: 'engagementMessageBox (Message Box)' },
    { element: mostlyGoodListEl, name: 'mostly-good-list (Good Leaderboard)' },
    { element: mostlyBadListEl, name: 'mostly-bad-list (Bad Leaderboard)' },
];

// Ensure all critical elements are found before proceeding
const missingElement = criticalElements.find(item => !item.element);

if (missingElement) {
    const errorMsg = `CRITICAL ERROR: The required DOM element "${missingElement.name}" is missing from the HTML. Check the element ID.`;
    console.error(errorMsg);
    
    // Display error message to user if possible
    const appContainer = document.getElementById('app-container');
    if(appContainer) {
        // Replace app content with a clear error message using simple, robust styling
        appContainer.innerHTML = `<div class="p-8 text-center text-red-600 bg-red-50 rounded-xl shadow-lg border border-red-200 mt-10">
            <h2 class="text-2xl font-bold mb-3">Initialization Failed</h2>
            <p class="text-base">${errorMsg}</p>
            <p class="mt-4 text-sm text-gray-500">Please verify the IDs in your index.html file.</p>
        </div>`;
    } 
    // Prevent execution of further logic
    throw new Error("Missing required DOM element(s).");
}


// --- Utility Functions ---

/**
 * Retries a fetch request with exponential backoff on failure.
 * @param {string} url - The URL to fetch.
 * @param {Object} options - Fetch request options.
 * @param {number} maxRetries - Maximum number of retries.
 * @returns {Promise<Response>} - The successful response.
 */
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                // If response is not OK (e.g., 503 from dbCheck), throw to trigger retry
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response;
        } catch (error) {
            // Log with console.warn to indicate a non-fatal retry attempt
            console.warn(`Fetch attempt ${i + 1} failed for ${url}: ${error.message}`);
            if (i === maxRetries - 1) throw error; // Re-throw last error

            const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

/**
 * Displays a temporary engagement message (like "Voted Good!").
 * @param {string} message - The message content.
 * @param {string} type - 'good', 'bad', or 'neutral'.
 */
function displayEngagementMessage(message, type = 'neutral') {
    // Determine color based on type, matching the CSS styles
    const colorMap = {
        // These colors correspond to the colors defined in the CSS
        good: { bg: '#d4edda', text: '#155724' },   // Light Green, Dark Green
        bad: { bg: '#f8d7da', text: '#721c24' },     // Light Red, Dark Red
        neutral: { bg: '#cce5ff', text: '#004085' }  // Light Blue, Dark Blue
    };

    const colors = colorMap[type] || colorMap.neutral;

    engagementMessageBox.textContent = message;
    // Directly setting style properties since CSS classes only handle visibility/animation
    engagementMessageBox.style.backgroundColor = colors.bg;
    engagementMessageBox.style.color = colors.text;

    engagementMessageBox.classList.add('visible');

    setTimeout(() => {
        engagementMessageBox.classList.remove('visible');
    }, 2000);
}

/**
 * Fetches a new word and updates the UI.
 */
async function loadNewWord() {
    console.debug("[API] Making call to: /api/get-word");
    
    // Set loading state and reset card
    currentWordEl.textContent = "LOADING...";
    wordIdInput.value = ''; // Clear previous ID
    wordCardEl.classList.remove('good-border', 'bad-border'); // Remove previous vote borders
    wordCardEl.classList.add('neutral-border'); // Set default neutral border

    try {
        const response = await fetchWithRetry(`${API_URL_BASE}/get-word`);
        const data = await response.json();

        if (response.status === 503) {
             throw new Error(data.message || "Server error: Database unavailable.");
        }

        // The server response is expected to have 'word' and 'id' (from the virtual property)
        const wordId = data.id; 

        if (data && data.word && wordId) {
            currentWordEl.textContent = data.word;
            wordIdInput.value = wordId;
            console.debug(`[API] New word returned: ${data.word} (ID: ${wordId})`); 
        } else {
            console.error("[API] Failed to get valid word data (Word or ID missing):", data); 
            currentWordEl.textContent = "NO WORD: Invalid server response.";
        }
    } catch (error) {
        console.error("Error fetching word:", error);
        currentWordEl.textContent = "ERROR: DB Connection Failed. Check Server Logs.";
        displayEngagementMessage("Server Error: Cannot connect to database.", 'bad');
    }
}

/**
 * Sends a user vote to the API.
 * @param {string} classification - 'good' or 'bad'.
 */
async function sendVote(classification) {
    const wordId = wordIdInput.value;
    const word = currentWordEl.textContent;

    if (!wordId || word === "LOADING..." || word.startsWith("ERROR:")) {
        displayEngagementMessage("Please wait for a valid word to load before voting.", 'neutral');
        console.error("VOTE ERROR: wordId is missing or invalid."); 
        return;
    }

    const payload = { wordId, classification };
    
    // 1. Prepare UI for vote transition
    voteGoodBtn.disabled = true;
    voteBadBtn.disabled = true;

    // Apply animation class based on vote
    const slideClass = classification === 'good' ? 'slide-out-good' : 'slide-out-bad';
    wordCardEl.classList.add(slideClass);

    // Wait for the animation to finish
    await new Promise(resolve => setTimeout(resolve, WORD_CARD_TRANSITION_DURATION));
    
    // 2. Perform API call
    console.debug(`[API] Making call to: /api/vote with classification: ${classification}`);
    try {
        const response = await fetchWithRetry(`${API_URL_BASE}/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        
        // 3. Update UI after successful vote
        if (response.ok && result.success) { 
            displayEngagementMessage(`Voted '${word}' as ${classification.toUpperCase()}!`, classification);
            // After successful vote, load next word and refresh leaderboard
            await loadNewWord(); 
            await loadTopWords(); 
        } else {
            console.error("Server response on vote failure:", result);
            // Throwing an error here triggers the catch block below for consistent handling
            throw new Error(result.message || `Failed to submit vote. Server responded with status: ${response.status}`);
        }
    } catch (error) {
        console.error("Error submitting vote:", error);
        displayEngagementMessage("ERROR: Could not submit vote. Database likely unavailable.", 'bad');
        // If vote failed, re-load the word just in case
        await loadNewWord(); 
    } finally {
        // 4. Reset UI
        wordCardEl.classList.remove(slideClass);
        voteGoodBtn.disabled = false;
        voteBadBtn.disabled = false;
    }
}

/**
 * Fetches and renders the top words leaderboard.
 */
async function loadTopWords() {
    console.debug("[API] Making call to: /api/top-words");
    
    // Set loading state for lists
    const loadingHtml = '<li class="text-center italic text-sm text-gray-500 p-2">Loading...</li>';
    mostlyGoodListEl.innerHTML = loadingHtml;
    mostlyBadListEl.innerHTML = loadingHtml;

    try {
        const response = await fetchWithRetry(`${API_URL_BASE}/top-words`);
        const data = await response.json();
        
        if (response.status === 503) {
             throw new Error(data.message || "Server error: Database unavailable.");
        }

        console.debug("[API] /top-words returned:", data);
        
        // Render lists
        renderTopWords(data);

    } catch (error) {
        console.error("Error fetching top words:", error);
        const errorHtml = '<li class="text-center text-red-500 text-sm p-2">Error loading leaderboard.</li>';
        mostlyGoodListEl.innerHTML = errorHtml;
        mostlyBadListEl.innerHTML = errorHtml;
    }
}

/**
 * Renders the top word data into the leaderboard lists.
 * @param {Object} data - Object containing mostlyGood and mostlyBad arrays.
 */
function renderTopWords(data) {
    
    // Helper function to render a list
    const renderList = (listElement, words, isGoodList) => {
        listElement.innerHTML = ''; // Clear existing content

        if (!words || words.length === 0) {
            listElement.innerHTML = '<li class="text-center italic text-sm text-gray-500 p-2">No data yet! Be the first to vote.</li>';
            return;
        }

        words.forEach(item => {
            const totalVotes = item.goodVotes + item.badVotes;
            const listTypeVoteCount = isGoodList ? item.goodVotes : item.badVotes;
            
            // Percentage of the dominant vote type for this word
            const percentage = totalVotes > 0 ? ((listTypeVoteCount / totalVotes) * 100).toFixed(0) : 0;
            
            const listItem = document.createElement('li');
            listItem.className = 'py-2 border-b last:border-b-0 border-gray-200 flex justify-between items-center px-2';
            
            // Apply color based on list type (Good list = green, Bad list = red)
            const colorClass = isGoodList ? 'text-green-600' : 'text-red-600';
            
            listItem.innerHTML = `
                <span class="font-medium text-gray-800">${item.word}</span>
                <span class="percentage font-bold ${colorClass}">${percentage}%</span>
            `;
            listElement.appendChild(listItem);
        });
    };

    renderList(mostlyGoodListEl, data.mostlyGood, true);
    renderList(mostlyBadListEl, data.mostlyBad, false);
}


// --- Event Listeners ---
voteGoodBtn.addEventListener('click', () => sendVote('good'));
voteBadBtn.addEventListener('click', () => sendVote('bad'));


// --- Initialization ---
function init() {
    console.log("Good Word/Bad Word client app initializing...");
    
    // 1. Set version display
    if (versionDisplayEl) {
         versionDisplayEl.textContent = 'v1.7.7 (Client)';
    }

    // 2. Load the first word
    loadNewWord();
    
    // 3. Load the leaderboard (top words)
    loadTopWords();
}

// Start the application after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);
