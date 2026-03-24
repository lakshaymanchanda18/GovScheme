import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Container, InputAdornment,
  IconButton, Alert, Divider, CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, ArrowBack } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Invalid credentials');
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
      }}
    >
      {/* Background Shapes */}
      <Box sx={{ position: 'absolute', top: -120, left: -120, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)' }} />
      <Box sx={{ position: 'absolute', bottom: -100, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(20,184,166,0.06) 0%, transparent 70%)' }} />

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
          {/* Back to Home */}
          <Button
            component={Link}
            to="/"
            startIcon={<ArrowBack />}
            sx={{
              textTransform: 'none',
              color: '#64748b',
              fontWeight: 500,
              mb: 3,
              '&:hover': { backgroundColor: 'rgba(79,70,229,0.04)' },
            }}
          >
            Back to Home
          </Button>

          {/* Logo */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 900,
              background: 'linear-gradient(135deg, #4f46e5, #14b8a6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}
          >
            SaralYojna
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
            Welcome back
          </Typography>
          <Typography sx={{ color: '#64748b', mb: 4 }}>
            Sign in to access your schemes and applications
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 3, borderRadius: '12px' }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              id="login-email"
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#a5b4fc' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4f46e5' },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              id="login-password"
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#a5b4fc' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4f46e5' },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              id="login-submit-btn"
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '1rem',
                borderRadius: '14px',
                py: 1.8,
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
              {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Sign In'}
            </Button>
          </form>

          <Divider sx={{ my: 3, color: '#94a3b8', fontSize: '0.85rem' }}>or</Divider>

          <Typography sx={{ textAlign: 'center', color: '#64748b' }}>
            Don't have an account?{' '}
            <Typography
              component={Link}
              to="/register"
              sx={{
                color: '#4f46e5',
                fontWeight: 600,
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Create Account
            </Typography>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
