import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Container, Grid, Card, CardContent,
  IconButton, Chip, Stack, Drawer, List, ListItem, ListItemText,
  ListItemIcon, Divider, useMediaQuery, useTheme
} from '@mui/material';
import {
  Search, Assignment, VerifiedUser, Translate, Security,
  ArrowForward, Menu as MenuIcon, Close as CloseIcon,
  School, HealthAndSafety, NaturePeople, AccountBalance,
  HomeWork, WorkOutline, CheckCircle
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { LanguageSwitcher } from './LanguageSwitcher';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const CATEGORIES = [
    {
      name: 'Agriculture & Farmers',
      description: 'Income support, crop insurance, irrigation, and agricultural credit schemes.',
      icon: <NaturePeople sx={{ fontSize: 28, color: '#047857' }} />,
      category: 'Agriculture',
    },
    {
      name: 'Health & Medical Care',
      description: 'Comprehensive health coverage, diagnostic support, and maternity assistance.',
      icon: <HealthAndSafety sx={{ fontSize: 28, color: '#0284c7' }} />,
      category: 'Healthcare',
    },
    {
      name: 'Education & Scholarships',
      description: 'Pre-matric and post-matric scholarships, skill training, and higher education fellowships.',
      icon: <School sx={{ fontSize: 28, color: '#b45309' }} />,
      category: 'Education',
    },
    {
      name: 'Financial Inclusion & Credit',
      description: 'Micro-loans, zero-balance banking, subsidized insurance, and pension accounts.',
      icon: <AccountBalance sx={{ fontSize: 28, color: '#0c2340' }} />,
      category: 'Financial Inclusion',
    },
    {
      name: 'Housing & Rural Amenities',
      description: 'Affordable pucca housing grants, clean tap water connections, and sanitation facilities.',
      icon: <HomeWork sx={{ fontSize: 28, color: '#475569' }} />,
      category: 'Housing',
    },
    {
      name: 'Employment & Livelihood',
      description: 'Guaranteed rural wage employment, self-help groups, and startup incubation grants.',
      icon: <WorkOutline sx={{ fontSize: 28, color: '#0f766e' }} />,
      category: 'Employment',
    },
  ];

  const STEPS = [
    {
      num: '01',
      title: 'Find Schemes',
      description: 'Browse central and state initiatives organized by your occupation, age, and state.',
    },
    {
      num: '02',
      title: 'Check Eligibility',
      description: 'Review transparent criteria including income limits, required documents, and family quotas.',
    },
    {
      num: '03',
      title: 'Apply Directly',
      description: 'Access official nodal portals with step-by-step guidance and document checklists.',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a' }}>
      {/* ===== TOP OFFICIAL ANNOUNCEMENT BAR ===== */}
      <Box sx={{ background: '#081726', color: '#94a3b8', py: 0.75, px: 2, fontSize: '0.78rem', textAlign: 'center', borderBottom: '1px solid #1e293b' }}>
        <Container maxWidth="lg">
          <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 500 }}>
            Official Citizen Facilitation Portal for Central & State Welfare Schemes · Free Public Access
          </Typography>
        </Container>
      </Box>

      {/* ===== RESPONSIVE NAVBAR ===== */}
      <Box
        component="nav"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          py: 1.5,
          px: { xs: 2, md: 4 },
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: { xs: 0, md: 2 } }}>
          {/* Brand Logo */}
          <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none' }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '6px',
                background: '#0c2340',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '1rem',
              }}
            >
              SY
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: '#0c2340',
                letterSpacing: '-0.02em',
                fontSize: { xs: '1.15rem', md: '1.35rem' },
              }}
            >
              SaralYojna
            </Typography>
          </Box>

          {/* Desktop Navigation Links */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Button
              component={Link}
              to="/schemes"
              sx={{ color: '#334155', textTransform: 'none', fontWeight: 500, px: 1.5, '&:hover': { color: '#0c2340', background: '#f1f5f9' } }}
            >
              All Schemes
            </Button>
            <Button
              component={Link}
              to="/eligibility"
              sx={{ color: '#334155', textTransform: 'none', fontWeight: 500, px: 1.5, '&:hover': { color: '#0c2340', background: '#f1f5f9' } }}
            >
              Check Eligibility
            </Button>
            <Button
              component={Link}
              to="/chatbot"
              sx={{ color: '#334155', textTransform: 'none', fontWeight: 500, px: 1.5, '&:hover': { color: '#0c2340', background: '#f1f5f9' } }}
            >
              Scheme Assistant
            </Button>
          </Stack>

          {/* Right Action Stack */}
          <Stack direction="row" spacing={1} alignItems="center">
            <LanguageSwitcher />

            {/* Desktop Auth Buttons */}
            {user ? (
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                <Button
                  component={Link}
                  to="/dashboard"
                  variant="contained"
                  size="small"
                  sx={{ textTransform: 'none', background: '#0c2340', color: '#fff', borderRadius: '6px', px: 2 }}
                >
                  Dashboard
                </Button>
                <Button
                  onClick={() => { logout(); navigate('/'); }}
                  variant="outlined"
                  size="small"
                  sx={{ textTransform: 'none', color: '#dc2626', borderColor: '#fca5a5', borderRadius: '6px' }}
                >
                  Logout
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                <Button
                  component={Link}
                  to="/login"
                  size="small"
                  sx={{ textTransform: 'none', color: '#0c2340', fontWeight: 600, px: 2 }}
                >
                  Sign In
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  size="small"
                  sx={{
                    textTransform: 'none',
                    background: '#0c2340',
                    color: '#ffffff',
                    fontWeight: 600,
                    borderRadius: '6px',
                    px: 2.2,
                    '&:hover': { background: '#102a43' },
                  }}
                >
                  Create Account
                </Button>
              </Box>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <IconButton
              onClick={() => setMobileMenuOpen(true)}
              sx={{ display: { xs: 'inline-flex', md: 'none' }, color: '#0c2340', p: 0.75 }}
              aria-label="Open navigation menu"
            >
              <MenuIcon />
            </IconButton>
          </Stack>
        </Container>
      </Box>

      {/* ===== MOBILE NAVIGATION DRAWER ===== */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: { width: 280, p: 2, background: '#ffffff', display: 'flex', flexDirection: 'column' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 2, borderBottom: '1px solid #e2e8f0' }}>
          <Typography variant="h6" fontWeight="800" color="#0c2340">
            SaralYojna
          </Typography>
          <IconButton onClick={() => setMobileMenuOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <List sx={{ pt: 2, flexGrow: 1 }}>
          <ListItem button component={Link} to="/schemes" onClick={() => setMobileMenuOpen(false)} sx={{ borderRadius: '6px', mb: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 36, color: '#0c2340' }}><Search fontSize="small" /></ListItemIcon>
            <ListItemText primary="All Schemes" primaryTypographyProps={{ fontWeight: 600, color: '#0c2340' }} />
          </ListItem>
          <ListItem button component={Link} to="/eligibility" onClick={() => setMobileMenuOpen(false)} sx={{ borderRadius: '6px', mb: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 36, color: '#047857' }}><VerifiedUser fontSize="small" /></ListItemIcon>
            <ListItemText primary="Check Eligibility" primaryTypographyProps={{ fontWeight: 600, color: '#0c2340' }} />
          </ListItem>
          <ListItem button component={Link} to="/chatbot" onClick={() => setMobileMenuOpen(false)} sx={{ borderRadius: '6px', mb: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 36, color: '#0284c7' }}><Assignment fontSize="small" /></ListItemIcon>
            <ListItemText primary="Scheme Assistant" primaryTypographyProps={{ fontWeight: 600, color: '#0c2340' }} />
          </ListItem>
          
          <Divider sx={{ my: 2 }} />

          <ListItem button component={Link} to="/privacy" onClick={() => setMobileMenuOpen(false)} sx={{ borderRadius: '6px' }}>
            <ListItemText primary="Privacy Policy" primaryTypographyProps={{ fontSize: '0.9rem', color: '#475569' }} />
          </ListItem>
          <ListItem button component={Link} to="/terms" onClick={() => setMobileMenuOpen(false)} sx={{ borderRadius: '6px' }}>
            <ListItemText primary="Terms of Service" primaryTypographyProps={{ fontSize: '0.9rem', color: '#475569' }} />
          </ListItem>
        </List>

        <Box sx={{ pt: 2, borderTop: '1px solid #e2e8f0' }}>
          {user ? (
            <Stack spacing={1}>
              <Button
                component={Link}
                to="/dashboard"
                fullWidth
                variant="contained"
                onClick={() => setMobileMenuOpen(false)}
                sx={{ textTransform: 'none', background: '#0c2340', borderRadius: '6px' }}
              >
                Go to Dashboard
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => { logout(); setMobileMenuOpen(false); navigate('/'); }}
                sx={{ textTransform: 'none', color: '#dc2626', borderColor: '#fca5a5', borderRadius: '6px' }}
              >
                Logout
              </Button>
            </Stack>
          ) : (
            <Stack spacing={1.5}>
              <Button
                component={Link}
                to="/login"
                fullWidth
                variant="outlined"
                onClick={() => setMobileMenuOpen(false)}
                sx={{ textTransform: 'none', color: '#0c2340', borderColor: '#cbd5e1', borderRadius: '6px' }}
              >
                Sign In
              </Button>
              <Button
                component={Link}
                to="/register"
                fullWidth
                variant="contained"
                onClick={() => setMobileMenuOpen(false)}
                sx={{ textTransform: 'none', background: '#0c2340', color: '#ffffff', borderRadius: '6px' }}
              >
                Create Account
              </Button>
            </Stack>
          )}
        </Box>
      </Drawer>

      {/* ===== HERO SECTION ===== */}
      <Box sx={{ pt: { xs: 5, md: 8 }, pb: { xs: 6, md: 10 }, background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Chip
                label="National Citizen Facilitation Portal"
                size="small"
                sx={{
                  mb: 2.5,
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  background: '#f1f5f9',
                  color: '#0c2340',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1',
                  px: 0.5,
                }}
              />
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '2.1rem', sm: '2.8rem', md: '3.4rem' },
                  lineHeight: 1.15,
                  letterSpacing: '-0.03em',
                  mb: 2.5,
                  color: '#0c2340',
                }}
              >
                Find Government Schemes You Are Eligible For
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#475569',
                  fontSize: { xs: '1rem', md: '1.15rem' },
                  lineHeight: 1.7,
                  maxWidth: 580,
                  mb: 4,
                }}
              >
                Search official central and state initiatives, verify qualification criteria transparently, and follow clear step-by-step application instructions.
              </Typography>

              {/* Action Buttons - Stacked on mobile, side-by-side on desktop */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  component={Link}
                  to="/schemes"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '1rem',
                    borderRadius: '6px',
                    px: 3.5,
                    py: 1.5,
                    background: '#0c2340',
                    color: '#ffffff',
                    '&:hover': { background: '#102a43' },
                  }}
                >
                  Explore All Schemes
                </Button>
                <Button
                  component={Link}
                  to={user ? '/eligibility' : '/login'}
                  variant="outlined"
                  size="large"
                  startIcon={<VerifiedUser />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    borderRadius: '6px',
                    px: 3.5,
                    py: 1.5,
                    borderColor: '#cbd5e1',
                    color: '#0c2340',
                    '&:hover': { borderColor: '#0c2340', background: '#f8fafc' },
                  }}
                >
                  Check Your Eligibility
                </Button>
              </Stack>
            </Grid>

            {/* Right Column: Verified Spotlight Card */}
            <Grid item xs={12} md={5}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  boxShadow: '0 4px 16px rgba(12, 35, 64, 0.08)',
                  background: '#ffffff',
                  p: 3,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Chip
                    label="Official Welfare Scheme"
                    size="small"
                    sx={{ borderRadius: '4px', background: '#dcfce7', color: '#15803d', fontWeight: 700, fontSize: '0.75rem' }}
                  />
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                    Ministry of Agriculture
                  </Typography>
                </Box>

                <Typography variant="h6" fontWeight="700" color="#0c2340" sx={{ mb: 1, lineHeight: 1.3 }}>
                  PM Kisan Samman Nidhi
                </Typography>
                <Typography variant="body2" color="#475569" sx={{ mb: 2.5, lineHeight: 1.6 }}>
                  Direct income support of ₹6,000 per year in three equal installments to eligible small and marginal farmer families nationwide.
                </Typography>

                <Box sx={{ background: '#f8fafc', p: 2, borderRadius: '6px', border: '1px solid #e2e8f0', mb: 2.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0c2340', display: 'block', mb: 1 }}>
                    Key Eligibility Guidelines:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <CheckCircle sx={{ fontSize: 16, color: '#047857' }} />
                    <Typography variant="caption" color="#334155">Cultivable landholding in applicant or family name</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle sx={{ fontSize: 16, color: '#047857' }} />
                    <Typography variant="caption" color="#334155">Aadhaar-seeded active bank account</Typography>
                  </Box>
                </Box>

                <Button
                  component={Link}
                  to="/schemes"
                  fullWidth
                  variant="outlined"
                  size="small"
                  sx={{ textTransform: 'none', color: '#0c2340', borderColor: '#cbd5e1', borderRadius: '6px' }}
                >
                  View Scheme Guidelines & Details
                </Button>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ===== FUNCTIONAL SCHEME CATEGORIES (REPLACES FAKE COUNTERS) ===== */}
      <Box sx={{ py: { xs: 6, md: 8 }, background: '#f8fafc' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography variant="h4" fontWeight="800" color="#0c2340" sx={{ mb: 1, letterSpacing: '-0.02em' }}>
              Welfare Categories
            </Typography>
            <Typography variant="body1" color="#64748b" sx={{ maxWidth: 540, mx: 'auto' }}>
              Explore schemes curated by welfare sector to find benefits matching your circumstances.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {CATEGORIES.map((cat, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Card
                  elevation={0}
                  component={Link}
                  to={`/schemes?category=${encodeURIComponent(cat.category)}`}
                  sx={{
                    height: '100%',
                    p: 2.5,
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#0c2340',
                      boxShadow: '0 4px 12px rgba(12, 35, 64, 0.08)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ p: 1, borderRadius: '6px', background: '#f1f5f9' }}>
                      {cat.icon}
                    </Box>
                    <Typography variant="subtitle1" fontWeight="700" color="#0c2340">
                      {cat.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="#64748b" sx={{ lineHeight: 1.6, flexGrow: 1 }}>
                    {cat.description}
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 0.5, color: '#0c2340', fontWeight: 600, fontSize: '0.85rem' }}>
                    Browse category <ArrowForward sx={{ fontSize: 14 }} />
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ===== HOW IT WORKS (AUTHENTIC CIVIC STEPS) ===== */}
      <Box sx={{ py: { xs: 6, md: 8 }, background: '#ffffff', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h4" fontWeight="800" color="#0c2340" sx={{ mb: 1, letterSpacing: '-0.02em' }}>
              How to Access Benefits
            </Typography>
            <Typography variant="body1" color="#64748b">
              Follow these three straightforward steps to navigate welfare initiatives.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {STEPS.map((step, idx) => (
              <Grid item xs={12} md={4} key={idx}>
                <Box sx={{ p: 3, borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', height: '100%' }}>
                  <Typography variant="h4" fontWeight="800" color="#047857" sx={{ mb: 1.5 }}>
                    {step.num}
                  </Typography>
                  <Typography variant="h6" fontWeight="700" color="#0c2340" sx={{ mb: 1 }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="#475569" sx={{ lineHeight: 1.6 }}>
                    {step.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ===== FOOTER ===== */}
      <Box component="footer" sx={{ py: 6, background: '#081726', color: '#cbd5e1' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} md={5}>
              <Typography variant="h6" fontWeight="800" color="#ffffff" sx={{ mb: 1 }}>
                SaralYojna
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.7, maxWidth: 420 }}>
                An independent citizen facilitation portal providing structured discovery, qualification checks, and guidelines for Indian central and state welfare initiatives.
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="subtitle2" fontWeight="700" color="#ffffff" sx={{ mb: 2 }}>
                Quick Links
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" component={Link} to="/schemes" sx={{ color: '#94a3b8', textDecoration: 'none', '&:hover': { color: '#fff' } }}>All Schemes Directory</Typography>
                <Typography variant="body2" component={Link} to="/eligibility" sx={{ color: '#94a3b8', textDecoration: 'none', '&:hover': { color: '#fff' } }}>Eligibility Evaluation</Typography>
                <Typography variant="body2" component={Link} to="/chatbot" sx={{ color: '#94a3b8', textDecoration: 'none', '&:hover': { color: '#fff' } }}>Scheme Guidance Assistant</Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} md={4}>
              <Typography variant="subtitle2" fontWeight="700" color="#ffffff" sx={{ mb: 2 }}>
                Legal & Governance
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" component={Link} to="/privacy" sx={{ color: '#94a3b8', textDecoration: 'none', '&:hover': { color: '#fff' } }}>Privacy Policy</Typography>
                <Typography variant="body2" component={Link} to="/terms" sx={{ color: '#94a3b8', textDecoration: 'none', '&:hover': { color: '#fff' } }}>Terms of Service</Typography>
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ borderColor: '#1e293b', mb: 3 }} />

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              © {new Date().getFullYear()} SaralYojna. All public rights reserved.
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', textAlign: { xs: 'center', sm: 'right' } }}>
              Not affiliated with any political party. Scheme details sourced from official gazette notifications.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
