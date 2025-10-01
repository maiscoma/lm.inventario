import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from 'path' 

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Le decimos a Vite que el atajo '@' apunta a la carpeta raíz del proyecto
      '@': path.resolve(__dirname, '..'), 
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
})
