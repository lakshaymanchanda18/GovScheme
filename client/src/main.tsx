import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import App from './App';
import './index.css';

// Create Redux store
const store = configureStore({
  reducer: {},
  devTools: import.meta.env.DEV,
});

// Create Premium Theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#4f46e5',
      light: '#818cf8',
      dark: '#3730a3',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#14b8a6',
      light: '#5eead4',
      dark: '#0f766e',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444',
    },
    warning: {
      main: '#f59e0b',
    },
    success: {
      main: '#22c55e',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 800, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700, letterSpacing: '-0.01em' },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    button: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none' as const,
          borderRadius: '12px',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: 'none',
          border: '1px solid #f1f5f9',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
          },
        },
      },
    },
  },
});

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Initialize i18n
i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        welcome: 'Welcome to SaralYojna',
        login: 'Login',
        register: 'Register',
        schemes: 'Government Schemes',
        eligibility: 'Eligibility Check',
        applications: 'Applications',
        dashboard: 'Dashboard',
        logout: 'Logout',
        search: 'Search',
        category: 'Category',
        department: 'Department',
        state: 'State',
        apply: 'Apply',
        checkEligibility: 'Check Eligibility',
        viewDetails: 'View Details',
        submit: 'Submit',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        info: 'Information',
        warning: 'Warning',
      },
    },
    hi: {
      translation: {
        welcome: 'गवस्कीम में आपका स्वागत है',
        login: 'लॉगिन',
        register: 'रजिस्टर',
        schemes: 'सरकारी योजनाएं',
        eligibility: 'पात्रता जांच',
        applications: 'आवेदन',
        dashboard: 'डैशबोर्ड',
        logout: 'लॉगआउट',
        search: 'खोज',
        category: 'श्रेणी',
        department: 'विभाग',
        state: 'राज्य',
        apply: 'आवेदन करें',
        checkEligibility: 'पात्रता जांचें',
        viewDetails: 'विवरण देखें',
        submit: 'जमा करें',
        loading: 'लोड हो रहा है...',
        error: 'त्रुटि',
        success: 'सफल',
        info: 'जानकारी',
        warning: 'चेतावनी',
      },
    },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </Provider>
        </QueryClientProvider>
      </SnackbarProvider>
    </ThemeProvider>
  </React.StrictMode>
);
