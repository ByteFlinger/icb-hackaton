'use strict';

const request = require('request');

/**
 * returns an array of room names 
 * 
 * @usage
 * getAvailableRooms({floor: 'Floor 06'}, (rooms) => {
    console.log(rooms);
  });
 * 
 */ 
exports.getAvailableRooms = (options, cb) => {
  options = options ? options : {};

  request.get('http://52.57.171.54:8080/rooms', (error, response) => {
    if (!error && response.statusCode === 200) {
      let data = JSON.parse(response.body);
      let matchOptions = (room) => {
        return !room.booking && (room.site === (options.site || room.site)) && (room.floor === (options.floor || room.floor));
      };
      cb(data.filter(matchOptions));
    } else {
      console.log('GET request failed', error);
    }
  }).auth('user', 'hackathon', false);
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
        if(room.name === name && !trigger){ cb(room); trigger = true; }
      }); 
    } else {
      console.log('GET request failed', error);
    }
  }).auth('user', 'hackathon', false);
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
exports.getSites = (cb) => {
  request.get('http://52.57.171.54:8080/rooms', (error, response) => {
    if (!error && response.statusCode === 200) {
      let data = JSON.parse(response.body);
      let results = [];
      data.forEach((room) => {
        if(!results.includes(room.site)) results.push(room.site);
      });
      cb(results);
    } else {
      console.log('GET request failed', error);
    }
  }).auth('user', 'hackathon', false);
};



