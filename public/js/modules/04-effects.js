/**
 * ============================================================================
 * GOOD WORD / BAD WORD - EFFECTS & THEMES MODULE
 * ============================================================================
 * 
 * This module handles visual themes and special effects:
 * - ThemeManager: Theme switching, secret word detection, theme gallery
 * - Effects: Theme-specific particle effects
 *   - Snow (winter), Fire, Bubbles (submarine), Space, Ocean, Flight, etc.
 * - MosquitoManager: Interactive bug easter egg
 * - SnowmanBuilder: Collectible snowflake system
 * - SoundManager: Web Audio API sound effects
 * - TiltManager: Device orientation for card tilt
 * - Physics: Card swipe animation physics
 * 
 * Dependencies: 01-core.js (CONFIG, State, DOM), 02-weather.js (WeatherManager)
 * Loaded: After weather module
 * ============================================================================
 */

(function() {
'use strict';

// ============================================================================
// SOUND MANAGER - Web Audio API
// ============================================================================
/**
 * Manages game sound effects using Web Audio API.
 * All sounds are synthesized - no audio files needed.
 */
const SoundManager = {
    ctx: null,
    enabled: true,
    volume: 0.3,
    
    init() {
        if (this.ctx) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.enabled = !State.data.settings.muteSounds;
        } catch (e) {
            console.warn('[Sound] Web Audio not supported');
        }
    },
    
    async resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }
    },
    
    playTone(freq, duration, type = 'sine', vol = 0.3) {
        if (!this.enabled || !this.ctx) return;
        this.resume();
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(vol * this.volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },
    
    playGood() {
        this.playTone(523, 0.1, 'sine', 0.3);
        setTimeout(() => this.playTone(659, 0.1, 'sine', 0.3), 100);
    },
    
    playBad() {
        this.playTone(200, 0.15, 'sawtooth', 0.2);
    },
    
    playUnlock() {
        [392, 523, 659, 784].forEach((f, i) => {
            setTimeout(() => this.playTone(f, 0.3, 'sine', 0.25), i * 80);
        });
    },
    
    playStreak() {
        [523, 659, 784].forEach((f, i) => {
            setTimeout(() => this.playTone(f, 0.2, 'sine', 0.25), i * 70);
        });
    },
    
    playClick() {
        this.playTone(800, 0.05, 'sine', 0.2);
    },
    
    playError() {
        this.playTone(150, 0.2, 'square', 0.15);
    }
};


// ============================================================================
// TILT MANAGER - Device Orientation
// ============================================================================
/**
 * Handles device orientation for card tilt effects
 */
const TiltManager = {
    enabled: false,
    gamma: 0,
    beta: 0,
    smoothGamma: 0,
    smoothBeta: 0,
    
    init() {
        this.enabled = State.data.settings.enableTilt;
        if (this.enabled && window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (e) => this.handleOrientation(e));
        }
    },
    
    handleOrientation(e) {
        if (!this.enabled) return;
        this.gamma = e.gamma || 0;
        this.beta = e.beta || 0;
        this.smoothGamma += (this.gamma - this.smoothGamma) * 0.1;
        this.smoothBeta += (this.beta - this.smoothBeta) * 0.1;
    },
    
    getTilt() {
        if (!this.enabled) return { x: 0, y: 0 };
        return {
            x: Math.max(-15, Math.min(15, this.smoothGamma * 0.3)),
            y: Math.max(-15, Math.min(15, (this.smoothBeta - 45) * 0.3))
        };
    }
};


// ============================================================================
// PHYSICS - Card Animation
// ============================================================================
/**
 * Physics calculations for card swipe animations
 */
const Physics = {
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    rotation: 0,
    friction: 0.92,
    springStrength: 0.15,
    
    applySwipe(vx, vy) {
        this.velocity.x = vx;
        this.velocity.y = vy;
    },
    
    update() {
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        
        // Spring back to center
        this.position.x -= this.position.x * this.springStrength;
        this.position.y -= this.position.y * this.springStrength;
        
        this.rotation = this.position.x * 0.1;
        
        return {
            x: this.position.x,
            y: this.position.y,
            rotation: this.rotation
        };
    },
    
    reset() {
        this.position = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.rotation = 0;
    }
};


// ============================================================================
// MOSQUITO MANAGER - Interactive Bug Easter Egg
// ============================================================================
/**
 * Spawns a mosquito that flies around the screen.
 * Player can tap to save it or let the spider eat it.
 */
const MosquitoManager = {
    el: null,
    x: 50,
    y: 50,
    state: 'flying', // 'flying', 'stuck', 'eaten', 'saved'
    timeout: null,
    
    canSpawn() {
        if (State.data.settings.arachnophobiaMode) return false;
        const now = Date.now();
        const last = State.data.lastMosquitoSpawn || 0;
        const cooldown = 5 * 60 * 1000; // 5 minutes
        return (now - last) > cooldown;
    },
    
    spawn() {
        if (!this.canSpawn()) return;
        if (this.el) return;
        
        State.save('lastMosquitoSpawn', Date.now());
        
        // Random bug type
        const bugs = ['🦟', '🐞', '🐝'];
        const weights = [0.7, 0.2, 0.1];
        let r = Math.random(), bug = bugs[0];
        for (let i = 0; i < weights.length; i++) {
            r -= weights[i];
            if (r <= 0) { bug = bugs[i]; break; }
        }
        
        this.el = document.createElement('div');
        this.el.id = 'mosquito';
        this.el.textContent = bug;
        this.el.style.cssText = `
            position: fixed;
            font-size: 2rem;
            z-index: 100;
            cursor: pointer;
            transition: transform 0.1s;
            filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.3));
        `;
        document.body.appendChild(this.el);
        
        this.state = 'flying';
        this.x = Math.random() * 80 + 10;
        this.y = Math.random() * 80 + 10;
        
        this.el.onclick = () => this.save();
        this.fly();
    },
    
    fly() {
        if (this.state !== 'flying' || !this.el) return;
        
        // Random movement
        this.x += (Math.random() - 0.5) * 15;
        this.y += (Math.random() - 0.5) * 15;
        
        // Keep in bounds
        this.x = Math.max(5, Math.min(95, this.x));
        this.y = Math.max(5, Math.min(95, this.y));
        
        this.el.style.left = this.x + '%';
        this.el.style.top = this.y + '%';
        
        // Buzz sound occasionally
        if (Math.random() < 0.1) {
            SoundManager.playTone(220 + Math.random() * 100, 0.1, 'sawtooth', 0.05);
        }
        
        this.timeout = setTimeout(() => this.fly(), 200 + Math.random() * 300);
    },
    
    save() {
        if (this.state !== 'flying') return;
        this.state = 'saved';
        
        if (this.timeout) clearTimeout(this.timeout);
        
        State.data.insectStats.saved++;
        State.save('insectStats', State.data.insectStats);
        
        if (window.UIManager) {
            UIManager.showPostVoteMessage("Bug saved! 🐛💚");
        }
        
        // Fly away animation
        if (this.el) {
            this.el.style.transition = 'all 1s ease-out';
            this.el.style.transform = 'translateY(-200px) scale(0)';
            this.el.style.opacity = '0';
            setTimeout(() => this.cleanup(), 1000);
        }
        
        // Badge check
        if (State.data.insectStats.saved >= 100) {
            State.unlockBadge('saint');
        }
    },
    
    eat() {
        this.state = 'eaten';
        if (this.timeout) clearTimeout(this.timeout);
        
        State.data.insectStats.eaten++;
        
        // Track for spider fullness
        const now = Date.now();
        const eatLog = State.data.spiderEatLog || [];
        eatLog.push(now);
        // Keep only last hour
        const oneHourAgo = now - (60 * 60 * 1000);
        State.data.spiderEatLog = eatLog.filter(t => t > oneHourAgo);
        
        // Spider gets full after 5 bugs in an hour
        if (State.data.spiderEatLog.length >= 5) {
            State.data.spiderFullUntil = now + (30 * 60 * 1000); // Full for 30 min
            State.save('spiderFullUntil', State.data.spiderFullUntil);
        }
        
        State.save('insectStats', State.data.insectStats);
        State.save('spiderEatLog', State.data.spiderEatLog);
        
        this.cleanup();
        
        if (State.data.insectStats.eaten >= 100) {
            State.unlockBadge('exterminator');
        }
    },
    
    cleanup() {
        if (this.el) {
            this.el.remove();
            this.el = null;
        }
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }
};


// ============================================================================
// THEME MANAGER - Theme Switching & Secrets
// ============================================================================
/**
 * Manages visual themes and detects secret words that unlock themes.
 */
const ThemeManager = {
    wordMap: {},
    
    init() {
        // Build word -> theme mapping from encoded secrets
        Object.entries(CONFIG.THEME_SECRETS).forEach(([theme, encoded]) => {
            try {
                atob(encoded).split('|').forEach(word => {
                    this.wordMap[word.toUpperCase()] = theme;
                });
            } catch (e) {}
        });
        
        // Inject required styles
        this.injectStyles();
        
        // Check traveler badge
        if ((State.data.unlockedThemes.length + 1) >= 5) {
            State.unlockBadge('traveler');
        }
        
        // Apply initial theme
        let theme = State.data.currentTheme;
        if (State.data.settings.randomizeTheme && State.data.unlockedThemes.length > 0) {
            const available = ['default', ...State.data.unlockedThemes];
            theme = available[Math.floor(Math.random() * available.length)];
        }
        this.apply(theme);
    },
    
    injectStyles() {
        // Rain styles (fallback for CSS rain)
        if (!document.getElementById('rain-styles')) {
            const style = document.createElement('style');
            style.id = 'rain-styles';
            style.innerHTML = `
                .rain-drop {
                    position: absolute;
                    background: rgba(59, 130, 246, 0.9);
                    width: 2px;
                    height: 15px;
                    bottom: 100%;
                    animation: rain-fall linear infinite;
                    pointer-events: none;
                    z-index: 50;
                }
                @keyframes rain-fall {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(110vh); }
                }
                @keyframes shake {
                    10%, 90% { transform: translate3d(-1px, 0, 0); }
                    20%, 80% { transform: translate3d(2px, 0, 0); }
                    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                    40%, 60% { transform: translate3d(4px, 0, 0); }
                }
            `;
            document.head.appendChild(style);
        }
    },
    
    /**
     * Check if a word unlocks a theme
     * @param {string} word - Word to check
     * @returns {string|null} Theme name if unlocked, null otherwise
     */
    checkUnlock(word) {
        const theme = this.wordMap[word.toUpperCase()];
        if (!theme) return null;
        
        // Already unlocked?
        if (State.data.unlockedThemes.includes(theme)) return null;
        
        // Unlock it
        State.data.unlockedThemes.push(theme);
        State.save('unlockedThemes', State.data.unlockedThemes);
        
        // Show notification
        const name = theme === 'ballpit' ? 'Ball Pit' : theme.charAt(0).toUpperCase() + theme.slice(1);
        if (window.StreakManager) {
            StreakManager.showNotification(`🎨 Theme Unlocked: ${name}!`, 'success');
        } else if (window.UIManager) {
            UIManager.showPostVoteMessage(`🎨 Unlocked ${name} theme!`);
        }
        
        // Check traveler badge
        if ((State.data.unlockedThemes.length + 1) >= 5) {
            State.unlockBadge('traveler');
        }
        
        return theme;
    },
    
    /**
     * Apply a theme
     * @param {string} theme - Theme name
     * @param {boolean} manual - Whether user manually selected
     */
    apply(theme, manual = false) {
        State.runtime.currentTheme = theme;
        
        if (manual !== 'temp') {
            State.save('currentTheme', theme);
            if (manual === true) State.save('manualTheme', true);
        }
        
        // Update body class
        document.body.className = document.body.className
            .split(' ')
            .filter(c => !c.startsWith('theme-'))
            .join(' ');
        document.body.classList.add(`theme-${theme}`);
        
        // Stop all effects first
        this.clearEffects();
        
        // Start appropriate effect
        switch (theme) {
            case 'winter':
                Effects.snow(true);
                break;
            case 'submarine':
                Effects.bubbles(true);
                break;
            case 'fire':
                Effects.fire(true);
                break;
            case 'space':
                Effects.space(true);
                break;
            case 'plymouth':
                Effects.plymouth(true);
                break;
            case 'ballpit':
                Effects.ballpit(true);
                break;
            case 'woodland':
                Effects.woodland(true);
                break;
            case 'flight':
                Effects.flight(true);
                break;
            case 'ocean':
                Effects.ocean(true);
                break;
        }
        
        // Update weather visuals
        if (window.WeatherManager) {
            WeatherManager.updateVisuals();
        }
    },
    
    clearEffects() {
        // Stop all theme effects
        ['snow', 'bubble', 'fire', 'space', 'plymouth', 'ballpit', 'woodland', 'flight', 'ocean'].forEach(id => {
            const el = document.getElementById(`${id}-effect`);
            if (el) el.innerHTML = '';
        });
        
        // Clear effect timeouts
        if (window.Effects) {
            Effects.clearAllTimeouts();
        }
    },
    
    /**
     * Show theme gallery modal
     */
    showGallery() {
        const themeInfo = {
            default: { icon: '🎨', name: 'Default' },
            rainbow: { icon: '🌈', name: 'Rainbow' },
            dark: { icon: '🌙', name: 'Dark' },
            banana: { icon: '🍌', name: 'Banana' },
            winter: { icon: '❄️', name: 'Winter' },
            summer: { icon: '☀️', name: 'Summer' },
            halloween: { icon: '🎃', name: 'Halloween' },
            submarine: { icon: '🐠', name: 'Submarine' },
            fire: { icon: '🔥', name: 'Fire' },
            plymouth: { icon: '⚓', name: 'Plymouth' },
            ballpit: { icon: '🎾', name: 'Ball Pit' },
            space: { icon: '🚀', name: 'Space' },
            woodland: { icon: '🌲', name: 'Woodland' },
            flight: { icon: '✈️', name: 'Flight' },
            ocean: { icon: '🌊', name: 'Ocean' }
        };
        
        const unlocked = ['default', ...State.data.unlockedThemes];
        const current = State.runtime.currentTheme;
        
        // Remove existing
        const existing = document.getElementById('theme-gallery-popup');
        if (existing) { existing.remove(); return; }
        
        const popup = document.createElement('div');
        popup.id = 'theme-gallery-popup';
        popup.className = 'fixed inset-0 z-[9999] flex items-end justify-center';
        popup.innerHTML = `
            <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" onclick="document.getElementById('theme-gallery-popup').remove()"></div>
            <div class="relative bg-white rounded-t-3xl shadow-2xl p-4 pb-8 w-full max-w-md" style="animation: slideUp 0.3s ease-out">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-black text-gray-800">🎨 Themes (${unlocked.length}/${Object.keys(themeInfo).length})</h3>
                    <button onclick="document.getElementById('theme-gallery-popup').remove()" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>
                <div class="grid grid-cols-3 gap-3" id="theme-grid"></div>
                <p class="text-xs text-gray-400 mt-4 text-center">Vote on secret words to unlock themes!</p>
            </div>
        `;
        document.body.appendChild(popup);
        
        // Add animation
        if (!document.getElementById('theme-gallery-style')) {
            const style = document.createElement('style');
            style.id = 'theme-gallery-style';
            style.textContent = `@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`;
            document.head.appendChild(style);
        }
        
        const grid = document.getElementById('theme-grid');
        Object.keys(themeInfo).forEach(key => {
            const info = themeInfo[key];
            const isUnlocked = unlocked.includes(key);
            const isActive = current === key;
            
            const tile = document.createElement('div');
            tile.className = `p-3 rounded-xl flex flex-col items-center justify-center aspect-square cursor-pointer transition-all ${
                isUnlocked 
                    ? `bg-gray-100 hover:scale-105 ${isActive ? 'ring-2 ring-indigo-500' : ''}`
                    : 'bg-gray-200 opacity-50'
            }`;
            tile.innerHTML = isUnlocked
                ? `<span class="text-3xl mb-1">${info.icon}</span><span class="text-xs font-bold">${info.name}</span>`
                : `<span class="text-2xl mb-1">🔒</span><span class="text-xs font-bold text-gray-400">???</span>`;
            
            if (isUnlocked) {
                tile.onclick = () => {
                    this.apply(key, true);
                    document.getElementById('theme-gallery-popup')?.remove();
                };
            }
            
            grid.appendChild(tile);
        });
    }
};


// ============================================================================
// EFFECTS - Theme Visual Effects
// ============================================================================
/**
 * Visual effects for each theme (snow, fire, bubbles, etc.)
 */
const Effects = {
    // Timeout references for cleanup
    timeouts: [],
    intervals: [],
    rafs: [],
    
    clearAllTimeouts() {
        this.timeouts.forEach(t => clearTimeout(t));
        this.intervals.forEach(i => clearInterval(i));
        this.rafs.forEach(r => cancelAnimationFrame(r));
        this.timeouts = [];
        this.intervals = [];
        this.rafs = [];
    },
    
    /**
     * Rain effect - now delegates to RealisticRain
     */
    rain(active) {
        if (window.RealisticRain) {
            if (active) RealisticRain.start();
            else RealisticRain.stop();
        }
    },
    
    /**
     * Snow effect for winter theme and weather
     */
    snow(active) {
        const c = document.getElementById('snow-effect');
        if (!c) return;
        
        if (!active) {
            c.innerHTML = '';
            c.style.display = 'none';
            return;
        }
        
        c.style.display = 'block';
        c.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:50;overflow:hidden;';
        
        if (c.children.length > 0) return;
        
        // Add snow animation
        if (!document.getElementById('snow-anim-style')) {
            const style = document.createElement('style');
            style.id = 'snow-anim-style';
            style.innerHTML = `
                @keyframes snow-fall {
                    0% { transform: translateY(-10px) translateX(0); }
                    100% { transform: translateY(100vh) translateX(var(--sway, 0)); }
                }
                .snow-particle {
                    position: absolute;
                    background: white;
                    border-radius: 50%;
                    animation: snow-fall linear infinite;
                }
            `;
            document.head.appendChild(style);
        }
        
        for (let i = 0; i < 60; i++) {
            const flake = document.createElement('div');
            flake.className = 'snow-particle';
            const size = Math.random() * 12 + 5;
            flake.style.width = flake.style.height = size + 'px';
            flake.style.left = Math.random() * 100 + 'vw';
            flake.style.opacity = Math.random() * 0.6 + 0.3;
            flake.style.setProperty('--sway', (Math.random() - 0.5) * 100 + 'px');
            flake.style.animationDuration = (Math.random() * 15 + 8) + 's';
            flake.style.animationDelay = -Math.random() * 15 + 's';
            c.appendChild(flake);
        }
    },
    
    /**
     * Weather-triggered snow (separate from winter theme)
     */
    weatherSnow(active) {
        // Use same snow effect but only if not winter theme
        if (State.runtime.currentTheme === 'winter') return;
        this.snow(active);
    },
    
    /**
     * Fire effect
     */
    fire(active) {
        const c = document.getElementById('fire-effect');
        if (!c) return;
        if (!active) { c.innerHTML = ''; return; }
        
        c.innerHTML = '';
        
        // Add fire animation
        if (!document.getElementById('fire-anim-style')) {
            const style = document.createElement('style');
            style.id = 'fire-anim-style';
            style.innerHTML = `
                @keyframes fire-rise {
                    0% { transform: translateY(0) translateX(0) scale(1); opacity: 1; }
                    100% { transform: translateY(-100vh) translateX(var(--sway)) scale(0); opacity: 0; }
                }
                .fire-particle {
                    position: absolute;
                    bottom: -20px;
                    border-radius: 50%;
                    background: radial-gradient(circle, #ff6b35, #f7931e, #ffcc02);
                    animation: fire-rise ease-out infinite;
                    filter: blur(1px);
                }
            `;
            document.head.appendChild(style);
        }
        
        for (let i = 0; i < 50; i++) {
            const p = document.createElement('div');
            p.className = 'fire-particle';
            const size = Math.random() * 3 + 2;
            p.style.width = p.style.height = size + 'em';
            p.style.left = (10 + Math.random() * 80) + '%';
            p.style.setProperty('--sway', (Math.random() - 0.5) * 30 + 'px');
            p.style.animationDuration = (Math.random() * 1.5 + 0.5) + 's';
            p.style.animationDelay = Math.random() + 's';
            c.appendChild(p);
        }
    },
    
    /**
     * Bubble effect for submarine theme
     */
    bubbles(active) {
        const c = document.getElementById('bubble-effect');
        if (!c) return;
        if (!active) { c.innerHTML = ''; return; }
        
        c.innerHTML = '';
        
        if (!document.getElementById('bubble-anim-style')) {
            const style = document.createElement('style');
            style.id = 'bubble-anim-style';
            style.innerHTML = `
                @keyframes bubble-rise {
                    0% { transform: translateY(0) translateX(0); opacity: 0.7; }
                    100% { transform: translateY(-100vh) translateX(var(--sway)); opacity: 0; }
                }
                .bubble-particle {
                    position: absolute;
                    bottom: -50px;
                    border-radius: 50%;
                    background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(100,200,255,0.3));
                    border: 1px solid rgba(255,255,255,0.5);
                    animation: bubble-rise ease-in-out infinite;
                }
            `;
            document.head.appendChild(style);
        }
        
        for (let i = 0; i < 25; i++) {
            const b = document.createElement('div');
            b.className = 'bubble-particle';
            const size = Math.random() * 30 + 10;
            b.style.width = b.style.height = size + 'px';
            b.style.left = Math.random() * 100 + '%';
            b.style.setProperty('--sway', (Math.random() - 0.5) * 50 + 'px');
            b.style.animationDuration = (Math.random() * 10 + 10) + 's';
            b.style.animationDelay = -Math.random() * 15 + 's';
            c.appendChild(b);
        }
    },
    
    /**
     * Space effect - stars, shooting stars, planets
     */
    space(active) {
        const c = document.getElementById('space-effect');
        if (!c) return;
        if (!active) { c.innerHTML = ''; return; }
        
        c.innerHTML = '';
        
        // Stars
        for (let i = 0; i < 100; i++) {
            const star = document.createElement('div');
            const size = Math.random() * 3 + 1;
            star.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: white;
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: twinkle ${Math.random() * 3 + 2}s ease-in-out infinite;
                animation-delay: ${-Math.random() * 5}s;
            `;
            c.appendChild(star);
        }
        
        // Add twinkle animation
        if (!document.getElementById('space-anim-style')) {
            const style = document.createElement('style');
            style.id = 'space-anim-style';
            style.innerHTML = `
                @keyframes twinkle {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 1; }
                }
                @keyframes shoot {
                    0% { transform: translate(0, 0) rotate(-45deg); opacity: 0; }
                    10% { opacity: 1; }
                    100% { transform: translate(-300px, 300px) rotate(-45deg); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Shooting stars
        const shootingStar = () => {
            if (State.runtime.currentTheme !== 'space') return;
            
            const star = document.createElement('div');
            star.innerHTML = '🌠';
            star.style.cssText = `
                position: absolute;
                font-size: 1.5rem;
                top: ${Math.random() * 40}%;
                left: ${Math.random() * 80 + 10}%;
                animation: shoot ${Math.random() * 1 + 1}s ease-out forwards;
            `;
            c.appendChild(star);
            setTimeout(() => star.remove(), 2000);
            
            const timeout = setTimeout(shootingStar, Math.random() * 5000 + 3000);
            this.timeouts.push(timeout);
        };
        
        const t = setTimeout(shootingStar, 2000);
        this.timeouts.push(t);
    },
    
    /**
     * Plymouth (night sky) effect
     */
    plymouth(active) {
        const c = document.getElementById('plymouth-effect');
        if (!c) return;
        if (!active) { c.innerHTML = ''; return; }
        
        c.innerHTML = '';
        
        // Stars
        for (let i = 0; i < 60; i++) {
            const star = document.createElement('div');
            const size = Math.random() * 3 + 1;
            star.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: white;
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: twinkle ${Math.random() * 4 + 2}s ease-in-out infinite;
            `;
            c.appendChild(star);
        }
    },
    
    /**
     * Ball pit effect - bouncing balls
     */
    ballpit(active) {
        const c = document.getElementById('ballpit-effect');
        if (!c) return;
        if (!active) { c.innerHTML = ''; return; }
        
        c.innerHTML = '';
        const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];
        
        for (let i = 0; i < 30; i++) {
            const ball = document.createElement('div');
            const size = Math.random() * 40 + 20;
            const color = colors[Math.floor(Math.random() * colors.length)];
            ball.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: radial-gradient(circle at 30% 30%, ${color}, ${color}dd);
                border-radius: 50%;
                left: ${Math.random() * 90}%;
                top: ${Math.random() * 90}%;
                box-shadow: inset -5px -5px 15px rgba(0,0,0,0.2), 2px 2px 5px rgba(0,0,0,0.2);
            `;
            c.appendChild(ball);
        }
    },
    
    /**
     * Woodland effect - falling leaves
     */
    woodland(active) {
        const c = document.getElementById('woodland-effect');
        if (!c) return;
        if (!active) { c.innerHTML = ''; return; }
        
        c.innerHTML = '';
        const leaves = ['🍂', '🍁', '🌿', '🍃'];
        
        if (!document.getElementById('leaf-anim-style')) {
            const style = document.createElement('style');
            style.id = 'leaf-anim-style';
            style.innerHTML = `
                @keyframes leaf-fall {
                    0% { transform: translateY(-20px) rotate(0deg); }
                    100% { transform: translateY(100vh) rotate(720deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        for (let i = 0; i < 20; i++) {
            const leaf = document.createElement('div');
            leaf.textContent = leaves[Math.floor(Math.random() * leaves.length)];
            leaf.style.cssText = `
                position: absolute;
                font-size: ${Math.random() * 1.5 + 1}rem;
                left: ${Math.random() * 100}%;
                top: -30px;
                animation: leaf-fall ${Math.random() * 10 + 10}s linear infinite;
                animation-delay: ${-Math.random() * 15}s;
            `;
            c.appendChild(leaf);
        }
    },
    
    /**
     * Flight effect - simplified cockpit
     */
    flight(active) {
        const c = document.getElementById('flight-effect');
        if (!c) return;
        if (!active) { c.innerHTML = ''; return; }
        
        c.innerHTML = '<div style="position:absolute;bottom:0;left:0;right:0;height:30%;background:linear-gradient(to top, #228B22 0%, #32CD32 50%, #87CEEB 100%);"></div>';
    },
    
    /**
     * Ocean effect - waves
     */
    ocean(active) {
        const c = document.getElementById('ocean-effect');
        if (!c) return;
        if (!active) { c.innerHTML = ''; return; }
        
        c.innerHTML = '';
        c.style.background = 'linear-gradient(180deg, #0077be 0%, #00a6ed 50%, #48cae4 100%)';
    }
};


// ============================================================================
// COMMUNITY GOAL - Progress Tracking
// ============================================================================
/**
 * Tracks community vote milestones
 */
const CommunityGoal = {
    MILESTONE: 50000,
    KIDS_MILESTONE: 5000,
    
    getMilestone() {
        return State.data.settings.kidsMode ? this.KIDS_MILESTONE : this.MILESTONE;
    },
    
    update(totalVotes) {
        const bar = document.getElementById('communityGoalBar');
        const text = document.getElementById('communityGoalText');
        if (!bar || !text) return;
        
        const milestone = this.getMilestone();
        const currentMilestone = Math.floor(totalVotes / milestone) * milestone + milestone;
        const prevMilestone = currentMilestone - milestone;
        const progress = ((totalVotes - prevMilestone) / milestone) * 100;
        
        bar.style.width = Math.min(progress, 100) + '%';
        
        const fmt = n => n >= 1000000 ? (n/1000000).toFixed(1) + 'M' : n >= 1000 ? Math.round(n/1000) + 'k' : n;
        text.textContent = `🏆 Community Goal: ${fmt(currentMilestone)} votes`;
    }
};


// ============================================================================
// EXPORTS
// ============================================================================
window.SoundManager = SoundManager;
window.TiltManager = TiltManager;
window.Physics = Physics;
window.MosquitoManager = MosquitoManager;
window.ThemeManager = ThemeManager;
window.Effects = Effects;
window.CommunityGoal = CommunityGoal;

console.log('%c[Effects] Loaded', 'color: #ec4899');

})();
