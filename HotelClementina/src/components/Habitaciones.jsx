import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Habitaciones.css'; // Usamos el mismo CSS
import { FaBed, FaBroom, FaTools, FaCheckCircle, FaUser, FaClock, FaMoneyBillWave } from 'react-icons/fa';

const API_URL = 'http://localhost:3002/api';

const Habitaciones = () => {
  const [habitaciones, setHabitaciones] = useState([]);

  const fetchHabitaciones = async () => {
    try {
      const res = await axios.get(`${API_URL}/habitaciones`);
      if (res.data.success) {
        setHabitaciones(res.data.data);
      }
    } catch (error) { console.error("Error cargando datos"); }
  };

  useEffect(() => {
    fetchHabitaciones();
    const intervalo = setInterval(fetchHabitaciones, 3000); // Polling cada 3 seg
    return () => clearInterval(intervalo);
  }, []);

  // Función para calcular info en tiempo real
  const calcularEstadoActual = (hab) => {
    if (hab.Est_Hab !== 2) return null;

    const fechaInicio = new Date(hab.Fec_Ini_Res);
    const hoy = new Date();
    const diferencia = hoy - fechaInicio;
    let dias = Math.ceil(diferencia / (1000 * 3600 * 24));
    if (dias < 1) dias = 1;

    const consumoActual = dias * parseFloat(hab.Precio_Hab);

    return { dias, consumoActual };
  };

  const getStatusConfig = (estado) => {
    switch (estado) {
      case 1: return { color: 'green', texto: 'LIBRE', icon: <FaCheckCircle /> };
      case 2: return { color: 'red', texto: 'OCUPADO', icon: <FaUser /> };
      case 3: return { color: 'cyan', texto: 'LIMPIEZA', icon: <FaBroom /> };
      case 4: return { color: 'orange', texto: 'MANTENIMIENTO', icon: <FaTools /> };
      default: return { color: 'gray', texto: 'DESC.', icon: <FaBed /> };
    }
  };

  return (
    <div className="tablero-container">
      <h2>Tablero de Habitaciines</h2>
      <div className="habitaciones-grid">
        {habitaciones.map((hab) => {
          const config = getStatusConfig(hab.Est_Hab);
          const info = calcularEstadoActual(hab);

          return (
            <div key={hab.Cod_Hab} className={`hab-card ${config.color}`} style={{cursor: 'default'}}>
              <div className="hab-header">
                <span>{config.texto} - {hab.Cod_Hab}</span>
                <span>{hab.Tipo_Hab}</span>
              </div>
              
              {/* Contenido según estado */}
              {hab.Est_Hab === 2 ? (
                <div className="hab-detalle-ocupada">
                  <div className="detalle-row"><FaUser/> {hab.Nom_Cli}</div>
                  <div className="detalle-row"><FaClock/> {info.dias} Noches</div>
                  <div className="detalle-row"><FaMoneyBillWave/> L. {info.consumoActual.toFixed(2)} (Sub)</div>
                  <small className="fecha-ingreso">Entrada: {hab.Fec_Ini_Res?.split('T')[0]}</small>
                </div>
              ) : (
                <div className="hab-centro-libre">
                  <div className="hab-icon">{config.icon}</div>
                  <div className="hab-precio">L. {hab.Precio_Hab}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Habitaciones;