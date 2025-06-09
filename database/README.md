# Kommentio 데이터베이스 설정

## Supabase 프로젝트 설정 방법

### 1. Supabase 프로젝트 생성
1. [Supabase](https://supabase.com) 접속
2. 새 프로젝트 생성
3. 프로젝트 이름: `kommentio`
4. 데이터베이스 비밀번호 설정

### 2. 데이터베이스 스키마 적용
Supabase SQL Editor에서 다음 순서로 실행:

```sql
-- 1. 기본 스키마 생성
\i 001_create_comments_schema.sql

-- 2. RLS 정책 설정
\i 002_setup_rls_policies.sql

-- 3. 개발용 데이터 (선택사항)
\i seeds/development_data.sql
```

### 3. 인증 설정
Supabase Dashboard > Authentication > Settings에서:

#### 소셜 로그인 프로바이더 설정
- **Google**: Google Console에서 OAuth 클라이언트 설정
- **GitHub**: GitHub Apps에서 OAuth 앱 설정  
- **Facebook**: Facebook Developers에서 앱 설정

#### 리다이렉트 URL 설정
```
http://localhost:3000 (개발용)
https://your-domain.com (프로덕션용)
```

### 4. 환경 변수 설정
프로젝트 루트에 `.env.local` 파일 생성:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 5. 위젯 설정
HTML에서 위젯 사용:

```html
<div 
  data-kommentio
  data-site-id="your-site-id"
  data-supabase-url="https://your-project.supabase.co"
  data-supabase-key="your-anon-key"
></div>
<script src="https://cdn.kommentio.com/widget/kommentio.js"></script>
```

## 데이터베이스 스키마 구조

### 테이블 관계도
```
sites (사이트 관리)
  ↓
comments (댓글/답글) ← comment_likes (좋아요)
  ↓                    ↓
spam_reports (신고)   site_moderators (관리자)
```

### 주요 테이블

#### `sites` - 사이트 관리
- 멀티테넌시 지원
- 사이트별 설정 (JSON)
- 관리 대시보드 연동

#### `comments` - 계층형 댓글
- 최대 3단계 깊이
- 익명/로그인 사용자 지원
- AI 스팸 점수 저장
- 소프트 삭제 지원

#### `comment_likes` - 좋아요 시스템
- 중복 방지 (사용자/IP별)
- 실시간 카운트 업데이트

## 성능 최적화

### 인덱스 전략
- `(site_id, page_url)`: 페이지별 댓글 조회
- `parent_id`: 답글 트리 구성
- `created_at DESC`: 최신순 정렬
- `domain`: 사이트 조회

### RLS 정책
- 사이트별 데이터 격리
- 사용자별 권한 제어
- 익명 사용자 지원

### 실시간 업데이트
```javascript
// Supabase Realtime 구독
supabase
  .channel('comments')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'comments' }, 
    handleRealtimeUpdate
  )
  .subscribe();
```

## 관리 대시보드 API

### 통계 조회
```sql
SELECT * FROM comment_stats WHERE site_id = 'your-site-id';
```

### 스팸 관리
```sql
-- 스팸 댓글 조회
SELECT * FROM comments WHERE is_spam = true;

-- 스팸 점수 기준 필터링  
SELECT * FROM comments WHERE spam_score > 0.8;
```

### 사용자 관리
```sql
-- 사이트 관리자 추가
INSERT INTO site_moderators (site_id, user_id, role) 
VALUES ('site-id', 'user-id', 'moderator');
```