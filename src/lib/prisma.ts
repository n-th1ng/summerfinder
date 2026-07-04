import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

function makeClient() {
  const url = process.env.DATABASE_URL;
  if (!url || !url.startsWith('file:')) {
    return new Proxy({} as PrismaClient, {
      get() {
        return () => {
          throw new Error('Database is not configured. Use @lib/turso for live DB.');
        };
      },
    });
  }
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? makeClient();

if (process.env.NODE_ENV !== 'production') (globalForPrisma as any).prisma = prisma;
