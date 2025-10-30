// 1. Importar dependencias
require('dotenv').config(); // Carga las variables de .env
const express = require('express');
const mysql = require('mysql2/promise'); // Usamos la versión con promesas
const cors = require('cors');

// 2. Configuración inicial
const app = express();
const port = process.env.PORT || 3001;

// 3. Middlewares
app.use(cors()); // Permite peticiones de otros orígenes (tu frontend)
app.use(express.json()); // Permite a Express entender JSON en el body

// 4. Configurar la conexión a la BD
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 5. Crear el Endpoint de Login (¡Aquí está la magia!)
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  // Validar que recibimos datos
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Usuario y contraseña son requeridos' });
  }

  try {
    // 1. Validar las credenciales usando tu Stored Procedure
    // Nota: Usamos 'rows[0]' porque los SP en mysql2 devuelven [rows, fields]
    const [validationRows] = await pool.query('CALL ProUsuarios(?, ?)', [username, password]);

    // ProUsuarios devuelve el usuario si las credenciales son correctas.
    // Verificamos si la consulta devolvió alguna fila.
    if (validationRows[0] && validationRows[0].length > 0) {
      // 2. Si es válido, obtenemos los detalles del usuario (como el tipo)
      // Usamos tu otro SP 'ProTipoUsuarios' que parece perfecto para esto
      const [detailsRows] = await pool.query('CALL ProTipoUsuarios(?)', [username]);

      if (detailsRows[0] && detailsRows[0].length > 0) {
        const user = detailsRows[0][0]; // El primer resultado del SP
        
        // Enviamos una respuesta exitosa con los datos del usuario
        res.json({ 
          success: true, 
          message: 'Login exitoso', 
          user: {
            cod_usu: user.Cod_Usu,
            nom_usu: user.Nom_Usu,
            tipo_usu: user.Tipo_Usu // 1 = Admin, 2 = Invitado (según tu SP)
          }
        });
      } else {
        // Esto no debería pasar si la validación fue exitosa, pero por si acaso
        res.status(404).json({ success: false, message: 'Usuario validado pero no encontrado' });
      }

    } else {
      // Credenciales incorrectas
      res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
    }

  } catch (error) {
    console.error('Error en el endpoint de login:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// 6. Iniciar el servidor
app.listen(port, () => {
  "console.log(🚀 Servidor backend corriendo en http://localhost:${port})";
});