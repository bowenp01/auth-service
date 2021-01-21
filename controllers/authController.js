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

//-------------------------------------------------------------
// Include our own custom modules here
//-------------------------------------------------------------
const User = require('../models/user'); // our user model

function postLogin(req, res, next) {
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
  // We can build more rules into this as we need to.
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

  // Check application key is valid
  // [TODO]

  // Check username is whitelisted * FOR APPLICATION DEFINED BY KEY *
  // [TODO]

  // If we have arrived here then we have all the required credentials, user
  // is allowed to use this application and the application is registered with
  // the auth service (and was issued a valid application key).

  // Use Active Directory to authenticate the username and password
  adHelper.AuthenticateUser(un, pw, (success, error) => {
    if (success) {
      // Sucessfully authenticated the user
      const sessionId = uuidv4(); // UUIDv4 is a random token
      const secondsToExpiry = 300; // Seconds until the session expires
      // [TODO] write the sessionId and it's timeout to our database
      const successBody = {};
      successBody.secureToken = sessionId;
      successBody.localId = un;
      successBody.expiresIn = secondsToExpiry;
      res.status(200).json(successBody);
      controllerDebugger('authController : Authenticated user');
    } else {
      // Could not authenticate user with credentials provided
      const failBody = {};
      failBody.error = error.message;
      res.status(error.code).json(failBody);
      controllerDebugger('authController : Could not authenticate user');

    }
  });
};

// export the postLogin function as a property of exports
module.exports.postLogin = postLogin;