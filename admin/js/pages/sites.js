// Kommentio Admin Dashboard - Sites Management Page

class SitesPage {
  constructor() {
    this.sites = [];
    this.filteredSites = [];
    this.searchQuery = '';
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
    const header = Utils.createElement('div', 'flex items-center justify-between mb-6');
    
    header.innerHTML = `
      <div>
        <h1 class="text-3xl font-bold text-gray-900">사이트 관리</h1>
        <p class="text-gray-600 mt-2">댓글 시스템이 설치된 사이트들을 관리하세요</p>
      </div>
    `;
    
    const addButton = Utils.createElement('button', 'btn btn-primary');
    addButton.innerHTML = '<i class="fas fa-plus"></i> 새 사이트 추가';
    Utils.on(addButton, 'click', () => this.showAddSiteModal());
    
    header.appendChild(addButton);
    
    return header;
  }

  createSearchSection() {
    const searchInput = Components.createSearchInput(
      '사이트 이름이나 도메인으로 검색...',
      (query) => this.handleSearch(query)
    );
    
    const section = Utils.createElement('div', 'mb-6');
    section.appendChild(searchInput);
    
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
    const card = Utils.createElement('div', 'card');
    
    card.innerHTML = `
      <div class="card-header">
        <div class="flex items-center justify-between w-full">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">${site.name}</h3>
            <p class="text-sm text-gray-500">${site.domain}</p>
          </div>
          <div class="flex items-center gap-2">
            ${Components.createBadge(
              site.status === 'active' ? '활성' : '비활성',
              site.status === 'active' ? 'success' : 'inactive'
            ).outerHTML}
          </div>
        </div>
      </div>
      <div class="card-body">
        <p class="text-sm text-gray-600 mb-4">${site.description}</p>
        
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-500">댓글 수</span>
            <span class="text-sm font-medium text-gray-900">${Utils.formatNumber(site.commentsCount)}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-500">생성일</span>
            <span class="text-sm font-medium text-gray-900">${Utils.formatDate(site.createdAt)}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-500">마지막 활동</span>
            <span class="text-sm font-medium text-gray-900">${site.lastActivity}</span>
          </div>
        </div>

        <div class="flex gap-2 mt-4">
          <button class="btn btn-sm ${site.status === 'active' ? 'btn-danger' : 'btn-success'}" 
                  onclick="sitesPage.toggleSiteStatus(${site.id})">
            ${site.status === 'active' ? '비활성화' : '활성화'}
          </button>
          <button class="btn btn-sm btn-secondary" onclick="sitesPage.editSite(${site.id})">
            <i class="fas fa-cog"></i> 설정
          </button>
        </div>
      </div>
    `;
    
    return card;
  }

  handleSearch(query) {
    this.searchQuery = query.toLowerCase();
    this.filteredSites = this.sites.filter(site =>
      site.name.toLowerCase().includes(this.searchQuery) ||
      site.domain.toLowerCase().includes(this.searchQuery)
    );
    
    // 사이트 그리드 다시 렌더링
    const existingGrid = Utils.$('.grid');
    if (existingGrid) {
      const newGrid = this.createSitesGrid();
      existingGrid.parentNode.replaceChild(newGrid, existingGrid);
    }
  }

  showAddSiteModal() {
    const formContent = Utils.createElement('div', 'space-y-4');
    
    formContent.appendChild(Components.createInput('text', 'siteName', '사이트 이름', '예: 개인 블로그'));
    formContent.appendChild(Components.createInput('text', 'siteDomain', '도메인', '예: myblog.com'));
    formContent.appendChild(Components.createInput('text', 'siteDescription', '설명', '사이트에 대한 간단한 설명'));
    
    const modal = Components.createModal('새 사이트 추가', formContent, [
      {
        text: '취소',
        class: 'btn-secondary',
        onclick: () => Components.closeModal(modal)
      },
      {
        text: '추가',
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

  createErrorState() {
    return Components.createEmptyState(
      '데이터 로딩 실패',
      '사이트 데이터를 불러오는 중 오류가 발생했습니다.',
      '다시 시도',
      () => this.render()
    );
  }
}

// 전역으로 사용할 수 있도록 export
window.SitesPage = SitesPage;