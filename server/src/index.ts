import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { createPrisma } from './db.js';
import { createGrokClient } from './grok/client.js';
import { createHub } from './guardian/hub.js';
import { startHoldTimeoutJob } from './jobs/holdTimeout.js';
import { loadEnvFiles } from './loadEnv.js';
import { createPaymentService } from './payments/service.js';
import { createPayPalClient } from './paypal/factory.js';
import { seedHousehold } from './seed/household.js';

loadEnvFiles();

const config = loadConfig();
const prisma = createPrisma(config.databaseUrl);
const paypal = createPayPalClient(config);
const grok = createGrokClient({
  apiKey: config.xai.apiKey,
  model: config.xai.model,
  baseUrl: config.xai.baseUrl,
});
const hub = createHub();
const service = createPaymentService({
  prisma,
  paypal,
  grok,
  hub,
  now: () => new Date(),
  holdTimeoutMs: config.holdTimeoutMs,
});

await seedHousehold(prisma);

const app = createApp({
  prisma,
  grok,
  paypal,
  hub,
  holdTimeoutMs: config.holdTimeoutMs,
  service,
});
const stopJob = startHoldTimeoutJob(() => service.voidExpiredHolds(), 30_000);

const server = app.listen(config.port, () => {
  const mode = paypal.mode === 'demo' ? 'demo PayPal' : 'PayPal sandbox';
  console.log(`AEGIS server listening on ${config.port} (${mode})`);
});

async function shutdown(): Promise<void> {
  stopJob();
  server.close();
  await prisma.$disconnect();
}

process.on('SIGINT', () => {
  void shutdown();
});
process.on('SIGTERM', () => {
  void shutdown();
});
