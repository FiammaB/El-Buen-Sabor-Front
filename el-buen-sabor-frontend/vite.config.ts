import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    allowedHosts: ['669c-190-114-210-198.ngrok-free.app'],
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Cambia el puerto si tu backend está en otro lado
        changeOrigin: true,
        secure: false,
      },
    },
    https: {
      key: fs.readFileSync('localhost-key.pem'),
      cert: fs.readFileSync('localhost.pem')
    }
  },
})