// frontend/src/services/userService.js

import { apiClient } from "./authService";

export const userService = {
    getAll: async () => {
        try {
            const response = await apiClient.get("/users");
            return response;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    updateRole: async (uid, rol) => {
        try {
            const response = await apiClient.put(`/users/${uid}/role`, { rol });
            return response;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    updateStatus: async (uid, activo) => {
        try {
            const response = await apiClient.put(`/users/${uid}/status`, { activo });
            return response;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    delete: async (uid) => {
        try {
            const response = await apiClient.delete(`/users/${uid}`);
            return response;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
};