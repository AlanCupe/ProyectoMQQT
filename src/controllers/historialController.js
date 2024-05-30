const ExcelJS = require('exceljs');
const sql = require('mssql');
const dbConnection = require('../config/dbconfig');

exports.getHistorialAsignaciones = async (req, res) => {
    const { page = 1, pageSize =  10} = req.query;  // Obtener los parámetros de paginación de la consulta
    const offset = (page - 1) * pageSize;

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
            ORDER BY h.HistorialID
            OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;
        `;
        const result = await pool.request()
            .input('offset', sql.Int, offset)
            .input('pageSize', sql.Int, parseInt(pageSize, 10))
            .query(query);
        
        const countQuery = `
            SELECT COUNT(*) AS total 
            FROM historial_asignaciones;
        `;
        const countResult = await pool.request().query(countQuery);

        res.json({
            data: result.recordset,
            total: countResult.recordset[0].total,
            page: parseInt(page, 10),
            pageSize: parseInt(pageSize, 10)
        });
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

exports.getHistorialEventosExcel = async (req, res) => {
    try {
        const pool = await dbConnection.connect();
        const query = `
            SELECT 
                eb.iBeaconID,
                ib.MacAddress AS BeaconMacAddress,
                ib.Rssi,
                eb.Timestamp,
                eb.GatewayID,
                gw.MacAddress AS GatewayMacAddress,
                eb.TipoEvento,
                CASE 
                    WHEN pa.Nombre IS NULL AND pa.Apellido IS NULL THEN 'No asignado'
                    ELSE ISNULL(pa.Nombre, '') + ' ' + ISNULL(pa.Apellido, '') 
                END AS PersonaNombreApellido
            FROM 
                EventosBeacons eb
            INNER JOIN 
                iBeacon ib ON eb.iBeaconID = ib.iBeaconID
            INNER JOIN 
                Gateway gw ON eb.GatewayID = gw.GatewayID
            LEFT JOIN 
                AsignacionPersonasBeacons apb ON ib.iBeaconID = apb.iBeaconID
            LEFT JOIN 
                Personas pa ON apb.PersonaID = pa.PersonaID
            ORDER BY 
                eb.iBeaconID, eb.Timestamp;
        `;
        const result = await pool.request().query(query);
        const eventos = result.recordset;

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Historial de Eventos');

        worksheet.columns = [
            { header: 'iBeaconID', key: 'iBeaconID', width: 10 },
            { header: 'BeaconMacAddress', key: 'BeaconMacAddress', width: 20 },
            { header: 'RSSI', key: 'Rssi', width: 10 },
            { header: 'Timestamp', key: 'Timestamp', width: 30 },
            { header: 'GatewayID', key: 'GatewayID', width: 10 },
            { header: 'GatewayMacAddress', key: 'GatewayMacAddress', width: 20 },
            { header: 'TipoEvento', key: 'TipoEvento', width: 10 },
            { header: 'PersonaNombreApellido', key: 'PersonaNombreApellido', width: 30 },
        ];

        eventos.forEach(entry => {
            worksheet.addRow({
                iBeaconID: entry.iBeaconID,
                BeaconMacAddress: entry.BeaconMacAddress,
                Rssi: entry.Rssi,
                Timestamp: new Date(entry.Timestamp),  // Asegúrate de convertir Timestamp a un objeto Date
                GatewayID: entry.GatewayID,
                GatewayMacAddress: entry.GatewayMacAddress,
                TipoEvento: entry.TipoEvento,
                PersonaNombreApellido: entry.PersonaNombreApellido
            });
        });

        // Formato para la columna de fecha y hora
        worksheet.getColumn('Timestamp').numFmt = 'dd/mm/yyyy hh:mm:ss';

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=historial_eventos.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error al generar el archivo Excel:', error);
        res.status(500).send('Error al generar el archivo Excel');
    }
};

exports.getArchivoHistorialAsignaciones = async (req, res) => {
    try {
        const pool = await dbConnection.connect();
        const query = `SELECT * FROM archivo_historial_asignaciones;`;
        const result = await pool.request().query(query);
        res.json(result.recordset);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Error al obtener el archivo historial de asignaciones');
    }
};






exports.getArchivoHistorialAsignacionesExcel = async (req, res) => {
    try {
        const pool = await dbConnection.connect();
        const query = `
            SELECT * 
            FROM archivo_historial_asignaciones;
        `;
        const result = await pool.request().query(query);
        const historial = result.recordset;

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Archivo Historial de Asignaciones');

        worksheet.columns = [
            { header: 'ArchivoID', key: 'ArchivoID', width: 10 },
            { header: 'PersonaID', key: 'PersonaID', width: 10 },
            { header: 'iBeaconID', key: 'iBeaconID', width: 10 },
            { header: 'Fecha de Asignación', key: 'fechaAsignacion', width: 30 },
            { header: 'Fecha de Baja', key: 'fechaBaja', width: 30 },
        ];

        historial.forEach(entry => {
            worksheet.addRow({
                ArchivoID: entry.ArchivoID,
                PersonaID: entry.PersonaID,
                iBeaconID: entry.iBeaconID,
                fechaAsignacion: entry.fechaAsignacion,
                fechaBaja: entry.fechaBaja,
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=archivo_historial_asignaciones.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error al generar el archivo Excel:', error);
        res.status(500).send('Error al generar el archivo Excel');
    }
};
