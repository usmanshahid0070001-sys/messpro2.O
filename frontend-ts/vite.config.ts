import path from "path"
import fs from "fs"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Ensure social preview og-image and PWA static icons are synchronized
const publicDir = path.resolve(import.meta.dirname, "./public");
const assetsDir = path.resolve(import.meta.dirname, "./src/assets");

['pwa-192x192.png', 'pwa-512x512.png'].forEach((file) => {
  const src = path.join(assetsDir, file);
  const dest = path.join(publicDir, file);
  if (fs.existsSync(src) && !fs.existsSync(dest)) {
    try {
      fs.copyFileSync(src, dest);
    } catch (_) {}
  }
});

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  ...(mode === 'production'
    ? {
        esbuild: {
          drop: ['console', 'debugger'],
        } as any,
      }
    : {}),
  build: {
    sourcemap: false, // Prevents exposing raw source code structure in production
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router-dom/')) {
              return 'vendor-react';
            }
            if (id.includes('/@reduxjs/toolkit/') || id.includes('/react-redux/') || id.includes('/zustand/')) {
              return 'vendor-state';
            }
            if (id.includes('/@tanstack/react-query/')) {
              return 'vendor-query';
            }
            if (id.includes('/lucide-react/')) {
              return 'vendor-icons';
            }
          }
        },
      },
    },
  },
}))
