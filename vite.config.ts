import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  const base = process.env.BASE_PATH ?? '/';

  return {
    base,
    plugins: [
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'apple-touch-icon.png',
          'elephant.gif',
          'eier2min.png',
          'eier4min.png',
          'eier6min.png',
          'favicon.ico',
          'pwa-192.png',
          'pwa-512.png',
        ],
        manifest: {
          name: 'Elephants Stompede',
          short_name: 'Elephants',
          description:
            '20 Elefanten werden zufällig platziert und verschwinden nacheinander.',
          theme_color: '#0f172a',
          background_color: '#0f172a',
          display: 'standalone',
          start_url: base,
          icons: [
            {
              src: 'pwa-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
      }),
    ],
  };
});
