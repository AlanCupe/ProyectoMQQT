import React, { useState } from "react";
import Select from "react-select";
import "./EventosBeaconsFilter.css";

const EventosBeaconsFilter = ({
  onApplyFilters,
  onResetFilters,
  personas,
  macAddresses,
  ubicaciones
}) => {
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [selectedMacAddress, setSelectedMacAddress] = useState(null);
  const [selectedUbicacion, setSelectedUbicacion] = useState(null);
  const [filters, setFilters] = useState({
    fechaInicio: "",
    fechaFin: "",
    macBeacon: "",
    persona: "",
    ubicacion: "",
  });

  const handlePersonaChange = (selectedOption) => {
    setSelectedPersona(selectedOption);
    setFilters((prev) => ({
      ...prev,
      persona: selectedOption ? selectedOption.value : "",
    }));
  };

  const handleUbicacionChange = (selectedOption) => {
    setSelectedUbicacion(selectedOption);
    setFilters((prev) => ({
      ...prev,
      ubicacion: selectedOption ? selectedOption.value : "",
    }));
  };

  const handleMacAddressChange = (selectedOption) => {
    setSelectedMacAddress(selectedOption);
    setFilters((prev) => ({
      ...prev,
      macBeacon: selectedOption ? selectedOption.value : "",
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const applyAndResetFilters = () => {
    onApplyFilters(filters);
    // Restablecer los estados de los componentes seleccionados
    setSelectedPersona(null);
    setSelectedMacAddress(null);
    // Restablecer los filtros
    setFilters({
      //fechaInicio: '',
      //fechaFin: '',
      macBeacon: "",
      persona: "",
      ubicacion: "",
    });
  };

  // Modificar el botón de aplicar filtros para usar la nueva función
  <button type="button" onClick={applyAndResetFilters}>
    SEGUIMIENTO
  </button>;
  return (
    <div>
      <form className="form-EventosBeaconsFilter">
        <div className="form-group">
          <label htmlFor="fechaInicio">Fecha Inicio</label>
          <input
            type="datetime-local"
            id="fechaInicio"
            name="fechaInicio"
            value={filters.fechaInicio}
            onChange={handleFilterChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="fechaFin">Fecha Fin</label>
          <input
            type="datetime-local"
            id="fechaFin"
            name="fechaFin"
            value={filters.fechaFin}
            onChange={handleFilterChange}
          />
        </div>
        <div className="form-group">
          <Select
            options={personas.map((persona) => ({
              value: persona,
              label: persona,
            }))}
            onChange={handlePersonaChange}
            value={selectedPersona}
            placeholder="Seleccione una persona"
            isClearable
          />
        </div>
        <div className="form-group">
          <Select
            options={macAddresses.map((mac) => ({ value: mac, label: mac }))}
            onChange={handleMacAddressChange}
            value={selectedMacAddress}
            placeholder="Seleccione una dirección MAC"
            isClearable
          />
        </div>
        <div className="form-group">
          <Select
            options={ubicaciones.map((ubicacion) => ({
              value: ubicacion,
              label: ubicacion,
            }))}
            onChange={handleUbicacionChange}
            value={selectedUbicacion}
            placeholder="Seleccione una ubicación"
            isClearable
          />
        </div>
        <div className="button-container">
          <button type="button" onClick={(e) => applyAndResetFilters()}>
            Aplicar Filtros
          </button>
          <button type="button" onClick={(e) => onResetFilters()}>
            Resetear Filtros
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventosBeaconsFilter;
