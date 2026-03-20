import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Chip, Button, Grid, Card, CardContent, CardMedia } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { useI18n } from '../hooks/useI18n';
import { useNavigate, useParams } from 'react-router-dom';

export default function SchemeDetails() {
  const { user, loading: authLoading } = useAuth();
  const { api } = useApi();
  const { t, i18n } = useI18n();
  const navigate = useNavigate();
  const { id } = useParams();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchScheme();
  }, [id]);

  const fetchScheme = async () => {
    try {
      const data = await api.get(`/schemes/${id}`);
      setScheme(data);
    } catch (err) {
      setError(err.error || 'Failed to fetch scheme');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          {scheme.name}
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardMedia
                component="img"
                height="300"
                image="https://via.placeholder.com/800x300"
                alt={scheme.name}
              />
              <CardContent>
                <Typography variant="body1" gutterBottom>
                  {scheme.description}
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                  <Chip label={scheme.category} size="small" color="primary" />
                  <Chip label={scheme.department} size="small" color="secondary" />
                  {scheme.stateSpecific && <Chip label={scheme.stateSpecific} size="small" color="info" />}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {t('eligibility')}:
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {scheme.eligibilityCriteria}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {t('benefits')}:
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {scheme.benefits}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {t('applicationProcess')}:
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {scheme.applicationProcess}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {t('requiredDocuments')}:
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {scheme.requiredDocuments}
                </Typography>
                <Box display="flex" gap={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(`/applications/${scheme.id}`)}
                  >
                    {t('apply')}
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => navigate('/eligibility')}
                  >
                    {t('checkEligibility')}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('schemeInfo')}
                </Typography>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    {t('incomeLimit')}:
                  </Typography>
                  <Typography variant="body2">
                    {scheme.incomeLimit ? `₹${scheme.incomeLimit}` : 'Not specified'}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    {t('ageLimit')}:
                  </Typography>
                  <Typography variant="body2">
                    {scheme.ageLimit || 'Not specified'}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    {t('familySizeLimit')}:
                  </Typography>
                  <Typography variant="body2">
                    {scheme.familySizeLimit || 'Not specified'}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    {t('educationCriteria')}:
                  </Typography>
                  <Typography variant="body2">
                    {scheme.educationCriteria || 'Not specified'}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    {t('occupationCriteria')}:
                  </Typography>
                  <Typography variant="body2">
                    {scheme.occupationCriteria || 'Not specified'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}