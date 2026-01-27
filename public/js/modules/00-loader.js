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
const fillEl = document.getElementById('loader-fill');
const textEl = document.getElementById('loader-text');
const loaderHTML = document.getElementById('retro-loader-overlay');

// --- LOADING LOGIC ---

let loadedCount = 0;
let modulesFinished = false;
let themeFinished = false;
let dataFinished = false; // New flag for Words

function updateProgress(percent, statusText) {
    if (fillEl) fillEl.style.width = `${percent}%`;
    if (textEl && statusText) textEl.innerText = statusText;
}

function checkComplete() {
    // Now waits for MODULES + THEME + DATA (Words)
    if (modulesFinished && themeFinished && dataFinished) {
        updateProgress(100, "SYSTEM READY");
        
        setTimeout(() => {
            if (loaderHTML) {
                loaderHTML.style.opacity = '0';
                
                // Unlock scrolling
                document.documentElement.style.overflow = '';
                document.body.style.overflow = '';
                
                // Revert background hacks
                document.documentElement.style.backgroundColor = '';
                document.body.style.backgroundColor = '';
                
                setTimeout(() => loaderHTML.remove(), 800);
            }
        }, 300);
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
            updateProgress(percent, `Loaded ${src.split('-')[1] || 'Module'}...`);
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
    updateProgress(85, "Applying Theme...");
    checkComplete();
});

// 3. Listen for Data (The Fix)
// We poll the DOM to see when 'Loading...' disappears
const dataCheckInterval = setInterval(() => {
    const wordEl = document.getElementById('wordDisplay');
    const displayStat = document.getElementById('wordDisplay');
    
    // Check if element exists and text has changed from default
    if (wordEl && 
        wordEl.innerText.trim() !== 'Loading...' && 
        wordEl.innerText.trim() !== '') {
            
        console.log('[Loader] Data loaded.');
        clearInterval(dataCheckInterval);
        dataFinished = true;
        updateProgress(95, "Finalizing...");
        checkComplete();
    }
}, 100);

// Safety Timeout (5s): If data never loads, don't trap the user forever
setTimeout(() => {
    if (!dataFinished) {
        console.warn('[Loader] Data wait timed out. Force revealing.');
        clearInterval(dataCheckInterval);
        dataFinished = true;
        checkComplete();
    }
    // Also force theme if it missed the signal
    if (!themeFinished) {
        themeFinished = true;
        checkComplete();
    }
}, 5000);

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
