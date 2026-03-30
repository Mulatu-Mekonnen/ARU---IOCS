import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
    ],
    resolve: {
        alias: {
            '@': '/resources/js',
        },
    },
    server: {
        host: '127.0.0.1',
        port: 5173,
        strictPort: false,
        cors: true,
        hmr: {
            host: '127.0.0.1',
            port: 5173,
        },
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
    build: {
        manifest: true,
        rollupOptions: {
            input: {
                app: ['resources/css/app.css', 'resources/js/app.jsx'],
            },
        },
    },
});

