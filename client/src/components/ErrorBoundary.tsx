import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { ErrorOutline, Refresh } from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary — catches render errors and displays a recovery UI.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <Container maxWidth="sm">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
              textAlign: 'center',
              py: 8,
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
              }}
            >
              <ErrorOutline sx={{ fontSize: 40, color: '#ef4444' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
              Something went wrong
            </Typography>
            <Typography sx={{ color: '#64748b', mb: 4, maxWidth: 400 }}>
              An unexpected error occurred. Please try again or contact support if the problem persists.
            </Typography>
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  borderRadius: '12px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  maxWidth: '100%',
                  overflow: 'auto',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontFamily: 'monospace', color: '#b91c1c', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
                >
                  {this.state.error.message}
                </Typography>
              </Box>
            )}
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={this.handleRetry}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '12px',
                px: 4,
                py: 1.5,
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4338ca, #6d28d9)',
                },
              }}
            >
              Try Again
            </Button>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
