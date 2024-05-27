const sql = require('mssql');
const dbConnection = require('../config/dbconfig');

exports.getAreaRegister = async (req, res) => {
    try {
        const pool = await dbConnection.connect();
        const result = await pool.request().query('SELECT * FROM Areas');
        res.json(result.recordset);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Error al obtener las áreas');
    }
};

exports.createAreaRegister = async (req, res) => {
    const { nombre } = req.body;
    try {
        const pool = await dbConnection.connect();
        await pool.request()
            .input('nombre', sql.NVarChar, nombre)
            .query('INSERT INTO Areas (Nombre) VALUES (@nombre)');
        res.status(201).send({ message: "Área creada exitosamente!" });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Error al crear la nueva área');
    }
};

exports.updateAreaRegister = async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;
    try {
        const pool = await dbConnection.connect();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('nombre', sql.NVarChar, nombre)
            .query('UPDATE Areas SET Nombre = @nombre WHERE AreaID = @id');

        if (result.rowsAffected[0] > 0) {
            res.status(200).send({ message: 'Área actualizada exitosamente!' });
        } else {
            res.status(404).send({ message: 'Área no encontrada' });
        }
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Error al actualizar el área');
    }
};

exports.deleteAreaRegister = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await dbConnection.connect();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Areas WHERE AreaID = @id');

        if (result.rowsAffected[0] > 0) {
            res.status(200).send({ message: 'Área eliminada exitosamente!' });
        } else {
            res.status(404).send({ message: 'Área no encontrada' });
        }
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Error al eliminar el área');
    }
};

