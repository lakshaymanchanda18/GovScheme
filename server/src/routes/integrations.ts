import { Router } from 'express';
import { integrationProvider } from '../services/integrations';
import { prisma } from '../config/prisma';

const router = Router();

// Mock status tracking integration
router.post('/status', async (req, res) => {
  const { applicationId } = req.body || {};
  if (!applicationId) {
    return res.status(400).json({ error: 'applicationId is required' });
  }

  const result = await integrationProvider.getStatus({ applicationId });

  // Store status updates
  for (const entry of result.history || []) {
    await prisma.applicationStatusUpdate.create({
      data: {
        applicationId,
        status: entry.status,
        source: entry.source || result.source || 'unknown',
        details: entry.details || null,
        createdAt: new Date(entry.at)
      }
    });
  }

  // Update current application status if known
  if (result.currentStatus) {
    await prisma.application.update({
      where: { id: applicationId },
      data: { status: result.currentStatus }
    });
  }

  res.json(result);
});

// Mock identity verification
router.post('/verify/aadhaar', async (req, res) => {
  const result = await integrationProvider.verifyAadhaar(req.body || {});
  res.json(result);
});

router.post('/verify/pan', async (req, res) => {
  const result = await integrationProvider.verifyPan(req.body || {});
  res.json(result);
});

router.post('/verify/bank', async (req, res) => {
  const result = await integrationProvider.verifyBank(req.body || {});
  res.json(result);
});

export default router;
