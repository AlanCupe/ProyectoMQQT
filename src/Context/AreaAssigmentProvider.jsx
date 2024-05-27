// AreaAssigmentProvider.jsx
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AreaAssigmentContext = createContext();

export const AreaAssigmentProvider = ({ children }) => {
  const [assignments, setAssignments] = useState([]);
  const [availableGateways, setAvailableGateways] = useState([]);
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    fetchAssignments();
    fetchAvailableGateways();
    fetchAreas();
  }, []);

  const fetchAssignments = async () => {
    const response = await axios.get('http://localhost:3000/asignaciongatewaysareas');
    setAssignments(response.data);
  };

  const fetchAvailableGateways = async () => {
    const response = await axios.get('http://localhost:3000/unassigned');
    setAvailableGateways(response.data);
  };

  const fetchAreas = async () => {
    const response = await axios.get('http://localhost:3000/arearegister');
    setAreas(response.data);
  };

  const createAssignment = async (assignmentData) => {
    await axios.post('http://localhost:3000/asignaciongatewaysareas', assignmentData);
    fetchAssignments();
    fetchAvailableGateways();
  };

  const updateAssignment = async (id, assignmentData) => {
    await axios.put(`http://localhost:3000/asignaciongatewaysareas/${id}`, assignmentData);
    fetchAssignments();
    fetchAvailableGateways();
  };

  const deleteAssignment = async (id) => {
    await axios.delete(`http://localhost:3000/asignaciongatewaysareas/${id}`);
    fetchAssignments();
    fetchAvailableGateways();
  };

  return (
    <AreaAssigmentContext.Provider value={{ assignments, availableGateways, areas, createAssignment, updateAssignment, deleteAssignment, fetchAssignments }}>
      {children}
    </AreaAssigmentContext.Provider>
  );
};
