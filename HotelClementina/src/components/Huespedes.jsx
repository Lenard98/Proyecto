import React, { useState, useCallback } from 'react';

// Función de utilidad para generar un ID temporal (simulando Cod_Cli)
const generateMockId = () => 'CLI-' + Math.random().toString(36).substring(2, 9).toUpperCase();

export default function Huespedes() {
    // Estado inicial que coincide con las columnas de la base de datos 'clientes'
    const [guestData, setGuestData] = useState({
        Cod_Cli: generateMockId(), // Valor inicial simulado
        Tipo_Cli: 'Particular', // Por defecto
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

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setGuestData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage('');

        console.log('--- Datos a enviar a la BD (Tabla clientes) ---');
        console.log(guestData);

        // Simulación de guardado
        try {
            await new Promise(resolve => setTimeout(resolve, 1500)); 
            setMessage('✅ Huésped guardado exitosamente ');
        } catch (error) {
            console.error('Error al guardar:', error);
            setMessage('❌ Error al intentar guardar los datos.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setMessage('Formulario cancelado. Se han limpiado los campos.');
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

    // Componente de entrada de formulario que utiliza tus clases CSS originales
    const FormInput = ({ label, name, value, type = 'text', required = false, disabled = false, fullRow = false, children }) => (
        <div className={`form-group ${fullRow ? 'full-row' : ''}`}>
            <label htmlFor={name}>{label} {required && <span style={{ color: 'red' }}>*</span>}</label>
            {type === 'textarea' ? (
                <textarea
                    id={name}
                    name={name}
                    value={value}
                    onChange={handleChange}
                    required={required}
                    rows="3"
                    disabled={disabled}
                />
            ) : type === 'select' ? (
                <select
                    id={name}
                    name={name}
                    value={value}
                    onChange={handleChange}
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
                    onChange={handleChange}
                    required={required}
                    disabled={disabled}
                    className={disabled ? 'read-only-input' : ''}
                />
            )}
        </div>
    );


    return (
        <>
            {/* 1. SECCIÓN DE ESTILOS CSS INCRUSTADOS (del Huespedes.css original) */}
            <style>
                {`
                    /* Estilos para envolver el contenedor principal */
                    .huespedes-page-wrapper {
                        padding: 20px;
                        min-height: 100vh;
                        background-color: #e9ecef;
                    }
                    
                    /* CSS original del usuario (Huespedes.css) */
                    .employee-form-container {
                        max-width: 900px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f8f9fa;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
                    }

                    .form-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 30px;
                        padding-bottom: 15px;
                        border-bottom: 2px solid #e9ecef;
                    }

                    .form-header h2 {
                        font-size: 1.8rem;
                        color: #343a40;
                        margin: 0;
                    }

                    /* Estilos de botones */
                    .btn-primary {
                        background-color: #5E637A;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 1rem;
                        transition: background-color 0.2s;
                    }

                    .btn-primary:hover {
                        background-color: #768BA6;
                    }

                    .btn-secondary {
                        background-color: red;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 1rem;
                        transition: background-color 0.2s;
                        margin-right: 10px;
                    }

                    .btn-secondary:hover {
                        background-color: #9A0000;
                    }

                    /* Estructura del Formulario */
                    .employee-form {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 30px;
                    }

                    .form-section {
                        border: 1px solid #dee2e6;
                        border-radius: 8px;
                        padding: 20px;
                        margin: 0;
                        flex: 1 1 100%; 
                        min-width: 300px;
                        background-color: white;
                    }

                    legend {
                        font-size: 1.2rem;
                        font-weight: 600;
                        color: #343a40;
                        padding: 0 10px;
                    }

                    .form-grid {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 20px;
                    }

                    .form-group {
                        display: flex;
                        flex-direction: column;
                    }

                    .form-group label {
                        font-weight: 500;
                        margin-bottom: 5px;
                        color: #495057;
                        font-size: 0.9rem;
                    }

                    .form-group input:not([type="checkbox"]),
                    .form-group select,
                    .form-group textarea {
                        padding: 10px;
                        border: 1px solid #ced4da;
                        border-radius: 4px;
                        font-size: 1rem;
                        transition: border-color 0.2s, box-shadow 0.2s;
                    }

                    .form-group input:focus,
                    .form-group select:focus,
                    .form-group textarea:focus {
                        border-color: #007bff;
                        box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
                        outline: none;
                    }

                    .full-row {
                        grid-column: 1 / -1;
                    }

                    .read-only-input {
                        background-color: #e9ecef !important;
                        cursor: not-allowed;
                    }
                    
                    /* Estilos que fueron quitados del toggle y acceso para simplificar el código */
                    /* Botones al final del formulario */
                    .form-actions {
                        grid-column: 1 / -1;
                        display: flex;
                        justify-content: flex-end;
                        padding-top: 20px;
                        border-top: 1px solid #dee2e6;
                        width: 100%;
                        margin-top: 20px;
                    }

                    /* Responsive adjustments */
                    @media (max-width: 992px) {
                        .employee-form {
                            gap: 20px;
                        }
                        .form-section {
                            flex-basis: 100%;
                            min-width: unset;
                        }
                        .form-grid {
                            grid-template-columns: 1fr;
                        }
                        .full-row {
                            grid-column: unset;
                        }
                    }
                `}
            </style>

            {/* 2. ESTRUCTURA HTML/JSX DEL FORMULARIO */}
            <div className="huespedes-page-wrapper">
                <div className="employee-form-container">
                    
                    {/* Header */}
                    <header className="form-header">
                        <h2>Registro de Huéspedes</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', color: '#6c757d' }}>
                            {/* Icono de Hash simulado */}
                            <span style={{ fontSize: '1rem' }}>#</span> 
                            <span style={{ fontFamily: 'monospace' }}>{guestData.Cod_Cli}</span>
                        </div>
                    </header>

                    {/* Mensajes de estado */}
                    {message && (
                        <p style={{ padding: '10px 0', textAlign: 'center', fontWeight: 'bold', color: message.startsWith('✅') ? 'green' : '#6c757d' }}>
                            {message}
                        </p>
                    )}

                    {/* Formulario principal */}
                    <form onSubmit={handleSubmit} className="employee-form">
                        
                        {/* Sección 1: Datos Principales y de Contacto */}
                        <fieldset className="form-section">
                            <legend>Datos Personales y de Contacto</legend>
                            <div className="form-grid">
                                
                                {/* Nom_Cli (Requerido) */}
                                <FormInput
                                    label="Nombre Completo (Nom_Cli)"
                                    name="Nom_Cli"
                                    value={guestData.Nom_Cli}
                                    required
                                />

                                {/* Email_Huesped (Requerido) */}
                                <FormInput
                                    label="Correo Electrónico (Email_Huesped)"
                                    name="Email_Huesped"
                                    value={guestData.Email_Huesped}
                                    type="email"
                                    required
                                />

                                {/* Tel1_Huesped (Requerido) */}
                                <FormInput
                                    label="Teléfono Principal (Tel1_Huesped)"
                                    name="Tel1_Huesped"
                                    value={guestData.Tel1_Huesped}
                                    type="tel"
                                    required
                                />

                                {/* Tel2_Huesped (Opcional) */}
                                <FormInput
                                    label="Teléfono Secundario (Tel2_Huesped)"
                                    name="Tel2_Huesped"
                                    value={guestData.Tel2_Huesped}
                                    type="tel"
                                />
                                
                                {/* Tel3_Huesped (Opcional) */}
                                <FormInput
                                    label="Teléfono Adicional (Tel3_Huesped)"
                                    name="Tel3_Huesped"
                                    value={guestData.Tel3_Huesped}
                                    type="tel"
                                />

                                {/* Nacionalidad */}
                                <FormInput
                                    label="Nacionalidad"
                                    name="Nacionalidad"
                                    value={guestData.Nacionalidad}
                                />
                            </div>
                        </fieldset>

                        {/* Sección 2: Tipo de Cliente y Procedencia */}
                        <fieldset className="form-section">
                            <legend>Tipo de Cliente y Ubicación</legend>
                            <div className="form-grid">
                                
                                {/* Tipo_Cli (Select) */}
                                <FormInput
                                    label="Tipo de Cliente (Tipo_Cli)"
                                    name="Tipo_Cli"
                                    value={guestData.Tipo_Cli}
                                    type="select"
                                    required
                                >
                                    <option value="Particular">Particular</option>
                                    <option value="Empresa">Empresa</option>
                                </FormInput>

                                {/* Empresa_Huesped (Condicional) */}
                                {guestData.Tipo_Cli === 'Empresa' ? (
                                    <FormInput
                                        label="Nombre de la Empresa (Empresa_Huesped)"
                                        name="Empresa_Huesped"
                                        value={guestData.Empresa_Huesped}
                                        required
                                    />
                                ) : (
                                    // Espacio vacío para mantener el diseño de la cuadrícula si es particular
                                    <div className="form-group" style={{ height: '0', visibility: 'hidden', padding: '0', margin: '0' }}></div>
                                )}
                                
                                {/* Procedencia */}
                                <FormInput
                                    label="Procedencia (Lugar de Origen)"
                                    name="Procedencia"
                                    value={guestData.Procedencia}
                                />
                            </div>
                        </fieldset>
                        
                        {/* Sección 3: Observaciones */}
                        <fieldset className="form-section full-row">
                            <legend>Observaciones</legend>
                            <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
                                 {/* Observaciones */}
                                <FormInput
                                    label="Observaciones (Observaciones)"
                                    name="Observaciones"
                                    value={guestData.Observaciones}
                                    type="textarea"
                                    fullRow
                                />
                            </div>
                        </fieldset>

                        {/* Acciones del Formulario */}
                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={isSaving}
                                className="btn-secondary"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="btn-primary"
                            >
                                {isSaving ? 'Guardando...' : 'Guardar Huésped'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </>
    );
}