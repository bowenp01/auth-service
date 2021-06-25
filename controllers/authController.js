//=============================================================
//  Change Log
//  Created : 23-JUN-2020
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

const controllerDebugger = require("debug")("app:controllers"); // Use this instead of console.log() so we can controll debug info
const Joi = require("joi"); // Schema validation -- will validate user data
const config = require("config"); // will use settings from config/*.json based on NODE_ENV
const jwt = require("jsonwebtoken");

//-------------------------------------------------------------
// Include our own custom modules here
//-------------------------------------------------------------
const adHelper = require("../active-directory/activeDirectoryHelper"); // How we access active directory
const { validate, CredentialSetEnum } = require("../models/authRX"); // our auth request model
const { date } = require("joi");
const { checkApplicationKey } = require(`../database/${config.get(
  "database"
)}/applicationKey`); // Defined in the config files
const { authoriseLocal } = require(`../database/${config.get(
  "database"
)}/authorise`); // Defined in the config files

async function postLogin(req, res, next) {
  //-------------------------------------------------------------
  // Get user data from key value pairs in request body
  //-------------------------------------------------------------

  // According to the RFC application/json should be always UTF (specifically UTF-8 by default) and shouldn't have a charset property,
  // but in practice if you don't set it many consumers will mangle the result including some browsers, which is why it's a
  // common pattern to explicitly define the charset.
  res.set({ "content-type": "application/json; charset=utf-8" });

  const un = req.body.username;
  const pw = req.body.password;
  const cs = req.body.credentialset; // LOCAL || ACTIVEDIRECTORY
  const ak = req.body.appkey; // Application Key (Issued by us)

  //-------------------------------------------------------------
  // Define schema for input validation.
  // We can build more complex rules into this as needed.
  //-------------------------------------------------------------
  controllerDebugger("Creating validation schema");

  const authRX = {
    username: un,
    password: pw,
    credentialset: cs,
    key: ak,
  };

  controllerDebugger("Data to validate : " + authRX);

  //-------------------------------------------------------------
  // NEVER NEVER EVER trust the data the client sends you
  // Validate the data against the schema we just defined
  //-------------------------------------------------------------
  controllerDebugger("Validating body key value pairs against schema");
  const validationResult = validate(authRX);

  //-------------------------------------------------------------
  // If the data doesn't meet the rules defined by the schema
  // return a status 200 with an error message
  //-------------------------------------------------------------
  if (validationResult.error) {
    controllerDebugger(
      "Validation failed:" + validationResult.error.details[0].message
    );
    const validationError = {};
    validationError.error = validationResult.error.details[0].message;
    res.status(200).send(validationError);
    return;
  } else {
    controllerDebugger("Validation successfull");
  }

  //-------------------------------------------------------------
  // Check application key is valid
  //-------------------------------------------------------------
  controllerDebugger("Checking application key..");
  let keyVerified = false;
  try {
    keyVerified = await checkApplicationKey(ak);
    if (keyVerified == false) {
      const keyFailBody = {};
      keyFailBody.error = "Invalid application key";
      res.status(200).json(keyFailBody);
      controllerDebugger("authController : No matching application key found");
      return;
    }
  } catch (error) {
    const keyFailBody = {};
    keyFailBody.error = "Could not read from Database";
    res.status(200).json(keyFailBody);
    controllerDebugger(
      "authController : Could not read application key from Database"
    );
    return;
  }

  //-------------------------------------------------------------
  // If we have arrived here then we have all the required credentials, user
  // is allowed to use this application and the application is registered with
  // the auth service (and was issued a valid application key).
  //-------------------------------------------------------------

  if (cs === CredentialSetEnum.ACTIVEDIRECTORY) {
    // Active Directory credential set
    adHelper.AuthenticateUser(un, pw, (authorised) => {
      if (authorised) {
        const token = jwt.sign({ username: un }, config.get("jwtPrivateKey"));
        const successBody = {};

        successBody.accessed = new Date(); // This is UTC dateTime!
        res.header("x-auth-token", token);
        res.status(200).json(successBody);
        controllerDebugger("authController : Authenticated user");
        return;
      } else {
        // Could not authenticate user with credentials provided
        const failBody = {};
        failBody.error = "Invalid username or password";
        res.status(401).json(failBody); // 401 - Unauthorized client error status response code
        controllerDebugger("authController : Could not authenticate user");
        return;
      }
    });
  } else {
    // Local credential set
    authoriseLocal(un, pw, (authorised) => {
      if (authorised) {
        const token = jwt.sign({ username: un }, config.get("jwtPrivateKey"));
        const successBody = {};
        successBody.accessed = new Date(); // This is UTC dateTime!
        res.header("x-auth-token", token);
        res.status(200).json(successBody);
        controllerDebugger("authController : Authenticated user");
        return;
      } else {
        // Could not authenticate user with credentials provided
        const failBody = {};
        failBody.error = "Invalid username or password";
        res.status(401).json(failBody); // 401 - Unauthorized client error status response code
        controllerDebugger("authController : Could not authenticate user");
        return;
      }
    });
  }
}

// export the postLogin function as a property of exports
module.exports.postLogin = postLogin;
