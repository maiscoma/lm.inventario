// frontend/src/services/settingsService.js

import { apiClient } from "./authService";

export const settingsService = {
    // --- Endpoints de Categorías (sin cambios) ---
    getCategories: async () => {
        try {
            const response = await apiClient.get("/settings/categories");
            return response;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    updateCategories: async (categories) => {
        try {
            const response = await apiClient.post("/settings/categories", { categories });
            return response;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // --- NUEVO: Endpoints de Unidades de Medida ---
    getUnits: async () => {
        try {
            const response = await apiClient.get("/settings/units");
            return response;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    updateUnits: async (units) => {
        try {
            const response = await apiClient.post("/settings/units", { units });
            return response;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // --- NUEVO: Endpoints de Parámetros Generales ---
    getGeneralParameters: async () => {
        try {
            const response = await apiClient.get("/settings/parameters");
            return response;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    updateGeneralParameters: async (parameters) => {
        try {
            const response = await apiClient.post("/settings/parameters", { parameters });
            return response;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
};