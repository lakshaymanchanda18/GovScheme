import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { verify, sign } from 'jsonwebtoken';
import { hash, compare } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { createTransport } from 'nodemailer';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import { prisma } from './config/prisma';
import schemesRoutes from './routes/schemes';
import applicationsRoutes from './routes/applications';
import usersRoutes from './routes/users';
import notificationsRoutes from './routes/notifications';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: { userId: string };
    }
  }
}

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175'
];
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL, ...defaultAllowedOrigins]
  : defaultAllowedOrigins;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP'
});
app.use(limiter);

// Email setup
const transporter = createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// JWT middleware
const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  verify(token, process.env.JWT_SECRET || 'default-secret', (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// User routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName
      }
    });

    const token = sign({ userId: newUser.id }, process.env.JWT_SECRET || 'default-secret', {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = sign({ userId: user.id }, process.env.JWT_SECRET || 'default-secret', {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Mount routes
app.use('/api/schemes', schemesRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/notifications', notificationsRoutes);

// Scheme routes
app.get('/api/schemes', async (req, res) => {
  try {
    const { category, department, state } = req.query;

    const where: any = { isActive: true };

    if (category) where.category = category;
    if (department) where.department = department;
    if (state) where.stateSpecific = { contains: state };

    const schemes = await prisma.governmentScheme.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json(schemes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch schemes' });
  }
});

// Eligibility checker (AI-powered)
app.post('/api/eligibility/check', authenticateToken, async (req, res) => {
  try {
    const { schemeId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    const scheme = await prisma.governmentScheme.findUnique({
      where: { id: schemeId }
    });

    if (!scheme) {
      return res.status(404).json({ error: 'Scheme not found' });
    }

    // AI eligibility assessment
    const eligibilityResult = await assessEligibility(user, scheme);

    await prisma.eligibilityCheck.create({
      data: {
        userId,
        schemeId,
        isEligible: eligibilityResult.isEligible,
        confidenceScore: eligibilityResult.confidenceScore,
        matchedCriteria: eligibilityResult.matchedCriteria,
        unmatchedCriteria: eligibilityResult.unmatchedCriteria
      }
    });

    res.json(eligibilityResult);
  } catch (error) {
    res.status(500).json({ error: 'Eligibility check failed' });
  }
});

// AI eligibility + recommendations (heuristic scoring, non-agentic)
app.post('/api/eligibility/ai-check', async (req, res) => {
  try {
    const { personalInfo, financialInfo, additionalInfo, userId } = req.body || {};

    const profileFromBody = {
      age: Number(personalInfo?.age) || undefined,
      state: personalInfo?.state || undefined,
      familySize: Number(personalInfo?.familySize) || undefined,
      education: personalInfo?.education || undefined,
      occupation: personalInfo?.occupation || undefined,
      income: Number(financialInfo?.income) || undefined,
      disability: additionalInfo?.disability || undefined,
      veteranStatus: additionalInfo?.veteranStatus || undefined,
      caste: additionalInfo?.caste || undefined
    };

    let userProfile: any = profileFromBody;
    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        userProfile = {
          ...userProfile,
          state: userProfile.state || user.state || undefined,
          familySize: userProfile.familySize || user.familySize || undefined,
          education: userProfile.education || user.education || undefined,
          occupation: userProfile.occupation || user.occupation || undefined,
          income: userProfile.income || (user.income ? Number(user.income) : undefined),
          disability: userProfile.disability || user.disability || undefined,
          veteranStatus: userProfile.veteranStatus || user.veteranStatus || undefined
        };
        if (!userProfile.age && user.dateOfBirth) {
          userProfile.age = calculateAge(user.dateOfBirth);
        }
      }
    }

    const schemes = await prisma.governmentScheme.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    const scored = schemes.map((scheme) => {
      const { score, reasons, isEligible } = scoreScheme(userProfile, scheme);
      return {
        scheme,
        score,
        reasons,
        isEligible
      };
    }).sort((a, b) => b.score - a.score);

    const top = scored.slice(0, 5);
    const best = top[0];

    const matchedCriteria = best ? best.reasons.matched : [];
    const unmatchedCriteria = best ? best.reasons.unmatched : [];
    const confidenceScore = best ? best.score : 0;
    const isEligible = best ? best.isEligible : false;

    const recommendedSchemes = top.map((item) => ({
      id: item.scheme.id,
      name: item.scheme.name,
      matchPercentage: Math.round(item.score * 100),
      benefits: item.scheme.benefits,
      whyRecommended: item.reasons.matched
    }));

    const documentSuggestions = best?.scheme?.requiredDocuments
      ? best.scheme.requiredDocuments.split(',').map((d: string) => d.trim()).filter(Boolean)
      : [];

    res.json({
      isEligible,
      confidenceScore,
      matchedCriteria,
      unmatchedCriteria,
      recommendedSchemes,
      documentSuggestions
    });
  } catch (error) {
    res.status(500).json({ error: 'AI eligibility check failed' });
  }
});

// Application routes
app.post('/api/applications', authenticateToken, async (req, res) => {
  try {
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
});

// Notification routes
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId, isRead: false },
      orderBy: { createdAt: 'desc' }
    });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// AI eligibility assessment function
const assessEligibility = async (user: any, scheme: any) => {
  const criteria = JSON.parse(scheme.eligibilityCriteria || '{}');
  const userData = JSON.parse(JSON.stringify(user));

  let matchedCriteria: any = {};
  let unmatchedCriteria: any = {};
  let isEligible = true;
  let confidenceScore = 1.0;

  // Check income criteria
  if (criteria.incomeLimit && user.income) {
    if (user.income <= criteria.incomeLimit) {
      matchedCriteria.income = true;
    } else {
      unmatchedCriteria.income = `Income exceeds limit of ${criteria.incomeLimit}`;
      isEligible = false;
    }
  }

  // Check age criteria
  if (criteria.ageLimit && user.dateOfBirth) {
    const age = calculateAge(user.dateOfBirth);
    const ageLimits = criteria.ageLimit.split('-');
    const minAge = parseInt(ageLimits[0]);
    const maxAge = ageLimits[1] ? parseInt(ageLimits[1]) : undefined;

    if ((maxAge !== undefined && age < minAge) || (maxAge !== undefined && age > maxAge)) {
      unmatchedCriteria.age = `Age not within ${criteria.ageLimit} years`;
      isEligible = false;
    } else {
      matchedCriteria.age = true;
    }
  }

  // Check education criteria
  if (criteria.educationCriteria && user.education) {
    if (user.education.toLowerCase().includes(criteria.educationCriteria.toLowerCase())) {
      matchedCriteria.education = true;
    } else {
      unmatchedCriteria.education = `Education does not match ${criteria.educationCriteria}`;
      isEligible = false;
    }
  }

  // Check occupation criteria
  if (criteria.occupationCriteria && user.occupation) {
    if (user.occupation.toLowerCase().includes(criteria.occupationCriteria.toLowerCase())) {
      matchedCriteria.occupation = true;
    } else {
      unmatchedCriteria.occupation = `Occupation does not match ${criteria.occupationCriteria}`;
      isEligible = false;
    }
  }

  // Check disability criteria
  if (criteria.disabilityCriteria && user.disability) {
    if (criteria.disabilityCriteria === 'any' || user.disability.toLowerCase().includes(criteria.disabilityCriteria.toLowerCase())) {
      matchedCriteria.disability = true;
    } else {
      unmatchedCriteria.disability = `Disability does not match ${criteria.disabilityCriteria}`;
      isEligible = false;
    }
  }

  // Check state-specific criteria
  if (criteria.stateSpecific && user.state) {
    if (user.state.toLowerCase().includes(criteria.stateSpecific.toLowerCase())) {
      matchedCriteria.state = true;
    } else {
      unmatchedCriteria.state = `State does not match ${criteria.stateSpecific}`;
      isEligible = false;
    }
  }

  // Calculate confidence score
  const totalCriteria = Object.keys(criteria).length;
  const matchedCount = Object.keys(matchedCriteria).length;
  confidenceScore = matchedCount / totalCriteria;

  return {
    isEligible,
    confidenceScore,
    matchedCriteria,
    unmatchedCriteria,
    recommendation: isEligible ? 'Eligible' : 'Not Eligible'
  };
};

const calculateAge = (birthDate: Date) => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

const parseAgeLimit = (ageLimit?: string | null) => {
  if (!ageLimit) return { min: undefined, max: undefined };
  const parts = ageLimit.split('-').map((p) => parseInt(p.trim(), 10)).filter((n) => !Number.isNaN(n));
  if (parts.length === 1) return { min: parts[0], max: parts[0] };
  return { min: parts[0], max: parts[1] };
};

const scoreScheme = (user: any, scheme: any) => {
  const matched: string[] = [];
  const unmatched: string[] = [];

  let score = 0;
  let totalWeight = 0;
  const weights = {
    income: 0.35,
    education: 0.2,
    state: 0.15,
    occupation: 0.15,
    age: 0.15
  };

  const addScore = (weight: number, isMatch: boolean, reasonMatch: string, reasonNo: string) => {
    totalWeight += weight;
    if (isMatch) {
      score += weight;
      matched.push(reasonMatch);
    } else {
      unmatched.push(reasonNo);
    }
  };

  const incomeLimit = scheme.incomeLimit ? Number(scheme.incomeLimit) : undefined;
  if (incomeLimit !== undefined && user.income !== undefined) {
    addScore(weights.income, user.income <= incomeLimit, 'Income within limit', `Income exceeds ${incomeLimit}`);
  }

  const { min, max } = parseAgeLimit(scheme.ageLimit);
  if (user.age !== undefined && (min !== undefined || max !== undefined)) {
    const okMin = min === undefined || user.age >= min;
    const okMax = max === undefined || user.age <= max;
    addScore(weights.age, okMin && okMax, 'Age matches scheme', 'Age outside allowed range');
  }

  if (scheme.educationCriteria && user.education) {
    const ok = user.education.toLowerCase().includes(String(scheme.educationCriteria).toLowerCase());
    addScore(weights.education, ok, 'Education matches', 'Education does not match');
  }

  if (scheme.occupationCriteria && user.occupation) {
    const ok = user.occupation.toLowerCase().includes(String(scheme.occupationCriteria).toLowerCase());
    addScore(weights.occupation, ok, 'Occupation matches', 'Occupation does not match');
  }

  if (scheme.stateSpecific && user.state) {
    const ok = user.state.toLowerCase().includes(String(scheme.stateSpecific).toLowerCase());
    addScore(weights.state, ok, 'State matches scheme', 'State does not match');
  }

  const finalScore = totalWeight > 0 ? score / totalWeight : 0;
  const isEligible = unmatched.length === 0;

  return { score: finalScore, reasons: { matched, unmatched }, isEligible };
};

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
