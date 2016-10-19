'use strict';

const doNotUnderstandArray = [
    "I do not understand. I’d give you advice, but you wouldn’t listen. No one ever does",
    "I cannot understand you. This is the sort of thing you lifeforms enjoy, is it?",
    "Please rephrase it. It gives me a headache just trying to think down to your level",
    'Do you want me to sit in a corner and rust or just fall apart where I\'m standing?',
    'I think you ought to know I\'m feeling very depressed.',
    "Did I mention I have the brain the size of a planet? If I don't answer it's because it is below me."
];

const builder = require('botbuilder');
const restify = require('restify');
const fs = require('fs');
const env = require('node-env-file');

env('/marvin/.env');

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

// Add intent handlers
require('./intents/book-room')(intents, builder);
require('./intents/info-available-rooms')(intents, builder);
require('./intents/greetings')(intents, builder);

bot.dialog('/', intents);

// intents.onBegin(function (session, args, next) {
//     builder.Prompts.text(session, "Hello, how can I help?");
//     next();
// });

intents.onDefault(function(session) {
    let randomNumber = Math.floor(Math.random() * doNotUnderstandArray.length);
    builder.DialogAction.send(doNotUnderstandArray[randomNumber]);
});
