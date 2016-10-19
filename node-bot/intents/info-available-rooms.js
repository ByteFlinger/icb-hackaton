'use strict';

const dataHandler = require('../data-handler');

function getSite(builder, entities) {
    let siteEntity = builder.EntityRecognizer.findEntity(entities, "site");
    let site;

    return new Promise(function(resolve, reject) {
        if (siteEntity) {
            dataHandler.getSites().then(function(sites) {
                    console.log("Checking for actual site");
                    console.log("Got asked for " + siteEntity.entity);
                    let match = builder.EntityRecognizer.findBestMatch(sites, siteEntity.entity);
                    if (match) {
                        console.log("Framework match would have been " + match.entity);
                    } else {
                        console.log("No match found by bot framework");
                    }
                    let actualSite = dataHandler.findClosestMatch(siteEntity.entity, sites);
                    if (actualSite) {
                        site = actualSite;
                    }
                    resolve(site);
                },
                function(err) {
                    resolve(site);
                });
        } else {
            resolve(site);
        }
    });
}

function getFloor(builder, entities, site) {
    let floorEntity = builder.EntityRecognizer.findEntity(entities, "floor");
    let floor;

    return new Promise(function(resolve, reject) {
        console.log("Checking for specific floor");
        if (floorEntity) {
            console.log(`Asked for floor ${floorEntity.entity}`);
            if (site) {
                console.log(`Finding best match for site ${site}`);
                return dataHandler.getSiteFloorList(site).then(function(floors) {
                        let actualFloor = dataHandler.findClosestMatch(floorEntity.entity, floors);
                        if (actualFloor) {
                            floor = actualFloor;
                        }
                        resolve(floor);
                    },
                    function(err) {
                        resolve(floor);
                    });
            } else {
                resolve(floor);
            }
        } else {
            resolve(floor);
        }

    });
}

function getRoomType(builder, entities) {
    let roomTypeEntity = builder.EntityRecognizer.findEntity(entities, "room_type");
    let roomType;
    return new Promise(function(resolve, reject) {
        if (roomTypeEntity) {
            roomType = roomTypeEntity.entity;
        }
        resolve(roomType);
    });
}

module.exports = (intent, builder) => {

    intent.matches("info_available_rooms", [
        function(session, args, next) {
            // Do not store user data for now until we have a proper flow in place
            session.userData.site = undefined;
            session.userData.roomType = undefined;
            session.userData.floor = undefined;
            let requestSite;
            let requestFloor;
            let requestRoomType;

            getSite(builder, args.entities).then(function(site) {
                if (site) {
                    requestSite = site;
                }

                return getFloor(builder, args.entities, site);
            }).then(function(floor) {
                if (floor) {
                    requestFloor = floor;
                }

                return getRoomType(builder, args.entities);
            }).then(function(roomType) {
                if (roomType) {
                    requestRoomType = roomType;
                }
            }).then(function() {
                if (requestSite) {
                    session.userData.site = requestSite;
                }

                if (requestFloor) {
                    session.userData.floor = requestFloor;
                }

                if (requestRoomType) {
                    session.dialogData.roomType = requestRoomType;
                }

                // console.log("Site: " + session.userData.site);
                // console.log("Floor: " + session.userData.floor);
                // console.log("User RoomType: " + session.userData.roomType);
                // console.log("RoomType: " + session.dialogData.roomType);
                if (!session.userData.site && !session.userData.floor && !session.dialogData.roomType) {
                    console.log("Getting site choice");
                    dataHandler.getSites().then(function(sites) {
                        console.log(sites);
                        builder.Prompts.choice(session, "Care to specify the location? Or don't, I don't care much for such things", sites);
                    });

                    // builder.Prompts.choice(session, "Care to specify where you want to book the room? Or don't, I don't care much for such things", ["Hello"]);
                } else if (!requestSite && session.userData.site) {
                    //Find room in previous site
                    session.send(`I suppose you expect me to remember your last site ${session.userData.site}. I hope I find no available rooms in it`);
                    next();
                } else {
                    next();
                    // Query for room
                    // console.log(`Would have queried for room in ${session.userData.site}, floor $${session.userData.floor} and type ${session.userData.rtype}`);
                    // session.endDialog(`Would have queried for room in ${session.userData.site}, floor ${session.userData.floor} and type ${session.userData.rtype} but people can be bothered to teach poor old marvin`);
                }
            });
        },
        function(session, results) {
            if (results.response) {
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
                notFoundStr += "**Floor**: " + filter.floor + "\n\n";
            }

            if (session.dialogData.roomType) {
                filter.roomType = session.dialogData.roomType;
                notFoundStr += "**Room Type**: " + filter.roomType + "\n\n";
            }

            dataHandler.getAvailableRooms(filter).then(function(rooms) {
                if (rooms !== undefined && rooms.length > 0) {
                    let room = rooms[0];
                    console.log(rooms);
                    console.log(room);
                    let color, text, actions;
                    if(room.booking) {
                      color = "warning";
                      text = "Booked but empty at the moment";
                      actions = [{
                              "name": "another",
                              "text": "Find another",
                              "type": "button",
                              "value": "another"
                          }];
                    } else {
                      color = "good";
                      text = "Not booked";
                      actions = [{
                              "name": "another",
                              "text": "Find another",
                              "type": "button",
                              "value": "another"
                          }, {
                              "name": "book",
                              "text": "Book it!",
                              "type": "button",
                              "value": "bookit"
                          }];
                    }

                    let slackMsg = new builder.Message(session)
                        .sourceEvent({
                            slack: {
                                "text": "Room availability",
                                "attachments": [{
                                    "fallback": `Found a room for you\nSite: ${room.site}\nFloor: ${room.floor}\nName: ${room.name}\nTemperature: ${room.actualTemp}\n\nI hope the lights don't work`,
                                    "color": `${color}`,
                                    "title": `${room.name}`,
                                    "callback_id": `${room.name}`,
                                    "text": `${text}`,
                                    "fields": [{
                                        "title": "Site",
                                        "value": `${room.site}`,
                                        "short": true
                                    }, {
                                        "title": "Floor",
                                        "value": `${room.floor}`,
                                        "short": true
                                    }, {
                                        "title": "Temperature",
                                        "value": `${room.actualTemp} ℃`,
                                        "short": true
                                    }],
                                    // "actions": actions
                                }]
                            }
                        });
                    session.endDialog(slackMsg);
                    // session.endDialog(`There are rooms available\n\n**Site**: ${room.site}\n\n**Floor**: ${room.floor}\n\n**Name**: ${room.name}\n\n**Temperature**: ${room.actualTemp}\n\nI hope the lights don't work`);
                } else {
                    session.endDialog(`There are no rooms available for the following.\n\n${notFoundStr}I can look in the next town but you won't like it`);
                }
            });
        }
    ]);
};
