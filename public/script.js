// --- Configuration ---
const API_URL_BASE = '/api';
const WORD_CARD_TRANSITION_DURATION = 400; // ms

// --- DOM Elements ---
const currentWordEl = document.getElementById('currentWord');
const wordIdInput = document.getElementById('word-id');
const wordCardEl = document.getElementById('wordCard');
const voteGoodBtn = document.getElementById('vote-good');
const voteBadBtn = document.getElementById('vote-bad');
const engagementMessageBox = document.getElementById('engagementMessageBox');
const mostlyGoodListEl = document.getElementById('mostly-good-list');
const mostlyBadListEl = document.getElementById('mostly-bad-list');

// Array of critical elements to check
const criticalElements = [
    { element: currentWordEl, name: 'currentWord (Word Display)' },
    { element: wordIdInput, name: 'word-id (Hidden Input)' },
    { element: wordCardEl, name: 'wordCard (Card Container)' },
    { element: voteGoodBtn, name: 'vote-good (Good Button)' },
    { element: voteBadBtn, name: 'vote-bad (Bad Button)' },
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
    } else {
         // If app container is missing, rely on the console error
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
                // If response is not OK (e.g., 4xx or 5xx), throw to trigger retry
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response;
        } catch (error) {
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
    // Determine color based on type (using CSS variables defined in style.css)
    const colorMap = {
        good: { bg: '#d4edda', text: '#155724' }, // Light Green, Dark Green (Default for Good)
        bad: { bg: '#f8d7da', text: '#721c24' },   // Light Red, Dark Red (Default for Bad)
        neutral: { bg: '#cce5ff', text: '#004085' } // Light Blue, Dark Blue (Default for Neutral/Info)
    };

    const colors = colorMap[type] || colorMap.neutral;

    engagementMessageBox.textContent = message;
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
    currentWordEl.textContent = "LOADING...";
    wordCardEl.classList.remove('good-border', 'bad-border', 'neutral-border'); // Clear all classes
    wordCardEl.classList.add('neutral-border'); // Set default loading state

    try {
        const response = await fetchWithRetry(`${API_URL_BASE}/get-word`);
        const data = await response.json();

        if (data && data.word) {
            currentWordEl.textContent = data.word;
            wordIdInput.value = data.id;
            console.debug(`[API] New word returned: ${data.word} (ID: ${data.id})`);
        } else {
            currentWordEl.textContent = "No words available.";
            wordIdInput.value = '';
            console.warn("[API] Received empty or invalid word data.");
        }
    } catch (error) {
        console.error("Error fetching word:", error);
        currentWordEl.textContent = "ERROR: Failed to load word.";
        wordIdInput.value = '';
    }
}

/**
 * Sends a user vote to the API.
 * @param {string} classification - 'good' or 'bad'.
 */
async function sendVote(classification) {
    const wordId = wordIdInput.value;
    const word = currentWordEl.textContent;

    if (!wordId) {
        displayEngagementMessage("Please wait for the current word to load before voting.", 'neutral');
        return;
    }

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
            body: JSON.stringify({ wordId, classification })
        });

        const result = await response.json();
        
        // 3. Update UI after successful vote
        if (result.success) {
            displayEngagementMessage(`Voted '${word}' as ${classification.toUpperCase()}!`, classification);
            // After successful vote, load next word and refresh leaderboard
            await loadNewWord(); 
            await loadTopWords(); 
        } else {
            // If API returns success: false, treat as an error
            throw new Error(result.message || "Failed to submit vote on the server.");
        }
    } catch (error) {
        console.error("Error submitting vote:", error);
        displayEngagementMessage("ERROR: Could not submit vote. Check your network.", 'bad');
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
    mostlyGoodListEl.innerHTML = '<li class="text-center italic text-sm">Loading...</li>';
    mostlyBadListEl.innerHTML = '<li class="text-center italic text-sm">Loading...</li>';

    try {
        const response = await fetchWithRetry(`${API_URL_BASE}/top-words`);
        const data = await response.json();
        
        console.debug("[API] /top-words returned:", data);
        
        // Render lists
        renderTopWords(data);

    } catch (error) {
        console.error("Error fetching top words:", error);
        mostlyGoodListEl.innerHTML = '<li class="text-center text-red-500 text-sm">Error loading.</li>';
        mostlyBadListEl.innerHTML = '<li class="text-center text-red-500 text-sm">Error loading.</li>';
    }
}

/**
 * Renders the top word data into the leaderboard lists.
 * @param {Object} data - Object containing mostlyGood and mostlyBad arrays.
 */
function renderTopWords(data) {
    console.debug("Starting renderTopWords with data:", data);
    
    // Check if the lists exist (already checked at init, but safe to check again)
    if (!mostlyGoodListEl || !mostlyBadListEl) {
        console.error("RENDER ERROR: Top word list containers are missing. Cannot update UI.");
        return; 
    }
    
    // Helper function to render a list
    const renderList = (listElement, words) => {
        listElement.innerHTML = ''; // Clear existing content

        if (!words || words.length === 0) {
            listElement.innerHTML = '<li class="text-center italic text-sm text-gray-500 p-2">No data yet! Be the first to vote.</li>';
            return;
        }

        words.forEach(item => {
            // Calculate percentage for display
            const totalVotes = item.goodVotes + item.badVotes;
            // Determine the vote count for the current list type
            const listTypeVoteCount = listElement === mostlyGoodListEl ? item.goodVotes : item.badVotes;
            
            // Percentage of the dominant vote type for this word
            const percentage = totalVotes > 0 ? ((listTypeVoteCount / totalVotes) * 100).toFixed(0) : 0;
            
            const listItem = document.createElement('li');
            // Using classes defined in style.css for list items
            listItem.className = 'py-2 border-b last:border-b-0 border-gray-200 flex justify-between items-center';
            listItem.innerHTML = `
                <span class="font-medium text-gray-800">${item.word}</span>
                <span class="percentage font-semibold">${percentage}%</span>
            `;
            listElement.appendChild(listItem);
        });
    };

    renderList(mostlyGoodListEl, data.mostlyGood);
    renderList(mostlyBadListEl, data.mostlyBad);
    console.debug("Leaderboard data rendered.");
}


// --- Event Listeners ---
voteGoodBtn.addEventListener('click', () => sendVote('good'));
voteBadBtn.addEventListener('click', () => sendVote('bad'));


// --- Initialization ---
function init() {
    console.log("Good Word/Bad Word app starting...");
    
    // 1. Load the first word
    loadNewWord();
    
    // 2. Load the leaderboard (top words)
    loadTopWords();

    // 3. Display version information (already handled in HTML, but can be updated dynamically if needed)
    // document.getElementById('version-display').textContent = "v1.0.0";
}

// Start the application after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);
