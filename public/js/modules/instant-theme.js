/**
 * ============================================================================
 * INSTANT THEME LOADER
 * ============================================================================
 * Place this in <head> BEFORE any other scripts for instant theme application
 * This applies the saved theme's colors/background immediately, eliminating flash
 * 
 * Usage: <script src="/js/modules/instant-theme.js"></script>
 */

(function() {
    'use strict';
    
    // Theme color definitions (must match ThemeManager)
    const THEMES = {
        default: { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
        banana: { bg: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
        fire: { bg: '#150500' },
        ocean: { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
        submarine: { bg: 'linear-gradient(180deg, #0077b6 0%, #023e8a 50%, #001845 100%)' },
        winter: { bg: 'linear-gradient(180deg, #e0f7ff 0%, #87ceeb 30%, #b0e0e6 100%)' },
        summer: { bg: 'linear-gradient(180deg, #87CEEB 0%, #98d4ee 50%, #7ec8e3 100%)' },
        halloween: { bg: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)' },
        space: { bg: 'linear-gradient(180deg, #0a0a1a 0%, #1a1a3a 50%, #0d0d2b 100%)' },
        ballpit: { bg: 'linear-gradient(180deg, #fef3c7 0%, #fde68a 100%)' },
        woodland: { bg: 'linear-gradient(180deg, #2d5016 0%, #3d6b1e 50%, #1a3409 100%)' },
        flight: { bg: 'linear-gradient(180deg, #1e3a5f 0%, #2d5a87 30%, #87ceeb 100%)' },
        plymouth: { bg: 'linear-gradient(180deg, #0a0a1a 0%, #1a1a3a 100%)' }
    };
    
    try {
        // Get saved theme from localStorage
        const saved = localStorage.getItem('gw_settings');
        let theme = 'default';
        
        if (saved) {
            const settings = JSON.parse(saved);
            theme = settings.theme || 'default';
        }
        
        const themeData = THEMES[theme] || THEMES.default;
        
        // Apply background immediately
        document.documentElement.style.cssText = `
            background: ${themeData.bg};
            min-height: 100vh;
        `;
        
        // Also set body background in case it loads before our CSS
        if (document.body) {
            document.body.style.background = themeData.bg;
        } else {
            // Body not ready yet, use mutation observer or DOMContentLoaded
            document.addEventListener('DOMContentLoaded', () => {
                document.body.style.background = themeData.bg;
            }, { once: true });
        }
        
        // Store theme name for later use
        window.__INSTANT_THEME__ = theme;
        
    } catch (e) {
        // Fail silently - theme will load normally
        console.warn('[InstantTheme] Could not apply instant theme:', e);
    }
})();
