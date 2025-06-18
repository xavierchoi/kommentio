// Kommentio Admin Dashboard - Utility Functions

class Utils {
  // 성능 최적화: 캐싱 시스템
  static _selectorCache = new Map();
  static _formatCache = new Map();
  static _debounceTimers = new Map();
  
  // 메모리 관리
  static _notificationTimers = new Set();
  static _activeRequests = new Map();
  
  // DOM 헬퍼 (null 안전성 강화)
  static $(selector, context = document) {
    if (!selector || !context) return null;
    
    // 캐싱 키 생성 (context가 document인 경우만)
    const cacheKey = context === document ? `single:${selector}` : null;
    
    if (cacheKey && this._selectorCache.has(cacheKey)) {
      const cached = this._selectorCache.get(cacheKey);
      // DOM에서 제거된 요소는 캐시에서 삭제
      if (cached && document.contains(cached)) {
        return cached;
      } else {
        this._selectorCache.delete(cacheKey);
      }
    }
    
    try {
      const element = context.querySelector(selector);
      
      // 성공적으로 찾은 요소를 캐시 (최대 100개)
      if (cacheKey && element && this._selectorCache.size < 100) {
        this._selectorCache.set(cacheKey, element);
      }
      
      return element;
    } catch (error) {
      console.warn('Utils.$: 잘못된 선택자:', selector, error);
      return null;
    }
  }

  static $$(selector, context = document) {
    if (!selector || !context) return [];
    
    try {
      const nodeList = context.querySelectorAll(selector);
      // NodeList를 배열로 변환하되 성능 최적화
      return nodeList.length > 0 ? Array.from(nodeList) : [];
    } catch (error) {
      console.warn('Utils.$$: 잘못된 선택자:', selector, error);
      return [];
    }
  }

  static createElement(tag, className = '', innerHTML = '') {
    if (!tag) {
      console.warn('Utils.createElement: tag는 필수입니다.');
      return null;
    }
    
    try {
      const element = document.createElement(tag);
      if (className) element.className = className;
      if (innerHTML) {
        // XSS 방지를 위한 기본 검증
        if (typeof innerHTML === 'string' && !innerHTML.includes('<script')) {
          element.innerHTML = innerHTML;
        } else {
          console.warn('Utils.createElement: 잠재적으로 위험한 HTML 감지됨');
          element.textContent = innerHTML;
        }
      }
      return element;
    } catch (error) {
      console.error('Utils.createElement 오류:', error);
      return null;
    }
  }

  // 이벤트 헬퍼 (안전성 강화)
  static on(element, event, selectorOrHandler, handler) {
    if (!element || !event) {
      console.warn('Utils.on: element와 event는 필수입니다.');
      return null;
    }

    let wrappedHandler;
    
    try {
      // 이벤트 델리게이션 지원
      if (typeof selectorOrHandler === 'string' && handler) {
        const selector = selectorOrHandler;
        wrappedHandler = (e) => {
          const target = e.target.closest(selector);
          if (target) {
            try {
              handler.call(target, e);
            } catch (error) {
              console.error('Utils.on: 델리게이션 핸들러 오류:', error);
            }
          }
        };
      } else {
        // 일반 이벤트 리스너
        const actualHandler = selectorOrHandler;
        wrappedHandler = (e) => {
          try {
            actualHandler.call(element, e);
          } catch (error) {
            console.error('Utils.on: 이벤트 핸들러 오류:', error);
          }
        };
      }
      
      element.addEventListener(event, wrappedHandler);
      return wrappedHandler; // 제거를 위해 반환
    } catch (error) {
      console.error('Utils.on: 이벤트 리스너 추가 실패:', error);
      return null;
    }
  }

  static off(element, event, handler) {
    if (!element || !event || !handler) {
      console.warn('Utils.off: 모든 매개변수가 필요합니다.');
      return;
    }
    
    try {
      element.removeEventListener(event, handler);
    } catch (error) {
      console.error('Utils.off: 이벤트 리스너 제거 실패:', error);
    }
  }

  // 데이터 포맷팅 (캐싱 최적화)
  static _numberFormatter = new Intl.NumberFormat('ko-KR');
  static _dateFormatter = new Intl.DateTimeFormat('ko-KR');
  static _dateTimeFormatter = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  static formatNumber(num) {
    if (typeof num !== 'number' && !Number.isFinite(Number(num))) {
      return '0';
    }
    
    const cacheKey = `num:${num}`;
    if (this._formatCache.has(cacheKey)) {
      return this._formatCache.get(cacheKey);
    }
    
    const formatted = this._numberFormatter.format(Number(num));
    
    // 캐시 크기 제한 (최대 200개)
    if (this._formatCache.size < 200) {
      this._formatCache.set(cacheKey, formatted);
    }
    
    return formatted;
  }

  static formatDate(date) {
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return '유효하지 않은 날짜';
      }
      return this._dateFormatter.format(dateObj);
    } catch (error) {
      console.error('Utils.formatDate 오류:', error);
      return '날짜 오류';
    }
  }

  static formatDateTime(date) {
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return '유효하지 않은 날짜';
      }
      return this._dateTimeFormatter.format(dateObj);
    } catch (error) {
      console.error('Utils.formatDateTime 오류:', error);
      return '날짜 오류';
    }
  }

  // HTTP 요청 (중복 요청 방지 및 타임아웃)
  static async request(url, options = {}) {
    if (!url) {
      throw new Error('URL은 필수입니다.');
    }
    
    // 중복 요청 방지
    const requestKey = `${options.method || 'GET'}:${url}:${JSON.stringify(options.body || {})}`;
    
    if (this._activeRequests.has(requestKey)) {
      console.log('중복 요청 감지, 기존 요청 반환:', requestKey);
      return this._activeRequests.get(requestKey);
    }
    
    const requestPromise = this._makeRequest(url, options, requestKey);
    this._activeRequests.set(requestKey, requestPromise);
    
    try {
      const result = await requestPromise;
      return result;
    } finally {
      // 요청 완료 후 활성 요청에서 제거
      this._activeRequests.delete(requestKey);
    }
  }
  
  static async _makeRequest(url, options, requestKey) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || 10000); // 10초 기본 타임아웃
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('요청 시간 초과');
      }
      console.error('Request failed:', requestKey, error);
      throw error;
    }
  }

  // 로컬 스토리지 (안전성 강화)
  static storage = {
    get(key) {
      if (!key) return null;
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch (error) {
        console.warn('localStorage.get 오류:', key, error);
        return null;
      }
    },
    
    set(key, value) {
      if (!key) return false;
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        console.warn('localStorage.set 오류:', key, error);
        // 스토리지 용량 초과 시 오래된 항목 정리 시도
        if (error.name === 'QuotaExceededError') {
          this._cleanupStorage();
          try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
          } catch {
            return false;
          }
        }
        return false;
      }
    },
    
    remove(key) {
      if (!key) return;
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn('localStorage.remove 오류:', key, error);
      }
    },
    
    // 스토리지 정리 (kommentio- 접두사가 있는 항목만)
    _cleanupStorage() {
      try {
        const keys = Object.keys(localStorage);
        const kommentioKeys = keys.filter(key => key.startsWith('kommentio-'));
        
        // 가장 오래된 항목부터 삭제 (최대 5개)
        kommentioKeys.slice(0, 5).forEach(key => {
          localStorage.removeItem(key);
        });
        
        console.log('localStorage 정리 완료:', kommentioKeys.length, '개 항목 중 5개 삭제');
      } catch (error) {
        console.error('localStorage 정리 실패:', error);
      }
    }
  };

  // 디바운스 (메모리 누수 방지)
  static debounce(func, wait, key = null) {
    if (!func || typeof func !== 'function') {
      console.warn('Utils.debounce: func는 함수여야 합니다.');
      return () => {};
    }
    
    return function executedFunction(...args) {
      const context = this;
      const uniqueKey = key || func.toString();
      
      // 기존 타이머 정리
      if (Utils._debounceTimers.has(uniqueKey)) {
        clearTimeout(Utils._debounceTimers.get(uniqueKey));
      }
      
      const timeout = setTimeout(() => {
        Utils._debounceTimers.delete(uniqueKey);
        try {
          func.apply(context, args);
        } catch (error) {
          console.error('Utils.debounce: 함수 실행 오류:', error);
        }
      }, wait);
      
      Utils._debounceTimers.set(uniqueKey, timeout);
    };
  }

  // 로딩 상태
  static showLoading(element) {
    element.classList.add('loading');
  }

  static hideLoading(element) {
    element.classList.remove('loading');
  }

  // 알림 (메모리 누수 방지 및 성능 최적화)
  static showNotification(message, type = 'info') {
    if (!message) return;
    
    // 중복 알림 방지
    const existingNotifications = document.querySelectorAll('.notification');
    for (const notification of existingNotifications) {
      if (notification.textContent === message) {
        return; // 같은 메시지가 이미 표시 중이면 무시
      }
    }
    
    // 최대 알림 개수 제한 (5개)
    if (existingNotifications.length >= 5) {
      const oldest = existingNotifications[0];
      this._removeNotification(oldest);
    }

    const notification = this.createElement('div', `notification notification-${type}`, message);
    if (!notification) return;
    
    document.body.appendChild(notification);
    
    // 즉시 표시
    const showTimer = setTimeout(() => {
      if (notification.parentNode) {
        notification.classList.add('show');
      }
    }, 10);
    this._notificationTimers.add(showTimer);
    
    // 자동 제거
    const hideTimer = setTimeout(() => {
      this._removeNotification(notification);
    }, type === 'error' ? 5000 : 3000);
    this._notificationTimers.add(hideTimer);
    
    // 클릭 시 즉시 제거
    const clickHandler = () => this._removeNotification(notification);
    notification.addEventListener('click', clickHandler);
  }
  
  static _removeNotification(notification) {
    if (!notification || !notification.parentNode) return;
    
    notification.classList.remove('show');
    const removeTimer = setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
    this._notificationTimers.add(removeTimer);
  }

  // 토스트 알림 (showNotification의 별칭)
  static showToast(message, type = 'info') {
    this.showNotification(message, type);
  }

  // 에러 표시
  static showError(container, message) {
    container.innerHTML = `
      <div class="text-center py-8">
        <i class="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
        <div class="text-red-600 text-lg font-medium mb-2">오류가 발생했습니다</div>
        <div class="text-gray-600">${message}</div>
      </div>
    `;
  }

  // 디버깅 도우미 (향상된 에러 로깅)
  static logError(error, context = '') {
    const timestamp = new Date().toISOString();
    const errorInfo = {
      message: error.message || error,
      stack: error.stack,
      context,
      timestamp,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    console.group(`🚨 ${context} 오류 (${timestamp})`);
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    console.error('Context:', context);
    console.error('Full Info:', errorInfo);
    console.groupEnd();
    
    // 개발 모드에서만 에러 정보를 localStorage에 저장
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      try {
        const errorLog = this.storage.get('kommentio-error-log') || [];
        errorLog.push(errorInfo);
        
        // 최대 50개 에러만 보관
        if (errorLog.length > 50) {
          errorLog.splice(0, errorLog.length - 50);
        }
        
        this.storage.set('kommentio-error-log', errorLog);
      } catch (logError) {
        console.warn('에러 로그 저장 실패:', logError);
      }
    }
  }
  
  // 캐시 정리 (메모리 관리)
  static clearCaches() {
    this._selectorCache.clear();
    this._formatCache.clear();
    
    // 타이머 정리
    this._debounceTimers.forEach(timer => clearTimeout(timer));
    this._debounceTimers.clear();
    
    this._notificationTimers.forEach(timer => clearTimeout(timer));
    this._notificationTimers.clear();
    
    // 활성 요청 취소
    this._activeRequests.clear();
    
    console.log('Utils 캐시 정리 완료');
  }
  
  // 성능 모니터링
  static getPerformanceInfo() {
    return {
      selectorCacheSize: this._selectorCache.size,
      formatCacheSize: this._formatCache.size,
      activeDebounceTimers: this._debounceTimers.size,
      activeNotificationTimers: this._notificationTimers.size,
      activeRequests: this._activeRequests.size,
      memoryUsage: performance.memory ? {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576) + 'MB',
        total: Math.round(performance.memory.totalJSHeapSize / 1048576) + 'MB'
      } : 'N/A'
    };
  }
}

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
  Utils.clearCaches();
});

// 전역으로 사용할 수 있도록 export
window.Utils = Utils;