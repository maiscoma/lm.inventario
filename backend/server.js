// backend/server.js

const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Importaciones de la aplicación
const { pool, initializeDatabase } = require("./config/database");
const { securityHeaders, rateLimit } = require("./utils/security");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const movementRoutes = require("./routes/movements");
const uploadRoutes = require("./routes/upload");
const reportRoutes = require("./routes/reports");
const userRoutes = require("./routes/users");
const logsRoutes = require("./routes/logs");
const settingsRoutes = require("./routes/settings");
const databaseRoutes = require("./routes/database");


const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares de seguridad y configuración
app.use(securityHeaders);
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
// app.use(rateLimit(100, 15 * 60 * 1000));

// Rutas principales de la API
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/movements", movementRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);
app.use("/api/logs", logsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/database", databaseRoutes);


// Ruta de salud del servidor
app.get("/api/health", async (req, res) => {
    try {
        await pool.getConnection();
        res.json({
            success: true,
            message: "Servidor LM Labor Soft funcionando correctamente",
            database: "Connected",
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            message: "Servidor funcionando pero hay problemas con la base de datos",
            database: "Disconnected",
        });
    }
});

// Manejo de rutas no encontradas (404)
app.use("*", (req, res) => {
    res.status(404).json({
        success: false,
        message: "Ruta no encontrada",
        path: req.originalUrl,
    });
});

// Manejador global de errores
app.use((error, req, res, next) => {
    console.error("Error no manejado:", error);
    res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
});

// Función para iniciar el servidor
const startServer = async () => {
    try {
        console.log("🔄 Inicializando servidor LM Labor Soft...");
        
        // Comentado para no reiniciar la BD en cada inicio. Usar 'npm run init-db' para resetear.
        // await initializeDatabase(); 

        app.listen(PORT, () => {
            console.log(`🚀 Servidor LM Labor Soft ejecutándose en puerto ${PORT}`);
            console.log(`🔗 API disponible en: http://localhost:${PORT}/api`);
        });
    } catch (error) {
        console.error("❌ Error al iniciar el servidor:", error);
        process.exit(1);
    }
};

startServer();