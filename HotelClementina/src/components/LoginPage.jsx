import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 

// Importa tu nuevo archivo CSS
import './LoginPage.css'; 

// Importa tu logo desde la carpeta assets
import logoHotel from '../assets/LogoHotel.jpg';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Inicializar el hook de navegación
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setError('');
    setLoading(true);

    try {
      // Petición al backend
      const response = await axios.post('http://localhost:3002/api/login', {
        username: username,
        password: password
      });

      setLoading(false);
      console.log('Login exitoso:', response.data);
      
      // 1. IMPORTANTE: Guardar datos del usuario (incluido el Rol/Tipo_Usu)
      // Esto es lo que leerá el MenuPage para saber qué mostrar
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // 2. Navegar al menú principal en lugar de mostrar alerta
      navigate('/menu'); 

    } catch (err) {
      setLoading(false);
      if (err.response) {
        setError(err.response.data.message);
      } else {
        setError('No se pudo conectar al servidor');
      }
    }
  };

  return (
    // Estructura del formulario de login
    <div className="login-page">
      <div className="login-container">
        
        {/* Logo del Hotel */}
        <img src={logoHotel} alt="Logo Hotel Clementina" className="login-logo" />

        <h2>Inicio de Sesión</h2>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            placeholder="Usuario (Id_Usu)"
            className="login-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        
        {error && <p className="login-error">{error}</p>}
      </div>
    </div>
  );
}

export default LoginPage;
