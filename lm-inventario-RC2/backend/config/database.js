const mysql = require("mysql2/promise")
require("dotenv").config()
// Importamos la herramienta para hashear desde security.js
const { hashPassword } = require("../utils/security")

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 4,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
}

const pool = mysql.createPool(dbConfig)

const testConnection = async () => {
  try {
    const connection = await pool.getConnection()
    console.log("✅ Conexión a MySQL establecida correctamente")
    connection.release()
    return true
  } catch (error) {
    console.error("❌ Error al conectar con MySQL:", error.message)
    return false
  }
}

const initializeDatabase = async () => {
  try {
    console.log("🔄 Inicializando base de datos...")
    const isConnected = await testConnection()
    if (!isConnected) {
      throw new Error("No se pudo establecer conexión con la base de datos")
    }
    await createTables()
    await insertInitialData()
    console.log("✅ Base de datos inicializada correctamente")
    return true
  } catch (error) {
    console.error("❌ Error al inicializar base de datos:", error)
    return false
  }
}

const createTables = async () => {
  const connection = await pool.getConnection()
  try {
    await connection.execute(`
            CREATE TABLE IF NOT EXISTS Roles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre_rol VARCHAR(50) NOT NULL UNIQUE,
                descripcion TEXT,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `)
    await connection.execute(`
            CREATE TABLE IF NOT EXISTS Usuarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                fecha_ultimo_acceso TIMESTAMP NULL,
                activo BOOLEAN DEFAULT TRUE,
                rol_id INT NOT NULL,
                FOREIGN KEY (rol_id) REFERENCES Roles(id) ON DELETE RESTRICT ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `)
    console.log("✅ Tablas creadas correctamente")
  } finally {
    connection.release()
  }
}

// --- FUNCIÓN CORREGIDA ---
const insertInitialData = async () => {
  const connection = await pool.getConnection()
  try {
    await connection.execute(`
            INSERT IGNORE INTO Roles (nombre_rol, descripcion) VALUES 
            ('administrador', 'Acceso completo al sistema de inventario'),
            ('operador', 'Acceso limitado para operaciones diarias de inventario');
        `)
    
    // Generamos el hash en el momento, en lugar de usar uno pre-copiado
    const hashedPassword = await hashPassword("password123");
    console.log("Generando hash para usuarios de prueba:", hashedPassword);

    await connection.execute(
      `
            INSERT IGNORE INTO Usuarios (nombre, email, password_hash, rol_id) VALUES 
            ('Administrador Sistema', 'admin@lmlaborsoft.cl', ?, (SELECT id FROM Roles WHERE nombre_rol = 'administrador')),
            ('Operador Sistema', 'operador@lmlaborsoft.cl', ?, (SELECT id FROM Roles WHERE nombre_rol = 'operador'));
        `,
      [hashedPassword, hashedPassword],
    )
    console.log("✅ Datos iniciales insertados correctamente")
  } finally {
    connection.release()
  }
}

module.exports = {
  pool,
  testConnection,
  initializeDatabase,
  createTables,
  insertInitialData,
}
