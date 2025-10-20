// frontend/src/pages/UsersPage.jsx

import { useState, useEffect } from "react";
import { userService } from "../services/userService";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import { Users, MoreVertical, Edit, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeMenu, setActiveMenu] = useState(null);
    const { user: currentUser } = useAuth();

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userService.getAll();
            if (response.success) {
                setUsers(response.data);
            }
        } catch (error) {
            toast.error("No se pudieron cargar los usuarios.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);
    
    // Formatear fecha
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("es-CL", {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    // Manejar acciones
    const handleUpdateRole = async (uid, newRole) => {
        const userToUpdate = users.find(u => u.uid === uid);
        if (window.confirm(`¿Cambiar el rol de "${userToUpdate.nombre}" a "${newRole}"?`)) {
            try {
                await userService.updateRole(uid, newRole);
                toast.success("Rol actualizado.");
                fetchUsers();
            } catch (error) {
                toast.error("Error al actualizar el rol.");
            }
        }
        setActiveMenu(null);
    };

    const handleUpdateStatus = async (uid, currentStatus) => {
        const userToUpdate = users.find(u => u.uid === uid);
        const action = currentStatus ? "deshabilitar" : "habilitar";
        if (window.confirm(`¿Estás seguro de que deseas ${action} a "${userToUpdate.nombre}"?`)) {
            try {
                await userService.updateStatus(uid, !currentStatus);
                toast.success(`Usuario ${action === 'deshabilitar' ? 'deshabilitado' : 'habilitado'}.`);
                fetchUsers();
            } catch (error) {
                toast.error("Error al cambiar el estado.");
            }
        }
        setActiveMenu(null);
    };

    const handleDeleteUser = async (uid) => {
        const userToDelete = users.find(u => u.uid === uid);
        if (window.confirm(`¡ACCIÓN IRREVERSIBLE!\n¿Eliminar permanentemente a "${userToDelete.nombre}"?`)) {
            try {
                await userService.delete(uid);
                toast.success("Usuario eliminado.");
                fetchUsers();
            } catch (error) {
                toast.error("Error al eliminar el usuario.");
            }
        }
        setActiveMenu(null);
    };


    if (loading) {
        return <LoadingSpinner text="Cargando usuarios..." />;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-text-primary">Gestión de Usuarios</h1>
            <div className="bg-dark-card border border-dark-border rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="text-xs uppercase bg-dark-surface text-text-secondary">
                        <tr>
                            <th className="px-6 py-3 text-left">Usuario</th>
                            <th className="px-6 py-3 text-left">Rol</th>
                            <th className="px-6 py-3 text-left">Estado</th>
                            <th className="px-6 py-3 text-left">Último Acceso</th>
                            <th className="px-6 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="text-text-secondary">
                        {users.map((user) => (
                            <tr key={user.uid} className="border-b border-dark-border hover:bg-dark-surface/50">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-text-primary">{user.nombre}</div>
                                    <div className="text-xs text-text-muted">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 capitalize">{user.rol}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.activo ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
                                        {user.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{formatDate(user.ultimoAcceso)}</td>
                                <td className="px-6 py-4 text-right relative">
                                    <button onClick={() => setActiveMenu(activeMenu === user.uid ? null : user.uid)} disabled={user.uid === currentUser.id}>
                                        <MoreVertical size={20} className={user.uid === currentUser.id ? "text-text-muted" : ""} />
                                    </button>
                                    {activeMenu === user.uid && (
                                        <div className="absolute right-8 top-10 w-48 bg-dark-surface border border-dark-border rounded-lg shadow-lg z-10">
                                            <button onClick={() => handleUpdateRole(user.uid, user.rol === 'administrador' ? 'operador' : 'administrador')} className="w-full text-left px-4 py-2 hover:bg-dark-card flex items-center gap-2">
                                                <Edit size={14} /> Cambiar a {user.rol === 'administrador' ? 'Operador' : 'Admin'}
                                            </button>
                                            <button onClick={() => handleUpdateStatus(user.uid, user.activo)} className="w-full text-left px-4 py-2 hover:bg-dark-card flex items-center gap-2">
                                                {user.activo ? <><ToggleLeft size={14} /> Deshabilitar</> : <><ToggleRight size={14} /> Habilitar</>}
                                            </button>
                                            <button onClick={() => handleDeleteUser(user.uid)} className="w-full text-left px-4 py-2 text-error hover:bg-error/10 flex items-center gap-2">
                                                <Trash2 size={14} /> Eliminar
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsersPage;