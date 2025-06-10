-- Kommentio 댓글 시스템 데이터베이스 스키마
-- 관리 대시보드와의 통합을 고려한 설계

-- 사이트 관리 테이블
CREATE TABLE IF NOT EXISTS sites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    settings JSONB DEFAULT '{
        "allow_anonymous": true,
        "moderation_enabled": false,
        "max_comment_length": 2000,
        "theme": "light",
        "language": "ko"
    }',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사이트 도메인 인덱스 (빠른 조회)
CREATE INDEX IF NOT EXISTS idx_sites_domain ON sites(domain);
CREATE INDEX IF NOT EXISTS idx_sites_owner ON sites(owner_id);

-- 댓글 테이블 (계층형 구조 지원)
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
    page_url TEXT NOT NULL, -- 댓글이 달린 페이지 URL
    content TEXT NOT NULL,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- 답글용
    depth INTEGER DEFAULT 0, -- 댓글 깊이 (0: 최상위, 1: 1단계 답글, ...)
    
    -- 작성자 정보
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- null이면 익명
    author_name VARCHAR(100) NOT NULL,
    author_email VARCHAR(255),
    author_avatar TEXT,
    author_ip INET, -- 스팸 방지용
    
    -- 상태 관리
    likes_count INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    is_approved BOOLEAN DEFAULT true,
    is_spam BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    
    -- AI 스팸 분석 결과
    spam_score DECIMAL(3,2), -- 0.00 ~ 1.00 (Claude Haiku 결과)
    spam_reason TEXT,
    
    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 제약조건: 최대 3단계 깊이
    CONSTRAINT max_depth CHECK (depth <= 3)
);

-- 댓글 조회 최적화 인덱스
CREATE INDEX IF NOT EXISTS idx_comments_site_page ON comments(site_id, page_url) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comments_created ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_spam ON comments(is_spam) WHERE is_spam = true;

-- 댓글 좋아요 테이블
CREATE TABLE IF NOT EXISTS comment_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_ip INET, -- 익명 사용자용
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 중복 좋아요 방지
    UNIQUE(comment_id, user_id),
    UNIQUE(comment_id, user_ip) -- 익명 사용자는 IP로 구분
);

-- 스팸 신고 테이블
CREATE TABLE IF NOT EXISTS spam_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE NOT NULL,
    reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reporter_ip INET,
    reason VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사이트 관리자 테이블 (관리 대시보드용)
CREATE TABLE IF NOT EXISTS site_moderators (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role VARCHAR(20) DEFAULT 'moderator', -- owner, admin, moderator
    permissions JSONB DEFAULT '{
        "can_delete_comments": true,
        "can_ban_users": false,
        "can_manage_settings": false
    }',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 중복 관리자 방지
    UNIQUE(site_id, user_id)
);

-- 댓글 통계 뷰 (관리 대시보드용)
CREATE OR REPLACE VIEW comment_stats AS
SELECT 
    site_id,
    COUNT(*) as total_comments,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as comments_today,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as comments_week,
    COUNT(*) FILTER (WHERE is_spam = true) as spam_comments,
    COUNT(*) FILTER (WHERE is_approved = false) as pending_comments,
    AVG(spam_score) as avg_spam_score
FROM comments 
WHERE is_deleted = false
GROUP BY site_id;

-- 댓글 좋아요 카운트 업데이트 함수
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE comments 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.comment_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE comments 
        SET likes_count = likes_count - 1 
        WHERE id = OLD.comment_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 답글 카운트 업데이트 함수
CREATE OR REPLACE FUNCTION update_replies_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.parent_id IS NOT NULL THEN
        UPDATE comments 
        SET replies_count = replies_count + 1 
        WHERE id = NEW.parent_id;
    ELSIF TG_OP = 'DELETE' AND OLD.parent_id IS NOT NULL THEN
        UPDATE comments 
        SET replies_count = replies_count - 1 
        WHERE id = OLD.parent_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 좋아요 증가 함수 (중복 방지)
CREATE OR REPLACE FUNCTION increment_likes(comment_id UUID)
RETURNS INTEGER AS $$
DECLARE
    current_count INTEGER;
BEGIN
    UPDATE comments 
    SET likes_count = likes_count + 1 
    WHERE id = comment_id
    RETURNING likes_count INTO current_count;
    
    RETURN current_count;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER comment_likes_count_trigger
    AFTER INSERT OR DELETE ON comment_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_comment_likes_count();

CREATE TRIGGER replies_count_trigger
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_replies_count();

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sites_updated_at
    BEFORE UPDATE ON sites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();