//=============================================================
//  Change Log
//  Created : 25-JUN-2020
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

const database = require("./database.js");
const controllerDebugger = require("debug")("app:controllers");

unSql = `select userid from pmsusers where upper(username)=:username`;
pwSql = `select password from pmsusers where userid = :userid and date_to is null`;

async function authoriseLocal(un, pw, callback) {
  // Empty generic object to hold the binds (parameters) for our sql
  const unBinds = {};
  const pwBinds = {};
  let userid;
  let password;
  unBinds.username = un.toUpperCase();

  // Lets look for the userId in pmsUsers
  controllerDebugger(unBinds);
  try {
    // execute sql
    const result = await database.simpleExecute(unSql, unBinds);
    // no userId found .. authentication fail
    if (result.rows.count == 0) {
      controllerDebugger("Username invalid: " + un);
      callback(false);
    }

    // Got a userId
    userid = result.rows[0].USERID;
    controllerDebugger("userId for " + un + " is " + userid);
  } catch (error) {
    controllerDebugger(error.message);
    callback(false);
  }

  pwBinds.userid = userid;
  // Lets look for the password in pmsUsers
  controllerDebugger(pwBinds);
  try {
    // execute sql
    const result = await database.simpleExecute(pwSql, pwBinds);
    // no password found .. authentication fail
    if (result.rows.count == 0) {
      controllerDebugger("Password expired");
      callback(false);
    }
    password = result.rows[0].PASSWORD;
    decryptedPassword = decrypt(password);
    controllerDebugger("Password: " + password);
    controllerDebugger("Descrypted Password: " + decryptedPassword);
    if (decryptedPassword.toUpperCase() === pw.toUpperCase()) {
      controllerDebugger("Passwords match");
      callback(true);
    } else {
      controllerDebugger("Passwords do not match");
      callback(false);
    }
  } catch (error) {
    controllerDebugger(error.message);
    callback(false);
  }

  return;
}

function decrypt(pwd) {
  const key = [3, 8, 12, 7, 1, 9, 6, 5, 13, 7];
  let len = pwd.length;
  let workchar;
  let charcode;
  let ctr = 0;
  let retval = "";

  for (let loop = 0; loop < len; loop++) {
    charcode = pwd.charCodeAt(loop);
    workchar = String.fromCharCode(charcode - key[ctr]);
    retval = retval + workchar;
    ctr++;
    if (ctr > 9) ctr = 0;
  }
  return retval;
}

module.exports.authoriseLocal = authoriseLocal;
