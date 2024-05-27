const sql = require('mssql');
const dbConnection = require('../config/dbconfig');


const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
};


exports.getAllGatewaysMac = async (req, res) => {
    try {
        console.log('Intentando conectar a la base de datos...');
        const pool = await dbConnection.connect();
        console.log('Conexión a la base de datos exitosa.');
        const result = await pool.request().query('SELECT MacAddress FROM Gateway');
        console.log('Consulta ejecutada exitosamente.');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error al obtener las direcciones MAC de los gateways:', error);
        res.status(500).json({ error: 'Error al obtener las direcciones MAC de los gateways: ' + error.message });
    }
};

// Obtener todos los Gateways
exports.getGateways = async (req, res) => {
    try {
        const pool = await dbConnection.connect();
        const result = await pool.request().query('SELECT * FROM Gateway');
        // Formatear las fechas antes de enviar la respuesta
        const formattedResult = result.recordset.map(entry => ({
            ...entry,
            Timestamp: formatDate(entry.Timestamp)
        }));
        res.json(formattedResult);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Error al obtener los Gateways');
    }
};

// Crear un nuevo Gateway
// Crear un nuevo Gateway
exports.createGateway = async (req, res) => {
    const { MacAddress, Timestamp } = req.body;
    const formattedTimestamp = formatDateForSQL(Timestamp);
    try {
        const pool = await dbConnection.connect();
        await pool.request()
            .input('MacAddress', sql.NVarChar, MacAddress)
            .input('Timestamp', sql.DateTime, formattedTimestamp)
            .query('INSERT INTO Gateway (MacAddress, Timestamp) VALUES (@MacAddress, @Timestamp)');
        res.status(201).send('Gateway creado exitosamente');
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Error al crear el Gateway');
    }
};

exports.updateGateway = async (req, res) => {
    
    const { id,MacAddress, Timestamp } = req.body;
    const formattedTimestamp = formatDateForSQL(Timestamp);
    
    console.log("ID recibido:", id);
    console.log("Timestamp recibido:", formattedTimestamp);
    console.log("Datos recibidos en el body:", req.body); // Nuevo console.log para verificar los datos recibidos en el body

    try {
        const pool = await dbConnection.connect();
        await pool.request()
            .input('GatewayID', sql.Int, id)
            .input('MacAddress', sql.NVarChar, MacAddress)
            .input('Timestamp', sql.DateTime, formattedTimestamp)
            .query('UPDATE Gateway SET MacAddress = @MacAddress, Timestamp = @Timestamp WHERE GatewayID = @GatewayID');
        res.send('Gateway actualizado exitosamente');
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Error al actualizar el Gateway: ' + error.message);
    }
};


// Eliminar un Gateway
exports.deleteGateway = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await dbConnection.connect();
        await pool.request()
            .input('GatewayID', sql.Int, id)
            .query('DELETE FROM Gateway WHERE GatewayID = @GatewayID');
        res.send('Gateway eliminado exitosamente');
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Error al eliminar el Gateway');
    }
};



