import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/react-router')) return 'vendor';
          if (id.includes('node_modules/lucide') || id.includes('node_modules/framer-motion')) return 'ui';
          if (id.includes('node_modules/@tiptap')) return 'editor';
          if (id.includes('node_modules/@clerk')) return 'clerk';
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})