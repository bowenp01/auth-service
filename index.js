//=============================================================
//  Change Log
//  Created : 21-MAY-2021
//  Author : Paul Bowen
//
// This is the entry point for our CIT REST service
// It handles gracefully starting up and shutting down the
// service.
//=============================================================

//-------------------------------------------------------------
// Include all the third party modules we will need
//-------------------------------------------------------------
require("dotenv").config(); // Always do this first. It will load environment variables from the .env file
const config = require("config"); // will use settings from config/*.json based on NODE_ENV
const chalk = require("chalk"); // Beautify console output

//-------------------------------------------------------------
// Include all our custom modules we will need
//-------------------------------------------------------------
const service = require("./service"); // this is our REST service
const database = require(`./database/${config.get("database")}/database`); // Defined in the config files

//-------------------------------------------------------------
// iF there's no jwtPrivateKey defined shut down immediatley
//-------------------------------------------------------------
if (!config.get("jwtPrivateKey")) {
  console.log(chalk.red("FATAL ERROR: jwtPrivateKey is not defined"));
  process.exit(1);
}
//-------------------------------------------------------------
// Spin up our service
//-------------------------------------------------------------
startup();

//#region ' Handlng reasons for shutting down the service'
//-------------------------------------------------------------
// Signal recieved to shutdown application (eg. sent by 'kill')
//-------------------------------------------------------------
process.on("SIGTERM", () => {
  console.log("");
  console.log(chalk.white("Received SIGTERM"));
  console.log("");
  shutdown();
});

//-------------------------------------------------------------
// Signal recieved to shutdown application (eg. ctrl+c)
//-------------------------------------------------------------
process.on("SIGINT", () => {
  console.log("");
  console.log(chalk.white("Received SIGINT"));
  console.log("");
  shutdown();
});

//-------------------------------------------------------------
// Error thrown and not handled
//-------------------------------------------------------------
process.on("uncaughtException", (err) => {
  console.log("");
  console.log(chalk.red.bold("Uncaught exception"));
  console.error(err);
  shutdown(err);
});
//#endregion

//#region 'Starting up and shutting down the service'
//-------------------------------------------------------------
// An async method to spin up our application
//-------------------------------------------------------------
async function startup() {
  console.clear();
  console.log(chalk.white("Loading Register service"));

  // Initialise our database
  try {
    await database.initialize();
  } catch (err) {
    console.error(err);
    process.exit(1); // Non-zero failure code
  }

  // Initialize our web server
  try {
    await service.initialize();
  } catch (err) {
    console.error(err);
    process.exit(1); // Non-zero failure code
  }
}

//-------------------------------------------------------------
// An async method to shut down our application gracefully
//-------------------------------------------------------------
async function shutdown(e) {
  let err = e;

  console.log(chalk.white.bold("Shutting down"));

  // Close the service gracefully
  try {
    await database.close();
    await service.close();
  } catch (e) {
    console.log(chalk.red("Encountered error"), e);
    err = err || e;
  }

  console.log(chalk.white("Exiting process"));

  if (err) {
    process.exit(1); // Non-zero failure code
  } else {
    process.exit(0);
  }
}
//#endregion
