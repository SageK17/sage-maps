import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // '/' for local dev; the deploy build passes VITE_BASE=/sage-maps/
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  server: {
    port: 5183,
    host: true,
  },
  build: {
    // split the heavy vendors so the shell/splash paints before the map
    // engine parses, and so app-only changes don't bust the vendor cache
    rollupOptions: {
      output: {
        manualChunks: {
          maplibre: ['maplibre-gl'],
          react: ['react', 'react-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
})
