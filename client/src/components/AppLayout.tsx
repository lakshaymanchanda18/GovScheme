import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Box, AppBar, Toolbar, Typography, IconButton, Button, Avatar,
  Drawer, List, ListItem, ListItemIcon, ListItemText, Divider,
  useMediaQuery, useTheme, Tooltip, Badge, Switch, FormControlLabel,
  Fade
} from '@mui/material';
import {
  Dashboard, MenuBook, Search, Assignment, AccountCircle,
  ExitToApp, Menu as MenuIcon, Close, SmartToy,
  Notifications as NotificationsIcon, Settings as SettingsIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { useI18n } from '../hooks/useI18n';
import { LanguageSwitcher } from './LanguageSwitcher';

const NAV_ITEMS = [
  { path: '/dashboard', icon: <Dashboard />, labelKey: 'navigation.dashboard', label: 'Dashboard' },
  { path: '/schemes', icon: <MenuBook />, labelKey: 'navigation.schemes', label: 'Schemes' },
  { path: '/eligibility', icon: <Search />, labelKey: 'navigation.eligibility', label: 'Eligibility' },
  { path: '/applications', icon: <Assignment />, labelKey: 'navigation.applications', label: 'Applications' },
  { path: '/chatbot', icon: <SmartToy />, labelKey: 'navigation.chatbot', label: 'Assistant' },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { api } = useApi();
  const { t } = useI18n();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lowBandwidth, setLowBandwidth] = useState(() => localStorage.getItem('lowBandwidth') === 'true');
  const [kioskMode, setKioskMode] = useState(() => localStorage.getItem('kioskMode') === 'true');
  const [assistedMode, setAssistedMode] = useState(() => localStorage.getItem('assistedMode') === 'true');
  const [simpleMode, setSimpleMode] = useState(() => localStorage.getItem('simpleMode') === 'true');
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch real notification count from server
  useEffect(() => {
    document.body.classList.toggle('low-bandwidth', lowBandwidth);
    localStorage.setItem('lowBandwidth', lowBandwidth ? 'true' : 'false');
  }, [lowBandwidth]);

  useEffect(() => {
    document.body.classList.toggle('kiosk-mode', kioskMode);
    localStorage.setItem('kioskMode', kioskMode ? 'true' : 'false');
  }, [kioskMode]);

  useEffect(() => {
    document.body.classList.toggle('assisted-mode', assistedMode);
    localStorage.setItem('assistedMode', assistedMode ? 'true' : 'false');
  }, [assistedMode]);

  useEffect(() => {
    document.body.classList.toggle('simple-mode', simpleMode);
    localStorage.setItem('simpleMode', simpleMode ? 'true' : 'false');
  }, [simpleMode]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await api.get('/notifications/unread-count');
        setUnreadCount(data.unreadCount || 0);
      } catch {
        setUnreadCount(0);
      }
    };
    fetchNotifications();
    // Refresh every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const drawerContent = (
    <Box sx={{ width: 260, pt: 2 }}>
      <Box sx={{ px: 3, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, background: 'linear-gradient(135deg, #4f46e5, #14b8a6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          SaralYojna
        </Typography>
        <IconButton onClick={() => setDrawerOpen(false)}>
          <Close />
        </IconButton>
      </Box>
      <Divider />
      <List sx={{ px: 1, pt: 1 }}>
        {NAV_ITEMS.map((item) => (
          <ListItem
            key={item.path}
            component={Link}
            to={item.path}
            onClick={() => setDrawerOpen(false)}
            sx={{
              borderRadius: '12px', mb: 0.5, px: 2,
              backgroundColor: location.pathname === item.path ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
              color: location.pathname === item.path ? '#4f46e5' : 'inherit',
              '&:hover': { backgroundColor: 'rgba(79, 70, 229, 0.05)' },
              transition: 'all 0.2s ease',
            }}
          >
            <ListItemIcon sx={{ color: location.pathname === item.path ? '#4f46e5' : 'inherit', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={t(item.labelKey, item.label)} primaryTypographyProps={{ fontWeight: location.pathname === item.path ? 600 : 400, fontSize: '0.95rem' }} />
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 1 }} />
      <List sx={{ px: 1 }}>
        <ListItem
          component={Link}
          to="/profile"
          onClick={() => setDrawerOpen(false)}
          sx={{
            borderRadius: '12px', px: 2,
            backgroundColor: location.pathname === '/profile' ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
            '&:hover': { backgroundColor: 'rgba(79, 70, 229, 0.05)' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}><AccountCircle /></ListItemIcon>
          <ListItemText primary={t('navigation.profile', 'Profile')} />
        </ListItem>
        <ListItem
          component={Link}
          to="/settings"
          onClick={() => setDrawerOpen(false)}
          sx={{
            borderRadius: '12px', px: 2,
            backgroundColor: location.pathname === '/settings' ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
            '&:hover': { backgroundColor: 'rgba(79, 70, 229, 0.05)' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}><SettingsIcon /></ListItemIcon>
          <ListItemText primary={t('navigation.settings', 'Settings')} />
        </ListItem>
        <ListItem
          onClick={handleLogout}
          sx={{
            borderRadius: '12px', px: 2, cursor: 'pointer',
            '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.05)', color: '#ef4444' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}><ExitToApp /></ListItemIcon>
          <ListItemText primary={t('navigation.logout', 'Logout')} />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      {/* Top App Bar */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(226,232,240,0.8)',
          color: '#1e293b',
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          {isMobile && (
            <IconButton edge="start" onClick={() => setDrawerOpen(true)} id="mobile-menu-btn">
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            component={Link}
            to="/dashboard"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #4f46e5, #14b8a6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              flexGrow: isMobile ? 1 : 0,
              mr: 4,
              fontSize: '1.3rem',
            }}
            id="app-logo"
          >
            SaralYojna
          </Typography>

          {/* Desktop Nav */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 0.5, flexGrow: 1 }}>
              {NAV_ITEMS.map((item) => (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  startIcon={item.icon}
                  id={`nav-${item.path.slice(1)}`}
                  sx={{
                    textTransform: 'none',
                    fontWeight: location.pathname === item.path ? 600 : 400,
                    color: location.pathname === item.path ? '#4f46e5' : '#64748b',
                    backgroundColor: location.pathname === item.path ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                    borderRadius: '10px',
                    px: 2,
                    '&:hover': { backgroundColor: 'rgba(79, 70, 229, 0.06)', color: '#4f46e5' },
                    transition: 'all 0.2s ease',
                  }}
                >
                  {t(item.labelKey, item.label)}
                </Button>
              ))}
            </Box>
          )}

          {/* Settings link moved to profile section */}

          <LanguageSwitcher />

          <Tooltip title="Notifications">
            <IconButton sx={{ color: '#64748b' }} id="notifications-btn">
              <Badge
                badgeContent={unreadCount}
                color="error"
                sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', height: 18, minWidth: 18 } }}
              >
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title={user ? `${user.firstName || ''} ${user.lastName || ''}` : 'Profile'}>
            <IconButton
              component={Link}
              to="/profile"
              id="profile-btn"
              sx={{
                p: 0.5,
                border: '2px solid transparent',
                borderColor: location.pathname === '/profile' ? '#4f46e5' : 'transparent',
                transition: 'all 0.2s ease',
              }}
            >
              <Avatar
                sx={{
                  width: 34, height: 34,
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  fontSize: '0.85rem', fontWeight: 700,
                }}
              >
                {user ? (user.firstName?.[0] || 'U').toUpperCase() : 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>

          {!isMobile && (
            <Button
              onClick={handleLogout}
              startIcon={<ExitToApp />}
              id="logout-btn"
              sx={{
                ml: 1, textTransform: 'none', color: '#64748b', borderRadius: '10px',
                '&:hover': { backgroundColor: 'rgba(239,68,68,0.06)', color: '#ef4444' },
              }}
            >
              {t('navigation.logout', 'Logout')}
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { borderRadius: '0 16px 16px 0' } }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, minHeight: 0 }}>
        <Fade key={location.pathname} in={true} timeout={400}>
          <Box sx={{ minHeight: '100%' }}>
            <Outlet />
          </Box>
        </Fade>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3, px: 4, textAlign: 'center',
          borderTop: '1px solid', borderColor: 'rgba(226,232,240,0.8)',
          background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)',
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          © {new Date().getFullYear()} SaralYojna · Empowering Citizens
        </Typography>
      </Box>
    </Box>
  );
}
