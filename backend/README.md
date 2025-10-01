# Backend - LM Labor Soft Inventario

Backend del sistema de inventario desarrollado con Node.js, Express y MySQL.

## Configuración

### Requisitos
- Node.js 16+
- MySQL 8.0+
- npm o yarn

### Instalación

1. Instalar dependencias:
\`\`\`bash
npm install
\`\`\`

2. Configurar variables de entorno:
Copiar `.env.example` a `.env` y configurar las variables.

3. Inicializar base de datos:
\`\`\`bash
node scripts/init-database.js
\`\`\`

### Ejecución

#### Desarrollo
\`\`\`bash
npm run dev
\`\`\`

#### Producción
\`\`\`bash
npm start
\`\`\`

## API Endpoints

### Autenticación
- `POST /api/login` - Iniciar sesión
- `GET /api/verify-token` - Verificar token JWT
- `GET /api/profile` - Obtener perfil del usuario

### Salud del Sistema
- `GET /api/health` - Estado del servidor

## Estructura de la Base de Datos

### Tabla Roles
- `id` (INT, PK, AUTO_INCREMENT)
- `nombre_rol` (VARCHAR(50), UNIQUE)
- `descripcion` (TEXT)
- `fecha_creacion` (TIMESTAMP)

### Tabla Usuarios
- `id` (INT, PK, AUTO_INCREMENT)
- `nombre` (VARCHAR(255))
- `email` (VARCHAR(255), UNIQUE)
- `password_hash` (VARCHAR(255))
- `fecha_creacion` (TIMESTAMP)
- `fecha_ultimo_acceso` (TIMESTAMP)
- `activo` (BOOLEAN)
- `rol_id` (INT, FK)

## Usuarios de Prueba

- **Administrador**: admin@lmlaborsoft.cl / password123
- **Operador**: operador@lmlaborsoft.cl / password123

## Seguridad

- Contraseñas hasheadas con bcrypt
- Autenticación JWT
- Validación de entrada
- Conexiones SSL a base de datos
- CORS configurado

## Variables de Entorno

\`\`\`env
DB_HOST=tu_host_mysql
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=tu_base_datos
DB_PORT=3306
JWT_SECRET=tu_jwt_secret
JWT_EXPIRES_IN=24h
PORT=3001
NODE_ENV=development
