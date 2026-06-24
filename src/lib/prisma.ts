import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

function makeClient() {
  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  } catch {
    // Binary missing or DATABASE_URL missing — return a proxy that throws on use.
    // Pages wrap calls in try/catch, so this lets the UI render gracefully.
    return new Proxy({} as PrismaClient, {
      get() {
        return () => {
          throw new Error('Database is not configured.');
        };
      },
    });
  }
}

export const prisma = globalForPrisma.prisma ?? makeClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;