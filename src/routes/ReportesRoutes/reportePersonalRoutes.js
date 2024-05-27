//routes/reportGeneral.js

const express = require('express');
const router = express.Router();
const reportsGeneralController = require('../../controllers/ReportesGenerales/reportePersonalController');


router.get('/', reportsGeneralController.exportToExcel);
router.get('/reportData', reportsGeneralController.getReportData); // Nueva ruta para obtener datos del reporte
module.exports = router;