"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const integrations_1 = require("../services/integrations");
const prisma_1 = require("../config/prisma");
const router = (0, express_1.Router)();
// Mock status tracking integration
router.post('/status', async (req, res) => {
    const { applicationId } = req.body || {};
    if (!applicationId) {
        return res.status(400).json({ error: 'applicationId is required' });
    }
    const result = await integrations_1.integrationProvider.getStatus({ applicationId });
    // Store status updates
    for (const entry of result.history || []) {
        await prisma_1.prisma.applicationStatusUpdate.create({
            data: {
                applicationId,
                status: entry.status,
                source: entry.source || result.source || 'unknown',
                details: entry.details || null,
                createdAt: new Date(entry.at)
            }
        });
    }
    // Update current application status if known
    if (result.currentStatus) {
        await prisma_1.prisma.application.update({
            where: { id: applicationId },
            data: { status: result.currentStatus }
        });
    }
    res.json(result);
});
// Mock identity verification
router.post('/verify/aadhaar', async (req, res) => {
    const result = await integrations_1.integrationProvider.verifyAadhaar(req.body || {});
    res.json(result);
});
router.post('/verify/pan', async (req, res) => {
    const result = await integrations_1.integrationProvider.verifyPan(req.body || {});
    res.json(result);
});
router.post('/verify/bank', async (req, res) => {
    const result = await integrations_1.integrationProvider.verifyBank(req.body || {});
    res.json(result);
});
exports.default = router;
