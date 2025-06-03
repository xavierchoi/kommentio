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
    if (window.Chart) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js';
      script.onload = () => {
        console.log('Chart.js 로드 완료');
        resolve();
      };
      script.onerror = (error) => {
        console.error('Chart.js 로드 실패:', error);
        // Chart.js 로드 실패시 대체 처리
        this.showChartLoadError();
        resolve(); // 에러여도 계속 진행
      };
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
    const header = Utils.createElement('div', 'flex items-center justify-between mb-6');
    
    header.innerHTML = `
      <div>
        <h1 class="text-3xl font-bold text-gray-900">분석</h1>
        <p class="text-gray-600 mt-2">댓글 시스템의 성과와 사용자 참여도를 분석하세요</p>
      </div>
      <div class="flex gap-3">
        <button class="btn btn-secondary" onclick="analyticsPage.exportReport()">
          <i class="fas fa-download"></i> 보고서 내보내기
        </button>
        <button class="btn btn-primary" onclick="analyticsPage.refreshData()">
          <i class="fas fa-sync-alt"></i> 새로고침
        </button>
      </div>
    `;
    
    return header;
  }

  createFiltersSection() {
    const section = Utils.createElement('div', 'card mb-6');
    const body = Utils.createElement('div', 'card-body');
    
    body.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- 기간 선택 -->
        <div>
          <label class="input-label">분석 기간</label>
          <select class="input" id="dateRangeFilter">
            <option value="7d" ${this.dateRange === '7d' ? 'selected' : ''}>최근 7일</option>
            <option value="30d" ${this.dateRange === '30d' ? 'selected' : ''}>최근 30일</option>
            <option value="90d" ${this.dateRange === '90d' ? 'selected' : ''}>최근 90일</option>
            <option value="1y" ${this.dateRange === '1y' ? 'selected' : ''}>최근 1년</option>
          </select>
        </div>
        
        <!-- 사이트 선택 -->
        <div>
          <label class="input-label">사이트</label>
          <select class="input" id="siteFilter">
            <option value="all" ${this.selectedSite === 'all' ? 'selected' : ''}>모든 사이트</option>
            ${this.sites.map(site => 
              `<option value="${site.id}" ${this.selectedSite == site.id ? 'selected' : ''}>
                ${site.name}
              </option>`
            ).join('')}
          </select>
        </div>
        
        <!-- 업데이트 정보 -->
        <div>
          <label class="input-label">마지막 업데이트</label>
          <div class="text-sm text-gray-600 pt-2">
            <i class="fas fa-clock"></i> ${new Date().toLocaleString('ko-KR')}
          </div>
        </div>
      </div>
    `;
    
    section.appendChild(body);
    
    // 이벤트 리스너
    Utils.on(Utils.$('#dateRangeFilter'), 'change', (e) => {
      this.dateRange = e.target.value;
      this.refreshAnalytics();
    });
    
    Utils.on(Utils.$('#siteFilter'), 'change', (e) => {
      this.selectedSite = e.target.value;
      this.refreshAnalytics();
    });
    
    return section;
  }

  createKPISection() {
    const section = Utils.createElement('div', 'mb-6');
    const grid = Utils.createElement('div', 'stats-grid');

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
        value: Utils.formatNumber(totalComments),
        icon: 'fas fa-comments',
        color: 'blue',
        trend: '+12.5%'
      },
      {
        title: '일평균 댓글',
        value: Utils.formatNumber(avgDaily),
        icon: 'fas fa-chart-line',
        color: 'green',
        trend: '+8.2%'
      },
      {
        title: '승인률',
        value: `${approvalRate}%`,
        icon: 'fas fa-check-circle',
        color: 'purple',
        trend: '+2.1%'
      },
      {
        title: '스팸 차단률',
        value: `${spamRate}%`,
        icon: 'fas fa-shield-alt',
        color: 'red',
        trend: '-1.3%'
      }
    ];

    kpiCards.forEach(kpi => {
      const card = Utils.createElement('div', 'stat-card');
      card.innerHTML = `
        <div class="stat-card-content">
          <div class="stat-card-info">
            <h3>${kpi.title}</h3>
            <div class="stat-card-value">${kpi.value}</div>
            <div class="text-xs mt-1 ${kpi.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}">
              <i class="fas fa-arrow-${kpi.trend.startsWith('+') ? 'up' : 'down'}"></i>
              ${kpi.trend} vs 이전 기간
            </div>
          </div>
          <div class="stat-card-icon ${kpi.color}">
            <i class="${kpi.icon}"></i>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });

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
    const card = Utils.createElement('div', 'card');
    
    const header = Utils.createElement('div', 'card-header');
    header.innerHTML = `
      <div>
        <h3 class="text-lg font-semibold text-gray-900">${title}</h3>
        <p class="text-sm text-gray-500">${description}</p>
      </div>
    `;
    
    const body = Utils.createElement('div', 'card-body');
    const canvas = Utils.createElement('canvas', '', '');
    canvas.id = canvasId;
    canvas.style.maxHeight = '400px';
    
    body.appendChild(canvas);
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
    const card = Utils.createElement('div', 'card');
    
    const header = Utils.createElement('div', 'card-header');
    header.innerHTML = `
      <h3 class="text-lg font-semibold text-gray-900">인기 페이지</h3>
    `;
    
    const body = Utils.createElement('div', 'card-body');
    
    const table = Utils.createElement('div', 'overflow-x-auto');
    table.innerHTML = `
      <table class="table">
        <thead>
          <tr>
            <th>페이지</th>
            <th>댓글 수</th>
            <th>조회수</th>
            <th>참여도</th>
          </tr>
        </thead>
        <tbody>
          ${this.analyticsData.popularPages.map(page => `
            <tr>
              <td>
                <div>
                  <div class="font-medium text-gray-900">${page.title}</div>
                  <div class="text-sm text-gray-500">${page.url}</div>
                </div>
              </td>
              <td class="font-medium">${Utils.formatNumber(page.comments)}</td>
              <td>${Utils.formatNumber(page.views)}</td>
              <td>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-blue-600 h-2 rounded-full" style="width: ${(page.comments / page.views * 100).toFixed(1)}%"></div>
                </div>
                <span class="text-xs text-gray-500">${(page.comments / page.views * 100).toFixed(1)}%</span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
    body.appendChild(table);
    card.appendChild(header);
    card.appendChild(body);
    
    return card;
  }

  createGeographicTable() {
    const card = Utils.createElement('div', 'card');
    
    const header = Utils.createElement('div', 'card-header');
    header.innerHTML = `
      <h3 class="text-lg font-semibold text-gray-900">지역별 상세</h3>
    `;
    
    const body = Utils.createElement('div', 'card-body');
    
    const table = Utils.createElement('div', 'space-y-3');
    this.analyticsData.geographicData.forEach(country => {
      const item = Utils.createElement('div', 'flex items-center justify-between');
      item.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="text-2xl">${this.getCountryFlag(country.country)}</div>
          <div>
            <div class="font-medium text-gray-900">${country.country}</div>
            <div class="text-sm text-gray-500">${Utils.formatNumber(country.comments)} 댓글</div>
          </div>
        </div>
        <div class="text-right">
          <div class="font-medium">${country.percentage}%</div>
          <div class="w-20 bg-gray-200 rounded-full h-2 mt-1">
            <div class="bg-blue-600 h-2 rounded-full" style="width: ${country.percentage}%"></div>
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
    // 기존 차트들 제거
    Object.values(this.charts).forEach(chart => {
      if (chart) chart.destroy();
    });
    this.charts = {};

    // 페이지 다시 렌더링
    await this.render();
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
}

// 전역으로 사용할 수 있도록 export
window.AnalyticsPage = AnalyticsPage;