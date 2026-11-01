import path from 'node:path';
import { PrismaClient } from '@prisma/client';

export function resolveSqliteUrl(databaseUrl: string): string {
  if (!databaseUrl.startsWith('file:')) return databaseUrl;
  const spec = databaseUrl.slice('file:'.length);
  if (path.isAbsolute(spec)) return databaseUrl;
  const relative = spec.replace(/^\.\//, '');
  const absolute = path.resolve(import.meta.dirname, '../prisma', relative);
  return `file:${absolute}`;
}

export function createPrisma(databaseUrl: string): PrismaClient {
  return new PrismaClient({
    datasources: { db: { url: resolveSqliteUrl(databaseUrl) } },
  });
}
