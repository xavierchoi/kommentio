import { defineConfig } from 'vite';

// 개발용 설정
export default defineConfig({
  root: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html'
      }
    }
  },
  server: {
    host: '0.0.0.0', // 모든 네트워크 인터페이스에서 접근 허용
    port: 3000,
    open: true
  }
});