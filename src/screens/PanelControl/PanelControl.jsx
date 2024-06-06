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
              <img src="/img/usuarioCreate.png"/><span>REGISTRAR PERSONAL</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to={"/panelcontrol/registroibecons"}
              className={({ isActive }) => (isActive ? "active" : "inactive")}
            >
               <img src="/img/beacon.png"/><span> REGISTRAR BEACON</span>
             
            </NavLink>
          </li>
          <li>
            <NavLink
              to={"/panelcontrol/beaconasignation"}
              className={({ isActive }) => (isActive ? "active gold-border" : "inactive gold-border")}
            >
              <img src="/img/asignaciones.png"/><span> ASIGNACION DE BEACON</span>
             
            </NavLink>
          </li>
          <li>
            <NavLink
              to={"/panelcontrol/arearegister"}
              className={({ isActive }) => (isActive ? "active" : "inactive")}
            >
               <img src="/img/gateway.png"/><span> REGISTRAR AREA || ✍️ GATEWAY</span>
             
            </NavLink>
          </li>
          <li>
            <NavLink
              to={"/panelcontrol/areaasignation"}
              className={({ isActive }) => (isActive ? "active gold-border" : "inactive gold-border")}
            >
               <img src="/img/area.png"/><span>ASIGNACION DE AREA DE TRABAJO</span>
              
            </NavLink>
          </li>
        </ul>
      </nav>
      <Outlet />
    </div>
  );
});
