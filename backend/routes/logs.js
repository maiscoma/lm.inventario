// backend/routes/logs.js
const express = require("express");
const { db } = require("../config/firebase");
const { authenticate, requireAdmin } = require("../middleware/auth");
const ExcelJS = require("exceljs");

const router = express.Router();

router.get("/", authenticate, requireAdmin, async (req, res) => {
    try {
        const logsRef = db.collection("system_logs");
        const snapshot = await logsRef.orderBy("timestamp", "desc").limit(100).get();
        const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error al obtener logs." });
    }
});

router.get("/export", authenticate, async (req, res) => {
    try {
const snapshot = await db.collection("system_logs").orderBy("timestamp", "desc").get(); 
        const logs = snapshot.docs.map(doc => doc.data());
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Logs del Sistema");

        worksheet.columns = [
            { header: "Fecha y Hora", key: "timestamp", width: 25 },
            { header: "Usuario", key: "actor", width: 30 }, // Usa 'actor'
            { header: "Acción", key: "action", width: 25 },
            { header: "Detalles", key: "details", width: 80 },
        ];
        worksheet.getRow(1).font = { bold: true };

        logs.forEach(log => {
            worksheet.addRow({
                timestamp: new Date(log.timestamp._seconds * 1000).toLocaleString("es-CL"),
                actor: log.actor, // Usa 'actor'
                action: log.action,
                details: log.details,
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=reporte_logs.xlsx');
        
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error("Error al exportar logs:", error);
        res.status(500).send("Error al generar el reporte de logs.");
    }
});
module.exports = router;