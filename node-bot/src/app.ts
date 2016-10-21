import {UserPreferenceService} from "./service/userPreferenceService";
import {UserPreference} from "./model/userPreference";
'use strict';

import { ChatConnector, LuisRecognizer, UniversalBot, IntentDialog } from 'botbuilder';
import * as restify from 'restify';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as dataHandler from './data-handler';
import * as request from 'request';
import {ChatMessageService} from "./service/serviceInterfaces";
import { BFChatMessageService } from "./service/bfChatMessageService";

const doNotUnderstandArray = [
    "I do not understand. I’d give you advice, but you wouldn’t listen. No one ever does",
    "I cannot understand you. This is the sort of thing you lifeforms enjoy, is it?",
    "Please rephrase it. It gives me a headache just trying to think down to your level",
    'Do you want me to sit in a corner and rust or just fall apart where I\'m standing?',
    'I think you ought to know I\'m feeling very depressed.',
    "Did I mention I have the brain the size of a planet? If I don't answer it's because it is below me."
];

dotenv.config({
    silent: true
});
//dotenv.config({
//  silent: true,
//  path: '../.env'
//});

let chatMessageService: ChatMessageService = new BFChatMessageService();
let userPreferenceService: UserPreferenceService = new UserPreferenceService();

const https_options: any = {
    key: fs.readFileSync(process.env.SSL_KEY_PATH),
    certificate: fs.readFileSync(process.env.SSL_CERT_PATH)
};

// Create chat bot
// let connector = new builder.ConsoleConnector().listen();
let connector = new ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

let https_server = restify.createServer(https_options);
https_server.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log('%s listening to %s', https_server.name, https_server.url);
});
https_server.post('/api/messages', connector.listen());

let bot = new UniversalBot(connector);

const LuisModelUrl = process.env.LUIS_MODEL_URL;

// Main dialog with LUIS
let recognizer = new LuisRecognizer(LuisModelUrl);
let intents = new IntentDialog({
    recognizers: [recognizer]
    // intentThreshold: 0.8,
    // recognizeOrder:  builder.RecognizeOrder.series
});

bot.beginDialogAction('bookRoom', '/bookRoom', { matches: /^bookRoom/i });
bot.beginDialogAction('setPreferedRoom', '/setPreferedRoom', { matches: /^setPreferedRoom/i });
bot.beginDialogAction('findAnotherRoom', '/findAnotherRoom', { matches: /^findAnotherRoom/i });

bot.dialog('/bookRoom', [
    function(session) {
        session.endDialog("You'd think they'd allow someone with my brain capacity to perform a single task such as booking a room but no. They probably forgot about me");
    }
]);

bot.dialog('/findAnotherRoom', [
    function(session) {
        session.endDialog("No, I don't feel like doing that today. Try tomorrow but don't expect much");
    }
]);

bot.dialog('/setPreferedRoom', [
    function(session) {
        console.log("Preference before", session.userData.preference);
        let lastRoom = session.privateConversationData.last.room;
        if (lastRoom) {
           if(!session.userData.preference) {
             session.userData.preference = new UserPreference();
           }

            userPreferenceService.setPreferedRoom(session.userData.preference,lastRoom);
            console.log(session.userData.preference);
            session.endDialog("It is done :robot_face:. The system will probably forget about it though");
        } else {
          session.endDialog("Sorry I cannot do that");
        }

    }
]);

// Add intent handlers
require('./intents/book-room')(intents, chatMessageService, userPreferenceService);
require('./intents/info-available-rooms')(intents, chatMessageService, userPreferenceService);
require('./intents/greetings')(intents, chatMessageService, userPreferenceService);

bot.dialog('/', intents);

// bot.on('receive', function(data) {
//     // console.log(data);
//     if (data.type === 'message' && data.text === 'another') {
//         let origMessage = data.sourceEvent.Payload.original_message;
//         let responseUrl = data.sourceEvent.Payload.response_url;
//         let roomName = data.sourceEvent.Payload.callback_id;
//         console.log(origMessage);
//         let respMsg = origMessage;
//         respMsg.response_type = "ephemeral";
//         respMsg.replace_original = true;
//
//         respMsg.attachments[0].title = "This is a new room";
//
//         let filter = {};
//
//         dataHandler.getAvailableRooms(filter).then(function(rooms) {
//             let newRoom;
//             if (rooms !== undefined && rooms.length > 0) {
//                 let filteredRooms = rooms.filter((room) => {
//                     return room.name !== roomName;
//                 });
//
//                 if (filteredRooms.length > 0) {
//                     newRoom = filteredRooms[0];
//                 }
//             }
//
//             if (newRoom) {
//                 request({
//                     url: responseUrl,
//                     method: "POST",
//                     json: respMsg
//                 }, (error, response, body) => {
//                     //console.log(response);
//                 });
//             }
//         });
//
//     } else {
//         console.log("Got unknown message");
//     }
// });

intents.onDefault(function(session: any) {
    let randomNumber = Math.floor(Math.random() * doNotUnderstandArray.length);
    session.send(doNotUnderstandArray[randomNumber]);
});
