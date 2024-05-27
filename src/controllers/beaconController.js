const sql = require('mssql');
const dbConnection = require('../config/dbconfig');

// Función para obtener todos los beacons
exports.getBeacons = async (req, res) => {
    try {
        const pool = await dbConnection.connect();
        const result = await pool.request().query(`
            SELECT * FROM iBeacon
        `);
        res.json(result.recordset);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Error al obtener datos de beacons');
    }
};



exports.createBeacon = async (req, res) => {
    const { MacAddress, BleNo, BleName, iBeaconUuid, iBeaconMajor, iBeaconMinor, Rssi, iBeaconTxPower, Battery, GatewayID } = req.body;
    try {
        const pool = await dbConnection.connect();
        const result = await pool.request()
            .input('MacAddress', sql.NVarChar, MacAddress)
            .input('BleNo', sql.Int, BleNo)
            .input('BleName', sql.NVarChar, BleName)
            .input('iBeaconUuid', sql.NVarChar, iBeaconUuid)
            .input('iBeaconMajor', sql.Int, iBeaconMajor)
            .input('iBeaconMinor', sql.Int, iBeaconMinor)
            .input('Rssi', sql.Int, Rssi)
            .input('iBeaconTxPower', sql.Int, iBeaconTxPower)
            .input('Battery', sql.Int, Battery)
            .input('GatewayID', sql.Int, GatewayID)
            .query('INSERT INTO iBeacon (MacAddress, BleNo, BleName, iBeaconUuid, iBeaconMajor, iBeaconMinor, Rssi, iBeaconTxPower, Battery, GatewayID) VALUES (@MacAddress, @BleNo, @BleName, @iBeaconUuid, @iBeaconMajor, @iBeaconMinor, @Rssi, @iBeaconTxPower, @Battery, @GatewayID)');

        res.status(201).send({ message: "Beacon registered successfully!" });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Error registering new beacon');
    }
};



// Función para actualizar un beacon
exports.updateBeacon = async (req, res) => {
    const { id } = req.params;
    const { MacAddress, BleNo, BleName, iBeaconUuid, iBeaconMajor, iBeaconMinor, Rssi, iBeaconTxPower, Battery, GatewayID } = req.body;
    try {
        const pool = await dbConnection.connect();
        const result = await pool.request()
            .input('iBeaconID', sql.Int, id)
            .input('MacAddress', sql.NVarChar, MacAddress)
            .input('BleNo', sql.Int, BleNo)
            .input('BleName', sql.NVarChar, BleName)
            .input('iBeaconUuid', sql.NVarChar, iBeaconUuid)
            .input('iBeaconMajor', sql.Int, iBeaconMajor)
            .input('iBeaconMinor', sql.Int, iBeaconMinor)
            .input('Rssi', sql.Int, Rssi)
            .input('iBeaconTxPower', sql.Int, iBeaconTxPower)
            .input('Battery', sql.Int, Battery)
            .input('GatewayID', sql.Int, GatewayID)
            .query('UPDATE iBeacon SET MacAddress = @MacAddress, BleNo = @BleNo, BleName = @BleName, iBeaconUuid = @iBeaconUuid, iBeaconMajor = @iBeaconMajor, iBeaconMinor = @iBeaconMinor, Rssi = @Rssi, iBeaconTxPower = @iBeaconTxPower, Battery = @Battery, GatewayID = @GatewayID WHERE iBeaconID = @iBeaconID');

        if (result.rowsAffected[0] > 0) {
            res.status(200).send({ message: 'Beacon updated successfully!' });
        } else {
            res.status(404).send({ message: 'Beacon not found' });
        }
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Error updating beacon');
    }
};


// Función para eliminar un beacon
exports.deleteBeacon = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await dbConnection.connect();
        const result = await pool.request()
            .input('iBeaconID', sql.Int, id)
            .query('DELETE FROM iBeacon WHERE iBeaconID = @iBeaconID');

        if (result.rowsAffected[0] > 0) {
            res.status(200).send({ message: 'Beacon deleted successfully!' });
        } else {
            res.status(404).send({ message: 'Beacon not found' });
        }
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Error deleting beacon');
    }
};

