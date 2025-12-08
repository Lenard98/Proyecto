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
// 6. ENDPOINTS DE EMPLEADOS
// ------------------------------------------------------------------

/**
 * Endpoint para obtener el Historial Completo de Empleados (GET /api/empleados) 
 */
app.get('/api/empleados', async (req, res) => {
    try {
        const sql = `
            SELECT 
                e.*, 
                c.Tipo_Cargo
            FROM empleados e
            INNER JOIN empleados_cargo c ON e.Cod_Cargo = c.Cod_Cargo
            ORDER BY e.Cod_Emp DESC
        `;
        const [rows] = await pool.query(sql);
        res.json(rows); 
    } catch (error) {
        console.error('Error al obtener el historial de empleados:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor al obtener historial de empleados.',
            sqlError: error.sqlMessage || error.message
        });
    }
});


/**
 * Endpoint para Registrar Empleados (POST) 
 */
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


/**
 * Endpoint: Actualizar Empleado (PUT) - CORREGIDO para manejar campos NOT NULL.
 */
app.put('/api/empleados/:codEmp', async (req, res) => {
    const { codEmp } = req.params;
    const {
        Nom_Emp, Ape_Emp, Fch_Nacim, Sex_Emp, Tel_Emp,
        Fec_Ini_Emp, Cor_Emp, Dir_Emp, Cod_Cargo, Sueldo_Emp,
        Seguro, HabDesEmp
    } = req.body;

    // 1. VALIDACIÓN ESTRICTA (CRÍTICA)
    if (!Nom_Emp || !Ape_Emp || !Cor_Emp || Sueldo_Emp === undefined || Cod_Cargo === undefined) {
        return res.status(400).json({ success: false, message: 'Faltan campos requeridos: Nombre, Apellido, Correo, Sueldo y Cargo.' });
    }

    // 2. NORMALIZACIÓN CRÍTICA: Convertir NULL/undefined a valores seguros.
    // Esto es CLAVE para la edición en línea donde campos NOT NULL pueden no ser visibles.
    
    // Normalización de cadenas (VARCHAR/TEXT NOT NULL) -> Usa cadena vacía si es nulo.
    const normalizedDirEmp = Dir_Emp || ''; 
    const normalizedTelEmp = Tel_Emp || '';
    const normalizedCorEmp = Cor_Emp || ''; 
    
    // Normalización de fechas (DATE NOT NULL) -> Usa una fecha por defecto si es nulo.
    const normalizedFchNacim = Fch_Nacim || '1900-01-01'; 
    const normalizedFecIniEmp = Fec_Ini_Emp || new Date().toISOString().substring(0, 10);
    
    // Normalización de booleanos/enteros (TINYINT NOT NULL) -> Usa 1 (Activo/Masculino) si es nulo.
    const normalizedSexEmp = Sex_Emp === null || Sex_Emp === undefined ? 1 : Sex_Emp; 
    const normalizedHabDesEmp = HabDesEmp === null || HabDesEmp === undefined ? 1 : HabDesEmp;
    
    // Normalización de números (DECIMAL/FLOAT)
    const normalizedSueldoEmp = parseFloat(Sueldo_Emp || 0);
    const normalizedSeguro = parseFloat(Seguro || 0);
    
    // Normalización de Cod_Cargo (Entero NOT NULL)
    const normalizedCodCargo = parseInt(Cod_Cargo);


    const sql = `
        UPDATE empleados SET
            Nom_Emp = ?, Ape_Emp = ?, Fch_Nacim = ?, Sex_Emp = ?, 
            Tel_Emp = ?, Fec_Ini_Emp = ?, Cor_Emp = ?, Dir_Emp = ?, 
            Cod_Cargo = ?, Sueldo_Emp = ?, Seguro = ?, HabDesEmp = ?
        WHERE Cod_Emp = ?
    `;

    const values = [
        Nom_Emp, Ape_Emp, normalizedFchNacim, normalizedSexEmp, normalizedTelEmp,
        normalizedFecIniEmp, normalizedCorEmp, normalizedDirEmp, normalizedCodCargo, normalizedSueldoEmp,
        normalizedSeguro, normalizedHabDesEmp,
        codEmp // WHERE condition
    ];

    try {
        const [result] = await pool.query(sql, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Empleado no encontrado.' });
        }

        res.json({ success: true, message: 'Empleado actualizado con éxito' });

    } catch (error) {
        // Log del error para debugging
        console.error('Error al actualizar empleado en la base de datos:', error);
        
        // Manejo específico si es un error de dato NOT NULL
        if (error.code === 'ER_BAD_NULL_ERROR' || error.code === 'ER_WARN_DATA_OUT_OF_RANGE') {
             return res.status(400).json({
                success: false,
                message: `Error de datos: ${error.sqlMessage || error.message}. Revisa los campos obligatorios.`,
                sqlError: error.sqlMessage || error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al actualizar empleado.',
            sqlError: error.sqlMessage || error.message
        });
    }
});


/**
 * Endpoint: Eliminar Empleado (DELETE) 
 */
app.delete('/api/empleados/:codEmp', async (req, res) => {
    const { codEmp } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM empleados WHERE Cod_Emp = ?', [codEmp]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Empleado no encontrado.' });
        }

        res.json({ success: true, message: 'Empleado eliminado con éxito' });

    } catch (error) {
        console.error('Error al eliminar empleado de la base de datos:', error);
        
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({
                success: false,
                message: 'No se puede eliminar el empleado porque tiene referencias activas en el sistema (ej: usuario, caja).',
                sqlError: error.sqlMessage
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al eliminar empleado.',
            sqlError: error.sqlMessage || error.message
        });
    }
});


// ------------------------------------------------------------------
// 7. ENDPOINTS DE EMPRESAS
// ------------------------------------------------------------------

/**
 * Endpoint: Obtiene la lista de Códigos y Nombres de Empresas (usado para Historial y Selectores).
 */
app.get('/api/empresas-lista', async (req, res) => {
    try {
        const sql = `SELECT Cod_Emp, Nom_Emp FROM Empresa ORDER BY Nom_Emp ASC`;

        const [rows] = await pool.query(sql);

        res.json({ success: true, data: rows });

    } catch (error) {
        console.error('Error al obtener la lista de empresas:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor al obtener lista de empresas.' });
    }
});


app.get('/api/empresa', async (req, res) => {
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


/**
 * Endpoint: Actualizar Empresa (PUT)
 */
app.put('/api/empresa/:codEmp', async (req, res) => {
    const { codEmp } = req.params;
    const { Cod_Emp, Nom_Emp } = req.body; // Se reciben ambos por si se editó el Cod_Emp

    if (!Nom_Emp || !Cod_Emp) {
        return res.status(400).json({ success: false, message: 'El RTN y Nombre de la Empresa son requeridos para actualizar.' });
    }
    
    // Si el Cod_Emp en el body es diferente al Cod_Emp en la URL, se asume que se está cambiando el RTN.
    // La consulta debe usar el Cod_Emp de la URL para el WHERE (el valor original) y el Cod_Emp del body para el SET (el nuevo valor).

    const sql = `
        UPDATE Empresa SET
            Cod_Emp = ?, Nom_Emp = ?
        WHERE Cod_Emp = ?
    `;

    try {
        // Se usan los valores: [Nuevo Cod_Emp, Nuevo Nom_Emp, Cod_Emp Original (de la URL)]
        const [result] = await pool.query(sql, [Cod_Emp, Nom_Emp, codEmp]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Empresa no encontrada.' });
        }

        res.json({ success: true, message: 'Empresa actualizada con éxito' });

    } catch (error) {
        console.error('Error al actualizar empresa en la base de datos:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al actualizar empresa.',
            sqlError: error.sqlMessage || error.message
        });
    }
});

/**
 * Endpoint: Eliminar Empresa (DELETE)
 */
app.delete('/api/empresa/:codEmp', async (req, res) => {
    const { codEmp } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM Empresa WHERE Cod_Emp = ?', [codEmp]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Empresa no encontrada.' });
        }

        res.json({ success: true, message: 'Empresa eliminada con éxito' });

    } catch (error) {
        console.error('Error al eliminar empresa de la base de datos:', error);
        
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({
                success: false,
                message: 'No se puede eliminar la empresa porque está asociada a uno o más huéspedes.',
                sqlError: error.sqlMessage
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al eliminar empresa.',
            sqlError: error.sqlMessage || error.message
        });
    }
});


/**
 * Endpoint: Obtener la lista de Clientes por Cod_Emp
 */
app.get('/api/empresa/clientes/:codEmp', async (req, res) => {
    const { codEmp } = req.params;

    if (!codEmp) {
        return res.status(400).json({ success: false, message: 'El código de empresa (RTN) es requerido.' });
    }

    try {
        const sql = `
            SELECT 
                Cod_Cli, 
                Nom_Cli, 
                Tel1_Huesped, 
                Email_Huesped 
            FROM clientes 
            WHERE Empresa_Huesped = (SELECT Nom_Emp FROM Empresa WHERE Cod_Emp = ?)
            ORDER BY Nom_Cli ASC
        `;

        const [rows] = await pool.query(sql, [codEmp]);

        res.json({ success: true, data: rows });

    } catch (error) {
        console.error('Error al obtener clientes por empresa:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor al obtener clientes asociados.',
            sqlError: error.sqlMessage || error.message
        });
    }
});


// ------------------------------------------------------------------
// 8. ENDPOINTS DE CLIENTES / HUÉSPEDES
// ------------------------------------------------------------------

/**
 * Endpoint: Obtener TODOS los Huéspedes (Historial)
 */
app.get('/api/huespedes-historial', async (req, res) => {
    try {
        const sql = `SELECT * FROM clientes ORDER BY Cod_Cli DESC`; 

        const [rows] = await pool.query(sql);

        res.json({ success: true, data: rows });

    } catch (error) {
        console.error('Error al obtener el historial de huéspedes:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor al obtener el historial de huéspedes.',
            sqlError: error.sqlMessage || error.message
        });
    }
});


/**
 * Endpoint para obtener la lista básica de Clientes (para Select)
 */
app.get('/api/clientes-lista', async (req, res) => {
    try {
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

/**
 * Endpoint: Actualizar Huésped (PUT)
 */
app.put('/api/huespedes/:codCli', async (req, res) => {
    const { codCli } = req.params;
    const {
        Tipo_Cli, Nom_Cli, Tel1_Huesped, Tel2_Huesped,
        Tel3_Huesped, Email_Huesped, Empresa_Huesped, Nacionalidad,
        Procedencia, Observaciones
    } = req.body;

    if (!Nom_Cli || !Tel1_Huesped) {
        return res.status(400).json({ success: false, message: 'Faltan campos requeridos: Nombre y Teléfono Principal.' });
    }

    const sql = `
        UPDATE clientes SET
            Tipo_Cli = ?, Nom_Cli = ?, Tel1_Huesped = ?, Tel2_Huesped = ?,
            Tel3_Huesped = ?, Email_Huesped = ?, Empresa_Huesped = ?,
            Nacionalidad = ?, Procedencia = ?, Observaciones = ?
        WHERE Cod_Cli = ?
    `;

    const values = [
        Tipo_Cli, Nom_Cli, Tel1_Huesped, Tel2_Huesped,
        Tel3_Huesped, Email_Huesped, Empresa_Huesped, Nacionalidad,
        Procedencia, Observaciones,
        codCli 
    ];

    try {
        const [result] = await pool.query(sql, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Huésped no encontrado.' });
        }

        res.json({ success: true, message: 'Huésped actualizado con éxito' });

    } catch (error) {
        console.error('Error al actualizar huésped en la base de datos:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al actualizar huésped.',
            sqlError: error.sqlMessage || error.message
        });
    }
});


/**
 * Endpoint: Eliminar Huésped
 */
app.delete('/api/huespedes/:codCli', async (req, res) => {
    const { codCli } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM clientes WHERE Cod_Cli = ?', [codCli]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Huésped no encontrado.' });
        }

        res.json({ success: true, message: 'Huésped eliminado con éxito' });

    } catch (error) {
        console.error('Error al eliminar huésped de la base de datos:', error);
        
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({
                success: false,
                message: 'No se puede eliminar el huésped porque tiene reservas u otras referencias en la base de datos.',
                sqlError: error.sqlMessage
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al eliminar huésped.',
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
        const finalSql = `
SELECT 
    h.Cod_Hab, 
    h.Est_Hab, 
    t.Tipo_Hab, 
    t.Precio_Hab, 
    r.Cod_Res, 
    r.Fec_Ini_Res, 
    r.Fec_Fin_Res, 
    r.Precio_Unitario, 
    r.Pagado_NoPagado, 
    r.Cod_Est, 
    c.Nom_Cli, 
    c.Cod_Cli 
FROM Habitaciones h 
INNER JOIN Habitaciones_Tipo t ON h.Cod_Tipo_Hab = t.Cod_Tipo_Hab 
LEFT JOIN Reserva r ON h.Cod_Hab = r.Cod_Hab AND h.Est_Hab = 2 AND r.Cod_Res = (
    SELECT Cod_Res FROM Reserva 
    WHERE Cod_Hab = h.Cod_Hab 
    ORDER BY Cod_Res DESC 
    LIMIT 1
)
LEFT JOIN Clientes c ON r.Cod_Cli = c.Cod_Cli
ORDER BY h.Cod_Hab ASC
        `;

        const [rows] = await pool.query(finalSql);
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
        await connection.beginTransaction(); 

        // 1. Validar que la habitación siga libre (Evitar doble venta)
        const [check] = await connection.query('SELECT Est_Hab FROM Habitaciones WHERE Cod_Hab = ?', [Cod_Hab]);
        if (check.length === 0 || check[0].Est_Hab !== 1) {
            throw new Error("La habitación no existe o ya no está disponible.");
        }

        // 2. Obtener el precio actual de la habitación
        const [tipo] = await connection.query(
            'SELECT t.Precio_Hab FROM Habitaciones h JOIN Habitaciones_Tipo t ON h.Cod_Tipo_Hab = t.Cod_Tipo_Hab WHERE h.Cod_Hab = ?',
            [Cod_Hab]
        );
        if (tipo.length === 0) {
            throw new Error("No se pudo obtener el precio de la habitación.");
        }
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

        await connection.commit(); 
        res.json({ success: true, message: 'Reserva creada exitosamente' });

    } catch (error) {
        await connection.rollback(); 
        console.error(error);
        res.status(500).json({ success: false, message: error.message || 'Error al reservar' });
    } finally {
        connection.release();
    }
});

// 3. ENDPOINT: FACTURAR Y SALIDA (Check-Out)
app.post('/api/facturar', async (req, res) => {
    const { Cod_Res, Cod_Hab, Total_Pagar, Cod_Cli, TipoPago, EstadiaDias, Cod_Usu, Fecha_Salida_Real, Extras } = req.body; 

    const Cod_Fact = Math.floor(Date.now() / 1000); 

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        if (!Cod_Usu) {
            throw new Error("El Código de Usuario que realiza la facturación es requerido.");
        }
        
        // 1. Guardar Encabezado de Factura (Tabla: Factura)
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
    TipoPago = ?,
    Hora_Salida = ?
WHERE Cod_Res = ?
`, [TipoPago, Fecha_Salida_Real, Cod_Res]);

        // 4. GUARDAR CARGOS EXTRA (TABLA recargos)
        if (Extras && Extras.length > 0) {
            const [maxRow] = await connection.query('SELECT MAX(Cod_Cargo) as maxId FROM recargos');
            let nextId = (maxRow[0].maxId || 0) + 1; 

            for (const item of Extras) {
                const sqlCargo = `INSERT INTO recargos (Cod_Cargo, Desc_Recargo, Pre_Recargo, Cantidad, Cod_Res) VALUES (?, ?, ?, ?, ?)`;
                
                await connection.query(sqlCargo, [
                    nextId, 
                    item.descripcion, 
                    item.precio, 
                    item.cantidad, 
                    Cod_Res
                ]);
                
                nextId++; 
            }
        }

        await connection.commit();
        
        res.json({ success: true, message: 'Facturación completada y Reserva cerrada. El estado de la habitación debe ser actualizado manualmente.' });

    } catch (error) {
        await connection.rollback();
        console.error('Error durante la facturación:', error);
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

// 5. NUEVO ENDPOINT: CAMBIAR ESTADO MANUAL DE HABITACIÓN
app.put('/api/habitaciones/cambiar-estado/:codHab', async (req, res) => {
    const { codHab } = req.params;
    const { nuevoEstado } = req.body; 

    if (![1, 2, 3, 4].includes(nuevoEstado)) {
        return res.status(400).json({ success: false, message: 'Estado no válido. Debe ser 1, 2, 3 o 4.' });
    }

    try {
        const sqlUpdate = 'UPDATE Habitaciones SET Est_Hab = ? WHERE Cod_Hab = ?';

        const [result] = await pool.query(sqlUpdate, [nuevoEstado, codHab]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Habitación no encontrada o estado sin cambios.' });
        }

        res.json({ success: true, message: 'Estado de habitación actualizado correctamente.' });

    } catch (error) {
        console.error('Error al actualizar estado manualmente:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor al cambiar estado.' });
    }
});

// 9. Iniciar el servidor
app.listen(port, () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${port}`);
});