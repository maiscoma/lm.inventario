// backend/routes/database.js
const express = require("express");
const { db } = require("../config/firebase");
const { authenticate, requireAdmin } = require("../middleware/auth");
const { logActivity } = require("../utils/logActivity");
const ExcelJS = require("exceljs");

const router = express.Router();

// GET: Generar un backup completo en Excel
router.get("/backup", authenticate, requireAdmin, async (req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();

        // Lista de colecciones a respaldar
        const collectionsToBackup = ["products", "movements", "system_logs", "notifications"];

        for (const collectionName of collectionsToBackup) {
            const worksheet = workbook.addWorksheet(collectionName);
            const snapshot = await db.collection(collectionName).get();

            if (!snapshot.empty) {
                const data = snapshot.docs.map(doc => doc.data());
                // Usar las claves del primer documento como encabezados
                worksheet.columns = Object.keys(data[0]).map(key => ({ header: key, key, width: 25 }));
                worksheet.addRows(data);
            }
        }

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=backup_inventario_${new Date().toISOString().split('T')[0]}.xlsx`
        );

        await workbook.xlsx.write(res);

        await logActivity(req.user.email, 'GENERAR_BACKUP', `Se generó un backup completo de la base de datos.`);

        res.end();

    } catch (error) {
        console.error("Error al generar backup:", error);
        res.status(500).json({ success: false, message: "Error al generar el backup." });
    }
});

module.exports = router;