const express = require('express');
const router = express.Router();
const { getAreaRegister } = require('../controllers/areaRegisterController'); // Usar el controlador existente

// Rutas para Áreas
router.get('/', getAreaRegister);

module.exports = router;

