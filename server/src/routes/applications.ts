import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../config/prisma';

const router = Router();

// Submit application
router.post('/', 
  body('schemeId').isString(),
  body('applicationData').isObject(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { schemeId, applicationData, documents } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const application = await prisma.application.create({
        data: {
          userId,
          schemeId,
          applicationData,
          documents
        }
      });

      res.status(201).json({
        message: 'Application submitted successfully',
        application
      });
    } catch (error) {
      res.status(500).json({ error: 'Application submission failed' });
    }
  }
);

// Get user applications
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const applications = await prisma.application.findMany({
      where: { userId },
      include: {
        scheme: {
          select: {
            id: true,
            name: true,
            category: true,
            department: true
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Get application details
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        scheme: {
          select: {
            id: true,
            name: true,
            category: true,
            department: true
          }
        }
      }
    });

    if (!application || application.userId !== userId) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

export default router;