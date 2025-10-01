"use client"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import LoadingSpinner from "./LoadingSpinner"

const ProtectedRoute = ({ children, requiredRole = null, fallbackPath = "/login" }) => {
  const { isAuthenticated, isLoading, user, hasRole } = useAuth()
  const location = useLocation()

  // Mostrar spinner mientras se carga la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Redirigir al login si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />
  }

  // Verificar rol específico si es requerido
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="text-center">
          <div className="w-16 h-16 bg-error/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">Acceso Denegado</h2>
          <p className="text-text-secondary mb-4">No tienes permisos para acceder a esta sección.</p>
          <p className="text-sm text-text-muted">
            Rol requerido: <span className="font-medium text-primary">{requiredRole}</span>
          </p>
          <p className="text-sm text-text-muted">
            Tu rol actual: <span className="font-medium text-accent">{user?.rol}</span>
          </p>
        </div>
      </div>
    )
  }

  return children
}

export default ProtectedRoute
