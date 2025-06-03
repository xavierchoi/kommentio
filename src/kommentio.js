/**
 * Kommentio - 오픈소스 댓글 위젯
 * 사용법: <div id="kommentio" data-site-id="your-site-id"></div>
 */

class Kommentio {
  constructor(options = {}) {
    this.version = '0.1.1';
    this.options = {
      siteId: null,
      theme: 'light', // 'light' | 'dark' | 'auto'
      language: 'ko',
      maxDepth: 3,
      allowAnonymous: true,
      supabaseUrl: null,
      supabaseKey: null,
      claudeApiKey: null, // 사용자가 제공하는 스팸 필터링용
      
      // 소셜 로그인 프로바이더 설정
      socialProviders: {
        google: { enabled: true, label: 'Google', color: '#4285f4', icon: '🔍' },
        github: { enabled: true, label: 'GitHub', color: '#333', icon: '🐙' },
        facebook: { enabled: true, label: 'Facebook', color: '#1877f2', icon: '📘' },
        twitter: { enabled: true, label: 'X.com', color: '#000', icon: '🐦' },
        apple: { enabled: false, label: 'Apple', color: '#000', icon: '🍎' },
        linkedin: { enabled: false, label: 'LinkedIn', color: '#0077b5', icon: '💼' },
        kakao: { enabled: false, label: '카카오톡', color: '#fee500', icon: '💬' },
        line: { enabled: false, label: 'LINE', color: '#00b900', icon: '💚' }
      },
      
      ...options
    };

    this.container = null;
    this.comments = [];
    this.currentUser = null;
    this.supabase = null;
    
    this.init();
  }

  /**
   * 위젯 초기화
   */
  async init() {
    try {
      await this.loadSupabase();
      this.createContainer();
      this.attachStyles();
      this.render();
      this.attachEventListeners();
      
      console.log(`Kommentio v${this.version} initialized`);
    } catch (error) {
      console.error('Kommentio initialization failed:', error);
    }
  }

  /**
   * Supabase 클라이언트 로드 및 초기화
   */
  async loadSupabase() {
    // Supabase 설정이 없으면 mock 모드로 동작
    if (!this.options.supabaseUrl || !this.options.supabaseKey) {
      console.warn('Supabase configuration not found. Running in mock mode.');
      this.mockMode = true;
      this.initMockData();
      return;
    }

    try {
      // Supabase SDK 동적 로드 (CDN)
      if (!window.supabase) {
        await this.loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
      }

      this.supabase = window.supabase.createClient(
        this.options.supabaseUrl,
        this.options.supabaseKey
      );

      // 현재 사용자 확인
      const { data: { user } } = await this.supabase.auth.getUser();
      this.currentUser = user;
      this.mockMode = false;
    } catch (error) {
      console.warn('Failed to connect to Supabase. Falling back to mock mode.', error);
      this.mockMode = true;
      this.initMockData();
    }
  }

  /**
   * 외부 스크립트 동적 로드
   */
  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * 위젯 컨테이너 생성
   */
  createContainer() {
    // data-kommentio 속성을 가진 요소 찾기
    const target = document.querySelector('[data-kommentio]') || 
                   document.getElementById('kommentio');
    
    if (!target) {
      throw new Error('Kommentio container not found. Add <div data-kommentio></div> to your page.');
    }

    // 사이트 ID 추출
    this.options.siteId = target.dataset.siteId || target.dataset.kommentio || window.location.hostname;
    
    // 컨테이너 설정
    this.container = target;
    this.container.className = 'kommentio-widget';
    this.container.setAttribute('data-theme', this.options.theme);
  }

  /**
   * CSS 스타일 첨부
   */
  attachStyles() {
    if (document.getElementById('kommentio-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'kommentio-styles';
    styles.textContent = this.getStyles();
    document.head.appendChild(styles);
  }

  /**
   * 위젯 CSS 스타일 (Tailwind 기반, 네임스페이스 적용)
   */
  getStyles() {
    return `
      .kommentio-widget {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        max-width: 100%;
        margin: 0 auto;
        --kommentio-bg: #ffffff;
        --kommentio-text: #1f2937;
        --kommentio-border: #e5e7eb;
        --kommentio-primary: #3b82f6;
        --kommentio-secondary: #6b7280;
      }

      .kommentio-widget[data-theme="dark"] {
        --kommentio-bg: #1f2937;
        --kommentio-text: #f9fafb;
        --kommentio-border: #374151;
        --kommentio-primary: #60a5fa;
        --kommentio-secondary: #9ca3af;
      }

      .kommentio-container {
        background: var(--kommentio-bg);
        color: var(--kommentio-text);
        border: 1px solid var(--kommentio-border);
        border-radius: 8px;
        padding: 1.5rem;
      }

      .kommentio-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--kommentio-border);
      }

      .kommentio-title {
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0;
      }

      .kommentio-auth {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        align-items: center;
      }

      .kommentio-social-login {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
      }

      .kommentio-btn {
        padding: 0.5rem 1rem;
        border: 1px solid var(--kommentio-border);
        border-radius: 6px;
        background: var(--kommentio-bg);
        color: var(--kommentio-text);
        cursor: pointer;
        font-size: 0.875rem;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        min-width: fit-content;
      }

      .kommentio-btn:hover {
        background: var(--kommentio-border);
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }

      .kommentio-btn-primary {
        background: var(--kommentio-primary);
        color: white;
        border-color: var(--kommentio-primary);
      }

      /* 소셜 로그인 버튼 스타일 */
      .kommentio-btn-social {
        border: none;
        color: white;
        font-weight: 500;
        padding: 0.625rem 1rem;
      }

      .kommentio-btn-google {
        background: #4285f4;
      }

      .kommentio-btn-github {
        background: #333;
      }

      .kommentio-btn-facebook {
        background: #1877f2;
      }

      .kommentio-btn-twitter {
        background: #000;
      }

      .kommentio-btn-apple {
        background: #000;
      }

      .kommentio-btn-linkedin {
        background: #0077b5;
      }

      .kommentio-btn-kakao {
        background: #fee500;
        color: #000;
      }

      .kommentio-btn-line {
        background: #00b900;
      }

      .kommentio-user-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        color: var(--kommentio-secondary);
      }

      .kommentio-logout-btn {
        padding: 0.25rem 0.75rem;
        font-size: 0.75rem;
        background: transparent;
        border: 1px solid var(--kommentio-border);
        color: var(--kommentio-secondary);
      }

      .kommentio-form {
        margin-bottom: 2rem;
      }

      .kommentio-textarea {
        width: 100%;
        min-height: 100px;
        padding: 0.75rem;
        border: 1px solid var(--kommentio-border);
        border-radius: 6px;
        background: var(--kommentio-bg);
        color: var(--kommentio-text);
        resize: vertical;
        font-family: inherit;
      }

      .kommentio-comments {
        space-y: 1rem;
      }

      .kommentio-comment {
        border: 1px solid var(--kommentio-border);
        border-radius: 6px;
        padding: 1rem;
        margin-bottom: 1rem;
      }

      .kommentio-comment-nested {
        margin-left: 2rem;
        margin-top: 1rem;
      }

      .kommentio-comment-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
      }

      .kommentio-author {
        font-weight: 600;
        color: var(--kommentio-primary);
      }

      .kommentio-timestamp {
        color: var(--kommentio-secondary);
        font-size: 0.875rem;
      }

      .kommentio-content {
        line-height: 1.6;
        margin-bottom: 0.75rem;
      }

      .kommentio-actions {
        display: flex;
        gap: 1rem;
        font-size: 0.875rem;
      }

      .kommentio-action {
        color: var(--kommentio-secondary);
        cursor: pointer;
        transition: color 0.2s;
      }

      .kommentio-action:hover {
        color: var(--kommentio-primary);
      }

      .kommentio-loading {
        text-align: center;
        padding: 2rem;
        color: var(--kommentio-secondary);
      }

      .kommentio-error {
        background: #fef2f2;
        color: #dc2626;
        padding: 1rem;
        border-radius: 6px;
        margin-bottom: 1rem;
      }

      /* 반응형 */
      @media (max-width: 640px) {
        .kommentio-container {
          padding: 1rem;
        }
        
        .kommentio-comment-nested {
          margin-left: 1rem;
        }
      }
    `;
  }

  /**
   * 위젯 렌더링
   */
  render() {
    this.container.innerHTML = `
      <div class="kommentio-container">
        <header class="kommentio-header">
          <h3 class="kommentio-title">댓글</h3>
          <div class="kommentio-auth">
            ${this.renderAuthButtons()}
          </div>
        </header>
        
        ${this.renderCommentForm()}
        
        <div class="kommentio-comments" id="kommentio-comments">
          <div class="kommentio-loading">댓글을 불러오는 중...</div>
        </div>
      </div>
    `;

    // 댓글 로드
    this.loadComments();
  }

  /**
   * 인증 버튼 렌더링
   */
  renderAuthButtons() {
    if (this.currentUser) {
      return `
        <div class="kommentio-user-info">
          <span>안녕하세요, ${this.currentUser.user_metadata?.name || this.currentUser.email}</span>
          <button class="kommentio-btn kommentio-logout-btn" onclick="kommentio.logout()">로그아웃</button>
        </div>
      `;
    }

    // 활성화된 소셜 프로바이더들만 필터링
    const enabledProviders = Object.entries(this.options.socialProviders)
      .filter(([_, config]) => config.enabled);

    if (enabledProviders.length === 0) {
      return '<p class="kommentio-text-secondary">로그인 옵션이 설정되지 않았습니다.</p>';
    }

    const socialButtons = enabledProviders.map(([provider, config]) => {
      return `
        <button 
          class="kommentio-btn kommentio-btn-social kommentio-btn-${provider}" 
          onclick="kommentio.login('${provider}')"
          title="${config.label}로 로그인"
        >
          <span>${config.icon}</span>
          <span>${config.label}</span>
        </button>
      `;
    }).join('');

    return `
      <div class="kommentio-social-login">
        ${socialButtons}
      </div>
    `;
  }

  /**
   * 소셜 프로바이더 설정 업데이트
   */
  updateSocialProviders(providerSettings) {
    Object.assign(this.options.socialProviders, providerSettings);
    this.render(); // UI 즉시 업데이트
  }

  /**
   * 특정 소셜 프로바이더 활성화/비활성화
   */
  toggleSocialProvider(provider, enabled) {
    if (this.options.socialProviders[provider]) {
      this.options.socialProviders[provider].enabled = enabled;
      this.render();
    }
  }

  /**
   * 댓글 작성 폼 렌더링
   */
  renderCommentForm() {
    if (!this.currentUser && !this.options.allowAnonymous) {
      return '<p class="kommentio-text-secondary">댓글을 작성하려면 로그인해주세요.</p>';
    }

    return `
      <form class="kommentio-form" onsubmit="kommentio.handleSubmit(event)">
        <textarea 
          class="kommentio-textarea" 
          placeholder="댓글을 입력하세요..."
          required
        ></textarea>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.75rem;">
          <small class="kommentio-text-secondary">Markdown 문법을 지원합니다.</small>
          <button type="submit" class="kommentio-btn kommentio-btn-primary">댓글 작성</button>
        </div>
      </form>
    `;
  }

  /**
   * Mock 데이터 초기화
   */
  initMockData() {
    this.mockComments = [
      {
        id: 'mock-1',
        site_id: this.options.siteId,
        page_url: window.location.pathname,
        content: 'Kommentio 정말 좋네요! Disqus보다 훨씬 빠르고 깔끔한 것 같아요. 👍',
        parent_id: null,
        depth: 0,
        author_name: '김개발',
        author_email: 'dev@example.com',
        likes_count: 5,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        children: []
      },
      {
        id: 'mock-2',
        site_id: this.options.siteId,
        page_url: window.location.pathname,
        content: '오픈소스라서 더욱 신뢰가 갑니다. 광고도 없고 완전 무료라니 최고예요!',
        parent_id: null,
        depth: 0,
        author_name: '박코더',
        author_email: 'coder@example.com',
        likes_count: 3,
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        children: []
      },
      {
        id: 'mock-3',
        site_id: this.options.siteId,
        page_url: window.location.pathname,
        content: '맞아요! 로딩 속도가 정말 빨라요. React 없이 Vanilla JS로 만든 덕분인 것 같아요.',
        parent_id: 'mock-1',
        depth: 1,
        author_name: '최성능',
        author_email: 'performance@example.com',
        likes_count: 2,
        created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        children: []
      },
      {
        id: 'mock-4',
        site_id: this.options.siteId,
        page_url: window.location.pathname,
        content: '정말 인상적인 프로젝트네요! PRD 명세대로 잘 구현되고 있는 것 같아요. 🚀',
        parent_id: null,
        depth: 0,
        author_name: '프로젝트매니저',
        author_email: 'pm@example.com',
        likes_count: 4,
        created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        children: []
      }
    ];
  }

  /**
   * 댓글 로드
   */
  async loadComments() {
    if (this.mockMode) {
      // Mock 모드에서는 로컬 데이터 사용
      this.comments = this.buildCommentTree(this.mockComments);
      this.renderComments();
      return;
    }

    try {
      const { data: comments, error } = await this.supabase
        .from('comments')
        .select('*')
        .eq('site_id', this.options.siteId)
        .eq('page_url', window.location.pathname)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (error) throw error;

      this.comments = this.buildCommentTree(comments || []);
      this.renderComments();
    } catch (error) {
      console.error('Failed to load comments:', error);
      this.renderError('댓글을 불러오는데 실패했습니다.');
    }
  }

  /**
   * 댓글 트리 구조 생성 (계층형)
   */
  buildCommentTree(comments) {
    const commentMap = {};
    const rootComments = [];

    // 모든 댓글을 맵에 저장
    comments.forEach(comment => {
      comment.children = [];
      commentMap[comment.id] = comment;
    });

    // 부모-자식 관계 설정
    comments.forEach(comment => {
      if (comment.parent_id && commentMap[comment.parent_id]) {
        commentMap[comment.parent_id].children.push(comment);
      } else {
        rootComments.push(comment);
      }
    });

    return rootComments;
  }

  /**
   * 댓글 목록 렌더링
   */
  renderComments() {
    const container = document.getElementById('kommentio-comments');
    
    if (this.comments.length === 0) {
      container.innerHTML = '<p class="kommentio-text-secondary">첫 번째 댓글을 작성해보세요!</p>';
      return;
    }

    container.innerHTML = this.comments.map(comment => this.renderComment(comment)).join('');
  }

  /**
   * 개별 댓글 렌더링 (재귀적으로 답글 포함)
   */
  renderComment(comment, depth = 0) {
    const isNested = depth > 0;
    const canReply = depth < this.options.maxDepth;

    return `
      <div class="kommentio-comment ${isNested ? 'kommentio-comment-nested' : ''}" data-comment-id="${comment.id}">
        <div class="kommentio-comment-header">
          <span class="kommentio-author">${comment.author_name || '익명'}</span>
          <span class="kommentio-timestamp">${this.formatDate(comment.created_at)}</span>
        </div>
        
        <div class="kommentio-content">${this.sanitizeContent(comment.content)}</div>
        
        <div class="kommentio-actions">
          <span class="kommentio-action" onclick="kommentio.likeComment('${comment.id}')">
            👍 ${comment.likes || 0}
          </span>
          ${canReply ? `<span class="kommentio-action" onclick="kommentio.replyTo('${comment.id}')">답글</span>` : ''}
        </div>
        
        ${comment.children.map(child => this.renderComment(child, depth + 1)).join('')}
      </div>
    `;
  }

  /**
   * 날짜 포맷팅
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return '방금 전';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`;
    
    return date.toLocaleDateString('ko-KR');
  }

  /**
   * 컨텐츠 안전화 (XSS 방지)
   */
  sanitizeContent(content) {
    return content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/\n/g, '<br>');
  }

  /**
   * 에러 렌더링
   */
  renderError(message) {
    const container = document.getElementById('kommentio-comments');
    container.innerHTML = `<div class="kommentio-error">${message}</div>`;
  }

  /**
   * 이벤트 리스너 등록
   */
  attachEventListeners() {
    if (this.mockMode) {
      // Mock 모드에서는 실시간 업데이트 시뮬레이션
      this.simulateRealtimeUpdates();
    } else if (this.supabase) {
      // 실제 Supabase Realtime 구독
      this.supabase
        .channel('comments')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'comments',
            filter: `site_id=eq.${this.options.siteId}`
          }, 
          (payload) => {
            console.log('Real-time update:', payload);
            this.loadComments();
          }
        )
        .subscribe();
    }
  }

  /**
   * Mock 모드에서 실시간 업데이트 시뮬레이션
   */
  simulateRealtimeUpdates() {
    // 30초마다 새로운 댓글 추가 (데모용)
    setInterval(() => {
      if (Math.random() > 0.7) { // 30% 확률로 새 댓글
        const randomComments = [
          '실시간 업데이트 테스트입니다! 👋',
          'Mock 모드에서도 실시간 기능이 잘 동작하네요!',
          '새로운 댓글이 자동으로 추가되었습니다.',
          'Kommentio 실시간 업데이트 데모 중...',
          '이 댓글은 30초마다 자동으로 생성됩니다.'
        ];
        
        const randomNames = ['실시간테스터', '자동댓글봇', 'Mock사용자', '데모계정'];
        
        const newComment = {
          id: 'mock-realtime-' + Date.now(),
          site_id: this.options.siteId,
          page_url: window.location.pathname,
          content: randomComments[Math.floor(Math.random() * randomComments.length)],
          parent_id: null,
          depth: 0,
          author_name: randomNames[Math.floor(Math.random() * randomNames.length)],
          author_email: 'realtime@example.com',
          likes_count: Math.floor(Math.random() * 5),
          created_at: new Date().toISOString(),
          children: []
        };
        
        this.mockComments.push(newComment);
        this.comments = this.buildCommentTree(this.mockComments);
        this.renderComments();
        
        // 새 댓글 추가 알림
        this.showNotification('새 댓글이 추가되었습니다! 🔄');
      }
    }, 30000); // 30초
  }

  /**
   * 알림 표시
   */
  showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #3b82f6;
      color: white;
      padding: 12px 16px;
      border-radius: 6px;
      font-size: 14px;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease-out;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // CSS 애니메이션 추가
    if (!document.getElementById('kommentio-notification-styles')) {
      const styles = document.createElement('style');
      styles.id = 'kommentio-notification-styles';
      styles.textContent = `
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(styles);
    }
    
    // 3초 후 자동 제거
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  /**
   * 댓글 작성 핸들러
   */
  async handleSubmit(event) {
    event.preventDefault();
    const textarea = event.target.querySelector('textarea');
    const content = textarea.value.trim();
    
    if (!content) return;

    try {
      await this.createComment(content);
      textarea.value = '';
    } catch (error) {
      console.error('Failed to create comment:', error);
      alert('댓글 작성에 실패했습니다.');
    }
  }

  /**
   * Claude API로 스팸 검사
   */
  async checkSpamWithClaude(content) {
    if (!this.options.claudeApiKey) {
      return { spam_score: 0.0, reason: 'Claude API key not provided', is_spam: false };
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.options.claudeApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 100,
          messages: [{
            role: 'user',
            content: `다음 댓글이 스팸인지 분석해주세요. 0.0(정상)에서 1.0(스팸) 사이의 점수와 간단한 이유를 JSON 형태로 응답해주세요:

댓글: "${content}"

응답 형식:
{
  "spam_score": 0.8,
  "reason": "상업적 링크 포함"
}`
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API 호출 실패: ${response.status}`);
      }

      const result = await response.json();
      const analysis = JSON.parse(result.content[0].text);
      
      return {
        spam_score: analysis.spam_score,
        reason: analysis.reason,
        is_spam: analysis.spam_score > 0.7
      };
    } catch (error) {
      console.warn('Claude API 스팸 검사 실패:', error);
      // API 실패 시 기본값 반환 (댓글은 게시되지만 스팸 점수 없음)
      return {
        spam_score: 0.0,
        reason: 'API 호출 실패',
        is_spam: false
      };
    }
  }

  /**
   * 댓글 생성
   */
  async createComment(content, parentId = null) {
    if (this.mockMode) {
      // Mock 모드에서는 스팸 시뮬레이션
      const mockSpamCheck = Math.random() > 0.9; // 10% 확률로 스팸 감지
      const newComment = {
        id: 'mock-' + Date.now(),
        site_id: this.options.siteId,
        page_url: window.location.pathname,
        content: content,
        parent_id: parentId,
        depth: parentId ? 1 : 0,
        author_name: this.currentUser?.user_metadata?.name || this.currentUser?.email || '익명',
        author_email: this.currentUser?.email || null,
        likes_count: 0,
        spam_score: mockSpamCheck ? 0.8 : 0.1,
        spam_reason: mockSpamCheck ? 'Mock 스팸 감지' : null,
        is_spam: mockSpamCheck,
        created_at: new Date().toISOString(),
        children: []
      };
      
      this.mockComments.push(newComment);
      this.comments = this.buildCommentTree(this.mockComments);
      this.renderComments();
      
      if (mockSpamCheck) {
        this.showNotification('스팸으로 감지된 댓글입니다. 관리자 승인 후 게시됩니다. ⚠️');
      }
      return;
    }

    // 실제 모드에서는 Claude API로 스팸 검사
    let spamData = { spam_score: 0.0, reason: null, is_spam: false };
    
    if (this.options.claudeApiKey) {
      try {
        spamData = await this.checkSpamWithClaude(content);
      } catch (error) {
        console.warn('스팸 검사 중 오류 발생:', error);
      }
    }

    const { error } = await this.supabase
      .from('comments')
      .insert({
        site_id: this.options.siteId,
        page_url: window.location.pathname,
        content: content,
        parent_id: parentId,
        author_id: this.currentUser?.id,
        author_name: this.currentUser?.user_metadata?.name || this.currentUser?.email || '익명',
        author_email: this.currentUser?.email,
        spam_score: spamData.spam_score,
        spam_reason: spamData.reason,
        is_spam: spamData.is_spam,
        is_approved: !spamData.is_spam // 스팸이 아니면 자동 승인
      });

    if (error) throw error;

    // 스팸으로 감지된 경우 알림
    if (spamData.is_spam) {
      this.showNotification('스팸으로 감지된 댓글입니다. 관리자 승인 후 게시됩니다. ⚠️');
    } else {
      this.showNotification('댓글이 성공적으로 게시되었습니다! ✅');
    }
  }

  /**
   * Supabase 프로바이더 매핑
   */
  getSupabaseProvider(provider) {
    const providerMap = {
      'google': 'google',
      'github': 'github', 
      'facebook': 'facebook',
      'twitter': 'twitter',
      'apple': 'apple',
      'linkedin': 'linkedin',
      'kakao': 'kakao',
      'line': 'line'
    };

    return providerMap[provider] || provider;
  }

  /**
   * 프로바이더별 추가 옵션 설정
   */
  getProviderOptions(provider) {
    const baseOptions = {
      redirectTo: window.location.href
    };

    // 프로바이더별 특별 설정
    switch (provider) {
      case 'apple':
        return {
          ...baseOptions,
          scopes: 'name email'
        };
      case 'linkedin':
        return {
          ...baseOptions,
          scopes: 'r_liteprofile r_emailaddress'
        };
      case 'kakao':
        return {
          ...baseOptions,
          scopes: 'profile_nickname profile_image account_email'
        };
      case 'line':
        return {
          ...baseOptions,
          scopes: 'profile openid email'
        };
      default:
        return baseOptions;
    }
  }

  /**
   * 로그인
   */
  async login(provider) {
    const providerConfig = this.options.socialProviders[provider];
    
    if (!providerConfig || !providerConfig.enabled) {
      alert('지원하지 않는 로그인 방식입니다.');
      return;
    }

    if (this.mockMode) {
      // Mock 모드에서는 가짜 사용자 생성
      this.currentUser = {
        id: 'mock-user-' + Date.now(),
        email: `${provider}user@example.com`,
        user_metadata: {
          name: `${providerConfig.label} 사용자`,
          avatar_url: `https://ui-avatars.com/api/?name=${providerConfig.icon}&background=3b82f6&color=fff`,
          provider: provider
        }
      };
      
      this.showNotification(`${providerConfig.label} 로그인 완료! (Mock 모드) 🎉`);
      this.render(); // UI 업데이트
      return;
    }

    try {
      const supabaseProvider = this.getSupabaseProvider(provider);
      const providerOptions = this.getProviderOptions(provider);

      const { error } = await this.supabase.auth.signInWithOAuth({
        provider: supabaseProvider,
        options: providerOptions
      });
      
      if (error) throw error;
      
      this.showNotification(`${providerConfig.label} 로그인 중... 🔄`);
      
    } catch (error) {
      console.error('Login failed:', error);
      
      // 프로바이더별 에러 메시지
      let errorMessage = '로그인에 실패했습니다.';
      if (error.message?.includes('not supported')) {
        errorMessage = `${providerConfig.label} 로그인이 아직 설정되지 않았습니다. 관리자에게 문의하세요.`;
      }
      
      alert(errorMessage);
    }
  }

  /**
   * 로그아웃
   */
  async logout() {
    if (this.mockMode) {
      this.currentUser = null;
      this.render();
      return;
    }

    try {
      await this.supabase.auth.signOut();
      this.currentUser = null;
      this.render();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  /**
   * 댓글 좋아요
   */
  async likeComment(commentId) {
    try {
      // 좋아요 카운트 증가 로직
      const { error } = await this.supabase.rpc('increment_likes', { comment_id: commentId });
      if (error) throw error;
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  }

  /**
   * 답글 작성
   */
  replyTo(commentId) {
    // 답글 UI 표시 로직
    console.log('Reply to comment:', commentId);
    // TODO: 구현 예정
  }
}

// 전역 인스턴스
let kommentio;

// 자동 초기화 (DOM 로드 후)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', autoInit);
} else {
  autoInit();
}

function autoInit() {
  const target = document.querySelector('[data-kommentio]');
  if (target) {
    const options = {
      siteId: target.dataset.siteId,
      theme: target.dataset.theme || 'light',
      language: target.dataset.language || 'ko',
      supabaseUrl: target.dataset.supabaseUrl,
      supabaseKey: target.dataset.supabaseKey,
      claudeApiKey: target.dataset.claudeApiKey
    };
    
    kommentio = new Kommentio(options);
  }
}

// 전역 접근을 위한 window 객체에 추가
window.Kommentio = Kommentio;
window.kommentio = kommentio;