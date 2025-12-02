import { CONFIG } from './config.js';
import { DOM, UIManager, ModalManager } from './ui.js';
import { State } from './state.js';
import { Accessibility, Utils, SoundManager, API } from './utils.js';
import { MosquitoManager } from './effects.js';
import { ThemeManager } from './theme.js';

const InputHandler = {
    sX: 0,
    sY: 0,
    drag: false,
    scroll: false,
    raf: null,
    init() {
        const c = DOM.game.card,
            wd = DOM.game.wordDisplay;
        c.addEventListener('touchstart', e => {
            if (State.runtime.isCoolingDown || DOM.game.buttons.good.disabled) return;
            if (e.target.closest('button, input, select')) return;
            this.sX = e.touches[0].clientX;
            this.sY = e.touches[0].clientY;
            this.drag = false;
            this.scroll = false;
            wd.style.transition = 'none';
            wd.style.animation = 'none'
        }, { passive: false });
        c.addEventListener('touchmove', e => {
            if (State.runtime.isCoolingDown || DOM.game.buttons.good.disabled) return;
            const x = e.touches[0].clientX,
                y = e.touches[0].clientY,
                dX = x - this.sX,
                dY = y - this.sY;
            if (!this.drag && !this.scroll) {
                if (Math.abs(dY) > Math.abs(dX)) {
                    this.scroll = true;
                    return
                }
                this.drag = true;
                Game.cleanStyles(wd);
                wd.style.background = 'none';
                wd.style.webkitTextFillColor = 'initial'
            }
            if (this.scroll) return;
            if (this.drag) {
                e.preventDefault();
                if (this.raf) cancelAnimationFrame(this.raf);
                this.raf = requestAnimationFrame(() => {
                    wd.style.transform = `translate(${dX}px, ${dY*.8}px) rotate(${dX*.05}deg)`;
                    const colors = Accessibility.getColors();
                    const col = dX < 0 ? colors.good : colors.bad;
                    const alpha = Math.min(Math.abs(dX) / 150, 1);
                    wd.style.setProperty('--dynamic-swipe-color', Utils.hexToRgba(col, alpha));
                    if (State.data.settings.colorblindMode) {
                        const rgb = dX < 0 ? '59, 130, 246' : '249, 115, 22';
                        wd.style.setProperty('--dynamic-swipe-color', `rgba(${rgb}, ${alpha})`)
                    }
                    wd.classList.add('override-theme-color')
                })
            }
        }, { passive: false });
        c.addEventListener('touchend', e => {
            if (!this.drag) return;
            const dX = e.changedTouches[0].clientX - this.sX;
            wd.classList.remove('override-theme-color');
            if (this.raf) cancelAnimationFrame(this.raf);
            
            if (Math.abs(dX) > CONFIG.VOTE.SWIPE_THRESHOLD) {
                let l = dX < 0;
                if (State.data.settings.mirrorMode) l = !l; 

                wd.style.transition = 'transform .4s ease-out, opacity .4s ease-out';
                const exitX = l ? -window.innerWidth : window.innerWidth;
                const rot = l ? -20 : 20; 
                
                wd.style.transform = `translate(${exitX}px, 0px) rotate(${rot}deg)`;
                wd.style.opacity = '0';
                
                const colors = Accessibility.getColors();
                wd.style.color = l ? colors.good : colors.bad;
                
                SoundManager.playWhoosh();
                Game.vote(l ? 'good' : 'bad', true)
            } else {
                wd.classList.add('word-reset');
                wd.style.transform = 'translate(0,0) rotate(0)';
                wd.style.color = '';
                setTimeout(() => {
                    wd.classList.remove('word-reset');
                    UIManager.displayWord(State.runtime.allWords[State.runtime.currentWordIndex])
                }, 300)
            }
            this.drag = false;
            this.scroll = false
        }, false)
    }
};

export const Game = {
    cleanStyles(e) {
        e.style.animation = 'none';
        e.style.background = 'none';
        e.style.webkitTextFillColor = 'initial';
        e.style.textShadow = 'none';
        e.style.transform = 'none';
        e.style.filter = 'none';
        e.style.color = ''
    },
    async init() {
        Accessibility.apply(UIManager);
        DOM.general.version.textContent = `v${CONFIG.APP_VERSION}`;
        DOM.game.buttons.good.onclick = () => this.vote('good');
        DOM.game.buttons.bad.onclick = () => this.vote('bad');
        DOM.game.buttons.notWord.onclick = () => this.vote('notWord');
        DOM.game.dailyBanner.onclick = () => this.activateDailyMode();
        
        document.getElementById('submitWordButton').onclick = async () => {
            const t = DOM.inputs.newWord.value.trim();
            if (!t || t.includes(' ') || t.length > 45) {
                DOM.inputs.modalMsg.textContent = "Invalid word.";
                return
            }
            const btn = document.getElementById('submitWordButton');
            btn.disabled = true;
            try {
                const r = await API.submitWord(t);
                if (r.status === 201) {
                    State.incrementContributor();
                    DOM.inputs.modalMsg.textContent = "Success! Your new word has been added!";
                    setTimeout(() => {
                        ModalManager.toggle('submission', false);
                        this.refreshData()
                    }, 1000)
                } else {
                    const d = await r.json();
                    DOM.inputs.modalMsg.textContent = d.message || "Error"
                }
            } catch (e) {
                DOM.inputs.modalMsg.textContent = "Network Error"
            }
            btn.disabled = false
        };

        document.getElementById('runComparisonButton').onclick = async () => {
            const w1 = DOM.inputs.wordOne.value.trim(),
                w2 = DOM.inputs.wordTwo.value.trim();
            if (!w1 && !w2) {
                DOM.inputs.compareResults.innerHTML = '<span class="text-red-500">Please enter at least one word.</span>';
                return
            }
            DOM.inputs.compareResults.innerHTML = '<span class="text-gray-500 animate-pulse">Analyzing words...</span>';
            const gd = async w => {
                if (w.includes(' ') || w.length > 45) return { t: w, valid: false, err: 'Invalid word.' };
                const e = State.runtime.allWords.find(x => x.text.toUpperCase() === w.toUpperCase());
                if (e) return { t: e.text, valid: true, exists: true, d: e };
                const r = await API.submitWord(w);
                if (r.status === 201) {
                    State.incrementContributor();
                    return { t: w.toUpperCase(), valid: true, exists: false, isNew: true }
                }
                return { t: w, valid: false, err: 'Could not fetch data.' }
            };
            const res = [];
            if (w1) res.push(await gd(w1));
            if (w2) res.push(await gd(w2));
            if (res.some(r => r.isNew)) this.refreshData(false);
            if (res.some(r => !r.valid)) {
                DOM.inputs.compareResults.innerHTML = res.map(r => !r.valid ? `<p class="text-red-500 mb-2"><strong>${r.t}</strong>: ${r.err}</p>` : '').join('');
                return
            }
            const st = res.map(r => {
                if (r.isNew) return { text: r.t.toUpperCase(), score: 0, good: 0, bad: 0, total: 0, approval: 0, isNew: true };
                const g = r.d.goodVotes || 0,
                    b = r.d.badVotes || 0,
                    t = g + b;
                return {
                    text: r.t.toUpperCase(),
                    score: g - b,
                    good: g,
                    bad: b,
                    total: t,
                    approval: t > 0 ? Math.round((g / t) * 100) : 0,
                    isNew: false
                }
            });
            let h = '';
            if (st.length === 2) {
                const [s1, s2] = st;
                let wi = -1;
                if (s1.score !== s2.score) wi = s1.score > s2.score? 0 : 1;
                h = `<div class="flex flex-col md:flex-row gap-4 w-full justify-center items-stretch">`;
                st.forEach((s, i) => {
                    const iw = i === wi,
                        il = wi !== -1 && !iw,
                        bc = iw ? 'border-yellow-400 bg-yellow-50 shadow-xl scale-105 z-10' : 'border-gray-200 bg-white',
                        oc = il ? 'opacity-70 grayscale-[0.3]' : '';
                    h += `<div class="flex-1 p-4 rounded-xl border-2 ${bc} ${oc} flex flex-col items-center transition-all duration-300">${iw?'<div class="text-2xl mb-2">🏆</div>':'<div class="h-8 mb-2"></div>'}<h3 class="text-xl font-black text-gray-800 mb-1">${s.text}</h3>${iw?'<span class="bg-yellow-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-2">WINNER</span>':''}${s.isNew?'<span class="bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded mb-2">New!</span>':''}<div class="text-3xl font-bold ${s.score>=0?'text-green-600':'text-red-600'} mb-4">${s.score}</div><div class="w-full space-y-2"><div class="flex justify-between text-xs text-gray-500"><span>Approval</span><span>${s.approval}%</span></div><div class="w-full bg-gray-200 rounded-full h-2.5"><div class="bg-blue-500 h-2.5 rounded-full" style="width: ${s.approval}%"></div></div><div class="flex justify-between text-xs pt-1"><span class="text-green-600 font-bold">+${s.good}</span><span class="text-red-600 font-bold">-${s.bad}</span></div></div></div>`;
                    if (i === 0) h += `<div class="flex items-center justify-center font-black text-gray-300 md:px-2">VS</div>`
                });
                h += '</div>'
            } else {
                const s = st[0];
                h = `<div class="p-4 rounded-xl border border-gray-200 bg-white flex flex-col items-center w-full max-w-xs mx-auto"><h3 class="text-xl font-black text-gray-800 mb-2">${s.text}</h3>${s.isNew?'<span class="bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded mb-2">Newly Added!</span>':''}<div class="text-4xl font-bold ${s.score>=0?'text-green-600':'text-red-600'} mb-4">${s.score}</div><div class="w-full space-y-2"><div class="flex justify-between text-xs text-gray-500"><span>Approval Rating</span><span>${s.approval}%</span></div><div class="w-full bg-gray-200 rounded-full h-2.5"><div class="bg-blue-500 h-2.5 rounded-full" style="width: ${s.approval}%"></div></div><div class="flex justify-between text-xs pt-1"><span class="text-green-600 font-bold">+${s.good} Votes</span><span class="text-red-600 font-bold">-${s.bad} Votes</span></div></div></div>`
            }
            DOM.inputs.compareResults.innerHTML = h
        };
        
        DOM.theme.chooser.onchange = e => ThemeManager.apply(e.target.value, true);
        document.getElementById('clearAllDataButton').onclick = State.clearAll;
        InputHandler.init();
        ThemeManager.init();
        ModalManager.init();
		UIManager.updateProfileDisplay();
        MosquitoManager.startMonitoring();
        this.checkDailyStatus();
        await this.refreshData()
    },
    checkDailyStatus() {
        const t = new Date().toISOString().split('T')[0];
        const l = State.data.daily.lastDate;
        if (t === l) {
            DOM.game.dailyStatus.textContent = "Come back tomorrow!";
            DOM.game.dailyBanner.style.display = 'none'
        } else {
            DOM.game.dailyStatus.textContent = "Vote Now!";
            DOM.game.dailyBanner.style.display = 'block'
        }
    },
    activateDailyMode() {
        if (State.runtime.isDailyMode) return;
        const now = new Date();
        const t = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
        if (t === State.data.daily.lastDate) return;
        State.runtime.isDailyMode = true;
        DOM.game.dailyBanner.classList.add('daily-locked-mode');
        DOM.game.buttons.notWord.style.display = 'none';
        DOM.game.buttons.custom.style.display = 'none';
        UIManager.showMessage('Loading Daily Word...');
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
            } else {
                UIManager.showMessage("Error finding word");
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
        this.nextWord()
    },
    async refreshData(u = true) {
        if (u) UIManager.showMessage("Loading...");
        const d = await API.fetchWords();
        if (d) {
            let words = d.filter(w => (w.notWordVotes || 0) < 3);
            if (State.data.settings.zeroVotesOnly) {
                words = words.filter(w => (w.goodVotes || 0) === 0 && (w.badVotes || 0) === 0);
            }
            State.runtime.allWords = words;
            UIManager.updateStats();
            if (u && !State.runtime.isDailyMode) this.nextWord()
        } else UIManager.showMessage("Connection Error", true)
    },
    nextWord() {
        const p = State.runtime.allWords;
        if (!p.length) return;
        const r = Math.random(),
            { CAKE, LLAMA, POTATO, SQUIRREL, MASON } = CONFIG.SPECIAL,
            b = State.data.badges;
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
                return
            }
        }
        let av = p.reduce((acc, w, i) => {
            if (!State.data.seenHistory.includes(i) && i !== State.runtime.currentWordIndex) acc.push({ i, v: (w.goodVotes || 0) + (w.badVotes || 0) });
            return acc
        }, []);
        if (!av.length) av = p.map((w, i) => ({ i, v: (w.goodVotes || 0) + (w.badVotes || 0) })).filter(x => x.i !== State.runtime.currentWordIndex);
        let tw = 0;
        av = av.map(c => {
            let w = 1.0 / (c.v + 1);
            if (p[c.i].text.toUpperCase() === CAKE.text) w *= CONFIG.BOOST_FACTOR;
            tw += w;
            return { i: c.i, w }
        });
        let rnd = Math.random() * tw,
            sel = av[av.length - 1].i;
        for (let it of av) {
            rnd -= it.w;
            if (rnd <= 0) {
                sel = it.i;
                break
            }
        }
        State.runtime.currentWordIndex = sel;
        State.data.seenHistory.push(sel);
        if (State.data.seenHistory.length > CONFIG.HISTORY_SIZE) State.data.seenHistory.shift();
        State.save('seenHistory', State.data.seenHistory);
        UIManager.displayWord(p[sel])
    },
    loadSpecial(t) {
        const i = State.runtime.allWords.findIndex(w => w.text.toUpperCase() === t);
        if (i !== -1) {
            State.runtime.currentWordIndex = i;
            UIManager.displayWord(State.runtime.allWords[i])
        }
    },
    async showDefinition() {
        const w = State.runtime.allWords[State.runtime.currentWordIndex];
        if (!w) return;
        ModalManager.toggle('definition', true);
        document.getElementById('definitionWord').textContent = w.text.toUpperCase();
        const d = document.getElementById('definitionResults');
        d.innerHTML = 'Loading...';
        try {
            const r = await API.define(w.text);
            if (!r.ok) throw 0;
            const j = await r.json();
            let h = '';
            j[0].meanings.forEach(m => {
                h += `<div class="mb-4"><h4 class="text-lg font-bold italic text-indigo-600">${m.partOfSpeech}</h4><ol class="list-decimal list-inside pl-4 mt-2 space-y-1">`;
                m.definitions.forEach(def => {
                    h += `<li>${def.definition}</li>`;
                    if (def.example) h += `<p class="text-sm text-gray-500 pl-4 italic">"${def.example}"</p>`
                });
                h += '</ol></div>'
            });
            d.innerHTML = h
        } catch {
            d.innerHTML = '<p class="text-red-500">Definition not found.</p>'
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
                UIManager.displayWord(State.runtime.allWords[State.runtime.currentWordIndex])
            }
        }, 1000)
    },
    async vote(t, s = false) {
        if (State.runtime.isCoolingDown) return;
        const n = Date.now();
        if (State.runtime.lastVoteTime > 0 && (n - State.runtime.lastVoteTime) > CONFIG.VOTE.STREAK_WINDOW) State.runtime.streak = 1;
        else State.runtime.streak++;
        State.runtime.lastVoteTime = n;
        if (State.runtime.streak > CONFIG.VOTE.MASH_LIMIT) {
            this.handleCooldown();
            return
        }
        const w = State.runtime.allWords[State.runtime.currentWordIndex],
            up = w.text.toUpperCase(),
            { CAKE, LLAMA, POTATO, SQUIRREL, MASON } = CONFIG.SPECIAL;
        UIManager.disableButtons(true);
        const wd = DOM.game.wordDisplay;
        const colors = Accessibility.getColors();
        
        if (!s && (t === 'good' || t === 'bad')) {
            this.cleanStyles(wd);
            wd.style.setProperty('--dynamic-swipe-color', t === 'good' ? colors.good : colors.bad);
            wd.classList.add('override-theme-color', 'color-fade');
            wd.style.color = t === 'good' ? colors.good : colors.bad;
            await new Promise(r => setTimeout(r, 50));
            wd.classList.remove('color-fade');
            wd.classList.add(t === 'good' ? 'animate-fly-left' : 'animate-fly-right');
            
            if (t === 'good') SoundManager.playGood();
            else SoundManager.playBad();
        }
        
        const hSpec = (c, k) => {
            State.unlockBadge(k);
            this.cleanStyles(wd);
            wd.className = 'font-extrabold text-gray-900 text-center min-h-[72px]';
            wd.classList.add(c.text === 'LLAMA' ? 'word-fade-llama' : 'word-fade-quick');
            setTimeout(() => {
                wd.className = '';
                wd.style.opacity = '1';
                wd.style.transform = 'none';
                UIManager.showMessage(c.msg, false);
                setTimeout(() => {
                    this.nextWord();
                    this.refreshData(false)
                }, c.dur)
            }, c.fade)
        };
        
        if (up === CAKE.text) { hSpec(CAKE, 'cake'); return }
        if (up === LLAMA.text) { hSpec(LLAMA, 'llama'); return }
        if (up === POTATO.text) { hSpec(POTATO, 'potato'); return }
        if (up === SQUIRREL.text) { hSpec(SQUIRREL, 'squirrel'); return }
        if (up === MASON.text) { hSpec(MASON, 'bone'); return }
        
        try {
            const un = ThemeManager.checkUnlock(up);
            if (un) SoundManager.playUnlock();

            const res = await API.vote(w._id, t);
            if (res.status !== 403 && !res.ok) throw 0;
            w[`${t}Votes`] = (w[`${t}Votes`] || 0) + 1;
            State.incrementVote();
            
            if (State.runtime.isDailyMode) {
                const tod = new Date(),
                    dStr = tod.toISOString().split('T')[0];
                const last = State.data.daily.lastDate;
                let s = State.data.daily.streak;
                if (last) {
                    const yd = new Date();
                    yd.setDate(yd.getDate() - 1);
                    if (last === yd.toISOString().split('T')[0]) s++;
                    else s = 1
                } else s = 1;
                State.save('daily', { streak: s, lastDate: dStr });
                DOM.daily.streakResult.textContent = '🔥 ' + s;
                const { topGood } = UIManager.getRankedLists(0);
                const rank = topGood.findIndex(x => x.text === w.text) + 1;
                DOM.daily.worldRank.textContent = rank > 0 ? '#' + rank : 'Unranked';
                this.checkDailyStatus();
                setTimeout(() => ModalManager.toggle('dailyResult', true), 600)
            }
            let m = '';
            if (un) m = "🎉 New Theme Unlocked!";
            else if (State.data.settings.showPercentages && (t === 'good' || t === 'bad')) {
                const tot = (w.goodVotes || 0) + (w.badVotes || 0),
                    p = Math.round((w[`${t}Votes`] / tot) * 100);
                m = `${t==='good'?'Good':'Bad'} vote! ${p}% agree.`
            }
            if (State.data.settings.showTips) {
                State.save('voteCounterForTips', State.data.voteCounterForTips + 1);
                if (State.data.voteCounterForTips % CONFIG.TIP_COOLDOWN === 0) m = CONFIG.TIPS[Math.floor(Math.random() * CONFIG.TIPS.length)]
            }
            UIManager.showPostVoteMessage(m);
            UIManager.updateStats();
            setTimeout(() => {
                wd.classList.remove('animate-fly-left', 'animate-fly-right', 'swipe-good-color', 'swipe-bad-color', 'override-theme-color');
                wd.style.transform = '';
                wd.style.opacity = '1';
                wd.style.color = '';
                if (!State.runtime.isDailyMode) {
                    this.nextWord();
                    this.refreshData(false)
                }
            }, (t === 'good' || t === 'bad') ? 600 : 0)
        } catch (e) {
            UIManager.showMessage("Vote Failed", true);
            wd.classList.remove('animate-fly-left', 'animate-fly-right', 'swipe-good-color', 'swipe-bad-color', 'override-theme-color');
            UIManager.disableButtons(false)
        }
    }
};

window.onload = Game.init.bind(Game);