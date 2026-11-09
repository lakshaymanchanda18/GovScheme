import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, Grid, Card, CardContent, CardMedia, Typography, Box, Chip, 
  Button, Alert, TextField, FormControl, InputLabel, Select, MenuItem,
  Tooltip, Pagination, Stack
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SchoolIcon from '@mui/icons-material/School';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import NaturePeopleIcon from '@mui/icons-material/NaturePeople';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { useI18n } from '../hooks/useI18n';
import { useNavigate } from 'react-router-dom';
import { SchemeCardSkeleton } from './common/Skeletons';

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

const categoryImageMap: Record<string, string> = {
  'Education': '/scheme_edu_1778095383942.png',
  'Agriculture': '/scheme_agri_1778095468610.png',
  'Healthcare': '/scheme_health_1778095507907.png',
  'Default': '/scheme_edu_1778095383942.png'
};

const getSchemeImage = (category: string) => {
  if (category.includes('Education')) return categoryImageMap['Education'];
  if (category.includes('Agriculture') || category.includes('Farmer')) return categoryImageMap['Agriculture'];
  if (category.includes('Health')) return categoryImageMap['Healthcare'];
  return categoryImageMap['Default'];
};

export default function SchemeList() {
  const { user } = useAuth();
  const { api } = useApi();
  const { t } = useI18n();
  const navigate = useNavigate();
  
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [department, setDepartment] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchSchemes = useCallback(async (overrides?: { q?: string; category?: string; department?: string; page?: number }) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const qVal = overrides?.q !== undefined ? overrides.q : query;
      const categoryVal = overrides?.category !== undefined ? overrides.category : category;
      const deptVal = overrides?.department !== undefined ? overrides.department : department;
      const pageVal = overrides?.page !== undefined ? overrides.page : page;

      if (qVal) params.append('q', qVal);
      if (categoryVal) params.append('category', categoryVal);
      if (deptVal) params.append('department', deptVal);
      params.append('page', pageVal.toString());
      params.append('limit', '12');
      params.append('paginated', 'true');
      
      const endpoint = `/schemes?${params.toString()}`;
      const res = await api.get(endpoint);
      
      if (res && res.data && Array.isArray(res.data)) {
        setSchemes(res.data);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalCount(res.pagination?.total || res.data.length);
      } else if (Array.isArray(res)) {
        setSchemes(res);
        setTotalPages(1);
        setTotalCount(res.length);
      } else {
        setSchemes([]);
      }
      setError(null);
    } catch (err: any) {
      setError(err?.error || (err instanceof Error ? err.message : 'Failed to fetch schemes'));
    } finally {
      setLoading(false);
    }
  }, [query, category, department, page, api]);

  // Initial load
  useEffect(() => {
    fetchSchemes();
  }, [page]);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchSchemes({ q: query, page: 1 });
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const handleApply = (schemeId: string) => navigate(`/applications/${schemeId}`);

  const handleCheckEligibility = async (schemeId: string) => {
    try {
      const result = await api.post('/eligibility/check', { schemeId });
      if (result.isEligible) {
        handleApply(schemeId);
      } else {
        navigate(`/eligibility`);
      }
    } catch {
      navigate(`/eligibility`);
    }
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const categories = ['Agriculture', 'Education', 'Healthcare', 'Social Welfare', 'Financial Inclusion', 'Housing', 'Employment'];
  const departments = ['Ministry of Agriculture', 'Ministry of Education', 'Ministry of Health', 'Ministry of Finance', 'Ministry of Rural Development'];

  return (
    <Box sx={{ minHeight: '100vh', background: '#f8fafc', pb: 8 }}>
      {/* Civic Directory Header */}
      <Box sx={{ 
        background: '#0c2340', 
        pt: { xs: 5, md: 7 }, 
        pb: { xs: 6, md: 8 }, 
        px: 2,
        color: 'white', 
        textAlign: 'center',
        borderBottom: '4px solid #047857'
      }}>
        <Container maxWidth="md">
          <Typography 
            variant="h3" 
            fontWeight="800" 
            sx={{ mb: 1.5, fontSize: { xs: '1.8rem', md: '2.5rem' }, letterSpacing: '-0.02em' }}
          >
            {t('schemes.centralAndState', 'Central & State Government Schemes')}
          </Typography>
          <Typography variant="body1" sx={{ color: '#94a3b8', mb: 4, maxWidth: 600, mx: 'auto' }}>
            {t('schemes.heroDescription', 'Search verified welfare initiatives, eligibility criteria, and application guidelines across Indian ministries.')}
          </Typography>

          {/* Structured Civic Search Bar */}
          <Box sx={{ 
            background: '#ffffff',
            borderRadius: '6px',
            p: 0.75,
            display: 'flex',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            border: '1px solid #cbd5e1',
          }}>
            <TextField
              fullWidth
              variant="standard"
              placeholder={t('schemes.searchPlaceholderLong', 'Search by scheme name, keywords, or department...')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              InputProps={{
                disableUnderline: true,
                startAdornment: <SearchIcon sx={{ color: '#64748b', mx: 1.5 }} />,
                sx: { color: '#0f172a', fontSize: '1rem', py: 0.75 }
              }}
            />
            {query && (
              <Button 
                size="small"
                onClick={() => { setQuery(''); fetchSchemes({ q: '', page: 1 }); }}
                sx={{ color: '#64748b', textTransform: 'none', px: 2 }}
              >
                {t('common.clear', 'Clear')}
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        {/* Filter Bar */}
        <Box sx={{ 
          background: '#ffffff', 
          borderRadius: '6px', 
          p: 2.5, 
          mb: 4,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex', 
          gap: 2, 
          flexWrap: 'wrap', 
          alignItems: 'center'
        }}>
          <Box display="flex" alignItems="center" gap={1}>
            <FilterListIcon sx={{ color: '#0c2340' }} />
            <Typography variant="subtitle2" fontWeight="700" color="#0c2340">
              {t('schemes.filters', 'Filters')}
            </Typography>
          </Box>

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>{t('common.category', 'Category')}</InputLabel>
            <Select 
              value={category} 
              label={t('common.category', 'Category')} 
              onChange={(e) => { 
                setCategory(e.target.value); 
                setPage(1); 
                fetchSchemes({ category: e.target.value, page: 1 }); 
              }}
            >
              <MenuItem value=""><em>{t('schemes.allCategories', 'All Categories')}</em></MenuItem>
              {categories.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>{t('common.department', 'Department')}</InputLabel>
            <Select 
              value={department} 
              label={t('common.department', 'Department')} 
              onChange={(e) => { 
                setDepartment(e.target.value); 
                setPage(1); 
                fetchSchemes({ department: e.target.value, page: 1 }); 
              }}
            >
              <MenuItem value=""><em>{t('schemes.allDepartments', 'All Departments')}</em></MenuItem>
              {departments.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </Select>
          </FormControl>

          {(category || department) && (
            <Button
              size="small"
              onClick={() => {
                setCategory('');
                setDepartment('');
                setPage(1);
                fetchSchemes({ category: '', department: '', page: 1 });
              }}
              sx={{ color: '#dc2626', textTransform: 'none' }}
            >
              {t('schemes.resetFilters', 'Reset Filters')}
            </Button>
          )}

          <Box sx={{ flexGrow: 1 }} />
          
          {/* Quick Filter Badges */}
          <Box display="flex" gap={1} flexWrap="wrap">
            <Chip 
              icon={<SchoolIcon fontSize="small"/>} 
              label={t('landing.catEdu', 'Education')} 
              clickable 
              onClick={() => { setCategory('Education'); setPage(1); fetchSchemes({ category: 'Education', page: 1 }); }}
              sx={{ borderRadius: '4px', backgroundColor: category === 'Education' ? '#e2e8f0' : undefined }}
            />
            <Chip 
              icon={<NaturePeopleIcon fontSize="small"/>} 
              label={t('landing.catAgri', 'Agriculture')} 
              clickable 
              onClick={() => { setCategory('Agriculture'); setPage(1); fetchSchemes({ category: 'Agriculture', page: 1 }); }}
              sx={{ borderRadius: '4px', backgroundColor: category === 'Agriculture' ? '#e2e8f0' : undefined }}
            />
            <Chip 
              icon={<HealthAndSafetyIcon fontSize="small"/>} 
              label={t('landing.catHealth', 'Healthcare')} 
              clickable 
              onClick={() => { setCategory('Healthcare'); setPage(1); fetchSchemes({ category: 'Healthcare', page: 1 }); }}
              sx={{ borderRadius: '4px', backgroundColor: category === 'Healthcare' ? '#e2e8f0' : undefined }}
            />
            <Chip 
              icon={<AccountBalanceIcon fontSize="small"/>} 
              label={t('landing.catFinance', 'Finance')} 
              clickable 
              onClick={() => { setCategory('Financial Inclusion'); setPage(1); fetchSchemes({ category: 'Financial Inclusion', page: 1 }); }}
              sx={{ borderRadius: '4px', backgroundColor: category === 'Financial Inclusion' ? '#e2e8f0' : undefined }}
            />
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: '6px' }}>
            {error} <Button size="small" onClick={() => fetchSchemes()}>{t('common.retry', 'Retry')}</Button>
          </Alert>
        )}

        {/* Total results count */}
        {!loading && (
          <Typography variant="body2" sx={{ color: '#64748b', mb: 2, fontWeight: 500 }}>
            {t('schemes.showingCount', { shown: schemes.length, total: totalCount, defaultValue: `Showing ${schemes.length} of ${totalCount} schemes` })} {category ? `in ${category}` : ''}
          </Typography>
        )}

        {/* Unified Skeleton Loading State */}
        {loading ? (
          <SchemeCardSkeleton count={6} />
        ) : schemes.length === 0 ? (
          <Box textAlign="center" py={8} sx={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <Typography variant="h6" color="#0c2340" fontWeight="600" sx={{ mb: 1 }}>
              {t('schemes.noSchemesFound', 'No schemes found matching your criteria.')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t('schemes.noSchemesSuggestion', 'Try adjusting your search terms or clearing selected category filters.')}
            </Typography>
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => { setQuery(''); setCategory(''); setDepartment(''); fetchSchemes({ q: '', category: '', department: '', page: 1 }); }}
            >
              {t('schemes.resetAllFilters', 'Reset All Filters')}
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {schemes.map((scheme) => (
              <Grid item xs={12} sm={6} lg={4} key={scheme.id}>
                <Card 
                  elevation={0}
                  sx={{
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: '8px', 
                    overflow: 'hidden',
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#0c2340',
                      boxShadow: '0 4px 12px rgba(12, 35, 64, 0.08)',
                    }
                  }}
                >
                  {/* Category Image Header */}
                  <Box sx={{ position: 'relative', height: 160, overflow: 'hidden', background: '#0c2340' }}>
                    <CardMedia
                      component="img"
                      height="160"
                      image={getSchemeImage(scheme.category)}
                      alt={scheme.name}
                      sx={{ opacity: 0.85 }}
                    />
                    <Box sx={{
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      background: 'linear-gradient(to top, rgba(12,35,64,0.9) 0%, rgba(12,35,64,0.2) 100%)'
                    }} />
                    <Chip 
                      label={scheme.category} 
                      size="small" 
                      sx={{ 
                        position: 'absolute', top: 12, right: 12, 
                        background: 'rgba(255,255,255,0.92)', color: '#0c2340',
                        fontWeight: 700, borderRadius: '4px', fontSize: '0.75rem'
                      }} 
                    />
                    <Typography variant="subtitle1" sx={{
                      position: 'absolute', bottom: 12, left: 16, right: 16,
                      color: 'white', fontWeight: 700,
                      lineHeight: 1.3
                    }}>
                      {scheme.name}
                    </Typography>
                  </Box>

                  <CardContent sx={{ flexGrow: 1, p: 2.5, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2" color="#475569" sx={{ mb: 2, lineHeight: 1.6, flexGrow: 1 }}>
                      {scheme.description ? (scheme.description.length > 140 ? `${scheme.description.substring(0, 140)}...` : scheme.description) : 'No description available.'}
                    </Typography>
                    
                    <Box display="flex" alignItems="center" gap={1} mb={2.5} flexWrap="wrap">
                      <Chip 
                        label={scheme.department} 
                        size="small" 
                        variant="outlined" 
                        sx={{ borderRadius: '4px', borderColor: '#cbd5e1', color: '#475569', fontSize: '0.75rem' }} 
                      />
                      {scheme.stateSpecific && (
                        <Chip 
                          label={scheme.stateSpecific} 
                          size="small" 
                          sx={{ borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontSize: '0.75rem', fontWeight: 600 }} 
                        />
                      )}
                    </Box>

                    {/* Action Buttons */}
                    <Box display="flex" gap={1.5} pt={1} sx={{ borderTop: '1px solid #f1f5f9' }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        size="medium"
                        onClick={() => navigate(`/schemes/${scheme.id}`)}
                        sx={{ 
                          borderRadius: '6px', 
                          borderColor: '#cbd5e1',
                          color: '#0c2340',
                          '&:hover': { borderColor: '#0c2340', background: '#f8fafc' } 
                        }}
                      >
                        {t('schemes.viewDetails', 'View Details')}
                      </Button>
                      <Tooltip title={t('schemes.eligibilityCheck', 'Check Eligibility')}>
                        <Button
                          variant="contained"
                          size="medium"
                          onClick={() => handleCheckEligibility(scheme.id)}
                          sx={{ 
                            minWidth: '44px', 
                            borderRadius: '6px',
                            background: '#047857',
                            color: '#ffffff',
                            '&:hover': { background: '#065f46' }
                          }}
                        >
                          <VerifiedUserIcon fontSize="small" />
                        </Button>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <Stack spacing={2} alignItems="center" sx={{ mt: 6, mb: 4 }}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={handlePageChange} 
              color="primary"
              shape="rounded"
              size="large"
            />
          </Stack>
        )}
      </Container>
    </Box>
  );
}
