// backend/routes/auth.js

const express = require("express");
const { auth } = require("../config/firebase"); // Usar el auth de Firebase
const { authenticate } = require("../middleware/auth");
const { logActivity } = require("../utils/logActivity");

const router = express.Router();

// --- ✨ NUEVA RUTA: Asignar rol después del registro ---
// El frontend llamará a esta ruta después de que un usuario se registre en Firebase.
router.post("/set-initial-role", authenticate, async (req, res) => {
    const { rol } = req.body;
    const uid = req.user.uid;

    // Por seguridad, solo permitimos asignar el rol de 'operador' desde aquí.
    // Los administradores se deben asignar manualmente o desde un panel de admin seguro.
    const roleToSet = rol === 'operador' ? 'operador' : 'operador';

    try {
        // Asignamos el rol como un 'custom claim' en el token del usuario.
        await auth.setCustomUserClaims(uid, { rol: roleToSet });

        res.json({
            success: true,
            message: `Rol '${roleToSet}' asignado al usuario.`,
        });
    } catch (error) {
        console.error("Error al asignar rol:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor." });
    }
});


// --- ✨ RUTA MODIFICADA: Obtener Perfil ---
// Ya no necesitamos consultar la base de datos, la info está en el token.
router.get("/profile", authenticate, (req, res) => {
    const { name, email, uid, rol } = req.user;
    const profileData = {
        nombre: name || email, // Firebase no siempre tiene 'name' por defecto
        email,
        id: uid, // Usamos el UID de Firebase como ID
        rol: rol || 'operador' // Rol por defecto si no está en los claims
    };
    logActivity(req.user.email, 'SESION_VERIFICADA', `Usuario ${req.user.email} verificó su sesión.`);
    res.json({
        success: true,
        data: { usuario: profileData },
    });
});


// ¡Las rutas de login y logout ya no son necesarias aquí!
// El frontend las manejará directamente con el SDK de cliente de Firebase.

module.exports = router;