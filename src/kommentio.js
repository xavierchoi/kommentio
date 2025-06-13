/**
 * Kommentio - 오픈소스 댓글 위젯
 * 사용법: <div id="kommentio" data-site-id="your-site-id"></div>
 * 
 * 🔍 ANCHOR_SEARCH: Main Kommentio Widget Class
 * - 핵심 위젯 클래스 정의
 * - 소셜 로그인 프로바이더 설정
 * - 초기화 및 옵션 관리
 */

// 🔍 ANCHOR_SEARCH: Kommentio Class Definition
class Kommentio {
  constructor(options = {}) {
    this.version = '0.2.0';
    this.options = {
      siteId: null,
      theme: 'light', // 'light' | 'dark' | 'auto'
      language: 'ko',
      maxDepth: 3,
      allowAnonymous: true,
      supabaseUrl: null,
      supabaseKey: null,
      claudeApiKey: null, // 사용자가 제공하는 스팸 필터링용
      
      // 소셜 로그인 프로바이더 설정 (SVG 아이콘 기반) - 배치 순서: Google > Apple > GitHub > X > Facebook > LinkedIn > Kakao
      socialProviders: {
        google: { 
          enabled: true, 
          label: 'Google', 
          color: '#ffffff', 
          borderColor: '#dadce0',
          iconColor: '#4285f4',
          textColor: '#3c4043',
          hoverColor: '#f8f9fa'
        },
        apple: { 
          enabled: true, 
          label: 'Apple', 
          color: '#000000', 
          borderColor: '#000000',
          iconColor: '#ffffff',
          textColor: '#ffffff',
          hoverColor: '#333333'
        },
        github: { 
          enabled: true, 
          label: 'GitHub', 
          color: '#24292f', 
          borderColor: '#24292f',
          iconColor: '#ffffff',
          textColor: '#ffffff',
          hoverColor: '#32383f'
        },
        twitter: { 
          enabled: true, 
          label: 'X.com', 
          color: '#000000', 
          borderColor: '#000000',
          iconColor: '#ffffff',
          textColor: '#ffffff',
          hoverColor: '#272c30'
        },
        facebook: { 
          enabled: true, 
          label: 'Facebook', 
          color: '#1877f2', 
          borderColor: '#1877f2',
          iconColor: '#ffffff',
          textColor: '#ffffff',
          hoverColor: '#166fe5'
        },
        linkedin: { 
          enabled: true, 
          label: 'LinkedIn', 
          color: '#0a66c2', 
          borderColor: '#0a66c2',
          iconColor: '#ffffff',
          textColor: '#ffffff',
          hoverColor: '#004182'
        },
        kakao: { 
          enabled: true, 
          label: 'Kakao', 
          color: '#fee500', 
          borderColor: '#fee500',
          iconColor: '#000000',
          textColor: '#000000',
          hoverColor: '#fdd800'
        },
      },
      
      ...options
    };

    this.container = null;
    this.comments = [];
    this.currentUser = null;
    this.supabase = null;
    
    this.init();
  }

  // 🔍 ANCHOR_SEARCH: Widget Initialization
  /**
   * 위젯 초기화
   */
  async init() {
    try {
      // URL Fragment 정리 (OAuth 리다이렉트 후 이중 해시 문제 해결)
      this.cleanupUrlFragment();
      
      await this.loadSupabase();
      this.createContainer();
      this.attachStyles();
      this.render();
      this.attachEventListeners();
      
      // OAuth 콜백 완료 후 추가 처리
      await this.handleOAuthCallback();
      
      console.log(`Kommentio v${this.version} initialized`);
    } catch (error) {
      console.error('Kommentio initialization failed:', error);
    }
  }

  /**
   * URL Fragment 정리 (OAuth 리다이렉트 후 이중 해시 문제 해결)
   */
  cleanupUrlFragment() {
    const currentUrl = window.location.href;
    
    // 이중 해시(##) 문제 해결
    if (currentUrl.includes('##')) {
      const cleanUrl = currentUrl.replace('##', '#');
      console.log('🔧 URL Fragment 정리:', currentUrl, '->', cleanUrl);
      window.history.replaceState(null, '', cleanUrl);
    }
    
    // OAuth 토큰이 있는 경우 5초 후 URL 정리
    if (window.location.hash.includes('access_token=')) {
      console.log('🔑 OAuth 토큰 감지됨. 5초 후 URL을 정리합니다.');
      setTimeout(() => {
        const baseUrl = window.location.href.split('#')[0];
        window.history.replaceState(null, '', baseUrl);
        console.log('✅ URL 정리 완료:', baseUrl);
      }, 5000);
    }
  }

  /**
   * OAuth 콜백 처리 (인증 완료 후 UI 업데이트 보장)
   */
  async handleOAuthCallback() {
    // OAuth 토큰이 URL에 있는지 확인
    const hasOAuthToken = window.location.hash.includes('access_token=') || 
                         window.location.hash.includes('error=');
    
    if (!hasOAuthToken) {
      console.log('📍 OAuth 콜백이 아님. 일반 초기화 진행.');
      return;
    }
    
    console.log('🔄 OAuth 콜백 감지됨. 인증 상태 확인 중...');
    
    // Supabase가 OAuth 토큰을 처리할 시간을 줌
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // 현재 세션 재확인
      const { data: { session }, error } = await this.supabase.auth.getSession();
      
      if (error) {
        console.error('❌ OAuth 세션 확인 실패:', error);
        this.showNotification('로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요. ⚠️');
        return;
      }
      
      if (session?.user) {
        console.log('✅ OAuth 로그인 성공 확인됨:', session.user);
        this.currentUser = session.user;
        
        // 즉시 UI 업데이트
        this.render();
        
        // 성공 알림
        const providerName = session.user.app_metadata?.provider || '소셜';
        const userName = session.user.user_metadata?.name || 
                        session.user.user_metadata?.full_name || 
                        session.user.email;
        
        this.showNotification(`🎉 ${providerName} 로그인 완료! ${userName}님 환영합니다!`);
        
        // 댓글 목록 새로고침 (로그인 상태로)
        await this.loadComments();
        
      } else {
        console.log('❌ OAuth 토큰은 있지만 세션이 없음. 에러 확인 필요.');
        
        // URL에서 에러 정보 추출
        const urlParams = new URLSearchParams(window.location.hash.substring(1));
        const errorCode = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        
        if (errorCode) {
          console.error('OAuth 에러:', errorCode, errorDescription);
          this.showNotification(`로그인 실패: ${errorDescription || errorCode} ❌`);
        } else {
          this.showNotification('로그인을 완료하지 못했습니다. 다시 시도해주세요. ⚠️');
        }
      }
      
    } catch (error) {
      console.error('❌ OAuth 콜백 처리 중 오류:', error);
      this.showNotification('로그인 처리 중 문제가 발생했습니다. 페이지를 새로고침해주세요. 🔄');
    }
  }

  // 🔍 ANCHOR_SEARCH: Social Provider Icons
  /**
   * 소셜 프로바이더 SVG 아이콘 생성
   */
  getSocialProviderIcon(provider, size = 20) {
    const icons = {
      // 배치 순서대로 정렬: Google > Apple > GitHub > X > Facebook > LinkedIn > Kakao
      google: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>`,
      apple: `<svg width="100%" height="100%" viewBox="0 0 56 56" fill="none" style="border-radius: 50%; overflow: hidden;">
        <defs>
          <style>
            .apple-bg-light { fill: #ffffff; }
            .apple-logo-light { fill: #000000; }
            .apple-bg-dark { fill: #000000; }
            .apple-logo-dark { fill: #ffffff; }
            
            /* 라이트 모드 기본 - 검은 배경에 흰 로고 표시 (바뀜) */
            .apple-bg-light { display: none; }
            .apple-logo-light { display: none; }
            .apple-bg-dark { display: block; }
            .apple-logo-dark { display: block; }
            
            /* 다크 모드 시 - 흰 배경에 검은 로고 표시 (바뀜) */
            @media (prefers-color-scheme: dark) {
              .apple-bg-light { display: block; }
              .apple-logo-light { display: block; }
              .apple-bg-dark { display: none; }
              .apple-logo-dark { display: none; }
            }
            
            /* Kommentio 위젯 다크테마 대응 (바뀜) */
            .kommentio-widget[data-theme="dark"] .apple-bg-light { display: block; }
            .kommentio-widget[data-theme="dark"] .apple-logo-light { display: block; }
            .kommentio-widget[data-theme="dark"] .apple-bg-dark { display: none; }
            .kommentio-widget[data-theme="dark"] .apple-logo-dark { display: none; }
            
            .kommentio-widget[data-theme="light"] .apple-bg-light { display: none; }
            .kommentio-widget[data-theme="light"] .apple-logo-light { display: none; }
            .kommentio-widget[data-theme="light"] .apple-bg-dark { display: block; }
            .kommentio-widget[data-theme="light"] .apple-logo-dark { display: block; }
          </style>
          <!-- 원형 마스크 정의 -->
          <mask id="apple-circle-mask">
            <circle cx="28" cy="28" r="28" fill="white"/>
          </mask>
        </defs>
        <!-- 원형 마스크 적용된 그룹 -->
        <g mask="url(#apple-circle-mask)">
          <!-- 라이트 모드용 (흰 배경 + 검은 로고) -->
          <rect class="apple-bg-light" x="0" y="0" width="56" height="56"/>
          <g class="apple-logo-light" transform="translate(28, 28) scale(1.2) translate(-28, -28)">
            <path d="M28.2226562,20.3846154 C29.0546875,20.3846154 30.0976562,19.8048315 30.71875,19.0317864 C31.28125,18.3312142 31.6914062,17.352829 31.6914062,16.3744437 C31.6914062,16.2415766 31.6796875,16.1087095 31.65625,16 C30.7304687,16.0362365 29.6171875,16.640178 28.9492187,17.4494596 C28.421875,18.06548 27.9414062,19.0317864 27.9414062,20.0222505 C27.9414062,20.1671964 27.9648438,20.3121424 27.9765625,20.3604577 C28.0351562,20.3725366 28.1289062,20.3846154 28.2226562,20.3846154 Z M25.2929688,35 C26.4296875,35 26.9335938,34.214876 28.3515625,34.214876 C29.7929688,34.214876 30.109375,34.9758423 31.375,34.9758423 C32.6171875,34.9758423 33.4492188,33.792117 34.234375,32.6325493 C35.1132812,31.3038779 35.4765625,29.9993643 35.5,29.9389701 C35.4179688,29.9148125 33.0390625,28.9122695 33.0390625,26.0979021 C33.0390625,23.6579784 34.9140625,22.5588048 35.0195312,22.474253 C33.7773438,20.6382708 31.890625,20.5899555 31.375,20.5899555 C29.9804688,20.5899555 28.84375,21.4596313 28.1289062,21.4596313 C27.3554688,21.4596313 26.3359375,20.6382708 25.1289062,20.6382708 C22.8320312,20.6382708 20.5,22.5950413 20.5,26.2911634 C20.5,28.5861411 21.3671875,31.013986 22.4335938,32.5842339 C23.3476562,33.9129053 24.1445312,35 25.2929688,35 Z"/>
          </g>
          <!-- 다크 모드용 (검은 배경 + 흰 로고) -->
          <rect class="apple-bg-dark" x="0" y="0" width="56" height="56"/>
          <g class="apple-logo-dark" transform="translate(28, 28) scale(1.2) translate(-28, -28)">
            <path d="M28.2226562,20.3846154 C29.0546875,20.3846154 30.0976562,19.8048315 30.71875,19.0317864 C31.28125,18.3312142 31.6914062,17.352829 31.6914062,16.3744437 C31.6914062,16.2415766 31.6796875,16.1087095 31.65625,16 C30.7304687,16.0362365 29.6171875,16.640178 28.9492187,17.4494596 C28.421875,18.06548 27.9414062,19.0317864 27.9414062,20.0222505 C27.9414062,20.1671964 27.9648438,20.3121424 27.9765625,20.3604577 C28.0351562,20.3725366 28.1289062,20.3846154 28.2226562,20.3846154 Z M25.2929688,35 C26.4296875,35 26.9335938,34.214876 28.3515625,34.214876 C29.7929688,34.214876 30.109375,34.9758423 31.375,34.9758423 C32.6171875,34.9758423 33.4492188,33.792117 34.234375,32.6325493 C35.1132812,31.3038779 35.4765625,29.9993643 35.5,29.9389701 C35.4179688,29.9148125 33.0390625,28.9122695 33.0390625,26.0979021 C33.0390625,23.6579784 34.9140625,22.5588048 35.0195312,22.474253 C33.7773438,20.6382708 31.890625,20.5899555 31.375,20.5899555 C29.9804688,20.5899555 28.84375,21.4596313 28.1289062,21.4596313 C27.3554688,21.4596313 26.3359375,20.6382708 25.1289062,20.6382708 C22.8320312,20.6382708 20.5,22.5950413 20.5,26.2911634 C20.5,28.5861411 21.3671875,31.013986 22.4335938,32.5842339 C23.3476562,33.9129053 24.1445312,35 25.2929688,35 Z"/>
          </g>
        </g>
      </svg>`,
      github: `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0c4.42 0 8 3.58 8 8a8.1 8.1 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"/></svg>`,
      twitter: `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="currentColor"><path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z"/></svg>`,
      facebook: `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="currentColor"><path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/></svg>`,
      linkedin: `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="currentColor"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/></svg>`,
      kakao: `<svg width="100%" height="100%" viewBox="0 0 56 56" fill="none">
        <defs>
          <!-- 원형 마스크 정의 -->
          <mask id="kakao-circle-mask">
            <circle cx="28" cy="28" r="28" fill="white"/>
          </mask>
        </defs>
        
        <!-- 원형 마스크 적용된 그룹 -->
        <g mask="url(#kakao-circle-mask)">
          <!-- 카카오 브랜드 색상 배경 (커브가 들어간 사각형을 원형으로 마스킹) -->
          <path fill="#FFE812" d="M56 36c0 11.046-8.954 20-20 20H20c-11.046 0-20-8.954-20-20V20C0 8.954 8.954 0 20 0h16c11.046 0 20 8.954 20 20v16z"/>
          
          <!-- 카카오톡 말풍선 로고 (텍스트 제거) -->
          <g transform="translate(28, 28) scale(1.3) translate(-16, -16)">
            <path d="M16 6C9.562 6 4 10.713 4 16.5c0 3.779 2.466 7.247 6.248 9.477-0.193 0.549-1.237 3.534-1.081 3.769 0 0-0.027 0.176 0.134 0.243s0.348 0.015 0.348 0.015c0.327-0.046 4.294-2.781 4.994-3.404C15.295 26.685 15.632 26.8 16 26.8c6.438 0 12-4.712 12-10.3S22.438 6 16 6z" fill="#000"/>
          </g>
        </g>
      </svg>`,
    };
    
    return icons[provider] || '';
  }

  // 🔍 ANCHOR_SEARCH: Supabase Integration
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

      // 현재 사용자 확인 (Supabase + 커스텀 로그인)
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      
      console.log('🔍 초기 사용자 확인:', user, userError);
      console.log('🔍 현재 세션 확인:', await this.supabase.auth.getSession());
      
      // 커스텀 로그인 사용자 확인 (카카오, 라인)
      const customUser = localStorage.getItem('kommentio_custom_user');
      
      if (user) {
        this.currentUser = user;
        console.log('✅ Supabase 사용자 로그인 상태:', user);
      } else if (customUser) {
        this.currentUser = JSON.parse(customUser);
        console.log('✅ 커스텀 사용자 로그인 상태:', this.currentUser);
      } else {
        console.log('❌ 로그인된 사용자 없음');
      }
      
      // 인증 상태 변경 리스너 등록
      this.supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('🔄 인증 상태 변경:', event, session);
        console.log('📍 현재 URL:', window.location.href);
        console.log('🔑 세션 정보:', session);
        
        if (event === 'SIGNED_IN' && session?.user) {
          this.currentUser = session.user;
          console.log('✅ 로그인 완료:', session.user);
          console.log('👤 사용자 메타데이터:', session.user.user_metadata);
          
          // UI 즉시 업데이트
          this.render();
          
          // 환영 메시지
          const providerName = session.user.app_metadata?.provider || '';
          const userName = session.user.user_metadata?.name || 
                          session.user.user_metadata?.full_name ||
                          session.user.email;
          
          this.showNotification(`🎉 ${providerName ? providerName + ' ' : ''}로그인 완료! ${userName}님 환영합니다!`);
          
          // 댓글 목록 새로고침 (로그인 사용자 관점으로)
          await this.loadComments();
          
        } else if (event === 'SIGNED_OUT') {
          this.currentUser = null;
          console.log('🚪 로그아웃 완료');
          this.render(); // UI 즉시 업데이트
          this.showNotification('로그아웃되었습니다. 👋');
          
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 토큰 갱신됨:', session);
          // 토큰 갱신 시에도 사용자 정보 업데이트
          if (session?.user) {
            this.currentUser = session.user;
          }
          
        } else {
          console.log('❓ 기타 인증 이벤트:', event, session);
        }
      });
      
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

      /* 🎨 새로운 원형 소셜 로그인 시스템 */
      .kommentio-social-login {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 12px;
        margin-bottom: 1rem;
        max-width: 100%;
        justify-content: center;
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

      .kommentio-btn:focus {
        outline: 2px solid var(--kommentio-primary);
        outline-offset: 2px;
      }

      .kommentio-btn-primary {
        background: var(--kommentio-primary);
        color: white;
        border-color: var(--kommentio-primary);
      }

      /* 🔥 프리미엄 원형 소셜 로그인 버튼 */
      .kommentio-btn-social {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: 1px solid;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        position: relative;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
        min-width: 48px;
        min-height: 48px;
        overflow: hidden;
      }

      /* Apple 아이콘은 전체 크기 + 원형 마스크 (Apple 가이드라인 준수) */
      .kommentio-btn-apple svg {
        /* 스케일링 제거 - Apple 로고가 이제 100% 크기로 원형 마스크 적용됨 */
      }

      .kommentio-btn-social:hover {
        transform: translateY(-2px) scale(1.05);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      }

      .kommentio-btn-social:active {
        transform: translateY(0) scale(0.98);
        transition: transform 0.1s ease;
      }

      .kommentio-btn-social:focus {
        outline: 3px solid var(--kommentio-primary);
        outline-offset: 2px;
      }

      /* Google 브랜딩 가이드라인 준수 */
      .kommentio-btn-google {
        background: #ffffff;
        border-color: #dadce0;
        color: #3c4043;
      }

      .kommentio-btn-google:hover {
        background: #f8f9fa;
        border-color: #dadce0;
        box-shadow: 0 8px 25px rgba(60, 64, 67, 0.15);
      }

      .kommentio-btn-github {
        background: #24292f;
        border-color: #24292f;
        color: #ffffff;
      }

      .kommentio-btn-github:hover {
        background: #32383f;
        border-color: #32383f;
      }

      .kommentio-btn-facebook {
        background: #1877f2;
        border-color: #1877f2;
        color: #ffffff;
      }

      .kommentio-btn-facebook:hover {
        background: #166fe5;
        border-color: #166fe5;
      }

      .kommentio-btn-twitter {
        background: #000000;
        border-color: #000000;
        color: #ffffff;
      }

      .kommentio-btn-twitter:hover {
        background: #272c30;
        border-color: #272c30;
      }

      .kommentio-btn-apple {
        background: #000000;
        border: none;
        color: #ffffff;
      }

      .kommentio-btn-apple:hover {
        background: #1d1d1f;
        border: none;
      }

      .kommentio-btn-linkedin {
        background: #0a66c2;
        border-color: #0a66c2;
        color: #ffffff;
      }

      .kommentio-btn-linkedin:hover {
        background: #004182;
        border-color: #004182;
      }

      .kommentio-btn-kakao {
        background: #fee500;
        border: none;
        color: #000000;
      }

      .kommentio-btn-kakao:hover {
        background: #fdd835;
        border: none;
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
        box-sizing: border-box;
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

      /* 반응형 디자인 - Desktop First 접근법 */
      
      /* 태블릿 최적화 (1024px 이하) */
      @media (max-width: 1024px) {
        .kommentio-header {
          flex-direction: column;
          gap: 1rem;
          align-items: stretch;
        }
        
        /* 태블릿에서 소셜 로그인 최적화 */
        .kommentio-social-login {
          grid-template-columns: repeat(7, 1fr);
          gap: 16px;
          justify-content: center;
          max-width: 100%;
        }
        
        .kommentio-btn-social {
          width: 56px;
          height: 56px;
          min-width: 56px;
          min-height: 56px;
        }
        
        /* 태블릿에서 Apple 아이콘 (원형 마스크 적용으로 스케일링 불필요) */
        .kommentio-btn-apple svg {
          /* 스케일링 제거 - 100% 크기 + 원형 마스크로 처리 */
        }
        
        .kommentio-textarea {
          min-height: 100px;
        }
      }
      
      /* 모바일 최적화 (768px 이하) */
      @media (max-width: 768px) {
        .kommentio-container {
          padding: 1rem;
          border-radius: 8px;
          margin: 0.5rem;
        }
        
        .kommentio-title {
          font-size: 1.125rem;
          margin-bottom: 1rem;
        }
        
        .kommentio-widget {
          font-size: 16px; /* iOS 줌 방지 */
        }
        
        .kommentio-textarea {
          font-size: 16px; /* iOS 줌 방지 */
          min-height: 120px;
          padding: 12px;
        }
        
        .kommentio-comment-nested {
          margin-left: 1rem; /* 모바일에서 중첩 간격 줄임 */
        }
        
        .kommentio-comment-nested .kommentio-comment-nested {
          margin-left: 0.5rem; /* 3단계 중첩 더 줄임 */
        }
        
        .kommentio-author {
          font-size: 0.875rem;
        }
        
        .kommentio-timestamp {
          font-size: 0.75rem;
        }
        
        .kommentio-actions {
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .kommentio-btn-action {
          min-height: 44px;
          min-width: 44px;
          padding: 8px 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        
        .kommentio-notification {
          left: 10px !important;
          right: 10px !important;
          top: 10px !important;
          width: auto !important;
          font-size: 0.875rem;
        }
      }
      
      /* 소형 모바일 (640px 이하) */
      @media (max-width: 640px) {
        .kommentio-container {
          padding: 0.75rem;
          margin: 0.25rem;
        }
        
        /* 모바일에서 소셜 로그인 4열 그리드 */
        .kommentio-social-login {
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          justify-content: center;
          max-width: 100%;
          margin: 0 auto 1rem auto;
        }
        
        .kommentio-btn-social {
          width: 48px;
          height: 48px;
          min-width: 48px;
          min-height: 48px;
          justify-self: center;
        }
        
        /* 모바일에서 Apple 아이콘 (원형 마스크 적용으로 스케일링 불필요) */
        .kommentio-btn-apple svg {
          /* 스케일링 제거 - 100% 크기 + 원형 마스크로 처리 */
        }
        
        .kommentio-comment {
          border-left: none;
          border-right: none;
          border-radius: 0;
          margin-left: -0.75rem;
          margin-right: -0.75rem;
          padding-left: 0.75rem;
          padding-right: 0.75rem;
        }
        
        .kommentio-comment-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.25rem;
        }
        
        .kommentio-form {
          padding: 0.75rem;
        }
        
        .kommentio-form-actions {
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .kommentio-btn {
          width: 100%;
          min-height: 44px;
          justify-content: center;
        }
      }
      
      /* 초소형 모바일 (480px 이하) */
      @media (max-width: 480px) {
        .kommentio-title {
          font-size: 1rem;
        }
        
        .kommentio-comment-nested {
          margin-left: 0.5rem;
        }
        
        .kommentio-comment-nested .kommentio-comment-nested {
          margin-left: 0.25rem;
        }
        
        .kommentio-author {
          font-size: 0.8125rem;
        }
        
        .kommentio-timestamp {
          font-size: 0.6875rem;
        }
        
        .kommentio-textarea {
          min-height: 100px;
          padding: 10px;
        }
      }
      
      /* 터치 친화적 인터페이스 */
      @media (hover: none) and (pointer: coarse) {
        .kommentio-btn:hover {
          transform: none; /* 터치 디바이스에서 호버 효과 제거 */
        }
        
        .kommentio-btn:active {
          transform: scale(0.98);
          transition: transform 0.1s ease;
        }
        
        /* 소셜 버튼 터치 최적화 */
        .kommentio-btn-social:hover {
          transform: none;
          box-shadow: none;
        }
        
        .kommentio-btn-social:active {
          transform: scale(0.95);
          transition: transform 0.1s ease;
        }
        
        .kommentio-comment-actions button:hover {
          background: transparent;
        }
        
        .kommentio-comment-actions button:active {
          background: var(--kommentio-bg-secondary);
          border-radius: 4px;
        }
      }
      
      /* 가로 모드 최적화 */
      @media (max-height: 500px) and (orientation: landscape) {
        .kommentio-container {
          padding: 0.5rem;
        }
        
        .kommentio-textarea {
          min-height: 80px;
        }
        
        .kommentio-title {
          font-size: 1rem;
          margin-bottom: 0.5rem;
        }
      }
    `;
  }

  /**
   * 위젯 렌더링
   */
  // 🔍 ANCHOR_SEARCH: Main Render Function
  render() {
    // 컨테이너가 존재하지 않는 경우 조기 반환
    if (!this.container) {
      console.error('Kommentio container not found');
      return;
    }

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

  // 🔍 ANCHOR_SEARCH: Auth Buttons Rendering
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
      .filter(([, config]) => config.enabled);

    if (enabledProviders.length === 0) {
      return '<p class="kommentio-text-secondary">로그인 옵션이 설정되지 않았습니다.</p>';
    }

    const socialButtons = enabledProviders.map(([provider, config], index) => {
      return `
        <button 
          class="kommentio-btn kommentio-btn-social kommentio-btn-${provider}" 
          onclick="kommentio.login('${provider}')"
          title="${config.label}로 로그인"
          aria-label="${config.label}로 로그인"
          tabindex="${index === 0 ? '0' : '-1'}"
          role="button"
        >
          ${this.getSocialProviderIcon(provider, 24)}
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
          <small class="kommentio-text-secondary">Markdown 문법을 지원합니다. • Ctrl+Enter로 빠른 등록</small>
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

  // 🔍 ANCHOR_SEARCH: Load Comments Function
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
    
    // DOM 요소가 존재하지 않는 경우 조기 반환
    if (!container) {
      console.warn('kommentio-comments container not found');
      return;
    }
    
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
    if (!container) {
      console.error('kommentio-comments container not found for error display');
      return;
    }
    container.innerHTML = `<div class="kommentio-error">${message}</div>`;
  }

  /**
   * 이벤트 리스너 등록
   */
  attachEventListeners() {
    // 키보드 네비게이션 지원
    this.container.addEventListener('keydown', (e) => {
      // Tab 키로 소셜 로그인 버튼 간 이동
      if (e.key === 'Tab') {
        this.handleTabNavigation(e);
      }
      
      // Enter 키 또는 Space 키로 버튼 활성화
      if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('kommentio-btn-social')) {
        e.preventDefault();
        e.target.click();
      }
      
      // Ctrl+Enter (Windows/Linux) 또는 Cmd+Enter (macOS)로 댓글 제출
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && e.target.classList.contains('kommentio-textarea')) {
        e.preventDefault();
        const form = e.target.closest('form');
        if (form) {
          form.dispatchEvent(new Event('submit', { bubbles: true }));
        }
      }
      
      // Escape 키로 포커스 제거
      if (e.key === 'Escape') {
        e.target.blur();
      }
    });

    if (this.mockMode) {
      // Mock 모드에서는 실시간 업데이트 시뮬레이션
      this.simulateRealtimeUpdates();
    } else if (this.supabase) {
      // 실제 Supabase Realtime 구독 (개선된 버전)
      this.setupRealtimeSubscription();
    }
  }

  /**
   * Tab 키 네비게이션 처리
   */
  handleTabNavigation(e) {
    const socialButtons = this.container.querySelectorAll('.kommentio-btn-social');
    const currentIndex = Array.from(socialButtons).indexOf(e.target);
    
    if (socialButtons.length === 0) return;
    
    // Shift + Tab으로 역순 이동
    if (e.shiftKey) {
      if (currentIndex === 0) {
        e.preventDefault();
        socialButtons[socialButtons.length - 1].focus();
      }
    } else {
      // Tab으로 순차 이동
      if (currentIndex === socialButtons.length - 1) {
        e.preventDefault();
        socialButtons[0].focus();
      }
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
   * 실시간 구독 설정 (개선된 버전)
   */
  setupRealtimeSubscription() {
    try {
      console.log('🔄 실시간 구독 설정 중...');
      
      // 채널 이름을 사이트별로 고유하게 생성
      const channelName = `comments-${this.options.siteId}`;
      
      this.realtimeChannel = this.supabase
        .channel(channelName)
        .on('postgres_changes', {
          event: '*',
          schema: 'public', 
          table: 'comments',
          filter: `site_id=eq.${this.options.siteId}`
        }, (payload) => {
          console.log('💬 댓글 실시간 이벤트:', payload);
          this.handleRealtimeCommentEvent(payload);
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'comment_likes',
          filter: `comment_id=in.(${this.getAllCommentIds().join(',')})`
        }, (payload) => {
          console.log('❤️ 좋아요 실시간 이벤트:', payload);
          this.handleRealtimeLikeEvent(payload);
        })
        .subscribe((status) => {
          console.log(`📡 실시간 구독 상태: ${status}`);
          
          if (status === 'SUBSCRIBED') {
            this.showNotification('🔄 실시간 업데이트가 활성화되었습니다!');
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ 실시간 구독 오류');
            this.showNotification('⚠️ 실시간 업데이트 연결에 문제가 있습니다.');
          }
        });
        
    } catch (error) {
      console.error('❌ 실시간 구독 설정 실패:', error);
    }
  }

  /**
   * 댓글 실시간 이벤트 처리
   */
  handleRealtimeCommentEvent(payload) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    switch (eventType) {
      case 'INSERT':
        // 새 댓글 추가
        if (newRecord && newRecord.site_id === this.options.siteId) {
          this.showNotification(`💬 새 댓글: ${newRecord.author_name}`);
          this.loadComments(); // 댓글 목록 새로고침
        }
        break;
        
      case 'UPDATE':
        // 댓글 수정
        if (newRecord && newRecord.site_id === this.options.siteId) {
          if (oldRecord.is_deleted === false && newRecord.is_deleted === true) {
            this.showNotification('🗑️ 댓글이 삭제되었습니다.');
          } else {
            this.showNotification('✏️ 댓글이 수정되었습니다.');
          }
          this.loadComments();
        }
        break;
        
      case 'DELETE':
        // 댓글 완전 삭제 (하드 삭제)
        this.showNotification('🗑️ 댓글이 삭제되었습니다.');
        this.loadComments();
        break;
    }
  }

  /**
   * 좋아요 실시간 이벤트 처리
   */
  handleRealtimeLikeEvent(payload) {
    const { eventType, new: newRecord } = payload;
    
    if (eventType === 'INSERT' && newRecord) {
      this.showNotification('❤️ 새로운 좋아요!');
      // 좋아요 수만 업데이트 (전체 새로고침 없이)
      this.updateCommentLikeCount(newRecord.comment_id);
    } else if (eventType === 'DELETE') {
      // 좋아요 취소
      this.updateCommentLikeCount(payload.old.comment_id);
    }
  }

  /**
   * 모든 댓글 ID 목록 가져오기 (좋아요 구독용)
   */
  getAllCommentIds() {
    const extractIds = (comments) => {
      let ids = [];
      for (const comment of comments) {
        ids.push(comment.id);
        if (comment.children && comment.children.length > 0) {
          ids = ids.concat(extractIds(comment.children));
        }
      }
      return ids;
    };
    
    return this.comments ? extractIds(this.comments) : [];
  }

  /**
   * 특정 댓글의 좋아요 수 업데이트
   */
  async updateCommentLikeCount(commentId) {
    try {
      const { data, error } = await this.supabase
        .from('comments')
        .select('likes_count')
        .eq('id', commentId)
        .single();
        
      if (error) throw error;
      
      // DOM에서 해당 댓글의 좋아요 수 업데이트
      const likeButton = this.container.querySelector(`[data-comment-id="${commentId}"] .kommentio-btn-like`);
      if (likeButton) {
        likeButton.textContent = `👍 ${data.likes_count || 0}`;
      }
      
    } catch (error) {
      console.error('좋아요 수 업데이트 실패:', error);
    }
  }

  /**
   * 실시간 구독 해제
   */
  unsubscribeRealtime() {
    if (this.realtimeChannel) {
      this.supabase.removeChannel(this.realtimeChannel);
      this.realtimeChannel = null;
      console.log('📡 실시간 구독이 해제되었습니다.');
    }
  }

  /**
   * 댓글 작성 핸들러
   */
  async handleSubmit(event) {
    event.preventDefault();
    const textarea = event.target.querySelector('textarea');
    const content = textarea.value.trim();
    
    if (!content) return;

    // 제출 버튼 비활성화 및 로딩 상태 표시
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '작성 중...';

    try {
      const result = await this.createComment(content);
      textarea.value = '';
      
      // 댓글 작성 성공 시 seamless 새로고침
      await this.loadComments();
      
      // 스팸 여부에 따른 알림 표시
      if (result && result.isSpam) {
        this.showNotification('스팸으로 감지된 댓글입니다. 관리자 승인 후 게시됩니다. ⚠️');
      } else {
        this.showNotification('댓글이 성공적으로 작성되었습니다! ✅');
      }
      
    } catch (error) {
      console.error('Failed to create comment:', error);
      this.showNotification('댓글 작성에 실패했습니다. 다시 시도해주세요. ❌');
    } finally {
      // 버튼 상태 복원
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
      textarea.focus(); // 포커스 다시 설정
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

  // 🔍 ANCHOR_SEARCH: Create Comment Function
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
      
      // Mock 모드에서도 반환값 제공 (알림은 호출하는 곳에서 처리)
      return { isSpam: mockSpamCheck };
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

    // 스팸 감지 정보 반환 (알림은 호출하는 곳에서 처리)
    return { isSpam: spamData.is_spam };
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
      'linkedin': 'linkedin', // 다시 linkedin으로 시도 (OIDC는 Supabase 내부 처리)
      'kakao': 'kakao'
    };

    return providerMap[provider] || provider;
  }

  /**
   * 프로바이더별 추가 옵션 설정
   */
  getProviderOptions(provider) {
    // Fragment 제거된 깨끗한 URL 사용 (OAuth 충돌 방지)
    const cleanRedirectUrl = window.location.href.split('#')[0];
    console.log('🔗 OAuth redirectTo URL:', cleanRedirectUrl);
    
    const baseOptions = {
      redirectTo: cleanRedirectUrl
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
          scopes: 'openid profile email'
        };
      case 'kakao':
        return {
          ...baseOptions,
          scopes: 'profile_nickname profile_image account_email'
        };
      default:
        return baseOptions;
    }
  }

  // 🔍 ANCHOR_SEARCH: Login Function
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
      // Kakao는 Supabase 네이티브 지원 시도 (커스텀 로직 임시 비활성화)
      // if (provider === 'kakao') {
      //   await this.handleKoreanSocialLogin(provider);
      //   return;
      // }

      // 아직 설정되지 않은 프로바이더들 (필요 시 Mock 모드로 처리)
      const notConfiguredProviders = []; // LinkedIn 제거 - 실제 OAuth 시도
      if (notConfiguredProviders.includes(provider)) {
        console.warn(`${provider} 프로바이더는 설정 미완료로 Mock 모드로 처리합니다.`);
        
        // Mock 사용자 생성
        this.currentUser = {
          id: `mock-${provider}-user-` + Date.now(),
          email: `${provider}user@example.com`,
          user_metadata: {
            name: `${providerConfig.label} 사용자 (Mock)`,
            avatar_url: `https://ui-avatars.com/api/?name=${providerConfig.label}&background=3b82f6&color=fff`,
            provider: provider
          }
        };
        
        this.showNotification(`${providerConfig.label} 로그인 완료! (설정 미완료로 Mock 모드) 🎉`);
        this.render();
        return;
      }

      // 카카오 OAuth 특별 처리 (GitHub Pages에서 문제 발생 시)
      if (provider === 'kakao') {
        console.log('🥕 카카오 OAuth 시도 중... (GitHub Pages 환경)');
        
        // GitHub Pages에서 카카오 OAuth가 안 되는 경우 디버깅 정보 수집
        console.log('🔍 카카오 OAuth 디버깅:', {
          currentUrl: window.location.href,
          domain: window.location.hostname,
          protocol: window.location.protocol,
          redirectUrl: this.getProviderOptions('kakao').redirectTo
        });
      }

      // 더 이상 지원하지 않는 프로바이더들
      const unsupportedProviders = []; // 모든 프로바이더 지원 시도
      if (unsupportedProviders.includes(provider)) {
        console.warn(`${provider} 프로바이더는 현재 Supabase 설정에서 지원되지 않습니다. Mock 모드로 전환합니다.`);
        
        // Mock 사용자 생성
        this.currentUser = {
          id: 'mock-user-' + Date.now(),
          email: `${provider}user@example.com`,
          user_metadata: {
            name: `${providerConfig.label} 사용자`,
            avatar_url: `https://ui-avatars.com/api/?name=${providerConfig.icon}&background=3b82f6&color=fff`,
            provider: provider
          }
        };
        
        this.showNotification(`${providerConfig.label} 로그인 완료! (설정 미완료로 Mock 모드) 🎉`);
        this.render();
        return;
      }

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
      console.error('Error details:', {
        message: error.message,
        provider: provider,
        url: window.location.href,
        stack: error.stack
      });
      
      // 카카오 전용 에러 처리
      if (provider === 'kakao') {
        console.error('🥕 카카오 OAuth 실패 상세 정보:', {
          errorMessage: error.message,
          errorCode: error.code,
          supabaseUrl: this.options.supabaseUrl,
          redirectUrl: this.getProviderOptions('kakao').redirectTo,
          domain: window.location.hostname
        });
        
        // 카카오 개발자 콘솔 확인 가이드
        console.log('📋 카카오 OAuth 실패 시 확인사항:');
        console.log('1. 카카오 개발자 콘솔 > 플랫폼 > Web 도메인:', 'https://kommentio.tech');
        console.log('2. Redirect URI:', this.getProviderOptions('kakao').redirectTo);
        console.log('3. Supabase 카카오 Provider 설정 확인');
        console.log('4. Client ID, Client Secret 재확인');
        
        this.showNotification('카카오 로그인에 실패했습니다. 콘솔에서 디버깅 정보를 확인해주세요. 🥕');
        return;
      }
      
      // 프로바이더별 에러 메시지
      let errorMessage = '로그인에 실패했습니다.';
      if (error.message?.includes('not supported') || error.message?.includes('not enabled')) {
        console.warn(`${provider} 프로바이더 설정 문제로 Mock 모드로 전환합니다.`);
        
        // Mock 사용자 생성으로 폴백
        this.currentUser = {
          id: 'mock-user-' + Date.now(),
          email: `${provider}user@example.com`,
          user_metadata: {
            name: `${providerConfig.label} 사용자`,
            avatar_url: `https://ui-avatars.com/api/?name=${providerConfig.icon}&background=3b82f6&color=fff`,
            provider: provider
          }
        };
        
        this.showNotification(`${providerConfig.label} 로그인 완료! (설정 미완료로 Mock 모드) ⚠️`);
        this.render();
        return;
      }
      
      alert(errorMessage);
    }
  }

  // 🔍 ANCHOR_SEARCH: Logout Function
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
      
      // 커스텀 로그인 정보도 정리 (카카오)
      localStorage.removeItem('kommentio_custom_user');
      localStorage.removeItem('kommentio_custom_token');
      
      // URL Fragment 완전 제거 (OAuth 잔여물 정리)
      const cleanUrl = window.location.href.split('#')[0];
      window.history.replaceState(null, '', cleanUrl);
      console.log('🧹 로그아웃 후 URL 정리 완료:', cleanUrl);
      
      this.currentUser = null;
      this.render();
      this.showNotification('로그아웃되었습니다. 👋');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  /**
   * 한국 소셜 로그인 (카카오) 커스텀 처리 - 임시 비활성화
   */
  async handleKoreanSocialLogin(provider) {
    console.log(`${provider} 커스텀 로직은 임시 비활성화됨. Supabase 네이티브 OAuth 사용.`);
    // 아무것도 하지 않고 일반 OAuth 플로우로 넘어감
  }

  /**
   * 카카오 로그인 처리
   */
  async handleKakaoLogin() {
    const kakaoConfig = this.getKakaoConfig();
    
    if (!kakaoConfig.apiKey) {
      console.warn('카카오 API 키가 설정되지 않았습니다. Mock 모드로 처리합니다.');
      
      // Mock 사용자 생성
      this.currentUser = {
        id: 'mock-kakao-user-' + Date.now(),
        email: 'kakaouser@example.com',
        user_metadata: {
          name: 'Kakao 사용자',
          avatar_url: 'https://ui-avatars.com/api/?name=Kakao&background=fee500&color=000',
          provider: 'kakao'
        }
      };
      
      this.showNotification('Kakao 로그인 완료! (설정 미완료로 Mock 모드) 🎉');
      this.render();
      return;
    }

    try {
      // 카카오 SDK 로드
      await this.loadKakaoSDK();
      
      return new Promise((resolve, reject) => {
        window.Kakao.Auth.login({
          success: async (authObj) => {
            try {
              // 카카오 사용자 정보 가져오기
              window.Kakao.API.request({
                url: '/v2/user/me',
                success: async (userInfo) => {
                  // Supabase 커스텀 토큰으로 로그인
                  await this.loginWithKakaoUser(userInfo, authObj.access_token);
                  resolve();
                },
                fail: reject
              });
            } catch (error) {
              reject(error);
            }
          },
          fail: reject
        });
      });
    } catch (error) {
      console.warn('카카오 SDK 로드 실패로 Mock 모드로 처리합니다:', error);
      
      // Mock 사용자 생성으로 폴백
      this.currentUser = {
        id: 'mock-kakao-user-' + Date.now(),
        email: 'kakaouser@example.com',
        user_metadata: {
          name: 'Kakao 사용자',
          avatar_url: 'https://ui-avatars.com/api/?name=Kakao&background=fee500&color=000',
          provider: 'kakao'
        }
      };
      
      this.showNotification('Kakao 로그인 완료! (SDK 로드 실패로 Mock 모드) 🎉');
      this.render();
    }
  }


  /**
   * 카카오 SDK 로드
   */
  async loadKakaoSDK() {
    if (window.Kakao) return;
    
    await this.loadScript('https://developers.kakao.com/sdk/js/kakao.js');
    
    const kakaoConfig = this.getKakaoConfig();
    window.Kakao.init(kakaoConfig.apiKey);
  }

  /**
   * 카카오 설정 가져오기
   */
  getKakaoConfig() {
    return {
      apiKey: this.options.kakaoApiKey || process.env.VITE_KAKAO_API_KEY,
      redirectUri: `${window.location.origin}/auth/kakao/callback`
    };
  }



  /**
   * 카카오 사용자로 Supabase 로그인
   */
  async loginWithKakaoUser(userInfo, accessToken) {
    // 사용자 정보 변환
    const userData = {
      id: `kakao_${userInfo.id}`,
      email: userInfo.kakao_account?.email || `kakao_${userInfo.id}@kakao.local`,
      user_metadata: {
        name: userInfo.kakao_account?.profile?.nickname || '카카오 사용자',
        avatar_url: userInfo.kakao_account?.profile?.profile_image_url,
        provider: 'kakao',
        provider_id: userInfo.id.toString(),
        full_name: userInfo.kakao_account?.profile?.nickname
      }
    };

    // Supabase에 커스텀 사용자로 로그인
    await this.loginWithCustomUser(userData, accessToken);
    this.showNotification('카카오 로그인 완료! 🎉');
  }


  /**
   * 커스텀 사용자로 Supabase 로그인
   */
  async loginWithCustomUser(userData, accessToken) {
    try {
      // 실제 환경에서는 백엔드 서버에서 JWT 토큰 생성이 필요
      // 여기서는 간단한 구현으로 로컬 저장소 사용
      
      // 현재 사용자 설정
      this.currentUser = {
        id: userData.id,
        email: userData.email,
        user_metadata: userData.user_metadata
      };

      // 로컬 저장소에 저장 (실제 환경에서는 Supabase JWT 토큰 사용)
      localStorage.setItem('kommentio_custom_user', JSON.stringify(this.currentUser));
      localStorage.setItem('kommentio_custom_token', accessToken);
      
      // UI 업데이트
      this.render();
      
    } catch (error) {
      console.error('Custom login failed:', error);
      throw error;
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
    // 로그인되지 않은 경우 로그인 요청
    if (!this.currentUser && !this.options.allowAnonymous) {
      alert('답글을 작성하려면 로그인해주세요.');
      return;
    }

    // 기존 답글 폼이 있으면 제거
    const existingForm = document.querySelector('.kommentio-reply-form');
    if (existingForm) {
      existingForm.remove();
    }

    // 해당 댓글 찾기
    const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
    if (!commentElement) {
      console.error('Comment not found:', commentId);
      return;
    }

    // 답글 폼 생성
    const replyForm = document.createElement('div');
    replyForm.className = 'kommentio-reply-form';
    replyForm.style.cssText = `
      margin-top: 1rem;
      padding: 1rem;
      background: var(--kommentio-bg);
      border: 1px solid var(--kommentio-border);
      border-radius: 6px;
      border-left: 3px solid var(--kommentio-primary);
    `;

    replyForm.innerHTML = `
      <div style="margin-bottom: 0.75rem;">
        <strong style="color: var(--kommentio-primary);">답글 작성</strong>
        <button 
          onclick="this.closest('.kommentio-reply-form').remove()" 
          style="float: right; background: none; border: none; color: var(--kommentio-secondary); cursor: pointer; font-size: 1.2rem;"
          title="닫기"
        >×</button>
      </div>
      <form onsubmit="kommentio.handleReplySubmit(event, '${commentId}')">
        <textarea 
          class="kommentio-textarea" 
          placeholder="답글을 입력하세요..."
          style="min-height: 80px; margin-bottom: 0.75rem;"
          required
        ></textarea>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <small style="color: var(--kommentio-secondary);">Markdown 문법을 지원합니다. • Ctrl+Enter로 빠른 등록</small>
          <div style="display: flex; gap: 0.5rem;">
            <button 
              type="button" 
              onclick="this.closest('.kommentio-reply-form').remove()"
              style="padding: 0.5rem 1rem; border: 1px solid var(--kommentio-border); background: var(--kommentio-bg); color: var(--kommentio-text); border-radius: 4px; cursor: pointer;"
            >취소</button>
            <button 
              type="submit" 
              style="padding: 0.5rem 1rem; background: var(--kommentio-primary); color: white; border: none; border-radius: 4px; cursor: pointer;"
            >답글 작성</button>
          </div>
        </div>
      </form>
    `;

    // 댓글 하단에 답글 폼 추가
    commentElement.appendChild(replyForm);

    // 답글 폼의 textarea에 포커스
    const textarea = replyForm.querySelector('textarea');
    textarea.focus();

    // 답글 폼으로 스크롤
    replyForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /**
   * 답글 작성 핸들러
   */
  async handleReplySubmit(event, parentId) {
    event.preventDefault();
    const textarea = event.target.querySelector('textarea');
    const content = textarea.value.trim();
    
    if (!content) return;

    // 제출 버튼 비활성화 및 로딩 상태 표시
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '작성 중...';

    try {
      const result = await this.createComment(content, parentId);
      
      // 답글 폼 제거
      const replyForm = event.target.closest('.kommentio-reply-form');
      if (replyForm) {
        replyForm.remove();
      }
      
      // 답글 작성 성공 시 seamless 새로고침
      await this.loadComments();
      
      // 스팸 여부에 따른 알림 표시
      if (result && result.isSpam) {
        this.showNotification('스팸으로 감지된 답글입니다. 관리자 승인 후 게시됩니다. ⚠️');
      } else {
        this.showNotification('답글이 성공적으로 작성되었습니다! ✅');
      }
      
    } catch (error) {
      console.error('Failed to create reply:', error);
      this.showNotification('답글 작성에 실패했습니다. 다시 시도해주세요. ❌');
    } finally {
      // 버튼 상태 복원 (폼이 제거되기 전에)
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    }
  }
}

// 환경 변수 헬퍼 함수
function getEnvVar(name) {
  // Vite 환경에서만 사용 가능
  if (typeof window !== 'undefined' && window.__VITE_ENV) {
    return window.__VITE_ENV[name];
  }
  return undefined;
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
      supabaseUrl: target.dataset.supabaseUrl || null,
      supabaseKey: target.dataset.supabaseKey || null,
      claudeApiKey: target.dataset.claudeApiKey
    };
    
    kommentio = new Kommentio(options);
    
    // 인스턴스 생성 후 즉시 전역 객체에 할당
    window.kommentio = kommentio;
    
    // 디버깅용 로그
    console.log('✅ Kommentio 위젯 초기화 완료!', window.kommentio);
  }
}

// 전역 접근을 위한 window 객체에 추가
window.Kommentio = Kommentio;

// 초기에는 null로 설정, autoInit에서 실제 인스턴스 할당
window.kommentio = null;

// 위젯 로딩 대기 및 안전한 함수 실행을 위한 헬퍼
window.waitForKommentio = function(callback, timeout = 5000) {
  const startTime = Date.now();
  
  function check() {
    if (window.kommentio && window.kommentio.updateSocialProviders) {
      console.log('✅ Kommentio 위젯 준비 완료!');
      callback(window.kommentio);
      return;
    }
    
    if (Date.now() - startTime > timeout) {
      console.error('❌ Kommentio 위젯 로딩 타임아웃');
      alert('위젯 로딩이 너무 오래 걸립니다. 페이지를 새로고침해주세요.');
      return;
    }
    
    setTimeout(check, 50); // 50ms마다 확인
  }
  
  check();
};