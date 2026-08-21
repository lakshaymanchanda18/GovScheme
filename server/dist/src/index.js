"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables before any other imports
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const jsonwebtoken_1 = require("jsonwebtoken");
const bcryptjs_1 = require("bcryptjs");
const uuid_1 = require("uuid");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const prisma_1 = require("./config/prisma");
const schemes_1 = __importDefault(require("./routes/schemes"));
const applications_1 = __importDefault(require("./routes/applications"));
const users_1 = __importDefault(require("./routes/users"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const admin_1 = __importDefault(require("./routes/admin"));
const chatbot_1 = __importDefault(require("./routes/chatbot"));
const eligibility_1 = __importDefault(require("./routes/eligibility"));
const integrations_1 = __importDefault(require("./routes/integrations"));
const voice_1 = __importDefault(require("./routes/voice"));
const documents_1 = __importDefault(require("./routes/documents"));
const auth_1 = require("./middleware/auth");
const validation_1 = require("./middleware/validation");
const csrf_1 = require("./middleware/csrf");
const errors_1 = require("./utils/errors");
const encryption_1 = require("./services/encryption");
const queue_1 = require("./services/queue");
const cache_1 = require("./services/cache");
const email_1 = require("./services/email");
const schemeImport_1 = require("./services/schemeImport");
const swagger_1 = require("./swagger");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
// API Documentation (Swagger UI at /api-docs)
(0, swagger_1.setupSwagger)(app);
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.CORS_ORIGIN,
]
    .flatMap((value) => (value || '').split(','))
    .map((origin) => origin.trim())
    .filter(Boolean);
function isAllowedOrigin(origin) {
    if (allowedOrigins.includes(origin))
        return true;
    if (/\.vercel\.app$/.test(origin))
        return true;
    if (!isProduction && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))
        return true;
    return false;
}
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
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
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
// Cookie configuration for JWT tokens
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? 'none' : 'lax'),
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
};
// Request ID + structured logging
app.use((req, res, next) => {
    const requestId = (0, uuid_1.v4)();
    req.requestId = requestId;
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
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { error: 'Too many requests from this IP', code: 'RATE_LIMIT' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many auth requests', code: 'RATE_LIMIT' },
});
const chatbotLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 30,
    message: { error: 'Too many chatbot requests', code: 'RATE_LIMIT' },
});
const uploadLimiter = (0, express_rate_limit_1.default)({
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
app.get('/api/auth/csrf-token', csrf_1.csrfTokenHandler);
// ─── AUTH ROUTES (with Zod validation) ────────────────────────
app.post('/api/auth/register', (0, validation_1.validate)(validation_1.registerSchema), async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone, state, city, occupation, income } = req.body;
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            return res.status(409).json({
                error: 'An account with this email already exists',
                code: 'CONFLICT',
                requestId: req.requestId,
            });
        }
        const hashedPassword = await (0, bcryptjs_1.hash)(password, 12);
        const userData = (0, encryption_1.encryptPII)({
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
        const newUser = await prisma_1.prisma.user.create({ data: userData });
        const token = (0, jsonwebtoken_1.sign)({ userId: newUser.id }, process.env.JWT_SECRET || 'default-secret', {
            expiresIn: process.env.JWT_EXPIRE || '7d'
        });
        res.cookie('token', token, COOKIE_OPTIONS);
        // Send welcome email (async via queue)
        (0, email_1.sendWelcomeEmail)(email, firstName);
        const safeUser = (0, encryption_1.decryptPII)({
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
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: 'Registration failed',
            code: 'INTERNAL_ERROR',
            requestId: req.requestId,
        });
    }
});
app.post('/api/auth/login', (0, validation_1.validate)(validation_1.loginSchema), async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma_1.prisma.user.findUnique({
            where: { email }
        });
        if (!user || !user.isActive) {
            return res.status(401).json({
                error: 'Invalid email or password',
                code: 'AUTHENTICATION_ERROR',
                requestId: req.requestId,
            });
        }
        const isValidPassword = await (0, bcryptjs_1.compare)(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Invalid email or password',
                code: 'AUTHENTICATION_ERROR',
                requestId: req.requestId,
            });
        }
        const token = (0, jsonwebtoken_1.sign)({ userId: user.id }, process.env.JWT_SECRET || 'default-secret', {
            expiresIn: process.env.JWT_EXPIRE || '7d'
        });
        res.cookie('token', token, COOKIE_OPTIONS);
        const safeUser = (0, encryption_1.decryptPII)({
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
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Login failed',
            code: 'INTERNAL_ERROR',
            requestId: req.requestId,
        });
    }
});
// Logout endpoint - clears HTTP-Only cookie
app.post('/api/auth/logout', (_req, res) => {
    res.clearCookie('token', { path: '/' });
    res.json({ message: 'Logged out successfully' });
});
// Auth profile endpoint
app.get('/api/auth/profile', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated', code: 'AUTHENTICATION_ERROR' });
        }
        const user = await prisma_1.prisma.user.findUnique({
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
        res.json((0, encryption_1.decryptPII)(user));
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile', code: 'INTERNAL_ERROR' });
    }
});
// Token refresh endpoint
app.post('/api/auth/refresh', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.isActive) {
            return res.status(401).json({ error: 'User account is inactive' });
        }
        const token = (0, jsonwebtoken_1.sign)({ userId: user.id }, process.env.JWT_SECRET || 'default-secret', {
            expiresIn: process.env.JWT_EXPIRE || '7d'
        });
        res.cookie('token', token, COOKIE_OPTIONS);
        res.json({ message: 'Token refreshed successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Token refresh failed' });
    }
});
// Dashboard stats endpoint
app.get('/api/dashboard/stats', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const [totalSchemes, applications, eligibilityChecks] = await Promise.all([
            prisma_1.prisma.governmentScheme.count({ where: { isActive: true } }),
            prisma_1.prisma.application.findMany({
                where: { userId },
                select: { status: true }
            }),
            prisma_1.prisma.eligibilityCheck.count({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});
// ─── MOUNT ROUTES ─────────────────────────────────────────────
app.use('/api/schemes', schemes_1.default);
app.use('/api/applications', auth_1.authenticateToken, applications_1.default);
app.use('/api/documents', documents_1.default);
app.use('/api/users', auth_1.authenticateToken, users_1.default);
app.use('/api/notifications', auth_1.authenticateToken, notifications_1.default);
app.use('/api/admin', auth_1.authenticateToken, admin_1.default);
app.use('/api/chatbot', chatbot_1.default);
app.use('/api/eligibility', eligibility_1.default);
app.use('/api/integrations', integrations_1.default);
app.use('/api/voice', voice_1.default);
// ─── BACKGROUND JOB HANDLERS ─────────────────────────────────
(0, queue_1.registerHandler)('UPLOAD_PROCESSED', async (payload) => {
    await prisma_1.prisma.notification.create({
        data: {
            userId: payload.userId,
            title: 'Document uploaded',
            message: `Your document "${payload.documentName}" was uploaded successfully.`,
            type: 'INFO'
        }
    });
});
(0, queue_1.registerHandler)('ANALYTICS_REFRESH', async () => {
    const [totalUsers, totalApplications, approvedApplications, rejectedApplications, mostPopularSchemes, appsForSeg] = await Promise.all([
        prisma_1.prisma.user.count(),
        prisma_1.prisma.application.count(),
        prisma_1.prisma.application.count({ where: { status: 'APPROVED' } }),
        prisma_1.prisma.application.count({ where: { status: 'REJECTED' } }),
        prisma_1.prisma.governmentScheme.findMany({
            select: {
                id: true,
                name: true,
                applications: { select: { id: true } }
            }
        }),
        prisma_1.prisma.application.findMany({
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
    const statusDistribution = {};
    const categoryBreakdown = {};
    const stateBreakdown = {};
    appsForSeg.forEach((app) => {
        statusDistribution[app.status] = (statusDistribution[app.status] || 0) + 1;
        const category = app.scheme?.category || 'Unknown';
        categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;
        const state = app.user?.state || 'Unknown';
        stateBreakdown[state] = (stateBreakdown[state] || 0) + 1;
    });
    (0, cache_1.cacheSet)('admin:analytics', {
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
(0, queue_1.startQueueWorker)(1000);
// Periodic analytics refresh
setInterval(() => {
    (0, queue_1.enqueueJob)('ANALYTICS_REFRESH', {});
}, 60000);
// Periodic scheme validation (staleness check)
(0, queue_1.registerHandler)('SCHEME_VALIDATE', async () => {
    const schemes = await prisma_1.prisma.governmentScheme.findMany();
    const stale = schemes.filter((s) => Date.now() - new Date(s.updatedAt).getTime() > 1000 * 60 * 60 * 24 * 180);
    if (stale.length > 0) {
        console.log(`[WARN] Stale schemes detected: ${stale.length}`);
    }
});
setInterval(() => {
    (0, queue_1.enqueueJob)('SCHEME_VALIDATE', {});
}, 1000 * 60 * 60 * 24);
// Periodic scheme refresh from local seed file
(0, queue_1.registerHandler)('SCHEME_REFRESH', async () => {
    const seedPath = path_1.default.resolve(process.cwd(), '../data/schemes.seed.json');
    try {
        const schemes = (0, schemeImport_1.loadJsonFile)(seedPath);
        await (0, schemeImport_1.importSchemes)(schemes);
        console.log('[INFO] Scheme refresh completed');
    }
    catch (error) {
        console.error('[ERROR] Scheme refresh failed', error);
    }
});
setInterval(() => {
    (0, queue_1.enqueueJob)('SCHEME_REFRESH', {});
}, 1000 * 60 * 60 * 24 * 7);
// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────
app.use((err, req, res, _next) => {
    console.error(`[ERROR] [${req.requestId}]`, err.stack || err.message);
    // Handle known AppError types
    if (err instanceof errors_1.AppError) {
        return res.status(err.statusCode).json({
            error: err.message,
            code: err.code,
            details: err.details,
            requestId: req.requestId,
        });
    }
    // Handle Prisma errors
    if (err.code === 'P2002') {
        return res.status(409).json({
            error: 'A record with this value already exists',
            code: 'CONFLICT',
            requestId: req.requestId,
        });
    }
    if (err.code === 'P2025') {
        return res.status(404).json({
            error: 'Record not found',
            code: 'NOT_FOUND',
            requestId: req.requestId,
        });
    }
    // Default 500
    const status = err.status || err.statusCode || 500;
    res.status(status).json({
        error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : (err.message || 'Internal server error'),
        code: 'INTERNAL_ERROR',
        requestId: req.requestId,
    });
});
// ─── START SERVER ─────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server running on port ${PORT} (0.0.0.0)`);
        console.log(`📋 API docs: http://localhost:${PORT}/api-docs`);
        console.log(`💊 Health:   http://localhost:${PORT}/api/health`);
    });
}
exports.default = app;
