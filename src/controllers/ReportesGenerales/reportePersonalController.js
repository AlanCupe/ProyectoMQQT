const sql = require('mssql');
const ExcelJS = require('exceljs');
const dbConnection = require('../../config/dbconfig');

exports.exportToExcel = async (req, res) => {
    try {
        const pool = await dbConnection;
        const result = await pool.request().query('SELECT * FROM Personas');
        
        if (!result.recordset || result.recordset.length === 0) {
            return res.status(404).send('No data found');
        }
        
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Personas');

        worksheet.columns = [
            { header: 'ID', key: 'PersonaID', width: 10 },
            { header: 'Nombre', key: 'Nombre', width: 30 },
            { header: 'Apellido', key: 'Apellido', width: 30 },
            { header: 'DNI', key: 'Dni', width: 10 },
            { header: 'Cargo', key: 'Cargo', width: 30 },
            { header: 'Empresa', key: 'Empresa', width: 30 },
        ];

        result.recordset.forEach(persona => {
            worksheet.addRow(persona);
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Personas.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        res.status(500).send('An error occurred');
    }
};

exports.getReportData = async (req, res) => {
    try {
        const pool = await dbConnection;
        const result = await pool.request().query('SELECT * FROM Personas');
        
        if (!result.recordset || result.recordset.length === 0) {
            return res.status(404).send('No data found');
        }

        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching report data:', error);
        res.status(500).send('An error occurred');
    }
};