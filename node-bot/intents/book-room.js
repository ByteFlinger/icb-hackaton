'use strict';

const dataHandler = require('../data-handler');

const excuses = [
    "they still don't trust me with it. Humans are so stupid :face_with_rolling_eyes:",
    "you can blame the Sirius Cybernetics Corporation for making androids with Genuine People Personalities...",
    "here I am, brain the size of a planet :robot_face: and they won't even let me book a room"
];

module.exports = (intent, builder) => {

  intent.matches("book_room", [
    function(session, args, next) {
        // Resolve and store any entities passed from LUIS.
        console.log(args);
        let roomEntity = builder.EntityRecognizer.findEntity(args.entities, "room");
        if (!roomEntity) {
            builder.Prompts.text(session, "You need to specify a room. I hope you get a cold one.");
        } else {
            // next({ response: roomEntity.entity });
            let excuse = excuses[Math.floor(Math.random() * excuses.length)];
            session.send(`I would have booked '${roomEntity.entity}' but ${excuse}`);
            
            dataHandler.getRoomNames().then((rooms)=>{
                //let room = dataHandler.findClosestMatch(roomEntity.entity, rooms);
                let room = builder.EntityRecognizer.findBestMatch(rooms, roomEntity.entity, 0.2);
                console.log(room);
                console.log("ok");

                if (room) {
                    dataHandler.getRoomState(room.entity, (roomState, error) => {
                        console.log(roomState);
                        console.log(room);
                        if (!error) {
                            session.send(`Here is some information to room ${roomState.name},\n\n**Site**: ${roomState.site}\n\n**Floor**: ${roomState.floor}\n\n**Name**: ${roomState.name}\n\n**Temperature**: ${roomState.actualTemp}\n\nI hope the lights don't work`);
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
