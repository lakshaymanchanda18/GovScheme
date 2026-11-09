import React from 'react';
import { Box, Card, CardContent, Grid, Skeleton, LinearProgress } from '@mui/material';

/**
 * Top-level route transition progress indicator
 */
export const PageLoadingBar: React.FC = () => (
  <Box sx={{ width: '100%', position: 'fixed', top: 0, left: 0, zIndex: 9999 }}>
    <LinearProgress
      sx={{
        height: 3,
        backgroundColor: '#e2e8f0',
        '& .MuiLinearProgress-bar': {
          backgroundColor: '#0c2340',
        },
      }}
    />
  </Box>
);

/**
 * Skeleton card for scheme listings
 */
export const SchemeCardSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <Grid container spacing={3}>
      {Array.from({ length: count }).map((_, idx) => (
        <Grid item xs={12} sm={6} md={4} key={idx}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              p: 2.5,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#ffffff',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: '4px' }} />
              <Skeleton variant="rounded" width={60} height={24} sx={{ borderRadius: '4px' }} />
            </Box>

            <Skeleton variant="text" width="85%" height={32} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="50%" height={20} sx={{ mb: 2 }} />

            <Skeleton variant="text" width="100%" height={18} />
            <Skeleton variant="text" width="95%" height={18} />
            <Skeleton variant="text" width="70%" height={18} sx={{ mb: 3 }} />

            <Box sx={{ mt: 'auto', pt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Skeleton variant="text" width="40%" height={16} />
              <Skeleton variant="rounded" width={100} height={36} sx={{ borderRadius: '6px' }} />
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

/**
 * Skeleton loader for scheme details page
 */
export const SchemeDetailSkeleton: React.FC = () => {
  return (
    <Box sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Skeleton variant="rounded" width={120} height={32} sx={{ mb: 2, borderRadius: '4px' }} />
        <Skeleton variant="text" width="75%" height={48} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="40%" height={24} sx={{ mb: 3 }} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Skeleton variant="rounded" width={100} height={28} sx={{ borderRadius: '4px' }} />
          <Skeleton variant="rounded" width={120} height={28} sx={{ borderRadius: '4px' }} />
        </Box>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="98%" height={20} />
            <Skeleton variant="text" width="90%" height={20} sx={{ mb: 3 }} />

            <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="85%" height={20} />
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ p: 3, border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <Skeleton variant="text" width="50%" height={28} sx={{ mb: 2 }} />
            <Skeleton variant="rounded" width="100%" height={44} sx={{ borderRadius: '6px', mb: 2 }} />
            <Skeleton variant="text" width="80%" height={18} />
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

/**
 * Skeleton loader for dashboard metrics and tables
 */
export const DashboardSkeleton: React.FC = () => {
  return (
    <Box sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Skeleton variant="text" width={240} height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={340} height={24} />
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card elevation={0} sx={{ p: 3, border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <Skeleton variant="text" width="50%" height={20} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="70%" height={36} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="40%" height={16} />
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card elevation={0} sx={{ p: 3, border: '1px solid #e2e8f0', borderRadius: '8px' }}>
        <Skeleton variant="text" width="25%" height={32} sx={{ mb: 2 }} />
        {Array.from({ length: 4 }).map((_, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 2, py: 1.5, borderBottom: '1px solid #f1f5f9' }}>
            <Skeleton variant="text" width="30%" height={24} />
            <Skeleton variant="text" width="25%" height={24} />
            <Skeleton variant="text" width="20%" height={24} />
            <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: '4px', ml: 'auto' }} />
          </Box>
        ))}
      </Card>
    </Box>
  );
};
