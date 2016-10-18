'use strict';

const builder = require('botbuilder');
const restify = require('restify');

// Create chat bot
let connector = new builder.ConsoleConnector().listen();
// let connector = new builder.ChatConnector({
//     appId: process.env.MICROSOFT_APP_ID,
//     appPassword: process.env.MICROSOFT_APP_PASSWORD
// });

// let server = restify.createServer();
// server.listen(process.env.port || process.env.PORT || 3978, function() {
//     console.log('%s listening to %s', server.name, server.url);
// });
// server.post('/api/messages', connector.listen());

let bot = new builder.UniversalBot(connector);

const LuisModelUrl = process.env.LUIS_MODEL_URL;

// Main dialog with LUIS
let recognizer = new builder.LuisRecognizer(LuisModelUrl);
let intents = new builder.IntentDialog({
    recognizers: [recognizer]
});

bot.dialog('/', intents);

// Add intent handlers
intents.matches("book_room", [
    function(session, args, next) {
        // Resolve and store any entities passed from LUIS.
        let site = builder.EntityRecognizer.findEntity(args.entities, "site");
        if (!site) {
            builder.Prompts.text(session, "Which site?");
        } else {
            next({
                response: site.entity
            });
        }
      },
    function (session, results) {
        if (results.response) {
            // ... save task
            session.send("Ok... Added the '%s' task.", results.response);
        } else {
            session.send("Ok");
        }
    }
  ]);


intents.onDefault(builder.DialogAction.send("I'm sorry I didn't understand. I can only create & delete alarms."));
