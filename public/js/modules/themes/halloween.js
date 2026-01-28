/**
 * ============================================================================
 * HALLOWEEN THEME EFFECT - v2.7.0 (Improved Hunting + Floor Spider Activities)
 * ============================================================================
 * Interactive spider with AI behavior, animated web, and flying bats
 * Spider can hunt mosquitos from MosquitoManager
 * * UPDATE: "Turf War" & "Social Encounter" Logic
 * - Floor spider is Brown, Ceiling spider is Black.
 * - Usually, they avoid each other (Floor leaves before Ceiling drops).
 * - Occasionally, they meet, acknowledge each other, and chat.
 * * UPDATE: Bat z-index increased to fly OVER everything.
 * * v2.5: Echolocation radar, mid-air catching, bat grows when eating
 * * v2.6: Fixed dialogue size, no more "Splat!" when bat catches
 * * v2.7: Better hunting, web stealing, floor spider activities
 */

// Log version immediately so we know which file loaded
console.log('%c[Halloween] v2.7.0 Enhanced loaded! 🦇🎃🕷️', 'color: #ff6600; font-weight: bold; font-size: 14px;');

(function() {
'use strict';

// Store the real function so the stub can find it even if 05-effects.js loads after us
const halloweenMain = function(active) {
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
            // Clean up bat AI
            if (Effects.batAI) {
                Effects.batAI.destroy();
                Effects.batAI = null;
            }
            return;
        }

        // ====================================================================
        // CREATURE COORDINATOR - Manages screen density & relationships
        // ====================================================================
        if (!Effects.CreatureCoordinator) {
            Effects.CreatureCoordinator = {
                activeBat: null,
                batCooldown: false,
                floorSpiderActive: false,
                ceilingSpiderDropped: false,
                
                // Mood and relationship system
                moods: {
                    ceilingSpider: 'content', // content, happy, hungry, grumpy, angry
                    floorSpider: 'content',
                    bat: 'neutral' // neutral, playful, hungry, grumpy, smug
                },
                
                // Relationship tracking (-100 to 100)
                relationships: {
                    spiderToBat: 50,      // How ceiling spider feels about bat
                    batToSpider: 50,      // How bat feels about ceiling spider
                    floorToceiling: 70,   // Floor spider to ceiling spider (family!)
                    floorToBat: 50        // Floor spider to bat
                },
                
                // Track recent events for reactions
                recentEvents: [],
                
                addEvent(event) {
                    this.recentEvents.push({ type: event, time: Date.now() });
                    // Keep only last 10 events
                    if (this.recentEvents.length > 10) this.recentEvents.shift();
                },
                
                getRecentEvent(type, withinMs = 30000) {
                    const now = Date.now();
                    return this.recentEvents.find(e => e.type === type && (now - e.time) < withinMs);
                },
                
                // Modify relationship
                modifyRelationship(key, delta) {
                    if (this.relationships[key] !== undefined) {
                        this.relationships[key] = Math.max(-100, Math.min(100, this.relationships[key] + delta));
                    }
                },
                
                // Get relationship descriptor
                getRelationshipStatus(key) {
                    const val = this.relationships[key] || 0;
                    if (val >= 80) return 'friendly';
                    if (val >= 40) return 'neutral';
                    if (val >= 0) return 'wary';
                    if (val >= -50) return 'hostile';
                    return 'enemy';
                },
                
                // Update mood based on events
                updateMood(creature, newMood) {
                    this.moods[creature] = newMood;
                },
                
                canSpawnBat() {
                    if (this.ceilingSpiderDropped) return false;
                    if (this.batCooldown) return false;
                    return true;
                },
                
                batSpawned() {
                    this.activeBat = true;
                    this.batCooldown = true;
                },
                
                batDespawned() {
                    this.activeBat = null;
                    setTimeout(() => { this.batCooldown = false; }, 12000 + Math.random() * 18000);
                },
                
                spiderDropping() { this.ceilingSpiderDropped = true; },
                spiderRetreated() { this.ceilingSpiderDropped = false; }
            };
        }
        const CreatureCoordinator = Effects.CreatureCoordinator;

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
            isHanging: false, // Tracks if bat is currently napping upside-down
            
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
                    // Slightly higher hunt chance so the bat is more active
                    const huntChance = this.mood === 'hungry' ? 0.06 : 0.03;
                    if (Math.random() < huntChance) {
                        this.tryHunt();
                    }
                }
                
                // Check if we reached hunt target (use larger radius for air catches)
                const catchRadius = target.isAirCatch ? 22 : 12;
                
                // For air catches, check distance to ACTUAL bug position, not just waypoint
                if (target.isHunt && target.isAirCatch) {
                    const bugPos = this.getBugPosition();
                    if (bugPos && typeof MosquitoManager !== 'undefined' && MosquitoManager.state === 'flying') {
                        const bugDx = bugPos.x - this.currentX;
                        const bugDy = bugPos.y - this.currentY;
                        const bugDistance = Math.sqrt(bugDx * bugDx + bugDy * bugDy);
                        
                        // Catch if we're close enough to the actual bug
                        if (bugDistance < 28) {
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
                    // While napping, don't override the upside-down hang transform
                    if (emoji && !this.isHanging) {
                        emoji.style.transform = dx < 0 ? 'scaleX(-1)' : 'scaleX(1)';
                    }
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
                
                // Bat chooses how to greet the floor spider based on recent drama
                if (CreatureCoordinator.getRecentEvent('batStoleFood')) {
                    // If the bat recently stole from the ceiling spider, it may try to be extra charming with the floor spider
                    this.say('greetFloorSpider');
                } else {
                    this.say('greetFloorSpider');
                }
                
                // Floor spider might respond
                if (Math.random() < 0.6) {
                    setTimeout(() => {
                        const floorAI = document.getElementById('spider-wrap')?.floorSpiderAI;
                        if (floorAI && floorAI.say) {
                            // If the bat annoyed the ceiling spider, the floor spider's response is more likely to be a remark about it
                            if (CreatureCoordinator.getRecentEvent('batStoleFood') && Math.random() < 0.6) {
                                floorAI.say('batStoleReaction');
                                CreatureCoordinator.modifyRelationship('floorToBat', -5);
                            } else {
                                floorAI.say('greetBat');
                                CreatureCoordinator.modifyRelationship('floorToBat', 3);
                            }
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
                    this.isHanging = true;
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
                        this.isHanging = false;
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
                        
                        // Prefer "eating" style removal over a generic splat so the bat feels like it's really chomping
                        if (typeof MosquitoManager.eat === 'function') {
                            MosquitoManager.eat();
                        } else if (typeof MosquitoManager.remove === 'function') {
                            MosquitoManager.remove();
                        } else if (typeof MosquitoManager.splat === 'function') {
                            // Fallback if nothing else exists
                            MosquitoManager.splat();
                        }
                        
                        // Grow bigger after eating – mirrors the spider's belly growth
                        this.growAfterEating();
                        
                        if (wasInWeb) {
                            // We stole from the spider!
                            this.stolenFood = true;
                            CreatureCoordinator.addEvent('batStoleFood');
                            CreatureCoordinator.modifyRelationship('spiderToBat', -30);
                            // Floor spider is also a bit unimpressed with this behaviour
                            CreatureCoordinator.modifyRelationship('floorToBat', -10);
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
                                const eatText = eatLines[bugType] || eatLines.default || "NOM!";
                                this.say(eatText);
                            }
                            
                            // Successful solo hunts make the bat a bit happier and slightly friendlier towards the ceiling spider
                            CreatureCoordinator.modifyRelationship('batToSpider', 5);
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
                        // The more often this happens, the more the floor spider sides with the ceiling spider
                        CreatureCoordinator.modifyRelationship('floorToBat', -10);
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
            
            updatePosition() {
                if (!this.element) return;
                this.element.style.left = this.currentX + '%';
                this.element.style.top = this.currentY + '%';
            }
        };
        
        Effects.batAI = BatAI;
        
        // Spawn bat with intelligent timing
        const spawnBat = () => {
            if (!active) return;
            
            if (!CreatureCoordinator.canSpawnBat()) {
                Effects.batTimeout = setTimeout(spawnBat, 10000 + Math.random() * 12000);
                return;
            }
            
            const oldBat = document.getElementById('halloween-bat');
            if (oldBat) oldBat.remove();
            
            BatAI.init();
            
            Effects.batTimeout = setTimeout(() => {
                if (BatAI.element) BatAI.destroy();
                spawnBat();
            }, 50000);
        };
        
        Effects.batTimeout = setTimeout(spawnBat, 18000 + Math.random() * 22000);

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
                /* Bat animations */
                @keyframes bat-flap {
                    0%, 100% { transform: scaleX(1) scaleY(1); }
                    50% { transform: scaleX(0.7) scaleY(0.85); }
                }
                @keyframes bat-hang {
                    0%, 100% { transform: rotate(0deg) scale(1); }
                    50% { transform: rotate(3deg) scale(0.98); }
                }
                @keyframes bat-hang-sway {
                    0%, 100% { transform: rotate(180deg) scaleX(0.7) translateY(0); }
                    25% { transform: rotate(183deg) scaleX(0.7) translateY(2px); }
                    75% { transform: rotate(177deg) scaleX(0.7) translateY(-2px); }
                }
                @keyframes bat-startle {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.3) rotate(10deg); }
                    100% { transform: scale(1); }
                }
                /* Echolocation radar effect */
                @keyframes echolocation-pulse {
                    0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
                    100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
                }
                @keyframes echolocation-ping {
                    0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
                    50% { transform: translate(-50%, -50%) scale(2); opacity: 0.8; }
                    100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
                }
                .bat-echolocation-ring {
                    animation: echolocation-pulse 0.8s ease-out forwards;
                }
                .echolocation-ping {
                    animation: echolocation-ping 0.5s ease-out forwards;
                }
                .bat-body {
                    animation: bat-flap 0.2s ease-in-out infinite;
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
            moveSpeed: 150, // Slightly slower for more natural movement
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
            lastPauseTime: 0, // Track time since last pause for more natural pausing
            
            init(container) {
                this.element = container;
                this.bodyElement = container.querySelector('.floor-spider-body');
                this.currentX = window.innerWidth * 0.5;
                this.currentY = window.innerHeight - 80;
                this.behaviorCount = 0;
                this.maxBehaviors = 3 + Math.floor(Math.random() * 4); // Slightly fewer behaviors 
                this.updatePosition();
                if (Effects.CreatureCoordinator) Effects.CreatureCoordinator.floorSpiderActive = true;
            },
            
            say(textOrCategory) {
                if (!this.bodyElement || this.element.style.display === 'none') return;
                
                // Validate floor spider is visible and on screen
                const rect = this.bodyElement.getBoundingClientRect();
                if (rect.width === 0 || rect.height === 0) return;
                if (rect.top < -50 || rect.top > window.innerHeight + 50 ||
                    rect.left < -50 || rect.left > window.innerWidth + 50) return;
                
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
                    zIndex: '110',
                    left: '-9999px', top: '-9999px' // Start offscreen
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
                
                const floorSpider = this;
                const updatePos = () => {
                    if (!b.parentNode || !floorSpider.element || !floorSpider.bodyElement) return;
                    const rect = floorSpider.bodyElement.getBoundingClientRect();
                    
                    // Stop if spider is hidden
                    if (rect.width === 0 || rect.height === 0) {
                        b.style.opacity = '0';
                        return;
                    }
                    
                    const bubRect = b.getBoundingClientRect();
                    let left = rect.left + rect.width / 2 - bubRect.width / 2;
                    let top = rect.top - bubRect.height - 15;
                    
                    // Keep on screen
                    left = Math.max(10, Math.min(window.innerWidth - bubRect.width - 10, left));
                    top = Math.max(10, top);
                    
                    b.style.left = left + 'px';
                    b.style.top = top + 'px';
                    if (b.parentNode && b.style.opacity !== '0') requestAnimationFrame(updatePos);
                };
                
                // Wait for layout
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        b.style.opacity = '1';
                        updatePos();
                    });
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
                    // More natural pausing - check time since last pause
                    const timeSinceLastPause = now - this.lastPauseTime;
                    if (this.stepCount > 25 && timeSinceLastPause > 2500 && Math.random() < 0.012) {
                        this.lastPauseTime = now;
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
                        if (Effects.CreatureCoordinator) Effects.CreatureCoordinator.floorSpiderActive = false;
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
                    if (Math.random() < 0.3) this.say('arriving');
                    if (onComplete) onComplete();
                    return;
                }
                
                // More variable speed for organic movement
                const speedVariation = 0.7 + Math.random() * 0.5;
                const currentSpeed = this.moveSpeed * speedVariation;
                const slowdownDistance = 120;
                const speedMultiplier = (this.state !== 'leaving' && distance < slowdownDistance) ? 0.25 + (distance / slowdownDistance) * 0.75 : 1;
                const moveDistance = currentSpeed * deltaTime * speedMultiplier;
                const ratio = Math.min(moveDistance / distance, 1);
                // More pronounced wobble for natural feel
                const wobble = Math.sin(now / 45) * 0.6;
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
                
                if (action < 0.10) {
                    // Think/pause behavior
                    this.think(() => { setTimeout(() => this.doBehavior(), 500 + Math.random() * 1000); });
                } else if (action < 0.18) {
                    // Explore corner - spider investigates a corner curiously
                    this.exploreCorner();
                } else if (action < 0.25) {
                    // Find something interesting on the ground
                    this.findSomething();
                } else if (action < 0.32) {
                    // Look up at ceiling spider or bat
                    this.lookUp();
                } else if (action < 0.38) {
                    // Do a little spin/dance
                    this.doSpin();
                } else {
                    // Normal movement to random destination
                    const dest = this.chooseDestination();
                    this.moveTo(dest.x, dest.y, () => {
                        const waitTime = 1500 + Math.random() * 3000;
                        setTimeout(() => this.doBehavior(), waitTime);
                    });
                }
            },
            
            // New behavior: explore a corner
            exploreCorner() {
                this.state = 'exploring';
                const corners = [
                    { x: 60, y: window.innerHeight - 60 },
                    { x: window.innerWidth - 60, y: window.innerHeight - 60 },
                    { x: 60, y: window.innerHeight - 150 },
                    { x: window.innerWidth - 60, y: window.innerHeight - 150 }
                ];
                const corner = corners[Math.floor(Math.random() * corners.length)];
                
                this.say('exploring');
                this.moveTo(corner.x, corner.y, () => {
                    // Arrived at corner, look around
                    if (this.bodyElement) {
                        this.bodyElement.classList.add('looking');
                    }
                    setTimeout(() => {
                        if (this.bodyElement) this.bodyElement.classList.remove('looking');
                        if (Math.random() < 0.5) this.say('commentary');
                        this.state = 'idle';
                        setTimeout(() => this.doBehavior(), 1000 + Math.random() * 2000);
                    }, 1500 + Math.random() * 1500);
                });
            },
            
            // New behavior: find something on the ground
            findSomething() {
                this.state = 'finding';
                const things = ['🪨', '🍂', '🌰', '✨', '🔮', '💀'];
                const thing = things[Math.floor(Math.random() * things.length)];
                
                // Move to a random spot
                const dest = this.chooseDestination();
                this.moveTo(dest.x, dest.y, () => {
                    // "Find" something
                    if (this.bodyElement) {
                        this.bodyElement.classList.add('paused');
                    }
                    
                    // Show the found item briefly
                    const foundEl = document.createElement('div');
                    foundEl.textContent = thing;
                    Object.assign(foundEl.style, {
                        position: 'fixed',
                        left: this.currentX + 'px',
                        top: (this.currentY + 20) + 'px',
                        fontSize: '20px',
                        opacity: '0',
                        transform: 'scale(0.5)',
                        transition: 'all 0.3s ease-out',
                        pointerEvents: 'none',
                        zIndex: '999'
                    });
                    document.body.appendChild(foundEl);
                    
                    setTimeout(() => {
                        foundEl.style.opacity = '1';
                        foundEl.style.transform = 'scale(1)';
                    }, 50);
                    
                    setTimeout(() => {
                        this.say('foundSomething');
                        if (this.bodyElement) this.bodyElement.classList.remove('paused');
                    }, 500);
                    
                    setTimeout(() => {
                        foundEl.style.opacity = '0';
                        foundEl.style.transform = 'scale(0.5) translateY(-20px)';
                        setTimeout(() => foundEl.remove(), 300);
                        this.state = 'idle';
                        setTimeout(() => this.doBehavior(), 1500 + Math.random() * 2000);
                    }, 2500);
                });
            },
            
            // New behavior: look up at ceiling
            lookUp() {
                this.state = 'lookingUp';
                if (this.bodyElement) {
                    this.bodyElement.classList.add('looking');
                }
                
                // Comment on what's above
                const hasBat = document.getElementById('halloween-bat');
                const hasWeb = document.getElementById('spider-wrap');
                
                setTimeout(() => {
                    if (hasBat && Math.random() < 0.6) {
                        this.say('seeBat');
                    } else if (hasWeb) {
                        this.say('seeWeb');
                    } else {
                        this.say('lookingAround');
                    }
                    
                    setTimeout(() => {
                        if (this.bodyElement) this.bodyElement.classList.remove('looking');
                        this.state = 'idle';
                        setTimeout(() => this.doBehavior(), 1000 + Math.random() * 1500);
                    }, 2000);
                }, 800);
            },
            
            // New behavior: do a little spin
            doSpin() {
                this.state = 'spinning';
                if (this.bodyElement) {
                    this.bodyElement.style.transition = 'transform 0.6s ease-in-out';
                    const currentScale = this.facingRight ? 'scaleX(1)' : 'scaleX(-1)';
                    this.bodyElement.style.transform = currentScale + ' rotate(360deg)';
                    
                    setTimeout(() => {
                        this.bodyElement.style.transform = currentScale;
                        this.bodyElement.style.transition = '';
                        
                        if (Math.random() < 0.4) this.say('happy');
                        this.state = 'idle';
                        setTimeout(() => this.doBehavior(), 800 + Math.random() * 1200);
                    }, 700);
                } else {
                    this.state = 'idle';
                    setTimeout(() => this.doBehavior(), 500);
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
                
                // Make sure spider body is visible and positioned
                const spiderRect = body.getBoundingClientRect();
                if (spiderRect.width === 0 || spiderRect.height === 0) {
                    return null; // Spider not visible, don't show bubble
                }
                
                // Don't show bubble if spider is off-screen
                if (spiderRect.top < -50 || spiderRect.top > window.innerHeight + 50 ||
                    spiderRect.left < -50 || spiderRect.left > window.innerWidth + 50) {
                    return null;
                }
                
                const b = document.createElement('div');
                b.id = 'spider-bubble-dynamic';
                Object.assign(b.style, {
                    position: 'fixed',
                    background: 'white', color: '#1f2937', padding: '8px 14px',
                    borderRadius: '16px', fontSize: '14px', fontWeight: 'bold',
                    fontFamily: 'sans-serif', whiteSpace: 'nowrap', width: 'max-content',
                    pointerEvents: 'none', opacity: '0', transition: 'opacity 0.2s',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)', border: '2px solid #1f2937',
                    zIndex: '110', willChange: 'top, left',
                    left: '-9999px', top: '-9999px' // Start offscreen until positioned
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
                    if (!b.parentNode || !body) return; 
                    const spiderRect = body.getBoundingClientRect();
                    
                    // Stop updating if spider is gone or hidden
                    if (spiderRect.width === 0 || spiderRect.height === 0) {
                        b.style.opacity = '0';
                        return;
                    }
                    
                    const bubRect = b.getBoundingClientRect();
                    const currentTransform = body.style.transform || '';
                    const gap = 15;
                    let rotation = 0;
                    if (currentTransform.includes('180deg')) rotation = 180;
                    
                    let top, left;
                    if (rotation === 180 || type === 'upside-down') {
                        // Bubble below spider (spider is upside down/dropped)
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
                    
                    // Keep on screen
                    if (left < 10) left = 10;
                    if (left + bubRect.width > window.innerWidth - 10) left = window.innerWidth - bubRect.width - 10;
                    if (top < 10) top = spiderRect.bottom + gap; // Flip to below if too high
                    if (top + bubRect.height > window.innerHeight - 10) top = spiderRect.top - bubRect.height - gap;
                    
                    b.style.top = `${top}px`;
                    b.style.left = `${left}px`;
                    b.rafId = requestAnimationFrame(updatePosition);
                };
                
                // Wait two frames for layout to complete before showing
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        b.style.opacity = '1';
                        updatePosition();
                    });
                });
                
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
                    // Longer delays between floor spider appearances
                    const reentryDelay = 25000 + Math.random() * 35000;
                    Effects.floorSpiderTimeout = setTimeout(() => {
                        if (document.body.contains(floorSpider)) {
                            if (wrap && wrap.classList.contains('hunting')) { scheduleReentry(); return; }
                            // Don't enter if bat is active
                            if (Effects.CreatureCoordinator && Effects.CreatureCoordinator.activeBat) { scheduleReentry(); return; }
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
                
                // Longer initial delay before floor spider first appears
                setTimeout(() => {
                    if (document.body.contains(floorSpider)) floorSpiderAI.doBehavior();
                }, 8000);
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
            
            // Track that ceiling spider is dropping
            if (Effects.CreatureCoordinator) Effects.CreatureCoordinator.spiderDropping();
            
            // LOGIC: Check if floor spider is home
            const isFloorSpiderHome = floorSpiderAI.state !== 'gone' && floorSpiderAI.state !== 'leaving' && floorSpiderAI.state !== 'entering' && floorSpiderAI.element.style.display !== 'none';
            
            // 25% chance they meet, if floor spider is home. Otherwise, turf war.
            const triggerMeeting = isFloorSpiderHome && Math.random() < 0.25;

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

            // Determine conversation type based on moods and randomness
            const conversationType = Math.random();
            const isDeepConversation = conversationType < 0.15; // 15% chance of philosophical exchange
            const isPlayful = conversationType >= 0.15 && conversationType < 0.4;
            
            setTimeout(() => {
                let topText = "Hello!";
                let botText = "Hi!";
                let followUpTop = null;
                let followUpBot = null;
                
                if (typeof GAME_DIALOGUE !== 'undefined' && GAME_DIALOGUE.spider) {
                    if (isDeepConversation) {
                        // Philosophical/meaningful exchange
                        if (GAME_DIALOGUE.spider.wisdomToFloor) {
                            const w = GAME_DIALOGUE.spider.wisdomToFloor;
                            topText = w[Math.floor(Math.random() * w.length)];
                        }
                        if (GAME_DIALOGUE.spider.wisdomFromFloor) {
                            const w = GAME_DIALOGUE.spider.wisdomFromFloor;
                            botText = w[Math.floor(Math.random() * w.length)];
                        }
                        // Maybe a philosophical follow-up
                        if (Math.random() < 0.5 && GAME_DIALOGUE.spider.philosophical) {
                            const p = GAME_DIALOGUE.spider.philosophical;
                            followUpTop = p[Math.floor(Math.random() * p.length)];
                        }
                    } else if (isPlayful) {
                        // Playful banter
                        if (GAME_DIALOGUE.spider.playfulToBat) {
                            // Reuse playful dialogue
                            const p = GAME_DIALOGUE.spider.meetingTop;
                            topText = p[Math.floor(Math.random() * p.length)];
                        }
                        if (GAME_DIALOGUE.spider.meetingBottom) {
                            const b = GAME_DIALOGUE.spider.meetingBottom;
                            botText = b[Math.floor(Math.random() * b.length)];
                        }
                    } else {
                        // Normal greeting
                        if (GAME_DIALOGUE.spider.meetingTop) {
                            const t = GAME_DIALOGUE.spider.meetingTop;
                            topText = t[Math.floor(Math.random() * t.length)];
                        }
                        if (GAME_DIALOGUE.spider.meetingBottom) {
                            const b = GAME_DIALOGUE.spider.meetingBottom;
                            botText = b[Math.floor(Math.random() * b.length)];
                        }
                    }
                    
                    // Check for mood-based responses
                    const ceilingMood = CreatureCoordinator.moods.ceilingSpider;
                    if (ceilingMood === 'angry' && CreatureCoordinator.getRecentEvent('batStoleFood')) {
                        // Still upset about the bat
                        topText = "That bat... unbelievable.";
                        botText = "I saw. Rough.";
                    }
                }
                
                // Improve relationship when they talk
                CreatureCoordinator.modifyRelationship('floorToceiling', 5);
                
                if(wrap.showBubble) wrap.showBubble(topText, 'upside-down');
                
                setTimeout(() => {
                    floorSpiderAI.say(botText);
                    
                    // Extended conversation if deep
                    if (followUpTop) {
                        setTimeout(() => {
                            if(wrap.showBubble) wrap.showBubble(followUpTop, 'upside-down');
                            
                            // Floor spider contemplates
                            setTimeout(() => {
                                floorSpiderAI.say("...indeed.");
                                
                                setTimeout(() => {
                                    // Retreat after deep conversation
                                    body.classList.remove('spider-idle');
                                    thread.style.height = '0';
                                    if (Effects.CreatureCoordinator) Effects.CreatureCoordinator.spiderRetreated();
                                    floorSpiderAI.resumeAfterMeeting();
                                    Effects.spiderTimeout = setTimeout(runDrop, 25000 + Math.random() * 30000);
                                }, 2000);
                            }, 1500);
                        }, 2000);
                    } else {
                        setTimeout(() => {
                            // Retreat
                            body.classList.remove('spider-idle');
                            thread.style.height = '0';
                            if (Effects.CreatureCoordinator) Effects.CreatureCoordinator.spiderRetreated();
                            floorSpiderAI.resumeAfterMeeting();
                            
                            // Longer delay before next drop
                            Effects.spiderTimeout = setTimeout(runDrop, 22000 + Math.random() * 25000);
                        }, 2000);
                    }
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
                const spiderMood = CreatureCoordinator.moods.ceilingSpider;
                
                if (typeof GAME_DIALOGUE !== 'undefined' && GAME_DIALOGUE.spider) {
                    // Check mood for appropriate response
                    if (spiderMood === 'angry' && CreatureCoordinator.getRecentEvent('batStoleFood')) {
                        text = "Still thinking about that bat...";
                    } else if (spiderMood === 'grumpy') {
                        const grumpyLines = GAME_DIALOGUE.spider.moodResponses?.grumpy || ["Hmph."];
                        text = grumpyLines[Math.floor(Math.random() * grumpyLines.length)];
                    } else if (spiderMood === 'happy') {
                        const happyLines = GAME_DIALOGUE.spider.moodResponses?.happy || ["Great day!"];
                        text = happyLines[Math.floor(Math.random() * happyLines.length)];
                    } else if (spiderMood === 'hungry') {
                        const hungryLines = GAME_DIALOGUE.spider.moodResponses?.hungry || ["So hungry..."];
                        text = hungryLines[Math.floor(Math.random() * hungryLines.length)];
                    } else {
                        // Normal - use time-based messages
                        text = GAME_DIALOGUE.spider.getIdlePhrase ? GAME_DIALOGUE.spider.getIdlePhrase() : 'Boo!';
                    }
                }
                
                if(wrap.showBubble) wrap.showBubble(text, 'upside-down');
                
                // Check if bat is around and react
                if (Effects.batAI && Effects.batAI.element) {
                    const batX = Effects.batAI.currentX;
                    const batY = Effects.batAI.currentY;
                    const spiderX = parseFloat(wrap.style.left);
                    
                    // If bat is reasonably close
                    if (Math.abs(batX - spiderX) < 30 && batY < 60) {
                        setTimeout(() => {
                            // Spider acknowledges bat
                            const relationship = CreatureCoordinator.getRelationshipStatus('spiderToBat');
                            let reactionKey = relationship === 'friendly' ? 'greetBatFriendly' : 'greetBatGrumpy';
                            
                            if (CreatureCoordinator.getRecentEvent('batStoleFood')) {
                                reactionKey = 'batStoleFollowUp';
                            }
                            
                            const lines = GAME_DIALOGUE?.spider?.[reactionKey] || ["Oh, you."];
                            const reactionText = lines[Math.floor(Math.random() * lines.length)];
                            if(wrap.showBubble) wrap.showBubble(reactionText, 'upside-down');
                        }, 2500);
                    }
                }
                
                setTimeout(() => {
                    if (wrap.classList.contains('hunting')) return;
                    body.classList.remove('spider-idle');
                    thread.style.height = '0';
                    // Track that spider has retreated
                    if (Effects.CreatureCoordinator) Effects.CreatureCoordinator.spiderRetreated();
                    
                    // Gradually improve mood over time
                    if (spiderMood === 'angry') {
                        CreatureCoordinator.updateMood('ceilingSpider', 'grumpy');
                    } else if (spiderMood === 'grumpy' && Math.random() < 0.3) {
                        CreatureCoordinator.updateMood('ceilingSpider', 'content');
                    }
                    
                    // Longer intervals between drops
                    Effects.spiderTimeout = setTimeout(runDrop, 20000 + Math.random() * 25000);
                    
                }, 4000);
            }, 2500);
        };

        // Longer initial delay before first drop
        Effects.spiderTimeout = setTimeout(runDrop, 10000);


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
    };

// Store as _halloweenReal so the stub can call it
Effects._halloweenReal = halloweenMain;
// Also set as the main function
Effects.halloween = halloweenMain;

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

// Auto-initialize if halloween theme is active
// Check current theme and start if we're the active theme
setTimeout(() => {
    try {
        const saved = localStorage.getItem('gw_settings');
        if (saved) {
            const settings = JSON.parse(saved);
            if (settings.theme === 'halloween') {
                console.log('[Halloween] Auto-starting theme...');
                Effects.halloween(true);
            }
        }
    } catch (e) {
        console.warn('[Halloween] Could not check theme:', e);
    }
}, 100);

console.log('%c[Theme: Halloween] Loaded', 'color: #f97316');

})();
