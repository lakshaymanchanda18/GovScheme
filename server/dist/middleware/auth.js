"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.authenticateToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const prisma_1 = require("../config/prisma");
const authenticateToken = (req, res, next) => {
    // Read token from HTTP-Only cookie first, fall back to Authorization header
    let token = req.cookies?.token;
    if (!token) {
        const authHeader = req.headers['authorization'];
        token = authHeader && authHeader.split(' ')[1];
    }
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    (0, jsonwebtoken_1.verify)(token, process.env.JWT_SECRET || 'default-secret', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};
exports.authenticateToken = authenticateToken;
const requireAdmin = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, isActive: true }
        });
        if (!user || !user.isActive || user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        next();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to authorize admin' });
    }
};
exports.requireAdmin = requireAdmin;
