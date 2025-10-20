// backend/middleware/auth.js

// ✨ REEMPLAZAR EL CONTENIDO COMPLETO POR ESTO ✨

const { auth } = require("../config/firebase");

// Middleware para verificar el token de ID de Firebase
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token de acceso requerido",
      code: "NO_TOKEN",
    });
  }

  try {
    // Verificar el token usando el SDK de Admin de Firebase
    const decodedToken = await auth.verifyIdToken(token);
    
    // Añadimos la información del usuario decodificada al objeto 'req'
    // 'decodedToken' incluye uid, email, etc. y también los 'custom claims' que definamos.
    req.user = decodedToken;
    next();
  } catch (error) {
    let message = "Token inválido o expirado.";
    let code = "INVALID_TOKEN";

    if (error.code === 'auth/id-token-expired') {
        message = "El token ha expirado, por favor inicia sesión de nuevo.";
        code = "EXPIRED_TOKEN";
    }
    
    console.error("Error de autenticación de Firebase:", error.code, message);
    return res.status(401).json({ success: false, message, code });
  }
};

// Middleware para requerir un rol específico (usando custom claims)
const requireRole = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Usuario no autenticado." });
        }
        
        // Los roles se guardarán en los 'custom claims' del token de Firebase
        const userRole = req.user.rol; // Asumimos que el claim se llama 'rol'

        if (userRole !== requiredRole) {
            return res.status(403).json({
                success: false,
                message: "Permisos insuficientes.",
                required: requiredRole,
                current: userRole,
            });
        }
        next();
    };
};

// Middleware para requerir rol de administrador
const requireAdmin = requireRole("administrador");

module.exports = {
  authenticate,
  requireRole,
  requireAdmin,
};