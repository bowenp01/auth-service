//--------------------------------------------------------------------------------
//  Change Log
//  Created : 24-JUN-2021
//  Author : Paul Bowen
//--------------------------------------------------------------------------------

const SQLDebugger = require('debug')('app:SQL');

const appKeySql = `select sysdate from dual`;

async function checkApplicationKey(ak){  
    return true;
  };

// export the function as a property of exports
module.exports.checkApplicationKey = checkApplicationKey;