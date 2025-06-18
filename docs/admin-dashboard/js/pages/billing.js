// Kommentio Admin Dashboard - Billing Page

class BillingPage {
  constructor() {
    this.currentPlan = 'free';
    this.billing = {
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      paymentMethod: null,
      billingHistory: []
    };
    this.usage = {
      comments: 0,
      sites: 0,
      apiCalls: 0,
      storage: 0
    };
    
    // 메모리 누수 방지 시스템
    this.eventListeners = new Map();
    this.destroyed = false;
    this.timers = new Set();
    
    // 상태 관리 최적화
    this.planChangeTimeout = null;
    this.usageUpdateInterval = null;
    this.lastPlanChange = 0;
    
    // 결제 정보 캐싱
    this.billingCache = new Map();
    this.lastCacheUpdate = 0;
    this.cacheExpiry = 5 * 60 * 1000; // 5분
    
    // 모달 관리
    this.activeModals = new Set();
    this.modalEventListeners = new Map();
  }

  async render() {
    const container = Utils.$('#page-billing');
    container.innerHTML = '';

    // 페이지 헤더
    const header = this.createPageHeader();
    container.appendChild(header);

    try {
      // 요금제 및 결제 데이터 로드
      await this.loadBillingData();

      // 현재 플랜 섹션
      const currentPlanSection = this.createCurrentPlanSection();
      container.appendChild(currentPlanSection);

      // 요금제 비교 섹션
      const plansSection = this.createPlansSection();
      container.appendChild(plansSection);

      // 사용량 섹션
      const usageSection = this.createUsageSection();
      container.appendChild(usageSection);

      // 결제 내역 섹션
      const historySection = this.createBillingHistorySection();
      container.appendChild(historySection);

    } catch (error) {
      console.error('요금제 페이지 로딩 실패:', error);
      Utils.showError(container, '요금제 정보를 불러오는 중 오류가 발생했습니다.');
    }
  }

  createPageHeader() {
    const header = Utils.createElement('div');
    header.style.cssText = `
      background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%) !important;
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
      background: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M20 20c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") !important;
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
    icon.innerHTML = '<i class="fas fa-credit-card"></i>';

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
    title.textContent = '요금제 & 결제 관리';

    const subtitle = Utils.createElement('p');
    subtitle.style.cssText = `
      font-size: 20px !important;
      margin: 0 !important;
      opacity: 0.9 !important;
      color: rgba(255, 255, 255, 0.9) !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
    `;
    subtitle.textContent = '프리미엄 플랜으로 더 많은 기능을 경험하고 비즈니스를 성장시키세요';

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
    statusBadge.innerHTML = `<span style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%; animation: pulse 2s infinite;"></span>현재 ${this.currentPlan === 'free' ? '무료' : this.currentPlan === 'pro' ? '프로' : '엔터프라이즈'} 플랜 사용 중`;

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

    const planPrice = this.currentPlan === 'free' ? '$0' : this.currentPlan === 'pro' ? '$9.99' : '$29.99';
    const planLimit = this.currentPlan === 'free' ? '1,000' : '무제한';
    const siteLimit = this.currentPlan === 'free' ? '3개' : '무제한';

    const stats = [
      {
        icon: 'fas fa-crown',
        value: planPrice,
        label: '월 요금',
        color: '#fbbf24',
        gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)'
      },
      {
        icon: 'fas fa-comments',
        value: planLimit,
        label: '댓글 한도',
        color: '#34d399',
        gradient: 'linear-gradient(135deg, #34d399, #10b981)'
      },
      {
        icon: 'fas fa-globe',
        value: siteLimit,
        label: '사이트 수',
        color: '#a78bfa',
        gradient: 'linear-gradient(135deg, #a78bfa, #8b5cf6)'
      },
      {
        icon: 'fas fa-shield-check',
        value: '99.9%',
        label: '안정성',
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

      // 안전한 호버 효과
      const hoverEnter = () => {
        if (!this.destroyed) {
          statCard.style.transform = 'translateY(-4px) !important';
          statCard.style.background = 'rgba(255, 255, 255, 0.25) !important';
        }
      };
      
      const hoverLeave = () => {
        if (!this.destroyed) {
          statCard.style.transform = 'translateY(0) !important';
          statCard.style.background = 'rgba(255, 255, 255, 0.15) !important';
        }
      };
      
      this.addEventListenerSafe(statCard, 'mouseenter', hoverEnter);
      this.addEventListenerSafe(statCard, 'mouseleave', hoverLeave);

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

    const downloadReceiptBtn = Utils.createElement('button');
    downloadReceiptBtn.style.cssText = `
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
    downloadReceiptBtn.innerHTML = '<i class="fas fa-download"></i><span>영수증 다운로드</span>';
    this.addEventListenerSafe(downloadReceiptBtn, 'click', () => this.downloadReceipt());
    this.addEventListenerSafe(downloadReceiptBtn, 'mouseenter', () => {
      if (!this.destroyed) {
        downloadReceiptBtn.style.background = 'rgba(255, 255, 255, 0.3) !important';
        downloadReceiptBtn.style.transform = 'translateY(-2px) !important';
      }
    });
    this.addEventListenerSafe(downloadReceiptBtn, 'mouseleave', () => {
      if (!this.destroyed) {
        downloadReceiptBtn.style.background = 'rgba(255, 255, 255, 0.2) !important';
        downloadReceiptBtn.style.transform = 'translateY(0) !important';
      }
    });

    const managePaymentBtn = Utils.createElement('button');
    managePaymentBtn.style.cssText = `
      background: rgba(255, 255, 255, 0.95) !important;
      color: #059669 !important;
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
    managePaymentBtn.innerHTML = '<i class="fas fa-credit-card"></i><span>결제 수단 관리</span>';
    this.addEventListenerSafe(managePaymentBtn, 'click', () => this.managePaymentMethod());
    this.addEventListenerSafe(managePaymentBtn, 'mouseenter', () => {
      if (!this.destroyed) {
        managePaymentBtn.style.transform = 'translateY(-3px) !important';
        managePaymentBtn.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.25) !important';
        managePaymentBtn.style.background = 'white !important';
      }
    });
    this.addEventListenerSafe(managePaymentBtn, 'mouseleave', () => {
      if (!this.destroyed) {
        managePaymentBtn.style.transform = 'translateY(0) !important';
        managePaymentBtn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15) !important';
        managePaymentBtn.style.background = 'rgba(255, 255, 255, 0.95) !important';
      }
    });

    actionsSection.appendChild(downloadReceiptBtn);
    actionsSection.appendChild(managePaymentBtn);

    content.appendChild(titleSection);
    content.appendChild(statsGrid);
    content.appendChild(actionsSection);
    header.appendChild(content);
    
    return header;
  }

  createCurrentPlanSection() {
    const section = Utils.createElement('div', 'bg-white rounded-lg shadow-sm border p-6 mb-6');
    
    const planNames = {
      'free': '무료 플랜',
      'pro': '프로 플랜',
      'enterprise': '엔터프라이즈 플랜'
    };

    const planColors = {
      'free': 'green',
      'pro': 'blue',
      'enterprise': 'purple'
    };

    const color = planColors[this.currentPlan];
    const planName = planNames[this.currentPlan];

    section.innerHTML = `
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">현재 플랜</h2>
          <p class="text-gray-600">현재 사용 중인 요금제 정보입니다</p>
        </div>
        <div class="text-right">
          <div class="inline-flex items-center bg-${color}-100 text-${color}-800 px-3 py-1 rounded-full text-sm font-medium">
            <i class="fas fa-crown mr-2"></i>${planName}
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 플랜 정보 -->
        <div class="lg:col-span-2">
          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="font-medium text-gray-900 mb-3">${planName} 혜택</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${this.getCurrentPlanFeatures()}
            </div>
          </div>
        </div>

        <!-- 결제 정보 -->
        <div>
          <div class="space-y-4">
            <div class="p-4 border border-gray-200 rounded-lg">
              <div class="text-sm text-gray-600 mb-1">월 요금</div>
              <div class="text-2xl font-bold text-gray-900">
                ${this.currentPlan === 'free' ? '무료' : this.currentPlan === 'pro' ? '$9.99' : '$29.99'}
              </div>
            </div>
            
            ${this.currentPlan !== 'free' ? `
              <div class="p-4 border border-gray-200 rounded-lg">
                <div class="text-sm text-gray-600 mb-1">다음 결제일</div>
                <div class="font-medium text-gray-900">
                  ${new Date(this.billing.nextBillingDate).toLocaleDateString('ko-KR')}
                </div>
              </div>
            ` : ''}
            
            <div class="p-4 border border-gray-200 rounded-lg">
              <div class="text-sm text-gray-600 mb-1">결제 수단</div>
              <div class="font-medium text-gray-900">
                ${this.billing.paymentMethod ? 
                  `<i class="fas fa-credit-card mr-2"></i>**** **** **** ${this.billing.paymentMethod.last4}` : 
                  '등록된 결제 수단 없음'
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      ${this.currentPlan === 'free' ? `
        <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div class="flex items-center">
            <i class="fas fa-info-circle text-blue-500 mr-3"></i>
            <div>
              <div class="font-medium text-blue-900">더 많은 기능이 필요하신가요?</div>
              <div class="text-sm text-blue-700">프로 플랜으로 업그레이드하여 무제한 댓글과 고급 기능을 사용해보세요.</div>
            </div>
          </div>
        </div>
      ` : ''}
    `;

    return section;
  }

  getCurrentPlanFeatures() {
    const features = {
      'free': [
        { icon: 'fas fa-comments', text: '월 1,000개 댓글' },
        { icon: 'fas fa-globe', text: '최대 3개 사이트' },
        { icon: 'fas fa-shield-alt', text: '기본 스팸 필터' },
        { icon: 'fas fa-users', text: '소셜 로그인 (3개)' },
        { icon: 'fas fa-envelope', text: '이메일 지원' },
        { icon: 'fas fa-times', text: '고급 통계 (미지원)', disabled: true }
      ],
      'pro': [
        { icon: 'fas fa-comments', text: '무제한 댓글' },
        { icon: 'fas fa-globe', text: '무제한 사이트' },
        { icon: 'fas fa-shield-alt', text: 'AI 스팸 필터' },
        { icon: 'fas fa-users', text: '모든 소셜 로그인' },
        { icon: 'fas fa-chart-line', text: '고급 통계 분석' },
        { icon: 'fas fa-headset', text: '우선 지원' }
      ],
      'enterprise': [
        { icon: 'fas fa-comments', text: '무제한 댓글' },
        { icon: 'fas fa-globe', text: '무제한 사이트' },
        { icon: 'fas fa-shield-alt', text: 'AI 스팸 필터' },
        { icon: 'fas fa-users', text: '모든 소셜 로그인' },
        { icon: 'fas fa-chart-line', text: '고급 통계 분석' },
        { icon: 'fas fa-phone', text: '전화 지원' }
      ]
    };

    return features[this.currentPlan].map(feature => `
      <div class="flex items-center ${feature.disabled ? 'opacity-50' : ''}">
        <i class="${feature.icon} ${feature.disabled ? 'text-gray-400' : 'text-green-500'} mr-2"></i>
        <span class="text-sm ${feature.disabled ? 'text-gray-500' : 'text-gray-700'}">${feature.text}</span>
      </div>
    `).join('');
  }

  createPlansSection() {
    const section = Utils.createElement('div', 'bg-white rounded-lg shadow-sm border p-6 mb-6');
    section.innerHTML = `
      <div class="text-center mb-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-2">요금제 선택</h2>
        <p class="text-gray-600">프로젝트에 맞는 최적의 플랜을 선택하세요</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 무료 플랜 -->
        <div class="border-2 ${this.currentPlan === 'free' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} rounded-lg p-6 relative">
          ${this.currentPlan === 'free' ? '<div class="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-xs rounded-bl-lg rounded-tr-lg">현재 플랜</div>' : ''}
          
          <div class="text-center mb-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-2">무료 플랜</h3>
            <div class="text-3xl font-bold text-gray-900 mb-1">$0</div>
            <div class="text-gray-600 text-sm">영원히 무료</div>
          </div>

          <ul class="space-y-3 mb-6">
            <li class="flex items-center">
              <i class="fas fa-check text-green-500 mr-3"></i>
              <span class="text-sm text-gray-700">월 1,000개 댓글</span>
            </li>
            <li class="flex items-center">
              <i class="fas fa-check text-green-500 mr-3"></i>
              <span class="text-sm text-gray-700">최대 3개 사이트</span>
            </li>
            <li class="flex items-center">
              <i class="fas fa-check text-green-500 mr-3"></i>
              <span class="text-sm text-gray-700">기본 스팸 필터</span>
            </li>
            <li class="flex items-center">
              <i class="fas fa-check text-green-500 mr-3"></i>
              <span class="text-sm text-gray-700">3개 소셜 로그인</span>
            </li>
            <li class="flex items-center">
              <i class="fas fa-check text-green-500 mr-3"></i>
              <span class="text-sm text-gray-700">이메일 지원</span>
            </li>
            <li class="flex items-center">
              <i class="fas fa-times text-gray-400 mr-3"></i>
              <span class="text-sm text-gray-400">고급 통계</span>
            </li>
          </ul>

          <button class="w-full btn ${this.currentPlan === 'free' ? 'btn-outline' : 'btn-primary'}" 
                  ${this.currentPlan === 'free' ? 'disabled' : ''} 
                  onclick="billingPage.changePlan('free')">
            ${this.currentPlan === 'free' ? '현재 플랜' : '무료로 시작하기'}
          </button>
        </div>

        <!-- 프로 플랜 -->
        <div class="border-2 ${this.currentPlan === 'pro' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} rounded-lg p-6 relative">
          ${this.currentPlan === 'pro' ? '<div class="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-xs rounded-bl-lg rounded-tr-lg">현재 플랜</div>' : ''}
          <div class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <span class="bg-blue-500 text-white px-3 py-1 text-xs rounded-full">추천</span>
          </div>
          
          <div class="text-center mb-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-2">프로 플랜</h3>
            <div class="text-3xl font-bold text-gray-900 mb-1">$9.99</div>
            <div class="text-gray-600 text-sm">월 요금</div>
          </div>

          <ul class="space-y-3 mb-6">
            <li class="flex items-center">
              <i class="fas fa-check text-green-500 mr-3"></i>
              <span class="text-sm text-gray-700">무제한 댓글</span>
            </li>
            <li class="flex items-center">
              <i class="fas fa-check text-green-500 mr-3"></i>
              <span class="text-sm text-gray-700">무제한 사이트</span>
            </li>
            <li class="flex items-center">
              <i class="fas fa-check text-green-500 mr-3"></i>
              <span class="text-sm text-gray-700">AI 스팸 필터</span>
            </li>
            <li class="flex items-center">
              <i class="fas fa-check text-green-500 mr-3"></i>
              <span class="text-sm text-gray-700">모든 소셜 로그인</span>
            </li>
            <li class="flex items-center">
              <i class="fas fa-check text-green-500 mr-3"></i>
              <span class="text-sm text-gray-700">고급 통계 분석</span>
            </li>
            <li class="flex items-center">
              <i class="fas fa-check text-green-500 mr-3"></i>
              <span class="text-sm text-gray-700">우선 지원</span>
            </li>
          </ul>

          <button class="w-full btn ${this.currentPlan === 'pro' ? 'btn-outline' : 'btn-primary'}" 
                  ${this.currentPlan === 'pro' ? 'disabled' : ''} 
                  onclick="billingPage.changePlan('pro')">
            ${this.currentPlan === 'pro' ? '현재 플랜' : '프로 플랜 시작'}
          </button>
        </div>

        <!-- 엔터프라이즈 플랜 -->
        <div class="border-2 ${this.currentPlan === 'enterprise' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} rounded-lg p-6 relative">
          ${this.currentPlan === 'enterprise' ? '<div class="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-xs rounded-bl-lg rounded-tr-lg">현재 플랜</div>' : ''}
          
          <div class="text-center mb-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-2">엔터프라이즈</h3>
            <div class="text-3xl font-bold text-gray-900 mb-1">$29.99</div>
            <div class="text-gray-600 text-sm">월 요금</div>
          </div>

          <ul class="space-y-3 mb-6">
            <li class="flex items-center">
              <i class="fas fa-check text-green-500 mr-3"></i>
              <span class="text-sm text-gray-700">프로 플랜의 모든 기능</span>
            </li>
            <li class="flex items-center">
              <i class="fas fa-check text-green-500 mr-3"></i>
              <span class="text-sm text-gray-700">전용 서버</span>
            </li>
            <li class="flex items-center">
              <i class="fas fa-check text-green-500 mr-3"></i>
              <span class="text-sm text-gray-700">커스텀 도메인</span>
            </li>
            <li class="flex items-center">
              <i class="fas fa-check text-green-500 mr-3"></i>
              <span class="text-sm text-gray-700">API 우선 접근</span>
            </li>
            <li class="flex items-center">
              <i class="fas fa-check text-green-500 mr-3"></i>
              <span class="text-sm text-gray-700">전화 지원</span>
            </li>
            <li class="flex items-center">
              <i class="fas fa-check text-green-500 mr-3"></i>
              <span class="text-sm text-gray-700">SLA 보장</span>
            </li>
          </ul>

          <button class="w-full btn ${this.currentPlan === 'enterprise' ? 'btn-outline' : 'btn-primary'}" 
                  ${this.currentPlan === 'enterprise' ? 'disabled' : ''} 
                  onclick="billingPage.changePlan('enterprise')">
            ${this.currentPlan === 'enterprise' ? '현재 플랜' : '문의하기'}
          </button>
        </div>
      </div>

      <div class="mt-8 text-center">
        <p class="text-gray-600 text-sm">
          모든 플랜은 언제든지 변경하거나 취소할 수 있습니다. 
          <a href="#" class="text-blue-600 hover:text-blue-500">자주 묻는 질문</a>을 확인해보세요.
        </p>
      </div>
    `;

    return section;
  }

  createUsageSection() {
    const section = Utils.createElement('div', 'bg-white rounded-lg shadow-sm border p-6 mb-6');
    section.innerHTML = `
      <h2 class="text-xl font-semibold text-gray-900 mb-6">이번 달 사용량</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- 댓글 사용량 -->
        <div class="text-center">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <i class="fas fa-comments text-blue-600 text-xl"></i>
          </div>
          <div class="text-2xl font-bold text-gray-900 mb-1">${this.usage.comments.toLocaleString()}</div>
          <div class="text-sm text-gray-600 mb-2">댓글</div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-blue-600 h-2 rounded-full" style="width: ${this.currentPlan === 'free' ? Math.min(100, (this.usage.comments / 1000) * 100) : 50}%"></div>
          </div>
          <div class="text-xs text-gray-500 mt-1">
            ${this.currentPlan === 'free' ? `${1000 - this.usage.comments}개 남음` : '무제한'}
          </div>
        </div>

        <!-- 사이트 사용량 -->
        <div class="text-center">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <i class="fas fa-globe text-green-600 text-xl"></i>
          </div>
          <div class="text-2xl font-bold text-gray-900 mb-1">${this.usage.sites}</div>
          <div class="text-sm text-gray-600 mb-2">사이트</div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-green-600 h-2 rounded-full" style="width: ${this.currentPlan === 'free' ? (this.usage.sites / 3) * 100 : 30}%"></div>
          </div>
          <div class="text-xs text-gray-500 mt-1">
            ${this.currentPlan === 'free' ? `${3 - this.usage.sites}개 남음` : '무제한'}
          </div>
        </div>

        <!-- API 호출 -->
        <div class="text-center">
          <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <i class="fas fa-exchange-alt text-purple-600 text-xl"></i>
          </div>
          <div class="text-2xl font-bold text-gray-900 mb-1">${this.usage.apiCalls.toLocaleString()}</div>
          <div class="text-sm text-gray-600 mb-2">API 호출</div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-purple-600 h-2 rounded-full" style="width: 65%"></div>
          </div>
          <div class="text-xs text-gray-500 mt-1">
            ${this.currentPlan === 'free' ? '5,000개 남음' : '무제한'}
          </div>
        </div>

        <!-- 저장용량 -->
        <div class="text-center">
          <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <i class="fas fa-database text-yellow-600 text-xl"></i>
          </div>
          <div class="text-2xl font-bold text-gray-900 mb-1">${(this.usage.storage / 1024).toFixed(1)}MB</div>
          <div class="text-sm text-gray-600 mb-2">저장용량</div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-yellow-600 h-2 rounded-full" style="width: 25%"></div>
          </div>
          <div class="text-xs text-gray-500 mt-1">
            ${this.currentPlan === 'free' ? `${((1024 - this.usage.storage) / 1024).toFixed(1)}MB 남음` : '무제한'}
          </div>
        </div>
      </div>

      ${this.currentPlan === 'free' && this.usage.comments > 800 ? `
        <div class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div class="flex items-center">
            <i class="fas fa-exclamation-triangle text-yellow-500 mr-3"></i>
            <div>
              <div class="font-medium text-yellow-900">사용량 한도에 근접했습니다</div>
              <div class="text-sm text-yellow-700">
                이번 달 댓글 사용량이 ${((this.usage.comments / 1000) * 100).toFixed(1)}%입니다. 
                프로 플랜으로 업그레이드하여 무제한으로 사용해보세요.
              </div>
            </div>
          </div>
        </div>
      ` : ''}
    `;

    return section;
  }

  createBillingHistorySection() {
    const section = Utils.createElement('div', 'bg-white rounded-lg shadow-sm border p-6');
    section.innerHTML = `
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">결제 내역</h2>
          <p class="text-gray-600">최근 결제 및 청구 내역을 확인하세요</p>
        </div>
        <button class="btn btn-outline">
          <i class="fas fa-download mr-2"></i>전체 내역 다운로드
        </button>
      </div>

      ${this.currentPlan === 'free' ? `
        <div class="text-center py-8">
          <i class="fas fa-file-invoice text-gray-400 text-4xl mb-4"></i>
          <div class="text-gray-600 mb-2">결제 내역이 없습니다</div>
          <div class="text-sm text-gray-500">무료 플랜을 사용 중입니다</div>
        </div>
      ` : `
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="text-left py-3 px-4 font-medium text-gray-900">날짜</th>
                <th class="text-left py-3 px-4 font-medium text-gray-900">설명</th>
                <th class="text-left py-3 px-4 font-medium text-gray-900">금액</th>
                <th class="text-left py-3 px-4 font-medium text-gray-900">상태</th>
                <th class="text-left py-3 px-4 font-medium text-gray-900">액션</th>
              </tr>
            </thead>
            <tbody>
              ${this.createBillingHistoryRows()}
            </tbody>
          </table>
        </div>
      `}
    `;

    return section;
  }

  createBillingHistoryRows() {
    const mockHistory = [
      {
        date: '2025-06-01',
        description: '프로 플랜 - 6월',
        amount: '$9.99',
        status: 'paid',
        invoice: 'INV-2025-06-001'
      },
      {
        date: '2025-05-01',
        description: '프로 플랜 - 5월',
        amount: '$9.99',
        status: 'paid',
        invoice: 'INV-2025-05-001'
      },
      {
        date: '2025-04-01',
        description: '프로 플랜 - 4월',
        amount: '$9.99',
        status: 'paid',
        invoice: 'INV-2025-04-001'
      }
    ];

    return mockHistory.map(item => `
      <tr class="border-b border-gray-100 hover:bg-gray-50">
        <td class="py-3 px-4 text-sm text-gray-900">
          ${new Date(item.date).toLocaleDateString('ko-KR')}
        </td>
        <td class="py-3 px-4 text-sm text-gray-700">${item.description}</td>
        <td class="py-3 px-4 text-sm font-medium text-gray-900">${item.amount}</td>
        <td class="py-3 px-4">
          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <i class="fas fa-check mr-1"></i>결제완료
          </span>
        </td>
        <td class="py-3 px-4">
          <button class="text-blue-600 hover:text-blue-500 text-sm" onclick="billingPage.downloadInvoice('${item.invoice}')">
            <i class="fas fa-download mr-1"></i>영수증
          </button>
        </td>
      </tr>
    `).join('');
  }

  async loadBillingData() {
    try {
      // Mock 데이터로 요금제 정보 로드
      this.currentPlan = localStorage.getItem('kommentio-current-plan') || 'free';
      this.usage = {
        comments: 847,
        sites: 2,
        apiCalls: 5234,
        storage: 256
      };
      
      this.billing = {
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        paymentMethod: this.currentPlan !== 'free' ? { last4: '4242' } : null,
        billingHistory: []
      };
      
      console.log('요금제 데이터 로드됨:', { plan: this.currentPlan, usage: this.usage });
    } catch (error) {
      console.error('요금제 데이터 로딩 실패:', error);
    }
  }

  changePlan(newPlan) {
    if (newPlan === this.currentPlan || this.destroyed) return;
    
    // 중복 요청 방지
    const now = Date.now();
    if (now - this.lastPlanChange < 1000) {
      console.log('플랜 변경 요청이 너무 빨리 발생했습니다.');
      return;
    }
    this.lastPlanChange = now;

    const planNames = {
      'free': '무료 플랜',
      'pro': '프로 플랜',
      'enterprise': '엔터프라이즈 플랜'
    };

    if (newPlan === 'enterprise') {
      Utils.showToast && Utils.showToast('엔터프라이즈 플랜은 문의를 통해 진행됩니다.', 'info');
      return;
    }

    const confirmMessage = newPlan === 'free' ? 
      `정말로 ${planNames[newPlan]}으로 다운그레이드하시겠습니까?` :
      `${planNames[newPlan]}으로 업그레이드하시겠습니까?`;

    if (confirm(confirmMessage)) {
      // 안전한 플랜 변경 처리
      this.clearTimeout('planChange');
      this.planChangeTimeout = setTimeout(() => {
        if (!this.destroyed) {
          this.currentPlan = newPlan;
          
          try {
            localStorage.setItem('kommentio-current-plan', newPlan);
          } catch (error) {
            console.warn('로컬 스토리지 저장 실패:', error);
          }
          
          // 캐시 무효화
          this.billingCache.clear();
          this.lastCacheUpdate = 0;
          
          Utils.showToast && Utils.showToast(`${planNames[newPlan]}으로 변경되었습니다.`, 'success');
          
          // 페이지 다시 렌더링
          this.render().catch(error => {
            console.error('페이지 렌더링 실패:', error);
          });
        }
      }, 100);
      
      this.timers.add(this.planChangeTimeout);
    }
  }

  managePaymentMethod() {
    // 프리미엄 결제 수단 관리 모달
    const modalContent = Utils.createElement('div');
    modalContent.style.cssText = `
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      color: #1e293b !important;
      line-height: 1.6 !important;
    `;

    // 현재 결제 수단 카드
    const currentCard = Utils.createElement('div');
    currentCard.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      border-radius: 16px !important;
      padding: 24px !important;
      color: white !important;
      position: relative !important;
      overflow: hidden !important;
      margin-bottom: 24px !important;
    `;

    const cardHeader = Utils.createElement('div');
    cardHeader.style.cssText = `
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      margin-bottom: 16px !important;
    `;

    const cardTitle = Utils.createElement('h3');
    cardTitle.style.cssText = `
      font-size: 18px !important;
      font-weight: 600 !important;
      margin: 0 !important;
      color: white !important;
    `;
    cardTitle.textContent = '현재 결제 수단';

    const cardBrand = Utils.createElement('div');
    cardBrand.style.cssText = `
      background: rgba(255, 255, 255, 0.2) !important;
      padding: 4px 12px !important;
      border-radius: 8px !important;
      font-size: 12px !important;
      font-weight: 600 !important;
      text-transform: uppercase !important;
    `;
    cardBrand.textContent = 'Visa';

    const cardInfo = Utils.createElement('div');
    cardInfo.style.cssText = `
      display: flex !important;
      align-items: center !important;
      gap: 16px !important;
    `;

    const cardIcon = Utils.createElement('div');
    cardIcon.style.cssText = `
      width: 48px !important;
      height: 48px !important;
      background: rgba(255, 255, 255, 0.2) !important;
      border-radius: 12px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: 20px !important;
    `;
    cardIcon.innerHTML = '<i class="fas fa-credit-card"></i>';

    const cardDetails = Utils.createElement('div');
    cardDetails.style.cssText = 'flex: 1 !important;';

    const cardNumber = Utils.createElement('div');
    cardNumber.style.cssText = `
      font-size: 16px !important;
      font-weight: 600 !important;
      margin-bottom: 4px !important;
      letter-spacing: 2px !important;
    `;
    cardNumber.textContent = '**** **** **** 4242';

    const cardExpiry = Utils.createElement('div');
    cardExpiry.style.cssText = `
      font-size: 14px !important;
      opacity: 0.8 !important;
    `;
    cardExpiry.textContent = '만료일: 12/25';

    const deleteCardBtn = Utils.createElement('button');
    deleteCardBtn.style.cssText = `
      background: rgba(220, 38, 38, 0.2) !important;
      color: #fecaca !important;
      border: 1px solid rgba(220, 38, 38, 0.3) !important;
      padding: 8px 16px !important;
      border-radius: 8px !important;
      font-size: 12px !important;
      font-weight: 500 !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
    `;
    deleteCardBtn.innerHTML = '<i class="fas fa-trash mr-1"></i>삭제';

    cardDetails.appendChild(cardNumber);
    cardDetails.appendChild(cardExpiry);
    cardInfo.appendChild(cardIcon);
    cardInfo.appendChild(cardDetails);
    cardInfo.appendChild(deleteCardBtn);
    cardHeader.appendChild(cardTitle);
    cardHeader.appendChild(cardBrand);
    currentCard.appendChild(cardHeader);
    currentCard.appendChild(cardInfo);

    // 새 결제 수단 추가 버튼
    const addCardBtn = Utils.createElement('button');
    addCardBtn.style.cssText = `
      width: 100% !important;
      background: #f8fafc !important;
      border: 2px dashed #cbd5e1 !important;
      border-radius: 12px !important;
      padding: 20px !important;
      color: #64748b !important;
      font-size: 14px !important;
      font-weight: 500 !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 8px !important;
    `;
    addCardBtn.innerHTML = '<i class="fas fa-plus"></i><span>새 결제 수단 추가</span>';
    const addCardHoverEnter = () => {
      if (!this.destroyed) {
        addCardBtn.style.background = '#f1f5f9 !important';
        addCardBtn.style.borderColor = '#94a3b8 !important';
        addCardBtn.style.color = '#475569 !important';
      }
    };
    
    const addCardHoverLeave = () => {
      if (!this.destroyed) {
        addCardBtn.style.background = '#f8fafc !important';
        addCardBtn.style.borderColor = '#cbd5e1 !important';
        addCardBtn.style.color = '#64748b !important';
      }
    };
    
    this.addModalEventListener(addCardBtn, 'mouseenter', addCardHoverEnter);
    this.addModalEventListener(addCardBtn, 'mouseleave', addCardHoverLeave);

    modalContent.appendChild(currentCard);
    modalContent.appendChild(addCardBtn);

    // 모달 버튼들
    const buttons = Utils.createElement('div');
    buttons.style.cssText = `
      display: flex !important;
      justify-content: flex-end !important;
      gap: 12px !important;
      margin-top: 24px !important;
    `;

    const closeBtn = Utils.createElement('button');
    closeBtn.style.cssText = `
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
    closeBtn.textContent = '닫기';
    const closeModal = () => this.closeModalSafe(modal);
    this.addModalEventListener(closeBtn, 'click', closeModal);

    buttons.appendChild(closeBtn);
    modalContent.appendChild(buttons);

    // 모달 생성
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
      max-width: 500px !important;
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
    modalTitle.textContent = '결제 수단 관리';

    modalHeader.appendChild(modalTitle);
    modalDialog.appendChild(modalHeader);
    modalDialog.appendChild(modalContent);
    modal.appendChild(modalDialog);

    // 모달 외부 클릭시 닫기
    const outsideClick = (e) => {
      if (e.target === modal && !this.destroyed) {
        this.closeModalSafe(modal);
      }
    };
    this.addModalEventListener(modal, 'click', outsideClick);

    document.body.appendChild(modal);
  }

  downloadReceipt() {
    Utils.showToast('최신 영수증을 다운로드합니다.', 'info');
  }

  downloadInvoice(invoiceId) {
    if (!this.destroyed && Utils.showToast) {
      Utils.showToast(`영수증 ${invoiceId}를 다운로드합니다.`, 'info');
    }
  }
  
  // 메모리 관리 헬퍼 메서드들
  addEventListenerSafe(element, event, handler) {
    if (!element || this.destroyed) return;
    
    const wrappedHandler = (...args) => {
      if (!this.destroyed) {
        try {
          handler(...args);
        } catch (error) {
          console.error('이벤트 핸들러 오류:', error);
        }
      }
    };
    
    element.addEventListener(event, wrappedHandler);
    
    if (!this.eventListeners.has(element)) {
      this.eventListeners.set(element, []);
    }
    this.eventListeners.get(element).push({ event, handler: wrappedHandler });
  }
  
  addModalEventListener(element, event, handler) {
    if (!element || this.destroyed) return;
    
    const wrappedHandler = (...args) => {
      if (!this.destroyed) {
        try {
          handler(...args);
        } catch (error) {
          console.error('모달 이벤트 핸들러 오류:', error);
        }
      }
    };
    
    element.addEventListener(event, wrappedHandler);
    
    if (!this.modalEventListeners.has(element)) {
      this.modalEventListeners.set(element, []);
    }
    this.modalEventListeners.get(element).push({ event, handler: wrappedHandler });
  }
  
  closeModalSafe(modal) {
    if (!modal || !modal.parentNode || this.destroyed) return;
    
    try {
      // 모달 이벤트 리스너 정리
      this.modalEventListeners.forEach((listeners, element) => {
        listeners.forEach(({ event, handler }) => {
          element.removeEventListener(event, handler);
        });
      });
      this.modalEventListeners.clear();
      
      // 활성 모달에서 제거
      this.activeModals.delete(modal);
      
      // DOM에서 제거
      modal.parentNode.removeChild(modal);
      
      // body 스크롤 복원
      if (this.activeModals.size === 0) {
        document.body.style.overflow = '';
      }
    } catch (error) {
      console.error('모달 닫기 오류:', error);
    }
  }
  
  clearTimeout(name) {
    if (this[name + 'Timeout']) {
      clearTimeout(this[name + 'Timeout']);
      this.timers.delete(this[name + 'Timeout']);
      this[name + 'Timeout'] = null;
    }
  }
  
  clearInterval(name) {
    if (this[name + 'Interval']) {
      clearInterval(this[name + 'Interval']);
      this.timers.delete(this[name + 'Interval']);
      this[name + 'Interval'] = null;
    }
  }
  
  destroy() {
    if (this.destroyed) return;
    
    console.log('BillingPage 메모리 정리 시작...');
    this.destroyed = true;
    
    // 타이머 정리
    this.timers.forEach(timer => {
      clearTimeout(timer);
      clearInterval(timer);
    });
    this.timers.clear();
    
    // 이벤트 리스너 정리
    this.eventListeners.forEach((listeners, element) => {
      listeners.forEach(({ event, handler }) => {
        element.removeEventListener(event, handler);
      });
    });
    this.eventListeners.clear();
    
    // 모달 정리
    this.activeModals.forEach(modal => {
      this.closeModalSafe(modal);
    });
    this.activeModals.clear();
    
    // 캐시 정리
    this.billingCache.clear();
    
    console.log('BillingPage 메모리 정리 완료');
  }
}

// 전역 객체에 등록
window.BillingPage = BillingPage;
window.billingPage = new BillingPage();