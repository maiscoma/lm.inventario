// backend/routes/settings.js

const express = require("express");
const { db } = require("../config/firebase");
const { authenticate, requireAdmin } = require("../middleware/auth");
const { logActivity } = require("../utils/logActivity");

const router = express.Router();

const SETTINGS_COLLECTION = "system_settings";
const CATEGORIES_DOC = "product_categories";

// GET: Obtener todas las categorías
router.get("/categories", authenticate, async (req, res) => {
    try {
        const doc = await db.collection(SETTINGS_COLLECTION).doc(CATEGORIES_DOC).get();
        if (!doc.exists) {
            return res.json({ success: true, data: [] });
        }
        res.json({ success: true, data: doc.data().list || [] });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error al obtener categorías." });
    }
});

// POST: Actualizar la lista de categorías
router.post("/categories", authenticate, requireAdmin, async (req, res) => {
    const { categories } = req.body;
    if (!Array.isArray(categories)) {
        return res.status(400).json({ success: false, message: "Formato de datos incorrecto." });
    }

    try {
        await db.collection(SETTINGS_COLLECTION).doc(CATEGORIES_DOC).set({ list: categories });

        await logActivity(
            req.user.email,
            'ACTUALIZAR_CONFIGURACION',
            `Se actualizaron las categorías de productos.`
        );

        res.json({ success: true, message: "Categorías actualizadas correctamente." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error al guardar las categorías." });
    }
});

module.exports = router;