import React, { useContext, useState, memo, useEffect } from 'react';
import Swal from 'sweetalert2';
import { AssignBeaconContext } from '../../Context/AssignBeaconProvider';
import Modal from 'react-modal';
import * as XLSX from 'xlsx';
import { API_URL } from '../../config';
import "./AssignBeaconTable.css";

Modal.setAppElement('#root');

const AssignBeaconTable = memo(() => {
    const { assignments, loading, error, setAssignments, page, setPage, total, pageSize } = useContext(AssignBeaconContext);
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
                const response = await fetch(`/assignbeacon/${id}`, {
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

    const handleDeleteAll = async () => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esto!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar todas!'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`/assignbeacon`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    setAssignments([]);
                    Swal.fire('Eliminadas!', 'Todas las asignaciones han sido eliminadas.', 'success');
                } else {
                    const errorData = await response.text();
                    console.error('Failed to delete all assignments:', errorData);
                    throw new Error(errorData);
                }
            } catch (error) {
                console.error('Error deleting all assignments:', error);
                Swal.fire('Error', 'No se pudo eliminar todas las asignaciones.', 'error');
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

    const handleNextPage = () => {
        if (page < Math.ceil(total / pageSize)) {
            setPage(page + 1);
        }
    };

    const handlePreviousPage = () => {
        if (page > 1) {
            setPage(page - 1);
        }
    };

    if (loading) return <p>Cargando asignaciones...</p>;
    if (error) return <p>Error al cargar asignaciones: {error}</p>;

    return (
        <div>
            <h2 className='tituloTabla'>ASIGNACIONES</h2>
            <div className='filters'>
                <button className='btn-filter flex' onClick={() => setModalIsOpen(true)}><img src='/img/filtrar.png' width={"10px"}/>Filtrar y Descargar</button>
                <button className='btnDelete' onClick={handleDeleteAll}>❌ Eliminar Todas las Asignaciones</button>
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
                    {filteredData.map((assignment, index) => {
                        return (
                            <tr key={assignment.AsignacionID || index}>
                                <td>{assignment.PersonaName}</td>
                                <td>{assignment.BeaconMac}</td>
                                <td>{formatLocalDateTime(assignment.Timestamp)}</td>
                                <td>
                                    <div className='containerButton'>
                                        <img onClick={() => handleDelete(assignment.AsignacionID)} src='/img/delete.png' alt="Eliminar" />
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <div className="pagination">
                <button onClick={handlePreviousPage} disabled={page === 1}>
                    Anterior
                </button>
                <span>Página {page} de {Math.ceil(total / pageSize)}</span>
                <button onClick={handleNextPage} disabled={page === Math.ceil(total / pageSize)}>
                    Siguiente
                </button>
            </div>
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
                        {modalFilteredData.map((assignment, index) => (
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
