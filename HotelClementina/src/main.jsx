import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // Asumiendo que tienes este
import { BrowserRouter } from 'react-router-dom'; // 1. Importar

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* 2. Envolver la App */}
      <App />
    </BrowserRouter> {/* 3. Cerrar el envoltorio */}
  </React.StrictMode>,
);