import { State } from '../state.js';
import { DOM } from '../dom.js';

export const Accessibility = {
    apply() {
        const s = State.data.settings;
        const b = document.body;
        
        // Toggle classes on Body
        b.classList.toggle('mode-colorblind', s.colorblindMode);
        b.classList.toggle('mode-large-text', s.largeText);
        
        // Handle Mirror Mode
        b.style.transform = s.mirrorMode ? 'scaleX(-1)' : '';
        b.style.overflowX = 'hidden'; 

        // Re-fit text if a word is currently displayed
        if (State.runtime.allWords.length > 0) {
            // We import UIManager lazily or access the DOM directly to avoid circular dependency
            const currentWord = State.runtime.allWords[State.runtime.currentWordIndex];
            if(currentWord) {
                // Dispatch a custom event so UI can pick it up, 
                // or just handle the text sizing logic if imported.
                // For simplicity here, we assume UIManager will call fitText itself 
                // or we rely on the CSS classes added above.
            }
        }
    },

    getColors() {
        const cb = State.data.settings.colorblindMode;
        return {
            good: cb ? '#3b82f6' : '#10b981', // Blue vs Green
            bad: cb ? '#f97316' : '#ef4444'   // Orange vs Red
        };
    }
};