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
        // Random idle phrases when dropping down
        idle: [
            "# Hunting spiders...", 
            "just hanging", 
            "looking for snacks", 
            "nice web right?", 
            "quiet night...", 
            "...", 
            "boo!",
            "anyone home?",
            "You can't find me, me spyder.",
            "# Why don't you ever wanna play?",
            "# I'm tired of this piece of string...",
            "Web design is my passion",
            "Does my abdomen look big in this?",
            "Counting legs... 1, 2... yep still 8.",
            "Waiting for the fly-fi connection.",
            "Spinning class starts at 5.",
            "Anyone got any silk conditioner?",
            "Just a friendly neighborhood spider..."
        ],

        // When clicked (50% chance Happy)
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

        // When clicked (50% chance Grumpy)
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

        // When hunting real food
        hunting: [
            "Dinner time!", 
            "Gotcha!", 
            "Snack detected!", 
            "Incoming!",
            "NOM",
            "I’ve got butterflies in my stomach",
            "I need a light snack, got any glowbugs?",
            "Target locked.",
            "Swiggity swooty...",
            "Prepare for the sticky!",
            "Launch sequence initiated.",
            "Did someone say lunch?",
            "Mine! Mine! Mine!",
            "Intercept course set."
        ],

        // When dropped on an empty web (Tricked)
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

        // Reactions to specific food
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

        // When the fly is saved before the spider gets there
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
