import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react(),
    viteCompression({ algorithm: 'gzip' }),
    viteCompression({ algorithm: 'brotliCompress' }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/react-router')) return 'vendor';
          if (id.includes('node_modules/lucide') || id.includes('node_modules/framer-motion')) return 'ui';
          if (id.includes('node_modules/@tiptap')) return 'editor';
          if (id.includes('node_modules/axios') || id.includes('node_modules/dompurify') || id.includes('node_modules/clsx') || id.includes('node_modules/tailwind-merge')) return 'utils';
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
