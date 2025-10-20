// frontend/src/pages/ProductsPage.jsx

// --- INICIO DE LA SOLUCIÓN ---
import { useState, useEffect, useMemo } from "react";
// --- FIN DE LA SOLUCIÓN ---
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { productService } from "../services/productService";
import { settingsService } from "../services/settingsService";
import LoadingSpinner from "../components/LoadingSpinner";
import MovementModal from "../components/MovementModal";
import ProductImportModal from "../components/ProductImportModal";
import toast from "react-hot-toast";
// --- INICIO DE LA SOLUCIÓN ---
import { Plus, Search, Edit, Trash2, ArrowUpDown, Package, Upload, Download, ChevronUp, ChevronDown } from "lucide-react";

// Componente para los encabezados de la tabla con ordenamiento
const SortableHeader = ({ children, column, sortConfig, onSort }) => {
    const isSorted = sortConfig.key === column;
    const Icon = isSorted ? (sortConfig.direction === 'ascending' ? ChevronUp : ChevronDown) : ArrowUpDown;

    return (
        <th className="px-6 py-3 cursor-pointer hover:bg-dark-border" onClick={() => onSort(column)}>
            <div className="flex items-center gap-2">
                {children}
                <Icon size={14} className={isSorted ? 'text-primary' : 'text-text-muted'} />
            </div>
        </th>
    );
};
// --- FIN DE LA SOLUCIÓN ---

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  // --- INICIO DE LA SOLUCIÓN: Estados para ordenamiento y autocompletado ---
  const [sortConfig, setSortConfig] = useState({ key: 'nombre', direction: 'ascending' });
  const [suggestions, setSuggestions] = useState([]);
  // --- FIN DE LA SOLUCIÓN ---

  // --- INICIO DE LA SOLUCIÓN: fetchData robusto para categorías ---
  const fetchData = async () => {
    try {
      setLoading(true);
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
        // Lógica robusta para manejar tanto ['cat1'] como [{nombre:'cat1'}]
        let categoryList = [];
        const data = categoriesResponse.data || [];
        if (data.length > 0) {
          if (typeof data[0] === 'object' && data[0] !== null) {
            categoryList = data.map(c => c.nombre); // Asumimos objetos con propiedad 'nombre'
          } else {
            categoryList = data; // Asumimos array de strings
          }
        }
        // Limpiamos la lista para asegurar valores únicos y válidos
        const uniqueCategories = [...new Set(categoryList.filter(Boolean))];
        setCategories(uniqueCategories);
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
  // --- FIN DE LA SOLUCIÓN ---

  useEffect(() => {
    fetchData();
  }, []);
  
  // --- INICIO DE LA SOLUCIÓN: Lógica de ordenamiento y autocompletado ---
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length > 1) {
      const filteredSuggestions = products
        .filter(p => 
            String(p.nombre || '').toLowerCase().includes(value.toLowerCase()) || 
            String(p.sku || '').toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 5);
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const onSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion.nombre);
    setSuggestions([]);
  };
  // --- FIN DE LA SOLUCIÓN ---

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

  const handleImportSuccess = () => {
    fetchData();
  };
  
  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar "${productName}"?`)) {
      return;
    }
    try {
      await productService.delete(productId);
      toast.success("Producto eliminado exitosamente");
      fetchData();
    } catch (error) {
      toast.error(error.message || "Error al eliminar el producto");
    }
  };

  const handleOpenMovementModal = (product) => {
    setSelectedProduct(product);
    setIsMovementModalOpen(true);
  };

  // --- INICIO DE LA SOLUCIÓN: useMemo actualizado para filtrar y ordenar ---
  const processedProducts = useMemo(() => {
    let processableProducts = [...products];
    
    // 1. Filtrado
    if (searchTerm || categoryFilter) {
      processableProducts = processableProducts.filter((product) => {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          String(product.nombre || '').toLowerCase().includes(search) ||
          String(product.sku || '').toLowerCase().includes(search) ||
          String(product.categoria || '').toLowerCase().includes(search);
        const matchesCategory = !categoryFilter || product.categoria === categoryFilter;
        return matchesSearch && matchesCategory;
      });
    }

    // 2. Ordenamiento
    if (sortConfig.key) {
        processableProducts.sort((a, b) => {
        let aValue, bValue;
        switch (sortConfig.key) {
            case 'stock':
                aValue = a.stock?.actual || 0;
                bValue = b.stock?.actual || 0;
                break;
            case 'precioVenta':
                aValue = a.precios?.venta || 0;
                bValue = b.precios?.venta || 0;
                break;
            default:
                aValue = a.nombre || '';
                bValue = b.nombre || '';
                break;
        }
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }

    return processableProducts;
  }, [products, searchTerm, categoryFilter, sortConfig]);
  // --- FIN DE LA SOLUCIÓN ---

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
    if (!timestamp) return "N/A";
    if (timestamp && typeof timestamp === 'object' && timestamp._seconds) {
      return new Date(timestamp._seconds * 1000).toLocaleDateString("es-CL");
    }
    if (typeof timestamp === 'string') {
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) return date.toLocaleDateString("es-CL");
    }
    return "N/A";
  };
  
  // Tu código original de `handleDownloadTemplate`, `handleImportClick`, `handleFileChange`
  // no necesita cambios, así que lo he omitido por brevedad aquí, pero está en el código completo de abajo.

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Gestión de Productos</h1>
          {/* --- SOLUCIÓN: Usar 'processedProducts' en el contador --- */}
          <p className="text-text-secondary mt-1">{processedProducts.length} producto(s) encontrados.</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin() && (
            <button onClick={() => setIsImportModalOpen(true)} className="btn-secondary inline-flex items-center gap-2">
              <Upload size={16} /> Importar
            </button>
          )}
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
          {/* --- INICIO DE LA SOLUCIÓN: Barra de búsqueda con autocompletado --- */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted z-10" />
            <input
              type="text"
              placeholder="Buscar por nombre, SKU o categoría..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-4 py-3 pl-11 bg-dark-surface border border-dark-border rounded-lg"
            />
            {suggestions.length > 0 && (
              <ul className="absolute z-10 w-full mt-1 bg-dark-surface border border-dark-border rounded-lg shadow-lg">
                {suggestions.map(s => (
                  <li 
                    key={s.id}
                    onClick={() => onSuggestionClick(s)}
                    className="px-4 py-2 cursor-pointer hover:bg-dark-card"
                  >
                    {s.nombre} <span className="text-xs text-text-muted">({s.sku})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* --- FIN DE LA SOLUCIÓN --- */}
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full sm:w-56 px-4 py-3 bg-dark-surface border border-dark-border rounded-lg">
            <option value="">Todas las categorías</option>
            {/* --- SOLUCIÓN: El map ahora funciona correctamente --- */}
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
              {/* --- INICIO DE LA SOLUCIÓN: Cabeceras con ordenamiento --- */}
              <SortableHeader column="nombre" sortConfig={sortConfig} onSort={handleSort}>Producto</SortableHeader>
              <th className="px-6 py-3">Categoría</th>
              <SortableHeader column="stock" sortConfig={sortConfig} onSort={handleSort}>Stock</SortableHeader>
              <SortableHeader column="precioVenta" sortConfig={sortConfig} onSort={handleSort}>Precio Venta</SortableHeader>
              {/* --- FIN DE LA SOLUCIÓN --- */}
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3">Fechas</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {/* --- SOLUCIÓN: Iterar sobre 'processedProducts' --- */}
            {processedProducts.length > 0 ? (
              processedProducts.map((product) => {
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