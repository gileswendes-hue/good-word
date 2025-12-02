import { DOM } from '../dom.js';
import { State } from '../state.js';
import { SoundManager } from './audio.js';
import { UIManager } from './ui.js';
import { API } from '../api.js';
import { ShareManager } from '../utils/share.js'; // We create this next
import { Accessibility } from '../utils/accessibility.js';
import { Game } from '../game.js'; // Circular dependency handled via event binding usually, but import is fine here if Game is init

export const ModalManager = {
    toggle(id, show) {
        const e = DOM.modals[id];
        if (!e) return;
        e.classList.toggle('hidden', !show);
        e.classList.toggle('flex', show);
    },

    init() {
        // --- Settings Modal ---
        DOM.general.showSettingsBtn.onclick = () => {
            // Sync UI with State
            DOM.inputs.settings.tips.checked = State.data.settings.showTips;
            DOM.inputs.settings.percentages.checked = State.data.settings.showPercentages;
            DOM.inputs.settings.colorblind.checked = State.data.settings.colorblindMode;
            DOM.inputs.settings.largeText.checked = State.data.settings.largeText;
            
            if (DOM.inputs.settings.tilt) DOM.inputs.settings.tilt.checked = State.data.settings.enableTilt;
            if (DOM.inputs.settings.mirror) DOM.inputs.settings.mirror.checked = State.data.settings.mirrorMode;

            // Inject Mute Checkbox dynamically if missing
            if (!DOM.inputs.settings.mute) {
                const container = document.querySelector('#settingsModalContainer .space-y-4');
                if (container) {
                    const div = document.createElement('div');
                    div.className = "flex items-center justify-between";
                    div.innerHTML = `<label for="toggleMute" class="text-lg font-medium text-gray-700">Mute All Sounds</label><input type="checkbox" id="toggleMute" class="h-6 w-6 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">`;
                    container.appendChild(div);
                    DOM.inputs.settings.mute = document.getElementById('toggleMute');
                    
                    DOM.inputs.settings.mute.onchange = e => {
                        State.save('settings', { ...State.data.settings, muteSounds: e.target.checked });
                        SoundManager.updateMute();
                    };
                }
            }
            if (DOM.inputs.settings.mute) DOM.inputs.settings.mute.checked = State.data.settings.muteSounds;

            this.toggle('settings', true);
        };

        DOM.modals.closeSettings.onclick = () => this.toggle('settings', false);

        // Settings Toggles
        DOM.inputs.settings.tips.onchange = e => State.save('settings', { ...State.data.settings, showTips: e.target.checked });
        DOM.inputs.settings.percentages.onchange = e => State.save('settings', { ...State.data.settings, showPercentages: e.target.checked });
        
        DOM.inputs.settings.colorblind.onchange = e => {
            State.save('settings', { ...State.data.settings, colorblindMode: e.target.checked });
            Accessibility.apply();
        };
        
        DOM.inputs.settings.largeText.onchange = e => {
            State.save('settings', { ...State.data.settings, largeText: e.target.checked });
            Accessibility.apply();
        };

        if (DOM.inputs.settings.mirror) {
            DOM.inputs.settings.mirror.onchange = e => {
                State.save('settings', { ...State.data.settings, mirrorMode: e.target.checked });
                Accessibility.apply();
            };
        }

        // --- Submission Modal ---
        DOM.game.buttons.custom.onclick = () => {
            DOM.inputs.newWord.value = '';
            DOM.inputs.modalMsg.textContent = '';
            this.toggle('submission', true);
        };
        DOM.modals.cancelSubmit.onclick = () => this.toggle('submission', false);

        // --- Rankings Modal ---
        DOM.rankings.btnShow.onclick = () => {
            UIManager.renderFullRankings();
            this.toggle('fullRankings', true);
        };
        DOM.modals.closeFullRankings.onclick = () => this.toggle('fullRankings', false);

        // --- Compare Modal ---
        document.getElementById('compareWordsButton').onclick = () => {
            DOM.inputs.wordOne.value = '';
            DOM.inputs.wordTwo.value = '';
            DOM.inputs.compareResults.innerHTML = 'Type words above to see who wins!';
            this.toggle('compare', true);
        };
        DOM.modals.closeCompare.onclick = () => this.toggle('compare', false);

        // --- Definition Modal ---
        DOM.game.wordDisplay.onclick = () => Game.showDefinition(); // Assuming Game is global or imported
        DOM.modals.closeDefinition.onclick = () => this.toggle('definition', false);

        // --- Search in Rankings ---
        DOM.rankings.searchBtn.onclick = () => UIManager.handleRankSearch();
        DOM.rankings.clearSearch.onclick = () => {
            DOM.rankings.searchInput.value = '';
            DOM.rankings.searchContainer.classList.add('hidden');
            DOM.rankings.listsContainer.classList.remove('hidden');
        };

        // --- Profile Modal ---
        DOM.header.userStatsBar.onclick = () => UIManager.openProfile();
        DOM.modals.closeProfile.onclick = () => this.toggle('profile', false);
        
        DOM.profile.saveNameBtn.onclick = async () => {
            const n = DOM.inputs.username.value.trim();
            const m = DOM.profile.saveMsg;
            if (!n || n.includes(' ') || n.length > 45) {
                m.textContent = "Invalid name (no spaces).";
                m.className = "text-xs text-red-500 mt-1 font-bold";
                return;
            }
            State.save('username', n);
            UIManager.updateProfileDisplay();
            m.textContent = "Saved!";
            m.className = "text-xs text-green-500 mt-1 font-bold";
            
            // Auto-submit username as a word
            const exists = State.runtime.allWords.some(w => w.text.toUpperCase() === n.toUpperCase());
            if (!exists) {
                m.textContent = "Saved & submitted as new word!";
                try {
                    await API.submitWord(n);
                    State.incrementContributor();
                } catch { /* ignore */ }
            }
            setTimeout(() => m.textContent = '', 2000);
        };

        DOM.profile.shareBtn.onclick = () => ShareManager.share();

        // --- Daily Result ---
        DOM.daily.closeBtn.onclick = () => {
            this.toggle('dailyResult', false);
            Game.disableDailyMode();
        };

        // --- Profile Photo Upload ---
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

        // --- Close on Outside Click ---
        Object.keys(DOM.modals).forEach(k => {
            if (DOM.modals[k] instanceof HTMLElement) {
                DOM.modals[k].addEventListener('click', e => {
                    if (e.target === DOM.modals[k]) this.toggle(k, false);
                });
            }
        });
    }
};