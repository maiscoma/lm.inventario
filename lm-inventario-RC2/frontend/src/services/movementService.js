// frontend/src/services/movementService.js

// 1. Importa la instancia de axios preconfigurada desde authService.
import { apiClient } from "./authService";

export const movementService = {
  // Registrar nuevo movimiento
  create: async (movementData) => {
    try {
      // 2. Usa `apiClient` en lugar de `axios`.
      const response = await apiClient.post("/movements", movementData);
      return response; // El interceptor ya extrae .data
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Obtener historial de movimientos
  getAll: async (filters = {}) => {
    try {
      // `apiClient` maneja la URL base, solo pasamos los parámetros.
      const response = await apiClient.get("/movements", { params: filters });
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Obtener movimientos de un producto específico
  getByProduct: async (productoId, limit = 20) => {
    try {
      const response = await apiClient.get(`/movements/product/${productoId}`, {
        params: { limit },
      });
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Obtener estadísticas de movimientos
  getStats: async () => {
    try {
      const response = await apiClient.get("/movements/stats");
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  // --- ✅ INICIO DE LA CORRECCIÓN: FUNCIÓN AÑADIDA ---
  // Exportar reporte de movimientos a Excel
  exportMovements: async (filters = {}) => {
    try {
      const response = await apiClient.get("/movements/export", {
        params: filters,
        responseType: "blob", // Importante: le dice a axios que espere un archivo
      });
      return response;
    } catch (error) {
      // El error de un blob no viene como JSON, por lo que no usamos error.response?.data
      throw error;
    }
  },
  // --- ✅ FIN DE LA CORRECCIÓN ---
};