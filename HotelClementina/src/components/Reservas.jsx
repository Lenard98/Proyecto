import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Reservas.css'; 
import { FaUser, FaGlobe, FaMapMarkerAlt, FaPhone, FaCalendarAlt, FaBed, FaSearch } from 'react-icons/fa';

const API_URL = 'http://localhost:3002/api';

const Reservas = () => {
  const [habitacionesLibres, setHabitacionesLibres] = useState([]);
  const [clientesLista, setClientesLista] = useState([]); 
  
  const hoy = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    Cod_Cli: '',      
    Nom_Cli: '',      
    Tel1_Huesped: '', 
    Nacionalidad: '', 
    Procedencia: '',  
    Cod_Hab: '',
    Fec_Ini: hoy, 
    Fec_Fin: hoy, 
  });

  const [diasCalculados, setDiasCalculados] = useState(1);

  useEffect(() => {
    fetchHabitacionesLibres();
    fetchClientesLista(); 
  }, []);

  useEffect(() => {
    const ini = new Date(formData.Fec_Ini);
    const fin = new Date(formData.Fec_Fin);
    const diffTime = Math.abs(fin - ini);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    setDiasCalculados(diffDays || 0);
  }, [formData.Fec_Ini, formData.Fec_Fin]);

  const fetchClientesLista = async () => {
    try {
      const res = await axios.get(`${API_URL}/clientes-lista`);
      if (res.data.success) {
        setClientesLista(res.data.data);
      }
    } catch (error) {
      console.error('Error al cargar la lista de clientes:', error);
    }
  };

  const fetchHabitacionesLibres = async () => {
    try {
      const res = await axios.get(`${API_URL}/habitaciones`);
      if (res.data.success) {
        setHabitacionesLibres(res.data.data.filter(h => h.Est_Hab === 1));
      }
    } catch (error) { console.error(error); }
  };

  const fetchDetallesCliente = async (codCli) => {
    if (!codCli) {
        setFormData(prev => ({
            ...prev,
            Nom_Cli: '',
            Tel1_Huesped: '', 
            Nacionalidad: '',
            Procedencia: ''
        }));
        return;
    }

    try {
        const res = await axios.get(`${API_URL}/cliente/${codCli}`);
        
        if (res.data.success && res.data.data) {
            const cliente = res.data.data;
            setFormData(prev => ({
                ...prev,
                Nom_Cli: cliente.Nom_Cli || '',
                Tel1_Huesped: cliente.Tel1_Huesped || '', 
                Nacionalidad: cliente.Nacionalidad || '',
                Procedencia: cliente.Procedencia || ''
            }));
        } else {
            console.warn('Cliente seleccionado no encontrado en la base de datos.');
            setFormData(prev => ({
                ...prev,
                Nom_Cli: '',
                Tel1_Huesped: '', 
                Nacionalidad: '',
                Procedencia: ''
            }));
        }
    } catch (error) {
        console.error('Error al obtener detalles del cliente:', error);
        alert('Error al cargar datos del cliente. Revise la consola.');
    }
  };

  const handleClienteChange = (e) => {
    const codCliSeleccionado = e.target.value;
    setFormData(prev => ({ ...prev, Cod_Cli: codCliSeleccionado }));
    fetchDetallesCliente(codCliSeleccionado);
  };

  const handleHabitacionChange = (e) => {
    setFormData({ ...formData, Cod_Hab: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.Fec_Fin < formData.Fec_Ini) return alert("La fecha de salida no puede ser antes de la entrada.");
    if (!formData.Cod_Cli) return alert("Debe seleccionar un cliente.");
    if (!formData.Cod_Hab) return alert("Debe asignar una habitación.");

    try {
        await axios.post(`${API_URL}/reservar`, {
            Cod_Hab: formData.Cod_Hab,
            Cod_Cli: formData.Cod_Cli,
            Fec_Ini: formData.Fec_Ini, 
            Fec_Fin: formData.Fec_Fin,
            Cod_Usu: 'Admin',
        });
        alert('✅ Reserva creada y guardada en BD');
        
        setFormData(prev => ({ 
            ...prev, 
            Cod_Cli: '', 
            Cod_Hab: '', 
            Nom_Cli: '', 
            Tel1_Huesped: '', 
            Nacionalidad: '',
            Procedencia: '',
        }));
        fetchHabitacionesLibres();
    } catch (error) {
        alert('❌ Error al procesar: ' + (error.response?.data?.message || 'Revise conexión'));
    }
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
        
        <section className="pms-card">
          <div className="card-header">
            <h3><FaUser /> Perfil del Huésped</h3>
          </div>
          <div className="card-body">
            
            <div className="input-wrapper full-width" style={{marginBottom: '15px'}}>
              <label>Nombre del Huesped</label>
              <div className="input-icon">
                <FaSearch />
                <select 
                    required 
                    value={formData.Cod_Cli} 
                    onChange={handleClienteChange} 
                    className="big-select"
                >
                    <option value="">-- Buscar o Seleccionar Huésped Existente --</option>
                    {clientesLista.map(c => (
                        <option key={c.Cod_Cli} value={c.Cod_Cli}>
                            {c.Cod_Cli} | {c.Nom_Cli}
                        </option>
                    ))}
                </select>
              </div>
            </div>
            
            <div className="form-group-row">
              <div className="input-wrapper">
                  <label>Nombre Completo</label>
                  <div className="input-icon"> 
                    <FaUser /> 
                    <input type="text" placeholder="Nombre del Huésped" required
                        value={formData.Nom_Cli} onChange={e => setFormData({...formData, Nom_Cli: e.target.value})} />
                  </div>
              </div>

              <div className="input-wrapper">
                  <label>Teléfono</label>
                  <div className="input-icon">
                    <FaPhone />
                    <input type="text" placeholder="+504..." 
                            value={formData.Tel1_Huesped} 
                            onChange={e=>setFormData({...formData, Tel1_Huesped:e.target.value})}
                        />
                  </div>
              </div>
            </div>

            <div className="form-group-row">
              <div className="input-wrapper">
                  <label>Nacionalidad</label>
                  <div className="input-icon">
                    <FaGlobe />
                    <input type="text" placeholder="Hondureña" value={formData.Nacionalidad} onChange={e=>setFormData({...formData, Nacionalidad:e.target.value})}/>
                  </div>
              </div>
              <div className="input-wrapper">
                  <label>Procedencia (Ciudad/Estado)</label>
                  <div className="input-icon">
                    <FaMapMarkerAlt />
                    <input type="text" placeholder="Ej: Tegucigalpa" value={formData.Procedencia} onChange={e=>setFormData({...formData, Procedencia:e.target.value})}/>
                  </div>
              </div>
            </div>
          </div>
        </section>

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