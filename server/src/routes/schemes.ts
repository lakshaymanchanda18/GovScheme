import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../config/prisma';
import { eligibilityChecker } from '../services/eligibilityChecker';
import { authenticateToken } from '../middleware/auth';
import { cacheGet, cacheSet } from '../services/cache';

const router = Router();

// Get all active schemes with filtering & pagination
router.get('/', async (req, res) => {
  try {
    const { category, department, state, q, page, limit } = req.query as any;
    const userId = req.user?.userId;
    const isPaginated = Boolean(page || limit || req.query.paginated === 'true');
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 12));
    const skip = (pageNum - 1) * pageSize;

    const cacheKey = `schemes:${category || ''}:${department || ''}:${state || ''}:${pageNum}:${pageSize}`;

    if (!userId && !q && isPaginated) {
      const cached = cacheGet<any>(cacheKey);
      if (cached) return res.json(cached);
    }

    const whereClause: any = { isActive: true };
    
    if (category) whereClause.category = { contains: category as string, mode: 'insensitive' };
    if (department) whereClause.department = { contains: department as string, mode: 'insensitive' };
    if (state) whereClause.stateSpecific = { contains: state as string, mode: 'insensitive' };
    if (q) {
      whereClause.OR = [
        { name: { contains: q as string, mode: 'insensitive' } },
        { description: { contains: q as string, mode: 'insensitive' } },
        { benefits: { contains: q as string, mode: 'insensitive' } },
        { eligibilityCriteria: { contains: q as string, mode: 'insensitive' } },
        { category: { contains: q as string, mode: 'insensitive' } },
        { department: { contains: q as string, mode: 'insensitive' } }
      ];
    }

    const [total, schemes] = await Promise.all([
      prisma.governmentScheme.count({ where: whereClause }),
      prisma.governmentScheme.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip: isPaginated ? skip : undefined,
        take: isPaginated ? pageSize : undefined,
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          department: true,
          stateSpecific: true,
          benefits: true,
          sourceUrl: true,
          updatedAt: true,
          createdAt: true,
          eligibilityChecks: userId ? {
            where: { userId },
            orderBy: { checkedAt: 'desc' },
            take: 1
          } : false
        }
      })
    ]);

    const withMeta = schemes.map((s) => ({
      ...s,
      lastUpdated: s.updatedAt,
      isStale: Date.now() - new Date(s.updatedAt).getTime() > 1000 * 60 * 60 * 24 * 180
    }));

    if (isPaginated) {
      const result = {
        data: withMeta,
        pagination: {
          page: pageNum,
          limit: pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      };
      if (!userId && !q) cacheSet(cacheKey, result, 60 * 1000);
      return res.json(result);
    }

    if (!userId && !q) cacheSet(cacheKey, withMeta, 60 * 1000);
    res.json(withMeta);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch schemes' });
  }
});

// Search endpoint with facets & pagination
router.get('/search', async (req, res) => {
  try {
    const { q, category, department, state, page, limit } = req.query as any;
    const isPaginated = Boolean(page || limit || req.query.paginated === 'true');
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 12));
    const skip = (pageNum - 1) * pageSize;
    
    const whereClause: any = { isActive: true };
    
    if (category) whereClause.category = { contains: category as string, mode: 'insensitive' };
    if (department) whereClause.department = { contains: department as string, mode: 'insensitive' };
    if (state) whereClause.stateSpecific = { contains: state as string, mode: 'insensitive' };
    if (q) {
      whereClause.OR = [
        { name: { contains: q as string, mode: 'insensitive' } },
        { description: { contains: q as string, mode: 'insensitive' } },
        { benefits: { contains: q as string, mode: 'insensitive' } },
        { eligibilityCriteria: { contains: q as string, mode: 'insensitive' } },
        { category: { contains: q as string, mode: 'insensitive' } },
        { department: { contains: q as string, mode: 'insensitive' } }
      ];
    }

    const [total, schemes] = await Promise.all([
      prisma.governmentScheme.count({ where: whereClause }),
      prisma.governmentScheme.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip: isPaginated ? skip : undefined,
        take: isPaginated ? pageSize : undefined,
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          department: true,
          stateSpecific: true,
          benefits: true,
          sourceUrl: true,
          updatedAt: true,
          createdAt: true
        }
      })
    ]);

    const withMeta = schemes.map((s) => ({
      ...s,
      lastUpdated: s.updatedAt,
      isStale: Date.now() - new Date(s.updatedAt).getTime() > 1000 * 60 * 60 * 24 * 180
    }));

    if (isPaginated) {
      return res.json({
        data: withMeta,
        pagination: {
          page: pageNum,
          limit: pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      });
    }

    res.json(withMeta);
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
