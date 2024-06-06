// components/AreaRegister/AreaForm_CreateArea/AreaForm_CreateArea.jsx
import React, { useState, useContext, memo } from 'react';
import Swal from 'sweetalert2';
import { AreaRegisterContext } from '../../../Context/AreaRegisterProvider';

const AreaForm_CreateArea = memo(() => {
    const [nombre, setNombre] = useState('');
    const { createArea } = useContext(AreaRegisterContext);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await createArea(nombre);
            Swal.fire({
                title: '¡Éxito!',
                text: 'Área creada exitosamente!',
                icon: 'success',
                confirmButtonText: 'Ok'
            });
            setNombre(''); // Limpiar el campo después de enviar el formulario
        } catch (error) {
            console.error('Error al crear el área:', error);
            Swal.fire('Error', 'Error al crear el área', 'error');
        }
    };

    return (
        <div>
            <h2 className='tituloTabla'>REGISTRAR AREA</h2>
            <form className="form-employe" onSubmit={handleSubmit}>
             
             <input
                 type="text"
                 placeholder="Area de trabajo"
                 className="input-estandar"
                 value={nombre}
                 onChange={e => setNombre(e.target.value)}
                 required
             />
             <button type="submit" className="boton-estandar">Crear</button>
         </form>
        </div>
       
    );
})

export default AreaForm_CreateArea;
