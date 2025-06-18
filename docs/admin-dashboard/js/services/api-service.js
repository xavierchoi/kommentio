// Kommentio Admin Dashboard - API Service

class AdminAPIService {
  constructor() {
    this.api = null;
    this.initialized = false;
    this.isDemo = false; // 데모 모드 (Supabase 없이 테스트)
    
    // v0.3.4 엔터프라이즈급 최적화: 메모리 관리 시스템
    this.destroyed = false;
    this.eventListeners = new Map();
    this.timers = new Set();
    
    // 요청 캐싱 시스템
    this.requestCache = new Map();
    this.requestTTL = 5 * 60 * 1000; // 5분 TTL
    this.maxCacheSize = 100;
    
    // 중복 요청 방지
    this.pendingRequests = new Map();
    
    // 성능 모니터링
    this.performanceMetrics = {
      requestCount: 0,
      cacheHitCount: 0,
      errorCount: 0,
      averageResponseTime: 0,
      lastRequestTime: 0
    };
    
    // 자동 재시도 설정
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000, // 1초
      maxDelay: 5000 // 5초
    };
    
    // 페이지 언로드 시 정리
    this._trackEventListener(window, 'beforeunload', () => this.destroy());
    
    // 데모 데이터 (메모리 효율성을 위한 lazy loading)
    this._demoDataCache = null;
  }
  
  get demoData() {
    if (!this._demoDataCache) {
      this._demoDataCache = this._createDemoData();
    }
    return this._demoDataCache;
  }
  
  _createDemoData() {
    return {
      sites: [
        {
          id: 1,
          name: '개인 블로그',
          domain: 'myblog.com',
          description: '개인 기술 블로그',
          status: 'active',
          created_at: '2024-01-10T00:00:00Z',
          settings: {
            require_approval: false,
            enable_reactions: true,
            max_comment_length: 1000
          }
        },
        {
          id: 2,
          name: '기술 블로그',
          domain: 'techblog.kr',
          description: '프로그래밍 관련 글',
          status: 'active',
          created_at: '2024-01-12T00:00:00Z',
          settings: {
            require_approval: true,
            enable_reactions: true,
            max_comment_length: 500
          }
        },
        {
          id: 3,
          name: '회사 뉴스',
          domain: 'company-news.com',
          description: '회사 공지사항',
          status: 'inactive',
          created_at: '2024-01-08T00:00:00Z',
          settings: {
            require_approval: true,
            enable_reactions: false,
            max_comment_length: 300
          }
        }
      ],
      comments: [
        {
          id: 1,
          site_id: 1,
          content: '정말 유용한 글이네요! 많이 배웠습니다.',
          author_name: '김철수',
          author_email: 'kim@example.com',
          page_url: 'https://myblog.com/post/1',
          page_title: 'JavaScript 기초',
          is_approved: true,
          is_spam: false,
          spam_score: 0.1,
          created_at: '2024-01-15T14:30:00Z',
          parent_id: null
        },
        {
          id: 2,
          site_id: 2,
          content: '감사합니다. 더 자세한 설명 부탁드립니다.',
          author_name: '이영희',
          author_email: 'lee@example.com',
          page_url: 'https://techblog.kr/react-tutorial',
          page_title: 'React 튜토리얼',
          is_approved: false,
          is_spam: false,
          spam_score: 0.0,
          created_at: '2024-01-15T13:45:00Z',
          parent_id: null
        },
        {
          id: 3,
          site_id: 1,
          content: '스팸 댓글입니다. 클릭하세요! http://spam.com',
          author_name: 'Spammer',
          author_email: 'spam@spam.com',
          page_url: 'https://myblog.com/post/2',
          page_title: 'CSS Flexbox',
          is_approved: false,
          is_spam: true,
          spam_score: 0.9,
          created_at: '2024-01-15T12:20:00Z',
          parent_id: null
        }
      ],
      stats: {
        totalComments: 1247,
        approvedComments: 1098,
        pendingComments: 115,
        spamComments: 34,
        totalSites: 3,
        activeSites: 2,
        totalUsers: 189,
        commentsToday: 28,
        commentsThisWeek: 156,
        commentsThisMonth: 623
      }
    };
  }
  
  // 메모리 누수 방지: 이벤트 리스너 추적
  _trackEventListener(element, event, handler) {
    if (this.destroyed) return null;
    
    const wrappedHandler = (...args) => {
      if (!this.destroyed) {
        try {
          handler(...args);
        } catch (error) {
          console.error('AdminAPIService: 이벤트 핸들러 오류:', error);
        }
      }
    };
    
    element.addEventListener(event, wrappedHandler);
    
    const key = `${element.constructor.name}:${event}:${Date.now()}`;
    this.eventListeners.set(key, { element, event, handler: wrappedHandler });
    
    return wrappedHandler;
  }
  
  // 타이머 추적
  _createTimer(callback, delay, isInterval = false) {
    if (this.destroyed) return null;
    
    const wrappedCallback = () => {
      if (!this.destroyed) {
        try {
          callback();
        } catch (error) {
          console.error('AdminAPIService: 타이머 콜백 오류:', error);
        }
      }
    };
    
    const timerId = isInterval ? setInterval(wrappedCallback, delay) : setTimeout(wrappedCallback, delay);
    this.timers.add(timerId);
    
    return timerId;
  }
  
  // 캐시 관리
  _getCacheKey(method, url, params = {}) {
    return `${method}:${url}:${JSON.stringify(params)}`;
  }
  
  _getCachedData(cacheKey) {
    if (!this.requestCache.has(cacheKey)) return null;
    
    const cached = this.requestCache.get(cacheKey);
    if (Date.now() - cached.timestamp > this.requestTTL) {
      this.requestCache.delete(cacheKey);
      return null;
    }
    
    this.performanceMetrics.cacheHitCount++;
    return cached.data;
  }
  
  _setCachedData(cacheKey, data) {
    // 캐시 크기 제한
    if (this.requestCache.size >= this.maxCacheSize) {
      const oldestKey = this.requestCache.keys().next().value;
      this.requestCache.delete(oldestKey);
    }
    
    this.requestCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }
  
  // 지수 백오프 재시도
  async _requestWithRetry(requestFn, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const startTime = Date.now();
        const result = await requestFn();
        
        // 성능 메트릭 업데이트
        this.performanceMetrics.requestCount++;
        this.performanceMetrics.lastRequestTime = Date.now() - startTime;
        this.performanceMetrics.averageResponseTime = 
          (this.performanceMetrics.averageResponseTime + this.performanceMetrics.lastRequestTime) / 2;
        
        return result;
      } catch (error) {
        lastError = error;
        this.performanceMetrics.errorCount++;
        
        if (attempt < maxRetries) {
          // 네트워크 오류에 대해서만 재시도
          if (error.name === 'TypeError' || error.message.includes('fetch')) {
            const delay = Math.min(
              this.retryConfig.baseDelay * Math.pow(2, attempt),
              this.retryConfig.maxDelay
            );
            
            await new Promise(resolve => {
              this._createTimer(resolve, delay);
            });
            continue;
          }
        }
        
        throw error;
      }
    }
    
    throw lastError;
  }

  /**
   * API 서비스 초기화
   */
  async init(config = {}) {
    if (this.initialized) {
      return this;
    }

    const {
      supabaseUrl = '',
      supabaseKey = '',
      demoMode = !supabaseUrl || !supabaseKey
    } = config;

    this.isDemo = demoMode;

    if (!this.isDemo) {
      try {
        // 실제 Admin API 초기화
        await this.loadAdminAPI();
        this.api = new window.KommentioAdminAPI(supabaseUrl, supabaseKey);
        await this.api.init();
        console.log('Kommentio Admin API 연결 성공');
      } catch (error) {
        console.warn('Admin API 연결 실패, 데모 모드로 전환:', error);
        this.isDemo = true;
      }
    }

    if (this.isDemo) {
      console.log('데모 모드로 실행 중 (Mock 데이터 사용)');
    }

    this.initialized = true;
    return this;
  }

  /**
   * Admin API 스크립트 로드
   */
  async loadAdminAPI() {
    if (window.KommentioAdminAPI) {
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '../src/api/admin-api.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * 지연 시뮬레이션 (실제 API 호출과 유사한 경험)
   */
  async simulateDelay(ms = 50) { // 300ms → 50ms로 단축
    return new Promise(resolve => {
      this._createTimer(resolve, ms);
    });
  }
  
  /**
   * 통합 API 요청 메서드 (캐싱 및 중복 방지)
   */
  async _makeRequest(method, endpoint, params = {}, useCache = true) {
    if (this.destroyed) {
      throw new Error('AdminAPIService가 종료되었습니다.');
    }
    
    const cacheKey = this._getCacheKey(method, endpoint, params);
    
    // 캐시된 데이터 확인
    if (useCache && method === 'GET') {
      const cachedData = this._getCachedData(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }
    
    // 중복 요청 방지
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }
    
    // 요청 실행
    const requestPromise = this._requestWithRetry(async () => {
      if (this.isDemo) {
        // 데모 모드에서의 처리
        await this.simulateDelay();
        return await this._handleDemoRequest(method, endpoint, params);
      } else {
        // 실제 API 호출
        return await this._handleRealRequest(method, endpoint, params);
      }
    });
    
    this.pendingRequests.set(cacheKey, requestPromise);
    
    try {
      const result = await requestPromise;
      
      // 성공한 GET 요청 결과 캐싱
      if (useCache && method === 'GET') {
        this._setCachedData(cacheKey, result);
      }
      
      return result;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }
  
  async _handleDemoRequest(method, endpoint, params) {
    // 데모 모드에서의 요청 처리 로직
    switch (endpoint) {
      case 'sites':
        return method === 'GET' ? this.demoData.sites : this._handleDemoSiteOperation(method, params);
      case 'comments':
        return method === 'GET' ? this._handleDemoCommentQuery(params) : this._handleDemoCommentOperation(method, params);
      case 'stats':
        return this.demoData.stats;
      default:
        throw new Error(`Unknown demo endpoint: ${endpoint}`);
    }
  }
  
  async _handleRealRequest(method, endpoint, params) {
    // 실제 API 호출 로직 (구현 예정)
    throw new Error('Real API not implemented yet');
  }
  
  _handleDemoSiteOperation(method, params) {
    // 데모 모드에서의 사이트 CRUD 작업
    switch (method) {
      case 'POST':
        return this._demoCreateSite(params);
      case 'PUT':
        return this._demoUpdateSite(params);
      case 'DELETE':
        return this._demoDeleteSite(params);
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  }
  
  _handleDemoCommentQuery(params) {
    let comments = this.demoData.comments;
    
    // 사이트 ID 필터링
    if (params.siteId) {
      comments = comments.filter(c => c.site_id === params.siteId);
    }
    
    // 상태 필터링
    if (params.status) {
      switch (params.status) {
        case 'approved':
          comments = comments.filter(c => c.is_approved && !c.is_spam);
          break;
        case 'pending':
          comments = comments.filter(c => !c.is_approved && !c.is_spam);
          break;
        case 'spam':
          comments = comments.filter(c => c.is_spam);
          break;
      }
    }
    
    return {
      comments,
      total: comments.length,
      page: params.page || 1,
      totalPages: Math.ceil(comments.length / (params.limit || 50))
    };
  }
  
  _handleDemoCommentOperation(method, params) {
    // 데모 모드에서의 댓글 CRUD 작업
    switch (method) {
      case 'PUT':
        return this._demoUpdateComment(params);
      case 'DELETE':
        return this._demoDeleteComment(params);
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  }
  
  _demoCreateSite(siteData) {
    const newSite = {
      id: this.demoData.sites.length + 1,
      ...siteData,
      status: 'active',
      created_at: new Date().toISOString(),
      settings: {
        require_approval: false,
        enable_reactions: true,
        max_comment_length: 1000
      }
    };
    this.demoData.sites.push(newSite);
    return newSite;
  }
  
  _demoUpdateSite({ siteId, updates }) {
    const siteIndex = this.demoData.sites.findIndex(s => s.id === siteId);
    if (siteIndex !== -1) {
      this.demoData.sites[siteIndex] = { ...this.demoData.sites[siteIndex], ...updates };
      return this.demoData.sites[siteIndex];
    }
    throw new Error('Site not found');
  }
  
  _demoDeleteSite({ siteId }) {
    const siteIndex = this.demoData.sites.findIndex(s => s.id === siteId);
    if (siteIndex !== -1) {
      this.demoData.sites.splice(siteIndex, 1);
      return { success: true };
    }
    throw new Error('Site not found');
  }
  
  _demoUpdateComment({ commentId, updates }) {
    const comment = this.demoData.comments.find(c => c.id === commentId);
    if (comment) {
      Object.assign(comment, updates);
      return comment;
    }
    throw new Error('Comment not found');
  }
  
  _demoDeleteComment({ commentId }) {
    const commentIndex = this.demoData.comments.findIndex(c => c.id === commentId);
    if (commentIndex !== -1) {
      this.demoData.comments.splice(commentIndex, 1);
      return { success: true };
    }
    throw new Error('Comment not found');
  }

  // === 사이트 관리 ===

  async getSites() {
    return await this._makeRequest('GET', 'sites');
  }

  async createSite(siteData) {
    const result = await this._makeRequest('POST', 'sites', siteData, false);
    // 캐시 무효화
    this._invalidateCache('GET:sites');
    return result;
  }

  async updateSite(siteId, updates) {
    const result = await this._makeRequest('PUT', 'sites', { siteId, updates }, false);
    // 캐시 무효화
    this._invalidateCache('GET:sites');
    return result;
  }

  async deleteSite(siteId) {
    const result = await this._makeRequest('DELETE', 'sites', { siteId }, false);
    // 캐시 무효화
    this._invalidateCache('GET:sites');
    return result;
  }

  // === 댓글 관리 ===

  async getComments(siteId, options = {}) {
    return await this._makeRequest('GET', 'comments', { siteId, ...options });
  }

  async approveComment(commentId) {
    const result = await this._makeRequest('PUT', 'comments', { 
      commentId, 
      updates: { is_approved: true, is_spam: false } 
    }, false);
    this._invalidateCommentsCache();
    return result;
  }

  async rejectComment(commentId) {
    const result = await this._makeRequest('PUT', 'comments', { 
      commentId, 
      updates: { is_approved: false } 
    }, false);
    this._invalidateCommentsCache();
    return result;
  }

  async markAsSpam(commentId) {
    const result = await this._makeRequest('PUT', 'comments', { 
      commentId, 
      updates: { is_spam: true, is_approved: false } 
    }, false);
    this._invalidateCommentsCache();
    return result;
  }

  async deleteComment(commentId) {
    const result = await this._makeRequest('DELETE', 'comments', { commentId }, false);
    this._invalidateCommentsCache();
    return result;
  }

  // === 통계 ===

  async getDashboardStats() {
    return await this._makeRequest('GET', 'stats', {}, true); // 통계는 캐싱 활용
  }

  async getRecentComments(limit = 5) {
    try {
      if (this.isDemo) {
        await this.simulateDelay();
        const recentComments = [...this.demoData.comments]
          .filter(c => !c.is_spam)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, limit)
          .map(comment => {
            const site = this.demoData.sites.find(s => s.id === comment.site_id);
            return {
              ...comment,
              site_name: site?.name || 'Unknown Site',
              site_domain: site?.domain || 'unknown.com'
            };
          });
        
        return recentComments;
      } else {
        // Admin API에 이 메서드가 없다면 댓글을 조회해서 처리
        try {
          const allSites = await this.api.getSites();
          const recentComments = [];
          
          for (const site of allSites.slice(0, 3)) { // 성능을 위해 최근 사이트 3개만
            try {
              const result = await this.api.getComments(site.id, { 
                limit: 10, 
                status: 'all',
                orderBy: 'created_at',
                order: 'desc'
              });
              
              if (result && result.comments) {
                result.comments.forEach(comment => {
                  recentComments.push({
                    ...comment,
                    site_name: site.name,
                    site_domain: site.domain
                  });
                });
              }
            } catch (siteError) {
              console.warn(`사이트 ${site.name}에서 최근 댓글 조회 실패:`, siteError);
            }
          }
          
          return recentComments
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, limit);
        } catch (error) {
          console.error('실제 API에서 최근 댓글 조회 실패:', error);
          return []; // 빈 배열 반환
        }
      }
    } catch (error) {
      console.error('최근 댓글 조회 중 오류:', error);
      return []; // 에러 시 빈 배열 반환
    }
  }

  // === 설정 및 기타 ===

  async getSystemStatus() {
    return await this._makeRequest('GET', 'system-status', {}, false); // 시스템 상태는 캐싱하지 않음
  }
  
  // 캐시 무효화 헬퍼 메서드
  _invalidateCache(pattern) {
    const keysToDelete = [];
    for (const key of this.requestCache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.requestCache.delete(key));
  }
  
  _invalidateCommentsCache() {
    this._invalidateCache('comments');
    this._invalidateCache('stats'); // 통계도 무효화
  }

  // === 유틸리티 메서드 ===

  isInitialized() {
    return this.initialized;
  }

  isDemoMode() {
    return this.isDemo;
  }

  getConnectionStatus() {
    return {
      initialized: this.initialized,
      demoMode: this.isDemo,
      hasRealAPI: !this.isDemo && this.api !== null,
      destroyed: this.destroyed
    };
  }
  
  // 성능 메트릭 조회
  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      cacheSize: this.requestCache.size,
      pendingRequests: this.pendingRequests.size,
      activeTimers: this.timers.size,
      eventListeners: this.eventListeners.size,
      cacheHitRate: this.performanceMetrics.requestCount > 0 ? 
        (this.performanceMetrics.cacheHitCount / this.performanceMetrics.requestCount * 100).toFixed(2) + '%' : '0%'
    };
  }
  
  // 캐시 정리
  clearCache() {
    this.requestCache.clear();
    this.pendingRequests.clear();
    console.log('AdminAPIService: 캐시 정리 완료');
  }
  
  // 메모리 정리 및 해제
  destroy() {
    if (this.destroyed) return;
    
    console.log('AdminAPIService: 리소스 정리 시작...');
    
    // 플래그 설정
    this.destroyed = true;
    
    // 이벤트 리스너 정리
    for (const [key, { element, event, handler }] of this.eventListeners) {
      try {
        element.removeEventListener(event, handler);
      } catch (error) {
        console.warn('AdminAPIService: 이벤트 리스너 정리 실패:', key, error);
      }
    }
    this.eventListeners.clear();
    
    // 타이머 정리
    for (const timerId of this.timers) {
      try {
        clearTimeout(timerId);
        clearInterval(timerId);
      } catch (error) {
        console.warn('AdminAPIService: 타이머 정리 실패:', timerId, error);
      }
    }
    this.timers.clear();
    
    // 캐시 정리
    this.requestCache.clear();
    this.pendingRequests.clear();
    
    // 데모 데이터 캐시 정리
    this._demoDataCache = null;
    
    // API 인스턴스 정리
    if (this.api && typeof this.api.destroy === 'function') {
      try {
        this.api.destroy();
      } catch (error) {
        console.warn('AdminAPIService: API 인스턴스 정리 실패:', error);
      }
    }
    this.api = null;
    
    console.log('AdminAPIService: 리소스 정리 완료');
  }
}

// 전역 인스턴스 생성
window.AdminAPIService = AdminAPIService;