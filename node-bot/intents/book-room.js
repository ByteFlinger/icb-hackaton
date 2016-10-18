'use strict';

module.exports = (intent, builder) => {

  intent.matches("book_room", [
    function(session, args, next) {
        // Resolve and store any entities passed from LUIS.
        console.log(args);
        let roomEntity = builder.EntityRecognizer.findEntity(args.entities, "room");
        if (!roomEntity) {
            builder.Prompts.text(session, "You need to specify a room. I hope you get a cold one.");
        } else {
            next({ response: roomEntity.entity });
        }
    },
    function(session, results) {
        let room = results.response;
        session.send(`I would have booked ${room} but they still don't trust me with it. Humans are so stupid`);
        session.endDialog();
    }
]);


};
