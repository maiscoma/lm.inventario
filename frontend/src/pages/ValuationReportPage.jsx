// frontend/src/pages/ValuationReportPage.jsx

import { useState, useEffect, useMemo } from "react";
import { productService } from "../services/productService";
import { reportService } from "../services/reportService";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import { DollarSign, Archive, TrendingUp, Package, Download } from "lucide-react";

const ValuationReportPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
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
        fetchProducts();
    }, []);

    const inventoryStats = useMemo(() => {
        return products.reduce((acc, product) => {
            const stock = product.stock?.actual || 0;
            const costPrice = product.precios?.compra || 0;
            const salePrice = product.precios?.venta || 0;

            acc.totalCostValue += stock * costPrice;
            acc.totalSaleValue += stock * salePrice;
            acc.totalUnits += stock;

            return acc;
        }, { totalCostValue: 0, totalSaleValue: 0, totalUnits: 0 });
    }, [products]);

    // --- INICIO: FUNCIÓN PARA MANEJAR LA EXPORTACIÓN ---
    const handleExport = async () => {
        if (products.length === 0) {
            toast.error("No hay datos para exportar.");
            return;
        }
        setIsExporting(true);
        const toastId = toast.loading("Generando reporte de valorización...");
        try {
            const blob = await reportService.exportValuationReport();
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `reporte_valorizacion_${new Date().toISOString().split('T')[0]}.xlsx`);
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
    // --- FIN: FUNCIÓN PARA MANEJAR LA EXPORTACIÓN ---

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
        }).format(amount);
    };

    if (loading) {
        return <LoadingSpinner text="Calculando valor del inventario..." />;
    }

    return (
        <div className="space-y-6">
            {/* --- INICIO: CÓDIGO MODIFICADO --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">Valorización de Inventario</h1>
                    <p className="text-text-secondary mt-1">
                        Resumen financiero de tu stock actual.
                    </p>
                </div>
                <button onClick={handleExport} disabled={isExporting || products.length === 0} className="btn-secondary inline-flex items-center gap-2">
                    {isExporting ? <LoadingSpinner size="sm" /> : <Download size={20} />}
                    <span>{isExporting ? 'Exportando...' : 'Exportar a Excel'}</span>
                </button>
            </div>
            {/* --- FIN: CÓDIGO MODIFICADO --- */}

            {/* Tarjetas de Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/20 rounded-lg"><DollarSign size={24} className="text-primary" /></div>
                        <div>
                            <div className="text-text-secondary text-sm">Valor Total (Costo)</div>
                            <div className="text-2xl font-bold text-text-primary">{formatCurrency(inventoryStats.totalCostValue)}</div>
                        </div>
                    </div>
                </div>
                <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-success/20 rounded-lg"><TrendingUp size={24} className="text-success" /></div>
                        <div>
                            <div className="text-text-secondary text-sm">Valor Total (Venta)</div>
                            <div className="text-2xl font-bold text-success">{formatCurrency(inventoryStats.totalSaleValue)}</div>
                        </div>
                    </div>
                </div>
                <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-secondary/20 rounded-lg"><Archive size={24} className="text-secondary" /></div>
                        <div>
                            <div className="text-text-secondary text-sm">Unidades Totales</div>
                            <div className="text-2xl font-bold text-text-primary">{inventoryStats.totalUnits.toLocaleString('es-CL')}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla de Valorización Detallada */}
            <div className="bg-dark-card border border-dark-border rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-text-secondary">
                    <thead className="text-xs uppercase bg-dark-surface">
                        <tr>
                            <th className="px-6 py-3">Producto</th>
                            <th className="px-6 py-3">Stock Actual</th>
                            <th className="px-6 py-3">Precio Costo</th>
                            <th className="px-6 py-3">Precio Venta</th>
                            <th className="px-6 py-3">Valor Total (Costo)</th>
                            <th className="px-6 py-3">Valor Total (Venta)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length > 0 ? (
                            products.map((product) => (
                                <tr key={product.id} className="border-b border-dark-border hover:bg-dark-surface/50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-text-primary">{product.nombre}</div>
                                        <div className="text-xs text-text-muted font-mono">{product.sku}</div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-text-primary">{product.stock?.actual || 0}</td>
                                    <td className="px-6 py-4">{formatCurrency(product.precios?.compra || 0)}</td>
                                    <td className="px-6 py-4 text-success">{formatCurrency(product.precios?.venta || 0)}</td>
                                    <td className="px-6 py-4 font-medium text-text-primary">{formatCurrency((product.stock?.actual || 0) * (product.precios?.compra || 0))}</td>
                                    <td className="px-6 py-4 font-medium text-success">{formatCurrency((product.stock?.actual || 0) * (product.precios?.venta || 0))}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center py-16">
                                    <Package size={48} className="mx-auto text-text-muted" />
                                    <h3 className="mt-4 text-lg font-semibold">No hay productos en el inventario</h3>
                                    <p className="mt-1 text-text-secondary">Agrega productos para ver la valorización.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ValuationReportPage;