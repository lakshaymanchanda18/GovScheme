import { PrismaClient } from '@prisma/client';

const dbUrl = process.env.DATABASE_URL;

let prisma: PrismaClient;

try {
  prisma = new PrismaClient(
    dbUrl
      ? { datasources: { db: { url: dbUrl } } }
      : undefined
  );
} catch (error) {
  console.error('[PRISMA] Failed to initialize PrismaClient:', error);
  prisma = new Proxy({} as PrismaClient, {
    get(_target, prop) {
      if (prop === '$connect' || prop === '$disconnect') {
        return async () => {};
      }
      return new Proxy({}, {
        get() {
          return async () => {
            throw new Error('Database is not initialized. Please configure DATABASE_URL in environment variables.');
          };
        }
      });
    }
  });
}

export { prisma };
