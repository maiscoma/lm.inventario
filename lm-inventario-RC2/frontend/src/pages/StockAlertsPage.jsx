// frontend/src/pages/StockAlertsPage.jsx

import { useState, useEffect, useMemo } from "react";
// --- INICIO DE LA SOLUCIÓN: Importar useAuth ---
import { useAuth } from "../contexts/AuthContext";
// --- FIN DE LA SOLUCIÓN ---
import { productService } from "../services/productService";
import { reportService } from "../services/reportService";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import { AlertTriangle, Package, ArrowUpDown, Download } from "lucide-react";
import MovementModal from "../components/MovementModal";

const StockAlertsPage = () => {
    // --- INICIO DE LA SOLUCIÓN: Obtener el rol del usuario ---
    const { isAdmin } = useAuth();
    // --- FIN DE LA SOLUCIÓN ---
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await productService.getAll();
            if (response.success) {
                setProducts(response.data);
            }
        } catch (error) {
            console.error("Error al cargar productos:", error);
            toast.error("No se pudieron cargar los productos.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const lowStockProducts = useMemo(() => {
        return products.filter(p => p.stock && p.stock.actual <= p.stock.minimo);
    }, [products]);

    const handleExport = async () => {
        if (lowStockProducts.length === 0) {
            toast.error("No hay datos para exportar.");
            return;
        }
        setIsExporting(true);
        const toastId = toast.loading("Generando reporte...");
        try {
            const blob = await reportService.exportLowStockReport();
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `reporte_alertas_stock_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success("Reporte exportado.", { id: toastId });
        } catch (error) {
            toast.error("Error al exportar el reporte.", { id: toastId });
        } finally {
            setIsExporting(false);
        }
    };

    const handleOpenMovementModal = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleMovementCreated = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
        fetchProducts();
    };

    if (loading) {
        return <LoadingSpinner text="Buscando productos con bajo stock..." />;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
                        <AlertTriangle className="text-warning" size={32} />
                        Alertas de Stock
                    </h1>
                    <p className="text-text-secondary mt-1">
                        {lowStockProducts.length} producto(s) necesitan tu atención.
                    </p>
                </div>
                
                {/* --- INICIO DE LA SOLUCIÓN: Renderizado condicional del botón de exportar --- */}
                {isAdmin() && (
                    <button onClick={handleExport} disabled={isExporting || lowStockProducts.length === 0} className="btn-secondary inline-flex items-center gap-2">
                        {isExporting ? <LoadingSpinner size="sm" /> : <Download size={20} />}
                        <span>{isExporting ? 'Exportando...' : 'Exportar a Excel'}</span>
                    </button>
                )}
                {/* --- FIN DE LA SOLUCIÓN --- */}
            </div>

            <div className="bg-dark-card border border-dark-border rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-text-secondary">
                    <thead className="text-xs uppercase bg-dark-surface">
                        <tr>
                            <th className="px-6 py-3">Producto</th>
                            <th className="px-6 py-3">Categoría</th>
                            <th className="px-6 py-3">Stock Actual</th>
                            <th className="px-6 py-3">Stock Mínimo</th>
                            <th className="px-6 py-3">Unidades Faltantes</th>
                            <th className="px-6 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lowStockProducts.length > 0 ? (
                            lowStockProducts.map((product) => (
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
                                            {product.categoria || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-error">{product.stock.actual}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-warning">{product.stock.minimo}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-error">
                                            {Math.max(0, product.stock.minimo - product.stock.actual)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleOpenMovementModal(product)}
                                            className="btn-secondary inline-flex items-center gap-2 text-xs"
                                            title="Registrar Entrada de Stock"
                                        >
                                            <ArrowUpDown size={14} />
                                            Registrar Entrada
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center py-16">
                                    <Package size={48} className="mx-auto text-text-muted" />
                                    <h3 className="mt-4 text-lg font-semibold">¡Todo en orden!</h3>
                                    <p className="mt-1 text-text-secondary">
                                        No hay productos con niveles de stock bajos.
                                    </p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <MovementModal
                    isOpen={isModalOpen}
                    product={selectedProduct}
                    onClose={() => setIsModalOpen(false)}
                    onMovementCreated={handleMovementCreated}
                />
            )}
        </div>
    );
};

export default StockAlertsPage;