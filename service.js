//=============================================================
//  Change Log
//  Created : 23-DEC-2020
//  Author : Paul Bowen
//=============================================================

//-------------------------------------------------------------
// Include all the third party modules we will need
//-------------------------------------------------------------
const path = require('path'); // Required for OS agnostic pathing
const express = require('express'); // Takes care of routing and lots of other stuff
const bodyParser = require('body-parser'); // Required to access the body of http requests
const helmet = require('helmet'); // Some protection against known vulnerabilities
const chalk = require('chalk'); // Beautify console output
const config = require('config'); // will use settings from config/*.json based on NODE_ENV

//-------------------------------------------------------------
// Include our own custom modules here
//-------------------------------------------------------------
const authRoute = require('./routes/authRoute'); // Include our routing modules here.
const heartbeatRoute = require('./routes/heartbeatRoute');
require('./utilities/timeStarted').getTimestamp();

let app; // Needs to be public scope within the module
let port; // Needs to be public scope within the module

//-------------------------------------------------------------
// Initialise our service and start listening on <port>
//-------------------------------------------------------------
function initialize() {
    return new Promise((resolve, reject) => {
        console.log(chalk.white('Initializing request pipeline'));
        //-------------------------------------------------------------
        // When this service is hosted, eg.on Heroku a port will be
        // set by the host using environment variable 'PORT'.
        // Attempt to use this first and if not found default to
        // port 3000
        //-------------------------------------------------------------
        port = process.env.PORT || config.get('default-port');

        //-------------------------------------------------------------
        // Create an instance of express .. this will do all the 
        // heavy lifting for us
        //-------------------------------------------------------------
        app = express();

        //-------------------------------------------------------------
        // Inject middleware into the request processing pipelene here
        //-------------------------------------------------------------
        app.use(helmet()); // Some protection against known vulnerabilities
        app.use(bodyParser.json()); // Support parsing of application/json type post data
        app.use(express.static(path.join(__dirname, 'public'))); // Expose the public directory in case we need to serve any static content

        //-------------------------------------------------------------
        // Inject routing middleware into the request processing pipelene 
        // The order in which we inject the routing middlware is important!
        //-------------------------------------------------------------
        app.use(authRoute);
        app.use(heartbeatRoute);

        //-------------------------------------------------------------
        // Give the user some output so they know how the service is
        // configured to run 
        //-------------------------------------------------------------
        outputStartup();

        //-------------------------------------------------------------
        // Register a listner
        //-------------------------------------------------------------
        app.listen(port)
            .on('listening', () => {
                console.log(chalk.black.bgYellow.bold('Listening on port:' + port));
                console.log('');
                resolve();
            })
            .on('error', err => {
                reject(err);
            });

    });
}

//-------------------------------------------------------------
// Here we close down he service cleaning up any resources
// that we need to
//-------------------------------------------------------------
function close() {
    return new Promise((resolve, reject) => {
        // [TODO] Cleanup any resources here
        console.log(chalk.white('Cleaning up service resources'));
        resolve();
    });
}

//-------------------------------------------------------------
// Let the user know some of the settings which configure
// how the REST service is set up
// Chalk just lets us color and style the output
//-------------------------------------------------------------
function outputStartup() {
    console.log('');
    console.log(chalk.white.bgBlue.bold(config.get('name')));
    console.log(chalk.white.bgBlue.bold(config.get('author')));
    console.log('');
    console.log(chalk.white.bold('Checking environment variables:'));
    console.log('');
    console.log(chalk.white.bold('DEBUG: ') + process.env.DEBUG);
    if (!process.env.DEBUG) {
        console.log(chalk.gray.italic('\tDebug log to console disabled. See documentation for possible DEBUG values'));
    };
    console.log(chalk.white.bold('NODE_ENV: ') + process.env.NODE_ENV);
    if (!process.env.NODE_ENV) {
        console.log(chalk.grey.italic('\tNODE_ENV not set. Using configuration from default.json'));
    }
    console.log(chalk.white.bold('PORT: ') + process.env.PORT);
    if (!process.env.PORT) {
        console.log(chalk.gray.italic('\tValue undefined. Using default port :') + chalk.white(port))
    }
    console.log('');
    console.log(chalk.white.bold('Database setup from configuration file:'));
    console.log('');
    console.log(chalk.white.bold('DATABASE: ') + config.get('database'));
    console.log(chalk.white.bold('CONNECTION-STRING: ') + config.get('connection-string'));
    console.log('');
    return;
}

//-------------------------------------------------------------
// We export the initialize and close functions as properties so that they
// can be invoked externally
//-------------------------------------------------------------
module.exports.initialize = initialize;
module.exports.close = close;