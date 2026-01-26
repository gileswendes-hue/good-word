

(function() {
    'use strict';
    
    // Theme color definitions (must match style.css)
    const THEMES = {
        default: { bg: 'linear-gradient(135deg, #fef2be 0%, #b5def0 100%)' },
        banana: { bg: '#f8f4b2' },
        fire: { bg: '#150500' },
        ocean: { bg: 'linear-gradient(180deg, #0c4a6e 0%, #0369a1 50%, #0ea5e9 100%)' },
        submarine: { bg: 'linear-gradient(135deg, #020c1e 0%, #0a1931 50%, #183a5a 100%)' },
        winter: { bg: 'linear-gradient(135deg, #e0f7fa 0%, #b3e5fc 100%)' },
        summer: { bg: 'linear-gradient(to bottom, #4facfe 0%, #00f2fe 100%)' },
        halloween: { bg: 'linear-gradient(135deg, #000 0%, #3a0000 100%)' },
        space: { bg: 'radial-gradient(circle at center, #1b2735 0%, #090a0f 100%)' },
        ballpit: { bg: 'linear-gradient(135deg, #4ade80 0%, #60a5fa 100%)' },
        woodland: { bg: 'linear-gradient(180deg, #2d5016 0%, #3d6b1e 50%, #1a3409 100%)' },
        flight: { bg: 'linear-gradient(180deg, #0c4a6e 0%, #0369a1 30%, #7dd3fc 100%)' },
        plymouth: { bg: 'linear-gradient(to bottom, #0a192f 0%, #1c3a5e 50%, #d97b45 90%, #000000 100%)' },
        rainbow: { bg: '#f7f7f7' },
        dark: { bg: '#121212' }
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
