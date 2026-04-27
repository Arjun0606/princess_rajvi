import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'art/*.png'],
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,svg,webmanifest}'],
        runtimeCaching: [
          {
            // NetworkFirst so fresh PNG re-deploys always replace the cache.
            // Falls back to cache only if the network fails. New cache name
            // (-v3) so this fully replaces the old CacheFirst cache.
            urlPattern: /\/art\/.*\.png$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'art-images-v3',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      manifest: {
        name: 'Princess Rajvi',
        short_name: 'Rajvi',
        description: 'her royal highness needs attention',
        theme_color: '#ffb6d1',
        background_color: '#ffe0ec',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
});
