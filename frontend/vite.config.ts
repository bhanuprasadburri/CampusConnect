import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8088',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  // Monaco Editor is large; pre-bundle it for fast dev-server startup.
  optimizeDeps: {
    include: ['monaco-editor'],
  },
});
