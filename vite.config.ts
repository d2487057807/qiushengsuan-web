import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/qiushengsuan/',

  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 3000,
    proxy: {
      '/qiushengsuan/api': {
        target: 'http://localhost:8181',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/qiushengsuan/, ''),
      },
      '/qiushengsuan/uploads': {
        target: 'http://localhost:8181',
        changeOrigin: true,
      },
    },
  },

  assetsInclude: ['**/*.svg', '**/*.csv'],
})
