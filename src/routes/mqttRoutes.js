//mqttRoutes.js
const express = require('express');
const router = express.Router();
const { handleMQTTMessage } = require('../controllers/mqttController');

router.post('/message', handleMQTTMessage);

module.exports = router;
