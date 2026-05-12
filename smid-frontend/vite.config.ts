import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Forzamos el puerto 3000 para cumplir con el CORS del API Gateway (Spring Boot)
    port: 3000,
    strictPort: true, // Si el 3000 está ocupado por otra app, Vite arrojará error en vez de saltar al 3001
    host: true, // Permite que la app sea accesible en tu red local (útil para probar en el celular)
  }
})