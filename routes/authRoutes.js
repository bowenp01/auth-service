//--------------------------------------------------------------------------------
//  Change Log
//  Created : 23-DEC-2020
//  Author : Paul Bowen
//--------------------------------------------------------------------------------

const path = require('path');
const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/auth/login', authController.postLogin);

module.exports = router;