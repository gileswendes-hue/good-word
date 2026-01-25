/**
 * ============================================================================
 * BALLPIT THEME EFFECT
 * ============================================================================
 * Physics-based ball pit with draggable balls, rare collectibles, and badges
 */

(function() {
'use strict';

Effects.ballpit = function(active) {
    const c = DOM.theme.effects.ballpit;
    if (Effects.ballLoop) cancelAnimationFrame(Effects.ballLoop);
    
    if (!active) { 
        c.innerHTML = ''; 
        window.removeEventListener('deviceorientation', Physics.handleOrientation); 
        return;
    }
    
    window.addEventListener('deviceorientation', Physics.handleOrientation);
    c.innerHTML = '';
    Physics.balls = [];
    
    const colors = ['#ef4444', '#3b82f6', '#eab308', '#22c55e', '#a855f7'];
    const rareItems = ['💩', '🐧', '🦂', '🍄', '💉', '💎'];
    const rareMap = { 
        '💩': 'poop', 
        '🐧': 'penguin', 
        '🦂': 'scorpion', 
        '🍄': 'mushroom', 
        '💉': 'needle', 
        '💎': 'diamond' 
    };
    
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
            setTimeout(() => { b.remove(); ballObj.bubble = null }, 300);
        }, 4000);
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
            el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        } else if (type === 'rare') {
            content = rareItems[Math.floor(Math.random() * rareItems.length)];
            el.classList.add('interactable-ball');
            el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        } else {
            el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        }
        
        if (content) el.innerHTML = `<span class="ball-content">${content}</span>`;
        c.appendChild(el);
        
        const b = { 
            el, 
            x: minX + Math.random() * (maxX - minX), 
            y: Math.random() * (H / 2), 
            vx: (Math.random() - 0.5) * 10, 
            vy: (Math.random() - 0.5) * 10, 
            r, 
            drag: false, 
            lastX: 0, 
            lastY: 0, 
            bubble: null, 
            type, 
            content 
        };
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
                showThought(b, type === 'rare' ? `<span style="font-size:2em">${content}</span>` : null);
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
    
    // Create balls
    for (let i = 0; i < 50; i++) addBall(Math.random() < 0.008 ? 'rare' : 'normal');
    for (let i = 0; i < 4; i++) addBall('germ');
    
    // Start physics loop
    Physics.run();
};

console.log('%c[Theme: Ballpit] Loaded', 'color: #ec4899');

})();
