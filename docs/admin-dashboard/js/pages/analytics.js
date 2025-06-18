// Kommentio Admin Dashboard - Analytics Page

class AnalyticsPage {
  constructor() {
    this.charts = {};
    this.analyticsData = {
      commentsOverTime: [],
      siteComparison: [],
      userEngagement: [],
      spamTrends: [],
      popularPages: [],
      commentsByHour: [],
      deviceStats: {},
      geographicData: []
    };
    this.dateRange = '30d'; // 7d, 30d, 90d, 1y
    this.selectedSite = 'all';
    this.sites = [];
    this.eventListeners = new Map();
    this.destroyed = false;
    this.chartJSLoaded = false;
  }

  async render() {
    const container = Utils.$('#page-analytics');
    container.innerHTML = '';

    // Chart.js 로드
    await this.loadChartJS();

    // 페이지 헤더
    const header = this.createPageHeader();
    container.appendChild(header);

    // 필터 섹션
    const filtersSection = this.createFiltersSection();
    container.appendChild(filtersSection);

    // 로딩 표시
    Utils.showLoading(container);

    try {
      // 데이터 로드
      await this.loadSites();
      await this.loadAnalyticsData();

      // KPI 카드들
      const kpiSection = this.createKPISection();
      container.appendChild(kpiSection);

      // 차트 섹션들
      const chartsContainer = this.createChartsContainer();
      container.appendChild(chartsContainer);

      // 테이블 섹션
      const tablesSection = this.createTablesSection();
      container.appendChild(tablesSection);

      // 차트 렌더링
      await this.renderAllCharts();

    } catch (error) {
      console.error('분석 데이터 로딩 실패:', error);
      container.appendChild(this.createErrorState());
    } finally {
      Utils.hideLoading(container);
    }
  }

  async loadChartJS() {
    // 이미 로드된 경우
    if (window.Chart && this.chartJSLoaded) {
      return Promise.resolve();
    }
    
    // CDN 대체 및 fallback 시스템
    const cdnUrls = [
      'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js',
      'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.js',
      'https://unpkg.com/chart.js@4.4.0/dist/chart.umd.js'
    ];

    for (const url of cdnUrls) {
      try {
        await this.loadChartJSFromURL(url);
        this.chartJSLoaded = true;
        console.log(`Chart.js 로드 성공: ${url}`);
        return;
      } catch (error) {
        console.warn(`Chart.js 로드 실패: ${url}`, error);
        continue;
      }
    }
    
    // 모든 CDN 실패 시 fallback
    console.error('모든 Chart.js CDN 로드 실패');
    this.showChartLoadError();
  }
  
  loadChartJSFromURL(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load from ${url}`));
      document.head.appendChild(script);
    });
  }

  showChartLoadError() {
    Utils.showNotification('차트 라이브러리 로드에 실패했습니다. 일부 기능이 제한될 수 있습니다.', 'warning');
  }

  async loadSites() {
    try {
      this.sites = await window.apiService.getSites();
    } catch (error) {
      console.error('사이트 목록 로딩 실패:', error);
      this.sites = [];
    }
  }

  async loadAnalyticsData() {
    try {
      // Mock 분석 데이터 생성
      const now = new Date();
      const days = this.dateRange === '7d' ? 7 : this.dateRange === '30d' ? 30 : this.dateRange === '90d' ? 90 : 365;
      
      // 시간별 댓글 데이터
      this.analyticsData.commentsOverTime = Array.from({ length: days }, (_, i) => {
        const date = new Date(now.getTime() - (days - i - 1) * 24 * 60 * 60 * 1000);
        return {
          date: date.toISOString().split('T')[0],
          comments: Math.floor(Math.random() * 50) + 10,
          approved: Math.floor(Math.random() * 40) + 8,
          spam: Math.floor(Math.random() * 5)
        };
      });

      // 사이트별 비교
      this.analyticsData.siteComparison = this.sites.map(site => ({
        name: site.name,
        comments: Math.floor(Math.random() * 500) + 100,
        users: Math.floor(Math.random() * 200) + 50,
        engagement: (Math.random() * 0.3 + 0.1).toFixed(2)
      }));

      // 시간대별 댓글
      this.analyticsData.commentsByHour = Array.from({ length: 24 }, (_, hour) => ({
        hour: hour,
        comments: Math.floor(Math.random() * 20) + 1
      }));

      // 인기 페이지
      this.analyticsData.popularPages = [
        { url: '/blog/javascript-tips', title: 'JavaScript 팁 모음', comments: 245, views: 5420 },
        { url: '/tutorials/react-basics', title: 'React 기초 강의', comments: 189, views: 4230 },
        { url: '/news/tech-update', title: '기술 업데이트 소식', comments: 156, views: 3890 },
        { url: '/guides/css-flexbox', title: 'CSS Flexbox 가이드', comments: 134, views: 3120 },
        { url: '/reviews/new-framework', title: '새 프레임워크 리뷰', comments: 98, views: 2650 }
      ];

      // 디바이스 통계
      this.analyticsData.deviceStats = {
        desktop: 45,
        mobile: 35,
        tablet: 20
      };

      // 지역별 데이터
      this.analyticsData.geographicData = [
        { country: '대한민국', comments: 1247, percentage: 65 },
        { country: '미국', comments: 234, percentage: 12 },
        { country: '일본', comments: 189, percentage: 10 },
        { country: '기타', comments: 245, percentage: 13 }
      ];

    } catch (error) {
      console.error('분석 데이터 로딩 실패:', error);
    }
  }

  createPageHeader() {
    const header = Utils.createElement('div', 'mb-8');
    header.innerHTML = `
      <div class="flex flex-col gap-6">
        <!-- 메인 타이틀 -->
        <div class="flex items-center space-x-3 md:space-x-4">
          <div class="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl">
            <i class="fas fa-chart-line text-white text-xl md:text-2xl"></i>
          </div>
          <div class="flex-1">
            <h1 class="text-2xl md:text-3xl font-bold text-gray-900">분석 대시보드</h1>
            <p class="text-gray-600 mt-1 text-sm md:text-base">댓글 시스템의 성과와 사용자 참여도를 심층 분석하세요</p>
          </div>
        </div>
        
        <!-- 실시간 상태 및 액션 버튼들 -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <!-- 실시간 업데이트 상태 -->
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200 w-fit">
              <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span class="text-green-700 text-sm font-medium">실시간 업데이트</span>
            </div>
            <div class="text-sm text-gray-600">
              <i class="fas fa-clock"></i>
              <span class="ml-1">마지막 업데이트: ${new Date().toLocaleTimeString('ko-KR')}</span>
            </div>
          </div>
          
          <!-- 액션 버튼들 -->
          <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button class="w-full sm:w-auto px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center sm:justify-start space-x-2 shadow-sm min-h-[44px]" onclick="analyticsPage.exportReport()">
              <i class="fas fa-download"></i>
              <span class="hidden sm:inline">보고서 내보내기</span>
              <span class="sm:hidden">내보내기</span>
            </button>
            <button class="w-full sm:w-auto px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center sm:justify-start space-x-2 shadow-sm min-h-[44px]" onclick="analyticsPage.refreshData()">
              <i class="fas fa-sync-alt"></i>
              <span class="hidden sm:inline">새로고침</span>
              <span class="sm:hidden">새로고침</span>
            </button>
            <button class="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg min-h-[44px]" onclick="analyticsPage.showAdvancedFilters()">
              <i class="fas fa-filter"></i>
              <span>고급 필터</span>
            </button>
          </div>
        </div>
      </div>
    `;
    
    return header;
  }

  createFiltersSection() {
    const section = Utils.createElement('div', 'bg-white rounded-xl shadow-lg border border-gray-200 mb-8');
    
    // 프리미엄 헤더
    const header = Utils.createElement('div', 'p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50');
    header.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
          <i class="fas fa-filter text-white text-sm"></i>
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-900">분석 필터</h2>
          <p class="text-gray-600 text-sm">데이터 범위와 조건을 설정하여 맞춤 분석을 진행하세요</p>
        </div>
      </div>
    `;
    
    const body = Utils.createElement('div', 'p-6');
    body.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 기간 선택 -->
        <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
          <div class="flex items-center space-x-2 mb-3">
            <div class="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <i class="fas fa-calendar text-white text-xs"></i>
            </div>
            <label class="block text-gray-700 font-semibold">📅 분석 기간</label>
          </div>
          <select id="dateRangeFilter" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white min-h-[44px]">
            <option value="7d" ${this.dateRange === '7d' ? 'selected' : ''}>최근 7일</option>
            <option value="30d" ${this.dateRange === '30d' ? 'selected' : ''}>최근 30일</option>
            <option value="90d" ${this.dateRange === '90d' ? 'selected' : ''}>최근 90일</option>
            <option value="1y" ${this.dateRange === '1y' ? 'selected' : ''}>최근 1년</option>
          </select>
          <p class="text-xs text-gray-500 mt-2">분석할 데이터의 시간 범위를 선택하세요</p>
        </div>
        
        <!-- 사이트 선택 -->
        <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
          <div class="flex items-center space-x-2 mb-3">
            <div class="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <i class="fas fa-globe text-white text-xs"></i>
            </div>
            <label class="block text-gray-700 font-semibold">🌐 사이트 선택</label>
          </div>
          <select id="siteFilter" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white min-h-[44px]">
            <option value="all" ${this.selectedSite === 'all' ? 'selected' : ''}>모든 사이트</option>
            ${this.sites.map(site => 
              `<option value="${site.id}" ${this.selectedSite == site.id ? 'selected' : ''}>
                ${site.name}
              </option>`
            ).join('')}
          </select>
          <p class="text-xs text-gray-500 mt-2">분석할 사이트를 선택하거나 전체 보기</p>
        </div>
        
        <!-- 실시간 정보 및 통계 -->
        <div class="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
          <div class="flex items-center space-x-2 mb-3">
            <div class="w-6 h-6 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
              <i class="fas fa-info text-white text-xs"></i>
            </div>
            <label class="block text-gray-700 font-semibold">📊 실시간 정보</label>
          </div>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">마지막 업데이트</span>
              <span class="text-sm font-medium text-gray-900">${new Date().toLocaleTimeString('ko-KR')}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">데이터 포인트</span>
              <span class="text-sm font-medium text-orange-600">${this.analyticsData.commentsOverTime.length}개</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">업데이트 주기</span>
              <span class="text-sm font-medium text-green-600">실시간</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 빠른 필터 버튼들 -->
      <div class="mt-6 pt-6 border-t border-gray-200">
        <h3 class="text-sm font-semibold text-gray-700 mb-3">빠른 필터</h3>
        <div class="flex flex-wrap gap-2">
          <button class="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors" onclick="analyticsPage.applyQuickFilter('trending')">
            🔥 인기 트렌드
          </button>
          <button class="px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors" onclick="analyticsPage.applyQuickFilter('growth')">
            📈 성장률
          </button>
          <button class="px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors" onclick="analyticsPage.applyQuickFilter('engagement')">
            💬 참여도
          </button>
          <button class="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors" onclick="analyticsPage.applyQuickFilter('spam')">
            🛡️ 스팸 분석
          </button>
        </div>
      </div>
    `;
    
    section.appendChild(header);
    section.appendChild(body);
    
    // 이벤트 리스너 (추적 가능)
    setTimeout(() => {
      const dateFilter = Utils.$('#dateRangeFilter');
      const siteFilter = Utils.$('#siteFilter');
      
      if (dateFilter) {
        const dateChangeHandler = (e) => {
          if (!this.destroyed) {
            this.dateRange = e.target.value;
            this.refreshAnalytics();
          }
        };
        this.addEventListenerWithTracking(dateFilter, 'change', dateChangeHandler);
      }
      
      if (siteFilter) {
        const siteChangeHandler = (e) => {
          if (!this.destroyed) {
            this.selectedSite = e.target.value;
            this.refreshAnalytics();
          }
        };
        this.addEventListenerWithTracking(siteFilter, 'change', siteChangeHandler);
      }
    }, 100);
    
    return section;
  }

  createKPISection() {
    const section = Utils.createElement('div', 'mb-8');
    
    // 총 댓글 수 계산
    const totalComments = this.analyticsData.commentsOverTime.reduce((sum, day) => sum + day.comments, 0);
    const totalApproved = this.analyticsData.commentsOverTime.reduce((sum, day) => sum + day.approved, 0);
    const totalSpam = this.analyticsData.commentsOverTime.reduce((sum, day) => sum + day.spam, 0);
    
    const avgDaily = Math.round(totalComments / this.analyticsData.commentsOverTime.length);
    const approvalRate = ((totalApproved / totalComments) * 100).toFixed(1);
    const spamRate = ((totalSpam / totalComments) * 100).toFixed(1);

    const kpiCards = [
      {
        title: '총 댓글 수',
        value: Utils.formatNumber ? Utils.formatNumber(totalComments) : totalComments.toLocaleString(),
        icon: 'fas fa-comments',
        gradient: 'from-blue-500 to-indigo-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-600',
        trend: '+12.5%',
        trendUp: true,
        description: '전체 게시된 댓글'
      },
      {
        title: '일평균 댓글',
        value: Utils.formatNumber ? Utils.formatNumber(avgDaily) : avgDaily.toLocaleString(),
        icon: 'fas fa-chart-line',
        gradient: 'from-green-500 to-emerald-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-600',
        trend: '+8.2%',
        trendUp: true,
        description: '하루 평균 댓글 수'
      },
      {
        title: '승인률',
        value: `${approvalRate}%`,
        icon: 'fas fa-check-circle',
        gradient: 'from-purple-500 to-purple-600',
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-600',
        trend: '+2.1%',
        trendUp: true,
        description: '자동 승인된 댓글 비율'
      },
      {
        title: '스팸 차단률',
        value: `${spamRate}%`,
        icon: 'fas fa-shield-alt',
        gradient: 'from-red-500 to-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-600',
        trend: '-1.3%',
        trendUp: false,
        description: '차단된 스팸 댓글 비율'
      }
    ];

    // 프리미엄 헤더
    const header = Utils.createElement('div', 'mb-6');
    header.innerHTML = `
      <div class="flex items-center space-x-3 mb-4">
        <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
          <i class="fas fa-chart-bar text-white text-sm"></i>
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-900">핵심 성과 지표</h2>
          <p class="text-gray-600 text-sm">댓글 시스템의 주요 지표를 한눈에 확인하세요</p>
        </div>
      </div>
    `;

    // 반응형 그리드
    const grid = Utils.createElement('div', 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6');

    kpiCards.forEach(kpi => {
      const card = Utils.createElement('div', `bg-white rounded-xl shadow-lg border ${kpi.border} p-4 md:p-6 hover:shadow-xl transition-all duration-300 hover:scale-105`);
      card.innerHTML = `
        <div class="flex items-start justify-between">
          <!-- 왼쪽: 아이콘과 정보 -->
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-4">
              <div class="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br ${kpi.gradient} rounded-xl flex items-center justify-center shadow-lg">
                <i class="${kpi.icon} text-white text-lg md:text-xl"></i>
              </div>
              <div class="flex-1">
                <h3 class="text-xs md:text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">${kpi.title}</h3>
                <div class="text-2xl md:text-3xl font-bold ${kpi.text}">${kpi.value}</div>
              </div>
            </div>
            
            <!-- 설명 텍스트 -->
            <p class="text-xs text-gray-500 mb-3">${kpi.description}</p>
            
            <!-- 트렌드 정보 -->
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-1 ${kpi.trendUp ? 'text-green-600' : 'text-red-600'}">
                <i class="fas fa-arrow-${kpi.trendUp ? 'up' : 'down'} text-xs"></i>
                <span class="text-sm font-semibold">${kpi.trend}</span>
              </div>
              <span class="text-xs text-gray-500">vs 이전 기간</span>
            </div>
            
            <!-- 진행률 바 -->
            <div class="mt-4">
              <div class="w-full ${kpi.bg} h-2 rounded-full overflow-hidden">
                <div class="bg-gradient-to-r ${kpi.gradient} h-full rounded-full transition-all duration-500 animate-pulse" 
                     style="width: ${kpi.title.includes('스팸') ? spamRate : kpi.title.includes('승인') ? approvalRate : '85'}%"></div>
              </div>
            </div>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });

    section.appendChild(header);
    section.appendChild(grid);
    return section;
  }

  createChartsContainer() {
    const container = Utils.createElement('div', 'space-y-6 mb-6');

    // 댓글 트렌드 차트
    const trendChart = this.createChartCard('댓글 트렌드', 'commentsOverTimeChart', '시간에 따른 댓글 수 변화');
    container.appendChild(trendChart);

    // 차트 그리드
    const chartsGrid = Utils.createElement('div', 'grid grid-cols-1 lg:grid-cols-2 gap-6');
    
    // 사이트별 비교 차트
    const siteChart = this.createChartCard('사이트별 댓글 수', 'siteComparisonChart', '사이트 간 댓글 활동 비교');
    chartsGrid.appendChild(siteChart);
    
    // 시간대별 활동 차트
    const hourlyChart = this.createChartCard('시간대별 활동', 'hourlyActivityChart', '24시간 댓글 활동 패턴');
    chartsGrid.appendChild(hourlyChart);
    
    // 디바이스별 통계 차트
    const deviceChart = this.createChartCard('디바이스별 통계', 'deviceStatsChart', '사용자 디바이스 분포');
    chartsGrid.appendChild(deviceChart);
    
    // 지역별 통계 차트
    const geoChart = this.createChartCard('지역별 통계', 'geographicChart', '국가별 댓글 활동');
    chartsGrid.appendChild(geoChart);

    container.appendChild(chartsGrid);
    return container;
  }

  createChartCard(title, canvasId, description) {
    const card = Utils.createElement('div', 'bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300');
    
    // 아이콘 매핑
    const iconMap = {
      '댓글 트렌드': { icon: 'fas fa-chart-line', gradient: 'from-blue-500 to-indigo-600' },
      '사이트별 댓글 수': { icon: 'fas fa-sitemap', gradient: 'from-green-500 to-emerald-600' },
      '시간대별 활동': { icon: 'fas fa-clock', gradient: 'from-purple-500 to-purple-600' },
      '디바이스별 통계': { icon: 'fas fa-mobile-alt', gradient: 'from-orange-500 to-red-600' },
      '지역별 통계': { icon: 'fas fa-globe-americas', gradient: 'from-teal-500 to-cyan-600' }
    };
    
    const chartInfo = iconMap[title] || { icon: 'fas fa-chart-bar', gradient: 'from-gray-500 to-gray-600' };
    
    const header = Utils.createElement('div', 'p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50');
    header.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-gradient-to-br ${chartInfo.gradient} rounded-xl flex items-center justify-center shadow-lg">
          <i class="${chartInfo.icon} text-white text-lg"></i>
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-bold text-gray-900">${title}</h3>
          <p class="text-sm text-gray-600">${description}</p>
        </div>
        <div class="flex items-center space-x-2">
          <button class="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200" onclick="analyticsPage.exportChart('${canvasId}')" title="차트 내보내기">
            <i class="fas fa-download"></i>
          </button>
          <button class="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200" onclick="analyticsPage.refreshChart('${canvasId}')" title="차트 새로고침">
            <i class="fas fa-sync-alt"></i>
          </button>
        </div>
      </div>
    `;
    
    const body = Utils.createElement('div', 'p-6');
    body.innerHTML = `
      <div class="relative">
        <canvas id="${canvasId}" style="max-height: 400px; width: 100%;"></canvas>
        <div id="${canvasId}-loading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg" style="display: none;">
          <div class="flex items-center space-x-2 text-gray-600">
            <div class="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span class="text-sm">차트 로딩 중...</span>
          </div>
        </div>
      </div>
    `;
    
    card.appendChild(header);
    card.appendChild(body);
    
    return card;
  }

  createTablesSection() {
    const section = Utils.createElement('div', 'grid grid-cols-1 lg:grid-cols-2 gap-6');

    // 인기 페이지 테이블
    const popularPagesCard = this.createPopularPagesTable();
    section.appendChild(popularPagesCard);

    // 지역별 상세 테이블
    const geoDetailsCard = this.createGeographicTable();
    section.appendChild(geoDetailsCard);

    return section;
  }

  createPopularPagesTable() {
    const card = Utils.createElement('div', 'bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300');
    
    const header = Utils.createElement('div', 'p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50');
    header.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <i class="fas fa-fire text-white text-lg"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900">🔥 인기 페이지</h3>
            <p class="text-sm text-gray-600">댓글이 가장 많이 달린 페이지들을 확인하세요</p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            TOP ${this.analyticsData.popularPages.length}
          </span>
        </div>
      </div>
    `;
    
    const body = Utils.createElement('div', 'p-6');
    
    const tableContainer = Utils.createElement('div', 'overflow-x-auto');
    tableContainer.innerHTML = `
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-200">
            <th class="text-left py-3 px-4 font-semibold text-gray-700 bg-gray-50 rounded-tl-lg">순위</th>
            <th class="text-left py-3 px-4 font-semibold text-gray-700 bg-gray-50">페이지 정보</th>
            <th class="text-center py-3 px-4 font-semibold text-gray-700 bg-gray-50">댓글 수</th>
            <th class="text-center py-3 px-4 font-semibold text-gray-700 bg-gray-50">조회수</th>
            <th class="text-center py-3 px-4 font-semibold text-gray-700 bg-gray-50 rounded-tr-lg">참여도</th>
          </tr>
        </thead>
        <tbody>
          ${this.analyticsData.popularPages.map((page, index) => {
            const engagementRate = (page.comments / page.views * 100).toFixed(1);
            const rankColors = ['from-yellow-500 to-amber-600', 'from-gray-400 to-gray-500', 'from-orange-500 to-red-600'];
            const rankColor = rankColors[index] || 'from-blue-500 to-indigo-600';
            const rankEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';
            
            return `
              <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                <td class="py-4 px-4">
                  <div class="flex items-center space-x-2">
                    <div class="w-8 h-8 bg-gradient-to-br ${rankColor} rounded-lg flex items-center justify-center shadow-md">
                      <span class="text-white font-bold text-sm">${index + 1}</span>
                    </div>
                    <span class="text-lg">${rankEmoji}</span>
                  </div>
                </td>
                <td class="py-4 px-4">
                  <div class="max-w-xs">
                    <div class="font-semibold text-gray-900 text-sm truncate">${page.title}</div>
                    <div class="text-xs text-gray-500 truncate mt-1">${page.url}</div>
                  </div>
                </td>
                <td class="py-4 px-4 text-center">
                  <div class="flex flex-col items-center">
                    <span class="font-bold text-blue-600 text-lg">${Utils.formatNumber ? Utils.formatNumber(page.comments) : page.comments.toLocaleString()}</span>
                    <span class="text-xs text-gray-500">댓글</span>
                  </div>
                </td>
                <td class="py-4 px-4 text-center">
                  <div class="flex flex-col items-center">
                    <span class="font-semibold text-gray-700">${Utils.formatNumber ? Utils.formatNumber(page.views) : page.views.toLocaleString()}</span>
                    <span class="text-xs text-gray-500">조회</span>
                  </div>
                </td>
                <td class="py-4 px-4 text-center">
                  <div class="flex flex-col items-center space-y-2">
                    <div class="w-16 bg-gray-200 rounded-full h-2">
                      <div class="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500" 
                           style="width: ${Math.min(100, engagementRate * 10)}%"></div>
                    </div>
                    <div class="flex items-center space-x-1">
                      <span class="text-sm font-semibold text-green-600">${engagementRate}%</span>
                      <i class="fas fa-chart-line text-xs text-green-500"></i>
                    </div>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
    
    body.appendChild(tableContainer);
    card.appendChild(header);
    card.appendChild(body);
    
    return card;
  }

  createGeographicTable() {
    const card = Utils.createElement('div', 'bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300');
    
    const header = Utils.createElement('div', 'p-6 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-cyan-50');
    header.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
            <i class="fas fa-globe-americas text-white text-lg"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900">🌍 지역별 분석</h3>
            <p class="text-sm text-gray-600">국가별 댓글 활동 및 참여도를 확인하세요</p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <span class="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium">
            ${this.analyticsData.geographicData.length}개국
          </span>
        </div>
      </div>
    `;
    
    const body = Utils.createElement('div', 'p-6');
    
    const table = Utils.createElement('div', 'space-y-4');
    this.analyticsData.geographicData.forEach((country, index) => {
      const gradients = [
        'from-blue-500 to-indigo-600',
        'from-green-500 to-emerald-600', 
        'from-purple-500 to-purple-600',
        'from-orange-500 to-red-600'
      ];
      const gradient = gradients[index] || 'from-gray-500 to-gray-600';
      
      const item = Utils.createElement('div', 'bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300');
      item.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg">
              <span class="text-2xl">${this.getCountryFlag(country.country)}</span>
            </div>
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-1">
                <h4 class="font-bold text-gray-900 text-lg">${country.country}</h4>
                <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                  #${index + 1}
                </span>
              </div>
              <div class="flex items-center space-x-4 text-sm text-gray-600">
                <div class="flex items-center space-x-1">
                  <i class="fas fa-comments text-blue-500"></i>
                  <span class="font-semibold">${Utils.formatNumber ? Utils.formatNumber(country.comments) : country.comments.toLocaleString()}</span>
                  <span>댓글</span>
                </div>
                <div class="flex items-center space-x-1">
                  <i class="fas fa-percentage text-green-500"></i>
                  <span class="font-semibold text-green-600">${country.percentage}%</span>
                  <span>비율</span>
                </div>
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="mb-2">
              <span class="text-2xl font-bold text-gray-900">${country.percentage}%</span>
            </div>
            <div class="w-24 bg-gray-200 rounded-full h-3 overflow-hidden">
              <div class="bg-gradient-to-r ${gradient} h-full rounded-full transition-all duration-500 animate-pulse" 
                   style="width: ${country.percentage}%"></div>
            </div>
          </div>
        </div>
      `;
      table.appendChild(item);
    });
    
    body.appendChild(table);
    card.appendChild(header);
    card.appendChild(body);
    
    return card;
  }

  getCountryFlag(country) {
    const flags = {
      '대한민국': '🇰🇷',
      '미국': '🇺🇸',
      '일본': '🇯🇵',
      '기타': '🌍'
    };
    return flags[country] || '🌍';
  }

  async renderAllCharts() {
    if (!window.Chart) {
      console.warn('Chart.js가 로드되지 않아 차트를 렌더링할 수 없습니다.');
      this.renderChartFallbacks();
      return;
    }

    try {
      await this.renderCommentsOverTimeChart();
      await this.renderSiteComparisonChart();
      await this.renderHourlyActivityChart();
      await this.renderDeviceStatsChart();
      await this.renderGeographicChart();
    } catch (error) {
      console.error('차트 렌더링 실패:', error);
      Utils.showNotification('차트 렌더링 중 오류가 발생했습니다.', 'error');
    }
  }

  renderChartFallbacks() {
    // Chart.js 없이도 기본적인 정보 표시
    const chartIds = ['commentsOverTimeChart', 'siteComparisonChart', 'hourlyActivityChart', 'deviceStatsChart', 'geographicChart'];
    
    chartIds.forEach(id => {
      const canvas = Utils.$(`#${id}`);
      if (canvas) {
        const parent = canvas.parentElement;
        parent.innerHTML = `
          <div class="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
            <div class="text-center">
              <i class="fas fa-chart-bar text-4xl text-gray-400 mb-4"></i>
              <p class="text-gray-500">차트를 로드할 수 없습니다</p>
              <p class="text-sm text-gray-400">네트워크 연결을 확인해주세요</p>
            </div>
          </div>
        `;
      }
    });
  }

  async renderCommentsOverTimeChart() {
    const ctx = Utils.$('#commentsOverTimeChart').getContext('2d');
    
    const data = this.analyticsData.commentsOverTime;
    
    this.charts.commentsOverTime = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => new Date(d.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })),
        datasets: [
          {
            label: '총 댓글',
            data: data.map(d => d.comments),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: '승인된 댓글',
            data: data.map(d => d.approved),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: '스팸',
            data: data.map(d => d.spam),
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          }
        },
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    });
  }

  async renderSiteComparisonChart() {
    const ctx = Utils.$('#siteComparisonChart').getContext('2d');
    
    const data = this.analyticsData.siteComparison;
    
    this.charts.siteComparison = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(s => s.name),
        datasets: [
          {
            label: '댓글 수',
            data: data.map(s => s.comments),
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: '#3b82f6',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              afterBody: function(context) {
                const index = context[0].dataIndex;
                const siteData = data[index];
                return [
                  `사용자: ${Utils.formatNumber(siteData.users)}명`,
                  `참여도: ${siteData.engagement}%`
                ];
              }
            }
          }
        }
      }
    });
  }

  async renderHourlyActivityChart() {
    const ctx = Utils.$('#hourlyActivityChart').getContext('2d');
    
    const data = this.analyticsData.commentsByHour;
    
    this.charts.hourlyActivity = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(h => `${h.hour}:00`),
        datasets: [
          {
            label: '댓글 수',
            data: data.map(h => h.comments),
            backgroundColor: data.map(h => {
              // 시간대별 색상 변화
              const intensity = h.comments / Math.max(...data.map(d => d.comments));
              return `rgba(16, 185, 129, ${0.3 + intensity * 0.7})`;
            }),
            borderColor: '#10b981',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  async renderDeviceStatsChart() {
    const ctx = Utils.$('#deviceStatsChart').getContext('2d');
    
    const data = this.analyticsData.deviceStats;
    
    this.charts.deviceStats = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['데스크톱', '모바일', '태블릿'],
        datasets: [
          {
            data: [data.desktop, data.mobile, data.tablet],
            backgroundColor: [
              '#3b82f6',
              '#10b981',
              '#f59e0b'
            ],
            borderColor: [
              '#2563eb',
              '#059669',
              '#d97706'
            ],
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value}% (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  async renderGeographicChart() {
    const ctx = Utils.$('#geographicChart').getContext('2d');
    
    const data = this.analyticsData.geographicData;
    
    this.charts.geographic = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: data.map(c => c.country),
        datasets: [
          {
            data: data.map(c => c.comments),
            backgroundColor: [
              '#3b82f6',
              '#10b981',
              '#f59e0b',
              '#ef4444'
            ],
            borderColor: '#ffffff',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${Utils.formatNumber(value)} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  async refreshAnalytics() {
    if (this.destroyed) return;
    
    // 안전한 차트 제거
    this.destroyAllCharts();

    // 페이지 다시 렌더링
    await this.render();
  }
  
  // 메모리 누수 방지를 위한 차트 정리
  destroyAllCharts() {
    try {
      Object.values(this.charts).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
          chart.destroy();
        }
      });
    } catch (error) {
      console.warn('차트 제거 오류:', error);
    } finally {
      this.charts = {};
    }
  }

  async refreshData() {
    Utils.showNotification('데이터를 새로고침하는 중...', 'info');
    await this.refreshAnalytics();
    Utils.showNotification('데이터가 새로고침되었습니다.', 'success');
  }

  exportReport() {
    Utils.showNotification('보고서 내보내기 기능은 곧 제공될 예정입니다.', 'info');
  }

  createErrorState() {
    return Components.createEmptyState(
      '데이터 로딩 실패',
      '분석 데이터를 불러오는 중 오류가 발생했습니다.',
      '다시 시도',
      () => this.render()
    );
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
    
    // 차트 인스턴스 정리
    this.destroyAllCharts();
    
    // 이벤트 리스너 제거
    for (const [key, listener] of this.eventListeners) {
      listener.element.removeEventListener(listener.eventType, listener.handler, listener.options);
    }
    this.eventListeners.clear();
    
    console.log('AnalyticsPage destroyed and cleaned up');
  }

  // 차트 내보내기 기능
  exportChart(chartId) {
    try {
      const canvas = Utils.$(`#${chartId}`);
      if (canvas) {
        const link = document.createElement('a');
        link.download = `${chartId}_${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL();
        link.click();
        Utils.showNotification('차트가 다운로드되었습니다.', 'success');
      }
    } catch (error) {
      console.error('차트 내보내기 실패:', error);
      Utils.showNotification('차트 내보내기에 실패했습니다.', 'error');
    }
  }

  // 개별 차트 새로고침
  async refreshChart(chartId) {
    if (this.destroyed) return;
    
    try {
      const loadingEl = Utils.$(`#${chartId}-loading`);
      if (loadingEl) {
        loadingEl.style.display = 'flex';
      }

      // 안전한 차트 제거
      const chartInstance = Object.values(this.charts).find(chart => 
        chart && chart.canvas && chart.canvas.id === chartId
      );
      if (chartInstance && typeof chartInstance.destroy === 'function') {
        try {
          chartInstance.destroy();
        } catch (destroyError) {
          console.warn(`차트 ${chartId} 제거 오류:`, destroyError);
        }
      }

      // 차트 다시 렌더링 (디바운스)
      setTimeout(async () => {
        if (!this.destroyed) {
          await this.renderSpecificChart(chartId);
          if (loadingEl) {
            loadingEl.style.display = 'none';
          }
          Utils.showNotification('차트가 새로고침되었습니다.', 'success');
        }
      }, 300);

    } catch (error) {
      console.error('차트 새로고침 실패:', error);
      Utils.showNotification('차트 새로고침에 실패했습니다.', 'error');
    }
  }

  // 특정 차트만 렌더링
  async renderSpecificChart(chartId) {
    if (!window.Chart) return;

    try {
      switch (chartId) {
        case 'commentsOverTimeChart':
          await this.renderCommentsOverTimeChart();
          break;
        case 'siteComparisonChart':
          await this.renderSiteComparisonChart();
          break;
        case 'hourlyActivityChart':
          await this.renderHourlyActivityChart();
          break;
        case 'deviceStatsChart':
          await this.renderDeviceStatsChart();
          break;
        case 'geographicChart':
          await this.renderGeographicChart();
          break;
      }
    } catch (error) {
      console.error(`차트 ${chartId} 렌더링 실패:`, error);
    }
  }

  // 고급 필터 모달 표시
  showAdvancedFilters() {
    Utils.showNotification('고급 필터 기능은 곧 제공될 예정입니다.', 'info');
  }

  // 빠른 필터 적용
  applyQuickFilter(filterType) {
    const filters = {
      'trending': '인기 트렌드 필터가 적용되었습니다.',
      'growth': '성장률 필터가 적용되었습니다.',
      'engagement': '참여도 필터가 적용되었습니다.',
      'spam': '스팸 분석 필터가 적용되었습니다.'
    };
    
    const message = filters[filterType] || '필터가 적용되었습니다.';
    Utils.showNotification(message, 'success');
    
    // 실제로는 필터링 로직 구현
    // this.applyFilterAndRefresh(filterType);
  }
}

// 전역으로 사용할 수 있도록 export
window.AnalyticsPage = AnalyticsPage;