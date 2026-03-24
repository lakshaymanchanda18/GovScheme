import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Switch, FormControlLabel, Slider, Select, MenuItem, Chip, Grid, Button, IconButton, Tooltip, List, ListItem, ListItemText, ListItemIcon, Alert, Collapse, Divider } from '@mui/material';
import { useI18n } from '../hooks/useI18n';
import { useNavigate } from 'react-router-dom';
import { 
  Settings as SettingsIcon, 
  Accessibility as AccessibilityIcon, 
  DataUsage as DataUsageIcon, 
  Security as SecurityIcon,
  Language as LanguageIcon,
  Contrast as ContrastIcon,
  TextIncrease as TextIncreaseIcon,
  Visibility as VisibilityIcon,
  Keyboard as KeyboardIcon,
  Mouse as MouseIcon,
  VolumeUp as VolumeUpIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { SUPPORTED_LANGUAGES } from '../locales/languages';

interface SettingsState {
  lowBandwidth: boolean;
  kioskMode: boolean;
  assistedMode: boolean;
  simpleMode: boolean;
  highContrast: boolean;
  fontSize: number;
  reduceAnimations: boolean;
  screenReaderMode: boolean;
  keyboardNavigation: boolean;
  focusIndicator: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  dyslexiaFriendly: boolean;
  audioAssistance: boolean;
  touchTargetSize: 'normal' | 'large' | 'extra-large';
}

export const SettingsPage: React.FC = () => {
  const { t, currentLanguage, switchLanguage } = useI18n();
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState<SettingsState>({
    lowBandwidth: false,
    kioskMode: false,
    assistedMode: false,
    simpleMode: false,
    highContrast: false,
    fontSize: 100,
    reduceAnimations: false,
    screenReaderMode: false,
    keyboardNavigation: true,
    focusIndicator: true,
    colorBlindMode: 'none',
    dyslexiaFriendly: false,
    audioAssistance: false,
    touchTargetSize: 'normal'
  });
  
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    // Load saved settings
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  useEffect(() => {
    applySettings();
  }, [settings]);

  const applySettings = () => {
    setIsApplying(true);
    
    // Apply CSS-in-JS styles
    const style = document.createElement('style');
    style.id = 'app-settings-styles';
    
    let cssRules = '';
    
    // Low bandwidth mode
    if (settings.lowBandwidth) {
      cssRules += `
        img {
          display: none !important;
        }
        .data-saver-placeholder {
          background-color: #f0f0f0;
          border: 1px dashed #ccc;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
          font-size: 12px;
        }
      `;
    }
    
    // Kiosk mode
    if (settings.kioskMode) {
      cssRules += `
        * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `;
    }
    
    // Simple mode
    if (settings.simpleMode) {
      cssRules += `
        .complex-element {
          display: none !important;
        }
      `;
    }
    
    // High contrast mode
    if (settings.highContrast) {
      cssRules += `
        * {
          background-color: #000 !important;
          color: #fff !important;
          border-color: #fff !important;
        }
        a, button, input, select, textarea {
          background-color: #fff !important;
          color: #000 !important;
          border: 2px solid #000 !important;
        }
      `;
    }
    
    // Font size adjustment
    if (settings.fontSize !== 100) {
      cssRules += `
        html, body {
          font-size: ${settings.fontSize}% !important;
        }
      `;
    }
    
    // Reduce animations
    if (settings.reduceAnimations) {
      cssRules += `
        * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      `;
    }
    
    // Focus indicators
    if (settings.focusIndicator) {
      cssRules += `
        *:focus {
          outline: 3px solid #007bff !important;
          outline-offset: 2px !important;
        }
        button:focus, input:focus, select:focus, textarea:focus, a:focus {
          box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.25) !important;
        }
      `;
    }
    
    // Touch target size
    if (settings.touchTargetSize === 'large') {
      cssRules += `
        button, input, select, textarea, a {
          min-height: 48px !important;
          min-width: 48px !important;
          padding: 12px 16px !important;
        }
      `;
    } else if (settings.touchTargetSize === 'extra-large') {
      cssRules += `
        button, input, select, textarea, a {
          min-height: 60px !important;
          min-width: 60px !important;
          padding: 16px 20px !important;
        }
      `;
    }
    
    style.textContent = cssRules;
    
    // Remove existing styles
    const existingStyle = document.getElementById('app-settings-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    document.head.appendChild(style);
    
    // Save settings
    localStorage.setItem('appSettings', JSON.stringify(settings));
    
    // Update body classes
    document.body.classList.toggle('low-bandwidth', settings.lowBandwidth);
    document.body.classList.toggle('kiosk-mode', settings.kioskMode);
    document.body.classList.toggle('assisted-mode', settings.assistedMode);
    document.body.classList.toggle('simple-mode', settings.simpleMode);
    
    setTimeout(() => setIsApplying(false), 100);
  };

  const updateSetting = (key: keyof SettingsState, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    const defaultSettings: SettingsState = {
      lowBandwidth: false,
      kioskMode: false,
      assistedMode: false,
      simpleMode: false,
      highContrast: false,
      fontSize: 100,
      reduceAnimations: false,
      screenReaderMode: false,
      keyboardNavigation: true,
      focusIndicator: true,
      colorBlindMode: 'none',
      dyslexiaFriendly: false,
      audioAssistance: false,
      touchTargetSize: 'normal'
    };
    setSettings(defaultSettings);
  };

  const getCurrentLanguageInfo = () => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage) || SUPPORTED_LANGUAGES[0];
  };

  const currentLang = getCurrentLanguageInfo();

  return (
    <Box p={4}>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <SettingsIcon color="primary" />
            <Typography variant="h4" fontWeight="600">
              {t('settings.title', 'Settings')}
            </Typography>
            <Chip
              label={`${t('settings.mode', 'Mode')}: ${settings.kioskMode ? 'Kiosk' : settings.simpleMode ? 'Simple' : settings.assistedMode ? 'Assisted' : 'Normal'}`}
              color={settings.kioskMode ? 'error' : settings.simpleMode ? 'warning' : settings.assistedMode ? 'info' : 'default'}
              size="small"
            />
          </Box>
          
          {isApplying && (
            <Alert severity="info" sx={{ mb: 3 }}>
              {t('settings.applying', 'Applying settings...')}
            </Alert>
          )}

          {/* Language Settings */}
          <Box mb={4}>
            <Typography variant="h6" gutterBottom>
              <LanguageIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              {t('settings.language.title', 'Language Settings')}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {t('settings.language.current', 'Current Language')}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <span style={{ fontSize: '24px' }}>{currentLang.flag}</span>
                    <Box>
                      <Typography variant="h6" fontWeight="600">
                        {currentLang.nativeName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {currentLang.name}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {t('settings.language.select', 'Select Language')}
                  </Typography>
                  <Select
                    value={currentLanguage}
                    onChange={(e) => switchLanguage(e.target.value)}
                    fullWidth
                    displayEmpty
                  >
                    {SUPPORTED_LANGUAGES.map((language) => (
                      <MenuItem key={language.code} value={language.code}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <span style={{ fontSize: '20px' }}>{language.flag}</span>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="600">
                              {language.nativeName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {language.name}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Basic Modes */}
          <Box mb={4}>
            <Typography variant="h6" gutterBottom>
              <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              {t('settings.modes.title', 'Basic Modes')}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.lowBandwidth}
                      onChange={(e) => updateSetting('lowBandwidth', e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <DataUsageIcon />
                      <span>{t('settings.modes.lowBandwidth', 'Low Bandwidth Mode')}</span>
                    </Box>
                  }
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                  {t('settings.modes.lowBandwidthDesc', 'Optimize for slow internet connections')}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.kioskMode}
                      onChange={(e) => updateSetting('kioskMode', e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <SecurityIcon />
                      <span>{t('settings.modes.kioskMode', 'Kiosk Mode')}</span>
                    </Box>
                  }
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                  {t('settings.modes.kioskModeDesc', 'Optimize for public access terminals')}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.assistedMode}
                      onChange={(e) => updateSetting('assistedMode', e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <AccessibilityIcon />
                      <span>{t('settings.modes.assistedMode', 'Assisted Mode')}</span>
                    </Box>
                  }
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                  {t('settings.modes.assistedModeDesc', 'Enhanced accessibility features')}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.simpleMode}
                      onChange={(e) => updateSetting('simpleMode', e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <VisibilityIcon />
                      <span>{t('settings.modes.simpleMode', 'Simple Mode')}</span>
                    </Box>
                  }
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                  {t('settings.modes.simpleModeDesc', 'Simplified interface for easier use')}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Accessibility Settings */}
          <Collapse in={showAccessibility}>
            <Box mb={4}>
              <Typography variant="h6" gutterBottom>
                <AccessibilityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                {t('settings.accessibility.title', 'Accessibility Settings')}
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.highContrast}
                        onChange={(e) => updateSetting('highContrast', e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        <ContrastIcon />
                        <span>{t('settings.accessibility.highContrast', 'High Contrast')}</span>
                      </Box>
                    }
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                    {t('settings.accessibility.highContrastDesc', 'Improve visibility for users with visual impairments')}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        {t('settings.accessibility.fontSize', 'Font Size')}
                      </Typography>
                      <Typography variant="body2" color="primary">
                        {settings.fontSize}%
                      </Typography>
                    </Box>
                    <Slider
                      value={settings.fontSize}
                      onChange={(e, value) => updateSetting('fontSize', value)}
                      min={80}
                      max={150}
                      step={5}
                      marks={[
                        { value: 80, label: '80%' },
                        { value: 100, label: '100%' },
                        { value: 125, label: '125%' },
                        { value: 150, label: '150%' }
                      ]}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.reduceAnimations}
                        onChange={(e) => updateSetting('reduceAnimations', e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        <VisibilityIcon />
                        <span>{t('settings.accessibility.reduceAnimations', 'Reduce Animations')}</span>
                      </Box>
                    }
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                    {t('settings.accessibility.reduceAnimationsDesc', 'Reduce motion for users with vestibular disorders')}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.focusIndicator}
                        onChange={(e) => updateSetting('focusIndicator', e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        <KeyboardIcon />
                        <span>{t('settings.accessibility.focusIndicator', 'Enhanced Focus Indicators')}</span>
                      </Box>
                    }
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                    {t('settings.accessibility.focusIndicatorDesc', 'Makes keyboard navigation easier to see')}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.keyboardNavigation}
                        onChange={(e) => updateSetting('keyboardNavigation', e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        <MouseIcon />
                        <span>{t('settings.accessibility.keyboardNavigation', 'Keyboard Navigation')}</span>
                      </Box>
                    }
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                    {t('settings.accessibility.keyboardNavigationDesc', 'Enable full keyboard navigation support')}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t('settings.accessibility.touchTargetSize', 'Touch Target Size')}
                    </Typography>
                    <Select
                      value={settings.touchTargetSize}
                      onChange={(e) => updateSetting('touchTargetSize', e.target.value)}
                      fullWidth
                    >
                      <MenuItem value="normal">{t('settings.accessibility.touchTarget.normal', 'Normal (44px)')}</MenuItem>
                      <MenuItem value="large">{t('settings.accessibility.touchTarget.large', 'Large (48px)')}</MenuItem>
                      <MenuItem value="extra-large">{t('settings.accessibility.touchTarget.extraLarge', 'Extra Large (60px)')}</MenuItem>
                    </Select>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t('settings.accessibility.colorBlindMode', 'Color Blind Mode')}
                    </Typography>
                    <Select
                      value={settings.colorBlindMode}
                      onChange={(e) => updateSetting('colorBlindMode', e.target.value)}
                      fullWidth
                    >
                      <MenuItem value="none">{t('settings.accessibility.colorBlind.none', 'None')}</MenuItem>
                      <MenuItem value="protanopia">{t('settings.accessibility.colorBlind.protanopia', 'Red-Green (Protanopia)')}</MenuItem>
                      <MenuItem value="deuteranopia">{t('settings.accessibility.colorBlind.deuteranopia', 'Red-Green (Deuteranopia)')}</MenuItem>
                      <MenuItem value="tritanopia">{t('settings.accessibility.colorBlind.tritanopia', 'Blue-Yellow (Tritanopia)')}</MenuItem>
                    </Select>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.dyslexiaFriendly}
                        onChange={(e) => updateSetting('dyslexiaFriendly', e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        <TextIncreaseIcon />
                        <span>{t('settings.accessibility.dyslexiaFriendly', 'Dyslexia-Friendly Fonts')}</span>
                      </Box>
                    }
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                    {t('settings.accessibility.dyslexiaFriendlyDesc', 'Use fonts designed for easier reading')}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.audioAssistance}
                        onChange={(e) => updateSetting('audioAssistance', e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        <VolumeUpIcon />
                        <span>{t('settings.accessibility.audioAssistance', 'Audio Assistance')}</span>
                      </Box>
                    }
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                    {t('settings.accessibility.audioAssistanceDesc', 'Enable audio cues and voice navigation')}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Collapse>

          {/* Controls */}
          <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
            <Button
              variant="contained"
              startIcon={<SettingsIcon />}
              onClick={() => setShowAccessibility(!showAccessibility)}
            >
              {showAccessibility ? t('settings.hideAccessibility', 'Hide Accessibility') : t('settings.showAccessibility', 'Show Accessibility')}
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<InfoIcon />}
              onClick={() => setShowTips(!showTips)}
            >
              {showTips ? t('settings.hideTips', 'Hide Tips') : t('settings.showTips', 'Show Tips')}
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={resetSettings}
            >
              {t('settings.reset', 'Reset to Default')}
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<LogoutIcon />}
              onClick={() => navigate('/')}
            >
              {t('settings.close', 'Close')}
            </Button>
          </Box>

          {/* Tips */}
          <Collapse in={showTips}>
            <Box mb={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('settings.tips.title', 'Settings Tips')}
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('settings.tips.lowBandwidth', 'Low Bandwidth Mode')}
                        secondary={t('settings.tips.lowBandwidthDesc', 'Use this mode when you have slow internet connection to load pages faster')}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('settings.tips.kioskMode', 'Kiosk Mode')}
                        secondary={t('settings.tips.kioskModeDesc', 'Perfect for public terminals and shared devices')}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('settings.tips.accessibility', 'Accessibility Features')}
                        secondary={t('settings.tips.accessibilityDesc', 'Enable features that make the app easier to use for everyone')}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('settings.tips.language', 'Language Support')}
                        secondary={t('settings.tips.languageDesc', 'Choose your preferred language for a better experience')}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Box>
          </Collapse>

          {/* Current Status */}
          <Box>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('settings.status.title', 'Current Status')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Chip 
                        label={settings.lowBandwidth ? t('settings.status.enabled', 'Enabled') : t('settings.status.disabled', 'Disabled')}
                        color={settings.lowBandwidth ? 'success' : 'default'}
                        size="small"
                      />
                      <Typography variant="body2" color="text.secondary">
                        {t('settings.status.lowBandwidth', 'Low Bandwidth')}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Chip 
                        label={settings.kioskMode ? t('settings.status.enabled', 'Enabled') : t('settings.status.disabled', 'Disabled')}
                        color={settings.kioskMode ? 'error' : 'default'}
                        size="small"
                      />
                      <Typography variant="body2" color="text.secondary">
                        {t('settings.status.kioskMode', 'Kiosk Mode')}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Chip 
                        label={settings.assistedMode ? t('settings.status.enabled', 'Enabled') : t('settings.status.disabled', 'Disabled')}
                        color={settings.assistedMode ? 'info' : 'default'}
                        size="small"
                      />
                      <Typography variant="body2" color="text.secondary">
                        {t('settings.status.assistedMode', 'Assisted Mode')}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Chip 
                        label={settings.simpleMode ? t('settings.status.enabled', 'Enabled') : t('settings.status.disabled', 'Disabled')}
                        color={settings.simpleMode ? 'warning' : 'default'}
                        size="small"
                      />
                      <Typography variant="body2" color="text.secondary">
                        {t('settings.status.simpleMode', 'Simple Mode')}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};