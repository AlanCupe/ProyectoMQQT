import React from 'react'
import HistorialTable from './HistorialTable'
import HistorialProvider from '../../Context/HistorialProvider'

const Historial = () => {
  return (
    <div>
        <HistorialProvider>
          <HistorialTable/>
        </HistorialProvider>
    </div>
  )
}

export default Historial