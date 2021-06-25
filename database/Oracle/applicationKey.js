//--------------------------------------------------------------------------------
//  Change Log
//  Created : 24-JUN-2021
//  Author : Paul Bowen
//--------------------------------------------------------------------------------

const database = require('./database.js'); 
const SQLDebugger = require('debug')('app:SQL');

const appKeySql = `select sysdate from dual`;

async function checkApplicationKey(ak){  
    // Empty generic object to hold the binds (parameters) for our sql
    const binds = {};
    
    // Now execute our query, we recieve the result in 'result'
    SQLDebugger(binds);
    try {
      const result = await database.simpleExecute(appKeySql, binds);
      return true;    
    } catch (error) {
      SQLDebugger(error.message);
      return false;
    };

  }

// export the function as a property of exports
module.exports.checkApplicationKey = checkApplicationKey;