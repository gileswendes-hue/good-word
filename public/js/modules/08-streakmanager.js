/**
 * ============================================================================
 * GOOD WORD / BAD WORD - STREAK & INIT MODULE (08-streakmanager.js)
 * ============================================================================
 * 
 * Contains:
 * - StreakManager: Vote streak tracking and UI
 * - Initialization code and event listeners
 * - Keyboard shortcuts
 * - Auto-start logic
 * 
 * Dependencies: All previous modules
 * ============================================================================
 */

(function() {
'use strict';

const StreakManager = {
    timer: null,
    loopTimer: null,
    LIMIT: 6500,
    extend(ms) {
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => this.endStreak(), this.LIMIT + ms);
    },
    handleSuccess() {
        if (State.data.settings.noStreaksMode) return;
        const now = Date.now();
        if (State.runtime.streak > 0 && (now - State.runtime.lastStreakTime) > this.LIMIT) {
            this.endStreak();
            State.runtime.streak = 1;
        } else {
            State.runtime.streak++;
        }
        State.runtime.lastStreakTime = now;
        const currentStreak = State.runtime.streak;
        if (currentStreak > State.data.longestStreak) {
            State.save('longestStreak', currentStreak);
            const el = document.getElementById('streak-display-value');
            if(el) el.textContent = currentStreak + " Words";
        }
        if (currentStreak >= 5) {
            if (currentStreak === 5) this.showNotification("🔥 STREAK STARTED!", "success");
            this.updateScreenCounter(true);
        } else {
             const counter = document.getElementById('streak-floating-counter');
             if(counter) counter.style.opacity = '0';
        }
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => this.endStreak(), this.LIMIT);
    },
    endStreak() {
        const current = State.runtime.streak;
        if (current > (parseInt(State.data.longestStreak) || 0)) {
            State.data.longestStreak = current;
            State.save('longestStreak', current);
        }
        if (this.timer) clearTimeout(this.timer);
        const finalScore = State.runtime.streak;
        if (finalScore >= 5) {
            this.showNotification(`Streak Ended: ${finalScore} Words`, "neutral");
            this.checkHighScore(finalScore);
        }
        const counter = document.getElementById('streak-floating-counter');
        if (counter) {
            counter.style.opacity = '0';
            setTimeout(() => counter.remove(), 300);
        }
        State.runtime.streak = 0;
    },
    updateScreenCounter(pulse) {
        let el = document.getElementById('streak-floating-counter');
        if (!el) {
            el = document.createElement('div');
            el.id = 'streak-floating-counter';
            el.style.cssText = `position: fixed; top: 15%; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #FF512F, #DD2476); color: white; padding: 10px 25px; border-radius: 50px; font-weight: 900; font-size: 1.8rem; z-index: 99999; box-shadow: 0 4px 15px rgba(0,0,0,0.3); pointer-events: none; transition: transform 0.1s, opacity 0.2s; opacity: 1; border: 2px solid white; text-shadow: 0 2px 4px rgba(0,0,0,0.2);`;
            document.body.appendChild(el);
        }
        el.style.opacity = '1';
        el.innerHTML = `<span>🔥</span> ${State.runtime.streak}`;
        if (pulse) {
            requestAnimationFrame(() => {
                el.style.transform = 'translateX(-50%) scale(1.3)';
                setTimeout(() => el.style.transform = 'translateX(-50%) scale(1)', 150);
            });
        }
    },
    showNotification(msg, type) {
        const notif = document.createElement('div');
        notif.textContent = msg;
        notif.style.cssText = `position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: ${type === 'success' ? '#10b981' : '#374151'}; color: white; padding: 10px 20px; border-radius: 8px; font-weight: bold; z-index: 99999; box-shadow: 0 4px 6px rgba(0,0,0,0.2); animation: fadeOut 2.5s forwards;`;
        if(!document.getElementById('notif-style')) {
            const s = document.createElement('style');
            s.id = 'notif-style';
            s.innerHTML = `@keyframes fadeOut { 0% {opacity:1;} 80% {opacity:1;} 100% {opacity:0;} }`;
            document.head.appendChild(s);
        }
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 2500);
    },
    checkHighScore(score) {
        if (!State.data.highScores) State.data.highScores = [];
        const scores = State.data.highScores;
        const minScore = scores.length < 8 ? 0 : scores[scores.length - 1].score;
        if (score > minScore || scores.length < 8) {
            setTimeout(() => this.promptName(score), 500);
        }
    },
    promptName(score) {
        if(document.getElementById('nameEntryModal')) return;
        const html = `
            <div id="nameEntryModal" style="position:fixed; inset:0; background:rgba(0,0,0,0.9); z-index:100000; display:flex; align-items:center; justify-content:center;">
                <div style="background:white; padding:2rem; border-radius:1rem; text-align:center; max-width:90%; width:300px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
                    <h2 style="color:#4f46e5; font-size:1.5rem; font-weight:900; margin-bottom:0.5rem; text-transform: uppercase;">New High Score!</h2>
                    <p style="color:#4b5563; font-size:1.25rem; font-weight:bold; margin-bottom:1.5rem;">Streak: ${score}</p>
                    <input type="text" id="hsNameInput" maxlength="3" placeholder="AAA"
                        style="font-size:2rem; text-align:center; width:100%; letter-spacing:0.2em; border:2px solid #e5e7eb; border-radius:0.5rem; padding:0.5rem; text-transform:uppercase; margin-bottom:1.5rem; font-weight:bold;">
                    <button id="hsSaveBtn" style="width:100%; padding:1rem; background:#4f46e5; color:white; border:none; border-radius:0.5rem; font-weight:bold; font-size:1rem; cursor:pointer; transition: background 0.2s;">SAVE SCORE</button>
                </div>
            </div>`;
        const div = document.createElement('div');
        div.innerHTML = html;
        document.body.appendChild(div.firstElementChild);
        const saveFn = async () => {
            const name = (document.getElementById('hsNameInput').value || "AAA").toUpperCase();
            const scores = State.data.highScores || [];
            scores.push({ name, score, date: Date.now() });
            scores.sort((a,b) => b.score - a.score);
            if(scores.length > 8) scores.pop();
            State.save('highScores', scores);
            API.submitHighScore(name, score);
            document.getElementById('nameEntryModal').remove();
            this.showLeaderboard();
        };
        document.getElementById('hsSaveBtn').onclick = saveFn;
    },
    async shareScores() {
        const scores = State.data.highScores || [];
        const best = scores.length ? scores[0].score : 0;
        const name = State.data.username || "I";
        const text = `${name} just hit a streak of ${best} on Good Word / Bad Word! 🏆 Can you beat the high scores?`;
        const url = window.location.origin;
        if (navigator.share) {
            try {
                await navigator.share({ title: 'High Scores', text: text, url: url });
            } catch(e) { }
        } else {
            try {
                await navigator.clipboard.writeText(`${text} ${url}`);
                UIManager.showPostVoteMessage("Score copied to clipboard! 📋");
            } catch(e) {
                UIManager.showPostVoteMessage("Could not share.");
            }
        }
    },
async showLeaderboard(startCabinetIndex = 0) {
        const self = this;
        const username = (typeof State !== 'undefined' && State.data.username) ? State.data.username : "PLAYER";
        const initialCabinetIndex = startCabinetIndex;

        // 1. Fetch all data concurrently (Fail-safe)
        let globalStreak = [], globalWar = [], globalDef = [], globalJump = [];
        try {
            [globalStreak, globalWar, globalDef, globalJump] = await Promise.all([
                API.getGlobalScores().catch(() => []),
                API.getMiniGameScores('wordwar').catch(() => []),
                API.getMiniGameScores('defdash').catch(() => []),
                API.getMiniGameScores('wordjump').catch(() => [])
            ]);
        } catch (e) { console.error("Score fetch error", e); }

        // 2. Inject HIGH-FIDELITY Arcade CSS
        if (!document.getElementById('arcade-styles-v6')) {
            const s = document.createElement('style');
            s.id = 'arcade-styles-v6';
            s.innerHTML = `
                @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&family=Black+Ops+One&display=swap');
                
                :root {
                    --cab-w: 420px; 
                    --cab-h: 780px;
                    --cab-gap: 50px;
                }
                @media (min-width: 768px) {
                    :root { --cab-w: 520px; --cab-h: 880px; }
                }

                /* === SCENE === */
                .arcade-modal {
                    position: fixed; inset: 0; z-index: 9999;
                    background: linear-gradient(180deg, #0d0d1a 0%, #000 100%);
                    display: flex; flex-direction: column; overflow: hidden;
                    perspective: 1200px;
                }
                .arcade-floor {
                    position: absolute; bottom: 0; left: -50%; right: -50%; height: 35vh;
                    background: 
                        linear-gradient(0deg, rgba(0,0,0,0.9), transparent 70%),
                        repeating-linear-gradient(90deg, rgba(80,60,120,0.15) 0px, transparent 1px, transparent 80px),
                        repeating-linear-gradient(0deg, rgba(80,60,120,0.1) 0px, transparent 1px, transparent 50px);
                    transform: rotateX(75deg);
                    transform-origin: center bottom;
                    pointer-events: none; z-index: 0;
                }
                .arcade-ceiling-glow {
                    position: absolute; top: -50px; left: 20%; right: 20%; height: 150px;
                    background: radial-gradient(ellipse at center, rgba(147,51,234,0.15) 0%, transparent 70%);
                    pointer-events: none; z-index: 0;
                }
                .arcade-header-overlay {
                    position: absolute; top: 0; left: 0; right: 0; height: 80px;
                    background: linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%);
                    z-index: 100; pointer-events: none;
                }

                /* === SLIDING ROW === */
                .cabinet-viewport {
                    flex: 1; display: flex; align-items: center;
                    width: 100%; z-index: 10;
                    touch-action: pan-x;
                }
                .cabinet-row {
                    display: flex; 
                    gap: var(--cab-gap);
                    transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
                    will-change: transform;
                    align-items: flex-end;
                    height: var(--cab-h);
                }

                /* === CABINET SHELL === */
                .arcade-cabinet {
                    width: var(--cab-w); 
                    height: var(--cab-h);
                    flex-shrink: 0;
                    position: relative;
                    border-radius: 12px 12px 6px 6px;
                    transition: transform 0.5s ease, opacity 0.5s ease, filter 0.5s ease;
                    display: flex; flex-direction: column;
                    transform-style: preserve-3d;
                }
                /* 3D Side panels */
                .arcade-cabinet::before {
                    content: ''; position: absolute; 
                    top: 0; bottom: 0; left: -8px; width: 8px;
                    background: linear-gradient(90deg, rgba(0,0,0,0.6), rgba(0,0,0,0.2));
                    transform: rotateY(-90deg);
                    transform-origin: right;
                    border-radius: 12px 0 0 6px;
                }
                .arcade-cabinet::after {
                    content: ''; position: absolute;
                    top: 0; bottom: 0; right: -8px; width: 8px;
                    background: linear-gradient(90deg, rgba(0,0,0,0.2), rgba(0,0,0,0.6));
                    transform: rotateY(90deg);
                    transform-origin: left;
                    border-radius: 0 12px 6px 0;
                }
                .cabinet-shadow {
                    position: absolute; inset: 0;
                    border-radius: 12px 12px 6px 6px;
                    box-shadow: 
                        inset 4px 0 12px rgba(255,255,255,0.08),
                        inset -4px 0 12px rgba(0,0,0,0.5),
                        0 40px 80px rgba(0,0,0,0.9),
                        0 10px 30px rgba(0,0,0,0.6);
                    pointer-events: none; z-index: 100;
                }
                .arcade-cabinet.active {
                    transform: scale(1.05) translateZ(40px);
                    z-index: 50; filter: brightness(1.1); opacity: 1;
                }
                .arcade-cabinet.inactive {
                    transform: scale(0.88) translateZ(-30px);
                    z-index: 1; filter: brightness(0.45) saturate(0.5); opacity: 0.7;
                    cursor: pointer;
                }

                /* === CABINET THEMES === */
                .theme-wood {
                    background: linear-gradient(180deg, #6d4c41 0%, #5d4037 30%, #4e342e 60%, #3e2723 100%);
                    background-image: 
                        repeating-linear-gradient(90deg, rgba(0,0,0,0.08) 0px, transparent 2px, transparent 25px),
                        repeating-linear-gradient(0deg, rgba(255,255,255,0.015) 0px, transparent 1px, transparent 6px);
                }
                .theme-wood .artwork-frame { 
                    background: linear-gradient(135deg, #8d6e63 0%, #5d4037 50%, #3e2723 100%);
                    border: 6px solid #a1887f;
                    box-shadow: inset 0 0 30px rgba(0,0,0,0.7), 0 4px 20px rgba(0,0,0,0.5);
                }
                .theme-wood .artwork-inner {
                    background: 
                        radial-gradient(ellipse at 30% 20%, rgba(255,200,100,0.4) 0%, transparent 50%),
                        radial-gradient(ellipse at 70% 80%, rgba(255,100,50,0.3) 0%, transparent 50%),
                        linear-gradient(180deg, #ff8a65 0%, #d84315 50%, #bf360c 100%);
                }
                .theme-wood .artwork-title { color: #fff3e0; text-shadow: 3px 3px 0 #bf360c, 0 0 30px rgba(255,138,101,0.8); }
                .theme-wood .artwork-sub { color: #ffccbc; }
                .theme-wood .artwork-decor { color: rgba(255,200,150,0.6); }
                
                .theme-camo {
                    background: linear-gradient(180deg, #455a3c 0%, #3d4a2d 30%, #2d3a1f 60%, #1a2410 100%);
                    background-image: 
                        radial-gradient(ellipse at 20% 30%, rgba(74,92,56,0.5) 0%, transparent 50%),
                        radial-gradient(ellipse at 80% 60%, rgba(26,33,21,0.6) 0%, transparent 40%),
                        radial-gradient(ellipse at 50% 80%, rgba(45,58,31,0.4) 0%, transparent 45%);
                }
                .theme-camo .artwork-frame { 
                    background: linear-gradient(135deg, #4a3728 0%, #2d1f16 50%, #1a110d 100%);
                    border: 6px solid #5d4037;
                    box-shadow: inset 0 0 30px rgba(0,0,0,0.7), 0 4px 20px rgba(0,0,0,0.5);
                }
                .theme-camo .artwork-inner {
                    background: 
                        radial-gradient(ellipse at 50% 30%, rgba(255,50,50,0.5) 0%, transparent 60%),
                        radial-gradient(ellipse at 20% 70%, rgba(0,0,0,0.5) 0%, transparent 50%),
                        linear-gradient(180deg, #8b0000 0%, #4a0000 40%, #1a0000 100%);
                }
                .theme-camo .artwork-title { color: #fafafa; font-family: 'Black Ops One', sans-serif; text-shadow: 4px 4px 0 #000, 0 0 40px rgba(255,0,0,0.6); letter-spacing: 4px; }
                .theme-camo .artwork-sub { color: #ef9a9a; }
                .theme-camo .artwork-decor { color: rgba(255,100,100,0.5); }

                .theme-cyber {
                    background: linear-gradient(180deg, #0f0f0f 0%, #0a0a0a 50%, #050505 100%);
                    border: 2px solid rgba(0,255,136,0.5);
                    box-shadow: 0 0 40px rgba(0,255,136,0.2), inset 0 0 40px rgba(0,255,136,0.03);
                }
                .theme-cyber .cabinet-shadow {
                    box-shadow: 
                        inset 4px 0 12px rgba(0,255,136,0.1),
                        inset -4px 0 12px rgba(0,0,0,0.5),
                        0 40px 80px rgba(0,0,0,0.9),
                        0 0 60px rgba(0,255,136,0.15);
                }
                .theme-cyber .artwork-frame { 
                    background: linear-gradient(135deg, #001a0d 0%, #000d06 50%, #000502 100%);
                    border: 4px solid #00ff88;
                    box-shadow: inset 0 0 40px rgba(0,255,136,0.3), 0 0 30px rgba(0,255,136,0.4);
                }
                .theme-cyber .artwork-inner {
                    background: 
                        radial-gradient(ellipse at 50% 50%, rgba(0,255,136,0.2) 0%, transparent 70%),
                        repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(0,255,136,0.05) 3px, rgba(0,255,136,0.05) 6px),
                        linear-gradient(180deg, #001a0d 0%, #000d06 100%);
                }
                .theme-cyber .artwork-title { color: #00ff88; text-shadow: 0 0 10px #00ff88, 0 0 30px #00ff88, 0 0 60px #00aa55; }
                .theme-cyber .artwork-sub { color: #4ade80; }
                .theme-cyber .artwork-decor { color: rgba(0,255,136,0.4); }

                /* Sky Theme for Word Jump */
                .theme-sky {
                    background: linear-gradient(180deg, #38bdf8 0%, #0ea5e9 30%, #0284c7 60%, #0369a1 100%);
                    border: 2px solid rgba(255,255,255,0.3);
                    box-shadow: 0 0 40px rgba(56,189,248,0.2), inset 0 0 40px rgba(255,255,255,0.05);
                }
                .theme-sky .cabinet-shadow {
                    box-shadow: 
                        inset 4px 0 12px rgba(255,255,255,0.15),
                        inset -4px 0 12px rgba(0,0,0,0.3),
                        0 40px 80px rgba(0,0,0,0.9),
                        0 0 60px rgba(56,189,248,0.15);
                }
                .theme-sky .artwork-frame { 
                    background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%);
                    border: 4px solid #7dd3fc;
                    box-shadow: inset 0 0 40px rgba(255,255,255,0.2), 0 0 30px rgba(56,189,248,0.4);
                }
                .theme-sky .artwork-inner {
                    background: 
                        radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.4) 0%, transparent 50%),
                        radial-gradient(ellipse at 70% 80%, rgba(34,197,94,0.3) 0%, transparent 50%),
                        linear-gradient(180deg, #7dd3fc 0%, #38bdf8 50%, #0ea5e9 100%);
                }
                .theme-sky .artwork-title { color: #fff; text-shadow: 2px 2px 0 #0369a1, 0 0 30px rgba(255,255,255,0.8); }
                .theme-sky .artwork-sub { color: #e0f2fe; }
                .theme-sky .artwork-decor { color: rgba(255,255,255,0.5); }
                .theme-sky .crt-content { color: #38bdf8; text-shadow: 0 0 8px rgba(56,189,248,0.6); }
                .theme-sky .score-row.highlight { background: rgba(56,189,248,0.15); }

                /* === ARTWORK MARQUEE (Backlit Sign) === */
                .artwork-frame {
                    height: 130px; margin: 12px 15px 8px 15px; border-radius: 8px;
                    position: relative; overflow: hidden;
                }
                .artwork-inner {
                    position: absolute; inset: 6px;
                    border-radius: 4px;
                    display: flex; flex-direction: column; 
                    align-items: center; justify-content: center;
                    overflow: hidden;
                }
                .artwork-scanlines {
                    position: absolute; inset: 0;
                    background: repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px);
                    pointer-events: none; z-index: 3;
                }
                .artwork-glow {
                    position: absolute; inset: 0;
                    background: radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.15) 0%, transparent 60%);
                    pointer-events: none; z-index: 4;
                }
                .artwork-title { 
                    font-size: 28px; font-weight: 900; z-index: 5; 
                    text-transform: uppercase; letter-spacing: 2px;
                    animation: artwork-pulse 3s ease-in-out infinite;
                }
                .artwork-sub { 
                    font-size: 10px; z-index: 5; margin-top: 6px; 
                    font-weight: 700; letter-spacing: 4px; text-transform: uppercase;
                }
                .artwork-decor {
                    position: absolute; z-index: 2;
                    font-size: 60px; opacity: 0.3;
                    pointer-events: none;
                }
                .artwork-decor.left { left: 10px; top: 50%; transform: translateY(-50%); }
                .artwork-decor.right { right: 10px; top: 50%; transform: translateY(-50%); }
                
                /* Backlight glow effect */
                .artwork-backlight {
                    position: absolute; top: -50%; left: -50%; right: -50%; bottom: -50%;
                    background: radial-gradient(ellipse at center, currentColor 0%, transparent 70%);
                    opacity: 0.15;
                    animation: backlight-pulse 4s ease-in-out infinite alternate;
                    pointer-events: none;
                }

                /* === CRT MONITOR === */
                .crt-housing {
                    flex: 1; margin: 0 15px 10px 15px;
                    background: linear-gradient(180deg, #2a2a2a 0%, #1c1c1c 50%, #121212 100%);
                    border-radius: 10px 10px 16px 16px;
                    padding: 10px;
                    box-shadow: 
                        inset 0 2px 6px rgba(255,255,255,0.08), 
                        inset 0 -4px 10px rgba(0,0,0,0.6),
                        0 8px 20px rgba(0,0,0,0.5);
                    position: relative;
                }
                /* Theme-specific CRT housing */
                .theme-wood .crt-housing {
                    background: linear-gradient(180deg, #5d4037 0%, #4e342e 30%, #3e2723 60%, #2e1f1a 100%);
                    box-shadow: 
                        inset 0 2px 6px rgba(255,200,150,0.1), 
                        inset 0 -4px 10px rgba(0,0,0,0.6),
                        0 8px 20px rgba(0,0,0,0.5);
                }
                .theme-camo .crt-housing {
                    background: linear-gradient(180deg, #4a5240 0%, #3d4435 30%, #2e3328 60%, #1f2218 100%);
                    box-shadow: 
                        inset 0 2px 6px rgba(129,199,132,0.08), 
                        inset 0 -4px 10px rgba(0,0,0,0.6),
                        0 8px 20px rgba(0,0,0,0.5);
                }
                .theme-cyber .crt-housing {
                    background: linear-gradient(180deg, #0a1a10 0%, #061208 30%, #030a05 60%, #010503 100%);
                    border: 1px solid rgba(0,255,136,0.2);
                    box-shadow: 
                        inset 0 2px 6px rgba(0,255,136,0.05), 
                        inset 0 -4px 10px rgba(0,0,0,0.6),
                        0 8px 20px rgba(0,0,0,0.5),
                        0 0 20px rgba(0,255,136,0.1);
                }
                .theme-sky .crt-housing {
                    background: linear-gradient(180deg, #1e4a6e 0%, #153a58 30%, #0c2a42 60%, #061a2c 100%);
                    box-shadow: 
                        inset 0 2px 6px rgba(125,211,252,0.1), 
                        inset 0 -4px 10px rgba(0,0,0,0.6),
                        0 8px 20px rgba(0,0,0,0.5);
                }
                .crt-bezel {
                    position: absolute; inset: 6px;
                    background: linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 50%, #050505 100%);
                    border-radius: 8px 8px 14px 14px;
                    box-shadow: inset 0 0 25px rgba(0,0,0,0.95);
                }
                /* Theme-specific bezels */
                .theme-wood .crt-bezel {
                    background: linear-gradient(180deg, #3e2723 0%, #2e1f1a 50%, #1a1210 100%);
                    border: 2px solid #5d4037;
                    border-top-color: #6d4c41;
                }
                .theme-camo .crt-bezel {
                    background: linear-gradient(180deg, #2e3328 0%, #1f2218 50%, #12150e 100%);
                    border: 2px solid #4a5240;
                    border-top-color: #5a6250;
                }
                .theme-cyber .crt-bezel {
                    background: linear-gradient(180deg, #030a05 0%, #020503 50%, #010302 100%);
                    border: 1px solid rgba(0,255,136,0.3);
                    box-shadow: inset 0 0 25px rgba(0,0,0,0.95), inset 0 0 10px rgba(0,255,136,0.1);
                }
                .theme-sky .crt-bezel {
                    background: linear-gradient(180deg, #0c2a42 0%, #061a2c 50%, #030d16 100%);
                    border: 2px solid #1e4a6e;
                    border-top-color: #2e5a7e;
                }
                .crt-screen {
                    position: absolute; inset: 12px;
                    background: radial-gradient(ellipse at 50% 50%, #0a0f18 0%, #030508 100%);
                    border-radius: 45% 45% 42% 42% / 10% 10% 8% 8%;
                    overflow: hidden;
                    box-shadow: 
                        inset 0 0 100px rgba(0,0,0,0.95),
                        0 0 3px rgba(100,150,255,0.4);
                }
                
                /* CRT Glass Effect */
                .crt-glass {
                    position: absolute; inset: 0; pointer-events: none; z-index: 20;
                    border-radius: 45% 45% 42% 42% / 10% 10% 8% 8%;
                    background: 
                        linear-gradient(165deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.04) 20%, transparent 40%),
                        linear-gradient(195deg, transparent 60%, rgba(255,255,255,0.02) 80%, rgba(255,255,255,0.06) 100%);
                    box-shadow: 
                        inset 2px 2px 4px rgba(255,255,255,0.1),
                        inset -2px -2px 4px rgba(0,0,0,0.4);
                }
                .crt-glare {
                    position: absolute; top: 5%; left: 8%; width: 35%; height: 25%; 
                    pointer-events: none; z-index: 21;
                    background: radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 70%);
                    border-radius: 50%;
                    transform: rotate(-15deg);
                }
                
                .scanlines {
                    position: absolute; inset: 0; pointer-events: none; z-index: 15;
                    background: repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px);
                    border-radius: 45% 45% 42% 42% / 10% 10% 8% 8%;
                }
                .screen-flicker {
                    position: absolute; inset: 0; pointer-events: none; z-index: 14;
                    background: transparent;
                    border-radius: 45% 45% 42% 42% / 10% 10% 8% 8%;
                    animation: flicker 0.15s infinite;
                    opacity: 0.03;
                }
                
                .crt-content {
                    position: relative; z-index: 10;
                    height: 100%; padding: 15px 10px; 
                    overflow: hidden;
                    font-family: 'VT323', monospace; font-size: 1.3rem;
                    display: flex; flex-direction: column;
                }
                .crt-content::-webkit-scrollbar { display: none; }

                /* === SCORES === */
                .score-header {
                    text-align: center; padding-bottom: 6px; margin-bottom: 4px;
                    border-bottom: 2px solid rgba(255,255,255,0.2);
                    font-size: 0.95rem; letter-spacing: 2px; opacity: 0.9;
                    flex-shrink: 0;
                }
                .score-list {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;
                    gap: 2px;
                    overflow: hidden;
                }
                .score-row { 
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 6px 4px; 
                    border-bottom: 1px solid rgba(255,255,255,0.08);
                    flex-shrink: 0;
                }
                .score-row:last-child { border-bottom: none; }
                .score-row.highlight { 
                    background: rgba(255,255,0,0.1); 
                    animation: pulse-row 1.5s ease-in-out infinite alternate;
                }
                .rank { width: 35px; opacity: 0.5; font-size: 1.1rem; }
                .name { flex: 1; letter-spacing: 2px; font-weight: bold; font-size: 1.1rem; }
                .score { font-weight: bold; font-size: 1.2rem; letter-spacing: 1px; }
                .no-scores {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    opacity: 0.6;
                    font-size: 1.1rem;
                    line-height: 1.6;
                }

                /* Theme-specific CRT colors */
                .theme-wood .crt-content { color: #ffa726; text-shadow: 0 0 8px rgba(255,167,38,0.5); }
                .theme-wood .score-row.highlight { background: rgba(255,167,38,0.15); }
                .theme-camo .crt-content { color: #81c784; text-shadow: 0 0 8px rgba(129,199,132,0.5); }
                .theme-camo .score-row.highlight { background: rgba(129,199,132,0.15); }
                .theme-cyber .crt-content { color: #00ff88; text-shadow: 0 0 8px rgba(0,255,136,0.6); }
                .theme-cyber .score-row.highlight { background: rgba(0,255,136,0.15); }

                /* === CONTROL PANEL === */
                .control-panel {
                    height: 110px; margin: 0 15px 15px 15px;
                    background: linear-gradient(180deg, #252525 0%, #1a1a1a 40%, #0f0f0f 100%);
                    border-radius: 6px 6px 8px 8px;
                    position: relative;
                    box-shadow: 
                        inset 0 2px 4px rgba(255,255,255,0.05), 
                        inset 0 -3px 6px rgba(0,0,0,0.6),
                        0 6px 15px rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    overflow: hidden;
                }
                .control-panel::before {
                    content: '';
                    position: absolute; top: 0; left: 0; right: 0; height: 2px;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
                }
                
                /* Metal panel texture */
                .panel-surface {
                    position: absolute; inset: 0;
                    background-image: 
                        repeating-linear-gradient(90deg, transparent 0px, transparent 4px, rgba(255,255,255,0.01) 4px, rgba(255,255,255,0.01) 8px);
                    border-radius: 6px 6px 8px 8px;
                    pointer-events: none;
                }
                
                /* Joystick */
                .joystick-area {
                    width: 90px; height: 90px;
                    margin-left: 20px;
                    position: relative;
                    display: flex; align-items: center; justify-content: center;
                }
                .joystick-base {
                    width: 70px; height: 70px;
                    background: radial-gradient(circle at 30% 30%, #3a3a3a, #1a1a1a);
                    border-radius: 50%;
                    box-shadow: 
                        inset 0 4px 8px rgba(0,0,0,0.8),
                        0 2px 4px rgba(0,0,0,0.5);
                    display: flex; align-items: center; justify-content: center;
                }
                .joystick-ring {
                    width: 55px; height: 55px;
                    background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%);
                    border-radius: 50%;
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.6);
                    display: flex; align-items: center; justify-content: center;
                }
                .joystick-stick {
                    width: 20px; height: 50px;
                    background: linear-gradient(90deg, #2a2a2a 0%, #4a4a4a 30%, #3a3a3a 70%, #1a1a1a 100%);
                    border-radius: 4px 4px 6px 6px;
                    position: relative;
                    transform: translateY(-10px) rotateX(0deg) rotateZ(0deg);
                    transform-origin: center bottom;
                    transition: transform 0.15s ease-out;
                    box-shadow: 
                        0 4px 8px rgba(0,0,0,0.5),
                        inset 0 0 2px rgba(255,255,255,0.1);
                }
                .joystick-stick.tilt-left {
                    transform: translateY(-10px) rotateZ(-15deg);
                }
                .joystick-stick.tilt-right {
                    transform: translateY(-10px) rotateZ(15deg);
                }
                .joystick-ball {
                    position: absolute;
                    top: -18px; left: 50%;
                    transform: translateX(-50%);
                    width: 32px; height: 32px;
                    border-radius: 50%;
                    background: radial-gradient(circle at 35% 35%, #ff4444, #aa0000 50%, #660000);
                    box-shadow: 
                        0 4px 8px rgba(0,0,0,0.6),
                        inset 0 -4px 8px rgba(0,0,0,0.4),
                        inset 0 4px 8px rgba(255,255,255,0.2);
                }
                
                /* Button cluster */
                .button-cluster {
                    flex: 1;
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                    align-items: center;
                    padding: 0 15px;
                }
                .arcade-btn {
                    width: 52px; height: 52px; border-radius: 50%; border: none;
                    position: relative;
                    cursor: pointer; 
                    display: grid; place-items: center;
                    transition: transform 0.08s, box-shadow 0.08s;
                    font-family: 'Press Start 2P', monospace;
                }
                .arcade-btn::before {
                    content: '';
                    position: absolute;
                    inset: 3px;
                    border-radius: 50%;
                    background: inherit;
                    box-shadow: inset 0 3px 5px rgba(255,255,255,0.3), inset 0 -3px 5px rgba(0,0,0,0.4);
                    z-index: 1;
                }
                .arcade-btn::after {
                    content: '';
                    position: absolute;
                    top: 6px; left: 15%;
                    width: 50%; height: 30%;
                    background: linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%);
                    border-radius: 50%;
                    z-index: 2;
                }
                .arcade-btn:active { 
                    transform: translateY(3px); 
                    box-shadow: 0 2px 0 rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.4) !important;
                }
                .btn-toggle { 
                    background: linear-gradient(180deg, #4a90ff 0%, #2563eb 50%, #1d4ed8 100%);
                    box-shadow: 
                        0 5px 0 #1e40af, 
                        0 8px 15px rgba(0,0,0,0.5),
                        0 0 15px rgba(59,130,246,0.3);
                    font-size: 22px;
                    color: #fff;
                    font-family: system-ui, -apple-system, sans-serif;
                    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
                }
                .btn-toggle > * { position: relative; z-index: 5; }
                .btn-share { 
                    background: linear-gradient(180deg, #fbbf24 0%, #d97706 50%, #b45309 100%);
                    box-shadow: 
                        0 5px 0 #92400e, 
                        0 8px 15px rgba(0,0,0,0.5),
                        0 0 15px rgba(234,179,8,0.3);
                    font-size: 18px;
                }
                .btn-share > * { position: relative; z-index: 5; }
                .btn-share.hidden { display: none; }
                
                /* Insert Coin Section - Now Clickable */
                .coin-section {
                    width: 70px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-right: 15px;
                    cursor: pointer;
                    transition: transform 0.1s;
                    position: relative;
                }
                .coin-section:hover {
                    transform: scale(1.05);
                }
                .coin-section:active {
                    transform: scale(0.95);
                }
                .coin-slot {
                    width: 40px; height: 8px;
                    background: linear-gradient(180deg, #0a0a0a, #1a1a1a, #0a0a0a);
                    border-radius: 4px;
                    box-shadow: 
                        inset 0 2px 4px rgba(0,0,0,0.9),
                        0 1px 0 rgba(255,255,255,0.05);
                    margin-bottom: 8px;
                    position: relative;
                    overflow: visible;
                    z-index: 5;
                }
                
                /* Gold Coin Animation */
                .coin-anim {
                    position: absolute;
                    width: 28px; height: 28px;
                    border-radius: 50%;
                    background: radial-gradient(circle at 35% 35%, #ffd700, #daa520 40%, #b8860b 70%, #8b6914);
                    border: 2px solid #ffd700;
                    box-shadow: 
                        inset 0 -2px 4px rgba(0,0,0,0.3),
                        0 2px 8px rgba(255,215,0,0.6),
                        0 0 15px rgba(255,215,0,0.4);
                    top: -60px; left: 50%;
                    transform: translateX(-50%);
                    z-index: 10;
                    animation: coinDrop 0.6s ease-in forwards;
                }
                .coin-anim::before {
                    content: '£';
                    position: absolute;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    font-weight: bold;
                    color: #8b6914;
                    text-shadow: 0 1px 0 rgba(255,255,255,0.3);
                }
                .coin-anim::after {
                    content: '';
                    position: absolute;
                    top: 3px; left: 3px;
                    width: 8px; height: 8px;
                    background: radial-gradient(circle, rgba(255,255,255,0.8), transparent);
                    border-radius: 50%;
                }
                
                /* Fake Coin / Bottle Cap Animation */
                .fake-coin-anim {
                    position: absolute;
                    width: 26px; height: 26px;
                    border-radius: 50%;
                    background: 
                        radial-gradient(circle at 30% 30%, #888, #555 50%, #333),
                        repeating-conic-gradient(from 0deg, #666 0deg 15deg, #444 15deg 30deg);
                    border: 2px solid #777;
                    box-shadow: 
                        inset 0 -2px 4px rgba(0,0,0,0.5),
                        0 2px 6px rgba(0,0,0,0.4);
                    top: -60px; left: 50%;
                    transform: translateX(-50%) rotate(0deg);
                    z-index: 10;
                    animation: fakeCoinDrop 0.8s ease-in forwards;
                }
                .fake-coin-anim::before {
                    content: '';
                    position: absolute;
                    inset: 4px;
                    border-radius: 50%;
                    background: 
                        linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%),
                        radial-gradient(circle at 60% 60%, #444, #222);
                    border: 1px dashed #555;
                }
                /* Crumpled texture lines */
                .fake-coin-anim::after {
                    content: '';
                    position: absolute;
                    inset: 2px;
                    border-radius: 50%;
                    background: 
                        linear-gradient(45deg, transparent 45%, rgba(0,0,0,0.2) 50%, transparent 55%),
                        linear-gradient(-45deg, transparent 45%, rgba(255,255,255,0.1) 50%, transparent 55%),
                        linear-gradient(90deg, transparent 45%, rgba(0,0,0,0.15) 50%, transparent 55%);
                }
                
                @keyframes coinDrop {
                    0% {
                        top: -60px;
                        opacity: 1;
                        transform: translateX(-50%) rotateY(0deg) scale(1);
                    }
                    50% {
                        opacity: 1;
                        transform: translateX(-50%) rotateY(180deg) scale(1);
                    }
                    85% {
                        top: -10px;
                        opacity: 1;
                        transform: translateX(-50%) rotateY(360deg) scale(0.8);
                    }
                    100% {
                        top: 0px;
                        opacity: 0;
                        transform: translateX(-50%) rotateY(540deg) scale(0.3);
                    }
                }
                
                @keyframes fakeCoinDrop {
                    0% {
                        top: -60px;
                        opacity: 1;
                        transform: translateX(-50%) rotate(0deg) scale(1);
                    }
                    30% {
                        transform: translateX(-50%) rotate(-20deg) scale(1);
                    }
                    50% {
                        top: -30px;
                        transform: translateX(-50%) rotate(15deg) scale(0.95);
                    }
                    70% {
                        transform: translateX(-50%) rotate(-10deg) scale(0.9);
                    }
                    85% {
                        top: -10px;
                        opacity: 1;
                        transform: translateX(-50%) rotate(5deg) scale(0.7);
                    }
                    100% {
                        top: 0px;
                        opacity: 0;
                        transform: translateX(-50%) rotate(0deg) scale(0.3);
                    }
                }
                .coin-light {
                    width: 50px; height: 20px;
                    background: linear-gradient(180deg, #1a1a1a, #0f0f0f);
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: inset 0 1px 3px rgba(0,0,0,0.8);
                    overflow: hidden;
                    position: relative;
                }
                .coin-light-inner {
                    font-family: 'Press Start 2P', monospace;
                    font-size: 5px;
                    color: #ff6600;
                    text-shadow: 0 0 8px #ff6600, 0 0 15px #ff3300;
                    animation: coin-blink 1s ease-in-out infinite;
                    letter-spacing: -0.5px;
                }
                .coin-light::before {
                    content: '';
                    position: absolute; inset: 2px;
                    background: radial-gradient(ellipse at center, rgba(255,100,0,0.15) 0%, transparent 70%);
                    animation: coin-glow 1s ease-in-out infinite;
                }
                
                /* Speaker grille */
                .speaker-grille {
                    position: absolute;
                    bottom: 8px; left: 50%;
                    transform: translateX(-50%);
                    width: 60px; height: 15px;
                    display: flex; gap: 3px;
                    opacity: 0.4;
                }
                .speaker-hole {
                    flex: 1;
                    background: repeating-linear-gradient(0deg, #0a0a0a 0px, #0a0a0a 2px, #1a1a1a 2px, #1a1a1a 4px);
                    border-radius: 2px;
                }

                .close-btn {
                    position: absolute; top: 20px; right: 20px; z-index: 200;
                    width: 44px; height: 44px; 
                    background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
                    border: 2px solid rgba(255,255,255,0.2); border-radius: 50%; 
                    color: #fff; font-size: 18px;
                    cursor: pointer; display: grid; place-items: center;
                    transition: all 0.2s;
                }
                .close-btn:hover { background: rgba(239,68,68,0.6); border-color: rgba(239,68,68,0.8); }

                /* === ANIMATIONS === */
                @keyframes artwork-pulse { 
                    0%, 100% { filter: brightness(1); transform: scale(1); } 
                    50% { filter: brightness(1.15); transform: scale(1.02); } 
                }
                @keyframes backlight-pulse {
                    0% { opacity: 0.1; }
                    100% { opacity: 0.2; }
                }
                @keyframes pulse-row { 
                    0% { background: rgba(255,255,255,0.05); } 
                    100% { background: rgba(255,255,255,0.15); } 
                }
                @keyframes flicker {
                    0%, 100% { background: transparent; }
                    50% { background: rgba(255,255,255,0.02); }
                }
                @keyframes coin-blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                }
                @keyframes coin-glow {
                    0%, 100% { opacity: 0.8; }
                    50% { opacity: 0.4; }
                }
            `;
            document.head.appendChild(s);
        }

        // 3. Define Cabinet Data
        const cabinets = [
            {
                id: 'streak',
                theme: 'theme-wood',
                title: 'Word Streak',
                subtitle: 'ENDURANCE RUN',
                icon: '🔥',
                gameHash: '', // No direct game for streak
                dataGlobal: globalStreak || [],
                dataLocal: (State.data.highScores || []),
                shareMsg: (s) => `🔥 I hit a ${s}-word streak in Word Streak! Can you beat me?`
            },
            {
                id: 'war',
                theme: 'theme-camo',
                title: 'WORD WAR!',
                subtitle: 'BATTLEFIELD',
                icon: '⚔️',
                gameHash: '#WordWar',
                dataGlobal: globalWar || [],
                dataLocal: (State.data.wordWarScores || []),
                shareMsg: (s) => `⚔️ I won ${s} battles in WORD WAR! #WordWar`
            },
            {
                id: 'def',
                theme: 'theme-cyber',
                title: 'definition dash',
                subtitle: 'DATA UPLINK',
                icon: '🧠',
                gameHash: '#DefDash',
                dataGlobal: globalDef || [],
                dataLocal: (State.data.defDashScores || []),
                shareMsg: (s) => `🧠 I scored ${s} points in definition dash! #DefDash`
            },
            {
                id: 'jump',
                theme: 'theme-sky',
                title: 'Word Jump',
                subtitle: 'ENDLESS RUNNER',
                icon: '🦘',
                gameHash: '#WordJump',
                dataGlobal: globalJump || [],
                dataLocal: (State.data.wordJumpScores || []),
                shareMsg: (s) => `🦘 I jumped over ${s} words in Word Jump! #WordJump`
            }
        ];

        // 4. Construct DOM
        const modal = document.createElement('div');
        modal.id = 'highScoreModal';
        modal.className = 'arcade-modal';
        
        // Render List Function - Limited to fit CRT screen
        const generateListHTML = (data) => {
            if (!data || data.length === 0) {
                return '<div class="no-scores">NO DATA RECORDED<br>PLAY NOW!</div>';
            }
            
            // Limit to top 8 scores to fit the CRT screen without scrolling
            const rows = data.slice(0, 8).map((entry, i) => {
                const isMe = (entry.name === username);
                return `
                    <div class="score-row ${isMe ? 'highlight' : ''}">
                        <span class="rank">${i+1}.</span>
                        <span class="name">${(entry.name || 'UNKNOWN').substring(0, 10).toUpperCase()}</span>
                        <span class="score">${entry.score}</span>
                    </div>
                `;
            }).join('');
            
            return `<div class="score-list">${rows}</div>`;
        };

        const cabinetHTML = cabinets.map((cab, idx) => `
            <div class="arcade-cabinet ${cab.theme} inactive" id="cab-${idx}" data-idx="${idx}">
                <div class="cabinet-shadow"></div>
                
                <!-- Artwork/Marquee Area -->
                <div class="artwork-frame">
                    <div class="artwork-inner">
                        <div class="artwork-backlight"></div>
                        <div class="artwork-scanlines"></div>
                        <span class="artwork-decor left">${cab.icon}</span>
                        <span class="artwork-decor right">${cab.icon}</span>
                        <div class="artwork-title">${cab.title}</div>
                        <div class="artwork-sub">${cab.subtitle}</div>
                        <div class="artwork-glow"></div>
                    </div>
                </div>
                
                <!-- CRT Monitor -->
                <div class="crt-housing">
                    <div class="crt-bezel"></div>
                    <div class="crt-screen">
                        <div class="screen-flicker"></div>
                        <div class="scanlines"></div>
                        <div class="crt-content" id="list-${idx}"></div>
                        <div class="crt-glass"></div>
                        <div class="crt-glare"></div>
                    </div>
                </div>
                
                <!-- Control Panel with Joystick & Buttons -->
                <div class="control-panel">
                    <div class="panel-surface"></div>
                    
                    <!-- Joystick -->
                    <div class="joystick-area">
                        <div class="joystick-base">
                            <div class="joystick-ring">
                                <div class="joystick-stick">
                                    <div class="joystick-ball"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Button Cluster -->
                    <div class="button-cluster">
                        <button class="arcade-btn btn-toggle" data-idx="${idx}"><span>🏠</span></button>
                        <button class="arcade-btn btn-share hidden" data-idx="${idx}">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="position:relative;z-index:5;color:#fff;">
                                <circle cx="18" cy="5" r="3"></circle>
                                <circle cx="6" cy="12" r="3"></circle>
                                <circle cx="18" cy="19" r="3"></circle>
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Insert Coin - Launches Game -->
                    <div class="coin-section" data-game="${cab.id}" data-idx="${idx}">
                        <div class="coin-slot"></div>
                        <div class="coin-light">
                            <div class="coin-light-inner">INSERT COIN</div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        modal.innerHTML = `
            <div class="arcade-floor"></div>
            <div class="arcade-ceiling-glow"></div>
            <div class="arcade-header-overlay"></div>
            <button class="close-btn" id="closeArcade">✕</button>
            
            <div class="cabinet-viewport">
                <div class="cabinet-row" id="cabinetRow">
                    ${cabinetHTML}
                </div>
            </div>
            
            <div style="position:absolute; bottom:20px; width:100%; text-align:center; color:rgba(255,255,255,0.35); font-family:'VT323', monospace; font-size:14px; letter-spacing:2px; pointer-events:none;">
                SWIPE TO BROWSE • 1P/2P FOR SCORES • INSERT COIN TO PLAY
            </div>
        `;
        
        document.body.appendChild(modal);

        // 5. Logic & Animation
        let currentIndex = initialCabinetIndex;
        let viewModes = [0, 0, 0, 0]; // 0=Global (1P), 1=Local (2P)
        const row = document.getElementById('cabinetRow');
        const cabs = document.querySelectorAll('.arcade-cabinet');

        const refreshCabinetContent = (idx) => {
            const cab = cabinets[idx];
            const mode = viewModes[idx]; // 0=Global, 1=Local
            const data = mode === 0 ? cab.dataGlobal : cab.dataLocal;
            const title = mode === 0 ? "🌐 WORLD RECORDS" : "🏠 YOUR BEST";
            
            const container = document.getElementById(`list-${idx}`);
            container.innerHTML = `
                <div class="score-header">${title}</div>
                ${generateListHTML(data)}
            `;
            
            // Toggle Button Text: 🌍 when share visible (local mode), 🏠 when alone (global mode)
            const btnToggle = modal.querySelector(`.btn-toggle[data-idx="${idx}"]`);
            const btnShare = modal.querySelector(`.btn-share[data-idx="${idx}"]`);
            
            if(btnShare) {
                if (mode === 1) {
                    btnShare.classList.remove('hidden');
                    // Local mode with share button visible: show globe emoji
                    if(btnToggle) btnToggle.innerHTML = '<span>🌍</span>';
                } else {
                    btnShare.classList.add('hidden');
                    // Global mode, share hidden: show home emoji
                    if(btnToggle) btnToggle.innerHTML = '<span>🏠</span>';
                }
            }
        };

        cabinets.forEach((_, i) => refreshCabinetContent(i));

        // Joystick Animation Helper
        const animateJoysticks = (direction) => {
            const sticks = modal.querySelectorAll('.joystick-stick');
            sticks.forEach(stick => {
                stick.classList.remove('tilt-left', 'tilt-right');
                if (direction === 'left') stick.classList.add('tilt-left');
                else if (direction === 'right') stick.classList.add('tilt-right');
            });
            // Reset after animation
            if (direction) {
                setTimeout(() => {
                    sticks.forEach(stick => stick.classList.remove('tilt-left', 'tilt-right'));
                }, 300);
            }
        };

        // Centering Logic
        const updatePosition = (direction = null) => {
            const sampleCab = cabs[0];
            const cabWidth = sampleCab.offsetWidth;
            const gapStr = getComputedStyle(document.documentElement).getPropertyValue('--cab-gap').trim();
            const gap = parseInt(gapStr) || 50;
            
            const screenCenter = window.innerWidth / 2;
            const itemCenter = (currentIndex * (cabWidth + gap)) + (cabWidth / 2);
            row.style.transform = `translateX(${screenCenter - itemCenter}px)`;

            // Animate joystick based on direction
            if (direction) animateJoysticks(direction);

            cabs.forEach((el, i) => {
                if (i === currentIndex) {
                    el.classList.add('active');
                    el.classList.remove('inactive');
                } else {
                    el.classList.add('inactive');
                    el.classList.remove('active');
                }
            });
        };

        setTimeout(updatePosition, 10);
        window.addEventListener('resize', () => updatePosition());

        // 6. Interaction Handlers
        modal.querySelectorAll('.btn-toggle').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const idx = parseInt(e.target.dataset.idx || e.target.closest('.btn-toggle').dataset.idx);
                viewModes[idx] = viewModes[idx] === 0 ? 1 : 0;
                refreshCabinetContent(idx);
            };
        });

        // --- COIN INSERT LOGIC (Launch Games) ---
        modal.querySelectorAll('.coin-section').forEach(coinBtn => {
            coinBtn.onclick = (e) => {
                e.stopPropagation();
                const gameId = coinBtn.dataset.game;
                const idx = parseInt(coinBtn.dataset.idx);
                
                // Only allow launching from active cabinet
                if (currentIndex !== idx) {
                    currentIndex = idx;
                    updatePosition();
                    return;
                }
                
                const crtContent = document.getElementById(`list-${idx}`);
                const coinSlot = coinBtn.querySelector('.coin-slot');
                
                // Create and animate the coin
                const createCoinAnimation = (isFake) => {
                    // Remove any existing coin animations
                    const existing = coinSlot.querySelector('.coin-anim, .fake-coin-anim');
                    if (existing) existing.remove();
                    
                    const coin = document.createElement('div');
                    coin.className = isFake ? 'fake-coin-anim' : 'coin-anim';
                    coinSlot.appendChild(coin);
                    
                    // Remove after animation completes
                    setTimeout(() => coin.remove(), isFake ? 800 : 600);
                };
                
                // Word Streak = Fake coin!
                if (gameId === 'streak') {
                    createCoinAnimation(true); // Fake bottle cap animation
                    
                    setTimeout(() => {
                        crtContent.innerHTML = `
                            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; text-align:center;">
                                <div style="font-size: 2rem; color: #ff4444; text-shadow: 0 0 20px #ff0000; animation: fakeCoinFlash 0.3s ease-in-out 3;">FAKE COIN!</div>
                                <div style="font-size: 1rem; margin-top: 15px; opacity: 0.6;">Nice try...</div>
                            </div>
                        `;
                    }, 400);
                    
                    // Add flash animation if not exists
                    if (!document.getElementById('fake-coin-anim')) {
                        const style = document.createElement('style');
                        style.id = 'fake-coin-anim';
                        style.textContent = `
                            @keyframes fakeCoinFlash {
                                0%, 100% { opacity: 1; transform: scale(1); }
                                50% { opacity: 0.5; transform: scale(1.1); }
                            }
                        `;
                        document.head.appendChild(style);
                    }
                    // Return to scores after delay
                    setTimeout(() => refreshCabinetContent(idx), 2500);
                    return;
                }
                
                // Word War, Def Dash, or Word Jump - Real coin animation
                createCoinAnimation(false); // Gold coin animation
                
                setTimeout(() => {
                    crtContent.innerHTML = `
                        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; text-align:center;">
                            <div style="font-size: 2rem; animation: loadingPulse 0.8s ease-in-out infinite;">LOADING...</div>
                            <div style="margin-top: 20px; font-size: 3rem; animation: loadingPulse 0.8s ease-in-out infinite 0.2s;">${cabinets[idx].icon}</div>
                        </div>
                    `;
                }, 300);
                
                // Add loading animation if not exists
                if (!document.getElementById('loading-anim')) {
                    const style = document.createElement('style');
                    style.id = 'loading-anim';
                    style.textContent = `
                        @keyframes loadingPulse {
                            0%, 100% { opacity: 1; }
                            50% { opacity: 0.3; }
                        }
                    `;
                    document.head.appendChild(style);
                }
                
                // Close and launch after delay
                setTimeout(() => {
                    close();
                    
                    setTimeout(() => {
                        if (gameId === 'war' && typeof MiniGames !== 'undefined' && MiniGames.wordWar) {
                            MiniGames.wordWar.start();
                        } else if (gameId === 'def' && typeof MiniGames !== 'undefined' && MiniGames.definitionDash) {
                            MiniGames.definitionDash.start();
                        } else if (gameId === 'jump' && typeof MiniGames !== 'undefined' && MiniGames.wordJump) {
                            MiniGames.wordJump.start();
                        }
                    }, 100);
                }, 1200);
            };
        });

        // --- SHARE LOGIC ---
        modal.querySelectorAll('.btn-share').forEach(btn => {
            btn.onclick = async (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.dataset.idx);
                const cab = cabinets[idx];
                
                // Get user's personal best (top local score)
                const bestScore = (cab.dataLocal && cab.dataLocal.length > 0) ? cab.dataLocal[0].score : 0;
                
                // Build direct game link with hash
                const baseUrl = 'https://good-word.onrender.com/';
                const gameUrl = cab.gameHash ? baseUrl + cab.gameHash : baseUrl;
                
                const shareText = cab.shareMsg(bestScore);
                const shareData = {
                    title: cab.title,
                    text: shareText,
                    url: gameUrl
                };

                if (navigator.share) {
                    try { await navigator.share(shareData); } 
                    catch (err) { console.log('Share skipped'); }
                } else {
                    // Fallback
                    try {
                        await navigator.clipboard.writeText(`${shareText} ${gameUrl}`);
                        alert('Score copied to clipboard!');
                    } catch (err) {
                        alert('Could not copy score: ' + shareText);
                    }
                }
            };
        });

        // Close & Cleanup
        const close = () => {
            modal.remove();
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('keydown', keyHandler);
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchend', handleEnd);
        };
        document.getElementById('closeArcade').onclick = close;

        // Swipe & Touch Logic
        let startX = 0;
        let isDragging = false;
        let startTranslateX = 0;

        const getTranslateX = () => {
            const style = window.getComputedStyle(row);
            const matrix = new WebKitCSSMatrix(style.transform);
            return matrix.m41;
        };

        const handleStart = (e) => {
            if (e.target.closest('.arcade-btn') || e.target.closest('.close-btn') || e.target.closest('.coin-section')) return;
            isDragging = true;
            startX = e.touches ? e.touches[0].clientX : e.clientX;
            row.style.transition = 'none';
            startTranslateX = getTranslateX();
        };

        const handleMove = (e) => {
            if (!isDragging) return;
            e.preventDefault(); 
            const currentX = e.touches ? e.touches[0].clientX : e.clientX;
            const diff = currentX - startX;
            row.style.transform = `translateX(${startTranslateX + diff}px)`;
            
            // Animate joysticks during drag
            if (diff < -20) animateJoysticks('right');
            else if (diff > 20) animateJoysticks('left');
        };

        const handleEnd = (e) => {
            if (!isDragging) return;
            isDragging = false;
            row.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
            
            const currentX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
            const diff = currentX - startX;

            let direction = null;
            if (Math.abs(diff) > 50) {
                if (diff < 0 && currentIndex < cabinets.length - 1) {
                    currentIndex++;
                    direction = 'right';
                }
                else if (diff > 0 && currentIndex > 0) {
                    currentIndex--;
                    direction = 'left';
                }
            }
            updatePosition(direction);
        };

        const viewport = modal.querySelector('.cabinet-viewport');
        viewport.addEventListener('mousedown', handleStart);
        viewport.addEventListener('touchstart', handleStart, {passive: false});
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('touchmove', handleMove, {passive: false});
        window.addEventListener('mouseup', handleEnd);
        window.addEventListener('touchend', handleEnd);

        cabs.forEach((cab, i) => {
            cab.addEventListener('click', (e) => {
                if(e.target.closest('.arcade-btn') || e.target.closest('.coin-section')) return;
                if(currentIndex !== i) {
                    const direction = i > currentIndex ? 'right' : 'left';
                    currentIndex = i;
                    updatePosition(direction);
                }
            });
        });

        const keyHandler = (e) => {
            if (e.key === 'ArrowLeft' && currentIndex > 0) { currentIndex--; updatePosition('left'); }
            if (e.key === 'ArrowRight' && currentIndex < cabinets.length - 1) { currentIndex++; updatePosition('right'); }
            if (e.key === 'Escape') close();
        };
        window.addEventListener('keydown', keyHandler);
    },
    closeLeaderboard() {
        const el = document.getElementById('highScoreModal');
        if(el) el.remove();
        if (this.loopTimer) clearTimeout(this.loopTimer);
    }
};
    window.onload = Game.init.bind(Game);
    window.RoomManager = RoomManager;
    window.UIManager = UIManager;
    window.WeatherManager = WeatherManager;
    window.LocalPeerManager = LocalPeerManager;
    window.MiniGames = MiniGames;
    window.StreakManager = StreakManager;
    console.log("%c Good Word / Bad Word ", "background: #4f46e5; color: #bada55; padding: 4px; border-radius: 4px;");
    console.log("Play fair! ️😇");
})();

// ============================================================================
// EXPORTS
// ============================================================================
window.StreakManager = StreakManager;

console.log('%c[StreakManager] Module loaded', 'color: #ef4444; font-weight: bold');

})();
