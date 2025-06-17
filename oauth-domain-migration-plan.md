# 🔐 OAuth 프로바이더 도메인 마이그레이션 계획 - kommentio.tech

## 🎯 우선순위 기반 업데이트 순서

### 🔥 즉시 우선순위 (High Priority)
1. **Google OAuth Console** ⭐⭐⭐
   - 가장 많이 사용되는 프로바이더
   - 업데이트 URL: https://console.developers.google.com/apis/credentials
   - 변경 항목: 승인된 JavaScript 원본, 리디렉션 URI

2. **GitHub OAuth App** ⭐⭐⭐
   - 개발자 친화적, 기술 사용자 대상
   - 업데이트 URL: https://github.com/settings/developers
   - 변경 항목: Homepage URL, Authorization callback URL

3. **Supabase Site URL** ⭐⭐⭐
   - 필수 백엔드 설정
   - 업데이트 URL: Supabase Dashboard > Authentication > Settings
   - 변경 항목: Site URL, Additional Redirect URLs

### 📋 단계별 업데이트 (Medium Priority)
4. **Kakao Developers** ⭐⭐
   - 한국 사용자 대상으로 중요
   - 업데이트 URL: https://developers.kakao.com/console/app
   - 변경 항목: 플랫폼 도메인, Redirect URI

5. **Facebook for Developers** ⭐⭐
   - 글로벌 사용자 기반
   - 업데이트 URL: https://developers.facebook.com/apps/
   - 변경 항목: 앱 도메인, OAuth 리디렉션 URI

6. **X(Twitter) Developer Portal** ⭐⭐
   - 이미 가이드 업데이트 완료
   - 업데이트 URL: https://developer.twitter.com/en/portal/dashboard
   - 변경 항목: Website URL, Callback URLs, Terms/Privacy URLs

### 🔧 고급 설정 (Lower Priority)  
7. **Apple Developer Console** ⭐
   - 가장 복잡한 설정이지만 프리미엄 사용자 대상
   - 업데이트 URL: https://developer.apple.com/account/resources/identifiers/
   - 변경 항목: Service ID 도메인, Return URLs

8. **LinkedIn Developer Console** ⭐
   - 비즈니스 사용자 대상
   - 업데이트 URL: https://www.linkedin.com/developers/apps/
   - 변경 항목: Authorized redirect URLs, Website URL

## 📝 각 프로바이더별 상세 업데이트 내용

### 1. Google OAuth Console
```
기존: xavierchoi.github.io
새로운 설정:

승인된 JavaScript 원본:
- https://kommentio.tech
- https://xavierchoi.github.io (백업용 유지)

승인된 리디렉션 URI:
- https://kommentio.tech/auth/callback/google
- https://kommentio.tech (루트 도메인)
- https://xavierchoi.github.io/kommentio/auth/callback/google (백업용)
```

### 2. GitHub OAuth App
```
기존: https://xavierchoi.github.io/kommentio
새로운 설정:

Homepage URL:
- https://kommentio.tech

Authorization callback URL:
- https://kommentio.tech/auth/callback/github
- https://xavierchoi.github.io/kommentio/auth/callback/github (백업용)
```

### 3. Supabase Authentication Settings
```
Site URL:
- 기존: https://xavierchoi.github.io/kommentio
- 새 값: https://kommentio.tech

Additional Redirect URLs:
- https://kommentio.tech/auth/callback/*
- https://kommentio.tech (루트 도메인)
- https://xavierchoi.github.io/kommentio/auth/callback/* (백업용 유지)
```

### 4. Kakao Developers
```
플랫폼 > Web > 도메인:
- kommentio.tech
- xavierchoi.github.io (백업용 유지)

카카오 로그인 > Redirect URI:
- https://kommentio.tech/auth/callback/kakao
- https://xavierchoi.github.io/kommentio/auth/callback/kakao (백업용)
```

### 5. Facebook for Developers
```
앱 도메인:
- kommentio.tech
- xavierchoi.github.io (백업용)

유효한 OAuth 리디렉션 URI:
- https://kommentio.tech/auth/callback/facebook
- https://xavierchoi.github.io/kommentio/auth/callback/facebook (백업용)

사이트 URL:
- https://kommentio.tech
```

### 6. X(Twitter) Developer Portal ✅ 완료
```
Website URL: https://kommentio.tech
Callback URLs: https://kommentio.tech/auth/callback/twitter
Terms of Service URL: https://kommentio.tech/terms-of-service.html
Privacy Policy URL: https://kommentio.tech/privacy-policy.html
```

### 7. Apple Developer Console
```
Services ID > Website URLs:
- Primary Domain: kommentio.tech
- Return URLs: https://kommentio.tech/auth/callback/apple
```

### 8. LinkedIn Developer Console
```
Authorized redirect URLs:
- https://kommentio.tech/auth/callback/linkedin
- https://xavierchoi.github.io/kommentio/auth/callback/linkedin (백업용)

App settings > Website URL:
- https://kommentio.tech
```

## 🔄 마이그레이션 전략

### Phase 1: 즉시 업데이트 (오늘)
- Google OAuth Console
- GitHub OAuth App  
- Supabase Site URL

### Phase 2: 주요 프로바이더 (내일)
- Kakao Developers
- Facebook for Developers
- X(Twitter) Developer Portal (이미 완료)

### Phase 3: 고급 프로바이더 (주말)
- Apple Developer Console
- LinkedIn Developer Console

## 🧪 테스트 계획

각 프로바이더 업데이트 후:
1. kommentio.tech에서 해당 소셜 로그인 버튼 클릭
2. OAuth 플로우 정상 진행 확인
3. 사용자 정보 정상 수신 확인
4. 콜백 URL 리디렉션 정상 확인

## ⚠️ 주의사항

1. **백업 도메인 유지**: 항상 xavierchoi.github.io 도메인도 함께 설정하여 페일오버 보장
2. **단계적 업데이트**: 한 번에 모든 프로바이더를 변경하지 말고 하나씩 테스트
3. **롤백 계획**: 문제 발생 시 즉시 이전 설정으로 복구 가능
4. **SSL 인증서**: kommentio.tech SSL 인증서가 완전히 적용된 후 진행

## ✅ 체크리스트

- [ ] Google OAuth Console 업데이트
- [ ] GitHub OAuth App 업데이트  
- [ ] Supabase Site URL 업데이트
- [ ] Kakao Developers 업데이트
- [ ] Facebook for Developers 업데이트
- [x] X(Twitter) Developer Portal 업데이트 (완료)
- [ ] Apple Developer Console 업데이트
- [ ] LinkedIn Developer Console 업데이트
- [ ] 전체 OAuth 프로바이더 테스트
- [ ] kommentio.tech 완전 검증

---

**목표**: Phase 3 완료 시점에 모든 OAuth 프로바이더가 kommentio.tech에서 완벽하게 작동하도록 설정