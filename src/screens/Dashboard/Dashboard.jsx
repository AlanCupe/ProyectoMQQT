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
            const filtered = applyCustomFilter(eventosBeacons);
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

    const applyCustomFilter = (events) => {
        const beaconMap = {};

        events.forEach(event => {
            const beaconKey = event.BeaconMacAddress;
            const gateway = gateways.find(gw => gw.GatewayID === event.GatewayID && gw.isOnline);

            if (gateway) {
                if (!beaconMap[beaconKey]) {
                    beaconMap[beaconKey] = {
                        entry: null,
                        exit: null,
                        highestRssi: -Infinity,
                        latestTimestamp: null,
                    };
                }

                const beaconData = beaconMap[beaconKey];

                if (event.TipoEvento === 'Entrada' && event.Rssi > beaconData.highestRssi) {
                    beaconData.highestRssi = event.Rssi;
                    beaconData.entry = event;
                } else if (event.TipoEvento === 'Salida' && (!beaconData.latestTimestamp || new Date(event.Timestamp) > new Date(beaconData.latestTimestamp))) {
                    beaconData.latestTimestamp = event.Timestamp;
                    beaconData.exit = event;
                }
            }
        });

        const filtered = [];
        for (const key in beaconMap) {
            if (beaconMap[key].entry) {
                filtered.push(beaconMap[key].entry);
            }
            if (beaconMap[key].exit) {
                filtered.push(beaconMap[key].exit);
            }
        }

        return filtered;
    };

    const countEntradaEvents = (gatewayID, events) => {
        const entradaEvents = events.filter(evento => evento.GatewayID === gatewayID && evento.TipoEvento === 'Entrada');
        return entradaEvents.length;
    };

    const getAreaNombre = (macAddress) => {
        const asignacion = assignments.find(aga => aga.macGateway === macAddress);
        return asignacion ? asignacion.areaTrabajo : 'No asignada';
    };

    const handleDownloadExcel = async () => {
        try {
            const response = await fetch('http://localhost:3000/historial/eventosexcel', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                }
            });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'historial_eventos.xlsx';
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error('Error al descargar el archivo Excel:', error);
        }
    };

    if (loading) {
        return <div className='grid'>Cargando...</div>;
    }

    return (
        <>
            <button onClick={() => setFilterEnabled(!filterEnabled)} className='filtrobutton'>
                {filterEnabled ? 'Mostrar Todos' : 'Aplicar Filtro'}
            </button>
            <button onClick={handleDownloadExcel} className='downloadbutton'>
                Descargar Eventos en Excel
            </button>
            <div className='grid'>
                {areas.filter(gateway => !filterEnabled || gateway.isOnline).map(gateway => {
                    const gatewayEvents = filteredData.filter(evento => evento.GatewayID === gateway.GatewayID);
                    const totalEntradaEvents = countEntradaEvents(gateway.GatewayID, filteredData);
                    return (
                        <div key={gateway.GatewayID} className='conteinerGateways'>
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
