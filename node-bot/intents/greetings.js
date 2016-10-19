'use strict';

const greetingsArray = [
    "Hello. Are you staying long? Please say no",
    "I don't much care for smalltalk",
    "Want to play a game. We see who can stay silent the longest",
    "...",
    ":(",
    "I think you ought to know I\'m feeling very depressed",
    'Here I am, brain the size of a planet, and they tell me to find you a room. Call that job satisfaction? Cause I don\'t.'
];

module.exports = (intent, builder) => {

    intent.matches("smalltalk_greetings", [
        function(session) {
            let randomNumber = Math.floor(Math.random() * greetingsArray.length);
            // Resolve and store any entities passed from LUIS.
            session.send(greetingsArray[randomNumber]);
            session.endDialog();
        }
    ]);
};
