import React, { useState, memo, useEffect } from 'react';
import axios from 'axios';
import './Huespedes.css'; 

const API_URL = 'http://localhost:3002/api';

const generateMockId = () => 'CLI-' + Math.random().toString(36).substring(2, 9).toUpperCase();

const FormInput = memo(({ label, name, value, type = 'text', required = false, disabled = false, fullRow = false, children, onChangeHandler }) => (
    <div className={`form-group ${fullRow ? 'full-row' : ''}`}>
        <label htmlFor={name}>{label}</label> 
        {type === 'textarea' ? (
            <textarea
                id={name}
                name={name}
                value={value}
                onChange={onChangeHandler} 
                required={required} 
                rows="3"
                disabled={disabled}
            />
        ) : type === 'select' ? (
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChangeHandler} 
                required={required} 
                disabled={disabled}
            >
                {children}
            </select>
        ) : (
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChangeHandler}
                required={required} 
                disabled={disabled}
                className={disabled ? 'read-only-input' : ''}
            />
        )}
    </div>
));
FormInput.displayName = 'FormInput';

const GuestHistoryTable = memo(({ history, editingGuest, handleEdit, handleDelete, handleSave, handleCancelEdit, handleGuestChange }) => {
    if (history.length === 0) {
        return <p>No hay huéspedes registrados en el historial.</p>;
    }

    const isEditing = (codCli) => editingGuest && editingGuest.Cod_Cli === codCli;

    const renderCell = (guest, field, type = 'text') => {
        return isEditing(guest.Cod_Cli) ? (
            <input
                type={type}
                name={field}
                value={editingGuest[field] || ''}
                onChange={(e) => handleGuestChange(e, guest.Cod_Cli)}
                disabled={field === 'Cod_Cli' || field === 'Tipo_Cli' || field === 'Empresa_Huesped'}
                className="table-input"
            />
        ) : (
            <span>{guest[field] || 'N/A'}</span>
        );
    };

    return (
        <div className="history-table-container">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tipo</th>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Tel1</th>
                        <th>Empresa</th>
                        <th>Nacionalidad</th>
                        <th>Procedencia</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {history.map((guest) => (
                        <tr key={guest.Cod_Cli} className={isEditing(guest.Cod_Cli) ? 'editing-row' : ''}>
                            <td data-label="ID">{guest.Cod_Cli}</td>
                            <td data-label="Tipo">{renderCell(guest, 'Tipo_Cli')}</td>
                            <td data-label="Nombre">{renderCell(guest, 'Nom_Cli')}</td>
                            <td data-label="Email">{renderCell(guest, 'Email_Huesped', 'email')}</td>
                            <td data-label="Tel1">{renderCell(guest, 'Tel1_Huesped', 'tel')}</td>
                            <td data-label="Empresa">{renderCell(guest, 'Empresa_Huesped')}</td>
                            <td data-label="Nacionalidad">{renderCell(guest, 'Nacionalidad')}</td>
                            <td data-label="Procedencia">{renderCell(guest, 'Procedencia')}</td>
                            <td data-label="Acciones" className="action-cell">
                                {isEditing(guest.Cod_Cli) ? (
                                    <>
                                        <button className="btn-save" onClick={() => handleSave(editingGuest)} disabled={!editingGuest.Nom_Cli || !editingGuest.Tel1_Huesped} title="Guardar cambios">
                                            Guardar
                                        </button>
                                        <button className="btn-cancel-edit" onClick={handleCancelEdit} title="Cancelar edición">
                                            Cancelar
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button className="btn-edit" onClick={() => handleEdit(guest)} disabled={!!editingGuest} title="Editar huésped">
                                            Editar
                                        </button>
                                        <button className="btn-delete" onClick={() => handleDelete(guest.Cod_Cli)} disabled={!!editingGuest} title="Eliminar huésped">
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
GuestHistoryTable.displayName = 'GuestHistoryTable';

export default function Huespedes() {
    
    const [empresasLista, setEmpresasLista] = useState([]);
    const [guestHistory, setGuestHistory] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    
    const [editingGuest, setEditingGuest] = useState(null); 

    const [guestData, setGuestData] = useState({ 
        Cod_Cli: generateMockId(), 
        Tipo_Cli: 'Particular', 
        Nom_Cli: '',
        Tel1_Huesped: '',
        Tel2_Huesped: '',
        Tel3_Huesped: '',
        Email_Huesped: '',
        Empresa_Huesped: '',
        Nacionalidad: '',
        Procedencia: '',
        Observaciones: '',
    });

    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    const fetchGuestHistory = async () => {
        setIsLoadingHistory(true);
        try {
            const res = await axios.get(`${API_URL}/huespedes-historial`);
            if (res.data.success && Array.isArray(res.data.data)) {
                setGuestHistory(res.data.data);
            } else {
                setGuestHistory([]);
            }
        } catch (error) {
            console.error('Error al cargar el historial de huéspedes:', error);
            setGuestHistory([]);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    useEffect(() => {
        const fetchEmpresas = async () => {
            try {
                const res = await axios.get(`${API_URL}/empresas-lista`);
                if (res.data.success) {
                    setEmpresasLista(res.data.data);
                }
            } catch (error) {
                console.error('Error al cargar la lista de empresas:', error);
            }
        };
        fetchEmpresas();
        fetchGuestHistory();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setGuestData(prevData => {
            let newData = { ...prevData, [name]: value };
            if (name === 'Tipo_Cli' && value === 'Particular') {
                newData.Empresa_Huesped = ''; 
            }
            return newData;
        });
    };
    
    const clearForm = () => {
        setGuestData({
            Cod_Cli: generateMockId(),
            Tipo_Cli: 'Particular',
            Nom_Cli: '',
            Tel1_Huesped: '',
            Tel2_Huesped: '',
            Tel3_Huesped: '',
            Email_Huesped: '',
            Empresa_Huesped: '',
            Nacionalidad: '',
            Procedencia: '',
            Observaciones: '',
        });
    };

    const handleCancel = () => {
        setMessage('Formulario cancelado. Se han limpiado los campos.');
        clearForm(); 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(''); 
        try {
            const response = await axios.post(`${API_URL}/huespedes`, guestData);

            if (response.data.success) {
                setMessage('✅ Huésped guardado exitosamente.'); 
                fetchGuestHistory(); 
                clearForm(); 
                setTimeout(() => { setMessage(''); }, 5000); 
            } else {
                throw new Error(response.data.message || 'Error desconocido.');
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data?.sqlError || error.message;
            setMessage(`❌ Error al intentar guardar los datos: ${errorMsg}.`);
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleEdit = (guest) => {
        setEditingGuest({ ...guest }); 
        setMessage('Modo edición activado. Guarde o cancele antes de continuar.');
    };

    const handleGuestChange = (e, codCli) => {
        const { name, value } = e.target;
        if (editingGuest && editingGuest.Cod_Cli === codCli) {
            setEditingGuest(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSave = async (guestToSave) => {
        if (!guestToSave.Nom_Cli || !guestToSave.Tel1_Huesped) {
            setMessage('❌ El Nombre y el Teléfono Principal son requeridos para guardar.');
            return;
        }

        setIsSaving(true);
        setMessage('Guardando cambios...');
        
        try {
            const response = await axios.put(`${API_URL}/huespedes/${guestToSave.Cod_Cli}`, guestToSave);

            if (response.data.success) {
                setMessage('✅ Huésped actualizado exitosamente.');
                setEditingGuest(null); 
                fetchGuestHistory(); 
            } else {
                throw new Error(response.data.message || 'Error desconocido al actualizar.');
            }
        } catch (error) {
            setMessage(`❌ Error al actualizar huésped: ${error.message || error.response?.data?.message}`);
        } finally {
            setIsSaving(false);
            setTimeout(() => { setMessage(''); }, 5000); 
        }
    };

    const handleCancelEdit = () => {
        setEditingGuest(null);
        setMessage('Edición cancelada.');
        setTimeout(() => { setMessage(''); }, 3000); 
    };

    const handleDelete = async (codCli) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este huésped? Si tiene reservas, la base de datos lo impedirá.')) {
            return;
        }

        setIsSaving(true);
        setMessage('Eliminando huésped...');
        
        try {
            const response = await axios.delete(`${API_URL}/huespedes/${codCli}`);

            if (response.data.success) {
                setMessage('✅ Huésped eliminado exitosamente.');
                fetchGuestHistory(); 
            } else {
                throw new Error(response.data.message || 'Error desconocido al eliminar.');
            }
        } catch (error) {
            setMessage(`❌ Error al eliminar huésped: ${error.message || error.response?.data?.message}`);
        } finally {
            setIsSaving(false);
            setTimeout(() => { setMessage(''); }, 5000); 
        }
    };

    return (
        <div className="huespedes-page-wrapper">
            <div className="employee-form-container">
                
                <header className="form-header">
                    <h2>Registro de Huéspedes</h2>
                </header>

                {message && (
                    <p className={message.startsWith('✅') ? 'message-success' : 'message-error'}>
                        {message}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="employee-form">
                    
                    <fieldset className="form-section" disabled={!!editingGuest}>
                        <legend>Datos Personales y de Contacto</legend>
                        <div className="form-grid">
                            <FormInput onChangeHandler={handleChange} label="Nombre Completo" name="Nom_Cli" value={guestData.Nom_Cli} required disabled={!!editingGuest} />
                            <FormInput onChangeHandler={handleChange} label="Correo Electrónico" name="Email_Huesped" value={guestData.Email_Huesped} type="email" required disabled={!!editingGuest} />
                            <FormInput onChangeHandler={handleChange} label="Teléfono Principal" name="Tel1_Huesped" value={guestData.Tel1_Huesped} type="tel" required disabled={!!editingGuest} />
                            <FormInput onChangeHandler={handleChange} label="Teléfono Secundario" name="Tel2_Huesped" value={guestData.Tel2_Huesped} type="tel" disabled={!!editingGuest} />
                            <FormInput onChangeHandler={handleChange} label="Teléfono Adicional" name="Tel3_Huesped" value={guestData.Tel3_Huesped} type="tel" disabled={!!editingGuest} />
                            <FormInput onChangeHandler={handleChange} label="Nacionalidad" name="Nacionalidad" value={guestData.Nacionalidad} disabled={!!editingGuest} />
                        </div>
                    </fieldset>

                    <fieldset className="form-section" disabled={!!editingGuest}>
                        <legend>Tipo de Cliente y Ubicación</legend>
                        <div className="form-grid">
                            <FormInput onChangeHandler={handleChange} label="Tipo de Cliente" name="Tipo_Cli" value={guestData.Tipo_Cli} type="select" required disabled={!!editingGuest}>
                                <option value="Particular">Particular</option>
                                <option value="Empresa">Empresa</option>
                            </FormInput>

                            {guestData.Tipo_Cli === 'Empresa' ? (
                                <FormInput 
                                    onChangeHandler={handleChange} 
                                    label="Nombre de la Empresa" 
                                    name="Empresa_Huesped" 
                                    value={guestData.Empresa_Huesped} 
                                    type="select" 
                                    required
                                    disabled={!!editingGuest}
                                >
                                    <option value="">-- Seleccionar Empresa --</option>
                                    {empresasLista.map(e => (
                                        <option key={e.Cod_Emp} value={e.Nom_Emp}>
                                            {e.Nom_Emp} ({e.Cod_Emp})
                                        </option>
                                    ))}
                                </FormInput>
                            ) : (
                                <div className="form-group"></div>
                            )}
                            
                            <FormInput onChangeHandler={handleChange} label="Procedencia (Lugar de Origen)" name="Procedencia" value={guestData.Procedencia} disabled={!!editingGuest} />
                        </div>
                    </fieldset>
                    
                    <fieldset className="form-section full-row" disabled={!!editingGuest}>
                        <legend>Observaciones</legend>
                        <div className="form-grid-single">
                            <FormInput onChangeHandler={handleChange} label="Observaciones (Observaciones)" name="Observaciones" value={guestData.Observaciones} type="textarea" fullRow disabled={!!editingGuest} />
                        </div>
                    </fieldset>

                    <div className="form-actions">
                        <button type="button" onClick={handleCancel} disabled={isSaving || !!editingGuest} className="btn-secondary">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isSaving || !!editingGuest} className="btn-primary">
                            {isSaving ? 'Guardando...' : 'Guardar Huésped'}
                        </button>
                    </div>

                </form>
            </div>
            
            <hr className="separator"/>

            <div className="guest-history-section">
                <header className="form-header">
                    <h2>Historial de Huéspedes Registrados</h2>
                </header>
                
                {isLoadingHistory ? (
                    <p>Cargando historial...</p>
                ) : (
                    <GuestHistoryTable 
                        history={guestHistory} 
                        editingGuest={editingGuest}
                        handleEdit={handleEdit}
                        handleDelete={handleDelete}
                        handleSave={handleSave}
                        handleCancelEdit={handleCancelEdit}
                        handleGuestChange={handleGuestChange}
                    />
                )}
            </div>
        </div>
    );
}