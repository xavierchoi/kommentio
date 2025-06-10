// Kommentio Admin Dashboard - Settings Page

class SettingsPage {
  constructor() {
    this.settings = {};
    this.isDirty = false;
  }

  async render() {
    console.log('Settings 페이지 렌더링 시작...');
    const container = Utils.$('#page-settings');
    if (!container) {
      console.error('Settings 컨테이너를 찾을 수 없습니다.');
      return;
    }

    container.innerHTML = '';

    // 페이지 헤더
    const header = this.createPageHeader();
    container.appendChild(header);

    // 설정 섹션들
    const settingsContainer = this.createSettingsContainer();
    container.appendChild(settingsContainer);

    // 초기 데이터 로드
    await this.loadSettings();

    console.log('Settings 페이지 렌더링 완료');
  }

  createPageHeader() {
    const header = Utils.createElement('div', 'bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-800 rounded-2xl p-8 mb-8 text-white relative overflow-hidden shadow-2xl');
    
    header.innerHTML = `
      <!-- 배경 장식 원들 -->
      <div class="absolute -top-20 -right-8 w-48 h-48 bg-white bg-opacity-10 rounded-full"></div>
      <div class="absolute -bottom-12 -left-4 w-32 h-32 bg-white bg-opacity-5 rounded-full"></div>
      
      <div class="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <!-- 메인 콘텐츠 영역 -->
        <div class="flex-1 min-w-0">
          <!-- 제목 섹션 -->
          <div class="flex items-center space-x-4 mb-6">
            <div class="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <i class="fas fa-cog text-white text-3xl"></i>
            </div>
            <div>
              <h1 class="text-4xl font-bold text-white drop-shadow-lg">시스템 설정</h1>
              <p class="text-lg text-white text-opacity-90 mt-2 drop-shadow-sm">Kommentio 댓글 시스템의 전체적인 설정을 관리하세요</p>
            </div>
          </div>
          
          <!-- 상태 통계 카드들 -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="bg-white bg-opacity-15 backdrop-blur-sm p-4 rounded-xl border border-white border-opacity-20">
              <div class="flex items-center space-x-3">
                <i class="fas fa-shield-alt text-yellow-300 text-2xl"></i>
                <div>
                  <div class="text-2xl font-bold text-white">${this.getSecurityLevel()}</div>
                  <div class="text-sm text-white text-opacity-80">보안 수준</div>
                </div>
              </div>
            </div>
            <div class="bg-white bg-opacity-15 backdrop-blur-sm p-4 rounded-xl border border-white border-opacity-20">
              <div class="flex items-center space-x-3">
                <i class="fas fa-clock text-green-300 text-2xl"></i>
                <div>
                  <div class="text-2xl font-bold text-white">99.9%</div>
                  <div class="text-sm text-white text-opacity-80">시스템 가동률</div>
                </div>
              </div>
            </div>
            <div class="bg-white bg-opacity-15 backdrop-blur-sm p-4 rounded-xl border border-white border-opacity-20">
              <div class="flex items-center space-x-3">
                <i class="fas fa-sync-alt text-purple-300 text-2xl"></i>
                <div>
                  <div class="text-2xl font-bold text-white">자동</div>
                  <div class="text-sm text-white text-opacity-80">백업 상태</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 액션 버튼들 -->
        <div class="flex flex-col sm:flex-row gap-3 lg:flex-col lg:w-auto">
          <button class="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-2 border-white border-opacity-30 hover:border-opacity-50 px-6 py-3 rounded-xl font-semibold transition-all duration-300 backdrop-blur-sm flex items-center justify-center space-x-2 min-h-[44px] group" onclick="settingsPage.exportSettings()">
            <i class="fas fa-download group-hover:animate-bounce"></i>
            <span class="hidden sm:inline">설정 내보내기</span>
            <span class="sm:hidden">내보내기</span>
          </button>
          <button class="bg-white hover:bg-gray-50 text-indigo-600 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 min-h-[44px] shadow-lg hover:shadow-xl hover:-translate-y-0.5 group" onclick="settingsPage.saveAllSettings()">
            <i class="fas fa-save group-hover:animate-pulse"></i>
            <span class="hidden sm:inline">모든 설정 저장</span>
            <span class="sm:hidden">저장</span>
          </button>
        </div>
      </div>
    `;
    
    return header;
  }

  getSecurityLevel() {
    // 실제 보안 설정을 확인하여 수준 반환
    return '높음';
  }

  createSettingsContainer() {
    const container = Utils.createElement('div', 'grid gap-8');

    // 일반 설정
    const generalSettings = this.createGeneralSettings();
    container.appendChild(generalSettings);

    // 보안 설정
    const securitySettings = this.createSecuritySettings();
    container.appendChild(securitySettings);

    // 알림 설정
    const notificationSettings = this.createNotificationSettings();
    container.appendChild(notificationSettings);

    // 고급 설정
    const advancedSettings = this.createAdvancedSettings();
    container.appendChild(advancedSettings);

    return container;
  }

  createGeneralSettings() {
    const section = Utils.createElement('div', 'bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300');

    section.innerHTML = `
      <!-- 섹션 헤더 -->
      <div class="mb-6">
        <div class="flex items-center space-x-3 mb-2">
          <div class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <i class="fas fa-sliders-h text-white text-xl"></i>
          </div>
          <h2 class="text-2xl font-bold text-gray-900">일반 설정</h2>
        </div>
        <p class="text-gray-600">사이트의 기본적인 설정들을 관리합니다</p>
      </div>
      
      <!-- 설정 폼 -->
      <div class="space-y-6">
        <!-- 기본 정보 그리드 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">사이트 이름</label>
            <input type="text" id="siteName" value="Kommentio 댓글 시스템" 
                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200 bg-white">
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">관리자 이메일</label>
            <input type="email" id="adminEmail" value="admin@kommentio.com"
                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200 bg-white">
          </div>
        </div>
        
        <!-- 사이트 설명 -->
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-gray-700">사이트 설명</label>
          <textarea id="siteDescription" rows="3" 
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200 bg-white resize-vertical">Kommentio는 오픈소스 댓글 시스템입니다.</textarea>
        </div>
        
        <!-- 언어 및 시간대 설정 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">기본 언어</label>
            <select id="defaultLanguage" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200 bg-white">
              <option value="ko">한국어</option>
              <option value="en">English</option>
              <option value="ja">日本語</option>
              <option value="zh">中文</option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">시간대</label>
            <select id="timezone" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200 bg-white">
              <option value="Asia/Seoul">Asia/Seoul (KST)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
            </select>
          </div>
        </div>
        
        <!-- 표시 옵션 -->
        <div class="pt-6 border-t border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">표시 옵션</h3>
          <div class="space-y-4">
            <label class="flex items-center space-x-3 cursor-pointer group">
              <input type="checkbox" id="showCommentCount" checked 
                     class="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 focus:ring-2 transition-colors duration-200">
              <span class="font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">댓글 수 표시</span>
            </label>
            <label class="flex items-center space-x-3 cursor-pointer group">
              <input type="checkbox" id="showTimestamp" checked 
                     class="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 focus:ring-2 transition-colors duration-200">
              <span class="font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">작성 시간 표시</span>
            </label>
            <label class="flex items-center space-x-3 cursor-pointer group">
              <input type="checkbox" id="allowAnonymous" checked 
                     class="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 focus:ring-2 transition-colors duration-200">
              <span class="font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">익명 댓글 허용</span>
            </label>
          </div>
        </div>
      </div>
    `;

    return section;
  }

  createSecuritySettings() {
    const section = Utils.createElement('div', 'bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300');

    section.innerHTML = `
      <!-- 섹션 헤더 -->
      <div class="mb-6">
        <div class="flex items-center space-x-3 mb-2">
          <div class="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
            <i class="fas fa-shield-alt text-white text-xl"></i>
          </div>
          <h2 class="text-2xl font-bold text-gray-900">보안 설정</h2>
        </div>
        <p class="text-gray-600">댓글 시스템의 보안 및 스팸 방지 설정을 관리합니다</p>
      </div>
      
      <!-- 설정 섹션들 -->
      <div class="space-y-6">
        <!-- 스팸 방지 설정 -->
        <div class="bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 class="text-lg font-semibold text-red-800 mb-4 flex items-center space-x-2">
            <i class="fas fa-exclamation-triangle text-red-600"></i>
            <span>스팸 방지 설정</span>
          </h3>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-gray-700">스팸 임계값</label>
              <input type="range" id="spamThreshold" min="0" max="1" step="0.1" value="0.7" 
                     class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider">
              <div class="flex justify-between text-xs text-gray-500 mt-1">
                <span>낮음 (0)</span>
                <span>높음 (1)</span>
              </div>
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-gray-700">댓글 승인 방식</label>
              <select id="approvalMode" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 bg-white">
                <option value="auto">자동 승인</option>
                <option value="manual">수동 승인</option>
                <option value="first-time">첫 댓글만 승인</option>
              </select>
            </div>
          </div>
          <div class="mt-4">
            <label class="flex items-center space-x-3 cursor-pointer group">
              <input type="checkbox" id="enableSpamFilter" checked 
                     class="w-5 h-5 text-red-600 rounded focus:ring-red-500 focus:ring-2 transition-colors duration-200">
              <span class="font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">AI 스팸 필터 활성화</span>
            </label>
          </div>
        </div>
        
        <!-- 접근 제어 설정 -->
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 class="text-lg font-semibold text-blue-800 mb-4 flex items-center space-x-2">
            <i class="fas fa-user-shield text-blue-600"></i>
            <span>접근 제어</span>
          </h3>
          <div class="space-y-4 mb-6">
            <label class="flex items-center space-x-3 cursor-pointer group">
              <input type="checkbox" id="requireLogin" 
                     class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2 transition-colors duration-200">
              <span class="font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">댓글 작성 시 로그인 필수</span>
            </label>
            <label class="flex items-center space-x-3 cursor-pointer group">
              <input type="checkbox" id="enableCaptcha" 
                     class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2 transition-colors duration-200">
              <span class="font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">CAPTCHA 인증 활성화</span>
            </label>
            <label class="flex items-center space-x-3 cursor-pointer group">
              <input type="checkbox" id="enableRateLimit" checked 
                     class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2 transition-colors duration-200">
              <span class="font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">댓글 작성 속도 제한</span>
            </label>
          </div>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-gray-700">최대 댓글 길이</label>
              <input type="number" id="maxCommentLength" value="2000" min="100" max="10000" 
                     class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white">
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-gray-700">댓글 작성 간격 (초)</label>
              <input type="number" id="commentInterval" value="30" min="5" max="300" 
                     class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white">
            </div>
          </div>
        </div>
        
        <!-- 차단 키워드 -->
        <div class="space-y-3">
          <h3 class="text-lg font-semibold text-gray-900">차단 키워드</h3>
          <textarea id="blockedWords" rows="4" placeholder="쉼표로 구분하여 차단할 키워드를 입력하세요" 
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors duration-200 bg-white resize-vertical"></textarea>
        </div>
      </div>
    `;

    return section;
  }

  createNotificationSettings() {
    const section = Utils.createElement('div', 'bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300');

    section.innerHTML = `
      <!-- 섹션 헤더 -->
      <div class="mb-6">
        <div class="flex items-center space-x-3 mb-2">
          <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
            <i class="fas fa-bell text-white text-xl"></i>
          </div>
          <h2 class="text-2xl font-bold text-gray-900">알림 설정</h2>
        </div>
        <p class="text-gray-600">이메일 및 시스템 알림 설정을 관리합니다</p>
      </div>
      
      <!-- 알림 설정들 -->
      <div class="space-y-6">
        <!-- 이메일 알림 -->
        <div class="bg-sky-50 border border-sky-200 rounded-xl p-6">
          <h3 class="text-lg font-semibold text-sky-800 mb-4 flex items-center space-x-2">
            <i class="fas fa-envelope text-sky-600"></i>
            <span>이메일 알림</span>
          </h3>
          <div class="space-y-4">
            <label class="flex items-center space-x-3 cursor-pointer group">
              <input type="checkbox" id="emailNewComment" checked 
                     class="w-5 h-5 text-sky-600 rounded focus:ring-sky-500 focus:ring-2 transition-colors duration-200">
              <span class="font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">새 댓글 알림</span>
            </label>
            <label class="flex items-center space-x-3 cursor-pointer group">
              <input type="checkbox" id="emailSpamDetected" checked 
                     class="w-5 h-5 text-sky-600 rounded focus:ring-sky-500 focus:ring-2 transition-colors duration-200">
              <span class="font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">스팸 탐지 알림</span>
            </label>
            <label class="flex items-center space-x-3 cursor-pointer group">
              <input type="checkbox" id="emailSystemUpdate" 
                     class="w-5 h-5 text-sky-600 rounded focus:ring-sky-500 focus:ring-2 transition-colors duration-200">
              <span class="font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">시스템 업데이트 알림</span>
            </label>
            <label class="flex items-center space-x-3 cursor-pointer group">
              <input type="checkbox" id="emailWeeklyReport" 
                     class="w-5 h-5 text-sky-600 rounded focus:ring-sky-500 focus:ring-2 transition-colors duration-200">
              <span class="font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">주간 리포트</span>
            </label>
          </div>
        </div>
        
        <!-- 푸시 알림 -->
        <div class="bg-green-50 border border-green-200 rounded-xl p-6">
          <h3 class="text-lg font-semibold text-green-800 mb-4 flex items-center space-x-2">
            <i class="fas fa-mobile-alt text-green-600"></i>
            <span>푸시 알림</span>
          </h3>
          <div class="space-y-4">
            <label class="flex items-center space-x-3 cursor-pointer group">
              <input type="checkbox" id="pushNewComment" 
                     class="w-5 h-5 text-green-600 rounded focus:ring-green-500 focus:ring-2 transition-colors duration-200">
              <span class="font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">브라우저 푸시 알림</span>
            </label>
            <label class="flex items-center space-x-3 cursor-pointer group">
              <input type="checkbox" id="pushSpamAlert" 
                     class="w-5 h-5 text-green-600 rounded focus:ring-green-500 focus:ring-2 transition-colors duration-200">
              <span class="font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">스팸 경고 알림</span>
            </label>
          </div>
        </div>
        
        <!-- 알림 빈도 설정 -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">알림 빈도</h3>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-gray-700">이메일 묶음 발송 간격</label>
              <select id="emailBatchInterval" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 bg-white">
                <option value="immediate">즉시</option>
                <option value="hourly">매시간</option>
                <option value="daily">매일</option>
                <option value="weekly">매주</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-gray-700">최대 알림 개수</label>
              <input type="number" id="maxNotifications" value="100" min="10" max="1000" 
                     class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 bg-white">
            </div>
          </div>
        </div>
      </div>
    `;

    return section;
  }

  createAdvancedSettings() {
    const section = Utils.createElement('div', 'bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300');

    section.innerHTML = `
      <!-- 섹션 헤더 -->
      <div class="mb-6">
        <div class="flex items-center space-x-3 mb-2">
          <div class="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
            <i class="fas fa-cogs text-white text-xl"></i>
          </div>
          <h2 class="text-2xl font-bold text-gray-900">고급 설정</h2>
        </div>
        <p class="text-gray-600">시스템의 고급 기능과 개발자 옵션을 설정합니다</p>
      </div>
      
      <!-- 고급 설정들 -->
      <div class="space-y-6">
        <!-- 데이터베이스 설정 -->
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h3 class="text-lg font-semibold text-amber-800 mb-4 flex items-center space-x-2">
            <i class="fas fa-database text-amber-600"></i>
            <span>데이터베이스 설정</span>
          </h3>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-gray-700">백업 간격</label>
              <select id="backupInterval" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200 bg-white">
                <option value="daily">매일</option>
                <option value="weekly">매주</option>
                <option value="monthly">매월</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-gray-700">백업 보관 기간 (일)</label>
              <input type="number" id="backupRetention" value="30" min="7" max="365" 
                     class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200 bg-white">
            </div>
          </div>
          <label class="flex items-center space-x-3 cursor-pointer group">
            <input type="checkbox" id="autoBackup" checked 
                   class="w-5 h-5 text-amber-600 rounded focus:ring-amber-500 focus:ring-2 transition-colors duration-200">
            <span class="font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">자동 백업 활성화</span>
          </label>
        </div>
        
        <!-- 개발자 옵션 -->
        <div class="bg-violet-50 border border-violet-200 rounded-xl p-6">
          <h3 class="text-lg font-semibold text-violet-800 mb-4 flex items-center space-x-2">
            <i class="fas fa-code text-violet-600"></i>
            <span>개발자 옵션</span>
          </h3>
          <div class="space-y-4 mb-6">
            <label class="flex items-center space-x-3 cursor-pointer group">
              <input type="checkbox" id="enableDebugMode" 
                     class="w-5 h-5 text-violet-600 rounded focus:ring-violet-500 focus:ring-2 transition-colors duration-200">
              <span class="font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">디버그 모드 활성화</span>
            </label>
            <label class="flex items-center space-x-3 cursor-pointer group">
              <input type="checkbox" id="enableApiLogging" 
                     class="w-5 h-5 text-violet-600 rounded focus:ring-violet-500 focus:ring-2 transition-colors duration-200">
              <span class="font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">API 로깅 활성화</span>
            </label>
            <label class="flex items-center space-x-3 cursor-pointer group">
              <input type="checkbox" id="enablePerformanceMonitoring" checked 
                     class="w-5 h-5 text-violet-600 rounded focus:ring-violet-500 focus:ring-2 transition-colors duration-200">
              <span class="font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">성능 모니터링 활성화</span>
            </label>
            <label class="flex items-center space-x-3 cursor-pointer group">
              <input type="checkbox" id="enableSidebarAutoClose" checked 
                     class="w-5 h-5 text-violet-600 rounded focus:ring-violet-500 focus:ring-2 transition-colors duration-200"
                     onchange="settingsPage.toggleSidebarAutoClose(this.checked)">
              <div class="flex-1">
                <span class="font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">모바일 사이드바 자동 닫기</span>
                <div class="text-sm text-gray-500 mt-1">페이지 이동 시 모바일에서 사이드바 자동 닫기 (권장)</div>
              </div>
            </label>
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">로그 보관 기간 (일)</label>
            <input type="number" id="logRetention" value="90" min="7" max="365" 
                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors duration-200 bg-white">
          </div>
        </div>
        
        <!-- 위험 구역 -->
        <div class="bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 class="text-lg font-semibold text-red-800 mb-4 flex items-center space-x-2">
            <i class="fas fa-exclamation-triangle text-red-600"></i>
            <span>위험 구역</span>
          </h3>
          <p class="text-gray-600 mb-6">아래 작업들은 시스템에 영구적인 영향을 줄 수 있습니다.</p>
          <div class="flex flex-col sm:flex-row gap-3">
            <button class="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center space-x-2 min-h-[44px]" onclick="settingsPage.resetAllSettings()">
              <i class="fas fa-undo"></i>
              <span>모든 설정 초기화</span>
            </button>
            <button class="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center space-x-2 min-h-[44px]" onclick="settingsPage.clearAllData()">
              <i class="fas fa-trash-alt"></i>
              <span>모든 데이터 삭제</span>
            </button>
          </div>
        </div>
      </div>
      
      <!-- 푸터 액션 영역 -->
      <div class="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="text-sm text-gray-500">
          마지막 저장: <span id="lastSaved" class="font-medium text-gray-700">방금 전</span>
        </div>
        <div class="flex flex-col sm:flex-row gap-3">
          <button class="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors duration-200 min-h-[44px]" onclick="settingsPage.resetToDefaults()">
            기본값으로 복원
          </button>
          <button class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 min-h-[44px] shadow-lg hover:shadow-xl" onclick="settingsPage.saveAllSettings()">
            <i class="fas fa-save"></i>
            <span>변경사항 저장</span>
          </button>
        </div>
      </div>
    `;

    return section;
  }

  async loadSettings() {
    try {
      // 실제 환경에서는 API에서 설정을 불러옴
      this.settings = {
        general: {
          siteName: 'Kommentio 댓글 시스템',
          adminEmail: 'admin@kommentio.com',
          siteDescription: 'Kommentio는 오픈소스 댓글 시스템입니다.',
          defaultLanguage: 'ko',
          timezone: 'Asia/Seoul',
          showCommentCount: true,
          showTimestamp: true,
          allowAnonymous: true
        },
        security: {
          spamThreshold: 0.7,
          approvalMode: 'auto',
          enableSpamFilter: true,
          requireLogin: false,
          enableCaptcha: false,
          enableRateLimit: true,
          maxCommentLength: 2000,
          commentInterval: 30,
          blockedWords: ''
        },
        notifications: {
          emailNewComment: true,
          emailSpamDetected: true,
          emailSystemUpdate: false,
          emailWeeklyReport: false,
          pushNewComment: false,
          pushSpamAlert: false,
          emailBatchInterval: 'immediate',
          maxNotifications: 100
        },
        advanced: {
          backupInterval: 'daily',
          backupRetention: 30,
          autoBackup: true,
          enableDebugMode: false,
          enableApiLogging: false,
          enablePerformanceMonitoring: true,
          enableSidebarAutoClose: true, // 기본값: 활성화
          logRetention: 90
        }
      };

      this.populateFormFields();
    } catch (error) {
      console.error('설정 로딩 실패:', error);
      Utils.showNotification('설정을 불러오는데 실패했습니다.', 'error');
    }
  }

  populateFormFields() {
    // 일반 설정
    if (Utils.$('#siteName')) Utils.$('#siteName').value = this.settings.general.siteName;
    if (Utils.$('#adminEmail')) Utils.$('#adminEmail').value = this.settings.general.adminEmail;
    if (Utils.$('#siteDescription')) Utils.$('#siteDescription').value = this.settings.general.siteDescription;
    if (Utils.$('#defaultLanguage')) Utils.$('#defaultLanguage').value = this.settings.general.defaultLanguage;
    if (Utils.$('#timezone')) Utils.$('#timezone').value = this.settings.general.timezone;
    if (Utils.$('#showCommentCount')) Utils.$('#showCommentCount').checked = this.settings.general.showCommentCount;
    
    // localStorage에서 실제 사이드바 자동 닫기 설정 확인
    const actualAutoCloseEnabled = localStorage.getItem('sidebar-auto-close') !== 'false';
    
    // 실제 설정으로 UI 업데이트
    this.settings.advanced.enableSidebarAutoClose = actualAutoCloseEnabled;
    if (Utils.$('#showTimestamp')) Utils.$('#showTimestamp').checked = this.settings.general.showTimestamp;
    if (Utils.$('#allowAnonymous')) Utils.$('#allowAnonymous').checked = this.settings.general.allowAnonymous;

    // 보안 설정
    if (Utils.$('#spamThreshold')) Utils.$('#spamThreshold').value = this.settings.security.spamThreshold;
    if (Utils.$('#approvalMode')) Utils.$('#approvalMode').value = this.settings.security.approvalMode;
    if (Utils.$('#enableSpamFilter')) Utils.$('#enableSpamFilter').checked = this.settings.security.enableSpamFilter;
    if (Utils.$('#requireLogin')) Utils.$('#requireLogin').checked = this.settings.security.requireLogin;
    if (Utils.$('#enableCaptcha')) Utils.$('#enableCaptcha').checked = this.settings.security.enableCaptcha;
    if (Utils.$('#enableRateLimit')) Utils.$('#enableRateLimit').checked = this.settings.security.enableRateLimit;
    if (Utils.$('#maxCommentLength')) Utils.$('#maxCommentLength').value = this.settings.security.maxCommentLength;
    if (Utils.$('#commentInterval')) Utils.$('#commentInterval').value = this.settings.security.commentInterval;
    if (Utils.$('#blockedWords')) Utils.$('#blockedWords').value = this.settings.security.blockedWords;

    // 알림 설정
    if (Utils.$('#emailNewComment')) Utils.$('#emailNewComment').checked = this.settings.notifications.emailNewComment;
    if (Utils.$('#emailSpamDetected')) Utils.$('#emailSpamDetected').checked = this.settings.notifications.emailSpamDetected;
    if (Utils.$('#emailSystemUpdate')) Utils.$('#emailSystemUpdate').checked = this.settings.notifications.emailSystemUpdate;
    if (Utils.$('#emailWeeklyReport')) Utils.$('#emailWeeklyReport').checked = this.settings.notifications.emailWeeklyReport;
    if (Utils.$('#pushNewComment')) Utils.$('#pushNewComment').checked = this.settings.notifications.pushNewComment;
    if (Utils.$('#pushSpamAlert')) Utils.$('#pushSpamAlert').checked = this.settings.notifications.pushSpamAlert;
    if (Utils.$('#emailBatchInterval')) Utils.$('#emailBatchInterval').value = this.settings.notifications.emailBatchInterval;
    if (Utils.$('#maxNotifications')) Utils.$('#maxNotifications').value = this.settings.notifications.maxNotifications;

    // 고급 설정
    if (Utils.$('#backupInterval')) Utils.$('#backupInterval').value = this.settings.advanced.backupInterval;
    if (Utils.$('#backupRetention')) Utils.$('#backupRetention').value = this.settings.advanced.backupRetention;
    if (Utils.$('#autoBackup')) Utils.$('#autoBackup').checked = this.settings.advanced.autoBackup;
    if (Utils.$('#enableDebugMode')) Utils.$('#enableDebugMode').checked = this.settings.advanced.enableDebugMode;
    if (Utils.$('#enableApiLogging')) Utils.$('#enableApiLogging').checked = this.settings.advanced.enableApiLogging;
    if (Utils.$('#enablePerformanceMonitoring')) Utils.$('#enablePerformanceMonitoring').checked = this.settings.advanced.enablePerformanceMonitoring;
    if (Utils.$('#enableSidebarAutoClose')) Utils.$('#enableSidebarAutoClose').checked = this.settings.advanced.enableSidebarAutoClose;
    if (Utils.$('#logRetention')) Utils.$('#logRetention').value = this.settings.advanced.logRetention;
  }

  saveAllSettings() {
    try {
      // 폼에서 값들 수집
      this.collectFormData();

      // 실제 환경에서는 API에 저장
      console.log('설정 저장:', this.settings);

      // 마지막 저장 시간 업데이트
      if (Utils.$('#lastSaved')) {
        Utils.$('#lastSaved').textContent = new Date().toLocaleString('ko-KR');
      }

      Utils.showNotification('모든 설정이 저장되었습니다.', 'success');
      this.isDirty = false;
    } catch (error) {
      console.error('설정 저장 실패:', error);
      Utils.showNotification('설정 저장에 실패했습니다.', 'error');
    }
  }

  collectFormData() {
    // 일반 설정
    this.settings.general = {
      siteName: Utils.$('#siteName')?.value || '',
      adminEmail: Utils.$('#adminEmail')?.value || '',
      siteDescription: Utils.$('#siteDescription')?.value || '',
      defaultLanguage: Utils.$('#defaultLanguage')?.value || 'ko',
      timezone: Utils.$('#timezone')?.value || 'Asia/Seoul',
      showCommentCount: Utils.$('#showCommentCount')?.checked || false,
      showTimestamp: Utils.$('#showTimestamp')?.checked || false,
      allowAnonymous: Utils.$('#allowAnonymous')?.checked || false
    };

    // 보안 설정
    this.settings.security = {
      spamThreshold: parseFloat(Utils.$('#spamThreshold')?.value || '0.7'),
      approvalMode: Utils.$('#approvalMode')?.value || 'auto',
      enableSpamFilter: Utils.$('#enableSpamFilter')?.checked || false,
      requireLogin: Utils.$('#requireLogin')?.checked || false,
      enableCaptcha: Utils.$('#enableCaptcha')?.checked || false,
      enableRateLimit: Utils.$('#enableRateLimit')?.checked || false,
      maxCommentLength: parseInt(Utils.$('#maxCommentLength')?.value || '2000'),
      commentInterval: parseInt(Utils.$('#commentInterval')?.value || '30'),
      blockedWords: Utils.$('#blockedWords')?.value || ''
    };

    // 알림 설정
    this.settings.notifications = {
      emailNewComment: Utils.$('#emailNewComment')?.checked || false,
      emailSpamDetected: Utils.$('#emailSpamDetected')?.checked || false,
      emailSystemUpdate: Utils.$('#emailSystemUpdate')?.checked || false,
      emailWeeklyReport: Utils.$('#emailWeeklyReport')?.checked || false,
      pushNewComment: Utils.$('#pushNewComment')?.checked || false,
      pushSpamAlert: Utils.$('#pushSpamAlert')?.checked || false,
      emailBatchInterval: Utils.$('#emailBatchInterval')?.value || 'immediate',
      maxNotifications: parseInt(Utils.$('#maxNotifications')?.value || '100')
    };

    // 고급 설정
    this.settings.advanced = {
      backupInterval: Utils.$('#backupInterval')?.value || 'daily',
      backupRetention: parseInt(Utils.$('#backupRetention')?.value || '30'),
      autoBackup: Utils.$('#autoBackup')?.checked || false,
      enableDebugMode: Utils.$('#enableDebugMode')?.checked || false,
      enableApiLogging: Utils.$('#enableApiLogging')?.checked || false,
      enablePerformanceMonitoring: Utils.$('#enablePerformanceMonitoring')?.checked || false,
      enableSidebarAutoClose: Utils.$('#enableSidebarAutoClose')?.checked !== false, // 기본값: true
      logRetention: parseInt(Utils.$('#logRetention')?.value || '90')
    };
  }

  resetToDefaults() {
    if (!confirm('모든 설정을 기본값으로 복원하시겠습니까?')) {
      return;
    }

    // 기본값으로 설정 초기화
    this.loadSettings();
    Utils.showNotification('설정이 기본값으로 복원되었습니다.', 'info');
  }

  resetAllSettings() {
    if (!confirm('정말로 모든 설정을 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    this.settings = {};
    this.loadSettings();
    Utils.showNotification('모든 설정이 초기화되었습니다.', 'warning');
  }

  clearAllData() {
    if (!confirm('정말로 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    const secondConfirm = prompt('삭제를 확인하려면 "DELETE"를 입력하세요:');
    if (secondConfirm !== 'DELETE') {
      Utils.showNotification('삭제가 취소되었습니다.', 'info');
      return;
    }

    Utils.showNotification('데이터 삭제는 실제 환경에서만 가능합니다.', 'warning');
  }

  toggleSidebarAutoClose(enabled) {
    try {
      // 라우터가 존재하는지 확인
      if (window.router && typeof window.router.toggleAutoCloseSidebar === 'function') {
        // 라우터의 설정 업데이트
        window.router.toggleAutoCloseSidebar(enabled);
        
        // 사용자 피드백 제공
        const message = enabled ? 
          '모바일 사이드바 자동 닫기가 활성화되었습니다.' : 
          '모바일 사이드바 자동 닫기가 비활성화되었습니다.';
        
        Utils.showToast(message, enabled ? 'success' : 'info');
        
        // 설정 dirty 상태 업데이트
        this.isDirty = true;
        
        console.log(`사이드바 자동 닫기 설정 변경: ${enabled}`);
      } else {
        console.warn('라우터 인스턴스를 찾을 수 없습니다.');
        Utils.showToast('설정을 적용할 수 없습니다. 페이지를 새로고침해주세요.', 'warning');
      }
    } catch (error) {
      console.error('사이드바 설정 변경 실패:', error);
      Utils.showToast('설정 변경 중 오류가 발생했습니다.', 'error');
    }
  }

  exportSettings() {
    try {
      this.collectFormData();
      
      const exportData = {
        version: '1.0',
        exported: new Date().toISOString(),
        settings: this.settings
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `kommentio_settings_${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      Utils.showNotification('설정이 JSON 파일로 내보내졌습니다.', 'success');
    } catch (error) {
      console.error('설정 내보내기 실패:', error);
      Utils.showNotification('설정 내보내기에 실패했습니다.', 'error');
    }
  }
}

// 전역으로 사용할 수 있도록 export
window.SettingsPage = SettingsPage;