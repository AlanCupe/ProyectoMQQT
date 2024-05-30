import React, { useContext } from 'react';
import { HistorialContext } from '../../Context/HistorialProvider';
import './HistorialTable.css';
import { saveAs } from 'file-saver';

const HistorialTable = () => {
    const { historial, loading, error } = useContext(HistorialContext);

    const downloadExcel = async () => {
        try {
            const response = await fetch('http://localhost:3000/historial/excel');
            const blob = await response.blob();
            saveAs(blob, 'historial_asignaciones.xlsx');
        } catch (error) {
            console.error('Error downloading Excel file:', error);
        }
    };

    const downloadArchivoExcel = async () => {
        try {
            const response = await fetch('http://localhost:3000/historial/archivoexcel');
            const blob = await response.blob();
            saveAs(blob, 'archivo_historial_asignaciones.xlsx');
        } catch (error) {
            console.error('Error downloading Excel file:', error);
        }
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
    };

    if (loading) return <p>Loading historial...</p>;
    if (error) return <p>Error loading historial: {error}</p>;

    return (
        <div>
            <h2>Historial de Asignaciones</h2>
            <button onClick={downloadExcel}>Descargar Excel</button>
            <button onClick={downloadArchivoExcel}>Descargar Archivo Excel</button>
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
                    {historial.map((entry) => (
                        <tr key={entry.HistorialID}>
                            <td>{entry.PersonaName}</td>
                            <td>{entry.BeaconMac}</td>
                            <td>{formatDate(entry.fechaAsignacion)}</td>
                            <td>{entry.fechaBaja ? formatDate(entry.fechaBaja) : 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default HistorialTable;
