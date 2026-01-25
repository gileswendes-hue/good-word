/**
 * ============================================================================
 * FLIGHT THEME EFFECT
 * ============================================================================
 * Airplane cockpit view with parallax mountains, ground, clouds, and engine sound
 */

(function() {
'use strict';

Effects.flight = function(active) {
        let c = DOM.theme.effects.flight;
        if (!c) {
            c = document.createElement('div');
            c.id = 'flight-effect';
            c.className = 'fixed inset-0 pointer-events-none overflow-hidden z-0';
            document.body.appendChild(c);
            DOM.theme.effects.flight = c;
        }

        // --- CLEANUP ---
        if (Effects.flightTimeout) clearTimeout(Effects.flightTimeout);
        if (Effects.bankInterval) clearInterval(Effects.bankInterval);
        if (Effects.objectSpawnInterval) clearInterval(Effects.objectSpawnInterval);
        if (Effects.groundSpawnInterval) clearInterval(Effects.groundSpawnInterval);
        if (Effects.wiperInterval) clearInterval(Effects.wiperInterval);
        Effects.flightObjects.forEach(obj => obj.remove());
        Effects.flightObjects = [];

        // Stop Audio
        if (Effects.engineAudio) {
            Effects.engineAudio.pause();
            Effects.engineAudio = null;
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
                Effects.engineAudio = { pause: () => { oscillator.stop(); lfo.stop(); audioCtx.close(); } };
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
        Effects.objectSpawnInterval = setInterval(spawnObject, 3000);

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
        Effects.groundSpawnInterval = setInterval(spawnGroundObject, 300);

        // WIPER
        let wiperAngle = -50;
        let wiperDir = 1;
        Effects.wiperInterval = setInterval(() => {
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

console.log('%c[Theme: Flight] Loaded', 'color: #0ea5e9');

})();
