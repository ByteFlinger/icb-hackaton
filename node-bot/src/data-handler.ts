'use strict';

import * as request from 'request';
import * as levenshtein from 'fast-levenshtein';
import { RequestedRoom, Room, RoomState } from './model/room';

/**
 * returns an array of room names
 *
 * @usage
 * getAvailableRooms({floor: 'Floor 06'}, (rooms) => {
    console.log(rooms);
  });
 *
 */
// exports.getAvailableRooms = (options, cb) => {
//     options = options ? options : {};
//
//     request.get('http://52.57.171.54:8080/rooms', (error, response) => {
//         if (!error && response.statusCode === 200) {
//             let data = JSON.parse(response.body);
//             let matchOptions = (room) => {
//                 return !room.booking && (room.site === (options.site || room.site)) && (room.floor === (options.floor || room.floor));
//             };
//             cb(data.filter(matchOptions));
//         } else {
//             console.log('GET request failed', error);
//         }
//     }).auth('user', 'hackathon', false);
// };

function compareRoomBooking(room1: RoomState, room2: RoomState) {
  if (!room1.booking && room2.booking) {
    return -1;
  } else if (room1.booking && !room2.booking) {
    return 1;
  }
  // a must be equal to b
  return 0;
}

export function getAvailableRooms(options: RequestedRoom): Promise<Array<RoomState>> {
    options = options ? options : new RequestedRoom();

    return new Promise(function(resolve: any, reject: any) {
        request.get('http://52.57.171.54:8080/rooms', (error, response, body) => {
            if (!error && response.statusCode === 200) {
                let data: Array<RoomState> = JSON.parse(body);
                let matchOptions = (room: RoomState) => {
                    return (!room.booking || (room.booking && !room.presence)) && (room.site === (options.site || room.site)) && (room.floor === (options.floor || room.floor));
                };
                resolve(data.filter(matchOptions).sort(compareRoomBooking));
            } else {
                reject(error);
                console.log('GET request failed', error);
            }
        }).auth('user', 'hackathon', false);
    });
};


/**
 * returns an array containing the sites
 *
 * @usage
 * getRoomState('6610 Skyskrapan', (room) => {
    console.log(room);
  });
 *
 */
export function getRoomState(name: any, cb: any) {
    request.get('http://52.57.171.54:8080/rooms', (error, response, body) => {
        if (!error && response.statusCode === 200) {
            let data = JSON.parse(body);
            let trigger = false;
            data.forEach((room: any) => {
                if (room.name === name && !trigger) {
                    cb(room);
                    trigger = true;
                }
            });
        } else {
            console.log('GET request failed', error);
        }
    }).auth('user', 'hackathon', false);
};

// exports.getSiteFloorList = (site, cb) => {
//     request.get('http://52.57.171.54:8080/rooms', (error, response) => {
//         if (!error && response.statusCode === 200) {
//             let data = JSON.parse(response.body);
//             let results = [];
//             data.forEach((room) => {
//                 if (room.site === site && !results.includes(room.floor)) results.push(room.floor);
//             });
//             cb(results);
//         } else {
//             console.log('GET request failed', error);
//         }
//     }).auth('user', 'hackathon', false);
// };

export function getSiteFloorList(site: any) {
    return new Promise(function(resolve, reject) {
        request.get('http://52.57.171.54:8080/rooms', (error, response, body) => {
            if (!error && response.statusCode === 200) {
                let data = JSON.parse(body);
                let results: any = [];
                data.forEach((room: any) => {
                    if (room.site === site && !results.includes(room.floor)) results.push(room.floor);
                });
                resolve(results);
            } else {
                console.log('GET request failed', error);
                reject(error);
            }
        }).auth('user', 'hackathon', false);
    });
};

export function getRoomNames(site?: any) {
    return new Promise(function(resolve, reject) {
        request.get('http://52.57.171.54:8080/rooms', (error, response, body) => {
            if (!error && response.statusCode === 200) {
                let data = JSON.parse(body);
                let results: any = [];
                data.forEach((room: any) => {
                    if (!results.includes(room.name)) results.push(room.name);
                });
                resolve(results);
            } else {
                console.log('GET request failed', error);
                reject(error);
            }
        }).auth('user', 'hackathon', false);
    });
};

/**
 * returns an array containing the sites
 *
 * @usage
 * getSites((sites)=>{
    console.log(sites);
  });
 *
 */
// exports.getSites = (cb) => {
//     request.get('http://52.57.171.54:8080/rooms', (error, response) => {
//         if (!error && response.statusCode === 200) {
//             let data = JSON.parse(response.body);
//             let results = [];
//             data.forEach((room) => {
//                 if (!results.includes(room.site)) results.push(room.site);
//             });
//             cb(results);
//         } else {
//             console.log('GET request failed', error);
//         }
//     }).auth('user', 'hackathon', false);
// };

export function getSites() : Promise<Array<any>> {

    return new Promise(function(resolve, reject) {
        request.get('http://52.57.171.54:8080/rooms', (error, response, body) => {
            if (!error && response.statusCode === 200) {
                let data = JSON.parse(body);
                let results: any = [];
                data.forEach((room: any) => {
                    if (!results.includes(room.site)) results.push(room.site);
                });
                resolve(results);
            } else {
                console.log('GET request failed', error);
                reject(error);
            }
        }).auth('user', 'hackathon', false);
    });
}


export function findClosestMatch(text: string, matchArray: Array<string>) {
    let match: string;
    let levDistance = 999999;
    console.log(matchArray);
    for (let i = 0; i < matchArray.length; i++) {
        let distance = levenshtein.get(text, matchArray[i]);
        if (distance < levDistance) {
            match = matchArray[i];
            levDistance = distance;
        }
    }
    console.log("Closest Lev match was " + match);
    return match;
};
