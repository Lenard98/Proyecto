import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Facturacion.css'; 
import { FaSearch, FaPrint, FaCreditCard, FaMoneyBillAlt, FaConciergeBell, FaTrash, FaPlus } from 'react-icons/fa';

// --- IMPORTACIÓN CORRECTA DEL LOGO ---
import logoHotel from '../assets/LogoHotel.jpg';

const API_URL = 'http://localhost:3002/api';

// ***************************************************************
// DATOS DEL USUARIO LOGUEADO
// ***************************************************************
const CODIGO_USUARIO_ACTIVO = 'U002'; 
const NOMBRE_USUARIO_ACTIVO = 'Maria Lopez (Recep)'; 

const Facturacion = () => {
  const [habitacionesOcupadas, setHabitacionesOcupadas] = useState([]);
  const [seleccionada, setSeleccionada] = useState(null);
  
  // Mantenemos la fecha de salida real (hoy) para el registro en la BD al facturar
  const [fechaSalidaCalculo, setFechaSalidaCalculo] = useState('');

  // Lógica: 1=Efectivo, 0=Tarjeta
  const [metodoPago, setMetodoPago] = useState(1); 
  
  // Lista de cargos manuales
  const [cargosExtra, setCargosExtra] = useState([]);
  const [nuevoCargo, setNuevoCargo] = useState({ descripcion: '', precio: '', cantidad: 1 });
  
  const [totales, setTotales] = useState(null);

  useEffect(() => { fetchHabitacionesOcupadas(); }, []);
  
  // Recalcular si cambia la selección, los cargos extra o la fecha
  useEffect(() => { if (seleccionada) calcular(); }, [seleccionada, cargosExtra, fechaSalidaCalculo]);

  const fetchHabitacionesOcupadas = async () => {
    try {
      const res = await axios.get(`${API_URL}/habitaciones`);
      if (res.data.success) {
        setHabitacionesOcupadas(res.data.data.filter(h => h.Est_Hab === 2 && h.Pagado_NoPagado != 1));
      }
    } catch (error) { console.error(error); }
  };

  const agregarCargo = () => {
    if (!nuevoCargo.descripcion || !nuevoCargo.precio || !nuevoCargo.cantidad) return alert("Complete todos los campos");
    
    setCargosExtra([
        ...cargosExtra, 
        { 
            ...nuevoCargo, 
            precio: parseFloat(nuevoCargo.precio),
            cantidad: parseInt(nuevoCargo.cantidad)
        }
    ]);
    setNuevoCargo({ descripcion: '', precio: '', cantidad: 1 });
  };

  const eliminarCargo = (index) => {
    const nuevaLista = [...cargosExtra];
    nuevaLista.splice(index, 1);
    setCargosExtra(nuevaLista);
  };

  const handleEliminarReserva = async () => {
    if(!seleccionada) return;
    if(!window.confirm(`¿⚠️ ESTÁ SEGURO? \nEsto eliminará la reserva de la Habitación ${seleccionada.Cod_Hab} y la pondrá DISPONIBLE. \nEsta acción no se puede deshacer.`)) return;

    try {
      await axios.delete(`${API_URL}/reservas/${seleccionada.Cod_Res}`);
      alert('Reserva eliminada correctamente.');
      setSeleccionada(null);
      setTotales(null);
      setCargosExtra([]);
      fetchHabitacionesOcupadas();
    } catch (error) {
      alert('Error al eliminar reserva: ' + (error.response?.data?.message || error.message));
    }
  };

  const calcular = () => {
    if (!seleccionada) return;

    const precioBase = parseFloat(seleccionada.Precio_Unitario || seleccionada.Precio_Hab);
    
    const inicio = new Date(seleccionada.Fec_Ini_Res); 
    const fin = new Date(seleccionada.Fec_Fin_Res); 

    inicio.setHours(0, 0, 0, 0);
    fin.setHours(0, 0, 0, 0);

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) return;

    const diffTime = fin - inicio;
    let dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    if (dias < 1) dias = 1; 

    const subHospedaje = precioBase * dias;
    
    // Sumar cargos manuales
    const totalExtras = cargosExtra.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

    const subtotal = subHospedaje + totalExtras;
    const isv = subtotal * 0.15;     
    const turismo = subtotal * 0.04; 
    const total = subtotal + isv + turismo;

    setTotales({ dias, subHospedaje, totalExtras, subtotal, isv, turismo, total });
  };

  const handleCobrar = async () => {
    if(!seleccionada || !totales) return;
    if(!window.confirm("¿Confirmar cobro y emisión de factura final?")) return;

    try {
      await axios.post(`${API_URL}/facturar`, {
        Cod_Res: seleccionada.Cod_Res, 
        Cod_Hab: seleccionada.Cod_Hab,
        Cod_Cli: seleccionada.Cod_Cli,
        Total_Pagar: totales.total.toFixed(2),
        EstadiaDias: totales.dias, 
        TipoPago: metodoPago, 
        Cod_Usu: CODIGO_USUARIO_ACTIVO,
        Fecha_Salida_Real: fechaSalidaCalculo,
        // --- AQUÍ ENVIAMOS LOS CARGOS PARA GUARDAR EN TABLA RECARGOS ---
        Extras: cargosExtra 
      });
      alert('✅ Factura Generada y Reserva Cerrada.');
      setSeleccionada(null);
      setTotales(null);
      setCargosExtra([]);
      fetchHabitacionesOcupadas(); 
    } catch (error) { 
        alert('Error al facturar: ' + (error.response?.data?.message || error.message)); 
    }
  };

  return (
    <div className="pms-billing-container fade-in">
      
      {/* SIDEBAR: SELECCIÓN Y EXTRAS */}
      <div className="billing-controls">
        <div className="control-section">
          <h3><FaSearch /> Buscar Reserva Activa</h3>
          <select className="pms-select" onChange={(e) => {
             const hab = habitacionesOcupadas.find(h => h.Cod_Hab == e.target.value);
             setSeleccionada(hab); 
             
             const hoy = new Date();
             const fechaHoy = hoy.toISOString().split('T')[0];
             setFechaSalidaCalculo(fechaHoy);
             setCargosExtra([]); 
          }}>
            <option value="">-- Seleccione Habitación --</option>
            {habitacionesOcupadas.map(h => (
              <option key={h.Cod_Hab} value={h.Cod_Hab}>
                HAB {h.Cod_Hab} - {h.Nom_Cli}
              </option>
            ))}
          </select>

            {seleccionada && (
                <button className="btn-eliminar-reserva" onClick={handleEliminarReserva}>
                    <FaTrash /> Eliminar Reserva / Cancelar
                </button>
            )}
        </div>

        {seleccionada && (
          <div className="control-section fade-in">
            
            <h3><FaConciergeBell /> Agregar Cargos Extra</h3>
            
            <div className="add-cargo-form">
                <input 
                    type="text" 
                    placeholder="Descripción (ej. Cena)" 
                    value={nuevoCargo.descripcion}
                    onChange={e => setNuevoCargo({...nuevoCargo, descripcion: e.target.value})}
                    className="input-desc"
                />
                <input 
                    type="number" 
                    min="1"
                    placeholder="Cant." 
                    value={nuevoCargo.cantidad}
                    onChange={e => setNuevoCargo({...nuevoCargo, cantidad: e.target.value})}
                    className="input-cant"
                />
                <input 
                    type="number" 
                    placeholder="Precio Unit." 
                    value={nuevoCargo.precio}
                    onChange={e => setNuevoCargo({...nuevoCargo, precio: e.target.value})}
                    className="input-precio"
                />
                <button className="btn-add-cargo" onClick={agregarCargo}>
                    <FaPlus />
                </button>
            </div>

            <div className="lista-cargos">
                {cargosExtra.map((cargo, idx) => (
                    <div key={idx} className="cargo-item-row">
                        <div style={{flex: 1}}>
                            <strong>{cargo.cantidad}x</strong> {cargo.descripcion}
                        </div>
                        <span>L. {(cargo.precio * cargo.cantidad).toFixed(2)}</span>
                        <button className="btn-remove-cargo" onClick={() => eliminarCargo(idx)}>
                            <FaTrash size={12}/>
                        </button>
                    </div>
                ))}
                {cargosExtra.length === 0 && <p className="no-cargos">Sin cargos extra.</p>}
            </div>
            
            <h3 style={{marginTop: '20px'}}><FaCreditCard /> Método de Pago</h3>
            <div className="payment-methods">
                <button className={`method-btn ${metodoPago===1 ? 'active':''}`} onClick={()=>setMetodoPago(1)}>
                    <FaMoneyBillAlt size={20}/> Efectivo
                </button>
                <button className={`method-btn ${metodoPago===0 ? 'active':''}`} onClick={()=>setMetodoPago(0)}>
                    <FaCreditCard size={20}/> Tarjeta
                </button>
            </div>
          </div>
        )}
        
      </div>

      {/* VISTA PREVIA DE FACTURA */}
      <div className="invoice-preview">
        {totales ? (
            <div className="paper-invoice">
                <div className="inv-header">
                    {/* --- AQUÍ VA LA IMAGEN DEL LOGO --- */}
                    <div className="inv-logo-box">
                        <img src={logoHotel} alt="Logo Hotel Clementina" className="inv-logo-img" />
                    </div> 
                    <div className="inv-company-info">
                        <h2>HOTEL CLEMENTINA</h2>
                        <p>RTN: HN-DANLI-001</p>
                        <p>Danlí, El Paraíso, Honduras</p>
                        <p>Tel: 2763-5007 | hotelclementina@yahoo.com</p>
                    </div>
                </div>

                <div className="inv-meta">
                    <div>
                        <strong>CLIENTE:</strong> {seleccionada.Nom_Cli}<br/>
                        <strong>CODIGO:</strong> {seleccionada.Cod_Cli}<br/>
                    </div>
                    <div style={{textAlign:'right'}}>
                        <strong>FACTURA Nº:</strong> {Math.floor(Date.now()/1000)}<br/>
                        <strong>FECHA:</strong> {new Date().toLocaleDateString()}<br/>
                        <strong>FACTURADO POR:</strong> {NOMBRE_USUARIO_ACTIVO} <br/>
                        <strong>HABITACIÓN:</strong> {seleccionada.Cod_Hab}
                    </div>
                </div>

                <table className="inv-table">
                    <thead>
                        <tr>
                            <th>DESCRIPCIÓN</th>
                            <th>CANT.</th>
                            <th>PRECIO UNIT.</th>
                            <th>TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Hospedaje (Hab. {seleccionada.Cod_Hab})</td>
                            <td>{totales.dias}</td>
                            <td>L. {parseFloat(seleccionada.Precio_Unitario || seleccionada.Precio_Hab).toFixed(2)}</td>
                            <td>L. {totales.subHospedaje.toFixed(2)}</td>
                        </tr>
                        
                        {cargosExtra.map((cargo, idx) => (
                            <tr key={idx}>
                                <td>{cargo.descripcion} (Extra)</td>
                                <td>{cargo.cantidad}</td>
                                <td>L. {cargo.precio.toFixed(2)}</td>
                                <td>L. {(cargo.precio * cargo.cantidad).toFixed(2)}</td>
                            </tr>
                        ))}

                    </tbody>
                </table>

                <div className="inv-footer">
                    {/* --- SECCIÓN DE TOTALES CORREGIDA --- */}
                    <div className="inv-totals">
                        <div className="total-row"><span>Subtotal:</span> <span>L. {totales.subtotal.toFixed(2)}</span></div>
                        <div className="total-row"><span>I.S.V. (15%):</span> <span>L. {totales.isv.toFixed(2)}</span></div>
                        <div className="total-row"><span>Turismo (4%):</span> <span>L. {totales.turismo.toFixed(2)}</span></div>
                        
                        {/* TOTAL A PAGAR: ESTRUCTURA PARA QUE SE SEPARE CORRECTAMENTE */}
                        <div className="total-row grand-total">
                            <span>TOTAL A PAGAR:</span> 
                            <span>L. {totales.total.toFixed(2)}</span>
                        </div>
                </div>
                </div>

                <button className="print-btn" onClick={handleCobrar}>
                    <FaPrint /> CONFIRMAR Y FACTURAR
                </button>
            </div>
        ) : (
            <div className="empty-state">
                <FaPrint size={50} color="#ccc"/>
                <p>Seleccione una habitación para generar la pre-factura.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Facturacion;