"use client"

import { useState, useEffect } from "react"
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"
import { Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react"
import LoadingSpinner from "../components/LoadingSpinner"

const Login = () => {
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();
  const location = useLocation()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

  // Limpiar errores cuando el componente se monta
  useEffect(() => {
    clearError()
  }, [clearError])

  // Redirigir si ya está autenticado
  const from = location.state?.from?.pathname || "/dashboard"

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  // Validar formulario
  const validateForm = () => {
    const errors = {}
    if (!formData.email.trim()) {
      errors.email = "El email es requerido"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "El formato del email no es válido"
    }
    if (!formData.password) {
      errors.password = "La contraseña es requerida"
    } else if (formData.password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres"
    }
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    await login(formData.email, formData.password);
    setIsSubmitting(false);
  };

  // Mostrar spinner de carga inicial
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <LoadingSpinner size="lg" text="Cargando..." />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  // ===== INICIO DE CAMBIOS =====
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="LM Labor Soft" className="w-20 h-20 object-contain" />
          </div>
          <h2 className="text-3xl font-bold gradient-text mb-2">LM Labor Soft</h2>
          <p className="text-text-secondary">Sistema de Inventario</p>
          <p className="text-sm text-text-muted mt-2">Inicia sesión para acceder al sistema</p>
        </div>

        {/* Formulario */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 transition-all duration-300 hover:shadow-glow hover:-translate-y-0.5">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error general */}
            {error && (
              <div className="bg-error/10 border border-error/20 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-error font-medium">Error de autenticación</p>
                  <p className="text-error/80 text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Campo Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-text-muted" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 ${validationErrors.email ? "border-error focus:border-error focus:ring-error/20" : ""}`}
                  placeholder="admin@lmlaborsoft.cl"
                />
              </div>
              {validationErrors.email && <p className="mt-1 text-sm text-error">{validationErrors.email}</p>}
            </div>

            {/* Campo Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-text-muted" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-3 bg-dark-surface border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 ${validationErrors.password ? "border-error focus:border-error focus:ring-error/20" : ""}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-text-muted hover:text-text-secondary" />
                  ) : (
                    <Eye className="h-5 w-5 text-text-muted hover:text-text-secondary" />
                  )}
                </button>
              </div>
              {validationErrors.password && <p className="mt-1 text-sm text-error">{validationErrors.password}</p>}
            </div>

            {/* Botón de envío */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-lg font-semibold hover:shadow-glow hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:-translate-y-0"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" color="white" />
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <span>Iniciar Sesión</span>
                )}
              </button>
            </div>
          </form>

          {/* ✨ INICIO DEL CÓDIGO AÑADIDO ✨ */}
          <div className="mt-6 pt-6 border-t border-dark-border text-center">
            <p className="text-sm text-text-secondary">
              ¿No tienes una cuenta?{" "}
              <Link to="/register" className="font-medium text-primary hover:underline">
                Regístrate aquí
              </Link>
            </p>
          </div>
          {/* ✨ FIN DEL CÓDIGO AÑADIDO ✨ */}

          {/* Información de usuarios de prueba */}
          <div className="mt-6 pt-6 border-t border-dark-border">
            <p className="text-xs text-text-muted text-center mb-3">Usuarios de prueba:</p>
            <div className="space-y-2 text-xs">
              <div className="bg-dark-bg rounded p-2">
                <p className="text-text-secondary">
                  <span className="font-medium text-primary">Administrador:</span> admin@lmlaborsoft.cl
                </p>
                <p className="text-text-muted">Contraseña: password123</p>
              </div>
              <div className="bg-dark-bg rounded p-2">
                <p className="text-text-secondary">
                  <span className="font-medium text-accent">Operador:</span> operador@lmlaborsoft.cl
                </p>
                <p className="text-text-muted">Contraseña: password123</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-text-muted">© 2025 LM Labor Soft SpA. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  )
  // ===== FIN DE CAMBIOS =====
}

export default Login
