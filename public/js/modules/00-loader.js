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
// Since the UI is hardcoded in index.html for zero-flash, we just find it.
const fillEl = document.getElementById('loader-fill');
const textEl = document.getElementById('loader-text');
const loaderHTML = document.getElementById('retro-loader-overlay');

// --- LOADING LOGIC ---

let loadedCount = 0;
let modulesFinished = false;
let themeFinished = false;

function updateProgress(percent, statusText) {
    if (fillEl) fillEl.style.width = `${percent}%`;
    if (textEl && statusText) textEl.innerText = statusText;
}

function checkComplete() {
    // Only fade out when everything is loaded AND the theme is applied
    if (modulesFinished && themeFinished) {
        updateProgress(100, "SYSTEM READY");
        setTimeout(() => {
            if (loaderHTML) {
                loaderHTML.style.opacity = '0';
                
                // Allow scrolling again
                document.documentElement.style.overflow = '';
                document.body.style.overflow = '';
                
                // Revert the background color hack on html/body so themes can take over
                document.documentElement.style.backgroundColor = '';
                document.body.style.backgroundColor = '';
                
                setTimeout(() => loaderHTML.remove(), 800);
            }
        }, 300); // Short pause at 100%
    }
}

// Listen for Smart Loader's signal
window.addEventListener('themeReady', () => {
    console.log('[Loader] Theme signal received.');
    themeFinished = true;
    checkComplete();
});

// Fallback: If smart-loader isn't used or fails to fire, force finish after timeout
setTimeout(() => {
    if (!themeFinished) {
        console.warn('[Loader] No theme signal. Forcing load.');
        themeFinished = true;
        checkComplete();
    }
}, 4000);

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = MODULE_PATH + src;
        script.onload = () => {
            loadedCount++;
            const percent = Math.floor((loadedCount / MODULES.length) * 85); // Save last 15% for theme
            updateProgress(percent, `Loaded ${src.split('-')[1] || 'Module'}...`);
            console.log(`[Loader] ${loadedCount}/${MODULES.length} - ${src}`);
            resolve();
        };
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(script);
    });
}

async function loadModules() {
    console.log('%c[Loader] Starting module load...', 'color: #8b5cf6; font-weight: bold');
    
    for (const module of MODULES) {
        try {
            await loadScript(module);
        } catch (e) {
            console.error(`[Loader] Failed to load ${module}:`, e);
            // Continue loading other modules
        }
    }
    
    console.log('%c[Loader] All modules loaded!', 'color: #22c55e; font-weight: bold');
    
    // Dispatch event for game initialization
    window.dispatchEvent(new CustomEvent('modulesLoaded'));
    
    modulesFinished = true;
    checkComplete();
}

// Lazy loader for minigames
window.loadMinigames = async function() {
    if (window.MiniGames) return;
    try {
        await loadScript('09-minigames.js');
    } catch (e) {
        console.error('[Loader] Failed to load minigames:', e);
    }
};

// Start loading
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadModules);
} else {
    loadModules();
}

})();
