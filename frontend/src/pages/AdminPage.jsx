// frontend/src/pages/AdminPage.jsx

import { useAuth } from "../contexts/AuthContext";
import { Users, Settings, Database, Shield, Activity, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Componente para las tarjetas de administración
    const AdminCard = ({ title, description, icon: Icon, color, action, disabled = false }) => (
        <div 
            onClick={!disabled ? action : undefined} 
            className={`bg-dark-card border border-dark-border p-6 rounded-lg transition-all duration-300 ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"}`}
        >
            <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text-primary mb-1">{title}</h3>
                    <p className="text-text-secondary text-sm">{description}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">Panel de Administración</h1>
                    <p className="text-text-secondary mt-1">Gestiona usuarios, configuraciones y el sistema.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="text-primary font-medium text-sm">Administrador</span>
                </div>
            </div>

            {/* Secciones de administración */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* --- INICIO DEL CÓDIGO CORREGIDO --- */}
                {/* Esta es la tarjeta que hemos habilitado */}
                <AdminCard
                    title="Gestión de Usuarios"
                    description="Administra usuarios, roles y permisos del sistema."
                    icon={Users}
                    color="bg-gradient-to-r from-primary to-primary-dark"
                    action={() => navigate("/admin/usuarios")}
                    disabled={false} 
                />
                {/* --- FIN DEL CÓDIGO CORREGIDO --- */}
                
                <AdminCard
                    title="Configuración del Sistema"
                    description="Parámetros generales, categorías y unidades de medida."
                    icon={Settings}
                    color="bg-gradient-to-r from-secondary to-blue-600"
                    action={() => {}}
                    disabled={true}
                />
                <AdminCard
                    title="Base de Datos"
                    description="Realiza respaldos y gestiona la integridad de los datos."
                    icon={Database}
                    color="bg-gradient-to-r from-accent to-purple-600"
                    action={() => navigate("/admin/base-de-datos")}
                    disabled={false}
                />
                <AdminCard
                    title="Logs del Sistema"
                    description="Revisa registros de actividad, errores y eventos importantes."
                    icon={Activity}
                    color="bg-gradient-to-r from-warning to-orange-500"
                    action={() => navigate("/admin/logs")}
                    disabled={false}
                />
            </div>
            
            {/* ... (El resto del archivo puede quedar igual) ... */}
            
        </div>
    );
};

export default AdminPage;