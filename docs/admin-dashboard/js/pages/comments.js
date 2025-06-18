// Kommentio Admin Dashboard - Comments Management Page

class CommentsPage {
  constructor() {
    this.comments = [];
    this.filteredComments = [];
    this.sites = [];
    this.currentSite = 'all';
    this.currentStatus = 'all';
    this.currentPage = 1;
    this.itemsPerPage = 20;
    this.searchQuery = '';
    this.eventListeners = new Map();
    this.destroyed = false;
    this.searchTimeout = null;
  }

  async render() {
    const container = Utils.$('#page-comments');
    container.innerHTML = '';

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
      await this.loadComments();

      // 댓글 테이블
      const commentsSection = this.createCommentsSection();
      container.appendChild(commentsSection);

      // 페이징
      const pagination = this.createPagination();
      container.appendChild(pagination);

    } catch (error) {
      console.error('댓글 데이터 로딩 실패:', error);
      Utils.logError(error, '댓글 페이지 렌더링');
      
      // 구체적인 에러 메시지 표시
      let errorMessage = '댓글 데이터를 불러오는 중 오류가 발생했습니다.';
      if (error.message === 'Comment not found') {
        errorMessage = '댓글을 찾을 수 없습니다.';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = '네트워크 연결을 확인해주세요.';
      }
      
      Utils.showNotification(errorMessage, 'error');
      container.appendChild(this.createErrorState(errorMessage));
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

  async loadComments() {
    try {
      let allComments = [];

      if (this.currentSite === 'all') {
        // 모든 사이트의 댓글 조회
        if (this.sites.length === 0) {
          console.warn('사이트가 없어서 댓글을 로드할 수 없습니다.');
          this.comments = [];
          this.filteredComments = [];
          return;
        }

        for (const site of this.sites) {
          try {
            const result = await window.apiService.getComments(site.id, {
              status: this.currentStatus,
              limit: 100 // 임시로 많이 가져오기
            });
            
            if (result && result.comments) {
              const commentsWithSite = result.comments.map(comment => ({
                ...comment,
                site_name: site.name,
                site_domain: site.domain
              }));
              
              allComments = allComments.concat(commentsWithSite);
            }
          } catch (siteError) {
            console.warn(`사이트 ${site.name}의 댓글 로딩 실패:`, siteError);
            // 하나의 사이트 실패해도 계속 진행
          }
        }
      } else {
        // 특정 사이트의 댓글만 조회
        const result = await window.apiService.getComments(parseInt(this.currentSite), {
          status: this.currentStatus,
          limit: 100
        });
        
        if (result && result.comments) {
          const site = this.sites.find(s => s.id == this.currentSite);
          allComments = result.comments.map(comment => ({
            ...comment,
            site_name: site?.name || 'Unknown',
            site_domain: site?.domain || 'unknown.com'
          }));
        }
      }

      // 검색 필터링
      if (this.searchQuery) {
        allComments = allComments.filter(comment =>
          comment.content && comment.content.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          comment.author_name && comment.author_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          comment.author_email && comment.author_email.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }

      // 날짜순 정렬
      allComments.sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return dateB - dateA;
      });

      this.comments = allComments;
      this.applyPagination();
      
    } catch (error) {
      console.error('댓글 로딩 실패:', error);
      Utils.logError(error, '댓글 로딩');
      this.comments = [];
      this.filteredComments = [];
      throw error; // 에러를 다시 던져서 UI에서 처리할 수 있도록
    }
  }

  applyPagination() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredComments = this.comments.slice(startIndex, endIndex);
  }

  createPageHeader() {
    const header = Utils.createElement('div', 'mb-8');
    header.innerHTML = `
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div class="flex items-center space-x-4">
          <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl">
            <i class="fas fa-comments text-white text-2xl"></i>
          </div>
          <div>
            <h1 class="text-3xl font-bold text-gray-900">댓글 관리</h1>
            <p class="text-gray-600 mt-1">사이트에 등록된 댓글들을 전문적으로 관리하고 승인하세요</p>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <div class="hidden lg:flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
            <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span class="text-blue-700 text-sm font-medium">실시간 모니터링</span>
          </div>
          <button id="refresh-comments-btn" class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2 shadow-sm">
            <i class="fas fa-sync-alt"></i>
            <span>새로고침</span>
          </button>
          <button class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2 shadow-sm" onclick="commentsPage.exportComments()">
            <i class="fas fa-download"></i>
            <span>내보내기</span>
          </button>
          <button id="bulk-actions-btn" class="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 flex items-center space-x-2 shadow-lg">
            <i class="fas fa-tasks"></i>
            <span>대량 작업</span>
          </button>
        </div>
      </div>
    `;
    
    // 새로고침 버튼 이벤트
    const refreshBtn = Utils.$('#refresh-comments-btn', header);
    if (refreshBtn) {
      Utils.on(refreshBtn, 'click', () => {
        this.loadComments().then(() => this.refreshCommentsTable());
        Utils.showToast('댓글 목록을 새로고침했습니다.', 'success');
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
        <h2 class="text-xl font-bold text-gray-900">고급 필터</h2>
        <p class="text-gray-600 text-sm">원하는 조건으로 댓글을 정확하게 필터링하세요</p>
      </div>
    `;
    section.appendChild(sectionHeader);
    
    // 그리드 컨테이너
    const grid = Utils.createElement('div', 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6');
    
    // 사이트 선택 필터
    const siteFilterDiv = Utils.createElement('div', 'space-y-2');
    const siteLabel = Utils.createElement('label', 'block text-sm font-semibold text-gray-700 mb-2', '🌐 사이트 선택');
    const siteFilterWrapper = Utils.createElement('div', 'relative');
    const siteFilter = Utils.createElement('select', 'w-full p-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200');
    siteFilter.id = 'siteFilter';
    
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
      this.loadComments().then(() => this.refreshCommentsTable());
    });
    
    siteFilterWrapper.appendChild(siteFilter);
    siteFilterDiv.appendChild(siteLabel);
    siteFilterDiv.appendChild(siteFilterWrapper);
    
    // 상태 선택 필터
    const statusFilterDiv = Utils.createElement('div', 'space-y-2');
    const statusLabel = Utils.createElement('label', 'block text-sm font-semibold text-gray-700 mb-2', '📊 상태 필터');
    const statusFilterWrapper = Utils.createElement('div', 'relative');
    const statusFilter = Utils.createElement('select', 'w-full p-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200');
    statusFilter.id = 'statusFilter';
    
    const statusOptions = [
      { value: 'all', text: '모든 상태', icon: '🔄' },
      { value: 'approved', text: '승인됨', icon: '✅' },
      { value: 'pending', text: '대기 중', icon: '⏳' },
      { value: 'spam', text: '스팸', icon: '🚫' }
    ];
    
    statusOptions.forEach(status => {
      const option = Utils.createElement('option', '', `${status.icon} ${status.text}`);
      option.value = status.value;
      if (this.currentStatus === status.value) option.selected = true;
      statusFilter.appendChild(option);
    });
    
    Utils.on(statusFilter, 'change', (e) => {
      this.currentStatus = e.target.value;
      this.currentPage = 1;
      this.loadComments().then(() => this.refreshCommentsTable());
    });
    
    statusFilterWrapper.appendChild(statusFilter);
    statusFilterDiv.appendChild(statusLabel);
    statusFilterDiv.appendChild(statusFilterWrapper);
    
    // 검색 입력
    const searchDiv = Utils.createElement('div', 'space-y-2');
    const searchLabel = Utils.createElement('label', 'block text-sm font-semibold text-gray-700 mb-2', '🔍 빠른 검색');
    const searchWrapper = Utils.createElement('div', 'relative');
    const searchInput = Utils.createElement('input', 'w-full p-3 pl-10 border border-gray-300 rounded-lg bg-white shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200');
    searchInput.type = 'text';
    searchInput.id = 'searchInput';
    searchInput.placeholder = '댓글 내용, 작성자, 이메일...';
    searchInput.value = this.searchQuery;
    
    const searchIcon = Utils.createElement('div', 'absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none');
    searchIcon.innerHTML = '<i class="fas fa-search text-gray-400"></i>';
    
    Utils.on(searchInput, 'input', Utils.debounce((e) => {
      this.searchQuery = e.target.value;
      this.currentPage = 1;
      this.loadComments().then(() => this.refreshCommentsTable());
    }, 300));
    
    searchWrapper.appendChild(searchIcon);
    searchWrapper.appendChild(searchInput);
    searchDiv.appendChild(searchLabel);
    searchDiv.appendChild(searchWrapper);
    
    // 통계 표시
    const statsDiv = Utils.createElement('div', 'space-y-2');
    const statsLabel = Utils.createElement('label', 'block text-sm font-semibold text-gray-700 mb-2', '📈 통계 정보');
    const statsCard = Utils.createElement('div', 'bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200');
    
    statsCard.innerHTML = `
      <div class="text-center">
        <div class="text-3xl font-bold text-indigo-600 mb-1">${Utils.formatNumber(this.comments.length)}</div>
        <div class="text-sm text-indigo-700 font-medium">총 댓글</div>
      </div>
    `;
    
    statsDiv.appendChild(statsLabel);
    statsDiv.appendChild(statsCard);
    
    // 모든 필터를 그리드에 추가
    grid.appendChild(siteFilterDiv);
    grid.appendChild(statusFilterDiv);
    grid.appendChild(searchDiv);
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

  createCommentsSection() {
    const section = Utils.createElement('div', 'bg-white rounded-xl shadow-lg border border-gray-200 mb-8');
    
    // 섹션 헤더
    const header = Utils.createElement('div', 'p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100');
    header.innerHTML = `
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <i class="fas fa-list text-white text-sm"></i>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">댓글 목록</h2>
            <p class="text-gray-600 text-sm">등록된 댓글들을 확인하고 관리하세요</p>
          </div>
        </div>
        <div class="flex flex-wrap gap-3">
          <label class="flex items-center space-x-2 text-sm text-gray-600 bg-white px-3 py-2 rounded-lg border border-gray-300 shadow-sm">
            <input type="checkbox" id="select-all-comments" class="rounded text-blue-600 focus:ring-blue-500">
            <span>전체 선택</span>
          </label>
          <button class="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-2 shadow-sm disabled:opacity-50" onclick="commentsPage.bulkApprove()">
            <i class="fas fa-check"></i>
            <span>선택 승인</span>
          </button>
          <button class="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center space-x-2 shadow-sm disabled:opacity-50" onclick="commentsPage.bulkReject()">
            <i class="fas fa-times"></i>
            <span>선택 거절</span>
          </button>
          <button class="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center space-x-2 shadow-sm disabled:opacity-50" onclick="commentsPage.bulkMarkSpam()">
            <i class="fas fa-shield-alt"></i>
            <span>선택 스팸</span>
          </button>
        </div>
      </div>
    `;
    
    const body = Utils.createElement('div', 'p-6');
    body.setAttribute('id', 'comments-table-container');
    
    section.appendChild(header);
    section.appendChild(body);
    
    // 전체 선택 체크박스 이벤트
    const selectAllCheckbox = header.querySelector('#select-all-comments');
    Utils.on(selectAllCheckbox, 'change', (e) => {
      const commentCheckboxes = Utils.$$('.comment-checkbox');
      commentCheckboxes.forEach(cb => cb.checked = e.target.checked);
    });
    
    this.renderCommentsTable(body);
    
    return section;
  }

  renderCommentsTable(container) {
    if (this.filteredComments.length === 0) {
      container.appendChild(Components.createEmptyState(
        '댓글이 없습니다',
        '선택한 조건에 맞는 댓글이 없습니다.',
        '필터 초기화',
        () => this.resetFilters()
      ));
      return;
    }

    const table = Utils.createElement('div', 'space-y-4');
    
    this.filteredComments.forEach(comment => {
      const commentCard = this.createCommentCard(comment);
      table.appendChild(commentCard);
    });
    
    container.appendChild(table);
  }

  createCommentCard(comment) {
    const card = Utils.createElement('div', 'group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300');
    
    const statusBadge = this.getStatusBadge(comment);
    const spamScore = comment.spam_score ? (comment.spam_score * 100).toFixed(1) : 'N/A';
    
    card.innerHTML = `
      <div class="flex items-start space-x-4">
        <!-- 체크박스와 아바타 -->
        <div class="flex flex-col items-center space-y-3">
          <input type="checkbox" class="comment-checkbox w-5 h-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2" data-comment-id="${comment.id}">
          <div class="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
            <i class="fas fa-user text-blue-600"></i>
          </div>
        </div>
        
        <!-- 댓글 내용 -->
        <div class="flex-1 min-w-0">
          <!-- 작성자 정보 헤더 -->
          <div class="flex flex-wrap items-center gap-3 mb-3">
            <h3 class="font-semibold text-gray-900 text-lg">${comment.author_name}</h3>
            <span class="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">${comment.author_email}</span>
            ${statusBadge}
            ${comment.spam_score > 0.5 ? `
              <div class="flex items-center space-x-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-full text-xs font-medium border border-amber-200">
                <i class="fas fa-exclamation-triangle"></i>
                <span>스팸 ${spamScore}%</span>
              </div>
            ` : ''}
          </div>
          
          <!-- 댓글 본문 -->
          <div class="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4 mb-4">
            <p class="text-gray-900 leading-relaxed">${comment.content}</p>
          </div>
          
          <!-- 메타 정보 -->
          <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <div class="flex items-center space-x-1">
              <i class="fas fa-globe w-4 text-blue-500"></i>
              <span class="font-medium">${comment.site_name}</span>
            </div>
            <div class="flex items-center space-x-1">
              <i class="fas fa-link w-4 text-green-500"></i>
              <span class="truncate max-w-48">${comment.page_title || comment.page_url}</span>
            </div>
            <div class="flex items-center space-x-1">
              <i class="fas fa-clock w-4 text-purple-500"></i>
              <span>${Utils.formatDateTime(comment.created_at)}</span>
            </div>
            ${comment.parent_id ? `
              <div class="flex items-center space-x-1">
                <i class="fas fa-reply w-4 text-orange-500"></i>
                <span>답글</span>
              </div>
            ` : ''}
          </div>
        </div>
        
        <!-- 액션 버튼들 -->
        <div class="flex flex-col lg:flex-row gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          ${!comment.is_approved && !comment.is_spam ? `
            <button class="px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-1 text-sm font-medium shadow-sm" onclick="commentsPage.approveComment(${comment.id})">
              <i class="fas fa-check w-3"></i>
              <span>승인</span>
            </button>
          ` : ''}
          ${comment.is_approved ? `
            <button class="px-3 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 flex items-center space-x-1 text-sm font-medium shadow-sm" onclick="commentsPage.rejectComment(${comment.id})">
              <i class="fas fa-times w-3"></i>
              <span>취소</span>
            </button>
          ` : ''}
          ${!comment.is_spam ? `
            <button class="px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center space-x-1 text-sm font-medium shadow-sm" onclick="commentsPage.markAsSpam(${comment.id})">
              <i class="fas fa-shield-alt w-3"></i>
              <span>스팸</span>
            </button>
          ` : ''}
          <button class="px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-1 text-sm font-medium shadow-sm" onclick="commentsPage.viewComment(${comment.id})">
            <i class="fas fa-eye w-3"></i>
            <span>상세</span>
          </button>
          <button class="px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center space-x-1 text-sm font-medium shadow-sm" onclick="commentsPage.deleteComment(${comment.id})">
            <i class="fas fa-trash w-3"></i>
            <span>삭제</span>
          </button>
        </div>
      </div>
    `;
    
    return card;
  }

  getStatusBadge(comment) {
    if (comment.is_spam) {
      return `
        <div class="flex items-center space-x-1 bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-semibold border border-red-200">
          <i class="fas fa-ban"></i>
          <span>스팸</span>
        </div>
      `;
    } else if (comment.is_approved) {
      return `
        <div class="flex items-center space-x-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-semibold border border-green-200">
          <i class="fas fa-check-circle"></i>
          <span>승인됨</span>
        </div>
      `;
    } else {
      return `
        <div class="flex items-center space-x-1 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold border border-yellow-200">
          <i class="fas fa-clock"></i>
          <span>대기 중</span>
        </div>
      `;
    }
  }

  createPagination() {
    const totalPages = Math.ceil(this.comments.length / this.itemsPerPage);
    
    if (totalPages <= 1) {
      return Utils.createElement('div');
    }

    const paginationContainer = Utils.createElement('div', 'bg-white rounded-xl shadow-lg border border-gray-200 p-6');
    
    // 페이지네이션 헤더
    const header = Utils.createElement('div', 'flex items-center justify-between mb-4');
    header.innerHTML = `
      <div class="flex items-center space-x-2 text-sm text-gray-600">
        <i class="fas fa-info-circle text-blue-500"></i>
        <span>총 <strong class="text-gray-900">${this.comments.length}</strong>개의 댓글</span>
        <span class="text-gray-400">•</span>
        <span>페이지 <strong class="text-gray-900">${this.currentPage}</strong> / <strong class="text-gray-900">${totalPages}</strong></span>
      </div>
      <div class="flex items-center space-x-2">
        <label class="text-sm text-gray-600">페이지당</label>
        <select id="items-per-page" class="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
          <option value="10" ${this.itemsPerPage === 10 ? 'selected' : ''}>10개</option>
          <option value="20" ${this.itemsPerPage === 20 ? 'selected' : ''}>20개</option>
          <option value="50" ${this.itemsPerPage === 50 ? 'selected' : ''}>50개</option>
        </select>
      </div>
    `;
    
    const pagination = Utils.createElement('div', 'flex items-center justify-center space-x-2');
    
    // 첫 페이지 버튼
    if (this.currentPage > 3) {
      const firstBtn = Utils.createElement('button', 'px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200', '1');
      Utils.on(firstBtn, 'click', () => this.goToPage(1));
      pagination.appendChild(firstBtn);
      
      if (this.currentPage > 4) {
        const dots = Utils.createElement('span', 'px-2 text-gray-400', '...');
        pagination.appendChild(dots);
      }
    }
    
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
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
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
    
    // 마지막 페이지 버튼
    if (this.currentPage < totalPages - 2) {
      if (this.currentPage < totalPages - 3) {
        const dots = Utils.createElement('span', 'px-2 text-gray-400', '...');
        pagination.appendChild(dots);
      }
      
      const lastBtn = Utils.createElement('button', 'px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200', totalPages.toString());
      Utils.on(lastBtn, 'click', () => this.goToPage(totalPages));
      pagination.appendChild(lastBtn);
    }
    
    paginationContainer.appendChild(header);
    paginationContainer.appendChild(pagination);
    
    // 페이지당 항목 수 변경 이벤트
    const itemsPerPageSelect = header.querySelector('#items-per-page');
    Utils.on(itemsPerPageSelect, 'change', (e) => {
      this.itemsPerPage = parseInt(e.target.value);
      this.currentPage = 1;
      this.applyPagination();
      this.refreshCommentsTable();
      this.refreshPagination();
    });
    
    return paginationContainer;
  }

  goToPage(page) {
    this.currentPage = page;
    this.applyPagination();
    this.refreshCommentsTable();
    this.refreshPagination();
  }

  refreshCommentsTable() {
    const container = Utils.$('#comments-table-container');
    container.innerHTML = '';
    this.renderCommentsTable(container);
  }

  refreshPagination() {
    const existingPagination = Utils.$('.flex.items-center.justify-center.gap-2');
    if (existingPagination) {
      const newPagination = this.createPagination();
      existingPagination.parentNode.replaceChild(newPagination, existingPagination);
    }
  }

  async approveComment(commentId) {
    try {
      await window.apiService.approveComment(commentId);
      Utils.showNotification('댓글이 승인되었습니다.', 'success');
      await this.loadComments();
      this.refreshCommentsTable();
    } catch (error) {
      console.error('댓글 승인 실패:', error);
      Utils.showNotification('댓글 승인에 실패했습니다.', 'error');
    }
  }

  async rejectComment(commentId) {
    try {
      await window.apiService.rejectComment(commentId);
      Utils.showNotification('댓글 승인이 취소되었습니다.', 'success');
      await this.loadComments();
      this.refreshCommentsTable();
    } catch (error) {
      console.error('댓글 승인 취소 실패:', error);
      Utils.showNotification('댓글 승인 취소에 실패했습니다.', 'error');
    }
  }

  async markAsSpam(commentId) {
    try {
      await window.apiService.markAsSpam(commentId);
      Utils.showNotification('댓글이 스팸으로 표시되었습니다.', 'success');
      await this.loadComments();
      this.refreshCommentsTable();
    } catch (error) {
      console.error('스팸 표시 실패:', error);
      Utils.showNotification('스팸 표시에 실패했습니다.', 'error');
    }
  }

  async deleteComment(commentId) {
    if (!confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await window.apiService.deleteComment(commentId);
      Utils.showNotification('댓글이 삭제되었습니다.', 'success');
      await this.loadComments();
      this.refreshCommentsTable();
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      Utils.showNotification('댓글 삭제에 실패했습니다.', 'error');
    }
  }

  viewComment(commentId) {
    const comment = this.comments.find(c => c.id === commentId);
    if (!comment) return;

    const modalContent = Utils.createElement('div', 'space-y-4');
    modalContent.innerHTML = `
      <div class="space-y-3">
        <div>
          <strong>작성자:</strong> ${comment.author_name} (${comment.author_email})
        </div>
        <div>
          <strong>사이트:</strong> ${comment.site_name}
        </div>
        <div>
          <strong>페이지:</strong> ${comment.page_title || comment.page_url}
        </div>
        <div>
          <strong>작성일:</strong> ${Utils.formatDateTime(comment.created_at)}
        </div>
        <div>
          <strong>상태:</strong> ${this.getStatusBadge(comment)}
        </div>
        ${comment.spam_score > 0 ? `
        <div>
          <strong>스팸 점수:</strong> ${(comment.spam_score * 100).toFixed(1)}%
        </div>
        ` : ''}
        <div>
          <strong>댓글 내용:</strong>
          <div class="bg-gray-50 p-3 rounded mt-2">${comment.content}</div>
        </div>
      </div>
    `;

    const modal = Components.createModal('댓글 상세보기', modalContent, [
      {
        text: '닫기',
        class: 'btn-secondary',
        onclick: () => Components.closeModal(modal)
      }
    ]);

    Components.showModal(modal);
  }

  bulkApprove() {
    const selectedComments = this.getSelectedComments();
    if (selectedComments.length === 0) {
      Utils.showNotification('승인할 댓글을 선택해주세요.', 'warning');
      return;
    }

    if (!confirm(`선택한 ${selectedComments.length}개의 댓글을 승인하시겠습니까?`)) {
      return;
    }

    // 각 댓글을 순차적으로 승인
    this.processBulkAction(selectedComments, 'approve');
  }

  bulkReject() {
    const selectedComments = this.getSelectedComments();
    if (selectedComments.length === 0) {
      Utils.showNotification('거절할 댓글을 선택해주세요.', 'warning');
      return;
    }

    if (!confirm(`선택한 ${selectedComments.length}개의 댓글을 거절하시겠습니까?`)) {
      return;
    }

    this.processBulkAction(selectedComments, 'reject');
  }

  bulkMarkSpam() {
    const selectedComments = this.getSelectedComments();
    if (selectedComments.length === 0) {
      Utils.showNotification('스팸으로 표시할 댓글을 선택해주세요.', 'warning');
      return;
    }

    if (!confirm(`선택한 ${selectedComments.length}개의 댓글을 스팸으로 표시하시겠습니까?`)) {
      return;
    }

    this.processBulkAction(selectedComments, 'spam');
  }

  async processBulkAction(commentIds, action) {
    let successCount = 0;
    let errorCount = 0;

    for (const commentId of commentIds) {
      try {
        if (action === 'approve') {
          await window.apiService.approveComment(commentId);
        } else if (action === 'reject') {
          await window.apiService.rejectComment(commentId);
        } else if (action === 'spam') {
          await window.apiService.markAsSpam(commentId);
        }
        successCount++;
      } catch (error) {
        console.error(`댓글 ${commentId} ${action} 실패:`, error);
        errorCount++;
      }
    }

    if (successCount > 0) {
      const actionText = action === 'approve' ? '승인' : action === 'reject' ? '거절' : '스팸 표시';
      Utils.showNotification(`${successCount}개의 댓글이 ${actionText} 처리되었습니다.`, 'success');
    }
    if (errorCount > 0) {
      Utils.showNotification(`${errorCount}개의 댓글 처리에 실패했습니다.`, 'error');
    }

    await this.loadComments();
    this.refreshCommentsTable();
  }

  getSelectedComments() {
    const checkboxes = Utils.$$('.comment-checkbox:checked');
    return Array.from(checkboxes).map(cb => parseInt(cb.dataset.commentId));
  }

  resetFilters() {
    this.currentSite = 'all';
    this.currentStatus = 'all';
    this.searchQuery = '';
    this.currentPage = 1;
    this.render();
  }

  exportComments() {
    try {
      const csvContent = [
        ['댓글 ID', '작성자', '이메일', '내용', '사이트', '상태', '작성일', '스팸 점수'],
        ...this.comments.map(comment => [
          comment.id,
          comment.author_name,
          comment.author_email,
          comment.content.replace(/"/g, '""'), // CSV escape
          comment.site_name,
          comment.is_spam ? '스팸' : comment.is_approved ? '승인됨' : '대기중',
          Utils.formatDateTime(comment.created_at),
          comment.spam_score ? (comment.spam_score * 100).toFixed(1) + '%' : 'N/A'
        ])
      ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `comments_export_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      Utils.showNotification('댓글 목록이 CSV 파일로 다운로드되었습니다.', 'success');
    } catch (error) {
      console.error('댓글 내보내기 실패:', error);
      Utils.showNotification('파일 내보내기에 실패했습니다.', 'error');
    }
  }

  createErrorState(message = '댓글 데이터를 불러오는 중 오류가 발생했습니다.') {
    return Components.createEmptyState(
      '데이터 로딩 실패',
      message,
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

  // 메모리에 효율적인 검색 디바운스
  debouncedSearch(query) {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    this.searchTimeout = setTimeout(() => {
      if (!this.destroyed) {
        this.searchQuery = query;
        this.currentPage = 1;
        this.filterComments();
        this.refreshCommentsTable();
      }
    }, 300);
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
    
    console.log('CommentsPage destroyed and cleaned up');
  }
}

// 전역으로 사용할 수 있도록 export
window.CommentsPage = CommentsPage;