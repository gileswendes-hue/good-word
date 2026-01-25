/**
 * ============================================================================
 * HALLOWEEN THEME EFFECT
 * ============================================================================
 * Interactive spider with AI behavior, animated web, and flying bats
 * Spider can hunt mosquitos from MosquitoManager
 */

(function() {
'use strict';

Effects.halloween = function(active) {
        if (Effects.spiderTimeout) clearTimeout(Effects.spiderTimeout);
        if (Effects.webRaf) cancelAnimationFrame(Effects.webRaf);
        if (Effects.batTimeout) clearTimeout(Effects.batTimeout);
        const isSafeMode = State.data.settings.arachnophobiaMode;
        if (!active || isSafeMode) {
            const old = document.getElementById('spider-wrap');
            if (old) old.remove();
            const oldWeb = document.getElementById('spider-web-corner');
            if (oldWeb) oldWeb.remove();
            const style = document.getElementById('spider-motion-style');
            if (style) style.remove();
            const oldBat = document.getElementById('halloween-bat');
            if (oldBat) oldBat.remove();
            return;
        }
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
            bat.style.cssText = `
                position: fixed;
                left: ${startX}%;
                top: ${startY}%;
                z-index: 101;
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
        if (!document.getElementById('spider-motion-style')) {
            const s = document.createElement('style');
            s.id = 'spider-motion-style';
            s.innerHTML = `
                @keyframes spider-idle-wiggle {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(2deg); }
                }
                @keyframes spider-moving {
                    0%, 100% { transform: rotate(-1deg); }
                    50% { transform: rotate(1deg); }
                }
                @keyframes spider-pause-wiggle {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(3deg); }
                }
                .scuttling-motion {
                    animation: spider-moving 0.8s infinite ease-in-out;
                }
                .spider-paused {
                    animation: spider-pause-wiggle 1s ease-in-out;
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
            `;
            document.head.appendChild(s);
        }
        const spiderScuttle = {
            active: false,
            targetX: 50,
            currentX: 50,
            start(wrap, body, targetPercent, onComplete) {
                this.active = true;
                this.targetX = targetPercent;
                this.currentX = parseFloat(wrap.style.left) || 50;
                body.classList.add('scuttling-motion');
                wrap.style.transition = 'left 2s ease-in-out';
                wrap.style.left = targetPercent + '%';
                setTimeout(() => {
                    this.currentX = targetPercent;
                    this.stop(body, onComplete);
                }, 2000);
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
        let wrap = document.getElementById('spider-wrap');
        if (!wrap) {
            wrap = document.createElement('div');
            wrap.id = 'spider-wrap';
            wrap.spiderScuttle = spiderScuttle; // Attach for external access
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
            const fontSize = (3 + (cappedEaten * 0.6)).toFixed(2); // 3rem -> 6rem over 5 bugs
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
    const showSpiderBubble = (text) => {
                const old = document.getElementById('spider-bubble-dynamic');
                if (old) {
                    if (old.rafId) cancelAnimationFrame(old.rafId);
                    old.remove();
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
                    zIndex: '110',
                    willChange: 'top, left'
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
                    if (!b.parentNode) return; // Stop if removed
                    const spiderRect = body.getBoundingClientRect();
                    const bubRect = b.getBoundingClientRect();
                    const currentTransform = body.style.transform || '';
                    const gap = 15;
                    let rotation = 0;
                    if (currentTransform.includes('180deg')) rotation = 180;
                    else if (currentTransform.includes('90deg') && !currentTransform.includes('-90deg')) rotation = 90;
                    else if (currentTransform.includes('-90deg')) rotation = -90;
                    let top, left;
                    if (rotation === 0) {
                        top = spiderRect.top - bubRect.height - gap;
                        left = spiderRect.left + (spiderRect.width / 2) - (bubRect.width / 2);
                        Object.assign(arrow.style, {
                            bottom: '-8px', left: '50%', right: 'auto', top: 'auto',
                            transform: 'translateX(-50%) translateY(0)',
                            borderWidth: '8px 8px 0 8px',
                            borderColor: '#1f2937 transparent transparent transparent'
                        });
                    }
                    else if (rotation === 180) {
                        top = spiderRect.bottom + gap;
                        left = spiderRect.left + (spiderRect.width / 2) - (bubRect.width / 2);
                        Object.assign(arrow.style, {
                            top: '-8px', left: '50%', right: 'auto', bottom: 'auto',
                            transform: 'translateX(-50%) translateY(0)',
                            borderWidth: '0 8px 8px 8px',
                            borderColor: 'transparent transparent #1f2937 transparent'
                        });
                    }
                    else if (rotation === 90) {
                        top = spiderRect.top + (spiderRect.height / 2) - (bubRect.height / 2);
                        left = spiderRect.left - bubRect.width - gap;
                        Object.assign(arrow.style, {
                            right: '-8px', top: '50%', left: 'auto', bottom: 'auto',
                            transform: 'translateY(-50%) translateX(0)',
                            borderWidth: '8px 0 8px 8px',
                            borderColor: 'transparent transparent transparent #1f2937'
                        });
                    }
                    else if (rotation === -90) {
                        top = spiderRect.top + (spiderRect.height / 2) - (bubRect.height / 2);
                        left = spiderRect.right + gap;
                        Object.assign(arrow.style, {
                            left: '-8px', top: '50%', right: 'auto', bottom: 'auto',
                            transform: 'translateY(-50%) translateX(0)',
                            borderWidth: '8px 8px 8px 0',
                            borderColor: 'transparent #1f2937 transparent transparent'
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
                requestAnimationFrame(() => {
                    b.style.opacity = '1';
                    updatePosition();
                });
                setTimeout(() => {
                    if (b.parentNode) {
                        b.style.opacity = '0';
                        setTimeout(() => {
                            if (b.rafId) cancelAnimationFrame(b.rafId);
                            b.remove();
                        }, 300);
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
                showSpiderBubble(text);
                body.style.animation = 'shake 0.3s ease-in-out';
                if (willFall) {
                    if (Effects.spiderTimeout) clearTimeout(Effects.spiderTimeout);
                    setTimeout(() => { Effects.spiderFall(wrap, thread, body); }, 400);
                } else {
                    setTimeout(() => { body.style.animation = ''; }, 2000);
                }
            };
        }
        const body = wrap.querySelector('#spider-body');
        const thread = wrap.querySelector('#spider-thread');
        const scuttle = wrap.spiderScuttle;
const anchor = wrap.querySelector('#spider-anchor');
        const currentBody = wrap.querySelector('#spider-body'); // Ensure we have the body
        if (anchor && currentBody) {
            const eaten = State.data.insectStats.eaten || 0;
            let scale = Math.min(0.7 + (eaten * 0.05), 2.0);
            const isFull = Date.now() < (State.data.spiderFullUntil || 0);
            if (isFull) {
                scale = scale * 1.6; // Max fatness (60% bigger)
                currentBody.classList.add('spider-fat');
            } else {
                const recentBugs = State.data.spiderEatLog ? State.data.spiderEatLog.length : 0;
                scale = scale * (1 + (recentBugs * 0.20));
                currentBody.classList.remove('spider-fat');
            }
            anchor.style.transform = `scale(${scale.toFixed(2)})`;
        }
        const runDrop = () => {
            if (!document.body.contains(wrap)) return;
            if (wrap.classList.contains('hunting')) return;
            if (scuttle) scuttle.cancel(body);
            const actionRoll = Math.random();
            body.style.transform = 'rotate(0deg)';
            body.classList.remove('scuttling-motion', 'spider-paused', 'spider-idle');
            thread.style.opacity = '1';
            if (actionRoll < 0.7) {
                const safeLeft = Math.random() * 60 + 20;
                if (scuttle) {
                    scuttle.start(wrap, body, safeLeft, () => {
                        if (wrap.classList.contains('hunting')) return;
                        body.style.transform = 'rotate(180deg)';
                        body.classList.add('spider-idle');
                        thread.style.transition = 'height 2.5s ease-in-out';
                        thread.style.height = '18vh';
                        setTimeout(() => {
                             if (wrap.classList.contains('hunting')) return;
                             let text = 'Boo!';
                             if (typeof GAME_DIALOGUE !== 'undefined' && GAME_DIALOGUE.spider) {
                                 if (typeof GAME_DIALOGUE.spider.getIdlePhrase === 'function') {
                                     text = GAME_DIALOGUE.spider.getIdlePhrase();
                                 } else if (GAME_DIALOGUE.spider.idle) {
                                     const phrases = Array.isArray(GAME_DIALOGUE.spider.idle) ? GAME_DIALOGUE.spider.idle : ['Boo!', 'Hi!', '🕷️'];
                                     text = phrases[Math.floor(Math.random() * phrases.length)];
                                 }
                             }
                             if(wrap.showBubble) wrap.showBubble(text, 'upside-down');
                             setTimeout(() => {
                                 if (wrap.classList.contains('hunting')) return;
                                 body.classList.remove('spider-idle');
                                 thread.style.height = '0';
                                 Effects.spiderTimeout = setTimeout(runDrop, Math.random() * 5000 + 5000);
                             }, 2500);
                        }, 2500);
                    });
                }
                return;
            }
            if (actionRoll < 0.9) {
                const isLeft = Math.random() > 0.5;
                const wallX = isLeft ? 5 : 85;
                if (scuttle) {
                    scuttle.start(wrap, body, wallX, () => {
                        if (wrap.classList.contains('hunting')) return;
                        thread.style.opacity = '0';
                        body.style.transform = `rotate(${isLeft ? 90 : -90}deg)`;
                        const climbDepth = Math.random() * 40 + 30;
                        thread.style.transition = 'height 4s ease-in-out';
                        thread.style.height = climbDepth + 'vh';
                        setTimeout(() => {
                             if (wrap.classList.contains('hunting')) return;
                             thread.style.height = '0';
                             setTimeout(() => {
                                 body.style.transform = 'rotate(0deg)';
                                 thread.style.opacity = '1';
                                 Effects.spiderTimeout = setTimeout(runDrop, Math.random() * 5000 + 5000);
                             }, 4000);
                        }, 5000);
                    });
                }
                return;
            }
            const safeLeft = Math.random() * 60 + 20;
            if (scuttle) {
                scuttle.start(wrap, body, safeLeft, () => {
                    runDrop();
                });
            }
        };
        Effects.spiderTimeout = setTimeout(runDrop, 1000);
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
                }, 1500);
            }, 1000); // Wait for drop
            return; // Stop here, don't hunt normally
        }
        const thread = wrap.querySelector('#spider-thread');
        const body = wrap.querySelector('#spider-body');
        const scuttle = wrap.spiderScuttle;
        const anchor = wrap.querySelector('#spider-anchor');
        if (anchor && body) {
            const eaten = State.data.insectStats.eaten || 0;
            let scale = Math.min(0.7 + (eaten * 0.05), 2.0); // Base size
            const isFull = Date.now() < (State.data.spiderFullUntil || 0);
            if (isFull) {
                scale = scale * 1.6; // Max fatness (60% bigger)
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
        const currentX = parseFloat(wrap.style.left) || 50;
        wrap.style.transition = 'left 1s ease-in-out';
        wrap.style.left = destX + '%';
        setTimeout(() => {
            body.classList.remove('hunting-scuttle');
            const anchor = document.getElementById('spider-anchor');
            let scale = 1;
            if (anchor && anchor.style.transform) {
                const match = anchor.style.transform.match(/scale\(([^)]+)\)/);
                if (match) scale = parseFloat(match[1]);
            }
            // Spider wrap is at top: -15vh, so thread must drop (15 + destY) vh to reach destY vh
            // The spider body has margin-top: -10px, so add ~1vh to compensate
            const dropVH = 15 + destY + 1;
            thread.style.transition = 'none';
            thread.style.height = '0';
            void thread.offsetWidth; // Force reflow
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
                            const newFontSize = baseFontSize + (cappedBugs * 0.6); // 3rem -> 6rem over 5 bugs
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
                }, 2000); // Wait for drop animation
            }, 1000); // Wait for horizontal movement
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
            Effects.halloween(true);
        }, parseFloat(duration) * 1000);
    },

console.log('%c[Theme: Halloween] Loaded', 'color: #f97316');

})();
