import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';

// 1. IMPORTAMOS LOS ICONOS DE REACT-ICONS
import { 
    FaCalendarCheck,      // Reservas
    FaUsers,              // Huéspedes
    FaBed,                // Habitaciones
    FaUserTie,            // Empleados
    FaFileInvoiceDollar,  // Facturación
    FaUserCog,            // Usuarios (Admin)
    FaUserCircle,         // Perfil
    FaHotel,              // Empresa
    FaSignOutAlt,         // Salir
    FaBars                // Menú Hamburguesa
} from 'react-icons/fa';

// Importaciones de tus componentes
import HuespedesForm from './Huespedes.jsx'; 
import EmployeesForm from './Employees/Employees'; 
import EmpresaForm from './Empresa';
import Habitaciones from './Habitaciones';
import Reservas from './Reservas';
import Facturacion from './Facturacion';
import UsuariosForm from './Usuarios'; 

import logoHotel from '../assets/LogoHotel.jpg';
import './MenuPage.css'; 

// 2. ACTUALIZAMOS LA LISTA CON COMPONENTES DE ICONOS
const allSidebarItems = [
    { id: 'reservas', name: 'Reservas', icon: <FaCalendarCheck /> },
    { id: 'huespedes', name: 'Huéspedes', icon: <FaUsers /> },
    { id: 'habitaciones', name: 'Habitaciones', icon: <FaBed /> },
    { id: 'empleados', name: 'Empleados', icon: <FaUserTie /> },   
    { id: 'facturacion', name: 'Facturación', icon: <FaFileInvoiceDollar /> },
    { id: 'usuarios', name: 'Usuarios', icon: <FaUserCog /> },
    { id: 'perfil', name: 'Perfil', icon: <FaUserCircle /> },
    { id: 'empresa', name: 'Empresa', icon: <FaHotel /> },
];

function MenuPage() {
    const [currentView, setCurrentView] = useState('dashboard'); 
    const [user, setUser] = useState(null); 
    const [filteredItems, setFilteredItems] = useState([]); 
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            const role = parsedUser.tipo_usu; 

            const items = allSidebarItems.filter(item => {
                if (role === 1) return true;
                if (item.id === 'usuarios' || item.id === 'empleados') return false; 
                return true; 
            });
            setFilteredItems(items);
            
            // Si la vista actual no está permitida, redirigir a una segura (o dashboard)
            if (!items.some(item => item.id === currentView) && currentView !== 'dashboard') {
                setCurrentView('reservas');
            }
        } else {
            navigate('/');
        }
    }, [navigate, currentView]);

    const renderContentView = () => {
        switch (currentView) {
            case 'reservas': return <Reservas />;
            case 'huespedes': return <HuespedesForm />; 
            case 'empleados': return user?.tipo_usu === 1 ? <EmployeesForm /> : null; 
            case 'empresa': return <EmpresaForm/>;   
            case 'habitaciones': return <Habitaciones/>;
            case 'facturacion': return <Facturacion/>;
            case 'usuarios': return user?.tipo_usu === 1 ? <UsuariosForm /> : <div><h3>Acceso Denegado</h3></div>;
            case 'perfil': return <div><h3>Perfil de Usuario</h3><p>Nombre: {user?.nom_usu}</p></div>;
            
            // 3. MANTENEMOS TU PANTALLA DE BIENVENIDA CORRECTA
            default: return (
                <div className="welcome-container">
                    <h2>Bienvenido al Sistema Hotelero Clementina</h2>
                    <p>Seleccione una opción del menú para comenzar.</p>
                </div>
            );
        }
    };

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
        setIsMobileMenuOpen(false);
    };

    const confirmLogout = () => {
        localStorage.removeItem('user');
        setShowLogoutConfirm(false);
        navigate('/'); 
    };

    const cancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    
    const handleMenuClick = (id) => {
        setCurrentView(id);
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="dashboard-layout">
            
            <div 
                className={`overlay ${isMobileMenuOpen ? 'show' : ''}`} 
                onClick={() => setIsMobileMenuOpen(false)}
            ></div>

            {/* Modal de Confirmación */}
            {showLogoutConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>¿Cerrar Sesión?</h3>
                        <p>¿Estás seguro que deseas salir del sistema?</p>
                        <div className="modal-buttons">
                            <button className="btn-cancel" onClick={cancelLogout}>Cancelar</button>
                            <button className="btn-confirm" onClick={confirmLogout}>Sí, salir</button>
                        </div>
                    </div>
                </div>
            )}

            <div className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <img src={logoHotel} alt="Logo" className="sidebar-logo" /> 
                    <h2 className="sidebar-title">HOTEL CLEMENTINA</h2>
                </div>
                
                <nav className="sidebar-nav">
                    <ul>
                        {filteredItems.map((item) => (
                            <li 
                                key={item.id}
                                className={currentView === item.id ? 'active' : ''}
                                onClick={() => handleMenuClick(item.id)}
                            >
                                {/* Aquí se renderiza el Icono de React-Icons */}
                                <span className="sidebar-icon">{item.icon}</span> 
                                {item.name}
                            </li>
                        ))}
                        
                        <li onClick={handleLogoutClick} className="logout-button">
                            {/* Icono de Salida actualizado */}
                            <span className="sidebar-icon"><FaSignOutAlt /></span> 
                            Cerrar Sesión
                        </li>
                    </ul>
                </nav>
            </div>
            
            <div className="main-content">
                <header className="main-header">
                    {/* Botón Hamburguesa actualizado */}
                    <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
                        <FaBars />
                    </button>

                    <div className="user-info">
                        <span>{user ? user.nom_usu : 'Usuario'}</span> 
                        {/* Icono de Usuario (Perfil pequeño) */}
                        <span className="sidebar-icon" style={{marginLeft: '10px'}}><FaUserCircle /></span>
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