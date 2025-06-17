# 🔍 Google OAuth Console 마이그레이션 가이드 - kommentio.tech

## 🎯 즉시 실행 가능한 업데이트 가이드

### 1. Google Cloud Console 접속
1. **URL**: https://console.developers.google.com/apis/credentials
2. **프로젝트**: Kommentio 관련 프로젝트 선택
3. **OAuth 2.0 클라이언트 ID** 찾기 및 편집

### 2. 승인된 JavaScript 원본 업데이트

#### 현재 설정 (확인 필요):
```
https://xavierchoi.github.io
```

#### 새로운 설정 (추가):
```
https://kommentio.tech
https://xavierchoi.github.io  (백업용 유지)
```

### 3. 승인된 리디렉션 URI 업데이트

#### 현재 설정 (확인 필요):
```
https://xavierchoi.github.io/kommentio
https://[supabase-project].supabase.co/auth/v1/callback
```

#### 새로운 설정 (추가):
```
https://kommentio.tech
https://kommentio.tech/auth/callback/google
https://[supabase-project].supabase.co/auth/v1/callback
https://xavierchoi.github.io/kommentio  (백업용 유지)
https://xavierchoi.github.io/kommentio/auth/callback/google  (백업용)
```

### 4. 업데이트 후 즉시 테스트

#### 테스트 절차:
1. **kommentio.tech 접속** (SSL 인증서 활성화 후)
2. **Kommentio 위젯에서 Google 로그인 버튼 클릭**
3. **OAuth 플로우 정상 진행 확인**
4. **사용자 정보 수신 및 로그인 완료 확인**

#### 테스트 URL:
```html
<!-- 테스트용 HTML -->
<!DOCTYPE html>
<html>
<body>
    <div data-kommentio data-site-id="google-oauth-test"></div>
    <script src="https://kommentio.tech/kommentio.js"></script>
    <script>
        // Google 프로바이더만 활성화하여 테스트
        window.addEventListener('load', () => {
            if (window.kommentio) {
                window.kommentio.updateSocialProviders({
                    google: { enabled: true, label: 'Google', color: '#4285f4' }
                });
            }
        });
    </script>
</body>
</html>
```

### 5. 문제 해결

#### 일반적인 오류들:
1. **"redirect_uri_mismatch"** 
   - 리디렉션 URI가 정확히 설정되지 않음
   - 해결: 정확한 URI 다시 추가

2. **"invalid_request"**
   - JavaScript 원본이 승인되지 않음  
   - 해결: kommentio.tech를 승인된 원본에 추가

3. **SSL 인증서 오류**
   - kommentio.tech SSL이 아직 활성화되지 않음
   - 해결: GitHub Pages SSL 인증서 생성 대기 (보통 10-15분)

### 6. 성공 확인 방법

#### 성공 지표:
- ✅ Google 로그인 버튼 클릭 시 Google OAuth 페이지로 정상 이동
- ✅ 사용자 권한 승인 후 kommentio.tech로 정상 리디렉션
- ✅ 위젯에 사용자 정보 표시 및 댓글 작성 가능
- ✅ 브라우저 콘솔에 OAuth 관련 오류 없음

#### 디버깅 정보:
```javascript
// 브라우저 콘솔에서 OAuth 상태 확인
console.log('Google OAuth 설정:', window.kommentio?.options?.socialProviders?.google);
console.log('현재 사용자:', window.kommentio?.currentUser);
console.log('Mock 모드:', window.kommentio?.mockMode);
```

### 7. 롤백 계획

#### 문제 발생 시:
1. **즉시 이전 설정으로 복구**
2. **xavierchoi.github.io 도메인으로 테스트 진행**
3. **문제 원인 파악 후 재시도**

#### 백업 테스트 URL:
```
https://xavierchoi.github.io/kommentio/test-production-deployment.html
```

---

## 🚀 다음 단계

Google OAuth 업데이트 완료 후:
1. **GitHub OAuth App** 업데이트
2. **Supabase Site URL** 업데이트  
3. **전체 프로바이더 통합 테스트**

**예상 소요 시간**: 10-15분 (SSL 인증서 대기 시간 포함)