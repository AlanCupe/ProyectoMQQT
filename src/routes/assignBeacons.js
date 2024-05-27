const express = require('express');
const router = express.Router();
const assignBeaconsController = require('../controllers/assignBeaconsController');


router.get('/', assignBeaconsController.getAssignBeacon);
router.get('/unassigned', assignBeaconsController.getUnassignedPeopleAndBeacons);
router.post('/', assignBeaconsController.createAssignBeacon);
router.put('/:id', assignBeaconsController.updateAssignBeacon);
router.delete('/:id', assignBeaconsController.deleteAssignBeacon);

module.exports = router;
