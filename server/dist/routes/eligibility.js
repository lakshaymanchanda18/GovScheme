"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../config/prisma");
const eligibilityChecker_1 = require("../services/eligibilityChecker");
const geminiAI_1 = require("../services/geminiAI");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
/**
 * POST /api/eligibility/check
 * Check eligibility for a single scheme (requires auth, stores history).
 */
router.post('/check', auth_1.authenticateToken, (0, validation_1.validate)(validation_1.eligibilityCheckSchema), async (req, res) => {
    try {
        const { schemeId } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const result = await eligibilityChecker_1.eligibilityChecker.checkEligibility(userId, schemeId);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Eligibility check failed' });
    }
});
/**
 * POST /api/eligibility/check-all
 * Check eligibility against ALL active schemes.
 */
router.post('/check-all', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const result = await eligibilityChecker_1.eligibilityChecker.checkAllSchemes(userId);
        res.json(result);
    }
    catch (error) {
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
        const result = await (0, geminiAI_1.aiEligibilityCheck)(req.body || {});
        res.json(result);
    }
    catch (error) {
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
        const scheme = await prisma_1.prisma.governmentScheme.findUnique({ where: { id: schemeId } });
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
        const result = eligibilityChecker_1.eligibilityChecker.evaluate(mockUser, scheme);
        res.json({
            isEligible: result.isEligible,
            confidenceScore: result.confidenceScore,
            matchedCriteria: result.matchedCriteria,
            unmatchedCriteria: result.unmatchedCriteria,
            explanation: result.explanation,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Eligibility simulation failed' });
    }
});
exports.default = router;
