import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhTW from 'antd/locale/zh_TW';
import FormWizard from './pages/FormWizard';
import AdminLogin from './pages/AdminLogin';
import AdminCases from './pages/AdminCases';
import AdminEditCase from './pages/AdminEditCase';
import { isLoggedIn } from './utils/adminAuth';
import './App.css';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return isLoggedIn() ? <>{children}</> : <Navigate to="/admin" replace />;
}

function App() {
  return (
    <ConfigProvider locale={zhTW}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<FormWizard />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route
            path="/admin/cases"
            element={<ProtectedRoute><AdminCases /></ProtectedRoute>}
          />
          <Route
            path="/admin/cases/:id/edit"
            element={<ProtectedRoute><AdminEditCase /></ProtectedRoute>}
          />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
