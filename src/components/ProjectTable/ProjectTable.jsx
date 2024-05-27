import React, { useEffect } from 'react';
import './ProjectTable.css';

const ProjectTable = ({ data }) => {
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
                        <td>{evento.PersonaNombreApellido?`${evento.PersonaNombreApellido}`:"No asignado"}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default ProjectTable;
