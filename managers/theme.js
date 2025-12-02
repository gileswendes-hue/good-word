import { CONFIG } from '../config.js';
import { State } from '../state.js';
import { DOM } from '../dom.js';
import { Effects } from '../effects/visual.js'; // We will create this next
import { UIManager } from './ui.js';
import { Accessibility } from '../utils/accessibility.js';

export const ThemeManager = {
    wordMap: {},

    init() {
        // Decode secret words
        Object.entries(CONFIG.THEME_SECRETS).forEach(([k, v]) => {
            try {
                atob(v).split('|').forEach(w => this.wordMap[w] = k);
            } catch {}
        });
        
        this.populateChooser();
        this.apply(State.data.currentTheme);

        // Bind Chooser
        DOM.theme.chooser.onchange = e => this.apply(e.target.value, true);
    },

    populateChooser() {
        const u = State.data.unlockedThemes;
        const a = [...new Set(u)].sort();
        const c = DOM.theme.chooser;
        
        c.innerHTML = '<option value="default">Default</option>';
        a.forEach(t => {
            const o = document.createElement('option');
            o.value = t;
            o.textContent = t === 'ballpit' ? 'Ball Pit' : t.charAt(0).toUpperCase() + t.slice(1);
            c.appendChild(o);
        });
        c.value = State.data.currentTheme;
    },

    apply(t, manual = false) {
        if (manual) State.save('manualTheme', true);
        
        // Remove old theme classes
        document.body.className = document.body.className.split(' ')
            .filter(c => !c.startsWith('theme-'))
            .join(' ');
        
        // Add new theme class
        document.body.classList.add(`theme-${t}`);
        State.save('currentTheme', t);
        
        // Manage Effect DOM Visibility
        const e = DOM.theme.effects;
        Object.keys(e).forEach(k => {
            if(e[k]) e[k].classList.toggle('hidden', t !== (k === 'snow' ? 'winter' : k === 'bubble' ? 'submarine' : k));
        });

        // Trigger Effect Logic (Imported from Visual Effects)
        Effects.toggle('snow', t === 'winter');
        Effects.toggle('bubbles', t === 'submarine');
        Effects.toggle('fire', t === 'fire');
        Effects.toggle('summer', t === 'summer');
        Effects.toggle('plymouth', t === 'plymouth');
        Effects.toggle('ballpit', t === 'ballpit');
        Effects.toggle('space', t === 'space');
        Effects.toggle('halloween', t === 'halloween');
        
        // Handle Frame Styles (Rainbow)
        const cards = document.querySelectorAll('.card, .ranking-card');
        const isRainbow = t === 'rainbow';
        
        [DOM.game.card, ...cards].forEach(el => {
            if (!el) return;
            if (isRainbow) {
                el.classList.add('thin-rainbow-frame');
                el.classList.remove('card');
            } else {
                el.classList.remove('thin-rainbow-frame');
                el.classList.add('card');
            }
        });

        // Refresh Word Display
        if (State.runtime.allWords.length > 0) {
            UIManager.displayWord(State.runtime.allWords[State.runtime.currentWordIndex]);
        }
        
        Accessibility.apply();
        // TiltManager.refresh(); // If you implement Tilt later
    },

    checkUnlock(w) {
        const t = this.wordMap[w];
        if (t && !State.data.unlockedThemes.includes(t)) {
            State.data.unlockedThemes.push(t);
            State.save('unlockedThemes', State.data.unlockedThemes);
            this.populateChooser();
            
            if (!State.data.manualTheme) this.apply(t);
            return true; // Return true to indicate a new unlock occurred
        }
        return false;
    }
};