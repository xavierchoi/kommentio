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
    this.eventListeners = new Map();
    this.animationFrameId = null;
    this.destroyed = false;
  }

  async render() {
    console.log('대시보드 렌더링 시작...');
    const container = Utils.$('#page-dashboard');
    if (!container) {
      console.error('대시보드 컨테이너를 찾을 수 없습니다.');
      return;
    }

    container.innerHTML = '';

    // 프리미엄 페이지 헤더 (기준 페이지 스타일)
    const header = this.createPremiumHeader();
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

      // 프리미엄 통계 카드들
      const statsGrid = this.createPremiumStatsGrid();
      container.appendChild(statsGrid);

      // 프리미엄 최근 댓글 섹션
      const recentCommentsSection = this.createPremiumRecentCommentsSection();
      container.appendChild(recentCommentsSection);

      // 프리미엄 시스템 상태 및 빠른 작업
      const bottomGrid = this.createPremiumBottomGrid();
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

  createPremiumHeader() {
    const header = Utils.createElement('div');
    header.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      border-radius: 16px !important;
      padding: 32px !important;
      margin-bottom: 32px !important;
      color: white !important;
      position: relative !important;
      overflow: hidden !important;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
    `;

    // 배경 패턴 추가
    const pattern = Utils.createElement('div');
    pattern.style.cssText = `
      position: absolute !important;
      top: -50% !important;
      right: -50% !important;
      width: 200% !important;
      height: 200% !important;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") !important;
      pointer-events: none !important;
    `;
    header.appendChild(pattern);

    const content = Utils.createElement('div');
    content.style.cssText = `position: relative !important; z-index: 1 !important;`;
    
    const iconContainer = Utils.createElement('div');
    iconContainer.style.cssText = `
      display: flex !important;
      align-items: center !important;
      gap: 16px !important;
      margin-bottom: 16px !important;
    `;

    const icon = Utils.createElement('div');
    icon.style.cssText = `
      width: 64px !important;
      height: 64px !important;
      background: rgba(255, 255, 255, 0.2) !important;
      border-radius: 16px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: 28px !important;
      color: white !important;
      backdrop-filter: blur(10px) !important;
    `;
    icon.innerHTML = '<i class="fas fa-tachometer-alt"></i>';

    const statusBadge = Utils.createElement('div');
    statusBadge.style.cssText = `
      background: rgba(34, 197, 94, 0.2) !important;
      color: #dcfce7 !important;
      padding: 6px 12px !important;
      border-radius: 20px !important;
      font-size: 12px !important;
      font-weight: 600 !important;
      text-transform: uppercase !important;
      letter-spacing: 0.05em !important;
      border: 1px solid rgba(34, 197, 94, 0.3) !important;
      margin-left: auto !important;
    `;
    statusBadge.innerHTML = '• 시스템 정상';

    iconContainer.appendChild(icon);
    iconContainer.appendChild(statusBadge);

    const title = Utils.createElement('h1');
    title.style.cssText = `
      font-size: 36px !important;
      font-weight: 800 !important;
      margin: 0 0 8px 0 !important;
      color: white !important;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
    `;
    title.textContent = '대시보드';

    const subtitle = Utils.createElement('p');
    subtitle.style.cssText = `
      font-size: 18px !important;
      margin: 0 !important;
      opacity: 0.9 !important;
      color: rgba(255, 255, 255, 0.9) !important;
    `;
    subtitle.textContent = 'Kommentio 댓글 시스템의 실시간 현황과 주요 지표를 확인하세요';

    content.appendChild(iconContainer);
    content.appendChild(title);
    content.appendChild(subtitle);
    header.appendChild(content);

    return header;
  }

  // 이벤트 리스너 추적 관리
  addEventListenerWithTracking(element, eventType, handler, options = {}) {
    element.addEventListener(eventType, handler, options);
    const key = `${element.constructor.name}-${eventType}-${Date.now()}`;
    this.eventListeners.set(key, { element, eventType, handler, options });
    return key;
  }

  // 메모리 누수 방지를 위한 정리 메서드
  destroy() {
    this.destroyed = true;
    
    // 이벤트 리스너 제거
    for (const [key, listener] of this.eventListeners) {
      listener.element.removeEventListener(listener.eventType, listener.handler, listener.options);
    }
    this.eventListeners.clear();
    
    // 애니메이션 프레임 정리
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    console.log('DashboardPage destroyed and cleaned up');
  }

  createPremiumStatsGrid() {
    const grid = Utils.createElement('div');
    grid.style.cssText = `
      display: grid !important;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important;
      gap: 24px !important;
      margin-bottom: 32px !important;
    `;

    const statCards = [
      {
        title: '총 댓글 수',
        value: this.stats.totalComments,
        icon: 'fas fa-comments',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        iconBg: 'rgba(102, 126, 234, 0.2)',
        trend: '+12%',
        description: '이번 달 새로운 댓글'
      },
      {
        title: '관리 사이트',
        value: this.stats.totalSites,
        icon: 'fas fa-globe',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        iconBg: 'rgba(240, 147, 251, 0.2)',
        trend: '+3',
        description: '활성 웹사이트'
      },
      {
        title: '총 사용자',
        value: this.stats.totalUsers,
        icon: 'fas fa-users',
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        iconBg: 'rgba(79, 172, 254, 0.2)',
        trend: '+8%',
        description: '등록된 사용자'
      },
      {
        title: '차단된 스팸',
        value: this.stats.spamBlocked,
        icon: 'fas fa-shield-alt',
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        iconBg: 'rgba(250, 112, 154, 0.2)',
        trend: '-5%',
        description: 'AI로 차단된 스팸'
      }
    ];

    statCards.forEach(stat => {
      const card = this.createPremiumStatCard(stat);
      grid.appendChild(card);
    });

    return grid;
  }

  createPremiumStatCard(stat) {
    const card = Utils.createElement('div');
    card.style.cssText = `
      background: white !important;
      border-radius: 20px !important;
      padding: 24px !important;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
      border: 1px solid #f1f5f9 !important;
      transition: all 0.3s ease !important;
      position: relative !important;
      overflow: hidden !important;
      cursor: pointer !important;
      transform: translateY(0) !important;
    `;

    // 호버 효과 - 추적 가능한 이벤트 리스너
    const mouseEnterHandler = () => {
      if (!this.destroyed) {
        card.style.transform = 'translateY(-4px) !important';
        card.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important';
      }
    };
    const mouseLeaveHandler = () => {
      if (!this.destroyed) {
        card.style.transform = 'translateY(0) !important';
        card.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important';
      }
    };
    
    this.addEventListenerWithTracking(card, 'mouseenter', mouseEnterHandler);
    this.addEventListenerWithTracking(card, 'mouseleave', mouseLeaveHandler);

    // 그라데이션 헤더
    const header = Utils.createElement('div');
    header.style.cssText = `
      background: ${stat.gradient} !important;
      margin: -24px -24px 20px -24px !important;
      padding: 20px 24px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
    `;

    const iconContainer = Utils.createElement('div');
    iconContainer.style.cssText = `
      width: 48px !important;
      height: 48px !important;
      background: rgba(255, 255, 255, 0.2) !important;
      border-radius: 12px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: 20px !important;
      color: white !important;
      backdrop-filter: blur(10px) !important;
    `;
    iconContainer.innerHTML = `<i class="${stat.icon}"></i>`;

    const trendBadge = Utils.createElement('div');
    trendBadge.style.cssText = `
      background: rgba(255, 255, 255, 0.2) !important;
      color: white !important;
      padding: 4px 8px !important;
      border-radius: 12px !important;
      font-size: 12px !important;
      font-weight: 600 !important;
      backdrop-filter: blur(10px) !important;
    `;
    trendBadge.textContent = stat.trend;

    header.appendChild(iconContainer);
    header.appendChild(trendBadge);

    // 콘텐츠
    const content = Utils.createElement('div');

    const value = Utils.createElement('div');
    value.style.cssText = `
      font-size: 32px !important;
      font-weight: 800 !important;
      color: #1e293b !important;
      margin-bottom: 8px !important;
      line-height: 1 !important;
    `;
    value.textContent = stat.value.toLocaleString();

    const title = Utils.createElement('div');
    title.style.cssText = `
      font-size: 16px !important;
      font-weight: 600 !important;
      color: #475569 !important;
      margin-bottom: 4px !important;
    `;
    title.textContent = stat.title;

    const description = Utils.createElement('div');
    description.style.cssText = `
      font-size: 14px !important;
      color: #64748b !important;
    `;
    description.textContent = stat.description;

    content.appendChild(value);
    content.appendChild(title);
    content.appendChild(description);

    card.appendChild(header);
    card.appendChild(content);

    return card;
  }

  createPremiumRecentCommentsSection() {
    const section = Utils.createElement('div');
    section.style.cssText = 'margin-bottom: 32px !important;';
    
    const card = Utils.createElement('div');
    card.style.cssText = `
      background: white !important;
      border-radius: 20px !important;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
      border: 1px solid #f1f5f9 !important;
      overflow: hidden !important;
    `;

    // 프리미엄 헤더
    const header = Utils.createElement('div');
    header.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      padding: 24px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
    `;

    const headerLeft = Utils.createElement('div');
    headerLeft.style.cssText = 'display: flex !important; align-items: center !important; gap: 12px !important;';

    const headerIcon = Utils.createElement('div');
    headerIcon.style.cssText = `
      width: 40px !important;
      height: 40px !important;
      background: rgba(255, 255, 255, 0.2) !important;
      border-radius: 10px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      color: white !important;
      font-size: 18px !important;
      backdrop-filter: blur(10px) !important;
    `;
    headerIcon.innerHTML = '<i class="fas fa-comment-dots"></i>';

    const headerTitle = Utils.createElement('h2');
    headerTitle.style.cssText = `
      font-size: 20px !important;
      font-weight: 700 !important;
      margin: 0 !important;
      color: white !important;
    `;
    headerTitle.textContent = '최근 댓글';

    const headerButton = Utils.createElement('button');
    headerButton.style.cssText = `
      background: rgba(255, 255, 255, 0.2) !important;
      color: white !important;
      border: 1px solid rgba(255, 255, 255, 0.3) !important;
      padding: 8px 16px !important;
      border-radius: 20px !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
      backdrop-filter: blur(10px) !important;
    `;
    headerButton.textContent = '모두 보기';
    headerButton.addEventListener('click', () => Router.navigate('comments'));

    headerLeft.appendChild(headerIcon);
    headerLeft.appendChild(headerTitle);
    header.appendChild(headerLeft);
    header.appendChild(headerButton);

    // 콘텐츠
    const content = Utils.createElement('div');
    content.style.cssText = 'padding: 24px !important;';
    
    if (this.recentComments.length === 0) {
      const emptyState = this.createPremiumEmptyState();
      content.appendChild(emptyState);
    } else {
      this.recentComments.forEach((comment, index) => {
        const commentItem = this.createPremiumCommentItem(comment);
        content.appendChild(commentItem);
        
        // 마지막 항목이 아니면 구분선 추가
        if (index < this.recentComments.length - 1) {
          const divider = Utils.createElement('div');
          divider.style.cssText = `
            height: 1px !important;
            background: #f1f5f9 !important;
            margin: 16px 0 !important;
          `;
          content.appendChild(divider);
        }
      });
    }
    
    card.appendChild(header);
    card.appendChild(content);
    section.appendChild(card);
    
    return section;
  }

  createPremiumCommentItem(comment) {
    const item = Utils.createElement('div');
    item.style.cssText = `
      display: flex !important;
      align-items: flex-start !important;
      gap: 16px !important;
      padding: 16px !important;
      background: #f8fafc !important;
      border-radius: 12px !important;
      transition: all 0.2s ease !important;
      cursor: pointer !important;
      border: 1px solid #e2e8f0 !important;
    `;

    // 호버 효과
    item.addEventListener('mouseenter', () => {
      item.style.background = '#f1f5f9 !important';
      item.style.borderColor = '#cbd5e1 !important';
    });

    item.addEventListener('mouseleave', () => {
      item.style.background = '#f8fafc !important';
      item.style.borderColor = '#e2e8f0 !important';
    });

    // 아바타
    const avatar = Utils.createElement('div');
    avatar.style.cssText = `
      width: 48px !important;
      height: 48px !important;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      border-radius: 12px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      color: white !important;
      font-size: 18px !important;
      font-weight: 600 !important;
      flex-shrink: 0 !important;
    `;
    avatar.textContent = comment.author.charAt(0).toUpperCase();

    // 콘텐츠 영역
    const contentArea = Utils.createElement('div');
    contentArea.style.cssText = 'flex: 1 !important; min-width: 0 !important;';

    // 헤더 (이름과 시간)
    const header = Utils.createElement('div');
    header.style.cssText = `
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      margin-bottom: 8px !important;
    `;

    const authorName = Utils.createElement('div');
    authorName.style.cssText = `
      font-size: 16px !important;
      font-weight: 600 !important;
      color: #1e293b !important;
    `;
    authorName.textContent = comment.author;

    const timestamp = Utils.createElement('div');
    timestamp.style.cssText = `
      font-size: 12px !important;
      color: #64748b !important;
      background: #e2e8f0 !important;
      padding: 4px 8px !important;
      border-radius: 12px !important;
    `;
    timestamp.textContent = comment.createdAt;

    header.appendChild(authorName);
    header.appendChild(timestamp);

    // 댓글 내용
    const content = Utils.createElement('div');
    content.style.cssText = `
      font-size: 14px !important;
      color: #475569 !important;
      line-height: 1.5 !important;
      margin-bottom: 8px !important;
    `;
    content.textContent = comment.content;

    // 사이트 정보
    const siteInfo = Utils.createElement('div');
    siteInfo.style.cssText = `
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
    `;

    const siteIcon = Utils.createElement('div');
    siteIcon.style.cssText = `
      width: 16px !important;
      height: 16px !important;
      background: #94a3b8 !important;
      border-radius: 4px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: 10px !important;
      color: white !important;
    `;
    siteIcon.innerHTML = '<i class="fas fa-globe"></i>';

    const siteText = Utils.createElement('div');
    siteText.style.cssText = `
      font-size: 12px !important;
      color: #64748b !important;
    `;
    siteText.textContent = comment.site;

    siteInfo.appendChild(siteIcon);
    siteInfo.appendChild(siteText);

    contentArea.appendChild(header);
    contentArea.appendChild(content);
    contentArea.appendChild(siteInfo);

    item.appendChild(avatar);
    item.appendChild(contentArea);
    
    return item;
  }

  createPremiumEmptyState() {
    const emptyState = Utils.createElement('div');
    emptyState.style.cssText = `
      text-align: center !important;
      padding: 48px 24px !important;
    `;

    const icon = Utils.createElement('div');
    icon.style.cssText = `
      width: 80px !important;
      height: 80px !important;
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%) !important;
      border-radius: 20px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      margin: 0 auto 24px auto !important;
      font-size: 32px !important;
      color: #94a3b8 !important;
    `;
    icon.innerHTML = '<i class="fas fa-comment-slash"></i>';

    const title = Utils.createElement('h3');
    title.style.cssText = `
      font-size: 18px !important;
      font-weight: 600 !important;
      color: #475569 !important;
      margin: 0 0 8px 0 !important;
    `;
    title.textContent = '최근 댓글이 없습니다';

    const description = Utils.createElement('p');
    description.style.cssText = `
      font-size: 14px !important;
      color: #64748b !important;
      margin: 0 !important;
    `;
    description.textContent = '새로운 댓글이 등록되면 여기에 표시됩니다.';

    emptyState.appendChild(icon);
    emptyState.appendChild(title);
    emptyState.appendChild(description);

    return emptyState;
  }

  createPremiumBottomGrid() {
    const grid = Utils.createElement('div');
    grid.style.cssText = `
      display: grid !important;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)) !important;
      gap: 24px !important;
      margin-bottom: 32px !important;
    `;
    
    // 프리미엄 시스템 상태 카드
    const systemStatusCard = this.createPremiumSystemStatusCard();
    grid.appendChild(systemStatusCard);
    
    // 프리미엄 빠른 작업 카드
    const quickActionsCard = this.createPremiumQuickActionsCard();
    grid.appendChild(quickActionsCard);
    
    return grid;
  }

  createPremiumSystemStatusCard() {
    const card = Utils.createElement('div');
    card.style.cssText = `
      background: white !important;
      border-radius: 20px !important;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
      border: 1px solid #f1f5f9 !important;
      overflow: hidden !important;
    `;

    // 프리미엄 헤더
    const header = Utils.createElement('div');
    header.style.cssText = `
      background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
      padding: 24px !important;
      display: flex !important;
      align-items: center !important;
      gap: 12px !important;
    `;

    const headerIcon = Utils.createElement('div');
    headerIcon.style.cssText = `
      width: 40px !important;
      height: 40px !important;
      background: rgba(255, 255, 255, 0.2) !important;
      border-radius: 10px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      color: white !important;
      font-size: 18px !important;
      backdrop-filter: blur(10px) !important;
    `;
    headerIcon.innerHTML = '<i class="fas fa-heartbeat"></i>';

    const headerTitle = Utils.createElement('h2');
    headerTitle.style.cssText = `
      font-size: 20px !important;
      font-weight: 700 !important;
      margin: 0 !important;
      color: white !important;
    `;
    headerTitle.textContent = '시스템 상태';

    header.appendChild(headerIcon);
    header.appendChild(headerTitle);

    // 콘텐츠
    const content = Utils.createElement('div');
    content.style.cssText = 'padding: 24px !important;';
    
    const statuses = [
      { 
        name: '댓글 시스템', 
        status: 'normal',
        icon: 'fas fa-comments',
        uptime: '99.9%',
        responseTime: '45ms'
      },
      { 
        name: '스팸 필터', 
        status: 'normal',
        icon: 'fas fa-shield-alt',
        uptime: '100%',
        responseTime: '12ms'
      },
      { 
        name: '데이터베이스', 
        status: 'normal',
        icon: 'fas fa-database',
        uptime: '99.8%',
        responseTime: '8ms'
      }
    ];
    
    statuses.forEach((item, index) => {
      const statusItem = Utils.createElement('div');
      statusItem.style.cssText = `
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        padding: 16px !important;
        background: #f8fafc !important;
        border-radius: 12px !important;
        margin-bottom: ${index < statuses.length - 1 ? '12px' : '0'} !important;
        border: 1px solid #e2e8f0 !important;
      `;

      const leftSection = Utils.createElement('div');
      leftSection.style.cssText = 'display: flex !important; align-items: center !important; gap: 12px !important;';

      const serviceIcon = Utils.createElement('div');
      serviceIcon.style.cssText = `
        width: 32px !important;
        height: 32px !important;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
        border-radius: 8px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        color: white !important;
        font-size: 14px !important;
      `;
      serviceIcon.innerHTML = `<i class="${item.icon}"></i>`;

      const serviceInfo = Utils.createElement('div');
      
      const serviceName = Utils.createElement('div');
      serviceName.style.cssText = `
        font-size: 16px !important;
        font-weight: 600 !important;
        color: #1e293b !important;
        margin-bottom: 2px !important;
      `;
      serviceName.textContent = item.name;

      const serviceMetrics = Utils.createElement('div');
      serviceMetrics.style.cssText = `
        font-size: 12px !important;
        color: #64748b !important;
      `;
      serviceMetrics.textContent = `Uptime: ${item.uptime} • Response: ${item.responseTime}`;

      serviceInfo.appendChild(serviceName);
      serviceInfo.appendChild(serviceMetrics);

      const statusBadge = Utils.createElement('div');
      statusBadge.style.cssText = `
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        background: #dcfce7 !important;
        color: #166534 !important;
        padding: 6px 12px !important;
        border-radius: 20px !important;
        font-size: 12px !important;
        font-weight: 600 !important;
        border: 1px solid #bbf7d0 !important;
      `;

      const statusDot = Utils.createElement('div');
      statusDot.style.cssText = `
        width: 8px !important;
        height: 8px !important;
        background: #10b981 !important;
        border-radius: 50% !important;
        animation: pulse 2s infinite !important;
      `;

      const statusText = Utils.createElement('span');
      statusText.textContent = '정상';

      statusBadge.appendChild(statusDot);
      statusBadge.appendChild(statusText);

      leftSection.appendChild(serviceIcon);
      leftSection.appendChild(serviceInfo);
      statusItem.appendChild(leftSection);
      statusItem.appendChild(statusBadge);

      content.appendChild(statusItem);
    });
    
    card.appendChild(header);
    card.appendChild(content);
    
    return card;
  }

  createPremiumQuickActionsCard() {
    const card = Utils.createElement('div');
    card.style.cssText = `
      background: white !important;
      border-radius: 20px !important;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
      border: 1px solid #f1f5f9 !important;
      overflow: hidden !important;
    `;

    // 프리미엄 헤더
    const header = Utils.createElement('div');
    header.style.cssText = `
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
      padding: 24px !important;
      display: flex !important;
      align-items: center !important;
      gap: 12px !important;
    `;

    const headerIcon = Utils.createElement('div');
    headerIcon.style.cssText = `
      width: 40px !important;
      height: 40px !important;
      background: rgba(255, 255, 255, 0.2) !important;
      border-radius: 10px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      color: white !important;
      font-size: 18px !important;
      backdrop-filter: blur(10px) !important;
    `;
    headerIcon.innerHTML = '<i class="fas fa-bolt"></i>';

    const headerTitle = Utils.createElement('h2');
    headerTitle.style.cssText = `
      font-size: 20px !important;
      font-weight: 700 !important;
      margin: 0 !important;
      color: white !important;
    `;
    headerTitle.textContent = '빠른 작업';

    header.appendChild(headerIcon);
    header.appendChild(headerTitle);

    // 콘텐츠
    const content = Utils.createElement('div');
    content.style.cssText = 'padding: 24px !important;';
    
    const actions = [
      {
        title: '새 사이트 추가',
        description: '새로운 웹사이트에 댓글 시스템 설치',
        icon: 'fas fa-plus-circle',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        onclick: () => Router.navigate('sites')
      },
      {
        title: '스팸 필터 설정',
        description: 'AI 스팸 필터 설정 및 임계값 조정',
        icon: 'fas fa-shield-alt',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        onclick: () => Router.navigate('spam-filter')
      },
      {
        title: '분석 보고서 보기',
        description: '사이트별 댓글 현황과 사용자 분석',
        icon: 'fas fa-chart-line',
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        onclick: () => Router.navigate('analytics')
      }
    ];
    
    actions.forEach((action, index) => {
      const actionButton = Utils.createElement('button');
      actionButton.style.cssText = `
        width: 100% !important;
        display: flex !important;
        align-items: center !important;
        gap: 16px !important;
        padding: 16px !important;
        text-align: left !important;
        background: #f8fafc !important;
        border: 1px solid #e2e8f0 !important;
        border-radius: 12px !important;
        cursor: pointer !important;
        transition: all 0.3s ease !important;
        margin-bottom: ${index < actions.length - 1 ? '12px' : '0'} !important;
        transform: translateY(0) !important;
      `;

      // 호버 효과
      actionButton.addEventListener('mouseenter', () => {
        actionButton.style.transform = 'translateY(-2px) !important';
        actionButton.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important';
        actionButton.style.borderColor = '#cbd5e1 !important';
      });

      actionButton.addEventListener('mouseleave', () => {
        actionButton.style.transform = 'translateY(0) !important';
        actionButton.style.boxShadow = 'none !important';
        actionButton.style.borderColor = '#e2e8f0 !important';
      });

      const iconContainer = Utils.createElement('div');
      iconContainer.style.cssText = `
        width: 48px !important;
        height: 48px !important;
        background: ${action.gradient} !important;
        border-radius: 12px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        color: white !important;
        font-size: 20px !important;
        flex-shrink: 0 !important;
      `;
      iconContainer.innerHTML = `<i class="${action.icon}"></i>`;

      const textContainer = Utils.createElement('div');
      textContainer.style.cssText = 'flex: 1 !important; min-width: 0 !important;';

      const title = Utils.createElement('div');
      title.style.cssText = `
        font-size: 16px !important;
        font-weight: 600 !important;
        color: #1e293b !important;
        margin-bottom: 4px !important;
      `;
      title.textContent = action.title;

      const description = Utils.createElement('div');
      description.style.cssText = `
        font-size: 14px !important;
        color: #64748b !important;
        line-height: 1.4 !important;
      `;
      description.textContent = action.description;

      const arrowIcon = Utils.createElement('div');
      arrowIcon.style.cssText = `
        color: #94a3b8 !important;
        font-size: 16px !important;
        transition: all 0.2s ease !important;
      `;
      arrowIcon.innerHTML = '<i class="fas fa-chevron-right"></i>';

      textContainer.appendChild(title);
      textContainer.appendChild(description);

      actionButton.appendChild(iconContainer);
      actionButton.appendChild(textContainer);
      actionButton.appendChild(arrowIcon);

      Utils.on(actionButton, 'click', action.onclick);
      content.appendChild(actionButton);
    });
    
    card.appendChild(header);
    card.appendChild(content);
    
    return card;
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