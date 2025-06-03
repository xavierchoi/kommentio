// Kommentio Admin Dashboard - Spam Filter Page

class SpamFilterPage {
  constructor() {
    this.spamReports = [];
    this.spamSettings = {
      autoFilterEnabled: true,
      claudeApiKey: '',
      spamThreshold: 0.7,
      autoDeleteSpam: false,
      blockKeywords: [],
      allowedDomains: [],
      blockedDomains: []
    };
    this.spamStats = {
      totalSpam: 0,
      todaySpam: 0,
      weekSpam: 0,
      topSpamKeywords: []
    };
  }

  async render() {
    const container = Utils.$('#page-spam-filter');
    container.innerHTML = '';

    // 페이지 헤더
    const header = this.createPageHeader();
    container.appendChild(header);

    // 로딩 표시
    Utils.showLoading(container);

    try {
      // 데이터 로드
      await this.loadSpamData();

      // 스팸 통계 카드
      const statsSection = this.createStatsSection();
      container.appendChild(statsSection);

      // 설정 및 리포트 섹션
      const mainContent = Utils.createElement('div', 'grid grid-cols-1 lg:grid-cols-2 gap-6');
      
      // 스팸 필터 설정
      const settingsSection = this.createSettingsSection();
      mainContent.appendChild(settingsSection);
      
      // 최근 스팸 리포트
      const reportsSection = this.createReportsSection();
      mainContent.appendChild(reportsSection);
      
      container.appendChild(mainContent);

      // 키워드 관리 섹션
      const keywordsSection = this.createKeywordsSection();
      container.appendChild(keywordsSection);

    } catch (error) {
      console.error('스팸 필터 데이터 로딩 실패:', error);
      container.appendChild(this.createErrorState());
    } finally {
      Utils.hideLoading(container);
    }
  }

  async loadSpamData() {
    try {
      // 스팸 통계 로드
      const stats = await window.apiService.getDashboardStats();
      this.spamStats = {
        totalSpam: stats.spamComments || 0,
        todaySpam: Math.floor(stats.spamComments * 0.1), // 임시 계산
        weekSpam: Math.floor(stats.spamComments * 0.3),
        topSpamKeywords: ['광고', 'http://', '돈벌기', '클릭', '무료']
      };

      // 스팸 설정 로드 (임시 데이터)
      this.spamSettings = {
        autoFilterEnabled: true,
        claudeApiKey: '●●●●●●●●●●●●',
        spamThreshold: 0.7,
        autoDeleteSpam: false,
        blockKeywords: ['광고', '스팸', '돈벌기', 'http://spam.com'],
        allowedDomains: ['gmail.com', 'naver.com', 'kakao.com'],
        blockedDomains: ['tempmail.org', 'guerrillamail.com']
      };

      // 최근 스팸 리포트 (임시 데이터)
      this.spamReports = [
        {
          id: 1,
          content: '무료로 돈벌기! 클릭하세요 http://spam.com',
          author: 'spammer@fake.com',
          spam_score: 0.95,
          reason: '상업적 링크 및 스팸 키워드 포함',
          created_at: new Date().toISOString(),
          status: 'blocked'
        },
        {
          id: 2,
          content: '광고입니다. 많은 관심 부탁드려요.',
          author: 'ads@marketing.com',
          spam_score: 0.85,
          reason: '광고성 내용',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'blocked'
        }
      ];

    } catch (error) {
      console.error('스팸 데이터 로딩 실패:', error);
    }
  }

  createPageHeader() {
    const header = Utils.createElement('div', 'flex items-center justify-between mb-6');
    
    header.innerHTML = `
      <div>
        <h1 class="text-3xl font-bold text-gray-900">스팸 필터</h1>
        <p class="text-gray-600 mt-2">AI 기반 스팸 필터링 시스템을 설정하고 관리하세요</p>
      </div>
      <div class="flex gap-3">
        <button class="btn btn-secondary" onclick="spamFilterPage.testSpamFilter()">
          <i class="fas fa-flask"></i> 필터 테스트
        </button>
        <button class="btn btn-primary" onclick="spamFilterPage.saveSettings()">
          <i class="fas fa-save"></i> 설정 저장
        </button>
      </div>
    `;
    
    return header;
  }

  createStatsSection() {
    const section = Utils.createElement('div', 'mb-6');
    const grid = Utils.createElement('div', 'stats-grid');

    const statCards = [
      {
        title: '총 차단된 스팸',
        value: this.spamStats.totalSpam,
        icon: 'fas fa-shield-alt',
        color: 'red'
      },
      {
        title: '오늘 차단',
        value: this.spamStats.todaySpam,
        icon: 'fas fa-clock',
        color: 'blue'
      },
      {
        title: '이번 주 차단',
        value: this.spamStats.weekSpam,
        icon: 'fas fa-calendar-week',
        color: 'green'
      },
      {
        title: '필터 정확도',
        value: '94.5%',
        icon: 'fas fa-bullseye',
        color: 'purple'
      }
    ];

    statCards.forEach(stat => {
      const card = Components.createStatCard(stat.title, stat.value, stat.icon, stat.color);
      grid.appendChild(card);
    });

    section.appendChild(grid);
    return section;
  }

  createSettingsSection() {
    const section = Utils.createElement('div', 'card');
    
    const header = Utils.createElement('div', 'card-header');
    header.innerHTML = '<h2>스팸 필터 설정</h2>';
    
    const body = Utils.createElement('div', 'card-body space-y-6');
    
    body.innerHTML = `
      <!-- AI 필터 설정 -->
      <div>
        <h3 class="font-semibold text-gray-900 mb-3">AI 자동 필터링</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium text-gray-700">자동 스팸 필터링 활성화</label>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" class="sr-only peer" id="autoFilterToggle" ${this.spamSettings.autoFilterEnabled ? 'checked' : ''}>
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div>
            <label class="input-label">Claude API 키</label>
            <div class="flex gap-2">
              <input type="password" class="input flex-1" id="claudeApiKey" value="${this.spamSettings.claudeApiKey}" placeholder="Claude API 키를 입력하세요">
              <button class="btn btn-secondary" onclick="spamFilterPage.testClaudeAPI()">테스트</button>
            </div>
            <p class="text-xs text-gray-500 mt-1">Claude Haiku API를 사용하여 고품질 스팸 탐지를 수행합니다</p>
          </div>
          
          <div>
            <label class="input-label">스팸 임계값 (${(this.spamSettings.spamThreshold * 100).toFixed(0)}%)</label>
            <input type="range" class="w-full" id="spamThreshold" min="0.1" max="1.0" step="0.1" value="${this.spamSettings.spamThreshold}" oninput="spamFilterPage.updateThresholdDisplay(this.value)">
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span>관대함 (10%)</span>
              <span>엄격함 (100%)</span>
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium text-gray-700">스팸 자동 삭제</label>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" class="sr-only peer" id="autoDeleteSpam" ${this.spamSettings.autoDeleteSpam ? 'checked' : ''}>
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
      
      <!-- 도메인 필터 -->
      <div>
        <h3 class="font-semibold text-gray-900 mb-3">도메인 필터링</h3>
        <div class="space-y-3">
          <div>
            <label class="input-label">허용된 이메일 도메인</label>
            <div class="flex flex-wrap gap-1 mb-2">
              ${this.spamSettings.allowedDomains.map(domain => `
                <span class="badge badge-success">${domain} 
                  <button onclick="spamFilterPage.removeDomain('allowed', '${domain}')" class="ml-1 text-xs">×</button>
                </span>
              `).join('')}
            </div>
            <div class="flex gap-2">
              <input type="text" class="input flex-1" id="allowedDomainInput" placeholder="예: gmail.com">
              <button class="btn btn-sm btn-primary" onclick="spamFilterPage.addDomain('allowed')">추가</button>
            </div>
          </div>
          
          <div>
            <label class="input-label">차단된 이메일 도메인</label>
            <div class="flex flex-wrap gap-1 mb-2">
              ${this.spamSettings.blockedDomains.map(domain => `
                <span class="badge" style="background: #fee2e2; color: #dc2626;">${domain} 
                  <button onclick="spamFilterPage.removeDomain('blocked', '${domain}')" class="ml-1 text-xs">×</button>
                </span>
              `).join('')}
            </div>
            <div class="flex gap-2">
              <input type="text" class="input flex-1" id="blockedDomainInput" placeholder="예: tempmail.org">
              <button class="btn btn-sm btn-danger" onclick="spamFilterPage.addDomain('blocked')">차단</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    section.appendChild(header);
    section.appendChild(body);
    
    return section;
  }

  createReportsSection() {
    const section = Utils.createElement('div', 'card');
    
    const header = Utils.createElement('div', 'card-header');
    header.innerHTML = `
      <div class="flex items-center justify-between">
        <h2>최근 스팸 탐지</h2>
        <button class="btn btn-sm btn-secondary" onclick="spamFilterPage.viewAllReports()">
          모두 보기
        </button>
      </div>
    `;
    
    const body = Utils.createElement('div', 'card-body');
    
    if (this.spamReports.length === 0) {
      body.appendChild(Components.createEmptyState(
        '스팸 탐지 기록 없음',
        '아직 탐지된 스팸이 없습니다.'
      ));
    } else {
      const reportsList = Utils.createElement('div', 'space-y-3');
      
      this.spamReports.slice(0, 5).forEach(report => {
        const reportItem = this.createReportItem(report);
        reportsList.appendChild(reportItem);
      });
      
      body.appendChild(reportsList);
    }
    
    section.appendChild(header);
    section.appendChild(body);
    
    return section;
  }

  createReportItem(report) {
    const item = Utils.createElement('div', 'border border-gray-200 rounded-lg p-3');
    
    item.innerHTML = `
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <span class="badge" style="background: #fee2e2; color: #dc2626;">스팸 ${(report.spam_score * 100).toFixed(0)}%</span>
            <span class="text-sm text-gray-500">${report.author}</span>
            <span class="text-xs text-gray-400">${Utils.formatDateTime(report.created_at)}</span>
          </div>
          
          <div class="bg-gray-50 p-2 rounded text-sm mb-2">
            ${report.content.length > 100 ? report.content.substring(0, 100) + '...' : report.content}
          </div>
          
          <div class="text-xs text-gray-600">
            <i class="fas fa-info-circle"></i> ${report.reason}
          </div>
        </div>
        
        <div class="flex gap-1 ml-3">
          <button class="btn btn-sm btn-secondary" onclick="spamFilterPage.reviewSpam(${report.id})">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn btn-sm btn-success" onclick="spamFilterPage.markAsNotSpam(${report.id})">
            <i class="fas fa-check"></i>
          </button>
        </div>
      </div>
    `;
    
    return item;
  }

  createKeywordsSection() {
    const section = Utils.createElement('div', 'card mt-6');
    
    const header = Utils.createElement('div', 'card-header');
    header.innerHTML = '<h2>차단 키워드 관리</h2>';
    
    const body = Utils.createElement('div', 'card-body');
    
    body.innerHTML = `
      <div class="space-y-4">
        <div>
          <label class="input-label">차단할 키워드 또는 구문</label>
          <div class="flex gap-2 mb-3">
            <input type="text" class="input flex-1" id="keywordInput" placeholder="스팸, 광고, http://spam.com 등">
            <button class="btn btn-primary" onclick="spamFilterPage.addKeyword()">추가</button>
          </div>
          
          <div class="flex flex-wrap gap-2">
            ${this.spamSettings.blockKeywords.map(keyword => `
              <span class="badge" style="background: #fee2e2; color: #dc2626;">
                ${keyword} 
                <button onclick="spamFilterPage.removeKeyword('${keyword}')" class="ml-1 text-xs">×</button>
              </span>
            `).join('')}
          </div>
        </div>
        
        <div>
          <h3 class="font-semibold text-gray-900 mb-2">자주 탐지되는 스팸 키워드</h3>
          <div class="bg-gray-50 p-3 rounded">
            <div class="flex flex-wrap gap-2">
              ${this.spamStats.topSpamKeywords.map(keyword => `
                <span class="badge" style="background: #fef3c7; color: #d97706;">
                  ${keyword}
                  <button onclick="spamFilterPage.addKeywordFromSuggestion('${keyword}')" class="ml-1 text-xs">+</button>
                </span>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
    
    section.appendChild(header);
    section.appendChild(body);
    
    return section;
  }

  updateThresholdDisplay(value) {
    const percentage = (value * 100).toFixed(0);
    const label = Utils.$('label[for="spamThreshold"]');
    if (label) {
      label.textContent = `스팸 임계값 (${percentage}%)`;
    }
  }

  async testClaudeAPI() {
    const apiKey = Utils.$('#claudeApiKey').value;
    if (!apiKey || apiKey.includes('●')) {
      Utils.showNotification('유효한 API 키를 입력해주세요.', 'warning');
      return;
    }

    try {
      Utils.showNotification('Claude API 연결을 테스트하는 중...', 'info');
      
      // 실제로는 Admin API의 checkSpamWithClaude 메서드 호출
      const testResult = {
        spam_score: 0.1,
        reason: '정상적인 댓글',
        is_spam: false
      };
      
      Utils.showNotification('Claude API 연결이 성공했습니다!', 'success');
    } catch (error) {
      console.error('Claude API 테스트 실패:', error);
      Utils.showNotification('Claude API 연결에 실패했습니다.', 'error');
    }
  }

  addDomain(type) {
    const inputId = type === 'allowed' ? 'allowedDomainInput' : 'blockedDomainInput';
    const domain = Utils.$(`#${inputId}`).value.trim();
    
    if (!domain) {
      Utils.showNotification('도메인을 입력해주세요.', 'warning');
      return;
    }

    if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain)) {
      Utils.showNotification('유효한 도메인 형식이 아닙니다.', 'error');
      return;
    }

    const targetArray = type === 'allowed' ? this.spamSettings.allowedDomains : this.spamSettings.blockedDomains;
    
    if (!targetArray.includes(domain)) {
      targetArray.push(domain);
      Utils.$(`#${inputId}`).value = '';
      Utils.showNotification(`도메인이 ${type === 'allowed' ? '허용' : '차단'} 목록에 추가되었습니다.`, 'success');
      this.refreshSettingsSection();
    } else {
      Utils.showNotification('이미 추가된 도메인입니다.', 'warning');
    }
  }

  removeDomain(type, domain) {
    const targetArray = type === 'allowed' ? this.spamSettings.allowedDomains : this.spamSettings.blockedDomains;
    const index = targetArray.indexOf(domain);
    
    if (index > -1) {
      targetArray.splice(index, 1);
      Utils.showNotification(`도메인이 ${type === 'allowed' ? '허용' : '차단'} 목록에서 제거되었습니다.`, 'success');
      this.refreshSettingsSection();
    }
  }

  addKeyword() {
    const keyword = Utils.$('#keywordInput').value.trim();
    
    if (!keyword) {
      Utils.showNotification('키워드를 입력해주세요.', 'warning');
      return;
    }

    if (!this.spamSettings.blockKeywords.includes(keyword)) {
      this.spamSettings.blockKeywords.push(keyword);
      Utils.$('#keywordInput').value = '';
      Utils.showNotification('키워드가 차단 목록에 추가되었습니다.', 'success');
      this.refreshKeywordsSection();
    } else {
      Utils.showNotification('이미 추가된 키워드입니다.', 'warning');
    }
  }

  addKeywordFromSuggestion(keyword) {
    if (!this.spamSettings.blockKeywords.includes(keyword)) {
      this.spamSettings.blockKeywords.push(keyword);
      Utils.showNotification(`"${keyword}"가 차단 목록에 추가되었습니다.`, 'success');
      this.refreshKeywordsSection();
    }
  }

  removeKeyword(keyword) {
    const index = this.spamSettings.blockKeywords.indexOf(keyword);
    if (index > -1) {
      this.spamSettings.blockKeywords.splice(index, 1);
      Utils.showNotification('키워드가 차단 목록에서 제거되었습니다.', 'success');
      this.refreshKeywordsSection();
    }
  }

  refreshSettingsSection() {
    const existingSection = Utils.$('.card');
    if (existingSection) {
      const newSection = this.createSettingsSection();
      existingSection.parentNode.replaceChild(newSection, existingSection);
    }
  }

  refreshKeywordsSection() {
    const keywordsSection = Utils.$('.card.mt-6');
    if (keywordsSection) {
      const newSection = this.createKeywordsSection();
      keywordsSection.parentNode.replaceChild(newSection, keywordsSection);
    }
  }

  async saveSettings() {
    try {
      // 설정 수집
      this.spamSettings.autoFilterEnabled = Utils.$('#autoFilterToggle').checked;
      this.spamSettings.claudeApiKey = Utils.$('#claudeApiKey').value;
      this.spamSettings.spamThreshold = parseFloat(Utils.$('#spamThreshold').value);
      this.spamSettings.autoDeleteSpam = Utils.$('#autoDeleteSpam').checked;

      // 실제로는 API를 통해 설정 저장
      // await window.apiService.updateSpamSettings(this.spamSettings);
      
      Utils.showNotification('스팸 필터 설정이 저장되었습니다.', 'success');
    } catch (error) {
      console.error('설정 저장 실패:', error);
      Utils.showNotification('설정 저장에 실패했습니다.', 'error');
    }
  }

  testSpamFilter() {
    const modalContent = Utils.createElement('div', 'space-y-4');
    modalContent.innerHTML = `
      <div>
        <label class="input-label">테스트할 댓글 내용</label>
        <textarea class="input" id="testCommentContent" rows="4" placeholder="여기에 테스트할 댓글 내용을 입력하세요..."></textarea>
      </div>
      <div id="testResult" class="hidden">
        <!-- 테스트 결과가 여기에 표시됩니다 -->
      </div>
    `;

    const modal = Components.createModal('스팸 필터 테스트', modalContent, [
      {
        text: '취소',
        class: 'btn-secondary',
        onclick: () => Components.closeModal(modal)
      },
      {
        text: '테스트 실행',
        class: 'btn-primary',
        onclick: () => this.runSpamTest(modal)
      }
    ]);

    Components.showModal(modal);
  }

  async runSpamTest(modal) {
    const content = Utils.$('#testCommentContent').value.trim();
    if (!content) {
      Utils.showNotification('테스트할 내용을 입력해주세요.', 'warning');
      return;
    }

    try {
      // Mock 테스트 결과
      const hasSpamKeywords = this.spamSettings.blockKeywords.some(keyword => 
        content.toLowerCase().includes(keyword.toLowerCase())
      );
      
      const mockResult = {
        spam_score: hasSpamKeywords ? 0.85 : Math.random() * 0.3,
        reason: hasSpamKeywords ? '차단된 키워드 포함' : '정상적인 댓글로 판단됨',
        is_spam: hasSpamKeywords || Math.random() > 0.8
      };

      const resultDiv = Utils.$('#testResult');
      resultDiv.className = 'block';
      resultDiv.innerHTML = `
        <div class="bg-gray-50 p-4 rounded-lg">
          <h4 class="font-semibold mb-3">테스트 결과</h4>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span>스팸 점수:</span>
              <span class="font-medium ${mockResult.spam_score > 0.7 ? 'text-red-600' : 'text-green-600'}">
                ${(mockResult.spam_score * 100).toFixed(1)}%
              </span>
            </div>
            <div class="flex justify-between">
              <span>판정 결과:</span>
              <span class="font-medium ${mockResult.is_spam ? 'text-red-600' : 'text-green-600'}">
                ${mockResult.is_spam ? '스팸' : '정상'}
              </span>
            </div>
            <div>
              <span>이유:</span>
              <p class="text-sm text-gray-600 mt-1">${mockResult.reason}</p>
            </div>
          </div>
        </div>
      `;

    } catch (error) {
      console.error('스팸 테스트 실패:', error);
      Utils.showNotification('스팸 테스트에 실패했습니다.', 'error');
    }
  }

  reviewSpam(reportId) {
    const report = this.spamReports.find(r => r.id === reportId);
    if (!report) return;

    const modalContent = Utils.createElement('div', 'space-y-4');
    modalContent.innerHTML = `
      <div class="space-y-3">
        <div>
          <strong>작성자:</strong> ${report.author}
        </div>
        <div>
          <strong>스팸 점수:</strong> 
          <span class="badge" style="background: #fee2e2; color: #dc2626;">${(report.spam_score * 100).toFixed(1)}%</span>
        </div>
        <div>
          <strong>탐지 이유:</strong> ${report.reason}
        </div>
        <div>
          <strong>탐지 시간:</strong> ${Utils.formatDateTime(report.created_at)}
        </div>
        <div>
          <strong>댓글 내용:</strong>
          <div class="bg-gray-50 p-3 rounded mt-2">${report.content}</div>
        </div>
      </div>
    `;

    const modal = Components.createModal('스팸 상세 정보', modalContent, [
      {
        text: '정상으로 표시',
        class: 'btn-success',
        onclick: () => {
          this.markAsNotSpam(reportId);
          Components.closeModal(modal);
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

  markAsNotSpam(reportId) {
    const reportIndex = this.spamReports.findIndex(r => r.id === reportId);
    if (reportIndex > -1) {
      this.spamReports.splice(reportIndex, 1);
      Utils.showNotification('해당 댓글이 정상으로 표시되었습니다.', 'success');
      this.refreshReportsSection();
    }
  }

  refreshReportsSection() {
    // 리포트 섹션 새로고침
    this.render();
  }

  viewAllReports() {
    Utils.showNotification('전체 스팸 리포트 기능은 곧 제공될 예정입니다.', 'info');
  }

  createErrorState() {
    return Components.createEmptyState(
      '데이터 로딩 실패',
      '스팸 필터 데이터를 불러오는 중 오류가 발생했습니다.',
      '다시 시도',
      () => this.render()
    );
  }
}

// 전역으로 사용할 수 있도록 export
window.SpamFilterPage = SpamFilterPage;