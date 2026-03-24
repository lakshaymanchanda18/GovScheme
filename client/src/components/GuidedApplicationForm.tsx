import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Grid, Card, CardContent, Chip, Button, TextField, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox, Paper, Divider, Stepper, Step, StepLabel, StepContent, Alert, LinearProgress, IconButton, Tooltip, CircularProgress } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { useI18n } from '../hooks/useI18n';
import { useNavigate, useParams } from 'react-router-dom';
import { CameraAlt as CameraIcon, Upload as UploadIcon, Help as HelpIcon, CheckCircle as CheckCircleIcon, Error as ErrorIcon, Info as InfoIcon } from '@mui/icons-material';

interface FormData {
  personalInfo: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  financialInfo: {
    aadharNumber: string;
    panNumber: string;
    income: string;
    occupation: string;
    education: string;
  };
  familyInfo: {
    familySize: string;
    disability: string;
    veteranStatus: string;
  };
  documents: File[];
}

interface DocumentRequirement {
  name: string;
  type: string;
  required: boolean;
  helpText: string;
}

export default function GuidedApplicationForm() {
  const { user, loading: authLoading } = useAuth();
  const { api } = useApi();
  const { t, i18n } = useI18n();
  const navigate = useNavigate();
  const { schemeId } = useParams();
  
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    personalInfo: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      email: user?.email || '',
      address: user?.address || '',
      city: user?.city || '',
      state: user?.state || '',
      pincode: user?.pincode || '',
    },
    financialInfo: {
      aadharNumber: user?.aadharNumber || '',
      panNumber: user?.panNumber || '',
      income: user?.income?.toString() || '',
      occupation: user?.occupation || '',
      education: user?.education || '',
    },
    familyInfo: {
      familySize: user?.familySize?.toString() || '',
      disability: user?.disability || 'No',
      veteranStatus: user?.veteranStatus || 'No',
    },
    documents: []
  });
  
  const [documents, setDocuments] = useState<DocumentRequirement[]>([]);
  const [uploading, setUploading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);

  // Document requirements based on scheme
  const documentRequirements = [
    { name: 'Aadhar Card', type: 'aadhar', required: true, helpText: t('documents.aadharHelp', 'Front and back side of Aadhar card') },
    { name: 'PAN Card', type: 'pan', required: true, helpText: t('documents.panHelp', 'Clear image of PAN card') },
    { name: 'Income Certificate', type: 'income', required: scheme?.incomeLimit ? true : false, helpText: t('documents.incomeHelp', 'Latest income certificate from authorities') },
    { name: 'Bank Passbook', type: 'bank', required: true, helpText: t('documents.bankHelp', 'First page showing account details') },
    { name: 'Ration Card', type: 'ration', required: false, helpText: t('documents.rationHelp', 'If applicable') },
    { name: 'Disability Certificate', type: 'disability', required: formData.familyInfo.disability !== 'No', helpText: t('documents.disabilityHelp', 'Medical certificate for disability') }
  ];

  useEffect(() => {
    fetchScheme();
    setDocuments(documentRequirements);
  }, [schemeId]);

  const fetchScheme = async () => {
    try {
      const data = await api.get(`/schemes/${schemeId}`);
      setScheme(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch scheme');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section: keyof FormData, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, file]
      }));
    }
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      setCameraActive(true);
    } catch (err) {
      setError('Camera access denied. Please allow camera access.');
    }
  };

  const capturePhoto = () => {
    const video = document.getElementById('video') as HTMLVideoElement;
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const context = canvas.getContext('2d');
    
    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataURL = canvas.toDataURL('image/png');
      setPhoto(dataURL);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
      setCameraActive(false);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!(
          formData.personalInfo.firstName &&
          formData.personalInfo.lastName &&
          formData.personalInfo.email &&
          formData.personalInfo.phone &&
          formData.personalInfo.address &&
          formData.personalInfo.city &&
          formData.personalInfo.state
        );
      case 1:
        return !!(
          formData.financialInfo.aadharNumber &&
          formData.financialInfo.income &&
          formData.financialInfo.occupation &&
          formData.financialInfo.education
        );
      case 2:
        return !!(
          formData.familyInfo.familySize &&
          formData.familyInfo.disability &&
          formData.familyInfo.veteranStatus
        );
      case 3:
        return formData.documents.length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    } else {
      setError('Please fill in all required fields for this step.');
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      setError('Please upload all required documents.');
      return;
    }

    try {
      setUploading(true);
      const formDataObj = new FormData();
      
      // Add form data
      formDataObj.append('schemeId', schemeId!);
      formDataObj.append('personalInfo', JSON.stringify(formData.personalInfo));
      formDataObj.append('financialInfo', JSON.stringify(formData.financialInfo));
      formDataObj.append('familyInfo', JSON.stringify(formData.familyInfo));

      // Add documents
      formData.documents.forEach((doc, index) => {
        formDataObj.append(`documents[${index}]`, doc);
      });

      await api.post('/applications', formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate('/applications');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application');
    } finally {
      setUploading(false);
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('auth.firstName')}
                value={formData.personalInfo.firstName}
                onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <Tooltip title={t('documents.firstNameHelp', 'Enter your first name as it appears on your Aadhar card')}>
                      <IconButton size="small">
                        <HelpIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('auth.lastName')}
                value={formData.personalInfo.lastName}
                onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('auth.email')}
                type="email"
                value={formData.personalInfo.email}
                onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                required
                disabled={!!user}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('auth.phone')}
                type="tel"
                value={formData.personalInfo.phone}
                onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <Tooltip title={t('documents.phoneHelp', 'Enter your active mobile number for OTP verification')}>
                      <IconButton size="small">
                        <HelpIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('auth.address')}
                multiline
                rows={2}
                value={formData.personalInfo.address}
                onChange={(e) => handleInputChange('personalInfo', 'address', e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <Tooltip title={t('documents.addressHelp', 'Enter complete address as per your current residence')}>
                      <IconButton size="small">
                        <HelpIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label={t('auth.city')}
                value={formData.personalInfo.city}
                onChange={(e) => handleInputChange('personalInfo', 'city', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label={t('auth.state')}
                value={formData.personalInfo.state}
                onChange={(e) => handleInputChange('personalInfo', 'state', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label={t('auth.pincode')}
                value={formData.personalInfo.pincode}
                onChange={(e) => handleInputChange('personalInfo', 'pincode', e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <Tooltip title={t('documents.pincodeHelp', '6-digit postal code of your area')}>
                      <IconButton size="small">
                        <HelpIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )
                }}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('auth.aadharNumber')}
                value={formData.financialInfo.aadharNumber}
                onChange={(e) => handleInputChange('financialInfo', 'aadharNumber', e.target.value)}
                required
                placeholder="XXXX-XXXX-XXXX"
                InputProps={{
                  startAdornment: (
                    <Tooltip title={t('documents.aadharHelp', '12-digit Aadhar number from your Aadhar card')}>
                      <IconButton size="small">
                        <HelpIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('auth.panNumber')}
                value={formData.financialInfo.panNumber}
                onChange={(e) => handleInputChange('financialInfo', 'panNumber', e.target.value)}
                placeholder="AAAAA1234A"
                InputProps={{
                  startAdornment: (
                    <Tooltip title={t('documents.panHelp', '10-character PAN number from your PAN card')}>
                      <IconButton size="small">
                        <HelpIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('auth.income')}
                type="number"
                value={formData.financialInfo.income}
                onChange={(e) => handleInputChange('financialInfo', 'income', e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <Tooltip title={t('documents.incomeHelp', 'Annual income in rupees. Include all sources of income')}>
                      <IconButton size="small">
                        <HelpIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('auth.occupation')}
                value={formData.financialInfo.occupation}
                onChange={(e) => handleInputChange('financialInfo', 'occupation', e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <Tooltip title={t('documents.occupationHelp', 'Your current occupation or profession')}>
                      <IconButton size="small">
                        <HelpIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('auth.education')}
                value={formData.financialInfo.education}
                onChange={(e) => handleInputChange('financialInfo', 'education', e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <Tooltip title={t('documents.educationHelp', 'Highest educational qualification completed')}>
                      <IconButton size="small">
                        <HelpIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )
                }}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('auth.familySize')}
                type="number"
                value={formData.familyInfo.familySize}
                onChange={(e) => handleInputChange('familyInfo', 'familySize', e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <Tooltip title={t('documents.familySizeHelp', 'Total number of family members living together')}>
                      <IconButton size="small">
                        <HelpIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>{t('auth.disability')}</InputLabel>
                <Select
                  value={formData.familyInfo.disability}
                  label={t('auth.disability')}
                  onChange={(e) => handleInputChange('familyInfo', 'disability', e.target.value)}
                >
                  <MenuItem value="No">No</MenuItem>
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="Partial">Partial</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>{t('auth.veteranStatus')}</InputLabel>
                <Select
                  value={formData.familyInfo.veteranStatus}
                  label={t('auth.veteranStatus')}
                  onChange={(e) => handleInputChange('familyInfo', 'veteranStatus', e.target.value)}
                >
                  <MenuItem value="No">No</MenuItem>
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="Dependent">Dependent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('documents.uploadRequired')}
            </Typography>
            <Grid container spacing={2}>
              {documents.map((doc, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="subtitle2">{doc.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {doc.required ? t('documents.required') : t('documents.optional')}
                          </Typography>
                        </Box>
                        <Box display="flex" gap={1}>
                          <IconButton onClick={handleCameraCapture} color="primary" size="small">
                            <CameraIcon />
                          </IconButton>
                          <IconButton component="label" color="primary" size="small">
                            <UploadIcon />
                            <input type="file" hidden onChange={handleDocumentChange} />
                          </IconButton>
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {doc.helpText}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {formData.documents.length > 0 && (
              <Box mt={3}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('documents.uploadedFiles')}
                </Typography>
                {formData.documents.map((file, index) => (
                  <Chip
                    key={index}
                    label={file.name}
                    icon={<CheckCircleIcon />}
                    color="success"
                    variant="outlined"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  const steps = [
    {
      label: t('application.steps.personal', 'Personal Information'),
      description: t('application.steps.personalDesc', 'Basic personal details and contact information')
    },
    {
      label: t('application.steps.financial', 'Financial Information'),
      description: t('application.steps.financialDesc', 'Income, occupation, and identification details')
    },
    {
      label: t('application.steps.family', 'Family Information'),
      description: t('application.steps.familyDesc', 'Family size and special category information')
    },
    {
      label: t('application.steps.documents', 'Document Upload'),
      description: t('application.steps.documentsDesc', 'Upload required documents and certificates')
    }
  ];

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          {t('application.title')} - {scheme?.name}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Stepper activeStep={activeStep} orientation="vertical">
                  {steps.map((step, index) => (
                    <Step key={step.label}>
                      <StepLabel
                        optional={
                          <Typography variant="caption">{step.description}</Typography>
                        }
                      >
                        {step.label}
                      </StepLabel>
                      <StepContent>
                        {getStepContent(index)}
                        <Box sx={{ mb: 2, mt: 3 }}>
                          <div>
                            <Button
                              variant="contained"
                              onClick={handleNext}
                              sx={{ mt: 1, mr: 1 }}
                              disabled={uploading}
                            >
                              {activeStep === steps.length - 1 ? t('common.submit') : t('common.next')}
                            </Button>
                            <Button
                              disabled={activeStep === 0}
                              onClick={handleBack}
                              sx={{ mt: 1, mr: 1 }}
                            >
                              {t('common.back')}
                            </Button>
                          </div>
                        </Box>
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>

                {activeStep === steps.length && (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
                    <Typography variant="h5" gutterBottom>
                      {t('application.completed')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      {t('application.completedDesc')}
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleSubmit}
                      disabled={uploading}
                      startIcon={uploading ? <CircularProgress size={20} /> : null}
                    >
                      {uploading ? t('application.submitting') : t('application.submit')}
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('application.progress')}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(activeStep / steps.length) * 100} 
                  sx={{ mb: 2 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {Math.round((activeStep / steps.length) * 100)}% {t('application.completed')}
                </Typography>
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="subtitle2" gutterBottom>
                  {t('application.tips')}
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                  <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {t('application.tip1')}
                  </Typography>
                  <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {t('application.tip2')}
                  </Typography>
                  <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {t('application.tip3')}
                  </Typography>
                </Box>
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<InfoIcon />}
                  onClick={() => window.open('/help', '_blank')}
                >
                  {t('application.needHelp')}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Camera Modal */}
        {cameraActive && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.8)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000
            }}
          >
            <Box sx={{ position: 'relative', width: 320, height: 240 }}>
              <video id="video" autoPlay style={{ width: '100%', height: '100%' }} />
              <canvas id="canvas" style={{ display: 'none' }} />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 20,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: 2
                }}
              >
                <Button variant="contained" onClick={capturePhoto}>
                  Capture
                </Button>
                <Button variant="outlined" onClick={stopCamera}>
                  Cancel
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
}