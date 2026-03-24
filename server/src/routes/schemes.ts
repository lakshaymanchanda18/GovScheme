import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../config/prisma';
import { eligibilityChecker } from '../services/eligibilityChecker';
import { authenticateToken } from '../middleware/auth';
import { cacheGet, cacheSet } from '../services/cache';

const router = Router();

// Get all active schemes with filtering
router.get('/', async (req, res) => {
  try {
    const { category, department, state, q } = req.query as any;
    const where: any = { isActive: true };

    if (category) where.category = { contains: category as string, mode: 'insensitive' };
    if (department) where.department = { contains: department as string, mode: 'insensitive' };
    if (state) where.stateSpecific = { contains: state as string, mode: 'insensitive' };
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { benefits: { contains: q, mode: 'insensitive' } },
        { eligibilityCriteria: { contains: q, mode: 'insensitive' } }
      ];
    }

    const userId = req.user?.userId;
    const cacheKey = `schemes:${category || ''}:${department || ''}:${state || ''}`;
    if (!userId) {
      const cached = cacheGet<any[]>(cacheKey);
      if (cached) {
        return res.json(cached);
      }
    }

    const schemes = await prisma.governmentScheme.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        eligibilityChecks: {
          where: { userId },
          orderBy: { checkedAt: 'desc' },
          take: 1
        }
      }
    });

    const withMeta = schemes.map((s) => ({
      ...s,
      lastUpdated: s.updatedAt,
      isStale: Date.now() - new Date(s.updatedAt).getTime() > 1000 * 60 * 60 * 24 * 180
    }));

    if (!userId) {
      cacheSet(cacheKey, withMeta, 60 * 1000);
    }

    res.json(withMeta);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch schemes' });
  }
});

// Search endpoint with facets
router.get('/search', async (req, res) => {
  try {
    const { q, category, department, state } = req.query as any;
    const where: any = { isActive: true };
    if (category) where.category = { contains: category as string, mode: 'insensitive' };
    if (department) where.department = { contains: department as string, mode: 'insensitive' };
    if (state) where.stateSpecific = { contains: state as string, mode: 'insensitive' };
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { benefits: { contains: q, mode: 'insensitive' } },
        { eligibilityCriteria: { contains: q, mode: 'insensitive' } }
      ];
    }

    const schemes = await prisma.governmentScheme.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json(schemes.map((s) => ({
      ...s,
      lastUpdated: s.updatedAt,
      isStale: Date.now() - new Date(s.updatedAt).getTime() > 1000 * 60 * 60 * 24 * 180
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to search schemes' });
  }
});

// Check eligibility for a scheme
router.post('/check-eligibility',
  authenticateToken,
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
router.get('/recommendations', authenticateToken, async (req, res) => {
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

    res.json({
      ...scheme,
      lastUpdated: scheme.updatedAt,
      isStale: Date.now() - new Date(scheme.updatedAt).getTime() > 1000 * 60 * 60 * 24 * 180
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch scheme' });
  }
});

export default router;
