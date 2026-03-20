import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Grid, Card, CardContent, Chip, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tabs, Tab, TextField, Select, MenuItem, InputLabel, FormControl, Alert, LinearProgress, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { useI18n } from '../hooks/useI18n';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, Download as DownloadIcon, Notifications as NotificationsIcon, CheckCircle as CheckCircleIcon, Error as ErrorIcon, Schedule as ScheduleIcon } from '@mui/icons-material';

interface Application {
  id: string;
  scheme: {
    id: string;
    name: string;
    category: string;
    department: string;
    benefits: string;
  };
  status: 'PENDING' | 'REVIEWED' | 'APPROVED' | 'REJECTED' | 'SUBMITTED';
  submittedAt: string;
  reviewedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  documents: string[];
  applicationData: string;
  progress: number;
}

interface Document {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  status: 'pending' | 'uploaded' | 'verified';
}

export default function ApplicationTracker() {
  const { user } = useAuth();
  const { api } = useApi();
  const { t, i18n, formatDate } = useI18n();
  const navigate = useNavigate();
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [documentsDialog, setDocumentsDialog] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await api.get('/applications');
      setApplications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.scheme.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      case 'REVIEWED': return 'info';
      case 'SUBMITTED': return 'warning';
      default: return 'default';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'success';
    if (progress >= 50) return 'info';
    if (progress >= 25) return 'warning';
    return 'error';
  };

  const handleUploadDocument = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('applicationId', selectedApplication!.id);
      
      await api.post('/applications/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Refresh documents
      fetchDocuments(selectedApplication!.id);
    } catch (err) {
      setError('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const fetchDocuments = async (applicationId: string) => {
    try {
      const data = await api.get(`/applications/${applicationId}/documents`);
      setDocuments(data);
    } catch (err) {
      setError('Failed to fetch documents');
    }
  };

  const openDocumentsDialog = (application: Application) => {
    setSelectedApplication(application);
    fetchDocuments(application.id);
    setDocumentsDialog(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircleIcon color="success" />;
      case 'REJECTED': return <ErrorIcon color="error" />;
      case 'REVIEWED': return <ScheduleIcon color="info" />;
      default: return <ScheduleIcon color="action" />;
    }
  };

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          {t('applications.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {t('applications.subtitle')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Dashboard Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6" color="text.secondary">
                      {t('applications.total')}
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {applications.length}
                    </Typography>
                  </Box>
                  <NotificationsIcon color="primary" sx={{ fontSize: 40 }} />
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
                      {t('applications.pending')}
                    </Typography>
                    <Typography variant="h4" color="warning.main">
                      {applications.filter(a => a.status === 'PENDING').length}
                    </Typography>
                  </Box>
                  <ScheduleIcon color="warning" sx={{ fontSize: 40 }} />
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
                      {t('applications.approved')}
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      {applications.filter(a => a.status === 'APPROVED').length}
                    </Typography>
                  </Box>
                  <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
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
                      {t('applications.rejected')}
                    </Typography>
                    <Typography variant="h4" color="error.main">
                      {applications.filter(a => a.status === 'REJECTED').length}
                    </Typography>
                  </Box>
                  <ErrorIcon color="error" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters and Search */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label={t('common.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel>{t('common.filter')}</InputLabel>
                  <Select
                    value={statusFilter}
                    label={t('common.filter')}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">{t('common.all')}</MenuItem>
                    <MenuItem value="PENDING">{t('applications.status.pending')}</MenuItem>
                    <MenuItem value="REVIEWED">{t('applications.status.reviewed')}</MenuItem>
                    <MenuItem value="APPROVED">{t('applications.status.approved')}</MenuItem>
                    <MenuItem value="REJECTED">{t('applications.status.rejected')}</MenuItem>
                    <MenuItem value="SUBMITTED">{t('applications.status.submitted')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box display="flex" gap={1}>
                  <Button
                    variant={activeTab === 0 ? "contained" : "outlined"}
                    onClick={() => setActiveTab(0)}
                  >
                    {t('applications.allSchemes')}
                  </Button>
                  <Button
                    variant={activeTab === 1 ? "contained" : "outlined"}
                    onClick={() => setActiveTab(1)}
                  >
                    {t('applications.newApplication')}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Applications Table */}
        {loading ? (
          <Box sx={{ width: '100%', mt: 3 }}>
            <LinearProgress />
          </Box>
        ) : filteredApplications.length === 0 ? (
          <Alert severity="info" sx={{ mt: 3 }}>
            {t('applications.noApplications')}
          </Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('applications.schemeName')}</TableCell>
                  <TableCell>{t('applications.category')}</TableCell>
                  <TableCell>{t('applications.status')}</TableCell>
                  <TableCell>{t('applications.submittedDate')}</TableCell>
                  <TableCell>{t('applications.progress')}</TableCell>
                  <TableCell>{t('applications.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {app.scheme.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {app.scheme.department}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={app.scheme.category} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getStatusIcon(app.status)}
                        <Chip
                          label={t(`applications.status.${app.status.toLowerCase()}`)}
                          size="small"
                          color={getStatusColor(app.status) as any}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      {formatDate(new Date(app.submittedAt))}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <LinearProgress 
                          variant="determinate" 
                          value={app.progress} 
                          color={getProgressColor(app.progress) as any}
                          sx={{ width: 100 }}
                        />
                        <Typography variant="body2">
                          {app.progress}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Button
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/schemes/${app.scheme.id}`)}
                        >
                          {t('schemes.viewDetails')}
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => openDocumentsDialog(app)}
                        >
                          {t('applications.uploadDocuments')}
                        </Button>
                        {app.rejectionReason && (
                          <Button
                            size="small"
                            color="error"
                            onClick={() => alert(`${t('applications.rejectionReason')}: ${app.rejectionReason}`)}
                          >
                            {t('applications.viewReason')}
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Documents Dialog */}
        <Dialog open={documentsDialog} onClose={() => setDocumentsDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedApplication?.scheme.name} - {t('applications.documentsRequired')}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  {t('applications.uploadDocuments')}
                </Typography>
                <Box border="2px dashed" borderColor="grey.300" borderRadius={2} p={3} textAlign="center">
                  <UploadIcon sx={{ fontSize: 40, color: 'grey.500', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {t('applications.dragDrop')}
                  </Typography>
                  <Button
                    variant="contained"
                    component="label"
                    sx={{ mt: 2 }}
                    disabled={uploading}
                  >
                    {uploading ? t('common.uploading') : t('common.upload')}
                    <input type="file" hidden onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleUploadDocument(e.target.files[0]);
                      }
                    }} />
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  {t('applications.uploadedDocuments')}
                </Typography>
                <List>
                  {documents.map((doc) => (
                    <ListItem key={doc.id}>
                      <ListItemIcon>
                        {doc.status === 'uploaded' ? <UploadIcon color="success" /> : <ScheduleIcon color="action" />}
                      </ListItemIcon>
                      <ListItemText
                        primary={doc.name}
                        secondary={`${doc.type} • ${formatDate(new Date(doc.uploadedAt))}`}
                      />
                      <Chip
                        label={t(`applications.documentStatus.${doc.status}`)}
                        size="small"
                        color={doc.status === 'uploaded' ? 'success' : 'default'}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDocumentsDialog(false)}>{t('common.close')}</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}