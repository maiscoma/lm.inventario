// frontend/src/components/ProductForm.jsx

"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom" // useParams se usa en EditProductPage, no directamente aquí
import { productService } from "../services/productService"
import { uploadService } from "../services/uploadService"
import { Settings, Plus, Trash2, Save, Info, Tag, Ruler, UploadCloud, ArrowLeft } from "lucide-react";
import { settingsService } from "../services/settingsService";
import LoadingSpinner from "./LoadingSpinner"
import toast from "react-hot-toast"

// Se mantiene la estructura original que recibe props
const ProductForm = ({ productId = null, isEdit = false }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    // --- INICIO: LÓGICA PARA UNIDADES DE MEDIDA DINÁMICAS ---
    const [units, setUnits] = useState([]);
    const [loadingUnits, setLoadingUnits] = useState(true);
    // --- FIN: LÓGICA PARA UNIDADES DE MEDIDA DINÁMICAS ---

    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState(null);

    const initialState = {
        sku: "", nombre: "", descripcion: "", categoria: "", marca: "",
        modelo: "", unidadMedida: "", estado: "activo", imageUrl: "",
        codigoBarras: "", notas: "",
        stock: { actual: 0, minimo: 0, maximo: 100 },
        precios: { compra: 0, venta: 0, margen: 0 },
    };

    const [formData, setFormData] = useState(initialState);

    // --- INICIO: CARGA EFICIENTE Y COMBINADA DE CONFIGURACIONES ---
    useEffect(() => {
        const fetchSettings = async () => {
            setLoadingCategories(true);
            setLoadingUnits(true);
            try {
                // Se cargan ambas configuraciones en paralelo para mejorar el rendimiento
                const [catRes, unitRes] = await Promise.all([
                    settingsService.getCategories(),
                    settingsService.getUnits()
                ]);
                if (catRes.success) setCategories(catRes.data);
                if (unitRes.success) setUnits(unitRes.data);
            } catch (error) {
                toast.error("No se pudieron cargar las configuraciones.");
            } finally {
                setLoadingCategories(false);
                setLoadingUnits(false);
            }
        };
        fetchSettings();
    }, []);
    // --- FIN: CARGA EFICIENTE Y COMBINADA DE CONFIGURACIONES ---

    // Carga del producto a editar (sin cambios)
    useEffect(() => {
        const loadProduct = async () => {
            if (isEdit && productId) {
                try {
                    setLoading(true);
                    const response = await productService.getById(productId);
                    if (response.success) {
                        setFormData({ ...initialState, ...response.data });
                    }
                } catch (error) {
                    toast.error("Error al cargar el producto");
                    navigate("/products");
                } finally {
                    setLoading(false);
                }
            }
        };
        loadProduct();
    }, [isEdit, productId, navigate]);


    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        const finalValue = type === "number" ? Number.parseFloat(value) || 0 : value;
        if (name.includes(".")) {
            const [parent, child] = name.split(".");
            setFormData((prev) => ({ ...prev, [parent]: { ...prev[parent], [child]: finalValue } }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: finalValue }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setFormData(prev => ({ ...prev, imageUrl: reader.result }));
            reader.readAsDataURL(file);
        } else {
            toast.error("Por favor, selecciona un archivo de imagen válido.");
        }
    };

    useEffect(() => {
        const calculateMargin = () => {
            const { compra, venta } = formData.precios;
            if (compra > 0 && venta > 0) {
                const margen = ((venta - compra) / compra) * 100;
                setFormData((prev) => ({ ...prev, precios: { ...prev.precios, margen: Math.round(margen) } }));
            } else {
                 setFormData((prev) => ({ ...prev, precios: { ...prev.precios, margen: 0 } }));
            }
        };
        calculateMargin();
    }, [formData.precios.compra, formData.precios.venta]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.sku || !formData.nombre || !formData.categoria || !formData.unidadMedida) {
            toast.error("Por favor completa todos los campos requeridos (*).");
            return;
        }
        setLoading(true);
        try {
            let finalImageUrl = formData.imageUrl;
            if (selectedFile) {
                setIsUploading(true);
                const uploadResponse = await uploadService.uploadImage(selectedFile, (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percent);
                });
                if (uploadResponse.success && uploadResponse.data.url) {
                    finalImageUrl = uploadResponse.data.url;
                } else {
                    throw new Error("La subida de la imagen falló.");
                }
                setIsUploading(false);
            }
            const productData = { ...formData, imageUrl: finalImageUrl };
            const response = isEdit
                ? await productService.update(productId, productData)
                : await productService.create(productData);
            if (response.success) {
                toast.success(response.message);
                navigate("/products");
            }
        } catch (error) {
            toast.error(error.message || "Error al guardar el producto.");
            setIsUploading(false);
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEdit) {
        return <LoadingSpinner text="Cargando producto..." />;
    }

    // --- INICIO: SE RESTAURA TODA LA ESTRUCTURA JSX ORIGINAL ---
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate("/products")} className="btn-ghost p-2 rounded-full"><ArrowLeft /></button>
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">{isEdit ? "Editar Producto" : "Crear Producto"}</h1>
                    <p className="text-text-secondary">{isEdit ? "Modifica la información del producto" : "Ingresa los datos del nuevo producto"}</p>
                </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="card">
                    <h2 className="card-header text-lg font-semibold text-text-primary">Información Básica</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="form-label">SKU *</label><input type="text" name="sku" value={formData.sku} onChange={handleInputChange} className="form-input" placeholder="Ej: PROD-001" required /></div>
                        <div><label className="form-label">Nombre *</label><input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} className="form-input" placeholder="Nombre del producto" required /></div>
                        <div className="md:col-span-2"><label className="form-label">Descripción</label><textarea name="descripcion" value={formData.descripcion} onChange={handleInputChange} className="form-input" rows="3" placeholder="Descripción detallada" /></div>
                        <div><label className="form-label">Categoría *</label>
                            <select name="categoria" value={formData.categoria} onChange={handleInputChange} className="form-input" required disabled={loadingCategories}>
                                <option value="">{loadingCategories ? 'Cargando...' : 'Selecciona una categoría'}</option>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        
                        {/* --- MODIFICACIÓN CLAVE: CAMPO DE UNIDADES DINÁMICO --- */}
                        <div>
                            <label className="form-label">Unidad de Medida *</label>
                            <select name="unidadMedida" value={formData.unidadMedida} onChange={handleInputChange} className="form-input" required disabled={loadingUnits}>
                                <option value="">{loadingUnits ? 'Cargando...' : 'Selecciona una unidad'}</option>
                                {units.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                            </select>
                        </div>
                        {/* --- FIN DE LA MODIFICACIÓN CLAVE --- */}

                        <div><label className="form-label">Marca</label><input type="text" name="marca" value={formData.marca} onChange={handleInputChange} className="form-input" placeholder="Marca del producto" /></div>
                        <div><label className="form-label">Modelo</label><input type="text" name="modelo" value={formData.modelo} onChange={handleInputChange} className="form-input" placeholder="Modelo del producto" /></div>
                        <div className="md:col-span-2"><label className="form-label">Código de Barras</label><input type="text" name="codigoBarras" value={formData.codigoBarras} onChange={handleInputChange} className="form-input" placeholder="Escanear o ingresar código" /></div>
                        <div className="md:col-span-2"><label className="form-label">Notas</label><textarea name="notas" value={formData.notas} onChange={handleInputChange} className="form-input" rows="2" placeholder="Notas internas" /></div>
                    </div>
                </div>

                <div className="card">
                    <h2 className="card-header text-lg font-semibold text-text-primary">Imagen</h2>
                    <div className="flex items-center gap-4">
                        <img src={formData.imageUrl || "/placeholder-logo.png"} alt="Vista previa" className="w-24 h-24 rounded-md object-cover bg-dark-surface" />
                        <div className="flex-1">
                            <label htmlFor="image-upload" className="cursor-pointer form-input flex flex-col items-center justify-center text-center border-dashed h-24">
                                <UploadCloud className="w-8 h-8 text-text-muted" />
                                <span className="mt-2 text-sm text-text-secondary">{selectedFile ? selectedFile.name : "Seleccionar imagen"}</span>
                                <input id="image-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                            </label>
                            {isUploading && <div className="mt-2 w-full bg-dark-surface rounded-full h-2.5"><div className="bg-primary h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div></div>}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="card">
                        <h2 className="card-header text-lg font-semibold">Control de Stock</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div><label className="form-label">Stock Actual</label><input type="number" name="stock.actual" value={formData.stock.actual} onChange={handleInputChange} className="form-input" min="0" /></div>
                            <div><label className="form-label">Stock Mínimo</label><input type="number" name="stock.minimo" value={formData.stock.minimo} onChange={handleInputChange} className="form-input" min="0" /></div>
                            <div><label className="form-label">Stock Máximo</label><input type="number" name="stock.maximo" value={formData.stock.maximo} onChange={handleInputChange} className="form-input" min="0" /></div>
                        </div>
                    </div>
                    <div className="card">
                        <h2 className="card-header text-lg font-semibold">Precios</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div><label className="form-label">Precio Compra</label><input type="number" name="precios.compra" value={formData.precios.compra} onChange={handleInputChange} className="form-input" min="0" step="any" /></div>
                            <div><label className="form-label">Precio Venta</label><input type="number" name="precios.venta" value={formData.precios.venta} onChange={handleInputChange} className="form-input" min="0" step="any" /></div>
                            <div><label className="form-label">Margen (%)</label><input type="number" value={formData.precios.margen} className="form-input bg-dark-surface" readOnly /></div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button type="button" onClick={() => navigate("/products")} className="btn-secondary" disabled={loading || isUploading}>Cancelar</button>
                    <button type="submit" className="btn-primary" disabled={loading || isUploading}>
                        {loading || isUploading ? <LoadingSpinner size="sm" /> : (isEdit ? "Actualizar Producto" : "Crear Producto")}
                    </button>
                </div>
            </form>
        </div>
    );
    // --- FIN: SE RESTAURA TODA LA ESTRUCTURA JSX ORIGINAL ---
};

export default ProductForm;