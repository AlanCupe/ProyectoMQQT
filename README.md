# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh


import React, { useState, useEffect } from 'react';
import './App.css'; // Importa el archivo CSS para el estilo

function App() {
  const [personas, setPersonas] = useState([]);
  const [registros, setRegistros] = useState([]);

  useEffect(() => {
    // Hacer una solicitud HTTP para obtener la lista de personas
    fetch('/personas')
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al obtener la lista de personas');
        }
        return response.json();
      })
      .then(data => {
        // Actualizar el estado con la lista de personas recibidas
        setPersonas(data);
      })
      .catch(error => {
        console.error(error);
      });

    // Hacer una solicitud HTTP para obtener la lista de registros de presencia
    fetch('/registros')
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al obtener la lista de registros');
        }
        return response.json();
      })
      .then(data => {
        // Actualizar el estado con la lista de registros recibidos
        setRegistros(data);
      })
      .catch(error => {
        console.error(error);
      });
  }, []); // Se ejecuta solo una vez al montar el componente

  return (
    <>
      <h1 className='PanelTitulo'>Panel de Control</h1>
      <div className="container">
        <div className="section">
          <h1>Lista de Personas</h1>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>DNI</th>
                <th>Cargo</th>
              </tr>
            </thead>
            <tbody>
              {personas.map(persona => (
                <tr key={persona.PersonaID}>
                  <td>{persona.PersonaID}</td>
                  <td>{persona.Nombre}</td>
                  <td>{persona.Apellido}</td>
                  <td>{persona.Dni}</td>
                  <td>{persona.Cargo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="section">
          <h1>Registro de Presencia</h1>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Persona ID</th>
                <th>Área ID</th>
                <th>Hora de Entrada</th>
              </tr>
            </thead>
            <tbody>
              {registros.map(registro => (
                <tr key={registro.RegistroID}>
                  <td>{registro.RegistroID}</td>
                  <td>{registro.PersonaID}</td>
                  <td>{registro.AreaID}</td>
                  <td>{registro.HoraEntrada}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default App;



---------------

# UserTable.jsx
# personController.js


```
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
```


--------------------
import React, { memo, useContext, useEffect, useState } from 'react';
import { EventosBeaconsContext } from '../../Context/EventosBeaconsProvider';
import { GatewayContext } from '../../Context/GatewayProvider';
import { AreaAssigmentContext } from '../../Context/AreaAssigmentProvider';
import ProjectTable from '../../components/ProjectTable/ProjectTable';
import './Dashboard.css';

export const Dashboard = memo(() => {
    const { eventosBeacons, loading } = useContext(EventosBeaconsContext);
    const { gateways } = useContext(GatewayContext);
    const { assignments, fetchAssignments } = useContext(AreaAssigmentContext);
    const [areas, setAreas] = useState([]);

    useEffect(() => {
        fetchAssignments();
    }, [eventosBeacons, gateways]);

    useEffect(() => {
        console.log("Eventos Beacons:", eventosBeacons);
        console.log("Gateways:", gateways);
        console.log("Asignaciones:", assignments);
        updateAreas();
    }, [eventosBeacons, gateways, assignments]);

    const updateAreas = () => {
        const updatedAreas = gateways.map(gateway => {
            const areaNombre = getAreaNombre(gateway.MacAddress);
            return { ...gateway, areaNombre };
        });
        setAreas(updatedAreas);
    };

    const getBeaconsWithMaxRssiForOnlineGateways = () => {
        const beaconMap = {};
        
        eventosBeacons.forEach(evento => {
            const gateway = gateways.find(gw => gw.GatewayID === evento.GatewayID);
            if (gateway && gateway.isOnline) {
                const beaconKey = evento.BeaconMacAddress;
                if (!beaconMap[beaconKey] || beaconMap[beaconKey].Rssi < evento.Rssi) {
                    beaconMap[beaconKey] = evento;
                }
            }
        });

        return Object.values(beaconMap);
    };

    const countEntradaEvents = (gatewayID) => {
        const entradaEvents = eventosBeacons.filter(evento => evento.GatewayID === gatewayID && evento.TipoEvento === 'Entrada');
        return entradaEvents.length;
    };

    const getAreaNombre = (macAddress) => {
        const asignacion = assignments.find(aga => aga.macGateway === macAddress);
        return asignacion ? asignacion.areaTrabajo : 'No asignada';
    };

    if (loading) {
        return <div className='grid'>Cargando...</div>;
    }

    const beaconsWithMaxRssiForOnlineGateways = getBeaconsWithMaxRssiForOnlineGateways();

    return (
        <div className='grid'>
            {areas.map(gateway => {
                if (!gateway.isOnline) return null; // Solo mostrar gateways encendidos
                const gatewayEvents = beaconsWithMaxRssiForOnlineGateways.filter(evento => evento.GatewayID === gateway.GatewayID);
                const totalEntradaEvents = countEntradaEvents(gateway.GatewayID);
                return (
                    <div key={gateway.GatewayID}>
                        <div className='containerInfoTable'>
                            <div className='containerImgTable'></div>
                            <h2 className='flexRow containerData'>
                                <img className='imgRouter' src="/img/gateway.png" alt="gateway" />
                                <span>{gateway.MacAddress}</span>
                                <span>{gateway.isOnline ? <div className='containerLet'><div className='letEnable'></div></div> : <div className='containerLet'><div className='letDisable'></div></div>}</span>
                            </h2>
                            <h3>{gateway.areaNombre}</h3>
                            <p className='flexRow imgP'>
                                <img src="/img/user.png" alt="usuarioDetectados" />
                                <span>Total Eventos: {gatewayEvents.length}</span>
                            </p>
                            <p className='flexRow imgP'>
                                <img src="/img/user.png" alt="usuarioDetectados" />
                                <span>Personal: {totalEntradaEvents}</span>
                            </p>
                            <p className='flexRow imgP'>
                                <span>{gateway.isOnline ? 'Encendido' : 'Apagado'}</span>
                            </p>
                        </div>
                        <div className='table-container'>
                            {gatewayEvents.length > 0 ? (
                                <ProjectTable data={gatewayEvents} />
                            ) : (
                                <div>
                                    <table className='project-table'>
                                        <thead>
                                            <tr>
                                                <th>Beacon</th>
                                                <th>Tipo de Evento</th>
                                                <th>RSSI</th>
                                                <th>Timestamp</th>
                                                <th>Nombre y Apellido</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td colSpan="5">No hay eventos recientes</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
});
---------------------


import React, { memo, useEffect } from 'react';
import './ProjectTable.css';

const ProjectTable = memo(({ data }) => {
    useEffect(() => {
        console.log("Datos desde DASHBOARD A PROJECT TABLE:", data);
    }, [data]);

    if (!data || data.length === 0) {
        return <div>No hay datos para mostrar.</div>;
    }

    return (
        <table className='project-table'>
            <thead>
                <tr>
                    <th>Beacon</th>
                    <th>Tipo de Evento</th>
                    <th>RSSI</th>
                    <th>Timestamp</th>
                    <th>Nombre y Apellido</th>
                </tr>
            </thead>
            <tbody>
                {data.map(evento => (
                    <tr key={evento.iBeaconID}>
                        <td>{evento.BeaconMacAddress}</td>
                        <td>{evento.TipoEvento}</td>
                        <td>{evento.Rssi}</td>
                        <td>{new Date(evento.Timestamp).toLocaleString()}</td>
                        <td>{evento.PersonaNombreApellido ? `${evento.PersonaNombreApellido}` : "No asignado"}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
});

export default ProjectTable;


----------------------

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
                (SELECT 
                    iBeaconID, 
                    GatewayID, 
                    MAX(Timestamp) AS MaxTimestamp
                 FROM 
                    EventosBeacons
                 GROUP BY 
                    iBeaconID, 
                    GatewayID) AS latest
            ON 
                eb.iBeaconID = latest.iBeaconID 
                AND eb.GatewayID = latest.GatewayID 
                AND eb.Timestamp = latest.MaxTimestamp
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
                eb.GatewayID, 
                eb.iBeaconID;
        `);
        res.json(result.recordset);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Error al obtener los eventos de beacons');
    }
};
