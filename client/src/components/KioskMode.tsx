import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, Chip, IconButton, AppBar, Toolbar, Container, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, LinearProgress } from '@mui/material';
import { useI18n } from '../hooks/useI18n';
import { useNavigate } from 'react-router-dom';
import { 
  Accessibility as AccessibilityIcon, 
  Logout as LogoutIcon, 
  Help as HelpIcon, 
  Language as LanguageIcon,
  Security as SecurityIcon,
  Timer as TimerIcon,
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

interface KioskSession {
  startTime: Date;
  timeoutWarningShown: boolean;
  lastActivity: Date;
}

export const KioskMode: React.FC = () => {
  const { t, currentLanguage, switchLanguage } = useI18n();
  const navigate = useNavigate();
  
  const [isKioskMode, setIsKioskMode] = useState(false);
  const [session, setSession] = useState<KioskSession | null>(null);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  
  const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minutes
  const WARNING_TIME = 2 * 60 * 1000; // 2 minutes

  useEffect(() => {
    // Check if kiosk mode is enabled
    const kioskMode = localStorage.getItem('kioskMode') === 'true';
    setIsKioskMode(kioskMode);
    
    if (kioskMode) {
      startKioskSession();
      document.addEventListener('mousemove', resetSessionTimer);
      document.addEventListener('keypress', resetSessionTimer);
      document.addEventListener('click', resetSessionTimer);
    }

    return () => {
      document.removeEventListener('mousemove', resetSessionTimer);
      document.removeEventListener('keypress', resetSessionTimer);
      document.removeEventListener('click', resetSessionTimer);
    };
  }, []);

  useEffect(() => {
    if (session && isKioskMode) {
      const timer = setInterval(() => {
        const now = new Date();
        const timeElapsed = now.getTime() - session.lastActivity.getTime();
        const timeLeft = SESSION_TIMEOUT - timeElapsed;
        
        setTimeRemaining(Math.max(0, timeLeft));

        if (timeLeft <= 0) {
          endKioskSession();
        } else if (timeLeft <= WARNING_TIME && !session.timeoutWarningShown) {
          setSession(prev => prev ? { ...prev, timeoutWarningShown: true } : null);
          setShowTimeoutWarning(true);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [session, isKioskMode]);

  const startKioskSession = () => {
    const newSession: KioskSession = {
      startTime: new Date(),
      timeoutWarningShown: false,
      lastActivity: new Date()
    };
    setSession(newSession);
    setShowTimeoutWarning(false);
  };

  const resetSessionTimer = () => {
    if (session) {
      setSession(prev => prev ? { ...prev, lastActivity: new Date(), timeoutWarningShown: false } : null);
      setShowTimeoutWarning(false);
    }
  };

  const endKioskSession = () => {
    setIsKioskMode(false);
    setSession(null);
    setShowTimeoutWarning(false);
    localStorage.removeItem('kioskMode');
    navigate('/');
  };

  const extendSession = () => {
    resetSessionTimer();
    setShowTimeoutWarning(false);
  };

  const toggleKioskMode = () => {
    const newMode = !isKioskMode;
    setIsKioskMode(newMode);
    localStorage.setItem('kioskMode', newMode.toString());
    
    if (newMode) {
      startKioskSession();
    } else {
      endKioskSession();
    }
  };

  const getLargeTouchTargetButton = (props: any) => ({
    ...props,
    sx: {
      minWidth: 120,
      minHeight: 60,
      fontSize: '1.2rem',
      padding: '16px 24px',
      borderRadius: '12px',
      textTransform: 'none',
      fontWeight: 600,
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
        transition: 'all 0.3s ease'
      },
      '&:active': {
        transform: 'translateY(0)',
        transition: 'all 0.1s ease'
      },
      ...props.sx
    }
  });

  const kioskActions = [
    {
      title: t('kiosk.actions.schemes', 'View Schemes'),
      description: t('kiosk.actions.schemesDesc', 'Browse all available government schemes'),
      icon: <HelpIcon sx={{ fontSize: 40 }} />,
      onClick: () => navigate('/schemes'),
      color: 'primary'
    },
    {
      title: t('kiosk.actions.eligibility', 'Check Eligibility'),
      description: t('kiosk.actions.eligibilityDesc', 'Find schemes you may be eligible for'),
      icon: <AccessibilityIcon sx={{ fontSize: 40 }} />,
      onClick: () => navigate('/eligibility'),
      color: 'secondary'
    },
    {
      title: t('kiosk.actions.applications', 'My Applications'),
      description: t('kiosk.actions.applicationsDesc', 'Track your application status'),
      icon: <HomeIcon sx={{ fontSize: 40 }} />,
      onClick: () => navigate('/applications'),
      color: 'info'
    },
    {
      title: t('kiosk.actions.help', 'Get Help'),
      description: t('kiosk.actions.helpDesc', 'Find help centers and support'),
      icon: <HelpIcon sx={{ fontSize: 40 }} />,
      onClick: () => setShowHelp(true),
      color: 'success'
    }
  ];

  if (!isKioskMode) {
    return (
      <Container maxWidth="md">
        <Box py={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <SecurityIcon color="primary" />
                <Typography variant="h4" fontWeight="600">
                  {t('kiosk.title', 'Kiosk Mode')}
                </Typography>
              </Box>
              
              <Typography variant="body1" color="text.secondary" paragraph>
                {t('kiosk.description', 'Enable kiosk mode for public access points. This mode provides enhanced accessibility features and automatic session management.')}
              </Typography>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {t('kiosk.features.title', 'Features')}
                      </Typography>
                      <Box component="ul" sx={{ pl: 2 }}>
                        <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {t('kiosk.features.largeTouch', 'Large touch targets (minimum 60px)')}
                        </Typography>
                        <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {t('kiosk.features.highContrast', 'High contrast mode for visibility')}
                        </Typography>
                        <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {t('kiosk.features.sessionTimeout', 'Automatic session timeout for security')}
                        </Typography>
                        <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {t('kiosk.features.keyboardNav', 'Full keyboard navigation support')}
                        </Typography>
                        <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {t('kiosk.features.screenReader', 'Screen reader compatibility')}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {t('kiosk.useCases.title', 'Use Cases')}
                      </Typography>
                      <Box component="ul" sx={{ pl: 2 }}>
                        <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {t('kiosk.useCases.publicOffices', 'Government offices and public service centers')}
                        </Typography>
                        <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {t('kiosk.useCases.ruralCenters', 'Common Service Centers (CSCs)')}
                        </Typography>
                        <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {t('kiosk.useCases.helpDesks', 'Help desks and information kiosks')}
                        </Typography>
                        <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {t('kiosk.useCases.publicSpaces', 'Libraries, community centers, and public spaces')}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Box display="flex" gap={2}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={toggleKioskMode}
                  startIcon={<SecurityIcon />}
                >
                  {t('kiosk.enable', 'Enable Kiosk Mode')}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/')}
                >
                  {t('kiosk.backToNormal', 'Back to Normal Mode')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
    );
  }

  return (
    <Box>
      {/* Kiosk Mode Header */}
      <AppBar position="sticky" color="primary" elevation={4}>
        <Toolbar>
          <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
            <Box display="flex" alignItems="center" gap={2}>
              <SecurityIcon />
              <Typography variant="h6" fontWeight="600">
                {t('kiosk.modeActive', 'Kiosk Mode Active')}
              </Typography>
              <Chip
                label={t('kiosk.sessionActive', 'Session Active')}
                color="success"
                size="small"
                variant="outlined"
              />
            </Box>
            
            <Box display="flex" alignItems="center" gap={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <TimerIcon />
                <Typography variant="body2">
                  {Math.floor(timeRemaining / 60000)}:{Math.floor((timeRemaining % 60000) / 1000).toString().padStart(2, '0')}
                </Typography>
              </Box>
              <IconButton onClick={() => setShowLanguageSelector(true)} color="inherit">
                <LanguageIcon />
              </IconButton>
              <IconButton onClick={() => setShowHelp(true)} color="inherit">
                <HelpIcon />
              </IconButton>
              <IconButton onClick={endKioskSession} color="inherit">
                <LogoutIcon />
              </IconButton>
            </Box>
          </Box>
        </Toolbar>
        
        {timeRemaining <= WARNING_TIME && (
          <Box sx={{ backgroundColor: 'warning.main', color: 'warning.contrastText', py: 1, px: 2 }}>
            <Typography variant="body2" align="center">
              {t('kiosk.timeoutWarning', 'Your session will expire soon. Click anywhere to continue.')}
            </Typography>
          </Box>
        )}
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg">
        <Box py={4}>
          <Typography variant="h4" gutterBottom align="center">
            {t('kiosk.welcome', 'Welcome to GovScheme Kiosk')}
          </Typography>
          <Typography variant="h6" color="text.secondary" align="center" paragraph>
            {t('kiosk.subtitle', 'How can we help you today?')}
          </Typography>

          {/* Quick Actions */}
          <Grid container spacing={4} sx={{ mb: 4 }}>
            {kioskActions.map((action, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  {...getLargeTouchTargetButton({
                    onClick: action.onClick,
                    sx: {
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      textAlign: 'center',
                      backgroundColor: 'background.paper',
                      border: '2px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'primary.light',
                        color: 'primary.contrastText'
                      }
                    }
                  })}
                >
                  <Box sx={{ mb: 2, color: 'primary.main' }}>
                    {action.icon}
                  </Box>
                  <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Additional Features */}
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('kiosk.features.title', 'Accessibility Features')}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Button
                        {...getLargeTouchTargetButton({
                          variant: 'outlined',
                          startIcon: <AccessibilityIcon />,
                          onClick: () => {}
                        })}
                      >
                        {t('kiosk.features.highContrast', 'High Contrast')}
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        {...getLargeTouchTargetButton({
                          variant: 'outlined',
                          startIcon: <HelpIcon />,
                          onClick: () => {}
                        })}
                      >
                        {t('kiosk.features.screenReader', 'Screen Reader')}
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        {...getLargeTouchTargetButton({
                          variant: 'outlined',
                          startIcon: <LanguageIcon />,
                          onClick: () => setShowLanguageSelector(true)
                        })}
                      >
                        {t('kiosk.features.language', 'Change Language')}
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        {...getLargeTouchTargetButton({
                          variant: 'outlined',
                          startIcon: <HomeIcon />,
                          onClick: () => navigate('/')}
                        })}
                      >
                        {t('kiosk.features.home', 'Home')}
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('kiosk.session.title', 'Session Management')}
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={(timeRemaining / SESSION_TIMEOUT) * 100} 
                      color={timeRemaining <= WARNING_TIME ? "warning" : "primary"}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {t('kiosk.session.timeLeft', 'Time remaining')}: {Math.floor(timeRemaining / 60000)}:{Math.floor((timeRemaining % 60000) / 1000).toString().padStart(2, '0')}
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Button
                        {...getLargeTouchTargetButton({
                          variant: 'contained',
                          color: 'primary',
                          onClick: extendSession
                        })}
                      >
                        {t('kiosk.session.extend', 'Extend Session')}
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        {...getLargeTouchTargetButton({
                          variant: 'outlined',
                          color: 'error',
                          onClick: endKioskSession
                        })}
                      >
                        {t('kiosk.session.end', 'End Session')}
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* Timeout Warning Dialog */}
      <Dialog open={showTimeoutWarning} onClose={extendSession} maxWidth="sm" fullWidth>
        <DialogTitle>
          <SecurityIcon color="warning" /> {t('kiosk.timeout.title', 'Session About to Expire')}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            {t('kiosk.timeout.message', 'Your session will expire in 2 minutes due to inactivity.')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('kiosk.timeout.action', 'Click "Continue" to extend your session or "End Session" to log out.')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={endKioskSession} variant="outlined" color="error">
            {t('kiosk.timeout.endSession', 'End Session')}
          </Button>
          <Button onClick={extendSession} variant="contained" color="primary">
            {t('kiosk.timeout.continue', 'Continue Session')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Help Dialog */}
      <Dialog open={showHelp} onClose={() => setShowHelp(false)} maxWidth="md" fullWidth>
        <DialogTitle>{t('kiosk.help.title', 'Need Help?')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('kiosk.help.assistant', 'Virtual Assistant')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {t('kiosk.help.assistantDesc', 'Click the chat icon in the bottom right corner to chat with our AI assistant.')}
                  </Typography>
                  <Button
                    {...getLargeTouchTargetButton({
                      variant: 'contained',
                      onClick: () => {}
                    })}
                  >
                    {t('kiosk.help.openChat', 'Open Chat')}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('kiosk.help.human', 'Human Assistance')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {t('kiosk.help.humanDesc', 'Find nearby help centers and contact information for personal assistance.')}
                  </Typography>
                  <Button
                    {...getLargeTouchTargetButton({
                      variant: 'contained',
                      onClick: () => navigate('/community')
                    })}
                  >
                    {t('kiosk.help.findHelp', 'Find Help Centers')}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHelp(false)}>{t('common.close', 'Close')}</Button>
        </DialogActions>
      </Dialog>

      {/* Language Selector Dialog */}
      <Dialog open={showLanguageSelector} onClose={() => setShowLanguageSelector(false)} maxWidth="sm">
        <DialogTitle>{t('kiosk.language.title', 'Select Language')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {/* Add language selection buttons here */}
            <Grid item xs={6}>
              <Button
                {...getLargeTouchTargetButton({
                  variant: 'outlined',
                  onClick: () => { switchLanguage('en'); setShowLanguageSelector(false); }
                })}
              >
                English
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                {...getLargeTouchTargetButton({
                  variant: 'outlined',
                  onClick: () => { switchLanguage('hi'); setShowLanguageSelector(false); }
                })}
              >
                हिन्दी
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLanguageSelector(false)}>{t('common.close', 'Close')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};