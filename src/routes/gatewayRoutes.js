const express = require('express');
const router = express.Router();
const gatewayController= require('../controllers/gatewayController');

// Rutas para obtener todas las direcciones MAC de los Gateways
router.get('/', gatewayController.getAllGatewaysMac);

// Rutas para Gateways
router.get('/all', gatewayController.getGateways);
router.post('/', gatewayController.createGateway);
router.put('/:id', gatewayController.updateGateway);
router.delete('/:id', gatewayController.deleteGateway);


module.exports = router;
