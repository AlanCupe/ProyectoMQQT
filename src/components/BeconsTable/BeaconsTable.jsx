import React, { useState, useContext, useEffect, memo } from 'react';
import { BeaconContext } from '../../Context/BeaconProvider';
import Modal from 'react-modal';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import "./BeaconsTable.css";

Modal.setAppElement('#root'); // Asegúrate de que el id coincida con el id del elemento root en tu index.html

export const BeaconsTable = memo(() => {
    const { beacons, setUpdateTrigger } = useContext(BeaconContext);
    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        MacAddress: '',
        BleNo: '',
        BleName: '',
        iBeaconUuid: '',
        iBeaconMajor: '',
        iBeaconMinor: '',
        Rssi: '',
        iBeaconTxPower: '',
        Battery: ''
    });

    const [error, setError] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [filters, setFilters] = useState({
        MacAddress: ''
    });

    useEffect(() => {
        if (Array.isArray(beacons)) {
            // Eliminar duplicados por MacAddress en el componente
            const uniqueBeacons = beacons.reduce((acc, beacon) => {
                if (!acc.some(b => b.MacAddress === beacon.MacAddress)) {
                    acc.push(beacon);
                }
                return acc;
            }, []);
            setFilteredData(uniqueBeacons.filter(beacon => beacon && beacon.MacAddress && beacon.MacAddress.startsWith('C3000')));
        }
    }, [beacons]);

    const handleEditFormChange = (event) => {
        const { name, value } = event.target;
        setEditFormData({
            ...editFormData,
            [name]: value
        });
    };

    const handleEditClick = (beacon) => {
        setEditingId(beacon.iBeaconID);
        setEditFormData(beacon);
    };

    const handleCancelClick = () => {
        setEditingId(null);
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esto! Se Recomienda Descargar el Historial de Asignaciones, y si deseas eliminar un Beacon ¡Asegurate de que este apagado!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminarlo!'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`http://localhost:3000/beacons/${id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    setUpdateTrigger(prev => !prev);
                    Swal.fire(
                        'Eliminado!',
                        'El beacon ha sido eliminado.',
                        'success'
                    );
                } else {
                    setError('Error al eliminar el beacon.');
                }
            } catch (error) {
                console.error('Error al eliminar el beacon:', error);
                setError('Error al eliminar el beacon.');
            }
        }
    };

    const handleSaveClick = async (id) => {
        const response = await fetch(`http://localhost:3000/beacons/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(editFormData),
        });

        if (response.ok) {
            setUpdateTrigger(prev => !prev);
            setEditingId(null);
        } else {
            setError('Error al guardar los cambios.');
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
        const filtered = beacons.filter(beacon => {
            return beacon && beacon.MacAddress.toLowerCase().includes(filters.MacAddress.toLowerCase()) &&
                   beacon.MacAddress.startsWith('C3000');
        });
        setFilteredData(filtered);
    };

    const handleDownload = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Beacons");
        XLSX.writeFile(workbook, "filtered_beacons.xlsx");
    };

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div>
            <div>
                <h2 className='tituloTabla'>BEACONS REGISTRADOS</h2>
                <button className='btn-filter' onClick={() => setModalIsOpen(true)}>Filtrar y Descargar</button>
            </div>
            <table className='tabla'>
                <thead>
                    <tr>
                        <th>MAC Address</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map((beacon,index) => (
                        <tr key={beacon.iBeaconID || index}>
                            {editingId === beacon.iBeaconID ? (
                                <>
                                    <td><input type="text" name="MacAddress" value={editFormData.MacAddress} onChange={handleEditFormChange} /></td>
                                    <td>
                                        <div className='containerButton'>
                                            <img onClick={() => handleSaveClick(beacon.iBeaconID)} src='/img/save.png' alt="Guardar" />
                                            <img onClick={handleCancelClick} src='/img/cancelled.png' alt="Cancelar" />
                                        </div>
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td>{beacon.MacAddress}</td>
                                    <td>
                                        <div className='containerButton'>
                                            <img
                                                onClick={() => handleEditClick(beacon)}
                                                src='/img/edit.png'
                                                alt="Editar"
                                            />
                                            <img
                                                onClick={() => handleDelete(beacon.iBeaconID)}
                                                src='/img/delete.png'
                                                alt="Eliminar"
                                            />
                                        </div>
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                contentLabel="Filtrar y Descargar"
                className="modal"
                overlayClassName="overlay"
            >
                <button className="close-button" onClick={() => setModalIsOpen(false)}>x</button>
                <h2 className='tituloTabla'>Filtrar Beacons</h2>
                <div className="filter-container">
                    <input type="text" className='filter-input' name="MacAddress" value={filters.MacAddress} onChange={handleFilterChange} placeholder='  MAC Address:' />
                    <button className='filter-button' onClick={applyFilters}>Aplicar Filtros</button>
                </div>
                <button onClick={handleDownload} className='download-button'>Descargar en Excel</button>
                <div className="modal-content">
                    <table className="tabla">
                        <thead>
                            <tr>
                                <th>MAC Address</th>
                                <th>BLE No</th>
                                <th>BLE Name</th>
                                <th>UUID</th>
                                <th>Major</th>
                                <th>Minor</th>
                                <th>RSSI</th>
                                <th>Tx Power</th>
                                <th>Battery</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((beacon,index) => (
                                <tr key={beacon.iBeaconID || index}>
                                    <td>{beacon.MacAddress}</td>
                                    <td>{beacon.BleNo}</td>
                                    <td>{beacon.BleName}</td>
                                    <td>{beacon.iBeaconUuid}</td>
                                    <td>{beacon.iBeaconMajor}</td>
                                    <td>{beacon.iBeaconMinor}</td>
                                    <td>{beacon.Rssi}</td>
                                    <td>{beacon.iBeaconTxPower}</td>
                                    <td>{beacon.Battery}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Modal>
        </div>
    );
});

export default BeaconsTable;
