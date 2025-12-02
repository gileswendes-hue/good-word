import { State } from '../state.js';
import { SoundManager } from '../managers/audio.js';
import { UIManager } from '../managers/ui.js';

export const MosquitoManager = {
    el: null, svg: null, path: null, checkInterval: null,
    x: 50, y: 50, angle: 0, speed: 0.35, 
    turnCycle: 0, loopTimer: 0,
    trailPoints: [], MAX_TRAIL: 50,
    state: 'hidden', raf: null,
    COOLDOWN: 5 * 60 * 1000, 

    startMonitoring() {
        if (this.checkInterval) clearInterval(this.checkInterval);
        this.attemptSpawn();
        this.checkInterval = setInterval(() => this.attemptSpawn(), 10000);
    },

    attemptSpawn() {
        if (this.el) return;
        const now = Date.now();
        const last = State.data.lastMosquitoSpawn;
        if (now - last < this.COOLDOWN) return;
        if (Math.random() > 0.3) return; // 30% chance per check
        this.init();
    },

    init() {
        if (this.el) this.remove();
        
        this.el = document.createElement('div');
        this.el.innerHTML = '🦟';
        this.el.className = 'mosquito-entity';
        
        const startRight = Math.random() > 0.5;
        this.x = startRight ? 105 : -5; 
        this.y = Math.random() * 50 + 10;
        this.angle = startRight ? Math.PI : 0; 

        Object.assign(this.el.style, {
            position: 'fixed', fontSize: '3rem', zIndex: '100',
            pointerEvents: 'auto', cursor: 'pointer', transition: 'none', 
            filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.5))',
            left: this.x + '%', top: this.y + '%', willChange: 'transform, left, top'
        });

        // SVG Trail Setup
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        Object.assign(this.svg.style, {
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            pointerEvents: 'none', zIndex: '99'
        });
        
        this.path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this.path.setAttribute("fill", "none");
        this.path.setAttribute("stroke", "rgba(0,0,0,0.2)"); 
        this.path.setAttribute("stroke-width", "2");
        this.path.setAttribute("stroke-dasharray", "5, 5");
        this.path.setAttribute("stroke-linecap", "round");
        
        this.svg.appendChild(this.path);
        document.body.appendChild(this.svg);
        document.body.appendChild(this.el);
        
        this.el.onclick = (e) => {
            e.stopPropagation();
            if (this.state === 'stuck') this.startRescue();
            else if (this.state === 'flying') UIManager.showPostVoteMessage("Too fast! Wait for the web!");
        };
        
        this.state = 'flying';
        this.trailPoints = [];
        this.loopTimer = 0;
        SoundManager.startBuzz();
        this.loop();
    },

    startRescue() {
        this.state = 'thanking';
        SoundManager.stopBuzz(); 
        this.path.setAttribute('d', '');
        this.trailPoints = [];
        
        const bubble = document.createElement('div');
        bubble.textContent = "Thank you! 💖";
        Object.assign(bubble.style, {
            position: 'absolute', bottom: '100%', left: '50%',
            transform: 'translateX(-50%)', background: 'white', color: 'black',
            padding: '8px 12px', borderRadius: '12px', fontSize: '14px',
            fontWeight: 'bold', whiteSpace: 'nowrap', border: '2px solid #ccc',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)', pointerEvents: 'none', zIndex: '101'
        });
        this.el.appendChild(bubble);
        
        setTimeout(() => {
            if (bubble) bubble.remove();
            this.state = 'leaving';
            SoundManager.startBuzz();
            this.angle = Math.random() * Math.PI * 2;
            this.speed = 0.6; 
        }, 2000);
    },

    loop() {
        if (!document.body.contains(this.el)) return;
        
        if (this.state === 'flying' || this.state === 'leaving') {
            this.turnCycle += 0.05;
            let turnSpeed = Math.cos(this.turnCycle) * 0.03;
            
            if (this.state === 'flying') {
                if (this.loopTimer > 0) {
                    turnSpeed = 0.25; 
                    this.loopTimer--;
                } else if (Math.random() < 0.005) {
                    this.loopTimer = 60;
                }
            }
            
            this.angle += turnSpeed;
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;

            // Boundary Checks
            if (this.state === 'flying') {
                if (this.x > 110) { this.x = -10; this.trailPoints = []; }
                else if (this.x < -10) { this.x = 110; this.trailPoints = []; }
            }
            if (this.y < 5 || this.y > 95) {
                this.angle = -this.angle; 
                this.y = Math.max(5, Math.min(95, this.y));
            }

            // Visual Updates
            this.el.style.left = this.x + '%';
            this.el.style.top = this.y + '%';
            const facingRight = Math.cos(this.angle) > 0;
            this.el.style.transform = facingRight ? 'scaleX(-1)' : 'scaleX(1)';

            // Trail Logic
            const pxX = (this.x / 100) * window.innerWidth;
            const pxY = (this.y / 100) * window.innerHeight;
            if (pxX > 0 && pxX < window.innerWidth) this.trailPoints.push({x: pxX, y: pxY});
            if (this.trailPoints.length > this.MAX_TRAIL) this.trailPoints.shift();
            
            if (this.trailPoints.length > 1) {
                const d = `M ${this.trailPoints.map(p => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L ')}`;
                this.path.setAttribute('d', d);
            }

            // Web Collision (Top Right Corner)
            const distRight = window.innerWidth - pxX;
            const distTop = pxY;
            if (this.state === 'flying' && (distRight + distTop) < 280) {
                this.state = 'stuck';
                SoundManager.stopBuzz(); 
                UIManager.showPostVoteMessage("It's stuck in the web!");
            }
            
            if (this.state === 'leaving') {
                if (this.x < -10 || this.x > 110 || this.y < -10 || this.y > 110) {
                    this.finish();
                }
            }
        } else if (this.state === 'stuck') {
            const jitterX = (Math.random() - 0.5) * 3;
            const jitterY = (Math.random() - 0.5) * 3;
            this.el.style.transform = `translate(${jitterX}px, ${jitterY}px)`;
        } 
        
        this.raf = requestAnimationFrame(() => this.loop());
    },

    finish() {
        State.save('lastMosquitoSpawn', Date.now());
        this.remove();
    },

    remove() {
        if (this.raf) cancelAnimationFrame(this.raf);
        SoundManager.stopBuzz();
        if (this.el && this.el.parentNode) this.el.remove();
        if (this.svg && this.svg.parentNode) this.svg.remove(); 
        this.el = null;
        this.svg = null;
        this.trailPoints = [];
        this.state = 'hidden';
    }
};