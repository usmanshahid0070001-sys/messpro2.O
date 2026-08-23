import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
