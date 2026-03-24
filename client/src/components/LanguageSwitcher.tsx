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
        endIcon={<ExpandMoreIcon />}
        variant="outlined"
        color="inherit"
        sx={{
          borderRadius: '20px',
          textTransform: 'none',
          fontWeight: 600,
          minWidth: 140,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            transform: 'translateY(-1px)',
            transition: 'all 0.3s ease'
          }
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <span style={{ fontSize: '18px' }}>{currentLang.flag}</span>
          <Box textAlign="left">
            <Typography variant="body2" fontWeight="600">
              {currentLang.nativeName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {currentLang.name}
            </Typography>
          </Box>
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
          elevation: 4,
          sx: {
            mt: 1,
            borderRadius: '12px',
            minWidth: 280,
            maxWidth: 400,
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