// frontend/src/pages/ProductsPage.jsx

import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { productService } from "../services/productService";
import { settingsService } from "../services/settingsService";
import LoadingSpinner from "../components/LoadingSpinner";
import MovementModal from "../components/MovementModal";
import ProductImportModal from "../components/ProductImportModal"; // <-- Asegúrate de importar el modal
import toast from "react-hot-toast";
import { Plus, Search, Edit, Trash2, ArrowUpDown, Package, Upload, Download } from "lucide-react";


const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false); // <-- Estado para el modal de importación
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  // --- INICIO: FUNCIÓN DE CARGA DE DATOS MEJORADA ---
  const fetchData = async () => {
    try {
      setLoading(true);
      // Hacemos ambas peticiones en paralelo para mayor eficiencia
      const [productsResponse, categoriesResponse] = await Promise.all([
        productService.getAll(),
        settingsService.getCategories()
      ]);

      if (productsResponse.success) {
        setProducts(productsResponse.data);
      } else {
        toast.error("Error al cargar los productos.");
      }

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data);
      } else {
        toast.error("Error al cargar las categorías.");
      }
    } catch (error) {
      console.error("Error al cargar datos de la página:", error);
      toast.error("Ocurrió un error al cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- FIN: FUNCIÓN DE CARGA DE DATOS MEJORADA ---

  // --- ✨ INICIO: FUNCIÓN DE EXPORTACIÓN ✨ ---
  const handleExport = async () => {
    if (products.length === 0) {
      return toast.error("No hay productos para exportar.");
    }
    setIsExporting(true);
    const toastId = toast.loading("Generando exportación...");
    try {
      const blob = await productService.exportProducts();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `exportacion_productos_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Archivo exportado.", { id: toastId });
    } catch (error) {
      toast.error("Error al exportar.", { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };
  // --- ✨ FIN: FUNCIÓN DE EXPORTACIÓN ✨ ---

  const handleDownloadTemplate = async () => {
    setIsDownloadingTemplate(true);
    toast.loading("Descargando plantilla...");
    try {
      const blob = await productService.downloadImportTemplate();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "plantilla_importacion_productos.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.dismiss();
      toast.success("Plantilla descargada.");
    } catch (error) {
      toast.dismiss();
      toast.error("No se pudo descargar la plantilla.");
      console.error("Error al descargar plantilla:", error);
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsImporting(true);
    const toastId = toast.loading("Importando productos desde Excel...");

    try {
      const response = await productService.importProducts(file);
      toast.success(response.message, { id: toastId });
      fetchProducts();
    } catch (error) {
      const errorMessage = error.message || "Error al importar el archivo.";
      toast.error(errorMessage, { id: toastId });
      console.error("Error de importación:", error);
    } finally {
      setIsImporting(false);
      event.target.value = null;
    }
  };
  // --- ✨ INICIO DE LA CORRECCIÓN: FUNCIÓN AÑADIDA ✨ ---
  const handleImportSuccess = () => {
    fetchData(); // Esta función refresca la lista de productos y categorías
  };
  // --- ✨ FIN DE LA CORRECCIÓN ✨
  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar "${productName}"?`)) {
      return;
    }
    try {
      await productService.delete(productId);
      toast.success("Producto eliminado exitosamente");
      fetchProducts();
    } catch (error) {
      toast.error(error.message || "Error al eliminar el producto");
    }
  };

  const handleOpenMovementModal = (product) => {
    setSelectedProduct(product);
    setIsMovementModalOpen(true); // El nombre correcto es setIsMovementModalOpen
  };

  // --- INICIO DE LA CORRECCIÓN EN LA BÚSQUEDA ---
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const search = searchTerm.toLowerCase();

      // Convertimos todos los campos a string antes de buscar para evitar errores.
      // `|| ''` se asegura de que si el campo no existe, no cause un error.
      const matchesSearch =
        (product.nombre || '').toLowerCase().includes(search) ||
        String(product.sku || '').toLowerCase().includes(search) ||
        (product.categoria || '').toLowerCase().includes(search);

      const matchesCategory = !categoryFilter || product.categoria === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, categoryFilter]);
  // --- FIN DE LA CORRECCIÓN EN LA BÚSQUEDA ---

  // const categories = useMemo(() => [...new Set(products.map((p) => p.categoria).filter(Boolean))], [products]);

  const getStockStatus = (stock) => {
    if (!stock) return { color: "text-text-muted", bg: "bg-dark-surface" };
    if (stock.actual <= stock.minimo) {
      return { color: "text-error", bg: "bg-error/20" };
    }
    if (stock.actual > stock.maximo) {
      return { color: "text-warning", bg: "bg-warning/20" };
    }
    return { color: "text-success", bg: "bg-success/20" };
  };

  const formatDate = (timestamp) => {
    if (!timestamp) {
      return "N/A";
    }
    if (timestamp && typeof timestamp === 'object' && timestamp._seconds) {
      const date = new Date(timestamp._seconds * 1000);
      return date.toLocaleDateString("es-CL");
    }
    if (typeof timestamp === 'string') {
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("es-CL");
      }
    }
    return "N/A";
  };

  return (
    <div className="space-y-6">
      {/* --- SECCIÓN DE BOTONES CORREGIDA --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Gestión de Productos</h1>
          <p className="text-text-secondary mt-1">{filteredProducts.length} producto(s) encontrados.</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin() && (
            <button onClick={() => setIsImportModalOpen(true)} className="btn-secondary inline-flex items-center gap-2">
              <Upload size={16} /> Importar
            </button>
          )}
          {/* --- ✨ INICIO DE LA CORRECCIÓN ✨ --- */}
          <button onClick={handleExport} disabled={isExporting} className="btn-secondary inline-flex items-center gap-2">
            {isExporting ? <LoadingSpinner size="sm" /> : <Download size={16} />}
            {isExporting ? "Exportando..." : "Exportar"}
          </button>
          <Link to="/products/new" className="btn-primary inline-flex items-center gap-2">
            <Plus size={16} /> Nuevo Producto
          </Link>

        </div>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar por nombre, SKU o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-11 bg-dark-surface border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
            />
          </div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full sm:w-56 px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300">
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm text-left text-text-secondary">
          <thead className="text-xs uppercase bg-dark-surface">
            <tr>
              <th className="px-6 py-3">Producto</th>
              <th className="px-6 py-3">Categoría</th>
              <th className="px-6 py-3">Stock</th>
              <th className="px-6 py-3">Precio Venta</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3">Fechas</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock);
                return (
                  <tr key={product.id} className="border-b border-dark-border hover:bg-dark-surface/50">
                    <td className="px-6 py-4 flex items-center gap-4">
                      <img
                        src={product.imageUrl || "/placeholder-logo.png"}
                        alt={product.nombre}
                        className="w-10 h-10 rounded-md object-cover bg-dark-bg"
                      />
                      <div>
                        <div className="font-medium text-text-primary">{product.nombre}</div>
                        <div className="text-xs text-text-muted font-mono">{product.sku}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-secondary/20 text-secondary rounded-full text-xs font-semibold">
                        {product.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-semibold ${stockStatus.bg} ${stockStatus.color}`}>
                        {product.stock?.actual || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-text-primary">
                      ${(product.precios?.venta || 0).toLocaleString("es-CL")}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${product.estado === 'activo' ? 'bg-success/20 text-success' :
                        product.estado === 'dañado' ? 'bg-warning/20 text-warning' : 'bg-gray-500/20 text-gray-400'
                        }`}>
                        {product.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div>Últ. Mov: {formatDate(product.fechaUltimoMovimiento)}</div>
                      <div className="text-text-muted">Ingreso: {formatDate(product.fechaIngreso)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenMovementModal(product)} className="p-2 hover:bg-dark-surface rounded-md" title="Registrar Movimiento">
                          <ArrowUpDown size={16} />
                        </button>
                        {isAdmin() && (
                          <Link to={`/products/edit/${product.id}`} className="p-2 hover:bg-dark-surface rounded-md" title="Editar">
                            <Edit size={16} />
                          </Link>
                        )}
                        {isAdmin() && (
                          <button onClick={() => handleDelete(product.id, product.nombre)} className="p-2 text-error hover:bg-error/10 rounded-md" title="Eliminar">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-16">
                  <Package size={48} className="mx-auto text-text-muted" />
                  <h3 className="mt-4 text-lg font-semibold">No se encontraron productos</h3>
                  <p className="mt-1 text-text-secondary">
                    {searchTerm || categoryFilter ? "Intenta ajustar tu búsqueda o filtros." : "Crea tu primer producto para comenzar."}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <div className="text-text-secondary text-sm">Total Productos</div>
          <div className="text-2xl font-bold text-text-primary">{products.length}</div>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <div className="text-text-secondary text-sm">Stock Bajo</div>
          <div className="text-2xl font-bold text-error">
            {products.filter((p) => p.stock && p.stock.actual <= p.stock.minimo).length}
          </div>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <div className="text-text-secondary text-sm">Categorías</div>
          <div className="text-2xl font-bold text-text-primary">{categories.length}</div>
        </div>
      </div>

      {/* --- MODALES --- */}
      <ProductImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />
      {isMovementModalOpen && (
        <MovementModal
          isOpen={isMovementModalOpen}
          product={selectedProduct}
          onClose={() => setIsMovementModalOpen(false)}
          onMovementCreated={fetchData}
        />
      )}
    </div>
  );
};

export default ProductsPage;