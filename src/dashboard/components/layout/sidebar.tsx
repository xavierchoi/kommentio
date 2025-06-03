import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '@iconify/react';

const menuItems = [
  {
    title: '대시보드',
    path: '/dashboard',
    icon: 'material-symbols:dashboard-outline'
  },
  {
    title: '사이트 관리',
    path: '/sites',
    icon: 'material-symbols:web-stories-outline'
  },
  {
    title: '댓글 관리',
    path: '/comments',
    icon: 'material-symbols:comment-outline'
  },
  {
    title: '스팸 필터',
    path: '/spam-filter',
    icon: 'material-symbols:shield-outline'
  },
  {
    title: '분석',
    path: '/analytics',
    icon: 'material-symbols:analytics-outline'
  },
  {
    title: '사용자 관리',
    path: '/users',
    icon: 'material-symbols:group-outline'
  },
  {
    title: '연동',
    path: '/integrations',
    icon: 'material-symbols:integration-instructions-outline'
  },
  {
    title: '테마',
    path: '/themes',
    icon: 'material-symbols:palette-outline'
  },
  {
    title: '계정 설정',
    path: '/settings',
    icon: 'material-symbols:settings-outline'
  },
  {
    title: '요금제',
    path: '/billing',
    icon: 'material-symbols:credit-card-outline'
  }
];

export default function Sidebar() {
  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200">
      {/* 로고 */}
      <div className="flex items-center justify-center p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Icon icon="material-symbols:comment" className="text-2xl text-blue-600" />
          <span className="text-xl font-bold text-gray-900">Kommentio</span>
        </div>
      </div>

      {/* 네비게이션 메뉴 */}
      <nav className="mt-6">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Icon icon={item.icon} className="text-lg" />
                <span>{item.title}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* 하단 정보 */}
      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          <div>Kommentio v1.0</div>
          <div className="mt-1">오픈소스 댓글 시스템</div>
        </div>
      </div>
    </div>
  );
}