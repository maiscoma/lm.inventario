// frontend/src/pages/ForgotPasswordPage.jsx

import { useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "../services/authService";
import { useSettings } from "../contexts/SettingsContext";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

const ForgotPasswordPage = () => {
    const { settings } = useSettings();
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(""); // Para mostrar un mensaje de éxito

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error("Por favor, ingresa tu correo electrónico.");
            return;
        }

        setIsSubmitting(true);
        setMessage("");
        const toastId = toast.loading("Enviando correo...");

        try {
            await authService.sendPasswordReset(email);
            toast.success("Correo enviado con éxito.", { id: toastId });
            setMessage("Si existe una cuenta con este correo, recibirás un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada y spam.");
            setEmail(""); // Limpiar el campo
        } catch (error) {
            toast.error(error.message || "Ocurrió un error.", { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-md w-full space-y-8 z-10">
                <div className="text-center">
                    <img src="/logo.png" alt={settings.companyName} className="w-20 h-20 mx-auto object-contain mb-6" />
                    <h2 className="text-3xl font-bold gradient-text mb-2">Restablecer Contraseña</h2>
                    <p className="text-text-secondary">Ingresa tu correo para recibir las instrucciones.</p>
                </div>

                <div className="bg-dark-card/80 backdrop-blur-sm border border-dark-border rounded-xl p-6">
                    {message ? (
                        <div className="text-center">
                            <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
                            <p className="text-text-secondary">{message}</p>
                            <Link to="/login" className="btn-primary mt-6 inline-block">
                                Volver a Inicio de Sesión
                            </Link>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                                    Correo Electrónico
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-text-muted" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        placeholder="tu-correo@ejemplo.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <button type="submit" disabled={isSubmitting} className="w-full btn-primary flex items-center justify-center gap-2">
                                    {isSubmitting ? <LoadingSpinner size="sm" color="white" /> : "Enviar Correo"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {!message && (
                    <div className="text-center">
                        <Link to="/login" className="text-sm font-medium text-primary hover:underline flex items-center justify-center gap-2">
                            <ArrowLeft size={16} />
                            Volver a Inicio de Sesión
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordPage;