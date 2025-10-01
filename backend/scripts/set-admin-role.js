// backend/scripts/set-admin-role.js

// Importamos solo lo que necesitamos: la instancia de 'auth' del Admin SDK.
const { auth } = require("../config/firebase");

// Tomamos el email del usuario como un argumento desde la línea de comandos.
const userEmail = process.argv[2];

if (!userEmail) {
    console.error("❌ Por favor, proporciona un email como argumento.");
    console.log("Uso: node scripts/set-admin-role.js tu-email@ejemplo.com");
    process.exit(1);
}

const setAdminRole = async () => {
    try {
        // 1. Buscamos al usuario en Firebase por su email.
        console.log(`Buscando usuario con email: ${userEmail}...`);
        const user = await auth.getUserByEmail(userEmail);

        // 2. Asignamos el 'custom claim' con el rol de administrador.
        // Esto sobreescribirá cualquier rol que tuviera antes.
        await auth.setCustomUserClaims(user.uid, { rol: "administrador" });

        console.log(`✅ ¡Éxito! El usuario ${user.email} (UID: ${user.uid}) ahora es administrador.`);
        process.exit(0);

    } catch (error) {
        console.error("❌ Error al asignar el rol de administrador:", error.message);
        process.exit(1);
    }
};

setAdminRole();