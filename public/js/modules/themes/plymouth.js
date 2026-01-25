/**
 * ============================================================================
 * PLYMOUTH THEME EFFECT
 * ============================================================================
 * Night sky with twinkling stars, shooting stars, streaks, and satellites
 */

(function() {
'use strict';

Effects.plymouth = function(active) {
    const c = DOM.theme.effects.plymouth;
    
    if (Effects.plymouthShooterTimeout) clearTimeout(Effects.plymouthShooterTimeout);
    if (Effects.satelliteTimeout) clearTimeout(Effects.satelliteTimeout);
    if (Effects.plymouthStreakTimeout) clearTimeout(Effects.plymouthStreakTimeout);
    
    if (!active) { 
        c.innerHTML = ''; 
        return; 
    }
    
    c.innerHTML = '';
    
    // Add twinkle animation style
    if (!document.getElementById('plymouth-stars-style')) {
        const style = document.createElement('style');
        style.id = 'plymouth-stars-style';
        style.innerHTML = `
            @keyframes twinkle {
                0% { opacity: 0.3; transform: scale(0.8); }
                50% { opacity: 1; transform: scale(1.2); box-shadow: 0 0 2px rgba(255,255,255,0.8); }
                100% { opacity: 0.3; transform: scale(0.8); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Create stars
    for (let i = 0; i < 60; i++) {
        const s = document.createElement('div');
        s.className = 'star-particle';
        const size = Math.random() * 3 + 1;
        Object.assign(s.style, {
            position: 'absolute',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            width: size + 'px',
            height: size + 'px',
            background: 'white',
            borderRadius: '50%',
            animation: `twinkle ${Math.random() * 4 + 2}s infinite ease-in-out`,
            animationDelay: `-${Math.random() * 5}s`
        });
        c.appendChild(s);
    }
    
    // Shooting star spawner
    Effects.spawnPlymouthShooter = () => {
        if (State.runtime.currentTheme !== 'plymouth') return;
        
        const s = document.createElement('div');
        s.textContent = '🌠';
        Object.assign(s.style, {
            position: 'absolute',
            fontSize: (Math.random() * 1 + 1) + 'rem',
            transform: 'rotate(-35deg)',
            boxShadow: '0 0 8px rgba(255,255,255,0.8)',
            zIndex: '10',
            pointerEvents: 'none',
            borderRadius: '100%',
            top: Math.random() * 40 + '%',
            left: Math.random() * 80 + 10 + '%',
            opacity: '0'
        });
        c.appendChild(s);
        
        const travelDist = Math.random() * 300 + 200;
        const duration = Math.random() * 1500 + 2000;
        
        const anim = s.animate([
            { transform: 'translate(0, 0) rotate(-35deg)', opacity: 0 },
            { transform: 'translate(0, 0) rotate(-35deg)', opacity: 1, offset: 0.1 },
            { transform: `translate(-${travelDist}px, ${travelDist/2}px) rotate(-35deg)`, opacity: 0 }
        ], { duration: duration, easing: 'ease-out' });
        
        anim.onfinish = () => s.remove();
        Effects.plymouthShooterTimeout = setTimeout(() => Effects.spawnPlymouthShooter(), Math.random() * 8000 + 4000);
    };
    
    // Light streak spawner
    Effects.spawnRealStreak = () => {
        if (State.runtime.currentTheme !== 'plymouth') return;
        
        const streak = document.createElement('div');
        const width = Math.random() * 150 + 50;
        
        Object.assign(streak.style, {
            position: 'absolute',
            height: (Math.random() * 2 + 1) + 'px',
            width: width + 'px',
            background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.9) 50%, rgba(255,255,255,0))',
            top: (Math.random() * 60) + '%',
            left: (Math.random() * 100) + '%',
            transform: 'rotate(-35deg)',
            opacity: '0',
            pointerEvents: 'none',
            zIndex: '5',
            boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)'
        });
        c.appendChild(streak);
        
        const travelX = -200;
        const travelY = 100;
        
        const anim = streak.animate([
            { transform: 'translate(0, 0) rotate(-35deg)', opacity: 0 },
            { transform: `translate(${travelX * 0.1}px, ${travelY * 0.1}px) rotate(-35deg)`, opacity: 1, offset: 0.1 },
            { transform: `translate(${travelX}px, ${travelY}px) rotate(-35deg)`, opacity: 0 }
        ], {
            duration: Math.random() * 800 + 600,
            easing: 'ease-out'
        });
        
        anim.onfinish = () => streak.remove();
        Effects.plymouthStreakTimeout = setTimeout(() => Effects.spawnRealStreak(), Math.random() * 3000 + 1000);
    };
    
    // Satellite spawner
    Effects.spawnSatellite = () => {
        if (State.runtime.currentTheme !== 'plymouth') return;
        
        const sat = document.createElement('div');
        sat.textContent = '🛰️';
        const startLeft = Math.random() > 0.5;
        
        Object.assign(sat.style, {
            position: 'absolute',
            fontSize: '2.5rem',
            opacity: '0.9',
            zIndex: '2',
            top: (Math.random() * 50 + 10) + '%',
            left: startLeft ? '-10%' : '110%',
            transition: 'left 35s linear, transform 35s linear',
            filter: 'drop-shadow(0 0 3px rgba(200,200,255,0.3))',
            transform: startLeft ? 'rotate(15deg)' : 'scaleX(-1) rotate(-15deg)',
            pointerEvents: 'none'
        });
        c.appendChild(sat);
        
        requestAnimationFrame(() => {
            sat.style.left = startLeft ? '110%' : '-10%';
            sat.style.transform = startLeft ? 'rotate(45deg)' : 'scaleX(-1) rotate(-45deg)';
        });
        
        setTimeout(() => { if (sat.parentNode) sat.remove(); }, 36000);
        Effects.satelliteTimeout = setTimeout(() => Effects.spawnSatellite(), Math.random() * 25000 + 20000);
    };
    
    // Start all spawners
    Effects.spawnPlymouthShooter();
    Effects.spawnSatellite();
    Effects.spawnRealStreak();
};

console.log('%c[Theme: Plymouth] Loaded', 'color: #1e3a8a');

})();
