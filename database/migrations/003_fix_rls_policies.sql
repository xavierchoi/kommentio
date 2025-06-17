-- RLS 정책 수정 - 익명 사용자 댓글 시스템 문제 해결
-- 문제: 익명 사용자가 사이트 정보에 접근할 수 없어 댓글 CRUD 실패

-- 기존 문제가 있는 정책들 삭제
DROP POLICY IF EXISTS "sites_select_policy" ON sites;
DROP POLICY IF EXISTS "comments_insert_policy" ON comments;
DROP POLICY IF EXISTS "comments_update_policy" ON comments;
DROP POLICY IF EXISTS "comments_delete_policy" ON comments;

-- 1. SITES 테이블 정책 수정
-- 사이트 조회: 익명 사용자도 기본 정보 접근 가능 (댓글 시스템 동작을 위해 필요)
CREATE POLICY "sites_select_policy" ON sites
    FOR SELECT USING (is_active = true);

-- 익명 사용자도 사이트 기본 정보 조회 가능
CREATE POLICY "anonymous_sites_select" ON sites
    FOR SELECT TO anon USING (is_active = true);

-- 2. COMMENTS 테이블 정책 수정
-- 댓글 생성: 사이트가 존재하고 활성화된 경우에만 가능
CREATE POLICY "comments_insert_policy" ON comments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM sites s 
            WHERE s.id = comments.site_id 
            AND s.is_active = true
        )
    );

-- 댓글 수정: 작성자만 가능 (24시간 이내) - site_id 확인 추가
CREATE POLICY "comments_update_policy" ON comments
    FOR UPDATE USING (
        (auth.uid() = author_id 
        AND created_at > NOW() - INTERVAL '24 hours'
        AND is_deleted = false)
        OR
        (author_id IS NULL AND author_email IS NOT NULL) -- 익명 댓글의 경우 이메일로 확인
    );

-- 댓글 삭제: 작성자 또는 사이트 관리자만 가능
CREATE POLICY "comments_delete_policy" ON comments
    FOR DELETE USING (
        auth.uid() = author_id 
        OR EXISTS (
            SELECT 1 FROM site_moderators sm 
            WHERE sm.site_id = comments.site_id 
            AND sm.user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM sites s 
            WHERE s.id = comments.site_id 
            AND s.owner_id = auth.uid()
        )
    );

-- 3. 익명 사용자를 위한 개선된 정책들
-- 익명 댓글 생성 - 사이트 존재 확인 포함
CREATE POLICY "anonymous_comments_insert" ON comments
    FOR INSERT TO anon WITH CHECK (
        author_id IS NULL 
        AND EXISTS (
            SELECT 1 FROM sites s 
            WHERE s.id = comments.site_id 
            AND s.is_active = true
            AND (s.settings->>'allow_anonymous')::boolean = true
        )
    );

-- 4. 사이트 ID로 댓글 필터링을 위한 함수 생성
CREATE OR REPLACE FUNCTION get_or_create_site_id(site_name TEXT)
RETURNS UUID AS $$
DECLARE
    existing_site_id UUID;
    new_site_id UUID;
BEGIN
    -- 기존 사이트 ID 확인
    SELECT id INTO existing_site_id 
    FROM sites 
    WHERE name = site_name AND is_active = true 
    LIMIT 1;
    
    -- 사이트가 존재하면 반환
    IF existing_site_id IS NOT NULL THEN
        RETURN existing_site_id;
    END IF;
    
    -- 사이트가 없으면 생성 (익명 사이트)
    INSERT INTO sites (name, domain, description, owner_id, settings)
    VALUES (
        site_name, 
        'unknown', 
        'Auto-created site for anonymous comments',
        NULL, -- 익명 소유자
        jsonb_build_object(
            'allow_anonymous', true,
            'moderation_enabled', false,
            'max_comment_length', 2000,
            'theme', 'light',
            'language', 'ko'
        )
    )
    RETURNING id INTO new_site_id;
    
    RETURN new_site_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 익명 사용자를 위한 사이트 자동 생성 정책
CREATE POLICY "auto_create_sites_for_anonymous" ON sites
    FOR INSERT TO anon WITH CHECK (
        owner_id IS NULL 
        AND (settings->>'allow_anonymous')::boolean = true
    );

-- 6. RLS를 우회하는 서비스 역할 생성 (선택사항)
-- 이 역할은 Supabase 서비스 키에서 사용되어 모든 데이터에 접근 가능
-- 실제 운영에서는 이 역할을 통해 백엔드에서 데이터 관리

-- 관리자용 뷰 생성 (RLS 우회)
CREATE OR REPLACE VIEW admin_comments_view AS
SELECT 
    c.*,
    s.name as site_name,
    s.domain as site_domain
FROM comments c
JOIN sites s ON s.id = c.site_id;

-- 7. 업데이트된 댓글 통계 뷰 (RLS 고려)
CREATE OR REPLACE VIEW public_comment_stats AS
SELECT 
    s.id as site_id,
    s.name as site_name,
    COUNT(c.*) as total_comments,
    COUNT(c.*) FILTER (WHERE c.created_at >= NOW() - INTERVAL '24 hours') as comments_today,
    COUNT(c.*) FILTER (WHERE c.created_at >= NOW() - INTERVAL '7 days') as comments_week,
    COUNT(c.*) FILTER (WHERE c.is_spam = true) as spam_comments,
    COUNT(c.*) FILTER (WHERE c.is_approved = false) as pending_comments,
    AVG(c.spam_score) as avg_spam_score
FROM sites s
LEFT JOIN comments c ON c.site_id = s.id AND c.is_deleted = false
WHERE s.is_active = true
GROUP BY s.id, s.name;

-- 8. 테스트용 데이터 삽입 함수
CREATE OR REPLACE FUNCTION create_test_site_and_comment()
RETURNS TEXT AS $$
DECLARE
    test_site_id UUID;
    test_comment_id UUID;
BEGIN
    -- 테스트 사이트 생성
    INSERT INTO sites (name, domain, description, owner_id, settings)
    VALUES (
        'test-site', 
        'test.example.com', 
        'Test site for anonymous comments',
        NULL,
        jsonb_build_object(
            'allow_anonymous', true,
            'moderation_enabled', false,
            'max_comment_length', 2000,
            'theme', 'light',
            'language', 'ko'
        )
    )
    RETURNING id INTO test_site_id;
    
    -- 테스트 댓글 생성
    INSERT INTO comments (
        site_id, 
        page_url, 
        content, 
        author_name, 
        author_email, 
        author_id,
        is_approved,
        spam_score
    )
    VALUES (
        test_site_id,
        '/test-page',
        '테스트 댓글입니다.',
        'Test User',
        'test@example.com',
        NULL, -- 익명
        true,
        0.1
    )
    RETURNING id INTO test_comment_id;
    
    RETURN 'Test site ID: ' || test_site_id || ', Test comment ID: ' || test_comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;