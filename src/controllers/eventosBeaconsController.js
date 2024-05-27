const dbConnection = require('../config/dbconfig');
const sql = require('mssql');

dbConnection.connect()
    .then(pool => {
        console.log('Conexión exitosa a la base de datos');
    })
    .catch(err => {
        console.error('Error al conectar con la base de datos:', err);
    });

exports.getAllEventos = async (req, res) => {
try {
    const query = `SELECT * FROM EventosBeacons`;
    const result = await dbConnection.request().query(query);
    res.status(200).json(result.recordset);
} catch (error) {
    console.error('Error al obtener los eventos:', error);
    res.status(500).json({ error: 'Error al obtener los eventos' });
}
};

exports.getAllEventos2 = async (req, res) => {
    try {
        const pool = await dbConnection.connect();
        const result = await pool.request().query(`
        WITH LatestEventosBeacons AS (
          SELECT 
              eb.iBeaconID,
              eb.GatewayID,
              MAX(eb.Timestamp) AS MaxTimestamp
          FROM 
              EventosBeacons eb
          GROUP BY 
              eb.iBeaconID, eb.GatewayID
      ),
      MaxRssiBeacons AS (
          SELECT 
              ib.MacAddress,
              MAX(ib.Rssi) AS MaxRssi
          FROM 
              iBeacon ib
          GROUP BY 
              ib.MacAddress
      ),
      RankedBeacons AS (
          SELECT 
              eb.iBeaconID,
              ib.MacAddress AS BeaconMacAddress,
              ib.Rssi,
              eb.Timestamp,
              eb.GatewayID,
              gw.MacAddress AS GatewayMacAddress,
              CASE 
                  WHEN DATEDIFF(MINUTE, eb.Timestamp, GETDATE()) > 5 THEN 'Salida'
                  ELSE eb.TipoEvento
              END AS TipoEvento,
              CASE 
                  WHEN pa.Nombre IS NULL AND pa.Apellido IS NULL THEN 'No asignado'
                  ELSE ISNULL(pa.Nombre, '') + ' ' + ISNULL(pa.Apellido, '') 
              END AS PersonaNombreApellido,
              ROW_NUMBER() OVER (PARTITION BY ib.MacAddress ORDER BY eb.Timestamp DESC) AS rn
          FROM 
              EventosBeacons eb
          INNER JOIN 
              LatestEventosBeacons leb ON eb.iBeaconID = leb.iBeaconID AND eb.GatewayID = leb.GatewayID AND eb.Timestamp = leb.MaxTimestamp
          INNER JOIN 
              iBeacon ib ON eb.iBeaconID = ib.iBeaconID
          INNER JOIN 
              MaxRssiBeacons mrb ON ib.MacAddress = mrb.MacAddress AND ib.Rssi = mrb.MaxRssi
          INNER JOIN 
              Gateway gw ON eb.GatewayID = gw.GatewayID
          LEFT JOIN 
              (SELECT 
                  ab.MacAddress,
                  p.Nombre,
                  p.Apellido
               FROM 
                  AsignacionPersonasBeacons apb
               INNER JOIN 
                  iBeacon ab ON apb.iBeaconID = ab.iBeaconID
               INNER JOIN 
                  Personas p ON apb.PersonaID = p.PersonaID) AS pa
          ON 
              ib.MacAddress = pa.MacAddress
      )
      SELECT 
          rb.iBeaconID,
          rb.BeaconMacAddress,
          rb.Rssi,
          rb.Timestamp,
          rb.GatewayID,
          rb.GatewayMacAddress,
          rb.TipoEvento,
          rb.PersonaNombreApellido
      FROM 
          RankedBeacons rb
      WHERE 
          rb.rn = 1
      ORDER BY 
          rb.GatewayID, rb.iBeaconID;

`);
        res.json(result.recordset);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Error al obtener los eventos de beacons');
    }
};

