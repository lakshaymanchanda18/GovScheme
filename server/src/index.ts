import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { sign } from 'jsonwebtoken';
import { hash, compare } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import rateLimit from 'express-rate-limit';
import { prisma } from './config/prisma';
import schemesRoutes from './routes/schemes';
import applicationsRoutes from './routes/applications';
import usersRoutes from './routes/users';
import notificationsRoutes from './routes/notifications';
import adminRoutes from './routes/admin';
import chatbotRoutes from './routes/chatbot';
import eligibilityRoutes from './routes/eligibility';
import integrationsRoutes from './routes/integrations';
import voiceRoutes from './routes/voice';
import documentsRoutes from './routes/documents';
import { authenticateToken } from './middleware/auth';
import { validate, registerSchema, loginSchema } from './middleware/validation';
import { csrfTokenHandler } from './middleware/csrf';
import { AppError } from './utils/errors';
import { encryptPII, decryptPII } from './services/encryption';
import { registerHandler, startQueueWorker, enqueueJob } from './services/queue';
import { cacheSet } from './services/cache';
import { sendWelcomeEmail } from './services/email';
import { importSchemes, loadJsonFile } from './services/schemeImport';
import { setupSwagger } from './swagger';
import path from 'path';

dotenv.config();

const app = express();

// API Documentation (Swagger UI at /api-docs)
setupSwagger(app);
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    callback(null, origin || true);
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Cookie configuration for JWT tokens
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

// Request ID + structured logging
app.use((req, res, next) => {
  const requestId = uuidv4();
  (req as any).requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? 'ERROR' : res.statusCode >= 400 ? 'WARN' : 'INFO';
    console.log(`[${level}] [${requestId}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests from this IP', code: 'RATE_LIMIT' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many auth requests', code: 'RATE_LIMIT' },
});
const chatbotLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many chatbot requests', code: 'RATE_LIMIT' },
});
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many upload requests', code: 'RATE_LIMIT' },
});

// ─── HEALTH CHECK ─────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    uptime: process.uptime(),
  });
});

// Targeted rate limits
app.use('/api/auth', authLimiter);
app.use('/api/chatbot', chatbotLimiter);
app.use('/api/documents/upload', uploadLimiter);

// CSRF token endpoint (before CSRF protection middleware)
app.get('/api/auth/csrf-token', csrfTokenHandler);

// ─── AUTH ROUTES (with Zod validation) ────────────────────────

app.post('/api/auth/register', validate(registerSchema), async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, state, city, occupation, income } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'An account with this email already exists',
        code: 'CONFLICT',
        requestId: (req as any).requestId,
      });
    }

    const hashedPassword = await hash(password, 12);

    const userData = encryptPII({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone: phone || null,
      state: state || null,
      city: city || null,
      occupation: occupation || null,
      income: income ? parseFloat(String(income)) : null,
    });

    const newUser = await prisma.user.create({ data: userData });

    const token = sign({ userId: newUser.id }, process.env.JWT_SECRET || 'default-secret', {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    });

    res.cookie('token', token, COOKIE_OPTIONS);

    // Send welcome email (async via queue)
    sendWelcomeEmail(email, firstName);

    const safeUser = decryptPII({
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
      phone: newUser.phone,
      state: newUser.state,
      city: newUser.city,
      occupation: newUser.occupation,
      income: newUser.income,
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: safeUser,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      code: 'INTERNAL_ERROR',
      requestId: (req as any).requestId,
    });
  }
});

app.post('/api/auth/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Invalid email or password',
        code: 'AUTHENTICATION_ERROR',
        requestId: (req as any).requestId,
      });
    }

    const isValidPassword = await compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid email or password',
        code: 'AUTHENTICATION_ERROR',
        requestId: (req as any).requestId,
      });
    }

    const token = sign({ userId: user.id }, process.env.JWT_SECRET || 'default-secret', {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    });

    res.cookie('token', token, COOKIE_OPTIONS);

    const safeUser = decryptPII({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone,
      state: user.state,
      city: user.city,
      occupation: user.occupation,
      income: user.income,
      education: user.education,
      familySize: user.familySize,
    });

    res.json({
      message: 'Login successful',
      user: safeUser,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      code: 'INTERNAL_ERROR',
      requestId: (req as any).requestId,
    });
  }
});

// Logout endpoint - clears HTTP-Only cookie
app.post('/api/auth/logout', (_req, res) => {
  res.clearCookie('token', { path: '/' });
  res.json({ message: 'Logged out successfully' });
});

// Auth profile endpoint
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated', code: 'AUTHENTICATION_ERROR' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        address: true,
        city: true,
        state: true,
        pincode: true,
        aadharNumber: true,
        panNumber: true,
        income: true,
        occupation: true,
        education: true,
        familySize: true,
        disability: true,
        veteranStatus: true,
        role: true,
        twoFactorEnabled: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found', code: 'NOT_FOUND' });
    }

    res.json(decryptPII(user as any));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile', code: 'INTERNAL_ERROR' });
  }
});

// Token refresh endpoint
app.post('/api/auth/refresh', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User account is inactive' });
    }

    const token = sign({ userId: user.id }, process.env.JWT_SECRET || 'default-secret', {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    });

    res.cookie('token', token, COOKIE_OPTIONS);
    res.json({ message: 'Token refreshed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

// Dashboard stats endpoint
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const [totalSchemes, applications, eligibilityChecks] = await Promise.all([
      prisma.governmentScheme.count({ where: { isActive: true } }),
      prisma.application.findMany({
        where: { userId },
        select: { status: true }
      }),
      prisma.eligibilityCheck.count({
        where: { userId, isEligible: true }
      })
    ]);

    const totalApplications = applications.length;
    const pendingApplications = applications.filter(a => a.status === 'PENDING').length;
    const approvedApplications = applications.filter(a => a.status === 'APPROVED').length;
    const rejectedApplications = applications.filter(a => a.status === 'REJECTED').length;

    res.json({
      totalSchemes,
      eligibleSchemes: eligibilityChecks,
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// ─── MOUNT ROUTES ─────────────────────────────────────────────

app.use('/api/schemes', schemesRoutes);
app.use('/api/applications', authenticateToken, applicationsRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/users', authenticateToken, usersRoutes);
app.use('/api/notifications', authenticateToken, notificationsRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/eligibility', eligibilityRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/voice', voiceRoutes);

// ─── BACKGROUND JOB HANDLERS ─────────────────────────────────

registerHandler('UPLOAD_PROCESSED', async (payload) => {
  await prisma.notification.create({
    data: {
      userId: payload.userId,
      title: 'Document uploaded',
      message: `Your document "${payload.documentName}" was uploaded successfully.`,
      type: 'INFO'
    }
  });
});

registerHandler('ANALYTICS_REFRESH', async () => {
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

  cacheSet('admin:analytics', {
    totalUsers,
    totalApplications,
    approvedApplications,
    rejectedApplications,
    mostPopularSchemes: popular,
    statusDistribution,
    categoryBreakdown,
    stateBreakdown
  }, 60 * 1000);
});

startQueueWorker(1000);

// Periodic analytics refresh
setInterval(() => {
  enqueueJob('ANALYTICS_REFRESH', {});
}, 60000);

// Periodic scheme validation (staleness check)
registerHandler('SCHEME_VALIDATE', async () => {
  const schemes = await prisma.governmentScheme.findMany();
  const stale = schemes.filter((s) => Date.now() - new Date(s.updatedAt).getTime() > 1000 * 60 * 60 * 24 * 180);
  if (stale.length > 0) {
    console.log(`[WARN] Stale schemes detected: ${stale.length}`);
  }
});

setInterval(() => {
  enqueueJob('SCHEME_VALIDATE', {});
}, 1000 * 60 * 60 * 24);

// Periodic scheme refresh from local seed file
registerHandler('SCHEME_REFRESH', async () => {
  const seedPath = path.resolve(process.cwd(), '../data/schemes.seed.json');
  try {
    const schemes = loadJsonFile(seedPath);
    await importSchemes(schemes);
    console.log('[INFO] Scheme refresh completed');
  } catch (error) {
    console.error('[ERROR] Scheme refresh failed', error);
  }
});

setInterval(() => {
  enqueueJob('SCHEME_REFRESH', {});
}, 1000 * 60 * 60 * 24 * 7);

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────

app.use((err: any, req: any, res: any, _next: any) => {
  console.error(`[ERROR] [${(req as any).requestId}]`, err.stack || err.message);

  // Handle known AppError types
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      details: err.details,
      requestId: (req as any).requestId,
    });
  }

  // Handle Prisma errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'A record with this value already exists',
      code: 'CONFLICT',
      requestId: (req as any).requestId,
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Record not found',
      code: 'NOT_FOUND',
      requestId: (req as any).requestId,
    });
  }

  // Default 500
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : (err.message || 'Internal server error'),
    code: 'INTERNAL_ERROR',
    requestId: (req as any).requestId,
  });
});

// ─── START SERVER ─────────────────────────────────────────────

app.listen(PORT as number, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT} (0.0.0.0)`);
  console.log(`📋 API docs: http://localhost:${PORT}/api-docs`);
  console.log(`💊 Health:   http://localhost:${PORT}/api/health`);
});
