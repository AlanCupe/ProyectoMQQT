import React, { useContext } from 'react';
import { HistorialContext } from '../../Context/HistorialProvider';
import './HistorialTable.css';
import { saveAs } from 'file-saver';
import { API_URL } from '../../config';

const HistorialTable = () => {
    const { historial, loading, error, page, pageSize, total, setPage } = useContext(HistorialContext);

    const downloadExcel = async (type) => {
        let url;
        switch (type) {
            case 'daily':
                url = `/historial/excel`;
                break;
            case 'monthly':
                url = `/historial/archivoexcel`;
                break;
            default:
                return;
        }

        try {
            const response = await fetch(url);
            const blob = await response.blob();
            saveAs(blob, `historial_${type}.xlsx`);
        } catch (error) {
            console.error('Error downloading Excel file:', error);
        }
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
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

    if (loading) return <p>Loading historial...</p>;
    if (error) return <p>Error loading historial: {error}</p>;

    return (
        <div className='historial'>
            <h1 className='tituloTabla'>HISTORIAL DE ASIGNACIONES</h1>
           <div className='containerBtnHistorial'>
           <button className='flex  btnHistorial' onClick={() => downloadExcel('daily')}>Reporte Diario <img src='img/excel.png' alt='ExcelIcon' width={'20px'}/></button>
            <button className='flex btnHistorial' onClick={() => downloadExcel('monthly')}>Reporte General  <img src='img/excel.png' alt='ExcelIcon' width={'20px'}/></button>
           </div>
            <table>
                <thead>
                    <tr>
                        <th>Persona</th>
                        <th>Beacon</th>
                        <th>Fecha de Asignación</th>
                        <th>Fecha de Baja</th>
                    </tr>
                </thead>
                <tbody>
                    {historial.map((entry, index) => (
                        <tr key={entry.HistorialID || index}>
                            <td>{entry.PersonaName}</td>
                            <td>{entry.BeaconMac}</td>
                            <td>{formatDate(entry.fechaAsignacion)}</td>
                            <td>{entry.fechaBaja ? formatDate(entry.fechaBaja) : 'N/A'}</td>
                        </tr>
                    ))}
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
        </div>
    );
};

export default HistorialTable;
