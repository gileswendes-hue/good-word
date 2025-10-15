// --- Element Initialization ---
const wordDisplay = document.getElementById('wordDisplay');
const goodWordBtn = document.getElementById('goodWordBtn');
const badWordBtn = document.getElementById('badWordBtn');
const wordBox = document.getElementById('wordBox'); // The main card element
const messageDisplay = document.getElementById('messageDisplay');
const mostlyGoodList = document.getElementById('mostlyGoodList');
const mostlyBadList = document.getElementById('mostlyBadList');

let currentWordId = null;
let retryTimer = null; // Timer for connection retries

// --- Utility Functions ---

/**
 * Displays a temporary status message to the user.
 * @param {string} message The text to display.
 * @param {string} type 'success', 'error', or 'info' to determine styling.
 */
function showMessage(message, type) {
    messageDisplay.textContent = message;
    messageDisplay.classList.remove('hidden', 'bg-good', 'bg-bad', 'bg-neutral', 'text-white', 'text-red-800', 'text-green-800');

    let bgColorClass, textColorClass;

    switch (type) {
        case 'success':
            // Using Tailwind classes for success based on the config
            bgColorClass = 'bg-good';
            textColorClass = 'text-white';
            break;
        case 'error':
            // Using a light red background for error messages (DB OFFLINE)
            bgColorClass = 'bg-red-200';
            textColorClass = 'text-red-800';
            break;
        case 'info':
        default:
            // Using neutral/warning color
            bgColorClass = 'bg-neutral';
            textColorClass = 'text-white';
            break;
    }

    // Set classes for background and text color
    messageDisplay.classList.add(bgColorClass, textColorClass);
    // Show the message
    messageDisplay.style.opacity = '1';

    // Do not auto-hide critical errors like "DB OFFLINE"
    if (message.includes("DB OFFLINE")) {
        return;
    }

    // Auto-hide the message after 3 seconds for transient messages
    setTimeout(() => {
        messageDisplay.style.opacity = '0';
        // After transition, hide it completely
        setTimeout(() => {
            messageDisplay.classList.add('hidden');
        }, 500); 
    }, 3000);
}

/**
 * Sets the word box border color.
 * @param {string} type 'neutral', 'good', or 'bad'.
 */
function setWordBoxBorder(type) {
    wordBox.classList.remove('neutral-border', 'good-border', 'bad-border');
    wordBox.classList.add(`${type}-border`);
}

/**
 * Enables or disables the voting buttons.
 * @param {boolean} enable True to enable, false to disable.
 */
function toggleButtons(enable) {
    goodWordBtn.disabled = !enable;
    badWordBtn.disabled = !enable;
}

// --- API Interaction ---

/**
 * Clears any active retry timers.
 */
function clearRetry() {
    if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = null;
    }
    // Clear any persistent error message from the display
    messageDisplay.classList.add('hidden');
}


/**
 * Fetches the next word to classify from the API.
 */
async function fetchNextWord() {
    clearRetry(); // Clear any existing retry timer

    // Disable buttons and show loading state
    toggleButtons(false);
    wordDisplay.textContent = "LOADING...";
    setWordBoxBorder('neutral');

    try {
        const response = await fetch('/api/get-word');

        if (!response.ok) {
            // Throw an error if the HTTP status is not 2xx
            const errorText = await response.text();
            throw new Error(`API Error (${response.status}): ${errorText || 'Failed to fetch word.'}`);
        }

        const data = await response.json();
        
        if (data.word) {
            currentWordId = data._id;
            wordDisplay.textContent = data.word.toUpperCase();
            setWordBoxBorder('neutral');
            toggleButtons(true);
            showMessage("New word loaded!", 'success');
        } else if (data.message && data.message.includes("No words left")) {
            wordDisplay.textContent = "ALL WORDS CLASSIFIED!";
            showMessage("You have classified all available words.", 'info');
        } else {
            throw new Error("Invalid response structure from API.");
        }
        
    } catch (error) {
        console.error("Fetch Word Error:", error.message);
        
        // Show persistent error message and set retry timer
        wordDisplay.textContent = "API OFFLINE";
        showMessage("DB OFFLINE. Retrying in 5s...", 'error');
        
        // Retry logic: try again after 5 seconds
        retryTimer = setTimeout(fetchNextWord, 5000); 
    }
}

/**
 * Sends the classification vote to the API.
 * @param {string} sentiment 'good' or 'bad'.
 */
async function sendVote(sentiment) {
    if (!currentWordId) return;

    // Temporarily disable buttons and show vote transition
    toggleButtons(false);
    
    // Set border and message immediately based on vote
    setWordBoxBorder(sentiment);
    showMessage(`Voted ${sentiment.toUpperCase()}!`, sentiment === 'good' ? 'success' : 'error');

    try {
        const response = await fetch('/api/vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wordId: currentWordId, sentiment })
        });

        if (!response.ok) {
            throw new Error(`API Error (${response.status}) on vote.`);
        }

        // Vote successful, fetch the next word and update leaderboards
        fetchNextWord();
        fetchTopWords();

    } catch (error) {
        console.error("Vote Error:", error.message);
        showMessage("Error submitting vote. Check API.", 'error');
        
        // Re-enable buttons to allow user to retry if the error is temporary
        toggleButtons(true);
        setWordBoxBorder('neutral');
    }
}

/**
 * Fetches the top words list.
 */
async function fetchTopWords() {
    try {
        const response = await fetch('/api/top-words');
        if (!response.ok) {
            throw new Error(`API Error (${response.status}) on top words.`);
        }
        const data = await response.json();

        // Clear existing lists
        mostlyGoodList.innerHTML = '';
        mostlyBadList.innerHTML = '';

        // Populate Mostly Good List
        if (data.mostlyGood && data.mostlyGood.length > 0) {
            data.mostlyGood.forEach(item => {
                const li = document.createElement('li');
                // Note: The percentage style uses CSS variables defined in public/style.css
                li.innerHTML = `
                    <span>${item.word.toUpperCase()}</span>
                    <span class="percentage" style="color: var(--good-color);">${item.goodPercent}%</span>
                `;
                mostlyGoodList.appendChild(li);
            });
        } else {
            mostlyGoodList.innerHTML = '<li class="text-center italic text-sm text-gray-500">No data yet.</li>';
        }

        // Populate Mostly Bad List
        if (data.mostlyBad && data.mostlyBad.length > 0) {
            data.mostlyBad.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${item.word.toUpperCase()}</span>
                    <span class="percentage" style="color: var(--bad-color);">${item.badPercent}%</span>
                `;
                mostlyBadList.appendChild(li);
            });
        } else {
            mostlyBadList.innerHTML = '<li class="text-center italic text-sm text-gray-500">No data yet.</li>';
        }

    } catch (error) {
        console.error("Fetch Top Words Error:", error.message);
        mostlyGoodList.innerHTML = '<li class="text-center italic text-sm text-red-500">API Error loading list.</li>';
        mostlyBadList.innerHTML = '<li class="text-center italic text-sm text-red-500">API Error loading list.</li>';
    }
}


// --- Event Listeners and Initialization ---

window.onload = () => {
    // Attach vote handlers
    goodWordBtn.addEventListener('click', () => sendVote('good'));
    badWordBtn.addEventListener('click', () => sendVote('bad'));
    
    // Initial fetch of word and top words list
    fetchNextWord();
    fetchTopWords();

    // Set an interval to refresh the top words list every 10 seconds
    setInterval(fetchTopWords, 10000); 
};
