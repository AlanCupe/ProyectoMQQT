const sql = require('mssql');
const dbConnection = require('../config/dbconfig');

exports.getAssignBeacon = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = 50; /*CAMBIANDO EL VALOR DE 50 A 5, SI QUIERES QUE SOLO SEAN 5 */
    const offset = (page - 1) * pageSize;

    try {
        const pool = await dbConnection.connect();
        const query = `
        SELECT 
        AsignacionPersonasBeacons.AsignacionID,
        Personas.Nombre + ' ' + Personas.Apellido AS PersonaName,
        iBeacon.MacAddress AS BeaconMac,
        AsignacionPersonasBeacons.Timestamp
    FROM 
        AsignacionPersonasBeacons
    JOIN 
        Personas ON AsignacionPersonasBeacons.PersonaID = Personas.PersonaID
    JOIN 
        iBeacon ON AsignacionPersonasBeacons.iBeaconID = iBeacon.iBeaconID
    ORDER BY 
        AsignacionPersonasBeacons.Timestamp DESC
    
            OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;
        `;
        const result = await pool.request()
            .input('offset', sql.Int, offset)
            .input('pageSize', sql.Int, pageSize)
            .query(query);

        const countQuery = `
            SELECT COUNT(*) AS total
            FROM AsignacionPersonasBeacons;
        `;
        const countResult = await pool.request().query(countQuery);

        res.json({
            data: result.recordset,
            total: countResult.recordset[0].total,
            page,
            pageSize
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Error al obtener las asignaciones');
    }
};

exports.getUnassignedPeopleAndBeacons = async (req, res) => {
    try {
        const pool = await dbConnection.connect();

        const unassignedPeopleQuery = `
            SELECT p.PersonaID, p.Nombre, p.Apellido
            FROM Personas p
            LEFT JOIN AsignacionPersonasBeacons apb ON p.PersonaID = apb.PersonaID
            WHERE apb.PersonaID IS NULL
        `;
        
        const unassignedBeaconsQuery = `
            WITH UniqueBeacons AS (
                SELECT 
                    b.iBeaconID,
                    b.MacAddress,
                    ROW_NUMBER() OVER (PARTITION BY b.MacAddress ORDER BY b.iBeaconID) AS RowNum
                FROM 
                    iBeacon b
                LEFT JOIN 
                    AsignacionPersonasBeacons apb ON b.iBeaconID = apb.iBeaconID
                WHERE 
                    apb.iBeaconID IS NULL
            )
            SELECT 
                iBeaconID,
                MacAddress
            FROM 
                UniqueBeacons
            WHERE 
                RowNum = 1;
        `;
        
        const [unassignedPeopleResult, unassignedBeaconsResult] = await Promise.all([
            pool.request().query(unassignedPeopleQuery),
            pool.request().query(unassignedBeaconsQuery)
        ]);

        res.json({
            people: unassignedPeopleResult.recordset,
            beacons: unassignedBeaconsResult.recordset
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Error al obtener personas y beacons no asignados');
    }
};



exports.createAssignBeacon = async (req, res) => {
    const { PersonaID, iBeaconID, Timestamp } = req.body;

    try {
        const pool = await dbConnection.connect();

        // Verificar si el beacon ya está asignado a otra persona
        const checkBeaconQuery = `
            SELECT * FROM AsignacionPersonasBeacons
            WHERE iBeaconID = @iBeaconID
        `;
        const checkBeaconResult = await pool.request()
            .input('iBeaconID', sql.Int, iBeaconID)
            .query(checkBeaconQuery);

        if (checkBeaconResult.recordset.length > 0) {
            res.status(400).send('Este beacon ya está asignado a otra persona.');
            pool.close();
            return;
        }

        // Verificar si la persona ya tiene un beacon asignado
        const checkPersonQuery = `
            SELECT * FROM AsignacionPersonasBeacons
            WHERE PersonaID = @PersonaID
        `;
        const checkPersonResult = await pool.request()
            .input('PersonaID', sql.Int, PersonaID)
            .query(checkPersonQuery);

        if (checkPersonResult.recordset.length > 0) {
            res.status(400).send('Esta persona ya tiene un beacon asignado.');
            pool.close();
            return;
        }

        // Asegurarnos de que el Timestamp está en el formato correcto
        const timestamp = new Date(Timestamp);

        // Si no hay asignaciones previas, proceder con la inserción del nuevo registro
        const insertQuery = `
            INSERT INTO AsignacionPersonasBeacons (PersonaID, iBeaconID, Timestamp) 
            VALUES (@PersonaID, @iBeaconID, @Timestamp)
        `;
        const insertResult = await pool.request()
            .input('PersonaID', sql.Int, PersonaID)
            .input('iBeaconID', sql.Int, iBeaconID)
            .input('Timestamp', sql.DateTime, timestamp)
            .query(insertQuery);

        // Obtener el ID del nuevo registro insertado
        const newAssignmentIDQuery = `
            SELECT TOP 1 AsignacionID FROM AsignacionPersonasBeacons
            WHERE PersonaID = @PersonaID AND iBeaconID = @iBeaconID
            ORDER BY Timestamp DESC
        `;
        const newAssignmentIDResult = await pool.request()
            .input('PersonaID', sql.Int, PersonaID)
            .input('iBeaconID', sql.Int, iBeaconID)
            .query(newAssignmentIDQuery);

        const newAssignmentID = newAssignmentIDResult.recordset[0].AsignacionID;
        res.json({ AsignacionID: newAssignmentID, message: 'Beacon asignado correctamente' });
        pool.close();
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Error al asignar beacon');
    }
};


exports.updateAssignBeacon = async (req, res) => {
    const { id } = req.params; // ID de la asignación que se está editando
    const { PersonaID, iBeaconID, Timestamp } = req.body;

    try {
        const pool = await dbConnection.connect();

        // Verificar si el beacon ya está asignado a otra persona diferente
        const checkBeaconQuery = `
            SELECT * FROM AsignacionPersonasBeacons
            WHERE iBeaconID = @iBeaconID AND AsignacionID != @AsignacionID
        `;
        const checkBeaconResult = await pool.request()
            .input('iBeaconID', sql.Int, iBeaconID)
            .input('AsignacionID', sql.Int, id)
            .query(checkBeaconQuery);

        if (checkBeaconResult.recordset.length > 0) {
            res.status(400).send('Este beacon ya está asignado a otra persona.');
            return;
        }

        // Si el beacon no está asignado a otra persona, proceder a actualizar la asignación existente
        const updateQuery = `
            UPDATE AsignacionPersonasBeacons
            SET PersonaID = @PersonaID, iBeaconID = @iBeaconID, Timestamp = @Timestamp
            WHERE AsignacionID = @AsignacionID
        `;
        const updateResult = await pool.request()
            .input('AsignacionID', sql.Int, id)
            .input('PersonaID', sql.Int, PersonaID)
            .input('iBeaconID', sql.Int, iBeaconID)
            .input('Timestamp', sql.DateTime, new Date(Timestamp))
            .query(updateQuery);

        if (updateResult.rowsAffected[0] > 0) {
            res.json({ message: 'Asignación actualizada correctamente' });
        } else {
            res.status(404).send({ message: 'Asignación no encontrada' });
        }
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Error al actualizar la asignación');
    }
};

exports.deleteAssignBeacon = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await dbConnection.connect();
        const query = 'DELETE FROM AsignacionPersonasBeacons WHERE AsignacionID = @AsignacionID';
        const result = await pool.request()
            .input('AsignacionID', sql.Int, id)
            .query(query);

        if (result.rowsAffected[0] > 0) {
            res.json({ message: 'Asignación eliminada correctamente' });
        } else {
            res.status(404).send({ message: 'Asignación no encontrada' });
        }
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Error al eliminar la asignación');
    }
};
exports.deleteAllAssignments = async (req, res) => {
    try {
        const pool = await dbConnection.connect();
        const query = 'DELETE FROM AsignacionPersonasBeacons';
        await pool.request().query(query);
        res.json({ message: 'Todas las asignaciones han sido eliminadas correctamente' });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Error al eliminar todas las asignaciones');
    }
};