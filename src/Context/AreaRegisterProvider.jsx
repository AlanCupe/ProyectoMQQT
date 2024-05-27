// Context/AreaRegisterProvider.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AreaRegisterContext = createContext();

export const AreaRegisterProvider = ({ children }) => {
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    const response = await axios.get('http://localhost:3000/arearegister');
    setAreas(response.data);
  };

  const createArea = async (nombre) => {
    await axios.post('http://localhost:3000/arearegister', { nombre });
    fetchAreas();
  };

  const updateArea = async (id, nombre) => {
    await axios.put(`http://localhost:3000/arearegister/${id}`, { nombre });
    fetchAreas();
  };

  const deleteArea = async (id) => {
    await axios.delete(`http://localhost:3000/arearegister/${id}`);
    fetchAreas();
  };

  return (
    <AreaRegisterContext.Provider value={{ areas, createArea, updateArea, deleteArea }}>
      {children}
    </AreaRegisterContext.Provider>
  );
};
