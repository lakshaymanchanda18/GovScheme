import React, { useState, useEffect } from 'react';
import { 
  Container, Grid, Card, CardContent, CardMedia, Typography, Box, Chip, 
  Button, Alert, TextField, FormControl, InputLabel, Select, MenuItem,
  InputAdornment, IconButton, Tooltip, Fade
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SchoolIcon from '@mui/icons-material/School';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import NaturePeopleIcon from '@mui/icons-material/NaturePeople';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
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
  sourceUrl?: string;
  lastUpdated?: string;
  isStale?: boolean;
}

// Map categories to generated abstract images
const categoryImageMap: Record<string, string> = {
  'Education': '/scheme_edu_1778095383942.png',
  'Agriculture': '/scheme_agri_1778095468610.png',
  'Healthcare': '/scheme_health_1778095507907.png',
  'Default': 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=600&auto=format&fit=crop' // Premium fallback gradient
};

const getSchemeImage = (category: string) => {
  if (category.includes('Education')) return categoryImageMap['Education'];
  if (category.includes('Agriculture') || category.includes('Farmer')) return categoryImageMap['Agriculture'];
  if (category.includes('Health')) return categoryImageMap['Healthcare'];
  return categoryImageMap['Default'];
};

export default function SchemeList() {
  const { user, loading: authLoading } = useAuth();
  const { api } = useApi();
  const { t } = useI18n();
  const navigate = useNavigate();
  
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [department, setDepartment] = useState('');
  const [animateCards, setAnimateCards] = useState(false);

  useEffect(() => {
    checkHealth();
    fetchSchemes();
  }, []);

  useEffect(() => {
    if (!loading) {
      setTimeout(() => setAnimateCards(true), 100);
    } else {
      setAnimateCards(false);
    }
  }, [loading]);

  const checkHealth = async () => {
    try {
      await api.get('/health');
      setHealthError(null);
    } catch (err: any) {
      setHealthError(err?.error || 'Backend health check failed');
    }
  };

  const fetchSchemes = async (overrides?: { q?: string; category?: string; department?: string }) => {
    try {
      const params = new URLSearchParams();
      const qVal = overrides?.q ?? query;
      const categoryVal = overrides?.category ?? category;
      const deptVal = overrides?.department ?? department;
      if (qVal) params.append('q', qVal);
      if (categoryVal) params.append('category', categoryVal);
      if (deptVal) params.append('department', deptVal);
      
      const endpoint = params.toString() ? `/schemes/search?${params.toString()}` : '/schemes';
      const data = await api.get(endpoint);
      setSchemes(data);
      setError(null);
    } catch (err) {
      setError((err as any)?.error || (err instanceof Error ? err.message : 'Failed to fetch schemes'));
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (schemeId: string) => navigate(`/applications/${schemeId}`);

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

  const categories = Array.from(new Set(schemes.map((s) => s.category))).sort();
  const departments = Array.from(new Set(schemes.map((s) => s.department))).sort();

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
      <Typography variant="h5" color="primary" sx={{ animation: 'pulse 1.5s infinite', fontFamily: "'Outfit', sans-serif" }}>
        Loading Premium Schemes...
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)', pb: 8 }}>
      {/* Hero Section */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', 
        pt: { xs: 8, md: 12 }, pb: { xs: 8, md: 10 }, px: 2,
        color: 'white', textAlign: 'center',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Decorative background elements */}
        <Box sx={{ position: 'absolute', top: -50, left: -50, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(40px)' }} />
        <Box sx={{ position: 'absolute', bottom: -100, right: -50, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', filter: 'blur(50px)' }} />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h2" fontWeight="800" sx={{ mb: 2, fontFamily: "'Outfit', sans-serif", textShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            Discover Your Perfect Scheme
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 5, fontWeight: 300, fontFamily: "'Inter', sans-serif" }}>
            AI-powered matching for government initiatives tailored exactly for your profile.
          </Typography>

          {/* Premium Glassmorphic Search Bar */}
          <Box sx={{ 
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(12px)',
            borderRadius: '24px',
            p: 1,
            display: 'flex',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s ease',
            '&:hover, &:focus-within': { background: 'rgba(255, 255, 255, 0.25)', transform: 'translateY(-2px)' }
          }}>
            <TextField
              fullWidth
              variant="standard"
              placeholder="Search by keywords, department..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchSchemes()}
              InputProps={{
                disableUnderline: true,
                startAdornment: <SearchIcon sx={{ color: 'white', mx: 2 }} />,
                sx: { color: 'white', fontSize: '1.1rem', py: 1, '&::placeholder': { color: 'rgba(255,255,255,0.7)', opacity: 1 } }
              }}
            />
            <Button 
              variant="contained" 
              onClick={() => fetchSchemes()}
              sx={{ 
                borderRadius: '18px', px: 4, 
                background: 'linear-gradient(45deg, #FF6B6B 0%, #FF8E53 100%)',
                color: 'white', fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)',
                '&:hover': { background: 'linear-gradient(45deg, #FF8E53 0%, #FF6B6B 100%)' }
              }}
            >
              Search
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: -4, position: 'relative', zIndex: 2 }}>
        
        {/* Filter Bar */}
        <Box sx={{ 
          background: 'white', borderRadius: '16px', p: 3, mb: 4,
          boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
          display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center'
        }}>
          <Box display="flex" alignItems="center" gap={1}>
            <FilterListIcon color="primary" />
            <Typography variant="subtitle1" fontWeight="bold">Filters</Typography>
          </Box>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Category</InputLabel>
            <Select value={category} label="Category" onChange={(e) => { setCategory(e.target.value); fetchSchemes({ category: e.target.value }); }}>
              <MenuItem value=""><em>All Categories</em></MenuItem>
              {categories.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Department</InputLabel>
            <Select value={department} label="Department" onChange={(e) => { setDepartment(e.target.value); fetchSchemes({ department: e.target.value }); }}>
              <MenuItem value=""><em>All Departments</em></MenuItem>
              {departments.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </Select>
          </FormControl>
          <Box sx={{ flexGrow: 1 }} />
          
          {/* Quick Filter Chips */}
          <Box display="flex" gap={1}>
            <Chip icon={<SchoolIcon fontSize="small"/>} label="Students" clickable onClick={() => fetchSchemes({ category: 'Education' })} sx={{ '&:hover': { background: '#e0e7ff', color: '#4338ca' } }} />
            <Chip icon={<NaturePeopleIcon fontSize="small"/>} label="Farmers" clickable onClick={() => fetchSchemes({ category: 'Agriculture' })} sx={{ '&:hover': { background: '#dcfce7', color: '#15803d' } }} />
            <Chip icon={<HealthAndSafetyIcon fontSize="small"/>} label="Healthcare" clickable onClick={() => fetchSchemes({ category: 'Healthcare' })} sx={{ '&:hover': { background: '#fee2e2', color: '#b91c1c' } }} />
            <Chip icon={<LocalAtmIcon fontSize="small"/>} label="Finance" clickable onClick={() => fetchSchemes({ category: 'Financial Inclusion' })} sx={{ '&:hover': { background: '#fef3c7', color: '#b45309' } }} />
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: '12px' }}>
            {error} <Button size="small" onClick={() => fetchSchemes()}>Retry</Button>
          </Alert>
        )}

        {/* Schemes Grid */}
        {schemes.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Typography variant="h5" color="text.secondary" fontFamily="'Outfit', sans-serif">No schemes found matching your criteria.</Typography>
          </Box>
        ) : (
          <Grid container spacing={4}>
            {schemes.map((scheme, index) => (
              <Fade in={animateCards} style={{ transitionDelay: `${index * 50}ms` }} key={scheme.id}>
                <Grid item xs={12} sm={6} lg={4}>
                  <Card sx={{
                    height: '100%', display: 'flex', flexDirection: 'column',
                    borderRadius: '24px', overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.5)',
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.05)',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    '&:hover': {
                      transform: 'translateY(-10px)',
                      boxShadow: '0 25px 50px rgba(0,0,0,0.1)',
                      '& .card-image': { transform: 'scale(1.05)' }
                    }
                  }}>
                    {/* Premium Image Header */}
                    <Box sx={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                      <CardMedia
                        component="img"
                        className="card-image"
                        height="200"
                        image={getSchemeImage(scheme.category)}
                        alt={scheme.name}
                        sx={{ transition: 'transform 0.5s ease' }}
                      />
                      <Box sx={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)'
                      }} />
                      <Chip 
                        label={scheme.category} 
                        size="small" 
                        sx={{ 
                          position: 'absolute', top: 16, right: 16, 
                          background: 'rgba(255,255,255,0.2)', color: 'white',
                          backdropFilter: 'blur(10px)', fontWeight: 'bold'
                        }} 
                      />
                      <Typography variant="h6" sx={{
                        position: 'absolute', bottom: 16, left: 16, right: 16,
                        color: 'white', fontWeight: 700, fontFamily: "'Outfit', sans-serif",
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                        lineHeight: 1.2
                      }}>
                        {scheme.name}
                      </Typography>
                    </Box>

                    <CardContent sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontFamily: "'Inter', sans-serif", lineHeight: 1.6, flexGrow: 1 }}>
                        {scheme.description.substring(0, 140)}...
                      </Typography>
                      
                      <Box display="flex" alignItems="center" gap={1} mb={3}>
                        <Chip label={scheme.department} size="small" variant="outlined" sx={{ borderRadius: '8px' }} />
                        {scheme.isStale && <Chip label="Stale" size="small" color="warning" sx={{ borderRadius: '8px' }} />}
                      </Box>

                      {/* Action Buttons */}
                      <Box display="flex" gap={2}>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => navigate(`/schemes/${scheme.id}`)}
                          sx={{ 
                            borderRadius: '12px', py: 1, 
                            borderWidth: '2px', '&:hover': { borderWidth: '2px' } 
                          }}
                        >
                          View Details
                        </Button>
                        <Tooltip title="AI Eligibility Check">
                          <Button
                            variant="contained"
                            onClick={() => handleCheckEligibility(scheme.id)}
                            sx={{ 
                              minWidth: '56px', borderRadius: '12px',
                              background: 'linear-gradient(45deg, #8B5CF6 0%, #EC4899 100%)',
                              boxShadow: '0 4px 14px rgba(236, 72, 153, 0.4)',
                              '&:hover': { background: 'linear-gradient(45deg, #7C3AED 0%, #DB2777 100%)' }
                            }}
                          >
                            <AutoAwesomeIcon />
                          </Button>
                        </Tooltip>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Fade>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
