import React from 'react';

import { BeaconsTable } from '../../../components/BeconsTable/BeaconsTable';
import {BeaconsForm} from '../../../components/BeconsForm/BeaconsForm';
import { BeaconProvider } from '../../../Context/BeaconProvider';

export const RegistroBecons = () => {
    return (
        <BeaconProvider>
            <BeaconsForm />
            <BeaconsTable />
        </BeaconProvider>
    );
};
