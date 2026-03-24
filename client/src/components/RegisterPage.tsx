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

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh',
];

const STEPS = ['Account', 'Personal Info', 'Complete'];

export default function RegisterPage() {
  const { register } = useAuth();
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

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const inputSx = {
    mb: 2.5,
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#a5b4fc' },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4f46e5' },
    },
  };

  const validateStep = () => {
    if (activeStep === 0) {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all fields');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }
    if (activeStep === 1) {
      if (!formData.firstName || !formData.lastName) {
        setError('First name and last name are required');
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
        income: formData.income ? parseFloat(formData.income) : undefined,
      });
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch {
      setError('Something went wrong. Please try again.');
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
        background: 'linear-gradient(160deg, #f8fafc 0%, #eef2ff 40%, #f0fdfa 70%, #f8fafc 100%)',
        position: 'relative',
        overflow: 'hidden',
        py: 4,
      }}
    >
      <Box sx={{ position: 'absolute', top: -120, right: -120, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)' }} />
      <Box sx={{ position: 'absolute', bottom: -100, left: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(20,184,166,0.06) 0%, transparent 70%)' }} />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          className="animate-fade-in-up"
          sx={{
            background: '#fff',
            borderRadius: '24px',
            boxShadow: '0 20px 60px rgba(79,70,229,0.08)',
            border: '1px solid rgba(226,232,240,0.6)',
            p: { xs: 4, md: 5 },
          }}
        >
          <Button
            component={Link}
            to="/"
            startIcon={<ArrowBack />}
            sx={{ textTransform: 'none', color: '#64748b', fontWeight: 500, mb: 3, '&:hover': { backgroundColor: 'rgba(79,70,229,0.04)' } }}
          >
            Back to Home
          </Button>

          <Typography variant="h5" sx={{ fontWeight: 900, background: 'linear-gradient(135deg, #4f46e5, #14b8a6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 1 }}>
            SaralYojna
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
            Create your account
          </Typography>
          <Typography sx={{ color: '#64748b', mb: 3 }}>
            Join thousands of citizens discovering their benefits
          </Typography>

          {/* Stepper */}
          <Stepper
            activeStep={activeStep}
            sx={{
              mb: 4,
              '& .MuiStepIcon-root.Mui-active': { color: '#4f46e5' },
              '& .MuiStepIcon-root.Mui-completed': { color: '#14b8a6' },
            }}
          >
            {STEPS.map(label => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <form onSubmit={activeStep === 2 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
            {/* Step 0: Account */}
            {activeStep === 0 && (
              <>
                <TextField fullWidth label="Email Address" type="email" value={formData.email} onChange={e => updateField('email', e.target.value)} id="register-email" sx={inputSx}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: '#94a3b8' }} /></InputAdornment> }} />
                <TextField fullWidth label="Password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={e => updateField('password', e.target.value)} id="register-password" sx={inputSx}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#94a3b8' }} /></InputAdornment>,
                    endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>,
                  }} />
                <TextField fullWidth label="Confirm Password" type={showPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={e => updateField('confirmPassword', e.target.value)} id="register-confirm-password" sx={inputSx}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#94a3b8' }} /></InputAdornment> }} />
              </>
            )}

            {/* Step 1: Personal Info */}
            {activeStep === 1 && (
              <>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField fullWidth label="First Name" value={formData.firstName} onChange={e => updateField('firstName', e.target.value)} id="register-first-name" sx={inputSx}
                      InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ color: '#94a3b8' }} /></InputAdornment> }} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Last Name" value={formData.lastName} onChange={e => updateField('lastName', e.target.value)} id="register-last-name" sx={inputSx} />
                  </Grid>
                </Grid>
                <TextField fullWidth label="Phone Number" value={formData.phone} onChange={e => updateField('phone', e.target.value)} id="register-phone" sx={inputSx}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Phone sx={{ color: '#94a3b8' }} /></InputAdornment> }} />
                <TextField fullWidth select label="State" value={formData.state} onChange={e => updateField('state', e.target.value)} id="register-state" sx={inputSx}>
                  <MenuItem value="">Select State</MenuItem>
                  {STATES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
              </>
            )}

            {/* Step 2: Complete */}
            {activeStep === 2 && (
              <>
                <TextField fullWidth label="City" value={formData.city} onChange={e => updateField('city', e.target.value)} id="register-city" sx={inputSx} />
                <TextField fullWidth label="Occupation" value={formData.occupation} onChange={e => updateField('occupation', e.target.value)} id="register-occupation" sx={inputSx} />
                <TextField fullWidth label="Annual Income (₹)" type="number" value={formData.income} onChange={e => updateField('income', e.target.value)} id="register-income" sx={inputSx} />
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
                    borderRadius: '14px',
                    py: 1.6,
                    borderColor: '#e2e8f0',
                    color: '#334155',
                    '&:hover': { borderColor: '#94a3b8' },
                  }}
                >
                  Back
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
                  borderRadius: '14px',
                  py: 1.6,
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  boxShadow: '0 6px 20px rgba(79,70,229,0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4338ca, #6d28d9)',
                    boxShadow: '0 8px 28px rgba(79,70,229,0.4)',
                    transform: 'translateY(-1px)',
                  },
                  '&:disabled': { opacity: 0.7 },
                  transition: 'all 0.25s ease',
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : activeStep === 2 ? 'Create Account' : 'Continue'}
              </Button>
            </Box>
          </form>

          <Divider sx={{ my: 3, color: '#94a3b8', fontSize: '0.85rem' }}>or</Divider>

          <Typography sx={{ textAlign: 'center', color: '#64748b' }}>
            Already have an account?{' '}
            <Typography component={Link} to="/login" sx={{ color: '#4f46e5', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}>
              Sign In
            </Typography>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
