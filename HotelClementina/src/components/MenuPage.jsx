import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. IMPORTAMOS
import EmployeesForm from './Employees/Employees'; 
import logoHotel from '../assets/LogoHotel.jpg';
import './MenuPage.css'; 


// Lista de los ítems del sidebar
const sidebarItems = [
    { id: 'dashboard', name: 'Dashboard', icon: '🏠' },
    { id: 'huespedes', name: 'Huéspedes', icon: '👥' },
    { id: 'habitaciones', name: 'Habitaciones', icon: '🛏️' },
    { id: 'empleados', name: 'Empleados', icon: '🧑‍💼' },
    { id: 'facturacion', name: 'Facturación', icon: '🧾' },
    { id: 'configuracion', name: 'Configuración', icon: '⚙️' },
    { id: 'perfil', name: 'Perfil', icon: '👤' },
];

function MenuPage() {
    const [currentView, setCurrentView] = useState('empleados'); 
    const navigate = useNavigate(); // 2. INICIALIZAMOS

     // Renderiza el componente de la vista seleccionada
    const renderContentView = () => {
        switch (currentView) {
            case 'empleados':
                return <EmployeesForm />; // Renderiza el Formulario de Empleados
            case 'habitaciones':
                return <div>Vista de Habitaciones</div>;
            case 'dashboard':
            default:
                return <div>Bienvenido al Dashboard.</div>;
        }
    };

    // 3. CREAMOS LA FUNCIÓN DE LOGOUT
    const handleLogout = () => {
        // Limpiamos el usuario guardado en el login
        localStorage.removeItem('user');
        // Te regresamos a la ruta raíz "/", donde está el LoginPage
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
                        
                        {/* 4. AÑADIMOS EL BOTÓN DE CERRAR SESIÓN */}
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
      .</div>
    );
}

export default MenuPage;