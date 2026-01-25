/**
 * ============================================================================
 * WINTER/SNOW THEME EFFECT
 * ============================================================================
 * Falling snow with collectible snowmen that build SnowmanBuilder progress
 */

(function() {
'use strict';

Effects.snow = function() {
    const c = DOM.theme.effects.snow;
    c.innerHTML = '';
    
    // Create snow particles
    for (let i = 0; i < 60; i++) {
        const f = document.createElement('div');
        f.className = 'snow-particle';
        const s = Math.random() * 12 + 5;
        f.style.width = f.style.height = `${s}px`;
        f.style.opacity = Math.random() * 0.6 + 0.3;
        if (s < 4) f.style.filter = `blur(${Math.random() * 2}px)`;
        f.style.left = `${Math.random() * 100}vw`;
        f.style.setProperty('--sway', `${(Math.random() - 0.5) * 100}px`);
        f.style.animationDuration = `${Math.random() * 15 + 8}s`;
        f.style.animationDelay = `-${Math.random() * 15}s`;
        c.appendChild(f);
    }
    
    // Snowman spawner
    if (Effects.snowmanTimeout) clearTimeout(Effects.snowmanTimeout);
    
    const spawnSnowman = () => {
        if (State.runtime.currentTheme !== 'winter') return;
        
        const sm = document.createElement('div');
        sm.className = 'snow-particle';
        sm.textContent = '⛄';
        
        Object.assign(sm.style, {
            position: 'absolute',
            fontSize: '2.5rem',
            width: 'auto',
            height: 'auto',
            opacity: '1',
            left: `${Math.random() * 85 + 5}vw`,
            top: '-15vh',
            filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))',
            cursor: 'pointer',
            zIndex: '101',
            pointerEvents: 'auto',
            animation: 'none',
            transition: 'top 8s linear, transform 8s ease-in-out'
        });
        
        const handleInteract = (e) => {
            e.stopPropagation();
            e.preventDefault();
            State.unlockBadge('snowman');
            SnowmanBuilder.collect();
            sm.style.transition = 'transform 0.2s, opacity 0.2s';
            sm.style.transform = 'scale(1.5)';
            sm.style.opacity = '0';
            setTimeout(() => sm.remove(), 200);
        };
        
        sm.addEventListener('mousedown', handleInteract);
        sm.addEventListener('touchstart', handleInteract, { passive: false });
        
        c.appendChild(sm);
        void sm.offsetWidth;
        
        requestAnimationFrame(() => {
            sm.style.top = '110vh';
            sm.style.transform = `rotate(${Math.random() * 360}deg)`;
        });
        
        setTimeout(() => { if (sm.parentNode) sm.remove(); }, 9000);
        Effects.snowmanTimeout = setTimeout(spawnSnowman, Math.random() * 30000 + 15000);
    };
    
    Effects.snowmanTimeout = setTimeout(spawnSnowman, Math.random() * 5000 + 5000);
};

console.log('%c[Theme: Winter] Loaded', 'color: #3b82f6');

})();
