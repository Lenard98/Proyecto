// backend/server.js

// 1. Importar dependencias
require('dotenv').config(); // Carga las variables de .env
const express = require('express');
const mysql = require('mysql2/promise'); // Usamos la versión con promesas
const cors = require('cors');

// 2. Configuración inicial
const app = express();
const port = process.env.PORT || 3002;

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

// ------------------------------------------------------------------
// 5. Endpoint de Login (CÓDIGO ORIGINAL)
// ------------------------------------------------------------------
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Usuario y contraseña son requeridos' });
  }

  try {
    const [validationRows] = await pool.query('CALL ProUsuarios(?, ?)', [username, password]);

    if (validationRows[0] && validationRows[0].length > 0) {
      const [detailsRows] = await pool.query('CALL ProTipoUsuarios(?)', [username]);

      if (detailsRows[0] && detailsRows[0].length > 0) {
        const user = detailsRows[0][0]; 
        
        res.json({ 
          success: true, 
          message: 'Login exitoso', 
          user: {
            cod_usu: user.Cod_Usu,
            nom_usu: user.Nom_Usu,
            tipo_usu: user.Tipo_Usu
          }
        });
      } else {
        res.status(404).json({ success: false, message: 'Usuario validado pero no encontrado' });
      }

    } else {
      res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
    }

  } catch (error) {
    console.error('Error en el endpoint de login:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// ------------------------------------------------------------------
// 6. Endpoint para Registrar Empleados (CON CORRECCIÓN DE Cod_Emp)
// ------------------------------------------------------------------
app.post('/api/empleados', async (req, res) => {
    // Los datos del formulario de React
    const { 
        Nom_Emp, Ape_Emp, Fch_Nacim, Sex_Emp, Tel_Emp, 
        Fec_Ini_Emp, Cor_Emp, Dir_Emp, Cod_Cargo, Sueldo_Emp, 
        Seguro, HabDesEmp
    } = req.body;

    // Validación básica
    if (!Nom_Emp || !Ape_Emp || !Cor_Emp || Sueldo_Emp === undefined || Cod_Cargo === undefined) {
        return res.status(400).json({ success: false, message: 'Faltan campos requeridos: Nombre, Apellido, Correo, Sueldo y Cargo.' });
    }

    // Solución al error 'ER_NO_DEFAULT_FOR_FIELD': Generar un valor para Cod_Emp
    // Usamos el timestamp para crear un código alfanumérico único.
    const Cod_Emp = `EMP-${Date.now().toString().slice(-6)}`; 

    // Sentencia SQL: AHORA INCLUYE Cod_Emp
    const sql = `
        INSERT INTO empleados 
        (Cod_Emp, Nom_Emp, Ape_Emp, Fch_Nacim, Sex_Emp, Tel_Emp, Fec_Ini_Emp, Cor_Emp, Dir_Emp, Cod_Cargo, Sueldo_Emp, Seguro, HabDesEmp) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    // Array de valores: AHORA INCLUYE Cod_Emp como primer valor
    const values = [
        Cod_Emp, Nom_Emp, Ape_Emp, Fch_Nacim, Sex_Emp, Tel_Emp, 
        Fec_Ini_Emp, Cor_Emp, Dir_Emp, Cod_Cargo, Sueldo_Emp, 
        Seguro, HabDesEmp
    ];

    try {
        const [result] = await pool.query(sql, values); 

        // Respuesta exitosa
        res.status(201).json({ 
            success: true,
            message: 'Empleado registrado con éxito', 
            // Se envía el código generado para confirmar
            Cod_Emp_Generado: Cod_Emp 
        });

    } catch (error) {
        console.error('Error al insertar empleado en la base de datos:', error);
        // Enviamos el mensaje de error de MySQL para facilitar la depuración
        res.status(500).json({ 
            success: false,
            message: 'Error interno del servidor al registrar empleado.', 
            sqlError: error.sqlMessage || error.message // Incluye el error específico de MySQL
        });
    }
});

// ------------------------------------------------------------------
// 7. Endpoint para OBTENER los datos de la Empresa
// ------------------------------------------------------------------
app.get('/api/empresa', async (req, res) => {
  // Siempre buscamos el ID 1, ya que solo hay una empresa
  const sql = "SELECT * FROM Empresa WHERE id_empresa = 1"; 

  try {
    const [rows] = await pool.query(sql);
    if (rows.length > 0) {
      res.json({ success: true, data: rows[0] });
    } else {
      // Esto pasaría si la tabla está vacía (el script SQL lo previene)
      res.status(404).json({ success: false, message: 'No se encontraron datos de la empresa.' });
    }
  } catch (error) {
    console.error('Error al obtener datos de la empresa:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});

// ------------------------------------------------------------------
// 7. Endpoint para Registrar Empresa (NUEVO - Actualizado)
// ------------------------------------------------------------------
app.post('/api/empresa', async (req, res) => {
    // Leemos AMBOS campos del formulario
    const { Cod_Emp, Nom_Emp } = req.body;

    // Validación básica
    if (!Cod_Emp || !Nom_Emp) {
        return res.status(400).json({ success: false, message: 'Faltan campos requeridos: Código (RTN) y Nombre.' });
    }

    // Sentencia SQL (Usa los datos del formulario)
    const sql = `
        INSERT INTO Empresa (Cod_Emp, Nom_Emp) 
        VALUES (?, ?)
    `;
    
    // Array de valores (Usa los datos del formulario)
    const values = [Cod_Emp, Nom_Emp];

    try {
        const [result] = await pool.query(sql, values); 

        // Respuesta exitosa
        res.status(201).json({ 
            success: true,
            message: 'Empresa registrada con éxito', 
            Cod_Emp_Ingresado: Cod_Emp 
        });

    } catch (error) {
        console.error('Error al insertar empresa en la base de datos:', error);
        
        // Manejo de error de llave duplicada (si el RTN ya existe)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ // 409 Conflict
                success: false,
                message: 'Error: El Código (RTN) de esa empresa ya existe en la base de datos.'
            });
        }
        
        // Otro error
        res.status(500).json({ 
            success: false,
            message: 'Error interno del servidor al registrar empresa.', 
            sqlError: error.sqlMessage || error.message
        });
    }
});

// backend/server.js

// ... (El código de login y empleados se mantiene igual)

// ------------------------------------------------------------------
// NUEVO ENDPOINT para Registrar HUÉSPEDES (TABLA CLIENTES)
// ------------------------------------------------------------------
app.post('/api/huespedes', async (req, res) => {
    // 💡 IMPORTANTE: Los nombres de las variables deben coincidir con el 'name' 
    // en los inputs de Huespedes.jsx (y las columnas de la tabla clientes).
    const { 
        Cod_Cli, Tipo_Cli, Nom_Cli, Tel1_Huesped, Tel2_Huesped, 
        Tel3_Huesped, Email_Huesped, Empresa_Huesped, Nacionalidad, 
        Procedencia, Observaciones
    } = req.body;

    // Validación básica de campos requeridos (Nom_Cli y Tel1_Huesped son los más críticos)
    if (!Nom_Cli || !Tel1_Huesped) {
        return res.status(400).json({ success: false, message: 'Faltan campos requeridos: Nombre y Teléfono Principal.' });
    }

    // 💡 NOTA: Usaremos el Cod_Cli generado en el Frontend para simplificar el proceso.
    
    // Sentencia SQL: Asegura que la tabla y columnas sean las de la BD (clientes)
    const sql = `
        INSERT INTO clientes 
        (Cod_Cli, Tipo_Cli, Nom_Cli, Tel1_Huesped, Tel2_Huesped, Tel3_Huesped, Email_Huesped, Empresa_Huesped, Nacionalidad, Procedencia, Observaciones) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    // Array de valores: Debe coincidir EXACTAMENTE con el orden del SQL de arriba
    const values = [
        Cod_Cli, 
        Tipo_Cli, 
        Nom_Cli, 
        Tel1_Huesped, 
        Tel2_Huesped, 
        Tel3_Huesped, 
        Email_Huesped, 
        Empresa_Huesped, 
        Nacionalidad, 
        Procedencia, 
        Observaciones
    ];

    try {
        const [result] = await pool.query(sql, values); 

        res.status(201).json({ 
            success: true,
            message: 'Huésped registrado con éxito', 
            Cod_Cli_Ingresado: Cod_Cli // Devuelve el código ingresado para confirmación
        });

    } catch (error) {
        console.error('Error al insertar huésped en la base de datos:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error interno del servidor al registrar huésped.', 
            sqlError: error.sqlMessage || error.message
        });
    }
});

// ------------------------------------------------------------------
// 8. Endpoint para Registrar Empresa (NUEVO - Actualizado)
// ------------------------------------------------------------------
app.post('/api/empresa', async (req, res) => {
    // Leemos AMBOS campos del formulario
    const { Cod_Emp, Nom_Emp } = req.body;

    // Validación básica
    if (!Cod_Emp || !Nom_Emp) {
        return res.status(400).json({ success: false, message: 'Faltan campos requeridos: Código (RTN) y Nombre.' });
    }

    // Sentencia SQL (Usa los datos del formulario)
    const sql = `
        INSERT INTO Empresa (Cod_Emp, Nom_Emp) 
        VALUES (?, ?)
    `;
    
    // Array de valores (Usa los datos del formulario)
    const values = [Cod_Emp, Nom_Emp];

    try {
        const [result] = await pool.query(sql, values); 

        // Respuesta exitosa
        res.status(201).json({ 
            success: true,
            message: 'Empresa registrada con éxito', 
            Cod_Emp_Ingresado: Cod_Emp 
        });

    } catch (error) {
        console.error('Error al insertar empresa en la base de datos:', error);
        
        // Manejo de error de llave duplicada (si el RTN ya existe)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ // 409 Conflict
                success: false,
                message: 'Error: El Código (RTN) de esa empresa ya existe en la base de datos.'
            });
        }
        
        // Otro error
        res.status(500).json({ 
            success: false,
            message: 'Error interno del servidor al registrar empresa.', 
            sqlError: error.sqlMessage || error.message
        });
    }
});


// ------------------------------------------------------------------
// 9. Iniciar el servidor
// ------------------------------------------------------------------
app.listen(port, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${port}`);
});