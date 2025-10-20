// frontend/src/components/Header.jsx

import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import NotificationBell from "./NotificationBell";
import { Menu } from "lucide-react";

// Recibe una única función para alternar el sidebar
const Header = ({ toggleSidebar }) => {
    const { user } = useAuth();

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-dark-border bg-dark-surface/80 px-4 backdrop-blur-sm sm:px-6">
            <div className="flex items-center gap-4">
                {/* --- SOLUCIÓN: Botón de menú único y siempre visible --- */}
                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-full hover:bg-dark-card" // Sin clases 'hidden' o 'lg:block'
                    aria-label="Alternar menú"
                >
                    <Menu size={24} />
                </button>
            </div>

            <div className="flex items-center gap-4">
                <NotificationBell />

                {user && (
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-text-primary">
                                {user.nombre}
                            </p>
                            <p className="text-xs text-text-secondary capitalize">
                                {user.rol}
                            </p>
                        </div>
                        <Link to="/admin/usuarios">
                            {user.imageUrl ? (
                                <img
                                    src={user.imageUrl}
                                    alt="Avatar de usuario"
                                    className="w-10 h-10 rounded-full object-cover border-2 border-dark-border"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-bold text-lg border-2 border-dark-border">
                                    {user.nombre?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;