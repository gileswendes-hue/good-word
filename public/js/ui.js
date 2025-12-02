import { State } from './state.js';
import { CONFIG } from './config.js';
import { API, SoundManager, Accessibility, Utils } from './utils.js';
import { ThemeManager } from './theme.js';
import { Game } from './main.js'; 

export const DOM = {
    header: {
        logoArea: document.getElementById('logoArea'),
        userStatsBar: document.getElementById('userStatsBar'),
        streak: document.getElementById('headerStreak'),
        userVotes: document.getElementById('headerUserVotes'),
        globalVotes: document.getElementById('headerGlobalVotes'),
        totalWords: document.getElementById('headerTotalWords'),
        good: document.getElementById('headerGood'),
        bad: document.getElementById('headerBad'),
        barGood: document.getElementById('headerBarGood'),
        barBad: document.getElementById('headerBarBad'),
        profileLabel: document.getElementById('headerProfileLabel'),
        profileEmoji: document.getElementById('headerProfileEmoji'),
        profileImage: document.getElementById('headerProfileImage')
    },
    game: {
        card: document.getElementById('gameCard'),
        wordFrame: document.getElementById('wordFrame'),
        wordDisplay: document.getElementById('wordDisplay'),
        dailyBanner: document.getElementById('dailyBanner'),
        dailyStatus: document.getElementById('dailyStatusText'),
        buttons: {
            good: document.getElementById('goodButton'),
            bad: document.getElementById('badButton'),
            notWord: document.getElementById('notWordButton'),
            custom: document.getElementById('customWordButton')
        },
        message: document.getElementById('postVoteMessage')
    },
    rankings: {
        good: document.getElementById('goodRankings'),
        bad: document.getElementById('badRankings'),
        fullGood: document.getElementById('fullGoodRankings'),
        fullBad: document.getElementById('fullBadRankings'),
        btnShow: document.getElementById('showTop100Button'),
        listsContainer: document.getElementById('rankingListsContainer'),
        searchContainer: document.getElementById('rankSearchContainer'),
        searchResult: document.getElementById('rankSearchResult'),
        clearSearch: document.getElementById('clearRankSearch'),
        searchInput: document.getElementById('rankSearchInput'),
        searchBtn: document.getElementById('rankSearchBtn')
    },
    theme: {
        chooser: document.getElementById('themeChooser'),
        effects: {
            snow: document.getElementById('snow-effect'),
            bubble: document.getElementById('bubble-effect'),
            fire: document.getElementById('fire-effect'),
            summer: document.getElementById('summer-effect'),
            plymouth: document.getElementById('plymouth-effect'),
            ballpit: document.getElementById('ballpit-effect'),
            space: document.getElementById('space-effect')
        }
    },
    modals: {
        submission: document.getElementById('submissionModal'),
        fullRankings: document.getElementById('fullRankingsModalContainer'),
        definition: document.getElementById('definitionModalContainer'),
        compare: document.getElementById('compareModalContainer'),
        settings: document.getElementById('settingsModalContainer'),
        profile: document.getElementById('profileModal'),
        dailyResult: document.getElementById('dailyResultModal')
    },
    profile: {
        streak: document.getElementById('profileStreak'),
        totalVotes: document.getElementById('profileTotalVotes'),
        contributions: document.getElementById('profileContributions'),
        themes: document.getElementById('profileThemes'),
        badges: document.getElementById('badgeContainer'),
        statsTitle: document.getElementById('profileStatsTitle'),
        saveMsg: document.getElementById('profileSaveMsg'),
        modalEmoji: document.getElementById('modalProfileEmoji'),
        modalImage: document.getElementById('modalProfileImage'),
        photoInput: document.getElementById('photoInput')
    },
    daily: {
        peopleCount: document.getElementById('dailyPeopleCount'), // Note: This ID might be missing in your HTML, check if needed
        worldRank: document.getElementById('dailyWorldRank'),
        streakResult: document.getElementById('dailyStreakResult'),
        closeBtn: document.getElementById('closeDailyResult')
    },
    inputs: {
        newWord: document.getElementById('newWordInput'),
        wordOne: document.getElementById('wordOneInput'),
        wordTwo: document.getElementById('wordTwoInput'),
        modalMsg: document.getElementById('modalMessage'),
        compareResults: document.getElementById('compareResults'),
        username: document.getElementById('usernameInput'),
        settings: {
            tips: document.getElementById('toggleTips'),
            percentages: document.getElementById('togglePercentages'),
            colorblind: document.getElementById('toggleColorblind'),
            largeText: document.getElementById('toggleLargeText'),
            tilt: document.getElementById('toggleTilt'),
            mirror: document.getElementById('toggleMirror'),
            // Mute and ZeroVotes will be injected dynamically if missing, or we can look for them
            mute: document.getElementById('toggleMute'), 
            zeroVotes: document.getElementById('toggleZeroVotes')
        }
    },
    general: {
        version: document.querySelector('.version-indicator')
    }
};

export const ShareManager = {
    async generateImage() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const width = 1080;
        const height = 1350;
        canvas.width = width;
        canvas.height = height;

        // Gradient Background
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, '#6366f1'); 
        grad.addColorStop(1, '#a855f7'); 
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Card Container
        const margin = 60;
        const cardY = 150;
        const cardH = height - 280; 
        ctx.fillStyle = '#ffffff';
        if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(margin, cardY, width - (margin * 2), cardH, 40);
            ctx.fill();
        } else {
            ctx.fillRect(margin, cardY, width - (margin * 2), cardH);
        }

        // Text
        const name = State.data.username || "Player";
        ctx.fillStyle = '#1f2937'; 
        ctx.font = 'bold 60px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${name.toUpperCase()}'S STATS`, width / 2, cardY + 100);

        ctx.fillStyle = '#6b7280'; 
        ctx.font = '30px Inter, sans-serif';
        ctx.fillText("GOOD WORD / BAD WORD", width / 2, cardY + 150);

        // Stats Grid
        const stats = [
            { label: 'Day Streak', val: State.data.daily.streak, icon: '🔥', color: '#fff7ed', text: '#ea580c' },
            { label: 'Total Votes', val: State.data.voteCount.toLocaleString(), icon: '🗳️', color: '#eff6ff', text: '#2563eb' },
            { label: 'Words Added', val: State.data.contributorCount.toLocaleString(), icon: '✍️', color: '#f0fdf4', text: '#16a34a' },
            { label: 'Themes', val: DOM.profile.themes.textContent, icon: '🎨', color: '#faf5ff', text: '#9333ea' }
        ];

        let gridY = cardY + 220;
        const boxW = 400;
        const boxH = 180;
        const gap = 40;
        const startX = (width - (boxW * 2 + gap)) / 2;

        stats.forEach((stat, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const x = startX + (col * (boxW + gap));
            const y = gridY + (row * (boxH + gap));

            ctx.fillStyle = stat.color;
            ctx.fillRect(x, y, boxW, boxH);
            ctx.strokeStyle = stat.text + '40'; 
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, boxW, boxH);

            ctx.font = '60px serif';
            ctx.textAlign = 'center';
            ctx.fillText(stat.icon, x + boxW / 2, y + 70);

            ctx.fillStyle = stat.text;
            ctx.font = 'bold 50px Inter, sans-serif';
            ctx.fillText(stat.val, x + boxW / 2, y + 130);

            ctx.fillStyle = '#6b7280';
            ctx.font = 'bold 20px Inter, sans-serif';
            ctx.fillText(stat.label.toUpperCase(), x + boxW / 2, y + 160);
        });

        // Badges
        const badgeY = gridY + (2 * (boxH + gap)) + 60;
        ctx.fillStyle = '#374151';
        ctx.font = 'bold 30px Inter, sans-serif';
        ctx.fillText("BADGES UNLOCKED", width / 2, badgeY);

        const allBadges = [
            { k: 'cake', i: '🎂' }, { k: 'llama', i: '🦙' }, { k: 'potato', i: '🥔' },
            { k: 'squirrel', i: '🐿️' }, { k: 'spider', i: '🕷️' }, { k: 'germ', i: '🦠' },
            { k: 'bone', i: '🦴' }, { k: 'poop', i: '💩' }, { k: 'penguin', i: '🐧' },
            { k: 'scorpion', i: '🦂' }, { k: 'mushroom', i: '🍄' }, { k: 'needle', i: '💉' },
            { k: 'diamond', i: '💎' }, { k: 'rock', i: '🤘' }
        ];

        let bx = (width - (7 * 80)) / 2 + 40; 
        let by = badgeY + 80;

        allBadges.forEach((b, i) => {
            const unlocked = State.data.badges[b.k];
            ctx.font = '60px serif';
            ctx.textAlign = 'center';
            
            if (unlocked) {
                ctx.globalAlpha = 1.0;
                ctx.filter = 'none';
            } else {
                ctx.globalAlpha = 0.2;
                ctx.filter = 'grayscale(100%)';
            }
            
            if (i === 7) { bx = (width - (7 * 80)) / 2 + 40; by += 100; }
            
            ctx.fillText(b.i, bx, by);
            bx += 80;
        });

        ctx.globalAlpha = 1.0;
        ctx.filter = 'none';

        // Footer
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 50px Inter, sans-serif'; 
        ctx.fillText("GBword.com", width / 2, height - 90);
        
        ctx.font = '30px Inter, sans-serif';
        ctx.fillText("Play Daily & Create Words", width / 2, height - 40);

        return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    },

    async share() {
        UIManager.showPostVoteMessage("Generating image...");
        try {
            const blob = await this.generateImage();
            const file = new File([blob], 'my-gbword-stats.png', { type: 'image/png' });
            
            const shareData = {
                title: 'My Stats',
                text: 'Check out my Good Word / Bad Word stats! 🗳️\n\nPlay now at http://good-word.onrender.com/',
                url: 'http://good-word.onrender.com/',
                files: [file]
            };

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share(shareData);
            } else {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'gbword-stats.png';
                a.click();
                UIManager.showPostVoteMessage("Image downloaded!");
            }
        } catch (e) {
            console.error(e);
            UIManager.showPostVoteMessage("Could not share image.");
        }
    }
};

export const UIManager = {
    msgTimeout: null,
    showMessage(t, err = false) {
        const wd = DOM.game.wordDisplay;
        wd.textContent = t;
        // Adjusted class names to match your HTML structure/CSS
        wd.className = `font-extrabold text-gray-900 text-center min-h-[72px] ${err?'text-red-500':'text-gray-900'}`;
        // Ensure size is reset or set appropriately
        // wd.style.fontSize = '2.0rem'; 
        wd.style.cursor = 'default';
        // DOM.game.wordFrame.style.padding = '0';
        this.disableButtons(true)
    },
    disableButtons(d) {
        Object.values(DOM.game.buttons).forEach(b => {
            if (b && !b.id.includes('custom')) b.disabled = d
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
        const w = State.runtime.allWords;
        if (!w.length) return;
        
        if(DOM.header.streak) DOM.header.streak.textContent = State.data.daily.streak;
        if(DOM.header.userVotes) DOM.header.userVotes.textContent = State.data.voteCount.toLocaleString();
        
        const totalGood = w.reduce((a, b) => a + (b.goodVotes || 0), 0);
        const totalBad = w.reduce((a, b) => a + (b.badVotes || 0), 0);
        const globalTotal = totalGood + totalBad;

        if(DOM.header.globalVotes) DOM.header.globalVotes.textContent = globalTotal.toLocaleString();
        if(DOM.header.totalWords) DOM.header.totalWords.textContent = w.length.toLocaleString();
        if(DOM.header.good) DOM.header.good.textContent = totalGood.toLocaleString();
        if(DOM.header.bad) DOM.header.bad.textContent = totalBad.toLocaleString();

        if (globalTotal > 0 && DOM.header.barGood && DOM.header.barBad) {
            const goodPct = (totalGood / globalTotal) * 100;
            const badPct = 100 - goodPct; 

            DOM.header.barGood.style.width = `${goodPct}%`;
            DOM.header.barBad.style.width = `${badPct}%`;
        } else if (DOM.header.barGood && DOM.header.barBad) {
            DOM.header.barGood.style.width = '50%';
            DOM.header.barBad.style.width = '50%';
        }
        this.renderMiniRankings();
    },
    updateProfileDisplay() {
        const n = State.data.username;
        const p = State.data.profilePhoto; 
        
        if(DOM.header.profileLabel) DOM.header.profileLabel.textContent = n ? `${n}'s Profile` : 'My Profile';
        if(DOM.profile.statsTitle) DOM.profile.statsTitle.textContent = n ? `${n}'s Stats` : 'Your Stats';
        if (n && DOM.inputs.username) DOM.inputs.username.value = n;

        if (p) {
            if(DOM.header.profileEmoji) DOM.header.profileEmoji.classList.add('hidden');
            if(DOM.header.profileImage) {
                DOM.header.profileImage.src = p;
                DOM.header.profileImage.classList.remove('hidden');
            }
        } else {
            if(DOM.header.profileEmoji) DOM.header.profileEmoji.classList.remove('hidden');
            if(DOM.header.profileImage) DOM.header.profileImage.classList.add('hidden');
        }

        if (p) {
            if(DOM.profile.modalEmoji) DOM.profile.modalEmoji.classList.add('hidden');
            if(DOM.profile.modalImage) {
                DOM.profile.modalImage.src = p;
                DOM.profile.modalImage.classList.remove('hidden');
            }
        } else {
            if(DOM.profile.modalEmoji) DOM.profile.modalEmoji.classList.remove('hidden');
            if(DOM.profile.modalImage) DOM.profile.modalImage.classList.add('hidden');
        }
    },
    openProfile() {
        this.updateProfileDisplay();
        const d = State.data;
        if(DOM.profile.streak) DOM.profile.streak.textContent = d.daily.streak;
        if(DOM.profile.totalVotes) DOM.profile.totalVotes.textContent = d.voteCount.toLocaleString();
        if(DOM.profile.contributions) DOM.profile.contributions.textContent = d.contributorCount.toLocaleString();
        
        const totalAvailable = Object.keys(CONFIG.THEME_SECRETS).length + 1;
        const userCount = d.unlockedThemes.length + 1;
        
        if(DOM.profile.themes) DOM.profile.themes.textContent = `${userCount} / ${totalAvailable}`;
        
        const b = DOM.profile.badges;
        const row1 = [{ k: 'cake', i: '🎂', w: 'CAKE' }, { k: 'llama', i: '🦙', w: 'LLAMA' }, { k: 'potato', i: '🥔', w: 'POTATO' }, { k: 'squirrel', i: '🐿️', w: 'SQUIRREL' }, { k: 'spider', i: '🕷️', w: 'SPIDER' }, { k: 'germ', i: '🦠', w: 'GERM' }, { k: 'bone', i: '🦴', w: 'MASON' }];
        const row2 = [{ k: 'poop', i: '💩' }, { k: 'penguin', i: '🐧' }, { k: 'scorpion', i: '🦂' }, { k: 'mushroom', i: '🍄' }, { k: 'needle', i: '💉' }, { k: 'diamond', i: '💎' },{ k: 'rock', i: '🤘' }];
        const renderRow = (list) => `<div class="flex flex-wrap justify-center gap-3 text-3xl w-full">` + list.map(x => {
            const un = d.badges[x.k];
            return `<span class="${un?'':'opacity-25 grayscale'} transition-all duration-300 transform ${un?'hover:scale-125 cursor-pointer badge-item':''}" title="${un?'Unlocked':'Locked'}" ${x.w?`data-word="${x.w}"`:''}>${x.i}</span>`
        }).join('') + `</div>`;
        
        if(b) {
            b.innerHTML = `<div class="text-xs font-bold text-gray-500 uppercase mb-2 mt-2">🏆 Word Badges</div>` + renderRow(row1) + `<div class="h-px bg-gray-100 w-full my-4"></div><div class="text-xs font-bold text-gray-500 uppercase mb-2">🧸 Found Items</div>` + renderRow(row2);
            b.querySelectorAll('.badge-item').forEach(el => {
                el.onclick = () => {
                    if (el.dataset.word) {
                        Game.loadSpecial(el.dataset.word);
                        ModalManager.toggle('profile', false)
                    }
                }
            });
        }
        ModalManager.toggle('profile', true)
    },
    displayWord(w) {
        if (!w) {
            this.showMessage("No words available!");
            return
        }
        const wd = DOM.game.wordDisplay,
            txt = w.text.toUpperCase();
        wd.textContent = txt;
        wd.className = 'font-extrabold text-gray-900 text-center min-h-[72px]';
        wd.style = '';
        wd.style.opacity = '1';
        
        const t = State.data.currentTheme;
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
        if (drift) {
            if (t === 'winter') {
                drift.style.display = 'block';
                drift.classList.remove('animate-snow-drift');
                void drift.offsetWidth;
                drift.classList.add('animate-snow-drift')
            } else {
                drift.style.display = 'none';
            }
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
        if (!wd || !DOM.game.card) return;
        
        const cW = DOM.game.card.clientWidth - 40; // Approx padding adjustment

        wd.style.fontSize = `${baseSize}px`;
        wd.style.whiteSpace = 'nowrap';

        if (wd.scrollWidth > cW) {
            const s = cW / wd.scrollWidth;
            wd.style.fontSize = Math.max(minSize, Math.floor(baseSize * s)) + 'px';
        }
        wd.style.whiteSpace = 'normal';
    },
    renderRankingsImpl(c, l, type, isF) {
        if (!c) return;
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
        const r = State.runtime.allWords.map(w => ({
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
    }
};

export const ModalManager = {
    toggle(id, show) {
        const e = DOM.modals[id];
        if(!e) return;
        // Your HTML uses "hidden" class and "flex" class for toggling
        if (show) {
            e.classList.remove('hidden');
            e.classList.add('flex');
        } else {
            e.classList.add('hidden');
            e.classList.remove('flex');
        }
    },
    init() {
        if(document.getElementById('showSettingsButton')) {
            document.getElementById('showSettingsButton').onclick = () => {
                // Update UI state
                if(DOM.inputs.settings.tips) DOM.inputs.settings.tips.checked = State.data.settings.showTips;
                if(DOM.inputs.settings.percentages) DOM.inputs.settings.percentages.checked = State.data.settings.showPercentages;
                if(DOM.inputs.settings.colorblind) DOM.inputs.settings.colorblind.checked = State.data.settings.colorblindMode;
                if(DOM.inputs.settings.largeText) DOM.inputs.settings.largeText.checked = State.data.settings.largeText;
                if(DOM.inputs.settings.tilt) DOM.inputs.settings.tilt.checked = State.data.settings.enableTilt;
                if(DOM.inputs.settings.mirror) DOM.inputs.settings.mirror.checked = State.data.settings.mirrorMode;

                // Inject dynamic settings (Mute/ZeroVotes) if they don't exist yet
                // Your HTML might not have had these in the provided snippet
                // We'll skip complex injection here to avoid breaking your layout, 
                // but you can add them manually to HTML if needed.

                this.toggle('settings', true)
            };
        }

        if(document.getElementById('closeSettingsModal')) document.getElementById('closeSettingsModal').onclick = () => this.toggle('settings', false);
        
        if(DOM.inputs.settings.tips) DOM.inputs.settings.tips.onchange = e => State.save('settings', { ...State.data.settings, showTips: e.target.checked });
        if(DOM.inputs.settings.percentages) DOM.inputs.settings.percentages.onchange = e => State.save('settings', { ...State.data.settings, showPercentages: e.target.checked });
        
        if(DOM.inputs.settings.colorblind) DOM.inputs.settings.colorblind.onchange = e => {
            const v = e.target.checked;
            State.save('settings', { ...State.data.settings, colorblindMode: v });
            Accessibility.apply(UIManager)
        };
        if(DOM.inputs.settings.largeText) DOM.inputs.settings.largeText.onchange = e => {
            const v = e.target.checked;
            State.save('settings', { ...State.data.settings, largeText: v });
            Accessibility.apply(UIManager)
        };
        if(DOM.inputs.settings.tilt) {
            DOM.inputs.settings.tilt.onchange = e => {
                State.save('settings', { ...State.data.settings, enableTilt: e.target.checked });
                import('./effects.js').then(m => m.TiltManager.refresh());
            };
        }
        if(DOM.inputs.settings.mirror) {
            DOM.inputs.settings.mirror.onchange = e => {
                State.save('settings', { ...State.data.settings, mirrorMode: e.target.checked });
                Accessibility.apply(UIManager);
            };
        }

        if(DOM.game.buttons.custom) {
            DOM.game.buttons.custom.onclick = () => {
                if(DOM.inputs.newWord) DOM.inputs.newWord.value = '';
                if(DOM.inputs.modalMsg) DOM.inputs.modalMsg.textContent = '';
                this.toggle('submission', true)
            };
        }
        if(document.getElementById('cancelSubmitButton')) document.getElementById('cancelSubmitButton').onclick = () => this.toggle('submission', false);
        
        if(DOM.rankings.btnShow) {
            DOM.rankings.btnShow.onclick = () => {
                UIManager.renderFullRankings();
                this.toggle('fullRankings', true)
            };
        }
        if(document.getElementById('closeFullRankingsModal')) document.getElementById('closeFullRankingsModal').onclick = () => this.toggle('fullRankings', false);
        
        if(document.getElementById('compareWordsButton')) {
            document.getElementById('compareWordsButton').onclick = () => {
                if(DOM.inputs.wordOne) DOM.inputs.wordOne.value = '';
                if(DOM.inputs.wordTwo) DOM.inputs.wordTwo.value = '';
                if(DOM.inputs.compareResults) DOM.inputs.compareResults.innerHTML = 'Type words above to see who wins!';
                this.toggle('compare', true)
            };
        }
        if(document.getElementById('closeCompareModal')) document.getElementById('closeCompareModal').onclick = () => this.toggle('compare', false);
        
        if(DOM.game.wordDisplay) DOM.game.wordDisplay.onclick = () => Game.showDefinition();
        if(document.getElementById('closeDefinitionModal')) document.getElementById('closeDefinitionModal').onclick = () => this.toggle('definition', false);
        
        if(DOM.rankings.searchBtn) DOM.rankings.searchBtn.onclick = () => UIManager.handleRankSearch();
        if(DOM.rankings.clearSearch) {
            DOM.rankings.clearSearch.onclick = () => {
                DOM.rankings.searchInput.value = '';
                DOM.rankings.searchContainer.classList.add('hidden');
                DOM.rankings.listsContainer.classList.remove('hidden')
            };
        }
        
        if(DOM.header.userStatsBar) DOM.header.userStatsBar.onclick = () => UIManager.openProfile();
        if(document.getElementById('closeProfileModal')) document.getElementById('closeProfileModal').onclick = () => this.toggle('profile', false);
        
        if(document.getElementById('saveUsernameBtn')) {
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
        }
        
        if(document.getElementById('shareProfileButton')) document.getElementById('shareProfileButton').onclick = () => ShareManager.share();
        
        if(DOM.daily.closeBtn) {
            DOM.daily.closeBtn.onclick = () => {
                this.toggle('dailyResult', false);
                Game.disableDailyMode()
            };
        }

        if(DOM.profile.photoInput) {
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
        }

        // Click outside to close modals
        Object.keys(DOM.modals).forEach(k => {
            const modal = DOM.modals[k];
            if(modal) {
                modal.addEventListener('click', e => {
                    if (e.target === modal) this.toggle(k, false)
                })
            }
        })
    }
};
