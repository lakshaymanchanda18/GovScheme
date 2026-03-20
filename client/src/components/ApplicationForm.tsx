import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Grid, Card, CardContent, Chip, Button, TextField, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox, Paper, Divider } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { useI18n } from '../hooks/useI18n';
import { useNavigate, useParams } from 'react-router-dom';

export default function ApplicationForm() {
  const { user, loading: authLoading } = useAuth();
  const { api } = useApi();
  const { t, i18n } = useI18n();
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

  useEffect(() => {
    fetchScheme();
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
      const formDataWithUser = {
        ...formData,
        userId: user.id,
        schemeId: schemeId,
        documents: documents.map(doc => ({
          name: doc.name,
          type: doc.type,
          size: doc.size
        }))
      };

      await api.post('/applications', formDataWithUser);
      alert('Application submitted successfully!');
      navigate('/applications');
    } catch (err) {
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
      </Box>
    </Container>
  );
}