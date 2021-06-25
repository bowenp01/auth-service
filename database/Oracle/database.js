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

const oracledb = require("oracledb"); // Include node-oracledb so w can access an oracle database
const config = require('config'); // will use settings from config/*.json based on NODE_ENV
const chalk = require('chalk'); // Beautify console output
const databaseDebugger = require('debug')('app:DBService'); // Use this instead of console.log() so we can controll debug info

const connectionPool = {
    user: process.env.DB_USERNAME,  // Get database username from environment variables
    password: process.env.DB_PASSWORD,  // Get database password from environment variables
    connectString: config.get('connection-string'), // Get connection string from config
    poolMin: 10,
    poolMax: 10,
    poolIncrement: 0
  };

//-------------------------------------------------------------
// Utility methods
//-------------------------------------------------------------

  // Simple boilerplate method to execute SQL statement
function simpleExecute(statement, binds = [], opts = {}) {
    return new Promise(async (resolve, reject) => {
      let conn;
  
      opts.outFormat = oracledb.OBJECT;
      opts.autoCommit = true;
  
      try {
        conn = await oracledb.getConnection();
        const result = await conn.execute(statement, binds, opts);
        resolve(result);
      } catch (err) {
        reject(err);
      } finally {
        if (conn) {
          // conn assignment worked, need to close
          try {
            await conn.close();
          } catch (err) {
            console.log(err);
          }
        }
      }
    });
  };


//-------------------------------------------------------------
// Initialise our database and connect
//-------------------------------------------------------------

// Method to create our connection pool which is stored in an internal connection pool cache
// Thread pool has been configured in index.js so we have enough threads to service all of the db connections
function initialize() {
    return new Promise((resolve, reject) => {
        console.log(chalk.white('Attempting connection to database ...'));
        const pool = oracledb.createPool(connectionPool)
            .then(() => {
                // We connected successfully.
                console.log(chalk.white('Connected to Oracle database'));
                resolve();
            })
            .catch((err) => {
                // We failed to connect. Reject the promise passing the error as a parameter
                console.log(chalk.white.bgRed.bold('Could not connect to Oracle database!'));
                console.log(chalk.grey(err));
                reject(err);
            });
    })
};
  
// Close down the connection pool
function close() {
    return new Promise((resolve, reject) => {
        console.log(chalk.white('Closing connection to OracleDb'));
        oracledb.getPool().close();
        resolve();
    });
};


// Export our initialize and close functions so they can be invoked externally
module.exports.initialize = initialize;
module.exports.close = close;
module.exports.simpleExecute = simpleExecute;

