import React, { useContext, useState, memo, useEffect } from 'react';
import Swal from 'sweetalert2';
import { AssignBeaconContext } from '../../Context/AssignBeaconProvider';
import Modal from 'react-modal';
import * as XLSX from 'xlsx';
import "./AssignBeaconTable.css";

Modal.setAppElement('#root');

const AssignBeaconTable = memo(() => {
    const { assignments, loading, error, setAssignments } = useContext(AssignBeaconContext);
    const [editAssignmentId, setEditAssignmentId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        PersonaName: '',
        BeaconMac: '',
        Timestamp: ''
    });
    const [filters, setFilters] = useState({
        PersonaName: '',
        BeaconMac: '',
        Timestamp: ''
    });
    const [filteredData, setFilteredData] = useState(assignments);
    const [modalFilteredData, setModalFilteredData] = useState(assignments);
    const [modalIsOpen, setModalIsOpen] = useState(false);

    useEffect(() => {
        setFilteredData(assignments);
        setModalFilteredData(assignments);
    }, [assignments]);

    const handleEditClick = (assignment) => {
        const isBeaconAssignedToOthers = assignments.some((assgn) => assgn.BeaconMac === assignment.BeaconMac && assgn.AsignacionID !== assignment.AsignacionID);
        if (isBeaconAssignedToOthers) {
            Swal.fire('Error', 'Este beacon ya está asignado a otra persona.', 'error');
            return;
        }
        setEditAssignmentId(assignment.AsignacionID);
        setEditFormData({
            PersonaName: assignment.PersonaName,
            BeaconMac: assignment.BeaconMac,
            Timestamp: assignment.Timestamp
        });
    };

    const handleSave = async () => {
        const response = await fetch(`http://localhost:3000/assignbeacon/${editAssignmentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editFormData)
        });
        if (response.ok) {
            Swal.fire('Actualizado!', 'La asignación ha sido actualizada.', 'success');
            setEditAssignmentId(null);
            setAssignments(prev => prev.map(assignment => {
                if (assignment.AsignacionID === editAssignmentId) {
                    return { ...assignment, ...editFormData };
                }
                return assignment;
            }));
        } else {
            Swal.fire('Error', 'No se pudo actualizar la asignación.', 'error');
        }
    };

    const handleCancel = () => {
        setEditAssignmentId(null);
    };

    const handleFormChange = (event) => {
        const { name, value } = event.target;
        setEditFormData({
            ...editFormData,
            [name]: value
        });
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esto!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminarlo!'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`http://localhost:3000/assignbeacon/${id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    setAssignments(prev => prev.filter(assignment => assignment.AsignacionID !== id));
                    Swal.fire('Eliminado!', 'La asignación ha sido eliminada.', 'success');
                } else {
                    const errorData = await response.text();
                    console.error('Failed to delete assignment:', errorData);
                    throw new Error(errorData);
                }
            } catch (error) {
                console.error('Error deleting assignment:', error);
                Swal.fire('Error', 'No se pudo eliminar la asignación.', 'error');
            }
        }
    };

    const handleFilterChange = (event) => {
        const { name, value } = event.target;
        setFilters(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const applyFilters = () => {
        const filtered = assignments.filter(assignment => 
            assignment.PersonaName.toLowerCase().includes(filters.PersonaName.toLowerCase()) &&
            assignment.BeaconMac.toLowerCase().includes(filters.BeaconMac.toLowerCase()) &&
            assignment.Timestamp.toLowerCase().includes(filters.Timestamp.toLowerCase())
        );
        setModalFilteredData(filtered);
    };

    const handleDownload = () => {
        const worksheet = XLSX.utils.json_to_sheet(modalFilteredData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Assignments");
        XLSX.writeFile(workbook, "Filtered_Assignments.xlsx");
    };

    const formatLocalDateTime = (dateTime) => {
        const localDate = new Date(dateTime);
        return localDate.toLocaleString();
    };

    if (loading) return <p>Cargando asignaciones...</p>;
    if (error) return <p>Error al cargar asignaciones: {error}</p>;

    return (
        <div>
            <h2 className='tituloTabla'>ASIGNACIONES</h2>
            <div>
                <button className='btn-filter' onClick={() => setModalIsOpen(true)}>Filtrar y Descargar</button>
            </div>
            <table className='tabla'>
                <thead>
                    <tr>
                        <th>Persona</th>
                        <th>Beacon</th>
                        <th>Fecha y Hora de Asignación</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map((assignment,index) => {
                        return (
                            <tr key={assignment.AsignacionID || index}>
                                {editAssignmentId === assignment.AsignacionID ? (
                                    <>
                                        <td><input type="text" name="PersonaName" value={editFormData.PersonaName} onChange={handleFormChange} /></td>
                                        <td><input type="text" name="BeaconMac" value={editFormData.BeaconMac} onChange={handleFormChange} /></td>
                                        <td><input type="datetime-local" name="Timestamp" value={editFormData.Timestamp} onChange={handleFormChange} /></td>
                                        <td>
                                            <div className='containerButton'>
                                                <img onClick={handleSave} src='/img/save.png' alt="Guardar" />
                                                <img onClick={handleCancel} src='/img/cancelled.png' alt="Cancelar" />
                                            </div>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td>{assignment.PersonaName}</td>
                                        <td>{assignment.BeaconMac}</td>
                                        <td>{formatLocalDateTime(assignment.Timestamp)}</td>
                                        <td>
                                            <div className='containerButton'>
                                                <img onClick={() => handleEditClick(assignment)} src='/img/edit.png' alt="Editar" />
                                                <img onClick={() => handleDelete(assignment.AsignacionID)} src='/img/delete.png' alt="Eliminar" />
                                            </div>
                                        </td>
                                    </>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                contentLabel="Filtrar y Descargar"
                className="modal"
                overlayClassName="overlay"
            >
                <button onClick={() => setModalIsOpen(false)} className="close-button">×</button>
                <h2 className='tituloTabla'>Filtrar Asignaciones</h2>
                <div className="filter-container">
                    <input
                        type="text"
                        name="PersonaName"
                        placeholder="Persona"
                        value={filters.PersonaName}
                        onChange={handleFilterChange}
                        className="filter-input"
                    />
                    <input
                        type="text"
                        name="BeaconMac"
                        placeholder="Beacon"
                        value={filters.BeaconMac}
                        onChange={handleFilterChange}
                        className="filter-input"
                    />
                    <input
                        type="text"
                        name="Timestamp"
                        placeholder="Fecha y Hora de Asignación"
                        value={filters.Timestamp}
                        onChange={handleFilterChange}
                        className="filter-input"
                    />
                    <button onClick={applyFilters} className="filter-button">Aplicar Filtros</button>
                </div>
                <table className="tabla">
                    <thead>
                        <tr>
                            <th>Persona</th>
                            <th>Beacon</th>
                            <th>Fecha y Hora de Asignación</th>
                        </tr>
                    </thead>
                    <tbody>
                        {modalFilteredData.map((assignment,index) => (
                            <tr key={assignment.AsignacionID || index}>
                                <td>{assignment.PersonaName}</td>
                                <td>{assignment.BeaconMac}</td>
                                <td>{formatLocalDateTime(assignment.Timestamp)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button onClick={handleDownload} className="download-button">Descargar en Excel</button>
            </Modal>
        </div>
    );
});

export default AssignBeaconTable;
