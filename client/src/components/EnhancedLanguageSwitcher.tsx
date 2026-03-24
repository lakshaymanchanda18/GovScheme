import React from 'react';
import { Box, Button, Menu, MenuItem, Typography, Chip, Grid } from '@mui/material';
import { useI18n } from '../hooks/useI18n';
import LanguageIcon from '@mui/icons-material/Language';
import { SUPPORTED_LANGUAGES, getLanguageName, isRtlLanguage } from '../locales/languages';

export const EnhancedLanguageSwitcher: React.FC = () => {
  const { switchLanguage, currentLanguage, t } = useI18n();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (language: string) => {
    switchLanguage(language);
    handleClose();
  };

  // Group languages by region for better organization
  const languageGroups = {
    'National': SUPPORTED_LANGUAGES.filter(l => l.code === 'en' || l.code === 'hi'),
    'South Indian': SUPPORTED_LANGUAGES.filter(l => ['ta', 'te', 'ml', 'kn'].includes(l.code)),
    'East Indian': SUPPORTED_LANGUAGES.filter(l => ['bn', 'as', 'or'].includes(l.code)),
    'West Indian': SUPPORTED_LANGUAGES.filter(l => ['mr', 'gu'].includes(l.code)),
    'North Indian': SUPPORTED_LANGUAGES.filter(l => ['pa', 'ur'].includes(l.code))
  };

  return (
    <Box>
      <Button
        id="enhanced-language-button"
        aria-controls={open ? 'enhanced-language-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        startIcon={<LanguageIcon />}
        variant="outlined"
        color="inherit"
        sx={{
          borderRadius: '20px',
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.9rem',
          padding: '8px 16px',
          border: '2px solid',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            transform: 'translateY(-1px)',
            transition: 'all 0.3s ease',
            borderColor: 'rgba(255, 255, 255, 0.4)'
          },
          '&:active': {
            transform: 'translateY(0)',
            transition: 'all 0.1s ease'
          }
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <span>{SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage)?.flag}</span>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {getLanguageName(currentLanguage)}
          </Typography>
        </Box>
      </Button>

      <Menu
        id="enhanced-language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'enhanced-language-button',
        }}
        PaperProps={{
          elevation: 4,
          sx: {
            mt: 1,
            borderRadius: '16px',
            minWidth: 300,
            maxWidth: 400,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
            background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
            🌍 {t('navigation.language', 'Select Language')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('navigation.languageSubtitle', 'Choose your preferred language')}
          </Typography>
        </Box>

        {Object.entries(languageGroups).map(([groupName, languages]) => (
          <Box key={groupName} sx={{ p: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, px: 2, display: 'block', mb: 1 }}>
              {groupName}
            </Typography>
            {languages.map((lang) => (
              <MenuItem
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                selected={currentLanguage === lang.code}
                sx={{
                  py: 1.5,
                  px: 2,
                  borderRadius: '12px',
                  mb: 0.5,
                  backgroundColor: currentLanguage === lang.code ? 'primary.light' : 'transparent',
                  color: currentLanguage === lang.code ? 'primary.contrastText' : 'text.primary',
                  fontWeight: currentLanguage === lang.code ? 600 : 400,
                  '&:hover': {
                    backgroundColor: currentLanguage === lang.code ? 'primary.dark' : 'action.hover',
                    color: currentLanguage === lang.code ? 'primary.contrastText' : 'text.primary'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <Grid container alignItems="center" spacing={2}>
                  <Grid item xs={2}>
                    <Typography variant="h6">{lang.flag}</Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {lang.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {lang.nativeName}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={3}>
                    {currentLanguage === lang.code && (
                      <Chip
                        label={t('navigation.current', 'Current')}
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ fontSize: '0.65rem', height: 20 }}
                      />
                    )}
                  </Grid>
                </Grid>
              </MenuItem>
            ))}
          </Box>
        ))}

        <Box sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
          <Typography variant="caption" color="text.secondary">
            💡 {t('navigation.tip', 'Tip')}: {t('navigation.tipText', 'You can change language anytime from this menu')}
          </Typography>
        </Box>
      </Menu>
    </Box>
  );
};