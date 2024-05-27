const dbConnection = require('../config/dbconfig');
const sql = require('mssql');

dbConnection.connect()
    .then(pool => {
        console.log('Conexión exitosa a la base de datos');
    })
    .catch(err => {
        console.error('Error al conectar con la base de datos:', err);
    });


const RSSI_THRESHOLD = -100;
const CHECK_INTERVAL = 15000;


const handleMQTTMessage = async (req, res) => {
    const { topic, message } = req.body;
    const gatewayMac = topic.split('/')[2];
    const now = new Date();

    try {
        const parsedMessage = JSON.parse(message);
        const detectedBeacons = new Set();

        for (const item of parsedMessage) {
            if (item.type === 'Gateway') {
                // Proceso para los datos del Gateway
                const gatewayData = {
                    MacAddress: item.mac,
                    GatewayFree: item.gatewayFree,
                    GatewayLoad: item.gatewayLoad,
                    Timestamp: new Date(item.timestamp)
                };

                const gatewayQuery = `IF NOT EXISTS (SELECT 1 FROM Gateway WHERE MacAddress = @MacAddress)
                                        BEGIN
                                            INSERT INTO Gateway (MacAddress, GatewayFree, GatewayLoad, Timestamp, LastHeartbeat) 
                                            VALUES (@MacAddress, @GatewayFree, @GatewayLoad, @Timestamp, @LastHeartbeat)
                                        END
                                        ELSE
                                        BEGIN
                                            UPDATE Gateway 
                                            SET GatewayFree = @GatewayFree, GatewayLoad = @GatewayLoad, Timestamp = @Timestamp, LastHeartbeat = @LastHeartbeat
                                            WHERE MacAddress = @MacAddress
                                        END`;

                    await dbConnection.request()
                    .input('MacAddress', sql.NVarChar(50), gatewayData.MacAddress)
                    .input('GatewayFree', sql.Int, gatewayData.GatewayFree)
                    .input('GatewayLoad', sql.Float, gatewayData.GatewayLoad)
                    .input('Timestamp', sql.DateTime, gatewayData.Timestamp)
                    .input('LastHeartbeat', sql.DateTime, now)
                    .query(gatewayQuery);
                    
            } else if (item.type === 'iBeacon' && item.mac.startsWith('C30000')) {
                // Proceso para los datos del iBeacon solo si empieza con 'c30000'
                const iBeaconData = {
                    MacAddress: item.mac,
                    RSSI: item.rssi,
                    iBeaconUuid: item.ibeaconUuid,
                    iBeaconMajor: item.ibeaconMajor,
                    iBeaconMinor: item.ibeaconMinor,
                    iBeaconTxPower: item.ibeaconTxPower,
                    Battery: item.battery,
                    Timestamp: new Date(item.timestamp)
                };

                if (iBeaconData.RSSI >= RSSI_THRESHOLD) {
                    detectedBeacons.add(iBeaconData.MacAddress);

                    const gatewayQuery = `SELECT GatewayID FROM Gateway WHERE MacAddress = @GatewayMac`;
                    const result = await dbConnection.request()
                        .input('GatewayMac', sql.NVarChar(50), gatewayMac)
                        .query(gatewayQuery);

                    if (result.recordset.length > 0) {
                        const gatewayID = result.recordset[0].GatewayID;

                        const iBeaconQuery = `IF NOT EXISTS (SELECT 1 FROM iBeacon WHERE MacAddress = @MacAddress AND GatewayID = @GatewayID)
                                              BEGIN
                                                  INSERT INTO iBeacon (MacAddress, RSSI, iBeaconUuid, iBeaconMajor, iBeaconMinor, iBeaconTxPower, Battery, Timestamp, GatewayID) 
                                                  VALUES (@MacAddress, @RSSI, @iBeaconUuid, @iBeaconMajor, @iBeaconMinor, @iBeaconTxPower, @Battery, @Timestamp, @GatewayID)
                                              END
                                              ELSE
                                              BEGIN
                                                  UPDATE iBeacon 
                                                  SET RSSI = @RSSI, iBeaconUuid = @iBeaconUuid, iBeaconMajor = @iBeaconMajor, iBeaconMinor = @iBeaconMinor, 
                                                      iBeaconTxPower = @iBeaconTxPower, Battery = @Battery, Timestamp = @Timestamp 
                                                  WHERE MacAddress = @MacAddress AND GatewayID = @GatewayID
                                              END`;

                        await dbConnection.request()
                            .input('MacAddress', sql.NVarChar(50), iBeaconData.MacAddress)
                            .input('RSSI', sql.Int, iBeaconData.RSSI)
                            .input('iBeaconUuid', sql.NVarChar(50), iBeaconData.iBeaconUuid)
                            .input('iBeaconMajor', sql.Int, iBeaconData.iBeaconMajor)
                            .input('iBeaconMinor', sql.Int, iBeaconData.iBeaconMinor)
                            .input('iBeaconTxPower', sql.Int, iBeaconData.iBeaconTxPower)
                            .input('Battery', sql.Int, iBeaconData.Battery)
                            .input('Timestamp', sql.DateTime, iBeaconData.Timestamp)
                            .input('GatewayID', sql.Int, gatewayID)
                            .query(iBeaconQuery);

                        // Registrar evento de entrada
                        const newEventType = 'Entrada';
                        const lastEventQuery = `SELECT TOP 1 TipoEvento, Timestamp FROM EventosBeacons 
                                                WHERE iBeaconID = (SELECT iBeaconID FROM iBeacon WHERE MacAddress = @MacAddress AND GatewayID = @GatewayID) 
                                                ORDER BY Timestamp DESC`;
                        const lastEventResult = await dbConnection.request()
                            .input('MacAddress', sql.NVarChar(50), iBeaconData.MacAddress)
                            .input('GatewayID', sql.Int, gatewayID)
                            .query(lastEventQuery);

                        const lastEventType = lastEventResult.recordset.length > 0 ? lastEventResult.recordset[0].TipoEvento : null;
                        const lastEventTimestamp = lastEventResult.recordset.length > 0 ? new Date(lastEventResult.recordset[0].Timestamp) : null;

                        if (lastEventType !== newEventType && (!lastEventTimestamp || (now - lastEventTimestamp) > CHECK_INTERVAL)) {
                            const eventoQuery = `INSERT INTO EventosBeacons (iBeaconID, GatewayID, TipoEvento, Timestamp)
                                                 VALUES ((SELECT iBeaconID FROM iBeacon WHERE MacAddress = @MacAddress AND GatewayID = @GatewayID), @GatewayID, @TipoEvento, @Timestamp)`;

                            await dbConnection.request()
                                .input('MacAddress', sql.NVarChar(50), iBeaconData.MacAddress)
                                .input('GatewayID', sql.Int, gatewayID)
                                .input('TipoEvento', sql.NVarChar(10), newEventType)
                                .input('Timestamp', sql.DateTime, iBeaconData.Timestamp)
                                .query(eventoQuery);
                        } else {
                            console.log(`Evento de entrada ya registrado para el iBeacon con MacAddress: ${iBeaconData.MacAddress}`);
                        }
                    }
                } else {
                    console.log(`El beacon con MacAddress: ${iBeaconData.MacAddress} tiene RSSI bajo el umbral y no se considera en rango.`);
                }
            } else {
                console.error('Tipo de dispositivo no reconocido o MacAddress no empieza con c30000');
            }
        }

        // Actualizar los eventos a "Salida" para los iBeacons que ya no están en el rango del gateway
        const gatewayQuery = `SELECT GatewayID FROM Gateway WHERE MacAddress = @GatewayMac`;
        const result = await dbConnection.request()
            .input('GatewayMac', sql.NVarChar(50), gatewayMac)
            .query(gatewayQuery);

        if (result.recordset.length > 0) {
            const gatewayID = result.recordset[0].GatewayID;
            const beaconsQuery = `SELECT iBeaconID, MacAddress, Timestamp FROM iBeacon WHERE iBeaconID IN (
                                  SELECT iBeaconID FROM EventosBeacons WHERE GatewayID = @GatewayID AND TipoEvento = 'Entrada')`;
            const beaconsResult = await dbConnection.request()
                .input('GatewayID', sql.Int, gatewayID)
                .query(beaconsQuery);

            for (const row of beaconsResult.recordset) {
                if (!detectedBeacons.has(row.MacAddress) && (now - new Date(row.Timestamp)) > CHECK_INTERVAL) {
                    const lastEventQuery = `SELECT TOP 1 TipoEvento, Timestamp FROM EventosBeacons 
                                            WHERE iBeaconID = @iBeaconID 
                                              AND GatewayID = @GatewayID 
                                            ORDER BY Timestamp DESC`;
                    const lastEventResult = await dbConnection.request()
                        .input('iBeaconID', sql.Int, row.iBeaconID)
                        .input('GatewayID', sql.Int, gatewayID)
                        .query(lastEventQuery);

                    const lastEventType = lastEventResult.recordset.length > 0 ? lastEventResult.recordset[0].TipoEvento : null;
                    const lastEventTimestamp = lastEventResult.recordset.length > 0 ? new Date(lastEventResult.recordset[0].Timestamp) : null;
                    const newEventType = 'Salida';

                    if (lastEventType !== newEventType && (!lastEventTimestamp || (now - lastEventTimestamp) > CHECK_INTERVAL)) {
                        const eventoQuery = `INSERT INTO EventosBeacons (iBeaconID, GatewayID, TipoEvento, Timestamp)
                                             VALUES (@iBeaconID, @GatewayID, @TipoEvento, @Timestamp)`;

                        await dbConnection.request()
                            .input('iBeaconID', sql.Int, row.iBeaconID)
                            .input('GatewayID', sql.Int, gatewayID)
                            .input('TipoEvento', sql.NVarChar(10), newEventType)
                            .input('Timestamp', sql.DateTime, now)
                            .query(eventoQuery);

                        console.log(`Evento de salida registrado para el iBeacon con MacAddress: ${row.MacAddress}`);
                    }
                }
            }
        }

        res.status(200).json({ message: 'Mensaje MQTT recibido y procesado correctamente' });
    } catch (error) {
        console.error('Error al analizar el mensaje MQTT:', error);
        res.status(400).json({ error: 'Error al analizar el mensaje MQTT: ' + error.message });
    }
};

module.exports = { handleMQTTMessage };
