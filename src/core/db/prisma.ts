/**
 * Prisma Client
 * Singleton pattern for database connection
 * 
 * For Neon serverless on Vercel:
 * - Use pooled connection string (DATABASE_URL with -pooler suffix)
 * - Direct connection (DIRECT_URL) for migrations only
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
