// Set up BASE URL for API calls. 
// FIX: Using the absolute URL to ensure correct routing on Render, bypassing internal path issues.
const BASE_URL = 'https://good-word.onrender.com/api'; 

let currentWordData = null; // Stores the current word object

const elements = {
    currentWordSpan: document.getElementById('currentWord'),
    wordIdInput: document.getElementById('word-id'),
    voteGoodButton: document.getElementById('vote-good'),
    voteBadButton: document.getElementById('vote-bad'),
    mostlyGoodList: document.getElementById('mostly-good-list'),
    mostlyBadList: document.getElementById('mostly-bad-list'),
    wordCard: document.getElementById('wordCard'),
    engagementMessageBox: document.getElementById('engagementMessageBox')
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
                // Check for known backend error messages (e.g., from your Express error handler)
                if (errorText.includes('Database offline') || response.status === 503) {
                     errorText = 'Service Unavailable: Database offline or unhealthy.';
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
            // Removed console.warn to adhere to silent backoff rule
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// --- Core Game Logic (API Calls) ---

/**
 * Fetches the next word that the current user has NOT yet voted on from the Express API.
 */
async function fetchNextWord() {
    elements.currentWordSpan.textContent = "LOADING...";
    elements.wordCard.classList.remove('good-border', 'bad-border');
    elements.wordCard.classList.add('neutral-border');
    
    // Disable buttons while loading
    elements.voteGoodButton.disabled = true;
    elements.voteBadButton.disabled = true;

    try {
        const response = await retryFetch(`${BASE_URL}/get-word`);
        const data = await response.json();

        if (data && data.word && data._id) {
            // SUCCESS: A word was returned
            currentWordData = data;
            elements.currentWordSpan.textContent = currentWordData.word.toUpperCase();
            elements.wordIdInput.value = currentWordData._id; // Use MongoDB's _id

            // Re-enable buttons on success
            elements.voteGoodButton.disabled = false;
            elements.voteBadButton.disabled = false;

        } else if (data && data.message === "No words available to classify.") {
             // SUCCESS BUT EMPTY: The API successfully responded but returned a message that no words are left.
            elements.currentWordSpan.textContent = "ALL WORDS VOTED ON!";
            elements.voteGoodButton.disabled = true;
            elements.voteBadButton.disabled = true;
        } else {
            // UNEXPECTED RESPONSE: The API responded, but the data structure was unexpected.
             elements.currentWordSpan.textContent = "API Error: Invalid Response";
             showEngagementMessage("API returned bad data structure. Check backend response.", "bad");
        }

    } catch (error) {
        // CATCH BLOCK: This runs if retryFetch fails all attempts (usually due to connection or DB error)
        console.error("Failed to fetch next word from API (Total Failure):", error);
        
        const errorMessage = error.message.includes('Database offline') 
            ? "API Error: Backend/Database Issue. Please check Render logs."
            : "API Connection Error. Service might be down or routing is incorrect.";

        elements.currentWordSpan.textContent = "API ERROR";
        showEngagementMessage(errorMessage, "bad");
    }
}

/**
 * Handles the voting action (Good or Bad) by calling the backend API.
 * @param {string} voteType - 'good' or 'bad'.
 */
async function handleVote(voteType) {
    if (!currentWordData) return;

    const wordId = currentWordData._id; 
    
    // Disable buttons immediately
    elements.voteGoodButton.disabled = true;
    elements.voteBadButton.disabled = true;

    try {
        const response = await retryFetch(`${BASE_URL}/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ wordId, voteType })
        });

        const result = await response.json();
        
        // --- Engagement Logic (Based on returned vote counts) ---
        const totalVotes = result.goodVotes + result.badVotes;
        const voteDifference = Math.abs(result.goodVotes - result.badVotes);

        if (result.status === 'already_voted') {
            showEngagementMessage("You already classified this word! Moving on...", "neutral");
        } else if (result.status === 'success') {
            
            let message = `Voted ${voteType.toUpperCase()} on "${currentWordData.word}"!`;
            let type = voteType; // Default type is the vote type
            
            if (totalVotes === 1) {
                // First vote ever!
                message = `🥳 Wow! You're the first to vote on "${currentWordData.word}"!`;
                type = 'good'; // Always positive for a milestone
            } else if (totalVotes < 5) {
                // Early stages
                message = `Every vote helps define "${currentWordData.word}"!`;
            } else if (voteDifference <= 2 && totalVotes >= 5) {
                // Close call, requires at least 5 votes to avoid false positives on 1/2 or 2/3
                message = `👀 It's a close one! Votes are nearly split.`;
                type = 'neutral';
            } else if (result.goodVotes === 0 || result.badVotes === 0) {
                // Unanimous/Only-type vote
                const wordType = result.goodVotes > 0 ? 'Good' : 'Bad';
                message = `🔥 Unanimous! Everyone agrees: it's a ${wordType} word!`;
                type = result.goodVotes > 0 ? 'good' : 'bad';
            } else {
                // General encouraging message (The Easter Egg/Positive Message)
                const encouragingMessages = [
                    "Great classification! On to the next word.",
                    "Your opinion matters! Keep the ratings coming.",
                    "Another one classified! You're on a roll!",
                    "Making the web a little more organized, one word at a time.",
                ];
                message = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
            }
            
            showEngagementMessage(message, type);
        }

        // Trigger exit animation and load the next word
        startExitAnimation(voteType);

    } catch (e) {
        console.error("API Vote call failed: ", e);
        
        const errorMessage = e.message.includes('Database offline') 
            ? "Vote Failed: Backend/Database Issue."
            : "Vote Failed. Check API connection.";

        showEngagementMessage(errorMessage, "bad");
        
        // Re-enable buttons so the user can try again
        elements.voteGoodButton.disabled = false;
        elements.voteBadButton.disabled = false;
    }
}

/**
 * Starts the slide-out animation for the word card.
 * @param {string} voteType - 'good' or 'bad'.
 */
function startExitAnimation(voteType) {
    const slideClass = voteType === 'good' ? 'slide-out-good' : 'slide-out-bad';
    elements.wordCard.classList.add(slideClass);

    setTimeout(() => {
        elements.wordCard.classList.remove(slideClass);
        fetchNextWord(); // Fetch and load the next word after animation
    }, 400); // Matches the CSS transition duration
}

/**
 * Displays a temporary message above the word card.
 * @param {string} message - The text to display.
 * @param {string} type - 'good', 'bad', or 'neutral' for styling.
 */
function showEngagementMessage(message, type) {
    const box = elements.engagementMessageBox;
    box.textContent = message;
    
    // Reset classes and apply styling
    // Using default Tailwind classes from HTML/CSS structure
    box.className = 'rounded-lg shadow-xl border p-2 px-4 text-sm font-semibold'; 

    if (type === 'good') {
        box.classList.add('bg-green-100', 'text-green-800', 'border-green-300');
    } else if (type === 'bad') {
        box.classList.add('bg-red-100', 'text-red-800', 'border-red-300');
    } else { // neutral/default
        box.classList.add('bg-blue-100', 'text-blue-800', 'border-blue-300');
    }

    // Show the box (using the 'visible' class defined in the inline style)
    box.classList.add('visible');

    // Hide after 3 seconds
    setTimeout(() => {
        box.classList.remove('visible');
    }, 3000);
}

/**
 * Fetches and updates the top rated words every 5 seconds using API calls.
 */
async function fetchAndRenderTopWords() {
    try {
        const response = await retryFetch(`${BASE_URL}/top-words`);
        const topWords = await response.json();

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

    // Render Good List
    elements.mostlyGoodList.innerHTML = goodList.length > 0
        ? goodList.map(w => `
            <li class="flex justify-between items-center px-2 py-1 rounded-lg transition duration-150">
                <span class="font-medium uppercase tracking-wider">${w.word}</span>
                <span class="text-sm font-bold text-green-600">${w.goodPct}%</span>
            </li>
          `).join('')
        : '<li class="text-center italic text-sm">No words currently trending good.</li>';

    // Render Bad List
    elements.mostlyBadList.innerHTML = badList.length > 0
        ? badList.map(w => `
            <li class="flex justify-between items-center px-2 py-1 rounded-lg transition duration-150">
                <span class="font-medium uppercase tracking-wider">${w.word}</span>
                <span class="text-sm font-bold text-red-600">${100 - w.goodPct}%</span>
            </li>
          `).join('')
        : '<li class="text-center italic text-sm">No words currently trending bad.</li>';
}

// --- Event Listeners and Startup ---

function setupEventListeners() {
    elements.voteGoodButton.addEventListener('click', () => handleVote('good'));
    elements.voteBadButton.addEventListener('click', () => handleVote('bad'));
}

/**
 * Starts the application: fetches first word and sets up recurring updates.
 */
function startApp() {
    setupEventListeners();
    fetchNextWord(); // Initial load of the first word
    fetchAndRenderTopWords(); // Initial load of the top list
    
    // Set up recurring update for the top lists (using setInterval for API polls)
    setInterval(fetchAndRenderTopWords, 5000); // Update every 5 seconds
}


// Start the entire process
window.onload = startApp;
