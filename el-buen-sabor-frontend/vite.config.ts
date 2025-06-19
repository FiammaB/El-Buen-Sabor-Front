import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
<<<<<<< HEAD

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
=======
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),    
    tailwindcss(),
  ],
  server: {
    allowedHosts: ['669c-190-114-210-198.ngrok-free.app'],
    host: true
  }
>>>>>>> login-con-roles
})
