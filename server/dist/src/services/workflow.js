"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transitionApplicationStatus = void 0;
const prisma_1 = require("../config/prisma");
const audit_1 = require("./audit");
const email_1 = require("./email");
const allowedTransitions = {
    PENDING: ['REVIEWED', 'APPROVED', 'REJECTED'],
    REVIEWED: ['APPROVED', 'REJECTED'],
    APPROVED: [],
    REJECTED: []
};
const transitionApplicationStatus = async (params) => {
    const { applicationId, newStatus, actorId, rejectionReason } = params;
    const application = await prisma_1.prisma.application.findUnique({
        where: { id: applicationId },
        include: {
            user: { select: { id: true, email: true, firstName: true } },
            scheme: { select: { name: true } }
        }
    });
    if (!application) {
        throw new Error('Application not found');
    }
    const current = application.status;
    const allowed = allowedTransitions[current] || [];
    if (!allowed.includes(newStatus)) {
        throw new Error(`Invalid status transition from ${current} to ${newStatus}`);
    }
    const updates = {
        status: newStatus,
        reviewedAt: new Date()
    };
    if (newStatus === 'APPROVED') {
        updates.approvedAt = new Date();
        updates.rejectedAt = null;
        updates.rejectionReason = null;
    }
    if (newStatus === 'REJECTED') {
        updates.rejectedAt = new Date();
        updates.rejectionReason = rejectionReason || 'Not eligible';
    }
    const updated = await prisma_1.prisma.application.update({
        where: { id: applicationId },
        data: updates,
        include: {
            user: { select: { id: true, email: true, firstName: true } },
            scheme: { select: { name: true } }
        }
    });
    await prisma_1.prisma.notification.create({
        data: {
            userId: updated.userId,
            title: 'Application status updated',
            message: `Your application for ${updated.scheme.name} was ${newStatus.toLowerCase()}.`,
            type: newStatus === 'APPROVED' ? 'SUCCESS' : newStatus === 'REJECTED' ? 'ERROR' : 'INFO'
        }
    });
    if (updated.user?.email) {
        await (0, email_1.sendEmail)(updated.user.email, 'Application status update', `Hello ${updated.user.firstName || ''}, your application for ${updated.scheme.name} was ${newStatus.toLowerCase()}.`);
    }
    await (0, audit_1.auditLog)({
        actorId,
        action: 'APPLICATION_STATUS_CHANGE',
        entityType: 'Application',
        entityId: updated.id,
        metadata: { from: current, to: newStatus }
    });
    return updated;
};
exports.transitionApplicationStatus = transitionApplicationStatus;
