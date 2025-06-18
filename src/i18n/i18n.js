/**
 * Kommentio i18n System - 경량화 국제화 엔진
 * 외부 의존성 없는 순수 자바스크립트 구현
 * 번들 크기: ~3KB, 8개 언어 지원
 */

class KommentioI18n {
  constructor(options = {}) {
    this.currentLanguage = options.defaultLanguage || 'en';
    this.fallbackLanguage = options.fallbackLanguage || 'en';
    this.translations = new Map();
    this.loadedLanguages = new Set();
    
    // 8개 지원 언어 정의
    this.supportedLanguages = ['ko', 'en', 'ja', 'zh', 'es', 'fr', 'de', 'pt'];
    
    // 언어별 표시명
    this.languageNames = {
      ko: '한국어',
      en: 'English', 
      ja: '日本語',
      zh: '中文',
      es: 'Español',
      fr: 'Français',
      de: 'Deutsch',
      pt: 'Português'
    };
    
    // 브라우저 언어 자동 감지
    this.detectBrowserLanguage();
  }

  /**
   * 브라우저 언어 자동 감지
   */
  detectBrowserLanguage() {
    if (typeof navigator !== 'undefined') {
      const browserLang = navigator.language || navigator.userLanguage;
      const langCode = browserLang.split('-')[0]; // 'ko-KR' -> 'ko'
      
      if (this.supportedLanguages.includes(langCode)) {
        this.currentLanguage = langCode;
      }
    }
  }

  /**
   * 언어 번역 데이터 로드 (인라인 JSON)
   */
  loadLanguage(language, translations) {
    if (!this.supportedLanguages.includes(language)) {
      console.warn(`[Kommentio i18n] Unsupported language: ${language}`);
      return false;
    }
    
    this.translations.set(language, translations);
    this.loadedLanguages.add(language);
    return true;
  }

  /**
   * 현재 언어 설정
   */
  setLanguage(language) {
    if (!this.supportedLanguages.includes(language)) {
      console.warn(`[Kommentio i18n] Unsupported language: ${language}`);
      return false;
    }
    
    this.currentLanguage = language;
    return true;
  }

  /**
   * 현재 언어 반환
   */
  getLanguage() {
    return this.currentLanguage;
  }

  /**
   * 지원 언어 목록 반환
   */
  getSupportedLanguages() {
    return [...this.supportedLanguages];
  }

  /**
   * 언어 표시명 반환
   */
  getLanguageName(language) {
    return this.languageNames[language] || language;
  }

  /**
   * 번역 키 경로를 통한 값 추출
   * 예: 'comment.writeComment' -> translations.comment.writeComment
   */
  getValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  /**
   * 문자열 보간 ({{변수}} 형태)
   * 예: "Hello {{name}}" + {name: "World"} -> "Hello World"
   */
  interpolate(template, variables = {}) {
    if (typeof template !== 'string') return template;
    
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables.hasOwnProperty(key) ? variables[key] : match;
    });
  }

  /**
   * 복수형 처리 (간단한 영어/한국어 규칙)
   */
  pluralize(count, key, variables = {}) {
    const translation = this.t(key, { ...variables, count });
    
    // 영어권 복수형 처리
    if (['en', 'de', 'fr', 'es', 'pt'].includes(this.currentLanguage)) {
      if (count === 1) {
        return translation.replace(/\{\{count\}\}\s*(likes?|comments?|items?)/, `${count} ${key.includes('like') ? 'like' : key.includes('comment') ? 'comment' : 'item'}`);
      } else {
        return translation.replace(/\{\{count\}\}\s*(likes?|comments?|items?)/, `${count} ${key.includes('like') ? 'likes' : key.includes('comment') ? 'comments' : 'items'}`);
      }
    }
    
    // 아시아권 언어는 복수형 변화 없음
    return translation;
  }

  /**
   * 메인 번역 함수
   * @param {string} key - 번역 키 (예: 'comment.writeComment')
   * @param {object} variables - 보간 변수 (예: {user: 'John'})
   * @param {string} language - 특정 언어 지정 (선택사항)
   */
  t(key, variables = {}, language = null) {
    const targetLanguage = language || this.currentLanguage;
    let translation = null;

    // 현재 언어에서 번역 찾기
    if (this.translations.has(targetLanguage)) {
      translation = this.getValue(this.translations.get(targetLanguage), key);
    }

    // 번역을 찾지 못했을 경우 fallback 언어 시도
    if (translation === null && targetLanguage !== this.fallbackLanguage) {
      if (this.translations.has(this.fallbackLanguage)) {
        translation = this.getValue(this.translations.get(this.fallbackLanguage), key);
      }
    }

    // 여전히 번역을 찾지 못했을 경우 키 반환
    if (translation === null) {
      console.warn(`[Kommentio i18n] Missing translation: ${key} (${targetLanguage})`);
      return key;
    }

    // 변수 보간
    return this.interpolate(translation, variables);
  }

  /**
   * 시간 관련 번역 (상대 시간)
   */
  timeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    
    if (diffInSeconds < 60) {
      return this.t('comment.timeAgo.justNow');
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return this.t('comment.timeAgo.minutesAgo', { count: minutes });
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return this.t('comment.timeAgo.hoursAgo', { count: hours });
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return this.t('comment.timeAgo.daysAgo', { count: days });
    } else if (diffInSeconds < 2592000) {
      const weeks = Math.floor(diffInSeconds / 604800);
      return this.t('comment.timeAgo.weeksAgo', { count: weeks });
    } else if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return this.t('comment.timeAgo.monthsAgo', { count: months });
    } else {
      const years = Math.floor(diffInSeconds / 31536000);
      return this.t('comment.timeAgo.yearsAgo', { count: years });
    }
  }

  /**
   * RTL 언어 감지
   */
  isRTL(language = null) {
    const lang = language || this.currentLanguage;
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    return rtlLanguages.includes(lang);
  }

  /**
   * 언어 변경 이벤트 리스너
   */
  onLanguageChange(callback) {
    if (typeof callback === 'function') {
      this.languageChangeCallback = callback;
    }
  }

  /**
   * 언어 변경 시 콜백 실행
   */
  notifyLanguageChange(oldLanguage, newLanguage) {
    if (this.languageChangeCallback) {
      this.languageChangeCallback(newLanguage, oldLanguage);
    }
  }
}

// 전역 인스턴스 생성 함수 (Kommentio 위젯용)
function createKommentioI18n(options = {}) {
  return new KommentioI18n(options);
}

// 모듈 exports (Node.js 환경) 및 브라우저 전역 변수
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { KommentioI18n, createKommentioI18n };
} else if (typeof window !== 'undefined') {
  window.KommentioI18n = KommentioI18n;
  window.createKommentioI18n = createKommentioI18n;
}