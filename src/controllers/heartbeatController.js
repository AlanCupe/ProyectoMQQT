const sql = require('mssql');
const dbConnection = require('../config/dbconfig');

exports.Datosheartbeat = async (req, res) => {
    const { macAddress } = req.body;
    const now = new Date();

    try {
        const query = `
            UPDATE Gateway 
            SET LastHeartbeat = @LastHeartbeat 
            WHERE MacAddress = @MacAddress;
        `;

        const pool = await dbConnection.connect();
        await pool.request()
            .input('MacAddress', sql.NVarChar, macAddress)
            .input('LastHeartbeat', sql.DateTime, now)
            .query(query);

        res.status(200).json({ message: 'Heartbeat received' });
    } catch (error) {
        console.error('Error processing heartbeat:', error);
        res.status(500).json({ error: 'Error processing heartbeat: ' + error.message });
    }
};