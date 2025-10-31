import React, { useState } from 'react';
// IMPORTANTE: Ruta de importación corregida a tu estructura (en la misma carpeta 'components')
import EmployeesForm from './Employees/Employees'; 
import './MenuPage.css'; // Importa los estilos del layout

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
    // Inicia en 'empleados' para que puedas ver el formulario al cargar
    const [currentView, setCurrentView] = useState('empleados'); 

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

    return (
        <div className="dashboard-layout">
            
            {/* ---------------- Sidebar (Navegación) ---------------- */}
            <div className="sidebar">
                <div className="sidebar-header">
                    <img src="/assets/LogoHotel.jpg" alt="Logo" className="sidebar-logo" />
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