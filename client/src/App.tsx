import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Layouts
import AppLayout from './components/AppLayout';

// Public Pages
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';

// Protected Pages
import DashboardPage from './components/DashboardPage';
import SchemeList from './components/SchemeList';
import SchemeDetails from './components/SchemeDetails';
import EligibilityCheck from './components/EligibilityCheck';
import ApplicationForm from './components/ApplicationForm';
import UserProfile from './components/UserProfile';
import UserApplications from './components/UserApplications';
import { ChatbotPage } from './components/Chatbot';
import { SettingsPage } from './components/SettingsPage';

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicOnlyRoute({ children }: { children: React.ReactElement }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function App() {
  return (
    <Routes>
      {/* ===== PUBLIC ROUTES ===== */}
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />

      {/* ===== PROTECTED ROUTES (with AppLayout) ===== */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/schemes" element={<SchemeList />} />
        <Route path="/schemes/:id" element={<SchemeDetails />} />
        <Route path="/eligibility" element={<EligibilityCheck />} />
        <Route path="/applications" element={<UserApplications />} />
        <Route path="/applications/:schemeId" element={<ApplicationForm />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/chatbot" element={<ChatbotPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* ===== CATCH-ALL ===== */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
