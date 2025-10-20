// backend/routes/users.js

const express = require("express");
const { auth } = require("../config/firebase");
const { authenticate, requireAdmin } = require("../middleware/auth");
const { logActivity } = require("../utils/logActivity");

const router = express.Router();

// Middleware para asegurar que solo los administradores accedan a estas rutas
router.use(authenticate, requireAdmin);

// GET: Obtener todos los usuarios
router.get("/", async (req, res) => {
    try {
        const listUsersResult = await auth.listUsers(1000); // Límite de 1000 usuarios por página
        const users = listUsersResult.users.map(userRecord => ({
            uid: userRecord.uid,
            email: userRecord.email,
            nombre: userRecord.displayName || userRecord.email,
            rol: userRecord.customClaims?.rol || 'operador',
            activo: !userRecord.disabled,
            fechaCreacion: userRecord.metadata.creationTime,
            ultimoAcceso: userRecord.metadata.lastSignInTime,
        }));
        res.json({ success: true, data: users });
    } catch (error) {
        console.error("Error al listar usuarios:", error);
        res.status(500).json({ success: false, message: "Error al obtener la lista de usuarios." });
    }
});

// PUT: Actualizar el rol de un usuario
router.put("/:uid/role", async (req, res) => {
    const { uid } = req.params;
    const { rol } = req.body;

    if (!rol || (rol !== 'administrador' && rol !== 'operador')) {
        return res.status(400).json({ success: false, message: "Rol no válido." });
    }

    try {
        await auth.setCustomUserClaims(uid, { rol });
        // --- INICIO DE LA MEJORA ---
        const affectedUser = await auth.getUser(uid); // Obtenemos el usuario afectado
        await logActivity(
            req.user.email,
            'CAMBIAR_ROL_USUARIO',
            `Rol del usuario "${affectedUser.email}" cambiado a '${rol}'.`
        );
        // --- FIN DE LA MEJORA ---
        res.json({ success: true, message: `Rol del usuario actualizado a '${rol}'.` });
    } catch (error) {
        console.error("Error al actualizar rol:", error);
        res.status(500).json({ success: false, message: "No se pudo actualizar el rol." });
    }
});

// PUT: Habilitar/Deshabilitar un usuario
router.put("/:uid/status", async (req, res) => {
    const { uid } = req.params;
    const { activo } = req.body;

    if (typeof activo !== 'boolean') {
        return res.status(400).json({ success: false, message: "El estado 'activo' debe ser verdadero o falso." });
    }

    try {
        await auth.updateUser(uid, { disabled: !activo });
        // --- INICIO DE LA MEJORA ---
        const actionText = activo ? 'habilitado' : 'deshabilitado';
        const affectedUser = await auth.getUser(uid);
        await logActivity(
            req.user.email,
            'CAMBIAR_ESTADO_USUARIO',
            `Usuario "${affectedUser.email}" fue ${actionText}.`
        );
        // --- FIN DE LA MEJORA --- 
        res.json({ success: true, message: `Usuario ${activo ? 'habilitado' : 'deshabilitado'} correctamente.` });
    } catch (error) {
        console.error("Error al cambiar estado de usuario:", error);
        res.status(500).json({ success: false, message: "No se pudo cambiar el estado del usuario." });
    }
});

// DELETE: Eliminar un usuario
router.delete("/:uid", async (req, res) => {
    const { uid } = req.params;

    try {
        // --- INICIO DE LA MEJORA ---
        // Obtenemos los datos ANTES de eliminarlo
        const affectedUser = await auth.getUser(uid);
        const userEmailForLog = affectedUser.email;
        // --- FIN DE LA MEJORA ---

        await auth.deleteUser(uid);

        // --- INICIO DE LA MEJORA ---
        await logActivity(
            req.user.email,
            'ELIMINAR_USUARIO',
            `Usuario "${userEmailForLog}" eliminado permanentemente.`
        );
        // --- FIN DE LA MEJORA ---
        res.json({ success: true, message: "Usuario eliminado permanentemente." });
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        res.status(500).json({ success: false, message: "No se pudo eliminar el usuario." });
    }
});

module.exports = router;