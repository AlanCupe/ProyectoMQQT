import React, { useContext, useState, memo, useEffect } from "react";
import Modal from 'react-modal';
import { AreaAssigmentContext } from "../../../Context/AreaAssigmentProvider";
import * as XLSX from 'xlsx';
import "./AreaAssignmentTable.css";

Modal.setAppElement('#root');

export const AreaAssignmentTable = memo(() => {
  const { assignments, availableGateways, areas, updateAssignment, deleteAssignment } = useContext(AreaAssigmentContext);
  const [editData, setEditData] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    macGateway: '',
    areaTrabajo: '',
    fechaAsignacion: ''
  });
  const [filteredData, setFilteredData] = useState(assignments);

  useEffect(() => {
    setFilteredData(assignments);
  }, [assignments]);

  const handleEdit = (item) => {
    setEditData(item);
  };

  const handleSave = async () => {
    try {
      await updateAssignment(editData.id, editData);
      setEditData(null);
    } catch (error) {
      console.error("Error saving data", error);
    }
  };

  const handleCancelClick = () => {
    setEditData(null);
  };

  const handleDelete = async (id) => {
    try {
      await deleteAssignment(id);
    } catch (error) {
      console.error("Error deleting data", error);
    }
  };

  const formatLocalDateTime = (dateTime) => {
    const localDate = new Date(dateTime);
    return localDate.toLocaleString();
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const applyFilters = () => {
    const filtered = assignments.filter(item => {
      return (
        (!filters.macGateway || item.macGateway.toLowerCase().includes(filters.macGateway.toLowerCase())) &&
        (!filters.areaTrabajo || item.areaTrabajo.toLowerCase().includes(filters.areaTrabajo.toLowerCase())) &&
        (!filters.fechaAsignacion || formatLocalDateTime(item.fechaAsignacion).includes(filters.fechaAsignacion))
      );
    });
    setFilteredData(filtered);
  };

  const handleDownloadFilteredReport = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData.map(item => ({
      'MAC Gateway': item.macGateway,
      'Área de Trabajo': item.areaTrabajo,
      'Fecha de Asignación': formatLocalDateTime(item.fechaAsignacion)
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Area Assignments");
    XLSX.writeFile(workbook, "FilteredAreaAssignmentsReport.xlsx");
  };

  return (
    <div>
      <button className="btn-filter" onClick={() => setModalIsOpen(true)}>Ver y Descargar Reporte</button>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Filtrar y Descargar"
        className="modal"
        overlayClassName="overlay"
      >
        <button className="close-button" onClick={() => setModalIsOpen(false)}>×</button>
        <h2>Filtrar Asignaciones</h2>
        <div className="filter-container">
          <input type="text" name="macGateway" value={filters.macGateway} onChange={handleFilterChange}  className="filter-input" placeholder="MAC Gateway:"/>
          <input type="text" name="areaTrabajo" value={filters.areaTrabajo} onChange={handleFilterChange}  className="filter-input" placeholder="  Área de Trabajo:"/>
          <input type="text" name="fechaAsignacion" value={filters.fechaAsignacion} onChange={handleFilterChange} className="filter-input" placeholder="Fecha de Asignación:" />
          <button className="filter-button" onClick={applyFilters}>Aplicar Filtros</button>
        </div>
        <div className="modal-content">
          <table>
            <thead>
              <tr>
                <th>MAC Gateway</th>
                <th>Área de Trabajo</th>
                <th>Fecha de Asignación</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.id}>
                  <td>{item.macGateway}</td>
                  <td>{item.areaTrabajo}</td>
                  <td>{formatLocalDateTime(item.fechaAsignacion)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="download-button" onClick={handleDownloadFilteredReport}>Descargar Reporte Filtrado</button>
      </Modal>
      <table>
        <thead>
          <tr>
            <th>MAC Gateway</th>
            <th>Área de Trabajo</th>
            <th>Fecha de Asignación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((item) => (
            <tr key={item.id}>
              <td>
                {editData && editData.id === item.id ? (
                  <select
                    value={editData.macGateway}
                    onChange={(e) => setEditData({ ...editData, macGateway: e.target.value })}
                  >
                    <option value="">Seleccione un Gateway</option>
                    {availableGateways.map((gateway) => (
                      <option key={gateway.GatewayID} value={gateway.MacAddress}>
                        {gateway.MacAddress}
                      </option>
                    ))}
                  </select>
                ) : (
                  item.macGateway
                )}
              </td>
              <td>
                {editData && editData.id === item.id ? (
                  <select
                    value={editData.areaTrabajo}
                    onChange={(e) => setEditData({ ...editData, areaTrabajo: e.target.value })}
                  >
                    <option value="">Seleccione un Área</option>
                    {areas.map((area) => (
                      <option key={area.AreaID} value={area.Nombre}>
                        {area.Nombre}
                      </option>
                    ))}
                  </select>
                ) : (
                  item.areaTrabajo
                )}
              </td>
              <td>{formatLocalDateTime(item.fechaAsignacion)}</td>
              <td>
                {editData && editData.id === item.id ? (
                  <div className='containerButton'>
                    <img onClick={handleSave} src='/img/save.png' alt="Guardar" />
                    <img onClick={handleCancelClick} src='/img/cancelled.png' alt="Cancelar" />
                  </div>
                ) : (
                  <div className='containerButton'>
                    <img onClick={() => handleEdit(item)} src='/img/edit.png' alt="Editar" />
                    <img onClick={() => handleDelete(item.id)} src='/img/delete.png' alt="Eliminar" />
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
