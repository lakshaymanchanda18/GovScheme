import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Grid, Card, CardContent, Button, Stepper, Step, StepLabel, TextField, Select, MenuItem, FormControl, InputLabel, Chip, Alert, CircularProgress } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { useI18n } from '../hooks/useI18n';
import { useNavigate } from 'react-router-dom';

interface FormData {
  personalInfo: {
    age: number;
    state: string;
    familySize: number;
    education: string;
    occupation: string;
  };
  financialInfo: {
    income: number;
    assets: number;
  };
  additionalInfo: {
    disability: string;
    veteranStatus: string;
    caste: string;
  };
}

interface EligibilityResult {
  isEligible: boolean;
  confidenceScore: number;
  matchedCriteria: string[];
  unmatchedCriteria: string[];
  recommendedSchemes: Array<{
    id: string;
    name: string;
    matchPercentage: number;
    benefits: string;
    whyRecommended?: string[];
  }>;
  documentSuggestions: string[];
}

const states = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

const educationLevels = [
  'No Formal Education', 'Primary School', 'Secondary School', 'Higher Secondary',
  'Graduate', 'Post Graduate', 'Doctorate', 'Diploma', 'Vocational Training'
];

const occupations = [
  'Student', 'Employed', 'Self Employed', 'Unemployed', 'Retired',
  'Farmer', 'Daily Wage Worker', 'Business Owner', 'Professional'
];

export default function AI_EligibilityChecker() {
  const { user } = useAuth();
  const { api } = useApi();
  const { t, i18n, formatCurrency } = useI18n();
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    personalInfo: {
      age: 0,
      state: '',
      familySize: 1,
      education: '',
      occupation: ''
    },
    financialInfo: {
      income: 0,
      assets: 0
    },
    additionalInfo: {
      disability: 'No',
      veteranStatus: 'No',
      caste: 'General'
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [simulation, setSimulation] = useState<{
    isEligible: boolean;
    confidenceScore: number;
    matchedCriteria: string[];
    unmatchedCriteria: string[];
  } | null>(null);
  const [simulateIncome, setSimulateIncome] = useState<number>(0);
  const [simulateAge, setSimulateAge] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleInputChange = (section: keyof FormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/eligibility/ai-check', {
        ...formData,
        userId: user?.id
      });
      
      setResult(response);
      setSimulation(null);
      setSimulateIncome(formData.financialInfo.income || 0);
      setSimulateAge(formData.personalInfo.age || 0);
      setActiveStep(3); // Go to results step
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check eligibility');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async (schemeId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/eligibility/simulate', {
        schemeId,
        profile: {
          age: simulateAge,
          income: simulateIncome,
          state: formData.personalInfo.state,
          familySize: formData.personalInfo.familySize,
          education: formData.personalInfo.education,
          occupation: formData.personalInfo.occupation,
          disability: formData.additionalInfo.disability,
          veteranStatus: formData.additionalInfo.veteranStatus
        }
      });
      setSimulation(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (schemeId: string) => {
    navigate(`/applications/${schemeId}`);
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('eligibility.personalInfo')}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('auth.age')}
                  type="number"
                  value={formData.personalInfo.age}
                  onChange={(e) => handleInputChange('personalInfo', 'age', parseInt(e.target.value))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>{t('auth.state')}</InputLabel>
                  <Select
                    value={formData.personalInfo.state}
                    label={t('auth.state')}
                    onChange={(e) => handleInputChange('personalInfo', 'state', e.target.value)}
                  >
                    {states.map(state => (
                      <MenuItem key={state} value={state}>{state}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('auth.familySize')}
                  type="number"
                  value={formData.personalInfo.familySize}
                  onChange={(e) => handleInputChange('personalInfo', 'familySize', parseInt(e.target.value))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>{t('auth.education')}</InputLabel>
                  <Select
                    value={formData.personalInfo.education}
                    label={t('auth.education')}
                    onChange={(e) => handleInputChange('personalInfo', 'education', e.target.value)}
                  >
                    {educationLevels.map(level => (
                      <MenuItem key={level} value={level}>{level}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>{t('auth.occupation')}</InputLabel>
                  <Select
                    value={formData.personalInfo.occupation}
                    label={t('auth.occupation')}
                    onChange={(e) => handleInputChange('personalInfo', 'occupation', e.target.value)}
                  >
                    {occupations.map(occ => (
                      <MenuItem key={occ} value={occ}>{occ}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );
      
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('eligibility.financialInfo')}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('auth.income')}
                  type="number"
                  value={formData.financialInfo.income}
                  onChange={(e) => handleInputChange('financialInfo', 'income', parseInt(e.target.value))}
                  InputProps={{
                    startAdornment: <span>₹</span>
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('auth.assets')}
                  type="number"
                  value={formData.financialInfo.assets}
                  onChange={(e) => handleInputChange('financialInfo', 'assets', parseInt(e.target.value))}
                  InputProps={{
                    startAdornment: <span>₹</span>
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        );
      
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('eligibility.additionalInfo')}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>{t('auth.disability')}</InputLabel>
                  <Select
                    value={formData.additionalInfo.disability}
                    label={t('auth.disability')}
                    onChange={(e) => handleInputChange('additionalInfo', 'disability', e.target.value)}
                  >
                    <MenuItem value="No">No</MenuItem>
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="Partial">Partial</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>{t('auth.veteranStatus')}</InputLabel>
                  <Select
                    value={formData.additionalInfo.veteranStatus}
                    label={t('auth.veteranStatus')}
                    onChange={(e) => handleInputChange('additionalInfo', 'veteranStatus', e.target.value)}
                  >
                    <MenuItem value="No">No</MenuItem>
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="Dependent">Dependent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>{t('auth.caste')}</InputLabel>
                  <Select
                    value={formData.additionalInfo.caste}
                    label={t('auth.caste')}
                    onChange={(e) => handleInputChange('additionalInfo', 'caste', e.target.value)}
                  >
                    <MenuItem value="General">General</MenuItem>
                    <MenuItem value="OBC">OBC</MenuItem>
                    <MenuItem value="SC">SC</MenuItem>
                    <MenuItem value="ST">ST</MenuItem>
                    <MenuItem value="EWS">EWS</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );
      
      case 3:
        return result ? (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('eligibility.results')}
            </Typography>
            
            <Alert 
              severity={result.isEligible ? "success" : "warning"} 
              sx={{ mb: 3 }}
            >
              <Typography variant="h6">
                {result.isEligible ? t('eligibility.eligibleSchemes') : t('eligibility.notEligible')}
              </Typography>
              <Typography>
                {t('eligibility.confidenceScore')}: {Math.round(result.confidenceScore * 100)}%
              </Typography>
            </Alert>

            {result.matchedCriteria.length > 0 && (
              <Box mb={3}>
                <Typography variant="subtitle1" gutterBottom>
                  {t('eligibility.matchedCriteria')}
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {result.matchedCriteria.map((criteria, index) => (
                    <Chip key={index} label={criteria} color="success" variant="outlined" />
                  ))}
                </Box>
              </Box>
            )}

            {result.unmatchedCriteria.length > 0 && (
              <Box mb={3}>
                <Typography variant="subtitle1" gutterBottom>
                  {t('eligibility.unmatchedCriteria')}
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {result.unmatchedCriteria.map((criteria, index) => (
                    <Chip key={index} label={criteria} color="error" variant="outlined" />
                  ))}
                </Box>
              </Box>
            )}

            {result.recommendedSchemes.length > 0 && (
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>
                  {t('eligibility.eligibleSchemes')}
                </Typography>
                {result.recommendedSchemes.map((scheme, index) => (
                  <Card key={scheme.id || index} sx={{ mb: 2 }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="h6">{scheme.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Match: {scheme.matchPercentage}%
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {scheme.benefits}
                          </Typography>
                          {scheme.whyRecommended && scheme.whyRecommended.length > 0 && (
                            <Box mt={1}>
                              <Typography variant="caption" color="text.secondary">
                                Why recommended:
                              </Typography>
                              <Box display="flex" flexWrap="wrap" gap={1} mt={0.5}>
                                {scheme.whyRecommended.map((reason, idx) => (
                                  <Chip key={idx} label={reason} size="small" variant="outlined" />
                                ))}
                              </Box>
                            </Box>
                          )}
                        </Box>
                        <Box display="flex" gap={1}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleApply(scheme.id)}
                          >
                            {t('schemes.applyNow')}
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={() => navigate(`/schemes/${scheme.id}`)}
                          >
                            {t('schemes.viewDetails')}
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}

            {result.documentSuggestions.length > 0 && (
              <Box mb={3}>
                <Typography variant="subtitle1" gutterBottom>
                  {t('eligibility.documentsRequired')}
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {result.documentSuggestions.map((doc, index) => (
                    <Chip key={index} label={doc} color="info" variant="outlined" />
                  ))}
                </Box>
              </Box>
            )}

            {result.recommendedSchemes.length > 0 && (
              <Box mb={3}>
                <Typography variant="subtitle1" gutterBottom>
                  What-if simulation (top recommendation)
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Simulated Income"
                      type="number"
                      value={simulateIncome}
                      onChange={(e) => setSimulateIncome(Number(e.target.value))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Simulated Age"
                      type="number"
                      value={simulateAge}
                      onChange={(e) => setSimulateAge(Number(e.target.value))}
                    />
                  </Grid>
                </Grid>
                <Box mt={2}>
                  <Button
                    variant="outlined"
                    onClick={() => handleSimulate(result.recommendedSchemes[0].id)}
                    disabled={loading}
                  >
                    Simulate
                  </Button>
                </Box>
                {simulation && (
                  <Box mt={2}>
                    <Alert severity={simulation.isEligible ? "success" : "warning"}>
                      <Typography variant="body2">
                        Simulated result: {simulation.isEligible ? 'Eligible' : 'Not eligible'} (
                        {Math.round(simulation.confidenceScore * 100)}%)
                      </Typography>
                    </Alert>
                    <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                      {simulation.matchedCriteria.map((c, i) => (
                        <Chip key={`sim-m-${i}`} label={c} color="success" variant="outlined" />
                      ))}
                      {simulation.unmatchedCriteria.map((c, i) => (
                        <Chip key={`sim-u-${i}`} label={c} color="error" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            <Box display="flex" gap={2}>
              <Button variant="outlined" onClick={() => setActiveStep(0)}>
                {t('eligibility.checkAgain')}
              </Button>
              <Button variant="contained" color="primary" onClick={() => navigate('/schemes')}>
                {t('schemes.allSchemes')}
              </Button>
            </Box>
          </Box>
        ) : null;
      
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          {t('eligibility.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {t('eligibility.subtitle')}
        </Typography>

        <Stepper activeStep={activeStep} sx={{ my: 4 }}>
          <Step>
            <StepLabel>{t('eligibility.step1')}</StepLabel>
          </Step>
          <Step>
            <StepLabel>{t('eligibility.step2')}</StepLabel>
          </Step>
          <Step>
            <StepLabel>{t('eligibility.step3')}</StepLabel>
          </Step>
          <Step>
            <StepLabel>{t('eligibility.step4')}</StepLabel>
          </Step>
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Card>
          <CardContent>
            {activeStep === 3 && result ? (
              getStepContent(3)
            ) : (
              <>
                {getStepContent(activeStep)}
                <Box display="flex" justifyContent="space-between" mt={3}>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                  >
                    {t('common.back')}
                  </Button>
                  {activeStep === 2 ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSubmit}
                      disabled={loading}
                      endIcon={loading ? <CircularProgress size={20} /> : null}
                    >
                      {t('common.submit')}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleNext}
                      disabled={activeStep === 3}
                    >
                      {t('common.next')}
                    </Button>
                  )}
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
