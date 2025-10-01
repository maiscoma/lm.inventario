// frontend/src/firebase-config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // ✨ 1. IMPORTA getFirestore

// Tus credenciales de configuración de la app web de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD4sRpAET8pB83hL72Pml3JM974SOk-7V0",
    authDomain: "lm-inventario.firebaseapp.com",
    projectId: "lm-inventario",
    storageBucket: "lm-inventario.firebasestorage.app",
    messagingSenderId: "1050427576195",
    appId: "1:1050427576195:web:353a5489343b6f77dfb0b6",
    measurementId: "G-QM1MSHFYCH"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar el servicio de autenticación
export const auth = getAuth(app);
export const db = getFirestore(app);