import React, { useState, useEffect, memo } from 'react';
import axios from 'axios';
import './Empresa.css'; 

const API_URL = 'http://localhost:3002/api';

// --- NUEVO COMPONENTE: Lista de Clientes de la Empresa (Sin cambios) ---
const ClientesList = ({ codEmp, empresaName, handleClose }) => {
    const [clientes, setClientes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchClientes = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Llama al nuevo endpoint: /api/empresa/clientes/:codEmp
                const res = await axios.get(`${API_URL}/empresa/clientes/${codEmp}`);
                if (res.data.success) {
                    setClientes(res.data.data);
                } else {
                    setError('No se pudo cargar la lista de clientes.');
                }
            } catch (err) {
                console.error('Error al obtener clientes por empresa:', err);
                setError('Error de conexión con el servidor o empresa sin clientes asociados.');
            } finally {
                setIsLoading(false);
            }
        };

        if (codEmp) {
            fetchClientes();
        }
    }, [codEmp]);

    if (!codEmp) return null;

    return (
        <div className="clientes-modal-overlay">
            <div className="clientes-modal-content">
                <div className="modal-header-container">
                    <h3>Huéspedes de: {empresaName} ({codEmp})</h3>
                    <button className="btn-close-modal" onClick={handleClose}>
                        &times;
                    </button>
                </div>
                
                {isLoading ? (
                    <p>Cargando clientes...</p>
                ) : error ? (
                    <p className="message-error">{error}</p>
                ) : clientes.length === 0 ? (
                    <p className="message-info">Esta empresa no tiene huéspedes asociados actualmente.</p>
                ) : (
                    <div className="clientes-list-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Código Cliente</th>
                                    <th>Nombre Huésped</th>
                                    <th>Teléfono Principal</th>
                                    <th>Correo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clientes.map(cli => (
                                    <tr key={cli.Cod_Cli}>
                                        <td>{cli.Cod_Cli}</td>
                                        <td>{cli.Nom_Cli}</td>
                                        <td>{cli.Tel1_Huesped}</td>
                                        <td>{cli.Email_Huesped || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="modal-footer-container">
                    <button type="button" className="btn-secondary" onClick={handleClose}>Cerrar</button>
                </div>
            </div>
        </div>
    );
};
ClientesList.displayName = 'ClientesList';
// ------------------------------------------------------------------

// --- COMPONENTE: Tabla de Historial de Empresas (MODIFICADO) ---
const EmpresaHistoryTable = memo(({ history, editingEmpresa, handleEdit, handleDelete, handleSave, handleCancelEdit, handleEmpresaChange, handleShowClients, isClientsModalOpen }) => {
    if (history.length === 0) {
        return <p>No hay empresas registradas en el historial.</p>;
    }

    const isEditing = (codEmp) => editingEmpresa && editingEmpresa.Cod_Emp === codEmp;

    // Función auxiliar para renderizar el campo como input o texto
    const renderCell = (empresa, field) => {
        const value = empresa[field] || '';
        
        // Determina si el campo debe estar deshabilitado o no
        const isDisabled = false; // Eliminamos la restricción para Cod_Emp y Nom_Emp ya que ambos son editables

        return isEditing(empresa.Cod_Emp) ? (
            <input
                type="text"
                name={field}
                value={editingEmpresa[field] || ''}
                onChange={(e) => handleEmpresaChange(e, empresa.Cod_Emp)}
                disabled={isDisabled} 
                required={field === 'Cod_Emp' || field === 'Nom_Emp'} // Ambos son requeridos
                className="table-input"
            />
        ) : (
            <span>{value}</span>
        );
    };

    return (
        <div className="history-table-container">
            <table>
                <thead>
                    <tr>
                        <th style={{width: '20%'}}>RTN (Cod_Emp)</th>
                        <th style={{width: '45%'}}>Nombre de la Empresa</th>
                        <th style={{width: '35%'}}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {history.map((empresa) => (
                        <tr key={empresa.Cod_Emp} className={isEditing(empresa.Cod_Emp) ? 'editing-row' : ''}>
                            {/* RTN es ahora editable */}
                            <td data-label="RTN">{renderCell(empresa, 'Cod_Emp')}</td> 
                            <td data-label="Nombre">{renderCell(empresa, 'Nom_Emp')}</td>
                            <td data-label="Acciones" className="action-cell">
                                {isEditing(empresa.Cod_Emp) ? (
                                    <>
                                        <button 
                                            className="btn-save" 
                                            // Se asegura que ambos campos no estén vacíos antes de guardar
                                            onClick={() => handleSave(editingEmpresa)} 
                                            disabled={!editingEmpresa.Nom_Emp || !editingEmpresa.Cod_Emp || isClientsModalOpen} 
                                            title="Guardar cambios"
                                        >
                                            Guardar
                                        </button>
                                        <button 
                                            className="btn-cancel-edit" 
                                            onClick={handleCancelEdit} 
                                            disabled={isClientsModalOpen}
                                            title="Cancelar edición"
                                        >
                                            Cancelar
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button 
                                            className="btn-view-clients" 
                                            onClick={() => handleShowClients(empresa.Cod_Emp, empresa.Nom_Emp)} 
                                            disabled={!!editingEmpresa || isClientsModalOpen} 
                                            title="Ver clientes asociados"
                                        >
                                            Clientes
                                        </button>
                                        <button 
                                            className="btn-edit" 
                                            onClick={() => handleEdit(empresa)} 
                                            disabled={!!editingEmpresa || isClientsModalOpen} 
                                            title="Editar empresa"
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            className="btn-delete" 
                                            onClick={() => handleDelete(empresa.Cod_Emp)} 
                                            disabled={!!editingEmpresa || isClientsModalOpen} 
                                            title="Eliminar empresa"
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
EmpresaHistoryTable.displayName = 'EmpresaHistoryTable';

// --- COMPONENTE PRINCIPAL (Ajustado en handleSave) ---
function EmpresaForm() {
    const [formData, setFormData] = useState({ Cod_Emp: '', Nom_Emp: '' });
    const [message, setMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [empresaHistory, setEmpresaHistory] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [editingEmpresa, setEditingEmpresa] = useState(null); 

    const [selectedEmpresaCod, setSelectedEmpresaCod] = useState(null);
    const [selectedEmpresaName, setSelectedEmpresaName] = useState('');
    const isClientsModalOpen = !!selectedEmpresaCod;


    const displayMessage = (msg) => {
        setMessage(msg);
        setTimeout(() => {
            setMessage('');
        }, 5000); 
    };

    const fetchEmpresaHistory = async () => {
        setIsLoadingHistory(true);
        try {
            const res = await axios.get(`${API_URL}/empresas-lista`);
            if (res.data.success && Array.isArray(res.data.data)) {
                setEmpresaHistory(res.data.data);
            } else {
                setEmpresaHistory([]);
            }
        } catch (error) {
            console.error('Error al cargar el historial de empresas:', error);
            displayMessage('❌ Error al cargar el historial de empresas. Revisa el backend.');
            setEmpresaHistory([]);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    useEffect(() => {
        fetchEmpresaHistory();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isClientsModalOpen) return;
        setIsSaving(true);
        displayMessage('Guardando empresa...');
        
        const dataToSend = { Cod_Emp: formData.Cod_Emp, Nom_Emp: formData.Nom_Emp };
        const apiUrl = 'http://localhost:3002/api/empresa'; 

        try {
            const response = await fetch(apiUrl, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend), 
            });

            const responseData = await response.json();

            if (response.ok && responseData.success) {
                displayMessage('✅ ¡Empresa guardada exitosamente!');
                setFormData({ Cod_Emp: '', Nom_Emp: '' });
                fetchEmpresaHistory();
            } else {
                displayMessage(`❌ Error al guardar empresa: ${responseData.message || response.statusText}`);
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            displayMessage('❌ Error: No se pudo conectar con el servidor backend.');
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleEdit = (empresa) => {
        if (isClientsModalOpen) return;
        setEditingEmpresa({ ...empresa }); 
        displayMessage('Modo edición activado. Guarde o cancele antes de continuar.');
    };

    const handleEmpresaChange = (e, codEmp) => {
        const { name, value } = e.target;
        if (editingEmpresa && editingEmpresa.Cod_Emp === codEmp) {
            setEditingEmpresa(prev => ({ ...prev, [name]: value }));
        }
    };

    // FUNCIÓN DE GUARDADO AJUSTADA para validar el RTN/Cod_Emp
    const handleSave = async (empresaToSave) => {
        // Validación: Ambos campos deben existir
        if (!empresaToSave.Nom_Emp || !empresaToSave.Cod_Emp || isClientsModalOpen) {
             displayMessage('❌ El RTN (Código) y el Nombre son requeridos para guardar.');
             return;
        }

        setIsSaving(true);
        displayMessage('Actualizando empresa...');
        
        try {
            // Se envía el Cod_Emp antiguo en la URL y los datos actualizados en el cuerpo.
            // NOTA: Si se cambió el Cod_Emp, el backend debe manejar la actualización de la clave primaria.
            const response = await axios.put(`${API_URL}/empresa/${editingEmpresa.Cod_Emp}`, empresaToSave);

            if (response.data.success) {
                displayMessage('✅ Empresa actualizada exitosamente.');
                setEditingEmpresa(null); 
                fetchEmpresaHistory(); 
            } else {
                throw new Error(response.data.message || 'Error desconocido al actualizar.');
            }
        } catch (error) {
            displayMessage(`❌ Error al actualizar empresa: ${error.message || error.response?.data?.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingEmpresa(null);
        displayMessage('Edición cancelada.');
    };

    const handleDelete = async (codEmp) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta empresa? Si está referenciada por un huésped, la base de datos lo impedirá.')) {
            return;
        }
        if (isClientsModalOpen) return;

        setIsSaving(true);
        displayMessage('Eliminando empresa...');
        
        try {
            const response = await axios.delete(`${API_URL}/empresa/${codEmp}`);

            if (response.data.success) {
                displayMessage('✅ Empresa eliminada exitosamente.');
                fetchEmpresaHistory();
            } else {
                throw new Error(response.data.message || 'Error desconocido al eliminar.');
            }
        } catch (error) {
            displayMessage(`❌ Error al eliminar empresa: ${error.message || error.response?.data?.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleShowClients = (codEmp, nameEmp) => {
        if (!!editingEmpresa || isClientsModalOpen) return;
        setSelectedEmpresaCod(codEmp);
        setSelectedEmpresaName(nameEmp);
    };

    const handleCloseClients = () => {
        setSelectedEmpresaCod(null);
        setSelectedEmpresaName('');
    };


    return (
        <div className="empresa-page-wrapper">
            
            {/* 1. SECCIÓN DE REGISTRO */}
            <div className="empresa-form-container">
                <header className="form-header">
                    <h2>Gestión de Empresas</h2>
                </header>
                
                {message && (
                    <p className={message.startsWith('✅') ? 'message-success' : 'message-error'}>
                        {message}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="empresa-form">
                    
                    <fieldset className="form-section" disabled={!!editingEmpresa || isSaving || isClientsModalOpen}>
                        <legend>Datos de la Empresa</legend>
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="Cod_Emp">RTN (Código Empresa)</label>
                                <input type="text" id="Cod_Emp" name="Cod_Emp" value={formData.Cod_Emp} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="Nom_Emp">Nombre de la Empresa</label>
                                <input type="text" id="Nom_Emp" name="Nom_Emp" value={formData.Nom_Emp} onChange={handleChange} required />
                            </div>
                        </div>
                    </fieldset>
                    
                    <div className="form-actions">
                        <button type="button" className="btn-secondary" disabled={!!editingEmpresa || isSaving || isClientsModalOpen}>Cancelar</button>
                        <button type="submit" className="btn-primary" disabled={!!editingEmpresa || isSaving || isClientsModalOpen}>
                            {isSaving ? 'Guardando...' : 'Guardar Empresa'}
                        </button>
                    </div>
                </form>
            </div>
            
            <hr className="separator"/>

            {/* 2. SECCIÓN: HISTORIAL DE EMPRESAS */}
            <div className="empresa-history-section">
                <header className="form-header">
                    <h2>Historial de Empresas Registradas</h2>
                </header>
                
                {isLoadingHistory ? (
                    <p>Cargando historial...</p>
                ) : (
                    <EmpresaHistoryTable 
                        history={empresaHistory} 
                        editingEmpresa={editingEmpresa}
                        handleEdit={handleEdit}
                        handleDelete={handleDelete}
                        handleSave={handleSave}
                        handleCancelEdit={handleCancelEdit}
                        handleEmpresaChange={handleEmpresaChange}
                        handleShowClients={handleShowClients}
                        isClientsModalOpen={isClientsModalOpen}
                    />
                )}
            </div>

            {/* 3. MODAL DE CLIENTES */}
            {isClientsModalOpen && (
                <ClientesList 
                    codEmp={selectedEmpresaCod}
                    empresaName={selectedEmpresaName}
                    handleClose={handleCloseClients}
                />
            )}
        </div>
    );
}

export default EmpresaForm;