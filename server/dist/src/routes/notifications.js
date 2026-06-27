"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../config/prisma");
const router = (0, express_1.Router)();
// Get user notifications
router.get('/', async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const notifications = await prisma_1.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(notifications);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});
// Mark notification as read
router.put('/:id/read', async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const notification = await prisma_1.prisma.notification.update({
            where: { id: req.params.id },
            data: { isRead: true }
        });
        res.json(notification);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
});
// Get unread notification count
router.get('/unread-count', async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const count = await prisma_1.prisma.notification.count({
            where: { userId, isRead: false }
        });
        res.json({ unreadCount: count });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch unread count' });
    }
});
exports.default = router;
