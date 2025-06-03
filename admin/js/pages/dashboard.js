// Kommentio Admin Dashboard - Dashboard Page

class DashboardPage {
  constructor() {
    this.stats = {
      totalComments: 0,
      totalSites: 0,
      totalUsers: 0,
      spamBlocked: 0
    };
    this.recentComments = [];
  }

  async render() {
    console.log('대시보드 렌더링 시작...');
    const container = Utils.$('#page-dashboard');
    if (!container) {
      console.error('대시보드 컨테이너를 찾을 수 없습니다.');
      return;
    }

    container.innerHTML = '';

    // 페이지 헤더 즉시 표시
    const header = Utils.createElement('div', 'mb-6');
    header.innerHTML = `
      <h1 class="text-3xl font-bold text-gray-900">대시보드</h1>
      <p class="text-gray-600 mt-2">Kommentio 댓글 시스템 현황을 확인하세요</p>
    `;
    container.appendChild(header);

    // 스켈레톤 UI 생성 (즉시 표시)
    const skeletonGrid = this.createSkeletonGrid();
    container.appendChild(skeletonGrid);

    try {
      console.log('API 서비스 확인:', !!window.apiService);
      if (!window.apiService) {
        throw new Error('API 서비스가 초기화되지 않았습니다.');
      }

      // 병렬로 데이터 로드 (성능 개선)
      console.log('데이터 로딩 시작...');
      const [statsResult, commentsResult] = await Promise.allSettled([
        this.loadStats(),
        this.loadRecentComments()
      ]);

      console.log('데이터 로딩 완료:', {
        stats: statsResult.status,
        comments: commentsResult.status
      });

      // 에러 체크
      if (statsResult.status === 'rejected') {
        console.warn('통계 로딩 실패:', statsResult.reason);
      }
      if (commentsResult.status === 'rejected') {
        console.warn('최근 댓글 로딩 실패:', commentsResult.reason);
      }

      // 스켈레톤 제거하고 실제 콘텐츠 표시
      container.removeChild(skeletonGrid);

      // 통계 카드들
      const statsGrid = this.createStatsGrid();
      container.appendChild(statsGrid);

      // 최근 댓글 섹션
      const recentCommentsSection = this.createRecentCommentsSection();
      container.appendChild(recentCommentsSection);

      // 시스템 상태 및 빠른 작업
      const bottomGrid = this.createBottomGrid();
      container.appendChild(bottomGrid);

      console.log('대시보드 렌더링 완료');

    } catch (error) {
      console.error('대시보드 로딩 실패:', error);
      Utils.logError(error, '대시보드 렌더링');
      
      // 스켈레톤 제거
      if (container.contains(skeletonGrid)) {
        container.removeChild(skeletonGrid);
      }
      
      container.appendChild(this.createErrorState());
    }
  }

  async loadStats() {
    try {
      const dashboardStats = await window.apiService.getDashboardStats();
      this.stats = {
        totalComments: dashboardStats.totalComments,
        totalSites: dashboardStats.totalSites,
        totalUsers: dashboardStats.totalUsers,
        spamBlocked: dashboardStats.spamComments
      };
    } catch (error) {
      console.error('통계 로딩 실패:', error);
      // 기본값 사용
      this.stats = {
        totalComments: 0,
        totalSites: 0,
        totalUsers: 0,
        spamBlocked: 0
      };
    }
  }

  async loadRecentComments() {
    try {
      const recentCommentsData = await window.apiService.getRecentComments(5);
      this.recentComments = recentCommentsData.map(comment => ({
        id: comment.id,
        author: comment.author_name,
        content: comment.content,
        site: comment.site_domain,
        createdAt: Utils.formatDateTime(comment.created_at)
      }));
    } catch (error) {
      console.error('최근 댓글 로딩 실패:', error);
      this.recentComments = [];
    }
  }

  createStatsGrid() {
    const grid = Utils.createElement('div', 'stats-grid');

    const statCards = [
      {
        title: '총 댓글 수',
        value: this.stats.totalComments,
        icon: 'fas fa-comments',
        color: 'blue'
      },
      {
        title: '관리 사이트',
        value: this.stats.totalSites,
        icon: 'fas fa-globe',
        color: 'green'
      },
      {
        title: '총 사용자',
        value: this.stats.totalUsers,
        icon: 'fas fa-users',
        color: 'purple'
      },
      {
        title: '차단된 스팸',
        value: this.stats.spamBlocked,
        icon: 'fas fa-shield-alt',
        color: 'red'
      }
    ];

    statCards.forEach(stat => {
      const card = Components.createStatCard(stat.title, stat.value, stat.icon, stat.color);
      grid.appendChild(card);
    });

    return grid;
  }

  createRecentCommentsSection() {
    const section = Utils.createElement('div', 'mb-6');
    
    const headerActions = `
      <button class="btn btn-sm btn-primary">모두 보기</button>
    `;
    
    const commentsContainer = Utils.createElement('div', 'space-y-4');
    
    if (this.recentComments.length === 0) {
      commentsContainer.appendChild(Components.createEmptyState(
        '최근 댓글이 없습니다',
        '새로운 댓글이 등록되면 여기에 표시됩니다.'
      ));
    } else {
      this.recentComments.forEach(comment => {
        const commentItem = this.createCommentItem(comment);
        commentsContainer.appendChild(commentItem);
      });
    }
    
    const card = Components.createCard('최근 댓글', commentsContainer, headerActions);
    section.appendChild(card);
    
    return section;
  }

  createCommentItem(comment) {
    const item = Utils.createElement('div', 'flex items-start gap-3 p-3 bg-gray-50 rounded-lg');
    
    item.innerHTML = `
      <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
        <i class="fas fa-user text-blue-600"></i>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between">
          <p class="text-sm font-medium text-gray-900">${comment.author}</p>
          <p class="text-xs text-gray-500">${comment.createdAt}</p>
        </div>
        <p class="text-sm text-gray-600 mt-1">${comment.content}</p>
        <p class="text-xs text-gray-500 mt-1">사이트: ${comment.site}</p>
      </div>
    `;
    
    return item;
  }

  createBottomGrid() {
    const grid = Utils.createElement('div', 'grid grid-cols-1 lg:grid-cols-2 gap-6');
    
    // 시스템 상태 카드
    const systemStatusCard = this.createSystemStatusCard();
    grid.appendChild(systemStatusCard);
    
    // 빠른 작업 카드
    const quickActionsCard = this.createQuickActionsCard();
    grid.appendChild(quickActionsCard);
    
    return grid;
  }

  createSystemStatusCard() {
    const content = Utils.createElement('div', 'space-y-3');
    
    const statuses = [
      { name: '댓글 시스템', status: 'normal' },
      { name: '스팸 필터', status: 'normal' },
      { name: '데이터베이스', status: 'normal' }
    ];
    
    statuses.forEach(item => {
      const statusItem = Utils.createElement('div', 'flex items-center justify-between');
      statusItem.innerHTML = `
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 bg-green-400 rounded-full"></div>
          <span class="text-sm text-gray-600">${item.name}</span>
        </div>
        <span class="text-sm font-medium text-green-600">정상</span>
      `;
      content.appendChild(statusItem);
    });
    
    return Components.createCard('시스템 상태', content);
  }

  createQuickActionsCard() {
    const content = Utils.createElement('div', 'space-y-3');
    
    const actions = [
      {
        title: '새 사이트 추가',
        icon: 'fas fa-plus',
        color: 'blue',
        onclick: () => Router.navigate('sites')
      },
      {
        title: '스팸 필터 설정',
        icon: 'fas fa-cog',
        color: 'gray',
        onclick: () => Router.navigate('spam-filter')
      },
      {
        title: '분석 보고서 보기',
        icon: 'fas fa-chart-line',
        color: 'gray',
        onclick: () => Router.navigate('analytics')
      }
    ];
    
    actions.forEach(action => {
      const actionButton = Utils.createElement('button', 'w-full flex items-center gap-3 p-3 text-left rounded-lg transition-colors');
      
      if (action.color === 'blue') {
        actionButton.className += ' bg-blue-50 hover:bg-blue-100';
      } else {
        actionButton.className += ' bg-gray-50 hover:bg-gray-100';
      }
      
      actionButton.innerHTML = `
        <i class="${action.icon} ${action.color === 'blue' ? 'text-blue-600' : 'text-gray-600'}"></i>
        <span class="text-sm font-medium ${action.color === 'blue' ? 'text-blue-700' : 'text-gray-700'}">${action.title}</span>
      `;
      
      Utils.on(actionButton, 'click', action.onclick);
      content.appendChild(actionButton);
    });
    
    return Components.createCard('빠른 작업', content);
  }

  createSkeletonGrid() {
    const grid = Utils.createElement('div', 'stats-grid');
    
    // 4개의 스켈레톤 카드
    for (let i = 0; i < 4; i++) {
      const skeletonCard = Utils.createElement('div', 'card animate-pulse');
      skeletonCard.innerHTML = `
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <div class="h-4 bg-gray-200 rounded w-24"></div>
            <div class="h-8 w-8 bg-gray-200 rounded"></div>
          </div>
          <div class="h-8 bg-gray-200 rounded w-16 mb-2"></div>
        </div>
      `;
      grid.appendChild(skeletonCard);
    }
    
    return grid;
  }

  createErrorState() {
    return Components.createEmptyState(
      '데이터 로딩 실패',
      '대시보드 데이터를 불러오는 중 오류가 발생했습니다.',
      '다시 시도',
      () => this.render()
    );
  }
}

// 전역으로 사용할 수 있도록 export
window.DashboardPage = DashboardPage;