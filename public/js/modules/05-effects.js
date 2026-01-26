/**
 * ============================================================================
 * GOOD WORD / BAD WORD - EFFECTS MODULE (05-effects.js)
 * ============================================================================
 * 
 * Contains:
 * - Effects: All visual effects for themes
 *   - rain, weatherSnow, snow
 *   - fire, bubbles, summer
 *   - halloween (spider, web, bat)
 *   - ballpit, space, woodland
 *   - flight, ocean, plymouth
 *   - confetti
 * - ShareManager: QR code and image sharing
 * 
 * Dependencies: 01-core.js, 02-sound.js, 04-themes.js
 * ============================================================================
 */

(function() {
'use strict';

// GAME_DIALOGUE for spider and effects
const GAME_DIALOGUE = {
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

const Effects = {
    spiderTimeout: null,
    webRaf: null,
    ballLoop: null,
    fishTimeout: null,
    spaceRareTimeout: null,
    snowmanTimeout: null,
    plymouthShooterTimeout: null,
rain(active) {
        const c = document.getElementById('rain-effect');
        if (!c) return;
        if (!active) {
            c.innerHTML = '';
            c.classList.add('hidden');
            c.style.display = 'none'; // Force hide immediately
            return;
        }
        c.style.display = ''; // Restore visibility
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
        if (c.children.length > 0) return; // Prevent double spawn
        for (let i = 0; i < 60; i++) {
            const f = document.createElement('div');
            f.className = 'snow-particle';
            const s = Math.random() * 12 + 5;
            f.style.width = f.style.height = `${s}px`;
            f.style.opacity = Math.random() * .6 + .3;
            if (s < 4) f.style.filter = `blur(${Math.random()*2}px)`;
            f.style.left = `${Math.random()*100}vw`;
            f.style.setProperty('--sway', `${(Math.random()-.5)*100}px`);
            f.style.animationDuration = `${Math.random()*15+8}s`;
            f.style.animationDelay = `-${Math.random()*15}s`;
            c.appendChild(f);
        }
    },
plymouth(a) {
        const c = DOM.theme.effects.plymouth;
        if (this.plymouthShooterTimeout) clearTimeout(this.plymouthShooterTimeout);
        if (this.satelliteTimeout) clearTimeout(this.satelliteTimeout);
        if (this.plymouthStreakTimeout) clearTimeout(this.plymouthStreakTimeout);
        if (!a) { c.innerHTML = ''; return; }
        c.innerHTML = '';
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
        this.spawnPlymouthShooter = () => {
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
            this.plymouthShooterTimeout = setTimeout(() => this.spawnPlymouthShooter(), Math.random() * 8000 + 4000);
        };
        this.spawnRealStreak = () => {
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
            this.plymouthStreakTimeout = setTimeout(() => this.spawnRealStreak(), Math.random() * 3000 + 1000);
        };
        this.spawnSatellite = () => {
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
            setTimeout(() => { if(sat.parentNode) sat.remove(); }, 36000);
            this.satelliteTimeout = setTimeout(() => this.spawnSatellite(), Math.random() * 25000 + 20000);
        };
        this.spawnPlymouthShooter();
        this.spawnSatellite();
        this.spawnRealStreak();
    },
    fire() { 
        const c = DOM.theme.effects.fire; 
        c.innerHTML = ''; 
        
        // Add heat distortion overlay
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
    },
bubbles(active) {
        const c = DOM.theme.effects.bubble;
        if (this.fishTimeout) clearTimeout(this.fishTimeout);
        if (!active) { c.innerHTML = ''; return; }
        c.innerHTML = '';
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isLowPower = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
        const particleCount = (isMobile || isLowPower) ? 15 : 35;
        const cl = [10, 30, 70, 90];
        for (let i = 0; i < particleCount; i++) {
            const p = document.createElement('div');
            p.className = 'bubble-particle';
            const s = Math.random() * 30 + 10;
            p.style.width = p.style.height = `${s}px`;
            p.style.left = `${cl[Math.floor(Math.random()*cl.length)]+(Math.random()-.5)*20}%`;
            p.style.animationDuration = `${Math.random()*10+10}s`;
            p.style.animationDelay = `-${Math.random()*15}s`;
            c.appendChild(p);
        }
        this.spawnFish();
    },
spawnFish() {
        const c = DOM.theme.effects.bubble;
        if (!c) return; // Safety check
        if (!document.getElementById('octopus-style')) {
            const style = document.createElement('style');
            style.id = 'octopus-style';
            style.innerHTML = `
                @keyframes octopus-swim {
                    0% { transform: translateY(0) scale(1, 1); }
                    25% { transform: translateY(-30px) scale(0.9, 1.1); }
                    50% { transform: translateY(0) scale(1, 1); }
                    75% { transform: translateY(30px) scale(1.1, 0.9); }
                    100% { transform: translateY(0) scale(1, 1); }
                }
                .octopus-motion { animation: octopus-swim 2s ease-in-out infinite; }
            `;
            document.head.appendChild(style);
        }
        if (State.runtime.currentTheme !== 'submarine') return;
        const fishData = {
            '🐟': { k: 'fish', msg: "Gotcha! 🐟", speed: [12, 18] },
            '🐠': { k: 'tropical', msg: "So colourful! 🐠", speed: [15, 25] },
            '🐡': { k: 'puffer', msg: "", speed: [20, 30] },
            '🦈': { k: 'shark', msg: "You're gonna need a bigger boat! 🦈", speed: [6, 10] },
            '🐙': { k: 'octopus', msg: "Wiggle wiggle! 🐙", speed: [18, 25] },
            '🥾': { k: 'prankster', msg: "Keep the ocean clean!", speed: [15, 20] }
        };
        const roll = Math.random();
        let fishEmoji = '🐟';
        if (roll < 0.05) fishEmoji = '🥾';
        else if (roll < 0.15) fishEmoji = '🐙';
        else if (roll < 0.25) fishEmoji = '🦈';
        else if (roll < 0.40) fishEmoji = '🐡';
        else if (roll < 0.70) fishEmoji = '🐠';
        else fishEmoji = '🐟';
        const config = fishData[fishEmoji] || fishData['🐟'];
                const wrap = document.createElement('div');
        wrap.className = 'submarine-fish-wrap';
        wrap.style.position = 'fixed';
        wrap.style.zIndex = '10';
        const inner = document.createElement('div');
        inner.className = 'submarine-fish-inner';
        inner.textContent = fishEmoji;
        inner.dataset.clicks = "0";
        inner.style.display = 'block';
        inner.style.lineHeight = '1';
        inner.style.fontSize = fishEmoji === '🐙' ? '3.5rem' : '3rem';
        if (fishEmoji === '🐙') {
            inner.classList.add('octopus-motion');
            inner.style.animationDuration = (Math.random() * 1 + 1.5) + 's';
            inner.style.animationDelay = '-' + (Math.random() * 2) + 's';
        }
        const isBoot = fishEmoji === '🥾';
        const startLeft = Math.random() > 0.5;
        const baseDir = startLeft ? -1 : 1;
        const duration = (Math.random() * (config.speed[1] - config.speed[0]) + config.speed[0]) || 15;
        const isFakeOut = !isBoot && fishEmoji !== '🐙' && Math.random() < 0.10;
        if (isBoot) {
            inner.style.animation = 'spin-slow 10s linear infinite';
            inner.style.transition = 'transform 0.5s';
            wrap.style.left = (Math.random() * 80 + 10) + '%';
            wrap.style.top = '110vh';
            inner.style.transform = `rotate(${Math.random() * 360}deg)`;
        } else {
            inner.style.transition = 'font-size 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 0.2s';
            wrap.style.top = (Math.random() * 80 + 10) + 'vh';
            wrap.style.left = startLeft ? '-150px' : '110vw';
            if (!isBoot) inner.style.transform = `scaleX(${baseDir})`;
        }
        wrap.appendChild(inner);
        c.appendChild(wrap);
        void wrap.offsetWidth;
        const showBubble = (text) => {
            const old = wrap.querySelector('.fish-bubble');
            if(old) old.remove();
            const b = document.createElement('div');
            b.className = 'fish-bubble';
            Object.assign(b.style, {
                position: 'absolute', bottom: '100%', left: '50%',
                transform: 'translateX(-50%)', background: 'white', color: '#1f2937',
                padding: '6px 12px', borderRadius: '12px', fontSize: '16px',
                fontWeight: 'bold', whiteSpace: 'nowrap', zIndex: '20',
                pointerEvents: 'none', opacity: '0', transition: 'opacity 0.2s',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)', border: '1px solid #e5e7eb',
                marginBottom: '10px'
            });
            b.textContent = text;
            const arrow = document.createElement('div');
            Object.assign(arrow.style, {
                position: 'absolute', top: '100%', left: '50%', marginLeft: '-6px',
                borderWidth: '6px', borderStyle: 'solid',
                borderColor: 'white transparent transparent transparent'
            });
            b.appendChild(arrow);
            wrap.appendChild(b);
            requestAnimationFrame(() => b.style.opacity = '1');
            setTimeout(() => { if(b.parentNode) { b.style.opacity = '0'; setTimeout(() => b.remove(), 300); } }, 2000);
        };
        const handleEscape = (e) => {
            const prop = isBoot ? 'top' : 'left';
            if (e.propertyName !== prop) return;
            if (wrap.parentNode) {
                if (!isBoot) {
                    State.data.fishStats.spared = (State.data.fishStats.spared || 0) + 1;
                    State.save('fishStats', State.data.fishStats);
                    if (State.data.fishStats.spared >= 250) State.unlockBadge('shepherd');
                }
                wrap.remove();
            }
        };
        wrap.addEventListener('transitionend', handleEscape);
        wrap.onclick = (e) => {
            e.stopPropagation();
            if (fishEmoji === '🐡') {
                let clicks = parseInt(inner.dataset.clicks) || 0;
                const canGrow = clicks < 5;
                const roll = Math.random();
                const shouldCatch = !canGrow || (roll < 0.25);
                if (!shouldCatch) {
                    clicks++;
                    inner.dataset.clicks = clicks;
                    State.unlockBadge('puffer');
                    const newSize = 3 + (clicks * 1.5);
                    inner.style.fontSize = `${newSize}rem`;
                    Haptics.light();
                    const puffMsgs = ["Wanna fight?", "I'm bigger than your dad.", "I'll spike you!", "Stop it!", "I am big scary bear!", "Why not pick on someone your own size?"];
                    showBubble(puffMsgs[Math.floor(Math.random() * puffMsgs.length)]);
                    return;
                }
            }
            const data = fishData[fishEmoji];
            if (fishEmoji === '🐙') {
                e.stopPropagation();
                if (data.k) State.unlockBadge(data.k);
                State.data.fishStats.caught++;
                State.save('fishStats', State.data.fishStats);
                UIManager.showPostVoteMessage("Inked!");
                SoundManager.playWhoosh();
                const rect = wrap.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                for (let i = 0; i < 12; i++) {
                    const ink = document.createElement('div');
                    const ox = (Math.random() - 0.5) * 40;
                    const oy = (Math.random() - 0.5) * 40;
                    Object.assign(ink.style, {
                        position: 'fixed', left: (centerX + ox) + 'px', top: (centerY + oy) + 'px',
                        width: (Math.random() * 15 + 10) + 'px', height: (Math.random() * 15 + 10) + 'px',
                        background: '#000000', borderRadius: '50%', opacity: '0.8',
                        pointerEvents: 'none', zIndex: '99',
                        transition: 'transform 1s ease-out, opacity 1s ease-out'
                    });
                    document.body.appendChild(ink);
                    requestAnimationFrame(() => {
                        ink.style.transform = `scale(${Math.random() * 2 + 1}) translate(${ox}px, ${oy}px)`;
                        ink.style.opacity = '0';
                    });
                    setTimeout(() => ink.remove(), 1000);
                }
                const jetSpeed = Math.random() * 0.8 + 1.2;
                wrap.style.transition = `left ${jetSpeed}s cubic-bezier(0.25, 1, 0.5, 1), top ${jetSpeed}s ease-out`;
                wrap.style.left = (110 + Math.random() * 30) + 'vw';
                wrap.style.top = (-20 - Math.random() * 30) + 'vh';
                setTimeout(() => { if(wrap.parentNode) wrap.remove(); }, jetSpeed * 1000 + 200);
                return;
            }
            if (isFakeOut) {
                 showBubble('hey!');
                 SoundManager.playPop();
                 const currentLeft = getComputedStyle(wrap).left;
                 wrap.style.transition = 'none';
                 wrap.style.left = currentLeft;
                 setTimeout(() => {
                     if(!wrap.parentNode) return;
                     inner.style.transition = 'none';
                     inner.style.transform = `scaleX(${-baseDir})`;
                     wrap.style.transition = `left ${duration * 0.5}s linear`;
                     wrap.style.left = startLeft ? '-150px' : '110vw';
                     setTimeout(() => {
                         if(wrap.parentNode) wrap.remove();
                     }, duration * 500 + 100);
                 }, 600);
                 return;
            }
            if (data.k) State.unlockBadge(data.k);
            if (!isBoot) {
                State.data.fishStats.caught++;
                State.save('fishStats', State.data.fishStats);
                if (State.data.fishStats.caught >= 250) State.unlockBadge('angler');
            }
            if (fishEmoji === '🐡') UIManager.showPostVoteMessage("Popped!");
            SoundManager.playPop();
            const rect = wrap.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const pColor = fishEmoji === '🐡' ? '#eab308' : (isBoot ? '#78350f' : '#60a5fa');
            for (let i = 0; i < 12; i++) {
                const p = document.createElement('div');
                p.style.cssText = `position: fixed; width: 8px; height: 8px; background: ${pColor}; border-radius: 50%; pointer-events: none; z-index: 102; left: ${centerX}px; top: ${centerY}px;`;
                document.body.appendChild(p);
                const angle = Math.random() * Math.PI * 2;
                const velocity = Math.random() * 60 + 20;
                p.animate([
                    { transform: 'translate(0,0) scale(1)', opacity: 1 },
                    { transform: `translate(${Math.cos(angle)*velocity}px, ${Math.sin(angle)*velocity}px) scale(0)`, opacity: 0 }
                ], { duration: 400, easing: 'ease-out' }).onfinish = () => p.remove();
            }
            wrap.style.transition = 'opacity 0.1s, transform 0.1s';
            wrap.style.opacity = '0';
            wrap.style.transform = 'scale(0)';
            setTimeout(() => wrap.remove(), 100);
        };
        requestAnimationFrame(() => {
            if (isBoot) {
                wrap.style.top = '-20%';
                wrap.style.transition = `top ${duration}s linear`;
            } else {
                wrap.style.left = startLeft ? '125vw' : '-25vw';
                wrap.style.transition = `left ${duration}s linear`;
            }
        });
        setTimeout(() => {
            if (wrap.parentNode) wrap.remove();
        }, duration * 1000 + 3000);
        this.fishTimeout = setTimeout(() => this.spawnFish(), Math.random() * 4000 + 1000);
    },
    snow() {
        const c = DOM.theme.effects.snow;
        c.innerHTML = '';
        for (let i = 0; i < 60; i++) {
            const f = document.createElement('div');
            f.className = 'snow-particle';
            const s = Math.random() * 12 + 5;
            f.style.width = f.style.height = `${s}px`;
            f.style.opacity = Math.random() * .6 + .3;
            if (s < 4) f.style.filter = `blur(${Math.random()*2}px)`;
            f.style.left = `${Math.random()*100}vw`;
            f.style.setProperty('--sway', `${(Math.random()-.5)*100}px`);
            f.style.animationDuration = `${Math.random()*15+8}s`;
            f.style.animationDelay = `-${Math.random()*15}s`;
            c.appendChild(f);
        }
        if (this.snowmanTimeout) clearTimeout(this.snowmanTimeout);
        const spawnSnowman = () => {
            if (State.runtime.currentTheme !== 'winter') return;
            const sm = document.createElement('div');
            sm.className = 'snow-particle';
            sm.textContent = '⛄';
            Object.assign(sm.style, {
                position: 'absolute', fontSize: '2.5rem', width: 'auto', height: 'auto',
                opacity: '1', left: `${Math.random() * 85 + 5}vw`, top: '-15vh',
                filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))', cursor: 'pointer',
                zIndex: '101', pointerEvents: 'auto', animation: 'none',
                transition: 'top 8s linear, transform 8s ease-in-out'
            });
            const handleInteract = (e) => {
                e.stopPropagation(); e.preventDefault();
                State.unlockBadge('snowman');
                SnowmanBuilder.collect(); // Add to snowman building progress
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
            this.snowmanTimeout = setTimeout(spawnSnowman, Math.random() * 30000 + 15000);
        };
        this.snowmanTimeout = setTimeout(spawnSnowman, Math.random() * 5000 + 5000);
    },
    summer() { const c = DOM.theme.effects.summer; c.innerHTML = ''; const g = document.createElement('div'); g.className = 'summer-grass'; c.appendChild(g); for (let i = 0; i < 8; i++) { const d = document.createElement('div'); d.className = `summer-cloud v${Math.floor(Math.random()*3)+1}`; const w = Math.random() * 100 + 100; d.style.width = `${w}px`; d.style.height = `${w*.35}px`; d.style.top = `${Math.random()*60}%`; d.style.animationDuration = `${Math.random()*60+60}s`; d.style.animationDelay = `-${Math.random()*100}s`; c.appendChild(d) } },
halloween(active) {
        if (this.spiderTimeout) clearTimeout(this.spiderTimeout);
        if (this.webRaf) cancelAnimationFrame(this.webRaf);
        if (this.batTimeout) clearTimeout(this.batTimeout);
        const isSafeMode = State.data.settings.arachnophobiaMode;
        if (!active || isSafeMode) {
            const old = document.getElementById('spider-wrap');
            if (old) old.remove();
            const oldWeb = document.getElementById('spider-web-corner');
            if (oldWeb) oldWeb.remove();
            const style = document.getElementById('spider-motion-style');
            if (style) style.remove();
            const oldBat = document.getElementById('halloween-bat');
            if (oldBat) oldBat.remove();
            return;
        }
        const spawnBat = () => {
            if (!active) return;
            const oldBat = document.getElementById('halloween-bat');
            if (oldBat) oldBat.remove();
            const bat = document.createElement('div');
            bat.id = 'halloween-bat';
            const side = Math.floor(Math.random() * 4);
            let startX, startY, endX, endY;
            switch(side) {
                case 0: // top
                    startX = 20 + Math.random() * 60;
                    startY = -10;
                    endX = 30 + Math.random() * 40;
                    endY = 110;
                    break;
                case 1: // right
                    startX = 110;
                    startY = 20 + Math.random() * 60;
                    endX = -10;
                    endY = 30 + Math.random() * 40;
                    break;
                case 2: // bottom
                    startX = 20 + Math.random() * 60;
                    startY = 110;
                    endX = 30 + Math.random() * 40;
                    endY = -10;
                    break;
                default: // left
                    startX = -10;
                    startY = 20 + Math.random() * 60;
                    endX = 110;
                    endY = 30 + Math.random() * 40;
            }
            const duration = 4 + Math.random() * 3;
            bat.innerHTML = `
                <div class="bat-body" style="font-size: 5rem; filter: drop-shadow(0 0 15px rgba(0,0,0,0.6));">
                    <span class="bat-wing-left" style="display: inline-block; transform-origin: right center;">🦇</span>
                </div>
            `;
            bat.style.cssText = `
                position: fixed;
                left: ${startX}%;
                top: ${startY}%;
                z-index: 101;
                pointer-events: none;
                animation: bat-fly-${Date.now()} ${duration}s ease-in-out forwards;
            `;
            const styleEl = document.createElement('style');
            styleEl.textContent = `
                @keyframes bat-fly-${Date.now()} {
                    0% {
                        left: ${startX}%;
                        top: ${startY}%;
                        transform: scale(0.3);
                    }
                    50% {
                        transform: scale(1.5);
                    }
                    100% {
                        left: ${endX}%;
                        top: ${endY}%;
                        transform: scale(0.5);
                    }
                }
                @keyframes bat-flap {
                    0%, 100% { transform: scaleX(1) scaleY(1); }
                    50% { transform: scaleX(0.6) scaleY(0.8); }
                }
                .bat-body {
                    animation: bat-flap 0.15s ease-in-out infinite;
                }
            `;
            document.head.appendChild(styleEl);
            document.body.appendChild(bat);
            setTimeout(() => {
                bat.remove();
                styleEl.remove();
            }, duration * 1000);
            this.batTimeout = setTimeout(spawnBat, 8000 + Math.random() * 12000);
        };
        this.batTimeout = setTimeout(spawnBat, 3000 + Math.random() * 5000);
        if (!document.getElementById('spider-motion-style')) {
            const s = document.createElement('style');
            s.id = 'spider-motion-style';
            s.innerHTML = `
                @keyframes spider-idle-wiggle {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(2deg); }
                }
                @keyframes spider-moving {
                    0%, 100% { transform: rotate(-1deg); }
                    50% { transform: rotate(1deg); }
                }
                @keyframes spider-pause-wiggle {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(3deg); }
                }
                .scuttling-motion {
                    animation: spider-moving 0.8s infinite ease-in-out;
                }
                .spider-paused {
                    animation: spider-pause-wiggle 1s ease-in-out;
                }
                .hunting-scuttle {
                    animation: spider-moving 0.5s infinite ease-in-out;
                }
                .spider-idle {
                    animation: spider-idle-wiggle 3s infinite ease-in-out;
                }
                .spider-fat {
                    filter: drop-shadow(0 10px 5px rgba(0,0,0,0.4)); transition: transform 1s cubic-bezier(0.5, 0, 0.5, 1);
                }
            `;
            document.head.appendChild(s);
        }
        const spiderScuttle = {
            active: false,
            targetX: 50,
            currentX: 50,
            start(wrap, body, targetPercent, onComplete) {
                this.active = true;
                this.targetX = targetPercent;
                this.currentX = parseFloat(wrap.style.left) || 50;
                body.classList.add('scuttling-motion');
                wrap.style.transition = 'left 2s ease-in-out';
                wrap.style.left = targetPercent + '%';
                setTimeout(() => {
                    this.currentX = targetPercent;
                    this.stop(body, onComplete);
                }, 2000);
            },
            stop(body, onComplete) {
                this.active = false;
                body.classList.remove('scuttling-motion', 'spider-paused');
                if (onComplete) onComplete();
            },
            cancel(body) {
                this.active = false;
                body.classList.remove('scuttling-motion', 'spider-paused');
            }
        };
        let wrap = document.getElementById('spider-wrap');
        if (!wrap) {
            wrap = document.createElement('div');
            wrap.id = 'spider-wrap';
            wrap.spiderScuttle = spiderScuttle; // Attach for external access
            Object.assign(wrap.style, {
                position: 'fixed', left: '50%', top: '-15vh', zIndex: '102',
                pointerEvents: 'none'
            });
            const now = Date.now();
            const oneHourAgo = now - (60 * 60 * 1000);
            if (!State.data.spiderEatLog) State.data.spiderEatLog = [];
            const recentBugs = State.data.spiderEatLog.filter(t => t > oneHourAgo).length;
            const maxBugs = 5;
            const cappedEaten = Math.min(recentBugs, maxBugs);
            const fontSize = (3 + (cappedEaten * 0.6)).toFixed(2); // 3rem -> 6rem over 5 bugs
            wrap.innerHTML = `
                <div id="spider-anchor" style="transform-origin: top center;">
                    <div id="spider-thread" style="width: 2px; background: rgba(255,255,255,0.6); margin: 0 auto; height: 0; transition: height 4s ease-in-out;"></div>
                    <div id="spider-body" style="font-size: ${fontSize}rem; margin-top: -10px; cursor: pointer; position: relative; z-index: 2; pointer-events: auto; transition: font-size 0.3s ease;">
                        🕷️
                    </div>
                </div>`;
            document.body.appendChild(wrap);
            const body = wrap.querySelector('#spider-body');
            const thread = wrap.querySelector('#spider-thread');
    const showSpiderBubble = (text) => {
                const old = document.getElementById('spider-bubble-dynamic');
                if (old) {
                    if (old.rafId) cancelAnimationFrame(old.rafId);
                    old.remove();
                }
                const b = document.createElement('div');
                b.id = 'spider-bubble-dynamic';
                Object.assign(b.style, {
                    position: 'fixed',
                    background: 'white', color: '#1f2937', padding: '8px 14px',
                    borderRadius: '16px', fontSize: '14px', fontWeight: 'bold',
                    fontFamily: 'sans-serif', whiteSpace: 'nowrap', width: 'max-content',
                    pointerEvents: 'none', opacity: '0', transition: 'opacity 0.2s',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)', border: '2px solid #1f2937',
                    zIndex: '110',
                    willChange: 'top, left'
                });
                b.textContent = text;
                const arrow = document.createElement('div');
                Object.assign(arrow.style, {
                    position: 'absolute', width: '0', height: '0',
                    borderStyle: 'solid', pointerEvents: 'none'
                });
                b.appendChild(arrow);
                document.body.appendChild(b);
                const updatePosition = () => {
                    if (!b.parentNode) return; // Stop if removed
                    const spiderRect = body.getBoundingClientRect();
                    const bubRect = b.getBoundingClientRect();
                    const currentTransform = body.style.transform || '';
                    const gap = 15;
                    let rotation = 0;
                    if (currentTransform.includes('180deg')) rotation = 180;
                    else if (currentTransform.includes('90deg') && !currentTransform.includes('-90deg')) rotation = 90;
                    else if (currentTransform.includes('-90deg')) rotation = -90;
                    let top, left;
                    if (rotation === 0) {
                        top = spiderRect.top - bubRect.height - gap;
                        left = spiderRect.left + (spiderRect.width / 2) - (bubRect.width / 2);
                        Object.assign(arrow.style, {
                            bottom: '-8px', left: '50%', right: 'auto', top: 'auto',
                            transform: 'translateX(-50%) translateY(0)',
                            borderWidth: '8px 8px 0 8px',
                            borderColor: '#1f2937 transparent transparent transparent'
                        });
                    }
                    else if (rotation === 180) {
                        top = spiderRect.bottom + gap;
                        left = spiderRect.left + (spiderRect.width / 2) - (bubRect.width / 2);
                        Object.assign(arrow.style, {
                            top: '-8px', left: '50%', right: 'auto', bottom: 'auto',
                            transform: 'translateX(-50%) translateY(0)',
                            borderWidth: '0 8px 8px 8px',
                            borderColor: 'transparent transparent #1f2937 transparent'
                        });
                    }
                    else if (rotation === 90) {
                        top = spiderRect.top + (spiderRect.height / 2) - (bubRect.height / 2);
                        left = spiderRect.left - bubRect.width - gap;
                        Object.assign(arrow.style, {
                            right: '-8px', top: '50%', left: 'auto', bottom: 'auto',
                            transform: 'translateY(-50%) translateX(0)',
                            borderWidth: '8px 0 8px 8px',
                            borderColor: 'transparent transparent transparent #1f2937'
                        });
                    }
                    else if (rotation === -90) {
                        top = spiderRect.top + (spiderRect.height / 2) - (bubRect.height / 2);
                        left = spiderRect.right + gap;
                        Object.assign(arrow.style, {
                            left: '-8px', top: '50%', right: 'auto', bottom: 'auto',
                            transform: 'translateY(-50%) translateX(0)',
                            borderWidth: '8px 8px 8px 0',
                            borderColor: 'transparent #1f2937 transparent transparent'
                        });
                    }
                    if (left < 10) left = 10;
                    if (left + bubRect.width > window.innerWidth - 10) left = window.innerWidth - bubRect.width - 10;
                    if (top < 10) top = 10;
                    if (top + bubRect.height > window.innerHeight - 10) top = window.innerHeight - bubRect.height - 10;
                    b.style.top = `${top}px`;
                    b.style.left = `${left}px`;
                    b.rafId = requestAnimationFrame(updatePosition);
                };
                requestAnimationFrame(() => {
                    b.style.opacity = '1';
                    updatePosition();
                });
                setTimeout(() => {
                    if (b.parentNode) {
                        b.style.opacity = '0';
                        setTimeout(() => {
                            if (b.rafId) cancelAnimationFrame(b.rafId);
                            b.remove();
                        }, 300);
                    }
                }, 2000);
                return b;
            };
            wrap.showBubble = showSpiderBubble;
            body.onclick = (e) => {
                e.stopPropagation();
                State.unlockBadge('spider');
                const willFall = Math.random() < 0.2;
                const lines = willFall ? GAME_DIALOGUE.spider.pokeGrumpy : GAME_DIALOGUE.spider.pokeHappy;
                const text = lines[Math.floor(Math.random() * lines.length)];
                showSpiderBubble(text);
                body.style.animation = 'shake 0.3s ease-in-out';
                if (willFall) {
                    if (this.spiderTimeout) clearTimeout(this.spiderTimeout);
                    setTimeout(() => { this.spiderFall(wrap, thread, body); }, 400);
                } else {
                    setTimeout(() => { body.style.animation = ''; }, 2000);
                }
            };
        }
        const body = wrap.querySelector('#spider-body');
        const thread = wrap.querySelector('#spider-thread');
        const scuttle = wrap.spiderScuttle;
const anchor = wrap.querySelector('#spider-anchor');
        const currentBody = wrap.querySelector('#spider-body'); // Ensure we have the body
        if (anchor && currentBody) {
            const eaten = State.data.insectStats.eaten || 0;
            let scale = Math.min(0.7 + (eaten * 0.05), 2.0);
            const isFull = Date.now() < (State.data.spiderFullUntil || 0);
            if (isFull) {
                scale = scale * 1.6; // Max fatness (60% bigger)
                currentBody.classList.add('spider-fat');
            } else {
                const recentBugs = State.data.spiderEatLog ? State.data.spiderEatLog.length : 0;
                scale = scale * (1 + (recentBugs * 0.20));
                currentBody.classList.remove('spider-fat');
            }
            anchor.style.transform = `scale(${scale.toFixed(2)})`;
        }
        const runDrop = () => {
            if (!document.body.contains(wrap)) return;
            if (wrap.classList.contains('hunting')) return;
            if (scuttle) scuttle.cancel(body);
            const actionRoll = Math.random();
            body.style.transform = 'rotate(0deg)';
            body.classList.remove('scuttling-motion', 'spider-paused', 'spider-idle');
            thread.style.opacity = '1';
            if (actionRoll < 0.7) {
                const safeLeft = Math.random() * 60 + 20;
                if (scuttle) {
                    scuttle.start(wrap, body, safeLeft, () => {
                        if (wrap.classList.contains('hunting')) return;
                        body.style.transform = 'rotate(180deg)';
                        body.classList.add('spider-idle');
                        thread.style.transition = 'height 2.5s ease-in-out';
                        thread.style.height = '18vh';
                        setTimeout(() => {
                             if (wrap.classList.contains('hunting')) return;
                             let text = 'Boo!';
                             if (typeof GAME_DIALOGUE !== 'undefined' && GAME_DIALOGUE.spider) {
                                 if (typeof GAME_DIALOGUE.spider.getIdlePhrase === 'function') {
                                     text = GAME_DIALOGUE.spider.getIdlePhrase();
                                 } else if (GAME_DIALOGUE.spider.idle) {
                                     const phrases = Array.isArray(GAME_DIALOGUE.spider.idle) ? GAME_DIALOGUE.spider.idle : ['Boo!', 'Hi!', '🕷️'];
                                     text = phrases[Math.floor(Math.random() * phrases.length)];
                                 }
                             }
                             if(wrap.showBubble) wrap.showBubble(text, 'upside-down');
                             setTimeout(() => {
                                 if (wrap.classList.contains('hunting')) return;
                                 body.classList.remove('spider-idle');
                                 thread.style.height = '0';
                                 this.spiderTimeout = setTimeout(runDrop, Math.random() * 5000 + 5000);
                             }, 2500);
                        }, 2500);
                    });
                }
                return;
            }
            if (actionRoll < 0.9) {
                const isLeft = Math.random() > 0.5;
                const wallX = isLeft ? 5 : 85;
                if (scuttle) {
                    scuttle.start(wrap, body, wallX, () => {
                        if (wrap.classList.contains('hunting')) return;
                        thread.style.opacity = '0';
                        body.style.transform = `rotate(${isLeft ? 90 : -90}deg)`;
                        const climbDepth = Math.random() * 40 + 30;
                        thread.style.transition = 'height 4s ease-in-out';
                        thread.style.height = climbDepth + 'vh';
                        setTimeout(() => {
                             if (wrap.classList.contains('hunting')) return;
                             thread.style.height = '0';
                             setTimeout(() => {
                                 body.style.transform = 'rotate(0deg)';
                                 thread.style.opacity = '1';
                                 this.spiderTimeout = setTimeout(runDrop, Math.random() * 5000 + 5000);
                             }, 4000);
                        }, 5000);
                    });
                }
                return;
            }
            const safeLeft = Math.random() * 60 + 20;
            if (scuttle) {
                scuttle.start(wrap, body, safeLeft, () => {
                    runDrop();
                });
            }
        };
        this.spiderTimeout = setTimeout(runDrop, 1000);
        if (!document.getElementById('spider-web-corner')) {
            const web = document.createElement('div');
            web.id = 'spider-web-corner';
            web.innerHTML = `<svg id="web-svg" viewBox="0 0 300 300" style="width:300px;height:300px;position:fixed;top:0;right:0;z-index:55;pointer-events:auto;cursor:pointer;opacity:0.7;filter:drop-shadow(1px 1px 2px rgba(0,0,0,0.5))"></svg>`;
            document.body.appendChild(web);
            web.onclick = () => {
                if (MosquitoManager.state === 'stuck') {
                    this.spiderHunt(MosquitoManager.x, MosquitoManager.y, true);
                } else {
                    State.data.insectStats.teased = (State.data.insectStats.teased || 0) + 1;
                    State.save('insectStats', State.data.insectStats);
                    if (State.data.insectStats.teased >= 50) State.unlockBadge('prankster');
                    this.spiderHunt(88, 20, false);
                }
            };
            const svg = document.getElementById('web-svg');
            const cx = 300, cy = 0;
            const baseAnchors = [{ x: 0, y: 0 }, { x: 60, y: 100 }, { x: 140, y: 200 }, { x: 220, y: 270 }, { x: 300, y: 300 }];
            const animateWeb = () => {
                const time = Date.now();
                let pathStr = '';
                const curAnchors = baseAnchors.map((a, i) => {
                    if (i === 0 || i === baseAnchors.length - 1) return a;
                    const sway = Math.sin((time / 1500) + i) * 15;
                    return { x: a.x + sway, y: a.y + sway }
                });
                curAnchors.forEach(p => {
                    pathStr += `<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="rgba(255,255,255,0.4)" stroke-width="2.5"/>`
                });
                const levels = 7;
                for (let i = 1; i <= levels; i++) {
                    const t = i / levels;
                    let d = '';
                    for (let j = 0; j < curAnchors.length; j++) {
                        const ax = cx + (curAnchors[j].x - cx) * t,
                            ay = cy + (curAnchors[j].y - cy) * t;
                        if (j === 0) d += `M ${ax} ${ay}`;
                        else {
                            const px = cx + (curAnchors[j - 1].x - cx) * t,
                                py = cy + (curAnchors[j - 1].y - cy) * t;
                            const midX = (px + ax) / 2,
                                midY = (py + ay) / 2,
                                sag = 15 * t * (1 - t * 0.5),
                                dx = midX - cx,
                                dy = midY - cy,
                                len = Math.sqrt(dx * dx + dy * dy),
                                nx = dx / len,
                                ny = dy / len,
                                qx = midX - nx * sag,
                                qy = midY - ny * sag;
                            d += ` Q ${qx} ${qy} ${ax} ${ay}`
                        }
                    }
                    pathStr += `<path d="${d}" stroke="rgba(255,255,255,0.3)" stroke-width="2.5" fill="none"/>`
                }
                svg.innerHTML = pathStr;
                this.webRaf = requestAnimationFrame(animateWeb)
            };
            animateWeb()
        }
    },
spiderHunt(targetXPercent, targetYPercent, isFood) {
        const wrap = document.getElementById('spider-wrap');
        if (!wrap) return;
if (Date.now() < (State.data.spiderFullUntil || 0)) {
            const body = wrap.querySelector('#spider-body');
            const thread = wrap.querySelector('#spider-thread');
            const lines = GAME_DIALOGUE.spider.full || ["I'm stuffed."];
            const text = lines[Math.floor(Math.random() * lines.length)];
            thread.style.transition = 'height 1s ease-out';
            thread.style.height = '20vh';
            setTimeout(() => {
                if(wrap.showBubble) wrap.showBubble(text);
                if(body) body.style.animation = 'shake 1s ease-in-out';
                setTimeout(() => {
                    if(body) body.style.animation = '';
                    thread.style.height = '0';
                }, 1500);
            }, 1000); // Wait for drop
            return; // Stop here, don't hunt normally
        }
        const thread = wrap.querySelector('#spider-thread');
        const body = wrap.querySelector('#spider-body');
        const scuttle = wrap.spiderScuttle;
        const anchor = wrap.querySelector('#spider-anchor');
        if (anchor && body) {
            const eaten = State.data.insectStats.eaten || 0;
            let scale = Math.min(0.7 + (eaten * 0.05), 2.0); // Base size
            const isFull = Date.now() < (State.data.spiderFullUntil || 0);
            if (isFull) {
                scale = scale * 1.6; // Max fatness (60% bigger)
                body.classList.add('spider-fat');
            } else {
                const recentBugs = State.data.spiderEatLog ? State.data.spiderEatLog.length : 0;
                scale = scale * (1 + (recentBugs * 0.20));
                body.classList.remove('spider-fat');
            }
            anchor.style.transform = `scale(${scale.toFixed(2)})`;
        }
        if (scuttle) scuttle.cancel(body);
        body.classList.remove('scuttling-motion', 'spider-paused', 'spider-idle');
        body.classList.add('hunting-scuttle');
        if (this.spiderTimeout) clearTimeout(this.spiderTimeout);
        wrap.classList.add('hunting');
        let phrases = isFood ? GAME_DIALOGUE.spider.hunting : GAME_DIALOGUE.spider.trickedStart;
        const text = phrases[Math.floor(Math.random() * phrases.length)];
        const bub = wrap.showBubble ? wrap.showBubble(text) : null;
        const destX = isFood ? targetXPercent : 88;
        const destY = isFood ? targetYPercent : 20;
        const currentX = parseFloat(wrap.style.left) || 50;
        wrap.style.transition = 'left 1s ease-in-out';
        wrap.style.left = destX + '%';
        setTimeout(() => {
            body.classList.remove('hunting-scuttle');
            const anchor = document.getElementById('spider-anchor');
            let scale = 1;
            if (anchor && anchor.style.transform) {
                const match = anchor.style.transform.match(/scale\(([^)]+)\)/);
                if (match) scale = parseFloat(match[1]);
            }
            // Spider wrap is at top: -15vh, so thread must drop (15 + destY) vh to reach destY vh
            // The spider body has margin-top: -10px, so add ~1vh to compensate
            const dropVH = 15 + destY + 1;
            thread.style.transition = 'none';
            thread.style.height = '0';
            void thread.offsetWidth; // Force reflow
            thread.style.transition = 'height 2s cubic-bezier(0.45, 0, 0.55, 1)';
            thread.style.height = dropVH + 'vh';
            setTimeout(() => {
                    if (isFood && MosquitoManager.state === 'stuck') {
                        MosquitoManager.eat();
                        if(wrap.showBubble) wrap.showBubble("YUM!");
                        const anchor = wrap.querySelector('#spider-anchor');
                        if (anchor) {
                            const now = Date.now();
                            const oneHourAgo = now - (60 * 60 * 1000);
                            const recentBugs = (State.data.spiderEatLog || []).filter(t => t > oneHourAgo).length;
                            const maxBugs = 5;
                            const cappedBugs = Math.min(recentBugs, maxBugs);
                            UIManager.showPostVoteMessage(`🕷️ ${recentBugs} bug${recentBugs !== 1 ? 's' : ''} in belly!`);
                            const baseFontSize = 3; // rem
                            const newFontSize = baseFontSize + (cappedBugs * 0.6); // 3rem -> 6rem over 5 bugs
                            const bulgeFontSize = newFontSize * 1.2;
                            body.style.transition = 'font-size 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
                            body.style.fontSize = bulgeFontSize.toFixed(2) + 'rem';
                            setTimeout(() => {
                                if (body) {
                                    body.style.fontSize = newFontSize.toFixed(2) + 'rem';
                                }
                            }, 300);
                            if (cappedBugs >= maxBugs) {
                                body.classList.add('spider-fat');
                            }
                        }
                        if (body) body.style.animation = 'shake 0.2s ease-in-out';
                        setTimeout(() => {
                            if (body) body.style.animation = '';
                        }, 500);
                        setTimeout(() => {
                            this.retreatSpider(thread, wrap, bub, '2s');
                        }, 5000);
                    }
                    else if (isFood) {
                        const missedPhrases = GAME_DIALOGUE.spider.missed || ["Too slow!", "My lunch!"];
                        const missedText = missedPhrases[Math.floor(Math.random() * missedPhrases.length)];
                        if(wrap.showBubble) wrap.showBubble(missedText);
                        body.style.animation = 'shake 0.5s ease-in-out';
                        setTimeout(() => {
                            body.style.animation = '';
                            this.retreatSpider(thread, wrap, bub, '2s');
                        }, 1500);
                    }
                    else {
                        const angryPhrases = GAME_DIALOGUE.spider.trickedEnd;
                        const angryText = angryPhrases[Math.floor(Math.random() * angryPhrases.length)];
                        if(wrap.showBubble) wrap.showBubble(angryText);
                        body.style.animation = 'shake 0.3s ease-in-out';
                        setTimeout(() => {
                            body.style.animation = '';
                            this.retreatSpider(thread, wrap, bub, '4s');
                        }, 1500);
                    }
                }, 2000); // Wait for drop animation
            }, 1000); // Wait for horizontal movement
    },
    spiderFall(wrap, thread, body, bub) {
        if(bub) {
            bub.style.opacity = '0';
            setTimeout(() => bub.remove(), 300);
        }
        thread.style.transition = 'height 0.8s cubic-bezier(0.55, 0.085, 0.68, 0.53), opacity 0s linear';
        thread.style.opacity = '0';
        requestAnimationFrame(() => { thread.style.height = '120vh'; });
        setTimeout(() => {
            thread.style.transition = 'none';
            wrap.style.transition = 'none';
            wrap.style.left = '88%';
            thread.style.height = '120vh';
            void wrap.offsetWidth;
            thread.style.opacity = '1';
            requestAnimationFrame(() => {
                thread.style.transition = 'height 5s ease-in-out';
                thread.style.height = '0';
            });
            wrap.classList.remove('hunting');
            setTimeout(() => this.halloween(true), 6000);
        }, 1500);
    },
    retreatSpider(thread, wrap, bub, duration) {
        thread.style.transition = `height ${duration} ease-in-out`;
        requestAnimationFrame(() => { thread.style.height = '0'; });
        setTimeout(() => {
            if(bub) bub.remove();
            wrap.classList.remove('hunting');
            this.halloween(true);
        }, parseFloat(duration) * 1000);
    },
    ballpit(active) {
        const c = DOM.theme.effects.ballpit;
        if (this.ballLoop) cancelAnimationFrame(this.ballLoop);
        if (!active) { c.innerHTML = ''; window.removeEventListener('deviceorientation', Physics.handleOrientation); return }
        window.addEventListener('deviceorientation', Physics.handleOrientation);
        c.innerHTML = '';
        Physics.balls = [];
        const colors = ['#ef4444', '#3b82f6', '#eab308', '#22c55e', '#a855f7'];
        const rareItems = ['💩', '🐧', '🦂', '🍄', '💉', '💎'];
        const rareMap = { '💩': 'poop', '🐧': 'penguin', '🦂': 'scorpion', '🍄': 'mushroom', '💉': 'needle', '💎': 'diamond' };
        const r = 30;
        const W = window.innerWidth, H = window.innerHeight;
        const cylW = Math.min(W, 500);
        const minX = (W - cylW) / 2, maxX = minX + cylW - r * 2;
        const showThought = (ballObj, cont) => {
            const b = document.createElement('div');
            b.className = 'thought-bubble';
            b.innerHTML = cont || "Because we're grown-ups now, and it's our turn to decide what that means.";
            b.innerHTML += '<div class="dot-1"></div><div class="dot-2"></div>';
            document.body.appendChild(b);
            ballObj.bubble = b;
            requestAnimationFrame(() => b.style.opacity = '1');
            setTimeout(() => {
                b.style.opacity = '0';
                setTimeout(() => { b.remove(); ballObj.bubble = null }, 300)
            }, 4000)
        };
        const addBall = (type) => {
            const el = document.createElement('div');
            el.className = 'ball-particle';
            el.style.cssText = `width:${r*2}px;height:${r*2}px;will-change:transform;`;
            let content = '';
            if (type === 'germ') {
                content = '🦠';
                el.title = "Click me!";
                el.classList.add('interactable-ball');
                el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
            } else if (type === 'rare') {
                content = rareItems[Math.floor(Math.random() * rareItems.length)];
                el.classList.add('interactable-ball');
                el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
            } else {
                el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
            }
            if (content) el.innerHTML = `<span class="ball-content">${content}</span>`;
            c.appendChild(el);
            const b = { el, x: minX + Math.random() * (maxX - minX), y: Math.random() * (H / 2), vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10, r, drag: false, lastX: 0, lastY: 0, bubble: null, type, content };
            Physics.balls.push(b);
            let sx = 0, sy = 0;
            el.onpointerdown = (e) => {
                b.drag = true;
                b.vx = b.vy = 0;
                b.lastX = e.clientX;
                b.lastY = e.clientY;
                sx = e.clientX;
                sy = e.clientY;
                e.preventDefault();
                el.setPointerCapture(e.pointerId);
            };
            el.onpointerup = (e) => {
                b.drag = false;
                if ((type === 'germ' || type === 'rare') && Math.abs(e.clientX - sx) < 50 && Math.abs(e.clientY - sy) < 50) {
                    if (type === 'germ') State.unlockBadge('germ');
                    if (type === 'rare' && rareMap[content]) State.unlockBadge(rareMap[content]);
                    showThought(b, type === 'rare' ? `<span style="font-size:2em">${content}</span>` : null)
                }
            };
            el.onpointermove = (e) => {
                if (b.drag) {
                    b.vx = (e.clientX - b.lastX) * 0.5;
                    b.vy = (e.clientY - b.lastY) * 0.5;
                    b.x = e.clientX - b.r;
                    b.y = e.clientY - b.r;
                    b.lastX = e.clientX;
                    b.lastY = e.clientY;
                }
            };
        };
        for (let i = 0; i < 50; i++) addBall(Math.random() < 0.008 ? 'rare' : 'normal');
        for (let i = 0; i < 4; i++) addBall('germ');
        Physics.run()
    },
    space(active) {
        const c = DOM.theme.effects.space;
        if (this.spaceRareTimeout) clearTimeout(this.spaceRareTimeout);
        if (!active) { c.innerHTML = ''; return; }
        c.innerHTML = '';
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
        createPlanet(120, '10%', '15%', ['#ff6b6b', '#7209b7'], true);
        createPlanet(80, '85%', '60%', ['#4cc9f0', '#4361ee'], false);
        createPlanet(40, '20%', '80%', ['#fee440', '#f15bb5'], false);
        createPlanet(200, '-5%', '60%', ['#1b1b1b', '#3a3a3a'], true);
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
                e.stopPropagation(); e.preventDefault();
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
            this.spaceRareTimeout = setTimeout(spawnRock, Math.random() * 12000 + 8000);
        };
        this.spaceRareTimeout = setTimeout(spawnRock, 3000);
    },
    woodlandTimeout: null,
    woodlandCreatureTimeout: null,
    woodland(active) {
        const c = DOM.theme.effects.woodland;
        if (this.woodlandTimeout) clearTimeout(this.woodlandTimeout);
        if (this.woodlandCreatureTimeout) clearTimeout(this.woodlandCreatureTimeout);
        if (!active) {
            c.innerHTML = '';
            return;
        }
        c.innerHTML = '';
        const hour = new Date().getHours();
        let timeOfDay, lightColor, lightOpacity, bgGradient;
        if (hour >= 5 && hour < 8) {
            timeOfDay = 'dawn';
            lightColor = 'rgba(255, 200, 150, 0.3)';
            lightOpacity = 0.4;
            bgGradient = 'linear-gradient(180deg, #ffd89b 0%, #b8d4a8 30%, #5a7247 100%)';
        } else if (hour >= 8 && hour < 17) {
            timeOfDay = 'day';
            lightColor = 'rgba(255, 255, 200, 0.25)';
            lightOpacity = 0.5;
            bgGradient = 'linear-gradient(180deg, #87ceeb 0%, #98d4a5 30%, #4a6741 100%)';
        } else if (hour >= 17 && hour < 20) {
            timeOfDay = 'dusk';
            lightColor = 'rgba(255, 150, 100, 0.35)';
            lightOpacity = 0.3;
            bgGradient = 'linear-gradient(180deg, #ff7e5f 0%, #feb47b 30%, #4a5240 100%)';
        } else {
            timeOfDay = 'night';
            lightColor = 'rgba(100, 120, 180, 0.2)';
            lightOpacity = 0.15;
            bgGradient = 'linear-gradient(180deg, #1a1a2e 0%, #16213e 30%, #1f3a28 100%)';
        }
        c.style.cssText = `
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 0;
            overflow: hidden;
            background: ${bgGradient};
        `;
        const floor = document.createElement('div');
        floor.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 25%;
            background: linear-gradient(180deg, transparent 0%, #3d2914 30%, #2a1f0f 100%);
        `;
        c.appendChild(floor);
        for (let i = 0; i < 20; i++) {
            const leaf = document.createElement('div');
            const leafEmojis = ['🍂', '🍁', '🍃'];
            leaf.textContent = leafEmojis[Math.floor(Math.random() * leafEmojis.length)];
            leaf.style.cssText = `
                position: absolute;
                bottom: ${Math.random() * 15}%;
                left: ${Math.random() * 100}%;
                font-size: ${Math.random() * 12 + 10}px;
                opacity: ${Math.random() * 0.4 + 0.3};
                transform: rotate(${Math.random() * 360}deg);
            `;
            c.appendChild(leaf);
        }
        const createTree = (left, size, zIndex) => {
            const tree = document.createElement('div');
            const xOffset = Math.random() * 10 - 5;
            tree.style.cssText = `
                position: absolute;
                bottom: 12%;
                ${left ? 'left' : 'right'}: ${xOffset}%;
                width: ${size * 1.5}px;
                height: ${size * 3}px;
                z-index: ${zIndex};
            `;
            const trunk = document.createElement('div');
            const trunkW = size * 0.18;
            trunk.style.cssText = `
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: ${trunkW}px;
                height: ${size * 1.2}px;
                background: linear-gradient(90deg,
                    #1a1208 0%,
                    #3d2914 20%,
                    #5a4025 40%,
                    #3d2914 60%,
                    #2a1f0f 80%,
                    #1a1208 100%);
                border-radius: 3px 3px 8px 8px;
                box-shadow: inset -3px 0 8px rgba(0,0,0,0.4), inset 3px 0 8px rgba(0,0,0,0.2);
            `;
            for (let b = 0; b < 6; b++) {
                const line = document.createElement('div');
                line.style.cssText = `
                    position: absolute;
                    left: ${20 + Math.random() * 60}%;
                    top: ${b * 16 + Math.random() * 5}%;
                    width: 2px;
                    height: ${8 + Math.random() * 12}px;
                    background: rgba(0,0,0,0.3);
                    border-radius: 1px;
                `;
                trunk.appendChild(line);
            }
            tree.appendChild(trunk);
            const foliageColors = timeOfDay === 'night'
                ? ['#0d1f0d', '#152515', '#1a2f1a', '#0f1a0f']
                : ['#1e4d1e', '#2d5a2d', '#3a6b3a', '#275227', '#1f4a1f'];
            const clusters = 8 + Math.floor(Math.random() * 5);
            for (let i = 0; i < clusters; i++) {
                const cluster = document.createElement('div');
                const clusterSize = size * (0.4 + Math.random() * 0.35);
                const angle = (i / clusters) * Math.PI * 2;
                const radius = size * (0.3 + Math.random() * 0.25);
                const cx = Math.cos(angle) * radius;
                const cy = Math.sin(angle) * radius * 0.6;
                const baseY = size * 1.4;
                cluster.style.cssText = `
                    position: absolute;
                    bottom: ${baseY + cy}px;
                    left: calc(50% + ${cx}px);
                    transform: translateX(-50%);
                    width: ${clusterSize}px;
                    height: ${clusterSize * 0.85}px;
                    background: radial-gradient(ellipse at 30% 30%,
                        ${foliageColors[Math.floor(Math.random() * foliageColors.length)]} 0%,
                        ${foliageColors[Math.floor(Math.random() * foliageColors.length)]} 70%,
                        transparent 100%);
                    border-radius: 50% 50% 45% 55% / 60% 55% 45% 40%;
                    filter: blur(0.5px);
                `;
                tree.appendChild(cluster);
            }
            const centerCluster = document.createElement('div');
            centerCluster.style.cssText = `
                position: absolute;
                bottom: ${size * 1.5}px;
                left: 50%;
                transform: translateX(-50%);
                width: ${size * 0.7}px;
                height: ${size * 0.6}px;
                background: radial-gradient(ellipse at 40% 35%,
                    ${foliageColors[1]} 0%,
                    ${foliageColors[0]} 60%,
                    transparent 100%);
                border-radius: 50%;
            `;
            tree.appendChild(centerCluster);
            const topCluster = document.createElement('div');
            topCluster.style.cssText = `
                position: absolute;
                bottom: ${size * 2}px;
                left: 50%;
                transform: translateX(-50%);
                width: ${size * 0.5}px;
                height: ${size * 0.45}px;
                background: radial-gradient(ellipse at 35% 30%,
                    ${foliageColors[2]} 0%,
                    ${foliageColors[0]} 70%,
                    transparent 100%);
                border-radius: 45% 55% 50% 50% / 60% 60% 40% 40%;
            `;
            tree.appendChild(topCluster);
            return tree;
        };
        c.appendChild(createTree(true, 130, 3));
        c.appendChild(createTree(true, 90, 2));
        c.appendChild(createTree(true, 60, 1));
        c.appendChild(createTree(false, 110, 3));
        c.appendChild(createTree(false, 75, 2));
        c.appendChild(createTree(false, 50, 1));
        const hidingSpots = [];
        const spotTypes = [
            { emoji: '🪨', name: 'rock', width: 60, height: 40 },
            { emoji: '🪵', name: 'log', width: 80, height: 35 },
            { emoji: '🌳', name: 'bush', width: 50, height: 50 }
        ];
        for (let i = 0; i < 5; i++) {
            const spotType = spotTypes[Math.floor(Math.random() * spotTypes.length)];
            const spot = document.createElement('div');
            const leftPos = 15 + (i * 17) + (Math.random() * 10 - 5);
            spot.className = 'woodland-hiding-spot';
            spot.style.cssText = `
                position: absolute;
                bottom: ${12 + Math.random() * 8}%;
                left: ${leftPos}%;
                font-size: ${spotType.width * 0.6}px;
                z-index: 10;
                cursor: default;
                filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.4));
                transition: transform 0.2s;
            `;
            spot.textContent = spotType.emoji;
            c.appendChild(spot);
            hidingSpots.push({ el: spot, left: leftPos, creature: null });
        }
        const lightOverlay = document.createElement('div');
        lightOverlay.style.cssText = `
            position: absolute;
            inset: 0;
            pointer-events: none;
            z-index: 5;
        `;
        for (let i = 0; i < 6; i++) {
            const beam = document.createElement('div');
            const leftPos = 10 + i * 15 + Math.random() * 10;
            beam.style.cssText = `
                position: absolute;
                top: 0;
                left: ${leftPos}%;
                width: ${20 + Math.random() * 30}px;
                height: 100%;
                background: linear-gradient(180deg, ${lightColor} 0%, transparent 70%);
                opacity: ${lightOpacity};
                transform: skewX(${(Math.random() - 0.5) * 20}deg);
                animation: woodlandLightSway ${8 + Math.random() * 4}s ease-in-out infinite alternate;
            `;
            lightOverlay.appendChild(beam);
        }
        c.appendChild(lightOverlay);
        if (!document.getElementById('woodland-styles')) {
            const style = document.createElement('style');
            style.id = 'woodland-styles';
            style.textContent = `
                @keyframes woodlandLightSway {
                    0% { transform: skewX(-5deg) translateX(-10px); opacity: ${lightOpacity}; }
                    100% { transform: skewX(5deg) translateX(10px); opacity: ${lightOpacity * 0.7}; }
                }
                @keyframes creaturePeek {
                    0%, 100% { transform: translateY(100%) scale(0.8); opacity: 0; }
                    10%, 90% { transform: translateY(0) scale(1); opacity: 1; }
                }
                @keyframes creatureEyes {
                    0%, 90%, 100% { opacity: 0; }
                    30%, 70% { opacity: 1; }
                }
                .woodland-creature {
                    animation: creaturePeek 6s ease-in-out forwards;
                }
                .woodland-hiding-spot:hover {
                    transform: scale(1.05);
                }
            `;
            document.head.appendChild(style);
        }
        const creatures = ['🐿️', '🦊', '🐺', '🦉', '🦔', '🐁'];
        const creatureMessages = {
            '🐿️': 'A curious squirrel watches you!',
            '🦊': 'A sly fox peeks out!',
            '🐺': 'A wolf observes from afar...',
            '🦉': 'Hoo! An owl spots you!',
            '🦔': 'A hedgehog snuffles about!',
            '🐁': 'A tiny mouse scurries by!'
        };
        const spawnCreature = () => {
            if (State.runtime.currentTheme !== 'woodland') return;
            const emptySpots = hidingSpots.filter(s => !s.creature);
            if (emptySpots.length === 0) {
                this.woodlandCreatureTimeout = setTimeout(spawnCreature, 5000);
                return;
            }
            const spot = emptySpots[Math.floor(Math.random() * emptySpots.length)];
            const creature = creatures[Math.floor(Math.random() * creatures.length)];
            const nightCreatures = ['🦉', '🐺'];
            const activeCreature = timeOfDay === 'night'
                ? nightCreatures[Math.floor(Math.random() * nightCreatures.length)]
                : creature;
            const critterEl = document.createElement('div');
            critterEl.className = 'woodland-creature';
            critterEl.textContent = activeCreature;
            critterEl.style.cssText = `
                position: absolute;
                bottom: ${parseInt(spot.el.style.bottom) + 3}%;
                left: ${spot.left + 2}%;
                font-size: 28px;
                z-index: 9;
                pointer-events: auto;
                cursor: pointer;
                filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.4));
            `;
            if (timeOfDay === 'night' && (activeCreature === '🦉' || activeCreature === '🐺')) {
                const eyes = document.createElement('div');
                eyes.style.cssText = `
                    position: absolute;
                    top: 25%;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 20px;
                    height: 8px;
                    display: flex;
                    justify-content: space-between;
                    animation: creatureEyes 6s ease-in-out forwards;
                `;
                eyes.innerHTML = `
                    <div style="width:6px;height:6px;background:rgba(255,255,100,0.9);border-radius:50%;box-shadow:0 0 8px rgba(255,255,100,0.8);"></div>
                    <div style="width:6px;height:6px;background:rgba(255,255,100,0.9);border-radius:50%;box-shadow:0 0 8px rgba(255,255,100,0.8);"></div>
                `;
                critterEl.appendChild(eyes);
            }
            spot.creature = critterEl;
            c.appendChild(critterEl);
            critterEl.onclick = (e) => {
                e.stopPropagation();
                UIManager.showPostVoteMessage(creatureMessages[activeCreature] || 'A woodland creature!');
                critterEl.style.animation = 'none';
                critterEl.style.transform = 'scale(1.3)';
                critterEl.style.opacity = '0';
                setTimeout(() => {
                    critterEl.remove();
                    spot.creature = null;
                }, 300);
            };
            setTimeout(() => {
                if (critterEl.parentNode) {
                    critterEl.remove();
                    spot.creature = null;
                }
            }, 6000);
            const nextDelay = timeOfDay === 'night' ? 15000 : 8000;
            this.woodlandCreatureTimeout = setTimeout(spawnCreature, Math.random() * nextDelay + 5000);
        };
        this.woodlandCreatureTimeout = setTimeout(spawnCreature, 3000);
        for (let i = 0; i < (timeOfDay === 'night' ? 15 : 8); i++) {
            const particle = document.createElement('div');
            const isFirefly = timeOfDay === 'night' || timeOfDay === 'dusk';
            particle.style.cssText = `
                position: absolute;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 70}%;
                width: ${isFirefly ? 4 : 2}px;
                height: ${isFirefly ? 4 : 2}px;
                background: ${isFirefly ? 'rgba(200, 255, 100, 0.9)' : 'rgba(255, 255, 200, 0.6)'};
                border-radius: 50%;
                ${isFirefly ? 'box-shadow: 0 0 6px rgba(200, 255, 100, 0.8);' : ''}
                animation: float${i} ${10 + Math.random() * 10}s ease-in-out infinite;
                z-index: 6;
            `;
            const style = document.createElement('style');
            style.textContent = `
                @keyframes float${i} {
                    0%, 100% {
                        transform: translate(0, 0) scale(1);
                        opacity: ${isFirefly ? 0.3 : 0.5};
                    }
                    25% {
                        transform: translate(${Math.random() * 40 - 20}px, ${Math.random() * 30 - 15}px) scale(${isFirefly ? 1.2 : 1});
                        opacity: ${isFirefly ? 1 : 0.7};
                    }
                    50% {
                        transform: translate(${Math.random() * 40 - 20}px, ${Math.random() * 30 - 15}px) scale(1);
                        opacity: ${isFirefly ? 0.2 : 0.4};
                    }
                    75% {
                        transform: translate(${Math.random() * 40 - 20}px, ${Math.random() * 30 - 15}px) scale(${isFirefly ? 1.3 : 1});
                        opacity: ${isFirefly ? 0.9 : 0.6};
                    }
                }
            `;
            document.head.appendChild(style);
            c.appendChild(particle);
        }
        for (let i = 0; i < 4; i++) {
            const mushroom = document.createElement('div');
            mushroom.textContent = '🍄';
            mushroom.style.cssText = `
                position: absolute;
                bottom: ${10 + Math.random() * 5}%;
                left: ${10 + Math.random() * 80}%;
                font-size: ${12 + Math.random() * 8}px;
                opacity: 0.8;
                z-index: 3;
                filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.3));
            `;
            c.appendChild(mushroom);
        }
    },
    flightTimeout: null,
    flightObjects: [],

flight(active) {
        let c = DOM.theme.effects.flight;
        if (!c) {
            c = document.createElement('div');
            c.id = 'flight-effect';
            c.className = 'fixed inset-0 pointer-events-none overflow-hidden z-0';
            document.body.appendChild(c);
            DOM.theme.effects.flight = c;
        }

        // --- CLEANUP ---
        if (this.flightTimeout) clearTimeout(this.flightTimeout);
        if (this.bankInterval) clearInterval(this.bankInterval);
        if (this.objectSpawnInterval) clearInterval(this.objectSpawnInterval);
        if (this.groundSpawnInterval) clearInterval(this.groundSpawnInterval);
        if (this.wiperInterval) clearInterval(this.wiperInterval);
        this.flightObjects.forEach(obj => obj.remove());
        this.flightObjects = [];

        // Stop Audio
        if (this.engineAudio) {
            this.engineAudio.pause();
            this.engineAudio = null;
        }

        if (!active) { c.innerHTML = ''; c.style.background = ''; return; }

        // --- AUDIO ---
        if (!State.data.settings.muteSounds) {
             try {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                const lfo = audioCtx.createOscillator();
                const lfoGain = audioCtx.createGain();
                
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(55, audioCtx.currentTime); 
                lfo.type = 'sine';
                lfo.frequency.setValueAtTime(8, audioCtx.currentTime);
                lfoGain.gain.setValueAtTime(15, audioCtx.currentTime);
                lfo.connect(lfoGain);
                lfoGain.connect(oscillator.frequency);
                gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                oscillator.start();
                lfo.start();
                this.engineAudio = { pause: () => { oscillator.stop(); lfo.stop(); audioCtx.close(); } };
             } catch(e) {}
        }

        c.innerHTML = '';

        // =========================================
        // LAYER 1: WORLD 
        // =========================================
        const worldContainer = document.createElement('div');
        worldContainer.style.cssText = `
            position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
            transform-origin: center center; will-change: transform;
            z-index: 0;
        `;

        // SKY
        const sky = document.createElement('div');
        sky.style.cssText = `position: absolute; inset: 0; background: linear-gradient(to bottom, #0d47a1 0%, #42a5f5 50%, #e3f2fd 100%);`;
        worldContainer.appendChild(sky);

        // SUN
        const sun = document.createElement('div');
        sun.style.cssText = `
            position: absolute; top: 20%; left: 70%; width: 80px; height: 80px;
            background: #fff; border-radius: 50%;
            box-shadow: 0 0 60px rgba(255,255,255,0.9);
        `;
        worldContainer.appendChild(sun);

        // DISTANT CLOUDS
        const distantSky = document.createElement('div');
        distantSky.style.cssText = `position: absolute; top: 0; left: 0; width: 100%; height: 50%; overflow: hidden;`;
        for(let i=0; i<6; i++) {
            const cloud = document.createElement('div');
            cloud.innerText = Math.random() > 0.5 ? '☁️' : '🌥️';
            cloud.style.cssText = `
                position: absolute; top: ${38 + Math.random() * 8}%; left: ${Math.random() * 100}%;
                font-size: ${20 + Math.random() * 30}px; opacity: 0.6;
                filter: blur(1px); transition: left 1s linear;
            `;
            cloud.dataset.speed = 0.01 + Math.random() * 0.02;
            cloud.dataset.pos = parseFloat(cloud.style.left);
            distantSky.appendChild(cloud);
        }
        worldContainer.appendChild(distantSky);

        // --- MOUNTAINS ---
        const createMountainLayer = (svg, top, height, z, opacity) => {
            const cont = document.createElement('div');
            cont.style.cssText = `position: absolute; top: ${top}%; left: 0; width: 100%; height: ${height}%; z-index: ${z}; opacity: ${opacity}; pointer-events: none;`;
            const p1 = document.createElement('div');
            p1.style.cssText = `position: absolute; top: 0; left: 0; width: 100%; height: 100%; will-change: transform;`;
            p1.innerHTML = svg;
            const p2 = document.createElement('div');
            p2.style.cssText = `position: absolute; top: 0; left: 100%; width: 100%; height: 100%; will-change: transform;`;
            p2.innerHTML = svg;
            cont.appendChild(p1);
            cont.appendChild(p2);
            return { cont, p1, p2 };
        };

        const svgBack = `
        <svg viewBox="0 0 1200 100" preserveAspectRatio="none" style="width:100%; height:100%;">
            <path d="M0,100 L0,70 L200,45 L400,80 L600,40 L800,75 L1000,45 L1200,70 L1200,100 Z" fill="#546e7a"/>
            <path d="M200,45 L257,55 L240,52 L220,58 L200,53 L180,58 L160,52 L120,55 Z" fill="white" opacity="0.9"/>
            <path d="M600,40 L685,55 L660,50 L640,58 L620,52 L600,58 L580,50 L525,55 Z" fill="white" opacity="0.9"/>
            <path d="M1000,45 L1080,55 L1060,50 L1040,58 L1020,52 L1000,58 L980,50 L933,55 Z" fill="white" opacity="0.9"/>
        </svg>`;
        const mtnBack = createMountainLayer(svgBack, 40, 20, 1, 1.0);
        worldContainer.appendChild(mtnBack.cont);

        const svgFront = `
        <svg viewBox="0 0 1200 100" preserveAspectRatio="none" style="width:100%; height:100%;">
            <path d="M0,100 L0,85 L300,55 L500,90 L800,60 L1100,90 L1200,80 L1200,100 Z" fill="#5d4037"/>
            <path d="M300,55 L357,65 L340,62 L320,68 L300,63 L280,68 L260,62 L200,65 Z" fill="white" opacity="0.8"/>
            <path d="M800,60 L900,70 L880,66 L850,74 L820,68 L790,74 L750,66 L700,70 Z" fill="white" opacity="0.8"/>
        </svg>`;
        const mtnFront = createMountainLayer(svgFront, 50, 15, 2, 1.0);
        worldContainer.appendChild(mtnFront.cont);

        // GROUND (With visible movement grid)
        const ground = document.createElement('div');
        ground.style.cssText = `
            position: absolute; top: 56%; left: -50%; width: 200%; height: 100%;
            background: #2e7d32;
            perspective: 500px; z-index: 3; overflow: hidden;
        `;
        const grid = document.createElement('div');
        // High contrast grid for visibility
        grid.style.cssText = `
            position: absolute; inset: -100%;
            background-image: 
                repeating-linear-gradient(90deg, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.4) 2px, transparent 2px, transparent 100px),
                repeating-linear-gradient(0deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 50px);
            background-size: 200px 200px;
            transform: rotateX(80deg);
        `;
        ground.appendChild(grid);
        
        // GROUND OBJECT CONTAINER
        const groundObjContainer = document.createElement('div');
        groundObjContainer.style.cssText = `position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; perspective: 500px; transform-style: preserve-3d;`;
        ground.appendChild(groundObjContainer);
        
        worldContainer.appendChild(ground);
        c.appendChild(worldContainer);

        // EXTERNAL RAIN
        const externalRainContainer = document.createElement('div');
        externalRainContainer.style.cssText = `position: absolute; inset: 0; pointer-events: none; z-index: 5; overflow: hidden;`;
        c.appendChild(externalRainContainer);

        // OBJECTS
        const objectContainer = document.createElement('div');
        objectContainer.style.cssText = `position: absolute; inset: 0; pointer-events: none; z-index: 6; overflow: hidden;`;
        c.appendChild(objectContainer);

        // =========================================
        // PROPELLER (Z-Index 15 - BEHIND DASHBOARD)
        // =========================================
        const prop = document.createElement('div');
        prop.style.cssText = `
            position: absolute; bottom: 32%; left: 50%; transform: translate(-50%, 50%);
            width: 70vh; height: 70vh; 
            animation: flight-prop-spin 0.15s linear infinite;
            z-index: 15; /* Behind cockpit (20) */
        `;
        prop.innerHTML = `
            <svg viewBox="0 0 200 200" style="width: 100%; height: 100%; overflow: visible;">
                <circle cx="100" cy="100" r="90" fill="url(#propBlur)" opacity="0.2"/>
                <defs><radialGradient id="propBlur"><stop offset="0%" stop-color="transparent"/><stop offset="100%" stop-color="white"/></radialGradient></defs>
                <path d="M96,100 L92,30 Q100,10 108,30 L104,100 Z" fill="#222" stroke="black" stroke-width="3" stroke-linejoin="round" />
                <path d="M92,30 Q100,10 108,30 L107,38 L93,38 Z" fill="#ffeb3b" stroke="black" stroke-width="2" stroke-linejoin="round" />
                <path d="M96,100 L92,170 Q100,190 108,170 L104,100 Z" fill="#222" stroke="black" stroke-width="3" stroke-linejoin="round" />
                <path d="M92,170 Q100,190 108,170 L107,162 L93,162 Z" fill="#ffeb3b" stroke="black" stroke-width="2" stroke-linejoin="round" />
            </svg>
        `;
        c.appendChild(prop);

        // COCKPIT (Z: 20)
        const cockpit = document.createElement('div');
        cockpit.style.cssText = `position: absolute; inset: 0; pointer-events: none; z-index: 20;`;

        const dash = document.createElement('div');
        dash.style.cssText = `position: absolute; bottom: 0; left: 0; width: 100%; height: 40%;`;
        dash.innerHTML = `
            <svg viewBox="0 0 1000 400" preserveAspectRatio="none" style="width: 100%; height: 100%;">
                <defs><linearGradient id="dashMetal" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#37474f"/><stop offset="100%" stop-color="#263238"/></linearGradient></defs>
                <path d="M0,400 L0,100 C100,90 350,90 400,60 C450,40 550,40 600,60 C650,90 900,90 1000,100 L1000,400 Z" fill="url(#dashMetal)" stroke="#102027" stroke-width="4"/>
            </svg>
        `;
        cockpit.appendChild(dash);
        
        // --- INSTRUMENTS: SPREAD LAYOUT ---
        const gauges = document.createElement('div');
        gauges.style.cssText = `
            position: absolute; bottom: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 22;
        `;
        
        const createGauge = (label, color, type) => {
            const g = document.createElement('div');
            g.style.cssText = `width: 90px; height: 90px; border-radius: 50%; background: #111; border: 4px solid #546e7a; position: absolute; box-shadow: inset 0 0 10px #000; overflow: hidden;`;
            if (type === 'horizon') {
                g.innerHTML = `
                    <div id="gauge-horizon-ball" style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: linear-gradient(180deg, #29b6f6 50%, #5d4037 50%); transform: rotate(0deg);"></div>
                    <div style="position: absolute; top: 50%; left: 20%; right: 20%; height: 2px; background: yellow; transform: translateY(-50%); box-shadow: 0 1px 2px #000;"></div>
                    <div style="position: absolute; top: 50%; left: 50%; width: 4px; height: 4px; background: red; border-radius: 50%; transform: translate(-50%, -50%);"></div>
                `;
            } else {
                g.innerHTML = `<div style="position: absolute; bottom: 15px; width: 100%; text-align: center; color: #b0bec5; font-size: 9px; font-weight: bold;">${label}</div>`;
                const needle = document.createElement('div');
                needle.style.cssText = `position: absolute; top: 50%; left: 50%; width: 45%; height: 2px; background: ${color}; transform-origin: 0 50%; transform: rotate(-135deg); transition: transform 0.5s cubic-bezier(0.4, 2.0, 0.4, 1.0); box-shadow: 0 0 4px ${color};`;
                g.appendChild(needle);
                g.needle = needle;
            }
            g.appendChild(document.createElement('div')).style.cssText = `position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%); pointer-events: none;`;
            return g;
        };

const compass = document.createElement('div');
        compass.style.cssText = `position: absolute; bottom: 230px; left: 50%; transform: translateX(-50%); width: 70px; height: 35px; background: #111; border: 3px solid #546e7a; border-radius: 5px; box-shadow: inset 0 0 8px #000; overflow: hidden; z-index: 24;`;
        compass.innerHTML = `
            <div id="compass-tape" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); white-space: nowrap; font-size: 10px; font-weight: bold; color: #b0bec5; font-family: monospace;">
                <span style="color: #ff5722;">N</span>&nbsp;&nbsp;030&nbsp;&nbsp;060&nbsp;&nbsp;<span style="color: #fff;">E</span>&nbsp;&nbsp;120&nbsp;&nbsp;150&nbsp;&nbsp;<span style="color: #ff5722;">S</span>&nbsp;&nbsp;210&nbsp;&nbsp;240&nbsp;&nbsp;<span style="color: #fff;">W</span>&nbsp;&nbsp;300&nbsp;&nbsp;330&nbsp;&nbsp;<span style="color: #ff5722;">N</span>
            </div>
            <div style="position: absolute; top: 0; left: 50%; width: 2px; height: 100%; background: #ffea00; transform: translateX(-50%); box-shadow: 0 0 4px #ffea00;"></div>
            <div style="position: absolute; bottom: 2px; width: 100%; text-align: center; color: #78909c; font-size: 7px;">HDG</div>
        `;
        compass.tape = compass.querySelector('#compass-tape');
        gauges.appendChild(compass);

        // 1. HORIZON (Top Center)
        const att = createGauge("ATT", "", "horizon");
        att.style.bottom = "130px"; 
        att.style.left = "50%";
        att.style.transform = "translateX(-50%)";
        gauges.appendChild(att);

        // 2. SPD (Bottom Left)
        const spd = createGauge("SPD", "#ffea00", "std");
        spd.style.bottom = "20px";
        spd.style.left = "20px";
        gauges.appendChild(spd);

        // 3. ALT (Bottom Right)
        const alt = createGauge("ALT", "#ff1744", "std");
        alt.style.bottom = "20px";
        alt.style.right = "20px";
        gauges.appendChild(alt);

        // 4. LOGO (Bottom Center)
        const logo = document.createElement('div');
        logo.style.cssText = `position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); width: 120px; height: 80px; z-index: 21;`;
        logo.innerHTML = `
            <svg viewBox="0 0 120 80" style="width: 100%; height: 100%; overflow: visible;">
                <defs><linearGradient id="metalFrame" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#78909c"/><stop offset="50%" stop-color="#eceff1"/><stop offset="100%" stop-color="#78909c"/></linearGradient></defs>
                <rect x="4" y="4" width="112" height="72" rx="4" fill="#263238" opacity="0.6" />
                <image href="crying.PNG" x="15" y="15" width="90" height="50" preserveAspectRatio="xMidYMid contain" opacity="0.9"/>
                <rect x="4" y="4" width="112" height="72" rx="4" fill="none" stroke="url(#metalFrame)" stroke-width="5" />
                <g fill="#cfd8dc" stroke="#455a64" stroke-width="1"><circle cx="8" cy="8" r="2.5" /><circle cx="112" cy="8" r="2.5" /><circle cx="8" cy="72" r="2.5" /><circle cx="112" cy="72" r="2.5" /></g>
                <g stroke="#455a64" stroke-width="1"><path d="M6.5,8 L9.5,8 M8,6.5 L8,9.5" /><path d="M110.5,8 L113.5,8 M112,6.5 L112,9.5" /><path d="M6.5,72 L9.5,72 M8,70.5 L8,73.5" /><path d="M110.5,72 L113.5,72 M112,70.5 L112,73.5" /></g>
            </svg>
        `;
        gauges.appendChild(logo);

        // INDICATORS (Above gauges)
        const lightBox = document.createElement('div');
        lightBox.style.cssText = `position: absolute; bottom: 120px; left: 65px; transform: translateX(-50%); width: 20px; height: 20px; border-radius: 50%; background: #222; border: 2px solid #555; box-shadow: 0 0 2px #000; transition: all 0.3s; z-index: 23;`;
        gauges.appendChild(lightBox); // Attached to gauges so it's aligned with SPD

        const connLight = document.createElement('div');
        connLight.style.cssText = `position: absolute; bottom: 120px; right: 65px; transform: translateX(50%); width: 20px; height: 20px; border-radius: 50%; background: #222; border: 2px solid #555; box-shadow: 0 0 2px #000; transition: all 0.3s; z-index: 23;`;
        gauges.appendChild(connLight); // Attached to gauges aligned with ALT

        cockpit.appendChild(gauges);
        c.appendChild(cockpit);

        // WINDSCREEN RAIN (Z: 95) - On glass
        const windscreenRain = document.createElement('div');
        windscreenRain.style.cssText = `position: absolute; inset: 0; pointer-events: none; z-index: 17; overflow: hidden; display: block;`;
        c.appendChild(windscreenRain);

        // WIPER (Z: 16 - Behind Windscreen Rain, In front of Prop)
        const wiper = document.createElement('div');
        wiper.style.cssText = `
            position: absolute; bottom: 40%; left: 50%; width: 0; height: 45vh;
            transform-origin: bottom center; transform: rotate(-50deg);
            z-index: 16; display: block; pointer-events: none;
        `;
        wiper.innerHTML = `<div style="position: absolute; bottom: 0; left: -6px; width: 12px; height: 100%; background: #111; border-radius: 6px; box-shadow: 2px 0 4px rgba(0,0,0,0.5); display: flex; justify-content: center; padding-top: 4px; padding-bottom: 4px;"><div style="width: 2px; height: 100%; background: #666; opacity: 0.8;"></div></div><div style="position: absolute; bottom: -6px; left: -9px; width: 18px; height: 18px; background: #222; border-radius: 50%; border: 2px solid #000; box-shadow: 0 2px 4px rgba(0,0,0,0.8);"></div>`;
        c.appendChild(wiper);

        // --- ANIMATIONS ---
        if(!document.getElementById('flight-anims')) {
            const s = document.createElement('style');
            s.id = 'flight-anims';
            s.innerHTML = `
                @keyframes flight-prop-spin { from { transform: translate(-50%, 50%) rotate(0deg); } to { transform: translate(-50%, 50%) rotate(360deg); } }
                @keyframes flight-wiper-move { 0%, 100% { transform: rotate(-50deg); } 50% { transform: rotate(50deg); } }
                @keyframes flight-streak-fall { 0% { transform: translateY(-100px); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(120vh); opacity: 0; } }
                @keyframes flight-drop-appear { 0% { opacity: 0; transform: scale(0.5); } 100% { opacity: 1; transform: scale(1); } }
                @keyframes flight-drop-streak-right { 0% { opacity: 1; transform: scaleX(1) translateX(0); } 100% { opacity: 0; transform: scaleX(4) translateX(30px); } }
                @keyframes flight-drop-streak-left { 0% { opacity: 1; transform: scaleX(1) translateX(0); } 100% { opacity: 0; transform: scaleX(4) translateX(-30px); } }
                @keyframes fly-approach { 0% { transform: translate(-50%, -50%) scale(0.01); opacity: 0; } 10% { opacity: 1; } 100% { transform: translate(var(--dx), var(--dy)) scale(6); opacity: 1; } }
                /* GROUND SCALING */
                @keyframes ground-obj-pass { 
                    0% { transform: translate(-50%, 0) scale(0.1); opacity: 0; bottom: 100%; } 
                    10% { opacity: 1; } 
                    100% { transform: translate(-50%, 0) scale(8); opacity: 1; bottom: -50px; } 
                }
            `;
            document.head.appendChild(s);
        }

        const horizonBall = document.getElementById('gauge-horizon-ball');
        let flightTime = 0;
        let headingOffset = 0;
        let altitude = 1000;
        let groundY = 0;

        // --- LOGIC LOOP ---
        const logicLoop = () => {
            if(!document.body.contains(c)) return;
            flightTime += 0.005;
            
            // 1. ENGINE POWER
            const block = Math.floor(flightTime / 9.0);
            const targetPower = 0.7 + (Math.sin(block * 123.4) * 0.15); 
            let enginePower = parseFloat(prop.dataset.pwr || 0.7);
            enginePower += (targetPower - enginePower) * 0.01;
            prop.dataset.pwr = enginePower;
            prop.style.animationDuration = `${0.4 - (enginePower * 0.25)}s`;

            // 2. BANK & PITCH (Larger Amplitude)
            const bankCycle = flightTime * 0.15;
            let bank = 0;
            const cyclePos = bankCycle % 1;
            if (cyclePos < 0.2) bank = 0;
            else if (cyclePos < 0.4) bank = -Math.sin(((cyclePos - 0.2) / 0.2) * Math.PI) * 12;
            else if (cyclePos < 0.6) bank = 0;
            else if (cyclePos < 0.8) bank = Math.sin(((cyclePos - 0.6) / 0.2) * Math.PI) * 12;
            
            // Pitch Oscillation (Stronger)
            const pitch = Math.sin(flightTime * 0.5) * 5.0; // +/- 5% translate
            
            // Altitude changes with pitch
            altitude += pitch;
            if (altitude < 0) altitude = 0;
            if (altitude > 2000) altitude = 2000;

            // 3. WORLD TRANSFORMS
            worldContainer.style.transform = `rotate(${-bank}deg) translateY(${pitch}%)`;
            
            // GROUND SPEED (Depends on pitch)
            // Pitch > 0 (Up) -> Slow down. Pitch < 0 (Down) -> Speed up.
            let groundSpeed = 15 - (pitch * 2); 
            groundY += groundSpeed;
            grid.style.backgroundPositionY = `${groundY}px`;

            if (Math.abs(bank) > 0.5) headingOffset += bank * 0.5;
            const farScroll = (headingOffset * -0.5) % 2000; 
            mtnBack.p1.style.transform = `translateX(${farScroll}px)`;
            mtnBack.p2.style.transform = `translateX(${farScroll + 2000}px)`; 
            const nearScroll = (headingOffset * -1) % 2000;
            mtnFront.p1.style.transform = `translateX(${nearScroll}px)`;
            mtnFront.p2.style.transform = `translateX(${nearScroll + 2000}px)`;

            Array.from(distantSky.children).forEach(cloud => {
                let pos = parseFloat(cloud.dataset.pos);
                pos += parseFloat(cloud.dataset.speed);
                if(pos > 110) pos = -10;
                cloud.dataset.pos = pos;
                cloud.style.left = pos + '%';
            });

if (compass.tape) {
                const bearing = ((headingOffset * 0.5) % 360 + 360) % 360;
                const tapeOffset = (bearing / 360) * 280; // Map 360deg to pixel width of tape
                compass.tape.style.transform = `translate(calc(-50% - ${tapeOffset}px), -50%)`;
            }

            // 4. GAUGES
            if (horizonBall) horizonBall.style.transform = `rotate(${-bank}deg) translateY(${pitch * 2}px)`; 
            
            // SPEED PHYSICS + JITTER
            let spdAngle = -135 + (enginePower * 220); 
            spdAngle -= (pitch * 10); // Pitch UP (pos) -> Reduce Angle (Slow). Pitch DOWN -> Increase Angle (Fast)
            spdAngle += (Math.random() * 4 - 2); 
            
            if (spd.needle) {
                spd.needle.style.transition = 'none'; 
                spd.needle.style.transform = `rotate(${spdAngle}deg)`;
            }
            
            const altAngle = -135 + (altitude / 2000 * 270);
            if (alt.needle) alt.needle.style.transform = `rotate(${altAngle}deg)`;

            requestAnimationFrame(logicLoop);
        };
        logicLoop();

        // SPAWNERS
        const spawnObject = () => {
            if(!document.body.contains(c)) return;
            const el = document.createElement('div');
            const isCloud = Math.random() > 0.4;
            const skyEmojis = ['🦅', '🦆', '✈️', '🛸', '🎈'];
            const destX = (Math.random() - 0.5) * 200 + "vw";
            const destY = (Math.random() - 0.2) * 100 + "vh";
            if(isCloud) {
                el.style.cssText = `position: absolute; top: 50%; left: 50%; width: 60px; height: 40px; background: #fff; border-radius: 50px; filter: blur(4px); box-shadow: 15px -8px 0 5px #fff, -15px 5px 0 5px #fff; --dx: ${destX}; --dy: ${destY}; animation: fly-approach 6s linear forwards;`;
            } else {
                el.innerHTML = skyEmojis[Math.floor(Math.random() * skyEmojis.length)];
                el.style.cssText = `position: absolute; top: 50%; left: 50%; font-size: 10px; text-shadow: 0 0 2px rgba(255,255,255,0.5); --dx: ${destX}; --dy: ${destY}; animation: fly-approach 6s linear forwards;`;
            }
            objectContainer.appendChild(el);
            setTimeout(() => el.remove(), 6000);
        };
        this.objectSpawnInterval = setInterval(spawnObject, 3000);

        const spawnGroundObject = () => {
            if(!document.body.contains(c)) return;
            const el = document.createElement('div');
            const types = ['🌲', '🌲', '🪨', '🌳'];
            const type = types[Math.floor(Math.random() * types.length)];
            const leftPos = Math.random() * 100;
            el.innerHTML = type;
            el.style.cssText = `position: absolute; left: ${leftPos}%; font-size: 20px; transform-origin: center bottom; animation: ground-obj-pass 2s ease-in forwards;`;
            groundObjContainer.appendChild(el);
            setTimeout(() => el.remove(), 2000);
        };
        this.groundSpawnInterval = setInterval(spawnGroundObject, 300);

        // WIPER
        let wiperAngle = -50;
        let wiperDir = 1;
        this.wiperInterval = setInterval(() => {
            if (!document.body.contains(c)) return;
            const isRaining = (typeof window.WeatherManager !== 'undefined' && 
                              (window.WeatherManager.isRaining || window.WeatherManager.isSnowing));

            lightBox.style.background = isRaining ? '#00e676' : '#222';
            lightBox.style.boxShadow = isRaining ? '0 0 8px #00e676' : '0 0 2px #000';
            const isOnline = navigator.onLine && !State.data.settings.offlineMode;
            connLight.style.background = isOnline ? '#22c55e' : '#ef4444';
            connLight.style.boxShadow = isOnline ? '0 0 5px #22c55e' : '0 0 5px #ef4444';

            if (isRaining) {
                wiperAngle += wiperDir * 4;
                if (wiperAngle >= 50) wiperDir = -1;
                if (wiperAngle <= -50) wiperDir = 1;
                wiper.style.transform = `rotate(${wiperAngle}deg)`;
                
                if (Math.random() > 0.5) {
                    const streak = document.createElement('div');
                    streak.style.cssText = `position: absolute; left: ${Math.random() * 100}%; top: -40px; width: 2px; height: ${50 + Math.random() * 30}px; background: linear-gradient(180deg, transparent, rgba(200,220,255,0.8), rgba(150,180,220,0.4)); animation: flight-streak-fall 0.5s linear forwards;`;
                    externalRainContainer.appendChild(streak);
                    setTimeout(() => streak.remove(), 500);
                    if (windscreenRain.children.length < 50) {
                        const drop = document.createElement('div');
                        drop.className = 'rain-drop-glass';
                        const size = 5 + Math.random() * 6;
                        const x = 5 + Math.random() * 90;
                        const y = 5 + Math.random() * 45;
                        drop.style.cssText = `position: absolute; left: ${x}%; top: ${y}%; width: ${size}px; height: ${size * 1.1}px; background: radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.9), rgba(180,210,255,0.6), rgba(100,150,220,0.3)); border-radius: 50%; opacity: 0; box-shadow: 0 0 2px rgba(255,255,255,0.7); animation: flight-drop-appear 0.15s ease-out forwards;`;
                        drop.dataset.x = x;
                        windscreenRain.appendChild(drop);
                    }
                }
                const drops = windscreenRain.querySelectorAll('.rain-drop-glass:not(.clearing)');
                drops.forEach(drop => {
                    const dropX = parseFloat(drop.dataset.x);
                    const dropAngle = (dropX - 50) * 1.4;
                    if (Math.abs(wiperAngle - dropAngle) < 5) {
                        drop.classList.add('clearing');
                        drop.style.animation = wiperDir > 0 ? 'flight-drop-streak-right 0.3s ease-out forwards' : 'flight-drop-streak-left 0.3s ease-out forwards';
                        setTimeout(() => drop.remove(), 300);
                    }
                });

                if (distantSky.children.length < 25 && Math.random() > 0.7) {
                    const cloud = document.createElement('div');
                    cloud.innerText = '☁️';
                    cloud.style.cssText = `position: absolute; top: ${30 + Math.random() * 15}%; left: -10%; font-size: ${40 + Math.random() * 40}px; opacity: 0.9; filter: blur(2px) grayscale(90%) brightness(60%); transition: left 1s linear; color: #333;`;
                    cloud.dataset.speed = 0.05 + Math.random() * 0.05;
                    cloud.dataset.pos = -10;
                    distantSky.appendChild(cloud);
                }
            } else {
                if (Math.abs(wiperAngle - -50) > 2) {
                    wiperAngle -= 2;
                    wiper.style.transform = `rotate(${wiperAngle}deg)`;
                }
            }
        }, 60);
    },

    // --- VARIABLES RESTORED FOR OCEAN ---
    oceanTimeout: null,
    oceanObjects: [],

    getMoonPhase() {
        const date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        const day = date.getDate();
        if (month < 3) { year--; month += 12; }
        month++;
        const c = 365.25 * year;
        const e = 30.6 * month;
        let jd = c + e + day - 694039.09;
        jd /= 29.5305882;
        const b = Math.floor(jd);
        jd -= b;
        const phase = Math.round(jd * 8);
        return phase >= 8 ? 0 : phase;
    },

    ocean(active) {
        let c = DOM.theme.effects.ocean;
        if (!c) {
            c = document.createElement('div');
            c.id = 'ocean-effect';
            c.className = 'fixed inset-0 pointer-events-none overflow-hidden z-0';
            document.body.appendChild(c);
            DOM.theme.effects.ocean = c;
        }
        if (this.oceanTimeout) clearTimeout(this.oceanTimeout);
        this.oceanObjects.forEach(obj => obj.remove());
        this.oceanObjects = [];
        if (!active) { c.innerHTML = ''; c.style.background = ''; return; }
        c.innerHTML = '';
        const hour = new Date().getHours();
        const minutes = new Date().getMinutes();
        const timeDecimal = hour + minutes / 60;
        const isNight = hour >= 20 || hour < 6;
        const isEvening = (hour >= 17 && hour < 20) || (hour >= 6 && hour < 8);
        const moonPhase = this.getMoonPhase();
        let bodyX, bodyY;
        if (isNight) {
            const nightProgress = hour >= 20 ? (hour - 20 + minutes/60) / 10 : (hour + 4 + minutes/60) / 10;
            bodyX = 15 + nightProgress * 70;
            bodyY = 15 + Math.sin(nightProgress * Math.PI) * -10;
        } else {
            if (timeDecimal < 6) {
                bodyX = 10; bodyY = 38;
            } else if (timeDecimal > 18) {
                bodyX = 90; bodyY = 38;
            } else {
                bodyX = 10 + ((timeDecimal - 6) / 12) * 80;
                const noon = 12;
                const distFromNoon = Math.abs(timeDecimal - noon);
                bodyY = 10 + (distFromNoon / 6) * 28;
            }
        }
        let skyGradient;
        if (isNight) {
            skyGradient = 'linear-gradient(180deg, #0a0a1a 0%, #1a1a3a 20%, #2a3a5a 40%, #1a3050 48%, #0f2840 55%, #0a1828 75%, #051018 100%)';
        } else if (isEvening) {
            skyGradient = 'linear-gradient(180deg, #1a2a4a 0%, #c44536 15%, #f7b267 35%, #87CEEB 45%, #2a5a8a 50%, #1a4a7a 65%, #0f3050 85%, #0a2030 100%)';
        } else {
            skyGradient = 'linear-gradient(180deg, #4a90c2 0%, #87CEEB 20%, #a8d4ea 40%, #87CEEB 47%, #2a6a9a 50%, #1a5080 60%, #0f3a60 80%, #0a2840 100%)';
        }
        c.style.background = skyGradient;
        if (isNight) {
            const moon = document.createElement('div');
            moon.style.cssText = `
                position: absolute;
                top: ${bodyY}%;
                left: ${bodyX}%;
                transform: translate(-50%, -50%);
                width: 45px;
                height: 45px;
                border-radius: 50%;
                box-shadow: 0 0 30px rgba(255,255,240,0.5), 0 0 60px rgba(255,255,240,0.3);
                z-index: 2;
                overflow: hidden;
            `;
            let moonGradient;
            if (moonPhase === 0) {
                moonGradient = 'radial-gradient(circle at 50% 50%, #3a3a3a 0%, #2a2a2a 100%)';
            } else if (moonPhase === 4) {
                moonGradient = 'radial-gradient(circle at 35% 35%, #fffef0 0%, #f0f0e0 50%, #d8d8c8 100%)';
            } else if (moonPhase < 4) {
                const litPercent = moonPhase * 25;
                moonGradient = `linear-gradient(90deg, #2a2a2a 0%, #2a2a2a ${50 - litPercent}%, #d8d8c8 ${50 - litPercent + 10}%, #fffef0 100%)`;
            } else {
                const litPercent = (8 - moonPhase) * 25;
                moonGradient = `linear-gradient(90deg, #fffef0 0%, #d8d8c8 ${litPercent - 10}%, #2a2a2a ${litPercent}%, #2a2a2a 100%)`;
            }
            moon.style.background = moonGradient;
            c.appendChild(moon);
            const reflectionContainer = document.createElement('div');
            reflectionContainer.className = 'ocean-reflection-container';
            reflectionContainer.style.cssText = `
                position: absolute;
                top: 49%;
                left: ${bodyX}%;
                transform: translateX(-50%);
                width: 100px;
                height: 50%;
                z-index: 9;
                overflow: visible;
            `;
            for (let r = 0; r < 18; r++) {
                const segment = document.createElement('div');
                const yOffset = r * 5.5;
                const baseWidth = 4 + r * 3;
                const width = baseWidth + Math.random() * (r * 2);
                const xOffset = (Math.random() - 0.5) * (10 + r * 3);
                segment.style.cssText = `
                    position: absolute;
                    top: ${yOffset}%;
                    left: 50%;
                    transform: translateX(calc(-50% + ${xOffset}px));
                    width: ${width}px;
                    height: ${2 + Math.random() * 2}%;
                    background: rgba(255,255,250,${0.9 - r * 0.04});
                    border-radius: 50%;
                    animation: reflection-segment ${0.6 + Math.random() * 0.6}s ease-in-out infinite;
                    animation-delay: ${Math.random() * 0.5}s;
                `;
                reflectionContainer.appendChild(segment);
            }
            c.appendChild(reflectionContainer);
            for (let i = 0; i < 50; i++) {
                const star = document.createElement('div');
                star.style.cssText = `
                    position: absolute;
                    top: ${Math.random() * 45}%;
                    left: ${Math.random() * 100}%;
                    width: ${1 + Math.random() * 2}px;
                    height: ${1 + Math.random() * 2}px;
                    background: white;
                    border-radius: 50%;
                    opacity: ${0.3 + Math.random() * 0.7};
                    animation: star-twinkle ${2 + Math.random() * 3}s ease-in-out infinite;
                    animation-delay: ${Math.random() * 2}s;
                `;
                c.appendChild(star);
            }
        } else {
            const sun = document.createElement('div');
            const sunColor = isEvening ? '#ff6b35' : '#FFD700';
            sun.style.cssText = `
                position: absolute;
                top: ${bodyY}%;
                left: ${bodyX}%;
                transform: translate(-50%, -50%);
                width: 50px;
                height: 50px;
                background: radial-gradient(circle, #fff8e0 0%, ${sunColor} 50%, ${isEvening ? '#c44536' : '#FFA500'} 100%);
                border-radius: 50%;
                box-shadow: 0 0 60px ${sunColor}, 0 0 100px ${sunColor}80;
                z-index: 2;
            `;
            c.appendChild(sun);
            const reflectionContainer = document.createElement('div');
            reflectionContainer.className = 'ocean-reflection-container';
            reflectionContainer.style.cssText = `
                position: absolute;
                top: 49%;
                left: ${bodyX}%;
                transform: translateX(-50%);
                width: 120px;
                height: 50%;
                z-index: 9;
                overflow: visible;
            `;
            const golden = isEvening ? [255, 150, 50] : [255, 215, 0];
            for (let r = 0; r < 20; r++) {
                const segment = document.createElement('div');
                const yOffset = r * 5;
                const baseWidth = 5 + r * 4;
                const width = baseWidth + Math.random() * (r * 2.5);
                const xOffset = (Math.random() - 0.5) * (12 + r * 4);
                segment.style.cssText = `
                    position: absolute;
                    top: ${yOffset}%;
                    left: 50%;
                    transform: translateX(calc(-50% + ${xOffset}px));
                    width: ${width}px;
                    height: ${2 + Math.random() * 2}%;
                    background: rgba(${golden[0]},${golden[1]},${golden[2]},${0.95 - r * 0.04});
                    border-radius: 50%;
                    animation: reflection-segment ${0.5 + Math.random() * 0.5}s ease-in-out infinite;
                    animation-delay: ${Math.random() * 0.4}s;
                `;
                reflectionContainer.appendChild(segment);
            }
            c.appendChild(reflectionContainer);
        }
        const waveColors = isNight 
            ? ['#0a1e3a', '#0c2444', '#0e2a4e', '#102f55']
            : ['#1a5a8a', '#2a6a9a', '#3a7aaa', '#4a8aba'];
        for (let i = 0; i < 4; i++) {
            const waveWrapper = document.createElement('div');
            waveWrapper.style.cssText = `
                position: absolute;
                top: ${46 + i * 8}%;
                left: 0;
                right: 0;
                height: ${58 - i * 10}%;
                z-index: ${4 + i};
                overflow: hidden;
            `;
            const waveContainer = document.createElement('div');
            const waveAmplitude = 2 + i * 6;
            waveContainer.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 200%;
                height: 100%;
                animation: wave-seamless-${i} ${20 - i * 3}s linear infinite;
            `;
            const baseY = 25;
            waveContainer.innerHTML = `
                <svg viewBox="0 0 2000 200" preserveAspectRatio="none" style="width: 100%; height: 100%;">
                    <defs>
                        <linearGradient id="waveGrad${i}" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:${waveColors[i]};stop-opacity:0.98"/>
                            <stop offset="100%" style="stop-color:${isNight ? '#050d18' : '#0a2840'};stop-opacity:1"/>
                        </linearGradient>
                    </defs>
                    <path d="M0,${baseY} 
                        C50,${baseY - waveAmplitude} 100,${baseY + waveAmplitude} 150,${baseY}
                        C200,${baseY - waveAmplitude * 0.8} 250,${baseY + waveAmplitude} 300,${baseY}
                        C350,${baseY - waveAmplitude * 1.1} 400,${baseY + waveAmplitude * 0.9} 450,${baseY}
                        C500,${baseY - waveAmplitude} 550,${baseY + waveAmplitude * 1.1} 600,${baseY}
                        C650,${baseY - waveAmplitude * 0.9} 700,${baseY + waveAmplitude} 750,${baseY}
                        C800,${baseY - waveAmplitude * 1.1} 850,${baseY + waveAmplitude * 0.8} 900,${baseY}
                        C950,${baseY - waveAmplitude} 1000,${baseY + waveAmplitude} 1050,${baseY}
                        C1100,${baseY - waveAmplitude * 0.8} 1150,${baseY + waveAmplitude} 1200,${baseY}
                        C1250,${baseY - waveAmplitude * 1.1} 1300,${baseY + waveAmplitude * 0.9} 1350,${baseY}
                        C1400,${baseY - waveAmplitude} 1450,${baseY + waveAmplitude * 1.1} 1500,${baseY}
                        C1550,${baseY - waveAmplitude * 0.9} 1600,${baseY + waveAmplitude} 1650,${baseY}
                        C1700,${baseY - waveAmplitude * 1.1} 1750,${baseY + waveAmplitude * 0.8} 1800,${baseY}
                        C1850,${baseY - waveAmplitude} 1900,${baseY + waveAmplitude} 1950,${baseY}
                        L2000,${baseY} L2000,200 L0,200 Z" 
                        fill="url(#waveGrad${i})"/>
                </svg>
            `;
            waveWrapper.appendChild(waveContainer);
            c.appendChild(waveWrapper);
        }
        for (let f = 0; f < 10; f++) {
            const foam = document.createElement('div');
            foam.style.cssText = `
                position: absolute;
                top: ${72 + Math.random() * 22}%;
                left: ${Math.random() * 100}%;
                width: ${20 + Math.random() * 60}px;
                height: ${3 + Math.random() * 4}px;
                background: rgba(255,255,255,${0.25 + Math.random() * 0.35});
                border-radius: 50%;
                filter: blur(1px);
                animation: foam-drift ${6 + Math.random() * 8}s linear infinite;
                animation-delay: ${Math.random() * 4}s;
                z-index: 18;
            `;
            c.appendChild(foam);
        }
        const oldStyle = document.getElementById('ocean-style');
        if (oldStyle) oldStyle.remove();
        const style = document.createElement('style');
        style.id = 'ocean-style';
        style.textContent = `
            @keyframes wave-seamless-0 {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
            }
            @keyframes wave-seamless-1 {
                0% { transform: translateX(-50%); }
                100% { transform: translateX(0); }
            }
            @keyframes wave-seamless-2 {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
            }
            @keyframes wave-seamless-3 {
                0% { transform: translateX(-50%); }
                100% { transform: translateX(0); }
            }
            @keyframes foam-drift {
                0% { transform: translateX(0) scale(1); opacity: 0.5; }
                50% { transform: translateX(-30px) scale(1.2); opacity: 0.8; }
                100% { transform: translateX(-60px) scale(0.8); opacity: 0; }
            }
            @keyframes reflection-shimmer {
                0%, 100% { 
                    opacity: 1; 
                    transform: translateX(-50%) scaleX(1) scaleY(1);
                }
                25% { 
                    opacity: 0.6; 
                    transform: translateX(-50%) scaleX(2) scaleY(0.95);
                }
                50% { 
                    opacity: 0.9; 
                    transform: translateX(-50%) scaleX(0.5) scaleY(1.02);
                }
                75% { 
                    opacity: 0.7; 
                    transform: translateX(-50%) scaleX(1.5) scaleY(0.98);
                }
            }
            @keyframes reflection-segment {
                0%, 100% { 
                    opacity: 0.3;
                    transform: translateX(calc(-50% + var(--x-off, 0px))) scaleX(0.8);
                }
                50% { 
                    opacity: 1;
                    transform: translateX(calc(-50% + var(--x-off, 0px))) scaleX(1.5);
                }
            }
            .ocean-reflection {
                animation: reflection-shimmer 2.5s ease-in-out infinite;
            }
            @keyframes star-twinkle {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 1; }
            }
            @keyframes boat-bob {
                0%, 100% { transform: translateY(0) rotate(-1deg); }
                25% { transform: translateY(-4px) rotate(1.5deg); }
                50% { transform: translateY(-2px) rotate(-0.5deg); }
                75% { transform: translateY(-6px) rotate(2deg); }
            }
            @keyframes boat-bob-large {
                0%, 100% { transform: translateY(0) rotate(-3deg); }
                25% { transform: translateY(-10px) rotate(4deg); }
                50% { transform: translateY(-5px) rotate(-2deg); }
                75% { transform: translateY(-15px) rotate(5deg); }
            }
            @keyframes boat-drift {
                from { left: -100px; }
                to { left: calc(100% + 100px); }
            }
            @keyframes boat-drift-reverse {
                from { left: calc(100% + 100px); }
                to { left: -100px; }
            }
            @keyframes seagull-fly {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
        `;
        document.head.appendChild(style);
        const boats = ['⛵', '🚤', '🛥️', '🚢', '⛴️', '🛶'];
        const spawnBoat = () => {
            if (!c.isConnected) return;
            const boat = document.createElement('div');
            const boatEmoji = boats[Math.floor(Math.random() * boats.length)];
            const goingRight = Math.random() > 0.5;
            const depthRoll = Math.random();
            let yPos, size, duration, zIndex, bobAnimation;
            if (depthRoll < 0.35) {
                yPos = 47 + Math.random() * 2;
                size = 8 + Math.random() * 5;
                duration = 90 + Math.random() * 50;
                zIndex = 8;
                bobAnimation = 'boat-bob 5s ease-in-out infinite';
            } else if (depthRoll < 0.7) {
                yPos = 54 + Math.random() * 10;
                size = 20 + Math.random() * 18;
                duration = 55 + Math.random() * 35;
                zIndex = 12;
                bobAnimation = 'boat-bob 3.5s ease-in-out infinite';
            } else {
                yPos = 70 + Math.random() * 18;
                size = 55 + Math.random() * 40;
                duration = 20 + Math.random() * 15;
                zIndex = 25;
                bobAnimation = 'boat-bob-large 2s ease-in-out infinite';
            }
            boat.textContent = boatEmoji;
            boat.style.cssText = `
                position: absolute;
                top: ${yPos}%;
                font-size: ${size}px;
                z-index: ${zIndex};
                opacity: ${size < 15 ? 0.6 : 1};
                animation: 
                    ${goingRight ? 'boat-drift' : 'boat-drift-reverse'} ${duration}s linear forwards,
                    ${bobAnimation};
                filter: drop-shadow(2px 3px ${Math.floor(size/10) + 2}px rgba(0,0,0,0.4));
                ${goingRight ? 'transform: scaleX(-1);' : ''}
            `;
            c.appendChild(boat);
            this.oceanObjects.push(boat);
            setTimeout(() => boat.remove(), duration * 1000);
            this.oceanTimeout = setTimeout(spawnBoat, 2500 + Math.random() * 5000);
        };
        const spawnSeagull = () => {
            if (!c.isConnected || isNight) return;
            const bird = document.createElement('div');
            bird.textContent = '🕊️';
            const yPos = 15 + Math.random() * 50; // More vertical range
            const duration = 8 + Math.random() * 8;
            const goingRight = Math.random() > 0.5;
            const size = 28 + Math.random() * 32; // Much larger: 28-60px
            bird.style.cssText = `
                position: absolute;
                top: ${yPos}%;
                left: ${goingRight ? '-80px' : 'calc(100% + 80px)'};
                font-size: ${size}px;
                z-index: 150;
                animation: 
                    ${goingRight ? 'boat-drift' : 'boat-drift-reverse'} ${duration}s linear forwards,
                    seagull-fly 0.4s ease-in-out infinite;
                filter: drop-shadow(3px 5px 8px rgba(0,0,0,0.4));
                ${goingRight ? 'transform: scaleX(-1);' : ''}
            `;
            c.appendChild(bird);
            this.oceanObjects.push(bird);
            setTimeout(() => bird.remove(), duration * 1000);
            setTimeout(spawnSeagull, 5000 + Math.random() * 8000);
        };
        this.oceanTimeout = setTimeout(spawnBoat, 1000);
        if (!isNight) setTimeout(spawnSeagull, 3000);
    }
};
const ShareManager = {
    async shareQR(type) {
        const word = State.runtime.allWords[State.runtime.currentWordIndex].text.toUpperCase();
        UIManager.showPostVoteMessage("Generating QR Code... 📷");
        const messages = [
            `Scan to vote on "${word}"!`,
            `I need your help with "${word}"`,
            `Is "${word}" good or bad?`,
            `Settle a debate: "${word}"`,
            `Quick vote needed on "${word}"`
        ];
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        const targetUrl = `${window.location.origin}/?word=${encodeURIComponent(word)}`;
        const colorHex = type === 'good' ? '16a34a' : 'dc2626';
        const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&color=${colorHex}&margin=20&data=${encodeURIComponent(targetUrl)}`;
        try {
            const response = await fetch(apiUrl);
            const qrBlob = await response.blob();
            const qrImg = await createImageBitmap(qrBlob);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const width = 400;
            const height = 580;
            canvas.width = width;
            canvas.height = height;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);
            ctx.textAlign = 'center';
            ctx.font = '900 36px Inter, system-ui, sans-serif';
            ctx.fillStyle = type === 'good' ? '#16a34a' : '#dc2626';
            ctx.fillText(type === 'good' ? "GOOD WORD!" : "BAD WORD!", width / 2, 50);
            ctx.drawImage(qrImg, 0, 60, 400, 400);
            ctx.font = 'bold 16px sans-serif';
            ctx.fillStyle = '#9ca3af'; // Light grey
            ctx.fillText('Word:', width / 2, 485);
            ctx.fillStyle = '#1f2937'; // Dark Grey
            ctx.font = '900 40px Inter, system-ui, sans-serif';
            const textWidth = ctx.measureText(word).width;
            if (textWidth > 360) {
                const scale = 360 / textWidth;
                ctx.font = `900 ${Math.floor(40 * scale)}px Inter, system-ui, sans-serif`;
            }
            ctx.fillText(word, width / 2, 530);
            ctx.font = '12px sans-serif';
            ctx.fillStyle = '#d1d5db';
            ctx.fillText('GBword.com', width / 2, 560);
            const finalBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            const file = new File([finalBlob], `${word}_${type}_qr.png`, { type: 'image/png' });
            const shareData = {
                title: `Vote ${type} on ${word}!`,
                text: randomMsg,
                files: [file]
            };
            if (navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
            } else {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(finalBlob);
                a.download = `${word}_${type}_qr.png`;
                a.click();
                UIManager.showPostVoteMessage("QR Code downloaded!");
            }
        } catch (e) {
            console.error(e);
            UIManager.showPostVoteMessage("Could not generate QR.");
        }
    },
    async shareCompatibility(p1, p2, score, matches, totalRounds) {
        UIManager.showPostVoteMessage("Printing coupon... 💘");
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const width = 600;
        const height = 450;
        canvas.width = width;
        canvas.height = height;
        const grd = ctx.createLinearGradient(0, 0, 0, height);
        grd.addColorStop(0, "#fce7f3"); // light pink
        grd.addColorStop(1, "#fbcfe8"); // slightly darker pink
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = "#db2777"; // pink-600
        ctx.lineWidth = 8;
        ctx.strokeRect(10, 10, width-20, height-20);
        ctx.strokeStyle = "#fdf2f8"; // white inner line
        ctx.lineWidth = 4;
        ctx.strokeRect(18, 18, width-36, height-36);
        ctx.fillStyle = "#be185d"; // pink-700
        ctx.font = "900 24px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("OFFICIAL COMPATIBILITY REPORT", width/2, 60);
        ctx.fillStyle = "#1f2937"; // dark gray
        ctx.font = "bold 32px system-ui, sans-serif";
        ctx.fillText(`${p1}  💕  ${p2}`, width/2, 120);
        ctx.fillStyle = "#db2777"; // pink-600
        ctx.font = "900 140px system-ui, sans-serif";
        ctx.fillText(`${score}%`, width/2, 260);
        ctx.fillStyle = "#6b7280"; // gray-500
        ctx.font = "bold 22px system-ui, sans-serif";
        ctx.fillText(`Matched ${matches || 0} of ${totalRounds || 0} words`, width/2, 310);
        ctx.fillStyle = "#9d174d";
        ctx.font = "bold 18px system-ui, sans-serif";
        ctx.fillText("Certified by OK Stoopid (GBword.com)", width/2, 400);
        try {
            const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
            const file = new File([blob], 'compatibility_test.png', { type: 'image/png' });
            const shareData = {
                title: 'Compatibility Result',
                text: `We are ${score}% compatible! Matched ${matches}/${totalRounds} words 💘 Test your relationship on GBword.com`,
                files: [file]
            };
            if (navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
            } else {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'ok_stoopid_result.png';
                a.click();
                UIManager.showPostVoteMessage("Coupon downloaded! 📸");
            }
        } catch (e) {
            console.error(e);
            UIManager.showPostVoteMessage("Could not share image.");
        }
    },
    async generateImage() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const width = 600;
        const height = 400;
        canvas.width = width;
        canvas.height = height;
        
        // Background gradient
        const grd = ctx.createLinearGradient(0, 0, 0, height);
        grd.addColorStop(0, "#4f46e5"); // indigo
        grd.addColorStop(1, "#7c3aed"); // purple
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, width, height);
        
        // Border
        ctx.strokeStyle = "#818cf8";
        ctx.lineWidth = 6;
        ctx.strokeRect(10, 10, width - 20, height - 20);
        
        // Get user data
        const d = State.data;
        const username = d.username || "Player";
        const votes = d.voteCount || 0;
        const contributions = d.contributorCount || 0;
        const streak = Math.max(parseInt(d.longestStreak) || 0, parseInt(d.daily?.bestStreak) || 0);
        const themes = (d.unlockedThemes?.length || 0) + 1;
        const badges = Object.values(d.badges || {}).filter(b => b).length;
        
        // Title
        ctx.fillStyle = "#ffffff";
        ctx.font = "900 28px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("GOOD WORD / BAD WORD", width / 2, 50);
        
        // Username
        ctx.font = "bold 24px system-ui, sans-serif";
        ctx.fillStyle = "#fbbf24";
        ctx.fillText(`${username}'s Stats`, width / 2, 90);
        
        // Stats
        ctx.font = "bold 20px system-ui, sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "left";
        const startX = 80;
        const startY = 140;
        const lineHeight = 45;
        
        const stats = [
            { icon: "⚖️", label: "Total Votes", value: votes.toLocaleString() },
            { icon: "🔥", label: "Best Streak", value: streak.toString() },
            { icon: "✍️", label: "Words Added", value: contributions.toString() },
            { icon: "🎨", label: "Themes Unlocked", value: themes.toString() },
            { icon: "🏆", label: "Badges Earned", value: badges.toString() }
        ];
        
        stats.forEach((stat, i) => {
            const y = startY + (i * lineHeight);
            ctx.font = "28px system-ui";
            ctx.fillText(stat.icon, startX, y);
            ctx.font = "bold 18px system-ui, sans-serif";
            ctx.fillStyle = "#c7d2fe";
            ctx.fillText(stat.label + ":", startX + 45, y);
            ctx.fillStyle = "#ffffff";
            ctx.font = "900 22px system-ui, sans-serif";
            ctx.fillText(stat.value, startX + 220, y);
        });
        
        // Footer
        ctx.textAlign = "center";
        ctx.font = "16px system-ui, sans-serif";
        ctx.fillStyle = "#a5b4fc";
        ctx.fillText("GBword.com", width / 2, height - 25);
        
        return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    },
    async share() {
        UIManager.showPostVoteMessage("Generating image... 📸");
        try {
            const blob = await this.generateImage();
            if (!blob) {
                UIManager.showPostVoteMessage("Could not generate image.");
                return;
            }
            
            const file = new File([blob], 'my_gbword_stats.png', { type: 'image/png' });
            const username = State.data.username || "I";
            const votes = State.data.voteCount || 0;
            
            const shareData = {
                title: 'My Good Word / Bad Word Stats',
                text: `${username} has cast ${votes.toLocaleString()} votes on Good Word / Bad Word! 🎮 Play at GBword.com`,
                files: [file]
            };
            
            if (navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
                UIManager.showPostVoteMessage("Shared! 🎉");
            } else if (navigator.share) {
                // Try sharing without file
                await navigator.share({
                    title: 'My Good Word / Bad Word Stats',
                    text: `${username} has cast ${votes.toLocaleString()} votes on Good Word / Bad Word! 🎮 Play at GBword.com`,
                    url: window.location.origin
                });
                UIManager.showPostVoteMessage("Shared! 🎉");
            } else {
                // Fallback: download the image
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'my_gbword_stats.png';
                a.click();
                UIManager.showPostVoteMessage("Stats image downloaded! 📥");
            }
        } catch (e) {
            console.error(e);
            if (e.name !== 'AbortError') {
                UIManager.showPostVoteMessage("Could not share stats.");
            }
        }
    }
};

// ============================================================================
// EXPORTS
// ============================================================================
window.Effects = Effects;
window.ShareManager = ShareManager;
window.GAME_DIALOGUE = GAME_DIALOGUE;

console.log('%c[Effects] Module loaded', 'color: #ec4899; font-weight: bold');

})();
