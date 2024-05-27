const express = require('express');
const router = express.Router();
const gatewayRegisterController = require('../controllers/gatewayRegisterController');

router.get('/', gatewayRegisterController.getGatewayRegister);
router.post('/', gatewayRegisterController.createGatewayRegister);
router.put('/:id', gatewayRegisterController.updateGatewayRegister);
router.delete('/:id', gatewayRegisterController.deleteGatewayRegister);

module.exports = router;
