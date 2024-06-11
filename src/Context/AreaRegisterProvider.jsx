// Context/AreaRegisterProvider.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

export const AreaRegisterContext = createContext();

export const AreaRegisterProvider = ({ children }) => {
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    const response = await axios.get(`/arearegister`);
    setAreas(response.data);
  };

  const createArea = async (nombre) => {
    await axios.post(`/arearegister`, { nombre });
    fetchAreas();
  };

  const updateArea = async (id, nombre) => {
    await axios.put(`/arearegister/${id}`, { nombre });
    fetchAreas();
  };

  const deleteArea = async (id) => {
    await axios.delete(`/arearegister/${id}`);
    fetchAreas();
  };

  return (
    <AreaRegisterContext.Provider value={{ areas, createArea, updateArea, deleteArea }}>
      {children}
    </AreaRegisterContext.Provider>
  );
};
