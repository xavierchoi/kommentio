// Kommentio Admin Dashboard - Sites Management Page

class SitesPage {
  constructor() {
    this.sites = [];
    this.filteredSites = [];
    this.searchQuery = '';
    this.eventListeners = new Map();
    this.destroyed = false;
    this.searchTimeout = null;
  }

  async render() {
    const container = Utils.$('#page-sites');
    container.innerHTML = '';

    // 페이지 헤더
    const header = this.createPageHeader();
    container.appendChild(header);

    // 검색 섹션
    const searchSection = this.createSearchSection();
    container.appendChild(searchSection);

    // 로딩 표시
    Utils.showLoading(container);

    try {
      // 사이트 데이터 로드
      await this.loadSites();

      // 사이트 그리드
      const sitesGrid = this.createSitesGrid();
      container.appendChild(sitesGrid);

    } catch (error) {
      console.error('사이트 데이터 로딩 실패:', error);
      container.appendChild(this.createErrorState());
    } finally {
      Utils.hideLoading(container);
    }
  }

  async loadSites() {
    try {
      const sitesData = await window.apiService.getSites();
      
      // 각 사이트의 댓글 수와 마지막 활동 계산
      this.sites = await Promise.all(sitesData.map(async (site) => {
        try {
          // 댓글 수 조회를 더 간단하게 처리
          let commentsCount = 0;
          let lastActivity = '활동 없음';
          
          try {
            const comments = await window.apiService.getComments(site.id, { limit: 1 });
            if (comments && typeof comments.total === 'number') {
              commentsCount = comments.total;
            }
          } catch (commentsError) {
            console.warn(`사이트 ${site.name}의 댓글 수 조회 실패:`, commentsError);
          }
          
          try {
            const recentComments = await window.apiService.getRecentComments(10);
            const siteRecentComment = recentComments.find(c => c.site_id === site.id);
            if (siteRecentComment) {
              lastActivity = Utils.formatDateTime(siteRecentComment.created_at);
            }
          } catch (recentError) {
            console.warn(`사이트 ${site.name}의 최근 활동 조회 실패:`, recentError);
          }
          
          return {
            id: site.id,
            name: site.name,
            domain: site.domain,
            description: site.description || '설명 없음',
            commentsCount: commentsCount,
            status: site.status,
            createdAt: Utils.formatDate(site.created_at),
            lastActivity: lastActivity
          };
        } catch (error) {
          console.warn(`사이트 ${site.name} 데이터 처리 실패:`, error);
          return {
            id: site.id,
            name: site.name,
            domain: site.domain,
            description: site.description || '설명 없음',
            commentsCount: 0,
            status: site.status,
            createdAt: Utils.formatDate(site.created_at),
            lastActivity: '알 수 없음'
          };
        }
      }));

      this.filteredSites = [...this.sites];
    } catch (error) {
      console.error('사이트 데이터 로딩 실패:', error);
      this.sites = [];
      this.filteredSites = [];
      throw error;
    }
  }

  createPageHeader() {
    const header = Utils.createElement('div', 'mb-8');
    header.innerHTML = `
      <div class="flex flex-col gap-6">
        <!-- 메인 타이틀 -->
        <div class="flex items-center space-x-3 md:space-x-4">
          <div class="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl">
            <i class="fas fa-globe text-white text-xl md:text-2xl"></i>
          </div>
          <div class="flex-1">
            <h1 class="text-2xl md:text-3xl font-bold text-gray-900">사이트 관리</h1>
            <p class="text-gray-600 mt-1 text-sm md:text-base">댓글 시스템이 설치된 사이트들을 효율적으로 관리하세요</p>
          </div>
        </div>
        
        <!-- 통계 및 액션 버튼들 -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <!-- 사이트 통계 -->
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200 w-fit">
              <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span class="text-green-700 text-sm font-medium">총 ${this.sites.length}개 사이트</span>
            </div>
            <div class="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200 w-fit">
              <i class="fas fa-check-circle text-blue-500"></i>
              <span class="text-blue-700 text-sm font-medium">${this.sites.filter(s => s.status === 'active').length}개 활성화</span>
            </div>
          </div>
          
          <!-- 액션 버튼들 -->
          <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button class="w-full sm:w-auto px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center sm:justify-start space-x-2 shadow-sm min-h-[44px]" onclick="sitesPage.exportSitesList()">
              <i class="fas fa-download"></i>
              <span class="hidden sm:inline">목록 내보내기</span>
              <span class="sm:hidden">내보내기</span>
            </button>
            <button class="w-full sm:w-auto px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center sm:justify-start space-x-2 shadow-sm min-h-[44px]" onclick="sitesPage.showBulkActions()">
              <i class="fas fa-tasks"></i>
              <span class="hidden sm:inline">일괄 처리</span>
              <span class="sm:hidden">일괄처리</span>
            </button>
            <button id="add-site-btn" class="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg min-h-[44px]" onclick="sitesPage.showAddSiteModal()">
              <i class="fas fa-plus"></i>
              <span>새 사이트 추가</span>
            </button>
          </div>
        </div>
      </div>
    `;
    
    return header;
  }

  createSearchSection() {
    const section = Utils.createElement('div', 'bg-white rounded-xl shadow-lg border border-gray-200 mb-8');
    
    const header = Utils.createElement('div', 'p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50');
    header.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
          <i class="fas fa-search text-white text-sm"></i>
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-900">사이트 검색 및 필터</h2>
          <p class="text-gray-600 text-sm">이름, 도메인 또는 상태로 사이트를 찾아보세요</p>
        </div>
      </div>
    `;
    
    const body = Utils.createElement('div', 'p-6');
    body.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 검색 입력 -->
        <div class="lg:col-span-2">
          <label class="block text-sm font-semibold text-gray-700 mb-2">🔍 검색</label>
          <div class="relative">
            <input type="text" id="search-sites" 
                   placeholder="사이트 이름이나 도메인으로 검색..." 
                   class="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-h-[44px]">
            <div class="absolute left-4 top-1/2 transform -translate-y-1/2">
              <i class="fas fa-search text-gray-400"></i>
            </div>
          </div>
        </div>
        
        <!-- 상태 필터 -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">📊 상태 필터</label>
          <select id="status-filter" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-h-[44px]">
            <option value="all">모든 상태</option>
            <option value="active">활성화</option>
            <option value="inactive">비활성화</option>
          </select>
        </div>
      </div>
      
      <!-- 빠른 필터 버튼들 -->
      <div class="mt-6 pt-6 border-t border-gray-200">
        <h3 class="text-sm font-semibold text-gray-700 mb-3">빠른 필터</h3>
        <div class="flex flex-wrap gap-2">
          <button class="px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors" onclick="sitesPage.applyQuickFilter('recent')">
            🆕 최근 생성
          </button>
          <button class="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors" onclick="sitesPage.applyQuickFilter('active')">
            ✅ 활성 사이트
          </button>
          <button class="px-3 py-2 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors" onclick="sitesPage.applyQuickFilter('popular')">
            🔥 인기 사이트
          </button>
          <button class="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors" onclick="sitesPage.applyQuickFilter('issues')">
            ⚠️ 문제 발생
          </button>
        </div>
      </div>
    `;
    
    section.appendChild(header);
    section.appendChild(body);
    
    // 이벤트 리스너 설정 (추적 가능)
    setTimeout(() => {
      const searchInput = Utils.$('#search-sites');
      const statusFilter = Utils.$('#status-filter');
      
      if (searchInput) {
        const searchHandler = (e) => {
          if (!this.destroyed) {
            this.debouncedSearch(e.target.value, statusFilter.value);
          }
        };
        this.addEventListenerWithTracking(searchInput, 'input', searchHandler);
      }
      
      if (statusFilter) {
        const filterHandler = (e) => {
          if (!this.destroyed) {
            this.handleSearch(searchInput.value, e.target.value);
          }
        };
        this.addEventListenerWithTracking(statusFilter, 'change', filterHandler);
      }
    }, 100);
    
    return section;
  }

  createSitesGrid() {
    const grid = Utils.createElement('div', 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6');
    
    if (this.filteredSites.length === 0) {
      const emptyState = Components.createEmptyState(
        this.searchQuery ? '검색 결과가 없습니다' : '등록된 사이트가 없습니다',
        this.searchQuery ? '다른 검색어를 시도해보세요' : '첫 번째 사이트를 추가해보세요',
        this.searchQuery ? '' : '새 사이트 추가',
        this.searchQuery ? null : () => this.showAddSiteModal()
      );
      
      const emptyContainer = Utils.createElement('div', 'col-span-full');
      emptyContainer.appendChild(emptyState);
      grid.appendChild(emptyContainer);
    } else {
      this.filteredSites.forEach(site => {
        const siteCard = this.createSiteCard(site);
        grid.appendChild(siteCard);
      });
    }
    
    return grid;
  }

  createSiteCard(site) {
    const card = Utils.createElement('div', 'bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105');
    
    const statusColor = site.status === 'active' ? 'green' : 'red';
    const statusGradient = site.status === 'active' ? 'from-green-500 to-emerald-600' : 'from-red-500 to-red-600';
    const statusBg = site.status === 'active' ? 'bg-green-50' : 'bg-red-50';
    const statusText = site.status === 'active' ? 'text-green-700' : 'text-red-700';
    const statusBorder = site.status === 'active' ? 'border-green-200' : 'border-red-200';
    
    card.innerHTML = `
      <!-- 헤더 -->
      <div class="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50">
        <div class="flex items-start justify-between">
          <div class="flex items-start space-x-4">
            <div class="w-12 h-12 bg-gradient-to-br ${statusGradient} rounded-xl flex items-center justify-center shadow-lg">
              <i class="fas fa-globe text-white text-lg"></i>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-bold text-gray-900 mb-1">${site.name}</h3>
              <div class="flex items-center space-x-2">
                <i class="fas fa-link text-gray-400 text-sm"></i>
                <a href="https://${site.domain}" target="_blank" class="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                  ${site.domain}
                </a>
                <i class="fas fa-external-link-alt text-gray-400 text-xs"></i>
              </div>
            </div>
          </div>
          <div class="flex flex-col items-end space-y-2">
            <span class="px-3 py-1 ${statusBg} ${statusText} rounded-full text-xs font-semibold border ${statusBorder}">
              ${site.status === 'active' ? '🟢 활성화' : '🔴 비활성화'}
            </span>
            <div class="flex items-center space-x-1">
              <i class="fas fa-comments text-blue-500 text-sm"></i>
              <span class="text-sm font-semibold text-gray-700">${Utils.formatNumber ? Utils.formatNumber(site.commentsCount) : site.commentsCount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 바디 -->
      <div class="p-6">
        <!-- 설명 -->
        <div class="mb-6">
          <p class="text-sm text-gray-600 leading-relaxed">${site.description}</p>
        </div>
        
        <!-- 통계 카드들 -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <i class="fas fa-calendar text-white text-sm"></i>
              </div>
              <div>
                <p class="text-xs text-blue-600 font-semibold uppercase tracking-wide">생성일</p>
                <p class="text-sm font-bold text-blue-800">${site.createdAt}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <i class="fas fa-clock text-white text-sm"></i>
              </div>
              <div>
                <p class="text-xs text-green-600 font-semibold uppercase tracking-wide">마지막 활동</p>
                <p class="text-sm font-bold text-green-800">${site.lastActivity === '활동 없음' ? '없음' : '최근'}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 상세 정보 -->
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <i class="fas fa-comments text-gray-400"></i>
                <span class="text-sm text-gray-600">총 댓글 수</span>
              </div>
              <span class="text-sm font-bold text-gray-900">${Utils.formatNumber ? Utils.formatNumber(site.commentsCount) : site.commentsCount.toLocaleString()}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <i class="fas fa-chart-line text-gray-400"></i>
                <span class="text-sm text-gray-600">참여도</span>
              </div>
              <span class="text-sm font-bold ${site.commentsCount > 100 ? 'text-green-600' : site.commentsCount > 10 ? 'text-yellow-600' : 'text-gray-600'}">
                ${site.commentsCount > 100 ? '높음' : site.commentsCount > 10 ? '보통' : '낮음'}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <i class="fas fa-history text-gray-400"></i>
                <span class="text-sm text-gray-600">마지막 활동</span>
              </div>
              <span class="text-sm font-bold text-gray-900">${site.lastActivity}</span>
            </div>
          </div>
        </div>
        
        <!-- 액션 버튼들 -->
        <div class="flex flex-col sm:flex-row gap-2">
          <button class="flex-1 px-4 py-3 ${site.status === 'active' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'} rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg font-semibold" 
                  onclick="sitesPage.toggleSiteStatus(${site.id})">
            <i class="fas ${site.status === 'active' ? 'fa-pause' : 'fa-play'}"></i>
            <span>${site.status === 'active' ? '비활성화' : '활성화'}</span>
          </button>
          <button class="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg font-semibold" 
                  onclick="sitesPage.editSite(${site.id})">
            <i class="fas fa-cog"></i>
            <span>설정</span>
          </button>
          <button class="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center shadow-lg" 
                  onclick="sitesPage.viewSiteDetails(${site.id})" title="상세 보기">
            <i class="fas fa-external-link-alt"></i>
          </button>
        </div>
      </div>
    `;
    
    return card;
  }

  // 성능 최적화된 검색 처리
  debouncedSearch(query, statusFilter = 'all') {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    this.searchTimeout = setTimeout(() => {
      if (!this.destroyed) {
        this.handleSearch(query, statusFilter);
      }
    }, 300);
  }

  handleSearch(query, statusFilter = 'all') {
    if (this.destroyed) return;
    
    this.searchQuery = query.toLowerCase();
    
    // 성능 최적화된 필터링
    this.filteredSites = this.sites.filter(site => {
      // 캐시된 lowercase 값 사용
      const siteNameLower = site.nameLower || (site.nameLower = site.name.toLowerCase());
      const siteDomainLower = site.domainLower || (site.domainLower = site.domain.toLowerCase());
      const siteDescLower = site.descLower || (site.descLower = site.description.toLowerCase());
      
      const matchesSearch = !this.searchQuery || 
                           siteNameLower.includes(this.searchQuery) ||
                           siteDomainLower.includes(this.searchQuery) ||
                           siteDescLower.includes(this.searchQuery);
      
      const matchesStatus = statusFilter === 'all' || site.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
    
    // 부분 업데이트로 성능 개선
    this.updateSitesGrid();
  }
  
  // 효율적인 그리드 업데이트
  updateSitesGrid() {
    const existingGrid = Utils.$('.grid');
    if (existingGrid) {
      const newGrid = this.createSitesGrid();
      existingGrid.parentNode.replaceChild(newGrid, existingGrid);
    }
  }

  showAddSiteModal() {
    const modalContent = Utils.createElement('div');
    modalContent.style.cssText = `
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      line-height: 1.6 !important;
    `;
    
    modalContent.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%) !important;
        border-radius: 12px !important;
        padding: 24px !important;
        border: 1px solid #bae6fd !important;
        margin-bottom: 24px !important;
      ">
        <div style="
          display: flex !important;
          align-items: center !important;
          margin-bottom: 20px !important;
        ">
          <div style="
            width: 48px !important;
            height: 48px !important;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
            border-radius: 12px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            margin-right: 16px !important;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3) !important;
          ">
            <span style="color: white !important; font-size: 20px !important;">🌐</span>
          </div>
          <div style="flex: 1 !important;">
            <h3 style="
              font-size: 20px !important;
              font-weight: 700 !important;
              color: #1e293b !important;
              margin: 0 0 4px 0 !important;
              line-height: 1.4 !important;
            ">새 사이트 추가</h3>
            <p style="
              font-size: 14px !important;
              color: #64748b !important;
              margin: 0 !important;
              line-height: 1.4 !important;
            ">댓글 시스템을 새로운 사이트에 설치하세요</p>
          </div>
        </div>
      </div>
      
      <div style="margin-bottom: 20px !important;">
        <label style="
          display: block !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          color: #374151 !important;
          margin-bottom: 8px !important;
        ">🏷️ 사이트 이름</label>
        <input type="text" id="siteName" placeholder="예: 개인 블로그, 회사 웹사이트"
               style="
          width: 100% !important;
          padding: 12px 16px !important;
          border: 1px solid #d1d5db !important;
          border-radius: 8px !important;
          font-size: 14px !important;
          line-height: 1.5 !important;
          box-sizing: border-box !important;
          background: white !important;
          color: #374151 !important;
          font-family: inherit !important;
        ">
        <p style="
          font-size: 12px !important;
          color: #6b7280 !important;
          margin-top: 4px !important;
          margin-bottom: 0 !important;
        ">사용자가 쉽게 식별할 수 있는 이름을 입력하세요</p>
      </div>
      
      <div style="margin-bottom: 20px !important;">
        <label style="
          display: block !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          color: #374151 !important;
          margin-bottom: 8px !important;
        ">🔗 도메인</label>
        <input type="text" id="siteDomain" placeholder="example.com (프로토콜 제외)"
               style="
          width: 100% !important;
          padding: 12px 16px !important;
          border: 1px solid #d1d5db !important;
          border-radius: 8px !important;
          font-size: 14px !important;
          line-height: 1.5 !important;
          box-sizing: border-box !important;
          background: white !important;
          color: #374151 !important;
          font-family: inherit !important;
        ">
        <p style="
          font-size: 12px !important;
          color: #6b7280 !important;
          margin-top: 4px !important;
          margin-bottom: 0 !important;
        ">https:// 없이 도메인만 입력하세요 (예: myblog.com)</p>
      </div>
      
      <div style="margin-bottom: 20px !important;">
        <label style="
          display: block !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          color: #374151 !important;
          margin-bottom: 8px !important;
        ">📝 설명 (선택사항)</label>
        <textarea id="siteDescription" rows="3" placeholder="사이트에 대한 간단한 설명을 입력하세요..."
                  style="
          width: 100% !important;
          padding: 12px 16px !important;
          border: 1px solid #d1d5db !important;
          border-radius: 8px !important;
          font-size: 14px !important;
          line-height: 1.5 !important;
          resize: none !important;
          box-sizing: border-box !important;
          background: white !important;
          color: #374151 !important;
          font-family: inherit !important;
        "></textarea>
        <p style="
          font-size: 12px !important;
          color: #6b7280 !important;
          margin-top: 4px !important;
          margin-bottom: 0 !important;
        ">나중에 대시보드에서 사이트를 쉽게 구분할 수 있습니다</p>
      </div>

      <div style="
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%) !important;
        border-radius: 8px !important;
        padding: 16px !important;
        border: 1px solid #f59e0b !important;
        margin-bottom: 20px !important;
      ">
        <div style="
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          margin-bottom: 8px !important;
        ">
          <span style="font-size: 16px !important;">💡</span>
          <span style="
            font-size: 14px !important;
            font-weight: 600 !important;
            color: #92400e !important;
          ">설치 가이드</span>
        </div>
        <p style="
          color: #92400e !important;
          font-size: 13px !important;
          line-height: 1.4 !important;
          margin: 0 !important;
        ">사이트 추가 후 생성되는 임베드 코드를 복사하여 웹사이트에 붙여넣으세요. 설치 방법은 설정 페이지에서 확인할 수 있습니다.</p>
      </div>
    `;

    const modal = Components.createModal('새 사이트 추가', modalContent, [
      {
        text: '취소',
        class: 'btn-secondary',
        onclick: () => Components.closeModal(modal)
      },
      {
        text: '사이트 추가',
        class: 'btn-primary',
        onclick: () => this.handleAddSite(modal)
      }
    ]);
    
    Components.showModal(modal);
  }

  async handleAddSite(modal) {
    const siteName = Utils.$('#siteName').value.trim();
    const siteDomain = Utils.$('#siteDomain').value.trim();
    const siteDescription = Utils.$('#siteDescription').value.trim();
    
    if (!siteName || !siteDomain) {
      Utils.showNotification('사이트 이름과 도메인을 모두 입력해주세요.', 'error');
      return;
    }

    try {
      // API를 통해 새 사이트 생성
      const newSiteData = {
        name: siteName,
        domain: siteDomain,
        description: siteDescription
      };

      const createdSite = await window.apiService.createSite(newSiteData);
      
      // 로컬 데이터 업데이트
      const newSite = {
        id: createdSite.id,
        name: createdSite.name,
        domain: createdSite.domain,
        description: createdSite.description,
        commentsCount: 0,
        status: createdSite.status,
        createdAt: Utils.formatDate(createdSite.created_at),
        lastActivity: '활동 없음'
      };
      
      this.sites.push(newSite);
      this.filteredSites = [...this.sites];
      
      Components.closeModal(modal);
      Utils.showNotification('새 사이트가 성공적으로 추가되었습니다.', 'success');
      
      // 사이트 그리드 다시 렌더링
      const existingGrid = Utils.$('.grid');
      if (existingGrid) {
        const newGrid = this.createSitesGrid();
        existingGrid.parentNode.replaceChild(newGrid, existingGrid);
      }
    } catch (error) {
      console.error('사이트 추가 실패:', error);
      Utils.showNotification('사이트 추가에 실패했습니다. 다시 시도해주세요.', 'error');
    }
  }

  async toggleSiteStatus(siteId) {
    const site = this.sites.find(s => s.id === siteId);
    if (!site) return;

    const newStatus = site.status === 'active' ? 'inactive' : 'active';
    
    try {
      // API를 통해 상태 업데이트
      await window.apiService.updateSite(siteId, { status: newStatus });
      
      // 로컬 데이터 업데이트
      site.status = newStatus;
      this.filteredSites = [...this.sites];
      
      Utils.showNotification(
        `사이트가 ${newStatus === 'active' ? '활성화' : '비활성화'}되었습니다.`,
        'success'
      );
      
      // 사이트 그리드 다시 렌더링
      const existingGrid = Utils.$('.grid');
      if (existingGrid) {
        const newGrid = this.createSitesGrid();
        existingGrid.parentNode.replaceChild(newGrid, existingGrid);
      }
    } catch (error) {
      console.error('사이트 상태 변경 실패:', error);
      Utils.showNotification('사이트 상태 변경에 실패했습니다.', 'error');
    }
  }

  editSite(siteId) {
    Utils.showNotification('사이트 설정 기능은 곧 제공될 예정입니다.', 'info');
  }

  // 사이트 상세 보기
  viewSiteDetails(siteId) {
    const site = this.sites.find(s => s.id === siteId);
    if (!site) return;

    Utils.showNotification(`${site.name} 사이트 상세 페이지로 이동합니다.`, 'info');
    // 실제로는 상세 페이지로 라우팅
  }

  // 사이트 목록 내보내기
  exportSitesList() {
    try {
      const csvContent = [
        ['사이트 이름', '도메인', '상태', '댓글 수', '생성일', '마지막 활동'],
        ...this.sites.map(site => [
          site.name,
          site.domain,
          site.status === 'active' ? '활성화' : '비활성화',
          site.commentsCount,
          site.createdAt,
          site.lastActivity
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `sites_list_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      Utils.showNotification('사이트 목록이 CSV 파일로 다운로드되었습니다.', 'success');
    } catch (error) {
      console.error('사이트 목록 내보내기 실패:', error);
      Utils.showNotification('파일 내보내기에 실패했습니다.', 'error');
    }
  }

  // 일괄 처리 모달
  showBulkActions() {
    Utils.showNotification('일괄 처리 기능은 곧 제공될 예정입니다.', 'info');
  }

  // 빠른 필터 적용
  applyQuickFilter(filterType) {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    switch (filterType) {
      case 'recent':
        this.filteredSites = this.sites.filter(site => {
          const siteDate = new Date(site.createdAt);
          return siteDate >= oneWeekAgo;
        });
        Utils.showNotification('최근 1주일 내 생성된 사이트를 표시합니다.', 'success');
        break;
      
      case 'active':
        this.filteredSites = this.sites.filter(site => site.status === 'active');
        Utils.showNotification('활성화된 사이트만 표시합니다.', 'success');
        break;
      
      case 'popular':
        this.filteredSites = this.sites.filter(site => site.commentsCount > 50).sort((a, b) => b.commentsCount - a.commentsCount);
        Utils.showNotification('댓글이 많은 인기 사이트를 표시합니다.', 'success');
        break;
      
      case 'issues':
        this.filteredSites = this.sites.filter(site => site.status === 'inactive' || site.lastActivity === '활동 없음');
        Utils.showNotification('문제가 있을 수 있는 사이트를 표시합니다.', 'warning');
        break;
      
      default:
        this.filteredSites = [...this.sites];
        break;
    }

    // 사이트 그리드 다시 렌더링
    const existingGrid = Utils.$('.grid');
    if (existingGrid) {
      const newGrid = this.createSitesGrid();
      existingGrid.parentNode.replaceChild(newGrid, existingGrid);
    }
  }

  createErrorState() {
    return Components.createEmptyState(
      '데이터 로딩 실패',
      '사이트 데이터를 불러오는 중 오류가 발생했습니다.',
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
    
    // 검색 타임아웃 정리
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = null;
    }
    
    // 이벤트 리스너 제거
    for (const [key, listener] of this.eventListeners) {
      listener.element.removeEventListener(listener.eventType, listener.handler, listener.options);
    }
    this.eventListeners.clear();
    
    // 캐시된 데이터 정리
    this.sites.forEach(site => {
      delete site.nameLower;
      delete site.domainLower;
      delete site.descLower;
    });
    
    console.log('SitesPage destroyed and cleaned up');
  }
}

// 전역으로 사용할 수 있도록 export
window.SitesPage = SitesPage;