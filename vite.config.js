import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  preview: {
    allowedHosts: [
      'roomease-frontend-hfhn.onrender.com'
    ]
  }
})
