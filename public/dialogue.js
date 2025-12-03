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
            'just hanging', 
            'looking for snacks', 
            'nice web right?', 
            'quiet night...', 
            '...', 
            'boo!',
            'anyone home?'
        ],

        // When clicked (50% chance Happy)
        pokeHappy: [
            "Ticklish!", 
            "Happy Halloween!", 
            "Boo!", 
            "Hi friend!", 
            "Nice poke!"
        ],

        // When clicked (50% chance Grumpy)
        pokeGrumpy: [
            "Do not touch!", 
            "I bite!", 
            "Grrr...", 
            "Busy hunting!", 
            "Hiss!"
        ],

        // When hunting real food
        hunting: [
            "Dinner time!", 
            "Gotcha!", 
            "Snack detected!", 
            "Incoming!"
        ],

        // When dropped on an empty web (Tricked)
        trickedStart: [
            "Is that a fly?!", 
            "Who touched my house?", 
            "Food?!", 
            "I felt something!"
        ],

        // When realizing it was a trick (Retreating)
        trickedEnd: [
            "HEY! No food!", 
            "Stop pranking me!", 
            "Empty?!", 
            "Grrr...", 
            "My web!"
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
