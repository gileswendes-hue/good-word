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

// --- 1. INJECT LOADER UI (The "Immediate" Part) ---
function injectLoader() {
    // Check if already exists
    if (document.getElementById('retro-loader-overlay')) return;

    // 1. Inject CSS
    const style = document.createElement('style');
    style.id = 'loader-styles';
    style.innerHTML = `
        #retro-loader-overlay {
            position: fixed; inset: 0; z-index: 2147483647;
            background-color: #0d1117;
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            font-family: 'Courier New', Courier, monospace;
            transition: opacity 0.5s ease-out;
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
    document.head.appendChild(style);

    // 2. Inject HTML
    const div = document.createElement('div');
    div.id = 'retro-loader-overlay';
    div.innerHTML = `
        <div class="scanline"></div>
        <div class="loader-content">
            <div class="loader-title">INITIALIZING</div>
            <div class="loader-bar-box"><div class="loader-bar-fill" id="loader-fill"></div></div>
            <div class="loader-status" id="loader-text">Loading Core...</div>
        </div>
    `;
    
    // Prepend ensures it sits on top of everything else in the body
    if (document.body) {
        document.body.prepend(div);
    } else {
        document.addEventListener('DOMContentLoaded', () => document.body.prepend(div));
    }
}

injectLoader();

// --- 2. LOADING LOGIC ---

let loadedCount = 0;
let modulesFinished = false;
let themeFinished = false;

function updateProgress(percent, statusText) {
    const fill = document.getElementById('loader-fill');
    const text = document.getElementById('loader-text');
    if (fill) fill.style.width = `${percent}%`;
    if (text && statusText) text.innerText = statusText;
}

function checkComplete() {
    if (modulesFinished && themeFinished) {
        updateProgress(100, "SYSTEM READY");
        
        setTimeout(() => {
            const overlay = document.getElementById('retro-loader-overlay');
            if (overlay) {
                // Fade out loader
                overlay.style.opacity = '0';
                
                // Reveal the App (undoing the anti-flash css from index.html)
                const app = document.getElementById('app');
                if (app) app.style.opacity = '1';
                
                // Remove the anti-flash style block entirely
                const antiFlash = document.getElementById('anti-flash-style');
                if (antiFlash) antiFlash.remove();

                setTimeout(() => overlay.remove(), 500);
            }
        }, 400);
    }
}

// Listen for Smart Loader's signal
window.addEventListener('themeReady', () => {
    themeFinished = true;
    checkComplete();
});

// Fallback safety
setTimeout(() => {
    if (!themeFinished) {
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
            const percent = Math.floor((loadedCount / MODULES.length) * 85);
            updateProgress(percent, `Loaded ${src.split('-')[1] || 'Module'}...`);
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
