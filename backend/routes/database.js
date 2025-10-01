// backend/routes/database.js

const express = require("express");
// Usamos tus importaciones originales para mantener la compatibilidad
const { db } = require("../config/firebase");
const { authenticate, requireAdmin } = require("../middleware/auth");
const { logActivity } = require("../utils/logActivity");
const ExcelJS = require("exceljs");

const router = express.Router();

// Mantenemos el método GET original para que coincida con tu frontend
router.get("/backup", authenticate, requireAdmin, async (req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();
        // Usamos tu lista original de colecciones
        const collectionsToBackup = ["products", "movements", "system_logs", "notifications"];

        for (const collectionName of collectionsToBackup) {
            const worksheet = workbook.addWorksheet(collectionName);
            const snapshot = await db.collection(collectionName).get();

            if (snapshot.empty) {
                continue; // Si la colección está vacía, la saltamos.
            }

            const data = snapshot.docs.map(doc => doc.data());

            // --- INICIO DE LAS CORRECCIONES INTEGRADAS ---

            // 1. Obtenemos TODOS los encabezados de TODOS los documentos para más robustez
            const headersSet = new Set();
            data.forEach(item => {
                Object.keys(item).forEach(key => headersSet.add(key));
            });
            const headers = Array.from(headersSet);
            worksheet.getRow(1).values = headers;

            // 2. Procesamos cada fila individualmente para formatear las fechas
            data.forEach((item) => {
                const row = [];
                headers.forEach(header => {
                    const value = item[header];

                    if (value === undefined || value === null) {
                        row.push('');
                    } else if (value && typeof value.toDate === 'function') {
                        // ¡Aquí está la magia! Convertimos la fecha de Firestore
                        row.push(value.toDate());
                    } else if (typeof value === 'object') {
                        row.push(JSON.stringify(value));
                    } else {
                        row.push(value);
                    }
                });
                worksheet.addRow(row);
            });
            // --- FIN DE LAS CORRECCIONES INTEGRADAS ---
        }

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=backup_inventario_${new Date().toISOString().split('T')[0]}.xlsx`
        );
        
        await logActivity(req.user.email, 'GENERAR_BACKUP', `Se generó un backup completo de la base de datos.`);
        
        // 3. Escribimos en la respuesta y NO usamos res.end() para evitar errores de red
        return workbook.xlsx.write(res);

    } catch (error) {
        console.error("Error al generar backup:", error);
        res.status(500).send({ message: "Error interno al generar el backup.", error: error.message });
    }
});

module.exports = router;