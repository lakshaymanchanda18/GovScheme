import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Container, Grid, Card, CardContent, Button, Avatar,
  Chip, LinearProgress, IconButton, Skeleton, Stack, Divider
} from '@mui/material';
import {
  MenuBook, Search, Assignment,
  ArrowForward, CheckCircle, Schedule, Cancel, Star,
  AccountBalance, SmartToy
} from '@mui/icons-material';
import { useAuth, User } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { useI18n } from '../hooks/useI18n';

interface DashboardStats {
  totalSchemes: number;
  eligibleSchemes: number;
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
}

interface RecentScheme {
  id: string;
  name: string;
  category: string;
  department: string;
}

const PROFILE_FIELDS: (keyof User)[] = [
  'firstName', 'lastName', 'email', 'phone', 'state', 'income', 'occupation', 'education'
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { api } = useApi();
  const { t, formatNumber } = useI18n();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [schemes, setSchemes] = useState<RecentScheme[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalSchemes: 0,
    eligibleSchemes: 0,
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
  });

  const [recentApps, setRecentApps] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, eligibilityData, appsData] = await Promise.all([
        api.get('/dashboard/stats').catch(() => null),
        api.post('/eligibility/check-all').catch(() => null),
        api.get('/applications').catch(() => []),
      ]);

      if (statsData) setStats(statsData);
      
      if (eligibilityData?.topRecommendations) {
        setSchemes(eligibilityData.topRecommendations.map((r: any) => ({
          id: r.schemeId,
          name: r.schemeName,
          category: r.confidenceScore >= 60 ? 'High Match' : 'Recommended',
          department: `Score: ${r.confidenceScore}%`,
        })));
      } else {
        const fallbackSchemes = await api.get('/schemes').catch(() => []);
        setSchemes(Array.isArray(fallbackSchemes) ? fallbackSchemes.slice(0, 5) : []);
      }

      setRecentApps(Array.isArray(appsData) ? appsData.slice(0, 5) : []);
    } catch {
      // Keep defaults
    } finally {
      setLoading(false);
    }
  };

  const firstName = user?.firstName || 'User';
  const profileComplete = user
    ? (PROFILE_FIELDS.filter(k => user[k]).length / PROFILE_FIELDS.length) * 100
    : 0;

  const quickActions = [
    { icon: <MenuBook sx={{ fontSize: 26 }} />, label: t('dashboard.browseSchemes', 'Browse Schemes'), path: '/schemes', bg: '#f1f5f9', color: '#0c2340' },
    { icon: <Search sx={{ fontSize: 26 }} />, label: t('dashboard.checkEligibility', 'Check Eligibility'), path: '/eligibility', bg: '#f0fdf4', color: '#047857' },
    { icon: <Assignment sx={{ fontSize: 26 }} />, label: t('dashboard.viewApplications', 'My Applications'), path: '/applications', bg: '#fffbeb', color: '#b45309' },
    { icon: <SmartToy sx={{ fontSize: 26 }} />, label: t('dashboard.assistant', 'Scheme Assistant'), path: '/chatbot', bg: '#f0f9ff', color: '#0284c7' },
  ];

  const statCards = [
    { label: t('dashboard.availableSchemes', 'Available Schemes'), value: stats.totalSchemes, icon: <AccountBalance />, bg: '#f1f5f9', color: '#0c2340' },
    { label: t('dashboard.eligibleForYou', 'Eligible For You'), value: stats.eligibleSchemes, icon: <CheckCircle />, bg: '#dcfce7', color: '#059669' },
    { label: t('dashboard.myApplications', 'Applications'), value: stats.totalApplications, icon: <Assignment />, bg: '#fef3c7', color: '#d97706' },
    { label: t('dashboard.approved', 'Approved'), value: stats.approvedApplications, icon: <Star />, bg: '#cffafe', color: '#0284c7' },
  ];

  return (
    <Box sx={{ py: { xs: 3, md: 4 }, minHeight: 'calc(100vh - 120px)', background: '#f8fafc' }}>
      <Container maxWidth="lg">
        {/* ===== WELCOME HEADER ===== */}
        <Box
          className="animate-fade-in-up"
          sx={{
            mb: 4,
            p: { xs: 3, md: 4 },
            borderRadius: '8px',
            background: '#0c2340',
            color: '#fff',
            borderBottom: '4px solid #047857',
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
            {t('dashboard.welcome', { name: firstName, defaultValue: `Welcome, ${firstName}` })}
          </Typography>
          <Typography sx={{ color: '#cbd5e1', fontSize: '1rem', maxWidth: 600 }}>
            {stats.eligibleSchemes > 0
              ? t('dashboard.eligibleMessage', { count: stats.eligibleSchemes, defaultValue: `You are currently eligible for ${stats.eligibleSchemes} schemes. Review requirements and submit applications online.` })
              : t('dashboard.completeProfileMessage', 'Complete your profile to discover welfare schemes tailored for your background.')}
          </Typography>
        </Box>

        {/* ===== STAT CARDS ===== */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {statCards.map((card, idx) => (
            <Grid item xs={6} sm={3} key={idx}>
              <Card
                className="animate-fade-in-up"
                elevation={0}
                sx={{
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'translateY(-2px)', borderColor: '#0c2340', boxShadow: '0 4px 12px rgba(12,35,64,0.06)' },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Avatar sx={{ width: 42, height: 42, background: card.bg, color: card.color }}>
                      {card.icon}
                    </Avatar>
                  </Box>
                  {loading ? (
                    <Skeleton width={60} height={36} />
                  ) : (
                    <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a' }}>
                      {formatNumber(card.value)}
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, mt: 0.5 }}>
                    {card.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {/* ===== QUICK ACTIONS + RECENT SCHEMES ===== */}
          <Grid item xs={12} md={8}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#0c2340' }} className="animate-fade-in-up delay-200">
              {t('dashboard.quickActions', 'Quick Actions')}
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {quickActions.map((action, idx) => (
                <Grid item xs={6} sm={3} key={idx}>
                  <Card
                    elevation={0}
                    onClick={() => navigate(action.path)}
                    sx={{
                      borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer',
                      textAlign: 'center',
                      p: 2,
                      background: '#ffffff',
                      transition: 'all 0.2s ease',
                      '&:hover': { transform: 'translateY(-2px)', borderColor: '#0c2340', boxShadow: '0 4px 12px rgba(12,35,64,0.06)' },
                    }}
                  >
                    <Box sx={{ width: 48, height: 48, borderRadius: '6px', mx: 'auto', mb: 1.5, background: action.bg, color: action.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {action.icon}
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#0c2340' }}>
                      {action.label}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#0c2340' }} className="animate-fade-in-up delay-400">
              {t('dashboard.topRecommendations', 'Top Scheme Recommendations')}
            </Typography>
            <Card elevation={0} className="animate-fade-in-up delay-400" sx={{ borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff' }}>
              {loading ? (
                <CardContent>
                  {[1, 2, 3].map(i => (
                    <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Skeleton variant="circular" width={44} height={44} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton width="60%" />
                        <Skeleton width="40%" />
                      </Box>
                    </Box>
                  ))}
                </CardContent>
              ) : schemes.length > 0 ? (
                <CardContent sx={{ p: 0 }}>
                  {schemes.map((scheme, idx) => (
                    <Box key={scheme.id}>
                      <Box
                        sx={{
                          display: 'flex', alignItems: 'center', gap: 2, p: 2.5, cursor: 'pointer',
                          transition: 'all 0.2s ease', '&:hover': { backgroundColor: '#f8fafc' },
                        }}
                        onClick={() => navigate(`/schemes/${scheme.id}`)}
                      >
                        <Avatar sx={{ width: 40, height: 40, background: '#f1f5f9', color: '#0c2340', fontWeight: 700, fontSize: '0.9rem', borderRadius: '6px' }}>
                          {scheme.name[0]}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0c2340', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {scheme.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            {scheme.department}
                          </Typography>
                        </Box>
                        <Chip label={scheme.category} size="small" sx={{ fontWeight: 600, fontSize: '0.72rem', background: '#f1f5f9', color: '#0c2340', borderRadius: '4px' }} />
                        <IconButton size="small" sx={{ color: '#94a3b8' }}>
                          <ArrowForward fontSize="small" />
                        </IconButton>
                      </Box>
                      {idx < schemes.length - 1 && <Divider />}
                    </Box>
                  ))}
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate('/schemes')} sx={{ textTransform: 'none', fontWeight: 600, color: '#0c2340' }}>
                      {t('schemes.allSchemes', 'View All Schemes')}
                    </Button>
                  </Box>
                </CardContent>
              ) : (
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <MenuBook sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {t('dashboard.noRecommendations', 'No recommendations available. Update your profile for matches.')}
                  </Typography>
                </CardContent>
              )}
            </Card>

            {/* ===== RECENT APPLICATIONS ===== */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#0c2340' }} className="animate-fade-in-up delay-400">
                {t('dashboard.recentApplications', 'Recent Applications')}
              </Typography>
              <Card elevation={0} className="animate-fade-in-up delay-400" sx={{ borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff' }}>
                {loading ? (
                  <CardContent>
                    <Skeleton width="100%" height={60} sx={{ mb: 1 }} />
                    <Skeleton width="100%" height={60} />
                  </CardContent>
                ) : recentApps.length > 0 ? (
                  <CardContent sx={{ p: 0 }}>
                    {recentApps.map((app, idx) => (
                      <Box key={app.id}>
                        <Box
                          sx={{
                            display: 'flex', alignItems: 'center', p: 2.5, cursor: 'pointer',
                            '&:hover': { backgroundColor: '#f8fafc' },
                          }}
                          onClick={() => navigate(`/applications/${app.id}`)}
                        >
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0c2340', mb: 0.5 }}>
                              {app.scheme?.name || 'Unknown Scheme'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                              Submitted on {new Date(app.submittedAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Chip 
                            label={app.status} 
                            size="small" 
                            sx={{ 
                              fontWeight: 700, fontSize: '0.7rem',
                              borderRadius: '4px',
                              background: app.status === 'APPROVED' ? '#dcfce7' : app.status === 'REJECTED' ? '#fee2e2' : '#fef3c7',
                              color: app.status === 'APPROVED' ? '#15803d' : app.status === 'REJECTED' ? '#b91c1c' : '#b45309'
                            }} 
                          />
                        </Box>
                        {idx < recentApps.length - 1 && <Divider />}
                      </Box>
                    ))}
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate('/applications')} sx={{ textTransform: 'none', fontWeight: 600, color: '#0c2340' }}>
                        {t('dashboard.viewApplications', 'View All Applications')}
                      </Button>
                    </Box>
                  </CardContent>
                ) : (
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Assignment sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {t('dashboard.noApplications', 'You haven\'t submitted any applications yet.')}
                    </Typography>
                  </CardContent>
                )}
              </Card>
            </Box>
          </Grid>

          {/* ===== SIDEBAR ===== */}
          <Grid item xs={12} md={4}>
            {/* Profile Completion */}
            <Card elevation={0} className="animate-fade-in-up delay-300" sx={{ borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0c2340' }}>
                    {t('navigation.profile', 'Profile')}
                  </Typography>
                  <Chip
                    label={`${Math.round(profileComplete)}%`}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      borderRadius: '4px',
                      background: profileComplete >= 80 ? '#dcfce7' : profileComplete >= 50 ? '#fef3c7' : '#fee2e2',
                      color: profileComplete >= 80 ? '#15803d' : profileComplete >= 50 ? '#b45309' : '#b91c1c',
                    }}
                  />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={profileComplete}
                  sx={{
                    height: 8, borderRadius: 4, mb: 2, backgroundColor: '#f1f5f9',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: profileComplete >= 80 ? '#059669' : '#0c2340',
                    },
                  }}
                />
                <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                  {profileComplete < 80 
                    ? t('landing.step1Desc', 'Sign up and tell us about yourself — income, location, occupation, and family details.') 
                    : t('profile.profileUpdated', 'Your profile is complete.')}
                </Typography>
                <Button
                  fullWidth variant="outlined" size="small" onClick={() => navigate('/profile')} id="dashboard-profile-btn"
                  sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px', borderColor: '#cbd5e1', color: '#0c2340', '&:hover': { borderColor: '#0c2340', backgroundColor: '#f8fafc' } }}
                >
                  {t('profile.updateProfile', 'Update Profile')}
                </Button>
              </CardContent>
            </Card>

            {/* Application Status Summary */}
            <Card elevation={0} className="animate-fade-in-up delay-400" sx={{ borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0c2340', mb: 2 }}>
                  {t('applications.title', 'Application Status')}
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Schedule sx={{ color: '#f59e0b', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {t('applications.status.pending', 'Pending')}
                      </Typography>
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#f59e0b' }}>{stats.pendingApplications}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <CheckCircle sx={{ color: '#22c55e', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {t('applications.status.approved', 'Approved')}
                      </Typography>
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#22c55e' }}>{stats.approvedApplications}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Cancel sx={{ color: '#ef4444', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {t('applications.status.rejected', 'Rejected')}
                      </Typography>
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ef4444' }}>{stats.rejectedApplications}</Typography>
                  </Box>
                </Stack>
                <Button
                  fullWidth size="small" endIcon={<ArrowForward />} onClick={() => navigate('/applications')}
                  sx={{ mt: 2.5, textTransform: 'none', fontWeight: 600, borderRadius: '6px', color: '#0c2340', backgroundColor: '#f1f5f9', '&:hover': { backgroundColor: '#e2e8f0' } }}
                >
                  {t('dashboard.viewApplications', 'View All Applications')}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
