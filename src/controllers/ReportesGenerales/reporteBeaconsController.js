const sql = require('mssql');
const XLSX = require('xlsx');
const fs = require('fs');
const dbConnection = require('../../config/dbconfig');

exports.exportFilteredBeacons = async (req, res) => {
    try {
        const pool = await dbConnection;

        // Obtener datos filtrados
        const result = await pool.request().query(`SELECT * FROM iBeacon WHERE MacAddress LIKE '%${req.query.MacAddress}%'`);

        const filteredData = result.recordset;

        // Crear hoja de trabajo de Excel
        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Beacons");

        // Guardar archivo temporalmente
        const filePath = './filtered_beacons.xlsx';
        XLSX.writeFile(workbook, filePath);

        // Enviar archivo al cliente
        res.download(filePath, 'filtered_beacons.xlsx', (err) => {
            if (err) {
                console.error('Error al enviar el archivo:', err);
            }
            // Eliminar archivo temporal después de enviarlo
            fs.unlinkSync(filePath);
        });
    } catch (err) {
        console.error('Error al exportar beacons filtrados:', err);
        res.status(500).send('Error al exportar beacons filtrados');
    }
};
