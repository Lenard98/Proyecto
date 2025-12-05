import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Facturacion.css'; 
import { FaSearch, FaPrint, FaCreditCard, FaMoneyBillAlt, FaConciergeBell, FaCalendarAlt } from 'react-icons/fa';

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
  const [extras, setExtras] = useState({ personas: 0, desayuno: false });
  const [totales, setTotales] = useState(null);

  useEffect(() => { fetchHabitacionesOcupadas(); }, []);
  
  // Recalcular si cambia la selección
  useEffect(() => { if (seleccionada) calcular(); }, [seleccionada, extras, fechaSalidaCalculo]);

  const fetchHabitacionesOcupadas = async () => {
    try {
      // El backend trae Pagado_NoPagado
      const res = await axios.get(`${API_URL}/habitaciones`);
      if (res.data.success) {
        // Filtramos las que están OCUPADAS (Est_Hab=2) y NO PAGADAS (Pagado_NoPagado=0)
        setHabitacionesOcupadas(res.data.data.filter(h => h.Est_Hab === 2 && h.Pagado_NoPagado != 1));
      }
    } catch (error) { console.error(error); }
  };

  const calcular = () => {
    if (!seleccionada) return;

    // 1. PRECIO: Usamos el precio pactado en la reserva
    const precioBase = parseFloat(seleccionada.Precio_Unitario || seleccionada.Precio_Hab);
    
    // 2. FECHAS: Usamos la fecha de inicio y la fecha de FIN de la reserva
    const inicio = new Date(seleccionada.Fec_Ini_Res); 
    const fin = new Date(seleccionada.Fec_Fin_Res); // <-- CLAVE: Usamos Fec_Fin_Res (Fecha de Fin de Reserva)

    // Limpiamos la hora para un cálculo de días preciso
    inicio.setHours(0, 0, 0, 0);
    fin.setHours(0, 0, 0, 0);

    // Validación de fechas
    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
        console.error("Fechas de cálculo inválidas.");
        return;
    }

    // 3. CÁLCULO DE DÍAS (Noches) - Diferencia entre el fin pactado y el inicio
    const diffTime = fin - inicio;
    let dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    // Mínimo 1 noche, y nos aseguramos de no tener números negativos
    if (dias < 1) dias = 1; 

    // 4. TOTALES
    const subHospedaje = precioBase * dias;
    const subExtras = (extras.personas * 400) * dias; 
    const subDesayuno = extras.desayuno ? (150 * dias) : 0;

    const subtotal = subHospedaje + subExtras + subDesayuno;
    const isv = subtotal * 0.15;     
    const turismo = subtotal * 0.04; 
    const total = subtotal + isv + turismo;

    setTotales({ dias, subHospedaje, subExtras, subDesayuno, subtotal, isv, turismo, total });
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
        Fecha_Salida_Real: fechaSalidaCalculo // La fecha de hoy
      });
      alert('✅ Factura Generada y Reserva Cerrada.');
      setSeleccionada(null);
      setTotales(null);
      fetchHabitacionesOcupadas(); 
    } catch (error) { 
        alert('Error al facturar: ' + (error.response?.data?.message || error.message)); 
    }
  };

  return (
    <div className="pms-billing-container">
      
      {/* SIDEBAR: SELECCIÓN Y EXTRAS */}
      <div className="billing-controls">
        <div className="control-section">
          <h3><FaSearch /> Buscar Reserva Activa</h3>
          <select className="pms-select" onChange={(e) => {
             const hab = habitacionesOcupadas.find(h => h.Cod_Hab == e.target.value);
             setSeleccionada(hab); 
             
             // Se sigue estableciendo la fecha de hoy para enviarla como Fecha_Salida_Real al backend
             const hoy = new Date();
             const fechaHoy = hoy.toISOString().split('T')[0];
             
             setFechaSalidaCalculo(fechaHoy);
             setExtras({ personas: 0, desayuno: false });
          }}>
            <option value="">-- Seleccione Habitación --</option>
            {habitacionesOcupadas.map(h => (
              <option key={h.Cod_Hab} value={h.Cod_Hab}>
                HAB {h.Cod_Hab} - {h.Nom_Cli}
              </option>
            ))}
          </select>
        </div>

        {seleccionada && (
          <div className="control-section fade-in">
            
            
            <h3><FaConciergeBell /> Cargos Adicionales</h3>
            <div className="extra-item">
              <label>Personas Extra (L.400)</label>
              <input type="number" min="0" value={extras.personas} onChange={e=>setExtras({...extras, personas: e.target.value})} />
            </div>
            <div className="extra-item">
              <label>Desayuno (L.150)</label>
              <input type="checkbox" checked={extras.desayuno} onChange={e=>setExtras({...extras, desayuno: e.target.checked})} />
            </div>
            
            <h3 style={{marginTop: '20px'}}><FaCreditCard /> Método de Pago</h3>
            <div className="payment-methods">
                <button className={`method-btn ${metodoPago===1 ? 'active':''}`} onClick={()=>setMetodoPago(1)}>
                    <FaMoneyBillAlt /> Efectivo
                </button>
                <button className={`method-btn ${metodoPago===0 ? 'active':''}`} onClick={()=>setMetodoPago(0)}>
                    <FaCreditCard /> Tarjeta
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
                    <div className="inv-logo-box">HC</div> 
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
                            {/* Cantidad de noches (días pactados en la reserva) */}
                            <td>{totales.dias}</td>
                            <td>L. {parseFloat(seleccionada.Precio_Unitario || seleccionada.Precio_Hab).toFixed(2)}</td>
                            <td>L. {totales.subHospedaje.toFixed(2)}</td>
                        </tr>
                        {extras.personas > 0 && (
                            <tr>
                                <td>Recargo Persona Extra</td>
                                <td>{extras.personas * totales.dias}</td>
                                <td>L. 400.00</td>
                                <td>L. {totales.subExtras.toFixed(2)}</td>
                            </tr>
                        )}
                        {extras.desayuno && (
                            <tr>
                                <td>Servicio de Desayuno</td>
                                <td>{totales.dias}</td>
                                <td>L. 150.00</td>
                                <td>L. {totales.subDesayuno.toFixed(2)}</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <div className="inv-footer">
                    <div className="inv-totals">
                        <div className="total-row"><span>Subtotal:</span> <span>L. {totales.subtotal.toFixed(2)}</span></div>
                        <div className="total-row"><span>I.S.V. (15%):</span> <span>L. {totales.isv.toFixed(2)}</span></div>
                        <div className="total-row"><span>Turismo (4%):</span> <span>L. {totales.turismo.toFixed(2)}</span></div>
                        <div className="total-row grand-total"><span>TOTAL A PAGAR:</span> <span>L. {totales.total.toFixed(2)}</span></div>
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