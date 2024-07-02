import React from 'react';
import Select from 'react-select';
import './EventosBeaconsFilter.css';

const EventosBeaconsFilter = ({
  filtroUsuario, 
  filtroMacBeacon, 
  filtroFechaInicio, 
  filtroFechaFin, 
  filtroUbicacion, 
  filtroTipoEvento,

  setFiltroUsuario, 
  setFiltroMacBeacon, 
  setFiltroFechaInicio, 
  setFiltroFechaFin, 
  setFiltroUbicacion, 
  setFiltroTipoEvento, 
  usuarios, 
  macs, 
  ubicaciones, 
  tiposEvento
}) => {
  // Función para obtener opciones únicas
  const getUniqueOptions = (items) => {
    const uniqueItems = Array.from(new Set(items)); // Elimina duplicados
    return uniqueItems.map(item => ({ value: item, label: item }));
  };

  // Convertir arrays a opciones únicas para react-select
  const usuarioOptions = getUniqueOptions(usuarios);
  const macOptions = getUniqueOptions(macs);
  const ubicacionOptions = getUniqueOptions(ubicaciones);
  const tipoEventoOptions = getUniqueOptions(tiposEvento);




  const limpiarTodosLosCampos = (e) => {
   
   
    setFiltroFechaInicio('');
    setFiltroFechaFin('');
    setFiltroUbicacion('');
    setFiltroTipoEvento('');
    setFiltroUsuario('');
    setFiltroMacBeacon('');
  };
  return (
    <div className="form-EventosBeaconsFilter">
 <Select
  isClearable
  options={usuarioOptions}
  value={usuarioOptions.find(option => option.value === filtroUsuario) || null}
  onChange={option => setFiltroUsuario(option ? option.value : '')} // Cambiado para manejar null como ''
  className='selecth'
  placeholder="Filtrar por usuario"
/>

<Select
  isClearable
  options={macOptions}
  value={macOptions.find(option => option.value === filtroMacBeacon) || null}
  onChange={option => setFiltroMacBeacon(option ? option.value : '')} // Cambiado para manejar null como ''
  className='selecth'
  placeholder="Filtrar por MAC"
/>
      <div className='form-group'>
        <label htmlFor="fechaInicio">Fecha Inicio</label>
      <input
        id='fechaInicio'
        name='fechaInicio'
        type="datetime-local"
        value={filtroFechaInicio}
        onChange={e => setFiltroFechaInicio(e.target.value)}
        placeholder="Fecha de inicio"
      />
      </div>
      
      <div className='form-group'>
      <label htmlFor="fechaFin">Fecha Fin</label>
      <input
        id='fechaFin'
        name='fechaFin'
        type="datetime-local"
        value={filtroFechaFin}
        onChange={e => setFiltroFechaFin(e.target.value)}
        placeholder="Fecha de fin"
      />
      </div>
     
      <Select
  isClearable
  options={ubicacionOptions} // Opciones para el select de ubicaciones
  value={ubicacionOptions.find(option => option.value === filtroUbicacion)||null} // Asegura que el select muestre el valor actual del estado
  onChange={option => setFiltroUbicacion(option ? option.value : '')} // Actualiza el estado cuando cambia el select
  className='selecth'
  placeholder="Filtrar por ubicación"
/>
<Select
  isClearable
  options={tipoEventoOptions} // Opciones para el select de tipos de evento
  value={tipoEventoOptions.find(option => option.value === filtroTipoEvento)||null} // Asegura que el select muestre el valor actual del estado
  onChange={option => setFiltroTipoEvento(option ? option.value : '')} // Actualiza el estado cuando cambia el select
  className='selecth'
  placeholder="Filtrar por tipo de evento"
/>
      <button onClick={limpiarTodosLosCampos}>Limpiar</button>
    </div>
  );
}

export default EventosBeaconsFilter;