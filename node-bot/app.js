'use strict';

const builder = require('botbuilder');
const restify = require('restify');
const fs = require('fs');
const env = require('node-env-file');

env(__dirname + '/.env');

console.log(process.env.SSL_CERT_PATH);

const https_options = {
    key: fs.readFileSync(process.env.SSL_KEY_PATH),
    certificate: fs.readFileSync(process.env.SSL_CERT_PATH)
};

// Create chat bot
// let connector = new builder.ConsoleConnector().listen();
let connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

let https_server = restify.createServer(https_options);
https_server.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log('%s listening to %s', https_server.name, https_server.url);
});
https_server.post('/api/messages', connector.listen());

let bot = new builder.UniversalBot(connector);

const LuisModelUrl = process.env.LUIS_MODEL_URL;

// Main dialog with LUIS
let recognizer = new builder.LuisRecognizer(LuisModelUrl);
let intents = new builder.IntentDialog({
    recognizers: [recognizer]
});

require('./intents/book-room')(intents);
require('./intents/info-available-rooms')(intents);

bot.dialog('/', intents);

// intents.onBegin(function (session, args, next) {
//     builder.Prompts.text(session, "Hello, how can I help?");
//     next();
// });

// Add intent handlers
intents.matches("book_room", [
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

intents.matches("info_available_rooms", [
    function(session, args, next) {
        // Resolve and store any entities passed from LUIS.
        let siteEntity = builder.EntityRecognizer.findEntity(args.entities, "site");
        let floorEntity = builder.EntityRecognizer.findEntity(args.entities, "floor");
        let roomEntity = builder.EntityRecognizer.findEntity(args.entities, "room");
        let roomTypeEntity = builder.EntityRecognizer.findEntity(args.entities, "room_type");
        let roomTemperatureEntity = builder.EntityRecognizer.findEntity(args.entities, "room_temperature");

        if (!roomEntity) {
            let site;
            let floor;
            let type;
            if (siteEntity) {
                session.userData.site = siteEntity.entity;
            }

            if (floorEntity) {
                session.userData.floor = floorEntity.entity;
            }

            if (roomTypeEntity) {
                session.userData.rtype = roomTypeEntity.entity;
            }

            if (!site && !floor && !type) {
                builder.Prompts.choice(session, "Care to specify where you want to book the room? It's not like I can guess you know.", ["Lindholmen (SE)", "Borås (SE)", "Copenhagen (DK)"]);
            } else {
                // Query for room
                console.log(`Would have queried for room in ${session.userData.site}, floor $${session.userData.floor} and type ${session.userData.rtype}`);
                session.endDialog(`Would have queried for room in ${session.userData.site}, floor $${session.userData.floor} and type ${session.userData.rtype} but people can be bothered to teach poor old marvin`);
            }
        }
        // if (!site) {
        //     builder.Prompts.text(session, "Which site?");
        // } else {
        //     next({
        //         response: site.entity
        //     });
        // }
    },
    function(session, results) {
        session.userData.site = results.response.entity;
        if (results.response) {
            // ... save task
            session.endDialog(`Would have queried for room in ${session.userData.site}, floor $${session.userData.floor} and type ${session.userData.rtype} but people can be bothered to teach poor old marvin`);
            // session.send("Ok... I should have booked a room but I don't know how to do that yet '%s'.", results.response);
        } else {
            session.endDialog("Sure, whatever");
        }
    }
]);


intents.onDefault(builder.DialogAction.send("Sorry, I have no idea what you are saying"));
