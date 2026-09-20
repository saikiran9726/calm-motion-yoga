import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

import { devApiMiddleware } from './api/_lib/devMiddleware.js';

function localApiPlugin() {
  return {
    name: 'local-api-plugin',
    configureServer(server: any) {
      server.middlewares.use(devApiMiddleware());
    },
    configurePreviewServer(server: any) {
      server.middlewares.use(devApiMiddleware());
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    localApiPlugin(),
    react(),
    basicSsl(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Calm Motion - Yoga & Physiotherapy',
        short_name: 'Calm Motion',
        description: 'Offline-first Yoga & Physiotherapy with live motion coaching',
        theme_color: '#123B35',
        background_color: '#F7F8F5',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2,woff,png,ico,json,wasm,task}'],
        globIgnores: [
          '**/mediapipe/wasm/*nosimd*',
          '**/mediapipe/wasm/*module*',
        ],
        maximumFileSizeToCacheInBytes: 25 * 1024 * 1024,
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/mediapipe/wasm/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'mediapipe-wasm-fallback',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 5173,
    https: true,
  },
});
