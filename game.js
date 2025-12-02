import { State } from './state.js';
import { DOM } from './dom.js';
import { API } from './api.js';
import { CONFIG } from './config.js';
import { UIManager } from './managers/ui.js';
import { ThemeManager } from './managers/theme.js';
import { SoundManager } from './managers/audio.js';
import { ModalManager } from './managers/modal.js';
import { Accessibility } from './utils/accessibility.js';

export const Game = {
    async init() {
        // Register special word loader for UI Badges
        UIManager.setLoadSpecialCallback((t) => this.loadSpecial(t));
        
        // Bind Buttons
        DOM.game.buttons.good.onclick = () => this.vote('good');
        DOM.game.buttons.bad.onclick = () => this.vote('bad');
        DOM.game.buttons.notWord.onclick = () => this.vote('notWord');
        DOM.game.dailyBanner.onclick = () => this.activateDailyMode();
        
        // Initial Data Fetch
        await this.refreshData();
        
        // Daily Status Check
        this.checkDailyStatus();
    },

    checkDailyStatus() {
        const t = new Date().toISOString().split('T')[0];
        const l = State.data.daily.lastDate;
        
        if (t === l) {
            DOM.game.dailyStatus.textContent = "Come back tomorrow!";
            DOM.game.dailyBanner.style.display = 'none';
        } else {
            DOM.game.dailyStatus.textContent = "Vote Now!";
            DOM.game.dailyBanner.style.display = 'block';
        }
    },

    activateDailyMode() {
        if (State.runtime.isDailyMode) return;
        
        const now = new Date();
        const t = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
        if (t === State.data.daily.lastDate) return;

        State.runtime.isDailyMode = true;
        DOM.game.dailyBanner.classList.add('daily-locked-mode');
        
        // Hide non-binary options for Daily
        DOM.game.buttons.notWord.style.display = 'none';
        DOM.game.buttons.custom.style.display = 'none';
        
        UIManager.showMessage('Loading Daily Word...');
        
        // Deterministic Daily Word
        const sortedWords = [...State.runtime.allWords].sort((a, b) => a.text.localeCompare(b.text));
        let seed = 0;
        for (let i = 0; i < t.length; i++) {
            seed = ((seed << 5) - seed) + t.charCodeAt(i);
            seed |= 0;
        }
        seed = Math.abs(seed);
        
        const winningWordRef = sortedWords[seed % sortedWords.length];
        
        if (winningWordRef) {
            const idx = State.runtime.allWords.findIndex(w => w.text === winningWordRef.text);
            if (idx !== -1) {
                State.runtime.currentWordIndex = idx;
                UIManager.displayWord(State.runtime.allWords[idx]);
            }
        } else {
            UIManager.showMessage("No Daily Word Found");
        }
    },

    disableDailyMode() {
        State.runtime.isDailyMode = false;
        DOM.game.dailyBanner.classList.remove('daily-locked-mode');
        DOM.game.buttons.notWord.style.display = 'block';
        DOM.game.buttons.custom.style.display = 'block';
        this.nextWord();
    },

    async refreshData(updateUI = true) {
        if (updateUI) UIManager.showMessage("Loading...");
        const d = await API.fetchWords();
        
        if (d) {
            let words = d.filter(w => (w.notWordVotes || 0) < 3);
            if (State.data.settings.zeroVotesOnly) {
                words = words.filter(w => (w.goodVotes || 0) === 0 && (w.badVotes || 0) === 0);
            }
            State.runtime.allWords = words;
            UIManager.updateStats();
            
            if (updateUI && !State.runtime.isDailyMode) this.nextWord();
        } else {
            UIManager.showMessage("Connection Error", true);
        }
    },

    nextWord() {
        const p = State.runtime.allWords;
        if (!p.length) return;

        // Check for Special Badge Words (Random injection)
        const r = Math.random();
        const { CAKE, LLAMA, POTATO, SQUIRREL, MASON } = CONFIG.SPECIAL;
        const b = State.data.badges;
        let sp = null;

        if (!b.cake && r < CAKE.prob) sp = CAKE.text;
        else if (!b.llama && r < CAKE.prob + LLAMA.prob) sp = LLAMA.text;
        else if (!b.potato && r < CAKE.prob + LLAMA.prob + POTATO.prob) sp = POTATO.text;
        else if (!b.squirrel && r < CAKE.prob + LLAMA.prob + POTATO.prob + SQUIRREL.prob) sp = SQUIRREL.text;
        else if (!b.bone && r < CAKE.prob + LLAMA.prob + POTATO.prob + SQUIRREL.prob + MASON.prob) sp = MASON.text;

        if (sp) {
            const i = p.findIndex(w => w.text.toUpperCase() === sp);
            if (i !== -1 && i !== State.runtime.currentWordIndex) {
                State.runtime.currentWordIndex = i;
                UIManager.displayWord(p[i]);
                return;
            }
        }

        // Weighted Random Selection (Prioritize words user hasn't seen recently + Boost special words)
        let av = p.reduce((acc, w, i) => {
            if (!State.data.seenHistory.includes(i) && i !== State.runtime.currentWordIndex) {
                acc.push({ i, v: (w.goodVotes || 0) + (w.badVotes || 0) });
            }
            return acc;
        }, []);

        // Fallback if all words seen
        if (!av.length) av = p.map((w, i) => ({ i, v: (w.goodVotes || 0) + (w.badVotes || 0) })).filter(x => x.i !== State.runtime.currentWordIndex);

        let tw = 0;
        av = av.map(c => {
            let w = 1.0 / (c.v + 1); // Inverse weight (less votes = higher chance)
            if (p[c.i].text.toUpperCase() === CAKE.text) w *= CONFIG.BOOST_FACTOR;
            tw += w;
            return { i: c.i, w };
        });

        let rnd = Math.random() * tw;
        let sel = av[av.length - 1].i;

        for (let it of av) {
            rnd -= it.w;
            if (rnd <= 0) {
                sel = it.i;
                break;
            }
        }

        State.runtime.currentWordIndex = sel;
        State.data.seenHistory.push(sel);
        if (State.data.seenHistory.length > CONFIG.HISTORY_SIZE) State.data.seenHistory.shift();
        State.save('seenHistory', State.data.seenHistory);
        
        UIManager.displayWord(p[sel]);
    },

    loadSpecial(t) {
        const i = State.runtime.allWords.findIndex(w => w.text.toUpperCase() === t);
        if (i !== -1) {
            State.runtime.currentWordIndex = i;
            UIManager.displayWord(State.runtime.allWords[i]);
        }
    },

    handleCooldown() {
        State.runtime.isCoolingDown = true;
        const t = CONFIG.VOTE.COOLDOWN_TIERS;
        let r = t[Math.min(State.runtime.mashLevel, t.length - 1)];
        
        UIManager.showMessage(`Mashing detected. Wait ${r}s...`, true);
        
        State.runtime.cooldownTimer = setInterval(() => {
            r--;
            if (r > 0) UIManager.showMessage(`Wait ${r}s...`, true);
            else {
                clearInterval(State.runtime.cooldownTimer);
                State.runtime.isCoolingDown = false;
                State.runtime.streak = 0;
                State.runtime.mashLevel++;
                UIManager.displayWord(State.runtime.allWords[State.runtime.currentWordIndex]);
            }
        }, 1000);
    },

    async vote(t, s = false) {
        if (State.runtime.isCoolingDown) return;

        // Anti-Mashing Logic
        const n = Date.now();
        if (State.runtime.lastVoteTime > 0 && (n - State.runtime.lastVoteTime) > CONFIG.VOTE.STREAK_WINDOW) {
            State.runtime.streak = 1;
        } else {
            State.runtime.streak++;
        }
        State.runtime.lastVoteTime = n;
        
        if (State.runtime.streak > CONFIG.VOTE.MASH_LIMIT) {
            this.handleCooldown();
            return;
        }

        const w = State.runtime.allWords[State.runtime.currentWordIndex];
        const up = w.text.toUpperCase();
        const { CAKE, LLAMA, POTATO, SQUIRREL, MASON } = CONFIG.SPECIAL;
        
        UIManager.disableButtons(true);
        const wd = DOM.game.wordDisplay;
        const colors = Accessibility.getColors();
        
        // --- Visual Feedback (Swipe/Click) ---
        if (!s && (t === 'good' || t === 'bad')) {
            // Clean inline styles first
            wd.style.animation = 'none';
            wd.style.transform = 'none';

            wd.style.setProperty('--dynamic-swipe-color', t === 'good' ? colors.good : colors.bad);
            wd.classList.add('override-theme-color', 'color-fade');
            wd.style.color = t === 'good' ? colors.good : colors.bad;
            
            await new Promise(r => setTimeout(r, 50));
            
            wd.classList.remove('color-fade');
            wd.classList.add(t === 'good' ? 'animate-fly-left' : 'animate-fly-right');
            
            if (t === 'good') SoundManager.playGood();
            else SoundManager.playBad();
        }

        // --- Handle Special Word Effects ---
        const handleSpecial = (c, k) => {
            State.unlockBadge(k);
            
            // Clean styles specifically for special animation
            wd.style.animation = 'none';
            wd.className = 'font-extrabold text-gray-900 text-center min-h-[72px]';
            
            wd.classList.add(c.text === 'LLAMA' ? 'word-fade-llama' : 'word-fade-quick');
            
            setTimeout(() => {
                wd.className = '';
                wd.style.opacity = '1';
                wd.style.transform = 'none';
                UIManager.showMessage(c.msg, false);
                
                setTimeout(() => {
                    this.nextWord();
                    this.refreshData(false);
                }, c.dur);
            }, c.fade);
        };

        if (up === CAKE.text) { handleSpecial(CAKE, 'cake'); return; }
        if (up === LLAMA.text) { handleSpecial(LLAMA, 'llama'); return; }
        if (up === POTATO.text) { handleSpecial(POTATO, 'potato'); return; }
        if (up === SQUIRREL.text) { handleSpecial(SQUIRREL, 'squirrel'); return; }
        if (up === MASON.text) { handleSpecial(MASON, 'bone'); return; }

        try {
            // Check for Theme Unlock
            const unlocked = ThemeManager.checkUnlock(up);
            if (unlocked) SoundManager.playUnlock();

            const res = await API.vote(w._id, t);
            if (res.status !== 403 && !res.ok) throw new Error("Vote API Error");

            // Optimistic Update
            w[`${t}Votes`] = (w[`${t}Votes`] || 0) + 1;
            State.incrementVote();

            // Daily Mode Logic
            if (State.runtime.isDailyMode) {
                const tod = new Date();
                const dStr = tod.toISOString().split('T')[0];
                const last = State.data.daily.lastDate;
                let s = State.data.daily.streak;
                
                if (last) {
                    const yd = new Date();
                    yd.setDate(yd.getDate() - 1);
                    if (last === yd.toISOString().split('T')[0]) s++;
                    else s = 1;
                } else s = 1;
                
                State.save('daily', { streak: s, lastDate: dStr });
                DOM.daily.streakResult.textContent = '🔥 ' + s;
                
                const { topGood } = UIManager.getRankedLists(0);
                const rank = topGood.findIndex(x => x.text === w.text) + 1;
                DOM.daily.worldRank.textContent = rank > 0 ? '#' + rank : 'Unranked';
                
                this.checkDailyStatus();
                setTimeout(() => ModalManager.toggle('dailyResult', true), 600);
            }

            // Messages
            let m = '';
            if (unlocked) m = "🎉 New Theme Unlocked!";
            else if (State.data.settings.showPercentages && (t === 'good' || t === 'bad')) {
                const tot = (w.goodVotes || 0) + (w.badVotes || 0);
                const p = Math.round((w[`${t}Votes`] / tot) * 100);
                m = `${t==='good'?'Good':'Bad'} vote! ${p}% agree.`;
            }
            
            if (State.data.settings.showTips) {
                State.save('voteCounterForTips', State.data.voteCounterForTips + 1);
                if (State.data.voteCounterForTips % CONFIG.TIP_COOLDOWN === 0) {
                    m = CONFIG.TIPS[Math.floor(Math.random() * CONFIG.TIPS.length)];
                }
            }
            
            UIManager.showPostVoteMessage(m);
            UIManager.updateStats();

            // Transition to Next Word
            setTimeout(() => {
                wd.classList.remove('animate-fly-left', 'animate-fly-right', 'swipe-good-color', 'swipe-bad-color', 'override-theme-color');
                wd.style.transform = '';
                wd.style.opacity = '1';
                wd.style.color = '';
                
                if (!State.runtime.isDailyMode) {
                    this.nextWord();
                    this.refreshData(false);
                }
            }, (t === 'good' || t === 'bad') ? 600 : 0);

        } catch (e) {
            UIManager.showMessage("Vote Failed", true);
            wd.classList.remove('animate-fly-left', 'animate-fly-right', 'swipe-good-color', 'swipe-bad-color', 'override-theme-color');
            UIManager.disableButtons(false);
        }
    },
    
    // Bridge method for definition API
    async showDefinition() {
        const w = State.runtime.allWords[State.runtime.currentWordIndex];
        if (!w) return;
        
        ModalManager.toggle('definition', true);
        document.getElementById('definitionWord').textContent = w.text.toUpperCase();
        const d = document.getElementById('definitionResults');
        d.innerHTML = 'Loading...';
        
        try {
            const r = await API.define(w.text);
            if (!r.ok) throw new Error();
            const j = await r.json();
            
            let h = '';
            j[0].meanings.forEach(m => {
                h += `<div class="mb-4"><h4 class="text-lg font-bold italic text-indigo-600">${m.partOfSpeech}</h4><ol class="list-decimal list-inside pl-4 mt-2 space-y-1">`;
                m.definitions.forEach(def => {
                    h += `<li>${def.definition}</li>`;
                    if (def.example) h += `<p class="text-sm text-gray-500 pl-4 italic">"${def.example}"</p>`;
                });
                h += '</ol></div>';
            });
            d.innerHTML = h;
        } catch {
            d.innerHTML = '<p class="text-red-500">Definition not found.</p>';
        }
    }
};