import { Router } from 'express';
import { prisma } from '../config/prisma';
import { eligibilityChecker } from '../services/eligibilityChecker';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Standard eligibility check (uses rules + stores history)
router.post('/check', authenticateToken, async (req, res) => {
  try {
    const { schemeId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!schemeId) {
      return res.status(400).json({ error: 'schemeId is required' });
    }

    const result = await eligibilityChecker.checkEligibility(userId, schemeId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Eligibility check failed' });
  }
});

// AI eligibility + recommendations (heuristic scoring, non-agentic)
router.post('/ai-check', async (req, res) => {
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

    const scored = schemes
      .map((scheme) => {
        const { score, reasons, isEligible } = scoreScheme(userProfile, scheme);
        return { scheme, score, reasons, isEligible };
      })
      .sort((a, b) => b.score - a.score);

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

// Eligibility simulation ("what if")
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

    const { score, reasons, isEligible } = scoreScheme(profile, scheme);

    res.json({
      isEligible,
      confidenceScore: score,
      matchedCriteria: reasons.matched,
      unmatchedCriteria: reasons.unmatched
    });
  } catch (error) {
    res.status(500).json({ error: 'Eligibility simulation failed' });
  }
});

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
  const parts = ageLimit
    .split('-')
    .map((p) => parseInt(p.trim(), 10))
    .filter((n) => !Number.isNaN(n));
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

export default router;
