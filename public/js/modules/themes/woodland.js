/**
 * ============================================================================
 * WOODLAND THEME - Final release
 * ============================================================================
 * Immersive forest scene with dynamic time-of-day, parallax trees, falling
 * leaves, peek creatures, rare collectibles (deer/bear/badger), fireflies,
 * birds, morning mist, night stars, mushrooms, and forest spirit.
 * Rain in woodland uses short streaks and sits behind the game UI.
 */

(function() {
'use strict';

const WOODLAND_VERSION = '1.3.0';

Effects.woodland = function(active) {
    const c = DOM.theme.effects.woodland;
    
    // Cleanup
    if (Effects.woodlandTimeout) clearTimeout(Effects.woodlandTimeout);
    if (Effects.woodlandCreatureTimeout) clearTimeout(Effects.woodlandCreatureTimeout);
    if (Effects.woodlandLeafInterval) clearInterval(Effects.woodlandLeafInterval);
    if (Effects.woodlandBirdTimeout) clearTimeout(Effects.woodlandBirdTimeout);
    if (Effects.woodlandRareTimeout) clearTimeout(Effects.woodlandRareTimeout);
    if (Effects.woodlandSpiritTimeout) clearTimeout(Effects.woodlandSpiritTimeout);
    
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
    
    // Container setup — clean, final-release layout
    c.style.cssText = `
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        overflow: hidden;
        background: ${bgGradient};
        image-rendering: -webkit-optimize-contrast;
        image-rendering: crisp-edges;
    `;
    
    // ========================================================================
    // INJECT STYLES
    // ========================================================================
    if (!document.getElementById('woodland-enhanced-styles')) {
        const style = document.createElement('style');
        style.id = 'woodland-enhanced-styles';
        style.textContent = `
            @keyframes woodlandLightSway {
                0% { transform: skewX(-6deg) translateX(-12px); opacity: var(--light-opacity); }
                100% { transform: skewX(6deg) translateX(12px); opacity: calc(var(--light-opacity) * 0.65); }
            }
            @keyframes woodlandTreeSway {
                0%, 100% { transform: translateX(0) skewX(0deg); }
                50% { transform: translateX(var(--sway-x, 4px)) skewX(var(--sway-skew, 1deg)); }
            }
            @keyframes leafFall {
                0% { transform: translateY(-20px) rotate(0deg) translateX(0); opacity: 0; }
                8% { opacity: 1; }
                92% { opacity: 0.85; }
                100% { transform: translateY(100vh) rotate(720deg) translateX(var(--leaf-sway)); opacity: 0; }
            }
            @keyframes creaturePopInOut {
                0% { transform: translateY(115%) scale(0.7); opacity: 0; }
                14% { transform: translateY(-10%) scale(1.06); opacity: 1; }
                22% { transform: translateY(0) scale(1); }
                72% { transform: translateY(0) scale(1); opacity: 1; }
                80% { transform: translateY(6%) scale(0.96); }
                100% { transform: translateY(105%) scale(0.72); opacity: 0; }
            }
            @keyframes creatureIdle {
                0%, 100% { transform: translateY(0) scale(1); }
                50% { transform: translateY(-5px) scale(1.02); }
            }
            @keyframes eyeGlow {
                0%, 100% { opacity: 0.45; box-shadow: 0 0 5px currentColor; }
                50% { opacity: 1; box-shadow: 0 0 14px currentColor; }
            }
            @keyframes birdFly {
                0% { transform: translateX(0) translateY(0) scaleX(var(--bird-dir)); }
                25% { transform: translateX(25vw) translateY(-18px) scaleX(var(--bird-dir)); }
                50% { transform: translateX(50vw) translateY(8px) scaleX(var(--bird-dir)); }
                75% { transform: translateX(75vw) translateY(-12px) scaleX(var(--bird-dir)); }
                100% { transform: translateX(110vw) translateY(0) scaleX(var(--bird-dir)); }
            }
            @keyframes mistDrift {
                0% { transform: translateX(-8%) scaleX(1); opacity: 0.28; }
                50% { transform: translateX(4%) scaleX(1.08); opacity: 0.48; }
                100% { transform: translateX(-8%) scaleX(1); opacity: 0.28; }
            }
            @keyframes twinkle {
                0%, 100% { opacity: 0.35; transform: scale(0.85); }
                50% { opacity: 1; transform: scale(1.15); }
            }
            @keyframes fireflyFloat {
                0%, 100% { transform: translate(0, 0); opacity: 0.25; box-shadow: 0 0 3px rgba(180, 255, 100, 0.5); }
                50% { transform: translate(var(--ff-x), var(--ff-y)); opacity: 1; box-shadow: 0 0 12px rgba(180, 255, 100, 0.85); }
            }
            @keyframes rarePrize {
                0%, 100% { transform: scale(1); filter: drop-shadow(0 0 6px rgba(255, 215, 0, 0.8)); }
                50% { transform: scale(1.08); filter: drop-shadow(0 0 18px rgba(255, 215, 0, 0.9)); }
            }
            @keyframes spiritPulse {
                0%, 100% { transform: scale(1); opacity: 0.82; }
                50% { transform: scale(1.25); opacity: 1; }
            }
            @keyframes spiritTrail {
                0% { opacity: 0.55; transform: scale(1); }
                100% { opacity: 0; transform: scale(0.35); }
            }
            @keyframes grassSway {
                0%, 100% { transform: rotate(var(--grass-rot)) translateX(0); }
                50% { transform: rotate(calc(var(--grass-rot) + 4deg)) translateX(2px); }
            }
            .woodland-creature { animation: creaturePopInOut var(--creature-dur, 8s) cubic-bezier(0.34, 1.4, 0.64, 1) forwards; position: relative; }
            .woodland-creature-emoji { line-height: 1; user-select: none; animation: creatureIdle 2.8s ease-in-out infinite; animation-delay: 0.4s; }
            .woodland-creature:hover .woodland-creature-emoji { animation: none; transform: scale(1.08); }
            .woodland-hiding-spot { transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
            .woodland-hiding-spot:hover { transform: scale(1.06) rotate(-1.5deg); }
            .woodland-rare { animation: rarePrize 1.2s ease-in-out infinite; cursor: pointer; pointer-events: auto; }
            .woodland-mushroom { transition: transform 0.2s ease, opacity 0.2s ease; }
            .woodland-mushroom:hover { transform: scale(1.1); }
            .woodland-creature-eyes { z-index: 1; }
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
        for (let i = 0; i < 5; i++) {
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
    // FOREST FLOOR — starts higher (bottom 42% of screen) so ground is visible
    // ========================================================================
    const FLOOR_HEIGHT_PCT = 42;
    const floor = document.createElement('div');
    floor.style.cssText = `
        position: absolute; bottom: 0; left: 0; right: 0; height: ${FLOOR_HEIGHT_PCT}%;
        background: linear-gradient(180deg, transparent 0%, rgba(60, 42, 24, 0.5) 12%,
            rgba(55, 38, 22, 0.75) 25%, #3d2914 45%, #2e2212 75%, #1a1208 98%);
        z-index: 2;
        box-shadow: inset 0 -3px 25px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03);
    `;
    c.appendChild(floor);
    
    // Ground details — spread across depth (front/mid/back) for receding feel
    for (let i = 0; i < 55; i++) {
        const detail = document.createElement('div');
        const type = Math.random();
        const depthBand = i % 3;
        const bottomPct = depthBand === 0 ? Math.random() * 10 + 1 : depthBand === 1 ? Math.random() * 10 + 13 : Math.random() * 10 + 24;
        const depthScale = depthBand === 0 ? 1 : depthBand === 1 ? 0.7 : 0.5;
        const z = depthBand === 0 ? 3 : depthBand === 1 ? 2 : 1;
        if (type < 0.4) {
            detail.style.cssText = `
                position: absolute; bottom: ${bottomPct}%; left: ${Math.random() * 100}%;
                width: ${(4 + Math.random() * 8) * depthScale}px; height: ${(3 + Math.random() * 5) * depthScale}px;
                background: rgba(80, 70, 60, ${0.25 + Math.random() * 0.35}); border-radius: 50%;
                z-index: ${z}; box-shadow: 0 2px 4px rgba(0,0,0,0.25);
            `;
        } else if (type < 0.7) {
            const rot = Math.random() * 20 - 10;
            detail.className = 'woodland-grass';
            detail.style.cssText = `
                position: absolute; bottom: ${bottomPct}%; left: ${Math.random() * 100}%;
                width: 0; height: 0;
                border-left: ${(2 + Math.random() * 3) * depthScale}px solid transparent;
                border-right: ${(2 + Math.random() * 3) * depthScale}px solid transparent;
                border-bottom: ${(8 + Math.random() * 12) * depthScale}px solid rgba(60, 90, 40, ${0.35 + Math.random() * 0.35});
                z-index: ${z}; --grass-rot: ${rot}deg;
                filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));
                animation: grassSway ${4 + Math.random() * 3}s ease-in-out infinite;
                animation-delay: ${Math.random() * 2}s;
            `;
        } else {
            detail.style.cssText = `
                position: absolute; bottom: ${bottomPct}%; left: ${Math.random() * 100}%;
                width: ${(15 + Math.random() * 25) * depthScale}px; height: 2px; background: rgba(60, 40, 20, 0.5);
                transform: rotate(${Math.random() * 40 - 20}deg); z-index: ${z};
                box-shadow: 0 1px 2px rgba(0,0,0,0.2);
            `;
        }
        c.appendChild(detail);
    }
    
    // ========================================================================
    // FALLEN LEAVES ON GROUND — on the floor band, with shadow
    // ========================================================================
    const leafEmojis = ['🍂', '🍁', '🍃'];
    for (let i = 0; i < 45; i++) {
        const leaf = document.createElement('div');
        leaf.textContent = leafEmojis[Math.floor(Math.random() * leafEmojis.length)];
        const depthBand = i % 3;
        const leafBottom = depthBand === 0 ? Math.random() * 10 + 2 : depthBand === 1 ? Math.random() * 10 + 14 : Math.random() * 10 + 26;
        const leafScale = depthBand === 0 ? 1 : depthBand === 1 ? 0.75 : 0.55;
        const leafZ = depthBand === 0 ? 4 : depthBand === 1 ? 3 : 2;
        leaf.style.cssText = `
            position: absolute; bottom: ${leafBottom}%; left: ${Math.random() * 100}%;
            font-size: ${(8 + Math.random() * 10) * leafScale}px; opacity: ${0.4 + Math.random() * 0.4};
            transform: rotate(${Math.random() * 360}deg); z-index: ${leafZ};
            filter: drop-shadow(0 2px 3px rgba(0,0,0,0.3)) ${timeOfDay === 'night' ? 'brightness(0.5)' : 'none'};
        `;
        c.appendChild(leaf);
    }
    
    // ========================================================================
    // UNDERGROWTH — ferns and small bushes along the floor
    // ========================================================================
    const undergrowthEmojis = ['🌿', '🌱', '🪴', '🌾'];
    for (let i = 0; i < 18; i++) {
        const ug = document.createElement('div');
        ug.textContent = undergrowthEmojis[Math.floor(Math.random() * undergrowthEmojis.length)];
        const ugDepth = i % 3;
        const ugBottom = ugDepth === 0 ? Math.random() * 12 + 2 : ugDepth === 1 ? Math.random() * 10 + 15 : Math.random() * 10 + 27;
        const ugScale = ugDepth === 0 ? 1 : ugDepth === 1 ? 0.78 : 0.58;
        const ugZ = ugDepth === 0 ? 4 : ugDepth === 1 ? 3 : 2;
        ug.style.cssText = `
            position: absolute; bottom: ${ugBottom}%; left: ${Math.random() * 100}%;
            font-size: ${(14 + Math.random() * 18) * ugScale}px; opacity: ${0.45 + Math.random() * 0.45};
            transform: rotate(${Math.random() * 25 - 12}deg); z-index: ${ugZ};
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25)) ${timeOfDay === 'night' ? 'brightness(0.6)' : ''};
        `;
        c.appendChild(ug);
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
    
    Effects.woodlandLeafInterval = setInterval(spawnFallingLeaf, 1200);
    for (let i = 0; i < 6; i++) setTimeout(spawnFallingLeaf, i * 400);
    
    // ========================================================================
    // TREES — each one distinct: shape (round / conical / lumpy), trunk, greens
    // ========================================================================
    const treePresets = [
        { trunkRatio: 0.32, trunkW: 0.2, crownW: 1.15, crownH: 0.7, layers: 3, radius: '50%', hue: 0, trunkTint: 0, conical: false },
        { trunkRatio: 0.48, trunkW: 0.1, crownW: 0.65, crownH: 1.1, layers: 2, radius: '42% 42% 58% 58%', radiusTop: '35% 35% 62% 58%', hue: 15, trunkTint: 5, conical: true },
        { trunkRatio: 0.26, trunkW: 0.24, crownW: 1.4, crownH: 0.82, layers: 4, radius: '48% 52% 55% 45%', radiusLower: '52% 48% 48% 52%', radiusMid: '48% 52% 50% 48%', hue: -10, trunkTint: -3, conical: false },
        { trunkRatio: 0.38, trunkW: 0.12, crownW: 1.5, crownH: 0.5, layers: 2, radius: '55% 55% 45% 45%', radiusTop: '50% 50% 50% 50%', hue: 8, trunkTint: 2, conical: false },
        { trunkRatio: 0.28, trunkW: 0.22, crownW: 1.25, crownH: 0.8, layers: 4, radius: '50%', radiusLower: '55% 45% 45% 55%', radiusMid: '48% 52% 52% 48%', hue: -5, trunkTint: -2, conical: false },
        { trunkRatio: 0.3, trunkW: 0.18, crownW: 1.08, crownH: 0.78, layers: 3, radius: '38% 62% 58% 42%', radiusTop: '42% 58% 52% 48%', hue: 12, trunkTint: 3, conical: true }
    ];
    
    const createTree = (side, size, zIndex, treeIndex, bottomPct) => {
        const idx = Number(treeIndex) || 0;
        const preset = treePresets[idx % treePresets.length];
        const tree = document.createElement('div');
        const xOffset = (idx % 3) * 5 + (idx * 7 % 11) + (side === 'left' ? -2 : 2);
        const brightness = timeOfDay === 'night' ? 0.4 : (1 - (3 - zIndex) * 0.12);
        const swayX = (3 - zIndex) * (2 + idx % 2) + (side === 'left' ? -1 : 1) * (1 + idx % 2);
        const swaySkew = (3 - zIndex) * (0.3 + (idx % 3) * 0.1);
        const swayDur = 11 + zIndex * 2 + (idx % 4);
        const b = Math.max(0, Math.min(100, bottomPct != null ? bottomPct : 0));
        tree.style.cssText = `
            position: absolute; bottom: ${b}%; ${side}: ${xOffset}%;
            width: ${size * preset.crownW * (0.92 + (idx % 6) * 0.04)}px; height: ${size * 3.2}px; z-index: ${zIndex};
            filter: brightness(${brightness}) ${zIndex < 3 ? `blur(${(3 - zIndex) * 0.32}px)` : ''};
            --sway-x: ${swayX}px; --sway-skew: ${swaySkew}deg;
            animation: woodlandTreeSway ${swayDur}s ease-in-out infinite;
            animation-delay: ${(idx * 0.7) % 4}s;
        `;
        
        const trunkH = size * (1.1 + preset.trunkRatio * 1.4);
        const trunkWBase = size * preset.trunkW;
        const trunkWTop = size * (preset.trunkW * 0.35);
        const trunk = document.createElement('div');
        const trunkTint = preset.trunkTint || 0;
        trunk.style.cssText = `
            position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
            width: ${trunkWBase}px; height: ${trunkH}px;
            background: linear-gradient(90deg,
                #0f0a06 0%, #251a0e 15%, #4a3520 35%, #6b4a2e 50%, #4a3520 68%, #2a1c10 88%, #151008 100%);
            filter: hue-rotate(${trunkTint}deg) saturate(${0.9 + (idx % 3) * 0.05});
            clip-path: polygon(${(trunkWBase - trunkWTop) / 2}px 0, ${trunkWBase - (trunkWBase - trunkWTop) / 2}px 0,
                ${trunkWBase - 3}px 100%, 3px 100%);
            border-radius: 3px 3px 0 0;
            box-shadow: inset 4px 0 14px rgba(0,0,0,0.45), inset -3px 0 10px rgba(0,0,0,0.3),
                0 0 0 2px rgba(60,45,30,0.5), 0 6px 16px rgba(0,0,0,0.35);
        `;
        for (let b = 0; b < 10; b++) {
            const line = document.createElement('div');
            const tw = 2 + Math.random() * 2;
            const topPct = (b / 10) * 85 + Math.random() * 8;
            line.style.cssText = `
                position: absolute; left: ${15 + Math.random() * 70}%; top: ${topPct}%;
                width: ${tw}px; height: ${6 + Math.random() * 14}px;
                background: linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 100%);
                border-radius: 2px; transform: rotate(${(Math.random() - 0.5) * 6}deg);
            `;
            trunk.appendChild(line);
        }
        const rootFlare = document.createElement('div');
        rootFlare.style.cssText = `
            position: absolute; bottom: -2px; left: 50%; transform: translateX(-50%);
            width: ${trunkWBase * 1.5}px; height: ${trunkWBase * 0.6}px;
            background: linear-gradient(180deg, #2a1c10 0%, #1a1208 60%, transparent 100%);
            border-radius: 0 0 50% 50% / 0 0 40% 40%;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        `;
        trunk.appendChild(rootFlare);
        const baseShadow = document.createElement('div');
        baseShadow.style.cssText = `
            position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%);
            width: ${trunkWBase * 1.8}px; height: 10px;
            background: radial-gradient(ellipse 85% 50%, rgba(0,0,0,0.45), transparent 72%);
            border-radius: 50%;
        `;
        trunk.appendChild(baseShadow);
        tree.appendChild(trunk);
        
        const foliageWrap = document.createElement('div');
        foliageWrap.style.cssText = `position: absolute; inset: 0; pointer-events: none; filter: hue-rotate(${preset.hue}deg);`;
        
        const shapeVary = 0.92 + (preset.crownW * 0.08);
        const foliageBaseColors = timeOfDay === 'night'
            ? ['#0d1f0d', '#152515', '#1a2f1a', '#0f1a0f']
            : timeOfDay === 'dusk'
            ? ['#2d4a2d', '#3d5a3d', '#4a6b4a', '#375237']
            : ['#1e4d1e', '#2d5a2d', '#3a6b3a', '#275227', '#1f4a1f', '#3d7a3d'];
        const highlightColor = timeOfDay === 'night' ? 'rgba(70,95,70,0.2)' : timeOfDay === 'dusk' ? 'rgba(130,160,110,0.28)' : 'rgba(200,235,170,0.35)';
        const shadowColor = 'rgba(0,0,0,0.15)';
        const c0 = foliageBaseColors[0];
        const c1 = foliageBaseColors[1];
        const c2 = foliageBaseColors[2];
        
        const foliageBottom = size * (1.1 + preset.trunkRatio * 0.3);
        const crownH = size * preset.crownH;
        const foliageWidth = size * preset.crownW * shapeVary;
        const foliageMidWidth = size * preset.crownW * 0.78 * shapeVary;
        const foliageTopWidth = size * preset.crownW * (preset.conical ? 0.35 : 0.5) * shapeVary;
        const radiusLower = preset.radiusLower || preset.radius;
        const radiusMid = preset.radiusMid || preset.radius;
        const radiusTop = preset.radiusTop || (preset.conical ? '40% 40% 55% 45%' : preset.radius);
        
        if (preset.layers >= 2) {
            const lowerFoliage = document.createElement('div');
            lowerFoliage.style.cssText = `
                position: absolute; bottom: ${foliageBottom}px; left: 50%; transform: translateX(-50%);
                width: ${foliageWidth}px; height: ${crownH * 0.5}px;
                background: radial-gradient(ellipse 55% 50% at 35% 30%, ${highlightColor} 0%, ${c0} 28%, ${c1} 55%, ${c2} 85%, transparent 100%);
                border-radius: ${radiusLower};
                box-shadow: inset 0 -12px 20px ${shadowColor}, inset 4px 4px 12px rgba(255,255,255,0.04), 0 2px 8px rgba(0,0,0,0.12);
            `;
            foliageWrap.appendChild(lowerFoliage);
        }
        if (preset.layers >= 3) {
            const midFoliage = document.createElement('div');
            midFoliage.style.cssText = `
                position: absolute; bottom: ${foliageBottom + crownH * 0.4}px; left: 50%; transform: translateX(-50%);
                width: ${foliageMidWidth}px; height: ${crownH * 0.5}px;
                background: radial-gradient(ellipse 50% 55% at 40% 28%, ${highlightColor} 0%, ${c1} 25%, ${c0} 52%, ${c2} 82%, transparent 100%);
                border-radius: ${radiusMid};
                box-shadow: inset 0 -10px 18px ${shadowColor}, inset 3px 3px 10px rgba(255,255,255,0.05), 0 2px 6px rgba(0,0,0,0.1);
            `;
            foliageWrap.appendChild(midFoliage);
        }
        const topFoliage = document.createElement('div');
        topFoliage.style.cssText = `
            position: absolute; bottom: ${foliageBottom + crownH * (preset.layers >= 3 ? 0.85 : preset.layers >= 2 ? 0.5 : 0)}px; left: 50%; transform: translateX(-50%);
            width: ${foliageTopWidth}px; height: ${crownH * 0.45}px;
            background: radial-gradient(ellipse 45% 50% at 42% 25%, ${highlightColor} 0%, ${c1} 22%, ${c0} 60%, transparent 100%);
            border-radius: ${radiusTop};
            box-shadow: inset 0 -6px 12px ${shadowColor}, 0 2px 6px rgba(0,0,0,0.08);
        `;
        foliageWrap.appendChild(topFoliage);
        tree.appendChild(foliageWrap);
        
        return tree;
    };
    
    // Depth layers: back (high bottom, small) → front (low bottom, large) = looking into the wood
    c.appendChild(createTree('left', 42, 1, 0, 38));
    c.appendChild(createTree('right', 48, 1, 1, 40));
    c.appendChild(createTree('left', 38, 1, 2, 36));
    c.appendChild(createTree('right', 72, 2, 3, 22));
    c.appendChild(createTree('left', 78, 2, 4, 20));
    c.appendChild(createTree('right', 65, 2, 5, 24));
    c.appendChild(createTree('left', 110, 3, 0, 4));
    c.appendChild(createTree('right', 95, 3, 1, 2));
    c.appendChild(createTree('left', 100, 3, 2, 0));
    c.appendChild(createTree('right', 88, 3, 3, 6));
    
    // ========================================================================
    // HIDING SPOTS & CREATURES
    // ========================================================================
    const hidingSpots = [];
    const spotTypes = [{ emoji: '🪨', name: 'rock' }, { emoji: '🪵', name: 'log' }, { emoji: '🌿', name: 'bush' }];
    
    for (let i = 0; i < 10; i++) {
        const spotType = spotTypes[Math.floor(Math.random() * spotTypes.length)];
        const spot = document.createElement('div');
        const leftPos = 5 + (i * 9) + (Math.random() * 8 - 4);
        const depthTier = i % 3;
        const bottomPct = depthTier === 0 ? 2 + Math.random() * 6 : depthTier === 1 ? 14 + Math.random() * 10 : 26 + Math.random() * 10;
        const z = depthTier === 0 ? 11 : depthTier === 1 ? 8 : 5;
        const scale = depthTier === 0 ? 1 : depthTier === 1 ? 0.88 : 0.76;
        spot.className = 'woodland-hiding-spot';
        spot.style.cssText = `
            position: absolute; bottom: ${bottomPct}%; left: ${leftPos}%;
            font-size: ${(26 + Math.random() * 14) * scale}px; z-index: ${z}; cursor: default;
            transform: scale(${scale});
            transform-origin: center bottom;
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5)) drop-shadow(0 2px 4px rgba(0,0,0,0.3)) ${timeOfDay === 'night' ? 'brightness(0.58)' : ''};
        `;
        spot.textContent = spotType.emoji;
        c.appendChild(spot);
        hidingSpots.push({ el: spot, left: leftPos, bottom: bottomPct, creature: null, depthTier, scale });
    }
    
    const creatures = {
        day: ['🐿️', '🦊', '🦔', '🐁', '🐰'],
        night: ['🦉', '🐺', '🦇', '🦝'],
        rare: ['🦌', '🐻', '🦡']
    };
    
    // Creature identity: name, size, peek duration, filter, shadow, eye glow, messages
    const creatureProfile = {
        '🐿️': { name: 'Squirrel', size: 28, duration: 7, filter: 'brightness(1.05) saturate(1.1)', shadow: '2px 3px 5px rgba(80,50,20,0.4)', eyes: null, messages: ['Chitter chitter! Busy gathering.', 'Quick and curious — that\'s me!', 'Found a nut. Don\'t tell the fox.'] },
        '🦊': { name: 'Fox', size: 34, duration: 8.5, filter: 'brightness(1) saturate(1.15) hue-rotate(-5deg)', shadow: '3px 4px 8px rgba(180,80,30,0.35)', eyes: null, messages: ['Sly? I prefer "strategic."', 'Something tasty around here...', 'Just passing through. Nothing to see.'] },
        '🦔': { name: 'Hedgehog', size: 30, duration: 9, filter: 'brightness(0.98) contrast(1.05)', shadow: '2px 3px 6px rgba(60,50,40,0.5)', eyes: null, messages: ['Snuffle snuffle. Cozy spot.', 'Don\'t touch the spines!', 'Night crawler, at your service.'] },
        '🐁': { name: 'Mouse', size: 22, duration: 6, filter: 'brightness(1.02)', shadow: '1px 2px 4px rgba(0,0,0,0.5)', eyes: null, messages: ['Squeak! You found me.', 'Shhh — the owl might hear.', 'Tiny but mighty!'] },
        '🐰': { name: 'Rabbit', size: 32, duration: 7.5, filter: 'brightness(1.08) saturate(0.95)', shadow: '2px 3px 5px rgba(120,90,70,0.35)', eyes: null, messages: ['Hop! Nice to meet you.', 'Carrot season is the best.', 'Ears up — always listening.'] },
        '🦉': { name: 'Owl', size: 36, duration: 10, filter: 'brightness(0.9) contrast(1.1)', shadow: '3px 4px 10px rgba(20,15,30,0.6)', eyes: '#ffcc00', messages: ['Hoo. The night is mine.', 'Wise? I\'ve seen a few things.', 'Who goes there? ... It\'s you.'] },
        '🐺': { name: 'Wolf', size: 38, duration: 9.5, filter: 'brightness(0.85) contrast(1.08)', shadow: '4px 5px 12px rgba(40,40,60,0.5)', eyes: '#88ff88', messages: ['... No howl today. Just watching.', 'The pack is elsewhere. I guard.', 'Silent night. Stay calm.'] },
        '🦇': { name: 'Bat', size: 26, duration: 6.5, filter: 'brightness(0.88) saturate(0.9)', shadow: '2px 3px 6px rgba(30,20,50,0.5)', eyes: null, messages: ['Echo echo. Found you!', 'Best bugs are at dusk.', 'Upside-down is right-side up.'] },
        '🦝': { name: 'Raccoon', size: 32, duration: 8, filter: 'brightness(0.95) contrast(1.05)', shadow: '2px 4px 7px rgba(50,45,60,0.45)', eyes: '#aaddff', messages: ['Washing my paws. Very important.', 'Sneaky? I prefer "selective."', 'Anything shiny? Just asking.'] },
        '🦌': { name: 'Deer', size: 48, duration: 0, filter: 'brightness(1.05) drop-shadow(0 0 12px rgba(200,180,120,0.5))', shadow: '0 0 14px rgba(255,220,150,0.4)', eyes: null, messages: ['A moment of grace in the forest.', 'The herd is near. I lead.', 'Gentle steps. Quiet heart.'] },
        '🐻': { name: 'Bear', size: 52, duration: 0, filter: 'brightness(0.95) contrast(1.05)', shadow: '0 0 16px rgba(180,140,80,0.45)', eyes: null, messages: ['Just browsing. No honey? Oh well.', 'Big and friendly. Don\'t run.', 'The forest respects a full belly.'] },
        '🦡': { name: 'Badger', size: 34, duration: 0, filter: 'brightness(1) contrast(1.1)', shadow: '0 0 12px rgba(220,200,120,0.4)', eyes: null, messages: ['Rare sight. You\'re lucky.', 'Stripe squad. We dig deep.', 'Tough and tidy. That\'s the way.'] }
    };
    
    const getCreatureMessage = (emoji) => {
        const p = creatureProfile[emoji];
        if (!p || !p.messages || !p.messages.length) return 'A woodland friend!';
        return p.messages[Math.floor(Math.random() * p.messages.length)];
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
        const profile = creatureProfile[creature] || { name: 'Friend', size: 32, duration: 8, filter: '', shadow: '2px 2px 4px rgba(0,0,0,0.4)', eyes: null, messages: ['Hello from the forest!'] };
        const peekDuration = profile.duration || 8;
        
        const critterEl = document.createElement('div');
        critterEl.className = 'woodland-creature woodland-creature-' + (profile.name || 'friend').toLowerCase().replace(/\s/g, '-');
        critterEl.setAttribute('data-creature', creature);
        critterEl.style.animationDuration = peekDuration + 's';
        
        const creatureBottom = (typeof spot.bottom === 'number' ? spot.bottom : parseFloat(spot.el.style.bottom) || 0) + (spot.depthTier === 0 ? 4 : spot.depthTier === 1 ? 3 : 2);
        const creatureZ = (spot.depthTier === 0 ? 9 : spot.depthTier === 1 ? 7 : 6);
        const creatureScale = (spot.scale != null ? spot.scale : 1);
        const inner = document.createElement('div');
        inner.className = 'woodland-creature-emoji';
        inner.textContent = creature;
        inner.style.cssText = `
            font-size: ${Math.round(profile.size * creatureScale)}px;
            filter: ${profile.filter || 'none'};
            text-shadow: ${profile.shadow};
            line-height: 1;
        `;
        critterEl.appendChild(inner);
        
        critterEl.style.cssText = `
            position: absolute; bottom: ${creatureBottom}%;
            left: ${spot.left + 1.5}%; z-index: ${creatureZ};
            pointer-events: auto; cursor: pointer;
            display: flex; flex-direction: column; align-items: center;
            --creature-dur: ${peekDuration}s;
        `;
        
        if (profile.eyes && (timeOfDay === 'night' || timeOfDay === 'dusk')) {
            const eyes = document.createElement('div');
            eyes.className = 'woodland-creature-eyes';
            eyes.style.cssText = `
                position: absolute; top: 28%; left: 50%; transform: translateX(-50%);
                width: 20px; height: 6px; display: flex; justify-content: space-between; gap: 6px;
                pointer-events: none;
            `;
            eyes.innerHTML = `
                <div style="width:5px;height:5px;background:${profile.eyes};border-radius:50%;animation:eyeGlow 2.2s ease-in-out infinite;box-shadow:0 0 8px ${profile.eyes};"></div>
                <div style="width:5px;height:5px;background:${profile.eyes};border-radius:50%;animation:eyeGlow 2.2s ease-in-out infinite;animation-delay:0.4s;box-shadow:0 0 8px ${profile.eyes};"></div>
            `;
            critterEl.appendChild(eyes);
        }
        
        spot.creature = critterEl;
        c.appendChild(critterEl);
        
        critterEl.onclick = (e) => {
            e.stopPropagation();
            UIManager.showPostVoteMessage(getCreatureMessage(creature));
            SoundManager.playPop();
            Haptics.light();
            critterEl.style.animation = 'none';
            critterEl.style.transform = 'scale(1.35) translateY(-18px)';
            critterEl.style.opacity = '0';
            critterEl.style.transition = 'all 0.3s ease-out';
            setTimeout(() => { critterEl.remove(); spot.creature = null; }, 300);
        };
        
        setTimeout(() => { if (critterEl.parentNode) { critterEl.remove(); spot.creature = null; } }, peekDuration * 1000);
        
        const nextDelay = timeOfDay === 'night' ? 8000 : 4000;
        Effects.woodlandCreatureTimeout = setTimeout(spawnCreature, Math.random() * nextDelay + 2500);
    };
    
    Effects.woodlandCreatureTimeout = setTimeout(spawnCreature, 1200);
    
    // ========================================================================
    // RARE CREATURE SPAWNER — each with distinct size, glow, and personality
    // ========================================================================
    const spawnRareCreature = () => {
        if (State.runtime.currentTheme !== 'woodland') return;
        
        const rare = creatures.rare[Math.floor(Math.random() * creatures.rare.length)];
        const profile = creatureProfile[rare] || { name: 'Rare', size: 45, filter: '', shadow: '0 0 12px rgba(255,215,0,0.5)' };
        
        const rareEl = document.createElement('div');
        rareEl.className = 'woodland-rare woodland-rare-' + (profile.name || 'rare').toLowerCase();
        rareEl.setAttribute('data-creature', rare);
        
        const rareInner = document.createElement('div');
        rareInner.className = 'woodland-rare-emoji';
        rareInner.textContent = rare;
        rareInner.style.cssText = `
            font-size: ${profile.size}px; line-height: 1;
            filter: ${profile.filter}; text-shadow: ${profile.shadow};
        `;
        rareEl.appendChild(rareInner);
        
        const startLeft = Math.random() > 0.5;
        const rareBottom = 12 + Math.random() * 22;
        rareEl.style.cssText = `
            position: absolute; bottom: ${rareBottom}%;
            ${startLeft ? 'left' : 'right'}: -70px; z-index: 12;
            display: flex; flex-direction: column; align-items: center;
            transition: left 8s linear, right 8s linear;
        `;
        c.appendChild(rareEl);
        
        requestAnimationFrame(() => { rareEl.style[startLeft ? 'left' : 'right'] = '112%'; });
        
        rareEl.onclick = (e) => {
            e.stopPropagation();
            const badges = { '🦌': 'deer', '🐻': 'bear', '🦡': 'badger' };
            if (badges[rare]) State.unlockBadge(badges[rare]);
            UIManager.showPostVoteMessage(getCreatureMessage(rare));
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
            rareEl.style.transform = 'scale(1.8)';
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
    const particleCount = timeOfDay === 'night' ? 35 : (timeOfDay === 'dusk' ? 22 : 18);
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
    // INTERACTIVE MUSHROOMS (Collectible!)
    // ========================================================================
    // Initialize mushroom counter in State if not exists
    if (!State.data.mushroomsCollected) {
        State.data.mushroomsCollected = parseInt(localStorage.getItem('mushroomsCollected') || '0');
    }
    
    const mushroomTypes = ['🍄', '🍄‍🟫'];
    for (let i = 0; i < 14; i++) {
        const mushroom = document.createElement('div');
        const isRare = Math.random() < 0.15;
        mushroom.textContent = isRare ? '🍄‍🟫' : mushroomTypes[Math.floor(Math.random() * mushroomTypes.length)];
        mushroom.className = 'woodland-mushroom';
        mushroom.style.cssText = `
            position: absolute; bottom: ${Math.random() * 6 + 0.5}%; left: ${5 + Math.random() * 90}%;
            font-size: ${12 + Math.random() * 12}px; opacity: ${0.8 + Math.random() * 0.2}; z-index: 5;
            transform: scaleX(${Math.random() > 0.5 ? 1 : -1});
            filter: drop-shadow(0 3px 5px rgba(0,0,0,0.4)) ${timeOfDay === 'night' ? 'brightness(0.5)' : ''};
            cursor: pointer; pointer-events: auto;
            transition: transform 0.2s, opacity 0.2s;
        `;
        
        mushroom.onclick = (e) => {
            e.stopPropagation();
            State.data.mushroomsCollected++;
            localStorage.setItem('mushroomsCollected', State.data.mushroomsCollected);
            
            const msg = isRare ? '✨ Rare brown mushroom! ✨' : 'Mushroom collected!';
            UIManager.showPostVoteMessage(`🍄 ${msg} (${State.data.mushroomsCollected})`);
            SoundManager.playPop();
            Haptics.light();
            
            // Check for forager badge
            if (State.data.mushroomsCollected >= 10) {
                State.unlockBadge('forager');
            }
            
            // Pop animation
            mushroom.style.transform = 'scale(1.5)';
            mushroom.style.opacity = '0';
            setTimeout(() => mushroom.remove(), 200);
        };
        
        c.appendChild(mushroom);
    }
    
    // ========================================================================
    // FOREST SPIRIT (Ultra-rare mystical wisp)
    // ========================================================================
    const spawnForestSpirit = () => {
        if (State.runtime.currentTheme !== 'woodland') return;
        
        const spirit = document.createElement('div');
        spirit.className = 'woodland-spirit';
        spirit.innerHTML = `
            <div style="
                width: 20px; height: 20px;
                background: radial-gradient(circle, rgba(150, 255, 200, 1) 0%, rgba(100, 200, 255, 0.85) 45%, transparent 72%);
                border-radius: 50%;
                animation: spiritPulse 1.6s ease-in-out infinite;
                box-shadow: 0 0 22px rgba(150, 255, 200, 0.75), 0 0 44px rgba(100, 200, 255, 0.45);
            "></div>
        `;
        
        // Random path across screen
        const startY = 30 + Math.random() * 40;
        const startLeft = Math.random() > 0.5;
        
        spirit.style.cssText = `
            position: absolute;
            top: ${startY}%;
            ${startLeft ? 'left' : 'right'}: -30px;
            z-index: 25;
            pointer-events: auto;
            cursor: pointer;
            transition: left 12s cubic-bezier(0.4, 0, 0.2, 1), right 12s cubic-bezier(0.4, 0, 0.2, 1), top 12s ease-in-out;
        `;
        
        c.appendChild(spirit);
        
        // Trail effect
        const trailInterval = setInterval(() => {
            if (!spirit.parentNode) {
                clearInterval(trailInterval);
                return;
            }
            const trail = document.createElement('div');
            const rect = spirit.getBoundingClientRect();
            trail.style.cssText = `
                position: fixed;
                left: ${rect.left + 10}px;
                top: ${rect.top + 10}px;
                width: 10px; height: 10px;
                background: radial-gradient(circle, rgba(150, 255, 200, 0.6) 0%, transparent 70%);
                border-radius: 50%;
                pointer-events: none;
                animation: spiritTrail 1s ease-out forwards;
                z-index: 24;
            `;
            document.body.appendChild(trail);
            setTimeout(() => trail.remove(), 1000);
        }, 100);
        
        // Start movement
        requestAnimationFrame(() => {
            spirit.style[startLeft ? 'left' : 'right'] = '110%';
            spirit.style.top = (20 + Math.random() * 50) + '%';
        });
        
        spirit.onclick = (e) => {
            e.stopPropagation();
            clearInterval(trailInterval);
            
            State.unlockBadge('forestspirit');
            UIManager.showPostVoteMessage('🔮 You caught the Forest Spirit! ✨');
            SoundManager.playPop();
            Haptics.heavy();
            
            // Magical burst effect
            for (let i = 0; i < 15; i++) {
                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: fixed;
                    left: ${e.clientX}px;
                    top: ${e.clientY}px;
                    width: ${5 + Math.random() * 10}px;
                    height: ${5 + Math.random() * 10}px;
                    background: ${['#96ffc8', '#64c8ff', '#c8ff64', '#ffc864'][Math.floor(Math.random() * 4)]};
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 1000;
                `;
                document.body.appendChild(particle);
                
                const angle = (i / 15) * Math.PI * 2;
                const dist = 80 + Math.random() * 50;
                particle.animate([
                    { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
                    { transform: `translate(calc(-50% + ${Math.cos(angle) * dist}px), calc(-50% + ${Math.sin(angle) * dist}px)) scale(0)`, opacity: 0 }
                ], { duration: 800, easing: 'ease-out' }).onfinish = () => particle.remove();
            }
            
            spirit.style.transition = 'transform 0.5s, opacity 0.5s';
            spirit.style.transform = 'scale(3)';
            spirit.style.opacity = '0';
            setTimeout(() => spirit.remove(), 500);
        };
        
        // Remove after crossing screen
        setTimeout(() => {
            clearInterval(trailInterval);
            if (spirit.parentNode) spirit.remove();
        }, 14000);
        
        // Spawn again later (very rare - every 60-120 seconds)
        Effects.woodlandSpiritTimeout = setTimeout(spawnForestSpirit, 60000 + Math.random() * 60000);
    };
    
    // First spirit spawn after 20-40 seconds
    Effects.woodlandSpiritTimeout = setTimeout(spawnForestSpirit, 20000 + Math.random() * 20000);
    
    // ========================================================================
    // WEATHER CHANCE — light rain behind game UI, short streaks
    // ========================================================================
    if (Math.random() < 0.2 && timeOfDay !== 'night') {
        setTimeout(() => {
            if (State.runtime.currentTheme !== 'woodland') return;
            if (typeof Effects !== 'undefined' && Effects.rain) {
                Effects.rain(true, { intensity: 'light', zIndex: 35 });
            }
            if (typeof UIManager !== 'undefined' && UIManager.showPostVoteMessage) {
                UIManager.showPostVoteMessage('🌧️ A gentle forest rain begins...');
            }
        }, 5000);
    }
};

console.log('%c[Woodland] v' + (typeof WOODLAND_VERSION !== 'undefined' ? WOODLAND_VERSION : '1.0') + ' loaded', 'color: #16a34a; font-weight: bold');

})();
