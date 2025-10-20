import { apiClient } from "./authService";

export const systemLogsService = {
    getAll: async () => {
        try {
            const response = await apiClient.get("/logs");
            return response;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    exportLogs: async () => {
        try {
            const response = await apiClient.get("/logs/export", {
                responseType: "blob", // Clave: le dice que espere un archivo
            });
            return response;
        } catch (error) {
            throw error;
        }
    },
};