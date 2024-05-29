import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const GatewayContext = createContext();

export const GatewayProvider = ({ children }) => {
    const [gateways, setGateways] = useState([]);
    const [areas, setAreas] = useState([]);
    const [asignaciones, setAsignaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {
        const fetchGateways = async () => {
            const response = await axios.get('http://localhost:3000/gatewayregister');
            const gatewaysWithStatus = response.data.map(gateway => {
                const isOnline = new Date() - new Date(gateway.LastHeartbeat) < 3000; // 10 seg
                return { ...gateway, isOnline };
            });
            setGateways(gatewaysWithStatus);
        };

        fetchGateways(); // Fetch initially

        const interval = setInterval(fetchGateways, 500); // Poll every 10 seconds

        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                await Promise.all([fetchGateways(), fetchAreas(), fetchAsignaciones()]);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    const fetchGateways = async () => {
        const response = await axios.get('http://localhost:3000/gatewayregister');
        setGateways(response.data);
    };

    const fetchAreas = async () => {
        const response = await axios.get('http://localhost:3000/areas');
        setAreas(response.data);
    };

    const createGateway = async (gatewayData) => {
        await axios.post('http://localhost:3000/gatewayregister', gatewayData);
        fetchGateways();
    };

    const updateGateway = async (id, macAddress, timestamp) => {
        console.log("Datos Recibidos:", id, macAddress, timestamp);
    
        // Verificar si timestamp es una cadena y convertirla a un objeto Date si es necesario
        if (typeof timestamp === 'string') {
            timestamp = new Date(timestamp);
        }
    
        // Verificar si timestamp es un objeto Date
        if (!(timestamp instanceof Date && !isNaN(timestamp))) {
            console.error("El timestamp no es un objeto Date válido");
            return;
        }
    
        // Formatear el timestamp como una cadena ISO
        const formattedTimestamp = timestamp.toISOString();
    
        await axios.put(`http://localhost:3000/gatewayregister/${id}`, { GatewayID:id,MacAddress: macAddress, Timestamp: formattedTimestamp });
        console.log("Datos enviados:", { GatewayID:id,MacAddress: macAddress, Timestamp: formattedTimestamp });
        fetchGateways();
    };
    
    

    const deleteGateway = async (id) => {
        await axios.delete(`http://localhost:3000/gatewayregister/${id}`);
        fetchGateways();
    };

    const fetchAsignaciones = async () => {
        const response = await axios.get('http://localhost:3000/asignaciongatewaysareas');
        setAsignaciones(response.data);
    };

    return (
        <GatewayContext.Provider value={{ gateways, createGateway, updateGateway, deleteGateway, areas, fetchAsignaciones, asignaciones, setAsignaciones, loading, error }}>
            {children}
        </GatewayContext.Provider>
    );
};
