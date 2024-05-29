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
    const [filteredData, setFilteredData] = useState([]);
    const [filterEnabled, setFilterEnabled] = useState(false);

    useEffect(() => {
        fetchAssignments();
    }, [eventosBeacons, gateways]);

    useEffect(() => {
        console.log("Eventos Beacons:", eventosBeacons);
        console.log("Gateways:", gateways);
        console.log("Asignaciones:", assignments);
        updateAreas();
    }, [eventosBeacons, gateways, assignments]);

    useEffect(() => {
        if (filterEnabled) {
            const filtered = getBeaconsWithMaxRssiForOnlineGateways();
            setFilteredData(filtered);
        } else {
            setFilteredData(eventosBeacons);
        }
    }, [filterEnabled, eventosBeacons, gateways]);

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
                    beaconMap[beaconKey] = { ...evento, lastSeen: evento.Timestamp };
                }
            }
        });

        return Object.values(beaconMap);
    };

    const countEntradaEvents = (gatewayID, events) => {
        const entradaEvents = events.filter(evento => evento.GatewayID === gatewayID && evento.TipoEvento === 'Entrada');
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
        <>
            <button onClick={() => setFilterEnabled(!filterEnabled)} className='filtrobutton'>
                {filterEnabled ? 'Apagados y Encendidos' : 'Encendidos'}
            </button>
            <div className='grid'>
                {areas.map(gateway => {
                    if (filterEnabled && !gateway.isOnline) return null; // Filtrar gateways apagados cuando el filtro está activado
                    const gatewayEvents = filteredData.filter(evento => evento.GatewayID === gateway.GatewayID);
                    const totalEntradaEvents = countEntradaEvents(gateway.GatewayID, filteredData);
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
        </>
    );
});
