import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
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

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
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
        welcome: 'Welcome to GovScheme',
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
