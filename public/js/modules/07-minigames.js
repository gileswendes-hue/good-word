/**
 * ============================================================================
 * GOOD WORD / BAD WORD - MINIGAMES MODULE (LAZY LOADED)
 * ============================================================================
 * 
 * This module contains the arcade minigames:
 * - Word War: Speed voting challenge
 * - Definition Dash: Match words to definitions
 * - Word Jump: Platformer spelling game
 * 
 * This module is NOT loaded on page load - it's only loaded when the
 * user clicks the Arcade button, saving ~1500 lines from initial load.
 * 
 * Dependencies: All core modules must be loaded first
 * Loaded: On-demand when user opens arcade
 * ============================================================================
 */

(function() {
'use strict';

// ============================================================================
// MINIGAMES - Arcade Game Collection
// ============================================================================
const MiniGames = {
    currentGame: null,
    
    /**
     * Show the arcade game selection screen
     */
    showArcade() {
        const existing = document.getElementById('arcade-modal');
        if (existing) { existing.remove(); return; }
        
        const modal = document.createElement('div');
        modal.id = 'arcade-modal';
        modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm';
        modal.innerHTML = `
            <div class="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-6 max-w-md w-full mx-4 shadow-2xl border border-white/10">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-black text-white flex items-center gap-2">
                        <span class="text-3xl">🕹️</span> ARCADE
                    </h2>
                    <button onclick="document.getElementById('arcade-modal').remove()" 
                        class="text-white/50 hover:text-white text-2xl">✕</button>
                </div>
                
                <div class="space-y-3">
                    <button onclick="MiniGames.startGame('wordWar')" 
                        class="w-full p-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl text-white text-left hover:scale-[1.02] transition-transform">
                        <div class="text-xl font-black">⚔️ Word War</div>
                        <div class="text-sm opacity-80">Vote as fast as you can! 60 seconds.</div>
                    </button>
                    
                    <button onclick="MiniGames.startGame('definitionDash')" 
                        class="w-full p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white text-left hover:scale-[1.02] transition-transform">
                        <div class="text-xl font-black">📖 Definition Dash</div>
                        <div class="text-sm opacity-80">Match words to their meanings!</div>
                    </button>
                    
                    <button onclick="MiniGames.startGame('wordJump')" 
                        class="w-full p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white text-left hover:scale-[1.02] transition-transform">
                        <div class="text-xl font-black">🦘 Word Jump</div>
                        <div class="text-sm opacity-80">Spell words by jumping on letters!</div>
                    </button>
                </div>
                
                <div class="mt-6 pt-4 border-t border-white/10">
                    <h3 class="text-sm font-bold text-white/60 mb-2">🏆 Your High Scores</h3>
                    <div class="grid grid-cols-3 gap-2 text-center text-white">
                        <div class="bg-white/10 rounded-lg p-2">
                            <div class="text-xs opacity-60">Word War</div>
                            <div class="font-bold">${this.getHighScore('wordWar')}</div>
                        </div>
                        <div class="bg-white/10 rounded-lg p-2">
                            <div class="text-xs opacity-60">Def Dash</div>
                            <div class="font-bold">${this.getHighScore('definitionDash')}</div>
                        </div>
                        <div class="bg-white/10 rounded-lg p-2">
                            <div class="text-xs opacity-60">Word Jump</div>
                            <div class="font-bold">${this.getHighScore('wordJump')}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    },
    
    /**
     * Get high score for a game
     */
    getHighScore(game) {
        const scores = State.data[`${game}Scores`] || State.data.highScores || [];
        if (game === 'wordWar') {
            return Math.max(0, ...(State.data.highScores || []).map(s => s.score || 0));
        }
        return Math.max(0, ...scores.map(s => s.score || 0));
    },
    
    /**
     * Start a specific game
     */
    startGame(game) {
        document.getElementById('arcade-modal')?.remove();
        this.currentGame = game;
        
        switch (game) {
            case 'wordWar':
                this.wordWar.start();
                break;
            case 'definitionDash':
                this.definitionDash.start();
                break;
            case 'wordJump':
                this.wordJump.start();
                break;
        }
    },
    
    /**
     * Show game over screen
     */
    showGameOver(game, score) {
        const highScore = this.getHighScore(game);
        const isNewRecord = score > highScore;
        
        if (isNewRecord) {
            this.saveScore(game, score);
        }
        
        const modal = document.createElement('div');
        modal.id = 'gameover-modal';
        modal.className = 'fixed inset-0 z-[10000] flex items-center justify-center bg-black/80';
        modal.innerHTML = `
            <div class="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 text-center">
                <div class="text-6xl mb-4">${isNewRecord ? '🏆' : '🎮'}</div>
                <h2 class="text-3xl font-black text-gray-800 mb-2">
                    ${isNewRecord ? 'NEW RECORD!' : 'GAME OVER'}
                </h2>
                <div class="text-5xl font-black text-indigo-600 mb-4">${score}</div>
                ${isNewRecord ? '<p class="text-green-600 font-bold mb-4">You beat your high score!</p>' : ''}
                <p class="text-gray-500 mb-6">High Score: ${Math.max(score, highScore)}</p>
                <div class="flex gap-3">
                    <button onclick="document.getElementById('gameover-modal').remove(); MiniGames.startGame('${game}')"
                        class="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl">Play Again</button>
                    <button onclick="document.getElementById('gameover-modal').remove(); MiniGames.showArcade()"
                        class="flex-1 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl">Menu</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Play sound
        if (isNewRecord && window.SoundManager) {
            SoundManager.playUnlock();
        }
        
        // Confetti for new record
        if (isNewRecord && window.UIManager) {
            UIManager.triggerConfetti();
        }
    },
    
    /**
     * Save a score
     */
    saveScore(game, score) {
        const key = game === 'wordWar' ? 'highScores' : `${game}Scores`;
        const scores = State.data[key] || [];
        
        scores.push({
            score: score,
            date: new Date().toISOString(),
            username: State.data.username || 'Anonymous'
        });
        
        // Keep top 10
        scores.sort((a, b) => b.score - a.score);
        scores.splice(10);
        
        State.save(key, scores);
        
        // Submit to API
        if (window.API) {
            API.submitScore(game, score, State.data.username).catch(() => {});
        }
    },
    
    // ========================================================================
    // WORD WAR - Speed Voting Game
    // ========================================================================
    wordWar: {
        score: 0,
        timeLeft: 60,
        timer: null,
        words: [],
        currentIndex: 0,
        container: null,
        
        start() {
            this.score = 0;
            this.timeLeft = 60;
            this.currentIndex = 0;
            this.words = Utils.shuffle([...State.runtime.fullWordList]).slice(0, 100);
            
            this.createUI();
            this.showWord();
            this.startTimer();
        },
        
        createUI() {
            this.container = document.createElement('div');
            this.container.id = 'wordwar-game';
            this.container.className = 'fixed inset-0 z-[9999] bg-gradient-to-br from-red-600 to-orange-600 flex flex-col items-center justify-center p-4';
            this.container.innerHTML = `
                <div class="absolute top-4 left-4 right-4 flex justify-between items-center text-white">
                    <div class="text-2xl font-black">⚔️ WORD WAR</div>
                    <div class="flex gap-4">
                        <div class="bg-white/20 px-4 py-2 rounded-full">
                            <span class="opacity-60">Score:</span>
                            <span id="ww-score" class="font-black">0</span>
                        </div>
                        <div class="bg-white/20 px-4 py-2 rounded-full">
                            <span class="opacity-60">Time:</span>
                            <span id="ww-time" class="font-black">60</span>
                        </div>
                    </div>
                </div>
                
                <div id="ww-word" class="text-5xl md:text-7xl font-black text-white text-center mb-8 drop-shadow-lg"></div>
                
                <div class="flex gap-4">
                    <button id="ww-good" class="px-12 py-6 bg-green-500 hover:bg-green-400 text-white text-2xl font-black rounded-2xl shadow-lg transform hover:scale-105 transition-transform">
                        👍 GOOD
                    </button>
                    <button id="ww-bad" class="px-12 py-6 bg-red-500 hover:bg-red-400 text-white text-2xl font-black rounded-2xl shadow-lg transform hover:scale-105 transition-transform">
                        BAD 👎
                    </button>
                </div>
                
                <button onclick="MiniGames.wordWar.end()" class="absolute bottom-4 text-white/50 hover:text-white">
                    ✕ Quit Game
                </button>
            `;
            document.body.appendChild(this.container);
            
            document.getElementById('ww-good').onclick = () => this.vote('good');
            document.getElementById('ww-bad').onclick = () => this.vote('bad');
            
            // Keyboard shortcuts
            this.keyHandler = (e) => {
                if (e.code === 'ArrowLeft') this.vote('good');
                if (e.code === 'ArrowRight') this.vote('bad');
            };
            document.addEventListener('keydown', this.keyHandler);
        },
        
        showWord() {
            if (this.currentIndex >= this.words.length) {
                this.words = Utils.shuffle(this.words);
                this.currentIndex = 0;
            }
            
            const word = this.words[this.currentIndex];
            document.getElementById('ww-word').textContent = word.text;
        },
        
        vote(type) {
            this.score++;
            document.getElementById('ww-score').textContent = this.score;
            
            // Visual feedback
            const wordEl = document.getElementById('ww-word');
            wordEl.style.transform = type === 'good' ? 'translateX(-20px)' : 'translateX(20px)';
            wordEl.style.opacity = '0';
            
            setTimeout(() => {
                this.currentIndex++;
                this.showWord();
                wordEl.style.transform = '';
                wordEl.style.opacity = '1';
            }, 100);
            
            // Sound
            if (window.SoundManager) SoundManager.playClick();
        },
        
        startTimer() {
            this.timer = setInterval(() => {
                this.timeLeft--;
                document.getElementById('ww-time').textContent = this.timeLeft;
                
                if (this.timeLeft <= 10) {
                    document.getElementById('ww-time').classList.add('text-yellow-300');
                }
                
                if (this.timeLeft <= 0) {
                    this.end();
                }
            }, 1000);
        },
        
        end() {
            clearInterval(this.timer);
            document.removeEventListener('keydown', this.keyHandler);
            this.container?.remove();
            MiniGames.showGameOver('wordWar', this.score);
        }
    },
    
    // ========================================================================
    // DEFINITION DASH - Word Matching Game
    // ========================================================================
    definitionDash: {
        score: 0,
        lives: 3,
        words: [],
        currentWord: null,
        container: null,
        
        async start() {
            this.score = 0;
            this.lives = 3;
            this.words = Utils.shuffle([...State.runtime.fullWordList])
                .filter(w => w.text.length > 3 && w.text.length < 12)
                .slice(0, 50);
            
            this.createUI();
            await this.nextRound();
        },
        
        createUI() {
            this.container = document.createElement('div');
            this.container.id = 'defdash-game';
            this.container.className = 'fixed inset-0 z-[9999] bg-gradient-to-br from-blue-600 to-cyan-600 flex flex-col items-center justify-center p-4';
            this.container.innerHTML = `
                <div class="absolute top-4 left-4 right-4 flex justify-between items-center text-white">
                    <div class="text-2xl font-black">📖 DEFINITION DASH</div>
                    <div class="flex gap-4">
                        <div class="bg-white/20 px-4 py-2 rounded-full">
                            <span class="opacity-60">Score:</span>
                            <span id="dd-score" class="font-black">0</span>
                        </div>
                        <div class="bg-white/20 px-4 py-2 rounded-full" id="dd-lives">
                            ❤️❤️❤️
                        </div>
                    </div>
                </div>
                
                <div id="dd-definition" class="text-xl md:text-2xl text-white text-center mb-8 max-w-lg px-4 italic"></div>
                
                <div id="dd-options" class="grid grid-cols-2 gap-3 w-full max-w-md"></div>
                
                <button onclick="MiniGames.definitionDash.end()" class="absolute bottom-4 text-white/50 hover:text-white">
                    ✕ Quit Game
                </button>
            `;
            document.body.appendChild(this.container);
        },
        
        async nextRound() {
            if (this.words.length < 4 || this.lives <= 0) {
                this.end();
                return;
            }
            
            // Pick a word and get its definition
            const correctWord = this.words.shift();
            this.currentWord = correctWord;
            
            // Try to get definition from API
            let definition = 'A word in the English language.';
            try {
                const data = await API.getDefinition(correctWord.text);
                if (Array.isArray(data) && data[0]?.meanings?.[0]?.definitions?.[0]?.definition) {
                    definition = data[0].meanings[0].definitions[0].definition;
                }
            } catch (e) {}
            
            document.getElementById('dd-definition').textContent = `"${definition}"`;
            
            // Create options (1 correct + 3 wrong)
            const options = [correctWord];
            const wrongWords = Utils.shuffle([...this.words]).slice(0, 3);
            options.push(...wrongWords);
            Utils.shuffle(options);
            
            const optionsEl = document.getElementById('dd-options');
            optionsEl.innerHTML = options.map(w => `
                <button class="dd-option p-4 bg-white/20 hover:bg-white/30 text-white text-lg font-bold rounded-xl transition-colors"
                    data-word="${w.text}">${w.text}</button>
            `).join('');
            
            optionsEl.querySelectorAll('.dd-option').forEach(btn => {
                btn.onclick = () => this.guess(btn.dataset.word);
            });
        },
        
        guess(word) {
            const isCorrect = word === this.currentWord.text;
            
            if (isCorrect) {
                this.score += 10;
                document.getElementById('dd-score').textContent = this.score;
                SoundManager?.playGood();
            } else {
                this.lives--;
                this.updateLives();
                SoundManager?.playBad();
                
                // Flash wrong answer
                document.querySelectorAll('.dd-option').forEach(btn => {
                    if (btn.dataset.word === this.currentWord.text) {
                        btn.classList.add('bg-green-500');
                    } else if (btn.dataset.word === word) {
                        btn.classList.add('bg-red-500');
                    }
                });
            }
            
            setTimeout(() => this.nextRound(), isCorrect ? 500 : 1500);
        },
        
        updateLives() {
            const hearts = '❤️'.repeat(this.lives) + '🖤'.repeat(3 - this.lives);
            document.getElementById('dd-lives').textContent = hearts;
        },
        
        end() {
            this.container?.remove();
            MiniGames.showGameOver('definitionDash', this.score);
        }
    },
    
    // ========================================================================
    // WORD JUMP - Platformer Spelling Game
    // ========================================================================
    wordJump: {
        canvas: null,
        ctx: null,
        score: 0,
        gameLoop: null,
        player: { x: 50, y: 200, vy: 0, onGround: false },
        platforms: [],
        targetWord: '',
        collectedLetters: '',
        container: null,
        
        start() {
            this.score = 0;
            this.collectedLetters = '';
            this.createUI();
            this.initGame();
            this.run();
        },
        
        createUI() {
            this.container = document.createElement('div');
            this.container.id = 'wordjump-game';
            this.container.className = 'fixed inset-0 z-[9999] bg-gradient-to-b from-green-400 to-green-600';
            this.container.innerHTML = `
                <div class="absolute top-4 left-4 right-4 flex justify-between items-center text-white z-10">
                    <div class="text-2xl font-black">🦘 WORD JUMP</div>
                    <div class="flex gap-4">
                        <div class="bg-white/20 px-4 py-2 rounded-full">
                            <span class="opacity-60">Score:</span>
                            <span id="wj-score" class="font-black">0</span>
                        </div>
                    </div>
                </div>
                
                <div class="absolute top-16 left-1/2 transform -translate-x-1/2 text-center z-10">
                    <div class="text-white/60 text-sm">Spell:</div>
                    <div id="wj-target" class="text-3xl font-black text-white"></div>
                    <div id="wj-collected" class="text-2xl font-bold text-yellow-300 mt-1"></div>
                </div>
                
                <canvas id="wj-canvas" class="w-full h-full"></canvas>
                
                <button onclick="MiniGames.wordJump.end()" class="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/50 hover:text-white z-10">
                    ✕ Quit Game
                </button>
            `;
            document.body.appendChild(this.container);
            
            this.canvas = document.getElementById('wj-canvas');
            this.ctx = this.canvas.getContext('2d');
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            
            // Touch/click to jump
            this.container.addEventListener('click', () => this.jump());
            this.container.addEventListener('touchstart', (e) => { e.preventDefault(); this.jump(); });
            
            // Keyboard
            this.keyHandler = (e) => { if (e.code === 'Space') this.jump(); };
            document.addEventListener('keydown', this.keyHandler);
        },
        
        initGame() {
            // Pick a word
            const words = State.runtime.fullWordList
                .filter(w => w.text.length >= 3 && w.text.length <= 6)
                .map(w => w.text);
            this.targetWord = words[Math.floor(Math.random() * words.length)] || 'WORD';
            this.collectedLetters = '';
            
            document.getElementById('wj-target').textContent = this.targetWord;
            document.getElementById('wj-collected').textContent = '_'.repeat(this.targetWord.length);
            
            // Reset player
            this.player = { x: 100, y: this.canvas.height - 150, vy: 0, onGround: false };
            
            // Create platforms with letters
            this.platforms = [];
            const letters = this.targetWord.split('');
            
            // Ground platform
            this.platforms.push({
                x: 0, y: this.canvas.height - 50,
                width: this.canvas.width * 3,
                height: 50, letter: null
            });
            
            // Letter platforms
            letters.forEach((letter, i) => {
                this.platforms.push({
                    x: 300 + i * 200,
                    y: this.canvas.height - 150 - Math.random() * 100,
                    width: 80,
                    height: 20,
                    letter: letter,
                    collected: false
                });
            });
        },
        
        jump() {
            if (this.player.onGround) {
                this.player.vy = -15;
                this.player.onGround = false;
                SoundManager?.playClick();
            }
        },
        
        update() {
            // Gravity
            this.player.vy += 0.5;
            this.player.y += this.player.vy;
            
            // Auto-move right
            this.player.x += 3;
            
            // Check platform collisions
            this.player.onGround = false;
            for (const plat of this.platforms) {
                if (this.player.x + 30 > plat.x && 
                    this.player.x < plat.x + plat.width &&
                    this.player.y + 40 > plat.y && 
                    this.player.y + 40 < plat.y + plat.height + 15 &&
                    this.player.vy > 0) {
                    
                    this.player.y = plat.y - 40;
                    this.player.vy = 0;
                    this.player.onGround = true;
                    
                    // Collect letter
                    if (plat.letter && !plat.collected) {
                        const nextNeeded = this.targetWord[this.collectedLetters.length];
                        if (plat.letter === nextNeeded) {
                            plat.collected = true;
                            this.collectedLetters += plat.letter;
                            this.score += 10;
                            document.getElementById('wj-score').textContent = this.score;
                            
                            const display = this.collectedLetters + '_'.repeat(this.targetWord.length - this.collectedLetters.length);
                            document.getElementById('wj-collected').textContent = display;
                            
                            SoundManager?.playGood();
                            
                            // Word complete?
                            if (this.collectedLetters === this.targetWord) {
                                this.score += 50;
                                document.getElementById('wj-score').textContent = this.score;
                                setTimeout(() => this.initGame(), 1000);
                            }
                        }
                    }
                }
            }
            
            // Fall off screen
            if (this.player.y > this.canvas.height + 100) {
                this.end();
            }
        },
        
        render() {
            const ctx = this.ctx;
            const cameraX = this.player.x - 150;
            
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw platforms
            for (const plat of this.platforms) {
                const screenX = plat.x - cameraX;
                
                if (screenX < -100 || screenX > this.canvas.width + 100) continue;
                
                ctx.fillStyle = plat.letter ? (plat.collected ? '#9ca3af' : '#fbbf24') : '#166534';
                ctx.fillRect(screenX, plat.y, plat.width, plat.height);
                
                if (plat.letter && !plat.collected) {
                    ctx.fillStyle = '#000';
                    ctx.font = 'bold 24px system-ui';
                    ctx.textAlign = 'center';
                    ctx.fillText(plat.letter, screenX + plat.width/2, plat.y - 5);
                }
            }
            
            // Draw player
            ctx.fillStyle = '#3b82f6';
            ctx.beginPath();
            ctx.arc(150, this.player.y + 20, 20, 0, Math.PI * 2);
            ctx.fill();
            
            // Eyes
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(155, this.player.y + 15, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(157, this.player.y + 15, 2, 0, Math.PI * 2);
            ctx.fill();
        },
        
        run() {
            this.update();
            this.render();
            this.gameLoop = requestAnimationFrame(() => this.run());
        },
        
        end() {
            cancelAnimationFrame(this.gameLoop);
            document.removeEventListener('keydown', this.keyHandler);
            this.container?.remove();
            MiniGames.showGameOver('wordJump', this.score);
        }
    }
};


// ============================================================================
// EXPORTS
// ============================================================================
window.MiniGames = MiniGames;

console.log('%c[MiniGames] Loaded (lazy)', 'color: #a855f7');

})();
