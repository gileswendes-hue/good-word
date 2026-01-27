/**
 * ============================================================================
 * FIRE THEME EFFECT
 * ============================================================================
 * Animated fire particles with smoke, floating embers, and heat distortion
 */

(function() {
'use strict';

Effects.fire = function() { 
    const c = DOM.theme.effects.fire; 
    c.innerHTML = ''; 
    
    // Add heat distortion and animation styles
    if (!document.getElementById('fire-heat-style')) {
        const style = document.createElement('style');
        style.id = 'fire-heat-style';
        style.textContent = `
            @keyframes heat-shimmer {
                0%, 100% { transform: translateY(0) scaleY(1); }
                25% { transform: translateY(-2px) scaleY(1.01); }
                50% { transform: translateY(0) scaleY(0.99); }
                75% { transform: translateY(2px) scaleY(1.01); }
            }
            @keyframes ember-float {
                0% { transform: translateY(0) translateX(0) scale(1); opacity: 1; }
                50% { transform: translateY(-30vh) translateX(var(--ember-sway)) scale(0.8); opacity: 0.8; }
                100% { transform: translateY(-60vh) translateX(calc(var(--ember-sway) * -0.5)) scale(0.3); opacity: 0; }
            }
            @keyframes flame-dance {
                0%, 100% { transform: scaleX(1) scaleY(1) translateY(0); }
                25% { transform: scaleX(0.95) scaleY(1.05) translateY(-5px); }
                50% { transform: scaleX(1.05) scaleY(0.95) translateY(0); }
                75% { transform: scaleX(0.98) scaleY(1.02) translateY(-3px); }
            }
            .fire-base {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 30vh;
                background: linear-gradient(to top, 
                    rgba(255, 100, 0, 0.9) 0%, 
                    rgba(255, 150, 0, 0.7) 30%, 
                    rgba(255, 200, 0, 0.4) 60%, 
                    transparent 100%);
                filter: blur(20px);
                animation: flame-dance 0.5s ease-in-out infinite;
                pointer-events: none;
            }
            .ember-particle {
                position: absolute;
                width: 4px;
                height: 4px;
                background: radial-gradient(circle, #ffff00 0%, #ff6600 50%, #ff0000 100%);
                border-radius: 50%;
                box-shadow: 0 0 6px #ff6600, 0 0 12px #ff3300;
                animation: ember-float linear infinite;
                pointer-events: none;
            }
            .fire-glow {
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 120%;
                height: 50vh;
                background: radial-gradient(ellipse at bottom center, 
                    rgba(255, 100, 0, 0.4) 0%, 
                    rgba(255, 50, 0, 0.2) 40%, 
                    transparent 70%);
                pointer-events: none;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Base fire glow
    const glow = document.createElement('div');
    glow.className = 'fire-glow';
    c.appendChild(glow);
    
    // Fire base layer
    const base = document.createElement('div');
    base.className = 'fire-base';
    c.appendChild(base);
    
    // Main fire particles (larger, more varied)
    for (let i = 0; i < 60; i++) { 
        const p = document.createElement('div'); 
        p.className = 'fire-particle'; 
        const duration = Math.random() * 1.2 + 0.4;
        p.style.animationDuration = `${duration}s`; 
        p.style.animationDelay = `${Math.random() * duration}s`; 
        // Concentrate flames more toward center
        const xPos = 50 + (Math.random() - 0.5) * 70;
        p.style.left = `${xPos}%`; 
        const size = Math.random() * 4 + 1.5; 
        p.style.width = p.style.height = `${size}em`; 
        p.style.setProperty('--sway', `${(Math.random()-.5) * 30}px`); 
        c.appendChild(p);
    }
    
    // Add floating embers
    for (let i = 0; i < 25; i++) {
        const ember = document.createElement('div');
        ember.className = 'ember-particle';
        ember.style.left = `${Math.random() * 80 + 10}%`;
        ember.style.bottom = `${Math.random() * 20}%`;
        ember.style.animationDuration = `${Math.random() * 3 + 2}s`;
        ember.style.animationDelay = `${Math.random() * 4}s`;
        ember.style.setProperty('--ember-sway', `${(Math.random() - 0.5) * 100}px`);
        const size = Math.random() * 4 + 2;
        ember.style.width = ember.style.height = `${size}px`;
        c.appendChild(ember);
    }
    
    // Smoke particles (darker, more realistic)
    for (let i = 0; i < 12; i++) { 
        const s = document.createElement('div'); 
        s.className = 'smoke-particle'; 
        s.style.animationDelay = `${Math.random() * 4}s`; 
        s.style.left = `${Math.random() * 60 + 20}%`; 
        s.style.setProperty('--sway', `${(Math.random()-.5) * 200}px`);
        s.style.opacity = Math.random() * 0.3 + 0.2;
        c.appendChild(s);
    }
};

console.log('%c[Theme: Fire] Loaded', 'color: #ef4444');

})();
