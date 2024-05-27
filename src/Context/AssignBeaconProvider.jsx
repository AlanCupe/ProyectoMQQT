import React, { createContext, useState, useEffect } from 'react';

export const AssignBeaconContext = createContext();

const AssignBeaconProvider = ({ children }) => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAssignments = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch('http://localhost:3000/assignbeacon');
                if (response.ok) {
                    const data = await response.json();
                    setAssignments(data);
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
    }, []);

    return (
        <AssignBeaconContext.Provider value={{ assignments, loading, error, setAssignments }}>
            {children}
        </AssignBeaconContext.Provider>
    );
};

export default AssignBeaconProvider;
