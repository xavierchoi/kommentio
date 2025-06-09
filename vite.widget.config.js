import { defineConfig } from 'vite';

// 위젯 배포용 설정 - 단일 스크립트 파일로 번들링
export default defineConfig({
  build: {
    outDir: 'dist/widget',
    lib: {
      entry: 'src/kommentio.js',
      name: 'Kommentio',
      fileName: 'kommentio',
      formats: ['iife'] // 브라우저에서 직접 로드 가능한 형태
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true, // 모든 의존성을 하나의 파일에 포함
        manualChunks: undefined
      },
      external: [] // 모든 의존성을 번들에 포함
    },
    minify: 'terser', // 압축 최적화
    terserOptions: {
      compress: {
        drop_console: true, // 프로덕션에서 console.log 제거
        drop_debugger: true
      }
    }
  }
});