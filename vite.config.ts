import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  const base = process.env.BASE_PATH ?? '/';

  return {
    base,
    plugins: [
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['elephant.gif', 'favicon.ico'],
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
              src: 'favicon.ico',
              sizes: '64x64 32x32 24x24 16x16',
              type: 'image/x-icon',
            },
          ],
        },
      }),
    ],
  };
});
