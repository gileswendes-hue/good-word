const GAME_DIALOGUE = {
    // What the insects say when saved
    insects: {
        "🐞": "Lucky escape!",
        "🐝": "Buzz off!",
        "🦟": "Phew!",
        "🪲": "GET TO THE CHOPPA!"
    },

    // ========================================================================
    // BAT DIALOGUE
    // ========================================================================
    bat: {
        idle: {
            morning: [
                "Ugh, it's bright out...",
                "Five more hours...",
                "Why am I awake?",
                "The sun is my enemy.",
                "Vampires don't do mornings.",
                "Need my beauty sleep.",
                "Is it dusk yet?",
                "Too early for this."
            ],
            afternoon: [
                "*yawn*",
                "Still not nighttime...",
                "Just passing through.",
                "Zzz... huh? What?",
                "Looking for shade.",
                "Wrong time zone.",
                "Midday crisis.",
                "The cave was cozier."
            ],
            evening: [
                "Now we're talking!",
                "Prime time baby!",
                "The hunt begins!",
                "Dusk is beautiful.",
                "Echolocation: ON",
                "Moths, beware!",
                "Evening flight!",
                "My favorite hour!"
            ],
            night: [
                "This is MY time!",
                "Night owl? Night BAT!",
                "Hunting mode: ACTIVE",
                "The darkness embraces me.",
                "Sonar says... BUGS!",
                "Midnight snack time!",
                "Who needs daylight?",
                "Boo!",
                "Peak performance hours.",
                "The stars are lovely.",
                "Stealth mode engaged.",
                "I can see you~"
            ]
        },

        getIdlePhrase() {
            const hour = new Date().getHours();
            let timeKey;
            if (hour >= 5 && hour < 12) timeKey = 'morning';
            else if (hour >= 12 && hour < 17) timeKey = 'afternoon';
            else if (hour >= 17 && hour < 21) timeKey = 'evening';
            else timeKey = 'night';
            
            const phrases = GAME_DIALOGUE.bat.idle[timeKey];
            return phrases[Math.floor(Math.random() * phrases.length)];
        },

        flying: [
            "Wheee!",
            "Coming through!",
            "Flap flap flap~",
            "*swoosh*",
            "Watch your head!",
            "Air traffic!",
            "Bat signal!",
            "Night flight!",
            "Echolocation ping!",
            "*sonic squeak*",
            "Above you!",
            "Just vibing."
        ],

        hunting: [
            "Target acquired!",
            "Dinner time!",
            "Got one!",
            "Intercepting!",
            "Lock on!",
            "MINE!",
            "Bug detected!",
            "Snack attack!",
            "Going in hot!",
            "Echolocation: HIT!"
        ],

        eating: {
            "🐞": "Crunchy wings!",
            "🐝": "Spicy! Worth it.",
            "🦟": "Easy pickings!",
            "🪲": "Protein!",
            "🦋": "Delicate flavor~",
            default: "Tasty!"
        },

        // Specifically for mid-air catches
        caughtMidAir: [
            "Got it! Mid-air!",
            "Aerial snack!",
            "Echolocation: PERFECT!",
            "Snatched!",
            "Air-to-air interception!",
            "Skill shot!",
            "Nothing escapes me!",
            "Too easy!"
        ],

        missed: [
            "Drat!",
            "It got away!",
            "Next time...",
            "My echolocation needs calibrating.",
            "Wind threw me off.",
            "Lucky bug.",
            "I wasn't even hungry.",
            "Technical difficulties."
        ],

        startHunt: [
            "Ooh, what's that?",
            "Movement detected!",
            "Snack incoming!",
            "Don't mind if I do~",
            "Bug spotted!",
            "Hello, dinner!"
        ],

        // When resting/hanging
        resting: [
            "Nice spot.",
            "*hangs upside down*",
            "Just chilling.",
            "Taking five.",
            "Good perch.",
            "Scenic view.",
            "Don't mind me.",
            "Stretching my wings."
        ],

        // When leaving
        leaving: [
            "Gotta fly!",
            "Off I go!",
            "See ya!",
            "Places to be!",
            "Exit stage... up!",
            "Byeee!",
            "Back to the cave!",
            "Time to vanish."
        ],

        poked: [
            "Hey!",
            "Rude!",
            "I'm flying here!",
            "Watch it!",
            "Personal space!",
            "Do I poke you?",
            "*startled squeak*",
            "Not cool."
        ],

        // ====== SPIDER INTERACTION DIALOGUE ======
        
        // Greeting the ceiling spider
        greetSpider: [
            "Hey, eight-legs!",
            "Nice web up there!",
            "Fellow night hunter!",
            "Hanging around?",
            "Web looks good today!",
            "Catch anything lately?",
            "Respect the hustle!",
            "Staying sticky?"
        ],

        // Greeting the floor spider
        greetFloorSpider: [
            "Hey ground crawler!",
            "Watch your step down there!",
            "Floor patrol, huh?",
            "Nice legs! All eight of them.",
            "Keeping it low-key?",
            "Ground control!",
            "Scuttling along nicely!"
        ],

        // When bat steals spider's food
        stoleBugSmug: [
            "Yoink! Mine now!",
            "Thanks for spotting it!",
            "Finders keepers!",
            "Too slow, web-head!",
            "Air superiority!",
            "Snooze you lose!",
            "I'll take that!",
            "Consider it a tip!"
        ],

        // Apologetic after stealing (if mood is friendly)
        stoleBugSorry: [
            "Sorry, instinct!",
            "I owe you one...",
            "My bad, I was hungry!",
            "Reflex! Sorry!",
            "I'll... share next time?",
            "Oops. Bat brain moment."
        ],

        // Reacting to angry spider
        reactToAngrySpider: [
            "Whoa, calm down!",
            "It's just a bug!",
            "Don't be mad...",
            "Hey, plenty for everyone!",
            "Eep! Don't bite!",
            "Let's be reasonable here..."
        ],

        // Playful teasing
        teasingSpider: [
            "Bet you can't catch me!",
            "Too slow on that web!",
            "Wings > legs, sorry!",
            "Catch me if you can~",
            "Nyoom!",
            "Air mail delivery!"
        ],

        // Friendly/bonding moments
        friendlyToSpider: [
            "We make a good team!",
            "Night shift buddies!",
            "Partners in pest control!",
            "You're alright, spider.",
            "Same goals, different methods.",
            "Respect."
        ],

        // Mood-based greetings
        moodGreetings: {
            happy: ["Great night, huh?", "Feeling good!", "Life is beautiful!"],
            hungry: ["So hungry...", "Need food...", "Starving here!"],
            grumpy: ["Hmph.", "Whatever.", "Leave me alone."],
            playful: ["Wanna play?", "Catch me!", "Wheee!"],
            smug: ["I'm the best.", "Too good.", "Perfection."]
        }
    },

    // ========================================================================
    // SPIDER DIALOGUE
    // ========================================================================
    spider: {
        idle: {
            morning: [
                "Good morning!",
                "Rise and shine!",
                "Early bird gets the worm... but I want flies.",
                "Morning stretch... all 8 legs!",
                "Coffee? I prefer my bugs fresh.",
                "Dew on my web today!",
                "Breakfast time soon?",
                "The early spider catches the fly!",
                "Yawn... still waking up.",
                "Morning web inspection complete.",
                "Sunrise hunting hours!",
                "Fresh web, fresh day!",
                "Web design is my passion",
                "Spinning class starts at 5.",
                "Anyone got any silk conditioner?",
                "Just a friendly neighborhood spider..."
            ],
            afternoon: [
                "Busy afternoon!",
                "Lunch rush!",
                "Prime hunting hours.",
                "Afternoon snack time?",
                "The sun's nice and warm!",
                "Siesta? Spiders don't nap.",
                "Peak web traffic!",
                "Midday munchies...",
                "So many flies, so little time.",
                "Working through lunch.",
                "Anyone home?",
                "Web design is my passion",
                "Does my abdomen look big in this?",
                "Counting legs... 1, 2... yep still 8.",
                "Waiting for the fly-fi connection.",
                "Just a friendly neighborhood spider..."
            ],
            evening: [
                "Good evening!",
                "Quiet evening...",
                "Dinner time approaches!",
                "Evening patrol.",
                "The sunset is beautiful!",
                "Winding down...",
                "Last calls for flies!",
                "Moths coming out soon!",
                "Evening web repairs.",
                "The night shift begins.",
                "Twilight hunting!",
                "Web design is my passion",
                "Does my abdomen look big in this?",
                "Counting legs... 1, 2... yep still 8.",
                "Waiting for the fly-fi connection.",
                "Just a friendly neighborhood spider..."
            ],
            night: [
                "Quiet night...",
                "Shhh... hunting.",
                "Night owl? Night spider!",
                "The stars are out!",
                "Midnight snack?",
                "Boo!",
                "...",
                "Can't sleep, might catch flies.",
                "Nocturnal vibes.",
                "The web glows in moonlight!",
                "Graveyard shift.",
                "Who's still awake?",
                "Late night munchies.",
                "You can't find me, me spyder.",
                "# Why don't you ever wanna play?",
                "# I'm tired of this piece of string...",
                "Web design is my passion",
                "Just a friendly neighborhood spider..."
            ]
        },

        getIdlePhrase() {
            const hour = new Date().getHours();
            let timeKey;
            if (hour >= 5 && hour < 12) timeKey = 'morning';
            else if (hour >= 12 && hour < 17) timeKey = 'afternoon';
            else if (hour >= 17 && hour < 21) timeKey = 'evening';
            else timeKey = 'night';
            
            const phrases = GAME_DIALOGUE.spider.idle[timeKey];
            return phrases[Math.floor(Math.random() * phrases.length)];
        },

        pokeHappy: [
            "Ticklish!", 
            "Seen any good bugs lately?", 
            "It's a cob.",
            "Boo!", 
            "Hi frend!", 
            "Nice poke!",
            "MWAH!",
            "Buy me dinner first!",
            "My favourite food is French flies",
            "Those fireflies are HOT 🔥",
            "💤",
            "High eight!",
            "Scratch my cephalothorax!",
            "Stop, I'm blushing!",
            "Wiggle wiggle!",
            "I love attention!",
            "You touch like a fly.",
            "Pet the spider.",
            "Boop!"
        ],

        pokeGrumpy: [
            "Do not touch!", 
            "I bite!", 
            "Grrr...", 
            "Busy hunting!", 
            "Hiss!",
            "woof, I'm a dog.",
            "I'll catch you.",
            "Nobody has fed me for weeks.",
            "No autographs.",
            "My venom is tingling.",
            "Do not disturb.",
            "Talk to the butt.",
            "Get off my lawn!",
            "I'm not a dog!",
            "Careful, I'm sticky.",
            "Go poke a wasp."
        ],

        hunting: [
            "Dinner time!", 
            "Gotcha!", 
            "Snack detected!", 
            "Incoming!",
            "NOM",
            "I've got butterflies in my stomach",
            "I need a light snack, got any glowbugs?",
            "Target locked.",
            "Swiggity swooty...",
            "Prepare for the sticky!",
            "Launch sequence initiated.",
            "Did someone say lunch?",
            "Mine! Mine! Mine!",
            "Intercept course set."
        ],

        full: [
            "I'm cultivating mass.",
            "My abdomen... it's heavy.",
            "I ate too many spicy flies.",
            "Put me on a diet.",
            "I regret everything.",
            "Food coma initiated.",
            "No more... please...",
            "Roll me to the corner.",
            "Does this web make me look fat?",
            "I'm not fat, I'm festively plump.",
            "Requires heavy lifting equipment.",
            "Too. Much. Protein.",
            "Gravity is my enemy today.",
            "I can't feel my legs.",
            "Burp.",
            "I think I ate a rock."
        ],
        
        trickedStart: [
            "Is that a fly?!", 
            "Who touched my house?", 
            "Food?!", 
            "I felt something!",
            "I really need a video doorbell.",
            "Bloody kids!",
            "Didn't even leave a note.",
            "Pizza delivery?",
            "Amazon package?",
            "Is that a heavy one?",
            "My spidey senses are tingling!",
            "Did the doorbell ring?",
            "I felt a wisp!",
            "Big catch?!",
            "Ooh, good vibrations!"
        ],

        trickedEnd: [
            "HEY! No food!", 
            "Stop playing with me!", 
            "Empty?!", 
            "Grrr...", 
            "My web!",
            "MATE!",
            "mush. Not funny.",
            "Very hangry.",
            "Just the wind...",
            "Ghost fly?",
            "Are you teasing me?",
            "My disappointment is immeasurable.",
            "Must be a glitch.",
            "Phantom buzzing.",
            "Lies! All lies!",
            "I want a refund."
        ],

        eating: {
            "🐞": "Crunchy shell!",
            "🐝": "Spicy snack!",
            "🦟": "Finally, quiet.",
            "🪲": "Tastes like metal!",
            "🦋": "Tastes like chicken.",
            "🛸": "Finger lickin' good.",
            "🐜": "Pure protein shake!",
            "🪰": "Crunchy on the outside, soft on the inside.",
            "🦗": "Needs a little salt.",
            "🕷️": "Chef's kiss!",
            "🌸": "Best meal of the week.",
            "🦂": "Slimy... yet satisfying.",
            default: "Yummy!"
        },

        missed: [
            "Too slow! 😠",
            "My lunch!",
            "So hungry...",
            "Rude.",
            "I was going to eat that.",
            "Fast food...",
            "Denied!",
            "Come back!",
            "My web is empty.",
            "Slippery little sucker!",
            "The one that got away...",
            "I'm going vegan.",
            "Wasn't hungry anyway.",
            "Butterfingers!",
            "Error 404: Fly not found.",
            "Sad web noises.",
            "I'll be in my room."
        ],

        // ====== CEILING SPIDER MEETING FLOOR SPIDER ======
        meetingTop: [
            "Hello down there!", 
            "Nice floor!", 
            "Any bugs?", 
            "How's the view?",
            "Nice legs!",
            "Working hard?",
            "Do a barrel roll!",
            "I have the high ground!"
        ],

        meetingBottom: [
            "Hello up there!", 
            "Nice web!", 
            "All clear!", 
            "Watch your step!",
            "Just passing through!",
            "Don't mind me.",
            "You missed a spot.",
            "Showoff."
        ],

        // ====== BAT INTERACTION DIALOGUE ======
        
        // Greeting the bat (friendly)
        greetBatFriendly: [
            "Hey, wing-face!",
            "Air support's here!",
            "Nice sonar!",
            "Flying high today?",
            "Fellow night creature!",
            "Show off those wings!",
            "Catch any good moths?"
        ],

        // Greeting the bat (grumpy)
        greetBatGrumpy: [
            "Oh. It's you.",
            "Stay off my web.",
            "Don't steal my bugs.",
            "Hmph. Wings.",
            "Airspace intruder.",
            "Keep flying, bat."
        ],

        // When bat steals spider's food - ANGRY
        batStoleMyFood: [
            "HEY! THAT WAS MINE!",
            "THIEF!",
            "I SAW THAT FIRST!",
            "MY BUG!!! 😤",
            "BAT! YOU RAT!",
            "UNBELIEVABLE!",
            "I WILL REMEMBER THIS!",
            "WEB CRIME! WEB CRIME!",
            "That's it. We're enemies now.",
            "I'm telling the moths on you!"
        ],

        // Still angry, follow-up
        batStoleFollowUp: [
            "Still mad about that...",
            "I won't forget.",
            "Hungry AND betrayed.",
            "Some friend you are.",
            "*angry leg tapping*",
            "Justice will be served."
        ],

        // Forgiving the bat
        forgiveBat: [
            "Fine. I'll let it go.",
            "Just this once...",
            "You owe me a bug.",
            "Consider us even. Maybe.",
            "I'm too tired to be mad.",
            "Okay okay, we're cool."
        ],

        // Responding to bat apology
        acceptApology: [
            "Apology accepted. Barely.",
            "You better mean it.",
            "Hmph. Fine.",
            "Next time, ASK.",
            "I'm watching you.",
            "...okay. We're good."
        ],

        // Playful banter with bat
        playfulToBat: [
            "Race you to that fly!",
            "Bet my web's faster!",
            "Legs vs wings, GO!",
            "Think you're quick?",
            "Can you do THIS? *wiggles*",
            "Teamwork?"
        ],

        // Bonding with bat
        friendlyToBat: [
            "Good hunting together!",
            "We make a good team!",
            "Air and ground covered!",
            "Night crew best crew!",
            "Partners!",
            "You're alright, bat."
        ],

        // Mood-based responses
        moodResponses: {
            happy: ["Life is good!", "Great day!", "Feeling webby!"],
            hungry: ["So hungry...", "Need bugs...", "Starving here..."],
            grumpy: ["Go away.", "Not in the mood.", "Hmph."],
            angry: ["STILL MAD.", "Don't talk to me.", "😤"],
            content: ["Ahh, nice.", "This is pleasant.", "Cozy."]
        },

        // ====== MEANINGFUL EXCHANGES ======
        
        // Deep/philosophical spider thoughts (rare)
        philosophical: [
            "We're all just bugs in someone's web...",
            "What if the web weaves us?",
            "Eight legs, endless questions.",
            "The fly I catch today was a larva yesterday.",
            "Is the web half-sticky or half-empty?",
            "In the end, we all return to the dust bunnies."
        ],

        // Sharing wisdom with floor spider
        wisdomToFloor: [
            "The floor has much to teach.",
            "Stay low, aim high.",
            "Patience is our greatest weapon.",
            "The web catches more with honey.",
            "Eight legs, one purpose.",
            "We are spiders. We endure."
        ],

        // Floor spider responding with wisdom
        wisdomFromFloor: [
            "The ground sees all.",
            "Every corner has a story.",
            "Slow and steady catches the fly.",
            "The shadows are my friend.",
            "Patience, cousin. Patience.",
            "We crawl, therefore we are."
        ],

        // Floor spider interactions
        floor: {
            turfWar: [
                "Occupied!", 
                "Coming through!", 
                "Scram!", 
                "Too crowded!",
                "My turf!",
                "Oops, sorry!",
                "Nope, bye!",
                "Exit stage left!"
            ],
            moving: [
                "*scuttle scuttle*",
                "...",
                "~",
                "hmm...",
                "*tap tap tap*",
                "♪♪♪",
                "*clickety click*",
                "la la la...",
                "eight legs, one mission.",
                "*pitter patter*"
            ],
            pausing: [
                "🤔",
                "..?",
                "*sniff sniff*",
                "hm.",
                "*looks around*",
                "where was I going?",
                "wait...",
                "*freezes*",
                "did you see that?",
                "hold on...",
                "*suspicious*",
                "something's different."
            ],
            thinking: [
                "what's over there?",
                "*contemplates*",
                "decisions...",
                "left or right?",
                "🕷️💭",
                "the floor is interesting.",
                "so many corners...",
                "which way?",
                "pros and cons...",
                "eeny meeny..."
            ],
            arriving: [
                "ah, here.",
                "nice spot.",
                "*settles*",
                "perfect.",
                "yes, this'll do.",
                "home sweet corner.",
                "cozy.",
                "this is the place.",
                "*satisfied*",
                "destination reached."
            ],
            startMoving: [
                "off I go!",
                "time to explore!",
                "*stretches legs*",
                "adventure awaits!",
                "let's see...",
                "onward!",
                "places to be!",
                "can't stay still forever.",
                "walkies!",
                "floor patrol!"
            ],
            leaving: [
                "brb",
                "gotta go!",
                "see ya!",
                "off to the shadows...",
                "lunch break!",
                "nature calls...",
                "bye for now!",
                "*disappears*",
                "I'll be back.",
                "don't miss me too much!"
            ],
            returning: [
                "I'm back!",
                "miss me?",
                "hello again!",
                "*emerges*",
                "back from my break.",
                "did I miss anything?",
                "reporting for duty!",
                "the shadows were nice.",
                "couldn't stay away.",
                "home sweet home!"
            ],
            // Floor spider greeting bat
            greetBat: [
                "Fly safe up there!",
                "Watch out for webs!",
                "Hello sky friend!",
                "Wings look good!",
                "Any bugs from above?",
                "Greetings, air creature!"
            ],
            // Floor spider responding to bat stealing
            batStoleReaction: [
                "Ooh, ceiling spider's mad!",
                "Drama in the air...",
                "Yikes, bat's in trouble.",
                "Not my bug, not my problem.",
                "Staying out of this one.",
                "*watches nervously*"
            ]
        }
    }
};
