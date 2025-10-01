-- Esquema de Base de Datos para LM Labor Soft Inventario
-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS bs6cev8zsmvnrp1nxcm2;
USE bs6cev8zsmvnrp1nxcm2;

-- Tabla de Roles
CREATE TABLE IF NOT EXISTS Roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Usuarios
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
);

-- Insertar roles iniciales
INSERT INTO Roles (nombre_rol, descripcion) VALUES 
('administrador', 'Acceso completo al sistema de inventario'),
('operador', 'Acceso limitado para operaciones diarias de inventario')
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

-- Insertar usuarios de prueba
-- Contraseña para ambos: password123 (hasheada con bcrypt)
INSERT INTO Usuarios (nombre, email, password_hash, rol_id) VALUES 
(
    'Administrador Sistema', 
    'admin@lmlaborsoft.cl', 
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
    (SELECT id FROM Roles WHERE nombre_rol = 'administrador')
),
(
    'Operador Sistema', 
    'operador@lmlaborsoft.cl', 
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
    (SELECT id FROM Roles WHERE nombre_rol = 'operador')
)
ON DUPLICATE KEY UPDATE 
    nombre = VALUES(nombre),
    password_hash = VALUES(password_hash);

-- Crear índices para optimizar consultas
CREATE INDEX idx_usuarios_email ON Usuarios(email);
CREATE INDEX idx_usuarios_rol ON Usuarios(rol_id);
CREATE INDEX idx_usuarios_activo ON Usuarios(activo);
