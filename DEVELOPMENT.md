# 🛠️ Kommentio 개발 가이드

## 🚀 개발 환경 설정

### 📋 요구사항
- Node.js 18+
- npm 9+

### 🔧 설치
```bash
git clone https://github.com/xavierchoi/kommentio.git
cd kommentio
npm install
```

## 💻 개발 명령어

### 🌟 **개발 서버 (권장)**
```bash
npm run dev
# → http://localhost:3000 (HMR 지원)
```

### 🎯 **프로덕션 미리보기 (배포 환경과 100% 동일)**
```bash
npm run dev:prod
# → 1. GitHub Actions와 동일한 빌드 실행
# → 2. docs 폴더 구조로 정적 서빙
# → 3. http://localhost:3000 (kommentio.tech와 동일한 환경)
```

### 📦 **수동 빌드**
```bash
# 1. 개별 빌드
npm run build         # 랜딩 페이지 빌드
npm run build:widget  # 위젯 빌드

# 2. 로컬 프로덕션 빌드 (GitHub Actions와 동일)
npm run build:local   # 전체 빌드 + docs 폴더 준비

# 3. 정적 서빙만
npm run serve:prod    # docs 폴더를 3000포트에서 서빙
```

## 🔄 **개발-배포 환경 동일성**

### ✅ **로컬 개발 플로우**
```bash
# 1. 일반 개발 (빠른 HMR)
npm run dev

# 2. 배포 전 최종 확인 (GitHub Actions와 100% 동일)
npm run dev:prod
```

### 🌐 **배포 플로우**
```bash
git add .
git commit -m "feat: 새로운 기능 추가"
git push origin main
# → GitHub Actions 자동 실행
# → kommentio.tech 자동 배포
```

## 📁 **프로젝트 구조**

### 🏗️ **소스 코드**
```
src/
├── kommentio.js          # 메인 위젯
└── api/admin-api.js      # 관리 대시보드 API
```

### 🎨 **배포용 파일**
```
docs/                     # GitHub Pages 소스
├── index.html           # 랜딩 페이지
├── kommentio.js         # 위젯 파일 (직접 접근용)
├── widget/              # 위젯 빌드 파일들
├── admin-dashboard/     # 관리 대시보드
└── dist/               # 기타 빌드 아티팩트
```

### ⚡ **빌드 아티팩트**
```
dist/
├── docs/index.html      # 빌드된 랜딩 페이지
└── widget/
    └── kommentio.iife.js # 위젯 번들 (48KB)
```

## 🎯 **개발 시나리오별 명령어**

### 🔧 **새 기능 개발**
```bash
npm run dev              # 개발 서버 시작
# 코딩...
npm run dev:prod         # 배포 환경에서 테스트
git commit && git push   # 배포
```

### 🐛 **버그 수정**
```bash
npm run dev:prod         # 문제 재현 (프로덕션 환경)
npm run dev              # 수정 작업
npm run dev:prod         # 수정 확인
```

### 📊 **성능 테스트**
```bash
npm run build:local      # 최적화된 빌드
npm run serve:prod       # 정적 서빙으로 성능 측정
```

## 🔍 **디버깅 가이드**

### 🚨 **빌드 오류 시**
```bash
npm run clean            # 캐시 정리
npm install              # 의존성 재설치
npm run build:local      # 다시 빌드
```

### 🌐 **배포 환경 문제 시**
```bash
npm run dev:prod         # 로컬에서 배포 환경 재현
# GitHub Actions 로그와 비교
```

## 📈 **성능 모니터링**

### ⚡ **빌드 크기 확인**
```bash
npm run build:widget
# → dist/widget/kommentio.iife.js 48.38 kB │ gzip: 14.43 kB
```

### 🎯 **성능 목표**
- 위젯 크기: <50KB
- Gzipped: <20KB
- FPS: 60fps (모든 애니메이션)

## 🧪 **테스트**

### 📋 **테스트 파일들**
```
tests/
├── test-widget.html              # 기본 위젯 테스트
├── test-supabase-real.html       # Supabase 연동 테스트
├── test-realtime.html            # 실시간 기능 테스트
├── test-ai-spam-filter.html      # AI 스팸 필터 테스트
├── test-twitter-oauth.html       # OAuth 테스트
├── test-performance-monitoring.html # 성능 모니터링
└── test-production-stability.html   # 프로덕션 안정성
```

### 🎯 **테스트 실행**
```bash
npm run dev:prod         # 프로덕션 환경 시작
# 브라우저에서 tests/ 파일들 직접 테스트
```

## 🔗 **유용한 링크**

- **개발**: http://localhost:3000 (npm run dev)
- **프로덕션**: http://localhost:3000 (npm run dev:prod)
- **라이브**: https://kommentio.tech
- **대시보드**: https://kommentio.tech/admin-dashboard/

## 💡 **개발 팁**

### ✅ **Best Practices**
1. **배포 전 필수**: `npm run dev:prod`로 최종 확인
2. **성능 확인**: 위젯 크기 50KB 이하 유지
3. **테스트**: 관련 test-*.html 파일로 검증
4. **커밋**: 명확한 커밋 메시지 작성

### 🚫 **주의사항**
- `docs/` 폴더 직접 수정 금지 (빌드로 자동 생성)
- `dist/` 폴더 커밋 금지 (빌드 아티팩트)
- Mock 모드와 실제 Supabase 환경 모두 테스트

---

**개발-배포 환경 100% 동일성 보장! 🎯**