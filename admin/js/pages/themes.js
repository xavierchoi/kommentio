// Kommentio Admin Dashboard - Themes Page

class ThemesPage {
  constructor() {
    this.themes = [];
    this.currentTheme = 'default';
    this.customCss = '';
    this.themeStats = {
      totalThemes: 0,
      activeTheme: 1,
      customThemes: 0,
      cssLines: 0
    };
  }

  async render() {
    const container = Utils.$('#page-themes');
    container.innerHTML = '';

    // 페이지 헤더
    const header = this.createPageHeader();
    container.appendChild(header);

    // 로딩 표시
    Utils.showLoading(container);

    try {
      // 데이터 로드
      await this.loadThemesData();

      // 테마 통계 카드
      const statsSection = this.createStatsSection();
      container.appendChild(statsSection);

      // 메인 콘텐츠 - 반응형 레이아웃
      const mainContent = Utils.createElement('div', 'grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8');
      
      // 테마 갤러리
      const gallerySection = this.createThemeGallerySection();
      mainContent.appendChild(gallerySection);
      
      // 테마 커스터마이저
      const customizerSection = this.createCustomizerSection();
      mainContent.appendChild(customizerSection);
      
      container.appendChild(mainContent);

      // CSS 에디터 섹션
      const cssEditorSection = this.createCssEditorSection();
      container.appendChild(cssEditorSection);

    } catch (error) {
      console.error('테마 데이터 로딩 실패:', error);
      container.appendChild(this.createErrorState());
    } finally {
      Utils.hideLoading(container);
    }
  }

  createPageHeader() {
    const header = Utils.createElement('div');
    header.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      border-radius: 20px !important;
      padding: 40px !important;
      margin-bottom: 32px !important;
      color: white !important;
      position: relative !important;
      overflow: hidden !important;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
    `;

    // 배경 패턴
    const pattern = Utils.createElement('div');
    pattern.style.cssText = `
      position: absolute !important;
      top: -50% !important;
      right: -50% !important;
      width: 200% !important;
      height: 200% !important;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") !important;
      pointer-events: none !important;
    `;
    header.appendChild(pattern);

    const content = Utils.createElement('div');
    content.style.cssText = `position: relative !important; z-index: 1 !important;`;
    
    const titleSection = Utils.createElement('div');
    titleSection.style.cssText = `
      display: flex !important;
      align-items: center !important;
      gap: 20px !important;
      margin-bottom: 32px !important;
    `;

    const icon = Utils.createElement('div');
    icon.style.cssText = `
      width: 80px !important;
      height: 80px !important;
      background: rgba(255, 255, 255, 0.2) !important;
      border-radius: 20px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: 36px !important;
      color: white !important;
      backdrop-filter: blur(10px) !important;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
    `;
    icon.innerHTML = '<i class="fas fa-palette"></i>';

    const titleContent = Utils.createElement('div');
    titleContent.style.cssText = 'flex: 1 !important;';

    const title = Utils.createElement('h1');
    title.style.cssText = `
      font-size: 48px !important;
      font-weight: 900 !important;
      margin: 0 0 8px 0 !important;
      color: white !important;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
      letter-spacing: -0.025em !important;
    `;
    title.textContent = '테마 & 디자인 관리';

    const subtitle = Utils.createElement('p');
    subtitle.style.cssText = `
      font-size: 20px !important;
      margin: 0 !important;
      opacity: 0.9 !important;
      color: rgba(255, 255, 255, 0.9) !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
    `;
    subtitle.textContent = '댓글 위젯의 시각적 디자인을 완전히 커스터마이즈하고 브랜드에 맞게 최적화하세요';

    const statusBadge = Utils.createElement('div');
    statusBadge.style.cssText = `
      background: rgba(34, 197, 94, 0.2) !important;
      color: #dcfce7 !important;
      padding: 8px 16px !important;
      border-radius: 24px !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      text-transform: uppercase !important;
      letter-spacing: 0.05em !important;
      border: 1px solid rgba(34, 197, 94, 0.3) !important;
      margin-top: 16px !important;
      display: inline-flex !important;
      align-items: center !important;
      gap: 8px !important;
    `;
    statusBadge.innerHTML = '<span style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%; animation: pulse 2s infinite;"></span>실시간 미리보기 활성화';

    titleContent.appendChild(title);
    titleContent.appendChild(subtitle);
    titleContent.appendChild(statusBadge);

    titleSection.appendChild(icon);
    titleSection.appendChild(titleContent);

    // 액션 버튼들
    const actionsSection = Utils.createElement('div');
    actionsSection.style.cssText = `
      display: flex !important;
      justify-content: flex-end !important;
      gap: 16px !important;
      flex-wrap: wrap !important;
    `;

    const exportButton = Utils.createElement('button');
    exportButton.style.cssText = `
      background: rgba(255, 255, 255, 0.2) !important;
      color: white !important;
      border: 2px solid rgba(255, 255, 255, 0.3) !important;
      padding: 14px 28px !important;
      border-radius: 12px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      transition: all 0.3s ease !important;
      backdrop-filter: blur(10px) !important;
      display: flex !important;
      align-items: center !important;
      gap: 10px !important;
      min-height: 48px !important;
      font-size: 14px !important;
    `;
    exportButton.innerHTML = '<i class="fas fa-download"></i><span>테마 내보내기</span>';
    exportButton.addEventListener('click', () => this.exportThemeData());
    exportButton.addEventListener('mouseenter', () => {
      exportButton.style.background = 'rgba(255, 255, 255, 0.3) !important';
      exportButton.style.transform = 'translateY(-2px) !important';
    });
    exportButton.addEventListener('mouseleave', () => {
      exportButton.style.background = 'rgba(255, 255, 255, 0.2) !important';
      exportButton.style.transform = 'translateY(0) !important';
    });

    const importButton = Utils.createElement('button');
    importButton.style.cssText = `
      background: rgba(255, 255, 255, 0.95) !important;
      color: #667eea !important;
      border: none !important;
      padding: 14px 28px !important;
      border-radius: 12px !important;
      font-weight: 700 !important;
      cursor: pointer !important;
      transition: all 0.3s ease !important;
      display: flex !important;
      align-items: center !important;
      gap: 10px !important;
      min-height: 48px !important;
      font-size: 14px !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
    `;
    importButton.innerHTML = '<i class="fas fa-upload"></i><span>테마 가져오기</span>';
    importButton.addEventListener('click', () => this.openThemeImportModal());
    importButton.addEventListener('mouseenter', () => {
      importButton.style.transform = 'translateY(-3px) !important';
      importButton.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.25) !important';
      importButton.style.background = 'white !important';
    });
    importButton.addEventListener('mouseleave', () => {
      importButton.style.transform = 'translateY(0) !important';
      importButton.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15) !important';
      importButton.style.background = 'rgba(255, 255, 255, 0.95) !important';
    });

    actionsSection.appendChild(exportButton);
    actionsSection.appendChild(importButton);

    content.appendChild(titleSection);
    content.appendChild(actionsSection);
    header.appendChild(content);
    
    return header;
  }

  createStatsSection() {
    const section = Utils.createElement('div', 'mb-8');
    const grid = Utils.createElement('div', 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6');

    const statCards = [
      {
        title: '사용 가능한 테마',
        value: this.themeStats.totalThemes,
        icon: 'fas fa-palette',
        gradient: 'from-purple-500 to-purple-600',
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-600'
      },
      {
        title: '활성 테마',
        value: this.themeStats.activeTheme,
        icon: 'fas fa-check-circle',
        gradient: 'from-green-500 to-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-600'
      },
      {
        title: '커스텀 테마',
        value: this.themeStats.customThemes,
        icon: 'fas fa-paint-brush',
        gradient: 'from-blue-500 to-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-600'
      },
      {
        title: 'CSS 라인',
        value: this.themeStats.cssLines,
        icon: 'fas fa-code',
        gradient: 'from-orange-500 to-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-600'
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
              <div class="bg-gradient-to-r ${stat.gradient} h-2 rounded-full transition-all duration-500" style="width: ${Math.min(100, (stat.value / Math.max(this.themeStats.totalThemes || 1, 1)) * 100)}%"></div>
            </div>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });

    section.appendChild(grid);
    return section;
  }

  createThemeGallerySection() {
    const section = Utils.createElement('div', 'bg-white rounded-xl shadow-lg border border-gray-200');
    
    // 프리미엄 헤더
    const header = Utils.createElement('div', 'p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50');
    header.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <i class="fas fa-palette text-white text-sm"></i>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">🎨 프리미엄 테마 갤러리</h2>
            <p class="text-gray-600 text-sm">전문적으로 디자인된 테마 컬렉션</p>
          </div>
        </div>
        <button class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2 shadow-sm" onclick="themesPage.createCustomTheme()">
          <i class="fas fa-plus"></i>
          <span>새 테마 추가</span>
        </button>
      </div>
    `;
    
    const body = Utils.createElement('div', 'p-6');

    if (this.themes.length === 0) {
      body.innerHTML = `
        <div class="text-center py-12">
          <div class="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-palette text-gray-400 text-2xl"></i>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">테마가 없습니다</h3>
          <p class="text-gray-600 mb-4">새로운 테마를 추가하거나 기본 테마를 설정하세요.</p>
          <button class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200" onclick="themesPage.loadDefaultThemes()">
            기본 테마 로드
          </button>
        </div>
      `;
    } else {
      const themesGrid = this.createThemesGrid();
      body.appendChild(themesGrid);
    }

    section.appendChild(header);
    section.appendChild(body);

    return section;
  }

  createThemesGrid() {
    const grid = Utils.createElement('div', 'grid grid-cols-1 md:grid-cols-2 gap-6');

    this.themes.forEach(theme => {
      const themeCard = this.createThemeCard(theme);
      grid.appendChild(themeCard);
    });

    return grid;
  }

  createThemeCard(theme) {
    const card = Utils.createElement('div');
    card.style.cssText = `
      background: white !important;
      border: 2px solid ${theme.active ? '#667eea' : '#e2e8f0'} !important;
      border-radius: 16px !important;
      padding: 20px !important;
      transition: all 0.3s ease !important;
      cursor: pointer !important;
      position: relative !important;
      overflow: hidden !important;
    `;

    // 호버 효과
    card.addEventListener('mouseenter', () => {
      if (!theme.active) {
        card.style.borderColor = '#667eea !important';
        card.style.transform = 'translateY(-4px) !important';
        card.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important';
      }
    });

    card.addEventListener('mouseleave', () => {
      if (!theme.active) {
        card.style.borderColor = '#e2e8f0 !important';
        card.style.transform = 'translateY(0) !important';
        card.style.boxShadow = 'none !important';
      }
    });

    // 활성 배지
    if (theme.active) {
      const activeBadge = Utils.createElement('div');
      activeBadge.style.cssText = `
        position: absolute !important;
        top: 16px !important;
        right: 16px !important;
        background: linear-gradient(135deg, #667eea, #764ba2) !important;
        color: white !important;
        padding: 6px 12px !important;
        border-radius: 20px !important;
        font-size: 12px !important;
        font-weight: 600 !important;
        z-index: 10 !important;
      `;
      activeBadge.innerHTML = '✨ 활성';
      card.appendChild(activeBadge);
    }

    // 테마 프리뷰
    const preview = Utils.createElement('div');
    preview.style.cssText = `
      height: 120px !important;
      background: ${theme.colors ? theme.colors.background : '#ffffff'} !important;
      border: 1px solid #e2e8f0 !important;
      border-radius: 8px !important;
      margin-bottom: 16px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      position: relative !important;
      overflow: hidden !important;
    `;

    const previewContent = Utils.createElement('div');
    previewContent.style.cssText = 'text-align: center !important;';
    previewContent.innerHTML = `
      <div style="width: 60px; height: 8px; background: ${theme.colors ? theme.colors.primary : '#3b82f6'}; border-radius: 4px; margin: 0 auto 8px;"></div>
      <div style="width: 80px; height: 6px; background: ${theme.colors ? theme.colors.secondary : '#6b7280'}; border-radius: 3px; margin: 0 auto 6px;"></div>
      <div style="width: 40px; height: 4px; background: ${theme.colors ? theme.colors.secondary : '#6b7280'}; border-radius: 2px; margin: 0 auto;"></div>
    `;
    preview.appendChild(previewContent);

    // 테마 정보
    const info = Utils.createElement('div');
    
    const name = Utils.createElement('h3');
    name.style.cssText = `
      font-size: 18px !important;
      font-weight: 700 !important;
      color: #1e293b !important;
      margin: 0 0 8px 0 !important;
    `;
    name.textContent = theme.name;

    const description = Utils.createElement('p');
    description.style.cssText = `
      font-size: 14px !important;
      color: #64748b !important;
      margin: 0 0 16px 0 !important;
      line-height: 1.4 !important;
    `;
    description.textContent = theme.description;

    // 색상 팔레트
    const colorPalette = Utils.createElement('div');
    colorPalette.style.cssText = `
      display: flex !important;
      gap: 8px !important;
      margin-bottom: 16px !important;
    `;

    if (theme.colors) {
      Object.values(theme.colors).forEach(color => {
        const colorSwatch = Utils.createElement('div');
        colorSwatch.style.cssText = `
          width: 20px !important;
          height: 20px !important;
          background: ${color} !important;
          border-radius: 4px !important;
          border: 1px solid rgba(0,0,0,0.1) !important;
        `;
        colorPalette.appendChild(colorSwatch);
      });
    }

    // 액션 버튼
    const actionButton = Utils.createElement('button');
    actionButton.style.cssText = `
      width: 100% !important;
      background: ${theme.active ? 'linear-gradient(135deg, #6b7280, #4b5563)' : 'linear-gradient(135deg, #667eea, #764ba2)'} !important;
      color: white !important;
      border: none !important;
      padding: 12px 20px !important;
      border-radius: 8px !important;
      font-weight: 600 !important;
      cursor: ${theme.active ? 'default' : 'pointer'} !important;
      transition: all 0.3s ease !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 8px !important;
    `;
    actionButton.innerHTML = `
      <span>${theme.active ? '✅' : '🎨'}</span>
      <span>${theme.active ? '현재 활성 테마' : '테마 적용하기'}</span>
    `;

    if (!theme.active) {
      actionButton.addEventListener('click', () => this.selectTheme(theme.id));
    }

    info.appendChild(name);
    info.appendChild(description);
    info.appendChild(colorPalette);
    info.appendChild(actionButton);

    card.appendChild(preview);
    card.appendChild(info);

    return card;
  }

  createCustomizerSection() {
    const section = Utils.createElement('div', 'bg-white rounded-xl shadow-lg border border-gray-200');
    
    // 프리미엄 헤더
    const header = Utils.createElement('div', 'p-6 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-rose-50');
    header.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
            <i class="fas fa-magic text-white text-sm"></i>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">🛠️ 실시간 커스터마이저</h2>
            <p class="text-gray-600 text-sm">색상, 폰트, 레이아웃을 실시간으로 조정하세요</p>
          </div>
        </div>
        <button class="px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg hover:from-pink-700 hover:to-rose-700 transition-all duration-200 flex items-center space-x-2 shadow-lg" onclick="themesPage.applyCustomTheme()">
          <i class="fas fa-magic"></i>
          <span>적용하기</span>
        </button>
      </div>
    `;
    
    const body = Utils.createElement('div', 'p-6');

    // 커스터마이저 폼
    const customizerForm = this.createCustomizerForm();
    body.appendChild(customizerForm);

    // 실시간 미리보기
    const preview = this.createRealtimePreview();
    body.appendChild(preview);

    section.appendChild(header);
    section.appendChild(body);

    return section;
  }

  createCustomizerForm() {
    const form = Utils.createElement('div');
    form.style.cssText = 'margin-bottom: 24px !important;';

    form.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 24px;">
        <div>
          <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px; font-size: 14px;">🎯 기본 색상</label>
          <input type="color" id="primaryColor" value="#667eea" style="width: 100%; height: 40px; border: none; border-radius: 8px; cursor: pointer;">
        </div>
        
        <div>
          <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px; font-size: 14px;">🎭 보조 색상</label>
          <input type="color" id="secondaryColor" value="#6b7280" style="width: 100%; height: 40px; border: none; border-radius: 8px; cursor: pointer;">
        </div>
        
        <div>
          <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px; font-size: 14px;">🖼️ 배경 색상</label>
          <input type="color" id="backgroundColor" value="#ffffff" style="width: 100%; height: 40px; border: none; border-radius: 8px; cursor: pointer;">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 24px;">
        <div>
          <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px; font-size: 14px;">📝 폰트 패밀리</label>
          <select id="fontFamily" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; background: white;">
            <option value="system">시스템 기본</option>
            <option value="inter">Inter (모던)</option>
            <option value="roboto">Roboto (깔끔)</option>
            <option value="noto-sans">Noto Sans KR (한글 최적화)</option>
          </select>
        </div>
        
        <div>
          <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px; font-size: 14px;">📏 폰트 크기: <span id="fontSizeValue">14px</span></label>
          <input type="range" id="fontSize" min="12" max="20" value="14" style="width: 100%; margin-top: 4px;" oninput="document.getElementById('fontSizeValue').textContent = this.value + 'px'">
        </div>
        
        <div>
          <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px; font-size: 14px;">🔄 모서리 둥글기: <span id="borderRadiusValue">8px</span></label>
          <input type="range" id="borderRadius" min="0" max="16" value="8" style="width: 100%; margin-top: 4px;" oninput="document.getElementById('borderRadiusValue').textContent = this.value + 'px'">
        </div>
      </div>
    `;

    return form;
  }

  createRealtimePreview() {
    const preview = Utils.createElement('div');
    preview.style.cssText = `
      background: linear-gradient(135deg, #f0f9ff, #e0f2fe) !important;
      border-radius: 12px !important;
      padding: 20px !important;
      border: 1px solid #7dd3fc !important;
    `;

    preview.innerHTML = `
      <h3 style="font-size: 16px; font-weight: 700; color: #0c4a6e; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px;">
        👁️ 실시간 미리보기
      </h3>
      <div id="theme-preview" style="background: white; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px;">
        <div style="font-size: 16px; font-weight: 700; margin-bottom: 12px; color: #1e293b;">💬 댓글 시스템 미리보기</div>
        <div style="background: #f8fafc; padding: 12px; border-radius: 6px; margin-bottom: 8px; border-left: 4px solid #667eea;">
          <div style="font-weight: 600; margin-bottom: 6px; color: #1e293b;">👤 사용자 이름</div>
          <div style="color: #64748b; font-size: 13px; line-height: 1.5;">이것은 실시간 미리보기입니다. 위에서 설정을 변경하면 이 영역에서 즉시 확인할 수 있습니다!</div>
        </div>
        <button style="background: #667eea; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer;">💬 댓글 작성하기</button>
      </div>
    `;

    return preview;
  }

  createCssEditorSection() {
    const section = Utils.createElement('div', 'bg-white rounded-xl shadow-lg border border-gray-200 mt-8');
    
    // 프리미엄 헤더
    const header = Utils.createElement('div', 'p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50');
    header.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
            <i class="fas fa-code text-white text-sm"></i>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">💻 고급 CSS 에디터</h2>
            <p class="text-gray-600 text-sm">개발자를 위한 직접 CSS 편집 기능</p>
          </div>
        </div>
        <div class="flex space-x-2">
          <button class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2 shadow-sm" onclick="themesPage.formatCss()">
            <i class="fas fa-code"></i>
            <span>포맷팅</span>
          </button>
          <button class="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 flex items-center space-x-2 shadow-lg" onclick="themesPage.applyCss()">
            <i class="fas fa-rocket"></i>
            <span>CSS 적용</span>
          </button>
        </div>
      </div>
    `;
    
    const body = Utils.createElement('div', 'p-0');

    // CSS 에디터
    const editor = this.createCssEditor();
    body.appendChild(editor);

    section.appendChild(header);
    section.appendChild(body);

    return section;
  }

  createCssEditor() {
    const editorContainer = Utils.createElement('div');
    editorContainer.style.cssText = `
      background: linear-gradient(135deg, #0f172a, #1e293b) !important;
      border-radius: 0 0 16px 16px !important;
      overflow: hidden !important;
    `;

    const editorHeader = Utils.createElement('div');
    editorHeader.style.cssText = `
      background: linear-gradient(135deg, #1e293b, #334155) !important;
      padding: 16px 24px !important;
      border-bottom: 1px solid #475569 !important;
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
    `;

    editorHeader.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 18px;">⚡</span>
        <span style="font-weight: 700; color: #f1f5f9; font-size: 14px;">CSS 코드 에디터</span>
      </div>
      <div style="display: flex; gap: 8px;">
        <button onclick="themesPage.validateCss()" style="padding: 6px 12px; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
          ✅ 검증
        </button>
      </div>
    `;

    const textarea = Utils.createElement('textarea');
    textarea.id = 'customCssEditor';
    textarea.style.cssText = `
      width: 100% !important;
      height: 300px !important;
      border: none !important;
      padding: 24px !important;
      font-family: 'SF Mono', 'Monaco', 'Consolas', 'Courier New', monospace !important;
      font-size: 14px !important;
      line-height: 1.6 !important;
      resize: vertical !important;
      background: #0f172a !important;
      color: #e2e8f0 !important;
      outline: none !important;
    `;
    textarea.placeholder = `/* 🎨 커스텀 CSS를 입력하세요! */
.kommentio-widget {
  font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.kommentio-comment {
  border-radius: 8px;
  padding: 16px;
  background: #f8fafc;
  margin-bottom: 12px;
  transition: all 0.3s ease;
}

.kommentio-comment:hover {
  background: #f1f5f9;
  transform: translateY(-1px);
}

.kommentio-button {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.kommentio-button:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
}`;

    const tipSection = Utils.createElement('div');
    tipSection.style.cssText = `
      padding: 16px 24px !important;
      background: rgba(15, 23, 42, 0.5) !important;
      border-top: 1px solid #334155 !important;
    `;

    tipSection.innerHTML = `
      <div style="color: #94a3b8; font-size: 12px; line-height: 1.5;">
        <strong style="color: #f1f5f9;">💡 CSS 팁:</strong>
        <strong>.kommentio-widget</strong> (전체 컨테이너) |
        <strong>.kommentio-comment</strong> (댓글) |
        <strong>.kommentio-button</strong> (버튼) |
        <strong>.kommentio-input</strong> (입력 필드)
      </div>
    `;

    editorContainer.appendChild(editorHeader);
    editorContainer.appendChild(textarea);
    editorContainer.appendChild(tipSection);

    return editorContainer;
  }

  async loadThemesData() {
    try {
      // 기본 테마 데이터
      this.themes = [
        {
          id: 'default',
          name: '기본 테마',
          description: '깔끔하고 모던한 기본 디자인',
          colors: {
            primary: '#667eea',
            secondary: '#6b7280',
            background: '#ffffff'
          },
          active: true
        },
        {
          id: 'dark',
          name: '다크 테마',
          description: '어두운 배경의 우아한 디자인',
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
          colors: {
            primary: '#f59e0b',
            secondary: '#ef4444',
            background: '#fef3c7'
          },
          active: false
        }
      ];

      // 통계 업데이트
      this.themeStats = {
        totalThemes: this.themes.length,
        activeTheme: this.themes.filter(t => t.active).length,
        customThemes: 0,
        cssLines: this.customCss ? this.customCss.split('\n').length : 0
      };

    } catch (error) {
      console.error('테마 데이터 로딩 실패:', error);
      this.themes = [];
    }
  }

  selectTheme(themeId) {
    // 모든 테마 비활성화
    this.themes.forEach(theme => theme.active = false);
    
    // 선택된 테마 활성화
    const selectedTheme = this.themes.find(theme => theme.id === themeId);
    if (selectedTheme) {
      selectedTheme.active = true;
      this.currentTheme = themeId;
      this.render(); // 페이지 다시 렌더링
      Utils.showNotification(`${selectedTheme.name} 테마가 적용되었습니다.`, 'success');
    }
  }

  applyCustomTheme() {
    const primaryColor = Utils.$('#primaryColor')?.value || '#667eea';
    const secondaryColor = Utils.$('#secondaryColor')?.value || '#6b7280';
    const backgroundColor = Utils.$('#backgroundColor')?.value || '#ffffff';
    const fontFamily = Utils.$('#fontFamily')?.value || 'system';
    const fontSize = Utils.$('#fontSize')?.value || '14';
    const borderRadius = Utils.$('#borderRadius')?.value || '8';

    Utils.showNotification('커스텀 테마가 적용되었습니다.', 'success');
  }

  applyCss() {
    const css = Utils.$('#customCssEditor')?.value || '';
    this.customCss = css;
    this.themeStats.cssLines = css.split('\n').length;
    Utils.showNotification('커스텀 CSS가 적용되었습니다.', 'success');
  }

  formatCss() {
    const css = Utils.$('#customCssEditor')?.value || '';
    const formatted = css
      .replace(/\{/g, ' {\n  ')
      .replace(/\}/g, '\n}\n')
      .replace(/;/g, ';\n  ')
      .replace(/,/g, ',\n');
    
    if (Utils.$('#customCssEditor')) {
      Utils.$('#customCssEditor').value = formatted;
    }
    Utils.showNotification('CSS가 포맷팅되었습니다.', 'success');
  }

  validateCss() {
    const css = Utils.$('#customCssEditor')?.value || '';
    const hasOpenBrace = (css.match(/\{/g) || []).length;
    const hasCloseBrace = (css.match(/\}/g) || []).length;
    
    if (hasOpenBrace === hasCloseBrace) {
      Utils.showNotification('CSS 문법이 올바릅니다.', 'success');
    } else {
      Utils.showNotification('CSS 문법에 오류가 있습니다. 중괄호를 확인하세요.', 'warning');
    }
  }

  createCustomTheme() {
    Utils.showNotification('커스텀 테마 생성 기능은 곧 제공될 예정입니다.', 'info');
  }

  loadDefaultThemes() {
    this.loadThemesData();
    this.render();
    Utils.showNotification('기본 테마가 로드되었습니다.', 'success');
  }

  exportThemeData() {
    try {
      const themeData = {
        name: 'Exported Theme',
        version: '1.0',
        exported: new Date().toISOString(),
        themes: this.themes,
        customCss: this.customCss
      };

      const jsonString = JSON.stringify(themeData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `kommentio_themes_${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      Utils.showNotification('테마 데이터가 내보내졌습니다.', 'success');
    } catch (error) {
      console.error('테마 내보내기 실패:', error);
      Utils.showNotification('테마 내보내기에 실패했습니다.', 'error');
    }
  }

  openThemeImportModal() {
    Utils.showNotification('테마 가져오기 기능은 곧 제공될 예정입니다.', 'info');
  }

  importTheme(modal) {
    // 임시로 비활성화
    Utils.showNotification('테마 가져오기 기능은 곧 제공될 예정입니다.', 'info');
  }

  importJsonTheme(themeData) {
    if (themeData.themes) {
      this.themes = [...this.themes, ...themeData.themes];
    }
    if (themeData.customCss) {
      this.customCss = themeData.customCss;
    }
    this.render();
  }

  importCssTheme(css) {
    this.customCss = css;
    if (Utils.$('#customCssEditor')) {
      Utils.$('#customCssEditor').value = css;
    }
  }

  createErrorState() {
    const errorState = Utils.createElement('div');
    errorState.innerHTML = `
      <div class="text-center py-12">
        <div class="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">데이터 로딩 실패</h3>
        <p class="text-gray-600 mb-4">테마 데이터를 불러오는 중 오류가 발생했습니다.</p>
        <button class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200" onclick="themesPage.render()">
          다시 시도
        </button>
      </div>
    `;
    return errorState;
  }
}

// 전역으로 사용할 수 있도록 export
window.ThemesPage = ThemesPage;