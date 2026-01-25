/**
 * ============================================================================
 * GOOD WORD / BAD WORD - MODULE LOADER & DOCUMENTATION
 * ============================================================================
 * 
 * This file documents the modular architecture and provides the loader
 * that assembles all modules in the correct order.
 * 
 * ============================================================================
 * MODULE STRUCTURE OVERVIEW
 * ============================================================================
 * 
 * The game is split into 6 logical modules, each with clear responsibilities:
 * 
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  01-core.js (~600 lines)                                                │
 * │  Foundation layer - required by all other modules                       │
 * │  ├── CONFIG: Global constants, API URLs, theme secrets                  │
 * │  ├── ContentFilter: Profanity detection with l33tspeak support          │
 * │  ├── DOM: Cached element references (lazy loaded)                       │
 * │  ├── State: Application state + localStorage persistence                │
 * │  ├── DataManager: Import/export backup functionality                    │
 * │  ├── Utils: Debounce, formatNumber, shuffle utilities                   │
 * │  ├── Haptics: Mobile vibration feedback                                 │
 * │  └── Accessibility: Screen reader announcements                         │
 * └─────────────────────────────────────────────────────────────────────────┘
 *                                    │
 *                                    ▼
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  02-weather.js (~500 lines)                                             │
 * │  Real-time weather integration with realistic rain                      │
 * │  ├── RealisticRain: Canvas-based rain with physics                      │
 * │  │   ├── Variable drop sizes (depth illusion)                           │
 * │  │   ├── Wind from real weather API                                     │
 * │  │   ├── Splash particles on impact                                     │
 * │  │   ├── Lightning during thunderstorms                                 │
 * │  │   └── Smooth transitions between weather states                      │
 * │  └── WeatherManager: Open-Meteo API integration                         │
 * │      ├── Fetches wind speed, direction, precipitation                   │
 * │      ├── Maps weather codes to rain intensity profiles                  │
 * │      └── Auto-refreshes every 15 minutes                                │
 * └─────────────────────────────────────────────────────────────────────────┘
 *                                    │
 *                                    ▼
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  03-api.js (~400 lines)                                                 │
 * │  Backend communication layer                                            │
 * │  ├── API: Fetch wrapper with error handling                             │
 * │  │   ├── fetchWords: Get word list (with offline fallback)              │
 * │  │   ├── submitVote: Send vote to server                                │
 * │  │   ├── submitWord: Suggest new words                                  │
 * │  │   ├── getDefinition: Dictionary API integration                      │
 * │  │   └── submitScore: Minigame leaderboard                              │
 * │  └── OfflineManager: Service worker + vote queue                        │
 * │      ├── Queues votes when offline                                      │
 * │      ├── Syncs when connection restored                                 │
 * │      └── Caches words for offline play                                  │
 * └─────────────────────────────────────────────────────────────────────────┘
 *                                    │
 *                                    ▼
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  04-effects.js (~2500 lines)                                            │
 * │  Theme effects and interactive elements                                 │
 * │  ├── ThemeManager: Theme switching + secret word detection              │
 * │  ├── Effects: Visual effects for each theme                             │
 * │  │   ├── Snow (winter theme)                                            │
 * │  │   ├── Fire particles                                                 │
 * │  │   ├── Bubbles (submarine)                                            │
 * │  │   ├── Space (stars, planets, shooting stars)                         │
 * │  │   ├── Ocean (waves, fish, boats)                                     │
 * │  │   ├── Flight (cockpit with working instruments)                      │
 * │  │   ├── Woodland (falling leaves, animals)                             │
 * │  │   └── Ballpit (physics-based balls)                                  │
 * │  ├── MosquitoManager: Buzzing insect easter egg                         │
 * │  ├── Spider: Web-dwelling predator for mosquito                         │
 * │  └── SnowmanBuilder: Collectible snowman parts                          │
 * └─────────────────────────────────────────────────────────────────────────┘
 *                                    │
 *                                    ▼
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  05-ui.js (~2000 lines)                                                 │
 * │  User interface management                                              │
 * │  ├── UIManager: Core UI updates                                         │
 * │  │   ├── showWord: Display current word                                 │
 * │  │   ├── updateStats: Refresh vote counts, rankings                     │
 * │  │   ├── showPostVoteMessage: Toast notifications                       │
 * │  │   └── animateVote: Card flip/swipe animations                        │
 * │  ├── ModalManager: Modal dialogs                                        │
 * │  │   ├── Settings modal                                                 │
 * │  │   ├── Profile modal                                                  │
 * │  │   ├── Rankings modal                                                 │
 * │  │   └── Definition modal                                               │
 * │  ├── InputHandler: Touch/mouse/keyboard input                           │
 * │  │   ├── Swipe gesture detection                                        │
 * │  │   ├── Button press handling                                          │
 * │  │   └── Keyboard shortcuts                                             │
 * │  ├── TipManager: Helpful tips system                                    │
 * │  └── DiscoveryManager: Feature unlock notifications                     │
 * └─────────────────────────────────────────────────────────────────────────┘
 *                                    │
 *                                    ▼
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  06-game.js (~2500 lines)                                               │
 * │  Core game logic and multiplayer                                        │
 * │  ├── Game: Main game controller                                         │
 * │  │   ├── init: Bootstrap application                                    │
 * │  │   ├── loadWords: Fetch and prepare word list                         │
 * │  │   ├── nextWord: Advance to next word                                 │
 * │  │   ├── vote: Process user vote                                        │
 * │  │   └── handleStreak: Streak detection and rewards                     │
 * │  ├── StreakManager: Streak tracking + notifications                     │
 * │  ├── LocalPeerManager: WebRTC local multiplayer                         │
 * │  │   ├── Peer discovery via BroadcastChannel                            │
 * │  │   ├── Real-time vote sync                                            │
 * │  │   └── Cursor sharing                                                 │
 * │  └── RoomManager: Online room multiplayer                               │
 * │      ├── WebSocket connection                                           │
 * │      ├── Room creation/joining                                          │
 * │      └── Vote broadcasting                                              │
 * └─────────────────────────────────────────────────────────────────────────┘
 *                                    │
 *                                    ▼
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  07-minigames.js (~1500 lines) [LAZY LOADED]                            │
 * │  Arcade minigames - only loaded when arcade is opened                   │
 * │  ├── MiniGames.wordWar: Fast-paced word voting                          │
 * │  ├── MiniGames.definitionDash: Match words to definitions               │
 * │  ├── MiniGames.wordJump: Platformer spelling game                       │
 * │  └── Arcade cabinet UI and score management                             │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * ============================================================================
 * DEPENDENCY GRAPH
 * ============================================================================
 * 
 *   01-core.js (no dependencies)
 *        │
 *        ├──► 02-weather.js (needs: State, CONFIG)
 *        │
 *        ├──► 03-api.js (needs: State, CONFIG)
 *        │
 *        └──► 04-effects.js (needs: State, CONFIG, DOM)
 *                  │
 *                  └──► 05-ui.js (needs: State, DOM, Effects, API)
 *                            │
 *                            └──► 06-game.js (needs: everything above)
 *                                      │
 *                                      └──► 07-minigames.js (lazy, needs: Game)
 * 
 * ============================================================================
 * LOADING STRATEGY
 * ============================================================================
 * 
 * 1. CRITICAL PATH (blocking):
 *    - 01-core.js: Must load first
 *    - 02-weather.js: Needed early for weather check
 *    - 03-api.js: Needed to fetch words
 * 
 * 2. DEFERRED (non-blocking):
 *    - 04-effects.js: Can load while words are fetched
 *    - 05-ui.js: Needed before game starts
 *    - 06-game.js: Starts the game
 * 
 * 3. LAZY (on-demand):
 *    - 07-minigames.js: Only when arcade button clicked
 * 
 * ============================================================================
 */

(function() {
'use strict';

/**
 * Module Loader
 * Handles loading modules in correct order with dependency tracking
 */
const ModuleLoader = {
    loaded: new Set(),
    loading: new Map(),
    
    /**
     * Load a module script
     * @param {string} path - Path to module file
     * @returns {Promise} Resolves when loaded
     */
    load(path) {
        // Already loaded
        if (this.loaded.has(path)) {
            return Promise.resolve();
        }
        
        // Currently loading
        if (this.loading.has(path)) {
            return this.loading.get(path);
        }
        
        // Start loading
        const promise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = path;
            script.async = false;
            
            script.onload = () => {
                this.loaded.add(path);
                this.loading.delete(path);
                console.log(`[Loader] Loaded: ${path}`);
                resolve();
            };
            
            script.onerror = () => {
                this.loading.delete(path);
                console.error(`[Loader] Failed: ${path}`);
                reject(new Error(`Failed to load ${path}`));
            };
            
            document.head.appendChild(script);
        });
        
        this.loading.set(path, promise);
        return promise;
    },
    
    /**
     * Load multiple modules in sequence
     * @param {string[]} paths - Array of module paths
     * @returns {Promise} Resolves when all loaded
     */
    async loadSequence(paths) {
        for (const path of paths) {
            await this.load(path);
        }
    },
    
    /**
     * Load multiple modules in parallel
     * @param {string[]} paths - Array of module paths
     * @returns {Promise} Resolves when all loaded
     */
    loadParallel(paths) {
        return Promise.all(paths.map(p => this.load(p)));
    }
};

/**
 * Bootstrap the application
 */
async function bootstrap() {
    const BASE = '/js/modules/';
    
    console.log('%c[Bootstrap] Starting...', 'color: #8b5cf6; font-weight: bold');
    const startTime = performance.now();
    
    try {
        // Phase 1: Core (blocking)
        await ModuleLoader.load(BASE + '01-core.js');
        
        // Phase 2: API + Weather (parallel, both needed early)
        await ModuleLoader.loadParallel([
            BASE + '02-weather.js',
            BASE + '03-api.js'
        ]);
        
        // Phase 3: Effects + UI (parallel)
        await ModuleLoader.loadParallel([
            BASE + '04-effects.js',
            BASE + '05-ui.js'
        ]);
        
        // Phase 4: Game logic
        await ModuleLoader.load(BASE + '06-game.js');
        
        const loadTime = (performance.now() - startTime).toFixed(0);
        console.log(`%c[Bootstrap] Complete in ${loadTime}ms`, 'color: #22c55e; font-weight: bold');
        
        // Initialize the game
        if (window.Game) {
            window.Game.init();
        }
        
    } catch (err) {
        console.error('[Bootstrap] Failed:', err);
        // Show error to user
        document.body.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;font-family:system-ui;">
                <h1>Failed to load game</h1>
                <p>${err.message}</p>
                <button onclick="location.reload()">Retry</button>
            </div>
        `;
    }
}

/**
 * Lazy load minigames module when needed
 */
window.loadMinigames = async function() {
    if (window.MiniGames) return; // Already loaded
    
    await ModuleLoader.load('/js/modules/07-minigames.js');
    console.log('[Loader] Minigames loaded on demand');
};

// Export for debugging
window.ModuleLoader = ModuleLoader;

// Start bootstrap when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
} else {
    bootstrap();
}

})();
