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
    // 09-minigames.js is lazy loaded
];

// --- 1. RETRO LOADER UI SETUP ---
// We inject this immediately to cover the "theme correction" flash
const loaderStyle = document.createElement('style');
loaderStyle.innerHTML = `
    #retro-loader-overlay {
        position: fixed; inset: 0; z-index: 10000;
        background-color: #0d1117;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        font-family: 'Courier New', Courier, monospace;
        transition: opacity 0.6s ease-out;
        cursor: wait;
    }
    .loader-content { width: 300px; max-width: 80%; }
    .loader-title {
        color: #4ade80; font-size: 24px; font-weight: bold;
        text-align: center; margin-bottom: 15px;
        text-shadow: 0 0 8px rgba(74, 222, 128, 0.4);
        letter-spacing: 2px;
    }
    .loader-bar-box {
        width: 100%; height: 24px;
        border: 3px solid #4ade80;
        padding: 3px;
        box-shadow: 0 0 10px rgba(74, 222, 128, 0.2);
    }
    .loader-bar-fill {
        height: 100%; width: 0%;
        background-color: #4ade80;
        transition: width 0.2s linear;
        box-shadow: inset 0 0 5px rgba(0,0,0,0.3);
    }
    .loader-status {
        color: #86efac; font-size: 12px; margin-top: 10px;
        text-align: right; height: 16px;
    }
    .scanline {
        position: absolute; inset: 0; pointer-events: none;
        background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2));
        background-size: 100% 4px;
        opacity: 0.15;
    }
`;
document.head.appendChild(loaderStyle);

const loaderHTML = document.createElement('div');
loaderHTML.id = 'retro-loader-overlay';
loaderHTML.innerHTML = `
    <div class="scanline"></div>
    <div class="loader-content">
        <div class="loader-title">LOADING</div>
        <div class="loader-bar-box"><div class="loader-bar-fill" id="loader-fill"></div></div>
        <div class="loader-status" id="loader-text">Loading Core...</div>
    </div>
`;
document.body.appendChild(loaderHTML);

const fillEl = document.getElementById('loader-fill');
const textEl = document.getElementById('loader-text');

// --- 2. LOADING LOGIC ---

let loadedCount = 0;
// We wait for both modules AND the theme to be ready
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
                setTimeout(() => loaderHTML.remove(), 600);
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

// Start loading when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadModules);
} else {
    loadModules();
}

})();
