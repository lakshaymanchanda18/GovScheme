import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Grid, Card, CardContent, Chip, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { useI18n } from '../hooks/useI18n';
import { useNavigate } from 'react-router-dom';

export default function EligibilityCheck() {
  const { user, loading: authLoading } = useAuth();
  const { api } = useApi();
  const { t, i18n } = useI18n();
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      const data = await api.get('/schemes');
      setSchemes(data);
    } catch (err) {
      setError(err.error || 'Failed to fetch schemes');
    }
  };

  const checkEligibility = async () => {
    if (!selectedScheme) {
      setError('Please select a scheme');
      return;
    }

    try {
      setLoading(true);
      const result = await api.post('/eligibility/check', { schemeId: selectedScheme });
      setResult(result);
    } catch (err) {
      setError(err.error || 'Failed to check eligibility');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (result) {
      navigate(`/applications/${result.schemeId}`);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          {t('eligibility')}
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('selectScheme')}
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>{t('scheme')}</InputLabel>
                  <Select
                    value={selectedScheme || ''}
                    label={t('scheme')}
                    onChange={(e) => setSelectedScheme(e.target.value)}
                  >
                    <MenuItem value="">
                      <em>{t('selectScheme')}</em>
                    </MenuItem>
                    {schemes.map((scheme: any) => (
                      <MenuItem key={scheme.id} value={scheme.id}>
                        {scheme.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Box mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={checkEligibility}
                    disabled={!selectedScheme}
                  >
                    {t('checkEligibility')}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          {result && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('eligibilityResult')}
                  </Typography>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      {t('status')}:
                    </Typography>
                    <Typography variant="body2" color={result.isEligible ? 'success' : 'error'}>
                      {result.isEligible ? 'Eligible' : 'Not Eligible'}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      {t('confidence')}:
                    </Typography>
                    <Typography variant="body2">
                      {Math.round(result.confidenceScore * 100)}%
                    </Typography>
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {t('matchedCriteria')}:
                  </Typography>
                  <Box mb={2}>
                    {result.matchedCriteria.map((criteria: string) => (
                      <Chip key={criteria} label={criteria} size="small" color="success" />
                    ))}
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {t('unmatchedCriteria')}:
                  </Typography>
                  <Box mb={2}>
                    {result.unmatchedCriteria.map((criteria: string) => (
                      <Chip key={criteria} label={criteria} size="small" color="error" />
                    ))}
                  </Box>
                  <Box display="flex" gap={2}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleApply}
                      disabled={!result.isEligible}
                    >
                      {t('apply')}
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => setResult(null)}
                    >
                      {t('checkAnother')}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>
    </Container>
  );
}