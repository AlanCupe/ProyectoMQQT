// components/AreaRegister/AreaTable/AreaTable.jsx
import React, { useContext, useState,memo} from "react";
import { AreaRegisterContext } from "../../../Context/AreaRegisterProvider";

export const AreaTable = memo(() => {
  const { areas, updateArea, deleteArea } = useContext(AreaRegisterContext);
  const [editArea, setEditArea] = useState(null);
  const [newAreaName, setNewAreaName] = useState("");
  const [error, setError] =useState('')

  const handleEdit = (area) => {
    setEditArea(area);
    setNewAreaName(area.Nombre);
  };

  const handleDelete = async (id) => {
    await deleteArea(id);
  };

  const handleSave = async () => {
    await updateArea(editArea.AreaID, newAreaName);
    setEditArea(null);
  };
  const handleCancelClick =async () => {
    setEditArea(null);
    setError('');
};

  return (
    <table className="tabla">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {areas.map((area) => (
          <tr key={area.AreaID}>
            <td>
              {editArea && editArea.AreaID === area.AreaID ? (
                <input
                  value={newAreaName}
                  onChange={(e) => setNewAreaName(e.target.value)}
                />
              ) : (
                area.Nombre
              )}
            </td>
            <td>
              {editArea && editArea.AreaID === area.AreaID ? (
                <>
               
                <div className='containerButton'>
                                    <img onClick={handleSave} src='/img/save.png'/>
                                   <img onClick={handleCancelClick} src="/img/cancelled.png"/>


                                    </div>
              </>
                
              ) : (
                <>
                  <div className="containerButton">
                    <img onClick={() => handleEdit(area)} src="/img/edit.png" />

                    <img
                      onClick={() => handleDelete(area.AreaID)}
                      src="/img/delete.png"
                    />
                  </div>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
});
