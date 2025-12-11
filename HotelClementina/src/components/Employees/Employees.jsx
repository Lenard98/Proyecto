import React, { useState, useEffect } from 'react';
import './Employees.css'; 

const API_BASE_URL = 'http://localhost:3002/api'; 

function EmployeesForm() {
    
    // Estado inicial de los campos del formulario 
    const initialFormData = {
        Cod_Emp: null,
        Nom_Emp: '',
        Ape_Emp: '',
        Fch_Nacim: '',
        Sex_Emp: 1, 
        Tel_Emp: '',
        Fec_Ini_Emp: new Date().toISOString().substring(0, 10), 
        Cor_Emp: '',
        Dir_Emp: '',
        Cod_Cargo: 1, 
        Sueldo_Emp: '',
        Seguro: '',
        HabDesEmp: 1,
        Tipo_Documento: 'DNI', 
        Rol_Sistema: 'Administrador',
    };
    
    // Estados React
    const [formData, setFormData] = useState(initialFormData);
    const [employees, setEmployees] = useState([]);
    
    // ESTADOS CLAVE PARA EDICIÓN EN LÍNEA
    const [editingEmployeeId, setEditingEmployeeId] = useState(null);
    const [editingFormData, setEditingFormData] = useState({});

    const cargos = [
        { id: 1, nombre: 'Administrador' },   
        { id: 2, nombre: 'Recepcionista' },   
        { id: 3, nombre: 'Limpieza' },        
        { id: 4, nombre: 'Gerente' },         
    ];
    const tiposDocumento = ['DNI', 'Pasaporte', 'Carnet de Residencia'];
    const roles = ['Administrador', 'Gerente', 'Recepcionista', 'Limpieza'];

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        try {
            return new Date(dateString).toISOString().substring(0, 10);
        } catch (e) {
            console.error("Error al formatear fecha:", e);
            return '';
        }
    };
    
    const handleCancelOrNew = () => {
        setEditingEmployeeId(null);
        setEditingFormData({});
        setFormData(initialFormData);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value,
        });
    };
    
    const handleInlineChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditingFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value,
        }));
    };
    
    const getCargoNombre = (codCargo) => {
        const cargo = cargos.find(c => c.id === codCargo);
        return cargo ? cargo.nombre : 'N/A';
    };


    // LÓGICA DE BACKEND
    
    // Función para obtener todos los empleados
    const fetchEmployees = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/empleados`); 
            
            if (!response.ok) {
                throw new Error('Error al cargar la lista de empleados.');
            }

            const data = await response.json();
            setEmployees(data); 
            
        } catch (error) {
            console.error('Error al obtener empleados:', error);
            if (employees.length === 0) {
                 alert('❌ Error al conectar o cargar datos del historial de empleados.');
            }
        }
    };
    
    // Carga la lista de empleados al montar el componente
    useEffect(() => {
        fetchEmployees();
    }, []); 

    
    /*Inicia la edición en línea, cargando el empleado en el estado temporal*/
    const handleEdit = (employee) => {
        
        setEditingEmployeeId(employee.Cod_Emp); 

        setEditingFormData({
            Cod_Emp: employee.Cod_Emp, 
            Nom_Emp: employee.Nom_Emp,
            Ape_Emp: employee.Ape_Emp,
            Tel_Emp: employee.Tel_Emp || '',
            Cor_Emp: employee.Cor_Emp,
            Cod_Cargo: parseInt(employee.Cod_Cargo), 
            HabDesEmp: employee.HabDesEmp,
            
            Sueldo_Emp: employee.Sueldo_Emp || 0,
            Seguro: employee.Seguro || 0,
            Dir_Emp: employee.Dir_Emp || '',
            Sex_Emp: employee.Sex_Emp, 
            Fch_Nacim: formatDateForInput(employee.Fch_Nacim),
            Fec_Ini_Emp: formatDateForInput(employee.Fec_Ini_Emp),
        });
    };

    /*Envía los datos del formulario de creacion*/
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (editingEmployeeId) {
            alert('Por favor, termine o cancele la edición en curso antes de crear un nuevo empleado.');
            return;
        }

        const dataToSend = {
            Nom_Emp: formData.Nom_Emp, Ape_Emp: formData.Ape_Emp, Fch_Nacim: formData.Fch_Nacim, 
            Sex_Emp: parseInt(formData.Sex_Emp), Tel_Emp: formData.Tel_Emp, Fec_Ini_Emp: formData.Fec_Ini_Emp, 
            Cor_Emp: formData.Cor_Emp, Dir_Emp: formData.Dir_Emp, Cod_Cargo: parseInt(formData.Cod_Cargo), 
            Sueldo_Emp: parseFloat(formData.Sueldo_Emp), Seguro: parseFloat(formData.Seguro || 0), HabDesEmp: parseInt(formData.HabDesEmp),
        };

        try {
            const response = await fetch(`${API_BASE_URL}/empleados`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json', },
                body: JSON.stringify(dataToSend), 
            });

            const responseData = await response.json();

            if (response.ok && responseData.success) {
                alert(`✅ ¡Empleado guardado exitosamente!`);
                handleCancelOrNew(); 
                fetchEmployees(); 
            } else {
                alert(`❌ Error al guardar empleado: ${responseData.message || response.statusText}`);
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            alert(`❌ Error: No se pudo conectar con el servidor backend en ${API_BASE_URL}.`);
        }
    };

    /*Envía los cambios de la edición en línea al backend */
    const handleUpdateInline = async (e) => {
        e.preventDefault();
        
        const dataToSend = {
            Nom_Emp: editingFormData.Nom_Emp, Ape_Emp: editingFormData.Ape_Emp, 
            Fch_Nacim: editingFormData.Fch_Nacim, Sex_Emp: parseInt(editingFormData.Sex_Emp), 
            Tel_Emp: editingFormData.Tel_Emp, Fec_Ini_Emp: editingFormData.Fec_Ini_Emp, 
            Cor_Emp: editingFormData.Cor_Emp, Dir_Emp: editingFormData.Dir_Emp,
            Cod_Cargo: parseInt(editingFormData.Cod_Cargo), 
            Sueldo_Emp: parseFloat(editingFormData.Sueldo_Emp), 
            Seguro: parseFloat(editingFormData.Seguro || 0), 
            HabDesEmp: parseInt(editingFormData.HabDesEmp),
        };

        try {
            const response = await fetch(`${API_BASE_URL}/empleados/${editingFormData.Cod_Emp}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            });
            
            const responseData = await response.json();

            if (response.ok && responseData.success) {
                alert('✅ Empleado actualizado exitosamente.');
                setEditingEmployeeId(null); 
                fetchEmployees(); 
            } else {
                alert(`❌ Error al actualizar empleado: ${responseData.message || response.statusText}`);
            }

        } catch (error) {
            console.error('Error de conexión al actualizar:', error);
            alert('❌ Error: No se pudo conectar con el servidor backend.');
        }
    };

    /*Cancela la edición en línea.*/
    const handleCancelInline = () => {
        setEditingEmployeeId(null);
        setEditingFormData({});
    };

    // Manejador para el botón "Eliminar" de la tabla
    const handleDelete = async (employeeId) => {
        if (!window.confirm(`¿Estás seguro de que quieres eliminar al empleado con ID: ${employeeId}?`)) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/empleados/${employeeId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert('✅ Empleado eliminado exitosamente.');
                fetchEmployees(); 
            } else {
                const errorData = await response.json();
                alert(`❌ Error al eliminar empleado: ${errorData.message || response.statusText}`);
            }
        } catch (error) {
            console.error('Error de conexión al eliminar:', error);
            alert('❌ Error: No se pudo conectar con el servidor backend.');
        }
    };
    
    // RENDERIZADO DEL COMPONENTE

    return (
        <div className="employee-form-container">
            <header className="form-header">
                <h2>Gestión de Empleados</h2>
                {/* Botón eliminado de aquí */}
            </header>

            {/* Formulario de CREACIÓN (Mantener) */}
            <form onSubmit={handleSubmit} className="employee-form">
                
                {/* Información Personal */}
                <fieldset className="form-section info-personal">
                    <legend>Información Personal</legend>
                    <div className="form-grid">
                        
                        <div className="form-group full-row">
                            <label htmlFor="Nom_Emp">Nombre(s)</label>
                            <input type="text" id="Nom_Emp" name="Nom_Emp" value={formData.Nom_Emp} onChange={handleChange} required />
                        </div>
                        
                        <div className="form-group full-row">
                            <label htmlFor="Ape_Emp">Apellido(s)</label>
                            <input type="text" id="Ape_Emp" name="Ape_Emp" value={formData.Ape_Emp} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="Tipo_Documento">Tipo Documento</label>
                            <select id="Tipo_Documento" name="Tipo_Documento" value={formData.Tipo_Documento} onChange={handleChange}>
                                {tiposDocumento.map(tipo => (<option key={tipo} value={tipo}>{tipo}</option>))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="Fch_Nacim">Fecha de Nacimiento</label>
                            <input type="date" id="Fch_Nacim" name="Fch_Nacim" value={formData.Fch_Nacim} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="Tel_Emp">Teléfono</label>
                            <input type="text" id="Tel_Emp" name="Tel_Emp" value={formData.Tel_Emp} onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label htmlFor="Sex_Emp">Género</label>
                            <select id="Sex_Emp" name="Sex_Emp" value={formData.Sex_Emp} onChange={handleChange} required>
                                <option value={1}>Masculino</option>
                                <option value={0}>Femenino</option>
                            </select>
                        </div>

                        <div className="form-group full-row">
                            <label htmlFor="Cor_Emp">Correo Electrónico</label>
                            <input type="email" id="Cor_Emp" name="Cor_Emp" value={formData.Cor_Emp} onChange={handleChange} />
                        </div>
                        
                        <div className="form-group full-row">
                            <label htmlFor="Dir_Emp">Dirección</label>
                            <textarea id="Dir_Emp" name="Dir_Emp" value={formData.Dir_Emp} onChange={handleChange} rows="2"></textarea>
                        </div>
                    </div>
                </fieldset>

                {/* Información Laboral */}
                <fieldset className="form-section info-laboral">
                    <legend>Información Laboral</legend>
                    <div className="form-grid">
                        
                        <div className="form-group">
                            <label htmlFor="Cod_Cargo">Cargo/Puesto</label>
                            <select id="Cod_Cargo" name="Cod_Cargo" value={formData.Cod_Cargo} onChange={handleChange} required>
                                {cargos.map(cargo => (<option key={cargo.id} value={cargo.id}>{cargo.nombre}</option>))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="Sueldo_Emp">Sueldo Base</label>
                            <input type="number" step="0.01" id="Sueldo_Emp" name="Sueldo_Emp" value={formData.Sueldo_Emp} onChange={handleChange} required />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="Seguro">Monto de Seguro</label>
                            <input type="number" step="0.01" id="Seguro" name="Seguro" value={formData.Seguro} onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label htmlFor="Fec_Ini_Emp">Fecha Contratación</label>
                            <input type="date" id="Fec_Ini_Emp" name="Fec_Ini_Emp" value={formData.Fec_Ini_Emp} onChange={handleChange} required />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="HabDesEmp">Estado</label>
                            <select id="HabDesEmp" name="HabDesEmp" value={formData.HabDesEmp} onChange={handleChange}>
                                <option value={1}>Activo (Habilitado)</option>
                                <option value={0}>Inactivo (Deshabilitado)</option>
                            </select>
                        </div>

                    </div>
                </fieldset>
                

                {/* Botones de Acción */}
                <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={handleCancelOrNew}>
                        Limpiar Formulario
                    </button>
                    <button type="submit" className="btn-primary">
                        Guardar Empleado
                    </button>
                </div>
            </form>

            {/* Historial de Empleados*/}
            <div className="employee-history-container">
                <h3>Historial de Empleados Registrados ({employees.length})</h3>
                {editingEmployeeId && (
                    <div style={{ padding: '10px 0', color: 'red', fontWeight: 'bold' }}>
                        Modo edición activado. Guarde o cancele antes de continuar la edición.
                    </div>
                )}
                
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre Completo</th>
                            <th>Cargo</th>
                            <th>Teléfono</th>
                            <th>Email</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.length > 0 ? (
                            employees.map((emp) => (
                                <tr key={emp.Cod_Emp} style={{backgroundColor: editingEmployeeId === emp.Cod_Emp ? '#fffbe6' : 'transparent'}}>
                                    
                                    {/* Verifica si esta fila está en modo edición */}
                                    {editingEmployeeId === emp.Cod_Emp ? (
                                        <>
                                            <td>{emp.Cod_Emp}</td>
                                            <td>
                                                {/* Nombre */}
                                                <input 
                                                    type="text" 
                                                    name="Nom_Emp" 
                                                    value={editingFormData.Nom_Emp || ''} 
                                                    onChange={handleInlineChange} 
                                                    className="inline-input"
                                                    style={{ width: '45%', marginRight: '5px' }}
                                                />
                                                {/* Apellido */}
                                                <input 
                                                    type="text" 
                                                    name="Ape_Emp" 
                                                    value={editingFormData.Ape_Emp || ''} 
                                                    onChange={handleInlineChange} 
                                                    className="inline-input"
                                                    style={{ width: '45%' }}
                                                />
                                            </td>
                                            <td>
                                                {/* Cargo */}
                                                <select 
                                                    name="Cod_Cargo" 
                                                    value={editingFormData.Cod_Cargo || 1} 
                                                    onChange={handleInlineChange}
                                                    className="inline-input"
                                                >
                                                    {cargos.map(cargo => (<option key={cargo.id} value={cargo.id}>{cargo.nombre}</option>))}
                                                </select>
                                            </td>
                                            <td>
                                                {/* Teléfono */}
                                                <input 
                                                    type="text" 
                                                    name="Tel_Emp" 
                                                    value={editingFormData.Tel_Emp || ''} 
                                                    onChange={handleInlineChange} 
                                                    className="inline-input"
                                                />
                                            </td>
                                            <td>
                                                {/* Email */}
                                                <input 
                                                    type="email" 
                                                    name="Cor_Emp" 
                                                    value={editingFormData.Cor_Emp || ''} 
                                                    onChange={handleInlineChange} 
                                                    className="inline-input"
                                                />
                                            </td>
                                            <td>
                                                {/* Estado */}
                                                <select 
                                                    name="HabDesEmp" 
                                                    value={editingFormData.HabDesEmp || 1} 
                                                    onChange={handleInlineChange}
                                                    className="inline-input"
                                                >
                                                    <option value={1}>Activo</option>
                                                    <option value={0}>Inactivo</option>
                                                </select>
                                            </td>
                                            <td className="action-buttons">
                                                {/* Botones GUARDAR y CANCELAR de la edición en línea */}
                                                <button className="btn-edit" onClick={handleUpdateInline}>Guardar</button>
                                                <button type="button" className="btn-secondary" onClick={handleCancelInline}>Cancelar</button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            {/* FILA DE LECTURA NORMAL */}
                                            <td>{emp.Cod_Emp}</td>
                                            <td>{`${emp.Nom_Emp} ${emp.Ape_Emp}`}</td>
                                            <td>{emp.Tipo_Cargo || getCargoNombre(emp.Cod_Cargo)}</td> 
                                            <td>{emp.Tel_Emp}</td>
                                            <td>{emp.Cor_Emp}</td>
                                            <td>{emp.HabDesEmp === 1 ? 'Activo' : 'Inactivo'}</td>
                                            <td className="action-buttons">
                                                {/* Botones Editar y Eliminar de la fila normal */}
                                                <button 
                                                    className="btn-edit" 
                                                    onClick={() => handleEdit(emp)}
                                                    disabled={editingEmployeeId !== null} 
                                                >
                                                    Editar
                                                </button>
                                                <button className="btn-delete" onClick={() => handleDelete(emp.Cod_Emp)}>Eliminar</button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" style={{textAlign: 'center'}}>No hay empleados registrados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default EmployeesForm;