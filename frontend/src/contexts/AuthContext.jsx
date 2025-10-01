// frontend/src/contexts/AuthContext.jsx

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { 
  getAuth, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from "firebase/auth";
import { auth as firebaseAuth } from "../firebase-config"; // Importamos la instancia de auth
import { apiClient } from "../services/authService";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => setError(null), []);

  const login = useCallback(async (email, password) => {
    try {
      clearError();
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      // El onAuthStateChanged se encargará de actualizar el estado
      toast.success(`¡Bienvenido de vuelta!`);
      return { success: true };
    } catch (err) {
      const errorMessage = "Credenciales incorrectas. Por favor, verifica tu email y contraseña.";
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [clearError]);
  
  // ✨ NUEVA FUNCIÓN DE REGISTRO ✨
  const register = useCallback(async (nombre, email, password) => {
    try {
        clearError();
        const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        
        // Actualizar perfil del usuario en Firebase
        await updateProfile(userCredential.user, { displayName: nombre });

        // Obtener el token de ID para autenticar con nuestro backend
        const token = await userCredential.user.getIdToken(true);
        apiClient.defaults.headers.Authorization = `Bearer ${token}`;
        
        // Llamar al backend para asignar el rol de 'operador'
        await apiClient.post("/auth/set-initial-role", { rol: "operador" });

        // Forzar la recarga del token para que incluya el nuevo rol (custom claim)
        await userCredential.user.getIdToken(true);

        toast.success("¡Registro exitoso! Ya puedes iniciar sesión.");
        return { success: true };
    } catch(err) {
        const errorMessage = "No se pudo completar el registro. El correo ya podría estar en uso.";
        setError(errorMessage);
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
    }
  }, [clearError]);

  const logout = useCallback(async () => {
    try {
      await signOut(firebaseAuth);
      // El onAuthStateChanged se encargará de limpiar el estado
      toast.success("Sesión cerrada correctamente");
    } catch (err) {
      toast.error("Error al cerrar sesión.");
    }
  }, []);

  useEffect(() => {
    // Este es el listener principal que mantiene el estado de auth sincronizado
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      setIsLoading(true);
      if (firebaseUser) {
        // Usuario está logueado
        const token = await firebaseUser.getIdToken();
        const idTokenResult = await firebaseUser.getIdTokenResult();
        
        // Guardamos el token para las llamadas a la API
        localStorage.setItem("token", token);
        apiClient.defaults.headers.Authorization = `Bearer ${token}`;

        // Creamos nuestro objeto de usuario con el rol de los custom claims
        const appUser = {
          id: firebaseUser.uid,
          nombre: firebaseUser.displayName || firebaseUser.email,
          email: firebaseUser.email,
          rol: idTokenResult.claims.rol || 'operador'
        };
        
        setUser(appUser);
        localStorage.setItem("user", JSON.stringify(appUser));
      } else {
        // Usuario no está logueado
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        delete apiClient.defaults.headers.Authorization;
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const hasRole = useCallback((requiredRole) => user?.rol === requiredRole, [user]);
  const isAdmin = useCallback(() => hasRole("administrador"), [hasRole]);
  const isOperator = useCallback(() => hasRole("operador"), [hasRole]);

  const contextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    register, // ✨ Exportar nueva función
    hasRole,
    isAdmin,
    isOperator,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};