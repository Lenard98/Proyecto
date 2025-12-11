import React, { useState, useEffect, memo } from 'react';
import axios from 'axios';
import './Usuarios.css'; 

const API_URL = 'http://localhost:3002/api';

const ROLES = [
    { id: 1, name: 'Administrador' },
    { id: 2, name: 'Recepcionista' },
    { id: 3, name: 'Limpieza' }, 
    { id: 4, name: 'Gerente' }  
];

const UsuarioHistoryTable = memo(({ history, editingUsuario, handleEdit, handleDelete, handleSave, handleCancelEdit }) => {
    if (history.length === 0) {
        return <p>No hay usuarios registrados en el historial.</p>;
    }

    const isEditing = (codUsu) => editingUsuario && editingUsuario.Cod_Usu === codUsu;

    const renderCell = (usuario, field) => {
        const value = usuario[field] || '';
        const isCurrentlyEditing = isEditing(usuario.Cod_Usu);
        const isSelectField = field === 'Tipo_Usu' || field === 'Cod_Emp' || field === 'HabDes_Usu';
        
        if (isCurrentlyEditing && isSelectField) {
             
            if (field === 'Tipo_Usu') {
                return (
                    <select
                        name={field}
                        value={editingUsuario[field] || ''}
                        onChange={(e) => handleEdit(usuario, e.target.name, e.target.value)}
                        className="table-input"
                        required
                    >
                        <option value="">Seleccione Rol</option>
                        {ROLES.map(rol => (
                            <option key={rol.id} value={rol.id}>{rol.name}</option>
                        ))}
                    </select>
                );
            }
            
             if (field === 'HabDes_Usu') {
                return (
                    <select
                        name={field}
                        value={editingUsuario[field] === 1 ? 1 : 0}
                        onChange={(e) => handleEdit(usuario, e.target.name, e.target.value)}
                        className="table-input"
                    >
                        <option value={1}>✅ Habilitado</option>
                        <option value={0}>❌ Deshabilitado</option>
                    </select>
                );
            }
             
             if (field === 'Cod_Emp') {
                return <span>{usuario.Nom_Empleado}</span>; 
             }
        }
        
        if (isCurrentlyEditing && (field === 'Id_Usu' || field === 'Contra_Usu')) {
             const inputValue = field === 'Contra_Usu' ? '' : editingUsuario[field] || '';
             
             return (
                 <input
                     type={field === 'Contra_Usu' ? 'password' : 'text'}
                     name={field}
                     value={inputValue}
                     placeholder={field === 'Contra_Usu' ? 'Dejar vacío para no cambiar' : ''}
                     onChange={(e) => handleEdit(usuario, e.target.name, e.target.value)}
                     required={field === 'Id_Usu'} 
                     className="table-input"
                 />
             );
        }

        if (field === 'HabDes_Usu') {
            return <span>{value == 1 ? '✅ Habilitado' : '❌ Deshabilitado'}</span>;
        }
        if (field === 'Tipo_Usu') {
             return <span>{ROLES.find(r => r.id === value)?.name || 'N/A'}</span>;
        }

        return <span>{value}</span>;
    };

    return (
        <div className="history-table-container">
            <table>
                <thead>
                    <tr>
                        <th style={{ width: '10%' }}>Cód. Usu</th>
                        <th style={{ width: '20%' }}>Empleado</th>
                        <th style={{ width: '20%' }}>ID Usuario</th>
                        <th style={{ width: '20%' }}>Rol</th>
                        <th style={{ width: '10%' }}>Estado</th>
                        <th style={{ width: '20%' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {history.map((usuario) => (
                        <tr key={usuario.Cod_Usu} className={isEditing(usuario.Cod_Usu) ? 'editing-row' : ''}>
                            <td data-label="Cod. Usu">{usuario.Cod_Usu}</td>
                            <td data-label="Empleado">{renderCell(usuario, 'Cod_Emp')}</td>
                            <td data-label="ID Usuario">{renderCell(usuario, 'Id_Usu')}</td>
                            <td data-label="Rol">{renderCell(usuario, 'Tipo_Usu')}</td>
                            <td data-label="Estado">{renderCell(usuario, 'HabDes_Usu')}</td>
                            <td data-label="Acciones" className="action-cell">
                                {isEditing(usuario.Cod_Usu) ? (
                                    <>
                                        <button 
                                            className="btn-save" 
                                            onClick={() => handleSave(editingUsuario)} 
                                            disabled={!editingUsuario.Id_Usu || !editingUsuario.Tipo_Usu} 
                                            title="Guardar cambios"
                                        >
                                            Guardar
                                        </button>
                                        <button 
                                            className="btn-cancel-edit" 
                                            onClick={handleCancelEdit} 
                                            title="Cancelar edición"
                                        >
                                            Cancelar
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button 
                                            className="btn-edit" 
                                            onClick={() => handleEdit(usuario)} 
                                            disabled={!!editingUsuario} 
                                            title="Editar usuario"
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            className="btn-delete" 
                                            onClick={() => handleDelete(usuario.Cod_Usu)} 
                                            disabled={!!editingUsuario} 
                                            title="Eliminar usuario"
                                        >
                                            Borrar
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
});
UsuarioHistoryTable.displayName = 'UsuarioHistoryTable';

function UsuariosForm() {
    const defaultFormData = { 
        Cod_Emp: '', 
        Nom_Usu: '', 
        Id_Usu: '', 
        Contra_Usu: '', 
        Tipo_Usu: '', 
        HabDes_Usu: 1 
    };
    const [formData, setFormData] = useState(defaultFormData);
    const [message, setMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [usuarioHistory, setUsuarioHistory] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [editingUsuario, setEditingUsuario] = useState(null); 
    const [empleados, setEmpleados] = useState([]); 

    const displayMessage = (msg) => {
        setMessage(msg);
        setTimeout(() => {
            setMessage('');
        }, 5000); 
    };

    const fetchDependencies = async () => {
        setIsLoadingHistory(true);
        try {
            const resUsuarios = await axios.get(`${API_URL}/usuarios`);
            if (resUsuarios.data.success && Array.isArray(resUsuarios.data.data)) {
                setUsuarioHistory(resUsuarios.data.data);
            } else {
                setUsuarioHistory([]);
            }

            const resEmpleados = await axios.get(`${API_URL}/empleados/lista-basica`);
            if (resEmpleados.data.success && Array.isArray(resEmpleados.data.data)) {
                setEmpleados(resEmpleados.data.data);
            } else {
                 displayMessage('❌ Error: No se pudo cargar la lista de empleados.');
                 setEmpleados([]);
            }
        } catch (error) {
            console.error('Error al cargar dependencias:', error);
            displayMessage('❌ Error al cargar datos. Revisa el backend.');
            setUsuarioHistory([]);
            setEmpleados([]);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    useEffect(() => {
        fetchDependencies();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let updatedData = { ...formData, [name]: value };

        if (name === 'Cod_Emp') {
            const selectedEmployee = empleados.find(emp => emp.Cod_Emp === value);
            updatedData = { 
                ...updatedData, 
                Nom_Usu: selectedEmployee ? selectedEmployee.Nom_Completo : '' 
            };
        }
        setFormData(updatedData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.Cod_Emp || !formData.Id_Usu || !formData.Contra_Usu || !formData.Tipo_Usu) {
             displayMessage('❌ Debe completar todos los campos obligatorios para el registro.');
             return;
        }

        setIsSaving(true);
        displayMessage('Registrando usuario...');
        
        const dataToSend = {
             Cod_Emp: formData.Cod_Emp,
             Nom_Usu: formData.Nom_Usu, 
             Id_Usu: formData.Id_Usu,
             Contra_Usu: formData.Contra_Usu,
             Tipo_Usu: parseInt(formData.Tipo_Usu),
             HabDes_Usu: parseInt(formData.HabDes_Usu)
        };
        const apiUrl = `${API_URL}/usuarios`; 

        try {
            const response = await fetch(apiUrl, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend), 
            });

            const responseData = await response.json();

            if (response.ok && responseData.success) {
                displayMessage('✅ ¡Usuario registrado exitosamente!');
                setFormData(defaultFormData);
                fetchDependencies(); 
            } else {
                displayMessage(`❌ Error al registrar usuario: ${responseData.message || response.statusText}`);
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            displayMessage('❌ Error: No se pudo conectar con el servidor backend.');
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleEdit = (usuario, field, value) => {
         if (field) {
            const newValue = ['Tipo_Usu', 'HabDes_Usu'].includes(field) ? parseInt(value) : value;
            setEditingUsuario(prev => ({ ...prev, [field]: newValue }));
        } else {
            const employeeName = empleados.find(e => e.Cod_Emp === usuario.Cod_Emp)?.Nom_Completo || usuario.Nom_Usu;
            setEditingUsuario({ ...usuario, Nom_Empleado: employeeName, Contra_Usu: '' }); 
            displayMessage('Modo edición activado. Guarde o cancele antes de continuar.');
        }
    };
    
    const handleSave = async (usuarioToSave) => {
        if (!usuarioToSave.Id_Usu || !usuarioToSave.Tipo_Usu) {
             displayMessage('❌ El ID de Usuario y el Rol son requeridos para guardar.');
             return;
        }

        setIsSaving(true);
        displayMessage('Actualizando usuario...');
        
        const dataToSend = {
            Cod_Emp: usuarioToSave.Cod_Emp,
            Nom_Usu: usuarioToSave.Nom_Empleado, 
            Id_Usu: usuarioToSave.Id_Usu,
            Contra_Usu: usuarioToSave.Contra_Usu, 
            Tipo_Usu: parseInt(usuarioToSave.Tipo_Usu),
            HabDes_Usu: parseInt(usuarioToSave.HabDes_Usu),
        };
        
        try {
            const response = await axios.put(`${API_URL}/usuarios/${usuarioToSave.Cod_Usu}`, dataToSend);

            if (response.data.success) {
                displayMessage('✅ Usuario actualizado exitosamente.');
                setEditingUsuario(null); 
                fetchDependencies(); 
            } else {
                throw new Error(response.data.message || 'Error desconocido al actualizar.');
            }
        } catch (error) {
            displayMessage(`❌ Error al actualizar usuario: ${error.message || error.response?.data?.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingUsuario(null);
        displayMessage('Edición cancelada.');
    };

    const handleDelete = async (codUsu) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario? Si tiene reservas o facturas asociadas, la base de datos lo impedirá.')) {
            return;
        }

        setIsSaving(true);
        displayMessage('Eliminando usuario...');
        
        try {
            const response = await axios.delete(`${API_URL}/usuarios/${codUsu}`);

            if (response.data.success) {
                displayMessage('✅ Usuario eliminado exitosamente.');
                fetchDependencies();
            } else {
                throw new Error(response.data.message || 'Error desconocido al eliminar.');
            }
        } catch (error) {
            displayMessage(`❌ Error al eliminar usuario: ${error.message || error.response?.data?.message}`);
        } finally {
            setIsSaving(false);
        }
    };


    return (
        <div className="usuarios-page-wrapper">
            
            <div className="usuarios-form-container">
                <header className="form-header">
                    <h2>Gestión de Usuarios</h2>
                    <p className="admin-note">Solo visible para Administradores.</p>
                </header>
                
                {message && (
                    <p className={message.startsWith('✅') ? 'message-success' : 'message-error'}>
                        {message}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="usuarios-form">
                    
                    <fieldset className="form-section" disabled={!!editingUsuario || isSaving}>
                        <legend>Registro de Nuevo Usuario</legend>
                        <div className="form-grid">
                            
                            <div className="form-group">
                                <label htmlFor="Cod_Emp">Empleado Asociado</label>
                                <select 
                                    id="Cod_Emp" 
                                    name="Cod_Emp" 
                                    value={formData.Cod_Emp} 
                                    onChange={handleChange} 
                                    required 
                                >
                                    <option value="">-- Seleccionar Empleado --</option>
                                    {empleados.map(emp => (
                                        <option key={emp.Cod_Emp} value={emp.Cod_Emp}>
                                            {`${emp.Nom_Completo} (${emp.Cod_Emp})`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="Tipo_Usu">Rol del Usuario</label>
                                <select 
                                    id="Tipo_Usu" 
                                    name="Tipo_Usu" 
                                    value={formData.Tipo_Usu} 
                                    onChange={handleChange} 
                                    required 
                                >
                                    <option value="">-- Seleccionar Rol --</option>
                                    {ROLES.map(rol => (
                                        <option key={rol.id} value={rol.id}>{rol.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="Id_Usu">ID de Usuario (Login)</label>
                                <input 
                                    type="text" 
                                    id="Id_Usu" 
                                    name="Id_Usu" 
                                    value={formData.Id_Usu} 
                                    onChange={handleChange} 
                                    required 
                                    placeholder="ej: admin123 o recepcion"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="Contra_Usu">Contraseña</label>
                                <input 
                                    type="password" 
                                    id="Contra_Usu" 
                                    name="Contra_Usu" 
                                    value={formData.Contra_Usu} 
                                    onChange={handleChange} 
                                    required 
                                    minLength="6"
                                    placeholder="mínimo 6 caracteres"
                                />
                            </div>
                            
                             <div className="form-group">
                                <label htmlFor="HabDes_Usu">Estado</label>
                                <select 
                                    id="HabDes_Usu" 
                                    name="HabDes_Usu" 
                                    value={formData.HabDes_Usu} 
                                    onChange={handleChange} 
                                >
                                    <option value={1}>✅ Habilitado</option>
                                    <option value={0}>❌ Deshabilitado</option>
                                </select>
                            </div>

                        </div>
                    </fieldset>
                    
                    <div className="form-actions">
                        <button type="button" className="btn-secondary" disabled={!!editingUsuario || isSaving} onClick={() => setFormData(defaultFormData)}>Limpiar</button>
                        <button type="submit" className="btn-primary" disabled={!!editingUsuario || isSaving}>
                            {isSaving ? 'Guardando...' : 'Registrar Usuario'}
                        </button>
                    </div>
                </form>
            </div>
            
            <hr className="separator"/>

            <div className="usuarios-history-section">
                <header className="form-header">
                    <h2>Historial de Usuarios Registrados</h2>
                </header>
                
                {isLoadingHistory ? (
                    <p>Cargando historial...</p>
                ) : (
                    <UsuarioHistoryTable 
                        history={usuarioHistory} 
                        editingUsuario={editingUsuario}
                        handleEdit={handleEdit}
                        handleDelete={handleDelete}
                        handleSave={handleSave}
                        handleCancelEdit={handleCancelEdit}
                    />
                )}
            </div>
        </div>
    );
}

export default UsuariosForm;