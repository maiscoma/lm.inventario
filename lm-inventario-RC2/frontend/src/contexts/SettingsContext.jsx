// frontend/src/contexts/SettingsContext.jsx

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { settingsService } from '../services/settingsService';
import { useAuth } from './AuthContext'; // <-- 1. Importamos el hook de autenticación

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    const { isAuthenticated } = useAuth(); // <-- 2. Obtenemos el estado de autenticación
    const [settings, setSettings] = useState({
        companyName: "LM Labor Soft",
        currency: "CLP"
    });
    const [loading, setLoading] = useState(true);

    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            const response = await settingsService.getGeneralParameters();
            if (response.success) {
                setSettings(response.data);
            }
        } catch (error) {
            console.error("Error al cargar la configuración del sistema:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // --- CORRECCIÓN CLAVE ---
    // 3. Solo ejecutamos la carga de datos si el usuario está autenticado.
    useEffect(() => {
        if (isAuthenticated) {
            fetchSettings();
        } else {
            // Si no está autenticado, simplemente dejamos de cargar.
            setLoading(false);
        }
    }, [isAuthenticated, fetchSettings]); // Se ejecuta cuando el estado de autenticación cambia.

    const updateSettings = (newSettings) => {
        setSettings(newSettings);
    };

    const value = {
        settings,
        loading,
        updateSettings,
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};