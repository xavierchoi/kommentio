import React from 'react';
import ReactDOM from 'react-dom/client';

function TestApp() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Kommentio 대시보드 테스트</h1>
      <p>React가 정상적으로 로드되었습니다!</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>
);
