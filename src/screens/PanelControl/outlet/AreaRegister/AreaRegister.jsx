// components/AreaRegister/AreaRegister.jsx
import React from 'react';

/*IMPORTACIONES DE GATEWAY */
import AreaForm_CreateArea from '../../../../components/AreaRegister/AreaForm_CreateArea/AreaForm_CreateArea';
import { AreaForm_CreateGateway } from '../../../../components/AreaRegister/AreaForm_CreateGateway/AreaForm_CreateGateway';
import { GatewayProvider } from '../../../../Context/GatewayProvider';

/*IMPORTACIONES DE AREAS*/
import { AreaTable } from '../../../../components/AreaRegister/AreaTable/AreaTable';
import { GatewayTable } from '../../../../components/AreaRegister/GatewayTable/GatewayTable';
import { AreaRegisterProvider } from '../../../../Context/AreaRegisterProvider';
import "./AreaRegister.css"


export const AreaRegister = () => {
  return (
    <div className='flex1'>
      <GatewayProvider>
        <div className='flex2'>
          <AreaForm_CreateGateway />
          <GatewayTable />
        </div>
      </GatewayProvider>
      <AreaRegisterProvider>
        <div className='flex2'>
        
          <AreaForm_CreateArea />
          <AreaTable />
        </div>
      </AreaRegisterProvider>
    </div>
  );
};
