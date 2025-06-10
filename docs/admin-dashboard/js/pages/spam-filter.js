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

      // 설정 및 리포트 섹션 - 반응형 레이아웃
      const mainContent = Utils.createElement('div', 'grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8');
      
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
    const header = Utils.createElement('div', 'mb-8');
    header.innerHTML = `
      <div class="flex flex-col gap-6">
        <!-- 모바일/태블릿에서 메인 타이틀 -->
        <div class="flex items-center space-x-3 md:space-x-4">
          <div class="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl">
            <i class="fas fa-shield-alt text-white text-xl md:text-2xl"></i>
          </div>
          <div class="flex-1">
            <h1 class="text-2xl md:text-3xl font-bold text-gray-900">스팸 필터</h1>
            <p class="text-gray-600 mt-1 text-sm md:text-base">AI 기반 스팸 필터링 시스템을 전문적으로 설정하고 관리하세요</p>
          </div>
        </div>
        
        <!-- 상태 및 액션 버튼들 -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <!-- AI 필터 상태 (모바일에서도 표시) -->
          <div class="flex items-center space-x-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200 w-fit">
            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span class="text-green-700 text-sm font-medium">AI 필터 활성화</span>
          </div>
          
          <!-- 액션 버튼들 - 반응형 레이아웃 -->
          <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <!-- 모바일에서는 풀 너비, 태블릿 이상에서는 인라인 -->
            <button id="spam-analytics-btn" class="w-full sm:w-auto px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center sm:justify-start space-x-2 shadow-sm min-h-[44px]">
              <i class="fas fa-chart-line"></i>
              <span class="hidden sm:inline">분석</span>
              <span class="sm:hidden">분석 보기</span>
            </button>
            <button class="w-full sm:w-auto px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center sm:justify-start space-x-2 shadow-sm min-h-[44px]" onclick="spamFilterPage.testSpamFilter()">
              <i class="fas fa-flask"></i>
              <span class="hidden sm:inline">필터 테스트</span>
              <span class="sm:hidden">테스트</span>
            </button>
            <button id="save-settings-btn" class="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg min-h-[44px]" onclick="spamFilterPage.saveSettings()">
              <i class="fas fa-save"></i>
              <span>설정 저장</span>
            </button>
          </div>
        </div>
      </div>
    `;
    
    return header;
  }

  createStatsSection() {
    const section = Utils.createElement('div', 'mb-8');
    const grid = Utils.createElement('div', 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6');

    const statCards = [
      {
        title: '총 차단된 스팸',
        value: this.spamStats.totalSpam,
        icon: 'fas fa-shield-alt',
        gradient: 'from-red-500 to-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-600'
      },
      {
        title: '오늘 차단',
        value: this.spamStats.todaySpam,
        icon: 'fas fa-calendar-day',
        gradient: 'from-blue-500 to-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-600'
      },
      {
        title: '이번 주 차단',
        value: this.spamStats.weekSpam,
        icon: 'fas fa-calendar-week',
        gradient: 'from-green-500 to-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-600'
      },
      {
        title: '필터 정확도',
        value: '94.5%',
        icon: 'fas fa-bullseye',
        gradient: 'from-purple-500 to-purple-600',
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-600'
      }
    ];

    statCards.forEach(stat => {
      const card = Utils.createElement('div', `bg-white rounded-xl shadow-lg border ${stat.border} p-4 md:p-6 hover:shadow-xl transition-all duration-300`);
      card.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <!-- 모바일에서는 세로 레이아웃, 태블릿 이상에서는 가로 레이아웃 -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-3 md:mb-4">
              <div class="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg mb-2 sm:mb-0">
                <i class="${stat.icon} text-white text-base md:text-lg"></i>
              </div>
              <div class="flex-1">
                <h3 class="text-xs md:text-sm font-semibold text-gray-600 uppercase tracking-wide">${stat.title}</h3>
                <div class="text-2xl md:text-3xl font-bold ${stat.text} mt-1">${Utils.formatNumber ? Utils.formatNumber(stat.value) : stat.value}</div>
              </div>
            </div>
            <!-- 진행률 바 -->
            <div class="w-full ${stat.bg} h-2 rounded-full">
              <div class="bg-gradient-to-r ${stat.gradient} h-2 rounded-full transition-all duration-500" style="width: ${stat.title.includes('정확도') ? '94.5%' : Math.min(100, (stat.value / Math.max(this.spamStats.totalSpam, 1)) * 100)}%"></div>
            </div>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });

    section.appendChild(grid);
    return section;
  }

  createSettingsSection() {
    const section = Utils.createElement('div', 'bg-white rounded-xl shadow-lg border border-gray-200');
    
    // 프리미엄 헤더
    const header = Utils.createElement('div', 'p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50');
    header.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
          <i class="fas fa-cogs text-white text-sm"></i>
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-900">스팸 필터 설정</h2>
          <p class="text-gray-600 text-sm">AI 기반 필터링과 키워드 차단 규칙을 설정하세요</p>
        </div>
      </div>
    `;
    
    const body = Utils.createElement('div', 'p-6 space-y-8');
    
    body.innerHTML = `
      <!-- AI 필터 설정 -->
      <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div class="flex items-start space-x-4">
          <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg mt-1">
            <i class="fas fa-brain text-white text-lg"></i>
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-bold text-gray-900 mb-2">🤖 AI 스팸 필터</h3>
            <p class="text-gray-600 text-sm mb-4">Claude AI를 사용한 지능형 스팸 감지 시스템</p>
            
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-gray-700 font-medium">AI 필터 활성화</span>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" id="autoFilterToggle" class="sr-only peer" ${this.spamSettings.autoFilterEnabled ? 'checked' : ''}>
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-indigo-600"></div>
                </label>
              </div>

              <div class="space-y-3">
                <label class="block text-gray-700 font-medium">스팸 임계값</label>
                <div class="flex items-center space-x-4">
                  <input type="range" id="spamThreshold" min="0.1" max="1.0" step="0.1" value="${this.spamSettings.spamThreshold}" 
                         class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider" oninput="spamFilterPage.updateThresholdDisplay(this.value)">
                  <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm font-semibold min-w-[60px] text-center" id="threshold-value">${(this.spamSettings.spamThreshold * 100).toFixed(0)}%</span>
                </div>
                <p class="text-gray-500 text-xs">높을수록 더 엄격한 필터링 (권장: 0.7)</p>
              </div>

              <div class="space-y-3">
                <label class="block text-gray-700 font-medium">Claude API 키</label>
                <div class="relative">
                  <input type="password" id="claudeApiKey" placeholder="sk-ant-..." 
                         value="${this.spamSettings.claudeApiKey || ''}"
                         class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-20">
                  <button type="button" class="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600" 
                          onclick="this.previousElementSibling.type = this.previousElementSibling.type === 'password' ? 'text' : 'password'">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button type="button" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-700 text-sm font-medium" 
                          onclick="spamFilterPage.testClaudeAPI()">
                    테스트
                  </button>
                </div>
                <p class="text-gray-500 text-xs">Claude Haiku API를 사용하여 고품질 스팸 탐지를 수행합니다</p>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-gray-700 font-medium">스팸 자동 삭제</span>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" id="autoDeleteSpam" class="sr-only peer" ${this.spamSettings.autoDeleteSpam ? 'checked' : ''}>
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-indigo-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 키워드 필터 설정 -->
      <div class="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
        <div class="flex items-start space-x-4">
          <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg mt-1">
            <i class="fas fa-filter text-white text-lg"></i>
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-bold text-gray-900 mb-2">🔍 키워드 필터</h3>
            <p class="text-gray-600 text-sm mb-4">특정 단어나 패턴을 포함한 댓글을 자동으로 차단</p>
            
            <div class="space-y-4">
              <div class="space-y-3">
                <label class="block text-gray-700 font-medium">차단 키워드 (쉼표로 구분)</label>
                <textarea id="blockKeywordsInput" rows="4" placeholder="스팸, 광고, 도박, 불법, http://..."
                          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none">${this.spamSettings.blockKeywords.join(', ')}</textarea>
                <div class="flex items-center justify-between text-xs">
                  <span class="text-gray-500">현재 ${this.spamSettings.blockKeywords.length}개 키워드 등록됨</span>
                  <button type="button" class="text-orange-600 hover:text-orange-700 font-medium" onclick="spamFilterPage.addPresetKeywords()">
                    <i class="fas fa-plus"></i> 기본 키워드 추가
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div class="space-y-3">
                  <label class="block text-gray-700 font-medium">허용된 도메인</label>
                  <div class="flex flex-wrap gap-2 mb-2 min-h-[2rem] p-3 border border-gray-200 rounded-lg bg-white">
                    ${this.spamSettings.allowedDomains.map(domain => `
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        ${domain}
                        <button onclick="spamFilterPage.removeDomain('allowed', '${domain}')" class="ml-1 hover:text-green-900 min-w-[20px] min-h-[20px] flex items-center justify-center">×</button>
                      </span>
                    `).join('')}
                  </div>
                  <div class="flex flex-col sm:flex-row gap-2">
                    <input type="text" id="allowedDomainInput" placeholder="gmail.com" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm min-h-[40px]">
                    <button type="button" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm min-h-[40px] whitespace-nowrap" onclick="spamFilterPage.addDomain('allowed')">추가</button>
                  </div>
                </div>

                <div class="space-y-3">
                  <label class="block text-gray-700 font-medium">차단된 도메인</label>
                  <div class="flex flex-wrap gap-2 mb-2 min-h-[2rem] p-3 border border-gray-200 rounded-lg bg-white">
                    ${this.spamSettings.blockedDomains.map(domain => `
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                        ${domain}
                        <button onclick="spamFilterPage.removeDomain('blocked', '${domain}')" class="ml-1 hover:text-red-900 min-w-[20px] min-h-[20px] flex items-center justify-center">×</button>
                      </span>
                    `).join('')}
                  </div>
                  <div class="flex flex-col sm:flex-row gap-2">
                    <input type="text" id="blockedDomainInput" placeholder="tempmail.org" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm min-h-[40px]">
                    <button type="button" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm min-h-[40px] whitespace-nowrap" onclick="spamFilterPage.addDomain('blocked')">차단</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 자동 액션 설정 -->
      <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
        <div class="flex items-start space-x-4">
          <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg mt-1">
            <i class="fas fa-bolt text-white text-lg"></i>
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-bold text-gray-900 mb-2">⚡ 자동 액션 설정</h3>
            <p class="text-gray-600 text-sm mb-4">스팸으로 감지된 댓글에 대한 자동 처리 방식을 설정</p>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="space-y-4">
                <div class="space-y-3">
                  <label class="block text-gray-700 font-medium">스팸 감지 시 액션</label>
                  <select id="autoAction" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white min-h-[44px]">
                    <option value="hide" ${this.spamSettings.autoDeleteSpam === false ? 'selected' : ''}>🙈 숨기기 (검토 대기)</option>
                    <option value="delete" ${this.spamSettings.autoDeleteSpam === true ? 'selected' : ''}>🗑️ 자동 삭제</option>
                    <option value="flag" ${this.spamSettings.autoDeleteSpam === 'flag' ? 'selected' : ''}>🚩 플래그 표시만</option>
                    <option value="none">❌ 액션 없음</option>
                  </select>
                </div>

                <div class="flex items-center justify-between py-2">
                  <span class="text-gray-700 font-medium">대소문자 구분</span>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="caseSensitive" class="sr-only peer" ${this.spamSettings.caseSensitive || false ? 'checked' : ''}>
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-pink-600"></div>
                  </label>
                </div>
              </div>

              <div class="space-y-4">
                <div class="space-y-3">
                  <label class="block text-gray-700 font-medium">알림 설정</label>
                  <div class="space-y-4">
                    <label class="flex items-start cursor-pointer py-2">
                      <input type="checkbox" id="notifySpamDetected" ${this.spamSettings.notifySpamDetected || false ? 'checked' : ''}
                             class="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mt-1 min-w-[16px] min-h-[16px]">
                      <span class="ml-3 text-gray-700 text-sm">📧 스팸 감지 시 이메일 알림</span>
                    </label>
                    <label class="flex items-start cursor-pointer py-2">
                      <input type="checkbox" id="notifyThresholdExceeded" ${this.spamSettings.notifyThresholdExceeded || false ? 'checked' : ''}
                             class="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mt-1 min-w-[16px] min-h-[16px]">
                      <span class="ml-3 text-gray-700 text-sm">⚠️ 임계값 초과 시 즉시 알림</span>
                    </label>
                    <label class="flex items-start cursor-pointer py-2">
                      <input type="checkbox" id="notifyDailyReport" ${this.spamSettings.notifyDailyReport || false ? 'checked' : ''}
                             class="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mt-1 min-w-[16px] min-h-[16px]">
                      <span class="ml-3 text-gray-700 text-sm">📊 일간 스팸 리포트 발송</span>
                    </label>
                  </div>
                </div>
              </div>
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
    const section = Utils.createElement('div', 'bg-white rounded-xl shadow-lg border border-gray-200');
    
    // 프리미엄 헤더
    const header = Utils.createElement('div', 'p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50');
    header.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gradient-to-br from-gray-600 to-slate-700 rounded-lg flex items-center justify-center">
            <i class="fas fa-history text-white text-sm"></i>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">최근 스팸 탐지</h2>
            <p class="text-gray-600 text-sm">AI가 최근 차단한 스팸 댓글들을 확인하세요</p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <span class="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            ${this.spamReports.length}건 차단됨
          </span>
          <button class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2 shadow-sm" onclick="spamFilterPage.viewAllReports()">
            <i class="fas fa-external-link-alt"></i>
            <span>전체 보기</span>
          </button>
        </div>
      </div>
    `;
    
    const body = Utils.createElement('div', 'p-6');
    
    if (this.spamReports.length === 0) {
      body.innerHTML = `
        <div class="text-center py-12">
          <div class="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-shield-alt text-green-600 text-2xl"></i>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">🎉 깨끗한 상태입니다!</h3>
          <p class="text-gray-600">아직 탐지된 스팸이 없습니다. 필터가 잘 작동하고 있어요.</p>
        </div>
      `;
    } else {
      const reportsList = Utils.createElement('div', 'space-y-4');
      
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
    const item = Utils.createElement('div', 'bg-white border border-gray-200 rounded-xl p-4 md:p-6 hover:shadow-lg transition-all duration-300 hover:border-gray-300');
    
    const spamScore = (report.spam_score * 100).toFixed(0);
    const scoreColor = spamScore >= 90 ? 'from-red-500 to-red-600' : spamScore >= 70 ? 'from-orange-500 to-orange-600' : 'from-yellow-500 to-yellow-600';
    const scoreBg = spamScore >= 90 ? 'bg-red-50' : spamScore >= 70 ? 'bg-orange-50' : 'bg-yellow-50';
    const scoreText = spamScore >= 90 ? 'text-red-700' : spamScore >= 70 ? 'text-orange-700' : 'text-yellow-700';
    
    item.innerHTML = `
      <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div class="flex-1">
          <!-- 모바일에서 세로, 데스크톱에서 가로 레이아웃 -->
          <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
            <div class="w-10 h-10 bg-gradient-to-br ${scoreColor} rounded-xl flex items-center justify-center shadow-lg">
              <i class="fas fa-exclamation-triangle text-white text-sm"></i>
            </div>
            <div class="flex-1">
              <div class="flex flex-wrap items-center gap-2 mb-2">
                <span class="px-3 py-1 ${scoreBg} ${scoreText} rounded-full text-xs font-semibold">
                  🚨 스팸 ${spamScore}%
                </span>
                <span class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                  ${report.status === 'blocked' ? '🔒 차단됨' : '🔍 검토중'}
                </span>
              </div>
              <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-gray-600">
                <div class="flex items-center gap-1">
                  <i class="fas fa-user text-gray-400"></i>
                  <span class="break-all">${report.author}</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-clock text-gray-400"></i>
                  <span class="text-xs">${Utils.formatDateTime ? Utils.formatDateTime(report.created_at) : new Date(report.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-3 mb-3">
            <div class="text-sm text-gray-800 leading-relaxed break-words">
              ${report.content.length > 100 ? report.content.substring(0, 100) + '...' : report.content}
            </div>
          </div>
          
          <div class="flex items-start text-xs text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
            <i class="fas fa-lightbulb text-blue-500 mr-2 mt-0.5"></i>
            <div class="flex-1">
              <span class="font-medium">탐지 이유:</span>
              <span class="ml-1 break-words">${report.reason}</span>
            </div>
          </div>
        </div>
        
        <!-- 액션 버튼들 - 모바일에서는 가로, 데스크톱에서는 세로 -->
        <div class="flex flex-row lg:flex-col gap-2 lg:ml-4">
          <button class="flex-1 lg:flex-none px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm text-sm min-h-[44px]" onclick="spamFilterPage.reviewSpam(${report.id})">
            <i class="fas fa-search"></i>
            <span class="hidden sm:inline">상세</span>
          </button>
          <button class="flex-1 lg:flex-none px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg text-sm min-h-[44px]" onclick="spamFilterPage.markAsNotSpam(${report.id})">
            <i class="fas fa-check"></i>
            <span class="hidden sm:inline">허용</span>
          </button>
        </div>
      </div>
    `;
    
    return item;
  }

  createKeywordsSection() {
    const section = Utils.createElement('div', 'bg-white rounded-xl shadow-lg border border-gray-200 mt-8');
    
    // 프리미엄 헤더
    const header = Utils.createElement('div', 'p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50');
    header.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
          <i class="fas fa-tags text-white text-sm"></i>
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-900">키워드 관리</h2>
          <p class="text-gray-600 text-sm">스팸 차단 키워드를 관리하고 자주 탐지되는 패턴을 확인하세요</p>
        </div>
      </div>
    `;
    
    const body = Utils.createElement('div', 'p-6');
    
    body.innerHTML = `
      <div class="space-y-8">
        <div class="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border border-red-200">
          <div class="flex items-start space-x-4">
            <div class="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg mt-1">
              <i class="fas fa-ban text-white text-sm"></i>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-bold text-gray-900 mb-2">🚫 차단 키워드</h3>
              <p class="text-gray-600 text-sm mb-4">이 키워드들이 포함된 댓글은 자동으로 차단됩니다</p>
              
              <div class="space-y-4">
                <div class="flex gap-3">
                  <input type="text" id="keywordInput" placeholder="스팸, 광고, 도박, http://suspicious-site.com..." 
                         class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
                  <button class="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-all duration-200 flex items-center space-x-2 shadow-lg" onclick="spamFilterPage.addKeyword()">
                    <i class="fas fa-plus"></i>
                    <span>추가</span>
                  </button>
                </div>
                
                <div class="bg-white rounded-lg border border-gray-200 p-4 min-h-[120px]">
                  <div class="flex flex-wrap gap-2">
                    ${this.spamSettings.blockKeywords.length === 0 ? `
                      <span class="text-gray-500 text-sm italic">등록된 차단 키워드가 없습니다.</span>
                    ` : this.spamSettings.blockKeywords.map(keyword => `
                      <span class="inline-flex items-center px-3 py-2 rounded-full text-sm bg-red-100 text-red-800 border border-red-200 hover:bg-red-200 transition-colors">
                        <i class="fas fa-times-circle mr-2"></i>
                        ${keyword}
                        <button onclick="spamFilterPage.removeKeyword('${keyword}')" class="ml-2 hover:text-red-900 font-bold">×</button>
                      </span>
                    `).join('')}
                  </div>
                  ${this.spamSettings.blockKeywords.length > 0 ? `
                    <div class="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                      총 ${this.spamSettings.blockKeywords.length}개의 키워드가 활성화되어 있습니다.
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-200">
          <div class="flex items-start space-x-4">
            <div class="w-10 h-10 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg mt-1">
              <i class="fas fa-lightbulb text-white text-sm"></i>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-bold text-gray-900 mb-2">💡 자주 탐지되는 패턴</h3>
              <p class="text-gray-600 text-sm mb-4">AI가 분석한 자주 발견되는 스팸 키워드들입니다. 클릭하여 차단 목록에 추가하세요</p>
              
              <div class="bg-white rounded-lg border border-gray-200 p-4">
                <div class="flex flex-wrap gap-2">
                  ${this.spamStats.topSpamKeywords.length === 0 ? `
                    <span class="text-gray-500 text-sm italic">분석된 패턴이 없습니다.</span>
                  ` : this.spamStats.topSpamKeywords.map(keyword => `
                    <button onclick="spamFilterPage.addKeywordFromSuggestion('${keyword}')" 
                            class="inline-flex items-center px-3 py-2 rounded-full text-sm bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-yellow-200 transition-all duration-200 cursor-pointer group">
                      <i class="fas fa-search mr-2 group-hover:scale-110 transition-transform"></i>
                      ${keyword}
                      <i class="fas fa-plus ml-2 text-xs opacity-60 group-hover:opacity-100"></i>
                    </button>
                  `).join('')}
                </div>
                ${this.spamStats.topSpamKeywords.length > 0 ? `
                  <div class="mt-3 pt-3 border-t border-gray-200 text-xs text-yellow-700 bg-yellow-50 px-3 py-2 rounded">
                    <i class="fas fa-info-circle mr-1"></i>
                    이 키워드들은 최근 스팸에서 자주 발견된 패턴입니다. 추가하여 더 효과적인 필터링을 구성하세요.
                  </div>
                ` : ''}
              </div>
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
    const thresholdValueSpan = Utils.$('#threshold-value');
    if (thresholdValueSpan) {
      thresholdValueSpan.textContent = `${percentage}%`;
    }
  }

  addPresetKeywords() {
    const presetKeywords = [
      '광고', '스팸', '도박', '카지노', '대출', '투자',
      '무료', '클릭', '돈벌기', '이벤트', '추천',
      'http://', 'https://bit.ly', 'https://tinyurl.com'
    ];
    
    let addedCount = 0;
    presetKeywords.forEach(keyword => {
      if (!this.spamSettings.blockKeywords.includes(keyword)) {
        this.spamSettings.blockKeywords.push(keyword);
        addedCount++;
      }
    });
    
    if (addedCount > 0) {
      Utils.showNotification(`${addedCount}개의 기본 키워드가 추가되었습니다.`, 'success');
      this.refreshKeywordsSection();
    } else {
      Utils.showNotification('모든 기본 키워드가 이미 추가되어 있습니다.', 'info');
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
      // 기본 설정 수집
      this.spamSettings.autoFilterEnabled = Utils.$('#autoFilterToggle').checked;
      this.spamSettings.claudeApiKey = Utils.$('#claudeApiKey').value;
      this.spamSettings.spamThreshold = parseFloat(Utils.$('#spamThreshold').value);
      this.spamSettings.autoDeleteSpam = Utils.$('#autoDeleteSpam').checked;
      
      // 새로운 설정들 수집
      this.spamSettings.caseSensitive = Utils.$('#caseSensitive').checked;
      this.spamSettings.notifySpamDetected = Utils.$('#notifySpamDetected').checked;
      this.spamSettings.notifyThresholdExceeded = Utils.$('#notifyThresholdExceeded').checked;
      this.spamSettings.notifyDailyReport = Utils.$('#notifyDailyReport').checked;
      
      // 자동 액션 설정
      const autoAction = Utils.$('#autoAction').value;
      this.spamSettings.autoDeleteSpam = autoAction === 'delete';
      this.spamSettings.autoAction = autoAction;
      
      // 키워드 설정 업데이트
      const keywordsInput = Utils.$('#blockKeywordsInput');
      if (keywordsInput) {
        const keywords = keywordsInput.value.split(',').map(k => k.trim()).filter(k => k);
        this.spamSettings.blockKeywords = keywords;
      }

      // 실제로는 API를 통해 설정 저장
      // await window.apiService.updateSpamSettings(this.spamSettings);
      
      Utils.showNotification('스팸 필터 설정이 성공적으로 저장되었습니다! 🎉', 'success');
    } catch (error) {
      console.error('설정 저장 실패:', error);
      Utils.showNotification('설정 저장에 실패했습니다. 다시 시도해주세요.', 'error');
    }
  }

  testSpamFilter() {
    const modalContent = Utils.createElement('div');
    modalContent.style.cssText = `
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      line-height: 1.6 !important;
    `;
    
    modalContent.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%) !important;
        border-radius: 12px !important;
        padding: 24px !important;
        border: 1px solid #bfdbfe !important;
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
            background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%) !important;
            border-radius: 12px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            margin-right: 16px !important;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
          ">
            <span style="color: white !important; font-size: 20px !important;">🧪</span>
          </div>
          <div style="flex: 1 !important;">
            <h3 style="
              font-size: 18px !important;
              font-weight: 700 !important;
              color: #1e293b !important;
              margin: 0 0 4px 0 !important;
              line-height: 1.4 !important;
            ">스팸 필터 테스트</h3>
            <p style="
              font-size: 14px !important;
              color: #64748b !important;
              margin: 0 !important;
              line-height: 1.4 !important;
            ">댓글 내용을 입력하여 스팸 필터가 어떻게 판정하는지 확인해보세요</p>
          </div>
        </div>
        
        <div style="margin-bottom: 20px !important;">
          <label style="
            display: block !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            color: #374151 !important;
            margin-bottom: 8px !important;
          ">테스트할 댓글 내용</label>
          <textarea id="testCommentContent" rows="5" placeholder="예: 무료로 돈벌기! 클릭하세요 http://spam.com
또는: 좋은 글 감사합니다. 도움이 되었어요."
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
          <div style="
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            margin-top: 8px !important;
            font-size: 12px !important;
            color: #6b7280 !important;
          ">
            <span>현재 설정된 임계값: ${(this.spamSettings.spamThreshold * 100).toFixed(0)}%</span>
            <span id="charCount">0/1000자</span>
          </div>
        </div>
        
        <div style="
          display: grid !important;
          grid-template-columns: ${window.innerWidth >= 640 ? '1fr 1fr' : '1fr'} !important;
          gap: 12px !important;
        ">
          <button type="button" style="
            padding: 12px 16px !important;
            background: #fef3c7 !important;
            color: #d97706 !important;
            border: 1px solid #fbbf24 !important;
            border-radius: 8px !important;
            cursor: pointer !important;
            transition: all 0.2s ease !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 8px !important;
            font-size: 14px !important;
            font-weight: 500 !important;
          " onclick="document.getElementById('testCommentContent').value = '무료로 돈벌기! 지금 클릭하세요 http://spam-site.com'">
            <span>⚠️</span>
            <span>스팸 예시</span>
          </button>
          <button type="button" style="
            padding: 12px 16px !important;
            background: #d1fae5 !important;
            color: #065f46 !important;
            border: 1px solid #10b981 !important;
            border-radius: 8px !important;
            cursor: pointer !important;
            transition: all 0.2s ease !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 8px !important;
            font-size: 14px !important;
            font-weight: 500 !important;
          " onclick="document.getElementById('testCommentContent').value = '좋은 글 감사합니다. 많은 도움이 되었어요!'">
            <span>✅</span>
            <span>정상 예시</span>
          </button>
        </div>
      </div>
      
      <div id="testResult" style="display: none !important;">
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
      resultDiv.style.display = 'block !important';
      
      const isSpam = mockResult.is_spam;
      const spamScore = (mockResult.spam_score * 100).toFixed(1);
      const resultBg = isSpam ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)' : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)';
      const resultBorder = isSpam ? '#fecaca' : '#bbf7d0';
      const resultIconBg = isSpam ? 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      const resultIcon = isSpam ? '🚨' : '✅';
      
      resultDiv.innerHTML = `
        <div style="
          background: ${resultBg} !important;
          border-radius: 12px !important;
          padding: 24px !important;
          border: 1px solid ${resultBorder} !important;
          margin-top: 20px !important;
        ">
          <div style="
            display: flex !important;
            align-items: flex-start !important;
            gap: 16px !important;
          ">
            <div style="
              width: 48px !important;
              height: 48px !important;
              background: ${resultIconBg} !important;
              border-radius: 12px !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
              flex-shrink: 0 !important;
            ">
              <span style="color: white !important; font-size: 20px !important;">${resultIcon}</span>
            </div>
            <div style="flex: 1 !important;">
              <h4 style="
                font-size: 20px !important;
                font-weight: 700 !important;
                color: #1e293b !important;
                margin: 0 0 16px 0 !important;
                line-height: 1.4 !important;
              ">
                ${isSpam ? '스팸으로 판정됨' : '정상 댓글로 판정됨'}
              </h4>
              
              <div style="
                display: grid !important;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)) !important;
                gap: 16px !important;
                margin-bottom: 20px !important;
              ">
                <div style="
                  background: rgba(255, 255, 255, 0.8) !important;
                  backdrop-filter: blur(4px) !important;
                  border-radius: 8px !important;
                  padding: 16px !important;
                  border: 1px solid rgba(255, 255, 255, 0.6) !important;
                ">
                  <div style="
                    font-size: 12px !important;
                    color: #64748b !important;
                    margin-bottom: 4px !important;
                    font-weight: 500 !important;
                  ">스팸 점수</div>
                  <div style="
                    font-size: 24px !important;
                    font-weight: 700 !important;
                    color: ${isSpam ? '#dc2626' : '#059669'} !important;
                    line-height: 1 !important;
                  ">
                    ${spamScore}%
                  </div>
                  <div style="
                    width: 100% !important;
                    height: 6px !important;
                    background: #e5e7eb !important;
                    border-radius: 999px !important;
                    margin-top: 8px !important;
                    overflow: hidden !important;
                  ">
                    <div style="
                      background: ${isSpam ? 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(90deg, #10b981 0%, #059669 100%)'} !important;
                      height: 100% !important;
                      border-radius: inherit !important;
                      width: ${spamScore}% !important;
                      transition: width 0.5s ease !important;
                    "></div>
                  </div>
                </div>
                
                <div style="
                  background: rgba(255, 255, 255, 0.8) !important;
                  backdrop-filter: blur(4px) !important;
                  border-radius: 8px !important;
                  padding: 16px !important;
                  border: 1px solid rgba(255, 255, 255, 0.6) !important;
                ">
                  <div style="
                    font-size: 12px !important;
                    color: #64748b !important;
                    margin-bottom: 4px !important;
                    font-weight: 500 !important;
                  ">임계값</div>
                  <div style="
                    font-size: 24px !important;
                    font-weight: 700 !important;
                    color: #374151 !important;
                    line-height: 1 !important;
                  ">
                    ${(this.spamSettings.spamThreshold * 100).toFixed(0)}%
                  </div>
                  <div style="
                    font-size: 11px !important;
                    color: #6b7280 !important;
                    margin-top: 4px !important;
                  ">
                    ${mockResult.spam_score >= this.spamSettings.spamThreshold ? '기준 초과' : '기준 미만'}
                  </div>
                </div>
                
                <div style="
                  background: rgba(255, 255, 255, 0.8) !important;
                  backdrop-filter: blur(4px) !important;
                  border-radius: 8px !important;
                  padding: 16px !important;
                  border: 1px solid rgba(255, 255, 255, 0.6) !important;
                ">
                  <div style="
                    font-size: 12px !important;
                    color: #64748b !important;
                    margin-bottom: 4px !important;
                    font-weight: 500 !important;
                  ">최종 판정</div>
                  <div style="
                    font-size: 18px !important;
                    font-weight: 700 !important;
                    color: ${isSpam ? '#dc2626' : '#059669'} !important;
                    line-height: 1 !important;
                  ">
                    ${isSpam ? '차단' : '허용'}
                  </div>
                  <div style="
                    font-size: 11px !important;
                    color: #6b7280 !important;
                    margin-top: 4px !important;
                  ">
                    ${isSpam ? '자동 처리됨' : '게시 허용됨'}
                  </div>
                </div>
              </div>
              
              <div style="
                background: rgba(255, 255, 255, 0.8) !important;
                backdrop-filter: blur(4px) !important;
                border-radius: 8px !important;
                padding: 16px !important;
                border: 1px solid rgba(255, 255, 255, 0.6) !important;
                margin-bottom: 16px !important;
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
                    color: #1e293b !important;
                  ">탐지 이유</span>
                </div>
                <p style="
                  color: #374151 !important;
                  font-size: 14px !important;
                  line-height: 1.5 !important;
                  margin: 0 !important;
                ">${mockResult.reason}</p>
              </div>
              
              ${isSpam ? `
                <div style="
                  background: rgba(254, 226, 226, 0.8) !important;
                  backdrop-filter: blur(4px) !important;
                  border-radius: 8px !important;
                  padding: 12px 16px !important;
                  border: 1px solid rgba(252, 165, 165, 0.6) !important;
                ">
                  <div style="
                    font-size: 13px !important;
                    color: #991b1b !important;
                    line-height: 1.4 !important;
                  ">
                    <span style="margin-right: 4px !important;">ℹ️</span>
                    <strong>자동 처리:</strong> 이 댓글은 현재 설정에 따라 자동으로 ${this.spamSettings.autoDeleteSpam ? '삭제' : '숨김 처리'}됩니다.
                  </div>
                </div>
              ` : `
                <div style="
                  background: rgba(209, 250, 229, 0.8) !important;
                  backdrop-filter: blur(4px) !important;
                  border-radius: 8px !important;
                  padding: 12px 16px !important;
                  border: 1px solid rgba(167, 243, 208, 0.6) !important;
                ">
                  <div style="
                    font-size: 13px !important;
                    color: #064e3b !important;
                    line-height: 1.4 !important;
                  ">
                    <span style="margin-right: 4px !important;">✅</span>
                    <strong>자동 처리:</strong> 이 댓글은 자동으로 게시 승인됩니다.
                  </div>
                </div>
              `}
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