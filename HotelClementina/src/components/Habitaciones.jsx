import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Habitaciones.css';
// Importaciones de íconos necesarias para el tablero y el modal
import { FaBed, FaBroom, FaTools, FaCheckCircle, FaUser, FaClock, FaMoneyBillWave } from 'react-icons/fa';

const API_URL = 'http://localhost:3002/api';

// Estados disponibles para el selector en el modal
const estadosDisponibles = [
    { id: 1, nombre: 'DISPONIBLE', color: 'green', icono: <FaCheckCircle /> },
    { id: 2, nombre: 'OCUPADO', color: 'red', icono: <FaUser /> },
    { id: 3, nombre: 'LIMPIEZA', color: 'cyan', icono: <FaBroom /> },
    { id: 4, nombre: 'MANTENIMIENTO', color: 'orange', icono: <FaTools /> },
];

const Habitaciones = () => {
    const [habitaciones, setHabitaciones] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedHabitacion, setSelectedHabitacion] = useState(null);
    const [estadoSeleccionadoId, setEstadoSeleccionadoId] = useState(null);

    // Carga inicial y periódica de habitaciones
    const fetchHabitaciones = async () => {
        try {
            const res = await axios.get(`${API_URL}/habitaciones`);
            if (res.data.success) {
                setHabitaciones(res.data.data);
            }
        } catch (error) { console.error("Error cargando datos:", error); }
    };

    useEffect(() => {
        fetchHabitaciones();
        // Sigue refrescando los datos cada 3 segundos
        const intervalo = setInterval(fetchHabitaciones, 3000); 
        return () => clearInterval(intervalo);
    }, []);

    const handleCardClick = (hab) => {
        setSelectedHabitacion(hab);
        setEstadoSeleccionadoId(hab.Est_Hab); // Inicializa el selector con el estado actual
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedHabitacion(null);
        setEstadoSeleccionadoId(null);
    };

    const updateEstadoHabitacion = async () => {
        if (!selectedHabitacion || !estadoSeleccionadoId) return;

        const codHab = selectedHabitacion.Cod_Hab;

        try {
            // 1. Llama al endpoint PUT del servidor para guardar el nuevo estado
            const res = await axios.put(`${API_URL}/habitaciones/cambiar-estado/${codHab}`, {
                nuevoEstado: estadoSeleccionadoId,
            });

            if (res.data.success) {
                // NOTA: Usa un modal o toast en lugar de alert() para mejor UX.
                alert(`Estado de Habitación ${codHab} cambiado.`);
                
                // 2. IMPORTANTE: Usamos 'await' para esperar la recarga de datos.
                await fetchHabitaciones(); 
                
                // 3. El modal se cierra SOLO después de que los datos actualizados han llegado.
                handleCloseModal();
            } else {
                alert("Error al actualizar estado.");
            }
        } catch (error) {
            console.error("Error al actualizar el estado:", error);
            alert("Hubo un error de conexión con el servidor.");
        }
    };

    const calcularEstadoActual = (hab) => {
        // Solo aplica cálculo si está ocupada (Est_Hab === 2)
        if (hab.Est_Hab !== 2) return null;

        const fechaInicio = new Date(hab.Fec_Ini_Res);
        const hoy = new Date();
        const diferencia = hoy - fechaInicio;
        // Calcula días de estancia, asegurando que sea al menos 1 día
        let dias = Math.ceil(diferencia / (1000 * 3600 * 24));
        if (dias < 1) dias = 1;

        // Calcula consumo solo por noche (sin incluir servicios adicionales)
        const consumoActual = dias * parseFloat(hab.Precio_Hab);

        return { dias, consumoActual };
    };

    // Función para obtener la configuración de estado (color/texto/ícono)
    const getStatusConfig = (estado) => {
        switch (estado) {
            case 1: return { color: 'green', texto: 'DISPONIBLE', icon: <FaCheckCircle /> };
            case 2: return { color: 'red', texto: 'OCUPADO', icon: <FaUser /> };
            case 3: return { color: 'blue', texto: 'LIMPIEZA', icon: <FaBroom /> }; 
            case 4: return { color: 'orange', texto: 'MANTENIMIENTO', icon: <FaTools /> };
            default: return { color: 'gray', texto: 'DESC.', icon: <FaBed /> };
        }
    };

    return (
        <div className="tablero-container">
            <h2>Tablero de Habitaciones</h2>
            <div className="habitaciones-grid">
                {habitaciones.map((hab) => {
                    const config = getStatusConfig(hab.Est_Hab);
                    const info = calcularEstadoActual(hab);

                    return (
                        <div 
                            key={hab.Cod_Hab} 
                            className={`hab-card ${config.color}`} 
                            onClick={() => handleCardClick(hab)}
                        >
                            <div className="hab-header">
                                <span>{config.texto} - {hab.Cod_Hab}</span>
                                <span>{hab.Tipo_Hab}</span>
                            </div>

                            {/* LÓGICA CLAVE: Usamos la misma estructura de contenedor para el centro (hab-centro-libre)
                                pero adaptamos el contenido para mostrar los detalles de la ocupación, 
                                manteniendo la uniformidad del tamaño de la tarjeta.
                            */}
                            <div className="hab-centro-libre">
                                {hab.Est_Hab === 2 ? (
                                    <div className="hab-detalle-ocupada-v2">
                                        <div className="detalle-row"><FaUser /> {hab.Nom_Cli || 'Cliente Desconocido'}</div>
                                        <div className="detalle-row"><FaClock /> {info.dias} Noches</div>
                                        <div className="detalle-row"><FaMoneyBillWave /> L. {info.consumoActual.toFixed(2)} (Sub)</div>
                                        <small className="fecha-ingreso">Entrada: {hab.Fec_Ini_Res?.split('T')[0]}</small>
                                    </div>
                                ) : (
                                    // Renderizado LISO para DISPONIBLE, LIMPIEZA y MANTENIMIENTO
                                    <>
                                        <div className="hab-icon">{config.icon}</div>
                                        <div className="hab-precio">L. {hab.Precio_Hab}</div>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* --- MODAL DE CAMBIO DE ESTADO (Con Botones Visuales) --- */}
            {isModalOpen && selectedHabitacion && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Cambiar Estado - Habitación {selectedHabitacion.Cod_Hab}</h3>
                        <p>
                            Estado Actual: <span style={{ fontWeight: 'bold' }}>
                                {getStatusConfig(selectedHabitacion.Est_Hab).texto}
                            </span>
                        </p>

                        {/* ESTA SECCIÓN CREA EL DISEÑO DE BOTONES EN GRID CON ÍCONOS */}
                        <div className="estado-opciones-grid">
                            {estadosDisponibles.map((estado) => (
                                <button
                                    key={estado.id}
                                    className={`estado-btn ${estado.color} ${estadoSeleccionadoId === estado.id ? 'active' : ''}`}
                                    onClick={() => setEstadoSeleccionadoId(estado.id)}
                                >
                                    <div className="estado-btn-icon">{estado.icono}</div>
                                    <div className="estado-btn-nombre">{estado.nombre}</div>
                                </button>
                            ))}
                        </div>

                        <div className="modal-actions">
                            <button onClick={handleCloseModal} className="btn-cancel">Cancelar</button>
                            <button 
                                onClick={updateEstadoHabitacion} 
                                className="btn-confirm"
                                disabled={estadoSeleccionadoId === selectedHabitacion.Est_Hab}
                            >
                                Guardar Cambio
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Habitaciones;