/**
 * ============================================================================
 * SUBMARINE THEME EFFECT
 * ============================================================================
 * Bubbles with interactive fish, octopus, pufferfish, sharks, jellyfish, seals, and boots.
 * FIXED: Depth Layering using explicit Z-Index Stacking Contexts.
 */

(function() {
'use strict';

Effects.bubbles = function(active) {
    const c = DOM.theme.effects.bubble;
    
    // Clear the spawner timeout
    if (Effects.fishTimeout) clearTimeout(Effects.fishTimeout);
    
    // Clean up any existing global fish from the body
    document.querySelectorAll('.submarine-fish-wrap').forEach(el => el.remove());
    
    // Reset Card Z-Index when leaving theme
    if (DOM.game.card) {
        DOM.game.card.style.zIndex = '';
        DOM.game.card.style.position = '';
    }

    if (!active) { 
        c.innerHTML = ''; 
        return; 
    }
    
    // --- STACKING CONTEXT FIX ---
    // We must force the Game Card to have a specific Z-Index so we can put fish BEHIND it (z=1) and IN FRONT (z=100)
    // without using z=-1 (which hides fish behind the body background color).
    if (DOM.game.card) {
        DOM.game.card.style.position = 'relative'; // Required for z-index to work
        DOM.game.card.style.zIndex = '10';         // Card sits at Level 10
    }
    
    c.innerHTML = '';
    
    // Bubble Logic (Visual noise only, kept in container)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isLowPower = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
    const particleCount = (isMobile || isLowPower) ? 15 : 35;
    const cl = [10, 30, 70, 90];
    
    for (let i = 0; i < particleCount; i++) {
        const p = document.createElement('div');
        p.className = 'bubble-particle';
        const s = Math.random() * 30 + 10;
        p.style.width = p.style.height = `${s}px`;
        p.style.left = `${cl[Math.floor(Math.random() * cl.length)] + (Math.random() - 0.5) * 20}%`;
        // Bubbles at Level 0 (Behind Fish and Card)
        p.style.zIndex = '0'; 
        p.style.animationDuration = `${Math.random() * 10 + 10}s`;
        p.style.animationDelay = `-${Math.random() * 15}s`;
        c.appendChild(p);
    }
    
    Effects.spawnFish();
};

Effects.spawnFish = function() {
    // Inject Custom Animations for Creatures
    if (!document.getElementById('sea-creature-styles')) {
        const style = document.createElement('style');
        style.id = 'sea-creature-styles';
        style.innerHTML = `
            @keyframes octopus-swim {
                0% { transform: translateY(0) scale(1, 1); }
                25% { transform: translateY(-30px) scale(0.9, 1.1); }
                50% { transform: translateY(0) scale(1, 1); }
                75% { transform: translateY(30px) scale(1.1, 0.9); }
                100% { transform: translateY(0) scale(1, 1); }
            }
            @keyframes jellyfish-swim {
                0% { transform: translateY(0) scale(1, 1); }
                50% { transform: translateY(-30px) scale(0.90, 1.15); }
                100% { transform: translateY(0) scale(1, 1); }
            }
            .octopus-motion { animation: octopus-swim 2s ease-in-out infinite; }
            .jellyfish-motion { animation: jellyfish-swim 3s ease-in-out infinite; }
        `;
        document.head.appendChild(style);
    }
    
    if (State.runtime.currentTheme !== 'submarine') return;
    
    const fishData = {
        '🐟': { k: 'fish', msg: "Gotcha! 🐟", speed: [12, 18], size: '3rem' },
        '🐠': { k: 'tropical', msg: "So colourful! 🐠", speed: [15, 25], size: '3rem' },
        '🐡': { k: 'puffer', msg: "", speed: [20, 30], size: '3rem' },
        '🦈': { k: 'shark', msg: "You're gonna need a bigger boat! 🦈", speed: [8, 14], size: '5rem' },
        '🐙': { k: 'octopus', msg: "Wiggle wiggle! 🐙", speed: [18, 25], size: '3.5rem' },
        '🪼': { k: 'jellyfish', msg: "Ouch! Stinging! 🪼", speed: [25, 35], size: '3.5rem' },
        '🦭': { k: 'seal', msg: "Arf! Arf! 🦭", speed: [8, 12], size: '5.5rem' },
        '🥾': { k: 'prankster', msg: "Keep the ocean clean!", speed: [15, 20], size: '3rem' }
    };
    
    // Random fish selection
    const roll = Math.random();
    let fishEmoji = '🐟';
    
    if (roll < 0.05) fishEmoji = '🥾';        
    else if (roll < 0.12) fishEmoji = '🐙';   
    else if (roll < 0.20) fishEmoji = '🦈';   
    else if (roll < 0.28) fishEmoji = '🪼';   
    else if (roll < 0.36) fishEmoji = '🦭';   
    else if (roll < 0.50) fishEmoji = '🐡';   
    else if (roll < 0.75) fishEmoji = '🐠';   
    else fishEmoji = '🐟';                    
    
    const config = fishData[fishEmoji] || fishData['🐟'];
    
    const wrap = document.createElement('div');
    wrap.className = 'submarine-fish-wrap';
    wrap.style.position = 'fixed';
    
    // --- EXPLICIT DEPTH LAYERING ---
    // The Card is set to z-index: 10
    // Background Fish: z-index: 1 (Visible above body bg, below card)
    // Foreground Fish: z-index: 100 (Visible above card)
    const isForeground = Math.random() > 0.5;
    wrap.style.zIndex = isForeground ? '100' : '1';
    
    // Slight blur for background fish to sell the depth effect
    if (!isForeground) {
        wrap.style.filter = 'blur(1px) brightness(0.9)';
    }

    const inner = document.createElement('div');
    inner.className = 'submarine-fish-inner';
    inner.textContent = fishEmoji;
    inner.dataset.clicks = "0";
    inner.style.display = 'block';
    inner.style.lineHeight = '1';
    inner.style.fontSize = config.size;
    
    // Apply specific animations
    if (fishEmoji === '🐙') {
        inner.classList.add('octopus-motion');
        inner.style.animationDuration = (Math.random() * 1 + 1.5) + 's';
        inner.style.animationDelay = '-' + (Math.random() * 2) + 's';
    } else if (fishEmoji === '🪼') {
        inner.classList.add('jellyfish-motion');
    }
    
    const isBoot = fishEmoji === '🥾';
    const isSeal = fishEmoji === '🦭';
    const startLeft = Math.random() > 0.5;
    const baseDir = startLeft ? -1 : 1;
    const duration = (Math.random() * (config.speed[1] - config.speed[0]) + config.speed[0]) || 15;
    const isFakeOut = !isBoot && !isSeal && fishEmoji !== '🐙' && fishEmoji !== '🪼' && Math.random() < 0.10;
    
    if (isBoot) {
        inner.style.animation = 'spin-slow 10s linear infinite';
        inner.style.transition = 'transform 0.5s';
        wrap.style.left = (Math.random() * 80 + 10) + '%';
        wrap.style.top = '110vh';
        inner.style.transform = `rotate(${Math.random() * 360}deg)`;
    } else if (isSeal) {
        // --- INTELLIGENT SEAL LOGIC ---
        const pathId = 'seal-path-' + Date.now() + Math.floor(Math.random() * 1000);
        const startY = Math.random() * 70 + 10; 
        const endY = Math.max(10, Math.min(80, startY + (Math.random() * 60 - 30))); 
        const midY = (startY + endY) / 2 + (Math.random() * 40 - 20); 
        
        const style = document.createElement('style');
        style.id = pathId;
        
        const startX = startLeft ? '110vw' : '-20vw';
        const endX = startLeft ? '-20vw' : '110vw';
        
        // Calculate rotation angles
        const angleStart = '0deg'; 
        const angleMid = (midY < startY) ? (startLeft ? '15deg' : '-15deg') : (startLeft ? '-15deg' : '15deg');
        const angleEnd = '0deg';

        style.innerHTML = `
            @keyframes ${pathId} {
                0% { transform: translate(${startX}, ${startY}vh) rotate(${angleStart}); }
                50% { transform: translate(50vw, ${midY}vh) rotate(${angleMid}); }
                100% { transform: translate(${endX}, ${endY}vh) rotate(${angleEnd}); }
            }
        `;
        document.head.appendChild(style);
        
        wrap.style.left = '0';
        wrap.style.top = '0';
        wrap.style.animation = `${pathId} ${duration}s cubic-bezier(0.45, 0.05, 0.55, 0.95) forwards`;
        inner.style.transform = `scaleX(${startLeft ? 1 : -1})`; 
        
        wrap.addEventListener('animationend', () => {
            if (style.parentNode) style.remove();
            if (wrap.parentNode) wrap.remove();
            
            State.data.fishStats.spared = (State.data.fishStats.spared || 0) + 1;
            State.save('fishStats', State.data.fishStats);
            if (State.data.fishStats.spared >= 250) State.unlockBadge('shepherd');
        });

    } else {
        // Standard Fish Movement
        inner.style.transition = 'font-size 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 0.2s';
        wrap.style.top = (Math.random() * 80 + 10) + 'vh';
        wrap.style.left = startLeft ? '-150px' : '110vw';
        inner.style.transform = `scaleX(${baseDir})`;
    }
    
    wrap.appendChild(inner);
    
    // Append to BODY to ensure we are outside the theme container's stacking context
    document.body.appendChild(wrap);
    
    void wrap.offsetWidth;
    
    // Speech bubble helper
    const showBubble = (text) => {
        const old = wrap.querySelector('.fish-bubble');
        if (old) old.remove();
        
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
        setTimeout(() => { 
            if (b.parentNode) { 
                b.style.opacity = '0'; 
                setTimeout(() => b.remove(), 300); 
            } 
        }, 2000);
    };
    
    const handleEscape = (e) => {
        if (isSeal) return;
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
    
    // Click handler
    wrap.onclick = (e) => {
        e.stopPropagation();
        
        // Pufferfish Logic
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
        
        // Octopus Logic
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
            
            // Ink splatter
            for (let i = 0; i < 12; i++) {
                const ink = document.createElement('div');
                const ox = (Math.random() - 0.5) * 40;
                const oy = (Math.random() - 0.5) * 40;
                Object.assign(ink.style, {
                    position: 'fixed', left: (centerX + ox) + 'px', top: (centerY + oy) + 'px',
                    width: (Math.random() * 15 + 10) + 'px', height: (Math.random() * 15 + 10) + 'px',
                    background: '#000000', borderRadius: '50%', opacity: '0.8',
                    pointerEvents: 'none', zIndex: '999',
                    transition: 'transform 1s ease-out, opacity 1s ease-out'
                });
                document.body.appendChild(ink);
                requestAnimationFrame(() => {
                    ink.style.transform = `scale(${Math.random() * 2 + 1}) translate(${ox}px, ${oy}px)`;
                    ink.style.opacity = '0';
                });
                setTimeout(() => ink.remove(), 1000);
            }
            
            if (!isSeal) {
                const jetSpeed = Math.random() * 0.8 + 1.2;
                wrap.style.transition = `left ${jetSpeed}s cubic-bezier(0.25, 1, 0.5, 1), top ${jetSpeed}s ease-out`;
                wrap.style.left = (110 + Math.random() * 30) + 'vw';
                wrap.style.top = (-20 - Math.random() * 30) + 'vh';
                setTimeout(() => { if (wrap.parentNode) wrap.remove(); }, jetSpeed * 1000 + 200);
            }
            return;
        }
        
        // Fake out
        if (isFakeOut) {
            showBubble('hey!');
            SoundManager.playPop();
            const currentLeft = getComputedStyle(wrap).left;
            wrap.style.transition = 'none';
            wrap.style.left = currentLeft;
            setTimeout(() => {
                if (!wrap.parentNode) return;
                inner.style.transition = 'none';
                inner.style.transform = `scaleX(${-baseDir})`;
                wrap.style.transition = `left ${duration * 0.5}s linear`;
                wrap.style.left = startLeft ? '-150px' : '110vw';
                setTimeout(() => {
                    if (wrap.parentNode) wrap.remove();
                }, duration * 500 + 100);
            }, 600);
            return;
        }
        
        // Catch Logic
        if (data.k) State.unlockBadge(data.k);
        if (!isBoot) {
            State.data.fishStats.caught++;
            State.save('fishStats', State.data.fishStats);
            if (State.data.fishStats.caught >= 250) State.unlockBadge('angler');
        }
        
        if (fishEmoji === '🐡') UIManager.showPostVoteMessage("Popped!");
        else if (fishEmoji === '🪼') UIManager.showPostVoteMessage("Zzap! Caught!");
        else if (fishEmoji === '🦭') UIManager.showPostVoteMessage("Playful Catch!");
        else if (fishEmoji === '🦈') UIManager.showPostVoteMessage("Big Catch!");
        
        SoundManager.playPop();
        
        const rect = wrap.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        let pColor = '#60a5fa';
        if (fishEmoji === '🐡') pColor = '#eab308';
        if (isBoot) pColor = '#78350f';
        if (fishEmoji === '🪼') pColor = '#e879f9';
        if (fishEmoji === '🦭') pColor = '#9ca3af';
        
        for (let i = 0; i < 12; i++) {
            const p = document.createElement('div');
            p.style.cssText = `position: fixed; width: 8px; height: 8px; background: ${pColor}; border-radius: 50%; pointer-events: none; z-index: 999; left: ${centerX}px; top: ${centerY}px;`;
            document.body.appendChild(p);
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 60 + 20;
            p.animate([
                { transform: 'translate(0,0) scale(1)', opacity: 1 },
                { transform: `translate(${Math.cos(angle) * velocity}px, ${Math.sin(angle) * velocity}px) scale(0)`, opacity: 0 }
            ], { duration: 400, easing: 'ease-out' }).onfinish = () => p.remove();
        }
        
        wrap.style.transition = 'opacity 0.1s, transform 0.1s';
        wrap.style.opacity = '0';
        wrap.style.transform = 'scale(0)';
        setTimeout(() => wrap.remove(), 100);
    };
    
    // Start movement for non-seals
    if (!isSeal) {
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
    }
    
    Effects.fishTimeout = setTimeout(() => Effects.spawnFish(), Math.random() * 4000 + 1000);
};

console.log('%c[Theme: Submarine] Loaded', 'color: #06b6d4');

})();
