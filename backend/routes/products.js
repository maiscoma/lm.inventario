// backend/routes/products.js

const express = require("express");
const { db } = require("../config/firebase");
const { requireAdmin, authenticate } = require("../middleware/auth");
const { Timestamp } = require("firebase-admin/firestore");
const multer = require("multer");
const ExcelJS = require("exceljs");
const { logActivity } = require("../utils/logActivity");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// --- RUTA PARA GENERAR LA PLANTILLA DE IMPORTACIÓN (CORREGIDA) ---
router.get("/template", authenticate, (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Plantilla Productos");

    worksheet.columns = [
      { header: "SKU (*)", key: "sku", width: 20 },
      { header: "Nombre (*)", key: "nombre", width: 35 },
      { header: "Categoria (*)", key: "categoria", width: 25 },
      { header: "StockActual (*)", key: "stock_actual", width: 15 },
      { header: "StockMinimo (*)", key: "stock_minimo", width: 15 },
      { header: "StockMaximo", key: "stock_maximo", width: 15 }, // <-- AÑADIDO
      { header: "PrecioCompra", key: "precio_compra", width: 15 },
      { header: "PrecioVenta", key: "precio_venta", width: 15 },
      { header: "Descripcion", key: "descripcion", width: 40 },
      { header: "ImageUrl", key: "imageUrl", width: 40 }, // <-- AÑADIDO
      { header: "Marca", key: "marca", width: 20 },
      { header: "Modelo", key: "modelo", width: 20 },
      { header: "UnidadDeMedida", key: "unidadMedida", width: 20 },
      { header: "CodigoDeBarras", key: "codigoBarras", width: 25 },
      { header: "Notas", key: "notas", width: 40 },
    ];

    worksheet.getRow(1).eachCell((cell) => {
      if (cell.value.includes("(*)")) {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF007bff' } };
      } else {
        cell.font = { bold: true };
      }
    });

    worksheet.addRow({
      sku: "EJEMPLO-001", nombre: "Teclado Mecánico RGB", categoria: "Periféricos",
      stock_actual: 50, stock_minimo: 10, precio_compra: 25000, precio_venta: 45000,
      descripcion: "Teclado con switches rojos, ideal para gaming.", marca: "Marca Ejemplo",
      modelo: "Modelo X-2025", unidadMedida: "unidad", codigoBarras: "1234567890123",
      notas: "Importado masivamente"
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=plantilla_importacion_productos.xlsx");

    workbook.xlsx.write(res).then(() => res.end());

  } catch (error) {
    console.error("Error al generar la plantilla:", error);
    res.status(500).json({ success: false, message: "Error al generar la plantilla" });
  }
});

// --- RUTA PARA EXPORTAR PRODUCTOS ---
router.get("/export", authenticate, async (req, res) => {
  try {
    const snapshot = await db.collection("products").get();
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Productos");

    worksheet.columns = [
      { header: "SKU", key: "sku", width: 20 }, { header: "Nombre", key: "nombre", width: 35 },
      { header: "Categoria", key: "categoria", width: 25 }, { header: "StockActual", key: "stock_actual", width: 15 },
      { header: "StockMinimo", key: "stock_minimo", width: 15 }, { header: "PrecioCompra", key: "precio_compra", width: 15 },
      { header: "PrecioVenta", key: "precio_venta", width: 15 }, { header: "Descripcion", key: "descripcion", width: 40 },
      { header: "Marca", key: "marca", width: 20 }, { header: "Modelo", key: "modelo", width: 20 },
      { header: "UnidadDeMedida", key: "unidadMedida", width: 20 }, { header: "CodigoDeBarras", key: "codigoBarras", width: 25 },
      { header: "Notas", key: "notas", width: 40 },
    ];

    products.forEach(p => {
      worksheet.addRow({
        sku: p.sku, nombre: p.nombre, categoria: p.categoria,
        stock_actual: p.stock?.actual || 0, stock_minimo: p.stock?.minimo || 0,
        precio_compra: p.precios?.compra || 0, precio_venta: p.precios?.venta || 0,
        descripcion: p.descripcion, marca: p.marca, modelo: p.modelo,
        unidadMedida: p.unidadMedida, codigoBarras: p.codigoBarras, notas: p.notas,
      });
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=exportacion_productos_${new Date().toISOString().split('T')[0]}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error al exportar productos:", error);
    res.status(500).json({ success: false, message: "Error al exportar productos" });
  }
});

// --- RUTA DE IMPORTACIÓN (CORREGIDA) ---
router.post("/import", authenticate, requireAdmin, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "No se ha subido ningún archivo." });
  try {
    const categoriesDoc = await db.collection("system_settings").doc("product_categories").get();
    const validCategories = categoriesDoc.exists ? categoriesDoc.data().list : [];
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const worksheet = workbook.worksheets[0];
    const productsToImport = [], errors = [];
    let successfulImports = 0;

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return;

      const productData = {
        sku: row.getCell(1).value, nombre: row.getCell(2).value, categoria: row.getCell(3).value,
        stock_actual: Number(row.getCell(4).value) || 0, stock_minimo: Number(row.getCell(5).value) || 0,
        stock_maximo: Number(row.getCell(6).value) || 1000, // <-- AÑADIDO
        precio_compra: Number(row.getCell(7).value) || 0, precio_venta: Number(row.getCell(8).value) || 0,
        descripcion: row.getCell(9).value || "",
        imageUrl: row.getCell(10).value || null, // <-- AÑADIDO
        marca: row.getCell(11).value || "", modelo: row.getCell(12).value || "",
        unidadMedida: row.getCell(13).value || "unidad", codigoBarras: row.getCell(14).value || null,
        notas: row.getCell(15).value || "",
      };

      if (!productData.sku || !productData.nombre || !productData.categoria) {
        errors.push({ row: rowNumber, message: "Faltan campos obligatorios." }); return;
      }
      if (!validCategories.includes(productData.categoria)) {
        errors.push({ row: rowNumber, message: `La categoría "${productData.categoria}" no es válida.` }); return;
      }
      productsToImport.push(productData);
    });

    if (productsToImport.length > 0) {
      const batch = db.batch();
      for (const prod of productsToImport) {
        const productRef = db.collection("products").doc();
        batch.set(productRef, {
          ...prod, // Usamos todos los campos leídos
          stock: { actual: prod.stock_actual, minimo: prod.stock_minimo, maximo: prod.stock_maximo },
          precios: { compra: prod.precio_compra, venta: prod.precio_venta, margen: 0 },
          estado: 'activo', fechaIngreso: Timestamp.now(), fechaUltimoMovimiento: null,
        });
        successfulImports++;
      }
      await batch.commit();
    }

    await logActivity(req.user.email, 'IMPORTAR_PRODUCTOS', `Importación: ${successfulImports} productos, ${errors.length} errores.`);
    res.status(200).json({ success: true, message: "Proceso finalizado.", data: { successfulImports, errors } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error interno al procesar el archivo." });
  }
});
// GET all products
router.get("/", authenticate, async (req, res) => {
  try {
    const productsRef = db.collection("products");
    const snapshot = await productsRef.get();
    const products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, data: products });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

// GET a single product by ID
router.get("/:id", authenticate, async (req, res) => {
  try {
    const docRef = db.collection("products").doc(req.params.id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return res.status(404).json({ success: false, message: "Producto no encontrado" });
    }
    res.json({ success: true, data: { id: docSnap.id, ...docSnap.data() } });
  } catch (error) {
    console.error("Error al obtener el producto:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

// POST a new product
router.post("/", authenticate, async (req, res) => {
  try {
    const newProductData = req.body;

    // --- INICIO DE LA MODIFICACIÓN ---
    // Añadir campos por defecto al crear un producto para asegurar la integridad de los datos
    const productToCreate = {
      ...newProductData,
      estado: 'activo', // Por defecto, el producto está activo
      fechaIngreso: Timestamp.now(), // La fecha de ingreso es ahora
      fechaUltimoMovimiento: null, // No hay movimientos al crear
      imageUrl: newProductData.imageUrl || null, // Asegurar que el campo exista
      // ✨ INICIO DE LA MODIFICACIÓN ✨
      codigoBarras: newProductData.codigoBarras || null, // Añadir código de barras
      notas: newProductData.notas || "", // Añadir notas
      // ✨ FIN DE LA MODIFICACIÓN ✨
    };
    // --- FIN DE LA MODIFICACIÓN ---

    const docRef = await db.collection("products").add(productToCreate);
    // --- AÑADIR LOG AQUÍ ---
    await logActivity(
      req.user.email,
      'CREAR_PRODUCTO',
      `Producto creado: "${productToCreate.nombre}" (SKU: ${productToCreate.sku})`
    );
    // --- FIN DEL LOG ---
    res.status(201).json({
      success: true,
      message: "Producto creado exitosamente",
      data: { id: docRef.id, ...productToCreate }
    });
  } catch (error) {
    console.error("Error al crear el producto:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});


// PUT (update) a product
router.put("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const docRef = db.collection("products").doc(req.params.id);
    await docRef.update(req.body);
    // --- INICIO DE LA MEJORA ---
    const updatedProduct = req.body; // Los datos actualizados vienen en el body
    await logActivity(
      req.user.email,
      'ACTUALIZAR_PRODUCTO',
      `Producto actualizado: "${updatedProduct.nombre}" (SKU: ${updatedProduct.sku})`
    );
    // --- FIN DE LA MEJORA ---
    res.json({ success: true, message: "Producto actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar el producto:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

// DELETE a product (Admin only)
router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const docRef = db.collection("products").doc(req.params.id);
    // --- INICIO DE LA MEJORA ---
    // Obtenemos los datos del producto ANTES de eliminarlo
    const productDoc = await docRef.get();
    const productNameForLog = productDoc.exists ? productDoc.data().nombre : `ID: ${req.params.id}`;
    // --- FIN DE LA MEJORA ---

    await docRef.delete();

    // --- INICIO DE LA MEJORA ---
    await logActivity(
      req.user.email,
      'ELIMINAR_PRODUCTO',
      `Producto "${productNameForLog}" eliminado.`
    );
    // --- FIN DE LA MEJORA ---
    res.json({ success: true, message: "Producto eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});



module.exports = router;