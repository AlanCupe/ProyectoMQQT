import React, { createContext, useState, useEffect } from 'react';
import { API_URL } from '../config';

export const HistorialContext = createContext();

const HistorialProvider = ({ children }) => {
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const fetchHistorial = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/historial1?page=${page}&pageSize=${pageSize}`);
                if (response.ok) {
                    const data = await response.json();
                    setHistorial(data.data);
                    setTotal(data.total);
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
    }, [page, pageSize]);

    return (
        <HistorialContext.Provider value={{ historial, loading, error, page, pageSize, total, setPage }}>
            {children}
        </HistorialContext.Provider>
    );
};

export default HistorialProvider;
