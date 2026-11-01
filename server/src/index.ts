import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { createPrisma } from './db.js';
import { loadEnvFiles } from './loadEnv.js';
import { seedHousehold } from './seed/household.js';

loadEnvFiles();

const config = loadConfig();
const prisma = createPrisma(config.databaseUrl);

await seedHousehold(prisma);

const app = createApp();
const server = app.listen(config.port, () => {
  console.log(`AEGIS server listening on ${config.port}`);
});

async function shutdown(): Promise<void> {
  server.close();
  await prisma.$disconnect();
}

process.on('SIGINT', () => {
  void shutdown();
});
process.on('SIGTERM', () => {
  void shutdown();
});
