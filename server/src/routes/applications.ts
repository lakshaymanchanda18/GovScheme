import { Router } from 'express';
import { prisma } from '../config/prisma';
import { auditLog } from '../services/audit';
import { enqueueJob } from '../services/queue';
import { validate, applicationSubmitSchema, applicationUpdateSchema } from '../middleware/validation';
import { sendApplicationSubmittedEmail } from '../services/email';

const router = Router();

// Helper to safely stringify JSON for storage
const stringifyJson = (value: any) => {
  if (value === undefined) return undefined;
  return typeof value === 'string' ? value : JSON.stringify(value);
};

// Helper to safely parse JSON from storage
const parseJson = <T>(value: any, fallback: T): T => {
  if (!value) return fallback;
  try {
    if (typeof value === 'string') return JSON.parse(value) as T;
    return value as T;
  } catch {
    return fallback;
  }
};

/**
 * POST /api/applications
 * Submit a new application.
 */
router.post('/', validate(applicationSubmitSchema), async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const { schemeId, applicationData, documents } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const scheme = await prisma.governmentScheme.findUnique({ where: { id: schemeId } });

    if (!user || !scheme) {
      return res.status(404).json({ error: 'User or Scheme not found', code: 'NOT_FOUND' });
    }

    const application = await prisma.application.create({
      data: {
        userId,
        schemeId,
        status: 'PENDING',
        applicationData: stringifyJson(applicationData),
        documents: stringifyJson(documents), // Legacy array format just in case
      }
    });

    // Record initial status
    await prisma.applicationStatusUpdate.create({
      data: {
        applicationId: application.id,
        status: 'PENDING',
        source: 'user_submission',
      }
    });

    await auditLog({
      actorId: userId,
      action: 'APPLICATION_SUBMITTED',
      entityType: 'Application',
      entityId: application.id,
      metadata: { schemeId }
    });

    // Send confirmation email via queue
    sendApplicationSubmittedEmail(user.email, user.firstName, scheme.name, application.id);

    // Enqueue document processing if there are associated documents
    enqueueJob('PROCESS_APPLICATION_DOCUMENTS', { applicationId: application.id, userId });

    res.status(201).json({
      message: 'Application submitted successfully',
      applicationId: application.id
    });
  } catch (error: any) {
    console.error('Submit application error:', error);
    res.status(500).json({ error: 'Failed to submit application', code: 'INTERNAL_ERROR' });
  }
});

/**
 * PUT /api/applications/:id
 * Update a draft application (only allowed if PENDING).
 */
router.put('/:id', validate(applicationUpdateSchema), async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const application = await prisma.application.findUnique({ where: { id: req.params.id } });
    if (!application || application.userId !== userId) {
      return res.status(404).json({ error: 'Application not found', code: 'NOT_FOUND' });
    }

    if (application.status !== 'PENDING' && application.status !== 'DRAFT') {
      return res.status(400).json({ error: 'Cannot update an application that is already being processed', code: 'VALIDATION_ERROR' });
    }

    const { applicationData, documents } = req.body;
    const updateData: any = {};
    if (applicationData !== undefined) updateData.applicationData = stringifyJson(applicationData);
    if (documents !== undefined) updateData.documents = stringifyJson(documents);

    const updated = await prisma.application.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json({ message: 'Application updated', applicationId: updated.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update application' });
  }
});

/**
 * GET /api/applications
 * Get all applications for the current user.
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const applications = await prisma.application.findMany({
      where: { userId },
      include: {
        scheme: {
          select: { name: true, category: true, department: true }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    const formatted = applications.map(app => ({
      ...app,
      applicationData: parseJson(app.applicationData, {}),
      documents: parseJson(app.documents, [])
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

/**
 * GET /api/applications/:id
 * Get details of a specific application.
 */
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        scheme: true,
        statusUpdates: { orderBy: { createdAt: 'desc' } },
        uploadedDocuments: true, // Pull proper Document records
      }
    });

    if (!application || application.userId !== userId) {
      return res.status(404).json({ error: 'Application not found', code: 'NOT_FOUND' });
    }

    res.json({
      ...application,
      applicationData: parseJson(application.applicationData, {}),
      documents: parseJson(application.documents, [])
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

/**
 * GET /api/applications/:id/history
 * Get status history for an application.
 */
router.get('/:id/history', async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const application = await prisma.application.findUnique({ where: { id: req.params.id } });
    if (!application || application.userId !== userId) {
      return res.status(404).json({ error: 'Application not found', code: 'NOT_FOUND' });
    }

    const history = await prisma.applicationStatusUpdate.findMany({
      where: { applicationId: req.params.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

export default router;
