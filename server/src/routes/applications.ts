import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { body, validationResult } from 'express-validator';
import { prisma } from '../config/prisma';
import { auditLog } from '../services/audit';
import { enqueueJob } from '../services/queue';

const router = Router();
const uploadsDir = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname}`);
  }
});

const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type'));
    }
    cb(null, true);
  }
});

const parseJson = <T>(value: any, fallback: T): T => {
  if (!value) return fallback;
  try {
    if (typeof value === 'string') return JSON.parse(value) as T;
    return value as T;
  } catch {
    return fallback;
  }
};

const stringifyJson = (value: any) => {
  if (value === undefined) return undefined;
  return typeof value === 'string' ? value : JSON.stringify(value);
};

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
          applicationData: stringifyJson(applicationData),
          documents: stringifyJson(documents)
        }
      });

      await prisma.notification.create({
        data: {
          userId,
          title: 'Application submitted',
          message: 'Your application was submitted successfully.',
          type: 'INFO'
        }
      });
      await auditLog({
        actorId: userId,
        action: 'APPLICATION_SUBMIT',
        entityType: 'Application',
        entityId: application.id
      });

      res.status(201).json({
        message: 'Application submitted successfully',
        application: {
          ...application,
          applicationData: parseJson(application.applicationData, {}),
          documents: parseJson(application.documents, [])
        }
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

    const withParsed = applications.map((app) => ({
      ...app,
      applicationData: parseJson(app.applicationData, {}),
      documents: parseJson(app.documents, []),
      progress: app.status === 'APPROVED' || app.status === 'REJECTED'
        ? 100
        : app.status === 'REVIEWED'
          ? 70
          : 40
    }));

    res.json(withParsed);
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

    res.json({
      ...application,
      applicationData: parseJson(application.applicationData, {}),
      documents: parseJson(application.documents, [])
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

// Upload document
router.post('/upload', (req, res, next) => {
  upload.single('file')(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'Invalid upload' });
    }
    next();
  });
}, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { applicationId } = req.body || {};
    if (!applicationId || !req.file) {
      return res.status(400).json({ error: 'applicationId and file are required' });
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId }
    });

    if (!application || application.userId !== userId) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const existingDocs = parseJson<any[]>(application.documents, []);
    const docMeta = {
      id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
      name: req.file.originalname,
      type: req.file.mimetype,
      path: req.file.filename,
      uploadedAt: new Date().toISOString(),
      status: 'uploaded'
    };

    const updated = [...existingDocs, docMeta];

    await prisma.application.update({
      where: { id: applicationId },
      data: { documents: JSON.stringify(updated) }
    });

    enqueueJob('UPLOAD_PROCESSED', {
      userId,
      applicationId,
      documentName: docMeta.name
    });

    await auditLog({
      actorId: userId,
      action: 'DOCUMENT_UPLOAD',
      entityType: 'Application',
      entityId: applicationId,
      metadata: { documentName: docMeta.name }
    });

    res.json({ message: 'Document uploaded', document: docMeta });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Get application documents
router.get('/:id/documents', async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const application = await prisma.application.findUnique({
      where: { id: req.params.id }
    });

    if (!application || application.userId !== userId) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const docs = parseJson<any[]>(application.documents, []);
    res.json(docs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Get status updates
router.get('/:id/status', async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const application = await prisma.application.findUnique({
      where: { id: req.params.id }
    });

    if (!application || application.userId !== userId) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const updates = await prisma.applicationStatusUpdate.findMany({
      where: { applicationId: req.params.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json(updates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch status updates' });
  }
});

// Document readiness score
router.get('/:id/readiness', async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        scheme: { select: { requiredDocuments: true } }
      }
    });

    if (!application || application.userId !== userId) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const required = application.scheme.requiredDocuments
      ? application.scheme.requiredDocuments.split(',').map((d) => d.trim()).filter(Boolean)
      : [];
    const uploaded = parseJson<any[]>(application.documents, []).map((d) => (d.name || '').toLowerCase());

    const missing = required.filter((reqDoc) => {
      const token = reqDoc.toLowerCase();
      return !uploaded.some((u) => u.includes(token));
    });

    const total = required.length || 1;
    const readinessPercent = Math.round(((required.length - missing.length) / total) * 100);

    res.json({
      readinessPercent,
      missingDocuments: missing
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to compute readiness' });
  }
});

export default router;
