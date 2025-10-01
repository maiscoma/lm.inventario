# Guía de Desarrollo - LM Labor Soft Sistema de Inventario

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

**Backend:**
- Node.js + Express.js
- MySQL (Clever Cloud)
- Firebase (futuro)
- JWT Authentication
- bcrypt para seguridad

**Frontend:**
- React 18 + Vite
- Tailwind CSS
- React Router
- Axios
- Context API

### Estructura de Directorios

\`\`\`
lm-inventario-platform/
├── backend/
│   ├── config/
│   │   ├── database.js      # Configuración MySQL
│   │   └── firebase.js      # Configuración Firebase
│   ├── middleware/
│   │   └── auth.js          # Middlewares de autenticación
│   ├── routes/
│   │   └── auth.js          # Rutas de autenticación
│   ├── utils/
│   │   ├── security.js      # Utilidades de seguridad
│   │   └── validation.js    # Validaciones
│   ├── scripts/
│   │   └── init-database.js # Script de inicialización
│   └── server.js            # Servidor principal
├── frontend/
│   ├── public/
│   │   └── logo.png         # Logo corporativo
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── MainLayout.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── AdminPage.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── Login.jsx
│   │   ├── services/
│   │   │   └── authService.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
\`\`\`

## 🚀 Configuración del Entorno de Desarrollo

### Prerrequisitos

\`\`\`bash
# Verificar versiones
node --version  # >= 16.0.0
npm --version   # >= 8.0.0
\`\`\`

### Instalación

\`\`\`bash
# Clonar repositorio
git clone <repository-url>
cd lm-inventario-platform

# Instalar dependencias del backend
cd backend
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con las credenciales correctas

# Inicializar base de datos
npm run init-db

# Instalar dependencias del frontend
cd ../frontend
npm install

# Configurar variables de entorno
cp .env.example .env
\`\`\`

### Ejecución en Desarrollo

\`\`\`bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
\`\`\`

## 🎨 Guía de Estilos

### Tema Corporativo "Dark Tech"

\`\`\`css
/* Colores principales */
--primary-color: #00d4ff;      /* Cyan brillante */
--primary-dark: #0099cc;       /* Cyan oscuro */
--secondary-color: #6366f1;    /* Índigo */
--accent-color: #8b5cf6;       /* Púrpura */

/* Fondos */
--dark-bg: #0a0a0a;           /* Fondo principal */
--dark-surface: #111111;       /* Superficie secundaria */
--dark-card: #1a1a1a;         /* Tarjetas */
--dark-border: #2a2a2a;       /* Bordes */

/* Texto */
--text-primary: #ffffff;       /* Texto principal */
--text-secondary: #a0a0a0;     /* Texto secundario */
--text-muted: #666666;         /* Texto deshabilitado */
\`\`\`

### Componentes Reutilizables

\`\`\`jsx
// Botón primario
<button className="btn-primary">
  Acción Principal
</button>

// Botón secundario
<button className="btn-secondary">
  Acción Secundaria
</button>

// Card
<div className="card">
  <div className="card-header">
    <h3>Título</h3>
  </div>
  <p>Contenido</p>
</div>

// Input de formulario
<input className="form-input" />
<label className="form-label">Etiqueta</label>
\`\`\`

### Iconografía

Utilizamos **Lucide React** para iconos:

\`\`\`jsx
import { Home, Package, Users, Settings } from 'lucide-react';

<Home size={20} className="text-primary" />
\`\`\`

## 🔐 Sistema de Autenticación

### Flujo de Autenticación

1. Usuario envía credenciales al endpoint `/api/auth/login`
2. Backend valida credenciales contra MySQL
3. Si es válido, genera JWT con información del usuario
4. Frontend almacena token en localStorage
5. Token se incluye en headers de requests subsecuentes

### Roles y Permisos

\`\`\`javascript
// Verificar rol en componentes
const { isAdmin, isOperator } = useAuth();

// Rutas protegidas por rol
<ProtectedRoute requiredRole="administrador">
  <AdminPage />
</ProtectedRoute>
\`\`\`

### Middleware de Autenticación

\`\`\`javascript
// Backend - Verificar token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  // ... lógica de verificación
};

// Frontend - Interceptor de Axios
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
\`\`\`

## 🗄️ Base de Datos

### Esquema MySQL

\`\`\`sql
-- Tabla de Roles
CREATE TABLE Roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Usuarios
CREATE TABLE Usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_ultimo_acceso TIMESTAMP NULL,
    activo BOOLEAN DEFAULT TRUE,
    rol_id INT NOT NULL,
    FOREIGN KEY (rol_id) REFERENCES Roles(id)
);
\`\`\`

### Conexión a Base de Datos

\`\`\`javascript
// Configuración del pool de conexiones
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
\`\`\`

## 🧪 Testing

### Configuración de Tests (Futuro)

\`\`\`bash
# Backend - Jest + Supertest
npm install --save-dev jest supertest

# Frontend - Vitest + Testing Library
npm install --save-dev vitest @testing-library/react
\`\`\`

### Estructura de Tests

\`\`\`
tests/
├── backend/
│   ├── auth.test.js
│   ├── database.test.js
│   └── security.test.js
└── frontend/
    ├── components/
    ├── pages/
    └── services/
\`\`\`

## 📝 Convenciones de Código

### Nomenclatura

- **Archivos**: kebab-case (`auth-service.js`)
- **Componentes React**: PascalCase (`AuthContext.jsx`)
- **Variables/Funciones**: camelCase (`isAuthenticated`)
- **Constantes**: UPPER_SNAKE_CASE (`API_BASE_URL`)

### Estructura de Componentes React

\`\`\`jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ComponentName = ({ prop1, prop2 }) => {
  // 1. Hooks de estado
  const [state, setState] = useState(initialValue);
  
  // 2. Hooks de contexto
  const { user } = useAuth();
  
  // 3. Efectos
  useEffect(() => {
    // lógica del efecto
  }, [dependencies]);
  
  // 4. Funciones del componente
  const handleAction = () => {
    // lógica de la función
  };
  
  // 5. Renderizado condicional temprano
  if (loading) return <LoadingSpinner />;
  
  // 6. JSX principal
  return (
    <div className="component-container">
      {/* contenido */}
    </div>
  );
};

export default ComponentName;
\`\`\`

### Manejo de Errores

\`\`\`javascript
// Backend
try {
  // lógica
} catch (error) {
  console.error('Error específico:', error);
  res.status(500).json({
    success: false,
    message: 'Mensaje amigable para el usuario',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}

// Frontend
try {
  // lógica
} catch (error) {
  console.error('Error:', error);
  toast.error(error.response?.data?.message || 'Error inesperado');
}
\`\`\`

## 🔄 Git Workflow

### Estructura de Branches

\`\`\`
main                 # Producción
├── develop         # Desarrollo
├── feature/auth    # Nuevas características
├── bugfix/login    # Corrección de errores
└── hotfix/security # Correcciones urgentes
\`\`\`

### Commits Convencionales

\`\`\`bash
feat: agregar sistema de autenticación
fix: corregir error en login
docs: actualizar README
style: aplicar formato de código
refactor: reorganizar estructura de archivos
test: agregar tests para auth
chore: actualizar dependencias
\`\`\`

## 🚀 Próximas Fases de Desarrollo

### Fase 2: Gestión de Productos
- CRUD completo de productos
- Categorías y subcategorías
- Importación/exportación Excel
- Búsqueda avanzada y filtros

### Fase 3: Control de Inventario
- Movimientos de entrada/salida
- Historial de movimientos
- Alertas de stock bajo
- Valorización de inventario

### Fase 4: Reportes y Analytics
- Dashboard con métricas
- Reportes personalizables
- Exportación de datos
- Gráficos interactivos

### Fase 5: Integración Firebase
- Migración de productos a Firestore
- Sincronización en tiempo real
- Optimización de consultas
- Backup automático

### Fase 6: Aplicación Móvil
- React Native app
- Sincronización offline
- Lector de códigos de barras
- Push notifications

## 🛠️ Herramientas de Desarrollo

### Extensiones de VSCode Recomendadas

\`\`\`json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
\`\`\`

### Scripts Útiles

\`\`\`bash
# Linting y formato
npm run lint
npm run format

# Análisis de bundle
npm run analyze

# Limpieza de dependencias
npm run clean
\`\`\`

---

**Nota**: Esta guía se actualizará conforme el proyecto evolucione. Mantener siempre la documentación sincronizada con el código.
