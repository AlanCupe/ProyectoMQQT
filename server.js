const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const PORT = process.env.PORT || 3000;





app.use(cors({
    origin: '*', // Permitir solicitudes desde cualquier origen
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));





app.use(express.json());

app.use(express.static(path.join(__dirname, 'dist')));


const mqttRoutes = require('./src/routes/mqttRoutes');
const personRoutes = require('./src/routes/personRoutes');
const beaconRoutes = require('./src/routes/beaconRoutes');
const assignBeacons = require('./src/routes/assignBeacons');
const arearegister = require('./src/routes/areaRegister');
const gatewayRegister = require('./src/routes/gatewayRegister');
const asignacionGatewaysAreasRoutes = require('./src/routes/asignacionGatewaysAreasRoutes');
const gatewayNoAsignado = require('./src/routes/gatewayNoAsignado');
const gatewayRoutes = require('./src/routes/gatewayRoutes');
const eventosBeaconsRoutes = require('./src/routes/eventosBeaconsRoutes');
const areaRoutes = require('./src/routes/areaRoutes'); // Nueva ruta para áreas
const reportsGeneralRoutes = require('./src/routes/ReportesRoutes/reportePersonalRoutes');
const historialRoutes = require('./src/routes/historialRoutes');




app.use('/mqtt', mqttRoutes);
app.use('/personas', personRoutes);
app.use('/beacons', beaconRoutes);
app.use('/assignbeacon', assignBeacons);
app.use('/arearegister', arearegister);
app.use('/areas', areaRoutes); // Nueva ruta para áreas
app.use('/gatewayregister', gatewayRegister);
app.use('/asignaciongatewaysareas', asignacionGatewaysAreasRoutes);
app.use('/unassigned', gatewayNoAsignado);
app.use('/gateways', gatewayRoutes);
app.use('/eventosbeacons', eventosBeaconsRoutes);

app.use('/report', reportsGeneralRoutes); // Nueva ruta para reportes
app.use('/historial1', historialRoutes);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT,'0.0.0.0', () => {
    console.log(`Servidor escuchando en el puerto http://localhost:${PORT}`);
});
