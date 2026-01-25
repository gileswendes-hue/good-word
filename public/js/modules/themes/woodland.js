/**
 * ============================================================================
 * WOODLAND THEME EFFECT - ENHANCED
 * ============================================================================
 * Immersive forest scene with:
 * - Dynamic time-of-day lighting (dawn/day/dusk/night)
 * - Parallax layered trees
 * - Falling leaves animation
 * - Creatures that peek from hiding spots
 * - Rare collectible animals (deer, bear, badger) with badges
 * - Fireflies at night, birds during day
 * - Morning mist, night stars
 * - Mushrooms and forest floor details
 */

(function() {
'use strict';

Effects.woodland = function(active) {
    const c = DOM.theme.effects.woodland;
    
    // Cleanup
    if (Effects.woodlandTimeout) clearTimeout(Effects.woodlandTimeout);
    if (Effects.woodlandCreatureTimeout) clearTimeout(Effects.woodlandCreatureTimeout);
    if (Effects.woodlandLeafInterval) clearInterval(Effects.woodlandLeafInterval);
    if (Effects.woodlandBirdTimeout) clearTimeout(Effects.woodlandBirdTimeout);
    if (Effects.woodlandRareTimeout) clearTimeout(Effects.woodlandRareTimeout);
    
    if (!active) {
        c.innerHTML = '';
        return;
    }
    
    c.innerHTML = '';
    
    // ========================================================================
    // TIME OF DAY SYSTEM
    // ========================================================================
    const hour = new Date().getHours();
    let timeOfDay, lightColor, lightOpacity, bgGradient;
    
    if (hour >= 5 && hour < 8) {
        timeOfDay = 'dawn';
        lightColor = 'rgba(255, 200, 150, 0.35)';
        lightOpacity = 0.5;
        bgGradient = 'linear-gradient(180deg, #ffd89b 0%, #ffb87a 15%, #b8d4a8 40%, #5a7247 100%)';
    } else if (hour >= 8 && hour < 17) {
        timeOfDay = 'day';
        lightColor = 'rgba(255, 255, 200, 0.3)';
        lightOpacity = 0.6;
        bgGradient = 'linear-gradient(180deg, #7ec8e3 0%, #87ceeb 20%, #98d4a5 45%, #4a6741 100%)';
    } else if (hour >= 17 && hour < 20) {
        timeOfDay = 'dusk';
        lightColor = 'rgba(255, 130, 80, 0.4)';
        lightOpacity = 0.35;
        bgGradient = 'linear-gradient(180deg, #ff6b4a 0%, #ff8c5a 20%, #c4956a 45%, #4a5240 100%)';
    } else {
        timeOfDay = 'night';
        lightColor = 'rgba(80, 100, 160, 0.15)';
        lightOpacity = 0.1;
        bgGradient = 'linear-gradient(180deg, #0f1419 0%, #1a2332 25%, #1f3a28 60%, #152010 100%)';
    }
    
    // Container setup
    c.style.cssText = `
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        overflow: hidden;
        background: ${bgGradient};
    `;
    
    // ========================================================================
    // INJECT STYLES
    // ========================================================================
    if (!document.getElementById('woodland-enhanced-styles')) {
        const style = document.createElement('style');
        style.id = 'woodland-enhanced-styles';
        style.textContent = `
            @keyframes woodlandLightSway {
                0% { transform: skewX(-8deg) translateX(-15px); opacity: var(--light-opacity); }
                100% { transform: skewX(8deg) translateX(15px); opacity: calc(var(--light-opacity) * 0.6); }
            }
            @keyframes leafFall {
                0% { transform: translateY(-20px) rotate(0deg) translateX(0); opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 0.8; }
                100% { transform: translateY(100vh) rotate(720deg) translateX(var(--leaf-sway)); opacity: 0; }
            }
            @keyframes creaturePeek {
                0% { transform: translateY(100%) scale(0.7); opacity: 0; }
                15% { transform: translateY(10%) scale(1.1); opacity: 1; }
                25% { transform: translateY(0%) scale(1); }
                75% { transform: translateY(0%) scale(1); opacity: 1; }
                85% { transform: translateY(10%) scale(1.1); }
                100% { transform: translateY(100%) scale(0.7); opacity: 0; }
            }
            @keyframes eyeGlow {
                0%, 100% { opacity: 0.4; box-shadow: 0 0 4px currentColor; }
                50% { opacity: 1; box-shadow: 0 0 12px currentColor; }
            }
            @keyframes birdFly {
                0% { transform: translateX(0) translateY(0) scaleX(var(--bird-dir)); }
                25% { transform: translateX(25vw) translateY(-20px) scaleX(var(--bird-dir)); }
                50% { transform: translateX(50vw) translateY(10px) scaleX(var(--bird-dir)); }
                75% { transform: translateX(75vw) translateY(-15px) scaleX(var(--bird-dir)); }
                100% { transform: translateX(110vw) translateY(0) scaleX(var(--bird-dir)); }
            }
            @keyframes mistDrift {
                0% { transform: translateX(-10%) scaleX(1); opacity: 0.3; }
                50% { transform: translateX(5%) scaleX(1.1); opacity: 0.5; }
                100% { transform: translateX(-10%) scaleX(1); opacity: 0.3; }
            }
            @keyframes twinkle {
                0%, 100% { opacity: 0.3; transform: scale(0.8); }
                50% { opacity: 1; transform: scale(1.2); }
            }
            @keyframes fireflyFloat {
                0%, 100% { transform: translate(0, 0); opacity: 0.2; box-shadow: 0 0 2px rgba(180, 255, 100, 0.5); }
                50% { transform: translate(var(--ff-x), var(--ff-y)); opacity: 1; box-shadow: 0 0 10px rgba(180, 255, 100, 0.9); }
            }
            @keyframes rarePrize {
                0%, 100% { transform: scale(1); filter: drop-shadow(0 0 5px gold); }
                50% { transform: scale(1.1); filter: drop-shadow(0 0 15px gold); }
            }
            .woodland-creature { animation: creaturePeek 8s ease-in-out forwards; transition: transform 0.2s; }
            .woodland-creature:hover { transform: scale(1.2) !important; }
            .woodland-hiding-spot { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
            .woodland-hiding-spot:hover { transform: scale(1.08) rotate(-2deg); }
            .woodland-rare { animation: rarePrize 1s ease-in-out infinite; cursor: pointer; pointer-events: auto; }
        `;
        document.head.appendChild(style);
    }
    
    // ========================================================================
    // NIGHT STARS
    // ========================================================================
    if (timeOfDay === 'night') {
        for (let i = 0; i < 50; i++) {
            const star = document.createElement('div');
            const size = Math.random() * 2 + 1;
            star.style.cssText = `
                position: absolute; top: ${Math.random() * 40}%; left: ${Math.random() * 100}%;
                width: ${size}px; height: ${size}px; background: white; border-radius: 50%;
                animation: twinkle ${2 + Math.random() * 3}s ease-in-out infinite;
                animation-delay: ${Math.random() * 3}s; z-index: 1;
            `;
            c.appendChild(star);
        }
    }
    
    // ========================================================================
    // MORNING MIST
    // ========================================================================
    if (timeOfDay === 'dawn') {
        for (let i = 0; i < 3; i++) {
            const mist = document.createElement('div');
            mist.style.cssText = `
                position: absolute; bottom: ${15 + i * 12}%; left: -10%; width: 120%;
                height: ${80 + Math.random() * 40}px;
                background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 20%, 
                    rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.15) 80%, transparent 100%);
                filter: blur(20px); animation: mistDrift ${20 + i * 5}s ease-in-out infinite;
                animation-delay: ${i * 3}s; z-index: 15; pointer-events: none;
            `;
            c.appendChild(mist);
        }
    }
    
    // ========================================================================
    // FOREST FLOOR
    // ========================================================================
    const floor = document.createElement('div');
    floor.style.cssText = `
        position: absolute; bottom: 0; left: 0; right: 0; height: 28%;
        background: linear-gradient(180deg, transparent 0%, rgba(61, 41, 20, 0.7) 20%,
            #3d2914 40%, #2a1f0f 70%, #1a1208 100%);
        z-index: 2;
    `;
    c.appendChild(floor);
    
    // Ground details
    for (let i = 0; i < 30; i++) {
        const detail = document.createElement('div');
        const type = Math.random();
        if (type < 0.4) {
            detail.style.cssText = `
                position: absolute; bottom: ${Math.random() * 10 + 2}%; left: ${Math.random() * 100}%;
                width: ${4 + Math.random() * 8}px; height: ${3 + Math.random() * 5}px;
                background: rgba(80, 70, 60, ${0.3 + Math.random() * 0.3}); border-radius: 50%; z-index: 3;
            `;
        } else if (type < 0.7) {
            detail.style.cssText = `
                position: absolute; bottom: ${Math.random() * 8 + 5}%; left: ${Math.random() * 100}%;
                width: 0; height: 0;
                border-left: ${2 + Math.random() * 3}px solid transparent;
                border-right: ${2 + Math.random() * 3}px solid transparent;
                border-bottom: ${8 + Math.random() * 12}px solid rgba(60, 90, 40, ${0.4 + Math.random() * 0.3});
                z-index: 3; transform: rotate(${Math.random() * 20 - 10}deg);
            `;
        } else {
            detail.style.cssText = `
                position: absolute; bottom: ${Math.random() * 6 + 2}%; left: ${Math.random() * 100}%;
                width: ${15 + Math.random() * 25}px; height: 2px; background: rgba(60, 40, 20, 0.5);
                transform: rotate(${Math.random() * 40 - 20}deg); z-index: 3;
            `;
        }
        c.appendChild(detail);
    }
    
    // ========================================================================
    // FALLEN LEAVES ON GROUND
    // ========================================================================
    const leafEmojis = ['🍂', '🍁', '🍃'];
    for (let i = 0; i < 25; i++) {
        const leaf = document.createElement('div');
        leaf.textContent = leafEmojis[Math.floor(Math.random() * leafEmojis.length)];
        leaf.style.cssText = `
            position: absolute; bottom: ${Math.random() * 12 + 3}%; left: ${Math.random() * 100}%;
            font-size: ${8 + Math.random() * 10}px; opacity: ${0.4 + Math.random() * 0.4};
            transform: rotate(${Math.random() * 360}deg); z-index: 4;
            filter: ${timeOfDay === 'night' ? 'brightness(0.5)' : 'none'};
        `;
        c.appendChild(leaf);
    }
    
    // ========================================================================
    // FALLING LEAVES ANIMATION
    // ========================================================================
    const spawnFallingLeaf = () => {
        if (State.runtime.currentTheme !== 'woodland') return;
        const leaf = document.createElement('div');
        leaf.textContent = leafEmojis[Math.floor(Math.random() * leafEmojis.length)];
        const sway = (Math.random() - 0.5) * 150;
        leaf.style.cssText = `
            position: absolute; top: -30px; left: ${Math.random() * 100}%;
            font-size: ${12 + Math.random() * 8}px; --leaf-sway: ${sway}px;
            animation: leafFall ${8 + Math.random() * 6}s linear forwards;
            z-index: 20; pointer-events: none;
            filter: ${timeOfDay === 'night' ? 'brightness(0.6)' : 'none'};
        `;
        c.appendChild(leaf);
        setTimeout(() => leaf.remove(), 15000);
    };
    
    Effects.woodlandLeafInterval = setInterval(spawnFallingLeaf, 2000);
    for (let i = 0; i < 3; i++) setTimeout(spawnFallingLeaf, i * 500);
    
    // ========================================================================
    // TREES WITH PARALLAX LAYERS
    // ========================================================================
    const createTree = (side, size, zIndex) => {
        const tree = document.createElement('div');
        const xOffset = Math.random() * 15 - 5;
        const brightness = timeOfDay === 'night' ? 0.4 : (1 - (3 - zIndex) * 0.15);
        
        tree.style.cssText = `
            position: absolute; bottom: ${10 + (3 - zIndex) * 2}%; ${side}: ${xOffset}%;
            width: ${size * 1.8}px; height: ${size * 3.5}px; z-index: ${zIndex};
            filter: brightness(${brightness}) ${zIndex < 3 ? `blur(${(3 - zIndex) * 0.5}px)` : ''};
        `;
        
        const trunk = document.createElement('div');
        const trunkW = size * 0.2;
        trunk.style.cssText = `
            position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
            width: ${trunkW}px; height: ${size * 1.4}px;
            background: linear-gradient(90deg, #1a1208 0%, #3d2914 25%, #5a4025 50%, #3d2914 75%, #1a1208 100%);
            border-radius: 4px 4px 10px 10px;
            box-shadow: inset -4px 0 10px rgba(0,0,0,0.5), inset 4px 0 8px rgba(0,0,0,0.3);
        `;
        
        for (let b = 0; b < 8; b++) {
            const line = document.createElement('div');
            line.style.cssText = `
                position: absolute; left: ${15 + Math.random() * 70}%; top: ${b * 12 + Math.random() * 5}%;
                width: ${1 + Math.random() * 2}px; height: ${6 + Math.random() * 15}px;
                background: rgba(0,0,0,${0.2 + Math.random() * 0.2}); border-radius: 1px;
            `;
            trunk.appendChild(line);
        }
        tree.appendChild(trunk);
        
        const foliageColors = timeOfDay === 'night'
            ? ['#0d1f0d', '#152515', '#1a2f1a', '#0f1a0f', '#0a150a']
            : timeOfDay === 'dusk'
            ? ['#2d4a2d', '#3d5a3d', '#4a6b4a', '#375237', '#2f4a2f']
            : ['#1e4d1e', '#2d5a2d', '#3a6b3a', '#275227', '#1f4a1f', '#3d7a3d'];
        
        const clusters = 10 + Math.floor(Math.random() * 5);
        for (let i = 0; i < clusters; i++) {
            const cluster = document.createElement('div');
            const clusterSize = size * (0.35 + Math.random() * 0.4);
            const angle = (i / clusters) * Math.PI * 2;
            const radius = size * (0.35 + Math.random() * 0.25);
            const cx = Math.cos(angle) * radius;
            const cy = Math.sin(angle) * radius * 0.55;
            const baseY = size * 1.5;
            
            cluster.style.cssText = `
                position: absolute; bottom: ${baseY + cy}px; left: calc(50% + ${cx}px);
                transform: translateX(-50%); width: ${clusterSize}px; height: ${clusterSize * 0.8}px;
                background: radial-gradient(ellipse at ${30 + Math.random() * 20}% ${25 + Math.random() * 15}%,
                    ${foliageColors[Math.floor(Math.random() * foliageColors.length)]} 0%,
                    ${foliageColors[Math.floor(Math.random() * foliageColors.length)]} 60%, transparent 100%);
                border-radius: 50% 50% 45% 55% / 55% 50% 50% 45%;
            `;
            tree.appendChild(cluster);
        }
        
        const centerCluster = document.createElement('div');
        centerCluster.style.cssText = `
            position: absolute; bottom: ${size * 1.7}px; left: 50%; transform: translateX(-50%);
            width: ${size * 0.8}px; height: ${size * 0.7}px;
            background: radial-gradient(ellipse at 40% 35%, ${foliageColors[1]} 0%, ${foliageColors[0]} 55%, transparent 100%);
            border-radius: 50%;
        `;
        tree.appendChild(centerCluster);
        
        const topCluster = document.createElement('div');
        topCluster.style.cssText = `
            position: absolute; bottom: ${size * 2.3}px; left: 50%; transform: translateX(-50%);
            width: ${size * 0.55}px; height: ${size * 0.5}px;
            background: radial-gradient(ellipse at 35% 30%, ${foliageColors[2]} 0%, ${foliageColors[0]} 65%, transparent 100%);
            border-radius: 45% 55% 50% 50% / 60% 60% 40% 40%;
        `;
        tree.appendChild(topCluster);
        
        return tree;
    };
    
    c.appendChild(createTree('left', 55, 1));
    c.appendChild(createTree('right', 50, 1));
    c.appendChild(createTree('left', 85, 2));
    c.appendChild(createTree('right', 70, 2));
    c.appendChild(createTree('left', 120, 3));
    c.appendChild(createTree('right', 100, 3));
    
    // ========================================================================
    // HIDING SPOTS & CREATURES
    // ========================================================================
    const hidingSpots = [];
    const spotTypes = [{ emoji: '🪨', name: 'rock' }, { emoji: '🪵', name: 'log' }, { emoji: '🌿', name: 'bush' }];
    
    for (let i = 0; i < 5; i++) {
        const spotType = spotTypes[Math.floor(Math.random() * spotTypes.length)];
        const spot = document.createElement('div');
        const leftPos = 12 + (i * 18) + (Math.random() * 8 - 4);
        
        spot.className = 'woodland-hiding-spot';
        spot.style.cssText = `
            position: absolute; bottom: ${13 + Math.random() * 6}%; left: ${leftPos}%;
            font-size: ${28 + Math.random() * 12}px; z-index: 10; cursor: default;
            filter: drop-shadow(2px 3px 4px rgba(0,0,0,0.5)) ${timeOfDay === 'night' ? 'brightness(0.6)' : ''};
        `;
        spot.textContent = spotType.emoji;
        c.appendChild(spot);
        hidingSpots.push({ el: spot, left: leftPos, creature: null });
    }
    
    const creatures = {
        day: ['🐿️', '🦊', '🦔', '🐁', '🐰'],
        night: ['🦉', '🐺', '🦇', '🦝'],
        rare: ['🦌', '🐻', '🦡']
    };
    
    const creatureMessages = {
        '🐿️': 'A curious squirrel! 🐿️', '🦊': 'A sly fox appears! 🦊',
        '🐺': 'A wolf watches silently... 🐺', '🦉': 'Hoo! A wise owl! 🦉',
        '🦔': 'A hedgehog snuffles about! 🦔', '🐁': 'A tiny mouse scurries! 🐁',
        '🐰': 'A fluffy bunny! 🐰', '🦇': 'A bat flutters by! 🦇',
        '🦝': 'A sneaky raccoon! 🦝', '🦌': '✨ A majestic deer! ✨',
        '🐻': '✨ A friendly bear! ✨', '🦡': '✨ A rare badger! ✨'
    };
    
    const spawnCreature = () => {
        if (State.runtime.currentTheme !== 'woodland') return;
        
        const emptySpots = hidingSpots.filter(s => !s.creature);
        if (emptySpots.length === 0) {
            Effects.woodlandCreatureTimeout = setTimeout(spawnCreature, 4000);
            return;
        }
        
        const spot = emptySpots[Math.floor(Math.random() * emptySpots.length)];
        const pool = timeOfDay === 'night' || timeOfDay === 'dusk' ? creatures.night : creatures.day;
        const creature = pool[Math.floor(Math.random() * pool.length)];
        
        const critterEl = document.createElement('div');
        critterEl.className = 'woodland-creature';
        critterEl.textContent = creature;
        critterEl.style.cssText = `
            position: absolute; bottom: ${parseInt(spot.el.style.bottom) + 4}%;
            left: ${spot.left + 1.5}%; font-size: 32px; z-index: 9;
            pointer-events: auto; cursor: pointer;
            filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.5));
        `;
        
        if (timeOfDay === 'night' && ['🦉', '🐺', '🦝'].includes(creature)) {
            const eyes = document.createElement('div');
            const eyeColor = creature === '🦉' ? '#ffcc00' : '#88ff88';
            eyes.style.cssText = `
                position: absolute; top: 30%; left: 50%; transform: translateX(-50%);
                width: 18px; height: 6px; display: flex; justify-content: space-between; pointer-events: none;
            `;
            eyes.innerHTML = `
                <div style="width:5px;height:5px;background:${eyeColor};border-radius:50%;animation:eyeGlow 2s ease-in-out infinite;color:${eyeColor};"></div>
                <div style="width:5px;height:5px;background:${eyeColor};border-radius:50%;animation:eyeGlow 2s ease-in-out infinite;animation-delay:0.3s;color:${eyeColor};"></div>
            `;
            critterEl.appendChild(eyes);
        }
        
        spot.creature = critterEl;
        c.appendChild(critterEl);
        
        critterEl.onclick = (e) => {
            e.stopPropagation();
            UIManager.showPostVoteMessage(creatureMessages[creature]);
            SoundManager.playPop();
            Haptics.light();
            critterEl.style.animation = 'none';
            critterEl.style.transform = 'scale(1.4) translateY(-20px)';
            critterEl.style.opacity = '0';
            critterEl.style.transition = 'all 0.3s ease-out';
            setTimeout(() => { critterEl.remove(); spot.creature = null; }, 300);
        };
        
        setTimeout(() => { if (critterEl.parentNode) { critterEl.remove(); spot.creature = null; } }, 8000);
        
        const nextDelay = timeOfDay === 'night' ? 12000 : 6000;
        Effects.woodlandCreatureTimeout = setTimeout(spawnCreature, Math.random() * nextDelay + 4000);
    };
    
    Effects.woodlandCreatureTimeout = setTimeout(spawnCreature, 2000);
    
    // ========================================================================
    // RARE CREATURE SPAWNER
    // ========================================================================
    const spawnRareCreature = () => {
        if (State.runtime.currentTheme !== 'woodland') return;
        
        const rare = creatures.rare[Math.floor(Math.random() * creatures.rare.length)];
        const rareEl = document.createElement('div');
        rareEl.className = 'woodland-rare';
        rareEl.textContent = rare;
        
        const startLeft = Math.random() > 0.5;
        rareEl.style.cssText = `
            position: absolute; bottom: ${18 + Math.random() * 10}%;
            ${startLeft ? 'left' : 'right'}: -60px; font-size: 45px; z-index: 12;
            transition: left 8s linear, right 8s linear;
            filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.6));
        `;
        c.appendChild(rareEl);
        
        requestAnimationFrame(() => { rareEl.style[startLeft ? 'left' : 'right'] = '110%'; });
        
        rareEl.onclick = (e) => {
            e.stopPropagation();
            const badges = { '🦌': 'deer', '🐻': 'bear', '🦡': 'badger' };
            if (badges[rare]) State.unlockBadge(badges[rare]);
            UIManager.showPostVoteMessage(creatureMessages[rare]);
            SoundManager.playPop();
            Haptics.medium();
            
            for (let i = 0; i < 8; i++) {
                const sparkle = document.createElement('div');
                sparkle.textContent = '✨';
                sparkle.style.cssText = `position: fixed; left: ${e.clientX}px; top: ${e.clientY}px; font-size: 20px; pointer-events: none; z-index: 1000;`;
                document.body.appendChild(sparkle);
                const angle = (i / 8) * Math.PI * 2;
                const dist = 50 + Math.random() * 30;
                sparkle.animate([
                    { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
                    { transform: `translate(calc(-50% + ${Math.cos(angle) * dist}px), calc(-50% + ${Math.sin(angle) * dist}px)) scale(0)`, opacity: 0 }
                ], { duration: 600, easing: 'ease-out' }).onfinish = () => sparkle.remove();
            }
            
            rareEl.style.transition = 'transform 0.3s, opacity 0.3s';
            rareEl.style.transform = 'scale(2)';
            rareEl.style.opacity = '0';
            setTimeout(() => rareEl.remove(), 300);
        };
        
        setTimeout(() => { if (rareEl.parentNode) rareEl.remove(); }, 10000);
        Effects.woodlandRareTimeout = setTimeout(spawnRareCreature, 30000 + Math.random() * 30000);
    };
    
    Effects.woodlandRareTimeout = setTimeout(spawnRareCreature, 15000 + Math.random() * 15000);
    
    // ========================================================================
    // LIGHT BEAMS
    // ========================================================================
    if (timeOfDay !== 'night') {
        const lightOverlay = document.createElement('div');
        lightOverlay.style.cssText = `position: absolute; inset: 0; pointer-events: none; z-index: 14; --light-opacity: ${lightOpacity};`;
        
        for (let i = 0; i < 5; i++) {
            const beam = document.createElement('div');
            const leftPos = 8 + i * 18 + Math.random() * 12;
            beam.style.cssText = `
                position: absolute; top: 0; left: ${leftPos}%; width: ${25 + Math.random() * 35}px; height: 100%;
                background: linear-gradient(180deg, ${lightColor} 0%, transparent 75%);
                opacity: ${lightOpacity}; transform: skewX(${(Math.random() - 0.5) * 25}deg);
                animation: woodlandLightSway ${10 + Math.random() * 5}s ease-in-out infinite alternate;
                animation-delay: ${Math.random() * 5}s;
            `;
            lightOverlay.appendChild(beam);
        }
        c.appendChild(lightOverlay);
    }
    
    // ========================================================================
    // FIREFLIES (Night/Dusk) or DUST MOTES (Day)
    // ========================================================================
    const particleCount = timeOfDay === 'night' ? 20 : (timeOfDay === 'dusk' ? 12 : 8);
    const isFirefly = timeOfDay === 'night' || timeOfDay === 'dusk';
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        const ffX = (Math.random() - 0.5) * 60;
        const ffY = (Math.random() - 0.5) * 40;
        
        particle.style.cssText = `
            position: absolute; left: ${Math.random() * 100}%; top: ${20 + Math.random() * 50}%;
            width: ${isFirefly ? 5 : 3}px; height: ${isFirefly ? 5 : 3}px;
            background: ${isFirefly ? 'rgba(180, 255, 100, 0.9)' : 'rgba(255, 255, 220, 0.5)'};
            border-radius: 50%; --ff-x: ${ffX}px; --ff-y: ${ffY}px;
            animation: fireflyFloat ${5 + Math.random() * 5}s ease-in-out infinite;
            animation-delay: ${Math.random() * 5}s; z-index: 16; pointer-events: none;
        `;
        c.appendChild(particle);
    }
    
    // ========================================================================
    // BIRDS (Daytime only)
    // ========================================================================
    if (timeOfDay === 'day' || timeOfDay === 'dawn') {
        const spawnBird = () => {
            if (State.runtime.currentTheme !== 'woodland') return;
            const bird = document.createElement('div');
            const birdTypes = ['🐦', '🐤', '🕊️'];
            bird.textContent = birdTypes[Math.floor(Math.random() * birdTypes.length)];
            const startLeft = Math.random() > 0.5;
            const dir = startLeft ? 1 : -1;
            bird.style.cssText = `
                position: absolute; top: ${10 + Math.random() * 25}%; left: ${startLeft ? '-5%' : '105%'};
                font-size: ${18 + Math.random() * 10}px; --bird-dir: ${dir};
                animation: birdFly ${6 + Math.random() * 4}s linear forwards;
                z-index: 17; pointer-events: none; filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.3));
            `;
            c.appendChild(bird);
            setTimeout(() => bird.remove(), 12000);
            Effects.woodlandBirdTimeout = setTimeout(spawnBird, 8000 + Math.random() * 12000);
        };
        Effects.woodlandBirdTimeout = setTimeout(spawnBird, 3000);
    }
    
    // ========================================================================
    // MUSHROOMS
    // ========================================================================
    const mushroomTypes = ['🍄', '🍄‍🟫'];
    for (let i = 0; i < 6; i++) {
        const mushroom = document.createElement('div');
        mushroom.textContent = mushroomTypes[Math.floor(Math.random() * mushroomTypes.length)];
        mushroom.style.cssText = `
            position: absolute; bottom: ${8 + Math.random() * 8}%; left: ${5 + Math.random() * 90}%;
            font-size: ${10 + Math.random() * 10}px; opacity: ${0.7 + Math.random() * 0.3}; z-index: 5;
            transform: scaleX(${Math.random() > 0.5 ? 1 : -1});
            filter: drop-shadow(1px 2px 2px rgba(0,0,0,0.4)) ${timeOfDay === 'night' ? 'brightness(0.5)' : ''};
        `;
        c.appendChild(mushroom);
    }
};

console.log('%c[Theme: Woodland Enhanced] Loaded', 'color: #16a34a; font-weight: bold');

})();
