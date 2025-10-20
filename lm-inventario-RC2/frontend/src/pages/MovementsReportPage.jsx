// frontend/src/pages/MovementsReportPage.jsx

import { useState, useEffect, useMemo } from "react";
import { movementService } from "../services/movementService";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import { Calendar, BarChart3, Download, TrendingUp, TrendingDown } from "lucide-react";
import { productService } from "../services/productService";
import ExcelJS from "exceljs";

const MovementsReportPage = () => {
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [products, setProducts] = useState([]);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: new Date().toISOString().split('T')[0], // Por defecto, hoy
    });

    // 3. Carga los productos al iniciar la página
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await productService.getAll();
                if (response.success) {
                    setProducts(response.data);
                }
            } catch (error) {
                console.error("Error al cargar productos:", error);
            }
        };
        fetchProducts();
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerateReport = async () => {
        if (!filters.startDate || !filters.endDate) {
            toast.error("Por favor, selecciona una fecha de inicio y de fin.");
            return;
        }
        try {
            setLoading(true);
            const response = await movementService.getAll(filters);
            if (response.success) {
                setMovements(response.data);
                if (response.data.length === 0) {
                    toast.success("No se encontraron movimientos en el rango de fechas seleccionado.");
                }
            }
        } catch (error) {
            console.error("Error al generar reporte:", error);
            toast.error("Error al generar el reporte.");
        } finally {
            setLoading(false);
        }
    };

    // --- INICIO: NUEVA FUNCIÓN DE EXPORTACIÓN ---
    // --- INICIO: FUNCIÓN DE EXPORTACIÓN CORREGIDA ---
    const handleExportReport = async () => {
        if (movements.length === 0) {
            toast.warn("No hay datos en la tabla para exportar.");
            return;
        }

        setIsExporting(true);
        const toastId = toast.loading("Generando reporte...");

        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Reporte de Movimientos");

            // Define las columnas y sus cabeceras
            worksheet.columns = [
                { header: "Fecha y Hora", key: "fecha", width: 25 },
                { header: "SKU", key: "sku", width: 20 },
                { header: "Producto", key: "producto", width: 35 },
                { header: "Tipo", key: "tipo", width: 15 },
                { header: "Cantidad", key: "cantidad", width: 15 },
                { header: "Motivo", key: "motivo", width: 25 },
                { header: "Usuario", key: "usuario", width: 25 },
                { header: "Observaciones", key: "observaciones", width: 40 },
            ];

            // Estilo para la cabecera
            worksheet.getRow(1).font = { bold: true };

            // Prepara los datos para Excel
            const dataForExcel = movements.map(mov => {
                const productInfo = mov.productInfo || products.find(p => p.id === mov.productId) || {};
                return {
                    fecha: new Date(mov.date._seconds * 1000).toLocaleString("es-CL"),
                    sku: productInfo.sku || "N/A",
                    producto: productInfo.nombre || "Sin Nombre",
                    tipo: mov.type,
                    cantidad: mov.quantity,
                    motivo: mov.reason,
                    usuario: mov.userName || "Desconocido",
                    observaciones: mov.observaciones || ""
                };
            });

            // Agrega las filas al worksheet
            worksheet.addRows(dataForExcel);

            // Genera el buffer del archivo
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `reporte_movimientos_${filters.startDate}_a_${filters.endDate}.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);

            toast.success("¡Reporte exportado exitosamente!", { id: toastId });

        } catch (error) {
            console.error("Error al exportar:", error);
            toast.error("No se pudo exportar el archivo.", { id: toastId });
        } finally {
            setIsExporting(false);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp || typeof timestamp._seconds !== 'number') return "N/A";
        const date = new Date(timestamp._seconds * 1000);
        return date.toLocaleString("es-CL", { dateStyle: 'short', timeStyle: 'short' });
    };



    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-text-primary">Reporte de Movimientos</h1>
                <p className="text-text-secondary mt-1">Filtra por rango de fechas para generar un reporte detallado.</p>
            </div>

            {/* --- ✨ INICIO: SECCIÓN DE FILTROS CORREGIDA ✨ --- */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    {/* Input de Fecha de Inicio */}
                    <div>
                        <label className="form-label">Fecha de Inicio</label>
                        <input
                            type="date"
                            name="startDate"
                            value={filters.startDate}
                            onChange={handleFilterChange}
                            className="form-input"
                        />
                    </div>
                    {/* Input de Fecha de Fin */}
                    <div>
                        <label className="form-label">Fecha de Fin</label>
                        <input
                            type="date"
                            name="endDate"
                            value={filters.endDate}
                            onChange={handleFilterChange}
                            className="form-input"
                        />
                    </div>
                    {/* Botones de Acción */}
                    <div className="lg:col-span-2 flex flex-col sm:flex-row gap-2">
                        <button onClick={handleGenerateReport} className="btn-primary flex-1 inline-flex items-center justify-center gap-2" disabled={loading || isExporting}>
                            {loading ? <LoadingSpinner size="sm" /> : <BarChart3 size={20} />}
                            <span>{loading ? 'Generando...' : 'Generar Reporte'}</span>
                        </button>
                        <button onClick={handleExportReport} className="btn-secondary flex-1 inline-flex items-center justify-center gap-2" disabled={loading || isExporting || movements.length === 0}>
                            {isExporting ? <LoadingSpinner size="sm" /> : <Download size={20} />}
                            <span>{isExporting ? 'Exportando...' : 'Exportar a Excel'}</span>
                        </button>
                    </div>
                </div>
            </div>
            {/* --- ✨ FIN: SECCIÓN DE FILTROS CORREGIDA ✨ --- */}

            <div className="bg-dark-card border border-dark-border rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-text-secondary">
                    <thead className="text-xs uppercase bg-dark-surface">
                        <tr>
                            <th className="px-6 py-3">Fecha</th>
                            <th className="px-6 py-3">Producto</th>
                            <th className="px-6 py-3">Tipo</th>
                            <th className="px-6 py-3">Cantidad</th>
                            <th className="px-6 py-3">Usuario</th>
                            <th className="px-6 py-3">Observaciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className="text-center py-16"><LoadingSpinner /></td></tr>
                        ) : movements.length > 0 ? (
                            movements.map((mov) => {
                                // --- ✨ INICIO DE LA CORRECCIÓN ✨ ---
                                // La lógica ahora está DENTRO del map, donde tiene acceso a cada 'mov'.
                                const product = products.find(p => p.id === mov.productId);

                                // Damos prioridad a 'productInfo'. Si no existe, usamos la búsqueda antigua como respaldo.
                                const productInfo = mov.productInfo || product || {};
                                // --- ✨ FIN DE LA CORRECCIÓN ✨ ---

                                return (
                                    <tr key={mov.id} className="border-b border-dark-border hover:bg-dark-surface/50">
                                        <td className="px-6 py-4 text-text-primary font-medium">{formatDate(mov.date)}</td>
                                        <td className="px-6 py-4">
                                            {/* Ahora usamos la variable 'productInfo' que acabamos de crear */}
                                            <div className="font-medium text-text-primary">{productInfo.nombre || 'Producto no encontrado'}</div>
                                            <div className="text-xs text-text-muted font-mono">{productInfo.sku || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-semibold ${mov.type === 'entrada' ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
                                                {mov.type === 'entrada' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                                {mov.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold">{mov.quantity}</td>
                                        <td className="px-6 py-4">{mov.userName}</td>
                                        <td className="px-6 py-4 text-xs">{mov.observaciones || 'N/A'}</td>
                                    </tr>
                                )
                            })
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center py-16">
                                    <Calendar size={48} className="mx-auto text-text-muted" />
                                    <h3 className="mt-4 text-lg font-semibold">Selecciona un rango de fechas</h3>
                                    <p className="mt-1 text-text-secondary">
                                        Elige una fecha de inicio y fin para ver el reporte de movimientos.
                                    </p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MovementsReportPage;