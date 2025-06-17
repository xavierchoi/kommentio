import { defineConfig } from 'vite';

// 개발용 설정 - 안정성 및 성능 최적화
export default defineConfig({
  root: process.env.CI ? '.' : './docs', // CI에서는 프로젝트 루트, 로컬에서는 docs
  build: {
    outDir: process.env.CI ? './dist' : '../dist', // CI용 경로 조정
    rollupOptions: {
      input: process.env.CI ? 'docs/index.html' : 'index.html' // CI용 경로 조정
    }
  },
  server: {
    host: '0.0.0.0', // 모든 인터페이스에서 접근 가능
    port: 3000, // 기본 포트를 3000으로 변경
    strictPort: false, // 포트가 사용 중이면 다른 포트 시도
    open: false, // 자동 브라우저 열기 비활성화
    allowedHosts: ['0b49-128-134-230-184.ngrok-free.app'], // ngrok 호스트 허용
    hmr: {
      overlay: true,
      port: 24678 // HMR 전용 포트 설정
    },
    fs: {
      strict: false, // 파일 시스템 접근 제한 해제
      allow: ['..'] // 상위 디렉토리 접근 허용
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