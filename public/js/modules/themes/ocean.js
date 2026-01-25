/**
 * ============================================================================
 * OCEAN THEME EFFECT
 * ============================================================================
 * Ocean waves with day/night cycle, boats, seagulls, moon/sun reflections
 */

(function() {
'use strict';

// Timeout refs on Effects


Effects.getMoonPhase = function() {
        const date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        const day = date.getDate();
        if (month < 3) { year--; month += 12; }
        month++;
        const c = 365.25 * year;
        const e = 30.6 * month;
        let jd = c + e + day - 694039.09;
        jd /= 29.5305882;
        const b = Math.floor(jd);
        jd -= b;
        const phase = Math.round(jd * 8);
        return phase >= 8 ? 0 : phase;
    };

Effects.ocean = function(active) {
        let c = DOM.theme.effects.ocean;
        if (!c) {
            c = document.createElement('div');
            c.id = 'ocean-effect';
            c.className = 'fixed inset-0 pointer-events-none overflow-hidden z-0';
            document.body.appendChild(c);
            DOM.theme.effects.ocean = c;
        }
        if (Effects.oceanTimeout) clearTimeout(Effects.oceanTimeout);
        Effects.oceanObjects.forEach(obj => obj.remove());
        Effects.oceanObjects = [];
        if (!active) { c.innerHTML = ''; c.style.background = ''; return; }
        c.innerHTML = '';
        const hour = new Date().getHours();
        const minutes = new Date().getMinutes();
        const timeDecimal = hour + minutes / 60;
        const isNight = hour >= 20 || hour < 6;
        const isEvening = (hour >= 17 && hour < 20) || (hour >= 6 && hour < 8);
        const moonPhase = Effects.getMoonPhase();
        let bodyX, bodyY;
        if (isNight) {
            const nightProgress = hour >= 20 ? (hour - 20 + minutes/60) / 10 : (hour + 4 + minutes/60) / 10;
            bodyX = 15 + nightProgress * 70;
            bodyY = 15 + Math.sin(nightProgress * Math.PI) * -10;
        } else {
            if (timeDecimal < 6) {
                bodyX = 10; bodyY = 38;
            } else if (timeDecimal > 18) {
                bodyX = 90; bodyY = 38;
            } else {
                bodyX = 10 + ((timeDecimal - 6) / 12) * 80;
                const noon = 12;
                const distFromNoon = Math.abs(timeDecimal - noon);
                bodyY = 10 + (distFromNoon / 6) * 28;
            }
        }
        let skyGradient;
        if (isNight) {
            skyGradient = 'linear-gradient(180deg, #0a0a1a 0%, #1a1a3a 20%, #2a3a5a 40%, #1a3050 48%, #0f2840 55%, #0a1828 75%, #051018 100%)';
        } else if (isEvening) {
            skyGradient = 'linear-gradient(180deg, #1a2a4a 0%, #c44536 15%, #f7b267 35%, #87CEEB 45%, #2a5a8a 50%, #1a4a7a 65%, #0f3050 85%, #0a2030 100%)';
        } else {
            skyGradient = 'linear-gradient(180deg, #4a90c2 0%, #87CEEB 20%, #a8d4ea 40%, #87CEEB 47%, #2a6a9a 50%, #1a5080 60%, #0f3a60 80%, #0a2840 100%)';
        }
        c.style.background = skyGradient;
        if (isNight) {
            const moon = document.createElement('div');
            moon.style.cssText = `
                position: absolute;
                top: ${bodyY}%;
                left: ${bodyX}%;
                transform: translate(-50%, -50%);
                width: 45px;
                height: 45px;
                border-radius: 50%;
                box-shadow: 0 0 30px rgba(255,255,240,0.5), 0 0 60px rgba(255,255,240,0.3);
                z-index: 2;
                overflow: hidden;
            `;
            let moonGradient;
            if (moonPhase === 0) {
                moonGradient = 'radial-gradient(circle at 50% 50%, #3a3a3a 0%, #2a2a2a 100%)';
            } else if (moonPhase === 4) {
                moonGradient = 'radial-gradient(circle at 35% 35%, #fffef0 0%, #f0f0e0 50%, #d8d8c8 100%)';
            } else if (moonPhase < 4) {
                const litPercent = moonPhase * 25;
                moonGradient = `linear-gradient(90deg, #2a2a2a 0%, #2a2a2a ${50 - litPercent}%, #d8d8c8 ${50 - litPercent + 10}%, #fffef0 100%)`;
            } else {
                const litPercent = (8 - moonPhase) * 25;
                moonGradient = `linear-gradient(90deg, #fffef0 0%, #d8d8c8 ${litPercent - 10}%, #2a2a2a ${litPercent}%, #2a2a2a 100%)`;
            }
            moon.style.background = moonGradient;
            c.appendChild(moon);
            const reflectionContainer = document.createElement('div');
            reflectionContainer.className = 'ocean-reflection-container';
            reflectionContainer.style.cssText = `
                position: absolute;
                top: 49%;
                left: ${bodyX}%;
                transform: translateX(-50%);
                width: 100px;
                height: 50%;
                z-index: 9;
                overflow: visible;
            `;
            for (let r = 0; r < 18; r++) {
                const segment = document.createElement('div');
                const yOffset = r * 5.5;
                const baseWidth = 4 + r * 3;
                const width = baseWidth + Math.random() * (r * 2);
                const xOffset = (Math.random() - 0.5) * (10 + r * 3);
                segment.style.cssText = `
                    position: absolute;
                    top: ${yOffset}%;
                    left: 50%;
                    transform: translateX(calc(-50% + ${xOffset}px));
                    width: ${width}px;
                    height: ${2 + Math.random() * 2}%;
                    background: rgba(255,255,250,${0.9 - r * 0.04});
                    border-radius: 50%;
                    animation: reflection-segment ${0.6 + Math.random() * 0.6}s ease-in-out infinite;
                    animation-delay: ${Math.random() * 0.5}s;
                `;
                reflectionContainer.appendChild(segment);
            }
            c.appendChild(reflectionContainer);
            for (let i = 0; i < 50; i++) {
                const star = document.createElement('div');
                star.style.cssText = `
                    position: absolute;
                    top: ${Math.random() * 45}%;
                    left: ${Math.random() * 100}%;
                    width: ${1 + Math.random() * 2}px;
                    height: ${1 + Math.random() * 2}px;
                    background: white;
                    border-radius: 50%;
                    opacity: ${0.3 + Math.random() * 0.7};
                    animation: star-twinkle ${2 + Math.random() * 3}s ease-in-out infinite;
                    animation-delay: ${Math.random() * 2}s;
                `;
                c.appendChild(star);
            }
        } else {
            const sun = document.createElement('div');
            const sunColor = isEvening ? '#ff6b35' : '#FFD700';
            sun.style.cssText = `
                position: absolute;
                top: ${bodyY}%;
                left: ${bodyX}%;
                transform: translate(-50%, -50%);
                width: 50px;
                height: 50px;
                background: radial-gradient(circle, #fff8e0 0%, ${sunColor} 50%, ${isEvening ? '#c44536' : '#FFA500'} 100%);
                border-radius: 50%;
                box-shadow: 0 0 60px ${sunColor}, 0 0 100px ${sunColor}80;
                z-index: 2;
            `;
            c.appendChild(sun);
            const reflectionContainer = document.createElement('div');
            reflectionContainer.className = 'ocean-reflection-container';
            reflectionContainer.style.cssText = `
                position: absolute;
                top: 49%;
                left: ${bodyX}%;
                transform: translateX(-50%);
                width: 120px;
                height: 50%;
                z-index: 9;
                overflow: visible;
            `;
            const golden = isEvening ? [255, 150, 50] : [255, 215, 0];
            for (let r = 0; r < 20; r++) {
                const segment = document.createElement('div');
                const yOffset = r * 5;
                const baseWidth = 5 + r * 4;
                const width = baseWidth + Math.random() * (r * 2.5);
                const xOffset = (Math.random() - 0.5) * (12 + r * 4);
                segment.style.cssText = `
                    position: absolute;
                    top: ${yOffset}%;
                    left: 50%;
                    transform: translateX(calc(-50% + ${xOffset}px));
                    width: ${width}px;
                    height: ${2 + Math.random() * 2}%;
                    background: rgba(${golden[0]},${golden[1]},${golden[2]},${0.95 - r * 0.04});
                    border-radius: 50%;
                    animation: reflection-segment ${0.5 + Math.random() * 0.5}s ease-in-out infinite;
                    animation-delay: ${Math.random() * 0.4}s;
                `;
                reflectionContainer.appendChild(segment);
            }
            c.appendChild(reflectionContainer);
        }
        const waveColors = isNight 
            ? ['#0a1e3a', '#0c2444', '#0e2a4e', '#102f55']
            : ['#1a5a8a', '#2a6a9a', '#3a7aaa', '#4a8aba'];
        for (let i = 0; i < 4; i++) {
            const waveWrapper = document.createElement('div');
            waveWrapper.style.cssText = `
                position: absolute;
                top: ${46 + i * 8}%;
                left: 0;
                right: 0;
                height: ${58 - i * 10}%;
                z-index: ${4 + i};
                overflow: hidden;
            `;
            const waveContainer = document.createElement('div');
            const waveAmplitude = 2 + i * 6;
            waveContainer.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 200%;
                height: 100%;
                animation: wave-seamless-${i} ${20 - i * 3}s linear infinite;
            `;
            const baseY = 25;
            waveContainer.innerHTML = `
                <svg viewBox="0 0 2000 200" preserveAspectRatio="none" style="width: 100%; height: 100%;">
                    <defs>
                        <linearGradient id="waveGrad${i}" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:${waveColors[i]};stop-opacity:0.98"/>
                            <stop offset="100%" style="stop-color:${isNight ? '#050d18' : '#0a2840'};stop-opacity:1"/>
                        </linearGradient>
                    </defs>
                    <path d="M0,${baseY} 
                        C50,${baseY - waveAmplitude} 100,${baseY + waveAmplitude} 150,${baseY}
                        C200,${baseY - waveAmplitude * 0.8} 250,${baseY + waveAmplitude} 300,${baseY}
                        C350,${baseY - waveAmplitude * 1.1} 400,${baseY + waveAmplitude * 0.9} 450,${baseY}
                        C500,${baseY - waveAmplitude} 550,${baseY + waveAmplitude * 1.1} 600,${baseY}
                        C650,${baseY - waveAmplitude * 0.9} 700,${baseY + waveAmplitude} 750,${baseY}
                        C800,${baseY - waveAmplitude * 1.1} 850,${baseY + waveAmplitude * 0.8} 900,${baseY}
                        C950,${baseY - waveAmplitude} 1000,${baseY + waveAmplitude} 1050,${baseY}
                        C1100,${baseY - waveAmplitude * 0.8} 1150,${baseY + waveAmplitude} 1200,${baseY}
                        C1250,${baseY - waveAmplitude * 1.1} 1300,${baseY + waveAmplitude * 0.9} 1350,${baseY}
                        C1400,${baseY - waveAmplitude} 1450,${baseY + waveAmplitude * 1.1} 1500,${baseY}
                        C1550,${baseY - waveAmplitude * 0.9} 1600,${baseY + waveAmplitude} 1650,${baseY}
                        C1700,${baseY - waveAmplitude * 1.1} 1750,${baseY + waveAmplitude * 0.8} 1800,${baseY}
                        C1850,${baseY - waveAmplitude} 1900,${baseY + waveAmplitude} 1950,${baseY}
                        L2000,${baseY} L2000,200 L0,200 Z" 
                        fill="url(#waveGrad${i})"/>
                </svg>
            `;
            waveWrapper.appendChild(waveContainer);
            c.appendChild(waveWrapper);
        }
        for (let f = 0; f < 10; f++) {
            const foam = document.createElement('div');
            foam.style.cssText = `
                position: absolute;
                top: ${72 + Math.random() * 22}%;
                left: ${Math.random() * 100}%;
                width: ${20 + Math.random() * 60}px;
                height: ${3 + Math.random() * 4}px;
                background: rgba(255,255,255,${0.25 + Math.random() * 0.35});
                border-radius: 50%;
                filter: blur(1px);
                animation: foam-drift ${6 + Math.random() * 8}s linear infinite;
                animation-delay: ${Math.random() * 4}s;
                z-index: 18;
            `;
            c.appendChild(foam);
        }
        const oldStyle = document.getElementById('ocean-style');
        if (oldStyle) oldStyle.remove();
        const style = document.createElement('style');
        style.id = 'ocean-style';
        style.textContent = `
            @keyframes wave-seamless-0 {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
            }
            @keyframes wave-seamless-1 {
                0% { transform: translateX(-50%); }
                100% { transform: translateX(0); }
            }
            @keyframes wave-seamless-2 {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
            }
            @keyframes wave-seamless-3 {
                0% { transform: translateX(-50%); }
                100% { transform: translateX(0); }
            }
            @keyframes foam-drift {
                0% { transform: translateX(0) scale(1); opacity: 0.5; }
                50% { transform: translateX(-30px) scale(1.2); opacity: 0.8; }
                100% { transform: translateX(-60px) scale(0.8); opacity: 0; }
            }
            @keyframes reflection-shimmer {
                0%, 100% { 
                    opacity: 1; 
                    transform: translateX(-50%) scaleX(1) scaleY(1);
                }
                25% { 
                    opacity: 0.6; 
                    transform: translateX(-50%) scaleX(2) scaleY(0.95);
                }
                50% { 
                    opacity: 0.9; 
                    transform: translateX(-50%) scaleX(0.5) scaleY(1.02);
                }
                75% { 
                    opacity: 0.7; 
                    transform: translateX(-50%) scaleX(1.5) scaleY(0.98);
                }
            }
            @keyframes reflection-segment {
                0%, 100% { 
                    opacity: 0.3;
                    transform: translateX(calc(-50% + var(--x-off, 0px))) scaleX(0.8);
                }
                50% { 
                    opacity: 1;
                    transform: translateX(calc(-50% + var(--x-off, 0px))) scaleX(1.5);
                }
            }
            .ocean-reflection {
                animation: reflection-shimmer 2.5s ease-in-out infinite;
            }
            @keyframes star-twinkle {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 1; }
            }
            @keyframes boat-bob {
                0%, 100% { transform: translateY(0) rotate(-1deg); }
                25% { transform: translateY(-4px) rotate(1.5deg); }
                50% { transform: translateY(-2px) rotate(-0.5deg); }
                75% { transform: translateY(-6px) rotate(2deg); }
            }
            @keyframes boat-bob-large {
                0%, 100% { transform: translateY(0) rotate(-3deg); }
                25% { transform: translateY(-10px) rotate(4deg); }
                50% { transform: translateY(-5px) rotate(-2deg); }
                75% { transform: translateY(-15px) rotate(5deg); }
            }
            @keyframes boat-drift {
                from { left: -100px; }
                to { left: calc(100% + 100px); }
            }
            @keyframes boat-drift-reverse {
                from { left: calc(100% + 100px); }
                to { left: -100px; }
            }
            @keyframes seagull-fly {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
        `;
        document.head.appendChild(style);
        const boats = ['⛵', '🚤', '🛥️', '🚢', '⛴️', '🛶'];
        const spawnBoat = () => {
            if (!c.isConnected) return;
            const boat = document.createElement('div');
            const boatEmoji = boats[Math.floor(Math.random() * boats.length)];
            const goingRight = Math.random() > 0.5;
            const depthRoll = Math.random();
            let yPos, size, duration, zIndex, bobAnimation;
            if (depthRoll < 0.35) {
                yPos = 47 + Math.random() * 2;
                size = 8 + Math.random() * 5;
                duration = 90 + Math.random() * 50;
                zIndex = 8;
                bobAnimation = 'boat-bob 5s ease-in-out infinite';
            } else if (depthRoll < 0.7) {
                yPos = 54 + Math.random() * 10;
                size = 20 + Math.random() * 18;
                duration = 55 + Math.random() * 35;
                zIndex = 12;
                bobAnimation = 'boat-bob 3.5s ease-in-out infinite';
            } else {
                yPos = 70 + Math.random() * 18;
                size = 55 + Math.random() * 40;
                duration = 20 + Math.random() * 15;
                zIndex = 25;
                bobAnimation = 'boat-bob-large 2s ease-in-out infinite';
            }
            boat.textContent = boatEmoji;
            boat.style.cssText = `
                position: absolute;
                top: ${yPos}%;
                font-size: ${size}px;
                z-index: ${zIndex};
                opacity: ${size < 15 ? 0.6 : 1};
                animation: 
                    ${goingRight ? 'boat-drift' : 'boat-drift-reverse'} ${duration}s linear forwards,
                    ${bobAnimation};
                filter: drop-shadow(2px 3px ${Math.floor(size/10) + 2}px rgba(0,0,0,0.4));
                ${goingRight ? 'transform: scaleX(-1);' : ''}
            `;
            c.appendChild(boat);
            Effects.oceanObjects.push(boat);
            setTimeout(() => boat.remove(), duration * 1000);
            Effects.oceanTimeout = setTimeout(spawnBoat, 2500 + Math.random() * 5000);
        };
        const spawnSeagull = () => {
            if (!c.isConnected || isNight) return;
            const bird = document.createElement('div');
            bird.textContent = '🕊️';
            const yPos = 15 + Math.random() * 50; // More vertical range
            const duration = 8 + Math.random() * 8;
            const goingRight = Math.random() > 0.5;
            const size = 28 + Math.random() * 32; // Much larger: 28-60px
            bird.style.cssText = `
                position: absolute;
                top: ${yPos}%;
                left: ${goingRight ? '-80px' : 'calc(100% + 80px)'};
                font-size: ${size}px;
                z-index: 150;
                animation: 
                    ${goingRight ? 'boat-drift' : 'boat-drift-reverse'} ${duration}s linear forwards,
                    seagull-fly 0.4s ease-in-out infinite;
                filter: drop-shadow(3px 5px 8px rgba(0,0,0,0.4));
                ${goingRight ? 'transform: scaleX(-1);' : ''}
            `;
            c.appendChild(bird);
            Effects.oceanObjects.push(bird);
            setTimeout(() => bird.remove(), duration * 1000);
            setTimeout(spawnSeagull, 5000 + Math.random() * 8000);
        };
        Effects.oceanTimeout = setTimeout(spawnBoat, 1000);
        if (!isNight) setTimeout(spawnSeagull, 3000);
    };

console.log('%c[Theme: Ocean] Loaded', 'color: #0369a1');

})();
