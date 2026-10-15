import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

const uploadsDir = path.resolve(__dirname, 'uploads');

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'uploads-gallery-api',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (!req.url || !req.url.startsWith('/api/gallery')) {
              next();
              return;
            }

            try {
              const files = fs
                .readdirSync(uploadsDir, { withFileTypes: true })
                .filter((entry) => entry.isFile())
                .map((entry) => entry.name)
                .filter((name) => /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(name))
                .sort();

              const gallery = files.slice(0, 12).map((fileName) => ({
                title: fileName.replace(/\.[^/.]+$/, '') || 'Uploaded Memory',
                desc: 'Your uploaded memory.',
                src: `/uploads/${fileName}`,
              }));

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(gallery));
            } catch (error) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify([]));
            }
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
