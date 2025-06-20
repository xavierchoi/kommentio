// Kommentio Admin Dashboard - Integrations Page

class IntegrationsPage {
  constructor() {
    this.apiKeys = [];
    this.webhooks = [];
    this.thirdPartyIntegrations = [];
    this.currentTab = 'api-keys';
    
    // 메모리 누수 방지 시스템
    this.eventListeners = new Map();
    this.destroyed = false;
    this.timers = new Set();
    
    // 성능 최적화: 캐싱 시스템
    this.renderCache = new Map();
    this.lastRenderTime = 0;
    this.renderThrottleMs = 100;
    
    // 이벤트 디바운싱
    this.searchTimeout = null;
    this.updateTimeout = null;
  }

  async render() {
    console.log('Integrations 페이지 렌더링 시작...');
    const container = Utils.$('#page-integrations');
    if (!container) {
      console.error('Integrations 컨테이너를 찾을 수 없습니다.');
      return;
    }

    container.innerHTML = '';

    // 페이지 헤더
    const header = this.createPageHeader();
    container.appendChild(header);

    // 탭 네비게이션
    const tabNavigation = this.createTabNavigation();
    container.appendChild(tabNavigation);

    // 탭 컨텐츠
    const tabContent = this.createTabContent();
    container.appendChild(tabContent);

    // 초기 데이터 로드
    await this.loadIntegrationsData();
    this.renderCurrentTab();

    console.log('Integrations 페이지 렌더링 완료');
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

    // 배경 패턴 추가
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
    
    // 상단 아이콘과 제목
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
    icon.innerHTML = '<i class="fas fa-plug"></i>';

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
    title.textContent = '연동 & API 관리';

    const subtitle = Utils.createElement('p');
    subtitle.style.cssText = `
      font-size: 20px !important;
      margin: 0 !important;
      opacity: 0.9 !important;
      color: rgba(255, 255, 255, 0.9) !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
    `;
    subtitle.textContent = 'API 키, 웹훅, 써드파티 서비스를 통합 관리하고 시스템 연동을 최적화하세요';

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
    statusBadge.innerHTML = '<span style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%; animation: pulse 2s infinite;"></span>모든 연동 서비스 정상 작동';

    titleContent.appendChild(title);
    titleContent.appendChild(subtitle);
    titleContent.appendChild(statusBadge);

    titleSection.appendChild(icon);
    titleSection.appendChild(titleContent);

    // 통계 카드들
    const statsGrid = Utils.createElement('div');
    statsGrid.style.cssText = `
      display: grid !important;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) !important;
      gap: 20px !important;
      margin-bottom: 32px !important;
    `;

    const stats = [
      {
        icon: 'fas fa-key',
        value: this.apiKeys ? this.apiKeys.length : 0,
        label: 'API 키',
        color: '#fbbf24',
        gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)'
      },
      {
        icon: 'fas fa-share-alt',
        value: this.webhooks ? this.webhooks.length : 0,
        label: '웹훅',
        color: '#34d399',
        gradient: 'linear-gradient(135deg, #34d399, #10b981)'
      },
      {
        icon: 'fas fa-plug',
        value: this.thirdPartyIntegrations ? this.thirdPartyIntegrations.filter(i => i.status === 'connected').length : 0,
        label: '연결된 서비스',
        color: '#a78bfa',
        gradient: 'linear-gradient(135deg, #a78bfa, #8b5cf6)'
      },
      {
        icon: 'fas fa-shield-check',
        value: '100%',
        label: '보안 수준',
        color: '#fb7185',
        gradient: 'linear-gradient(135deg, #fb7185, #f43f5e)'
      }
    ];

    stats.forEach(stat => {
      const statCard = Utils.createElement('div');
      statCard.style.cssText = `
        background: rgba(255, 255, 255, 0.15) !important;
        backdrop-filter: blur(20px) !important;
        border-radius: 16px !important;
        padding: 20px !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        transition: all 0.3s ease !important;
        cursor: pointer !important;
        position: relative !important;
        overflow: hidden !important;
      `;

      // 호버 효과 (메모리 안전한 이벤트 리스너)
      this.addEventListenerSafe(statCard, 'mouseenter', () => {
        statCard.style.transform = 'translateY(-4px) !important';
        statCard.style.background = 'rgba(255, 255, 255, 0.25) !important';
      });

      this.addEventListenerSafe(statCard, 'mouseleave', () => {
        statCard.style.transform = 'translateY(0) !important';
        statCard.style.background = 'rgba(255, 255, 255, 0.15) !important';
      });

      const cardContent = Utils.createElement('div');
      cardContent.style.cssText = `
        display: flex !important;
        align-items: center !important;
        gap: 16px !important;
        position: relative !important;
        z-index: 2 !important;
      `;

      const iconContainer = Utils.createElement('div');
      iconContainer.style.cssText = `
        width: 48px !important;
        height: 48px !important;
        background: ${stat.gradient} !important;
        border-radius: 12px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 20px !important;
        color: white !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
      `;
      iconContainer.innerHTML = `<i class="${stat.icon}"></i>`;

      const statInfo = Utils.createElement('div');
      
      const value = Utils.createElement('div');
      value.style.cssText = `
        font-size: 28px !important;
        font-weight: 800 !important;
        color: white !important;
        margin-bottom: 4px !important;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
      `;
      value.textContent = stat.value;

      const label = Utils.createElement('div');
      label.style.cssText = `
        font-size: 14px !important;
        color: rgba(255, 255, 255, 0.8) !important;
        font-weight: 500 !important;
      `;
      label.textContent = stat.label;

      statInfo.appendChild(value);
      statInfo.appendChild(label);
      cardContent.appendChild(iconContainer);
      cardContent.appendChild(statInfo);
      statCard.appendChild(cardContent);
      statsGrid.appendChild(statCard);
    });

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
    exportButton.innerHTML = '<i class="fas fa-download"></i><span>CSV 내보내기</span>';
    exportButton.addEventListener('click', () => this.exportIntegrationsData());
    exportButton.addEventListener('mouseenter', () => {
      exportButton.style.background = 'rgba(255, 255, 255, 0.3) !important';
      exportButton.style.transform = 'translateY(-2px) !important';
    });
    exportButton.addEventListener('mouseleave', () => {
      exportButton.style.background = 'rgba(255, 255, 255, 0.2) !important';
      exportButton.style.transform = 'translateY(0) !important';
    });

    const newApiButton = Utils.createElement('button');
    newApiButton.style.cssText = `
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
    newApiButton.innerHTML = '<i class="fas fa-plus"></i><span>새 API 키 생성</span>';
    newApiButton.addEventListener('click', () => this.openApiKeyModal());
    newApiButton.addEventListener('mouseenter', () => {
      newApiButton.style.transform = 'translateY(-3px) !important';
      newApiButton.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.25) !important';
      newApiButton.style.background = 'white !important';
    });
    newApiButton.addEventListener('mouseleave', () => {
      newApiButton.style.transform = 'translateY(0) !important';
      newApiButton.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15) !important';
      newApiButton.style.background = 'rgba(255, 255, 255, 0.95) !important';
    });

    actionsSection.appendChild(exportButton);
    actionsSection.appendChild(newApiButton);

    content.appendChild(titleSection);
    content.appendChild(statsGrid);
    content.appendChild(actionsSection);
    header.appendChild(content);
    
    return header;
  }

  createTabNavigation() {
    const nav = Utils.createElement('div');
    nav.style.cssText = `
      margin-bottom: 32px !important;
      background: white !important;
      border-radius: 16px !important;
      padding: 8px !important;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
      border: 1px solid #f1f5f9 !important;
    `;

    const tabList = Utils.createElement('div');
    tabList.style.cssText = `
      display: flex !important;
      gap: 4px !important;
    `;

    const tabs = [
      { id: 'api-keys', name: 'API 키', icon: 'fas fa-key', gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)' },
      { id: 'webhooks', name: '웹훅', icon: 'fas fa-share-alt', gradient: 'linear-gradient(135deg, #34d399, #10b981)' },
      { id: 'third-party', name: '써드파티', icon: 'fas fa-plug', gradient: 'linear-gradient(135deg, #a78bfa, #8b5cf6)' }
    ];

    tabs.forEach(tab => {
      const tabButton = Utils.createElement('button');
      const isActive = this.currentTab === tab.id;
      
      tabButton.style.cssText = `
        display: flex !important;
        align-items: center !important;
        gap: 10px !important;
        padding: 14px 24px !important;
        border-radius: 12px !important;
        font-weight: 600 !important;
        font-size: 14px !important;
        transition: all 0.3s ease !important;
        cursor: pointer !important;
        border: none !important;
        flex: 1 !important;
        justify-content: center !important;
        min-height: 48px !important;
        ${isActive 
          ? `background: ${tab.gradient} !important; color: white !important; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;`
          : `background: transparent !important; color: #64748b !important;`
        }
      `;
      
      tabButton.innerHTML = `
        <i class="${tab.icon}" style="font-size: 16px;"></i>
        <span>${tab.name}</span>
      `;

      // 호버 효과 (메모리 안전한 이벤트 리스너)
      if (!isActive) {
        this.addEventListenerSafe(tabButton, 'mouseenter', () => {
          tabButton.style.background = '#f8fafc !important';
          tabButton.style.color = '#1e293b !important';
        });

        this.addEventListenerSafe(tabButton, 'mouseleave', () => {
          tabButton.style.background = 'transparent !important';
          tabButton.style.color = '#64748b !important';
        });
      }
      
      this.addEventListenerSafe(tabButton, 'click', () => this.switchTab(tab.id));
      tabList.appendChild(tabButton);
    });

    nav.appendChild(tabList);
    return nav;
  }

  createTabContent() {
    const content = Utils.createElement('div', 'tab-content');
    content.id = 'integrations-tab-content';
    return content;
  }

  async loadIntegrationsData() {
    try {
      // API 키 데모 데이터
      this.apiKeys = [
        {
          id: 1,
          name: 'Production API Key',
          key: 'kom_prod_1234567890abcdef',
          permissions: ['read', 'write', 'admin'],
          created_at: '2024-01-10T00:00:00Z',
          last_used: '2024-01-15T14:30:00Z',
          status: 'active'
        },
        {
          id: 2,
          name: 'Development API Key',
          key: 'kom_dev_abcdef1234567890',
          permissions: ['read', 'write'],
          created_at: '2024-01-12T00:00:00Z',
          last_used: '2024-01-14T10:15:00Z',
          status: 'active'
        }
      ];

      // 웹훅 데모 데이터
      this.webhooks = [
        {
          id: 1,
          name: 'Slack 알림',
          url: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
          events: ['comment.created', 'comment.approved', 'spam.detected'],
          status: 'active',
          created_at: '2024-01-10T00:00:00Z',
          last_triggered: '2024-01-15T14:30:00Z'
        },
        {
          id: 2,
          name: 'Discord 웹훅',
          url: 'https://discord.com/api/webhooks/1234567890/abcdefghijklmnopqrstuvwxyz',
          events: ['comment.created'],
          status: 'inactive',
          created_at: '2024-01-12T00:00:00Z',
          last_triggered: null
        }
      ];

      // 써드파티 연동 데모 데이터
      this.thirdPartyIntegrations = [
        {
          id: 'slack',
          name: 'Slack',
          description: '댓글 알림을 Slack 채널로 받아보세요',
          icon: 'fab fa-slack',
          status: 'connected',
          config: {
            webhook_url: 'https://hooks.slack.com/services/...',
            channel: '#comments'
          }
        },
        {
          id: 'discord',
          name: 'Discord',
          description: 'Discord 채널에 댓글 알림을 전송합니다',
          icon: 'fab fa-discord',
          status: 'disconnected',
          config: null
        },
        {
          id: 'email',
          name: '이메일 알림',
          description: '새 댓글이 등록되면 이메일로 알림을 받습니다',
          icon: 'fas fa-envelope',
          status: 'connected',
          config: {
            smtp_host: 'smtp.gmail.com',
            recipients: ['admin@example.com']
          }
        }
      ];
    } catch (error) {
      console.error('연동 데이터 로딩 실패:', error);
      this.apiKeys = [];
      this.webhooks = [];
      this.thirdPartyIntegrations = [];
    }
  }

  switchTab(tabId) {
    this.currentTab = tabId;
    
    // 페이지 전체 다시 렌더링
    this.render();
  }

  renderCurrentTab() {
    const container = Utils.$('#integrations-tab-content');
    container.innerHTML = '';

    switch (this.currentTab) {
      case 'api-keys':
        container.appendChild(this.renderApiKeysTab());
        break;
      case 'webhooks':
        container.appendChild(this.renderWebhooksTab());
        break;
      case 'third-party':
        container.appendChild(this.renderThirdPartyTab());
        break;
    }
  }

  renderApiKeysTab() {
    const section = Utils.createElement('div');
    section.style.cssText = 'display: flex; flex-direction: column; gap: 24px;';

    // API 키 정보 카드
    const infoCard = this.createPremiumInfoCard(
      'API 키 관리',
      'API 키를 사용하여 Kommentio 서비스에 프로그래밍 방식으로 접근할 수 있습니다. 각 키에는 특정 권한을 부여할 수 있습니다.',
      'fas fa-key',
      'linear-gradient(135deg, #fbbf24, #f59e0b)'
    );

    // API 키 목록 카드
    const apiKeysCard = this.createPremiumApiKeysCard();

    section.appendChild(infoCard);
    section.appendChild(apiKeysCard);

    return section;
  }

  createPremiumInfoCard(title, description, icon, gradient) {
    const card = Utils.createElement('div');
    card.style.cssText = `
      background: white !important;
      border-radius: 20px !important;
      padding: 24px !important;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
      border: 1px solid #f1f5f9 !important;
      position: relative !important;
      overflow: hidden !important;
    `;

    // 배경 장식
    const decoration = Utils.createElement('div');
    decoration.style.cssText = `
      position: absolute !important;
      top: -20px !important;
      right: -20px !important;
      width: 100px !important;
      height: 100px !important;
      background: ${gradient} !important;
      border-radius: 50% !important;
      opacity: 0.1 !important;
    `;
    card.appendChild(decoration);

    const content = Utils.createElement('div');
    content.style.cssText = `
      position: relative !important;
      z-index: 1 !important;
      display: flex !important;
      align-items: flex-start !important;
      gap: 16px !important;
    `;

    const iconContainer = Utils.createElement('div');
    iconContainer.style.cssText = `
      width: 48px !important;
      height: 48px !important;
      background: ${gradient} !important;
      border-radius: 12px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      color: white !important;
      font-size: 20px !important;
      flex-shrink: 0 !important;
    `;
    iconContainer.innerHTML = `<i class="${icon}"></i>`;

    const textContent = Utils.createElement('div');
    textContent.style.cssText = 'flex: 1 !important;';

    const titleElement = Utils.createElement('h3');
    titleElement.style.cssText = `
      font-size: 20px !important;
      font-weight: 700 !important;
      color: #1e293b !important;
      margin: 0 0 8px 0 !important;
    `;
    titleElement.textContent = title;

    const descriptionElement = Utils.createElement('p');
    descriptionElement.style.cssText = `
      font-size: 14px !important;
      color: #64748b !important;
      margin: 0 !important;
      line-height: 1.6 !important;
    `;
    descriptionElement.textContent = description;

    textContent.appendChild(titleElement);
    textContent.appendChild(descriptionElement);
    content.appendChild(iconContainer);
    content.appendChild(textContent);
    card.appendChild(content);

    return card;
  }

  createPremiumApiKeysCard() {
    const card = Utils.createElement('div');
    card.style.cssText = `
      background: white !important;
      border-radius: 20px !important;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
      border: 1px solid #f1f5f9 !important;
      overflow: hidden !important;
    `;

    // 헤더
    const header = Utils.createElement('div');
    header.style.cssText = `
      background: linear-gradient(135deg, #fbbf24, #f59e0b) !important;
      padding: 24px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
    `;

    const headerLeft = Utils.createElement('div');
    headerLeft.style.cssText = 'display: flex !important; align-items: center !important; gap: 12px !important;';

    const headerIcon = Utils.createElement('div');
    headerIcon.style.cssText = `
      width: 40px !important;
      height: 40px !important;
      background: rgba(255, 255, 255, 0.2) !important;
      border-radius: 10px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      color: white !important;
      font-size: 18px !important;
      backdrop-filter: blur(10px) !important;
    `;
    headerIcon.innerHTML = '<i class="fas fa-key"></i>';

    const headerTitle = Utils.createElement('h2');
    headerTitle.style.cssText = `
      font-size: 20px !important;
      font-weight: 700 !important;
      margin: 0 !important;
      color: white !important;
    `;
    headerTitle.textContent = `API 키 목록 (${this.apiKeys.length})`;

    const headerButton = Utils.createElement('button');
    headerButton.style.cssText = `
      background: rgba(255, 255, 255, 0.2) !important;
      color: white !important;
      border: 1px solid rgba(255, 255, 255, 0.3) !important;
      padding: 10px 20px !important;
      border-radius: 20px !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
      backdrop-filter: blur(10px) !important;
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
    `;
    headerButton.innerHTML = '<i class="fas fa-plus"></i><span>새 API 키</span>';
    headerButton.addEventListener('click', () => this.openApiKeyModal());

    headerLeft.appendChild(headerIcon);
    headerLeft.appendChild(headerTitle);
    header.appendChild(headerLeft);
    header.appendChild(headerButton);

    // 본문
    const body = Utils.createElement('div');
    body.style.cssText = 'padding: 24px !important;';
    
    if (this.apiKeys.length === 0) {
      const emptyState = this.createPremiumEmptyState(
        'API 키가 없습니다',
        '새 API 키를 생성하여 시작하세요.',
        'fas fa-key',
        '새 API 키 생성',
        () => this.openApiKeyModal()
      );
      body.appendChild(emptyState);
    } else {
      const apiKeysList = this.createPremiumApiKeysList();
      body.appendChild(apiKeysList);
    }

    card.appendChild(header);
    card.appendChild(body);

    return card;
  }

  createPremiumEmptyState(title, description, icon, buttonText, buttonAction) {
    const emptyState = Utils.createElement('div');
    emptyState.style.cssText = `
      text-align: center !important;
      padding: 48px 24px !important;
    `;

    const iconElement = Utils.createElement('div');
    iconElement.style.cssText = `
      width: 80px !important;
      height: 80px !important;
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%) !important;
      border-radius: 20px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      margin: 0 auto 24px auto !important;
      font-size: 32px !important;
      color: #94a3b8 !important;
    `;
    iconElement.innerHTML = `<i class="${icon}"></i>`;

    const titleElement = Utils.createElement('h3');
    titleElement.style.cssText = `
      font-size: 18px !important;
      font-weight: 600 !important;
      color: #475569 !important;
      margin: 0 0 8px 0 !important;
    `;
    titleElement.textContent = title;

    const descriptionElement = Utils.createElement('p');
    descriptionElement.style.cssText = `
      font-size: 14px !important;
      color: #64748b !important;
      margin: 0 0 24px 0 !important;
    `;
    descriptionElement.textContent = description;

    const button = Utils.createElement('button');
    button.style.cssText = `
      background: linear-gradient(135deg, #fbbf24, #f59e0b) !important;
      color: white !important;
      border: none !important;
      padding: 12px 24px !important;
      border-radius: 12px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      transition: all 0.3s ease !important;
      display: inline-flex !important;
      align-items: center !important;
      gap: 8px !important;
    `;
    button.innerHTML = `<i class="${icon}"></i><span>${buttonText}</span>`;
    button.addEventListener('click', buttonAction);

    emptyState.appendChild(iconElement);
    emptyState.appendChild(titleElement);
    emptyState.appendChild(descriptionElement);
    emptyState.appendChild(button);

    return emptyState;
  }

  createPremiumApiKeysList() {
    const list = Utils.createElement('div');
    list.style.cssText = 'display: flex; flex-direction: column; gap: 16px;';

    this.apiKeys.forEach(apiKey => {
      const item = this.createPremiumApiKeyItem(apiKey);
      list.appendChild(item);
    });

    return list;
  }

  createPremiumApiKeyItem(apiKey) {
    const item = Utils.createElement('div');
    item.style.cssText = `
      background: #f8fafc !important;
      border: 1px solid #e2e8f0 !important;
      border-radius: 16px !important;
      padding: 20px !important;
      transition: all 0.2s ease !important;
      cursor: pointer !important;
    `;

    // 호버 효과
    item.addEventListener('mouseenter', () => {
      item.style.background = '#f1f5f9 !important';
      item.style.borderColor = '#cbd5e1 !important';
      item.style.transform = 'translateY(-2px) !important';
    });

    item.addEventListener('mouseleave', () => {
      item.style.background = '#f8fafc !important';
      item.style.borderColor = '#e2e8f0 !important';
      item.style.transform = 'translateY(0) !important';
    });

    const header = Utils.createElement('div');
    header.style.cssText = `
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      margin-bottom: 16px !important;
    `;

    const headerLeft = Utils.createElement('div');
    headerLeft.style.cssText = 'display: flex !important; align-items: center !important; gap: 12px !important;';

    const keyIcon = Utils.createElement('div');
    keyIcon.style.cssText = `
      width: 40px !important;
      height: 40px !important;
      background: linear-gradient(135deg, #fbbf24, #f59e0b) !important;
      border-radius: 10px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      color: white !important;
      font-size: 16px !important;
    `;
    keyIcon.innerHTML = '<i class="fas fa-key"></i>';

    const keyInfo = Utils.createElement('div');
    
    const keyName = Utils.createElement('div');
    keyName.style.cssText = `
      font-size: 16px !important;
      font-weight: 600 !important;
      color: #1e293b !important;
      margin-bottom: 2px !important;
    `;
    keyName.textContent = apiKey.name;

    const keyId = Utils.createElement('div');
    keyId.style.cssText = `
      font-size: 12px !important;
      color: #64748b !important;
    `;
    keyId.textContent = `ID: ${apiKey.id}`;

    const statusBadge = Utils.createElement('div');
    statusBadge.style.cssText = `
      background: ${apiKey.status === 'active' ? '#dcfce7' : '#f1f5f9'} !important;
      color: ${apiKey.status === 'active' ? '#166534' : '#64748b'} !important;
      padding: 4px 12px !important;
      border-radius: 12px !important;
      font-size: 12px !important;
      font-weight: 600 !important;
      text-transform: uppercase !important;
    `;
    statusBadge.textContent = apiKey.status === 'active' ? '활성' : '비활성';

    keyInfo.appendChild(keyName);
    keyInfo.appendChild(keyId);
    headerLeft.appendChild(keyIcon);
    headerLeft.appendChild(keyInfo);
    header.appendChild(headerLeft);
    header.appendChild(statusBadge);

    // API 키 정보
    const keyDetails = Utils.createElement('div');
    keyDetails.style.cssText = `
      display: grid !important;
      grid-template-columns: 1fr auto !important;
      gap: 16px !important;
      margin-bottom: 16px !important;
    `;

    const keyValueSection = Utils.createElement('div');
    
    const keyLabel = Utils.createElement('div');
    keyLabel.style.cssText = `
      font-size: 12px !important;
      color: #64748b !important;
      margin-bottom: 4px !important;
      font-weight: 500 !important;
    `;
    keyLabel.textContent = 'API 키';

    const keyValueContainer = Utils.createElement('div');
    keyValueContainer.style.cssText = `
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
    `;

    const keyValue = Utils.createElement('code');
    keyValue.style.cssText = `
      background: #e2e8f0 !important;
      color: #1e293b !important;
      padding: 6px 12px !important;
      border-radius: 8px !important;
      font-size: 12px !important;
      font-family: 'SF Mono', 'Monaco', 'Consolas', monospace !important;
      flex: 1 !important;
    `;
    keyValue.textContent = `${apiKey.key.substring(0, 20)}...`;

    const copyButton = Utils.createElement('button');
    copyButton.style.cssText = `
      background: #667eea !important;
      color: white !important;
      border: none !important;
      padding: 6px 12px !important;
      border-radius: 6px !important;
      font-size: 12px !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
    `;
    copyButton.innerHTML = '<i class="fas fa-copy"></i>';
    copyButton.addEventListener('click', () => this.copyApiKey(apiKey.key));

    keyValueContainer.appendChild(keyValue);
    keyValueContainer.appendChild(copyButton);
    keyValueSection.appendChild(keyLabel);
    keyValueSection.appendChild(keyValueContainer);

    const permissionsSection = Utils.createElement('div');
    
    const permLabel = Utils.createElement('div');
    permLabel.style.cssText = `
      font-size: 12px !important;
      color: #64748b !important;
      margin-bottom: 4px !important;
      font-weight: 500 !important;
    `;
    permLabel.textContent = '권한';

    const permissionsContainer = Utils.createElement('div');
    permissionsContainer.style.cssText = `
      display: flex !important;
      gap: 4px !important;
      flex-wrap: wrap !important;
    `;

    apiKey.permissions.forEach(perm => {
      const permBadge = Utils.createElement('span');
      permBadge.style.cssText = `
        background: #e0e7ff !important;
        color: #3730a3 !important;
        padding: 2px 8px !important;
        border-radius: 6px !important;
        font-size: 11px !important;
        font-weight: 500 !important;
        text-transform: uppercase !important;
      `;
      permBadge.textContent = perm;
      permissionsContainer.appendChild(permBadge);
    });

    permissionsSection.appendChild(permLabel);
    permissionsSection.appendChild(permissionsContainer);
    keyDetails.appendChild(keyValueSection);
    keyDetails.appendChild(permissionsSection);

    // 메타데이터
    const metadata = Utils.createElement('div');
    metadata.style.cssText = `
      display: grid !important;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)) !important;
      gap: 12px !important;
      margin-bottom: 16px !important;
      padding-top: 16px !important;
      border-top: 1px solid #e2e8f0 !important;
    `;

    const createdDate = Utils.createElement('div');
    createdDate.style.cssText = 'text-align: center !important;';
    createdDate.innerHTML = `
      <div style="font-size: 12px; color: #64748b; margin-bottom: 2px;">생성일</div>
      <div style="font-size: 13px; font-weight: 500; color: #1e293b;">${Utils.formatDateTime(apiKey.created_at)}</div>
    `;

    const lastUsed = Utils.createElement('div');
    lastUsed.style.cssText = 'text-align: center !important;';
    lastUsed.innerHTML = `
      <div style="font-size: 12px; color: #64748b; margin-bottom: 2px;">마지막 사용</div>
      <div style="font-size: 13px; font-weight: 500; color: #1e293b;">${apiKey.last_used ? Utils.formatDateTime(apiKey.last_used) : '사용 안함'}</div>
    `;

    metadata.appendChild(createdDate);
    metadata.appendChild(lastUsed);

    // 액션 버튼들
    const actions = Utils.createElement('div');
    actions.style.cssText = `
      display: flex !important;
      gap: 8px !important;
      justify-content: flex-end !important;
    `;

    const editButton = Utils.createElement('button');
    editButton.style.cssText = `
      background: #f1f5f9 !important;
      color: #475569 !important;
      border: 1px solid #cbd5e1 !important;
      padding: 8px 16px !important;
      border-radius: 8px !important;
      font-size: 12px !important;
      font-weight: 500 !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
      display: flex !important;
      align-items: center !important;
      gap: 6px !important;
    `;
    editButton.innerHTML = '<i class="fas fa-edit"></i><span>편집</span>';
    editButton.addEventListener('click', () => this.editApiKey(apiKey.id));

    const deleteButton = Utils.createElement('button');
    deleteButton.style.cssText = `
      background: #fef2f2 !important;
      color: #dc2626 !important;
      border: 1px solid #fecaca !important;
      padding: 8px 16px !important;
      border-radius: 8px !important;
      font-size: 12px !important;
      font-weight: 500 !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
      display: flex !important;
      align-items: center !important;
      gap: 6px !important;
    `;
    deleteButton.innerHTML = '<i class="fas fa-trash"></i><span>삭제</span>';
    deleteButton.addEventListener('click', () => this.deleteApiKey(apiKey.id));

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);

    item.appendChild(header);
    item.appendChild(keyDetails);
    item.appendChild(metadata);
    item.appendChild(actions);

    return item;
  }

  createApiKeysTable() {
    const tableContainer = Utils.createElement('div', 'overflow-x-auto');
    const table = Utils.createElement('table', 'table');
    
    table.innerHTML = `
      <thead>
        <tr>
          <th>이름</th>
          <th>API 키</th>
          <th>권한</th>
          <th>마지막 사용</th>
          <th>상태</th>
          <th>작업</th>
        </tr>
      </thead>
      <tbody>
        ${this.apiKeys.map(key => `
          <tr>
            <td class="font-medium">${key.name}</td>
            <td>
              <div class="flex items-center gap-2">
                <code class="bg-gray-100 px-2 py-1 rounded text-sm">${key.key.substring(0, 20)}...</code>
                <button class="btn btn-sm btn-secondary" onclick="integrationsPage.copyApiKey('${key.key}')">
                  <i class="fas fa-copy"></i>
                </button>
              </div>
            </td>
            <td>
              <div class="flex gap-1">
                ${key.permissions.map(perm => `
                  <span class="badge badge-secondary">${perm}</span>
                `).join('')}
              </div>
            </td>
            <td>${key.last_used ? Utils.formatDateTime(key.last_used) : '사용 안함'}</td>
            <td>
              <span class="badge ${key.status === 'active' ? 'badge-success' : 'badge-secondary'}">
                ${key.status === 'active' ? '활성' : '비활성'}
              </span>
            </td>
            <td>
              <div class="flex gap-2">
                <button class="btn btn-sm btn-secondary" onclick="integrationsPage.editApiKey(${key.id})">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="integrationsPage.deleteApiKey(${key.id})">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    `;

    tableContainer.appendChild(table);
    return tableContainer;
  }

  renderWebhooksTab() {
    const section = Utils.createElement('div', 'space-y-6');

    // 웹훅 설명
    const description = Utils.createElement('div', 'bg-green-50 border border-green-200 rounded-lg p-4');
    description.innerHTML = `
      <div class="flex items-start gap-3">
        <i class="fas fa-share-alt text-green-600 mt-1"></i>
        <div>
          <h3 class="font-medium text-green-900">웹훅 관리</h3>
          <p class="text-green-700 text-sm mt-1">
            특정 이벤트가 발생할 때 외부 서비스로 HTTP 요청을 전송합니다.
            댓글 생성, 승인, 스팸 탐지 등의 이벤트를 실시간으로 알림받을 수 있습니다.
          </p>
        </div>
      </div>
    `;

    // 웹훅 목록
    const webhooksCard = Utils.createElement('div', 'card');
    const header = Utils.createElement('div', 'card-header');
    header.innerHTML = `
      <div class="flex items-center justify-between">
        <h2>웹훅 목록</h2>
        <button class="btn btn-sm btn-primary" onclick="integrationsPage.openWebhookModal()">
          <i class="fas fa-plus"></i> 새 웹훅
        </button>
      </div>
    `;

    const body = Utils.createElement('div', 'card-body');
    
    if (this.webhooks.length === 0) {
      body.appendChild(Components.createEmptyState(
        '웹훅이 없습니다',
        '새 웹훅을 생성하여 실시간 알림을 받아보세요.',
        '새 웹훅 생성',
        () => this.openWebhookModal()
      ));
    } else {
      const webhooksList = this.createWebhooksList();
      body.appendChild(webhooksList);
    }

    webhooksCard.appendChild(header);
    webhooksCard.appendChild(body);

    section.appendChild(description);
    section.appendChild(webhooksCard);

    return section;
  }

  createWebhooksList() {
    const list = Utils.createElement('div', 'space-y-4');

    this.webhooks.forEach(webhook => {
      const item = Utils.createElement('div', 'border border-gray-200 rounded-lg p-4');
      
      item.innerHTML = `
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h3 class="font-medium text-gray-900">${webhook.name}</h3>
              <span class="badge ${webhook.status === 'active' ? 'badge-success' : 'badge-secondary'}">
                ${webhook.status === 'active' ? '활성' : '비활성'}
              </span>
            </div>
            
            <div class="text-sm text-gray-600 mb-3">
              <div class="mb-1">
                <strong>URL:</strong> 
                <code class="bg-gray-100 px-2 py-1 rounded">${webhook.url.substring(0, 50)}...</code>
              </div>
              <div class="mb-1">
                <strong>이벤트:</strong> 
                ${webhook.events.map(event => `<span class="badge badge-secondary mr-1">${event}</span>`).join('')}
              </div>
              <div>
                <strong>마지막 실행:</strong> 
                ${webhook.last_triggered ? Utils.formatDateTime(webhook.last_triggered) : '실행 안함'}
              </div>
            </div>
          </div>
          
          <div class="flex gap-2 ml-4">
            <button class="btn btn-sm btn-secondary" onclick="integrationsPage.testWebhook(${webhook.id})">
              <i class="fas fa-play"></i> 테스트
            </button>
            <button class="btn btn-sm btn-secondary" onclick="integrationsPage.editWebhook(${webhook.id})">
              <i class="fas fa-edit"></i> 편집
            </button>
            <button class="btn btn-sm btn-danger" onclick="integrationsPage.deleteWebhook(${webhook.id})">
              <i class="fas fa-trash"></i> 삭제
            </button>
          </div>
        </div>
      `;
      
      list.appendChild(item);
    });

    return list;
  }

  renderThirdPartyTab() {
    const section = Utils.createElement('div', 'space-y-6');

    // 써드파티 연동 설명
    const description = Utils.createElement('div', 'bg-purple-50 border border-purple-200 rounded-lg p-4');
    description.innerHTML = `
      <div class="flex items-start gap-3">
        <i class="fas fa-plug text-purple-600 mt-1"></i>
        <div>
          <h3 class="font-medium text-purple-900">써드파티 연동</h3>
          <p class="text-purple-700 text-sm mt-1">
            인기 있는 서비스들과 쉽게 연동하여 댓글 시스템을 확장하세요.
            Slack, Discord, 이메일 등 다양한 알림 채널을 설정할 수 있습니다.
          </p>
        </div>
      </div>
    `;

    // 써드파티 서비스 목록
    const servicesGrid = Utils.createElement('div', 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6');

    this.thirdPartyIntegrations.forEach(service => {
      const serviceCard = this.createServiceCard(service);
      servicesGrid.appendChild(serviceCard);
    });

    section.appendChild(description);
    section.appendChild(servicesGrid);

    return section;
  }

  createServiceCard(service) {
    const card = Utils.createElement('div', 'card');
    
    card.innerHTML = `
      <div class="card-body">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <i class="${service.icon} text-2xl text-gray-600"></i>
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <h3 class="font-medium text-gray-900">${service.name}</h3>
              <span class="badge ${service.status === 'connected' ? 'badge-success' : 'badge-secondary'}">
                ${service.status === 'connected' ? '연결됨' : '연결 안됨'}
              </span>
            </div>
            <p class="text-sm text-gray-600 mb-4">${service.description}</p>
            
            <div class="flex gap-2">
              ${service.status === 'connected' 
                ? `<button class="btn btn-sm btn-secondary" onclick="integrationsPage.configureService('${service.id}')">
                    <i class="fas fa-cog"></i> 설정
                  </button>
                  <button class="btn btn-sm btn-danger" onclick="integrationsPage.disconnectService('${service.id}')">
                    <i class="fas fa-unlink"></i> 연결 해제
                  </button>`
                : `<button class="btn btn-sm btn-primary" onclick="integrationsPage.connectService('${service.id}')">
                    <i class="fas fa-link"></i> 연결
                  </button>`
              }
            </div>
          </div>
        </div>
      </div>
    `;

    return card;
  }

  // API 키 관련 메서드
  openApiKeyModal() {
    // 프리미엄 API 키 생성 모달
    const modalContent = Utils.createElement('div');
    modalContent.style.cssText = `
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      color: #1e293b !important;
      line-height: 1.6 !important;
    `;

    // API 키 이름 섹션
    const nameSection = Utils.createElement('div');
    nameSection.style.cssText = 'margin-bottom: 24px !important;';

    const nameLabel = Utils.createElement('label');
    nameLabel.style.cssText = `
      display: block !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      color: #374151 !important;
      margin-bottom: 8px !important;
    `;
    nameLabel.textContent = 'API 키 이름';

    const nameInput = Utils.createElement('input');
    nameInput.style.cssText = `
      width: 100% !important;
      padding: 12px 16px !important;
      border: 2px solid #e5e7eb !important;
      border-radius: 12px !important;
      font-size: 14px !important;
      transition: all 0.2s ease !important;
      background: white !important;
      box-sizing: border-box !important;
    `;
    nameInput.type = 'text';
    nameInput.id = 'apiKeyName';
    nameInput.placeholder = '예: Production API Key';
    
    // 포커스 효과
    nameInput.addEventListener('focus', () => {
      nameInput.style.borderColor = '#667eea !important';
      nameInput.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1) !important';
    });
    nameInput.addEventListener('blur', () => {
      nameInput.style.borderColor = '#e5e7eb !important';
      nameInput.style.boxShadow = 'none !important';
    });

    nameSection.appendChild(nameLabel);
    nameSection.appendChild(nameInput);

    // 권한 섹션
    const permSection = Utils.createElement('div');
    permSection.style.cssText = 'margin-bottom: 24px !important;';

    const permLabel = Utils.createElement('div');
    permLabel.style.cssText = `
      font-size: 14px !important;
      font-weight: 600 !important;
      color: #374151 !important;
      margin-bottom: 12px !important;
    `;
    permLabel.textContent = '권한 설정';

    const permDescription = Utils.createElement('div');
    permDescription.style.cssText = `
      font-size: 13px !important;
      color: #6b7280 !important;
      margin-bottom: 16px !important;
      padding: 12px !important;
      background: #f9fafb !important;
      border-radius: 8px !important;
      border-left: 3px solid #667eea !important;
    `;
    permDescription.textContent = '이 API 키로 허용할 작업을 선택하세요. 최소 권한 원칙에 따라 필요한 권한만 부여하는 것을 권장합니다.';

    const permGroup = Utils.createElement('div');
    permGroup.style.cssText = 'display: flex !important; flex-direction: column !important; gap: 12px !important;';

    // 읽기 권한 체크박스
    const readOption = this.createPermissionOption(
      'permRead',
      '읽기 권한 (Read)',
      '댓글 조회 및 통계 확인',
      'fas fa-eye',
      '#10b981',
      true
    );

    // 쓰기 권한 체크박스
    const writeOption = this.createPermissionOption(
      'permWrite',
      '쓰기 권한 (Write)',
      '댓글 작성, 수정, 삭제',
      'fas fa-edit',
      '#f59e0b',
      false
    );

    // 관리자 권한 체크박스
    const adminOption = this.createPermissionOption(
      'permAdmin',
      '관리자 권한 (Admin)',
      '모든 작업 및 설정 관리',
      'fas fa-crown',
      '#ef4444',
      false
    );

    permGroup.appendChild(readOption);
    permGroup.appendChild(writeOption);
    permGroup.appendChild(adminOption);

    permSection.appendChild(permLabel);
    permSection.appendChild(permDescription);
    permSection.appendChild(permGroup);

    modalContent.appendChild(nameSection);
    modalContent.appendChild(permSection);

    // 모달 버튼들
    const buttons = Utils.createElement('div');
    buttons.style.cssText = `
      display: flex !important;
      justify-content: flex-end !important;
      gap: 12px !important;
      margin-top: 24px !important;
    `;

    const cancelBtn = Utils.createElement('button');
    cancelBtn.style.cssText = `
      background: #f1f5f9 !important;
      color: #475569 !important;
      border: 1px solid #cbd5e1 !important;
      padding: 10px 20px !important;
      border-radius: 8px !important;
      font-size: 14px !important;
      font-weight: 500 !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
    `;
    cancelBtn.textContent = '취소';
    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    const createBtn = Utils.createElement('button');
    createBtn.style.cssText = `
      background: linear-gradient(135deg, #667eea, #764ba2) !important;
      color: white !important;
      border: none !important;
      padding: 10px 20px !important;
      border-radius: 8px !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
    `;
    createBtn.textContent = '생성';
    createBtn.addEventListener('click', () => this.createApiKey(modal));

    buttons.appendChild(cancelBtn);
    buttons.appendChild(createBtn);
    modalContent.appendChild(buttons);

    // 모달 생성
    const modal = this.createPremiumModal('새 API 키 생성', modalContent);
    document.body.appendChild(modal);
  }

  createPermissionOption(id, title, description, icon, color, checked) {
    const option = Utils.createElement('label');
    option.style.cssText = `
      display: flex !important;
      align-items: flex-start !important;
      gap: 12px !important;
      padding: 16px !important;
      border: 2px solid #e5e7eb !important;
      border-radius: 12px !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
      background: white !important;
    `;

    const checkbox = Utils.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = id;
    checkbox.checked = checked;
    checkbox.style.cssText = `
      width: 18px !important;
      height: 18px !important;
      margin-top: 2px !important;
      cursor: pointer !important;
    `;

    const iconContainer = Utils.createElement('div');
    iconContainer.style.cssText = `
      width: 40px !important;
      height: 40px !important;
      background: ${color}15 !important;
      border-radius: 10px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      color: ${color} !important;
      font-size: 16px !important;
    `;
    iconContainer.innerHTML = `<i class="${icon}"></i>`;

    const textContent = Utils.createElement('div');
    textContent.style.cssText = 'flex: 1 !important;';

    const titleEl = Utils.createElement('div');
    titleEl.style.cssText = `
      font-size: 14px !important;
      font-weight: 600 !important;
      color: #1e293b !important;
      margin-bottom: 4px !important;
    `;
    titleEl.textContent = title;

    const descEl = Utils.createElement('div');
    descEl.style.cssText = `
      font-size: 13px !important;
      color: #64748b !important;
    `;
    descEl.textContent = description;

    textContent.appendChild(titleEl);
    textContent.appendChild(descEl);

    option.appendChild(checkbox);
    option.appendChild(iconContainer);
    option.appendChild(textContent);

    // 호버 및 체크 효과
    const updateStyle = () => {
      if (checkbox.checked) {
        option.style.borderColor = `${color} !important`;
        option.style.background = `${color}05 !important`;
      } else {
        option.style.borderColor = '#e5e7eb !important';
        option.style.background = 'white !important';
      }
    };

    checkbox.addEventListener('change', updateStyle);
    updateStyle();

    option.addEventListener('mouseenter', () => {
      if (!checkbox.checked) {
        option.style.borderColor = '#cbd5e1 !important';
        option.style.background = '#f9fafb !important';
      }
    });

    option.addEventListener('mouseleave', updateStyle);

    return option;
  }

  createPremiumModal(title, content) {
    const modal = Utils.createElement('div');
    modal.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      background: rgba(0, 0, 0, 0.5) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      z-index: 9999 !important;
      backdrop-filter: blur(8px) !important;
    `;

    const modalDialog = Utils.createElement('div');
    modalDialog.style.cssText = `
      background: white !important;
      border-radius: 20px !important;
      padding: 32px !important;
      max-width: 600px !important;
      width: 90% !important;
      max-height: 90vh !important;
      overflow-y: auto !important;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
    `;

    const modalHeader = Utils.createElement('div');
    modalHeader.style.cssText = `
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      margin-bottom: 24px !important;
    `;

    const modalTitle = Utils.createElement('h2');
    modalTitle.style.cssText = `
      font-size: 24px !important;
      font-weight: 700 !important;
      color: #1e293b !important;
      margin: 0 !important;
    `;
    modalTitle.textContent = title;

    modalHeader.appendChild(modalTitle);
    modalDialog.appendChild(modalHeader);
    modalDialog.appendChild(content);
    modal.appendChild(modalDialog);

    // 모달 외부 클릭시 닫기
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });

    return modal;
  }

  createApiKey(modal) {
    const name = Utils.$('#apiKeyName').value;
    if (!name.trim()) {
      Utils.showToast('API 키 이름을 입력하세요.', 'warning');
      return;
    }

    const permissions = [];
    if (Utils.$('#permRead').checked) permissions.push('read');
    if (Utils.$('#permWrite').checked) permissions.push('write');
    if (Utils.$('#permAdmin').checked) permissions.push('admin');

    if (permissions.length === 0) {
      Utils.showToast('최소 하나의 권한을 선택하세요.', 'warning');
      return;
    }

    const newApiKey = {
      id: this.apiKeys.length + 1,
      name: name,
      key: `kom_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      permissions: permissions,
      created_at: new Date().toISOString(),
      last_used: null,
      status: 'active'
    };

    this.apiKeys.push(newApiKey);
    document.body.removeChild(modal);
    this.renderCurrentTab();
    Utils.showToast('API 키가 생성되었습니다.', 'success');
  }

  copyApiKey(key) {
    navigator.clipboard.writeText(key).then(() => {
      Utils.showToast('API 키가 클립보드에 복사되었습니다.', 'success');
    }).catch(() => {
      Utils.showToast('복사에 실패했습니다.', 'error');
    });
  }

  editApiKey(keyId) {
    Utils.showToast('API 키 편집 기능은 곧 제공될 예정입니다.', 'info');
  }

  deleteApiKey(keyId) {
    if (!confirm('정말로 이 API 키를 삭제하시겠습니까?')) {
      return;
    }

    this.apiKeys = this.apiKeys.filter(key => key.id !== keyId);
    this.renderCurrentTab();
    Utils.showToast('API 키가 삭제되었습니다.', 'success');
  }

  // 웹훅 관련 메서드
  openWebhookModal() {
    // 프리미엄 웹훅 생성 모달
    const modalContent = Utils.createElement('div');
    modalContent.style.cssText = `
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      color: #1e293b !important;
      line-height: 1.6 !important;
    `;

    // 웹훅 이름 섹션
    const nameSection = Utils.createElement('div');
    nameSection.style.cssText = 'margin-bottom: 24px !important;';

    const nameLabel = Utils.createElement('label');
    nameLabel.style.cssText = `
      display: block !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      color: #374151 !important;
      margin-bottom: 8px !important;
    `;
    nameLabel.textContent = '웹훅 이름';

    const nameInput = Utils.createElement('input');
    nameInput.style.cssText = `
      width: 100% !important;
      padding: 12px 16px !important;
      border: 2px solid #e5e7eb !important;
      border-radius: 12px !important;
      font-size: 14px !important;
      transition: all 0.2s ease !important;
      background: white !important;
      box-sizing: border-box !important;
    `;
    nameInput.type = 'text';
    nameInput.id = 'webhookName';
    nameInput.placeholder = '예: Slack 알림';

    // 포커스 효과
    nameInput.addEventListener('focus', () => {
      nameInput.style.borderColor = '#34d399 !important';
      nameInput.style.boxShadow = '0 0 0 3px rgba(52, 211, 153, 0.1) !important';
    });
    nameInput.addEventListener('blur', () => {
      nameInput.style.borderColor = '#e5e7eb !important';
      nameInput.style.boxShadow = 'none !important';
    });

    nameSection.appendChild(nameLabel);
    nameSection.appendChild(nameInput);

    // 웹훅 URL 섹션
    const urlSection = Utils.createElement('div');
    urlSection.style.cssText = 'margin-bottom: 24px !important;';

    const urlLabel = Utils.createElement('label');
    urlLabel.style.cssText = `
      display: block !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      color: #374151 !important;
      margin-bottom: 8px !important;
    `;
    urlLabel.textContent = '웹훅 URL';

    const urlInput = Utils.createElement('input');
    urlInput.style.cssText = `
      width: 100% !important;
      padding: 12px 16px !important;
      border: 2px solid #e5e7eb !important;
      border-radius: 12px !important;
      font-size: 14px !important;
      transition: all 0.2s ease !important;
      background: white !important;
      box-sizing: border-box !important;
    `;
    urlInput.type = 'url';
    urlInput.id = 'webhookUrl';
    urlInput.placeholder = 'https://hooks.slack.com/services/...';

    urlInput.addEventListener('focus', () => {
      urlInput.style.borderColor = '#34d399 !important';
      urlInput.style.boxShadow = '0 0 0 3px rgba(52, 211, 153, 0.1) !important';
    });
    urlInput.addEventListener('blur', () => {
      urlInput.style.borderColor = '#e5e7eb !important';
      urlInput.style.boxShadow = 'none !important';
    });

    const urlHint = Utils.createElement('div');
    urlHint.style.cssText = `
      font-size: 12px !important;
      color: #6b7280 !important;
      margin-top: 4px !important;
    `;
    urlHint.textContent = 'HTTPS URL이어야 하며, POST 요청을 받을 수 있어야 합니다.';

    urlSection.appendChild(urlLabel);
    urlSection.appendChild(urlInput);
    urlSection.appendChild(urlHint);

    // 이벤트 선택 섹션
    const eventsSection = Utils.createElement('div');
    eventsSection.style.cssText = 'margin-bottom: 24px !important;';

    const eventsLabel = Utils.createElement('div');
    eventsLabel.style.cssText = `
      font-size: 14px !important;
      font-weight: 600 !important;
      color: #374151 !important;
      margin-bottom: 12px !important;
    `;
    eventsLabel.textContent = '이벤트 선택';

    const eventsDescription = Utils.createElement('div');
    eventsDescription.style.cssText = `
      font-size: 13px !important;
      color: #6b7280 !important;
      margin-bottom: 16px !important;
      padding: 12px !important;
      background: #f9fafb !important;
      border-radius: 8px !important;
      border-left: 3px solid #34d399 !important;
    `;
    eventsDescription.textContent = '웹훅이 트리거될 이벤트를 선택하세요. 선택한 이벤트가 발생할 때마다 지정된 URL로 HTTP POST 요청이 전송됩니다.';

    const eventsGroup = Utils.createElement('div');
    eventsGroup.style.cssText = 'display: flex !important; flex-direction: column !important; gap: 12px !important;';

    // 이벤트 옵션들
    const events = [
      {
        id: 'eventCommentCreated',
        title: '댓글 생성 (comment.created)',
        description: '새 댓글이 작성될 때 트리거',
        icon: 'fas fa-comment',
        color: '#10b981',
        checked: true
      },
      {
        id: 'eventCommentApproved',
        title: '댓글 승인 (comment.approved)', 
        description: '댓글이 승인될 때 트리거',
        icon: 'fas fa-check-circle',
        color: '#34d399',
        checked: false
      },
      {
        id: 'eventSpamDetected',
        title: '스팸 탐지 (spam.detected)',
        description: '스팸 댓글이 감지될 때 트리거',
        icon: 'fas fa-shield-alt',
        color: '#ef4444',
        checked: false
      }
    ];

    events.forEach(event => {
      const eventOption = this.createEventOption(
        event.id,
        event.title,
        event.description,
        event.icon,
        event.color,
        event.checked
      );
      eventsGroup.appendChild(eventOption);
    });

    eventsSection.appendChild(eventsLabel);
    eventsSection.appendChild(eventsDescription);
    eventsSection.appendChild(eventsGroup);

    modalContent.appendChild(nameSection);
    modalContent.appendChild(urlSection);
    modalContent.appendChild(eventsSection);

    // 모달 버튼들
    const buttons = Utils.createElement('div');
    buttons.style.cssText = `
      display: flex !important;
      justify-content: flex-end !important;
      gap: 12px !important;
      margin-top: 24px !important;
    `;

    const cancelBtn = Utils.createElement('button');
    cancelBtn.style.cssText = `
      background: #f1f5f9 !important;
      color: #475569 !important;
      border: 1px solid #cbd5e1 !important;
      padding: 10px 20px !important;
      border-radius: 8px !important;
      font-size: 14px !important;
      font-weight: 500 !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
    `;
    cancelBtn.textContent = '취소';
    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    const createBtn = Utils.createElement('button');
    createBtn.style.cssText = `
      background: linear-gradient(135deg, #34d399, #10b981) !important;
      color: white !important;
      border: none !important;
      padding: 10px 20px !important;
      border-radius: 8px !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
    `;
    createBtn.textContent = '생성';
    createBtn.addEventListener('click', () => this.createWebhook(modal));

    buttons.appendChild(cancelBtn);
    buttons.appendChild(createBtn);
    modalContent.appendChild(buttons);

    // 모달 생성
    const modal = this.createPremiumModal('새 웹훅 생성', modalContent);
    document.body.appendChild(modal);
  }

  createEventOption(id, title, description, icon, color, checked) {
    const option = Utils.createElement('label');
    option.style.cssText = `
      display: flex !important;
      align-items: flex-start !important;
      gap: 12px !important;
      padding: 16px !important;
      border: 2px solid #e5e7eb !important;
      border-radius: 12px !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
      background: white !important;
    `;

    const checkbox = Utils.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = id;
    checkbox.checked = checked;
    checkbox.style.cssText = `
      width: 18px !important;
      height: 18px !important;
      margin-top: 2px !important;
      cursor: pointer !important;
    `;

    const iconContainer = Utils.createElement('div');
    iconContainer.style.cssText = `
      width: 40px !important;
      height: 40px !important;
      background: ${color}15 !important;
      border-radius: 10px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      color: ${color} !important;
      font-size: 16px !important;
    `;
    iconContainer.innerHTML = `<i class="${icon}"></i>`;

    const textContent = Utils.createElement('div');
    textContent.style.cssText = 'flex: 1 !important;';

    const titleEl = Utils.createElement('div');
    titleEl.style.cssText = `
      font-size: 14px !important;
      font-weight: 600 !important;
      color: #1e293b !important;
      margin-bottom: 4px !important;
    `;
    titleEl.textContent = title;

    const descEl = Utils.createElement('div');
    descEl.style.cssText = `
      font-size: 13px !important;
      color: #64748b !important;
    `;
    descEl.textContent = description;

    textContent.appendChild(titleEl);
    textContent.appendChild(descEl);

    option.appendChild(checkbox);
    option.appendChild(iconContainer);
    option.appendChild(textContent);

    // 호버 및 체크 효과
    const updateStyle = () => {
      if (checkbox.checked) {
        option.style.borderColor = `${color} !important`;
        option.style.background = `${color}05 !important`;
      } else {
        option.style.borderColor = '#e5e7eb !important';
        option.style.background = 'white !important';
      }
    };

    checkbox.addEventListener('change', updateStyle);
    updateStyle();

    option.addEventListener('mouseenter', () => {
      if (!checkbox.checked) {
        option.style.borderColor = '#cbd5e1 !important';
        option.style.background = '#f9fafb !important';
      }
    });

    option.addEventListener('mouseleave', updateStyle);

    return option;
  }

  createWebhook(modal) {
    const name = Utils.$('#webhookName').value;
    const url = Utils.$('#webhookUrl').value;
    
    if (!name.trim() || !url.trim()) {
      Utils.showToast('모든 필드를 입력하세요.', 'warning');
      return;
    }

    // URL 유효성 검사
    try {
      new URL(url);
      if (!url.startsWith('https://')) {
        Utils.showToast('HTTPS URL을 입력하세요.', 'warning');
        return;
      }
    } catch {
      Utils.showToast('유효한 URL을 입력하세요.', 'warning');
      return;
    }

    const events = [];
    if (Utils.$('#eventCommentCreated').checked) events.push('comment.created');
    if (Utils.$('#eventCommentApproved').checked) events.push('comment.approved');
    if (Utils.$('#eventSpamDetected').checked) events.push('spam.detected');

    if (events.length === 0) {
      Utils.showToast('최소 하나의 이벤트를 선택하세요.', 'warning');
      return;
    }

    const newWebhook = {
      id: this.webhooks.length + 1,
      name: name,
      url: url,
      events: events,
      status: 'active',
      created_at: new Date().toISOString(),
      last_triggered: null
    };

    this.webhooks.push(newWebhook);
    document.body.removeChild(modal);
    this.renderCurrentTab();
    Utils.showToast('웹훅이 생성되었습니다.', 'success');
  }

  testWebhook(webhookId) {
    const webhook = this.webhooks.find(w => w.id === webhookId);
    if (!webhook) return;

    Utils.showToast('웹훅 테스트를 전송했습니다.', 'info');
    
    // 마지막 실행 시간 업데이트
    webhook.last_triggered = new Date().toISOString();
    this.renderCurrentTab();
    
    setTimeout(() => {
      Utils.showToast('웹훅 테스트가 성공적으로 완료되었습니다.', 'success');
    }, 2000);
  }

  editWebhook(webhookId) {
    Utils.showToast('웹훅 편집 기능은 곧 제공될 예정입니다.', 'info');
  }

  deleteWebhook(webhookId) {
    if (!confirm('정말로 이 웹훅을 삭제하시겠습니까?')) {
      return;
    }

    this.webhooks = this.webhooks.filter(w => w.id !== webhookId);
    this.renderCurrentTab();
    Utils.showToast('웹훅이 삭제되었습니다.', 'success');
  }

  // 써드파티 서비스 관련 메서드
  connectService(serviceId) {
    const service = this.thirdPartyIntegrations.find(s => s.id === serviceId);
    if (!service) return;

    if (serviceId === 'slack') {
      this.openSlackConfigModal(service);
    } else if (serviceId === 'discord') {
      this.openDiscordConfigModal(service);
    } else if (serviceId === 'email') {
      this.openEmailConfigModal(service);
    }
  }

  openSlackConfigModal(service) {
    // 프리미엄 Slack 설정 모달
    const modalContent = Utils.createElement('div');
    modalContent.style.cssText = `
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      color: #1e293b !important;
      line-height: 1.6 !important;
    `;

    // Slack 웹훅 URL 섹션
    const urlSection = Utils.createElement('div');
    urlSection.style.cssText = 'margin-bottom: 24px !important;';

    const urlLabel = Utils.createElement('label');
    urlLabel.style.cssText = `
      display: block !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      color: #374151 !important;
      margin-bottom: 8px !important;
    `;
    urlLabel.textContent = 'Slack 웹훅 URL';

    const urlInput = Utils.createElement('input');
    urlInput.style.cssText = `
      width: 100% !important;
      padding: 12px 16px !important;
      border: 2px solid #e5e7eb !important;
      border-radius: 12px !important;
      font-size: 14px !important;
      transition: all 0.2s ease !important;
      background: white !important;
      box-sizing: border-box !important;
    `;
    urlInput.type = 'url';
    urlInput.id = 'slackWebhookUrl';
    urlInput.placeholder = 'https://hooks.slack.com/services/...';
    urlInput.value = service.config?.webhook_url || '';

    urlInput.addEventListener('focus', () => {
      urlInput.style.borderColor = '#4285f4 !important';
      urlInput.style.boxShadow = '0 0 0 3px rgba(66, 133, 244, 0.1) !important';
    });
    urlInput.addEventListener('blur', () => {
      urlInput.style.borderColor = '#e5e7eb !important';
      urlInput.style.boxShadow = 'none !important';
    });

    const urlHint = Utils.createElement('div');
    urlHint.style.cssText = `
      font-size: 12px !important;
      color: #6b7280 !important;
      margin-top: 8px !important;
      padding: 12px !important;
      background: #eff6ff !important;
      border-radius: 8px !important;
      border-left: 3px solid #2563eb !important;
    `;
    urlHint.innerHTML = '💡 Slack 앱에서 Incoming Webhooks를 설정하고 URL을 입력하세요. <a href="https://api.slack.com/messaging/webhooks" target="_blank" style="color: #2563eb; text-decoration: underline;">설정 가이드 보기</a>';

    urlSection.appendChild(urlLabel);
    urlSection.appendChild(urlInput);
    urlSection.appendChild(urlHint);

    // 채널 섹션
    const channelSection = Utils.createElement('div');
    channelSection.style.cssText = 'margin-bottom: 24px !important;';

    const channelLabel = Utils.createElement('label');
    channelLabel.style.cssText = `
      display: block !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      color: #374151 !important;
      margin-bottom: 8px !important;
    `;
    channelLabel.textContent = '채널';

    const channelInput = Utils.createElement('input');
    channelInput.style.cssText = `
      width: 100% !important;
      padding: 12px 16px !important;
      border: 2px solid #e5e7eb !important;
      border-radius: 12px !important;
      font-size: 14px !important;
      transition: all 0.2s ease !important;
      background: white !important;
      box-sizing: border-box !important;
    `;
    channelInput.type = 'text';
    channelInput.id = 'slackChannel';
    channelInput.placeholder = '#comments';
    channelInput.value = service.config?.channel || '#comments';

    channelInput.addEventListener('focus', () => {
      channelInput.style.borderColor = '#4285f4 !important';
      channelInput.style.boxShadow = '0 0 0 3px rgba(66, 133, 244, 0.1) !important';
    });
    channelInput.addEventListener('blur', () => {
      channelInput.style.borderColor = '#e5e7eb !important';
      channelInput.style.boxShadow = 'none !important';
    });

    channelSection.appendChild(channelLabel);
    channelSection.appendChild(channelInput);

    modalContent.appendChild(urlSection);
    modalContent.appendChild(channelSection);

    // 모달 버튼들
    const buttons = Utils.createElement('div');
    buttons.style.cssText = `
      display: flex !important;
      justify-content: flex-end !important;
      gap: 12px !important;
      margin-top: 24px !important;
    `;

    const cancelBtn = Utils.createElement('button');
    cancelBtn.style.cssText = `
      background: #f1f5f9 !important;
      color: #475569 !important;
      border: 1px solid #cbd5e1 !important;
      padding: 10px 20px !important;
      border-radius: 8px !important;
      font-size: 14px !important;
      font-weight: 500 !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
    `;
    cancelBtn.textContent = '취소';
    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    const connectBtn = Utils.createElement('button');
    connectBtn.style.cssText = `
      background: linear-gradient(135deg, #4285f4, #1a73e8) !important;
      color: white !important;
      border: none !important;
      padding: 10px 20px !important;
      border-radius: 8px !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
    `;
    connectBtn.textContent = '연결';
    connectBtn.addEventListener('click', () => this.saveSlackConfig(modal, service));

    buttons.appendChild(cancelBtn);
    buttons.appendChild(connectBtn);
    modalContent.appendChild(buttons);

    // 모달 생성
    const modal = this.createPremiumModal('Slack 연동 설정', modalContent);
    document.body.appendChild(modal);
  }

  saveSlackConfig(modal, service) {
    const webhookUrl = Utils.$('#slackWebhookUrl').value;
    const channel = Utils.$('#slackChannel').value;

    if (!webhookUrl.trim()) {
      Utils.showToast('웹훅 URL을 입력하세요.', 'warning');
      return;
    }

    // Slack 웹훅 URL 유효성 검사
    if (!webhookUrl.includes('hooks.slack.com')) {
      Utils.showToast('유효한 Slack 웹훅 URL을 입력하세요.', 'warning');
      return;
    }

    service.status = 'connected';
    service.config = {
      webhook_url: webhookUrl,
      channel: channel || '#comments'
    };

    document.body.removeChild(modal);
    this.renderCurrentTab();
    Utils.showToast('Slack 연동이 완료되었습니다.', 'success');
  }

  openDiscordConfigModal(service) {
    const modalContent = Utils.createElement('div', 'space-y-4');
    modalContent.innerHTML = `
      <div>
        <label class="input-label">Discord 웹훅 URL</label>
        <input type="url" class="input" id="discordWebhookUrl" placeholder="https://discord.com/api/webhooks/...">
        <p class="text-sm text-gray-600 mt-1">
          Discord 채널 설정에서 웹훅을 생성하고 URL을 입력하세요.
        </p>
      </div>
    `;

    const modal = Components.createModal('Discord 연동 설정', modalContent, [
      {
        text: '취소',
        class: 'btn-secondary',
        onclick: () => Components.closeModal(modal)
      },
      {
        text: '연결',
        class: 'btn-primary',
        onclick: () => this.saveDiscordConfig(modal, service)
      }
    ]);

    Components.showModal(modal);
  }

  saveDiscordConfig(modal, service) {
    const webhookUrl = Utils.$('#discordWebhookUrl').value;

    if (!webhookUrl.trim()) {
      Utils.showToast('웹훅 URL을 입력하세요.', 'warning');
      return;
    }

    // Discord 웹훅 URL 유효성 검사
    if (!webhookUrl.includes('discord.com/api/webhooks/')) {
      Utils.showToast('유효한 Discord 웹훅 URL을 입력하세요.', 'warning');
      return;
    }

    service.status = 'connected';
    service.config = {
      webhook_url: webhookUrl
    };

    document.body.removeChild(modal);
    this.renderCurrentTab();
    Utils.showToast('Discord 연동이 완료되었습니다.', 'success');
  }

  openEmailConfigModal(service) {
    const modalContent = Utils.createElement('div', 'space-y-4');
    modalContent.innerHTML = `
      <div>
        <label class="input-label">SMTP 서버</label>
        <input type="text" class="input" id="emailSmtpHost" placeholder="smtp.gmail.com" value="smtp.gmail.com">
      </div>
      
      <div>
        <label class="input-label">포트</label>
        <input type="number" class="input" id="emailSmtpPort" placeholder="587" value="587">
      </div>
      
      <div>
        <label class="input-label">사용자명</label>
        <input type="email" class="input" id="emailUsername" placeholder="your-email@gmail.com">
      </div>
      
      <div>
        <label class="input-label">비밀번호</label>
        <input type="password" class="input" id="emailPassword" placeholder="앱 비밀번호">
      </div>
      
      <div>
        <label class="input-label">수신자 이메일 (쉼표로 구분)</label>
        <input type="text" class="input" id="emailRecipients" placeholder="admin@example.com, manager@example.com">
      </div>
    `;

    const modal = Components.createModal('이메일 알림 설정', modalContent, [
      {
        text: '취소',
        class: 'btn-secondary',
        onclick: () => Components.closeModal(modal)
      },
      {
        text: '연결',
        class: 'btn-primary',
        onclick: () => this.saveEmailConfig(modal, service)
      }
    ]);

    Components.showModal(modal);
  }

  saveEmailConfig(modal, service) {
    const smtpHost = Utils.$('#emailSmtpHost').value;
    const smtpPort = Utils.$('#emailSmtpPort').value;
    const username = Utils.$('#emailUsername').value;
    const password = Utils.$('#emailPassword').value;
    const recipients = Utils.$('#emailRecipients').value;

    if (!smtpHost.trim() || !username.trim() || !password.trim() || !recipients.trim()) {
      Utils.showToast('모든 필드를 입력하세요.', 'warning');
      return;
    }

    // 이메일 유효성 검사
    const emailList = recipients.split(',').map(email => email.trim()).filter(email => email);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emailList.filter(email => !emailRegex.test(email));
    
    if (invalidEmails.length > 0) {
      Utils.showToast(`유효하지 않은 이메일: ${invalidEmails.join(', ')}`, 'warning');
      return;
    }

    service.status = 'connected';
    service.config = {
      smtp_host: smtpHost,
      smtp_port: parseInt(smtpPort) || 587,
      username: username,
      password: password,
      recipients: emailList
    };

    document.body.removeChild(modal);
    this.renderCurrentTab();
    Utils.showToast('이메일 알림 설정이 완료되었습니다.', 'success');
  }

  configureService(serviceId) {
    const service = this.thirdPartyIntegrations.find(s => s.id === serviceId);
    if (!service) return;

    // 기존 설정으로 모달 열기
    if (serviceId === 'slack') {
      this.openSlackConfigModal(service);
    } else if (serviceId === 'discord') {
      this.openDiscordConfigModal(service);
    } else if (serviceId === 'email') {
      this.openEmailConfigModal(service);
    }
  }

  disconnectService(serviceId) {
    if (!confirm('정말로 이 서비스 연동을 해제하시겠습니까?')) {
      return;
    }

    const service = this.thirdPartyIntegrations.find(s => s.id === serviceId);
    if (service) {
      service.status = 'disconnected';
      service.config = null;
      this.renderCurrentTab();
      Utils.showToast(`${service.name} 연동이 해제되었습니다.`, 'success');
    }
  }

  // CSV 내보내기 기능
  exportIntegrationsData() {
    try {
      // API 키 데이터
      const apiKeysData = [
        ['API 키 ID', 'API 키 이름', 'API 키', '권한', '생성일', '마지막 사용', '상태'],
        ...this.apiKeys.map(key => [
          key.id,
          key.name,
          key.key,
          key.permissions.join(', '),
          Utils.formatDateTime(key.created_at),
          key.last_used ? Utils.formatDateTime(key.last_used) : '사용 안함',
          key.status === 'active' ? '활성' : '비활성'
        ])
      ];

      // 웹훅 데이터
      const webhooksData = [
        ['웹훅 ID', '웹훅 이름', 'URL', '이벤트', '생성일', '마지막 실행', '상태'],
        ...this.webhooks.map(webhook => [
          webhook.id,
          webhook.name,
          webhook.url,
          webhook.events.join(', '),
          Utils.formatDateTime(webhook.created_at),
          webhook.last_triggered ? Utils.formatDateTime(webhook.last_triggered) : '실행 안함',
          webhook.status === 'active' ? '활성' : '비활성'
        ])
      ];

      // 써드파티 연동 데이터
      const servicesData = [
        ['서비스 ID', '서비스 이름', '설명', '상태', '설정 정보'],
        ...this.thirdPartyIntegrations.map(service => [
          service.id,
          service.name,
          service.description,
          service.status === 'connected' ? '연결됨' : '연결 안됨',
          service.config ? JSON.stringify(service.config) : 'N/A'
        ])
      ];

      // 통합 CSV 생성
      const allData = [
        ['=== API 키 목록 ==='],
        ...apiKeysData,
        [''],
        ['=== 웹훅 목록 ==='],
        ...webhooksData,
        [''],
        ['=== 써드파티 연동 목록 ==='],
        ...servicesData
      ];

      const csvContent = allData.map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ).join('\n');

      // CSV 파일 다운로드
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `kommentio_integrations_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      Utils.showToast('연동 데이터가 CSV 파일로 내보내졌습니다.', 'success');
    } catch (error) {
      console.error('CSV 내보내기 실패:', error);
      Utils.showToast('CSV 내보내기에 실패했습니다.', 'error');
    }
  }

  // 메모리 누수 방지 및 정리
  destroy() {
    if (this.destroyed) return;
    
    console.log('IntegrationsPage 리소스 정리 시작...');
    
    // 타이머 정리
    this.timers.forEach(timerId => {
      clearTimeout(timerId);
      clearInterval(timerId);
    });
    this.timers.clear();
    
    // 개별 타이머 정리
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = null;
    }
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
      this.updateTimeout = null;
    }
    
    // 이벤트 리스너 정리
    this.eventListeners.forEach((listeners, element) => {
      listeners.forEach(({ event, handler }) => {
        try {
          element.removeEventListener(event, handler);
        } catch (error) {
          console.warn('이벤트 리스너 제거 실패:', error);
        }
      });
    });
    this.eventListeners.clear();
    
    // 캐시 정리
    this.renderCache.clear();
    
    // 상태 초기화
    this.apiKeys = [];
    this.webhooks = [];
    this.thirdPartyIntegrations = [];
    
    this.destroyed = true;
    console.log('IntegrationsPage 리소스 정리 완료');
  }

  // 안전한 이벤트 리스너 추가
  addEventListenerSafe(element, event, handler) {
    if (!element || this.destroyed) return;
    
    element.addEventListener(event, handler);
    
    if (!this.eventListeners.has(element)) {
      this.eventListeners.set(element, []);
    }
    this.eventListeners.get(element).push({ event, handler });
  }

  // 안전한 타이머 설정
  setTimeoutSafe(callback, delay) {
    if (this.destroyed) return null;
    
    const timerId = setTimeout(() => {
      if (!this.destroyed) {
        callback();
      }
      this.timers.delete(timerId);
    }, delay);
    
    this.timers.add(timerId);
    return timerId;
  }

  // 디바운싱된 검색
  debouncedSearch(query, delay = 300) {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    this.searchTimeout = setTimeout(() => {
      if (!this.destroyed) {
        this.performSearch(query);
      }
    }, delay);
  }

  // 검색 실행
  performSearch(query) {
    const lowerQuery = query.toLowerCase();
    
    // API 키 필터링
    const filteredApiKeys = this.apiKeys.filter(key => 
      key.name.toLowerCase().includes(lowerQuery) ||
      key.description.toLowerCase().includes(lowerQuery)
    );
    
    // 웹훅 필터링
    const filteredWebhooks = this.webhooks.filter(webhook =>
      webhook.name.toLowerCase().includes(lowerQuery) ||
      webhook.url.toLowerCase().includes(lowerQuery)
    );
    
    // 써드파티 서비스 필터링
    const filteredServices = this.thirdPartyIntegrations.filter(service =>
      service.name.toLowerCase().includes(lowerQuery) ||
      service.description.toLowerCase().includes(lowerQuery)
    );
    
    // 결과 업데이트 (성능 최적화를 위해 디바운싱)
    this.updateSearchResults(filteredApiKeys, filteredWebhooks, filteredServices);
  }

  // 검색 결과 업데이트 (디바운싱)
  updateSearchResults(apiKeys, webhooks, services) {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
    
    this.updateTimeout = setTimeout(() => {
      if (!this.destroyed) {
        this.renderFilteredResults(apiKeys, webhooks, services);
      }
    }, 50);
  }

  // 필터링된 결과 렌더링
  renderFilteredResults(apiKeys, webhooks, services) {
    // 현재 탭에 따라 해당 결과만 업데이트
    switch (this.currentTab) {
      case 'api-keys':
        this.renderApiKeysList(apiKeys);
        break;
      case 'webhooks':
        this.renderWebhooksList(webhooks);
        break;
      case 'third-party':
        this.renderThirdPartyList(services);
        break;
    }
  }

  // 성능 최적화된 렌더링 (스로틀링)
  throttledRender(renderFunction, ...args) {
    const now = Date.now();
    if (now - this.lastRenderTime < this.renderThrottleMs) {
      return;
    }
    
    this.lastRenderTime = now;
    renderFunction.apply(this, args);
  }

  // 캐시 기반 DOM 생성
  createElementCached(tag, className, innerHTML) {
    const cacheKey = `${tag}-${className}-${innerHTML?.substring(0, 50)}`;
    
    if (this.renderCache.has(cacheKey)) {
      return this.renderCache.get(cacheKey).cloneNode(true);
    }
    
    const element = Utils.createElement(tag, className, innerHTML);
    
    // 캐시 크기 제한 (메모리 사용량 제어)
    if (this.renderCache.size > 100) {
      const firstKey = this.renderCache.keys().next().value;
      this.renderCache.delete(firstKey);
    }
    
    this.renderCache.set(cacheKey, element.cloneNode(true));
    return element;
  }
}

// 전역으로 사용할 수 있도록 export
window.IntegrationsPage = IntegrationsPage;