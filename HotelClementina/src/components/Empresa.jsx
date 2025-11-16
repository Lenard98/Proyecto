import React, { useState } from 'react';
import './Empresa.css'; 

function EmpresaForm() {
  // Estado inicial: Ahora incluye Cod_Emp para que el usuario lo escriba
  const [formData, setFormData] = useState({
    Cod_Emp: '', // El usuario escribirá el RTN aquí
    Nom_Emp: '',
  });

  // Manejador genérico de cambios (funciona para ambos inputs)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Función PRINCIPAL para enviar los datos al Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Crear el objeto de datos (ahora incluye el Cod_Emp del formulario)
    const dataToSend = {
      Cod_Emp: formData.Cod_Emp,
      Nom_Emp: formData.Nom_Emp,
    };

    // 2. Definir la URL de tu API
    const apiUrl = 'http://localhost:3002/api/empresa'; 

    try {
      // 3. Llamada Fetch al endpoint POST
      const response = await fetch(apiUrl, { 
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend), 
      });

      const responseData = await response.json();

      // 4. Procesar la respuesta
      if (response.ok && responseData.success) {
        alert('✅ ¡Empresa guardada exitosamente!');
        // Limpiar el formulario
        setFormData({
          Cod_Emp: '',
          Nom_Emp: '',
        });
      } else {
        alert(`❌ Error al guardar empresa: ${responseData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      alert('❌ Error: No se pudo conectar con el servidor backend.');
    }
  };

  return (
    <div className="empresa-form-container">
      <header className="form-header">
        <h2>Gestión de Empresas</h2>
      </header>

      <form onSubmit={handleSubmit} className="empresa-form">
        
        <fieldset className="form-section">
          <legend>Datos de la Empresa</legend>
          <div className="form-grid">
            
            {/* CAMPO NUEVO PARA EL RTN */}
            <div className="form-group">
              <label htmlFor="Cod_Emp">RTN (Código Empresa)</label>
              <input 
                type="text" 
                id="Cod_Emp" 
                name="Cod_Emp" 
                value={formData.Cod_Emp} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="Nom_Emp">Nombre de la Empresa</label>
              <input 
                type="text" 
                id="Nom_Emp" 
                name="Nom_Emp" 
                value={formData.Nom_Emp} 
                onChange={handleChange} 
                required 
              />
            </div>

          </div>
        </fieldset>
        
        <div className="form-actions">
          <button type="button" className="btn-secondary">Cancelar</button>
          <button type="submit" className="btn-primary">Guardar Empresa</button>
        </div>
      </form>
    </div>
  );
}

export default EmpresaForm;