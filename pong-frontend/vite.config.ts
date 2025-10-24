import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
	server: {
    host: true, // exposes to 0.0.0.0
    strictPort: true,
    port: 5173,
    allowedHosts: ['pong-frontend'], // or true to allow all
  },
  plugins: [
    tailwindcss(),
  ],
})