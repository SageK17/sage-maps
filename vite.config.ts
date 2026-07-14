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
})
