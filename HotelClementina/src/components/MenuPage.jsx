import React from 'react';

// Estilos simples para centrar el mensaje
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    fontFamily: 'sans-serif',
    backgroundColor: '#f4f4f4',
  },
  title: {
    fontSize: '3rem',
    color: '#333',
  },
  subtitle: {
    fontSize: '1.5rem',
    color: '#555',
  }
};

function MenuPage() {
  // Opcional: Podrías leer el nombre del usuario del localStorage si lo guardaste
  // const user = JSON.parse(localStorage.getItem('user'));
  // const nombreUsuario = user ? user.nom_usu : 'Usuario';

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>¡Bienvenido al Sistema!</h1>
      <p style={styles.subtitle}>
        Aquí se mostrará el menú principal de gestión del Hotel Clementina.
      </p>
      {/* <p>Usuario conectado: {nombreUsuario}</p> */}
    </div>
  );
}

export default MenuPage;