const express = require('express');
const router = express.Router();
const heartbeatController = require('../controllers/heartbeatController');

router.post('/receive', heartbeatController.Datosheartbeat);
// Otras rutas...

module.exports = router;