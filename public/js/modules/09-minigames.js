/**
 * ============================================================================
 * GOOD WORD / BAD WORD - MINIGAMES MODULE (09-minigames.js)
 * ============================================================================
 * 
 * Contains:
 * - MiniGames: Arcade games
 *   - Word War: Speed voting
 *   - Definition Dash: Word matching
 *   - Word Jump: Platformer spelling
 * - High score system
 * 
 * LAZY LOADED - Not included in initial page load
 * Load with: await window.loadMinigames()
 * 
 * Dependencies: All previous modules
 * ============================================================================
 */

(function() {
'use strict';

const MiniGames = {
    // ==================== SHARED SCORING HELPER ====================
    scoreHelper: {
        // Prompt user for initials and save score
        promptAndSave(gameId, score, options = {}) {
            const {
                title = 'HIGH SCORE!',
                subtitle = '',
                bgGradient = 'from-indigo-600 to-purple-700',
                borderColor = 'border-yellow-400',
                inputBorderColor = 'border-purple-300',
                buttonTextColor = 'text-purple-900',
                localStorageKey = null,
                stateKey = null,
                cabinetIndex = 0,
                onComplete = null
            } = options;
            
            const html = `
                <div id="mgScoreEntry" class="fixed inset-0 bg-black/90 z-[10002] flex items-start justify-center p-4 pt-16 sm:items-center sm:pt-4 overflow-y-auto">
                    <div class="bg-gradient-to-br ${bgGradient} p-6 sm:p-8 rounded-2xl text-center max-w-sm w-full shadow-2xl border-4 ${borderColor} mb-4">
                        <div class="text-4xl mb-2">🏆</div>
                        <h2 class="text-2xl font-black text-white mb-1">${title}</h2>
                        <p class="text-white/80 mb-2">${subtitle}</p>
                        <p class="text-4xl font-black text-yellow-400 mb-4">${score}</p>
                        <p class="text-white/70 text-sm mb-2">Enter your initials:</p>
                        <input type="text" id="mgNameInput" maxlength="3" placeholder="AAA"
                            class="text-3xl text-center w-full tracking-widest border-4 ${inputBorderColor} rounded-xl p-3 uppercase font-black mb-4 bg-white/90">
                        <button id="mgSaveScore" class="w-full py-3 bg-yellow-400 hover:bg-yellow-300 ${buttonTextColor} font-black text-lg rounded-xl transition">
                            SAVE SCORE
                        </button>
                    </div>
                </div>`;
            
            document.body.insertAdjacentHTML('beforeend', html);
            
            const input = document.getElementById('mgNameInput');
            const defaultInitials = (State.data.username || 'AAA').substring(0, 3).toUpperCase();
            input.value = defaultInitials;
            input.focus();
            input.select();
            
            // Only allow letters
            input.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase();
            });
            
            const saveScore = () => {
                const name = (input.value || 'AAA').toUpperCase().padEnd(3, 'A').substring(0, 3);
                
                // Save to local storage
                if (localStorageKey) {
                    localStorage.setItem(localStorageKey, score);
                }
                
                // Save to State
                if (stateKey) {
                    const scores = State.data[stateKey] || [];
                    scores.push({ name, score, date: new Date().toISOString() });
                    scores.sort((a, b) => b.score - a.score);
                    State.save(stateKey, scores.slice(0, 10));
                }
                
                // Submit to global leaderboard
                API.submitMiniGameScore(gameId, name, score);
                
                // Remove entry modal
                document.getElementById('mgScoreEntry').remove();
                
                // Callback or return to arcade
                if (onComplete) {
                    onComplete();
                } else {
                    // Return to arcade on appropriate cabinet
                    setTimeout(() => {
                        if (typeof StreakManager !== 'undefined' && StreakManager.showLeaderboard) {
                            StreakManager.showLeaderboard(cabinetIndex);
                        }
                    }, 100);
                }
            };
            
            document.getElementById('mgSaveScore').onclick = saveScore;
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') saveScore();
            });
        },
        
        // Check if score qualifies for high score entry
        qualifiesForHighScore(score, stateKey, minScore = 1) {
            if (score < minScore) return false;
            const scores = State.data[stateKey] || [];
            if (scores.length < 10) return true;
            const lowestScore = scores[scores.length - 1].score;
            return score > lowestScore;
        },
        
        // Get best score from state
        getBestScore(stateKey) {
            const scores = State.data[stateKey] || [];
            return scores.length > 0 ? scores[0].score : 0;
        }
    },
    
    // ==================== WORD WAR (Higher or Lower) ====================
    wordWar: {
        active: false,
        streak: 0,
        bestStreak: 0,
        wordA: null,
        wordB: null,
        
        start() {
            this.active = true;
            this.streak = 0;
            this.bestStreak = MiniGames.scoreHelper.getBestScore('wordWarScores');
            this.showRound();
        },
        
        getRandomWord() {
            const words = State.runtime.allWords.filter(w => (w.goodVotes + w.badVotes) >= 5);
            if (words.length < 10) return State.runtime.allWords[Math.floor(Math.random() * State.runtime.allWords.length)];
            return words[Math.floor(Math.random() * words.length)];
        },
        
        getScore(word) {
            return (word.goodVotes || 0) - (word.badVotes || 0);
        },
        
        getApproval(word) {
            const total = (word.goodVotes || 0) + (word.badVotes || 0);
            if (total === 0) return 50;
            return Math.round(((word.goodVotes || 0) / total) * 100);
        },
        
        showRound() {
            // Get two different words
            this.wordA = this.getRandomWord();
            do {
                this.wordB = this.getRandomWord();
            } while (this.wordB._id === this.wordA._id);
            
            const scoreA = this.getScore(this.wordA);
            const approvalA = this.getApproval(this.wordA);
            const approvalB = this.getApproval(this.wordB);
            
            const html = `
                <div id="wordWarModal" class="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 z-[10000] flex items-center justify-center p-4">
                    <div class="w-full max-w-2xl">
                        <div class="text-center mb-6">
                            <h2 class="text-3xl font-black text-white mb-2">⚔️ WORD WAR ⚔️</h2>
                            <p class="text-purple-200">Which word has a HIGHER approval rating?</p>
                            <div class="flex justify-center gap-6 mt-3">
                                <div class="text-yellow-400 font-bold">🔥 Streak: ${this.streak}</div>
                                <div class="text-purple-300 font-bold">👑 Best: ${this.bestStreak}</div>
                            </div>
                        </div>
                        
                        <div class="flex flex-col md:flex-row gap-4 items-stretch">
                            <!-- Word A (Score Revealed) -->
                            <div class="flex-1 bg-white/10 backdrop-blur rounded-2xl p-6 text-center border-2 border-white/20">
                                <div class="text-sm text-purple-300 mb-2 font-bold">REVEALED</div>
                                <h3 class="text-2xl md:text-3xl font-black text-white mb-4">${this.wordA.text.toUpperCase()}</h3>
                                <div class="text-5xl font-black ${scoreA >= 0 ? 'text-green-400' : 'text-red-400'} mb-2">${approvalA}%</div>
                                <div class="text-purple-300 text-sm">Approval Rating</div>
                            </div>
                            
                            <div class="flex items-center justify-center text-4xl font-black text-white/50">VS</div>
                            
                            <!-- Word B (Score Hidden) -->
                            <div class="flex-1 bg-white/10 backdrop-blur rounded-2xl p-6 text-center border-2 border-yellow-400/50">
                                <div class="text-sm text-yellow-400 mb-2 font-bold">MYSTERY</div>
                                <h3 class="text-2xl md:text-3xl font-black text-white mb-4">${this.wordB.text.toUpperCase()}</h3>
                                <div class="text-5xl font-black text-yellow-400 mb-2">?%</div>
                                <div class="text-purple-300 text-sm">Guess if Higher or Lower!</div>
                            </div>
                        </div>
                        
                        <div class="flex gap-4 mt-6 justify-center">
                            <button id="wwHigher" class="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-black text-xl rounded-xl transition transform hover:scale-105 shadow-lg">
                                📈 HIGHER
                            </button>
                            <button id="wwLower" class="px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-black text-xl rounded-xl transition transform hover:scale-105 shadow-lg">
                                📉 LOWER
                            </button>
                        </div>
                        
                        <button id="wwClose" class="mt-6 w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition">
                            ✕ Exit Game
                        </button>
                    </div>
                </div>`;
            
            // Remove existing modal if any
            const existing = document.getElementById('wordWarModal');
            if (existing) existing.remove();
            
            document.body.insertAdjacentHTML('beforeend', html);
            
            document.getElementById('wwHigher').onclick = () => this.guess('higher');
            document.getElementById('wwLower').onclick = () => this.guess('lower');
            document.getElementById('wwClose').onclick = () => this.close();
        },
        
        guess(choice) {
            const approvalA = this.getApproval(this.wordA);
            const approvalB = this.getApproval(this.wordB);
            
            const isHigher = approvalB > approvalA;
            const isEqual = approvalB === approvalA;
            const correct = isEqual || (choice === 'higher' && isHigher) || (choice === 'lower' && !isHigher);
            
            if (correct) {
                this.streak++;
                if (this.streak > this.bestStreak) {
                    this.bestStreak = this.streak;
                    localStorage.setItem('wordWarBest', this.bestStreak);
                }
                this.showResult(true, approvalB);
            } else {
                this.showResult(false, approvalB);
            }
        },
        
        showResult(correct, actualScore) {
            const modal = document.getElementById('wordWarModal');
            if (!modal) return;
            
            const resultHtml = `
                <div class="fixed inset-0 bg-black/80 z-[10001] flex items-center justify-center p-4" id="wwResult">
                    <div class="bg-white rounded-2xl p-8 text-center max-w-md w-full transform animate-bounce-in">
                        <div class="text-6xl mb-4">${correct ? '🎉' : '💥'}</div>
                        <h3 class="text-2xl font-black ${correct ? 'text-green-600' : 'text-red-600'} mb-2">
                            ${correct ? 'CORRECT!' : 'WRONG!'}
                        </h3>
                        <p class="text-gray-600 mb-4">
                            <strong>${this.wordB.text.toUpperCase()}</strong> has <strong>${actualScore}%</strong> approval
                        </p>
                        ${correct ? `
                            <p class="text-indigo-600 font-bold mb-4">🔥 Streak: ${this.streak}</p>
                            <button id="wwNext" class="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition">
                                Next Round →
                            </button>
                        ` : `
                            <p class="text-gray-600 mb-4">Final Streak: <strong class="text-indigo-600">${this.streak}</strong></p>
                            <div class="flex gap-3 justify-center">
                                <button id="wwRestart" class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition">
                                    🔄 Play Again
                                </button>
                                <button id="wwExit" class="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition">
                                    Exit
                                </button>
                            </div>
                        `}
                    </div>
                </div>`;
            
            document.body.insertAdjacentHTML('beforeend', resultHtml);
            
            if (correct) {
                document.getElementById('wwNext').onclick = () => {
                    document.getElementById('wwResult').remove();
                    this.showRound();
                };
            } else {
                // Check if this qualifies for high score (min 3 streak)
                if (MiniGames.scoreHelper.qualifiesForHighScore(this.streak, 'wordWarScores', 3)) {
                    const existingResult = document.getElementById('wwResult');
                    if (existingResult) existingResult.remove();
                    
                    MiniGames.scoreHelper.promptAndSave('wordwar', this.streak, {
                        title: 'HIGH SCORE!',
                        subtitle: 'Word War Streak',
                        bgGradient: 'from-indigo-600 to-purple-700',
                        borderColor: 'border-yellow-400',
                        inputBorderColor: 'border-purple-300',
                        buttonTextColor: 'text-purple-900',
                        stateKey: 'wordWarScores',
                        cabinetIndex: 1, // Word War cabinet
                        onComplete: () => this.close()
                    });
                }
                
                const restartBtn = document.getElementById('wwRestart');
                const exitBtn = document.getElementById('wwExit');
                if (restartBtn) {
                    restartBtn.onclick = () => {
                        document.getElementById('wwResult').remove();
                        this.streak = 0;
                        this.showRound();
                    };
                }
                if (exitBtn) {
                    exitBtn.onclick = () => this.close();
                }
            }
        },
        
        close() {
            this.active = false;
            const modal = document.getElementById('wordWarModal');
            const result = document.getElementById('wwResult');
            const entry = document.getElementById('mgScoreEntry');
            if (modal) modal.remove();
            if (result) result.remove();
            if (entry) entry.remove();
            
            // Return to Word War cabinet
            setTimeout(() => {
                if (typeof StreakManager !== 'undefined' && StreakManager.showLeaderboard) {
                    StreakManager.showLeaderboard(1);
                }
            }, 100);
        }
    },
    
    // ==================== DEFINITION DASH (Trivia) ====================
    definitionDash: {
        active: false,
        score: 0,
        round: 0,
        maxRounds: 10,
        timer: null,
        timeLeft: 10,
        correctWord: null,
        options: [],
        
        start() {
            this.active = true;
            this.score = 0;
            this.round = 0;
            this.showIntro();
        },
        
        showIntro() {
            const html = `
                <div id="defDashModal" class="fixed inset-0 bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 z-[10000] flex items-center justify-center p-4">
                    <div class="text-center max-w-md">
                        <div class="text-6xl mb-4">📚</div>
                        <h2 class="text-3xl font-black text-white mb-4">DEFINITION DASH</h2>
                        <p class="text-teal-200 mb-6">Read the definition, guess the word!<br>You have <strong>10 seconds</strong> per round.</p>
                        <div class="bg-white/10 rounded-xl p-4 mb-6">
                            <p class="text-white font-bold">${this.maxRounds} Rounds</p>
                            <p class="text-teal-300 text-sm">Score points for correct answers</p>
                        </div>
                        <button id="ddStart" class="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xl rounded-xl transition transform hover:scale-105 shadow-lg">
                            🚀 START GAME
                        </button>
                        <button id="ddClose" class="mt-4 block w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition">
                            ✕ Cancel
                        </button>
                    </div>
                </div>`;
            
            document.body.insertAdjacentHTML('beforeend', html);
            document.getElementById('ddStart').onclick = () => this.nextRound();
            document.getElementById('ddClose').onclick = () => this.close();
        },
        
        async nextRound() {
            this.round++;
            if (this.round > this.maxRounds) {
                this.showFinalScore();
                return;
            }
            
            // Find a word with a definition
            const modal = document.getElementById('defDashModal');
            if (modal) {
                modal.innerHTML = `
                    <div class="text-center">
                        <div class="text-4xl animate-spin mb-4">📚</div>
                        <p class="text-white font-bold">Finding a word with definition...</p>
                    </div>`;
            }
            
            let definition = null;
            let attempts = 0;
            const maxAttempts = 25;
            
            while (!definition && attempts < maxAttempts) {
                attempts++;
                const randomWord = State.runtime.allWords[Math.floor(Math.random() * State.runtime.allWords.length)];
                
                // First try the dictionary API
                try {
                    const r = await API.define(randomWord.text);
                    if (r.ok) {
                        const j = await r.json();
                        if (j[0] && j[0].meanings && j[0].meanings[0] && j[0].meanings[0].definitions[0]) {
                            this.correctWord = randomWord;
                            definition = j[0].meanings[0].definitions[0].definition;
                        }
                    }
                } catch (e) {
                    // Dictionary API failed, try community definition
                }
                
                // If no dictionary definition, try community definition
                if (!definition && randomWord._id) {
                    try {
                        const communityDef = await API.getCommunityDefinition(randomWord._id);
                        if (communityDef && communityDef.definition) {
                            this.correctWord = randomWord;
                            definition = communityDef.definition;
                        }
                    } catch (e) {
                        // No community definition either, try next word
                    }
                }
            }
            
            if (!definition) {
                UIManager.showPostVoteMessage("Could not find definitions. Try again!");
                this.close();
                return;
            }
            
            // Get 3 random wrong answers
            this.options = [this.correctWord];
            while (this.options.length < 4) {
                const randWord = State.runtime.allWords[Math.floor(Math.random() * State.runtime.allWords.length)];
                if (!this.options.find(o => o._id === randWord._id)) {
                    this.options.push(randWord);
                }
            }
            
            // Shuffle options
            for (let i = this.options.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.options[i], this.options[j]] = [this.options[j], this.options[i]];
            }
            
            this.showQuestion(definition);
        },
        
        showQuestion(definition) {
            this.timeLeft = 10;
            
            const html = `
                <div id="defDashModal" class="fixed inset-0 bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 z-[10000] flex items-center justify-center p-4">
                    <div class="w-full max-w-lg">
                        <div class="flex justify-between items-center mb-4">
                            <div class="text-white font-bold">Round ${this.round}/${this.maxRounds}</div>
                            <div class="text-yellow-400 font-bold">Score: ${this.score}</div>
                        </div>
                        
                        <!-- Timer Bar -->
                        <div class="w-full bg-white/20 rounded-full h-3 mb-6 overflow-hidden">
                            <div id="ddTimerBar" class="bg-emerald-400 h-full rounded-full transition-all duration-1000" style="width: 100%"></div>
                        </div>
                        
                        <div class="bg-white/10 backdrop-blur rounded-2xl p-6 mb-6">
                            <div class="text-sm text-teal-300 mb-2 font-bold">📖 DEFINITION:</div>
                            <p class="text-white text-lg leading-relaxed">${definition}</p>
                        </div>
                        
                        <div class="text-center text-teal-300 mb-4 font-bold">Which word matches this definition?</div>
                        
                        <div class="grid grid-cols-2 gap-3">
                            ${this.options.map((opt, i) => `
                                <button class="dd-option px-4 py-4 bg-white/10 hover:bg-white/20 border-2 border-white/30 hover:border-emerald-400 text-white font-bold text-lg rounded-xl transition transform hover:scale-102" data-index="${i}">
                                    ${opt.text.toUpperCase()}
                                </button>
                            `).join('')}
                        </div>
                        
                        <div class="mt-4 text-center">
                            <span id="ddTimeDisplay" class="text-2xl font-black text-yellow-400">10.0s</span>
                        </div>
                    </div>
                </div>`;
            
            const existing = document.getElementById('defDashModal');
            if (existing) existing.remove();
            
            document.body.insertAdjacentHTML('beforeend', html);
            
            // Bind option clicks
            document.querySelectorAll('.dd-option').forEach(btn => {
                btn.onclick = () => {
                    const index = parseInt(btn.dataset.index);
                    this.checkAnswer(index);
                };
            });
            
            // Start timer
            this.startTimer();
        },
        
        startTimer() {
            if (this.timer) clearInterval(this.timer);
            this.timeLeft = 100; // 10 seconds in 0.1s increments (100 = 10.0s)
            
            this.timer = setInterval(() => {
                this.timeLeft--;
                
                const display = document.getElementById('ddTimeDisplay');
                const bar = document.getElementById('ddTimerBar');
                
                const displaySeconds = (this.timeLeft / 10).toFixed(1);
                if (display) display.textContent = displaySeconds + 's';
                if (bar) bar.style.width = (this.timeLeft) + '%';
                
                if (this.timeLeft <= 30) { // 3 seconds
                    if (display) display.classList.add('text-red-400');
                    if (bar) bar.classList.replace('bg-emerald-400', 'bg-red-400');
                }
                
                if (this.timeLeft <= 0) {
                    clearInterval(this.timer);
                    this.checkAnswer(-1); // Time's up
                }
            }, 100); // Run every 0.1 seconds
        },
        
        checkAnswer(selectedIndex) {
            if (this.timer) clearInterval(this.timer);
            
            const correct = selectedIndex >= 0 && this.options[selectedIndex]._id === this.correctWord._id;
            const correctIndex = this.options.findIndex(o => o._id === this.correctWord._id);
            
            // Score based on 0.1 second increments - gives whole number score
            const pointsEarned = correct ? Math.max(10, this.timeLeft) : 0;
            if (correct) {
                this.score += pointsEarned;
            }
            
            // Highlight answers
            document.querySelectorAll('.dd-option').forEach((btn, i) => {
                btn.disabled = true;
                if (i === correctIndex) {
                    btn.classList.remove('bg-white/10', 'border-white/30');
                    btn.classList.add('bg-green-500', 'border-green-400');
                } else if (i === selectedIndex) {
                    btn.classList.remove('bg-white/10', 'border-white/30');
                    btn.classList.add('bg-red-500', 'border-red-400');
                }
            });
            
            // Show result message
            const modal = document.getElementById('defDashModal');
            if (modal) {
                const resultDiv = document.createElement('div');
                resultDiv.className = 'mt-4 text-center';
                resultDiv.innerHTML = correct 
                    ? `<div class="text-green-400 font-black text-xl">✓ Correct! +${pointsEarned} points</div>`
                    : `<div class="text-red-400 font-black text-xl">${selectedIndex === -1 ? '⏰ Time\'s Up!' : '✗ Wrong!'}</div>`;
                modal.querySelector('.max-w-lg').appendChild(resultDiv);
            }
            
            // Next round after delay
            setTimeout(() => this.nextRound(), 2000);
        },
        
        showFinalScore() {
            const bestScore = MiniGames.scoreHelper.getBestScore('defDashScores');
            const isNewBest = this.score > bestScore;
            const qualifiesForHighScore = MiniGames.scoreHelper.qualifiesForHighScore(this.score, 'defDashScores', 50);
            
            const html = `
                <div id="defDashModal" class="fixed inset-0 bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 z-[10000] flex items-center justify-center p-4">
                    <div class="text-center max-w-md bg-white/10 backdrop-blur rounded-2xl p-8">
                        <div class="text-6xl mb-4">${isNewBest ? '🏆' : '📚'}</div>
                        <h2 class="text-3xl font-black text-white mb-2">GAME OVER!</h2>
                        ${isNewBest ? '<div class="text-yellow-400 font-bold mb-4">🎉 NEW HIGH SCORE! 🎉</div>' : ''}
                        <div class="text-5xl font-black text-emerald-400 mb-4">${this.score}</div>
                        <p class="text-teal-200 mb-6">points scored</p>
                        <div class="text-teal-300 mb-6">Best Score: ${Math.max(this.score, bestScore)}</div>
                        <div class="flex gap-3 justify-center">
                            <button id="ddRestart" class="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition">
                                🔄 Play Again
                            </button>
                            <button id="ddExit" class="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl transition">
                                Exit
                            </button>
                        </div>
                    </div>
                </div>`;
            
            const existing = document.getElementById('defDashModal');
            if (existing) existing.remove();
            
            document.body.insertAdjacentHTML('beforeend', html);
            
            // Check for high score entry
            if (qualifiesForHighScore) {
                setTimeout(() => {
                    const gameModal = document.getElementById('defDashModal');
                    if (gameModal) gameModal.remove();
                    
                    MiniGames.scoreHelper.promptAndSave('defdash', this.score, {
                        title: 'HIGH SCORE!',
                        subtitle: 'Definition Dash',
                        bgGradient: 'from-emerald-600 to-teal-700',
                        borderColor: 'border-yellow-400',
                        inputBorderColor: 'border-teal-300',
                        buttonTextColor: 'text-teal-900',
                        stateKey: 'defDashScores',
                        cabinetIndex: 2, // Definition Dash cabinet
                        onComplete: () => this.close()
                    });
                }, 500);
            }
            
            document.getElementById('ddRestart').onclick = () => {
                this.score = 0;
                this.round = 0;
                this.nextRound();
            };
            document.getElementById('ddExit').onclick = () => this.close();
        },
        
        close() {
            this.active = false;
            if (this.timer) clearInterval(this.timer);
            const modal = document.getElementById('defDashModal');
            const entry = document.getElementById('mgScoreEntry');
            if (modal) modal.remove();
            if (entry) entry.remove();
            
            // Return to Definition Dash cabinet
            setTimeout(() => {
                if (typeof StreakManager !== 'undefined' && StreakManager.showLeaderboard) {
                    StreakManager.showLeaderboard(2);
                }
            }, 100);
        }
    },
    
    // Show mini-games menu
    showMenu() {
        const wwScores = State.data.wordWarScores || [];
        const ddScores = State.data.defDashScores || [];
        const wwBest = wwScores.length > 0 ? wwScores[0].score : 0;
        const ddBest = ddScores.length > 0 ? ddScores[0].score : 0;
        
        const html = `
            <div id="miniGamesMenu" class="fixed inset-0 bg-black/90 z-[10000] flex items-center justify-center p-4 backdrop-blur">
                <div class="w-full max-w-md">
                    <h2 class="text-3xl font-black text-white text-center mb-6">🎮 MINI GAMES</h2>
                    
                    <div class="space-y-4">
                        <button id="startWordWar" class="w-full p-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-2xl text-left transition transform hover:scale-102 shadow-lg">
                            <div class="flex items-center gap-4">
                                <span class="text-4xl">⚔️</span>
                                <div>
                                    <h3 class="text-xl font-black text-white">Word War</h3>
                                    <p class="text-purple-200 text-sm">Higher or Lower? Guess which word has better approval!</p>
                                    <p class="text-yellow-400 text-xs mt-1 font-bold">Best Streak: ${wwBest}</p>
                                </div>
                            </div>
                        </button>
                        
                        <button id="startDefDash" class="w-full p-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-2xl text-left transition transform hover:scale-102 shadow-lg">
                            <div class="flex items-center gap-4">
                                <span class="text-4xl">📚</span>
                                <div>
                                    <h3 class="text-xl font-black text-white">Definition Dash</h3>
                                    <p class="text-teal-200 text-sm">Read the definition, guess the word! 10 seconds per round.</p>
                                    <p class="text-yellow-400 text-xs mt-1 font-bold">High Score: ${ddBest}</p>
                                </div>
                            </div>
                        </button>
                        
                        <button id="startWordJump" class="w-full p-6 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 rounded-2xl text-left transition transform hover:scale-102 shadow-lg">
                            <div class="flex items-center gap-4">
                                <span class="text-4xl">🦘</span>
                                <div>
                                    <h3 class="text-xl font-black text-white">Word Jump</h3>
                                    <p class="text-cyan-200 text-sm">Endless runner! Jump over bad words, collect good ones!</p>
                                    <p class="text-yellow-400 text-xs mt-1 font-bold">High Score: ${this.wordJump.bestScore || 0}</p>
                                </div>
                            </div>
                        </button>
                        
                        <button id="viewArcadeScores" class="w-full p-5 bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-500 hover:to-orange-500 rounded-2xl transition transform hover:scale-102 shadow-lg border-2 border-yellow-400/50">
                            <div class="flex items-center justify-center gap-3">
                                <span class="text-3xl">🕹️</span>
                                <div class="text-left">
                                    <span class="text-white font-black text-lg">ENTER THE ARCADE</span>
                                    <p class="text-orange-200 text-xs">View global leaderboards & high scores</p>
                                </div>
                                <span class="text-3xl">🏆</span>
                            </div>
                        </button>
                    </div>
                    
                    <button id="closeMiniGames" class="mt-6 w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition">
                        ✕ Close
                    </button>
                </div>
            </div>`;
        
        document.body.insertAdjacentHTML('beforeend', html);
        
        document.getElementById('startWordWar').onclick = () => {
            document.getElementById('miniGamesMenu').remove();
            this.wordWar.start();
        };
        document.getElementById('startDefDash').onclick = () => {
            document.getElementById('miniGamesMenu').remove();
            this.definitionDash.start();
        };
        document.getElementById('startWordJump').onclick = () => {
            document.getElementById('miniGamesMenu').remove();
            this.wordJump.start();
        };
        document.getElementById('viewArcadeScores').onclick = () => {
            document.getElementById('miniGamesMenu').remove();
            StreakManager.showLeaderboard();
        };
        document.getElementById('closeMiniGames').onclick = () => {
            document.getElementById('miniGamesMenu').remove();
        };
    },
    
    // ==================== WORD JUMP (Endless Runner) ====================
    wordJump: {
        active: false,
        score: 0,
        bestScore: 0,
        gameLoop: null,
        canvas: null,
        ctx: null,
        player: null,
        obstacles: [],
        collectibles: [],
        wordData: [],
        groundY: 0,
        gravity: 0.6,
        jumpForce: -12,
        gameSpeed: 5,
        frameCount: 0,
        isGameOver: false,
        pendingRestart: false,
        
        start() {
            this.active = true;
            this.isGameOver = false;
            this.pendingRestart = false;
            this.score = 0;
            this.bestScore = MiniGames.scoreHelper.getBestScore('wordJumpScores');
            this.gameSpeed = 5;
            this.frameCount = 0;
            this.obstacles = [];
            this.collectibles = [];
            this.prepareWordData();
            this.showGame();
        },
        
        prepareWordData() {
            // Get words and separate into real words and "not words"
            const source = State.runtime.allWords || [];
            this.wordData = [];
            
            // Get real words (words with 0 or 1 notWordVotes)
            const realWords = source.filter(w => (w.notWordVotes || 0) <= 1);
            // Get fake words (words with more than 1 notWordVotes) - these are collectible!
            const fakeWords = source.filter(w => (w.notWordVotes || 0) > 1);
            
            // Store for obstacle generation
            this.realWords = realWords.length > 0 ? realWords : [{ text: 'WORD' }, { text: 'JUMP' }, { text: 'GAME' }];
            this.fakeWords = fakeWords.length > 0 ? fakeWords : [];
        },
        
        showGame() {
            const html = `
                <div id="wordJumpModal" class="fixed inset-0 bg-gradient-to-b from-sky-400 via-sky-300 to-green-400 z-[10000] flex flex-col items-center justify-center p-4">
                    <div class="text-center mb-4">
                        <div class="flex justify-center gap-8 text-white font-bold text-lg">
                            <div>Score: <span id="wjScore">0</span></div>
                            <div>Best: <span id="wjBest">${this.bestScore}</span></div>
                        </div>
                    </div>
                    <canvas id="wordJumpCanvas" class="rounded-xl shadow-2xl border-4 border-white/50" style="max-width: 100%; touch-action: none;"></canvas>
                    <div class="mt-4 text-white/80 text-sm font-bold">TAP BELOW or SPACE to jump! Collect <span class="text-yellow-300">NOT A WORDs</span> for +5 points!</div>
                    <button id="wjClose" class="mt-4 px-6 py-2 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl transition">
                        ✕ Exit Game
                    </button>
                </div>`;
            
            document.body.insertAdjacentHTML('beforeend', html);
            
            this.canvas = document.getElementById('wordJumpCanvas');
            this.ctx = this.canvas.getContext('2d');
            
            // Set canvas size
            const maxW = Math.min(800, window.innerWidth - 32);
            const maxH = Math.min(300, window.innerHeight - 200);
            this.canvas.width = maxW;
            this.canvas.height = maxH;
            this.groundY = this.canvas.height - 40;
            
            // Initialize player
            this.player = {
                x: 80,
                y: this.groundY,
                width: 40,
                height: 50,
                vy: 0,
                isJumping: false,
                color: '#4f46e5'
            };
            
            // Event listeners
            this.jumpHandler = (e) => {
                if (e) e.preventDefault();
                
                if (this.isGameOver) {
                    // Restart game on tap after game over
                    this.restartGame();
                    return;
                }
                
                if (!this.player.isJumping && this.active) {
                    this.player.vy = this.jumpForce;
                    this.player.isJumping = true;
                }
            };
            
            this.canvas.onclick = this.jumpHandler;
            this.canvas.ontouchstart = this.jumpHandler;
            
            // Add touch support for bottom half of the screen (excluding buttons)
            const modal = document.getElementById('wordJumpModal');
            this.bottomHalfTouchHandler = (e) => {
                // Ignore if touching a button or interactive element
                if (e.target.closest('button')) return;
                
                // Only trigger if touch is in the bottom half of the screen
                const touch = e.touches ? e.touches[0] : e;
                const screenHeight = window.innerHeight;
                const canvasRect = this.canvas.getBoundingClientRect();
                
                // Check if touch is below the canvas top and not on the exit button area
                // Exit button is at the bottom, so exclude the bottom 80px
                if (touch.clientY > canvasRect.top && touch.clientY < (screenHeight - 80)) {
                    e.preventDefault();
                    this.jumpHandler(e);
                }
            };
            modal.addEventListener('touchstart', this.bottomHalfTouchHandler, { passive: false });
            
            this.keyHandler = (e) => {
                if (e.code === 'Space' || e.code === 'ArrowUp') {
                    e.preventDefault();
                    this.jumpHandler();
                }
            };
            window.addEventListener('keydown', this.keyHandler);
            
            document.getElementById('wjClose').onclick = () => this.close();
            
            // Start game loop
            this.gameLoop = requestAnimationFrame(() => this.update());
        },
        
        update() {
            if (!this.active || this.isGameOver) return;
            
            this.frameCount++;
            
            // Increase speed over time
            if (this.frameCount % 500 === 0) {
                this.gameSpeed = Math.min(15, this.gameSpeed + 0.5);
            }
            
            // Spawn obstacles (real words - must jump over)
            const spawnRate = Math.max(40, Math.floor(100 - this.gameSpeed * 3));
            if (this.frameCount % spawnRate === 0) {
                const wordObj = this.realWords[Math.floor(Math.random() * this.realWords.length)];
                let word = (wordObj.text || 'WORD').toUpperCase();
                
                // Limit word length to 8 characters max for jumpability
                if (word.length > 8) {
                    word = word.substring(0, 8);
                }
                
                this.obstacles.push({
                    x: this.canvas.width,
                    y: this.groundY,
                    width: this.ctx.measureText(word).width + 20 || word.length * 14,
                    height: 35,
                    text: word,
                    color: '#ef4444',
                    wordLength: word.length
                });
            }
            
            // Spawn collectibles (fake words - collect for bonus!)
            if (this.fakeWords.length > 0 && this.frameCount % (spawnRate * 3) === 0 && Math.random() > 0.5) {
                const wordObj = this.fakeWords[Math.floor(Math.random() * this.fakeWords.length)];
                let word = (wordObj.text || 'FAKE').toUpperCase();
                
                // Limit collectible word length too
                if (word.length > 10) {
                    word = word.substring(0, 10);
                }
                
                // Spawn in the air so player must jump to collect
                this.collectibles.push({
                    x: this.canvas.width,
                    y: this.groundY - 80 - Math.random() * 40,
                    width: word.length * 12 + 16,
                    height: 28,
                    text: word,
                    collected: false
                });
            }
            
            // Update player physics with extended jump for long words
            // Check if there's a long word approaching
            let extendJump = false;
            for (const obs of this.obstacles) {
                const distanceToObs = obs.x - this.player.x;
                // If a long word is approaching and player is jumping, reduce gravity
                if (obs.wordLength >= 6 && distanceToObs > 0 && distanceToObs < 200 && this.player.isJumping && this.player.vy < 0) {
                    extendJump = true;
                    break;
                }
            }
            
            // Apply reduced gravity for extended jumps over long words
            const currentGravity = extendJump ? this.gravity * 0.6 : this.gravity;
            this.player.vy += currentGravity;
            this.player.y += this.player.vy;
            
            if (this.player.y >= this.groundY) {
                this.player.y = this.groundY;
                this.player.vy = 0;
                this.player.isJumping = false;
            }
            
            // Update obstacles
            for (let i = this.obstacles.length - 1; i >= 0; i--) {
                this.obstacles[i].x -= this.gameSpeed;
                
                // Remove off-screen obstacles and score
                if (this.obstacles[i].x + this.obstacles[i].width < 0) {
                    this.obstacles.splice(i, 1);
                    this.score++;
                    document.getElementById('wjScore').textContent = this.score;
                    continue;
                }
                
                // Collision detection with obstacles
                if (this.checkCollision(this.player, this.obstacles[i])) {
                    this.gameOver();
                    return;
                }
            }
            
            // Update collectibles
            for (let i = this.collectibles.length - 1; i >= 0; i--) {
                this.collectibles[i].x -= this.gameSpeed;
                
                // Remove off-screen collectibles
                if (this.collectibles[i].x + this.collectibles[i].width < 0) {
                    this.collectibles.splice(i, 1);
                    continue;
                }
                
                // Check if player collects it
                if (!this.collectibles[i].collected && this.checkCollision(this.player, this.collectibles[i])) {
                    this.collectibles[i].collected = true;
                    this.score += 5; // Bonus points!
                    document.getElementById('wjScore').textContent = this.score;
                    // Show +5 animation
                    this.showBonusText(this.collectibles[i].x, this.collectibles[i].y);
                    this.collectibles.splice(i, 1);
                }
            }
            
            // Draw
            this.draw();
            
            this.gameLoop = requestAnimationFrame(() => this.update());
        },
        
        bonusTexts: [],
        
        showBonusText(x, y) {
            this.bonusTexts.push({ x, y, alpha: 1, vy: -2 });
        },
        
        checkCollision(player, obstacle) {
            const px = player.x;
            const py = player.y - player.height;
            const pw = player.width;
            const ph = player.height;
            
            const ox = obstacle.x;
            const oy = obstacle.y - obstacle.height;
            const ow = obstacle.width;
            const oh = obstacle.height;
            
            return px < ox + ow && px + pw > ox && py < oy + oh && py + ph > oy;
        },
        
        draw() {
            const ctx = this.ctx;
            const w = this.canvas.width;
            const h = this.canvas.height;
            
            // Clear and draw background
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(0, 0, w, h);
            
            // Draw clouds
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            for (let i = 0; i < 5; i++) {
                const cx = ((this.frameCount * 0.5 + i * 180) % (w + 100)) - 50;
                const cy = 30 + i * 20;
                ctx.beginPath();
                ctx.arc(cx, cy, 25, 0, Math.PI * 2);
                ctx.arc(cx + 25, cy - 10, 20, 0, Math.PI * 2);
                ctx.arc(cx + 50, cy, 25, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Draw ground
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(0, this.groundY, w, h - this.groundY);
            ctx.fillStyle = '#166534';
            ctx.fillRect(0, this.groundY, w, 4);
            
            // Draw player (simple character)
            const p = this.player;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y - p.height, p.width, p.height);
            
            // Player face
            ctx.fillStyle = '#fff';
            ctx.fillRect(p.x + 25, p.y - p.height + 12, 8, 8); // Eye
            ctx.fillStyle = '#000';
            ctx.fillRect(p.x + 27, p.y - p.height + 14, 4, 4); // Pupil
            ctx.fillStyle = '#fff';
            ctx.fillRect(p.x + 10, p.y - p.height + 30, 20, 4); // Mouth
            
            // Draw obstacles (real words - just text, no box)
            ctx.font = 'bold 24px sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'bottom';
            this.obstacles.forEach(obs => {
                // Draw shadow
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.fillText(obs.text, obs.x + 2, obs.y + 2);
                // Draw text
                ctx.fillStyle = obs.color;
                ctx.fillText(obs.text, obs.x, obs.y);
            });
            
            // Draw collectibles (fake words - golden, in the air)
            this.collectibles.forEach(col => {
                // Glowing golden background
                ctx.fillStyle = 'rgba(251, 191, 36, 0.3)';
                ctx.fillRect(col.x - 4, col.y - col.height - 4, col.width + 8, col.height + 8);
                
                ctx.fillStyle = '#fbbf24';
                ctx.fillRect(col.x, col.y - col.height, col.width, col.height);
                
                // Sparkle effect
                ctx.fillStyle = 'rgba(255,255,255,0.8)';
                const sparkleX = col.x + (this.frameCount % 20) * (col.width / 20);
                ctx.fillRect(sparkleX, col.y - col.height + 2, 4, 4);
                
                // Text
                ctx.fillStyle = '#78350f';
                ctx.font = 'bold 14px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(col.text, col.x + col.width / 2, col.y - col.height / 2);
            });
            
            // Draw bonus texts
            ctx.font = 'bold 20px sans-serif';
            ctx.textAlign = 'center';
            for (let i = this.bonusTexts.length - 1; i >= 0; i--) {
                const bt = this.bonusTexts[i];
                bt.y += bt.vy;
                bt.alpha -= 0.02;
                
                if (bt.alpha <= 0) {
                    this.bonusTexts.splice(i, 1);
                    continue;
                }
                
                ctx.fillStyle = `rgba(251, 191, 36, ${bt.alpha})`;
                ctx.fillText('+5', bt.x, bt.y);
            }
        },
        
        gameOver() {
            this.active = false;
            this.isGameOver = true;
            cancelAnimationFrame(this.gameLoop);
            
            // Check if this qualifies for high score (any score > 0)
            const qualifies = MiniGames.scoreHelper.qualifiesForHighScore(this.score, 'wordJumpScores', 1);
            
            if (qualifies && this.score > 0) {
                // Close game modal and show shared initials prompt
                const gameModal = document.getElementById('wordJumpModal');
                if (gameModal) gameModal.remove();
                if (this.keyHandler) window.removeEventListener('keydown', this.keyHandler);
                
                MiniGames.scoreHelper.promptAndSave('wordjump', this.score, {
                    title: 'HIGH SCORE!',
                    subtitle: 'Word Jump',
                    bgGradient: 'from-sky-500 to-blue-600',
                    borderColor: 'border-yellow-400',
                    inputBorderColor: 'border-sky-300',
                    buttonTextColor: 'text-sky-900',
                    localStorageKey: 'wordJumpBest',
                    stateKey: 'wordJumpScores',
                    cabinetIndex: 3 // Word Jump cabinet
                });
            } else {
                // Just show game over screen
                this.showGameOverScreen(false);
            }
        },
        
        showGameOverScreen(wasNewBest) {
            const ctx = this.ctx;
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 36px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 40);
            
            ctx.font = 'bold 24px sans-serif';
            ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
            
            if (wasNewBest) {
                ctx.fillStyle = '#fbbf24';
                ctx.font = 'bold 20px sans-serif';
                ctx.fillText('🏆 NEW BEST! 🏆', this.canvas.width / 2, this.canvas.height / 2 + 35);
            }
            
            ctx.fillStyle = '#fff';
            ctx.font = '18px sans-serif';
            ctx.fillText('Tap to play again', this.canvas.width / 2, this.canvas.height / 2 + 70);
            
            // Update best display
            const bestEl = document.getElementById('wjBest');
            if (bestEl) bestEl.textContent = this.bestScore;
        },
        
        restartGame() {
            if (this.pendingRestart) return;
            this.pendingRestart = true;
            
            // Reset state
            this.active = true;
            this.isGameOver = false;
            this.score = 0;
            this.gameSpeed = 5;
            this.frameCount = 0;
            this.obstacles = [];
            this.collectibles = [];
            this.bonusTexts = [];
            
            // Reset player
            this.player.y = this.groundY;
            this.player.vy = 0;
            this.player.isJumping = false;
            
            // Update score display
            document.getElementById('wjScore').textContent = '0';
            
            this.pendingRestart = false;
            
            // Restart game loop
            this.gameLoop = requestAnimationFrame(() => this.update());
        },
        
        close() {
            this.active = false;
            this.isGameOver = false;
            if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
            if (this.keyHandler) window.removeEventListener('keydown', this.keyHandler);
            const modal = document.getElementById('wordJumpModal');
            if (modal) {
                if (this.bottomHalfTouchHandler) {
                    modal.removeEventListener('touchstart', this.bottomHalfTouchHandler);
                }
                modal.remove();
            }
            
            // Return to arcade on Word Jump cabinet (index 3)
            setTimeout(() => {
                if (typeof StreakManager !== 'undefined' && StreakManager.showLeaderboard) {
                    StreakManager.showLeaderboard(3);
                }
            }, 100);
        }
    }
};

// ============================================================================
// EXPORTS
// ============================================================================
window.MiniGames = MiniGames;

console.log('%c[MiniGames] Module loaded (lazy)', 'color: #a855f7; font-weight: bold');

})();
