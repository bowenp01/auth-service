//--------------------------------------------------------------------------------
//  Change Log
//  Created : 23-DEC-2020
//  Author : Paul Bowen
//--------------------------------------------------------------------------------

// Include the package
const ADDebugger = require("debug")("app:controllers"); // Use this instead of console.log() so we can controll debug info
let ActiveDirectory = require("activedirectory");

// This will hold our instance of an active directory
let _ad = null;

class LDAPError {
  constructor(code, message) {
    this.code = code;
    this.message = message;
  }
}

function _initialiseActiveDirectory() {
  ADDebugger("activeDirectoryHelper - Initialising active directory");
  // Set up the configuration object
  let config = {
    url: "LDAP://cymru.nhs.uk:389",
    baseDN: "DC=cymru,DC=nhs,DC=uk",
    username: "CYMRU\\Gen092954",
    password: process.env.AD_MASTER_PW,
  };

  // Create an instance of active directory
  _ad = new ActiveDirectory(config);
}

function NadexAuthenticateUser(sAMAccountName, password, callback) {
  let success = false;

  // Test if we have an instance of an active directory
  if (!_ad) {
    _initialiseActiveDirectory();
  }

  ADDebugger(
    "activeDirectoryHelper - Attempt authenticate :" +
      sAMAccountName +
      " / " +
      password
  );
  // Attempt to authenticate user
  _ad.authenticate("CYMRU\\" + sAMAccountName, password, function (err, auth) {
    if (err) {
      // Something went wrong
      ADDebugger("activeDirectoryHelper - Active directory error: ");
      ADDebugger(JSON.stringify(err));
      callback(false);
      return;
    }

    if (!auth) {
      // Nothing went wrong but we couldn't authenticate on the given credentials
      ADDebugger(
        "activeDirectoryHelper - Authentication Failed : " + sAMAccountName
      );
      callback(false);
    } else {
      // OK .. we authenticated the given credentials
      ADDebugger(
        "activeDirectoryHelper - Authentication Success : " + sAMAccountName
      );
      callback(true);
    }
  });
}

function DummyAuthenticateUser(sAMAccountName, password, callback) {
  callback(true);
  return;
}

exports.AuthenticateUser = NadexAuthenticateUser;
exports.DummyAuthenticateUser = DummyAuthenticateUser;
