//--------------------------------------------------------------------------------
//  Change Log
//  Created : 09-JUN-2021
//  Author : Paul Bowen
//--------------------------------------------------------------------------------

var startTimestamp;

module.exports.getTimestamp = function () {
    if (!startTimestamp) {
        startTimestamp = new Date();
    }
    return startTimestamp;
};