import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, IconButton, Badge, Container, Button } from '@mui/material';
import { AccountCircle, ExitToApp, Search, MenuBook, Assignment, Dashboard, Notifications as NotificationsIcon, Home } from '@mui/icons-material';
import { useAuth } from './hooks/useAuth';
import { useI18n } from './hooks/useI18n';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import SchemeList from './components/SchemeList';
import SchemeDetails from './components/SchemeDetails';
import EligibilityCheck from './components/EligibilityCheck';
import ApplicationForm from './components/ApplicationForm';
import UserProfile from './components/UserProfile';
import UserApplications from './components/UserApplications';
import { ChatbotPage } from './components/Chatbot';

function App() {
  const { user, login, logout, register } = useAuth();
  const { t, i18n } = useI18n();
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  useEffect(() => {
    const storedLanguage = localStorage.getItem('language') || 'en';
    setSelectedLanguage(storedLanguage);
    i18n.changeLanguage(storedLanguage);
  }, [i18n]);

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
  };

  const RequireAuth = ({ children }: { children: React.ReactElement }) => {
    if (!user) return <Navigate to="/login" replace />;
    return children;
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            {t('navigation.govscheme', 'GovScheme')}
          </Typography>

          <LanguageSwitcher />

          {user && (
            <>
              <IconButton color="inherit" component={Link} to="/schemes" sx={{ mx: 0.5 }}>
                <MenuBook />
              </IconButton>
              <IconButton color="inherit" component={Link} to="/eligibility" sx={{ mx: 0.5 }}>
                <Search />
              </IconButton>
              <IconButton color="inherit" component={Link} to="/applications" sx={{ mx: 0.5 }}>
                <Assignment />
              </IconButton>
              {user && (user as any).role === 'ADMIN' && (
                <IconButton color="inherit" component={Link} to="/admin" sx={{ mx: 0.5 }}>
                  <Dashboard />
                </IconButton>
              )}
              <IconButton color="inherit" component={Link} to="/profile" sx={{ mx: 0.5 }}>
                <AccountCircle />
              </IconButton>
              <Button color="inherit" onClick={logout} sx={{ mx: 0.5, textTransform: 'none' }}>
                {t('navigation.logout', 'Logout')}
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/schemes" />} />
          <Route path="/login" element={!user ? <div>Login component not available</div> : <Navigate to="/schemes" />} />
          <Route path="/register" element={!user ? <div>Register component not available</div> : <Navigate to="/schemes" />} />
          <Route path="/schemes" element={<SchemeList />} />
          <Route path="/schemes/:id" element={<SchemeDetails />} />
          <Route path="/eligibility" element={<EligibilityCheck />} />
          <Route path="/applications" element={<UserApplications />} />
          <Route path="/applications/:schemeId" element={<ApplicationForm />} />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <UserProfile />
              </RequireAuth>
            }
          />
          <Route path="/chatbot" element={<ChatbotPage />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
