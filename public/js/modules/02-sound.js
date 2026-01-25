/**
 * ============================================================================
 * GOOD WORD / BAD WORD - SOUND & INTERACTION MODULE (02-sound.js)
 * ============================================================================
 * 
 * Contains:
 * - SoundManager: Web Audio API sound effects
 * - MosquitoManager: Halloween bug easter egg
 * - TiltManager: Device orientation for card tilt
 * - Physics: Ball pit physics simulation
 * - GAME_DIALOGUE: Easter egg messages
 * 
 * Dependencies: 01-core.js
 * ============================================================================
 */

(function() {
'use strict';

// ============================================================================
// GAME DIALOGUE - Easter Egg Messages
// ============================================================================
const GAME_DIALOGUE = {
    insects: {
        '🦟': "You saved the mosquito! 🦟",
        '🐞': "Ladybird rescued! 🐞",
        '🐝': "Bee saved! 🐝",
        '🚁': "Chopper extracted! 🚁"
    }
};

// ============================================================================
// SOUND MANAGER - Web Audio API
// ============================================================================
const SoundManager = {
    ctx: null,
    masterGain: null,
    mosquitoOsc: null,
    mosquitoGain: null,
    
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.connect(this.ctx.destination);
            this.updateMute();
        }
    },
    
    updateMute() {
        if (this.masterGain) {
            const isMuted = State.data.settings.muteSounds;
            this.masterGain.gain.setValueAtTime(isMuted ? 0 : 0.3, this.ctx.currentTime);
            if (isMuted) this.stopBuzz();
        }
    },
    
    playTone(freq, type, duration, vol = 1) {
        if (!this.ctx) this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },
    
    playGood() {
        this.playTone(880, 'sine', 0.6, 0.4);
        setTimeout(() => this.playTone(1760, 'sine', 0.4, 0.2), 50);
    },
    
    playBad() {
        if (!this.ctx) this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.8, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    },
    
    playWhoosh() {
        if (!this.ctx) this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 0.1);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    },
    
    playPop() {
        if (State.data.settings.muteSounds) return;
        if (!this.ctx) this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(t + 0.15);
    },
    
    playUnlock() {
        if (!this.ctx) this.init();
        const now = this.ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.1, now + 0.5 + (i * 0.1));
            gain.gain.linearRampToValueAtTime(0, now + 3);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start();
            osc.stop(now + 3.5);
        });
    },
    
    startBuzz() {
        if (State.data.settings.muteSounds) return;
        if (!this.ctx) this.init();
        if (this.mosquitoOsc) this.stopBuzz();
        this.mosquitoOsc = this.ctx.createOscillator();
        this.mosquitoOsc.type = 'sawtooth';
        this.mosquitoOsc.frequency.value = 600;
        this.mosquitoGain = this.ctx.createGain();
        this.mosquitoGain.gain.setValueAtTime(0.015, this.ctx.currentTime);
        this.mosquitoOsc.connect(this.mosquitoGain);
        this.mosquitoGain.connect(this.masterGain);
        this.mosquitoOsc.start();
        this.rampBuzzPitch();
    },
    
    rampBuzzPitch() {
        if (!this.mosquitoOsc) return;
        const nextTime = this.ctx.currentTime + (Math.random() * 0.2 + 0.1);
        const nextPitch = 550 + Math.random() * 200;
        this.mosquitoOsc.frequency.linearRampToValueAtTime(nextPitch, nextTime);
        setTimeout(() => this.rampBuzzPitch(), 150);
    },
    
    setStuckMode(isStuck) {
        if (!this.mosquitoOsc) return;
        const pitch = isStuck ? 900 : 600;
        this.mosquitoOsc.frequency.setValueAtTime(pitch, this.ctx.currentTime);
        this.mosquitoGain.gain.linearRampToValueAtTime(isStuck ? 0.05 : 0.02, this.ctx.currentTime + 0.1);
    },
    
    stopBuzz() {
        if (this.mosquitoOsc) {
            try { this.mosquitoOsc.stop(); } catch(e){}
            this.mosquitoOsc.disconnect();
            this.mosquitoOsc = null;
        }
    }
};

// ============================================================================
// MOSQUITO MANAGER - Halloween Bug Easter Egg
// ============================================================================
const MosquitoManager = {
    el: null, svg: null, path: null, checkInterval: null,
    x: 50, y: 50, angle: 0,
    speed: 0.2,
    turnCycle: 0, loopTimer: 0,
    trailPoints: [], MAX_TRAIL: 80,
    state: 'hidden', raf: null,
    huntTimer: null,
    type: '🦟',
    config: {},
    COOLDOWN: 1 * 60 * 1000,
    TYPES: {
        '🐞': { name: 'Ladybird', speed: 0.2, turnRate: 0.005, wobble: 0.01, badge: null },
        '🐝': { name: 'Bee', speed: 0.35, turnRate: 0.1, wobble: 0.05, badge: null },
        '🦟': { name: 'Mosquito', speed: 0.2, turnRate: 0.02, wobble: 0.02, badge: null },
        '🚁': { name: 'Chopper', speed: 0.45, turnRate: 0.001, wobble: 0.0, badge: 'chopper' }
    },
    
    startMonitoring() {
        if (this.checkInterval) clearInterval(this.checkInterval);
        this.attemptSpawn();
        this.checkInterval = setInterval(() => this.attemptSpawn(), 10000);
    },
    
    attemptSpawn() {
        if (State.runtime.currentTheme !== 'halloween') return;
        if (this.el) return;
        const now = Date.now();
        const last = State.data.lastMosquitoSpawn;
        if (now - last < this.COOLDOWN) return;
        if (Math.random() > 0.3) return;
        this.init();
    },
    
    spawnStuck(typeChar) {
        if (this.el) this.remove();
        this.type = typeChar || '🦟';
        this.config = this.TYPES[this.type] || this.TYPES['🦟'];
        this.el = document.createElement('div');
        this.el.textContent = this.type;
        this.el.className = 'mosquito-entity';
        this.x = 88;
        this.y = 20;
        Object.assign(this.el.style, {
            position: 'fixed',
            fontSize: '1.8rem',
            zIndex: '100',
            left: this.x + '%',
            top: this.y + '%',
            transform: 'translate(-50%, -50%)',
            filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.5))',
            cursor: 'pointer',
            pointerEvents: 'auto'
        });
        this.el.onclick = (e) => {
            e.stopPropagation();
            if (this.state === 'stuck') {
                if (this.huntTimer) clearTimeout(this.huntTimer);
                this.splat();
            }
            else if (this.state === 'flying') {
                this.splat();
            }
        };
        document.body.appendChild(this.el);
        this.state = 'stuck';
        setTimeout(() => {
            if (State.runtime.currentTheme === 'halloween' && window.Effects) {
                Effects.spiderHunt(this.x, this.y, true);
            }
        }, 100);
    },
    
    init() {
        if (this.el) this.remove();
        let rareChance = 0.02;
        if (State.data.insectStats.saved > 20) rareChance = 0.05;
        if (State.data.insectStats.saved > 50) rareChance = 0.10;
        const keys = ['🐞', '🐝', '🦟'];
        const isRare = Math.random() < rareChance;
        this.type = isRare ? '🚁' : keys[Math.floor(Math.random() * keys.length)];
        this.config = this.TYPES[this.type];
        this.speed = this.config.speed;
        this.el = document.createElement('div');
        this.el.textContent = this.type;
        this.el.className = 'mosquito-entity';
        const startRight = Math.random() > 0.5;
        this.x = startRight ? 105 : -5;
        this.y = Math.random() * 50 + 10;
        this.angle = startRight ? Math.PI : 0;
        Object.assign(this.el.style, {
            position: 'fixed',
            fontSize: this.type === '🚁' ? '2.5rem' : '1.8rem',
            zIndex: '100',
            pointerEvents: 'auto', cursor: 'pointer', transition: 'none',
            filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.5))',
            left: this.x + '%', top: this.y + '%', willChange: 'transform, left, top'
        });
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        Object.assign(this.svg.style, {
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            pointerEvents: 'none', zIndex: '99'
        });
        this.path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this.path.setAttribute("fill", "none");
        this.path.setAttribute("stroke", "rgba(255, 255, 255, 0.6)");
        this.path.setAttribute("stroke-width", "1.5");
        this.path.setAttribute("stroke-dasharray", "5, 5");
        this.path.setAttribute("stroke-linecap", "round");
        this.svg.appendChild(this.path);
        document.body.appendChild(this.svg);
        document.body.appendChild(this.el);
        this.el.onclick = (e) => {
            e.stopPropagation();
            if (this.state === 'stuck') {
                if (this.huntTimer) clearTimeout(this.huntTimer);
                this.startRescue();
            }
            else if (this.state === 'flying') {
                this.splat();
            }
        };
        this.state = 'flying';
        this.trailPoints = [];
        this.turnCycle = Math.random() * 100;
        SoundManager.startBuzz();
        this.loop();
    },
    
    startRescue() {
        this.state = 'thanking';
        SoundManager.stopBuzz();
        if (this.path) this.path.setAttribute('d', '');
        State.data.insectStats.saved++;
        State.save('insectStats', State.data.insectStats);
        if (this.config.badge) State.unlockBadge(this.config.badge);
        if (State.data.insectStats.saved >= 100) State.unlockBadge('saint');
        const msg = GAME_DIALOGUE.insects[this.type] || "Saved!";
        if (window.UIManager) UIManager.showPostVoteMessage(msg);
        const bubble = document.createElement('div');
        bubble.textContent = "Thank you! 💖";
        Object.assign(bubble.style, {
            position: 'absolute', bottom: '100%', left: '50%',
            transform: 'translateX(-50%)', background: 'white', color: 'black',
            padding: '4px 8px', borderRadius: '8px', fontSize: '12px',
            fontWeight: 'bold', whiteSpace: 'nowrap', border: '1px solid #ccc',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)', pointerEvents: 'none', zIndex: '101'
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
    
    splat() {
        if (this.state === 'splatted') return;
        this.state = 'splatted';
        State.data.insectStats.splatted = (State.data.insectStats.splatted || 0) + 1;
        if (!State.data.insectStats.collection) State.data.insectStats.collection = [];
        if (!State.data.insectStats.collection.includes(this.type)) {
            State.data.insectStats.collection.push(this.type);
        }
        State.save('insectStats', State.data.insectStats);
        if (window.UIManager) UIManager.showPostVoteMessage("Splat! 🦶");
        Haptics.heavy();
        this.el.style.transition = 'transform 0.1s ease-out, opacity 0.2s';
        this.el.style.transform = 'translate(-50%, -50%) scale(1.5) rotate(45deg)';
        this.el.style.filter = 'grayscale(100%) brightness(0.5)';
        this.el.style.opacity = '0';
        setTimeout(() => this.remove(), 200);
    },
    
    loop() {
        if (!document.body.contains(this.el)) return;
        if (this.state === 'flying' || this.state === 'leaving') {
            this.turnCycle += this.config.turnRate;
            let turnAmount = Math.sin(this.turnCycle) * this.config.wobble;
            if (this.type === '🚁') {
                turnAmount = 0;
                this.y += Math.sin(Date.now() / 200) * 0.05;
            }
            this.angle += turnAmount;
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
            if (this.state === 'flying') {
                if (this.x > 110) {
                    this.x = -10;
                    this.angle = 0 + (Math.random() * 0.5 - 0.25);
                    this.trailPoints = [];
                }
                else if (this.x < -10) {
                    this.x = 110;
                    this.angle = Math.PI + (Math.random() * 0.5 - 0.25);
                    this.trailPoints = [];
                }
                if (this.y < 5 || this.y > 95) {
                    this.angle = -this.angle;
                    this.y = Math.max(5, Math.min(95, this.y));
                }
            }
            this.el.style.left = this.x + '%';
            this.el.style.top = this.y + '%';
            const facingRight = Math.cos(this.angle) > 0;
            this.el.style.transform = `translate(-50%, -50%) ${facingRight ? 'scaleX(-1)' : 'scaleX(1)'}`;
            const pxX = (this.x / 100) * window.innerWidth;
            const pxY = (this.y / 100) * window.innerHeight;
            if (pxX > 0 && pxX < window.innerWidth) this.trailPoints.push({x: pxX, y: pxY});
            if (this.trailPoints.length > this.MAX_TRAIL) this.trailPoints.shift();
            if (this.trailPoints.length > 1) {
                const d = `M ${this.trailPoints.map(p => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L ')}`;
                this.path.setAttribute('d', d);
            }
            const distRight = window.innerWidth - pxX;
            const distTop = pxY;
            const inWebZone = (distRight + distTop) < 300;
            const isVisible = pxX > 50 && pxX < (window.innerWidth - 50) && pxY > 50 && pxY < (window.innerHeight - 50);
            if (this.state === 'flying' && inWebZone && isVisible && !State.data.settings.arachnophobiaMode) {
                this.state = 'stuck';
                SoundManager.stopBuzz();
                if (window.UIManager) UIManager.showPostVoteMessage(`The ${this.config.name} is stuck!`);
                this.huntTimer = setTimeout(() => {
                    if (this.state === 'stuck' && window.Effects) Effects.spiderHunt(this.x, this.y, true);
                }, 2500);
            }
            if (this.state === 'leaving') {
                if (this.x < -10 || this.x > 110 || this.y < -10 || this.y > 110) this.finish();
            }
        } else if (this.state === 'stuck') {
            const jitterX = (Math.random() - 0.5) * 5;
            const jitterY = (Math.random() - 0.5) * 5;
            this.el.style.transform = `translate(calc(-50% + ${jitterX}px), calc(-50% + ${jitterY}px))`;
        } else if (this.state === 'thanking') {
            this.el.style.transform = `translate(-50%, -50%) scale(1.2)`;
        }
        this.raf = requestAnimationFrame(() => this.loop());
    },
    
    eat() {
        if (this.state !== 'stuck') return;
        if (window.UIManager) UIManager.showPostVoteMessage("Chomp! 🕷️");
        State.data.insectStats.eaten++;
        State.save('insectStats', State.data.insectStats);
        if (State.data.insectStats.eaten >= 100) State.unlockBadge('exterminator');
        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000);
        if (!State.data.spiderEatLog) State.data.spiderEatLog = [];
        State.data.spiderEatLog.push(now);
        State.data.spiderEatLog = State.data.spiderEatLog.filter(t => t > oneHourAgo);
        State.save('spiderEatLog', State.data.spiderEatLog);
        if (State.data.spiderEatLog.length >= 5) {
            State.data.spiderFullUntil = Date.now() + (60 * 60 * 1000);
            State.save('spiderFullUntil', State.data.spiderFullUntil);
            setTimeout(() => {
                if (window.UIManager) UIManager.showPostVoteMessage("The spider is stuffed! 🕷️💤");
            }, 1500);
        }
        this.finish();
    },
    
    finish() {
        State.save('lastMosquitoSpawn', Date.now());
        this.remove();
    },
    
    remove() {
        if (this.raf) cancelAnimationFrame(this.raf);
        if (this.huntTimer) clearTimeout(this.huntTimer);
        SoundManager.stopBuzz();
        if (this.el && this.el.parentNode) this.el.remove();
        if (this.svg && this.svg.parentNode) this.svg.remove();
        this.el = null;
        this.svg = null;
        this.trailPoints = [];
        this.state = 'hidden';
    }
};

// ============================================================================
// TILT MANAGER - Device Orientation
// ============================================================================
const TiltManager = {
    active: false,
    
    handle(e) {
        if (!TiltManager.active) return;
        const x = e.gamma || 0;
        const y = e.beta || 0;
        const moveX = Math.min(Math.max(x, -25), 25);
        const moveY = Math.min(Math.max(y - 45, -25), 25);
        if (DOM.game && DOM.game.wordFrame) {
            DOM.game.wordFrame.style.transition = 'transform 0.1s ease-out';
            DOM.game.wordFrame.style.transform = `translate3d(${moveX * 1.5}px, ${moveY * 1.5}px, 0)`;
        }
    },
    
    start() {
        if (this.active) return;
        if (State.data.settings.enableTilt && State.runtime.currentTheme === 'default') {
            this.active = true;
            window.addEventListener('deviceorientation', this.handle, true);
        }
    },
    
    stop() {
        if (!this.active) return;
        this.active = false;
        window.removeEventListener('deviceorientation', this.handle, true);
        if (DOM.game && DOM.game.wordFrame) {
            DOM.game.wordFrame.style.transform = '';
        }
    },
    
    refresh() {
        this.stop();
        this.start();
    }
};

// ============================================================================
// PHYSICS - Ball Pit Simulation
// ============================================================================
const Physics = {
    balls: [],
    gx: 0,
    gy: 0.7,
    grid: {},
    gridSize: 70,
    frameSkip: 0,
    
    handleOrientation(e) {
        const x = e.gamma || 0,
            y = e.beta || 0;
        const tx = Math.min(Math.max(x / 6, -0.6), 0.6);
        const ty = Math.min(Math.max(y / 6, -0.6), 0.6);
        Physics.gx += (tx - Physics.gx) * 0.05;
        Physics.gy += (ty - Physics.gy) * 0.05;
    },
    
    getGridKey(x, y) {
        return `${Math.floor(x / this.gridSize)},${Math.floor(y / this.gridSize)}`;
    },
    
    buildGrid() {
        this.grid = {};
        for (let i = 0; i < this.balls.length; i++) {
            const b = this.balls[i];
            const key = this.getGridKey(b.x + b.r, b.y + b.r);
            if (!this.grid[key]) this.grid[key] = [];
            this.grid[key].push(i);
        }
    },
    
    getNeighbors(b) {
        const cx = Math.floor((b.x + b.r) / this.gridSize);
        const cy = Math.floor((b.y + b.r) / this.gridSize);
        const neighbors = [];
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const key = `${cx + dx},${cy + dy}`;
                if (this.grid[key]) neighbors.push(...this.grid[key]);
            }
        }
        return neighbors;
    },
    
    run() {
        const W = window.innerWidth,
            H = window.innerHeight;
        const cylW = Math.min(W, 500),
            minX = (W - cylW) / 2,
            maxX = minX + cylW;
        const balls = Physics.balls;
        const len = balls.length;
        const substeps = len > 50 ? 4 : 6;
        
        for (let s = 0; s < substeps; s++) {
            for (let i = 0; i < len; i++) {
                const b = balls[i];
                if (!b.drag) {
                    b.vx += Physics.gx / substeps;
                    b.vy += Physics.gy / substeps;
                    b.x += b.vx;
                    b.y += b.vy;
                    b.vx *= 0.88;
                    b.vy *= 0.88;
                    if (Math.abs(b.vx) < 0.08) b.vx = 0;
                    if (Math.abs(b.vy) < 0.08) b.vy = 0;
                    if (b.x < minX) { b.x = minX; b.vx *= -0.15; }
                    if (b.x > maxX - b.r * 2) { b.x = maxX - b.r * 2; b.vx *= -0.15; }
                    if (b.y < 0) { b.y = 0; b.vy *= -0.15; }
                    if (b.y > H - b.r * 2) { b.y = H - b.r * 2; b.vy *= -0.15; }
                }
            }
            
            Physics.buildGrid();
            const checked = new Set();
            
            for (let i = 0; i < len; i++) {
                const b1 = balls[i];
                const neighbors = Physics.getNeighbors(b1);
                for (const j of neighbors) {
                    if (j <= i) continue;
                    const pairKey = i < j ? `${i},${j}` : `${j},${i}`;
                    if (checked.has(pairKey)) continue;
                    checked.add(pairKey);
                    const b2 = balls[j];
                    const dx = (b2.x + b2.r) - (b1.x + b1.r);
                    const dy = (b2.y + b2.r) - (b1.y + b1.r);
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const minDist = b1.r + b2.r;
                    if (dist < minDist && dist > 0) {
                        const overlap = (minDist - dist) / 2;
                        const nx = dx / dist;
                        const ny = dy / dist;
                        if (!b1.drag) { b1.x -= overlap * nx; b1.y -= overlap * ny; }
                        if (!b2.drag) { b2.x += overlap * nx; b2.y += overlap * ny; }
                        const dvx = b1.vx - b2.vx;
                        const dvy = b1.vy - b2.vy;
                        const dvn = dvx * nx + dvy * ny;
                        if (dvn > 0) {
                            const restitution = 0.3;
                            if (!b1.drag) { b1.vx -= dvn * nx * restitution; b1.vy -= dvn * ny * restitution; }
                            if (!b2.drag) { b2.vx += dvn * nx * restitution; b2.vy += dvn * ny * restitution; }
                        }
                    }
                }
            }
        }
        
        for (let i = 0; i < len; i++) {
            const b = balls[i];
            b.el.style.transform = `translate(${b.x}px, ${b.y}px)`;
            if (b.bubble) {
                b.bubble.style.transform = `translate(${b.x + b.r}px, ${b.y - 20}px) translate(-50%, -100%)`;
            }
        }
        // Continue animation loop
        Effects.ballLoop = requestAnimationFrame(Physics.run);
    }
};

// ============================================================================
// EXPORTS
// ============================================================================
window.GAME_DIALOGUE = GAME_DIALOGUE;
window.SoundManager = SoundManager;
window.MosquitoManager = MosquitoManager;
window.TiltManager = TiltManager;
window.Physics = Physics;

console.log('%c[Sound] Module loaded', 'color: #22c55e; font-weight: bold');

})();
