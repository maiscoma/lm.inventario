"use client"

// frontend/src/pages/MovementsPage.jsx

// --- INICIO DE LA SOLUCIÓN ---
import { useState, useEffect, useMemo, useRef } from "react";
// --- FIN DE LA SOLUCIÓN ---
import { useAuth } from "../contexts/AuthContext";
import { movementService } from "../services/movementService";
import { productService } from "../services/productService";
import LoadingSpinner from "../components/LoadingSpinner";
import MovementModal from "../components/MovementModal";
import toast from "react-hot-toast";
// --- INICIO DE LA SOLUCIÓN ---
import { Search, Calendar, ArrowUpDown, TrendingUp, TrendingDown, Package, Plus, ChevronUp, ChevronDown } from "lucide-react";

// Componente reutilizable para encabezados de tabla con ordenamiento
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

    // --- INICIO DE LA SOLUCIÓN: Estados para ordenamiento y búsqueda en modal ---
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'descending' });
    const [productSearchTerm, setProductSearchTerm] = useState(''); // Estado para la búsqueda en el modal
    // --- FIN DE LA SOLUCIÓN ---

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

    // --- INICIO DE LA SOLUCIÓN: Lógica de ordenamiento ---
    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };
    // --- FIN DE LA SOLUCIÓN ---

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
        setProductSearchTerm(''); // Limpiar la búsqueda del modal al seleccionar
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
        setShowProductSelection(false);
        setProductSearchTerm(''); // Limpiar la búsqueda del modal al cerrar
    };

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

    // --- INICIO DE LA SOLUCIÓN: useMemo actualizado para filtrar Y ORDENAR ---
    const processedMovements = useMemo(() => {
        let processableMovements = [...movements];

        // 1. Filtrado (tu lógica original)
        processableMovements = processableMovements.filter((movement) => {
            const searchTermLower = searchTerm.toLowerCase();
            const matchesSearch =
                String(movement.productInfo?.nombre || "").toLowerCase().includes(searchTermLower) ||
                String(movement.productInfo?.sku || "").toLowerCase().includes(searchTermLower) ||
                String(movement.reason || "").toLowerCase().includes(searchTermLower) ||
                String(movement.userName || "").toLowerCase().includes(searchTermLower) ||
                String(movement.quantity || "").toLowerCase().includes(searchTermLower);

            const matchesType = !typeFilter || movement.type === typeFilter;
            const matchesProduct = !productFilter || movement.productId === productFilter;

            let matchesDate = true;
            if (dateFilter) {
                try {
                    const movementDate = new Date(movement.date._seconds * 1000);
                    const filterDate = new Date(dateFilter + 'T00:00:00');
                    matchesDate = movementDate.toDateString() === filterDate.toDateString();
                } catch (e) {
                    matchesDate = false;
                }
            }
            return matchesSearch && matchesType && matchesProduct && matchesDate;
        });

        // 2. Ordenamiento
        if (sortConfig.key) {
            processableMovements.sort((a, b) => {
                let aValue, bValue;
                if (sortConfig.key === 'date') {
                    aValue = a.date?._seconds || 0;
                    bValue = b.date?._seconds || 0;
                } else { // quantity
                    aValue = a.quantity || 0;
                    bValue = b.quantity || 0;
                }
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }

        return processableMovements;
    }, [movements, searchTerm, typeFilter, productFilter, dateFilter, sortConfig]);
    // --- FIN DE LA SOLUCIÓN ---

    const stats = useMemo(() => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        return {
            // --- SOLUCIÓN: Usar 'processedMovements' para las estadísticas ---
            totalMovements: processedMovements.length,
            entradas: processedMovements.filter(m => m.type === 'entrada').length,
            salidas: processedMovements.filter(m => m.type === 'salida').length,
            // --- FIN DE LA SOLUCIÓN ---
            recentMovements: movements.filter(m => {
                if (!m.date || typeof m.date._seconds !== 'number') return false;
                return new Date(m.date._seconds * 1000) >= sevenDaysAgo
            }).length,
        };
    }, [movements, processedMovements]); // Depender de processedMovements

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
                    {/* --- SOLUCIÓN: Usar 'processedMovements' en el contador --- */}
                    <p className="text-text-secondary mt-1">{processedMovements.length} movimiento(s) encontrados.</p>
                </div>
                <button onClick={handleNewMovement} className="btn-primary inline-flex items-center gap-2">
                    <Plus size={20} />
                    <span>Nuevo Movimiento</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* ... (Tu sección de tarjetas de estadísticas no necesita cambios) ... */}
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

            <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                {/* ... (Tu sección de filtros no necesita cambios) ... */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Buscar movimientos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 pl-11 bg-dark-surface border border-dark-border rounded-lg"
                        />
                    </div>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-4 py-3 bg-dark-surface border border-dark-border rounded-lg"
                    >
                        <option value="">Todos los tipos</option>
                        <option value="entrada">Entradas</option>
                        <option value="salida">Salidas</option>
                    </select>
                    <select
                        value={productFilter}
                        onChange={(e) => setProductFilter(e.target.value)}
                        className="px-4 py-3 bg-dark-surface border border-dark-border rounded-lg"
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
                        className="px-4 py-3 bg-dark-surface border border-dark-border rounded-lg"
                    />
                </div>
            </div>

            <div className="bg-dark-card border border-dark-border rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-text-secondary">
                    <thead className="text-xs uppercase bg-dark-surface">
                        <tr>
                            {/* --- INICIO DE LA SOLUCIÓN: Cabeceras con ordenamiento --- */}
                            <SortableHeader column="date" sortConfig={sortConfig} onSort={handleSort}>Fecha</SortableHeader>
                            <th className="px-6 py-3">Producto</th>
                            <th className="px-6 py-3">Tipo</th>
                            <SortableHeader column="quantity" sortConfig={sortConfig} onSort={handleSort}>Cantidad</SortableHeader>
                            {/* --- FIN DE LA SOLUCIÓN --- */}
                            <th className="px-6 py-3">Motivo</th>
                            <th className="px-6 py-3">Stock</th>
                            <th className="px-6 py-3">Usuario</th>
                            <th className="px-6 py-3">Observaciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* --- SOLUCIÓN: Iterar sobre 'processedMovements' --- */}
                        {processedMovements.length > 0 ? (
                            processedMovements.map((movement) => (
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

            {/* --- INICIO DE LA SOLUCIÓN: Modal de selección de producto con autocompletado --- */}
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

                        <div className="mb-4">
                            <div className="relative">
                                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                                <input
                                    type="text"
                                    placeholder="Buscar producto por nombre o SKU..."
                                    value={productSearchTerm}
                                    onChange={(e) => setProductSearchTerm(e.target.value)}
                                    className="w-full px-4 py-3 pl-11 bg-dark-surface border border-dark-border rounded-lg"
                                />
                            </div>
                        </div>

                        <div className="grid gap-3 max-h-96 overflow-y-auto">
                            {products
                                .filter(product =>
                                    String(product.nombre || "").toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                                    String(product.sku || "").toLowerCase().includes(productSearchTerm.toLowerCase())
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
                                    </button>
                                ))}
                        </div>
                    </div>
                </div>
            )}
            {/* --- FIN DE LA SOLUCIÓN --- */}

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

export default MovementsPage;