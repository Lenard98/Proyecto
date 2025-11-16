import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage.jsx';
import MenuPage from './components/MenuPage.jsx';


// Borramos el CSS de App.css si no lo vamos a usar
// import './App.css'; 

function App() {
  return (
    // 'Routes' revisará la URL del navegador y mostrará
    // el componente que coincida en 'path'.
    <Routes>
      {/* Ruta 1: La raíz (http://localhost:5173/) */}
      {/* Muestra el componente LoginPage */}
      <Route path="/" element={<LoginPage />} />

      {/* Ruta 2: La página de menú (http://localhost:5173/menu) */}
      {/* Muestra el componente MenuPage */}
      <Route path="/menu" element={<MenuPage />} />
    </Routes>
  );
}

export default App;
