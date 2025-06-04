// Kommentio Admin Dashboard - Themes Page

class ThemesPage {
  constructor() {
    this.themes = [];
    this.currentTheme = 'default';
    this.customCss = '';
  }

  async render() {
    console.log('Themes 페이지 렌더링 시작...');
    const container = Utils.$('#page-themes');
    if (!container) {
      console.error('Themes 컨테이너를 찾을 수 없습니다.');
      return;
    }

    container.innerHTML = '';

    // 페이지 헤더
    const header = this.createPageHeader();
    container.appendChild(header);

    // 테마 선택 섹션
    const themeSelector = this.createThemeSelector();
    container.appendChild(themeSelector);

    // 테마 커스터마이저
    const customizer = this.createThemeCustomizer();
    container.appendChild(customizer);

    // 커스텀 CSS 에디터
    const cssEditor = this.createCssEditor();
    container.appendChild(cssEditor);

    // 초기 데이터 로드
    await this.loadThemesData();

    console.log('Themes 페이지 렌더링 완료');
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
              <i class="fas fa-palette" style="font-size: 28px; color: white;"></i>
            </div>
            <div>
              <h1 style="font-size: 36px; font-weight: 800; margin: 0; color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">테마 관리</h1>
              <p style="font-size: 18px; opacity: 0.9; margin: 8px 0 0 0; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">댓글 위젯의 디자인과 스타일을 커스터마이즈하세요</p>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-top: 24px;">
            <div style="background: rgba(255,255,255,0.15); padding: 16px; border-radius: 12px; backdrop-filter: blur(10px);">
              <div style="display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-swatchbook" style="font-size: 24px; color: #ffd700;"></i>
                <div>
                  <div style="font-size: 24px; font-weight: 700;">${this.themes.length || 5}</div>
                  <div style="font-size: 14px; opacity: 0.8;">사용 가능한 테마</div>
                </div>
              </div>
            </div>
            <div style="background: rgba(255,255,255,0.15); padding: 16px; border-radius: 12px; backdrop-filter: blur(10px);">
              <div style="display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-brush" style="font-size: 24px; color: #98fb98;"></i>
                <div>
                  <div style="font-size: 24px; font-weight: 700;">${this.currentTheme ? 1 : 0}</div>
                  <div style="font-size: 14px; opacity: 0.8;">활성 테마</div>
                </div>
              </div>
            </div>
            <div style="background: rgba(255,255,255,0.15); padding: 16px; border-radius: 12px; backdrop-filter: blur(10px);">
              <div style="display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-code" style="font-size: 24px; color: #dda0dd;"></i>
                <div>
                  <div style="font-size: 24px; font-weight: 700;">${this.customCss ? Math.round(this.customCss.length / 100) : 0}</div>
                  <div style="font-size: 14px; opacity: 0.8;">커스텀 CSS (100자 단위)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <button style="background: rgba(255,255,255,0.2); color: white; border: 2px solid rgba(255,255,255,0.3); padding: 12px 24px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; backdrop-filter: blur(10px); display: flex; align-items: center; gap: 8px; min-height: 44px;" onclick="themesPage.exportThemeData()" onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
            <i class="fas fa-download"></i>
            <span>테마 내보내기</span>
          </button>
          <button style="background: rgba(255,255,255,0.9); color: #667eea; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 8px; min-height: 44px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" onclick="themesPage.openThemeImportModal()" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 8px rgba(0,0,0,0.15)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px rgba(0,0,0,0.1)'">
            <i class="fas fa-upload"></i>
            <span>테마 가져오기</span>
          </button>
        </div>
      </div>
    `;
    
    return header;
  }

  createThemeSelector() {
    const section = Utils.createElement('div');
    section.style.cssText = `
      background: white !important;
      border-radius: 16px !important;
      padding: 32px !important;
      margin-bottom: 32px !important;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05) !important;
      border: 1px solid #e5e7eb !important;
    `;

    section.innerHTML = `
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 24px; font-weight: 700; color: #1f2937; margin: 0 0 8px 0;">기본 테마 선택</h2>
        <p style="color: #6b7280; margin: 0;">미리 제작된 테마 중에서 선택하거나 커스터마이저로 새로운 테마를 만들어보세요</p>
      </div>
      
      <div id="themes-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px;">
        <!-- 테마 카드들이 여기에 렌더링됩니다 -->
      </div>
    `;

    return section;
  }

  createThemeCustomizer() {
    const section = Utils.createElement('div');
    section.style.cssText = `
      background: white !important;
      border-radius: 16px !important;
      padding: 32px !important;
      margin-bottom: 32px !important;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05) !important;
      border: 1px solid #e5e7eb !important;
    `;

    section.innerHTML = `
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 24px; font-weight: 700; color: #1f2937; margin: 0 0 8px 0;">테마 커스터마이저</h2>
        <p style="color: #6b7280; margin: 0;">색상, 폰트, 레이아웃 등을 자유롭게 조정하여 나만의 테마를 만들어보세요</p>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px;">
        <div>
          <h3 style="font-size: 18px; font-weight: 600; color: #374151; margin: 0 0 16px 0;">색상 설정</h3>
          <div style="display: grid; gap: 16px;">
            <div>
              <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 8px;">기본 색상</label>
              <div style="display: flex; gap: 8px; align-items: center;">
                <input type="color" id="primaryColor" value="#3b82f6" style="width: 48px; height: 48px; border: none; border-radius: 8px; cursor: pointer;">
                <span style="color: #6b7280;">#3b82f6</span>
              </div>
            </div>
            <div>
              <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 8px;">보조 색상</label>
              <div style="display: flex; gap: 8px; align-items: center;">
                <input type="color" id="secondaryColor" value="#6b7280" style="width: 48px; height: 48px; border: none; border-radius: 8px; cursor: pointer;">
                <span style="color: #6b7280;">#6b7280</span>
              </div>
            </div>
            <div>
              <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 8px;">배경 색상</label>
              <div style="display: flex; gap: 8px; align-items: center;">
                <input type="color" id="backgroundColor" value="#ffffff" style="width: 48px; height: 48px; border: none; border-radius: 8px; cursor: pointer;">
                <span style="color: #6b7280;">#ffffff</span>
              </div>
            </div>
          </div>
          
          <h3 style="font-size: 18px; font-weight: 600; color: #374151; margin: 24px 0 16px 0;">폰트 설정</h3>
          <div style="display: grid; gap: 16px;">
            <div>
              <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 8px;">폰트 패밀리</label>
              <select id="fontFamily" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px;">
                <option value="system">시스템 기본</option>
                <option value="inter">Inter</option>
                <option value="roboto">Roboto</option>
                <option value="noto-sans">Noto Sans KR</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 8px;">폰트 크기</label>
              <input type="range" id="fontSize" min="12" max="20" value="14" style="width: 100%;">
              <div style="display: flex; justify-content: space-between; color: #6b7280; font-size: 12px;">
                <span>12px</span>
                <span>20px</span>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 style="font-size: 18px; font-weight: 600; color: #374151; margin: 0 0 16px 0;">레이아웃 설정</h3>
          <div style="display: grid; gap: 16px;">
            <div>
              <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 8px;">모서리 둥글기</label>
              <input type="range" id="borderRadius" min="0" max="16" value="8" style="width: 100%;">
              <div style="display: flex; justify-content: space-between; color: #6b7280; font-size: 12px;">
                <span>0px</span>
                <span>16px</span>
              </div>
            </div>
            <div>
              <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 8px;">간격</label>
              <input type="range" id="spacing" min="8" max="32" value="16" style="width: 100%;">
              <div style="display: flex; justify-content: space-between; color: #6b7280; font-size: 12px;">
                <span>8px</span>
                <span>32px</span>
              </div>
            </div>
            <div>
              <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 8px;">그림자</label>
              <select id="shadow" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px;">
                <option value="none">없음</option>
                <option value="sm">작음</option>
                <option value="md">보통</option>
                <option value="lg">큼</option>
              </select>
            </div>
          </div>
          
          <div style="margin-top: 24px;">
            <button style="width: 100%; background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; min-height: 44px;" onclick="themesPage.applyCustomTheme()">
              커스텀 테마 적용
            </button>
          </div>
        </div>
      </div>
      
      <div style="margin-top: 32px; padding: 24px; background: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb;">
        <h3 style="font-size: 18px; font-weight: 600; color: #374151; margin: 0 0 16px 0;">미리보기</h3>
        <div id="theme-preview" style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
          <div style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">댓글 예시</div>
          <div style="background: #f9fafb; padding: 12px; border-radius: 8px; margin-bottom: 8px;">
            <div style="font-weight: 500; margin-bottom: 4px;">사용자 이름</div>
            <div style="color: #6b7280; font-size: 14px;">이것은 댓글 미리보기입니다. 현재 설정된 테마가 어떻게 보이는지 확인할 수 있습니다.</div>
          </div>
          <button style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 14px;">댓글 작성</button>
        </div>
      </div>
    `;

    return section;
  }

  createCssEditor() {
    const section = Utils.createElement('div');
    section.style.cssText = `
      background: white !important;
      border-radius: 16px !important;
      padding: 32px !important;
      margin-bottom: 32px !important;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05) !important;
      border: 1px solid #e5e7eb !important;
    `;

    section.innerHTML = `
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 24px; font-weight: 700; color: #1f2937; margin: 0 0 8px 0;">커스텀 CSS</h2>
        <p style="color: #6b7280; margin: 0;">고급 사용자를 위한 직접 CSS 편집 기능입니다</p>
      </div>
      
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background: #f9fafb; padding: 12px 16px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: between; align-items: center;">
          <span style="font-weight: 500; color: #374151;">CSS 에디터</span>
          <div style="display: flex; gap: 8px;">
            <button style="padding: 6px 12px; background: #3b82f6; color: white; border: none; border-radius: 6px; font-size: 12px; cursor: pointer;" onclick="themesPage.formatCss()">포맷팅</button>
            <button style="padding: 6px 12px; background: #10b981; color: white; border: none; border-radius: 6px; font-size: 12px; cursor: pointer;" onclick="themesPage.validateCss()">검증</button>
          </div>
        </div>
        <textarea id="customCssEditor" placeholder="/* 여기에 커스텀 CSS를 입력하세요 */
.kommentio-widget {
  font-family: 'Noto Sans KR', sans-serif;
}

.kommentio-comment {
  border-radius: 8px;
  padding: 16px;
}" style="width: 100%; height: 300px; border: none; padding: 16px; font-family: 'Courier New', monospace; font-size: 14px; resize: vertical; background: #1f2937; color: #e5e7eb;"></textarea>
      </div>
      
      <div style="margin-top: 16px; display: flex; gap: 12px;">
        <button style="background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; min-height: 44px;" onclick="themesPage.applyCss()">
          CSS 적용
        </button>
        <button style="background: #6b7280; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; min-height: 44px;" onclick="themesPage.resetCss()">
          초기화
        </button>
      </div>
    `;

    return section;
  }

  async loadThemesData() {
    try {
      // 기본 테마 데이터
      this.themes = [
        {
          id: 'default',
          name: '기본 테마',
          description: '깔끔하고 모던한 기본 디자인',
          preview: '/assets/theme-previews/default.png',
          colors: {
            primary: '#3b82f6',
            secondary: '#6b7280',
            background: '#ffffff'
          },
          active: true
        },
        {
          id: 'dark',
          name: '다크 테마',
          description: '어두운 배경의 우아한 디자인',
          preview: '/assets/theme-previews/dark.png',
          colors: {
            primary: '#60a5fa',
            secondary: '#9ca3af',
            background: '#1f2937'
          },
          active: false
        },
        {
          id: 'minimal',
          name: '미니멀',
          description: '심플하고 깔끔한 미니멀 디자인',
          preview: '/assets/theme-previews/minimal.png',
          colors: {
            primary: '#000000',
            secondary: '#6b7280',
            background: '#ffffff'
          },
          active: false
        },
        {
          id: 'colorful',
          name: '컬러풀',
          description: '활기찬 색상의 역동적인 디자인',
          preview: '/assets/theme-previews/colorful.png',
          colors: {
            primary: '#f59e0b',
            secondary: '#ef4444',
            background: '#fef3c7'
          },
          active: false
        },
        {
          id: 'professional',
          name: '프로페셔널',
          description: '비즈니스 환경에 적합한 세련된 디자인',
          preview: '/assets/theme-previews/professional.png',
          colors: {
            primary: '#1e40af',
            secondary: '#374151',
            background: '#f8fafc'
          },
          active: false
        }
      ];

      this.renderThemes();
    } catch (error) {
      console.error('테마 데이터 로딩 실패:', error);
      this.themes = [];
    }
  }

  renderThemes() {
    const grid = Utils.$('#themes-grid');
    if (!grid) return;

    grid.innerHTML = '';

    this.themes.forEach(theme => {
      const themeCard = this.createThemeCard(theme);
      grid.appendChild(themeCard);
    });
  }

  createThemeCard(theme) {
    const card = Utils.createElement('div');
    card.style.cssText = `
      border: 2px solid ${theme.active ? '#3b82f6' : '#e5e7eb'} !important;
      border-radius: 12px !important;
      padding: 20px !important;
      background: white !important;
      cursor: pointer !important;
      transition: all 0.3s ease !important;
      position: relative !important;
    `;

    card.innerHTML = `
      ${theme.active ? '<div style="position: absolute; top: 12px; right: 12px; background: #3b82f6; color: white; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600;">활성</div>' : ''}
      
      <div style="height: 120px; background: ${theme.colors.background}; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 16px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden;">
        <div style="width: 80%; height: 80%; background: ${theme.colors.primary}; opacity: 0.1; border-radius: 6px; position: absolute;"></div>
        <div style="position: relative; text-align: center;">
          <div style="width: 60px; height: 40px; background: ${theme.colors.primary}; border-radius: 4px; margin: 0 auto 8px;"></div>
          <div style="width: 80px; height: 8px; background: ${theme.colors.secondary}; border-radius: 2px; margin: 0 auto 4px;"></div>
          <div style="width: 60px; height: 6px; background: ${theme.colors.secondary}; opacity: 0.6; border-radius: 2px; margin: 0 auto;"></div>
        </div>
      </div>
      
      <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0 0 8px 0;">${theme.name}</h3>
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 16px 0;">${theme.description}</p>
      
      <div style="display: flex; gap: 8px; margin-bottom: 16px;">
        <div style="width: 20px; height: 20px; background: ${theme.colors.primary}; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></div>
        <div style="width: 20px; height: 20px; background: ${theme.colors.secondary}; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></div>
        <div style="width: 20px; height: 20px; background: ${theme.colors.background}; border-radius: 50%; border: 2px solid #e5e7eb; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></div>
      </div>
      
      <button style="width: 100%; background: ${theme.active ? '#6b7280' : '#3b82f6'}; color: white; border: none; padding: 10px 16px; border-radius: 8px; font-weight: 500; cursor: pointer; min-height: 44px;" onclick="themesPage.selectTheme('${theme.id}')" ${theme.active ? 'disabled' : ''}>
        ${theme.active ? '현재 테마' : '테마 적용'}
      </button>
    `;

    // 호버 효과
    card.addEventListener('mouseenter', () => {
      if (!theme.active) {
        card.style.borderColor = '#3b82f6';
        card.style.transform = 'translateY(-2px)';
        card.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
      }
    });

    card.addEventListener('mouseleave', () => {
      if (!theme.active) {
        card.style.borderColor = '#e5e7eb';
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = 'none';
      }
    });

    return card;
  }

  selectTheme(themeId) {
    // 모든 테마 비활성화
    this.themes.forEach(theme => theme.active = false);
    
    // 선택된 테마 활성화
    const selectedTheme = this.themes.find(theme => theme.id === themeId);
    if (selectedTheme) {
      selectedTheme.active = true;
      this.currentTheme = themeId;
      this.renderThemes();
      Utils.showNotification(`${selectedTheme.name} 테마가 적용되었습니다.`, 'success');
    }
  }

  applyCustomTheme() {
    const primaryColor = Utils.$('#primaryColor').value;
    const secondaryColor = Utils.$('#secondaryColor').value;
    const backgroundColor = Utils.$('#backgroundColor').value;
    const fontFamily = Utils.$('#fontFamily').value;
    const fontSize = Utils.$('#fontSize').value;
    const borderRadius = Utils.$('#borderRadius').value;
    const spacing = Utils.$('#spacing').value;
    const shadow = Utils.$('#shadow').value;

    // 커스텀 테마 CSS 생성
    const customCss = `
      .kommentio-widget {
        --primary-color: ${primaryColor};
        --secondary-color: ${secondaryColor};
        --background-color: ${backgroundColor};
        --font-family: ${this.getFontFamily(fontFamily)};
        --font-size: ${fontSize}px;
        --border-radius: ${borderRadius}px;
        --spacing: ${spacing}px;
        --shadow: ${this.getShadow(shadow)};
      }
    `;

    Utils.showNotification('커스텀 테마가 적용되었습니다.', 'success');
  }

  getFontFamily(family) {
    const families = {
      'system': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      'inter': '"Inter", sans-serif',
      'roboto': '"Roboto", sans-serif',
      'noto-sans': '"Noto Sans KR", sans-serif'
    };
    return families[family] || families.system;
  }

  getShadow(shadow) {
    const shadows = {
      'none': 'none',
      'sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
      'md': '0 4px 6px rgba(0, 0, 0, 0.1)',
      'lg': '0 10px 15px rgba(0, 0, 0, 0.1)'
    };
    return shadows[shadow] || shadows.none;
  }

  applyCss() {
    const css = Utils.$('#customCssEditor').value;
    this.customCss = css;
    Utils.showNotification('커스텀 CSS가 적용되었습니다.', 'success');
  }

  resetCss() {
    Utils.$('#customCssEditor').value = '';
    this.customCss = '';
    Utils.showNotification('CSS가 초기화되었습니다.', 'info');
  }

  formatCss() {
    const css = Utils.$('#customCssEditor').value;
    // 간단한 CSS 포맷팅
    const formatted = css
      .replace(/\{/g, ' {\n  ')
      .replace(/\}/g, '\n}\n')
      .replace(/;/g, ';\n  ')
      .replace(/,/g, ',\n');
    
    Utils.$('#customCssEditor').value = formatted;
    Utils.showNotification('CSS가 포맷팅되었습니다.', 'success');
  }

  validateCss() {
    const css = Utils.$('#customCssEditor').value;
    // 간단한 CSS 검증
    const hasOpenBrace = (css.match(/\{/g) || []).length;
    const hasCloseBrace = (css.match(/\}/g) || []).length;
    
    if (hasOpenBrace === hasCloseBrace) {
      Utils.showNotification('CSS 문법이 올바릅니다.', 'success');
    } else {
      Utils.showNotification('CSS 문법에 오류가 있습니다. 중괄호를 확인하세요.', 'warning');
    }
  }

  openThemeImportModal() {
    const modalContent = Utils.createElement('div');
    modalContent.innerHTML = `
      <div style="margin-bottom: 20px;">
        <label style="display: block; font-weight: 600; margin-bottom: 8px;">테마 파일 선택</label>
        <input type="file" id="themeFile" accept=".json,.css" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px;">
        <p style="color: #6b7280; font-size: 14px; margin-top: 8px;">JSON 또는 CSS 파일을 선택하세요</p>
      </div>
    `;

    const modal = Components.createModal('테마 가져오기', modalContent, [
      {
        text: '취소',
        class: 'btn-secondary',
        onclick: () => Components.closeModal(modal)
      },
      {
        text: '가져오기',
        class: 'btn-primary',
        onclick: () => this.importTheme(modal)
      }
    ]);

    Components.showModal(modal);
  }

  importTheme(modal) {
    const fileInput = Utils.$('#themeFile');
    const file = fileInput.files[0];
    
    if (!file) {
      Utils.showNotification('파일을 선택하세요.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        if (file.name.endsWith('.json')) {
          const themeData = JSON.parse(content);
          this.importJsonTheme(themeData);
        } else if (file.name.endsWith('.css')) {
          this.importCssTheme(content);
        }
        Components.closeModal(modal);
        Utils.showNotification('테마를 성공적으로 가져왔습니다.', 'success');
      } catch (error) {
        Utils.showNotification('테마 파일 형식이 올바르지 않습니다.', 'error');
      }
    };
    reader.readAsText(file);
  }

  importJsonTheme(themeData) {
    if (themeData.colors) {
      Utils.$('#primaryColor').value = themeData.colors.primary || '#3b82f6';
      Utils.$('#secondaryColor').value = themeData.colors.secondary || '#6b7280';
      Utils.$('#backgroundColor').value = themeData.colors.background || '#ffffff';
    }
  }

  importCssTheme(css) {
    Utils.$('#customCssEditor').value = css;
    this.customCss = css;
  }

  exportThemeData() {
    try {
      const themeData = {
        name: 'Custom Theme',
        colors: {
          primary: Utils.$('#primaryColor').value,
          secondary: Utils.$('#secondaryColor').value,
          background: Utils.$('#backgroundColor').value
        },
        font: {
          family: Utils.$('#fontFamily').value,
          size: Utils.$('#fontSize').value
        },
        layout: {
          borderRadius: Utils.$('#borderRadius').value,
          spacing: Utils.$('#spacing').value,
          shadow: Utils.$('#shadow').value
        },
        customCss: this.customCss,
        exportDate: new Date().toISOString()
      };

      const jsonString = JSON.stringify(themeData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `kommentio_theme_${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      Utils.showNotification('테마가 JSON 파일로 내보내졌습니다.', 'success');
    } catch (error) {
      console.error('테마 내보내기 실패:', error);
      Utils.showNotification('테마 내보내기에 실패했습니다.', 'error');
    }
  }
}

// 전역으로 사용할 수 있도록 export
window.ThemesPage = ThemesPage;