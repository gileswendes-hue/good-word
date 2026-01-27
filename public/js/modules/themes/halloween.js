        // ====================================================================
        // INTELLIGENT BAT AI SYSTEM
        // ====================================================================
        const BatAI = {
            element: null,
            bubbleElement: null,
            state: 'idle',
            currentX: 0,
            currentY: 0,
            animationFrame: null,
            behaviorTimeout: null,
            mood: 'neutral',
            lastSpeech: 0,
            flightPath: [],
            pathIndex: 0,
            hasGreetedSpider: false,
            stolenFood: false,
            interactionCooldown: 0,
            bugsEaten: 0,
            baseSize: 4, // Base font size in rem
            
            init() {
                this.destroy();
                this.hasGreetedSpider = false;
                this.stolenFood = false;
                this.interactionCooldown = 0;
                
                // Load bugs eaten from state if available
                this.bugsEaten = State?.data?.batEatCount || 0;
                const currentSize = this.baseSize + Math.min(this.bugsEaten * 0.3, 3); // Max +3rem
                
                this.element = document.createElement('div');
                this.element.id = 'halloween-bat';
                this.element.innerHTML = `
                    <div class="bat-body" style="font-size: ${currentSize}rem; filter: drop-shadow(0 0 10px rgba(0,0,0,0.5)); cursor: pointer; pointer-events: auto; transition: font-size 0.5s ease;">
                        <span class="bat-emoji" style="display: inline-block; transition: transform 0.3s ease;">🦇</span>
                    </div>
                `;
                this.element.style.cssText = `
                    position: fixed;
                    z-index: 5000;
                    pointer-events: none;
                    transition: none;
                    will-change: transform, left, top;
                `;
                
                document.body.appendChild(this.element);
                
                const batBody = this.element.querySelector('.bat-body');
                batBody.onclick = (e) => { e.stopPropagation(); this.onPoked(); };
                
                const hour = new Date().getHours();
                if (hour >= 20 || hour < 5) this.mood = Math.random() < 0.7 ? 'playful' : 'hungry';
                else if (hour >= 5 && hour < 12) this.mood = 'grumpy';
                else this.mood = 'neutral';
                
                // Sync mood with coordinator
                CreatureCoordinator.updateMood('bat', this.mood);
                
                this.enter();
            },
            
            // Increase bat size after eating
            growAfterEating() {
                this.bugsEaten++;
                
                // Save to state
                if (State?.data) {
                    State.data.batEatCount = this.bugsEaten;
                    if (State.save) State.save('batEatCount', this.bugsEaten);
                }
                
                // Update size with animation
                const newSize = this.baseSize + Math.min(this.bugsEaten * 0.3, 3);
                const batBody = this.element?.querySelector('.bat-body');
                if (batBody) {
                    batBody.style.fontSize = newSize + 'rem';
                    
                    // Brief "gulp" animation
                    const emoji = this.element.querySelector('.bat-emoji');
                    if (emoji) {
                        emoji.style.transform = 'scale(1.3)';
                        setTimeout(() => {
                            emoji.style.transform = '';
                        }, 300);
                    }
                }
            },
            
            destroy() {
                if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
                if (this.behaviorTimeout) clearTimeout(this.behaviorTimeout);
                if (this.element) this.element.remove();
                if (this.bubbleElement) this.bubbleElement.remove();
                this.element = null;
                this.bubbleElement = null;
                this.state = 'idle';
                CreatureCoordinator.batDespawned();
            },
            
            say(textOrCategory) {
                if (!this.element || Date.now() - this.lastSpeech < 3000) return;
                this.lastSpeech = Date.now();
                
                let text = textOrCategory;
                if (typeof GAME_DIALOGUE !== 'undefined' && GAME_DIALOGUE.bat) {
                    if (GAME_DIALOGUE.bat[textOrCategory]) {
                        const lines = GAME_DIALOGUE.bat[textOrCategory];
                        if (Array.isArray(lines)) text = lines[Math.floor(Math.random() * lines.length)];
                    } else if (textOrCategory === 'idle' && GAME_DIALOGUE.bat.getIdlePhrase) {
                        text = GAME_DIALOGUE.bat.getIdlePhrase();
                    }
                }
                
                // Slow down while speaking!
                this.isSpeaking = true;
                this.preSpeakSpeed = this.flightPath[this.pathIndex]?.speed || 0.35;
                if (this.flightPath[this.pathIndex]) {
                    this.flightPath[this.pathIndex].speed = 0.08; // Very slow while talking
                }
                
                if (this.bubbleElement) {
                    this.bubbleElement.remove();
                    this.bubbleElement = null;
                }
                
                const b = document.createElement('div');
                b.id = 'bat-bubble';
                Object.assign(b.style, {
                    position: 'fixed', background: '#2d1b4e', color: '#e8d5ff',
                    padding: '8px 14px', borderRadius: '16px', fontSize: '14px',
                    fontWeight: 'bold', fontFamily: 'sans-serif', whiteSpace: 'nowrap',
                    pointerEvents: 'none', opacity: '0', transition: 'opacity 0.3s',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.4)', border: '2px solid #8b5cf6', zIndex: '5001',
                    left: '-9999px', top: '-9999px' // Start offscreen
                });
                b.textContent = text;
                
                const arrow = document.createElement('div');
                Object.assign(arrow.style, {
                    position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)',
                    width: '0', height: '0', borderStyle: 'solid', borderWidth: '8px 8px 0 8px',
                    borderColor: '#8b5cf6 transparent transparent transparent'
                });
                b.appendChild(arrow);
                document.body.appendChild(b);
                this.bubbleElement = b;
                
                // Store reference to bat for position updates
                const batAI = this;
                
                const updatePos = () => {
                    if (!b.parentNode || !batAI.element) {
                        return;
                    }
                    
                    // Get bat element's actual position on screen
                    const batRect = batAI.element.getBoundingClientRect();
                    const bubRect = b.getBoundingClientRect();
                    
                    // Position bubble above the bat element
                    let left = batRect.left + batRect.width / 2 - bubRect.width / 2;
                    let top = batRect.top - bubRect.height - 12;
                    
                    // Keep on screen
                    left = Math.max(10, Math.min(window.innerWidth - bubRect.width - 10, left));
                    top = Math.max(10, top);
                    
                    // If bat is near top, put bubble below instead
                    if (top < 20) {
                        top = batRect.bottom + 12;
                        // Flip arrow to point up
                        arrow.style.bottom = 'auto';
                        arrow.style.top = '-8px';
                        arrow.style.borderWidth = '0 8px 8px 8px';
                        arrow.style.borderColor = 'transparent transparent #8b5cf6 transparent';
                    }
                    
                    b.style.left = left + 'px';
                    b.style.top = top + 'px';
                    
                    // Keep updating while visible
                    if (b.parentNode && b.style.opacity !== '0') {
                        requestAnimationFrame(updatePos);
                    }
                };
                
                // Wait a frame for the bubble to render before positioning
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        b.style.opacity = '1';
                        updatePos();
                    });
                });
                
                // Restore speed and remove bubble after delay
                setTimeout(() => { 
                    // Restore speed
                    batAI.isSpeaking = false;
                    if (batAI.flightPath[batAI.pathIndex]) {
                        batAI.flightPath[batAI.pathIndex].speed = batAI.preSpeakSpeed || 0.35;
                    }
                    
                    if (b.parentNode) { 
                        b.style.opacity = '0'; 
                        setTimeout(() => {
                            if (b.parentNode) b.remove();
                            if (batAI.bubbleElement === b) batAI.bubbleElement = null;
                        }, 300); 
                    } 
                }, 2800);
            },
            
            onPoked() {
                const lines = GAME_DIALOGUE?.bat?.poked || ["Hey!"];
                this.say(lines[Math.floor(Math.random() * lines.length)]);
                const emoji = this.element?.querySelector('.bat-emoji');
                if (emoji) {
                    emoji.style.animation = 'bat-startle 0.3s ease-out';
                    setTimeout(() => { emoji.style.animation = ''; }, 300);
                }
                if (Math.random() < 0.4) { this.state = 'leaving'; this.leave(); }
            },
            
            enter() {
                if (!this.element) return;
                CreatureCoordinator.batSpawned();
                
                const side = Math.floor(Math.random() * 4);
                switch(side) {
                    case 0: this.currentX = 20 + Math.random() * 60; this.currentY = -5; break;
                    case 1: this.currentX = 105; this.currentY = 10 + Math.random() * 40; break;
                    case 2: this.currentX = 20 + Math.random() * 60; this.currentY = 105; break;
                    default: this.currentX = -5; this.currentY = 10 + Math.random() * 40;
                }
                
                this.updatePosition();
                this.element.style.opacity = '1';
                this.generateFlightPath();
                this.state = 'flying';
                this.fly();
                
                if (Math.random() < 0.4) setTimeout(() => this.say('idle'), 1000);
            },
            
            generateFlightPath() {
                const numPoints = 4 + Math.floor(Math.random() * 4);
                this.flightPath = [];
                this.pathIndex = 0;
                
                for (let i = 0; i < numPoints; i++) {
                    this.flightPath.push({
                        x: 10 + Math.random() * 80,
                        y: 5 + Math.random() * 50,
                        restHere: Math.random() < 0.2, // More rest stops
                        speed: 0.12 + Math.random() * 0.15 // Much slower: 0.12-0.27 (was 0.25-0.60)
                    });
                }
                
                const exitSide = Math.floor(Math.random() * 4);
                let exitPoint;
                switch(exitSide) {
                    case 0: exitPoint = { x: 30 + Math.random() * 40, y: -10 }; break;
                    case 1: exitPoint = { x: 110, y: 20 + Math.random() * 30 }; break;
                    case 2: exitPoint = { x: 30 + Math.random() * 40, y: 110 }; break;
                    default: exitPoint = { x: -10, y: 20 + Math.random() * 30 };
                }
                this.flightPath.push({ ...exitPoint, exit: true, speed: 0.25 }); // Slower exit too
            },
            
            fly() {
                if (this.state !== 'flying' && this.state !== 'leaving' && this.state !== 'hunting') return;
                if (!this.element || this.pathIndex >= this.flightPath.length) { this.destroy(); return; }
                
                const target = this.flightPath[this.pathIndex];
                
                // Update hunt target if chasing a moving bug
                if (this.state === 'hunting' && target.isAirCatch) {
                    this.updateHuntTarget();
                }
                
                const dx = target.x - this.currentX;
                const dy = target.y - this.currentY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Check for spider interactions
                if (this.state === 'flying' && Date.now() > this.interactionCooldown) {
                    this.checkForSpiderInteraction();
                }
                
                // Try hunting - more frequently and not just when hungry
                if (this.state === 'flying') {
                    const huntChance = this.mood === 'hungry' ? 0.03 : 0.015;
                    if (Math.random() < huntChance) {
                        this.tryHunt();
                    }
                }
                
                // Check if we reached hunt target (use larger radius for air catches)
                const catchRadius = target.isAirCatch ? 18 : 10;
                
                // For air catches, check distance to ACTUAL bug position, not just waypoint
                if (target.isHunt && target.isAirCatch) {
                    const bugPos = this.getBugPosition();
                    if (bugPos && typeof MosquitoManager !== 'undefined' && MosquitoManager.state === 'flying') {
                        const bugDx = bugPos.x - this.currentX;
                        const bugDy = bugPos.y - this.currentY;
                        const bugDistance = Math.sqrt(bugDx * bugDx + bugDy * bugDy);
                        
                        // Catch if we're close enough to the actual bug (25% of screen width)
                        if (bugDistance < 25) {
                            this.completedHunt(target);
                            this.pathIndex++;
                            if (this.pathIndex < this.flightPath.length) {
                                this.state = 'flying';
                            }
                            return;
                        }
                    }
                }
                
                // Standard waypoint reach check
                if (target.isHunt && distance < catchRadius) {
                    this.completedHunt(target);
                    this.pathIndex++;
                    if (this.pathIndex < this.flightPath.length) {
                        this.state = 'flying';
                    }
                    return;
                }
                
                // Timeout hunts that take too long (give more time)
                if (target.isHunt && this.huntStartTime && (Date.now() - this.huntStartTime > 8000)) {
                    this.say('missed');
                    this.huntTargetMoving = false;
                    this.pathIndex++;
                    this.state = 'flying';
                    return;
                }
                
                if (distance < 2) {
                    if (target.exit) { this.destroy(); return; }
                    if (target.restHere && this.state === 'flying') { this.rest(); return; }
                    this.pathIndex++;
                    if (Math.random() < 0.15) this.say('flying');
                } else {
                    const speed = target.speed || 0.18;
                    const moveRatio = Math.min(speed, distance * 0.03);
                    const time = Date.now() / 1000;
                    
                    // Reduce wobble when speaking so bubble stays readable
                    const wobbleScale = this.isSpeaking ? 0.1 : 1.0;
                    const waveX = Math.sin(time * 2) * 0.15 * wobbleScale;
                    const waveY = Math.cos(time * 1.5) * 0.1 * wobbleScale;
                    
                    // Slower overall movement multiplier
                    this.currentX += (dx / distance) * moveRatio * 1.2 + waveX;
                    this.currentY += (dy / distance) * moveRatio * 1.2 + waveY;
                    
                    const emoji = this.element.querySelector('.bat-emoji');
                    if (emoji) emoji.style.transform = dx < 0 ? 'scaleX(-1)' : 'scaleX(1)';
                }
                
                this.updatePosition();
                this.animationFrame = requestAnimationFrame(() => this.fly());
            },
            
            checkForSpiderInteraction() {
                // Check if ceiling spider is dropped and nearby
                const wrap = document.getElementById('spider-wrap');
                if (wrap && CreatureCoordinator.ceilingSpiderDropped && !this.hasGreetedSpider) {
                    const spiderRect = wrap.getBoundingClientRect();
                    const spiderX = (spiderRect.left / window.innerWidth) * 100;
                    const spiderY = (spiderRect.top / window.innerHeight) * 100;
                    
                    const dx = spiderX - this.currentX;
                    const dy = spiderY - this.currentY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 25) {
                        this.greetSpider(wrap);
                    }
                }
                
                // Check for floor spider
                const floorWrap = document.getElementById('floor-spider-container');
                if (floorWrap && floorWrap.style.display !== 'none') {
                    const floorRect = floorWrap.getBoundingClientRect();
                    const floorX = (floorRect.left / window.innerWidth) * 100;
                    const floorY = (floorRect.top / window.innerHeight) * 100;
                    
                    const dx = floorX - this.currentX;
                    const dy = floorY - this.currentY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 30 && Math.random() < 0.3) {
                        this.greetFloorSpider(floorWrap);
                    }
                }
            },
            
            greetSpider(wrap) {
                this.hasGreetedSpider = true;
                this.interactionCooldown = Date.now() + 8000;
                
                const relationship = CreatureCoordinator.getRelationshipStatus('batToSpider');
                let dialogueKey = 'greetSpider';
                
                if (this.mood === 'playful') {
                    dialogueKey = Math.random() < 0.5 ? 'teasingSpider' : 'greetSpider';
                } else if (relationship === 'friendly') {
                    dialogueKey = 'friendlyToSpider';
                }
                
                this.say(dialogueKey);
                
                // Spider responds after delay
                setTimeout(() => {
                    if (wrap.showBubble) {
                        const spiderRelation = CreatureCoordinator.getRelationshipStatus('spiderToBat');
                        let responseKey = spiderRelation === 'friendly' ? 'greetBatFriendly' : 'greetBatGrumpy';
                        
                        // Check if spider is still mad about stolen food
                        if (CreatureCoordinator.getRecentEvent('batStoleFood')) {
                            responseKey = 'batStoleFollowUp';
                        }
                        
                        const lines = GAME_DIALOGUE?.spider?.[responseKey] || ["Hey."];
                        const text = lines[Math.floor(Math.random() * lines.length)];
                        wrap.showBubble(text, 'upside-down');
                    }
                }, 1200);
            },
            
            greetFloorSpider(floorWrap) {
                this.interactionCooldown = Date.now() + 10000;
                this.say('greetFloorSpider');
                
                // Floor spider might respond
                if (Math.random() < 0.6) {
                    setTimeout(() => {
                        const floorAI = document.getElementById('spider-wrap')?.floorSpiderAI;
                        if (floorAI && floorAI.say) {
                            floorAI.say('greetBat');
                        }
                    }, 1000);
                }
            },
            
            rest() {
                this.state = 'resting';
                if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
                
                const body = this.element?.querySelector('.bat-body');
                const emoji = this.element?.querySelector('.bat-emoji');
                
                if (body && emoji) {
                    // Stop flapping
                    body.style.animation = 'none';
                    
                    // Flip upside down and fold wings (compress horizontally)
                    emoji.style.transform = 'rotate(180deg) scaleX(0.7)';
                    emoji.style.transition = 'transform 0.5s ease';
                    
                    // Add gentle swaying animation after settling
                    setTimeout(() => {
                        if (this.state === 'resting') {
                            body.style.animation = 'bat-hang-sway 3s ease-in-out infinite';
                        }
                    }, 500);
                }
                
                if (Math.random() < 0.5) this.say('resting');
                
                // Rest for longer
                this.behaviorTimeout = setTimeout(() => {
                    if (body && emoji) {
                        // Unfold wings and flip right-side up
                        emoji.style.transform = '';
                        body.style.animation = 'bat-flap 0.2s ease-in-out infinite';
                    }
                    this.pathIndex++;
                    this.state = 'flying';
                    this.fly();
                }, 4000 + Math.random() * 6000);
            },
            
            // Get the current bug position from MosquitoManager or DOM
            getBugPosition() {
                if (typeof MosquitoManager === 'undefined') return null;
                
                let bugX, bugY;
                
                // First try MosquitoManager's direct properties
                if (MosquitoManager.x !== undefined && MosquitoManager.y !== undefined) {
                    bugX = MosquitoManager.x;
                    bugY = MosquitoManager.y;
                }
                
                // If not available or seems wrong, try DOM element
                if (bugX === undefined || bugY === undefined || 
                    (bugX === 0 && bugY === 0)) {
                    // Try multiple selectors to find the bug element
                    const selectors = [
                        '#mosquito', '.mosquito', '[data-bug]',
                        '#bug', '.bug', '.insect',
                        '[id*="mosquito"]', '[id*="bug"]', '[class*="mosquito"]'
                    ];
                    
                    let bugEl = null;
                    for (const sel of selectors) {
                        bugEl = document.querySelector(sel);
                        if (bugEl) break;
                    }
                    
                    if (bugEl) {
                        const rect = bugEl.getBoundingClientRect();
                        // Convert to percentage of viewport
                        bugX = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
                        bugY = ((rect.top + rect.height / 2) / window.innerHeight) * 100;
                    }
                }
                
                // Handle case where position is in pixels instead of percentage
                if (bugX !== undefined && bugY !== undefined) {
                    // If values are large, they're probably pixels
                    if (bugX > 100 || bugY > 100) {
                        bugX = (bugX / window.innerWidth) * 100;
                        bugY = (bugY / window.innerHeight) * 100;
                    }
                    
                    // Clamp to valid range
                    bugX = Math.max(0, Math.min(100, bugX));
                    bugY = Math.max(0, Math.min(100, bugY));
                    
                    return { x: bugX, y: bugY };
                }
                
                return null;
            },
            
            // Predict where bug will be based on its movement
            predictBugPosition(currentPos, leadTime = 0.5) {
                if (!currentPos || !this.lastBugPos) {
                    this.lastBugPos = currentPos;
                    this.lastBugTime = Date.now();
                    return currentPos;
                }
                
                const now = Date.now();
                const dt = (now - this.lastBugTime) / 1000;
                
                if (dt > 0 && dt < 1) {
                    // Calculate velocity
                    const vx = (currentPos.x - this.lastBugPos.x) / dt;
                    const vy = (currentPos.y - this.lastBugPos.y) / dt;
                    
                    // Predict future position
                    const predictedX = currentPos.x + vx * leadTime;
                    const predictedY = currentPos.y + vy * leadTime;
                    
                    // Update last known position
                    this.lastBugPos = currentPos;
                    this.lastBugTime = now;
                    
                    // Clamp to screen
                    return {
                        x: Math.max(5, Math.min(95, predictedX)),
                        y: Math.max(5, Math.min(95, predictedY))
                    };
                }
                
                this.lastBugPos = currentPos;
                this.lastBugTime = now;
                return currentPos;
            },
            
            // ============================================================
            // ECHOLOCATION RADAR EFFECT
            // ============================================================
            createEcholocationPing(targetX, targetY, onHit) {
                const batX = (this.currentX / 100) * window.innerWidth;
                const batY = (this.currentY / 100) * window.innerHeight;
                const bugX = (targetX / 100) * window.innerWidth;
                const bugY = (targetY / 100) * window.innerHeight;
                
                // Create the expanding radar ring from bat
                const ring = document.createElement('div');
                ring.className = 'bat-echolocation-ring';
                Object.assign(ring.style, {
                    position: 'fixed',
                    left: batX + 'px',
                    top: batY + 'px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: '2px solid rgba(138, 43, 226, 0.8)',
                    boxShadow: '0 0 10px rgba(138, 43, 226, 0.5), inset 0 0 5px rgba(138, 43, 226, 0.3)',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                    zIndex: '4999'
                });
                document.body.appendChild(ring);
                
                // Calculate distance to target
                const dx = bugX - batX;
                const dy = bugY - batY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const expandDuration = Math.min(800, distance * 2); // Faster for closer targets
                
                // Animate the ring expanding
                let startTime = null;
                const maxRadius = distance + 30;
                
                const animateRing = (timestamp) => {
                    if (!startTime) startTime = timestamp;
                    const elapsed = timestamp - startTime;
                    const progress = Math.min(elapsed / expandDuration, 1);
                    
                    // Ease out for natural feel
                    const easeOut = 1 - Math.pow(1 - progress, 2);
                    const currentRadius = 10 + (maxRadius - 10) * easeOut;
                    
                    ring.style.width = (currentRadius * 2) + 'px';
                    ring.style.height = (currentRadius * 2) + 'px';
                    ring.style.opacity = (1 - progress * 0.5).toString();
                    ring.style.borderWidth = Math.max(1, 3 - progress * 2) + 'px';
                    
                    // Check if ring has reached the bug
                    const ringReachedBug = currentRadius >= distance - 10;
                    
                    if (ringReachedBug && !ring.hitTriggered) {
                        ring.hitTriggered = true;
                        this.createEcholocationBounce(bugX, bugY);
                        if (onHit) onHit();
                    }
                    
                    if (progress < 1) {
                        requestAnimationFrame(animateRing);
                    } else {
                        ring.remove();
                    }
                };
                
                requestAnimationFrame(animateRing);
                
                // Add some trailing rings for effect
                setTimeout(() => this.createTrailingRing(batX, batY, maxRadius * 0.6, expandDuration * 0.8), 100);
                setTimeout(() => this.createTrailingRing(batX, batY, maxRadius * 0.4, expandDuration * 0.6), 200);
            },
            
            createTrailingRing(x, y, maxRadius, duration) {
                const ring = document.createElement('div');
                Object.assign(ring.style, {
                    position: 'fixed',
                    left: x + 'px',
                    top: y + 'px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    border: '1px solid rgba(138, 43, 226, 0.4)',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                    zIndex: '4998'
                });
                document.body.appendChild(ring);
                
                let startTime = null;
                const animateRing = (timestamp) => {
                    if (!startTime) startTime = timestamp;
                    const progress = Math.min((timestamp - startTime) / duration, 1);
                    const easeOut = 1 - Math.pow(1 - progress, 2);
                    const currentRadius = 5 + (maxRadius - 5) * easeOut;
                    
                    ring.style.width = (currentRadius * 2) + 'px';
                    ring.style.height = (currentRadius * 2) + 'px';
                    ring.style.opacity = (0.4 - progress * 0.4).toString();
                    
                    if (progress < 1) {
                        requestAnimationFrame(animateRing);
                    } else {
                        ring.remove();
                    }
                };
                requestAnimationFrame(animateRing);
            },
            
            createEcholocationBounce(x, y) {
                // Create the "ping" effect when echolocation hits the bug
                const ping = document.createElement('div');
                ping.className = 'echolocation-ping';
                Object.assign(ping.style, {
                    position: 'fixed',
                    left: x + 'px',
                    top: y + 'px',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,100,100,0.9) 0%, rgba(255,50,50,0.6) 40%, transparent 70%)',
                    boxShadow: '0 0 20px rgba(255,100,100,0.8), 0 0 40px rgba(255,50,50,0.4)',
                    transform: 'translate(-50%, -50%) scale(0.5)',
                    pointerEvents: 'none',
                    zIndex: '5000'
                });
                document.body.appendChild(ping);
                
                // Animate the ping - burst then fade
                let startTime = null;
                const animatePing = (timestamp) => {
                    if (!startTime) startTime = timestamp;
                    const elapsed = timestamp - startTime;
                    const duration = 500;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    // Quick expand then fade
                    const scale = progress < 0.3 
                        ? 0.5 + (progress / 0.3) * 1.5  // Expand to 2x
                        : 2 - (progress - 0.3) / 0.7 * 0.5; // Shrink slightly
                    
                    ping.style.transform = `translate(-50%, -50%) scale(${scale})`;
                    ping.style.opacity = (1 - progress * 0.8).toString();
                    
                    if (progress < 1) {
                        requestAnimationFrame(animatePing);
                    } else {
                        ping.remove();
                    }
                };
                requestAnimationFrame(animatePing);
                
                // Create ripple rings from the hit point
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => this.createBounceRipple(x, y), i * 80);
                }
                
                // Add a brief flash on the bug itself
                this.flashBugTarget();
            },
            
            createBounceRipple(x, y) {
                const ripple = document.createElement('div');
                Object.assign(ripple.style, {
                    position: 'fixed',
                    left: x + 'px',
                    top: y + 'px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    border: '2px solid rgba(255, 150, 150, 0.8)',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                    zIndex: '4999'
                });
                document.body.appendChild(ripple);
                
                let startTime = null;
                const animateRipple = (timestamp) => {
                    if (!startTime) startTime = timestamp;
                    const progress = Math.min((timestamp - startTime) / 400, 1);
                    const size = 10 + progress * 60;
                    
                    ripple.style.width = size + 'px';
                    ripple.style.height = size + 'px';
                    ripple.style.opacity = (0.8 - progress * 0.8).toString();
                    ripple.style.borderWidth = Math.max(0.5, 2 - progress * 1.5) + 'px';
                    
                    if (progress < 1) {
                        requestAnimationFrame(animateRipple);
                    } else {
                        ripple.remove();
                    }
                };
                requestAnimationFrame(animateRipple);
            },
            
            flashBugTarget() {
                // Find the bug element and flash it
                if (typeof MosquitoManager !== 'undefined' && MosquitoManager.el) {
                    const bugEl = MosquitoManager.el;
                    const originalFilter = bugEl.style.filter || '';
                    
                    // Flash red briefly
                    bugEl.style.filter = 'brightness(2) drop-shadow(0 0 10px red)';
                    bugEl.style.transition = 'filter 0.1s';
                    
                    setTimeout(() => {
                        bugEl.style.filter = originalFilter;
                    }, 200);
                }
            },
            
            tryHunt() {
                if (typeof MosquitoManager === 'undefined') return;
                
                // Check for bugs in web first (stealing from spider!)
                if (MosquitoManager.state === 'stuck') {
                    // Bug is in the web - should we steal it?
                    // More likely to steal if spider is full or bat is hungry
                    const spiderIsFull = State?.data?.spiderFullUntil > Date.now();
                    const willSteal = this.mood === 'hungry' || spiderIsFull || Math.random() < 0.25;
                    
                    if (willSteal) {
                        const bugPos = this.getBugPosition();
                        const bugX = bugPos?.x || 88;
                        const bugY = bugPos?.y || 20;
                        
                        // Echolocation ping on web bug too!
                        this.createEcholocationPing(bugX, bugY, () => {
                            this.say('startHunt');
                            this.state = 'hunting';
                            this.huntStartTime = Date.now();
                            this.flightPath.splice(this.pathIndex, 0, { 
                                x: bugX, y: bugY, speed: 0.5, isHunt: true, isSteal: true 
                            });
                        });
                        return;
                    }
                }
                
                // Check for flying bugs - use prediction for mid-air catch
                if (MosquitoManager.state === 'flying') {
                    const bugPos = this.getBugPosition();
                    if (!bugPos) return;
                    
                    // Calculate distance to current position
                    const dx = bugPos.x - this.currentX;
                    const dy = bugPos.y - this.currentY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 55) { // Within hunting range (increased slightly)
                        // Predict where bug will be - factor in bat's speed
                        const interceptTime = distance / 45; // Estimate time to reach
                        const predictedPos = this.predictBugPosition(bugPos, Math.min(interceptTime, 1.2));
                        
                        // *** ECHOLOCATION EFFECT ***
                        // Send out radar ping, then start hunting after it hits
                        this.say('startHunt');
                        this.createEcholocationPing(bugPos.x, bugPos.y, () => {
                            // Callback when ping hits the bug - NOW start the actual chase
                            this.state = 'hunting';
                            this.huntStartTime = Date.now();
                            this.huntTargetMoving = true;
                            
                            // Re-predict position since time has passed
                            const newBugPos = this.getBugPosition();
                            const newPredicted = newBugPos ? this.predictBugPosition(newBugPos, 0.5) : predictedPos;
                            
                            this.flightPath.splice(this.pathIndex, 0, { 
                                x: newPredicted.x, 
                                y: newPredicted.y, 
                                speed: 0.55, // Faster chase after lock-on
                                isHunt: true,
                                isAirCatch: true
                            });
                        });
                    }
                }
            },
            
            // Called during flight to update hunt target if bug is moving
            updateHuntTarget() {
                if (this.state !== 'hunting' || !this.huntTargetMoving) return;
                if (this.pathIndex >= this.flightPath.length) return;
                
                const target = this.flightPath[this.pathIndex];
                if (!target.isHunt || !target.isAirCatch) return;
                
                // Update target position based on current bug location more aggressively
                const bugPos = this.getBugPosition();
                if (bugPos) {
                    // Shorter prediction = more direct pursuit
                    const predictedPos = this.predictBugPosition(bugPos, 0.25);
                    target.x = predictedPos.x;
                    target.y = predictedPos.y;
                }
            },
            
            // Visual chomp effect when eating
            showChompEffect() {
                if (!this.element) return;
                const emoji = this.element.querySelector('.bat-emoji');
                if (emoji) {
                    // Quick scale animation for "chomp"
                    emoji.style.transition = 'transform 0.15s ease-out';
                    emoji.style.transform = (emoji.style.transform || '') + ' scale(1.4)';
                    setTimeout(() => {
                        emoji.style.transform = emoji.style.transform.replace(' scale(1.4)', ' scale(0.9)');
                        setTimeout(() => {
                            emoji.style.transform = emoji.style.transform.replace(' scale(0.9)', '');
                            emoji.style.transition = '';
                        }, 100);
                    }, 150);
                }
                
                // Small particle burst
                for (let i = 0; i < 5; i++) {
                    const particle = document.createElement('div');
                    particle.textContent = '✨';
                    Object.assign(particle.style, {
                        position: 'fixed',
                        left: this.currentX + '%',
                        top: this.currentY + '%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '16px',
                        pointerEvents: 'none',
                        zIndex: '5000',
                        opacity: '1',
                        transition: 'all 0.5s ease-out'
                    });
                    document.body.appendChild(particle);
                    
                    // Scatter outward
                    setTimeout(() => {
                        const angle = (i / 5) * Math.PI * 2;
                        const dist = 30 + Math.random() * 20;
                        particle.style.left = `calc(${this.currentX}% + ${Math.cos(angle) * dist}px)`;
                        particle.style.top = `calc(${this.currentY}% + ${Math.sin(angle) * dist}px)`;
                        particle.style.opacity = '0';
                    }, 50);
                    
                    setTimeout(() => particle.remove(), 600);
                }
            },
            
            completedHunt(target) {
                if (!target.isHunt) return;
                
                this.huntTargetMoving = false;
                
                // Check if we successfully caught something
                if (typeof MosquitoManager !== 'undefined') {
                    const wasInWeb = target.isSteal && MosquitoManager.state === 'stuck';
                    const wasFlying = MosquitoManager.state === 'flying';
                    
                    // For mid-air catch, check distance to ACTUAL bug
                    let caughtMidAir = false;
                    if (target.isAirCatch) {
                        const bugPos = this.getBugPosition();
                        if (bugPos && wasFlying) {
                            const dx = bugPos.x - this.currentX;
                            const dy = bugPos.y - this.currentY;
                            const distance = Math.sqrt(dx * dx + dy * dy);
                            // Generous catch radius (20% of screen)
                            caughtMidAir = distance < 20;
                        }
                        // Also catch if bug is still flying and we reached our target
                        if (!caughtMidAir && wasFlying) {
                            caughtMidAir = true;
                        }
                    }
                    
                    if (wasInWeb || caughtMidAir) {
                        // We caught/stole the bug!
                        const bugType = MosquitoManager.currentBug || MosquitoManager.type || '🦟';
                        
                        // Show chomp animation!
                        this.showChompEffect();
                        
                        // Use splat() to properly remove and show eaten effect
                        if (typeof MosquitoManager.splat === 'function') {
                            MosquitoManager.splat();
                        } else if (typeof MosquitoManager.remove === 'function') {
                            MosquitoManager.remove();
                        }
                        
                        // Grow bigger after eating!
                        this.growAfterEating();
                        
                        if (wasInWeb) {
                            // We stole from the spider!
                            this.stolenFood = true;
                            CreatureCoordinator.addEvent('batStoleFood');
                            CreatureCoordinator.modifyRelationship('spiderToBat', -30);
                            CreatureCoordinator.updateMood('ceilingSpider', 'angry');
                            
                            // Bat's reaction based on mood
                            const isApologetic = this.mood !== 'hungry' && Math.random() < 0.4;
                            this.say(isApologetic ? 'stoleBugSorry' : 'stoleBugSmug');
                            
                            if (!isApologetic) {
                                this.mood = 'smug';
                                CreatureCoordinator.updateMood('bat', 'smug');
                            }
                            
                            // Spider gets angry!
                            this.triggerSpiderAnger();
                        } else {
                            // Caught a flying bug mid-air!
                            // Use special mid-air catch dialogue
                            const midAirLines = GAME_DIALOGUE?.bat?.caughtMidAir;
                            if (midAirLines && midAirLines.length > 0) {
                                this.say(midAirLines[Math.floor(Math.random() * midAirLines.length)]);
                            } else {
                                const eatLines = GAME_DIALOGUE?.bat?.eating || {};
                                const eatText = eatLines[bugType] || eatLines.default || "Tasty!";
                                this.say(eatText);
                            }
                            this.mood = 'happy';
                            CreatureCoordinator.updateMood('bat', 'happy');
                        }
                    } else {
                        // Missed!
                        this.say('missed');
                    }
                }
            },
            
            triggerSpiderAnger() {
                const wrap = document.getElementById('spider-wrap');
                if (!wrap || !wrap.showBubble) return;
                
                // Spider reacts angrily
                setTimeout(() => {
                    const angryLines = GAME_DIALOGUE?.spider?.batStoleMyFood || ["HEY!"];
                    const angryText = angryLines[Math.floor(Math.random() * angryLines.length)];
                    wrap.showBubble(angryText, 'upside-down');
                    
                    // Spider body shakes with anger
                    const body = wrap.querySelector('#spider-body');
                    if (body) {
                        body.style.animation = 'shake 0.5s ease-in-out';
                        setTimeout(() => { body.style.animation = ''; }, 500);
                    }
                }, 800);
                
                // Floor spider might comment
                const floorAI = wrap.floorSpiderAI;
                if (floorAI && floorAI.element && floorAI.element.style.display !== 'none') {
                    setTimeout(() => {
                        floorAI.say('batStoleReaction');
                    }, 2000);
                }
                
                // Bat might apologize or react to anger
                setTimeout(() => {
                    if (this.mood !== 'smug') {
                        this.say('reactToAngrySpider');
                        // Improve relationship slightly with apology
                        CreatureCoordinator.modifyRelationship('spiderToBat', 10);
                    }
                }, 3000);
                
                // Spider might eventually forgive
                setTimeout(() => {
                    if (Math.random() < 0.5) {
                        const forgiveLine = GAME_DIALOGUE?.spider?.forgiveBat || ["Fine."];
                        const text = forgiveLine[Math.floor(Math.random() * forgiveLine.length)];
                        if (wrap.showBubble) wrap.showBubble(text, 'upside-down');
                        CreatureCoordinator.updateMood('ceilingSpider', 'grumpy');
                        CreatureCoordinator.modifyRelationship('spiderToBat', 15);
                    }
                }, 6000);
            },
            
            leave() {
                this.state = 'leaving';
                if (Math.random() < 0.4) this.say('leaving');
                
                const exits = [
                    { x: this.currentX, y: -15 }, { x: 115, y: this.currentY },
                    { x: this.currentX, y: 115 }, { x: -15, y: this.currentY }
                ];
                exits.sort((a, b) => {
                    const distA = Math.abs(a.x - this.currentX) + Math.abs(a.y - this.currentY);
                    const distB = Math.abs(b.x - this.currentX) + Math.abs(b.y - this.currentY);
                    return distA - distB;
                });
                
                this.flightPath = [{ ...exits[0], exit: true, speed: 0.3 }]; // Slower exit
                this.pathIndex = 0;
                this.fly();
            },
