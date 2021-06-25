//--------------------------------------------------------------------------------
//  Change Log
//  Created : 09-JUN-2021
//  Author : Paul Bowen
//--------------------------------------------------------------------------------

const path = require('path');
const express = require('express');
const heartbeatController = require('../controllers/heartbeatController');

const router = express.Router();

router.get('/heartbeat', heartbeatController.getHeartbeat);

module.exports = router;