'use strict';

const builder = require('botbuilder');
const express = require('express');

const connector = new builder.ChatConnector();

let bot = new builder.UniversalBot(connector);

// endpoints for the bot
// bot.dialog('/', (session) => {
//   session.send('you said', session.message);
// });

// waterfall endpoint
bot.dialog('/', [
  (session) => { builder.Prompts.text(session, 'Please enter your name'); },
  (session, result) => { session.send('your name is '+result.response); }
]);


let app = express();
app.use((req, res) => res.status(404).json({ error: 'Not Found' }));

module.exports = app;
