const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")

// Configuración de bcrypt
const SALT_ROUNDS = 12

// Hashear contraseña
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS)
    return await bcrypt.hash(password, salt)
  } catch (error) {
    throw new Error("Error al hashear contraseña")
  }
}

// Verificar contraseña
const verifyPassword = async (password, hashedPassword) => {
  try {
    // --- INICIO DE DEPURACIÓN PROFUNDA ---
    console.log("--- Inspeccionando variables para bcrypt.compare ---");
    console.log(`Plain Password: |${password}|`, `(Tipo: ${typeof password}, Longitud: ${password.length})`);
    console.log(`Hashed Password: |${hashedPassword}|`, `(Tipo: ${typeof hashedPassword}, Longitud: ${hashedPassword.length})`);
    // --- FIN DE DEPURACIÓN PROFUNDA ---
    
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error("Error al verificar contraseña");
  }
}

// Generar JWT
const generateToken = (payload, expiresIn = process.env.JWT_EXPIRES_IN) => {
  try {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn })
  } catch (error) {
    throw new Error("Error al generar token")
  }
}

// Verificar JWT
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    throw error
  }
}

// Generar token de recuperación
const generateRecoveryToken = () => {
  return crypto.randomBytes(32).toString("hex")
}

// Generar ID único
const generateUniqueId = () => {
  return crypto.randomUUID()
}

// Limpiar datos sensibles del objeto usuario
const sanitizeUserData = (user) => {
  const { password_hash, ...sanitizedUser } = user
  return sanitizedUser
}

// Configuración de seguridad para headers HTTP
const securityHeaders = (req, res, next) => {
  // Prevenir ataques XSS
  res.setHeader("X-Content-Type-Options", "nosniff")
  res.setHeader("X-Frame-Options", "DENY")
  res.setHeader("X-XSS-Protection", "1; mode=block")

  // Configurar CSP básico
  res.setHeader("Content-Security-Policy", "default-src 'self'")

  // Prevenir información del servidor
  res.removeHeader("X-Powered-By")

  next()
}

// Rate limiting básico (en memoria - para producción usar Redis)
const rateLimitStore = new Map()

const rateLimit = (maxRequests = 5, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress
    const now = Date.now()
    const windowStart = now - windowMs

    // Limpiar entradas antiguas
    for (const [ip, requests] of rateLimitStore.entries()) {
      const filteredRequests = requests.filter((time) => time > windowStart)
      if (filteredRequests.length === 0) {
        rateLimitStore.delete(ip)
      } else {
        rateLimitStore.set(ip, filteredRequests)
      }
    }

    // Verificar límite para IP actual
    const clientRequests = rateLimitStore.get(clientIP) || []
    const recentRequests = clientRequests.filter((time) => time > windowStart)

    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: "Demasiadas solicitudes. Intente nuevamente más tarde.",
        retryAfter: Math.ceil(windowMs / 1000),
      })
    }

    // Registrar solicitud actual
    recentRequests.push(now)
    rateLimitStore.set(clientIP, recentRequests)

    next()
  }
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  generateRecoveryToken,
  generateUniqueId,
  sanitizeUserData,
  securityHeaders,
  rateLimit,
}
