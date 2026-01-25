/**
 * ============================================================================
 * WOODLAND THEME EFFECT
 * ============================================================================
 * Forest scene with trees, time-of-day lighting, creatures, and mushrooms
 */

(function() {
'use strict';

Effects.woodland = function(active) {
        const c = DOM.theme.effects.woodland;
        if (Effects.woodlandTimeout) clearTimeout(Effects.woodlandTimeout);
        if (Effects.woodlandCreatureTimeout) clearTimeout(Effects.woodlandCreatureTimeout);
        if (!active) {
            c.innerHTML = '';
            return;
        }
        c.innerHTML = '';
        const hour = new Date().getHours();
        let timeOfDay, lightColor, lightOpacity, bgGradient;
        if (hour >= 5 && hour < 8) {
            timeOfDay = 'dawn';
            lightColor = 'rgba(255, 200, 150, 0.3)';
            lightOpacity = 0.4;
            bgGradient = 'linear-gradient(180deg, #ffd89b 0%, #b8d4a8 30%, #5a7247 100%)';
        } else if (hour >= 8 && hour < 17) {
            timeOfDay = 'day';
            lightColor = 'rgba(255, 255, 200, 0.25)';
            lightOpacity = 0.5;
            bgGradient = 'linear-gradient(180deg, #87ceeb 0%, #98d4a5 30%, #4a6741 100%)';
        } else if (hour >= 17 && hour < 20) {
            timeOfDay = 'dusk';
            lightColor = 'rgba(255, 150, 100, 0.35)';
            lightOpacity = 0.3;
            bgGradient = 'linear-gradient(180deg, #ff7e5f 0%, #feb47b 30%, #4a5240 100%)';
        } else {
            timeOfDay = 'night';
            lightColor = 'rgba(100, 120, 180, 0.2)';
            lightOpacity = 0.15;
            bgGradient = 'linear-gradient(180deg, #1a1a2e 0%, #16213e 30%, #1f3a28 100%)';
        }
        c.style.cssText = `
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 0;
            overflow: hidden;
            background: ${bgGradient};
        `;
        const floor = document.createElement('div');
        floor.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 25%;
            background: linear-gradient(180deg, transparent 0%, #3d2914 30%, #2a1f0f 100%);
        `;
        c.appendChild(floor);
        for (let i = 0; i < 20; i++) {
            const leaf = document.createElement('div');
            const leafEmojis = ['🍂', '🍁', '🍃'];
            leaf.textContent = leafEmojis[Math.floor(Math.random() * leafEmojis.length)];
            leaf.style.cssText = `
                position: absolute;
                bottom: ${Math.random() * 15}%;
                left: ${Math.random() * 100}%;
                font-size: ${Math.random() * 12 + 10}px;
                opacity: ${Math.random() * 0.4 + 0.3};
                transform: rotate(${Math.random() * 360}deg);
            `;
            c.appendChild(leaf);
        }
        const createTree = (left, size, zIndex) => {
            const tree = document.createElement('div');
            const xOffset = Math.random() * 10 - 5;
            tree.style.cssText = `
                position: absolute;
                bottom: 12%;
                ${left ? 'left' : 'right'}: ${xOffset}%;
                width: ${size * 1.5}px;
                height: ${size * 3}px;
                z-index: ${zIndex};
            `;
            const trunk = document.createElement('div');
            const trunkW = size * 0.18;
            trunk.style.cssText = `
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: ${trunkW}px;
                height: ${size * 1.2}px;
                background: linear-gradient(90deg,
                    #1a1208 0%,
                    #3d2914 20%,
                    #5a4025 40%,
                    #3d2914 60%,
                    #2a1f0f 80%,
                    #1a1208 100%);
                border-radius: 3px 3px 8px 8px;
                box-shadow: inset -3px 0 8px rgba(0,0,0,0.4), inset 3px 0 8px rgba(0,0,0,0.2);
            `;
            for (let b = 0; b < 6; b++) {
                const line = document.createElement('div');
                line.style.cssText = `
                    position: absolute;
                    left: ${20 + Math.random() * 60}%;
                    top: ${b * 16 + Math.random() * 5}%;
                    width: 2px;
                    height: ${8 + Math.random() * 12}px;
                    background: rgba(0,0,0,0.3);
                    border-radius: 1px;
                `;
                trunk.appendChild(line);
            }
            tree.appendChild(trunk);
            const foliageColors = timeOfDay === 'night'
                ? ['#0d1f0d', '#152515', '#1a2f1a', '#0f1a0f']
                : ['#1e4d1e', '#2d5a2d', '#3a6b3a', '#275227', '#1f4a1f'];
            const clusters = 8 + Math.floor(Math.random() * 5);
            for (let i = 0; i < clusters; i++) {
                const cluster = document.createElement('div');
                const clusterSize = size * (0.4 + Math.random() * 0.35);
                const angle = (i / clusters) * Math.PI * 2;
                const radius = size * (0.3 + Math.random() * 0.25);
                const cx = Math.cos(angle) * radius;
                const cy = Math.sin(angle) * radius * 0.6;
                const baseY = size * 1.4;
                cluster.style.cssText = `
                    position: absolute;
                    bottom: ${baseY + cy}px;
                    left: calc(50% + ${cx}px);
                    transform: translateX(-50%);
                    width: ${clusterSize}px;
                    height: ${clusterSize * 0.85}px;
                    background: radial-gradient(ellipse at 30% 30%,
                        ${foliageColors[Math.floor(Math.random() * foliageColors.length)]} 0%,
                        ${foliageColors[Math.floor(Math.random() * foliageColors.length)]} 70%,
                        transparent 100%);
                    border-radius: 50% 50% 45% 55% / 60% 55% 45% 40%;
                    filter: blur(0.5px);
                `;
                tree.appendChild(cluster);
            }
            const centerCluster = document.createElement('div');
            centerCluster.style.cssText = `
                position: absolute;
                bottom: ${size * 1.5}px;
                left: 50%;
                transform: translateX(-50%);
                width: ${size * 0.7}px;
                height: ${size * 0.6}px;
                background: radial-gradient(ellipse at 40% 35%,
                    ${foliageColors[1]} 0%,
                    ${foliageColors[0]} 60%,
                    transparent 100%);
                border-radius: 50%;
            `;
            tree.appendChild(centerCluster);
            const topCluster = document.createElement('div');
            topCluster.style.cssText = `
                position: absolute;
                bottom: ${size * 2}px;
                left: 50%;
                transform: translateX(-50%);
                width: ${size * 0.5}px;
                height: ${size * 0.45}px;
                background: radial-gradient(ellipse at 35% 30%,
                    ${foliageColors[2]} 0%,
                    ${foliageColors[0]} 70%,
                    transparent 100%);
                border-radius: 45% 55% 50% 50% / 60% 60% 40% 40%;
            `;
            tree.appendChild(topCluster);
            return tree;
        };
        c.appendChild(createTree(true, 130, 3));
        c.appendChild(createTree(true, 90, 2));
        c.appendChild(createTree(true, 60, 1));
        c.appendChild(createTree(false, 110, 3));
        c.appendChild(createTree(false, 75, 2));
        c.appendChild(createTree(false, 50, 1));
        const hidingSpots = [];
        const spotTypes = [
            { emoji: '🪨', name: 'rock', width: 60, height: 40 },
            { emoji: '🪵', name: 'log', width: 80, height: 35 },
            { emoji: '🌳', name: 'bush', width: 50, height: 50 }
        ];
        for (let i = 0; i < 5; i++) {
            const spotType = spotTypes[Math.floor(Math.random() * spotTypes.length)];
            const spot = document.createElement('div');
            const leftPos = 15 + (i * 17) + (Math.random() * 10 - 5);
            spot.className = 'woodland-hiding-spot';
            spot.style.cssText = `
                position: absolute;
                bottom: ${12 + Math.random() * 8}%;
                left: ${leftPos}%;
                font-size: ${spotType.width * 0.6}px;
                z-index: 10;
                cursor: default;
                filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.4));
                transition: transform 0.2s;
            `;
            spot.textContent = spotType.emoji;
            c.appendChild(spot);
            hidingSpots.push({ el: spot, left: leftPos, creature: null });
        }
        const lightOverlay = document.createElement('div');
        lightOverlay.style.cssText = `
            position: absolute;
            inset: 0;
            pointer-events: none;
            z-index: 5;
        `;
        for (let i = 0; i < 6; i++) {
            const beam = document.createElement('div');
            const leftPos = 10 + i * 15 + Math.random() * 10;
            beam.style.cssText = `
                position: absolute;
                top: 0;
                left: ${leftPos}%;
                width: ${20 + Math.random() * 30}px;
                height: 100%;
                background: linear-gradient(180deg, ${lightColor} 0%, transparent 70%);
                opacity: ${lightOpacity};
                transform: skewX(${(Math.random() - 0.5) * 20}deg);
                animation: woodlandLightSway ${8 + Math.random() * 4}s ease-in-out infinite alternate;
            `;
            lightOverlay.appendChild(beam);
        }
        c.appendChild(lightOverlay);
        if (!document.getElementById('woodland-styles')) {
            const style = document.createElement('style');
            style.id = 'woodland-styles';
            style.textContent = `
                @keyframes woodlandLightSway {
                    0% { transform: skewX(-5deg) translateX(-10px); opacity: ${lightOpacity}; }
                    100% { transform: skewX(5deg) translateX(10px); opacity: ${lightOpacity * 0.7}; }
                }
                @keyframes creaturePeek {
                    0%, 100% { transform: translateY(100%) scale(0.8); opacity: 0; }
                    10%, 90% { transform: translateY(0) scale(1); opacity: 1; }
                }
                @keyframes creatureEyes {
                    0%, 90%, 100% { opacity: 0; }
                    30%, 70% { opacity: 1; }
                }
                .woodland-creature {
                    animation: creaturePeek 6s ease-in-out forwards;
                }
                .woodland-hiding-spot:hover {
                    transform: scale(1.05);
                }
            `;
            document.head.appendChild(style);
        }
        const creatures = ['🐿️', '🦊', '🐺', '🦉', '🦔', '🐁'];
        const creatureMessages = {
            '🐿️': 'A curious squirrel watches you!',
            '🦊': 'A sly fox peeks out!',
            '🐺': 'A wolf observes from afar...',
            '🦉': 'Hoo! An owl spots you!',
            '🦔': 'A hedgehog snuffles about!',
            '🐁': 'A tiny mouse scurries by!'
        };
        const spawnCreature = () => {
            if (State.runtime.currentTheme !== 'woodland') return;
            const emptySpots = hidingSpots.filter(s => !s.creature);
            if (emptySpots.length === 0) {
                Effects.woodlandCreatureTimeout = setTimeout(spawnCreature, 5000);
                return;
            }
            const spot = emptySpots[Math.floor(Math.random() * emptySpots.length)];
            const creature = creatures[Math.floor(Math.random() * creatures.length)];
            const nightCreatures = ['🦉', '🐺'];
            const activeCreature = timeOfDay === 'night'
                ? nightCreatures[Math.floor(Math.random() * nightCreatures.length)]
                : creature;
            const critterEl = document.createElement('div');
            critterEl.className = 'woodland-creature';
            critterEl.textContent = activeCreature;
            critterEl.style.cssText = `
                position: absolute;
                bottom: ${parseInt(spot.el.style.bottom) + 3}%;
                left: ${spot.left + 2}%;
                font-size: 28px;
                z-index: 9;
                pointer-events: auto;
                cursor: pointer;
                filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.4));
            `;
            if (timeOfDay === 'night' && (activeCreature === '🦉' || activeCreature === '🐺')) {
                const eyes = document.createElement('div');
                eyes.style.cssText = `
                    position: absolute;
                    top: 25%;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 20px;
                    height: 8px;
                    display: flex;
                    justify-content: space-between;
                    animation: creatureEyes 6s ease-in-out forwards;
                `;
                eyes.innerHTML = `
                    <div style="width:6px;height:6px;background:rgba(255,255,100,0.9);border-radius:50%;box-shadow:0 0 8px rgba(255,255,100,0.8);"></div>
                    <div style="width:6px;height:6px;background:rgba(255,255,100,0.9);border-radius:50%;box-shadow:0 0 8px rgba(255,255,100,0.8);"></div>
                `;
                critterEl.appendChild(eyes);
            }
            spot.creature = critterEl;
            c.appendChild(critterEl);
            critterEl.onclick = (e) => {
                e.stopPropagation();
                UIManager.showPostVoteMessage(creatureMessages[activeCreature] || 'A woodland creature!');
                critterEl.style.animation = 'none';
                critterEl.style.transform = 'scale(1.3)';
                critterEl.style.opacity = '0';
                setTimeout(() => {
                    critterEl.remove();
                    spot.creature = null;
                }, 300);
            };
            setTimeout(() => {
                if (critterEl.parentNode) {
                    critterEl.remove();
                    spot.creature = null;
                }
            }, 6000);
            const nextDelay = timeOfDay === 'night' ? 15000 : 8000;
            Effects.woodlandCreatureTimeout = setTimeout(spawnCreature, Math.random() * nextDelay + 5000);
        };
        Effects.woodlandCreatureTimeout = setTimeout(spawnCreature, 3000);
        for (let i = 0; i < (timeOfDay === 'night' ? 15 : 8); i++) {
            const particle = document.createElement('div');
            const isFirefly = timeOfDay === 'night' || timeOfDay === 'dusk';
            particle.style.cssText = `
                position: absolute;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 70}%;
                width: ${isFirefly ? 4 : 2}px;
                height: ${isFirefly ? 4 : 2}px;
                background: ${isFirefly ? 'rgba(200, 255, 100, 0.9)' : 'rgba(255, 255, 200, 0.6)'};
                border-radius: 50%;
                ${isFirefly ? 'box-shadow: 0 0 6px rgba(200, 255, 100, 0.8);' : ''}
                animation: float${i} ${10 + Math.random() * 10}s ease-in-out infinite;
                z-index: 6;
            `;
            const style = document.createElement('style');
            style.textContent = `
                @keyframes float${i} {
                    0%, 100% {
                        transform: translate(0, 0) scale(1);
                        opacity: ${isFirefly ? 0.3 : 0.5};
                    }
                    25% {
                        transform: translate(${Math.random() * 40 - 20}px, ${Math.random() * 30 - 15}px) scale(${isFirefly ? 1.2 : 1});
                        opacity: ${isFirefly ? 1 : 0.7};
                    }
                    50% {
                        transform: translate(${Math.random() * 40 - 20}px, ${Math.random() * 30 - 15}px) scale(1);
                        opacity: ${isFirefly ? 0.2 : 0.4};
                    }
                    75% {
                        transform: translate(${Math.random() * 40 - 20}px, ${Math.random() * 30 - 15}px) scale(${isFirefly ? 1.3 : 1});
                        opacity: ${isFirefly ? 0.9 : 0.6};
                    }
                }
            `;
            document.head.appendChild(style);
            c.appendChild(particle);
        }
        for (let i = 0; i < 4; i++) {
            const mushroom = document.createElement('div');
            mushroom.textContent = '🍄';
            mushroom.style.cssText = `
                position: absolute;
                bottom: ${10 + Math.random() * 5}%;
                left: ${10 + Math.random() * 80}%;
                font-size: ${12 + Math.random() * 8}px;
                opacity: 0.8;
                z-index: 3;
                filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.3));
            `;
            c.appendChild(mushroom);
        }
    },

console.log('%c[Theme: Woodland] Loaded', 'color: #16a34a');

})();
