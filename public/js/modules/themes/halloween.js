/**
 * ============================================================================
 * HALLOWEEN THEME EFFECT
 * ============================================================================
 * Interactive spider with AI behavior, animated web, and flying bats
 * Spider can hunt mosquitos from MosquitoManager
 * * UPDATE: "Turf War" & "Social Encounter" Logic
 * - Floor spider is Brown, Ceiling spider is Black.
 * - Usually, they avoid each other (Floor leaves before Ceiling drops).
 * - Occasionally, they meet, acknowledge each other, and chat.
 * * UPDATE: Bat z-index increased to fly OVER everything.
 */

(function() {
'use strict';

Effects.halloween = function(active) {
        if (Effects.spiderTimeout) clearTimeout(Effects.spiderTimeout);
        if (Effects.webRaf) cancelAnimationFrame(Effects.webRaf);
        if (Effects.batTimeout) clearTimeout(Effects.batTimeout);
        if (Effects.floorSpiderTimeout) clearTimeout(Effects.floorSpiderTimeout);
        
        const isSafeMode = State.data.settings.arachnophobiaMode;
        
        if (!active || isSafeMode) {
            const old = document.getElementById('spider-wrap');
            if (old) {
                if (old.floorSpiderAI) old.floorSpiderAI.destroy();
                old.remove();
            }
            const oldFloor = document.getElementById('floor-spider-container');
            if (oldFloor) oldFloor.remove();
            const oldWeb = document.getElementById('spider-web-corner');
            if (oldWeb) oldWeb.remove();
            const style = document.getElementById('spider-motion-style');
            if (style) style.remove();
            const oldBat = document.getElementById('halloween-bat');
            if (oldBat) oldBat.remove();
            return;
        }

        // ====================================================================
        // BATS
        // ====================================================================
        const spawnBat = () => {
            if (!active) return;
            const oldBat = document.getElementById('halloween-bat');
            if (oldBat) oldBat.remove();
            const bat = document.createElement('div');
            bat.id = 'halloween-bat';
            const side = Math.floor(Math.random() * 4);
            let startX, startY, endX, endY;
            switch(side) {
                case 0: // top
                    startX = 20 + Math.random() * 60;
                    startY = -10;
                    endX = 30 + Math.random() * 40;
                    endY = 110;
                    break;
                case 1: // right
                    startX = 110;
                    startY = 20 + Math.random() * 60;
                    endX = -10;
                    endY = 30 + Math.random() * 40;
                    break;
                case 2: // bottom
                    startX = 20 + Math.random() * 60;
                    startY = 110;
                    endX = 30 + Math.random() * 40;
                    endY = -10;
                    break;
                default: // left
                    startX = -10;
                    startY = 20 + Math.random() * 60;
                    endX = 110;
                    endY = 30 + Math.random() * 40;
            }
            const duration = 4 + Math.random() * 3;
            bat.innerHTML = `
                <div class="bat-body" style="font-size: 5rem; filter: drop-shadow(0 0 15px rgba(0,0,0,0.6));">
                    <span class="bat-wing-left" style="display: inline-block; transform-origin: right center;">🦇</span>
                </div>
            `;
            // Z-INDEX UPDATED TO 5000 TO ENSURE IT IS ON TOP
            bat.style.cssText = `
                position: fixed;
                left: ${startX}%;
                top: ${startY}%;
                z-index: 5000;
                pointer-events: none;
                animation: bat-fly-${Date.now()} ${duration}s ease-in-out forwards;
            `;
            const styleEl = document.createElement('style');
            styleEl.textContent = `
                @keyframes bat-fly-${Date.now()} {
                    0% {
                        left: ${startX}%;
                        top: ${startY}%;
                        transform: scale(0.3);
                    }
                    50% {
                        transform: scale(1.5);
                    }
                    100% {
                        left: ${endX}%;
                        top: ${endY}%;
                        transform: scale(0.5);
                    }
                }
                @keyframes bat-flap {
                    0%, 100% { transform: scaleX(1) scaleY(1); }
                    50% { transform: scaleX(0.6) scaleY(0.8); }
                }
                .bat-body {
                    animation: bat-flap 0.15s ease-in-out infinite;
                }
            `;
            document.head.appendChild(styleEl);
            document.body.appendChild(bat);
            setTimeout(() => {
                bat.remove();
                styleEl.remove();
            }, duration * 1000);
            Effects.batTimeout = setTimeout(spawnBat, 8000 + Math.random() * 12000);
        };
        Effects.batTimeout = setTimeout(spawnBat, 3000 + Math.random() * 5000);

        // ====================================================================
        // STYLES
        // ====================================================================
        if (!document.getElementById('spider-motion-style')) {
            const s = document.createElement('style');
            s.id = 'spider-motion-style';
            s.innerHTML = `
                /* Realistic leg animations for floor scuttling */
                @keyframes leg-cycle-left {
                    0%, 100% { transform: rotate(-15deg) scaleY(1); }
                    25% { transform: rotate(10deg) scaleY(0.85); }
                    50% { transform: rotate(20deg) scaleY(1); }
                    75% { transform: rotate(5deg) scaleY(0.9); }
                }
                @keyframes leg-cycle-right {
                    0%, 100% { transform: rotate(15deg) scaleY(1); }
                    25% { transform: rotate(-5deg) scaleY(0.9); }
                    50% { transform: rotate(-20deg) scaleY(1); }
                    75% { transform: rotate(-10deg) scaleY(0.85); }
                }
                @keyframes body-bob {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-2px) rotate(0deg); }
                }
                @keyframes spider-idle-wiggle {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(2deg); }
                }
                @keyframes spider-moving {
                    0%, 100% { transform: rotate(-1deg); }
                    50% { transform: rotate(1deg); }
                }
                @keyframes spider-pause-wiggle {
                    0%, 100% { transform: rotate(0deg) scale(1); }
                    30% { transform: rotate(2deg) scale(1.02); }
                    70% { transform: rotate(-1deg) scale(0.98); }
                }
                @keyframes spider-look-around {
                    0%, 100% { transform: rotate(0deg); }
                    20% { transform: rotate(-8deg); }
                    40% { transform: rotate(5deg); }
                    60% { transform: rotate(-3deg); }
                    80% { transform: rotate(6deg); }
                }
                @keyframes leg-twitch {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(8deg); }
                }
                .scuttling-motion {
                    animation: spider-moving 0.8s infinite ease-in-out;
                }
                .spider-paused {
                    animation: spider-pause-wiggle 1.5s ease-in-out;
                }
                .spider-looking {
                    animation: spider-look-around 2s ease-in-out;
                }
                .hunting-scuttle {
                    animation: spider-moving 0.5s infinite ease-in-out;
                }
                .spider-idle {
                    animation: spider-idle-wiggle 3s infinite ease-in-out;
                }
                .spider-fat {
                    filter: drop-shadow(0 10px 5px rgba(0,0,0,0.4)); transition: transform 1s cubic-bezier(0.5, 0, 0.5, 1);
                }
                /* Floor spider specific styles */
                .floor-spider-container {
                    position: fixed;
                    z-index: 103;
                    pointer-events: none;
                    transition: none;
                }
                .floor-spider-body {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    pointer-events: auto;
                    cursor: pointer;
                    /* Distinct color for floor spider (Brown Recluse vs Black Widow) */
                    color: #4a3627; 
                    filter: sepia(0.6) hue-rotate(-10deg) brightness(0.9);
                }
                .floor-spider-body.scuttling .spider-legs-left {
                    animation: leg-cycle-left 0.15s infinite linear;
                }
                .floor-spider-body.scuttling .spider-legs-right {
                    animation: leg-cycle-right 0.15s infinite linear;
                }
                .floor-spider-body.scuttling .spider-core {
                    animation: body-bob 0.3s infinite linear;
                }
                .floor-spider-body.paused .spider-core {
                    animation: spider-pause-wiggle 1.5s ease-in-out;
                }
                .floor-spider-body.looking .spider-core {
                    animation: spider-look-around 2s ease-in-out;
                }
                .floor-spider-body.paused .spider-legs-left,
                .floor-spider-body.paused .spider-legs-right {
                    animation: leg-twitch 0.8s ease-in-out;
                }
                .spider-legs-left, .spider-legs-right {
                    position: absolute;
                    font-size: 0.6em;
                    opacity: 0.9;
                    transform-origin: center;
                }
                .spider-legs-left {
                    left: -0.4em;
                }
                .spider-legs-right {
                    right: -0.4em;
                    transform: scaleX(-1);
                }
                .spider-core {
                    position: relative;
                    z-index: 2;
                }
            `;
            document.head.appendChild(s);
        }

        // ========================================================================
        // INTELLIGENT FLOOR SPIDER MOVEMENT SYSTEM
        // ========================================================================
        const floorSpiderAI = {
            active: false,
            currentX: 0,
            currentY: 0,
            targetX: 0,
            targetY: 0,
            state: 'idle', // idle, moving, pausing, looking, thinking, leaving, gone, hiding (for hunt), meeting
            moveSpeed: 180, 
            element: null,
            bodyElement: null,
            animationFrame: null,
            lastTime: 0,
            pauseTimeout: null,
            thinkingTimeout: null,
            facingRight: true,
            stepCount: 0,
            behaviorCount: 0, 
            maxBehaviors: 0, 
            onLeaveCallback: null,
            
            init(container) {
                this.element = container;
                this.bodyElement = container.querySelector('.floor-spider-body');
                this.currentX = window.innerWidth * 0.5;
                this.currentY = window.innerHeight - 80;
                this.behaviorCount = 0;
                this.maxBehaviors = 3 + Math.floor(Math.random() * 5); 
                this.updatePosition();
            },
            
            say(textOrCategory) {
                if (!this.bodyElement || this.element.style.display === 'none') return;
                
                let text = textOrCategory;
                // Check if it's a category key in GAME_DIALOGUE
                if (typeof GAME_DIALOGUE !== 'undefined' && GAME_DIALOGUE.spider) {
                    // Check floor categories
                    if (GAME_DIALOGUE.spider.floor && GAME_DIALOGUE.spider.floor[textOrCategory]) {
                        const lines = GAME_DIALOGUE.spider.floor[textOrCategory];
                        text = lines[Math.floor(Math.random() * lines.length)];
                    }
                    // Check generic categories (e.g. meetingBottom)
                    else if (GAME_DIALOGUE.spider[textOrCategory]) {
                        const lines = GAME_DIALOGUE.spider[textOrCategory];
                        text = lines[Math.floor(Math.random() * lines.length)];
                    }
                }
                
                // Create a bubble specifically for the floor spider
                const old = document.getElementById('floor-spider-bubble');
                if (old) old.remove();
                
                const b = document.createElement('div');
                b.id = 'floor-spider-bubble';
                Object.assign(b.style, {
                    position: 'fixed',
                    background: 'white', 
                    color: '#4a3627', // Brown text for brown spider
                    padding: '6px 12px',
                    borderRadius: '12px', 
                    fontSize: '13px', 
                    fontWeight: 'bold',
                    fontFamily: 'sans-serif', 
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none', 
                    opacity: '0', 
                    transition: 'opacity 0.2s',
                    boxShadow: '0 3px 8px rgba(0,0,0,0.3)', 
                    border: '2px solid #4a3627',
                    zIndex: '110'
                });
                b.textContent = text;
                
                const arrow = document.createElement('div');
                Object.assign(arrow.style, {
                    position: 'absolute',
                    bottom: '-8px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '0',
                    height: '0',
                    borderStyle: 'solid',
                    borderWidth: '8px 8px 0 8px',
                    borderColor: '#4a3627 transparent transparent transparent'
                });
                b.appendChild(arrow);
                document.body.appendChild(b);
                
                const updatePos = () => {
                    if (!b.parentNode || !this.element) return;
                    const rect = this.bodyElement.getBoundingClientRect();
                    const bubRect = b.getBoundingClientRect();
                    let left = rect.left + rect.width / 2 - bubRect.width / 2;
                    let top = rect.top - bubRect.height - 15;
                    left = Math.max(10, Math.min(window.innerWidth - bubRect.width - 10, left));
                    top = Math.max(10, top);
                    b.style.left = left + 'px';
                    b.style.top = top + 'px';
                    if (b.parentNode) requestAnimationFrame(updatePos);
                };
                
                requestAnimationFrame(() => {
                    b.style.opacity = '1';
                    updatePos();
                });
                
                setTimeout(() => {
                    if (b.parentNode) {
                        b.style.opacity = '0';
                        setTimeout(() => b.remove(), 300);
                    }
                }, 2000);
            },
            
            updatePosition() {
                if (!this.element) return;
                this.element.style.left = `${this.currentX}px`;
                this.element.style.top = `${this.currentY}px`;
                if (this.bodyElement) {
                    this.bodyElement.style.transform = this.facingRight ? 'scaleX(1)' : 'scaleX(-1)';
                }
            },
            
            chooseDestination() {
                const preferEdge = Math.random() < 0.6;
                const margin = 60;
                const maxX = window.innerWidth - margin;
                const maxY = window.innerHeight - margin;
                let targetX, targetY;
                if (preferEdge) {
                    const wall = Math.floor(Math.random() * 4);
                    switch(wall) {
                        case 0: targetX = margin + Math.random() * 50; targetY = margin + Math.random() * (maxY - margin); break;
                        case 1: targetX = maxX - Math.random() * 50; targetY = margin + Math.random() * (maxY - margin); break;
                        case 2: targetX = margin + Math.random() * (maxX - margin); targetY = maxY - Math.random() * 50; break;
                        default: targetX = margin + 30; targetY = maxY - 30;
                    }
                } else {
                    targetX = margin + Math.random() * (maxX - margin);
                    targetY = window.innerHeight * 0.4 + Math.random() * (maxY - window.innerHeight * 0.4);
                }
                return { x: targetX, y: targetY };
            },
            
            moveTo(x, y, onComplete) {
                this.targetX = x;
                this.targetY = y;
                this.state = 'moving';
                this.stepCount = 0;
                this.facingRight = x > this.currentX;
                this.updatePosition();
                if (this.bodyElement) {
                    this.bodyElement.classList.remove('paused', 'looking');
                    this.bodyElement.classList.add('scuttling');
                }
                if (Math.random() < 0.25) this.say('startMoving');
                this.lastTime = performance.now();
                this.animateMovement(onComplete);
            },
            
            animateMovement(onComplete) {
                if (this.state !== 'moving' && this.state !== 'leaving') return;
                const now = performance.now();
                const deltaTime = (now - this.lastTime) / 1000;
                this.lastTime = now;
                const dx = this.targetX - this.currentX;
                const dy = this.targetY - this.currentY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (this.state === 'moving') {
                    this.stepCount++;
                    if (this.stepCount > 30 && Math.random() < 0.008) {
                        this.pauseMidJourney(() => { this.moveTo(this.targetX, this.targetY, onComplete); });
                        return;
                    }
                }
                
                if (distance < 5) {
                    this.currentX = this.targetX;
                    this.currentY = this.targetY;
                    this.updatePosition();
                    if (this.bodyElement) this.bodyElement.classList.remove('scuttling');
                    
                    if (this.state === 'leaving') {
                        this.state = 'gone';
                        if (this.element) {
                            this.element.style.opacity = '0';
                            setTimeout(() => {
                                if (this.element) this.element.style.display = 'none';
                                if (this.onLeaveCallback) this.onLeaveCallback();
                            }, 300);
                        }
                        return;
                    }
                    this.state = 'idle';
                    if (Math.random() < 0.35) this.say('arriving');
                    if (onComplete) onComplete();
                    return;
                }
                
                const speedVariation = 0.85 + Math.random() * 0.3;
                const currentSpeed = this.moveSpeed * speedVariation;
                const slowdownDistance = 100;
                const speedMultiplier = (this.state !== 'leaving' && distance < slowdownDistance) ? 0.3 + (distance / slowdownDistance) * 0.7 : 1;
                const moveDistance = currentSpeed * deltaTime * speedMultiplier;
                const ratio = Math.min(moveDistance / distance, 1);
                const wobble = Math.sin(now / 50) * 0.5;
                this.currentX += dx * ratio + wobble * (dy / distance);
                this.currentY += dy * ratio - wobble * (dx / distance);
                if (this.state !== 'leaving') {
                    this.currentX = Math.max(30, Math.min(window.innerWidth - 30, this.currentX));
                    this.currentY = Math.max(100, Math.min(window.innerHeight - 30, this.currentY));
                }
                this.updatePosition();
                this.animationFrame = requestAnimationFrame(() => this.animateMovement(onComplete));
            },
            
            pauseMidJourney(onResume) {
                this.state = 'pausing';
                if (this.bodyElement) {
                    this.bodyElement.classList.remove('scuttling');
                    this.bodyElement.classList.add('paused');
                }
                if (Math.random() < 0.5) setTimeout(() => this.say('pausing'), 300);
                this.pauseTimeout = setTimeout(() => {
                    if (this.state !== 'pausing') return;
                    this.state = 'looking';
                    if (this.bodyElement) {
                        this.bodyElement.classList.remove('paused');
                        this.bodyElement.classList.add('looking');
                    }
                    if (Math.random() < 0.3) {
                        this.facingRight = !this.facingRight;
                        this.updatePosition();
                    }
                    this.thinkingTimeout = setTimeout(() => {
                        if (this.bodyElement) this.bodyElement.classList.remove('looking');
                        this.state = 'idle';
                        if (onResume) onResume();
                    }, 1500 + Math.random() * 1500);
                }, 800 + Math.random() * 1200);
            },
            
            think(onComplete) {
                this.state = 'thinking';
                if (this.bodyElement) {
                    this.bodyElement.classList.remove('scuttling');
                    this.bodyElement.classList.add('paused');
                }
                if (Math.random() < 0.5) setTimeout(() => this.say('thinking'), 500);
                this.thinkingTimeout = setTimeout(() => {
                    if (this.bodyElement) {
                        this.bodyElement.classList.remove('paused');
                        this.bodyElement.classList.add('looking');
                    }
                    setTimeout(() => {
                        if (this.bodyElement) this.bodyElement.classList.remove('looking');
                        this.state = 'idle';
                        if (onComplete) onComplete();
                    }, 1000 + Math.random() * 1500);
                }, 1500 + Math.random() * 2000);
            },
            
            interrupt() {
                // Used when meeting the ceiling spider
                this.stop();
                this.state = 'meeting';
                if (this.bodyElement) {
                    this.bodyElement.classList.add('looking');
                    this.bodyElement.style.animation = 'shake 0.2s ease-in-out';
                    setTimeout(() => {
                        this.bodyElement.style.animation = '';
                    }, 200);
                }
            },

            resumeAfterMeeting() {
                if (this.bodyElement) this.bodyElement.classList.remove('looking');
                this.state = 'idle';
                this.doBehavior();
            },

            leave(onLeave) {
                this.stop(); // Stop any current movement
                this.state = 'leaving';
                this.onLeaveCallback = onLeave;
                // Don't always say goodbye if forced to leave by ceiling spider
                if (Math.random() < 0.3) this.say('leaving');
                
                const exits = [
                    { x: -50, y: this.currentY }, 
                    { x: window.innerWidth + 50, y: this.currentY }, 
                    { x: this.currentX, y: window.innerHeight + 50 } 
                ];
                // Find closest exit to scuttle away fast
                exits.sort((a,b) => {
                    const distA = Math.abs(a.x - this.currentX) + Math.abs(a.y - this.currentY);
                    const distB = Math.abs(b.x - this.currentX) + Math.abs(b.y - this.currentY);
                    return distA - distB;
                });
                
                const exit = exits[0];
                this.facingRight = exit.x > this.currentX;
                this.updatePosition();
                
                if (this.bodyElement) {
                    this.bodyElement.classList.remove('paused', 'looking');
                    this.bodyElement.classList.add('scuttling');
                }
                
                this.moveSpeed = 350; // VERY FAST when running away
                this.targetX = exit.x;
                this.targetY = exit.y;
                this.lastTime = performance.now();
                this.animateMovement(null);
            },
            
            enter(onEnter) {
                if (!this.element) return;
                this.stop();
                this.state = 'entering';
                this.element.style.display = '';
                this.element.style.opacity = '1';
                this.element.style.transition = 'opacity 0.3s';
                
                const side = Math.floor(Math.random() * 3);
                const margin = 60;
                switch(side) {
                    case 0: this.currentX = -40; this.currentY = window.innerHeight * 0.5 + Math.random() * (window.innerHeight * 0.4); this.facingRight = true; break;
                    case 1: this.currentX = window.innerWidth + 40; this.currentY = window.innerHeight * 0.5 + Math.random() * (window.innerHeight * 0.4); this.facingRight = false; break;
                    default: this.currentX = margin + Math.random() * (window.innerWidth - margin * 2); this.currentY = window.innerHeight + 40; this.facingRight = Math.random() > 0.5;
                }
                
                this.updatePosition();
                setTimeout(() => this.say('returning'), 500);
                
                const dest = this.chooseDestination();
                this.moveSpeed = 180;
                this.behaviorCount = 0;
                this.maxBehaviors = 3 + Math.floor(Math.random() * 5);
                
                setTimeout(() => {
                    this.moveTo(dest.x, dest.y, () => {
                        this.state = 'idle';
                        if (onEnter) onEnter();
                    });
                }, 100);
            },
            
            stop() {
                this.state = 'idle';
                if (this.animationFrame) { cancelAnimationFrame(this.animationFrame); this.animationFrame = null; }
                if (this.pauseTimeout) { clearTimeout(this.pauseTimeout); this.pauseTimeout = null; }
                if (this.thinkingTimeout) { clearTimeout(this.thinkingTimeout); this.thinkingTimeout = null; }
                if (this.bodyElement) this.bodyElement.classList.remove('scuttling', 'paused', 'looking');
            },
            
            doBehavior() {
                if (this.state !== 'idle') return;
                this.behaviorCount++;
                if (this.behaviorCount >= this.maxBehaviors) {
                    this.leave(() => { });
                    return;
                }
                const action = Math.random();
                if (action < 0.15) {
                    this.think(() => { setTimeout(() => this.doBehavior(), 500 + Math.random() * 1000); });
                } else {
                    const dest = this.chooseDestination();
                    this.moveTo(dest.x, dest.y, () => {
                        const waitTime = 2000 + Math.random() * 4000;
                        setTimeout(() => this.doBehavior(), waitTime);
                    });
                }
            },
            
            destroy() {
                this.stop();
                if (this.element) { this.element.remove(); this.element = null; this.bodyElement = null; }
            }
        };
        
        const spiderScuttle = {
            active: false,
            targetX: 50,
            currentX: 50,
            start(wrap, body, targetPercent, onComplete) {
                this.active = true;
                this.targetX = targetPercent;
                this.currentX = targetPercent;
                wrap.style.transition = 'none';
                wrap.style.left = targetPercent + '%';
                setTimeout(() => { this.stop(body, onComplete); }, 50);
            },
            stop(body, onComplete) {
                this.active = false;
                body.classList.remove('scuttling-motion', 'spider-paused');
                if (onComplete) onComplete();
            },
            cancel(body) {
                this.active = false;
                body.classList.remove('scuttling-motion', 'spider-paused');
            }
        };

        // ====================================================================
        // INITIALIZE CEILING SPIDER (WRAP)
        // ====================================================================
        let wrap = document.getElementById('spider-wrap');
        if (!wrap) {
            wrap = document.createElement('div');
            wrap.id = 'spider-wrap';
            wrap.spiderScuttle = spiderScuttle; 
            Object.assign(wrap.style, {
                position: 'fixed', left: '50%', top: '-15vh', zIndex: '102',
                pointerEvents: 'none'
            });
            const now = Date.now();
            const oneHourAgo = now - (60 * 60 * 1000);
            if (!State.data.spiderEatLog) State.data.spiderEatLog = [];
            const recentBugs = State.data.spiderEatLog.filter(t => t > oneHourAgo).length;
            const maxBugs = 5;
            const cappedEaten = Math.min(recentBugs, maxBugs);
            const fontSize = (3 + (cappedEaten * 0.6)).toFixed(2);
            wrap.innerHTML = `
                <div id="spider-anchor" style="transform-origin: top center;">
                    <div id="spider-thread" style="width: 2px; background: rgba(255,255,255,0.6); margin: 0 auto; height: 0; transition: height 4s ease-in-out;"></div>
                    <div id="spider-body" style="font-size: ${fontSize}rem; margin-top: -10px; cursor: pointer; position: relative; z-index: 2; pointer-events: auto; transition: font-size 0.3s ease;">
                        🕷️
                    </div>
                </div>`;
            document.body.appendChild(wrap);
            const body = wrap.querySelector('#spider-body');
            const thread = wrap.querySelector('#spider-thread');

            const showSpiderBubble = (text, type = 'normal') => {
                const old = document.getElementById('spider-bubble-dynamic');
                if (old) { if (old.rafId) cancelAnimationFrame(old.rafId); old.remove(); }
                const b = document.createElement('div');
                b.id = 'spider-bubble-dynamic';
                Object.assign(b.style, {
                    position: 'fixed',
                    background: 'white', color: '#1f2937', padding: '8px 14px',
                    borderRadius: '16px', fontSize: '14px', fontWeight: 'bold',
                    fontFamily: 'sans-serif', whiteSpace: 'nowrap', width: 'max-content',
                    pointerEvents: 'none', opacity: '0', transition: 'opacity 0.2s',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)', border: '2px solid #1f2937',
                    zIndex: '110', willChange: 'top, left'
                });
                b.textContent = text;
                const arrow = document.createElement('div');
                Object.assign(arrow.style, {
                    position: 'absolute', width: '0', height: '0',
                    borderStyle: 'solid', pointerEvents: 'none'
                });
                b.appendChild(arrow);
                document.body.appendChild(b);
                const updatePosition = () => {
                    if (!b.parentNode) return; 
                    const spiderRect = body.getBoundingClientRect();
                    const bubRect = b.getBoundingClientRect();
                    const currentTransform = body.style.transform || '';
                    const gap = 15;
                    let rotation = 0;
                    if (currentTransform.includes('180deg')) rotation = 180;
                    
                    let top, left;
                    if (rotation === 180 || type === 'upside-down') {
                        // Bubble BELOW spider (visually above because inverted? No, element is inverted)
                        // If spider is upside down (dropped), bubble should be below head
                        top = spiderRect.bottom + gap;
                        left = spiderRect.left + (spiderRect.width / 2) - (bubRect.width / 2);
                        Object.assign(arrow.style, {
                            top: '-8px', left: '50%', right: 'auto', bottom: 'auto',
                            transform: 'translateX(-50%) translateY(0)',
                            borderWidth: '0 8px 8px 8px',
                            borderColor: 'transparent transparent #1f2937 transparent'
                        });
                    } else {
                        top = spiderRect.top - bubRect.height - gap;
                        left = spiderRect.left + (spiderRect.width / 2) - (bubRect.width / 2);
                        Object.assign(arrow.style, {
                            bottom: '-8px', left: '50%', right: 'auto', top: 'auto',
                            transform: 'translateX(-50%) translateY(0)',
                            borderWidth: '8px 8px 0 8px',
                            borderColor: '#1f2937 transparent transparent transparent'
                        });
                    }
                    if (left < 10) left = 10;
                    if (left + bubRect.width > window.innerWidth - 10) left = window.innerWidth - bubRect.width - 10;
                    if (top < 10) top = 10;
                    if (top + bubRect.height > window.innerHeight - 10) top = window.innerHeight - bubRect.height - 10;
                    b.style.top = `${top}px`;
                    b.style.left = `${left}px`;
                    b.rafId = requestAnimationFrame(updatePosition);
                };
                requestAnimationFrame(() => { b.style.opacity = '1'; updatePosition(); });
                setTimeout(() => {
                    if (b.parentNode) {
                        b.style.opacity = '0';
                        setTimeout(() => { if (b.rafId) cancelAnimationFrame(b.rafId); b.remove(); }, 300);
                    }
                }, 2000);
                return b;
            };
            wrap.showBubble = showSpiderBubble;
            body.onclick = (e) => {
                e.stopPropagation();
                State.unlockBadge('spider');
                const willFall = Math.random() < 0.2;
                const lines = willFall ? GAME_DIALOGUE.spider.pokeGrumpy : GAME_DIALOGUE.spider.pokeHappy;
                const text = lines[Math.floor(Math.random() * lines.length)];
                showSpiderBubble(text, body.style.transform.includes('180') ? 'upside-down' : 'normal');
                body.style.animation = 'shake 0.3s ease-in-out';
                if (willFall) {
                    if (Effects.spiderTimeout) clearTimeout(Effects.spiderTimeout);
                    setTimeout(() => { Effects.spiderFall(wrap, thread, body); }, 400);
                } else {
                    setTimeout(() => { body.style.animation = ''; }, 2000);
                }
            };
            
            // ================================================================
            // FLOOR SPIDER SETUP
            // ================================================================
            let floorSpider = document.getElementById('floor-spider-container');
            if (!floorSpider) {
                floorSpider = document.createElement('div');
                floorSpider.id = 'floor-spider-container';
                floorSpider.className = 'floor-spider-container';
                const floorFontSize = (2.5 + (cappedEaten * 0.4)).toFixed(2);
                floorSpider.innerHTML = `
                    <div class="floor-spider-body" style="font-size: ${floorFontSize}rem;">
                        <div class="spider-legs-left">⌇</div>
                        <div class="spider-core">🕷️</div>
                        <div class="spider-legs-right">⌇</div>
                    </div>
                `;
                document.body.appendChild(floorSpider);
                
                floorSpiderAI.init(floorSpider);
                
                const scheduleReentry = () => {
                    const reentryDelay = 15000 + Math.random() * 25000;
                    Effects.floorSpiderTimeout = setTimeout(() => {
                        if (document.body.contains(floorSpider)) {
                            if (wrap && wrap.classList.contains('hunting')) { scheduleReentry(); return; }
                            floorSpiderAI.enter(() => { floorSpiderAI.doBehavior(); });
                        }
                    }, reentryDelay);
                };
                floorSpiderAI.onLeaveCallback = scheduleReentry;
                
                const floorBody = floorSpider.querySelector('.floor-spider-body');
                floorBody.onclick = (e) => {
                    e.stopPropagation();
                    State.unlockBadge('spider');
                    if (floorSpiderAI.state === 'leaving' || floorSpiderAI.state === 'gone') return;
                    floorSpiderAI.stop();
                    const lines = GAME_DIALOGUE.spider.pokeHappy || ["Hey!", "Watch it!"];
                    const text = lines[Math.floor(Math.random() * lines.length)];
                    floorSpiderAI.say(text);
                    floorBody.style.animation = 'shake 0.3s ease-in-out';
                    setTimeout(() => {
                        floorBody.style.animation = '';
                        floorSpiderAI.leave(scheduleReentry); // Run away on click
                    }, 300);
                };
                
                setTimeout(() => {
                    if (document.body.contains(floorSpider)) floorSpiderAI.doBehavior();
                }, 3000);
            }
            wrap.floorSpiderAI = floorSpiderAI;
        }

        const body = wrap.querySelector('#spider-body');
        const thread = wrap.querySelector('#spider-thread');
        const scuttle = wrap.spiderScuttle;
        const anchor = wrap.querySelector('#spider-anchor');
        const currentBody = wrap.querySelector('#spider-body');
        
        if (anchor && currentBody) {
            const eaten = State.data.insectStats.eaten || 0;
            let scale = Math.min(0.7 + (eaten * 0.05), 2.0);
            const isFull = Date.now() < (State.data.spiderFullUntil || 0);
            if (isFull) {
                scale = scale * 1.6; 
                currentBody.classList.add('spider-fat');
            } else {
                const recentBugs = State.data.spiderEatLog ? State.data.spiderEatLog.length : 0;
                scale = scale * (1 + (recentBugs * 0.20));
                currentBody.classList.remove('spider-fat');
            }
            anchor.style.transform = `scale(${scale.toFixed(2)})`;
        }

        // ====================================================================
        // ONE SPIDER RULE with EXCEPTION (Meeting)
        // ====================================================================
        const runDrop = () => {
            if (!document.body.contains(wrap)) return;
            if (wrap.classList.contains('hunting')) return;
            
            // LOGIC: Check if floor spider is home
            const isFloorSpiderHome = floorSpiderAI.state !== 'gone' && floorSpiderAI.state !== 'leaving' && floorSpiderAI.state !== 'entering' && floorSpiderAI.element.style.display !== 'none';
            
            // 30% chance they meet, if floor spider is home. Otherwise, turf war.
            const triggerMeeting = isFloorSpiderHome && Math.random() < 0.3;

            if (isFloorSpiderHome && !triggerMeeting) {
                // SCENARIO 1: TURF WAR
                // Floor spider scuttles away immediately
                floorSpiderAI.say('turfWar'); // Uses new dialogue key
                floorSpiderAI.leave(() => {
                    // Only drop AFTER floor spider is gone
                    setTimeout(() => {
                        performDrop();
                    }, 500);
                });
                return; // Stop here, wait for callback
            } 
            else if (isFloorSpiderHome && triggerMeeting) {
                // SCENARIO 2: THE MEETING (Exception to the rule)
                performMeeting();
                return;
            }

            // Standard drop (floor empty)
            performDrop();
        };

        const performMeeting = () => {
            // Both stay on screen!
            floorSpiderAI.interrupt(); // Stop floor spider, make it look up
            
            // Drop ceiling spider partly
            wrap.style.left = floorSpiderAI.currentX + 'px'; // Drop roughly above
            body.style.transform = 'rotate(180deg)';
            body.classList.add('spider-idle');
            thread.style.opacity = '1';
            thread.style.transition = 'height 2s ease-in-out';
            
            // Drop height based on floor spider position
            const dropHeight = ((floorSpiderAI.currentY / window.innerHeight) * 100) - 30; // 30% above floor spider
            thread.style.height = dropHeight + 'vh';

            setTimeout(() => {
                // Dialogue Exchange using new keys
                let topText = "Hello!";
                let botText = "Hi!";
                
                if (typeof GAME_DIALOGUE !== 'undefined' && GAME_DIALOGUE.spider) {
                    if (GAME_DIALOGUE.spider.meetingTop) {
                        const t = GAME_DIALOGUE.spider.meetingTop;
                        topText = t[Math.floor(Math.random() * t.length)];
                    }
                    if (GAME_DIALOGUE.spider.meetingBottom) {
                        const b = GAME_DIALOGUE.spider.meetingBottom;
                        botText = b[Math.floor(Math.random() * b.length)];
                    }
                }
                
                if(wrap.showBubble) wrap.showBubble(topText, 'upside-down');
                
                setTimeout(() => {
                    floorSpiderAI.say(botText); // Direct text injection isn't supported by 'say' unless it's a key, but I patched 'say' to handle keys
                    
                    setTimeout(() => {
                        // Retreat
                        body.classList.remove('spider-idle');
                        thread.style.height = '0';
                        floorSpiderAI.resumeAfterMeeting();
                        
                        Effects.spiderTimeout = setTimeout(runDrop, 15000 + Math.random() * 20000);
                    }, 2000);
                }, 1500);
            }, 2000);
        };

        const performDrop = () => {
            // Standard drop behavior
            // Move wrap to random X
            const randomX = 10 + Math.random() * 80;
            wrap.style.transition = 'none';
            wrap.style.left = randomX + '%';
            
            body.style.transform = 'rotate(0deg)';
            body.classList.remove('scuttling-motion', 'spider-paused', 'spider-idle');
            thread.style.opacity = '1';
            
            body.style.transform = 'rotate(180deg)';
            body.classList.add('spider-idle');
            thread.style.transition = 'height 2.5s ease-in-out';
            thread.style.height = '18vh';
            
            setTimeout(() => {
                if (wrap.classList.contains('hunting')) return;
                let text = 'Boo!';
                if (typeof GAME_DIALOGUE !== 'undefined' && GAME_DIALOGUE.spider) {
                     const phrases = Array.isArray(GAME_DIALOGUE.spider.idle) ? GAME_DIALOGUE.spider.idle : ['Boo!', 'Hi!', '🕷️'];
                     text = phrases[Math.floor(Math.random() * phrases.length)];
                }
                if(wrap.showBubble) wrap.showBubble(text, 'upside-down');
                
                setTimeout(() => {
                    if (wrap.classList.contains('hunting')) return;
                    body.classList.remove('spider-idle');
                    thread.style.height = '0';
                    Effects.spiderTimeout = setTimeout(runDrop, 15000 + Math.random() * 20000);
                    
                    // If floor spider was gone, maybe schedule it to come back? 
                    // (Handled by the leave callback usually, but good to ensure)
                }, 3000);
            }, 2500);
        };

        Effects.spiderTimeout = setTimeout(runDrop, 5000);


        // ... (Web Code remains same) ...
        if (!document.getElementById('spider-web-corner')) {
            const web = document.createElement('div');
            web.id = 'spider-web-corner';
            web.innerHTML = `<svg id="web-svg" viewBox="0 0 300 300" style="width:300px;height:300px;position:fixed;top:0;right:0;z-index:55;pointer-events:auto;cursor:pointer;opacity:0.7;filter:drop-shadow(1px 1px 2px rgba(0,0,0,0.5))"></svg>`;
            document.body.appendChild(web);
            web.onclick = () => {
                if (MosquitoManager.state === 'stuck') {
                    Effects.spiderHunt(MosquitoManager.x, MosquitoManager.y, true);
                } else {
                    State.data.insectStats.teased = (State.data.insectStats.teased || 0) + 1;
                    State.save('insectStats', State.data.insectStats);
                    if (State.data.insectStats.teased >= 50) State.unlockBadge('prankster');
                    Effects.spiderHunt(88, 20, false);
                }
            };
            const svg = document.getElementById('web-svg');
            const cx = 300, cy = 0;
            const baseAnchors = [{ x: 0, y: 0 }, { x: 60, y: 100 }, { x: 140, y: 200 }, { x: 220, y: 270 }, { x: 300, y: 300 }];
            const animateWeb = () => {
                const time = Date.now();
                let pathStr = '';
                const curAnchors = baseAnchors.map((a, i) => {
                    if (i === 0 || i === baseAnchors.length - 1) return a;
                    const sway = Math.sin((time / 1500) + i) * 15;
                    return { x: a.x + sway, y: a.y + sway }
                });
                curAnchors.forEach(p => {
                    pathStr += `<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="rgba(255,255,255,0.4)" stroke-width="2.5"/>`
                });
                const levels = 7;
                for (let i = 1; i <= levels; i++) {
                    const t = i / levels;
                    let d = '';
                    for (let j = 0; j < curAnchors.length; j++) {
                        const ax = cx + (curAnchors[j].x - cx) * t,
                            ay = cy + (curAnchors[j].y - cy) * t;
                        if (j === 0) d += `M ${ax} ${ay}`;
                        else {
                            const px = cx + (curAnchors[j - 1].x - cx) * t,
                                py = cy + (curAnchors[j - 1].y - cy) * t;
                            const midX = (px + ax) / 2,
                                midY = (py + ay) / 2,
                                sag = 15 * t * (1 - t * 0.5),
                                dx = midX - cx,
                                dy = midY - cy,
                                len = Math.sqrt(dx * dx + dy * dy),
                                nx = dx / len,
                                ny = dy / len,
                                qx = midX - nx * sag,
                                qy = midY - ny * sag;
                            d += ` Q ${qx} ${qy} ${ax} ${ay}`
                        }
                    }
                    pathStr += `<path d="${d}" stroke="rgba(255,255,255,0.3)" stroke-width="2.5" fill="none"/>`
                }
                svg.innerHTML = pathStr;
                Effects.webRaf = requestAnimationFrame(animateWeb)
            };
            animateWeb()
        }
    },

Effects.spiderHunt = function(targetXPercent, targetYPercent, isFood) {
        const wrap = document.getElementById('spider-wrap');
        if (!wrap) return;

        // Force Floor spider to hide immediately during a hunt (Priority 1)
        if (wrap.floorSpiderAI) {
            wrap.floorSpiderAI.stop();
            if (wrap.floorSpiderAI.element) {
                wrap.floorSpiderAI.element.style.display = 'none';
                wrap.floorSpiderAI.state = 'hiding';
            }
        }

        if (Date.now() < (State.data.spiderFullUntil || 0)) {
            const body = wrap.querySelector('#spider-body');
            const thread = wrap.querySelector('#spider-thread');
            const lines = GAME_DIALOGUE.spider.full || ["I'm stuffed."];
            const text = lines[Math.floor(Math.random() * lines.length)];
            thread.style.transition = 'height 1s ease-out';
            thread.style.height = '20vh';
            setTimeout(() => {
                if(wrap.showBubble) wrap.showBubble(text);
                if(body) body.style.animation = 'shake 1s ease-in-out';
                setTimeout(() => {
                    if(body) body.style.animation = '';
                    thread.style.height = '0';
                    // Return floor spider
                    if (wrap.floorSpiderAI && wrap.floorSpiderAI.element) {
                        setTimeout(() => {
                            if (wrap.floorSpiderAI.state === 'hiding') {
                                wrap.floorSpiderAI.enter(() => wrap.floorSpiderAI.doBehavior());
                            }
                        }, 1200);
                    }
                }, 1500);
            }, 1000); 
            return;
        }

        const thread = wrap.querySelector('#spider-thread');
        const body = wrap.querySelector('#spider-body');
        const scuttle = wrap.spiderScuttle;
        const anchor = wrap.querySelector('#spider-anchor');
        if (anchor && body) {
            const eaten = State.data.insectStats.eaten || 0;
            let scale = Math.min(0.7 + (eaten * 0.05), 2.0); 
            const isFull = Date.now() < (State.data.spiderFullUntil || 0);
            if (isFull) {
                scale = scale * 1.6; 
                body.classList.add('spider-fat');
            } else {
                const recentBugs = State.data.spiderEatLog ? State.data.spiderEatLog.length : 0;
                scale = scale * (1 + (recentBugs * 0.20));
                body.classList.remove('spider-fat');
            }
            anchor.style.transform = `scale(${scale.toFixed(2)})`;
        }
        if (scuttle) scuttle.cancel(body);
        body.classList.remove('scuttling-motion', 'spider-paused', 'spider-idle');
        body.classList.add('hunting-scuttle');
        if (Effects.spiderTimeout) clearTimeout(Effects.spiderTimeout);
        wrap.classList.add('hunting');
        let phrases = isFood ? GAME_DIALOGUE.spider.hunting : GAME_DIALOGUE.spider.trickedStart;
        const text = phrases[Math.floor(Math.random() * phrases.length)];
        const bub = wrap.showBubble ? wrap.showBubble(text) : null;
        const destX = isFood ? targetXPercent : 88;
        const destY = isFood ? targetYPercent : 20;
        
        wrap.style.transition = 'none';
        wrap.style.left = destX + '%';
        void wrap.offsetWidth;
        
        setTimeout(() => {
            body.classList.remove('hunting-scuttle');
            const dropVH = 15 + destY + 1;
            thread.style.transition = 'none';
            thread.style.height = '0';
            void thread.offsetWidth;
            thread.style.transition = 'height 2s cubic-bezier(0.45, 0, 0.55, 1)';
            thread.style.height = dropVH + 'vh';
            setTimeout(() => {
                    if (isFood && MosquitoManager.state === 'stuck') {
                        MosquitoManager.eat();
                        if(wrap.showBubble) wrap.showBubble("YUM!");
                        const anchor = wrap.querySelector('#spider-anchor');
                        if (anchor) {
                            const now = Date.now();
                            const oneHourAgo = now - (60 * 60 * 1000);
                            const recentBugs = (State.data.spiderEatLog || []).filter(t => t > oneHourAgo).length;
                            const maxBugs = 5;
                            const cappedBugs = Math.min(recentBugs, maxBugs);
                            UIManager.showPostVoteMessage(`🕷️ ${recentBugs} bug${recentBugs !== 1 ? 's' : ''} in belly!`);
                            const baseFontSize = 3; // rem
                            const newFontSize = baseFontSize + (cappedBugs * 0.6); 
                            const bulgeFontSize = newFontSize * 1.2;
                            body.style.transition = 'font-size 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
                            body.style.fontSize = bulgeFontSize.toFixed(2) + 'rem';
                            setTimeout(() => {
                                if (body) {
                                    body.style.fontSize = newFontSize.toFixed(2) + 'rem';
                                }
                            }, 300);
                            if (cappedBugs >= maxBugs) {
                                body.classList.add('spider-fat');
                            }
                        }
                        if (body) body.style.animation = 'shake 0.2s ease-in-out';
                        setTimeout(() => {
                            if (body) body.style.animation = '';
                        }, 500);
                        setTimeout(() => {
                            Effects.retreatSpider(thread, wrap, bub, '2s');
                        }, 5000);
                    }
                    else if (isFood) {
                        const missedPhrases = GAME_DIALOGUE.spider.missed || ["Too slow!", "My lunch!"];
                        const missedText = missedPhrases[Math.floor(Math.random() * missedPhrases.length)];
                        if(wrap.showBubble) wrap.showBubble(missedText);
                        body.style.animation = 'shake 0.5s ease-in-out';
                        setTimeout(() => {
                            body.style.animation = '';
                            Effects.retreatSpider(thread, wrap, bub, '2s');
                        }, 1500);
                    }
                    else {
                        const angryPhrases = GAME_DIALOGUE.spider.trickedEnd;
                        const angryText = angryPhrases[Math.floor(Math.random() * angryPhrases.length)];
                        if(wrap.showBubble) wrap.showBubble(angryText);
                        body.style.animation = 'shake 0.3s ease-in-out';
                        setTimeout(() => {
                            body.style.animation = '';
                            Effects.retreatSpider(thread, wrap, bub, '4s');
                        }, 1500);
                    }
                }, 2000);
            }, 100);
    },

Effects.spiderFall = function(wrap, thread, body, bub) {
        if(bub) {
            bub.style.opacity = '0';
            setTimeout(() => bub.remove(), 300);
        }
        thread.style.transition = 'height 0.8s cubic-bezier(0.55, 0.085, 0.68, 0.53), opacity 0s linear';
        thread.style.opacity = '0';
        requestAnimationFrame(() => { thread.style.height = '120vh'; });
        setTimeout(() => {
            thread.style.transition = 'none';
            wrap.style.transition = 'none';
            wrap.style.left = '88%';
            thread.style.height = '120vh';
            void wrap.offsetWidth;
            thread.style.opacity = '1';
            requestAnimationFrame(() => {
                thread.style.transition = 'height 5s ease-in-out';
                thread.style.height = '0';
            });
            wrap.classList.remove('hunting');
            setTimeout(() => Effects.halloween(true), 6000);
        }, 1500);
    },

Effects.retreatSpider = function(thread, wrap, bub, duration) {
        thread.style.transition = `height ${duration} ease-in-out`;
        requestAnimationFrame(() => { thread.style.height = '0'; });
        setTimeout(() => {
            if(bub) bub.remove();
            wrap.classList.remove('hunting');
            if (wrap.floorSpiderAI && wrap.floorSpiderAI.element) {
                setTimeout(() => {
                    wrap.floorSpiderAI.enter(() => {
                        wrap.floorSpiderAI.doBehavior();
                    });
                }, 500);
            } else {
                Effects.halloween(true);
            }
        }, parseFloat(duration) * 1000);
    },

console.log('%c[Theme: Halloween] Loaded', 'color: #f97316');

})();
