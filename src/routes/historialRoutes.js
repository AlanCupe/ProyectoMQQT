const express = require('express');
const router = express.Router();
const historialController = require('../controllers/historialController');

router.get('/', historialController.getHistorialAsignaciones);
router.get('/excel', historialController.getHistorialAsignacionesExcel);
router.get('/eventosexcel', historialController.getHistorialEventosExcel);
router.get('/archivoexcel', historialController.getArchivoHistorialAsignacionesExcel);
router.get('/archivo', historialController.getArchivoHistorialAsignaciones);
module.exports = router;
