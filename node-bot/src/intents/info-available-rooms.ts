'use strict';

import { IntentDialog, EntityRecognizer, Prompts, Session, IEntity, Message }  from 'botbuilder';
import * as dataHandler from '../data-handler';
import { SlackChatMessage } from '../model/slackChatMessage';
import { RequestedRoom, Room, RoomState } from '../model/room';
import { UserPreference } from '../model/userPreference';
import {ChatMessageService} from "../service/serviceInterfaces";

function getSite(entities: Array<IEntity>): Promise<string> {
    let siteEntity = EntityRecognizer.findEntity(entities, "site");
    let site: string;

    return new Promise(function(resolve, reject) {
        if (siteEntity) {
            dataHandler.getSites().then(function(sites: Array<string>) {
                console.log("Checking for actual site");
                console.log("Got asked for " + siteEntity.entity);
                let match = EntityRecognizer.findBestMatch(sites, siteEntity.entity);
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
                function(err: any) {
                    resolve(site);
                });
        } else {
            resolve(site);
        }
    });
}

function getFloor(entities: Array<IEntity>, site: string): Promise<string> {
    let floorEntity = EntityRecognizer.findEntity(entities, "floor");
    let floor: string;

    return new Promise(function(resolve, reject) {
        console.log("Checking for specific floor");
        if (floorEntity) {
            console.log(`Asked for floor ${floorEntity.entity}`);
            if (site) {
                console.log(`Finding best match for site ${site}`);
                return dataHandler.getSiteFloorList(site).then(function(floors: Array<string>) {
                    let actualFloor = dataHandler.findClosestMatch(floorEntity.entity, floors);
                    if (actualFloor) {
                        floor = actualFloor;
                    }
                    resolve(floor);
                },
                    function(err: any) {
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

function getRoomType(entities: Array<IEntity>): Promise<string> {
    let roomTypeEntity = EntityRecognizer.findEntity(entities, "room_type");
    let roomType: string;
    return new Promise(function(resolve, reject) {
        if (roomTypeEntity) {
            roomType = roomTypeEntity.entity;
        }
        resolve(roomType);
    });
}

module.exports = (intent: IntentDialog, chatMessageService: ChatMessageService) => {

    intent.matches("info_available_rooms", [
        function(session: Session, args: any, next: any) {
            // Do not store user data for now until we have a proper flow in place
            session.userData.site = undefined;
            session.userData.roomType = undefined;
            session.userData.floor = undefined;
            let requestSite: any;
            let requestFloor: any;
            let requestRoomType: any;

            getSite(args.entities).then(function(site: string) {
                if (site) {
                    requestSite = site;
                }

                return getFloor(args.entities, site);
            }).then(function(floor) {
                if (floor) {
                    requestFloor = floor;
                }

                return getRoomType(args.entities);
            }).then(function(roomType) {
                if (roomType) {
                    requestRoomType = roomType;
                }
            }).then(function() {
                let requestedRoom = new RequestedRoom();
                if (requestSite) {
                    requestedRoom.site = requestSite;
                }

                if (requestFloor) {
                    requestedRoom.floor = requestFloor;
                }

                if (requestRoomType) {
                    requestedRoom.type = requestRoomType;
                }

                let roomEntity = EntityRecognizer.findEntity(args.entities, "room");
                if (roomEntity) {
                    requestedRoom.name = roomEntity.entity
                }

                session.dialogData.requestedData = requestedRoom;

                let userPreference: UserPreference = session.userData.preference;

                if (requestedRoom.isEmpty() && (!userPreference || !userPreference.getPreferedRoom())) {
                    console.log("Found neither user preference or requested data. Asking user for site");
                    dataHandler.getSites().then(function(sites: Array<any>) {
                        console.log(sites);
                        Prompts.choice(session, "Care to specify the location? Or don't, I don't much care for such things", sites);
                    });

                    // builder.Prompts.choice(session, "Care to specify where you want to book the room? Or don't, I don't care much for such things", ["Hello"]);
                } else {
                    next();
                    // Query for room
                    // console.log(`Would have queried for room in ${session.userData.site}, floor $${session.userData.floor} and type ${session.userData.rtype}`);
                    // session.endDialog(`Would have queried for room in ${session.userData.site}, floor ${session.userData.floor} and type ${session.userData.rtype} but people can be bothered to teach poor old marvin`);
                }
            });
        },
        function(session: Session, results: any) {
            let requestedRoom: RequestedRoom = session.dialogData.requestedData;

            if (results.response) {
                requestedRoom.site = results.response.entity;
            }

            let filter: RequestedRoom = new RequestedRoom();
            let notFoundStr = "";
            let userPreference: UserPreference = session.userData.preference;

            console.log("HELLO1");

            if (!userPreference) {
              console.log("HELLO2");
                userPreference = new UserPreference();
                filter.site = requestedRoom.site;
            } else {
              console.log("HELLO3");
                let preferedRoom = userPreference.getPreferedRoom(requestedRoom.site);
                if (preferedRoom) {
                  console.log("HELLO4");
                    if (preferedRoom.site === requestedRoom.site) {
                        filter.site = preferedRoom.site;
                        notFoundStr += "**Site**: " + filter.site + "\n\n";

                        if (requestedRoom.floor && preferedRoom.floor === requestedRoom.floor) {
                            filter.floor = preferedRoom.floor;
                            notFoundStr += "**Floor**: " + filter.floor + "\n\n";

                            if (requestedRoom.type && preferedRoom.tags[0] === requestedRoom.type) {
                                filter.type = preferedRoom.tags[0];
                                notFoundStr += "**Type**: " + filter.type + "\n\n";
                            } else {
                                filter.type = requestedRoom.type;
                                notFoundStr += "**Type**: " + filter.type + "\n\n";
                            }
                        } else {
                            filter.floor = requestedRoom.floor;
                            notFoundStr += "**Floor**: " + filter.floor + "\n\n";
                        }
                    } else {
                        filter = requestedRoom;
                    }

                } else {
                    filter = requestedRoom;
                }
            }

            console.log("Find room for filter", filter);

            dataHandler.getAvailableRooms(filter).then(function(rooms: Array<RoomState>) {
                if (rooms !== undefined && rooms.length > 0) {
                    let room = rooms[0];
                    console.log(rooms);
                    console.log(room);
                    console.log("We found a room");
                    let msg = chatMessageService.getRoomSuggestionMessage(room);
                    console.log("The slack message is ", msg);
                    session.endDialog(msg);
                    // session.endDialog(`There are rooms available\n\n**Site**: ${room.site}\n\n**Floor**: ${room.floor}\n\n**Name**: ${room.name}\n\n**Temperature**: ${room.actualTemp}\n\nI hope the lights don't work`);
                } else {
                    session.endDialog(`There are no rooms available for the following.\n\n${notFoundStr}I can look in the next town but you won't like it`);
                }
            });
        }
    ]);
};
