// frontend/src/components/Sidebar.jsx

"use client";

import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSettings } from "../contexts/SettingsContext";
import {
  Home, Package, BarChart3, LogOut, X, ChevronDown, Shield,
} from "lucide-react";
import toast from "react-hot-toast";
import clsx from "clsx";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleMenu = (menuKey) => {
    setExpandedMenus(prevExpanded => ({
      ...Object.keys(prevExpanded).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
      [menuKey]: !prevExpanded[menuKey],
    }));
  };

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
      key: "reports", label: "Reportes", icon: BarChart3, roles: ["administrador", "operador"],
      submenu: [
        { key: "stock-alerts", label: "Alertas de Stock", path: "/reportes/alertas", roles: ["administrador", "operador"] },
        { key: "inventory-report", label: "Valorización", path: "/reportes/valorizacion", roles: ["administrador"] },
        // --- CAMBIO: Se añade 'operador' para que pueda ver el reporte de movimientos ---
        { key: "movements-report", label: "Movimientos", path: "/reportes/movimientos", roles: ["administrador", "operador"] },
      ],
    },
    {
      key: "administration", label: "Administración", icon: Shield, roles: ["administrador", "operador"],
      submenu: [
        // NOTA: Estos sub-menús seguirán ocultos para el operador porque su rol no está incluido.
        // Esto es correcto. Si en el futuro añades una página "Mi Perfil", la agregarías aquí
        // con el rol de 'operador'.
        { key: "admin-panel", label: "Panel Principal", path: "/admin", roles: ["administrador"] },
        { key: "users", label: "Usuarios", path: "/admin/usuarios", roles: ["administrador"] },
        { key: "settings", label: "Configuración", path: "/admin/configuracion", roles: ["administrador"] },
        { key: "logs", label: "Logs del Sistema", path: "/admin/logs", roles: ["administrador"] },
        { key: "database", label: "Base de Datos", path: "/admin/base-de-datos", roles: ["administrador"] },
      ],
    },
  ];

  useEffect(() => {
    const parentMenu = menuItems.find(item => item.submenu?.some(sub => sub.path && location.pathname.startsWith(sub.path)));
    if (parentMenu) {
      setExpandedMenus({ [parentMenu.key]: true });
    } else {
      setExpandedMenus({});
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      toast.error("Error al cerrar sesión");
    }
  };

  const isActiveRoute = (path) => {
    if (!path) return false;
    if (path === "/admin" || path === "/dashboard") return location.pathname === path;
    return location.pathname.startsWith(path);
  };
  
  const filteredMenuItems = menuItems.filter((item) => user?.rol && item.roles.includes(user.rol));
  
  const MenuItem = ({ item, isSubmenu = false }) => {
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isExpanded = expandedMenus[item.key];
    const Icon = item.icon;
    const isParentActive = hasSubmenu && item.submenu.some(sub => isActiveRoute(sub.path));
    const isActive = item.path ? isActiveRoute(item.path) : isParentActive;
    const commonClasses = "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors group text-sm";
    const activeClasses = "text-primary bg-primary/10 font-semibold";
    const inactiveClasses = "text-text-secondary hover:text-text-primary hover:bg-dark-card";

    if (hasSubmenu) {
      const accessibleSubmenu = item.submenu.filter(subItem => subItem.roles.includes(user?.rol));
      if (accessibleSubmenu.length === 0) return null;
      
      const firstAccessiblePath = accessibleSubmenu[0]?.path;

      return (
        <div>
          <div
            className={`w-full flex items-center justify-between rounded-lg transition-colors group ${isParentActive ? "text-primary" : "text-text-secondary hover:text-text-primary hover:bg-dark-card"}`}
          >
            <Link to={firstAccessiblePath} className="flex-grow flex items-center gap-3 px-4 py-3">
              {Icon && <Icon size={20} className="flex-shrink-0" />}
              <span className="font-medium">{item.label}</span>
            </Link>
            
            <button
              onClick={(e) => { e.stopPropagation(); toggleMenu(item.key); }}
              className="p-2 mr-2 rounded-md hover:bg-dark-surface"
            >
              <ChevronDown size={16} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
            </button>
          </div>
          {isExpanded && (
            <div className="ml-4 mt-1 space-y-1 border-l border-dark-border pl-4">
              {accessibleSubmenu.map((subItem) => (
                <MenuItem key={subItem.key} item={subItem} isSubmenu={true} />
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link to={item.path} className={`${commonClasses} ${isActive ? activeClasses : inactiveClasses}`}>
        {Icon && <Icon size={isSubmenu ? 18 : 20} className="flex-shrink-0" />}
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      <div
        className={clsx(
          "fixed inset-0 bg-black/60 z-40",
          { "block": isOpen, "hidden": !isOpen }
        )}
        onClick={() => setIsOpen(false)}
      ></div>
      <div
        className={clsx(
          "fixed left-0 top-0 h-full w-64 bg-dark-surface border-r border-dark-border z-50 transition-transform duration-300",
          { "translate-x-0": isOpen, "-translate-x-full": !isOpen }
        )}
      >
        <div className="flex items-center justify-between p-4 h-16 border-b border-dark-border">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img src="/logo.png" alt={settings.companyName} className="w-8 h-8 object-contain" />
            <h2 className="text-lg font-bold gradient-text">{settings.companyName}</h2>
          </Link>
          <button onClick={() => setIsOpen(false)} className="p-2 rounded-lg hover:bg-dark-card transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="h-[calc(100vh-8rem)] overflow-y-auto">
          <nav key={location.pathname} className="p-4 space-y-2">
            {filteredMenuItems.map((item) => (
              <MenuItem key={item.key} item={item} />
            ))}
          </nav>
        </div>
        <div className="absolute bottom-0 w-full p-4 border-t border-dark-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-text-secondary hover:text-error hover:bg-error/10 rounded-lg transition-all duration-300"
          >
            <LogOut size={20} className="flex-shrink-0" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;