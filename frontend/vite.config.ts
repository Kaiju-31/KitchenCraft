import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [react(),tailwindcss()],
    server: {
        host: true, // Enable access from container
        port: 5173,
        watch: {
            usePolling: true, // Enable polling for file changes in containers
        },
        proxy: {
            '/api': {
                // Auto-detect environment: Docker uses 'backend' hostname, local uses 'localhost'
                target: process.env.DOCKER_ENV ? 'http://backend:8080' : 'http://localhost:8080',
                changeOrigin: true,
            }
        }
    }
})
