(function() {
'use strict';

// --- 1. PREVENT SCROLL JUMP & BOUNCE ---
// Force browser to start at top (0,0) and ignore previous scroll position
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
const typeWriterEl = document.getElementById('bbc-typewriter');
const barContainer = document.getElementById('bbc-bar-container');
const barFill = document.getElementById('bbc-bar-fill');
const statusText = document.getElementById('bbc-status');

// --- TYPING ANIMATION ---
const command = 'LOAD "GOODWORD/BADWORD"';
let charIndex = 0;
let isTypingDone = false;

function typeCommand() {
    if (!typeWriterEl) return;
    if (charIndex < command.length) {
        typeWriterEl.textContent += command.charAt(charIndex);
        charIndex++;
        // Random typing delay for realism
        setTimeout(typeCommand, 50 + Math.random() * 80);
    } else {
        // Typing finished
        setTimeout(() => {
            const cursor = document.querySelector('.bbc-cursor');
            if(cursor) cursor.style.display = 'none';
            
            if (barContainer) barContainer.style.display = 'block';
            if (statusText) statusText.style.display = 'block';
            
            isTypingDone = true;
            checkComplete();
        }, 600);
    }
}

// Start typing immediately
setTimeout(typeCommand, 500);

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
        
        setTimeout(() => {
            // --- CRITICAL SCROLL UNLOCK ---
            
            // 1. Remove the blocking CSS styles
            const loaderStyles = document.getElementById('loader-css');
            if (loaderStyles) loaderStyles.remove();
            
            // 2. Force reset body/html styles to allow scrolling
            document.documentElement.style.overflow = 'auto';
            document.body.style.overflow = 'auto';
            document.documentElement.style.height = 'auto';
            document.body.style.height = 'auto';
            document.documentElement.style.backgroundColor = '';
            document.body.style.backgroundColor = '';
            
            // 3. Ensure we start at the top
            window.scrollTo(0, 0);

            // 4. Fade out loader
            if (loaderOverlay) {
                loaderOverlay.style.opacity = '0';
                setTimeout(() => loaderOverlay.remove(), 600);
            }
        }, 1200); // Short pause to read success message
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
