// migrate_movements.js

const { db, admin } = require('../config/firebase'); // Re-utiliza tu configuración de Firebase

/**
 * Script para migrar datos antiguos de movimientos.
 * Añade el objeto `productInfo` a los movimientos que no lo tengan.
 */
async function migrateMovements() {
    console.log("Iniciando migración de movimientos...");

    const movementsRef = db.collection('movements');
    const productsCache = new Map(); // Un caché para no buscar el mismo producto mil veces

    try {
        // Obtenemos solo los movimientos que NO tienen el campo productInfo
        const snapshot = await movementsRef.where('productInfo', '==', null).get();

        if (snapshot.empty) {
            console.log("No hay movimientos que necesiten ser migrados. ¡Todo está al día!");
            return;
        }

        console.log(`Se encontraron ${snapshot.docs.length} movimientos para migrar.`);

        // Usamos un batch para hacer todas las escrituras en un solo envío a Firestore
        const batch = db.batch();
        let operationsCount = 0;

        for (const doc of snapshot.docs) {
            const movement = doc.data();
            const productId = movement.productId;

            if (!productId) {
                console.warn(`Movimiento ${doc.id} no tiene productId. Se omitirá.`);
                continue;
            }

            let productData;

            // Usamos el caché para mejorar el rendimiento
            if (productsCache.has(productId)) {
                productData = productsCache.get(productId);
            } else {
                const productRef = db.collection('products').doc(productId);
                const productDoc = await productRef.get();
                if (productDoc.exists) {
                    productData = productDoc.data();
                    productsCache.set(productId, productData); // Guardamos en caché
                }
            }

            if (productData) {
                const movementRefToUpdate = movementsRef.doc(doc.id);
                batch.update(movementRefToUpdate, {
                    productInfo: {
                        nombre: productData.nombre || "Nombre no encontrado",
                        sku: productData.sku || "SKU no encontrado"
                    }
                });
                operationsCount++;
                console.log(`Preparando actualización para movimiento ${doc.id}...`);
            } else {
                console.warn(`No se encontró el producto con ID: ${productId} para el movimiento ${doc.id}.`);
                // Opcional: puedes actualizar el movimiento para marcarlo como "producto eliminado"
                const movementRefToUpdate = movementsRef.doc(doc.id);
                batch.update(movementRefToUpdate, {
                    productInfo: {
                        nombre: "PRODUCTO ELIMINADO",
                        sku: "N/A"
                    }
                });
                operationsCount++;
            }
        }

        if (operationsCount > 0) {
            await batch.commit();
            console.log(`¡Migración completada! Se actualizaron ${operationsCount} movimientos exitosamente.`);
        } else {
            console.log("No se realizaron operaciones. Finalizando.");
        }

    } catch (error) {
        console.error("Ocurrió un error durante la migración:", error);
    }
}

// Ejecutar la función
migrateMovements();