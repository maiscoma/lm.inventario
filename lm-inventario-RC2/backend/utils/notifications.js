// backend/utils/notifications.js
const { db } = require("../config/firebase");
const { Timestamp } = require("firebase-admin/firestore");

/**
 * Crea una notificación en Firestore para un usuario específico.
 * @param {string} userId - El UID del usuario de Firebase.
 * @param {string} message - El mensaje de la notificación.
 * @param {string} type - El tipo de notificación (ej: 'stock_alert', 'info').
 * @param {string|null} link - Un enlace opcional para la notificación.
 */
const createNotification = async (userId, message, type = 'info', link = null) => {
    if (!userId || !message) return;

    try {
        const notificationData = {
            userId,
            message,
            type,
            link,
            read: false,
            createdAt: Timestamp.now(),
        };
        await db.collection("notifications").add(notificationData);
        console.log(`🔔 Notificación creada para el usuario ${userId}`);
    } catch (error) {
        console.error("Error al crear la notificación:", error);
    }
};

module.exports = { createNotification };