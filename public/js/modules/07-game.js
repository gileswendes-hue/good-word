/**
 * ============================================================================
 * GOOD WORD / BAD WORD - GAME MODULE (07-game.js)
 * ============================================================================
 * 
 * Contains:
 * - Game: Core game logic
 *   - init, refreshData, nextWord
 *   - handleVote, animateVote
 *   - checkSpecialWord, activateDailyMode
 *   - setupSwipeHandlers, setupKeyboardShortcuts
 *   - cleanStyles, setRandomFavicon
 *   - openArcade
 * - ContactManager: Support modal
 * - PinPad: Kids mode PIN
 * - SeededShuffle: Daily mode deterministic shuffle
 * - LocalPeerManager, RoomManager: P2P multiplayer
 * 
 * Dependencies: 01-core.js through 06-ui.js
 * ============================================================================
 */

(function() {
'use strict';

const Game = {
    async init() {
        this.setRandomFavicon();
        window.DOM = loadDOM();
        try {
            const vEl = document.querySelector('.version-indicator');
            if (vEl) {
                vEl.textContent = `v${CONFIG.APP_VERSION} | Made by Gilxs since 12,025`;
                Object.assign(vEl.style, {
                    position: 'fixed', bottom: '15px', left: '50%', transform: 'translateX(-50%)',
                    zIndex: '5', pointerEvents: 'none', fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontSize: '11px', fontWeight: '600', color: '#374151', letterSpacing: '0.05em',
                    backgroundColor: 'rgba(255, 255, 255, 0.92)', padding: '6px 14px',
                    borderRadius: '9999px', border: '1px solid rgba(0,0,0,0.1)', width: 'max-content',
                    textShadow: 'none', opacity: '1', mixBlendMode: 'normal'
                });
            }
            Accessibility.apply();
            try { SoundManager.init(); } catch(e) { console.warn("Audio init deferred"); }
            if (typeof this.updateLights === 'function') this.updateLights();
            UIManager.updateOfflineIndicator();
            window.StreakManager = StreakManager;
            window.ContactManager = ContactManager;
            window.PinPad = PinPad;
            window.TipManager = TipManager;
            window.RoomManager = RoomManager;
            window.UIManager = UIManager;
            if (DOM.game.buttons.good) DOM.game.buttons.good.onclick = () => this.vote('good');
            if (DOM.game.buttons.bad) DOM.game.buttons.bad.onclick = () => this.vote('bad');
            if (DOM.game.buttons.notWord) DOM.game.buttons.notWord.onclick = () => this.vote('notWord');
            if (DOM.game.dailyBanner) DOM.game.dailyBanner.onclick = () => this.activateDailyMode();
            document.addEventListener('keydown', (e) => {
                if (e.target.matches('input, textarea')) return;
                if (DOM.game.buttons.good.disabled) return;
                const openModals = DOM.modals && Object.values(DOM.modals).some(m => m && !m.classList.contains('hidden'));
                if (openModals) return;
                if (document.getElementById('tipModal') && !document.getElementById('tipModal').classList.contains('hidden')) return;
                if (document.getElementById('contactModal') && !document.getElementById('contactModal').classList.contains('hidden')) return;
                if (document.getElementById('pinPadModal') && !document.getElementById('pinPadModal').classList.contains('hidden')) return;
                if (document.getElementById('mpMenu')) return;
                if (document.getElementById('lobbyModal')) return;
                switch(e.code) {
                    case 'ArrowLeft':
                        this.vote('good');
                        DOM.game.buttons.good.classList.add('active-press');
                        setTimeout(() => DOM.game.buttons.good.classList.remove('active-press'), 150);
                        break;
                    case 'ArrowRight':
                        this.vote('bad');
                        DOM.game.buttons.bad.classList.add('active-press');
                        setTimeout(() => DOM.game.buttons.bad.classList.remove('active-press'), 150);
                        break;
                }
            });
            const qrGood = document.getElementById('qrGoodBtn');
            const qrBad = document.getElementById('qrBadBtn');
            if (qrGood) qrGood.onclick = (e) => { if (!DOM.game.buttons.good.disabled && !State.runtime.isCoolingDown) { e.stopPropagation(); ShareManager.shareQR('good'); }};
            if (qrBad) qrBad.onclick = (e) => { if (!DOM.game.buttons.good.disabled && !State.runtime.isCoolingDown) { e.stopPropagation(); ShareManager.shareQR('bad'); }};
            document.getElementById('showHelpButton').onclick = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); UIManager.showPostVoteMessage("What's going on? There aren't really any rules, but if you're really confused then drop me a message and I'll see if I can help!"); };
            document.getElementById('showDonateButton').onclick = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); UIManager.showPostVoteMessage("That's very kind, but I'm not accepting any donations at the moment. Have fun!"); };
            document.getElementById('submitWordButton').onclick = async () => {
                const t = DOM.inputs.newWord.value.trim();
                if (!t || t.includes(' ') || t.length > 45) { DOM.inputs.modalMsg.textContent = "Invalid word."; return }
                const btn = document.getElementById('submitWordButton'); btn.disabled = true;
                try { const r = await API.submitWord(t); if (r.status === 201) { State.incrementContributor(); DOM.inputs.modalMsg.textContent = "Success! Your new word has been added!"; setTimeout(() => { ModalManager.toggle('submission', false); this.refreshData() }, 1000) } else { const d = await r.json(); DOM.inputs.modalMsg.textContent = d.message || "Word already exists in dictionary!" } } catch (e) { DOM.inputs.modalMsg.textContent = "Network Error" }
                btn.disabled = false
            };
            document.getElementById('runComparisonButton').onclick = async () => {
                const w1 = DOM.inputs.wordOne.value.trim(), w2 = DOM.inputs.wordTwo.value.trim();
                if (!w1 && !w2) { DOM.inputs.compareResults.innerHTML = '<span class="text-red-500">Please enter at least one word.</span>'; return }
                DOM.inputs.compareResults.innerHTML = '<span class="text-gray-500 animate-pulse">Analyzing words...</span>';
                const gd = async w => { if (w.includes(' ') || w.length > 45) return { t: w, valid: false, err: 'Invalid word.' }; const e = State.runtime.allWords.find(x => x.text.toUpperCase() === w.toUpperCase()); if (e) return { t: e.text, valid: true, exists: true, d: e }; const r = await API.submitWord(w); if (r.status === 201) { State.incrementContributor(); return { t: w.toUpperCase(), valid: true, exists: false, isNew: true } } return { t: w, valid: false, err: 'Could not fetch data.' } };
                const res = []; if (w1) res.push(await gd(w1)); if (w2) res.push(await gd(w2)); if (res.some(r => r.isNew)) this.refreshData(false);
                if (res.some(r => !r.valid)) { DOM.inputs.compareResults.innerHTML = res.map(r => !r.valid ? `<p class="text-red-500 mb-2"><strong>${r.t}</strong>: ${r.err}</p>` : '').join(''); return }
                const st = res.map(r => { if (r.isNew) return { text: r.t.toUpperCase(), score: 0, good: 0, bad: 0, total: 0, approval: 0, isNew: true }; const g = r.d.goodVotes || 0, b = r.d.badVotes || 0, t = g + b; return { text: r.t.toUpperCase(), score: g - b, good: g, bad: b, total: t, approval: t > 0 ? Math.round((g / t) * 100) : 0, isNew: false } });
                let h = '';
                if (st.length === 2) {
                    const [s1, s2] = st; let wi = -1; if (s1.score !== s2.score) wi = s1.score > s2.score? 0 : 1;
                    h = `<div class="flex flex-col md:flex-row gap-4 w-full justify-center items-stretch">`;
                    st.forEach((s, i) => { const iw = i === wi, il = wi !== -1 && !iw, bc = iw ? 'border-yellow-400 bg-yellow-50 shadow-xl scale-105 z-10' : 'border-gray-200 bg-white', oc = il ? 'opacity-70 grayscale-[0.3]' : ''; h += `<div class="flex-1 p-4 rounded-xl border-2 ${bc} ${oc} flex flex-col items-center transition-all duration-300">${iw?'<div class="text-2xl mb-2">🏆</div>':'<div class="h-8 mb-2"></div>'}<h3 class="text-xl font-black text-gray-800 mb-1">${s.text}</h3>${iw?'<span class="bg-yellow-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-2">WINNER</span>':''}${s.isNew?'<span class="bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded mb-2">New!</span>':''}<div class="text-3xl font-bold ${s.score>=0?'text-green-600':'text-red-600'} mb-4">${s.score}</div><div class="w-full space-y-2"><div class="flex justify-between text-xs text-gray-500"><span>Approval</span><span>${s.approval}%</span></div><div class="w-full bg-gray-200 rounded-full h-2.5"><div class="bg-blue-500 h-2.5 rounded-full" style="width: ${s.approval}%"></div></div><div class="flex justify-between text-xs pt-1"><span class="text-green-600 font-bold">+${s.good}</span><span class="text-red-600 font-bold">-${s.bad}</span></div></div></div>`; if (i === 0) h += `<div class="flex items-center justify-center font-black text-gray-300 md:px-2">VS</div>` }); h += '</div>'
                } else { const s = st[0]; h = `<div class="p-4 rounded-xl border border-gray-200 bg-white flex flex-col items-center w-full max-w-xs mx-auto"><h3 class="text-xl font-black text-gray-800 mb-2">${s.text}</h3>${s.isNew?'<span class="bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded mb-2">Newly Added!</span>':''}<div class="text-4xl font-bold ${s.score>=0?'text-green-600':'text-red-600'} mb-4">${s.score}</div><div class="w-full space-y-2"><div class="flex justify-between text-xs text-gray-500"><span>Approval Rating</span><span>${s.approval}%</span></div><div class="w-full bg-gray-200 rounded-full h-2.5"><div class="bg-blue-500 h-2.5 rounded-full" style="width: ${s.approval}%"></div></div><div class="flex justify-between text-xs pt-1"><span class="text-green-600 font-bold">+${s.good} Votes</span><span class="text-red-600 font-bold">-${s.bad} Votes</span></div></div></div>` }
                DOM.inputs.compareResults.innerHTML = h
            };
            if (DOM.theme.chooser) {
                const chooser = DOM.theme.chooser;
                const currentTheme = State.data.currentTheme || 'default';
                const themeName = currentTheme === 'ballpit' ? 'Ball Pit' : currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1);
                const btn = document.createElement('button');
                btn.id = 'themeChooserBtn';
                btn.className = chooser.className;
                btn.innerHTML = `${themeName} ▼`;
                btn.style.cssText = chooser.style.cssText + 'cursor: pointer;';
                btn.onclick = (e) => {
                    e.preventDefault();
                    ThemeManager.showGallery();
                };
                chooser.style.display = 'none';
                chooser.parentNode.insertBefore(btn, chooser.nextSibling);
                DOM.theme.chooserBtn = btn;
            }
            State.init();
            RoomManager.init();
            
            // Create Mini Games button
            const miniGamesBtn = document.createElement('button');
            miniGamesBtn.id = 'miniGamesBtn';
            miniGamesBtn.className = 'fixed top-4 right-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg z-50 font-bold cursor-pointer hover:from-purple-500 hover:to-pink-500 transition-all active:scale-95 flex items-center justify-center';
            miniGamesBtn.style.cssText = 'width: 52px; height: 52px; padding: 0;';
            miniGamesBtn.innerHTML = `<span style="font-size: 24px;">🎮</span>`;
            miniGamesBtn.title = 'Mini Games & Arcade';
            miniGamesBtn.onclick = async (e) => { e.preventDefault(); e.stopPropagation(); await window.loadMinigames(); MiniGames.showMenu(); };
            document.body.appendChild(miniGamesBtn);
            
            if (State.data.settings.hideMultiplayer || State.data.settings.kidsMode) {
                const roomBtn = document.getElementById('roomBtn');
                if (roomBtn) roomBtn.style.display = 'none';
            }
            if (State.data.settings.kidsMode) {
                miniGamesBtn.style.display = 'none';
            }
            DOM.inputs.username.value = State.data.username === 'Unknown' ? '' : State.data.username;
            DOM.inputs.username.addEventListener('change', (e) => State.save('username', e.target.value.trim() || 'Guest'));
            UIManager.updateStreak(State.data.streak);
            State.runtime.history.forEach(h => UIManager.addToHistory(h.word, h.vote));
            InputHandler.init();
            ThemeManager.init();
            WeatherManager.init();
            ModalManager.init();
            UIManager.updateProfileDisplay();
            MosquitoManager.startMonitoring();
            this.checkDailyStatus();
            if (State.data.settings.hideCards) {
                this.applyHideCards(true);
            }
            this.applyUIVisibility();
            await this.refreshData();
            
            // Sync any pending mini-game scores that failed to upload
            API.syncPendingMiniGameScores();
            
            DiscoveryManager.init();
            setTimeout(() => {
                if (DOM.screens && DOM.screens.loading) {
                    DOM.screens.loading.classList.add('opacity-0', 'pointer-events-none');
                    setTimeout(() => DOM.screens.loading?.remove(), 500);
                }
                
                // URL Hash Routing for direct mini-game links
                this.handleURLRoute();
                window.addEventListener('hashchange', () => this.handleURLRoute());
            }, 1500);
            setInterval(() => this.checkCooldown(), 100);
        } catch(e) {
            console.error("Critical Init Error:", e);
            const vEl = document.querySelector('.version-indicator');
            if(vEl) vEl.textContent = "Error: " + e.message;
        }
    },
    async nextWord() {
        if (State.runtime.isMultiplayer) return;
        if (State.runtime.allWords.length <= State.runtime.currentWordIndex) {
            try {
                const res = await fetch(`${CONFIG.API_BASE_URL}?t=${Date.now()}`); // Fetches 1 random word
                const data = await res.json();
                if (data && data.length > 0) State.runtime.allWords.push(data[0]);
                else State.runtime.allWords.push({ text: 'RETRY', _id: null });
            } catch(e) { State.runtime.allWords.push({ text: 'OFFLINE', _id: null }); }
        }
        if (!State.runtime.isMultiplayer) {
            const sourceList = State.runtime.fullWordList.length > 0 ? State.runtime.fullWordList : State.runtime.allWords;
            if (State.data.settings.zeroVotesOnly) {
                const unvoted = sourceList.filter(w => (w.goodVotes || 0) === 0 && (w.badVotes || 0) === 0);
                if (unvoted.length > 0) State.runtime.allWords = unvoted;
                else UIManager.showPostVoteMessage("No more new words! Showing random.");
            } else if (State.data.settings.controversialOnly) {
                const contro = sourceList.filter(w => {
                    const g = w.goodVotes || 0, b = w.badVotes || 0, t = g + b;
                    return t >= 3 && (g/t >= 0.4 && g/t <= 0.6);
                });
                if (contro.length > 0) State.runtime.allWords = contro;
                else UIManager.showPostVoteMessage("No controversial words found! Showing random.");
            }
        }
        const w = State.runtime.allWords[State.runtime.currentWordIndex];
        UIManager.displayWord(w);
    },
async vote(t, s = false) {
        if (State.runtime.isCoolingDown) return;
        const n = Date.now();
        if (State.runtime.lastVoteTime > 0 && (n - State.runtime.lastVoteTime) < 250) {
            return;
        }
        if (State.runtime.isMultiplayer && typeof RoomManager !== 'undefined' && RoomManager.active) {
             RoomManager.submitVote(t);
             UIManager.disableButtons(true);
             DOM.game.wordDisplay.style.opacity = '0.5';
             return;
        }
        State.runtime.sameVoteMessage = null; // Reset
        if (t === 'good' || t === 'bad') {
            if (State.runtime.lastVoteType === t) {
                State.runtime.sameVoteStreak++;
            } else {
                State.runtime.sameVoteStreak = 1;
            }
            State.runtime.lastVoteType = t;
            if (State.runtime.sameVoteStreak === 6) {
                State.runtime.sameVoteMessage = t === 'good' ? "Every word is GOOD today? 🤔" : "Having a BAD day? 😤";
            } else if (State.runtime.sameVoteStreak >= 15) {
                State.runtime.sameVoteStreak = 0;
                const msg = t === 'good' ? "Too positive! Take a break." : "Too negative! Take a break.";
                UIManager.showMessage(msg, true);
                Haptics.heavy();
                this.handleCooldown();
                return;
            }
        }
        if (!State.runtime.voteTimestamps) State.runtime.voteTimestamps = [];
        State.runtime.voteTimestamps.push(n);
        State.runtime.voteTimestamps = State.runtime.voteTimestamps.filter(t => n - t < 11000);
        if (State.runtime.voteTimestamps.length >= 10) {
            State.runtime.voteTimestamps = [];
            UIManager.showMessage("Slow down! Read the words.", true);
            Haptics.heavy();
            this.handleCooldown();
            return;
        }
        State.runtime.lastVoteTime = n;
        if (!s) {
            if (t === 'notWord') Haptics.heavy();
            else Haptics.medium();
        }
        const w = State.runtime.allWords[State.runtime.currentWordIndex],
            up = w.text.toUpperCase(),
            { CAKE, LLAMA, POTATO, SQUIRREL, MASON } = CONFIG.SPECIAL;
        UIManager.disableButtons(true);
        const wd = DOM.game.wordDisplay;
        const colors = Accessibility.getColors();
        if (!s && (t === 'good' || t === 'bad')) {
            Game.cleanStyles(wd);
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
            if (window.StreakManager) window.StreakManager.extend(c.fade + c.dur);
            State.unlockBadge(k);
            if (w._id && w._id !== 'temp' && w._id !== 'err') {
                const seen = State.data.seenHistory || [];
                if (!seen.includes(w._id)) {
                    seen.push(w._id);
                    while (seen.length > CONFIG.HISTORY_SIZE) seen.shift();
                    State.save('seenHistory', seen);
                }
            }
            UIManager.disableButtons(true);
            Game.cleanStyles(wd);
            wd.className = 'font-extrabold text-gray-900 text-center min-h-[72px]';
            wd.classList.add(c.text === 'LLAMA' ? 'word-fade-llama' : 'word-fade-quick');
            setTimeout(() => {
                Game.cleanStyles(wd);
                wd.style.opacity = '1';
                wd.style.transform = 'none';
                wd.textContent = c.msg;
                wd.style.fontSize = '1.25rem';
                wd.style.color = '#6b7280';
                wd.className = 'font-bold text-center min-h-[72px]';
                setTimeout(() => {
                    State.runtime.currentWordIndex++;
                    UIManager.disableButtons(false);
                    this.nextWord();
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
            if (OfflineManager.isActive()) {
                OfflineManager.queueVote(w._id, t);
                State.incrementVote();
                StreakManager.handleSuccess();
            } else {
                const res = await API.vote(w._id, t);
                if (res.status !== 403 && !res.ok) throw 0;
                w[`${t}Votes`] = (w[`${t}Votes`] || 0) + 1;
                const fullWord = State.runtime.fullWordList.find(fw => fw._id === w._id);
                if (fullWord && fullWord !== w) fullWord[`${t}Votes`] = w[`${t}Votes`];
                State.incrementVote();
                await API.submitUserVotes(State.data.userId, State.data.username, State.data.voteCount);
                StreakManager.handleSuccess();
            }
            if (State.runtime.isDailyMode) {
                const tod = new Date(), dStr = tod.toISOString().split('T')[0];
                
                // GOLDEN WORD CHALLENGE
                if (State.runtime.dailyChallengeType === 'golden') {
                    State.runtime.dailyVotesCount = (State.runtime.dailyVotesCount || 0) + 1;
                    const isGolden = (State.runtime.goldenWord && w._id === State.runtime.goldenWord._id) ||
                                    (Math.random() < 0.1 && State.runtime.dailyVotesCount >= 3);
                    if (isGolden && !State.runtime.goldenWordFound) {
                        State.runtime.goldenWordFound = true;
                        UIManager.showPostVoteMessage("🌟 GOLDEN WORD! 🌟");
                        const last = State.data.daily.lastDate;
                        let s = State.data.daily.streak;
                        if (last) {
                            const yd = new Date(); yd.setDate(yd.getDate() - 1);
                            s = last === yd.toISOString().split('T')[0] ? s + 1 : 1;
                        } else s = 1;
                        const best = Math.max(s, State.data.daily.bestStreak || 0);
                        const golden = (State.data.daily.goldenWordsFound || 0) + 1;
                        State.save('daily', { streak: s, lastDate: dStr, bestStreak: best, goldenWordsFound: golden });
                        DOM.daily.streakResult.textContent = '🔥 ' + s + ' 🌟';
                        setTimeout(() => this.finishDailyChallenge(), 1500);
                        return;
                    } else {
                        UIManager.showPostVoteMessage(`#${State.runtime.dailyVotesCount} - Keep looking! 🔍`);
                        setTimeout(() => { State.runtime.currentWordIndex++; this.nextWord(); }, 600);
                        return;
                    }
                }
                
                // STREAK CHALLENGE — any vote (good, bad, notWord) counts toward target
                if (State.runtime.dailyChallengeType === 'streak') {
                    State.runtime.dailyStreakCount = (State.runtime.dailyStreakCount || 0) + 1;
                    
                    if (State.runtime.dailyStreakCount >= State.runtime.dailyStreakTarget) {
                        UIManager.showPostVoteMessage(`🔥 ${State.runtime.dailyStreakTarget} words! Challenge Complete!`);
                        const last = State.data.daily.lastDate;
                        let s = State.data.daily.streak;
                        if (last) {
                            const yd = new Date(); yd.setDate(yd.getDate() - 1);
                            s = last === yd.toISOString().split('T')[0] ? s + 1 : 1;
                        } else s = 1;
                        const best = Math.max(s, State.data.daily.bestStreak || 0);
                        State.save('daily', { streak: s, lastDate: dStr, bestStreak: best });
                        DOM.daily.streakResult.textContent = '🔥 ' + s + ' 🔥';
                        setTimeout(() => this.finishDailyChallenge(), 1500);
                        return;
                    } else {
                        const remaining = State.runtime.dailyStreakTarget - State.runtime.dailyStreakCount;
                        UIManager.showPostVoteMessage(`🔥 Words: ${State.runtime.dailyStreakCount}/${State.runtime.dailyStreakTarget} — ${remaining} to go!`);
                        if (DOM.game.dailyStatus) DOM.game.dailyStatus.innerHTML = `<span class="font-bold">🔥 Words: ${State.runtime.dailyStreakCount}/${State.runtime.dailyStreakTarget}</span>`;
                        setTimeout(() => { State.runtime.currentWordIndex++; this.nextWord(); }, 600);
                        return;
                    }
                }
                
                // SNACK CHALLENGE
                if (State.runtime.dailyChallengeType === 'snack') {
                    State.runtime.dailyVotesCount = (State.runtime.dailyVotesCount || 0) + 1;
                    const isVeganMode = State.data.settings.veganMode;
                    
                    // Check if current word is a food/snack using definition
                    const isSnack = State.runtime.isFoodWord ? State.runtime.isFoodWord(w) : false;
                    
                    if (isSnack && !State.runtime.snackFound) {
                        State.runtime.snackFound = true;
                        const emoji = isVeganMode ? '🥬' : '🍕';
                        UIManager.showPostVoteMessage(`${emoji} YUM! Found "${w.text}"! 🍴`);
                        const last = State.data.daily.lastDate;
                        let s = State.data.daily.streak;
                        if (last) {
                            const yd = new Date(); yd.setDate(yd.getDate() - 1);
                            s = last === yd.toISOString().split('T')[0] ? s + 1 : 1;
                        } else s = 1;
                        const best = Math.max(s, State.data.daily.bestStreak || 0);
                        State.save('daily', { streak: s, lastDate: dStr, bestStreak: best });
                        DOM.daily.streakResult.textContent = '🔥 ' + s + ` ${emoji}`;
                        setTimeout(() => this.finishDailyChallenge(), 1500);
                        return;
                    } else {
                        const msg = isVeganMode 
                            ? `#${State.runtime.dailyVotesCount} - Not vegan! Keep looking! 🌱`
                            : `#${State.runtime.dailyVotesCount} - Not edible! Keep looking! 🍴`;
                        UIManager.showPostVoteMessage(msg);
                        setTimeout(() => { State.runtime.currentWordIndex++; this.nextWord(); }, 600);
                        return;
                    }
                }
                
                // SINGLE VOTE CHALLENGE (default)
                const last = State.data.daily.lastDate;
                let s = State.data.daily.streak;
                if (last) {
                    const yd = new Date(); yd.setDate(yd.getDate() - 1);
                    s = last === yd.toISOString().split('T')[0] ? s + 1 : 1;
                } else s = 1;
                const best = Math.max(s, State.data.daily.bestStreak || 0);
                State.save('daily', { streak: s, lastDate: dStr, bestStreak: best });
                DOM.daily.streakResult.textContent = '🔥 ' + s;
                this.finishDailyChallenge();
                return;
            }
            let m = '';
            if (un) m = "🎉 New Theme Unlocked!";
            else if (State.data.settings.showPercentages && (t === 'good' || t === 'bad')) {
                const tot = (w.goodVotes || 0) + (w.badVotes || 0);
                const p = Math.round((w[`${t}Votes`] / tot) * 100);
                if (State.runtime.isDrinkingMode && p < 50) {
                    m = `🍺 DRINK! (You are in the minority: ${p}%)`;
                } else {
                    m = `${t==='good'?'Good':'Bad'} vote! ${p}% agree.`;
                }
            }
            if (State.data.settings.showTips && !State.runtime.isMultiplayer) {
                State.save('voteCounterForTips', State.data.voteCounterForTips + 1);
                if (!State.runtime.nextTipAt) State.runtime.nextTipAt = Math.floor(Math.random() * 11) + 5; // 5-15
                if (State.data.voteCounterForTips >= State.runtime.nextTipAt) {
                    if (typeof GAME_TIPS !== 'undefined') {
                        m = GAME_TIPS[Math.floor(Math.random() * GAME_TIPS.length)];
                    }
                    State.save('voteCounterForTips', 0);
                    State.runtime.nextTipAt = Math.floor(Math.random() * 11) + 5; // Reset to new random 5-15
                }
            }
            const finalMessage = State.runtime.sameVoteMessage || m;
            UIManager.showPostVoteMessage(finalMessage);
            if (t === 'good' || t === 'bad') Haptics.medium();
            UIManager.updateStats();
            UIManager.addToHistory(w.text, t);
            State.runtime.history.unshift({ word: w.text, vote: t });
            if(State.runtime.history.length > 50) State.runtime.history.pop();
            setTimeout(() => {
                wd.classList.remove('animate-fly-left', 'animate-fly-right', 'swipe-good-color', 'swipe-bad-color', 'override-theme-color');
                wd.style.transform = '';
                wd.style.opacity = '1';
                wd.style.color = '';
                if (!State.runtime.isDailyMode) {
                    State.runtime.currentWordIndex++;
                    this.nextWord();
                }
            }, (t === 'good' || t === 'bad') ? 600 : 0);
        } catch (e) {
            UIManager.showMessage("Vote Failed", true);
            wd.classList.remove('animate-fly-left', 'animate-fly-right', 'swipe-good-color', 'swipe-bad-color', 'override-theme-color');
            UIManager.disableButtons(false);
        }
    },
    checkCooldown() {
        const now = Date.now();
        if (State.runtime.mashCount > CONFIG.VOTE.MASH_LIMIT) {
            State.runtime.cooldownUntil = now + 5000;
            State.runtime.mashCount = 0;
            UIManager.showSplash("COOLDOWN!", 'bad');
        }
        if (now > State.runtime.lastVoteTime + 1000) State.runtime.mashCount = Math.max(0, State.runtime.mashCount - 1);
    },
    startMultiplayer(data) {
        State.runtime.isMultiplayer = true;
        const banner = document.createElement('div');
        banner.className = 'mp-banner-text fixed top-48 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-6 py-2 rounded-full text-center font-black text-indigo-100 text-sm uppercase tracking-widest z-50 animate-fade-in pointer-events-none shadow-lg whitespace-nowrap';
        document.body.appendChild(banner);
        const ui = document.createElement('div');
        ui.id = 'mp-mode-ui';
        ui.className = 'fixed top-4 right-4 z-50 flex gap-2 items-center';
        ui.innerHTML = `
            <div class="bg-indigo-600 text-white px-3 py-1 rounded-full font-bold text-xs shadow-lg animate-pulse">LIVE</div>
            <button onclick="window.location.href = window.location.pathname" class="bg-red-500 text-white px-3 py-1 rounded-full font-bold text-xs shadow-lg hover:bg-red-600 transition cursor-pointer pointer-events-auto">EXIT</button>
        `;
        document.body.appendChild(ui);
        this.resetGame();
        if (data.words && data.words.length > 0) {
            State.runtime.allWords = data.words;
            this.nextWord();
        } else {
            State.runtime.allWords = [];
            UIManager.showMessage("Get Ready...");
        }
    },
    resetGame() {
        State.runtime.currentWordIndex = 0;
        DOM.game.historyList.innerHTML = '';
        UIManager.updateStreak(0);
    },
    handleCooldown() {
        State.runtime.isCoolingDown = true;
        const t = CONFIG.VOTE.COOLDOWN_TIERS;
        let r = t[Math.min(State.runtime.mashLevel, t.length - 1)];
        UIManager.showMessage(`Mashing detected. Wait ${r}s...`, true);
        Haptics.heavy();
        State.runtime.cooldownTimer = setInterval(() => {
            r--;
            if (r > 0) UIManager.showMessage(`Wait ${r}s...`, true);
            else {
                clearInterval(State.runtime.cooldownTimer);
                State.runtime.isCoolingDown = false;
                State.runtime.mashCount = 0;
                State.runtime.mashLevel++;
                UIManager.displayWord(State.runtime.allWords[State.runtime.currentWordIndex]);
            }
        }, 1000);
    },
    async showDefinition() {
        const w = State.runtime.allWords[State.runtime.currentWordIndex];
        if (!w) return;
        ModalManager.toggle('definition', true);
        document.getElementById('definitionWord').textContent = w.text.toUpperCase();
        const d = document.getElementById('definitionResults');
        d.innerHTML = 'Loading...';
        
        let hasDictionaryDef = false;
        
        try {
            // First try the external dictionary API
            const r = await API.define(w.text);
            if (r.ok) {
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
                hasDictionaryDef = true;
            }
        } catch {
            // Dictionary API failed, will try community definition
        }
        
        // If no dictionary definition found, try community definition
        if (!hasDictionaryDef) {
            const communityDef = await API.getCommunityDefinition(w._id);
            
            if (communityDef && communityDef.definition) {
                // Show community definition
                d.innerHTML = `
                    <div class="mb-4">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded">COMMUNITY DEFINITION</span>
                        </div>
                        <p class="text-gray-800 text-lg">${communityDef.definition}</p>
                        <p class="text-sm text-gray-500 mt-2">— Added by ${communityDef.author || 'Anonymous'}${communityDef.updatedAt ? ` on ${new Date(communityDef.updatedAt).toLocaleDateString()}` : ''}</p>
                    </div>
                    <div class="border-t pt-4 mt-4">
                        <button id="editCommunityDef" class="text-sm text-indigo-600 hover:text-indigo-800 font-medium">✏️ Suggest a better definition</button>
                    </div>
                `;
                document.getElementById('editCommunityDef').onclick = () => this.showAddDefinitionForm(w);
            } else {
                // No definition at all - show form to add one
                d.innerHTML = `
                    <div class="text-center py-4">
                        <p class="text-gray-500 mb-4">No dictionary definition found for this word.</p>
                        <p class="text-sm text-gray-400 mb-6">Be the first to add a community definition!</p>
                        <button id="addCommunityDef" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition">
                            ✨ Add Definition
                        </button>
                    </div>
                `;
                document.getElementById('addCommunityDef').onclick = () => this.showAddDefinitionForm(w);
            }
        }
    },
    
    showAddDefinitionForm(word) {
        const d = document.getElementById('definitionResults');
        const username = State.data.username || 'Anonymous';
        
        d.innerHTML = `
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Your definition for "${word.text.toUpperCase()}"</label>
                    <textarea id="communityDefInput" 
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                        rows="4"
                        maxlength="512"
                        placeholder="Enter a clear, helpful definition..."></textarea>
                    <p class="text-xs text-gray-400 mt-1"><span id="defCharCount">0</span>/512 characters</p>
                </div>
                <div class="flex gap-3">
                    <button id="submitCommunityDef" class="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition">
                        Submit Definition
                    </button>
                    <button id="cancelCommunityDef" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg transition">
                        Cancel
                    </button>
                </div>
                <p class="text-xs text-gray-500 text-center">Submitting as: ${username}</p>
            </div>
        `;
        
        const textarea = document.getElementById('communityDefInput');
        const charCount = document.getElementById('defCharCount');
        
        textarea.addEventListener('input', () => {
            charCount.textContent = textarea.value.length;
        });
        
        document.getElementById('submitCommunityDef').onclick = async () => {
            const definition = textarea.value.trim();
            if (!definition) {
                UIManager.showPostVoteMessage('Please enter a definition');
                return;
            }
            if (definition.length > 512) {
                UIManager.showPostVoteMessage('Definition is too long (max 512 characters)');
                return;
            }
            
            d.innerHTML = '<p class="text-center text-gray-500 animate-pulse">Saving definition...</p>';
            
            const result = await API.setCommunityDefinition(word._id, definition, username);
            if (result) {
                UIManager.showPostVoteMessage('✨ Definition added! Thank you!');
                this.showDefinition(); // Refresh to show the new definition
            } else {
                UIManager.showPostVoteMessage('Failed to save definition. Try again.');
                this.showAddDefinitionForm(word); // Show form again
            }
        };
        
        document.getElementById('cancelCommunityDef').onclick = () => {
            this.showDefinition(); // Go back to definition view
        };
        
        textarea.focus();
    },
    loadSpecial(t) {
        const i = State.runtime.allWords.findIndex(w => w.text.toUpperCase() === t);
        if (i !== -1) {
            State.runtime.currentWordIndex = i;
            UIManager.displayWord(State.runtime.allWords[i]);
        }
    },
 async refreshData(u = true) {
        if (State.runtime.isMultiplayer) return;
        if (u) UIManager.showMessage(State.data.settings.kidsMode ? "Loading Kids Mode..." : "Loading...");
        const isKids = State.data.settings.kidsMode;
        DOM.game.buttons.custom.style.display = isKids ? 'none' : 'block';
        DOM.game.buttons.notWord.style.display = isKids ? 'none' : 'block';
        this.checkDailyStatus();
        ['compareWordsButton','qrGoodBtn','qrBadBtn'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.style.display = isKids ? 'none' : 'block';
        });
        let d = [];
        if (isKids) {
            d = await API.fetchKidsWords();
        } else {
            d = await API.getAllWords();
        }
        if (d && d.length > 0) {
            if (OfflineManager.isActive()) {
                d = State.data.offlineCache || d;
                for (let i = d.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [d[i], d[j]] = [d[j], d[i]];
                }
            } else {
                for (let i = d.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [d[i], d[j]] = [d[j], d[i]];
                }
            }
            State.runtime.allWords = d;
            State.runtime.fullWordList = d; // Store full list for stats
            if (!isKids) {
                 State.runtime.allWords = d.filter(w => (w.notWordVotes || 0) < 20);
                 State.runtime.fullWordList = State.runtime.allWords; // Update full list too
            }
        } else {
            State.runtime.allWords = [{ text: 'OFFLINE', _id: 'err' }];
            State.runtime.fullWordList = [];
        }
        UIManager.updateStats(); // Now shows correct numbers
        if (u && !State.runtime.isDailyMode) {
            const params = new URLSearchParams(window.location.search);
            const sharedWord = params.get('word');
            if (sharedWord) {
                const idx = State.runtime.allWords.findIndex(w => w.text.toUpperCase() === sharedWord.toUpperCase());
                if (idx !== -1) {
                    State.runtime.currentWordIndex = idx;
                    UIManager.displayWord(State.runtime.allWords[idx]);
                    window.history.replaceState({}, document.title, "/");
                    UIManager.showPostVoteMessage("Shared word loaded! 🔗");
                } else {
                    State.runtime.currentWordIndex = 0;
                    UIManager.displayWord(State.runtime.allWords[0]);
                }
            } else {
                State.runtime.currentWordIndex = 0;
                UIManager.displayWord(State.runtime.allWords[0]);
            }
            const today = new Date().toISOString().split('T')[0];
            let history = State.data.wordHistory;
            const currentCount = State.runtime.fullWordList.length > 0 ? State.runtime.fullWordList.length : State.runtime.allWords.length;
            if (history.length > 1) {
                const cleaned = [history[0]];
                for (let i = 1; i < history.length; i++) {
                    const prev = cleaned[cleaned.length - 1];
                    const curr = history[i];
                    if (curr.count >= prev.count * 0.8) {
                        cleaned.push(curr);
                    }
                }
                if (cleaned.length !== history.length) {
                    history = cleaned;
                    State.data.wordHistory = history;
                    State.save('wordHistory', history);
                }
            }
            if (history.length === 0 || history[history.length - 1].date !== today) {
                const lastCount = history.length > 0 ? history[history.length - 1].count : 0;
                if (currentCount >= lastCount) {
                    history.push({ date: today, count: currentCount });
                    if (history.length > 365) history.shift();
                    State.save('wordHistory', history);
                }
            } else {
                const todayEntry = history[history.length - 1];
                if (currentCount > todayEntry.count) {
                    todayEntry.count = currentCount;
                    State.save('wordHistory', history);
                }
            }
        }
    },
    applyHideCards(hide) {
        const gameCard = DOM.game.card;
        const header = document.querySelector('header');
        const themesPanel = document.querySelector('.mt-6.p-4.bg-white\\/70'); // Themes panel
        const rankingsSection = document.getElementById('rankingsSection'); // Top good/bad words
        if (hide) {
            if (gameCard) gameCard.style.opacity = '0';
            if (gameCard) gameCard.style.pointerEvents = 'none';
            if (header) header.style.opacity = '0.3';
            if (themesPanel) themesPanel.style.opacity = '0.3';
            if (rankingsSection) rankingsSection.style.opacity = '0.3';
        } else {
            if (gameCard) gameCard.style.opacity = '1';
            if (gameCard) gameCard.style.pointerEvents = '';
            if (header) header.style.opacity = '1';
            if (themesPanel) themesPanel.style.opacity = '1';
            if (rankingsSection) rankingsSection.style.opacity = '1';
        }
    },
    applyUIVisibility() {
        const s = State.data.settings;
        // Profile card (userStatsBar in header)
        const profileSection = DOM.header.userStatsBar;
        if (profileSection) {
            profileSection.style.display = s.hideProfile ? 'none' : '';
        }
        // Votes bar (good/bad vote counts and bar)
        const votesContainer = document.querySelector('.flex.items-center.gap-1.text-xs');
        const voteBarContainer = document.getElementById('headerBarGood')?.parentElement?.parentElement;
        if (votesContainer) votesContainer.style.display = s.hideVotesBar ? 'none' : '';
        if (voteBarContainer) voteBarContainer.style.display = s.hideVotesBar ? 'none' : '';
        // Top good/bad words section
        const rankingsSection = document.getElementById('rankingsSection');
        if (rankingsSection) {
            rankingsSection.style.display = s.hideTopWords ? 'none' : '';
        }
    },
    disableDailyMode() {
        State.runtime.isDailyMode = false;
        DOM.game.dailyBanner.classList.remove('daily-locked-mode');
        DOM.game.buttons.notWord.style.visibility = 'visible';
        DOM.game.buttons.custom.style.visibility = 'visible';
        this.nextWord()
    },
    async finishDailyChallenge() {
        const d = State.data;
        const totalVotesEl = document.getElementById('dailyTotalVotes');
        if (totalVotesEl) totalVotesEl.textContent = d.voteCount.toLocaleString();
        await API.submitUserVotes(
            d.userId,
            d.username,
            d.voteCount,
            d.daily.streak,
            d.daily.bestStreak
        );
        const dailyVotesEl = document.getElementById('dailyTotalVotes');
        if (dailyVotesEl) dailyVotesEl.textContent = d.voteCount.toLocaleString();
        const goldenCountEl = document.getElementById('dailyGoldenCount');
        if (goldenCountEl) goldenCountEl.textContent = '🌟 ' + (d.daily.goldenWordsFound || 0);
        const leaderboard = await API.fetchLeaderboard();
        const userRankIndex = leaderboard.findIndex(u => u.userId === d.userId);
        const totalUsers = leaderboard.length;
        if (userRankIndex >= 0) {
            const rank = userRankIndex + 1;
            DOM.daily.worldRank.textContent = '#' + rank;
            const ctx = document.getElementById('dailyRankContext');
            if (ctx) {
                if (rank === 1) ctx.textContent = '👑 Top voter!';
                else if (rank <= 3) ctx.textContent = '🏆 Top 3!';
                else ctx.textContent = `of ${totalUsers.toLocaleString()} voters`;
            }
        } else {
            DOM.daily.worldRank.textContent = 'New!';
            const ctx = document.getElementById('dailyRankContext');
            if (ctx) ctx.textContent = 'Keep voting to climb!';
        }
        State.runtime.isDailyMode = false;
        State.runtime.dailyChallengeType = null;
        State.runtime.goldenWord = null;
        DOM.game.dailyBanner.classList.remove('daily-locked-mode');
        DOM.game.buttons.notWord.style.visibility = '';
        DOM.game.buttons.custom.style.visibility = '';
        this.checkDailyStatus();
        setTimeout(() => ModalManager.toggle('dailyResult', true), 600);
        this.refreshData(true);
    },
    showDailyStreakSpinner(target, onComplete) {
        const pop = document.createElement('div');
        pop.id = 'daily-streak-spinner-popup';
        pop.className = 'fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm';
        pop.innerHTML = `
            <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-xs w-full mx-4 text-center border-4 border-amber-400">
                <div class="text-amber-600 font-black text-sm uppercase tracking-wider mb-2">Words to vote</div>
                <div id="daily-streak-spinner-digit" class="text-6xl font-black text-amber-500 tabular-nums min-h-[4rem] flex items-center justify-center">–</div>
                <p class="text-gray-500 text-xs mt-3">Any vote counts — good, bad, or not a word!</p>
            </div>
        `;
        document.body.appendChild(pop);
        const digitEl = document.getElementById('daily-streak-spinner-digit');
        const minVal = 3, maxVal = 10;
        let frame = 0;
        const totalFrames = 90;
        const spinInterval = setInterval(() => {
            frame++;
            const progress = frame / totalFrames;
            if (progress < 0.7) {
                const speed = Math.floor(4 + (1 - progress) * 12);
                const show = minVal + (frame * speed) % (maxVal - minVal + 1);
                digitEl.textContent = show;
            } else {
                const settle = (progress - 0.7) / 0.3;
                const wobble = settle < 1 ? (minVal + Math.floor((frame * 2) % (maxVal - minVal + 1))) : target;
                digitEl.textContent = settle >= 0.85 ? target : wobble;
            }
        }, 35);
        setTimeout(() => {
            clearInterval(spinInterval);
            digitEl.textContent = target;
            digitEl.style.transition = 'transform 0.2s ease-out';
            digitEl.style.transform = 'scale(1.15)';
            setTimeout(() => {
                pop.remove();
                if (typeof onComplete === 'function') onComplete();
            }, 600);
        }, totalFrames * 35 + 200);
    },
    activateDailyMode() {
        if (State.runtime.isDailyMode) return;
        const t = new Date().toISOString().split('T')[0];
        if (t === State.data.daily.lastDate) return;
        State.runtime.isDailyMode = true;
        DOM.game.dailyBanner.classList.add('daily-locked-mode');
        DOM.game.dailyBanner.classList.remove('daily-pulse');
        DOM.game.buttons.notWord.style.visibility = 'hidden';
        DOM.game.buttons.custom.style.visibility = 'hidden';
        
        // Generate seed from date
        let seed = 0;
        for (let i = 0; i < t.length; i++) {
            seed = ((seed << 5) - seed) + t.charCodeAt(i);
            seed |= 0;
        }
        seed = Math.abs(seed);
        
        // Challenge type selection (4 types now)
        // 0 = golden word, 1 = single vote, 2 = start a streak, 3 = find a snack
        const challengeType = seed % 4;
        
        // Food-related keywords to search in definitions
        const foodKeywords = [
            // Food types
            'food', 'fruit', 'vegetable', 'meat', 'fish', 'seafood', 'poultry', 'dairy',
            'grain', 'bread', 'pastry', 'dessert', 'snack', 'meal', 'dish', 'cuisine',
            // Eating/cooking related
            'eat', 'eaten', 'edible', 'cook', 'bake', 'fry', 'roast', 'grill',
            'breakfast', 'lunch', 'dinner', 'supper', 'brunch',
            // Drinks
            'drink', 'beverage', 'juice', 'wine', 'beer', 'coffee', 'tea',
            // Taste/texture
            'tasty', 'delicious', 'sweet', 'savory', 'flavour', 'flavor',
            // Ingredients
            'ingredient', 'recipe', 'sauce', 'spice', 'herb', 'seasoning',
            // Specific food categories
            'candy', 'chocolate', 'cake', 'pie', 'cookie', 'soup', 'salad', 'sandwich',
            'pizza', 'pasta', 'noodle', 'rice', 'cereal', 'yogurt', 'cheese', 'butter',
            'cream', 'egg', 'bacon', 'sausage', 'steak', 'chicken', 'pork', 'beef',
            'lamb', 'turkey', 'ham', 'burger', 'hotdog', 'taco', 'burrito', 'sushi',
            // Plants we eat
            'berry', 'nut', 'seed', 'legume', 'bean', 'pea', 'lentil',
            // Prepared food
            'baked', 'fried', 'grilled', 'roasted', 'steamed', 'boiled'
        ];
        
        // Non-vegan keywords - animal products
        const nonVeganKeywords = [
            // Meat
            'meat', 'beef', 'pork', 'lamb', 'chicken', 'turkey', 'duck', 'goose',
            'bacon', 'ham', 'sausage', 'steak', 'veal', 'venison', 'rabbit', 'game',
            'poultry', 'fowl', 'flesh',
            // Seafood
            'fish', 'salmon', 'tuna', 'cod', 'haddock', 'mackerel', 'trout', 'sardine',
            'anchovy', 'herring', 'seafood', 'shellfish', 'shrimp', 'prawn', 'lobster',
            'crab', 'oyster', 'mussel', 'clam', 'scallop', 'squid', 'octopus', 'calamari',
            // Dairy
            'dairy', 'milk', 'cream', 'cheese', 'butter', 'yogurt', 'yoghurt', 'whey',
            'casein', 'lactose', 'ghee', 'curd',
            // Eggs
            'egg', 'yolk', 'albumen', 'mayonnaise',
            // Honey & other
            'honey', 'gelatin', 'gelatine', 'lard', 'tallow', 'suet',
            // Animal-derived
            'animal', 'cow', 'pig', 'sheep', 'goat'
        ];
        
        // Common non-vegan food items
        const nonVeganFoods = [
            'steak', 'burger', 'hotdog', 'bacon', 'ham', 'sausage', 'chicken', 'turkey',
            'fish', 'salmon', 'tuna', 'shrimp', 'lobster', 'crab', 'oyster',
            'milk', 'cheese', 'butter', 'yogurt', 'cream', 'egg', 'omelette', 'omelet',
            'mayonnaise', 'honey', 'milkshake', 'icecream'
        ];
        
        // Common vegan foods (plant-based)
        const veganFoods = [
            'apple', 'banana', 'orange', 'grape', 'strawberry', 'mango', 'pineapple',
            'watermelon', 'melon', 'peach', 'pear', 'plum', 'cherry', 'blueberry',
            'raspberry', 'blackberry', 'kiwi', 'papaya', 'coconut', 'avocado', 'lemon',
            'lime', 'grapefruit', 'fig', 'date', 'pomegranate', 'passion',
            'carrot', 'potato', 'tomato', 'onion', 'garlic', 'pepper', 'lettuce',
            'spinach', 'broccoli', 'cauliflower', 'cabbage', 'kale', 'celery',
            'cucumber', 'zucchini', 'squash', 'pumpkin', 'eggplant', 'aubergine',
            'corn', 'pea', 'bean', 'lentil', 'chickpea', 'hummus', 'tofu', 'tempeh',
            'mushroom', 'olive', 'artichoke', 'asparagus', 'beetroot', 'radish',
            'rice', 'pasta', 'noodle', 'bread', 'oat', 'oatmeal', 'cereal', 'granola',
            'quinoa', 'couscous', 'falafel', 'salad', 'soup', 'smoothie',
            'almond', 'walnut', 'cashew', 'peanut', 'pistachio', 'hazelnut',
            'coffee', 'tea', 'juice', 'lemonade', 'kombucha',
            'chocolate', 'cocoa', 'popcorn', 'pretzel', 'chips', 'crisp',
            'jam', 'jelly', 'marmalade', 'syrup', 'maple'
        ];
        
        // Helper function to check if a word is food based on its definition
        const isFoodWord = (word) => {
            if (!word) return false;
            const def = (word.definition || '').toLowerCase();
            const text = (word.text || '').toLowerCase();
            const isVeganMode = State.data.settings.veganMode;
            
            // If vegan mode, first check if it's an animal product
            if (isVeganMode) {
                // Check definition for non-vegan keywords
                for (const keyword of nonVeganKeywords) {
                    if (def.includes(keyword)) return false;
                }
                // Check if word itself is a non-vegan food
                if (nonVeganFoods.some(food => text.includes(food) || food.includes(text))) {
                    return false;
                }
                
                // For vegan mode, check if it's a known vegan food first
                if (veganFoods.some(food => text.includes(food) || food.includes(text))) {
                    return true;
                }
                
                // Then check definition for plant-based food keywords
                const veganKeywords = ['fruit', 'vegetable', 'plant', 'grain', 'legume', 
                    'nut', 'seed', 'berry', 'herb', 'spice', 'vegan', 'plant-based'];
                for (const keyword of veganKeywords) {
                    if (def.includes(keyword)) return true;
                }
                
                // General food check (but exclude if it might be animal-based)
                const safeFoodKeywords = ['food', 'edible', 'snack', 'dessert', 'pastry', 
                    'bread', 'baked', 'drink', 'beverage', 'juice', 'salad', 'soup'];
                for (const keyword of safeFoodKeywords) {
                    if (def.includes(keyword)) return true;
                }
                
                return false;
            }
            
            // Non-vegan mode: check definition for any food keywords
            if (def) {
                for (const keyword of foodKeywords) {
                    if (def.includes(keyword)) return true;
                }
            }
            
            // Also check if the word itself is a common food term
            const commonFoods = [
                'apple', 'banana', 'orange', 'grape', 'strawberry', 'mango', 'pineapple',
                'pizza', 'burger', 'taco', 'sushi', 'pasta', 'rice', 'bread', 'cake',
                'cookie', 'pie', 'donut', 'muffin', 'croissant', 'bagel', 'waffle',
                'pancake', 'cereal', 'oatmeal', 'yogurt', 'cheese', 'milk', 'butter',
                'egg', 'bacon', 'sausage', 'ham', 'steak', 'chicken', 'fish', 'shrimp',
                'lobster', 'crab', 'salmon', 'tuna', 'soup', 'salad', 'sandwich',
                'fries', 'chips', 'popcorn', 'pretzel', 'nachos', 'candy', 'chocolate',
                'coffee', 'tea', 'juice', 'smoothie', 'lemonade', 'milkshake',
                'carrot', 'potato', 'tomato', 'onion', 'garlic', 'pepper', 'lettuce',
                'spinach', 'broccoli', 'corn', 'bean', 'pea', 'mushroom', 'olive'
            ];
            if (commonFoods.some(food => text.includes(food) || food.includes(text))) {
                return true;
            }
            
            return false;
        };
        
        // Store the helper function for use during voting
        State.runtime.isFoodWord = isFoodWord;
        
        if (challengeType === 0) {
            // Golden Word Challenge
            State.runtime.dailyChallengeType = 'golden';
            UIManager.showMessage('🌟 Find the Golden Word!');
            if (DOM.game.dailyStatus) DOM.game.dailyStatus.innerHTML = `<span class="font-bold">🌟 Find Golden Word!</span><br><span class="text-xs">Vote until you find it!</span>`;
        } else if (challengeType === 1) {
            // Single Vote Challenge
            State.runtime.dailyChallengeType = 'single';
            UIManager.showMessage('📝 Vote on Today\'s Word!');
            if (DOM.game.dailyStatus) DOM.game.dailyStatus.innerHTML = `<span class="font-bold">📝 Daily Word</span><br><span class="text-xs">Cast your vote!</span>`;
        } else if (challengeType === 2) {
            // Start a Streak Challenge — target from spinning random number (3–10), any vote counts
            State.runtime.dailyChallengeType = 'streak';
            const streakTarget = 3 + (seed % 8); // 3 to 10 words, deterministic per day
            this.showDailyStreakSpinner(streakTarget, () => {
                State.runtime.dailyStreakTarget = streakTarget;
                State.runtime.dailyStreakCount = 0;
                UIManager.showMessage(`🔥 Vote on ${streakTarget} words!`);
                if (DOM.game.dailyStatus) DOM.game.dailyStatus.innerHTML = `<span class="font-bold">🔥 Daily Streak</span><br><span class="text-xs">Vote on ${streakTarget} words — any vote counts!</span>`;
                State.runtime.goldenWordFound = false;
                State.runtime.dailyVotesCount = 0;
                API.getAllWords().then(words => {
                    const sortedWords = words.sort((a, b) => a.text.localeCompare(b.text));
                    const shuffled = [...words];
                    for (let i = shuffled.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                    }
                    State.runtime.allWords = shuffled;
                    State.runtime.currentWordIndex = 0;
                    UIManager.displayWord(shuffled[0]);
                });
            });
            return;
        } else {
            // Find a Snack Challenge
            State.runtime.dailyChallengeType = 'snack';
            State.runtime.snackFound = false;
            const isVegan = State.data.settings.veganMode;
            if (isVegan) {
                UIManager.showMessage('🥬 Find a Vegan Snack!');
                if (DOM.game.dailyStatus) DOM.game.dailyStatus.innerHTML = `<span class="font-bold">🥬 Find a Vegan Snack!</span><br><span class="text-xs">Plant-based foods only!</span>`;
            } else {
                UIManager.showMessage('🍕 Find Something to Eat!');
                if (DOM.game.dailyStatus) DOM.game.dailyStatus.innerHTML = `<span class="font-bold">🍕 Find a Snack!</span><br><span class="text-xs">Vote until you find food!</span>`;
            }
        }
        
        State.runtime.goldenWordFound = false;
        State.runtime.dailyVotesCount = 0;
        
        API.getAllWords().then(words => {
            const sortedWords = words.sort((a, b) => a.text.localeCompare(b.text));
            
            if (State.runtime.dailyChallengeType === 'golden') {
                // Golden word challenge - find specific word
                const goldenIdx = (seed * 7) % sortedWords.length;
                State.runtime.goldenWord = sortedWords[goldenIdx];
                const shuffled = [...words];
                for (let i = shuffled.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                }
                const goldenPosition = 10 + Math.floor(Math.random() * 16);
                const goldenWordIdx = shuffled.findIndex(w =>
                    w._id === State.runtime.goldenWord._id ||
                    w.text === State.runtime.goldenWord.text
                );
                if (goldenWordIdx !== -1) {
                    shuffled.splice(goldenWordIdx, 1);
                }
                shuffled.splice(goldenPosition, 0, State.runtime.goldenWord);
                State.runtime.allWords = shuffled;
                State.runtime.currentWordIndex = 0;
                UIManager.displayWord(shuffled[0]);
                
            } else if (State.runtime.dailyChallengeType === 'single') {
                // Single word challenge
                const winningWordRef = sortedWords[seed % sortedWords.length];
                if (winningWordRef) {
                    State.runtime.allWords = [winningWordRef];
                    State.runtime.currentWordIndex = 0;
                    UIManager.displayWord(winningWordRef);
                } else {
                    UIManager.showMessage("No Daily Word Found");
                }
                
            } else if (State.runtime.dailyChallengeType === 'streak') {
                // Streak challenge - shuffle normally
                const shuffled = [...words];
                for (let i = shuffled.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                }
                State.runtime.allWords = shuffled;
                State.runtime.currentWordIndex = 0;
                UIManager.displayWord(shuffled[0]);
                
            } else if (State.runtime.dailyChallengeType === 'snack') {
                // Snack challenge - ensure a food word is within first 20 words
                const shuffled = [...words];
                for (let i = shuffled.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                }
                
                // Find a food word using definition-based detection and place it within first 15-25 words
                const foodWordIdx = shuffled.findIndex(w => isFoodWord(w));
                
                if (foodWordIdx > 25) {
                    const targetPos = 10 + Math.floor(Math.random() * 15);
                    const foodWord = shuffled.splice(foodWordIdx, 1)[0];
                    shuffled.splice(targetPos, 0, foodWord);
                }
                
                State.runtime.allWords = shuffled;
                State.runtime.currentWordIndex = 0;
                UIManager.displayWord(shuffled[0]);
            }
        });
    },
    updateLights() {
        const existing = document.querySelector('christmas-lights');
        if (State.data.settings.showLights) {
            if (!existing) {
                const lights = document.createElement('christmas-lights');
                document.body.appendChild(lights);
            }
        } else {
            if (existing) existing.remove();
        }
    },
checkDailyStatus() {
        const t = new Date().toISOString().split('T')[0];
        const l = State.data.daily.lastDate;
        if (State.data.settings.kidsMode || t === l) {
             DOM.game.dailyBanner.style.display = 'none';
             DOM.game.dailyBanner.classList.remove('daily-pulse');
        } else {
             // Rotating messages - encouraging engagement with streaks
             const streak = State.data.daily.streak || 0;
             const messages = streak > 0 ? [
                 `🔥 ${streak}-day streak! Don't stop now!`,
                 `⚡ Day ${streak + 1} is calling!`,
                 `🎯 Keep your ${streak}-day run alive!`,
                 `✨ ${streak} days strong — make it ${streak + 1}!`,
                 `🏆 Streak: ${streak} — You're on fire!`,
                 `💪 ${streak} days in! Can you do ${streak + 1}?`,
                 `🌟 Amazing ${streak}-day streak!`,
                 `🚀 ${streak} days down, glory ahead!`,
                 `⭐ Your ${streak}-day streak awaits!`,
                 `🎪 Day ${streak + 1} — The show must go on!`
             ] : [
                 `🎯 Daily Challenge — Start a streak!`,
                 `⚡ Begin your streak today!`,
                 `✨ New challenge ready!`,
                 `🎮 Tap to start your journey!`,
                 `🌟 Today's challenge awaits!`,
                 `🏆 Start a winning streak!`,
                 `💫 Your streak starts here!`,
                 `🚀 Launch your daily streak!`,
                 `🎪 Step right up — Daily Challenge!`,
                 `⭐ Day 1 begins now!`
             ];
             
             // Color themes that rotate throughout the day
             const colors = [
                 { bg: 'linear-gradient(90deg, #f59e0b, #d97706)', shadow: 'rgba(245, 158, 11, 0.4)' }, // Amber
                 { bg: 'linear-gradient(90deg, #8b5cf6, #a855f7)', shadow: 'rgba(139, 92, 246, 0.4)' }, // Purple (original)
                 { bg: 'linear-gradient(90deg, #10b981, #059669)', shadow: 'rgba(16, 185, 129, 0.4)' }, // Emerald
                 { bg: 'linear-gradient(90deg, #3b82f6, #6366f1)', shadow: 'rgba(59, 130, 246, 0.4)' }, // Blue
                 { bg: 'linear-gradient(90deg, #ec4899, #f43f5e)', shadow: 'rgba(236, 72, 153, 0.4)' }, // Pink
                 { bg: 'linear-gradient(90deg, #f97316, #ef4444)', shadow: 'rgba(249, 115, 22, 0.4)' }, // Orange-Red
                 { bg: 'linear-gradient(90deg, #14b8a6, #0891b2)', shadow: 'rgba(20, 184, 166, 0.4)' }, // Teal
                 { bg: 'linear-gradient(90deg, #84cc16, #22c55e)', shadow: 'rgba(132, 204, 22, 0.4)' }  // Lime-Green
             ];
             
             // Pick based on time so it changes throughout the day
             const hourSeed = new Date().getHours();
             const msgIndex = (hourSeed + Math.floor(Date.now() / 3600000)) % messages.length;
             const colorIndex = Math.floor(hourSeed / 3) % colors.length;
             const color = colors[colorIndex];
             
             // Add pulse animation style if not exists
             if (!document.getElementById('daily-pulse-style')) {
                 const style = document.createElement('style');
                 style.id = 'daily-pulse-style';
                 style.textContent = `
                     @keyframes dailyPulse {
                         0%, 100% { transform: scale(1); }
                         50% { transform: scale(1.02); }
                     }
                     .daily-pulse {
                         animation: dailyPulse 2s ease-in-out infinite;
                     }
                     .daily-banner.daily-pulse:hover {
                         animation: none;
                         transform: scale(1.03);
                         filter: brightness(1.1);
                     }
                 `;
                 document.head.appendChild(style);
             }
             
             // Apply dynamic styling
             DOM.game.dailyBanner.className = 'daily-banner daily-pulse';
             DOM.game.dailyBanner.style.cssText = `
                 display: block;
                 background: ${color.bg};
                 box-shadow: 0 4px 15px ${color.shadow};
                 color: white;
                 padding: 10px 16px;
                 border-radius: 12px;
                 cursor: pointer;
                 font-weight: bold;
                 text-align: center;
                 width: 100%;
                 margin-bottom: 1rem;
             `;
             
             DOM.game.dailyStatus.textContent = messages[msgIndex];
        }
    },
    setRandomFavicon() {
        const options = ['👍', '👎', '🗳️'];
        const choice = options[Math.floor(Math.random() * options.length)];
        const svg = `<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${choice}</text></svg>`;
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }
        link.href = `data:image/svg+xml,${svg}`;
    },
    cleanStyles(e) {
        e.style.animation = 'none';
        e.style.background = 'none';
        e.style.webkitTextFillColor = 'initial';
        e.style.textShadow = 'none';
        e.style.transform = 'none';
        e.style.filter = 'none';
        e.style.color = ''
    },
async renderLeaderboardTable() {
        const lbContainer = DOM.general.voteLeaderboardTable;
        if (!lbContainer) return;
        lbContainer.innerHTML = '<div class="text-center text-gray-500 p-4">Loading...</div>';
        const allUsers = await API.fetchLeaderboard();
        const topUsers = allUsers.slice(0, 5);
        let html = '<h3 class="text-lg font-bold text-gray-800 mb-3 mt-4">Top Voters (Global)</h3>';
        if (topUsers.length === 0) {
            html += '<div class="text-center text-gray-500 text-sm">Unavailable</div>';
        } else {
            topUsers.forEach((user, i) => {
                const isYou = State.data.userId && user.userId === State.data.userId;
                const rowClass = isYou ? 'bg-indigo-100 border-2 border-indigo-400 font-bold text-indigo-700' : 'bg-white border border-gray-200 text-gray-800';
                html += `<div class="flex justify-between items-center py-2 px-3 rounded ${rowClass} text-sm mb-1"><span class="w-6 text-center">#${i + 1}</span><span class="truncate flex-1">${user.username || 'Anonymous'}</span><span class="text-right">${(user.voteCount || 0).toLocaleString()}</span></div>`;
            });
        }
        html += '<h3 id="dailyStreaksHeader" class="text-lg font-bold text-gray-800 mb-3 mt-6 pt-2 border-t border-gray-100">🔥 Top Daily Streaks</h3>';
        const streakUsers = allUsers.filter(u => u.dailyStreak > 0).sort((a, b) => b.dailyStreak - a.dailyStreak).slice(0, 5);
        if (streakUsers.length > 0) {
            streakUsers.forEach((user, i) => {
                const isYou = State.data.userId && user.userId === State.data.userId;
                const rowClass = isYou ? 'bg-orange-100 border-2 border-orange-400 font-bold text-orange-700' : 'bg-white border border-gray-200 text-gray-800';
                html += `<div class="flex justify-between items-center py-2 px-3 rounded ${rowClass} text-sm mb-1"><span class="w-6 text-center">#${i + 1}</span><span class="truncate flex-1">${user.username || 'Anonymous'}</span><span class="text-right">🔥 ${user.dailyStreak}</span></div>`;
            });
        } else {
            html += `<div class="text-center text-gray-400 text-xs my-2">No streaks yet!</div>`;
        }
        lbContainer.innerHTML = html;
    },
    async renderGraphs() {
        const w = State.runtime.allWords;
        if (!w || w.length === 0) return;
        const drawText = (ctx, text, x, y, color = "#666", size = 12) => {
            ctx.fillStyle = color;
            ctx.font = `${size}px sans-serif`;
            ctx.textAlign = "center";
            ctx.fillText(text, x, y);
        };
        let globalHistory = [];
        try {
            globalHistory = await API.fetchGlobalStatsHistory();
        } catch (e) {
            console.warn("Could not fetch global stats history:", e);
        }
        const totalGood = w.reduce((a, b) => a + (b.goodVotes || 0), 0);
        const totalBad = w.reduce((a, b) => a + (b.badVotes || 0), 0);
        const totalVotes = totalGood + totalBad;
        API.submitGlobalSnapshot(w.length, totalVotes, totalGood, totalBad);
        const cvsScatter = document.getElementById('scatterChartCanvas');
        if (cvsScatter) {
            const ctx = cvsScatter.getContext('2d');
            const W = cvsScatter.width;
            const H = cvsScatter.height;
            const P = 40;
            ctx.clearRect(0, 0, W, H);
            let maxGood = 0, maxBad = 0;
            w.forEach(word => {
                if ((word.goodVotes || 0) > maxGood) maxGood = word.goodVotes || 0;
                if ((word.badVotes || 0) > maxBad) maxBad = word.badVotes || 0;
            });
            maxGood = Math.max(5, maxGood * 1.1);
            maxBad = Math.max(5, maxBad * 1.1);
            ctx.beginPath();
            ctx.strokeStyle = "#e5e7eb";
            ctx.lineWidth = 1;
            for(let i=1; i<=4; i++) {
                const y = H - P - (i/5)*(H - 2*P);
                const x = P + (i/5)*(W - 2*P);
                ctx.moveTo(P, y); ctx.lineTo(W-P, y);
                ctx.moveTo(x, P); ctx.lineTo(x, H-P);
            }
            ctx.stroke();
            ctx.beginPath();
            ctx.strokeStyle = "#9ca3af";
            ctx.lineWidth = 2;
            ctx.moveTo(P, P); ctx.lineTo(P, H - P);
            ctx.lineTo(W - P, H - P);
            ctx.stroke();
            drawText(ctx, "Bad Votes →", W / 2, H - 10, "#4b5563", 12);
            ctx.save();
            ctx.translate(15, H / 2);
            ctx.rotate(-Math.PI / 2);
            drawText(ctx, "Good Votes →", 0, 0, "#4b5563", 12);
            ctx.restore();
            drawText(ctx, "😇 LOVED", P + 40, P + 20, "rgba(34, 197, 94, 0.3)", 10);
            drawText(ctx, "👿 HATED", W - P - 40, H - P - 20, "rgba(239, 68, 68, 0.3)", 10);
            drawText(ctx, "⚔️ CONTROVERSIAL", W - P - 60, P + 20, "rgba(107, 114, 128, 0.3)", 10);
            w.forEach(word => {
                const g = word.goodVotes || 0;
                const b = word.badVotes || 0;
                if (g + b === 0) return;
                const x = P + (b / maxBad) * (W - 2 * P);
                const y = (H - P) - (g / maxGood) * (H - 2 * P);
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                if (g > b * 1.5) ctx.fillStyle = "rgba(34, 197, 94, 0.6)";
                else if (b > g * 1.5) ctx.fillStyle = "rgba(239, 68, 68, 0.6)";
                else ctx.fillStyle = "rgba(107, 114, 128, 0.6)";
                ctx.fill();
            });
        }
        const cvsVoteHistory = document.getElementById('voteHistoryCanvas');
        if (cvsVoteHistory) {
            const ctx = cvsVoteHistory.getContext('2d');
            const W = cvsVoteHistory.width;
            const H = cvsVoteHistory.height;
            const P = 50;
            const GRAPH_H = H - 2 * P;
            const Y_PLOT_MAX = P;
            const Y_PLOT_MIN = H - P;
            ctx.clearRect(0, 0, W, H);
            let voteHistory = globalHistory.filter(h => h.totalVotes > 0);
            if (voteHistory.length === 0) {
                const today = new Date().toISOString().split('T')[0];
                voteHistory = [{ date: today, totalVotes: totalVotes }];
            }
            const formatTrackingDate = (dateStr) => {
                const date = new Date(dateStr + 'T00:00:00');
                const now = new Date();
                const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const month = monthNames[date.getMonth()];
                const day = date.getDate();
                const year = date.getFullYear();
                if (diffDays === 0) return '(Tracking started today)';
                if (diffDays === 1) return '(Tracking since yesterday)';
                if (diffDays < 7) return `(Tracking for ${diffDays} days)`;
                if (diffDays < 30) return `(Since ${month} ${day})`;
                return `(Since ${month} ${day}, ${year})`;
            };
            const startDate = voteHistory[0]?.date;
            const voteTrackingEl = document.getElementById('voteTrackingStart');
            if (voteTrackingEl && startDate) {
                voteTrackingEl.textContent = formatTrackingDate(startDate);
            }
            const maxVotes = Math.max(...voteHistory.map(h => h.totalVotes || 0), 1000);
            const Y_MIN_VALUE = 0;
            const Y_MAX_VALUE = Math.ceil(maxVotes / 10000) * 10000 || 100000;
            const VALUE_RANGE = Y_MAX_VALUE - Y_MIN_VALUE;
            ctx.beginPath();
            ctx.strokeStyle = "#ccc";
            ctx.lineWidth = 1;
            ctx.moveTo(P, Y_PLOT_MAX); ctx.lineTo(P, Y_PLOT_MIN); ctx.lineTo(W - P, Y_PLOT_MIN);
            ctx.stroke();
            const getYVotes = (count) => {
                if (count <= Y_MIN_VALUE) return Y_PLOT_MIN;
                const plotRatio = count / VALUE_RANGE;
                return Y_PLOT_MIN - plotRatio * GRAPH_H;
            };
            ctx.textAlign = "right";
            for (let i = 0; i <= 4; i++) {
                const val = Math.round(Y_MAX_VALUE * i / 4);
                const y = getYVotes(val);
                ctx.strokeStyle = "#e5e7eb";
                ctx.beginPath();
                ctx.moveTo(P, y); ctx.lineTo(W - P, y);
                ctx.stroke();
                drawText(ctx, val.toLocaleString(), P - 5, y + 5, "#666", 9);
            }
            if (voteHistory.length > 0) {
                const xDivisor = voteHistory.length > 1 ? voteHistory.length - 1 : 1;
                ctx.beginPath();
                ctx.strokeStyle = "#10b981"; // Green for votes
                ctx.lineWidth = 3;
                voteHistory.forEach((h, i) => {
                    const x = P + (i / xDivisor) * (W - 2 * P);
                    const y = getYVotes(h.totalVotes || 0);
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                });
                ctx.stroke();
                voteHistory.forEach((h, i) => {
                    const x = P + (i / xDivisor) * (W - 2 * P);
                    const y = getYVotes(h.totalVotes || 0);
                    ctx.beginPath();
                    ctx.fillStyle = "#10b981";
                    ctx.arc(x, y, 4, 0, Math.PI * 2);
                    ctx.fill();
                    if (i === voteHistory.length - 1) {
                         ctx.beginPath();
                         ctx.strokeStyle = "#ffffff";
                         ctx.lineWidth = 2;
                         ctx.arc(x, y, 6, 0, Math.PI * 2);
                         ctx.stroke();
                    }
                });
            }
            if (voteHistory.length > 0) {
                const formatShortDate = (dateStr) => {
                    const d = new Date(dateStr + 'T00:00:00');
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    return `${monthNames[d.getMonth()]} ${d.getDate()}`;
                };
                ctx.textAlign = "left";
                drawText(ctx, formatShortDate(voteHistory[0].date), P, H - P + 15, "#999", 9);
                if (voteHistory.length > 1) {
                    ctx.textAlign = "right";
                    drawText(ctx, formatShortDate(voteHistory[voteHistory.length - 1].date), W - P, H - P + 15, "#999", 9);
                }
            }
            ctx.textAlign = "center";
            drawText(ctx, "Time →", W / 2, H - 5, "#999", 10);
            ctx.save();
            ctx.translate(12, H / 2);
            ctx.rotate(-Math.PI / 2);
            drawText(ctx, "Total Votes →", 0, 0, "#999", 10);
            ctx.restore();
        }
        const cvsLine = document.getElementById('lineChartCanvas');
        if (cvsLine) {
            const ctx = cvsLine.getContext('2d');
            const W = cvsLine.width;
            const H = cvsLine.height;
            const P = 40;
            const GRAPH_H = H - 2 * P;
            const Y_PLOT_MAX = P;
            const Y_PLOT_MIN = H - P;
            ctx.clearRect(0, 0, W, H);
            let history = globalHistory.filter(h => h.totalWords > 0);
            if (history.length === 0) {
                history = State.data.wordHistory || [];
            }
            if (history.length === 0) {
                const today = new Date().toISOString().split('T')[0];
                history = [{ date: today, totalWords: w.length, count: w.length }];
            }
            history = history.map(h => ({ ...h, count: h.totalWords || h.count || 0 }));
            if (history.length > 1) {
                const cleaned = [history[0]];
                for (let i = 1; i < history.length; i++) {
                    const prev = cleaned[cleaned.length - 1];
                    const curr = history[i];
                    if (curr.count >= prev.count * 0.8) {
                        cleaned.push(curr);
                    }
                }
                history = cleaned;
            }
            const formatTrackingDate = (dateStr) => {
                const date = new Date(dateStr + 'T00:00:00');
                const now = new Date();
                const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const month = monthNames[date.getMonth()];
                const day = date.getDate();
                const year = date.getFullYear();
                if (diffDays === 0) return '(Tracking started today)';
                if (diffDays === 1) return '(Tracking since yesterday)';
                if (diffDays < 7) return `(Tracking for ${diffDays} days)`;
                if (diffDays < 30) return `(Since ${month} ${day})`;
                return `(Since ${month} ${day}, ${year})`;
            };
            const dictStartDate = history[0]?.date;
            const dictTrackingEl = document.getElementById('dictTrackingStart');
            if (dictTrackingEl && dictStartDate) {
                dictTrackingEl.textContent = formatTrackingDate(dictStartDate);
            }
            const currentMaxData = Math.max(...history.map(h => h.count), w.length);
            const Y_MIN_VALUE = 3000;
            const SOFT_MAX = 6000;
            let Y_MAX_VALUE = SOFT_MAX;
            if (currentMaxData > SOFT_MAX) {
                const magnitude = Math.pow(10, Math.floor(Math.log10(currentMaxData || 10)));
                let step = magnitude >= 1000 ? 1000 : 500;
                Y_MAX_VALUE = Math.ceil(currentMaxData / step) * step;
            }
            const VALUE_RANGE = Y_MAX_VALUE - Y_MIN_VALUE;
            ctx.beginPath();
            ctx.strokeStyle = "#ccc";
            ctx.lineWidth = 1;
            ctx.moveTo(P, Y_PLOT_MAX); ctx.lineTo(P, Y_PLOT_MIN); ctx.lineTo(W - P, Y_PLOT_MIN);
            ctx.stroke();
            const getY = (count) => {
                if (count <= Y_MIN_VALUE) return Y_PLOT_MIN;
                const valueAboveMin = count - Y_MIN_VALUE;
                const plotRatio = valueAboveMin / VALUE_RANGE;
                return Y_PLOT_MIN - plotRatio * GRAPH_H;
            };
            ctx.textAlign = "right";
            drawText(ctx, Y_MAX_VALUE.toLocaleString(), P - 5, P + 5, "#666", 10);
            const markers = [Y_MIN_VALUE, SOFT_MAX];
            if (Y_MAX_VALUE !== SOFT_MAX) {
                const step = Y_MAX_VALUE / 4;
                for (let i = 1; i <= 3; i++) markers.push(Math.round(i * step / 100) * 100);
            }
            [...new Set(markers)].sort((a,b)=>a-b).forEach(mark => {
                if (mark >= Y_MIN_VALUE && mark <= Y_MAX_VALUE) {
                    const y = getY(mark);
                    ctx.strokeStyle = "#e5e7eb";
                    ctx.beginPath();
                    ctx.moveTo(P, y); ctx.lineTo(W - P, y);
                    ctx.stroke();
                    drawText(ctx, mark.toLocaleString(), P - 5, y + 5, "#666", 10);
                }
            });
            drawText(ctx, Y_MIN_VALUE.toLocaleString(), P - 5, Y_PLOT_MIN + 5, "#666", 10);
            if (history.length > 0) {
                const xDivisor = history.length > 1 ? history.length - 1 : 1;
                ctx.beginPath();
                ctx.strokeStyle = "#4f46e5";
                ctx.lineWidth = 3;
                history.forEach((h, i) => {
                    const x = P + (i / xDivisor) * (W - 2 * P);
                    const y = getY(h.count);
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                });
                ctx.stroke();
                history.forEach((h, i) => {
                    const x = P + (i / xDivisor) * (W - 2 * P);
                    const y = getY(h.count);
                    ctx.beginPath();
                    ctx.fillStyle = "#4f46e5";
                    ctx.arc(x, y, 4, 0, Math.PI * 2);
                    ctx.fill();
                    if (i === history.length - 1) {
                         ctx.beginPath();
                         ctx.strokeStyle = "#ffffff";
                         ctx.lineWidth = 2;
                         ctx.arc(x, y, 6, 0, Math.PI * 2);
                         ctx.stroke();
                    }
                });
            }
            if (history.length > 0 && history[0].date) {
                const formatShortDate = (dateStr) => {
                    const d = new Date(dateStr + 'T00:00:00');
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    return `${monthNames[d.getMonth()]} ${d.getDate()}`;
                };
                ctx.textAlign = "left";
                drawText(ctx, formatShortDate(history[0].date), P, H - P + 15, "#999", 9);
                if (history.length > 1 && history[history.length - 1].date) {
                    ctx.textAlign = "right";
                    drawText(ctx, formatShortDate(history[history.length - 1].date), W - P, H - P + 15, "#999", 9);
                }
            }
            ctx.textAlign = "center";
            drawText(ctx, "Time →", W / 2, H - 5, "#999", 10);
            ctx.save();
            ctx.translate(12, H / 2);
            ctx.rotate(-Math.PI / 2);
            drawText(ctx, "Total Words →", 0, 0, "#999", 10);
            ctx.restore();
        }
        const cvsPie = document.getElementById('pieChartCanvas');
        if (cvsPie) {
            const ctx = cvsPie.getContext('2d');
            const W = cvsPie.width;
            const H = cvsPie.height;
            ctx.clearRect(0, 0, W, H);
            let cGood = 0, cBad = 0, cControversial = 0, cUnrated = 0;
            w.forEach(word => {
                const g = word.goodVotes || 0;
                const b = word.badVotes || 0;
                const total = g + b;
                if (total < 3) {
                    cUnrated++;
                } else {
                    const ratio = g / total;
                    if (ratio > 0.60) cGood++;
                    else if (ratio < 0.40) cBad++;
                    else cControversial++;
                }
            });
            const totalRated = cGood + cBad + cControversial;
            if (totalRated === 0) {
                drawText(ctx, "Not enough votes yet.", W/2, H/2);
            } else {
                const data = [
                    { label: "Good", val: cGood, color: "#22c55e" },
                    { label: "Bad", val: cBad, color: "#ef4444" },
                    { label: "Controversial", val: cControversial, color: "#eab308" }
                ];
                let startAngle = 0;
                const centerX = 150;
                const centerY = H / 2;
                const radius = 70;
                data.forEach(slice => {
                    if (slice.val === 0) return;
                    const sliceAngle = (slice.val / totalRated) * 2 * Math.PI;
                    ctx.beginPath();
                    ctx.moveTo(centerX, centerY);
                    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
                    ctx.fillStyle = slice.color;
                    ctx.fill();
                    startAngle += sliceAngle;
                });
                let legY = 60;
                data.forEach(slice => {
                    ctx.fillStyle = slice.color;
                    ctx.fillRect(260, legY, 15, 15);
                    ctx.fillStyle = "#374151";
                    ctx.textAlign = "left";
                    ctx.font = "bold 12px sans-serif";
                    const pct = Math.round((slice.val / totalRated) * 100);
                    ctx.fillText(`${slice.label}: ${slice.val} (${pct}%)`, 285, legY + 12);
                    legY += 30;
                });
            }
        }
    },
    
    // URL Hash Routing for direct mini-game links
    // Supported hashes: #wordwar, #defdash, #wordjump, #arcade, #leaderboard
    async handleURLRoute() {
        const hash = window.location.hash.toLowerCase().replace('#', '');
        if (!hash) return;
        
        // Clear the hash after processing to allow re-triggering
        const clearHash = () => {
            history.replaceState(null, null, window.location.pathname + window.location.search);
        };
        
        // Helper to ensure minigames are loaded
        const ensureMinigames = async () => {
            if (typeof MiniGames === 'undefined' || !MiniGames.wordWar) {
                if (typeof window.loadMinigames === 'function') {
                    await window.loadMinigames();
                } else {
                    console.warn('[Game] MiniGames loader not available');
                    return false;
                }
            }
            return true;
        };
        
        switch(hash) {
            case 'wordwar':
            case 'word-war':
            case 'war':
                clearHash();
                if (await ensureMinigames() && MiniGames.wordWar) {
                    MiniGames.wordWar.start();
                }
                break;
                
            case 'defdash':
            case 'def-dash':
            case 'definitiondash':
            case 'definition-dash':
            case 'def':
                clearHash();
                if (await ensureMinigames() && MiniGames.definitionDash) {
                    MiniGames.definitionDash.start();
                }
                break;
                
            case 'wordjump':
            case 'word-jump':
            case 'jump':
                clearHash();
                if (await ensureMinigames() && MiniGames.wordJump) {
                    MiniGames.wordJump.start();
                }
                break;
                
            case 'arcade':
            case 'leaderboard':
            case 'highscores':
            case 'scores':
                clearHash();
                if (await ensureMinigames() && MiniGames.showLeaderboard) {
                    MiniGames.showLeaderboard();
                }
                break;
                
            case 'minigames':
            case 'mini-games':
            case 'games':
                clearHash();
                if (await ensureMinigames() && MiniGames.showMenu) {
                    MiniGames.showMenu();
                }
                break;
        }
    }
};

// ============================================================================
// EXPORTS
// ============================================================================
window.Game = Game;
if (typeof ContactManager !== 'undefined') window.ContactManager = ContactManager;
if (typeof PinPad !== 'undefined') window.PinPad = PinPad;
if (typeof SeededShuffle !== 'undefined') window.SeededShuffle = SeededShuffle;
if (typeof LocalPeerManager !== 'undefined') window.LocalPeerManager = LocalPeerManager;
if (typeof RoomManager !== 'undefined') window.RoomManager = RoomManager;

console.log('%c[Game] Module loaded', 'color: #f59e0b; font-weight: bold');

})();
