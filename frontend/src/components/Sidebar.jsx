// frontend/src/components/Sidebar.jsx

"use client"

import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import {
  Home,
  Package,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Shield,
  Activity,
  Database,
} from "lucide-react"
import toast from "react-hot-toast"

const Sidebar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState({})

  useEffect(() => {
    if (location.pathname.startsWith("/admin") || location.pathname.startsWith("/reportes") || location.pathname.startsWith("/movimientos")) {
      const parentMenu = menuItems.find(item => item.submenu?.some(sub => location.pathname.startsWith(sub.path)));
      if (parentMenu) {
        setExpandedMenus((prev) => ({ ...prev, [parentMenu.key]: true }));
      }
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/login")
    } catch (error) {
      toast.error("Error al cerrar sesión")
    }
  }

  const toggleMenu = (menuKey) => {
    // ✨ INICIO DE LA MODIFICACIÓN ✨
    // Esta función ahora cerrará otros menús abiertos.
    setExpandedMenus((prev) => ({
      // Primero, reseteamos todos los menús a 'false'
      ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
      // Luego, abrimos (o cerramos) el menú actual.
      [menuKey]: !prev[menuKey],
    }));
    // ✨ FIN DE LA MODIFICACIÓN ✨
  };

  const isActiveRoute = (path) => {
    if (path === "/admin" || path === "/dashboard") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  }

  // Estructura del menú
  const menuItems = [
    { key: "dashboard", label: "Dashboard", icon: Home, path: "/dashboard", roles: ["administrador", "operador"] },
    {
      key: "inventory", label: "Inventario", icon: Package, roles: ["administrador", "operador"],
      submenu: [
        { key: "products", label: "Productos", path: "/products", roles: ["administrador", "operador"] },
        { key: "movements", label: "Movimientos", path: "/movimientos", roles: ["administrador", "operador"] },
      ],
    },
    {
      key: "reports", label: "Reportes", icon: BarChart3, roles: ["administrador"],
      submenu: [
        { key: "stock-alerts", label: "Alertas de Stock", path: "/reportes/alertas", roles: ["administrador"] },
        { key: "inventory-report", label: "Valorización", path: "/reportes/valorizacion", roles: ["administrador"] },
        { key: "movements-report", label: "Movimientos", path: "/reportes/movimientos", roles: ["administrador"] },
      ],
    },
    {
      key: "administration", label: "Administración", icon: Shield, roles: ["administrador"],
      submenu: [
        { key: "admin-panel", label: "Panel Principal", path: "/admin", roles: ["administrador"] },
        { key: "users", label: "Usuarios", path: "/admin/usuarios", roles: ["administrador"] },
        { key: "settings", label: "Configuración", path: "/admin/configuracion", roles: ["administrador"] },
        { key: "logs", label: "Logs del Sistema", path: "/admin/logs", roles: ["administrador"] },
        { key: "database", label: "Base de Datos", path: "/admin/base-de-datos", roles: ["administrador"] },
      ],
    },
  ]

  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(user?.rol));

  // --- ✨ COMPONENTE MenuItem CORREGIDO ---
  const MenuItem = ({ item, isSubmenu = false }) => {
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isExpanded = expandedMenus[item.key];
    const Icon = item.icon;

    const isParentActive = hasSubmenu && item.submenu.some(sub => isActiveRoute(sub.path));
    const isActive = item.path ? isActiveRoute(item.path) : isParentActive;

    if (hasSubmenu) {
      return (
        <div>
          <button
            onClick={() => toggleMenu(item.key)}
            className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-lg transition-colors group ${isActive
                ? "text-primary"
                : "text-text-secondary hover:text-text-primary hover:bg-dark-card"
              }`}
          >
            <div className="flex items-center gap-3">
              {Icon && <Icon size={20} className="flex-shrink-0" />}
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </div>
            {!isCollapsed && <ChevronDown size={16} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />}
          </button>

          {!isCollapsed && isExpanded && (
            <div className="ml-4 mt-1 space-y-1 border-l border-dark-border pl-4">
              {item.submenu
                .filter((subItem) => subItem.roles.includes(user?.rol))
                .map((subItem) => (
                  <MenuItem key={subItem.key} item={subItem} isSubmenu={true} />
                ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        to={item.path}
        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors group text-sm ${isActive
            ? "text-primary bg-primary/10 font-semibold"
            : "text-text-secondary hover:text-text-primary hover:bg-dark-card"
          }`}
      >
        {Icon && <Icon size={isSubmenu ? 18 : 20} className="flex-shrink-0" />}
        {!isCollapsed && <span>{item.label}</span>}
      </Link>
    );
  };
  // --- ✨ FIN DE LA CORRECCIÓN ---

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-dark-surface border-r border-dark-border z-40 transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"
        }`}
    >
      <div className="flex items-center justify-between p-4 h-16 border-b border-dark-border">
        {!isCollapsed && (
          <Link to="/dashboard" className="flex items-center gap-2">
            <img src="/logo.png" alt="LM Labor Soft" className="w-8 h-8 object-contain" />
            <h2 className="text-lg font-bold gradient-text">LM Labor Soft</h2>
          </Link>
        )}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 rounded-lg hover:bg-dark-card transition-colors">
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      <div className="h-[calc(100vh-8rem)] overflow-y-auto">
        <nav className="p-4 space-y-2">
          {filteredMenuItems.map((item) => (
            <MenuItem key={item.key} item={item} />
          ))}
        </nav>
      </div>

      <div className="absolute bottom-0 w-full p-4 border-t border-dark-border">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-text-secondary hover:text-error hover:bg-error/10 rounded-lg transition-all duration-300">
          <LogOut size={20} className="flex-shrink-0" />
          {!isCollapsed && <span className="font-medium">Cerrar Sesión</span>}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;