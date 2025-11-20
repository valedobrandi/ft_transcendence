import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    server: {
        host: '0.0.0.0',
        strictPort: true,
        port: 5173,
        hmr: { host: 'localhost' },
    },
    plugins: [
        tailwindcss(),
    ],
    base: '/',
})