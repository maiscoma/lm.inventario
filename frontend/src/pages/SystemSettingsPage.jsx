// frontend/src/pages/SystemSettingsPage.jsx

import { useState, useEffect } from "react";
import { settingsService } from "../services/settingsService";
import toast from "react-hot-toast";
import { Settings, Plus, Trash2, Save, Info, Tag, Ruler } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import { useSettings } from "../contexts/SettingsContext";

const SystemSettingsPage = () => {
    const { settings, updateSettings, loading: loadingSettings } = useSettings(); // <-- 2. Usar el contexto
    // Estado para la pestaña activa
    const [activeTab, setActiveTab] = useState("general");

    // Estados para cada sección de configuración
    const [categories, setCategories] = useState([]);
    const [units, setUnits] = useState([]);
    const [parameters, setParameters] = useState({ companyName: "", currency: "" });

    // Estados de UI
    const [newItem, setNewItem] = useState({ category: "", unit: "" });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Carga inicial de todos los datos
    useEffect(() => {
        const fetchAllSettings = async () => {
            try {
                setParameters(settings);
                const [catRes, unitRes, paramRes] = await Promise.all([
                    settingsService.getCategories(),
                    settingsService.getUnits(),
                    settingsService.getGeneralParameters(),
                ]);
                if (catRes.success) setCategories(catRes.data);
                if (unitRes.success) setUnits(unitRes.data);
                if (paramRes.success) setParameters(paramRes.data);
            } catch (error) {
                toast.error("No se pudieron cargar todas las configuraciones.");
            } finally {
                setLoading(false);
            }
        };
        if (!loadingSettings) {
            fetchAllSettings();
        }
    }, [loadingSettings, settings]);

    // Manejadores para categorías
    const handleAddCategory = () => {
        const newCategory = newItem.category.trim();
        if (!newCategory) return toast.error("La categoría no puede estar vacía.");
        if (categories.includes(newCategory)) return toast.error("Esa categoría ya existe.");
        setCategories([...categories, newCategory].sort());
        setNewItem(prev => ({ ...prev, category: "" }));
    };
    const handleDeleteCategory = (cat) => setCategories(categories.filter(c => c !== cat));

    // Manejadores para unidades de medida
    const handleAddUnit = () => {
        const newUnit = newItem.unit.trim();
        if (!newUnit) return toast.error("La unidad no puede estar vacía.");
        if (units.includes(newUnit)) return toast.error("Esa unidad ya existe.");
        setUnits([...units, newUnit].sort());
        setNewItem(prev => ({ ...prev, unit: "" }));
    };
    const handleDeleteUnit = (unit) => setUnits(units.filter(u => u !== unit));

    const handleParameterChange = (e) => {
        const { name, value } = e.target;
        setParameters(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveChanges = async () => {
        setSaving(true);
        try {
            const [_, __, paramRes] = await Promise.all([
                settingsService.updateCategories(categories),
                settingsService.updateUnits(units),
                settingsService.updateGeneralParameters(parameters),
            ]);

            // --- INICIO DE LA MODIFICACIÓN ---
            // 5. Actualizar el contexto global tras guardar
            if (paramRes.success) {
                updateSettings(parameters);
            }
            // --- FIN DE LA MODIFICACIÓN ---

            toast.success("¡Configuración guardada exitosamente!");
        } catch (error) {
            toast.error("Error al guardar los cambios.");
        } finally {
            setSaving(false);
        }
    };

    if (loading || loadingSettings) {
        return <LoadingSpinner text="Cargando configuración..." />;
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'general':
                return (
                    <div className="max-w-md space-y-4"> {/* <--- El cambio es aquí */}
                        <div>
                            <label className="form-label">Nombre de la Empresa</label>
                            <input type="text" name="companyName" value={parameters.companyName} onChange={handleParameterChange} className="form-input" placeholder="Nombre de tu empresa" />
                        </div>
                    </div>
                );
            case 'categories':
                return <EditableList title="Categorías de Productos" items={categories} newItem={newItem.category} onNewItemChange={e => setNewItem(prev => ({ ...prev, category: e.target.value }))} onAdd={handleAddCategory} onDelete={handleDeleteCategory} />;
            case 'units':
                return <EditableList title="Unidades de Medida" items={units} newItem={newItem.unit} onNewItemChange={e => setNewItem(prev => ({ ...prev, unit: e.target.value }))} onAdd={handleAddUnit} onDelete={handleDeleteUnit} />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Settings size={32} />
                <h1 className="text-3xl font-bold text-text-primary">Configuración del Sistema</h1>
            </div>

            <div className="card">
                {/* Pestañas de Navegación */}
                <div className="flex border-b border-dark-border mb-6">
                    <TabButton icon={Info} label="General" tabName="general" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton icon={Tag} label="Categorías" tabName="categories" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton icon={Ruler} label="Unidades" tabName="units" activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>

                {/* Contenido de la pestaña activa */}
                <div className="min-h-[250px]">
                    {renderContent()}
                </div>

                {/* Botón de Guardar */}
                <div className="mt-6 pt-6 border-t border-dark-border flex justify-end">
                    <button onClick={handleSaveChanges} className="btn-primary inline-flex items-center gap-2" disabled={saving}>
                        {saving ? <LoadingSpinner size="sm" /> : <Save size={16} />}
                        {saving ? "Guardando..." : "Guardar Cambios"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Componente auxiliar para las pestañas
const TabButton = ({ icon: Icon, label, tabName, activeTab, setActiveTab }) => (
    <button
        onClick={() => setActiveTab(tabName)}
        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tabName ? "border-primary text-primary" : "border-transparent text-text-secondary hover:text-text-primary"}`}
    >
        <Icon size={16} />
        {label}
    </button>
);

// Componente auxiliar para las listas editables (Categorías y Unidades)
const EditableList = ({ title, items, newItem, onNewItemChange, onAdd, onDelete }) => (
    <div className="space-y-4">
        <div className="flex gap-2">
            <input
                type="text"
                value={newItem}
                onChange={onNewItemChange}
                className="form-input flex-grow"
                placeholder={`Nombre de la nueva ${title.toLowerCase().slice(0, -1)}`}
            />
            <button onClick={onAdd} className="btn-secondary inline-flex items-center gap-2">
                <Plus size={16} /> Añadir
            </button>
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {items.map((item) => (
                <div key={item} className="flex items-center justify-between bg-dark-surface p-3 rounded-lg">
                    <span className="text-text-primary">{item}</span>
                    <button onClick={() => onDelete(item)} className="text-error p-1 rounded-full hover:bg-error/10">
                        <Trash2 size={16} />
                    </button>
                </div>
            ))}
        </div>
    </div>
);

export default SystemSettingsPage;