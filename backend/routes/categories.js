const express = require("express")
const { db } = require("../config/firebase")
const { authenticate, requireAdmin } = require("../middleware/auth")

const router = express.Router()

// GET all categories (extracted from products)
router.get("/", authenticate, async (req, res) => {
  try {
    const productsRef = db.collection("products")
    const snapshot = await productsRef.get()

    const categoriesSet = new Set()
    const categoryStats = {}

    snapshot.docs.forEach((doc) => {
      const product = doc.data()
      if (product.categoria && product.categoria.trim() !== "") {
        const categoria = product.categoria.trim()
        categoriesSet.add(categoria)

        if (!categoryStats[categoria]) {
          categoryStats[categoria] = {
            nombre: categoria,
            productCount: 0,
            totalStock: 0,
            totalValue: 0,
          }
        }

        categoryStats[categoria].productCount += 1

        if (product.stock && product.stock.actual) {
          categoryStats[categoria].totalStock += product.stock.actual
        }

        if (product.stock && product.precios && product.precios.compra) {
          categoryStats[categoria].totalValue += (product.stock.actual || 0) * product.precios.compra
        }
      }
    })

    // Convert to array and sort alphabetically
    const categories = Array.from(categoriesSet)
      .map((categoria) => ({
        id: categoria, // Use category name as ID
        nombre: categoria,
        productCount: categoryStats[categoria].productCount,
        totalStock: categoryStats[categoria].totalStock,
        totalValue: Math.round(categoryStats[categoria].totalValue),
        activa: true, // All categories from products are considered active
      }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre))

    res.json({ success: true, data: categories })
  } catch (error) {
    console.error("Error al obtener categorías:", error)
    res.status(500).json({ success: false, message: "Error interno del servidor" })
  }
})

// GET a single category by name
router.get("/:id", authenticate, async (req, res) => {
  try {
    const categoryName = decodeURIComponent(req.params.id)

    const productsRef = db.collection("products")
    const snapshot = await productsRef.where("categoria", "==", categoryName).get()

    if (snapshot.empty) {
      return res.status(404).json({ success: false, message: "Categoría no encontrada" })
    }

    let productCount = 0
    let totalStock = 0
    let totalValue = 0
    const products = []

    snapshot.docs.forEach((doc) => {
      const product = { id: doc.id, ...doc.data() }
      products.push(product)
      productCount += 1

      if (product.stock && product.stock.actual) {
        totalStock += product.stock.actual
      }

      if (product.stock && product.precios && product.precios.compra) {
        totalValue += (product.stock.actual || 0) * product.precios.compra
      }
    })

    const category = {
      id: categoryName,
      nombre: categoryName,
      productCount,
      totalStock,
      totalValue: Math.round(totalValue),
      activa: true,
      products,
    }

    res.json({ success: true, data: category })
  } catch (error) {
    console.error("Error al obtener la categoría:", error)
    res.status(500).json({ success: false, message: "Error interno del servidor" })
  }
})

// POST a new category (Admin only) - Creates a placeholder product with the category
router.post("/", authenticate, requireAdmin, async (req, res) => {
  try {
    const { nombre, descripcion } = req.body

    if (!nombre || nombre.trim() === "") {
      return res.status(400).json({ success: false, message: "El nombre de la categoría es requerido" })
    }

    const categoryName = nombre.trim()

    const existingSnapshot = await db.collection("products").where("categoria", "==", categoryName).limit(1).get()

    if (!existingSnapshot.empty) {
      return res.status(400).json({ success: false, message: "Ya existe una categoría con ese nombre" })
    }

    // Create a placeholder/template product for this category
    const placeholderProduct = {
      nombre: `Plantilla - ${categoryName}`,
      categoria: categoryName,
      descripcion: descripcion || `Producto plantilla para la categoría ${categoryName}`,
      sku: `TEMPLATE-${categoryName.toUpperCase().replace(/\s+/g, "-")}`,
      estado: "inactivo", // Mark as inactive so it doesn't appear in regular listings
      stock: {
        actual: 0,
        minimo: 0,
        maximo: 0,
      },
      precios: {
        compra: 0,
        venta: 0,
      },
      fechaIngreso: new Date(),
      isTemplate: true, // Special flag to identify template products
    }

    const docRef = await db.collection("products").add(placeholderProduct)

    res.status(201).json({
      success: true,
      message: "Categoría creada exitosamente",
      data: {
        id: categoryName,
        nombre: categoryName,
        descripcion,
        productCount: 1,
        templateProductId: docRef.id,
      },
    })
  } catch (error) {
    console.error("Error al crear la categoría:", error)
    res.status(500).json({ success: false, message: "Error interno del servidor" })
  }
})

// PUT (update) a category (Admin only) - Updates all products with this category
router.put("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const oldCategoryName = decodeURIComponent(req.params.id)
    const { nombre: newCategoryName } = req.body

    if (!newCategoryName || newCategoryName.trim() === "") {
      return res.status(400).json({ success: false, message: "El nuevo nombre de la categoría es requerido" })
    }

    const newName = newCategoryName.trim()

    if (oldCategoryName !== newName) {
      const existingSnapshot = await db.collection("products").where("categoria", "==", newName).limit(1).get()

      if (!existingSnapshot.empty) {
        return res.status(400).json({ success: false, message: "Ya existe una categoría con ese nombre" })
      }
    }

    // Update all products with the old category name
    const productsSnapshot = await db.collection("products").where("categoria", "==", oldCategoryName).get()

    if (productsSnapshot.empty) {
      return res.status(404).json({ success: false, message: "Categoría no encontrada" })
    }

    const batch = db.batch()

    productsSnapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { categoria: newName })
    })

    await batch.commit()

    res.json({
      success: true,
      message: "Categoría actualizada exitosamente",
      updatedProducts: productsSnapshot.size,
    })
  } catch (error) {
    console.error("Error al actualizar la categoría:", error)
    res.status(500).json({ success: false, message: "Error interno del servidor" })
  }
})

// DELETE a category (Admin only) - Removes category from all products
router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const categoryName = decodeURIComponent(req.params.id)

    const productsSnapshot = await db.collection("products").where("categoria", "==", categoryName).get()

    if (productsSnapshot.empty) {
      return res.status(404).json({ success: false, message: "Categoría no encontrada" })
    }

    // Check if there are non-template products
    const nonTemplateProducts = productsSnapshot.docs.filter((doc) => !doc.data().isTemplate)

    if (nonTemplateProducts.length > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar la categoría porque está siendo utilizada por ${nonTemplateProducts.length} producto(s)`,
      })
    }

    // Delete all template products for this category
    const batch = db.batch()

    productsSnapshot.docs.forEach((doc) => {
      if (doc.data().isTemplate) {
        batch.delete(doc.ref)
      }
    })

    await batch.commit()

    res.json({
      success: true,
      message: "Categoría eliminada exitosamente",
      deletedTemplates: productsSnapshot.size,
    })
  } catch (error) {
    console.error("Error al eliminar la categoría:", error)
    res.status(500).json({ success: false, message: "Error interno del servidor" })
  }
})

// GET products count by category
router.get("/:id/products-count", authenticate, async (req, res) => {
  try {
    const categoryName = decodeURIComponent(req.params.id)

    const snapshot = await db
      .collection("products")
      .where("categoria", "==", categoryName)
      .where("isTemplate", "!=", true) // Exclude template products
      .get()

    res.json({ success: true, data: { count: snapshot.size } })
  } catch (error) {
    console.error("Error al contar productos de la categoría:", error)
    res.status(500).json({ success: false, message: "Error interno del servidor" })
  }
})

module.exports = router
