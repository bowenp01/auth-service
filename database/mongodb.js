//=============================================================
//  Change Log
//  Created : 07-FEB-2020
//  Author : Paul Bowen
//=============================================================

//-------------------------------------------------------------
// Include all the third party modules we will need
//-------------------------------------------------------------
const mongoose = require('mongoose');
const config = require('config'); // will use settings from config/*.json based on NODE_ENV
const chalk = require('chalk'); // Beautify console output
const databaseDebugger = require('debug')('app:database'); // Use this instead of console.log() so we can controll debug info
var add = require('date-fns/add');
const {
    string
} = require('joi');

// our database
let db;

// Get database username and password from environment variables
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;

// Get connection string from config
const tmpEndpoint1 = config.get('connection-string');

// replace placeholders for username and password with actual values
const tmpEndpoint2 = tmpEndpoint1.replace('<USERNAME>', username);
const endpoint = tmpEndpoint2.replace('<PASSWORD>', password);

// Create the schema for our MongoDb database session document (like a row in oracle)
const sessionSchema = new mongoose.Schema({
    sessionId: String,
    expires: Date
});

// Create the schema for our application-key document in the MongoDb
const appKeySchema = new mongoose.Schema({
    appKey: String,
    appName: String,
    whiteList: Boolean,
    expires: Date
});

// Create the schema for our whitelist
const whiteListSchema = new mongoose.Schema({
    userName: String,
    appKey: String,
    expires: Date
})

// Create the model for our mongoDb session document
const Session = mongoose.model('session', sessionSchema);

// Create the model for our application-key document
const ApplicationKey = mongoose.model('application-key', appKeySchema);

// Create th model for our whitelist document
const WhiteList = mongoose.model('white-list', whiteListSchema);

//-------------------------------------------------------------
// Function to insert a session into the database
//-------------------------------------------------------------
async function insertSession(sessionId, secondsToExpiry) {
    // calculate the expiry date as now plus seconds to expiry
    expiryDate = add(Date.now(), {
        seconds: secondsToExpiry
    });

    // create a new instance of a session using the function parameters
    const session = new Session({
        sessionId: sessionId,
        expires: expiryDate
    });

    await session.save();
}

async function insertKey() {
    // create a new instance of a session using the function parameters
    const key = new ApplicationKey({
        appKey: '12345',
        appName: 'Dummy-App',
        whiteList: false,
        expires: null
    });

    await key.save();
}

//-------------------------------------------------------------
// Function to check whether application key is valid
//-------------------------------------------------------------
async function checkApplicationKey(aKey, aUseWhiteList) {
    let result = false;
    await ApplicationKey.find({
        appKey: aKey,
        expires: null
    }, function (err, keys) {
        if (err) {
            // Something went wrong
            throw new Error('Failed to check application key');
        };

        // If we have any key matching the filter then there is a valid key
        // We also want to check if this application uses a whitelist
        if (keys.length > 0) {
            if (keys[0].whiteList) {
                aUseWhiteList = true
            }
            result = true;
        } else {
            result = false;
        }
    });

    return result;
}

//-------------------------------------------------------------
// Function to check whether user is whitelisted
//-------------------------------------------------------------
async function checkWhiteList(aUserName, aKey) {
    let result = false;
    await WhiteList.find({
        userName: aUserName,
        appKey: aKey,
        $or: [{
            expires: null
        }, {
            expires: {
                $gt: Date.now()
            }
        }]
    }, function (err, listEntries) {
        if (err) {
            // Something went wrong
            throw new Error('Failed to check whitelist');
        };

        // If we have any entry matching the filter then there is a valid whitelist entry
        // We also want to check if this application uses a whitelist
        if (listEntries.length > 0) {
            result = true;
        } else {
            result = false;
        }
    });

    return result;
}

//-------------------------------------------------------------
// Initialise our database and connect
//-------------------------------------------------------------
function initialize() {
    return new Promise((resolve, reject) => {
        console.log(chalk.white('Attempting connection to database ...'));
        mongoose.connect(endpoint, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            })
            .then(() => {
                // We connected successfully.
                db = mongoose.connection;
                console.log(chalk.white('Connected to MongoDb'));
                resolve();
            })
            .catch((err) => {
                // We failed to connect. Reject the promise passing the error as a parameter
                console.log(chalk.white.bgRed.bold('Could not connect to MongoDb!'));
                console.log(chalk.grey(err));
                reject(err);
            });
    })
}

//-------------------------------------------------------------
// Here we close down the database
//-------------------------------------------------------------
function close() {
    return new Promise((resolve, reject) => {
        console.log(chalk.white('Closing connection to mongoDb'));
        db.close();
        resolve();
    });
}

//-------------------------------------------------------------
// We export these functions as properties so that they
// can be invoked externally
//-------------------------------------------------------------
module.exports.initialize = initialize;
module.exports.close = close;
module.exports.insertSession = insertSession;
module.exports.checkApplicationKey = checkApplicationKey;
module.exports.checkWhiteList = checkWhiteList;
module.exports.insertKey = insertKey;