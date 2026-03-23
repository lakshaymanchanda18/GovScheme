import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Container, Grid, Card, CardContent, Button, Avatar,
  Chip, LinearProgress, IconButton, Skeleton, Stack, Divider
} from '@mui/material';
import {
  MenuBook, Search, Assignment, TrendingUp,
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

const QUICK_ACTIONS = [
  { icon: <MenuBook sx={{ fontSize: 28 }} />, label: 'Browse Schemes', path: '/schemes', gradient: 'linear-gradient(135deg, #4f46e5, #7c3aed)', shadow: 'rgba(79,70,229,0.25)' },
  { icon: <Search sx={{ fontSize: 28 }} />, label: 'Check Eligibility', path: '/eligibility', gradient: 'linear-gradient(135deg, #0d9488, #14b8a6)', shadow: 'rgba(13,148,136,0.25)' },
  { icon: <Assignment sx={{ fontSize: 28 }} />, label: 'My Applications', path: '/applications', gradient: 'linear-gradient(135deg, #d97706, #f59e0b)', shadow: 'rgba(217,119,6,0.25)' },
  { icon: <SmartToy sx={{ fontSize: 28 }} />, label: 'AI Assistant', path: '/chatbot', gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)', shadow: 'rgba(8,145,178,0.25)' },
];

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

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch stats and schemes in parallel from server
      const [statsData, schemesData] = await Promise.all([
        api.get('/dashboard/stats').catch(() => null),
        api.get('/schemes').catch(() => []),
      ]);

      if (statsData) {
        setStats(statsData);
      }

      setSchemes(Array.isArray(schemesData) ? schemesData.slice(0, 5) : []);
    } catch {
      // Stats will stay at defaults (zeros)
    } finally {
      setLoading(false);
    }
  };

  const firstName = user?.firstName || 'User';
  const profileComplete = user
    ? (PROFILE_FIELDS.filter(k => user[k]).length / PROFILE_FIELDS.length) * 100
    : 0;

  const statCards = [
    { label: 'Available Schemes', value: stats.totalSchemes, icon: <AccountBalance />, bg: '#eef2ff', color: '#4f46e5' },
    { label: 'Eligible For You', value: stats.eligibleSchemes, icon: <CheckCircle />, bg: '#dcfce7', color: '#059669' },
    { label: 'Applications', value: stats.totalApplications, icon: <Assignment />, bg: '#fef3c7', color: '#d97706' },
    { label: 'Approved', value: stats.approvedApplications, icon: <Star />, bg: '#cffafe', color: '#0891b2' },
  ];

  return (
    <Box sx={{ py: { xs: 3, md: 4 }, minHeight: 'calc(100vh - 120px)' }}>
      <Container maxWidth="lg">
        {/* ===== WELCOME HEADER ===== */}
        <Box
          className="animate-fade-in-up"
          sx={{
            mb: 4,
            p: { xs: 3, md: 4 },
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed, #4f46e5)',
            backgroundSize: '200% 200%',
            animation: 'gradient-shift 8s ease infinite',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <Box sx={{ position: 'absolute', bottom: -60, right: 100, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
              Welcome back, {firstName}! 👋
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.05rem', maxWidth: 500 }}>
              {stats.eligibleSchemes > 0
                ? `You're eligible for ${stats.eligibleSchemes} schemes. Explore and apply today!`
                : 'Complete your profile to discover schemes tailored for you.'}
            </Typography>
          </Box>
        </Box>

        {/* ===== STAT CARDS ===== */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {statCards.map((card, idx) => (
            <Grid item xs={6} sm={3} key={idx}>
              <Card
                className="animate-fade-in-up"
                elevation={0}
                sx={{
                  borderRadius: '18px',
                  border: '1px solid #f1f5f9',
                  animationDelay: `${idx * 80}ms`,
                  transition: 'all 0.3s ease',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 32px rgba(0,0,0,0.06)' },
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
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#0f172a' }} className="animate-fade-in-up delay-200">
              Quick Actions
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {QUICK_ACTIONS.map((action, idx) => (
                <Grid item xs={6} sm={3} key={idx}>
                  <Card
                    className="animate-fade-in-up"
                    elevation={0}
                    onClick={() => navigate(action.path)}
                    sx={{
                      borderRadius: '18px', border: '1px solid #f1f5f9', cursor: 'pointer',
                      textAlign: 'center', animationDelay: `${300 + idx * 80}ms`,
                      transition: 'all 0.3s ease',
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 12px 32px ${action.shadow}`, borderColor: 'transparent' },
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Avatar sx={{ width: 52, height: 52, mx: 'auto', mb: 1.5, background: action.gradient, boxShadow: `0 6px 20px ${action.shadow}` }}>
                        {action.icon}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                        {action.label}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* ===== RECENT SCHEMES ===== */}
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#0f172a' }} className="animate-fade-in-up delay-400">
              Recent Schemes
            </Typography>
            <Card elevation={0} className="animate-fade-in-up delay-400" sx={{ borderRadius: '18px', border: '1px solid #f1f5f9' }}>
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
                          transition: 'all 0.2s ease', '&:hover': { backgroundColor: 'rgba(79,70,229,0.03)' },
                        }}
                        onClick={() => navigate(`/schemes/${scheme.id}`)}
                      >
                        <Avatar sx={{ width: 44, height: 44, background: `hsl(${(idx * 60) + 240}, 60%, 95%)`, color: `hsl(${(idx * 60) + 240}, 60%, 45%)`, fontWeight: 700, fontSize: '0.9rem' }}>
                          {scheme.name[0]}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {scheme.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            {scheme.department}
                          </Typography>
                        </Box>
                        <Chip label={scheme.category} size="small" sx={{ fontWeight: 600, fontSize: '0.7rem', background: 'rgba(79,70,229,0.08)', color: '#4f46e5', borderRadius: '8px' }} />
                        <IconButton size="small" sx={{ color: '#94a3b8' }}>
                          <ArrowForward fontSize="small" />
                        </IconButton>
                      </Box>
                      {idx < schemes.length - 1 && <Divider />}
                    </Box>
                  ))}
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate('/schemes')} sx={{ textTransform: 'none', fontWeight: 600, color: '#4f46e5' }}>
                      View All Schemes
                    </Button>
                  </Box>
                </CardContent>
              ) : (
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <MenuBook sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No schemes loaded yet. Make sure the server is running.
                  </Typography>
                </CardContent>
              )}
            </Card>
          </Grid>

          {/* ===== SIDEBAR ===== */}
          <Grid item xs={12} md={4}>
            {/* Profile Completion */}
            <Card elevation={0} className="animate-fade-in-up delay-300" sx={{ borderRadius: '18px', border: '1px solid #f1f5f9', mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>Profile</Typography>
                  <Chip
                    label={`${Math.round(profileComplete)}%`}
                    size="small"
                    sx={{
                      fontWeight: 700,
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
                      background: profileComplete >= 80 ? 'linear-gradient(90deg, #059669, #34d399)' : 'linear-gradient(90deg, #4f46e5, #818cf8)',
                    },
                  }}
                />
                <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                  {profileComplete < 80 ? 'Complete your profile to get better scheme recommendations.' : 'Great! Your profile is nearly complete.'}
                </Typography>
                <Button
                  fullWidth variant="outlined" size="small" onClick={() => navigate('/profile')} id="dashboard-profile-btn"
                  sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '10px', borderColor: '#e2e8f0', color: '#4f46e5', '&:hover': { borderColor: '#4f46e5', backgroundColor: 'rgba(79,70,229,0.04)' } }}
                >
                  Complete Profile
                </Button>
              </CardContent>
            </Card>

            {/* Application Status Summary */}
            <Card elevation={0} className="animate-fade-in-up delay-400" sx={{ borderRadius: '18px', border: '1px solid #f1f5f9', mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', mb: 2 }}>Application Status</Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Schedule sx={{ color: '#f59e0b', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>Pending</Typography>
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#f59e0b' }}>{stats.pendingApplications}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <CheckCircle sx={{ color: '#22c55e', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>Approved</Typography>
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#22c55e' }}>{stats.approvedApplications}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Cancel sx={{ color: '#ef4444', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>Rejected</Typography>
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ef4444' }}>{stats.rejectedApplications}</Typography>
                  </Box>
                </Stack>
                <Button
                  fullWidth size="small" endIcon={<ArrowForward />} onClick={() => navigate('/applications')}
                  sx={{ mt: 2.5, textTransform: 'none', fontWeight: 600, borderRadius: '10px', color: '#4f46e5', backgroundColor: 'rgba(79,70,229,0.06)', '&:hover': { backgroundColor: 'rgba(79,70,229,0.12)' } }}
                >
                  View All Applications
                </Button>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card
              elevation={0} className="animate-fade-in-up delay-500"
              sx={{ borderRadius: '18px', border: '1px solid rgba(20,184,166,0.2)', background: 'linear-gradient(135deg, #f0fdfa, #ecfdf5)' }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f766e', mb: 1 }}>
                  💡 Did you know?
                </Typography>
                <Typography variant="body2" sx={{ color: '#115e59', lineHeight: 1.7 }}>
                  Completing your Aadhar and PAN details improves scheme matching accuracy by up to 40%.
                  Update your profile to unlock more recommendations!
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
