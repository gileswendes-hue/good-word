/**
 * ============================================================================
 * FIRE THEME EFFECT
 * ============================================================================
 * Animated fire particles with smoke
 */

(function() {
'use strict';

Effects.fire = function() {
    const c = DOM.theme.effects.fire;
    c.innerHTML = '';
    
    // Fire particles
    for (let i = 0; i < 80; i++) {
        const p = document.createElement('div');
        p.className = 'fire-particle';
        p.style.animationDuration = `${Math.random() * 1.5 + 0.5}s`;
        p.style.animationDelay = `${Math.random()}s`;
        p.style.left = `calc(10% + (80% * ${Math.random()}))`;
        const size = Math.random() * 3 + 2;
        p.style.width = p.style.height = `${size}em`;
        p.style.setProperty('--sway', `${(Math.random() - 0.5) * 20}px`);
        c.appendChild(p);
    }
    
    // Smoke particles
    for (let i = 0; i < 15; i++) {
        const s = document.createElement('div');
        s.className = 'smoke-particle';
        s.style.animationDelay = `${Math.random() * 3}s`;
        s.style.left = `${Math.random() * 90 + 5}%`;
        s.style.setProperty('--sway', `${(Math.random() - 0.5) * 150}px`);
        c.appendChild(s);
    }
};

console.log('%c[Theme: Fire] Loaded', 'color: #ef4444');

})();
