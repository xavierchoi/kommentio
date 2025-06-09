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

    // 헤더 토글 버튼 추가 (모바일용)
    this.setupHeaderToggle(() => {
      if (!isMobile()) return;
      const nextState = getNextState(currentState);
      setSidebarState(nextState);
    });

    console.log('사이드바 오버레이 토글 기능이 초기화되었습니다.');
  }

  setupHeaderToggle(toggleFunction) {
    // 헤더에 클릭 이벤트 추가 (::before 가상 요소 클릭 감지)
    const header = document.querySelector('.header');
    if (!header) return;

    header.addEventListener('click', (e) => {
      // 헤더 왼쪽 60px 영역 클릭 시 토글
      const rect = header.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      
      if (clickX <= 60 && window.innerWidth <= 1024) {
        toggleFunction();
      }
    });

    // 터치 이벤트도 추가
    header.addEventListener('touchstart', (e) => {
      const rect = header.getBoundingClientRect();
      const touch = e.touches[0];
      const touchX = touch.clientX - rect.left;
      
      if (touchX <= 60 && window.innerWidth <= 1024) {
        e.preventDefault(); // 기본 터치 동작 방지
        toggleFunction();
      }
    });

    // 스와이프 제스처 지원 추가
    this.setupSwipeGestures(toggleFunction);
    
    // 오버레이 클릭으로 사이드바 닫기 기능 추가
    this.setupOverlayClickClose(toggleFunction);
  }

  setupSwipeGestures(toggleFunction) {
    const mainContent = document.querySelector('.main-content');
    const sidebar = document.querySelector('.sidebar');
    
    if (!mainContent || !sidebar) return;

    let startX = 0;
    let startY = 0;
    let isSwipeGesture = false;
    let currentState = 'collapsed';

    // 스와이프 시작
    const handleTouchStart = (e) => {
      if (window.innerWidth > 1024) return; // 데스크톱에서는 비활성화
      
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      isSwipeGesture = false;
    };

    // 스와이프 이동
    const handleTouchMove = (e) => {
      if (window.innerWidth > 1024) return;
      if (!isSwipeGesture) return;
      
      e.preventDefault(); // 스크롤 방지
    };

    // 스와이프 종료
    const handleTouchEnd = (e) => {
      if (window.innerWidth > 1024) return;
      
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      
      // 수평 스와이프인지 확인 (수직 움직임이 수평보다 작아야 함)
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        const rect = mainContent.getBoundingClientRect();
        const startArea = startX - rect.left;
        
        // 왼쪽 가장자리에서 오른쪽으로 스와이프: 사이드바 열기
        if (startArea < 20 && deltaX > 80) {
          const currentState = sidebar.classList.contains('expanded') ? 'expanded' : 
                              sidebar.classList.contains('collapsed') ? 'collapsed' : 'hidden';
          
          if (currentState === 'collapsed' || currentState === 'hidden') {
            toggleFunction(); // 사이드바 열기
          }
        }
        
        // 사이드바 영역에서 왼쪽으로 스와이프: 사이드바 닫기
        if (startArea < 256 && deltaX < -80) {
          const currentState = sidebar.classList.contains('expanded') ? 'expanded' : 
                              sidebar.classList.contains('collapsed') ? 'collapsed' : 'hidden';
          
          if (currentState === 'expanded') {
            toggleFunction(); // 사이드바 닫기
          }
        }
      }
      
      isSwipeGesture = false;
    };

    // 스와이프 감지 개선
    const handleTouchMoveImproved = (e) => {
      if (window.innerWidth > 1024) return;
      
      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - startX);
      const deltaY = Math.abs(touch.clientY - startY);
      
      // 수평 움직임이 수직 움직임보다 크면 스와이프로 인식
      if (deltaX > deltaY && deltaX > 10) {
        isSwipeGesture = true;
        e.preventDefault(); // 스크롤 방지
      }
    };

    // 이벤트 리스너 등록
    mainContent.addEventListener('touchstart', handleTouchStart, { passive: false });
    mainContent.addEventListener('touchmove', handleTouchMoveImproved, { passive: false });
    mainContent.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    sidebar.addEventListener('touchstart', handleTouchStart, { passive: false });
    sidebar.addEventListener('touchmove', handleTouchMoveImproved, { passive: false });
    sidebar.addEventListener('touchend', handleTouchEnd, { passive: false });

    console.log('스와이프 제스처 기능이 초기화되었습니다.');
  }

  setupOverlayClickClose(toggleFunction) {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    // 클릭과 스와이프를 구분하기 위한 변수들
    let isClick = false;
    let startTime = 0;
    let startX = 0;
    let startY = 0;

    // 터치/클릭 시작 감지
    const handleStart = (e) => {
      if (window.innerWidth > 1024) return; // 데스크톱에서는 비활성화
      
      const currentState = sidebar.classList.contains('expanded');
      if (!currentState) return; // 사이드바가 펼쳐져 있을 때만 작동

      // 이벤트 타입에 따른 좌표 추출
      const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
      const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

      // 사이드바 영역 클릭인지 확인 (사이드바 내부 클릭은 무시)
      const sidebarRect = sidebar.getBoundingClientRect();
      if (clientX < sidebarRect.right) {
        return; // 사이드바 내부 클릭이므로 무시
      }

      isClick = true;
      startTime = Date.now();
      startX = clientX;
      startY = clientY;
    };

    // 터치/클릭 이동 감지
    const handleMove = (e) => {
      if (!isClick) return;

      const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
      const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

      const deltaX = Math.abs(clientX - startX);
      const deltaY = Math.abs(clientY - startY);

      // 이동 거리가 5px을 초과하면 클릭이 아닌 것으로 판단
      if (deltaX > 5 || deltaY > 5) {
        isClick = false;
      }
    };

    // 터치/클릭 종료 감지
    const handleEnd = (e) => {
      if (!isClick) {
        isClick = false;
        return;
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 클릭 조건: 500ms 이내, 5px 이내 이동
      if (duration < 500 && isClick) {
        const currentState = sidebar.classList.contains('expanded');
        
        if (currentState) {
          console.log('오버레이 클릭 감지: 사이드바 닫기 실행');
          
          // 사이드바가 펼쳐진 상태에서만 닫기
          toggleFunction();
          
          // 클릭 피드백 제공
          this.showOverlayClickFeedback();
        }
      }

      isClick = false;
    };

    // 마우스 이벤트 (데스크톱)
    document.addEventListener('mousedown', handleStart);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);

    // 터치 이벤트 (모바일/태블릿)
    document.addEventListener('touchstart', handleStart, { passive: false });
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd, { passive: false });

    // ESC 키로 사이드바 닫기 (접근성)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && window.innerWidth <= 1024) {
        const currentState = sidebar.classList.contains('expanded');
        if (currentState) {
          toggleFunction();
        }
      }
    });

    console.log('오버레이 클릭으로 사이드바 닫기 기능이 초기화되었습니다.');
  }

  showOverlayClickFeedback() {
    // 시각적 피드백을 위한 리플 효과
    const sidebar = document.querySelector('.sidebar');
    if (sidebar && sidebar.classList.contains('expanded')) {
      // 클릭 피드백 클래스 추가
      sidebar.classList.add('click-feedback');
      
      // 짧은 진동 효과 (지원하는 기기에서만)
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      
      // 피드백 클래스 제거
      setTimeout(() => {
        sidebar.classList.remove('click-feedback');
      }, 200);
    }
  }
}

// 애플리케이션 시작
const app = new AdminApp();
app.init();