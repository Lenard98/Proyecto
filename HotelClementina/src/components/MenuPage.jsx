import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';

// Importaciones de componentes
import HuespedesForm from './Huespedes.jsx'; 
import EmployeesForm from './Employees/Employees'; 
import EmpresaForm from './Empresa';
import Habitaciones from './Habitaciones';
import Reservas from './Reservas';
import Facturacion from './Facturacion';
import UsuariosForm from './Usuarios'; // ¡Asegúrate de que la ruta sea correcta!

import logoHotel from '../assets/LogoHotel.jpg';
import './MenuPage.css'; 

// Lista COMPLETA de los ítems del sidebar
const allSidebarItems = [
    { id: 'reservas', name: 'Reservas', icon: '🏠' },
    { id: 'huespedes', name: 'Huéspedes', icon: '👥' },
    { id: 'habitaciones', name: 'Habitaciones', icon: '🛏️' },
    { id: 'empleados', name: 'Empleados', icon: '🧑‍💼' },   
    { id: 'facturacion', name: 'Facturación', icon: '🧾' },
    { id: 'usuarios', name: 'Usuarios', icon: '🔑' }, // Opción "Usuarios"
    { id: 'perfil', name: 'Perfil', icon: '👤' },
    { id: 'empresa', name: 'Empresa', icon: '🏢' },
];

function MenuPage() {
    const [currentView, setCurrentView] = useState('dashboard'); 
    const [user, setUser] = useState(null); 
    const [filteredItems, setFilteredItems] = useState([]); 
    
    const navigate = useNavigate();

    // 1. EFECTO DE CARGA: Verificar usuario y definir roles
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            
            const role = parsedUser.tipo_usu; 

            // Lógica de filtrado de menú según roles
            const items = allSidebarItems.filter(item => {
                // ADMINISTRADOR (Rol 1): Ve todo
                if (role === 1) return true;
                
                // RESTO DE ROLES: Solo los Administradores (1) deben ver Usuarios y Empleados (asumiendo tu lógica anterior)
                if (item.id === 'usuarios' || item.id === 'empleados') return false; 

                // Ejemplo de lo que ve Recepcionista (Rol 2, 3, etc. - ajusta según tu base de datos)
                return true; 
            });

            setFilteredItems(items);
            // Si el usuario no tiene permiso para ver la vista por defecto, lo enviamos a Reservas
            if (!items.some(item => item.id === currentView) && currentView !== 'dashboard') {
                setCurrentView('reservas');
            }

        } else {
            navigate('/');
        }
    }, [navigate, currentView]);


    // Renderiza el componente de la vista seleccionada
    const renderContentView = () => {
        switch (currentView) {
            case 'reservas':
                return <Reservas />;
            case 'huespedes': 
                return <HuespedesForm />; 
            case 'empleados':
                // Solo renderiza si tiene permiso (aunque ya se filtró en el menú, es buena práctica)
                return user?.tipo_usu === 1 ? <EmployeesForm /> : null; 
            case 'empresa':
                return <EmpresaForm/>;   
            case 'habitaciones':
                return <Habitaciones/>;
            case 'facturacion':
                return <Facturacion/>;
            case 'usuarios':
                // Solo el Administrador (1) debería ver esto
                return user?.tipo_usu === 1 ? <UsuariosForm /> : <div><h3>Acceso Denegado</h3><p>Solo visible para Administradores.</p></div>;
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

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/'); 
    };

    return (
        <div className="dashboard-layout">
            
            <div className="sidebar">
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
                                onClick={() => setCurrentView(item.id)}
                            >
                                <span className="sidebar-icon">{item.icon}</span> {item.name}
                            </li>
                        ))}
                        
                        <li onClick={handleLogout} className="logout-button">
                            <span className="sidebar-icon">🚪</span> Cerrar Sesión
                        </li>
                    </ul>
                </nav>
            </div>
            
            <div className="main-content">
                <header className="main-header">
                    <div className="user-info">
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