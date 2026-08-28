import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite dev server proxies /api -> Express backend (port 5000)
// so the React SPA can call relative "/api/..." URLs with no CORS issues.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
})
