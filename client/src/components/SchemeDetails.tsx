import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Chip, Button, Grid, Card, CardContent, CardMedia, Link } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { useI18n } from '../hooks/useI18n';
import { useNavigate, useParams } from 'react-router-dom';

const categoryImageMap: Record<string, string> = {
  'Education': '/scheme_edu_1778095383942.png',
  'Agriculture': '/scheme_agri_1778095468610.png',
  'Healthcare': '/scheme_health_1778095507907.png',
  'Default': 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1200&auto=format&fit=crop'
};

const getSchemeImage = (category: string) => {
  if (!category) return categoryImageMap['Default'];
  if (category.includes('Education')) return categoryImageMap['Education'];
  if (category.includes('Agriculture') || category.includes('Farmer')) return categoryImageMap['Agriculture'];
  if (category.includes('Health')) return categoryImageMap['Healthcare'];
  return categoryImageMap['Default'];
};

export default function SchemeDetails() {
  const { user, loading: authLoading } = useAuth();
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
      setError(err.error || 'Failed to fetch scheme');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!scheme) return <div>Scheme not found</div>;

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', fontFamily: "'Outfit', sans-serif" }}>
          {scheme.name}
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
              <CardMedia
                component="img"
                height="400"
                image={getSchemeImage(scheme.category)}
                alt={scheme.name}
              />
              <CardContent sx={{ p: 4 }}>
                <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem', lineHeight: 1.6, color: 'text.secondary' }}>
                  {scheme.description}
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1} mb={4}>
                  <Chip label={scheme.category} size="medium" sx={{ background: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5', fontWeight: 'bold' }} />
                  <Chip label={scheme.department} size="medium" variant="outlined" />
                  {scheme.stateSpecific && <Chip label={scheme.stateSpecific} size="medium" color="info" />}
                </Box>
                
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  {t('schemes.eligibilityCheck', 'Eligibility')}:
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  {scheme.eligibilityCriteria}
                </Typography>
                
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  {t('common.benefits', 'Benefits')}:
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  {scheme.benefits}
                </Typography>
                
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  {t('common.process', 'Application Process')}:
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  {scheme.applicationProcess}
                </Typography>
                
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  {t('common.documents', 'Required Documents')}:
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  {scheme.requiredDocuments}
                </Typography>
                
                <Box display="flex" gap={2} mt={4}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={() => navigate(`/applications/${scheme.id}`)}
                    sx={{ borderRadius: '12px', px: 4, py: 1.5, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                  >
                    {t('schemes.applyNow', 'Apply Now')}
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="large"
                    onClick={() => navigate('/eligibility')}
                    sx={{ borderRadius: '12px', px: 4, py: 1.5, borderWidth: '2px', '&:hover': { borderWidth: '2px' } }}
                  >
                    {t('schemes.eligibilityCheck', 'Check Eligibility')}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', position: 'sticky', top: 100 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom fontWeight="bold" fontFamily="'Outfit', sans-serif" mb={3}>
                  Scheme Information
                </Typography>
                
                <Box display="flex" justifyContent="space-between" mb={2} alignItems="center">
                  <Typography variant="body2" color="text.secondary" fontWeight="bold">
                    {t('schemes.incomeLimit', 'Income Limit')}:
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {scheme.incomeLimit ? `₹${scheme.incomeLimit}` : 'Not specified'}
                  </Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between" mb={2} alignItems="center">
                  <Typography variant="body2" color="text.secondary" fontWeight="bold">
                    {t('schemes.ageLimit', 'Age Limit')}:
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {scheme.ageLimit || 'Not specified'}
                  </Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between" mb={2} alignItems="center">
                  <Typography variant="body2" color="text.secondary" fontWeight="bold">
                    {t('schemes.familySizeLimit', 'Family Size Limit')}:
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {scheme.familySizeLimit || 'Not specified'}
                  </Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between" mb={2} alignItems="center">
                  <Typography variant="body2" color="text.secondary" fontWeight="bold">
                    Education Criteria:
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {scheme.educationCriteria || 'Not specified'}
                  </Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between" mb={3} alignItems="center">
                  <Typography variant="body2" color="text.secondary" fontWeight="bold">
                    Occupation Criteria:
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {scheme.occupationCriteria || 'Not specified'}
                  </Typography>
                </Box>
                
                {scheme.sourceUrl && (
                  <Box p={2} sx={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Source Reference:
                    </Typography>
                    <Link href={scheme.sourceUrl} target="_blank" rel="noreferrer" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      Official Government Portal
                    </Link>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
