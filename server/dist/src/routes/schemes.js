"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const prisma_1 = require("../config/prisma");
const eligibilityChecker_1 = require("../services/eligibilityChecker");
const auth_1 = require("../middleware/auth");
const cache_1 = require("../services/cache");
const router = (0, express_1.Router)();
// Get all active schemes with filtering
router.get('/', async (req, res) => {
    try {
        const { category, department, state, q } = req.query;
        const userId = req.user?.userId;
        const cacheKey = `schemes:${category || ''}:${department || ''}:${state || ''}`;
        if (!userId && !q) {
            const cached = (0, cache_1.cacheGet)(cacheKey);
            if (cached)
                return res.json(cached);
        }
        const whereClause = { isActive: true };
        if (category)
            whereClause.category = { contains: category, mode: 'insensitive' };
        if (department)
            whereClause.department = { contains: department, mode: 'insensitive' };
        if (state)
            whereClause.stateSpecific = { contains: state, mode: 'insensitive' };
        if (q) {
            whereClause.OR = [
                { name: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
                { benefits: { contains: q, mode: 'insensitive' } },
                { eligibilityCriteria: { contains: q, mode: 'insensitive' } },
                { category: { contains: q, mode: 'insensitive' } },
                { department: { contains: q, mode: 'insensitive' } }
            ];
        }
        const schemes = await prisma_1.prisma.governmentScheme.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            include: {
                eligibilityChecks: {
                    where: { userId },
                    orderBy: { checkedAt: 'desc' },
                    take: 1
                }
            }
        });
        const withMeta = schemes.map((s) => ({
            ...s,
            lastUpdated: s.updatedAt,
            isStale: Date.now() - new Date(s.updatedAt).getTime() > 1000 * 60 * 60 * 24 * 180
        }));
        if (!userId && !q)
            (0, cache_1.cacheSet)(cacheKey, withMeta, 60 * 1000);
        res.json(withMeta);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch schemes' });
    }
});
// Search endpoint with facets
router.get('/search', async (req, res) => {
    try {
        const { q, category, department, state } = req.query;
        const whereClause = { isActive: true };
        if (category)
            whereClause.category = { contains: category, mode: 'insensitive' };
        if (department)
            whereClause.department = { contains: department, mode: 'insensitive' };
        if (state)
            whereClause.stateSpecific = { contains: state, mode: 'insensitive' };
        if (q) {
            whereClause.OR = [
                { name: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
                { benefits: { contains: q, mode: 'insensitive' } },
                { eligibilityCriteria: { contains: q, mode: 'insensitive' } },
                { category: { contains: q, mode: 'insensitive' } },
                { department: { contains: q, mode: 'insensitive' } }
            ];
        }
        const schemes = await prisma_1.prisma.governmentScheme.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' }
        });
        res.json(schemes.map((s) => ({
            ...s,
            lastUpdated: s.updatedAt,
            isStale: Date.now() - new Date(s.updatedAt).getTime() > 1000 * 60 * 60 * 24 * 180
        })));
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to search schemes' });
    }
});
// Check eligibility for a scheme
router.post('/check-eligibility', auth_1.authenticateToken, (0, express_validator_1.body)('schemeId').isString(), async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { schemeId } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const result = await eligibilityChecker_1.eligibilityChecker.checkEligibility(userId, schemeId);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to check eligibility' });
    }
});
// Get personalized scheme recommendations
router.get('/recommendations', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const recommendations = await eligibilityChecker_1.eligibilityChecker.getRecommendations(userId);
        res.json(recommendations);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get recommendations' });
    }
});
// Get scheme details by ID
router.get('/:id', async (req, res) => {
    try {
        const scheme = await prisma_1.prisma.governmentScheme.findUnique({
            where: { id: req.params.id },
            include: {
                eligibilityChecks: {
                    where: { userId: req.user?.userId },
                    orderBy: { checkedAt: 'desc' },
                    take: 1
                }
            }
        });
        if (!scheme)
            return res.status(404).json({ error: 'Scheme not found' });
        res.json({
            ...scheme,
            lastUpdated: scheme.updatedAt,
            isStale: Date.now() - new Date(scheme.updatedAt).getTime() > 1000 * 60 * 60 * 24 * 180
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch scheme' });
    }
});
exports.default = router;
