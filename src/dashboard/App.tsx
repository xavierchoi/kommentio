import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/dashboard-layout';
import Dashboard from './pages/dashboard';
import SitesManagement from './pages/sites-management';
import CommentsModeration from './pages/comments-moderation';
import SpamFilter from './pages/spam-filter';
import Analytics from './pages/analytics';
import UsersManagement from './pages/users-management';
import Integrations from './pages/integrations';
import Themes from './pages/themes';
import AccountSettings from './pages/account-settings';
import Billing from './pages/billing';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="sites" element={<SitesManagement />} />
        <Route path="comments" element={<CommentsModeration />} />
        <Route path="spam-filter" element={<SpamFilter />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="users" element={<UsersManagement />} />
        <Route path="integrations" element={<Integrations />} />
        <Route path="themes" element={<Themes />} />
        <Route path="settings" element={<AccountSettings />} />
        <Route path="billing" element={<Billing />} />
      </Route>
    </Routes>
  );
}
