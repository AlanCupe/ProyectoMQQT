import React, { useContext, useState, useMemo, memo } from 'react';
import { HistorialContext } from '../../Context/HistorialProvider';
import Select from 'react-select';
import * as XLSX from 'xlsx';
import './HistorialTable.css';

const HistorialTable = memo(() => {
    const { historial, loading, error } = useContext(HistorialContext);
    const [filter, setFilter] = useState('');
    const [beaconFilter, setBeaconFilter] = useState('');
    const [fechaAsignacionFilter, setFechaAsignacionFilter] = useState('');
    const [fechaBajaFilter, setFechaBajaFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    const totalPages = Math.ceil(historial.length / itemsPerPage);

    const handleFilterChange = (event, setFilterFunc) => {
        setFilterFunc(event.target.value);
    };

    const filteredHistorial = historial.filter(entry => {
        const personaMatches = entry.PersonaName.toLowerCase().includes(filter.toLowerCase());
        const beaconMatches = entry.BeaconMac.includes(beaconFilter);
    
        // Convertir las fechas de los datos y los filtros a objetos Date
        const entryFechaAsignacion = new Date(entry.fechaAsignacion);
        const filterFechaAsignacionStart = fechaAsignacionFilter ? new Date(fechaAsignacionFilter) : null;
        const filterFechaAsignacionEnd = filterFechaAsignacionStart ? new Date(filterFechaAsignacionStart.getFullYear(), filterFechaAsignacionStart.getMonth(), filterFechaAsignacionStart.getDate(), 23, 59, 59) : null;
    
        const entryFechaBaja = entry.fechaBaja ? new Date(entry.fechaBaja) : null;
        const filterFechaBajaStart = fechaBajaFilter ? new Date(fechaBajaFilter) : null;
        const filterFechaBajaEnd = filterFechaBajaStart ? new Date(filterFechaBajaStart.getFullYear(), filterFechaBajaStart.getMonth(), filterFechaBajaStart.getDate(), 23, 59, 59) : null;
    
        // Comparar las fechas incluyendo horas, minutos y segundos
        const fechaAsignacionMatches = !filterFechaAsignacionStart || (
            entryFechaAsignacion >= filterFechaAsignacionStart &&
            entryFechaAsignacion <= filterFechaAsignacionEnd
        );
    
        const fechaBajaMatches = !filterFechaBajaStart || (
            entryFechaBaja &&
            entryFechaBaja >= filterFechaBajaStart &&
            entryFechaBaja <= filterFechaBajaEnd
        );
    
        return personaMatches && beaconMatches && fechaAsignacionMatches && fechaBajaMatches;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredHistorial.slice(indexOfFirstItem, indexOfLastItem);

    const downloadExcel = () => {
        const dataForExcel = filteredHistorial.map(entry => ({
            ...entry,
            fechaAsignacion: formatDate(entry.fechaAsignacion),
            fechaBaja: entry.fechaBaja ? formatDate(entry.fechaBaja) : 'N/A'
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Historial");
        XLSX.writeFile(workbook, 'historial_filtrado.xlsx');
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
    };

    if (loading) return <p>Cargando historial...</p>;
    if (error) return <p>Error cargando historial: {error}</p>;

    return (
        <div className='historial'>
            <h1 className='tituloTabla'>HISTORIAL DE ASIGNACIONES</h1>
            <div className='flexForm'>
            <Select
                placeholder="Filtrar por nombre..."
                value={filter ? { label: filter, value: filter } : null}
                onChange={e => handleFilterChange({ target: { value: e ? e.value : '' }}, setFilter)}
                options={historial.map(item => ({ label: item.PersonaName, value: item.PersonaName }))}
                isClearable
                className='selecth'
            />
            <Select
                placeholder="Filtrar por beacon..."
                value={beaconFilter ? { label: beaconFilter, value: beaconFilter } : null}
                onChange={e => handleFilterChange({ target: { value: e ? e.value : '' }}, setBeaconFilter)}
                options={historial.map(item => ({ label: item.BeaconMac, value: item.BeaconMac }))}
                isClearable
                className='selecth'
            />
                <input
                    type="datetime-local"
                    value={fechaAsignacionFilter}
                    onChange={e => handleFilterChange(e, setFechaAsignacionFilter)}
                />
               
                <button className='btnHistorial' onClick={downloadExcel}>Descargar filtrado</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>#</th> 
                        <th>Persona</th>
                        <th>Beacon</th>
                        <th>Fecha de Asignación</th>
                        <th>Fecha de Baja</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map((entry, index) => (
                        <tr key={`${index}historial`}>
                            <td>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                            <td>{entry.PersonaName}</td>
                            <td>{entry.BeaconMac}</td>
                            <td>{formatDate(entry.fechaAsignacion)}</td>
                            <td>{entry.fechaBaja ? formatDate(entry.fechaBaja) : 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="pagination">
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Anterior</button>
                <span>Página {currentPage} de {totalPages}</span>
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Siguiente</button>
            </div>
        </div>
    );
});

export default HistorialTable;