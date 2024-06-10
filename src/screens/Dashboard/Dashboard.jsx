import React, { memo, useContext, useEffect, useState } from 'react';
import { EventosBeaconsContext } from '../../Context/EventosBeaconsProvider';
import { GatewayContext } from '../../Context/GatewayProvider';
import { AreaAssigmentContext } from '../../Context/AreaAssigmentProvider';
import ProjectTable from '../../components/ProjectTable/ProjectTable';
import { ChartBarras } from '../../components/Charts/ChartBarras/ChartBarras';
import { ChartBarrasPorArea } from '../../components/Charts/ChartBarrasPorArea/ChartBarrasPorArea';
import EventCountCard from '../../components/EventCountCard/EventCountCard';

import './Dashboard.css';

export const Dashboard = memo(() => {
    const { eventosBeacons, loading } = useContext(EventosBeaconsContext);
    const { gateways } = useContext(GatewayContext);
    const { assignments, fetchAssignments } = useContext(AreaAssigmentContext);
    const [areas, setAreas] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [filterEnabled, setFilterEnabled] = useState(false);
    const [chartData, setChartData] = useState([]);
    const [chartDataPorArea, setChartDataPorArea] = useState([]);

    useEffect(() => {
        const dataPorArea = gateways.map(gateway => {
            const areaNombre = getAreaNombre(gateway.MacAddress);
            const eventosEnAreaEntrada = filteredData.filter(e => e.GatewayID === gateway.GatewayID && e.TipoEvento === 'Entrada').length;
            const eventosEnAreaSalida = filteredData.filter(e => e.GatewayID === gateway.GatewayID && e.TipoEvento === 'Salida').length;
            return {
                area: areaNombre,
                entrada: eventosEnAreaEntrada,
                salida: eventosEnAreaSalida
            };
        });
        setChartDataPorArea(dataPorArea);
    }, [filteredData, gateways]);
    
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

    useEffect(() => {
        // Suponiendo que quieres contar eventos por tipo
        const data = [
            { category: 'Entrada', value: filteredData.filter(e => e.TipoEvento === 'Entrada').length },
            { category: 'Salida', value: filteredData.filter(e => e.TipoEvento === 'Salida').length }
        ];
        setChartData(data);
    }, [filteredData]);

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
                    beaconData.exit = null; // Reset salida cuando hay una nueva entrada
                } else if (event.TipoEvento === 'Salida') {
                    const eventDate = new Date(event.Timestamp);
                    if (!beaconData.exit || eventDate > new Date(beaconData.exit.Timestamp)) {
                        beaconData.exit = event;
                        beaconData.latestTimestamp = event.Timestamp;
                    }
                }
            }
        });

        const filtered = [];
        for (const key in beaconMap) {
            if (beaconMap[key].entry) {
                filtered.push(beaconMap[key].entry);
            } else if (beaconMap[key].exit) {
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
        return (
            <div className='grid'>
                <div className="spinner"></div>
                Cargando...
            </div>
        );
    }

    return (
        <>  
        <div className='chartsContainer'>
       
    
      
        <div className='countsContainer'>
        <EventCountCard count={filteredData.length}  urlImg="/img/totalTrabajadores.png" description="Total de Eventos" className="firtsCountCard"/>
            {chartDataPorArea.map((areaData,indice) => (
                <EventCountCard
                    key={`${areaData.area}${indice}`}
                    count={areaData.entrada + areaData.salida}
                    urlImg="/img/trabajadores.png"

                    description={`Eventos en:`}
                    area={areaData.area}
                />
            ))}
        </div>

     
       

           
        </div>
            
            <div className='chartsContainer'>
    <h2 className='tituloTabla'>Eventos por Área</h2>
    <ChartBarrasPorArea data={chartDataPorArea} />
    {/**<ChartBarras data={chartData}/>**/}

</div>
            <div className='containerBtn'>
            <button onClick={() => setFilterEnabled(!filterEnabled)} className='filtrobutton'>
                {filterEnabled ? 'Mostrar Todos' : <div className='flex'><span>Aplicar Filtro</span> <img className='buttonIcon' src="img/filtrar.png" alt="filtro-Icon" /></div>}
            </button>
            <button onClick={handleDownloadExcel} className='downloadbutton'>
                Descargar Eventos <img src="img/excel.png" alt="" />
            </button>
            </div>
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
                                    <span>{gateway.areaNombre.toUpperCase()}</span>
                                    <span>{gateway.isOnline ? <div className='containerLet'><div className='letEnable'></div></div> : <div className='containerLet'><div className='letDisable'></div></div>}</span>
                                </h2>
                                <h3>{gateway.MacAddress.toUpperCase()}</h3>
                                <p className='flexRow imgP'>
                                    <img src="/img/user.png" alt="usuarioDetectados" />
                                    <span>Total : {gatewayEvents.length}</span>
                                </p>
                                {/* <p className='flexRow imgP'>
                                    <img src="/img/user.png" alt="usuarioDetectados" />
                                    <span>Personal: {totalEntradaEvents}</span>
                                </p> */}
                              
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

