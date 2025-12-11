import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Habitaciones.css';
import { FaBed, FaBroom, FaTools, FaCheckCircle, FaUser, FaClock, FaMoneyBillWave } from 'react-icons/fa';

const API_URL = 'http://localhost:3002/api';

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

    const fetchHabitaciones = async () => {
        try {
            const res = await axios.get(`${API_URL}/habitaciones`);
            if (res.data.success) {
                setHabitaciones(res.data.data);
            }
        } catch (error) {
            console.error("Error cargando datos:", error);
        }
    };

    useEffect(() => {
        fetchHabitaciones();
        const intervalo = setInterval(fetchHabitaciones, 3000);
        return () => clearInterval(intervalo);
    }, []);

    const handleCardClick = (hab) => {
        setSelectedHabitacion(hab);
        setEstadoSeleccionadoId(hab.Est_Hab);
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
            const res = await axios.put(
                `${API_URL}/habitaciones/cambiar-estado/${codHab}`,
                { nuevoEstado: estadoSeleccionadoId }
            );

            if (res.data.success) {
                alert(`Estado de Habitación ${codHab} cambiado.`);
                await fetchHabitaciones();
                handleCloseModal();
            } else {
                alert("Error al actualizar estado.");
            }
        } catch (error) {
            console.error("Error al actualizar estado:", error);
            alert("Hubo un error de conexión con el servidor.");
        }
    };

    const calcularEstadoActual = (hab) => {
        if (hab.Est_Hab !== 2 || !hab.Cod_Res) return null; 

        const fechaInicio = new Date(hab.Fec_Ini_Res);
        const fechaFinPactada = new Date(hab.Fec_Fin_Res);
        const precioPactado = parseFloat(hab.Precio_Unitario || hab.Precio_Hab);
        
        const fechaFinRes = hab.Fec_Fin_Res ? new Date(hab.Fec_Fin_Res).toISOString().split('T')[0] : 'N/A';
        const isPagado = hab.Pagado_NoPagado == 1;

        if (isPagado) {
            return { 
                dias: 0, 
                consumoTotal: 0, 
                fechaFinRes, 
                isPagado: true 
            };
        }

        fechaInicio.setHours(0, 0, 0, 0);
        fechaFinPactada.setHours(0, 0, 0, 0);

        const diffTime = fechaFinPactada - fechaInicio;
        let diasTotales = Math.max(1, Math.ceil(diffTime / (1000 * 3600 * 24)));
        
        const subtotalReservaCompleta = diasTotales * precioPactado;

        return { 
            dias: diasTotales, 
            consumoTotal: subtotalReservaCompleta, 
            fechaFinRes, 
            isPagado: false 
        };
    };

    const getStatusConfig = (estado) => {
        switch (estado) {
            case 1: return { color: 'green', texto: 'DISPONIBLE', icon: <FaCheckCircle /> };
            case 2: return { color: 'red', texto: 'OCUPADO', icon: <FaUser /> };
            case 3: return { color: 'cyan', texto: 'LIMPIEZA', icon: <FaBroom /> };
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

                            <div className="hab-centro-libre">
                                {hab.Est_Hab === 2 && info ? (
                                    <div className="hab-detalle-ocupada-v2">
                                        {info.isPagado ? (
                                            <>
                                                <div className="detalle-row">
                                                    <FaMoneyBillWave /> **PAGADA**
                                                </div>
                                                <small className="fecha-ingreso">
                                                    Salida de Reserva: {info.fechaFinRes}
                                                </small>
                                            </>
                                        ) : (
                                            <>
                                                <div className="detalle-row">
                                                    <FaUser /> {hab.Nom_Cli || 'Cliente Desconocido'}
                                                </div>
                                                <div className="detalle-row">
                                                    <FaClock /> {info.dias} Noches
                                                </div>
                                                <div className="detalle-row">
                                                    <FaMoneyBillWave /> L. {info.consumoTotal.toFixed(2)} (Sub)
                                                </div>
                                                <small className="fecha-ingreso">
                                                    Entrada: {hab.Fec_Ini_Res?.split('T')[0]}
                                                </small>
                                            </>
                                        )}
                                    </div>
                                ) : (
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

            {isModalOpen && selectedHabitacion && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Cambiar Estado - Habitación {selectedHabitacion.Cod_Hab}</h3>
                        <p>
                            Estado Actual:{' '}
                            <strong>{getStatusConfig(selectedHabitacion.Est_Hab).texto}</strong>
                        </p>

                        <div className="estado-opciones-grid">
                            {estadosDisponibles.map((estado) => (
                                <button
                                    key={estado.id}
                                    className={`estado-btn ${estado.color} ${
                                        estadoSeleccionadoId === estado.id ? 'active' : ''
                                    }`}
                                    onClick={() => setEstadoSeleccionadoId(estado.id)}
                                >
                                    <div className="estado-btn-icon">{estado.icono}</div>
                                    <div className="estado-btn-nombre">{estado.nombre}</div>
                                </button>
                            ))}
                        </div>

                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={handleCloseModal}>
                                Cancelar
                            </button>
                            <button
                                className="btn-confirm"
                                onClick={updateEstadoHabitacion}
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