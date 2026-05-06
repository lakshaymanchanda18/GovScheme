import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Grid, Card, CardContent, Chip, Button,
  FormControl, InputLabel, Select, MenuItem, LinearProgress, Avatar,
  Skeleton, Alert, Divider, Collapse, Stack
} from '@mui/material';
import {
  CheckCircle, Cancel, TrendingUp, ExpandMore, ExpandLess,
  AutoAwesome, ArrowForward, Science
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { useI18n } from '../hooks/useI18n';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

interface CriteriaItem {
  criteria: string;
  met: boolean;
  reason: string;
  weight: number;
}

interface EligibilityResult {
  schemeId: string;
  schemeName: string;
  isEligible: boolean;
  confidenceScore: number;
  matchedCriteria: CriteriaItem[];
  unmatchedCriteria: CriteriaItem[];
  explanation: string;
  recommendations: string[];
}

export default function EligibilityCheck() {
  const { user } = useAuth();
  const { api } = useApi();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [schemes, setSchemes] = useState<any[]>([]);
  const [selectedScheme, setSelectedScheme] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [bulkResults, setBulkResults] = useState<EligibilityResult[]>([]);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      const data = await api.get('/schemes');
      setSchemes(Array.isArray(data) ? data : []);
    } catch {
      // Toast handled by useApi
    }
  };

  const checkSingle = async () => {
    if (!selectedScheme) return;
    setLoading(true);
    setResult(null);
    setBulkResults([]);
    try {
      const data = await api.post('/eligibility/check', { schemeId: selectedScheme });
      setResult(data);
      if (data.isEligible) {
        enqueueSnackbar(`You're eligible for ${data.schemeName}!`, { variant: 'success' });
      }
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  const checkAll = async () => {
    setBulkLoading(true);
    setResult(null);
    setBulkResults([]);
    try {
      const data = await api.post('/eligibility/check-all');
      const results = data?.results || data?.topRecommendations || [];
      setBulkResults(results);
      const eligible = results.filter((r: EligibilityResult) => r.isEligible).length;
      enqueueSnackbar(`Found ${eligible} eligible scheme${eligible !== 1 ? 's' : ''} out of ${results.length}`, { variant: 'info' });
    } catch {
      // handled
    } finally {
      setBulkLoading(false);
    }
  };

  const getAiAdvice = async () => {
    setAiLoading(true);
    try {
      const data = await api.post('/eligibility/ai-check', {
        personalInfo: {
          age: user?.dateOfBirth ? Math.floor((Date.now() - new Date(user.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : undefined,
          state: user?.state,
          education: user?.education,
          occupation: user?.occupation,
        },
        financialInfo: { income: user?.income },
        userId: user?.id,
      });
      setAiExplanation(data?.explanation || data?.advice || JSON.stringify(data));
    } catch {
      setAiExplanation('AI advice is currently unavailable. Please ensure your GEMINI_API_KEY is configured.');
    } finally {
      setAiLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#059669';
    if (score >= 60) return '#d97706';
    if (score >= 40) return '#ea580c';
    return '#dc2626';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return '#dcfce7';
    if (score >= 60) return '#fef3c7';
    if (score >= 40) return '#ffedd5';
    return '#fee2e2';
  };

  const renderResultCard = (r: EligibilityResult, index: number) => {
    const isExpanded = expandedCard === r.schemeId;
    return (
      <Card
        key={r.schemeId}
        elevation={0}
        className="animate-fade-in-up"
        sx={{
          borderRadius: '18px',
          border: `1px solid ${r.isEligible ? '#bbf7d0' : '#fecaca'}`,
          mb: 2,
          animationDelay: `${index * 60}ms`,
          transition: 'all 0.3s ease',
          '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.06)' },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
              <Avatar sx={{
                width: 44, height: 44,
                background: r.isEligible ? 'linear-gradient(135deg, #059669, #34d399)' : 'linear-gradient(135deg, #dc2626, #f87171)',
              }}>
                {r.isEligible ? <CheckCircle /> : <Cancel />}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.schemeName}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  {r.matchedCriteria?.length || 0} criteria matched • {r.unmatchedCriteria?.length || 0} unmatched
                </Typography>
              </Box>
            </Box>
            <Box sx={{ textAlign: 'center', ml: 2 }}>
              <Box sx={{
                px: 2, py: 0.5, borderRadius: '12px',
                background: getScoreBg(r.confidenceScore),
                color: getScoreColor(r.confidenceScore),
                fontWeight: 800, fontSize: '1.1rem',
              }}>
                {Math.round(r.confidenceScore)}%
              </Box>
            </Box>
          </Box>

          <LinearProgress
            variant="determinate"
            value={r.confidenceScore}
            sx={{
              height: 6, borderRadius: 3, mb: 2, backgroundColor: '#f1f5f9',
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                background: r.isEligible
                  ? 'linear-gradient(90deg, #059669, #34d399)'
                  : 'linear-gradient(90deg, #dc2626, #f87171)',
              },
            }}
          />

          {r.explanation && (
            <Typography variant="body2" sx={{ color: '#475569', mb: 2, lineHeight: 1.7 }}>
              {r.explanation}
            </Typography>
          )}

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
            <Button
              size="small"
              onClick={() => setExpandedCard(isExpanded ? null : r.schemeId)}
              endIcon={isExpanded ? <ExpandLess /> : <ExpandMore />}
              sx={{ textTransform: 'none', fontWeight: 600, color: '#4f46e5' }}
            >
              {isExpanded ? 'Hide Details' : 'Show Details'}
            </Button>
            {r.isEligible && (
              <Button
                size="small"
                variant="contained"
                endIcon={<ArrowForward />}
                onClick={() => navigate(`/applications/${r.schemeId}`)}
                sx={{
                  textTransform: 'none', fontWeight: 600, borderRadius: '10px',
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                }}
              >
                Apply Now
              </Button>
            )}
          </Box>

          <Collapse in={isExpanded}>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#059669', mb: 1 }}>
                  ✅ Matched Criteria
                </Typography>
                <Stack spacing={0.5}>
                  {(r.matchedCriteria || []).map((c, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle sx={{ fontSize: 16, color: '#22c55e' }} />
                      <Typography variant="body2" sx={{ color: '#334155' }}>
                        <strong>{c.criteria}</strong>: {c.reason}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#dc2626', mb: 1 }}>
                  ❌ Unmatched Criteria
                </Typography>
                <Stack spacing={0.5}>
                  {(r.unmatchedCriteria || []).map((c, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Cancel sx={{ fontSize: 16, color: '#ef4444' }} />
                      <Typography variant="body2" sx={{ color: '#334155' }}>
                        <strong>{c.criteria}</strong>: {c.reason}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Grid>
            </Grid>
            {r.recommendations && r.recommendations.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#d97706', mb: 1 }}>
                  💡 Recommendations
                </Typography>
                {r.recommendations.map((rec, i) => (
                  <Typography key={i} variant="body2" sx={{ color: '#475569', mb: 0.5 }}>
                    • {rec}
                  </Typography>
                ))}
              </Box>
            )}
          </Collapse>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ py: { xs: 3, md: 4 }, minHeight: 'calc(100vh - 120px)' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box className="animate-fade-in-up" sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', mb: 1 }}>
            Eligibility Checker
          </Typography>
          <Typography sx={{ color: '#64748b', fontSize: '1.05rem', maxWidth: 600 }}>
            Check your eligibility for government schemes based on your profile. Get AI-powered recommendations.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Left Panel — Controls */}
          <Grid item xs={12} md={4}>
            {/* Single Scheme Check */}
            <Card elevation={0} className="animate-fade-in-up delay-100" sx={{ borderRadius: '18px', border: '1px solid #f1f5f9', mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', mb: 2 }}>
                  Check Single Scheme
                </Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Select Scheme</InputLabel>
                  <Select
                    value={selectedScheme}
                    label="Select Scheme"
                    onChange={(e) => setSelectedScheme(e.target.value)}
                    sx={{ borderRadius: '12px' }}
                  >
                    <MenuItem value=""><em>Choose a scheme</em></MenuItem>
                    {schemes.map((s: any) => (
                      <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  fullWidth variant="contained" onClick={checkSingle}
                  disabled={!selectedScheme || loading}
                  startIcon={<Science />}
                  sx={{
                    textTransform: 'none', fontWeight: 600, borderRadius: '12px', py: 1.5,
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    '&:hover': { background: 'linear-gradient(135deg, #4338ca, #6d28d9)' },
                  }}
                >
                  {loading ? 'Checking...' : 'Check Eligibility'}
                </Button>
              </CardContent>
            </Card>

            {/* Check All */}
            <Card elevation={0} className="animate-fade-in-up delay-200" sx={{ borderRadius: '18px', border: '1px solid #f1f5f9', mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
                  Check All Schemes
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                  Scan your profile against every active scheme and get ranked results.
                </Typography>
                <Button
                  fullWidth variant="outlined" onClick={checkAll}
                  disabled={bulkLoading}
                  startIcon={<TrendingUp />}
                  sx={{
                    textTransform: 'none', fontWeight: 600, borderRadius: '12px', py: 1.5,
                    borderColor: '#4f46e5', color: '#4f46e5',
                    '&:hover': { borderColor: '#4338ca', backgroundColor: 'rgba(79,70,229,0.04)' },
                  }}
                >
                  {bulkLoading ? 'Scanning...' : 'Scan All Schemes'}
                </Button>
              </CardContent>
            </Card>

            {/* AI Advice */}
            <Card elevation={0} className="animate-fade-in-up delay-300" sx={{ borderRadius: '18px', border: '1px solid rgba(20,184,166,0.2)', background: 'linear-gradient(135deg, #f0fdfa, #ecfdf5)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AutoAwesome sx={{ color: '#0d9488' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f766e' }}>
                    AI Powered Advice
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#115e59', mb: 2 }}>
                  Get personalized scheme recommendations from our Gemini AI engine.
                </Typography>
                <Button
                  fullWidth variant="contained" onClick={getAiAdvice}
                  disabled={aiLoading}
                  sx={{
                    textTransform: 'none', fontWeight: 600, borderRadius: '12px', py: 1.5,
                    background: 'linear-gradient(135deg, #0d9488, #14b8a6)',
                    '&:hover': { background: 'linear-gradient(135deg, #0f766e, #0d9488)' },
                  }}
                >
                  {aiLoading ? 'Thinking...' : 'Get AI Advice'}
                </Button>
                {aiExplanation && (
                  <Box sx={{ mt: 2, p: 2, borderRadius: '12px', background: 'rgba(255,255,255,0.7)' }}>
                    <Typography variant="body2" sx={{ color: '#115e59', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                      {aiExplanation}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Right Panel — Results */}
          <Grid item xs={12} md={8}>
            {(loading || bulkLoading) && (
              <Box>
                {[1, 2, 3].map(i => (
                  <Card key={i} elevation={0} sx={{ borderRadius: '18px', border: '1px solid #f1f5f9', mb: 2 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                        <Skeleton variant="circular" width={44} height={44} />
                        <Box sx={{ flex: 1 }}>
                          <Skeleton width="60%" />
                          <Skeleton width="40%" />
                        </Box>
                        <Skeleton width={60} height={36} />
                      </Box>
                      <Skeleton width="100%" height={6} />
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}

            {/* Single result */}
            {result && !loading && renderResultCard(result, 0)}

            {/* Bulk results */}
            {bulkResults.length > 0 && !bulkLoading && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    Results ({bulkResults.length} schemes)
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      label={`${bulkResults.filter(r => r.isEligible).length} Eligible`}
                      size="small"
                      sx={{ fontWeight: 700, background: '#dcfce7', color: '#15803d' }}
                    />
                    <Chip
                      label={`${bulkResults.filter(r => !r.isEligible).length} Not Eligible`}
                      size="small"
                      sx={{ fontWeight: 700, background: '#fee2e2', color: '#b91c1c' }}
                    />
                  </Box>
                </Box>
                {bulkResults
                  .sort((a, b) => b.confidenceScore - a.confidenceScore)
                  .map((r, i) => renderResultCard(r, i))}
              </>
            )}

            {/* Empty state */}
            {!loading && !bulkLoading && !result && bulkResults.length === 0 && (
              <Card elevation={0} sx={{ borderRadius: '18px', border: '1px solid #f1f5f9', textAlign: 'center', py: 8 }}>
                <CardContent>
                  <Science sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
                    Ready to check your eligibility
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', maxWidth: 400, mx: 'auto' }}>
                    Select a specific scheme or scan all schemes at once. Make sure your profile is complete for accurate results.
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}