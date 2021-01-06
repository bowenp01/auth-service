//--------------------------------------------------------------------------------
//  Change Log
//  Created : 23-DEC-2020
//  Author : Paul Bowen
//--------------------------------------------------------------------------------

// Include the package
let ActiveDirectory = require('activedirectory');

// This will hold our instance of an active directory
let _ad = null;


class LDAPError {
    constructor(code, message) {
        this.code = code;
        this.message = message;
    }
}

function _initialiseActiveDirectory() {
    // Set up the configuration object
    // LIVE config
    let config = {
        url: 'LDAP://cymru.nhs.uk:389',
        baseDN: 'DC=cymru,DC=nhs,DC=uk',
        username: 'CYMRU\\Gen092954',
        password: '3Chin-chopin-oh13'
    };

    // Create an instance of active directory
    _ad = new ActiveDirectory(testConfig);
}


function NadexAuthenticateUser(sAMAccountName, password, callback) {
    // Test if we have an instance of an active directory
    if (!_ad) {
        _initialiseActiveDirectory();
    }

    // Attempt to authenticate user
    _ad.authenticate('CYMRU\\' + sAMAccountName, password, function (err, auth) {
        if (err) {
            // Something went wrong
            console.log('ERROR: ' + JSON.stringify(err));
            let le = new LDAPError(500, JSON.stringify(err));
            callback(false, le);
            return;
        }

        if (!auth) {
            // Nothing went wrong but we couldn't authenticate on the given credentials
            console.log('Authentication failed : ' + sAMAccountName);
            let le = new LDAPError(200, 'Could not authenticate user');
            callback(false, le);
            return;
        } else {
            // OK .. we authenticated the given credentials
            console.log('Authenticated : ' + sAMAccountName);
            callback(true, null);
            return;
        }
    });
}


function DummyAuthenticateUser(sAMAccountName, password, callback) {
    if (sAMAccountName == 'pa085126') {
        callback(true, null);
        return;
    } else {
        let le = new LDAPError(200, 'Dummy could not authenticate error message');
        callback(false, le);
        return;
    }

}

exports.AuthenticateUser = DummyAuthenticateUser;