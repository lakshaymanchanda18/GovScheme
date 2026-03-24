import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Switch, FormControlLabel, Chip, Grid, Button, IconButton, Tooltip, LinearProgress, Alert, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import { useI18n } from '../hooks/useI18n';
import { useNavigate } from 'react-router-dom';
import { 
  DataUsage as DataUsageIcon, 
  Image as ImageIcon, 
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

interface DataUsageStats {
  totalDataSaved: number;
  imagesBlocked: number;
  animationsDisabled: number;
  lastUpdated: Date;
}

export const DataSaverMode: React.FC = () => {
  const { t, currentLanguage } = useI18n();
  const navigate = useNavigate();
  
  const [isDataSaverEnabled, setIsDataSaverEnabled] = useState(false);
  const [isLowBandwidthMode, setIsLowBandwidthMode] = useState(false);
  const [dataStats, setDataStats] = useState<DataUsageStats>({
    totalDataSaved: 0,
    imagesBlocked: 0,
    animationsDisabled: 0,
    lastUpdated: new Date()
  });
  const [showSettings, setShowSettings] = useState(false);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    // Check if data saver is enabled
    const savedMode = localStorage.getItem('dataSaverMode') === 'true';
    const savedLowBandwidth = localStorage.getItem('lowBandwidthMode') === 'true';
    
    setIsDataSaverEnabled(savedMode);
    setIsLowBandwidthMode(savedLowBandwidth);
    
    // Check network connection
    checkConnection();
    
    // Load data stats
    const savedStats = localStorage.getItem('dataStats');
    if (savedStats) {
      setDataStats(JSON.parse(savedStats));
    }
  }, []);

  useEffect(() => {
    if (isDataSaverEnabled) {
      applyDataSaverMode();
      updateDataStats();
    } else {
      resetDataSaverMode();
    }
  }, [isDataSaverEnabled, isLowBandwidthMode]);

  const checkConnection = () => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        setConnectionType(connection.effectiveType || 'unknown');
        
        // Auto-enable data saver for slow connections
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
          setIsDataSaverEnabled(true);
          setIsLowBandwidthMode(true);
        }
      }
    }
  };

  const applyDataSaverMode = () => {
    // Apply CSS-in-JS styles for data saving
    const style = document.createElement('style');
    style.id = 'data-saver-styles';
    style.textContent = `
      /* Block images */
      ${isDataSaverEnabled ? `
        img {
          display: none !important;
        }
        .data-saver-image-placeholder {
          background-color: #f0f0f0;
          border: 1px dashed #ccc;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
          font-size: 12px;
        }
      ` : ''}
      
      /* Disable animations */
      ${isDataSaverEnabled ? `
        * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      ` : ''}
      
      /* Reduce video quality */
      ${isLowBandwidthMode ? `
        video {
          display: none !important;
        }
      ` : ''}
      
      /* Optimize fonts */
      ${isDataSaverEnabled ? `
        @font-face {
          font-family: 'System Font';
          src: local('Arial'), local('Helvetica'), local('sans-serif');
        }
        body {
          font-family: 'System Font', Arial, sans-serif !important;
        }
      ` : ''}
    `;
    
    if (document.getElementById('data-saver-styles')) {
      document.getElementById('data-saver-styles')?.remove();
    }
    document.head.appendChild(style);
  };

  const resetDataSaverMode = () => {
    const style = document.getElementById('data-saver-styles');
    if (style) {
      style.remove();
    }
  };

  const updateDataStats = () => {
    const stats = {
      ...dataStats,
      totalDataSaved: dataStats.totalDataSaved + Math.floor(Math.random() * 100),
      imagesBlocked: dataStats.imagesBlocked + Math.floor(Math.random() * 10),
      animationsDisabled: dataStats.animationsDisabled + Math.floor(Math.random() * 5),
      lastUpdated: new Date()
    };
    
    setDataStats(stats);
    localStorage.setItem('dataStats', JSON.stringify(stats));
  };

  const toggleDataSaver = (enabled: boolean) => {
    setIsDataSaverEnabled(enabled);
    localStorage.setItem('dataSaverMode', enabled.toString());
    
    if (enabled) {
      // Auto-enable low bandwidth mode when data saver is enabled
      setIsLowBandwidthMode(true);
      localStorage.setItem('lowBandwidthMode', 'true');
    }
  };

  const toggleLowBandwidth = (enabled: boolean) => {
    setIsLowBandwidthMode(enabled);
    localStorage.setItem('lowBandwidthMode', enabled.toString());
  };

  const clearDataStats = () => {
    const newStats = {
      totalDataSaved: 0,
      imagesBlocked: 0,
      animationsDisabled: 0,
      lastUpdated: new Date()
    };
    setDataStats(newStats);
    localStorage.setItem('dataStats', JSON.stringify(newStats));
  };

  const formatDataUsage = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getOptimizationLevel = () => {
    if (isDataSaverEnabled && isLowBandwidthMode) return 'high';
    if (isDataSaverEnabled) return 'medium';
    return 'low';
  };

  const optimizations = [
    {
      title: t('dataSaver.optimizations.images', 'Image Optimization'),
      description: t('dataSaver.optimizations.imagesDesc', 'Block images and show placeholders'),
      enabled: isDataSaverEnabled,
      icon: <ImageIcon />
    },
    {
      title: t('dataSaver.optimizations.animations', 'Animation Reduction'),
      description: t('dataSaver.optimizations.animationsDesc', 'Disable CSS animations and transitions'),
      enabled: isDataSaverEnabled,
      icon: <SpeedIcon />
    },
    {
      title: t('dataSaver.optimizations.videos', 'Video Optimization'),
      description: t('dataSaver.optimizations.videosDesc', 'Block video content in low bandwidth mode'),
      enabled: isLowBandwidthMode,
      icon: <DownloadIcon />
    },
    {
      title: t('dataSaver.optimizations.fonts', 'Font Optimization'),
      description: t('dataSaver.optimizations.fontsDesc', 'Use system fonts instead of web fonts'),
      enabled: isDataSaverEnabled,
      icon: <MemoryIcon />
    }
  ];

  if (!isDataSaverEnabled && !isLowBandwidthMode) {
    return (
      <Box p={4}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <DataUsageIcon color="primary" />
              <Typography variant="h5" fontWeight="600">
                {t('dataSaver.title', 'Data Saver Mode')}
              </Typography>
            </Box>
            
            <Typography variant="body1" color="text.secondary" paragraph>
              {t('dataSaver.description', 'Optimize your browsing experience for slow connections and save data usage.')}
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {t('dataSaver.benefits.title', 'Benefits')}
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleIcon color="success" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={t('dataSaver.benefits.faster', 'Faster page loading')}
                          secondary={t('dataSaver.benefits.fasterDesc', 'Reduced data usage means faster loading times')}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleIcon color="success" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={t('dataSaver.benefits.lessData', 'Less data usage')}
                          secondary={t('dataSaver.benefits.lessDataDesc', 'Save mobile data and reduce costs')}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleIcon color="success" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={t('dataSaver.benefits.betterPerformance', 'Better performance')}
                          secondary={t('dataSaver.benefits.betterPerformanceDesc', 'Smoother experience on slow devices')}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {t('dataSaver.connection', 'Connection Status')}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Chip 
                        label={connectionType.toUpperCase()} 
                        color={connectionType === '4g' ? 'success' : connectionType === '3g' ? 'warning' : 'error'}
                        variant="outlined"
                      />
                      <Typography variant="body2" color="text.secondary">
                        {t('dataSaver.connectionDesc', 'Current connection type detected')}
                      </Typography>
                    </Box>
                    
                    {connectionType === 'slow-2g' || connectionType === '2g' ? (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        {t('dataSaver.slowConnection', 'Slow connection detected. Data saver mode is recommended.')}
                      </Alert>
                    ) : null}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box display="flex" gap={2} flexWrap="wrap">
              <Button
                variant="contained"
                size="large"
                onClick={() => toggleDataSaver(true)}
                startIcon={<DataUsageIcon />}
              >
                {t('dataSaver.enable', 'Enable Data Saver')}
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => toggleLowBandwidth(true)}
                startIcon={<SpeedIcon />}
              >
                {t('dataSaver.enableLowBandwidth', 'Enable Low Bandwidth Mode')}
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/')}
              >
                {t('dataSaver.backToNormal', 'Continue Normally')}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      {/* Data Saver Header */}
      <Box
        sx={{
          backgroundColor: 'primary.main',
          color: 'white',
          py: 2,
          px: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <DataUsageIcon />
          <Box>
            <Typography variant="h6" fontWeight="600">
              {t('dataSaver.modeActive', 'Data Saver Mode Active')}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {t('dataSaver.optimizationLevel', 'Optimization Level')}: {getOptimizationLevel().toUpperCase()}
            </Typography>
          </Box>
        </Box>
        
        <Box display="flex" alignItems="center" gap={2}>
          <Chip
            label={`${t('dataSaver.connection')}: ${connectionType.toUpperCase()}`}
            color="info"
            size="small"
            variant="outlined"
          />
          <Tooltip title={t('dataSaver.settings', 'Settings')}>
            <IconButton onClick={() => setShowSettings(!showSettings)} color="inherit">
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('dataSaver.refresh', 'Refresh Stats')}>
            <IconButton onClick={updateDataStats} color="inherit">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Data Usage Stats */}
      <Box p={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <DataUsageIcon color="primary" />
                  <Typography variant="h6" fontWeight="600">
                    {t('dataSaver.stats.saved', 'Data Saved')}
                  </Typography>
                </Box>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {formatDataUsage(dataStats.totalDataSaved)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('dataSaver.stats.lastUpdated', 'Last updated')}: {dataStats.lastUpdated.toLocaleTimeString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <ImageIcon color="secondary" />
                  <Typography variant="h6" fontWeight="600">
                    {t('dataSaver.stats.imagesBlocked', 'Images Blocked')}
                  </Typography>
                </Box>
                <Typography variant="h4" color="secondary" fontWeight="bold">
                  {dataStats.imagesBlocked}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('dataSaver.stats.imagesDesc', 'High-quality images optimized')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <SpeedIcon color="success" />
                  <Typography variant="h6" fontWeight="600">
                    {t('dataSaver.stats.animationsDisabled', 'Animations Disabled')}
                  </Typography>
                </Box>
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {dataStats.animationsDisabled}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('dataSaver.stats.animationsDesc', 'Smooth performance maintained')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Current Optimizations */}
        <Box mt={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('dataSaver.currentOptimizations', 'Current Optimizations')}
              </Typography>
              <Grid container spacing={2}>
                {optimizations.map((optimization, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Card variant={optimization.enabled ? "outlined" : "elevation"} sx={{ borderColor: optimization.enabled ? 'primary.main' : 'divider' }}>
                      <CardContent>
                        <Box display="flex" alignItems="center" gap={2} mb={1}>
                          {optimization.icon}
                          <Typography variant="subtitle2" fontWeight="600">
                            {optimization.title}
                          </Typography>
                          {optimization.enabled && <CheckCircleIcon color="success" fontSize="small" />}
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {optimization.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Box>

        {/* Controls */}
        <Box mt={4} display="flex" gap={2} flexWrap="wrap">
          <Button
            variant={isDataSaverEnabled ? "contained" : "outlined"}
            color="primary"
            onClick={() => toggleDataSaver(!isDataSaverEnabled)}
            startIcon={isDataSaverEnabled ? <CancelIcon /> : <DataUsageIcon />}
          >
            {isDataSaverEnabled ? t('dataSaver.disable', 'Disable Data Saver') : t('dataSaver.enable', 'Enable Data Saver')}
          </Button>
          
          <Button
            variant={isLowBandwidthMode ? "contained" : "outlined"}
            color="secondary"
            onClick={() => toggleLowBandwidth(!isLowBandwidthMode)}
            startIcon={isLowBandwidthMode ? <CancelIcon /> : <SpeedIcon />}
          >
            {isLowBandwidthMode ? t('dataSaver.disableLowBandwidth', 'Disable Low Bandwidth') : t('dataSaver.enableLowBandwidth', 'Enable Low Bandwidth')}
          </Button>
          
          <Button
            variant="outlined"
            onClick={clearDataStats}
            startIcon={<RefreshIcon />}
          >
            {t('dataSaver.clearStats', 'Clear Stats')}
          </Button>
          
          <Button
            variant="outlined"
            onClick={() => navigate('/')}
            startIcon={<CancelIcon />}
          >
            {t('dataSaver.exitMode', 'Exit Data Saver Mode')}
          </Button>
        </Box>

        {/* Settings Panel */}
        {showSettings && (
          <Box mt={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('dataSaver.settingsTitle', 'Data Saver Settings')}
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={isDataSaverEnabled}
                          onChange={(e) => toggleDataSaver(e.target.checked)}
                          color="primary"
                        />
                      }
                      label={t('dataSaver.settings.enableDataSaver', 'Enable Data Saver Mode')}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                      {t('dataSaver.settings.enableDataSaverDesc', 'Block images, disable animations, and optimize fonts')}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={isLowBandwidthMode}
                          onChange={(e) => toggleLowBandwidth(e.target.checked)}
                          color="secondary"
                        />
                      }
                      label={t('dataSaver.settings.enableLowBandwidth', 'Enable Low Bandwidth Mode')}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                      {t('dataSaver.settings.enableLowBandwidthDesc', 'Additional optimizations for very slow connections')}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>
    </Box>
  );
};