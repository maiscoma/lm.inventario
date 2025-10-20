// backend/routes/settings.js

const express = require("express");
const { db } = require("../config/firebase");
const { authenticate, requireAdmin } = require("../middleware/auth");
const { logActivity } = require("../utils/logActivity");

const router = express.Router();

const SETTINGS_COLLECTION = "system_settings";

// --- Endpoints para Categorías de Productos ---
const CATEGORIES_DOC = "product_categories";

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

router.post("/categories", authenticate, requireAdmin, async (req, res) => {
    const { categories } = req.body;
    if (!Array.isArray(categories)) {
        return res.status(400).json({ success: false, message: "Formato de datos incorrecto." });
    }
    try {
        await db.collection(SETTINGS_COLLECTION).doc(CATEGORIES_DOC).set({ list: categories });
        await logActivity(req.user.email, 'ACTUALIZAR_CONFIGURACION', `Se actualizaron las categorías de productos.`);
        res.json({ success: true, message: "Categorías actualizadas correctamente." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error al guardar las categorías." });
    }
});


// --- NUEVO: Endpoints para Unidades de Medida ---
const UNITS_DOC = "measurement_units";

router.get("/units", authenticate, async (req, res) => {
    try {
        const doc = await db.collection(SETTINGS_COLLECTION).doc(UNITS_DOC).get();
        if (!doc.exists) {
            return res.json({ success: true, data: ['unidad', 'kg', 'litro', 'metro'] }); // Valores por defecto
        }
        res.json({ success: true, data: doc.data().list || [] });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error al obtener las unidades." });
    }
});

router.post("/units", authenticate, requireAdmin, async (req, res) => {
    const { units } = req.body;
    if (!Array.isArray(units)) {
        return res.status(400).json({ success: false, message: "Formato de datos incorrecto." });
    }
    try {
        await db.collection(SETTINGS_COLLECTION).doc(UNITS_DOC).set({ list: units });
        await logActivity(req.user.email, 'ACTUALIZAR_CONFIGURACION', `Se actualizaron las unidades de medida.`);
        res.json({ success: true, message: "Unidades de medida actualizadas." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error al guardar las unidades." });
    }
});


// --- NUEVO: Endpoints para Parámetros Generales ---
const GENERAL_DOC = "general_parameters";

router.get("/parameters", authenticate, async (req, res) => {
    try {
        const doc = await db.collection(SETTINGS_COLLECTION).doc(GENERAL_DOC).get();
        if (!doc.exists) {
            // Valores por defecto si no existen
            return res.json({ success: true, data: { companyName: "LM Labor Soft", currency: "CLP" } });
        }
        res.json({ success: true, data: doc.data() });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error al obtener los parámetros." });
    }
});

router.post("/parameters", authenticate, requireAdmin, async (req, res) => {
    const { parameters } = req.body;
    if (typeof parameters !== 'object' || parameters === null) {
        return res.status(400).json({ success: false, message: "Formato de datos incorrecto." });
    }
    try {
        await db.collection(SETTINGS_COLLECTION).doc(GENERAL_DOC).set(parameters);
        await logActivity(req.user.email, 'ACTUALIZAR_CONFIGURACION', `Se actualizaron los parámetros generales del sistema.`);
        res.json({ success: true, message: "Parámetros generales actualizados." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error al guardar los parámetros." });
    }
});

module.exports = router;