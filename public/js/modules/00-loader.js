(function() {
'use strict';

// --- 1. PREVENT SCROLL JUMP & BOUNCE ---
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

const MODULE_PATH = '/js/modules/';

const MODULES = [
    '01-core.js',
    '02-sound.js', 
    '03-api.js',
    '04-themes.js',
    '05-effects.js',
    '06-ui.js',
    '07-game.js',
    '08-streakmanager.js'
];

// --- LOCATE EXISTING HTML UI ---
const loaderOverlay = document.getElementById('bbc-loader-overlay');
const barContainer = document.getElementById('bbc-bar-container');
const barFill = document.getElementById('bbc-bar-fill');
const statusText = document.getElementById('bbc-status');

// --- TYPING ANIMATION ---
const cmd1 = 'LOAD "GOODWORD/BADWORD"';
const cmd2 = 'RUN';

let currentLine = 1;
let charIndex = 0;
let isTypingDone = false;

function typeLine() {
    const targetId = currentLine === 1 ? 'typewriter-1' : 'typewriter-2';
    const text = currentLine === 1 ? cmd1 : cmd2;
    const el = document.getElementById(targetId);
    
    if (!el) return;

    if (charIndex < text.length) {
        el.textContent += text.charAt(charIndex);
        charIndex++;
        setTimeout(typeLine, 50 + Math.random() * 60);
    } else {
        // Line finished
        if (currentLine === 1) {
            // Move to line 2
            setTimeout(() => {
                document.getElementById('cursor-1').style.display = 'none';
                document.getElementById('line-2').style.display = 'flex';
                currentLine = 2;
                charIndex = 0;
                typeLine();
            }, 400);
        } else {
            // All done
            setTimeout(() => {
                document.getElementById('cursor-2').style.display = 'none';
                if (barContainer) barContainer.style.display = 'block';
                if (statusText) statusText.style.display = 'block';
                isTypingDone = true;
                checkComplete();
            }, 400);
        }
    }
}

// Start typing immediately
setTimeout(typeLine, 500);

// --- LOADING LOGIC ---

let loadedCount = 0;
let modulesFinished = false;
let themeFinished = false;
let dataFinished = false; 

function updateProgress(percent) {
    if (barFill && isTypingDone) {
        barFill.style.width = `${percent}%`;
    }
}

function checkComplete() {
    // Wait for Typing + Scripts + Theme + Data
    if (isTypingDone && modulesFinished && themeFinished && dataFinished) {
        updateProgress(100);
        if (statusText) statusText.textContent = "Found: GOODWORD";
        
        // 1. UNLOCK EVERYTHING BEHIND THE SCENES (Invisible to user)
        // This forces the "jump" to happen now, while the screen is black
        const loaderStyles = document.getElementById('loader-css');
        if (loaderStyles) {
            // We can't just remove it or the black background vanishes instantly.
            // Instead, we manually override the overflow on body/html
            document.documentElement.style.overflow = 'auto';
            document.body.style.overflow = 'auto';
            document.documentElement.style.height = 'auto';
            document.body.style.height = 'auto';
        }
        window.scrollTo(0, 0);

        // 2. Wait for layout to settle (The "Curtain" effect)
        setTimeout(() => {
            // 3. Fade out
            if (loaderOverlay) {
                loaderOverlay.style.opacity = '0';
                
                // 4. Final Cleanup after fade is done
                setTimeout(() => {
                    if (loaderStyles) loaderStyles.remove();
                    loaderOverlay.remove();
                    // Clean manual overrides
                    document.documentElement.style.overflow = '';
                    document.body.style.overflow = '';
                    document.documentElement.style.height = '';
                    document.body.style.height = '';
                    document.documentElement.style.backgroundColor = '';
                    document.body.style.backgroundColor = '';
                }, 600);
            }
        }, 800); // 800ms delay to ensure jump is done
    }
}

// 1. Script Loader
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = MODULE_PATH + src;
        script.onload = () => {
            loadedCount++;
            const percent = Math.floor((loadedCount / MODULES.length) * 70); 
            updateProgress(percent);
            console.log(`[Loader] ${loadedCount}/${MODULES.length} - ${src}`);
            resolve();
        };
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(script);
    });
}

// 2. Theme Listener
window.addEventListener('themeReady', () => {
    console.log('[Loader] Theme signal received.');
    themeFinished = true;
    updateProgress(85);
    checkComplete();
});

// 3. Data Listener (Wait for word content)
const dataCheckInterval = setInterval(() => {
    const wordEl = document.getElementById('wordDisplay');
    // Check if the element exists and text is not the default "Loading..."
    if (wordEl && 
        wordEl.innerText.trim() !== 'Loading...' && 
        wordEl.innerText.trim() !== '') {
        
        console.log('[Loader] Data loaded.');
        clearInterval(dataCheckInterval);
        dataFinished = true;
        updateProgress(95);
        checkComplete();
    }
}, 100);

// Safety Timeout (6s) - Prevents infinite load if something breaks
setTimeout(() => {
    if (!dataFinished || !themeFinished || !modulesFinished) {
        console.warn('[Loader] Timeout. Forcing load.');
        clearInterval(dataCheckInterval);
        dataFinished = true;
        themeFinished = true;
        modulesFinished = true;
        
        if (!isTypingDone) {
            isTypingDone = true;
            if (barContainer) barContainer.style.display = 'block';
        }
        checkComplete();
    }
}, 6000);

async function loadModules() {
    console.log('%c[Loader] Starting module load...', 'color: #8b5cf6; font-weight: bold');
    
    for (const module of MODULES) {
        try {
            await loadScript(module);
        } catch (e) {
            console.error(`[Loader] Failed to load ${module}:`, e);
        }
    }
    
    console.log('%c[Loader] All modules loaded!', 'color: #22c55e; font-weight: bold');
    window.dispatchEvent(new CustomEvent('modulesLoaded'));
    
    modulesFinished = true;
    checkComplete();
}

// Lazy loader export
window.loadMinigames = async function() {
    if (window.MiniGames) return;
    try { await loadScript('09-minigames.js'); } catch (e) {}
};

// Start execution
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadModules);
} else {
    loadModules();
}

})();
