import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Grid, Card, CardContent, Chip, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { useI18n } from '../hooks/useI18n';

export default function UserApplications() {
  const { user, loading: authLoading } = useAuth();
  const { api } = useApi();
  const { t, i18n } = useI18n();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const data = await api.get('/applications');
      setApplications(data);
    } catch (err) {
      setError(err.error || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          {t('applications')}
        </Typography>
        {applications.length === 0 ? (
          <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
            {t('noApplications')}
          </Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('schemeName')}</TableCell>
                  <TableCell>{t('category')}</TableCell>
                  <TableCell>{t('department')}</TableCell>
                  <TableCell>{t('status')}</TableCell>
                  <TableCell>{t('submittedAt')}</TableCell>
                  <TableCell>{t('actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {applications.map((application: any) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {application.scheme.name}
                      </Typography>
                    </TableCell>
                    <TableCell>{application.scheme.category}</TableCell>
                    <TableCell>{application.scheme.department}</TableCell>
                    <TableCell>
                      <Chip
                        label={application.status}
                        size="small"
                        color={application.status === 'APPROVED' ? 'success' : application.status === 'REJECTED' ? 'error' : 'info'}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(application.submittedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => window.open(`/schemes/${application.scheme.id}`, '_blank')}
                      >
                        {t('viewDetails')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Container>
  );
}