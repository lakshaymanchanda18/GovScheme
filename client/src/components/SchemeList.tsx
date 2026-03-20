import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, CardMedia, Typography, Box, Chip, Button, Alert } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { useI18n } from '../hooks/useI18n';
import { useNavigate } from 'react-router-dom';

interface Scheme {
  id: string;
  name: string;
  description: string;
  category: string;
  department: string;
}

export default function SchemeList() {
  const { user, loading: authLoading } = useAuth();
  const { api } = useApi();
  const { t, i18n } = useI18n();
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);

  useEffect(() => {
    checkHealth();
    fetchSchemes();
  }, []);

  const checkHealth = async () => {
    try {
      await api.get('/health');
      setHealthError(null);
    } catch (err: any) {
      const message = err?.error || 'Backend health check failed';
      setHealthError(message);
    }
  };

  const fetchSchemes = async () => {
    try {
      const data = await api.get('/schemes');
      setSchemes(data);
      setError(null);
    } catch (err) {
      const message = (err as any)?.error || (err instanceof Error ? err.message : 'Failed to fetch schemes');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (schemeId: string) => {
    navigate(`/applications/${schemeId}`);
  };

  const handleCheckEligibility = async (schemeId: string) => {
    try {
      const result = await api.post('/eligibility/check', { schemeId });
      if (result.isEligible) {
        handleApply(schemeId);
      } else {
        alert(`Eligibility check: ${result.isEligible ? 'Eligible' : 'Not Eligible'}\nConfidence: ${result.confidenceScore * 100}%`);
      }
    } catch (error) {
      alert('Failed to check eligibility');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return (
    <Container maxWidth="md">
      <Box py={4}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Error: {error}
        </Alert>
        <Button variant="contained" onClick={() => { setLoading(true); fetchSchemes(); }}>
          Retry
        </Button>
      </Box>
    </Container>
  );

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        {healthError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {healthError}. Some features may be unavailable.
          </Alert>
        )}
        <Typography variant="h4" gutterBottom>
          {t('schemes.title')}
        </Typography>
        
        {schemes.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary">
              {t('schemes.noSchemes')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t('schemes.noSchemesDescription')}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {schemes.map((scheme: any) => (
              <Grid item xs={12} sm={6} md={4} key={scheme.id}>
                <Card>
                  <CardMedia
                    component="img"
                    height="200"
                    image="https://via.placeholder.com/400x200"
                    alt={scheme.name}
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {scheme.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {scheme.description.substring(0, 100)}...
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                      <Chip label={scheme.category} size="small" color="primary" />
                      <Chip label={scheme.department} size="small" color="secondary" />
                    </Box>
                    <Box display="flex" justifyContent="space-between" mt={2}>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/schemes/${scheme.id}`)}
                      >
                        {t('schemes.viewDetails')}
                      </Button>
                      <Button
                        size="small"
                        color="secondary"
                        onClick={() => handleCheckEligibility(scheme.id)}
                      >
                        {t('schemes.eligibilityCheck')}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
}
