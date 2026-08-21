"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLog = void 0;
const prisma_1 = require("../config/prisma");
const auditLog = async (input) => {
    const { actorId, action, entityType, entityId, metadata } = input;
    try {
        await prisma_1.prisma.auditLog.create({
            data: {
                actorId: actorId || null,
                action,
                entityType,
                entityId: entityId || null,
                metadata: metadata ? JSON.stringify(metadata) : null
            }
        });
    }
    catch (error) {
        // Avoid breaking main flow if audit fails
        console.error('Audit log failed', error);
    }
};
exports.auditLog = auditLog;
