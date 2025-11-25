import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Reservas.css'; 
import { FaUser, FaIdCard, FaGlobe, FaMapMarkerAlt, FaPhone, FaCalendarAlt, FaBed } from 'react-icons/fa';

const API_URL = 'http://localhost:3002/api';

const Reservas = () => {
  const [habitacionesLibres, setHabitacionesLibres] = useState([]);
  
  // Fechas por defecto (Hoy)
  const hoy = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    Cod_Cli: '',      
    Nom_Cli: '',      
    Tel_Cli: '',      
    Nacionalidad: '', 
    Procedencia: '',  
    Cod_Hab: '',
    Fec_Ini: hoy, // Mapeo exacto a DB Fec_Ini_Res
    Fec_Fin: hoy, // Mapeo exacto a DB Fec_Fin_Res
    Observaciones: ''
  });

  const [diasCalculados, setDiasCalculados] = useState(1);

  useEffect(() => {
    fetchHabitacionesLibres();
  }, []);

  // Calcular días visualmente cuando cambian las fechas
  useEffect(() => {
    const ini = new Date(formData.Fec_Ini);
    const fin = new Date(formData.Fec_Fin);
    const diffTime = Math.abs(fin - ini);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    setDiasCalculados(diffDays || 0);
  }, [formData.Fec_Ini, formData.Fec_Fin]);

  const fetchHabitacionesLibres = async () => {
    try {
      const res = await axios.get(`${API_URL}/habitaciones`);
      if (res.data.success) {
        setHabitacionesLibres(res.data.data.filter(h => h.Est_Hab === 1));
      }
    } catch (error) { console.error(error); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.Fec_Fin < formData.Fec_Ini) return alert("La fecha de salida no puede ser antes de la entrada.");

    try {
        await axios.post(`${API_URL}/reservar`, {
            Cod_Hab: formData.Cod_Hab,
            Cod_Cli: formData.Cod_Cli,
            Fec_Ini: formData.Fec_Ini, // Enviamos fechas reales
            Fec_Fin: formData.Fec_Fin,
            Cod_Usu: 'Admin',
            Observaciones: formData.Observaciones
        });
        alert('✅ Reserva creada y guardada en BD');
        setFormData({ ...formData, Cod_Cli: '', Cod_Hab: '', Nom_Cli: '', Observaciones: '' });
        fetchHabitacionesLibres();
    } catch (error) {
        alert('❌ Error al procesar: ' + (error.response?.data?.message || 'Revise conexión'));
    }
  };

  const handleHabitacionChange = (e) => {
    setFormData({ ...formData, Cod_Hab: e.target.value });
  };

  return (
    <div className="pms-container fade-in">
      <header className="pms-header">
        <h2><FaCalendarAlt /> Nuevo Check-In / Reservación</h2>
        <div className="pms-date-display">
            {new Date().toLocaleDateString('es-HN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </header>

      <form onSubmit={handleSubmit} className="pms-grid-layout">
        
        {/* COLUMNA 1: DATOS DEL HUÉSPED */}
        <section className="pms-card">
          <div className="card-header">
            <h3><FaUser /> Perfil del Huésped</h3>
          </div>
          <div className="card-body">
            <div className="form-group-row">
                <div className="input-wrapper">
                    <label>Documento ID / Pasaporte</label>
                    <div className="input-icon">
                        <FaIdCard />
                        <input type="text" placeholder="Ej: 0801-1999-00123" required 
                            value={formData.Cod_Cli} onChange={e => setFormData({...formData, Cod_Cli: e.target.value})} />
                    </div>
                </div>
                <div className="input-wrapper">
                    <label>Nombre Completo</label>
                    <input type="text" placeholder="Nombre del Huésped" 
                        value={formData.Nom_Cli} onChange={e => setFormData({...formData, Nom_Cli: e.target.value})} />
                </div>
            </div>

            <div className="form-group-row">
                <div className="input-wrapper">
                    <label>Teléfono</label>
                    <div className="input-icon"><FaPhone /><input type="text" placeholder="+504..." value={formData.Tel_Cli} onChange={e=>setFormData({...formData, Tel_Cli:e.target.value})}/></div>
                </div>
                <div className="input-wrapper">
                    <label>Nacionalidad</label>
                    <div className="input-icon"><FaGlobe /><input type="text" placeholder="Hondureña" value={formData.Nacionalidad} onChange={e=>setFormData({...formData, Nacionalidad:e.target.value})}/></div>
                </div>
            </div>

            <div className="input-wrapper full-width">
                <label>Procedencia (Ciudad/Estado)</label>
                <div className="input-icon"><FaMapMarkerAlt /><input type="text" placeholder="Ej: Tegucigalpa" value={formData.Procedencia} onChange={e=>setFormData({...formData, Procedencia:e.target.value})}/></div>
            </div>
          </div>
        </section>

        {/* COLUMNA 2: DATOS DE ALOJAMIENTO */}
        <section className="pms-card">
          <div className="card-header">
            <h3><FaBed /> Detalle de Alojamiento</h3>
          </div>
          <div className="card-body">
            
            <div className="input-wrapper full-width">
                <label>Asignar Habitación</label>
                <select required value={formData.Cod_Hab} onChange={handleHabitacionChange} className="big-select">
                    <option value="">-- Seleccione Habitación Disponible --</option>
                    {habitacionesLibres.map(h => (
                    <option key={h.Cod_Hab} value={h.Cod_Hab}>
                        HAB {h.Cod_Hab} - {h.Tipo_Hab.toUpperCase()} (L. {h.Precio_Hab})
                    </option>
                    ))}
                </select>
            </div>

            {/* CAJA DE FECHAS (Adaptada para inputs DATE) */}
            <div className="stay-duration-box" style={{flexDirection:'column', alignItems:'flex-start'}}>
                <div className="form-group-row full-width">
                    <div className="input-wrapper">
                        <label>Fecha Entrada</label>
                        <input type="date" className="big-select" required
                            value={formData.Fec_Ini} 
                            onChange={e => setFormData({...formData, Fec_Ini: e.target.value})} />
                    </div>
                    <div className="input-wrapper">
                        <label>Fecha Salida</label>
                        <input type="date" className="big-select" required
                            value={formData.Fec_Fin} 
                            onChange={e => setFormData({...formData, Fec_Fin: e.target.value})} />
                    </div>
                </div>
                <div className="date-preview" style={{alignSelf:'flex-end', marginTop:'10px'}}>
                    <span>Duración Total:</span>
                    <strong>{diasCalculados} Noches</strong>
                </div>
            </div>

            <div className="input-wrapper full-width">
                <label>Observaciones / Notas de Recepción</label>
                <textarea rows="2" placeholder="Ej: Alérgico a mariscos, Solicita almohada extra..." 
                    value={formData.Observaciones} onChange={e => setFormData({...formData, Observaciones: e.target.value})}></textarea>
            </div>

            <button type="submit" className="pms-btn-primary">
                CONFIRMAR CHECK-IN
            </button>
          </div>
        </section>

      </form>
    </div>
  );
};

export default Reservas;