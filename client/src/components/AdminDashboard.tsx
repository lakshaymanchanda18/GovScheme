import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Grid, Card, CardContent, Chip, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tabs, Tab, TextField, Select, MenuItem, InputLabel, FormControl, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextareaAutosize } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { useI18n } from '../hooks/useI18n';
import { useNavigate } from 'react-router-dom';
import { Dashboard as DashboardIcon, People as PeopleIcon, Assignment as AssignmentIcon, Analytics as AnalyticsIcon, Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';

interface Scheme {
  id: string;
  name: string;
  description: string;
  category: string;
  department: string;
  benefits: string;
  eligibilityCriteria: string;
  applicationProcess: string;
  requiredDocuments: string;
  incomeLimit?: number;
  ageLimit?: string;
  familySizeLimit?: number;
  isActive: boolean;
  createdAt: string;
}

interface Application {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  scheme: {
    id: string;
    name: string;
  };
  status: 'PENDING' | 'REVIEWED' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  state?: string;
  isActive: boolean;
  role: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { api } = useApi();
  const { t, i18n, formatDate } = useI18n();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState(0);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Scheme management
  const [schemeDialog, setSchemeDialog] = useState(false);
  const [editingScheme, setEditingScheme] = useState<Scheme | null>(null);
  const [schemeForm, setSchemeForm] = useState({
    name: '',
    description: '',
    category: '',
    department: '',
    benefits: '',
    eligibilityCriteria: '',
    applicationProcess: '',
    requiredDocuments: '',
    incomeLimit: '',
    ageLimit: '',
    familySizeLimit: '',
    isActive: true
  });

  // Application management
  const [reviewDialog, setReviewDialog] = useState(false);
  const [reviewingApp, setReviewingApp] = useState<Application | null>(null);
  const [reviewForm, setReviewForm] = useState({
    status: 'REVIEWED',
    rejectionReason: ''
  });

  useEffect(() => {
    if ((user as any)?.role !== 'ADMIN') {
      navigate('/schemes');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schemesData, appsData, usersData, analyticsData] = await Promise.all([
        api.get('/admin/schemes'),
        api.get('/admin/applications'),
        api.get('/admin/users'),
        api.get('/admin/analytics')
      ]);
      
      setSchemes(schemesData);
      setApplications(appsData);
      setUsers(usersData);
      setAnalytics(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Scheme management functions
  const handleSchemeSubmit = async () => {
    try {
      if (editingScheme) {
        await api.put(`/admin/schemes/${editingScheme.id}`, {
          ...schemeForm,
          incomeLimit: schemeForm.incomeLimit ? parseFloat(schemeForm.incomeLimit) : undefined,
          familySizeLimit: schemeForm.familySizeLimit ? parseInt(schemeForm.familySizeLimit) : undefined
        });
      } else {
        await api.post('/admin/schemes', {
          ...schemeForm,
          incomeLimit: schemeForm.incomeLimit ? parseFloat(schemeForm.incomeLimit) : undefined,
          familySizeLimit: schemeForm.familySizeLimit ? parseInt(schemeForm.familySizeLimit) : undefined
        });
      }
      setSchemeDialog(false);
      setEditingScheme(null);
      fetchData();
    } catch (err) {
      setError('Failed to save scheme');
    }
  };

  const handleEditScheme = (scheme: Scheme) => {
    setEditingScheme(scheme);
    setSchemeForm({
      name: scheme.name,
      description: scheme.description,
      category: scheme.category,
      department: scheme.department,
      benefits: scheme.benefits,
      eligibilityCriteria: scheme.eligibilityCriteria,
      applicationProcess: scheme.applicationProcess,
      requiredDocuments: scheme.requiredDocuments,
      incomeLimit: scheme.incomeLimit?.toString() || '',
      ageLimit: scheme.ageLimit || '',
      familySizeLimit: scheme.familySizeLimit?.toString() || '',
      isActive: scheme.isActive
    });
    setSchemeDialog(true);
  };

  const handleDeleteScheme = async (schemeId: string) => {
    if (window.confirm('Are you sure you want to delete this scheme?')) {
      try {
        await api.delete(`/admin/schemes/${schemeId}`);
        fetchData();
      } catch (err) {
        setError('Failed to delete scheme');
      }
    }
  };

  // Application management functions
  const handleReviewSubmit = async () => {
    try {
      await api.put(`/admin/applications/${reviewingApp!.id}/review`, {
        status: reviewForm.status,
        rejectionReason: reviewForm.status === 'REJECTED' ? reviewForm.rejectionReason : undefined
      });
      setReviewDialog(false);
      setReviewingApp(null);
      fetchData();
    } catch (err) {
      setError('Failed to update application');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      case 'REVIEWED': return 'info';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="xl">
      <Box py={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" gutterBottom>
            {t('admin.dashboard')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingScheme(null);
              setSchemeForm({
                name: '', description: '', category: '', department: '', benefits: '',
                eligibilityCriteria: '', applicationProcess: '', requiredDocuments: '',
                incomeLimit: '', ageLimit: '', familySizeLimit: '', isActive: true
              });
              setSchemeDialog(true);
            }}
          >
            {t('admin.addScheme')}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Tabs value={activeTab} onChange={handleTabChange} aria-label="admin tabs">
          <Tab label={t('admin.manageSchemes')} icon={<AssignmentIcon />} />
          <Tab label={t('admin.manageApplications')} icon={<AnalyticsIcon />} />
          <Tab label={t('admin.manageUsers')} icon={<PeopleIcon />} />
          <Tab label={t('admin.analytics')} icon={<DashboardIcon />} />
        </Tabs>

        {/* Schemes Management */}
        {activeTab === 0 && (
          <Box mt={4}>
            <Grid container spacing={3}>
              {schemes.map((scheme) => (
                <Grid item xs={12} sm={6} md={4} key={scheme.id}>
                  <Card>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Typography variant="h6" gutterBottom>
                          {scheme.name}
                        </Typography>
                        <Chip
                          label={scheme.isActive ? 'Active' : 'Inactive'}
                          color={scheme.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {scheme.department} • {scheme.category}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {scheme.description.substring(0, 100)}...
                      </Typography>
                      <Box display="flex" gap={1} mt={2}>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleEditScheme(scheme)}
                        >
                          {t('admin.editScheme')}
                        </Button>
                        <Button
                          size="small"
                          startIcon={<DeleteIcon />}
                          color="error"
                          onClick={() => handleDeleteScheme(scheme.id)}
                        >
                          {t('admin.deleteScheme')}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Applications Management */}
        {activeTab === 1 && (
          <Box mt={4}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('applications.user')}</TableCell>
                    <TableCell>{t('applications.scheme')}</TableCell>
                    <TableCell>{t('applications.status')}</TableCell>
                    <TableCell>{t('applications.submittedDate')}</TableCell>
                    <TableCell>{t('applications.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <Typography variant="body1">
                          {app.user.firstName} {app.user.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {app.user.email}
                        </Typography>
                      </TableCell>
                      <TableCell>{app.scheme.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={t(`applications.status.${app.status.toLowerCase()}`)}
                          color={getStatusColor(app.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(new Date(app.submittedAt))}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setReviewingApp(app);
                            setReviewForm({
                              status: app.status,
                              rejectionReason: app.rejectionReason || ''
                            });
                            setReviewDialog(true);
                          }}
                        >
                          {t('admin.reviewApplication')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Users Management */}
        {activeTab === 2 && (
          <Box mt={4}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('auth.name')}</TableCell>
                    <TableCell>{t('auth.email')}</TableCell>
                    <TableCell>{t('auth.phone')}</TableCell>
                    <TableCell>{t('auth.state')}</TableCell>
                    <TableCell>{t('auth.role')}</TableCell>
                    <TableCell>{t('auth.status')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Typography variant="body1">
                          {user.firstName} {user.lastName}
                        </Typography>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || 'N/A'}</TableCell>
                      <TableCell>{user.state || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip label={user.role} size="small" color={user.role === 'ADMIN' ? 'primary' : 'default'} />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.isActive ? 'Active' : 'Inactive'}
                          color={user.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Analytics */}
        {activeTab === 3 && (
          <Box mt={4}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="h6" color="text.secondary">
                          {t('admin.totalUsers')}
                        </Typography>
                        <Typography variant="h4" color="primary">
                          {analytics.totalUsers || 0}
                        </Typography>
                      </Box>
                      <PeopleIcon color="primary" sx={{ fontSize: 40 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="h6" color="text.secondary">
                          {t('admin.totalApplications')}
                        </Typography>
                        <Typography variant="h4" color="warning.main">
                          {analytics.totalApplications || 0}
                        </Typography>
                      </Box>
                      <AssignmentIcon color="warning" sx={{ fontSize: 40 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="h6" color="text.secondary">
                          {t('admin.approvedApplications')}
                        </Typography>
                        <Typography variant="h4" color="success.main">
                          {analytics.approvedApplications || 0}
                        </Typography>
                      </Box>
                      <DashboardIcon color="success" sx={{ fontSize: 40 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="h6" color="text.secondary">
                          {t('admin.rejectedApplications')}
                        </Typography>
                        <Typography variant="h4" color="error.main">
                          {analytics.rejectedApplications || 0}
                        </Typography>
                      </Box>
                      <DeleteIcon color="error" sx={{ fontSize: 40 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            {analytics.mostPopularSchemes && analytics.mostPopularSchemes.length > 0 && (
              <Box mt={4}>
                <Typography variant="h6" gutterBottom>
                  {t('admin.mostPopularSchemes')}
                </Typography>
                <Grid container spacing={2}>
                  {analytics.mostPopularSchemes.map((scheme: any, index: number) => (
                    <Grid item xs={12} sm={6} md={4} key={scheme.id}>
                      <Card>
                        <CardContent>
                          <Typography variant="body1" fontWeight="medium">
                            {scheme.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Applications: {scheme.applicationCount}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        )}

        {/* Scheme Dialog */}
        <Dialog open={schemeDialog} onClose={() => setSchemeDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingScheme ? t('admin.editScheme') : t('admin.addScheme')}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('schemes.name')}
                  value={schemeForm.name}
                  onChange={(e) => setSchemeForm({...schemeForm, name: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('schemes.category')}
                  value={schemeForm.category}
                  onChange={(e) => setSchemeForm({...schemeForm, category: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('schemes.department')}
                  value={schemeForm.department}
                  onChange={(e) => setSchemeForm({...schemeForm, department: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('schemes.incomeLimit')}
                  type="number"
                  value={schemeForm.incomeLimit}
                  onChange={(e) => setSchemeForm({...schemeForm, incomeLimit: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('schemes.description')}
                  multiline
                  rows={3}
                  value={schemeForm.description}
                  onChange={(e) => setSchemeForm({...schemeForm, description: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('schemes.benefits')}
                  multiline
                  rows={2}
                  value={schemeForm.benefits}
                  onChange={(e) => setSchemeForm({...schemeForm, benefits: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('schemes.eligibilityCriteria')}
                  multiline
                  rows={3}
                  value={schemeForm.eligibilityCriteria}
                  onChange={(e) => setSchemeForm({...schemeForm, eligibilityCriteria: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('schemes.applicationProcess')}
                  multiline
                  rows={3}
                  value={schemeForm.applicationProcess}
                  onChange={(e) => setSchemeForm({...schemeForm, applicationProcess: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('schemes.requiredDocuments')}
                  multiline
                  rows={2}
                  value={schemeForm.requiredDocuments}
                  onChange={(e) => setSchemeForm({...schemeForm, requiredDocuments: e.target.value})}
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSchemeDialog(false)}>{t('common.cancel')}</Button>
            <Button variant="contained" onClick={handleSchemeSubmit}>
              {editingScheme ? t('admin.saveScheme') : t('admin.addScheme')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Review Dialog */}
        <Dialog open={reviewDialog} onClose={() => setReviewDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{t('admin.reviewApplication')}</DialogTitle>
          <DialogContent>
            {reviewingApp && (
              <Box>
                <Typography variant="body1" gutterBottom>
                  <strong>{t('applications.user')}:</strong> {reviewingApp.user.firstName} {reviewingApp.user.lastName}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>{t('applications.scheme')}:</strong> {reviewingApp.scheme.name}
                </Typography>
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>{t('applications.status')}</InputLabel>
                  <Select
                    value={reviewForm.status}
                    label={t('applications.status')}
                    onChange={(e) => setReviewForm({...reviewForm, status: e.target.value})}
                  >
                    <MenuItem value="REVIEWED">{t('applications.status.reviewed')}</MenuItem>
                    <MenuItem value="APPROVED">{t('applications.status.approved')}</MenuItem>
                    <MenuItem value="REJECTED">{t('applications.status.rejected')}</MenuItem>
                  </Select>
                </FormControl>
                {reviewForm.status === 'REJECTED' && (
                  <TextField
                    fullWidth
                    label={t('admin.rejectionReason')}
                    multiline
                    rows={3}
                    sx={{ mt: 2 }}
                    value={reviewForm.rejectionReason}
                    onChange={(e) => setReviewForm({...reviewForm, rejectionReason: e.target.value})}
                  />
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReviewDialog(false)}>{t('common.cancel')}</Button>
            <Button variant="contained" onClick={handleReviewSubmit}>
              {t('admin.updateApplication')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}