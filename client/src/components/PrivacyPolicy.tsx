import React from 'react';
import { Container, Typography, Box, Paper, Divider, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <Box sx={{ minHeight: '100vh', background: '#f8fafc', py: { xs: 4, md: 8 } }}>
      <Container maxWidth="md">
        <Breadcrumbs sx={{ mb: 3 }}>
          <MuiLink component={Link} to="/" color="inherit" underline="hover">
            Home
          </MuiLink>
          <Typography color="text.primary">Privacy Policy</Typography>
        </Breadcrumbs>

        <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff' }}>
          <Typography variant="h4" fontWeight="800" color="#0c2340" sx={{ mb: 1, letterSpacing: '-0.02em' }}>
            Privacy Policy
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Last updated: November 2026 · SaralYojna Citizen Facilitation Platform
          </Typography>

          <Divider sx={{ mb: 4 }} />

          <Typography variant="h6" fontWeight="700" color="#0c2340" sx={{ mb: 1.5 }}>
            1. Overview
          </Typography>
          <Typography variant="body1" color="#334155" sx={{ mb: 3, lineHeight: 1.7 }}>
            SaralYojna is committed to safeguarding citizen privacy. This platform provides discovery and eligibility guidance for Indian central and state welfare initiatives. We adhere to stringent data protection standards and do not sell, rent, or monetize personal information.
          </Typography>

          <Typography variant="h6" fontWeight="700" color="#0c2340" sx={{ mb: 1.5 }}>
            2. Data We Collect
          </Typography>
          <Typography variant="body1" color="#334155" sx={{ mb: 3, lineHeight: 1.7 }}>
            When you create an account or verify eligibility, we may collect minimal profile information such as your name, email address, age range, state of residence, occupation category, and income bracket. These parameters are strictly used to compute eligibility against statutory guidelines.
          </Typography>

          <Typography variant="h6" fontWeight="700" color="#0c2340" sx={{ mb: 1.5 }}>
            3. Encryption and Security
          </Typography>
          <Typography variant="body1" color="#334155" sx={{ mb: 3, lineHeight: 1.7 }}>
            All sensitive profile data (PII) is encrypted at rest using AES-256-GCM authenticated encryption. Network communications are secured with TLS 1.3 encryption. Passwords are cryptographically hashed using salted bcrypt before storage.
          </Typography>

          <Typography variant="h6" fontWeight="700" color="#0c2340" sx={{ mb: 1.5 }}>
            4. Cookies and Session Storage
          </Typography>
          <Typography variant="body1" color="#334155" sx={{ mb: 3, lineHeight: 1.7 }}>
            We use secure HTTP-Only cookies strictly for authentication session tokens and language preferences. We do not use third-party advertising cookies or cross-site tracking scripts.
          </Typography>

          <Typography variant="h6" fontWeight="700" color="#0c2340" sx={{ mb: 1.5 }}>
            5. Citizen Rights and Data Deletion
          </Typography>
          <Typography variant="body1" color="#334155" sx={{ mb: 3, lineHeight: 1.7 }}>
            You maintain the right to view, modify, or permanently delete your profile and application history at any time through your User Profile settings. Upon deletion, your data is permanently expunged from primary databases.
          </Typography>

          <Typography variant="h6" fontWeight="700" color="#0c2340" sx={{ mb: 1.5 }}>
            6. Official Source Disclaimer
          </Typography>
          <Typography variant="body1" color="#334155" sx={{ mb: 3, lineHeight: 1.7 }}>
            Scheme eligibility results are indicative guides based on public ministry criteria. Final benefit sanctions are determined solely by the respective government authority or competent department.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}

