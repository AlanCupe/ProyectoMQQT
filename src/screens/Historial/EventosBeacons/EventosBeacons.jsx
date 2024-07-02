import axios from "axios";
import React, { memo, useEffect, useState, useMemo } from "react";
import EventosBeaconsFilter from "../EventosBeaconsFilter/EventosBeaconsFilter";
import * as XLSX from 'xlsx';
import './EventosBeacons.css';

const EventosBeacons = memo(() => {
  const [eventos, setEventos] = useState([]);
  const [filtroUsuario, setFiltroUsuario] = useState("");
  const [filtroMacBeacon, setFiltroMacBeacon] = useState("");
  const [filtroFechaInicio, setFiltroFechaInicio] = useState("");
  const [filtroFechaFin, setFiltroFechaFin] = useState("");
  const [filtroUbicacion, setFiltroUbicacion] = useState("");
  const [filtroTipoEvento, setFiltroTipoEvento] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [eventosPorPagina, setEventosPorPagina] = useState(20);

  const usuarios = eventos.map((evento) => evento.usuario);
  const macs = eventos.map((evento) => evento.macBeacon);
  const ubicaciones = eventos.map((evento) => evento.ubicacion);
  const tiposEvento = eventos.map((evento) => evento.tipoEvento);

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const response = await axios.get("/eventosbeacons/eventos-beacons");
        setEventos(response.data);
      } catch (error) {
        console.error("Error al obtener eventos:", error);
      }
    };

    fetchEventos();
  }, []);

  // Agrega este useEffect después de tus estados y el useEffect existente para la carga de datos
  useEffect(() => {
    // Reinicia la página actual a 1 cada vez que los filtros cambian
    setPaginaActual(1);
  }, [
    filtroUsuario,
    filtroMacBeacon,
    filtroFechaInicio,
    filtroFechaFin,
    filtroUbicacion,
    filtroTipoEvento,
  ]);

  const eventosFiltrados = eventos.filter((evento) => {
    const fechaEvento = new Date(evento.fechaHora);
    const fechaInicio = filtroFechaInicio ? new Date(filtroFechaInicio) : null;
    const fechaFin = filtroFechaFin ? new Date(filtroFechaFin) : null;

    return (
      evento.usuario?.toLowerCase().includes(filtroUsuario.toLowerCase()) &&
      evento.macBeacon?.toLowerCase().includes(filtroMacBeacon.toLowerCase()) &&
      (!fechaInicio || fechaEvento >= fechaInicio) &&
      (!fechaFin || fechaEvento <= fechaFin) &&
      evento.ubicacion?.toLowerCase().includes(filtroUbicacion.toLowerCase()) &&
      evento.tipoEvento?.toLowerCase().includes(filtroTipoEvento.toLowerCase())
    );
  });
  const totalPaginas = Math.ceil(eventosFiltrados.length / eventosPorPagina);
  const indexDelUltimoEvento = paginaActual * eventosPorPagina;
  const indexDelPrimerEvento = indexDelUltimoEvento - eventosPorPagina;
  const eventosActuales = eventosFiltrados.slice(
    indexDelPrimerEvento,
    indexDelUltimoEvento
  );

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
  };
  const exportarAExcel = (data, fileName) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Eventos");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  return (
    <div className="historial">
      <EventosBeaconsFilter
        filtroUsuario={filtroUsuario}
        filtroFechaFin={filtroFechaFin}
        filtroFechaInicio={filtroFechaInicio}
        filtroMacBeacon={filtroMacBeacon}
        filtroUbicacion={filtroUbicacion}
        filtroTipoEvento={filtroTipoEvento}
        setFiltroUsuario={setFiltroUsuario}
        setFiltroMacBeacon={setFiltroMacBeacon}
        setFiltroFechaInicio={setFiltroFechaInicio}
        setFiltroFechaFin={setFiltroFechaFin}
        setFiltroUbicacion={setFiltroUbicacion}
        setFiltroTipoEvento={setFiltroTipoEvento}
        usuarios={usuarios}
        macs={macs}
        ubicaciones={ubicaciones}
        tiposEvento={tiposEvento}
      />
      <button className="btnHistorialEventos"
        onClick={() => exportarAExcel(eventosFiltrados, "eventos_filtrados")}
      >
        Descargar Filtrado 
      </button>
      <p className="contadorRows">Total: {eventosFiltrados.length}</p>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Usuario</th>
            <th>MacAddress Beacon</th>
            <th>Fecha y Hora</th>
            <th>Ubicación</th>
            <th>Tipo de Evento</th>
          </tr>
        </thead>
        <tbody>
          {eventosActuales.map((evento, index) => (
            <tr key={`${index}Evento1`}>
              <td>{index + 1 + (paginaActual - 1) * eventosPorPagina}</td>
              <td>{evento.usuario}</td>
              <td>{evento.macBeacon}</td>
              <td>{new Date(evento.fechaHora).toLocaleString()}</td>
              <td>{evento.ubicacion}</td>
              <td>{evento.tipoEvento}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button
          onClick={() => cambiarPagina(paginaActual - 1)}
          disabled={paginaActual === 1}
        >
          Anterior
        </button>
        <span>
          Página {paginaActual} de {totalPaginas}
        </span>
        <button
          onClick={() => cambiarPagina(paginaActual + 1)}
          disabled={paginaActual === totalPaginas || totalPaginas === 0}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
});

export default EventosBeacons;
