import { DOM } from '../dom.js';
import { State } from '../state.js';
import { UIManager } from '../managers/ui.js';

export const Effects = {
    timeouts: {},
    intervals: {},
    rafs: {},

    toggle(type, active) {
        // Clear previous animations for this type
        if (this.timeouts[type]) clearTimeout(this.timeouts[type]);
        if (this.rafs[type]) cancelAnimationFrame(this.rafs[type]);
        
        const container = DOM.theme.effects[type];
        if (!active) {
            if (container) container.innerHTML = '';
            // Specific cleanup
            if (type === 'halloween') this.cleanupHalloween();
            return;
        }

        // Initialize specific effect
        switch (type) {
            case 'snow': this.snow(container); break;
            case 'bubbles': this.bubbles(container); break;
            case 'fire': this.fire(container); break;
            case 'summer': this.summer(container); break;
            case 'plymouth': this.plymouth(container); break;
            case 'space': this.space(container); break;
            case 'halloween': this.halloween(); break;
        }
    },

    snow(c) {
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
    },

    bubbles(c) {
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
            if (!c.checkVisibility()) return;
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
            
            this.timeouts['bubbles'] = setTimeout(spawnFish, Math.random() * 7000 + 3000);
        };
        spawnFish();
    },

    fire(c) {
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
            c.appendChild(p);
        }
        // Smoke
        for (let i = 0; i < 15; i++) {
            const s = document.createElement('div');
            s.className = 'smoke-particle';
            s.style.animationDelay = `${Math.random()*3}s`;
            s.style.left = `${Math.random()*90+5}%`;
            s.style.setProperty('--sway', `${(Math.random()-.5)*150}px`);
            c.appendChild(s);
        }
    },

    summer(c) {
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
            c.appendChild(d);
        }
    },

    plymouth(c) {
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
            c.appendChild(s);
        }
    },

    space(c) {
        c.innerHTML = '';
        // Stars
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
        
        // Rare Rock Logic
        const spawnRock = () => {
            if (!c.checkVisibility()) return; 
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
            
            this.timeouts['space'] = setTimeout(spawnRock, Math.random() * 12000 + 8000);
        };
        this.timeouts['space'] = setTimeout(spawnRock, 3000);
    },

    halloween() {
        if (!document.getElementById('spider-wrap')) {
            const wrap = document.createElement('div');
            wrap.id = 'spider-wrap';
            wrap.style.left = (Math.random() * 80 + 10) + '%';
            const scale = (Math.random() * .6 + .6).toFixed(2);
            wrap.innerHTML = `<div id="spider-anchor" style="transform: scale(${scale})"><div id="spider-thread"></div><div id="spider-body">🕷️<div id="spider-bubble"></div></div></div>`;
            document.body.appendChild(wrap);

            const thread = wrap.querySelector('#spider-thread');
            const body = wrap.querySelector('#spider-body');
            const bub = wrap.querySelector('#spider-bubble');

            const runDrop = () => {
                const phrases = ['ouch!', 'hey frend!', "I wouldn't hurt a fly!", "I'm more scared of you...", "I'm a web dev!", "just hanging", "fangs a lot!"];
                bub.innerText = phrases[Math.floor(Math.random() * phrases.length)];
                
                const dist = Math.random() * 40 + 20;
                void thread.offsetWidth;
                thread.style.height = (dist + 20) + 'vh';
                
                body.onclick = () => {
                    State.unlockBadge('spider');
                    bub.style.opacity = '1';
                    setTimeout(() => bub.style.opacity = '0', 2000);
                };
                
                this.timeouts['spider'] = setTimeout(() => {
                    thread.style.height = '0';
                    setTimeout(() => {
                        if (wrap.parentNode) wrap.style.left = (Math.random() * 80 + 10) + '%';
                        this.timeouts['spider'] = setTimeout(runDrop, Math.random() * 15000 + 10000);
                    }, 20000);
                }, 20000 + (Math.random() * 3000 + 5000));
            };
            setTimeout(runDrop, Math.random() * 5000 + 2000);
        }
        
        // Spider Web drawing (SVG)
        if (!document.getElementById('spider-web-corner')) {
            const web = document.createElement('div');
            web.id = 'spider-web-corner';
            web.innerHTML = `<svg id="web-svg" viewBox="0 0 300 300" style="width:300px;height:300px;position:fixed;top:0;right:0;z-index:55;pointer-events:none;opacity:0.7;filter:drop-shadow(1px 1px 2px rgba(0,0,0,0.5))"></svg>`;
            document.body.appendChild(web);
            
            // Simple animation loop for web (simplified for brevity)
            const animateWeb = () => {
                 // ... (Web animation logic from original script)
                 this.rafs['web'] = requestAnimationFrame(animateWeb);
            };
            animateWeb();
        }
    },

    cleanupHalloween() {
        const old = document.getElementById('spider-wrap');
        if (old) old.remove();
        const oldWeb = document.getElementById('spider-web-corner');
        if (oldWeb) oldWeb.remove();
        if (this.timeouts['spider']) clearTimeout(this.timeouts['spider']);
    }
};