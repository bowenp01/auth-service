//=============================================================
//  Change Log
//  Created : 24-JUN-2020
//  Author : Paul Bowen
//=============================================================
const User = require("../../models/user");

function authoriseLocal(un, pw, callback) {
  // Populate the user object to pass to the callback method (roles are empty for now)
  let user = new User(un, 'Dummy user', 'Dummy email', "Dummy department", []);
  callback(true, user);
}

module.exports.authoriseLocal = authoriseLocal;