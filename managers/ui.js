import { DOM } from '../dom.js';
import { State } from '../state.js';
import { CONFIG } from '../config.js';
import { Accessibility } from '../utils/accessibility.js';
import { ModalManager } from './modal.js'; // We will create this next

export const UIManager = {
    msgTimeout: null,
    loadSpecialCallback: null, // Placeholder for Game function

    /**
     * Register the callback to load a special word (breaks circular dependency)
     */
    setLoadSpecialCallback(fn) {
        this.loadSpecialCallback = fn;
    },

    showMessage(t, err = false) {
        const wd = DOM.game.wordDisplay;
        wd.textContent = t;
        wd.className = `text-4xl font-bold text-center min-h-[72px] ${err?'text-red-500':'text-gray-500'}`;
        wd.style.fontSize = '2.0rem';
        wd.style.cursor = 'default';
        DOM.game.wordFrame.style.padding = '0';
        this.disableButtons(true);
    },

    disableButtons(d) {
        Object.values(DOM.game.buttons).forEach(b => {
            if (!b.id.includes('custom')) b.disabled = d;
        });
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
                el.classList.add('opacity-0');
            }, 5000);
        }, 150);
    },

    updateStats() {
        const w = State.runtime.allWords;
        if (!w || !w.length) return;
        
        DOM.header.streak.textContent = State.data.daily.streak;
        DOM.header.userVotes.textContent = State.data.voteCount.toLocaleString();
        
        const totalGood = w.reduce((a, b) => a + (b.goodVotes || 0), 0);
        const totalBad = w.reduce((a, b) => a + (b.badVotes || 0), 0);
        const globalTotal = totalGood + totalBad;

        DOM.header.globalVotes.textContent = globalTotal.toLocaleString();
        DOM.header.totalWords.textContent = w.length.toLocaleString();
        DOM.header.good.textContent = totalGood.toLocaleString();
        DOM.header.bad.textContent = totalBad.toLocaleString();

        // --- GRAPH LOGIC ---
        if (globalTotal > 0) {
            const goodPct = (totalGood / globalTotal) * 100;
            const badPct = 100 - goodPct; 
            DOM.header.barGood.style.width = `${goodPct}%`;
            DOM.header.barBad.style.width = `${badPct}%`;
        } else {
            DOM.header.barGood.style.width = '50%';
            DOM.header.barBad.style.width = '50%';
        }
        this.renderMiniRankings();
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
            
            DOM.profile.modalEmoji.classList.add('hidden');
            DOM.profile.modalImage.src = p;
            DOM.profile.modalImage.classList.remove('hidden');
        } else {
            DOM.header.profileEmoji.classList.remove('hidden');
            DOM.header.profileImage.classList.add('hidden');
            
            DOM.profile.modalEmoji.classList.remove('hidden');
            DOM.profile.modalImage.classList.add('hidden');
        }
    },

    openProfile() {
        this.updateProfileDisplay();
        const d = State.data;
        DOM.profile.streak.textContent = d.daily.streak;
        DOM.profile.totalVotes.textContent = d.voteCount.toLocaleString();
        DOM.profile.contributions.textContent = d.contributorCount.toLocaleString();
        
        const totalAvailable = Object.keys(CONFIG.THEME_SECRETS).length + 1;
        const userCount = d.unlockedThemes.length + 1;
        DOM.profile.themes.textContent = `${userCount} / ${totalAvailable}`;
        
        const b = DOM.profile.badges;
        const row1 = [
            { k: 'cake', i: '🎂', w: 'CAKE' }, { k: 'llama', i: '🦙', w: 'LLAMA' }, 
            { k: 'potato', i: '🥔', w: 'POTATO' }, { k: 'squirrel', i: '🐿️', w: 'SQUIRREL' }, 
            { k: 'spider', i: '🕷️', w: 'SPIDER' }, { k: 'germ', i: '🦠', w: 'GERM' }, 
            { k: 'bone', i: '🦴', w: 'MASON' }
        ];
        const row2 = [
            { k: 'poop', i: '💩' }, { k: 'penguin', i: '🐧' }, 
            { k: 'scorpion', i: '🦂' }, { k: 'mushroom', i: '🍄' }, 
            { k: 'needle', i: '💉' }, { k: 'diamond', i: '💎' },
            { k: 'rock', i: '🤘' }
        ];

        const renderRow = (list) => `<div class="flex flex-wrap justify-center gap-3 text-3xl w-full">` + list.map(x => {
            const un = d.badges[x.k];
            return `<span class="${un?'':'opacity-25 grayscale'} transition-all duration-300 transform ${un?'hover:scale-125 cursor-pointer badge-item':''}" title="${un?'Unlocked':'Locked'}" ${x.w?`data-word="${x.w}"`:''}>${x.i}</span>`;
        }).join('') + `</div>`;

        b.innerHTML = `<div class="text-xs font-bold text-gray-500 uppercase mb-2 mt-2">🏆 Word Badges</div>` + 
                      renderRow(row1) + 
                      `<div class="h-px bg-gray-100 w-full my-4"></div><div class="text-xs font-bold text-gray-500 uppercase mb-2">🧸 Found Items</div>` + 
                      renderRow(row2);

        // Add click listeners to badges
        b.querySelectorAll('.badge-item').forEach(el => {
            el.onclick = () => {
                if (el.dataset.word && this.loadSpecialCallback) {
                    this.loadSpecialCallback(el.dataset.word);
                    ModalManager.toggle('profile', false);
                }
            };
        });
        
        ModalManager.toggle('profile', true);
    },

    displayWord(w) {
        if (!w) {
            this.showMessage("No words available!");
            return;
        }
        
        const wd = DOM.game.wordDisplay;
        const txt = w.text.toUpperCase();
        
        wd.textContent = txt;
        wd.className = 'font-extrabold text-gray-900 text-center min-h-[72px]';
        wd.style = '';
        wd.style.opacity = '1';
        
        // Theme Specific Styling
        const t = State.data.currentTheme;
        
        // Color Overrides
        if (['dark', 'halloween', 'submarine', 'fire', 'plymouth'].includes(t)) {
            wd.style.color = '#f3f4f6';
        }

        // Specific Animation/Effects
        switch(t) {
            case 'halloween':
                wd.style.color = '#FF8C00';
                wd.style.textShadow = '2px 2px 0px #1a0000, 0 0 8px rgba(255,140,0,1), 0 0 15px rgba(255,69,0,0.6)';
                break;
            case 'submarine':
                wd.style.color = '#b0e0e6';
                wd.style.textShadow = '0 0 10px rgba(176,224,230,0.7), 0 0 5px rgba(255,255,255,0.3)';
                wd.style.animation = 'bobbing-word 2.5s ease-in-out infinite';
                break;
            case 'fire':
                wd.style.color = '#ffaa00';
                wd.style.textShadow = '2px 2px 0px #300, 0 0 8px #ff5000, 0 0 20px #ff0000';
                break;
            case 'banana':
                wd.style.color = '#ffd200';
                wd.style.animation = 'bounce-word .5s ease-out infinite alternate';
                break;
            case 'winter':
                wd.style.color = '#01579b';
                wd.classList.remove('animate-snow-text');
                void wd.offsetWidth; // Trigger reflow
                wd.classList.add('animate-snow-text');
                break;
            case 'summer':
                wd.style.color = '#fffde7';
                wd.style.textShadow = '0 0 5px #fff9c4, 0 0 20px #ffeb3b, 0 0 40px #ff9800, 0 0 70px #ff5722';
                wd.style.animation = 'sun-pulse 4s ease-in-out infinite alternate';
                break;
            case 'rainbow':
                wd.style.background = 'linear-gradient(45deg, #f00, #ff7f00, #ff0, #0f0, #0ff, #00f, #9400d3)';
                wd.style.webkitBackgroundClip = 'text';
                wd.style.webkitTextFillColor = 'transparent';
                wd.style.color = 'transparent';
                wd.style.animation = 'rainbow-text 5s ease infinite';
                break;
            default:
                // Clear animation if not specific
                if (!['banana', 'rainbow', 'submarine'].includes(t)) wd.style.animation = 'none';
        }

        // Snow Drift logic (Winter only)
        const drift = document.getElementById('card-snow-drift');
        if (drift) {
            if (t === 'winter') {
                drift.classList.remove('animate-snow-drift');
                void drift.offsetWidth;
                drift.classList.add('animate-snow-drift');
            } else {
                drift.style.height = '0';
            }
        }

        this.fitText(txt);
        
        if (!State.runtime.isCoolingDown) this.disableButtons(false);
        wd.style.cursor = 'grab';
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
            return;
        }
        l.forEach((w, i) => {
            const d = document.createElement('div');
            d.className = `flex justify-between items-center py-1 ${isF?'full-ranking-item text-sm':'rank-item'}`;
            const bg = type === 'good' ? 'bg-green-500' : 'bg-red-500';
            const val = type === 'good' ? w.score : Math.abs(w.score);
            
            d.innerHTML = `
                <div class="flex items-center ${isF?'space-x-3':'space-x-2'}">
                    <span class="font-bold ${isF?'text-base w-8':'text-lg w-5'} text-center text-gray-500 flex-shrink-0">${w.rank||(i+1)}.</span>
                    <span class="font-medium text-gray-800">${w.text.toUpperCase()}</span>
                </div>
                <div class="flex items-center space-x-3">
                    <span class="text-xs text-white ${bg} px-2 rounded-full font-bold">${val}</span>
                    <span class="text-sm text-gray-600">(${w.good} / ${w.bad})</span>
                </div>`;
            c.appendChild(d);
        });
    },

    getRankedLists(lim) {
        // Calculate scores dynamically
        const r = State.runtime.allWords.map(w => ({
            text: w.text,
            good: w.goodVotes || 0,
            bad: w.badVotes || 0,
            score: (w.goodVotes || 0) - (w.badVotes || 0)
        }));
        
        // Sort logic: Score first, then total volume (controversial wins ties)
        const tg = [...r].sort((a, b) => (b.score - a.score) || ((b.good + b.bad) - (a.good + a.bad)));
        const tb = [...r].sort((a, b) => (a.score - b.score) || ((b.good + b.bad) - (a.good + a.bad)));
        
        if (lim === 0) return { topGood: tg, topBad: tb };
        return { topGood: tg.slice(0, lim), topBad: tb.slice(0, lim) };
    },

    renderMiniRankings() {
        const { topGood, topBad } = this.getRankedLists(5);
        this.renderRankingsImpl(DOM.rankings.good, topGood, 'good', false);
        this.renderRankingsImpl(DOM.rankings.bad, topBad, 'bad', false);
    },

    renderFullRankings() {
        const { topGood, topBad } = this.getRankedLists(100);
        this.renderRankingsImpl(DOM.rankings.fullGood, topGood, 'good', true);
        this.renderRankingsImpl(DOM.rankings.fullBad, topBad, 'bad', true);
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
            return;
        }
        
        const w = topGood[gI];
        c.innerHTML = `
            <div class="p-4 bg-white rounded-xl shadow-sm border border-gray-200 inline-block w-full max-w-sm">
                <h3 class="text-2xl font-black text-gray-800 mb-4">${w.text.toUpperCase()}</h3>
                <div class="flex justify-around mb-4">
                    <div class="text-center">
                        <div class="text-sm text-gray-500">Good Rank</div>
                        <div class="text-3xl font-bold text-green-600">#${gI+1}</div>
                    </div>
                    <div class="text-center">
                        <div class="text-sm text-gray-500">Bad Rank</div>
                        <div class="text-3xl font-bold text-red-600">#${bI+1}</div>
                    </div>
                </div>
                <div class="border-t pt-4 flex justify-between text-sm">
                    <span class="font-bold text-green-600">+${w.good} Good</span>
                    <span class="font-bold text-red-600">-${w.bad} Bad</span>
                </div>
            </div>`;
    }
};