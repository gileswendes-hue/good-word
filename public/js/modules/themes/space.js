/**
 * ============================================================================
 * SPACE THEME EFFECT
 * ============================================================================
 * Starfield with planets, rings, and rare space rock collectibles
 */

(function() {
'use strict';

Effects.space = function(active) {
    const c = DOM.theme.effects.space;
    if (Effects.spaceRareTimeout) clearTimeout(Effects.spaceRareTimeout);
    
    if (!active) { 
        c.innerHTML = ''; 
        return; 
    }
    
    c.innerHTML = '';
    
    // Create stars
    for (let i = 0; i < 150; i++) {
        const s = document.createElement('div');
        s.className = 'space-star';
        const size = Math.random() * 2 + 1;
        s.style.width = s.style.height = `${size}px`;
        s.style.left = `${Math.random() * 100}vw`;
        s.style.top = `${Math.random() * 100}vh`;
        s.style.opacity = Math.random() * 0.8 + 0.2;
        s.style.animationDelay = `${Math.random() * 3}s`;
        c.appendChild(s);
    }
    
    // Create planet helper
    const createPlanet = (size, x, y, colors, hasRing) => {
        const wrap = document.createElement('div');
        wrap.className = 'space-planet-wrap';
        wrap.style.width = wrap.style.height = `${size}px`;
        wrap.style.left = x;
        wrap.style.top = y;
        wrap.style.animationDuration = `${Math.random() * 10 + 15}s`;
        
        const p = document.createElement('div');
        p.className = 'space-planet';
        p.style.background = `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`;
        wrap.appendChild(p);
        
        if (hasRing) {
            const r = document.createElement('div');
            r.className = 'space-ring';
            wrap.appendChild(r);
        }
        
        c.appendChild(wrap);
    };
    
    // Add planets
    createPlanet(120, '10%', '15%', ['#ff6b6b', '#7209b7'], true);
    createPlanet(80, '85%', '60%', ['#4cc9f0', '#4361ee'], false);
    createPlanet(40, '20%', '80%', ['#fee440', '#f15bb5'], false);
    createPlanet(200, '-5%', '60%', ['#1b1b1b', '#3a3a3a'], true);
    
    // Spawn rare space rock
    const spawnRock = () => {
        if (!DOM.theme.effects.space.checkVisibility()) return;
        
        const wrap = document.createElement('div');
        wrap.className = 'space-rock-wrap';
        
        const inner = document.createElement('div');
        inner.textContent = '🤘';
        inner.className = 'space-rock-inner';
        wrap.appendChild(inner);
        
        const startLeft = Math.random() > 0.5;
        const duration = Math.random() * 10 + 10;
        
        wrap.style.transition = `left ${duration}s linear, top ${duration}s ease-in-out`;
        wrap.style.top = Math.random() * 80 + 10 + 'vh';
        wrap.style.left = startLeft ? '-150px' : '110vw';
        
        wrap.onclick = (e) => {
            e.stopPropagation(); 
            e.preventDefault();
            State.unlockBadge('rock');
            UIManager.showPostVoteMessage("SPACE ROCK! 🤘");
            wrap.style.display = 'none';
        };
        
        c.appendChild(wrap);
        
        requestAnimationFrame(() => {
            wrap.style.left = startLeft ? '110vw' : '-150px';
            wrap.style.top = Math.random() * 80 + 10 + 'vh';
        });
        
        setTimeout(() => { if(wrap.parentNode) wrap.remove(); }, duration * 1000);
        Effects.spaceRareTimeout = setTimeout(spawnRock, Math.random() * 12000 + 8000);
    };
    
    Effects.spaceRareTimeout = setTimeout(spawnRock, 3000);
};

console.log('%c[Theme: Space] Loaded', 'color: #8b5cf6');

})();
