// components/Huespedes/Huespedes.jsx

import React, { useState, memo } from 'react';
import './Huespedes.css'; 


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


export default function Huespedes() {
  
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setGuestData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage('');

        console.log('--- Datos a enviar a la BD (Tabla clientes) ---');
        console.log(guestData);

       
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
    
    return (
        <div className="huespedes-page-wrapper">
            <div className="employee-form-container">
                
                <header className="form-header">
                    <h2>Registro de Huéspedes</h2>
                </header>

                {message && (
                    <p className={message.startsWith('✅') ? 'message-success' : 'message-info'}>
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