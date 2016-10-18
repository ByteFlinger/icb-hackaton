'use strict';

module.exports = (intent) => {

  intent.matches("book_room", [
    function(session, args, next) {
        // Resolve and store any entities passed from LUIS.
        console.log(args);
        let site = builder.EntityRecognizer.findEntity(args.entities, "site");
        if (!site) {
            builder.Prompts.text(session, "Which site?");
        } else {
            next({
                response: site.entity
            });
        }
    },
    function(session, results) {
        if (results.response) {
            // ... save task
            session.send("Ok... I should have booked a room but I don't know how to do that yet '%s'.", results.response);
        } else {
            session.send("Ok");
        }
    }
]);


};