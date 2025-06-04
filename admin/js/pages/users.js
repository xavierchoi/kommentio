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

    this.users = filtered;
    this.applyPagination();
  }

  applyPagination() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredUsers = this.users.slice(startIndex, endIndex);
  }

  createPageHeader() {
    const header = Utils.createElement('div', 'mb-8');
    header.innerHTML = `
      <div class="flex flex-col gap-6">
        <!-- 메인 타이틀 -->
        <div class="flex items-center space-x-3 md:space-x-4">
          <div class="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl">
            <i class="fas fa-users text-white text-xl md:text-2xl"></i>
          </div>
          <div class="flex-1">
            <h1 class="text-2xl md:text-3xl font-bold text-gray-900">사용자 관리</h1>
            <p class="text-gray-600 mt-1 text-sm md:text-base">댓글을 작성한 사용자들을 체계적으로 관리하고 모니터링하세요</p>
          </div>
        </div>
        
        <!-- 통계 및 액션 버튼들 -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <!-- 사용자 통계 -->
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2 px-3 py-2 bg-purple-50 rounded-lg border border-purple-200 w-fit">
              <div class="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span class="text-purple-700 text-sm font-medium">총 ${this.users.length}명 등록</span>
            </div>
            <div class="flex items-center space-x-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200 w-fit">
              <i class="fas fa-check-circle text-green-500"></i>
              <span class="text-green-700 text-sm font-medium">${this.users.filter(u => u.status === 'active').length}명 활성</span>
            </div>
            <div class="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200 w-fit">
              <i class="fas fa-shield-alt text-blue-500"></i>
              <span class="text-blue-700 text-sm font-medium">${this.users.filter(u => u.is_trusted).length}명 신뢰</span>
            </div>
          </div>
          
          <!-- 액션 버튼들 -->
          <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button class="w-full sm:w-auto px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center sm:justify-start space-x-2 shadow-sm min-h-[44px]" onclick="usersPage.exportUsers()">
              <i class="fas fa-download"></i>
              <span class="hidden sm:inline">사용자 내보내기</span>
              <span class="sm:hidden">내보내기</span>
            </button>
            <button class="w-full sm:w-auto px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center sm:justify-start space-x-2 shadow-sm min-h-[44px]" onclick="usersPage.showUserAnalytics()">
              <i class="fas fa-chart-line"></i>
              <span class="hidden sm:inline">사용자 분석</span>
              <span class="sm:hidden">분석</span>
            </button>
            <button class="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg min-h-[44px]" onclick="usersPage.showBulkActions()">
              <i class="fas fa-users-cog"></i>
              <span>대량 작업</span>
            </button>
          </div>
        </div>
      </div>
    `;
    
    return header;
  }

  createFiltersSection() {
    const section = Utils.createElement('div', 'bg-white rounded-xl shadow-lg border border-gray-200 mb-8');
    
    const header = Utils.createElement('div', 'p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50');
    header.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
          <i class="fas fa-filter text-white text-sm"></i>
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-900">사용자 필터링</h2>
          <p class="text-gray-600 text-sm">다양한 조건으로 사용자를 정확하게 찾아보세요</p>
        </div>
      </div>
    `;
    
    const body = Utils.createElement('div', 'p-6');
    body.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- 사이트 선택 -->
        <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
          <div class="flex items-center space-x-2 mb-3">
            <div class="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <i class="fas fa-globe text-white text-xs"></i>
            </div>
            <label class="block text-gray-700 font-semibold">🌐 사이트 선택</label>
          </div>
          <select id="siteFilter" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white min-h-[44px]">
            <option value="all">모든 사이트</option>
            ${this.sites.map(site => 
              `<option value="${site.id}" ${this.currentSite == site.id ? 'selected' : ''}>
                ${site.name}
              </option>`
            ).join('')}
          </select>
          <p class="text-xs text-gray-500 mt-2">특정 사이트의 사용자만 표시</p>
        </div>
        
        <!-- 정렬 기준 -->
        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
          <div class="flex items-center space-x-2 mb-3">
            <div class="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <i class="fas fa-sort text-white text-xs"></i>
            </div>
            <label class="block text-gray-700 font-semibold">📊 정렬 기준</label>
          </div>
          <select id="sortByFilter" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-h-[44px]">
            <option value="last_comment" ${this.sortBy === 'last_comment' ? 'selected' : ''}>최근 활동</option>
            <option value="comments_count" ${this.sortBy === 'comments_count' ? 'selected' : ''}>댓글 수</option>
            <option value="name" ${this.sortBy === 'name' ? 'selected' : ''}>이름</option>
            <option value="first_comment" ${this.sortBy === 'first_comment' ? 'selected' : ''}>가입일</option>
          </select>
          <p class="text-xs text-gray-500 mt-2">사용자 목록 정렬 방식</p>
        </div>
        
        <!-- 정렬 순서 -->
        <div class="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
          <div class="flex items-center space-x-2 mb-3">
            <div class="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <i class="fas fa-arrow-up-down text-white text-xs"></i>
            </div>
            <label class="block text-gray-700 font-semibold">🔄 정렬 순서</label>
          </div>
          <select id="sortOrderFilter" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white min-h-[44px]">
            <option value="desc" ${this.sortOrder === 'desc' ? 'selected' : ''}>내림차순</option>
            <option value="asc" ${this.sortOrder === 'asc' ? 'selected' : ''}>오름차순</option>
          </select>
          <p class="text-xs text-gray-500 mt-2">오름차순 또는 내림차순</p>
        </div>
        
        <!-- 검색 -->
        <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
          <div class="flex items-center space-x-2 mb-3">
            <div class="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <i class="fas fa-search text-white text-xs"></i>
            </div>
            <label class="block text-gray-700 font-semibold">🔍 빠른 검색</label>
          </div>
          <div class="relative">
            <input type="text" id="searchInput" placeholder="이름, 이메일로 검색..." value="${this.searchQuery}"
                   class="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white min-h-[44px]">
            <div class="absolute left-4 top-1/2 transform -translate-y-1/2">
              <i class="fas fa-search text-gray-400"></i>
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-2">실시간 검색 지원</p>
        </div>
      </div>
      
      <!-- 빠른 필터 버튼들 -->
      <div class="mt-6 pt-6 border-t border-gray-200">
        <h3 class="text-sm font-semibold text-gray-700 mb-3">빠른 필터</h3>
        <div class="flex flex-wrap gap-2">
          <button class="px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors" onclick="usersPage.applyQuickFilter('active')">
            ✅ 활성 사용자
          </button>
          <button class="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors" onclick="usersPage.applyQuickFilter('trusted')">
            🛡️ 신뢰 사용자
          </button>
          <button class="px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors" onclick="usersPage.applyQuickFilter('prolific')">
            📝 다작 사용자
          </button>
          <button class="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors" onclick="usersPage.applyQuickFilter('issues')">
            ⚠️ 문제 있는 사용자
          </button>
        </div>
      </div>
    `;
    
    section.appendChild(header);
    section.appendChild(body);
    
    // 이벤트 리스너 추가
    setTimeout(() => {
      const siteFilter = Utils.$('#siteFilter');
      const sortByFilter = Utils.$('#sortByFilter');
      const sortOrderFilter = Utils.$('#sortOrderFilter');
      const searchInput = Utils.$('#searchInput');
      
      if (siteFilter) {
        Utils.on(siteFilter, 'change', (e) => {
          this.currentSite = e.target.value;
          this.currentPage = 1;
          this.applyFiltersAndSort();
          this.refreshUsersTable();
        });
      }
      
      if (sortByFilter) {
        Utils.on(sortByFilter, 'change', (e) => {
          this.sortBy = e.target.value;
          this.applyFiltersAndSort();
          this.refreshUsersTable();
        });
      }
      
      if (sortOrderFilter) {
        Utils.on(sortOrderFilter, 'change', (e) => {
          this.sortOrder = e.target.value;
          this.applyFiltersAndSort();
          this.refreshUsersTable();
        });
      }
      
      if (searchInput) {
        Utils.on(searchInput, 'input', Utils.debounce((e) => {
          this.searchQuery = e.target.value;
          this.currentPage = 1;
          this.applyFiltersAndSort();
          this.refreshUsersTable();
        }, 300));
      }
    }, 100);
    
    return section;
  }

  createStatsSection() {
    const activeUsers = this.users.filter(u => u.status === 'active').length;
    const trustedUsers = this.users.filter(u => u.is_trusted).length;
    const totalComments = this.users.reduce((sum, u) => sum + u.comments_count, 0);
    const avgCommentsPerUser = totalComments / this.users.length || 0;

    const section = Utils.createElement('div', 'mb-6');
    const grid = Utils.createElement('div', 'stats-grid');

    const statCards = [
      {
        title: '활성 사용자',
        value: activeUsers,
        icon: 'fas fa-users',
        color: 'blue'
      },
      {
        title: '신뢰 사용자',
        value: trustedUsers,
        icon: 'fas fa-shield-check',
        color: 'green'
      },
      {
        title: '평균 댓글 수',
        value: Math.round(avgCommentsPerUser),
        icon: 'fas fa-comment-dots',
        color: 'purple'
      },
      {
        title: '총 사용자',
        value: this.users.length,
        icon: 'fas fa-user-friends',
        color: 'blue'
      }
    ];

    statCards.forEach(stat => {
      const card = Components.createStatCard(stat.title, stat.value, stat.icon, stat.color);
      grid.appendChild(card);
    });

    section.appendChild(grid);
    return section;
  }

  createUsersSection() {
    const section = Utils.createElement('div', 'card mb-6');
    const header = Utils.createElement('div', 'card-header');
    header.innerHTML = `
      <div class="flex items-center justify-between">
        <h2>사용자 목록</h2>
        <div class="text-sm text-gray-500">
          ${Utils.formatNumber(this.users.length)}명의 사용자
        </div>
      </div>
    `;
    
    const body = Utils.createElement('div', 'card-body');
    body.setAttribute('id', 'users-table-container');
    
    section.appendChild(header);
    section.appendChild(body);
    
    this.renderUsersTable(body);
    
    return section;
  }

  renderUsersTable(container) {
    if (this.filteredUsers.length === 0) {
      container.appendChild(Components.createEmptyState(
        '사용자가 없습니다',
        '선택한 조건에 맞는 사용자가 없습니다.',
        '필터 초기화',
        () => this.resetFilters()
      ));
      return;
    }

    const table = Utils.createElement('div', 'overflow-x-auto');
    table.innerHTML = `
      <table class="table">
        <thead>
          <tr>
            <th>사용자</th>
            <th>제공업체</th>
            <th>댓글 수</th>
            <th>최근 활동</th>
            <th>상태</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          ${this.filteredUsers.map(user => this.createUserRow(user)).join('')}
        </tbody>
      </table>
    `;
    
    container.appendChild(table);
  }

  createUserRow(user) {
    const statusBadge = this.getUserStatusBadge(user);
    const providerIcon = this.getProviderIcon(user.provider);
    
    return `
      <tr class="${user.status === 'banned' ? 'opacity-60' : ''}">
        <td>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              ${user.avatar ? 
                `<img src="${user.avatar}" alt="${user.name}" class="w-10 h-10 rounded-full">` :
                `<i class="fas fa-user text-gray-500"></i>`
              }
            </div>
            <div>
              <div class="font-medium text-gray-900">${user.name}</div>
              <div class="text-sm text-gray-500">${user.email}</div>
              ${user.is_trusted ? '<div class="text-xs text-green-600"><i class="fas fa-shield-check"></i> 신뢰 사용자</div>' : ''}
            </div>
          </div>
        </td>
        <td>
          <div class="flex items-center gap-2">
            ${providerIcon}
            <span class="text-sm capitalize">${user.provider}</span>
          </div>
        </td>
        <td>
          <div class="text-center">
            <div class="font-medium">${Utils.formatNumber(user.comments_count)}</div>
            <div class="text-xs text-gray-500">${user.total_likes_received} 좋아요</div>
          </div>
        </td>
        <td>
          <div class="text-sm">
            <div>${Utils.formatDateTime(user.last_comment)}</div>
            <div class="text-xs text-gray-500">
              가입: ${Utils.formatDate(user.first_comment)}
            </div>
          </div>
        </td>
        <td>
          ${statusBadge}
          ${user.spam_reports > 0 ? `<div class="text-xs text-red-600 mt-1">스팸 신고 ${user.spam_reports}건</div>` : ''}
        </td>
        <td>
          <div class="flex gap-1">
            <button class="btn btn-sm btn-secondary" onclick="usersPage.viewUser(${user.id})" title="상세 보기">
              <i class="fas fa-eye"></i>
            </button>
            ${user.status === 'active' ? 
              `<button class="btn btn-sm ${user.is_trusted ? 'btn-secondary' : 'btn-success'}" onclick="usersPage.toggleTrust(${user.id})" title="${user.is_trusted ? '신뢰 해제' : '신뢰 사용자로 설정'}">
                <i class="fas fa-shield-${user.is_trusted ? 'times' : 'check'}"></i>
              </button>` : ''
            }
            <button class="btn btn-sm ${user.status === 'banned' ? 'btn-success' : 'btn-danger'}" onclick="usersPage.toggleUserStatus(${user.id})" title="${user.status === 'banned' ? '차단 해제' : '사용자 차단'}">
              <i class="fas fa-${user.status === 'banned' ? 'unlock' : 'ban'}"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  getUserStatusBadge(user) {
    if (user.status === 'banned') {
      return '<span class="badge" style="background: #fee2e2; color: #dc2626;">차단됨</span>';
    } else {
      return '<span class="badge badge-success">활성</span>';
    }
  }

  getProviderIcon(provider) {
    const icons = {
      google: '<i class="fab fa-google text-red-500"></i>',
      github: '<i class="fab fa-github text-gray-800"></i>',
      facebook: '<i class="fab fa-facebook text-blue-600"></i>',
      twitter: '<i class="fab fa-twitter text-blue-400"></i>',
      kakao: '<i class="fas fa-comment text-yellow-500"></i>',
      line: '<i class="fab fa-line text-green-500"></i>',
      email: '<i class="fas fa-envelope text-gray-500"></i>'
    };
    return icons[provider] || icons.email;
  }

  createPagination() {
    const totalPages = Math.ceil(this.users.length / this.itemsPerPage);
    
    if (totalPages <= 1) {
      return Utils.createElement('div');
    }

    const pagination = Utils.createElement('div', 'flex items-center justify-center gap-2');
    
    // 이전 버튼
    const prevBtn = Utils.createElement('button', 
      `btn btn-sm ${this.currentPage === 1 ? 'btn-secondary opacity-50' : 'btn-secondary'}`,
      '<i class="fas fa-chevron-left"></i> 이전'
    );
    if (this.currentPage > 1) {
      Utils.on(prevBtn, 'click', () => this.goToPage(this.currentPage - 1));
    }
    pagination.appendChild(prevBtn);
    
    // 페이지 번호들
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(totalPages, this.currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = Utils.createElement('button', 
        `btn btn-sm ${i === this.currentPage ? 'btn-primary' : 'btn-secondary'}`,
        i.toString()
      );
      Utils.on(pageBtn, 'click', () => this.goToPage(i));
      pagination.appendChild(pageBtn);
    }
    
    // 다음 버튼
    const nextBtn = Utils.createElement('button', 
      `btn btn-sm ${this.currentPage === totalPages ? 'btn-secondary opacity-50' : 'btn-secondary'}`,
      '다음 <i class="fas fa-chevron-right"></i>'
    );
    if (this.currentPage < totalPages) {
      Utils.on(nextBtn, 'click', () => this.goToPage(this.currentPage + 1));
    }
    pagination.appendChild(nextBtn);
    
    return pagination;
  }

  goToPage(page) {
    this.currentPage = page;
    this.applyPagination();
    this.refreshUsersTable();
    this.refreshPagination();
  }

  refreshUsersTable() {
    const container = Utils.$('#users-table-container');
    container.innerHTML = '';
    this.renderUsersTable(container);
  }

  refreshPagination() {
    const existingPagination = Utils.$('.flex.items-center.justify-center.gap-2');
    if (existingPagination) {
      const newPagination = this.createPagination();
      existingPagination.parentNode.replaceChild(newPagination, existingPagination);
    }
  }

  viewUser(userId) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return;

    const modalContent = Utils.createElement('div', 'space-y-4');
    modalContent.innerHTML = `
      <div class="flex items-center gap-4 pb-4 border-b">
        <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
          ${user.avatar ? 
            `<img src="${user.avatar}" alt="${user.name}" class="w-16 h-16 rounded-full">` :
            `<i class="fas fa-user text-gray-500 text-2xl"></i>`
          }
        </div>
        <div>
          <h3 class="text-xl font-semibold">${user.name}</h3>
          <p class="text-gray-600">${user.email}</p>
          <div class="flex gap-2 mt-2">
            ${this.getUserStatusBadge(user)}
            ${user.is_trusted ? '<span class="badge badge-success">신뢰 사용자</span>' : ''}
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-3">
          <div>
            <label class="text-sm font-medium text-gray-700">로그인 제공업체</label>
            <div class="flex items-center gap-2 mt-1">
              ${this.getProviderIcon(user.provider)}
              <span class="capitalize">${user.provider}</span>
            </div>
          </div>
          
          <div>
            <label class="text-sm font-medium text-gray-700">댓글 수</label>
            <div class="text-lg font-semibold">${Utils.formatNumber(user.comments_count)}</div>
          </div>
          
          <div>
            <label class="text-sm font-medium text-gray-700">받은 좋아요</label>
            <div class="text-lg font-semibold">${Utils.formatNumber(user.total_likes_received)}</div>
          </div>
        </div>
        
        <div class="space-y-3">
          <div>
            <label class="text-sm font-medium text-gray-700">첫 댓글</label>
            <div>${Utils.formatDateTime(user.first_comment)}</div>
          </div>
          
          <div>
            <label class="text-sm font-medium text-gray-700">최근 활동</label>
            <div>${Utils.formatDateTime(user.last_comment)}</div>
          </div>
          
          <div>
            <label class="text-sm font-medium text-gray-700">스팸 신고</label>
            <div class="${user.spam_reports > 0 ? 'text-red-600 font-medium' : ''}">${user.spam_reports}건</div>
          </div>
        </div>
      </div>
      
      <div>
        <label class="text-sm font-medium text-gray-700">참여 사이트</label>
        <div class="flex flex-wrap gap-2 mt-2">
          ${user.sites_participated.map(site => `
            <span class="badge badge-success">${site}</span>
          `).join('')}
        </div>
      </div>
    `;

    const modal = Components.createModal('사용자 상세 정보', modalContent, [
      {
        text: '댓글 보기',
        class: 'btn-primary',
        onclick: () => {
          Components.closeModal(modal);
          Router.navigate('comments');
          // TODO: 해당 사용자의 댓글만 필터링
        }
      },
      {
        text: '닫기',
        class: 'btn-secondary',
        onclick: () => Components.closeModal(modal)
      }
    ]);

    Components.showModal(modal);
  }

  toggleTrust(userId) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return;

    const action = user.is_trusted ? '신뢰 해제' : '신뢰 사용자로 설정';
    
    if (!confirm(`${user.name}을(를) ${action}하시겠습니까?`)) {
      return;
    }

    user.is_trusted = !user.is_trusted;
    Utils.showNotification(`${user.name}이(가) ${action}되었습니다.`, 'success');
    this.refreshUsersTable();
  }

  toggleUserStatus(userId) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return;

    const action = user.status === 'banned' ? '차단 해제' : '차단';
    
    if (!confirm(`${user.name}을(를) ${action}하시겠습니까?`)) {
      return;
    }

    user.status = user.status === 'banned' ? 'active' : 'banned';
    Utils.showNotification(`${user.name}이(가) ${action}되었습니다.`, 'success');
    this.refreshUsersTable();
  }

  resetFilters() {
    this.currentSite = 'all';
    this.searchQuery = '';
    this.sortBy = 'last_activity';
    this.sortOrder = 'desc';
    this.currentPage = 1;
    this.render();
  }

  // 빠른 필터 적용
  applyQuickFilter(filterType) {
    let filteredUsers = [...this.users];

    switch (filterType) {
      case 'active':
        filteredUsers = this.users.filter(user => user.status === 'active');
        Utils.showNotification('활성 사용자만 표시합니다.', 'success');
        break;
      
      case 'trusted':
        filteredUsers = this.users.filter(user => user.is_trusted);
        Utils.showNotification('신뢰 사용자만 표시합니다.', 'success');
        break;
      
      case 'prolific':
        filteredUsers = this.users.filter(user => user.comments_count >= 20).sort((a, b) => b.comments_count - a.comments_count);
        Utils.showNotification('댓글을 많이 작성한 사용자를 표시합니다.', 'success');
        break;
      
      case 'issues':
        filteredUsers = this.users.filter(user => user.spam_reports > 0 || user.status === 'banned');
        Utils.showNotification('문제가 있는 사용자를 표시합니다.', 'warning');
        break;
      
      default:
        filteredUsers = [...this.users];
        break;
    }

    this.users = filteredUsers;
    this.currentPage = 1;
    this.applyPagination();
    this.refreshUsersTable();
  }

  // 사용자 분석 모달
  showUserAnalytics() {
    Utils.showNotification('사용자 분석 기능은 곧 제공될 예정입니다.', 'info');
  }

  showBulkActions() {
    Utils.showNotification('대량 작업 기능은 곧 제공될 예정입니다.', 'info');
  }

  exportUsers() {
    try {
      const csvContent = [
        ['사용자 ID', '이름', '이메일', '로그인 제공업체', '댓글 수', '받은 좋아요', '최근 활동', '가입일', '상태', '신뢰 사용자', '스팸 신고'],
        ...this.users.map(user => [
          user.id,
          user.name,
          user.email,
          user.provider,
          user.comments_count,
          user.total_likes_received,
          Utils.formatDateTime(user.last_comment),
          Utils.formatDateTime(user.first_comment),
          user.status === 'active' ? '활성' : '차단됨',
          user.is_trusted ? '예' : '아니오',
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