const sql = require('mssql');
const XLSX = require('xlsx');
const fs = require('fs');
const dbConnection = require('../../config/dbconfig');
const path = require('path');

exports.exportFilteredAssignBeacons = async (req, res) => {
    try {
        const pool = await dbConnection.connect();

        // Obtener datos filtrados
        const result = await pool.request().query(`
            SELECT 
                Personas.Nombre AS PersonaName, 
                iBeacon.MacAddress AS BeaconMac, 
                AsignacionPersonasBeacons.Timestamp
            FROM 
                AsignacionPersonasBeacons
            JOIN 
                Personas ON AsignacionPersonasBeacons.PersonaID = Personas.PersonaID
            JOIN 
                iBeacon ON AsignacionPersonasBeacons.iBeaconID = iBeacon.iBeaconID
            WHERE 
                Personas.Nombre LIKE '%${req.query.PersonaName}%'
                AND iBeacon.MacAddress LIKE '%${req.query.BeaconMac}%'
                AND AsignacionPersonasBeacons.Timestamp LIKE '%${req.query.Timestamp}%'
        `);

        const filteredData = result.recordset;

        // Ruta del archivo de reporte
        const filePath = path.join(__dirname, '../../ReporteAsignaciones.xlsx');

        let workbook;

        // Cargar el archivo existente o crear uno nuevo si no existe
        if (fs.existsSync(filePath)) {
            workbook = XLSX.readFile(filePath);
        } else {
            workbook = XLSX.utils.book_new();
        }

        // Crear hoja de trabajo de Excel
        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const sheetName = `Reporte_${new Date().toISOString().replace(/[:.]/g, '-')}`;
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        // Guardar el archivo de reporte temporal
        const tempFilePath = path.join(__dirname, '../../TempReporteAsignaciones.xlsx');
        XLSX.writeFile(workbook, tempFilePath);

        // Enviar archivo al cliente y luego eliminar el archivo temporal
        res.download(tempFilePath, 'ReporteAsignaciones.xlsx', (err) => {
            if (err) {
                console.error('Error al enviar el archivo:', err);
            } else {
                fs.unlinkSync(tempFilePath); // Eliminar el archivo temporal después de enviar
            }
        });
    } catch (err) {
        console.error('Error al exportar asignaciones filtradas:', err);
        res.status(500).send('Error al exportar asignaciones filtradas');
    }
};
