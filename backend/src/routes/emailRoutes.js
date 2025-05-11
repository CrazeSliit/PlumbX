const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');

// Send employee credentials
router.post('/send-credentials/:id', emailController.sendEmployeeCredentials);

module.exports = router; 