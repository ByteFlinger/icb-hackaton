'use strict';
import {ChatMessageService} from "../service/serviceInterfaces";
import * as dataHandler from '../data-handler';
import { IntentDialog, EntityRecognizer, Prompts, Session, Message }  from 'botbuilder';

//const dataHandler = require('../data-handler');

const excuses = [
    "they still don't trust me with it. Humans are so stupid :face_with_rolling_eyes:",
    "you can blame the Sirius Cybernetics Corporation for making androids with Genuine People Personalities...",
    "here I am, brain the size of a planet :robot_face: and they won't even let me book a room"
];

module.exports = (intent: IntentDialog, chatMessageService: ChatMessageService) => {

  intent.matches("book_room", [
    function(session: Session, args: any, next: any) {
        // Resolve and store any entities passed from LUIS.
        console.log(args);
        let roomEntity = EntityRecognizer.findEntity(args.entities, "room");
        if (!roomEntity) {
            Prompts.text(session, "You need to specify a room. I hope you get a cold one.");
        } else {
            // next({ response: roomEntity.entity });
            let excuse = excuses[Math.floor(Math.random() * excuses.length)];

            dataHandler.getRoomNames().then((rooms)=>{
                //let room = dataHandler.findClosestMatch(roomEntity.entity, rooms);
                let room = EntityRecognizer.findBestMatch(rooms, roomEntity.entity, 0.2);
                console.log(room);
                console.log("ok");

                if (room) {
                    dataHandler.getRoomState(room.entity, (roomState: any, error: any) => {
                        console.log(roomState);
                        console.log(room);
                        if (!error) {
                            session.send(chatMessageService.getRoomSuggestionMessage(roomState));
                            session.send(`I would have booked that room but ${excuse}`);
                        } else {
                            console.log(error);
                        }
                        session.endDialog();
                    });
                } else {
                    session.send(`Couldn't find ${roomEntity.entity}, maybe you should give up`);
                }
            }, (err) => {console.log(err);});
        }
    }/*,
    function(session, results) {
        let room = results.response;
        session.send(`I would have booked ${room} but they still don't trust me with it. Humans are so stupid`);
        session.endDialog();
    }*/
]);


};
