const sql = require('mssql');
const dbConnection = require('../config/dbconfig');

exports.getAll = async (req, res) => {
  try {
    const pool = await dbConnection.connect();
    const result = await pool.request().query(`
      SELECT 
        a.id,
        g.MacAddress AS macGateway,
        ar.Nombre AS areaTrabajo,
        a.Timestamp AS fechaAsignacion
      FROM AsignacionGatewaysAreas a
      JOIN Gateway g ON a.GatewayID = g.GatewayID
      JOIN Areas ar ON a.AreaID = ar.AreaID
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).send('Error al obtener las asignaciones');
  }
};

exports.create = async (req, res) => {
  const { macGateway, areaTrabajo, fechaAsignacion } = req.body;
  try {
    const pool = await dbConnection.connect();
    const gatewayResult = await pool.request()
      .input('MacAddress', sql.NVarChar, macGateway)
      .query('SELECT GatewayID FROM Gateway WHERE MacAddress = @MacAddress');

    const areaResult = await pool.request()
      .input('Nombre', sql.NVarChar, areaTrabajo)
      .query('SELECT AreaID FROM Areas WHERE Nombre = @Nombre');

    if (gatewayResult.recordset.length === 0 || areaResult.recordset.length === 0) {
      return res.status(404).send('Gateway o área no encontrada');
    }

    const GatewayID = gatewayResult.recordset[0].GatewayID;
    const AreaID = areaResult.recordset[0].AreaID;

    await pool.request()
      .input('GatewayID', sql.Int, GatewayID)
      .input('AreaID', sql.Int, AreaID)
      .input('Timestamp', sql.DateTime, fechaAsignacion)
      .query('INSERT INTO AsignacionGatewaysAreas (GatewayID, AreaID, Timestamp) VALUES (@GatewayID, @AreaID, @Timestamp)');
    res.status(201).send({ message: 'Asignación creada' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).send('Error al crear la asignación');
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { macGateway, areaTrabajo, fechaAsignacion } = req.body;
  try {
    const pool = await dbConnection.connect();
    const gatewayResult = await pool.request()
      .input('MacAddress', sql.NVarChar, macGateway)
      .query('SELECT GatewayID FROM Gateway WHERE MacAddress = @MacAddress');

    const areaResult = await pool.request()
      .input('Nombre', sql.NVarChar, areaTrabajo)
      .query('SELECT AreaID FROM Areas WHERE Nombre = @Nombre');

    if (gatewayResult.recordset.length === 0 || areaResult.recordset.length === 0) {
      return res.status(404).send('Gateway o área no encontrada');
    }

    const GatewayID = gatewayResult.recordset[0].GatewayID;
    const AreaID = areaResult.recordset[0].AreaID;

    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('GatewayID', sql.Int, GatewayID)
      .input('AreaID', sql.Int, AreaID)
      .input('Timestamp', sql.DateTime, fechaAsignacion)
      .query('UPDATE AsignacionGatewaysAreas SET GatewayID = @GatewayID, AreaID = @AreaID, Timestamp = @Timestamp WHERE id = @id');
    if (result.rowsAffected[0] > 0) {
      res.json({ message: 'Asignación actualizada' });
    } else {
      res.status(404).send('Asignación no encontrada');
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).send('Error al actualizar la asignación');
  }
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await dbConnection.connect();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM AsignacionGatewaysAreas WHERE id = @id');
    if (result.rowsAffected[0] > 0) {
      res.status(204).send();
    } else {
      res.status(404).send('Asignación no encontrada');
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).send('Error al eliminar la asignación');
  }
};


exports.getAsignacionGatewaysAreas = async (req, res) => {
  try {
      const pool = await dbConnection.connect();
      const result = await pool.request().query(`
          SELECT g.GatewayID, g.MacAddress,  a.Nombre as AreaNombre 
          FROM AsignacionGatewaysAreas aga
          JOIN Gateway g ON aga.GatewayID = g.GatewayID
          JOIN Areas a ON aga.AreaID = a.AreaID
      `);
      res.json(result.recordset);
  } catch (error) {
      console.error('Database error:', error);
      res.status(500).send('Error al obtener las asignaciones de gateways a áreas');
  }
};


exports.getAsignacionGatewaysAreasDownload = async (req, res) => {
  try {
    const { macGateway, areaTrabajo, fechaAsignacion } = req.query;
    const pool = await dbConnection.connect();
    let query = `
      SELECT 
        a.id,
        g.MacAddress AS macGateway,
        ar.Nombre AS areaTrabajo,
        a.Timestamp AS fechaAsignacion
      FROM AsignacionGatewaysAreas a
      JOIN Gateway g ON a.GatewayID = g.GatewayID
      JOIN Areas ar ON a.AreaID = ar.AreaID
      WHERE 1=1
    `;

    if (macGateway) {
      query += ` AND g.MacAddress LIKE '%${macGateway}%'`;
    }
    if (areaTrabajo) {
      query += ` AND ar.Nombre LIKE '%${areaTrabajo}%'`;
    }
    if (fechaAsignacion) {
      query += ` AND a.Timestamp LIKE '%${fechaAsignacion}%'`;
    }

    const result = await pool.request().query(query);

    const assignments = result.recordset.map(item => ({
      'MAC Gateway': item.macGateway,
      'Área de Trabajo': item.areaTrabajo,
      'Fecha de Asignación': new Date(item.fechaAsignacion).toLocaleString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(assignments);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Area Assignments");

    const filePath = path.join(__dirname, '../../FilteredAreaAssignmentsReport.xlsx');
    XLSX.writeFile(workbook, filePath);

    res.download(filePath, 'FilteredAreaAssignmentsReport.xlsx', (err) => {
      if (err) {
        console.error('Error al enviar el archivo:', err);
      } else {
        fs.unlinkSync(filePath); // Eliminar el archivo después de enviarlo
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).send('Error al generar el reporte');
  }
}
