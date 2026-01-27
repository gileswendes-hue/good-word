/**
 * ============================================================================
 * SMART THEMES LOADER
 * ============================================================================
 * Loads effects base + active theme first, then lazy-loads others
 * This ensures fast initial load while keeping all themes available
 */

(function() {
'use strict';

const THEME_PATH = '/js/modules/themes/';
const CACHE_VERSION = '2.5'; // Increment this to bust cache!

// Map theme names to their effect files
const THEME_MAP = {
    'default': null,  // No special effect
    'banana': null,
    'fire': 'fire.js',
    'ocean': 'ocean.js',
    'submarine': 'submarine.js',
    'winter': 'winter.js',
    'summer': 'summer.js',
    'halloween': 'halloween.js',
    'space': 'space.js',
    'ballpit': 'ballpit.js',
    'woodland': 'woodland.js',
    'flight': 'flight.js',
    'plymouth': 'plymouth.js'
};

const ALL_THEME_FILES = [
    'ballpit.js',
    'fire.js',
    'flight.js',
    'halloween.js',
    'ocean.js',
    'plymouth.js',
    'space.js',
    'submarine.js',
    'summer.js',
    'winter.js',
    'woodland.js'
];

const loadedThemes = new Set();

function loadScript(filename) {
    return new Promise((resolve, reject) => {
        if (loadedThemes.has(filename)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = THEME_PATH + filename + '?v=' + CACHE_VERSION;
        script.onload = () => {
            loadedThemes.add(filename);
            resolve();
        };
        script.onerror = () => reject(new Error(`Failed to load ${filename}`));
        document.head.appendChild(script);
    });
}

async function loadThemesSmartly() {
    console.log('%c[Themes] Smart loading... (v' + CACHE_VERSION + ')', 'color: #ec4899; font-weight: bold');
    
    // 1. Always load base first
    await loadScript('00-effects-base.js');
    
    // 2. Get current theme
    let currentTheme = window.__INSTANT_THEME__ || 'default';
    try {
        const saved = localStorage.getItem('gw_settings');
        if (saved) {
            const settings = JSON.parse(saved);
            currentTheme = settings.theme || 'default';
        }
    } catch (e) {}
    
    // 3. Load current theme's effect immediately
    const currentFile = THEME_MAP[currentTheme];
    if (currentFile) {
        await loadScript(currentFile);
        console.log(`%c[Themes] Active theme loaded: ${currentTheme}`, 'color: #22c55e');
    }
    
    // 4. Signal that primary theme is ready
    window.dispatchEvent(new Event('themeReady'));
    
    // 5. Lazy load remaining themes after a delay (or on idle)
    const loadRest = async () => {
        for (const file of ALL_THEME_FILES) {
            if (!loadedThemes.has(file)) {
                await loadScript(file);
            }
        }
        console.log('%c[Themes] All themes loaded!', 'color: #ec4899');
        window.dispatchEvent(new Event('allThemesLoaded'));
    };
    
    // Use requestIdleCallback if available, otherwise setTimeout
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => loadRest(), { timeout: 3000 });
    } else {
        setTimeout(loadRest, 1000);
    }
}

// Export for manual theme loading (when user switches themes)
window.loadThemeEffect = async function(themeName) {
    const file = THEME_MAP[themeName];
    if (file && !loadedThemes.has(file)) {
        await loadScript(file);
    }
};

// Start loading
loadThemesSmartly();

})();
