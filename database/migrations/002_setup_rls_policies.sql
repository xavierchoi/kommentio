-- Row Level Security (RLS) 정책 설정
-- 데이터 보안과 멀티테넌시를 위한 접근 제어

-- RLS 활성화
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE spam_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_moderators ENABLE ROW LEVEL SECURITY;

-- 1. SITES 테이블 정책
-- 사이트 조회: 모든 사용자 가능 (활성 사이트만)
CREATE POLICY "sites_select_policy" ON sites
    FOR SELECT USING (is_active = true);

-- 사이트 생성: 인증된 사용자만 가능
CREATE POLICY "sites_insert_policy" ON sites
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- 사이트 수정: 소유자만 가능
CREATE POLICY "sites_update_policy" ON sites
    FOR UPDATE USING (auth.uid() = owner_id);

-- 사이트 삭제: 소유자만 가능
CREATE POLICY "sites_delete_policy" ON sites
    FOR DELETE USING (auth.uid() = owner_id);

-- 2. COMMENTS 테이블 정책
-- 댓글 조회: 모든 사용자 가능 (삭제되지 않은 댓글만)
CREATE POLICY "comments_select_policy" ON comments
    FOR SELECT USING (is_deleted = false);

-- 댓글 생성: 모든 사용자 가능 (익명 포함)
CREATE POLICY "comments_insert_policy" ON comments
    FOR INSERT WITH CHECK (true);

-- 댓글 수정: 작성자만 가능 (24시간 이내)
CREATE POLICY "comments_update_policy" ON comments
    FOR UPDATE USING (
        auth.uid() = author_id 
        AND created_at > NOW() - INTERVAL '24 hours'
        AND is_deleted = false
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
    );

-- 3. COMMENT_LIKES 테이블 정책
-- 좋아요 조회: 모든 사용자 가능
CREATE POLICY "comment_likes_select_policy" ON comment_likes
    FOR SELECT USING (true);

-- 좋아요 생성: 인증된 사용자만 (중복 방지는 UNIQUE 제약조건으로)
CREATE POLICY "comment_likes_insert_policy" ON comment_likes
    FOR INSERT WITH CHECK (
        auth.uid() = user_id 
        OR (auth.uid() IS NULL AND user_ip IS NOT NULL)
    );

-- 좋아요 삭제: 본인만 가능
CREATE POLICY "comment_likes_delete_policy" ON comment_likes
    FOR DELETE USING (auth.uid() = user_id);

-- 4. SPAM_REPORTS 테이블 정책
-- 스팸 신고 조회: 사이트 관리자만 가능
CREATE POLICY "spam_reports_select_policy" ON spam_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM site_moderators sm 
            JOIN comments c ON c.id = spam_reports.comment_id
            WHERE sm.site_id = c.site_id 
            AND sm.user_id = auth.uid()
        )
    );

-- 스팸 신고 생성: 모든 사용자 가능
CREATE POLICY "spam_reports_insert_policy" ON spam_reports
    FOR INSERT WITH CHECK (true);

-- 5. SITE_MODERATORS 테이블 정책
-- 관리자 조회: 해당 사이트 관리자만 가능
CREATE POLICY "site_moderators_select_policy" ON site_moderators
    FOR SELECT USING (
        user_id = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM sites s 
            WHERE s.id = site_moderators.site_id 
            AND s.owner_id = auth.uid()
        )
    );

-- 관리자 추가: 사이트 소유자만 가능
CREATE POLICY "site_moderators_insert_policy" ON site_moderators
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM sites s 
            WHERE s.id = site_moderators.site_id 
            AND s.owner_id = auth.uid()
        )
    );

-- 관리자 수정: 사이트 소유자만 가능
CREATE POLICY "site_moderators_update_policy" ON site_moderators
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM sites s 
            WHERE s.id = site_moderators.site_id 
            AND s.owner_id = auth.uid()
        )
    );

-- 관리자 삭제: 사이트 소유자 또는 본인만 가능
CREATE POLICY "site_moderators_delete_policy" ON site_moderators
    FOR DELETE USING (
        user_id = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM sites s 
            WHERE s.id = site_moderators.site_id 
            AND s.owner_id = auth.uid()
        )
    );

-- 익명 사용자를 위한 특별 정책들
-- 익명 댓글 조회 (Supabase anon key 사용시)
CREATE POLICY "anonymous_comments_select" ON comments
    FOR SELECT TO anon USING (is_deleted = false);

-- 익명 댓글 생성
CREATE POLICY "anonymous_comments_insert" ON comments
    FOR INSERT TO anon WITH CHECK (author_id IS NULL);

-- 익명 좋아요 (IP 기반)
CREATE POLICY "anonymous_likes_insert" ON comment_likes
    FOR INSERT TO anon WITH CHECK (user_id IS NULL AND user_ip IS NOT NULL);

-- 익명 스팸 신고
CREATE POLICY "anonymous_spam_reports_insert" ON spam_reports
    FOR INSERT TO anon WITH CHECK (reporter_id IS NULL AND reporter_ip IS NOT NULL);