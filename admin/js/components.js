// Kommentio Admin Dashboard - UI Components

class Components {
  // 모달 컴포넌트
  static createModal(title, content, buttons = []) {
    const modal = Utils.createElement('div', 'modal');
    const modalContent = Utils.createElement('div', 'modal-content');
    
    // 헤더
    const header = Utils.createElement('div', 'modal-header');
    const titleElement = Utils.createElement('h3', '', title);
    header.appendChild(titleElement);
    
    // 바디
    const body = Utils.createElement('div', 'modal-body');
    if (typeof content === 'string') {
      body.innerHTML = content;
    } else {
      body.appendChild(content);
    }
    
    // 푸터
    const footer = Utils.createElement('div', 'modal-footer');
    buttons.forEach(button => {
      const btn = Utils.createElement('button', `btn ${button.class || 'btn-secondary'}`, button.text);
      if (button.onclick) {
        Utils.on(btn, 'click', button.onclick);
      }
      footer.appendChild(btn);
    });
    
    modalContent.appendChild(header);
    modalContent.appendChild(body);
    modalContent.appendChild(footer);
    modal.appendChild(modalContent);
    
    // 배경 클릭시 닫기
    Utils.on(modal, 'click', (e) => {
      if (e.target === modal) {
        this.closeModal(modal);
      }
    });
    
    return modal;
  }

  static showModal(modal) {
    Utils.$('#modal-container').appendChild(modal);
  }

  static closeModal(modal) {
    if (modal && modal.parentNode) {
      modal.parentNode.removeChild(modal);
    }
  }

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

  // 모달 컴포넌트
  static createModal(title, content, buttons = []) {
    const modalOverlay = Utils.createElement('div', 'modal-overlay');
    const modal = Utils.createElement('div', 'modal');
    
    // 모달 헤더
    const header = Utils.createElement('div', 'modal-header');
    const titleElement = Utils.createElement('h3', '', title);
    const closeButton = Utils.createElement('button', '');
    closeButton.innerHTML = '<i class="fas fa-times"></i>';
    
    Utils.on(closeButton, 'click', () => this.closeModal(modalOverlay));
    
    header.appendChild(titleElement);
    header.appendChild(closeButton);
    
    // 모달 바디
    const body = Utils.createElement('div', 'modal-body');
    body.appendChild(content);
    
    // 모달 푸터
    const footer = Utils.createElement('div', 'modal-footer');
    buttons.forEach(button => {
      const btn = Utils.createElement('button', `btn ${button.class || 'btn-secondary'}`, button.text);
      if (button.onclick) {
        Utils.on(btn, 'click', button.onclick);
      }
      footer.appendChild(btn);
    });
    
    modal.appendChild(header);
    modal.appendChild(body);
    if (buttons.length > 0) {
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
    
    // Shadcn 스타일 애니메이션
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