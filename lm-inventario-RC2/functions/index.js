// functions/index.js

// ✨ CORRECCIÓN 1: Importar desde las nuevas rutas v2
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const {initializeApp} = require("firebase-admin/app");
const {getAuth} = require("firebase-admin/auth");
const sgMail = require("@sendgrid/mail");
require("dotenv").config();

// ✨ CORRECCIÓN 2: Inicializar de la forma moderna
initializeApp();

sgMail.setApiKey(process.env.SENDGRID_KEY);

// ✨ CORRECCIÓN 3: Nueva sintaxis para definir la función
exports.sendEmailNotification =
onDocumentCreated("notifications/{notificationId}", async (event) => {
  // El snapshot de los datos ahora está en event.data
  const snapshot = event.data;
  if (!snapshot) {
    console.log("No hay datos asociados al evento.");
    return;
  }
  const notificationData = snapshot.data();
  const userId = notificationData.userId;
  try {
    const userRecord = await getAuth().getUser(userId);
    const userEmail = userRecord.email;
    const userName = userRecord.displayName || userEmail;

    if (!userEmail) {
      console.log(`Usuario ${userId} no tiene email.`);
      return;
    }

    const msg = {
      to: userEmail,
      from: "mcornejom@lmlaborsoftspa.cl", // ¡Usa tu email verificado!
      subject: `🔔 Nueva Alerta: ${notificationData.type}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2>Hola ${userName},</h2>
          <p>
            Tienes una nueva notificación en el Sistema de Inventario:
          </p>
          <div
            style="
              background-color: #f4f4f4;
              border-left: 4px solid #00d4ff;
              padding: 15px; margin: 20px 0;
            "
          >
            <p style="margin: 0; font-size: 16px;">
              <strong>${notificationData.message}</strong>
            </p>
          </div>
          <p>
            Puedes acceder a la plataforma para ver más detalles.
          </p>
          <br>
          <p style="font-size: 12px; color: #777;">
            Este es un correo automático, no respondas a este mensaje.
          </p>
        </div>
      `,
    };

    await sgMail.send(msg);
    console.log(`Correo enviado exitosamente a ${userEmail}`);
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    if (error.response) {
      console.error(error.response.body);
    }
  }
});
