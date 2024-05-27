const ExcelJS = require('exceljs');
const sql = require('mssql');
const dbConnection = require('../config/dbconfig');

exports.getHistorialAsignaciones = async (req, res) => {
    try {
        const pool = await dbConnection.connect();
        const query = `
            SELECT 
                h.HistorialID,
                p.Nombre + ' ' + p.Apellido AS PersonaName,
                i.MacAddress AS BeaconMac,
                h.fechaAsignacion,
                h.fechaBaja
            FROM 
                historial_asignaciones h
                JOIN Personas p ON h.PersonaID = p.PersonaID
                JOIN iBeacon i ON h.iBeaconID = i.iBeaconID
        `;
        const result = await pool.request().query(query);
        res.json(result.recordset);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Error al obtener el historial de asignaciones');
    }
};

exports.getHistorialAsignacionesExcel = async (req, res) => {
    try {
        const pool = await dbConnection.connect();
        const query = `
            SELECT 
                h.HistorialID,
                p.Nombre + ' ' + p.Apellido AS PersonaName,
                i.MacAddress AS BeaconMac,
                h.fechaAsignacion,
                h.fechaBaja
            FROM 
                historial_asignaciones h
                JOIN Personas p ON h.PersonaID = p.PersonaID
                JOIN iBeacon i ON h.iBeaconID = i.iBeaconID
        `;
        const result = await pool.request().query(query);
        const historial = result.recordset;

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Historial de Asignaciones');

        worksheet.columns = [
            { header: 'Persona', key: 'personaName', width: 30 },
            { header: 'Beacon', key: 'beaconMac', width: 20 },
            { header: 'Fecha de Asignación', key: 'fechaAsignacion', width: 30 },
            { header: 'Fecha de Baja', key: 'fechaBaja', width: 30 },
        ];

        const formatDate = (date) => {
            if (!date) return 'N/A';
            const d = new Date(date);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
        };

        historial.forEach(entry => {
            worksheet.addRow({
                personaName: entry.PersonaName,
                beaconMac: entry.BeaconMac,
                fechaAsignacion: formatDate(entry.fechaAsignacion),
                fechaBaja: formatDate(entry.fechaBaja),
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=historial_asignaciones.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Error al generar el archivo Excel');
    }
};
