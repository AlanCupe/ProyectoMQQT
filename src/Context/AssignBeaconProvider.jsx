import React, { createContext, useState, useEffect } from 'react';
import { API_URL } from '../config';
export const AssignBeaconContext = createContext();

const AssignBeaconProvider = ({ children }) => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(50); /*CAMBIANDO PAGINACION DE 50 A 5, SI DESEAS*/
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const fetchAssignments = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/assignbeacon?page=${page}&pageSize=${pageSize}`);
                if (response.ok) {
                    const data = await response.json();
                    setAssignments(data.data);
                    setTotal(data.total);
                } else {
                    throw new Error('Failed to fetch assignments');
                }
            } catch (error) {
                setError(error.message);
                console.error('Error fetching assignments:', error);
            }
            setLoading(false);
        };

        fetchAssignments();
    }, [page, pageSize]);

    return (
        <AssignBeaconContext.Provider value={{ assignments, loading, error, setAssignments, page, setPage, total, pageSize }}>
            {children}
        </AssignBeaconContext.Provider>
    );
};

export default AssignBeaconProvider;
