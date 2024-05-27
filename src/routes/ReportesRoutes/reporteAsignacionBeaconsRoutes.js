const express = require('express');
const router = express.Router();
const reporteAsignacionBeaconsController = require('../controllers/ReportesGenerales/reporteAsignacionBeaconsController');

router.get('/assignbeacons', reporteAsignacionBeaconsController.exportFilteredAssignBeacons);

module.exports = router;
