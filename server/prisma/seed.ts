import { loadConfig } from '../src/config.js';
import { createPrisma } from '../src/db.js';
import { loadEnvFiles } from '../src/loadEnv.js';
import { seedHousehold } from '../src/seed/household.js';

loadEnvFiles();

const config = loadConfig();
const prisma = createPrisma(config.databaseUrl);

await seedHousehold(prisma);
await prisma.$disconnect();
