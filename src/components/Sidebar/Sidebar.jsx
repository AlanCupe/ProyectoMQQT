import React from 'react';
import './Sidebar.css';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ isOpen, toggle }) => {
    return (
        <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
            <button className="toggle-button" onClick={toggle}>
                {isOpen ? <img className='img-icon' src='/img/arrow-left.png'/> : <img className='img-icon' src='/img/arrow-right.png'/>}
            </button>
           
            <NavLink to={'/dashboard'} className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
                <span className="icon"><img src='/img/dashboardIcon.png'/></span>
                <span className="title">Dashboard</span>
            </NavLink>
           
            <NavLink to={'/panelcontrol/'} className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
                <span className="icon"><img src='/img/controlPanel.png'/></span>
                <span className="title">Control Panel</span>
            </NavLink>
            <NavLink to={'/historial'} className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
                <span className="icon"><img src='/img/historialIcon.png'/></span>
                <span className="title">Historial</span>
            </NavLink>
         
        </div>
    );
};

export default Sidebar;