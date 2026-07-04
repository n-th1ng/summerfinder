import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

function makeClient() {
  try {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL not set');

    // For file: URLs (local dev / CLI), use standard Prisma
    if (url.startsWith('file:')) {
      return new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      });
    }

    // For libsql:// URLs (Turso), use the driver adapter
    const { PrismaLibSQL } = require('@prisma/adapter-libsql');
    const { createClient } = require('@libsql/client');

    const libsql = createClient({
      url,
      authToken: url.includes('authToken=') ? url.split('authToken=')[1] : undefined,
    });

    const adapter = new PrismaLibSQL(libsql);
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  } catch {
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
