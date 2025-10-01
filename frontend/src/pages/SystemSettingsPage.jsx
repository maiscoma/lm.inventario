// frontend/src/pages/SystemSettingsPage.jsx

import { useState, useEffect } from "react";
import { settingsService } from "../services/settingsService";
import toast from "react-hot-toast";
import { Settings, Plus, Trash2, Save } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";

const SystemSettingsPage = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await settingsService.getCategories();
                if (response.success) {
                    setCategories(response.data);
                }
            } catch (error) {
                toast.error("No se pudieron cargar las categorías.");
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const handleAddCategory = () => {
        if (newCategory.trim() === "") {
            toast.error("El nombre de la categoría no puede estar vacío.");
            return;
        }
        if (categories.includes(newCategory.trim())) {
            toast.error("Esa categoría ya existe.");
            return;
        }
        setCategories([...categories, newCategory.trim()].sort());
        setNewCategory("");
    };

    const handleDeleteCategory = (categoryToDelete) => {
        setCategories(categories.filter(cat => cat !== categoryToDelete));
    };

    const handleSaveChanges = async () => {
        setSaving(true);
        try {
            const response = await settingsService.updateCategories(categories);
            if (response.success) {
                toast.success(response.message);
            }
        } catch (error) {
            toast.error("Error al guardar los cambios.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <LoadingSpinner text="Cargando configuración..." />;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Settings size={32} />
                <h1 className="text-3xl font-bold text-text-primary">Configuración del Sistema</h1>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 className="text-lg font-semibold text-text-primary">Categorías de Productos</h2>
                    <p className="text-sm text-text-secondary">Gestiona las categorías disponibles para los productos.</p>
                </div>

                <div className="space-y-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="form-input flex-grow"
                            placeholder="Nombre de la nueva categoría"
                        />
                        <button onClick={handleAddCategory} className="btn-secondary inline-flex items-center gap-2">
                            <Plus size={16} /> Añadir
                        </button>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {categories.map((cat) => (
                            <div key={cat} className="flex items-center justify-between bg-dark-surface p-3 rounded-lg">
                                <span className="text-text-primary">{cat}</span>
                                <button onClick={() => handleDeleteCategory(cat)} className="text-error p-1 rounded-full hover:bg-error/10">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

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

export default SystemSettingsPage;