import { Router } from './RouterFrontend/Router';

import "./App.css"
import { Mqttdata } from './components/Mqttdata/Mqttdata';
import { BeaconProvider } from './Context/BeaconProvider';
import { EventosBeaconsProvider } from './Context/EventosBeaconsProvider';
import { GatewayProvider } from './Context/GatewayProvider';
import { AreaAssigmentProvider } from './Context/AreaAssigmentProvider';


function App() {

    return (
       <>
       <AreaAssigmentProvider>
       <EventosBeaconsProvider>
       <BeaconProvider>
        <GatewayProvider>       
       <Mqttdata/>
        <Router/>
        </GatewayProvider>
       </BeaconProvider>
       </EventosBeaconsProvider>
       </AreaAssigmentProvider>

       </>
          
       
    );
}

export default App;
