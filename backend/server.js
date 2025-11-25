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

app.post('/api/huespedes', async (req, res) => {
    // Datos enviados desde el frontend (Huespedes.jsx)
    const { 
        Nom_Hues, Ape_Hues, Fch_Nacim, Tel_Hues, Cor_Hues, Dir_Hues, 
        Pais_Hues, HabDesHues, Tipo_Documento, Num_Documento 
    } = req.body;

    // Validación básica
    if (!Nom_Hues || !Ape_Hues || !Num_Documento) {
        return res.status(400).json({ success: false, message: 'Faltan campos requeridos: Nombre, Apellido y Número de Documento.' });
    }

    // 💡 GENERACIÓN DEL CÓDIGO ÚNICO (igual que Empleados)
    const Cod_Hues = `HUES-${Date.now().toString().slice(-6)}`; 

    const sql = `
        INSERT INTO huespedes 
        (Cod_Hues, Nom_Hues, Ape_Hues, Fch_Nacim, Tel_Hues, Cor_Hues, Dir_Hues, Pais_Hues, HabDesHues, Tipo_Documento, Num_Documento) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
        Cod_Hues, Nom_Hues, Ape_Hues, Fch_Nacim, Tel_Hues, Cor_Hues, Dir_Hues, 
        Pais_Hues, HabDesHues, Tipo_Documento, Num_Documento
    ];

    try {
        const [result] = await pool.query(sql, values); 

        res.status(201).json({ 
            success: true,
            message: 'Huésped registrado con éxito', 
            Cod_Hues_Generado: Cod_Hues
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

// ==================================================================
// MÓDULO DE GESTIÓN HOTELERA (Habitaciones, Reservas, Caja)
// ==================================================================

// 1. ENDPOINT MAESTRO: Obtener Tablero de Habitaciones
// Sirve para: El Monitor Visual, el Select de Reservas y el Select de Facturación.
// Explicación: Une 4 tablas para saber si la habitación está libre, ocupada o sucia,
// y si está ocupada, nos dice quién es el cliente y cuándo entró.
app.get('/api/habitaciones', async (req, res) => {
  try {
    const sql = `
      SELECT 
        h.Cod_Hab, 
        h.Est_Hab,          -- 1:Libre, 2:Ocupado, 3:Limpieza, 4:Mantenimiento
        t.Tipo_Hab, 
        t.Precio_Hab,
        r.Cod_Res,          -- ID Reserva (solo si está ocupada)
        r.Fec_Ini_Res,      -- Fecha Entrada (para calcular días)
        r.Fec_Fin_Res,      -- Fecha Salida Prevista
        c.Nom_Cli,          -- Nombre Cliente
        c.Cod_Cli
      FROM Habitaciones h
      INNER JOIN Habitaciones_Tipo t ON h.Cod_Tipo_Hab = t.Cod_Tipo_Hab
      -- Unimos solo con reservas ACTIVAS (Estado 2) para ver quién la ocupa hoy
      LEFT JOIN Reserva r ON h.Cod_Hab = r.Cod_Hab AND r.Cod_Est = 2 
      LEFT JOIN Clientes c ON r.Cod_Cli = c.Cod_Cli
      ORDER BY h.Cod_Hab ASC
    `;

    const [rows] = await pool.query(sql);
    res.json({ success: true, data: rows });

  } catch (error) {
    console.error('Error al obtener habitaciones:', error);
    res.status(500).json({ success: false, message: 'Error de servidor' });
  }
});

// 2. ENDPOINT: NUEVA RESERVA (Check-In)
// Recibe: { Cod_Hab, Cod_Cli, Fec_Ini, Fec_Fin, Cod_Usu }
// Explicación: Bloquea la habitación y crea el registro oficial de ingreso.
app.post('/api/reservar', async (req, res) => {
  const { Cod_Hab, Cod_Cli, Fec_Ini, Fec_Fin, Cod_Usu } = req.body;
  
  // A. Generar ID único para la reserva (Usamos timestamp para evitar duplicados)
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

    // 3. Insertar la Reserva (LLENANDO TODOS LOS CAMPOS DE TU BD)
    // Nota: Llenamos Hora_Entrada, Hora_Salida, Descuento y Recargo para evitar errores SQL.
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
// Recibe: { Cod_Res, Cod_Hab, Total_Pagar, Cod_Cli, TipoPago, EstadiaDias }
// Explicación: Genera la factura fiscal, cobra la reserva y manda la habitación a limpieza.
app.post('/api/facturar', async (req, res) => {
  const { Cod_Res, Cod_Hab, Total_Pagar, Cod_Cli, TipoPago, EstadiaDias } = req.body;
  
  const Cod_Fact = Math.floor(Date.now() / 1000); // Generar ID Factura único

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Guardar Encabezado de Factura (Tabla: Factura)
    await connection.query(`
      INSERT INTO Factura (Cod_Fact, Fch_Fact, Cod_Cli, Cod_Usu)
      VALUES (?, DATE_FORMAT(NOW(), '%Y-%m-%d'), ?, 'Admin')
    `, [Cod_Fact, Cod_Cli]);

    // 2. Guardar el Detalle (Tabla: Factura_Detalle)
    // Aquí guardamos cuánto pagó y cuántos días estuvo.
    await connection.query(`
      INSERT INTO Factura_Detalle (Cod_Fact, Cod_Hab, EstadiaHot, Recargo_Fact, Total_Unit)
      VALUES (?, ?, ?, 0, ?)
    `, [Cod_Fact, Cod_Hab, EstadiaDias || 1, Total_Pagar]);

    // 3. Cerrar la Reserva (Tabla: Reserva)
    // Marcamos como PAGADA (1), FINALIZADA (Cod_Est=1) y guardamos si fue Efectivo o Tarjeta.
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
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al facturar' });
  } finally {
    connection.release();
  }
});

// 4. ENDPOINT: CONFIRMAR LIMPIEZA
// Sirve para: El Monitor Visual, cuando housekeeping confirma que la habitación está lista.
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