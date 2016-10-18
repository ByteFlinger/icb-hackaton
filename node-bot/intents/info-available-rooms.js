'use strict';

const dataHandler = require('../data-handler');

module.exports = (intent, builder) => {

    intent.matches("info_available_rooms", [
        function(session, args, next) {
            // Resolve and store any entities passed from LUIS.
            let siteEntity = builder.EntityRecognizer.findEntity(args.entities, "site");
            let floorEntity = builder.EntityRecognizer.findEntity(args.entities, "floor");
            let roomEntity = builder.EntityRecognizer.findEntity(args.entities, "room");
            let roomTypeEntity = builder.EntityRecognizer.findEntity(args.entities, "room_type");
            let roomTemperatureEntity = builder.EntityRecognizer.findEntity(args.entities, "room_temperature");

            if (!roomEntity) {
              // For demo purposes we wipe the site before
                session.userData.site = undefined;
                if (siteEntity) {
                    session.userData.site = siteEntity.entity;
                }

                if (floorEntity) {
                    session.userData.floor = floorEntity.entity;
                }

                // Maybe not save room type on the user but just this dialog
                if (roomTypeEntity) {
                    session.dialogData.roomType = roomTypeEntity.entity;
                }

                if (!session.userData.site && !session.userData.floor && !session.dialogData.roomType) {
                    console.log("Getting site choice");
                    dataHandler.getSites((sites) => {
                        console.log(sites);
                        builder.Prompts.choice(session, "Care to specify the location? Or don't, I don't care much for such things", sites);
                    });

                    // builder.Prompts.choice(session, "Care to specify where you want to book the room? Or don't, I don't care much for such things", ["Hello"]);
                } else if (!siteEntity && session.userData.site) {
                    //Find room in previous site
                    session.send(`I suppose you expect me to remember your last site ${session.userData.site}. I hope I find no available rooms in it`);
                    next();
                } else {
                  next();
                    // Query for room
                    // console.log(`Would have queried for room in ${session.userData.site}, floor $${session.userData.floor} and type ${session.userData.rtype}`);
                    // session.endDialog(`Would have queried for room in ${session.userData.site}, floor ${session.userData.floor} and type ${session.userData.rtype} but people can be bothered to teach poor old marvin`);
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
            if (results.response) {
                console.log("Found site");
                session.userData.site = results.response.entity;
            }

            let filter = {};
            let notFoundStr = "";

            if (session.userData.site) {
                filter.site = session.userData.site;
                notFoundStr += "**Site**: " + filter.site + "\n\n";
            }

            if (session.userData.floor) {
                filter.floor = session.userData.floor;
                notFoundStr +=  "**Floor**: " + filter.floor + "\n\n";
            }

            if (session.dialogData.roomType) {
                filter.roomType = session.dialogData.roomType;
                notFoundStr += "**Room Type**: " + filter.roomType + "\n\n";
            }

            dataHandler.getAvailableRooms(filter, (rooms) => {
                console.log(rooms);
                if (rooms !== undefined && rooms.length > 0) {
                    let room = rooms[0];
                    session.endDialog(`There are rooms available\n\n**Site**: ${room.site}\n\n**Floor**: ${room.floor}\n\n**Name**: ${room.name}\n\nI hope the lights don't work`);
                } else {
                    session.endDialog(`There are no rooms available for the following.\n\n${notFoundStr}I can look in the next town but you won't like it`);
                }
            });

            // session.endDialog(`There are rooms available\n\n**Site**: Value\n\n**Floor**: Value\n\n**Name**: Value\n\nI hope the lights don't work`);
        }
    ]);
};
