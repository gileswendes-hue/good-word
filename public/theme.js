import { CONFIG } from './config.js';
import { State } from './state.js';
import { DOM, UIManager } from './ui.js';
import { Effects, TiltManager } from './effects.js';
import { Accessibility } from './utils.js';

export const ThemeManager = {
    wordMap: {},
    init() {
        Object.entries(CONFIG.THEME_SECRETS).forEach(([k, v]) => {
            try { atob(v).split('|').forEach(w => this.wordMap[w] = k) } catch {}
        });
        this.populateChooser();
        this.apply(State.data.currentTheme)
    },
    populateChooser() {
        const u = State.data.unlockedThemes,
            a = [...new Set(u)].sort(),
            c = DOM.theme.chooser;
        c.innerHTML = '<option value="default">Default</option>';
        a.forEach(t => {
            const o = document.createElement('option');
            o.value = t;
            o.textContent = t === 'ballpit' ? 'Ball Pit' : t.charAt(0).toUpperCase() + t.slice(1);
            c.appendChild(o)
        });
        c.value = State.data.currentTheme
    },
    apply(t, m = false) {
        if (m) State.save('manualTheme', true);
        document.body.className = document.body.className.split(' ').filter(c => !c.startsWith('theme-')).join(' ');
        document.body.classList.add(`theme-${t}`);
        State.save('currentTheme', t);
        
        const e = DOM.theme.effects;
        e.snow.classList.toggle('hidden', t !== 'winter');
        e.bubble.classList.toggle('hidden', t !== 'submarine');
        e.fire.classList.toggle('hidden', t !== 'fire');
        e.summer.classList.toggle('hidden', t !== 'summer');
        e.plymouth.classList.toggle('hidden', t !== 'plymouth');
        e.ballpit.classList.toggle('hidden', t !== 'ballpit');
        e.space.classList.toggle('hidden', t !== 'space');
        
        if (t === 'winter') Effects.snow(); else e.snow.innerHTML = '';
        if (t === 'submarine') Effects.bubbles(true); else Effects.bubbles(false); 
        if (t === 'fire') Effects.fire(); else e.fire.innerHTML = '';
        if (t === 'summer') Effects.summer(); else e.summer.innerHTML = '';
        if (t === 'plymouth') Effects.plymouth(true); else { e.plymouth.innerHTML = ''; Effects.plymouth(false) }
        if (t === 'ballpit') Effects.ballpit(true); else Effects.ballpit(false);
        if (t === 'space') Effects.space(true); else Effects.space(false);
        Effects.halloween(t === 'halloween');
        
        const cards = document.querySelectorAll('.card, .ranking-card'), isR = t === 'rainbow';
        [DOM.game.card, ...cards].forEach(el => {
            if (!el) return;
            if (isR) { el.classList.add('thin-rainbow-frame'); el.classList.remove('card') } 
            else { el.classList.remove('thin-rainbow-frame'); el.classList.add('card') }
        });
        const d = document.getElementById('card-snow-drift');
        if (d) d.style.display = t !== 'winter' ? 'none' : 'block';
        if (State.runtime.allWords.length > 0) UIManager.displayWord(State.runtime.allWords[State.runtime.currentWordIndex]);
        Accessibility.apply(UIManager);
        TiltManager.refresh();
    },
    checkUnlock(w) {
        const t = this.wordMap[w];
        if (t && !State.data.unlockedThemes.includes(t)) {
            State.data.unlockedThemes.push(t);
            State.save('unlockedThemes', State.data.unlockedThemes);
            this.populateChooser();
            if (!State.data.manualTheme) this.apply(t);
            return true
        }
        return false
    }
};