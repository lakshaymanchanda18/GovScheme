import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Chip, Button, Grid, Card, CardContent, CardMedia, Link, Breadcrumbs, Link as MuiLink, Alert } from '@mui/material';
import { ArrowBack, CheckCircle, Description, VerifiedUser } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { useI18n } from '../hooks/useI18n';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { SchemeDetailSkeleton } from './common/Skeletons';

const categoryImageMap: Record<string, string> = {
  'Education': '/scheme_edu_1778095383942.png',
  'Agriculture': '/scheme_agri_1778095468610.png',
  'Healthcare': '/scheme_health_1778095507907.png',
  'Default': '/scheme_edu_1778095383942.png'
};

const getSchemeImage = (category: string) => {
  if (!category) return categoryImageMap['Default'];
  if (category.includes('Education')) return categoryImageMap['Education'];
  if (category.includes('Agriculture') || category.includes('Farmer')) return categoryImageMap['Agriculture'];
  if (category.includes('Health')) return categoryImageMap['Healthcare'];
  return categoryImageMap['Default'];
};

export default function SchemeDetails() {
  const { user } = useAuth();
  const { api } = useApi();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { id } = useParams();
  const [scheme, setScheme] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchScheme();
  }, [id]);

  const fetchScheme = async () => {
    try {
      const data = await api.get(`/schemes/${id}`);
      setScheme(data);
    } catch (err: any) {
      setError(err?.error || 'Failed to fetch scheme details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <SchemeDetailSkeleton />
      </Container>
    );
  }

  if (error || !scheme) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="error" sx={{ mb: 3, borderRadius: '6px' }}>
          {error || 'Scheme not found.'}
        </Alert>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBack />} 
          onClick={() => navigate('/schemes')}
          sx={{ borderRadius: '6px' }}
        >
          {t('schemes.backToDirectory', 'Back to Schemes Directory')}
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: '#f8fafc', pb: 8 }}>
      <Box sx={{ background: '#0c2340', color: '#ffffff', py: 4, borderBottom: '4px solid #047857' }}>
        <Container maxWidth="lg">
          <Breadcrumbs sx={{ mb: 2, color: '#94a3b8' }}>
            <MuiLink component={RouterLink} to="/" sx={{ color: '#cbd5e1', textDecoration: 'none', '&:hover': { color: '#fff' } }}>
              {t('navigation.home', 'Home')}
            </MuiLink>
            <MuiLink component={RouterLink} to="/schemes" sx={{ color: '#cbd5e1', textDecoration: 'none', '&:hover': { color: '#fff' } }}>
              {t('navigation.schemes', 'Schemes')}
            </MuiLink>
            <Typography sx={{ color: '#ffffff', fontWeight: 600 }}>{scheme.name}</Typography>
          </Breadcrumbs>

          <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
            <Chip 
              label={scheme.category} 
              size="small" 
              sx={{ background: '#047857', color: '#ffffff', fontWeight: 700, borderRadius: '4px' }} 
            />
            <Chip 
              label={scheme.department} 
              size="small" 
              sx={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', borderRadius: '4px' }} 
            />
            {scheme.stateSpecific && (
              <Chip 
                label={scheme.stateSpecific} 
                size="small" 
                sx={{ background: '#e0f2fe', color: '#0369a1', fontWeight: 600, borderRadius: '4px' }} 
              />
            )}
          </Box>

          <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: '-0.02em', mb: 1 }}>
            {scheme.name}
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Card elevation={0} sx={{ borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', overflow: 'hidden', mb: 3 }}>
              <CardMedia
                component="img"
                height="280"
                image={getSchemeImage(scheme.category)}
                alt={scheme.name}
                sx={{ opacity: 0.9 }}
              />
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight="700" color="#0c2340" sx={{ mb: 1.5 }}>
                  {t('schemes.schemeDescription', 'Scheme Description')}
                </Typography>
                <Typography variant="body1" color="#334155" sx={{ mb: 4, lineHeight: 1.7 }}>
                  {scheme.description}
                </Typography>

                <Typography variant="h6" fontWeight="700" color="#0c2340" sx={{ mb: 1.5 }}>
                  {t('schemes.keyBenefits', 'Key Benefits & Provisions')}
                </Typography>
                <Typography variant="body1" color="#334155" sx={{ mb: 4, lineHeight: 1.7, background: '#f8fafc', p: 2.5, borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  {scheme.benefits || 'No specific benefits tabulated. Refer to official guidelines.'}
                </Typography>

                <Typography variant="h6" fontWeight="700" color="#0c2340" sx={{ mb: 1.5 }}>
                  {t('schemes.eligibilityGuidelines', 'Eligibility Guidelines')}
                </Typography>
                <Typography variant="body1" color="#334155" sx={{ mb: 4, lineHeight: 1.7 }}>
                  {scheme.eligibilityCriteria || 'General citizen eligibility applies. Verify department conditions.'}
                </Typography>

                <Typography variant="h6" fontWeight="700" color="#0c2340" sx={{ mb: 1.5 }}>
                  {t('schemes.applicationProcedure', 'Application Procedure')}
                </Typography>
                <Typography variant="body1" color="#334155" sx={{ mb: 4, lineHeight: 1.7 }}>
                  {scheme.applicationProcess || 'Applications are processed online through the respective nodal ministry portal.'}
                </Typography>

                <Typography variant="h6" fontWeight="700" color="#0c2340" sx={{ mb: 1.5 }}>
                  {t('schemes.requiredDocuments', 'Required Documents')}
                </Typography>
                <Typography variant="body1" color="#334155" sx={{ mb: 4, lineHeight: 1.7, background: '#f8fafc', p: 2.5, borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  {scheme.requiredDocuments || 'Aadhaar Card, active bank account details, proof of residence, and category certificate.'}
                </Typography>

                <Box display="flex" gap={2} pt={2} sx={{ borderTop: '1px solid #e2e8f0' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate(`/applications/${scheme.id}`)}
                    sx={{
                      borderRadius: '6px',
                      px: 4,
                      py: 1.5,
                      background: '#0c2340',
                      color: '#ffffff',
                      fontWeight: 700,
                      '&:hover': { background: '#102a43' }
                    }}
                  >
                    {t('schemes.applyForScheme', 'Apply for Scheme')}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<VerifiedUser />}
                    onClick={() => navigate('/eligibility')}
                    sx={{
                      borderRadius: '6px',
                      px: 3,
                      py: 1.5,
                      borderColor: '#cbd5e1',
                      color: '#0c2340',
                      fontWeight: 600,
                      '&:hover': { borderColor: '#0c2340', background: '#f8fafc' }
                    }}
                  >
                    {t('schemes.eligibilityCheck', 'Check Eligibility')}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', position: 'sticky', top: 90 }}>
              <CardContent sx={{ p: 3.5 }}>
                <Typography variant="h6" fontWeight="700" color="#0c2340" sx={{ mb: 3 }}>
                  {t('schemes.criteriaSummary', 'Scheme Criteria Summary')}
                </Typography>

                <Box display="flex" justifyContent="space-between" mb={2} alignItems="center">
                  <Typography variant="body2" color="text.secondary" fontWeight="600">
                    {t('schemes.incomeLimit', 'Income Limit')}:
                  </Typography>
                  <Typography variant="body2" fontWeight="700" color="#0f172a">
                    {scheme.incomeLimit ? `₹${Number(scheme.incomeLimit).toLocaleString('en-IN')}` : t('schemes.notRestricted', 'Not restricted')}
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" mb={2} alignItems="center">
                  <Typography variant="body2" color="text.secondary" fontWeight="600">
                    {t('schemes.ageLimit', 'Age Limit')}:
                  </Typography>
                  <Typography variant="body2" fontWeight="700" color="#0f172a">
                    {scheme.ageLimit || t('schemes.allAges', 'All ages')}
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" mb={2} alignItems="center">
                  <Typography variant="body2" color="text.secondary" fontWeight="600">
                    {t('schemes.familySize', 'Family Size')}:
                  </Typography>
                  <Typography variant="body2" fontWeight="700" color="#0f172a">
                    {scheme.familySizeLimit || t('schemes.notRestricted', 'Not restricted')}
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" mb={2} alignItems="center">
                  <Typography variant="body2" color="text.secondary" fontWeight="600">
                    {t('schemes.stateJurisdiction', 'State Jurisdiction')}:
                  </Typography>
                  <Typography variant="body2" fontWeight="700" color="#0f172a">
                    {scheme.stateSpecific || t('schemes.panIndia', 'Pan-India')}
                  </Typography>
                </Box>

                {scheme.sourceUrl && (
                  <Box mt={3} p={2} sx={{ background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="600" display="block" mb={0.5}>
                      {t('schemes.officialPortal', 'Official Portal')}:
                    </Typography>
                    <Link 
                      href={scheme.sourceUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      sx={{ fontWeight: 700, color: '#0c2340', fontSize: '0.85rem', wordBreak: 'break-all' }}
                    >
                      {scheme.sourceUrl}
                    </Link>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
