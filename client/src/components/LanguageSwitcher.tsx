import React from 'react';
import { Box, Button, Menu, MenuItem, Typography, Chip, Divider } from '@mui/material';
import { useI18n } from '../hooks/useI18n';
import { ExpandMore as ExpandMoreIcon, Check as CheckIcon } from '@mui/icons-material';
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
          <span style={{ fontSize: '15px' }}>{currentLang.flag}</span>
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
          elevation: 4,
          sx: {
            mt: 1,
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            minWidth: 260,
            maxWidth: 340,
            maxHeight: 460,
            overflowY: 'auto',
            boxShadow: '0 10px 30px rgba(12, 35, 64, 0.12)'
          }
        }}
      >
        <Box p={1.5}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', px: 1, display: 'block', mb: 1 }}>
            {t('language.switcher.title', 'Select Language')}
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {SUPPORTED_LANGUAGES.map((language) => {
              const isSelected = currentLanguage === language.code;
              return (
                <MenuItem
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  selected={isSelected}
                  sx={{
                    borderRadius: '6px',
                    py: 1,
                    px: 1.5,
                    backgroundColor: isSelected ? '#f1f5f9 !important' : 'transparent',
                    color: isSelected ? '#0c2340' : 'inherit',
                    '&:hover': {
                      backgroundColor: '#f8fafc'
                    }
                  }}
                >
                  <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <span style={{ fontSize: '18px' }}>{language.flag}</span>
                      <Box>
                        <Typography variant="body2" fontWeight={isSelected ? 700 : 500} color={isSelected ? '#0c2340' : '#1e293b'}>
                          {language.nativeName}
                        </Typography>
                        <Typography variant="caption" color="#64748b" sx={{ fontSize: '0.72rem' }}>
                          {language.name}
                        </Typography>
                      </Box>
                    </Box>
                    {isSelected && (
                      <CheckIcon sx={{ fontSize: 18, color: '#047857' }} />
                    )}
                  </Box>
                </MenuItem>
              );
            })}
          </Box>
          
          <Divider sx={{ my: 1.5 }} />
          
          <Box display="flex" alignItems="center" gap={1} justifyContent="space-between" px={1}>
            <Typography variant="caption" color="#64748b">
              {t('language.switcher.total', 'Total Languages')}: {SUPPORTED_LANGUAGES.length}
            </Typography>
            <Chip 
              label={t('language.switcher.india', 'Made for India')} 
              size="small" 
              sx={{ 
                height: 20, 
                fontSize: '0.7rem', 
                fontWeight: 600,
                color: '#047857',
                borderColor: '#a7f3d0',
                backgroundColor: '#ecfdf5'
              }}
              variant="outlined"
            />
          </Box>
        </Box>
      </Menu>
    </Box>
  );
};
