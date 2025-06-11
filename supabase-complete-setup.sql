-- ============================================================================
-- Kommentio v0.2.1 - 완전한 Supabase 데이터베이스 설정
-- 이 스크립트를 Supabase SQL 에디터에서 한 번에 실행하세요
-- ============================================================================

-- 기존 데이터 정리 (테스트용)
DROP TABLE IF EXISTS comment_likes CASCADE;
DROP TABLE IF EXISTS spam_reports CASCADE;
DROP TABLE IF EXISTS site_moderators CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS sites CASCADE;

-- 기존 함수와 트리거 정리
DROP FUNCTION IF EXISTS update_comment_likes_count() CASCADE;
DROP FUNCTION IF EXISTS update_replies_count() CASCADE;
DROP FUNCTION IF EXISTS increment_likes(UUID) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ============================================================================
-- 1. 스키마 생성 (001_create_comments_schema.sql)
-- ============================================================================

-- 사이트 관리 테이블
CREATE TABLE IF NOT EXISTS sites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL UNIQUE,
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

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
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

CREATE TRIGGER update_sites_updated_at
    BEFORE UPDATE ON sites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. RLS 정책 설정 (002_setup_rls_policies.sql)
-- ============================================================================

-- RLS 활성화
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE spam_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_moderators ENABLE ROW LEVEL SECURITY;

-- SITES 테이블 정책
CREATE POLICY "sites_select_policy" ON sites
    FOR SELECT USING (is_active = true);

CREATE POLICY "sites_insert_policy" ON sites
    FOR INSERT WITH CHECK (auth.uid() = owner_id OR auth.uid() IS NULL);

CREATE POLICY "sites_update_policy" ON sites
    FOR UPDATE USING (auth.uid() = owner_id OR auth.uid() IS NULL);

CREATE POLICY "sites_delete_policy" ON sites
    FOR DELETE USING (auth.uid() = owner_id OR auth.uid() IS NULL);

-- COMMENTS 테이블 정책
CREATE POLICY "comments_select_policy" ON comments
    FOR SELECT USING (is_deleted = false);

CREATE POLICY "comments_insert_policy" ON comments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "comments_update_policy" ON comments
    FOR UPDATE USING (
        auth.uid() = author_id 
        OR author_id IS NULL
        OR created_at > NOW() - INTERVAL '24 hours'
    );

CREATE POLICY "comments_delete_policy" ON comments
    FOR DELETE USING (
        auth.uid() = author_id 
        OR author_id IS NULL
        OR EXISTS (
            SELECT 1 FROM site_moderators sm 
            WHERE sm.site_id = comments.site_id 
            AND sm.user_id = auth.uid()
        )
    );

-- COMMENT_LIKES 테이블 정책
CREATE POLICY "comment_likes_select_policy" ON comment_likes
    FOR SELECT USING (true);

CREATE POLICY "comment_likes_insert_policy" ON comment_likes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "comment_likes_delete_policy" ON comment_likes
    FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- SPAM_REPORTS 테이블 정책
CREATE POLICY "spam_reports_select_policy" ON spam_reports
    FOR SELECT USING (true);

CREATE POLICY "spam_reports_insert_policy" ON spam_reports
    FOR INSERT WITH CHECK (true);

-- SITE_MODERATORS 테이블 정책
CREATE POLICY "site_moderators_select_policy" ON site_moderators
    FOR SELECT USING (true);

CREATE POLICY "site_moderators_insert_policy" ON site_moderators
    FOR INSERT WITH CHECK (true);

-- 익명 사용자를 위한 특별 정책들
CREATE POLICY "anonymous_comments_select" ON comments
    FOR SELECT TO anon USING (is_deleted = false);

CREATE POLICY "anonymous_comments_insert" ON comments
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anonymous_likes_insert" ON comment_likes
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anonymous_spam_reports_insert" ON spam_reports
    FOR INSERT TO anon WITH CHECK (true);

-- ============================================================================
-- 3. 테스트 데이터 생성
-- ============================================================================

-- 테스트 사이트 생성
INSERT INTO sites (name, domain, description, settings, is_active)
VALUES (
    'Kommentio 테스트 사이트 v0.2.1',
    'localhost:5173',
    'Supabase 실제 연동 테스트용 사이트 - Mock 모드에서 실제 DB 연동으로 전환',
    '{
        "allow_anonymous": true,
        "moderation_enabled": false,
        "max_comment_length": 2000,
        "theme": "light",
        "language": "ko"
    }'::jsonb,
    true
)
ON CONFLICT (domain) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    settings = EXCLUDED.settings,
    updated_at = NOW();

-- 테스트 댓글들 생성
WITH test_site AS (
    SELECT id FROM sites WHERE domain = 'localhost:5173' LIMIT 1
)
INSERT INTO comments (
    site_id,
    page_url,
    content,
    author_name,
    author_email,
    depth,
    is_approved
)
SELECT 
    test_site.id,
    'https://kommentio.com/test-page',
    content_text,
    author_name,
    author_email,
    0,
    true
FROM test_site,
(VALUES 
    ('🚀 안녕하세요! Kommentio v0.2.1 Supabase 실제 연동 테스트입니다!', 'Kommentio 개발자', 'dev@kommentio.com'),
    ('✨ Mock 모드에서 실제 데이터베이스 연동으로 성공적으로 전환되었습니다!', 'QA 테스터', 'qa@kommentio.com'),
    ('💬 실시간 댓글 업데이트도 잘 작동하나요? 테스트해보겠습니다.', '실시간 테스터', 'realtime@kommentio.com'),
    ('🔐 익명 댓글 작성도 가능한지 확인해보세요!', '익명 사용자', null),
    ('👍 좋아요 기능과 답글 기능도 모두 테스트해주세요.', 'UI 테스터', 'ui@kommentio.com')
) AS test_comments(content_text, author_name, author_email);

-- 답글 테스트 데이터 생성
WITH test_site AS (
    SELECT id FROM sites WHERE domain = 'localhost:5173' LIMIT 1
),
parent_comments AS (
    SELECT c.id, row_number() OVER (ORDER BY c.created_at) as rn
    FROM comments c
    JOIN test_site ts ON c.site_id = ts.id
    WHERE c.depth = 0
)
INSERT INTO comments (
    site_id,
    page_url,
    content,
    parent_id,
    author_name,
    author_email,
    depth,
    is_approved
)
SELECT 
    test_site.id,
    'https://kommentio.com/test-page',
    reply_content,
    pc.id,
    reply_author,
    reply_email,
    1,
    true
FROM test_site,
parent_comments pc,
(VALUES 
    ('👍 정말 잘 작동하네요! 실제 DB 연동이 성공적입니다.', '답글 테스터 1', 'reply1@kommentio.com'),
    ('⚡ 실시간 업데이트가 정말 빠르네요! 인상적입니다.', '답글 테스터 2', 'reply2@kommentio.com'),
    ('🎉 Kommentio가 Disqus보다 훨씬 가볍고 빠른 것 같아요!', '만족한 사용자', 'satisfied@kommentio.com')
) AS test_replies(reply_content, reply_author, reply_email)
WHERE pc.rn <= 3;

-- 좋아요 테스트 데이터
WITH test_comments AS (
    SELECT c.id, row_number() OVER (ORDER BY c.created_at) as rn
    FROM comments c
    JOIN sites s ON c.site_id = s.id
    WHERE s.domain = 'localhost:5173'
    LIMIT 5
)
INSERT INTO comment_likes (comment_id, user_ip)
SELECT tc.id, ('127.0.0.' || tc.rn)::inet
FROM test_comments tc;

-- 댓글 카운트 업데이트
UPDATE comments 
SET likes_count = (
    SELECT COUNT(*) 
    FROM comment_likes 
    WHERE comment_id = comments.id
),
replies_count = (
    SELECT COUNT(*) 
    FROM comments AS replies 
    WHERE replies.parent_id = comments.id
    AND replies.is_deleted = false
)
WHERE site_id IN (
    SELECT id FROM sites WHERE domain = 'localhost:5173'
);

-- ============================================================================
-- 4. 설정 완료 확인
-- ============================================================================

-- 생성된 데이터 확인
SELECT 
    '📊 설정 완료 - 데이터 확인' as status,
    COUNT(*) as total_comments,
    COUNT(*) FILTER (WHERE depth = 0) as root_comments,
    COUNT(*) FILTER (WHERE depth = 1) as replies,
    SUM(likes_count) as total_likes
FROM comments c
JOIN sites s ON c.site_id = s.id
WHERE s.domain = 'localhost:5173'
AND c.is_deleted = false;

-- 사이트 정보 확인
SELECT 
    '🏠 사이트 정보' as info,
    name,
    domain,
    description,
    settings,
    created_at
FROM sites 
WHERE domain = 'localhost:5173';

-- 최종 메시지
SELECT '🎉 Kommentio v0.2.1 Supabase 설정 완료!' as message;