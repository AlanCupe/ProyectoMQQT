const express = require('express');
const router = express.Router();
const beaconController = require('../controllers/beaconController');

// Ruta para obtener todos los beacons
router.get('/', beaconController.getBeacons);
router.post('/', beaconController.createBeacon);
// Ruta para actualizar un beacon existente
router.put('/:id', beaconController.updateBeacon);

// Ruta para eliminar un beacon
router.delete('/:id', beaconController.deleteBeacon);

module.exports = router;
