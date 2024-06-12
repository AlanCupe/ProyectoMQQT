// AreaAssigmentProvider.jsx
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
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
    const response = await axios.get(`/asignaciongatewaysareas`);
    setAssignments(response.data);
  };

  const fetchAvailableGateways = async () => {
    const response = await axios.get(`/unassigned`);
    setAvailableGateways(response.data);
  };

  const fetchAreas = async () => {
    const response = await axios.get(`/arearegister`);
    setAreas(response.data);
  };

  const createAssignment = async (assignmentData) => {
    await axios.post(`/asignaciongatewaysareas`, assignmentData);
    fetchAssignments();
    fetchAvailableGateways();
  };

  const updateAssignment = async (id, assignmentData) => {
    await axios.put(`/asignaciongatewaysareas/${id}`, assignmentData);
    fetchAssignments();
    fetchAvailableGateways();
  };

  const deleteAssignment = async (id) => {
    await axios.delete(`/asignaciongatewaysareas/${id}`);
    fetchAssignments();
    fetchAvailableGateways();
  };

  return (
    <AreaAssigmentContext.Provider value={{ assignments, availableGateways, areas, createAssignment, updateAssignment, deleteAssignment, fetchAssignments }}>
      {children}
    </AreaAssigmentContext.Provider>
  );
};
