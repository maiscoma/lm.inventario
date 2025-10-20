// frontend/src/services/reportService.js

import { apiClient } from "./authService";

export const reportService = {
  getLowStockReport: async () => {
    try {
      // Ahora la ruta correcta es /api/reports/low-stock
      const response = await apiClient.get("/reports/low-stock");
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getInventoryStats: async () => {
    try {
      const response = await apiClient.get("/reports/inventory-stats");
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getMovementStats: async () => {
    try {
      const response = await apiClient.get("/reports/movement-stats");
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  getRecentMovements: async (limit = 5) => {
    try {
        const response = await apiClient.get(`/reports/recent-movements?limit=${limit}`);
        return response;
    } catch (error) {
        throw error.response?.data || error;
    }
  },

  // --- INICIO: NUEVAS FUNCIONES DE EXPORTACIÓN ---
  exportLowStockReport: async () => {
    try {
      const response = await apiClient.get("/reports/export/low-stock", {
        responseType: "blob", // Importante para manejar archivos
      });
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  exportValuationReport: async () => {
    try {
      const response = await apiClient.get("/reports/export/valuation", {
        responseType: "blob",
      });
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  // --- FIN: NUEVAS FUNCIONES DE EXPORTACIÓN ---
};