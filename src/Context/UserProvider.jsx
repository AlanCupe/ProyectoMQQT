import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const [updateTrigger, setUpdateTrigger] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:3000/personas?page=1&limit=50');
                if (!response.ok) {
                    throw new Error('Error fetching users');
                }
                const data = await response.json();
                setUsers(data.data);
            } catch (error) {
                console.error('Error:', error);
            }
        };
        fetchData();
    }, [updateTrigger]);

    const addUser = (user) => {
        setUsers(prevUsers => [...prevUsers, user]);
        setUpdateTrigger(prev => !prev);
    };

    const fetchUsers = async (page, limit) => {
        try {
            const response = await fetch(`http://localhost:3000/personas?page=${page}&limit=${limit}`);
            if (!response.ok) {
                throw new Error('Error fetching users');
            }
            const data = await response.json();
            setUsers(data.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <UserContext.Provider value={{ users, setUsers, addUser, fetchUsers }}>
            {children}
        </UserContext.Provider>
    );
};
