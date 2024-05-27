const express = require('express');
const router = express.Router();
const reportePersonalController = require('../controllers/ReportesGenerales/reportePersonalController');

router.get('/beacons', reportePersonalController.exportFilteredBeacons);

module.exports = router;
