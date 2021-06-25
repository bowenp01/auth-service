//=============================================================
//  Change Log
//  Created : 09-JUN-2021
//  Author : Paul Bowen
//
// Debug environment variable : app:controllers
// MAC
// 'export DEBUG=app:HeartbeatController' to switch on debugging for controllers
// 'export DEBUG=' to switch off all debugging
//
// WINDOWS
// 'SET DEBUG=app:HeartbeatController' to switch on debugging for controllers
// 'SET DEBUG=' to switch off all debugging
//=============================================================

//-------------------------------------------------------------
// Include all the third party modules we will need
//-------------------------------------------------------------

const controllerDebugger = require('debug')('app:HeartbeatController'); // Use this instead of console.log() so we can controll debug info
const config = require('config'); // will use settings from config/*.json based on NODE_ENV

//-------------------------------------------------------------
// Include our own custom modules here
//-------------------------------------------------------------
const heartbeat = require(`../database/${config.get('database')}/heartbeat`); // Defined in the config files
var lastStart = require("../utilities/timeStarted");

async function getHeartbeat(req, res, next) {
    // According to the RFC application/json should be always UTF (specifically UTF-8 by default) and shouldn't have a charset property,
    // but in practice if you don't set it many consumers will mangle the result including some browsers, which is why it's a 
    // common pattern to explicitly define the charset.
    res.set({'content-type': 'application/json; charset=utf-8'});
    
    // empty payload for response
    var data = {};
    data.dbConnected = await heartbeat.checkDBConnected();
    data.database = config.get('database');
    data.environment = process.env.NODE_ENV;
    data.started = lastStart.getTimestamp();
    data.uptime = calculateUptime();
    res.status(200).json(data);       
  };

  function calculateUptime(){
    // get total seconds between the times
    var delta = Math.abs(new Date() - lastStart.getTimestamp()) / 1000;

    // calculate (and subtract) whole days
    var days = Math.floor(delta / 86400);
    delta -= days * 86400;

    // calculate (and subtract) whole hours
    var hours = Math.floor(delta / 3600) % 24;
    delta -= hours * 3600;

    // calculate (and subtract) whole minutes
    var minutes = Math.floor(delta / 60) % 60;
    delta -= minutes * 60;

    // what's left is seconds
    var seconds = Math.floor(delta % 60);  // in theory the modulus is not required

    return days+' Days : '+hours+' Hours : '+minutes+' Minutes : '+seconds+' Seconds';
  }
  
  // export the postLogin function as a property of exports
  module.exports.getHeartbeat = getHeartbeat;