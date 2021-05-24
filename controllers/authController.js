//=============================================================
//  Change Log
//  Created : 23-DEC-2020
//  Author : Paul Bowen
//
// Debug environment variable : app:controllers
// MAC
// 'export DEBUG=app:controllers' to switch on debugging for controllers
// 'export DEBUG=' to switch off all debugging
// WINDOWS
// 'SET DEBUG=app:controllers' to switch on debugging for controllers
// 'SET DEBUG=' to switch off all debugging
//=============================================================

//-------------------------------------------------------------
// Include all the third party modules we will need
//-------------------------------------------------------------

const adHelper = require('../active-directory/activeDirectoryHelper'); // How we access active directory
const controllerDebugger = require('debug')('app:controllers'); // Use this instead of console.log() so we can controll debug info
const {
  v4: uuidv4
} = require('uuid'); // Used to generate a session Id
const Joi = require('joi'); // Schema validation -- will validate user data
const config = require('config'); // will use settings from config/*.json based on NODE_ENV

//-------------------------------------------------------------
// Include our own custom modules here
//-------------------------------------------------------------
const User = require('../models/user'); // our user model
const database = require(`../database/${config.get('database-module')}`); // Defined in the config files

async function postLogin(req, res, next) {
  //-------------------------------------------------------------
  // Get user data from key value pairs in request body
  //-------------------------------------------------------------
  const un = req.body.username; // NADEX Username (Active directory)
  const pw = req.body.password; // NADEX Password (Active directory)
  const ak = req.body.key; // Application Key (Issued by us)
  const rst = req.body.returnSecureToken; // True/False

  //#region 'Validating user data'
  //-------------------------------------------------------------
  // Define schema for input validation.
  // We can build more complex rules into this as needed.
  //-------------------------------------------------------------
  controllerDebugger('Creating validation schema');
  const schema = Joi.object({
    username: Joi.string().alphanum().min(8).required(),
    password: Joi.string().required(),
    key: Joi.string().required(),
    returnSecureToken: Joi.boolean().required()
  });

  const dataToValidate = {
    username: un,
    password: pw,
    key: ak,
    returnSecureToken: rst
  };

  //-------------------------------------------------------------
  // NEVER NEVER EVER trust the data the client sends you
  // Validate the data against the schema we just defined
  //-------------------------------------------------------------
  controllerDebugger('Validating body key value pairs against schema');
  const validationResult = schema.validate(dataToValidate);

  //-------------------------------------------------------------
  // If the data doesn't meet the rules defined by the schema
  // return a status 200 with an error message
  //-------------------------------------------------------------
  if (validationResult.error) {
    controllerDebugger('Validation failed:' + validationResult.error.details[0].message);
    const validationError = {};
    validationError.error = validationResult.error.details[0].message;
    res.status(200).send(validationError);
    return;
  } else {
    controllerDebugger('Validation successfull');
  }
  //#endregion


  let useWhiteList = false;
  let keyVerified = false;

  // Check application key is valid
  try {
    keyVerified = await database.checkApplicationKey(ak, useWhiteList);
    if (keyVerified == false) {
      const keyFailBody = {};
      keyFailBody.error = 'No matching application key found';
      res.status(200).json(keyFailBody);
      controllerDebugger('authController : No matching application key found');
      return;
    }
  } catch (error) {
    const keyFailBody = {};
    keyFailBody.error = 'Could not read from MongoDB';
    res.status(200).json(keyFailBody);
    controllerDebugger('authController : Could not read application key from MongoDB');
    return;
  }

  // If application uses a whitelist then we need to check the user is on it
  if (useWhiteList) {
    let whiteListed = false;
    try {
      whiteListed = await database.checkWhiteList(un, ak);
      if (whitelisted == false) {
        const whitelistFailBody = {};
        whitelistFailBody.error = 'User not whitelisted for this application';
        res.status(200).json(whitelistFailBody);
        controllerDebugger('authController : User not whitelisted for this application');
        return;
      }
    } catch (error) {
      const whitelistFailBody = {};
      whitelistFailBody.error = 'Could not read from MongoDB';
      res.status(200).json(whitelistFailBody);
      controllerDebugger('authController : Could not read whitelist from MongoDB');
      return;
    }
  }

  // If we have arrived here then we have all the required credentials, user
  // is allowed to use this application and the application is registered with
  // the auth service (and was issued a valid application key).

  // Use Active Directory to authenticate the username and password
  adHelper.AuthenticateUser(un, pw, async (success, error) => {
    if (success) {
      // Sucessfully authenticated the user
      const sessionId = uuidv4(); // UUIDv4 is a random token
      const secondsToExpiry = 300; // Seconds until the session expires

      // Write the sessionId and it's timeout to our database
      try {
        await database.insertSession(sessionId, secondsToExpiry);
      } catch (error) {
        // 
        const mongoFailBody = {};
        mongoFailBody.error = 'Could not write to MongoDB';
        res.status(200).json(mongoFailBody);
        controllerDebugger('authController : Could not write to MongoDB');
        return;
      }


      const successBody = {};
      successBody.secureToken = sessionId;
      successBody.localId = un;
      successBody.expiresIn = secondsToExpiry;
      res.status(200).json(successBody);
      controllerDebugger('authController : Authenticated user');
      return;
    } else {
      // Could not authenticate user with credentials provided
      const failBody = {};
      failBody.error = error.message;
      res.status(error.code).json(failBody);
      controllerDebugger('authController : Could not authenticate user');
      return;
    }
  });
};

// export the postLogin function as a property of exports
module.exports.postLogin = postLogin;