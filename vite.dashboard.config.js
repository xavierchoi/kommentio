import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 관리 대시보드용 Vite 설정
export default defineConfig({
  plugins: [react()],
  root: './src/dashboard',
  build: {
    outDir: '../../dist/dashboard',
    emptyOutDir: true,
    rollupOptions: {
      input: './src/dashboard/index.html'
    }
  },
  server: {
    port: 3001,
    open: true
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});