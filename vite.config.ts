import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression'
import path from 'path'

export default defineConfig({
  // Serve from the domain root by default. To host under a sub-directory
  // (e.g. https://uniqletts.com/new/), build with:
  //   VITE_BASE_PATH=/new/ npm run build
  // The router picks the same value up via import.meta.env.BASE_URL.
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    react(),
    compression({ algorithm: 'brotliCompress', ext: '.br' }),
    compression({ algorithm: 'gzip', ext: '.gz' }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['leaflet', 'react-leaflet'],
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          // NB: do not manually chunk `sanity` / `@sanity/vision` — that forces
          // the 1.3 MB Studio bundle to preload on every page. Left to Vite it
          // stays a dynamic chunk that only loads on /admin.
        },
      },
    },
  },
})
