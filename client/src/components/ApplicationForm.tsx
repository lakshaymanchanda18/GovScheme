import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Grid, Card, CardContent, Chip, Button, TextField, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox, Paper, Divider, Alert } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { useI18n } from '../hooks/useI18n';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';

export default function ApplicationForm() {
  const { user, loading: authLoading } = useAuth();
  const { api } = useApi();
  const { t } = useI18n();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { schemeId } = useParams();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    aadharNumber: '',
    panNumber: '',
    income: '',
    occupation: '',
    education: '',
    familySize: '',
    disability: '',
    veteranStatus: '',
    documents: []
  });
  const [documents, setDocuments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const assistedMode = localStorage.getItem('assistedMode') === 'true';
  const simpleMode = localStorage.getItem('simpleMode') === 'true';

  useEffect(() => {
    fetchScheme();
  }, [schemeId]);

  useEffect(() => {
    const draftKey = `applicationDraft:${schemeId}`;
    const draft = localStorage.getItem(draftKey);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setFormData(parsed.formData || formData);
        setDocuments(parsed.documents || []);
        setDraftLoaded(true);
      } catch {
        // ignore
      }
    }
  }, [schemeId]);

  const fetchScheme = async () => {
    try {
      const data = await api.get(`/schemes/${schemeId}`);
      setScheme(data);
    } catch (err) {
      setError(err.error || 'Failed to fetch scheme');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDocuments([...documents, file]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Please login to submit application');
      return;
    }

    try {
      setSubmitting(true);
      
      // 1. Submit application data first
      const applicationPayload = {
        schemeId,
        applicationData: formData,
        // Legacy documents field just in case
        documents: documents.map((doc: any) => ({ name: doc.name, type: doc.type, size: doc.size }))
      };

      const { applicationId } = await api.post('/applications', applicationPayload);

      // 2. Upload documents linked to the application
      if (documents.length > 0) {
        // We use standard fetch or axios with FormData to upload files
        for (const file of documents) {
          const fileData = new FormData();
          fileData.append('file', file as any);
          fileData.append('applicationId', applicationId);
          
          await api.post('/documents/upload', fileData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        }
      }

      enqueueSnackbar('Application submitted successfully!', { variant: 'success' });
      localStorage.removeItem(`applicationDraft:${schemeId}`);
      navigate('/applications');
    } catch (err: any) {
      // The useApi hook already displays an error toast
      setError(err.error || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!scheme) return <div>Scheme not found</div>;

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          {t('applyForScheme')} - {scheme.name}
        </Typography>
        {(assistedMode || simpleMode) && (
          <Box mb={2}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2">
                {assistedMode ? 'Assisted mode: follow steps and save drafts for later.' : null}
                {simpleMode ? ' Simple mode: simplified layout and larger text.' : null}
              </Typography>
            </Paper>
          </Box>
        )}
        {draftLoaded && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Draft loaded from previous session.
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('personalInformation')}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label={t('firstName')}
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        inputProps={{ 'aria-label': 'First name' }}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label={t('lastName')}
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        inputProps={{ 'aria-label': 'Last name' }}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label={t('phone')}
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label={t('email')}
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label={t('address')}
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        multiline
                        rows={2}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label={t('city')}
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label={t('state')}
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label={t('pincode')}
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        required
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('additionalInformation')}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label={t('aadharNumber')}
                        name="aadharNumber"
                        value={formData.aadharNumber}
                        onChange={handleInputChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label={t('panNumber')}
                        name="panNumber"
                        value={formData.panNumber}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label={t('income')}
                        name="income"
                        type="number"
                        value={formData.income}
                        onChange={handleInputChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label={t('occupation')}
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleInputChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label={t('education')}
                        name="education"
                        value={formData.education}
                        onChange={handleInputChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label={t('familySize')}
                        name="familySize"
                        type="number"
                        value={formData.familySize}
                        onChange={handleInputChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label={t('disability')}
                        name="disability"
                        value={formData.disability}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label={t('veteranStatus')}
                        name="veteranStatus"
                        value={formData.veteranStatus}
                        onChange={handleInputChange}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('documents')}
                  </Typography>
                  <Box mb={2}>
                    <input
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleDocumentChange}
                      multiple
                    />
                  </Box>
                  {documents.length > 0 && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {t('selectedDocuments')}:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {documents.map((doc: any) => (
                          <Chip key={doc.name} label={doc.name} size="small" />
                        ))}
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => navigate('/schemes')}
                >
                  {t('back')}
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={submitting}
                >
                  {submitting ? t('submitting') : t('submit')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
        <Box display="flex" gap={2} mt={2}>
          <Button
            variant="outlined"
            onClick={() => {
              const draftKey = `applicationDraft:${schemeId}`;
              localStorage.setItem(draftKey, JSON.stringify({ formData, documents }));
              alert('Draft saved');
            }}
            aria-label="Save draft"
          >
            Save Draft
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              localStorage.removeItem(`applicationDraft:${schemeId}`);
              setDraftLoaded(false);
              alert('Draft cleared');
            }}
            aria-label="Clear draft"
          >
            Clear Draft
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
