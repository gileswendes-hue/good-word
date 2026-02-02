/**
 * ============================================================================
 * GOOD WORD / BAD WORD - EFFECTS MODULE (05-effects.js)
 * ============================================================================
 * * Contains:
 * - Effects: Visual effects for themes not yet moved to standalone files
 * - rain, weatherSnow (Global weather overlay)
 * - summer
 * - space
 * - ShareManager: QR code and image sharing
 * * * NOTE: The following themes are now loaded via smart-loader from /themes/:
 * - Halloween, Woodland, Flight, Ocean, Ballpit, Fire, Plymouth, Submarine, Winter
 * ============================================================================
 */

(function() {
'use strict';

const StandardEffects = {
    // Timeout references for internal effects
    spiderTimeout: null,
    webRaf: null,
    ballLoop: null,
    spaceRareTimeout: null,
    plymouthShooterTimeout: null,
    plymouthStreakTimeout: null,
    satelliteTimeout: null,

    rain(active, opts = {}) {
        // Improved rain: variable intensity, wind/gusts, ground splashes, continuous spawn
        const c = document.getElementById('rain-effect');
        if (!c) return;

        // Normalize active and options
        let enabled = !!active;
        let intensity = opts.intensity || 'medium'; // 'light'|'medium'|'heavy'
        if (typeof active === 'object' && !opts) {
            intensity = active.intensity || intensity;
            enabled = true;
        }

        // Cleanup helper
        const cleanup = () => {
            c.innerHTML = '';
            c.classList.add('hidden');
            c.style.display = 'none';
            // clear intervals/timeouts if previously set
            if (this.rainWindInterval) { clearInterval(this.rainWindInterval); this.rainWindInterval = null; }
            if (this.rainSplashInterval) { clearInterval(this.rainSplashInterval); this.rainSplashInterval = null; }
            if (this.rainRespawnInterval) { clearInterval(this.rainRespawnInterval); this.rainRespawnInterval = null; }
            if (this.rainGustTimeout) { clearTimeout(this.rainGustTimeout); this.rainGustTimeout = null; }
        };

        if (!enabled) {
            cleanup();
            return;
        }

        // Show container
        c.style.display = '';
        c.classList.remove('hidden');
        c.style.position = 'fixed';
        c.style.inset = '0';
        c.style.pointerEvents = 'none';
        c.style.zIndex = '60';

        // If already populated, leave it running (avoid recreating)
        if (c.dataset.rainInitialized === '1') {
            // If switching intensity, we may want to switch to canvas mode
            if (this._rainIntensity !== intensity) {
                // cleanup and re-init
                cleanup();
            } else return;
        }
        c.dataset.rainInitialized = '1';

        // Decide whether to use canvas renderer for heavy rain
        const useCanvas = opts.useCanvas || intensity === 'heavy';

        // Intensity tuning
        let count = 80;
        let splashRate = 700; // ms between splash attempts
        let dropSpeedMin = 0.9;
        let dropSpeedMax = 1.4;
        if (intensity === 'light') { count = 60; splashRate = 1200; dropSpeedMin = 1.2; dropSpeedMax = 1.8; }
        else if (intensity === 'heavy') { count = 220; splashRate = 280; dropSpeedMin = 0.6; dropSpeedMax = 1.1; }

        // Inject minimal CSS for rain if not present (improved realism: depth, taper, splashes)
        if (!document.getElementById('effects-rain-styles')) {
            const style = document.createElement('style');
            style.id = 'effects-rain-styles';
            style.textContent = `
                .rain-drop { position: fixed; top: -8vh; width: 2px; height: 14vh; background: linear-gradient(to bottom, rgba(255,255,255,0.95) 0%, rgba(200,220,255,0.5) 40%, rgba(180,200,255,0.15) 100%); opacity: .6; transform: translateZ(0); border-radius: 1px; box-shadow: 0 0 4px rgba(255,255,255,0.3); }
                .rain-drop.far { width: 1px; height: 10vh; opacity: .35; }
                .rain-drop.near { width: 2.5px; height: 18vh; opacity: .75; }
                @keyframes rain-fall {
                    0% { transform: translate3d(var(--wind,0px), -10vh, 0) rotate(var(--rot,0deg)); opacity: 0.5; }
                    15% { opacity: 0.85; }
                    85% { opacity: 0.9; }
                    100% { transform: translate3d(calc(var(--wind,0px) + 0px), 110vh, 0) rotate(var(--rot,0deg)); opacity: 0.0; }
                }
                .rain-splash { position: fixed; bottom: 4px; width: 12px; height: 8px; border-radius: 50%; background: radial-gradient(ellipse 60% 40% at 50% 50%, rgba(255,255,255,0.7), rgba(180,200,255,0.2)); transform-origin: center bottom; opacity: 0; pointer-events: none; }
                .rain-splash-ring { position: fixed; bottom: 4px; width: 16px; height: 4px; border: 1px solid rgba(255,255,255,0.5); border-radius: 50%; transform-origin: center bottom; opacity: 0; pointer-events: none; }
                @keyframes splash-pop {
                    0% { transform: translateY(0) scaleX(0.3) scaleY(0.2); opacity: 0.95; }
                    50% { transform: translateY(-8px) scaleX(1.2) scaleY(0.6); opacity: 0.6; }
                    100% { transform: translateY(-14px) scaleX(1.5) scaleY(0.25); opacity: 0; }
                }
                @keyframes splash-ring {
                    0% { transform: translateY(0) scaleX(0.2) scaleY(0.2); opacity: 0.8; }
                    100% { transform: translateY(-6px) scaleX(1.8) scaleY(0.4); opacity: 0; }
                }
                .rain-mist { position: fixed; bottom: 0; left: 0; right: 0; height: 25vh; background: linear-gradient(to top, rgba(100,120,140,0.12), transparent); pointer-events: none; }
            `;
            document.head.appendChild(style);
        }

        // Create drops with depth layers (near = slower/larger, far = faster/smaller)
        const depthRatio = 0.25; // 25% far, 50% default, 25% near
        for (let i = 0; i < count; i++) {
            const r = Math.random();
            let depthClass = '';
            let durationMul = 1;
            if (r < depthRatio) { depthClass = 'far'; durationMul = 0.75; }
            else if (r > 1 - depthRatio) { depthClass = 'near'; durationMul = 1.25; }
            const drop = document.createElement('div');
            drop.className = 'rain-drop' + (depthClass ? ' ' + depthClass : '');
            const left = Math.random() * 100;
            drop.style.left = `${left}vw`;
            const duration = ((Math.random() * (dropSpeedMax - dropSpeedMin) + dropSpeedMin) * durationMul).toFixed(2) + 's';
            drop.style.animationDuration = duration;
            drop.style.animationTimingFunction = 'linear';
            drop.style.animationDelay = (Math.random() * 2.5) + 's';
            drop.style.setProperty('animation-name', 'rain-fall');
            const rot = (Math.random() - 0.5) * 12;
            drop.style.setProperty('--rot', rot + 'deg');
            drop.style.opacity = (Math.random() * 0.5 + 0.3).toFixed(2);
            drop.style.animationIterationCount = 'infinite';
            c.appendChild(drop);
        }
        // Optional mist layer at bottom for heavy rain
        if (intensity === 'heavy' && !c.querySelector('.rain-mist')) {
            const mist = document.createElement('div');
            mist.className = 'rain-mist';
            c.appendChild(mist);
        }

        // Canvas renderer for heavy rain (higher particle counts, better perf)
        if (useCanvas) {
            // Cleanup DOM drops created above to avoid duplicate visuals
            try {
                c.innerHTML = '';
            } catch (e) {}
            if (this.rainCanvas) {
                try { cancelAnimationFrame(this.rainCanvas.raf); } catch (e) {}
                try { this.rainCanvas.el.remove(); } catch (e) {}
                this.rainCanvas = null;
            }
            const canvas = document.createElement('canvas');
            canvas.id = 'rain-canvas';
            Object.assign(canvas.style, { position: 'fixed', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 60 });
            document.body.appendChild(canvas);
            const ctx = canvas.getContext('2d');
            const DPR = window.devicePixelRatio || 1;
            const resize = () => {
                canvas.width = window.innerWidth * DPR;
                canvas.height = window.innerHeight * DPR;
                canvas.style.width = window.innerWidth + 'px';
                canvas.style.height = window.innerHeight + 'px';
                ctx.scale(DPR, DPR);
            };
            resize();
            window.addEventListener('resize', resize);

            // create drops with depth (near = longer/slower, far = shorter/faster)
            const drops = [];
            const total = Math.max(count, 200);
            for (let i = 0; i < total; i++) {
                const x = Math.random() * window.innerWidth;
                const y = Math.random() * window.innerHeight - window.innerHeight;
                const depth = Math.random(); // 0 = far, 1 = near
                const len = 6 + depth * 14 + Math.random() * 4;
                const speedMul = 0.7 + depth * 0.6;
                const speed = (Math.random() * (dropSpeedMax - dropSpeedMin) + dropSpeedMin) * (2.5 + Math.random() * 2) * speedMul;
                const wobble = (Math.random() - 0.5) * 0.15;
                drops.push({ x, y, len, speed, rot: (Math.random() - 0.5) * 0.25, depth, wobble, phase: Math.random() * Math.PI * 2 });
            }

            let last = performance.now();
            const rafLoop = () => {
                const now = performance.now();
                const dt = (now - last) / 1000;
                last = now;
                ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
                const windBase = Math.sin(now / 1200) * 25 + Math.sin(now / 400) * 8;
                const wind = windBase * (intensity === 'heavy' ? 1.4 : 0.7);
                for (let i = 0; i < drops.length; i++) {
                    const d = drops[i];
                    const sway = Math.sin(now / 500 + d.phase) * d.wobble * 40 * dt;
                    d.x += (wind * 0.35 + sway) * dt;
                    d.y += d.speed * dt * 55;
                    if (d.y > window.innerHeight + 30) {
                        d.y = -Math.random() * 250;
                        d.x = Math.random() * window.innerWidth;
                    }
                    const alpha = 0.4 + d.depth * 0.5;
                    const grad = ctx.createLinearGradient(d.x, d.y, d.x + d.rot * d.len, d.y + d.len);
                    grad.addColorStop(0, `rgba(220,235,255,${alpha})`);
                    grad.addColorStop(0.3, `rgba(190,210,255,${alpha * 0.8})`);
                    grad.addColorStop(1, `rgba(160,185,220,0.15)`);
                    ctx.strokeStyle = grad;
                    ctx.lineWidth = 0.8 + d.depth * 1;
                    ctx.lineCap = 'round';
                    ctx.beginPath();
                    ctx.moveTo(d.x - d.rot * d.len * 0.5, d.y);
                    ctx.lineTo(d.x + d.rot * d.len * 0.5, d.y + d.len);
                    ctx.stroke();
                }
                this.rainCanvas.raf = requestAnimationFrame(rafLoop);
            };
            this.rainCanvas = { el: canvas, ctx, raf: null, resize };
            this.rainCanvas.raf = requestAnimationFrame(rafLoop);
        }

        // Splashes: main blob + optional ring for realism
        const createSplashAt = (xPx) => {
            const s = document.createElement('div');
            s.className = 'rain-splash';
            s.style.left = (xPx - 6) + 'px';
            s.style.animation = `splash-pop ${0.4 + Math.random() * 0.28}s ease-out forwards`;
            document.body.appendChild(s);
            setTimeout(() => { try { s.remove(); } catch (e) {} }, 1000);
            if (Math.random() < 0.4) {
                const ring = document.createElement('div');
                ring.className = 'rain-splash-ring';
                ring.style.left = (xPx - 8) + 'px';
                ring.style.animation = `splash-ring ${0.35 + Math.random() * 0.2}s ease-out forwards`;
                document.body.appendChild(ring);
                setTimeout(() => { try { ring.remove(); } catch (e) {} }, 800);
            }
        };

        // Periodically spawn splashes (based on intensity)
        this.rainSplashInterval = setInterval(() => {
            // choose a random x position, bias to visible area
            const x = Math.random() * window.innerWidth;
            // higher intensity -> more frequent multi-splashes
            const multi = (intensity === 'heavy' && Math.random() < 0.6) ? 2 + Math.floor(Math.random()*3) : 1;
            for (let i = 0; i < multi; i++) {
                setTimeout(() => createSplashAt(Math.min(window.innerWidth, Math.max(0, x + (Math.random()*80-40)))), i * 60);
            }
        }, splashRate);

        // remember intensity for potential re-init checks
        this._rainIntensity = intensity;

        // Wind: update --wind CSS variable on the container periodically to simulate gusts
        let windPx = 0;
        const applyWind = (w) => { c.style.setProperty('--wind', `${w}px`); };
        applyWind(0);
        this.rainWindInterval = setInterval(() => {
            // gentle swing with occasional gusts
            const base = (Math.random() - 0.5) * (intensity === 'heavy' ? 18 : 8);
            windPx = base;
            applyWind(windPx);
            // occasional gust
            if (Math.random() < 0.08) {
                const gust = (Math.random() - 0.5) * (intensity === 'heavy' ? 120 : 60);
                applyWind(gust);
                if (this.rainGustTimeout) clearTimeout(this.rainGustTimeout);
                this.rainGustTimeout = setTimeout(() => applyWind(0), 300 + Math.random() * 600);
            }
        }, 350);

        // Respawn small additional drops occasionally to keep density feeling natural
        this.rainRespawnInterval = setInterval(() => {
            const extra = Math.random() < 0.5 ? 1 : Math.random() < 0.2 ? 2 : 0;
            for (let e = 0; e < extra; e++) {
                const drop = document.createElement('div');
                drop.className = 'rain-drop';
                const left = Math.random() * 100;
                drop.style.left = `${left}vw`;
                const duration = (Math.random() * (dropSpeedMax - dropSpeedMin) + dropSpeedMin).toFixed(2) + 's';
                drop.style.animationDuration = duration;
                drop.style.animationTimingFunction = 'linear';
                drop.style.animationDelay = '0s';
                drop.style.setProperty('animation-name', 'rain-fall');
                const rot = (Math.random() - 0.5) * 10;
                drop.style.setProperty('--rot', rot + 'deg');
                drop.style.opacity = (Math.random() * 0.6 + 0.25).toFixed(2);
                drop.style.animationIterationCount = 'infinite';
                c.appendChild(drop);
                // clean up after a while to avoid runaway DOM growth
                setTimeout(() => { try { drop.remove(); } catch (e) {} }, 30 * 1000);
            }
        }, 2500);

    },
    
    // Global weather effect (distinct from Winter theme)
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

    // PLYMOUTH REMOVED - loaded by /themes/plymouth.js

    // FIRE REMOVED - loaded by /themes/fire.js

    // SUBMARINE REMOVED - loaded by /themes/submarine.js

    // SNOW REMOVED - loaded by /themes/winter.js

    summer() { const c = DOM.theme.effects.summer; c.innerHTML = ''; const g = document.createElement('div'); g.className = 'summer-grass'; c.appendChild(g); for (let i = 0; i < 8; i++) { const d = document.createElement('div'); d.className = `summer-cloud v${Math.floor(Math.random()*3)+1}`; const w = Math.random() * 100 + 100; d.style.width = `${w}px`; d.style.height = `${w*.35}px`; d.style.top = `${Math.random()*60}%`; d.style.animationDuration = `${Math.random()*60+60}s`; d.style.animationDelay = `-${Math.random()*100}s`; c.appendChild(d) } },
    
    // BALLPIT REMOVED - loaded by /themes/ballpit.js

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
