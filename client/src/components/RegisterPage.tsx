import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Container, InputAdornment,
  IconButton, Alert, Divider, CircularProgress, Grid, Stepper,
  Step, StepLabel, MenuItem
} from '@mui/material';
import {
  Visibility, VisibilityOff, Email, Lock, Person,
  Phone, ArrowBack, ArrowForward
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { LanguageSwitcher } from './LanguageSwitcher';

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh',
];

export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    state: '',
    city: '',
    occupation: '',
    income: '',
  });

  const STEPS = [t('auth.stepAccount'), t('auth.stepPersonalInfo'), t('auth.stepComplete')];

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const inputSx = {
    mb: 2.5,
    '& .MuiOutlinedInput-root': {
      borderRadius: '6px',
      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#0c2340' },
    },
  };

  const validateStep = () => {
    if (activeStep === 0) {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        setError(t('common.fillAllFields'));
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        setError(t('auth.invalidEmail', 'Please enter a valid email address'));
        return false;
      }
      if (formData.password.length < 8) {
        setError(t('auth.passwordMinLength', 'Password must be at least 8 characters'));
        return false;
      }
      if (!/[A-Z]/.test(formData.password)) {
        setError('Password must contain at least one uppercase letter');
        return false;
      }
      if (!/[0-9]/.test(formData.password)) {
        setError('Password must contain at least one number');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError(t('auth.passwordsDoNotMatch'));
        return false;
      }
    }
    if (activeStep === 1) {
      if (!formData.firstName || !formData.lastName) {
        setError(t('auth.nameRequired'));
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;
    setLoading(true);
    setError('');
    try {
      const result = await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
        state: formData.state || undefined,
        city: formData.city || undefined,
        occupation: formData.occupation || undefined,
        income: formData.income !== '' && !isNaN(Number(formData.income)) ? Number(formData.income) : undefined,
      });
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || t('auth.registrationFailed'));
      }
    } catch {
      setError(t('common.somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        position: 'relative',
        py: 4,
      }}
    >
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <LanguageSwitcher />
      </Box>

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          className="animate-fade-in-up"
          sx={{
            background: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(12, 35, 64, 0.08)',
            border: '1px solid #cbd5e1',
            p: { xs: 3.5, md: 5 },
          }}
        >
          <Button
            component={Link}
            to="/"
            startIcon={<ArrowBack />}
            sx={{ textTransform: 'none', color: '#64748b', fontWeight: 500, mb: 3, '&:hover': { backgroundColor: '#f1f5f9', color: '#0c2340' } }}
          >
            {t('common.backToHome')}
          </Button>

          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0c2340', mb: 0.5 }}>
            SaralYojna
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
            {t('auth.registerTitle')}
          </Typography>
          <Typography sx={{ color: '#64748b', mb: 3 }}>
            {t('auth.registerSubtitle')}
          </Typography>

          {/* Stepper */}
          <Stepper
            activeStep={activeStep}
            sx={{
              mb: 4,
              '& .MuiStepIcon-root.Mui-active': { color: '#0c2340' },
              '& .MuiStepIcon-root.Mui-completed': { color: '#047857' },
            }}
          >
            {STEPS.map(label => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '6px' }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <form onSubmit={activeStep === 2 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
            {/* Step 0: Account */}
            {activeStep === 0 && (
              <>
                <TextField fullWidth label={t('auth.email')} type="email" value={formData.email} onChange={e => updateField('email', e.target.value)} id="register-email" sx={inputSx}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: '#94a3b8' }} /></InputAdornment> }} />
                <TextField fullWidth label={t('auth.password')} type={showPassword ? 'text' : 'password'} value={formData.password} onChange={e => updateField('password', e.target.value)} id="register-password" sx={inputSx}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#94a3b8' }} /></InputAdornment>,
                    endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>,
                  }} />
                <TextField fullWidth label={t('auth.confirmPassword')} type={showPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={e => updateField('confirmPassword', e.target.value)} id="register-confirm-password" sx={inputSx}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#94a3b8' }} /></InputAdornment> }} />
              </>
            )}

            {/* Step 1: Personal Info */}
            {activeStep === 1 && (
              <>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField fullWidth label={t('auth.firstName')} value={formData.firstName} onChange={e => updateField('firstName', e.target.value)} id="register-first-name" sx={inputSx}
                      InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ color: '#94a3b8' }} /></InputAdornment> }} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth label={t('auth.lastName')} value={formData.lastName} onChange={e => updateField('lastName', e.target.value)} id="register-last-name" sx={inputSx} />
                  </Grid>
                </Grid>
                <TextField fullWidth label={t('auth.phone')} value={formData.phone} onChange={e => updateField('phone', e.target.value)} id="register-phone" sx={inputSx}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Phone sx={{ color: '#94a3b8' }} /></InputAdornment> }} />
                <TextField fullWidth select label={t('auth.state')} value={formData.state} onChange={e => updateField('state', e.target.value)} id="register-state" sx={inputSx}>
                  <MenuItem value="">{t('common.selectState')}</MenuItem>
                  {STATES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
              </>
            )}

            {/* Step 2: Complete */}
            {activeStep === 2 && (
              <>
                <TextField fullWidth label={t('auth.city')} value={formData.city} onChange={e => updateField('city', e.target.value)} id="register-city" sx={inputSx} />
                <TextField fullWidth label={t('auth.occupation')} value={formData.occupation} onChange={e => updateField('occupation', e.target.value)} id="register-occupation" sx={inputSx} />
                <TextField fullWidth label={t('auth.annualIncomeLabel')} type="number" value={formData.income} onChange={e => updateField('income', e.target.value)} id="register-income" sx={inputSx} />
              </>
            )}

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              {activeStep > 0 && (
                <Button
                  onClick={handleBack}
                  variant="outlined"
                  size="large"
                  sx={{
                    flex: 1,
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: '6px',
                    py: 1.5,
                    borderColor: '#cbd5e1',
                    color: '#0c2340',
                    '&:hover': { borderColor: '#0c2340', background: '#f8fafc' },
                  }}
                >
                  {t('common.back')}
                </Button>
              )}
              <Button
                fullWidth={activeStep === 0}
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                endIcon={activeStep < 2 ? <ArrowForward /> : undefined}
                id={activeStep === 2 ? 'register-submit-btn' : 'register-next-btn'}
                sx={{
                  flex: 1,
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '1rem',
                  borderRadius: '6px',
                  py: 1.5,
                  background: '#0c2340',
                  color: '#ffffff',
                  boxShadow: 'none',
                  '&:hover': {
                    background: '#102a43',
                  },
                  '&:disabled': { opacity: 0.7 },
                  transition: 'all 0.2s ease',
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : activeStep === 2 ? t('auth.registerButton') : t('common.continue')}
              </Button>
            </Box>
          </form>

          <Divider sx={{ my: 3, color: '#94a3b8', fontSize: '0.85rem' }}>{t('common.or')}</Divider>

          <Typography sx={{ textAlign: 'center', color: '#64748b' }}>
            {t('auth.haveAccount')}{' '}
            <Typography component={Link} to="/login" sx={{ color: '#0c2340', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}>
              {t('auth.loginButton')}
            </Typography>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
