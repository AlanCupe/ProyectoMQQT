import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PanelControl } from '../screens/PanelControl/PanelControl'

import { RegistroUsers } from '../screens/PanelControl/outlet/RegistroUsers';
import { Dashboard } from '../screens/Dashboard/Dashboard';
import Sidebar from '../components/Sidebar/Sidebar';
import Footer from '../components/Footer/Footer';
import './Router.css';
import AsignationBeacon from '../screens/PanelControl/outlet/AsignationBeacon';
import { UserProvider } from '../Context/UserProvider';
import Error from '../screens/Error';
import { RegistroBecons } from '../screens/PanelControl/outlet/RegistroBecons';
import { AreaAssignment_Gateway } from '../screens/PanelControl/outlet/AreaAssignment_Gateway/AreaAssignment_Gateway';
import { AreaRegister } from '../screens/PanelControl/outlet/AreaRegister/AreaRegister';
import Historial from '../screens/Historial/Historial';



export const Router = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    return (
        <BrowserRouter>
            <UserProvider>
            <Sidebar isOpen={isSidebarOpen} toggle={() => setSidebarOpen(!isSidebarOpen)}/>
            <div className='main' style={{ marginLeft: isSidebarOpen ? '180px' : '80px' }}>
                <Routes>
                    <Route path="/" element={<Navigate to={'/dashboard'}/>}  />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/historial" element={<Historial />} />
                    <Route path="/panelcontrol/*" element={<PanelControl />}>
                        <Route path=''  element={<Navigate to={'registrousers'}/>} />
                        <Route path="registrousers"  element={<RegistroUsers />} />
                        <Route path="registroibecons"  element={<RegistroBecons />} />
                        <Route path="beaconasignation"  element={<AsignationBeacon />} />
                        <Route path="arearegister"  element={<AreaRegister/>} />
                        <Route path="areaasignation"  element={<AreaAssignment_Gateway/>} />
                    </Route>
                  
                    <Route path='*' element={<Error/>}/>
                </Routes>
            </div>
            <Footer/>
           </UserProvider>
           
        </BrowserRouter>
    );
};
