import React, { memo, useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import "./PanelControl.css";

export const PanelControl = memo(() => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="container-panelControl">
      <nav className="nav-control">
        <ul>
          <li>
            <NavLink
              to={"/panelcontrol/registrousers"}
              className={({ isActive }) => (isActive ? "active" : "inactive")}
            >
              <img src="/img/usuarioCreate.png"/><span>Registrar Personal</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to={"/panelcontrol/registroibecons"}
              className={({ isActive }) => (isActive ? "active" : "inactive")}
            >
               <img src="/img/beacon.png"/><span> Registrar Beacon</span>
             
            </NavLink>
          </li>
          <li>
            <NavLink
              to={"/panelcontrol/beaconasignation"}
              className={({ isActive }) => (isActive ? "active gold-border" : "inactive gold-border")}
            >
              <img src="/img/asignaciones.png"/><span> Asignación de Beacon</span>
             
            </NavLink>
          </li>
          <li>
            <NavLink
              to={"/panelcontrol/arearegister"}
              className={({ isActive }) => (isActive ? "active" : "inactive")}
            >
               <img src="/img/gateway.png"/><span>  Registrar Area | Gateway</span>
             
            </NavLink>
          </li>
          <li>
            <NavLink
              to={"/panelcontrol/areaasignation"}
              className={({ isActive }) => (isActive ? "active gold-border" : "inactive gold-border")}
            >
               <img src="/img/area.png"/><span>Asignación de Area de Trabajo</span>
              
            </NavLink>
          </li>
        </ul>
      </nav>
      <Outlet />
    </div>
  );
});
