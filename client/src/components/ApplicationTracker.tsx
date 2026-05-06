import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Typography, Grid, Card, CardContent, Chip, Button, 
  Tabs, Tab, TextField, Select, MenuItem, InputLabel, FormControl, Alert, 
  LinearProgress, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, 
  List, ListItem, ListItemText, ListItemIcon, Fade, Stepper, Step, StepLabel,
  InputAdornment, Avatar
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { useI18n } from '../hooks/useI18n';
import { useNavigate } from 'react-router-dom';
import { 
  Upload as UploadIcon, Notifications as NotificationsIcon, 
  CheckCircle as CheckCircleIcon, Error as ErrorIcon, 
  Schedule as ScheduleIcon, Search as SearchIcon, 
  FilterList as FilterListIcon, Description as DescriptionIcon,
  Timeline as TimelineIcon, CloudUpload as CloudUploadIcon
} from '@mui/icons-material';

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
  name?: string;
  originalName?: string;
  type?: string;
  mimeType?: string;
  uploadedAt: string;
  status?: string;
  verified?: boolean;
}

const statusSteps = ['SUBMITTED', 'PENDING', 'REVIEWED', 'APPROVED'];

export default function ApplicationTracker() {
  const { user } = useAuth();
  const { api } = useApi();
  const { t, formatDate } = useI18n();
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
  const [readiness, setReadiness] = useState<{ readinessPercent: number; missingDocuments: string[] } | null>(null);
  const [readinessByApp, setReadinessByApp] = useState<Record<string, number>>({});
  const [statusDialog, setStatusDialog] = useState(false);
  const [statusUpdates, setStatusUpdates] = useState<any[]>([]);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await api.get('/applications');
      const apps = Array.isArray(data) ? data : [];
      setApplications(apps);
      
      const map: Record<string, number> = {};
      apps.forEach((app: Application) => {
        map[app.id] = app.status === 'APPROVED' ? 100 : (app.status === 'PENDING' ? 80 : 100);
      });
      setReadinessByApp(map);
    } catch (err: any) {
      setError(err.error || err.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
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
      default: return 'warning';
    }
  };

  const handleUploadDocument = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('applicationId', selectedApplication!.id);
      
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      fetchDocuments(selectedApplication!.id);
    } catch (err: any) {
      setError(err.error || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const fetchDocuments = async (applicationId: string) => {
    try {
      const data = await api.get(`/documents/application/${applicationId}`);
      setDocuments(Array.isArray(data) ? data : []);
      setReadiness({ readinessPercent: data.length > 0 ? 100 : 0, missingDocuments: [] });
    } catch (err: any) {
      setError(err.error || 'Failed to fetch documents');
    }
  };

  const openDocumentsDialog = (application: Application) => {
    setSelectedApplication(application);
    fetchDocuments(application.id);
    setDocumentsDialog(true);
  };

  const openStatusDialog = async (application: Application) => {
    setSelectedApplication(application);
    try {
      const data = await api.get(`/applications/${application.id}/history`);
      setStatusUpdates(Array.isArray(data) ? data : []);
    } catch {
      setStatusUpdates([]);
    }
    setStatusDialog(true);
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)', pb: 8 }}>
      {/* Hero Section */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', 
        pt: { xs: 8, md: 10 }, pb: { xs: 10, md: 12 }, px: 2,
        color: 'white', position: 'relative', overflow: 'hidden'
      }}>
        {/* Decorative elements */}
        <Box sx={{ position: 'absolute', top: -50, right: -50, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(40px)' }} />
        
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" fontWeight="800" sx={{ mb: 2, fontFamily: "'Outfit', sans-serif" }}>
                My Applications
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 300, fontFamily: "'Inter', sans-serif" }}>
                Track the status of your government scheme applications in real-time.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: { md: 'flex-end' } }}>
                <Button 
                  variant="contained" 
                  onClick={() => navigate('/schemes')}
                  sx={{ 
                    borderRadius: '12px', px: 4, py: 1.5,
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white', '&:hover': { background: 'rgba(255,255,255,0.3)' }
                  }}
                >
                  Discover New Schemes
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: -6, position: 'relative', zIndex: 2 }}>
        
        {/* Analytics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { title: 'Total Applications', count: applications.length, icon: <NotificationsIcon sx={{fontSize: 40, color: '#4f46e5'}} />, bg: '#fff' },
            { title: 'Pending Review', count: applications.filter(a => a.status === 'PENDING').length, icon: <ScheduleIcon sx={{fontSize: 40, color: '#f59e0b'}} />, bg: '#fff' },
            { title: 'Approved', count: applications.filter(a => a.status === 'APPROVED').length, icon: <CheckCircleIcon sx={{fontSize: 40, color: '#10b981'}} />, bg: '#fff' },
            { title: 'Rejected', count: applications.filter(a => a.status === 'REJECTED').length, icon: <ErrorIcon sx={{fontSize: 40, color: '#ef4444'}} />, bg: '#fff' },
          ].map((stat, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card sx={{ 
                borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', 
                transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)' }
              }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                      {stat.title}
                    </Typography>
                    <Typography variant="h3" fontWeight="800" sx={{ mt: 1, fontFamily: "'Outfit', sans-serif" }}>
                      {stat.count}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, borderRadius: '16px', background: 'rgba(0,0,0,0.04)' }}>
                    {stat.icon}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Filters */}
        <Card sx={{ borderRadius: '20px', mb: 4, boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search applications by scheme name or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>,
                    sx: { borderRadius: '12px', background: '#f8fafc' }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    displayEmpty
                    sx={{ borderRadius: '12px', background: '#f8fafc' }}
                    renderValue={(val) => {
                      if (val === 'all') return <Box display="flex" alignItems="center" gap={1}><FilterListIcon/> All Statuses</Box>;
                      return <Box display="flex" alignItems="center" gap={1}><FilterListIcon/> {val}</Box>;
                    }}
                  >
                    <MenuItem value="all">All Statuses</MenuItem>
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="REVIEWED">Reviewed</MenuItem>
                    <MenuItem value="APPROVED">Approved</MenuItem>
                    <MenuItem value="REJECTED">Rejected</MenuItem>
                    <MenuItem value="SUBMITTED">Submitted</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button 
                  fullWidth variant="contained" 
                  sx={{ borderRadius: '12px', py: 1.5, background: '#4f46e5', '&:hover': { background: '#4338ca' } }}
                  onClick={fetchApplications}
                >
                  Refresh
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setError(null)}>{error}</Alert>}

        {/* Application Cards List */}
        {loading ? (
          <Box sx={{ width: '100%', mt: 3 }}><LinearProgress /></Box>
        ) : filteredApplications.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Box 
              sx={{ 
                width: 120, height: 120, borderRadius: '50%', 
                background: 'rgba(79, 70, 229, 0.05)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                mx: 'auto', mb: 2 
              }}
            >
              <DescriptionIcon sx={{ fontSize: 64, color: 'rgba(79, 70, 229, 0.3)' }} />
            </Box>
            <Typography variant="h5" color="text.secondary" fontFamily="'Outfit', sans-serif" mt={3}>No applications found.</Typography>
            <Button variant="outlined" sx={{ mt: 2, borderRadius: '12px' }} onClick={() => navigate('/schemes')}>Browse Schemes</Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredApplications.map((app, idx) => {
              const currentStepIndex = statusSteps.indexOf(app.status);
              const activeStep = currentStepIndex === -1 ? 0 : currentStepIndex;

              return (
                <Grid item xs={12} key={app.id}>
                  <Fade in={true} style={{ transitionDelay: `${idx * 100}ms` }}>
                    <Card sx={{ 
                      borderRadius: '24px', overflow: 'visible',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
                      border: '1px solid rgba(0,0,0,0.05)'
                    }}>
                      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                        <Grid container spacing={4} alignItems="center">
                          <Grid item xs={12} md={4}>
                            <Box display="flex" gap={2} alignItems="center" mb={1}>
                              <Avatar sx={{ bgcolor: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5', width: 56, height: 56 }}>
                                <DescriptionIcon />
                              </Avatar>
                              <Box>
                                <Typography variant="h6" fontWeight="bold" fontFamily="'Outfit', sans-serif">
                                  {app.scheme.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {app.scheme.department} • Applied {formatDate(new Date(app.submittedAt))}
                                </Typography>
                              </Box>
                            </Box>
                            <Box mt={2}>
                              <Chip label={app.scheme.category} size="small" sx={{ mr: 1, background: '#f1f5f9' }} />
                              <Chip 
                                label={app.status} 
                                size="small" 
                                color={getStatusColor(app.status) as any} 
                                sx={{ fontWeight: 'bold' }} 
                              />
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12} md={5}>
                            <Box sx={{ width: '100%', py: 2 }}>
                              <Stepper activeStep={app.status === 'REJECTED' ? 1 : activeStep} alternativeLabel>
                                {statusSteps.map((label, index) => {
                                  const stepProps: { completed?: boolean; error?: boolean } = {};
                                  if (app.status === 'REJECTED' && index === 1) {
                                    stepProps.error = true;
                                  }
                                  return (
                                    <Step key={label} {...stepProps}>
                                      <StepLabel error={stepProps.error}>
                                        {label}
                                        {stepProps.error && <Typography variant="caption" color="error" display="block">Rejected</Typography>}
                                      </StepLabel>
                                    </Step>
                                  );
                                })}
                              </Stepper>
                            </Box>
                          </Grid>

                          <Grid item xs={12} md={3}>
                            <Box display="flex" flexDirection="column" gap={1.5}>
                              <Button 
                                variant="contained" 
                                fullWidth
                                startIcon={<CloudUploadIcon />}
                                onClick={() => openDocumentsDialog(app)}
                                sx={{ borderRadius: '12px', background: '#4f46e5', '&:hover': { background: '#4338ca' } }}
                              >
                                Manage Documents
                              </Button>
                              <Button 
                                variant="outlined" 
                                fullWidth
                                startIcon={<TimelineIcon />}
                                onClick={() => openStatusDialog(app)}
                                sx={{ borderRadius: '12px' }}
                              >
                                View Timeline
                              </Button>
                              {app.rejectionReason && (
                                <Alert severity="error" sx={{ mt: 1, borderRadius: '12px', py: 0 }}>
                                  {app.rejectionReason}
                                </Alert>
                              )}
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Documents Dialog */}
        <Dialog open={documentsDialog} onClose={() => setDocumentsDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}>
          <DialogTitle sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 'bold' }}>
            Document Vault
          </DialogTitle>
          <DialogContent>
            <Box mb={4} p={3} sx={{ background: '#f8fafc', borderRadius: '16px', border: '2px dashed #cbd5e1', textAlign: 'center' }}>
              <CloudUploadIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 1 }} />
              <Typography variant="h6" color="text.secondary" fontFamily="'Outfit', sans-serif">Upload Required Documents</Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>PDF, JPG or PNG (Max 5MB)</Typography>
              <Button variant="contained" component="label" disabled={uploading} sx={{ borderRadius: '12px', px: 4, py: 1.5 }}>
                {uploading ? 'Uploading...' : 'Browse Files'}
                <input type="file" hidden onChange={(e) => {
                  if (e.target.files && e.target.files[0]) handleUploadDocument(e.target.files[0]);
                }} />
              </Button>
            </Box>

            <Typography variant="h6" fontFamily="'Outfit', sans-serif" mb={2}>Uploaded Files</Typography>
            {documents.length === 0 ? (
              <Typography color="text.secondary" variant="body2">No documents uploaded yet.</Typography>
            ) : (
              <List sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
                {documents.map((doc) => (
                  <ListItem key={doc.id} sx={{ background: '#f1f5f9', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <ListItemIcon>
                      {doc.verified ? <CheckCircleIcon color="success" /> : <DescriptionIcon color="primary" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={doc.originalName || doc.name}
                      secondary={formatDate(new Date(doc.uploadedAt))}
                      primaryTypographyProps={{ fontWeight: 'bold' }}
                    />
                    <Chip label={doc.verified ? 'Verified' : 'Pending Review'} size="small" color={doc.verified ? 'success' : 'warning'} />
                  </ListItem>
                ))}
              </List>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setDocumentsDialog(false)} sx={{ borderRadius: '12px' }}>Close Vault</Button>
          </DialogActions>
        </Dialog>

        {/* Status Updates Dialog */}
        <Dialog open={statusDialog} onClose={() => setStatusDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}>
          <DialogTitle sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 'bold' }}>Application Timeline</DialogTitle>
          <DialogContent>
            {statusUpdates.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: '12px' }}>No timeline events found.</Alert>
            ) : (
              <List>
                {statusUpdates.map((u, i) => (
                  <ListItem key={u.id} sx={{ position: 'relative', pb: 4 }}>
                    {/* Line connector */}
                    {i !== statusUpdates.length - 1 && (
                      <Box sx={{ position: 'absolute', left: 28, top: 40, bottom: -10, width: 2, background: '#e2e8f0' }} />
                    )}
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: '#4f46e5', width: 32, height: 32 }}>
                        <CheckCircleIcon sx={{ fontSize: 20 }} />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={<Typography fontWeight="bold">{u.status}</Typography>}
                      secondary={new Date(u.createdAt).toLocaleString()}
                    />
                    <Chip label={u.source} size="small" variant="outlined" />
                  </ListItem>
                ))}
              </List>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setStatusDialog(false)} sx={{ borderRadius: '12px' }}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
