"use client"

// frontend/src/pages/MovementsPage.jsx

import { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { movementService } from "../services/movementService";
import { productService } from "../services/productService";
import LoadingSpinner from "../components/LoadingSpinner";
import MovementModal from "../components/MovementModal";
import toast from "react-hot-toast";
import { Search, Calendar, ArrowUpDown, TrendingUp, TrendingDown, Package, Plus } from "lucide-react";

const MovementsPage = () => {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showProductSelection, setShowProductSelection] = useState(false);
  const { user } = useAuth();

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [movResponse, prodResponse] = await Promise.all([
        movementService.getAll(),
        productService.getAll()
      ]);

      if (movResponse.success) {
        setMovements(movResponse.data);
      }
      if (prodResponse.success) {
        setProducts(prodResponse.data);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      toast.error("Error al cargar los datos de la página.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleMovementCreated = () => {
    handleCloseModal();
    fetchAllData();
  };

  const handleNewMovement = () => {
    if (products.length === 0) {
      toast.error("No hay productos disponibles");
      return;
    }
    setShowProductSelection(true);
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setShowProductSelection(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setShowProductSelection(false);
  };

  // ✅ CORRECCIÓN FINAL: Usar '_seconds' en lugar de 'seconds'
  const formatDate = (timestamp) => {
    if (!timestamp || typeof timestamp._seconds !== 'number') return "Fecha inválida";
    try {
      const date = new Date(timestamp._seconds * 1000);
      return date.toLocaleString("es-CL", {
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit",
      });
    } catch {
      return "Fecha inválida";
    }
  };

  const filteredMovements = useMemo(() => {
    return movements.filter((movement) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        (movement.productInfo?.nombre || "").toLowerCase().includes(search) ||
        (movement.productInfo?.sku || "").toLowerCase().includes(search) ||
        (movement.reason || "").toLowerCase().includes(search) ||
        (movement.userName || "").toLowerCase().includes(search);
      
      const matchesType = !typeFilter || movement.type === typeFilter;
      const matchesProduct = !productFilter || movement.productId === productFilter;
      
      let matchesDate = true;
      if (dateFilter) {
        try {
          // ✅ CORRECCIÓN FINAL: Usar '_seconds'
          const movementDate = new Date(movement.date._seconds * 1000);
          const filterDate = new Date(dateFilter + 'T00:00:00');
          matchesDate = movementDate.toDateString() === filterDate.toDateString();
        } catch (e) {
          matchesDate = false;
        }
      }
      return matchesSearch && matchesType && matchesProduct && matchesDate;
    });
  }, [movements, searchTerm, typeFilter, productFilter, dateFilter]);

  const stats = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return {
      totalMovements: filteredMovements.length,
      entradas: filteredMovements.filter(m => m.type === 'entrada').length,
      salidas: filteredMovements.filter(m => m.type === 'salida').length,
      // ✅ CORRECCIÓN FINAL: Usar '_seconds'
      recentMovements: movements.filter(m => {
          if (!m.date || typeof m.date._seconds !== 'number') return false;
          return new Date(m.date._seconds * 1000) >= sevenDaysAgo
      }).length,
    };
  }, [movements, filteredMovements]);

  const getProductName = (productId) => products.find((p) => p.id === productId)?.nombre || "N/A";
  const getProductSku = (productId) => products.find((p) => p.id === productId)?.sku || "N/A";

  if (loading) {
    return <LoadingSpinner text="Cargando historial..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Movimientos de Inventario</h1>
          <p className="text-text-secondary mt-1">{filteredMovements.length} movimiento(s) encontrados.</p>
        </div>
        <button onClick={handleNewMovement} className="btn-primary inline-flex items-center gap-2">
          <Plus size={20} />
          <span>Nuevo Movimiento</span>
        </button>
      </div>

      {/* Las tarjetas ahora usarán el 'stats' calculado correctamente */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/20 rounded-lg">
              <ArrowUpDown size={24} className="text-primary" />
            </div>
            <div>
              <div className="text-text-secondary text-sm">Total Movimientos</div>
              <div className="text-2xl font-bold text-text-primary">{stats.totalMovements || 0}</div>
            </div>
          </div>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-success/20 rounded-lg">
              <TrendingUp size={24} className="text-success" />
            </div>
            <div>
              <div className="text-text-secondary text-sm">Entradas</div>
              <div className="text-2xl font-bold text-success">{stats.entradas || 0}</div>
            </div>
          </div>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-error/20 rounded-lg">
              <TrendingDown size={24} className="text-error" />
            </div>
            <div>
              <div className="text-text-secondary text-sm">Salidas</div>
              <div className="text-2xl font-bold text-error">{stats.salidas || 0}</div>
            </div>
          </div>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-warning/20 rounded-lg">
              <Calendar size={24} className="text-warning" />
            </div>
            <div>
              <div className="text-text-secondary text-sm">Últimos 7 días</div>
              <div className="text-2xl font-bold text-warning">{stats.recentMovements || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar movimientos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-11 bg-dark-surface border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
          >
            <option value="">Todos los tipos</option>
            <option value="entrada">Entradas</option>
            <option value="salida">Salidas</option>
          </select>
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
          >
            <option value="">Todos los productos</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.nombre} ({product.sku})
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
          />
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-dark-card border border-dark-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm text-left text-text-secondary">
          <thead className="text-xs uppercase bg-dark-surface">
            <tr>
              <th className="px-6 py-3">Fecha</th>
              <th className="px-6 py-3">Producto</th>
              <th className="px-6 py-3">Tipo</th>
              <th className="px-6 py-3">Cantidad</th>
              <th className="px-6 py-3">Motivo</th>
              <th className="px-6 py-3">Stock</th>
              <th className="px-6 py-3">Usuario</th>
              <th className="px-6 py-3">Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredMovements.length > 0 ? (
              filteredMovements.map((movement) => (
                <tr key={movement.id} className="border-b border-dark-border hover:bg-dark-surface/50">
                  <td className="px-6 py-4 text-text-primary font-medium">{formatDate(movement.date)}</td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-text-primary">{getProductName(movement.productId)}</div>
                      <div className="text-xs text-text-muted font-mono">{getProductSku(movement.productId)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${movement.type === "entrada" ? "bg-success/20 text-success" : "bg-error/20 text-error"
                        }`}
                    >
                      {movement.type === "entrada" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {movement.type === "entrada" ? "Entrada" : "Salida"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-bold ${movement.type === "entrada" ? "text-success" : "text-error"}`}>
                      {movement.type === "entrada" ? "+" : "-"}
                      {movement.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-text-primary">{movement.reason}</td>
                  <td className="px-6 py-4">
                    <div className="text-xs">
                      <div className="text-text-muted">Anterior: {movement.stock_anterior}</div>
                      <div className="text-text-primary font-medium">Nuevo: {movement.stock_nuevo}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {movement.userName?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-text-primary text-xs">{movement.userName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-text-secondary text-xs">{movement.observaciones || "Sin observaciones"}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-16">
                  <Package size={48} className="mx-auto text-text-muted" />
                  <h3 className="mt-4 text-lg font-semibold">No se encontraron movimientos</h3>
                  <p className="mt-1 text-text-secondary">
                    {searchTerm || typeFilter || productFilter || dateFilter
                      ? "Intenta ajustar tus filtros de búsqueda."
                      : "Los movimientos de inventario aparecerán aquí."}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Product Selection Modal for New Movement */}
      {showProductSelection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-text-primary">Seleccionar Producto</h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-dark-surface rounded-md text-text-secondary hover:text-text-primary"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search bar for products */}
            <div className="mb-4">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Buscar producto por nombre o SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-11 bg-dark-surface border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                />
              </div>
            </div>

            <div className="grid gap-3 max-h-96 overflow-y-auto">
              {products
                .filter(
                  (product) =>
                    product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    product.sku.toLowerCase().includes(searchTerm.toLowerCase()),
                )
                .map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className="flex items-center gap-4 p-4 bg-dark-surface hover:bg-dark-border rounded-lg transition-all duration-300 text-left"
                  >
                    <img
                      src={product.imageUrl || "/placeholder-logo.png"}
                      alt={product.nombre}
                      className="w-12 h-12 rounded-md object-cover bg-dark-bg"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-text-primary">{product.nombre}</div>
                      <div className="text-xs text-text-muted font-mono">{product.sku}</div>
                      <div className="text-xs text-text-secondary">Stock actual: {product.stock?.actual || 0}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-text-muted">Categoría</div>
                      <div className="text-sm text-text-primary">{product.categoria || "Sin categoría"}</div>
                    </div>
                  </button>
                ))}

              {products.filter(
                (product) =>
                  product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  product.sku.toLowerCase().includes(searchTerm.toLowerCase()),
              ).length === 0 && (
                  <div className="text-center py-8">
                    <Package size={48} className="mx-auto text-text-muted mb-4" />
                    <p className="text-text-secondary">No se encontraron productos</p>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Movement Modal */}
      {isModalOpen && selectedProduct && (
        <MovementModal
          isOpen={isModalOpen}
          product={selectedProduct}
          onClose={handleCloseModal}
          onMovementCreated={handleMovementCreated}
        />
      )}
    </div>
  )
}

export default MovementsPage
