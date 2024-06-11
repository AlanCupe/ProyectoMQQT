import React, { useState, useContext, useEffect } from "react";
import Select from 'react-select';
import Modal from 'react-modal';
import Swal from 'sweetalert2';
import { AreaAssigmentContext } from "../../../Context/AreaAssigmentProvider";
import { API_URL } from "../../../config";
import "./AreaAssingmentForm.css";

export const AreaAssingmentForm = () => {
  const { createAssignment, availableGateways, areas, getFilteredAssignments } = useContext(AreaAssigmentContext);
  const [formData, setFormData] = useState({
    macGateway: null,
    areaTrabajo: null,
    fechaAsignacion: ""
  });
  const [filters, setFilters] = useState({
    macGateway: "",
    areaTrabajo: "",
    fechaAsignacion: ""
  });
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    const localDateTime = new Date().toLocaleString('sv-SE').slice(0, 16);
    setFormData((prevData) => ({
      ...prevData,
      fechaAsignacion: localDateTime
    }));
  }, []);

  const handleChange = (selectedOption, { name }) => {
    setFormData({
      ...formData,
      [name]: selectedOption
    });
  };

  const handleFilterChange = (selectedOption, { name }) => {
    setFilters({
      ...filters,
      [name]: selectedOption ? selectedOption.value : ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const postData = {
        macGateway: formData.macGateway ? formData.macGateway.value : "",
        areaTrabajo: formData.areaTrabajo ? formData.areaTrabajo.value : "",
        fechaAsignacion: formData.fechaAsignacion
      };
      await createAssignment(postData);
      setFormData({ macGateway: null, areaTrabajo: null, fechaAsignacion: "" });
    } catch (error) {
      console.error("Error al guardar la asignación", error);
    }
  };

  const handleDownloadFilteredReport = async () => {
    try {
      const response = await fetch(`/area-assignments-report/download?macGateway=${filters.macGateway}&areaTrabajo=${filters.areaTrabajo}&fechaAsignacion=${filters.fechaAsignacion}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'FilteredAssignmentsReport.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
        setModalIsOpen(false);
      } else {
        Swal.fire('Error', 'Error al descargar el reporte.', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Error al descargar el reporte.', 'error');
    }
  };

  const gatewayOptions = availableGateways.map(gateway => ({
    value: gateway.MacAddress,
    label: gateway.MacAddress
  }));

  const areaOptions = areas.map(area => ({
    value: area.Nombre,
    label: area.Nombre
  }));

  return (
    <div>
      <form onSubmit={handleSubmit} className="form-AsignacionBeacons">
        <div className="form-group">
          <Select
            className='select'
            name="macGateway"
            value={formData.macGateway}
            onChange={handleChange}
            options={gatewayOptions}
            placeholder="Seleccione un Gateway"
            isClearable
          />
        </div>
        <div className="form-group">
          <Select
            className='select'
            name="areaTrabajo"
            value={formData.areaTrabajo}
            onChange={handleChange}
            options={areaOptions}
            placeholder="Seleccione un Área"
            isClearable
          />
        </div>
        <div className="form-group input-group">
          <input
            className='input'
            type="datetime-local"
            name="fechaAsignacion"
            value={formData.fechaAsignacion}
            onChange={(e) => setFormData({ ...formData, fechaAsignacion: e.target.value })}
          />
        </div>
        <button className='button' type="submit">Asignar</button>
      </form>
     
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Filtrar y Descargar"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Filtrar Asignaciones</h2>
        <button onClick={() => setModalIsOpen(false)}>Cerrar</button>
        <div className="filters">
          <Select
            className='select'
            name="macGateway"
            value={gatewayOptions.find(option => option.value === filters.macGateway)}
            onChange={handleFilterChange}
            options={gatewayOptions}
            placeholder="Seleccione un Gateway"
            isClearable
          />
          <Select
            className='select'
            name="areaTrabajo"
            value={areaOptions.find(option => option.value === filters.areaTrabajo)}
            onChange={handleFilterChange}
            options={areaOptions}
            placeholder="Seleccione un Área"
            isClearable
          />
          <input
            className='input'
            type="datetime-local"
            name="fechaAsignacion"
            value={filters.fechaAsignacion}
            onChange={(e) => setFilters({ ...filters, fechaAsignacion: e.target.value })}
          />
          <button onClick={handleDownloadFilteredReport}>Descargar Reporte Filtrado</button>
        </div>
      </Modal>
    </div>
  );
};
