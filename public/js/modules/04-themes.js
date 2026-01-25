/**
 * ============================================================================
 * GOOD WORD / BAD WORD - THEMES MODULE (04-themes.js)
 * ============================================================================
 * 
 * Contains:
 * - ThemeManager: Theme switching, unlocking, CSS injection
 * - WeatherManager: Real weather integration
 * - SnowmanBuilder: Winter theme collectible
 * 
 * Dependencies: 01-core.js, 02-sound.js
 * ============================================================================
 */

(function() {
'use strict';

const ThemeManager = {
    wordMap: {},
    init() {
        const s = document.createElement("style");
        s.innerText = `@keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }`;
        s.innerHTML += `
            body.listening-mode { border: 4px solid #ef4444 !important; }
            body.listening-mode::after {
                content: '🎙️ LISTENING...'; position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
                background: #ef4444; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; z-index: 9999;
                animation: pulse 1s infinite;
            }
        `;
        s.innerHTML += `
            body.vote-good-mode { background: #22c55e !important; overflow: hidden; }
            body.vote-good-mode * { visibility: hidden; }
            body.vote-good-mode::after {
                content: '👍'; visibility: visible; position: fixed; top: 50%; left: 50%;
                transform: translate(-50%, -50%); font-size: 150px;
            }
            body.vote-bad-mode { background: #ef4444 !important; overflow: hidden; }
            body.vote-bad-mode * { visibility: hidden; }
            body.vote-bad-mode::after {
                content: '👎'; visibility: visible; position: fixed; top: 50%; left: 50%;
                transform: translate(-50%, -50%); font-size: 150px;
            }
        `;
        document.head.appendChild(s);
        const rs = document.createElement("style");
rs.innerHTML = `
.rain-drop {
        position: absolute;
        background: rgba(59, 130, 246, 0.9); /* <--- CHANGED HERE */
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
`;
    document.head.appendChild(rs);
        Object.entries(CONFIG.THEME_SECRETS).forEach(([k, v]) => {
            try {
                atob(v).split('|').forEach(w => this.wordMap[w] = k)
            } catch {}
        });
        if ((State.data.unlockedThemes.length + 1) >= 5) {
            State.unlockBadge('traveler');
        }
        this.populateChooser();
        let currentThemeToApply = State.data.currentTheme;
        if (State.data.settings.randomizeTheme && State.data.unlockedThemes.length > 0) {
            const available = ['default', ...State.data.unlockedThemes];
            currentThemeToApply = available[Math.floor(Math.random() * available.length)];
            this.apply(currentThemeToApply);
        } else {
            this.apply(State.data.currentTheme);
        }
        this.updateChooserButton(currentThemeToApply);
    },
    updateChooserButton(theme) {
        const name = theme === 'ballpit' ? 'Ball Pit' : theme.charAt(0).toUpperCase() + theme.slice(1);
        if (DOM.theme.chooserBtn) {
            DOM.theme.chooserBtn.innerHTML = `${name} ▼`;
        }
    },
    populateChooser() {
        const current = State.data.currentTheme || 'default';
        this.updateChooserButton(current);
    },
    showGallery() {
        const existing = document.getElementById('theme-gallery-popup');
        if (existing) { existing.remove(); return; }
        const themeInfo = {
            default: { icon: '🎨', name: 'Default', color: 'bg-gray-100' },
            rainbow: { icon: '🌈', name: 'Rainbow', color: 'bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400' },
            dark: { icon: '🌙', name: 'Dark', color: 'bg-gray-800', dark: true },
            banana: { icon: '🍌', name: 'Banana', color: 'bg-yellow-300' },
            winter: { icon: '❄️', name: 'Winter', color: 'bg-blue-100' },
            summer: { icon: '☀️', name: 'Summer', color: 'bg-orange-300' },
            halloween: { icon: '🎃', name: 'Halloween', color: 'bg-orange-600' },
            submarine: { icon: '🐠', name: 'Submarine', color: 'bg-cyan-600' },
            fire: { icon: '🔥', name: 'Fire', color: 'bg-red-500' },
            plymouth: { icon: '⚓', name: 'Plymouth', color: 'bg-blue-800', dark: true },
            ballpit: { icon: '🎾', name: 'Ballpit', color: 'bg-pink-400' },
            space: { icon: '🚀', name: 'Space', color: 'bg-indigo-900', dark: true },
            woodland: { icon: '🌲', name: 'Woodland', color: 'bg-green-700', dark: true },
            flight: { icon: '✈️', name: 'Flight', color: 'bg-sky-400' },
            ocean: { icon: '🌊', name: 'Ocean', color: 'bg-blue-500' }
        };
        const unlockedThemes = ['default', ...State.data.unlockedThemes];
        const allThemeKeys = Object.keys(themeInfo);
        const currentTheme = State.runtime.currentTheme || 'default';
        const popup = document.createElement('div');
        popup.id = 'theme-gallery-popup';
        popup.className = 'fixed inset-0 z-[9999] flex items-end justify-center';
        popup.innerHTML = `
            <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" onclick="document.getElementById('theme-gallery-popup').remove()"></div>
            <div class="relative bg-white rounded-t-3xl shadow-2xl p-4 pb-8 w-full max-w-md animate-slide-up">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-black text-gray-800">🎨 Themes <span class="text-sm font-normal text-gray-400">(${unlockedThemes.length}/${allThemeKeys.length})</span></h3>
                    <button onclick="document.getElementById('theme-gallery-popup').remove()" class="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                </div>
                <div class="grid grid-cols-3 gap-3" id="theme-grid"></div>
                <p class="text-xs text-gray-400 mt-4 text-center">Vote on secret words to unlock themes!</p>
            </div>
        `;
        document.body.appendChild(popup);
        const grid = document.getElementById('theme-grid');
        allThemeKeys.forEach(key => {
            const info = themeInfo[key];
            const unlocked = unlockedThemes.includes(key);
            const isActive = currentTheme === key;
            const tile = document.createElement('div');
            if (unlocked) {
                tile.className = `theme-tile p-3 rounded-xl ${info.color} ${isActive ? 'ring-3 ring-indigo-500 ring-offset-2' : ''} hover:scale-105 transition-all cursor-pointer flex flex-col items-center justify-center aspect-square shadow-md`;
                tile.innerHTML = `
                    <span class="text-3xl mb-1">${info.icon}</span>
                    <span class="text-xs font-bold ${info.dark ? 'text-white' : 'text-gray-700'}">${info.name}</span>
                `;
                tile.onclick = () => {
                    ThemeManager.apply(key, true);
                    ThemeManager.populateChooser(); // Update button text
                    document.querySelectorAll('.theme-tile').forEach(t => t.classList.remove('ring-3', 'ring-indigo-500', 'ring-offset-2'));
                    tile.classList.add('ring-3', 'ring-indigo-500', 'ring-offset-2');
                    setTimeout(() => document.getElementById('theme-gallery-popup')?.remove(), 300);
                };
            } else {
                tile.className = 'p-3 rounded-xl bg-gray-200 flex flex-col items-center justify-center aspect-square opacity-60';
                tile.innerHTML = `
                    <span class="text-2xl mb-1">🔒</span>
                    <span class="text-xs font-bold text-gray-400">???</span>
                `;
            }
            grid.appendChild(tile);
        });
        if (!document.getElementById('gallery-animation-style')) {
            const style = document.createElement('style');
            style.id = 'gallery-animation-style';
            style.textContent = `
                @keyframes slide-up {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
            `;
            document.head.appendChild(style);
        }
    },
    apply(t, m = false) {
        State.runtime.currentTheme = t;
        if (m !== 'temp') {
            State.save('currentTheme', t);
            if (m === true) State.save('manualTheme', true);
        }
        document.body.className = document.body.className.split(' ').filter(c => !c.startsWith('theme-')).join(' ');
        document.body.classList.add(`theme-${t}`);
        if (t === 'banana') {
            if (!document.getElementById('banana-style')) {
                const s = document.createElement('style');
                s.id = 'banana-style';
                s.innerHTML = `
                    body.theme-banana {
                        background: linear-gradient(160deg, #ffe135 0%, #ffec4d 30%, #fff59d 50%, #ffeb3b 70%, #fdd835 100%) !important;
                        background-attachment: fixed !important;
                        position: relative;
                    }
                    body.theme-banana::before {
                        content: '';
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background-image:
                            /* Large bruise spots */
                            radial-gradient(ellipse 120px 50px at 8% 15%, rgba(101, 67, 33, 0.35) 0%, rgba(101, 67, 33, 0.15) 40%, transparent 70%),
                            radial-gradient(ellipse 90px 40px at 85% 25%, rgba(92, 64, 51, 0.3) 0%, rgba(92, 64, 51, 0.1) 50%, transparent 75%),
                            radial-gradient(ellipse 140px 55px at 20% 75%, rgba(110, 70, 30, 0.32) 0%, rgba(110, 70, 30, 0.12) 45%, transparent 70%),
                            radial-gradient(ellipse 100px 45px at 75% 80%, rgba(95, 60, 40, 0.28) 0%, rgba(95, 60, 40, 0.1) 50%, transparent 75%),
                            radial-gradient(ellipse 80px 35px at 50% 45%, rgba(100, 65, 35, 0.25) 0%, rgba(100, 65, 35, 0.08) 55%, transparent 80%),
                            radial-gradient(ellipse 110px 48px at 35% 30%, rgba(105, 68, 38, 0.22) 0%, transparent 65%),
                            radial-gradient(ellipse 70px 30px at 65% 55%, rgba(98, 62, 42, 0.2) 0%, transparent 70%),
                            /* Medium spots */
                            radial-gradient(circle 25px at 12% 40%, rgba(80, 50, 30, 0.4) 0%, transparent 100%),
                            radial-gradient(circle 18px at 78% 12%, rgba(85, 55, 35, 0.35) 0%, transparent 100%),
                            radial-gradient(circle 22px at 42% 88%, rgba(90, 58, 32, 0.38) 0%, transparent 100%),
                            radial-gradient(circle 20px at 92% 60%, rgba(82, 52, 28, 0.32) 0%, transparent 100%),
                            radial-gradient(circle 15px at 28% 52%, rgba(88, 56, 34, 0.3) 0%, transparent 100%),
                            /* Small freckles */
                            radial-gradient(circle 8px at 15% 65%, rgba(70, 45, 25, 0.5) 0%, transparent 100%),
                            radial-gradient(circle 6px at 55% 22%, rgba(75, 48, 28, 0.45) 0%, transparent 100%),
                            radial-gradient(circle 10px at 82% 42%, rgba(72, 46, 26, 0.42) 0%, transparent 100%),
                            radial-gradient(circle 7px at 38% 68%, rgba(78, 50, 30, 0.48) 0%, transparent 100%),
                            radial-gradient(circle 5px at 68% 78%, rgba(74, 47, 27, 0.4) 0%, transparent 100%),
                            radial-gradient(circle 9px at 25% 18%, rgba(76, 49, 29, 0.38) 0%, transparent 100%);
                        background-size: 100% 100%;
                        pointer-events: none;
                        z-index: 0;
                    }
                    body.theme-banana .card,
                    body.theme-banana .bg-white {
                        background: rgba(255, 250, 220, 0.92) !important;
                        border-color: rgba(180, 130, 50, 0.25) !important;
                    }
                    body.theme-banana #wordDisplay {
                        color: #4a3520 !important;
                        text-shadow:
                            2px 2px 4px rgba(139, 90, 43, 0.15),
                            -1px -1px 2px rgba(255, 255, 255, 0.3),
                            0 0 8px rgba(101, 67, 33, 0.1);
                        background: linear-gradient(180deg, rgba(101, 67, 33, 0.08) 0%, transparent 50%, rgba(101, 67, 33, 0.05) 100%);
                        background-clip: text;
                        -webkit-background-clip: text;
                    }
                    body.theme-banana .bg-indigo-600,
                    body.theme-banana .bg-indigo-500 {
                        background: linear-gradient(135deg, #e6a800, #f5c400) !important;
                    }
                    body.theme-banana .text-indigo-600 {
                        color: #b8860b !important;
                    }
                `;
                document.head.appendChild(s);
            }
        } else {
            const old = document.getElementById('banana-style');
            if (old) old.remove();
        }
        if (t === 'woodland') {
            if (!document.getElementById('woodland-theme-style')) {
                const s = document.createElement('style');
                s.id = 'woodland-theme-style';
                s.innerHTML = `
                    body.theme-woodland {
                        background: transparent !important;
                    }
                    body.theme-woodland .card,
                    body.theme-woodland .bg-white {
                        background: rgba(255, 253, 245, 0.92) !important;
                        border-color: #8b7355 !important;
                    }
                    body.theme-woodland #wordDisplay {
                        color: #3d2914 !important;
                        text-shadow: 1px 1px 0px rgba(255,255,255,0.5);
                    }
                    body.theme-woodland .bg-indigo-600,
                    body.theme-woodland .bg-indigo-500 {
                        background-color: #5d7a4a !important;
                    }
                    body.theme-woodland .bg-indigo-600:hover,
                    body.theme-woodland .bg-indigo-500:hover {
                        background-color: #4a6339 !important;
                    }
                    body.theme-woodland .text-indigo-600,
                    body.theme-woodland .text-indigo-700 {
                        color: #5d7a4a !important;
                    }
                    body.theme-woodland .bg-indigo-100,
                    body.theme-woodland .bg-indigo-50 {
                        background-color: rgba(93, 122, 74, 0.15) !important;
                    }
                    body.theme-woodland .border-indigo-100,
                    body.theme-woodland .border-indigo-200 {
                        border-color: rgba(93, 122, 74, 0.3) !important;
                    }
                    body.theme-woodland .text-green-600 {
                        color: #4a7c3f !important;
                    }
                    body.theme-woodland .text-red-600 {
                        color: #8b4513 !important;
                    }
                    body.theme-woodland header {
                        position: relative;
                        z-index: 20;
                    }
                `;
                document.head.appendChild(s);
            }
        } else {
            const old = document.getElementById('woodland-theme-style');
            if (old) old.remove();
        }
        if (t === 'ocean') {
            if (!document.getElementById('ocean-theme-style')) {
                const s = document.createElement('style');
                s.id = 'ocean-theme-style';
                s.innerHTML = `
                    body.theme-ocean {
                        background: transparent !important;
                    }
                    body.theme-ocean .card,
                    body.theme-ocean .bg-white {
                        background: rgba(255, 255, 255, 0.75) !important;
                        backdrop-filter: blur(8px);
                        -webkit-backdrop-filter: blur(8px);
                    }
                    body.theme-ocean #wordDisplay {
                        color: #1a4a6e !important;
                        text-shadow: 1px 1px 0px rgba(255,255,255,0.5);
                    }
                    body.theme-ocean .bg-indigo-600,
                    body.theme-ocean .bg-indigo-500 {
                        background: linear-gradient(135deg, #2a6a9a, #1a5080) !important;
                    }
                    body.theme-ocean .text-indigo-600 {
                        color: #1a5080 !important;
                    }
                `;
                document.head.appendChild(s);
            }
        } else {
            const old = document.getElementById('ocean-theme-style');
            if (old) old.remove();
        }
        if (t === 'flight') {
            if (!document.getElementById('flight-theme-style')) {
                const s = document.createElement('style');
                s.id = 'flight-theme-style';
                s.innerHTML = `
                    body.theme-flight {
                        background: transparent !important;
                    }
                    body.theme-flight .card,
                    body.theme-flight .bg-white {
                        background: rgba(255, 255, 255, 0.7) !important;
                        backdrop-filter: blur(8px);
                        -webkit-backdrop-filter: blur(8px);
                    }
                    body.theme-flight #wordDisplay {
                        color: #1a3a5c !important;
                        text-shadow: 1px 1px 0px rgba(255,255,255,0.5);
                    }
                    body.theme-flight .bg-indigo-600,
                    body.theme-flight .bg-indigo-500 {
                        background: linear-gradient(135deg, #4a90c2, #2a6090) !important;
                    }
                    body.theme-flight .text-indigo-600 {
                        color: #2a6090 !important;
                    }
                `;
                document.head.appendChild(s);
            }
        } else {
            const old = document.getElementById('flight-theme-style');
            if (old) old.remove();
        }
        const e = DOM.theme.effects;
        e.snow.classList.toggle('hidden', t !== 'winter');
        e.bubble.classList.toggle('hidden', t !== 'submarine');
        e.fire.classList.toggle('hidden', t !== 'fire');
        e.summer.classList.toggle('hidden', t !== 'summer');
        e.plymouth.classList.toggle('hidden', t !== 'plymouth');
        e.ballpit.classList.toggle('hidden', t !== 'ballpit');
        e.space.classList.toggle('hidden', t !== 'space');
        e.woodland.classList.toggle('hidden', t !== 'woodland');
        if (e.flight) e.flight.classList.toggle('hidden', t !== 'flight');
        if (e.ocean) e.ocean.classList.toggle('hidden', t !== 'ocean');
        if (t === 'winter') {
            Effects.snow();
            SnowmanBuilder.init();
            SnowmanBuilder.render();
        } else {
            e.snow.innerHTML = '';
            const sb = document.getElementById('snowman-builder');
            if (sb) sb.style.opacity = '0';
        }
        if (t === 'submarine') Effects.bubbles(true);
        else Effects.bubbles(false);
        if (t === 'fire') Effects.fire();
        else e.fire.innerHTML = '';
        if (t === 'summer') Effects.summer();
        else e.summer.innerHTML = '';
        if (t === 'plymouth') Effects.plymouth(true);
        else {
            e.plymouth.innerHTML = '';
            Effects.plymouth(false)
        }
        if (t === 'ballpit') Effects.ballpit(true);
        else Effects.ballpit(false);
        if (t === 'space') Effects.space(true);
        else Effects.space(false);
        if (t === 'woodland') Effects.woodland(true);
        else Effects.woodland(false);
        if (t === 'flight') Effects.flight(true);
        else Effects.flight(false);
        if (t === 'ocean') Effects.ocean(true);
        else Effects.ocean(false);
        Effects.halloween(t === 'halloween');
        if (t !== 'halloween') MosquitoManager.remove();
        const cards = document.querySelectorAll('.card, .ranking-card'),
            isR = t === 'rainbow';
        [DOM.game.card, ...cards].forEach(el => {
            if (!el) return;
            if (isR) {
                el.classList.add('thin-rainbow-frame');
                el.classList.remove('card')
            } else {
                el.classList.remove('thin-rainbow-frame');
                el.classList.add('card')
            }
        });
        const d = document.getElementById('card-snow-drift');
        if (d) d.style.display = t !== 'winter' ? 'none' : 'block';
        if (State.runtime.allWords.length > 0) UIManager.displayWord(State.runtime.allWords[State.runtime.currentWordIndex]);
        Accessibility.apply();
        TiltManager.refresh();
        if (typeof WeatherManager !== 'undefined') WeatherManager.updateVisuals();
    },
checkUnlock(w) {
        const t = this.wordMap[w];
        if (t && !State.data.unlockedThemes.includes(t)) {
            State.data.unlockedThemes.push(t);
            State.save('unlockedThemes', State.data.unlockedThemes);
            if ((State.data.unlockedThemes.length + 1) >= 5) {
                State.unlockBadge('traveler');
            }
            this.populateChooser();
            if (!State.data.manualTheme) this.apply(t);
            const cleanTheme = t === 'ballpit' ? 'Ball Pit' : t.charAt(0).toUpperCase() + t.slice(1);
            if (window.StreakManager) StreakManager.showNotification(`🎨 Theme Unlocked: ${cleanTheme}`, 'success');
            return true
        }
        return false
    }
};
const WeatherManager = {
    ALLOWED_THEMES: ['default', 'ballpit', 'banana', 'dark', 'fire', 'halloween', 'plymouth', 'rainbow', 'summer', 'woodland'],
    RAIN_CODES: [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99],
    SNOW_CODES: [71, 73, 75, 77, 85, 86],
    isRaining: false,
    isSnowing: false,
    hasChecked: false,
    init() {
        if (State.data.settings.enableWeather) this.checkWeather();
    },
    toggle(active) {
        State.data.settings.enableWeather = active;
        State.save('settings', State.data.settings);
        if (active) {
            this.checkWeather();
        } else {
            this.isRaining = false;
            this.isSnowing = false;
            this.updateVisuals();
        }
    },
    checkWeather() {
        if (!navigator.geolocation) return;
        UIManager.showPostVoteMessage("Checking local weather... ☁️");
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const lat = pos.coords.latitude;
                    const lon = pos.coords.longitude;
                    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
                    const response = await fetch(url);
                    const data = await response.json();
                    const code = data.current_weather.weathercode;
                    this.isRaining = this.RAIN_CODES.includes(code);
                    this.isSnowing = this.SNOW_CODES.includes(code);
                    this.hasChecked = true;
                    if (this.isSnowing) UIManager.showPostVoteMessage("It's snowing! ❄️");
                    else if (this.isRaining) UIManager.showPostVoteMessage("It's raining! 🌧️");
                    else UIManager.showPostVoteMessage("Weather is clear. ☀️");
                    this.updateVisuals();
                } catch (e) { console.error("Weather fetch failed", e); }
            },
            (err) => {
                UIManager.showPostVoteMessage("Location denied 🚫");
                const toggle = document.getElementById('toggleWeather');
                if (toggle) toggle.checked = false;
                State.data.settings.enableWeather = false;
                State.save('settings', State.data.settings);
            }
        );
    },
    updateVisuals() {
        const t = State.runtime.currentTheme;
        Effects.rain(false);
        if (t === 'winter') {
            const s = document.getElementById('snow-effect');
            if (s) s.style.display = '';
            return;
        }
        Effects.weatherSnow(false);
        const isAllowedTheme = this.ALLOWED_THEMES.includes(t);
        const enabled = State.data.settings.enableWeather;
        if (enabled && isAllowedTheme) {
            if (this.isSnowing) {
                Effects.weatherSnow(true);
            } else if (this.isRaining) {
                Effects.rain(true);
            }
        }
    }
};
const CommunityGoal = {
    MILESTONE: 50000, // 50k increments for adults
    KIDS_MILESTONE: 5000, // 5k increments for kids (1/10th)
    getMilestone() {
        return State.data.settings.kidsMode ? this.KIDS_MILESTONE : this.MILESTONE;
    },
    update(totalVotes) {
        const bar = DOM.header.communityGoalBar;
        const text = DOM.header.communityGoalText;
        if (!bar || !text) return;
        const milestone = this.getMilestone();
        const currentMilestone = Math.floor(totalVotes / milestone) * milestone + milestone;
        const prevMilestone = currentMilestone - milestone;
        const progress = ((totalVotes - prevMilestone) / milestone) * 100;
        const remaining = currentMilestone - totalVotes;
        bar.style.width = Math.min(progress, 100) + '%';
        const fmt = n => n >= 1000000 ? (n/1000000).toFixed(1) + 'M' : n >= 1000 ? Math.round(n/1000) + 'k' : n;
        if (progress >= 95) {
            text.textContent = `🏆 Almost there! ${fmt(remaining)} to ${fmt(currentMilestone)}!`;
            bar.style.animation = 'pulse 1s infinite';
        } else {
            text.textContent = `🏆 Community Goal: ${fmt(currentMilestone)} votes`;
            bar.style.animation = '';
        }
    }
};
const SnowmanBuilder = {
    TOTAL_PARTS: 100, // 100 snowmen collected = 1 complete snowman
    container: null,
    init() {
        const logoArea = document.getElementById('logoArea');
        if (!logoArea || this.container) return;
        if (!document.getElementById('snowman-logo-style')) {
            const style = document.createElement('style');
            style.id = 'snowman-logo-style';
            style.textContent = `
                #logoArea.has-snowman #logoText { transform: translateX(-20px); transition: transform 0.3s ease; }
                #logoArea.has-snowdog #logoText { transform: translateX(-45px); transition: transform 0.3s ease; }
            `;
            document.head.appendChild(style);
        }
        this.container = document.createElement('div');
        this.container.id = 'snowman-builder';
        this.container.style.cssText = `
            position: absolute;
            right: 4px;
            top: 50%;
            transform: translateY(-50%);
            height: 100%;
            width: 60px;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            align-items: center;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.5s ease, width 0.3s ease;
        `;
        logoArea.appendChild(this.container);
        this.render();
    },
    collect() {
        const count = State.data.snowmanCollected + 1;
        State.save('snowmanCollected', count);
        this.render();
        if (count === this.TOTAL_PARTS) {
            UIManager.showPostVoteMessage("⛄ Snowman complete! Keep going...");
        } else if (count === 101) {
            UIManager.showPostVoteMessage("🐕 A snow dawg appears!");
        } else if (count === 150) {
            UIManager.showPostVoteMessage("🐕 Snow Dawg complete! Good boi!");
        } else if (count <= this.TOTAL_PARTS && count % 25 === 0) {
            UIManager.showPostVoteMessage(`⛄ Snowman ${count}% built!`);
        }
    },
    render() {
        if (!this.container) this.init();
        if (!this.container) return;
        const count = State.data.snowmanCollected || 0;
        const progress = Math.min(count / this.TOTAL_PARTS, 1);
        const logoArea = document.getElementById('logoArea');
        if (count === 0) {
            this.container.style.opacity = '0';
            if (logoArea) logoArea.classList.remove('has-snowman', 'has-snowdog');
            return;
        }
        this.container.style.opacity = '1';
        if (logoArea) {
            logoArea.classList.remove('has-snowman', 'has-snowdog');
            if (count > 100) {
                logoArea.classList.add('has-snowdog');
            } else if (count > 0) {
                logoArea.classList.add('has-snowman');
            }
        }
        this.container.style.width = count > 100 ? '115px' : '65px';
        this.container.style.flexDirection = count > 100 ? 'row' : 'column';
        this.container.style.alignItems = 'flex-end';
        this.container.style.gap = '6px';
        let html = '';
        if (count > 100) {
            const dogProg = Math.min((count - 100) / 50, 1);
            html += '<div style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;margin-left:-5px;">';
            html += '<div style="position:relative;width:44px;height:42px;">';
            if (dogProg > 0) {
                const w = Math.round(30 * Math.min(dogProg / 0.3, 1));
                const h = Math.round(18 * Math.min(dogProg / 0.3, 1));
                html += `<div style="position:absolute;bottom:6px;left:50%;transform:translateX(-50%);width:${w}px;height:${h}px;background:radial-gradient(ellipse at 30% 30%, #fff, #d0d0d0);border-radius:50%;box-shadow:inset -2px -2px 4px rgba(0,0,0,0.1);z-index:1;"></div>`;
            }
            if (dogProg > 0.3) {
                const s = Math.round(15 * Math.min((dogProg - 0.3) / 0.25, 1));
                const hasFace = dogProg > 0.75;
                const hasEars = dogProg > 0.75;
                html += `<div style="position:absolute;bottom:12px;right:0px;width:${s}px;height:${s}px;background:radial-gradient(circle at 30% 30%, #fff, #d0d0d0);border-radius:50%;z-index:2;box-shadow:inset -1px -1px 3px rgba(0,0,0,0.1);">
                    ${hasFace ? `<div style="position:absolute;top:28%;left:20%;width:2px;height:2px;background:#1a1a1a;border-radius:50%;"></div><div style="position:absolute;top:28%;right:25%;width:2px;height:2px;background:#1a1a1a;border-radius:50%;"></div><div style="position:absolute;top:52%;left:50%;transform:translateX(-50%);width:3px;height:2px;background:#222;border-radius:50%;"></div>` : ''}
                    ${hasEars ? `<div style="position:absolute;top:-5px;left:0px;width:5px;height:7px;background:linear-gradient(180deg, #bbb, #ddd);border-radius:50% 50% 40% 40%;border:1px solid rgba(0,0,0,0.2);"></div><div style="position:absolute;top:-5px;right:0px;width:5px;height:7px;background:linear-gradient(180deg, #bbb, #ddd);border-radius:50% 50% 40% 40%;border:1px solid rgba(0,0,0,0.2);"></div>` : ''}
                </div>`;
            }
            if (dogProg > 0.55) {
                const lh = Math.round(8 * Math.min((dogProg - 0.55) / 0.2, 1));
                html += `<div style="position:absolute;bottom:0;right:10px;width:2px;height:${lh}px;background:#2a2a2a;border-radius:1px;"></div>`;
                html += `<div style="position:absolute;bottom:0;right:16px;width:2px;height:${lh}px;background:#2a2a2a;border-radius:1px;"></div>`;
                html += `<div style="position:absolute;bottom:0;left:10px;width:2px;height:${lh}px;background:#2a2a2a;border-radius:1px;"></div>`;
                html += `<div style="position:absolute;bottom:0;left:16px;width:2px;height:${lh}px;background:#2a2a2a;border-radius:1px;"></div>`;
            }
            if (dogProg > 0.8) html += `<div style="position:absolute;bottom:12px;left:2px;width:6px;height:8px;background:linear-gradient(to top, #d0d0d0, #e8e8e8);border-radius:40% 40% 50% 50%;transform:rotate(-20deg);box-shadow:inset -1px -1px 2px rgba(0,0,0,0.1);"></div>`;
            html += '</div></div>';
        }
        html += '<div style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;">';
        const bottomProgress = Math.min(progress / 0.33, 1);
        const middleProgress = progress > 0.33 ? Math.min((progress - 0.33) / 0.33, 1) : 0;
        const topProgress = progress > 0.66 ? Math.min((progress - 0.66) / 0.24, 1) : 0;
        const accessoryProgress = progress > 0.90 ? (progress - 0.90) / 0.10 : 0;
        if (accessoryProgress > 0.8) html += `<div style="font-size:16px;margin-bottom:-10px;">🎩</div>`;
        if (topProgress > 0) {
            const size = Math.round(26 * topProgress);
            const hasEyes = accessoryProgress > 0.2, hasNose = accessoryProgress > 0.5;
            html += `<div style="width:${size}px;height:${size}px;background:radial-gradient(circle at 30% 30%, #fff, #e8e8e8);border-radius:50%;box-shadow:inset -2px -2px 4px rgba(0,0,0,0.1);position:relative;margin-bottom:-4px;">
                ${hasEyes ? `<div style="position:absolute;top:32%;left:22%;width:3px;height:3px;background:#1a1a1a;border-radius:50%;"></div><div style="position:absolute;top:32%;right:22%;width:3px;height:3px;background:#1a1a1a;border-radius:50%;"></div>` : ''}
                ${hasNose ? `<div style="position:absolute;top:48%;left:50%;transform:translateX(-50%);border-left:3px solid transparent;border-right:3px solid transparent;border-top:10px solid #ff6b35;"></div>` : ''}
            </div>`;
        }
        if (middleProgress > 0) {
            const size = Math.round(36 * middleProgress);
            const hasArms = accessoryProgress > 0.4;
            const hasButtons = accessoryProgress > 0.3;
            html += `<div style="width:${size}px;height:${size}px;background:radial-gradient(circle at 30% 30%, #fff, #e8e8e8);border-radius:50%;box-shadow:inset -2px -2px 4px rgba(0,0,0,0.1);position:relative;margin-bottom:-5px;">
                ${hasButtons ? `<div style="position:absolute;top:25%;left:50%;transform:translateX(-50%);width:4px;height:4px;background:#1a1a1a;border-radius:50%;"></div><div style="position:absolute;top:50%;left:50%;transform:translateX(-50%);width:4px;height:4px;background:#1a1a1a;border-radius:50%;"></div><div style="position:absolute;top:75%;left:50%;transform:translateX(-50%);width:4px;height:4px;background:#1a1a1a;border-radius:50%;"></div>` : ''}
                ${hasArms ? `<div style="position:absolute;left:-16px;top:35%;width:18px;height:3px;background:linear-gradient(90deg, #3e2723, #5d4037);border-radius:2px;transform:rotate(-25deg);box-shadow:0 1px 1px rgba(0,0,0,0.2);"></div><div style="position:absolute;right:-16px;top:35%;width:18px;height:3px;background:linear-gradient(90deg, #5d4037, #3e2723);border-radius:2px;transform:rotate(25deg);box-shadow:0 1px 1px rgba(0,0,0,0.2);"></div>` : ''}
            </div>`;
        }
        if (bottomProgress > 0) {
            const size = Math.round(46 * bottomProgress);
            html += `<div style="width:${size}px;height:${size}px;background:radial-gradient(circle at 30% 30%, #fff, #e8e8e8);border-radius:50%;box-shadow:inset -3px -3px 5px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.15);"></div>`;
        }
        html += '</div>';
        let counterText;
        if (count <= 100) {
            counterText = `${count}/${this.TOTAL_PARTS}`;
        } else {
            counterText = `${count}/100`;
        }
        html += `<div style="position:absolute;bottom:-2px;right:2px;font-size:8px;color:#555;font-weight:bold;">${counterText}</div>`;
        this.container.innerHTML = html;
    },
    reset() {
        State.save('snowmanCollected', 0);
        this.render();
    }
};

// ============================================================================
// EXPORTS
// ============================================================================
window.ThemeManager = ThemeManager;
window.WeatherManager = WeatherManager;
window.SnowmanBuilder = SnowmanBuilder;
window.CommunityGoal = CommunityGoal;

console.log('%c[Themes] Module loaded', 'color: #8b5cf6; font-weight: bold');

})();
