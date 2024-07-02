import React, { memo } from 'react'
import HistorialTable from './HistorialTable'
import HistorialProvider from '../../Context/HistorialProvider'
import EventosBeacons from './EventosBeacons/EventosBeacons'

const Historial = memo(() => {
  return (
    <div>
        <HistorialProvider>
          <HistorialTable/>
          <EventosBeacons/>
        </HistorialProvider>
    </div>
  )
})

export default Historial