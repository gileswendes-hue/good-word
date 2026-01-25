/**
 * ============================================================================
 * GOOD WORD / BAD WORD - UI MODULE
 * ============================================================================
 * 
 * This module handles all user interface operations:
 * - UIManager: Core UI updates (word display, stats, messages)
 * - ModalManager: Modal dialog handling
 * - InputHandler: Touch, mouse, and keyboard input
 * - TipManager: Helpful tips system
 * - DiscoveryManager: Feature unlock notifications
 * - ShareManager: Social sharing functionality
 * 
 * Dependencies: 01-core.js, 03-api.js, 04-effects.js
 * Loaded: After effects module
 * ============================================================================
 */

(function() {
'use strict';

// ============================================================================
// UI MANAGER - Core Interface Operations
// ============================================================================
/**
 * Manages the main game interface including word display,
 * statistics, notifications, and animations.
 */
const UIManager = {
    msgTimeout: null,
    
    /**
     * Show a full-screen splash effect
     */
    showSplash(text, type = 'neutral') {
        const el = document.createElement('div');
        const color = type === 'good' ? 'text-green-500' : type === 'bad' ? 'text-red-500' : 'text-white';
        el.className = 'fixed inset-0 z-[100] flex items-center justify-center pointer-events-none';
        el.innerHTML = `<div class="text-6xl font-black drop-shadow-xl transform scale-150 ${color}" style="animation: fadeOut 1s forwards">${text}</div>`;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1000);
    },
    
    /**
     * Trigger confetti celebration
     */
    triggerConfetti() {
        if (typeof confetti !== 'undefined') {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#4f46e5', '#10b981', '#f59e0b']
            });
        }
    },
    
    /**
     * Update streak counter display
     */
    updateStreak(n) {
        const el = document.getElementById('headerStreak');
        if (el) {
            el.textContent = n;
            if (n > 0 && n % 10 === 0) {
                el.classList.add('animate-bounce');
                setTimeout(() => el.classList.remove('animate-bounce'), 1000);
            }
        }
    },
    
    /**
     * Add a word to the history sidebar
     */
    addToHistory(word, vote) {
        const list = document.getElementById('history-list');
        if (!list) return;
        
        const item = document.createElement('div');
        item.className = `flex justify-between items-center p-3 mb-2 rounded-lg bg-white border-l-4 shadow-sm ${
            vote === 'good' ? 'border-green-500' : 'border-red-500'
        }`;
        item.innerHTML = `
            <span class="font-bold text-gray-700">${word}</span>
            <span class="text-xl">${vote === 'good' ? '👍' : '👎'}</span>
        `;
        list.insertBefore(item, list.firstChild);
        
        // Keep history limited
        if (list.children.length > 50) {
            list.lastChild.remove();
        }
    },
    
    /**
     * Show a message in the word display area
     */
    showMessage(text, isError = false) {
        const wd = document.getElementById('wordDisplay');
        if (!wd) return;
        
        wd.textContent = text;
        wd.className = `font-bold text-center min-h-[72px] ${isError ? 'text-red-500' : 'text-gray-500'}`;
        wd.style.fontSize = text.length > 20 ? '1.25rem' : '2.0rem';
        wd.style.cursor = 'default';
        
        this.disableButtons(true);
    },
    
    /**
     * Enable/disable vote buttons
     */
    disableButtons(disabled) {
        ['goodButton', 'badButton', 'notWordButton'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.disabled = disabled;
        });
    },
    
    /**
     * Show a temporary post-vote message
     */
    showPostVoteMessage(msg) {
        const el = document.getElementById('postVoteMessage');
        if (!el) return;
        
        if (this.msgTimeout) clearTimeout(this.msgTimeout);
        
        el.classList.remove('opacity-100');
        el.classList.add('opacity-0');
        
        setTimeout(() => {
            el.innerHTML = msg;
            el.classList.remove('opacity-0');
            el.classList.add('opacity-100');
            
            this.msgTimeout = setTimeout(() => {
                el.classList.remove('opacity-100');
                el.classList.add('opacity-0');
            }, 5000);
        }, 150);
    },
    
    /**
     * Update all statistics displays
     */
    updateStats() {
        const words = State.runtime.fullWordList.length > 0 
            ? State.runtime.fullWordList 
            : State.runtime.allWords;
        
        if (!words.length) return;
        
        // Update header stats
        const headerStreak = document.getElementById('headerStreak');
        const headerUserVotes = document.getElementById('headerUserVotes');
        const headerGlobalVotes = document.getElementById('headerGlobalVotes');
        const headerTotalWords = document.getElementById('headerTotalWords');
        const headerGood = document.getElementById('headerGood');
        const headerBad = document.getElementById('headerBad');
        const barGood = document.getElementById('headerBarGood');
        const barBad = document.getElementById('headerBarBad');
        
        if (headerStreak) headerStreak.textContent = State.data.daily.streak || 0;
        if (headerUserVotes) headerUserVotes.textContent = State.data.voteCount.toLocaleString();
        
        const totalGood = words.reduce((a, w) => a + (w.goodVotes || 0), 0);
        const totalBad = words.reduce((a, w) => a + (w.badVotes || 0), 0);
        const globalTotal = totalGood + totalBad;
        
        if (headerGlobalVotes) headerGlobalVotes.textContent = globalTotal.toLocaleString();
        if (headerTotalWords) headerTotalWords.textContent = words.length.toLocaleString();
        if (headerGood) headerGood.textContent = totalGood.toLocaleString();
        if (headerBad) headerBad.textContent = totalBad.toLocaleString();
        
        if (globalTotal > 0 && barGood && barBad) {
            const goodPct = (totalGood / globalTotal) * 100;
            barGood.style.width = goodPct + '%';
            barBad.style.width = (100 - goodPct) + '%';
        }
        
        // Update community goal
        if (window.CommunityGoal) {
            CommunityGoal.update(globalTotal);
        }
        
        this.renderMiniRankings();
    },
    
    /**
     * Render mini rankings in sidebar
     */
    renderMiniRankings() {
        const words = State.runtime.fullWordList.length > 0 
            ? State.runtime.fullWordList 
            : State.runtime.allWords;
        
        if (!words.length) return;
        
        const goodEl = document.getElementById('goodRankings');
        const badEl = document.getElementById('badRankings');
        
        if (goodEl) {
            const top = [...words]
                .sort((a, b) => (b.goodVotes || 0) - (b.badVotes || 0) - ((a.goodVotes || 0) - (a.badVotes || 0)))
                .slice(0, 5);
            
            goodEl.innerHTML = top.map((w, i) => `
                <div class="flex justify-between items-center py-1 text-sm">
                    <span class="text-gray-600">${i + 1}. ${w.text}</span>
                    <span class="text-green-600 font-bold">+${(w.goodVotes || 0) - (w.badVotes || 0)}</span>
                </div>
            `).join('');
        }
        
        if (badEl) {
            const bottom = [...words]
                .sort((a, b) => ((a.goodVotes || 0) - (a.badVotes || 0)) - ((b.goodVotes || 0) - (b.badVotes || 0)))
                .slice(0, 5);
            
            badEl.innerHTML = bottom.map((w, i) => `
                <div class="flex justify-between items-center py-1 text-sm">
                    <span class="text-gray-600">${i + 1}. ${w.text}</span>
                    <span class="text-red-600 font-bold">${(w.goodVotes || 0) - (w.badVotes || 0)}</span>
                </div>
            `).join('');
        }
    },
    
    /**
     * Display a word with appropriate styling
     */
    showWord(word, isGolden = false) {
        const wd = document.getElementById('wordDisplay');
        if (!wd) return;
        
        // Reset styles
        wd.className = 'font-extrabold text-gray-900 text-center min-h-[72px] cursor-pointer';
        wd.style.cssText = '';
        
        // Set text
        wd.textContent = word.text || word;
        
        // Size based on length
        const len = (word.text || word).length;
        if (len > 20) wd.style.fontSize = '1.25rem';
        else if (len > 15) wd.style.fontSize = '1.75rem';
        else if (len > 10) wd.style.fontSize = '2.25rem';
        else wd.style.fontSize = '2.5rem';
        
        // Golden word effect
        if (isGolden) {
            wd.classList.add('golden-word');
            wd.style.color = '#fbbf24';
            wd.style.textShadow = '0 0 20px rgba(251, 191, 36, 0.8)';
        }
        
        // Vote percentages
        if (State.data.settings.showPercentages && word.goodVotes !== undefined) {
            const total = (word.goodVotes || 0) + (word.badVotes || 0);
            if (total > 0) {
                const pct = Math.round((word.goodVotes / total) * 100);
                const badge = document.createElement('div');
                badge.className = 'text-xs text-gray-400 mt-1';
                badge.textContent = `${pct}% approval`;
                wd.appendChild(badge);
            }
        }
        
        this.disableButtons(false);
    },
    
    /**
     * Update profile display in header
     */
    updateProfileDisplay() {
        const name = State.data.username;
        const photo = State.data.profilePhoto;
        
        const label = document.getElementById('headerProfileLabel');
        const emoji = document.getElementById('headerProfileEmoji');
        const img = document.getElementById('headerProfileImage');
        
        if (label) label.textContent = name ? `${name}'s Profile` : 'My Profile';
        
        if (photo && img) {
            emoji?.classList.add('hidden');
            img.src = photo;
            img.classList.remove('hidden');
        } else {
            emoji?.classList.remove('hidden');
            img?.classList.add('hidden');
        }
    },
    
    /**
     * Show offline mode indicator
     */
    updateOfflineIndicator() {
        const isOffline = !navigator.onLine || State.data.settings.offlineMode;
        const indicator = document.getElementById('offlineIndicator');
        
        if (indicator) {
            indicator.style.display = isOffline ? 'block' : 'none';
        }
    }
};


// ============================================================================
// MODAL MANAGER - Dialog Handling
// ============================================================================
/**
 * Manages modal dialogs (settings, profile, rankings, etc.)
 */
const ModalManager = {
    activeModal: null,
    
    /**
     * Toggle a modal's visibility
     */
    toggle(name, show = null) {
        const modalId = `${name}Modal`;
        let modal = document.getElementById(modalId);
        
        // Try container variant
        if (!modal) {
            modal = document.getElementById(`${name}ModalContainer`);
        }
        
        if (!modal) {
            console.warn(`Modal not found: ${name}`);
            return;
        }
        
        const shouldShow = show !== null ? show : modal.classList.contains('hidden');
        
        if (shouldShow) {
            // Close any open modal first
            if (this.activeModal && this.activeModal !== modal) {
                this.activeModal.classList.add('hidden');
            }
            
            modal.classList.remove('hidden');
            this.activeModal = modal;
            
            // Trap focus
            const focusable = modal.querySelector('button, input, select, textarea');
            if (focusable) focusable.focus();
        } else {
            modal.classList.add('hidden');
            if (this.activeModal === modal) {
                this.activeModal = null;
            }
        }
    },
    
    /**
     * Close all modals
     */
    closeAll() {
        document.querySelectorAll('[id$="Modal"], [id$="ModalContainer"]').forEach(modal => {
            modal.classList.add('hidden');
        });
        this.activeModal = null;
    },
    
    /**
     * Show a quick alert modal
     */
    alert(title, message, buttonText = 'OK') {
        return new Promise(resolve => {
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm';
            modal.innerHTML = `
                <div class="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
                    <h3 class="text-xl font-bold text-gray-800 mb-2">${title}</h3>
                    <p class="text-gray-600 mb-4">${message}</p>
                    <button class="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl">${buttonText}</button>
                </div>
            `;
            document.body.appendChild(modal);
            
            modal.querySelector('button').onclick = () => {
                modal.remove();
                resolve();
            };
        });
    },
    
    /**
     * Show a confirmation dialog
     */
    confirm(title, message, confirmText = 'Confirm', cancelText = 'Cancel') {
        return new Promise(resolve => {
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm';
            modal.innerHTML = `
                <div class="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
                    <h3 class="text-xl font-bold text-gray-800 mb-2">${title}</h3>
                    <p class="text-gray-600 mb-4">${message}</p>
                    <div class="flex gap-3">
                        <button id="cancelBtn" class="flex-1 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl">${cancelText}</button>
                        <button id="confirmBtn" class="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl">${confirmText}</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            modal.querySelector('#cancelBtn').onclick = () => {
                modal.remove();
                resolve(false);
            };
            modal.querySelector('#confirmBtn').onclick = () => {
                modal.remove();
                resolve(true);
            };
        });
    }
};


// ============================================================================
// INPUT HANDLER - Touch, Mouse, Keyboard
// ============================================================================
/**
 * Handles all user input including swipe gestures
 */
const InputHandler = {
    startX: 0,
    startY: 0,
    startTime: 0,
    isDragging: false,
    
    init() {
        const card = document.getElementById('gameCard');
        if (!card) return;
        
        // Touch events
        card.addEventListener('touchstart', (e) => this.handleStart(e.touches[0]), { passive: true });
        card.addEventListener('touchmove', (e) => this.handleMove(e.touches[0]), { passive: true });
        card.addEventListener('touchend', (e) => this.handleEnd(e.changedTouches[0]));
        
        // Mouse events
        card.addEventListener('mousedown', (e) => this.handleStart(e));
        card.addEventListener('mousemove', (e) => this.handleMove(e));
        card.addEventListener('mouseup', (e) => this.handleEnd(e));
        card.addEventListener('mouseleave', () => this.cancelDrag());
        
        // Keyboard
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    },
    
    handleStart(e) {
        this.startX = e.clientX || e.pageX;
        this.startY = e.clientY || e.pageY;
        this.startTime = Date.now();
        this.isDragging = true;
    },
    
    handleMove(e) {
        if (!this.isDragging) return;
        
        const x = e.clientX || e.pageX;
        const deltaX = x - this.startX;
        
        // Visual feedback during drag
        const card = document.getElementById('gameCard');
        if (card) {
            const rotation = deltaX * 0.05;
            card.style.transform = `translateX(${deltaX * 0.5}px) rotate(${rotation}deg)`;
            card.style.transition = 'none';
        }
    },
    
    handleEnd(e) {
        if (!this.isDragging) return;
        this.isDragging = false;
        
        const x = e.clientX || e.pageX;
        const deltaX = x - this.startX;
        const deltaTime = Date.now() - this.startTime;
        const velocity = Math.abs(deltaX) / deltaTime;
        
        // Reset card position
        const card = document.getElementById('gameCard');
        if (card) {
            card.style.transform = '';
            card.style.transition = 'transform 0.3s ease-out';
        }
        
        // Check for swipe (minimum distance and velocity)
        const threshold = CONFIG.VOTE.SWIPE_THRESHOLD || 100;
        if (Math.abs(deltaX) > threshold || velocity > 0.5) {
            if (window.Game) {
                if (deltaX < 0) {
                    Game.vote('bad');
                } else {
                    Game.vote('good');
                }
            }
        }
    },
    
    cancelDrag() {
        this.isDragging = false;
        const card = document.getElementById('gameCard');
        if (card) {
            card.style.transform = '';
            card.style.transition = 'transform 0.3s ease-out';
        }
    },
    
    handleKeyboard(e) {
        // Ignore if typing in input
        if (e.target.matches('input, textarea, select')) return;
        
        // Ignore if modal is open
        if (ModalManager.activeModal) return;
        
        // Check if buttons are disabled
        const goodBtn = document.getElementById('goodButton');
        if (goodBtn && goodBtn.disabled) return;
        
        switch (e.code) {
            case 'ArrowLeft':
                e.preventDefault();
                if (window.Game) Game.vote('good');
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (window.Game) Game.vote('bad');
                break;
            case 'Space':
                e.preventDefault();
                if (window.Game) Game.nextWord();
                break;
        }
    }
};


// ============================================================================
// TIP MANAGER - Helpful Tips
// ============================================================================
/**
 * Shows contextual tips to help users learn the game
 */
const TipManager = {
    tips: [
        { id: 'welcome', text: "Welcome! Vote on words - are they good or bad?", shown: false },
        { id: 'swipe', text: "Tip: You can swipe left/right to vote!", shown: false },
        { id: 'keyboard', text: "Tip: Use arrow keys to vote faster!", shown: false },
        { id: 'streak', text: "Keep voting to build your streak!", shown: false },
        { id: 'themes', text: "Some words unlock secret themes!", shown: false },
        { id: 'submit', text: "Know a word we're missing? Submit it!", shown: false }
    ],
    
    currentIndex: 0,
    
    init() {
        if (!State.data.settings.showTips) return;
        
        // Show first tip after a delay
        setTimeout(() => this.showNext(), 10000);
    },
    
    showNext() {
        if (!State.data.settings.showTips) return;
        
        const tip = this.tips[this.currentIndex];
        if (!tip || tip.shown) {
            this.currentIndex = (this.currentIndex + 1) % this.tips.length;
            return;
        }
        
        tip.shown = true;
        this.show(tip.text);
        
        this.currentIndex++;
        
        // Schedule next tip
        if (this.currentIndex < this.tips.length) {
            const votesNeeded = CONFIG.TIP_COOLDOWN || 4;
            // Will be called after votes
        }
    },
    
    show(text) {
        // Create tip modal
        const existing = document.getElementById('tipModal');
        if (existing) existing.remove();
        
        const modal = document.createElement('div');
        modal.id = 'tipModal';
        modal.className = 'fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50';
        modal.innerHTML = `
            <div class="bg-indigo-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3">
                <span class="text-xl">💡</span>
                <span class="font-medium">${text}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-2 hover:bg-indigo-700 rounded-full p-1">✕</button>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Auto-dismiss
        setTimeout(() => modal.remove(), 8000);
    },
    
    onVote() {
        State.data.voteCounterForTips = (State.data.voteCounterForTips || 0) + 1;
        State.save('voteCounterForTips', State.data.voteCounterForTips);
        
        if (State.data.voteCounterForTips % (CONFIG.TIP_COOLDOWN || 4) === 0) {
            this.showNext();
        }
    }
};


// ============================================================================
// DISCOVERY MANAGER - Feature Unlocks
// ============================================================================
/**
 * Tracks discovered features and shows unlock notifications
 */
const DiscoveryManager = {
    features: [
        'swipe', 'keyboard', 'themes', 'submit', 'compare', 
        'settings', 'profile', 'history', 'rankings'
    ],
    
    discover(feature) {
        if (!this.features.includes(feature)) return;
        if (State.data.discovered.includes(feature)) return;
        
        State.data.discovered.push(feature);
        State.save('discovered', State.data.discovered);
        
        // Show discovery notification
        const names = {
            swipe: '👆 Swipe Voting',
            keyboard: '⌨️ Keyboard Shortcuts',
            themes: '🎨 Theme Gallery',
            submit: '✏️ Word Submission',
            compare: '⚖️ Word Compare',
            settings: '⚙️ Settings',
            profile: '👤 Profile',
            history: '📜 Vote History',
            rankings: '🏆 Rankings'
        };
        
        if (window.StreakManager) {
            StreakManager.showNotification(`Discovered: ${names[feature]}!`, 'info');
        }
    }
};


// ============================================================================
// SHARE MANAGER - Social Sharing
// ============================================================================
/**
 * Handles sharing functionality
 */
const ShareManager = {
    async share(text, url) {
        const shareData = {
            title: 'Good Word / Bad Word',
            text: text,
            url: url || window.location.href
        };
        
        if (navigator.share) {
            try {
                await navigator.share(shareData);
                return true;
            } catch (e) {
                if (e.name !== 'AbortError') {
                    console.warn('Share failed:', e);
                }
            }
        }
        
        // Fallback to clipboard
        try {
            await navigator.clipboard.writeText(`${text} ${shareData.url}`);
            UIManager.showPostVoteMessage('Copied to clipboard! 📋');
            return true;
        } catch (e) {
            console.error('Copy failed:', e);
            return false;
        }
    },
    
    shareScore(score, game) {
        const text = `I scored ${score} in ${game} on Good Word / Bad Word! Can you beat me?`;
        this.share(text);
    },
    
    shareWord(word, vote) {
        const emoji = vote === 'good' ? '👍' : '👎';
        const text = `I voted ${emoji} on "${word}" - what do you think?`;
        this.share(text);
    }
};


// ============================================================================
// ACCESSIBILITY - Enhanced Features
// ============================================================================
/**
 * Accessibility helpers and color scheme management
 */
const Accessibility = {
    apply() {
        const settings = State.data.settings;
        
        // Large text mode
        if (settings.largeText) {
            document.documentElement.style.fontSize = '120%';
        }
        
        // Colorblind mode
        if (settings.colorblindMode) {
            document.body.classList.add('colorblind-mode');
        }
    },
    
    getColors() {
        if (State.data.settings.colorblindMode) {
            return {
                good: '#0077BB',  // Blue
                bad: '#EE7733'    // Orange
            };
        }
        return {
            good: '#22c55e',  // Green
            bad: '#ef4444'    // Red
        };
    },
    
    announce(message, priority = 'polite') {
        let announcer = document.getElementById('sr-announcer');
        if (!announcer) {
            announcer = document.createElement('div');
            announcer.id = 'sr-announcer';
            announcer.setAttribute('aria-live', priority);
            announcer.setAttribute('aria-atomic', 'true');
            announcer.className = 'sr-only';
            announcer.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);';
            document.body.appendChild(announcer);
        }
        
        announcer.textContent = '';
        setTimeout(() => { announcer.textContent = message; }, 100);
    }
};


// ============================================================================
// EXPORTS
// ============================================================================
window.UIManager = UIManager;
window.ModalManager = ModalManager;
window.InputHandler = InputHandler;
window.TipManager = TipManager;
window.DiscoveryManager = DiscoveryManager;
window.ShareManager = ShareManager;
window.Accessibility = Accessibility;

console.log('%c[UI] Loaded', 'color: #8b5cf6');

})();
