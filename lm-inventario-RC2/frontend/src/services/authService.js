// frontend/src/services/authService.js

import axios from "axios";
// --- INICIO: IMPORTACIONES PARA FIREBASE AUTH ---
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase-config"; // Asegúrate de que la ruta a tu config de Firebase sea correcta
// --- FIN: IMPORTACIONES PARA FIREBASE AUTH ---

const API_BASE_URL = "http://localhost:3001/api";

// 1. CONFIGURACIÓN DEL CLIENTE API (Tu código actual)
// Este apiClient se usará para hablar con tu backend (MySQL/Express)
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para añadir el token a las peticiones
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores 401 (token expirado/inválido)
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// 2. DEFINICIÓN DE LAS FUNCIONES DEL SERVICIO DE AUTENTICACIÓN

/**
 * Inicia sesión llamando a tu backend.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} La respuesta del servidor (incluyendo token y datos de usuario).
 */
const login = (email, password) => {
  return apiClient.post("/auth/login", { email, password });
};

/**
 * Registra un nuevo usuario llamando a tu backend.
 * @param {string} nombre
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} La respuesta del servidor.
 */
const register = (nombre, email, password) => {
  return apiClient.post("/auth/register", { nombre, email, password });
};

/**
 * Envía un correo de restablecimiento de contraseña usando Firebase.
 * @param {string} email
 * @returns {Promise<void>}
 */
const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Error al enviar correo de restablecimiento:", error);
    throw new Error("No se pudo enviar el correo. Verifica que el email sea correcto.");
  }
};

// 3. EXPORTACIÓN DEL SERVICIO
// Exportamos un único objeto `authService` con todas las funciones de autenticación.
export const authService = {
  login,
  register,
  sendPasswordReset,
};

// También exportamos apiClient por si otros servicios (products, reports, etc.) lo necesitan.
export { apiClient };