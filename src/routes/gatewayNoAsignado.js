const express = require('express');
const router = express.Router();
const gatewayController = require('../controllers/gatewayNoAsignadoController');

router.get('/', gatewayController.getUnassignedGateways);
// Otras rutas...

module.exports = router;
