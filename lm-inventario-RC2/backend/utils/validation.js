const validator = require("validator")

// Validaciones para autenticación
const validateLoginData = (email, password) => {
  const errors = []

  // Validar email
  if (!email) {
    errors.push("El email es requerido")
  } else if (!validator.isEmail(email)) {
    errors.push("El formato del email no es válido")
  }

  // Validar contraseña
  if (!password) {
    errors.push("La contraseña es requerida")
  } else if (password.length < 6) {
    errors.push("La contraseña debe tener al menos 6 caracteres")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Validaciones para registro de usuario
const validateUserData = (nombre, email, password) => {
  const errors = []

  // Validar nombre
  if (!nombre) {
    errors.push("El nombre es requerido")
  } else if (nombre.length < 2) {
    errors.push("El nombre debe tener al menos 2 caracteres")
  } else if (nombre.length > 255) {
    errors.push("El nombre no puede exceder 255 caracteres")
  }

  // Validar email
  if (!email) {
    errors.push("El email es requerido")
  } else if (!validator.isEmail(email)) {
    errors.push("El formato del email no es válido")
  }

  // Validar contraseña
  if (!password) {
    errors.push("La contraseña es requerida")
  } else if (password.length < 8) {
    errors.push("La contraseña debe tener al menos 8 caracteres")
  } else if (
    !validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    })
  ) {
    errors.push("La contraseña debe contener al menos una mayúscula, una minúscula y un número")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Sanitizar entrada de texto
const sanitizeInput = (input) => {
  if (typeof input !== "string") return input
  return validator.escape(input.trim())
}

// Validar ID numérico
const validateId = (id) => {
  return validator.isInt(String(id), { min: 1 })
}

module.exports = {
  validateLoginData,
  validateUserData,
  sanitizeInput,
  validateId,
}
