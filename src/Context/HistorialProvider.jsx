import React, { createContext, useState, useEffect } from 'react';

export const HistorialContext = createContext();

const HistorialProvider = ({ children }) => {
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistorial = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch('http://localhost:3000/historial');
                if (response.ok) {
                    const data = await response.json();
                    setHistorial(data);
                } else {
                    throw new Error('Failed to fetch historial');
                }
            } catch (error) {
                setError(error.message);
                console.error('Error fetching historial:', error);
            }
            setLoading(false);
        };

        fetchHistorial();
    }, []);

    return (
        <HistorialContext.Provider value={{ historial, loading, error }}>
            {children}
        </HistorialContext.Provider>
    );
};

export default HistorialProvider;
