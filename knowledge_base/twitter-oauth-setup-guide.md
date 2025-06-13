# 🐦 X(Twitter) OAuth 2.0 설정 가이드 - Kommentio v0.2.1

## 📋 단계별 설정 프로세스

### 1. X Developer Portal 앱 생성

#### 1.1 기본 앱 정보 설정
```
App name: Kommentio Comment System
App description: Open-source embeddable comment widget - Ad-free alternative to Disqus
Website URL: https://kommentio.com
Terms of Service: https://kommentio.com/terms
Privacy Policy: https://kommentio.com/privacy
```

#### 1.2 앱 권한 설정
```
App permissions: Read and write
Type of App: Web App, Automated App or Bot
```

### 2. OAuth 2.0 설정

#### 2.1 User authentication settings
```
OAuth 2.0: Enable
Request email from users: Yes
Callback URL / Redirect URL: https://nwjbtsjeikrwyqltkpqv.supabase.co/auth/v1/callback
Website URL: https://kommentio.com
```

#### 2.2 생성된 Keys 확인
```
API Key: [복사 필요]
API Key Secret: [복사 필요]
Client ID: [복사 필요] 
Client Secret: [복사 필요]
```

### 3. Supabase Authentication 설정

#### 3.1 Provider 활성화
```
1. Supabase Dashboard 접속
   https://supabase.com/dashboard/project/nwjbtsjeikrwyqltkpqv/auth/providers

2. Twitter Provider 설정
   - Enable: ON
   - Client ID: [X Developer Portal에서 복사한 Client ID]
   - Client Secret: [X Developer Portal에서 복사한 Client Secret]
```

#### 3.2 콜백 URL 확인
```
Callback URL: https://nwjbtsjeikrwyqltkpqv.supabase.co/auth/v1/callback
Site URL: http://127.0.0.1:5173 (개발용)
```

### 4. 테스트 환경 설정

#### 4.1 개발 환경 콜백 URL 추가 (Optional)
```
X Developer Portal에서 추가적인 콜백 URL:
- http://localhost:5173/test-twitter-oauth.html
- http://127.0.0.1:5173/test-twitter-oauth.html
```

#### 4.2 Kommentio 위젯 설정
```javascript
// src/kommentio.js에서 Twitter 프로바이더 확인
socialProviders: {
  twitter: { 
    enabled: true, 
    label: 'X.com', 
    color: '#000000', 
    borderColor: '#000000',
    iconColor: '#ffffff',
    textColor: '#ffffff',
    hoverColor: '#272c30'
  }
}
```

### 5. 실제 테스트 프로세스

#### 5.1 기본 연결 테스트
```bash
# 1. X OAuth 테스트 페이지 열기
http://127.0.0.1:5173/test-twitter-oauth.html

# 2. OAuth 설정 확인
- "설정 상태 확인" 버튼 클릭
- Supabase 연결 상태 확인

# 3. X 로그인 테스트
- "X로 로그인" 버튼 클릭
- X 인증 페이지로 리디렉션 확인
- 인증 완료 후 콜백 처리 확인
```

#### 5.2 위젯 통합 테스트
```bash
# 1. Kommentio 위젯에서 X 로그인 버튼 클릭
# 2. OAuth 플로우 정상 동작 확인
# 3. 로그인 후 댓글 작성 테스트
# 4. 사용자 프로필 정보 표시 확인
```

### 6. 디버깅 및 문제 해결

#### 6.1 일반적인 오류들
```
Error: Provider not found
→ Supabase에서 Twitter 프로바이더가 비활성화됨

Error: invalid_client  
→ Client ID/Secret 불일치 또는 잘못된 설정

Error: redirect_uri_mismatch
→ 콜백 URL이 X Developer Portal 설정과 불일치

Error: unauthorized_client
→ 앱 권한 설정 또는 승인 상태 문제
```

#### 6.2 디버깅 도구
```bash
# 브라우저 개발자 도구에서 확인할 사항:
1. Network 탭: OAuth 요청/응답 확인
2. Console 탭: JavaScript 오류 확인
3. Application 탭: localStorage/sessionStorage 확인
4. URL 파라미터: OAuth 콜백 파라미터 확인
```

### 7. 성공 확인 체크리스트

#### 7.1 설정 완료 확인
- [ ] X Developer Portal에서 앱 생성 완료
- [ ] OAuth 2.0 설정 완료
- [ ] 콜백 URL 정확히 설정
- [ ] Supabase Twitter 프로바이더 활성화
- [ ] Client ID/Secret 정확히 입력

#### 7.2 기능 테스트 확인
- [ ] X 로그인 버튼 클릭 시 X 인증 페이지로 이동
- [ ] X 인증 완료 후 원래 페이지로 돌아옴
- [ ] 로그인 상태가 Supabase에 정상 반영됨
- [ ] 사용자 프로필 정보 조회 가능
- [ ] Kommentio 위젯에서 X 로그인 정상 동작
- [ ] 로그인 후 댓글 작성 가능

### 8. 프로덕션 배포 준비

#### 8.1 도메인 설정 업데이트
```
X Developer Portal:
- Website URL: https://kommentio.com
- Callback URL: https://kommentio.com/auth/callback

Supabase:
- Site URL: https://kommentio.com
- Redirect URLs: https://kommentio.com/*
```

#### 8.2 보안 검토
```
- Client Secret 안전한 곳에 보관
- API Keys 노출 방지
- HTTPS 강제 사용
- CORS 설정 검토
```

## 🎉 완료 시 기대 결과

✅ **성공적인 X OAuth 연동**
- 사용자가 X 계정으로 Kommentio에 로그인 가능
- 실시간 댓글 시스템에서 X 프로필 정보 활용
- 안전하고 빠른 소셜 인증 경험 제공

🔒 **보안 및 안정성**
- OAuth 2.0 표준 준수
- Supabase 보안 인프라 활용
- 사용자 개인정보 보호

🚀 **사용자 경험 개선**
- 간편한 원클릭 로그인
- 추가 회원가입 불필요
- 글로벌 X 사용자층 접근 가능