import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './sidebar';

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* 사이드바 */}
      <Sidebar />
      
      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 헤더 */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">
              Kommentio 관리 대시보드
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                안녕하세요, 관리자님!
              </span>
            </div>
          </div>
        </header>

        {/* 메인 컨텐츠 영역 */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}