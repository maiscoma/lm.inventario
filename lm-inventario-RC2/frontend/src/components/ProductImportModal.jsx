import { useState } from "react";
import { productService } from "../services/productService";
import toast from "react-hot-toast";
import { Upload, Download, AlertTriangle, CheckCircle } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";

const ProductImportModal = ({ isOpen, onClose, onImportSuccess }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [importResult, setImportResult] = useState(null);

    // --- ✨ INICIO: FUNCIÓN DE CIERRE Y LIMPIEZA ✨ ---
    const handleClose = () => {
        // 1. Limpiamos todos los estados internos del modal
        setSelectedFile(null);
        setImportResult(null);
        setIsProcessing(false);
        // 2. Llamamos a la función del padre para cerrar el modal
        onClose();
    };
    // --- ✨ FIN: FUNCIÓN DE CIERRE Y LIMPIEZA ✨ ---

    const handleFileChange = (e) => {
        setImportResult(null);
        const file = e.target.files[0];
        if (file && file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
            setSelectedFile(file);
        } else {
            toast.error("Por favor, selecciona un archivo Excel (.xlsx).");
            setSelectedFile(null);
        }
    };

    const handleImport = async () => {
        if (!selectedFile) return;
        setIsProcessing(true);
        setImportResult(null);
        try {
            const response = await productService.importProducts(selectedFile);
            if (response.success) {
                toast.success(response.message);
                setImportResult(response.data);
                onImportSuccess();
            }
        } catch (error) {
            toast.error(error.message || "Error al importar.");
        } finally {
            setIsProcessing(false);
        }
    };

    // --- ✨ INICIO: FUNCIÓN DE DESCARGA CORREGIDA ✨ ---
    const handleDownloadTemplate = async () => {
        const toastId = toast.loading("Descargando plantilla...");
        try {
            // Llama al backend para obtener el archivo Excel completo
            const blob = await productService.downloadImportTemplate();
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "plantilla_importacion_productos.xlsx");
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success("Plantilla descargada.", { id: toastId });
        } catch (error) {
            toast.error("No se pudo descargar la plantilla.", { id: toastId });
        }
    };
    // --- ✨ FIN: FUNCIÓN DE DESCARGA CORREGIDA ✨ ---

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center">
            <div className="bg-dark-card rounded-lg p-6 w-full max-w-lg space-y-4">
                <h2 className="text-xl font-bold text-text-primary">Importar Productos</h2>

                {!importResult ? (
                    <>
                        <p className="text-sm text-text-secondary">
                            Sube un archivo Excel (.xlsx) para añadir productos. Las categorías deben coincidir con las definidas en la configuración del sistema.
                        </p>
                        <button onClick={handleDownloadTemplate} className="text-sm text-primary hover:underline flex items-center gap-2">
                            <Download size={14} /> Descargar plantilla de importación
                        </button>
                        <div className="border-2 border-dashed border-dark-border rounded-lg p-6 text-center">
                            <input type="file" id="file-upload" className="hidden" onChange={handleFileChange} accept=".xlsx" />
                            <label htmlFor="file-upload" className="cursor-pointer">
                                <Upload className="mx-auto h-10 w-10 text-text-muted" />
                                <p className="mt-2 text-sm text-text-secondary">
                                    {selectedFile ? `Archivo: ${selectedFile.name}` : "Selecciona un archivo .xlsx"}
                                </p>
                            </label>
                        </div>
                        <div className="flex justify-end gap-4">
                            <button onClick={handleClose} className="btn-secondary">Cancelar</button>
                            <button onClick={handleImport} className="btn-primary" disabled={isProcessing || !selectedFile}>
                                {isProcessing ? <LoadingSpinner size="sm" /> : "Importar"}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="space-y-4">
                        <div className="text-center">
                            <CheckCircle size={40} className="mx-auto text-success" />
                            <h3 className="text-lg font-semibold mt-2">Proceso Finalizado</h3>
                        </div>
                        <p className="text-center text-text-primary">
                            <span className="font-bold text-success">{importResult.successfulImports}</span> productos fueron importados.
                        </p>
                        {importResult.errors.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-error flex items-center gap-2"><AlertTriangle size={16} /> Errores encontrados:</h4>
                                <ul className="text-sm text-error bg-error/10 p-3 rounded-md max-h-32 overflow-y-auto mt-2 space-y-1">
                                    {importResult.errors.map((err, index) => (
                                        <li key={index}><span className="font-semibold">Fila {err.row}:</span> {err.message}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <div className="flex justify-end">
                            <button onClick={handleClose} className="btn-primary">Cerrar</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductImportModal;