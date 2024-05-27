const sql = require('mssql');
const dbConnection = require('../config/dbconfig');

exports.getGatewayRegister = async (req, res) => {
    try {
        const pool = await dbConnection.connect();
        const result = await pool.request().query('SELECT * FROM Gateway');
        res.json(result.recordset);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Error al obtener los gateways');
    }
};

exports.createGatewayRegister = async (req, res) => {
    const { MacAddress, GatewayFree, GatewayLoad, Timestamp } = req.body;
    try {
        const pool = await dbConnection.connect();
        await pool.request()
            .input('MacAddress', sql.NVarChar, MacAddress)
            .input('GatewayFree', sql.Int, GatewayFree)
            .input('GatewayLoad', sql.Float, GatewayLoad)
            .input('Timestamp', sql.DateTime, Timestamp)
            .query('INSERT INTO Gateway (MacAddress, GatewayFree, GatewayLoad, Timestamp) VALUES (@MacAddress, @GatewayFree, @GatewayLoad, @Timestamp)');
        res.status(201).send({ message: "Gateway creado exitosamente!" });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Error al crear el gateway');
    }
};

exports.updateGatewayRegister = async (req, res) => {
    const { id } = req.params;
    const { MacAddress } = req.body;
    try {
        const pool = await dbConnection.connect();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('MacAddress', sql.NVarChar, MacAddress)
            .query('UPDATE Gateway SET MacAddress = @MacAddress WHERE GatewayID = @id');

        if (result.rowsAffected[0] > 0) {
            res.status(200).send({ message: 'Gateway actualizado exitosamente!' });
        } else {
            res.status(404).send({ message: 'Gateway no encontrado' });
        }
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Error al actualizar el gateway');
    }
};

exports.deleteGatewayRegister = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await dbConnection.connect();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Gateway WHERE GatewayID = @id');

        if (result.rowsAffected[0] > 0) {
            res.status(200).send({ message: 'Gateway eliminado exitosamente!' });
        } else {
            res.status(404).send({ message: 'Gateway no encontrado' });
        }
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Error al eliminar el gateway');
    }
};

