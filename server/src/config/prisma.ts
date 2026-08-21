import { PrismaClient } from '@prisma/client';

const dbUrl = process.env.DATABASE_URL;

const prisma = new PrismaClient(
  dbUrl
    ? { datasources: { db: { url: dbUrl } } }
    : undefined
);

export { prisma };
