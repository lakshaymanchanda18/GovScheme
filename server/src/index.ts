import dotenv from 'dotenv';
// Load environment variables before any other imports
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
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

const app = express();
app.set('trust proxy', 1);

// API Documentation (Swagger UI at /api-docs)
try {
  setupSwagger(app);
} catch (e) {
  console.warn('Swagger setup skipped or failed:', e);
}
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN,
]
  .flatMap((value) => (value || '').split(','))
  .map((origin) => origin.trim())
  .filter(Boolean);

function isAllowedOrigin(origin: string) {
  if (allowedOrigins.includes(origin)) return true;
  if (/\.vercel\.app$/.test(origin)) return true;
  if (!isProduction && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  return false;
}

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean | string) => void) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (isAllowedOrigin(origin)) {
      callback(null, origin);
      return;
    }

    callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token', 'X-Request-Id', 'Accept'],
};

// Security & CORS middleware
app.use(helmet());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// URL normalization for Vercel serverless rewrites
app.use((req, _res, next) => {
  if (!req.url.startsWith('/api') && req.originalUrl && req.originalUrl.startsWith('/api')) {
    req.url = req.originalUrl;
  }
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Cookie configuration for JWT tokens
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
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
  max: 100,
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

app.get(['/api/health', '/health', '/'], (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    uptime: process.uptime(),
  });
});

// Targeted rate limits
app.use(['/api/auth', '/auth'], authLimiter);
app.use(['/api/chatbot', '/chatbot'], chatbotLimiter);
app.use(['/api/documents/upload', '/documents/upload'], uploadLimiter);

// CSRF token endpoint (before CSRF protection middleware)
app.get(['/api/auth/csrf-token', '/auth/csrf-token'], csrfTokenHandler);

// ─── AUTH ROUTES (with Zod validation) ────────────────────────

app.post(['/api/auth/register', '/auth/register'], validate(registerSchema), async (req, res) => {
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

app.post(['/api/auth/login', '/auth/login'], validate(loginSchema), async (req, res) => {
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
app.post(['/api/auth/logout', '/auth/logout'], (_req, res) => {
  res.clearCookie('token', { path: '/' });
  res.json({ message: 'Logged out successfully' });
});

// Auth profile endpoint
app.get(['/api/auth/profile', '/auth/profile'], authenticateToken, async (req, res) => {
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
app.post(['/api/auth/refresh', '/auth/refresh'], authenticateToken, async (req, res) => {
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
app.get(['/api/dashboard/stats', '/dashboard/stats'], authenticateToken, async (req, res) => {
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

app.use(['/api/schemes', '/schemes'], schemesRoutes);
app.use(['/api/applications', '/applications'], authenticateToken, applicationsRoutes);
app.use(['/api/documents', '/documents'], documentsRoutes);
app.use(['/api/users', '/users'], authenticateToken, usersRoutes);
app.use(['/api/notifications', '/notifications'], authenticateToken, notificationsRoutes);
app.use(['/api/admin', '/admin'], authenticateToken, adminRoutes);
app.use(['/api/chatbot', '/chatbot'], chatbotRoutes);
app.use(['/api/eligibility', '/eligibility'], eligibilityRoutes);
app.use(['/api/integrations', '/integrations'], integrationsRoutes);
app.use(['/api/voice', '/voice'], voiceRoutes);

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────

app.use((err: any, req: any, res: any, _next: any) => {
  console.error(`[ERROR] [${(req as any).requestId}]`, err.stack || err.message);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      details: err.details,
      requestId: (req as any).requestId,
    });
  }

  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : (err.message || 'Internal server error'),
    code: 'INTERNAL_ERROR',
    requestId: (req as any).requestId,
  });
});

// ─── START SERVER ─────────────────────────────────────────────

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT as number, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT} (0.0.0.0)`);
    console.log(`📋 API docs: http://localhost:${PORT}/api-docs`);
    console.log(`💊 Health:   http://localhost:${PORT}/api/health`);
  });
}

export = app;
