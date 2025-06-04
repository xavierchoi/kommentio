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
    const header = Utils.createElement('div');
    header.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      border-radius: 16px !important;
      padding: 32px !important;
      margin-bottom: 32px !important;
      color: white !important;
      position: relative !important;
      overflow: hidden !important;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
    `;
    
    header.innerHTML = `
      <div style="position: absolute; top: -50%; right: -10%; width: 200px; height: 200px; background: rgba(255,255,255,0.1); border-radius: 50%; z-index: 1;"></div>
      <div style="position: absolute; bottom: -30%; left: -5%; width: 150px; height: 150px; background: rgba(255,255,255,0.05); border-radius: 50%; z-index: 1;"></div>
      
      <div style="position: relative; z-index: 2; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 24px;">
        <div style="flex: 1; min-width: 300px;">
          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
            <div style="width: 64px; height: 64px; background: rgba(255,255,255,0.2); border-radius: 16px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
              <i class="fas fa-cog" style="font-size: 28px; color: white;"></i>
            </div>
            <div>
              <h1 style="font-size: 36px; font-weight: 800; margin: 0; color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">시스템 설정</h1>
              <p style="font-size: 18px; opacity: 0.9; margin: 8px 0 0 0; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">Kommentio 댓글 시스템의 전체적인 설정을 관리하세요</p>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-top: 24px;">
            <div style="background: rgba(255,255,255,0.15); padding: 16px; border-radius: 12px; backdrop-filter: blur(10px);">
              <div style="display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-shield-alt" style="font-size: 24px; color: #ffd700;"></i>
                <div>
                  <div style="font-size: 24px; font-weight: 700;">${this.getSecurityLevel()}</div>
                  <div style="font-size: 14px; opacity: 0.8;">보안 수준</div>
                </div>
              </div>
            </div>
            <div style="background: rgba(255,255,255,0.15); padding: 16px; border-radius: 12px; backdrop-filter: blur(10px);">
              <div style="display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-clock" style="font-size: 24px; color: #98fb98;"></i>
                <div>
                  <div style="font-size: 24px; font-weight: 700;">99.9%</div>
                  <div style="font-size: 14px; opacity: 0.8;">시스템 가동률</div>
                </div>
              </div>
            </div>
            <div style="background: rgba(255,255,255,0.15); padding: 16px; border-radius: 12px; backdrop-filter: blur(10px);">
              <div style="display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-sync-alt" style="font-size: 24px; color: #dda0dd;"></i>
                <div>
                  <div style="font-size: 24px; font-weight: 700;">자동</div>
                  <div style="font-size: 14px; opacity: 0.8;">백업 상태</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <button style="background: rgba(255,255,255,0.2); color: white; border: 2px solid rgba(255,255,255,0.3); padding: 12px 24px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; backdrop-filter: blur(10px); display: flex; align-items: center; gap: 8px; min-height: 44px;" onclick="settingsPage.exportSettings()" onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
            <i class="fas fa-download"></i>
            <span>설정 내보내기</span>
          </button>
          <button style="background: rgba(255,255,255,0.9); color: #667eea; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 8px; min-height: 44px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" onclick="settingsPage.saveAllSettings()" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 8px rgba(0,0,0,0.15)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px rgba(0,0,0,0.1)'">
            <i class="fas fa-save"></i>
            <span>모든 설정 저장</span>
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
    const container = Utils.createElement('div');
    container.style.cssText = `
      display: grid !important;
      gap: 32px !important;
    `;

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
    const section = Utils.createElement('div');
    section.style.cssText = `
      background: white !important;
      border-radius: 16px !important;
      padding: 32px !important;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05) !important;
      border: 1px solid #e5e7eb !important;
    `;

    section.innerHTML = `
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 24px; font-weight: 700; color: #1f2937; margin: 0 0 8px 0; display: flex; align-items: center; gap: 12px;">
          <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-sliders-h" style="color: white; font-size: 20px;"></i>
          </div>
          일반 설정
        </h2>
        <p style="color: #6b7280; margin: 0;">사이트의 기본적인 설정들을 관리합니다</p>
      </div>
      
      <div style="display: grid; gap: 24px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
          <div>
            <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">사이트 이름</label>
            <input type="text" id="siteName" value="Kommentio 댓글 시스템" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 16px;">
          </div>
          <div>
            <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">관리자 이메일</label>
            <input type="email" id="adminEmail" value="admin@kommentio.com" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 16px;">
          </div>
        </div>
        
        <div>
          <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">사이트 설명</label>
          <textarea id="siteDescription" rows="3" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 16px; resize: vertical;">Kommentio는 오픈소스 댓글 시스템입니다.</textarea>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
          <div>
            <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">기본 언어</label>
            <select id="defaultLanguage" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 16px;">
              <option value="ko">한국어</option>
              <option value="en">English</option>
              <option value="ja">日本語</option>
              <option value="zh">中文</option>
            </select>
          </div>
          <div>
            <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">시간대</label>
            <select id="timezone" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 16px;">
              <option value="Asia/Seoul">Asia/Seoul (KST)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
            </select>
          </div>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 24px;">
          <h3 style="font-size: 18px; font-weight: 600; color: #374151; margin: 0 0 16px 0;">표시 옵션</h3>
          <div style="display: grid; gap: 12px;">
            <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
              <input type="checkbox" id="showCommentCount" checked style="width: 18px; height: 18px;">
              <span style="font-weight: 500; color: #374151;">댓글 수 표시</span>
            </label>
            <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
              <input type="checkbox" id="showTimestamp" checked style="width: 18px; height: 18px;">
              <span style="font-weight: 500; color: #374151;">작성 시간 표시</span>
            </label>
            <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
              <input type="checkbox" id="allowAnonymous" checked style="width: 18px; height: 18px;">
              <span style="font-weight: 500; color: #374151;">익명 댓글 허용</span>
            </label>
          </div>
        </div>
      </div>
    `;

    return section;
  }

  createSecuritySettings() {
    const section = Utils.createElement('div');
    section.style.cssText = `
      background: white !important;
      border-radius: 16px !important;
      padding: 32px !important;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05) !important;
      border: 1px solid #e5e7eb !important;
    `;

    section.innerHTML = `
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 24px; font-weight: 700; color: #1f2937; margin: 0 0 8px 0; display: flex; align-items: center; gap: 12px;">
          <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #ef4444, #dc2626); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-shield-alt" style="color: white; font-size: 20px;"></i>
          </div>
          보안 설정
        </h2>
        <p style="color: #6b7280; margin: 0;">댓글 시스템의 보안 및 스팸 방지 설정을 관리합니다</p>
      </div>
      
      <div style="display: grid; gap: 24px;">
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 20px;">
          <h3 style="font-size: 18px; font-weight: 600; color: #991b1b; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-exclamation-triangle"></i>
            스팸 방지 설정
          </h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div>
              <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">스팸 임계값</label>
              <input type="range" id="spamThreshold" min="0" max="1" step="0.1" value="0.7" style="width: 100%;">
              <div style="display: flex; justify-content: space-between; color: #6b7280; font-size: 12px;">
                <span>낮음 (0)</span>
                <span>높음 (1)</span>
              </div>
            </div>
            <div>
              <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">댓글 승인 방식</label>
              <select id="approvalMode" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px;">
                <option value="auto">자동 승인</option>
                <option value="manual">수동 승인</option>
                <option value="first-time">첫 댓글만 승인</option>
              </select>
            </div>
          </div>
          <div style="margin-top: 16px;">
            <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
              <input type="checkbox" id="enableSpamFilter" checked style="width: 18px; height: 18px;">
              <span style="font-weight: 500; color: #374151;">AI 스팸 필터 활성화</span>
            </label>
          </div>
        </div>
        
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px;">
          <h3 style="font-size: 18px; font-weight: 600; color: #1e40af; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-user-shield"></i>
            접근 제어
          </h3>
          <div style="display: grid; gap: 12px;">
            <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
              <input type="checkbox" id="requireLogin" style="width: 18px; height: 18px;">
              <span style="font-weight: 500; color: #374151;">댓글 작성 시 로그인 필수</span>
            </label>
            <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
              <input type="checkbox" id="enableCaptcha" style="width: 18px; height: 18px;">
              <span style="font-weight: 500; color: #374151;">CAPTCHA 인증 활성화</span>
            </label>
            <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
              <input type="checkbox" id="enableRateLimit" checked style="width: 18px; height: 18px;">
              <span style="font-weight: 500; color: #374151;">댓글 작성 속도 제한</span>
            </label>
          </div>
          
          <div style="margin-top: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div>
              <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">최대 댓글 길이</label>
              <input type="number" id="maxCommentLength" value="2000" min="100" max="10000" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px;">
            </div>
            <div>
              <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">댓글 작성 간격 (초)</label>
              <input type="number" id="commentInterval" value="30" min="5" max="300" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px;">
            </div>
          </div>
        </div>
        
        <div>
          <h3 style="font-size: 18px; font-weight: 600; color: #374151; margin: 0 0 16px 0;">차단 키워드</h3>
          <textarea id="blockedWords" rows="4" placeholder="쉼표로 구분하여 차단할 키워드를 입력하세요" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 16px; resize: vertical;"></textarea>
        </div>
      </div>
    `;

    return section;
  }

  createNotificationSettings() {
    const section = Utils.createElement('div');
    section.style.cssText = `
      background: white !important;
      border-radius: 16px !important;
      padding: 32px !important;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05) !important;
      border: 1px solid #e5e7eb !important;
    `;

    section.innerHTML = `
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 24px; font-weight: 700; color: #1f2937; margin: 0 0 8px 0; display: flex; align-items: center; gap: 12px;">
          <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #8b5cf6, #7c3aed); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-bell" style="color: white; font-size: 20px;"></i>
          </div>
          알림 설정
        </h2>
        <p style="color: #6b7280; margin: 0;">이메일 및 시스템 알림 설정을 관리합니다</p>
      </div>
      
      <div style="display: grid; gap: 24px;">
        <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 20px;">
          <h3 style="font-size: 18px; font-weight: 600; color: #0369a1; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-envelope"></i>
            이메일 알림
          </h3>
          <div style="display: grid; gap: 12px;">
            <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
              <input type="checkbox" id="emailNewComment" checked style="width: 18px; height: 18px;">
              <span style="font-weight: 500; color: #374151;">새 댓글 알림</span>
            </label>
            <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
              <input type="checkbox" id="emailSpamDetected" checked style="width: 18px; height: 18px;">
              <span style="font-weight: 500; color: #374151;">스팸 탐지 알림</span>
            </label>
            <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
              <input type="checkbox" id="emailSystemUpdate" style="width: 18px; height: 18px;">
              <span style="font-weight: 500; color: #374151;">시스템 업데이트 알림</span>
            </label>
            <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
              <input type="checkbox" id="emailWeeklyReport" style="width: 18px; height: 18px;">
              <span style="font-weight: 500; color: #374151;">주간 리포트</span>
            </label>
          </div>
        </div>
        
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px;">
          <h3 style="font-size: 18px; font-weight: 600; color: #15803d; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-mobile-alt"></i>
            푸시 알림
          </h3>
          <div style="display: grid; gap: 12px;">
            <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
              <input type="checkbox" id="pushNewComment" style="width: 18px; height: 18px;">
              <span style="font-weight: 500; color: #374151;">브라우저 푸시 알림</span>
            </label>
            <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
              <input type="checkbox" id="pushSpamAlert" style="width: 18px; height: 18px;">
              <span style="font-weight: 500; color: #374151;">스팸 경고 알림</span>
            </label>
          </div>
        </div>
        
        <div>
          <h3 style="font-size: 18px; font-weight: 600; color: #374151; margin: 0 0 16px 0;">알림 빈도</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div>
              <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">이메일 묶음 발송 간격</label>
              <select id="emailBatchInterval" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px;">
                <option value="immediate">즉시</option>
                <option value="hourly">매시간</option>
                <option value="daily">매일</option>
                <option value="weekly">매주</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">최대 알림 개수</label>
              <input type="number" id="maxNotifications" value="100" min="10" max="1000" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px;">
            </div>
          </div>
        </div>
      </div>
    `;

    return section;
  }

  createAdvancedSettings() {
    const section = Utils.createElement('div');
    section.style.cssText = `
      background: white !important;
      border-radius: 16px !important;
      padding: 32px !important;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05) !important;
      border: 1px solid #e5e7eb !important;
    `;

    section.innerHTML = `
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 24px; font-weight: 700; color: #1f2937; margin: 0 0 8px 0; display: flex; align-items: center; gap: 12px;">
          <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-cogs" style="color: white; font-size: 20px;"></i>
          </div>
          고급 설정
        </h2>
        <p style="color: #6b7280; margin: 0;">시스템의 고급 기능과 개발자 옵션을 설정합니다</p>
      </div>
      
      <div style="display: grid; gap: 24px;">
        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 20px;">
          <h3 style="font-size: 18px; font-weight: 600; color: #92400e; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-database"></i>
            데이터베이스 설정
          </h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div>
              <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">백업 간격</label>
              <select id="backupInterval" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px;">
                <option value="daily">매일</option>
                <option value="weekly">매주</option>
                <option value="monthly">매월</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">백업 보관 기간 (일)</label>
              <input type="number" id="backupRetention" value="30" min="7" max="365" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px;">
            </div>
          </div>
          <div style="margin-top: 16px;">
            <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
              <input type="checkbox" id="autoBackup" checked style="width: 18px; height: 18px;">
              <span style="font-weight: 500; color: #374151;">자동 백업 활성화</span>
            </label>
          </div>
        </div>
        
        <div style="background: #f3e8ff; border: 1px solid #ddd6fe; border-radius: 12px; padding: 20px;">
          <h3 style="font-size: 18px; font-weight: 600; color: #7c2d12; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-code"></i>
            개발자 옵션
          </h3>
          <div style="display: grid; gap: 12px;">
            <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
              <input type="checkbox" id="enableDebugMode" style="width: 18px; height: 18px;">
              <span style="font-weight: 500; color: #374151;">디버그 모드 활성화</span>
            </label>
            <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
              <input type="checkbox" id="enableApiLogging" style="width: 18px; height: 18px;">
              <span style="font-weight: 500; color: #374151;">API 로깅 활성화</span>
            </label>
            <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
              <input type="checkbox" id="enablePerformanceMonitoring" checked style="width: 18px; height: 18px;">
              <span style="font-weight: 500; color: #374151;">성능 모니터링 활성화</span>
            </label>
          </div>
          
          <div style="margin-top: 16px;">
            <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">로그 보관 기간 (일)</label>
            <input type="number" id="logRetention" value="90" min="7" max="365" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px;">
          </div>
        </div>
        
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 20px;">
          <h3 style="font-size: 18px; font-weight: 600; color: #991b1b; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-exclamation-triangle"></i>
            위험 구역
          </h3>
          <p style="color: #6b7280; margin-bottom: 16px;">아래 작업들은 시스템에 영구적인 영향을 줄 수 있습니다.</p>
          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <button style="background: #ef4444; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; min-height: 44px;" onclick="settingsPage.resetAllSettings()">
              모든 설정 초기화
            </button>
            <button style="background: #dc2626; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; min-height: 44px;" onclick="settingsPage.clearAllData()">
              모든 데이터 삭제
            </button>
          </div>
        </div>
      </div>
      
      <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div style="color: #6b7280; font-size: 14px;">
          마지막 저장: <span id="lastSaved">방금 전</span>
        </div>
        <div style="display: flex; gap: 12px;">
          <button style="background: #6b7280; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; min-height: 44px;" onclick="settingsPage.resetToDefaults()">
            기본값으로 복원
          </button>
          <button style="background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; min-height: 44px;" onclick="settingsPage.saveAllSettings()">
            변경사항 저장
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