import React, { useState, useContext, memo } from 'react';
import { UserContext } from '../../Context/UserProvider';
import Swal from 'sweetalert2';
import './EmployeForm.css'

const EmployeeForm =memo( () => {
    const [formData, setFormData] = useState({
        Nombre: '',
        Apellido: '',
        Dni: '',
        Cargo: '',
        Empresa: ''
    });
    const [error, setError] = useState('');
    const { addUser } = useContext(UserContext);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Validación para el DNI
        if (name === 'Dni' && value && !/^\d*$/.test(value)) {
            setError('El DNI solo debe contener números.');
            return;
        }
        // Validación para Nombre y Apellido, solo permitir letras y espacios
        if ((name === 'Nombre' || name === 'Apellido') && value && !/^[a-zA-Z\s]*$/.test(value)) {
            setError('El ' + name + ' solo debe contener letras y espacios.');
            return;
        } else {
            setError('');  // Limpia el error cuando el input es válido
        }

        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

     const handleSubmit = (e) => {
        e.preventDefault();

        // Verificar la longitud del DNI
        if (formData.Dni.length !== 8) {
            setError('El DNI debe tener exactamente 8 dígitos.');
            return;
        }

        fetch('http://localhost:3000/personas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 400) {
                    response.json().then(data => {
                        setError(data.message);
                        throw new Error(data.message);
                    });
                } else {
                    throw new Error('Network response was not ok.');
                }
            }
            return response.json();
        })
        .then(data => {
            addUser(data);
            Swal.fire({
                title: '¡Éxito!',
                text: 'Empleado creado correctamente',
                icon: 'success',
                confirmButtonText: 'Ok'
            });
            setFormData({
                Nombre: '',
                Apellido: '',
                Dni: '',
                Cargo: '',
                Empresa: ''
            });
            setError('');
        })
        .catch((error) => {
            console.error('Error:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo crear el empleado',
                icon: 'error',
                confirmButtonText: 'Cerrar'
            });
        });
        
    };
    return (
        <div className='form-container'>
            <div className='titleRegister'><h2>REGISTRAR PERSONAL</h2></div>
            <form onSubmit={handleSubmit}>
                <div className='form-employe'>
                    <input type="text" id="Nombre" name="Nombre" placeholder="Nombre" value={formData.Nombre} onChange={handleChange} />
                    <input type="text" id="Apellido" name="Apellido" placeholder="Apellido" value={formData.Apellido} onChange={handleChange} />
                    <input type="text" id="Dni" name="Dni" placeholder="DNI" value={formData.Dni} onChange={handleChange} />
                    <input type="text" id="Cargo" name="Cargo" placeholder="Puesto" value={formData.Cargo} onChange={handleChange} />
                    <input type="text" id="Empresa" name="Empresa" placeholder="Empresa" value={formData.Empresa} onChange={handleChange} />
                    {error && <p className="error">{error}</p>}
                    <div className="button-container">
                        <button type="submit">Create</button>
                    </div>
                </div>
            </form>
        </div>
    );
});

export default EmployeeForm;
