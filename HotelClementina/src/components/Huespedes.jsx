// components/Huespedes/Huespedes.jsx

import React, { useState, memo } from 'react';
import './Huespedes.css'; 

// Función para generar un ID de huésped temporal
const generateMockId = () => 'CLI-' + Math.random().toString(36).substring(2, 9).toUpperCase();

// Componente memoizado para las entradas del formulario
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

// --- COMPONENTE PRINCIPAL ---
export default function Huespedes() {
    
    // Estado inicial de los datos del huésped
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

    // Manejador genérico de cambios en el formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setGuestData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };
    
    /**
     * 🚀 PASO 1: Nueva función para solo limpiar los campos (Resetear el estado del formulario)
     */
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


    /**
     * 🚀 PASO 2: Modificar handleCancel para usar clearForm
     */
    // Manejador de cancelación y reseteo de formulario
    const handleCancel = () => {
        setMessage('Formulario cancelado. Se han limpiado los campos.');
        clearForm(); // Solo llamamos a la limpieza
    };

    /**
     * 🚀 PASO 3: Modificar handleSubmit para usar clearForm SÓLO después del éxito
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(''); // Limpiar cualquier mensaje anterior

        console.log('--- Datos a enviar al Backend para guardar en la BD (Tabla clientes) ---');
        console.log(guestData);

        try {
            // Llama al endpoint de tu backend.
            const response = await fetch('http://localhost:3002/api/huespedes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(guestData),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                // El servidor devolvió un error (4xx, 5xx) o success: false
                const errorMessage = data.message || data.sqlError || `Error HTTP: ${response.status}`;
                throw new Error(errorMessage);
            }

            // Si llegamos aquí, el guardado fue exitoso
            setMessage('✅ Huésped guardado exitosamente.'); 
            
            // Limpiar el formulario y generar un nuevo ID
            clearForm(); 
            
            // Opcional: Ocultar el mensaje de éxito después de 5 segundos
            setTimeout(() => {
                setMessage('');
            }, 5000); 

        } catch (error) {
            console.error('Error al guardar el huésped:', error.message);
            // Muestra el mensaje de error del servidor o de la excepción
            setMessage(`❌ Error al intentar guardar los datos: ${error.message}.`);
        } finally {
            setIsSaving(false);
        }
    };
    // ----------------------------------------------------
    
    return (
        <div className="huespedes-page-wrapper">
            <div className="employee-form-container">
                
                <header className="form-header">
                    <h2>Registro de Huéspedes</h2>
                </header>

                {/* Mostrar mensajes de éxito o error */}
                {message && (
                    <p className={message.startsWith('✅') ? 'message-success' : 'message-error'}>
                        {message}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="employee-form">
                    
                    <fieldset className="form-section">
                        <legend>Datos Personales y de Contacto</legend>
                        <div className="form-grid">
                            <FormInput onChangeHandler={handleChange} label="Nombre Completo" name="Nom_Cli" value={guestData.Nom_Cli} required />
                            <FormInput onChangeHandler={handleChange} label="Correo Electrónico" name="Email_Huesped" value={guestData.Email_Huesped} type="email" required />
                            <FormInput onChangeHandler={handleChange} label="Teléfono Principal" name="Tel1_Huesped" value={guestData.Tel1_Huesped} type="tel" required />
                            <FormInput onChangeHandler={handleChange} label="Teléfono Secundario" name="Tel2_Huesped" value={guestData.Tel2_Huesped} type="tel" />
                            <FormInput onChangeHandler={handleChange} label="Teléfono Adicional" name="Tel3_Huesped" value={guestData.Tel3_Huesped} type="tel" />
                            <FormInput onChangeHandler={handleChange} label="Nacionalidad" name="Nacionalidad" value={guestData.Nacionalidad} />
                        </div>
                    </fieldset>

                    <fieldset className="form-section">
                        <legend>Tipo de Cliente y Ubicación</legend>
                        <div className="form-grid">
                            <FormInput onChangeHandler={handleChange} label="Tipo de Cliente (Tipo_Cli)" name="Tipo_Cli" value={guestData.Tipo_Cli} type="select" required >
                                <option value="Particular">Particular</option>
                                <option value="Empresa">Empresa</option>
                            </FormInput>

                            {guestData.Tipo_Cli === 'Empresa' ? (
                                <FormInput onChangeHandler={handleChange} label="Nombre de la Empresa (Empresa_Huesped)" name="Empresa_Huesped" value={guestData.Empresa_Huesped} required />
                            ) : (
                                <div className="form-group"></div>
                            )}
                            
                            <FormInput onChangeHandler={handleChange} label="Procedencia (Lugar de Origen)" name="Procedencia" value={guestData.Procedencia} />
                        </div>
                    </fieldset>
                    
                    <fieldset className="form-section full-row">
                        <legend>Observaciones</legend>
                        <div className="form-grid-single">
                            <FormInput onChangeHandler={handleChange} label="Observaciones (Observaciones)" name="Observaciones" value={guestData.Observaciones} type="textarea" fullRow />
                        </div>
                    </fieldset>

                    <div className="form-actions">
                        <button type="button" onClick={handleCancel} disabled={isSaving} className="btn-secondary">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isSaving} className="btn-primary">
                            {isSaving ? 'Guardando...' : 'Guardar Huésped'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}