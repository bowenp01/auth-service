//--------------------------------------------------------------------------------
//  Change Log
//  Created : 09-JUN-2021
//  Author : Paul Bowen
//--------------------------------------------------------------------------------

const database = require('./database.js'); 
const SQLDebugger = require('debug')('app:SQL');

const heartbeatSql = `select sysdate from dual`;

async function checkDBConnected(){  
    // Empty generic object to hold the binds (parameters) for our sql
    const binds = {};
    
    // Now execute our query, we recieve the result in 'result'
    SQLDebugger(binds);
    try {
      const result = await database.simpleExecute(heartbeatSql, binds);
      return true;    
    } catch (error) {
      SQLDebugger(error.message);
      return false;
    };

  }

// export the function as a property of exports
module.exports.checkDBConnected = checkDBConnected;