import path from "path"
import fs from "fs"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Ensure PWA static icons are synchronized to public directory
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
          drop: ['console', 'debugger'] as const,
        },
      }
    : {}),
  build: {
    sourcemap: false, // Prevents exposing raw source code structure in production
  },
}))
