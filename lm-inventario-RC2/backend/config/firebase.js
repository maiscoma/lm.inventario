// backend/config/firebase.js

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // --- AÑADIR ESTA LÍNEA ---
  storageBucket: "lm-inventario.firebasestorage.app" // Reemplaza esto con el nombre de tu bucket
});

const db = admin.firestore();
// --- AÑADIR ESTA LÍNEA ---
const bucket = admin.storage().bucket();
const auth = admin.auth();

console.log("🔥 Conexión con Firebase (SDK de Admin) establecida correctamente.");

// --- MODIFICAR EXPORTS ---
module.exports = { db, bucket, auth };