import { defineConfig } from 'vite';

// 개발용 설정 - 안정성 및 성능 최적화
export default defineConfig({
  root: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'premium-landing.html'
      }
    }
  },
  server: {
    host: true, // 외부 네트워크에서 접근 가능
    port: 5173,
    strictPort: false, // 포트가 사용 중이면 다른 포트 시도
    open: true,
    allowedHosts: ['0b49-128-134-230-184.ngrok-free.app'], // ngrok 호스트 허용
    hmr: {
      overlay: true,
      port: 24678 // HMR 전용 포트 설정
    },
    fs: {
      strict: true
    },
    watch: {
      usePolling: false, // 파일 시스템 이벤트 사용 (macOS 최적화)
      interval: 100
    }
  },
  optimizeDeps: {
    force: false, // 캐시 강제 재생성 비활성화 (안정성)
    esbuildOptions: {
      target: 'es2020'
    }
  },
  esbuild: {
    target: 'es2020'
  },
  clearScreen: false, // 콘솔 화면 지우기 비활성화 (디버깅용)
  logLevel: 'info' // 상세 로그 출력
});