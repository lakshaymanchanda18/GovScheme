import React from 'react';
import { Container, Typography, Box, Paper, Divider, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';

export default function TermsOfService() {
  return (
    <Box sx={{ minHeight: '100vh', background: '#f8fafc', py: { xs: 4, md: 8 } }}>
      <Container maxWidth="md">
        <Breadcrumbs sx={{ mb: 3 }}>
          <MuiLink component={Link} to="/" color="inherit" underline="hover">
            Home
          </MuiLink>
          <Typography color="text.primary">Terms of Service</Typography>
        </Breadcrumbs>

        <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff' }}>
          <Typography variant="h4" fontWeight="800" color="#0c2340" sx={{ mb: 1, letterSpacing: '-0.02em' }}>
            Terms of Service
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Effective Date: November 2026 · SaralYojna Citizen Facilitation Platform
          </Typography>

          <Divider sx={{ mb: 4 }} />

          <Typography variant="h6" fontWeight="700" color="#0c2340" sx={{ mb: 1.5 }}>
            1. Nature of the Service
          </Typography>
          <Typography variant="body1" color="#334155" sx={{ mb: 3, lineHeight: 1.7 }}>
            SaralYojna operates as an informational discovery and application assistance tool for citizens seeking welfare schemes provided by the Union Government and State Governments of India. The portal aggregates publicly available guidelines to simplify citizen navigation.
          </Typography>

          <Typography variant="h6" fontWeight="700" color="#0c2340" sx={{ mb: 1.5 }}>
            2. No Official Guarantee of Benefit Approval
          </Typography>
          <Typography variant="body1" color="#334155" sx={{ mb: 3, lineHeight: 1.7 }}>
            Using SaralYojna or receiving an eligibility match does not guarantee that a government body will sanction benefits or disburse funds. All applications are subject to independent administrative verification and document vetting by the competent ministry or designated nodal officer.
          </Typography>

          <Typography variant="h6" fontWeight="700" color="#0c2340" sx={{ mb: 1.5 }}>
            3. User Responsibilities
          </Typography>
          <Typography variant="body1" color="#334155" sx={{ mb: 3, lineHeight: 1.7 }}>
            Users agree to provide accurate, truthful details when completing eligibility profiles or application drafts. Submitting fraudulent identities, misrepresenting income brackets, or attempting unauthorized system access is strictly prohibited under applicable laws.
          </Typography>

          <Typography variant="h6" fontWeight="700" color="#0c2340" sx={{ mb: 1.5 }}>
            4. External Ministry Portals
          </Typography>
          <Typography variant="body1" color="#334155" sx={{ mb: 3, lineHeight: 1.7 }}>
            SaralYojna contains direct links to official government websites (e.g. pmkisan.gov.in, pmjay.gov.in, scholarships.gov.in). We do not control the uptime, operational policies, or content of external government servers.
          </Typography>

          <Typography variant="h6" fontWeight="700" color="#0c2340" sx={{ mb: 1.5 }}>
            5. Modifications to Terms
          </Typography>
          <Typography variant="body1" color="#334155" sx={{ mb: 3, lineHeight: 1.7 }}>
            These terms may be revised periodically to reflect updates in regulatory frameworks or portal functionality. Continued use of the platform after updates constitutes acceptance of the modified terms.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
