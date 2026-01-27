/**
 * ============================================================================
 * GOOD WORD / BAD WORD - EFFECTS MODULE (05-effects.js)
 * ============================================================================
 * * Contains:
 * - Effects: Visual effects for themes not yet moved to standalone files
 * - rain, weatherSnow, snow (Winter)
 * - fire, bubbles (Submarine), summer
 * - ballpit, space, plymouth
 * - ShareManager: QR code and image sharing
 * * * NOTE: The following themes are now loaded via smart-loader from /themes/:
 * - Halloween, Woodland, Flight, Ocean
 * ============================================================================
 */

(function() {
'use strict';

const StandardEffects = {
    // Timeout references for internal effects
    spiderTimeout: null,
    webRaf: null,
    ballLoop: null,
    fishTimeout: null,
    spaceRareTimeout: null,
    snowmanTimeout: null,
    plymouthShooterTimeout: null,
    plymouthStreakTimeout: null,
    satelliteTimeout: null,

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
// Use Object.assign to merge with any effects loaded by smart-loader.js
window.Effects = Object.assign(window.Effects || {}, StandardEffects);
window.ShareManager = ShareManager;
window.GAME_DIALOGUE = GAME_DIALOGUE;

console.log('%c[Effects] Module loaded', 'color: #ec4899; font-weight: bold');

})();
