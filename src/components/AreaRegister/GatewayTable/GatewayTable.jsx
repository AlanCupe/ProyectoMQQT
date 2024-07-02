import React, { memo, useContext, useState } from 'react';
import { GatewayContext } from '../../../Context/GatewayProvider';

export const GatewayTable = memo(() => {
  const { gateways, updateGateway, deleteGateway } = useContext(GatewayContext);
  const [editGateway, setEditGateway] = useState(null);
  const [newMacAddress, setNewMacAddress] = useState('');
  const [newTimestamp, setNewTimestamp] = useState('');
  const [error, setError] = useState('');

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  };

  const handleEdit = (gateway) => {
    setEditGateway(gateway);
    setNewMacAddress(gateway.MacAddress);
    setNewTimestamp(formatDate(gateway.Timestamp));
  };

  const handleDelete = async (id) => {
    await deleteGateway(id);
  };

  const handleSave = async () => {
    try {
        const formattedTimestamp = new Date(newTimestamp).toISOString(); // Asegura el formato adecuado
        //console.log("Nuevo Timestamp:", formattedTimestamp);
        //console.log("Datos a enviar al backend:", editGateway.GatewayID, newMacAddress, formattedTimestamp); // Nuevo console.log para verificar los datos antes de enviarlos al backend
        await updateGateway(editGateway.GatewayID, newMacAddress, formattedTimestamp);
        setEditGateway(null); // Restablecer el estado de edición después de guardar
    } catch (error) {
        console.error("Error al actualizar el gateway:", error);
        setError("Error al actualizar el gateway");
    }
  };
  

  const handleCancelClick = () => {
    setEditGateway(null);
    setNewMacAddress(editGateway.MacAddress);
    setNewTimestamp(formatDate(editGateway.Timestamp));
  };

  return (
    <table className='tabla'>
      <thead>
        <tr>
          <th>MAC Address</th>
          <th>Timestamp</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {gateways.map((gateway,index) => (
          <tr key={gateway.GatewayID || index}>
            <td>
              {editGateway && editGateway.GatewayID === gateway.GatewayID ? (
                <input value={newMacAddress} onChange={e => setNewMacAddress(e.target.value)} />
              ) : (
                gateway.MacAddress
              )}
            </td>
            <td>
              {editGateway && editGateway.GatewayID === gateway.GatewayID ? (
                <input
                  type="text"
                  value={newTimestamp}
                  onChange={e => setNewTimestamp(e.target.value)}
                />
              ) : (
                formatDate(gateway.Timestamp)
              )}
            </td>
            <td>
              {editGateway && editGateway.Timestamp === gateway.Timestamp ? (
                <div className='containerButton'>
                  <img onClick={handleSave} src='/img/save.png' alt="Save" />
                  <img onClick={handleCancelClick} src='/img/cancelled.png' alt="Cancel" />
                </div>
              ) : (
                <div className='containerButton'>
                  <img onClick={() => handleEdit(gateway)} src='/img/edit.png' alt="Edit" />
                  <img onClick={() => handleDelete(gateway.GatewayID)} src='/img/delete.png' alt="Delete" />
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
});
