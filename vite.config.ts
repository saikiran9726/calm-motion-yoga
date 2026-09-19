import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

import { devApiMiddleware } from './api/_lib/devMiddleware';

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
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'masked-icon.svg'],
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
            src: '/pwa-192x192.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: '/pwa-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2,png,ico,json}']
      }
    })
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
