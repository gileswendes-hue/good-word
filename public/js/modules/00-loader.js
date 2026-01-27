(function() {
'use strict';

const MODULE_PATH = '/js/modules/';
const CACHE_VERSION = '2.6'; // Increment this to bust cache!

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

let loadedCount = 0;

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = MODULE_PATH + src + '?v=' + CACHE_VERSION;
        script.onload = () => {
            loadedCount++;
            console.log(`[Loader] ${loadedCount}/${MODULES.length} - ${src}`);
            resolve();
        };
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(script);
    });
}

async function loadModules() {
    console.log('%c[Loader] Starting module load... (v' + CACHE_VERSION + ')', 'color: #8b5cf6; font-weight: bold');
    
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
