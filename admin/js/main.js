// Kommentio Admin Dashboard - Main Application

class AdminApp {
  constructor() {
    this.router = null;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) {
      return;
    }

    try {
      console.log('Kommentio Admin Dashboard 초기화 중...');

      // DOM 준비 확인
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.init());
        return;
      }

      // API 서비스 초기화
      await this.initializeAPIService();

      // 라우터 초기화
      this.router = new Router();
      window.router = this.router;

      // 전역 페이지 인스턴스 설정 (템플릿에서 사용하기 위해)
      window.dashboardPage = this.router.pages.get('dashboard');
      window.sitesPage = this.router.pages.get('sites');
      window.commentsPage = this.router.pages.get('comments');
      window.spamFilterPage = this.router.pages.get('spam-filter');
      window.analyticsPage = this.router.pages.get('analytics');
      window.usersPage = this.router.pages.get('users');
      window.integrationsPage = this.router.pages.get('integrations');

      // 전역 에러 핸들러 설정
      this.setupErrorHandlers();

      // 알림 시스템 스타일 추가
      this.addNotificationStyles();

      // 연결 상태 표시
      this.showConnectionStatus();

      // 사이드바 토글 기능 초기화
      this.initSidebarToggle();

      this.initialized = true;
      console.log('Kommentio Admin Dashboard 초기화 완료');

      // 초기 페이지 강제 렌더링 (라우터 초기화 후 즉시)
      console.log('초기 대시보드 페이지 렌더링 시작...');
      const dashboardPage = this.router.pages.get('dashboard');
      if (dashboardPage) {
        await dashboardPage.render();
        console.log('초기 대시보드 페이지 렌더링 완료');
      }

    } catch (error) {
      console.error('애플리케이션 초기화 실패:', error);
      this.showInitializationError();
    }
  }

  async initializeAPIService() {
    // API 서비스 인스턴스 생성 및 초기화
    window.apiService = new AdminAPIService();
    
    // 설정 - 실제 환경에서는 환경변수나 설정 파일에서 가져와야 함
    const config = {
      supabaseUrl: '', // 실제 Supabase URL
      supabaseKey: '', // 실제 Supabase Key
      demoMode: true // 현재는 데모 모드로 설정
    };

    await window.apiService.init(config);
    
    console.log('API 서비스 초기화 완료:', window.apiService.getConnectionStatus());
  }

  showConnectionStatus() {
    const status = window.apiService.getConnectionStatus();
    const statusText = status.demoMode ? '데모 모드' : '실제 API 연결';
    const statusClass = status.demoMode ? 'warning' : 'success';
    
    Utils.showNotification(`${statusText}로 실행 중입니다.`, statusClass);
  }

  setupErrorHandlers() {
    // 전역 JavaScript 에러 핸들러
    Utils.on(window, 'error', (event) => {
      console.error('JavaScript 오류:', event.error);
      
      // Chart.js 관련 오류는 별도 처리
      if (event.error && event.error.message && event.error.message.includes('Chart')) {
        Utils.showNotification('차트 라이브러리 오류가 발생했습니다. 페이지를 새로고침해주세요.', 'warning');
        return;
      }
      
      Utils.showNotification('예상치 못한 오류가 발생했습니다.', 'error');
    });

    // Promise rejection 핸들러
    Utils.on(window, 'unhandledrejection', (event) => {
      console.error('처리되지 않은 Promise 거부:', event.reason);
      
      // 네트워크 관련 오류 구분
      if (event.reason && event.reason.message) {
        if (event.reason.message.includes('fetch') || event.reason.message.includes('network')) {
          Utils.showNotification('네트워크 연결을 확인해주세요.', 'error');
        } else if (event.reason.message.includes('script')) {
          Utils.showNotification('외부 리소스 로드에 실패했습니다.', 'warning');
        } else {
          Utils.showNotification('데이터 처리 중 오류가 발생했습니다.', 'error');
        }
      } else {
        Utils.showNotification('네트워크 요청 중 오류가 발생했습니다.', 'error');
      }
      
      // 오류를 방지하여 계속 실행되도록 함
      event.preventDefault();
    });
  }

  addNotificationStyles() {
    const styles = `
      .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 16px;
        border-radius: 8px;
        color: white;
        font-size: 14px;
        font-weight: 500;
        max-width: 400px;
        z-index: 9999;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      
      .notification.show {
        transform: translateX(0);
      }
      
      .notification-success {
        background: #10b981;
      }
      
      .notification-error {
        background: #ef4444;
      }
      
      .notification-warning {
        background: #f59e0b;
      }
      
      .notification-info {
        background: #3b82f6;
      }

      .table {
        width: 100%;
        border-collapse: collapse;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
      
      .table th {
        background: #f9fafb;
        padding: 12px 16px;
        text-align: left;
        font-weight: 600;
        color: #374151;
        border-bottom: 1px solid #e5e7eb;
      }
      
      .table td {
        padding: 12px 16px;
        border-bottom: 1px solid #f3f4f6;
      }
      
      .table tbody tr:hover {
        background: #f9fafb;
      }

      .py-12 {
        padding-top: 3rem;
        padding-bottom: 3rem;
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  showInitializationError() {
    const errorHtml = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        text-align: center;
        max-width: 400px;
      ">
        <div style="color: #ef4444; font-size: 3rem; margin-bottom: 1rem;">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h2 style="color: #1f2937; margin-bottom: 1rem;">초기화 실패</h2>
        <p style="color: #6b7280; margin-bottom: 1.5rem;">
          대시보드를 초기화하는 중 오류가 발생했습니다.
        </p>
        <button 
          onclick="location.reload()" 
          style="
            background: #3b82f6;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            cursor: pointer;
          "
        >
          페이지 새로고침
        </button>
      </div>
    `;

    document.body.innerHTML = errorHtml;
  }

  initSidebarToggle() {
    const toggleBtn = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (!toggleBtn || !sidebar || !mainContent) {
      console.warn('사이드바 토글 요소를 찾을 수 없습니다.');
      return;
    }

    // 모바일/태블릿에서만 동작 (1024px 이하)
    const isMobile = () => window.innerWidth <= 1024;

    // 3단계 상태 관리: 'hidden', 'collapsed', 'expanded'
    let currentState = 'collapsed'; // 기본값: 접힌 상태

    // 사이드바 상태 설정
    const setSidebarState = (state) => {
      console.log('사이드바 상태 변경:', state);
      
      // 모든 상태 클래스 제거
      sidebar.classList.remove('hidden', 'collapsed', 'expanded');
      
      // 새 상태 클래스 추가
      sidebar.classList.add(state);
      currentState = state;
      
      console.log('사이드바 클래스:', sidebar.className);
      
      this.updateToggleButton(state);
      
      // localStorage에 저장 (모바일만)
      if (isMobile()) {
        localStorage.setItem('sidebar-state-mobile', state);
      }
    };

    // 초기 상태 설정
    const updateSidebarState = () => {
      if (isMobile()) {
        // 모바일: localStorage에서 상태 복원 (기본값: collapsed)
        const savedState = localStorage.getItem('sidebar-state-mobile') || 'collapsed';
        console.log('모바일 모드: 사이드바 상태 설정 -', savedState);
        setSidebarState(savedState);
      } else {
        // 데스크톱: 항상 펼친 상태
        console.log('데스크톱 모드: 사이드바 초기화');
        sidebar.classList.remove('hidden', 'collapsed', 'expanded');
        localStorage.removeItem('sidebar-state-mobile');
      }
    };

    // 버튼 아이콘 업데이트
    this.updateToggleButton = (state) => {
      const icon = toggleBtn.querySelector('i');
      
      switch(state) {
        case 'hidden':
        case 'collapsed':
          icon.className = 'fas fa-angles-right'; // 펼치기
          break;
        case 'expanded':
          icon.className = 'fas fa-angles-left'; // 접기
          break;
      }
    };

    // 다음 상태로 전환하는 함수
    const getNextState = (current) => {
      switch(current) {
        case 'collapsed':
          return 'expanded';
        case 'expanded':
          return 'collapsed';
        default:
          return 'collapsed';
      }
    };

    // 토글 버튼 클릭 이벤트
    toggleBtn.addEventListener('click', () => {
      if (!isMobile()) return; // 데스크톱에서는 동작하지 않음
      
      const nextState = getNextState(currentState);
      setSidebarState(nextState);
    });

    // 윈도우 리사이즈 이벤트
    window.addEventListener('resize', updateSidebarState);
    
    // 초기 상태 설정
    updateSidebarState();

    console.log('사이드바 오버레이 토글 기능이 초기화되었습니다.');
  }
}

// 애플리케이션 시작
const app = new AdminApp();
app.init();