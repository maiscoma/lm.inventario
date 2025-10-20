import { useState } from "react";
import { databaseService } from "../services/databaseService";
import toast from "react-hot-toast";
import { Database, Download } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";

const DatabasePage = () => {
    const [isBackingUp, setIsBackingUp] = useState(false);

    const handleBackup = async () => {
        setIsBackingUp(true);
        const toastId = toast.loading("Generando backup completo...");
        try {
            const blob = await databaseService.createBackup();
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `backup_inventario_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success("Backup descargado.", { id: toastId });
        } catch (error) {
            toast.error("Error al generar el backup.", { id: toastId });
        } finally {
            setIsBackingUp(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Database size={32} />
                <h1 className="text-3xl font-bold text-text-primary">Base de Datos</h1>
            </div>
            <div className="card">
                <h2 className="text-lg font-semibold text-text-primary">Respaldo de Datos</h2>
                <p className="text-sm text-text-secondary mt-1 mb-4">
                    Genera un archivo Excel (.xlsx) con una copia de seguridad de las colecciones principales de la base de datos (productos, movimientos, logs, etc.).
                </p>
                <button onClick={handleBackup} className="btn-primary inline-flex items-center gap-2" disabled={isBackingUp}>
                    {isBackingUp ? <LoadingSpinner size="sm" /> : <Download size={16} />}
                    {isBackingUp ? "Generando..." : "Generar Backup Completo"}
                </button>
            </div>
        </div>
    );
};

export default DatabasePage;