Documentación de la API - LM Labor Soft SpA
Esta documentación describe los endpoints disponibles en la API del sistema de inventario.

URL Base: /api

Autenticación
Todos los endpoints (excepto el de login/registro) requieren un token de autenticación en la cabecera:

Authorization: Bearer <FIREBASE_ID_TOKEN>

Productos (/products)
GET /products
Recupera una lista paginada de productos.

Query Params:

page (number, opcional): Número de página.

limit (number, opcional): Productos por página.

searchTerm (string, opcional): Filtra por nombre, SKU o descripción.

category (string, opcional): Filtra por ID de categoría.

orderBy (string, opcional): Campo por el que ordenar (name, stock).

order (string, opcional): asc o desc.

Respuesta Exitosa (200):

JSON

{
  "products": [ { "id": "...", "name": "...", "stock": 10 } ],
  "totalPages": 5,
  "currentPage": 1
}
POST /products
Crea un nuevo producto.

Body (JSON):

JSON

{
  "name": "Producto de Ejemplo",
  "sku": "SKU-001",
  "description": "Descripción",
  "price": 100.00,
  "stock": 50,
  "minStock": 10,
  "categoryId": "..."
}
Respuesta Exitosa (201):

JSON

{
  "id": "ID_DEL_NUEVO_PRODUCTO",
  "message": "Producto creado exitosamente"
}
Movimientos (/movements)
POST /movements
Registra un nuevo movimiento de inventario (entrada o salida).

Body (JSON):

JSON

{
  "productId": "ID_DEL_PRODUCTO",
  "type": "entrada" | "salida",
  "quantity": 10,
  "reason": "Compra inicial"
}
Respuesta Exitosa (201):

JSON

{
  "message": "Movimiento registrado y stock actualizado"
}
Reportes (/reports)
GET /reports/low-stock
Obtiene una lista de productos con stock bajo o crítico.

Respuesta Exitosa (200):

JSON

[
  { "id": "...", "name": "Producto con poco stock", "stock": 5, "minStock": 10 }
]
GET /reports/inventory-stats
Calcula el valor total del inventario.

Respuesta Exitosa (200):

JSON

{
  "totalValue": 15000.50,
  "totalItems": 500,
  "productCount": 50
}