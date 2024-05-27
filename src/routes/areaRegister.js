const express = require('express');
const router = express.Router();
const areaRegisterController = require('../controllers/areaRegisterController');

router.get('/', areaRegisterController.getAreaRegister);
router.post('/', areaRegisterController.createAreaRegister);
router.put('/:id', areaRegisterController.updateAreaRegister);
router.delete('/:id', areaRegisterController.deleteAreaRegister);

module.exports = router;
