const sql = require('mssql');
const dbConnection = require('../config/dbconfig');

exports.getUnassignedGateways = async (req, res) => {
  try {
    const pool = await dbConnection.connect();
    const result = await pool.request().query(`
      SELECT g.GatewayID, g.MacAddress
      FROM Gateway g
      LEFT JOIN AsignacionGatewaysAreas a ON g.GatewayID = a.GatewayID
      WHERE a.GatewayID IS NULL
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).send('Error al obtener los gateways no asignados');
  }
};

