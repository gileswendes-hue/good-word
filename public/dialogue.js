const GAME_DIALOGUE = {
    // What the insects say when saved
    insects: {
        "🐞": "Lucky escape!",
        "🐝": "Buzz off!",
        "🦟": "Phew!",
        "🚁": "GET TO THE CHOPPA!"
    },

    // All spider speech
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

        // When realizing it was a trick (Retreating)
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
            "🚁": "Tastes like metal!",
            // New additions (assigned to potential new bugs)
            "🦋": "Tastes like chicken.",
            "🐛": "Finger lickin' good.",
            "🐜": "Pure protein shake!",
            "🪰": "Crunchy on the outside, soft on the inside.",
            "🦗": "Needs a little salt.",
            "🕷️": "Chef's kiss!",
            "🐌": "Best meal of the week.",
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
        ]
    }
};
