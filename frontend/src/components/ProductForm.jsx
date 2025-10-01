"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { productService } from "../services/productService"
// --- INICIO: AÑADIR IMPORTACIONES ---
import { uploadService } from "../services/uploadService"
import { UploadCloud } from "lucide-react"
import { settingsService } from "../services/settingsService";
// --- FIN: AÑADIR IMPORTACIONES ---
import LoadingSpinner from "./LoadingSpinner"
import toast from "react-hot-toast"


const ProductForm = ({ productId = null, isEdit = false }) => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  // --- INICIO: AÑADIR ESTADOS PARA LA SUBIDA DE IMAGEN ---
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  // --- FIN: AÑADIR ESTADOS PARA LA SUBIDA DE IMAGEN ---

  const initialState = {
    sku: "",
    nombre: "",
    descripcion: "",
    categoria: "",
    marca: "",
    modelo: "",
    unidadMedida: "unidad",
    estado: "activo",
    imageUrl: "",
    // ✨ INICIO DE LA MODIFICACIÓN ✨
    codigoBarras: "",
    notas: "",
    // ✨ FIN DE LA MODIFICACIÓN ✨
    stock: {
      actual: 0,
      minimo: 0,
      maximo: 100,
    },
    precios: {
      compra: 0,
      venta: 0,
      margen: 0,
    },
  };

  const [formData, setFormData] = useState(initialState);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await productService.getById(productId);
      if (response.success) {
        setFormData({ ...initialState, ...response.data });
      }
    } catch (error) {
      console.error("Error al cargar producto:", error);
      toast.error("Error al cargar el producto");
      navigate("/products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEdit && productId) {
      loadProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, productId]);
  // --- INICIO: AÑADIR CÓDIGO PARA CARGAR CATEGORÍAS ---
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await settingsService.getCategories();
        if (response.success) {
          setCategories(response.data);
        }
      } catch (error) {
        toast.error("No se pudieron cargar las categorías.");
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []); // El array vacío [] asegura que se ejecute solo una vez.
  // --- FIN: AÑADIR CÓDIGO PARA CARGAR CATEGORÍAS ---

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const finalValue = type === "number" ? Number.parseFloat(value) || 0 : value;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: finalValue,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: finalValue,
      }));
    }
  };

  // --- INICIO: AÑADIR FUNCIÓN PARA MANEJAR EL ARCHIVO ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      // Creamos una URL local para la previsualización inmediata
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      toast.error("Por favor, selecciona un archivo de imagen válido (JPG, PNG, etc.).");
    }
  };
  // --- FIN: AÑADIR FUNCIÓN PARA MANEJAR EL ARCHIVO ---

  const calculateMargin = () => {
    const { compra, venta } = formData.precios;
    if (compra > 0 && venta > 0) {
      const margen = ((venta - compra) / compra) * 100;
      setFormData((prev) => ({
        ...prev,
        precios: {
          ...prev.precios,
          margen: Math.round(margen * 100) / 100,
        },
      }));
    }
  };

  useEffect(() => {
    calculateMargin();
  }, [formData.precios.compra, formData.precios.venta]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.sku || !formData.nombre || !formData.categoria) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    setLoading(true);

    try {
      let finalImageUrl = formData.imageUrl;

      // --- INICIO: LÓGICA DE SUBIDA DE IMAGEN ---
      // 1. Si el usuario seleccionó un nuevo archivo, lo subimos primero.
      if (selectedFile) {
        setIsUploading(true);
        setUploadProgress(0); // Reiniciar progreso

        const uploadResponse = await uploadService.uploadImage(selectedFile, (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        });

        if (uploadResponse.success && uploadResponse.data.url) {
          finalImageUrl = uploadResponse.data.url; // Obtenemos la URL de Firebase
        } else {
          throw new Error("La subida de la imagen falló. Inténtalo de nuevo.");
        }
        setIsUploading(false);
      }
      // --- FIN: LÓGICA DE SUBIDA DE IMAGEN ---

      const productData = { ...formData, imageUrl: finalImageUrl };

      // 2. Se crea o actualiza el producto con la URL final de la imagen.
      const response = isEdit
        ? await productService.update(productId, productData)
        : await productService.create(productData);

      if (response.success) {
        toast.success(isEdit ? "Producto actualizado exitosamente" : "Producto creado exitosamente");
        navigate("/products");
      }
    } catch (error) {
      console.error("Error al guardar producto:", error);
      toast.error(error.message || "Error al guardar el producto");
      setIsUploading(false); // Asegurarse de detener el estado de subida en caso de error
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/products")} className="text-text-secondary hover:text-text-primary transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{isEdit ? "Editar Producto" : "Crear Producto"}</h1>
          <p className="text-text-secondary">{isEdit ? "Modifica la información del producto" : "Ingresa los datos del nuevo producto"}</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="card-header"><h2 className="text-lg font-semibold text-text-primary">Información Básica</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="form-label">SKU *</label><input type="text" name="sku" value={formData.sku} onChange={handleInputChange} className="form-input" placeholder="Ej: PROD-001" required /></div>
            <div><label className="form-label">Nombre *</label><input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} className="form-input" placeholder="Nombre del producto" required /></div>
            <div className="md:col-span-2"><label className="form-label">Descripción</label><textarea name="descripcion" value={formData.descripcion} onChange={handleInputChange} className="form-input" rows="3" placeholder="Descripción detallada del producto" /></div>
            {/* --- INICIO: REEMPLAZA ESTE BLOQUE ENTERO --- */}
            <div>
              <label className="form-label">Categoría *</label>
              {loadingCategories ? (
                <p className="text-sm text-text-muted mt-2">Cargando categorías...</p>
              ) : (
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                >
                  <option value="">Seleccione una categoría</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              )}
            </div>
            {/* --- FIN: REEMPLAZA ESTE BLOQUE ENTERO --- */}
            {/* ✨ INICIO DEL CÓDIGO AÑADIDO ✨ */}
            <div>
              <label className="form-label">Estado</label>
              <select name="estado" value={formData.estado} onChange={handleInputChange} className="form-input">
                <option value="activo">Activo</option>
                <option value="sin-stock">Sin Stock</option>
                <option value="dañado">Dañado</option>
                <option value="descontinuado">Descontinuado</option>
              </select>
            </div>
            {/* ✨ FIN DEL CÓDIGO AÑADIDO ✨ */}
            <div>
              <label className="form-label">Unidad de Medida</label>
              <select name="unidadMedida" value={formData.unidadMedida} onChange={handleInputChange} className="form-input">
                <option value="unidad">Unidad</option><option value="kg">Kilogramo</option><option value="litro">Litro</option><option value="metro">Metro</option><option value="caja">Caja</option><option value="paquete">Paquete</option>
              </select>
            </div>
            <div><label className="form-label">Marca</label><input type="text" name="marca" value={formData.marca} onChange={handleInputChange} className="form-input" placeholder="Marca del producto" /></div>
            <div><label className="form-label">Modelo</label><input type="text" name="modelo" value={formData.modelo} onChange={handleInputChange} className="form-input" placeholder="Modelo del producto" /></div>
            {/* ✨ INICIO DE LA MODIFICACIÓN ✨ */}
            <div className="md:col-span-2">
              <label className="form-label">Código de Barras</label>
              <input type="text" name="codigoBarras" value={formData.codigoBarras} onChange={handleInputChange} className="form-input" placeholder="Escanear o ingresar código de barras" />
            </div>
            <div className="md:col-span-2">
              <label className="form-label">Notas</label>
              <textarea name="notas" value={formData.notas} onChange={handleInputChange} className="form-input" rows="3" placeholder="Notas internas sobre el producto" />
            </div>
            {/* ✨ FIN DE LA MODIFICACIÓN ✨ */}
            {/* --- INICIO: NUEVO CAMPO PARA SUBIR IMAGEN --- */}
            <div className="md:col-span-2">
              <label className="form-label">Imagen del Producto</label>
              <div className="flex items-center gap-4">
                <img src={formData.imageUrl || "/placeholder-logo.png"} alt="Vista previa" className="w-24 h-24 rounded-md object-cover bg-dark-surface" />
                <div className="flex-1">
                  <label htmlFor="image-upload" className="cursor-pointer form-input flex flex-col items-center justify-center text-center border-dashed h-24">
                    <UploadCloud className="w-8 h-8 text-text-muted" />
                    <span className="mt-2 text-sm text-text-secondary">{selectedFile ? selectedFile.name : "Seleccionar o arrastrar imagen"}</span>
                    <input id="image-upload" name="imageUrl" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                  </label>
                  {isUploading && (
                    <div className="mt-2 w-full bg-dark-surface rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full transition-width duration-300" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* --- FIN: NUEVO CAMPO PARA SUBIR IMAGEN --- */}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h2 className="text-lg font-semibold text-text-primary">Control de Stock</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="form-label">Stock Actual</label><input type="number" name="stock.actual" value={formData.stock.actual} onChange={handleInputChange} className="form-input" min="0" step="1" /></div>
            <div><label className="form-label">Stock Mínimo</label><input type="number" name="stock.minimo" value={formData.stock.minimo} onChange={handleInputChange} className="form-input" min="0" step="1" /></div>
            <div><label className="form-label">Stock Máximo</label><input type="number" name="stock.maximo" value={formData.stock.maximo} onChange={handleInputChange} className="form-input" min="1" step="1" /></div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h2 className="text-lg font-semibold text-text-primary">Precios</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="form-label">Precio de Compra</label><input type="number" name="precios.compra" value={formData.precios.compra} onChange={handleInputChange} className="form-input" min="0" step="0.01" placeholder="0.00" /></div>
            <div><label className="form-label">Precio de Venta</label><input type="number" name="precios.venta" value={formData.precios.venta} onChange={handleInputChange} className="form-input" min="0" step="0.01" placeholder="0.00" /></div>
            <div><label className="form-label">Margen (%)</label><input type="number" name="precios.margen" value={formData.precios.margen} className="form-input bg-dark-surface" readOnly step="0.01" /></div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => navigate("/products")} className="btn-secondary" disabled={loading || isUploading}>Cancelar</button>
          <button type="submit" className="btn-primary" disabled={loading || isUploading}>
            {(loading || isUploading) ? (<div className="flex items-center gap-2"><LoadingSpinner size="sm" color="white" />{isUploading ? "Subiendo..." : (isEdit ? "Actualizando..." : "Guardando...")}</div>) : isEdit ? "Actualizar Producto" : "Crear Producto"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProductForm