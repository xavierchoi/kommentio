// Kommentio Admin Dashboard - Router

class Router {
  constructor() {
    this.routes = new Map();
    this.currentPage = 'dashboard';
    this.pages = new Map();
    
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
    // 나머지 페이지들도 곧 추가 예정
  }

  setupEventListeners() {
    // 네비게이션 링크 클릭 이벤트
    Utils.$$('.nav-link').forEach(link => {
      Utils.on(link, 'click', (e) => {
        e.preventDefault();
        const page = link.getAttribute('data-page');
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
    if (!page || page === this.currentPage) {
      return;
    }

    // 페이지가 존재하는지 확인
    if (!this.pages.has(page)) {
      console.warn(`페이지 '${page}'를 찾을 수 없습니다.`);
      page = 'dashboard';
    }

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

  // 정적 메서드로 외부에서 호출할 수 있도록
  static navigate(page) {
    if (window.router) {
      window.router.navigate(page);
    }
  }
}

// 전역으로 사용할 수 있도록 export
window.Router = Router;