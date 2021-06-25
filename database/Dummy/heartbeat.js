//--------------------------------------------------------------------------------
//  Change Log
//  Created : 09-JUN-2021
//  Author : Paul Bowen
//--------------------------------------------------------------------------------

const SQLDebugger = require('debug')('app:SQL');

async function checkDBConnected(){  
    return true;
};

// export the function as a property of exports
module.exports.checkDBConnected = checkDBConnected;