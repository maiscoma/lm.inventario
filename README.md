# LM Labor Soft - Sistema de Inventario

Plataforma web completa para la gestión de inventarios desarrollada con tecnologías modernas.

## 🚀 Características

- **Autenticación segura** con JWT y roles de usuario
- **Interfaz moderna** con diseño Dark Tech corporativo
- **Arquitectura escalable** preparada para integración móvil
- **Base de datos dual** (MySQL + Firebase)
- **Responsive design** optimizado para todos los dispositivos

## 🛠️ Tecnologías

### Backend
- **Node.js** con Express.js
- **MySQL** para usuarios y roles
- **Firebase** para lógica de negocio (futuro)
- **JWT** para autenticación
- **bcrypt** para seguridad de contraseñas

### Frontend
- **React 18** con Vite
- **Tailwind CSS** con tema corporativo
- **React Router** para navegación
- **Axios** para comunicación con API
- **Lucide React** para iconografía

## 📋 Requisitos

- Node.js 16+
- MySQL 8.0+
- npm o yarn

## 🔧 Instalación

### 1. Clonar el repositorio
\`\`\`bash
git clone <repository-url>
cd lm-inventario-platform
\`\`\`

### 2. Configurar Backend
\`\`\`bash
cd backend
npm install
cp .env.example .env
# Configurar variables de entorno en .env
npm run init-db
\`\`\`

### 3. Configurar Frontend
\`\`\`bash
cd frontend
npm install
cp .env.example .env
# Configurar variables de entorno en .env
\`\`\`

## 🚀 Ejecución

### Desarrollo
\`\`\`bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
\`\`\`

### Producción
\`\`\`bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
npm run preview
\`\`\`

## 👥 Usuarios de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | admin@lmlaborsoft.cl | password123 |
| Operador | operador@lmlaborsoft.cl | password123 |

## 🎨 Diseño Corporativo

El sistema utiliza el tema "Dark Tech" de LM Labor Soft con:

- **Colores primarios**: #00d4ff (Cyan), #8b5cf6 (Púrpura)
- **Fondos**: Tonos oscuros (#0a0a0a, #1a1a1a)
- **Tipografía**: Inter (principal), JetBrains Mono (código)
- **Efectos**: Sombras con glow, transiciones suaves

## 📁 Estructura del Proyecto

\`\`\`
lm-inventario-platform/
├── backend/
│   ├── config/          # Configuraciones
│   ├── middleware/      # Middlewares
│   ├── routes/          # Rutas de API
│   ├── utils/           # Utilidades
│   ├── scripts/         # Scripts de inicialización
│   └── server.js        # Servidor principal
├── frontend/
│   ├── public/          # Archivos estáticos
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── contexts/    # Contextos React
│   │   ├── pages/       # Páginas
│   │   ├── services/    # Servicios API
│   │   └── App.jsx      # Componente principal
│   └── package.json
└── README.md
\`\`\`

## 🔐 Seguridad

- Contraseñas hasheadas con bcrypt (12 rounds)
- Tokens JWT con expiración
- Rate limiting en endpoints
- Headers de seguridad HTTP
- Validación de entrada
- CORS configurado

## 🚧 Funcionalidades Implementadas

### ✅ Semana 1 (Actual)
- [x] Arquitectura base completa
- [x] Sistema de autenticación
- [x] Base de datos MySQL
- [x] Interface de usuario base
- [x] Dashboard principal
- [x] Control de acceso por roles
- [x] Diseño corporativo

### 🔄 Próximas Fases
- [ ] Gestión completa de productos
- [ ] Sistema de movimientos de inventario
- [ ] Reportes y estadísticas
- [ ] Integración con Firebase
- [ ] Importación/exportación Excel
- [ ] Aplicación móvil
- [ ] Lector de códigos de barras

## 📊 API Endpoints

### Autenticación
- \`POST /api/auth/login\` - Iniciar sesión
- \`GET /api/auth/verify-token\` - Verificar token
- \`GET /api/auth/profile\` - Obtener perfil
- \`POST /api/auth/logout\` - Cerrar sesión

### Sistema
- \`GET /api/health\` - Estado del servidor

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (\`git checkout -b feature/AmazingFeature\`)
3. Commit tus cambios (\`git commit -m 'Add some AmazingFeature'\`)
4. Push a la rama (\`git push origin feature/AmazingFeature\`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es propiedad de **LM Labor Soft SpA**. Todos los derechos reservados.

## 📞 Contacto

**LM Labor Soft SpA**
- Website: https://lmlaborsoftspa.cl/
- Email: contacto@lmlaborsoft.cl

---

*Desarrollado con ❤️ por el equipo de LM Labor Soft*
\`\`\`
\`\`\`

```json file="" isHidden
