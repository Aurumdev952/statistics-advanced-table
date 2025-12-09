import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import HomePage from '@/pages/HomePage';
import NotFoundPage from '@/pages/NotFoundPage';
import AdvancedTableTestPage from '@/pages/AdvancedTableTestPage';
import { LoginPage } from '@/features/auth';
import { ProtectedRoute } from '@/features/auth';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Layout />}>
          <Route
            index
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="advanced-table-test"
            element={
              <ProtectedRoute>
                <AdvancedTableTestPage />
              </ProtectedRoute>
            }
          />
        </Route>
        {/* 404 Page - catches all unmatched routes */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
