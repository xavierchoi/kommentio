// Kommentio Admin Dashboard - UI Components

class Components {

  // 카드 컴포넌트
  static createCard(title, content, headerActions = '') {
    const card = Utils.createElement('div', 'card');
    
    if (title) {
      const header = Utils.createElement('div', 'card-header');
      const headerContent = Utils.createElement('div', 'flex items-center justify-between');
      headerContent.innerHTML = `<h2>${title}</h2>${headerActions}`;
      header.appendChild(headerContent);
      card.appendChild(header);
    }
    
    const body = Utils.createElement('div', 'card-body');
    if (typeof content === 'string') {
      body.innerHTML = content;
    } else {
      body.appendChild(content);
    }
    card.appendChild(body);
    
    return card;
  }

  // 통계 카드 컴포넌트
  static createStatCard(title, value, icon, color) {
    const card = Utils.createElement('div', 'stat-card');
    
    card.innerHTML = `
      <div class="stat-card-content">
        <div class="stat-card-info">
          <h3>${title}</h3>
          <div class="stat-card-value">${Utils.formatNumber(value)}</div>
        </div>
        <div class="stat-card-icon ${color}">
          <i class="${icon}"></i>
        </div>
      </div>
    `;
    
    return card;
  }

  // 테이블 컴포넌트
  static createTable(columns, data, actions = []) {
    const table = Utils.createElement('table', 'table');
    
    // 헤더
    const thead = Utils.createElement('thead');
    const headerRow = Utils.createElement('tr');
    columns.forEach(column => {
      const th = Utils.createElement('th', '', column.title);
      headerRow.appendChild(th);
    });
    if (actions.length > 0) {
      headerRow.appendChild(Utils.createElement('th', '', '작업'));
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // 바디
    const tbody = Utils.createElement('tbody');
    data.forEach(item => {
      const row = Utils.createElement('tr');
      
      columns.forEach(column => {
        const td = Utils.createElement('td');
        let value = item[column.key];
        
        if (column.render) {
          value = column.render(value, item);
        }
        
        td.innerHTML = value;
        row.appendChild(td);
      });
      
      // 액션 버튼들
      if (actions.length > 0) {
        const actionTd = Utils.createElement('td');
        const actionGroup = Utils.createElement('div', 'flex gap-2');
        
        actions.forEach(action => {
          const btn = Utils.createElement('button', `btn btn-sm ${action.class || 'btn-secondary'}`, action.text);
          if (action.onclick) {
            Utils.on(btn, 'click', () => action.onclick(item));
          }
          actionGroup.appendChild(btn);
        });
        
        actionTd.appendChild(actionGroup);
        row.appendChild(actionTd);
      }
      
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    
    return table;
  }

  // 입력 폼 컴포넌트
  static createInput(type, name, label, placeholder = '', value = '') {
    const group = Utils.createElement('div', 'input-group');
    
    if (label) {
      const labelElement = Utils.createElement('label', 'input-label', label);
      labelElement.setAttribute('for', name);
      group.appendChild(labelElement);
    }
    
    const input = Utils.createElement('input', 'input');
    input.type = type;
    input.name = name;
    input.id = name;
    input.placeholder = placeholder;
    input.value = value;
    
    group.appendChild(input);
    return group;
  }

  // 검색 입력 컴포넌트
  static createSearchInput(placeholder, onSearch) {
    const searchContainer = Utils.createElement('div', 'card');
    const searchBody = Utils.createElement('div', 'card-body');
    
    const inputGroup = Utils.createElement('div', 'flex items-center gap-3 max-w-md');
    const input = Utils.createElement('input', 'input');
    input.type = 'text';
    input.placeholder = placeholder;
    
    const searchIcon = Utils.createElement('i', 'fas fa-search text-gray-400');
    
    inputGroup.appendChild(searchIcon);
    inputGroup.appendChild(input);
    searchBody.appendChild(inputGroup);
    searchContainer.appendChild(searchBody);
    
    // 디바운스된 검색
    const debouncedSearch = Utils.debounce(onSearch, 300);
    Utils.on(input, 'input', (e) => debouncedSearch(e.target.value));
    
    return searchContainer;
  }

  // 뱃지 컴포넌트
  static createBadge(text, type = 'success') {
    const badge = Utils.createElement('span', `badge badge-${type}`, text);
    return badge;
  }

  // 빈 상태 컴포넌트
  static createEmptyState(title, description, actionText = '', actionHandler = null) {
    const container = Utils.createElement('div', 'text-center py-12');
    
    container.innerHTML = `
      <div class="text-gray-400 text-6xl mb-4">
        <i class="fas fa-inbox"></i>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">${title}</h3>
      <p class="text-gray-500 mb-6">${description}</p>
    `;
    
    if (actionText && actionHandler) {
      const actionBtn = Utils.createElement('button', 'btn btn-primary', actionText);
      Utils.on(actionBtn, 'click', actionHandler);
      container.appendChild(actionBtn);
    }
    
    return container;
  }

  // 프리미엄 모달 컴포넌트 - 완전히 새로운 디자인
  static createModal(title, content, buttons = []) {
    // 모달 오버레이 생성
    const modalOverlay = Utils.createElement('div');
    modalOverlay.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      z-index: 9999 !important;
      background: rgba(0, 0, 0, 0.5) !important;
      backdrop-filter: blur(4px) !important;
      -webkit-backdrop-filter: blur(4px) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 20px !important;
      box-sizing: border-box !important;
    `;
    
    // 모달 컨테이너 생성 - 반응형 최적화
    const modal = Utils.createElement('div');
    modal.style.cssText = `
      position: relative !important;
      background: #ffffff !important;
      border-radius: 12px !important;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
      width: 100% !important;
      max-width: min(95vw, 600px) !important;
      min-height: 200px !important;
      max-height: min(90vh, 800px) !important;
      overflow: hidden !important;
      border: 1px solid #e5e7eb !important;
      display: flex !important;
      flex-direction: column !important;
      box-sizing: border-box !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      margin: 10px !important;
    `;
    
    // 모달 헤더 생성 - 반응형 패딩
    const header = Utils.createElement('div');
    header.style.cssText = `
      padding: 16px 16px 12px 16px !important;
      border: none !important;
      background: #ffffff !important;
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      flex-shrink: 0 !important;
      box-sizing: border-box !important;
      border-bottom: 1px solid #f1f5f9 !important;
    `;
    
    // 모바일에서 더 큰 패딩 적용
    if (window.innerWidth >= 768) {
      header.style.padding = '24px 24px 16px 24px !important';
    }
    
    const titleElement = Utils.createElement('h3');
    titleElement.style.cssText = `
      color: #1e293b !important;
      font-size: ${window.innerWidth >= 768 ? '20px' : '18px'} !important;
      font-weight: 700 !important;
      margin: 0 !important;
      line-height: 1.4 !important;
      flex: 1 !important;
      padding-right: 12px !important;
      word-break: keep-all !important;
      overflow-wrap: break-word !important;
      font-family: inherit !important;
    `;
    titleElement.textContent = title;
    
    const closeButton = Utils.createElement('button');
    const buttonSize = window.innerWidth >= 768 ? '36px' : '44px'; // 모바일에서 더 큰 터치 타겟
    closeButton.style.cssText = `
      background: #f1f5f9 !important;
      border: none !important;
      border-radius: 8px !important;
      width: ${buttonSize} !important;
      height: ${buttonSize} !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      color: #64748b !important;
      transition: all 0.2s ease !important;
      cursor: pointer !important;
      padding: 0 !important;
      flex-shrink: 0 !important;
      font-size: ${window.innerWidth >= 768 ? '16px' : '18px'} !important;
      touch-action: manipulation !important;
    `;
    closeButton.innerHTML = '×';
    closeButton.onmouseover = () => {
      closeButton.style.background = '#e2e8f0 !important';
      closeButton.style.color = '#334155 !important';
    };
    closeButton.onmouseout = () => {
      closeButton.style.background = '#f1f5f9 !important';
      closeButton.style.color = '#64748b !important';
    };
    
    Utils.on(closeButton, 'click', () => this.closeModal(modalOverlay));
    
    header.appendChild(titleElement);
    header.appendChild(closeButton);
    
    // 모달 바디 생성 - 반응형 패딩
    const body = Utils.createElement('div');
    const bodyPadding = window.innerWidth >= 768 ? '24px' : '16px';
    body.style.cssText = `
      padding: ${bodyPadding} !important;
      background: transparent !important;
      flex: 1 !important;
      overflow-y: auto !important;
      box-sizing: border-box !important;
      font-size: 14px !important;
      line-height: 1.6 !important;
      color: #334155 !important;
      -webkit-overflow-scrolling: touch !important;
    `;
    
    if (typeof content === 'string') {
      body.innerHTML = content;
    } else {
      body.appendChild(content);
    }
    
    // 모달 푸터 생성 (버튼이 있을 때만)
    let footer = null;
    if (buttons.length > 0) {
      footer = Utils.createElement('div');
      footer.style.cssText = `
        background: #f8fafc !important;
        border-top: 1px solid #e2e8f0 !important;
        padding: 16px 24px !important;
        display: flex !important;
        justify-content: flex-end !important;
        gap: 12px !important;
        flex-shrink: 0 !important;
        box-sizing: border-box !important;
      `;
      
      buttons.forEach(button => {
        const btn = Utils.createElement('button');
        btn.textContent = button.text;
        
        // 모바일에서 더 큰 터치 타겟
        const buttonHeight = window.innerWidth >= 768 ? '40px' : '48px';
        const buttonPadding = window.innerWidth >= 768 ? '8px 20px' : '12px 24px';
        
        let btnStyles = `
          height: ${buttonHeight} !important;
          padding: ${buttonPadding} !important;
          border-radius: 8px !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          transition: all 0.2s ease !important;
          border: 1px solid transparent !important;
          cursor: pointer !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 8px !important;
          white-space: nowrap !important;
          min-width: 80px !important;
          box-sizing: border-box !important;
          flex-shrink: 0 !important;
          font-family: inherit !important;
          touch-action: manipulation !important;
        `;
        
        if (button.class && button.class.includes('btn-primary')) {
          btnStyles += `
            background: #3b82f6 !important;
            color: white !important;
            border-color: #3b82f6 !important;
          `;
          btn.onmouseover = () => {
            btn.style.background = '#2563eb !important';
            btn.style.borderColor = '#2563eb !important';
          };
          btn.onmouseout = () => {
            btn.style.background = '#3b82f6 !important';
            btn.style.borderColor = '#3b82f6 !important';
          };
        } else {
          btnStyles += `
            background: white !important;
            color: #64748b !important;
            border-color: #d1d5db !important;
          `;
          btn.onmouseover = () => {
            btn.style.background = '#f9fafb !important';
            btn.style.borderColor = '#9ca3af !important';
            btn.style.color = '#374151 !important';
          };
          btn.onmouseout = () => {
            btn.style.background = 'white !important';
            btn.style.borderColor = '#d1d5db !important';
            btn.style.color = '#64748b !important';
          };
        }
        
        btn.style.cssText = btnStyles;
        
        if (button.onclick && typeof button.onclick === 'function') {
          const btnHandler = Utils.on(btn, 'click', () => {
            try {
              button.onclick();
            } catch (error) {
              console.error('Components.createModal: 버튼 핸들러 오류:', error);
            }
          });
          this._trackEventListener(btn, 'click', btnHandler);
        }
        footer.appendChild(btn);
      });
    }
    
    // 모달 조립
    modal.appendChild(header);
    modal.appendChild(body);
    if (footer) {
      modal.appendChild(footer);
    }
    
    modalOverlay.appendChild(modal);
    
    // 오버레이 클릭 시 닫기
    Utils.on(modalOverlay, 'click', (e) => {
      if (e.target === modalOverlay) {
        this.closeModal(modalOverlay);
      }
    });
    
    // ESC 키로 닫기
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        this.closeModal(modalOverlay);
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
    
    return modalOverlay;
  }

  static showModal(modal) {
    // 항상 body에 직접 추가하여 z-index 문제 방지
    document.body.appendChild(modal);
    
    // body 스크롤 방지
    document.body.style.overflow = 'hidden';
    
    // 간단한 애니메이션
    modal.style.opacity = '0';
    modal.style.transform = 'scale(0.95)';
    modal.style.transition = 'opacity 0.2s ease-out, transform 0.2s ease-out';
    
    requestAnimationFrame(() => {
      modal.style.opacity = '1';
      modal.style.transform = 'scale(1)';
    });
  }

  static closeModal(modal) {
    modal.style.opacity = '0';
    modal.style.transform = 'scale(0.95)';
    
    // body 스크롤 복원
    document.body.style.overflow = '';
    
    setTimeout(() => {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    }, 200);
  }
}

// 전역으로 사용할 수 있도록 export
window.Components = Components;