import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from "url"

// https://vite.dev/config/
export default defineConfig({
    server: {
        port: 3000,
        strictPort: true,
    },
    resolve: {
        alias: [
            { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) }
        ]
    },
    plugins: [
        react(),
    ]
});