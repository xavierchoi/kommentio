/**
 * Kommentio 개발 환경용 모듈 래퍼
 * Vite 개발 서버에서 ES 모듈로 사용하기 위한 래퍼
 */

// 원본 kommentio.js 파일을 동적으로 로드
const script = document.createElement('script');
script.src = '/src/kommentio.js';
script.type = 'text/javascript';

// 스크립트 로딩 완료 후 콜백
script.onload = () => {
  console.log('✅ Kommentio 개발 모드로 로드 완료');
  
  // 위젯 상태 확인
  if (window.Kommentio && window.kommentio) {
    console.log('✅ 위젯 인스턴스 생성됨:', window.kommentio);
  } else {
    console.warn('⚠️ 위젯 로딩 확인 필요');
  }
};

script.onerror = (error) => {
  console.error('❌ Kommentio 로딩 실패:', error);
};

// DOM에 스크립트 추가
document.head.appendChild(script);

export default {};