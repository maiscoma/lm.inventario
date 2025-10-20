// backend/routes/upload.js

const express = require("express");
const multer = require("multer");
const { bucket } = require("../config/firebase");
const { authenticate } = require("../middleware/auth");
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Configura multer para manejar la subida de archivos en memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // Límite de 5 MB
  },
});

router.post("/", authenticate, upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No se ha subido ningún archivo." });
  }

  try {
    const blob = bucket.file(`products/${uuidv4()}-${req.file.originalname}`);
    
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    blobStream.on("error", (err) => {
      console.error(err);
      res.status(500).json({ success: false, message: "Error al subir la imagen." });
    });

    blobStream.on("finish", async () => {
      // Hacer el archivo público
      await blob.makePublic();

      // Obtener la URL pública
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      
      res.status(200).json({
        success: true,
        message: "Imagen subida exitosamente",
        data: {
          url: publicUrl,
        },
      });
    });

    blobStream.end(req.file.buffer);

  } catch (error) {
    console.error("Error en la subida de archivo:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor." });
  }
});

module.exports = router;