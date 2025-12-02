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
// 5. Endpoint de Login
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
// 6. Endpoint para Registrar Empleados 
// ------------------------------------------------------------------
app.post('/api/empleados', async (req, res) => {
    const { 
        Nom_Emp, Ape_Emp, Fch_Nacim, Sex_Emp, Tel_Emp, 
        Fec_Ini_Emp, Cor_Emp, Dir_Emp, Cod_Cargo, Sueldo_Emp, 
        Seguro, HabDesEmp
    } = req.body;

    if (!Nom_Emp || !Ape_Emp || !Cor_Emp || Sueldo_Emp === undefined || Cod_Cargo === undefined) {
        return res.status(400).json({ success: false, message: 'Faltan campos requeridos: Nombre, Apellido, Correo, Sueldo y Cargo.' });
    }

    const Cod_Emp = `EMP-${Date.now().toString().slice(-6)}`; 

    const sql = `
INSERT INTO empleados 
(Cod_Emp, Nom_Emp, Ape_Emp, Fch_Nacim, Sex_Emp, Tel_Emp, Fec_Ini_Emp, Cor_Emp, Dir_Emp, Cod_Cargo, Sueldo_Emp, Seguro, HabDesEmp) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;
    
    const values = [
        Cod_Emp, Nom_Emp, Ape_Emp, Fch_Nacim, Sex_Emp, Tel_Emp, 
        Fec_Ini_Emp, Cor_Emp, Dir_Emp, Cod_Cargo, Sueldo_Emp, 
        Seguro, HabDesEmp
    ];

    try {
        const [result] = await pool.query(sql, values); 

        res.status(201).json({ 
            success: true,
            message: 'Empleado registrado con éxito', 
            Cod_Emp_Ingresado: Cod_Emp 
        });

    } catch (error) {
        console.error('Error al insertar empleado en la base de datos:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error interno del servidor al registrar empleado.', 
            sqlError: error.sqlMessage || error.message 
        });
    }
});

// ------------------------------------------------------------------
// 7. Endpoint para Empresa
// ------------------------------------------------------------------
/**
 * Endpoint NUEVO: Obtiene la lista de Códigos y Nombres de Empresas.
 */
app.get('/api/empresas-lista', async (req, res) => {
    try {
        // CORREGIDO: Consulta en una sola línea.
        const sql = `SELECT Cod_Emp, Nom_Emp FROM Empresa ORDER BY Nom_Emp ASC`;

        const [rows] = await pool.query(sql);
        
        res.json({ success: true, data: rows }); 

    } catch (error) {
        console.error('Error al obtener la lista de empresas:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor al obtener lista de empresas.' });
    }
});


app.get('/api/empresa', async (req, res) => {
  // Consulta en una sola línea.
  const sql = "SELECT * FROM Empresa WHERE id_empresa = 1"; 

  try {
    const [rows] = await pool.query(sql);
    if (rows.length > 0) {
      res.json({ success: true, data: rows[0] });
    } else {
      res.status(404).json({ success: false, message: 'No se encontraron datos de la empresa.' });
    }
  } catch (error) {
    console.error('Error al obtener datos de la empresa:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});

app.post('/api/empresa', async (req, res) => {
    const { Cod_Emp, Nom_Emp } = req.body;

    if (!Cod_Emp || !Nom_Emp) {
        return res.status(400).json({ success: false, message: 'Faltan campos requeridos: Código (RTN) y Nombre.' });
    }

    const sql = `
INSERT INTO Empresa (Cod_Emp, Nom_Emp) 
VALUES (?, ?)
`;
    
    const values = [Cod_Emp, Nom_Emp];

    try {
        const [result] = await pool.query(sql, values); 

        res.status(201).json({ 
            success: true,
            message: 'Empresa registrada con éxito', 
            Cod_Emp_Ingresado: Cod_Emp 
        });

    } catch (error) {
        console.error('Error al insertar empresa en la base de datos:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ 
                success: false,
                message: 'Error: El Código (RTN) de esa empresa ya existe en la base de datos.'
            });
        }
        
        res.status(500).json({ 
            success: false,
            message: 'Error interno del servidor al registrar empresa.', 
            sqlError: error.sqlMessage || error.message
        });
    }
});

// ------------------------------------------------------------------
// 8. ENDPOINTS DE CLIENTES / HUÉSPEDES
// ------------------------------------------------------------------

/**
 * Endpoint para obtener la lista básica de Clientes (para Select)
 */
app.get('/api/clientes-lista', async (req, res) => {
    try {
        // CORREGIDO: Consulta en una sola línea.
        const sql = `SELECT Cod_Cli, Nom_Cli FROM clientes ORDER BY Nom_Cli ASC`;

        const [rows] = await pool.query(sql);
        
        res.json({ success: true, data: rows }); 

    } catch (error) {
        console.error('Error al obtener la lista de clientes:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor al obtener lista de clientes.' });
    }
});


/**
 * Endpoint para obtener DETALLES de un Cliente por Cod_Cli
 */
app.get('/api/cliente/:codCli', async (req, res) => {
    const { codCli } = req.params; 
    
    try {
        // CORREGIDO: Consulta en una sola línea.
        const sql = `SELECT Cod_Cli, Nom_Cli, Tel1_Huesped, Nacionalidad, Procedencia FROM clientes WHERE Cod_Cli = ?`;

        const [rows] = await pool.query(sql, [codCli]);
        
        if (rows.length > 0) {
            res.json({ success: true, data: rows[0] });
        } else {
            res.status(404).json({ success: false, message: 'Cliente no encontrado.' });
        }

    } catch (error) {
        console.error('Error al obtener los detalles del cliente:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

/**
 * Endpoint para Registrar HUÉSPEDES
 */
app.post('/api/huespedes', async (req, res) => {
    const { 
        Cod_Cli, Tipo_Cli, Nom_Cli, Tel1_Huesped, Tel2_Huesped, 
        Tel3_Huesped, Email_Huesped, Empresa_Huesped, Nacionalidad, 
        Procedencia, Observaciones
    } = req.body;

    if (!Nom_Cli || !Tel1_Huesped) {
        return res.status(400).json({ success: false, message: 'Faltan campos requeridos: Nombre y Teléfono Principal.' });
    }
    
    const sql = `
INSERT INTO clientes 
(Cod_Cli, Tipo_Cli, Nom_Cli, Tel1_Huesped, Tel2_Huesped, Tel3_Huesped, Email_Huesped, Empresa_Huesped, Nacionalidad, Procedencia, Observaciones) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

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
            Cod_Cli_Ingresado: Cod_Cli
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

// ==================================================================
// MÓDULO DE GESTIÓN HOTELERA (Habitaciones, Reservas, Caja)
// ==================================================================

// 1. ENDPOINT MAESTRO: Obtener Tablero de Habitaciones
app.get('/api/habitaciones', async (req, res) => {
  try {
    // CORREGIDO: Consulta en una sola línea para evitar ER_PARSE_ERROR por indentación
    const sql = `SELECT h.Cod_Hab, h.Est_Hab, t.Tipo_Hab, t.Precio_Hab, r.Cod_Res, r.Fec_Ini_Res, r.Fec_Fin_Res, c.Nom_Cli, c.Cod_Cli FROM Habitaciones h INNER JOIN Habitaciones_Tipo t ON h.Cod_Tipo_Hab = t.Cod_Tipo_Hab LEFT JOIN Reserva r ON h.Cod_Hab = r.Cod_Hab AND r.Cod_Est = 2 LEFT JOIN Clientes c ON r.Cod_Cli = c.Cod_Cli ORDER BY h.Cod_Hab ASC`;

    const [rows] = await pool.query(sql);
    res.json({ success: true, data: rows });

  } catch (error) {
    console.error('Error al obtener habitaciones:', error);
    res.status(500).json({ success: false, message: 'Error de servidor' });
  }
});

// 2. ENDPOINT: NUEVA RESERVA (Check-In)
app.post('/api/reservar', async (req, res) => {
  const { Cod_Hab, Cod_Cli, Fec_Ini, Fec_Fin, Cod_Usu } = req.body; 
  
  // A. Generar ID único para la reserva
  const Cod_Res = Math.floor(Date.now() / 1000); 

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction(); // Iniciar Transacción Segura

    // 1. Validar que la habitación siga libre (Evitar doble venta)
    const [check] = await connection.query('SELECT Est_Hab FROM Habitaciones WHERE Cod_Hab = ?', [Cod_Hab]);
    if (check[0].Est_Hab !== 1) {
      throw new Error("La habitación ya no está disponible.");
    }

    // 2. Obtener el precio actual de la habitación
    const [tipo] = await connection.query(
      'SELECT t.Precio_Hab FROM Habitaciones h JOIN Habitaciones_Tipo t ON h.Cod_Tipo_Hab = t.Cod_Tipo_Hab WHERE h.Cod_Hab = ?', 
      [Cod_Hab]
    );
    const Precio_Pactado = tipo[0].Precio_Hab;

    // 3. Insertar la Reserva 
    const sqlInsert = `
INSERT INTO Reserva (
    Cod_Res, Fec_Ini_Res, Fec_Fin_Res, Cod_Hab, Cod_Cli, 
    Nom_Usu, Precio_Unitario, Descuento, Recargo, 
    Pagado_NoPagado, Hora_Entrada, Hora_Salida, Cod_Est, TipoPago
)
VALUES (
    ?, ?, ?, ?, ?, 
    ?, ?, 0, 0, 
    0, CURTIME(), '12:00:00', 2, NULL
)
`;
    
    // Parámetros: ID, Fecha Inicio, Fecha Fin, Habitación, Cliente, Usuario, Precio
    await connection.query(sqlInsert, [
      Cod_Res, Fec_Ini, Fec_Fin, Cod_Hab, Cod_Cli, 
      Cod_Usu || 'Admin', Precio_Pactado
    ]);

    // 4. Cambiar Semáforo a ROJO (Ocupado = 2) en tabla Habitaciones
    await connection.query('UPDATE Habitaciones SET Est_Hab = 2 WHERE Cod_Hab = ?', [Cod_Hab]);

    await connection.commit(); // Guardar cambios definitivamente
    res.json({ success: true, message: 'Reserva creada exitosamente' });

  } catch (error) {
    await connection.rollback(); // Cancelar todo si algo falla
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Error al reservar' });
  } finally {
    connection.release();
  }
});

// 3. ENDPOINT: FACTURAR Y SALIDA (Check-Out)
app.post('/api/facturar', async (req, res) => {
  const { Cod_Res, Cod_Hab, Total_Pagar, Cod_Cli, TipoPago, EstadiaDias, Cod_Usu } = req.body;
  
  const Cod_Fact = Math.floor(Date.now() / 1000); // Generar ID Factura único

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Validación para asegurar que el Cod_Usu existe antes de insertarlo
    if (!Cod_Usu) {
        throw new Error("El Código de Usuario que realiza la facturación es requerido.");
    }

    // 1. Guardar Encabezado de Factura (Tabla: Factura)
    // Se inserta el Cod_Usu recibido desde el frontend
    await connection.query(`
INSERT INTO Factura (Cod_Fact, Fch_Fact, Cod_Cli, Cod_Usu)
VALUES (?, DATE_FORMAT(NOW(), '%Y-%m-%d'), ?, ?)
`, [Cod_Fact, Cod_Cli, Cod_Usu]);

    // 2. Guardar el Detalle (Tabla: Factura_Detalle)
    await connection.query(`
INSERT INTO Factura_Detalle (Cod_Fact, Cod_Hab, EstadiaHot, Recargo_Fact, Total_Unit)
VALUES (?, ?, ?, 0, ?)
`, [Cod_Fact, Cod_Hab, EstadiaDias || 1, Total_Pagar]);

    // 3. Cerrar la Reserva (Tabla: Reserva)
    await connection.query(`
UPDATE Reserva 
SET Cod_Est = 1, 
    Pagado_NoPagado = 1, 
    TipoPago = ? 
WHERE Cod_Res = ?
`, [TipoPago, Cod_Res]);

    // 4. Cambiar Semáforo a AZUL (Limpieza = 3) en tabla Habitaciones
    await connection.query('UPDATE Habitaciones SET Est_Hab = 3 WHERE Cod_Hab = ?', [Cod_Hab]);

    await connection.commit();
    res.json({ success: true, message: 'Pago registrado y habitación en limpieza.' });

  } catch (error) {
    await connection.rollback();
    console.error('Error durante la facturación:', error);
    // Si falla la Foreign Key (1452), se da un mensaje específico.
    if (error.errno === 1452) {
        return res.status(500).json({ success: false, message: `Error: El Código de Usuario '${Cod_Usu}' no existe en la tabla 'usuarios'.` });
    }
    res.status(500).json({ success: false, message: error.message || 'Error al facturar' });
  } finally {
    connection.release();
  }
});

// 4. ENDPOINT: CONFIRMAR LIMPIEZA
app.post('/api/habitacion/liberar', async (req, res) => {
    const { Cod_Hab } = req.body;
    try {
        // Cambiar Semáforo a VERDE (Disponible = 1)
        await pool.query('UPDATE Habitaciones SET Est_Hab = 1 WHERE Cod_Hab = ?', [Cod_Hab]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});


// ------------------------------------------------------------------
// 9. Iniciar el servidor
// ------------------------------------------------------------------
app.listen(port, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${port}`);
});