"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const prisma_1 = require("../config/prisma");
const router = (0, express_1.Router)();
// Get user profile
router.get('/profile', async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
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
                createdAt: true,
                updatedAt: true
            }
        });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});
// Update user profile
router.put('/profile', (0, express_validator_1.body)('firstName').optional().isString(), (0, express_validator_1.body)('lastName').optional().isString(), (0, express_validator_1.body)('phone').optional().isString(), (0, express_validator_1.body)('email').optional().isEmail(), (0, express_validator_1.body)('address').optional().isString(), (0, express_validator_1.body)('city').optional().isString(), (0, express_validator_1.body)('state').optional().isString(), (0, express_validator_1.body)('pincode').optional().isString(), (0, express_validator_1.body)('income').optional({ checkFalsy: true }).isNumeric(), (0, express_validator_1.body)('occupation').optional().isString(), (0, express_validator_1.body)('education').optional().isString(), (0, express_validator_1.body)('familySize').optional({ checkFalsy: true }).isInt(), (0, express_validator_1.body)('aadharNumber').optional().isString(), (0, express_validator_1.body)('panNumber').optional().isString(), (0, express_validator_1.body)('disability').optional().isString(), (0, express_validator_1.body)('veteranStatus').optional().isString(), async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        // Explicitly extract allowed fields to prevent arbitrary data updates
        const allowedFields = [
            'firstName', 'lastName', 'phone', 'email', 'address', 'city',
            'state', 'pincode', 'aadharNumber', 'panNumber', 'income',
            'occupation', 'education', 'familySize', 'disability', 'veteranStatus'
        ];
        const updateData = {};
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });
        // Normalize email if updated
        if ('email' in updateData && typeof updateData.email === 'string') {
            updateData.email = updateData.email.trim().toLowerCase();
        }
        // Handle numeric conversions for Prisma
        if ('income' in updateData) {
            updateData.income = updateData.income === '' ? null : Number(updateData.income);
        }
        if ('familySize' in updateData) {
            updateData.familySize = updateData.familySize === '' ? null : Number(updateData.familySize);
        }
        const updatedUser = await prisma_1.prisma.user.update({
            where: { id: userId },
            data: updateData
        });
        res.json(updatedUser);
    }
    catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Email is already in use' });
        }
        res.status(500).json({ error: 'Failed to update profile' });
    }
});
// Get user eligibility checks
router.get('/eligibility', async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const eligibilityChecks = await prisma_1.prisma.eligibilityCheck.findMany({
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
            orderBy: { checkedAt: 'desc' }
        });
        const parsed = eligibilityChecks.map((check) => ({
            ...check,
            matchedCriteria: (() => {
                try {
                    return check.matchedCriteria ? JSON.parse(check.matchedCriteria) : [];
                }
                catch {
                    return [];
                }
            })(),
            unmatchedCriteria: (() => {
                try {
                    return check.unmatchedCriteria ? JSON.parse(check.unmatchedCriteria) : [];
                }
                catch {
                    return [];
                }
            })()
        }));
        res.json(parsed);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch eligibility checks' });
    }
});
exports.default = router;
