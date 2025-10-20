LM Labor Soft - Sistema de Inventario Avanzado
📋 Índice
•	Visión General
•	Características Principales
•	Demo en Vivo y Credenciales
•	Stack Tecnológico
•	Requisitos Previos
•	Guía de Instalación y Ejecución
•	Documentación de la API
•	Estructura del Proyecto
•	Licencia
________________________________________
🌎 Visión General
LM Labor Soft Inventario es una plataforma web integral diseñada para la gestión y control de inventarios de pequeñas y medianas empresas. El sistema ofrece una solución robusta y escalable con una interfaz de usuario moderna y reactiva, construida con las últimas tecnologías web.
La arquitectura del proyecto está pensada para el futuro, con una API RESTful que permite una fácil integración con aplicaciones móviles y otros servicios de terceros, como lectores de códigos de barras.
________________________________________
✨ Características Principales
•	Gestión Completa de Productos (CRUD): Crea, lee, actualiza y elimina productos con campos personalizables.
•	Control de Movimientos: Registra entradas y salidas de inventario de forma transaccional.
•	Autenticación Segura y Roles: Sistema de usuarios con roles (Administrador, Operador) basado en Firebase Authentication.
•	Reportes y Estadísticas: Genera reportes de valorización de inventario, movimientos por fecha y alertas de stock bajo.
•	Importación y Exportación Masiva: Funcionalidad para importar y exportar datos de productos a través de archivos Excel (.xlsx).
•	Búsqueda y Filtrado Avanzado: Interfaz con filtros dinámicos, ordenamiento de tablas y autocompletado para una experiencia de usuario fluida.
•	Interfaz Moderna y Responsiva: Diseño "Dark Tech" corporativo, con un dashboard principal, menú lateral y componentes optimizados para cualquier dispositivo.
•	Notificaciones en Tiempo Real: Alertas visuales para eventos importantes como niveles de stock críticos.
________________________________________
🚀 Demo en Vivo y Credenciales
Próximamente se habilitará un enlace a la demo en vivo.
Para pruebas, puedes utilizar las siguientes credenciales de acceso:
Rol	Email	Contraseña
👤 Administrador	admin@lmlaborsoft.cl	password123
🧑‍🔧 Operador	operador@lmlaborsoft.cl	password123
________________________________________
🛠️ Stack Tecnológico
Este proyecto es una aplicación full-stack que utiliza un conjunto de tecnologías modernas para garantizar rendimiento, seguridad y escalabilidad.
Backend
Tecnología	Propósito
Node.js	Entorno de ejecución de JavaScript.
Express.js	Framework para construir la API RESTful.
Firebase Admin SDK	Para autenticación, base de datos (Firestore) y almacenamiento.
dotenv	Manejo de variables de entorno.
CORS	Habilitar peticiones seguras desde el frontend.
helmet	Seguridad de encabezados HTTP.
express-rate-limit	Limitar peticiones para prevenir ataques de fuerza bruta.
multer	Middleware para la subida de archivos (imágenes y Excel).
exceljs	Para leer y escribir archivos Excel en el servidor.
bcryptjs	Hashing seguro de contraseñas.
jsonwebtoken (JWT)	Para la creación y verificación de tokens de sesión.
Frontend
Tecnología	Propósito
React 18	Biblioteca para construir la interfaz de usuario.
Vite	Herramienta de desarrollo y empaquetado ultra-rápida.
Tailwind CSS	Framework CSS para un diseño rápido y personalizable.
React Router DOM	Para la gestión de rutas y navegación.
Firebase (Client SDK)	Conexión con los servicios de Firebase (Auth, Firestore).
Axios	Cliente HTTP para la comunicación con la API.
React Hot Toast	Sistema de notificaciones (toasts).
Lucide React	Biblioteca de íconos SVG ligera y personalizable.
ExcelJS (lado cliente)	Para generar archivos Excel directamente en el navegador.
clsx & tailwind-merge	Utilidades para la gestión de clases CSS condicionales.
________________________________________
🔧 Requisitos Previos
Antes de comenzar, asegúrate de tener instalado lo siguiente en tu sistema:
•	Node.js: Versión 16.0.0 o superior.
•	npm (o yarn): Gestor de paquetes de Node.js.
•	Cuenta de Firebase: Un proyecto de Firebase configurado con Authentication y Firestore.
________________________________________
⚙️ Guía de Instalación y Ejecución
Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno local.
1. Clonar el Repositorio
Bash
git clone <URL_DEL_REPOSITORIO>
cd lm-inventario-RC2
2. Configuración del Backend
Bash
# Navega a la carpeta del backend
cd backend

# Instala las dependencias
npm install

# Crea tu archivo de variables de entorno
cp .env.example .env
Abre el archivo .env y configura tus credenciales de Firebase y los datos del servidor.
3. Configuración del Frontend
Bash
# Navega a la carpeta del frontend
cd ../frontend

# Instala las dependencias
npm install

# Crea tu archivo de variables de entorno
cp .env.example .env
Abre el archivo .env y configura la URL de tu API del backend.
4. Ejecución del Proyecto
Necesitarás dos terminales para ejecutar el backend y el frontend simultáneamente.
Terminal 1 (Backend):
Bash
cd backend
npm run dev
✨ El servidor del backend estará funcionando en http://localhost:5001.
Terminal 2 (Frontend):
Bash
cd frontend
npm run dev
🚀 La aplicación frontend estará disponible en http://localhost:3000.
________________________________________
📊 Documentación de la API
La API sigue los principios RESTful y utiliza JSON para la comunicación. Todos los endpoints requieren un token de autenticación (Firebase ID Token) en la cabecera Authorization: Bearer <TOKEN>.
Autenticación (/api/auth)
•	POST /login: Inicia sesión y devuelve un token.
•	GET /verify-token: Verifica la validez de un token.
Productos (/api/products)
•	GET /: Obtiene una lista paginada y filtrada de productos.
•	GET /:id: Obtiene un producto por su ID.
•	POST /: Crea un nuevo producto.
•	PUT /:id: Actualiza un producto existente.
•	DELETE /:id: Elimina un producto.
•	POST /import: Importa productos desde un archivo Excel.
•	GET /export: Exporta todos los productos a un archivo Excel.
•	GET /template: Descarga una plantilla de Excel para la importación.
Movimientos (/api/movements)
•	POST /: Registra un nuevo movimiento (entrada/salida) y actualiza el stock.
•	GET /: Obtiene una lista de movimientos, con filtros por fecha.
Reportes (/api/reports)
•	GET /low-stock: Obtiene productos con stock por debajo del umbral mínimo.
•	GET /inventory-stats: Devuelve estadísticas clave como el valor total del inventario.
•	GET /movements-by-date: Genera un reporte de movimientos en un rango de fechas.
Usuarios y Administración (/api/users)
•	GET /: Lista todos los usuarios del sistema (solo admin).
•	PUT /:id/role: Actualiza el rol de un usuario (solo admin).
________________________________________
📁 Estructura del Proyecto
lm-inventario-RC2/
├── backend/
│   ├── config/          # Conexiones (Firebase)
│   ├── middleware/      # Middlewares (auth, validation)
│   ├── routes/          # Definición de rutas de la API
│   ├── scripts/         # Scripts de utilidad (ej. asignar rol admin)
│   └── server.js        # Punto de entrada del servidor
├── frontend/
│   ├── src/
│   │   ├── components/  # Componentes reutilizables
│   │   ├── contexts/    # Contextos de React (Auth, Notifications)
│   │   ├── pages/       # Vistas principales de la aplicación
│   │   ├── services/    # Lógica de comunicación con la API
│   │   └── App.jsx      # Componente raíz y enrutador
│   └── vite.config.js   # Configuración de Vite
└── README.md
________________________________________
📄 Licencia
Este proyecto es propiedad de Marcos Cornejo y el equipo de LM Labor Soft SpA. Todos los derechos reservados.
________________________________________
Desarrollado con ❤️ por Marcos Cornejo y el equipo de LM Labor Soft.

