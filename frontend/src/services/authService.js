import axios from "axios"

// Configuración base de axios
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api"

// Crear instancia de axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptor para agregar token a las peticiones
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }

    return Promise.reject(error)
  },
)

// Servicio de autenticación
export const authService = {
  // Configurar token
  setToken: (token) => {
    if (token) {
      apiClient.defaults.headers.Authorization = `Bearer ${token}`
    } else {
      delete apiClient.defaults.headers.Authorization
    }
  },

  // Iniciar sesión
  login: async (email, password) => {
    try {
      const response = await apiClient.post("/auth/login", {
        email: email.toLowerCase().trim(),
        password,
      })

      return response
    } catch (error) {
      throw error
    }
  },

  // Cerrar sesión
  logout: async () => {
    try {
      await apiClient.post("/auth/logout")
    } catch (error) {
      console.error("Error en logout:", error)
    } finally {
      authService.setToken(null)
    }
  },

  // Verificar token
  verifyToken: async () => {
    try {
      const response = await apiClient.get("/auth/verify-token")
      return response
    } catch (error) {
      throw error
    }
  },

  // Obtener perfil del usuario
  getProfile: async () => {
    try {
      const response = await apiClient.get("/auth/profile")
      return response
    } catch (error) {
      throw error
    }
  },

  // Verificar salud del servidor
  checkHealth: async () => {
    try {
      const response = await apiClient.get("/health")
      return response
    } catch (error) {
      throw error
    }
  },
}

// Exportar también la instancia de axios para uso directo
export { apiClient }
export default authService
