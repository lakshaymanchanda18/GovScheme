import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Ensure environment variables are loaded (supporting standalone scripts/tests)
dotenv.config({ path: path.join(__dirname, '../../.env') });

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:../prisma/dev.db'
    }
  }
});

export { prisma };
