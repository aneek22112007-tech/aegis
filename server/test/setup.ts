import path from 'node:path';

process.env.DATABASE_URL ??= `file:${path.resolve(import.meta.dirname, '../prisma/test.db')}`;
process.env.PAYPAL_ENV ??= 'sandbox';
process.env.XAI_API_KEY ??= '';
