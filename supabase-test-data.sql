-- Kommentio v0.2.1 Supabase 실제 연동 테스트 데이터
-- SQL 에디터에서 실행하여 테스트 데이터 생성

-- 1. 테스트 사이트 생성 (RLS 우회를 위해 직접 삽입)
INSERT INTO sites (id, name, domain, description, settings, is_active)
VALUES (
    gen_random_uuid(),
    'Kommentio 테스트 사이트 v0.2.1',
    'localhost:5173',
    'Supabase 실제 연동 테스트용 사이트',
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
    updated_at = NOW();

-- 2. 테스트 댓글 생성 (사이트 ID를 가져와서 삽입)
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
    '🚀 안녕하세요! 이것은 Supabase 실제 연동 테스트 댓글입니다.',
    'Kommentio 테스터',
    'test@kommentio.com',
    0,
    true
FROM test_site;

-- 3. 답글 테스트 댓글 생성
WITH test_site AS (
    SELECT id FROM sites WHERE domain = 'localhost:5173' LIMIT 1
),
parent_comment AS (
    SELECT c.id FROM comments c
    JOIN test_site ts ON c.site_id = ts.id
    WHERE c.depth = 0
    ORDER BY c.created_at DESC
    LIMIT 1
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
    '💬 이것은 테스트 답글입니다! 실시간 업데이트가 작동하나요?',
    parent_comment.id,
    '답글 테스터',
    'reply@kommentio.com',
    1,
    true
FROM test_site, parent_comment;

-- 4. 좋아요 테스트 데이터
WITH test_comment AS (
    SELECT c.id FROM comments c
    JOIN sites s ON c.site_id = s.id
    WHERE s.domain = 'localhost:5173'
    ORDER BY c.created_at DESC
    LIMIT 1
)
INSERT INTO comment_likes (comment_id, user_ip)
SELECT test_comment.id, '127.0.0.1'::inet
FROM test_comment
ON CONFLICT (comment_id, user_ip) DO NOTHING;

-- 5. 댓글 좋아요 수 업데이트
UPDATE comments 
SET likes_count = (
    SELECT COUNT(*) 
    FROM comment_likes 
    WHERE comment_id = comments.id
)
WHERE site_id IN (
    SELECT id FROM sites WHERE domain = 'localhost:5173'
);

-- 6. 답글 수 업데이트
UPDATE comments 
SET replies_count = (
    SELECT COUNT(*) 
    FROM comments AS replies 
    WHERE replies.parent_id = comments.id
    AND replies.is_deleted = false
)
WHERE site_id IN (
    SELECT id FROM sites WHERE domain = 'localhost:5173'
);

-- 테스트 데이터 확인 쿼리
SELECT 
    s.name as site_name,
    s.domain,
    c.content,
    c.author_name,
    c.depth,
    c.likes_count,
    c.replies_count,
    c.created_at
FROM comments c
JOIN sites s ON c.site_id = s.id
WHERE s.domain = 'localhost:5173'
AND c.is_deleted = false
ORDER BY c.created_at ASC;