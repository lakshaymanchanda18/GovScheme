import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Switch, FormControlLabel, Slider, Select, MenuItem, Chip, Grid, Button, IconButton, Tooltip, List, ListItem, ListItemText, ListItemIcon, Alert, Collapse } from '@mui/material';
import { useI18n } from '../hooks/useI18n';
import { useNavigate } from 'react-router-dom';
import { 
  Accessibility as AccessibilityIcon, 
  Contrast as ContrastIcon, 
  TextIncrease as TextIncreaseIcon,
  TextDecrease as TextDecreaseIcon,
  Visibility as VisibilityIcon,
  Keyboard as KeyboardIcon,
  Mouse as MouseIcon,
  VolumeUp as VolumeUpIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon
} from '@mui/icons-material';

interface AccessibilitySettings {
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

export const AccessibilitySettings: React.FC = () => {
  const { t, currentLanguage } = useI18n();
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState<AccessibilitySettings>({
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
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    // Load saved settings
    const savedSettings = localStorage.getItem('accessibilitySettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  useEffect(() => {
    applyAccessibilitySettings();
  }, [settings]);

  const applyAccessibilitySettings = () => {
    setIsApplying(true);
    
    // Apply CSS-in-JS styles
    const style = document.createElement('style');
    style.id = 'accessibility-styles';
    
    let cssRules = '';
    
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
        .accessibility-focus {
          outline: 4px solid #ff0000 !important;
          outline-offset: 2px !important;
        }
      `;
    }
    
    // Font size adjustment
    if (settings.fontSize !== 100) {
      cssRules += `
        html {
          font-size: ${settings.fontSize}% !important;
        }
        body {
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
    
    // Screen reader mode
    if (settings.screenReaderMode) {
      cssRules += `
        [aria-hidden="true"] {
          display: none !important;
        }
        .sr-only {
          position: absolute !important;
          width: 1px !important;
          height: 1px !important;
          padding: 0 !important;
          margin: -1px !important;
          overflow: hidden !important;
          clip: rect(0, 0, 0, 0) !important;
          white-space: nowrap !important;
          border: 0 !important;
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
    
    // Color blind modes
    if (settings.colorBlindMode !== 'none') {
      const filters = {
        protanopia: 'filter: url("#protanopia-filter");',
        deuteranopia: 'filter: url("#deuteranopia-filter");',
        tritanopia: 'filter: url("#tritanopia-filter");'
      };
      cssRules += `* { ${filters[settings.colorBlindMode]} }`;
    }
    
    // Dyslexia-friendly fonts
    if (settings.dyslexiaFriendly) {
      cssRules += `
        body, p, span, div, li {
          font-family: "OpenDyslexic", Arial, sans-serif !important;
          line-height: 1.6 !important;
          letter-spacing: 0.05em !important;
        }
      `;
    }
    
    style.textContent = cssRules;
    
    // Remove existing styles
    const existingStyle = document.getElementById('accessibility-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    document.head.appendChild(style);
    
    // Save settings
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
    
    setTimeout(() => setIsApplying(false), 100);
  };

  const updateSetting = (key: keyof AccessibilitySettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    const defaultSettings: AccessibilitySettings = {
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

  const getAccessibilityLevel = () => {
    const enabledFeatures = Object.values(settings).filter(Boolean).length;
    if (enabledFeatures >= 7) return 'high';
    if (enabledFeatures >= 4) return 'medium';
    if (enabledFeatures >= 2) return 'low';
    return 'none';
  };

  const accessibilityTips = [
    {
      title: t('accessibility.tips.highContrast', 'High Contrast Mode'),
      description: t('accessibility.tips.highContrastDesc', 'Use high contrast mode if you have difficulty seeing text against backgrounds.')
    },
    {
      title: t('accessibility.tips.fontSize', 'Font Size'),
      description: t('accessibility.tips.fontSizeDesc', 'Adjust font size for comfortable reading. Larger text is easier to read.')
    },
    {
      title: t('accessibility.tips.animations', 'Reduce Animations'),
      description: t('accessibility.tips.animationsDesc', 'Disable animations if they cause discomfort or distraction.')
    },
    {
      title: t('accessibility.tips.keyboard', 'Keyboard Navigation'),
      description: t('accessibility.tips.keyboardDesc', 'Use Tab key to navigate. Press Enter to activate elements.')
    },
    {
      title: t('accessibility.tips.focus', 'Focus Indicators'),
      description: t('accessibility.tips.focusDesc', 'Keep focus indicators enabled to see which element is currently selected.')
    }
  ];

  const quickPresets = [
    {
      name: t('accessibility.presets.basic', 'Basic Accessibility'),
      settings: {
        fontSize: 110,
        focusIndicator: true,
        keyboardNavigation: true,
        reduceAnimations: false
      }
    },
    {
      name: t('accessibility.presets.visual', 'Visual Impairment'),
      settings: {
        highContrast: true,
        fontSize: 125,
        focusIndicator: true,
        keyboardNavigation: true,
        reduceAnimations: true
      }
    },
    {
      name: t('accessibility.presets.mobility', 'Mobility Impairment'),
      settings: {
        touchTargetSize: 'extra-large',
        focusIndicator: true,
        keyboardNavigation: true,
        reduceAnimations: false
      }
    },
    {
      name: t('accessibility.presets.cognitive', 'Cognitive Support'),
      settings: {
        dyslexiaFriendly: true,
        fontSize: 115,
        reduceAnimations: true,
        focusIndicator: true,
        keyboardNavigation: true
      }
    }
  ];

  return (
    <Box p={4}>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <AccessibilityIcon color="primary" />
            <Typography variant="h4" fontWeight="600">
              {t('accessibility.title', 'Accessibility Settings')}
            </Typography>
            <Chip
              label={`${t('accessibility.level', 'Level')}: ${getAccessibilityLevel().toUpperCase()}`}
              color={getAccessibilityLevel() === 'high' ? 'success' : getAccessibilityLevel() === 'medium' ? 'info' : 'default'}
              size="small"
            />
          </Box>
          
          {isApplying && (
            <Alert severity="info" sx={{ mb: 3 }}>
              {t('accessibility.applying', 'Applying accessibility settings...')}
            </Alert>
          )}

          {/* Quick Presets */}
          <Box mb={4}>
            <Typography variant="h6" gutterBottom>
              {t('accessibility.presets.title', 'Quick Presets')}
            </Typography>
            <Grid container spacing={2}>
              {quickPresets.map((preset, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                        {preset.name}
                      </Typography>
                      <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        onClick={() => setSettings(prev => ({ ...prev, ...preset.settings as Partial<AccessibilitySettings> }))}
                      >
                        {t('accessibility.apply', 'Apply')}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Basic Settings */}
          <Box mb={4}>
            <Typography variant="h6" gutterBottom>
              {t('accessibility.basic.title', 'Basic Settings')}
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
                      <span>{t('accessibility.highContrast', 'High Contrast Mode')}</span>
                    </Box>
                  }
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                  {t('accessibility.highContrastDesc', 'Improves visibility for users with visual impairments')}
                </Typography>
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
                      <span>{t('accessibility.reduceAnimations', 'Reduce Animations')}</span>
                    </Box>
                  }
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                  {t('accessibility.reduceAnimationsDesc', 'Reduces motion for users with vestibular disorders')}
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
                      <span>{t('accessibility.focusIndicator', 'Enhanced Focus Indicators')}</span>
                    </Box>
                  }
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                  {t('accessibility.focusIndicatorDesc', 'Makes keyboard navigation easier to see')}
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
                      <span>{t('accessibility.keyboardNavigation', 'Keyboard Navigation')}</span>
                    </Box>
                  }
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                  {t('accessibility.keyboardNavigationDesc', 'Enable full keyboard navigation support')}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Font and Display */}
          <Box mb={4}>
            <Typography variant="h6" gutterBottom>
              {t('accessibility.display.title', 'Font and Display')}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      {t('accessibility.fontSize', 'Font Size')}
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
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {t('accessibility.touchTargetSize', 'Touch Target Size')}
                  </Typography>
                  <Select
                    value={settings.touchTargetSize}
                    onChange={(e) => updateSetting('touchTargetSize', e.target.value)}
                    fullWidth
                  >
                    <MenuItem value="normal">{t('accessibility.touchTarget.normal', 'Normal (44px)')}</MenuItem>
                    <MenuItem value="large">{t('accessibility.touchTarget.large', 'Large (48px)')}</MenuItem>
                    <MenuItem value="extra-large">{t('accessibility.touchTarget.extraLarge', 'Extra Large (60px)')}</MenuItem>
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
                      <span>{t('accessibility.dyslexiaFriendly', 'Dyslexia-Friendly Fonts')}</span>
                    </Box>
                  }
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                  {t('accessibility.dyslexiaFriendlyDesc', 'Use fonts designed for easier reading')}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Advanced Settings */}
          <Collapse in={showAdvanced}>
            <Box mb={4}>
              <Typography variant="h6" gutterBottom>
                {t('accessibility.advanced.title', 'Advanced Settings')}
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t('accessibility.colorBlindMode', 'Color Blind Mode')}
                    </Typography>
                    <Select
                      value={settings.colorBlindMode}
                      onChange={(e) => updateSetting('colorBlindMode', e.target.value)}
                      fullWidth
                    >
                      <MenuItem value="none">{t('accessibility.colorBlind.none', 'None')}</MenuItem>
                      <MenuItem value="protanopia">{t('accessibility.colorBlind.protanopia', 'Red-Green (Protanopia)')}</MenuItem>
                      <MenuItem value="deuteranopia">{t('accessibility.colorBlind.deuteranopia', 'Red-Green (Deuteranopia)')}</MenuItem>
                      <MenuItem value="tritanopia">{t('accessibility.colorBlind.tritanopia', 'Blue-Yellow (Tritanopia)')}</MenuItem>
                    </Select>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.screenReaderMode}
                        onChange={(e) => updateSetting('screenReaderMode', e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        <VolumeUpIcon />
                        <span>{t('accessibility.screenReaderMode', 'Screen Reader Mode')}</span>
                      </Box>
                    }
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                    {t('accessibility.screenReaderModeDesc', 'Optimize for screen reader compatibility')}
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
                        <span>{t('accessibility.audioAssistance', 'Audio Assistance')}</span>
                      </Box>
                    }
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                    {t('accessibility.audioAssistanceDesc', 'Enable audio cues and voice navigation')}
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
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? t('accessibility.hideAdvanced', 'Hide Advanced') : t('accessibility.showAdvanced', 'Show Advanced')}
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<InfoIcon />}
              onClick={() => setShowTips(!showTips)}
            >
              {showTips ? t('accessibility.hideTips', 'Hide Tips') : t('accessibility.showTips', 'Show Tips')}
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={resetSettings}
            >
              {t('accessibility.reset', 'Reset to Default')}
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={() => navigate('/')}
            >
              {t('accessibility.close', 'Close')}
            </Button>
          </Box>

          {/* Tips */}
          <Collapse in={showTips}>
            <Box mb={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('accessibility.tips.title', 'Accessibility Tips')}
                  </Typography>
                  <List>
                    {accessibilityTips.map((tip, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckCircleIcon color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary={tip.title}
                          secondary={tip.description}
                        />
                      </ListItem>
                    ))}
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
                  {t('accessibility.status.title', 'Current Status')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Chip 
                        label={settings.highContrast ? t('accessibility.status.enabled', 'Enabled') : t('accessibility.status.disabled', 'Disabled')}
                        color={settings.highContrast ? 'success' : 'default'}
                        size="small"
                      />
                      <Typography variant="body2" color="text.secondary">
                        {t('accessibility.status.highContrast', 'High Contrast')}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Chip 
                        label={`${settings.fontSize}%`}
                        color="info"
                        size="small"
                      />
                      <Typography variant="body2" color="text.secondary">
                        {t('accessibility.status.fontSize', 'Font Size')}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Chip 
                        label={settings.reduceAnimations ? t('accessibility.status.enabled', 'Enabled') : t('accessibility.status.disabled', 'Disabled')}
                        color={settings.reduceAnimations ? 'success' : 'default'}
                        size="small"
                      />
                      <Typography variant="body2" color="text.secondary">
                        {t('accessibility.status.animations', 'Reduced Animations')}
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