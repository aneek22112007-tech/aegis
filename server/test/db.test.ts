import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { resolveSqliteUrl } from '../src/db.js';

describe('resolveSqliteUrl', () => {
  it('resolves a relative sqlite file next to the Prisma schema', () => {
    const resolved = resolveSqliteUrl('file:./dev.db');
    expect(resolved).toBe(`file:${path.resolve(import.meta.dirname, '../prisma/dev.db')}`);
  });

  it('leaves an absolute sqlite file untouched', () => {
    expect(resolveSqliteUrl('file:/tmp/aegis.db')).toBe('file:/tmp/aegis.db');
  });
});
