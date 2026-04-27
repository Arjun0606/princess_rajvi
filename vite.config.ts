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
        // Activate the new SW immediately on update so users see fresh deploys
        // without an extra reload step.
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        // Don't precache the bg PNGs (5MB) — let them load on demand via
        // the network and cache as runtime.
        globPatterns: ['**/*.{js,css,html,svg,webmanifest}'],
        runtimeCaching: [
          {
            urlPattern: /\/art\/.*\.png$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'art-images',
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
