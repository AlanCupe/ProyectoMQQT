# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh


import React, { useState, useEffect } from 'react';
import './App.css'; // Importa el archivo CSS para el estilo

function App() {
  const [personas, setPersonas] = useState([]);
  const [registros, setRegistros] = useState([]);

  useEffect(() => {
    // Hacer una solicitud HTTP para obtener la lista de personas
    fetch('http://localhost:3000/personas')
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al obtener la lista de personas');
        }
        return response.json();
      })
      .then(data => {
        // Actualizar el estado con la lista de personas recibidas
        setPersonas(data);
      })
      .catch(error => {
        console.error(error);
      });

    // Hacer una solicitud HTTP para obtener la lista de registros de presencia
    fetch('http://localhost:3000/registros')
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al obtener la lista de registros');
        }
        return response.json();
      })
      .then(data => {
        // Actualizar el estado con la lista de registros recibidos
        setRegistros(data);
      })
      .catch(error => {
        console.error(error);
      });
  }, []); // Se ejecuta solo una vez al montar el componente

  return (
    <>
      <h1 className='PanelTitulo'>Panel de Control</h1>
      <div className="container">
        <div className="section">
          <h1>Lista de Personas</h1>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>DNI</th>
                <th>Cargo</th>
              </tr>
            </thead>
            <tbody>
              {personas.map(persona => (
                <tr key={persona.PersonaID}>
                  <td>{persona.PersonaID}</td>
                  <td>{persona.Nombre}</td>
                  <td>{persona.Apellido}</td>
                  <td>{persona.Dni}</td>
                  <td>{persona.Cargo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="section">
          <h1>Registro de Presencia</h1>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Persona ID</th>
                <th>Área ID</th>
                <th>Hora de Entrada</th>
              </tr>
            </thead>
            <tbody>
              {registros.map(registro => (
                <tr key={registro.RegistroID}>
                  <td>{registro.RegistroID}</td>
                  <td>{registro.PersonaID}</td>
                  <td>{registro.AreaID}</td>
                  <td>{registro.HoraEntrada}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default App;



---------------

# UserTable.jsx
# personController.js