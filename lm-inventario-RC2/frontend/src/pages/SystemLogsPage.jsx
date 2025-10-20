import { useState, useEffect } from "react";
import { systemLogsService } from "../services/systemLogsService";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import { Activity, ShieldAlert, FileText, LogIn, FilePlus, Edit, Trash2, Download } from "lucide-react";

const SystemLogsPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await systemLogsService.getAll();
            if (response.success) {
                setLogs(response.data);
            }
        } catch (error) {
            toast.error("No se pudieron cargar los logs del sistema.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    // Nueva función de exportación, igual a la de StockAlertsPage
    const handleExport = async () => {
        if (logs.length === 0) {
            toast.error("No hay datos para exportar.");
            return;
        }
        setIsExporting(true);
        const toastId = toast.loading("Generando reporte...");
        try {
            const blob = await systemLogsService.exportLogs();
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `reporte_logs_${new Date().toISOString().split('T')[0]}.xlsx`);
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

    const formatDate = (timestamp) => {
        if (!timestamp || !timestamp._seconds) return "Fecha inválida";
        return new Date(timestamp._seconds * 1000).toLocaleString("es-CL", {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    };

    const getActionIcon = (action) => {
        const iconProps = { size: 16, className: "mr-2" };
        switch (action) {
            case 'SESION_VERIFICADA': return <LogIn {...iconProps} />;
            case 'CREAR_PRODUCTO': return <FilePlus {...iconProps} />;
            case 'ACTUALIZAR_PRODUCTO': return <Edit {...iconProps} />;
            case 'ELIMINAR_PRODUCTO': return <Trash2 {...iconProps} className="mr-2 text-error" />;
            case 'CAMBIAR_ROL_USUARIO':
            case 'CAMBIAR_ESTADO_USUARIO': return <ShieldAlert {...iconProps} />;
            case 'ELIMINAR_USUARIO': return <Trash2 {...iconProps} className="mr-2 text-error" />;
            default: return <FileText {...iconProps} />;
        }
    };

    if (loading) {
        return <LoadingSpinner text="Cargando registros del sistema..." />;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
                        <Activity size={32} />
                        Logs del Sistema
                    </h1>
                    <p className="text-text-secondary mt-1">
                        Auditoría de las acciones más recientes realizadas en el sistema.
                    </p>
                </div>
                <button onClick={handleExport} disabled={isExporting || logs.length === 0} className="btn-secondary inline-flex items-center gap-2">
                    {isExporting ? <LoadingSpinner size="sm" /> : <Download size={20} />}
                    <span>{isExporting ? 'Exportando...' : 'Exportar a Excel'}</span>
                </button>
            </div>

            <div className="bg-dark-card border border-dark-border rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="text-xs uppercase bg-dark-surface text-text-secondary">
                        <tr>
                            <th className="px-6 py-3 text-left">Fecha y Hora</th>
                            <th className="px-6 py-3 text-left">Actor</th>
                            <th className="px-6 py-3 text-left">Acción</th>
                            <th className="px-6 py-3 text-left">Detalles</th>
                        </tr>
                    </thead>
                    <tbody className="text-text-secondary">
                        {logs.length > 0 ? (
                            logs.map((log) => (
                                <tr key={log.id} className="border-b border-dark-border hover:bg-dark-surface/50">
                                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs">{formatDate(log.timestamp)}</td>
                                    <td className="px-6 py-4 font-medium text-text-primary">{log.actor}</td>
                                    <td className="px-6 py-4">
                                        <span className="flex items-center px-2 py-1 bg-secondary/20 text-secondary rounded-full text-xs font-semibold whitespace-nowrap">
                                            {getActionIcon(log.action)}
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-text-muted">{log.details}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center py-16">
                                    <FileText size={48} className="mx-auto text-text-muted" />
                                    <h3 className="mt-4 text-lg font-semibold">No hay registros</h3>
                                    <p className="mt-1 text-text-secondary">
                                        Aún no se han registrado actividades en el sistema.
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

export default SystemLogsPage;