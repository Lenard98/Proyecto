import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. IMPORTACIÓN CORREGIDA: Apunta directamente al archivo Huespedes.jsx
import HuespedesForm from './Huespedes.jsx'; 

import EmployeesForm from './Employees/Employees'; 
import logoHotel from '../assets/LogoHotel.jpg';
import './MenuPage.css'; 
import EmpresaForm from './Empresa';
import Habitaciones from './Habitaciones';
import Reservas from './Reservas';
import Facturacion from './Facturacion';


// Lista de los ítems del sidebar
const sidebarItems = [
    { id: 'reservas', name: 'Reservas', icon: '🏠' },
    { id: 'huespedes', name: 'Huéspedes', icon: '👥' },
    { id: 'habitaciones', name: 'Habitaciones', icon: '🛏️' },
    { id: 'empleados', name: 'Empleados', icon: '🧑‍💼' },
    { id: 'facturacion', name: 'Facturación', icon: '🧾' },
    { id: 'configuracion', name: 'Configuración', icon: '⚙️' },
    { id: 'perfil', name: 'Perfil', icon: '👤' },
    { id: 'empresa', name: 'Empresa', icon: '🏢' },
];

function MenuPage() {
    // Estado inicial cambiado a 'dashboard'
    const [currentView, setCurrentView] = useState('dashboard'); 
    const navigate = useNavigate();

    // Renderiza el componente de la vista seleccionada
    const renderContentView = () => {
        switch (currentView) {
            case 'reservas':
                return <Reservas />;
                
            case 'huespedes': 
                // 2. CASO 'HUESPEDES' AÑADIDO: Muestra el componente Huéspedes
                return <HuespedesForm />; 

            case 'empleados':
                return <EmployeesForm />; 
                
            case 'empresa':
                return <EmpresaForm/>;   

                
            case 'habitaciones':
                return <Habitaciones/>;

            case 'facturacion':
                return <Facturacion/>;
                
            case 'configuracion':
                return <div>Vista de Configuración</div>;
                
            case 'perfil':
                return <div>Vista de Perfil</div>;
                
            default:
                return <div>Bienvenido al Dashboard.</div>;
        }
    };

    // Función de Logout
    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/'); 
    };

    return (
        <div className="dashboard-layout">
            
            {/* ---------------- Sidebar (Navegación) ---------------- */}
            <div className="sidebar">
                <div className="sidebar-header">
                    <img src={logoHotel} alt="Logo" className="sidebar-logo" /> 
                    <h2 className="sidebar-title">HOTEL CLEMENTINA</h2>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        {sidebarItems.map((item) => (
                            <li 
                                key={item.id}
                                className={currentView === item.id ? 'active' : ''}
                                onClick={() => setCurrentView(item.id)}
                            >
                                <span className="sidebar-icon">{item.icon}</span> {item.name}
                            </li>
                        ))}
                        
                        {/* Botón de Cerrar Sesión */}
                        <li onClick={handleLogout} className="logout-button">
                            <span className="sidebar-icon">🚪</span> Cerrar Sesión
                        </li>
                    </ul>
                </nav>
            </div>
            
            {/* ---------------- Contenido Principal ---------------- */}
            <div className="main-content">
                <header className="main-header">
                    <div className="user-info">
                        <span>Usuario Conectado</span> <span className="sidebar-icon">👤</span>
                    </div>
                </header>
                <div className="content-area">
                    {renderContentView()}
                </div>
            </div>
        </div>
    );
}

export default MenuPage;