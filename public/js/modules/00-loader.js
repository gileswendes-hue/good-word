(function() {
'use strict';

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
        // Type speed variation for realism
        setTimeout(typeCommand, 50 + Math.random() * 80);
    } else {
        // Typing finished -> Simulate Enter -> Show loading bar
        setTimeout(() => {
            // Remove cursor from line
            const cursor = document.querySelector('.bbc-cursor');
            if(cursor) cursor.style.display = 'none';
            
            // Show bar and status
            if (barContainer) barContainer.style.display = 'block';
            if (statusText) statusText.style.display = 'block';
            isTypingDone = true;
            
            // Check if we were already waiting for animation to finish
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
let dataFinished = false; // New flag for Words

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
            // SCROLLING FIX: Reset global styles
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            document.documentElement.style.backgroundColor = '';
            document.body.style.backgroundColor = '';
            document.body.style.height = '';
            
            // Ensure we are at top
            window.scrollTo(0, 0);

            if (loaderOverlay) {
                loaderOverlay.style.opacity = '0';
                setTimeout(() => loaderOverlay.remove(), 600);
            }
        }, 1200); // Pause to read "Found: GOODWORD"
    }
}

// 1. Listen for Scripts
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = MODULE_PATH + src;
        script.onload = () => {
            loadedCount++;
            // Calculate percentage, leaving room for theme/data steps
            const percent = Math.floor((loadedCount / MODULES.length) * 70); 
            updateProgress(percent);
            console.log(`[Loader] ${loadedCount}/${MODULES.length} - ${src}`);
            resolve();
        };
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(script);
    });
}

// 2. Listen for Theme
window.addEventListener('themeReady', () => {
    console.log('[Loader] Theme signal received.');
    themeFinished = true;
    updateProgress(85);
    checkComplete();
});

// 3. Listen for Data (Polling #wordDisplay)
const dataCheckInterval = setInterval(() => {
    const wordEl = document.getElementById('wordDisplay');
    
    // Check if element text has changed from default
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

// Safety Timeout (6s)
setTimeout(() => {
    // If stuck, force finish
    if (!dataFinished || !themeFinished || !modulesFinished) {
        console.warn('[Loader] Timeout. Forcing load.');
        clearInterval(dataCheckInterval);
        dataFinished = true;
        themeFinished = true;
        modulesFinished = true;
        // If typing isn't done, rush it
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

window.loadMinigames = async function() {
    if (window.MiniGames) return;
    try { await loadScript('09-minigames.js'); } catch (e) {}
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadModules);
} else {
    loadModules();
}

})();
