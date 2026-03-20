import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../config/prisma';
import { eligibilityChecker } from '../services/eligibilityChecker';

const router = Router();

// Get all active schemes with filtering
router.get('/', async (req, res) => {
  try {
    const { category, department, state } = req.query;
    const where: any = { isActive: true };

    if (category) where.category = { contains: category as string, mode: 'insensitive' };
    if (department) where.department = { contains: department as string, mode: 'insensitive' };
    if (state) where.stateSpecific = { contains: state as string, mode: 'insensitive' };

    const schemes = await prisma.governmentScheme.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        eligibilityChecks: {
          where: { userId: req.user?.userId },
          orderBy: { checkedAt: 'desc' },
          take: 1
        }
      }
    });

    res.json(schemes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch schemes' });
  }
});

// Check eligibility for a scheme
router.post('/check-eligibility', 
  body('schemeId').isString(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { schemeId } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const result = await eligibilityChecker.checkEligibility(userId, schemeId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to check eligibility' });
    }
  }
);

// Get personalized scheme recommendations
router.get('/recommendations', async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const recommendations = await eligibilityChecker.getRecommendations(userId);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Get scheme details by ID
router.get('/:id', async (req, res) => {
  try {
    const scheme = await prisma.governmentScheme.findUnique({
      where: { id: req.params.id },
      include: {
        eligibilityChecks: {
          where: { userId: req.user?.userId },
          orderBy: { checkedAt: 'desc' },
          take: 1
        }
      }
    });

    if (!scheme) return res.status(404).json({ error: 'Scheme not found' });

    res.json(scheme);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch scheme' });
  }
});

export default router;
