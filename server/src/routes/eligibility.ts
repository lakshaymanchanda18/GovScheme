import { Router } from 'express';
import { prisma } from '../config/prisma';
import { eligibilityChecker } from '../services/eligibilityChecker';
import { aiEligibilityCheck } from '../services/geminiAI';
import { authenticateToken } from '../middleware/auth';
import { validate, eligibilityCheckSchema, aiEligibilitySchema } from '../middleware/validation';

const router = Router();

/**
 * POST /api/eligibility/check
 * Check eligibility for a single scheme (requires auth, stores history).
 */
router.post('/check', authenticateToken, validate(eligibilityCheckSchema), async (req, res) => {
  try {
    const { schemeId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const result = await eligibilityChecker.checkEligibility(userId, schemeId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Eligibility check failed' });
  }
});

/**
 * POST /api/eligibility/check-all
 * Check eligibility against ALL active schemes.
 */
router.post('/check-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const result = await eligibilityChecker.checkAllSchemes(userId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Bulk eligibility check failed' });
  }
});

/**
 * POST /api/eligibility/ai-check
 * AI-powered eligibility check using Gemini + rule-based scoring.
 * Can work with or without authentication (accepts profile data in body).
 */
router.post('/ai-check', async (req, res) => {
  try {
    const result = await aiEligibilityCheck(req.body || {});
    res.json(result);
  } catch (error: any) {
    console.error('AI eligibility check error:', error);
    res.status(500).json({ error: 'AI eligibility check failed' });
  }
});

/**
 * POST /api/eligibility/simulate
 * "What-if" simulation: check a hypothetical profile against a specific scheme.
 */
router.post('/simulate', async (req, res) => {
  try {
    const { schemeId, profile } = req.body || {};
    if (!schemeId || !profile) {
      return res.status(400).json({ error: 'schemeId and profile are required' });
    }

    const scheme = await prisma.governmentScheme.findUnique({ where: { id: schemeId } });
    if (!scheme) {
      return res.status(404).json({ error: 'Scheme not found' });
    }

    // Build a mock user from the profile
    const mockUser = {
      income: profile.income ? Number(profile.income) : undefined,
      dateOfBirth: profile.age
        ? new Date(Date.now() - Number(profile.age) * 365.25 * 24 * 60 * 60 * 1000)
        : undefined,
      state: profile.state,
      education: profile.education,
      occupation: profile.occupation,
      familySize: profile.familySize ? Number(profile.familySize) : undefined,
      disability: profile.disability,
      veteranStatus: profile.veteranStatus,
    };

    const result = eligibilityChecker.evaluate(mockUser, scheme);

    res.json({
      isEligible: result.isEligible,
      confidenceScore: result.confidenceScore,
      matchedCriteria: result.matchedCriteria,
      unmatchedCriteria: result.unmatchedCriteria,
      explanation: result.explanation,
    });
  } catch (error) {
    res.status(500).json({ error: 'Eligibility simulation failed' });
  }
});

export default router;
