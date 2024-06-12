import React, { createContext, useState, useEffect } from 'react';
import { API_URL } from '../config';

export const EventosBeaconsContext = createContext();

export const EventosBeaconsProvider = ({ children }) => {
    const [eventosBeacons, setEventosBeacons] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const fetchEventosBeacons = async () => {
        try {
            const response = await fetch(`/eventosbeacons/eventos2`);
            const data = await response.json();
            setEventosBeacons(data);
            setLoading(false);
        } catch (error) {
            console.error('Error al obtener los eventos:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEventosBeacons();
        const interval = setInterval(fetchEventosBeacons, 500); // Actualiza cada 5 segundos

        return () => clearInterval(interval); // Limpia el intervalo cuando el componente se desmonta
    }, []);

    return (
        <EventosBeaconsContext.Provider value={{ eventosBeacons, loading }}>
            {children}
        </EventosBeaconsContext.Provider>
    );
};
