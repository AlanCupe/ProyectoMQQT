import React from 'react'
import HistorialTable from './HistorialTable'
import HistorialProvider from '../../Context/HistorialProvider'
import EventosBeacons from './EventosBeacons/EventosBeacons'

const Historial = () => {
  return (
    <div>
        <HistorialProvider>
          <HistorialTable/>
          <EventosBeacons/>
        </HistorialProvider>
    </div>
  )
}

export default Historial