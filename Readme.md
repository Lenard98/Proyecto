# Sistema de Gestión Hotelera — Hotel Clementina

Proyecto académico desarrollado en la asignatura **Seminario de Software** de la  
**Universidad Católica de Honduras "Nuestra Señora Reina de la Paz"**.

---

# Descripción del Proyecto
El sistema consiste en una **aplicación web interna (PMS — Property Management System)** diseñada para **gestionar las operaciones del Hotel Clementina**.  
El objetivo principal es **centralizar y digitalizar** los procesos de administración, hospedaje y facturación del hotel, a través de una interfaz moderna, segura y fácil de usar.

El acceso al sistema estará **restringido al personal del hotel**, con inicio de sesión y permisos definidos por rol.

---

## Objetivos Principales

- **Centralizar la gestión:** unificar el control de habitaciones, huéspedes, empleados y facturación.  
- **Optimizar la ocupación:** mostrar el estado de todas las habitaciones en tiempo real.  
- **Agilizar check-in/check-out:** simplificar el registro de huéspedes y facturación.  
- **Aumentar la seguridad:** restringir el acceso mediante roles (Gerente, Administrador, Recepcionista).  
- **Generar reportes:** ofrecer datos clave para la toma de decisiones del hotel.

---

## Roles de Usuario

| Rol | Descripción |
|-----|--------------|
| **Gerente** | Acceso total a todos los módulos y reportes. |
| **Administrador** | Gestiona las operaciones diarias y configuración del sistema. |
| **Recepcionista** | Acceso limitado a habitaciones, huéspedes y check-in/check-out. |

---

## Módulos del Sistema

### 1. Módulo de Autenticación y Seguridad
- Inicio de sesión con usuario y contraseña.
- Control de roles (Administrador, Recepcionista, Gerente).
- Interfaz adaptativa según permisos del usuario.

### 2. Módulo de Tablero (Panel de Control)
- Vista general del estado del hotel.  
- Gráficos de ocupación y lista de actividades del día (check-ins/check-outs).  
- Accesos directos a funciones comunes.

### 3. Módulo de Gestión de Habitaciones
- Mapa visual del hotel con estados por color:  
  🟢 Disponible | 🔴 Ocupada | 🟡 En limpieza | 🔵 Mantenimiento  
- Cambio rápido del estado de habitación.  
- Información detallada por habitación.

### 4. Módulo de Gestión de Huéspedes
- Registro completo de huéspedes.  
- Base de datos consultable y buscador rápido.  
- Procesos de **Check-in** y **Check-out** automáticos.  
- Enlace directo al módulo de facturación.

### 5. Módulo de Gestión de Empleados y Usuarios
- Registro del personal y asignación de roles.  
- Creación, edición o eliminación de cuentas de usuario.  

### 6. Módulo de Facturación
- Generación automática de facturas al realizar el check-out.  
- Cálculo total de estancia y servicios adicionales (minibar, lavandería).  
- Historial de facturas con búsqueda, impresión y verificación de estado (Pagada/Pendiente).

---

## Análisis de Requerimientos

### 🔸 Frontend (Interfaz)
- **Tecnología:** React.js  
- **Lenguajes:** HTML, CSS, JavaScript  
- **Características:** diseño responsivo, formularios dinámicos y mapa interactivo de habitaciones.

### 🔸 Backend (Lógica del Sistema)
- **Tecnología:** Node.js con Express.js  
- **Seguridad:** manejo de autenticación con **JSON Web Tokens (JWT)**.  
- **Funciones:** lógica de negocio (asignación de habitaciones, facturación, roles).  
- **Conexión a base de datos:** API REST que interactúa con MySQL.

### 🔸 Base de Datos
- **Sistema Gestor:** MySQL  
- **Estructura:** relacional, basada en 16 tablas (Usuarios, Habitaciones, Huéspedes, Facturas, etc.).  
- **Diccionario de datos:** incluye campos, claves primarias y foráneas.  

---

## Requisitos Funcionales Destacados

- RF-001: Inicio de sesión con usuario y contraseña.  
- RF-002: Asignación de roles y permisos por empleado.  
- RF-004: Mapa visual con estado de habitaciones.  
- RF-008: Proceso de Check-in con selección de habitación.  
- RF-009: Proceso de Check-out con actualización de estado.  
- RF-011: Generación automática de facturas.  
- RF-013: Historial de facturación consultable e imprimible.

---

## Requisitos No Funcionales

- RNF-001: Interfaz intuitiva y fácil de usar.  
- RNF-002: Respuesta del sistema menor a 2 segundos.  
- RNF-003: Cifrado de contraseñas y datos sensibles.  
- RNF-004: Disponibilidad 24/7 con copias de seguridad automáticas.  
- RNF-005: Compatibilidad con navegadores modernos (Chrome, Firefox, Edge).

---

## Estructura de la Base de Datos 
Principales tablas:

- **Usuarios**
- **Habitaciones**
- **Habitaciones_Tipo**
- **Clientes**
- **Reservas**
- **Factura** / **Factura_Detalle**
- **Empleados** / **Empleados_Cargo**
- **Planilla**
- **Bitácora**

---

## Instalación del Proyecto

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/Lenard98/Proyecto.git
   cd hotel-clementina
