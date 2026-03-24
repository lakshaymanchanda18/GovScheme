import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Container, Grid, Card, CardContent,
  IconButton, Chip, Avatar, Stack
} from '@mui/material';
import {
  Search, Assignment, Verified, Speed, Translate, Security,
  ArrowForward, MenuBook, SmartToy, TrendingUp,
  CheckCircleOutline, Groups, AccountBalance
} from '@mui/icons-material';

const FEATURES = [
  {
    icon: <Search sx={{ fontSize: 32, color: '#4f46e5' }} />,
    title: 'Smart Discovery',
    description: 'Find government schemes tailored to your profile with intelligent search and filtering.',
    color: '#eef2ff',
  },
  {
    icon: <Verified sx={{ fontSize: 32, color: '#0d9488' }} />,
    title: 'Eligibility Check',
    description: 'Instantly verify your eligibility with our AI-powered assessment engine.',
    color: '#f0fdfa',
  },
  {
    icon: <Assignment sx={{ fontSize: 32, color: '#7c3aed' }} />,
    title: 'Easy Applications',
    description: 'Apply seamlessly with guided forms, document tracking, and real-time status updates.',
    color: '#f5f3ff',
  },
  {
    icon: <Translate sx={{ fontSize: 32, color: '#d97706' }} />,
    title: 'Multilingual',
    description: 'Access the platform in English and Hindi, with more languages coming soon.',
    color: '#fffbeb',
  },
  {
    icon: <SmartToy sx={{ fontSize: 32, color: '#0891b2' }} />,
    title: 'AI Assistant',
    description: 'Get instant answers about schemes, documents, and processes from our chatbot.',
    color: '#ecfeff',
  },
  {
    icon: <Security sx={{ fontSize: 32, color: '#059669' }} />,
    title: 'Secure & Private',
    description: 'Your data is encrypted and handled with the highest security standards.',
    color: '#ecfdf5',
  },
];

const STATS = [
  { value: '500+', label: 'Government Schemes', icon: <AccountBalance /> },
  { value: '10L+', label: 'Citizens Helped', icon: <Groups /> },
  { value: '98%', label: 'Accuracy Rate', icon: <TrendingUp /> },
  { value: '24/7', label: 'Support Available', icon: <Speed /> },
];

const STEPS = [
  { step: '01', title: 'Create Your Profile', description: 'Sign up and tell us about yourself — income, location, occupation, and family details.' },
  { step: '02', title: 'Check Eligibility', description: 'Our AI engine matches you with schemes you qualify for, with transparent scoring.' },
  { step: '03', title: 'Apply Digitally', description: 'Apply online with guided forms, upload documents, and track your application status.' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', overflow: 'hidden' }}>
      {/* ===== NAVBAR ===== */}
      <Box
        component="nav"
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          py: 1.5,
          px: { xs: 2, md: 6 },
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(226,232,240,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 900,
            background: 'linear-gradient(135deg, #4f46e5, #14b8a6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}
        >
          SaralYojna
        </Typography>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button
            component={Link}
            to="/login"
            id="landing-login-btn"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              color: '#4f46e5',
              borderRadius: '10px',
              px: 2.5,
              '&:hover': { backgroundColor: 'rgba(79,70,229,0.06)' },
            }}
          >
            Sign In
          </Button>
          <Button
            component={Link}
            to="/register"
            variant="contained"
            id="landing-register-btn"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              borderRadius: '10px',
              px: 3,
              boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4338ca, #6d28d9)',
                boxShadow: '0 6px 20px rgba(79,70,229,0.4)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.25s ease',
            }}
          >
            Get Started
          </Button>
        </Stack>
      </Box>

      {/* ===== HERO SECTION ===== */}
      <Box
        sx={{
          pt: { xs: 14, md: 18 },
          pb: { xs: 8, md: 14 },
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(160deg, #f8fafc 0%, #eef2ff 40%, #f0fdfa 70%, #f8fafc 100%)',
        }}
      >
        {/* Decorative Shapes */}
        <Box sx={{
          position: 'absolute', top: -80, right: -80, width: 400, height: 400,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
          animation: 'float 6s ease-in-out infinite',
        }} />
        <Box sx={{
          position: 'absolute', bottom: -100, left: -100, width: 500, height: 500,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(20,184,166,0.06) 0%, transparent 70%)',
          animation: 'float 8s ease-in-out infinite',
          animationDelay: '2s',
        }} />
        <Box sx={{
          position: 'absolute', top: '40%', left: '60%', width: 200, height: 200,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 70%)',
          animation: 'float 7s ease-in-out infinite',
          animationDelay: '4s',
        }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <Box className="animate-fade-in-up">
                <Chip
                  label="🇮🇳  Unified Government Schemes Portal"
                  sx={{
                    mb: 3,
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    background: 'rgba(79,70,229,0.08)',
                    color: '#4f46e5',
                    borderRadius: '10px',
                    py: 0.5,
                    px: 0.5,
                  }}
                />
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: '2.5rem', sm: '3.2rem', md: '3.8rem' },
                    lineHeight: 1.1,
                    letterSpacing: '-0.03em',
                    mb: 3,
                    color: '#0f172a',
                  }}
                >
                  Every Scheme.{' '}
                  <Box component="span" sx={{ background: 'linear-gradient(135deg, #4f46e5, #14b8a6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    One Platform.
                  </Box>
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 400,
                    color: '#64748b',
                    lineHeight: 1.7,
                    maxWidth: 520,
                    mb: 4,
                    fontSize: { xs: '1rem', md: '1.15rem' },
                  }}
                >
                  Discover, check eligibility, and apply for government schemes across India.
                  Transparent, accessible, and available in your language.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/register')}
                    id="hero-cta-btn"
                    sx={{
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '1.05rem',
                      borderRadius: '14px',
                      px: 4,
                      py: 1.8,
                      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                      boxShadow: '0 8px 30px rgba(79,70,229,0.35)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #4338ca, #6d28d9)',
                        boxShadow: '0 12px 40px rgba(79,70,229,0.45)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Explore Schemes
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<Search />}
                    onClick={() => navigate('/login')}
                    id="hero-eligibility-btn"
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '1.05rem',
                      borderRadius: '14px',
                      px: 4,
                      py: 1.8,
                      borderColor: '#e2e8f0',
                      color: '#334155',
                      borderWidth: 2,
                      '&:hover': {
                        borderColor: '#4f46e5',
                        backgroundColor: 'rgba(79,70,229,0.04)',
                        borderWidth: 2,
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Check Eligibility
                  </Button>
                </Stack>
              </Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box
                className="animate-fade-in-up delay-300"
                sx={{
                  position: 'relative',
                  display: { xs: 'none', md: 'block' },
                }}
              >
                {/* Decorative illustration using layered cards */}
                <Box sx={{ position: 'relative', height: 400 }}>
                  {/* Background card */}
                  <Box sx={{
                    position: 'absolute', top: 30, left: 40, right: 0, bottom: 30,
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    transform: 'rotate(3deg)',
                    opacity: 0.12,
                  }} />
                  {/* Main card */}
                  <Box sx={{
                    position: 'absolute', top: 0, left: 20, right: 20, bottom: 0,
                    borderRadius: '24px',
                    background: '#fff',
                    boxShadow: '0 20px 60px rgba(79,70,229,0.12)',
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2.5,
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', width: 48, height: 48 }}>
                        <CheckCircleOutline />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>Eligibility Matched</Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>PM Kisan Samman Nidhi</Typography>
                      </Box>
                      <Chip label="98% Match" size="small" sx={{ ml: 'auto', fontWeight: 700, background: '#dcfce7', color: '#15803d' }} />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ background: 'linear-gradient(135deg, #0d9488, #14b8a6)', width: 48, height: 48 }}>
                        <Assignment />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>Application Approved</Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>Ayushman Bharat Yojana</Typography>
                      </Box>
                      <Chip label="Approved" size="small" sx={{ ml: 'auto', fontWeight: 700, background: '#dbeafe', color: '#1d4ed8' }} />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)', width: 48, height: 48 }}>
                        <TrendingUp />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>New Scheme Available</Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>Startup India Initiative</Typography>
                      </Box>
                      <Chip label="New" size="small" sx={{ ml: 'auto', fontWeight: 700, background: '#fef3c7', color: '#b45309' }} />
                    </Box>
                    {/* Progress bar */}
                    <Box sx={{ mt: 'auto' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#334155' }}>Profile Completeness</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#4f46e5' }}>85%</Typography>
                      </Box>
                      <Box sx={{ height: 8, borderRadius: 4, background: '#f1f5f9', overflow: 'hidden' }}>
                        <Box sx={{ height: '100%', width: '85%', borderRadius: 4, background: 'linear-gradient(90deg, #4f46e5, #14b8a6)', transition: 'width 1.5s ease' }} />
                      </Box>
                    </Box>
                  </Box>
                  {/* Floating badge */}
                  <Box sx={{
                    position: 'absolute', top: -10, right: 0, px: 2, py: 1,
                    borderRadius: '12px', background: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    display: 'flex', alignItems: 'center', gap: 1,
                    animation: 'float 4s ease-in-out infinite',
                  }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#15803d' }}>Live Tracking</Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ===== STATS BAR ===== */}
      <Box sx={{ py: 5, background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center">
            {STATS.map((stat, idx) => (
              <Grid item xs={6} sm={3} key={idx}>
                <Box
                  className="animate-fade-in-up"
                  sx={{
                    textAlign: 'center',
                    animationDelay: `${idx * 100}ms`,
                  }}
                >
                  <Box sx={{ color: '#818cf8', mb: 1, display: 'flex', justifyContent: 'center' }}>
                    {stat.icon}
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', mb: 0.5 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 500 }}>
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ===== FEATURES ===== */}
      <Box sx={{ py: { xs: 8, md: 12 }, background: '#fff' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }} className="animate-fade-in-up">
            <Chip label="Features" sx={{ mb: 2, fontWeight: 600, background: 'rgba(79,70,229,0.08)', color: '#4f46e5' }} />
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a', mb: 2 }}>
              Everything you need,{' '}
              <Box component="span" sx={{ background: 'linear-gradient(135deg, #4f46e5, #14b8a6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                in one place
              </Box>
            </Typography>
            <Typography sx={{ color: '#64748b', maxWidth: 560, mx: 'auto', fontSize: '1.1rem' }}>
              SaralYojna simplifies the entire journey from discovering government schemes to tracking your application.
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {FEATURES.map((feat, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Card
                  className="animate-fade-in-up"
                  elevation={0}
                  sx={{
                    height: '100%',
                    borderRadius: '20px',
                    border: '1px solid #f1f5f9',
                    p: 1,
                    animationDelay: `${idx * 100}ms`,
                    transition: 'all 0.35s ease',
                    cursor: 'default',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 16px 48px rgba(79,70,229,0.08)',
                      borderColor: '#e0e7ff',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: feat.color,
                        mb: 2.5,
                      }}
                    >
                      {feat.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#0f172a' }}>
                      {feat.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.7 }}>
                      {feat.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ===== HOW IT WORKS ===== */}
      <Box sx={{ py: { xs: 8, md: 12 }, background: 'linear-gradient(160deg, #f8fafc, #eef2ff, #f0fdfa)' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }} className="animate-fade-in-up">
            <Chip label="How It Works" sx={{ mb: 2, fontWeight: 600, background: 'rgba(20,184,166,0.08)', color: '#0d9488' }} />
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a', mb: 2 }}>
              Three simple steps
            </Typography>
            <Typography sx={{ color: '#64748b', maxWidth: 480, mx: 'auto', fontSize: '1.1rem' }}>
              Getting started with SaralYojna is quick and easy
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {STEPS.map((step, idx) => (
              <Grid item xs={12} md={4} key={idx}>
                <Box
                  className="animate-fade-in-up"
                  sx={{
                    textAlign: 'center',
                    animationDelay: `${idx * 150}ms`,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '4rem',
                      fontWeight: 900,
                      background: 'linear-gradient(135deg, rgba(79,70,229,0.15), rgba(20,184,166,0.15))',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 2,
                      lineHeight: 1,
                    }}
                  >
                    {step.step}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5, color: '#0f172a' }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#64748b', maxWidth: 320, mx: 'auto', lineHeight: 1.7 }}>
                    {step.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ===== CTA ===== */}
      <Box
        sx={{
          py: { xs: 8, md: 10 },
          background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{
          position: 'absolute', top: -100, right: -100, width: 400, height: 400,
          borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
        }} />
        <Box sx={{
          position: 'absolute', bottom: -80, left: -80, width: 300, height: 300,
          borderRadius: '50%', background: 'rgba(255,255,255,0.04)',
        }} />
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Typography variant="h3" sx={{ fontWeight: 800, color: '#fff', mb: 2, letterSpacing: '-0.02em' }}>
            Ready to find your benefits?
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.15rem', mb: 4, maxWidth: 480, mx: 'auto' }}>
            Join thousands of citizens who have discovered schemes they're eligible for.
          </Typography>
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForward />}
            onClick={() => navigate('/register')}
            id="cta-register-btn"
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '1.1rem',
              px: 5,
              py: 2,
              borderRadius: '14px',
              background: '#fff',
              color: '#4f46e5',
              boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
              '&:hover': {
                background: '#f8fafc',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Create Free Account
          </Button>
        </Container>
      </Box>

      {/* ===== FOOTER ===== */}
      <Box sx={{ py: 5, background: '#0f172a', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={4}>
              <Typography sx={{ fontWeight: 800, fontSize: '1.4rem', background: 'linear-gradient(135deg, #818cf8, #5eead4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                SaralYojna
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8', mt: 1 }}>
                Empowering citizens with unified access to government welfare schemes.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={3} justifyContent={{ xs: 'flex-start', md: 'center' }}>
                <Typography variant="body2" component={Link} to="/login" sx={{ color: '#94a3b8', '&:hover': { color: '#e2e8f0' }, transition: 'color 0.2s' }}>About</Typography>
                <Typography variant="body2" component={Link} to="/login" sx={{ color: '#94a3b8', '&:hover': { color: '#e2e8f0' }, transition: 'color 0.2s' }}>Contact</Typography>
                <Typography variant="body2" component={Link} to="/login" sx={{ color: '#94a3b8', '&:hover': { color: '#e2e8f0' }, transition: 'color 0.2s' }}>Privacy</Typography>
                <Typography variant="body2" component={Link} to="/login" sx={{ color: '#94a3b8', '&:hover': { color: '#e2e8f0' }, transition: 'color 0.2s' }}>Terms</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" sx={{ color: '#64748b', textAlign: { xs: 'left', md: 'right' } }}>
                © {new Date().getFullYear()} SaralYojna. All rights reserved.
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
