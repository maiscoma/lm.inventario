import { apiClient } from "./authService";

export const databaseService = {
    createBackup: async () => {
        try {
            const response = await apiClient.get("/database/backup", {
                responseType: "blob",
            });
            return response;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
};