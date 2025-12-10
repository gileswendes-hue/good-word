const GAME_DIALOGUE = {
    // What the insects say when saved
    insects: {
        '🐞': "Lucky escape!",
        '🐝': "Buzz off!",
        '🦟': "Phew!",
        '🚁': "GET TO THE CHOPPA!"
    },

    // All spider speech
    spider: {
        // Random idle phrases when dropping down
        idle: [
            '# Hunting spiders...', 
            'just hanging', 
            'looking for snacks', 
            'nice web right?', 
            'quiet night...', 
            '...', 
            'boo!',
            'anyone home?',
            'You can't find me, I'm a spyder.'
            
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
            "My favourite food is French flies"
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
            "Nobody has fed me for weeks."
        ],

        // When hunting real food
        hunting: [
            "Dinner time!", 
            "Gotcha!", 
            "Snack detected!", 
            "Incoming!",
            "NOM",
            "I’ve got butterflies in my stomach",
            "I need a light snack, got any glowbugs?'
        ],

        // When dropped on an empty web (Tricked)
        trickedStart: [
            "Is that a fly?!", 
            "Who touched my house?", 
            "Food?!", 
            "I felt something!",
            "I really need a video doorbell.",
            "Bloody kids!",
            "Didn't even leave a note."
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
            "Very hangry."
        ],

        // Reactions to specific food
        eating: {
            '🐞': "Crunchy shell!",
            '🐝': "Spicy snack!",
            '🦟': "Finally, quiet.",
            '🚁': "Tastes like metal!",
            default: "Yummy!"
        },

        // When the fly is saved before the spider gets there
        missed: "Too slow! 😠"
    }
};
