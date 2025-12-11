import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage.jsx';
import MenuPage from './components/MenuPage.jsx';

function App() {
  return (
    <Routes>
     
      <Route path="/" element={<LoginPage />} />
      <Route path="/menu" element={<MenuPage />} />
    </Routes>
  );
}

export default App;
