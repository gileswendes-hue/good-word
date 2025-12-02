import { CONFIG } from './config.js';
import { State } from './state.js';
import { DOM } from './dom.js';
import { Game } from './game.js';
import { ThemeManager } from './managers/theme.js';
import { ModalManager } from './managers/modal.js';
import { InputHandler } from './utils/input.js';
import { MosquitoManager } from './effects/mosquito.js';

// Wait for DOM
window.onload = async () => {
    console.log(`Initializing Good Word / Bad Word v${CONFIG.APP_VERSION}`);

    // Init Logic
    ThemeManager.init();
    ModalManager.init();
    InputHandler.init();
    MosquitoManager.startMonitoring();
    
    // Start Game Loop
    await Game.init();
    
    // Bind specific clear button
    document.getElementById('clearAllDataButton').onclick = () => State.clearAll();
};