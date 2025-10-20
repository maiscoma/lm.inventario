// frontend/src/pages/RegisterPage.jsx

import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { User, Mail, Lock, AlertCircle } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import { useSettings } from "../contexts/SettingsContext";

// --- INICIO: IMPORTACIONES PARA PARTÍCULAS ---
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import particlesOptions from "../components/particles-config";
// --- FIN: IMPORTACIONES PARA PARTÍCULAS ---

const RegisterPage = () => {
    const { register, isAuthenticated, isLoading, error, clearError } = useAuth();
    const { settings } = useSettings();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nombre: "",
        email: "",
        password: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- INICIO: LÓGICA DE PARTÍCULAS ---
    const particlesInit = useCallback(async (engine) => {
        await loadSlim(engine);
    }, []);
    // --- FIN: LÓGICA DE PARTÍCULAS ---

    useEffect(() => {
        clearError();
    }, [clearError]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-bg">
                <LoadingSpinner size="lg" text="Cargando..." />
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nombre || !formData.email || !formData.password) {
            toast.error("Por favor, completa todos los campos.");
            return;
        }
        if (formData.password.length < 6) {
            toast.error("La contraseña debe tener al menos 6 caracteres.");
            return;
        }
        setIsSubmitting(true);
        const result = await register(formData.nombre, formData.email, formData.password);
        if (result.success) {
            navigate("/login");
        }
        setIsSubmitting(false);
    };

    return (
        // --- CAMBIO 1: Se quita `bg-dark-bg` y se añade `relative` ---
        <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative">
            {/* --- INICIO: COMPONENTE DE PARTÍCULAS --- */}
            {/* --- FIN: COMPONENTE DE PARTÍCULAS --- */}

            {/* --- CAMBIO 2: Se añade `z-10` para que el contenido esté por encima --- */}
            <div className="max-w-md w-full space-y-8 z-10">
                <div className="text-center">
                    <img src="/logo.png" alt={settings.companyName} className="w-20 h-20 mx-auto object-contain mb-6" />
                    <h2 className="text-3xl font-bold gradient-text mb-2">Crear una Cuenta</h2>
                    <p className="text-text-secondary">Únete al Sistema de Inventario</p>
                </div>

                {/* --- CAMBIO 3: Se añade efecto "glass" al formulario --- */}
                <div className="bg-dark-card/80 backdrop-blur-sm border border-dark-border rounded-xl p-6 transition-all duration-300 hover:shadow-glow hover:-translate-y-0.5">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-error/10 border border-error/20 text-error text-sm rounded-lg p-3 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div>
                            <label className="form-label">Nombre Completo</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-text-muted" />
                                </div>
                                <input name="nombre" type="text" value={formData.nombre} onChange={handleInputChange} required
                                    className="w-full pl-10 pr-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                                    placeholder="Ej: Juan Pérez" />
                            </div>
                        </div>

                        <div>
                            <label className="form-label">Correo Electrónico</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-text-muted" />
                                </div>
                                <input name="email" type="email" value={formData.email} onChange={handleInputChange} required
                                    className="w-full pl-10 pr-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                                    placeholder="tu-correo@ejemplo.com" />
                            </div>
                        </div>

                        <div>
                            <label className="form-label">Contraseña</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-text-muted" />
                                </div>
                                <input name="password" type="password" value={formData.password} onChange={handleInputChange} required
                                    className="w-full pl-10 pr-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                                    placeholder="Mínimo 6 caracteres" />
                            </div>
                        </div>

                        <div>
                            <button type="submit" disabled={isSubmitting} className="w-full btn-primary flex items-center justify-center gap-2">
                                {isSubmitting ? <><LoadingSpinner size="sm" color="white" /><span>Registrando...</span></> : "Crear Cuenta"}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-text-secondary">
                            ¿Ya tienes una cuenta?{" "}
                            <Link to="/login" className="font-medium text-primary hover:underline">
                                Inicia sesión aquí
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-xs text-text-muted">© 2025 {settings.companyName}. Todos los derechos reservados.</p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;