// frontend/src/services/productService.js

import { apiClient } from "./authService";

export const productService = {
  // Obtener todos los productos
  getAll: async () => {
    try {
      const response = await apiClient.get("/products");
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Obtener un producto por ID
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/products/${id}`);
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Crear nuevo producto
  create: async (productData) => {
    try {
      const response = await apiClient.post("/products", productData);
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Actualizar producto
  update: async (id, productData) => {
    try {
      const response = await apiClient.put(`/products/${id}`, productData);
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Eliminar producto
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/products/${id}`);
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // --- INICIO: CÓDIGO AÑADIDO (DENTRO DEL OBJETO) ---
  // --- ✨ INICIO: FUNCIONES DE IMPORTACIÓN/EXPORTACIÓN ✨ ---
  exportProducts: async () => {
    try {
      const response = await apiClient.get("/products/export", {
        responseType: "blob",
      });
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  downloadImportTemplate: async () => {
    try {
      const response = await apiClient.get("/products/template", {
        responseType: "blob",
      });
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  importProducts: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await apiClient.post("/products/import", formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  // --- ✨ FIN: FUNCIONES DE IMPORTACIÓN/EXPORTACIÓN ✨ ---
};