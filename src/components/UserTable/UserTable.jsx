import React, { useState, useContext, useMemo, memo, useEffect } from 'react';
import { UserContext } from '../../Context/UserProvider';
import Modal from 'react-modal';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import './UserTable.css';
import { API_URL } from '../../config';

Modal.setAppElement('#root'); // Asegúrate de que el id coincida con el id del elemento root en tu index.html

const UsersTable = memo(() => {
    const { users, setUsers } = useContext(UserContext);
    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        Nombre: '',
        Apellido: '',
        Dni: '',
        Cargo: '',
        Empresa: '',
    });

    const [error, setError] = useState('');
    const [reportData, setReportData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [filters, setFilters] = useState({
        Nombre: '',
        Apellido: '',
        Dni: '',
        Cargo: '',
        Empresa: '',
    });

    // Estados para la paginación
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;
    const [totalPages, setTotalPages] = useState(1);

    const memoizedUsers = useMemo(() => {
        return users.map(user => ({
            ...user,
            fullName: `${user.Nombre} ${user.Apellido}`
        }));
    }, [users]);

    useEffect(() => {
        fetchUsersWithPagination(currentPage, itemsPerPage);
    }, [currentPage]);

    useEffect(() => {
        setFilteredData(reportData);
    }, [reportData]);

    const fetchUsersWithPagination = async (page, limit) => {
        try {
            const response = await fetch(`/personas?page=${page}&limit=${limit}`);
            if (!response.ok) {
                throw new Error('Error fetching users');
            }
            const data = await response.json();
            setUsers(data.data);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleEditFormChange = (event) => {
        const { name, value } = event.target;
        setError('');

        if ((name === 'Nombre' || name === 'Apellido') && value && !/^[a-zA-Z\s]*$/.test(value)) {
            setError(`El campo ${name} solo debe contener letras y espacios.`);
            return;
        } else if (name === 'Dni' && value && (!/^\d+$/.test(value) || value.length > 8)) {
            setError('El DNI solo debe contener hasta 8 dígitos numéricos.');
            return;
        }

        setEditFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!editFormData.Nombre || !editFormData.Apellido || !editFormData.Dni || !editFormData.Cargo || !editFormData.Empresa) {
            setError('Todos los campos son obligatorios.');
            return false;
        }
        if (editFormData.Dni.length !== 8 || !/^\d+$/.test(editFormData.Dni)) {
            setError('El DNI debe tener 8 caracteres numéricos.');
            return false;
        }
        if (editingId === null || editFormData.Dni !== users.find(user => user.PersonaID === editingId)?.Dni) {
            if (users.some(user => user.Dni === editFormData.Dni)) {
                setError('El DNI ya está registrado.');
                return false;
            }
        }
        return true;
    };

    const handleEditClick = (user) => {
        setEditingId(user.PersonaID);
        setEditFormData(user);
    };

    const handleCancelClick = () => {
        setEditingId(null);
        setError('');
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esto! Se recomienda Descargar el Historial de Asignaciones",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminarlo!'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`/personas/${id}`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    throw new Error('Error deleting user');
                }
                fetchUsersWithPagination(currentPage, itemsPerPage);
                Swal.fire(
                    'Eliminado!',
                    'El personal ha sido eliminado.',
                    'success'
                );
            } catch (error) {
                setError('Error deleting user');
                console.error('Error:', error);
            }
        }
    };

    const handleDeleteAll = async () => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "¡Esto eliminará todos los registros de personal y sus asignaciones!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar todo!'
        });
    
        if (result.isConfirmed) {
            try {
                const response = await fetch(`/personas`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    throw new Error('Error deleting all users');
                }
                fetchUsersWithPagination(currentPage, itemsPerPage);
                Swal.fire(
                    'Eliminado!',
                    'Todos los registros de personal y sus asignaciones han sido eliminados.',
                    'success'
                );
            } catch (error) {
                setError('Error deleting all users');
                console.error('Error:', error);
            }
        }
    };

    const handleSaveClick = async (id) => {
        if (!validateForm()) return;

        try {
            const response = await fetch(`/personas/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editFormData),
            });
            if (!response.ok) {
                throw new Error('Error saving changes');
            }
            fetchUsersWithPagination(currentPage, itemsPerPage);
            setEditingId(null);
        } catch (error) {
            setError('Error saving changes');
            console.error('Error:', error);
        }
    };

    const fetchReportData = async () => {
        try {
            const response = await fetch(`/report/reportData`);
            if (!response.ok) {
                throw new Error('Error fetching report data');
            }
            const data = await response.json();
            setReportData(data);
            setModalIsOpen(true); // Abre el modal cuando se obtienen los datos
        } catch (error) {
            setError('Error fetching report data');
            console.error('Error:', error);
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
        const filtered = reportData.filter(user => {
            return (
                (!filters.Nombre || user.Nombre.includes(filters.Nombre)) &&
                (!filters.Apellido || user.Apellido.includes(filters.Apellido)) &&
                (!filters.Dni || user.Dni.includes(filters.Dni)) &&
                (!filters.Cargo || user.Cargo.includes(filters.Cargo)) &&
                (!filters.Empresa || user.Empresa.includes(filters.Empresa))
            );
        });
        setFilteredData(filtered);
    };

    const downloadExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
        XLSX.writeFile(workbook, 'report.xlsx');
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    return (
        <>
            <div style={{ color: 'red' }}>{error}</div>
            <div>
                <h2 className="tituloTabla">PERSONAL REGISTRADO</h2>
            </div>
            <div className="filters">
                <button className='btn-filter flex' onClick={fetchReportData}><img src='/img/filtrar.png' alt='filtro' width={"10px"}/> Filtrar y Descargar</button>
                <button className='btnDelete' onClick={handleDeleteAll}>❌ Eliminar Todo</button>
            </div>
            <table className="tabla">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Documento</th>
                        <th>Puesto</th>
                        <th>Empresa</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {memoizedUsers.map((user, index) => (
                        <tr key={user.PersonaID || `tablaUser${index}`}>
                            {editingId === user.PersonaID ? (
                                <>
                                    <td><input type="text" required value={editFormData.Nombre} name="Nombre" onChange={handleEditFormChange} /></td>
                                    <td><input type="text" required value={editFormData.Apellido} name="Apellido" onChange={handleEditFormChange} /></td>
                                    <td><input type="text" required value={editFormData.Dni} name="Dni" onChange={handleEditFormChange} /></td>
                                    <td><input type="text" required value={editFormData.Cargo} name="Cargo" onChange={handleEditFormChange} /></td>
                                    <td><input type="text" required value={editFormData.Empresa} name="Empresa" onChange={handleEditFormChange} /></td>
                                    <td>
                                        <div className='containerButton'>
                                            <img onClick={() => handleSaveClick(user.PersonaID)} src='/img/save.png' alt="Guardar" />
                                            <img onClick={handleCancelClick} src='/img/cancelled.png' alt="Cancelar" />
                                        </div>
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td>{user.Nombre}</td>
                                    <td>{user.Apellido}</td>
                                    <td>{user.Dni}</td>
                                    <td>{user.Cargo}</td>
                                    <td>{user.Empresa}</td>
                                    <td>
                                        <div className='containerButton'>
                                            <img onClick={() => handleEditClick(user)} src='/img/edit.png' alt="Editar" />
                                            <img onClick={() => handleDelete(user.PersonaID)} src='/img/delete.png' alt="Eliminar" />
                                        </div>
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="pagination">
                <button 
                    onClick={() => handlePageChange(currentPage - 1)} 
                    disabled={currentPage === 1}
                >
                    Anterior
                </button>
                <span>{`Página ${currentPage} de ${totalPages}`}</span>
                <button 
                    onClick={() => handlePageChange(currentPage + 1)} 
                    disabled={currentPage === totalPages}
                >
                    Siguiente
                </button>
            </div>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                contentLabel="Vista previa del reporte"
                className="modal"
                overlayClassName="overlay"
            >
                <button onClick={() => setModalIsOpen(false)} className="close-button">×</button>
                <h2 className='tituloTabla'>Vista previa del reporte</h2>
                <div className="filter-container">
                    <input type="text" name="Nombre" placeholder="Nombre" value={filters.Nombre} onChange={handleFilterChange} className='filter-input'/>
                    <input type="text" name="Apellido" placeholder="Apellido" value={filters.Apellido} onChange={handleFilterChange} className='filter-input'/>
                    <input type="text" name="Dni" placeholder="Documento" value={filters.Dni} onChange={handleFilterChange} className='filter-input'/>
                    <input type="text" name="Cargo" placeholder="Puesto" value={filters.Cargo} onChange={handleFilterChange} className='filter-input'/>
                    <input type="text" name="Empresa" placeholder="Empresa" value={filters.Empresa} onChange={handleFilterChange} className='filter-input'/>
                    <button onClick={applyFilters} className="btn btn-primary filter-button">Aplicar Filtros</button>
                </div>
                <button onClick={downloadExcel} className="btn btn-success download-button">Descargar en Excel</button>
                <div className="modal-content">
                    <table className="tabla">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Apellido</th>
                                <th>DNI</th>
                                <th>Cargo</th>
                                <th>Empresa</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((user, index) => (
                                <tr key={user.PersonaID || `tablaUser2${index}`}>
                                    <td>{user.Nombre}</td>
                                    <td>{user.Apellido}</td>
                                    <td>{user.Dni}</td>
                                    <td>{user.Cargo}</td>
                                    <td>{user.Empresa}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Modal>
        </>
    );
});

export default UsersTable;
