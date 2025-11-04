import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    server: {
        host: true,
        strictPort: true,
        port: 5173,
    },
    plugins: [
        tailwindcss(),
    ],
    base: './',
})