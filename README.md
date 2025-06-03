# 🚀 Kommentio

**오픈소스 댓글 시스템 - 광고 없는 Disqus 대체제**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Bundle Size](https://img.shields.io/badge/bundle%20size-19.85KB-brightgreen.svg)
![Gzipped](https://img.shields.io/badge/gzipped-6.57KB-brightgreen.svg)

## ✨ 주요 특징

- 🆓 **완전 무료** - 광고 없음, 비용 없음
- ⚡ **초경량** - 19.85KB (Disqus 대비 96% 작음)
- 🔐 **8개 소셜 로그인** - Google, GitHub, Facebook, X.com, Apple, LinkedIn, KakaoTalk, LINE
- 🤖 **AI 스팸 방지** - Claude Haiku 기반 지능형 필터링
- 🔄 **실시간 업데이트** - Supabase Realtime
- 🌍 **다국어 지원** - 한국어, 영어 (확장 가능)
- 🎨 **테마 지원** - 라이트/다크 모드
- 📱 **반응형** - 모든 디바이스 호환

## 🎯 vs. Disqus 비교

| 항목 | Kommentio | Disqus |
|------|-----------|--------|
| 가격 | **완전 무료** | $11+/월 |
| 광고 | **없음** | 강제 광고 |
| 번들 크기 | **19.85KB** | ~500KB |
| 소셜 로그인 | **8개** | 3개 |
| 설정 시간 | **1분** | 10분+ |
| 한국 로그인 | **카카오톡, 라인** | 없음 |

## 🚀 빠른 시작

### 1. 기본 설치 (1분 완성!)

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Blog</title>
</head>
<body>
    <!-- 여기에 블로그 내용 -->
    
    <!-- Kommentio 위젯 -->
    <div data-kommentio data-site-id="my-blog"></div>
    <script src="https://cdn.kommentio.com/widget/kommentio.js"></script>
</body>
</html>
```

### 2. Jekyll/Hugo 블로그에 설치

```markdown
---
layout: post
title: "My Blog Post"
---

블로그 포스트 내용...

<!-- 댓글 섹션 -->
<div data-kommentio data-site-id="{{ site.title }}"></div>
<script src="https://cdn.kommentio.com/widget/kommentio.js"></script>
```

### 3. 고급 설정

```html
<div 
  data-kommentio
  data-site-id="my-blog"
  data-theme="dark"
  data-language="ko"
  data-supabase-url="https://xxx.supabase.co"
  data-supabase-key="your-anon-key"
  data-claude-api-key="your-claude-key"
></div>
```

## 🔐 소셜 로그인 설정

### 기본 제공 (Supabase 지원)
- ✅ **Google** - 가장 보편적
- ✅ **GitHub** - 개발자 커뮤니티
- ✅ **Facebook** - 일반 사용자
- ✅ **X.com** - 실시간 토론
- ✅ **Apple** - iOS 사용자
- ✅ **LinkedIn** - 비즈니스

### 한국 특화 (커스텀 구현)
- 🇰🇷 **KakaoTalk** - 한국 필수
- 🇯🇵 **LINE** - 일본/동남아시아

### 동적 설정 변경

```javascript
// 한국 사이트용
window.kommentio.updateSocialProviders({
  google: { enabled: true },
  github: { enabled: true },
  kakao: { enabled: true },
  line: { enabled: true }
});

// 글로벌 사이트용
window.kommentio.updateSocialProviders({
  google: { enabled: true },
  facebook: { enabled: true },
  twitter: { enabled: true },
  apple: { enabled: true }
});
```

## 🛠️ 개발 환경 설정

### 요구사항
- Node.js 18+
- npm 9+

### 로컬 개발

```bash
# 저장소 클론
git clone https://github.com/username/kommentio.git
cd kommentio

# 의존성 설치
npm install

# 개발 서버 시작 (Mock 모드)
npm run dev

# 위젯 빌드
npm run build:widget
```

### Mock 모드
Supabase 설정 없이도 모든 기능을 테스트할 수 있습니다:
- ✅ 가짜 댓글 데이터
- ✅ 소셜 로그인 시뮬레이션
- ✅ 실시간 업데이트 시뮬레이션
- ✅ 스팸 필터링 시뮬레이션

## 🏗️ 아키텍처

```
kommentio/
├── src/
│   ├── kommentio.js          # 메인 위젯 (19.85KB)
│   └── api/
│       └── admin-api.js      # 관리 대시보드 API
├── database/
│   ├── migrations/           # Supabase 스키마
│   └── seeds/               # 테스트 데이터
├── docs/                    # 설정 가이드
├── dist/widget/             # 배포용 빌드
└── backup/react-src/        # 원본 React 구현
```

## 📊 관리 대시보드

```javascript
// Admin API 사용 예시
const adminAPI = new KommentioAdminAPI(supabaseUrl, supabaseKey);

// 사이트 통계
const stats = await adminAPI.getDashboardStats();

// 댓글 관리
await adminAPI.approveComment(commentId);
await adminAPI.markAsSpam(commentId);

// 소셜 프로바이더 관리
await adminAPI.toggleSocialProvider(siteId, 'kakao', true);
```

## 🔧 Supabase 설정

1. [Supabase](https://supabase.com) 프로젝트 생성
2. 데이터베이스 마이그레이션 실행:
   ```sql
   -- database/migrations/ 파일들을 순서대로 실행
   ```
3. 소셜 로그인 프로바이더 설정
4. 환경 변수 설정

자세한 설정 방법: [docs/SOCIAL_PROVIDERS_SETUP.md](./docs/SOCIAL_PROVIDERS_SETUP.md)

## 🤖 AI 스팸 필터링

Claude Haiku API를 사용한 지능형 스팸 감지:

```javascript
// 자동 스팸 점수 계산 (0.0 ~ 1.0)
// 0.7 이상이면 자동 차단
const spamData = await checkSpamWithClaude(commentContent);
```

## 🌍 다국어 지원

현재 지원 언어:
- 🇰🇷 한국어 (기본)
- 🇺🇸 영어

추가 언어 확장 가능.

## 📈 성능

- **번들 크기**: 19.85KB (목표 50KB 대비 60% 절약)
- **압축 크기**: 6.57KB
- **로딩 시간**: < 0.5초
- **브라우저 호환**: Chrome 90+, Firefox 88+, Safari 14+

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능합니다.

## 🙏 후원

이 프로젝트가 도움이 되었다면:
- ⭐ GitHub 스타 부탁드립니다
- 🐛 버그 리포트나 기능 제안 환영
- 💝 [후원하기](https://github.com/sponsors/username)

## 📞 지원

- 📚 [문서](./docs/)
- 🐛 [Issues](https://github.com/username/kommentio/issues)
- 💬 [Discussions](https://github.com/username/kommentio/discussions)

---

**Made with ❤️ by developers, for developers**

**Disqus를 대체할 진정한 오픈소스 솔루션** 🚀