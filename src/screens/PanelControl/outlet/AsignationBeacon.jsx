import React from 'react'
import AssignBeaconForm from '../../../components/AssignBeaconForm/AssignBeaconForm'
import AssignBeaconTable from '../../../components/AssignBeaconTable/AssignBeaconTable'
import AssignBeaconProvider from '../../../Context/AssignBeaconProvider'

const AsignationBeacon = () => {
  return (
    <>
      <AssignBeaconProvider>
        <AssignBeaconForm/>
        <AssignBeaconTable/> 
      </AssignBeaconProvider>
     
    </>
  )
}

export default AsignationBeacon