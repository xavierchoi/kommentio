/**
 * Kommentio 관리 대시보드 API
 * 관리자가 댓글 시스템을 관리하기 위한 API 인터페이스
 */

class KommentioAdminAPI {
  constructor(supabaseUrl, supabaseKey) {
    this.supabaseUrl = supabaseUrl;
    this.supabaseKey = supabaseKey;
    this.supabase = null;
    this.currentAdmin = null;
  }

  /**
   * API 초기화
   */
  async init() {
    if (!window.supabase) {
      await this.loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
    }

    this.supabase = window.supabase.createClient(
      this.supabaseUrl,
      this.supabaseKey
    );

    // 현재 관리자 확인
    const { data: { user } } = await this.supabase.auth.getUser();
    this.currentAdmin = user;

    return this;
  }

  /**
   * 스크립트 동적 로드
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

  // === 사이트 관리 ===

  /**
   * 사이트 목록 조회
   */
  async getSites() {
    const { data, error } = await this.supabase
      .from('sites')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * 사이트 생성
   */
  async createSite(siteData) {
    const { data, error } = await this.supabase
      .from('sites')
      .insert({
        ...siteData,
        owner_id: this.currentAdmin.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 사이트 수정
   */
  async updateSite(siteId, updates) {
    const { data, error } = await this.supabase
      .from('sites')
      .update(updates)
      .eq('id', siteId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 사이트 삭제
   */
  async deleteSite(siteId) {
    const { error } = await this.supabase
      .from('sites')
      .delete()
      .eq('id', siteId);

    if (error) throw error;
    return { success: true };
  }

  // === 댓글 관리 ===

  /**
   * 사이트별 댓글 목록 조회
   */
  async getComments(siteId, options = {}) {
    const {
      page = 1,
      limit = 50,
      status = 'all', // 'all', 'approved', 'pending', 'spam'
      orderBy = 'created_at',
      order = 'desc'
    } = options;

    let query = this.supabase
      .from('comments')
      .select('*')
      .eq('site_id', siteId);

    // 상태 필터
    if (status === 'approved') query = query.eq('is_approved', true).eq('is_spam', false);
    if (status === 'pending') query = query.eq('is_approved', false).eq('is_spam', false);
    if (status === 'spam') query = query.eq('is_spam', true);

    // 정렬 및 페이징
    query = query
      .order(orderBy, { ascending: order === 'asc' })
      .range((page - 1) * limit, page * limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      comments: data,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    };
  }

  /**
   * 댓글 승인
   */
  async approveComment(commentId) {
    const { data, error } = await this.supabase
      .from('comments')
      .update({ 
        is_approved: true,
        is_spam: false 
      })
      .eq('id', commentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 댓글 거절
   */
  async rejectComment(commentId) {
    const { data, error } = await this.supabase
      .from('comments')
      .update({ is_approved: false })
      .eq('id', commentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 댓글 스팸 표시
   */
  async markAsSpam(commentId) {
    const { data, error } = await this.supabase
      .from('comments')
      .update({ 
        is_spam: true,
        is_approved: false 
      })
      .eq('id', commentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 댓글 삭제 (소프트 삭제)
   */
  async deleteComment(commentId) {
    const { data, error } = await this.supabase
      .from('comments')
      .update({ is_deleted: true })
      .eq('id', commentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 댓글 완전 삭제
   */
  async permanentDeleteComment(commentId) {
    const { error } = await this.supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;
    return { success: true };
  }

  // === 통계 ===

  /**
   * 사이트 통계 조회
   */
  async getSiteStats(siteId) {
    const { data, error } = await this.supabase
      .from('comment_stats')
      .select('*')
      .eq('site_id', siteId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 전체 대시보드 통계
   */
  async getDashboardStats() {
    const { data: sites } = await this.getSites();
    const stats = {
      totalSites: sites.length,
      totalComments: 0,
      todayComments: 0,
      spamComments: 0,
      pendingComments: 0
    };

    for (const site of sites) {
      const siteStats = await this.getSiteStats(site.id);
      if (siteStats) {
        stats.totalComments += siteStats.total_comments || 0;
        stats.todayComments += siteStats.comments_today || 0;
        stats.spamComments += siteStats.spam_comments || 0;
        stats.pendingComments += siteStats.pending_comments || 0;
      }
    }

    return stats;
  }

  // === 스팸 관리 ===

  /**
   * 스팸 신고 목록 조회
   */
  async getSpamReports(siteId) {
    const { data, error } = await this.supabase
      .from('spam_reports')
      .select(`
        *,
        comments!inner(content, author_name, site_id)
      `)
      .eq('comments.site_id', siteId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * 스팸 신고 처리
   */
  async processSpamReport(reportId, action) {
    const { data, error } = await this.supabase
      .from('spam_reports')
      .update({ status: action }) // 'approved', 'rejected'
      .eq('id', reportId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // === 관리자 관리 ===

  /**
   * 사이트 관리자 목록 조회
   */
  async getSiteModerators(siteId) {
    const { data, error } = await this.supabase
      .from('site_moderators')
      .select(`
        *,
        users!inner(email, user_metadata)
      `)
      .eq('site_id', siteId);

    if (error) throw error;
    return data;
  }

  /**
   * 관리자 추가
   */
  async addModerator(siteId, userId, role = 'moderator') {
    const { data, error } = await this.supabase
      .from('site_moderators')
      .insert({
        site_id: siteId,
        user_id: userId,
        role: role
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 관리자 제거
   */
  async removeModerator(siteId, userId) {
    const { error } = await this.supabase
      .from('site_moderators')
      .delete()
      .eq('site_id', siteId)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  }

  // === Claude API 스팸 필터링 ===

  /**
   * Claude API로 스팸 검사
   */
  async checkSpamWithClaude(content, apiKey) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
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

      const result = await response.json();
      const analysis = JSON.parse(result.content[0].text);
      
      return {
        spam_score: analysis.spam_score,
        reason: analysis.reason,
        is_spam: analysis.spam_score > 0.7
      };
    } catch (error) {
      console.error('Claude API 호출 실패:', error);
      return {
        spam_score: 0.0,
        reason: 'API 호출 실패',
        is_spam: false
      };
    }
  }

  /**
   * 댓글에 스팸 점수 업데이트
   */
  async updateSpamScore(commentId, spamData) {
    const { data, error } = await this.supabase
      .from('comments')
      .update({
        spam_score: spamData.spam_score,
        spam_reason: spamData.reason,
        is_spam: spamData.is_spam
      })
      .eq('id', commentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // === 설정 관리 ===

  /**
   * 사이트 설정 업데이트
   */
  async updateSiteSettings(siteId, settings) {
    const { data, error } = await this.supabase
      .from('sites')
      .update({ settings })
      .eq('id', siteId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // === 소셜 로그인 프로바이더 관리 ===

  /**
   * 기본 소셜 프로바이더 설정 템플릿
   */
  getDefaultSocialProviders() {
    return {
      google: { enabled: true, label: 'Google', color: '#4285f4', icon: '🔍' },
      github: { enabled: true, label: 'GitHub', color: '#333', icon: '🐙' },
      facebook: { enabled: false, label: 'Facebook', color: '#1877f2', icon: '📘' },
      twitter: { enabled: false, label: 'X.com', color: '#000', icon: '🐦' },
      apple: { enabled: false, label: 'Apple', color: '#000', icon: '🍎' },
      linkedin: { enabled: false, label: 'LinkedIn', color: '#0077b5', icon: '💼' },
      kakao: { enabled: false, label: '카카오톡', color: '#fee500', icon: '💬' },
      line: { enabled: false, label: 'LINE', color: '#00b900', icon: '💚' }
    };
  }

  /**
   * 사이트의 소셜 로그인 프로바이더 설정 조회
   */
  async getSocialProviders(siteId) {
    const { data, error } = await this.supabase
      .from('sites')
      .select('settings')
      .eq('id', siteId)
      .single();

    if (error) throw error;

    const socialProviders = data.settings?.socialProviders || this.getDefaultSocialProviders();
    return socialProviders;
  }

  /**
   * 소셜 로그인 프로바이더 설정 업데이트
   */
  async updateSocialProviders(siteId, socialProviders) {
    // 기존 설정 조회
    const { data: site, error: fetchError } = await this.supabase
      .from('sites')
      .select('settings')
      .eq('id', siteId)
      .single();

    if (fetchError) throw fetchError;

    // 기존 설정과 병합
    const updatedSettings = {
      ...site.settings,
      socialProviders: {
        ...this.getDefaultSocialProviders(),
        ...socialProviders
      }
    };

    const { data, error } = await this.supabase
      .from('sites')
      .update({ settings: updatedSettings })
      .eq('id', siteId)
      .select()
      .single();

    if (error) throw error;
    return data.settings.socialProviders;
  }

  /**
   * 특정 소셜 프로바이더 활성화/비활성화
   */
  async toggleSocialProvider(siteId, provider, enabled) {
    const currentProviders = await this.getSocialProviders(siteId);
    
    if (!currentProviders[provider]) {
      throw new Error(`지원하지 않는 소셜 프로바이더: ${provider}`);
    }

    currentProviders[provider].enabled = enabled;
    return await this.updateSocialProviders(siteId, currentProviders);
  }

  /**
   * 소셜 프로바이더 대량 설정
   */
  async configureSocialProviders(siteId, providerConfig) {
    // providerConfig 예시: { google: true, github: true, kakao: false, ... }
    const currentProviders = await this.getSocialProviders(siteId);

    Object.entries(providerConfig).forEach(([provider, enabled]) => {
      if (currentProviders[provider]) {
        currentProviders[provider].enabled = enabled;
      }
    });

    return await this.updateSocialProviders(siteId, currentProviders);
  }

  /**
   * 소셜 프로바이더 통계 (어떤 로그인 방식이 많이 사용되는지)
   */
  async getSocialProviderStats(siteId) {
    const { data, error } = await this.supabase
      .from('comments')
      .select('author_id, users!inner(user_metadata)')
      .eq('site_id', siteId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (error) throw error;

    // 프로바이더별 사용자 수 계산
    const providerStats = {};
    data.forEach(comment => {
      const provider = comment.users?.user_metadata?.provider || 'unknown';
      providerStats[provider] = (providerStats[provider] || 0) + 1;
    });

    return providerStats;
  }

  // === Supabase Auth 프로바이더 설정 가이드 ===

  /**
   * 각 소셜 프로바이더의 Supabase 설정 가이드 반환
   */
  getSocialProviderSetupGuide(provider) {
    const guides = {
      google: {
        title: 'Google OAuth 설정',
        steps: [
          '1. Google Cloud Console에서 새 프로젝트 생성',
          '2. OAuth 2.0 클라이언트 ID 생성',
          '3. 승인된 리디렉션 URI 추가: https://[project-id].supabase.co/auth/v1/callback',
          '4. Supabase > Authentication > Providers > Google에 Client ID/Secret 입력'
        ],
        requiredScopes: ['email', 'profile'],
        supabaseEnabled: true
      },
      github: {
        title: 'GitHub OAuth 설정', 
        steps: [
          '1. GitHub > Settings > Developer settings > OAuth Apps',
          '2. New OAuth App 생성',
          '3. Authorization callback URL: https://[project-id].supabase.co/auth/v1/callback',
          '4. Supabase > Authentication > Providers > GitHub에 Client ID/Secret 입력'
        ],
        requiredScopes: ['user:email'],
        supabaseEnabled: true
      },
      facebook: {
        title: 'Facebook OAuth 설정',
        steps: [
          '1. Facebook Developers에서 앱 생성',
          '2. Facebook 로그인 제품 추가',
          '3. Valid OAuth Redirect URIs: https://[project-id].supabase.co/auth/v1/callback',
          '4. Supabase > Authentication > Providers > Facebook에 App ID/Secret 입력'
        ],
        requiredScopes: ['email'],
        supabaseEnabled: true
      },
      twitter: {
        title: 'X.com (Twitter) OAuth 설정',
        steps: [
          '1. Twitter Developer Portal에서 앱 생성',
          '2. OAuth 2.0 설정',
          '3. Callback URL: https://[project-id].supabase.co/auth/v1/callback',
          '4. Supabase > Authentication > Providers > Twitter에 Client ID/Secret 입력'
        ],
        requiredScopes: ['tweet.read', 'users.read'],
        supabaseEnabled: true
      },
      apple: {
        title: 'Apple OAuth 설정',
        steps: [
          '1. Apple Developer 계정 필요',
          '2. Services ID 생성',
          '3. Return URLs: https://[project-id].supabase.co/auth/v1/callback',
          '4. Supabase > Authentication > Providers > Apple에 설정'
        ],
        requiredScopes: ['name', 'email'],
        supabaseEnabled: true
      },
      linkedin: {
        title: 'LinkedIn OAuth 설정',
        steps: [
          '1. LinkedIn Developers에서 앱 생성',
          '2. OAuth 2.0 설정',
          '3. Redirect URL: https://[project-id].supabase.co/auth/v1/callback',
          '4. Supabase > Authentication > Providers > LinkedIn에 Client ID/Secret 입력'
        ],
        requiredScopes: ['r_liteprofile', 'r_emailaddress'],
        supabaseEnabled: true
      },
      kakao: {
        title: '카카오톡 OAuth 설정',
        steps: [
          '1. Kakao Developers에서 앱 생성',
          '2. 플랫폼 설정 > Web 추가',
          '3. Redirect URI: https://[project-id].supabase.co/auth/v1/callback',
          '4. Supabase에서 커스텀 OAuth 설정 필요 (현재 기본 지원 없음)'
        ],
        requiredScopes: ['profile_nickname', 'account_email'],
        supabaseEnabled: false,
        note: 'Supabase에서 기본 지원하지 않음. 커스텀 구현 필요.'
      },
      line: {
        title: 'LINE OAuth 설정',
        steps: [
          '1. LINE Developers에서 채널 생성',
          '2. LINE 로그인 설정',
          '3. Callback URL: https://[project-id].supabase.co/auth/v1/callback',
          '4. Supabase에서 커스텀 OAuth 설정 필요 (현재 기본 지원 없음)'
        ],
        requiredScopes: ['profile', 'openid', 'email'],
        supabaseEnabled: false,
        note: 'Supabase에서 기본 지원하지 않음. 커스텀 구현 필요.'
      }
    };

    return guides[provider] || null;
  }

  /**
   * 모든 소셜 프로바이더 설정 가이드 반환
   */
  getAllSocialProviderGuides() {
    const providers = Object.keys(this.getDefaultSocialProviders());
    const guides = {};
    
    providers.forEach(provider => {
      guides[provider] = this.getSocialProviderSetupGuide(provider);
    });

    return guides;
  }
}

// Export for use in admin dashboard
if (typeof module !== 'undefined' && module.exports) {
  module.exports = KommentioAdminAPI;
} else if (typeof window !== 'undefined') {
  window.KommentioAdminAPI = KommentioAdminAPI;
}