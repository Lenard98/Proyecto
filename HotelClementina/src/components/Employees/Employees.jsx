import React, { useState } from 'react';
import './Employees.css'; // Importa los estilos del formulario

function EmployeesForm() {
  const [formData, setFormData] = useState({
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
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Datos a guardar:', formData);
    alert('Datos del empleado guardados. (Revisar consola)');
  };

  const cargos = [
    { id: 1, nombre: 'Recepcionista' },
    { id: 2, nombre: 'Limpieza' },
    { id: 3, nombre: 'Gerente' },
  ];
  const tiposDocumento = ['DNI', 'Pasaporte', 'Carnet de Residencia'];
  const roles = ['Administrador', 'Cajero', 'Empleado General'];

  return (
    <div className="employee-form-container">
      <header className="form-header">
        <h2>Gestión de Empleados</h2>
        <button className="btn-primary">Agregar Nuevo Empleado</button>
      </header>

      <form onSubmit={handleSubmit} className="employee-form">
        
        {/* ==================== Información Personal ==================== */}
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

        {/* ==================== Información Laboral ==================== */}
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
        
        {/* ==================== Acceso al Sistema ==================== */}
        <fieldset className="form-section access-system">
          <legend>Acceso al Sistema</legend>
          <div className="form-grid access-grid">
            <div className="form-group">
              <label htmlFor="Cor_Emp_Access">Correo Electrónico de Usuario</label>
              <input type="email" id="Cor_Emp_Access" name="Cor_Emp_Access" value={formData.Cor_Emp} readOnly className="read-only-input" />
            </div>
            
            <div className="form-group">
              <label htmlFor="Rol_Sistema">Rol del Sistema</label>
              <select id="Rol_Sistema" name="Rol_Sistema" value={formData.Rol_Sistema} onChange={handleChange} required>
                {roles.map(rol => (<option key={rol} value={rol}>{rol}</option>))}
              </select>
            </div>

            <div className="form-group full-row toggle-group">
              <label htmlFor="accessToggle">Activar Acceso</label>
              <label className="switch">
                <input type="checkbox" id="accessToggle" name="accessToggle" checked={formData.HabDesEmp === 1} onChange={(e) => setFormData({...formData, HabDesEmp: e.target.checked ? 1 : 0})} />
                <span className="slider round"></span>
              </label>
            </div>

          </div>
        </fieldset>

        {/* ==================== Botones de Acción ==================== */}
        <div className="form-actions">
          <button type="button" className="btn-secondary">Cancelar</button>
          <button type="submit" className="btn-primary">Guardar Empleado</button>
        </div>
      </form>
    </div>
  );
}

export default EmployeesForm;