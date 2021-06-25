//=============================================================
//  Change Log
//  Created : 23-MAY-2021
//  Author : Paul Bowen
//
// Debug environment variable : app:controllers
// MAC
// 'export DEBUG=app:database' to switch on debugging for controllers
// 'export DEBUG=' to switch off all debugging
//
// WINDOWS
// 'SET DEBUG=app:DBService' to switch on debugging for database service
// 'SET DEBUG=' to switch off all debugging
//=============================================================

const config = require('config'); // will use settings from config/*.json based on NODE_ENV
const chalk = require('chalk'); // Beautify console output
const databaseDebugger = require('debug')('app:DBService'); // Use this instead of console.log() so we can controll debug info


//-------------------------------------------------------------
// Initialise our database and connect
//-------------------------------------------------------------

function initialize() {
    return new Promise((resolve, reject) => {
        console.log(chalk.white('Attempting connection to Dummy database ...'));
        console.log(chalk.white('Connected to Dummy database'));
        resolve();        
    });
};
  
// Close down the connection pool
function close() {
    return new Promise((resolve, reject) => {
        console.log(chalk.white('Closing connection to Dummy database'));
        resolve();
    });
};


// Export our initialize and close functions so they can be invoked externally
module.exports.initialize = initialize;
module.exports.close = close;


