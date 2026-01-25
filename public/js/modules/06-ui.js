/**
 * ============================================================================
 * GOOD WORD / BAD WORD - UI MODULE (06-ui.js)
 * ============================================================================
 * 
 * Contains:
 * - UIManager: All UI rendering and interaction
 *   - displayWord, fitText, updateStats
 *   - showPostVoteMessage, showMessage
 *   - openSettings, openProfile, showDefinition
 *   - renderMiniRankings, openFullRankings
 *   - updateOfflineIndicator
 * - TipManager: Gameplay tips
 * 
 * Dependencies: 01-core.js, 02-sound.js, 03-api.js, 04-themes.js, 05-effects.js
 * ============================================================================
 */

(function() {
'use strict';

const UIManager = {
    msgTimeout: null,
    showSplash(text, type = 'neutral') {
        const el = document.createElement('div');
        el.className = `fixed inset-0 z-[100] flex items-center justify-center pointer-events-none animate-fade-out`;
        el.innerHTML = `<div class="text-6xl font-black drop-shadow-xl transform scale-150 ${type === 'good' ? 'text-green-500' : type === 'bad' ? 'text-red-500' : 'text-white'}">${text}</div>`;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1000);
    },
    triggerConfetti() {
        if (typeof confetti !== 'undefined') {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#4f46e5', '#10b981', '#f59e0b'] });
        }
    },
    updateStreak(n) {
        if (DOM.header && DOM.header.streak) {
            DOM.header.streak.textContent = n;
            if (n > 0 && n % 10 === 0) {
                DOM.header.streak.classList.add('animate-bounce');
                setTimeout(() => DOM.header.streak.classList.remove('animate-bounce'), 1000);
            }
        }
    },
    addToHistory(word, vote) {
        const list = document.getElementById('history-list');
        if (!list) return;
        const item = document.createElement('div');
        item.className = `flex justify-between items-center p-3 mb-2 rounded-lg bg-white border-l-4 shadow-sm animate-slide-in ${vote === 'good' ? 'border-green-500' : 'border-red-500'}`;
        item.innerHTML = `
            <span class="font-bold text-gray-700">${word}</span>
            <span class="text-xl">${vote === 'good' ? '👍' : '👎'}</span>
        `;
        list.insertBefore(item, list.firstChild);
        if (list.children.length > 50) list.lastChild.remove();
    },
    showMessage(t, err = false) {
        const wd = DOM.game.wordDisplay;
        wd.textContent = t;
        wd.className = `font-bold text-center min-h-[72px] ${err?'text-red-500':'text-gray-500'}`;
        wd.style.fontSize = t.length > 20 ? '1.25rem' : '2.0rem';
        wd.style.cursor = 'default';
        DOM.game.wordFrame.style.padding = '0';
        this.disableButtons(true)
    },
    disableButtons(d) {
        Object.values(DOM.game.buttons).forEach(b => {
            if (!b.id.includes('custom')) b.disabled = d
        })
    },
    showPostVoteMessage(m) {
        const el = DOM.game.message;
        if (this.msgTimeout) clearTimeout(this.msgTimeout);
        el.classList.remove('opacity-100');
        el.classList.add('opacity-0');
        setTimeout(() => {
            el.innerHTML = m;
            el.classList.remove('opacity-0');
            el.classList.add('opacity-100');
            this.msgTimeout = setTimeout(() => {
                el.classList.remove('opacity-100');
                el.classList.add('opacity-0')
            }, 5000)
        }, 150)
    },
updateStats() {
        const w = State.runtime.fullWordList.length > 0 ? State.runtime.fullWordList : State.runtime.allWords;
        if (!w.length) return;
        DOM.header.streak.textContent = State.data.daily.streak || 0;
        DOM.header.userVotes.textContent = State.data.voteCount.toLocaleString();
        const totalGood = w.reduce((a, b) => a + (b.goodVotes || 0), 0);
        const totalBad = w.reduce((a, b) => a + (b.badVotes || 0), 0);
        const globalTotal = totalGood + totalBad;
        DOM.header.globalVotes.textContent = globalTotal.toLocaleString();
        DOM.header.totalWords.textContent = w.length.toLocaleString();
        DOM.header.good.textContent = totalGood.toLocaleString();
        DOM.header.bad.textContent = totalBad.toLocaleString();
        if (globalTotal > 0) {
            const goodPct = (totalGood / globalTotal) * 100;
            const badPct = 100 - goodPct;
            DOM.header.barGood.style.width = `${goodPct}%`;
            DOM.header.barBad.style.width = `${badPct}%`;
        } else {
            DOM.header.barGood.style.width = '50%';
            DOM.header.barBad.style.width = '50%';
        }
        CommunityGoal.update(globalTotal);
        this.renderMiniRankings();
    },
showRoleReveal(title, subtitle, type = 'neutral') {
        const colors = { evil: 'bg-red-600', good: 'bg-green-600', neutral: 'bg-indigo-600' };
        const bg = colors[type] || colors.neutral;
        const el = document.createElement('div');
        el.className = 'fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 px-4';
        el.innerHTML = `
            <div class="w-full max-w-sm p-6 bg-white rounded-2xl shadow-2xl text-center animate-pop">
                <div class="text-6xl mb-4">🤫</div>
                <h2 class="text-3xl font-black text-gray-800 mb-2">${title}</h2>
                <p class="text-gray-600 font-bold mb-6">${subtitle}</p>
                <button id="closeRoleBtn" class="w-full py-3 ${bg} text-white font-bold rounded-xl shadow-lg">UNDERSTOOD</button>
            </div>
        `;
        document.body.appendChild(el);
        document.getElementById('closeRoleBtn').onclick = () => el.remove();
    },
    updateProfileDisplay() {
        const n = State.data.username;
        const p = State.data.profilePhoto;
        DOM.header.profileLabel.textContent = n ? `${n}'s Profile` : 'My Profile';
        DOM.profile.statsTitle.textContent = n ? `${n}'s Stats` : 'Your Stats';
        if (n) DOM.inputs.username.value = n;
        if (p) {
            DOM.header.profileEmoji.classList.add('hidden');
            DOM.header.profileImage.src = p;
            DOM.header.profileImage.classList.remove('hidden');
        } else {
            DOM.header.profileEmoji.classList.remove('hidden');
            DOM.header.profileImage.classList.add('hidden');
        }
        if (p) {
            DOM.profile.modalEmoji.classList.add('hidden');
            DOM.profile.modalImage.src = p;
            DOM.profile.modalImage.classList.remove('hidden');
        } else {
            DOM.profile.modalEmoji.classList.remove('hidden');
            DOM.profile.modalImage.classList.add('hidden');
        }
    },
openProfile() {
        this.updateProfileDisplay();
        const d = State.data;
        const realRecord = Math.max(parseInt(d.longestStreak) || 0, parseInt(d.daily.bestStreak) || 0);
        d.longestStreak = realRecord;
        d.daily.bestStreak = realRecord;
        State.save('longestStreak', realRecord);
        if (DOM.profile.streak) {
            DOM.profile.streak.textContent = d.daily.streak || 0;
            DOM.profile.streak.style.cursor = 'pointer';
            DOM.profile.streak.title = "View Daily Leaderboard";
            DOM.profile.streak.onclick = () => {
                ModalManager.toggle('profile', false);
                const statsBtn = document.getElementById('headerStatsCard');
                if (statsBtn) {
                    statsBtn.click();
                    setTimeout(() => {
                        const target = document.getElementById('dailyStreaksHeader');
                        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 600);
                }
            };
        }
        const streakEl = document.getElementById('streak-display-value');
        if (streakEl) streakEl.textContent = realRecord + " Words";
        const bestEl = document.getElementById('bestDailyStreak');
        if (bestEl) bestEl.textContent = realRecord;
        if (DOM.profile.totalVotes) {
            DOM.profile.totalVotes.textContent = d.voteCount.toLocaleString();
            DOM.profile.totalVotes.style.cursor = 'pointer';
            DOM.profile.totalVotes.onclick = () => {
                ModalManager.toggle('profile', false);
                const statsBtn = document.getElementById('headerStatsCard');
                if (statsBtn) statsBtn.click();
            };
        }
        if (DOM.profile.contributions) DOM.profile.contributions.textContent = d.contributorCount.toLocaleString();
        const goldenEl = document.getElementById('goldenWordsFound');
        if (goldenEl) goldenEl.textContent = d.daily.goldenWordsFound || 0;
        if (d.insectStats.saved >= 100 && !d.badges.saint) State.unlockBadge('saint');
        if (d.insectStats.eaten >= 100 && !d.badges.exterminator) State.unlockBadge('exterminator');
        if (d.insectStats.teased >= 50 && !d.badges.prankster) State.unlockBadge('prankster');
        if (d.voteCount >= 1000 && !d.badges.judge) State.unlockBadge('judge');
        if (d.contributorCount >= 5 && !d.badges.bard) State.unlockBadge('bard');
        if ((d.unlockedThemes.length + 1) >= 5 && !d.badges.traveler) State.unlockBadge('traveler');
        if (d.fishStats.caught >= 250 && !d.badges.angler) State.unlockBadge('angler');
        if (d.fishStats.spared >= 250 && !d.badges.shepherd) State.unlockBadge('shepherd');
        const saved = d.insectStats.saved;
        const eaten = d.insectStats.eaten;
        let karmaTitle = "Garden Observer";
        if (saved > 20 && saved > eaten) karmaTitle = "Friend of Bugs 🐞";
        if (saved > 50 && saved > eaten) karmaTitle = "Guardian of the Garden 🌿";
        if (eaten > 20 && eaten > saved) karmaTitle = "Spider Feeder 🕸️";
        if (eaten > 50 && eaten > saved) karmaTitle = "Spider Sympathiser 🕷️";
        if (saved > 50 && eaten > 50) karmaTitle = "Lord of the Flies 👑";
        if (d.badges.chopper) karmaTitle = "Air Traffic Controller 🚁";
        if (d.badges.angler) karmaTitle = "The Best in Brixham 🎣";
        if (DOM.profile.statsTitle) {
            DOM.profile.statsTitle.innerHTML = `${d.username ? d.username + "'s" : "Your"} Stats<br><span class="text-xs text-indigo-500 font-bold uppercase tracking-widest mt-1 block">${karmaTitle}</span>`;
        }
        const totalAvailable = Object.keys(CONFIG.THEME_SECRETS).length + 1;
        const userCount = d.unlockedThemes.length + 1;
        if (DOM.profile.themes) {
            DOM.profile.themes.textContent = `${userCount} / ${totalAvailable}`;
            DOM.profile.themes.style.cursor = 'pointer';
            DOM.profile.themes.onclick = () => {
                ModalManager.toggle('profile', false);
                ThemeManager.showGallery();
            };
        }
        const row1 = [
            { k: 'cake', i: '🎂', w: 'CAKE' }, { k: 'llama', i: '🦙', w: 'LLAMA' },
            { k: 'potato', i: '🥔', w: 'POTATO' }, { k: 'squirrel', i: '🐿️', w: 'SQUIRREL' },
            { k: 'spider', i: '🕷️', w: 'SPIDER' }, { k: 'germ', i: '🦠', w: 'GERM' },
            { k: 'bone', i: '🦴', w: 'MASON' }
        ];
        const row2 = [
            { k: 'poop', i: '💩', d: 'squelch.' },
            { k: 'penguin', i: '🐧', d: 'noot noot!' },
            { k: 'scorpion', i: '🦂', d: 'I am in your tent.' },
            { k: 'mushroom', i: '🍄', d: 'edible once.' },
            { k: 'needle', i: '💉', d: 'wheedle, wheedle, pry and needle' },
            { k: 'diamond', i: '💎', d: 'hidden Gem.' },
            { k: 'rock', i: '🤘', d: 'space rock!' },
            { k: 'chopper', i: '🚁', d: 'Get to the choppa!' },
            { k: 'snowman', i: '⛄', d: "# We're walking in the air..." }
        ];
        const row_fish = [
            { k: 'fish', i: '🐟', t: 'Blue Fish', d: 'A standard catch.' },
            { k: 'tropical', i: '🐠', t: 'Tropical Fish', d: 'Found in the deep.' },
            { k: 'puffer', i: '🐡', t: 'Pufferfish', d: 'Spiky friend.' },
            { k: 'shark', i: '🦈', t: 'Shark', d: 'Gonna need a bigger boat.' },
            { k: 'octopus', i: '🐙', t: 'The Kraken', d: 'Ink-credible!' }
        ];
        const row3 = [
            { k: 'exterminator', i: '☠️', t: 'The Exterminator', d: 'Fed 100 bugs', val: d.insectStats.eaten, gold: 1000 },
            { k: 'saint', i: '😇', t: 'The Saint', d: 'Saved 100 bugs', val: d.insectStats.saved, gold: 1000 },
            { k: 'prankster', i: '🃏', t: 'Original Prankster', d: 'Teased spider 50 times', val: d.insectStats.teased, gold: 500 },
            { k: 'judge', i: '⚖️', t: 'The Judge', d: 'Cast 1,000 votes', val: d.voteCount, gold: 10000 },
            { k: 'bard', i: '✍️', t: 'The Bard', d: '5 accepted words', val: d.contributorCount, gold: 50 },
            { k: 'traveler', i: '🌍', t: 'The Traveller', d: 'Unlocked 5 themes', val: userCount, gold: 10 },
            { k: 'angler', i: '🔱', t: 'The Best in Brixham', d: 'Caught 250 fish', val: d.fishStats.caught, gold: 2500 },
            { k: 'shepherd', i: '🛟', t: 'Sea Shepherd', d: 'Spared 250 fish', val: d.fishStats.spared, gold: 2500 }
        ];
        const renderRow = (list) => `<div class="flex flex-wrap justify-center gap-3 text-3xl w-full">` + list.map(x => {
            const un = d.badges[x.k];
            let defTitle = x.k.charAt(0).toUpperCase() + x.k.slice(1);
            let classes = `badge-item relative transition-all duration-300 transform `;
            let style = '';
            const isGold = x.gold && x.val >= x.gold;
            if (isGold) {
                defTitle = `✨ GOLD ${x.t || defTitle} ✨`;
                classes += `hover:scale-125 cursor-pointer animate-pulse-slow`;
                style = `text-shadow: 0 0 10px #fbbf24, 0 0 20px #d97706; filter: drop-shadow(0 0 2px rgba(0,0,0,0.5));`;
            } else if (un) {
                classes += `hover:scale-125 cursor-pointer`;
            } else {
                classes += `opacity-25 grayscale`;
            }
            return `<span class="${classes}"
                    style="${style}"
                    title="${un ? (x.t || defTitle) : 'Locked'}"
                    data-key="${x.k}"
                    ${x.w ? `data-word="${x.w}"` : ''}
                    data-title="${un ? (isGold ? '✨ GOLD STATUS ✨' : (x.t || defTitle)) : 'Locked'}"
                    data-desc="${un ? (isGold ? `Legendary! You reached ${x.gold}+ (${x.val})` : (x.d || 'Unlocked!')) : 'Keep playing to find this item!'}"
                    >${x.i}</span>`
        }).join('') + `</div>`;
        let bugJarHTML = '';
        if (saved > 0) {
             const bugCount = Math.min(saved, 40);
             let bugsStr = '';
             for(let i=0; i<bugCount; i++) bugsStr += `<span class="jar-bug" style="cursor: pointer; display: inline-block; padding: 2px;">🦟</span>`;
             bugJarHTML = `<div class="w-full text-center my-4 p-3 bg-green-50 rounded-xl border border-green-100"><div class="text-[10px] font-bold text-green-600 mb-1">THE BUG JAR (${saved})</div><div id="jar-container" class="text-xl">${bugsStr}</div></div>`;
        }
        let bugHotelHTML = '';
        const splattedCount = State.data.insectStats.splatted || 0;
        const collection = State.data.insectStats.collection || [];
        const bugTypes = [{ char: '🦟', type: 'house' }, { char: '🐞', type: 'house' }, { char: '🐝', type: 'house' }, { char: '🚁', type: 'hotel' }];
        const requiredChars = bugTypes.map(b => b.char);
        const isComplete = requiredChars.every(c => collection.includes(c));
        if (splattedCount > 0 || collection.length > 0) {
            let innerHTML = '';
            if (isComplete) {
                innerHTML = `<div class="flex justify-center gap-3 filter drop-shadow-sm mb-1">`;
                bugTypes.forEach(bug => {
                    const style = bug.type === 'hotel' ? 'border-2 border-red-500 bg-red-100 rounded-md shadow-sm text-2xl px-2 py-1' : 'border-2 border-green-500 bg-green-100 rounded-md shadow-sm text-2xl px-2 py-1';
                    innerHTML += `<span class="${style}">${bug.char}</span>`;
                });
                innerHTML += `</div><div class="text-[9px] text-green-700 mt-1 font-bold uppercase tracking-widest">You've won capitalism!</div>`;
                bugHotelHTML = `<div class="w-full text-center my-4 p-3 bg-green-50 rounded-xl border-2 border-green-500 relative overflow-hidden shadow-md"><div class="absolute top-0 right-0 bg-green-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">WINNER</div><div class="text-[10px] font-bold text-green-800 mb-3 uppercase tracking-wider">Bug Street Completed</div>${innerHTML}</div>`;
            } else {
                innerHTML = `<div class="flex justify-center gap-2 flex-wrap">`;
                bugTypes.forEach(bug => {
                    const hasIt = collection.includes(bug.char);
                    innerHTML += hasIt ? `<span class="inline-block p-1 rounded-md ${bug.type==='hotel'?'border-2 border-red-400 bg-white':'border-2 border-green-400 bg-white'} text-2xl">${bug.char}</span>` : `<span class="inline-block p-1 rounded-md border-2 border-dashed border-gray-300 text-2xl grayscale opacity-30">${bug.char}</span>`;
                });
                innerHTML += `</div>`;
                bugHotelHTML = `<div class="w-full text-center my-4 p-3 bg-stone-100 rounded-xl border border-stone-200 relative overflow-hidden"><div class="text-[10px] font-bold text-stone-500 mb-2 uppercase tracking-wider">Bug Street (${collection.length}/4)</div>${innerHTML}</div>`;
            }
        }
        const b = DOM.profile.badges;
        if (b) {
            b.innerHTML =
                `<div class="text-xs font-bold text-gray-500 uppercase mb-2 mt-2">🏆 Word Badges</div>` + renderRow(row1) +
                `<div class="h-px bg-gray-100 w-full my-4"></div><div class="text-xs font-bold text-gray-500 uppercase mb-2">🧸 Found Items</div>` + renderRow(row2) +
                `<div class="h-px bg-gray-100 w-full my-4"></div><div class="text-xs font-bold text-gray-500 uppercase mb-2">🌊 Aquarium</div>` + renderRow(row_fish) +
                bugJarHTML + bugHotelHTML +
                `<div class="h-px bg-gray-100 w-full my-4"></div><div class="text-xs font-bold text-gray-500 uppercase mb-2">🎖️ Achievements</div>` + renderRow(row3);
            const showTooltip = (targetEl, title, desc) => {
                document.querySelectorAll('.global-badge-tooltip').forEach(t => t.remove());
                const tip = document.createElement('div');
                tip.className = 'global-badge-tooltip';
                Object.assign(tip.style, {
                    position: 'fixed', backgroundColor: '#1f2937', color: 'white', padding: '8px 12px',
                    borderRadius: '8px', fontSize: '12px', textAlign: 'center', width: 'max-content',
                    maxWidth: '200px', zIndex: '9999', boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                    pointerEvents: 'none', lineHeight: '1.4', opacity: '0', transition: 'opacity 0.2s'
                });
                tip.innerHTML = `<div class="font-bold text-yellow-300 mb-1 text-sm border-b border-gray-600 pb-1">${title}</div><div class="text-gray-200">${desc}</div>`;
                document.body.appendChild(tip);
                const rect = targetEl.getBoundingClientRect();
                tip.style.top = (rect.top - 60) + 'px';
                tip.style.left = (rect.left + rect.width / 2) + 'px';
                tip.style.transform = 'translateX(-50%)';
                requestAnimationFrame(() => tip.style.opacity = '1');
                targetEl.style.transform = "scale(1.2)";
                setTimeout(() => targetEl.style.transform = "", 200);
                setTimeout(() => { tip.style.opacity = '0'; setTimeout(() => tip.remove(), 200); }, 3000);
            };
            b.querySelectorAll('.badge-item').forEach(el => {
                el.onclick = (e) => {
                    e.stopPropagation();
                    if (el.dataset.word && !el.classList.contains('grayscale')) {
                        Game.loadSpecial(el.dataset.word);
                        ModalManager.toggle('profile', false);
                    } else {
                        showTooltip(el, el.dataset.title, el.dataset.desc);
                    }
                }
            });
            b.querySelectorAll('.jar-bug').forEach(bug => {
                bug.onclick = (e) => {
                    e.stopPropagation();
                    if (State.data.settings.arachnophobiaMode) {
                         showTooltip(bug, "Spider Hidden", "You can't feed the spider while Arachnophobia Mode is on!");
                         return;
                    }
                    if (State.data.currentTheme !== 'halloween') {
                        showTooltip(bug, "Spider Missing", "Please visit the spider on the Halloween theme to feed");
                        return;
                    }
                    ModalManager.toggle('profile', false);
                    State.data.insectStats.saved = Math.max(0, State.data.insectStats.saved - 1);
                    State.save('insectStats', State.data.insectStats);
                    if (typeof MosquitoManager !== 'undefined') MosquitoManager.spawnStuck('🦟');
                    UIManager.showPostVoteMessage("Feeding time! 🕷️");
                };
            });
        }
        ModalManager.toggle('profile', true);
    },
displayWord(w) {
        if (!w) {
            this.showMessage("No words available!");
            return
        }
        if (ContentFilter.isOffensive(w.text)) {
            console.warn('Skipping filtered word');
            State.runtime.currentWordIndex++;
            Game.nextWord();
            return;
        }
        const wd = DOM.game.wordDisplay,
            txt = w.text.toUpperCase();
        wd.textContent = txt;
        const g = w.goodVotes || 0;
        const b = w.badVotes || 0;
        const total = g + b;
        let isContro = false;
        if (total >= 3) {
            const ratio = g / total;
            if (ratio >= 0.40 && ratio <= 0.60) {
                isContro = true;
            }
        }
        this.updateControversialIndicator(isContro);
        const isGolden = State.runtime.isDailyMode &&
                        State.runtime.dailyChallengeType === 'golden' &&
                        State.runtime.goldenWord &&
                        (w._id === State.runtime.goldenWord._id ||
                         String(w._id) === String(State.runtime.goldenWord._id) ||
                         w.text === State.runtime.goldenWord.text);
        wd.className = 'font-extrabold text-gray-900 text-center min-h-[72px]';
        wd.classList.remove('golden-word');
        wd.style.cssText = '';
        wd.style.opacity = '1';
        if (isGolden) {
            // Remove any existing golden style and re-add at end to ensure it loads last
            const existingStyle = document.getElementById('golden-style');
            if (existingStyle) existingStyle.remove();
            
            const s = document.createElement('style');
            s.id = 'golden-style';
            // Use extremely high specificity selectors
            s.textContent = `
                @keyframes golden-glow {
                    0%, 100% { text-shadow: 0 0 10px #fbbf24, 0 0 20px #f59e0b, 0 0 5px #fde68a; }
                    50% { text-shadow: 0 0 20px #fbbf24, 0 0 40px #f59e0b, 0 0 60px #d97706; }
                }
                html body #wordDisplay.golden-word,
                html body.theme-submarine #wordDisplay.golden-word,
                html body.theme-banana #wordDisplay.golden-word,
                html body.theme-woodland #wordDisplay.golden-word,
                html body.theme-ocean #wordDisplay.golden-word,
                html body.theme-flight #wordDisplay.golden-word,
                html body.theme-halloween #wordDisplay.golden-word,
                html body.theme-fire #wordDisplay.golden-word,
                html body.theme-rainbow #wordDisplay.golden-word,
                html body.theme-winter #wordDisplay.golden-word,
                html body.theme-summer #wordDisplay.golden-word,
                html body.theme-dark #wordDisplay.golden-word,
                html body.theme-plymouth #wordDisplay.golden-word,
                html body.theme-space #wordDisplay.golden-word,
                html body.theme-ballpit #wordDisplay.golden-word,
                html body.theme-default #wordDisplay.golden-word {
                    color: #f59e0b !important;
                    text-shadow: 0 0 10px #fbbf24, 0 0 20px #f59e0b !important;
                    animation: golden-glow 1.5s ease-in-out infinite !important;
                    background: none !important;
                    background-clip: unset !important;
                    -webkit-background-clip: unset !important;
                    -webkit-text-fill-color: #f59e0b !important;
                }
            `;
            // Append to end of body to ensure it loads after all other styles
            document.body.appendChild(s);
            
            wd.classList.add('golden-word');
            this.fitText(txt);
            if (!State.runtime.isCoolingDown) this.disableButtons(false);
            wd.style.cursor = 'grab';
            return;
        }
        const t = State.runtime.currentTheme;
        if (['dark', 'halloween', 'submarine', 'fire', 'plymouth'].includes(t)) wd.style.color = '#f3f4f6';
        if (t === 'halloween') {
            wd.style.color = '#FF8C00';
            wd.style.textShadow = '2px 2px 0px #1a0000, 0 0 8px rgba(255,140,0,1), 0 0 15px rgba(255,69,0,0.6)'
        }
        if (t === 'submarine') {
            wd.style.color = '#b0e0e6';
            wd.style.textShadow = '0 0 10px rgba(176,224,230,0.7), 0 0 5px rgba(255,255,255,0.3)';
            wd.style.animation = 'bobbing-word 2.5s ease-in-out infinite'
        }
        if (t === 'fire') {
            wd.style.color = '#ffaa00';
            wd.style.textShadow = '2px 2px 0px #300, 0 0 8px #ff5000, 0 0 20px #ff0000'
        }
        if (t === 'banana') {
            wd.style.color = '#ffd200';
            wd.style.animation = 'bounce-word .5s ease-out infinite alternate'
        }
        if (t === 'winter') {
            wd.style.color = '#01579b';
            wd.classList.remove('animate-snow-text');
            void wd.offsetWidth;
            wd.classList.add('animate-snow-text')
        }
        if (t === 'summer') {
            wd.style.color = '#fffde7';
            wd.style.textShadow = '0 0 5px #fff9c4, 0 0 20px #ffeb3b, 0 0 40px #ff9800, 0 0 70px #ff5722';
            wd.style.animation = 'sun-pulse 4s ease-in-out infinite alternate'
        } else {
            if (!['banana', 'rainbow', 'submarine'].includes(t)) wd.style.animation = 'none'
        }
        if (t === 'rainbow') {
            wd.style.background = 'linear-gradient(45deg, #f00, #ff7f00, #ff0, #0f0, #0ff, #00f, #9400d3)';
            wd.style.webkitBackgroundClip = 'text';
            wd.style.webkitTextFillColor = 'transparent';
            wd.style.color = 'transparent';
            wd.style.animation = 'rainbow-text 5s ease infinite'
        }
        const drift = document.getElementById('card-snow-drift');
        if (t === 'winter') {
            drift.classList.remove('animate-snow-drift');
            void drift.offsetWidth;
            drift.classList.add('animate-snow-drift')
        } else {
            drift.style.height = '0';
        }
        this.fitText(txt);
        if (!State.runtime.isCoolingDown) this.disableButtons(false);
        wd.style.cursor = 'grab'
    },
    fitText(t) {
        const isLarge = State.data.settings.largeText;
        const baseSize = isLarge ? 140 : 96;
        const minSize = isLarge ? 32 : 24;
        const wd = DOM.game.wordDisplay;
        const cW = DOM.game.card.clientWidth - parseFloat(getComputedStyle(DOM.game.card).paddingLeft) * 2;
        wd.style.fontSize = `${baseSize}px`;
        wd.style.whiteSpace = 'nowrap';
        if (wd.scrollWidth > cW) {
            const s = cW / wd.scrollWidth;
            wd.style.fontSize = Math.max(minSize, Math.floor(baseSize * s)) + 'px';
        }
        wd.style.whiteSpace = 'normal';
    },
    renderRankingsImpl(c, l, type, isF) {
        c.innerHTML = '';
        if (!l.length) {
            c.innerHTML = `<p class="text-gray-500">No data yet.</p>`;
            return
        }
        l.forEach((w, i) => {
            const d = document.createElement('div');
            d.className = `flex justify-between items-center py-1 ${isF?'full-ranking-item text-sm':'rank-item'}`;
            const bg = type === 'good' ? 'bg-green-500' : 'bg-red-500',
                val = type === 'good' ? w.score : Math.abs(w.score);
            d.innerHTML = `<div class="flex items-center ${isF?'space-x-3':'space-x-2'}"><span class="font-bold ${isF?'text-base w-8':'text-lg w-5'} text-center text-gray-500 flex-shrink-0">${w.rank||(i+1)}.</span><span class="font-medium text-gray-800">${w.text.toUpperCase()}</span></div><div class="flex items-center space-x-3"><span class="text-xs text-white ${bg} px-2 rounded-full font-bold">${val}</span><span class="text-sm text-gray-600">(${w.good} / ${w.bad})</span></div>`;
            c.appendChild(d)
        })
    },
    getRankedLists(lim) {
        const source = State.runtime.fullWordList.length > 0 ? State.runtime.fullWordList : State.runtime.allWords;
        const r = source.map(w => ({
            text: w.text,
            good: w.goodVotes || 0,
            bad: w.badVotes || 0,
            score: (w.goodVotes || 0) - (w.badVotes || 0)
        }));
        const tg = [...r].sort((a, b) => (b.score - a.score) || ((b.good + b.bad) - (a.good + a.bad)));
        const tb = [...r].sort((a, b) => (a.score - b.score) || ((b.good + b.bad) - (a.good + a.bad)));
        if (lim === 0) return { topGood: tg, topBad: tb };
        return { topGood: tg.slice(0, lim), topBad: tb.slice(0, lim) }
    },
    renderMiniRankings() {
        const { topGood, topBad } = this.getRankedLists(5);
        this.renderRankingsImpl(DOM.rankings.good, topGood, 'good', false);
        this.renderRankingsImpl(DOM.rankings.bad, topBad, 'bad', false)
    },
    renderFullRankings() {
        const { topGood, topBad } = this.getRankedLists(100);
        this.renderRankingsImpl(DOM.rankings.fullGood, topGood, 'good', true);
        this.renderRankingsImpl(DOM.rankings.fullBad, topBad, 'bad', true)
    },
    handleRankSearch() {
        const q = DOM.rankings.searchInput.value.trim().toUpperCase();
        if (!q) return;
        const { topGood, topBad } = this.getRankedLists(0);
        const gI = topGood.findIndex(w => w.text.toUpperCase() === q);
        const bI = topBad.findIndex(w => w.text.toUpperCase() === q);
        DOM.rankings.listsContainer.classList.add('hidden');
        DOM.rankings.searchContainer.classList.remove('hidden');
        const c = DOM.rankings.searchResult;
        if (gI === -1) {
            c.innerHTML = `<p class="text-xl text-gray-700 font-bold">Word not found: ${q}</p>`;
            return
        }
        const w = topGood[gI];
        c.innerHTML = `<div class="p-4 bg-white rounded-xl shadow-sm border border-gray-200 inline-block w-full max-w-sm"><h3 class="text-2xl font-black text-gray-800 mb-4">${w.text.toUpperCase()}</h3><div class="flex justify-around mb-4"><div class="text-center"><div class="text-sm text-gray-500">Good Rank</div><div class="text-3xl font-bold text-green-600">#${gI+1}</div></div><div class="text-center"><div class="text-sm text-gray-500">Bad Rank</div><div class="text-3xl font-bold text-red-600">#${bI+1}</div></div></div><div class="border-t pt-4 flex justify-between text-sm"><span class="font-bold text-green-600">+${w.good} Good</span><span class="font-bold text-red-600">-${w.bad} Bad</span></div></div>`
    },
   updateOfflineIndicator() {
        let ind = document.getElementById('offlineIndicator');
        if (!ind) {
            ind = document.createElement('div');
            ind.id = 'offlineIndicator';
            ind.className = 'fixed top-[75px] right-6 text-xs font-bold px-3 py-2 rounded-full shadow-lg z-50 transition-all duration-300 border-2 select-none cursor-pointer hover:scale-105 active:scale-95';
            ind.onclick = () => {
                const isCurrentlyOffline = OfflineManager.isActive();
                OfflineManager.toggle(!isCurrentlyOffline);
            };
            document.body.appendChild(ind);
        }
        if (OfflineManager.isActive()) {
            ind.style.opacity = '1';
            ind.style.pointerEvents = 'auto';
            ind.style.backgroundColor = '#fef2f2';
            ind.style.borderColor = '#ef4444';
            ind.style.color = '#991b1b';
            const queueCount = State.data.voteQueue?.length || 0;
            const queueText = queueCount > 0 ? ` (${queueCount})` : '';
            ind.innerHTML = `<span style="color:#ef4444">●</span> OFFLINE${queueText}`;
            ind.title = 'Click to go online and sync votes';
        } else {
            ind.style.opacity = '1';
            ind.style.pointerEvents = 'auto';
            ind.style.backgroundColor = '#dcfce7';
            ind.style.borderColor = '#22c55e';
            ind.style.color = '#166534';
            ind.innerHTML = `<span style="color:#22c55e">●</span> ONLINE`;
            ind.title = 'Click to enable offline mode';
        }
    },
        updateControversialIndicator(active) {
        let ind = document.getElementById('controversialIndicator');
        if (!ind) {
            ind = document.createElement('div');
            ind.id = 'controversialIndicator';
            ind.className = 'fixed bottom-4 right-4 bg-orange-100 text-orange-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg z-50 transition-opacity duration-500 pointer-events-none border-2 border-orange-500 flex items-center gap-2';
            ind.innerHTML = '<span class="text-lg">⚔️</span> CONTROVERSIAL';
            document.body.appendChild(ind);
        }
        ind.style.opacity = active ? '1' : '0';
    },
   showCountdown(seconds, callback, isTraitor = false, team = null, vipInfo = null) {
        const old = document.getElementById('game-countdown');
        if (old) old.remove();
        let bgClass = 'bg-indigo-900';
        let roleText = '<div class="text-indigo-300 text-xl font-bold mt-4 tracking-widest opacity-50">GET READY</div>';
        if (isTraitor) {
            bgClass = 'bg-red-900';
            roleText = '<div class="text-red-400 text-3xl font-black animate-pulse mt-4 tracking-widest border-2 border-red-500 px-4 py-1 rounded">YOU ARE THE TRAITOR</div>';
        } else if (team === 'red') {
            bgClass = 'bg-red-800';
            roleText = '<div class="text-red-300 text-3xl font-black animate-pulse mt-4 tracking-widest border-2 border-red-400 px-4 py-2 rounded">🔴 TEAM RED</div>';
        } else if (team === 'blue') {
            bgClass = 'bg-blue-800';
            roleText = '<div class="text-blue-300 text-3xl font-black animate-pulse mt-4 tracking-widest border-2 border-blue-400 px-4 py-2 rounded">🔵 TEAM BLUE</div>';
        } else if (vipInfo) {
            bgClass = vipInfo.isMe ? 'bg-yellow-700' : 'bg-yellow-800';
            if (vipInfo.isMe) {
                roleText = '<div class="text-yellow-200 text-3xl font-black animate-pulse mt-4 tracking-widest border-2 border-yellow-400 px-4 py-2 rounded">⭐ YOU ARE THE VIP</div>';
            } else {
                roleText = `<div class="text-yellow-200 text-2xl font-black mt-4 tracking-widest border-2 border-yellow-400 px-4 py-2 rounded">⭐ The VIP is: ${vipInfo.name}</div>`;
            }
        }
        const el = document.createElement('div');
        el.id = 'game-countdown';
        el.className = `fixed inset-0 ${bgClass} z-[99999] flex flex-col items-center justify-center transition-colors duration-500`;
        el.innerHTML = `
            <div id="cd-text" class="text-white font-black text-9xl animate-ping opacity-90">${seconds}</div>
            ${roleText}
        `;
        document.body.appendChild(el);
        let count = seconds;
        const tick = () => {
            count--;
            if (count > 0) {
                const text = document.getElementById('cd-text');
                if(text) text.innerText = count;
                if (typeof Haptics !== 'undefined') Haptics.medium();
            } else {
                clearInterval(timer);
                const text = document.getElementById('cd-text');
                if(text) {
                    text.innerText = "GO!";
                    text.classList.remove('animate-ping');
                    text.classList.add('animate-bounce');
                }
                if (typeof Haptics !== 'undefined') Haptics.heavy();
                setTimeout(() => {
                    el.remove();
                    if (callback) callback();
                }, 800);
            }
        };
        const timer = setInterval(tick, 1000);
    },
    showDrinkingModal(data) {
        const modalId = 'drinkingModal';
        const old = document.getElementById(modalId);
        if(old) old.remove();
        const drinkersHtml = data.drinkers.map(d =>
            `<div class="font-bold text-lg text-yellow-900 border-b border-yellow-200 last:border-0 py-1">
                ${d.icon || '🍺'} ${d.name} <span class="text-sm font-normal text-yellow-700">- ${d.reason}</span>
            </div>`
        ).join('');
        const html = `
        <div id="${modalId}" class="fixed inset-0 bg-yellow-900/95 z-[10000] flex items-center justify-center p-4 animate-fade-in font-sans">
            <div class="bg-yellow-50 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center border-4 border-yellow-400 transform scale-100">
                <div class="text-6xl mb-4 animate-bounce">🍻</div>
                <h2 class="text-3xl font-black text-yellow-900 mb-2">DRINK PENALTY!</h2>
                <div class="text-yellow-800 font-bold mb-6 text-lg bg-yellow-200 inline-block px-3 py-1 rounded-lg">${data.msg || "Penalty Round"}</div>
                <div class="bg-white rounded-xl p-4 mb-6 border-2 border-yellow-200 shadow-inner max-h-[30vh] overflow-y-auto">
                    ${drinkersHtml || '<div class="text-gray-400 italic">Everyone is safe... for now.</div>'}
                </div>
                <button id="drink-ready-btn" onclick="RoomManager.confirmReady()" class="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl text-xl shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2">
                    <span>👍</span> WE ARE READY
                </button>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', html);
    },
    closeDrinkingModal() {
        const el = document.getElementById('drinkingModal');
        if (el) {
            el.classList.add('opacity-0');
            setTimeout(() => el.remove(), 300);
        }
    },
    showGameOverModal(data) {
        const modalId = 'gameOverModal';
        const old = document.getElementById(modalId);
        if(old) old.remove();
let restartAction = "window.location.reload()";
if (OfflineManager.isActive() || document.body.classList.contains('listening-mode')) {
    restartAction = "document.getElementById('gameOverModal').remove(); Game.resetGame(); Game.nextWord();";
}
else if (window.RoomManager && window.RoomManager.roomCode) {
    restartAction = "RoomManager.rejoin()";
}
        let header = '';
        let body = '';
        if (data.mode === 'okstoopid') {
            const okData = data.okStoopidResult || {};
            const percent = okData.compatibility || 0;
            const matches = okData.matches || 0;
            const totalRounds = okData.totalRounds || RoomManager.currentWordCount || 10;
            let verdict = "AWKWARD...";
            if (percent > 40) verdict = "JUST FRIENDS?";
            if (percent > 60) verdict = "DATING MATERIAL";
            if (percent > 80) verdict = "SOULMATES! 💘";
            if (percent === 100) verdict = "GET A ROOM! 💍";
            header = `<h2 class="text-3xl font-black text-center mb-1 text-pink-600">COMPATIBILITY REPORT</h2>`;
            body = `
                <div class="text-center mb-6">
                    <div class="text-6xl font-black text-indigo-900 mb-2">${percent}%</div>
                    <div class="inline-block bg-pink-100 text-pink-700 px-4 py-1 rounded-full font-bold text-sm border border-pink-200">${verdict}</div>
                    <div class="text-sm text-gray-500 mt-3">Matched ${matches} of ${totalRounds} words</div>
                </div>
            `;
            setTimeout(() => {
                if(ShareManager && ShareManager.shareCompatibility) {
                    const p1 = data.rankings[0]?.name || "P1";
                    const p2 = data.rankings[1]?.name || "P2";
                    const shareBtn = document.getElementById('share-result-btn');
                    if(shareBtn) shareBtn.onclick = () => ShareManager.shareCompatibility(p1, p2, percent, matches, totalRounds);
                }
            }, 100);
        }
        else if (data.mode === 'traitor') {
            const rankings = data.rankings || [];
            const traitor = rankings.find(p => p.id === data.specialRoleId);
            const traitorName = traitor ? traitor.name : "Unknown";
            const isTraitorWin = data.msg && data.msg.includes("Traitor Wins");
            header = `<h2 class="text-3xl font-black text-center mb-2 ${isTraitorWin ? 'text-red-600' : 'text-green-600'}">
                ${isTraitorWin ? 'TRAITOR WINS!' : 'TEAM WINS!'}
            </h2>`;
            body = `
                <div class="bg-gray-800 text-white p-4 rounded-xl text-center mb-6">
                    <div class="text-xs uppercase tracking-widest text-gray-400 mb-1">THE TRAITOR WAS</div>
                    <div class="text-2xl font-black text-red-400">${traitorName}</div>
                </div>
            `;
        }
        else if (data.mode === 'versus') {
            const redScore = data.scores.red || 0;
            const blueScore = data.scores.blue || 0;
            let winner = redScore > blueScore ? "🔴 RED TEAM WINS!" : (blueScore > redScore ? "🔵 BLUE TEAM WINS!" : "🤝 IT'S A TIE!");
            header = `<h2 class="text-3xl font-black text-center mb-4 text-gray-800">${winner}</h2>`;
            body = `
                <div class="flex justify-center gap-4 mb-6 w-full">
                    <div class="flex-1 bg-red-50 border-2 border-red-100 p-3 rounded-xl text-center">
                        <div class="text-red-500 font-bold text-xs">RED TEAM</div>
                        <div class="text-3xl font-black text-red-700">${redScore}</div>
                    </div>
                    <div class="flex-1 bg-blue-50 border-2 border-blue-100 p-3 rounded-xl text-center">
                        <div class="text-blue-500 font-bold text-xs">BLUE TEAM</div>
                        <div class="text-3xl font-black text-blue-700">${blueScore}</div>
                    </div>
                </div>`;
        }
        else {
            header = `<h2 class="text-3xl font-black text-center mb-4 text-indigo-700">GAME OVER</h2>`;
            if (data.msg) body += `<p class="text-center text-gray-500 font-bold mb-6 bg-gray-100 p-2 rounded-lg">${data.msg}</p>`;
        }
        let listHtml = '';
        if (data.rankings) {
            data.rankings.forEach((p, i) => {
                const isMe = p.id === RoomManager.playerId;
                const isTraitor = p.id === data.specialRoleId;
                let badge = '';
                if (data.mode === 'survival' && (p.lives <= 0)) badge = '💀';
                if (data.mode === 'traitor' && isTraitor) badge = '🕵️';
                listHtml += `
                <div class="flex justify-between items-center p-2 border-b border-gray-100 last:border-0 ${isMe ? 'bg-indigo-50 rounded' : ''}">
                    <div class="flex items-center gap-2">
                        <span class="font-bold text-gray-300 w-6 text-sm">#${i+1}</span>
                        <span class="font-bold ${isMe ? 'text-indigo-600' : 'text-gray-600'} text-sm truncate max-w-[120px]">
                            ${p.name || 'Guest'} ${isMe ? '(You)' : ''}
                        </span>
                        <span>${badge}</span>
                    </div>
                    <span class="font-mono font-bold text-gray-800 text-sm">${p.score} pts</span>
                </div>`;
            });
        }
        const html = `
        <div id="${modalId}" class="fixed inset-0 bg-black/80 z-[10000] flex items-center justify-center p-4 animate-fade-in font-sans">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 transform scale-100 relative overflow-hidden">
                <button onclick="window.location.href = window.location.pathname" class="absolute top-3 right-4 text-gray-400 hover:text-gray-600 font-bold text-2xl z-10">&times;</button>
                ${header}
                ${body}
                <div class="bg-white border border-gray-200 rounded-xl mb-6 max-h-[30vh] overflow-y-auto custom-scrollbar">
                    ${listHtml}
                </div>
                <div class="flex flex-col gap-3">
                    ${data.mode === 'okstoopid' ? `<button id="share-result-btn" class="w-full py-3 bg-pink-100 hover:bg-pink-200 text-pink-600 font-bold rounded-xl transition">📸 Share Coupon</button>` : ''}
<button onclick="${restartAction}" class="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xl shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2">
    <span>🔄</span> PLAY AGAIN
</button>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', html);
    },
showKickConfirm(targetId, name) {
        const el = document.createElement('div');
        el.id = 'kickConfirmModal';
        el.className = 'fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 p-4 animate-fade-in font-sans';
        el.innerHTML = `
            <div class="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl animate-pop">
                <h3 class="text-2xl font-black text-gray-800 mb-2">KICK PLAYER?</h3>
                <p class="text-gray-500 font-bold mb-6">Are you sure you want to remove <span class="text-red-500">${name}</span>?</p>
                <div class="flex gap-3">
                    <button onclick="document.getElementById('kickConfirmModal').remove()" class="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition">CANCEL</button>
                    <button onclick="RoomManager.emitKick('${targetId}'); document.getElementById('kickConfirmModal').remove()" class="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 shadow-lg transition">KICK ✕</button>
                </div>
            </div>
        `;
        document.body.appendChild(el);
    },
    showKickedModal() {
        document.getElementById('lobbyModal')?.remove();
        document.getElementById('mpMenu')?.remove();
        const banner = document.querySelector('.mp-banner-text');
        if(banner) banner.remove();
        const el = document.createElement('div');
        el.className = 'fixed inset-0 z-[20000] flex items-center justify-center bg-red-900/95 p-4 animate-fade-in font-sans';
        el.innerHTML = `
            <div class="bg-white rounded-2xl p-8 w-full max-w-sm text-center shadow-2xl animate-pop border-4 border-red-500">
                <div class="text-6xl mb-4">🥾</div>
                <h2 class="text-3xl font-black text-gray-800 mb-2">KICKED!</h2>
                <p class="text-gray-500 font-bold mb-6">The host has removed you from the room.</p>
                <button onclick="window.location.href = window.location.pathname" class="w-full py-4 bg-gray-800 text-white font-bold rounded-xl text-xl shadow-lg hover:bg-gray-900 transition transform active:scale-95">
                    RETURN TO MENU
                </button>
            </div>
        `;
        document.body.appendChild(el);
    },
showProfile() {
        const modalId = 'profileModal';
        document.getElementById(modalId)?.remove();
        const streak = State.data.daily?.streak || 0;
        const total = State.data.voteCount || 0;
        const name = State.data.username || "Guest";
        const html = `
        <div id="${modalId}" class="fixed inset-0 bg-black/80 z-[10000] flex items-center justify-center p-4 animate-fade-in font-sans">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 transform scale-100 relative overflow-hidden text-center">
                <button onclick="document.getElementById('${modalId}').remove()" class="absolute top-3 right-4 text-gray-400 text-2xl">&times;</button>
                <h2 class="text-3xl font-black text-gray-800 mb-6">PROFILE</h2>
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="bg-orange-50 p-4 rounded-xl border border-orange-100">
                        <div class="text-3xl mb-1">🔥</div>
                        <div class="font-black text-2xl text-orange-600">${streak}</div>
                        <div class="text-xs font-bold text-orange-400">DAY STREAK</div>
                    </div>
                    <div class="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <div class="text-3xl mb-1">🗳️</div>
                        <div class="font-black text-2xl text-blue-600">${total}</div>
                        <div class="text-xs font-bold text-blue-400">TOTAL VOTES</div>
                    </div>
                </div>
                <div class="bg-gray-50 p-3 rounded-lg text-sm text-gray-500 font-bold mb-4">
                    Playing as: <span class="text-indigo-600">${name}</span>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', html);
    },
expandQR(src) {
        const el = document.createElement('div');
        el.className = 'fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 p-4 animate-fade-in cursor-pointer';
        el.onclick = () => el.remove();
        el.innerHTML = `
            <div class="relative flex flex-col items-center">
                <img src="${src}" class="max-w-full max-h-[70vh] rounded-2xl shadow-2xl border-4 border-white transform scale-100 animate-pop">
                <div class="mt-8 text-white font-black text-2xl tracking-widest animate-pulse">TAP TO CLOSE</div>
            </div>
        `;
        document.body.appendChild(el);
    }
};
const PinPad = {
    input: '',
    mode: 'set', // 'set' or 'verify'
    onSuccess: null,
    onCancel: null,
    MAX_ATTEMPTS: 3,
    LOCKOUT_MS: 60000,
    init() {
        if (document.getElementById('pinPadModal')) return;
        const el = document.createElement('div');
        el.id = 'pinPadModal';
        el.className = 'fixed inset-0 bg-gray-900 bg-opacity-95 z-[200] hidden flex items-center justify-center';
        el.innerHTML = `
            <div class="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl transform transition-all scale-100">
                <h3 id="pinTitle" class="text-2xl font-bold text-center mb-2 text-gray-800">Parent Lock</h3>
                <p id="pinSubtitle" class="text-gray-500 text-center mb-6 text-sm transition-colors duration-200">Enter PIN</p>
                <div id="pinDots" class="flex justify-center gap-4 mb-8">
                    <div class="w-4 h-4 rounded-full bg-gray-200 border-2 border-gray-100"></div>
                    <div class="w-4 h-4 rounded-full bg-gray-200 border-2 border-gray-100"></div>
                    <div class="w-4 h-4 rounded-full bg-gray-200 border-2 border-gray-100"></div>
                    <div class="w-4 h-4 rounded-full bg-gray-200 border-2 border-gray-100"></div>
                </div>
                <div class="grid grid-cols-3 gap-4 mb-6">
                    ${[1,2,3,4,5,6,7,8,9].map(n =>
                        `<button onclick="PinPad.handleInput('${n}')" class="h-16 w-16 rounded-full bg-gray-100 text-2xl font-bold text-gray-700 active:bg-gray-200 active:scale-95 transition-all mx-auto flex items-center justify-center">${n}</button>`
                    ).join('')}
                    <div class="h-16 w-16"></div>
                    <button onclick="PinPad.handleInput('0')" class="h-16 w-16 rounded-full bg-gray-100 text-2xl font-bold text-gray-700 active:bg-gray-200 active:scale-95 transition-all mx-auto flex items-center justify-center">0</button>
                    <button onclick="PinPad.handleInput('back')" class="h-16 w-16 rounded-full bg-red-50 text-red-500 active:bg-red-100 active:scale-95 transition-all mx-auto flex items-center justify-center">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z"></path></svg>
                    </button>
                </div>
                <button onclick="PinPad.close()" class="w-full py-3 text-gray-500 font-semibold active:text-gray-700">Cancel</button>
            </div>
        `;
        document.body.appendChild(el);
    },
    open(mode, onSuccess, onCancel) {
        this.init();
        if (mode === 'verify' && this.isLocked()) {
             const remaining = Math.ceil((this.getLockoutTime() - Date.now()) / 1000);
             alert(`System is locked for ${remaining} more seconds.`);
             return;
        }
        this.mode = mode || 'verify';
        this.onSuccess = onSuccess;
        this.onCancel = onCancel;
        this.input = '';
        this.updateDisplay();
        const m = document.getElementById('pinPadModal');
        const t = document.getElementById('pinTitle');
        const s = document.getElementById('pinSubtitle');
        if (this.mode === 'set') {
            t.textContent = "Create PIN";
            s.textContent = "Set a 4-digit code for parents";
            s.className = "text-gray-500 text-center mb-6 text-sm";
        } else {
            t.textContent = "Parent Lock";
            s.textContent = "Enter PIN to unlock settings";
            s.className = "text-gray-500 text-center mb-6 text-sm";
        }
        m.classList.remove('hidden');
    },
    close(success = false) {
        const el = document.getElementById('pinPadModal');
        if (el) el.classList.add('hidden');
        if (!success && this.onCancel) this.onCancel();
    },
    handleInput(val) {
        Haptics.light();
        if (val === 'back') {
            this.input = this.input.slice(0, -1);
        } else if (this.input.length < 4) {
            this.input += val;
        }
        this.updateDisplay();
        if (this.input.length === 4) {
            setTimeout(() => this.submit(), 300);
        }
    },
    updateDisplay() {
        const dots = document.querySelectorAll('#pinDots div');
        dots.forEach((d, i) => {
            if (i < this.input.length) {
                d.className = 'w-4 h-4 rounded-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)] transform scale-110 transition-all duration-200';
            } else {
                d.className = 'w-4 h-4 rounded-full bg-gray-200 border-2 border-gray-100 transition-all duration-200';
            }
        });
    },
    submit() {
        const s = document.getElementById('pinSubtitle');
        if (this.mode === 'set') {
            if (this.onSuccess) this.onSuccess(this.input);
            this.close(true);
        } else {
            if (this.isLocked()) {
                const remaining = Math.ceil((this.getLockoutTime() - Date.now()) / 1000);
                alert(`Locked! Wait ${remaining}s`); // Fallback
                this.close(false);
                return;
            }
            const savedPin = State.data.settings.kidsModePin;
            if (this.input === savedPin) {
                Haptics.medium();
                this.resetSecurity();
                if (this.onSuccess) this.onSuccess();
                this.close(true);
            } else {
                Haptics.heavy();
                this.shakeBox();
                const attempts = this.recordFailure();
                if (attempts >= this.MAX_ATTEMPTS) {
                     s.textContent = "LOCKED FOR 60 SECONDS!";
                     s.className = "text-red-600 font-bold text-center mb-6 text-sm animate-pulse";
                     setTimeout(() => {
                        alert("Too many failed attempts. Parental controls locked for 60 seconds.");
                        this.close(false);
                     }, 500);
                } else {
                     const left = this.MAX_ATTEMPTS - attempts;
                     s.textContent = `Wrong PIN! ${left} attempts remaining`;
                     s.className = "text-red-500 font-semibold text-center mb-6 text-sm";
                     setTimeout(() => {
                         this.input = '';
                         this.updateDisplay();
                     }, 1000);
                }
            }
        }
    },
    shakeBox() {
        const box = document.querySelector('#pinPadModal > div');
        if (box) {
            box.classList.remove('animate-shake');
            void box.offsetWidth;
            box.classList.add('animate-shake');
        }
    },
    getAttempts() {
        return parseInt(localStorage.getItem('pin_attempts') || 0);
    },
    getLockoutTime() {
        return parseInt(localStorage.getItem('pin_lockout_until') || 0);
    },
    isLocked() {
        const lockout = this.getLockoutTime();
        if (lockout > Date.now()) return true;
        if (lockout !== 0 && lockout < Date.now()) {
            this.resetSecurity();
        }
        return false;
    },
    recordFailure() {
        const newAttempts = this.getAttempts() + 1;
        localStorage.setItem('pin_attempts', newAttempts);
        if (newAttempts >= this.MAX_ATTEMPTS) {
            localStorage.setItem('pin_lockout_until', Date.now() + this.LOCKOUT_MS);
        }
        return newAttempts;
    },
    resetSecurity() {
        localStorage.removeItem('pin_attempts');
        localStorage.removeItem('pin_lockout_until');
    }
};
window.PinPad = PinPad;
const ModalManager = {
    toggle(id, show) {
        const e = DOM.modals[id];
        e.classList.toggle('hidden', !show);
        e.classList.toggle('flex', show)
    },
init() {
        document.getElementById('showSettingsButton').onclick = () => {
            const s = State.data.settings;
            const container = document.getElementById('settingsModalContainer').querySelector('.space-y-4');
            if (container) {
                container.classList.add('max-h-[60vh]', 'overflow-y-auto', 'pr-2');
                const mkTog = (id, label, checked, color = 'text-indigo-600') => `
                    <div class="flex items-center justify-between">
                        <label for="${id}" class="text-lg font-medium text-gray-700">${label}</label>
                        <input type="checkbox" id="${id}" ${checked ? 'checked' : ''}
                               class="h-6 w-6 ${color} border-gray-300 rounded focus:ring-indigo-500">
                    </div>`;
                let html = '';
                const isOffline = s.offlineMode || false;
                html += `<div class="mb-6">
                    <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-100 pb-1">Network</h3>
                    <div class="space-y-4">`;
                html += mkTog('toggleOffline', '🚇 Offline Mode', isOffline, 'text-gray-800');
                html += `<p class="text-xs text-gray-400 mt-1">Saves words locally. Votes sync when you reconnect.</p>`;
                html += `</div></div>`;
                html += `<div class="mb-6"><h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-100 pb-1">Settings</h3><div class="space-y-4">`;
                html += mkTog('toggleNoStreaks', '🧘 No Streaks, please!', s.noStreaksMode);
                html += `<p class="text-xs text-gray-400 mt-1 mb-2">Hides timers and streak counters for a relaxed game.</p>`;
                if (State.data.unlockedThemes.length > 0) {
                     html += mkTog('toggleRandomTheme', '🔀 Randomise Theme on Load', s.randomizeTheme);
                }
                html += mkTog('togglePercentages', 'Show Vote Percentages', s.showPercentages);
                html += mkTog('toggleTips', 'Show Tips & Hints', s.showTips);
                html += `<button onclick="TipManager.open()" class="w-full mt-2 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-lg border border-indigo-100 hover:bg-indigo-100 transition">💡 Submit Your Own Tip</button>`;
                html += mkTog('toggleZeroVotes', 'Show Only New Words (0/0)', s.zeroVotesOnly);
                html += mkTog('toggleControversial', 'Show Only Controversial Words', s.controversialOnly, 'text-orange-600');
                html += `</div></div>`;
                html += `<div class="mb-6"><h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-100 pb-1">Accessibility</h3><div class="space-y-4">`;
                html += mkTog('toggleColorblind', 'Colourblind Mode', s.colorblindMode);
                html += mkTog('toggleLargeText', 'Increase Text Size', s.largeText);
                html += mkTog('toggleMute', 'Mute All Sounds', s.muteSounds);
                if (State.data.unlockedThemes.includes('halloween')) {
                    html += mkTog('toggleArachnophobia', '🚫 Arachnophobia Mode', s.arachnophobiaMode);
                }
                html += mkTog('toggleKidsMode', '🧸 Kids Mode', s.kidsMode, 'text-pink-600');
                html += `</div></div>`;
                html += `<div><h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-100 pb-1">Fun</h3><div class="space-y-4">`;
                html += mkTog('toggleTilt', 'Gravity Tilt (Default Theme)', s.enableTilt);
                html += mkTog('toggleMirror', 'Mirror Mode', s.mirrorMode);
                html += mkTog('toggleLights', '🎄 Christmas Lights', s.showLights, 'text-green-600');
                html += mkTog('toggleWeather', '🌧️ Real-time Weather', s.enableWeather, 'text-blue-500');
                html += `<p class="text-xs text-gray-400 mt-1 mb-2">Requires location. ...only happens if it's raining (or snowing)!</p>`;
                html += `</div></div>`;
                html += `<div><h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-100 pb-1">Interface</h3><div class="space-y-4">`;
                html += mkTog('toggleHideMultiplayer', 'Hide Multiplayer Button', s.hideMultiplayer);
                html += mkTog('toggleHideCards', '🎨 Hide Cards (Theme Mode)', s.hideCards);
                html += `<p class="text-xs text-gray-400 mt-1 mb-2">Hides the game cards to just enjoy the theme background.</p>`;
                html += mkTog('toggleHideProfile', '👤 Hide Profile Card', s.hideProfile);
                html += mkTog('toggleHideVotesBar', '📊 Hide Votes Bar', s.hideVotesBar);
                html += mkTog('toggleHideTopWords', '📝 Hide Top Good/Bad Words', s.hideTopWords);
                html += `</div></div>`;
                if (!s.kidsMode) {
                html += `<div class="mt-8 pt-4 border-t-2 border-gray-100">
                    <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Data Management</h3>
                    <p class="text-xs text-gray-500 mb-4">Please clear local data or back up your game statistics and achievements here.</p>
                    <div class="grid grid-cols-2 gap-3 mb-3">
                        <button id="exportSaveBtn" class="py-2 bg-blue-50 text-blue-600 font-bold rounded-lg border border-blue-100 hover:bg-blue-100 transition flex items-center justify-center gap-2">
                            💾 Back Up!
                        </button>
                        <button id="importSaveBtn" class="py-2 bg-blue-50 text-blue-600 font-bold rounded-lg border border-blue-100 hover:bg-blue-100 transition flex items-center justify-center gap-2">
                            📂 Back Down!
                        </button>
                    </div>
                    <input type="file" id="importFileInput" accept=".json" class="hidden">
                    <button id="clearAllDataButton" class="w-full py-2 bg-red-50 text-red-600 font-bold rounded-lg border border-red-100 hover:bg-red-100 transition flex items-center justify-center gap-2">
                        🗑️ Clear All Data
                    </button>
                </div>`;
                }
                container.innerHTML = html;
                document.getElementById('toggleOffline').onchange = e => OfflineManager.toggle(e.target.checked);
                document.getElementById('togglePercentages').onchange = e =>
                    State.save('settings', { ...State.data.settings, showPercentages: e.target.checked });
                document.getElementById('toggleTips').onchange = e =>
                    State.save('settings', { ...State.data.settings, showTips: e.target.checked });
                    const randBtn = document.getElementById('toggleRandomTheme');
                if (randBtn) {
                    randBtn.onchange = e => State.save('settings', { ...State.data.settings, randomizeTheme: e.target.checked });
                }
                document.getElementById('toggleZeroVotes').onchange = e => {
                    const isChecked = e.target.checked;
                    const newSettings = { ...State.data.settings, zeroVotesOnly: isChecked };
                    if (isChecked) {
                        newSettings.controversialOnly = false;
                        const cBtn = document.getElementById('toggleControversial');
                        if(cBtn) cBtn.checked = false;
                    }
                    State.save('settings', newSettings);
                    Game.refreshData(true);
                };
                document.getElementById('toggleControversial').onchange = e => {
                    const isChecked = e.target.checked;
                    const newSettings = { ...State.data.settings, controversialOnly: isChecked };
                    if (isChecked) {
                        newSettings.zeroVotesOnly = false;
                        const zBtn = document.getElementById('toggleZeroVotes');
                        if(zBtn) zBtn.checked = false;
                    }
                    State.save('settings', newSettings);
                    Game.refreshData(true);
                };
                document.getElementById('toggleNoStreaks').onchange = e => {
                    State.save('settings', { ...State.data.settings, noStreaksMode: e.target.checked });
                    UIManager.updateStats();
                    const floatEl = document.getElementById('streak-floating-counter');
                    if (floatEl) floatEl.remove();
                };
                document.getElementById('toggleColorblind').onchange = e => {
                    State.save('settings', { ...State.data.settings, colorblindMode: e.target.checked });
                    Accessibility.apply();
                };
                document.getElementById('toggleLargeText').onchange = e => {
                    State.save('settings', { ...State.data.settings, largeText: e.target.checked });
                    Accessibility.apply();
                };
                const hideMultiplayerToggle = document.getElementById('toggleHideMultiplayer');
                if (hideMultiplayerToggle) {
                    hideMultiplayerToggle.onchange = e => {
                        State.save('settings', { ...State.data.settings, hideMultiplayer: e.target.checked });
                        const roomBtn = document.getElementById('roomBtn');
                        if (roomBtn) {
                            const shouldHide = e.target.checked || State.data.settings.kidsMode;
                            roomBtn.style.display = shouldHide ? 'none' : '';
                        }
                    };
                }
                const hideCardsToggle = document.getElementById('toggleHideCards');
                if (hideCardsToggle) {
                    hideCardsToggle.onchange = e => {
                        State.save('settings', { ...State.data.settings, hideCards: e.target.checked });
                        Game.applyHideCards(e.target.checked);
                    };
                }
                const hideProfileToggle = document.getElementById('toggleHideProfile');
                if (hideProfileToggle) {
                    hideProfileToggle.onchange = e => {
                        State.save('settings', { ...State.data.settings, hideProfile: e.target.checked });
                        Game.applyUIVisibility();
                    };
                }
                const hideVotesBarToggle = document.getElementById('toggleHideVotesBar');
                if (hideVotesBarToggle) {
                    hideVotesBarToggle.onchange = e => {
                        State.save('settings', { ...State.data.settings, hideVotesBar: e.target.checked });
                        Game.applyUIVisibility();
                    };
                }
                const hideTopWordsToggle = document.getElementById('toggleHideTopWords');
                if (hideTopWordsToggle) {
                    hideTopWordsToggle.onchange = e => {
                        State.save('settings', { ...State.data.settings, hideTopWords: e.target.checked });
                        Game.applyUIVisibility();
                    };
                }
                document.getElementById('toggleMute').onchange = e => {
                    State.save('settings', { ...State.data.settings, muteSounds: e.target.checked });
                    SoundManager.updateMute();
                };
                const arachBtn = document.getElementById('toggleArachnophobia');
                if (arachBtn) {
                    arachBtn.onchange = e => {
                        const isSafe = e.target.checked;
                        State.save('settings', { ...State.data.settings, arachnophobiaMode: isSafe });
                        if (isSafe && typeof MosquitoManager !== 'undefined' && MosquitoManager.state === 'stuck') {
                             State.data.insectStats.saved++;
                             State.save('insectStats', State.data.insectStats);
                             MosquitoManager.remove();
                             UIManager.showPostVoteMessage("Bug returned to jar! 🦟");
                        }
                        if (State.data.currentTheme === 'halloween') {
                            Effects.halloween(true);
                        }
                    };
                }
                document.getElementById('toggleKidsMode').onchange = e => {
                    const turningOn = e.target.checked;
                    const savedPin = State.data.settings.kidsModePin;
                    const roomBtn = document.getElementById('roomBtn');
                    e.preventDefault();
                    const updateMultiplayerVisibility = (kidsOn) => {
                        if (roomBtn) {
                            roomBtn.style.display = (kidsOn || State.data.settings.hideMultiplayer) ? 'none' : '';
                        }
                    };
                    if (turningOn) {
                        if (!savedPin) {
                            e.target.checked = false;
                            PinPad.open('set', (newPin) => {
                                State.save('settings', { ...State.data.settings, kidsMode: true, kidsModePin: newPin });
                                UIManager.showPostVoteMessage(`Kids Mode Active! 🧸`);
                                updateMultiplayerVisibility(true);
                                Game.refreshData(true);
                                this.toggle('settings', false);
                            }, () => {
                                document.getElementById('toggleKidsMode').checked = false;
                            });
                        } else {
                            State.save('settings', { ...State.data.settings, kidsMode: true });
                            updateMultiplayerVisibility(true);
                            Game.refreshData(true);
                            ModalManager.toggle('settings', false);
                        }
                    } else {
                        e.target.checked = true;
                        if (!savedPin) {
                            State.save('settings', { ...State.data.settings, kidsMode: false });
                            updateMultiplayerVisibility(false);
                            Game.refreshData(true);
                            return;
                        }
                        PinPad.open('verify', () => {
                            State.save('settings', { ...State.data.settings, kidsMode: false });
                            updateMultiplayerVisibility(false);
                            Game.refreshData(true);
                            document.getElementById('toggleKidsMode').checked = false;
                            ModalManager.toggle('settings', false);
                        }, () => {
                            document.getElementById('toggleKidsMode').checked = true;
                        });
                    }
                };
                document.getElementById('toggleTilt').onchange = e => {
                    State.save('settings', { ...State.data.settings, enableTilt: e.target.checked });
                    TiltManager.refresh();
                    if (window.WeatherManager) window.WeatherManager.updateVisuals();
                };
                document.getElementById('toggleMirror').onchange = e => {
                    State.save('settings', { ...State.data.settings, mirrorMode: e.target.checked });
                    Accessibility.apply();
                };
                document.getElementById('toggleLights').onchange = e => {
                    State.save('settings', { ...State.data.settings, showLights: e.target.checked });
                    Game.updateLights();
                };
                const wToggle = document.getElementById('toggleWeather');
                if (wToggle) {
                    wToggle.onchange = e => WeatherManager.toggle(e.target.checked);
                }
                const exportBtn = document.getElementById('exportSaveBtn');
                const importInput = document.getElementById('importFileInput');
                const importBtn = document.getElementById('importSaveBtn');
                const clearBtn = document.getElementById('clearAllDataButton');
                if (exportBtn) exportBtn.onclick = () => DataManager.exportData();
                if (importBtn && importInput) {
                    importBtn.onclick = () => importInput.click();
                    importInput.onchange = (e) => {
                        if (e.target.files.length > 0) {
                            DataManager.importData(e.target.files[0]);
                        }
                        e.target.value = '';
                    };
                }
                if (clearBtn) clearBtn.onclick = State.clearAll;
            }
            this.toggle('settings', true)
        };
        document.getElementById('closeSettingsModal').onclick = () => this.toggle('settings', false);
        DOM.game.buttons.custom.onclick = () => {
            DOM.inputs.newWord.value = '';
            DOM.inputs.modalMsg.textContent = '';
            this.toggle('submission', true)
        };
        document.getElementById('cancelSubmitButton').onclick = () => this.toggle('submission', false);
        DOM.rankings.btnShow.onclick = () => {
            UIManager.renderFullRankings();
            this.toggle('fullRankings', true)
        };
        document.getElementById('closeFullRankingsModal').onclick = () => this.toggle('fullRankings', false);
        document.getElementById('compareWordsButton').onclick = () => {
            DOM.inputs.wordOne.value = '';
            DOM.inputs.wordTwo.value = '';
            DOM.inputs.compareResults.innerHTML = 'Type words above to see who wins!';
            this.toggle('compare', true)
        };
        document.getElementById('closeCompareModal').onclick = () => this.toggle('compare', false);
        DOM.game.wordDisplay.onclick = () => Game.showDefinition();
        const shareBtn = document.getElementById('shareWordButton');
        if (shareBtn) {
            shareBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                const currentWord = State.runtime.allWords[State.runtime.currentWordIndex];
                if (currentWord) ShareManager.shareWord(currentWord.text);
            };
        }
        document.getElementById('closeDefinitionModal').onclick = () => this.toggle('definition', false);
        DOM.rankings.searchBtn.onclick = () => UIManager.handleRankSearch();
        DOM.rankings.clearSearch.onclick = () => {
            DOM.rankings.searchInput.value = '';
            DOM.rankings.searchContainer.classList.add('hidden');
            DOM.rankings.listsContainer.classList.remove('hidden')
        };
        DOM.header.userStatsBar.onclick = () => UIManager.openProfile();
        document.getElementById('closeProfileModal').onclick = () => this.toggle('profile', false);
        document.getElementById('saveUsernameBtn').onclick = async () => {
            const n = DOM.inputs.username.value.trim(),
                m = DOM.profile.saveMsg;
            if (!n || n.includes(' ') || n.length > 45) {
                m.textContent = "Invalid name (no spaces).";
                m.className = "text-xs text-red-500 mt-1 font-bold";
                return
            }
            State.save('username', n);
            UIManager.updateProfileDisplay();
            m.textContent = "Saved!";
            m.className = "text-xs text-green-500 mt-1 font-bold";
            const e = State.runtime.allWords.some(w => w.text.toUpperCase() === n.toUpperCase());
            if (!e) {
                m.textContent = "Saved & submitted as new word!";
                try {
                    await API.submitWord(n);
                    State.incrementContributor()
                } catch {
                    console.error("Failed to auto-submit")
                }
            }
            setTimeout(() => m.textContent = '', 2000)
        };
        document.getElementById('shareProfileButton').onclick = () => ShareManager.share();
        DOM.daily.closeBtn.onclick = () => {
            this.toggle('dailyResult', false);
            Game.disableDailyMode()
        };
        DOM.profile.photoInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (file.size > 2 * 1024 * 1024) {
                alert("File too large. Please choose an image under 2MB.");
                return;
            }
            const reader = new FileReader();
            reader.onload = (readerEvent) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_SIZE = 150;
                    let width = img.width;
                    let height = img.height;
                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                    State.save('profilePhoto', dataUrl);
                    UIManager.updateProfileDisplay();
                    DOM.profile.saveMsg.textContent = "Photo Updated!";
                    DOM.profile.saveMsg.className = "text-xs text-green-500 mt-1 font-bold";
                    setTimeout(() => DOM.profile.saveMsg.textContent = '', 2000);
                };
                img.src = readerEvent.target.result;
            };
            reader.readAsDataURL(file);
        };
        const btnGood = document.getElementById('btnOpenGoodRankings');
        if (btnGood) btnGood.onclick = () => {
            UIManager.renderFullRankings();
            this.toggle('fullRankings', true);
            setTimeout(() => {
                const header = document.querySelector('#fullGoodRankings h3') || document.getElementById('fullGoodRankings');
                if(header) header.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        };
        const btnBad = document.getElementById('btnOpenBadRankings');
        if (btnBad) btnBad.onclick = () => {
             UIManager.renderFullRankings();
             this.toggle('fullRankings', true);
             setTimeout(() => {
                 const header = document.querySelector('#fullBadRankings h3') || document.getElementById('fullBadRankings');
                 if(header) header.scrollIntoView({ behavior: 'smooth', block: 'start' });
             }, 100);
        };
        const headerStats = document.getElementById('headerStatsCard');
        if (headerStats) {
            headerStats.onclick = (e) => {
                e.preventDefault();
                Game.renderGraphs();
                Game.renderLeaderboardTable();
                const gm = document.getElementById('graphModalContainer');
                if (gm) {
                    gm.classList.remove('hidden');
                    gm.classList.add('flex');
                }
            };
        }
        const closeGraph = document.getElementById('closeGraphModal');
        if (closeGraph) {
            closeGraph.onclick = () => {
                const gm = document.getElementById('graphModalContainer');
                if (gm) {
                    gm.classList.add('hidden');
                    gm.classList.remove('flex');
                }
            };
        }
        Object.keys(DOM.modals).forEach(k => {
            DOM.modals[k].style.zIndex = '150';
            DOM.modals[k].addEventListener('click', e => {
                if (e.target === DOM.modals[k]) this.toggle(k, false);
            });
        });
    }
};
const TipManager = {
    serviceID: 'service_b6d75wi',
    templateID: 'template_qody7q7',
    COOLDOWN_MINS: 10, // <--- CONFIG: Minutes between messages
    init() {
        if (document.getElementById('tipModal')) return;
        const el = document.createElement('div');
        el.id = 'tipModal';
        el.className = 'fixed inset-0 bg-gray-900 bg-opacity-95 z-[200] hidden flex items-center justify-center';
        el.innerHTML = `
            <div class="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
                <h3 class="text-2xl font-bold text-center mb-2 text-gray-800">Submit a Tip</h3>
                <p class="text-gray-500 text-center mb-4 text-sm">Got a clever loading tip? Send it in!</p>
                <textarea id="tipInput" rows="4" class="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none" placeholder="Type your tip here..."></textarea>
                <div class="flex gap-3">
                    <button onclick="TipManager.close()" class="flex-1 py-3 text-gray-500 font-semibold hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                    <button onclick="TipManager.send()" class="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg">Send</button>
                </div>
            </div>`;
        document.body.appendChild(el);
    },
    open() {
        this.init();
        document.getElementById('tipModal').classList.remove('hidden');
        document.getElementById('tipInput').value = '';
        document.getElementById('tipInput').focus();
    },
    close() {
        const el = document.getElementById('tipModal');
        if (el) el.classList.add('hidden');
    },
send() {
        const lastSent = parseInt(localStorage.getItem('lastTipSent') || 0);
        const now = Date.now();
        const diff = now - lastSent;
        const cooldownMs = this.COOLDOWN_MINS * 60 * 1000;
        if (diff < cooldownMs) {
            const minLeft = Math.ceil((cooldownMs - diff) / 60000);
            UIManager.showPostVoteMessage(`Please wait ${minLeft} min before sending another.`);
            return;
        }
        const input = document.getElementById('tipInput');
        const text = input.value.trim();
        if (!text) { UIManager.showPostVoteMessage("Please write something first!"); return; }
        if (text.length > 250) { UIManager.showPostVoteMessage("Keep it short! Under 250 chars."); return; }
        this.close();
        if (typeof ModalManager !== 'undefined') ModalManager.toggle('settings', false); // Close settings too
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
        UIManager.showPostVoteMessage("Tip sent! Thanks! 💌");
        localStorage.setItem('lastTipSent', now);
        emailjs.send(this.serviceID, this.templateID, {
            message: text,
            username: State.data.username || "Anonymous"
        }).catch((err) => console.error('Background email failed:', err));
    }
};
window.TipManager = TipManager;
const ContactManager = {
    serviceID: 'service_b6d75wi',
    templateID: 'template_qody7q7',
    COOLDOWN_MINS: 10,
    init() {
        if (document.getElementById('contactModal')) return;
        const el = document.createElement('div');
        el.id = 'contactModal';
        el.className = 'fixed inset-0 bg-gray-900 bg-opacity-95 z-[200] hidden flex items-start justify-center pt-16 overflow-y-auto';
        el.innerHTML = `
            <div class="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl mb-8">
                <h3 class="text-2xl font-bold text-center mb-2 text-gray-800">Contact Developer</h3>
                <p class="text-gray-500 text-center mb-4 text-sm">Found a bug or have a question?</p>
                <textarea id="contactInput" rows="5" class="w-full p-3 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none" placeholder="Write your message here..."></textarea>
                <div id="contactError" class="text-red-500 text-sm font-bold text-center h-5 mb-2"></div>
                <div class="flex gap-3">
                    <button onclick="ContactManager.close()" class="flex-1 py-3 text-gray-500 font-semibold hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                    <button onclick="ContactManager.send()" class="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg">Send</button>
                </div>
            </div>`;
        document.body.appendChild(el);
    },
    open() {
        this.init();
        document.getElementById('contactModal').classList.remove('hidden');
        document.getElementById('contactInput').value = '';
        document.getElementById('contactError').textContent = ''; // Clear errors
        document.getElementById('contactInput').focus();
    },
    close() {
        const el = document.getElementById('contactModal');
        if (el) el.classList.add('hidden');
    },
    send() {
        const errDiv = document.getElementById('contactError');
        const lastSent = parseInt(localStorage.getItem('lastContactSent') || 0);
        const now = Date.now();
        const diff = now - lastSent;
        const cooldownMs = this.COOLDOWN_MINS * 60 * 1000;
        if (diff < cooldownMs) {
            const minLeft = Math.ceil((cooldownMs - diff) / 60000);
            errDiv.textContent = `⏳ Wait ${minLeft}m before sending again.`;
            return;
        }
        const input = document.getElementById('contactInput');
        const text = input.value.trim();
        if (!text) {
            errDiv.textContent = "Please write a message first!";
            return;
        }
        this.close();
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
        UIManager.showPostVoteMessage("Message sent! I'll read it soon. 📨");
        localStorage.setItem('lastContactSent', now);
        emailjs.send(this.serviceID, this.templateID, {
            message: "CONTACT: " + text,
            username: State.data.username || "Anonymous"
        }).catch((err) => console.error('Background email failed:', err));
    }
};
window.ContactManager = ContactManager;
const InputHandler = {
    sX: 0, sY: 0, drag: false, scroll: false, raf: null,
    init() {
        if (!DOM.game.card || !DOM.game.wordDisplay) return;
        const c = DOM.game.card, wd = DOM.game.wordDisplay;
        const startDrag = (x, y) => {
            if (State.runtime.isCoolingDown || DOM.game.buttons.good.disabled) return;
            this.sX = x; this.sY = y; this.drag = false; this.scroll = false;
            wd.style.transition = 'none'; wd.style.animation = 'none';
        };
        const moveDrag = (x, y, e) => {
            if (State.runtime.isCoolingDown || DOM.game.buttons.good.disabled) return;
            const dX = x - this.sX, dY = y - this.sY;
            if (!this.drag && !this.scroll) {
                if (Math.abs(dY) > Math.abs(dX)) { this.scroll = true; return; }
                this.drag = true; Haptics.light();
                Game.cleanStyles(wd); wd.style.background = 'none'; wd.style.webkitTextFillColor = 'initial';
            }
            if (this.scroll) return;
            if (this.drag) {
                if (e.cancelable) e.preventDefault();
                if (this.raf) cancelAnimationFrame(this.raf);
                this.raf = requestAnimationFrame(() => {
                    wd.style.transform = `translate(${dX}px, ${dY * 0.8}px) rotate(${dX * 0.05}deg)`;
                    const colors = Accessibility.getColors();
                    const col = dX < 0 ? colors.good : colors.bad;
                    const alpha = Math.min(Math.abs(dX) / 150, 1);
                    wd.style.setProperty('--dynamic-swipe-color', Utils.hexToRgba(col, alpha));
                    if (State.data.settings.colorblindMode) {
                        const rgb = dX < 0 ? '59, 130, 246' : '249, 115, 22';
                        wd.style.setProperty('--dynamic-swipe-color', `rgba(${rgb}, ${alpha})`);
                    }
                    wd.classList.add('override-theme-color');
                });
            }
        };
        const endDrag = (x) => {
            if (!this.drag) return;
            const dX = x - this.sX;
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
                Game.vote(l ? 'good' : 'bad', true);
            } else {
                wd.classList.add('word-reset');
                wd.style.transform = 'translate(0,0) rotate(0)';
                wd.style.color = '';
                setTimeout(() => {
                    wd.classList.remove('word-reset');
                    wd.style = '';
                    const currentWord = State.runtime.allWords[State.runtime.currentWordIndex];
                    if(currentWord) UIManager.displayWord(currentWord);
                }, 300);
            }
            this.drag = false; this.scroll = false;
        };
        c.addEventListener('mousedown', e => { if (e.target.closest('button, input, select')) return; if(e.cancelable) e.preventDefault(); startDrag(e.clientX, e.clientY); });
        window.addEventListener('mousemove', e => { if (this.drag) moveDrag(e.clientX, e.clientY, e); });
        window.addEventListener('mouseup', e => { if (this.drag) endDrag(e.clientX); });
        c.addEventListener('touchstart', e => { if (e.target.closest('button, input, select')) return; startDrag(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
        c.addEventListener('touchmove', e => { moveDrag(e.touches[0].clientX, e.touches[0].clientY, e); }, { passive: false });
        c.addEventListener('touchend', e => { endDrag(e.changedTouches[0].clientX); }, false);
    }
};
const DiscoveryManager = {
    targets: [
        { id: 'voteGood', selector: '#goodButton', msg: 'Vote Good', pos: 'left' },
        { id: 'voteBad', selector: '#badButton', msg: 'Vote Bad', pos: 'right' },
        { id: 'stats', selector: '#userStatsBar', msg: 'View Progress', pos: 'bottom' },
        { id: 'rankings', selector: '#headerStatsCard', msg: 'See Graphs', pos: 'bottom' }
    ],
    timer: null,
    init() {
        if (!document.getElementById('discovery-styles')) {
            const s = document.createElement('style');
            s.id = 'discovery-styles';
            s.innerHTML = `
                @keyframes radar-pulse {
                    0% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.6); }
                    70% { box-shadow: 0 0 0 12px rgba(79, 70, 229, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
                }
                .discovery-halo {
                    position: relative;
                    z-index: 40;
                    animation: radar-pulse 2s infinite;
                    border-radius: 12px;
                    transition: all 0.3s;
                }
                .discovery-tooltip {
                    position: absolute;
                    background: #4f46e5;
                    color: white;
                    font-size: 11px;
                    font-weight: 800;
                    padding: 6px 10px;
                    border-radius: 6px;
                    white-space: nowrap;
                    pointer-events: none;
                    opacity: 0;
                    animation: fade-in 0.5s forwards;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.2);
                    z-index: 50;
                }
                .discovery-tooltip::after {
                    content: '';
                    position: absolute;
                    border-width: 5px;
                    border-style: solid;
                }
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `;
            document.head.appendChild(s);
        }
        setTimeout(() => this.check(), 3000);
    },
    check() {
        if (State.runtime.isMultiplayer) return;
        const nextTarget = this.targets.find(t => !State.data.discovered.includes(t.id));
        if (nextTarget) {
            if (State.data.discovered.length === 0 || Math.random() > 0.5) {
                this.highlight(nextTarget);
            }
        }
    },
    clear() {
        document.querySelectorAll('.discovery-halo').forEach(el => el.classList.remove('discovery-halo'));
        document.querySelectorAll('.discovery-tooltip').forEach(el => el.remove());
    },
    highlight(target) {
        const el = document.querySelector(target.selector);
        if (!el || el.offsetParent === null) return;
        const rect = el.getBoundingClientRect();
        if (rect.top < 0 || rect.bottom > window.innerHeight) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        el.classList.add('discovery-halo');
        const tip = document.createElement('div');
        tip.className = 'discovery-tooltip';
        tip.textContent = target.msg;
        const pos = target.pos || 'bottom';
        const arrow = document.createElement('div'); // Create arrow manually for control
        if (pos === 'left') {
            tip.style.right = '110%'; // Push to left
            tip.style.top = '50%';
            tip.style.transform = 'translateY(-50%)';
            tip.classList.add('arrow-right');
            Object.assign(tip.style, { right: 'calc(100% + 10px)', top: '50%', transform: 'translateY(-50%)' });
        }
        else if (pos === 'right') {
            tip.style.left = '110%'; // Push to right
            tip.style.top = '50%';
            tip.style.transform = 'translateY(-50%)';
        }
        else {
            tip.style.top = '115%';
            tip.style.left = '50%';
            tip.style.transform = 'translateX(-50%)';
        }
        const styleId = 'discovery-arrow-' + pos;
        if (!document.getElementById(styleId)) {
            const s = document.createElement('style');
            s.id = styleId;
            if (pos === 'left') {
                s.innerHTML = `.discovery-tooltip.pos-left::after { top: 50%; left: 100%; margin-top: -5px; border-color: transparent transparent transparent #4f46e5; }`;
            } else if (pos === 'right') {
                s.innerHTML = `.discovery-tooltip.pos-right::after { top: 50%; right: 100%; margin-top: -5px; border-color: transparent #4f46e5 transparent transparent; }`;
            } else {
                s.innerHTML = `.discovery-tooltip.pos-bottom::after { bottom: 100%; left: 50%; margin-left: -5px; border-color: transparent transparent #4f46e5 transparent; }`;
            }
            document.head.appendChild(s);
        }
        tip.classList.add('pos-' + pos);
        const originalPos = getComputedStyle(el).position;
        if (originalPos === 'static') el.style.position = 'relative';
        el.appendChild(tip);
        const onDiscover = (e) => {
            el.classList.remove('discovery-halo');
            if (tip) tip.remove();
            if (!State.data.discovered.includes(target.id)) {
                State.data.discovered.push(target.id);
                State.save('discovered', State.data.discovered);
            }
            el.removeEventListener('click', onDiscover);
            setTimeout(() => this.check(), 60000);
        };
        el.addEventListener('click', onDiscover);
    }
};
const SeededShuffle = {
    create(seedStr) {
        const str = String(seedStr || Date.now());
        let h = 0x811c9dc5;
        for (let i = 0; i < str.length; i++) {
            h ^= str.charCodeAt(i);
            h = Math.imul(h, 0x01000193);
        }
        let state = h >>> 0;
        return () => {
            state = (Math.imul(state, 1664525) + 1013904223) | 0;
            return (state >>> 0) / 4294967296;
        };
    },
    shuffle(array, seed) {
        if (!array || array.length <= 1) return array;
        const rng = this.create(seed);
        let m = array.length, t, i;
        while (m) {
            i = Math.floor(rng() * m--);
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }
        return array;
    }
};
const LocalPeerManager = {
    socket: null,
    isHost: false,
    roomCode: '',
    peers: new Map(), // peerId -> { connection, dataChannel, name }
    hostConnection: null,
    hostDataChannel: null,
    words: [],
    currentWordIndex: 0,
    players: [], // { id, name, vote, connected }
    gameState: 'lobby', // lobby, playing, results
    votes: {},
    gameMode: 'coop',
    rounds: 10,
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ],
    initialized: false,
    hostId: null,
    init(socket) {
        if (this.initialized && this.socket === socket) return;
        this.socket = socket;
        this.setupSignaling();
        this.initialized = true;
    },
    setupSignaling() {
        if (!this.socket) return;
        this.socket.off('localRoomCreated');
        this.socket.off('localRoomJoined');
        this.socket.off('localPeerJoined');
        this.socket.off('rtcOffer');
        this.socket.off('rtcAnswer');
        this.socket.off('rtcIceCandidate');
        this.socket.off('localRoomError');
        this.socket.off('localHostDisconnected');
        this.socket.off('localPeerDisconnected');
        this.socket.off('localWordsRefreshed');
        this.socket.on('localRoomCreated', ({ roomCode, words, rounds }) => {
            this.roomCode = roomCode;
            this.words = words;
            this.rounds = rounds;
            this.isHost = true;
            this.gameState = 'lobby';
            this.gameMode = 'coop';
            this.players = [{ id: 'host', name: State.data.username || 'Host', vote: null, connected: true }];
            this.showLocalLobby();
            UIManager.showPostVoteMessage(`Room: ${roomCode} 📡`);
        });
        this.socket.on('localRoomJoined', async ({ roomCode, hostId, hostName }) => {
            this.roomCode = roomCode;
            this.hostId = hostId;
            this.isHost = false;
            UIManager.showPostVoteMessage(`Connecting to ${hostName}... 🔗`);
        });
        this.socket.on('localPeerJoined', async ({ peerId, peerName }) => {
            if (!this.isHost) return;
            await this.connectToPeer(peerId, peerName);
        });
        this.socket.on('rtcOffer', async ({ from, offer, roomCode }) => {
            if (this.isHost) return;
            try {
                await this.handleOffer(from, offer);
            } catch (e) {
                console.error('[LocalPeer] Error handling offer:', e);
                UIManager.showPostVoteMessage("Connection failed ❌");
            }
        });
        this.socket.on('rtcAnswer', async ({ from, answer }) => {
            if (!this.isHost) return;
            const peer = this.peers.get(from);
            if (peer && peer.connection) {
                try {
                    await peer.connection.setRemoteDescription(new RTCSessionDescription(answer));
                } catch (e) {
                    console.error('[LocalPeer] Error setting remote description:', e);
                }
            }
        });
        this.socket.on('rtcIceCandidate', async ({ from, candidate }) => {
            if (!candidate) return;
            try {
                if (this.isHost) {
                    const peer = this.peers.get(from);
                    if (peer?.connection) {
                        await peer.connection.addIceCandidate(new RTCIceCandidate(candidate));
                    }
                } else if (this.hostConnection) {
                    await this.hostConnection.addIceCandidate(new RTCIceCandidate(candidate));
                }
            } catch (e) {
                console.error('[LocalPeer] ICE candidate error:', e);
            }
        });
        this.socket.on('localRoomError', ({ message }) => {
            console.error('[LocalPeer] Error:', message);
            UIManager.showPostVoteMessage(message);
            this.closeLocalUI();
        });
        this.socket.on('localHostDisconnected', () => {
            UIManager.showPostVoteMessage("Host disconnected 😢");
            this.cleanup();
            this.closeLocalUI();
        });
        this.socket.on('localPeerDisconnected', ({ peerId }) => {
            const peer = this.peers.get(peerId);
            if (peer) {
                this.players = this.players.filter(p => p.id !== peerId);
                if (peer.connection) peer.connection.close();
                this.peers.delete(peerId);
                this.updateLobbyUI();
            }
        });
        this.socket.on('localWordsRefreshed', ({ words }) => {
            this.words = words;
            UIManager.showPostVoteMessage(`Got ${words.length} new words! 📝`);
            this.showLocalLobby();
        });
    },
    async createRoom(rounds = 10) {
        if (!this.socket) {
            this.socket = RoomManager.socket; // Reuse existing socket
        }
        if (!this.socket?.connected) {
            UIManager.showPostVoteMessage("Need brief connection to create room");
            return;
        }
        this.socket.emit('createLocalRoom', {
            username: State.data.username || 'Host',
            rounds: rounds
        });
    },
    async joinRoom(roomCode) {
        if (!this.socket) {
            this.socket = RoomManager.socket;
        }
        if (!this.socket?.connected) {
            UIManager.showPostVoteMessage("Need brief connection to join");
            return;
        }
        this.socket.emit('joinLocalRoom', {
            roomCode: roomCode.toUpperCase(),
            username: State.data.username || 'Player'
        });
    },
    async connectToPeer(peerId, peerName) {
        const connection = new RTCPeerConnection({ iceServers: this.iceServers });
        const dataChannel = connection.createDataChannel('gameData', { ordered: true });
        this.peers.set(peerId, {
            connection,
            dataChannel,
            name: peerName,
            ready: false
        });
        this.players.push({ id: peerId, name: peerName, vote: null, connected: false });
        this.updateLobbyUI();
        dataChannel.onopen = () => {
            const peer = this.peers.get(peerId);
            if (peer) peer.ready = true;
            const player = this.players.find(p => p.id === peerId);
            if (player) player.connected = true;
            this.sendToPeer(peerId, {
                type: 'init',
                words: this.words,
                players: this.players.map(p => ({ id: p.id, name: p.name, connected: p.connected })),
                gameState: this.gameState,
                currentWordIndex: this.currentWordIndex,
                gameMode: this.gameMode || 'coop',
                rounds: this.rounds || 10
            });
            this.updateLobbyUI();
            UIManager.showPostVoteMessage(`${peerName} connected! 🎉`);
        };
        dataChannel.onmessage = (e) => this.handlePeerMessage(peerId, JSON.parse(e.data));
        dataChannel.onclose = () => this.handlePeerDisconnect(peerId);
        connection.onicecandidate = (e) => {
            if (e.candidate) {
                this.socket.emit('rtcIceCandidate', { targetId: peerId, candidate: e.candidate });
            }
        };
        connection.onconnectionstatechange = () => {
        };
        try {
            const offer = await connection.createOffer();
            await connection.setLocalDescription(offer);
            this.socket.emit('rtcOffer', { targetId: peerId, offer: offer, roomCode: this.roomCode });
        } catch (e) {
            console.error('[LocalPeer] Error creating offer:', e);
        }
    },
    async handleOffer(hostId, offer) {
        try {
            this.hostConnection = new RTCPeerConnection({ iceServers: this.iceServers });
            this.hostConnection.ondatachannel = (e) => {
                this.hostDataChannel = e.channel;
                this.hostDataChannel.onopen = () => {
                    UIManager.showPostVoteMessage("Connected! 🎉");
                };
                this.hostDataChannel.onmessage = (e) => this.handleHostMessage(JSON.parse(e.data));
                this.hostDataChannel.onclose = () => {
                    UIManager.showPostVoteMessage("Disconnected from host");
                    this.cleanup();
                };
            };
            this.hostConnection.onicecandidate = (e) => {
                if (e.candidate) {
                    this.socket.emit('rtcIceCandidate', { targetId: hostId, candidate: e.candidate });
                }
            };
            this.hostConnection.onconnectionstatechange = () => {
            };
            await this.hostConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await this.hostConnection.createAnswer();
            await this.hostConnection.setLocalDescription(answer);
            this.socket.emit('rtcAnswer', { targetId: hostId, answer: answer });
        } catch (e) {
            console.error('[LocalPeer] Error in handleOffer:', e);
            UIManager.showPostVoteMessage("Connection error ❌");
        }
    },
    sendToPeer(peerId, data) {
        const peer = this.peers.get(peerId);
        if (peer?.dataChannel?.readyState === 'open') {
            peer.dataChannel.send(JSON.stringify(data));
        }
    },
    broadcast(data) {
        const msg = JSON.stringify(data);
        this.peers.forEach((peer) => {
            if (peer.dataChannel?.readyState === 'open') {
                peer.dataChannel.send(msg);
            }
        });
    },
    sendToHost(data) {
        if (this.hostDataChannel?.readyState === 'open') {
            this.hostDataChannel.send(JSON.stringify(data));
        }
    },
    handlePeerMessage(peerId, data) {
        if (data.type === 'vote') {
            this.votes[peerId] = data.vote;
            const player = this.players.find(p => p.id === peerId);
            if (player) player.vote = data.vote;
            this.broadcast({ type: 'playerVoted', playerId: peerId });
            this.checkAllVoted();
        }
    },
    handleHostMessage(data) {
        switch (data.type) {
            case 'init':
                this.words = data.words;
                this.players = data.players;
                this.gameState = data.gameState;
                this.currentWordIndex = data.currentWordIndex;
                this.gameMode = data.gameMode || 'coop';
                this.rounds = data.rounds || 10;
                if (this.gameState === 'lobby') {
                    this.showLocalLobby();
                } else {
                    this.showWord();
                }
                break;
            case 'modeChange':
                this.gameMode = data.mode;
                this.rounds = data.rounds;
                this.showLocalLobby(); // Re-render lobby
                break;
            case 'gameStart':
                this.words = data.words;
                this.gameMode = data.mode || 'coop';
                this.gameState = 'playing';
                this.currentWordIndex = 0;
                this.closeLocalUI();
                this.showWord();
                break;
            case 'nextWord':
                this.currentWordIndex = data.wordIndex;
                this.showWord();
                break;
            case 'playerVoted':
                UIManager.showPostVoteMessage("Vote received! 📩");
                break;
            case 'roundResult':
                this.showRoundResult(data);
                break;
            case 'gameEnd':
                this.showGameEnd(data);
                break;
            case 'playerJoined':
                this.players = data.players;
                this.updateLobbyUI();
                break;
            case 'playerLeft':
                this.players = data.players;
                this.updateLobbyUI();
                break;
        }
    },
    handlePeerDisconnect(peerId) {
        const peer = this.peers.get(peerId);
        if (peer) {
            this.players = this.players.filter(p => p.id !== peerId);
            this.peers.delete(peerId);
            this.broadcast({ type: 'playerLeft', players: this.players });
            this.updateLobbyUI();
        }
    },
    startGame() {
        if (!this.isHost) return;
        const modeConfig = {
            'coop': 2, 'versus': 4, 'vip': 3, 'hipster': 3, 'survival': 2
        };
        const minPlayers = modeConfig[this.gameMode] || 2;
        const connectedCount = this.players.filter(p => p.connected || p.id === 'host').length;
        if (connectedCount < minPlayers) {
            UIManager.showPostVoteMessage(`Need ${minPlayers}+ players for ${this.gameMode}`);
            return;
        }
        this.gameState = 'playing';
        this.currentWordIndex = 0;
        this.votes = {};
        if (this.words.length > this.rounds) {
            this.words = this.words.slice(0, this.rounds);
        }
        this.players.forEach(p => {
            p.vote = null;
            p.score = 0;
            p.lives = 3; // For survival mode
        });
        this.closeLocalUI();
        this.broadcast({
            type: 'gameStart',
            words: this.words,
            mode: this.gameMode
        });
        this.showWord();
    },
    nextWord() {
        if (!this.isHost) return;
        this.currentWordIndex++;
        this.votes = {};
        this.players.forEach(p => p.vote = null);
        if (this.currentWordIndex >= this.words.length) {
            this.endGame();
            return;
        }
        this.broadcast({
            type: 'nextWord',
            wordIndex: this.currentWordIndex
        });
        this.showWord();
    },
    submitVote(vote) {
        if (this.isHost) {
            const hostPlayer = this.players.find(p => p.id === 'host');
            if (hostPlayer) hostPlayer.vote = vote;
            this.votes['host'] = vote;
            this.checkAllVoted();
        } else {
            this.sendToHost({ type: 'vote', vote });
        }
        UIManager.disableButtons(true);
        document.body.classList.add(vote === 'good' ? 'vote-good-mode' : 'vote-bad-mode');
        SoundManager.playGood();
    },
    checkAllVoted() {
        if (!this.isHost) return;
        const connectedPlayers = this.players.filter(p => p.connected || p.id === 'host');
        const allVoted = connectedPlayers.every(p => this.votes[p.id] != null);
        if (allVoted) {
            this.processRound();
        }
    },
    processRound() {
        const votes = this.votes;
        const voteValues = Object.values(votes);
        const goodCount = voteValues.filter(v => v === 'good').length;
        const badCount = voteValues.filter(v => v === 'bad').length;
        const majority = goodCount > badCount ? 'good' : (badCount > goodCount ? 'bad' : 'tie');
        const sync = Math.round((Math.max(goodCount, badCount) / voteValues.length) * 100);
        const result = {
            type: 'roundResult',
            word: this.words[this.currentWordIndex]?.text,
            votes: votes,
            majority,
            sync,
            goodCount,
            badCount
        };
        this.broadcast(result);
        this.showRoundResult(result);
        setTimeout(() => {
            document.body.classList.remove('vote-good-mode', 'vote-bad-mode');
            UIManager.disableButtons(false);
            this.nextWord();
        }, 3000);
    },
    endGame() {
        this.gameState = 'lobby';
        this.broadcast({ type: 'gameEnd', message: 'Game Over!' });
        this.showGameEnd({ message: 'Game Over!' });
    },
    showLocalLobby() {
        this.closeLocalUI();
        const code = this.roomCode;
        const isHost = this.isHost;
        const playerCount = this.players.length;
        const connectedCount = this.players.filter(p => p.connected || p.id === 'host').length;
        const modeConfig = {
            'coop': { label: '🤝 Co-op', desc: 'Match the majority together!', min: 2 },
            'versus': { label: '⚔️ Versus', desc: 'Red vs Blue teams', min: 4 },
            'vip': { label: '⭐ VIP', desc: 'Match the VIP\'s vote!', min: 3 },
            'hipster': { label: '🕶️ Hipster', desc: 'Vote with the minority', min: 3 },
            'survival': { label: '💀 Survival', desc: '3 lives - match or die!', min: 2 }
        };
        const currentMode = this.gameMode || 'coop';
        const currentRounds = this.rounds || 10;
        const modeInfo = modeConfig[currentMode];
        const hasEnoughPlayers = connectedCount >= (modeInfo?.min || 2);
        const modesHtml = Object.entries(modeConfig).map(([key, conf]) => {
            const isSelected = currentMode === key;
            const canSelect = isHost;
            return `
                <button ${canSelect ? `onclick="LocalPeerManager.setMode('${key}')"` : ''}
                    class="p-2 rounded-lg text-left transition ${isSelected
                        ? 'bg-green-100 border-2 border-green-500'
                        : canSelect ? 'bg-gray-50 border border-gray-200 hover:bg-gray-100' : 'bg-gray-50 border border-gray-200 opacity-60'
                    }">
                    <div class="font-bold text-sm ${isSelected ? 'text-green-700' : 'text-gray-700'}">${conf.label}</div>
                    <div class="text-xs text-gray-500">${conf.desc}</div>
                </button>
            `;
        }).join('');
        const playersHtml = this.players.map(p => {
            const isConnected = p.connected || p.id === 'host';
            const isHostPlayer = p.id === 'host';
            return `
                <div class="flex items-center justify-between bg-white rounded-lg px-3 py-2 shadow-sm border ${isConnected ? 'border-green-200' : 'border-yellow-200'}">
                    <div class="flex items-center gap-2">
                        <span class="${isConnected ? 'text-green-500' : 'text-yellow-500'} text-lg">${isConnected ? '●' : '○'}</span>
                        <span class="font-medium">${p.name}</span>
                    </div>
                    ${isHostPlayer ? '<span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">HOST</span>' : ''}
                </div>
            `;
        }).join('');
        const html = `
        <div id="localLobby" class="fixed inset-0 bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
            <div class="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6">
                <!-- Header -->
                <div class="text-center mb-4">
                    <span class="text-xs font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">📡 LOCAL MODE</span>
                    <h2 class="text-2xl font-black text-gray-800 mt-2">Room: <span class="text-green-600 font-mono">${code}</span></h2>
                    <p class="text-sm text-gray-500">Share this code with nearby players</p>
                </div>
                <!-- Players -->
                <div class="bg-gray-50 rounded-xl p-4 mb-4">
                    <h3 class="font-bold text-gray-700 mb-2 flex items-center justify-between">
                        <span>Players</span>
                        <span class="text-sm font-normal text-gray-500">${connectedCount}/${playerCount} connected</span>
                    </h3>
                    <div id="localPlayerList" class="space-y-2 max-h-32 overflow-y-auto">
                        ${playersHtml}
                    </div>
                </div>
                <!-- Game Mode (Host controls) -->
                <div class="mb-4">
                    <h3 class="font-bold text-gray-700 mb-2">${isHost ? 'Select Mode' : 'Game Mode'}</h3>
                    <div class="grid grid-cols-2 gap-2" id="localModeGrid">
                        ${modesHtml}
                    </div>
                </div>
                <!-- Rounds Slider (Host only) -->
                ${isHost ? `
                <div class="mb-4">
                    <div class="flex items-center justify-between mb-2">
                        <span class="font-bold text-gray-700">Rounds</span>
                        <span id="localRoundsDisplay" class="text-green-600 font-bold">${currentRounds}</span>
                    </div>
                    <input type="range" min="5" max="30" value="${currentRounds}"
                        oninput="LocalPeerManager.setRounds(this.value); document.getElementById('localRoundsDisplay').textContent = this.value"
                        class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600">
                </div>
                ` : `
                <div class="mb-4 text-center text-gray-500">
                    <span class="font-bold">${currentRounds} Rounds</span> · <span>${modeInfo?.label || 'Co-op'}</span>
                </div>
                `}
                <!-- Action Buttons -->
                <div class="space-y-2">
                    ${isHost ? `
                        <button onclick="LocalPeerManager.startGame()"
                            class="w-full py-4 rounded-xl font-black text-lg transition transform active:scale-95 ${
                                hasEnoughPlayers
                                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }" ${hasEnoughPlayers ? '' : 'disabled'}>
                            ${hasEnoughPlayers ? '🎮 START GAME' : `Need ${modeInfo?.min || 2}+ players`}
                        </button>
                        <button onclick="LocalPeerManager.refreshWords()" class="w-full py-2 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition">
                            🔄 Refresh Words (${this.words.length})
                        </button>
                    ` : `
                        <div class="w-full py-4 bg-gray-100 rounded-xl text-center text-gray-500 font-bold">
                            ⏳ Waiting for host to start...
                        </div>
                    `}
                    <button onclick="LocalPeerManager.leaveRoom()" class="w-full py-2 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition">
                        Leave Room
                    </button>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', html);
    },
    setMode(mode) {
        if (!this.isHost) return;
        this.gameMode = mode;
        this.broadcast({ type: 'modeChange', mode: mode, rounds: this.rounds || 10 });
        this.showLocalLobby(); // Re-render
    },
    setRounds(rounds) {
        if (!this.isHost) return;
        this.rounds = parseInt(rounds);
        this.broadcast({ type: 'modeChange', mode: this.gameMode || 'coop', rounds: this.rounds });
    },
    async refreshWords() {
        if (!this.isHost || !this.socket?.connected) return;
        UIManager.showMessage('Fetching new words... 📥');
        this.socket.emit('refreshLocalWords', { roomCode: this.roomCode, rounds: this.rounds || 10 });
    },
    updateLobbyUI() {
        const lobby = document.getElementById('localLobby');
        if (lobby) {
            this.showLocalLobby();
        }
    },
    showWord() {
        this.closeLocalUI();
        const word = this.words[this.currentWordIndex];
        if (!word) return;
        State.runtime.isMultiplayer = true; // Prevent normal voting
        UIManager.displayWord(word);
        UIManager.disableButtons(false);
        DOM.game.buttons.good.onclick = () => this.submitVote('good');
        DOM.game.buttons.bad.onclick = () => this.submitVote('bad');
        UIManager.showPostVoteMessage(`Word ${this.currentWordIndex + 1}/${this.words.length}`);
    },
    showRoundResult(data) {
        const msg = `${data.sync}% sync! ${data.majority === 'tie' ? "It's a tie!" : data.majority.toUpperCase() + ' wins'}`;
        UIManager.showPostVoteMessage(msg);
    },
    showGameEnd(data) {
        State.runtime.isMultiplayer = false;
        UIManager.showPostVoteMessage(data.message || 'Game Over!');
        DOM.game.buttons.good.onclick = () => Game.vote('good');
        DOM.game.buttons.bad.onclick = () => Game.vote('bad');
        setTimeout(() => this.showLocalLobby(), 2000);
    },
    closeLocalUI() {
        const lobby = document.getElementById('localLobby');
        if (lobby) lobby.remove();
    },
    leaveRoom() {
        if (this.socket?.connected) {
            this.socket.emit('leaveLocalRoom', { roomCode: this.roomCode });
        }
        this.cleanup();
        this.closeLocalUI();
    },
    cleanup() {
        this.peers.forEach(peer => {
            if (peer.connection) peer.connection.close();
        });
        this.peers.clear();
        if (this.hostConnection) {
            this.hostConnection.close();
            this.hostConnection = null;
        }
        this.hostDataChannel = null;
        this.isHost = false;
        this.roomCode = '';
        this.words = [];
        this.players = [];
        this.votes = {};
        this.gameState = 'lobby';
        State.runtime.isMultiplayer = false;
        if (DOM.game?.buttons) {
            DOM.game.buttons.good.onclick = () => Game.vote('good');
            DOM.game.buttons.bad.onclick = () => Game.vote('bad');
        }
    }
};
const RoomManager = {
    socket: null,
    active: false,
    roomCode: '',
    playerId: null,
    isHost: false,
    currentMode: 'coop',
    currentWordCount: 10,
    drinkingMode: false,
    extremeDrinkingMode: false,
    players: [],
    amITraitor: false,
    myTeam: null,
    vipId: null,
    vipName: null,
    amIVip: false,
    isPublic: false,
    maxPlayers: 8,
    publicGames: [],
    originalTheme: 'default',
    hostTheme: null,
    listenersAttached: false,
    modeConfig: {
        'coop': { 
            label: '🤝 Co-op Sync', 
            desc: 'Vote together! Match with the Global Majority.', 
            min: 2,
            rules: `<b>🤝 Co-op Sync Rules</b><br><br>
                <b>Goal:</b> Work together as a team to match the global majority vote.<br><br>
                <b>How to Play:</b><br>
                • Each round, a word appears for all players<br>
                • Everyone votes Good 👍 or Bad 👎<br>
                • Your team score increases when you match the global majority<br><br>
                <b>Scoring:</b><br>
                • Higher sync percentage = Better team performance<br>
                • Try to achieve 100% sync with your group!<br><br>
                <b>Tip:</b> Think about what most people would vote, not just your opinion!`
        },
        'okstoopid': { 
            label: '💘 OK Stoopid', 
            desc: 'Couples Mode. Match each other quickly for the highest score!', 
            min: 2, 
            max: 2,
            rules: `<b>💘 OK Stoopid Rules</b><br><br>
                <b>Goal:</b> Match your partner's votes as quickly as possible!<br><br>
                <b>How to Play:</b><br>
                • Only 2 players allowed - perfect for couples or best friends<br>
                • Each round, both players vote Good 👍 or Bad 👎<br>
                • Try to think like your partner!<br><br>
                <b>Scoring:</b><br>
                • Match = Points based on how fast you both voted<br>
                • Mismatch = No points<br>
                • Fastest matches score the most!<br><br>
                <b>Tip:</b> The better you know each other, the higher you'll score!`
        },
        'versus': { 
            label: '⚔️ Team Versus', 
            desc: 'Red vs Blue. Best Team wins.', 
            min: 2,
            rules: `<b>⚔️ Team Versus Rules</b><br><br>
                <b>Goal:</b> Beat the opposing team by matching the global majority more often.<br><br>
                <b>How to Play:</b><br>
                • Players are split into Red and Blue teams<br>
                • Each round, everyone votes Good 👍 or Bad 👎<br>
                • The team with more players matching the majority wins the round<br><br>
                <b>Scoring:</b><br>
                • Round win = 1 point for your team<br>
                • Most points at the end wins!<br><br>
                <b>Tip:</b> Coordinate with your teammates for strategic voting!`
        },
        'vip': { 
            label: '⭐ The VIP', 
            desc: 'One player is the VIP. Everyone tries to match their vote!', 
            min: 3,
            rules: `<b>⭐ The VIP Rules</b><br><br>
                <b>Goal:</b> If you're the VIP, vote your heart. Everyone else - match the VIP!<br><br>
                <b>How to Play:</b><br>
                • One random player becomes the VIP (⭐) each game<br>
                • The VIP votes however they want<br>
                • All other players try to predict and match the VIP's vote<br><br>
                <b>Scoring:</b><br>
                • Match the VIP = Points<br>
                • Miss the VIP's vote = No points<br>
                • VIP scores based on how many people they fooled!<br><br>
                <b>Tip:</b> Study the VIP's personality - are they a "Good" or "Bad" person?`
        },
        'hipster': { 
            label: '🕶️ Hipster Mode', 
            desc: 'Be unique! Score by voting with the minority.', 
            min: 3,
            rules: `<b>🕶️ Hipster Mode Rules</b><br><br>
                <b>Goal:</b> Be different! Vote against the crowd to score points.<br><br>
                <b>How to Play:</b><br>
                • Each round, everyone votes Good 👍 or Bad 👎<br>
                • The minority vote wins!<br>
                • If everyone votes the same... nobody scores<br><br>
                <b>Scoring:</b><br>
                • Minority voter = Points<br>
                • Majority voter = No points<br>
                • Ties = Everyone scores half points<br><br>
                <b>Tip:</b> Think about what everyone ELSE will vote, then vote the opposite!`
        },
        'controversial': { 
            label: '🔥 Controversial King', 
            desc: 'Pick the most divisive word! Closest to 50/50 wins.', 
            min: 2,
            rules: `<b>🔥 Controversial King Rules</b><br><br>
                <b>Goal:</b> Find the most controversial word - the one closest to a 50/50 split!<br><br>
                <b>How to Play:</b><br>
                • Each round shows 3 words with their global vote stats hidden<br>
                • Pick the word you think is most controversial (closest to 50% good / 50% bad)<br>
                • The server reveals which word was actually closest to 50/50<br><br>
                <b>Scoring:</b><br>
                • Picking the most controversial word = 3 points<br>
                • Second most controversial = 1 point<br>
                • Least controversial = 0 points<br><br>
                <b>Tip:</b> Words that could go either way tend to be the most divisive!`
        },
        'speed': { 
            label: '⏱️ Speed Demon', 
            desc: 'Vote fast! Speed and accuracy wins.', 
            min: 2,
            rules: `<b>⏱️ Speed Demon Rules</b><br><br>
                <b>Goal:</b> Be fast AND correct! Match the majority as quickly as possible.<br><br>
                <b>How to Play:</b><br>
                • Each round, vote Good 👍 or Bad 👎<br>
                • The faster you vote, the more potential points<br>
                • But only if you match the majority!<br><br>
                <b>Scoring:</b><br>
                • Fast + Correct = Maximum points<br>
                • Slow + Correct = Fewer points<br>
                • Wrong = Zero points (no matter how fast)<br><br>
                <b>Tip:</b> Trust your gut - overthinking costs precious seconds!`
        },
        'survival': { 
            label: '💣 Sudden Death', 
            desc: 'Three Lives. Vote with majority, or die.', 
            min: 2,
            rules: `<b>💣 Sudden Death Rules</b><br><br>
                <b>Goal:</b> Survive! Don't run out of lives.<br><br>
                <b>How to Play:</b><br>
                • Everyone starts with 3 lives ❤️❤️❤️<br>
                • Each round, vote Good 👍 or Bad 👎<br>
                • Vote with the majority = Safe<br>
                • Vote with the minority = Lose 1 life 💔<br><br>
                <b>Elimination:</b><br>
                • Lose all 3 lives = Eliminated! 💀<br>
                • Last player standing wins!<br>
                • Eliminated players become spectators<br><br>
                <b>Tip:</b> Play it safe early - the field narrows as players get eliminated!`
        },
        'traitor': { 
            label: '🕵️ The Traitor', 
            desc: 'One Traitor tries to ruin everything!', 
            min: 3,
            rules: `<b>🕵️ The Traitor Rules</b><br><br>
                <b>Goal:</b> Traitor tries to sabotage. Everyone else tries to sync.<br><br>
                <b>How to Play:</b><br>
                • One random player is secretly the Traitor 🕵️<br>
                • Loyal players try to match the majority<br>
                • The Traitor tries to vote with minorities to lower the team's sync<br><br>
                <b>Winning:</b><br>
                • Loyalists win if sync stays above 60%<br>
                • Traitor wins if they drag sync below 40%<br>
                • The Traitor's identity is revealed at the end!<br><br>
                <b>Tip:</b> Traitors - be subtle! Too obvious and you'll be suspected.`
        },
        'kids': { 
            label: '👶 Kids Mode', 
            desc: 'Simple words. Family friendly!', 
            min: 2,
            rules: `<b>👶 Kids Mode Rules</b><br><br>
                <b>Goal:</b> Fun for the whole family! Vote together on kid-friendly words.<br><br>
                <b>How to Play:</b><br>
                • Only simple, family-friendly words appear<br>
                • Everyone votes Good 👍 or Bad 👎<br>
                • No complicated or adult content<br><br>
                <b>Scoring:</b><br>
                • Match the group = Points<br>
                • Everyone has fun - that's the real win!<br><br>
                <b>Perfect for:</b> Young children, family game nights, classroom activities`
        }
    },
    // Show rules modal for a game mode
    showModeRules(modeKey) {
        const mode = this.modeConfig[modeKey];
        if (!mode || !mode.rules) return;
        
        const existingModal = document.getElementById('modeRulesModal');
        if (existingModal) existingModal.remove();
        
        const modal = document.createElement('div');
        modal.id = 'modeRulesModal';
        modal.className = 'fixed inset-0 bg-black/70 z-[10000] flex items-center justify-center p-4 backdrop-blur-sm';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-pop max-h-[80vh] overflow-y-auto">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-xl font-black text-gray-800">${mode.label}</h3>
                    <button onclick="document.getElementById('modeRulesModal').remove()" class="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                </div>
                <div class="text-sm text-gray-600 leading-relaxed">
                    ${mode.rules}
                </div>
                <button onclick="document.getElementById('modeRulesModal').remove()" class="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition">
                    Got it!
                </button>
            </div>
        `;
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
        document.body.appendChild(modal);
    },
    init() {
        window.RoomManager = this;
        if (!document.getElementById('mp-circular-css')) {
            const style = document.createElement('style');
            style.id = 'mp-circular-css';
            style.textContent = `
                @keyframes mp-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .mp-circular-text {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    animation: mp-spin 12s linear infinite;
                }
                .mp-circular-text span {
                    position: absolute;
                    left: 50%;
                    font-size: 7px;
                    font-weight: bold;
                    color: #6366f1;
                    transform-origin: 0 33px;
                }
            `;
            document.head.appendChild(style);
        }
        let btn = document.getElementById('roomBtn');
        if (btn) btn.remove();
        btn = document.createElement('button');
        btn.id = 'roomBtn';
        btn.className = 'fixed top-4 left-6 bg-white text-indigo-700 px-4 py-3 rounded-full shadow-lg z-50 font-bold cursor-pointer hover:bg-indigo-700 transition-transform active:scale-95 flex items-center gap-2';
        btn.style.cssText = 'width: 68px; height: 68px; padding: 0;';
        const text = 'MULTIPLAYER · ';
        let chars = '';
        for (let i = 0; i < text.length; i++) {
            const rotation = (i * 360 / text.length);
            chars += `<span style="transform: rotate(${rotation}deg)">${text[i]}</span>`;
        }
        btn.innerHTML = `
            <div style="position: relative; width: 100%; height: 100%;">
                <div class="mp-circular-text">${chars}</div>
                <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 26px;">📡</span>
            </div>`;
        btn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); this.openMenu(); };
        document.body.appendChild(btn);
        if (!window.io) {
            const sc = document.createElement('script');
            sc.src = "/socket.io/socket.io.js";
            sc.onload = () => this.connect();
            document.head.appendChild(sc);
        } else {
            this.connect();
        }
        const params = new URLSearchParams(window.location.search);
        const urlRoom = params.get('room');
        if (urlRoom) {
            setTimeout(() => { this.attemptJoinOrCreate(urlRoom.trim().toUpperCase()); }, 500);
        }
    },
    getUsername() {
        if (DOM.inputs && DOM.inputs.username && DOM.inputs.username.value) return DOM.inputs.username.value.trim();
        if (State.data.username && State.data.username !== 'Unknown') return State.data.username;
        const lsName = localStorage.getItem('username');
        if (lsName) return lsName;
        return `Guest_${Math.floor(Math.random()*1000)}`;
    },
    rejoin() {
    document.getElementById('gameOverModal')?.remove();
    this.active = false;
    State.runtime.isMultiplayer = true; // Keep MP flag true
    const banner = document.querySelector('.mp-banner-text');
    if(banner) banner.remove();
    const ui = document.getElementById('mp-mode-ui');
    if(ui) ui.remove();
    this.renderLobby();
    this.socket.emit('joinRoom', {
        roomCode: this.roomCode,
        username: this.getUsername(),
        theme: State.data.currentTheme
    });
},
    connect() {
        if (typeof io === 'undefined') return;
        if (!this.socket) this.socket = io({ transports: ['websocket'], upgrade: false });
        if (this.socket.connected) this.playerId = this.socket.id;
        if (this.listenersAttached) return;
        this.listenersAttached = true;
        this.socket.on('connect', () => { this.playerId = this.socket.id; });
        this.socket.on('publicGamesList', (games) => {
            this.publicGames = games || [];
            this.renderPublicGames();
        });
        this.socket.on('roomFull', ({ message }) => {
            alert(message || 'This room is full!');
        });
        this.socket.on('roleAlert', (msg) => {
             this.amITraitor = true;
        });
        this.socket.on('teamAssigned', ({ team }) => {
            this.myTeam = team;
        });
        this.socket.on('vipAssigned', ({ vipId, vipName }) => {
            this.vipId = vipId;
            this.vipName = vipName;
            this.amIVip = (vipId === this.playerId);
        });
        this.socket.on('gameStarted', (data) => {
            this.closeLobby();
            this.active = true;
            const vipInfo = this.vipId ? {
                isMe: this.amIVip,
                name: this.vipName
            } : null;
            UIManager.showCountdown(3, () => {
                if (Game && Game.startMultiplayer) {
                    Game.startMultiplayer(data);
                }
            }, this.amITraitor, this.myTeam, vipInfo);
            this.amITraitor = false;
            this.myTeam = null;
            this.vipId = null;
            this.vipName = null;
            this.amIVip = false;
        });
        this.socket.on('startError', ({ message }) => {
            alert(message || 'Cannot start game');
        });
        this.socket.on('roomUpdate', (data) => {
            if (data.theme && !this.isHost) {
                if (data.theme !== this.hostTheme) {
                    if (!this.hostTheme) {
                        this.originalTheme = State.data.currentTheme || 'default';
                    }
                    this.hostTheme = data.theme;
                    ThemeManager.apply(this.hostTheme, 'temp');
                    document.documentElement.setAttribute('data-theme', this.hostTheme);
                }
            }
            this.roomCode = this.roomCode || data.roomCode;
            this.currentMode = data.mode || 'coop';
            this.currentWordCount = parseInt(data.maxWords || 10);
            this.drinkingMode = data.drinkingMode || false;
            this.extremeDrinkingMode = data.extremeDrinkingMode || false;
            this.players = data.players || [];
            this.isPublic = data.isPublic || false;
            this.maxPlayers = data.maxPlayers || 8;
            this.isHost = (data.host === this.playerId);
            if(this.players.length > 0 && this.players[0].id === this.playerId) this.isHost = true;
            document.getElementById('mpMenu')?.remove();
            if (!this.active) this.renderLobby();
        });
this.socket.on('nextWord', (data) => {
            State.runtime.allWords = [data.word];
            State.runtime.currentWordIndex = 0;
            const wd = DOM.game.wordDisplay;
            wd.className = ''; // Remove 'fly-left' animations from previous round
            wd.style.transform = 'none';
            wd.style.opacity = '1';
            wd.style.filter = 'none';
            wd.style.color = '';
            UIManager.displayWord(data.word);
            const me = this.players.find(p => p.id === this.playerId);
            const isDead = this.currentMode === 'survival' && me && me.lives <= 0;
            const isSpectator = me && me.isSpectator;
            if (isDead || isSpectator) {
                UIManager.disableButtons(true);
                DOM.game.buttons.good.style.opacity = '0.5';
                DOM.game.buttons.bad.style.opacity = '0.5';
            } else {
                UIManager.disableButtons(false); // Re-enable buttons for the new round
                DOM.game.buttons.good.style.opacity = '1';
                DOM.game.buttons.bad.style.opacity = '1';
            }
            const banner = document.querySelector('.mp-banner-text');
            if (banner) {
                let label = `${RoomManager.modeConfig[this.currentMode]?.label} (${data.wordCurrent}/${data.wordTotal})`;
                if (this.currentMode === 'survival') {
                    if (me && typeof me.lives === 'number') {
                        if (me.lives > 0) {
                            label += ` ${'❤️'.repeat(me.lives)}`;
                        } else {
                            label = `💀 YOU DIED - Spectating (${data.wordCurrent}/${data.wordTotal})`;
                        }
                    }
                }
                if (isSpectator && !isDead) {
                    label = `👁️ Spectating (${data.wordCurrent}/${data.wordTotal})`;
                }
                banner.textContent = label;
            }
        });
        // Controversial King - shows 3 words to pick from
        this.socket.on('controversialRound', (data) => {
            const { words, roundNum, totalRounds } = data;
            // Hide regular game UI
            UIManager.disableButtons(true);
            DOM.game.buttons.good.style.display = 'none';
            DOM.game.buttons.bad.style.display = 'none';
            DOM.game.wordDisplay.style.display = 'none';
            
            // Remove existing controversial UI if present
            const existing = document.getElementById('controversialPickUI');
            if (existing) existing.remove();
            
            // Create word selection UI
            const ui = document.createElement('div');
            ui.id = 'controversialPickUI';
            ui.className = 'fixed inset-0 bg-black/80 z-[9998] flex flex-col items-center justify-center p-4';
            ui.innerHTML = `
                <div class="text-center mb-6">
                    <div class="text-4xl mb-2">🔥</div>
                    <h2 class="text-2xl font-black text-white">CONTROVERSIAL KING</h2>
                    <p class="text-white/70 mt-1">Round ${roundNum}/${totalRounds} - Pick the MOST controversial word!</p>
                    <p class="text-yellow-400 text-sm mt-1">Closest to 50/50 split wins!</p>
                </div>
                <div class="grid grid-cols-1 gap-4 w-full max-w-md">
                    ${words.map((w, i) => `
                        <button class="controversial-word-btn p-6 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 rounded-2xl text-white font-black text-2xl shadow-lg transition transform hover:scale-105 active:scale-95" data-word-id="${w._id}" data-index="${i}">
                            ${w.text.toUpperCase()}
                        </button>
                    `).join('')}
                </div>
                <p class="text-white/50 text-sm mt-6">⏳ Pick quickly for bonus points!</p>
            `;
            document.body.appendChild(ui);
            
            // Add click handlers
            ui.querySelectorAll('.controversial-word-btn').forEach(btn => {
                btn.onclick = () => {
                    const wordId = btn.dataset.wordId;
                    const idx = parseInt(btn.dataset.index);
                    
                    // Visual feedback - highlight selected
                    ui.querySelectorAll('.controversial-word-btn').forEach(b => {
                        b.disabled = true;
                        b.style.opacity = b === btn ? '1' : '0.4';
                    });
                    btn.innerHTML += ' ✓';
                    
                    // Send selection to server
                    this.socket.emit('controversialPick', { 
                        roomCode: this.roomCode, 
                        wordId,
                        wordIndex: idx
                    });
                };
            });
            
            // Update banner
            const banner = document.querySelector('.mp-banner-text');
            if (banner) {
                banner.textContent = `🔥 Controversial King (${roundNum}/${totalRounds})`;
            }
        });
        
        // Controversial King - round result
        this.socket.on('controversialResult', (data) => {
            const { words, winnerIndex, scores } = data;
            const ui = document.getElementById('controversialPickUI');
            if (!ui) return;
            
            // Calculate controversy scores (closeness to 50%)
            const getControversyScore = (w) => {
                const g = w.goodVotes || 0;
                const b = w.badVotes || 0;
                const total = g + b;
                if (total === 0) return 0;
                const ratio = g / total;
                // Return how close to 0.5 (lower = more controversial)
                return Math.abs(0.5 - ratio);
            };
            
            // Update UI to show results
            const btns = ui.querySelectorAll('.controversial-word-btn');
            btns.forEach((btn, i) => {
                const w = words[i];
                const g = w.goodVotes || 0;
                const b = w.badVotes || 0;
                const total = g + b;
                const pct = total > 0 ? Math.round((g / total) * 100) : 50;
                const deviation = Math.abs(50 - pct);
                
                btn.innerHTML = `
                    <div class="text-xl">${w.text.toUpperCase()}</div>
                    <div class="text-sm mt-2 font-normal">
                        ${pct}% Good / ${100-pct}% Bad
                        <br><span class="${i === winnerIndex ? 'text-yellow-300' : 'text-white/50'}">${deviation}% from 50/50</span>
                    </div>
                    ${i === winnerIndex ? '<div class="mt-2 text-yellow-400">👑 MOST CONTROVERSIAL!</div>' : ''}
                `;
                
                btn.className = i === winnerIndex 
                    ? 'p-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl text-white shadow-lg border-4 border-yellow-300'
                    : 'p-4 bg-gray-700 rounded-2xl text-white/60 shadow-lg';
            });
            
            // Show player scores
            if (scores && scores.length > 0) {
                const scoresHtml = scores.map(s => 
                    `<div class="flex justify-between items-center py-1">
                        <span class="${s.correct ? 'text-yellow-400' : 'text-white/60'}">${s.name}</span>
                        <span class="font-bold ${s.correct ? 'text-green-400' : 'text-red-400'}">${s.correct ? '+3' : '+0'}</span>
                    </div>`
                ).join('');
                
                const scoresDiv = document.createElement('div');
                scoresDiv.className = 'mt-4 bg-black/50 rounded-xl p-4 w-full max-w-md';
                scoresDiv.innerHTML = `
                    <div class="text-white/70 text-sm font-bold mb-2">ROUND RESULTS</div>
                    ${scoresHtml}
                `;
                ui.querySelector('.grid').after(scoresDiv);
            }
            
            // Auto-remove after delay
            setTimeout(() => {
                if (ui && ui.parentNode) {
                    ui.remove();
                    // Restore regular game UI for next round or game over
                    DOM.game.buttons.good.style.display = '';
                    DOM.game.buttons.bad.style.display = '';
                    DOM.game.wordDisplay.style.display = '';
                }
            }, 3500);
        });
        this.socket.on('playerVoted', () => { Haptics.light(); });
this.socket.on('roundResult', (data) => {
    if (data.players) this.players = data.players;
    const banner = document.querySelector('.mp-banner-text');
    if (banner && this.currentMode === 'survival') {
        const me = this.players.find(p => p.id === this.playerId);
        if (me && typeof me.lives === 'number') {
            const wordInfo = banner.textContent.split('❤️')[0].trim(); // Keep existing word count
            banner.textContent = `${wordInfo} ${'❤️'.repeat(Math.max(0, me.lives))}`;
        }
    }
    let msg = data.data.msg || "Round Complete";
    if (data.data.sync) msg = `${data.data.sync}% Sync!`;
    UIManager.showPostVoteMessage(msg);
});
        this.socket.on('drinkPenalty', (data) => {
            UIManager.showDrinkingModal(data);
            if (typeof Haptics !== 'undefined') Haptics.heavy();
        });
        this.socket.on('drinkingComplete', () => {
            UIManager.closeDrinkingModal();
        });
        this.socket.on('gameOver', (data) => {
            this.cleanupMultiplayer();
            // Clean up Controversial King UI if present
            const controversialUI = document.getElementById('controversialPickUI');
            if (controversialUI) controversialUI.remove();
            DOM.game.buttons.good.style.display = '';
            DOM.game.buttons.bad.style.display = '';
            DOM.game.wordDisplay.style.display = '';
            
            const banner = document.querySelector('.mp-banner-text');
            if(banner) banner.remove();
            const ui = document.getElementById('mp-mode-ui');
            if(ui) ui.remove();
            this.active = false;
            State.runtime.isMultiplayer = false;
            UIManager.showGameOverModal(data);
        });
        this.socket.on('kicked', () => {
            this.cleanupMultiplayer();
            this.active = false;
            State.runtime.isMultiplayer = false;
            UIManager.showKickedModal();
            this.socket.disconnect();
        });
    },
cleanupMultiplayer() {
        if (this.originalTheme) {
            ThemeManager.apply(this.originalTheme);
            this.hostTheme = null;
        }
    },
    emitUpdate() {
        const payload = {
            roomCode: this.roomCode,
            mode: this.currentMode,
            rounds: this.currentWordCount,
            drinking: this.drinkingMode,
            extremeDrinking: this.extremeDrinkingMode,
            theme: State.data.currentTheme
        };
        this.socket.emit('updateSettings', payload);
    },
    reannounce() {
        if (!this.isPublic || !this.isHost) return;
        this.socket.emit('keepAlive', { roomCode: this.roomCode });
        UIManager.showPostVoteMessage('📢 Room reannounced!');
    },
    updateMode(newMode) {
        if (!this.isHost) return;
        this.currentMode = newMode;
        this.renderLobby();
        this.emitUpdate();
    },
    updateWordCount(count) {
        if (!this.isHost) return;
        this.currentWordCount = parseInt(count);
        this.emitUpdate();
    },
    toggleDrinking(isChecked) {
        if (!this.isHost) return;
        this.drinkingMode = isChecked;
        if (!isChecked) {
            this.extremeDrinkingMode = false;
        }
        this.renderLobby();
        this.emitUpdate();
    },
    toggleExtremeDrinking(isChecked) {
        if (!this.isHost) return;
        this.extremeDrinkingMode = isChecked;
        this.renderLobby();
        this.emitUpdate();
    },
    kickPlayer(targetId) {
        if (!this.isHost) return;
        const p = this.players.find(x => x.id === targetId);
        const name = p ? (p.name || 'Guest') : 'Player';
        UIManager.showKickConfirm(targetId, name);
    },
    emitKick(targetId) {
        this.socket.emit('kickPlayer', { roomCode: this.roomCode, targetId });
    },
startGame() {
        const count = this.players.length;
        if (this.currentMode === 'okstoopid' && count !== 2) return StreakManager.showNotification("⚠️ OK Stoopid requires exactly 2 players!", "neutral");
        if (this.currentMode === 'traitor' && count < 3) return StreakManager.showNotification("⚠️ Traitor Mode requires 3+ players!", "neutral");
        if (this.currentMode === 'coop' && count < 3) return StreakManager.showNotification("⚠️ Co-op requires 3+ players!", "neutral");
        if (this.currentMode === 'versus' && count < 4) return StreakManager.showNotification("⚠️ Team Versus requires 4+ players!", "neutral");
        this.socket.emit('startGame', { roomCode: this.roomCode });
    },
    submitVote(voteType) {
        this.socket.emit('submitVote', { roomCode: this.roomCode, vote: voteType });
    },
    confirmReady() {
        this.socket.emit('confirmReady', { roomCode: this.roomCode });
        const btn = document.getElementById('drink-ready-btn');
        if(btn) {
            btn.innerHTML = "⏳ WAITING FOR OTHERS...";
            btn.className = "w-full py-4 bg-gray-400 text-white font-bold rounded-xl text-xl cursor-not-allowed";
            btn.disabled = true;
        }
    },
renderLobby() {
        const existingModal = document.getElementById('lobbyModal');
        let scrollPlayers = 0;
        let scrollSettings = 0;
        if (existingModal) {
            const scrolls = existingModal.querySelectorAll('.custom-scrollbar');
            if (scrolls[0]) scrollPlayers = scrolls[0].scrollTop;
            if (scrolls[1]) scrollSettings = scrolls[1].scrollTop;
            existingModal.remove();
        }
        const activeMode = this.currentMode;
        const activeWordCount = this.currentWordCount;
        const activeDrinking = this.drinkingMode;
        const safeCode = this.roomCode || '...';
        const roomIsPublic = this.isPublic;
        const roomMaxPlayers = this.maxPlayers || 8;
        const modeSettings = this.modeConfig[activeMode] || {};
        const minPlayers = modeSettings.min || 2;
        const maxPlayers = modeSettings.max || null; // null means no max
        const playersList = this.players || [];
        const hasEnoughPlayers = playersList.length >= minPlayers && (!maxPlayers || playersList.length <= maxPlayers);
        const playerCountIssue = playersList.length < minPlayers
            ? `Need ${minPlayers} players`
            : (maxPlayers && playersList.length > maxPlayers ? `Max ${maxPlayers} players` : null);
        if (this.roomCode) {
            const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?room=${this.roomCode}`;
            window.history.replaceState({path: newUrl}, '', newUrl);
        }
        const joinUrl = `${window.location.origin}?room=${safeCode}`;
        const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(joinUrl)}`;
        const reannounceBtn = (roomIsPublic && this.isHost)
            ? `<button onclick="RoomManager.reannounce()" class="ml-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full transition">📢 Reannounce</button>`
            : '';
        const privacyBadge = roomIsPublic
            ? `<div class="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full mt-1"><span>🌍</span> Public (${playersList.length}/${roomMaxPlayers})${reannounceBtn}</div>`
            : `<div class="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full mt-1"><span>🔒</span> Private</div>`;
        const playersHtml = playersList.map(p => {
            let displayName = p.name || 'Guest';
            const isMe = p.id === this.playerId;
            const kickBtn = (this.isHost && !isMe)
                ? `<button onclick="RoomManager.kickPlayer('${p.id}')" class="text-red-400 hover:text-red-600 font-bold px-3 py-1 ml-2 rounded hover:bg-red-50" title="Kick Player">✕</button>`
                : '';
            return `<div class="flex items-center space-x-3 bg-white border border-gray-100 p-3 rounded-lg mb-2 shadow-sm">
                <div class="w-3 h-3 rounded-full ${p.ready !== false ? 'bg-green-500' : 'bg-gray-300'}"></div>
                <span class="font-bold text-gray-700 truncate flex-1">${displayName}</span>
                ${isMe ? '<span class="text-xs text-gray-400">(You)</span>' : ''}
                ${(p.id === this.players[0]?.id) ? '<span class="text-xs bg-indigo-100 text-indigo-700 px-2 rounded-full">HOST</span>' : kickBtn}
            </div>`;
        }).join('');
        let modesHtml = '';
        Object.entries(this.modeConfig).forEach(([key, conf]) => {
            const isSelected = (activeMode === key);
            if (!this.isHost && !isSelected) return;
            const clickAttr = this.isHost ? `onclick="window.RoomManager.updateMode('${key}')"` : '';
            let styleClass = isSelected
                ? 'bg-indigo-100 border-[3px] border-indigo-500 shadow-inner'
                : 'bg-white border border-gray-200 hover:bg-gray-50 cursor-pointer';
            // Add info button for selected mode
            const infoBtn = isSelected 
                ? `<button onclick="event.stopPropagation(); window.RoomManager.showModeRules('${key}')" class="ml-2 w-6 h-6 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full text-xs font-bold flex items-center justify-center transition" title="View Rules">ℹ️</button>`
                : '';
            modesHtml += `
                <div ${clickAttr} class="flex flex-col p-3 rounded-xl transition-all duration-200 ${styleClass} min-h-[80px]">
                    <div class="flex justify-between items-center mb-1">
                        <span class="font-bold text-sm ${isSelected ? 'text-indigo-700' : 'text-gray-700'}">${conf.label}</span>
                        <div class="flex items-center">
                            ${infoBtn}
                            ${isSelected ? '<span class="ml-1">✅</span>' : ''}
                        </div>
                    </div>
                    <span class="text-xs text-gray-500 leading-tight">${conf.desc}</span>
                </div>`;
        });
        const sliderDisabled = !this.isHost ? 'disabled' : '';
        const sliderOpacity = !this.isHost ? 'opacity-70' : '';
        let drinkingHtml = '';
        if (activeMode !== 'kids') {
            const extremeMode = this.extremeDrinkingMode || false;
            if (this.isHost) {
                drinkingHtml = `
                    <div class="flex items-center justify-between bg-yellow-50 p-3 rounded-xl border border-yellow-200 mt-2">
                        <label class="text-sm font-bold text-yellow-800 flex items-center gap-2"><span>🍺</span> Drinking Mode</label>
                        <input type="checkbox" onchange="window.RoomManager.toggleDrinking(this.checked)" ${activeDrinking ? 'checked' : ''} class="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500 cursor-pointer">
                    </div>
                    ${activeDrinking ? `
                    <div class="flex items-center justify-between bg-red-50 p-3 rounded-xl border border-red-300 mt-2 animate-fade-in">
                        <label class="text-sm font-bold text-red-800 flex items-center gap-2"><span>🔥</span> Extreme Mode <span class="text-xs font-normal">(More penalties)</span></label>
                        <input type="checkbox" onchange="window.RoomManager.toggleExtremeDrinking(this.checked)" ${extremeMode ? 'checked' : ''} class="w-5 h-5 text-red-600 rounded focus:ring-red-500 cursor-pointer">
                    </div>
                    ` : ''}
                `;
            } else if (activeDrinking) {
                drinkingHtml = `
                    <div class="flex items-center justify-center gap-2 bg-yellow-100 p-2 rounded-xl border border-yellow-300 mt-2 text-yellow-800 font-bold text-sm">
                        <span>🍺</span> DRINKING MODE ACTIVE ${extremeMode ? '<span class="text-red-600 ml-2">🔥 EXTREME</span>' : ''}
                    </div>
                `;
            }
        }
        const html = `
        <div id="lobbyModal" class="fixed inset-0 bg-gray-900 z-[9999] flex flex-col md:flex-row font-sans h-full">
            <div class="w-full md:w-1/3 bg-white p-4 md:p-6 flex flex-col border-b md:border-b-0 md:border-r border-gray-200 z-10 shadow-md md:shadow-none shrink-0 h-[40%] md:h-full overflow-hidden">
<div class="flex justify-between md:flex-col md:items-center mb-4 md:mb-6 shrink-0 w-full">
                    <div class="text-left md:text-center w-full">
                        <div class="text-xs text-gray-400 font-bold">ROOM CODE</div>
                        <div class="text-4xl md:text-6xl font-black text-indigo-600 font-mono tracking-widest leading-none">${safeCode}</div>
                        ${privacyBadge}
                    </div>
                    <div class="md:mt-6 w-auto md:w-full flex justify-end md:justify-center">
                        <img src="${qrSrc}" onclick="UIManager.expandQR('${qrSrc}')" class="rounded-lg w-20 h-20 md:w-32 md:h-32 border shadow-inner cursor-pointer hover:opacity-80 transition bg-white block">
                    </div>
                </div>
                <div class="text-xs font-bold text-gray-400 uppercase mb-2 shrink-0">Players</div>
                <div class="flex-1 overflow-y-auto custom-scrollbar p-1 border rounded-lg md:border-0 min-h-0 bg-gray-50 md:bg-white">
                    ${playersHtml}
                </div>
                <div class="shrink-0 mt-2 md:mt-4 pt-2 border-t md:border-0 border-gray-100">
                    <button onclick="window.location.href = window.location.pathname" class="w-full py-2 md:py-3 text-red-500 font-bold bg-red-50 hover:bg-red-100 rounded-xl transition text-sm">Leave Room</button>
                </div>
            </div>
            <div class="w-full md:w-2/3 bg-gray-50 p-4 md:p-6 flex flex-col relative h-[60%] md:h-full overflow-hidden">
                <h2 class="text-xl md:text-2xl font-black text-gray-800 mb-2 md:mb-4 shrink-0">Game Settings</h2>
                <div class="flex-1 overflow-y-auto custom-scrollbar min-h-0 pb-20">
                    <div class="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-200 mb-3 md:mb-6 ${sliderOpacity}">
                        <div class="flex justify-between items-center mb-2">
                            <label class="font-bold text-sm md:text-base text-gray-700">Words per Round</label>
                            <span id="lobbyWordCountDisplay" class="font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg text-sm">${activeWordCount} Words</span>
                        </div>
                        <input type="range" min="5" max="50" step="5" value="${activeWordCount}" ${sliderDisabled}
                            oninput="document.getElementById('lobbyWordCountDisplay').innerText = this.value + ' Words'; window.RoomManager.updateWordCount(this.value)"
                            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600">
                        ${drinkingHtml}
                    </div>
                    <div class="font-bold text-gray-700 mb-2 text-sm md:text-base">${this.isHost ? 'Select Mode' : 'Current Mode'}</div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                        ${modesHtml}
                    </div>
                </div>
                <div class="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-white border-t flex items-center justify-between shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-20 shrink-0">
                    <div class="text-xs md:text-sm text-gray-500 hidden sm:block">
                        ${this.isHost
                            ? (hasEnoughPlayers ? 'You are the Host.' : (playerCountIssue + ` (have ${playersList.length})`))
                            : 'Waiting for Host...'}
                    </div>
                    ${this.isHost ?
                        (hasEnoughPlayers
                            ? `<button onclick="window.RoomManager.startGame()" class="w-full sm:w-auto px-6 py-3 md:px-8 md:py-4 bg-green-500 hover:bg-green-600 text-white text-lg md:text-xl font-black rounded-xl shadow-lg transform transition active:scale-95 flex items-center justify-center gap-2"><span>START GAME</span> 🚀</button>`
                            : `<div class="w-full sm:w-auto px-6 py-3 md:px-8 md:py-4 bg-gray-300 text-gray-500 text-lg md:text-xl font-bold rounded-xl border border-gray-300 flex items-center justify-center gap-2 cursor-not-allowed"><span>${maxPlayers ? 'EXACTLY ' + maxPlayers + ' PLAYERS' : 'NEED ' + minPlayers + ' PLAYERS'}</span> 👥</div>`)
                        : `<div class="w-full sm:w-auto px-6 py-3 md:px-8 md:py-4 bg-gray-100 text-gray-400 text-lg md:text-xl font-bold rounded-xl border border-gray-200 flex items-center justify-center gap-2 cursor-not-allowed"><span>WAITING...</span> ⏳</div>`
                    }
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', html);
        if (scrollPlayers > 0 || scrollSettings > 0) {
            const newModal = document.getElementById('lobbyModal');
            if (newModal) {
                const newScrolls = newModal.querySelectorAll('.custom-scrollbar');
                if (newScrolls[0]) newScrolls[0].scrollTop = scrollPlayers;
                if (newScrolls[1]) newScrolls[1].scrollTop = scrollSettings;
            }
        }
    },
generateRandomCode() {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed I, O, 0, 1 to avoid confusion
        let result = "";
        for (let i = 0; i < 5; i++) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        const input = document.getElementById('menuRoomCodeInput');
        if (input) {
            input.value = result;
            input.focus();
        }
    },
    async startP2PHost() {
        const nameInput = document.getElementById('menuUsernameInput');
        if (nameInput?.value?.trim()) {
            State.data.username = nameInput.value.trim();
            State.save('username', State.data.username);
        }
        LocalPeerManager.init(this.socket);
        const menu = document.getElementById('mpMenu');
        if (menu) menu.remove();
        UIManager.showMessage('Creating local room... 📡');
        await LocalPeerManager.createRoom(10);
    },
    async joinP2P() {
        const codeInput = document.getElementById('menuRoomCodeInput');
        const roomCode = codeInput?.value?.trim().toUpperCase();
        if (!roomCode || roomCode.length < 3) {
            UIManager.showPostVoteMessage('Enter a room code! 📝');
            if (codeInput) codeInput.focus();
            return;
        }
        const nameInput = document.getElementById('menuUsernameInput');
        if (nameInput?.value?.trim()) {
            State.data.username = nameInput.value.trim();
            State.save('username', State.data.username);
        }
        LocalPeerManager.init(this.socket);
        const menu = document.getElementById('mpMenu');
        if (menu) menu.remove();
        UIManager.showMessage('Joining local room... 🔗');
        await LocalPeerManager.joinRoom(roomCode);
    },
    openMenu() {
        const existing = document.getElementById('mpMenu');
        if (existing) existing.remove();
        const currentName = State.data.username || '';
        if (this.socket && this.socket.connected) {
            this.socket.emit('getPublicGames');
        }
const html = `
        <div id="mpMenu" class="fixed inset-0 bg-black/80 z-[9999] flex items-start justify-center pt-8 md:items-center md:pt-0 backdrop-blur-sm p-4 overflow-y-auto">
            <div class="flex flex-col md:flex-row gap-4 w-full max-w-4xl">
                <div class="bg-white p-6 rounded-2xl shadow-2xl text-center flex-1 animate-pop relative border-t-4 border-indigo-500">
                    <button onclick="document.getElementById('mpMenu').remove()" class="absolute top-3 right-4 text-gray-400 text-xl hover:text-gray-600">&times;</button>
                    <h2 class="text-2xl font-black mb-4 text-gray-800">MULTIPLAYER MODE</h2>
                    <div class="flex flex-col gap-3">
                        <div>
                            <label class="text-xs font-bold text-gray-400 uppercase text-left block mb-1">Your Name</label>
                            <input type="text" id="menuUsernameInput" placeholder="NAME" value="${currentName}" maxlength="16" class="w-full p-3 border-2 border-gray-200 rounded-xl font-bold text-center focus:border-indigo-500 outline-none">
                        </div>
                        <div class="mb-2">
                            <label class="text-xs font-bold text-gray-400 uppercase text-left block mb-1">Room Code</label>
                            <div class="flex gap-2 items-stretch">
                                <input type="text" id="menuRoomCodeInput" placeholder="ENTER CODE" class="flex-1 p-3 border-2 border-gray-300 rounded-xl font-mono text-center text-xl uppercase focus:border-indigo-500 outline-none min-w-0" maxlength="10">
                                <button onclick="RoomManager.generateRandomCode()" class="bg-gray-100 hover:bg-indigo-100 text-indigo-600 font-bold px-3 md:px-4 rounded-xl border-2 border-gray-200 hover:border-indigo-200 transition-colors flex items-center justify-center gap-2 whitespace-nowrap text-xs md:text-sm">
                                    <span>🎲</span>
                                    <span>Random <span class="hidden sm:inline">Code</span></span>
                                </button>
                            </div>
                        </div>
                        <div class="bg-gray-50 p-3 rounded-xl border border-gray-200">
                            <div class="flex items-center justify-between mb-2">
                                <label class="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <span id="privacyIcon">🔒</span>
                                    <span id="privacyLabel">Private Game</span>
                                </label>
                                <button id="privacyToggle" onclick="RoomManager.togglePrivacy()" class="relative w-14 h-7 bg-gray-300 rounded-full transition-colors duration-200">
                                    <div id="privacyKnob" class="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"></div>
                                </button>
                            </div>
                            <div id="maxPlayersSection" class="hidden mt-3 pt-3 border-t border-gray-200">
                                <div class="flex items-center justify-between">
                                    <label class="text-sm font-bold text-gray-600">Max Players</label>
                                    <div class="flex items-center gap-2">
                                        <button onclick="RoomManager.adjustMaxPlayers(-1)" class="w-8 h-8 bg-gray-200 rounded-lg font-bold hover:bg-gray-300 transition">-</button>
                                        <span id="maxPlayersDisplay" class="w-8 text-center font-bold text-indigo-600">8</span>
                                        <button onclick="RoomManager.adjustMaxPlayers(1)" class="w-8 h-8 bg-gray-200 rounded-lg font-bold hover:bg-gray-300 transition">+</button>
                                    </div>
                                </div>
                                <p class="text-xs text-gray-400 mt-1">Public games are visible to everyone</p>
                            </div>
                        </div>
                        <button onclick="RoomManager.submitEntry()" class="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg mt-2 transition transform active:scale-95 w-full">JOIN / CREATE ONLINE</button>
                        <div class="mt-4 pt-4 border-t border-gray-200">
                            <div class="p-3 bg-green-50 border border-green-200 rounded-xl">
                                <h3 class="font-bold text-green-900 text-sm mb-2 text-left flex items-center gap-2">📡 LOCAL MODE <span class="text-xs font-normal text-green-600">(No WiFi needed!)</span></h3>
                                <div class="flex gap-2">
                                    <button onclick="RoomManager.startP2PHost()" class="flex-1 py-2 bg-green-600 text-white font-bold rounded-xl shadow active:scale-95 transition flex items-center justify-center gap-1 text-sm">
                                        <span>👑</span> Host
                                    </button>
                                    <button onclick="RoomManager.joinP2P()" class="flex-1 py-2 bg-white text-green-600 border-2 border-green-200 font-bold rounded-xl active:scale-95 transition flex items-center justify-center gap-1 text-sm">
                                        <span>🎮</span> Join
                                    </button>
                                </div>
                                <p class="text-xs text-green-500 mt-2 text-left">For festivals & poor signal. Brief connection to start, then works offline!</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bg-white p-6 rounded-2xl shadow-2xl flex-1 animate-pop relative border-t-4 border-green-500 text-center" style="animation-delay: 0.1s">
            
            <a href="https://www.facebook.com/groups/2647677235633381" target="_blank" rel="noopener noreferrer" class="absolute top-3 right-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition text-sm font-bold">
                <img src="fblogo.png" alt="FB" class="w-5 h-5">
                <span class="hidden sm:inline">Group</span>
            </a>

            <h2 class="text-2xl font-black text-gray-800 mb-4 flex items-center justify-center gap-2">
                <span>🌍</span> PUBLIC GAMES
            </h2>

            <div id="publicGamesList" class="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                        <div class="text-center py-8 text-gray-400">
                            <div class="text-3xl mb-2">📡</div>
                            <p class="text-sm">Searching for games...</p>
                        </div>
                    </div>
                    <button onclick="RoomManager.refreshPublicGames()" class="w-full mt-4 py-2 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2">
                        <span>🔄</span> Refresh List
                    </button>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', html);
        setTimeout(() => document.getElementById('menuRoomCodeInput')?.focus(), 100);
        this.renderPublicGames();
    },
    togglePrivacy() {
        this.isPublic = !this.isPublic;
        const toggle = document.getElementById('privacyToggle');
        const knob = document.getElementById('privacyKnob');
        const icon = document.getElementById('privacyIcon');
        const label = document.getElementById('privacyLabel');
        const maxSection = document.getElementById('maxPlayersSection');
        if (this.isPublic) {
            toggle.classList.remove('bg-gray-300');
            toggle.classList.add('bg-indigo-500');
            knob.style.transform = 'translateX(28px)';
            icon.textContent = '🌍';
            label.textContent = 'Public Game';
            maxSection.classList.remove('hidden');
        } else {
            toggle.classList.remove('bg-indigo-500');
            toggle.classList.add('bg-gray-300');
            knob.style.transform = 'translateX(0)';
            icon.textContent = '🔒';
            label.textContent = 'Private Game';
            maxSection.classList.add('hidden');
        }
    },
    adjustMaxPlayers(delta) {
        this.maxPlayers = Math.min(20, Math.max(2, this.maxPlayers + delta));
        const display = document.getElementById('maxPlayersDisplay');
        if (display) display.textContent = this.maxPlayers;
    },
    refreshPublicGames() {
        if (this.socket && this.socket.connected) {
            this.socket.emit('getPublicGames');
            const list = document.getElementById('publicGamesList');
            if (list) {
                list.innerHTML = `
                    <div class="text-center py-8 text-gray-400">
                        <div class="text-3xl mb-2 animate-pulse">📡</div>
                        <p class="text-sm">Searching for games...</p>
                    </div>`;
            }
        }
    },
    renderPublicGames() {
        const list = document.getElementById('publicGamesList');
        if (!list) return;
        if (!this.publicGames || this.publicGames.length === 0) {
            list.innerHTML = `
                <div class="text-center py-8 text-gray-400">
                    <div class="text-3xl mb-2">😴</div>
                    <p class="text-sm font-medium">No public games available</p>
                    <p class="text-xs mt-1">Create one and others can join!</p>
                </div>`;
            return;
        }
        list.innerHTML = this.publicGames.map(game => {
            const isFull = game.players >= game.maxPlayers;
            const spotsLeft = game.maxPlayers - game.players;
            const modeLabel = this.modeConfig[game.mode]?.label || game.mode;
            return `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 ${isFull ? 'opacity-50' : 'hover:bg-gray-100'} transition">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                            <span class="font-mono font-bold text-indigo-600">${game.roomCode}</span>
                            <span class="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">${modeLabel}</span>
                        </div>
                        <div class="text-xs text-gray-500 mt-1 flex items-center gap-2">
                            <span>👥 ${game.players}/${game.maxPlayers}</span>
                            ${!isFull ? `<span class="text-green-600">${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left</span>` : '<span class="text-red-500">Full</span>'}
                        </div>
                    </div>
                    <button
                        onclick="RoomManager.joinPublicGame('${game.roomCode}')"
                        ${isFull ? 'disabled' : ''}
                        class="px-4 py-2 ${isFull ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'} font-bold rounded-lg transition text-sm">
                        ${isFull ? 'FULL' : 'JOIN'}
                    </button>
                </div>`;
        }).join('');
    },
    joinPublicGame(roomCode) {
        const nameInput = document.getElementById('menuUsernameInput');
        const nameToUse = nameInput ? nameInput.value.trim() : '';
        if (nameToUse) {
            State.save('username', nameToUse);
            if(DOM.inputs.username) DOM.inputs.username.value = nameToUse;
        }
        this.attemptJoinOrCreate(roomCode, nameToUse);
    },
    submitEntry() {
        const codeInput = document.getElementById('menuRoomCodeInput');
        const nameInput = document.getElementById('menuUsernameInput');
        if (!codeInput) return;
        const code = codeInput.value.trim().toUpperCase();
        const nameToUse = nameInput ? nameInput.value.trim() : '';
        if (nameToUse) {
            State.save('username', nameToUse);
            if(DOM.inputs.username) DOM.inputs.username.value = nameToUse;
        }
        if (code.length > 0) this.attemptJoinOrCreate(code, nameToUse);
    },
    attemptJoinOrCreate(code, nameOverride = null) {
        this.roomCode = code;
        this.socket.emit('joinRoom', {
            roomCode: code,
            username: nameOverride || this.getUsername(),
            theme: State.data.currentTheme,
            isPublic: this.isPublic,
            maxPlayers: this.maxPlayers
        });
    },
    closeLobby() { document.getElementById('lobbyModal')?.remove(); document.getElementById('mpMenu')?.remove(); }
};

// ============================================================================
// EXPORTS
// ============================================================================
window.UIManager = UIManager;
window.TipManager = TipManager;
window.ContactManager = ContactManager;
window.LocalPeerManager = LocalPeerManager;
window.RoomManager = RoomManager;
window.PinPad = PinPad;
window.InputHandler = InputHandler;
window.ModalManager = ModalManager;
window.DiscoveryManager = DiscoveryManager;
window.SeededShuffle = SeededShuffle;

console.log('%c[UI] Module loaded', 'color: #06b6d4; font-weight: bold');

})();
