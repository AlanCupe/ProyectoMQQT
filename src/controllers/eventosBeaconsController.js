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
        (SELECT iBeaconID, GatewayID, MAX(Timestamp) AS MaxTimestamp
         FROM EventosBeacons
         GROUP BY iBeaconID, GatewayID) AS latest
      ON 
        eb.iBeaconID = latest.iBeaconID AND eb.GatewayID = latest.GatewayID AND eb.Timestamp = latest.MaxTimestamp
      INNER JOIN 
        iBeacon ib ON eb.iBeaconID = ib.iBeaconID
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
      ORDER BY 
        eb.GatewayID, eb.iBeaconID;
        `);
        res.json(result.recordset);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Error al obtener los eventos de beacons');
    }
};

exports.getEventosBeacons = async (req, res) => {
  try {
      const pool = await dbConnection.connect();
      const result = await pool.request().query(`
      WITH CTE AS (
        SELECT 
            CONCAT(p.Nombre, ' ', p.Apellido) AS PersonaNombreApellido,
            ib.MacAddress AS BeaconMacAddress,
            eb.Timestamp AS [Timestamp],
            CASE 
                WHEN ag.Nombre IS NOT NULL THEN ag.Nombre
                ELSE gw.MacAddress
            END AS [Ubicacion],
            eb.TipoEvento,
            ROW_NUMBER() OVER (PARTITION BY p.PersonaID, ib.MacAddress, eb.Timestamp ORDER BY eb.Timestamp DESC) AS rn
        FROM 
            EventosBeacons eb
        INNER JOIN 
            iBeacon ib ON eb.iBeaconID = ib.iBeaconID
        INNER JOIN 
            Gateway gw ON eb.GatewayID = gw.GatewayID
        LEFT JOIN 
            AsignacionGatewaysAreas aga ON eb.GatewayID = aga.GatewayID
        LEFT JOIN 
            Areas ag ON aga.AreaID = ag.AreaID
        INNER JOIN 
            historial_asignaciones ha ON eb.iBeaconID = ha.iBeaconID
        LEFT JOIN 
            Personas p ON ha.PersonaID = p.PersonaID
        WHERE 
            eb.TipoEvento = 'Entrada'
            AND eb.Timestamp BETWEEN ha.fechaAsignacion AND ISNULL(ha.fechaBaja, GETDATE())
    )
    SELECT 
        PersonaNombreApellido,
        BeaconMacAddress,
        [Timestamp],
        [Ubicacion],
        TipoEvento
    FROM 
        CTE
    WHERE 
        rn = 1
    ORDER BY 
        [Timestamp] DESC;
    
      `);
      res.json(result.recordset);
  } catch (error) {
      console.error('Database error:', error);
      res.status(500).send('Error al obtener los eventos de beacons');
  }
};
