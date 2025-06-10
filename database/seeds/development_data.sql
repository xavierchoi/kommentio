-- 개발용 테스트 데이터
-- 실제 프로덕션에서는 사용하지 말 것

-- 테스트 사이트 생성 (UUID는 개발용 고정값)
INSERT INTO sites (id, name, domain, description, owner_id, settings) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440001',
    'Kommentio 데모 사이트',
    'localhost:3000',
    'Kommentio 위젯의 데모와 테스트를 위한 사이트입니다.',
    NULL, -- 익명으로 생성 (개발용)
    '{
        "allow_anonymous": true,
        "moderation_enabled": false,
        "max_comment_length": 2000,
        "theme": "light",
        "language": "ko",
        "claude_api_key": null
    }'
) ON CONFLICT (id) DO NOTHING;

-- 테스트 댓글 생성
INSERT INTO comments (
    id, site_id, page_url, content, parent_id, depth,
    author_name, author_email, likes_count, created_at
) VALUES 
-- 최상위 댓글들
(
    '550e8400-e29b-41d4-a716-446655440010',
    '550e8400-e29b-41d4-a716-446655440001',
    '/',
    'Kommentio 정말 좋네요! Disqus보다 훨씬 빠르고 깔끔한 것 같아요. 👍',
    NULL,
    0,
    '김개발',
    'dev@example.com',
    5,
    NOW() - INTERVAL '2 hours'
),
(
    '550e8400-e29b-41d4-a716-446655440011',
    '550e8400-e29b-41d4-a716-446655440001', 
    '/',
    '오픈소스라서 더욱 신뢰가 갑니다. 광고도 없고 완전 무료라니 최고예요!',
    NULL,
    0,
    '박코더',
    'coder@example.com',
    3,
    NOW() - INTERVAL '1 hour'
),
(
    '550e8400-e29b-41d4-a716-446655440012',
    '550e8400-e29b-41d4-a716-446655440001',
    '/',
    'AI 스팸 필터링이 정말 신기하네요. Claude API를 이렇게 활용할 수 있다니!',
    NULL,
    0,
    '이AI',
    'ai@example.com', 
    7,
    NOW() - INTERVAL '30 minutes'
),

-- 답글들 (1단계)
(
    '550e8400-e29b-41d4-a716-446655440020',
    '550e8400-e29b-41d4-a716-446655440001',
    '/',
    '맞아요! 로딩 속도가 정말 빨라요. React 없이 Vanilla JS로 만든 덕분인 것 같아요.',
    '550e8400-e29b-41d4-a716-446655440010',
    1,
    '최성능',
    'performance@example.com',
    2,
    NOW() - INTERVAL '90 minutes'
),
(
    '550e8400-e29b-41d4-a716-446655440021',
    '550e8400-e29b-41d4-a716-446655440001',
    '/',
    '저도 제 블로그에 설치해봤는데 정말 간단하더라고요. 한 줄만 추가하면 끝!',
    '550e8400-e29b-41d4-a716-446655440011',
    1,
    '블로거',
    'blogger@example.com',
    1,
    NOW() - INTERVAL '45 minutes'
),

-- 답글의 답글들 (2단계)
(
    '550e8400-e29b-41d4-a716-446655440030',
    '550e8400-e29b-41d4-a716-446655440001',
    '/',
    '번들 사이즈가 50KB 이하라니 정말 놀랍네요! 😮',
    '550e8400-e29b-41d4-a716-446655440020',
    2,
    '경량화매니아',
    'lightweight@example.com',
    0,
    NOW() - INTERVAL '60 minutes'
),

-- 최근 댓글
(
    '550e8400-e29b-41d4-a716-446655440040',
    '550e8400-e29b-41d4-a716-446655440001',
    '/',
    '한국어 지원도 완벽하고, 다크모드도 예쁘네요! 🌙',
    NULL,
    0,
    '디자이너',
    'designer@example.com',
    1,
    NOW() - INTERVAL '10 minutes'
),

-- 긴 댓글 테스트
(
    '550e8400-e29b-41d4-a716-446655440050',
    '550e8400-e29b-41d4-a716-446655440001',
    '/',
    '정말 인상적인 프로젝트네요! 

PRD를 보니 정말 체계적으로 계획된 것 같아요:
- 완전 무료 + 광고 없음 ✅
- 원클릭 설정 ✅  
- 포괄적 소셜 로그인 ✅
- AI 스팸 방지 ✅
- 고성능 ✅

개발자분들 정말 수고 많으셨어요! 🚀',
    NULL,
    0,
    '프로젝트매니저',
    'pm@example.com',
    4,
    NOW() - INTERVAL '5 minutes'
);

-- 좋아요 테스트 데이터
INSERT INTO comment_likes (comment_id, user_ip) VALUES
('550e8400-e29b-41d4-a716-446655440010', '192.168.1.1'),
('550e8400-e29b-41d4-a716-446655440010', '192.168.1.2'),
('550e8400-e29b-41d4-a716-446655440010', '192.168.1.3'),
('550e8400-e29b-41d4-a716-446655440011', '192.168.1.4'),
('550e8400-e29b-41d4-a716-446655440012', '192.168.1.5');

-- 스팸 댓글 예시 (테스트용)
INSERT INTO comments (
    id, site_id, page_url, content, author_name, 
    is_spam, spam_score, spam_reason, created_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440090',
    '550e8400-e29b-41d4-a716-446655440001',
    '/',
    'AMAZING OFFER!!! Click here to win $1000000!!! Visit: spam-site.com',
    'SpamBot9000',
    true,
    0.95,
    'Claude detected promotional content and suspicious URL',
    NOW() - INTERVAL '3 hours'
) ON CONFLICT (id) DO NOTHING;