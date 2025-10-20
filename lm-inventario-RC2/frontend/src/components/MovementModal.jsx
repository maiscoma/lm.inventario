"use client"

import { useState } from "react"
import { movementService } from "../services/movementService"
import LoadingSpinner from "./LoadingSpinner"
import toast from "react-hot-toast"

const MovementModal = ({ isOpen, onClose, product, onMovementCreated }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    tipo: "entrada",
    cantidad: "",
    motivo: "",
    observaciones: "",
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.cantidad || !formData.motivo) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    const cantidad = Number.parseInt(formData.cantidad);
    if (cantidad <= 0) {
      toast.error("La cantidad debe ser mayor a 0");
      return;
    }
    // ✨ INICIO DEL CAMBIO NECESARIO: Validación de Stock Mínimo ✨
    const currentStock = product?.stock?.actual || 0;
    
    if (formData.tipo === "salida" && cantidad > currentStock) {
        toast.error(`Stock insuficiente. Stock actual: ${currentStock}`);
        return;
    }
    // ✨ FIN DEL CAMBIO NECESARIO ✨
    try {
      setLoading(true);
      
      // ✨ INICIO DE LA CORRECCIÓN ✨
      // El backend espera 'productId', no 'productoId'.
      // Nos aseguramos también de que 'product' exista antes de acceder a 'id'.
      if (!product || !product.id) {
        throw new Error("No se ha seleccionado un producto válido.");
      }

      const movementData = {
        productId: product.id, // Corregido de 'productoId' a 'productId'
        type: formData.tipo,
        quantity: cantidad,
        reason: formData.motivo,
        observaciones: formData.observaciones,
      };
      // ✨ FIN DE LA CORRECCIÓN ✨

      const response = await movementService.create(movementData);

      if (response.success) {
        toast.success("Movimiento registrado exitosamente");
        setFormData({
          tipo: "entrada",
          cantidad: "",
          motivo: "",
          observaciones: "",
        });
        onMovementCreated && onMovementCreated();
        onClose();
      }
    } catch (error) {
      console.error("Error al registrar movimiento:", error);
      toast.error(error.message || "Error al registrar el movimiento");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-card border border-dark-border rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-text-primary">Registrar Movimiento</h2>
              <p className="text-text-secondary text-sm">
                {product?.nombre} ({product?.sku})
              </p>
            </div>
            <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Current Stock Info */}
          <div className="bg-dark-surface rounded-lg p-4 mb-6">
            <div className="text-sm text-text-secondary mb-1">Stock Actual</div>
            <div className="text-2xl font-bold text-text-primary">
              {product?.stock?.actual || 0} {product?.unidadMedida || "unidades"}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Tipo de Movimiento *</label>
              <select name="tipo" value={formData.tipo} onChange={handleInputChange} className="form-input" required>
                <option value="entrada">Entrada (Agregar Stock)</option>
                <option value="salida">Salida (Reducir Stock)</option>
              </select>
            </div>

            <div>
              <label className="form-label">Cantidad *</label>
              <input
                type="number"
                name="cantidad"
                value={formData.cantidad}
                onChange={handleInputChange}
                className="form-input"
                min="1"
                step="1"
                placeholder="Ingresa la cantidad"
                required
              />
            </div>

            <div>
              <label className="form-label">Motivo *</label>
              <select
                name="motivo"
                value={formData.motivo}
                onChange={handleInputChange}
                className="form-input"
                required
              >
                <option value="">Selecciona un motivo</option>
                {formData.tipo === "entrada" ? (
                  <>
                    <option value="Compra">Compra</option>
                    <option value="Devolución">Devolución</option>
                    <option value="Ajuste de inventario">Ajuste de inventario</option>
                    <option value="Producción">Producción</option>
                    <option value="Otro">Otro</option>
                  </>
                ) : (
                  <>
                    <option value="Venta">Venta</option>
                    <option value="Devolución a proveedor">Devolución a proveedor</option>
                    <option value="Producto dañado">Producto dañado</option>
                    <option value="Ajuste de inventario">Ajuste de inventario</option>
                    <option value="Otro">Otro</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="form-label">Observaciones</label>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleInputChange}
                className="form-input"
                rows="3"
                placeholder="Observaciones adicionales (opcional)"
              />
            </div>

            {/* Preview */}
            {formData.cantidad && (
              <div className="bg-dark-surface rounded-lg p-4">
                <div className="text-sm text-text-secondary mb-2">Vista previa:</div>
                <div className="flex justify-between items-center">
                  <span className="text-text-primary">Stock actual:</span>
                  <span className="font-medium">{product?.stock?.actual || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-primary">{formData.tipo === "entrada" ? "Agregar:" : "Reducir:"}</span>
                  <span className={formData.tipo === "entrada" ? "text-green-400" : "text-red-400"}>
                    {formData.tipo === "entrada" ? "+" : "-"}
                    {formData.cantidad}
                  </span>
                </div>
                <div className="border-t border-dark-border pt-2 mt-2">
                  <div className="flex justify-between items-center font-medium">
                    <span className="text-text-primary">Nuevo stock:</span>
                    <span className="text-primary">
                      {formData.tipo === "entrada"
                        ? (product?.stock?.actual || 0) + Number.parseInt(formData.cantidad || 0)
                        : (product?.stock?.actual || 0) - Number.parseInt(formData.cantidad || 0)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner />
                    Registrando...
                  </div>
                ) : (
                  "Registrar Movimiento"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default MovementModal
