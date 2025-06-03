// Kommentio Admin Dashboard - Utility Functions

class Utils {
  // DOM 헬퍼
  static $(selector, context = document) {
    return context.querySelector(selector);
  }

  static $$(selector, context = document) {
    return context.querySelectorAll(selector);
  }

  static createElement(tag, className = '', innerHTML = '') {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (innerHTML) element.innerHTML = innerHTML;
    return element;
  }

  // 이벤트 헬퍼
  static on(element, event, handler) {
    if (!element) {
      console.warn('Utils.on: element가 null입니다. 이벤트 리스너를 추가할 수 없습니다.');
      return;
    }
    element.addEventListener(event, handler);
  }

  static off(element, event, handler) {
    element.removeEventListener(event, handler);
  }

  // 데이터 포맷팅
  static formatNumber(num) {
    return new Intl.NumberFormat('ko-KR').format(num);
  }

  static formatDate(date) {
    return new Intl.DateTimeFormat('ko-KR').format(new Date(date));
  }

  static formatDateTime(date) {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }

  // HTTP 요청
  static async request(url, options = {}) {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  }

  // 로컬 스토리지
  static storage = {
    get(key) {
      try {
        return JSON.parse(localStorage.getItem(key));
      } catch {
        return null;
      }
    },
    set(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    },
    remove(key) {
      localStorage.removeItem(key);
    }
  };

  // 디바운스
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // 로딩 상태
  static showLoading(element) {
    element.classList.add('loading');
  }

  static hideLoading(element) {
    element.classList.remove('loading');
  }

  // 알림
  static showNotification(message, type = 'info') {
    // 중복 알림 방지
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
      if (notification.textContent === message) {
        return; // 같은 메시지가 이미 표시 중이면 무시
      }
    });

    const notification = this.createElement('div', `notification notification-${type}`, message);
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, type === 'error' ? 5000 : 3000); // 에러는 조금 더 오래 표시
  }

  // 디버깅 도우미
  static logError(error, context = '') {
    console.group(`🚨 ${context} 오류`);
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    console.error('Context:', context);
    console.groupEnd();
  }
}

// 전역으로 사용할 수 있도록 export
window.Utils = Utils;