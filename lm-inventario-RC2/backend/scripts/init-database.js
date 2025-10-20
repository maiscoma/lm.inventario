#!/usr/bin/env node

/**
 * Script para inicializar la base de datos
 * Ejecutar con: node scripts/init-database.js
 */

const { initializeDatabase } = require("../config/database")

const main = async () => {
  console.log("🚀 Iniciando script de inicialización de base de datos...")

  try {
    const success = await initializeDatabase()

    if (success) {
      console.log("✅ Base de datos inicializada exitosamente")
      process.exit(0)
    } else {
      console.error("❌ Error al inicializar la base de datos")
      process.exit(1)
    }
  } catch (error) {
    console.error("❌ Error crítico:", error)
    process.exit(1)
  }
}

// Ejecutar script si es llamado directamente
if (require.main === module) {
  main()
}
