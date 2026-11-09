import React from 'react';
import { Box, Button, Menu, MenuItem, Typography, Chip, Grid, Divider } from '@mui/material';
import { useI18n } from '../hooks/useI18n';
import { Language as LanguageIcon, ExpandMore as ExpandMoreIcon, Check as CheckIcon } from '@mui/icons-material';
import { SUPPORTED_LANGUAGES } from '../locales/languages';

export const LanguageSwitcher: React.FC = () => {
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

  const getCurrentLanguageInfo = () => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage) || SUPPORTED_LANGUAGES[0];
  };

  const currentLang = getCurrentLanguageInfo();

  return (
    <Box>
      <Button
        id="language-button"
        aria-controls={open ? 'language-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        endIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />}
        variant="outlined"
        size="small"
        sx={{
          borderRadius: '6px',
          textTransform: 'none',
          fontWeight: 600,
          borderColor: '#cbd5e1',
          color: '#0c2340',
          minWidth: { xs: 'auto', sm: 110 },
          px: { xs: 1, sm: 1.5 },
          py: 0.5,
          '&:hover': {
            borderColor: '#0c2340',
            backgroundColor: '#f8fafc',
          }
        }}
      >
        <Box display="flex" alignItems="center" gap={0.75}>
          <span style={{ fontSize: '16px' }}>{currentLang.flag}</span>
          <Typography variant="body2" fontWeight="600" sx={{ display: { xs: 'none', sm: 'inline' } }}>
            {currentLang.nativeName}
          </Typography>
          <Typography variant="body2" fontWeight="700" sx={{ display: { xs: 'inline', sm: 'none' }, fontSize: '0.8rem' }}>
            {currentLang.code.toUpperCase()}
          </Typography>
        </Box>
      </Button>
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'language-button',
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1,
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            minWidth: 240,
            maxWidth: 360,
            maxHeight: 400,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <Box p={2}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {t('language.switcher.title', 'Select Language')}
          </Typography>
          
          <Grid container spacing={1}>
            {SUPPORTED_LANGUAGES.map((language) => (
              <Grid item xs={12} key={language.code}>
                <MenuItem
                  onClick={() => handleLanguageChange(language.code)}
                  selected={currentLanguage === language.code}
                  sx={{
                    borderRadius: '8px',
                    py: 1.5,
                    px: 2,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.light',
                      color: 'primary.contrastText',
                      fontWeight: 600
                    },
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
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
                    {currentLanguage === language.code && (
                      <CheckIcon color="primary" />
                    )}
                  </Box>
                </MenuItem>
              </Grid>
            ))}
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Box display="flex" alignItems="center" gap={1} justifyContent="space-between">
            <Typography variant="caption" color="text.secondary">
              {t('language.switcher.total', 'Total Languages')}: {SUPPORTED_LANGUAGES.length}
            </Typography>
            <Chip 
              label={t('language.switcher.india', 'Made for India')} 
              size="small" 
              color="success" 
              variant="outlined"
            />
          </Box>
        </Box>
      </Menu>
    </Box>
  );
};