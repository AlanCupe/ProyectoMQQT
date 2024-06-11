import React, { useState, useEffect, useContext, memo } from 'react';
import Swal from 'sweetalert2';
import './AssignBeaconsForm.css';
import { AssignBeaconContext } from '../../Context/AssignBeaconProvider';
import Select from 'react-select';
import { API_URL } from '../../config';

const AssignBeaconForm = memo(() => {
    const { assignments, setAssignments } = useContext(AssignBeaconContext);
    const [people, setPeople] = useState([]);
    const [beacons, setBeacons] = useState([]);
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [selectedBeacon, setSelectedBeacon] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchPeopleAndBeacons = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`/assignbeacon/unassigned`);
            if (response.ok) {
                const data = await response.json();
                setPeople(data.people);
                setBeacons(data.beacons);
            } else {
                throw new Error('Failed to fetch');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to fetch data from server.');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPeopleAndBeacons();
    }, [assignments]);

    const handleSubmit = async (event) => {
        event.preventDefault();
    
        if (!selectedPerson || !selectedBeacon) {
            Swal.fire('Error', 'Persona o Beacon no seleccionado.', 'error');
            return;
        }

        // Verificar si el beacon ya está asignado
        const beaconAlreadyAssigned = assignments.some(assignment => assignment.iBeaconID === selectedBeacon.value);
        if (beaconAlreadyAssigned) {
            Swal.fire('Error', 'El beacon ya está asignado.', 'error');
            return;
        }

        // Verificar si el MacAddress del beacon ya está asignado
        const macAddressAlreadyAssigned = assignments.some(assignment => {
            const beacon = beacons.find(b => b.iBeaconID === selectedBeacon.value);
            return assignment.BeaconMac === beacon.MacAddress;
        });
        if (macAddressAlreadyAssigned) {
            Swal.fire('Error', 'El beacon con esta dirección MAC ya está asignado.', 'error');
            return;
        }
    
        const persona = people.find(p => p.PersonaID === selectedPerson.value);
        const beacon = beacons.find(b => b.iBeaconID === selectedBeacon.value);
    
        const postData = {
            PersonaID: persona.PersonaID,
            iBeaconID: beacon.iBeaconID,
            Timestamp: new Date().toISOString()
        };
    
        setLoading(true);
        try {
            console.log('Sending data to server:', postData);
            const response = await fetch(`/assignbeacon`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData)
            });
    
            if (response.ok) {
                const newAssignment = await response.json();
            
    
                // Verificar si la respuesta contiene el ID de la asignación
                if (!newAssignment.AsignacionID) {
                    throw new Error('AsignacionID no está presente en la respuesta');
                }
    
                setAssignments(prevAssignments => [...prevAssignments, {
                    ...newAssignment,
                    PersonaName: `${persona.Nombre} ${persona.Apellido}`,
                    BeaconMac: beacon.MacAddress,
                    Timestamp: postData.Timestamp
                }]);
                Swal.fire('Éxito', 'Beacon asignado correctamente', 'success');
                setSelectedPerson(null);
                setSelectedBeacon(null);
    
                // Refrescar listas de personas y beacons no asignados
                fetchPeopleAndBeacons();
            } else {
                const errorData = await response.text();
                console.error('Failed to post data:', errorData);
                throw new Error(errorData);
            }
        } catch (error) {
            console.error('Error posting data:', error);
            Swal.fire('Error', 'No se pudo asignar el beacon.', 'error');
        }
        setLoading(false);
    };

    // Filtrar beacons para eliminar duplicados por MacAddress y excluir los ya asignados
    const uniqueBeacons = beacons.filter((beacon, index, self) =>
        index === self.findIndex((b) => b.MacAddress === beacon.MacAddress) &&
        !assignments.some(assignment => assignment.BeaconMac === beacon.MacAddress)
    );

    const personOptions = people.map(person => ({
        value: person.PersonaID,
        label: `${person.Nombre} ${person.Apellido}`
    }));

    const beaconOptions = uniqueBeacons.map(beacon => ({
        value: beacon.iBeaconID,
        label: beacon.MacAddress
    }));

    return (
        <form onSubmit={handleSubmit} className='form-AsignacionBeacons'>
            <h2 className='tituloTabla'>ASIGNAR BEACON A PERSONAL</h2>
            {error && <p className="error">{error}</p>}
            {loading ? <p>Loading...</p> : (
                <>
                    <div className="form-group">
                        <Select
                            className='select'
                            id="personSelect"
                            options={personOptions}
                            value={selectedPerson}
                            onChange={setSelectedPerson}
                            placeholder="Seleccione una persona"
                            isClearable
                        />
                    </div>
                    <div className="form-group">
                        <Select
                            className='select'
                            id="beaconSelect"
                            options={beaconOptions}
                            value={selectedBeacon}
                            onChange={setSelectedBeacon}
                            placeholder="Seleccione un beacon"
                            isClearable
                        />
                    </div>
                    <button type="submit">Asignar Beacon</button>
                </>
            )}
        </form>
    );
});

export default AssignBeaconForm;
