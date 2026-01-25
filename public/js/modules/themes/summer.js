/**
 * ============================================================================
 * SUMMER THEME EFFECT
 * ============================================================================
 * Grass and floating clouds
 */

(function() {
'use strict';

Effects.summer = function() {
    const c = DOM.theme.effects.summer;
    c.innerHTML = '';
    
    // Grass
    const g = document.createElement('div');
    g.className = 'summer-grass';
    c.appendChild(g);
    
    // Clouds
    for (let i = 0; i < 8; i++) {
        const d = document.createElement('div');
        d.className = `summer-cloud v${Math.floor(Math.random() * 3) + 1}`;
        const w = Math.random() * 100 + 100;
        d.style.width = `${w}px`;
        d.style.height = `${w * 0.35}px`;
        d.style.top = `${Math.random() * 60}%`;
        d.style.animationDuration = `${Math.random() * 60 + 60}s`;
        d.style.animationDelay = `-${Math.random() * 100}s`;
        c.appendChild(d);
    }
};

console.log('%c[Theme: Summer] Loaded', 'color: #f59e0b');

})();
