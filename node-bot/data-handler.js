'use strict';

const request = require('request');
const levenshtein = require('fast-levenshtein');

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

function compareRoomBooking(room1, room2) {
  if (!room1.booking && room2.booking) {
    return -1;
  } else if (room1.booking && !room2.booking) {
    return 1;
  }
  // a must be equal to b
  return 0;
}

exports.getAvailableRooms = (options) => {
    options = options ? options : {};

    return new Promise(function(resolve, reject) {
        request.get('http://52.57.171.54:8080/rooms', (error, response) => {
            if (!error && response.statusCode === 200) {
                let data = JSON.parse(response.body);
                let matchOptions = (room) => {
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
exports.getRoomState = (name, cb) => {
    request.get('http://52.57.171.54:8080/rooms', (error, response) => {
        if (!error && response.statusCode === 200) {
            let data = JSON.parse(response.body);
            let trigger = false;
            data.forEach((room) => {
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

exports.getSiteFloorList = (site) => {
    return new Promise(function(resolve, reject) {
        request.get('http://52.57.171.54:8080/rooms', (error, response) => {
            if (!error && response.statusCode === 200) {
                let data = JSON.parse(response.body);
                let results = [];
                data.forEach((room) => {
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

exports.getRoomNames = (site) => {
    return new Promise(function(resolve, reject) {
        request.get('http://52.57.171.54:8080/rooms', (error, response) => {
            if (!error && response.statusCode === 200) {
                let data = JSON.parse(response.body);
                let results = [];
                data.forEach((room) => {
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

exports.getSites = () => {

    return new Promise(function(resolve, reject) {
        request.get('http://52.57.171.54:8080/rooms', (error, response) => {
            if (!error && response.statusCode === 200) {
                let data = JSON.parse(response.body);
                let results = [];
                data.forEach((room) => {
                    if (!results.includes(room.site)) results.push(room.site);
                });
                resolve(results);
            } else {
                console.log('GET request failed', error);
                reject(error);
            }
        }).auth('user', 'hackathon', false);
    });
};


exports.findClosestMatch = function(text, matchArray) {
    let match;
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
