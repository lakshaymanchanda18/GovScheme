import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../config/prisma';
import { requireAdmin } from '../middleware/auth';
import { cacheGet, cacheSet, cacheClear } from '../services/cache';
import { auditLog } from '../services/audit';
import { transitionApplicationStatus } from '../services/workflow';
import { importSchemes } from '../services/schemeImport';
import multer from 'multer';
import { parse } from 'csv-parse/sync';

const router = Router();
const upload = multer();

router.use(requireAdmin);

// Schemes
router.get('/schemes', async (req, res) => {
  try {
    const schemes = await prisma.governmentScheme.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(schemes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch schemes' });
  }
});

router.post(
  '/schemes',
  body('name').isString(),
  body('description').isString(),
  body('category').isString(),
  body('department').isString(),
  body('benefits').isString(),
  body('eligibilityCriteria').isString(),
  body('applicationProcess').isString(),
  body('requiredDocuments').isString(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const scheme = await prisma.governmentScheme.create({
        data: req.body
      });
      cacheClear('schemes:');
      await auditLog({
        actorId: req.user?.userId,
        action: 'SCHEME_CREATE',
        entityType: 'GovernmentScheme',
        entityId: scheme.id
      });
      res.status(201).json(scheme);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create scheme' });
    }
  }
);

router.put(
  '/schemes/:id',
  body('name').optional().isString(),
  body('description').optional().isString(),
  body('category').optional().isString(),
  body('department').optional().isString(),
  body('benefits').optional().isString(),
  body('eligibilityCriteria').optional().isString(),
  body('applicationProcess').optional().isString(),
  body('requiredDocuments').optional().isString(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const scheme = await prisma.governmentScheme.update({
        where: { id: req.params.id },
        data: req.body
      });
      cacheClear('schemes:');
      await auditLog({
        actorId: req.user?.userId,
        action: 'SCHEME_UPDATE',
        entityType: 'GovernmentScheme',
        entityId: scheme.id
      });
      res.json(scheme);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update scheme' });
    }
  }
);

router.delete('/schemes/:id', async (req, res) => {
  try {
    const scheme = await prisma.governmentScheme.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });
    cacheClear('schemes:');
    await auditLog({
      actorId: req.user?.userId,
      action: 'SCHEME_DEACTIVATE',
      entityType: 'GovernmentScheme',
      entityId: scheme.id
    });
    res.json(scheme);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete scheme' });
  }
});

// Applications
router.get('/applications', async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        scheme: { select: { id: true, name: true } }
      },
      orderBy: { submittedAt: 'desc' }
    });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

router.put('/applications/:id/review', async (req, res) => {
  try {
    const { status, rejectionReason } = req.body || {};
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const updates: any = {
      status,
      reviewedAt: new Date()
    };

    if (status === 'APPROVED') {
      updates.approvedAt = new Date();
      updates.rejectedAt = null;
      updates.rejectionReason = null;
    }

    if (status === 'REJECTED') {
      updates.rejectedAt = new Date();
      updates.rejectionReason = rejectionReason || 'Not eligible';
    }

    const application = await transitionApplicationStatus({
      applicationId: req.params.id,
      newStatus: status,
      rejectionReason,
      actorId: req.user?.userId
    });

    res.json(application);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update application' });
  }
});

// Users
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        state: true,
        isActive: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Analytics
router.get('/analytics', async (req, res) => {
  try {
    const cached = cacheGet<any>('admin:analytics');
    if (cached) {
      return res.json(cached);
    }

    const [totalUsers, totalApplications, approvedApplications, rejectedApplications, mostPopularSchemes, appsForSeg] =
      await Promise.all([
        prisma.user.count(),
        prisma.application.count(),
        prisma.application.count({ where: { status: 'APPROVED' } }),
        prisma.application.count({ where: { status: 'REJECTED' } }),
        prisma.governmentScheme.findMany({
          select: {
            id: true,
            name: true,
            applications: { select: { id: true } }
          }
        }),
        prisma.application.findMany({
          include: {
            user: { select: { state: true } },
            scheme: { select: { category: true } }
          }
        })
      ]);

    const popular = mostPopularSchemes
      .map((scheme) => ({
        id: scheme.id,
        name: scheme.name,
        applicationCount: scheme.applications.length
      }))
      .sort((a, b) => b.applicationCount - a.applicationCount)
      .slice(0, 6);

    const statusDistribution: Record<string, number> = {};
    const categoryBreakdown: Record<string, number> = {};
    const stateBreakdown: Record<string, number> = {};

    appsForSeg.forEach((app) => {
      statusDistribution[app.status] = (statusDistribution[app.status] || 0) + 1;
      const category = app.scheme?.category || 'Unknown';
      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;
      const state = app.user?.state || 'Unknown';
      stateBreakdown[state] = (stateBreakdown[state] || 0) + 1;
    });

    const payload = {
      totalUsers,
      totalApplications,
      approvedApplications,
      rejectedApplications,
      mostPopularSchemes: popular,
      statusDistribution,
      categoryBreakdown,
      stateBreakdown
    };
    cacheSet('admin:analytics', payload, 60 * 1000);
    res.json(payload);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Audit logs
router.get('/audit-logs', async (req, res) => {
  try {
    const { action, entityType, actorId, q, page, pageSize } = req.query as any;
    const where: any = {};
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;
    if (actorId) where.actorId = actorId;
    if (q) {
      where.OR = [
        { action: { contains: q, mode: 'insensitive' } },
        { entityType: { contains: q, mode: 'insensitive' } },
        { entityId: { contains: q, mode: 'insensitive' } }
      ];
    }

    const take = Math.min(parseInt(pageSize || '50', 10), 200);
    const skip = Math.max((parseInt(page || '1', 10) - 1) * take, 0);
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        skip
      }),
      prisma.auditLog.count({ where })
    ]);
    res.json({
      data: logs.map((log) => ({
        ...log,
        metadata: (() => {
          try { return log.metadata ? JSON.parse(log.metadata) : null; } catch { return null; }
        })()
      })),
      meta: { total, page: Number(page || 1), pageSize: take }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Import schemes from CSV
router.post('/schemes/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'CSV file is required' });
    }

    const csv = req.file.buffer.toString('utf8');
    const records = parse(csv, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    }) as any[];

    const items = records.map((obj) => {
      if (obj.incomeLimit === '') obj.incomeLimit = null;
      if (obj.familySizeLimit === '') obj.familySizeLimit = null;
      if (obj.isActive === '' || obj.isActive === undefined) obj.isActive = true;
      if (typeof obj.isActive === 'string') {
        obj.isActive = obj.isActive.toLowerCase() === 'true';
      }
      if (obj.incomeLimit !== null && obj.incomeLimit !== undefined && obj.incomeLimit !== '') {
        obj.incomeLimit = Number(obj.incomeLimit);
      }
      if (obj.familySizeLimit !== null && obj.familySizeLimit !== undefined && obj.familySizeLimit !== '') {
        obj.familySizeLimit = Number(obj.familySizeLimit);
      }
      return obj;
    });

    const results = await importSchemes(items);
    cacheClear('schemes:');
    await auditLog({
      actorId: req.user?.userId,
      action: 'SCHEME_IMPORT',
      entityType: 'GovernmentScheme',
      metadata: { rows: items.length }
    });
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: 'Failed to import schemes' });
  }
});

export default router;
