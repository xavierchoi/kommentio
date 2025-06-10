// Kommentio Admin Dashboard - Users Management Page

class UsersPage {
  constructor() {
    this.users = [];
    this.filteredUsers = [];
    this.sites = [];
    this.currentSite = 'all';
    this.searchQuery = '';
    this.sortBy = 'last_activity';
    this.sortOrder = 'desc';
    this.currentPage = 1;
    this.itemsPerPage = 20;
  }

  async render() {
    const container = Utils.$('#page-users');
    container.innerHTML = '';

    // 페이지 헤더
    const header = this.createPageHeader();
    container.appendChild(header);

    // 필터 및 검색 섹션
    const filtersSection = this.createFiltersSection();
    container.appendChild(filtersSection);

    // 로딩 표시
    Utils.showLoading(container);

    try {
      // 데이터 로드
      await this.loadSites();
      await this.loadUsers();

      // 사용자 통계 카드
      const statsSection = this.createStatsSection();
      container.appendChild(statsSection);

      // 사용자 테이블
      const usersSection = this.createUsersSection();
      container.appendChild(usersSection);

      // 페이징
      const pagination = this.createPagination();
      container.appendChild(pagination);

    } catch (error) {
      console.error('사용자 데이터 로딩 실패:', error);
      container.appendChild(this.createErrorState());
    } finally {
      Utils.hideLoading(container);
    }
  }

  async loadSites() {
    try {
      this.sites = await window.apiService.getSites();
    } catch (error) {
      console.error('사이트 목록 로딩 실패:', error);
      this.sites = [];
    }
  }

  async loadUsers() {
    try {
      // Mock 사용자 데이터 생성
      this.users = [
        {
          id: 1,
          name: '김철수',
          email: 'kim@example.com',
          avatar: null,
          provider: 'google',
          comments_count: 45,
          last_comment: '2024-01-15T14:30:00Z',
          first_comment: '2023-12-01T10:15:00Z',
          sites_participated: ['개인 블로그', '기술 블로그'],
          status: 'active',
          is_trusted: true,
          spam_reports: 0,
          total_likes_received: 128
        },
        {
          id: 2,
          name: '이영희',
          email: 'lee@gmail.com',
          avatar: null,
          provider: 'github',
          comments_count: 28,
          last_comment: '2024-01-14T16:20:00Z',
          first_comment: '2024-01-05T09:30:00Z',
          sites_participated: ['기술 블로그'],
          status: 'active',
          is_trusted: false,
          spam_reports: 0,
          total_likes_received: 67
        },
        {
          id: 3,
          name: '박민수',
          email: 'park@naver.com',
          avatar: null,
          provider: 'kakao',
          comments_count: 12,
          last_comment: '2024-01-10T11:45:00Z',
          first_comment: '2024-01-08T14:20:00Z',
          sites_participated: ['개인 블로그'],
          status: 'active',
          is_trusted: false,
          spam_reports: 2,
          total_likes_received: 23
        },
        {
          id: 4,
          name: 'Spammer User',
          email: 'spam@fake.com',
          avatar: null,
          provider: 'email',
          comments_count: 3,
          last_comment: '2024-01-12T08:15:00Z',
          first_comment: '2024-01-12T08:10:00Z',
          sites_participated: ['개인 블로그'],
          status: 'banned',
          is_trusted: false,
          spam_reports: 5,
          total_likes_received: 0
        },
        {
          id: 5,
          name: '정수영',
          email: 'jung@company.com',
          avatar: null,
          provider: 'linkedin',
          comments_count: 67,
          last_comment: '2024-01-16T09:45:00Z',
          first_comment: '2023-11-15T13:20:00Z',
          sites_participated: ['기술 블로그', '회사 블로그'],
          status: 'active',
          is_trusted: true,
          spam_reports: 0,
          total_likes_received: 205
        },
        {
          id: 6,
          name: '최혜진',
          email: 'choi@design.com',
          avatar: null,
          provider: 'facebook',
          comments_count: 23,
          last_comment: '2024-01-13T15:30:00Z',
          first_comment: '2024-01-02T11:10:00Z',
          sites_participated: ['개인 블로그'],
          status: 'active',
          is_trusted: false,
          spam_reports: 0,
          total_likes_received: 89
        }
      ];

      this.applyFiltersAndSort();
      
    } catch (error) {
      console.error('사용자 로딩 실패:', error);
      this.users = [];
      this.filteredUsers = [];
    }
  }

  applyFiltersAndSort() {
    let filtered = [...this.users];

    // 사이트 필터
    if (this.currentSite !== 'all') {
      const site = this.sites.find(s => s.id == this.currentSite);
      if (site) {
        filtered = filtered.filter(user => 
          user.sites_participated.includes(site.name)
        );
      }
    }

    // 검색 필터
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    }

    // 정렬
    filtered.sort((a, b) => {
      let aValue = a[this.sortBy];
      let bValue = b[this.sortBy];

      if (this.sortBy === 'last_comment') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (this.sortOrder === 'desc') {
        return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });

    this.filteredUsers = filtered;
    this.applyPagination();
  }

  applyPagination() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredUsers = this.filteredUsers.slice(startIndex, endIndex);
  }

  createPageHeader() {
    const header = Utils.createElement('div', 'mb-8');
    header.innerHTML = `
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div class="flex items-center space-x-4">
          <div class="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
            <i class="fas fa-users text-white text-2xl"></i>
          </div>
          <div>
            <h1 class="text-3xl font-bold text-gray-900">사용자 관리</h1>
            <p class="text-gray-600 mt-1">댓글 시스템을 사용하는 모든 사용자를 전문적으로 관리하세요</p>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <div class="hidden lg:flex items-center space-x-2 px-3 py-2 bg-indigo-50 rounded-lg border border-indigo-200">
            <div class="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
            <span class="text-indigo-700 text-sm font-medium">실시간 동기화</span>
          </div>
          <button id="refresh-users-btn" class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2 shadow-sm">
            <i class="fas fa-sync-alt"></i>
            <span>새로고침</span>
          </button>
          <button class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2 shadow-sm" onclick="usersPage.exportUsers()">
            <i class="fas fa-download"></i>
            <span>내보내기</span>
          </button>
          <button id="bulk-actions-btn" class="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-lg">
            <i class="fas fa-tasks"></i>
            <span>대량 작업</span>
          </button>
        </div>
      </div>
    `;
    
    // 새로고침 버튼 이벤트
    const refreshBtn = Utils.$('#refresh-users-btn', header);
    if (refreshBtn) {
      Utils.on(refreshBtn, 'click', () => {
        this.loadUsers().then(() => this.refreshUsersTable());
        Utils.showToast('사용자 목록을 새로고침했습니다.', 'success');
      });
    }
    
    return header;
  }

  createFiltersSection() {
    const section = Utils.createElement('div', 'bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8');
    
    // 섹션 헤더
    const sectionHeader = Utils.createElement('div', 'flex items-center space-x-3 mb-6');
    sectionHeader.innerHTML = `
      <div class="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
        <i class="fas fa-filter text-white text-sm"></i>
      </div>
      <div>
        <h2 class="text-xl font-bold text-gray-900">스마트 필터</h2>
        <p class="text-gray-600 text-sm">원하는 조건으로 사용자를 정확하게 필터링하세요</p>
      </div>
    `;
    section.appendChild(sectionHeader);
    
    // 그리드 컨테이너
    const grid = Utils.createElement('div', 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6');
    
    // 사이트 선택 필터
    const siteFilterDiv = Utils.createElement('div', 'space-y-2');
    const siteLabel = Utils.createElement('label', 'block text-sm font-semibold text-gray-700 mb-2', '🌐 사이트 선택');
    const siteFilterWrapper = Utils.createElement('div', 'relative');
    const siteFilter = Utils.createElement('select', 'w-full p-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200');
    siteFilter.id = 'site-filter';
    
    // 사이트 옵션들 추가
    const allSitesOption = Utils.createElement('option', '', '모든 사이트');
    allSitesOption.value = 'all';
    if (this.currentSite === 'all') allSitesOption.selected = true;
    siteFilter.appendChild(allSitesOption);
    
    this.sites.forEach(site => {
      const option = Utils.createElement('option', '', site.name);
      option.value = site.id;
      if (this.currentSite == site.id) option.selected = true;
      siteFilter.appendChild(option);
    });
    
    Utils.on(siteFilter, 'change', (e) => {
      this.currentSite = e.target.value;
      this.currentPage = 1;
      this.applyFiltersAndSort();
      this.refreshUsersTable();
    });
    
    siteFilterWrapper.appendChild(siteFilter);
    siteFilterDiv.appendChild(siteLabel);
    siteFilterDiv.appendChild(siteFilterWrapper);
    
    // 검색 입력
    const searchDiv = Utils.createElement('div', 'space-y-2');
    const searchLabel = Utils.createElement('label', 'block text-sm font-semibold text-gray-700 mb-2', '🔍 빠른 검색');
    const searchWrapper = Utils.createElement('div', 'relative');
    const searchInput = Utils.createElement('input', 'w-full p-3 pl-10 border border-gray-300 rounded-lg bg-white shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200');
    searchInput.type = 'text';
    searchInput.id = 'search-input';
    searchInput.placeholder = '이름, 이메일로 검색...';
    searchInput.value = this.searchQuery;
    
    const searchIcon = Utils.createElement('div', 'absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none');
    searchIcon.innerHTML = '<i class="fas fa-search text-gray-400"></i>';
    
    Utils.on(searchInput, 'input', Utils.debounce((e) => {
      this.searchQuery = e.target.value;
      this.currentPage = 1;
      this.applyFiltersAndSort();
      this.refreshUsersTable();
    }, 300));
    
    searchWrapper.appendChild(searchIcon);
    searchWrapper.appendChild(searchInput);
    searchDiv.appendChild(searchLabel);
    searchDiv.appendChild(searchWrapper);
    
    // 정렬 옵션
    const sortDiv = Utils.createElement('div', 'space-y-2');
    const sortLabel = Utils.createElement('label', 'block text-sm font-semibold text-gray-700 mb-2', '📊 정렬 기준');
    const sortWrapper = Utils.createElement('div', 'relative');
    const sortSelect = Utils.createElement('select', 'w-full p-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200');
    sortSelect.id = 'sort-by';
    
    const sortOptions = [
      { value: 'last_comment', text: '📅 최근 활동순' },
      { value: 'comments_count', text: '💬 댓글 수순' },
      { value: 'first_comment', text: '🗓️ 가입일순' },
      { value: 'name', text: '🔤 이름순' }
    ];
    
    sortOptions.forEach(sort => {
      const option = Utils.createElement('option', '', sort.text);
      option.value = sort.value;
      if (this.sortBy === sort.value) option.selected = true;
      sortSelect.appendChild(option);
    });
    
    Utils.on(sortSelect, 'change', (e) => {
      this.sortBy = e.target.value;
      this.currentPage = 1;
      this.applyFiltersAndSort();
      this.refreshUsersTable();
    });
    
    sortWrapper.appendChild(sortSelect);
    sortDiv.appendChild(sortLabel);
    sortDiv.appendChild(sortWrapper);
    
    // 통계 표시
    const statsDiv = Utils.createElement('div', 'space-y-2');
    const statsLabel = Utils.createElement('label', 'block text-sm font-semibold text-gray-700 mb-2', '📈 사용자 통계');
    const statsCard = Utils.createElement('div', 'bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200');
    
    statsCard.innerHTML = `
      <div class="text-center">
        <div class="text-3xl font-bold text-purple-600 mb-1">${Utils.formatNumber(this.users.length)}</div>
        <div class="text-sm text-purple-700 font-medium">총 사용자</div>
      </div>
    `;
    
    statsDiv.appendChild(statsLabel);
    statsDiv.appendChild(statsCard);
    
    // 모든 필터를 그리드에 추가
    grid.appendChild(siteFilterDiv);
    grid.appendChild(searchDiv);
    grid.appendChild(sortDiv);
    grid.appendChild(statsDiv);
    
    section.appendChild(grid);
    
    // 필터 리셋 버튼 추가
    const resetSection = Utils.createElement('div', 'mt-6 pt-6 border-t border-gray-200 flex justify-between items-center');
    resetSection.innerHTML = `
      <div class="text-sm text-gray-500">
        <i class="fas fa-info-circle mr-1"></i>
        필터가 적용되면 결과가 실시간으로 업데이트됩니다
      </div>
      <button id="reset-filters-btn" class="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex items-center space-x-2">
        <i class="fas fa-undo"></i>
        <span>필터 초기화</span>
      </button>
    `;
    
    const resetBtn = resetSection.querySelector('#reset-filters-btn');
    Utils.on(resetBtn, 'click', () => this.resetFilters());
    
    section.appendChild(resetSection);
    
    return section;
  }

  createStatsSection() {
    const section = Utils.createElement('div', 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8');
    
    const totalUsers = this.users.length;
    const activeUsers = this.users.filter(u => u.status === 'active').length;
    const trustedUsers = this.users.filter(u => u.is_trusted).length;
    const totalComments = this.users.reduce((sum, u) => sum + u.comments_count, 0);
    
    const stats = [
      {
        title: '총 사용자',
        value: totalUsers,
        icon: 'fas fa-users',
        color: 'blue',
        change: '+12%'
      },
      {
        title: '활성 사용자',
        value: activeUsers,
        icon: 'fas fa-user-check',
        color: 'green',
        change: '+8%'
      },
      {
        title: '신뢰 사용자',
        value: trustedUsers,
        icon: 'fas fa-user-shield',
        color: 'purple',
        change: '+5%'
      },
      {
        title: '총 댓글',
        value: totalComments,
        icon: 'fas fa-comments',
        color: 'orange',
        change: '+23%'
      }
    ];
    
    stats.forEach(stat => {
      const card = Utils.createElement('div', `bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300`);
      card.innerHTML = `
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 mb-1">${stat.title}</p>
            <div class="flex items-baseline space-x-2">
              <p class="text-3xl font-bold text-gray-900">${Utils.formatNumber(stat.value)}</p>
              <span class="text-sm font-medium text-${stat.color}-600 bg-${stat.color}-50 px-2 py-1 rounded-full">${stat.change}</span>
            </div>
          </div>
          <div class="w-12 h-12 bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 rounded-lg flex items-center justify-center">
            <i class="${stat.icon} text-white text-xl"></i>
          </div>
        </div>
      `;
      section.appendChild(card);
    });
    
    return section;
  }

  createUsersSection() {
    const section = Utils.createElement('div', 'bg-white rounded-xl shadow-lg border border-gray-200 mb-8');
    
    // 섹션 헤더
    const header = Utils.createElement('div', 'p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100');
    header.innerHTML = `
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <i class="fas fa-list text-white text-sm"></i>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">사용자 목록</h2>
            <p class="text-gray-600 text-sm">등록된 사용자들을 확인하고 관리하세요</p>
          </div>
        </div>
        <div class="flex flex-wrap gap-3">
          <label class="flex items-center space-x-2 text-sm text-gray-600 bg-white px-3 py-2 rounded-lg border border-gray-300 shadow-sm">
            <input type="checkbox" id="select-all-users" class="rounded text-indigo-600 focus:ring-indigo-500">
            <span>전체 선택</span>
          </label>
          <button class="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-2 shadow-sm disabled:opacity-50" onclick="usersPage.bulkTrust()">
            <i class="fas fa-shield-check"></i>
            <span>선택 신뢰</span>
          </button>
          <button class="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center space-x-2 shadow-sm disabled:opacity-50" onclick="usersPage.bulkBan()">
            <i class="fas fa-ban"></i>
            <span>선택 차단</span>
          </button>
        </div>
      </div>
    `;
    
    const body = Utils.createElement('div', 'p-6');
    body.setAttribute('id', 'users-table-container');
    
    section.appendChild(header);
    section.appendChild(body);
    
    // 전체 선택 체크박스 이벤트
    const selectAllCheckbox = header.querySelector('#select-all-users');
    Utils.on(selectAllCheckbox, 'change', (e) => {
      const userCheckboxes = Utils.$$('.user-checkbox');
      userCheckboxes.forEach(cb => cb.checked = e.target.checked);
    });
    
    this.renderUsersTable(body);
    
    return section;
  }

  renderUsersTable(container) {
    container.innerHTML = '';
    
    if (this.filteredUsers.length === 0) {
      container.appendChild(Components.createEmptyState(
        '사용자가 없습니다',
        '선택한 조건에 맞는 사용자가 없습니다.',
        '필터 초기화',
        () => this.resetFilters()
      ));
      return;
    }

    const table = Utils.createElement('div', 'space-y-4');
    
    this.filteredUsers.forEach(user => {
      const userCard = this.createUserCard(user);
      table.appendChild(userCard);
    });
    
    container.appendChild(table);
  }

  createUserCard(user) {
    const card = Utils.createElement('div', 'group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-indigo-300 transition-all duration-300');
    
    const statusBadge = this.getStatusBadge(user);
    const providerIcon = this.getProviderIcon(user.provider);
    
    card.innerHTML = `
      <div class="flex items-start space-x-4">
        <!-- 체크박스와 아바타 -->
        <div class="flex flex-col items-center space-y-3">
          <input type="checkbox" class="user-checkbox w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 focus:ring-2" data-user-id="${user.id}">
          <div class="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center relative">
            <i class="fas fa-user text-indigo-600 text-xl"></i>
            <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full border-2 border-white flex items-center justify-center">
              ${providerIcon}
            </div>
          </div>
        </div>
        
        <!-- 사용자 정보 -->
        <div class="flex-1 min-w-0">
          <!-- 사용자 헤더 -->
          <div class="flex flex-wrap items-center gap-3 mb-3">
            <h3 class="font-bold text-gray-900 text-xl">${user.name}</h3>
            <span class="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">${user.email}</span>
            ${statusBadge}
            ${user.is_trusted ? `
              <div class="flex items-center space-x-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-200">
                <i class="fas fa-shield-check"></i>
                <span>신뢰 사용자</span>
              </div>
            ` : ''}
            ${user.spam_reports > 0 ? `
              <div class="flex items-center space-x-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-full text-xs font-medium border border-amber-200">
                <i class="fas fa-exclamation-triangle"></i>
                <span>신고 ${user.spam_reports}회</span>
              </div>
            ` : ''}
          </div>
          
          <!-- 활동 통계 -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div class="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-3 text-center">
              <div class="text-2xl font-bold text-blue-600">${user.comments_count}</div>
              <div class="text-xs text-blue-700 font-medium">작성 댓글</div>
            </div>
            <div class="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-3 text-center">
              <div class="text-2xl font-bold text-green-600">${user.total_likes_received}</div>
              <div class="text-xs text-green-700 font-medium">받은 좋아요</div>
            </div>
            <div class="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-3 text-center">
              <div class="text-2xl font-bold text-purple-600">${user.sites_participated.length}</div>
              <div class="text-xs text-purple-700 font-medium">참여 사이트</div>
            </div>
            <div class="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-3 text-center">
              <div class="text-2xl font-bold text-orange-600">${Math.round(user.comments_count / Math.max(1, Math.ceil((new Date() - new Date(user.first_comment)) / (1000 * 60 * 60 * 24 * 7))))}</div>
              <div class="text-xs text-orange-700 font-medium">주간 평균</div>
            </div>
          </div>
          
          <!-- 메타 정보 -->
          <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
            <div class="flex items-center space-x-1">
              <i class="fas fa-calendar-plus w-4 text-blue-500"></i>
              <span>가입: ${Utils.formatDateTime(user.first_comment)}</span>
            </div>
            <div class="flex items-center space-x-1">
              <i class="fas fa-clock w-4 text-green-500"></i>
              <span>최근: ${Utils.formatDateTime(user.last_comment)}</span>
            </div>
          </div>
          
          <!-- 참여 사이트 -->
          <div class="mb-4">
            <div class="text-sm font-medium text-gray-700 mb-2">참여 사이트:</div>
            <div class="flex flex-wrap gap-2">
              ${user.sites_participated.map(site => `
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <i class="fas fa-globe mr-1 w-3"></i>
                  ${site}
                </span>
              `).join('')}
            </div>
          </div>
        </div>
        
        <!-- 액션 버튼들 -->
        <div class="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          ${!user.is_trusted && user.status !== 'banned' ? `
            <button class="px-3 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 flex items-center space-x-1 text-sm font-medium shadow-sm" onclick="usersPage.trustUser(${user.id})">
              <i class="fas fa-shield-check w-3"></i>
              <span>신뢰</span>
            </button>
          ` : ''}
          ${user.status !== 'banned' ? `
            <button class="px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center space-x-1 text-sm font-medium shadow-sm" onclick="usersPage.banUser(${user.id})">
              <i class="fas fa-ban w-3"></i>
              <span>차단</span>
            </button>
          ` : `
            <button class="px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-1 text-sm font-medium shadow-sm" onclick="usersPage.unbanUser(${user.id})">
              <i class="fas fa-unlock w-3"></i>
              <span>해제</span>
            </button>
          `}
          <button class="px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-1 text-sm font-medium shadow-sm" onclick="usersPage.viewUserDetails(${user.id})">
            <i class="fas fa-eye w-3"></i>
            <span>상세</span>
          </button>
          <button class="px-3 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-1 text-sm font-medium shadow-sm" onclick="usersPage.viewUserComments(${user.id})">
            <i class="fas fa-comments w-3"></i>
            <span>댓글</span>
          </button>
        </div>
      </div>
    `;
    
    return card;
  }

  getStatusBadge(user) {
    if (user.status === 'banned') {
      return `
        <div class="flex items-center space-x-1 bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-semibold border border-red-200">
          <i class="fas fa-ban"></i>
          <span>차단됨</span>
        </div>
      `;
    } else {
      return `
        <div class="flex items-center space-x-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-semibold border border-green-200">
          <i class="fas fa-check-circle"></i>
          <span>활성</span>
        </div>
      `;
    }
  }

  getProviderIcon(provider) {
    const icons = {
      'google': '<i class="fab fa-google text-red-500 text-xs"></i>',
      'github': '<i class="fab fa-github text-gray-800 text-xs"></i>',
      'facebook': '<i class="fab fa-facebook text-blue-600 text-xs"></i>',
      'kakao': '<i class="fas fa-comment text-yellow-500 text-xs"></i>',
      'linkedin': '<i class="fab fa-linkedin text-blue-700 text-xs"></i>',
      'email': '<i class="fas fa-envelope text-gray-600 text-xs"></i>'
    };
    return icons[provider] || '<i class="fas fa-user text-gray-600 text-xs"></i>';
  }

  createPagination() {
    const totalPages = Math.ceil(this.users.length / this.itemsPerPage);
    
    if (totalPages <= 1) {
      return Utils.createElement('div');
    }

    const paginationContainer = Utils.createElement('div', 'bg-white rounded-xl shadow-lg border border-gray-200 p-6');
    
    // 페이지네이션 헤더
    const header = Utils.createElement('div', 'flex items-center justify-between mb-4');
    header.innerHTML = `
      <div class="flex items-center space-x-2 text-sm text-gray-600">
        <i class="fas fa-info-circle text-indigo-500"></i>
        <span>총 <strong class="text-gray-900">${this.users.length}</strong>명의 사용자</span>
        <span class="text-gray-400">•</span>
        <span>페이지 <strong class="text-gray-900">${this.currentPage}</strong> / <strong class="text-gray-900">${totalPages}</strong></span>
      </div>
      <div class="flex items-center space-x-2">
        <label class="text-sm text-gray-600">페이지당</label>
        <select id="items-per-page" class="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
          <option value="10" ${this.itemsPerPage === 10 ? 'selected' : ''}>10명</option>
          <option value="20" ${this.itemsPerPage === 20 ? 'selected' : ''}>20명</option>
          <option value="50" ${this.itemsPerPage === 50 ? 'selected' : ''}>50명</option>
        </select>
      </div>
    `;
    
    const pagination = Utils.createElement('div', 'flex items-center justify-center space-x-2');
    
    // 이전 버튼
    const prevBtn = Utils.createElement('button', 
      `px-4 py-2 ${this.currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'} rounded-lg transition-colors duration-200 flex items-center space-x-1`
    );
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i><span>이전</span>';
    if (this.currentPage > 1) {
      Utils.on(prevBtn, 'click', () => this.goToPage(this.currentPage - 1));
    }
    pagination.appendChild(prevBtn);
    
    // 페이지 번호들
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(totalPages, this.currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = Utils.createElement('button', 
        `px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
          i === this.currentPage 
            ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`,
        i.toString()
      );
      Utils.on(pageBtn, 'click', () => this.goToPage(i));
      pagination.appendChild(pageBtn);
    }
    
    // 다음 버튼
    const nextBtn = Utils.createElement('button', 
      `px-4 py-2 ${this.currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'} rounded-lg transition-colors duration-200 flex items-center space-x-1`
    );
    nextBtn.innerHTML = '<span>다음</span><i class="fas fa-chevron-right"></i>';
    if (this.currentPage < totalPages) {
      Utils.on(nextBtn, 'click', () => this.goToPage(this.currentPage + 1));
    }
    pagination.appendChild(nextBtn);
    
    paginationContainer.appendChild(header);
    paginationContainer.appendChild(pagination);
    
    // 페이지당 항목 수 변경 이벤트
    const itemsPerPageSelect = header.querySelector('#items-per-page');
    Utils.on(itemsPerPageSelect, 'change', (e) => {
      this.itemsPerPage = parseInt(e.target.value);
      this.currentPage = 1;
      this.applyPagination();
      this.refreshUsersTable();
    });
    
    return paginationContainer;
  }

  goToPage(page) {
    this.currentPage = page;
    this.applyPagination();
    this.refreshUsersTable();
    this.refreshPagination();
  }

  refreshUsersTable() {
    const container = Utils.$('#users-table-container');
    this.renderUsersTable(container);
  }

  refreshPagination() {
    // 페이지네이션 새로고침 로직
    const existingPagination = Utils.$('.bg-white.rounded-xl.shadow-lg.border.border-gray-200.p-6');
    if (existingPagination && existingPagination.querySelector('.flex.items-center.justify-center.space-x-2')) {
      const newPagination = this.createPagination();
      existingPagination.parentNode.replaceChild(newPagination, existingPagination);
    }
  }

  resetFilters() {
    this.currentSite = 'all';
    this.searchQuery = '';
    this.sortBy = 'last_activity';
    this.currentPage = 1;
    this.render();
  }

  // 사용자 관리 메서드들
  async trustUser(userId) {
    try {
      const user = this.users.find(u => u.id === userId);
      if (user) {
        user.is_trusted = true;
        Utils.showNotification(`${user.name}님을 신뢰 사용자로 설정했습니다.`, 'success');
        this.refreshUsersTable();
      }
    } catch (error) {
      console.error('사용자 신뢰 설정 실패:', error);
      Utils.showNotification('사용자 신뢰 설정에 실패했습니다.', 'error');
    }
  }

  async banUser(userId) {
    if (!confirm('정말로 이 사용자를 차단하시겠습니까?')) {
      return;
    }

    try {
      const user = this.users.find(u => u.id === userId);
      if (user) {
        user.status = 'banned';
        Utils.showNotification(`${user.name}님이 차단되었습니다.`, 'success');
        this.refreshUsersTable();
      }
    } catch (error) {
      console.error('사용자 차단 실패:', error);
      Utils.showNotification('사용자 차단에 실패했습니다.', 'error');
    }
  }

  async unbanUser(userId) {
    try {
      const user = this.users.find(u => u.id === userId);
      if (user) {
        user.status = 'active';
        Utils.showNotification(`${user.name}님의 차단이 해제되었습니다.`, 'success');
        this.refreshUsersTable();
      }
    } catch (error) {
      console.error('사용자 차단 해제 실패:', error);
      Utils.showNotification('사용자 차단 해제에 실패했습니다.', 'error');
    }
  }

  viewUserDetails(userId) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return;

    const modalContent = Utils.createElement('div', 'space-y-6');
    modalContent.innerHTML = `
      <!-- 사용자 기본 정보 -->
      <div class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-200">
        <div class="flex items-center space-x-4 mb-4">
          <div class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
            <i class="fas fa-user text-white text-xl"></i>
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-900">${user.name}</h3>
            <p class="text-gray-600">${user.email}</p>
            <div class="flex items-center space-x-2 mt-2">
              ${this.getStatusBadge(user)}
              ${this.getProviderIcon(user.provider)}
            </div>
          </div>
        </div>
      </div>

      <!-- 활동 통계 -->
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div class="text-sm text-blue-600 font-medium">작성 댓글</div>
          <div class="text-2xl font-bold text-blue-900">${user.comments_count}</div>
        </div>
        <div class="bg-green-50 rounded-lg p-4 border border-green-200">
          <div class="text-sm text-green-600 font-medium">받은 좋아요</div>
          <div class="text-2xl font-bold text-green-900">${user.total_likes_received}</div>
        </div>
      </div>

      <!-- 세부 정보 -->
      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">가입일</label>
            <div class="text-gray-900">${Utils.formatDateTime(user.first_comment)}</div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">최근 활동</label>
            <div class="text-gray-900">${Utils.formatDateTime(user.last_comment)}</div>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">참여 사이트</label>
          <div class="flex flex-wrap gap-2">
            ${user.sites_participated.map(site => `
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700">
                <i class="fas fa-globe mr-1"></i>
                ${site}
              </span>
            `).join('')}
          </div>
        </div>

        ${user.spam_reports > 0 ? `
        <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div class="flex items-center">
            <i class="fas fa-exclamation-triangle text-amber-500 mr-2"></i>
            <div class="text-sm text-amber-700">
              <strong>스팸 신고:</strong> ${user.spam_reports}회 신고됨
            </div>
          </div>
        </div>
        ` : ''}
      </div>
    `;

    const modal = Components.createModal('사용자 상세 정보', modalContent, [
      {
        text: '닫기',
        class: 'btn-secondary',
        onclick: () => Components.closeModal(modal)
      }
    ]);

    Components.showModal(modal);
  }

  viewUserComments(userId) {
    Utils.showNotification('사용자별 댓글 조회 기능은 곧 제공될 예정입니다.', 'info');
  }

  bulkTrust() {
    const selectedUsers = this.getSelectedUsers();
    if (selectedUsers.length === 0) {
      Utils.showNotification('신뢰할 사용자를 선택해주세요.', 'warning');
      return;
    }

    if (!confirm(`선택한 ${selectedUsers.length}명의 사용자를 신뢰 사용자로 설정하시겠습니까?`)) {
      return;
    }

    selectedUsers.forEach(userId => {
      const user = this.users.find(u => u.id === userId);
      if (user) user.is_trusted = true;
    });

    Utils.showNotification(`${selectedUsers.length}명이 신뢰 사용자로 설정되었습니다.`, 'success');
    this.refreshUsersTable();
  }

  bulkBan() {
    const selectedUsers = this.getSelectedUsers();
    if (selectedUsers.length === 0) {
      Utils.showNotification('차단할 사용자를 선택해주세요.', 'warning');
      return;
    }

    if (!confirm(`선택한 ${selectedUsers.length}명의 사용자를 차단하시겠습니까?`)) {
      return;
    }

    selectedUsers.forEach(userId => {
      const user = this.users.find(u => u.id === userId);
      if (user) user.status = 'banned';
    });

    Utils.showNotification(`${selectedUsers.length}명이 차단되었습니다.`, 'success');
    this.refreshUsersTable();
  }

  getSelectedUsers() {
    const checkboxes = Utils.$$('.user-checkbox:checked');
    return Array.from(checkboxes).map(cb => parseInt(cb.dataset.userId));
  }

  exportUsers() {
    try {
      const csvContent = [
        ['사용자 ID', '이름', '이메일', '제공자', '댓글 수', '가입일', '최근 활동', '상태', '신뢰 여부', '신고 횟수'],
        ...this.users.map(user => [
          user.id,
          user.name,
          user.email,
          user.provider,
          user.comments_count,
          Utils.formatDateTime(user.first_comment),
          Utils.formatDateTime(user.last_comment),
          user.status === 'active' ? '활성' : '차단됨',
          user.is_trusted ? '신뢰' : '일반',
          user.spam_reports
        ])
      ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      Utils.showNotification('사용자 목록이 CSV 파일로 다운로드되었습니다.', 'success');
    } catch (error) {
      console.error('사용자 내보내기 실패:', error);
      Utils.showNotification('파일 내보내기에 실패했습니다.', 'error');
    }
  }

  createErrorState() {
    return Components.createEmptyState(
      '데이터 로딩 실패',
      '사용자 데이터를 불러오는 중 오류가 발생했습니다.',
      '다시 시도',
      () => this.render()
    );
  }
}

// 전역으로 사용할 수 있도록 export
window.UsersPage = UsersPage;