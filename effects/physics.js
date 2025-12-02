import { DOM } from '../dom.js';
import { State } from '../state.js';

export const Physics = {
    balls: [],
    gx: 0,
    gy: 0.8,
    raf: null,

    handleOrientation(e) {
        const x = e.gamma || 0;
        const y = e.beta || 0;
        // Dampen and limit gravity
        const tx = Math.min(Math.max(x / 4, -1), 1);
        const ty = Math.min(Math.max(y / 4, -1), 1);
        
        // Smooth interpolation
        Physics.gx += (tx - Physics.gx) * 0.1;
        Physics.gy += (ty - Physics.gy) * 0.1;
    },

    toggle(active) {
        const c = DOM.theme.effects.ballpit;
        if (this.raf) cancelAnimationFrame(this.raf);
        
        if (!active) {
            c.innerHTML = '';
            window.removeEventListener('deviceorientation', this.handleOrientation);
            return;
        }

        window.addEventListener('deviceorientation', this.handleOrientation);
        c.innerHTML = '';
        this.balls = [];
        this.initBalls(c);
        this.run();
    },

    initBalls(c) {
        const colors = ['#ef4444', '#3b82f6', '#eab308', '#22c55e', '#a855f7'];
        const rareItems = ['💩', '🐧', '🦂', '🍄', '💉', '💎'];
        const rareMap = { '💩': 'poop', '🐧': 'penguin', '🦂': 'scorpion', '🍄': 'mushroom', '💉': 'needle', '💎': 'diamond' };
        
        const r = 30;
        const W = window.innerWidth;
        const H = window.innerHeight;
        const cylW = Math.min(W, 500);
        const minX = (W - cylW) / 2;
        const maxX = minX + cylW - r * 2;

        const addBall = (type) => {
            const el = document.createElement('div');
            el.className = 'ball-particle';
            el.style.width = el.style.height = `${r*2}px`;
            
            let content = '';
            let bColor = colors[Math.floor(Math.random() * colors.length)];
            
            if (type === 'germ') {
                content = '🦠';
                el.classList.add('interactable-ball');
            } else if (type === 'rare') {
                content = rareItems[Math.floor(Math.random() * rareItems.length)];
                el.classList.add('interactable-ball');
            }
            
            el.style.backgroundColor = bColor;
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
                content 
            };
            this.balls.push(b);

            // Interaction Handlers
            let sx = 0, sy = 0;
            el.onmousedown = el.ontouchstart = (e) => {
                b.drag = true;
                b.vx = b.vy = 0;
                const p = e.touches ? e.touches[0] : e;
                b.lastX = p.clientX;
                b.lastY = p.clientY;
                sx = p.clientX;
                sy = p.clientY;
                e.preventDefault();
            };
            
            el.onmouseup = el.ontouchend = (e) => {
                b.drag = false;
                const p = e.changedTouches ? e.changedTouches[0] : e;
                // Check for click/tap
                if ((type === 'germ' || type === 'rare') && Math.abs(p.clientX - sx) < 50 && Math.abs(p.clientY - sy) < 50) {
                    if (type === 'germ') State.unlockBadge('germ');
                    if (type === 'rare' && rareMap[content]) State.unlockBadge(rareMap[content]);
                }
            };
        };

        for (let i = 0; i < 80; i++) addBall(Math.random() < 0.005 ? 'rare' : 'normal');
        for (let i = 0; i < 5; i++) addBall('germ');
        
        // Global Input Handlers for Dragging
        window.onmouseup = window.ontouchend = () => { this.balls.forEach(b => b.drag = false); };
        window.onmousemove = window.ontouchmove = (e) => {
            const p = e.touches ? e.touches[0] : e;
            this.balls.forEach(b => {
                if (b.drag) {
                    b.vx = (p.clientX - b.lastX) * 0.5;
                    b.vy = (p.clientY - b.lastY) * 0.5;
                    b.x = p.clientX - b.r;
                    b.y = p.clientY - b.r;
                    b.lastX = p.clientX;
                    b.lastY = p.clientY;
                }
            });
        };
    },

    run() {
        const W = window.innerWidth;
        const H = window.innerHeight;
        const cylW = Math.min(W, 500);
        const minX = (W - cylW) / 2;
        const maxX = minX + cylW;

        // Physics Sub-steps
        for (let s = 0; s < 8; s++) {
            this.balls.forEach(b => {
                if (!b.drag) {
                    b.vx += this.gx / 8;
                    b.vy += this.gy / 8;
                    b.x += b.vx;
                    b.y += b.vy;
                    b.vx *= 0.92; // Friction
                    b.vy *= 0.92;

                    // Walls
                    if (b.x < minX) { b.x = minX; b.vx *= -0.2; }
                    if (b.x > maxX - b.r * 2) { b.x = maxX - b.r * 2; b.vx *= -0.2; }
                    if (b.y < 0) { b.y = 0; b.vy *= -0.2; }
                    if (b.y > H - b.r * 2) { b.y = H - b.r * 2; b.vy *= -0.2; }
                }
            });

            // Collision Detection
            for (let i = 0; i < this.balls.length; i++) {
                for (let j = i + 1; j < this.balls.length; j++) {
                    const b1 = this.balls[i];
                    const b2 = this.balls[j];
                    const dx = (b2.x + b2.r) - (b1.x + b1.r);
                    const dy = (b2.y + b2.r) - (b1.y + b1.r);
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const minDist = b1.r + b2.r + 0.5;

                    if (dist < minDist && dist > 0) {
                        const angle = Math.atan2(dy, dx);
                        const tx = (Math.cos(angle) * (minDist - dist)) / 2;
                        const ty = (Math.sin(angle) * (minDist - dist)) / 2;
                        
                        b1.x -= tx; b1.y -= ty;
                        b2.x += tx; b2.y += ty;

                        if (!b1.drag && !b2.drag) {
                            const nx = dx / dist;
                            const ny = dy / dist;
                            const p = 2 * (b1.vx * nx + b1.vy * ny - b2.vx * nx - b2.vy * ny) / 2;
                            b1.vx -= p * nx * 0.15;
                            b1.vy -= p * ny * 0.15;
                            b2.vx += p * nx * 0.15;
                            b2.vy += p * ny * 0.15;
                        }
                    }
                }
            }
        }

        // Render
        this.balls.forEach(b => {
            b.el.style.transform = `translate(${b.x}px,${b.y}px)`;
        });

        this.raf = requestAnimationFrame(() => this.run());
    }
};