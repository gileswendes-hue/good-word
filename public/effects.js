import { State } from './state.js';
import { DOM } from './ui.js';
import { SoundManager } from './utils.js';
import { UIManager } from './ui.js';

export const TiltManager = {
    active: false,
    handle(e) {
        if (!TiltManager.active) return;
        const x = e.gamma || 0; 
        const y = e.beta || 0;
        const moveX = Math.min(Math.max(x, -25), 25);
        const moveY = Math.min(Math.max(y - 45, -25), 25);
        DOM.game.wordFrame.style.transition = 'transform 0.1s ease-out';
        DOM.game.wordFrame.style.transform = `translate3d(${moveX * 1.5}px, ${moveY * 1.5}px, 0)`;
    },
    start() {
        if (this.active) return;
        if (State.data.settings.enableTilt && State.data.currentTheme === 'default') {
            this.active = true;
            window.addEventListener('deviceorientation', this.handle, true);
        }
    },
    stop() {
        if (!this.active) return;
        this.active = false;
        window.removeEventListener('deviceorientation', this.handle, true);
        DOM.game.wordFrame.style.transform = ''; 
    },
    refresh() {
        this.stop();
        this.start();
    }
};

export const Physics = {
    balls: [],
    gx: 0,
    gy: 0.8,
    handleOrientation(e) {
        const x = e.gamma || 0,
            y = e.beta || 0;
        const tx = Math.min(Math.max(x / 4, -1), 1);
        const ty = Math.min(Math.max(y / 4, -1), 1);
        Physics.gx += (tx - Physics.gx) * 0.1;
        Physics.gy += (ty - Physics.gy) * 0.1
    },
    run() {
        const W = window.innerWidth,
            H = window.innerHeight;
        const cylW = Math.min(W, 500),
            minX = (W - cylW) / 2,
            maxX = minX + cylW;
        for (let s = 0; s < 8; s++) {
            Physics.balls.forEach(b => {
                if (!b.drag) {
                    b.vx += Physics.gx / 8;
                    b.vy += Physics.gy / 8;
                    b.x += b.vx;
                    b.y += b.vy;
                    b.vx *= 0.92;
                    b.vy *= 0.92;
                    if (b.x < minX) { b.x = minX; b.vx *= -0.2 }
                    if (b.x > maxX - b.r * 2) { b.x = maxX - b.r * 2; b.vx *= -0.2 }
                    if (b.y < 0) { b.y = 0; b.vy *= -0.2 }
                    if (b.y > H - b.r * 2) { b.y = H - b.r * 2; b.vy *= -0.2 }
                }
            });
            for (let i = 0; i < Physics.balls.length; i++) {
                for (let j = i + 1; j < Physics.balls.length; j++) {
                    const b1 = Physics.balls[i],
                        b2 = Physics.balls[j];
                    const dx = (b2.x + b2.r) - (b1.x + b1.r),
                        dy = (b2.y + b2.r) - (b1.y + b1.r);
                    const dist = Math.sqrt(dx * dx + dy * dy),
                        minDist = b1.r + b2.r + 0.5;
                    if (dist < minDist && dist > 0) {
                        const angle = Math.atan2(dy, dx),
                            tx = (Math.cos(angle) * (minDist - dist)) / 2,
                            ty = (Math.sin(angle) * (minDist - dist)) / 2;
                        b1.x -= tx;
                        b1.y -= ty;
                        b2.x += tx;
                        b2.y += ty;
                        if (!b1.drag && !b2.drag) {
                            const nx = dx / dist,
                                ny = dy / dist;
                            const p = 2 * (b1.vx * nx + b1.vy * ny - b2.vx * nx - b2.vy * ny) / 2;
                            b1.vx -= p * nx * 0.15;
                            b1.vy -= p * ny * 0.15;
                            b2.vx += p * nx * 0.15;
                            b2.vy += p * ny * 0.15
                        }
                    }
                }
            }
        }
        Physics.balls.forEach(b => {
            b.el.style.transform = `translate(${b.x}px,${b.y}px)`;
            if (b.bubble) {
                b.bubble.style.transform = `translate(${b.x+b.r}px,${b.y-20}px) translate(-50%,-100%)`
            }
        });
        Effects.ballLoop = requestAnimationFrame(Physics.run)
    }
};

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
        if (Math.random() > 0.3) return; 
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
            if (this.state === 'flying') {
                if (this.x > 110) { this.x = -10; this.trailPoints = []; }
                else if (this.x < -10) { this.x = 110; this.trailPoints = []; }
            }
            if (this.y < 5 || this.y > 95) {
                this.angle = -this.angle; 
                this.y = Math.max(5, Math.min(95, this.y));
            }
            this.el.style.left = this.x + '%';
            this.el.style.top = this.y + '%';
            const facingRight = Math.cos(this.angle) > 0;
            this.el.style.transform = facingRight ? 'scaleX(-1)' : 'scaleX(1)';
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
        } else if (this.state === 'thanking') {
            this.el.style.transform = `scale(1.2)`;
        }
        this.raf = requestAnimationFrame(() => this.loop());
    },

    eat() {
        if (this.state !== 'stuck') return;
        UIManager.showPostVoteMessage("Chomp! 🕷️");
        this.finish();
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

export const Effects = {
    spiderTimeout: null,
    webRaf: null,
    ballLoop: null,
    fishTimeout: null,
    spaceRareTimeout: null,
    
    plymouth(a) {
        const c = DOM.theme.effects.plymouth;
        if (!a) { c.innerHTML = ''; return }
        c.innerHTML = '';
        for (let i = 0; i < 100; i++) {
            const s = document.createElement('div');
            s.className = 'star-particle';
            const z = Math.random() * 2 + 1;
            s.style.width = s.style.height = `${z}px`;
            s.style.left = `${Math.random()*100}vw`;
            s.style.top = `${Math.random()*60}vh`;
            s.style.animationDuration = `${Math.random()*3+1}s`;
            s.style.animationDelay = `${Math.random()*2}s`;
            c.appendChild(s)
        }
    },
    fire() {
        const c = DOM.theme.effects.fire;
        c.innerHTML = '';
        for (let i = 0; i < 80; i++) {
            const p = document.createElement('div');
            p.className = 'fire-particle';
            p.style.animationDuration = `${Math.random()*1.5+0.5}s`;
            p.style.animationDelay = `${Math.random()}s`;
            p.style.left = `calc(10% + (80% * ${Math.random()}))`;
            const size = Math.random() * 3 + 2;
            p.style.width = p.style.height = `${size}em`;
            p.style.setProperty('--sway', `${(Math.random()-.5)*20}px`);
            c.appendChild(p)
        }
        for (let i = 0; i < 15; i++) {
            const s = document.createElement('div');
            s.className = 'smoke-particle';
            s.style.animationDelay = `${Math.random()*3}s`;
            s.style.left = `${Math.random()*90+5}%`;
            s.style.setProperty('--sway', `${(Math.random()-.5)*150}px`);
            c.appendChild(s)
        }
    },
    bubbles(active) {
        const c = DOM.theme.effects.bubble;
        if (this.fishTimeout) clearTimeout(this.fishTimeout);
        if (!active) { c.innerHTML = ''; return; }
        c.innerHTML = '';
        const cl = [10, 30, 70, 90];
        for (let i = 0; i < 40; i++) {
            const p = document.createElement('div');
            p.className = 'bubble-particle';
            const s = Math.random() * 30 + 10;
            p.style.width = p.style.height = `${s}px`;
            p.style.left = `${cl[Math.floor(Math.random()*cl.length)]+(Math.random()-.5)*20}%`;
            p.style.animationDuration = `${Math.random()*10+10}s`;
            p.style.animationDelay = `-${Math.random()*15}s`;
            c.appendChild(p);
        }
        const spawnFish = () => {
            if (!DOM.theme.effects.bubble.checkVisibility()) return;
            const fishTypes = ['🐟', '🐠', '🐡', '🦈'];
            const fishEmoji = fishTypes[Math.floor(Math.random() * fishTypes.length)];
            const wrap = document.createElement('div');
            wrap.className = 'submarine-fish-wrap';
            const inner = document.createElement('div');
            inner.className = 'submarine-fish-inner';
            inner.textContent = fishEmoji;
            wrap.appendChild(inner);
            const startLeft = Math.random() > 0.5; 
            const duration = Math.random() * 15 + 10;
            if (startLeft) inner.style.transform = "scaleX(-1)"; 
            wrap.style.transition = `left ${duration}s linear`;
            wrap.style.top = Math.random() * 80 + 10 + 'vh'; 
            wrap.style.left = startLeft ? '-100px' : '110vw';
            wrap.onclick = (e) => {
                e.stopPropagation();
                UIManager.showPostVoteMessage("Blub blub! 🫧");
                wrap.style.opacity = '0';
                setTimeout(() => wrap.remove(), 200);
            };
            c.appendChild(wrap);
            requestAnimationFrame(() => { wrap.style.left = startLeft ? '110vw' : '-100px'; });
            setTimeout(() => { if(wrap.parentNode) wrap.remove(); }, duration * 1000);
            this.fishTimeout = setTimeout(spawnFish, Math.random() * 7000 + 3000);
        };
        spawnFish();
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
            c.appendChild(f)
        }
    },
    summer() {
        const c = DOM.theme.effects.summer;
        c.innerHTML = '';
        const g = document.createElement('div');
        g.className = 'summer-grass';
        c.appendChild(g);
        for (let i = 0; i < 8; i++) {
            const d = document.createElement('div');
            d.className = `summer-cloud v${Math.floor(Math.random()*3)+1}`;
            const w = Math.random() * 100 + 100;
            d.style.width = `${w}px`;
            d.style.height = `${w*.35}px`;
            d.style.top = `${Math.random()*60}%`;
            d.style.animationDuration = `${Math.random()*60+60}s`;
            d.style.animationDelay = `-${Math.random()*100}s`;
            c.appendChild(d)
        }
    },
    halloween(active) {
        if (this.spiderTimeout) clearTimeout(this.spiderTimeout);
        if (this.webRaf) cancelAnimationFrame(this.webRaf);
        if (!active) {
            const old = document.getElementById('spider-wrap');
            if (old) old.remove();
            const oldWeb = document.getElementById('spider-web-corner');
            if (oldWeb) oldWeb.remove();
            return
        }
        if (!document.getElementById('spider-wrap')) {
            const wrap = document.createElement('div');
            wrap.id = 'spider-wrap';
            wrap.style.left = (Math.random() * 80 + 10) + '%';
            const scale = (Math.random() * .6 + .6).toFixed(2);
            wrap.innerHTML = `<div id="spider-anchor" style="transform: scale(${scale})"><div id="spider-thread"></div><div id="spider-body">🕷️<div id="spider-bubble"></div></div></div>`;
            document.body.appendChild(wrap);
            const thread = wrap.querySelector('#spider-thread'),
                body = wrap.querySelector('#spider-body'),
                bub = wrap.querySelector('#spider-bubble');
            const runDrop = () => {
                const phrases = ['ouch!', 'hey frend!', "I wouldn't hurt a fly!", "I'm more scared of you...", "I'm a web dev!", "just hanging", "fangs a lot!"];
                const txt = phrases[Math.floor(Math.random() * phrases.length)];
                bub.innerText = txt;
                const dist = Math.random() * 40 + 20;
                void thread.offsetWidth;
                thread.style.height = (dist + 20) + 'vh';
                body.onclick = () => {
                    State.unlockBadge('spider');
                    bub.style.opacity = '1';
                    setTimeout(() => bub.style.opacity = '0', 2000)
                };
                this.spiderTimeout = setTimeout(() => {
                    thread.style.height = '0';
                    setTimeout(() => {
                        if (wrap.parentNode) wrap.style.left = (Math.random() * 80 + 10) + '%';
                        this.spiderTimeout = setTimeout(runDrop, Math.random() * 15000 + 10000)
                    }, 20000)
                }, 20000 + (Math.random() * 3000 + 5000))
            };
            setTimeout(runDrop, Math.random() * 5000 + 2000)
        }
        if (!document.getElementById('spider-web-corner')) {
            const web = document.createElement('div');
            web.id = 'spider-web-corner';
            web.innerHTML = `<svg id="web-svg" viewBox="0 0 300 300" style="width:300px;height:300px;position:fixed;top:0;right:0;z-index:55;pointer-events:none;opacity:0.7;filter:drop-shadow(1px 1px 2px rgba(0,0,0,0.5))"></svg>`;
            document.body.appendChild(web);
            const svg = document.getElementById('web-svg');
            const cx = 300, cy = 0;
            const baseAnchors = [{ x: 0, y: 0 }, { x: 60, y: 100 }, { x: 140, y: 200 }, { x: 220, y: 270 }, { x: 300, y: 300 }];
            const animateWeb = () => {
                const time = Date.now();
                let pathStr = '';
                const curAnchors = baseAnchors.map((a, i) => {
                    if (i === 0 || i === baseAnchors.length - 1) return a;
                    const sway = Math.sin((time / 2000) + i) * 5;
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
            el.style.width = el.style.height = `${r*2}px`;
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
            el.onmousedown = el.ontouchstart = (e) => {
                b.drag = true;
                b.vx = b.vy = 0;
                const p = e.touches ? e.touches[0] : e;
                b.lastX = p.clientX;
                b.lastY = p.clientY;
                sx = p.clientX;
                sy = p.clientY;
                e.preventDefault()
            };
            el.onmouseup = el.ontouchend = (e) => {
                b.drag = false;
                const p = e.changedTouches ? e.changedTouches[0] : e;
                if ((type === 'germ' || type === 'rare') && Math.abs(p.clientX - sx) < 50 && Math.abs(p.clientY - sy) < 50) {
                    if (type === 'germ') State.unlockBadge('germ');
                    if (type === 'rare' && rareMap[content]) State.unlockBadge(rareMap[content]);
                    showThought(b, type === 'rare' ? `<span style="font-size:2em">${content}</span>` : null)
                }
            }
        };
        for (let i = 0; i < 80; i++) addBall(Math.random() < 0.005 ? 'rare' : 'normal');
        for (let i = 0; i < 5; i++) addBall('germ');
        window.onmouseup = window.ontouchend = () => { Physics.balls.forEach(b => b.drag = false) };
        window.onmousemove = window.ontouchmove = (e) => {
            const p = e.touches ? e.touches[0] : e;
            Physics.balls.forEach(b => {
                if (b.drag) {
                    b.vx = (p.clientX - b.lastX) * 0.5;
                    b.vy = (p.clientY - b.lastY) * 0.5;
                    b.x = p.clientX - b.r;
                    b.y = p.clientY - b.r;
                    b.lastX = p.clientX;
                    b.lastY = p.clientY
                }
            })
        };
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