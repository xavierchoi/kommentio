// Kommentio Admin Dashboard - Router

class Router {
  constructor(config = {}) {
    this.routes = new Map();
    this.currentPage = 'dashboard';
    this.pages = new Map();
    this.config = config;
    
    this.initializePages();
    this.setupEventListeners();
  }

  initializePages() {
    // 페이지 인스턴스 생성
    this.pages.set('dashboard', new DashboardPage());
    this.pages.set('sites', new SitesPage());
    this.pages.set('comments', new CommentsPage());
    this.pages.set('spam-filter', new SpamFilterPage());
    this.pages.set('analytics', new AnalyticsPage());
    this.pages.set('users', new UsersPage());
    this.pages.set('integrations', new IntegrationsPage());
    this.pages.set('themes', new ThemesPage());
    this.pages.set('settings', new SettingsPage());
    this.pages.set('billing', new BillingPage());
  }

  setupEventListeners() {
    // 네비게이션 링크 클릭 이벤트
    Utils.$$('.nav-link').forEach(link => {
      Utils.on(link, 'click', (e) => {
        e.preventDefault();
        const page = link.getAttribute('data-page');
        
        // 즉각적인 시각적 피드백 제공
        this.showNavigationClickFeedback(link);
        
        this.navigate(page);
      });
    });

    // 브라우저 뒤로/앞으로 가기 이벤트
    Utils.on(window, 'popstate', () => {
      const page = this.getPageFromHash();
      this.navigate(page, false);
    });

    // 초기 페이지 로드는 main.js에서 수동으로 처리
    console.log('라우터 이벤트 리스너 설정 완료');
  }

  navigate(page, updateHistory = true) {
    if (!page) {
      return;
    }

    // 같은 페이지 클릭 시에도 모바일에서는 사이드바 닫기
    if (page === this.currentPage) {
      this.handleMobileSidebarClose();
      return;
    }

    // 페이지가 존재하는지 확인
    if (!this.pages.has(page)) {
      console.warn(`페이지 '${page}'를 찾을 수 없습니다.`);
      page = 'dashboard';
    }

    // 페이지 이동 시 모바일 사이드바 자동 닫기
    this.handleMobileSidebarClose();

    // 현재 페이지 숨기기
    const currentPageElement = Utils.$(`#page-${this.currentPage}`);
    if (currentPageElement) {
      currentPageElement.classList.remove('active');
    }

    // 현재 네비게이션 링크 비활성화
    const currentNavLink = Utils.$(`.nav-link[data-page="${this.currentPage}"]`);
    if (currentNavLink) {
      currentNavLink.classList.remove('active');
    }

    // 새 페이지 활성화
    this.currentPage = page;
    
    const newPageElement = Utils.$(`#page-${page}`);
    if (newPageElement) {
      newPageElement.classList.add('active');
    }

    // 새 네비게이션 링크 활성화
    const newNavLink = Utils.$(`.nav-link[data-page="${page}"]`);
    if (newNavLink) {
      newNavLink.classList.add('active');
    }

    // 페이지 제목 업데이트
    this.updatePageTitle(page);

    // 페이지 렌더링
    const pageInstance = this.pages.get(page);
    if (pageInstance && typeof pageInstance.render === 'function') {
      pageInstance.render();
    }

    // URL 히스토리 업데이트
    if (updateHistory) {
      history.pushState({ page }, '', `#${page}`);
    }
  }

  updatePageTitle(page) {
    const titles = {
      'dashboard': 'Kommentio 관리 대시보드',
      'sites': '사이트 관리',
      'comments': '댓글 관리',
      'spam-filter': '스팸 필터',
      'analytics': '분석',
      'users': '사용자 관리',
      'integrations': '연동',
      'themes': '테마',
      'settings': '계정 설정',
      'billing': '요금제'
    };

    const title = titles[page] || '대시보드';
    const titleElement = Utils.$('.page-title');
    if (titleElement) {
      titleElement.textContent = title;
    }

    // 브라우저 탭 제목도 업데이트
    document.title = `${title} - Kommentio`;
  }

  getPageFromHash() {
    const hash = window.location.hash.slice(1);
    return hash || 'dashboard';
  }

  handleMobileSidebarClose() {
    // 자동 닫기가 비활성화된 경우 무시
    if (!this.isAutoCloseEnabled()) {
      return;
    }

    // 모바일/태블릿 환경에서만 사이드바 자동 닫기
    if (window.innerWidth > (this.config?.breakpoints?.tablet || 1024)) {
      return; // 데스크톱에서는 사이드바 상태 유지
    }

    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) {
      return;
    }

    const isExpanded = sidebar.classList.contains('expanded');
    
    if (isExpanded) {
      console.log('네비게이션 클릭 감지: 모바일 사이드바 자동 닫기');
      
      // 사이드바를 collapsed 상태로 변경
      sidebar.classList.remove('expanded');
      sidebar.classList.add('collapsed');
      
      // localStorage에 상태 저장
      localStorage.setItem('sidebar-state-mobile', 'collapsed');
      
      // 시각적 피드백 제공
      this.showNavigationFeedback();
      
      // 사이드바 닫기 완료 후 메인 컨텐츠에 포커스 (접근성)
      setTimeout(() => {
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
          mainContent.focus();
        }
      }, 300); // 애니메이션 완료 후
    }
  }

  showNavigationClickFeedback(linkElement) {
    // 클릭한 네비게이션 링크에 즉각적인 피드백
    if (linkElement) {
      linkElement.classList.add('navigation-clicked');
      
      // 피드백 클래스 제거
      setTimeout(() => {
        linkElement.classList.remove('navigation-clicked');
      }, 300);
    }
  }

  showNavigationFeedback() {
    // 네비게이션 성공을 나타내는 시각적 피드백
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.classList.add('navigation-feedback');
      
      // 진동 피드백 (지원하는 기기에서만)
      if (navigator.vibrate) {
        navigator.vibrate(30); // 부드러운 짧은 진동
      }
      
      // 피드백 클래스 제거
      setTimeout(() => {
        sidebar.classList.remove('navigation-feedback');
      }, 200);
    }
  }

  // 사이드바 상태 확인 유틸리티 메서드
  getSidebarState() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return 'unknown';
    
    if (sidebar.classList.contains('expanded')) return 'expanded';
    if (sidebar.classList.contains('collapsed')) return 'collapsed';
    return 'hidden';
  }

  // 고급 사용자를 위한 자동 닫기 설정 토글
  toggleAutoCloseSidebar(enabled = null) {
    const currentSetting = localStorage.getItem('sidebar-auto-close') !== 'false';
    const newSetting = enabled !== null ? enabled : !currentSetting;
    
    localStorage.setItem('sidebar-auto-close', newSetting.toString());
    
    console.log(`사이드바 자동 닫기: ${newSetting ? '활성화' : '비활성화'}`);
    return newSetting;
  }

  // 자동 닫기 설정 확인
  isAutoCloseEnabled() {
    return localStorage.getItem('sidebar-auto-close') !== 'false';
  }

  // 정적 메서드로 외부에서 호출할 수 있도록
  static navigate(page) {
    if (window.router) {
      window.router.navigate(page);
    }
  }
}

// 전역으로 사용할 수 있도록 export
window.Router = Router;