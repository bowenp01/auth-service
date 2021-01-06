//--------------------------------------------------------------------------------
//  Change Log
//  Created : 23-DEC-2020
//  Author : Paul Bowen
//--------------------------------------------------------------------------------

const User = require('../models/user');
const adHelper = require('../active-directory/activeDirectoryHelper');
const {
  v4: uuidv4
} = require('uuid');

exports.postLogin = (req, res, next) => {
  const un = req.body.username; // NADEX Username (Active directory)
  const pw = req.body.password; // NADEX Password (Active directory)
  const ak = req.body.key; // Application Key (Issued by us)

  // Check username has a value
  console.log('Checking for null username');
  if (!un.trim()) {
    // username is empty .. do something 
    const usernameErrorBody = {};
    usernameErrorBody.error = 'Username is null';
    res.status(200).json(usernameErrorBody);
    console.log('Username is null');
    return;
  }

  // Check password has a value
  console.log('Checking for null password');
  if (!pw.trim()) {
    // password is empty .. do something 
    const passwordErrorBody = {};
    passwordErrorBody.error = 'Password is null';
    res.status(200).json(passwordErrorBody);
    console.log('Password is null');
    return;
  }

  // Check application key has a value
  console.log('Checking for null application key');
  if (!ak.trim()) {
    // application key is empty .. do something
    const keyErrorBody = {};
    keyErrorBody.error = 'Application key is null';
    res.status(200).json(keyErrorBody);
    console.log('Application key is null');
    return;
  }

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
      const sessionId = uuidv4();
      const timeout = '311220210000';
      // [TODO] write the sessionId and it's timeout to our database
      const successBody = {};
      successBody.sessionId = sessionId;
      successBody.timeout = timeout;
      res.status(200).json(successBody);
      console.log('Authenticated user');
    } else {
      // Could not authenticate user with credentials provided
      const failBody = {};
      failBody.error = error.message;
      res.status(error.code).json(failBody);
      console.log('Could not authenticate user');

    }
  });
};