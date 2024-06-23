import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EventosBeaconsFilter from '../EventosBeaconsFilter/EventosBeaconsFilter';
import './EventosBeacons.css'

const EventosBeacons = () => {
    const [eventos, setEventos] = useState([]);
    const [personasSet, setPersonasSet] = useState(new Set());
    const [macAddressesSet, setMacAddressesSet] = useState(new Set());
    const [filteredEventos, setFilteredEventos] = useState([]);
    const [ubicacionesSet, setUbicacionesSet] = useState(new Set());

    useEffect(() => {
        fetchEventos();
    }, []);

    const fetchEventos = async () => {
        try {
            const response = await axios.get('/eventosbeacons/eventos-beacons');
            setEventos(response.data);
            updateSets(response.data);
            setFilteredEventos(response.data); // Inicializa filteredEventos con todos los eventos al cargar
        } catch (error) {
            console.error('Error al obtener eventos:', error);
        }
    };

    const updateSets = (eventos) => {
        const newPersonasSet = new Set();
        const newMacAddressesSet = new Set();
        const newUbicacionesSet = new Set();
        eventos.forEach(evento => {
            newPersonasSet.add(evento.PersonaNombreApellido);
            newMacAddressesSet.add(evento.BeaconMacAddress);
            newUbicacionesSet.add(evento.Ubicacion); // Asumiendo que 'Ubicacion' es el campo correcto
        });
        setPersonasSet(newPersonasSet);
        setMacAddressesSet(newMacAddressesSet);
        setUbicacionesSet(newUbicacionesSet);
    };
    
    const onApplyFilters = (filters) => {
        const filtered = eventos.filter(evento => {
            return (!filters.fechaInicio || new Date(evento.Timestamp) >= new Date(filters.fechaInicio)) &&
                   (!filters.fechaFin || new Date(evento.Timestamp) <= new Date(filters.fechaFin)) &&
                   (!filters.macBeacon || evento.BeaconMacAddress.includes(filters.macBeacon)) &&
                   (!filters.persona || evento.PersonaNombreApellido === filters.persona) &&
                   (!filters.ubicacion || evento.Ubicacion === filters.ubicacion); // Filtro por ubicación
        });
        setFilteredEventos(filtered);
    };

    const onResetFilters = () => {
        setFilteredEventos(eventos);
    };

    return (
        <div>
            <h2 className='tituloTabla'> HISTORIAL - SEGUIMIENTO</h2>
            <EventosBeaconsFilter
    onApplyFilters={onApplyFilters}
    onResetFilters={onResetFilters}
    personas={Array.from(personasSet)}
    macAddresses={Array.from(macAddressesSet)}
    ubicaciones={Array.from(ubicacionesSet)} // Asegúrate de pasar esto
/>
            <table>
                <thead>
                    <tr>
                        <th>Persona</th>
                        <th>MacAddress Beacon</th>
                        <th>Fecha y Hora</th>
                        <th>Ubicación</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredEventos.map(evento => (
                        <tr key={evento.iBeaconID} className={evento.Ubicacion=='Superficie'?'superficie':'interiorMina'}>
                            <td>{evento.PersonaNombreApellido}</td>
                            <td>{evento.BeaconMacAddress}</td>
                            <td>{new Date(evento.Timestamp).toLocaleString()}</td>
                            <td>{evento.Ubicacion}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default EventosBeacons;