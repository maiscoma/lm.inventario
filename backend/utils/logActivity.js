// backend/utils/logActivity.js
const { db } = require("../config/firebase");
const { Timestamp } = require("firebase-admin/firestore");

/**
 * Registra una actividad en la colección de logs del sistema.
 * @param {string} actor - Quién realizó la acción (ej: email del usuario).
 * @param {string} action - La acción realizada (ej: 'LOGIN_EXITOSO', 'CREO_PRODUCTO').
 * @param {string} details - Descripción detallada de la acción.
 */
const logActivity = async (actor, action, details) => {
    try {
        const logEntry = {
            actor,
            action,
            details,
            timestamp: Timestamp.now(),
        };
        await db.collection("system_logs").add(logEntry);
    } catch (error) {
        console.error("Error al registrar la actividad:", error);
    }
};

module.exports = { logActivity };