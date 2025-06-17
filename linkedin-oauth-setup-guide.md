# 💼 LinkedIn OAuth 설정 가이드 - Kommentio v0.2.8

## 🎯 LinkedIn OAuth 문제 해결 완전 가이드

### 현재 상태 진단
- ✅ 코드에서 LinkedIn이 실제 OAuth 시도하도록 설정됨
- ❓ Supabase에서 LinkedIn Provider 설정 상태 확인 필요
- ❓ LinkedIn Developer Console 앱 설정 확인 필요

## 🔍 1단계: 문제 진단

### LinkedIn 로그인 시 발생 가능한 오류들:
1. **"Provider not found"** - Supabase에서 LinkedIn 비활성화
2. **"Invalid redirect_uri"** - LinkedIn 앱에서 도메인 승인 안됨
3. **"Client application does not have access"** - LinkedIn 앱 검토 필요
4. **"Invalid client_id"** - Client ID/Secret 잘못 설정

### 디버깅 방법:
```javascript
// 브라우저 콘솔에서 LinkedIn 로그인 시도 후 확인
console.log('LinkedIn OAuth 오류:', error);
// 구체적인 오류 메시지 확인
```

## 🏢 2단계: LinkedIn Developer Console 설정

### 2.1 LinkedIn Developer 앱 생성/확인
1. **URL**: https://www.linkedin.com/developers/apps/
2. **기존 앱 확인** 또는 **새 앱 생성**

### 2.2 앱 기본 정보 설정
```
App name: Kommentio Comment System
Company: [개인 또는 회사명]
Privacy policy URL: https://kommentio.tech/privacy-policy.html
App logo: [Kommentio 로고 업로드]
```

### 2.3 Products 설정 (중요!)
LinkedIn OAuth를 위해 다음 Products 추가 필요:
```
1. "Sign In with LinkedIn using OpenID Connect" 
   - 이것이 OAuth 로그인의 핵심!
   - 승인 과정이 필요할 수 있음 (즉시 또는 최대 24시간)

2. "Share on LinkedIn" (선택사항)
   - 댓글 공유 기능용
```

### 2.4 OAuth 2.0 설정
```
Authorized redirect URLs for your app:
- https://[your-supabase-project].supabase.co/auth/v1/callback
- https://kommentio.tech/auth/callback/linkedin
- https://kommentio.tech (루트 도메인)
- https://xavierchoi.github.io/kommentio/auth/callback/linkedin (백업용)
```

### 2.5 API 키 확인
```
Client ID: [복사 필요]
Client Secret: [복사 필요]
```

## ⚙️ 3단계: Supabase 설정

### 3.1 Authentication Providers 설정
1. **Supabase Dashboard 접속**
   ```
   https://supabase.com/dashboard/project/[your-project]/auth/providers
   ```

2. **LinkedIn Provider 활성화**
   ```
   Provider: LinkedIn
   Enable: ON (토글 활성화)
   Client ID: [LinkedIn에서 복사한 Client ID]
   Client Secret: [LinkedIn에서 복사한 Client Secret]
   ```

### 3.2 Site URL 확인
```
Site URL: https://kommentio.tech
Additional Redirect URLs:
- https://kommentio.tech/auth/callback/linkedin
- https://kommentio.tech
```

## 🧪 4단계: 테스트

### 4.1 기본 테스트 HTML
```html
<!DOCTYPE html>
<html>
<body>
    <div data-kommentio data-site-id="linkedin-test"></div>
    <script src="https://kommentio.tech/kommentio.js"></script>
    <script>
        window.addEventListener('load', () => {
            if (window.kommentio) {
                // LinkedIn만 활성화하여 격리 테스트
                window.kommentio.updateSocialProviders({
                    linkedin: { enabled: true, label: 'LinkedIn', color: '#0a66c2' }
                });
            }
        });
    </script>
</body>
</html>
```

### 4.2 테스트 시나리오
1. **LinkedIn 버튼 클릭**
2. **LinkedIn 로그인 페이지로 이동 확인**
3. **권한 승인 후 리디렉션 확인**
4. **사용자 정보 표시 확인**

## 🚨 5단계: 일반적인 문제 해결

### 문제 1: "Provider not found" 오류
**원인**: Supabase에서 LinkedIn Provider 비활성화
**해결**: Supabase Dashboard에서 LinkedIn Provider 활성화

### 문제 2: "Invalid redirect_uri" 오류
**원인**: LinkedIn 앱에서 리디렉션 URL 승인 안됨
**해결**: LinkedIn Developer Console에서 정확한 Supabase Callback URL 추가

### 문제 3: "Client application does not have access" 오류
**원인**: LinkedIn 앱이 "Sign In with LinkedIn" 권한 없음
**해결**: LinkedIn Developer Console에서 "Sign In with LinkedIn using OpenID Connect" Product 추가 및 승인 대기

### 문제 4: 버튼 클릭해도 아무 반응 없음
**원인**: JavaScript 오류 또는 Supabase 설정 문제
**해결**: 브라우저 콘솔에서 오류 메시지 확인

## 🔧 6단계: 고급 디버깅

### Supabase Auth 상태 확인
```javascript
// 브라우저 콘솔에서 실행
console.log('Supabase Auth:', window.kommentio?.supabase?.auth);
console.log('Available Providers:', window.kommentio?.supabase?.auth?.getAuthProviders?.());
```

### LinkedIn OAuth URL 직접 테스트
```javascript
// 직접 LinkedIn OAuth 시도
window.kommentio?.supabase?.auth?.signInWithOAuth({
  provider: 'linkedin',
  options: {
    redirectTo: window.location.href
  }
}).then(result => {
  console.log('LinkedIn OAuth 결과:', result);
}).catch(error => {
  console.error('LinkedIn OAuth 오류:', error);
});
```

## 📋 체크리스트

### LinkedIn Developer Console:
- [ ] 앱 생성/기존 앱 확인
- [ ] "Sign In with LinkedIn using OpenID Connect" Product 추가
- [ ] OAuth 리디렉션 URL 설정 (Supabase 콜백 URL)
- [ ] Client ID/Secret 확인

### Supabase 설정:
- [ ] LinkedIn Provider 활성화
- [ ] Client ID/Secret 입력
- [ ] Site URL 설정 (kommentio.tech)

### 테스트:
- [ ] LinkedIn 버튼 클릭 테스트
- [ ] OAuth 플로우 완료 확인
- [ ] 사용자 정보 수신 확인
- [ ] 브라우저 콘솔 오류 없음 확인

## 🚀 다음 단계

LinkedIn OAuth 해결 후:
1. **전체 소셜 프로바이더 통합 테스트**
2. **kommentio.tech에서 7개 프로바이더 모두 검증**
3. **Phase 3 완료 및 Phase 4 진행**

---

**예상 해결 시간**: 20-30분 (LinkedIn 앱 승인 대기 시간 제외)
**가장 일반적인 원인**: LinkedIn Developer Console에서 "Sign In with LinkedIn using OpenID Connect" Product 미추가