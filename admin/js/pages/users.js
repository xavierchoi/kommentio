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
    const header = Utils.createElement('div', 'flex items-center justify-between mb-6');
    
    header.innerHTML = `
      <div>
        <h1 class="text-3xl font-bold text-gray-900">사용자 관리</h1>
        <p class="text-gray-600 mt-2">댓글을 작성한 사용자들을 관리하고 모니터링하세요</p>
      </div>
      <div class="flex gap-3">
        <button class="btn btn-secondary" onclick="usersPage.exportUsers()">
          <i class="fas fa-download"></i> 사용자 내보내기
        </button>
        <button class="btn btn-primary" onclick="usersPage.showBulkActions()">
          <i class="fas fa-users-cog"></i> 대량 작업
        </button>
      </div>
    `;
    
    return header;
  }

  createFiltersSection() {
    const section = Utils.createElement('div', 'card mb-6');
    const body = Utils.createElement('div', 'card-body');
    
    body.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- 사이트 선택 -->
        <div>
          <label class="input-label">사이트</label>
          <select class="input" id="siteFilter">
            <option value="all">모든 사이트</option>
            ${this.sites.map(site => 
              `<option value="${site.id}" ${this.currentSite == site.id ? 'selected' : ''}>
                ${site.name}
              </option>`
            ).join('')}
          </select>
        </div>
        
        <!-- 정렬 기준 -->
        <div>
          <label class="input-label">정렬 기준</label>
          <select class="input" id="sortByFilter">
            <option value="last_comment" ${this.sortBy === 'last_comment' ? 'selected' : ''}>최근 활동</option>
            <option value="comments_count" ${this.sortBy === 'comments_count' ? 'selected' : ''}>댓글 수</option>
            <option value="name" ${this.sortBy === 'name' ? 'selected' : ''}>이름</option>
            <option value="first_comment" ${this.sortBy === 'first_comment' ? 'selected' : ''}>가입일</option>
          </select>
        </div>
        
        <!-- 정렬 순서 -->
        <div>
          <label class="input-label">정렬 순서</label>
          <select class="input" id="sortOrderFilter">
            <option value="desc" ${this.sortOrder === 'desc' ? 'selected' : ''}>내림차순</option>
            <option value="asc" ${this.sortOrder === 'asc' ? 'selected' : ''}>오름차순</option>
          </select>
        </div>
        
        <!-- 검색 -->
        <div>
          <label class="input-label">검색</label>
          <input type="text" class="input" id="searchInput" placeholder="이름, 이메일..." value="${this.searchQuery}">
        </div>
      </div>
    `;
    
    section.appendChild(body);
    
    // 이벤트 리스너 추가
    Utils.on(Utils.$('#siteFilter'), 'change', (e) => {
      this.currentSite = e.target.value;
      this.currentPage = 1;
      this.applyFiltersAndSort();
      this.refreshUsersTable();
    });
    
    Utils.on(Utils.$('#sortByFilter'), 'change', (e) => {
      this.sortBy = e.target.value;
      this.applyFiltersAndSort();
      this.refreshUsersTable();
    });
    
    Utils.on(Utils.$('#sortOrderFilter'), 'change', (e) => {
      this.sortOrder = e.target.value;
      this.applyFiltersAndSort();
      this.refreshUsersTable();
    });
    
    Utils.on(Utils.$('#searchInput'), 'input', Utils.debounce((e) => {
      this.searchQuery = e.target.value;
      this.currentPage = 1;
      this.applyFiltersAndSort();
      this.refreshUsersTable();
    }, 300));
    
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

  showBulkActions() {
    Utils.showNotification('대량 작업 기능은 곧 제공될 예정입니다.', 'info');
  }

  exportUsers() {
    Utils.showNotification('사용자 내보내기 기능은 곧 제공될 예정입니다.', 'info');
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