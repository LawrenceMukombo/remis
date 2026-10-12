import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Prevents Windows root-level folder collisions (e.g. C:\dashboard) from intercepting SPA page routes
const spaRouteFallbackPlugin: Plugin = {
    name: 'spa-route-fallback',
    configureServer(server) {
        server.middlewares.use((req, res, next) => {
            const url = req.url?.split('?')[0] || ''
            // If request is an SPA route navigation (no file extension, not Vite internal/src)
            if (
                req.method === 'GET' &&
                !url.startsWith('/@') &&
                !url.startsWith('/src/') &&
                !url.startsWith('/node_modules/') &&
                !url.startsWith('/api') &&
                !url.includes('.')
            ) {
                req.url = '/index.html'
            }
            next()
        })
    }
}

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), spaRouteFallbackPlugin],
    server: {
        port: 3000
    }
})
