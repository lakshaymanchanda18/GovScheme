import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Grid, Card, CardContent, Chip, Button, TextField, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox, Divider } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { useI18n } from '../hooks/useI18n';

export default function UserProfile() {
  const { user, loading: authLoading } = useAuth();
  const { api } = useApi();
  const { t, i18n } = useI18n();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
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
    veteranStatus: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await api.get('/users/profile');
      setProfile(data);
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phone: data.phone || '',
        email: data.email || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        pincode: data.pincode || '',
        aadharNumber: data.aadharNumber || '',
        panNumber: data.panNumber || '',
        income: data.income ? data.income.toString() : '',
        occupation: data.occupation || '',
        education: data.education || '',
        familySize: data.familySize ? data.familySize.toString() : '',
        disability: data.disability || '',
        veteranStatus: data.veteranStatus || ''
      });
    } catch (err) {
      setError(err.error || 'Failed to fetch profile');
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

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      phone: profile.phone || '',
      email: profile.email || '',
      address: profile.address || '',
      city: profile.city || '',
      state: profile.state || '',
      pincode: profile.pincode || '',
      aadharNumber: profile.aadharNumber || '',
      panNumber: profile.panNumber || '',
      income: profile.income ? profile.income.toString() : '',
      occupation: profile.occupation || '',
      education: profile.education || '',
      familySize: profile.familySize ? profile.familySize.toString() : '',
      disability: profile.disability || '',
      veteranStatus: profile.veteranStatus || ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.put('/users/profile', formData);
      setEditing(false);
      fetchProfile();
    } catch (err) {
      setError(err.error || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!profile) return <div>Profile not found</div>;

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          {t('profile')}
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
                        disabled={!editing}
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
                        disabled={!editing}
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
                        disabled={!editing}
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
                        disabled={!editing}
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
                        disabled={!editing}
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
                        disabled={!editing}
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
                        disabled={!editing}
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
                        disabled={!editing}
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
                        disabled={!editing}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label={t('panNumber')}
                        name="panNumber"
                        value={formData.panNumber}
                        onChange={handleInputChange}
                        disabled={!editing}
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
                        disabled={!editing}
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
                        disabled={!editing}
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
                        disabled={!editing}
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
                        disabled={!editing}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label={t('disability')}
                        name="disability"
                        value={formData.disability}
                        onChange={handleInputChange}
                        disabled={!editing}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label={t('veteranStatus')}
                        name="veteranStatus"
                        value={formData.veteranStatus}
                        onChange={handleInputChange}
                        disabled={!editing}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                {!editing && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleEdit}
                  >
                    {t('editProfile')}
                  </Button>
                )}
                {editing && (
                  <>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={handleCancel}
                    >
                      {t('cancel')}
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={submitting}
                    >
                      {submitting ? t('updating') : t('update')}
                    </Button>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Container>
  );
}