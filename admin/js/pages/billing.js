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
    const header = Utils.createElement('div', 'mb-8');
    header.innerHTML = `
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div class="flex items-center space-x-4">
          <div class="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
            <i class="fas fa-credit-card text-white text-2xl"></i>
          </div>
          <div>
            <h1 class="text-3xl font-bold text-gray-900">요금제 및 결제</h1>
            <p class="text-gray-600 mt-1">프리미엄 플랜으로 더 많은 기능을 경험하세요</p>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <div class="hidden lg:flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
            <i class="fas fa-shield-check text-blue-600"></i>
            <span class="text-blue-700 text-sm font-medium">안전한 결제</span>
          </div>
          <button id="download-receipt-btn" class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2 shadow-sm">
            <i class="fas fa-download"></i>
            <span>영수증</span>
          </button>
          <button id="manage-payment-btn" class="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 flex items-center space-x-2 shadow-lg">
            <i class="fas fa-credit-card"></i>
            <span>결제 관리</span>
          </button>
        </div>
      </div>
    `;
    
    // 버튼 이벤트
    const managePaymentBtn = Utils.$('#manage-payment-btn', header);
    const downloadReceiptBtn = Utils.$('#download-receipt-btn', header);
    
    if (managePaymentBtn) Utils.on(managePaymentBtn, 'click', () => this.managePaymentMethod());
    if (downloadReceiptBtn) Utils.on(downloadReceiptBtn, 'click', () => this.downloadReceipt());
    
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
    if (newPlan === this.currentPlan) return;

    const planNames = {
      'free': '무료 플랜',
      'pro': '프로 플랜',
      'enterprise': '엔터프라이즈 플랜'
    };

    if (newPlan === 'enterprise') {
      Utils.showToast('엔터프라이즈 플랜은 문의를 통해 진행됩니다.', 'info');
      return;
    }

    const confirmMessage = newPlan === 'free' ? 
      `정말로 ${planNames[newPlan]}으로 다운그레이드하시겠습니까?` :
      `${planNames[newPlan]}으로 업그레이드하시겠습니까?`;

    if (confirm(confirmMessage)) {
      this.currentPlan = newPlan;
      localStorage.setItem('kommentio-current-plan', newPlan);
      
      Utils.showToast(`${planNames[newPlan]}으로 변경되었습니다.`, 'success');
      
      // 페이지 다시 렌더링
      this.render();
    }
  }

  managePaymentMethod() {
    // Mock 결제 수단 관리 모달
    const modal = Components.createModal('결제 수단 관리', `
      <div class="space-y-4">
        <div class="p-4 border border-gray-200 rounded-lg">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <i class="fas fa-credit-card text-gray-600 mr-3"></i>
              <div>
                <div class="font-medium">Visa **** **** **** 4242</div>
                <div class="text-sm text-gray-600">만료일: 12/25</div>
              </div>
            </div>
            <button class="text-red-600 hover:text-red-500 text-sm">삭제</button>
          </div>
        </div>
        
        <button class="w-full btn btn-outline">
          <i class="fas fa-plus mr-2"></i>새 결제 수단 추가
        </button>
      </div>
    `, [
      { text: '닫기', className: 'btn btn-outline', action: 'close' }
    ]);
    
    Components.showModal(modal);
  }

  downloadReceipt() {
    Utils.showToast('최신 영수증을 다운로드합니다.', 'info');
  }

  downloadInvoice(invoiceId) {
    Utils.showToast(`영수증 ${invoiceId}를 다운로드합니다.`, 'info');
  }
}

// 전역 객체에 등록
window.BillingPage = BillingPage;
window.billingPage = new BillingPage();