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

    const getMaxRssiBeaconsByGateway = (gatewayID) => {
        const beacons = eventosBeacons.filter(evento => evento.GatewayID === gatewayID);
        const maxRssiBeacons = beacons.reduce((acc, current) => {
            const existing = acc.find(beacon => beacon.BeaconMacAddress === current.BeaconMacAddress);
            if (!existing || existing.Rssi < current.Rssi) {
                acc = acc.filter(beacon => beacon.BeaconMacAddress !== current.BeaconMacAddress);
                acc.push(current);
            }
            return acc;
        }, []);
        return maxRssiBeacons;
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

    return (
        <div className='grid'>
            {areas.map(gateway => {
                const maxRssiEvents = getMaxRssiBeaconsByGateway(gateway.GatewayID);
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
                                <span>Total Eventos: {maxRssiEvents.length}</span>
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
                            {maxRssiEvents.length > 0 ? (
                                <ProjectTable data={maxRssiEvents} />
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
