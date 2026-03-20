import React from 'react';
import { Box, Button, Menu, MenuItem, Typography } from '@mui/material';
import { useI18n } from '../hooks/useI18n';
import LanguageIcon from '@mui/icons-material/Language';

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

  const handleLanguageChange = (language: 'en' | 'hi') => {
    switchLanguage(language);
    handleClose();
  };

  return (
    <Box>
      <Button
        id="language-button"
        aria-controls={open ? 'language-menu' : undefined}
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
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            transform: 'translateY(-1px)',
            transition: 'all 0.3s ease'
          }
        }}
      >
        {currentLanguage === 'en' ? 'English' : 'हिन्दी'}
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
            minWidth: 150,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <MenuItem 
          onClick={() => handleLanguageChange('en')}
          selected={currentLanguage === 'en'}
          sx={{
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
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              width={24}
              height={16}
              borderRadius="4px"
              sx={{
                backgroundImage: 'linear-gradient(to right, #0052B4 0%, #FFFFFF 33%, #F0F0F0 66%, #0052B4 100%)'
              }}
            />
            <Typography>{t('navigation.english', 'English')}</Typography>
          </Box>
        </MenuItem>
        <MenuItem 
          onClick={() => handleLanguageChange('hi')}
          selected={currentLanguage === 'hi'}
          sx={{
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
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              width={24}
              height={16}
              borderRadius="4px"
              sx={{
                backgroundImage: 'linear-gradient(to right, #FF9933 0%, #FFFFFF 33%, #138808 66%, #0052B4 100%)'
              }}
            />
            <Typography>{t('navigation.hindi', 'हिन्दी')}</Typography>
          </Box>
        </MenuItem>
      </Menu>
    </Box>
  );
};