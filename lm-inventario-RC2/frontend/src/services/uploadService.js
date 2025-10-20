// frontend/src/services/uploadService.js

// 1. Importa la instancia de axios preconfigurada desde authService.
import { apiClient } from "./authService";

// 2. Ya no necesitas la URL base ni la importación directa de axios.

export const uploadService = {
  uploadImage: async (imageFile, onUploadProgress) => {
    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      // 3. Usa `apiClient` en lugar de `axios`.
      // La instancia ya incluye el token de autorización en sus headers.
      const response = await apiClient.post("/upload", formData, {
        headers: {
          // El 'Content-Type' es importante mantenerlo aquí para que el backend
          // sepa que está recibiendo datos de un formulario (multipart/form-data).
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress,
      });

      // El interceptor de `apiClient` ya devuelve `response.data`.
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};