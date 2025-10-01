// frontend/src/components/Header.jsx

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';
import { LogOut, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            toast.error("Error al cerrar sesión");
        }
    };

    return (
        <header className="flex items-center justify-end h-16 px-6 bg-dark-surface border-b border-dark-border sticky top-0 z-30">
            <div className="flex items-center gap-4">
                {/* Componente de Notificaciones */}
                <NotificationBell />

                {/* Separador Visual */}
                <div className="w-px h-6 bg-dark-border"></div>

                {/* Menú de Usuario */}
                <div className="relative">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center gap-3 hover:bg-dark-card p-2 rounded-lg transition-colors">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {user?.nombre?.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-left hidden md:block">
                            <p className="text-sm font-medium text-text-primary truncate">{user?.nombre}</p>
                            <p className="text-xs text-text-muted capitalize">{user?.rol}</p>
                        </div>
                        <ChevronDown size={16} className={`text-text-muted transition-transform hidden md:block ${isMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Panel Desplegable del Menú */}
                    {isMenuOpen && (
                        <>
                            <div onClick={() => setIsMenuOpen(false)} className="fixed inset-0 z-30"></div>
                            <div className="absolute right-0 mt-2 w-48 bg-dark-card border border-dark-border rounded-lg shadow-lg z-40">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-text-secondary hover:text-error hover:bg-error/10 transition-colors rounded-lg"
                                >
                                    <LogOut size={16} />
                                    <span>Cerrar Sesión</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;