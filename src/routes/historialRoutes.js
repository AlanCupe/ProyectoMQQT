const express = require('express');
const router = express.Router();
const historialController = require('../controllers/historialController');

router.get('/', historialController.getHistorialAsignaciones);
router.get('/excel', historialController.getHistorialAsignacionesExcel);
module.exports = router;
