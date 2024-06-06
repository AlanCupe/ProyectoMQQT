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
                    <th>NOMBRES Y APELLIDOS</th>
                    <th>BEACON</th>
                    <th>TIPO DE EVENTO</th>
                    <th>RSSI</th>
                    <th>FECHA Y HORA</th>
                   
                </tr>
            </thead>
            <tbody>
                {data.map(evento => (
                    <tr key={evento.iBeaconID}>
                          <td>{evento.PersonaNombreApellido ? `${evento.PersonaNombreApellido}` : "No asignado"}</td>
                        <td>{evento.BeaconMacAddress}</td>
                        <td>{evento.TipoEvento =="Entrada"?<img className='inputIcon' src='img/input.png'/> : <img className='outputIcon' src='img/output.png'/>}</td>
                        <td>{evento.Rssi}</td>
                        <td>{new Date(evento.Timestamp).toLocaleString()}</td>
                      
                    </tr>
                ))}
            </tbody>
        </table>
    );
});

export default ProjectTable;
