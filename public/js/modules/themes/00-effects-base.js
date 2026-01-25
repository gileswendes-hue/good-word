/**
 * ============================================================================
 * EFFECTS BASE - Core effects system and shared utilities
 * ============================================================================
 * 
 * This file sets up the Effects object. Individual theme files register
 * their effect functions on this object.
 * 
 * Load order:
 *   1. 00-effects-base.js (this file)
 *   2. Individual theme files (ballpit.js, halloween.js, etc.)
 */

(function() {
'use strict';

// GAME_DIALOGUE for spider and effects
window.GAME_DIALOGUE = {
    spider: {
        idle: ["Boo!", "Hey there!", "🕷️", "Miss me?", "What's up?"],
        hunting: ["DINNER TIME!", "Come to papa!", "Yummy!", "Fresh meat!"],
        trickedStart: ["Ooh lunch?", "Finally!", "Food time!"],
        trickedEnd: ["HEY!", "Where'd it go?!", "You tricked me!", "NOT COOL!"],
        missed: ["Too slow!", "My lunch!", "Darn it!", "Next time..."],
        full: ["*burp*", "I'm stuffed!", "No more...", "Food coma...", "Zzz..."]
    },
    insects: {
        '🦟': "You saved the mosquito! 🦟",
        '🐞': "Ladybird rescued! 🐞", 
        '🐝': "Bee saved! 🐝",
        '🚁': "Chopper extracted! 🚁"
    }
};

// Effects object - theme effects register themselves here
window.Effects = {
    // Timeout/interval references for cleanup
    spiderTimeout: null,
    webRaf: null,
    ballLoop: null,
    fishTimeout: null,
    spaceRareTimeout: null,
    snowmanTimeout: null,
    plymouthShooterTimeout: null,
    plymouthStreakTimeout: null,
    woodlandTimeout: null,
    woodlandCreatureTimeout: null,
    flightTimeout: null,
    flightObjects: [],
    oceanTimeout: null,
    oceanObjects: [],
    batTimeout: null,
    satelliteTimeout: null,
    bankInterval: null,
    objectSpawnInterval: null,
    groundSpawnInterval: null,
    wiperInterval: null,
    engineAudio: null,

    // ========================================================================
    // WEATHER EFFECTS (shared across themes)
    // ========================================================================
    
    rain(active) {
        const c = document.getElementById('rain-effect');
        if (!c) return;
        if (!active) {
            c.innerHTML = '';
            c.classList.add('hidden');
            c.style.display = 'none';
            return;
        }
        c.style.display = '';
        c.classList.remove('hidden');
        if (c.children.length > 0) return;
        const count = 80;
        for (let i = 0; i < count; i++) {
            const drop = document.createElement('div');
            drop.className = 'rain-drop';
            drop.style.left = Math.random() * 100 + 'vw';
            drop.style.animationDuration = (Math.random() * 0.5 + 0.8) + 's';
            drop.style.animationDelay = (Math.random() * 2) + 's';
            drop.style.opacity = Math.random() * 0.5 + 0.3;
            c.appendChild(drop);
        }
    },

    weatherSnow(active) {
        const c = document.getElementById('snow-effect');
        if (!c) return;
        if (!active) {
            if (State.runtime.currentTheme !== 'winter') {
                c.innerHTML = '';
                c.classList.add('hidden');
                c.style.display = 'none';
            }
            return;
        }
        c.classList.remove('hidden');
        c.style.display = 'block';
        Object.assign(c.style, {
            position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '50'
        });
        if (c.children.length > 0) return;
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
    },

    // ========================================================================
    // CONFETTI (shared utility)
    // ========================================================================
    
    confetti(count = 100) {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        for (let i = 0; i < count; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: ${Math.random() * 10 + 5}px;
                height: ${Math.random() * 10 + 5}px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}vw;
                top: -20px;
                opacity: ${Math.random() * 0.5 + 0.5};
                transform: rotate(${Math.random() * 360}deg);
                pointer-events: none;
                z-index: 9999;
            `;
            document.body.appendChild(confetti);
            
            const duration = Math.random() * 3000 + 2000;
            confetti.animate([
                { transform: `translateY(0) rotate(0deg)`, opacity: 1 },
                { transform: `translateY(100vh) rotate(${Math.random() * 720}deg)`, opacity: 0 }
            ], { duration, easing: 'ease-out' }).onfinish = () => confetti.remove();
        }
    }
    
    // Individual theme effects (ballpit, halloween, etc.) are added by their respective files
};

console.log('%c[Effects Base] Loaded', 'color: #ec4899; font-weight: bold');

})();
