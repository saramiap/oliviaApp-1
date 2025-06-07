// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Redirige les requêtes commençant par /ask vers ton backend
      '/ask': {
        target: 'http://localhost:3000', // L'URL de ton serveur Express local
        changeOrigin: true, // Nécessaire pour les hôtes virtuels
        // secure: false, // Décommenter si ton backend est en HTTPS avec un certificat auto-signé
      }
    }
  }
})