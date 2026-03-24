import { prisma } from '../config/prisma';

type AuditInput = {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: any;
};

export const auditLog = async (input: AuditInput) => {
  const { actorId, action, entityType, entityId, metadata } = input;
  try {
    await prisma.auditLog.create({
      data: {
        actorId: actorId || null,
        action,
        entityType,
        entityId: entityId || null,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    });
  } catch (error) {
    // Avoid breaking main flow if audit fails
    console.error('Audit log failed', error);
  }
};
