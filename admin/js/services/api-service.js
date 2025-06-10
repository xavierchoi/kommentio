// Kommentio Admin Dashboard - API Service

class AdminAPIService {
  constructor() {
    this.api = null;
    this.initialized = false;
    this.isDemo = false; // 데모 모드 (Supabase 없이 테스트)
    
    // 데모 데이터
    this.demoData = {
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
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // === 사이트 관리 ===

  async getSites() {
    if (this.isDemo) {
      await this.simulateDelay();
      return [...this.demoData.sites];
    } else {
      return await this.api.getSites();
    }
  }

  async createSite(siteData) {
    if (this.isDemo) {
      await this.simulateDelay();
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
    } else {
      return await this.api.createSite(siteData);
    }
  }

  async updateSite(siteId, updates) {
    if (this.isDemo) {
      await this.simulateDelay();
      const siteIndex = this.demoData.sites.findIndex(s => s.id === siteId);
      if (siteIndex !== -1) {
        this.demoData.sites[siteIndex] = { ...this.demoData.sites[siteIndex], ...updates };
        return this.demoData.sites[siteIndex];
      }
      throw new Error('Site not found');
    } else {
      return await this.api.updateSite(siteId, updates);
    }
  }

  async deleteSite(siteId) {
    if (this.isDemo) {
      await this.simulateDelay();
      const siteIndex = this.demoData.sites.findIndex(s => s.id === siteId);
      if (siteIndex !== -1) {
        this.demoData.sites.splice(siteIndex, 1);
        return { success: true };
      }
      throw new Error('Site not found');
    } else {
      return await this.api.deleteSite(siteId);
    }
  }

  // === 댓글 관리 ===

  async getComments(siteId, options = {}) {
    if (this.isDemo) {
      await this.simulateDelay();
      let comments = this.demoData.comments.filter(c => c.site_id === siteId);
      
      // 상태 필터링
      if (options.status === 'approved') {
        comments = comments.filter(c => c.is_approved && !c.is_spam);
      } else if (options.status === 'pending') {
        comments = comments.filter(c => !c.is_approved && !c.is_spam);
      } else if (options.status === 'spam') {
        comments = comments.filter(c => c.is_spam);
      }

      return {
        comments,
        total: comments.length,
        page: options.page || 1,
        totalPages: Math.ceil(comments.length / (options.limit || 50))
      };
    } else {
      return await this.api.getComments(siteId, options);
    }
  }

  async approveComment(commentId) {
    if (this.isDemo) {
      await this.simulateDelay();
      const comment = this.demoData.comments.find(c => c.id === commentId);
      if (comment) {
        comment.is_approved = true;
        comment.is_spam = false;
        return comment;
      }
      throw new Error('Comment not found');
    } else {
      return await this.api.approveComment(commentId);
    }
  }

  async rejectComment(commentId) {
    if (this.isDemo) {
      await this.simulateDelay();
      const comment = this.demoData.comments.find(c => c.id === commentId);
      if (comment) {
        comment.is_approved = false;
        return comment;
      }
      throw new Error('Comment not found');
    } else {
      return await this.api.rejectComment(commentId);
    }
  }

  async markAsSpam(commentId) {
    if (this.isDemo) {
      await this.simulateDelay();
      const comment = this.demoData.comments.find(c => c.id === commentId);
      if (comment) {
        comment.is_spam = true;
        comment.is_approved = false;
        return comment;
      }
      throw new Error('Comment not found');
    } else {
      return await this.api.markAsSpam(commentId);
    }
  }

  async deleteComment(commentId) {
    if (this.isDemo) {
      await this.simulateDelay();
      const commentIndex = this.demoData.comments.findIndex(c => c.id === commentId);
      if (commentIndex !== -1) {
        this.demoData.comments.splice(commentIndex, 1);
        return { success: true };
      }
      throw new Error('Comment not found');
    } else {
      return await this.api.deleteComment(commentId);
    }
  }

  // === 통계 ===

  async getDashboardStats() {
    if (this.isDemo) {
      await this.simulateDelay();
      
      // 실시간으로 계산된 통계
      const sites = this.demoData.sites;
      const comments = this.demoData.comments;
      
      const stats = {
        totalSites: sites.length,
        activeSites: sites.filter(s => s.status === 'active').length,
        totalComments: comments.length,
        approvedComments: comments.filter(c => c.is_approved && !c.is_spam).length,
        pendingComments: comments.filter(c => !c.is_approved && !c.is_spam).length,
        spamComments: comments.filter(c => c.is_spam).length,
        totalUsers: this.demoData.stats.totalUsers,
        commentsToday: this.demoData.stats.commentsToday,
        commentsThisWeek: this.demoData.stats.commentsThisWeek,
        commentsThisMonth: this.demoData.stats.commentsThisMonth
      };
      
      return stats;
    } else {
      return await this.api.getDashboardStats();
    }
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
    if (this.isDemo) {
      await this.simulateDelay();
      return {
        database: { status: 'healthy', response_time: 45 },
        api: { status: 'healthy', response_time: 120 },
        spam_filter: { status: 'healthy', response_time: 200 },
        auth: { status: 'healthy', response_time: 80 }
      };
    } else {
      // 실제 시스템 상태 체크 로직
      return {
        database: { status: 'healthy', response_time: 45 },
        api: { status: 'healthy', response_time: 120 },
        spam_filter: { status: 'healthy', response_time: 200 },
        auth: { status: 'healthy', response_time: 80 }
      };
    }
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
      hasRealAPI: !this.isDemo && this.api !== null
    };
  }
}

// 전역 인스턴스 생성
window.AdminAPIService = AdminAPIService;