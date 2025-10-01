// backend/routes/movements.js

const express = require("express");
const { db } = require("../config/firebase"); // Usamos la instancia 'db' del SDK de Admin
const { authenticate } = require("../middleware/auth");
const { Timestamp, FieldValue } = require("firebase-admin/firestore");
const ExcelJS = require("exceljs");
const { createNotification } = require("../utils/notifications");
const { logActivity } = require("../utils/logActivity");

const router = express.Router();

// --- INICIO: CÓDIGO MODIFICADO PARA EXPORTAR REPORTE ---
router.get("/export", authenticate, async (req, res) => {
    try {
        // --- ✅ CORRECCIÓN: Esta línea faltaba ---
        // Extrae las fechas del filtro que envía el frontend
        const { startDate, endDate } = req.query;

        // Valida que las fechas existan para evitar errores
        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, message: "Las fechas de inicio y fin son requeridas." });
        }

        // 1. Lógica de fecha corregida (USA HORA LOCAL)
        const startOfDay = new Date(startDate + 'T00:00:00');
        const endOfDay = new Date(endDate + 'T23:59:59.999');

        let movementsQuery = db.collection("movements")
            .where("date", ">=", Timestamp.fromDate(startOfDay))
            .where("date", "<=", Timestamp.fromDate(endOfDay));

        const movementsSnapshot = await movementsQuery.orderBy("date", "desc").get();
        const movements = movementsSnapshot.docs.map(doc => doc.data());

        // 2. Creación del archivo Excel
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`Reporte Movimientos`);

        worksheet.columns = [
            // ... (tus columnas de Excel - sin cambios aquí)
            { header: "Fecha", key: "date", width: 25 },
            { header: "SKU", key: "sku", width: 20 },
            { header: "Producto", key: "productName", width: 35 },
            { header: "Tipo", key: "type", width: 15 },
            { header: "Cantidad", key: "quantity", width: 15 },
            { header: "Motivo", key: "reason", width: 25 },
            { header: "Usuario", key: "userEmail", width: 25 },
            { header: "Observaciones", key: "observations", width: 40 },
        ];
        worksheet.getRow(1).font = { bold: true };

        // 3. Llenado seguro de las filas
        movements.forEach(movement => {
            let formattedDate = "Fecha inválida";
            if (movement.date && typeof movement.date._seconds === 'number') {
                formattedDate = new Date(movement.date._seconds * 1000).toLocaleString("es-CL");
            }

            const rowData = {
                date: formattedDate,
                sku: movement.sku || "N/A",
                productName: movement.productName || "Sin nombre",
                type: movement.type || "Sin tipo",
                quantity: typeof movement.quantity === 'number' ? movement.quantity : 0,
                reason: movement.reason || "Sin motivo",
                userEmail: movement.userEmail || "Usuario desconocido",
                observations: movement.observations || "",
            };
            worksheet.addRow(rowData);
        });

        // 4. Envío del archivo al navegador
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=reporte_movimientos.xlsx`);
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error("Error al exportar reporte de movimientos:", error);
        res.status(500).json({ success: false, message: "Error al exportar el reporte." });
    }
});

// --- FIN: CÓDIGO MODIFICADO ---

// --- INICIO: CÓDIGO MODIFICADO ---
// GET all movements (con filtro de fecha opcional)
router.get("/", authenticate, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let movementsQuery = db.collection("movements");

        // Aplicar filtro de fecha de inicio si existe
        if (startDate) {
            // Corrección: Tratar la fecha como local para evitar problemas de zona horaria.
            const startOfDay = new Date(startDate + 'T00:00:00');
            movementsQuery = movementsQuery.where("date", ">=", Timestamp.fromDate(startOfDay));
        }

        // Aplicar filtro de fecha de fin si existe
        if (endDate) {
            // Corrección: Tratar la fecha como local y asegurar que cubra todo el día.
            const endOfDay = new Date(endDate + 'T23:59:59.999');
            movementsQuery = movementsQuery.where("date", "<=", Timestamp.fromDate(endOfDay));
        }

        // Ordenar siempre por fecha descendente
        const snapshot = await movementsQuery.orderBy("date", "desc").get();

        const movements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json({ success: true, data: movements });
    } catch (error) {
        console.error("Error al obtener movimientos:", error);
        res.status(500).json({ success: false, message: "Error al obtener movimientos. Posiblemente falte un índice en la base de datos." });
    }
});
// ✨ INICIO DEL CÓDIGO CORREGIDO Y MEJORADO ✨
router.post("/", authenticate, async (req, res) => {
    const { productId, type, quantity, reason, observaciones } = req.body;

    if (!productId || !type || !quantity || !reason) {
        return res.status(400).json({ success: false, message: "Faltan datos requeridos." });
    }

    const productRef = db.collection("products").doc(productId);

    try {
        let notificationToCreate = null;
        let productNameForLog = ''; // <-- 1. CORRECCIÓN: Se inicializa aquí.

        await db.runTransaction(async (transaction) => {
            const productDoc = await transaction.get(productRef);
            if (!productDoc.exists) {
                throw new Error("Producto no encontrado.");
            }

            const productData = productDoc.data();
            productNameForLog = productData.nombre; // <-- Se asigna el nombre.

            const currentStock = Number(productData.stock.actual);
            const newStock = type === "entrada" ? currentStock + Number(quantity) : currentStock - Number(quantity);

            if (newStock < 0) {
                throw new Error("No hay stock suficiente para esta salida.");
            }

            const stockMinimo = productData.stock.minimo || 0;
            if (newStock <= stockMinimo && currentStock > stockMinimo) {
                notificationToCreate = {
                    message: `Alerta de stock bajo para "${productData.nombre}". Stock actual: ${newStock}.`,
                    type: 'stock_alert',
                    link: `/products/edit/${productId}`
                };
            }

            let newStatus = productData.estado;
            if (newStock === 0) {
                newStatus = "sin-stock";
            } else if (newStock > 0 && productData.estado === "sin-stock") {
                newStatus = "activo";
            }

            transaction.update(productRef, {
                "stock.actual": newStock,
                fechaUltimoMovimiento: Timestamp.now(),
                estado: newStatus,
            });

            const movementRef = db.collection("movements").doc();
            transaction.set(movementRef, {
                productId,
                type,
                quantity: Number(quantity),
                reason,
                observaciones,
                userId: req.user.uid,
                userName: req.user.name || req.user.email,
                date: Timestamp.now(),
                stock_anterior: currentStock,
                stock_nuevo: newStock,
                productInfo: {
                    nombre: productData.nombre,
                    sku: productData.sku
                }
            });
        });

        if (notificationToCreate) {
            await createNotification(
                req.user.uid,
                notificationToCreate.message,
                notificationToCreate.type,
                notificationToCreate.link
            );
        }

        // --- 2. CORRECCIÓN: Se crea el log DESPUÉS de que la transacción fue exitosa ---
        await logActivity(
            req.user.email,
            'REGISTRAR_MOVIMIENTO',
            `Tipo: ${type}, Producto: "${productNameForLog}", Cantidad: ${quantity}, Razón: ${reason}`
        );

        res.status(201).json({ success: true, message: "Movimiento registrado exitosamente." });

    } catch (error) {
        console.error("Error en la transacción de movimiento:", error);
        const statusCode = error.message.includes("stock") || error.message.includes("Producto no encontrado") ? 400 : 500;

        // --- 3. CORRECCIÓN: Mensaje de error más claro para el frontend ---
        // Ahora el frontend recibirá el mensaje "productNameForLog is not defined" si vuelve a ocurrir.
        res.status(statusCode).json({ success: false, message: error.message || "Error al registrar el movimiento." });
    }
});
// ✨ FIN DEL CÓDIGO CORREGIDO Y MEJORADO ✨

module.exports = router;