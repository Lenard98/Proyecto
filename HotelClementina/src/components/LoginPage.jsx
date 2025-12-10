import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 

// Importamos los íconos del ojo
import { FaEye, FaEyeSlash } from 'react-icons/fa';

import './LoginPage.css'; 
import logoHotel from '../assets/LogoHotel.jpg';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3002/api/login', {
        username: username,
        password: password
      });

      setLoading(false);
      
      localStorage.setItem('user', JSON.stringify(response.data.user));
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        
        {/* Logo sin recortar */}
        <img src={logoHotel} alt="Logo Hotel Clementina" className="login-logo" />

        <h2>Inicio de Sesión</h2>

        <form onSubmit={handleSubmit} className="login-form">
          
          <div className="input-group">
            <input
              type="text"
              placeholder="Usuario"
              className="login-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"} 
              placeholder="Contraseña"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            <span 
                className="password-toggle-icon" 
                onClick={togglePasswordVisibility}
            >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Cargando...' : 'Ingresar'}
          </button>
        </form>
        
        {error && <p className="login-error">{error}</p>}
      </div>
    </div>
  );
}

export default LoginPage;