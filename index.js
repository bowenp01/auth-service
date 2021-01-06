//--------------------------------------------------------------------------------
//  Change Log
//  Created : 23-DEC-2020
//  Author : Paul Bowen
//--------------------------------------------------------------------------------

// Include all the packages we will need
const path = require('path'); // Required for OS agnostic pathing
const express = require('express'); // Middleware that takes care of routing and lots of other stuff
const bodyParser = require('body-parser'); // Required to access the body of http requests


const User = require('./models/user.js');
//const errorController = require('./controllers/error');

// Create an instance of express
const app = express();


// Add our routing modules here
const authRoutes = require('./routes/authRoutes');

// Support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({
  extended: false
}));

// Support parsing of application/json type post data
app.use(bodyParser.json());

// Used for relative pathing
app.use(express.static(path.join(__dirname, 'public')));

// Run through our routes (order is important here)
app.use(authRoutes);

// Register a listnener
console.log('Listening on port <3000>');
app.listen(3000);