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
    const header = Utils.createElement('div', 'flex items-center justify-between mb-6');
    
    header.innerHTML = `
      <div>
        <h1 class="text-3xl font-bold text-gray-900">댓글 관리</h1>
        <p class="text-gray-600 mt-2">사이트에 등록된 댓글들을 관리하고 승인하세요</p>
      </div>
      <div class="flex gap-3">
        <button class="btn btn-secondary" onclick="commentsPage.exportComments()">
          <i class="fas fa-download"></i> 내보내기
        </button>
      </div>
    `;
    
    return header;
  }

  createFiltersSection() {
    const section = Utils.createElement('div', 'card mb-6');
    const body = Utils.createElement('div', 'card-body');
    
    // 그리드 컨테이너
    const grid = Utils.createElement('div', 'grid grid-cols-1 md:grid-cols-4 gap-4');
    
    // 사이트 선택 필터
    const siteFilterDiv = Utils.createElement('div');
    const siteLabel = Utils.createElement('label', 'input-label', '사이트');
    const siteFilter = Utils.createElement('select', 'input');
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
    
    siteFilterDiv.appendChild(siteLabel);
    siteFilterDiv.appendChild(siteFilter);
    
    // 상태 선택 필터
    const statusFilterDiv = Utils.createElement('div');
    const statusLabel = Utils.createElement('label', 'input-label', '상태');
    const statusFilter = Utils.createElement('select', 'input');
    statusFilter.id = 'statusFilter';
    
    const statusOptions = [
      { value: 'all', text: '모든 상태' },
      { value: 'approved', text: '승인됨' },
      { value: 'pending', text: '대기 중' },
      { value: 'spam', text: '스팸' }
    ];
    
    statusOptions.forEach(status => {
      const option = Utils.createElement('option', '', status.text);
      option.value = status.value;
      if (this.currentStatus === status.value) option.selected = true;
      statusFilter.appendChild(option);
    });
    
    Utils.on(statusFilter, 'change', (e) => {
      this.currentStatus = e.target.value;
      this.currentPage = 1;
      this.loadComments().then(() => this.refreshCommentsTable());
    });
    
    statusFilterDiv.appendChild(statusLabel);
    statusFilterDiv.appendChild(statusFilter);
    
    // 검색 입력
    const searchDiv = Utils.createElement('div');
    const searchLabel = Utils.createElement('label', 'input-label', '검색');
    const searchInput = Utils.createElement('input', 'input');
    searchInput.type = 'text';
    searchInput.id = 'searchInput';
    searchInput.placeholder = '댓글 내용, 작성자...';
    searchInput.value = this.searchQuery;
    
    Utils.on(searchInput, 'input', Utils.debounce((e) => {
      this.searchQuery = e.target.value;
      this.currentPage = 1;
      this.loadComments().then(() => this.refreshCommentsTable());
    }, 300));
    
    searchDiv.appendChild(searchLabel);
    searchDiv.appendChild(searchInput);
    
    // 통계 표시
    const statsDiv = Utils.createElement('div');
    const statsLabel = Utils.createElement('label', 'input-label', '총 댓글 수');
    const statsValue = Utils.createElement('div', 'text-2xl font-bold text-gray-900', Utils.formatNumber(this.comments.length));
    
    statsDiv.appendChild(statsLabel);
    statsDiv.appendChild(statsValue);
    
    // 모든 필터를 그리드에 추가
    grid.appendChild(siteFilterDiv);
    grid.appendChild(statusFilterDiv);
    grid.appendChild(searchDiv);
    grid.appendChild(statsDiv);
    
    body.appendChild(grid);
    section.appendChild(body);
    
    return section;
  }

  createCommentsSection() {
    const section = Utils.createElement('div', 'card mb-6');
    const header = Utils.createElement('div', 'card-header');
    header.innerHTML = `
      <div class="flex items-center justify-between">
        <h2>댓글 목록</h2>
        <div class="flex gap-2">
          <button class="btn btn-sm btn-success" onclick="commentsPage.bulkApprove()">
            <i class="fas fa-check"></i> 선택한 댓글 승인
          </button>
          <button class="btn btn-sm btn-danger" onclick="commentsPage.bulkReject()">
            <i class="fas fa-times"></i> 선택한 댓글 거절
          </button>
        </div>
      </div>
    `;
    
    const body = Utils.createElement('div', 'card-body');
    body.setAttribute('id', 'comments-table-container');
    
    section.appendChild(header);
    section.appendChild(body);
    
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
    const card = Utils.createElement('div', 'border border-gray-200 rounded-lg p-4');
    
    const statusBadge = this.getStatusBadge(comment);
    const spamScore = comment.spam_score ? (comment.spam_score * 100).toFixed(1) : 'N/A';
    
    card.innerHTML = `
      <div class="flex items-start justify-between">
        <div class="flex items-start gap-3 flex-1">
          <input type="checkbox" class="comment-checkbox mt-1" data-comment-id="${comment.id}">
          <div class="flex-1">
            <!-- 작성자 정보 -->
            <div class="flex items-center gap-2 mb-2">
              <strong class="text-gray-900">${comment.author_name}</strong>
              <span class="text-sm text-gray-500">${comment.author_email}</span>
              ${statusBadge}
              ${comment.spam_score > 0.5 ? `<span class="badge" style="background: #fef3c7; color: #d97706;">스팸 점수: ${spamScore}%</span>` : ''}
            </div>
            
            <!-- 댓글 내용 -->
            <div class="bg-gray-50 p-3 rounded-lg mb-3">
              <p class="text-gray-900">${comment.content}</p>
            </div>
            
            <!-- 메타 정보 -->
            <div class="flex items-center gap-4 text-sm text-gray-500">
              <span><i class="fas fa-globe"></i> ${comment.site_name}</span>
              <span><i class="fas fa-link"></i> ${comment.page_title || comment.page_url}</span>
              <span><i class="fas fa-clock"></i> ${Utils.formatDateTime(comment.created_at)}</span>
            </div>
          </div>
        </div>
        
        <!-- 액션 버튼들 -->
        <div class="flex gap-2 ml-4">
          ${!comment.is_approved && !comment.is_spam ? 
            `<button class="btn btn-sm btn-success" onclick="commentsPage.approveComment(${comment.id})">
              <i class="fas fa-check"></i> 승인
            </button>` : ''
          }
          ${comment.is_approved ? 
            `<button class="btn btn-sm btn-secondary" onclick="commentsPage.rejectComment(${comment.id})">
              <i class="fas fa-times"></i> 승인취소
            </button>` : ''
          }
          ${!comment.is_spam ? 
            `<button class="btn btn-sm btn-danger" onclick="commentsPage.markAsSpam(${comment.id})">
              <i class="fas fa-shield-alt"></i> 스팸
            </button>` : ''
          }
          <button class="btn btn-sm btn-secondary" onclick="commentsPage.viewComment(${comment.id})">
            <i class="fas fa-eye"></i> 보기
          </button>
          <button class="btn btn-sm btn-danger" onclick="commentsPage.deleteComment(${comment.id})">
            <i class="fas fa-trash"></i> 삭제
          </button>
        </div>
      </div>
    `;
    
    return card;
  }

  getStatusBadge(comment) {
    if (comment.is_spam) {
      return '<span class="badge" style="background: #fee2e2; color: #dc2626;">스팸</span>';
    } else if (comment.is_approved) {
      return '<span class="badge badge-success">승인됨</span>';
    } else {
      return '<span class="badge" style="background: #fef3c7; color: #d97706;">대기 중</span>';
    }
  }

  createPagination() {
    const totalPages = Math.ceil(this.comments.length / this.itemsPerPage);
    
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

  async processBulkAction(commentIds, action) {
    let successCount = 0;
    let errorCount = 0;

    for (const commentId of commentIds) {
      try {
        if (action === 'approve') {
          await window.apiService.approveComment(commentId);
        } else if (action === 'reject') {
          await window.apiService.rejectComment(commentId);
        }
        successCount++;
      } catch (error) {
        console.error(`댓글 ${commentId} ${action} 실패:`, error);
        errorCount++;
      }
    }

    if (successCount > 0) {
      Utils.showNotification(`${successCount}개의 댓글이 처리되었습니다.`, 'success');
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
    Utils.showNotification('댓글 내보내기 기능은 곧 제공될 예정입니다.', 'info');
  }

  createErrorState(message = '댓글 데이터를 불러오는 중 오류가 발생했습니다.') {
    return Components.createEmptyState(
      '데이터 로딩 실패',
      message,
      '다시 시도',
      () => this.render()
    );
  }
}

// 전역으로 사용할 수 있도록 export
window.CommentsPage = CommentsPage;