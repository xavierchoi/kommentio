# 🔐 Kommentio 소셜 로그인 프로바이더 설정 가이드

Kommentio는 8개의 주요 소셜 로그인 프로바이더를 지원합니다. 관리자가 원하는 프로바이더만 선택적으로 활성화할 수 있습니다.

## 📋 지원하는 소셜 프로바이더

| 프로바이더 | Supabase 기본 지원 | 한국 사용자 | 글로벌 사용자 | 비즈니스 용도 |
|------------|-------------------|-------------|---------------|---------------|
| Google     | ✅               | ⭐⭐⭐        | ⭐⭐⭐⭐⭐      | ⭐⭐⭐⭐        |
| GitHub     | ✅               | ⭐⭐⭐        | ⭐⭐⭐⭐        | ⭐⭐⭐⭐⭐      |
| Facebook   | ✅               | ⭐⭐         | ⭐⭐⭐⭐⭐      | ⭐⭐          |
| X.com      | ✅               | ⭐⭐         | ⭐⭐⭐⭐        | ⭐⭐⭐         |
| Apple      | ✅               | ⭐⭐⭐        | ⭐⭐⭐⭐        | ⭐⭐⭐         |
| LinkedIn   | ✅               | ⭐           | ⭐⭐⭐         | ⭐⭐⭐⭐⭐      |
| KakaoTalk  | ⚠️ 커스텀 필요    | ⭐⭐⭐⭐⭐    | ⭐            | ⭐⭐          |
| LINE       | ⚠️ 커스텀 필요    | ⭐⭐         | ⭐⭐⭐         | ⭐            |

## 🚀 빠른 설정 (Supabase 기본 지원)

### 1. Google OAuth 설정

**설정 시간:** 5분 | **난이도:** ⭐⭐ | **추천도:** ⭐⭐⭐⭐⭐

```bash
# 1단계: Google Cloud Console 접속
https://console.cloud.google.com/

# 2단계: 새 프로젝트 생성 또는 기존 프로젝트 선택

# 3단계: OAuth 2.0 클라이언트 ID 생성
APIs & Services > Credentials > Create Credentials > OAuth 2.0 Client IDs

# 4단계: 승인된 리디렉션 URI 추가
https://[your-project-id].supabase.co/auth/v1/callback

# 5단계: Supabase 설정
Supabase Dashboard > Authentication > Providers > Google
- Enable: ON
- Client ID: [Google Client ID]
- Client Secret: [Google Client Secret]
```

**Kommentio 위젯 설정:**
```javascript
socialProviders: {
  google: { enabled: true, label: 'Google', color: '#4285f4', icon: '🔍' }
}
```

### 2. GitHub OAuth 설정

**설정 시간:** 3분 | **난이도:** ⭐ | **추천도:** ⭐⭐⭐⭐⭐

```bash
# 1단계: GitHub Settings 접속
https://github.com/settings/developers

# 2단계: OAuth Apps > New OAuth App

# 3단계: 앱 정보 입력
Application name: Kommentio Comments
Homepage URL: https://your-site.com
Authorization callback URL: https://[your-project-id].supabase.co/auth/v1/callback

# 4단계: Supabase 설정
Supabase Dashboard > Authentication > Providers > GitHub
- Enable: ON
- Client ID: [GitHub Client ID]
- Client Secret: [GitHub Client Secret]
```

### 3. Facebook OAuth 설정

**설정 시간:** 10분 | **난이도:** ⭐⭐⭐ | **추천도:** ⭐⭐⭐

```bash
# 1단계: Facebook Developers 접속
https://developers.facebook.com/

# 2단계: 새 앱 생성
My Apps > Create App > Consumer

# 3단계: Facebook 로그인 제품 추가
Add Product > Facebook Login > Web

# 4단계: Valid OAuth Redirect URIs 설정
https://[your-project-id].supabase.co/auth/v1/callback

# 5단계: Supabase 설정  
Supabase Dashboard > Authentication > Providers > Facebook
- Enable: ON
- Facebook App ID: [Facebook App ID]
- Facebook App Secret: [Facebook App Secret]
```

### 4. X.com (Twitter) OAuth 설정

**설정 시간:** 10분 | **난이도:** ⭐⭐⭐ | **추천도:** ⭐⭐⭐

```bash
# 1단계: Twitter Developer Portal 접속
https://developer.twitter.com/

# 2단계: 새 앱 생성 (API 키 필요)

# 3단계: OAuth 2.0 설정
User authentication settings > OAuth 2.0

# 4단계: Callback URL 설정
https://[your-project-id].supabase.co/auth/v1/callback

# 5단계: Supabase 설정
Supabase Dashboard > Authentication > Providers > Twitter
- Enable: ON
- Twitter Client ID: [Twitter Client ID]
- Twitter Client Secret: [Twitter Client Secret]
```

### 5. Apple OAuth 설정

**설정 시간:** 15분 | **난이도:** ⭐⭐⭐⭐ | **추천도:** ⭐⭐⭐

**요구사항:** Apple Developer 계정 ($99/년)

```bash
# 1단계: Apple Developer 접속
https://developer.apple.com/account/

# 2단계: Certificates, Identifiers & Profiles
Identifiers > App IDs 또는 Services IDs

# 3단계: Services ID 생성
Sign In with Apple > Configure

# 4단계: Return URLs 설정
https://[your-project-id].supabase.co/auth/v1/callback

# 5단계: Supabase 설정
Supabase Dashboard > Authentication > Providers > Apple
- Enable: ON
- Services ID: [Apple Services ID]
- Secret Key: [Apple Private Key]
```

### 6. LinkedIn OAuth 설정

**설정 시간:** 8분 | **난이도:** ⭐⭐⭐ | **추천도:** ⭐⭐⭐⭐ (비즈니스)

```bash
# 1단계: LinkedIn Developers 접속
https://www.linkedin.com/developers/

# 2단계: 새 앱 생성
My Apps > Create App

# 3단계: OAuth 2.0 설정
Products > Sign In with LinkedIn

# 4단계: Redirect URLs 설정
https://[your-project-id].supabase.co/auth/v1/callback

# 5단계: Supabase 설정
Supabase Dashboard > Authentication > Providers > LinkedIn
- Enable: ON
- LinkedIn Client ID: [LinkedIn Client ID]
- LinkedIn Client Secret: [LinkedIn Client Secret]
```

## 🔧 고급 설정 (커스텀 구현 필요)

### 7. KakaoTalk OAuth 설정

**설정 시간:** 30분 | **난이도:** ⭐⭐⭐⭐ | **추천도:** ⭐⭐⭐⭐⭐ (한국)

**참고:** Supabase에서 기본 지원하지 않으므로 커스텀 구현이 필요합니다.

```bash
# 1단계: Kakao Developers 접속
https://developers.kakao.com/

# 2단계: 애플리케이션 생성

# 3단계: 플랫폼 설정
앱 설정 > 플랫폼 > Web 플랫폼 등록

# 4단계: Redirect URI 설정
https://[your-project-id].supabase.co/auth/v1/callback

# 5단계: 커스텀 OAuth 핸들러 구현 필요
# Supabase에서 기본 지원하지 않으므로 별도 구현 필요
```

**구현 방법:**
1. Kakao OAuth 2.0 API 직접 호출
2. 토큰 검증 후 Supabase `signInWithIdToken()` 사용
3. 커스텀 JWT 생성 및 검증

### 8. LINE OAuth 설정

**설정 시간:** 30분 | **난이도:** ⭐⭐⭐⭐ | **추천도:** ⭐⭐⭐ (동남아시아)

```bash
# 1단계: LINE Developers 접속
https://developers.line.biz/

# 2단계: 새 채널 생성
Provider 선택 > New Channel > LINE Login

# 3단계: LINE 로그인 설정

# 4단계: Callback URL 설정
https://[your-project-id].supabase.co/auth/v1/callback

# 5단계: 커스텀 OAuth 핸들러 구현 필요
```

## 📊 관리 대시보드에서 프로바이더 관리

### API 사용 예시

```javascript
// Admin API 인스턴스 생성
const adminAPI = new KommentioAdminAPI(supabaseUrl, supabaseKey);
await adminAPI.init();

// 현재 소셜 프로바이더 설정 조회
const providers = await adminAPI.getSocialProviders(siteId);

// 특정 프로바이더 활성화/비활성화
await adminAPI.toggleSocialProvider(siteId, 'kakao', true);

// 대량 설정
await adminAPI.configureSocialProviders(siteId, {
  google: true,
  github: true,
  kakao: true,
  line: false
});

// 프로바이더 사용 통계 조회
const stats = await adminAPI.getSocialProviderStats(siteId);
// 결과: { google: 150, github: 89, kakao: 45, ... }
```

### HTML 위젯에서 동적 설정

```html
<div 
  data-kommentio
  data-site-id="my-blog"
  data-social-providers="google,github,kakao"
></div>

<script>
// 런타임에서 프로바이더 변경
window.kommentio.updateSocialProviders({
  google: { enabled: true, label: 'Google', color: '#4285f4', icon: '🔍' },
  kakao: { enabled: true, label: '카카오톡', color: '#fee500', icon: '💬' }
});
</script>
```

## 🎯 권장 프로바이더 조합

### 한국 사이트 (기술 블로그)
```javascript
socialProviders: {
  google: { enabled: true },   // 필수
  github: { enabled: true },   // 개발자용
  kakao: { enabled: true },    // 한국 사용자용
  line: { enabled: false }
}
```

### 글로벌 사이트 (일반 블로그)
```javascript
socialProviders: {
  google: { enabled: true },   // 필수
  facebook: { enabled: true }, // 글로벌 사용자
  twitter: { enabled: true },  // 실시간 토론
  apple: { enabled: true }     // iOS 사용자
}
```

### 비즈니스 사이트 (전문 콘텐츠)
```javascript
socialProviders: {
  google: { enabled: true },   // 필수
  linkedin: { enabled: true }, // 전문가
  apple: { enabled: true },    // 프라이버시 중시
  github: { enabled: false }
}
```

## 🔍 트러블슈팅

### 일반적인 문제들

1. **"Provider not configured" 오류**
   - Supabase에서 해당 프로바이더가 활성화되었는지 확인
   - Client ID/Secret이 올바르게 입력되었는지 확인

2. **리다이렉트 URI 불일치**
   - 각 프로바이더에서 설정한 콜백 URL 확인
   - `https://[project-id].supabase.co/auth/v1/callback` 정확히 입력

3. **스코프 권한 부족**
   - 각 프로바이더에서 요구하는 최소 스코프 확인
   - 이메일 주소 접근 권한 필수

4. **Kakao/LINE 로그인 실패**
   - 현재 기본 지원하지 않음
   - 커스텀 구현 또는 Phase 2 업데이트 대기

## 🎉 완료!

설정이 완료되면 댓글 위젯에서 선택한 소셜 프로바이더들이 표시됩니다. 사용자들은 원하는 방식으로 로그인하여 댓글을 작성할 수 있습니다.

**질문이나 문제가 있으시면 GitHub Issues에서 문의해주세요!**