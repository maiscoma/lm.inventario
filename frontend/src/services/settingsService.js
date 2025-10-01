// frontend/src/services/settingsService.js

import { apiClient } from "./authService";

export const settingsService = {
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
};