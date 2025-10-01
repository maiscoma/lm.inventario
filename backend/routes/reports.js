// backend/routes/reports.js

const express = require("express");
const { db } = require("../config/firebase");
const { authenticate } = require("../middleware/auth");
const { Timestamp } = require("firebase-admin/firestore");
const ExcelJS = require("exceljs");

const router = express.Router();

// Reporte de productos con bajo stock
router.get("/low-stock", authenticate, async (req, res) => {
    try {
        const productsRef = db.collection("products");
        const snapshot = await productsRef.get();
        const lowStockProducts = [];

        // <-- CORRECCIÓN: Usar .docs para iterar de forma segura
        if (!snapshot.empty) {
            snapshot.docs.forEach(doc => {
                const product = doc.data();
                if (product.stock && product.stock.actual <= product.stock.minimo) {
                    lowStockProducts.push({ id: doc.id, ...product });
                }
            });
        }

        res.json({ success: true, data: lowStockProducts, total: lowStockProducts.length });
    } catch (error) {
        console.error("Error al generar reporte de stock bajo:", error);
        res.status(500).json({ success: false, message: "Error al generar reporte de stock bajo" });
    }
});

// Ruta para exportar alertas de stock
router.get("/export/low-stock", authenticate, async (req, res) => {
    try {
        const productsRef = db.collection("products");
        const snapshot = await productsRef.get();
        const lowStockProducts = [];

        // <-- CORRECCIÓN: Usar .docs para iterar de forma segura
        if (!snapshot.empty) {
            snapshot.docs.forEach(doc => {
                const product = doc.data();
                if (product.stock && product.stock.actual <= product.stock.minimo) {
                    lowStockProducts.push({ id: doc.id, ...product });
                }
            });
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Alertas de Stock");

        worksheet.columns = [
            { header: "SKU", key: "sku", width: 20 },
            { header: "Producto", key: "nombre", width: 35 },
            { header: "Categoría", key: "categoria", width: 25 },
            { header: "Stock Actual", key: "stock_actual", width: 15 },
            { header: "Stock Mínimo", key: "stock_minimo", width: 15 },
            { header: "Unidades Faltantes", key: "unidades_faltantes", width: 20 },
        ];
        worksheet.getRow(1).font = { bold: true };

        lowStockProducts.forEach(product => {
            worksheet.addRow({
                sku: product.sku,
                nombre: product.nombre,
                categoria: product.categoria,
                stock_actual: product.stock.actual,
                stock_minimo: product.stock.minimo,
                unidades_faltantes: product.stock.minimo - product.stock.actual,
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=reporte_alertas_stock.xlsx`);

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error("Error al exportar alertas de stock:", error);
        res.status(500).json({ success: false, message: "Error al exportar el reporte." });
    }
});

// Estadísticas de valorización de inventario
router.get("/inventory-stats", authenticate, async (req, res) => {
    try {
        const snapshot = await db.collection("products").get();
        let totalValue = 0;

        // <-- CORRECCIÓN: Usar .docs para iterar de forma segura
        if (!snapshot.empty) {
            snapshot.docs.forEach(doc => {
                const product = doc.data();
                const stock = product.stock?.actual || 0;
                const costPrice = product.precios?.compra || 0;
                totalValue += stock * costPrice;
            });
        }

        res.json({ success: true, data: { totalValue } });
    } catch (error) {
        console.error("Error al calcular estadísticas de inventario:", error);
        res.status(500).json({ success: false, message: "Error al calcular estadísticas de inventario" });
    }
});

// Ruta para exportar valorización de inventario
router.get("/export/valuation", authenticate, async (req, res) => {
    try {
        const productsRef = db.collection("products");
        const snapshot = await productsRef.get();
        
        // <-- CORRECCIÓN: Inicializar como array vacío y comprobar si hay documentos
        let products = [];
        if (!snapshot.empty) {
            products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Valorizacion de Inventario");

        worksheet.columns = [
            { header: "SKU", key: "sku", width: 20 },
            { header: "Producto", key: "nombre", width: 35 },
            { header: "Stock Actual", key: "stock_actual", width: 15 },
            { header: "Precio Costo", key: "precio_costo", width: 15 },
            { header: "Precio Venta", key: "precio_venta", width: 15 },
            { header: "Valor Total (Costo)", key: "valor_costo", width: 20 },
            { header: "Valor Total (Venta)", key: "valor_venta", width: 20 },
        ];
        worksheet.getRow(1).font = { bold: true };

        let totalCosto = 0;
        let totalVenta = 0;

        products.forEach(p => {
            const stock = p.stock?.actual || 0;
            const costo = p.precios?.compra || 0;
            const venta = p.precios?.venta || 0;
            const valorCosto = stock * costo;
            const valorVenta = stock * venta;
            totalCosto += valorCosto;
            totalVenta += valorVenta;

            worksheet.addRow({
                sku: p.sku,
                nombre: p.nombre,
                stock_actual: stock,
                precio_costo: costo,
                precio_venta: venta,
                valor_costo: valorCosto,
                valor_venta: valorVenta,
            });
        });
        
        worksheet.addRow({});
        const totalRow = worksheet.addRow({
            nombre: 'TOTALES',
            valor_costo: totalCosto,
            valor_venta: totalVenta
        });
        totalRow.font = { bold: true };

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=reporte_valorizacion_inventario.xlsx`);

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error("Error al exportar valorización de inventario:", error);
        res.status(500).json({ success: false, message: "Error al exportar el reporte." });
    }
});

// Estadísticas de movimientos
router.get("/movement-stats", authenticate, async (req, res) => {
    try {
        const snapshot = await db.collection("movements").get();
        const movements = snapshot.docs.map(doc => doc.data());

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const stats = {
            totalMovements: movements.length,
            entradas: movements.filter(m => m.type === 'entrada').length,
            salidas: movements.filter(m => m.type === 'salida').length,
            recentMovements: movements.filter(m => new Date(m.date._seconds * 1000) >= sevenDaysAgo).length
        };

        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error al calcular estadísticas de movimientos" });
    }
});

// --- ✨ INICIO: CÓDIGO CORREGIDO Y MEJORADO ✨ ---
// Obtener movimientos recientes (con información del producto enriquecida)
router.get("/recent-movements", authenticate, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const snapshot = await db.collection("movements").orderBy("date", "desc").limit(limit).get();
        const movements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Procesamos cada movimiento de forma individual para hacerlo más robusto
        const enrichedMovements = await Promise.all(
            movements.map(async (mov) => {
                // Si el movimiento ya tiene la info, o no tiene un ID de producto, lo devolvemos tal cual
                if (mov.productInfo || !mov.productId) {
                    return mov;
                }

                // Si no, buscamos la información del producto
                try {
                    const productDoc = await db.collection('products').doc(mov.productId).get();
                    if (productDoc.exists) {
                        const productData = productDoc.data();
                        return {
                            ...mov,
                            productInfo: {
                                nombre: productData.nombre,
                                sku: productData.sku
                            }
                        };
                    }
                } catch (e) {
                    console.error(`Error buscando producto para movimiento ${mov.id}:`, e);
                }

                // Si el producto no se encontró o hubo un error, devolvemos el movimiento con un placeholder
                return { ...mov, productInfo: { nombre: `ID: ${mov.productId}`, sku: "N/A" } };
            })
        );

        res.json({ success: true, data: enrichedMovements });

    } catch (error) {
        console.error("Error al obtener movimientos recientes:", error);
        res.status(500).json({ success: false, message: "Error al obtener movimientos recientes" });
    }
});
// --- ✨ FIN: CÓDIGO CORREGIDO Y MEJORADO ✨ ---

module.exports = router;