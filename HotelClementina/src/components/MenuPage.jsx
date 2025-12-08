import React, { useState, useEffect } from 'react'; // Agregamos useEffect
import { useNavigate } from 'react-router-dom';

// Importaciones de componentes
import HuespedesForm from './Huespedes.jsx'; 
import EmployeesForm from './Employees/Employees'; 
import EmpresaForm from './Empresa';
import Habitaciones from './Habitaciones';
import Reservas from './Reservas';
import Facturacion from './Facturacion';

import logoHotel from '../assets/LogoHotel.jpg';
import './MenuPage.css'; 

// Lista COMPLETA de los ítems del sidebar
const allSidebarItems = [
    { id: 'reservas', name: 'Reservas', icon: '🏠' },
    { id: 'huespedes', name: 'Huéspedes', icon: '👥' },
    { id: 'habitaciones', name: 'Habitaciones', icon: '🛏️' },
    { id: 'empleados', name: 'Empleados', icon: '🧑‍💼' },     // Restringido
    { id: 'facturacion', name: 'Facturación', icon: '🧾' },
    { id: 'configuracion', name: 'Configuración', icon: '⚙️' }, // Restringido (Usuarios)
    { id: 'perfil', name: 'Perfil', icon: '👤' },
    { id: 'empresa', name: 'Empresa', icon: '🏢' },
];

function MenuPage() {
    const [currentView, setCurrentView] = useState('dashboard'); 
    const [user, setUser] = useState(null); // Estado para guardar datos del usuario logueado
    const [filteredItems, setFilteredItems] = useState([]); // Items del menú filtrados por rol
    
    const navigate = useNavigate();

    // 1. EFECTO DE CARGA: Verificar usuario y definir roles
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            
            const role = parsedUser.tipo_usu; // 1: Admin, 2: Gerente, 3: Recep

            // Lógica de filtrado de menú según roles
            const items = allSidebarItems.filter(item => {
                // ADMINISTRADOR (1): Ve todo
                if (role === 1) return true;

                // GERENTE (2): Ve todo MENOS Empleados y Configuración (Usuarios)
                if (role === 2) {
                    return item.id !== 'empleados' && item.id !== 'configuracion';
                }

                // RECEPCIONISTA (3): Solo Reservas, Huéspedes, Habitaciones, Facturación, Empresa y Perfil
                if (role === 3) {
                    return ['reservas', 'huespedes', 'habitaciones', 'facturacion', 'empresa', 'perfil'].includes(item.id);
                }

                return false; // Por defecto no ve nada si no tiene rol
            });

            setFilteredItems(items);

        } else {
            // Si no hay usuario logueado, redirigir al login
            navigate('/');
        }
    }, [navigate]);


    // Renderiza el componente de la vista seleccionada
    const renderContentView = () => {
        switch (currentView) {
            case 'reservas':
                return <Reservas />;
            case 'huespedes': 
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
                return <div><h3>Gestión de Usuarios (Configuración)</h3><p>Solo visible para Administradores.</p></div>;
            case 'perfil':
                return <div><h3>Perfil de Usuario</h3><p>Nombre: {user?.nom_usu}</p><p>Rol ID: {user?.tipo_usu}</p></div>;
            default:
                return (
                    <div style={{textAlign: 'center', marginTop: '50px'}}>
                        <h2>Bienvenido al Sistema Hotelero Clementina</h2>
                        <p>Seleccione una opción del menú para comenzar.</p>
                    </div>
                );
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
                        {/* Usamos filteredItems en lugar de sidebarItems estático */}
                        {filteredItems.map((item) => (
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
                        {/* Mostramos el nombre real del usuario */}
                        <span>{user ? user.nom_usu : 'Usuario Conectado'}</span> 
                        <span className="sidebar-icon">👤</span>
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