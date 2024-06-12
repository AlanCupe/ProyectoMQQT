import React, { createContext, useState, useEffect } from 'react';
import { API_URL } from '../config';
export const BeaconContext = createContext();

export const BeaconProvider = ({ children }) => {
    const [beacons, setBeacons] = useState([]);
    const [updateTrigger, setUpdateTrigger] = useState(false);

    useEffect(() => {
        const fetchBeacons = async () => {
            try {
                const response = await fetch(`/beacons`);
                const data = await response.json();
                // Eliminar duplicados por MacAddress
                const uniqueBeacons = data.reduce((acc, beacon) => {
                    if (!acc.some(b => b.MacAddress === beacon.MacAddress)) {
                        acc.push(beacon);
                    }
                    return acc;
                }, []);
                setBeacons(uniqueBeacons);
            } catch (error) {
                console.error('Error fetching beacons:', error);
            }
        };
        fetchBeacons();
    }, [updateTrigger]);

    const addBeacon = (beacon) => {
        setBeacons(prevBeacons => [...prevBeacons, beacon]);
    };

    return (
        <BeaconContext.Provider value={{ beacons, addBeacon, setUpdateTrigger }}>
            {children}
        </BeaconContext.Provider>
    );
};
